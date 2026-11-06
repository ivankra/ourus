// Lines, columns and whitespace: a text's line boundaries and endings, columns with tab stops of 4,
// and Markdown's whitespace (spaces and tabs, not JavaScript's). Positions are UTF-16 code-unit
// offsets into a JS string.

import type { ColumnIndex } from './coords.ts';

export type LineEnding = '' | '\n' | '\r\n' | '\r';

/** Line boundaries of a text: CommonMark line endings are LF, CR and CRLF. */
export interface LineBounds {
  /** Start offset of each line. */
  readonly starts: readonly number[];
  /** End offset of each line's content, excluding its ending. */
  readonly ends: readonly number[];
}

/**
 * Splits text into lines. A final line ending does not start an empty last line, so
 * `"a\n"` has one line and `""` has none.
 */
export function splitLines(text: string): LineBounds {
  const starts: number[] = [];
  const ends: number[] = [];
  let start = 0;
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const c = text.charCodeAt(i);
    if (c === 10 || c === 13) {
      starts.push(start);
      ends.push(i);
      if (c === 13 && text.charCodeAt(i + 1) === 10) i++;
      start = i + 1;
    }
  }
  if (start < n) {
    starts.push(start);
    ends.push(n);
  }
  return { starts, ends };
}

export function lineEnding(text: string, end: number): LineEnding {
  const c = text.charCodeAt(end);
  if (c === 10) return '\n';
  if (c === 13) return text.charCodeAt(end + 1) === 10 ? '\r\n' : '\r';
  return '';
}

/** The line ending that ends right at `pos` in `text`, `''` where none does (a lone CR, a CRLF whole). */
export function lineEndingBefore(text: string, pos: number): LineEnding {
  const c = text.charCodeAt(pos - 1);
  if (c === 13) return '\r';
  if (c === 10) return text.charCodeAt(pos - 2) === 13 ? '\r\n' : '\n';
  return '';
}

/** Where the line after the one containing `pos` starts: past its line ending, the text's end where it has none. */
export function nextLineStart(text: string, pos: number): number {
  const end = lineSpan(text, pos)[1];
  return end + lineEnding(text, end).length;
}

/** Index of the line containing `pos`, given the lines' starts (a position at a line's end belongs to that line). */
export function lineIndexAt(starts: readonly number[], pos: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  if (hi < 0) return 0;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid]! <= pos) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** The line of `text` (lines joined by `\n`, as a node's text is) that `offset` is on. */
export function lineOf(text: string, offset: number): number {
  let line = 0;
  for (let at = text.indexOf('\n'); at >= 0 && at < offset; at = text.indexOf('\n', at + 1)) line++;
  return line;
}

/** Start and end (before its line ending) of the line containing `pos`. */
export function lineSpan(text: string, pos: number): [number, number] {
  let start = pos;
  while (start > 0 && text.charCodeAt(start - 1) !== 10 && text.charCodeAt(start - 1) !== 13) start--;
  let end = pos;
  while (end < text.length && text.charCodeAt(end) !== 10 && text.charCodeAt(end) !== 13) end++;
  return [start, end];
}

/** The dominant line ending of a text, for writing new lines. */
export function dominantEnding(text: string): '\n' | '\r\n' | '\r' {
  let lf = 0;
  let crlf = 0;
  let cr = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c === 13) {
      if (text.charCodeAt(i + 1) === 10) {
        crlf++;
        i++;
      } else cr++;
    } else if (c === 10) lf++;
  }
  if (crlf > lf && crlf >= cr) return '\r\n';
  if (cr > lf && cr > crlf) return '\r';
  return '\n';
}

// ---------------------------------------------------------------- characters

// A character, where a key deletes one or a split must not cut one, is a grapheme cluster (an emoji
// with its joiners, a letter with its accents, a flag), and a line ending is one too, a CRLF whole.
// Segmented only around a position, within its line: a cluster never crosses a line ending.

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/** Where the character before `pos` in `text` starts: a line ending's start, or its grapheme's; `pos` at the text's start. */
export function charBefore(text: string, pos: number): number {
  if (pos <= 0) return 0;
  const ending = lineEndingBefore(text, pos).length;
  if (ending) return pos - ending;
  const start = lineSpan(text, pos)[0];
  return start + graphemes.segment(text.slice(start, pos)).containing(pos - start - 1)!.index;
}

/** Where the character at `pos` in `text` ends: past a line ending, or its grapheme; `pos` at the text's end. */
export function charAfter(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  const ending = lineEnding(text, pos).length;
  if (ending) return pos + ending;
  const end = lineSpan(text, pos)[1];
  return pos + graphemes.segment(text.slice(pos, end)).containing(0)!.segment.length;
}

/** `pos`, or where the character it is inside starts: a surrogate pair's, a grapheme's, a CRLF's. */
export function charStart(text: string, pos: number): number {
  if (pos <= 0 || pos >= text.length) return pos;
  const [before, at] = [text.charCodeAt(pos - 1), text.charCodeAt(pos)];
  // (two ASCII characters but CR LF always have a boundary between)
  if (before < 0x80 && at < 0x80) return before === 13 && at === 10 ? pos - 1 : pos;
  if (before === 13 && at === 10) return pos - 1;
  const [start, end] = lineSpan(text, pos);
  if (pos === start || pos === end) return pos;
  return start + graphemes.segment(text.slice(start, end)).containing(pos - start)!.index;
}

// ---------------------------------------------------------------- columns

/** The column reached after `text[from, to)` starting at column `col`, with tab stops of 4. */
export function advanceColumns(text: string, from: number, to: number, col: number): ColumnIndex {
  for (let i = from; i < to; i++) col = text.charCodeAt(i) === 9 ? col + 4 - (col % 4) : col + 1;
  return col as ColumnIndex;
}

/** `line` without its first `cols` columns of indentation (a tab partly removed leaves spaces). */
export function dropColumns(line: string, cols: number): string {
  let col = 0;
  let i = 0;
  while (i < line.length && col < cols && (line[i] === ' ' || line[i] === '\t')) {
    col = line[i] === '\t' ? col + 4 - (col % 4) : col + 1;
    i++;
  }
  return ' '.repeat(Math.max(0, col - cols)) + line.slice(i);
}

// ---------------------------------------------------------------- whitespace

// Markdown's whitespace, where it decides a blank line, indentation, or what a paragraph's lines are
// stripped of, is spaces and tabs (CommonMark 0.31.2); a no-break space (U+00A0, U+202F) and the
// other Unicode spaces are text, which JavaScript's `trim` and `\s` would take. Line endings go too,
// for text of several lines joined.

/** A space or a tab: the whitespace of indentation and of the gaps around markers. */
export const isSpaceOrTab = (c: number): boolean => c === 32 || c === 9;

/** `text` without the Markdown whitespace at either end. */
export const trimMd = (text: string): string => text.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');

/**
 * From `pos`, past the spaces and tabs in `text` towards `limit`: forward (`dir` 1, up to `limit`) or
 * backward (`dir` -1, down to `limit`, looking at the character before each position).
 */
export function skipSpaces(text: string, pos: number, limit: number, dir: -1 | 1): number {
  if (dir > 0) while (pos < limit && isSpaceOrTab(text.charCodeAt(pos))) pos++;
  else while (pos > limit && isSpaceOrTab(text.charCodeAt(pos - 1))) pos--;
  return pos;
}
