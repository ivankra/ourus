// Ordered lists renumbered after an edit: the markers rewritten, and the lines a wider or narrower
// marker moves.

import type { OutlineState, OutlineNode } from '../outline/index.ts';
import type { Block } from '../parser/index.ts';
import { applyChanges, mapPos, type ChangeSpec } from '../text.ts';
import { reindent, usesTabs } from './indent.ts';
import type { OutlinePlan, PlanTree } from './outline-plan.ts';

/**
 * Renumbers the ordered lists whose items a plan adds, removes or reorders. A changed list counts
 * from the start of the list its first surviving item came from, so removing the head of `1. 2. 3.`
 * makes the rest `1. 2.`; the lower part of a list split in two keeps its own numbers. A list
 * keeping its items keeps its numbers, however they run, and lists numbered all alike (`1.` `1.`
 * `1.`) are left alone. A marker that changes width carries the item's other lines along. Returns
 * the changes to make after `changes`, in the coordinates of their result, or null when nothing
 * needs renumbering. `params` read the new text as the command will (moved ids, placeholders).
 */
export function renumber(doc: OutlineState, changes: readonly ChangeSpec[], plan: OutlinePlan, params: { identity?: ReadonlyMap<number, number>; placeholders: readonly number[] }, hasOrderedItems: boolean): ChangeSpec[] | null {
  // nothing to renumber without an ordered list, before or written
  if (!hasOrderedItems && !changes.some((change) => /(?:^|\n)[ \t>]*\d{1,9}[.)]/.test(change.insert))) return null;
  const text = applyChanges(doc.text, changes);
  const next = doc.update(changes, { ...(params.identity ? { identity: params.identity } : {}), placeholders: params.placeholders });
  const itemIds = (d: OutlineState): Map<Block, number> => new Map(d.nodes.filter((n) => n.kind === 'item').map((n) => [n.block, n.id]));
  const before = itemIds(doc);
  const after = itemIds(next);
  const oldItem = new Map<number, Block>();
  for (const [item, id] of before) oldItem.set(id, item);
  const newList = new Map<number, Block>();
  for (const [item, id] of after) newList.set(id, item.parent!);
  const changed = (list: Block): boolean => {
    const ids = list.children.map((item) => after.get(item));
    // a list the outline doesn't reach into (inside a quote) no command changed
    if (ids.some((id) => id === undefined)) return false;
    const old = oldItem.get(ids[0]!)?.parent;
    return !old || old.children.length !== ids.length || old.children.some((item, i) => before.get(item) !== ids[i]);
  };
  const startOf = (list: Block, numbers: readonly number[]): number => {
    const known = list.children.find((item) => oldItem.has(after.get(item)!));
    const old = known && oldItem.get(after.get(known)!)!.parent!;
    if (!old) return numbers[0]!;
    // the old list's head still opens an earlier list beside this one: this is the lower part of a split
    const headList = newList.get(before.get(old.children[0]!)!);
    if (headList && headList !== list && headList.parent === list.parent && headList.startLine < list.startLine) return numbers[0]!;
    return parseInt(doc.text.slice(doc.markerFrom(old.children[0]!), doc.markerTo(old.children[0]!)), 10);
  };
  const tabs = usesTabs(next);
  const extra: ChangeSpec[] = [];
  let failed = false;
  const walk = (b: Block): void => {
    if (b.type === 'list' && b.list!.type === 'ordered') {
      const numbers = b.children.map((item) => parseInt(text.slice(next.markerFrom(item), next.markerTo(item)), 10));
      const alike = numbers.length > 1 && numbers.every((n) => n === numbers[0]);
      if (!alike && changed(b)) {
        const start = startOf(b, numbers);
        b.children.forEach((item, i) => {
          if (numbers[i] === start + i) return;
          const marker = `${start + i}${item.list!.delimiter}`;
          extra.push({ from: next.markerFrom(item), to: next.markerTo(item), insert: marker });
          // a wider or narrower marker moves the item's content column: its other lines follow
          const delta = marker.length - (next.markerTo(item) - next.markerFrom(item));
          for (let lineNo = item.startLine + 1; lineNo <= item.endLine && delta !== 0; lineNo++) {
            const c = reindent(next, lineNo, item, item, delta, tabs);
            if (c === 'fail') failed = true;
            else if (c) extra.push(c);
          }
        });
      }
    }
    b.children.forEach(walk);
  };
  walk(next.syntaxTree.root);
  if (failed) return null;

  // Items the plan keeps in their list, which the planned text no longer reads as items: a list
  // that lost its head and now starts at `2.` can't interrupt the text above it. They renumber
  // from the old list's start, where their markers landed.
  const expectedParent = new Map<number | null, number | null>();
  const visit = (n: PlanTree): void => n.children.forEach((c) => (expectedParent.set(c.id, n.id), visit(c)));
  visit(plan.root);
  const lists = new Set<Block>();
  for (const n of doc.nodes) if (n.kind === 'item' && n.block.list!.type === 'ordered') lists.add(n.block.parent!);
  for (const list of lists) {
    const nodes = list.children.map((item) => doc.node(before.get(item)!)!);
    const owner = nodes[0]!.parent!.id;
    const kept = nodes.filter((n) => expectedParent.get(n.id) === owner);
    if (kept.length === nodes.length || kept.every((n) => next.node(n.id)?.kind === 'item')) continue;
    const start = parseInt(doc.text.slice(doc.markerFrom(list.children[0]!), doc.markerTo(list.children[0]!)), 10);
    kept.forEach((n, i) => {
      const old = doc.text.slice(doc.markerFrom(n.block), doc.markerTo(n.block));
      const at = mapPos(changes, doc.markerFrom(n.block), 1);
      const marker = `${start + i}${n.block.list!.delimiter}`;
      if (text.slice(at, at + old.length) === old && old !== marker && !extra.some((c) => c.from === at)) {
        extra.push({ from: at, to: at + old.length, insert: marker });
      }
    });
  }
  return extra.length === 0 ? null : extra;
}
