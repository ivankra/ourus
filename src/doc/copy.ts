// A range of a document as Markdown out of the containers holding it (what copy writes), and where a
// node's own Markdown starts (what a copy of whole nodes takes).

import { MdBlockAt, type MdLine, type MdPrefixPiece } from '../parser/index.ts';
import { advanceColumns, lineIndexAt, skipSpaces, trimMd } from '../text/index.ts';
import type { OurusDoc } from './doc.ts';
import type { OurusNode } from './node.ts';

/**
 * Where `node`'s own Markdown starts: an item at its marker, a quote at its `>`, a footnote definition
 * at its label, else past its containers' prefix (what holds it isn't its own).
 */
export function markdownStart(doc: OurusDoc, node: OurusNode): number {
  const tree = doc.mdTree;
  const line = tree.line(node.startLine);
  if (node.kind === 'item') return tree.markerFrom(new MdBlockAt(node.block, node.startLine));
  // a quote's `>` and a footnote definition's `[^1]:` are its own prefix piece
  const piece = node.kind === 'quote' || node.block.type === 'footnote_definition' ? line.prefix.find((p) => p.container.block === node.block) : undefined;
  return piece ? skipSpaces(doc.text, piece.from, piece.to, 1) : line.contentFrom;
}

/**
 * The Markdown of `from`–`to` as written, without what the containers holding all of it put on its
 * lines (a quote's `>`, an item's indentation, where the copy starts past the item's marker): it reads
 * as it did, out of them; a quote read as an atom (`quotes: atom`) is the text, its `>`s kept. Lines
 * that are blank there are empty.
 */
export function markdownOf(doc: OurusDoc, from: number, to: number): string {
  const tree = doc.mdTree;
  const text = doc.text;
  // (an empty text has no lines to copy out of)
  if (!tree.lineCount) return '';
  const lo = lineIndexAt(tree.starts, from);
  const end = tree.line(lineIndexAt(tree.starts, to));
  // a copy ending at a line's start ends with the line break before it
  const hi = end.index > lo && end.from === to ? end.index - 1 : end.index;
  // the containers holding the whole copy: those started before it (on an earlier line, or with their
  // marker before it: an item's piece starts at the indentation before its marker) and ending in or
  // after its last line
  const first = tree.line(lo);
  const opens = (p: MdPrefixPiece): number => (p.kind === 'marker' ? tree.markerFrom(p.container) : skipSpaces(text, p.from, p.to, 1));
  // (but a quote that is a node's lines as written, `quotes: atom`: its `>`s are that text's)
  const own = doc.config.quotes === 'atom' ? doc.nodeAtLine(lo)?.persistentNode.textQuote : null;
  const holding = new Set(first.prefix.filter((p) => (p.container.line < lo || opens(p) < from) && p.container.lastLine >= hi && p.container.block !== own).map((p) => p.container.block));
  const held = (line: MdLine): number => line.prefix.reduce((start, piece) => (holding.has(piece.container.block) ? Math.max(start, piece.to) : start), line.from);
  // indentation the first line loses past what holds the copy (an item indented past its parent's
  // text, copied from its marker), the lines after it lose too: they keep their columns to it
  const column = (line: MdLine, at: number): number => advanceColumns(text, line.from, at, 0);
  const lead = /^[ \t]+$/.test(text.slice(held(first), from)) ? column(first, from) - column(first, held(first)) : 0;
  const out: string[] = [];
  for (let i = lo; i <= hi; i++) {
    const line = tree.line(i);
    let start = held(line);
    let piece: string;
    if (i === lo) piece = text.slice(Math.max(start, from), i === end.index ? Math.min(to, line.to) : line.to);
    else {
      // (a tab partly within the lead leaves spaces for the rest of its width)
      const base = column(line, start);
      let col = base;
      while (start < line.to && col < base + lead && (text[start] === ' ' || text[start] === '\t')) col = advanceColumns(text, start, ++start, col);
      piece = ' '.repeat(Math.max(0, col - base - lead)) + text.slice(start, i === end.index ? Math.min(to, line.to) : line.to);
    }
    // (a line the copy takes whole, blank there, is empty; part of one, spaces between words, is as it is)
    const whole = (i !== lo || from <= held(line)) && (i !== end.index || to >= line.to);
    out.push(whole && trimMd(piece) === '' ? '' : piece);
  }
  // (ending at a line's start, or past its last line's end, in its line ending: the final one too)
  return out.join('\n') + ((end.index > lo && end.from === to) || to > end.to ? '\n' : '');
}
