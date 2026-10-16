// Commands: what the keys of an outliner do to Markdown text. The public API is `executeCommand`
// and `settlePlaceholders` and their types; each family of commands is a file of its own, the
// structural ones the lowest (Enter and the joins call them, never the reverse).

import { OutlineState } from '../outline/index.ts';
import type { ChangeSpec } from '../text.ts';
import { CommandContext, isCodeLine, noOperands, operands } from './context.ts';
import { emptyAwayFromCaret, indentedCodeAfterItem, notApplicable, reject, run, type Outcome } from './plan.ts';
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
  const ctx = new CommandContext(doc, selection);
  const plan = planCommand(ctx, command);
  if ('status' in plan) return inMarkup(ctx, command, plan);
  const result = run(ctx, plan);
  // an empty node left away from the caret can't be written: refused, not the encoder's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && emptyAwayFromCaret(ctx, plan.expected, doc.nodeAt(selection.head))) {
    return reject('not-expressible', 'an empty node away from the caret') as CommandResult;
  }
  // indented code right after an item would be more of the item: refused, not the encoder's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && indentedCodeAfterItem(plan.expected)) {
    return reject('not-expressible', 'indented code after an item would join it') as CommandResult;
  }
  return STRUCTURAL.has(command.type) ? caretInText(result) : inMarkup(ctx, command, result);
}

const STRUCTURAL = new Set<Command['type']>(['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown']);

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
 * The caret never ends in markup: after a structural command that kept it where it was (before a
 * marker, where the user put it), it goes to the start of its node's text, where typing can't break
 * the node.
 */
function caretInText(result: CommandResult): CommandResult {
  if (result.status !== 'applied' || result.selection.anchor !== result.selection.head) return result;
  const { state } = result;
  const head = result.selection.head;
  const line = state.lineAt(head);
  const node = state.nodeAt(head);
  if (!node || head > line.to || head >= state.textStart(head)) return result;
  const at = state.textStart(head);
  return { ...result, selection: { anchor: at, head: at } };
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
