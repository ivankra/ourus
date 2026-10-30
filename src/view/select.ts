// What a selection is of the outline, in what the reader sees: the subtrees it touches, the subtrees
// it is when it is exactly them as whole lines (a subtree selection, a host's block selection), the
// selection that is a set of subtrees, and a selection moved out of what the view hides.

import { textEnd, textStart, type OurusDoc, type OurusNode } from '../doc/index.ts';
import type { OurusSelection } from '../text/index.ts';
import type { OurusView } from './view.ts';

/**
 * `selection` moved out of what the view hides: an end in a fold's hidden lines to the fold's start
 * (the end of the folded node's text), but a non-empty selection's end at the fold's end where that
 * is the document's (a subtree selection of the folded node there, which has no line after it); an
 * end outside the zoom into it, before it to its root's text start, after it to its end.
 */
export function visibleSelection(view: OurusView, selection: OurusSelection): OurusSelection {
  const doc = view.doc;
  const empty = selection.anchor === selection.head;
  const at = (pos: number): number => {
    const zoom = view.zoomRange();
    if (zoom) {
      const root = view.zoomRoot!;
      if (pos < zoom.from) pos = doc.textStart(root.startLine);
      else if (pos > zoom.to) pos = zoom.to;
    }
    // the outermost fold hiding it, nested folds inside one another
    let start = pos;
    for (const id of view.zoomFolded) {
      const range = doc.foldRange(doc.node(id)!);
      if (range && pos > range.from && pos <= range.to && range.from < start && (empty || pos !== range.to || pos !== doc.text.length)) start = range.from;
    }
    return start;
  };
  const anchor = at(selection.anchor);
  const head = at(selection.head);
  return anchor === selection.anchor && head === selection.head ? selection : { anchor, head };
}

/**
 * The topmost nodes whose own lines the selection touches, in document order, at whatever depths: a
 * caret's node, the innermost where nodes share a line (`- - a`: the inner item). A blank line is the
 * gap of the node above it; a selection ending at a line's very start doesn't touch that line. None
 * where no node is touched (the blank lines before the first, an empty document).
 */
export function touchedNodes(view: OurusView, selection: OurusSelection): OurusNode[] {
  const doc = view.doc;
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
  const shown = new Set([...touched].map((n) => view.shown(n)));
  return [...shown].filter((n) => {
    for (const p of n.ancestors()) if (shown.has(p)) return false;
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
export function selectedNodes(view: OurusView, selection: OurusSelection): OurusNode[] | null {
  const doc = view.doc;
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  if (from === to) return null;
  const touched = touchedNodes(view, selection);
  if (!touched.length) return null;
  const roots = outermost(view, touched);
  const first = roots[0]!;
  const last = roots[roots.length - 1]!;
  const { starts, ends } = doc.mdTree;
  if (from !== starts[first.startLine]) return null;
  if (to < ends[last.endLine]! || to > subtreeEnd(doc, doc.coverEnd(last))) return null;
  // one node's own text, from its text's start to its end, or into the frame closing it on that line
  // (a block id, closing `#`s; not a setext underline): text, unless that is its subtree's end too
  if (roots.length === 1 && to !== subtreeEnd(doc, last.endLine)) {
    const text = doc.textOf(first);
    const end = text ? doc.posOf(first, textEnd(text), -1) : -1;
    if (text && from === doc.posOf(first, textStart(text), 1) && to >= end && to <= doc.posOf(first, text.text.length, -1) && !doc.text.slice(end, to).includes('\n')) return null;
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
export function subtreesSelection(view: OurusView, nodes: readonly OurusNode[], direction: 'down' | 'up' = 'down'): OurusSelection {
  const doc = view.doc;
  if (!nodes.length) throw new Error('no nodes to select');
  let start = Infinity;
  let end = -1;
  for (const node of nodes) {
    if (node.kind === 'root') throw new Error('the root is no node to select');
    if (view.isHidden(node)) throw new Error(`node ${node.id} is hidden by ${outsideZoom(view, node) ? 'the zoom' : 'a fold'}`);
    start = Math.min(start, node.startLine);
    end = Math.max(end, node.endLine);
  }
  const from = doc.mdTree.starts[start]!;
  // (the nodes touched between, each whole, and the nodes whose lines theirs are)
  for (const n of outermost(view, touchedNodes(view, { anchor: from, head: subtreeEnd(doc, end) }))) end = Math.max(end, n.endLine);
  // (zoomed, not past the zoom: the line break after it is out of the view)
  const zoom = view.zoomRange();
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
function outermost(view: OurusView, roots: readonly OurusNode[]): OurusNode[] {
  const doc = view.doc;
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
      if (whole && !outsideZoom(view, parent)) {
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
function outsideZoom(view: OurusView, node: OurusNode): boolean {
  return view.zoom !== null && !node.isWithin(view.zoom);
}
