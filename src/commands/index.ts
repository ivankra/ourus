// Commands: what the keys of an outliner do to Markdown text. The public API is `executeCommand`
// and `settlePlaceholders` and their types; each family of commands is a file of its own, the
// structural ones the lowest (Enter and the joins call them, never the reverse).

import { OutlineState } from '../outline/index.ts';
import { composeChanges, type ChangeSpec } from '../text.ts';
import { CommandContext, isCodeLine, noOperands, operands } from './context.ts';
import { adjacentIndentedCode, emptyAwayFromCaret, indentedCodeAfterItem, notApplicable, reject, run, type Outcome } from './plan.ts';
import { deleteSubtree, duplicate, headingLevel, indent, indentParagraphs, leaveQuote, move, outdent } from './structure.ts';
import { lineBreak, split } from './enter.ts';
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
  | 'non-contiguous'
  | 'mixed-kinds'
  | 'has-children'
  | 'nothing-above'
  | 'encoding-failed';

export type CommandResult =
  | { readonly status: 'applied'; readonly state: OutlineState; readonly changes: readonly ChangeSpec[]; readonly selection: Selection }
  | { readonly status: 'rejected'; readonly reason: RejectReason; readonly detail?: string }
  /**
   * The command doesn't apply here; the host should run its default behaviour. `detail` says why,
   * where ourus stepped aside from an edit in markup it would refuse (`editInMarkup: host`).
   */
  | { readonly status: 'notApplicable'; readonly detail?: string };

export function executeCommand(doc: OutlineState, command: Command, selection: Selection): CommandResult {
  if (selection.anchor !== selection.head && (command.type === 'pasteStructured' || (command.type === 'pastePlain' && doc.lineAt(selection.anchor).index !== doc.lineAt(selection.head).index))) {
    return pasteOverSelection(doc, command, selection);
  }
  const ctx = new CommandContext(doc, selection);
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
  return STRUCTURAL.has(command.type) ? caretInText(result) : inMarkup(ctx, command, result);
}

/**
 * A paste over a selection: the selection goes first, as Backspace deletes it (across nodes ourus's
 * join, within a node's text the host's delete), and the paste goes in at the caret that leaves, as
 * one edit. Left to the host, its lines would land at column 0, outside the node's nesting.
 */
function pasteOverSelection(doc: OutlineState, command: Extract<Command, { type: 'pasteStructured' | 'pastePlain' }>, selection: Selection): CommandResult {
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const deleted = executeCommand(doc, { type: 'deleteContentBackward' }, selection);
  if (deleted.status === 'rejected') return deleted;
  // a selection the host deletes is ourus's to paste over only within one line of a node's text;
  // elsewhere (in a fence, across markup, over a line's whole text) the whole paste is the host's, as
  // the delete is
  const node = doc.nodeAt(from);
  const range = node && node.kind !== 'atom' ? doc.headRange(node) : null;
  const inLine = doc.lineAt(from).index === doc.lineAt(to).index;
  if (deleted.status === 'notApplicable' && !(range && inLine && doc.nodeAt(to) === node && from >= range.from && from >= doc.textStart(from) && to <= range.to)) return deleted;
  const removal = [{ from, to, insert: '' }];
  const first =
    deleted.status === 'applied' ? deleted : { state: doc.update(removal, { caret: from }), changes: removal, selection: { anchor: from, head: from } };
  const pasted = executeCommand(first.state, command, first.selection);
  if (pasted.status === 'rejected') return pasted;
  if (pasted.status === 'notApplicable') {
    // inline text, the host's: over a selection in one node's text, the host replaces it
    if (deleted.status !== 'applied') return pasted;
    const at = first.selection.head;
    const insert = [{ from: at, to: at, insert: command.text }];
    return { status: 'applied', state: first.state.update(insert), changes: composeChanges(doc.text, first.changes, insert), selection: { anchor: at + command.text.length, head: at + command.text.length } };
  }
  return { ...pasted, changes: composeChanges(doc.text, first.changes, pasted.changes) };
}

const STRUCTURAL = new Set<Command['type']>(['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'duplicateSubtree', 'deleteSubtree']);

/** Edits at the caret, as opposed to commands on nodes. */
const AT_CARET = new Set<Command['type']>(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'pasteStructured', 'pastePlain']);

/**
 * With the caret in markup (before its line's text: a marker, `#`s, `>`, where the host put it), an
 * edit at the caret that ourus would refuse is the host's under `editInMarkup: host`: ourus steps
 * aside, saying why.
 */
function inMarkup(ctx: CommandContext, command: Command, result: CommandResult): CommandResult {
  const { doc } = ctx;
  if (result.status !== 'rejected' || doc.config.editInMarkup !== 'host' || !AT_CARET.has(command.type) || !ctx.collapsed) return result;
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
    const closeAt = (index: number): number => state.lines[index]!.contentFrom + (code ? 0 : content(index).trimEnd().length - mark.length);
    // a one-line block (`$$x$$`): between its delimiters
    if (closing === leaf.startLine) return Math.min(Math.max(head, opening.contentFrom + run), closeAt(closing));
    // a line of payload with text, where typing goes in the block: from the opening delimiter the first,
    // from the closing one the last (on a blank one, typing at its start could end a container); else
    // right after the opening delimiter
    const payload = (): number[] => {
      const lines: number[] = [];
      for (let index = leaf.startLine + 1; index <= leaf.endLine; index++) {
        const text = index === closing ? (code ? '' : content(index).slice(0, closeAt(index) - state.lines[index]!.contentFrom)) : content(index);
        if (text.trim() !== '') lines.push(index);
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
  return head < state.textStart(head) ? state.textStart(head) : head;
}

/**
 * The caret never ends in markup: after a structural command that kept it where it was (before a
 * marker, where the user put it, or on a fence), it goes where typing can't break the node.
 */
function caretInText(result: CommandResult): CommandResult {
  if (result.status !== 'applied' || result.selection.anchor !== result.selection.head) return result;
  const at = textPosition(result.state, result.selection.head);
  return at === result.selection.head ? result : { ...result, selection: { anchor: at, head: at } };
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
