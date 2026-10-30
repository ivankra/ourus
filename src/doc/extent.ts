// The outline's extents: what folding a node would hide, what zooming into it would show, and the
// nodes a row starts. Geometry of the outline, whatever is folded or zoomed (`view/` holds that).

import type { OurusDoc } from './doc.ts';
import type { OurusNode } from './node.ts';

/**
 * What folding `node` hides, in offsets: from the end of its own lines to the end of its subtree's last
 * line, the blank lines after it not included; null where it has no children, or they hide nothing
 * (all on its own last line of text).
 */
export function foldRange(doc: OurusDoc, node: OurusNode): { from: number; to: number } | null {
  if (!node.foldable) return null;
  const { ends } = doc.mdTree;
  // (after its own lines: a heading's block-id lines show, as its text does)
  return { from: ends[node.ownLastLine]!, to: ends[node.endLine]! };
}

/** A node's last line with its descendants' and the blank lines after them, up to the next node not its own. */
export function coverEnd(doc: OurusDoc, node: OurusNode): number {
  const stop = node.startLine + node.persistentNode.lines;
  let end = node.endLine;
  while (end + 1 < stop && doc.mdTree.line(end + 1).blank) end++;
  return end;
}

/** What zooming into `node` would show, in offsets: its lines, its descendants' and its trailing gap (`coverEnd`). */
export function coverRange(doc: OurusDoc, node: OurusNode): { from: number; to: number } {
  return { from: doc.mdTree.starts[node.startLine]!, to: doc.mdTree.ends[coverEnd(doc, node)]! };
}

/** The nodes starting on `line`, outermost first (more than one where a node's first child starts on its own first line: `- - a`, `> a`). */
export function startingAt(doc: OurusDoc, line: number): OurusNode[] {
  const found: OurusNode[] = [];
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
