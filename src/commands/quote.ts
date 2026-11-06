// A quote read as an atom (`quotes: atom`, as Logseq, Tine, Roam, Athens and Dynalist hold one: a
// block's text): its lines as written, `>` included, edited as characters. What the keys do with it
// where they don't do what they do in any atom: Enter splits it, the rest a node of its own after it;
// Shift-Enter and plain paste put in lines of the quote; Backspace at its start and Delete before it
// join it to the text above as it is written. What its lines are, its `>`s, the lists and code in it,
// is the document's reading of them (`ctx.doc.mdTree`), as for any other text: nothing here reads
// Markdown.

import { OurusAtom, OurusProse, VERBATIM, blockIdsOf, checkboxLength, closingFrameStart, withoutBlockIds, type OurusDoc, type OurusNode } from '../doc/index.ts';
import { MAX_ITEM_NUMBER, type MdBlockAt, type MdLine, type MdPrefixPiece } from '../parser/index.ts';
import { trimMd } from '../text/index.ts';
import { listNumbering } from '../writer/index.ts';
import { type CommandContext } from './context.ts';
import { childrenRefused, splitSpaces, visiblePreceding } from './util.ts';
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
 * A line of a quote atom as the document reads it: the line (`MdLine`); the containers it is in from
 * the quote in, outermost first (none past the quote: an item it is the text of); the quote's own
 * piece of its prefix on it, null where the line is lazy; and where the line starts and ends in the
 * atom's text.
 */
interface QuoteLine {
  readonly line: MdLine;
  readonly containers: readonly MdBlockAt[];
  readonly quote: MdPrefixPiece | null;
  readonly start: number;
  readonly end: number;
}

/** The line of `at`'s quote that its text's offset `offset` is on. */
function quoteLine(ctx: CommandContext, at: QuoteAt, offset: number): QuoteLine {
  const doc = ctx.doc;
  const block = at.node.persistentNode.textQuote;
  const line = doc.mdTree.line(doc.lineAt(doc.posOf(at.node, offset)).index);
  const k = line.containers.findIndex((c) => c.block === block);
  const s = at.text.text;
  const start = s.lastIndexOf('\n', offset - 1) + 1;
  return {
    line,
    containers: k < 0 ? [] : line.containers.slice(k),
    quote: line.prefix.find((p) => p.container.block === block) ?? null,
    start,
    end: s.indexOf('\n', start) < 0 ? s.length : s.indexOf('\n', start),
  };
}

/**
 * Quote atom `text`'s (node `node`'s) text before `to`, each line past its `>`s (a nested quote's too)
 * as the document reads them, a lazy line whole: what it has before a block id there.
 */
export function quoteTextBefore(doc: OurusDoc, node: OurusNode, text: OurusAtom, to: number): string {
  const block = node.persistentNode.textQuote;
  const lines: string[] = [];
  for (let start = 0; ; start = text.text.indexOf('\n', start) + 1) {
    const line = doc.mdTree.line(doc.lineAt(doc.posOf(node, start)).index);
    const k = line.prefix.findIndex((p) => p.container.block === block);
    const quotes = k < 0 ? [] : line.prefix.slice(k).filter((p) => p.kind === 'quote');
    const from = quotes.length ? Math.max(start, doc.offsetOf(node, doc.mdTree.quoteMarker(quotes[quotes.length - 1]!).end)) : start;
    const end = text.text.indexOf('\n', start);
    lines.push(text.text.slice(Math.min(from, to), end < 0 || end > to ? to : end));
    if (end < 0 || end >= to) return lines.join('\n');
  }
}

/** Where quote atom `text`'s first `>` is (node `node`'s), past the spaces it may be indented by: its start, for the keys (B65, B201). */
export function quoteLead(ctx: CommandContext, node: OurusNode, text: OurusAtom): number {
  const { quote } = quoteLine(ctx, { node, text, offset: 0, to: 0 }, 0);
  return quote ? ctx.doc.offsetOf(node, ctx.doc.mdTree.quoteMarker(quote).from) : 0;
}

/** Whether the caret, or the selection, is at a quote atom's start (`quoteLead`). */
export function atQuoteStart(ctx: CommandContext, at: QuoteAt): boolean {
  const lead = quoteLead(ctx, at.node, at.text);
  return at.offset <= lead && at.to <= lead;
}

/** The offsets in quote atom `text` (node `node`'s) where its lines start, each with the line as the document reads it. */
function quoteLines(ctx: CommandContext, node: OurusNode, text: OurusAtom): QuoteLine[] {
  const lines: QuoteLine[] = [];
  for (let start = 0; ; start = text.text.indexOf('\n', start) + 1) {
    lines.push(quoteLine(ctx, { node, text, offset: start, to: start }, start));
    if (text.text.indexOf('\n', start) < 0) return lines;
  }
}

/**
 * Whether quote atom `text` (node `node`'s) has a lazy line, no `>` of its own, led by a tab past any
 * spaces: as an item's text, its columns would be others past a marker (the writer re-indents
 * spaces, not tabs).
 */
export function tabLedLazyLine(ctx: CommandContext, node: OurusNode, text: OurusAtom): boolean {
  return quoteLines(ctx, node, text).some((l) => {
    if (l.quote || l.start === 0) return false;
    let k = l.start;
    while (text.text[k] === ' ') k++;
    return text.text[k] === '\t';
  });
}

/** Whether quote atom `text` (node `node`'s) holds nothing: each line's `>`s and blanks alone. */
export function emptyQuote(ctx: CommandContext, node: OurusNode, text: OurusAtom): boolean {
  return quoteLines(ctx, node, text).every((l) => l.line.empty);
}

/**
 * Where the text of quote atom `text`'s (node `node`'s) line at `offset` starts, as the line's markup
 * reads it: past its `>`s, an item's marker, a heading's `#`s, a checkbox (`> - [ ] ┃t`).
 */
export function quoteLineTextFrom(ctx: CommandContext, node: OurusNode, text: OurusAtom, offset: number): number {
  const { line } = quoteLine(ctx, { node, text, offset, to: offset }, offset);
  return ctx.doc.offsetOf(node, ctx.doc.mdTree.markup(line.index).textFrom);
}

/** Where on the line of `at`'s quote its `>` ends (`end`: past the blank after it), in the atom's text; the line's start where the line is lazy. */
function pastQuoteMarker(ctx: CommandContext, at: QuoteAt, here: QuoteLine, end: boolean): number {
  if (!here.quote) return here.start;
  const marker = ctx.doc.mdTree.quoteMarker(here.quote);
  return ctx.doc.offsetOf(at.node, end ? marker.end : marker.to);
}

/**
 * Enter in a quote read as an atom, as `enterInQuote` says: `line`, a line of it (`lineInQuote`);
 * `split`, it splits (`splitQuote`).
 */
export function enterInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  // a selection from inside a line's `>`, part of the quote's markup: the host's where markup is text
  // the user edits, else refused, as over any selection taking part of markup
  if (!ctx.collapsed && at.offset < pastQuoteMarker(ctx, at, quoteLine(ctx, at, at.offset), false)) {
    return ctx.config.markup === 'text' ? new OurusDeferred('in-markup', 'the selection takes part of markup') : new OurusRejected('not-expressible', 'the selection takes part of markup');
  }
  return ctx.config.enterInQuote === 'line' ? lineInQuote(ctx, at) : splitQuote(ctx, at);
}

/**
 * `enterInQuote: line` (the text editors'): a line of the quote at the caret, in what the caret's line
 * is in, as the document reads it: its `>`s, nested ones too, and in a list, the next item of the
 * caret's item (a continuation line's too), its marker the list's next (a number as `orderedLists`
 * says, the items after it numbered so), a task's unchecked box after it (as `enterTask` says); in
 * code, no marker. The spaces at the caret go as `enterSplitSpace` says, but in code. On an empty
 * item, nested, it is its parent's next item, else its marker goes; on an empty last line, it leaves
 * the quote, the line going, an empty paragraph after it (an item after an item); on a quote of one
 * empty line, the quote goes, its node an empty paragraph (an empty item). Before its `>`, with
 * `enterAtTextStart: stay`, a blank line above it, the caret staying; else an empty node above
 * (rule 6).
 */
function lineInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  const { node, text, offset, to } = at;
  const s = text.text;
  const isItem = node.kind === 'item';
  const draft = ctx.draft();
  if (atQuoteStart(ctx, at)) {
    const above = node.preceding;
    if (ctx.config.enterAtTextStart === 'stay' && above) {
      if (above.kind === 'root') draft.leadingBlankLines((ctx.doc.leadingBlankLines ?? 0) + 1);
      else draft.gap(above, above.gap + 1);
      return ctx.apply(draft.setCaret(node, 0, -1));
    }
    return splitQuote(ctx, at);
  }
  const tree = ctx.doc.mdTree;
  const here = quoteLine(ctx, at, offset);
  const { line, containers, start: lineStart, end: lineEnd } = here;
  const code = !!line.leaf && VERBATIM.has(line.leaf.block.type);
  // (the items the line is in: not in code, nor on a line with nothing past its prefix but an item's
  // own marker line, which Enter leaves as a quote's line)
  const inItems = code ? [] : containers.filter((c) => c.block.type === 'item');
  const items = line.empty && !inItems.some((c) => c.line === line.index) ? [] : inItems;
  const item = items[items.length - 1] ?? null;
  // (the item whose marker is on the line, and where its text starts: past its marker and the blanks
  // after it, a task's checkbox, as the outline reads one in every flavor; on another line of an item,
  // past its prefix; else past the quote's `>` and the blank after it)
  const own = item && item.line === line.index ? item : null;
  const box = own ? checkboxOf(ctx, own) : 0;
  const textFrom = own ? ctx.doc.offsetOf(node, itemTextFrom(ctx, own) + box) : item ? ctx.doc.offsetOf(node, line.contentFrom) : pastQuoteMarker(ctx, at, here, true);
  // (a caret, or a selection's end, in the line's markup, its `>` or its item's marker, acts as at its
  // text's start)
  const [from, until] = [Math.max(offset, textFrom), Math.max(to, textFrom)];
  // (an empty item's: past its marker, a blank after it or not, its checkbox)
  const emptyFrom = own && !box ? ctx.doc.offsetOf(node, tree.markerTo(own)) : textFrom;
  // an empty item, a task's checkbox alone too, as `enterOnEmptyItem` says; the last of its list
  // (without children) outdents with every value. Outdented, nested, it is its parent's next item
  // (Obsidian's and SilverBullet's), the list numbered so; unwrapped, or outdented at the top level,
  // its marker goes, the `>`s and its parents' columns staying; `sibling`, and `exit` nested, a new
  // item after it, as on a line with text
  const parent = own ? (items[items.length - 2] ?? null) : null;
  const list = own ? containers[containers.indexOf(own) - 1] : undefined;
  // (children: blocks after its text, which a list first is too)
  const last = !!list && list.block.children[list.block.children.length - 1] === own!.block && !own!.block.children.some((c, k) => k > 0 || c.type === 'list');
  const policy = last ? 'outdent' : ctx.config.enterOnEmptyItem;
  const anew = !!own && (policy === 'sibling' || (policy === 'exit' && !!parent));
  if (ctx.collapsed && !anew && trimMd(s.slice(emptyFrom, lineEnd)) === '') {
    if (own && parent && policy !== 'unwrap') {
      const after = itemAfter(ctx, at, parent, containers.slice(0, containers.indexOf(parent)));
      if (after instanceof OurusRejected) return after;
      // (the line replaced whole: the parent's renumbering, a wider marker moving its lines, leaves it)
      const edited = editedQuote(text, [...after.edits.filter((e) => e.to < lineStart || e.from > lineEnd), { from: lineStart, to: lineEnd, insert: after.prefix }], lineEnd);
      return ctx.apply(draft.setText(node, edited.text).setCaret(node, edited.pos, -1));
    }
    if (own) {
      const quotes = containers.slice(0, containers.indexOf(own));
      const quoted = tree.continuationPrefix(line.index, quotes);
      const last = line.prefix.filter((p) => p.kind === 'quote' && quotes.some((c) => c.block === p.container.block)).pop();
      const bare = quoted + (last && tree.quoteMarker(last).end === tree.quoteMarker(last).to ? ' ' : '');
      return ctx.apply(draft.setText(node, text.splice(lineStart, lineEnd, bare)).setCaret(node, lineStart + bare.length, -1));
    }
    if (!item) {
      // a quote of one empty line: the quote goes
      if (lineStart === 0 && lineEnd === s.length) {
        if (!isItem) draft.convert(node, 'paragraph');
        return ctx.apply(draft.setText(node, new OurusProse('paragraph', isItem, '')).setCaret(node, 0, -1));
      }
      // its empty last line: it leaves the quote
      if (lineEnd === s.length) {
        const id = draft.create(isItem ? 'item' : 'paragraph', new OurusProse('paragraph', isItem, ''));
        draft.setText(node, text.splice(lineStart - 1, s.length)).place('after', node, [id]);
        if (!isItem) draft.gap(id, node.gap).gap(node, Math.max(1, node.gap));
        return ctx.apply(draft.setCaret(id, 0, -1));
      }
    }
  }
  // the new line's prefix: in an item, its next item's; else the line's containers', as for a line
  // continuing them (a lazy line, the quote's `> ` alone)
  let prefix = '> ';
  let edits: readonly QuoteEdit[] = [];
  if (item) {
    const next = itemAfter(ctx, at, item, containers.slice(0, containers.indexOf(item)));
    if (next instanceof OurusRejected) return next;
    prefix = next.prefix + (checkboxOf(ctx, item) && ctx.config.enterTask === 'continue' ? '[ ] ' : '');
    edits = next.edits;
  } else if (!line.lazy && here.quote) prefix = tree.continuationPrefix(line.index, containers);
  // (the spaces at the caret as a text's Enter takes them, not code's)
  const split = code ? { from, to: until, kept: 0 } : splitSpaces(s, from, until, textFrom, lineEnd, ctx.config.enterSplitSpace);
  const edited = editedQuote(text, [...edits, { from: split.from, to: split.to, insert: `\n${prefix}` }], split.to);
  return ctx.apply(draft.setText(node, edited.text).setCaret(node, edited.pos, -1));
}

/** A change to a quote atom's text: offsets in it. */
type QuoteEdit = { readonly from: number; readonly to: number; readonly insert: string };

/** `text` with `edits` (none overlapping) made, and where its offset `pos` is after them: past an edit ending there. */
function editedQuote(text: OurusAtom, edits: readonly QuoteEdit[], pos: number): { readonly text: OurusAtom; readonly pos: number } {
  let shift = 0;
  for (const e of edits) if (e.to <= pos) shift += e.insert.length - (e.to - e.from);
  return { text: [...edits].sort((x, y) => y.from - x.from).reduce((t, e) => t.splice(e.from, e.to, e.insert), text), pos: pos + shift };
}

/** Where item `item`'s text starts on its first line in the document: past its marker and the blanks after it. */
function itemTextFrom(ctx: CommandContext, item: MdBlockAt): number {
  return ctx.doc.mdTree.line(item.line).prefix.find((p) => p.container.block === item.block)!.to;
}

/** The length of item `item`'s checkbox with the blanks after it, as the outline reads a task's in every flavor (`checkboxLength`); 0 for an item that is no task. */
function checkboxOf(ctx: CommandContext, item: MdBlockAt): number {
  const from = itemTextFrom(ctx, item);
  return checkboxLength(ctx.doc.text.slice(from, ctx.doc.mdTree.line(item.line).to));
}

/**
 * A new item after `item` in its list, in `at`'s quote (`outer`: the containers outside it on its
 * line, from the quote): what its line has before its text (`itemLead`, then the list's next marker,
 * numbered as `orderedLists` says), and the edits numbering the list's other items so (`9.` becoming
 * `10.` moves its item's other lines as far: its content column with it). Refused where a number would
 * pass nine digits, or a narrower marker's item has a line that can't move left as far.
 */
function itemAfter(ctx: CommandContext, at: QuoteAt, item: MdBlockAt, outer: readonly MdBlockAt[]): { readonly prefix: string; readonly edits: readonly QuoteEdit[] } | OurusRejected {
  const doc = ctx.doc;
  const tree = doc.mdTree;
  const lead = tree.itemLead(item, outer);
  const attrs = item.block.attrs.list!;
  if (attrs.type === 'bullet') return { prefix: `${lead}${attrs.bulletChar} `, edits: [] };
  const siblings = outer[outer.length - 1]!.children();
  const k = siblings.findIndex((c) => c.block === item.block);
  const was = siblings.map((c) => c.block.attrs.list!.start!);
  const numbers = listNumbering([...was.slice(0, k + 1), null, ...was.slice(k + 1)], was, was[0]!, ctx.config.orderedLists);
  if (numbers.some((n) => n > MAX_ITEM_NUMBER)) return new OurusRejected('not-expressible', `an item numbered past ${MAX_ITEM_NUMBER} is no list item`);
  // (each other item renumbered: its number as written, the delimiter after it staying, and its later
  // lines' indentation for it, as far as its marker is wider or narrower)
  const edits: QuoteEdit[] = [];
  const edit = (from: number, to: number, insert: string): void => {
    edits.push({ from: doc.offsetOf(at.node, from), to: doc.offsetOf(at.node, to), insert });
  };
  for (let j = 0; j < siblings.length; j++) {
    const sibling = siblings[j]!;
    const n = numbers[j > k ? j + 1 : j]!;
    if (n === was[j]) continue;
    const number = String(n);
    const [from, to] = [tree.markerFrom(sibling), tree.markerTo(sibling) - attrs.delimiter!.length];
    edit(from, to, number);
    const wider = number.length - (to - from);
    // (a line lazy for it, or empty, as it is)
    for (let l = sibling.line + 1; wider !== 0 && l <= sibling.lastLine; l++) {
      const piece = tree.line(l).empty ? undefined : tree.line(l).prefix.find((p) => p.container.block === sibling.block);
      if (!piece) continue;
      if (wider > 0) edit(piece.to, piece.to, ' '.repeat(wider));
      else if (piece.to + wider < piece.from || piece.partialTab || [...doc.text.slice(piece.to + wider, piece.to)].some((c) => c !== ' ')) return new OurusRejected('not-expressible', 'a renumbered item\'s lines can\'t move left with its marker');
      else edit(piece.to + wider, piece.to, '');
    }
  }
  return { prefix: `${lead}${numbers[k + 1]}${attrs.delimiter} `, edits };
}

/**
 * `enterInQuote: split` (the outliners'): at its start, before its `>`, an empty node above it (rule 6);
 * else it splits at the caret, the spaces there as `enterSplitSpace` says (B200; right after a line's
 * `>`, those before the caret are its markup, and go, the `>` staying), the rest of its line a
 * paragraph after it (an item after an item: its first child where it has children and
 * `enterMidItem: child` says so, or at its end; else its next sibling, taking them), an empty one at
 * its end; its lines after the caret's a quote of their own after the rest, as written (the new
 * item's first child), as an outliner's new block holds them after its first line.
 */
function splitQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  const { node, text, offset, to } = at;
  const s = text.text;
  const item = node.kind === 'item';
  const kind = item ? 'item' : 'paragraph';
  const draft = ctx.draft();
  if (atQuoteStart(ctx, at)) {
    const id = draft.create(kind, new OurusProse('paragraph', item, ''));
    return ctx.apply(draft.place('before', node, [id]).setCaret(id, 0, -1));
  }
  const here = quoteLine(ctx, at, offset);
  const lineEnd = quoteLine(ctx, at, to).end;
  const mark = pastQuoteMarker(ctx, at, here, false);
  const split = splitSpaces(s, offset, to, mark, lineEnd, ctx.config.enterSplitSpace);
  let a = split.from;
  // (right after the line's `>`, the spaces before the caret are its markup: they go, the `>` staying;
  // at a lazy line's start, the line break before it goes too: no empty last line)
  if (trimMd(s.slice(mark, a)) === '') a = mark;
  if (a === here.start && a > 0) a--;
  draft.setText(node, text.splice(a, s.length));
  const id = draft.create(kind, new OurusProse('paragraph', item, s.slice(split.to, lineEnd)));
  const children = [...node.children];
  // folded (within the zoom), the new item goes after its subtree, its hidden children staying, where
  // it would be the first child; split with them following, the fold goes with them; zoomed into it,
  // a first child, inside the zoom (as a text's Enter: enter.ts)
  const folded = item && children.length > 0 && ctx.view.zoomFolded.has(node.id);
  const first = ctx.config.enterMidItem === 'child' || split.to === s.length;
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
    const rest = draft.create('atom', new OurusAtom('blockquote', false, quoteLine(ctx, at, lineEnd + 1).quote ? lines : `> ${lines}`));
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
  const here = quoteLine(ctx, at, offset);
  const { start, end } = here;
  if (start === 0) return null;
  // at a line's start it joins the line above, its `> ` going with the break (as the apps' blocks hold
  // the line, lazy: Fence43); on an empty line right after its `> `, the line goes
  const mark = pastQuoteMarker(ctx, at, here, true);
  if (offset === start) return ctx.apply(ctx.draft().setText(node, text.splice(start - 1, mark)).setCaret(node, start - 1, -1));
  if (offset !== mark || !here.quote || trimMd(s.slice(offset, end)) !== '') return null;
  return ctx.apply(ctx.draft().setText(node, text.splice(start - 1, offset)).setCaret(node, start - 1, -1));
}

/**
 * Shift-Enter in a quote read as an atom: a line break, its new line lazy where it can be, as the
 * apps' blocks hold it (`> a⏎b`), else as `linesInQuote` puts one: lazy where the document reads the
 * quote with the line so as the same quote, which the readback says (a line that would start a block
 * out of the quote, a list's marker, a heading, a fence, HTML, a rule, or one after an emptied quoted
 * line, `> ⏎b`, isn't); not an empty one.
 */
export function breakInQuote(ctx: CommandContext, at: QuoteAt): OurusResult | null {
  const { text, to } = at;
  const s = text.text;
  const rest = s.slice(to, s.indexOf('\n', to) < 0 ? s.length : s.indexOf('\n', to));
  const lazy = trimMd(rest) !== '' ? linesInQuote(ctx, at, ['', ''], true) : null;
  return lazy && !(lazy instanceof OurusRejected) ? lazy : linesInQuote(ctx, at, ['', '']);
}

/**
 * Lines put into a quote read as an atom at the caret (Shift-Enter's empty one, plain paste's), each
 * after a `>`, as the quote's; `lazy`, as they are. A line in what the caret's line is in, as far as
 * the caret: its nested quotes' `>`s and its items' markers as spaces (B58, as Obsidian has it); the
 * quote's `> ` alone where the caret's line is lazy, or has the quote's `>` alone, or a `>` with no
 * blank after it before an item's marker or text (`>- a`), whose columns a new line wouldn't keep:
 * its `>` would take a blank the line before has none of; or where the line so doesn't write.
 */
export function linesInQuote(ctx: CommandContext, at: QuoteAt, lines: readonly string[], lazy = false): OurusResult | null {
  const { node, text, offset, to } = at;
  const put = (prefix: string): OurusResult | null => {
    const inserted = lines.map((l, k) => (k === 0 || lazy ? l : `${prefix}${l}`)).join('\n');
    return ctx.apply(ctx.draft().setText(node, text.splice(offset, to, inserted)).setCaret(node, offset + inserted.length, -1));
  };
  if (lazy) return put('');
  const tree = ctx.doc.mdTree;
  const here = quoteLine(ctx, at, offset);
  const caret = ctx.doc.posOf(node, offset);
  const pieces = here.line.prefix.filter((p) => p.to <= caret && here.containers.some((c) => c.block === p.container.block));
  const last = pieces[pieces.length - 1];
  const bare = (p: MdPrefixPiece | undefined): boolean => p?.kind === 'quote' && tree.quoteMarker(p).end === tree.quoteMarker(p).to;
  if (here.line.lazy || !here.quote || pieces.length < 2 || pieces.some((p, k) => bare(p) && k < pieces.length - 1 && pieces[k + 1]!.kind !== 'quote')) return put('> ');
  const nested = tree.continuationPrefix(here.line.index, here.containers, caret);
  const deep = put(bare(last) ? `${nested} ` : nested);
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
