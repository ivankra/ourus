// Indentation: the document's tab style, whitespace between columns, and moving a line's prefix.

import type { OutlineState } from '../outline/index.ts';
import type { Block } from '../parser/index.ts';
import { advanceColumns, type ChangeSpec } from '../text.ts';

/** Whether list nesting in `doc` is written with tabs. */
export function usesTabs(doc: OutlineState): boolean {
  for (const line of doc.lines) {
    if (line.blank) continue;
    for (const prefix of line.prefix) {
      if (prefix.block.type !== 'item') continue;
      // the indentation before a marker or of a continuation line, not the padding after a marker
      const piece = doc.text.slice(prefix.from, prefix.to);
      const lead = /^[ \t]*/.exec(piece)![0];
      if (lead.includes('\t') || (prefix.partialTab && lead === piece)) return true;
    }
  }
  return false;
}

export function whitespace(fromCol: number, toCol: number, tabs: boolean): string {
  let s = '';
  let col = fromCol;
  if (tabs) {
    while (col + 4 - (col % 4) <= toCol) {
      s += '\t';
      col += 4 - (col % 4);
    }
  }
  return s + ' '.repeat(toCol - col);
}

/**
 * Widens or narrows by `delta` columns the whitespace where `base`'s piece starts on line `lineNo`,
 * shifting everything after it. `base` is the item whose level the line moves into (indent) or
 * out of (outdent). Returns the change (null when the line is left alone: blank lines and lazy
 * continuations), or 'fail' when the line can't move that far.
 */
export function reindent(doc: OutlineState, lineNo: number, base: Block | null, owner: Block | null, delta: number, tabs: boolean): ChangeSpec | null | 'fail' {
  if (delta === 0 || !base || !owner) return null;
  const line = doc.lines[lineNo]!;
  const text = doc.text;
  // blank lines carry nothing to shift: inside an item even a code block's blank line is empty
  if (line.blank) return null;
  const piece = line.prefix.find((candidate) => candidate.block === base);
  // lazy continuation lines (the moving item didn't match them) stay as they are
  if (!piece || !line.prefix.some((candidate) => candidate.block === owner)) return null;
  let runTo = piece.from;
  while (runTo < line.to && (text.charCodeAt(runTo) === 32 || text.charCodeAt(runTo) === 9)) runTo++;
  const charCol = advanceColumns(text, line.from, piece.from, 0);
  const endCol = advanceColumns(text, piece.from, runTo, charCol);
  const target = endCol + delta;
  if (target < piece.fromColumn) return 'fail';
  if (delta > 0) {
    if (tabs && delta % 4 === 0) {
      // a tab-indented document gets its tabs on every line, continuations included: where the
      // piece starts when that is a tab stop, so the line's own spaces stay after them
      if (charCol % 4 === 0 && piece.fromColumn === charCol) return { from: piece.from, to: piece.from, insert: '\t'.repeat(delta / 4) };
      if (endCol % 4 === 0) return { from: runTo, to: runTo, insert: '\t'.repeat(delta / 4) };
    }
    // right after a `>` written without its optional space, the first space inserted is the quote's
    const before = line.prefix[line.prefix.indexOf(piece) - 1];
    const quoteTakes = before?.block.type === 'blockquote' && before.to === piece.from && runTo === piece.from && text[before.to - 1] === '>';
    return { from: runTo, to: runTo, insert: ' '.repeat(delta + (quoteTakes ? 1 : 0)) };
  }
  const narrower = -delta;
  if (runTo - narrower >= piece.from && /^ *$/.test(text.slice(runTo - narrower, runTo)) && !(piece.partialTab && runTo - narrower === piece.from)) {
    return { from: runTo - narrower, to: runTo, insert: '' };
  }
  return { from: piece.from, to: runTo, insert: whitespace(charCol, target, tabs) };
}
