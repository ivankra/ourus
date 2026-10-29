// The zoom's guard: a command's operands inside the zoom root, its result keeping
// the zoom's invariant (`OurusDoc.zoomEscape`), no deferral in the root's first row before its text nor one
// whose plain default would leave the zoom, the selection out of what the view hides; and the same
// invariant for a host's own edit (`leavesZoom`).

import type { OurusDoc } from '../doc/index.ts';
import { CommandContext } from './context.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import type { ChangeSpec } from '../text/index.ts';
import type { Command, CommandResult, TextSelection } from './types.ts';
import { visibleSelection } from './view.ts';

/** The view's commands and those that write nothing: no operands to confine, no result to check. */
const UNCONFINED: ReadonlySet<Command['type']> = new Set(['fold', 'unfold', 'toggleFold', 'zoomIn', 'zoomOut', 'clearZoom', 'copy', 'drag']);

/** The commands whose removal of the zoom root whole is allowed (clause 0), the zoom going to its nearest ancestor left. */
const REMOVES: ReadonlySet<Command['type']> = new Set(['deleteSubtree', 'cut']);

/** The selection commands: a deferral is the host's own selection (a line, a select all), no edit to keep inside the zoom. */
const SELECTS: ReadonlySet<Command['type']> = new Set(['selectNode', 'expandSelection', 'selectNodeDown', 'selectNodeUp']);

/** The keys that break the line: whatever else their default does, a line break at the caret. */
const NEWLINE: ReadonlySet<Command['type']> = new Set(['enter', 'shiftEnter']);

const outside = (detail: string): CommandResult => ({ status: 'rejected', reason: 'outside-zoom', detail });

/**
 * `run`, the command, within the view of `doc`: zoomed, refused (`outside-zoom`) where its operands
 * aren't the root or inside it, where it would defer in the root's first row before its text or where
 * the key's plain default would leave the zoom, or where its result leaves the zoom; applied, the
 * selection out of what the view hides.
 */
export function zoomed(doc: OurusDoc, command: Command, selection: TextSelection, run: () => CommandResult): CommandResult {
  if (doc.zoom === null && !doc.zoomFolded.size) return run();
  if (UNCONFINED.has(command.type)) return run();
  const root = doc.zoom === null ? null : doc.node(doc.zoom)!;
  if (root) {
    const range = doc.zoomRange()!;
    if ([selection.anchor, selection.head].some((p) => p < range.from || p > range.to)) return outside('the selection is outside the zoom');
    const nodes = 'nodes' in command ? command.nodes : undefined;
    if (nodes?.some((id) => !insideRoot(doc, id))) return outside('a node it was given is outside the zoom');
  }
  const result = run();
  if (!root) return settled(result);
  if (result.status === 'deferredToHost') {
    if (SELECTS.has(command.type)) return result;
    if ([selection.anchor, selection.head].some((p) => inRootMarkup(doc, p, NEWLINE.has(command.type)))) return outside("in the zoom root's markup, where the host's default would reach outside it");
    const plain = plainDefault(doc, command, selection);
    if (plain && leavesZoom(doc, doc.update([plain.change], { caret: plain.caret }))) return outside("the host's default would leave the zoom");
    return result;
  }
  if (result.status !== 'applied' || !result.changes.length) return settled(result);
  const removed = !result.doc.node(root.id);
  if (removed && !REMOVES.has(command.type)) return outside('the zoom root went');
  const escape = doc.zoomEscape(result.doc, removed);
  return escape ? outside(escape) : settled(result);
}

/** An applied result, its selection out of what its view hides. */
function settled(result: CommandResult): CommandResult {
  if (result.status !== 'applied') return result;
  const selection = visibleSelection(result.doc, result.selection);
  return selection === result.selection ? result : { ...result, selection };
}

/** Whether node `id` is the zoom root or inside it. */
function insideRoot(doc: OurusDoc, id: number): boolean {
  for (let p = doc.node(id) ?? null; p; p = p.parent) if (p.id === doc.zoom) return true;
  return false;
}

/**
 * Whether `pos` is in the zoom root's first row before its text: its markup, its own or its ancestors'
 * (`- - a`'s outer `-`); for a key that breaks the line (`newline`), at its text's start too, where
 * the break would go before the root (an atom's fence, whose text starts with it).
 */
function inRootMarkup(doc: OurusDoc, pos: number, newline: boolean): boolean {
  const root = doc.node(doc.zoom!)!;
  const start = doc.textStart(root.startLine);
  return doc.lineAt(pos).index === root.startLine && (pos < start || (newline && pos === start));
}

/**
 * The default of a key whose default is a plain edit in every host (a character typed, Backspace,
 * Delete, a soft line's Backspace): the change and the caret after; null for the others (Enter's
 * default continues the markup in one host and not another: the host's own guard, `leavesZoom`).
 */
function plainDefault(doc: OurusDoc, command: Command, selection: TextSelection): { change: ChangeSpec; caret: number } | null {
  const [from, to] = [Math.min(selection.anchor, selection.head), Math.max(selection.anchor, selection.head)];
  const edit = (from: number, to: number, insert = ''): { change: ChangeSpec; caret: number } => ({ change: { from, to, insert }, caret: from + insert.length });
  switch (command.type) {
    case 'insertText':
      return edit(from, to, command.text);
    case 'deleteContentBackward':
      return from < to ? edit(from, to) : from > 0 ? edit(from - 1, from) : null;
    case 'deleteContentForward':
      return from < to ? edit(from, to) : to < doc.text.length ? edit(to, to + 1) : null;
    case 'deleteSoftLineBackward': {
      const start = doc.lineAt(from).from;
      return from < to ? edit(from, to) : start < from ? edit(start, from) : from > 0 ? edit(from - 1, from) : null;
    }
    default:
      return null;
  }
}

/**
 * Whether `next`, the snapshot a host's own edit would commit (`doc.update(changes, params)` with the
 * caret and marks it will give), leaves `doc`'s zoom, for the host to refuse the edit (a deferred
 * command's default, typing, an editor's own commands); false where not zoomed. The root removed whole
 * keeps it only as ourus's own `deleteSubtree` of it writes it, since a host's edit has no operands to
 * check and no writer behind it.
 */
export function leavesZoom(doc: OurusDoc, next: OurusDoc): boolean {
  if (doc.zoom === null) return false;
  if (next.node(doc.zoom)) return doc.zoomEscape(next) !== null;
  const removal = deleteSubtreeCommand(new CommandContext(doc, { anchor: 0, head: 0 }, [doc.zoom]));
  return removal?.status !== 'applied' || removal.doc.text !== next.text;
}
