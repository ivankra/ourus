// The zoom's invariant: where a later snapshot leaves a zoom, by its nodes, its text around the root,
// and the lists the root and its ancestors are items of.

import type { OurusDoc, OurusNode } from '../doc/index.ts';

/**
 * Where `next` leaves the zoom into `zoom` of `doc`, or null where it keeps it: the root keeps its id, its parent
 * and its place; every node outside its subtree keeps its id, parent, kind and text, none is made
 * outside it, none inside leaves it; the text before the root's own Markdown and after its cover's end
 * is the same; the lists the root and its ancestors are items of (a node that is no item a list of its
 * own) keep their items, and those with an item off its path their tightness. `removed`: the root went
 * with its subtree, a removal of it whole: its textless ancestors may go too, and the text isn't asked.
 */
export function zoomEscape(doc: OurusDoc, zoom: number, next: OurusDoc, removed = false): string | null {
  const root = doc.node(zoom)!;
  const now = next.node(zoom);
  if (!now && !removed) return 'the zoom root went';
  if (now && !removed) {
    if ((now.parent?.id ?? null) !== (root.parent?.id ?? null) || now.index !== root.index) return 'the zoom root moved';
  }
  const inside = root.subtreeIds();
  const insideNow = now ? now.subtreeIds() : new Set<number>();
  const textless = new Set<number>();
  if (removed) for (let p = root.parent; p && p.kind !== 'root' && !doc.textOf(p) && !next.node(p.id); p = p.parent) textless.add(p.id);
  let escape: string | null = null;
  // (side by side: under a node and its counterpart, the children both hold as they were, the same
  // persistent nodes in the same places from either end, are the same nodes, ids, kinds and texts: not
  // read again, so a keystroke in a long document costs what it changes)
  const middle = (a: OurusNode, b: OurusNode | undefined): [number, number] => {
    const [x, y] = [a.persistentNode.children, b?.persistentNode.children ?? []];
    let p = 0;
    while (p < x.length && p < y.length && x[p] === y[p]) p++;
    let q = 0;
    while (q < x.length - p && q < y.length - p && x[x.length - 1 - q] === y[y.length - 1 - q]) q++;
    return [p, x.length - q];
  };
  // (a node's counterpart in the other snapshot: where it is under the parent's, else by id)
  const counterpart = (d: OurusDoc, parent: OurusNode | undefined, k: number, id: number): OurusNode | undefined =>
    parent && parent.persistentNode.children[k]?.id === id ? parent.child(k) : d.node(id);
  const visit = (n: OurusNode, m: OurusNode | undefined): void => {
    if (escape) return;
    if (n.kind !== 'root' && !inside.has(n.id) && !textless.has(n.id)) {
      if (!m) escape = `node ${n.id}, outside the zoom, went`;
      else if ((m.parent?.id ?? null) !== (n.parent?.id ?? null)) escape = `node ${n.id}, outside the zoom, has another parent`;
      else if (m.kind !== n.kind || next.textOf(m)?.text !== doc.textOf(n)?.text) escape = `node ${n.id}, outside the zoom, changed`;
    } else if (inside.has(n.id) && m && !insideNow.has(n.id)) escape = `node ${n.id} left the zoom`;
    const [from, to] = middle(n, m);
    for (let k = from; k < to && !escape; k++) visit(n.child(k), counterpart(next, m, k, n.persistentNode.children[k]!.id));
  };
  visit(doc.rootNode, next.rootNode);
  if (escape) return escape;
  const made = (m: OurusNode, n: OurusNode | undefined): string | null => {
    if (m.kind !== 'root' && m.id >= doc.nextId && !insideNow.has(m.id)) return `node ${m.id} was made outside the zoom`;
    const [from, to] = middle(m, n);
    for (let k = from; k < to; k++) {
      const found = made(m.child(k), counterpart(doc, n, k, m.persistentNode.children[k]!.id));
      if (found) return found;
    }
    return null;
  };
  const outside = made(next.rootNode, doc.rootNode);
  if (outside) return outside;
  if (removed || !now) return null;
  if (doc.text.slice(0, doc.markdownStart(root)) !== next.text.slice(0, next.markdownStart(now))) return 'the text before the zoom root changed';
  if (doc.text.slice(doc.mdTree.ends[doc.coverEnd(root)]!) !== next.text.slice(next.mdTree.ends[next.coverEnd(now)]!)) return 'the text after the zoom changed';
  // (a node that is no item is alone, as in a list of its own: made one, the root or an ancestor
  // mustn't join its neighbours' list, nor one leave its list by becoming none)
  // (by its count and its first and last items: every node outside the root keeps its id and parent,
  // above, so a list holding the same ones there holds the same between; none read one by one)
  const items = (d: OurusDoc, x: OurusNode): number[] => {
    if (x.kind !== 'item') return [x.id];
    const listAt = d.listOf(x);
    if (!listAt) return [x.id];
    const list = listAt.block;
    const at = (k: number): number => {
      let n = d.nodeAtLine(listAt.line + list.offsets[k]!);
      while (n && n.block !== list.children[k]) n = n.parent;
      return n?.id ?? -1;
    };
    return [list.children.length, at(0), at(list.children.length - 1)];
  };
  for (let a: OurusNode | null = root, b: OurusNode | null = now; a && b && a.kind !== 'root'; a = a.parent, b = b.parent) {
    const [itemsA, itemsB] = [items(doc, a), items(next, b)];
    if (itemsA.join() !== itemsB.join()) return `the list node ${a.id} is an item of changed its items`;
    if (a.kind === 'item' && b.kind === 'item' && itemsA[0]! > 1 && doc.listOf(a)?.block.attrs.tight !== next.listOf(b)?.block.attrs.tight) return `the list node ${a.id} is an item of changed its tightness`;
  }
  return null;
}
