// Fenced code: Enter, Backspace and Delete on code lines and fences.

import type { OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlinePlan } from '../encoder/index.ts';
import { CommandContext, blankInQuote, isClosingFence, isCodeLine } from './context.ts';
import { notApplicable, reject, type Outcome } from './plan.ts';
import { insertBefore } from './enter.ts';

/**
 * Enter in a fenced code block: a new line, split at the caret, which stays in the containers the
 * block is in (an item's continuation indentation, a quote's `>`). On a code line it takes the line's
 * own indentation too, and is ourus's only with `handleFenceContents` (else the host's: it may edit
 * code itself). On a fence line it is always ourus's: inside the run of backticks or tildes it is
 * refused, since a new line there would break the fence.
 */
export function fenceNewline(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (selFrom < line.contentFrom) return notApplicable;
  const text = doc.text;
  const block = line.leaf!;
  let runStart = line.contentFrom;
  runStart = skipSpaces(text, runStart, line.to, 1);
  let runEnd = runStart;
  while (runEnd < line.to && text[runEnd] === block.fenceChar) runEnd++;
  const opening = line.index === block.startLine;
  const closing = !opening && line.index === block.endLine && runEnd - runStart >= block.fenceLength! && text.slice(runEnd, line.to).trim() === '';
  if (opening || closing) {
    if (selFrom > runStart && selFrom < runEnd) return reject('not-expressible', 'a new line would break the fence');
    // at the start of a fence that is an item's text, Enter is at the item's text start
    if (opening && selFrom <= runStart && node.kind === 'item' && node.head === block) return insertBefore(ctx, node, selFrom, '');
  } else if (!doc.config.handleFenceContents) return notApplicable;
  const prefix = ctx.encoder.continuation(line.prefix);
  let indentEnd = line.contentFrom;
  indentEnd = skipSpaces(text, indentEnd, line.to, 1);
  const own = opening || closing ? '' : text.slice(line.contentFrom, Math.min(indentEnd, selFrom));
  const eol = ctx.ending(line);
  const atRun = (opening || closing) && selFrom <= runStart;
  // at a closing fence's start: an empty last code line, the caret on it, not on the fence, where
  // typing would unmake it
  if (closing && atRun) {
    const changes = [{ from: line.from, to: selTo, insert: prefix + eol + text.slice(line.from, selFrom) }];
    return codeEdit(ctx, node, changes, line.from + prefix.length);
  }
  // a fence moved down from its line start leaves no trailing whitespace behind, only quote markers
  const changes = atRun
    ? [{ from: line.from, to: selTo, insert: prefix.trimEnd() + eol + prefix }]
    : [{ from: selFrom, to: selTo, insert: eol + prefix + own }];
  return codeEdit(ctx, node, changes, changes[0]!.from + changes[0]!.insert.length);
}

/**
 * An edit of a fenced block's code lines: the outline stays, the block's text changing. Where the
 * edit would make a fence of code (a line of backticks closing the block early), it is refused.
 */
export function codeEdit(ctx: CommandContext, node: OutlineNode, changes: ChangeSpec[], caret: number, refusal = 'the code would make a fence'): Outcome {
  const { doc } = ctx;
  const next = doc.update(changes);
  const expected = ctx.plan.setText(node, next.nodeText(next.nodeAt(caret) ?? node));
  if (expected.differenceFrom(next, doc, 'tree') !== null) return reject('not-expressible', refusal);
  return ctx.caret(changes, caret, expected);
}

/**
 * Whether `line` is a line of a block whose lines are payload, other than fenced code (which has rules
 * of its own): math, a comment, indented code. In an item or a quote the host's line break or
 * one-character delete would leave the containers' prefix behind and end the block; anywhere, a break
 * in a `$$` or `%%` would unmake it.
 */
export function isPayloadLine(line: LineInfo | undefined): boolean {
  const block = line?.leaf;
  if (!line || !block) return false;
  return block.type === 'math_block' || block.type === 'comment_block' || (block.type === 'code_block' && !block.fenced);
}

/**
 * Enter and Shift-Enter on such a line: a new line of the block, in its containers, the line's own
 * indentation carrying over (indented code's included), as on a fenced code line. Refused where the
 * block would end or change (a math block's `$$` split).
 */
export function payloadNewline(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (selFrom < line.contentFrom) return notApplicable;
  const text = doc.text;
  const indentEnd = skipSpaces(text, line.contentFrom, line.to, 1);
  const own = text.slice(line.contentFrom, Math.min(indentEnd, selFrom));
  const insert = ctx.ending(line) + ctx.encoder.continuation(line.prefix) + own;
  return codeEdit(ctx, node, [{ from: selFrom, to: selTo, insert }], selFrom + insert.length, `a new line would end the ${line.leaf!.type.replace('_', ' ')}`);
}

/**
 * Backspace at the start of such a line and Delete at its end: the lines of the block join, the
 * containers' prefix going with the line break. Null where that doesn't apply.
 */
export function joinPayloadLines(ctx: CommandContext, node: OutlineNode | null, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const line = doc.lineAt(pos);
  if (!node || !isPayloadLine(line)) return null;
  const other = doc.lines[line.index + dir];
  if (!other || other.leaf !== line.leaf) return null;
  // as at a code fence: against a `$$` or `%%` line a line with text on it is refused, an empty one
  // just goes
  const block = line.leaf!;
  const fence = (l: LineInfo): boolean =>
    (block.type === 'math_block' || block.type === 'comment_block') && (l.index === block.startLine || (l.index === block.endLine && l.index > block.startLine && /(\$\$|%%)[ \t]*$/.test(doc.text.slice(l.contentFrom, l.to))));
  if (fence(line) || fence(other)) {
    const content = fence(line) ? other : line;
    if (fence(content) || doc.text.slice(content.contentFrom, content.to).trim() !== '') {
      if (dir < 0 ? pos !== line.contentFrom : pos !== line.to) return null;
      return reject('not-expressible', 'the text would join the fence');
    }
  }
  const refusal = `the lines would end the ${block.type.replace('_', ' ')}`;
  if (dir < 0) return pos === line.contentFrom ? codeEdit(ctx, node, [{ from: other.to, to: line.contentFrom, insert: '' }], other.to, refusal) : null;
  return pos === line.to ? codeEdit(ctx, node, [{ from: line.to, to: other.contentFrom, insert: '' }], pos, refusal) : null;
}

/**
 * Backspace and Delete at a fenced block's lines, where the host's key would unmake the block (join a
 * fence to the code or the text next to it, or delete a space of the containers' prefix). Null where
 * none of this applies, and the command goes on.
 *
 * - On a code line, Backspace at its start and Delete at its end join code lines: the line break goes
 *   with the containers' prefix on the next line (an item's indentation, a quote's `>`), which isn't
 *   code. Against a fence a code line with code on it is refused, the code would join the fence; an
 *   empty one just goes (it takes back the empty line Enter made there).
 * - At a closing fence's start, Backspace takes an empty last code line away, and is refused after
 *   one with code; at an opening fence's end, Delete does the same with the first code line.
 * - At a closing fence's end, Delete before a line with text is refused: it would join the fence.
 * - At an opening fence's start, Backspace joins a fence that is an item's text into the item above,
 *   as a block of it; takes a blank line above it away; and is refused after text or another block,
 *   which the code can't join.
 * - On a blank line right after a closing fence, Backspace takes the line away, back to the fence's end.
 */
export function joinCodeLines(ctx: CommandContext, node: OutlineNode | null, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const line = doc.lineAt(pos);
  const above = doc.lines[line.index - 1];
  const below = doc.lines[line.index + 1];
  if (dir < 0 && above && isClosingFence(ctx, above) && doc.text.slice(line.from, line.to).trim() === '') {
    return ctx.caret([{ from: above.to, to: line.to, insert: '' }], above.to, ctx.plan);
  }
  if (!node) return null;
  // Delete at the end of the text before an item whose text is a fence: that item joins this node, the
  // caret staying where it is (Backspace's join from the other side)
  if (dir > 0 && below && pos === line.to && node.head && doc.headRange(node)?.to === pos) {
    const next = doc.after(node);
    if (next?.kind === 'item' && next.head?.type === 'code_block' && next.head.fenced && next.startLine === line.index + 1) return joinFencedItem(ctx, next, pos);
  }
  // whether a line is a code line (`isCodeLine` as a plain test, which narrows nothing)
  const code = (l: LineInfo | undefined): boolean => isCodeLine(ctx, l);
  if (code(line)) {
    if (dir < 0) {
      if (pos !== line.contentFrom) return null;
      if (above && code(above)) return codeEdit(ctx, node, [{ from: above.to, to: line.contentFrom, insert: '' }], above.to);
      if (!emptyCode(ctx, line)) return reject('not-expressible', 'the code would join the opening fence');
      return codeEdit(ctx, node, [{ from: above!.to, to: line.to, insert: '' }], above!.to);
    }
    if (pos !== line.to || !below) return null;
    if (code(below)) return codeEdit(ctx, node, [{ from: line.to, to: below.contentFrom, insert: '' }], pos);
    if (!emptyCode(ctx, line)) return reject('not-expressible', 'the closing fence would join the code');
    const changes = [{ from: line.from, to: below.from, insert: '' }];
    return codeEdit(ctx, node, changes, below.contentFrom - (below.from - line.from));
  }
  const block = line.leaf;
  if (block?.type !== 'code_block' || !block.fenced) return null;
  const runStart = skipSpaces(doc.text, line.contentFrom, line.to, 1);
  if (isClosingFence(ctx, line)) {
    if (dir > 0) {
      if (pos !== line.to || !below || doc.text.slice(below.from, below.to).trim() === '') return null;
      return reject('not-expressible', 'the line below would join the closing fence');
    }
    if (pos > runStart) return null;
    if (!above || !code(above)) return reject('not-expressible', 'the fence would join the opening fence');
    if (!emptyCode(ctx, above)) return reject('not-expressible', 'the fence would join the last code line');
    const changes = [{ from: above.from, to: line.from, insert: '' }];
    return codeEdit(ctx, node, changes, pos - (line.from - above.from));
  }
  if (line.index !== block.startLine) return null;
  if (dir > 0) {
    if (pos !== line.to || !below) return null;
    if (!code(below)) return reject('not-expressible', 'the fences would join');
    if (!emptyCode(ctx, below)) return reject('not-expressible', 'the code would join the opening fence');
    return codeEdit(ctx, node, [{ from: line.to, to: below.to, insert: '' }], pos);
  }
  if (pos > runStart) return null;
  // a fence that is an item's text: the item joins the node above, the code a block of it there
  if (node.kind === 'item' && node.head === block) return joinFencedItem(ctx, node);
  if (!above) return null;
  if (blankInQuote(ctx, above)) return ctx.caret([{ from: above.from, to: line.from, insert: '' }], pos - (line.from - above.from), ctx.plan);
  return reject('not-expressible', "the code can't join the text above");
}

/** Whether a code line has no code on it: only the containers' prefix, or spaces. */
function emptyCode(ctx: CommandContext, line: LineInfo): boolean {
  return ctx.doc.text.slice(line.contentFrom, line.to).trim() === '';
}

/**
 * Backspace at the start of an item whose text is a fenced block, or Delete at the end of the text
 * above it: the item joins the item above as any item does, its marker going; its code becomes a block
 * of that item, its children with it. With no item above to hold a block (a paragraph, a heading), it
 * is refused. The caret goes to the end of the text above, as in any join, or stays where Delete was.
 */
function joinFencedItem(ctx: CommandContext, node: OutlineNode, keep?: number): Outcome {
  const { doc } = ctx;
  const prev = doc.before(node);
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  if (prev.kind !== 'item') return reject('not-expressible', `a ${prev.kind} can't hold the code`);
  const { marker: _marker, ...copy } = OutlinePlan.copy(doc, node);
  const block = { ...copy, kind: 'atom' as const, blockType: 'code_block', children: [] };
  const moved = [block, ...node.children];
  const expected = prev === node.parent ? ctx.plan.place('instead', node, moved) : ctx.plan.remove([node]).append(prev, 'last', moved);
  const end = keep ?? doc.headRange(prev)?.to ?? doc.lines[prev.headEndLine]!.to;
  return ctx.encode(expected, {}, (written) => {
    const caret = written.map(end, -1);
    return { anchor: caret, head: caret };
  });
}

/**
 * Enter at the end of a closing fence that ends an item's content: a new item, as at the end of the
 * item's text: its first child when it has child items, else its next sibling (Logseq). Shift-Enter
 * there makes a new line in the item instead (Fence7). Null where that doesn't apply.
 */
export function enterAfterFence(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome | null {
  if (selFrom !== selTo || selFrom !== line.to || !isClosingFence(ctx, line)) return null;
  const item = node.kind === 'item' ? node : node.parent;
  if (item?.kind !== 'item') return null;
  // the fence is the item's text, or its last child before any child items
  const at = node === item ? -1 : item.children.indexOf(node);
  const after = item.children.slice(at + 1);
  if (after.some((child) => child.kind !== 'item')) return null;
  const eol = ctx.ending(line);
  const firstChild = after[0];
  const list = firstChild ? firstChild.block.parent : item.block.parent;
  const gap = list && list.tight === false ? eol : '';
  const insert = eol + gap + (firstChild ? ctx.encoder.siblingPrefix(firstChild) + ctx.encoder.markerText(firstChild, false) : ctx.encoder.siblingPrefix(item) + ctx.encoder.markerText(item, true)) + ' ';
  const caret = line.to + insert.length;
  const fresh = OutlinePlan.created('item', '');
  const expected = firstChild ? ctx.plan.place('before', firstChild, [fresh]) : ctx.plan.place('after', item, [fresh]);
  return ctx.caret([{ from: line.to, to: line.to, insert }], caret, expected);
}
