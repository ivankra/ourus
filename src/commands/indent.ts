// Tab (spec/indent.md): a node one level deeper: an item the last child of the
// node above it, a paragraph or an atom an item, a heading a level lower. The command says where the nodes go
// and what kind they are; `done()` and the writer do the rest (the column it lines up at, its list's
// marker and numbers, blank lines, sections).

import { AtomText, type OutlineNode } from '../doc/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { changeHeadingLevels, onCodeLine, oneRun, operandsRefused, selectionInText } from './util.ts';

/**
 * Items become the last children of their previous sibling, an item or a quote, with their subtrees
 * (rule 4); paragraphs and atoms become items (rule 3); headings go a level deeper, with the headings in their
 * sections (rule 2); refused with nothing above them at their level (rule 5). On a code line Tab is
 * the host's (rule 1).
 */
export function indentCommand(ctx: CommandContext): CommandOutcome {
  if (!ctx.nodes && onCodeLine(ctx, ctx.selection.anchor) && onCodeLine(ctx, ctx.selection.head)) return deferToHost();
  const nodes = oneRun(ctx, true);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  const first = nodes[0]!;
  if (first.kind === 'heading') return changeHeadingLevels(ctx, nodes, 1);
  if (first.kind === 'paragraph' || first.kind === 'atom') return blocksIntoItems(ctx, nodes);
  // (a quote that is a container: only an item goes under another)
  if (first.kind !== 'item') return reject('not-expressible', `a ${first.kind} doesn't go under the node above`);
  const above = first.prev;
  if (!above) return reject('no-previous-sibling');
  if (above.kind !== 'item' && above.kind !== 'quote') return reject('not-expressible', 'only a list item can hold list items');
  const draft = ctx.draft().remove(nodes).append(above, 'last', nodes);
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}

/**
 * Why paragraphs or atoms can't become the texts of items, or null where they can: indented code is
 * its lines' indentation (under a marker it would be other code, or none), and a quote's lazy line led
 * by a tab would span other columns after a marker (the writer re-indents spaces, not tabs).
 */
export function itemTextsRefused(ctx: CommandContext, nodes: readonly OutlineNode[]): CommandOutcome {
  for (const n of nodes) {
    const t = ctx.doc.textOf(n);
    if (!(t instanceof AtomText)) continue;
    if (t.type === 'indented_code') return reject('not-expressible', "indented code can't be an item's text");
    if (t.type === 'blockquote' && t.text.split('\n').some((l, k) => k > 0 && /^[ ]*\t/.test(l) && !/^ {0,3}>/.test(l))) return reject('not-expressible', "a quote's lazy line led by a tab can't follow a marker");
  }
  return null;
}

/**
 * Paragraphs or atoms become list items whose text they are, one level in: the last items of the
 * node above, where it owns a list (in a section); else in place, after a list its next items, with
 * nothing above an item where it is (Indent22). Into a quote above, a block stays one: the quote's
 * last.
 */
function blocksIntoItems(ctx: CommandContext, nodes: readonly OutlineNode[]): CommandOutcome {
  const first = nodes[0]!;
  const parent = first.parent!;
  const above = first.prev;
  const refused = itemTextsRefused(ctx, nodes);
  if (refused) return refused;
  // into a quote above, a block stays one, the quote's last, in its last section (a heading owns
  // what follows it); the list it owned follows it, as a block in a quote owns none
  if (above?.kind === 'quote') {
    let into = above;
    for (let end = into.children[into.children.length - 1]; end?.kind === 'heading'; end = into.children[into.children.length - 1]) into = end;
    const draft = ctx.draft().remove(nodes).append(into, 'last', nodes);
    selectionInText(ctx, draft, true);
    return ctx.apply(draft);
  }
  const section = parent.kind === 'root' || parent.kind === 'heading';
  // (a node that adopts the list after it, `listParent`: a paragraph, any block, none)
  const holds = !!above && section && ctx.doc.adoptsLists(above);
  if (!holds && !section && above?.kind !== 'paragraph' && above?.kind !== 'item') return above ? reject('not-expressible', 'only a paragraph or an item can hold list items') : reject('no-previous-sibling');
  const draft = ctx.draft();
  for (const node of nodes) draft.convert(node, 'item');
  if (holds) draft.remove(nodes).append(above, 'last', nodes);
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}
