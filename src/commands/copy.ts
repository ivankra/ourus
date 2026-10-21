// Copy and cut (Ctrl-C, Ctrl-X): the selection's Markdown, written as the host's clipboard formats
// (spec/copy.md); a cut takes it out as Backspace or `deleteSubtree` would.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import { renderHtml, type LineInfo, type PrefixPiece } from '../parser/index.ts';
import { advanceColumns, skipSpaces, trimMd } from '../text.ts';
import { CommandContext, nodesOnLines, operands } from './context.ts';
import type { CommandResult } from './index.ts';
import type { Clipboard } from './paste.ts';

/** What ourus's HTML says beside its Markdown: the text is the source (spec/paste-conv.md reads it so). */
export const OURUS_MARK = '<!-- ourus -->';

/** The clipboard ourus writes for `markdown`: the Markdown as text and as itself, and its rendering, marked as ourus's. */
export function clipboardOf(doc: OutlineState, markdown: string): Clipboard {
  const html = renderHtml(OutlineState.parse(markdown, { config: doc.config }).syntaxTree);
  return { 'text/plain': markdown, 'text/markdown': markdown, 'text/html': OURUS_MARK + html };
}

/**
 * What a copy of `from`–`to` takes: what copy and cut act on. The text range (one node's text, or
 * `copySelection: text` across nodes), the whole nodes it touches with their subtrees
 * (`copySelection: nodes`: `deleteSubtree`'s operands, refused where it refuses them), the node at a
 * caret with its subtree (`copyAtCaret: node`); null where the copy is the host's (a caret,
 * `copyAtCaret: host`; a caret on no node).
 */
export function copyTarget(doc: OutlineState, from: number, to: number): CopyTarget | Extract<CommandResult, { status: 'rejected' }> | null {
  if (from === to) {
    if (doc.config.copyAtCaret === 'host') return null;
    const node = doc.nodeAt(from);
    return node ? { kind: 'nodes', ...subtreeRange(doc, [node]) } : null;
  }
  if (doc.config.copySelection === 'text' || nodesOnLines(doc, from, to).size < 2) return { kind: 'text', from, to };
  // the nodes a cut takes out, so that it copies what it deletes
  const ops = operands(new CommandContext(doc, { anchor: from, head: to }))!;
  if ('status' in ops) return ops;
  return { kind: 'nodes', ...subtreeRange(doc, ops.nodes) };
}

export interface CopyTarget {
  readonly kind: 'text' | 'nodes';
  readonly from: number;
  readonly to: number;
}

/**
 * From where the first node starts (an item at its marker, a quote at its `>`, a footnote definition
 * at its label, else past its
 * containers' prefix: what holds it isn't copied) to the end of the last's last descendant's line.
 */
function subtreeRange(doc: OutlineState, nodes: readonly OutlineNode[]): { from: number; to: number } {
  const first = nodes.reduce((a, n) => (n.startLine < a.startLine ? n : a));
  const last = nodes.reduce((a, n) => (doc.lastDescendant(n).endLine > doc.lastDescendant(a).endLine ? n : a));
  const line = doc.lines[first.startLine]!;
  // a quote's `>` and a footnote definition's `[^1]:` are its own prefix piece, which the copy keeps
  const quote = first.kind === 'quote' || first.block.type === 'footnote_definition' ? line.prefix.find((piece) => piece.block === first.block) : undefined;
  const from = first.kind === 'item' ? doc.markerFrom(first.block) : quote ? skipSpaces(doc.text, quote.from, quote.to, 1) : line.contentFrom;
  return { from, to: doc.lines[doc.lastDescendant(last).endLine]!.to };
}

/**
 * The Markdown of `from`–`to` as written, without what the containers holding all of it put on its
 * lines (a quote's `>`, an item's indentation, where the copy starts past the item's marker): it reads
 * as it did, out of them. Lines that are blank there are empty.
 */
export function copiedMarkdown(doc: OutlineState, from: number, to: number): string {
  const lo = doc.lineAt(from).index;
  const end = doc.lineAt(to);
  // a copy ending at a line's start ends with the line break before it
  const hi = end.index > lo && end.from === to ? end.index - 1 : end.index;
  // the containers holding the whole copy: those started before it (on an earlier line, or with their
  // marker before it: an item's piece starts at the indentation before its marker) and ending in or
  // after its last line
  const first = doc.lines[lo]!;
  const opens = (p: PrefixPiece): number => (p.kind === 'marker' ? doc.markerFrom(p.block) : skipSpaces(doc.text, p.from, p.to, 1));
  const holding = new Set(first.prefix.filter((p) => (p.block.startLine < lo || opens(p) < from) && p.block.endLine >= hi).map((p) => p.block));
  const held = (line: LineInfo): number => line.prefix.reduce((start, piece) => (holding.has(piece.block) ? Math.max(start, piece.to) : start), line.from);
  // indentation the first line loses past what holds the copy (an item indented past its parent's
  // text, copied from its marker), the lines after it lose too: they keep their columns to it
  const column = (line: LineInfo, at: number): number => advanceColumns(doc.text, line.from, at, 0);
  const lead = /^[ \t]+$/.test(doc.text.slice(held(first), from)) ? column(first, from) - column(first, held(first)) : 0;
  const out: string[] = [];
  for (let i = lo; i <= hi; i++) {
    const line = doc.lines[i]!;
    let start = held(line);
    let text: string;
    if (i === lo) text = doc.text.slice(Math.max(start, from), i === end.index ? Math.min(to, line.to) : line.to);
    else {
      // (a tab partly within the lead leaves spaces for the rest of its width)
      const base = column(line, start);
      let col = base;
      while (start < line.to && col < base + lead && (doc.text[start] === ' ' || doc.text[start] === '\t')) col = advanceColumns(doc.text, start, ++start, col);
      text = ' '.repeat(Math.max(0, col - base - lead)) + doc.text.slice(start, i === end.index ? Math.min(to, line.to) : line.to);
    }
    out.push(trimMd(text) === '' ? '' : text);
  }
  return out.join('\n') + (end.index > lo && end.from === to ? '\n' : '');
}
