// Text primitives: changes, position mapping, lines and columns.
// Positions are UTF-16 code-unit offsets into a JS string.

/** One replacement, in the coordinates of the text it applies to (CM6 ChangeSpec semantics). */
export interface Change {
  readonly from: number;
  readonly to: number;
  readonly insert: string;
}

/** Sorts changes and checks that they don't overlap. Adjacent insertions at one point keep their order. */
export function normalizeChanges(changes: readonly Change[]): Change[] {
  const sorted = changes
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.from - b.c.from || a.c.to - b.c.to || a.i - b.i)
    .map(({ c }) => c);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.from < sorted[i - 1]!.to) throw new RangeError('overlapping changes');
  }
  return sorted.filter((c) => c.from !== c.to || c.insert !== '');
}

export function applyChanges(text: string, changes: readonly Change[]): string {
  let out = '';
  let pos = 0;
  for (const c of normalizeChanges(changes)) {
    if (c.from < pos || c.to > text.length) throw new RangeError('change out of range');
    out += text.slice(pos, c.from) + c.insert;
    pos = c.to;
  }
  return out + text.slice(pos);
}

/** The changes that undo `changes` when applied to the text they produced from `text`. */
export function invertChanges(text: string, changes: readonly Change[]): Change[] {
  const inverse: Change[] = [];
  let shift = 0;
  for (const c of normalizeChanges(changes)) {
    const from = c.from + shift;
    inverse.push({ from, to: from + c.insert.length, insert: text.slice(c.from, c.to) });
    shift += c.insert.length - (c.to - c.from);
  }
  return inverse;
}

/**
 * Maps a position in the old text to the new text. `assoc` < 0 keeps a position at an
 * insertion point before the inserted text, > 0 moves it after. A position inside a
 * replaced range goes to the replacement's start (assoc < 0) or end (assoc > 0).
 */
export function mapPos(changes: readonly Change[], pos: number, assoc: -1 | 1 = -1): number {
  let shift = 0;
  for (const c of normalizeChanges(changes)) {
    if (c.from > pos) break;
    if (c.from === c.to) {
      // pure insertion at or before pos
      if (c.from < pos || assoc > 0) shift += c.insert.length;
      else break;
    } else if (c.to <= pos) {
      shift += c.insert.length - (c.to - c.from);
    } else {
      // pos inside a replaced range
      return c.from + shift + (assoc < 0 ? 0 : c.insert.length);
    }
  }
  return pos + shift;
}

// ---------------------------------------------------------------- lines

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

/** Index of the line containing `pos` (a position at a line's end belongs to that line). */
export function lineIndexAt(bounds: LineBounds, pos: number): number {
  const { starts } = bounds;
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

/** The column reached after `text[from, to)` starting at column `col`, with tab stops of 4. */
export function advanceColumns(text: string, from: number, to: number, col: number): number {
  for (let i = from; i < to; i++) col = text.charCodeAt(i) === 9 ? col + 4 - (col % 4) : col + 1;
  return col;
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

/**
 * Changes on `text` equivalent to applying `a`, then `b` (in the coordinates of a's result).
 * Each change of `b` either falls in text `a` left alone, or inside text `a` inserted; one that
 * straddles the two makes the result a single replacement of the span that differs.
 */
export function composeChanges(text: string, a: readonly Change[], b: readonly Change[]): Change[] {
  const first = normalizeChanges(a).map((c) => ({ ...c }));
  // where each change of `a` sits in a's result
  const placed: { change: { from: number; to: number; insert: string }; from: number; to: number }[] = [];
  let shift = 0;
  for (const c of first) {
    placed.push({ change: c, from: c.from + shift, to: c.from + shift + c.insert.length });
    shift += c.insert.length - (c.to - c.from);
  }
  const out: Change[] = [];
  for (const c of normalizeChanges(b).sort((x, y) => y.from - x.from)) {
    const inside = placed.find((p) => c.from >= p.from && c.to <= p.to);
    if (inside) {
      const s = inside.change.insert;
      inside.change.insert = s.slice(0, c.from - inside.from) + c.insert + s.slice(c.to - inside.from);
      inside.to += c.insert.length - (c.to - c.from);
      continue;
    }
    if (placed.some((p) => c.from < p.to && c.to > p.from)) return [wholeDiff(text, applyChanges(applyChanges(text, a), b))];
    // in untouched text: back to the original coordinates
    let back = 0;
    for (const p of placed) if (p.to <= c.from) back += p.change.insert.length - (p.change.to - p.change.from);
    out.push({ from: c.from - back, to: c.to - back, insert: c.insert });
  }
  return normalizeChanges([...first, ...out]);
}

/** One change turning `before` into `after`, trimmed to the span that differs. */
function wholeDiff(before: string, after: string): Change {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let end = 0;
  while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end++;
  return { from: start, to: before.length - end, insert: after.slice(start, after.length - end) };
}
