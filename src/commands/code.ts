// Fenced code: Enter, Backspace and Delete on code lines and fences.

import type { OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlinePlan } from '../encoder/index.ts';
import { CommandContext, isClosingFence, isCodeLine } from './context.ts';
import { notApplicable, reject, type Outcome, type CommandPlan } from './plan.ts';
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
  // a fence moved down from its line start leaves no trailing whitespace behind, only quote markers
  const bare = (opening || closing) && selFrom <= runStart;
  const changes = bare
    ? [{ from: line.from, to: selTo, insert: prefix.trimEnd() + eol + prefix }]
    : [{ from: selFrom, to: selTo, insert: eol + prefix + own }];
  const caret = changes[0]!.from + changes[0]!.insert.length;
  const next = doc.update(changes);
  return ctx.caret(changes, caret, ctx.plan.setText(node, next.nodeText(next.nodeAt(caret) ?? node)));
}

/** An edit of a fenced block's code lines: the outline stays, the block's text changing. */
export function codeEdit(ctx: CommandContext, node: OutlineNode, changes: ChangeSpec[], caret: number): CommandPlan {
  const { doc } = ctx;
  const next = doc.update(changes);
  return ctx.caret(changes, caret, ctx.plan.setText(node, next.nodeText(next.nodeAt(caret) ?? node)));
}

/**
 * Backspace at the start of a code line joins it to the code line above, and Delete at the end of
 * one joins the code line below: the line break goes with the containers' prefix on the next line
 * (an item's indentation, a quote's `>`), which isn't code. Against a fence line it is refused: the
 * code would join the fence. Null where that doesn't apply.
 */
export function joinCodeLines(ctx: CommandContext, node: OutlineNode, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const line = doc.lineAt(pos);
  if (!isCodeLine(ctx, line)) return null;
  if (dir < 0) {
    if (pos !== line.contentFrom) return null;
    const prev = doc.lines[line.index - 1]!;
    if (!isCodeLine(ctx, prev)) return reject('not-expressible', 'the code would join the opening fence');
    return codeEdit(ctx, node, [{ from: prev.to, to: line.contentFrom, insert: '' }], prev.to);
  }
  if (pos !== line.to) return null;
  const next = doc.lines[line.index + 1];
  if (!next) return null;
  if (!isCodeLine(ctx, next)) return reject('not-expressible', 'the closing fence would join the code');
  return codeEdit(ctx, node, [{ from: line.to, to: next.contentFrom, insert: '' }], pos);
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
