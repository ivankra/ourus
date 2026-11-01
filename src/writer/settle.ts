// Settling the placeholders the caret left: a host settles as the caret moves. A
// placeholder holds what Markdown can't while the caret is there: an empty node, a deleted
// character's place; away from it, the node is written again (`done()` says how), or goes.

import { type ChangeSpec } from '../text/index.ts';
import { OurusProse, checkBlockIds, type OurusNode, type OurusDoc } from '../doc/index.ts';
import { OurusDraft } from './draft.ts';

/** A step of settling: the document after it, and its changes from the step before's. */
export type Settled = { readonly doc: OurusDoc; readonly changes: readonly ChangeSpec[] };

/**
 * The placeholders off the caret's line settled: a held space's node written again without it (the
 * text escaped where it would read as markup); an empty item written again, which an empty item
 * alone needs no placeholder for, but right under its parent's text a blank line above it; any other
 * empty node gone, its children in its place. One that can't be written so goes as it is, the text
 * read without it, as it is saved: in steps, each on the one before's document (one, or, where not
 * all settle at once, those that can't dropped and then the rest), so that a view is carried through
 * each (`settlePlaceholders` in `commands/`). None where none is off the caret's line.
 */
export function settleSteps(doc: OurusDoc, caret: number): readonly Settled[] {
  const line = doc.lineAt(caret);
  const abandoned = doc.marks.placeholders.filter((pos) => pos < line.from || pos > line.to);
  if (!abandoned.length) return [];
  const all = settled(doc, caret, abandoned);
  if (all) return [all];
  // (each alone, those that can't be written dropped, the rest settled: two steps, each the one before's)
  const writable = abandoned.filter((pos) => settled(doc, caret, [pos]));
  const without = doc.update({ marks: doc.marks.with({ placeholders: doc.marks.placeholders.filter((pos) => !abandoned.includes(pos) || writable.includes(pos)) }) });
  const rest = writable.length ? settled(without, caret, without.marks.placeholders.filter((pos) => writable.includes(pos))) : null;
  return [{ doc: without, changes: [] }, ...(rest ? [rest] : [])];
}

/** The placeholders at `placeholders` settled, or null where the outline can't be written so (one on no prose text's line too), or a block id would be lost. */
function settled(doc: OurusDoc, caret: number, placeholders: readonly number[]): Settled | null {
  const draft = new OurusDraft(doc);
  const gone = new Set<number>();
  for (const pos of placeholders) {
    const node = doc.nodeAtLine(doc.lineAt(Math.min(pos, doc.text.length)).index);
    const text = node ? doc.textOf(node) : null;
    if (!node || !(text instanceof OurusProse)) return null;
    if (gone.has(node.id)) continue;
    if (doc.marks.hasHeldSpaceAt(pos) || node.kind === 'item') {
      // written again: without the held space, which writing settles; an empty item as `done()` holds it
      draft.setText(node, text.withoutHeldSpaces());
    } else if (text.empty) {
      // (with the blank lines that set it off between two items: their list as tight as it was, TO18)
      // (the list after it its own, in a section: Enter7b)
      const [above, below] = [node.preceding, node.children[0] ?? node.next];
      const apart = (n: OurusNode | null): boolean => n?.kind === 'item' && !!n.next && n.next.kind === 'item' && n.lastDescendant.gap > 0;
      if (above?.kind === 'item' && below?.kind === 'item' && !apart(above.prev) && !apart(below)) draft.gap(above.lastDescendant, 0);
      // (else the node above takes its blank lines, as Backspace taking it out would: the author's stay;
      // but a parent with no text, a quote's, has no blank lines after it to take them)
      else if (above && above.kind !== 'root' && (above !== node.parent || doc.textOf(above))) draft.inheritGap(above, node);
      draft.dissolve(node);
      gone.add(node.id);
    }
  }
  const applied = draft.select({ old: caret }, { old: caret }).done();
  // (and none that would lose a block id, as no command may: settled so, it isn't)
  if (!('doc' in applied) || checkBlockIds(doc, applied.doc, applied.changes)) return null;
  return { doc: applied.doc, changes: applied.changes };
}
