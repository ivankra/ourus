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
  return pieces
    .map((p, k) => {
      if (p.block.type !== 'blockquote') return ' '.repeat(p.toColumn - p.fromColumn);
      const next = pieces[k + 1];
      return quoteMarker(doc.text.slice(p.from, p.to), !!next && next.block.type !== 'blockquote' && next.toColumn > next.fromColumn);
    })
    .join('');
}

/** The prefix of a continuation line of an item's text: its sibling prefix, then spaces to its content column. */
export function itemContinuation(doc: OutlineState, node: OutlineNode): string {
  const sibling = siblingPrefix(doc, node);
  return quoteMarker(sibling, true) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!);
}

// a `>` written without its space takes the first space of what follows as its own: before
// indentation, it gets one, so the indentation keeps its width
function quoteMarker(text: string, indented: boolean): string {
  return indented && text.endsWith('>') ? text + ' ' : text;
}

/** An item's marker as written, or (`next`) the marker of the item after it: an ordered one counts on. */
export function markerText(doc: OutlineState, node: OutlineNode, next: boolean): string {
  const b = node.block;
  const text = doc.text.slice(doc.markerFrom(b), doc.markerTo(b));
  if (!next || b.list!.type === 'bullet') return text;
  return `${parseInt(text, 10) + 1}${b.list!.delimiter}`;
}
