// Where a position is: in a node's text, in its frame, in a marker or a container's
// prefix, on a blank line (whose gap it is), in the preamble, or on no line.

import type { MdLine } from '../parser/index.ts';
import { lineIndexAt } from '../text/index.ts';
import type { OutlineNode } from './node.ts';
import type { OurusDoc } from './doc.ts';
import type { OutlineNodeText } from './text.ts';

export type Located =
  /** In a node's text: `offset` in its string (`text.text`, the frame included). */
  | { readonly zone: 'text'; readonly node: OutlineNode; readonly text: OutlineNodeText; readonly offset: number }
  /** In a frame part (a checkbox, `#`s, a fence, ...): `offset` in the text's string. */
  | { readonly zone: 'frame'; readonly node: OutlineNode; readonly text: OutlineNodeText; readonly part: string; readonly offset: number }
  /**
   * In an item's marker piece (`marker`): its indentation, its marker's characters, or the padding
   * after them (`part`, a position right after the marker its padding's); or in another container's
   * prefix piece (`prefix`): which piece of the line, and where in it.
   */
  | { readonly zone: 'marker'; readonly node: OutlineNode; readonly line: MdLine; readonly piece: number; readonly offset: number; readonly part: 'indent' | 'marker' | 'padding' }
  | { readonly zone: 'prefix'; readonly node: OutlineNode; readonly line: MdLine; readonly piece: number; readonly offset: number }
  /** On a blank line: the node above's, whose gap it is. */
  | { readonly zone: 'gap'; readonly owner: OutlineNode }
  /** Before the first node (frontmatter, blank lines), or past the last line. */
  | { readonly zone: 'preamble' | 'none' };

export function locate(doc: OurusDoc, pos: number): Located {
  const tree = doc.mdTree;
  if (tree.lineCount === 0 || pos < 0 || pos > doc.text.length) return { zone: 'none' };
  const line = tree.line(lineIndexAt(tree.starts, pos));
  // past the final line ending: on no line
  if (pos > line.to) return { zone: 'none' };
  const node = doc.nodeAtLine(line.index);
  if (!node) {
    const owner = extentOwner(doc.rootNode, line.index);
    return owner ? { zone: 'gap', owner } : { zone: 'preamble' };
  }
  if (pos < line.contentFrom) {
    const piece = line.prefix.findIndex((p) => p.from <= pos && pos < p.to);
    const at = piece < 0 ? line.prefix.length - 1 : piece;
    const p = line.prefix[at];
    if (p?.kind === 'marker') {
      const [start, end] = [doc.mdTree.markerFrom(p.container), doc.mdTree.markerTo(p.container)];
      return { zone: 'marker', node, line, piece: at, offset: pos - p.from, part: pos < start ? 'indent' : pos < end ? 'marker' : 'padding' };
    }
    if (p) return { zone: 'prefix', node, line, piece: at, offset: pos - p.from };
  }
  const text = doc.textOf(node);
  if (!text) return { zone: 'none' };
  const offset = doc.offsetOf(node, pos);
  // a closing frame's start is the end of the text: an underline starts with the line break after the
  // title, an ATX title's closing `#`s with the blanks before them
  const part = text.frame.find((p) => p.from <= offset && offset < p.to && !((p.part === 'underline' || (p.part === 'close' && text.type === 'heading')) && offset === p.from));
  return part ? { zone: 'frame', node, text, part: part.part, offset } : { zone: 'text', node, text, offset };
}

/** The deepest node whose extent holds `line` (its text, its children or its blank lines), or null before the first node. */
function extentOwner(root: OutlineNode, line: number): OutlineNode | null {
  let node = root;
  for (;;) {
    const { offsets, children } = node.persistentNode;
    const rel = line - node.startLine;
    let k = -1;
    for (let i = offsets.length - 1; i >= 0; i--) {
      if (offsets[i]! <= rel) {
        k = i;
        break;
      }
    }
    if (k < 0 || rel >= offsets[k]! + children[k]!.lines) return node.kind === 'root' ? null : node;
    node = node.child(k);
  }
}
