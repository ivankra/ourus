// The line machine: block parsing as a deterministic step from (the state before a line, the line)
// to (the state after it, a record of the line). The state, a stack of immutable frames for the
// open blocks, is kept after every line, so parsing can restart at any line and stop as soon as the
// state agrees with an earlier parse (see syntax.ts).
//
// The algorithm is commonmark.js 0.31.2's block phase (lib/blocks.js, BSD-2-Clause, see NOTICE),
// generalized: what the open blocks do with a line (`BlockSpec`) and which blocks a line can start
// (`BlockStart`) come from the flavor, CommonMark's own blocks included (blocks.ts). The machine
// itself knows only the loop: match the open containers, try block starts, lazy continuation, and
// hand the rest of the line to the open leaf.
//
// It is lossless: the line is never copied into the result. Each line's record says which container
// consumed which part of it (its prefix pieces, in offsets from the line's start) and what the rest
// is (its leaf role). The only effects reaching back to earlier lines touch the open paragraph's
// lines (a setext underline, a table's delimiter row, reference definitions split off when it
// closes), and lookahead, which the record notes (`ahead`).

import type { Flavor } from './flavor.ts';

export const CODE_INDENT = 4;

/** An open block. Frames are immutable, and hold only primitive fields besides `spec`, so states compare by value. */
export interface Frame {
  readonly spec: BlockSpec;
}

/** What an open block does with a line. `F` is the block's frame. */
export interface BlockSpec<F extends Frame = any> {
  /** The block's type in the syntax tree. */
  readonly type: string;
  /** Holds other blocks (the document, quotes, lists, items). */
  readonly container: boolean;
  /** A leaf that takes text lines (paragraphs, code, HTML, tables). */
  readonly acceptsLines: boolean;
  /** Block starts are still tried on lines this open leaf would take: it can be interrupted (paragraphs, tables). */
  readonly interruptible?: boolean;
  /**
   * Whether the block goes on at this line: 0 = it does (a container has consumed its prefix
   * piece), 1 = it doesn't, 2 = it does and the line is fully handled (a closing fence).
   */
  continue(m: Machine, frame: F, index: number): 0 | 1 | 2;
  /** Containers: whether a block of `child`'s kind can go inside. Default: anything but list items. */
  canContain?(child: BlockSpec): boolean;
  /** Containers: the frame after a child block was added (an item counts its children). */
  childAdded?(frame: F): F;
  /** Leaves that accept lines: the rest of the line, from `m.offset`, goes to this block. Sets the line's role. */
  addLine?(m: Machine, frame: F, index: number): void;
  /** The block closes; its last line is `m.lineIndex - 1`. */
  close?(m: Machine, frame: F): void;
}

/** A block start: 0 = no match, 1 = a container opened (keep looking), 2 = a leaf (stop). */
export interface BlockStart {
  readonly name: string;
  start(m: Machine, container: Frame): 0 | 1 | 2;
}

/** What a line is in its leaf block. `first`: the line starts a new block. Other fields are the block's attributes. */
export interface LeafRole {
  readonly type: string;
  readonly first: boolean;
  readonly [attribute: string]: unknown;
}

/** The part of a line one container consumed, in offsets from the line's start. */
export interface Piece {
  /** The container's index in the line's chain of containers (0 = outermost; the document excluded). */
  readonly depth: number;
  /** `quote`, `marker` (an item's first line), `indent` (its continuation), or an extension's. */
  readonly kind: string;
  readonly from: number;
  readonly to: number;
  readonly fromColumn: number;
  readonly toColumn: number;
  /** The piece ends inside a tab, which the container consumed only part of. */
  readonly partialTab: boolean;
}

/** A container a line opened, and the attributes of its block. */
export interface Opened {
  readonly type: string;
  readonly attrs: Readonly<Record<string, unknown>> | null;
}

export interface LineRecord {
  /** Containers (the document excluded) open after the line. */
  readonly depth: number;
  /** The innermost of them that this line opened, outermost first. */
  readonly opened: readonly Opened[];
  readonly pieces: readonly Piece[];
  readonly leaf: LeafRole | null;
  /** A paragraph continued through containers that didn't match the line. */
  readonly lazy: boolean;
  /** How many lines after this one the machine looked at to read it (0 for most lines). */
  readonly ahead: number;
  /** Where the line's text starts in its leaf (after the leaf's own indentation), from the line's start; -1 if none. */
  readonly text: number;
  /** Spaces the leaf's text starts with that the line doesn't have: the rest of a tab a container took part of. */
  readonly pad: number;
}

/** The machine's state between two lines: the open blocks, the document first. */
export type State = readonly Frame[];

/** The lines the machine reads. */
export interface LineSource {
  readonly text: string;
  readonly starts: ArrayLike<number>;
  readonly ends: ArrayLike<number>;
  /** Offsets, by line, where a sentinel character is read (a placeholder): in place of a space, or at the line's end. */
  readonly sentinels: ReadonlyMap<number, readonly number[]> | null;
}

/** The character a sentinel reads as. Object replacement: text no block start begins with. */
export const SENTINEL = '￼';

const EMPTY_PIECES: readonly Piece[] = Object.freeze([]);
const EMPTY_OPENED: readonly Opened[] = Object.freeze([]);

/** Frames are equal when all their fields are (`except` one, which the caller compares itself). */
export function frameEquals(a: Frame, b: Frame, except?: string): boolean {
  if (a === b) return true;
  if (a.spec !== b.spec) return false;
  const x = a as unknown as Record<string, unknown>;
  const y = b as unknown as Record<string, unknown>;
  for (const key in x) if (key !== except && x[key] !== y[key]) return false;
  for (const key in y) if (!(key in x)) return false;
  return true;
}

export function stateEquals(a: State, b: State): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!frameEquals(a[i]!, b[i]!)) return false;
  return true;
}

/**
 * Reads lines. `records[i]` and `states[i]` receive line i's record and the state after it; records of
 * the open paragraph's earlier lines may be rewritten (backward effects).
 */
export class Machine {
  readonly flavor: Flavor;
  readonly source: LineSource;
  readonly records: LineRecord[];
  readonly states: State[];
  /** The open blocks. Rules change it only through the methods below. */
  stack: Frame[];

  // the line being read
  /** The line as read: NUL replaced, sentinels in. */
  line = '';
  lineIndex = 0;
  /** Where the line starts in the text. */
  lineStart = 0;
  /** Length of the line's real text (an appended sentinel reads beyond it). */
  realLength = 0;
  offset = 0;
  column = 0;
  nextNonspace = 0;
  nextNonspaceColumn = 0;
  indent = 0;
  indented = false;
  blank = false;
  partiallyConsumedTab = false;
  /** The offset after the matched containers' prefixes, before block starts. */
  containerEnd = 0;
  /** The line `nextNonspace` was found on (it is reused while the offset hasn't passed it). */
  private nonspaceLine = -1;
  private nonspaceFrom = 0;
  /** Index of the innermost open block whose continuation matched this line. */
  lastMatched = 0;
  /** Every block open at the line's start that didn't match has been closed. */
  allClosed = true;

  private oldTip = 0;
  private pieces: Piece[] = [];
  private leaf: LeafRole | null = null;
  private lazy = false;
  private changed = false;
  /** Stack index of the first container pushed while reading this line. */
  private pushedFrom = Infinity;
  /** Block attributes of containers pushed on this line, by stack index. */
  private attrs: (Readonly<Record<string, unknown>> | null)[] = [];
  private ahead = 0;
  private textAt = -1;
  private pad = 0;

  constructor(flavor: Flavor, source: LineSource, records: LineRecord[], states: State[], state: State) {
    this.flavor = flavor;
    this.source = source;
    this.records = records;
    this.states = states;
    this.stack = [...state];
  }

  /** Reads line `index`. */
  read(index: number): void {
    const source = this.source;
    const start = source.starts[index]!;
    let ln = source.text.slice(start, source.ends[index]!);
    if (ln.indexOf('\0') !== -1) ln = ln.replace(/\0/g, '�');
    this.realLength = ln.length;
    const sentinels = source.sentinels?.get(index);
    if (sentinels) {
      for (const at of sentinels) ln = at >= ln.length ? ln + SENTINEL : ln.slice(0, at) + SENTINEL + ln.slice(at + 1);
    }
    this.line = ln;
    this.lineIndex = index;
    this.nonspaceLine = -1;
    this.lineStart = start;
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.pieces = [];
    this.leaf = null;
    this.lazy = false;
    this.changed = false;
    this.pushedFrom = Infinity;
    this.ahead = 0;
    this.textAt = -1;
    this.pad = 0;
    this.oldTip = this.stack.length - 1;
    this.incorporate();

    let depth = 0;
    let firstOpened = -1;
    const stack = this.stack;
    for (let i = 1; i < stack.length; i++) {
      if (!stack[i]!.spec.container) break;
      depth++;
      if (firstOpened < 0 && i >= this.pushedFrom) firstOpened = i;
    }
    let opened = EMPTY_OPENED;
    if (firstOpened > 0) {
      const list: Opened[] = [];
      for (let i = firstOpened; i <= depth; i++) list.push({ type: stack[i]!.spec.type, attrs: this.attrs[i] ?? null });
      opened = list;
    }
    this.records[index] = {
      depth,
      opened,
      pieces: this.pieces.length ? this.pieces : EMPTY_PIECES,
      leaf: this.leaf,
      lazy: this.lazy,
      ahead: this.ahead,
      text: this.textAt >= 0 ? this.real(this.textAt) : -1,
      pad: this.pad,
    };
    const prev = index > 0 ? this.states[index - 1] : undefined;
    this.states[index] = prev && (!this.changed || stateEquals(prev, stack)) ? prev : Object.freeze(stack.slice());
  }

  /** Closes every open block: the end of the document. `lineIndex` is the number of lines. */
  finish(lineCount: number): void {
    this.lineIndex = lineCount;
    while (this.stack.length > 1) this.closeTop();
  }

  // ------------------------------------------------------------------------------- the line

  private incorporate(): void {
    const flavor = this.flavor;
    const stack = this.stack;
    let matched = 0;
    for (let i = 1; i < stack.length; i++) {
      const frame = stack[i]!;
      this.findNextNonspace();
      const res = frame.spec.continue(this, frame, i);
      if (res === 2) return;
      if (res === 1) break;
      matched = i;
    }
    this.containerEnd = this.offset;
    this.allClosed = matched === this.oldTip;
    this.lastMatched = matched;
    let container = stack[matched]!;

    let matchedLeaf = container.spec.acceptsLines && !container.spec.interruptible;
    const starts = flavor.blockStarts;
    const special = flavor.blockStartChars;
    while (!matchedLeaf) {
      this.findNextNonspace();
      if (!this.indented && !special(this.line.charCodeAt(this.nextNonspace))) {
        this.advanceNextNonspace();
        break;
      }
      let res: 0 | 1 | 2 = 0;
      for (const s of starts) if ((res = s.start(this, container))) break;
      if (res === 0) {
        this.advanceNextNonspace();
        break;
      }
      container = this.tip;
      if (res === 2) matchedLeaf = true;
    }
    // a leaf of one line (an ATX heading, a thematic break) has been recorded
    if (this.leaf && !this.tip.spec.acceptsLines) return;

    if (!this.allClosed && !this.blank && this.tip.spec === flavor.paragraph) {
      this.lazy = true;
      this.tip.spec.addLine!(this, this.tip, this.stack.length - 1);
      return;
    }
    this.closeUnmatchedBlocks();
    const tip = this.tip;
    if (tip.spec.acceptsLines) tip.spec.addLine!(this, tip, this.stack.length - 1);
    else if (this.offset < this.line.length && !this.blank) {
      this.addChild(flavor.newParagraph());
      this.advanceNextNonspace();
      this.tip.spec.addLine!(this, this.tip, this.stack.length - 1);
    }
  }

  // ------------------------------------------------------------------------ position helpers

  advanceOffset(count: number, columns: boolean): void {
    const ln = this.line;
    while (count > 0 && this.offset < ln.length) {
      if (ln.charCodeAt(this.offset) === 9) {
        const charsToTab = 4 - (this.column % 4);
        if (columns) {
          this.partiallyConsumedTab = charsToTab > count;
          const charsToAdvance = charsToTab > count ? count : charsToTab;
          this.column += charsToAdvance;
          this.offset += this.partiallyConsumedTab ? 0 : 1;
          count -= charsToAdvance;
        } else {
          this.partiallyConsumedTab = false;
          this.column += charsToTab;
          this.offset += 1;
          count -= 1;
        }
      } else {
        this.partiallyConsumedTab = false;
        this.offset += 1;
        this.column += 1;
        count -= 1;
      }
    }
  }

  advanceNextNonspace(): void {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  }

  findNextNonspace(): void {
    // the offset is still within the run of whitespace scanned last: the same character (its column
    // doesn't depend on where the scan began); else the scan of every container would be quadratic
    if (this.nonspaceLine === this.lineIndex && this.offset >= this.nonspaceFrom && this.offset <= this.nextNonspace) {
      this.indent = this.nextNonspaceColumn - this.column;
      this.indented = this.indent >= CODE_INDENT;
      return;
    }
    this.nonspaceLine = this.lineIndex;
    this.nonspaceFrom = this.offset;
    const ln = this.line;
    let i = this.offset;
    let cols = this.column;
    let c = -1;
    while (i < ln.length) {
      c = ln.charCodeAt(i);
      if (c === 32) {
        i++;
        cols++;
      } else if (c === 9) {
        i++;
        cols += 4 - (cols % 4);
      } else break;
    }
    this.blank = i >= ln.length;
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = cols - this.column;
    this.indented = this.indent >= CODE_INDENT;
  }

  /** The character code at `pos` in the line as read, or -1. */
  peek(pos: number): number {
    return pos < this.line.length ? this.line.charCodeAt(pos) : -1;
  }

  /** An offset of the line as read, in the line's real text (an appended sentinel takes no room there). */
  real(offset: number): number {
    return offset > this.realLength ? this.realLength : offset;
  }

  /**
   * Records the part of the line from (`from`, `fromColumn`) to the current position as the piece of
   * the container at stack index `index`.
   */
  piece(index: number, kind: string, from: number, fromColumn: number): void {
    this.pieces.push({
      depth: index - 1,
      kind,
      from: this.real(from),
      to: this.real(this.offset),
      fromColumn,
      toColumn: this.column,
      partialTab: this.partiallyConsumedTab,
    });
  }

  /**
   * The text of line `index`, for a rule that has to look ahead (as read: NUL replaced, no
   * sentinels), or null past the end. The line's record notes how far it looked.
   */
  lookAhead(index: number): string | null {
    const source = this.source;
    if (index >= source.starts.length) {
      this.ahead = Math.max(this.ahead, source.starts.length - this.lineIndex);
      return null;
    }
    this.ahead = Math.max(this.ahead, index - this.lineIndex);
    return source.text.slice(source.starts[index]!, source.ends[index]!).replace(/\0/g, '�');
  }

  // --------------------------------------------------------------------------- stack helpers

  get tip(): Frame {
    return this.stack[this.stack.length - 1]!;
  }

  /** Replaces the frame at stack `index` (a block's state changed). */
  replace(index: number, frame: Frame): void {
    this.stack[index] = frame;
    this.changed = true;
  }

  /** Sets attributes of the container at stack `index`, which must have been opened on this line. */
  annotate(index: number, attrs: Readonly<Record<string, unknown>>): void {
    this.attrs[index] = { ...this.attrs[index], ...attrs };
  }

  /** What the container at stack `index` was annotated with (`annotate`), or null. */
  attrsAt(index: number): Readonly<Record<string, unknown>> | null {
    return this.attrs[index] ?? null;
  }

  /** Whether the container at stack `index` was opened on this line. */
  openedHere(index: number): boolean {
    return index >= this.pushedFrom;
  }

  /** Opens a block, closing the open blocks that can't contain it. `attrs` go to a container's block. */
  addChild(frame: Frame, attrs: Readonly<Record<string, unknown>> | null = null): void {
    this.makeRoomFor(frame.spec);
    this.stack.push(frame);
    this.changed = true;
    if (frame.spec.container) {
      const index = this.stack.length - 1;
      if (index < this.pushedFrom) this.pushedFrom = index;
      this.attrs[index] = attrs;
    }
  }

  /** Records a leaf block made of this line alone (an ATX heading, a thematic break). */
  addSingleLine(role: LeafRole, spec: BlockSpec = this.flavor.paragraph): void {
    this.makeRoomFor(spec);
    this.leaf = role;
  }

  /** Closes open blocks until the tip can contain a `spec` block, and tells the tip it gets a child. */
  private makeRoomFor(spec: BlockSpec): void {
    while (!canContain(this.tip, spec)) this.closeTop();
    const index = this.stack.length - 1;
    const parent = this.stack[index]!;
    if (parent.spec.childAdded) {
      const next = parent.spec.childAdded(parent);
      if (next !== parent) this.replace(index, next);
    }
  }

  /**
   * The rest of the line, from the current offset, is the open leaf's text (a leaf's `addLine` calls
   * this). A tab the containers took part of is consumed, its rest counted as padding.
   */
  takeLine(): void {
    if (this.partiallyConsumedTab) {
      this.offset += 1;
      this.pad = 4 - (this.column % 4);
    }
    this.textAt = this.offset;
  }

  /** Sets this line's leaf role. */
  setLeaf(role: LeafRole): void {
    this.leaf = role;
  }

  /** The leaf role of this line so far. */
  get role(): LeafRole | null {
    return this.leaf;
  }

  /** Rewrites the leaf role of earlier line `index` (a backward effect on the open paragraph's lines). */
  rewriteRole(index: number, role: LeafRole): void {
    this.records[index] = { ...this.records[index]!, leaf: role };
  }

  /** Closes every block open at the line's start that didn't match it. */
  closeUnmatchedBlocks(): void {
    if (this.allClosed) return;
    while (this.stack.length - 1 > this.lastMatched) this.closeTop();
    this.allClosed = true;
  }

  /** Closes the top block. */
  closeTop(): void {
    const frame = this.stack.pop()!;
    this.changed = true;
    if (this.stack.length <= this.pushedFrom) this.pushedFrom = Infinity;
    frame.spec.close?.(this, frame);
  }

  /** Removes the top block without closing it (it ends on this line, which it took: a closing fence). */
  popTop(): void {
    this.stack.pop();
    this.changed = true;
  }
}

function canContain(parent: Frame, child: BlockSpec): boolean {
  const spec = parent.spec;
  if (!spec.container) return false;
  return spec.canContain ? spec.canContain(child) : child.type !== 'item';
}
