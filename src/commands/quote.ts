// A quote read as an atom (`quotes: atom`, as Logseq, Tine, Roam, Athens and Dynalist hold one: a
// block's text): its lines as written, `>` included, edited as characters. What the keys do with it
// where they don't do what they do in any atom: Enter splits it, the rest a node of its own after it;
// Shift-Enter and plain paste put in lines of the quote; Backspace at its start and Delete before it
// join it to the text above as it is written.

import { OurusAtom, OurusProse, blockIdsOf, closingFrameStart, withoutBlockIds, type OurusNode } from '../doc/index.ts';
import { MdTree } from '../parser/index.ts';
import { advanceColumns, isSpaceOrTab, trimMd } from '../text/index.ts';
import { type CommandContext } from './context.ts';
import { childrenRefused, visiblePreceding } from './util.ts';
import type { OurusResult } from './types.ts';
import { OurusDeferred, OurusRejected } from './types.ts';
import { withFolds } from './view.ts';

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
  return new OurusProse('paragraph', text.item, text.marks, null, text.blockIdLines);
}

/**
 * Enter in a quote read as an atom, as `enterInQuote` says: `line`, a line of it (`lineInQuote`);
 * `split`, it splits (`splitQuote`).
 */
export function enterInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  // a selection from inside a line's `>`, part of the quote's markup: the host's where markup is text
  // the user edits, else refused, as over any selection taking part of markup
  if (!ctx.collapsed) {
    const s = at.text.text;
    const lineStart = s.lastIndexOf('\n', at.offset - 1) + 1;
    const mark = /^ {0,3}>/.exec(s.slice(lineStart))?.[0].length ?? 0;
    if (at.offset < lineStart + mark) return ctx.config.markup === 'text' ? new OurusDeferred('the selection takes part of markup') : new OurusRejected('not-expressible', 'the selection takes part of markup');
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
function lineInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  const { node, text, offset, to } = at;
  const s = text.text;
  const item = node.kind === 'item';
  const draft = ctx.draft();
  // (before its first `>`, past the spaces it may be indented by: its start, B65)
  const lead = /^ {0,3}(?=>)/.exec(s)?.[0].length ?? 0;
  if (offset <= lead && to <= lead) {
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
  const list = mark ? QUOTED_ITEM.exec(line.slice(mark.length)) : null;
  const prefix = mark.length + (list ? list[0].length : 0);
  if (ctx.collapsed && offset >= lineStart + prefix && trimMd(line.slice(prefix)) === '') {
    // an empty item, a task's checkbox alone too: nested, it is its parent's sibling (Obsidian's and
    // SilverBullet's); else its marker goes
    const parent = list ? parentItemLine(s, lineStart, advanceColumns(line, 0, mark.length + list[1]!.length, 0)) : null;
    if (parent) {
      const outer = parent.prefix + (parent.item[2] ?? `${Number(parent.item[3]) + 1}${parent.item[4]}`) + ' ';
      return ctx.apply(draft.setText(node, text.splice(lineStart, lineEnd, outer)).setCaret(node, lineStart + outer.length, -1));
    }
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
  // (a quoted item's marker after the `> `, a number counted on; a task's, an unchecked box after it,
  // as a task's new item is, `enterTask`)
  const box = list?.[6] && ctx.config.enterTask === 'continue' ? '[ ] ' : '';
  const marker = !list ? '' : list[1]! + (list[2] ?? `${Number(list[3]) + 1}${list[4]}`) + ' ' + box;
  const inserted = `\n${mark || '> '}${marker}`;
  // (the numbers after it in its list counted on, one up each, as Obsidian and SilverBullet do: B66)
  const renumbered = list?.[3] ? renumberedAfter(text, lineEnd, list[1]!, Number(list[3]), list[4]!) : text;
  return ctx.apply(draft.setText(node, renumbered.splice(offset, to, inserted)).setCaret(node, offset + inserted.length, -1));
}

/**
 * Quote text `text` with the numbered items after `from` in the list of the item numbered `number`
 * (its indentation `indent`, its delimiter `delimiter`), while they count on from it, each one up: an
 * item inserted after it. Lines nested deeper, or continuing an item, are passed over; another
 * list's item, or a line out of the quote, ends it.
 */
function renumberedAfter<T extends { readonly text: string; splice(from: number, to: number, insert: string): T }>(text: T, from: number, indent: string, number: number, delimiter: string): T {
  const s = text.text;
  const edits: [number, number, string][] = [];
  let last = number;
  for (let start = from + 1; from < s.length && start <= s.length; ) {
    const end = s.indexOf('\n', start) < 0 ? s.length : s.indexOf('\n', start);
    const line = s.slice(start, end);
    const mark = /^ {0,3}>[ \t]?/.exec(line)?.[0];
    if (mark === undefined) break;
    const item = QUOTED_ITEM.exec(line.slice(mark.length));
    if (item) {
      if (item[1]!.length < indent.length) break;
      if (item[1] === indent) {
        if (!item[3] || item[4] !== delimiter || Number(item[3]) !== last + 1) break;
        last = Number(item[3]);
        const at = start + mark.length + indent.length;
        edits.push([at, at + item[3].length, String(last + 1)]);
      }
    }
    start = end + 1;
  }
  return edits.reduceRight((t, [a, b, n]) => t.splice(a, b, n), text);
}

/** A quoted line's list marker, past its `>`: its indentation, bullet or number and delimiter, the spaces after it, and a task's checkbox with those after it. */
const QUOTED_ITEM = /^([ \t]*)(?:([-*+])|(\d{1,9})([.)]))([ \t]+|$)(\[[ xX]\](?:[ \t]+|$))?/;

/**
 * The nearest line above `lineStart` in quote text `s` whose list marker is at a column short of
 * `column` (its line's, tabs spanning to their stops): that marker's parts, as `QUOTED_ITEM` reads
 * them, and what is before it on its line (its `>`, its indentation).
 */
function parentItemLine(s: string, lineStart: number, column: number): { readonly item: RegExpExecArray; readonly prefix: string } | null {
  for (let end = lineStart - 1; end > 0; ) {
    const start = s.lastIndexOf('\n', end - 1) + 1;
    const line = s.slice(start, end);
    const mark = /^ {0,3}>[ \t]?/.exec(line)?.[0] ?? '';
    const item = mark ? QUOTED_ITEM.exec(line.slice(mark.length)) : null;
    if (item && advanceColumns(line, 0, mark.length + item[1]!.length, 0) < column) return { item, prefix: line.slice(0, mark.length + item[1]!.length) };
    end = start - 1;
  }
  return null;
}

/**
 * `enterInQuote: split` (the outliners'): at its start, before its `>`, an empty node above it (rule 6);
 * else it splits at the caret, the spaces there going, the rest of its line a paragraph after it (an
 * item after an item: its first child where it has children and `enterMidItem: child` says so, or at
 * its end; else its next sibling, taking them), an empty one at its end; its lines after the caret's
 * a quote of their own after the rest, as written (the new item's first child), as an outliner's new
 * block holds them after its first line.
 */
function splitQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  const { node, text, offset, to } = at;
  const s = text.text;
  const item = node.kind === 'item';
  const kind = item ? 'item' : 'paragraph';
  const draft = ctx.draft();
  const lead = /^ {0,3}(?=>)/.exec(s)?.[0].length ?? 0;
  if (offset <= lead && to <= lead) {
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
  // folded (within the zoom), the new item goes after its subtree, its hidden children staying, where
  // it would be the first child; split with them following, the fold goes with them; zoomed into it,
  // a first child, inside the zoom (as a text's Enter: enter.ts)
  const folded = item && children.length > 0 && ctx.view.zoomFolded.has(node.id);
  const first = ctx.config.enterMidItem === 'child' || b === s.length;
  let refold = false;
  if (item && ctx.view.zoom === node.id) draft.append(node, 'first', [id]);
  else if (item && children.length && first && !folded) draft.append(node, 'first', [id]);
  else {
    draft.place('after', node, [id]);
    if (item && children.length && !(folded && first)) {
      draft.remove(children).append(id, 'last', children);
      refold = folded;
    }
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
  return withFolds(ctx.apply(draft.setCaret(id, 0, -1)), refold ? [id] : []);
}

/**
 * A line break inside a quote read as an atom taken back: Delete at a line's end (the next line joins
 * as it is written, its `>` text), Backspace at a later line's start (the line joins the one above, its
 * `> ` going with the break) or on an empty one right after its `> `. Null elsewhere: past a line's
 * `> ` with text after it, the host deletes a character, as the apps do.
 */
export function joinLineInQuote(ctx: CommandContext, at: QuoteAt, forward: boolean): OurusResult | null {
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
export function breakInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
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
export function linesInQuote(ctx: CommandContext, at: QuoteAt, lines: readonly string[], lazy = false): OurusResult | null {
  const { node, text, offset, to } = at;
  const put = (prefix: string): OurusResult | null => {
    const inserted = lines.map((l, k) => (k === 0 || lazy ? l : `${prefix}${l}`)).join('\n');
    return ctx.apply(ctx.draft().setText(node, text.splice(offset, to, inserted)).setCaret(node, offset + inserted.length, -1));
  };
  // (the caret's line's prefix in the quote, its nested quotes' `>`s and its items' markers as spaces,
  // so the new line is in what the caret's is in: B58; where that doesn't write, the quote's `> `)
  const s = text.text;
  const line = s.slice(s.lastIndexOf('\n', offset - 1) + 1, offset);
  const raw = /^(?: {0,3}>[ \t]?|[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+)*/.exec(line)![0];
  const nested = raw.replace(/[-*+]|\d{1,9}[.)]/g, (m) => ' '.repeat(m.length));
  // (a lazy line, no `>` of its own, or the quote's `> ` alone: `> `; so too a prefix with a tab but a
  // `>`'s own, or a `>` with no blank after it, whose columns a new line wouldn't keep as written)
  if (lazy || !/^ {0,3}>/.test(nested) || /^ {0,3}>[ \t]?$/.test(nested) || /(?<!>)\t|>(?=[^ \t>])/.test(raw)) return put('> ');
  const deep = put(nested.endsWith('>') ? `${nested} ` : nested);
  return deep instanceof OurusRejected ? put('> ') : deep;
}

/** `text` without the markup before and after its words that is its node's: a task's checkbox, a heading's `#`s, closing `#`s or underline. */
function withoutOwnMarkup(text: OurusProse): OurusProse {
  let out = text;
  for (const p of [...text.frame].filter((p) => p.part === 'task' || p.part === 'heading' || p.part === 'close' || p.part === 'underline').sort((a, b) => b.from - a.from)) out = out.splice(p.from, p.to);
  return out;
}

/**
 * A quote read as an atom joining the text above it (Backspace at its start, Delete before it), as it
 * is written, its `>`s characters of that text, the caret at the seam; its children go to that node
 * (its last, where it is an item), else where it was. Null where nothing with a text is above it.
 */
export function joinQuoteUp(ctx: CommandContext, node: OurusNode, text: OurusAtom): OurusResult | null {
  // (after a folded node, its row: Fold15)
  const above = visiblePreceding(ctx.view, node);
  if (!above || above.kind === 'root') return null;
  const upper = ctx.doc.textOf(above);
  if (!(upper instanceof OurusProse)) return null;
  // (an ATX title holds one line, as a prose join refuses it: Backspace's)
  if (upper.heading?.form === 'atx' && text.text.includes('\n')) return new OurusRejected('not-expressible', 'an ATX title is a single line');
  // (its children after the item's above, or lifted where it is their parent: as `joinWithChildren` has it)
  const refused = childrenRefused(ctx, above, node, above.kind === 'item' && above !== node.parent);
  if (refused) return refused;
  const draft = ctx.draft();
  // (its block ids as a join takes them: moved to the text above, or merged into its; the quote's
  // characters before that text's closing frame, which ends it still)
  const moved = draft.joinBlockIds(above, upper, node, text);
  const quote = quoteAsProse(moved ? text : (withoutBlockIds(text) as OurusAtom)).asItem(upper.item);
  const end = closingFrameStart(upper);
  draft.setText(above, upper.splice(end, end, quote).withBlockIdLines(moved && quote.blockIdLines.length ? quote.blockIdLines : upper.blockIdLines));
  const children = [...node.children];
  if (children.length) {
    draft.remove(children);
    if (above.kind === 'item') draft.append(above, 'last', children);
    else draft.place('before', node, children);
  }
  // (the caret at the seam: before the closing frame the quote's characters went in front of)
  return ctx.apply(draft.remove([node]).setCaret(above, end, -1));
}

/**
 * The text of `node` joining the quote read as an atom above it (`above`, its text `quote`): Backspace
 * at the node's start, Delete at the quote's end. Its characters go on the quote's last line as they
 * are written, the caret at the seam; its children go to the quote's node where it is an item, else
 * where it was. Null for a node with no text, or code.
 */
export function joinIntoQuote(ctx: CommandContext, above: OurusNode, quote: OurusAtom, node: OurusNode): OurusResult | null {
  const read = ctx.doc.textOf(node);
  if (!(read instanceof OurusProse)) return null;
  // (before the block id that ends the quote, which ends it still)
  // (a quote's `^x` a block id only in a flavor that has them: elsewhere text, B33)
  const end = ctx.doc.mdTree.flavor.has('blockIds') ? blockIdsOf(quote).find((b) => !b.carried && b.partTo === quote.text.length) : undefined;
  const at = end && !end.carried ? end.partFrom : quote.text.length;
  const draft = ctx.draft();
  // (its own markup goes with it, a task's checkbox, a heading's marks: its text joins, as a prose
  // join takes it; an empty one, a task's checkbox alone too, just goes: tasks.md rule 4)
  const lower = withoutOwnMarkup(read);
  if (trimMd(lower.body) === '' && !node.children.length && !blockIdsOf(read).length) return ctx.apply(draft.remove([node]).setCaret(above, at, -1));
  // (its children after the quote item's, else into its place: an empty item's as
  // `emptyItemWithChildren` has it, another's as `joinWithChildren` does)
  const adopt = above.kind === 'item' && above !== node.parent;
  if (node.kind === 'item' && read.empty && node.children.length && !adopt && ctx.config.emptyItemWithChildren === 'refuse') return new OurusRejected('has-children');
  const refused = read.empty ? null : childrenRefused(ctx, above, node, adopt);
  if (refused) return refused;
  // (its block ids as a join takes them: moved to the quote, or merged into its)
  const moved = draft.joinBlockIds(above, quote, node, lower);
  const rest = moved ? lower : (withoutBlockIds(lower) as OurusProse);
  draft.setText(above, quote.splice(at, at, rest.text).withBlockIdLines(moved && rest.blockIdLines.length ? rest.blockIdLines : quote.blockIdLines));
  const children = [...node.children];
  if (children.length) {
    draft.remove(children);
    if (above.kind === 'item') draft.append(above, 'last', children);
    else draft.place('before', node, children);
  }
  return ctx.apply(draft.remove([node]).setCaret(above, at, -1));
}
