// Fenced code: Enter, Backspace and Delete on code lines and fences, a fence's run kept matched.

import type { OutlineNode } from '../outline/index.ts';
import type { Block, LineInfo } from '../parser/index.ts';
import { advanceColumns, isSpaceOrTab, mapPos, skipSpaces, trimMd, trimMdEnd, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, blankInQuote, isClosingFence, isCodeLine, normText, removeLines, runsOnto, textEnd } from './context.ts';
import { notApplicable, reject, type CommandPlan, type Outcome } from './plan.ts';
import { insertBefore } from './enter.ts';

/**
 * Enter in a fenced code block: a new line, split at the caret, which stays in the containers the
 * block is in (an item's continuation indentation, a quote's `>`). On a code line it takes the line's
 * own indentation too, and is ourus's only with `handleFenceContents` (else the host's: it may edit
 * code itself). On a fence line it is always ourus's: inside the run of backticks or tildes it is
 * refused, since a new line there would break the fence.
 */
export function fenceNewline(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number, isEnter = false): Outcome {
  const { doc } = ctx;
  if (selFrom < line.contentFrom) return notApplicable;
  const text = doc.text;
  const block = line.leaf!;
  let runStart = line.contentFrom;
  runStart = skipSpaces(text, runStart, line.to, 1);
  let runEnd = runStart;
  while (runEnd < line.to && text[runEnd] === block.fenceChar) runEnd++;
  const opening = line.index === block.startLine;
  const closing = !opening && line.index === block.endLine && runEnd - runStart >= block.fenceLength! && trimMd(text.slice(runEnd, line.to)) === '';
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
  // Enter at a closing fence's end (an item's is `enterAfterFence`'s): an empty paragraph after the
  // block, held by a placeholder, set off by a blank line from text below that would run into it
  if (closing && selFrom === selTo && selFrom >= runEnd && node.kind === 'atom' && isEnter) {
    const next = doc.lines[line.index + 1];
    const apart = next && !blankInQuote(ctx, next) && runsOnto(ctx, text.slice(next.from + (line.contentFrom - line.from), next.to)) ? eol + trimMdEnd(prefix) : '';
    const insert = eol + prefix;
    const caret = line.to + insert.length;
    const expected = ctx.plan.place('after', node, [OutlinePlan.created('paragraph', '')]);
    return ctx.caret([{ from: line.to, to: line.to, insert: insert + apart }], caret, expected, { placeholders: [caret] });
  }
  const atRun = (opening || closing) && selFrom <= runStart;
  // at a closing fence's start: an empty last code line, the caret on it, not on the fence, where
  // typing would unmake it
  if (closing && atRun) {
    const changes = [{ from: line.from, to: selTo, insert: prefix + eol + text.slice(line.from, selFrom) }];
    return codeEdit(ctx, node, changes, line.from + prefix.length);
  }
  // a fence moved down from its line start leaves no trailing whitespace behind, only quote markers
  const changes = atRun
    ? [{ from: line.from, to: selTo, insert: trimMdEnd(prefix) + eol + prefix }]
    : [{ from: selFrom, to: selTo, insert: eol + prefix + own }];
  return codeEdit(ctx, node, changes, changes[0]!.from + changes[0]!.insert.length);
}

/**
 * An edit of a block's code lines: the outline stays, the block's text changing. Where the edit would
 * make a fence of code (a line of backticks closing the block early), a fenced block's fences grow
 * past it, as WorkFlowy and Tana write them; a block whose fence can't grow (`$$`, `%%`) refuses it.
 */
export function codeEdit(ctx: CommandContext, node: OutlineNode, changes: ChangeSpec[], caret: number, refusal = 'the code would make a fence'): Outcome {
  const { doc } = ctx;
  const attempt = (all: ChangeSpec[], at: number): Outcome | null => {
    const next = doc.update(all);
    const expected = ctx.plan.setText(node, next.nodeText(next.nodeAt(at) ?? node));
    return expected.differenceFrom(next, doc, 'tree') === null ? ctx.caret(all, at, expected) : null;
  };
  const done = attempt(changes, caret);
  if (done) return done;
  const block = [doc.lineAt(changes[0]!.from).leaf, doc.lineAt(changes[0]!.to).leaf].find((b) => b?.type === 'code_block' && b.fenced);
  if (block) {
    // the opening fence, and the closing one where the block has it, one character longer at a time
    const opening = fenceRun(doc.text, doc.lines[block.startLine]!).to;
    const last = doc.lines[block.endLine]!;
    const closing = block.endLine > block.startLine && isClosingFence(ctx, last) ? fenceRun(doc.text, last).to : null;
    for (let more = 1; more <= 8; more++) {
      const grow = block.fenceChar!.repeat(more);
      const fences = [{ from: opening, to: opening, insert: grow }, ...(closing !== null ? [{ from: closing, to: closing, insert: grow }] : [])];
      const grown = attempt([...changes, ...fences], caret + (opening <= caret ? more : 0));
      if (grown) return grown;
    }
  }
  return reject('not-expressible', refusal);
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
  // at the start of a `$$` or `%%` that opens the block, as at a code fence's: at the start of an
  // item's text, Enter is at the item's text start; elsewhere a line opens above the block, which
  // stays with the caret, keeping only its containers' markers
  if (opensBlock(line) && selFrom === selTo && selFrom <= indentEnd) {
    if (node.kind === 'item' && node.head === line.leaf) return insertBefore(ctx, node, selFrom, '');
    const prefix = ctx.encoder.continuation(line.prefix);
    const insert = trimMdEnd(prefix) + ctx.ending(line) + prefix;
    return codeEdit(ctx, node, [{ from: line.from, to: selTo, insert }], line.from + insert.length);
  }
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
  const block = line.leaf!;
  if (block.type === 'code_block') return joinIndentedCode(ctx, node, line, pos, dir);
  // at the start of a `$$` or `%%` that opens the block, as at a code fence's
  if (dir < 0 && opensBlock(line) && pos <= skipSpaces(doc.text, line.contentFrom, line.to, 1)) return atOpening(ctx, node, line, pos, block.type === 'math_block' ? 'math' : 'comment');
  const other = doc.lines[line.index + dir];
  if (!other || other.leaf !== line.leaf) return null;
  // the first line of a block that is an item's text: the item joins the item above, taking Enter's
  // split back, as on a code line (Fence55)
  if (dir < 0 && other.index === block.startLine && node.kind === 'item' && node.head === block && pos === line.contentFrom && trimMd(doc.text.slice(line.contentFrom, line.to)) !== '') return joinFencedItem(ctx, node, 'code');
  // as at a code fence: against a `$$` or `%%` line a line with text on it is refused, an empty one
  // just goes
  const fence = (l: LineInfo): boolean =>
    (block.type === 'math_block' || block.type === 'comment_block') && (l.index === block.startLine || (l.index === block.endLine && l.index > block.startLine && /(\$\$|%%)[ \t]*$/.test(doc.text.slice(l.contentFrom, l.to))));
  if (fence(line) || fence(other)) {
    const content = fence(line) ? other : line;
    if (fence(content) || trimMd(doc.text.slice(content.contentFrom, content.to)) !== '') {
      if (dir < 0 ? pos !== line.contentFrom : pos !== line.to) return null;
      return reject('not-expressible', 'the text would join the fence');
    }
  }
  const refusal = `the lines would end the ${block.type.replace('_', ' ')}`;
  if (dir < 0) return pos === line.contentFrom ? codeEdit(ctx, node, [{ from: other.to, to: line.contentFrom, insert: '' }], other.to, refusal) : null;
  return pos === line.to ? codeEdit(ctx, node, [{ from: line.to, to: other.contentFrom, insert: '' }], pos, refusal) : null;
}

/** Whether `line` opens a math or comment block of more than one line with its `$$` or `%%`. */
function opensBlock(line: LineInfo): boolean {
  const block = line.leaf;
  return !!block && (block.type === 'math_block' || block.type === 'comment_block') && line.index === block.startLine && block.endLine > block.startLine;
}

/**
 * Backspace at the start of a block's opening fence (a code fence, a `$$` or `%%`): a block that is an
 * item's text joins the item above, as a block of it; a blank line above goes, the line Enter opened
 * there; after text, which the block can't join, it is refused. Null at the document's start.
 */
function atOpening(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, what: string): Outcome | null {
  const { doc } = ctx;
  if (node.kind === 'item' && node.head === line.leaf) return joinFencedItem(ctx, node);
  const above = doc.lines[line.index - 1];
  if (!above) return null;
  if (blankInQuote(ctx, above)) {
    const changes = [{ from: above.from, to: line.from, insert: '' }];
    // where the blank line kept the block from reading as more of the text above, it stays
    if (ctx.plan.differenceFrom(doc.update(changes), doc, 'tree') !== null) return reject('not-expressible', `the ${what} can't join the text above`);
    return ctx.caret(changes, pos - (line.from - above.from), ctx.plan);
  }
  return reject('not-expressible', `the ${what} can't join the text above`);
}

/** Where an indented code line's code starts: past the block's four columns of indentation (or at its end). */
function indentedCodeStart(ctx: CommandContext, line: LineInfo): number {
  const text = ctx.doc.text;
  let pos = line.contentFrom;
  while (pos < line.to && isSpaceOrTab(text.charCodeAt(pos)) && advanceColumns(text, line.contentFrom, pos, line.contentColumn) - line.contentColumn < 4) pos++;
  return pos;
}

/**
 * Backspace at the start of an indented code line's code (anywhere in the block's four columns) and
 * Delete at its end: the lines join, the four columns going with the line break, as the containers'
 * prefix does; a blank line of the block next to it just goes. At the block's first line, after the
 * text above, Backspace is refused: without the blank line between them, the code would be more of
 * that text. Null where that doesn't apply.
 */
function joinIndentedCode(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const start = indentedCodeStart(ctx, line);
  const other = doc.lines[line.index + dir];
  const inBlock = !!other && other.leaf === line.leaf;
  if (dir < 0) {
    if (pos < line.contentFrom || pos > start) return null;
    if (!inBlock) return line.index > 0 && doc.nodeAtLine(line.index) && gapAbove(ctx, line) ? reject('not-expressible', "the code can't join the text above") : null;
    if (other.blank) return codeEdit(ctx, node, [{ from: other.from, to: line.from, insert: '' }], start - (line.from - other.from));
    return codeEdit(ctx, node, [{ from: other.to, to: start, insert: '' }], other.to);
  }
  if (pos !== line.to || !inBlock) return null;
  if (other.blank) return codeEdit(ctx, node, [{ from: line.to, to: other.to, insert: '' }], pos);
  return codeEdit(ctx, node, [{ from: line.to, to: indentedCodeStart(ctx, other), insert: '' }], pos);
}

/** Whether a node's line is somewhere above `line`, past blank lines: something the line could join. */
function gapAbove(ctx: CommandContext, line: LineInfo): boolean {
  for (let i = line.index - 1; i >= 0; i--) if (!ctx.doc.lines[i]!.blank) return true;
  return false;
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
  if (dir < 0 && above && isClosingFence(ctx, above) && trimMd(doc.text.slice(line.from, line.to)) === '') {
    // an empty paragraph held there (Enter after the fence made it) goes with the line, the list it
    // owns (right below) back in its place
    const held = doc.nodeAtLine(line.index);
    const expected = held?.kind === 'paragraph' ? ctx.plan.place('instead', held, held.children) : ctx.plan;
    const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === line.index);
    return ctx.caret([{ from: above.to, to: line.to, insert: '' }], above.to, expected, { drop });
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
      // the code of an item whose text is the fence: the item joins the item above, as from the fence's
      // start, taking Enter's split back (Fence31), the caret staying at the code's start
      if (!emptyCode(ctx, line) && node.kind === 'item' && node.head === line.leaf) return joinFencedItem(ctx, node, 'code');
      if (!emptyCode(ctx, line)) return reject('not-expressible', 'the code would join the opening fence');
      return codeEdit(ctx, node, [{ from: above!.to, to: line.to, insert: '' }], above!.to);
    }
    if (pos !== line.to || !below) return null;
    if (code(below)) return codeEdit(ctx, node, [{ from: line.to, to: below.contentFrom, insert: '' }], pos);
    if (!emptyCode(ctx, line)) return reject('not-expressible', 'the closing fence would join the code');
    // the caret to the end of the line above, the code's or the opening fence's: before the closing
    // fence, typing would unmake the block
    const changes = [{ from: line.from, to: below.from, insert: '' }];
    return codeEdit(ctx, node, changes, above!.to);
  }
  const block = line.leaf;
  if (block?.type !== 'code_block' || !block.fenced) return null;
  const runStart = skipSpaces(doc.text, line.contentFrom, line.to, 1);
  if (line.index === block.startLine || isClosingFence(ctx, line)) {
    const run = deleteInFenceRun(ctx, node, line, pos, dir);
    if (run) return run;
  }
  if (isClosingFence(ctx, line)) {
    if (dir > 0) {
      if (pos !== line.to || !below || trimMd(doc.text.slice(below.from, below.to)) === '') return null;
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
  return atOpening(ctx, node, line, pos, 'code');
}

/** A fence line's run of backticks or tildes in `text`, from its first to past its last: its block's fence character, or `char`. */
export function fenceRun(text: string, line: LineInfo, char = line.leaf!.fenceChar!): { from: number; to: number } {
  const from = skipSpaces(text, line.contentFrom, line.to, 1);
  let to = from;
  while (to < line.to && text[to] === char) to++;
  return { from, to };
}

/** Whether `block` is a fenced code block closed by a fence of its own (not by its container's or the document's end). */
/**
 * Backspace or Delete of a character on a line of a fenced block's code (or a math or comment block's),
 * not at its ends (where lines join): the host's, but where it would make a fence of code
 * (`x```` → ```` ``` ````, closing the block early), `codeEdit`'s: the fences grow past it, or, where
 * they can't (`$$`, `%%`), it is refused.
 */
export function deleteInCode(ctx: CommandContext, node: OutlineNode | null, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const line = doc.lineAt(pos);
  const leaf = line.leaf;
  const fenced = leaf?.type === 'code_block' && leaf.fenced;
  if (!node || !leaf || !(fenced || leaf.type === 'math_block' || leaf.type === 'comment_block') || line.index === leaf.startLine) return null;
  // a closing fence is markup, as the opening one
  if (fenced ? line.index === leaf.endLine && closedFence(ctx, leaf) : line.index === leaf.endLine && /^(\$\$|%%)$/.test(trimMd(doc.text.slice(line.contentFrom, line.to)))) return null;
  const [from, to] = dir < 0 ? [pos - 1, pos] : [pos, pos + 1];
  // in the line's indentation (its containers', a partly consumed tab), the host's, as before
  if (from < line.contentFrom || to > line.to || trimMd(doc.text.slice(line.from, to)) === '') return null;
  const changes = [{ from, to, insert: '' }];
  const next = doc.update(changes);
  if (ctx.plan.setText(node, next.nodeText(next.nodeAt(from) ?? node)).differenceFrom(next, doc, 'tree') === null) return null;
  return codeEdit(ctx, node, changes, from);
}

export function closedFence(ctx: CommandContext, block: Block): boolean {
  return block.type === 'code_block' && !!block.fenced && !!block.closed && block.endLine > block.startLine && isClosingFence(ctx, ctx.doc.lines[block.endLine]!);
}

/**
 * The changes setting a closed block's two fence runs to `length`, each line keeping its own
 * indentation and what follows its run: an opening longer than its closing fence would leave the
 * block unclosed, so the two change together, and match.
 */
export function fencesOfLength(ctx: CommandContext, block: Block, length: number): ChangeSpec[] {
  return [block.startLine, block.endLine].map((index) => {
    const run = fenceRun(ctx.doc.text, ctx.doc.lines[index]!);
    return { from: run.from, to: run.to, insert: block.fenceChar!.repeat(length) };
  });
}

/**
 * Backspace and Delete on a character of a closed block's fence run: the run shortens, and the
 * block's other fence with it, so the two still match. A fence is three or more, so at three: from
 * the opening fence of an empty pair with no info string, the fences go back to the text they were
 * typed from (the closing fence goes, the inverse of typing the opening one); any other empty block
 * goes, as an empty item does, info string and all; a block with code is refused (`fenceRefusal`).
 * An unclosed block's fence is the host's. Null where the deleted character isn't in a run.
 */
function deleteInFenceRun(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  const block = line.leaf!;
  const run = fenceRun(doc.text, line);
  const at = dir < 0 ? pos - 1 : pos;
  if (at < run.from || at >= run.to || !closedFence(ctx, block)) return null;
  const length = run.to - run.from - 1;
  if (length >= 3) {
    const changes = fencesOfLength(ctx, block, length);
    return codeEdit(ctx, node, changes, mapPos(changes, run.from, -1) + (at - run.from), 'the fences would no longer match');
  }
  for (let index = block.startLine + 1; index < block.endLine; index++) {
    if (!emptyCode(ctx, doc.lines[index]!)) return fenceRefusal(ctx, 'the fence would break: the block has code');
  }
  const opening = doc.lines[block.startLine]!;
  const closing = doc.lines[block.endLine]!;
  if (line.index !== block.startLine || block.endLine !== line.index + 1 || trimMd(doc.text.slice(run.to, line.to)) !== '') return removeEmptyBlock(ctx, node, opening, closing, dir);
  const changes = [{ from: at, to: at + 1, insert: '' }, { from: line.to, to: closing.to, insert: '' }];
  const left = trimMd(doc.text.slice(run.from, line.to).replace(block.fenceChar!, ''));
  const expected = unfenced(ctx, node, left);
  if (expected.differenceFrom(doc.update(changes), doc, 'tree') !== null) return reject('not-expressible', 'the fence would break');
  return ctx.caret(changes, at, expected);
}

/**
 * A fence edit that would break its block, which ourus doesn't make: refused where markup is
 * decorated; where it is text the user edits (`markup: text`), the host's, as any edit in markup
 * there, the reason as `detail`.
 */
export function fenceRefusal(ctx: CommandContext, detail: string): Outcome {
  return ctx.doc.config.markup === 'text' ? { status: 'notApplicable', detail } : reject('not-expressible', detail);
}

/**
 * An empty block going as a unit, its fences, info string and blank lines: an atom goes, with a quote
 * it is all of, the caret to the end of the text above (from Delete, where the block was); as the
 * document's only node, the document is empty but for its last line ending. An item whose text it was
 * is an empty item, the caret in it.
 */
function removeEmptyBlock(ctx: CommandContext, node: OutlineNode, opening: LineInfo, closing: LineInfo, dir: -1 | 1): Outcome {
  const { doc } = ctx;
  if (node.kind === 'item') {
    const from = fenceRun(doc.text, opening).from;
    return ctx.caret([{ from, to: closing.to, insert: '' }], from, ctx.plan.update(node, (n) => ({ id: n.id, kind: 'item', text: '', children: n.children })));
  }
  // a quote without text the block is all of goes with it: its `>` alone is no node
  let gone = node;
  for (let parent = node.parent; parent?.kind === 'quote' && !parent.head && parent.children.length === 1; parent = parent.parent) gone = parent;
  const expected = ctx.plan.remove([gone]);
  const from = doc.lines[gone.startLine]!.from;
  if (!expected.root.children.length && trimMd(doc.text.slice(0, from)) === '' && trimMd(doc.text.slice(doc.lines[doc.lastDescendant(gone).endLine]!.to)) === '') {
    const end = /\r?\n$|\r$/.exec(doc.text)?.[0].length ?? 0;
    return ctx.caret([{ from: 0, to: doc.text.length - end, insert: '' }], 0, expected);
  }
  const prev = doc.before(gone);
  const at = dir < 0 && prev && prev.kind !== 'root' ? textEnd(ctx, prev) : from;
  return ctx.encode(expected, {}, (written) => {
    const caret = written.map(at, -1);
    return { anchor: caret, head: caret };
  });
}

/**
 * The outline once an empty block's fences are text again, `left` the line they leave: an atom a
 * paragraph, joined by a paragraph right above it and one right after its closing fence, as their
 * lines then run together; an item whose text was the block, that text, with a first child paragraph
 * right after the closing fence.
 */
function unfenced(ctx: CommandContext, node: OutlineNode, left: string): OutlinePlan {
  const { doc } = ctx;
  const siblings = node.kind === 'item' ? node.children : node.parent!.children;
  const at = node.kind === 'item' ? -1 : siblings.indexOf(node);
  const above = at > 0 ? siblings[at - 1] : undefined;
  const below = siblings[at + 1];
  const isParagraph = (n: OutlineNode | undefined): n is OutlineNode => n?.kind === 'paragraph' && n.head?.type === 'paragraph';
  const prev = isParagraph(above) && above.head!.endLine === node.startLine - 1 ? above : undefined;
  const next = isParagraph(below) && below.startLine === node.head!.endLine + 1 ? below : undefined;
  const text = normText([...(prev ? doc.headLines(prev) : []), left, ...(next ? doc.headLines(next) : [])]);
  // a new item to verification: its text is a paragraph now, which a copy of the old one can't say
  if (node.kind === 'item') return ctx.plan.update(node, (n) => ({ id: n.id, kind: 'item', text, children: n.children.filter((c) => c !== next) }));
  let plan = ctx.plan;
  if (next) plan = plan.remove([next]);
  if (prev) plan = plan.remove([prev]);
  const paragraph = prev ? { ...OutlinePlan.editable(prev), text, children: [] } : OutlinePlan.created('paragraph', text);
  return plan.place('instead', node, [paragraph, ...(next ? next.children : [])]);
}

/** Whether a code line has no code on it: only the containers' prefix, or spaces. */
function emptyCode(ctx: CommandContext, line: LineInfo): boolean {
  return trimMd(ctx.doc.text.slice(line.contentFrom, line.to)) === '';
}

/**
 * Backspace at the start of an item whose text is a fenced block, or Delete at the end of the text
 * above it: the item joins the item above as any item does, its marker going; its code becomes a block
 * of that item, after its last block, its children with it. With no item above to hold a block (a
 * paragraph or a heading outside a list), it is refused. The caret goes to the end of the text above,
 * as in any join, or stays where Delete was (`keep`), or at the code's start (`'code'`: Backspace
 * there, Fence31).
 */
function joinFencedItem(ctx: CommandContext, node: OutlineNode, keep?: number | 'code'): Outcome {
  const { doc } = ctx;
  const prev = doc.before(node);
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  // into an empty item above, the item takes its place, as text moves up into one: the empty item
  // goes, the caret to the code's first line (after the opening fence where it has none)
  if (prev.kind === 'item' && prev.children.length === 0 && doc.isEmpty(prev) && typeof keep !== 'number') {
    const changes = removeLines(ctx, [prev.startLine]);
    const first = doc.lines[node.startLine + 1];
    const at = first && first.index <= node.head!.endLine && !isClosingFence(ctx, first) ? skipSpaces(doc.text, first.contentFrom, first.to, 1) : doc.lines[node.startLine]!.to;
    return ctx.caret(changes, mapPos(changes, at, 1), ctx.plan.remove([prev]));
  }
  // the item the node above is, or whose block it is
  let holder: OutlineNode | null = prev;
  while (holder && holder.kind !== 'item') holder = holder.parent;
  const holds = (n: OutlineNode): boolean => {
    for (let p = node.parent; p; p = p.parent) if (p === n) return true;
    return false;
  };
  if (!holder || (holder !== node.parent && holds(holder))) return reject('not-expressible', `a ${prev.kind} can't hold the code`);
  const { marker: _marker, ...copy } = OutlinePlan.copy(doc, node);
  // an atom's text is its lines as written, the code's indentation kept (an item's is trimmed)
  const block = { ...copy, kind: 'atom' as const, blockType: node.head!.type, text: copy.lines!.join('\n'), children: [] };
  const moved = [block, ...node.children];
  const expected = holder === node.parent ? ctx.plan.place('instead', node, moved) : ctx.plan.remove([node]).append(holder, 'last', moved);
  const end = typeof keep === 'number' ? keep : (doc.headRange(prev)?.to ?? doc.lines[prev.headEndLine]!.to);
  const encoded = (): Outcome =>
    ctx.encode(expected, {}, (written) => {
      const caret = keep === 'code' ? written.at(block, 1, 0) : written.map(end, -1);
      return { anchor: caret, head: caret };
    });
  if (holder === node.parent || node.children.length > 0 || prev === holder) return encoded();
  // a block of the item above, after another of its blocks: its marker becomes that item's
  // indentation, and the lines around it stay as they are, the blank lines above it too, which were
  // the block's (Fence31b; right after the item's text they were the list's, and go, as the encoder
  // writes it); the encoder writes what that doesn't
  const line = doc.lines[node.startLine]!;
  const from = doc.markerFrom(node.block);
  const column = advanceColumns(doc.text, line.from, from, 0);
  const changes = [{ from, to: line.contentFrom, insert: ' '.repeat(advanceColumns(doc.text, from, line.contentFrom, column) - column) }];
  const caret = keep === 'code' ? mapPos(changes, ctx.sel.head, 1) : mapPos(changes, end, -1);
  const fallback = (): CommandPlan | null => {
    const plan = encoded();
    return 'changes' in plan ? plan : null;
  };
  return { ...ctx.caret(changes, caret, expected), fallback };
}

/**
 * Enter at the start of an opening fence in an item, the fenced block one of the item's blocks after
 * its text: the item splits there, as Enter splits an item's text. The block goes to a new item as
 * its text, with the item's blocks after it: its next sibling (`enterMidItem: sibling`), or in its
 * place among the item's children (`child`). The caret goes to the code's first line, where typing
 * goes into the code. Null where that doesn't apply.
 */
export function splitAtFence(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome | null {
  const { doc } = ctx;
  const block = line.leaf!;
  const item = node.parent;
  const fenced = (block.type === 'code_block' && block.fenced) || opensBlock(line);
  if (!fenced || selFrom !== selTo || node.kind !== 'atom' || item?.kind !== 'item' || line.index !== block.startLine || selFrom > skipSpaces(doc.text, line.contentFrom, line.to, 1)) return null;
  const at = item.children.indexOf(node);
  const after = item.children.slice(at + 1);
  const copy = OutlinePlan.copy(doc, node);
  const sibling = doc.config.enterMidItem === 'sibling';
  // an item's text is trimmed, as an item's text reads (an atom's keeps the code's indentation)
  const fresh: OutlinePlanNode = { ...copy, kind: 'item', text: normText(copy.lines!), marker: ctx.encoder.markerText(item, sibling), children: sibling ? after : [] };
  const expected = sibling
    ? ctx.plan.update(item, (n) => ({ ...n, children: item.children.slice(0, at) })).place('after', item, [fresh])
    : ctx.plan.place('instead', node, [fresh]);
  // the code's first line, at its text, or after the opening fence where the block has none
  const codeLines = (copy.lines?.length ?? 0) - (block.closed ? 2 : 1);
  return ctx.encode(expected, {}, (written) => {
    const caret = codeLines > 0 ? written.at(fresh, 1, /^[ \t]*/.exec(copy.lines![1]!)![0].length) : written.at(fresh, 0, copy.lines![0]!.length);
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
