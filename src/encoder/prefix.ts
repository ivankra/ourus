// What hand-written edits write at a line's start, read from the current text: a new sibling's
// prefix and marker, a child's indentation, the containers' prefix of a new line.

import type { OutlineState, OutlineNode } from '../outline/index.ts';
import type { PrefixPiece } from '../parser/index.ts';
import { skipSpaces } from '../text.ts';

/** The text that starts a new line at `node`'s level, up to its marker: outer prefixes plus indentation. */
export function siblingPrefix(doc: OutlineState, node: OutlineNode): string {
  const line = doc.lines[node.startLine]!;
  const own = line.prefix.findIndex((p) => p.block === node.block);
  const outer = line.prefix.slice(0, own);
  const ownPiece = line.prefix[own]!;
  // outer containers whose marker is also on this line (`- - a`) are rewritten as indentation
  if (outer.every((p) => p.block.type === 'blockquote' || p.block.startLine < node.startLine)) {
    return doc.text.slice(line.from, doc.markerFrom(node.block));
  }
  return continuation(doc, outer) + doc.text.slice(ownPiece.from, doc.markerFrom(node.block));
}

/** The text before a child block's first character: the containers' prefixes, then its indentation. */
export function childIndent(doc: OutlineState, node: OutlineNode, child: OutlineNode): string {
  const line = doc.lines[child.startLine]!;
  const own = line.prefix.findIndex((p) => p.block === node.block);
  let end = own >= 0 ? line.prefix[own]!.to : line.from;
  end = skipSpaces(doc.text, end, line.to, 1);
  return doc.text.slice(line.from, end);
}

/** The prefix a new line in these containers starts with: a quote's `>` as written, an item's indentation as spaces. */
export function continuation(doc: OutlineState, pieces: readonly PrefixPiece[]): string {
  return pieces.map((p) => (p.block.type === 'blockquote' ? doc.text.slice(p.from, p.to) : ' '.repeat(p.toColumn - p.fromColumn))).join('');
}

/** An item's marker as written, or (`next`) the marker of the item after it: an ordered one counts on. */
export function markerText(doc: OutlineState, node: OutlineNode, next: boolean): string {
  const b = node.block;
  const text = doc.text.slice(doc.markerFrom(b), doc.markerTo(b));
  if (!next || b.list!.type === 'bullet') return text;
  return `${parseInt(text, 10) + 1}${b.list!.delimiter}`;
}
