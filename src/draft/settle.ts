// Settling the placeholders the caret left: a host settles as the caret moves. A
// placeholder holds what Markdown can't while the caret is there: an empty node, a deleted
// character's place; away from it, the node is written again (`done()` says how), or goes.

import { isHeldSpacePlaceholder, isPlaceholder, type ChangeSpec } from '../text/index.ts';
import { ProseText, type OutlineNode, type OurusDoc } from '../doc/index.ts';
import { OurusDraft } from './draft.ts';

/**
 * The placeholders off the caret's line settled: a held space's node written again without it (the
 * text escaped where it would read as markup); an empty item written again, which an empty item
 * alone needs no placeholder for, but right under its parent's text a blank line above it; any other
 * empty node gone, its children in its place. Null where none is off the caret's line, or the
 * outline can't be written so.
 */
export function settlePlaceholders(doc: OurusDoc, caret: number): { readonly doc: OurusDoc; readonly changes: readonly ChangeSpec[] } | null {
  const line = doc.lineAt(caret);
  const abandoned = doc.marks.marks.filter((m) => isPlaceholder(m) && (m.from < line.from || m.from > line.to));
  if (!abandoned.length) return null;
  const draft = new OurusDraft(doc);
  const gone = new Set<number>();
  for (const mark of abandoned) {
    const node = doc.nodeAtLine(doc.lineAt(Math.min(mark.from, doc.text.length)).index);
    const text = node ? doc.textOf(node) : null;
    if (!node || gone.has(node.id) || !(text instanceof ProseText)) continue;
    if (isHeldSpacePlaceholder(mark, doc.text) || node.kind === 'item') {
      // written again: without the held space, which writing settles; an empty item as `done()` holds it
      const marks = text.marks.update({ filter: (m) => !isHeldSpacePlaceholder(m, text.text) });
      draft.setText(node, new ProseText(text.type, text.item, text.text, marks));
    } else if (text.empty) {
      // (with the blank lines that set it off between two items: their list as tight as it was, TO18)
      // (the list after it its own, in a section: Enter7b)
      const [above, below] = [node.preceding, node.children[0] ?? node.next];
      const apart = (n: OutlineNode | null): boolean => n?.kind === 'item' && !!n.next && n.next.kind === 'item' && n.lastDescendant.gap > 0;
      if (above?.kind === 'item' && below?.kind === 'item' && !apart(above.prev) && !apart(below)) draft.gap(above.lastDescendant, 0);
      draft.dissolve(node);
      gone.add(node.id);
    }
  }
  const applied = draft.select({ old: caret }, { old: caret }).done();
  return 'doc' in applied ? { doc: applied.doc, changes: applied.changes } : null;
}
