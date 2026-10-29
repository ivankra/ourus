// What a selection is of the outline: the subtrees it touches, the subtrees it is when it is exactly
// them as whole lines (a subtree selection, a host's block selection), and the selection that is a set
// of subtrees.

import type { OurusSelection } from '../text/index.ts';
import type { OurusDoc } from './doc.ts';
import type { OurusNode } from './node.ts';
import { textEnd, textStart } from './text.ts';
import { foldOwner } from './view.ts';

/**
 * The topmost nodes whose own lines the selection touches, in document order, at whatever depths: a
 * caret's node, the innermost where nodes share a line (`- - a`: the inner item). A blank line is the
 * gap of the node above it; a selection ending at a line's very start doesn't touch that line. None
 * where no node is touched (the blank lines before the first, an empty document).
 */
export function touchedNodes(doc: OurusDoc, selection: OurusSelection): OurusNode[] {
  if (doc.lineCount === 0) return [];
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const lo = doc.lineAt(from).index;
  const end = doc.lineAt(to);
  // a selection ending at a line's very start doesn't take that line
  const hi = to > from && end.index > lo && end.from === to ? end.index - 1 : end.index;
  const touched = new Set<OurusNode>();
  for (let i = lo; i <= hi; i++) {
    const n = doc.nodeAtLine(i);
    if (n) touched.add(n);
  }
  if (!touched.size) {
    // (a placeholder's empty paragraph is on a line the tree reads as blank: its node is there)
    for (let i = lo; i >= 0; i--) {
      const owner = doc.nodeAtLine(i);
      if (owner) touched.add(owner);
      if (owner || !doc.isEmptyLine(i)) break;
    }
  }
  // a node a fold hides is its folded row's: the gap after a folded subtree, a folded row two nodes share
  const shown = new Set([...touched].map((n) => foldOwner(doc, n)));
  return [...shown].filter((n) => {
    for (let p = n.parent; p; p = p.parent) if (shown.has(p)) return false;
    return true;
  });
}

/**
 * The roots of a subtree selection: the nodes it touches when it runs from column 0 of the first's
 * first line to the end of the last's subtree, its last line's end, the next line's start (the
 * canonical shape), or anywhere in the blank lines after it; where nodes share those lines, the
 * outermost inside the zoom. Null for any other selection, for a caret, and for one node's own text,
 * which is text but at the document's end.
 */
export function selectedNodes(doc: OurusDoc, selection: OurusSelection): OurusNode[] | null {
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  if (from === to) return null;
  const touched = touchedNodes(doc, selection);
  if (!touched.length) return null;
  const roots = outermost(doc, touched);
  const first = roots[0]!;
  const last = roots[roots.length - 1]!;
  const { starts, ends } = doc.mdTree;
  if (from !== starts[first.startLine]) return null;
  if (to < ends[last.endLine]! || to > subtreeEnd(doc, doc.coverEnd(last))) return null;
  // one node's own text, from its text's start to its end: text, unless that is its subtree's end too
  if (roots.length === 1 && to !== subtreeEnd(doc, last.endLine)) {
    const text = doc.textOf(first);
    if (text && from === doc.posOf(first, textStart(text), 1) && to === doc.posOf(first, textEnd(text), -1)) return null;
  }
  return roots;
}

/**
 * The selection of the subtrees of `nodes` as whole lines, their closure: from column 0 of the
 * first's first line to the start of the line after the subtree of every node it touches (the
 * document's end where none follows), so what is between comes along whole (a paragraph between that
 * owns the list the last is in, `listParent`, with its whole list); zoomed, at the zoom's end where
 * they end it. The anchor at the top unless `direction` is `up`. Throws for no nodes, the root, a node outside the zoom or one a fold hides.
 */
export function subtreesSelection(doc: OurusDoc, nodes: readonly OurusNode[], direction: 'down' | 'up' = 'down'): OurusSelection {
  if (!nodes.length) throw new Error('no nodes to select');
  let start = Infinity;
  let end = -1;
  for (const node of nodes) {
    if (node.kind === 'root') throw new Error('the root is no node to select');
    if (doc.isHidden(node)) throw new Error(`node ${node.id} is hidden by ${outsideZoom(doc, node) ? 'the zoom' : 'a fold'}`);
    start = Math.min(start, node.startLine);
    end = Math.max(end, node.endLine);
  }
  const from = doc.mdTree.starts[start]!;
  // (the nodes touched between, each whole, and the nodes whose lines theirs are)
  for (const n of outermost(doc, touchedNodes(doc, { anchor: from, head: subtreeEnd(doc, end) }))) end = Math.max(end, n.endLine);
  // (zoomed, not past the zoom: the line break after it is out of the view)
  const zoom = doc.zoomRange();
  const to = Math.min(subtreeEnd(doc, end), zoom ? zoom.to : Infinity);
  return direction === 'up' ? { anchor: to, head: from } : { anchor: from, head: to };
}

/** Where a selection of whole lines ending with line `line` ends: the next line's start, or the document's end. */
function subtreeEnd(doc: OurusDoc, line: number): number {
  return line + 1 < doc.lineCount ? doc.mdTree.starts[line + 1]! : doc.text.length;
}

/**
 * `roots`, each run of them that is all of a node's children, where that node's lines are theirs and
 * the blank lines after them (an item whose first child starts on its line, `- - a`; a quote
 * without a title), that node instead,
 * outward, but not past the zoom's root.
 */
function outermost(doc: OurusDoc, roots: readonly OurusNode[]): OurusNode[] {
  let out = [...roots];
  for (let lifted = true; lifted; ) {
    lifted = false;
    const next: OurusNode[] = [];
    for (let i = 0; i < out.length; ) {
      const parent = out[i]!.parent!;
      let j = i;
      while (j < out.length && out[j]!.parent === parent) j++;
      const run = out.slice(i, j);
      // (the parent's last lines the blank lines after them: a quote's `>` after its last item)
      const last = run[run.length - 1]!;
      const ends = parent.endLine >= last.endLine && parent.endLine <= last.endLine + last.lastDescendant.gap;
      const whole = parent.kind !== 'root' && run.length === parent.children.length && parent.startLine === run[0]!.startLine && ends;
      if (whole && !outsideZoom(doc, parent)) {
        next.push(parent);
        lifted = true;
      } else next.push(...run);
      i = j;
    }
    out = next;
  }
  return out;
}

/** Whether `node` is outside the zoom's root's subtree (false where not zoomed). */
function outsideZoom(doc: OurusDoc, node: OurusNode): boolean {
  if (doc.zoom === null) return false;
  for (let p: OurusNode | null = node; p; p = p.parent) if (p.id === doc.zoom) return false;
  return true;
}
