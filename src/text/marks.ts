// Marks: offsets on a text, carried through its changes and through the string operations of the texts
// that hold them. A mark is an offset; what it is is the list that holds it:
//
// - `placeholders`: points between characters (the text's length too), each read as if a character had
//   been typed there. Its role is where it is: at a line's end it holds an empty node, elsewhere a held
//   space.
// - `auto`: characters ourus put in for the user (a line break, an escape, a closer typed with its
//   opener: a fence's run, a backtick, a bracket), which it may take out again; what kind is the
//   character itself. Losing one only keeps the character.
//
// A `MarkSet` holds the lists with the text they are on, so they can't be read against another one:
//
//   const marks = MarkSet.of('- \n', { placeholders: [2] }).map(changes);   // through an edit
//   marks.slice(1, 4).splice(0, 1, 'x');                                    // a text's string operations

import { ChangeIndex, ChangeSet, applyChanges, type ChangeSpec } from './changes.ts';

/** Offsets for a `MarkSet`'s lists, in any order (a `MarkSet` is one too). */
export interface MarkLists {
  readonly placeholders?: readonly number[];
  readonly auto?: readonly number[];
}

const NONE: readonly number[] = [];

/** An immutable text with its marks: each list sorted, without duplicates, on the text. */
export class MarkSet {
  readonly text: string;
  /** Points, `0` through `text.length`: read as typed text (an empty node at a line's end, else a held space). */
  readonly placeholders: readonly number[];
  /** Characters, `0` through `text.length - 1`: put in by ourus, not the user. */
  readonly auto: readonly number[];

  private constructor(text: string, placeholders: readonly number[], auto: readonly number[]) {
    check(text, placeholders, auto);
    this.text = text;
    this.placeholders = placeholders;
    this.auto = auto;
  }

  /** `text` with `lists`, sorted and without duplicates; throws on an offset off the text. */
  static of(text: string, lists: MarkLists = {}): MarkSet {
    const placeholders = canonical(lists.placeholders ?? NONE, text.length + 1);
    const auto = canonical(lists.auto ?? NONE, text.length);
    return new MarkSet(text, placeholders, auto);
  }

  /** The same text with the lists `lists` gives in place of this one's; this one where they are the same. */
  with(lists: MarkLists): MarkSet {
    const placeholders = lists.placeholders ? canonical(lists.placeholders, this.text.length + 1) : this.placeholders;
    const auto = lists.auto ? canonical(lists.auto, this.text.length) : this.auto;
    if (same(placeholders, this.placeholders) && same(auto, this.auto)) return this;
    return new MarkSet(this.text, placeholders, auto);
  }

  /** Whether it has no marks at all, whatever its text. */
  isEmpty(): boolean {
    return !this.placeholders.length && !this.auto.length;
  }

  // ------------------------------------------------------------ reading

  /** Whether a placeholder is at `pos`. */
  hasPlaceholderAt(pos: number): boolean {
    return MarkSet.has(this.placeholders, pos);
  }

  /** Whether a placeholder holds an empty node at `pos`: at a line's end (the text's end too). */
  hasEmptyNodeAt(pos: number): boolean {
    return atLineEnd(this.text, pos) && this.hasPlaceholderAt(pos);
  }

  /** Whether a placeholder holds a space at `pos`: anywhere else, before its line's text. */
  hasHeldSpaceAt(pos: number): boolean {
    return !atLineEnd(this.text, pos) && this.hasPlaceholderAt(pos);
  }

  /** Whether the character at `pos` is ourus's. */
  hasAutoAt(pos: number): boolean {
    return MarkSet.has(this.auto, pos);
  }

  /** Whether sorted `offsets` hold `pos`: a binary search. */
  static has(offsets: readonly number[], pos: number): boolean {
    const k = lowerBound(offsets, pos);
    return offsets[k] === pos;
  }

  /** The offsets of sorted `offsets` in `[from, to)`: a binary search. */
  static within(offsets: readonly number[], from: number, to: number): readonly number[] {
    const first = lowerBound(offsets, from);
    const end = lowerBound(offsets, to);
    if (first === 0 && end === offsets.length) return offsets;
    return offsets.slice(first, end);
  }

  // ------------------------------------------------------------ changing

  /**
   * The text after `changes` (in this text's offsets), its marks moved. A mark moves past text inserted
   * at it; a placeholder goes where text on both sides of it goes, or where it lands in a line's text
   * (the space it held taken out: no place any more), an auto mark where its character does. `text`:
   * the text after them, where the caller has it already.
   */
  map(changes: ChangeSet | readonly ChangeSpec[], text?: string): MarkSet {
    const specs = changes instanceof ChangeSet ? changes.changes : changes;
    if (!specs.length) return this;
    const next = text ?? (changes instanceof ChangeSet ? changes.apply(this.text) : applyChanges(this.text, specs));
    if (this.isEmpty()) return new MarkSet(next, NONE, NONE);
    const index = new ChangeIndex(specs);
    const move = (offsets: readonly number[], width: number): number[] => {
      const out: number[] = [];
      for (const pos of offsets) {
        if (!index.removes(pos, pos + width)) out.push(index.mapPos(pos, 1));
      }
      return out;
    };
    const placeholders = move(this.placeholders, 0).filter((pos) => placeholderFits(next, pos));
    const auto = move(this.auto, 1);
    return new MarkSet(next, distinct(placeholders), distinct(auto));
  }

  /**
   * `[from, to)` with its marks, in its offsets (`from` at 0). A placeholder at `to` comes along only
   * with `endPoints`, else it is the next slice's: slices that tile a text keep each once when the last
   * one takes its end's.
   */
  slice(from: number, to: number, endPoints = false): MarkSet {
    if (from === 0 && to === this.text.length && (endPoints || !this.hasPlaceholderAt(to))) return this;
    const cut = (offsets: readonly number[], end: number): number[] => {
      return MarkSet.within(offsets, from, end).map((pos) => pos - from);
    };
    const placeholders = cut(this.placeholders, endPoints ? to + 1 : to);
    const auto = cut(this.auto, to);
    return new MarkSet(this.text.slice(from, to), placeholders, auto);
  }

  /** `[from, to)` replaced by `insert`, with its marks if it has any: the marks around move as `map` moves them. */
  splice(from: number, to: number, insert: MarkSet | string = ''): MarkSet {
    const inserted = typeof insert === 'string' ? MarkSet.of(insert) : insert;
    const text = this.text.slice(0, from) + inserted.text + this.text.slice(to);
    const moved = this.map([{ from, to, insert: inserted.text }], text);
    if (inserted.isEmpty()) return moved;
    const add = (offsets: readonly number[], own: readonly number[]): readonly number[] => {
      if (!own.length) return offsets;
      return merge(offsets, own.map((pos) => pos + from));
    };
    const placeholders = add(moved.placeholders, inserted.placeholders);
    const auto = add(moved.auto, inserted.auto);
    return new MarkSet(text, placeholders, auto);
  }

  /** The texts after this one, with their marks. */
  concat(...others: readonly (MarkSet | string)[]): MarkSet {
    let out: MarkSet = this;
    for (const other of others) out = out.splice(out.text.length, out.text.length, other);
    return out;
  }
}

/** A mark on a character it can't be on: a list corrupted by whatever made it. */
export class MarkError extends Error {
  constructor(what: string, text: string) {
    const shown = text.length > 200 ? `${text.slice(0, 200)}…` : text;
    super(`${what} in ${JSON.stringify(shown)}`);
    this.name = 'MarkError';
  }
}

/** Throws `MarkError` on a mark of `text` on a character it can't be on. */
function check(text: string, placeholders: readonly number[], auto: readonly number[]): void {
  for (const pos of placeholders) {
    if (!placeholderFits(text, pos)) {
      throw new MarkError(`placeholder at ${pos} on ${JSON.stringify(text[pos])}`, text);
    }
  }
  for (const pos of auto) {
    // a backslash (an escape), a line break (a raised blank line), a closer typed with its opener
    // (a backtick, a tilde, a bracket, `$$`, `%%`, `-->`)
    const char = text[pos];
    if (char === undefined || !'\\\n\r`~)]}$%->'.includes(char)) {
      throw new MarkError(`auto mark at ${pos} on ${JSON.stringify(char)}`, text);
    }
  }
}

/** Whether a placeholder can be at `pos` of `text`: at a line's end (an empty node's) or on a blank (a held space's). */
function placeholderFits(text: string, pos: number): boolean {
  const char = text[pos];
  return char === undefined || char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

/** Whether `pos` is at a line's end in `text` (its end too). */
function atLineEnd(text: string, pos: number): boolean {
  const char = text[pos];
  return char === undefined || char === '\n' || char === '\r';
}

/** The first index of sorted `offsets` at `pos` or past it. */
function lowerBound(offsets: readonly number[], pos: number): number {
  let [lo, hi] = [0, offsets.length];
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid]! < pos) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** `offsets` sorted and distinct, each an integer below `end`: the same array where it is already. */
function canonical(offsets: readonly number[], end: number): readonly number[] {
  for (const pos of offsets) {
    if (!Number.isInteger(pos) || pos < 0 || pos >= end) {
      throw new RangeError(`mark ${pos} off a text of ${end} positions`);
    }
  }
  return distinct(offsets);
}

/** Sorted `offsets` without duplicates: the same array where it is already. */
function distinct(offsets: readonly number[]): readonly number[] {
  let sorted = true;
  for (let k = 1; k < offsets.length && sorted; k++) sorted = offsets[k - 1]! < offsets[k]!;
  if (sorted) return offsets.length ? offsets : NONE;
  return [...new Set(offsets)].sort((a, b) => a - b);
}

/** Two sorted, distinct lists as one. */
function merge(offsets: readonly number[], more: readonly number[]): readonly number[] {
  return distinct([...offsets, ...more]);
}

/** Whether two sorted, distinct lists hold the same offsets. */
function same(offsets: readonly number[], other: readonly number[]): boolean {
  return offsets.length === other.length && offsets.every((pos, k) => pos === other[k]);
}
