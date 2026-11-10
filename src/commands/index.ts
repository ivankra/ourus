// Commands: what the keys of an outliner do to Markdown text. Each states what the
// outline becomes in a draft of the document (`doc/`), which `done()` puts in normal form, the
// writer spells as changes to the text, and the check reads back. The API: `executeCommand` and its
// types.

import { OurusProse, blockIdsOf, textEnd, type OurusAtom, type OurusNode, type OurusText } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { charAfter, charBefore, charStart, lineEnding, lineEndingBefore, trimMd } from '../text/index.ts';
import { CommandContext } from './context.ts';
import { addBlockIdCommand, removeBlockIdCommand } from './block-ids.ts';
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
import { quoteTextBefore } from './quote.ts';
import { expandSelectionCommand, selectNodeByCommand, selectNodeCommand } from './select.ts';
import { mixedDepthsRun, reshaped, shapeOf } from './shape.ts';
import { editSubtrees } from './subtrees.ts';
import { shiftEnterCommand } from './shift-enter.ts';
import type { OurusCommand, OurusResult, OurusSelection } from './types.ts';
import { insertTextCommand } from './typing.ts';
import { clearZoomCommand, foldCommand, toggleFoldCommand, unfoldCommand, zoomInCommand, zoomOutCommand } from './view.ts';
import { zoomed } from './zoom.ts';
import { OurusDeferred, OurusFailed, OurusRejected, OurusSuccess } from './types.ts';

export { OurusSuccess, OurusRejected, OurusDeferred, OurusFailed } from './types.ts';
export type { OurusClipboard, OurusCommand, OurusResult, DropMap, DropPoint, DropSeam, InsertionPoint, RejectReason, DeferReason, OurusSelection } from './types.ts';
export type { WriteFailed } from '../writer/index.ts';
export { nearestDropPoint } from './drag.ts';
export { leavesZoom } from './zoom.ts';
export { settlePlaceholders } from './settle.ts';

/** The commands a host has a default for (an editor's key, its clipboard): where ourus doesn't do them, the host does. */
const HOST_HAS: ReadonlySet<OurusCommand['type']> = new Set(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'copy', 'cut', 'paste', 'pastePlain', 'insertText', 'deleteByDrag']);

/**
 * `command` at `view`'s selection: applied, refused, or the host's. Where ourus doesn't do it yet (a
 * case the commands don't cover), a key with a host's default is the host's; a structural command is
 * refused as `unsupported`.
 */
export function executeCommand(view: OurusView, command: OurusCommand): OurusResult {
  try {
    return commandAt(view, command, view.selection);
  } catch (e) {
    // (a document nested past what the commands' walks recurse through, which reading it doesn't:
    // refused, as the writer refuses one it can't write)
    if (e instanceof RangeError && /call stack/.test(e.message)) return new OurusFailed({ phase: 'depth', code: 'too-deep', detail: 'the document nests deeper than the commands go' });
    throw e;
  }
}

/** `executeCommand`'s work: where it acts (`commandSite`), the command run there, checked within the view (`zoomed`). */
function commandAt(view: OurusView, command: OurusCommand, given: OurusSelection): OurusResult {
  const doc = view.doc;
  const validPosition = (pos: number): boolean => Number.isInteger(pos) && pos >= 0 && pos <= doc.text.length;
  if (!validPosition(given.anchor) || !validPosition(given.head)) return new OurusRejected('invalid-selection');
  const site = commandSite(view, command, SPLITS.has(command.type) ? wholeCharacters(doc.text, given) : given);
  const { selection } = site;
  // within the snapshot's view: confined to its zoom, its selection out of what it hides (a deferral
  // where ourus doesn't do it yet included: at the zoom root's edges it would reach outside; one on a
  // block-id line too, judged by the selection as given)
  if (site.reason === 'block-id-join') {
    const applied: OurusResult = new OurusSuccess({ view: view.update({ changes: site.changes, caret: site.changes[0]!.from }), changes: site.changes });
    return zoomed(view, command, selection, () => applied);
  }
  return zoomed(view, command, selection, () => runAt(view, command, site));
}

/**
 * Where a command acts, and why there:
 * - `given`: at the selection given (over whole characters, for a key that splits);
 * - `block-id-join`: Backspace at the start of a block id on a line of its own ending a text, or Delete
 *   at the end of the line before it: the two lines joined, a blank between, the block id kept (`changes`);
 * - `block-id-name`: a caret in a block id's name ending a text, or right after it (a paragraph of a
 *   quote read as an atom too): before it, at `end`; but its name the host's to edit under `markup: text`;
 * - `block-id-line`: a caret on a block-id line a text carries: at the text's end, `end`; its editing
 *   keys the host's under `markup: text`.
 */
type CommandSite =
  | { readonly reason: 'given'; readonly selection: OurusSelection; readonly acted: OurusSelection }
  | { readonly reason: 'block-id-join'; readonly selection: OurusSelection; readonly changes: readonly { from: number; to: number; insert: string }[] }
  | { readonly reason: 'block-id-name' | 'block-id-line'; readonly selection: OurusSelection; readonly acted: OurusSelection; readonly end: number; readonly line: BlockIdPlace; readonly name: BlockIdPart | undefined; readonly inName: boolean };

/** The text a block id ends, or whose block-id line the caret is on, and its node; `blank`: no block-id line's own text there. */
type BlockIdPlace = { readonly node: OurusNode; readonly text: OurusText; readonly blank: boolean };
type BlockIdPart = Exclude<ReturnType<typeof blockIdsOf>[number], { readonly carried: true }>;

/** Where `command`, given `selection`, acts, and why there (`CommandSite`). */
function commandSite(view: OurusView, command: OurusCommand, selection: OurusSelection): CommandSite {
  const doc = view.doc;
  // (a selection command acts where the caret is: moved to the text's end, the selection it makes
  // wouldn't hold the caret, B216)
  const at = selection.anchor === selection.head && !BLOCK_ID_COMMANDS.has(command.type) && command.type !== 'expandSelection' ? view.locate(selection.head) : null;
  // (a text that is only a block id has no end before it: `- ^x┃` is its end, Enter splitting after it)
  // (a quote atom's only where the flavor has block ids: elsewhere `^x` is its text: block-ids.test.ts)
  const named = at && (at.zone === 'text' || at.zone === 'frame') && (at.text instanceof OurusProse || (at.text.type === 'blockquote' && doc.mdTree.flavor.has('blockIds'))) ? at.text : null;
  const owner = at && 'node' in at ? at.node : null;
  const head = (text: OurusText, from: number): string => (text instanceof OurusProse ? text.text.slice(text.textStart(0), from) : quoteTextBefore(doc, owner!, text as OurusAtom, from));
  const ids: BlockIdPart[] = named ? blockIdsOf(named).flatMap((b) => (b.carried ? [] : [b])) : [];
  const joined = at && 'offset' in at ? ids.find((b) => /\n/.test(named!.text.slice(b.partFrom, b.from)) && ((command.type === 'deleteContentBackward' && at.offset === b.from) || (command.type === 'deleteContentForward' && at.offset === b.partFrom))) : undefined;
  if (joined && at && 'node' in at) return { reason: 'block-id-join', selection, changes: [{ from: doc.posOf(at.node, joined.partFrom, 1), to: doc.posOf(at.node, joined.from, 1), insert: ' ' }] };
  // (under `markup: decorated`, past the blank before it too, which is the block id's to show)
  const past = (b: BlockIdPart): number => (doc.config.markup === 'decorated' && !/\n/.test(named!.text.slice(b.partFrom, b.from)) ? b.partFrom : b.from);
  const name = named && at && 'offset' in at ? ids.find((b) => at.offset > past(b) && at.offset <= b.partTo && trimMd(head(named, b.partFrom)) !== '') : undefined;
  const inName = !!name && !(doc.config.markup === 'text' && EDITS_TEXT.has(command.type));
  // (but typing or pasting on the blank line right after the text, another blank line after it before
  // its block-id lines: a line of the text, the host's, as Shift-Enter leaves it)
  const caretLine = doc.lineAt(selection.head);
  const nextLine = caretLine.to < doc.text.length ? doc.lineAt(caretLine.to + lineEnding(doc.text, caretLine.to).length) : null;
  const nextBlank = !!nextLine && nextLine.index > caretLine.index && nextLine.to === nextLine.from;
  const textLine = at?.zone === 'blockIdLine' && at.blank && INSERTS.has(command.type) && nextBlank && caretLine.index === doc.lineAt(doc.posOf(at.node, at.text.text.length)).index + 1;
  const line: BlockIdPlace | null = at?.zone === 'blockIdLine' && !textLine ? at : inName && at && 'node' in at && 'text' in at ? { node: at.node, text: at.text, blank: true } : null;
  if (!line) return { reason: 'given', selection, acted: selection };
  const end = name && inName ? doc.posOf(line.node, name.partFrom, -1) : doc.posOf(line.node, textEnd(line.text), -1);
  return { reason: at?.zone === 'blockIdLine' && !textLine ? 'block-id-line' : 'block-id-name', selection, acted: { anchor: end, head: end }, end, line, name, inName };
}

/** `command` run at `site`, a key ourus doesn't do there the host's (or refused, a structural command). */
function runAt(view: OurusView, command: OurusCommand, site: Exclude<CommandSite, { reason: 'block-id-join' }>): OurusResult {
  const doc = view.doc;
  const { selection } = site;
  if (site.reason === 'given') return execute(view, command, site.acted) ?? (HOST_HAS.has(command.type) ? new OurusDeferred('not-done', "ourus doesn't do it here yet") : new OurusRejected('unsupported'));
  const { line, end, name, inName } = site;
  // (but a key that would delete the line break at its start or end, joining it to another line: at
  // the end of the text, as any other key)
  const { from: lineFrom, to: lineTo } = doc.lineAt(selection.head);
  const joins = (command.type === 'deleteContentForward' && selection.head === lineTo) || ((command.type === 'deleteContentBackward' || command.type === 'deleteSoftLineBackward') && selection.head === lineFrom);
  if (doc.config.markup === 'text' && EDITS_TEXT.has(command.type) && !line.blank && !joins) return new OurusDeferred('in-markup', 'the caret is in a block-id line, markup the host edits as text');
  const result = execute(view, command, site.acted) ?? (HOST_HAS.has(command.type) ? new OurusDeferred('not-done', "ourus doesn't do it here yet") : new OurusRejected('unsupported'));
  // (acting at the text's end, a key the host's there: the host's caret is on the block-id line
  // still, so what it would insert is inserted here, at the text's end; any other key refused)
  if (!(result instanceof OurusDeferred)) return result;
  const inserted = command.type === 'insertText' || command.type === 'pastePlain' ? command.text : command.type === 'paste' ? command.clipboard['text/plain'] : undefined;
  // (Backspace in or after a block id ending a text, the character before it, a grapheme; not on a
  // block-id line, which the text's end is lines above)
  const before = inName && command.type === 'deleteContentBackward' && end > 0 && !lineEndingBefore(doc.text, end) ? end - charBefore(doc.text, end) : 0;
  if (inserted === undefined && !before) return new OurusRejected('not-expressible', "the caret is on a block-id line, and the key's default would edit it: it acts at the end of the text");
  const quoteHead = (text: OurusText, from: number): string => (text instanceof OurusProse ? text.text.slice(text.textStart(0), from) : quoteTextBefore(doc, line.node, text as OurusAtom, from));
  // (and the blank before a block id ending the text, where none of the text is left: `- ┃^x`)
  const id = name && before > 0 && trimMd(quoteHead(line.text, name.partFrom - before)) === '' ? name.from : null;
  const changes = [{ from: end - before, to: id !== null ? doc.posOf(line.node, id, 1) : end, insert: inserted ?? '' }];
  const caret = end - before + (inserted ?? '').length;
  return new OurusSuccess({ view: view.update({ changes, caret }), changes });
}

/** The keys that split a line where the caret is. */
const SPLITS: ReadonlySet<OurusCommand['type']> = new Set(['enter', 'shiftEnter']);

/**
 * `selection` over whole characters (`charStart`), for a key that splits there: a host's caret is on
 * a boundary, but a stale offset may be inside a surrogate pair, a grapheme or a CRLF. A caret goes
 * to the character's start; a selection widens to take the characters it cuts.
 */
function wholeCharacters(text: string, selection: OurusSelection): OurusSelection {
  const forward = selection.anchor <= selection.head;
  const [from, to] = forward ? [selection.anchor, selection.head] : [selection.head, selection.anchor];
  const start = charStart(text, from);
  const toStart = charStart(text, to);
  const end = from === to ? start : toStart === to ? to : charAfter(text, toStart);
  if (start === from && end === to) return selection;
  return forward ? { anchor: start, head: end } : { anchor: end, head: start };
}

/** The keys that put text in where the caret is. */
const INSERTS: ReadonlySet<OurusCommand['type']> = new Set(['insertText', 'paste', 'pastePlain']);

/** The keys that edit the text where the caret is. */
const EDITS_TEXT: ReadonlySet<OurusCommand['type']> = new Set(['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'paste', 'pastePlain']);

/** The block-id commands, which change block ids on purpose and check their own results. */
const BLOCK_ID_COMMANDS: ReadonlySet<OurusCommand['type']> = new Set(['addBlockId', 'removeBlockId']);

/** The command, or null where ourus doesn't do it yet. */
function execute(view: OurusView, command: OurusCommand, selection: OurusSelection): OurusResult | null {
  const ctx = new CommandContext(view.withSelection(selection), 'nodes' in command ? command.nodes : undefined);
  // the keys that edit text, over a subtree selection: over its nodes
  const routed = editSubtrees(ctx, command);
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
      return ctx.collapsed ? new OurusSuccess({ view: ctx.view, changes: [] }) : deleteSelected(ctx);
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
