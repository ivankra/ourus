// The commands' API types: a command, the selection it acts on, and what it does.

import type { Clipboard } from './clipboard.ts';
import type { OurusDoc } from '../doc/index.ts';
import type { ChangeSpec } from '../text/index.ts';

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
  /** Paste (Ctrl-V): the clipboard, every format the host has of it, read as Markdown and placed as nodes. */
  | { readonly type: 'paste'; readonly clipboard: Clipboard }
  /** Paste as plain text (Ctrl-Shift-V): the text goes into the node at the caret, its line breaks as Shift-Enter's. */
  | { readonly type: 'pastePlain'; readonly text: string }
  /** The selected nodes go, with their subtrees. */
  | { readonly type: 'deleteSubtree' }
  /** A copy of the selected nodes, with their subtrees, goes below them. */
  | { readonly type: 'duplicateSubtree' }
  /** Typing: `text` typed at the selection, as a key types it. ourus's where Markdown reads it as structure (a backtick), else the host's. */
  | { readonly type: 'insertText'; readonly text: string }
  /** Copy (Ctrl-C): the selection's Markdown, as the result's `clipboard`; the document unchanged. */
  | { readonly type: 'copy' }
  /** Cut (Ctrl-X): copy, then what was copied taken out. */
  | { readonly type: 'cut' };

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
  /** A structural command ourus doesn't do here yet: a case it doesn't cover. (A key with a host's default is the host's there.) */
  | 'unsupported'
  /** The writer failed: a layout it has no rule for, or a text written that doesn't read as the draft. A bug, never an outcome. */
  | 'write-failed';

export type CommandResult =
  /** `clipboard`: what the host writes to the clipboard, every format (copy and cut). */
  | { readonly status: 'applied'; readonly doc: OurusDoc; readonly changes: readonly ChangeSpec[]; readonly selection: Selection; readonly clipboard?: Clipboard }
  | { readonly status: 'rejected'; readonly reason: RejectReason; readonly detail?: string }
  /**
   * Deferred to the host: ourus doesn't act on the key here, and the host runs its default behavior.
   * `detail` says why, where ourus stepped aside from an edit in markup it would refuse (`markup: text`).
   */
  | { readonly status: 'deferredToHost'; readonly detail?: string };

export type { Clipboard };

