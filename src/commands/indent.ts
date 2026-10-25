// Tab (spec/indent.md): a node one level deeper: an item the last child of the
// node above it, a paragraph an item, a heading a level lower. The command says where the nodes go
// and what kind they are; `done()` and the writer do the rest (the column it lines up at, its list's
// marker and numbers, blank lines, sections).

import type { OutlineNode } from '../doc/index.ts';
import { notApplicable, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { changeHeadingLevels, onCodeLine, selectionInText, structuralOperands } from './util.ts';

/**
 * Items become the last children of their previous sibling, an item or a quote, with their subtrees
 * (rule 4); paragraphs become items (rule 3); headings go a level deeper, with the headings in their
 * sections (rule 2); refused with nothing above them at their level (rule 5). On a code line Tab is
 * the host's (rule 1).
 */
export function indentCommand(ctx: CommandContext): CommandOutcome {
  if (onCodeLine(ctx, ctx.selection.anchor) && onCodeLine(ctx, ctx.selection.head)) return notApplicable();
  const nodes = structuralOperands(ctx);
  if (!Array.isArray(nodes)) return nodes;
  const first = nodes[0]!;
  if (first.kind === 'heading') return changeHeadingLevels(ctx, nodes, 1);
  if (first.kind === 'paragraph') return paragraphsIntoItems(ctx, nodes);
  // (a block that isn't text, a quote: only an item goes under another)
  if (first.kind !== 'item') return reject('not-expressible', `a ${first.kind} doesn't go under the node above`);
  const above = first.prev;
  if (!above) return reject('no-previous-sibling');
  if (above.kind !== 'item' && above.kind !== 'quote') return reject('not-expressible', 'only a list item can hold list items');
  const draft = ctx.draft().remove(nodes).append(above, 'last', nodes);
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}

/**
 * Paragraphs become list items, one level in: the last items of the paragraph above, where it owns
 * a list (in a section); else in place, after a list its next items, with nothing above an item
 * where it is (Indent22). Into a quote above, a paragraph stays one: the quote's last.
 */
function paragraphsIntoItems(ctx: CommandContext, nodes: readonly OutlineNode[]): CommandOutcome {
  const first = nodes[0]!;
  const parent = first.parent!;
  const above = first.prev;
  // into a quote above, a paragraph stays one, the quote's last, in its last section (a heading owns
  // what follows it); the list it owned follows it, as a paragraph in a quote owns none
  if (above?.kind === 'quote') {
    let into = above;
    for (let end = into.children[into.children.length - 1]; end?.kind === 'heading'; end = into.children[into.children.length - 1]) into = end;
    const draft = ctx.draft().remove(nodes).append(into, 'last', nodes);
    selectionInText(ctx, draft, true);
    return ctx.apply(draft);
  }
  const section = parent.kind === 'root' || parent.kind === 'heading';
  const holds = above?.kind === 'paragraph' && section && parent.ownsLists;
  if (!holds && !section && above?.kind !== 'paragraph' && above?.kind !== 'item') return above ? reject('not-expressible', 'only a paragraph or an item can hold list items') : reject('no-previous-sibling');
  const draft = ctx.draft();
  for (const node of nodes) draft.convert(node, 'item');
  if (holds) draft.remove(nodes).append(above, 'last', nodes);
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}
