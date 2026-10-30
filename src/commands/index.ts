// Commands: what the keys of an outliner do to Markdown text. Each states what the
// outline becomes in a draft of the document (`doc/`), which `done()` puts in normal form, the
// writer spells as changes to the text, and the check reads back. The API: `executeCommand` and its
// types.

import { OurusProse, blockIdsOf, checkBlockIds, textEnd, type OurusDoc, type OurusText } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { composeChanges, trimMd } from '../text/index.ts';
import { CommandContext, blockIdsDeclaredBy } from './context.ts';
import { addBlockIdCommand, pasteKeepingNewBlockIds, removeBlockIdCommand } from './block-ids.ts';
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
import { expandSelectionCommand, selectNodeByCommand, selectNodeCommand } from './select.ts';
import { mixedDepthsRun, reshaped, shapeOf } from './shape.ts';
import { editSubtrees } from './subtrees.ts';
import { shiftEnterCommand } from './shift-enter.ts';
import type { OurusCommand, OurusResult, OurusSelection } from './types.ts';
import { insertTextCommand } from './typing.ts';
import { clearZoomCommand, foldCommand, toggleFoldCommand, unfoldCommand, zoomInCommand, zoomOutCommand } from './view.ts';
import { zoomed } from './zoom.ts';
import { OurusDeferred, OurusRejected, OurusSuccess } from './types.ts';

export { OurusSuccess, OurusRejected, OurusDeferred } from './types.ts';
export type { OurusClipboard, OurusCommand, OurusResult, DropMap, DropPoint, DropSeam, InsertionPoint, RejectReason, OurusSelection } from './types.ts';
export { nearestDropPoint } from './drag.ts';
export { leavesZoom } from './zoom.ts';
export { settlePlaceholders } from './settle.ts';

/** The commands a host has a default for (an editor's key, its clipboard): where ourus doesn't do them, the host does. */
const HOST_HAS: ReadonlySet<OurusCommand['type']> = new Set(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'copy', 'cut', 'paste', 'pastePlain', 'insertText', 'deleteByDrag']);

/**
 * `command` at `selection`: applied, refused, or the host's. Where ourus doesn't do it yet (a case
 * the commands don't cover), a key with a host's default is the host's; a structural command is
 * refused as `unsupported`.
 */
export function executeCommand(view: OurusView, command: OurusCommand, selection: OurusSelection): OurusResult {
  const doc = view.doc;
  const validPosition = (pos: number): boolean => Number.isInteger(pos) && pos >= 0 && pos <= doc.text.length;
  if (!validPosition(selection.anchor) || !validPosition(selection.head)) return new OurusRejected('invalid-selection');
  // (a caret on a block-id line a text carries: its editing keys the host's under `markup: text`, else
  // at the end of the text)
  const at = selection.anchor === selection.head && !BLOCK_ID_COMMANDS.has(command.type) ? view.locate(selection.head) : null;
  // (or in a block id's name ending a text, or a paragraph of a quote read as an atom, or right after
  // it: before it, but its name the host's to edit under `markup: text`)
  // (a text that is only a block id has no end before it: `- ^x┃` is its end, Enter splitting after it)
  const named = at && (at.zone === 'text' || at.zone === 'frame') && (at.text instanceof OurusProse || at.text.type === 'blockquote') ? at.text : null;
  const head = (text: OurusText, from: number): string => (text instanceof OurusProse ? text.text.slice(text.textStart(0), from) : text.text.slice(0, from).replace(/^[ \t>]*/gm, ''));
  const ids = named ? blockIdsOf(named).flatMap((b) => (b.carried ? [] : [b])) : [];
  // (Backspace at the start of a block id on a line of its own, ending a text, or Delete at the end
  // of the line before it: the two lines joined, a blank between, the block id kept)
  const joined = at && 'offset' in at ? ids.find((b) => /\n/.test(named!.text.slice(b.partFrom, b.from)) && ((command.type === 'deleteContentBackward' && at.offset === b.from) || (command.type === 'deleteContentForward' && at.offset === b.partFrom))) : undefined;
  if (joined && at && 'node' in at) {
    const changes = [{ from: doc.posOf(at.node, joined.partFrom, 1), to: doc.posOf(at.node, joined.from, 1), insert: ' ' }];
    const caret = changes[0]!.from;
    const applied: OurusResult = new OurusSuccess({ view: view.update({ changes, caret }), changes, selection: { anchor: caret, head: caret } });
    return keepsBlockIds(view, command, selection, zoomed(view, command, selection, () => applied));
  }
  // (under `markup: decorated`, past the blank before it too, which is the block id's to show)
  const past = (b: (typeof ids)[number]): number => (doc.config.markup === 'decorated' && !/\n/.test(named!.text.slice(b.partFrom, b.from)) ? b.partFrom : b.from);
  const name = named && at && 'offset' in at ? ids.find((b) => at.offset > past(b) && at.offset <= b.partTo && trimMd(head(named, b.partFrom)) !== '') : undefined;
  const inName = !!name && !(doc.config.markup === 'text' && EDITS_TEXT.has(command.type));
  // (but typing or pasting on the blank line right after the text, another blank line after it before
  // its block-id lines: a line of the text, the host's, as Shift-Enter leaves it)
  const caretLine = doc.lineAt(selection.head);
  const nextBlank = caretLine.to < doc.text.length && doc.lineAt(caretLine.to + 1).to - doc.lineAt(caretLine.to + 1).from === 0;
  const textLine = at?.zone === 'blockIdLine' && at.blank && INSERTS.has(command.type) && nextBlank && caretLine.index === doc.lineAt(doc.posOf(at.node, at.text.text.length)).index + 1;
  const line = at?.zone === 'blockIdLine' && !textLine ? at : inName && at && 'node' in at && 'text' in at ? { node: at.node, text: at.text, blank: true } : null;
  const end = !line ? -1 : name && inName ? doc.posOf(line.node, name.partFrom, -1) : doc.posOf(line.node, textEnd(line.text), -1);
  const acted = line ? { anchor: end, head: end } : selection;
  const run = (): OurusResult => {
    // (but a key that would delete the line break at its start or end, joining it to another line: at
    // the end of the text, as any other key)
    const { from: lineFrom, to: lineTo } = doc.lineAt(selection.head);
    const joins = (command.type === 'deleteContentForward' && selection.head === lineTo) || ((command.type === 'deleteContentBackward' || command.type === 'deleteSoftLineBackward') && selection.head === lineFrom);
    if (line && doc.config.markup === 'text' && EDITS_TEXT.has(command.type) && !line.blank && !joins) return new OurusDeferred('the caret is in a block-id line, markup the host edits as text');
    const result = execute(view, command, acted) ?? (HOST_HAS.has(command.type) ? new OurusDeferred("ourus doesn't do it here yet") : new OurusRejected('unsupported'));
    // (acting at the text's end, a key the host's there: the host's caret is on the block-id line
    // still, so what it would insert is inserted here, at the text's end; any other key refused)
    if (!line || !(result instanceof OurusDeferred)) return result;
    const inserted = command.type === 'insertText' || command.type === 'pastePlain' ? command.text : command.type === 'paste' ? command.clipboard['text/plain'] : undefined;
    // (Backspace in or after a block id ending a text, the character before it: a code point, not
    // half of one; not on a block-id line, which the text's end is lines above)
    const before = inName && command.type === 'deleteContentBackward' && end > 0 && doc.text[end - 1] !== '\n' ? [...doc.text.slice(Math.max(0, end - 2), end)].pop()!.length : 0;
    if (inserted === undefined && !before) return new OurusRejected('not-expressible', "the caret is on a block-id line, and the key's default would edit it: it acts at the end of the text");
    // (and the blank before a block id ending the text, where none of the text is left: `- ┃^x`)
    const id = name && before > 0 && trimMd(head(line.text, name.partFrom - before)) === '' ? name.from : null;
    const changes = [{ from: end - before, to: id !== null ? doc.posOf(line.node, id, 1) : end, insert: inserted ?? '' }];
    const caret = end - before + (inserted ?? '').length;
    return new OurusSuccess({ view: view.update({ changes, caret }), changes, selection: { anchor: caret, head: caret } });
  };
  // within the snapshot's view: confined to its zoom, its selection out of what it hides (a deferral
  // where ourus doesn't do it yet included: at the zoom root's edges it would reach outside; one on a
  // block-id line too, judged by the selection as given)
  const result = zoomed(view, command, selection, run);
  if (result instanceof OurusDeferred) return hostKeepsBlockIds(view, command, selection, result);
  return keepsBlockIds(view, command, acted, result);
}

/**
 * `result`, a deferral, or a `block-id` refusal where what the host does by default (its key's
 * edit at `selection`, as a text editor's) would lose a block id: one written off its node, naming
 * another or nothing, glued to the text, or shadowed. But under `markup: text`, of an edit inside a
 * block id's own markup, that block id: it is text the user edits there.
 */
function hostKeepsBlockIds(view: OurusView, command: OurusCommand, selection: OurusSelection, result: OurusResult): OurusResult {
  const doc = view.doc;
  if (!doc.config.flavor || !doc.mdTree.flavor.has('blockIds')) return result;
  const edit = hostEdit(doc.text, command, selection);
  // (a note without block ids pays nothing, but for an edit that brings some in)
  if (!edit || (!doc.text.includes('^') && !edit.insert.includes('^'))) return result;
  // (under `markup: text`, an edit inside a block id's markup, as of a heading's `#`s: characters of it
  // deleted, or one typed in it, after its first; what becomes of that block id is the user's, and
  // only of it)
  const inMarkup = (b: { partFrom: number; partTo: number }): boolean => (edit.from < edit.to ? edit.from >= b.partFrom && edit.to <= b.partTo : edit.from > b.partFrom && edit.from <= b.partTo);
  const edited = doc.config.markup === 'text' ? (doc.blockIds().find((b) => !b.implicit && inMarkup(b)) ?? null) : null;
  const after = doc.update({ changes: [edit] });
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const taken = takenBy(view, from, to);
  const loss = checkBlockIds(doc, after, [edit], { taken, edited: edited && { from: edited.partFrom, to: edited.partTo } });
  if (!loss) return result;
  // (a paste whose block ids the host would write twice: the host's paste done here, those it
  // brings kept only where new, as a paste keeps them)
  if (command.type === 'paste' || command.type === 'pastePlain') {
    const own = pasteKeepingNewBlockIds(new CommandContext(view, selection), command, (marked) => {
      const typed = hostEdit(doc.text, marked, selection)!;
      const caret = typed.from + typed.insert.length;
      return new OurusSuccess({ view: view.update({ changes: [typed] }), changes: [typed], selection: { anchor: caret, head: caret } });
    });
    // (ourus's own result: every block id kept, the one in whose markup it is too)
    if (own instanceof OurusSuccess && !checkBlockIds(doc, own.view.doc, own.changes, { taken })) return own;
  }
  // (typing over a selection across nodes, whose first keeps its block id: ourus's deletion, which
  // keeps it, and what is typed at the caret it leaves)
  if (command.type === 'insertText' && taken && taken.from > from) {
    const deleted = deleteSelected(new CommandContext(view, selection));
    if (deleted instanceof OurusSuccess) {
      const at = deleted.selection.head;
      const key = insertTextCommand(new CommandContext(deleted.view, deleted.selection), command.text);
      // (where ourus leaves the key to the host there, typed as the host types it)
      const raw = [{ from: at, to: at, insert: command.text }];
      const typed = key instanceof OurusSuccess ? key : key instanceof OurusDeferred ? { view: deleted.view.update({ changes: raw }), changes: raw, selection: { anchor: at + command.text.length, head: at + command.text.length } } : null;
      if (typed) {
        const own: OurusResult = new OurusSuccess({ ...blockIdsDeclaredBy([deleted, ...(key instanceof OurusSuccess ? [key] : [])]), view: typed.view, changes: composeChanges(doc.text, deleted.changes, typed.changes), selection: typed.selection });
        if (!checkBlockIds(doc, own.view.doc, own.changes, { taken, declared: { moved: own.movedBlockIds ?? [], merged: own.mergedBlockIds ?? [] } })) return own;
      }
    }
  }
  return new OurusRejected('block-id', `the host's edit here: ${loss}`);
}

/**
 * The text a command over `[from, to]` takes, its block ids with it: the selection; but across
 * nodes, from past the first's own lines, which stays, a merge keeping its block id even where the
 * selection covers it; a subtree selection, and the whole document replaced as text
 * (`editSubtrees`), all of it; null for a caret.
 */
function takenBy(view: OurusView, from: number, to: number): { from: number; to: number } | null {
  const doc = view.doc;
  if (from >= to) return null;
  // (a subtree selection, whose nodes go whole, and the whole document, replaced as text: all of it)
  if ((from === 0 && to === doc.text.length) || view.selectedSubtrees({ anchor: from, head: to })) return { from, to };
  const first = doc.nodeAtLine(doc.lineAt(from).index);
  if (!first || first === doc.nodeAtLine(doc.lineAt(to).index)) return { from, to };
  return { from: Math.max(from, Math.min(to, doc.mdTree.line(first.ownLastLine).to)), to };
}

/** What a text editor's default for `command` at `selection` changes in `text` (a code point deleted, the selection replaced, a line break for Enter); null where it changes nothing, or isn't one of those keys. */
function hostEdit(text: string, command: OurusCommand, selection: OurusSelection): { from: number; to: number; insert: string } | null {
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const inserted = command.type === 'insertText' || command.type === 'pastePlain' ? command.text : command.type === 'paste' ? command.clipboard['text/plain'] : command.type === 'enter' || command.type === 'shiftEnter' ? '\n' : undefined;
  if (inserted !== undefined) return { from, to, insert: inserted };
  if (command.type !== 'deleteContentBackward' && command.type !== 'deleteContentForward' && command.type !== 'deleteSoftLineBackward') return null;
  if (from < to) return { from, to, insert: '' };
  if (command.type === 'deleteContentForward') {
    const next = text.startsWith('\r\n', to) ? 2 : ([...text.slice(to, to + 2)][0]?.length ?? 0);
    return next ? { from, to: to + next, insert: '' } : null;
  }
  const lineStart = Math.max(text.lastIndexOf('\n', from - 1) + 1, 0);
  if (command.type === 'deleteSoftLineBackward' && from > lineStart) return { from: lineStart, to, insert: '' };
  const prev = text.slice(Math.max(0, from - 2), from).endsWith('\r\n') ? 2 : ([...text.slice(Math.max(0, from - 2), from)].pop()?.length ?? 0);
  return prev ? { from: from - prev, to, insert: '' } : null;
}

/** The keys that put text in where the caret is. */
const INSERTS: ReadonlySet<OurusCommand['type']> = new Set(['insertText', 'paste', 'pastePlain']);

/** The keys that edit the text where the caret is. */
const EDITS_TEXT: ReadonlySet<OurusCommand['type']> = new Set(['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'paste', 'pastePlain']);

/** The commands that take the text selected with them (typed over, deleted, cut): a block id wholly inside goes with it. */
const TAKES_SELECTION: ReadonlySet<OurusCommand['type']> = new Set(['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'paste', 'pastePlain', 'cut', 'deleteByDrag', 'enter', 'shiftEnter']);

/** The block-id commands, which change block ids on purpose and check their own results. */
const BLOCK_ID_COMMANDS: ReadonlySet<OurusCommand['type']> = new Set(['addBlockId', 'removeBlockId']);

/**
 * `result`, or a `block-id` refusal where it loses a block id (`checkBlockIds`): one written off its
 * node, naming another or nothing, shadowed, or a name written twice; but as the command declared
 * (`movedBlockIds`, `mergedBlockIds`), one inside the text it took, and one gone with a node it
 * removed (`removedNodes`).
 */
function keepsBlockIds(view: OurusView, command: OurusCommand, selection: OurusSelection, result: OurusResult): OurusResult {
  const doc = view.doc;
  if (!(result instanceof OurusSuccess) || BLOCK_ID_COMMANDS.has(command.type)) return result;
  // (a note without block ids, before and after, pays nothing)
  if (!doc.text.includes('^') && !result.view.doc.text.includes('^')) return result;
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const taken = TAKES_SELECTION.has(command.type) ? takenBy(view, from, to) : null;
  const declared = { moved: result.movedBlockIds ?? [], merged: result.mergedBlockIds ?? [] };
  const loss = checkBlockIds(doc, result.view.doc, result.changes, { declared, taken, removed: result.removedNodes ?? [] });
  return loss ? new OurusRejected('block-id', loss) : result;
}

/** The command, or null where ourus doesn't do it yet. */
function execute(view: OurusView, command: OurusCommand, selection: OurusSelection): OurusResult | null {
  const ctx = new CommandContext(view, selection, 'nodes' in command ? command.nodes : undefined);
  // the keys that edit text, over a subtree selection: over its nodes
  // (a paste over them too: the block ids it brings kept where new, read where they landed)
  const routed = command.type === 'paste' || command.type === 'pastePlain' ? pasteKeepingNewBlockIds(ctx, command, (marked) => editSubtrees(ctx, marked)) : editSubtrees(ctx, command);
  if (routed !== undefined) return routed;
  switch (command.type) {
    case 'deleteSubtree':
      return deleteSubtreeCommand(ctx, command.expectMarkdown);
    case 'duplicateSubtree':
      return duplicateSubtreeCommand(ctx);
    // (the selection after them follows the nodes, in the shape it was given)
    case 'indent':
      return reshaped(mixedDepthsRun(ctx, indentCommand) ?? indentCommand(ctx), shapeOf(view, selection));
    case 'outdent':
      return reshaped(mixedDepthsRun(ctx, outdentCommand) ?? outdentCommand(ctx), shapeOf(view, selection));
    case 'moveSubtreeUp':
      return reshaped(moveSubtreeUpCommand(ctx), shapeOf(view, selection));
    case 'moveSubtreeDown':
      return reshaped(moveSubtreeDownCommand(ctx), shapeOf(view, selection));
    case 'drag':
      return dragCommand(ctx, command);
    case 'moveSubtree':
      return reshaped(moveSubtreeCommand(ctx, command.to), shapeOf(view, selection));
    case 'pasteAt':
      return pasteAtCommand(ctx, command.clipboard, command.at);
    // (a drag of no text deletes none)
    case 'deleteByDrag':
      return ctx.collapsed ? new OurusSuccess({ view, changes: [], selection }) : deleteSelected(ctx);
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
    // (the block ids it brought kept where new, read where they landed)
    case 'paste':
      return pasteKeepingNewBlockIds(ctx, command, (marked) => pasteCommand(ctx, marked.clipboard)) ?? null;
    case 'pastePlain':
      return pasteKeepingNewBlockIds(ctx, command, (marked) => pastePlainCommand(ctx, marked.text)) ?? null;
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
    case 'selectNode':
      return selectNodeCommand(ctx);
    case 'expandSelection':
      return expandSelectionCommand(ctx);
    case 'selectNodeDown':
      return selectNodeByCommand(ctx, 1);
    case 'selectNodeUp':
      return selectNodeByCommand(ctx, -1);
    case 'addBlockId':
      return addBlockIdCommand(ctx, command.name, command.node);
    case 'removeBlockId':
      return removeBlockIdCommand(ctx, command.name, command.node);
    default:
      return null;
  }
}
