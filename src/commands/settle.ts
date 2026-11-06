// Settling the placeholders the selection left, in a view: the writer's steps (`settleSteps`), the view
// carried through each, as each was an update of the one before.

import { OurusProse } from '../doc/index.ts';
import { composeChanges, mapPos, type ChangeSpec } from '../text/index.ts';
import type { OurusView } from '../view/index.ts';
import { settleSteps } from '../writer/index.ts';

/**
 * The placeholders off the lines `view`'s selection touches settled (`settleSteps`: a selection that
 * starts on a held line keeps it): the view after, carried through each step, its selection the one
 * for the host to set (`view`'s mapped through the changes, where the view shows it, inside the zoom),
 * and the changes from `view`'s text, for the host to apply. Null where none is off those lines. A host
 * settles as the selection moves. An empty zoom root stays while the zoom holds it: settled away, the view would go
 * to its parent with the caret outside it. No fold opens, a hidden node written again or not.
 */
export function settlePlaceholders(view: OurusView): { readonly view: OurusView; readonly changes: readonly ChangeSpec[] } | null {
  const doc = view.doc;
  const given = view.selection;
  const root = view.zoomRoot;
  const text = root && doc.textOf(root);
  const zoomedEmpty = text instanceof OurusProse && text.empty;
  const steps = settleSteps(doc, given, zoomedEmpty ? (pos) => doc.nodeAtLine(doc.lineAt(pos).index)?.id === root!.id : undefined);
  if (!steps.length) return null;
  let after = view;
  let changes: readonly ChangeSpec[] = [];
  for (const step of steps) {
    changes = composeChanges(view.doc.text, changes, step.changes);
    after = after.withDoc(step.doc, step.changes);
  }
  // (no fold opened: settling is no edit of the user's, though it writes a hidden node again; a fold
  // whose node went, or has nothing to hide now, goes)
  after = after.withFolded([...after.folded, ...view.folded]);
  // (mapped, then where the view shows it, as a command's: inside the zoom, where a settled node at its
  // end left the caret past it, B276, and out of a fold)
  const mapped = { anchor: mapPos(changes, given.anchor), head: mapPos(changes, given.head) };
  return { view: after.withSelection(after.visibleSelection(mapped)), changes };
}
