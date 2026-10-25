// Marks: typed points and ranges on a text, carried through changes and through the string operations
// of the texts that hold them (`slice`, `shift`, `splice`).
//
// The kinds are a closed set, defined here with how each moves (the end of this file); the layers
// above read what they mean and decide where one is valid after a move (the outline: where a
// placeholder can be). `defineMarkKind` is this layer's own: the entry doesn't export it. A mark is
// a point where `from === to`, else a range.
//
//   const set = MarkSet.of([createPlaceholder(2)]).map(changes);                     // through an edit
//   set.slice(1, 4).splice(0, 1, 'x')                                                // with a text's string operations

import { ChangeSet, mapSorted, normalizeChanges, type ChangeSpec } from './changes.ts';

export interface Mark {
  readonly kind: string;
  readonly from: number;
  /** Equal to `from` for a point. */
  readonly to: number;
}

/**
 * How a kind of mark moves when the text around it changes, in CodeMirror 6's terms where it has them
 * (`mapPos`'s `assoc`, `MapMode`).
 */
export interface MarkPolicy {
  /** A point (or a range's end) at an insertion point: stays before the inserted text (-1) or moves past it (1). */
  readonly assoc: -1 | 1;
  /**
   * A point with text deleted across it, or a range deleted whole: it goes (`trackDel`, as CM6's
   * `MapMode.TrackDel`), or stays, at where the deletion ends (`simple`).
   */
  readonly mapMode: 'simple' | 'trackDel';
  /**
   * A range with text inserted strictly inside it: it covers the insertion (`extend`, as a CM6 mark
   * decoration does), or goes (`drop`: the text there is someone else's now). Text inserted at a
   * range's ends is outside it (CM6's `inclusive: false`).
   */
  readonly onInsertInside?: 'extend' | 'drop';
}

const policies = new Map<string, MarkPolicy>();

/** Defines a kind of mark and how it moves, once: the kinds below, and tests' own. */
export function defineMarkKind<K extends string>(kind: K, policy: MarkPolicy): K {
  if (policies.has(kind)) throw new Error(`mark kind ${kind} is defined twice`);
  policies.set(kind, policy);
  return kind;
}

function policyOf(kind: string): MarkPolicy {
  const policy = policies.get(kind);
  if (!policy) throw new Error(`unknown mark kind ${kind}`);
  return policy;
}

const order = (a: Mark, b: Mark): number => a.from - b.from || a.to - b.to || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0);
const same = (a: Mark, b: Mark): boolean => a.kind === b.kind && a.from === b.from && a.to === b.to;

/** Marks sorted, without duplicates. */
function normalized(marks: readonly Mark[]): Mark[] {
  const out = [...marks].sort(order);
  return out.filter((m, i) => i === 0 || !same(m, out[i - 1]!));
}

/**
 * Where one mark goes through `changes` (sorted, in the old text's coordinates), or null where it
 * goes. A point moves as `mapPos` moves it, by its kind's `assoc`; a range's ends move outward-exclusive
 * (text inserted at an end isn't in it), text inserted inside it is.
 */
function mapMark(mark: Mark, changes: readonly ChangeSpec[]): Mark | null {
  const policy = policyOf(mark.kind);
  if (mark.from === mark.to) {
    const p = mark.from;
    const inside = changes.find((c) => c.from < p && p < c.to);
    if (inside && policy.mapMode === 'trackDel') return null;
    const at = inside ? mapSorted(changes, inside.to, -1) : mapSorted(changes, p, policy.assoc);
    return { ...mark, from: at, to: at };
  }
  const covered = changes.find((c) => c.from < c.to && c.from <= mark.from && c.to >= mark.to);
  if (covered) {
    if (policy.mapMode === 'trackDel') return null;
    const at = mapSorted(changes, covered.to, 1);
    return { ...mark, from: at, to: at };
  }
  // text inserted strictly inside, or put in place of some of it
  if (policy.onInsertInside === 'drop' && changes.some((c) => c.insert !== '' && mark.from < c.to && c.from < mark.to && (c.from > mark.from || c.to < mark.to))) return null;
  const from = mapSorted(changes, mark.from, 1);
  const to = Math.max(from, mapSorted(changes, mark.to, -1));
  return { ...mark, from, to };
}

/** An immutable set of marks on a text. */
export class MarkSet {
  static readonly empty = new MarkSet([]);
  readonly marks: readonly Mark[];

  private constructor(marks: readonly Mark[]) {
    this.marks = marks;
  }

  static of(marks: readonly Mark[]): MarkSet {
    return marks.length ? new MarkSet(normalized(marks)) : MarkSet.empty;
  }

  get size(): number {
    return this.marks.length;
  }

  /** The set after `changes` (each in the old text's coordinates), each mark moved by its kind's policy. */
  map(changes: ChangeSet | readonly ChangeSpec[]): MarkSet {
    const sorted = changes instanceof ChangeSet ? changes.changes : normalizeChanges(changes);
    if (!sorted.length || !this.marks.length) return this;
    return MarkSet.of(this.marks.flatMap((m) => mapMark(m, sorted) ?? []));
  }

  /** The set with the marks `filter` keeps, then `add`'s (CM6's `RangeSet.update`). */
  update({ add = [], filter }: { readonly add?: readonly Mark[]; readonly filter?: (mark: Mark) => boolean }): MarkSet {
    const kept = filter ? this.marks.filter(filter) : this.marks;
    if (!add.length && kept.length === this.marks.length) return this;
    return MarkSet.of([...kept, ...add]);
  }

  /**
   * Calls `f` for each mark touching `[from, to]`: a point in it, a range overlapping it or ending at
   * its edges, in order; `f` returning false stops it (CM6's `RangeSet.between`).
   */
  between(from: number, to: number, f: (mark: Mark) => void | false): void {
    for (const m of this.marks) {
      if (m.from > to) return;
      if (m.to >= from && f(m) === false) return;
    }
  }

  /**
   * The marks in `[from, to)`, in its offsets (`from` at 0), a range cut to it. A point at `from` comes
   * along, one at `to` only with `endPoints` (else it is the next slice's): slices that tile a text
   * keep every point once when the last one takes its end's; a part cut at a separator ends where
   * the separator was.
   */
  slice(from: number, to: number, endPoints = false): MarkSet {
    return MarkSet.of(this.marks.flatMap((m) => {
      if (m.from === m.to) return m.from >= from && (m.from < to || (m.from === to && endPoints)) ? [{ ...m, from: m.from - from, to: m.to - from }] : [];
      const a = Math.max(m.from, from);
      const b = Math.min(m.to, to);
      return a < b ? [{ ...m, from: a - from, to: b - from }] : [];
    }));
  }

  /** Every mark `by` on: the marks of a text put after another's. */
  shift(by: number): MarkSet {
    return by && this.marks.length ? new MarkSet(this.marks.map((m) => ({ ...m, from: m.from + by, to: m.to + by }))) : this;
  }

  /** The marks of a text whose `[from, to)` is replaced by `insert`: the marks around move by their policies, `inserted`'s (the insertion's own) come with it. */
  splice(from: number, to: number, insert: string, inserted: MarkSet = MarkSet.empty): MarkSet {
    const moved = this.map([{ from, to, insert }]);
    return inserted.size ? moved.update({ add: inserted.shift(from).marks }) : moved;
  }

  /** Whether a mark (of `kind`) is at `pos`: a point there, or a range covering the character there. */
  has(pos: number, kind?: string): boolean {
    return this.find(pos, kind) !== undefined;
  }

  /** The first mark (of `kind`) at `pos`: a point there, or a range covering the character there. */
  find(pos: number, kind?: string): Mark | undefined {
    return this.marks.find((m) => (kind === undefined || m.kind === kind) && (m.from === m.to ? m.from === pos : m.from <= pos && pos < m.to));
  }

  /** The points of every mark, sorted: what a reader of offsets (the parser's sentinels) takes. */
  points(kind?: string): number[] {
    return (kind === undefined ? this.marks : this.marks.filter((m) => m.kind === kind)).map((m) => m.from);
  }
}

// ---------------------------------------------------------------- the kinds

/**
 * A placeholder: a point read as if text had been typed there, so what Markdown can't hold exists while
 * the caret is there. Two roles, by where it is (`isEmptyNodePlaceholder`, `isHeldSpacePlaceholder`):
 * at a line's end, an empty node the user is about to fill (`- ◌`); before a line's text, a held
 * space, a deleted first character's place (`- ◌ x`), which keeps the text from moving or reading as a
 * block. It follows typing at it, and goes with text replaced around it.
 */
export const PLACEHOLDER_MARK = defineMarkKind('placeholder', { assoc: 1, mapMode: 'trackDel' });

/** A placeholder at `pos`. */
export function createPlaceholder(pos: number): Mark {
  return { kind: PLACEHOLDER_MARK, from: pos, to: pos };
}

/** Whether `mark` is a placeholder. */
export const isPlaceholder = (mark: Mark): boolean => mark.kind === PLACEHOLDER_MARK;

/**
 * Whether `mark`, in `text`'s offsets (a document's, or a node's text's), is a placeholder holding an
 * empty node: at a line's end.
 */
export function isEmptyNodePlaceholder(mark: Mark, text: string): boolean {
  const c = text[mark.from];
  return isPlaceholder(mark) && (c === undefined || c === '\n' || c === '\r');
}

/**
 * Whether `mark`, in `text`'s offsets, is a placeholder for a held space: before its line's text (in
 * a document, on the space; in a node's text, which leaves the space out, where the text starts).
 */
export function isHeldSpacePlaceholder(mark: Mark, text: string): boolean {
  return isPlaceholder(mark) && !isEmptyNodePlaceholder(mark, text);
}

/** Whether `marks` (in `text`'s offsets) hold a placeholder for an empty node at `pos`. */
export const emptyNodeAt = (marks: MarkSet, text: string, pos: number): boolean => marks.marks.some((m) => m.from === pos && isEmptyNodePlaceholder(m, text));

/** Whether `marks` (in `text`'s offsets) hold a placeholder for a held space at `pos`. */
export const heldSpaceAt = (marks: MarkSet, text: string, pos: number): boolean => marks.marks.some((m) => m.from === pos && isHeldSpacePlaceholder(m, text));

/**
 * Whitespace ourus added only because Markdown needed it, not the user (a blank line setting off a
 * bare `-` under text, or a paragraph that would run on): a range over it. An edit there may take it
 * out once it is no longer needed; whitespace without one is the user's, and stays. Advisory: losing
 * it (a reload, an edit from elsewhere) only keeps the whitespace. Typing in it makes it the user's:
 * it goes.
 */
export const AUTO_WHITESPACE_MARK = defineMarkKind('auto-whitespace', { assoc: 1, mapMode: 'trackDel', onInsertInside: 'drop' });

/**
 * A closing delimiter ourus typed for the user (a backtick, a code fence's closing line): a range over
 * it. Backspace in the empty pair takes both halves only where the closing one has this mark, not a
 * pair the user typed. Advisory: losing it only keeps the closing half. Typing inside it makes it the
 * user's: it goes.
 */
export const AUTO_CLOSED_MARK = defineMarkKind('auto-closed', { assoc: 1, mapMode: 'trackDel', onInsertInside: 'drop' });
