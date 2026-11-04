// Settling the placeholders the caret left, in a view: the writer's steps (`settleSteps`), the view
// carried through each, as each was an update of the one before.

import { OurusProse } from '../doc/index.ts';
import { composeChanges, mapPos, type ChangeSpec } from '../text/index.ts';
import type { OurusSelection } from './types.ts';
import type { OurusView } from '../view/index.ts';
import { settleSteps } from '../writer/index.ts';

/**
 * The placeholders off the caret's line settled (`settleSteps`), in `view`: the view after, carried
 * through each step, the changes from `view`'s text, for the host to apply, and the selection after
 * them, for the host to set: `at` (a caret, or a selection, its head the caret) mapped through them,
 * where the view shows it, inside the zoom. Null where none is off the caret's line. A host settles as
 * the caret moves. An empty zoom root stays while the zoom holds it: settled away, the view would go to
 * its parent with the caret outside it.
 */
export function settlePlaceholders(view: OurusView, at: number | OurusSelection): { readonly view: OurusView; readonly changes: readonly ChangeSpec[]; readonly selection: OurusSelection } | null {
  const doc = view.doc;
  const given = typeof at === 'number' ? { anchor: at, head: at } : at;
  const caret = given.head;
  const root = view.zoomRoot;
  const text = root && doc.textOf(root);
  const zoomedEmpty = text instanceof OurusProse && text.empty;
  const steps = settleSteps(doc, caret, zoomedEmpty ? (pos) => doc.nodeAtLine(doc.lineAt(pos).index)?.id === root!.id : undefined);
  if (!steps.length) return null;
  let after = view;
  let changes: readonly ChangeSpec[] = [];
  for (const step of steps) {
    changes = composeChanges(view.doc.text, changes, step.changes);
    after = after.withDoc(step.doc, step.changes);
  }
  // (mapped, then inside the zoom, where a settled node at its end left the caret past it: B276; then
  // out of what the view hides)
  const zoom = after.zoomRange();
  const inside = (pos: number): number => (zoom ? Math.min(Math.max(pos, zoom.from), zoom.to) : pos);
  const mapped = { anchor: inside(mapPos(changes, given.anchor)), head: inside(mapPos(changes, given.head)) };
  return { view: after, changes, selection: after.visibleSelection(mapped) };
}
