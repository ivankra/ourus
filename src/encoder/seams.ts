// Units and seams: each node's own lines and its trailing gap, and the blank lines written between
// units (`spec/gaps.md`).

import type { OutlineState, OutlineNode } from '../outline/index.ts';
import type { Placed } from './layout.ts';

export interface Units {
  readonly preamble: readonly number[];
  /** Each node's own lines (absent for a node sharing its only line with a child: `- - a`). */
  readonly own: Map<OutlineNode, { first: number; last: number }>;
  /** The gap after each node's own lines: the blank lines up to the next node's. */
  readonly gap: Map<OutlineNode, number[]>;
  /** The last node with own lines in each node's subtree. */
  readonly lastUnit: (node: OutlineNode) => OutlineNode;
  /** The next node with own lines in the old document order. */
  readonly nextUnit: Map<OutlineNode, OutlineNode | null>;
  /** The last node with own lines in the text. */
  readonly last: OutlineNode | null;
}

export function unitsOf(doc: OutlineState): Units {
  const preamble: number[] = [];
  const own = new Map<OutlineNode, { first: number; last: number }>();
  const gap = new Map<OutlineNode, number[]>();
  const nextUnit = new Map<OutlineNode, OutlineNode | null>();
  let current: OutlineNode | null = null;
  for (const line of doc.lines) {
    const node = doc.nodeAtLine(line.index);
    if (!node) {
      if (current) gap.get(current)!.push(line.index);
      else preamble.push(line.index);
      continue;
    }
    if (node === current) {
      own.get(node)!.last = line.index;
      continue;
    }
    if (current) nextUnit.set(current, node);
    current = node;
    own.set(node, { first: line.index, last: line.index });
    gap.set(node, []);
  }
  if (current) nextUnit.set(current, null);
  const lastUnit = (node: OutlineNode): OutlineNode => {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const last = lastUnit(node.children[i]!);
      if (own.has(last)) return last;
    }
    return node;
  };
  return { preamble, own, gap, lastUnit, nextUnit, last: current };
}

/** Whether `after`, right after sibling `node`, continues `node`'s scope: siblings, and for an item, of its list. */
const continues = (node: OutlineNode, after: OutlineNode | undefined, sameList: boolean): boolean =>
  !!after && (node.kind !== 'item' || (after.kind === 'item' && (!sameList || after.block.parent === node.block.parent)));

/**
 * Whether old node `was`, now after `item` under `parent`, comes into `item`'s list from elsewhere: it
 * wasn't an item (it takes the list's marker), or was an item of another parent's list of the same kind.
 */
const joinsList = (item: OutlineNode, was: OutlineNode, parent: OutlineNode | null): boolean => {
  if (was.kind !== 'item') return true;
  if (was.parent === parent || was.block.parent === item.block.parent) return false;
  const [a, b] = [item.block.list!, was.block.list!];
  return a.type === b.type && a.bulletChar === b.bulletChar && a.delimiter === b.delimiter;
};

interface Seam {
  /** Old blank lines to write. */
  readonly lines: readonly number[];
  /** New blank lines to write. */
  readonly blanks: number;
  /** Outside a list: a blank line may set the two apart. */
  readonly separable: boolean;
  /** Where it meets new text: after it, or before it (see `separate`). */
  readonly fresh: 'after' | 'before' | null;
  /** Within new text. */
  readonly within?: boolean;
}

/**
 * The blank lines written after `unit` (the last own lines written), when node `next` comes next
 * and `nextUnit` is the next one with own lines (both null at the end of the text).
 */
export function seam(units: Units, unit: Placed, next: Placed | null, nextUnit: Placed | null): Seam {
  const gapAfter = (node: OutlineNode): number[] => units.gap.get(units.lastUnit(node)) ?? [];
  // a converted node counts as its old self here
  const old = (placed: Placed): OutlineNode | null => placed.node ?? placed.was;
  const own = old(unit) ? (units.gap.get(old(unit)!) ?? []) : [];
  // a rewritten node may say what its own gap is
  const rewritten = unit.node && unit.lines && unit.edited?.gap !== undefined ? unit.edited.gap : null;
  const kept = (lines: readonly number[]): Seam =>
    lines === own && rewritten !== null ? { lines: [], blanks: rewritten, separable: false, fresh: null } : { lines, blanks: 0, separable: false, fresh: null };
  // the end of the text keeps the old end's gap
  if (!next) return kept(units.last ? units.gap.get(units.last)! : []);
  const fresh = !unit.node ? 'after' : !next.node ? 'before' : null;
  const prev = next.prev;
  // within a list, and between a paragraph and the list it owns, where that list can interrupt it, no
  // blank line is needed
  const separable = !((prev ?? unit).kind === 'item' && next.kind === 'item') && !ownListFollows(unit, next);
  const made = (lines: readonly number[]): Seam =>
    lines === own && rewritten !== null ? { lines: [], blanks: rewritten, separable, fresh } : { lines, blanks: 0, separable, fresh };
  // new text keeps its own gaps within it; where it has none, a blank line may still set two of its
  // blocks apart, where Markdown needs one (two quotes, two paragraphs: a paste made tight)
  if (!old(unit) && !old(next)) return { lines: [], blanks: unit.gap, separable: unit.gap === 0 && separable, fresh: null, within: true };
  // the node that was right after this one, set off by its blank lines, now its first item: they
  // separated siblings, and a first item in a tight list needs none (a paragraph indented under an
  // item, an item indented back into a paragraph's list); an empty one still does, which right under
  // text would read as a setext underline
  if (!prev && next.kind === 'item' && next.parent === unit && old(next)?.head && old(unit) && units.nextUnit.get(units.lastUnit(old(unit)!)) === old(next)) {
    const list = unit.kind === 'item' ? (unit.node ?? unit.was)?.block.parent : null;
    if (unit.kind === 'paragraph' || list?.tight) return { lines: [], blanks: 0, separable: false, fresh: null };
  }
  // an empty item's first child comes right after its marker's line: a blank line there would end the
  // item, which can start with one blank line only
  if (!prev && next.parent === unit && unit.kind === 'item' && old(unit) && !old(unit)!.head && !unit.lines) return { lines: [], blanks: 0, separable: false, fresh: null };
  // two units that were already next to each other keep what was between them; but a node that was
  // right after a tight list, set off by its blank lines, and is now its last item, has none: they
  // separated it from the list, and in it would make the list loose (a paragraph indented under a
  // list's last item, an item indented back into a paragraph's list, an item into a quote's list)
  const nextOld = nextUnit ? old(nextUnit) : null;
  if (old(unit) && (!nextUnit || nextOld) && (units.nextUnit.get(old(unit)!) ?? null) === nextOld) {
    const was = old(next);
    const before = prev && old(prev);
    if (before && was && next.kind === 'item' && before.kind === 'item' && before.parent === prev!.parent?.node && before.block.parent!.tight && joinsList(before, was, next.parent?.node ?? null) && !continues(before, siblingAfter(before), true)) {
      return { lines: [], blanks: 0, separable: false, fresh: null };
    }
    // still, a seam whose quotes changed may need a blank line where a quote's `>` set them apart
    return fresh || unit.rerender || nextUnit?.rerender ? made(own) : kept(own);
  }
  // a first child follows its parent's own lines and their gap; new first children come right after
  // the parent's lines, its gap staying after them, unless they keep an old node's id (a node
  // converted to another kind is still where it was)
  const arrived = (placed: Placed): boolean => !old(placed) || old(placed)!.parent !== placed.parent!.node;
  // an item moved down below a paragraph, into its list, swaps with it around the blank lines between
  // them; where items of its list stay above, those blank lines end that list, and stay at its end,
  // the paragraph keeping its own gap above its list
  const owner = next.parent?.node;
  if (!prev && owner?.kind === 'paragraph' && next.kind === 'item' && old(next) && old(next)!.parent === owner.parent && arrived(next) && old(next)!.startLine < owner.startLine) {
    const item = old(next)!;
    const siblings = item.parent!.children;
    const above = siblings[siblings.indexOf(item) - 1];
    return made(above && continues(above, item, true) ? own : gapAfter(item));
  }
  // a run arriving from elsewhere as the first children of a childless node that ended its scope:
  // that node's gap is the scope's end gap, and stays at the end, after them (a run that was right
  // above the node, moving past it, keeps the blank line between them: see above)
  if (!prev && arrived(next) && next.parent === unit && old(unit) && old(unit)!.children.length === 0 && endsScope(units, old(unit)!) && !(old(next) && units.nextUnit.get(units.lastUnit(old(next)!)) === old(unit))) return made([]);
  // new items written at the head of the list a heading's section starts with (a paste, in that list's
  // form) join that list: the heading's gap stays above them, and below them the list's spacing (see
  // the landing case below)
  if (!prev && unit.kind === 'heading' && next.kind === 'item' && !old(next) && old(unit)?.children[0]?.kind === 'item') return made(own);
  // a list that can't interrupt a paragraph (ordered, from 2), first under one now, would continue it
  if (!prev && unit.kind === 'paragraph' && next.parent === unit && next.kind === 'item' && own.length === 0 && old(next) && !ownListFollows(unit, next)) {
    const nodeAfter = old(unit) ? units.nextUnit.get(units.lastUnit(old(unit)!)) : null;
    if (nodeAfter !== old(next)) return { lines: [], blanks: 1, separable: false, fresh: null };
  }
  // a paragraph first under an item's text would continue it, or under a quote's title where that is
  // a paragraph (a callout's, outside Obsidian): a blank line between, where none is
  const textAbove = (unit.kind === 'item' && (unit.lines || old(unit)?.head)) || (unit.kind === 'quote' && old(unit)?.head?.type === 'paragraph');
  if (!prev && next.kind === 'paragraph' && next.parent === unit && textAbove && own.length === 0) {
    return { lines: [], blanks: 1, separable: false, fresh: null };
  }
  // (a rewritten node that says what its own gap is keeps it before new first children)
  if (!prev) return fresh === 'before' && next.edited?.id == null && rewritten === null ? made([]) : fresh ? made(own) : kept(own);
  if (arrived(next) !== arrived(prev)) {
    // a run arriving from elsewhere takes the separation of the place it lands in, on both sides:
    // the gap after the last node before it that was already there, or its parent's own gap
    let landing: Placed | null = prev;
    while (landing && arrived(landing)) landing = landing.prev;
    // items arriving at the head of a paragraph's list, or new ones at the head of a section's, are set
    // apart from its items as the list sets them apart
    if (!landing && (owner?.kind === 'paragraph' || (owner?.kind === 'heading' && !old(prev) && prev.kind === 'item')) && next.kind === 'item' && old(next)) {
      return { lines: [], blanks: old(next)!.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    if (!landing) return made(next.parent?.node ? (units.gap.get(next.parent.node) ?? []) : []);
    const node = old(landing)!;
    // items joining a list after its last item are separated as the list separates its items; the
    // gap after the list goes after them
    if (arrived(next) && node.kind === 'item' && next.kind === 'item' && !continues(node, siblingAfter(node), true)) {
      return { lines: [], blanks: node.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    // at the end of the text, the gap there is how the text ends, not a separation; after the node
    // that ended its scope, the gap is the scope's end gap, and stays at its end, after the run
    const atEnd = units.nextUnit.get(units.lastUnit(node)) === null;
    return made(atEnd || endsScope(units, node) ? [] : gapAfter(node));
  }
  // a new node's subtree ends with the last unit written
  if (arrived(next)) return made(old(prev) ? gapAfter(old(prev)!) : own);
  // within one scope, a node's gap (its subtree's last) travels with it, but the gap that ends the
  // scope stays at its end
  const before = old(prev)!;
  const oldFinal = !continues(before, siblingAfter(before), true);
  const newFinal = !continues(before, old(next)!, true);
  if (oldFinal === newFinal) return made(gapAfter(before));
  if (oldFinal) {
    // the new last node's own gap comes up in exchange
    let last = next;
    while (last.next && old(last.next) && continues(old(last)!, old(last.next)!, false)) last = last.next;
    return made(gapAfter(old(last)!));
  }
  let last = before;
  for (let sibling = siblingAfter(last); continues(last, sibling, true); sibling = siblingAfter(last)) last = sibling!;
  return made(gapAfter(last));
}

/** Whether `node`'s subtree ended its parent's: the gap after it was the gap ending the parent's scope. */
const endsScope = (units: Units, node: OutlineNode): boolean => !!node.parent && node.parent.kind !== 'root' && units.lastUnit(node.parent) === units.lastUnit(node);

/**
 * Whether `next` is the first item of the list paragraph `unit` owns, and that list can interrupt a
 * paragraph (a bullet list, or an ordered one from 1, its first item not empty): right under the
 * paragraph's text, it reads as the paragraph's list without a blank line.
 */
function ownListFollows(unit: Placed, next: Placed): boolean {
  if (unit.kind !== 'paragraph' || next.kind !== 'item' || next.parent !== unit || unit.children[0] !== next) return false;
  const item = next.node ?? next.was;
  const list = item?.block.list;
  return !!list && item!.block.children.length > 0 && (list.type === 'bullet' || list.start === 1);
}

const siblingAfter = (node: OutlineNode): OutlineNode | undefined => {
  const siblings = node.parent?.children ?? [];
  return siblings[siblings.indexOf(node) + 1];
};
