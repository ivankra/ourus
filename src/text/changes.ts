// Changes to a text and positions through them. Positions are UTF-16 code-unit offsets into a JS
// string.
//
// `ChangeSpec[]` is what hosts and commands pass around; `ChangeSet` is the same changes normalized
// once, with the length of the text they apply to, so they compose exactly and map positions without
// sorting again. The free functions take `ChangeSpec[]` and normalize on every call.
//
//   const set = ChangeSet.of(changes, text.length);
//   set.apply(text), set.invert(text), set.mapPos(pos, 1)
//   set.compose(next)            // `set`, then `next` (in the coordinates of set's result), as one

/**
 * One replacement: the text from `from` to `to` replaced by `insert`. The plain-object case of
 * CodeMirror 6's `ChangeSpec`, with `to` and `insert` required, so it can be passed to CM6 as it is.
 * Offsets are UTF-16 code units. In an array of changes, every change refers to the text before any
 * of them is applied, and changes don't overlap; `mapPos` maps a position from before to after.
 */
export interface ChangeSpec {
  readonly from: number;
  readonly to: number;
  readonly insert: string;
}

/**
 * A selection of one range: `anchor` where it started, `head` where it is (the caret when empty).
 * CodeMirror 6's selection spec, so a host passes `state.selection.main` in and dispatches a result's
 * as it is. Offsets are UTF-16 code units.
 */
export interface TextSelection {
  readonly anchor: number;
  readonly head: number;
}

/** Changes to a text of a known length: sorted, not overlapping, none empty. Immutable. */
export class ChangeSet {
  /** The changes, in the coordinates of the text before them. */
  readonly changes: readonly ChangeSpec[];
  /** The length of the text they apply to. */
  readonly length: number;

  private constructor(changes: readonly ChangeSpec[], length: number) {
    this.changes = changes;
    this.length = length;
  }

  /** `changes` to a text of length `length`, normalized. */
  static of(changes: readonly ChangeSpec[], length: number): ChangeSet {
    const sorted = normalizeChanges(changes);
    if (sorted.length && sorted[sorted.length - 1]!.to > length) throw new RangeError('change out of range');
    return new ChangeSet(sorted, length);
  }

  /** No changes to a text of length `length`. */
  static empty(length: number): ChangeSet {
    return new ChangeSet([], length);
  }

  get empty(): boolean {
    return this.changes.length === 0;
  }

  /** The length of the text after the changes. */
  get newLength(): number {
    let n = this.length;
    for (const c of this.changes) n += c.insert.length - (c.to - c.from);
    return n;
  }

  apply(text: string): string {
    if (text.length !== this.length) throw new RangeError('changes applied to a text of another length');
    return applySorted(text, this.changes);
  }

  /** The changes that undo these, applied to the text these produce from `text`. */
  invert(text: string): ChangeSet {
    if (text.length !== this.length) throw new RangeError('changes inverted against a text of another length');
    return new ChangeSet(invertSorted(text, this.changes), this.newLength);
  }

  /** Where `pos` goes (see `mapPos`). */
  mapPos(pos: number, assoc: -1 | 1 = -1): number {
    return mapSorted(this.changes, pos, assoc);
  }

  /**
   * These changes, then `other` (in the coordinates of the text these produce), as one set on the
   * text these apply to. A change of each that share text between them are one, as is an insertion
   * of `other` in, or at either end of, what a change of these wrote; changes that only touch stay
   * apart.
   */
  compose(other: ChangeSet): ChangeSet {
    return new ChangeSet(composeSets(this, other).changes, this.length);
  }
}

/** A stretch of a text: kept as it is (`insert` null), or replaced by `insert`. */
interface Section {
  readonly length: number;
  readonly insert: string | null;
}

/** A change set as the stretches of its text, kept and replaced, in order. */
function sections(set: ChangeSet): Section[] {
  const out: Section[] = [];
  let pos = 0;
  for (const c of set.changes) {
    if (c.from > pos) out.push({ length: c.from - pos, insert: null });
    out.push({ length: c.to - c.from, insert: c.insert });
    pos = c.to;
  }
  if (pos < set.length) out.push({ length: set.length - pos, insert: null });
  return out;
}

/**
 * `a`, then `b`, as one list of changes on a's text, with which of them were made of a change of `a`
 * and one of `b` overlapping (`mixed`).
 */
function composeSets(a: ChangeSet, b: ChangeSet): { changes: ChangeSpec[]; mixed: boolean[] } {
  if (b.length !== a.newLength) throw new RangeError('composed changes of another length');
  const sa = sections(a);
  const sb = sections(b);
  const out = new Builder();
  // a's sections are walked by the text they produce, b's by the text they replace: the same text
  const produced = (s: Section): number => (s.insert === null ? s.length : s.insert.length);
  let i = 0;
  let j = 0;
  let offA = 0;
  let offB = 0;
  for (;;) {
    const x = sa[i];
    const y = sb[j];
    // a deletion in a: none of it reaches b; inside a change of b, it is part of it
    if (x && offA === 0 && x.insert === '') {
      out.change(x.length, '', i, y && offB > 0 && y.insert !== null ? j : -1);
      i++;
      continue;
    }
    // an insertion in b: nothing of a's under it; in what a change of a wrote, or at its start, part of it
    if (y && offB === 0 && y.length === 0) {
      out.change(0, y.insert!, x && x.insert !== null ? i : -1, j);
      j++;
      continue;
    }
    if (!x || !y) break;
    const take = Math.min(produced(x) - offA, y.length - offB);
    // what of a's text this piece covers: a kept stretch's own, a change's whole at its start
    const original = x.insert === null ? take : offA === 0 ? x.length : 0;
    const ai = x.insert === null ? -1 : i;
    if (y.insert !== null) out.change(original, offB === 0 ? y.insert : '', ai, j);
    else if (x.insert !== null) out.change(original, x.insert.slice(offA, offA + take), i, -1);
    else out.keep(take);
    offA += take;
    offB += take;
    if (offA === produced(x)) {
      i++;
      offA = 0;
    }
    if (offB === y.length) {
      j++;
      offB = 0;
    }
  }
  return { changes: out.changes, mixed: out.mixed };
}

/**
 * Changes made from left to right, text kept and text replaced, each piece from a change of `a` and
 * one of `b` (an index, or -1 for none). A piece of the change before it (the same change of either)
 * joins it, as does an insertion of `b` right after a change of `a`.
 */
class Builder {
  readonly changes: ChangeSpec[] = [];
  /** Whether each change was made of a change of each. */
  readonly mixed: boolean[] = [];
  /** The last piece's changes of `a` and `b`. */
  private last = { a: -1, b: -1 };
  private pos = 0;

  keep(length: number): void {
    this.pos += length;
  }

  change(length: number, insert: string, a: number, b: number): void {
    if (length === 0 && insert === '') {
      // nothing here, but the change goes on: what of it comes next joins what came before
      if ((a >= 0 && a === this.last.a) || (b >= 0 && b === this.last.b)) this.last = { a: a >= 0 ? a : this.last.a, b: b >= 0 ? b : this.last.b };
      return;
    }
    const k = this.changes.length - 1;
    const prev = this.changes[k];
    const same = (a >= 0 && a === this.last.a) || (b >= 0 && b === this.last.b);
    const after = length === 0 && a < 0 && b >= 0 && this.last.a >= 0;
    if (prev && prev.to === this.pos && (same || after)) {
      this.changes[k] = { from: prev.from, to: this.pos + length, insert: prev.insert + insert };
      this.mixed[k] = this.mixed[k]! || (a >= 0 && b >= 0) || after;
    } else {
      this.changes.push({ from: this.pos, to: this.pos + length, insert });
      this.mixed.push(a >= 0 && b >= 0);
    }
    this.last = { a, b };
    this.pos += length;
  }
}

/** Sorts changes and checks that they don't overlap. Adjacent insertions at one point keep their order. */
export function normalizeChanges(changes: readonly ChangeSpec[]): ChangeSpec[] {
  const sorted = changes
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.from - b.c.from || a.c.to - b.c.to || a.i - b.i)
    .map(({ c }) => c);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.from < sorted[i - 1]!.to) throw new RangeError('overlapping changes');
  }
  return sorted.filter((c) => c.from !== c.to || c.insert !== '');
}

export function applyChanges(text: string, changes: readonly ChangeSpec[]): string {
  return applySorted(text, normalizeChanges(changes));
}

function applySorted(text: string, changes: readonly ChangeSpec[]): string {
  let out = '';
  let pos = 0;
  for (const c of changes) {
    if (c.from < pos || c.to > text.length) throw new RangeError('change out of range');
    out += text.slice(pos, c.from) + c.insert;
    pos = c.to;
  }
  return out + text.slice(pos);
}

/** The changes that undo `changes` when applied to the text they produced from `text`. */
export function invertChanges(text: string, changes: readonly ChangeSpec[]): ChangeSpec[] {
  return invertSorted(text, normalizeChanges(changes));
}

function invertSorted(text: string, changes: readonly ChangeSpec[]): ChangeSpec[] {
  const inverse: ChangeSpec[] = [];
  let shift = 0;
  for (const c of changes) {
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
export function mapPos(changes: readonly ChangeSpec[], pos: number, assoc: -1 | 1 = -1): number {
  return mapSorted(normalizeChanges(changes), pos, assoc);
}

/** `mapPos` over changes already normalized (the text layer's own: its entry doesn't export it). */
export function mapSorted(changes: readonly ChangeSpec[], pos: number, assoc: -1 | 1): number {
  let shift = 0;
  for (const c of changes) {
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

/**
 * Changes on `text` equivalent to applying `a`, then `b` (in the coordinates of a's result). One made
 * of a change of each is trimmed to what differs from the text: `b` putting back what `a` took out is
 * no change.
 */
export function composeChanges(text: string, a: readonly ChangeSpec[], b: readonly ChangeSpec[]): ChangeSpec[] {
  const first = ChangeSet.of(a, text.length);
  const { changes, mixed } = composeSets(first, ChangeSet.of(b, first.newLength));
  return changes.flatMap((c, k) => {
    if (!mixed[k]) return [c];
    const [trimmed] = diffText(text.slice(c.from, c.to), c.insert);
    return trimmed ? [{ from: c.from + trimmed.from, to: c.from + trimmed.to, insert: trimmed.insert }] : [];
  });
}

/**
 * The change turning `before` into `after` that replaces whole lines, between the lines they
 * start and end with in common: a line added between two others is an insertion at a line
 * start, not one that seems to begin inside the line below it. Empty when the texts are equal.
 */
export function diffLines(before: string, after: string): ChangeSpec[] {
  if (before === after) return [];
  const isBreak = (c: number): boolean => c === 10 || c === 13;
  let start = 0;
  const shorter = Math.min(before.length, after.length);
  while (start < shorter && before.charCodeAt(start) === after.charCodeAt(start)) start++;
  while (start > 0 && !isBreak(before.charCodeAt(start - 1))) start--;
  // the length of the common ending, then back to where a line starts
  let end = 0;
  while (end < shorter - start && before.charCodeAt(before.length - 1 - end) === after.charCodeAt(after.length - 1 - end)) end++;
  while (end > 0 && before.length - end > start && !isBreak(before.charCodeAt(before.length - end - 1))) end--;
  return [{ from: start, to: before.length - end, insert: after.slice(start, after.length - end) }];
}

/** The change turning `before` into `after`, trimmed to the span that differs; none when they are equal. */
function diffText(before: string, after: string): ChangeSpec[] {
  if (before === after) return [];
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let end = 0;
  while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end++;
  return [{ from: start, to: before.length - end, insert: after.slice(start, after.length - end) }];
}
