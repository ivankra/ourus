// Commands: what the keys of an outliner do to Markdown text. Each states what the
// outline becomes in a draft of the document (`doc/`), which `done()` puts in normal form, the
// writer spells as changes to the text, and the check reads back. The API: `executeCommand` and its
// types.

import type { OurusDoc } from '../doc/index.ts';
import { CommandContext } from './context.ts';
import { copyOrCutCommand } from './copy.ts';
import { deleteContentBackwardCommand, deleteSoftLineBackwardCommand } from './backspace.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { duplicateSubtreeCommand } from './duplicate-subtree.ts';
import { deleteContentForwardCommand } from './delete.ts';
import { enterCommand } from './enter.ts';
import { indentCommand } from './indent.ts';
import { moveSubtreeDownCommand, moveSubtreeUpCommand } from './move-subtree.ts';
import { outdentCommand } from './outdent.ts';
import { pasteCommand } from './paste.ts';
import { pastePlainCommand } from './paste-plain.ts';
import { shiftEnterCommand } from './shift-enter.ts';
import type { Command, CommandResult, Selection } from './types.ts';
import { insertTextCommand } from './typing.ts';

export type { Clipboard, Command, CommandResult, RejectReason, Selection } from './types.ts';

/** The commands a host has a default for (an editor's key, its clipboard): where ourus doesn't do them, the host does. */
const HOST_HAS: ReadonlySet<Command['type']> = new Set(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'copy', 'cut', 'paste', 'pastePlain', 'insertText']);

/**
 * `command` at `selection`: applied, refused, or the host's. Where ourus doesn't do it yet (a case
 * the commands don't cover), a key with a host's default is the host's; a structural command is
 * refused as `unsupported`.
 */
export function executeCommand(doc: OurusDoc, command: Command, selection: Selection): CommandResult {
  const done = execute(doc, command, selection);
  if (done) return done;
  return HOST_HAS.has(command.type) ? { status: 'notApplicable', detail: "ourus doesn't do it here yet" } : { status: 'rejected', reason: 'unsupported' };
}

/** The command, or null where ourus doesn't do it yet. */
function execute(doc: OurusDoc, command: Command, selection: Selection): CommandResult | null {
  const ctx = new CommandContext(doc, selection);
  switch (command.type) {
    case 'deleteSubtree':
      return deleteSubtreeCommand(ctx);
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
    default:
      return null;
  }
}
