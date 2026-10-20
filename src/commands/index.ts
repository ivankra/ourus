// Commands: what the keys of an outliner do to Markdown text. The public API is `executeCommand`
// and `settlePlaceholders` and their types; each family of commands is a file of its own, the
// structural ones the lowest (Enter and the joins call them, never the reverse).

import { OutlineState } from '../outline/index.ts';
import { composeChanges, isSpaceOrTab, trimMd, trimMdEnd, type ChangeSpec } from '../text.ts';
import { CommandContext, gapOwner, isCodeLine, isFenceLine, noOperands, operands } from './context.ts';
import { adjacentIndentedCode, emptyAwayFromCaret, indentedCodeAfterItem, notApplicable, reject, run, type Outcome } from './plan.ts';
import { deleteSubtree, duplicate, headingLevel, indent, indentParagraphs, leaveQuote, move, outdent } from './structure.ts';
import { lineBreak, split } from './enter.ts';
import { isPayloadLine } from './code.ts';
import { paste, pastePlain } from './paste.ts';
import { deleteToTextStart, join, joinForward } from './join.ts';

export { settlePlaceholders } from './settle.ts';

export type Command =
  | { readonly type: 'indent' }
  | { readonly type: 'outdent' }
  | { readonly type: 'moveSubtreeUp' }
  | { readonly type: 'moveSubtreeDown' }
  /** Enter: split the node at the caret. */
  | { readonly type: 'enter' }
  /** Shift-Enter: a line break inside the node's text, which stays one node. */
  | { readonly type: 'shiftEnter' }
  /** Backspace at the start of a node: join it to the node above. */
  | { readonly type: 'deleteContentBackward' }
  /** Delete at the end of a node: join the node below to it. */
  | { readonly type: 'deleteContentForward' }
  /** Cmd-Backspace: delete back to the start of the line's text, never into a marker. */
  | { readonly type: 'deleteSoftLineBackward' }
  /** Paste: Markdown text placed as nodes. */
  | { readonly type: 'pasteStructured'; readonly text: string }
  /** Paste as plain text (Ctrl-Shift-V): the text goes into the node at the caret, its line breaks as Shift-Enter's. */
  | { readonly type: 'pastePlain'; readonly text: string }
  /** The selected nodes go, with their subtrees. */
  | { readonly type: 'deleteSubtree' }
  /** A copy of the selected nodes, with their subtrees, goes below them. */
  | { readonly type: 'duplicateSubtree' };

export interface Selection {
  readonly anchor: number;
  readonly head: number;
}

export type RejectReason =
  | 'no-previous-sibling'
  | 'no-next-sibling'
  | 'at-top-level'
  | 'at-h1-bound'
  | 'at-h6-bound'
  | 'not-expressible'
  | 'would-reparent'
  | 'non-contiguous'
  | 'mixed-kinds'
  | 'has-children'
  | 'nothing-above'
  | 'encoding-failed';

export type CommandResult =
  | { readonly status: 'applied'; readonly state: OutlineState; readonly changes: readonly ChangeSpec[]; readonly selection: Selection }
  | { readonly status: 'rejected'; readonly reason: RejectReason; readonly detail?: string }
  /**
   * The command doesn't apply here; the host should run its default behavior. `detail` says why,
   * where ourus stepped aside from an edit in markup it would refuse (`markup: text`).
   */
  | { readonly status: 'notApplicable'; readonly detail?: string };

export function executeCommand(doc: OutlineState, command: Command, selection: Selection): CommandResult {
  const acrossLines = doc.lineAt(selection.anchor).index !== doc.lineAt(selection.head).index;
  if (selection.anchor !== selection.head && (command.type === 'pasteStructured' || command.type === 'enter' || command.type === 'shiftEnter' || (acrossLines && command.type === 'pastePlain'))) {
    const over = overSelection(doc, command, selection);
    if (over) return over;
  }
  const ctx = new CommandContext(doc, selection);
  // where markup is text the user edits, a key in it is the host's: a line break, a character
  if (doc.config.markup === 'text' && ctx.collapsed && HOST_IN_MARKUP.has(command.type) && inMarkupAt(doc, selection.head)) return { status: 'notApplicable', detail: 'the caret is in markup' };
  if (command.type === 'pastePlain' && ctx.collapsed && /^(?:\r\n|\n|\r)/.test(command.text) && !isCodeLine(ctx, doc.lineAt(ctx.sel.head)) && !isPayloadLine(doc.lineAt(ctx.sel.head))) return breakThenPaste(doc, command, selection);
  const plan = planCommand(ctx, command);
  if ('status' in plan) return inMarkup(ctx, command, plan);
  const result = run(ctx, plan);
  // an empty node or line left away from the caret can't be written: refused, not the encoder's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && emptyAwayFromCaret(ctx, plan.expected, doc.nodeAt(selection.head))) {
    return reject('not-expressible', 'an empty node or line away from the caret') as CommandResult;
  }
  // two indented code blocks next to each other would be one: refused, not the encoder's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && adjacentIndentedCode(plan.expected)) {
    return reject('not-expressible', 'indented code next to indented code would be one block') as CommandResult;
  }
  // indented code right after an item would be more of the item: refused, not the encoder's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && indentedCodeAfterItem(plan.expected)) {
    return reject('not-expressible', 'indented code after an item would join it') as CommandResult;
  }
  if (STRUCTURAL.has(command.type)) return caretInText(fromGap(ctx, command, result), doc.config.markup === 'text' && (command.type === 'indent' || command.type === 'outdent') && isFenceLine(ctx, doc.lineAt(selection.head)));
  // where the host decorates markup, no command leaves the caret in it
  return doc.config.markup === 'decorated' ? caretInText(result) : inMarkup(ctx, command, result);
}

/**
 * A paste over a selection (plain paste's within one line is its own), or Enter or Shift-Enter over
 * one: the selection goes first, as Backspace deletes it (across nodes ourus's join, within a node's
 * text the host's delete), and the command runs at the caret that leaves, as one edit; null where the
 * command plans the selection itself. Left to the host, a paste's lines would land at
 * column 0, outside the node's nesting, and a line break would take the markers it replaced along.
 */
function overSelection(doc: OutlineState, command: Extract<Command, { type: 'pasteStructured' | 'pastePlain' | 'enter' | 'shiftEnter' }>, selection: Selection): CommandResult | null {
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const deleted = executeCommand(doc, { type: 'deleteContentBackward' }, selection);
  if (deleted.status === 'rejected') return deleted;
  // a selection the host deletes is ourus's to go on from only within a node's text; elsewhere (in a
  // fence, across markup) the whole edit is the host's, as the delete is
  const node = doc.nodeAt(from);
  const range = node && node.head?.type === 'paragraph' ? doc.headRange(node) : null;
  const paste = command.type === 'pasteStructured' || command.type === 'pastePlain';
  const inText = !!range && doc.nodeAt(to) === node && from >= range.from && from >= doc.textStart(from) && to <= range.to && to >= doc.textStart(to);
  // a line break over a selection in one line that isn't all text plans it itself (it may split markup)
  if (deleted.status === 'notApplicable' && !inText) return paste || doc.lineAt(from).index !== doc.lineAt(to).index ? deleted : null;
  const removal = [{ from, to, insert: '' }];
  const first =
    deleted.status === 'applied' ? deleted : { state: doc.update(removal, { caret: from }), changes: removal, selection: { anchor: from, head: from } };
  const done = executeCommand(first.state, command, first.selection);
  if (done.status === 'rejected') return done;
  if (done.status === 'notApplicable') {
    // a line break the host makes: over the selection, as it would have
    if (!paste) return done;
    // inline text, the host's: over a selection in one node's text, the host replaces it
    if (deleted.status !== 'applied') return done;
    const at = first.selection.head;
    const insert = [{ from: at, to: at, insert: command.text }];
    return { status: 'applied', state: first.state.update(insert), changes: composeChanges(doc.text, first.changes, insert), selection: { anchor: at + command.text.length, head: at + command.text.length } };
  }
  return { ...done, changes: composeChanges(doc.text, first.changes, done.changes) };
}

/**
 * Plain text starting with a line break, outside code: the break is Shift-Enter's at the caret, as
 * plain paste makes every line break, and the rest is pasted where that leaves the caret, as one edit.
 * Where Shift-Enter is refused, so is the paste; where it is the host's, so is the paste. One line
 * left, which the host would put at the new line's start as it is, is escaped where it would start a
 * block there, as plain paste escapes its lines.
 */
function breakThenPaste(doc: OutlineState, command: Extract<Command, { type: 'pastePlain' }>, selection: Selection): CommandResult {
  const broken = executeCommand(doc, { type: 'shiftEnter' }, selection);
  // where Shift-Enter is refused (a paragraph's text start), the leading line breaks go and the rest
  // is pasted at the caret; a clipboard of line breaks alone is refused with it
  if (broken.status === 'rejected') {
    const rest = command.text.replace(/^(?:[ \t]*(?:\r\n|\n|\r))+/, '');
    if (rest === '') return broken;
    const pasted = executeCommand(doc, { type: 'pastePlain', text: rest }, selection);
    return pasted.status === 'notApplicable' ? typedAt(doc, rest, selection) : pasted;
  }
  if (broken.status !== 'applied') return broken;
  const rest = command.text.replace(/^(?:\r\n|\n|\r)/, '');
  if (rest === '') return broken;
  const pasted = executeCommand(broken.state, { type: 'pastePlain', text: rest }, broken.selection);
  if (pasted.status === 'rejected') return pasted;
  if (pasted.status === 'applied') return { ...pasted, changes: composeChanges(doc.text, broken.changes, pasted.changes) };
  // one line, at the start of the line Shift-Enter made: the node's first, after a paragraph break, or
  // a continuation line
  const typed = typedAt(broken.state, rest, broken.selection);
  return { ...typed, changes: composeChanges(doc.text, broken.changes, typed.changes) };
}

/**
 * One line of pasted text put in at the caret of `state` (the host's paste would have taken the whole
 * clipboard, its line breaks with it), escaped where at a line's start it would start a block with the
 * text after it: the node's first line, or a continuation line.
 */
function typedAt(state: OutlineState, rest: string, selection: Selection): Extract<CommandResult, { status: 'applied' }> {
  const at = selection.head;
  const node = state.nodeAt(at);
  const line = state.lineAt(at);
  const ctx = new CommandContext(state, selection);
  const after = state.text.slice(at, line.to);
  const atStart = at <= state.textStart(at);
  const escaped = atStart ? ctx.encoder.escape(rest + after, node?.head && line.index === node.head.startLine ? 'start' : 'continuation').at : null;
  const text = escaped !== null && escaped <= rest.length ? rest.slice(0, escaped) + '\\' + rest.slice(escaped) : rest;
  const insert = [{ from: at, to: at, insert: text }];
  return { status: 'applied', state: state.update(insert), changes: insert, selection: { anchor: at + text.length, head: at + text.length } };
}

/** The keys that, with the caret in markup shown as text, are the host's: they edit it as text. */
const HOST_IN_MARKUP = new Set<Command['type']>(['shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward']);

/**
 * Whether `head` is inside markup: on a node's line, past the line's start (where Backspace and
 * Delete are at a boundary, ourus's) and before the text: in a list marker or its padding, a task's
 * checkbox, a heading's `#`s, a quote's `>`, a callout's `[!type]`, the containers' indentation. On
 * a line of code its own indentation is code; on an empty item what follows the marker is its text.
 */
function inMarkupAt(doc: OutlineState, head: number): boolean {
  const line = doc.lineAt(head);
  const node = doc.nodeAt(head);
  if (!node || head <= line.from || head > line.to) return false;
  const leaf = line.leaf;
  const payload = leaf?.type === 'code_block' || leaf?.type === 'math_block' || leaf?.type === 'comment_block';
  if (payload && !(node.kind === 'item' && line.index === node.startLine)) return head < line.contentFrom;
  if (node.kind === 'item' && line.index === node.startLine && doc.isEmpty(node) && head >= doc.markerTo(node.block)) return false;
  // a space a placeholder holds as text (`- ┃◌ x`) is the text's start
  if (doc.placeholders.includes(head) && isSpaceOrTab(doc.text.charCodeAt(head))) return false;
  return head < doc.textStart(head);
}

const STRUCTURAL = new Set<Command['type']>(['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'duplicateSubtree', 'deleteSubtree']);

/** Edits at the caret, as opposed to commands on nodes. */
const AT_CARET = new Set<Command['type']>(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'pasteStructured', 'pastePlain']);

/**
 * With the caret in markup (before its line's text: a marker, `#`s, `>`, where the host put it), an
 * edit at the caret that ourus would refuse is the host's where it shows markup as text (`markup:
 * text`): ourus steps aside, saying why.
 */
function inMarkup(ctx: CommandContext, command: Command, result: CommandResult): CommandResult {
  const { doc } = ctx;
  // an encoding failure is a bug, never the host's to cover
  if (result.status !== 'rejected' || result.reason === 'encoding-failed' || doc.config.markup !== 'text' || !AT_CARET.has(command.type) || !ctx.collapsed) return result;
  const head = ctx.sel.head;
  if (!doc.nodeAt(head) || head > doc.lineAt(head).to || head >= doc.textStart(head)) return result;
  return { status: 'notApplicable', detail: result.detail ?? result.reason };
}

/**
 * Where a caret at `head` can be typed at without breaking its node: in its text, past markers; on a
 * fence (` ``` `, `$$`, `%%`), in the block's payload, its first line from the opening fence and its
 * last from the closing one, or after an opening fence with none (after an opening fence's run, its
 * info string, is fine). `head` where it already is.
 */
export function textPosition(state: OutlineState, head: number): number {
  const line = state.lineAt(head);
  if (!state.nodeAt(head) || head > line.to) return head;
  const leaf = line.leaf;
  const delimiter = leaf?.type === 'math_block' ? /^\$\$/ : leaf?.type === 'comment_block' ? /^%%/ : leaf?.type === 'code_block' && leaf.fenced ? /^(?:`{3,}|~{3,})[ \t]*$/ : null;
  if (leaf && delimiter) {
    const content = (index: number): string => {
      const l = state.lines[index]!;
      return state.text.slice(l.contentFrom, l.to);
    };
    const code = leaf.type === 'code_block';
    const mark = leaf.type === 'math_block' ? '$$' : '%%';
    const run = /^[ \t]*(?:`+|~+|\$\$|%%)/.exec(content(leaf.startLine))?.[0].length ?? 0;
    const opening = state.lines[leaf.startLine]!;
    // the line a closing delimiter ends the block on (the parser's), and where on it that delimiter
    // starts: a code fence is the whole line; math and comments close after text on the line (`x$$`)
    const closing = leaf.closed ? leaf.endLine : -1;
    const closeAt = (index: number): number => state.lines[index]!.contentFrom + (code ? 0 : trimMdEnd(content(index)).length - mark.length);
    // a one-line block (`$$x$$`): between its delimiters
    if (closing === leaf.startLine) return Math.min(Math.max(head, opening.contentFrom + run), closeAt(closing));
    // a line of payload with text, where typing goes in the block: from the opening delimiter the first,
    // from the closing one the last (on a blank one, typing at its start could end a container); else
    // right after the opening delimiter
    const payload = (): number[] => {
      const lines: number[] = [];
      for (let index = leaf.startLine + 1; index <= leaf.endLine; index++) {
        const text = index === closing ? (code ? '' : content(index).slice(0, closeAt(index) - state.lines[index]!.contentFrom)) : content(index);
        if (trimMd(text) !== '') lines.push(index);
      }
      return lines;
    };
    if (line.index === leaf.startLine) {
      // after a code fence's run, typing writes its info string; after `$$` or `%%`, the block's payload
      if (head >= line.contentFrom + run) return head;
      const lines = payload();
      return lines.length ? state.lines[lines[0]!]!.contentFrom : opening.contentFrom + run + (code ? content(leaf.startLine).length - run : 0);
    }
    if (line.index === closing) {
      // before a math or comment delimiter, typing is more payload
      if (!code) return Math.min(head, closeAt(closing));
      const lines = payload();
      return lines.length ? state.lines[lines[lines.length - 1]!]!.to : opening.to;
    }
  }
  // a space a placeholder holds as text (`- ◌ x`) starts the text
  const start = state.textStart(head);
  const held = state.placeholders.find((p) => p >= line.from && p < start && isSpaceOrTab(state.text.charCodeAt(p)) && trimMd(state.text.slice(p, start)) === '');
  return head < (held ?? start) ? (held ?? start) : head;
}

/**
 * After a move, indent or outdent from a blank line or the document's end, where the caret is in the
 * gap of the node it acts on: the caret stays in that gap where the gap went with the node (Gap14),
 * and else goes to the end of the node's text, where a second press acts on it again (MoveUp39); left
 * in a gap that is now another node's, or in another node's text, it would act on that one.
 */
function fromGap(ctx: CommandContext, command: Command, result: CommandResult): CommandResult {
  const { doc } = ctx;
  if (result.status !== 'applied' || !ctx.collapsed || doc.nodeAt(ctx.sel.head) || command.type === 'deleteSubtree' || command.type === 'duplicateSubtree') return result;
  const ops = operands(ctx);
  if (!ops || 'status' in ops) return result;
  const state = result.state;
  const node = state.node(ops.first.id);
  if (!node) return result;
  const head = result.selection.head;
  const line = state.lineAt(head);
  const at = head > line.to ? null : (state.nodeAt(head) ?? gapOwner(new CommandContext(state, result.selection), line.index));
  if (at === node) return result;
  const end = state.headRange(node)?.to ?? state.lines[node.headEndLine]!.to;
  return { ...result, selection: { anchor: end, head: end } };
}

/**
 * The caret never ends in markup: after a structural command that kept it where it was (before a
 * marker, where the user put it, or on a fence), it goes where typing can't break the node; and after
 * any command where the host decorates markup. `onFence`: it may stay on a fence line (indent and
 * outdent from one, where markup is text).
 */
function caretInText(result: CommandResult, onFence = false): CommandResult {
  if (result.status !== 'applied' || result.selection.anchor !== result.selection.head) return result;
  const head = result.selection.head;
  const at = onFence && isFenceLine(new CommandContext(result.state, result.selection), result.state.lineAt(head)) ? Math.max(head, result.state.textStart(head)) : textPosition(result.state, head);
  return at === head ? result : { ...result, selection: { anchor: at, head: at } };
}

function planCommand(ctx: CommandContext, command: Command): Outcome {
  const { doc } = ctx;
  switch (command.type) {
    case 'indent':
    case 'outdent':
    case 'moveSubtreeUp':
    case 'moveSubtreeDown': {
      // Tab and Shift-Tab in code are the host's: they indent the code (Logseq, Obsidian)
      if ((command.type === 'indent' || command.type === 'outdent') && isCodeLine(ctx, doc.lineAt(ctx.sel.anchor)) && isCodeLine(ctx, doc.lineAt(ctx.sel.head))) return notApplicable;
      const ops = operands(ctx);
      if (ops === null) return noOperands(ctx);
      if ('status' in ops) return ops;
      if (ops.mixed) return reject('mixed-kinds');
      const kind = ops.kind;
      if (command.type === 'moveSubtreeUp') return move(ctx, ops, -1);
      if (command.type === 'moveSubtreeDown') return move(ctx, ops, 1);
      const delta = command.type === 'indent' ? 1 : -1;
      if (kind === 'heading') return headingLevel(ctx, ops, delta);
      if (kind === 'paragraph' && delta > 0) return indentParagraphs(ctx, ops);
      // out of a quote, any node: it follows the quote
      if (delta < 0 && ops.parent.kind === 'quote') return leaveQuote(ctx, ops);
      if (kind !== 'item') return reject('not-expressible');
      return delta > 0 ? indent(ctx, ops) : outdent(ctx, ops);
    }
    case 'enter':
      return split(ctx);
    case 'shiftEnter':
      return lineBreak(ctx);
    case 'deleteContentBackward':
      return join(ctx);
    case 'deleteContentForward':
      return joinForward(ctx);
    case 'deleteSoftLineBackward':
      return deleteToTextStart(ctx);
    case 'pasteStructured':
      return paste(ctx, command.text);
    case 'pastePlain':
      return pastePlain(ctx, command.text);
    case 'deleteSubtree':
      return deleteSubtree(ctx);
    case 'duplicateSubtree':
      return duplicate(ctx);
  }
}
