// The zoom's guard: a command's operands inside the zoom root, its result keeping
// the zoom's invariant (`OurusDoc.zoomEscape`), no deferral in the root's first row before its text nor one
// whose plain default would leave the zoom, the selection out of what the view hides; and the same
// invariant for a host's own edit (`leavesZoom`).

import type { OurusDoc } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { CommandContext } from './context.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { plainTextEdit } from './util.ts';
import type { OurusCommand, OurusResult, OurusSelection } from './types.ts';
import { OurusDeferred, OurusRejected, OurusSuccess } from './types.ts';

/** The view's commands and those that write nothing: no operands to confine, no result to check. */
const UNCONFINED: ReadonlySet<OurusCommand['type']> = new Set(['fold', 'unfold', 'toggleFold', 'zoomIn', 'zoomOut', 'clearZoom', 'copy', 'drag']);

/** The commands whose removal of the zoom root whole is allowed (clause 0), the zoom going to its nearest ancestor left. */
const REMOVES: ReadonlySet<OurusCommand['type']> = new Set(['deleteSubtree', 'cut']);

/** The deletions a subtree selection routes to `deleteSubtree` (`subtrees.ts`): the keys', a drag's. */
const ROUTED_REMOVES: ReadonlySet<OurusCommand['type']> = new Set(['deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'deleteByDrag']);

/** The selection commands: a deferral is the host's own selection (a line, a select all), no edit to keep inside the zoom. */
const SELECTS: ReadonlySet<OurusCommand['type']> = new Set(['selectNode', 'expandSelection', 'selectNodeDown', 'selectNodeUp']);

/** The keys that break the line: whatever else their default does, a line break at the caret. */
const NEWLINE: ReadonlySet<OurusCommand['type']> = new Set(['enter', 'shiftEnter']);

const outside = (detail: string): OurusResult => (new OurusRejected('outside-zoom', detail));

/**
 * `run`, the command, within `view`: zoomed, refused (`outside-zoom`) where its operands
 * aren't the root or inside it, where it would defer in the root's first row before its text or where
 * the key's plain default would leave the zoom, or where its result leaves the zoom; applied, the
 * selection out of what the view hides.
 */
export function zoomed(view: OurusView, command: OurusCommand, selection: OurusSelection, run: () => OurusResult): OurusResult {
  const doc = view.doc;
  if (view.zoom === null && !view.zoomFolded.size) return run();
  // (no operands to confine, no result to check: the selection still out of what the view hides)
  if (UNCONFINED.has(command.type)) return settled(run());
  const root = view.zoomRoot;
  if (root) {
    const range = view.zoomRange()!;
    if ([selection.anchor, selection.head].some((p) => p < range.from || p > range.to)) return outside('the selection is outside the zoom');
    const nodes = 'nodes' in command ? command.nodes : undefined;
    if (nodes?.some((id) => !insideRoot(view, id))) return outside('a node it was given is outside the zoom');
  }
  const result = run();
  if (result instanceof OurusDeferred && !SELECTS.has(command.type)) {
    if (root && [selection.anchor, selection.head].some((p) => inRootMarkup(view, p, NEWLINE.has(command.type)))) return outside("in the zoom root's markup, where the host's default would reach outside it");
    // (a key whose default is the same edit in every host; Enter's continues the markup in one host
    // and not another: the host's own guard, `leavesZoom`)
    const plain = plainTextEdit(doc.text, command, selection);
    if (!plain?.everyHost) return result;
    if (root && leavesZoom(view, doc.update({ changes: [plain.change], caret: plain.caret }))) return outside("the host's default would leave the zoom");
    // (where the default's caret would be hidden, in a fold's lines or past the zoom's end, which the
    // host can't show: past the zoom refused; in a fold done here, the caret where the reader sees it,
    // the fold's start: Backspace on the line after a folded node's last)
    const next = view.update({ changes: [plain.change], caret: plain.caret });
    const caret = { anchor: plain.caret, head: plain.caret };
    const zoom = next.zoomRange();
    if (zoom && (plain.caret < zoom.from || plain.caret > zoom.to)) return outside("the host's default would leave the caret outside the zoom");
    const visible = next.visibleSelection(caret);
    if (visible !== caret) return new OurusSuccess({ view: next.withSelection(visible), changes: [plain.change] });
    return result;
  }
  if (!root) return settled(result);
  if (result instanceof OurusDeferred) return result;
  // (a result with no changes can still reorder nodes, identical ones swapped: checked as any other)
  if (!(result instanceof OurusSuccess) || result.view.doc === doc) return settled(result);
  const removed = !result.view.doc.node(root.id);
  // (a deletion key over a subtree selection is `deleteSubtree` of its roots, `editSubtrees`: as cut, it may take the root)
  const routed = ROUTED_REMOVES.has(command.type) && !('nodes' in command && command.nodes) && view.selectedSubtrees(selection) !== null;
  if (removed && !REMOVES.has(command.type) && !routed) return outside('the zoom root went');
  const escape = view.escape(result.view.doc, removed);
  return escape ? outside(escape) : settled(result);
}

/** An applied result, its selection out of what its view hides. */
function settled(result: OurusResult): OurusResult {
  if (!(result instanceof OurusSuccess)) return result;
  const selection = result.view.visibleSelection();
  return selection === result.view.selection ? result : new OurusSuccess({ ...result, view: result.view.withSelection(selection) });
}

/** Whether node `id` is the zoom root or inside it. */
function insideRoot(view: OurusView, id: number): boolean {
  const doc = view.doc;
  return view.zoom !== null && (doc.node(id)?.isWithin(view.zoom) ?? false);
}

/**
 * Whether `pos` is in the zoom root's first row before its text: its markup, its own or its ancestors'
 * (`- - a`'s outer `-`); for a key that breaks the line (`newline`), at its text's start too, where
 * the break would go before the root (an atom's fence, whose text starts with it).
 */
function inRootMarkup(view: OurusView, pos: number, newline: boolean): boolean {
  const doc = view.doc;
  const root = doc.node(view.zoom!)!;
  const start = doc.textStart(root.startLine);
  return doc.lineAt(pos).index === root.startLine && (pos < start || (newline && pos === start));
}

/**
 * Whether `next`, the snapshot a host's own edit would commit (`view.doc.update({ changes, ... })` with
 * the caret and marks it will give), leaves `view`'s zoom, for the host to refuse the edit (a deferred
 * command's default, typing, an editor's own commands); false where not zoomed. The root removed whole
 * keeps it only as ourus's own `deleteSubtree` of it writes it, since a host's edit has no operands to
 * check and no writer behind it.
 */
export function leavesZoom(view: OurusView, next: OurusDoc): boolean {
  if (view.zoom === null) return false;
  if (next.node(view.zoom)) return view.escape(next) !== null;
  const removal = deleteSubtreeCommand(new CommandContext(view.withSelection({ anchor: 0, head: 0 }), [view.zoom]));
  // (the removal's text, and nothing else changed or made outside: the same text can hold another
  // outline, a held empty paragraph, B219)
  return !(removal instanceof OurusSuccess) || removal.view.doc.text !== next.text || view.escape(next, true) !== null;
}
