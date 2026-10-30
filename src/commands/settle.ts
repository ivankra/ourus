// Settling the placeholders the caret left, in a view: the writer's steps (`settleSteps`), the view
// carried through each, as each was an update of the one before.

import { composeChanges, type ChangeSpec } from '../text/index.ts';
import type { OurusView } from '../view/index.ts';
import { settleSteps } from '../writer/index.ts';

/**
 * The placeholders off the caret's line settled (`settleSteps`), in `view`: the view after, carried
 * through each step, and the changes from `view`'s text, for the host to apply. Null where none is off
 * the caret's line. A host settles as the caret moves.
 */
export function settlePlaceholders(view: OurusView, caret: number): { readonly view: OurusView; readonly changes: readonly ChangeSpec[] } | null {
  const steps = settleSteps(view.doc, caret);
  if (!steps.length) return null;
  let after = view;
  let changes: readonly ChangeSpec[] = [];
  for (const step of steps) {
    changes = composeChanges(view.doc.text, changes, step.changes);
    after = after.withDoc(step.doc, step.changes);
  }
  return { view: after, changes };
}
