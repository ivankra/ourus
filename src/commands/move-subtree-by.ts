// Alt-Shift-Up and Alt-Shift-Down (spec/move-subtree-up.md, move-subtree-down.md): the nodes past
// their sibling above or below. The command says which nodes go where; `done()` and the writer do the
// rest (blank lines, lists, escapes, the caret's place in the text).

import type { OutlineNode } from '../doc/index.ts';
import { reject, type CommandContext, type CommandOutcome } from './context.ts';
import { headingLevel, oneRun, operandsRefused, selectionInText, withTextlessParents } from './util.ts';

/** Alt-Shift-Up (spec/move-subtree-up.md). */
export function moveSubtreeUpCommand(ctx: CommandContext): CommandOutcome {
  return moveSubtreeBy(ctx, -1);
}

/** Alt-Shift-Down (spec/move-subtree-down.md). */
export function moveSubtreeDownCommand(ctx: CommandContext): CommandOutcome {
  return moveSubtreeBy(ctx, 1);
}

/**
 * The selected nodes, with their subtrees, past their sibling above or below: a quote they are all
 * of moving instead (rule 1); swapped with a sibling of their kind (rule 2); down past a section's
 * paragraph into its list, or into a sub-heading's section; at their parent's edge, into the node
 * before or after it (rules 3 and 4). Refused where it would give another node a new parent. The
 * caret and the selection go with the text they are in.
 */
function moveSubtreeBy(ctx: CommandContext, dir: -1 | 1): CommandOutcome {
  const doc = ctx.doc;
  const found = oneRun(ctx, true);
  if (!Array.isArray(found)) return operandsRefused(found);
  let nodes = found;
  nodes = withTextlessParents(doc, nodes);
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const parent = first.parent!;
  const other = dir < 0 ? first.prev : last.next;
  const draft = ctx.draft().remove(nodes);
  if (!other) {
    const crossed = dir < 0 ? crossUpOutOfParent(ctx, nodes) : crossDownOutOfParent(ctx, nodes);
    if (!crossed) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
    if (crossed === 'reparent') return reject('would-reparent', 'the move would give another node a new parent');
    if (crossed.where === 'before') draft.place('before', crossed.at, nodes);
    else draft.append(crossed.at, crossed.where, nodes);
  } else if (dir > 0 && ((first.kind === 'item' && ctx.doc.adoptsLists(other)) || (other.kind === 'heading' && first.kind !== 'heading'))) {
    // an item below a node that adopts lists (a section's paragraph) becomes its list's first; any node but a heading, down past
    // a sub-heading, its section's first
    draft.append(other, 'first', nodes);
  } else {
    // a quote swaps with any node but a heading (which owns what follows it); blocks swap with
    // blocks, items with items; a heading with a heading of its level, or it would take in or go into
    // another's section. Where no block adopts a list (`listParent: container`), items and blocks
    // pass each other, as `listMoves` says: a list one block (a block passes the whole list, the items
    // of a whole list pass a block, at a longer list's edge they stay in it), or each item one
    const flat = ctx.config.listParent === 'container' && parent.ownsLists;
    const byList = ctx.config.listMoves === 'list';
    const list = (n: OutlineNode | null): unknown => (n?.kind === 'item' ? doc.listOf(n)?.block : undefined);
    const whole = first.kind === 'item' && (!byList || (list(first.prev) !== list(first) && list(last.next) !== list(last)));
    const group = (n: OutlineNode): string => (n.kind === 'paragraph' || n.kind === 'atom' ? 'leaf' : n.kind);
    const quote = (first.kind === 'quote' || other.kind === 'quote') && first.kind !== 'heading' && other.kind !== 'heading';
    const across = flat && ((whole && group(other) === 'leaf') || (group(first) === 'leaf' && other.kind === 'item'));
    if (first.kind === 'heading' && (other.kind !== 'heading' || headingLevel(ctx, first) !== headingLevel(ctx, other))) return reject('would-reparent', 'a heading moves among headings of its level');
    if (!quote && !across && group(other) !== group(first)) return reject('not-expressible', `can't reorder ${first.kind} past ${other.kind}`);
    let past = other;
    if (flat && byList && first.kind !== 'item') while (list(past) && list(dir < 0 ? past.prev : past.next) === list(past)) past = (dir < 0 ? past.prev : past.next)!;
    draft.place(dir < 0 ? 'before' : 'after', past, nodes);
  }
  selectionInText(ctx, draft);
  return ctx.apply(draft);
}

/** A heading's level. */
type Crossing = { readonly at: OutlineNode; readonly where: 'before' | 'first' | 'last' };

/**
 * The run, first in its parent, moved up past the line above it: out of a paragraph's list, above
 * the paragraph; out of a heading's section, to where the text above the heading ends (the end of
 * the section above, inside the last sub-headings that can hold it, or else right before the
 * heading); out of an item, as the last child of the item above. Null where it can't go.
 */
function crossUpOutOfParent(ctx: CommandContext, nodes: readonly OutlineNode[]): Crossing | null {
  const first = nodes[0]!;
  const parent = first.parent!;
  if (first.kind === 'item' && parent.kind === 'paragraph') return { at: parent, where: 'before' };
  if (!parent.parent) return null;
  const above = parent.prev;
  if (parent.kind === 'heading') {
    const into = above?.kind === 'heading' ? lastSectionHolding(ctx, above, first) : null;
    // else the heading's parent's own nodes, or the text before the first heading: right before it
    return into ? { at: into, where: 'last' } : { at: parent, where: 'before' };
  }
  if (!above || !canCrossInto(above, first)) return null;
  return { at: above, where: 'last' };
}

/**
 * The run, last in its parent, moved down past the line below it: out of the sections that end with
 * it (and the list of a section's paragraph), as the first node of the next section, unless it would
 * take in that section's nodes; out of an item, as the first child of the item below. Null where it
 * can't go; `reparent` where a heading would take in the section's nodes, or end it.
 */
function crossDownOutOfParent(ctx: CommandContext, nodes: readonly OutlineNode[]): Crossing | 'reparent' | null {
  const first = nodes[0]!;
  let from = first.parent!;
  let below = from.next;
  // the text after a section's (or a section paragraph's) last node is the next heading, however many
  // sections end there
  if (from.kind === 'heading' || from.kind === 'paragraph') {
    while (!below && from.parent?.kind === 'heading') {
      from = from.parent;
      below = from.next;
    }
  }
  if (!below) return null;
  if (below.kind === 'heading' && first.kind === 'heading') {
    // a heading at the head of a section takes in what follows it up to a heading of its level
    const head = below.children[0];
    if (headingLevel(ctx, first) <= headingLevel(ctx, below) || (head && !(head.kind === 'heading' && headingLevel(ctx, head) <= headingLevel(ctx, first)))) return 'reparent';
  } else if (!canCrossInto(below, first)) return null;
  return { at: below, where: 'first' };
}

/** The last section, `section` or a sub-heading at its end, that can hold `node` (a heading only under a heading of a higher level), or null. */
function lastSectionHolding(ctx: CommandContext, section: OutlineNode, node: OutlineNode): OutlineNode | null {
  const holds = (h: OutlineNode): boolean => node.kind !== 'heading' || headingLevel(ctx, h) < headingLevel(ctx, node);
  if (!holds(section)) return null;
  let into = section;
  for (let last = into.children[into.children.length - 1]; last?.kind === 'heading' && holds(last); last = into.children[into.children.length - 1]) into = last;
  return into;
}

/**
 * Whether a moved run starting with `node` can cross into `into` as its children: an item into an
 * item, a paragraph's list or a quote (which it can cross out of), anything but a heading into a
 * heading's section.
 */
function canCrossInto(into: OutlineNode, node: OutlineNode): boolean {
  if (into.kind === 'heading') return node.kind !== 'heading';
  if (node.kind === 'item') return into.kind === 'item' || into.kind === 'paragraph' || into.kind === 'quote';
  return false;
}
