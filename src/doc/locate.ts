// Where a position is: in a node's text, in its frame, in a marker or a container's
// prefix, on a block-id line a text carries, on a blank line (whose gap it is), in the preamble, or on
// no line.

import type { MdLine } from '../parser/index.ts';
import { lineIndexAt } from '../text/index.ts';
import type { OurusNode } from './node.ts';
import type { OurusDoc } from './doc.ts';
import type { OurusText } from './text.ts';

export type Located =
  /** In a node's text: `offset` in its string (`text.text`, the frame included). */
  | { readonly zone: 'text'; readonly node: OurusNode; readonly text: OurusText; readonly offset: number }
  /** In a frame part (a checkbox, `#`s, a fence, ...): `offset` in the text's string. */
  | { readonly zone: 'frame'; readonly node: OurusNode; readonly text: OurusText; readonly part: string; readonly offset: number }
  /**
   * In an item's marker piece (`marker`): its indentation, its marker's characters, or the padding
   * after them (`part`, a position right after the marker its padding's); or in another container's
   * prefix piece (`prefix`): which piece of the line, and where in it.
   */
  | { readonly zone: 'marker'; readonly node: OurusNode; readonly line: MdLine; readonly piece: number; readonly offset: number; readonly part: 'indent' | 'marker' | 'padding' }
  | { readonly zone: 'prefix'; readonly node: OurusNode; readonly line: MdLine; readonly piece: number; readonly offset: number }
  /**
   * On a block-id line a node's text carries after it (`OurusText.blockIdLines`), or a blank line
   * before one: which of them (`line`; on a blank line, the one after it, `blank`), and `offset` in
   * it, past its indentation (0 on a blank line and in the indentation).
   */
  | { readonly zone: 'blockIdLine'; readonly node: OurusNode; readonly text: OurusText; readonly line: number; readonly blank: boolean; readonly offset: number }
  /** On a blank line: the node above's, whose gap it is. */
  | { readonly zone: 'gap'; readonly owner: OurusNode }
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
    // (the node whose extent the line is in: after a subtree, its last descendant; the view's
    // `locate` gives the node the reader sees there, a folded one's)
    const owner = extentOwner(doc.rootNode, line.index);
    return owner ? { zone: 'gap', owner } : { zone: 'preamble' };
  }
  // (past its text, on the lines it carries: no offset in its string there)
  if (line.index > node.textLastLine) {
    const text = doc.textOf(node);
    return text ? blockIdLineAt(node, text, line, pos) : { zone: 'none' };
  }
  // (a quote that is the node's text, `OurusConfig.quotes`: its `>` the text's, frame or
  // characters)
  const quote = node.persistentNode.textQuote;
  const own = quote ? line.prefix.find((p) => p.container.block === quote) : undefined;
  if (pos < line.contentFrom && !(own && pos >= own.from)) {
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
  // (a line of the node before its text, a quote's `>` above its callout title, `>⏎> [!note] T`: its prefix)
  if (node.kind === 'quote' && line.index < node.textFirstLine && line.prefix.length) {
    const at = line.prefix.length - 1;
    return { zone: 'prefix', node, line, piece: at, offset: pos - line.prefix[at]!.from };
  }
  const offset = doc.offsetOf(node, pos);
  // a closing frame's start is the end of the text: an underline starts with the line break after the
  // title, an ATX title's closing `#`s and a block id with the blanks before them
  const part = text.frame.find((p) => p.from <= offset && offset < p.to && !((p.part === 'underline' || p.part === 'blockId' || (p.part === 'close' && text.type === 'heading')) && offset === p.from));
  return part ? { zone: 'frame', node, text, part: part.part, offset } : { zone: 'text', node, text, offset };
}

/** Where `pos`, on `line` past `node`'s text, is among the block-id lines the text carries. */
function blockIdLineAt(node: OurusNode, text: OurusText, line: MdLine, pos: number): Located {
  let at = node.textLastLine;
  for (const [k, carried] of text.blockIdLines.entries()) {
    at += carried.blankLines + 1;
    if (line.index < at) return { zone: 'blockIdLine', node, text, line: k, blank: true, offset: 0 };
    if (line.index === at) return { zone: 'blockIdLine', node, text, line: k, blank: false, offset: Math.max(0, pos - (line.to - carried.line.length)) };
  }
  return { zone: 'none' };
}

/** The deepest node whose extent holds `line` (its text, its children or its blank lines), or null before the first node. */
function extentOwner(root: OurusNode, line: number): OurusNode | null {
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
