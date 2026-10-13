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

interface Seam {
  /** Old blank lines to write. */
  readonly lines: readonly number[];
  /** New blank lines to write. */
  readonly blanks: number;
  /** Outside a list: a blank line may set the two apart. */
  readonly separable: boolean;
  /** Where it meets new text: after it, or before it (see `separate`). */
  readonly fresh: 'after' | 'before' | null;
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
  const separable = !((prev ?? unit).kind === 'item' && next.kind === 'item');
  const made = (lines: readonly number[]): Seam =>
    lines === own && rewritten !== null ? { lines: [], blanks: rewritten, separable, fresh } : { lines, blanks: 0, separable, fresh };
  // new text keeps its own gaps within it
  if (!old(unit) && !old(next)) return { lines: [], blanks: unit.gap, separable: false, fresh: null };
  // two units that were already next to each other keep what was between them
  const nextOld = nextUnit ? old(nextUnit) : null;
  if (old(unit) && (!nextUnit || nextOld) && (units.nextUnit.get(old(unit)!) ?? null) === nextOld) {
    // still, a seam whose quotes changed may need a blank line where a quote's `>` set them apart
    return fresh || unit.rerender || nextUnit?.rerender ? made(own) : kept(own);
  }
  // a first child follows its parent's own lines and their gap; new first children come right after
  // the parent's lines, its gap staying after them, unless they keep an old node's id (a node
  // converted to another kind is still where it was)
  const arrived = (placed: Placed): boolean => !old(placed) || old(placed)!.parent !== placed.parent!.node;
  // an item moved down below a paragraph, into its list, swaps with it around the blank lines between them
  const owner = next.parent?.node;
  if (!prev && owner?.kind === 'paragraph' && next.kind === 'item' && old(next) && old(next)!.parent === owner.parent && arrived(next) && old(next)!.startLine < owner.startLine) {
    return made(gapAfter(old(next)!));
  }
  if (!prev) return fresh === 'before' && next.edited?.id == null ? made([]) : fresh ? made(own) : kept(own);
  if (arrived(next) !== arrived(prev)) {
    // a run arriving from elsewhere takes the separation of the place it lands in, on both sides:
    // the gap after the last node before it that was already there, or its parent's own gap
    let landing: Placed | null = prev;
    while (landing && arrived(landing)) landing = landing.prev;
    // items arriving at the head of a paragraph's list are set apart from its items as the list sets them apart
    if (!landing && owner?.kind === 'paragraph' && next.kind === 'item' && old(next)) {
      return { lines: [], blanks: old(next)!.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    if (!landing) return made(next.parent?.node ? (units.gap.get(next.parent.node) ?? []) : []);
    const node = old(landing)!;
    // items joining a list after its last item are separated as the list separates its items; the
    // gap after the list goes after them
    if (arrived(next) && node.kind === 'item' && next.kind === 'item' && !continues(node, siblingAfter(node), true)) {
      return { lines: [], blanks: node.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    // at the end of the text, the gap there is how the text ends, not a separation
    const atEnd = units.nextUnit.get(units.lastUnit(node)) === null;
    return made(atEnd ? [] : gapAfter(node));
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

const siblingAfter = (node: OutlineNode): OutlineNode | undefined => {
  const siblings = node.parent?.children ?? [];
  return siblings[siblings.indexOf(node) + 1];
};
