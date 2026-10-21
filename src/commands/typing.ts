// Typing: characters a plain text box types as they are, where Markdown reads them as structure. A
// code fence's characters, the backtick and the tilde: a fence typed alone takes in everything after
// it, to the end of its container, and an opening fence lengthened alone leaves its block unclosed.

import type { OutlineNode } from '../outline/index.ts';
import type { Block, InlineNode, LineInfo } from '../parser/index.ts';
import { isSpaceOrTab, mapPos, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, isClosingFence, normText } from './context.ts';
import { notApplicable, reject, type CommandPlan, type Outcome } from './plan.ts';
import { closedFence, codeEdit, fenceRefusal, fenceRun, fencesOfLength } from './code.ts';

/**
 * Typed text (`insertText`), a key's worth: ourus's where Markdown reads it as structure, else the
 * host's. So far, a code fence's characters, a backtick and a tilde; typed over a selection, any
 * character, where it would take part of a fence's run.
 */
export function insertText(ctx: CommandContext, text: string): Outcome {
  if (!ctx.collapsed) {
    const broken = overFence(ctx);
    if (broken) return broken;
  }
  return text === '`' || text === '~' ? fenceKey(ctx, text) : notApplicable;
}

/**
 * Typing over a selection that takes part of a closed block's fence (some of its run, or the whole
 * line, but not the block with it): the fence would break, and the block take in what follows
 * (`fenceRefusal`). Null where the selection takes no fence, or whole blocks.
 */
function overFence(ctx: CommandContext): Outcome | null {
  const { doc } = ctx;
  const { from, to } = ctx;
  for (let index = doc.lineAt(from).index; index <= doc.lineAt(to).index; index++) {
    const line = doc.lines[index]!;
    const block = line.leaf;
    if (block?.type !== 'code_block' || !closedFence(ctx, block) || (index !== block.startLine && index !== block.endLine)) continue;
    const run = fenceRun(doc.text, line);
    if (from >= run.to || to <= run.from) continue;
    const whole = from <= doc.lines[block.startLine]!.from && to >= doc.lines[block.endLine]!.to;
    if (!whole) return fenceRefusal(ctx, 'the fence would break');
  }
  return null;
}

/**
 * A backtick or a tilde, by where it is typed: on a fence line, on a code line, where it makes its
 * line open a fence, and (`closeBackticks: all`, backticks) in text.
 */
function fenceKey(ctx: CommandContext, char: '`' | '~'): Outcome {
  const { doc } = ctx;
  const mode = doc.config.closeBackticks;
  if (!ctx.collapsed) return mode === 'all' && char === '`' ? wrapInCode(ctx) : notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);
  const block = line.leaf;
  if (block?.type === 'code_block' && block.fenced) {
    return line.index === block.startLine || isClosingFence(ctx, line) ? onFence(ctx, node, line, pos, char) : onCodeLine(ctx, node, line, pos, char);
  }
  const typed = doc.update([{ from: pos, to: pos, insert: char }]);
  const opened = typed.lines[line.index]!.leaf;
  if (opened?.type === 'code_block' && opened.fenced && opened.startLine === line.index) return mode === 'none' ? notApplicable : closeFence(ctx, node, line, pos, typed.text, char);
  return mode === 'all' && char === '`' ? inlinePair(ctx, node, line, pos) : notApplicable;
}

/**
 * On a fence line: in a fence's run of the typed character, or at either end of it, the run grows,
 * and the block's other fence with it (an unclosed block's fence alone is the host's); elsewhere on
 * the line, the host's where the fence stays one (a backtick in a tilde fence's info string), else
 * refused (a backtick fence's info string can't hold one, nor a closing fence text after it:
 * `fenceRefusal`).
 */
function onFence(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, char: '`' | '~'): Outcome {
  const block = line.leaf!;
  const run = fenceRun(ctx.doc.text, line);
  if (block.fenceChar === char && pos >= run.from && pos <= run.to) {
    if (!closedFence(ctx, block)) return notApplicable;
    const changes = fencesOfLength(ctx, block, run.to - run.from + 1);
    return codeEdit(ctx, node, changes, mapPos(changes, run.from, -1) + (pos - run.from) + 1, 'the fences would no longer match');
  }
  // the block must still end where it did: at the document's end, an unclosed block reads as the same outline
  const refused = fenceRefusal(ctx, `a ${char === '`' ? 'backtick' : 'tilde'} here would break the fence`);
  const now = ctx.doc.update([{ from: pos, to: pos, insert: char }]).lines[block.startLine]!.leaf;
  if (now?.type !== 'code_block' || !now.fenced || now.closed !== block.closed || now.endLine !== block.endLine) return refused;
  const kept = codeEdit(ctx, node, [{ from: pos, to: pos, insert: char }], pos + 1);
  return 'status' in kept ? refused : notApplicable;
}

/**
 * On a code line a backtick or a tilde is code, the host's, unless it would close the block there (a
 * run of the fence's character as long as the opening fence, alone on its line). An unclosed block it
 * closes, the host's too. Right above the closing fence it is that fence typed again, as a text
 * editor's user does: it takes the old one's place, the caret after it. Anywhere else both fences
 * grow past it, so it stays code.
 */
function onCodeLine(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, char: '`' | '~'): Outcome {
  const { doc } = ctx;
  const block = line.leaf!;
  const typed = doc.update([{ from: pos, to: pos, insert: char }]);
  const now = typed.lines[block.startLine]!.leaf;
  if (now?.type !== 'code_block' || !now.closed || now.endLine !== line.index || !closedFence(ctx, block)) return notApplicable;
  const run = fenceRun(typed.text, typed.lines[line.index]!, char);
  if (block.endLine === line.index + 1) {
    const closing = doc.lines[block.endLine]!;
    return codeEdit(ctx, node, [{ from: pos, to: pos, insert: char }, { from: line.to, to: closing.to, insert: '' }], run.to, 'the fence would break');
  }
  const changes = [...fencesOfLength(ctx, block, run.to - run.from + 1), { from: pos, to: pos, insert: char }];
  return codeEdit(ctx, node, changes, mapPos(changes, pos, 1), 'the fences would no longer match');
}

/**
 * A backtick or a tilde that makes its line open a fenced block (the third at a paragraph's or an
 * item's text start): the closing fence, as long, goes on the line below in the line's containers, so
 * the block takes in nothing after it, and the rest of the line is its info string. The caret goes
 * after the opening run, where the info string is typed. What the line was part of splits around the
 * block: lines of its paragraph above stay that paragraph, those below are one of their own, and its
 * list follows them. `typed` is the text with the character typed.
 */
function closeFence(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, typed: string, char: '`' | '~'): Outcome {
  const { doc } = ctx;
  const run = fenceRun(typed, { ...line, to: line.to + 1 }, char);
  const close = ctx.ending(line) + ctx.encoder.continuation(line.prefix) + char.repeat(run.to - run.from);
  const changes: ChangeSpec[] = pos === line.to ? [{ from: pos, to: pos, insert: char + close }] : [{ from: pos, to: pos, insert: char }, { from: line.to, to: line.to, insert: close }];
  const next = doc.update(changes);
  const opened = next.lines[line.index]!.leaf;
  const owner = next.nodeAtLine(line.index);
  const expected = owner && opened?.closed && opened.endLine === line.index + 1 ? typedFence(ctx, node, line, next.nodeText(owner)) : null;
  if (!expected || expected.differenceFrom(next, doc, 'tree') !== null) return reject('not-expressible', "the fence can't be closed below it");
  return ctx.caret(changes, run.to, expected);
}

/**
 * The outline once line `line` of `node`'s text is a fenced block reading `code`: an item whose text
 * starts there has the block as its text; otherwise the lines above stay the node's text, and the
 * block, then the lines below as a paragraph, follow it (in an item or under a callout's title, as
 * its first children). Null for any other node (a setext title's line).
 */
function typedFence(ctx: CommandContext, node: OutlineNode, line: LineInfo, code: string): OutlinePlan | null {
  const { doc } = ctx;
  if ((node.kind !== 'paragraph' && node.kind !== 'item' && node.kind !== 'quote') || node.head?.type !== 'paragraph') return null;
  const lines = doc.headLines(node);
  const k = line.index - node.head.startLine;
  if (k < 0 || k >= lines.length) return null;
  const before = lines.slice(0, k);
  const after = lines.slice(k + 1);
  const rest = after.length ? [OutlinePlan.created('paragraph', normText(after))] : [];
  if (node.kind === 'item' && k === 0) return ctx.plan.update(node, (n) => ({ ...n, blockType: 'code_block', text: code, children: [...rest, ...n.children] }));
  const block: OutlinePlanNode = { ...OutlinePlan.created('atom', code), blockType: 'code_block' };
  if (node.kind !== 'paragraph') return k === 0 ? null : ctx.plan.update(node, (n) => ({ ...n, text: normText(before), children: [block, ...rest, ...n.children] }));
  const kept = before.length ? [{ ...OutlinePlan.editable(node), text: normText(before), children: [] }] : [];
  return ctx.plan.place('instead', node, [...kept, block, ...rest, ...node.children]);
}

/**
 * A hand-written edit of one node's text, where the outline stays: the plan, with the caret at
 * `caret`; null where the edit would change the outline.
 */
function inText(ctx: CommandContext, node: OutlineNode, changes: ChangeSpec[], caret: number): CommandPlan | null {
  const plan = codeEdit(ctx, node, changes, caret);
  return 'status' in plan ? null : plan;
}

/** Whether a line's leaf has inline text (a paragraph, a heading, a table row), where a code span can be. */
const hasInlines = (ctx: CommandContext, leaf: Block | null): leaf is Block => !!leaf && ctx.doc.syntaxTree.inlineText(leaf) !== null;

/**
 * `closeBackticks: all`, a backtick in text: typed right before the closing backtick of an empty pair,
 * or before any of the code span's closing run the caret is in, it steps over it; at a word boundary outside code, it is typed
 * as a pair, the caret between; anywhere else, the host's.
 */
function inlinePair(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  if (!hasInlines(ctx, line.leaf) || pos < doc.textStart(pos)) return notApplicable;
  const text = doc.text;
  const before = pos > doc.textStart(pos) ? text[pos - 1]! : '';
  const after = pos < line.to ? text[pos]! : '';
  const span = codeSpanAt(ctx, line.leaf, pos);
  const emptyPair = before === '`' && after === '`' && text[pos - 2] !== '`' && text[pos + 1] !== '`';
  if (after === '`' && (span ? pos >= span.closer && pos < span.end : emptyPair)) return ctx.caret([], pos + 1, ctx.plan);
  if (span) return notApplicable;
  const boundary = (c: string, punctuation: string): boolean => c === '' || isSpaceOrTab(c.charCodeAt(0)) || punctuation.includes(c);
  if (!boundary(before, '([{<\'"') || !boundary(after, ')]}>,.;:!?\'"')) return notApplicable;
  return inText(ctx, node, [{ from: pos, to: pos, insert: '``' }], pos + 1) ?? notApplicable;
}

/** The code span `pos` is inside (past its first backtick), with where its closing run starts and ends; null outside one. */
function codeSpanAt(ctx: CommandContext, leaf: Block, pos: number): { closer: number; end: number } | null {
  const { syntaxTree } = ctx.doc;
  const inline = syntaxTree.inlineText(leaf)!;
  const at = inline.textAt(pos);
  if (at < 0) return null;
  const find = (nodes: readonly InlineNode[]): InlineNode | null => {
    for (const n of nodes) {
      if (n.type === 'code' && n.from < at && at < n.to) return n;
      const inner = n.children && n.from < at && at < n.to ? find(n.children) : null;
      if (inner) return inner;
    }
    return null;
  };
  const span = find(syntaxTree.inlines(leaf));
  if (!span) return null;
  let closer = span.to;
  while (closer > span.from && inline.text[closer - 1] === '`') closer--;
  return { closer: inline.sourceAt(closer), end: inline.sourceAt(span.to) };
}

/**
 * `closeBackticks: all`, a backtick over a selection within one line of a node's text: the selection
 * becomes code, with a run longer than any inside it on each side (and a space inside where it starts
 * or ends with a backtick), and stays selected.
 */
function wrapInCode(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const { from, to } = ctx;
  const line = doc.lineAt(from);
  const node = doc.nodeAt(from);
  if (!node || to > line.to || !hasInlines(ctx, line.leaf) || from < doc.textStart(from)) return notApplicable;
  const selected = doc.text.slice(from, to);
  const fence = '`'.repeat(Math.max(0, ...(selected.match(/`+/g) ?? []).map((r) => r.length)) + 1);
  const pad = selected.startsWith('`') || selected.endsWith('`') ? ' ' : '';
  const open = fence + pad;
  const plan = inText(ctx, node, [{ from, to: from, insert: open }, { from: to, to, insert: pad + fence }], to + open.length);
  if (!plan) return notApplicable;
  const shift = (p: number): number => p + open.length;
  return { ...plan, selection: { anchor: shift(ctx.sel.anchor), head: shift(ctx.sel.head) } };
}

/**
 * `closeBackticks: all`, Backspace between the two backticks of an empty pair in text: both go, as
 * they came. Null anywhere else.
 */
export function deleteEmptyPair(ctx: CommandContext): Outcome | null {
  const { doc } = ctx;
  if (doc.config.closeBackticks !== 'all' || !ctx.collapsed) return null;
  const pos = ctx.sel.head;
  const text = doc.text;
  if (text[pos - 1] !== '`' || text[pos] !== '`' || text[pos - 2] === '`' || text[pos + 1] === '`') return null;
  const node = doc.nodeAt(pos);
  const line = doc.lineAt(pos);
  if (!node || !hasInlines(ctx, line.leaf) || pos - 1 < doc.textStart(pos)) return null;
  return inText(ctx, node, [{ from: pos - 1, to: pos + 1, insert: '' }], pos - 1);
}
