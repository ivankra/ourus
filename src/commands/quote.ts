// A quote read as an atom (`quotes: atom`, as Logseq, Tine, Roam, Athens and Dynalist hold one: a
// block's text): its lines as written, `>` included, edited as characters. What the keys do with it
// where they don't do what they do in any atom: Enter splits it, the rest a node of its own after it;
// Shift-Enter and plain paste put in lines of the quote; Backspace at its start and Delete before it
// join it to the text above as it is written.

import { OurusAtom, OurusProse, type OurusNode } from '../doc/index.ts';
import { MdTree } from '../parser/index.ts';
import { isSpaceOrTab, trimMd } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';

/** Where the caret, or a selection in one text, is in a quote read as an atom; null elsewhere. */
export interface QuoteAt {
  readonly node: OurusNode;
  readonly text: OurusAtom;
  readonly offset: number;
  readonly to: number;
}

export function quoteAtomAt(ctx: CommandContext): QuoteAt | null {
  const a = ctx.from;
  const b = ctx.to;
  if (a.zone !== 'text' || b.zone !== 'text' || !(a.text instanceof OurusAtom) || a.text.type !== 'blockquote' || a.node.persistentNode !== b.node.persistentNode) return null;
  return { node: a.node, text: a.text, offset: a.offset, to: b.offset };
}

/** A quote atom's text as a paragraph's, its `>`s characters of it: what a join puts into the text above. */
export function quoteAsProse(text: OurusAtom): OurusProse {
  return new OurusProse('paragraph', text.item, text.text, text.marks);
}

/**
 * Enter in a quote read as an atom, as `enterInQuote` says: `line`, a line of it (`lineInQuote`);
 * `split`, it splits (`splitQuote`).
 */
export function enterInQuote(ctx: CommandContext, at: QuoteAt): CommandOutcome {
  // a selection from inside a line's `>`, part of the quote's markup: the host's where markup is text
  // the user edits, else refused, as over any selection taking part of markup
  if (!ctx.collapsed) {
    const s = at.text.text;
    const lineStart = s.lastIndexOf('\n', at.offset - 1) + 1;
    const mark = /^ {0,3}>/.exec(s.slice(lineStart))?.[0].length ?? 0;
    if (at.offset < lineStart + mark) return ctx.config.markup === 'text' ? deferToHost('the selection takes part of markup') : reject('not-expressible', 'the selection takes part of markup');
  }
  return ctx.config.enterInQuote === 'line' ? lineInQuote(ctx, at) : splitQuote(ctx, at);
}

/**
 * `enterInQuote: line` (the text editors'): a line of the quote at the caret, its `> ` written, and a
 * quoted list's item's marker after it (a number counted on: `> - `, `> 2. `); on an empty item, its
 * marker goes; on an empty last line, it leaves the quote, the line going, an empty paragraph after
 * it (an item after an item); on a quote of one empty line, the quote goes, its node an empty
 * paragraph (an empty item). Before its `>`, with `enterAtTextStart: stay`, a blank line above it, the
 * caret staying; else an empty node above (rule 6).
 */
function lineInQuote(ctx: CommandContext, at: QuoteAt): CommandOutcome {
  const { node, text, offset, to } = at;
  const s = text.text;
  const item = node.kind === 'item';
  const draft = ctx.draft();
  if (offset === 0 && to === 0) {
    const above = node.preceding;
    if (ctx.config.enterAtTextStart === 'stay' && above) {
      if (above.kind === 'root') draft.leadingBlankLines((ctx.doc.leadingBlankLines ?? 0) + 1);
      else draft.gap(above, above.gap + 1);
      return ctx.apply(draft.setCaret(node, 0, -1));
    }
    return splitQuote(ctx, at);
  }
  const lineStart = s.lastIndexOf('\n', offset - 1) + 1;
  const lineEnd = s.indexOf('\n', to) < 0 ? s.length : s.indexOf('\n', to);
  const line = s.slice(lineStart, lineEnd);
  const mark = /^ {0,3}>[ \t]?/.exec(line)?.[0] ?? '';
  const list = mark ? /^([ \t]*)(?:([-*+])|(\d{1,9})([.)]))([ \t]+|$)/.exec(line.slice(mark.length)) : null;
  const prefix = mark.length + (list ? list[0].length : 0);
  if (ctx.collapsed && offset >= lineStart + prefix && trimMd(line.slice(prefix)) === '') {
    // an empty item: its marker goes
    if (list) return ctx.apply(draft.setText(node, text.splice(lineStart + mark.length, lineEnd)).setCaret(node, lineStart + mark.length, -1));
    // a quote of one empty line: the quote goes
    if (lineStart === 0 && lineEnd === s.length) {
      if (!item) draft.convert(node, 'paragraph');
      return ctx.apply(draft.setText(node, new OurusProse('paragraph', item, '')).setCaret(node, 0, -1));
    }
    // its empty last line: it leaves the quote
    if (lineEnd === s.length) {
      const id = draft.create(item ? 'item' : 'paragraph', new OurusProse('paragraph', item, ''));
      draft.setText(node, text.splice(lineStart - 1, s.length)).place('after', node, [id]);
      if (!item) draft.gap(id, node.gap).gap(node, Math.max(1, node.gap));
      return ctx.apply(draft.setCaret(id, 0, -1));
    }
  }
  // (a quoted item's marker after the `> `, a number counted on)
  const marker = !list ? '' : list[1]! + (list[2] ?? `${Number(list[3]) + 1}${list[4]}`) + ' ';
  const inserted = `\n${mark || '> '}${marker}`;
  return ctx.apply(draft.setText(node, text.splice(offset, to, inserted)).setCaret(node, offset + inserted.length, -1));
}

/**
 * `enterInQuote: split` (the outliners'): at its start, before its `>`, an empty node above it (rule 6);
 * else it splits at the caret, the spaces there going, the rest of its line a paragraph after it (an
 * item after an item: its first child where it has children and `enterMidItem: child` says so, or at
 * its end; else its next sibling, taking them), an empty one at its end; its lines after the caret's
 * a quote of their own after the rest, as written (the new item's first child), as an outliner's new
 * block holds them after its first line.
 */
function splitQuote(ctx: CommandContext, at: QuoteAt): CommandOutcome {
  const { node, text, offset, to } = at;
  const s = text.text;
  const item = node.kind === 'item';
  const kind = item ? 'item' : 'paragraph';
  const draft = ctx.draft();
  if (offset === 0 && to === 0) {
    const id = draft.create(kind, new OurusProse('paragraph', item, ''));
    return ctx.apply(draft.place('before', node, [id]).setCaret(id, 0, -1));
  }
  const lineEnd = s.indexOf('\n', to) < 0 ? s.length : s.indexOf('\n', to);
  let a = offset;
  while (a > 0 && isSpaceOrTab(s.charCodeAt(a - 1))) a--;
  // (at a line's start, the line break before it goes too: no empty last line)
  if (a > 0 && s[a - 1] === '\n') a--;
  let b = to;
  while (b < lineEnd && isSpaceOrTab(s.charCodeAt(b))) b++;
  draft.setText(node, text.splice(a, s.length));
  const id = draft.create(kind, new OurusProse('paragraph', item, s.slice(b, lineEnd)));
  const children = [...node.children];
  if (item && children.length && (ctx.config.enterMidItem === 'child' || b === s.length)) draft.append(node, 'first', [id]);
  else {
    draft.place('after', node, [id]);
    if (item && children.length) draft.remove(children).append(id, 'last', children);
    // (a paragraph right after the quote would continue it: a blank line between)
    if (!item) draft.gap(id, node.gap).gap(node, Math.max(1, node.gap));
  }
  if (lineEnd < s.length) {
    // (a lazy line first: its `> `, which a quote's first line needs)
    const lines = s.slice(lineEnd + 1);
    const rest = draft.create('atom', new OurusAtom('blockquote', false, /^ {0,3}>/.test(lines) ? lines : `> ${lines}`));
    if (item) draft.append(id, 'first', [rest]);
    else draft.place('after', id, [rest]);
  }
  return ctx.apply(draft.setCaret(id, 0, -1));
}

/**
 * A line break inside a quote read as an atom taken back: Delete at a line's end (the next line joins
 * as it is written, its `>` text), Backspace at a later line's start (the line joins the one above, its
 * `> ` going with the break) or on an empty one right after its `> `. Null elsewhere: past a line's
 * `> ` with text after it, the host deletes a character, as the apps do.
 */
export function joinLineInQuote(ctx: CommandContext, at: QuoteAt, forward: boolean): CommandOutcome | null {
  const { node, text, offset, to } = at;
  if (offset !== to) return null;
  const s = text.text;
  if (forward) {
    if (s[offset] !== '\n') return null;
    return ctx.apply(ctx.draft().setText(node, text.splice(offset, offset + 1)).setCaret(node, offset, -1));
  }
  const start = s.lastIndexOf('\n', offset - 1) + 1;
  const end = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  if (start === 0) return null;
  // at a line's start it joins the line above, its `> ` going with the break (as the apps' blocks hold
  // the line, lazy: Fence43); on an empty line right after its `> `, the line goes
  const mark = /^ {0,3}>[ \t]?/.exec(s.slice(start, end))?.[0].length ?? 0;
  if (offset === start) return ctx.apply(ctx.draft().setText(node, text.splice(start - 1, start + mark)).setCaret(node, start - 1, -1));
  if (offset !== start + mark || !mark || trimMd(s.slice(offset, end)) !== '') return null;
  return ctx.apply(ctx.draft().setText(node, text.splice(start - 1, offset)).setCaret(node, start - 1, -1));
}

/**
 * Shift-Enter in a quote read as an atom: a line break, its new line lazy where it can be, as the
 * apps' blocks hold it (`> a⏎b`), else after a `> `: where the parser reads the quote with the line
 * lazy as one quote still, over every line; not an empty one, nor after an emptied quoted line
 * (`> ⏎b`: the quote's paragraph ended), nor one that would start a block out of the quote (a list's
 * marker, a heading, a fence, HTML, a thematic break).
 */
export function breakInQuote(ctx: CommandContext, at: QuoteAt): CommandOutcome {
  const { text, offset, to } = at;
  const s = text.text;
  const rest = s.slice(to, s.indexOf('\n', to) < 0 ? s.length : s.indexOf('\n', to));
  const lazy = trimMd(rest) !== '' && oneQuote(ctx, text.splice(offset, to, '\n').text);
  return linesInQuote(ctx, at, ['', ''], lazy);
}

/** Whether `quote`'s lines read as one quote, every line in it: a lazy line in it continues it. */
function oneQuote(ctx: CommandContext, quote: string): boolean {
  const root = MdTree.parse(quote, ctx.doc.mdTree.flavor).root;
  const block = root.children[0];
  return root.children.length === 1 && block?.type === 'blockquote' && root.offsets[0] === 0 && block.lines === quote.split('\n').length;
}

/** Lines put into a quote read as an atom at the caret (Shift-Enter's empty one, plain paste's), each after a `>`, as the quote's. */
export function linesInQuote(ctx: CommandContext, at: QuoteAt, lines: readonly string[], lazy = false): CommandOutcome {
  const { node, text, offset, to } = at;
  const inserted = lines.map((l, k) => (k === 0 || lazy ? l : `> ${l}`)).join('\n');
  return ctx.apply(ctx.draft().setText(node, text.splice(offset, to, inserted)).setCaret(node, offset + inserted.length, -1));
}

/**
 * A quote read as an atom joining the text above it (Backspace at its start, Delete before it), as it
 * is written, its `>`s characters of that text, the caret at the seam; its children go to that node
 * (its last, where it is an item), else where it was. Null where nothing with a text is above it.
 */
export function joinQuoteUp(ctx: CommandContext, node: OurusNode, text: OurusAtom): CommandOutcome {
  const above = node.preceding;
  if (!above || above.kind === 'root') return null;
  const upper = ctx.doc.textOf(above);
  if (!(upper instanceof OurusProse)) return null;
  const draft = ctx.draft().setText(above, upper.concat(quoteAsProse(text).asItem(upper.item)));
  const children = [...node.children];
  if (children.length) {
    draft.remove(children);
    if (above.kind === 'item') draft.append(above, 'last', children);
    else draft.place('before', node, children);
  }
  return ctx.apply(draft.remove([node]).setCaret(above, upper.text.length, -1));
}

/**
 * The text of `node` joining the quote read as an atom above it (`above`, its text `quote`): Backspace
 * at the node's start, Delete at the quote's end. Its characters go on the quote's last line as they
 * are written, the caret at the seam; its children go to the quote's node where it is an item, else
 * where it was. Null for a node with no text, or code.
 */
export function joinIntoQuote(ctx: CommandContext, above: OurusNode, quote: OurusAtom, node: OurusNode): CommandOutcome {
  const lower = ctx.doc.textOf(node);
  if (!(lower instanceof OurusProse)) return null;
  const at = quote.text.length;
  const draft = ctx.draft().setText(above, quote.splice(at, at, lower.text));
  const children = [...node.children];
  if (children.length) {
    draft.remove(children);
    if (above.kind === 'item') draft.append(above, 'last', children);
    else draft.place('before', node, children);
  }
  return ctx.apply(draft.remove([node]).setCaret(above, at, -1));
}
