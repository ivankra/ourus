// Shift-Enter (spec/shift-enter.md): a line break in a node's text. The command says
// what the text becomes and where the caret goes; `done()` escapes what would start a block, sets
// apart what would run together, and holds an empty line with a placeholder.

import { OurusProse, OurusAtom, type OurusNode } from '../doc/index.ts';
import { isSpaceOrTab, lineOf, trimMd } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { breakInQuote } from './quote.ts';
import { deleteSelectionAcross } from './backspace.ts';
import { codeAt, newlineInCode } from './code.ts';
import { enterCommand } from './enter.ts';
import { hiddenSpacesAt, inMarkup, pastPrefix, textActedOnAt, unquote } from './util.ts';

/**
 * Shift-Enter (spec/shift-enter.md): the text breaks at the caret (over a selection in one line, in
 * its place), the spaces on either side staying where they are, the caret before the new line's
 * (rule 5). An ATX title splits as with
 * Enter; a one-line title or a table row refuses it; at an item's text start the line breaks after
 * its marker (rule 2). At a later line's start, the line and the rest become a paragraph of their
 * own, a blank line above them (rules 3 and 4). Null for code (rule 1) and a selection across lines,
 * which ourus doesn't do yet (unsupported).
 */
export function shiftEnterCommand(ctx: CommandContext): CommandOutcome {
  ctx = pastPrefix(ctx);
  const config = ctx.config;
  const code = codeAt(ctx);
  if (code) return newlineInCode(ctx, code, true);
  if (ctx.collapsed && ctx.from.zone === 'gap') return breakOnBlankLine(ctx, ctx.from.owner);
  // across nodes, deleted as Backspace deletes it, the line breaking at the caret (ShiftEnter27)
  if (ctx.doc.lineAt(ctx.selection.anchor).index !== ctx.doc.lineAt(ctx.selection.head).index) return breakAcross(ctx);
  let from = ctx.from;
  let to = ctx.to;
  // in the spaces Markdown hides before an item's text, the user's: at their start the line breaks
  // after the marker, the spaces going with the text onto the new line, where they are text
  // (Enter65k); among them, the host's, as in any text's spaces; before a paragraph's, as at its text's start
  const hidden = ctx.collapsed ? hiddenSpacesAt(ctx, ctx.selection.head) : null;
  if (hidden && ctx.selection.head < hidden.to) {
    if (ctx.selection.head > hidden.from) return deferToHost();
    if (hidden.node.kind === 'item') return lineBreakAtTextStart(ctx, hidden.node, hidden.text, ' '.repeat(hidden.to - hidden.from));
  }
  if (ctx.collapsed && inMarkup(ctx.doc, from, ctx.selection.head)) {
    // where markup is text the user edits, a line break in it is the host's
    if (config.markup === 'text') return deferToHost('the caret is in markup');
    // else in an item's marker or a task's checkbox it acts at the text's start
    const at = (from.zone === 'marker' || (from.zone === 'frame' && from.part === 'task')) && textActedOnAt(ctx, ctx.selection.head);
    if (at) from = to = { zone: 'text', node: at.node, text: at.text, offset: at.offset };
  } else if (ctx.collapsed && from.zone === 'frame' && from.part === 'heading') {
    // at a heading's line start, before its `#`s: at its text's start
    const at = textActedOnAt(ctx, ctx.selection.head);
    if (at) from = to = { zone: 'text', node: at.node, text: at.text, offset: at.offset };
  }
  // right after a block id ending the text, or in it (where markup isn't text): at the text's end,
  // before it
  if (ctx.collapsed && (from.zone === 'text' || (from.zone === 'frame' && from.part === 'blockId')) && from.text instanceof OurusProse) {
    const id = from.text.frame.find((p) => p.part === 'blockId');
    if (id && from.offset > id.from) from = to = { zone: 'text', node: from.node, text: from.text, offset: id.from };
  }
  if (from.zone === 'frame' && from.part === 'callout') return reject('not-expressible', "a line break would split the callout's type");
  if (from.zone === 'frame' && from.part === 'underline') return reject('not-expressible', 'a line break would cut the setext underline');
  if (from.zone !== 'text' || (to.zone !== 'text' && to.zone !== 'frame') || from.node !== to.node) return null;
  const node = from.node;
  const text = from.text;
  // (in a quote read as an atom, a line of it: `> `)
  if (text instanceof OurusAtom && text.type === 'blockquote') {
    if (from.offset === 0) return reject('not-expressible', 'a line break here would leave an empty line inside the text');
    return breakInQuote(ctx, { node, text, offset: from.offset, to: to.offset });
  }
  if (text instanceof OurusAtom) return text.type === 'table' ? reject('not-expressible', 'a table row is a single line') : null;
  if (node.head?.type === 'callout_title') return reject('not-expressible', 'a callout title is a single line');
  if (text.heading?.form === 'atx') return enterCommand(ctx, false);
  const underline = text.frame.find((p) => p.part === 'underline');
  if (underline && to.offset > underline.from) return reject('not-expressible', 'a line break would cut the setext underline');
  // on an empty item the line break is the host's (TO13); on any other empty node, refused
  if (text.empty) return node.kind === 'item' ? deferToHost('an empty item has no line to break') : reject('not-expressible', 'an empty node has no line to break');
  const s = text.text;
  const line = lineOf(s, from.offset);
  const lineStart = text.textStart(line);
  const lineEnd = s.indexOf('\n', to.offset) < 0 ? s.length : s.indexOf('\n', to.offset);
  // a quote's new line quoted
  const brk = text.type === 'quote' ? '\n> ' : '\n';
  // at the text's end before a block id ending it: the new line holds the caret, then the block id,
  // which stays at the end of the last line (`- foo` / `  ┃ ^id`); typing goes before it
  const id = text.frame.find((p) => p.part === 'blockId');
  if (ctx.collapsed && id && from.offset === id.from && trimMd(s.slice(lineStart, from.offset)) !== '') {
    const written = `${brk} ${s.slice(s.indexOf('^', id.from), id.to)}`;
    return ctx.apply(ctx.draft().setText(node, text.splice(id.from, id.to, written)).setCaret(node, id.from + brk.length, -1));
  }
  if (trimMd(s.slice(lineStart, from.offset)) === '') {
    if (!ctx.collapsed) return null;
    if (lineStart === text.textStart(0)) return lineBreakAtTextStart(ctx, node, text);
    return paragraphBreakAtLineStart(ctx, node, text, lineStart);
  }
  let a = from.offset;
  while (a > lineStart && isSpaceOrTab(s.charCodeAt(a - 1))) a--;
  let b = to.offset;
  while (b < lineEnd && isSpaceOrTab(s.charCodeAt(b))) b++;
  // at the end of a line inside the text the new line would be empty, which Markdown holds in no text:
  // the text breaks there into two paragraphs, the caret on the blank line between, at the text's
  // column (TO-S11); typed on, they are one again
  if (b === lineEnd && lineEnd < s.length && !underline) {
    let rest = lineEnd + 1;
    while (rest < s.length && isSpaceOrTab(s.charCodeAt(rest))) rest++;
    // a quote's text (`quotes: text`): the quote holds the two, its blank line between them quoted,
    // as the text editors keep the lines after it quoted (a quote of two paragraphs, a container)
    const quoted = text.type === 'quote' ? quoteSplit(ctx, node, text, a, rest) : undefined;
    if (quoted !== undefined) return quoted;
    const into = node.kind === 'item' ? 'child' : 'sibling';
    const split = ctx.draft();
    split.split(node, a, { to: rest, children: into === 'child' ? 'stay' : 'follow', into, kind: 'paragraph' });
    return ctx.apply(split.gap(node, 1).select({ blank: node, line: 0 }, { blank: node, line: 0 }));
  }
  // the text breaks at the caret, the spaces on either side staying where they are, the caret at the
  // new line's start, before them (and before a backslash it starts with)
  const draft = ctx.draft().setText(node, text.splice(from.offset, to.offset, brk)).setCaret(node, from.offset + brk.length, -1);
  return ctx.apply(draft);
}

/**
 * A quote's text broken at the end of a line inside it, `at` (`to`: where the next line starts): a
 * quote of two paragraphs, the text's lines before `at` and from `to`, each without its `>`s, the
 * caret on the quoted blank line between them; typed on, they are one text again. Undefined where the
 * rest is lazy lines alone, which breaks as any text does; null for an item's (`- > q`), whose quote
 * would be its first block on its marker's line, an item with no text of its own, which ourus doesn't
 * write yet.
 */
function quoteSplit(ctx: CommandContext, node: OurusNode, text: OurusProse, at: number, to: number): CommandOutcome | undefined {
  // (a rest of lazy lines alone, no `>` of theirs to keep: split as any text, a paragraph after it)
  if (!/(?:^|\n) {0,3}>/.test(text.text.slice(to))) return undefined;
  // (a quote of two paragraphs carries no block-id lines, §4.3: the one after it would name the quote)
  if (text.blockIdLines.length) return reject('block-id', 'a quote of several paragraphs carries no block-id lines: the one after it would name the quote, not its text');
  const draft = ctx.draft();
  const lines = (from: number, end: number): OurusProse => {
    const part = text.slice(from, end);
    return unquote(part.retyped('quote', false));
  };
  if (node.kind === 'item') {
    // (the item's text the quote, its first block, its two paragraphs new)
    const upper = draft.create('paragraph', lines(0, at));
    const quote = draft.create('quote', null);
    draft.append(quote, 'first', [upper, draft.create('paragraph', lines(to, text.text.length))]);
    draft.setText(node, null).append(node, 'first', [quote]);
    return ctx.apply(draft.gap(upper, 1).select({ blank: upper, line: 0 }, { blank: upper, line: 0 }));
  }
  // (the text the first paragraph, the rest the second, its gap with it; the list it adopted after
  // the quote, which adopts none)
  const quote = draft.create('quote', null);
  const [, lower] = draft.split(node, at, { to, children: 'stay', into: 'sibling', kind: 'paragraph' });
  draft.setText(node, lines(0, at)).setText(lower, lines(to, text.text.length));
  draft.place('before', node, [quote]).remove([node, lower, ...node.children]).append(quote, 'first', [node, lower]);
  if (node.children.length) draft.place('after', quote, node.children);
  return ctx.apply(draft.gap(node, 1).select({ blank: node, line: 0 }, { blank: node, line: 0 }));
}

/**
 * Over a selection across nodes: deleted as Backspace deletes it, the line breaking where it was. Null
 * where the break would have blanks at it, or within one node's text (not done yet).
 */
function breakAcross(ctx: CommandContext): CommandOutcome {
  const { from, to } = ctx;
  if (from.zone !== 'text' || to.zone !== 'text' || !(from.text instanceof OurusProse) || from.node === to.node) return null;
  const [before, after] = [from.text.text[from.offset - 1], to.text.text[to.offset]];
  if ([before, after].some((c) => c === undefined || c === '\n' || isSpaceOrTab(c.charCodeAt(0)))) return null;
  return deleteSelectionAcross(ctx, (draft, node, offset) => {
    const text = draft.touched(node.id).text;
    if (!(text instanceof OurusProse)) return null;
    return draft.setText(node, text.splice(offset, offset, '\n')).setCaret(node, offset + 1, -1);
  });
}

/**
 * On a blank line after a node's text (the line a Shift-Enter at its end made): another, the caret on
 * it at the text's column, so what is typed there is a paragraph of its own, as two Shift-Enters make
 * one (ShiftEnter15). Null (unsupported) where ourus doesn't do it yet: a node with no text of its own, a blank line
 * not at the text's column (the host's).
 */
function breakOnBlankLine(ctx: CommandContext, owner: OurusNode): CommandOutcome {
  const text = ctx.doc.textOf(owner);
  if (!(text instanceof OurusProse) || text.type === 'heading') return null;
  const k = ctx.doc.lineAt(ctx.selection.head).index - owner.ownLastLine - 1;
  // (any other blank line, the host's)
  if (k < 0 || k >= owner.gap || !ctx.doc.atTextColumn(ctx.selection.head, owner)) return null;
  return ctx.apply(ctx.draft().gap(owner, owner.gap + 1).select({ blank: owner, line: k + 1 }, { blank: owner, line: k + 1 }));
}

/**
 * At the text's start (rule 2): an item's line breaks after its marker (a checkbox staying on it), the
 * text on the next line, which an item may start with; a callout's after its type. Refused for any
 * other text, and where the text already starts there: an item starts with one blank line at most.
 */
function lineBreakAtTextStart(ctx: CommandContext, node: OurusNode, text: OurusProse, kept = ''): CommandOutcome {
  if (!(text.type === 'title' && text.callout) && (node.kind !== 'item' || text.frame.some((p) => p.part === 'below'))) {
    return reject('not-expressible', node.kind === 'item' ? 'an item starts with one blank line at most' : 'a line break here would leave an empty line inside the text');
  }
  const s = text.text;
  const start = text.textStart(0);
  // a first line a placeholder holds empty after a checkbox: not done yet (it stays held)
  if (s[start] === '\n' || start === s.length) return null;
  let a = start;
  while (a > 0 && isSpaceOrTab(s.charCodeAt(a - 1))) a--;
  // (`kept`: the spaces Markdown hid before it, text on the new line)
  const draft = ctx.draft().setText(node, text.splice(a, start, '\n' + kept)).setCaret(node, a + 1, -1);
  return ctx.apply(draft);
}

/**
 * At a later line's start (rules 3 and 4): Markdown has no empty line inside a paragraph, so the
 * break is a blank line, and the line (without its leading spaces) and the rest are a paragraph of
 * their own: an item's or a callout's first child, or the paragraph after this one, taking its list.
 * A setext title has none.
 */
function paragraphBreakAtLineStart(ctx: CommandContext, node: OurusNode, text: OurusProse, lineStart: number): CommandOutcome {
  if (text.type === 'heading') return reject('not-expressible', 'a heading has no blank line in its title');
  const s = text.text;
  let b = lineStart;
  while (b < s.length && isSpaceOrTab(s.charCodeAt(b))) b++;
  const draft = ctx.draft();
  const child = node.kind === 'item' || node.kind === 'quote';
  const [, made] = draft.split(node, lineStart - 1, { to: b, kind: 'paragraph', children: child ? 'stay' : 'follow', into: child ? 'child' : 'sibling' });
  draft.gap(node, 1).setCaret(made, 0, -1);
  return ctx.apply(draft);
}
