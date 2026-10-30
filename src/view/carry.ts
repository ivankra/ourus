// Carrying a view through an edit: the folds and the zoom of one snapshot put on another of its
// lineage, by node (a fold goes with its node and opens where what it hides changed; the zoom goes
// with its root), or by line where the ids are new (a flavor change).

import { startingAt, type OurusDoc, type OurusNode } from '../doc/index.ts';

/** A view's state: the nodes whose children it hides, and the node it is zoomed into (null: none). */
export interface ViewState {
  readonly folded: ReadonlySet<number>;
  readonly zoom: number | null;
}

export const NO_VIEW: ViewState = { folded: new Set(), zoom: null };

/**
 * `view` as `doc` can hold it: the folds of nodes it has, with children (`foldRange`), and the zoom
 * where its node is there, else none.
 */
export function viewIn(doc: OurusDoc, view: ViewState): ViewState {
  if (!view.folded.size && view.zoom === null) return NO_VIEW;
  const folded = new Set<number>();
  for (const id of view.folded) {
    const node = doc.node(id);
    if (node?.foldable) folded.add(id);
  }
  const zoom = view.zoom !== null && view.zoom !== 0 && doc.node(view.zoom) ? view.zoom : null;
  return { folded, zoom };
}

/**
 * `view`, of `from`, carried by line onto `doc`, whose ids aren't `from`'s (the text read anew): a
 * fold kept, and the zoom, on the node of its node's kind starting on its node's line, at its depth
 * there where that one is of the kind; each else dropped.
 */
export function viewByLine(from: OurusDoc, doc: OurusDoc, view: ViewState): ViewState {
  if (!view.folded.size && view.zoom === null) return NO_VIEW;
  // (by depth among the nodes starting on the line, an item's first child on its marker's line)
  const onLine = (id: number): OurusNode | undefined => {
    const old = from.node(id);
    if (!old) return undefined;
    const now = startingAt(doc, old.startLine);
    const at = now[startingAt(from, old.startLine).indexOf(old)];
    return at?.kind === old.kind ? at : now.find((n) => n.kind === old.kind);
  };
  const folded = new Set<number>();
  for (const id of view.folded) {
    const now = onLine(id);
    if (now) folded.add(now.id);
  }
  const zoom = view.zoom === null ? null : (onLine(view.zoom)?.id ?? null);
  return viewIn(doc, { folded, zoom });
}

/**
 * What a fold hides, as nodes: each descendant's id, kind and text, in order, but the text of one
 * all on the node's last line of text, which the fold shows (an item's first child on its marker's
 * line); a change to it opens the fold.
 */
export function hiddenContent(doc: OurusDoc, node: OurusNode): string {
  const out: string[] = [];
  const visit = (n: OurusNode): void => {
    for (const c of n.children) {
      const shown = c.textLastLine <= node.textLastLine;
      out.push(`${c.id}\u0000${c.kind}\u0000${shown ? '' : (doc.textOf(c)?.text ?? '')}`);
      visit(c);
    }
  };
  visit(node);
  return out.join('\u0001');
}

/** The node `id` and its ancestors, the root aside, nearest first: `from`'s, by id. */
function ancestry(from: OurusDoc, id: number): number[] {
  const node = from.node(id);
  return node ? [node, ...node.ancestors()].filter((p) => p.kind !== 'root').map((p) => p.id) : [];
}

/**
 * `view`, of `from`, carried onto `doc`, a later snapshot of its lineage that `changes` made (in
 * `from`'s offsets), by an edit nothing could refuse or by a writer whose ids `doc` has:
 * - a fold stays where its node is there with something to hide, and, but for the zoom root's and its
 *   ancestors' (which hide nothing while zoomed), where what it hides is the same nodes with the same
 *   texts (a fold no change reaches, in its node's lines through the line after its cover, is not
 *   read); else it opens;
 * - the zoom stays where its root is there and no node of its subtree left it; where its root went, it
 *   goes to the nearest ancestor left (none at the top level); where a node left, it ends.
 */
export function carryView(from: OurusDoc, view: ViewState, doc: OurusDoc, changes: readonly { from: number; to: number }[]): ViewState {
  if (!view.folded.size && view.zoom === null) return NO_VIEW;
  const suppressed = new Set(view.zoom === null ? [] : ancestry(from, view.zoom));
  const folded = new Set<number>();
  for (const id of view.folded) {
    const now = doc.node(id);
    if (!now?.foldable) continue;
    const old = from.node(id);
    const range = old && from.foldRange(old);
    // a change in its own lines (a heading's `#`s: its section can grow), in what it hides, or in the
    // node right after it, past the blank lines, through its text and the line after it (a node
    // indented under it, a heading's `#`s or a setext underline changed, a section it now takes in)
    const start = old && from.mdTree.starts[old.startLine]!;
    const below = old ? from.coverEnd(old) + 1 : 0;
    const next = old && below < from.lineCount ? from.nodeAtLine(below) : null;
    const reach = old && from.mdTree.starts[(next ? Math.max(next.textLastLine, below) : below) + 2];
    const reached = !range || changes.some((c) => c.from <= (reach ?? from.text.length) && c.to >= start!);
    if (!suppressed.has(id) && reached && (!old || hiddenContent(from, old) !== hiddenContent(doc, now))) continue;
    folded.add(id);
  }
  let zoom: number | null = null;
  if (view.zoom !== null) {
    const root = doc.node(view.zoom);
    if (!root) zoom = ancestry(from, view.zoom).slice(1).find((id) => doc.node(id)) ?? null;
    else {
      const inside = root.subtreeIds();
      const left = [...from.node(view.zoom)!.subtreeIds()].some((id) => doc.node(id) && !inside.has(id));
      zoom = left ? null : view.zoom;
    }
  }
  return { folded, zoom };
}
