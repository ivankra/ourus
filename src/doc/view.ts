// What a view shows of the document: the folds and the zoom a snapshot carries,
// the lines a fold hides and a zoom shows, by the outline (not by indentation), and the node a row's
// fold belongs to.

import type { OurusDoc } from './doc.ts';
import type { OutlineNode } from './node.ts';

/** A view's state: the nodes whose children it hides, and the node it is zoomed into (null: none). */
export interface ViewState {
  readonly folded: ReadonlySet<number>;
  readonly zoom: number | null;
}

export const NO_VIEW: ViewState = { folded: new Set(), zoom: null };

/**
 * What folding `node` hides, in offsets: from the end of its text to the end of its subtree's last
 * line, the blank lines after it not included; null where it has no children, or they hide nothing
 * (all on its own last line of text).
 */
export function foldRange(doc: OurusDoc, node: OutlineNode): { from: number; to: number } | null {
  if (node.kind === 'root' || !node.children.length) return null;
  const { ends } = doc.mdTree;
  const from = ends[node.textLastLine]!;
  const to = ends[node.endLine]!;
  return to > from ? { from, to } : null;
}

/** A node's last line with its descendants' and the blank lines after them, up to the next node not its own. */
export function coverEnd(doc: OurusDoc, node: OutlineNode): number {
  const stop = node.startLine + node.persistentNode.lines;
  let end = node.endLine;
  while (end + 1 < stop && doc.mdTree.line(end + 1).blank) end++;
  return end;
}

/** What the zoom shows, in offsets: its root's lines, its descendants' and its trailing gap; null where not zoomed. */
export function zoomRange(doc: OurusDoc): { from: number; to: number } | null {
  const root = doc.zoom === null ? undefined : doc.node(doc.zoom);
  if (!root) return null;
  return { from: doc.mdTree.starts[root.startLine]!, to: doc.mdTree.ends[coverEnd(doc, root)]! };
}

/** The nodes starting on `line`, outermost first (more than one where a node's first child starts on its own first line: `- - a`, `> a`). */
export function startingAt(doc: OurusDoc, line: number): OutlineNode[] {
  const found: OutlineNode[] = [];
  let node = doc.rootNode;
  for (;;) {
    const children = node.children;
    // the last child starting at or before the line
    let lo = 0;
    let hi = children.length - 1;
    let at = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (children[mid]!.startLine <= line) {
        at = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    if (at < 0) return found;
    const child = children[at]!;
    if (line >= child.startLine + child.persistentNode.lines) return found;
    if (child.startLine === line) found.push(child);
    else if (found.length) return found;
    node = child;
  }
}

/** The ids of `folded` whose fold is in effect within the zoom: those of nodes strictly inside its root; all of them where not zoomed. */
export function zoomFolded(doc: OurusDoc): ReadonlySet<number> {
  if (doc.zoom === null) return doc.folded;
  const inside = new Set<number>();
  for (const id of doc.folded) {
    for (let p = doc.node(id)?.parent ?? null; p; p = p.parent) {
      if (p.id === doc.zoom) {
        inside.add(id);
        break;
      }
    }
  }
  return inside;
}

/** Whether a view hides `node`: under a fold in effect (`zoomFolded`), or outside the zoom. */
export function isHidden(doc: OurusDoc, node: OutlineNode): boolean {
  const folds = doc.zoomFolded;
  let zoomed = doc.zoom === null;
  for (let p: OutlineNode | null = node; p; p = p.parent) {
    if (p !== node && folds.has(p.id)) return true;
    if (p.id === doc.zoom) zoomed = true;
  }
  return !zoomed;
}

/**
 * `view` as `doc` can hold it: the folds of nodes it has, with children (`foldRange`), and the zoom
 * where its node is there, else none.
 */
export function viewIn(doc: OurusDoc, view: ViewState): ViewState {
  if (!view.folded.size && view.zoom === null) return NO_VIEW;
  const folded = new Set<number>();
  for (const id of view.folded) {
    const node = doc.node(id);
    if (node && foldRange(doc, node)) folded.add(id);
  }
  const zoom = view.zoom !== null && view.zoom !== 0 && doc.node(view.zoom) ? view.zoom : null;
  return { folded, zoom };
}

/**
 * `view`, of `from`, carried by line onto `doc`, whose ids aren't `from`'s (the text read anew): a
 * fold kept where the node now starting on its node's line folds, the zoom where a node of its
 * root's kind starts on its root's line; each else dropped.
 */
export function viewByLine(from: OurusDoc, doc: OurusDoc, view: ViewState): ViewState {
  if (!view.folded.size && view.zoom === null) return NO_VIEW;
  const folded = new Set<number>();
  for (const id of view.folded) {
    const old = from.node(id);
    const now = old && startingAt(doc, old.startLine)[0];
    if (now) folded.add(now.id);
  }
  const root = view.zoom === null ? undefined : from.node(view.zoom);
  const zoom = root ? (startingAt(doc, root.startLine).find((n) => n.kind === root.kind)?.id ?? null) : null;
  return viewIn(doc, { folded, zoom });
}

/** What a fold hides, as nodes: each descendant's id, kind and text, in order; a change to it opens the fold. */
export function hiddenContent(doc: OurusDoc, node: OutlineNode): string {
  const out: string[] = [];
  const visit = (n: OutlineNode): void => {
    for (const c of n.children) {
      out.push(`${c.id}\u0000${c.kind}\u0000${doc.textOf(c)?.text ?? ''}`);
      visit(c);
    }
  };
  visit(node);
  return out.join('\u0001');
}

/** The node `id` and its ancestors, the root aside, nearest first: `from`'s, by id. */
function ancestry(from: OurusDoc, id: number): number[] {
  const out: number[] = [];
  for (let p: OutlineNode | null = from.node(id) ?? null; p && p.kind !== 'root'; p = p.parent) out.push(p.id);
  return out;
}

/** The ids of `node`'s subtree, itself included. */
export function subtreeIds(node: OutlineNode): Set<number> {
  const ids = new Set<number>();
  const visit = (n: OutlineNode): void => {
    ids.add(n.id);
    n.children.forEach(visit);
  };
  visit(node);
  return ids;
}

/**
 * The view of `from` carried onto `doc`, a later snapshot of its lineage that `changes` made (in
 * `from`'s offsets), by an edit nothing could refuse or by a writer whose ids `doc` has:
 * - a fold stays where its node is there with something to hide, and, but for the zoom root's and its
 *   ancestors' (which hide nothing while zoomed), where what it hides is the same nodes with the same
 *   texts (a fold no change reaches, in its node's lines through the line after its cover, is not
 *   read); else it opens;
 * - the zoom stays where its root is there and no node of its subtree left it; where its root went, it
 *   goes to the nearest ancestor left (none at the top level); where a node left, it ends.
 */
export function carryView(from: OurusDoc, doc: OurusDoc, changes: readonly { from: number; to: number }[]): ViewState {
  if (!from.folded.size && from.zoom === null) return NO_VIEW;
  const suppressed = new Set(from.zoom === null ? [] : ancestry(from, from.zoom));
  const folded = new Set<number>();
  for (const id of from.folded) {
    const now = doc.node(id);
    if (!now || !foldRange(doc, now)) continue;
    const old = from.node(id);
    const range = old && foldRange(from, old);
    // a change in its own lines (a heading's `#`s: its section can grow), in what it hides, or right
    // after it, past the blank lines (a node indented under it)
    const start = old && from.mdTree.starts[old.startLine]!;
    const reach = old && from.mdTree.starts[coverEnd(from, old) + 1];
    const reached = !range || changes.some((c) => c.from <= (reach ?? from.text.length) && c.to >= start!);
    if (!suppressed.has(id) && reached && (!old || hiddenContent(from, old) !== hiddenContent(doc, now))) continue;
    folded.add(id);
  }
  let zoom: number | null = null;
  if (from.zoom !== null) {
    const root = doc.node(from.zoom);
    if (!root) zoom = ancestry(from, from.zoom).slice(1).find((id) => doc.node(id)) ?? null;
    else {
      const inside = subtreeIds(root);
      const left = [...subtreeIds(from.node(from.zoom)!)].some((id) => doc.node(id) && !inside.has(id));
      zoom = left ? null : from.zoom;
    }
  }
  return { folded, zoom };
}

/**
 * Where `next` leaves the zoom of `doc`, or null where it keeps it: the root keeps its id, its parent
 * and its place; every node outside its subtree keeps its id, parent, kind and text, none is made
 * outside it, none inside leaves it; the text before the root's own Markdown and after its cover's end
 * is the same; the lists the root and its ancestors are items of (a node that is no item a list of its
 * own) keep their items, and those with an item off its path their tightness. `removed`: the root went
 * with its subtree, a removal of it whole: its textless ancestors may go too, and the text isn't asked.
 */
export function zoomEscape(doc: OurusDoc, next: OurusDoc, removed = false): string | null {
  if (doc.zoom === null) return null;
  const root = doc.node(doc.zoom)!;
  const now = next.node(doc.zoom);
  if (!now && !removed) return 'the zoom root went';
  if (now && !removed) {
    if ((now.parent?.id ?? 0) !== (root.parent?.id ?? 0) || now.index !== root.index) return 'the zoom root moved';
  }
  const inside = subtreeIds(root);
  const insideNow = now ? subtreeIds(now) : new Set<number>();
  const textless = new Set<number>();
  if (removed) for (let p = root.parent; p && p.kind !== 'root' && !doc.textOf(p) && !next.node(p.id); p = p.parent) textless.add(p.id);
  let escape: string | null = null;
  const visit = (n: OutlineNode): void => {
    if (escape) return;
    if (n.kind !== 'root' && !inside.has(n.id) && !textless.has(n.id)) {
      const m = next.node(n.id);
      if (!m) escape = `node ${n.id}, outside the zoom, went`;
      else if ((m.parent?.id ?? 0) !== (n.parent?.id ?? 0)) escape = `node ${n.id}, outside the zoom, has another parent`;
      else if (m.kind !== n.kind || next.textOf(m)?.text !== doc.textOf(n)?.text) escape = `node ${n.id}, outside the zoom, changed`;
    } else if (inside.has(n.id) && next.node(n.id) && !insideNow.has(n.id)) escape = `node ${n.id} left the zoom`;
    n.children.forEach(visit);
  };
  visit(doc.rootNode);
  if (escape) return escape;
  const made = (n: OutlineNode): string | null => {
    if (n.kind !== 'root' && n.id >= doc.nextId && !insideNow.has(n.id)) return `node ${n.id} was made outside the zoom`;
    for (const c of n.children) {
      const found = made(c);
      if (found) return found;
    }
    return null;
  };
  const outside = made(next.rootNode);
  if (outside) return outside;
  if (removed || !now) return null;
  if (doc.text.slice(0, doc.markdownStart(root)) !== next.text.slice(0, next.markdownStart(now))) return 'the text before the zoom root changed';
  if (doc.text.slice(doc.mdTree.ends[coverEnd(doc, root)]!) !== next.text.slice(next.mdTree.ends[coverEnd(next, now)]!)) return 'the text after the zoom changed';
  // (a node that is no item is alone, as in a list of its own: made one, the root or an ancestor
  // mustn't join its neighbours' list, nor one leave its list by becoming none)
  const items = (d: OurusDoc, x: OutlineNode): number[] => {
    if (x.kind !== 'item') return [x.id];
    const list = d.listOf(x)?.block;
    return x.parent!.children.filter((c) => c.kind === 'item' && d.listOf(c)?.block === list).map((c) => c.id);
  };
  for (let a: OutlineNode | null = root, b: OutlineNode | null = now; a && b && a.kind !== 'root'; a = a.parent, b = b.parent) {
    const [itemsA, itemsB] = [items(doc, a), items(next, b)];
    if (itemsA.join() !== itemsB.join()) return `the list node ${a.id} is an item of changed its items`;
    if (a.kind === 'item' && b.kind === 'item' && itemsA.length > 1 && doc.listOf(a)?.block.attrs.tight !== next.listOf(b)?.block.attrs.tight) return `the list node ${a.id} is an item of changed its tightness`;
  }
  return null;
}
