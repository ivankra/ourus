// Commands: what the keys of an outliner do to Markdown text. Each states what the
// outline becomes in a draft of the document (`doc/`), which `done()` puts in normal form, the
// writer spells as changes to the text, and the check reads back. The API: `executeCommand` and its
// types.

import type { OurusDoc } from '../doc/index.ts';
import { CommandContext } from './context.ts';
import { copyOrCutCommand, deleteSelected } from './copy.ts';
import { deleteContentBackwardCommand, deleteSoftLineBackwardCommand } from './backspace.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { dragCommand } from './drag.ts';
import { duplicateSubtreeCommand } from './duplicate-subtree.ts';
import { deleteContentForwardCommand } from './delete.ts';
import { enterCommand } from './enter.ts';
import { indentCommand } from './indent.ts';
import { moveSubtreeCommand } from './move-subtree.ts';
import { moveSubtreeDownCommand, moveSubtreeUpCommand } from './move-subtree-by.ts';
import { outdentCommand } from './outdent.ts';
import { pasteAtCommand, pasteCommand } from './paste.ts';
import { pastePlainCommand } from './paste-plain.ts';
import { shiftEnterCommand } from './shift-enter.ts';
import type { Command, CommandResult, Selection } from './types.ts';
import { insertTextCommand } from './typing.ts';
import { clearZoomCommand, foldCommand, toggleFoldCommand, unfoldCommand, zoomInCommand, zoomOutCommand } from './view.ts';
import { zoomed } from './zoom.ts';

export type { Clipboard, Command, CommandResult, DropMap, DropPoint, DropSeam, InsertionPoint, RejectReason, Selection } from './types.ts';
export { nearestDropPoint } from './drag.ts';
export { leavesZoom } from './zoom.ts';

/** The commands a host has a default for (an editor's key, its clipboard): where ourus doesn't do them, the host does. */
const HOST_HAS: ReadonlySet<Command['type']> = new Set(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'copy', 'cut', 'paste', 'pastePlain', 'insertText', 'deleteByDrag']);

/**
 * `command` at `selection`: applied, refused, or the host's. Where ourus doesn't do it yet (a case
 * the commands don't cover), a key with a host's default is the host's; a structural command is
 * refused as `unsupported`.
 */
export function executeCommand(doc: OurusDoc, command: Command, selection: Selection): CommandResult {
  // within the snapshot's view: confined to its zoom, its selection out of what it hides (a deferral
  // where ourus doesn't do it yet included: at the zoom root's edges it would reach outside)
  return zoomed(doc, command, selection, () => execute(doc, command, selection) ?? (HOST_HAS.has(command.type) ? { status: 'deferredToHost', detail: "ourus doesn't do it here yet" } : { status: 'rejected', reason: 'unsupported' }));
}

/** The command, or null where ourus doesn't do it yet. */
function execute(doc: OurusDoc, command: Command, selection: Selection): CommandResult | null {
  const ctx = new CommandContext(doc, selection, 'nodes' in command ? command.nodes : undefined);
  switch (command.type) {
    case 'deleteSubtree':
      return deleteSubtreeCommand(ctx, command.expectMarkdown);
    case 'duplicateSubtree':
      return duplicateSubtreeCommand(ctx);
    case 'indent':
      return indentCommand(ctx);
    case 'outdent':
      return outdentCommand(ctx);
    case 'moveSubtreeUp':
      return moveSubtreeUpCommand(ctx);
    case 'moveSubtreeDown':
      return moveSubtreeDownCommand(ctx);
    case 'drag':
      return dragCommand(ctx, command);
    case 'moveSubtree':
      return moveSubtreeCommand(ctx, command.to);
    case 'pasteAt':
      return pasteAtCommand(ctx, command.clipboard, command.at);
    case 'deleteByDrag':
      return deleteSelected(ctx);
    case 'shiftEnter':
      return shiftEnterCommand(ctx);
    case 'enter':
      return enterCommand(ctx);
    case 'deleteContentBackward':
      return deleteContentBackwardCommand(ctx);
    case 'deleteContentForward':
      return deleteContentForwardCommand(ctx);
    case 'deleteSoftLineBackward':
      return deleteSoftLineBackwardCommand(ctx);
    case 'copy':
    case 'cut':
      return copyOrCutCommand(ctx, command.type);
    case 'paste':
      return pasteCommand(ctx, command.clipboard);
    case 'pastePlain':
      return pastePlainCommand(ctx, command.text);
    case 'insertText':
      return insertTextCommand(ctx, command.text);
    case 'fold':
      return foldCommand(ctx);
    case 'unfold':
      return unfoldCommand(ctx);
    case 'toggleFold':
      return toggleFoldCommand(ctx);
    case 'zoomIn':
      return zoomInCommand(ctx);
    case 'zoomOut':
      return zoomOutCommand(ctx);
    case 'clearZoom':
      return clearZoomCommand(ctx);
    default:
      return null;
  }
}
