// Code (spec/fences.md): Enter, Shift-Enter, Backspace and Delete in a block of
// lines as written (fenced code, math, a comment, indented code). Code is payload and its delimiters
// are structure: a command says what the block's lines become and where the caret goes; `done()`
// grows a fence past code that would close it early, or refuses what would unmake the block.

import { ProseText, AtomText, type OutlineNode } from '../doc/index.ts';
import { lineOf, trimMd } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { textEnd, textStart, withTextlessParents } from './util.ts';

/** The caret in a block of code, and where in its text. */
export interface CodeAt {
  readonly node: OutlineNode;
  readonly text: AtomText;
  readonly offset: number;
  /** The selection's other end, in the same text (the caret's own where nothing is selected). */
  readonly to: number;
}

/** The blocks whose lines are code. */
const CODE = new Set(['fenced_code', 'indented_code', 'math_block', 'comment_block']);

/** The selection in one block of code's text, or null where it isn't. */
export function codeAt(ctx: CommandContext): CodeAt | null {
  const a = ctx.from;
  const b = ctx.to;
  if ((a.zone !== 'text' && a.zone !== 'frame') || (b.zone !== 'text' && b.zone !== 'frame')) return null;
  if (!(a.text instanceof AtomText) || !CODE.has(a.text.type) || a.node.persistentNode !== b.node.persistentNode) return null;
  return { node: a.node, text: a.text, offset: a.offset, to: b.offset };
}

/** A text's lines, with where each starts in its string. */
function linesOf(text: AtomText): { readonly text: string; readonly from: number; readonly to: number }[] {
  let at = 0;
  return text.text.split('\n').map((l) => {
    const line = { text: l, from: at, to: at + l.length };
    at += l.length + 1;
    return line;
  });
}

/** Where a delimiter's run is on line `k` (a fence's backticks or tildes, a `$$` or `%%`): null on a line of payload. */
function delimiterOn(text: AtomText, k: number): { readonly from: number; readonly to: number } | null {
  const line = linesOf(text)[k]!;
  const runs = text.delimiters;
  return [runs?.open, runs?.close].find((r) => !!r && r.from >= line.from && r.from <= line.to) ?? null;
}

/** Whether `offset` is on a line of a fence's delimiter (its opening, info and all, or its closing one); math's and a comment's `$$` and `%%` lines are the block's, as its code lines are. */
export function onDelimiterLine(text: AtomText, offset: number): boolean {
  if (text.type !== 'fenced_code') return false;
  const k = lineOf(text.text, offset);
  return delimiterOn(text, k) !== null;
}


/**
 * Enter and Shift-Enter in code (rules 1–4, 9): a new line of the block, the line's own indentation
 * carrying over; at a closing fence's start an empty last line, the caret on it; in a delimiter
 * refused; Enter at an opening delimiter's start and after a closing fence, as `enterAtOpening` and
 * `nodeAfterBlock` say. A code line's is the host's without `handleFenceContents` (for hosts that edit
 * code themselves). Null (unsupported) where ourus doesn't do it yet: Shift-Enter at an opening delimiter's start or
 * after a closing fence, indented code's four columns, a selection across lines.
 */
export function newlineInCode(ctx: CommandContext, at: CodeAt, shift: boolean): CommandOutcome {
  const { node, text } = at;
  const k = lineOf(text.text, at.offset);
  if (lineOf(text.text, at.to) !== k) return null;
  const line = linesOf(text)[k]!;
  const delimiter = delimiterOn(text, k);
  const fenced = text.type === 'fenced_code';
  const closing = !!delimiter && text.frame.some((p) => p.part === 'close' && p.from <= delimiter.from);
  const draft = ctx.draft();
  if (delimiter) {
    if (at.offset > delimiter.from && at.offset < delimiter.to) return reject('not-expressible', 'a new line would break the fence');
    if (at.offset <= delimiter.from && trimMd(text.text.slice(line.from, delimiter.from)) === '') {
      if (!closing && ctx.collapsed && !shift) return enterAtOpening(ctx, node, text);
      // at a closing fence's start: an empty last code line, the caret on it, not on the fence, where typing would unmake it
      if (!closing || !ctx.collapsed) return null;
      draft.setText(node, text.splice(line.from, line.from, '\n')).setCaret(node, line.from, -1);
      return ctx.apply(draft);
    }
    // (Shift-Enter there: a blank line after the block at its column, the caret on it, where what is
    // typed is a paragraph of the block's container: Fence7b, 32)
    if (closing && fenced) {
      if (!ctx.collapsed) return null;
      if (!shift) return nodeAfterBlock(ctx, node);
      return ctx.apply(draft.gap(node, node.gap + 1).select({ blank: node, line: 0 }, { blank: node, line: 0 }));
    }
  } else if (fenced && !ctx.config.handleFenceContents) return deferToHost('a code line: the host edits code');
  // in indented code's four columns: the host's
  if (text.frame.some((p) => p.part === 'indent' && p.from <= at.offset && at.offset < p.to)) return deferToHost('in the code\'s indentation');
  // the line's own indentation, up to the caret (a delimiter's line has none to carry)
  const own = delimiter ? '' : /^[ \t]*/.exec(line.text.slice(0, at.offset - line.from))![0];
  draft.setText(node, text.splice(at.offset, at.to, '\n' + own)).setCaret(node, at.offset + 1 + own.length, -1);
  return ctx.apply(draft);
}

/**
 * Enter at the start of an opening delimiter (rule 2): of an item's text, an empty item above, the
 * caret in it (under `enterAtTextStart: stay` too: staying would leave it on the fence); of a block
 * of an item after its text, the item splits there, the block a new item's text, as Enter splits an
 * item's text: its next sibling with the blocks after it (`enterMidItem: sibling`), or in its place
 * among the item's children (`child`), the caret at the code's first character. Elsewhere a blank
 * line opens above the block, the caret staying with it (Fence57): the node above's gap.
 */
function enterAtOpening(ctx: CommandContext, node: OutlineNode, text: AtomText): CommandOutcome {
  const draft = ctx.draft();
  if (node.kind === 'item') {
    const id = draft.create('item', new ProseText('paragraph', true, ''));
    return ctx.apply(draft.place('before', node, [id]).setCaret(id, 0, -1));
  }
  const item = node.parent;
  if (node.kind !== 'atom') return null;
  if (item?.kind !== 'item') {
    const above = node.preceding;
    // (where markup is decorated, the caret goes onto the new blank line: not done yet)
    if (!above || !ctx.doc.textOf(above) || ctx.config.markup === 'decorated') return null;
    return ctx.apply(draft.gap(above, above.gap + 1).setCaret(node, ctx.from.zone === 'frame' || ctx.from.zone === 'text' ? ctx.from.offset : 0, 1));
  }
  draft.convert(node, 'item');
  if (ctx.config.enterMidItem === 'sibling') {
    const after = item.children.slice(node.index + 1);
    draft.remove([node, ...after]).place('after', item, [node]).append(node, 'last', after);
  }
  return ctx.apply(draft.setCaret(node, codeStart(text), -1));
}

/** The code's first character: past its first line's indentation; after the opening where it has no line. */
function codeStart(text: AtomText): number {
  const lines = linesOf(text);
  const first = lines.length > 1 && !delimiterOn(text, 1) ? lines[1]! : null;
  return first ? first.from + /^[ \t]*/.exec(first.text)![0].length : lines[0]!.to;
}

/**
 * An item whose text is code joins the node above (rule 6): its marker goes, its code a block of the
 * item above (the one the node above is, or is in) after its last block, its children after it; the
 * caret at the end of the text above, as in any join, or where `caret` says (Backspace at the code's
 * start keeps it there: Fence31; Delete keeps it where it was: Fence34). Into an empty item above, it
 * takes that item's place, the caret at the code's start (Fence51). Refused with no item above to
 * hold a block.
 */
export function joinCodeItemUp(ctx: CommandContext, node: OutlineNode, caret?: { readonly node: OutlineNode; readonly offset: number }): CommandOutcome {
  const prev = node.preceding;
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  const text = ctx.doc.textOf(node);
  const upper = ctx.doc.textOf(prev);
  if (!(text instanceof AtomText) || !upper) return null;
  const draft = ctx.draft();
  if (prev.kind === 'item' && !prev.children.length && upper instanceof ProseText && upper.empty && caret?.node !== prev) {
    return ctx.apply(draft.remove([prev]).setCaret(node, codeStart(text), -1));
  }
  let holder: OutlineNode | null = prev;
  while (holder && holder.kind !== 'item') holder = holder.parent;
  let inside = false;
  for (let up = node.parent?.parent; up && holder; up = up.parent) if (up.persistentNode === holder.persistentNode) inside = true;
  if (!holder || inside) return reject('not-expressible', `a ${prev.kind} can't hold the code`);
  const children = node.children;
  draft.convert(node, 'atom');
  if (holder.persistentNode === node.parent?.persistentNode) {
    if (children.length) draft.remove(children).place('after', node, children);
  } else draft.remove([node, ...children]).append(holder, 'last', [node, ...children]);
  if (caret) draft.setCaret(caret.node, caret.offset, -1);
  else draft.setCaret(prev, textEnd(upper), -1);
  return ctx.apply(draft);
}

/**
 * Enter after a closing fence (rule 3), or at the end of a block of lines (a table, a thematic break:
 * enter.md rule 11): where the block ends an item's content (its text, or its last block before child
 * items), a new item, as at the end of the item's text: its first child where it has child items, else
 * its next sibling; elsewhere an empty paragraph after the block in its container (an item's first
 * child, where the block is its text), taking its blank lines, which `done()` holds with a placeholder.
 */
export function nodeAfterBlock(ctx: CommandContext, node: OutlineNode): CommandOutcome {
  const draft = ctx.draft();
  const item = node.kind === 'item' ? node : node.parent?.kind === 'item' ? node.parent : null;
  const after = item ? item.children.slice(node === item ? 0 : node.index + 1) : [];
  if (item && after.every((c) => c.kind === 'item')) {
    const id = draft.create('item', new ProseText('paragraph', true, ''));
    if (after[0]) draft.place('before', after[0], [id]);
    else draft.place('after', item, [id]);
    return ctx.apply(draft.setCaret(id, 0, -1));
  }
  const id = draft.create('paragraph', new ProseText('paragraph', false, ''));
  if (node.kind === 'item') draft.append(node, 'first', [id]);
  else if (node.kind === 'atom') draft.place('after', node, [id]);
  else return null;
  draft.gap(id, node.gap).gap(node, 0).setCaret(id, 0, -1);
  return ctx.apply(draft);
}

/**
 * Backspace (`dir` -1) at a code line's start and Delete (1) at its end (rules 5, 9): the lines join,
 * the containers' prefix going with the line break; indented code's four columns too. Against a
 * delimiter a line with code is refused, an empty one just goes. Backspace and Delete of a character
 * in code are the host's, but where it would make a fence (`done()` grows the fences then). Null where
 * ourus doesn't do it yet.
 */
export function joinInCode(ctx: CommandContext, at: CodeAt, dir: -1 | 1): CommandOutcome {
  if (!ctx.collapsed) return null;
  const { node, text, offset } = at;
  const lines = linesOf(text);
  const k = lineOf(text.text, offset);
  const line = lines[k]!;
  const draft = ctx.draft();
  const apply = (from: number, to: number, caret: number): CommandOutcome => ctx.apply(draft.setText(node, text.splice(from, to)).setCaret(node, caret, dir < 0 ? -1 : 1));
  if (text.type === 'indented_code') {
    // at the code's start, past a line's four columns, back (in them, the host's); at its end, forward
    const columns = text.frame.find((p) => p.part === 'indent' && p.from === line.from)?.to ?? line.from;
    if (dir < 0 && offset < columns) return null;
    if (dir < 0 ? offset > columns : offset !== line.to) return characterInCode(ctx, at, dir);
    const other = lines[k + dir];
    if (!other) return dir < 0 && node.preceding && node.preceding.kind !== 'root' ? reject('not-expressible', "the code can't join the text above") : null;
    const [upper, lower] = dir < 0 ? [other, line] : [line, other];
    // a blank line of the block just goes
    if (trimMd(other.text) === '') return dir < 0 ? apply(other.from, line.from, offset - (line.from - other.from)) : apply(line.to, other.to, offset);
    const lowerColumns = text.frame.find((p) => p.part === 'indent' && p.from === lower.from)?.to ?? lower.from;
    return apply(upper.to, lowerColumns, upper.to);
  }
  // a delimiter after code on its line (`x$$`) leaves the line a code line here
  const found = delimiterOn(text, k);
  const delimiter = found && trimMd(text.text.slice(line.from, found.from)) === '' ? found : null;
  const empty = (l: { text: string }): boolean => trimMd(l.text) === '';
  if (dir < 0) {
    // at a delimiter's run (a fence's indentation), as at its line's start
    const atStart = delimiter ? offset <= delimiter.from && trimMd(text.text.slice(line.from, offset)) === '' : offset === line.from;
    if (!atStart) return delimiter ? deleteInFenceRun(ctx, at, dir) : characterInCode(ctx, at, dir);
    const above = lines[k - 1];
    if (!above) return atOpeningStart(ctx, at);
    const aboveDelimiter = delimiterOn(text, k - 1);
    if (delimiter) {
      if (aboveDelimiter) return reject('not-expressible', 'the fence would join the opening fence');
      if (!empty(above)) return reject('not-expressible', 'the fence would join the last code line');
      return apply(above.from, line.from, offset - (line.from - above.from));
    }
    if (!aboveDelimiter) return apply(above.to, line.from, above.to);
    if (empty(line)) return apply(above.to, line.to, above.to);
    // the code of an item whose text it is: the item joins the item above, taking Enter's split back (Fence31)
    if (node.kind === 'item') return joinCodeItemUp(ctx, node, { node, offset });
    return reject('not-expressible', 'the code would join the opening fence');
  }
  if (offset !== line.to) return delimiter ? deleteInFenceRun(ctx, at, dir) : characterInCode(ctx, at, dir);
  const below = lines[k + 1];
  if (!below) {
    // at a closing fence's end before a line with text: it would join the fence (Fence35)
    // (an empty item there goes, as Delete takes one anywhere: not done yet)
    const i = node.textLastLine + 1;
    const owner = i < ctx.doc.lineCount ? ctx.doc.nodeAtLine(i) : null;
    const ownText = owner ? ctx.doc.textOf(owner) : null;
    if (!delimiter || i >= ctx.doc.lineCount || ctx.doc.isBlankLine(i) || (ownText instanceof ProseText && ownText.empty)) return null;
    return reject('not-expressible', 'the line below would join the closing fence');
  }
  const belowDelimiter = delimiterOn(text, k + 1);
  if (delimiter) {
    if (belowDelimiter) return reject('not-expressible', 'the fences would join');
    if (!empty(below)) return reject('not-expressible', 'the code would join the opening fence');
    return apply(line.to, below.to, offset);
  }
  if (!belowDelimiter) return apply(line.to, below.from, offset);
  if (!empty(line)) return reject('not-expressible', 'the closing fence would join the code');
  // the caret to the end of the line above: before the closing fence, typing would unmake the block
  const above = lines[k - 1]!;
  return apply(above.to, line.to, above.to);
}

/**
 * Backspace and Delete of a character of a closed fence's run: both runs shorten, so they still match.
 * At three: an empty pair of fences with no info string, from its opening fence, is text again (the
 * closing fence goes, the inverse of typing the opening one: Backtick15), its line joining the
 * paragraphs it then runs into; any other empty block goes, as an empty item does (Backtick25, 26); a
 * block with code would break, the host's where markup is text (Backtick28), else refused. Null for
 * other delimiters and an unclosed fence's run, which the host edits.
 */
function deleteInFenceRun(ctx: CommandContext, at: CodeAt, dir: -1 | 1): CommandOutcome {
  const { node, text } = at;
  const runs = text.delimiters;
  const char = dir < 0 ? at.offset - 1 : at.offset;
  const run = [runs?.open, runs?.close].find((r) => !!r && char >= r.from && char < r.to);
  if (text.type !== 'fenced_code' || !runs?.close || !run) return null;
  const { open, close } = runs;
  const draft = ctx.draft();
  if (run.to - run.from > 3) {
    const edited = text.splice(close.to - 1, close.to).splice(open.to - 1, open.to);
    // (where markup is decorated, not on the fence: at the code's end below it, its start above)
    const caret = ctx.config.markup === 'decorated' ? (run === close ? textEnd(edited) : codeStart(edited)) : run === open ? char : char - 1;
    return ctx.apply(draft.setText(node, edited).setCaret(node, caret, dir < 0 ? -1 : 1));
  }
  const detail = 'the fence would break: the block has code';
  if (trimMd(text.body) !== '') return ctx.config.markup === 'text' ? deferToHost(detail) : reject('not-expressible', detail);
  const s = text.text;
  if (run === open && lineOf(text.text, close.from) === lineOf(text.text, open.from) + 1 && text.info.trim() === '') {
    // the paragraphs right above and below run into its line
    const left = new ProseText('paragraph', text.item, s.slice(open.from, open.to - 1));
    let target = node;
    let caret = char - open.from;
    if (node.kind === 'item') draft.setText(node, left);
    else {
      draft.convert(node, 'paragraph').setText(node, left);
      const above = node.index > 0 ? node.parent!.child(node.index - 1) : null;
      const upper = above && ctx.doc.textOf(above);
      if (above?.kind === 'paragraph' && above.gap === 0 && !above.children.length && upper instanceof ProseText) {
        target = above;
        caret += upper.text.length + 1;
        draft.join(above, node, { separator: '\n' });
      }
    }
    const below = node.kind === 'item' ? node.children[0] : node.next;
    if (below?.kind === 'paragraph' && node.gap === 0 && ctx.doc.textOf(below) instanceof ProseText) draft.join(target, below, { separator: '\n' });
    return ctx.apply(draft.setCaret(target, caret, -1));
  }
  return removeEmptyBlock(ctx, node, dir);
}

/**
 * An empty block goes: from an item whose text it is, leaving it empty; else with the quotes without
 * a title it is all of, the caret at the end of the text above (Backspace) or the start of the text
 * below, the paragraphs on either side running together as their lines now do. Null where it is the
 * document's only node.
 */
function removeEmptyBlock(ctx: CommandContext, node: OutlineNode, dir: -1 | 1): CommandOutcome {
  const draft = ctx.draft();
  if (node.kind === 'item') return ctx.apply(draft.setText(node, new ProseText('paragraph', true, '')).setCaret(node, 0, -1));
  const gone = withTextlessParents(ctx.doc, [node])[0]!;
  const above = gone.preceding && gone.preceding.kind !== 'root' ? gone.preceding : null;
  const below = gone.afterSubtree;
  const upper = above && ctx.doc.textOf(above);
  const lower = below && ctx.doc.textOf(below);
  draft.remove([gone]);
  const together = above?.kind === 'paragraph' && below?.kind === 'paragraph' && above.next === gone && gone.next === below && above.gap === 0 && gone.gap === 0 && !above.children.length;
  if (together && upper instanceof ProseText && lower instanceof ProseText) {
    draft.join(above, below, { separator: '\n' });
    return ctx.apply(draft.setCaret(above, dir < 0 ? upper.text.length : upper.text.length + 1, -1));
  }
  if (upper && (dir < 0 || !lower)) return ctx.apply(draft.gap(above!, Math.max(above!.gap, gone.gap)).setCaret(above!, upper instanceof ProseText ? textEnd(upper) : upper.text.length, -1));
  if (lower) return ctx.apply(draft.setCaret(below!, textStart(lower), 1));
  return null;
}

/**
 * Backspace at the start of an opening delimiter: an item whose text the block is joins the item above
 * (Fence26); a block after a node's text can't join it (Fence25, Fence33), but a blank line between
 * goes. Null at the document's start.
 */
function atOpeningStart(ctx: CommandContext, at: CodeAt): CommandOutcome {
  const { node, offset } = at;
  if (node.kind === 'item') return joinCodeItemUp(ctx, node);
  const above = node.preceding;
  // first in its container, below no text (`> ┃```): nothing to join, not done yet
  if (!above || above.kind === 'root' || !ctx.doc.textOf(above)) return null;
  if (above.gap === 0) return reject('not-expressible', "the code can't join the text above");
  // the caret where it was; where markup is decorated, not on the delimiter: at the code's start
  return ctx.apply(ctx.draft().gap(above, above.gap - 1).setCaret(node, ctx.config.markup === 'decorated' ? codeStart(at.text) : offset, 1));
}

/**
 * Backspace or Delete of a character on a code line: the host's, but where it would make a fence of
 * code (`x```` → ```` ``` ````, closing the block early): then ourus's, and `done()` grows the fences
 * past it, or refuses where they can't (`$$`, `%%`).
 */
function characterInCode(ctx: CommandContext, at: CodeAt, dir: -1 | 1): CommandOutcome {
  const { node, text, offset } = at;
  const [from, to] = dir < 0 ? [offset - 1, offset] : [offset, offset + 1];
  const line = linesOf(text)[lineOf(text.text, offset)]!;
  // in the line's indentation, the host's
  if (from < line.from || to > line.to || trimMd(text.text.slice(line.from, to)) === '') return null;
  const edited = text.splice(from, to);
  if (ctx.doc.readsAs(edited)) return deferToHost('a character of code: the host deletes it');
  return ctx.apply(ctx.draft().setText(node, edited).setCaret(node, from, dir < 0 ? -1 : 1));
}
