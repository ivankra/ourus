// A parsed document: the line machine's records and states for every line, and what is built from
// them when first asked for (the block tree, the line table, each leaf's inlines).
//
// Parsing is incremental. After an edit, the machine restarts at the first changed line (or earlier,
// at a line that looked ahead into the change, or at the start of the paragraph open there) and
// reads on until its state equals the old parse's state at the same place in the old text: every
// line after that reads as before, so the old records are reused (they are relative to their line's
// start, so they hold wherever the line moved). Equal state includes the open paragraph's content,
// since the only effects reaching back to earlier lines depend on it. The block tree is built again
// from the records, taking whole every old block outside the lines read again (`tree.ts`).

import { applyChanges, lineEnding, lineIndexAt, normalizeChanges, splitLines, type ChangeSpec } from '../text/index.ts';
import { isBlankText, isSpaceOrTab, normalizeLabel } from './chars.ts';
import { PARAGRAPH, PARAGRAPH_FIRST, PARAGRAPH_NEXT, type ParagraphFrame } from './blocks.ts';
import { commonmark, type MdFlavor } from './flavor.ts';
import { MdInlineParser } from './inlines.ts';
import { frameEquals, MdMachine, type MdLineRecord, type LineSource, type MdState } from './machine.ts';
import { scanReference, type MdReference } from './refs.ts';
import { allLineBlocks, buildTree, lineBlocks, MdBlockAt, type Reuse } from './tree.ts';
import { plainMarkup } from './markup.ts';
import { renderHtml, type MdHtmlOptions } from './html.ts';
import type { MdBlock, MdInline, MdInlineText, MdLine, MdLineMarkup, MdPrefixPiece } from './types.ts';

/** How to read a text, beyond its flavor. */
export interface MdParseOptions {
  /**
   * Offsets read as if a character had been typed there (an editor's placeholders): at a line's end
   * the character is appended, at a space or tab it is read in place of it. An offset after the
   * text's final line ending stands for an empty last line.
   */
  readonly sentinels?: readonly number[];
}

/** Which lines an update read again, in the new document's line numbers (`to` inclusive; empty when `to < from`). */
export interface MdReread {
  readonly from: number;
  readonly to: number;
  /** Whether everything was parsed afresh. */
  readonly full: boolean;
}

/** Inlines by leaf text, shared by the snapshots of a document while its definitions stay the same. */
interface InlineCache {
  readonly key: string;
  readonly map: Map<string, readonly MdInline[]>;
}

const EMPTY_SENTINELS: ReadonlyMap<number, readonly number[]> = new Map();
const NO_INLINES: readonly MdInline[] = Object.freeze([]);

/**
 * A Markdown text parsed in a flavor: Markdown's own structure of it, as CommonMark defines it. Not
 * the outline: there a heading owns the nodes after it and a paragraph the list after it, and that
 * is built on this one (`doc/`).
 *
 * - **Lines** (`line(i)`, `MdLine`): each line's offsets and ending, the prefix its containers took
 *   (a quote's `>`, an item's marker or indentation), the containers it is in, and its leaf.
 * - **Blocks** (`root`, `MdBlock`): containers (quotes, lists, items, footnote definitions)
 *   holding blocks, and leaves (paragraphs, headings, code, HTML, tables, ...) holding lines; stored
 *   relative to their parent, shared by the snapshots an edit didn't change them in. Where one is in
 *   this tree is an `MdBlockAt` (a line's containers and leaf are).
 * - **Markup** (`markup(i)`): what a leaf has on a line besides its text: a heading's `#`s, a fence,
 *   a checkbox.
 * - **Inlines** (`inlines(leaf)`, `inlineText(leaf)`): a leaf's text parsed into emphasis, links,
 *   code, ..., when first asked for.
 *
 * Lossless: every character of the text is in a prefix, a leaf's markup or text, or a blank line.
 * Immutable: `update(changes)` gives the tree of the edited text, reading again only the lines the
 * edit can affect and sharing every block outside them. Offsets are UTF-16 code units into `text`;
 * lines count from 0, and a final line ending doesn't start a line.
 */
export class MdTree {
  readonly text: string;
  readonly flavor: MdFlavor;
  /** Each line's start, and its end before its line ending. */
  readonly starts: readonly number[];
  readonly ends: readonly number[];
  /** The line machine's record of each line, and its state after it (the incremental tests compare them). */
  readonly records: readonly MdLineRecord[];
  readonly states: readonly MdState[];
  /** The sentinels (`MdParseOptions`), by line: offsets in the line. */
  private readonly sentinels: ReadonlyMap<number, readonly number[]>;
  /** Whether the last line is an empty one after the final line ending, there only for a sentinel. */
  private readonly extraLine: boolean;
  readonly reread: MdReread;
  /** Lines whose reading looked at lines after them, ascending. */
  private readonly lookaheads: readonly number[];
  private blocks: MdBlock | null;
  /** What building the tree can take of the previous snapshot's, until it is built. */
  private reuse: Reuse | null;
  /** `line(i)` and `markup(i)` of the lines asked for so far, by line: this tree's own, as they hold its offsets. */
  private readonly linesCache: MdLine[] = [];
  private readonly lineMarkupsCache: MdLineMarkup[] = [];
  /** `lines`, once asked for. */
  private allLines: MdLine[] | null = null;
  private refs: ReadonlyMap<string, MdReference> | null = null;
  private footnoteLabels: ReadonlySet<string> | null = null;
  private inlineCache: InlineCache | null;
  private cacheChecked = false;
  /** By leaf: a stored block is in a tree once. */
  private readonly leafInlines = new Map<MdBlock, readonly MdInline[]>();
  private readonly leafTexts = new Map<MdBlock, MdInlineText | null>();

  private constructor(
    text: string,
    flavor: MdFlavor,
    starts: number[],
    ends: number[],
    records: MdLineRecord[],
    states: MdState[],
    sentinels: ReadonlyMap<number, readonly number[]>,
    extraLine: boolean,
    reread: MdReread,
    inlineCache: InlineCache | null,
    blocks: MdBlock | null = null,
    reuse: Reuse | null = null,
    lookaheads?: readonly number[],
  ) {
    this.blocks = blocks;
    this.reuse = blocks ? null : reuse;
    this.text = text;
    this.flavor = flavor;
    this.starts = starts;
    this.ends = ends;
    this.records = records;
    this.states = states;
    this.sentinels = sentinels;
    this.extraLine = extraLine;
    this.reread = reread;
    this.inlineCache = inlineCache;
    this.lookaheads = lookaheads ?? records.flatMap((r, i) => (r.ahead > 0 ? [i] : []));
  }

  /** The tree of `text`. Never fails: every string is a document. */
  static parse(text: string, flavor: MdFlavor = commonmark, options: MdParseOptions = {}): MdTree {
    const { starts, ends } = splitLines(text);
    const s = [...starts];
    const e = [...ends];
    const { sentinels, extraLine } = placeSentinels(text, s, e, options.sentinels);
    const n = s.length;
    const records: MdLineRecord[] = new Array(n);
    const states: MdState[] = new Array(n);
    const machine = new MdMachine(flavor, { text, starts: s, ends: e, sentinels }, records, states, flavor.initialState);
    for (let i = 0; i < n; i++) machine.read(i);
    machine.finish(n);
    return new MdTree(text, flavor, s, e, records, states, sentinels, extraLine, { from: 0, to: n - 1, full: true }, null);
  }

  /** The tree of the text after `changes` (in this text's coordinates), read again only where they can make a difference. */
  update(changes: readonly ChangeSpec[], options: MdParseOptions = {}): MdTree {
    const list = normalizeChanges(changes);
    const text = list.length ? applyChanges(this.text, list) : this.text;
    const flavor = this.flavor;
    if (this.extraLine) return MdTree.parse(text, flavor, options);

    const oldN = this.starts.length;
    let firstOld: number; // the first old line a change touches
    let lastOld: number; // the last
    let delta = 0;
    let starts: number[];
    let ends: number[];
    let afterNew: number; // the first new line after the changed ones; it is old line lastOld + 1
    if (list.length) {
      firstOld = lineIndexAt(this.starts, list[0]!.from);
      // a change at a line's start can join the line ending before it, a lone CR, with a LF
      if (firstOld > 0 && list[0]!.from === this.starts[firstOld] && this.text.charCodeAt(list[0]!.from - 1) === 13) firstOld--;
      lastOld = lineIndexAt(this.starts, list[list.length - 1]!.to);
      for (const c of list) delta += c.insert.length - (c.to - c.from);
      const regionFrom = this.starts[firstOld] ?? this.text.length;
      const oldRegionEnd = lastOld + 1 < oldN ? this.starts[lastOld + 1]! : this.text.length;
      const middle = splitLines(text.slice(regionFrom, oldRegionEnd + delta));
      starts = this.starts.slice(0, firstOld);
      ends = this.ends.slice(0, firstOld);
      for (let i = 0; i < middle.starts.length; i++) {
        starts.push(middle.starts[i]! + regionFrom);
        ends.push(middle.ends[i]! + regionFrom);
      }
      afterNew = starts.length;
      for (let i = lastOld + 1; i < oldN; i++) {
        starts.push(this.starts[i]! + delta);
        ends.push(this.ends[i]! + delta);
      }
    } else {
      firstOld = oldN;
      lastOld = oldN - 1;
      // copies: a placeholder after the final line ending appends a line to them (`placeSentinels`),
      // which must not change this snapshot
      starts = [...this.starts];
      ends = [...this.ends];
      afterNew = oldN;
    }
    const lineDelta = afterNew - (lastOld + 1);
    const { sentinels, extraLine } = placeSentinels(text, starts, ends, options.sentinels);
    if (extraLine) return MdTree.parse(text, flavor, options);
    const n = starts.length;

    // lines to read again: the changed ones, and those whose sentinels changed
    let dirtyFrom = list.length ? firstOld : n;
    let dirtyTo = list.length ? afterNew - 1 : -1;
    const oldSentinelLine = (l: number): number => (l > lastOld ? l + lineDelta : l < firstOld ? l : -1);
    const lines = new Set<number>(sentinels.keys());
    for (const l of this.sentinels.keys()) lines.add(oldSentinelLine(l));
    for (const l of lines) {
      if (l < 0) continue;
      const oldLine = l >= afterNew ? l - lineDelta : l < firstOld ? l : -1;
      if (oldLine >= 0 && sameOffsets(this.sentinels.get(oldLine), sentinels.get(l))) continue;
      dirtyFrom = Math.min(dirtyFrom, l);
      dirtyTo = Math.max(dirtyTo, l);
    }
    if (list.length === 0 && dirtyTo < dirtyFrom) return this;

    // restart earlier where a line looked ahead into the dirty lines
    let restart = Math.min(dirtyFrom, n);
    for (const l of this.lookaheads) {
      if (l >= restart) break;
      if (l + this.records[l]!.ahead >= dirtyFrom) restart = l;
    }
    const records: MdLineRecord[] = this.records.slice(0, restart) as MdLineRecord[];
    const states: MdState[] = this.states.slice(0, restart) as MdState[];
    records.length = n;
    states.length = n;
    const before = restart > 0 ? states[restart - 1]! : flavor.initialState;
    // a paragraph open before the restart line is open again: its lines are plain paragraph lines
    const open = before[before.length - 1]!;
    if (open.spec === PARAGRAPH) {
      const count = (open as ParagraphFrame).lines;
      for (let l = restart - count; l < restart; l++) records[l] = { ...records[l]!, leaf: l === restart - count ? PARAGRAPH_FIRST : PARAGRAPH_NEXT };
    }
    const source: LineSource = { text, starts, ends, sentinels };
    const machine = new MdMachine(flavor, source, records, states, before);
    const same = sameState();
    let converged = -1;
    for (let i = restart; i < n; i++) {
      machine.read(i);
      if (i < dirtyTo || i < afterNew) continue;
      const old = i - lineDelta;
      if (old <= lastOld || old >= oldN || !same(states[i]!, this.states[old]!, i)) continue;
      // reads as before from here; the open paragraph's lines are what the old parse found them to be
      const top = states[i]![states[i]!.length - 1]!;
      if (top.spec === PARAGRAPH) {
        const count = (top as ParagraphFrame).lines;
        for (let k = 0; k < count; k++) records[i - k] = { ...records[i - k]!, leaf: this.records[old - k]!.leaf };
      }
      converged = i;
      break;
    }
    if (converged >= 0) {
      for (let j = converged + 1; j < n; j++) {
        records[j] = this.records[j - lineDelta]!;
        states[j] = this.states[j - lineDelta]!;
      }
    } else machine.finish(n);
    const reread: MdReread = { from: restart, to: converged >= 0 ? converged : n - 1, full: restart === 0 && converged < 0 };
    // the first line whose record may differ: the open paragraph's lines before the restart are read again
    const from = open.spec === PARAGRAPH ? restart - (open as ParagraphFrame).lines : restart;
    // the same lines, read the same: the old tree holds (it keeps no absolute offsets)
    let blocks: MdBlock | null = null;
    if (this.blocks && lineDelta === 0 && n === oldN) {
      let same = true;
      for (let l = from; l <= reread.to && same; l++) same = sameRecord(records[l]!, this.records[l]!);
      if (same) blocks = this.blocks;
    }
    // else the blocks outside the lines read again are the old ones, where they moved to
    const reuse: Reuse | null = this.blocks ? { old: this.blocks, from, to: reread.to, delta: lineDelta } : null;
    // the lines that looked ahead: the old ones before the restart, those read again, the old ones after, moved
    const lookaheads: number[] = [];
    for (const l of this.lookaheads) {
      if (l >= restart) break;
      lookaheads.push(l);
    }
    for (let l = restart; l <= reread.to; l++) if (records[l]!.ahead > 0) lookaheads.push(l);
    if (converged >= 0) for (const l of this.lookaheads) if (l + lineDelta > reread.to) lookaheads.push(l + lineDelta);
    return new MdTree(text, flavor, starts, ends, records, states, sentinels, false, reread, this.inlineCache, blocks, reuse, lookaheads);
  }

  // ----------------------------------------------------------------------------- the blocks

  /** The number of lines (an empty text has none; a final line ending doesn't start one). */
  get lineCount(): number {
    return this.starts.length;
  }

  /** The block tree's root, the document (on line 0): shared with every snapshot that took it whole. */
  get root(): MdBlock {
    return this.build();
  }

  /** The document's block, where it is: its first line, 0. */
  get rootAt(): MdBlockAt {
    return new MdBlockAt(this.root, 0);
  }

  /** Line `i`. */
  line(i: number): MdLine {
    let info = this.linesCache[i];
    if (!info) {
      const root = this.build();
      const { containers, leaf } = lineBlocks(root, i);
      info = this.linesCache[i] = lineInfo(this, root, i, containers, leaf);
    }
    return info;
  }

  /** Line `i`'s markup past its containers' prefix (a heading's `#`s, a fence, a checkbox, ...) and its text. */
  markup(i: number): MdLineMarkup {
    let markup = this.lineMarkupsCache[i];
    if (!markup) {
      const line = this.line(i);
      const of = line.leaf && this.flavor.lineMarkup.get(line.leaf.block.type);
      markup = of ? of(this, line.leaf!, i) : plainMarkup(this, i);
      // the checkbox of a task the line starts, before the item's text
      const item = line.containers[line.containers.length - 1];
      const task = item?.block.type === 'item' && item.line === i ? item.block.attrs.task : undefined;
      if (task) {
        const box = { kind: 'task', from: line.from + task.start, to: line.from + task.end };
        markup = line.leaf ? { ...markup, marks: [box, ...markup.marks] } : { marks: [box], textFrom: box.to, textTo: box.to };
      }
      this.lineMarkupsCache[i] = markup;
    }
    return markup;
  }

  /** Every line. */
  get lines(): readonly MdLine[] {
    if (this.allLines) return this.allLines;
    const root = this.build();
    const n = this.starts.length;
    const { containers, leaves } = allLineBlocks(root, n);
    const all: MdLine[] = new Array(n);
    for (let i = 0; i < n; i++) all[i] = this.linesCache[i] ??= lineInfo(this, root, i, containers[i]!, leaves[i]!);
    return (this.allLines = all);
  }

  /** HTML exactly as commonmark.js and cmark-gfm write it; extensions render their own blocks and inlines. */
  renderHtml(options: MdHtmlOptions = {}): string {
    return renderHtml(this, options);
  }

  /** Where an item's marker (`-`, `1.`) starts in the text. */
  markerFrom(item: MdBlockAt): number {
    return this.starts[item.line]! + item.block.attrs.markerStart!;
  }

  /** Where an item's marker ends in the text. */
  markerTo(item: MdBlockAt): number {
    return this.starts[item.line]! + item.block.attrs.markerEnd!;
  }

  private build(): MdBlock {
    if (!this.blocks) {
      this.blocks = buildTree(this.records, this.flavor, this.reuse);
      this.reuse = null;
    }
    return this.blocks;
  }

  /** Link reference definitions by normalized label; the first definition of a label wins. */
  get references(): ReadonlyMap<string, MdReference> {
    if (this.refs) return this.refs;
    const refs = new Map<string, MdReference>();
    for (const b of this.rootAt.preorder()) {
      if (b.block.type !== 'refdef') continue;
      const ref = scanReference(this.leafLines(b).join('\n') + '\n');
      if (ref && !refs.has(ref.normalized)) refs.set(ref.normalized, ref.reference);
    }
    return (this.refs = refs);
  }

  /** Normalized labels of footnote definitions (GFM). */
  get footnotes(): ReadonlySet<string> {
    if (this.footnoteLabels) return this.footnoteLabels;
    const labels = new Set<string>();
    if (this.flavor.has('footnotes')) for (const b of this.rootAt.preorder()) if (b.block.type === 'footnote_definition') labels.add(normalizeLabel('[' + b.block.attrs.label!.slice(2)));
    return (this.footnoteLabels = labels);
  }

  /** A leaf's inline text (paragraphs, headings, table cells, ...), or null for blocks without inlines. */
  inlineText(leaf: MdBlockAt): MdInlineText | null {
    let t = this.leafTexts.get(leaf.block);
    if (t === undefined) {
      const of = this.flavor.inlineText.get(leaf.block.type);
      t = of ? of(this, leaf) : null;
      this.leafTexts.set(leaf.block, t);
    }
    return t;
  }

  /**
   * The leaf whose inline text holds `pos`: its line's leaf, or the part of it there that has the
   * text (a table's cell, `start`–`end` of its row's line).
   */
  #inlineLeafAt(pos: number): MdBlockAt | null {
    const line = this.line(lineIndexAt(this.starts, pos));
    let at = line.leaf;
    if (!at || this.inlineText(at)) return at;
    const col = pos - line.from;
    for (let parts = at.children(); parts.length; ) {
      const part = parts.find((p) => p.line === line.index && (p.block.attrs.start === undefined || (p.block.attrs.start <= col && col <= p.block.attrs.end!)));
      if (!part) return at;
      at = part;
      if (this.inlineText(at)) return at;
      parts = at.children();
    }
    return at;
  }

  /**
   * Whether the backslash at offset `pos` is read as an inline escape: in its leaf's inline text, and
   * not literal (in a code span, which can cross lines; raw HTML; an autolink; math).
   */
  inlineEscapeAt(pos: number): boolean {
    if (this.text[pos] !== '\\' || this.lineCount === 0) return false;
    const leaf = this.#inlineLeafAt(pos);
    const text = leaf && this.inlineText(leaf);
    if (!text) return false;
    const at = text.textAt(pos);
    if (at < 0) return false;
    const find = (inlines: readonly MdInline[]): boolean => {
      for (const node of inlines) {
        if (node.to <= at || node.from > at) continue;
        if (node.type === 'escape') return node.from === at;
        return node.children ? find(node.children) : false;
      }
      return false;
    };
    return find(this.inlines(leaf));
  }

  /** The code span `pos` is inside (past its opening backtick): where its closing run starts and where the span ends; null outside one. */
  codeSpanAt(pos: number): { readonly closer: number; readonly to: number } | null {
    if (this.lineCount === 0) return null;
    const leaf = this.#inlineLeafAt(pos);
    const text = leaf && this.inlineText(leaf);
    if (!text) return null;
    const at = text.textAt(pos);
    if (at < 0) return null;
    const find = (inlines: readonly MdInline[]): MdInline | null => {
      for (const node of inlines) {
        if (node.type === 'code' && node.from < at && at < node.to) return node;
        const inner = node.children && node.from < at && at < node.to ? find(node.children) : null;
        if (inner) return inner;
      }
      return null;
    };
    const span = find(this.inlines(leaf));
    if (!span) return null;
    let closer = span.to;
    while (closer > span.from && text.text[closer - 1] === '`') closer--;
    return { closer: text.sourceAt(closer), to: text.sourceAt(span.to) };
  }

  /** A leaf's inlines, parsed when first asked for; none for blocks without inline text. */
  inlines(leaf: MdBlockAt): readonly MdInline[] {
    let result = this.leafInlines.get(leaf.block);
    if (result) return result;
    const t = this.inlineText(leaf);
    if (!t) return NO_INLINES;
    const cache = this.cache();
    result = cache.map.get(t.text);
    if (!result) {
      result = new MdInlineParser(this.flavor.inline, { references: this.references, footnotes: this.footnotes }, t.text).parse();
      cache.map.set(t.text, result);
    }
    this.leafInlines.set(leaf.block, result);
    return result;
  }

  private cache(): InlineCache {
    if (this.cacheChecked) return this.inlineCache!;
    this.cacheChecked = true;
    let key = '';
    for (const [label, ref] of this.references) key += `${label}\u0000${ref.destination}\u0000${ref.title}\u0001`;
    for (const label of this.footnotes) key += `^${label}\u0001`;
    if (!this.inlineCache || this.inlineCache.key !== key || this.inlineCache.map.size > 4 * this.lineCount + 1024) {
      this.inlineCache = { key, map: new Map() };
    }
    return this.inlineCache;
  }

  /**
   * The text of a leaf's lines `from`..`to` as its leaf reads them: after the containers' prefixes
   * and the leaf's own indentation, a partly taken tab's rest as spaces.
   */
  leafLines(leaf: MdBlockAt, from = leaf.line, to = leaf.lastLine): string[] {
    const out: string[] = [];
    for (let l = from; l <= to; l++) {
      const rec = this.records[l]!;
      if (rec.text < 0) {
        out.push('');
        continue;
      }
      const start = this.starts[l]!;
      out.push(' '.repeat(rec.pad) + clean(this.text.slice(Math.min(start + rec.text, this.ends[l]!), this.ends[l]!)));
    }
    return out;
  }

  /** Where the leaf's text starts on line `l` (after its own indentation), or -1 when the line has none. */
  textStart(l: number): number {
    const rec = this.records[l]!;
    return rec.text < 0 ? -1 : Math.min(this.starts[l]! + rec.text, this.ends[l]!);
  }
}

/**
 * Equality of a new state at line `i` with an old one, past the changed lines. The open paragraph's
 * content is compared once per paragraph: its lines after the changed ones read the same in both
 * parses, so the answer can't change while the paragraph goes on (comparing it on every line of a
 * long paragraph would be quadratic).
 */
function sameState(): (a: MdState, b: MdState, i: number) => boolean {
  let start = -1;
  let equal = false;
  return (a, b, i) => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    const last = a.length - 1;
    for (let k = 0; k < last; k++) if (!frameEquals(a[k]!, b[k]!)) return false;
    const x = a[last]!;
    const y = b[last]!;
    if (x.spec !== PARAGRAPH || y.spec !== PARAGRAPH) return frameEquals(x, y);
    if (!frameEquals(x, y, 'content')) return false;
    const paragraphStart = i - (x as ParagraphFrame).lines + 1;
    if (paragraphStart !== start) {
      start = paragraphStart;
      equal = (x as ParagraphFrame).content === (y as ParagraphFrame).content;
    }
    return equal;
  };
}

/** NUL reads as the replacement character. */
const clean = (s: string): string => (s.indexOf('\0') < 0 ? s : s.replace(/\0/g, '�'));

function sameOffsets(a: readonly number[] | undefined, b: readonly number[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Sentinel offsets by line; an offset after the final line ending adds an empty last line. */
function placeSentinels(
  text: string,
  starts: number[],
  ends: number[],
  offsets: readonly number[] | undefined,
): { sentinels: ReadonlyMap<number, readonly number[]>; extraLine: boolean } {
  if (!offsets || offsets.length === 0) return { sentinels: EMPTY_SENTINELS, extraLine: false };
  const map = new Map<number, number[]>();
  let extraLine = false;
  for (const p of [...new Set(offsets)].sort((a, b) => a - b)) {
    if (p < 0 || p > text.length) continue;
    const last = text.charCodeAt(text.length - 1);
    if (p === text.length && (text.length === 0 || last === 10 || last === 13)) {
      if (!extraLine) {
        starts.push(text.length);
        ends.push(text.length);
        extraLine = true;
      }
      map.set(starts.length - 1, [0]);
      continue;
    }
    const i = lineIndexAt(starts, p);
    if (p > ends[i]!) continue;
    if (p < ends[i]! && !isSpaceOrTab(text.charCodeAt(p))) continue;
    const list = map.get(i) ?? [];
    list.push(p - starts[i]!);
    map.set(i, list);
  }
  return { sentinels: map, extraLine };
}

// ---------------------------------------------------------------------------- the lines

const NO_PIECES: readonly MdPrefixPiece[] = Object.freeze([]);

/** Line `i`'s info, from the tree and the snapshot's text. */
function lineInfo(tree: MdTree, root: MdBlock, i: number, containers: readonly MdBlockAt[], leaf: MdBlockAt | null): MdLine {
  const { text } = tree;
  const rec = tree.records[i]!;
  const from = tree.starts[i]!;
  const to = tree.ends[i]!;
  let prefix = NO_PIECES;
  if (rec.pieces.length) {
    const pieces: MdPrefixPiece[] = new Array(rec.pieces.length);
    for (let k = 0; k < rec.pieces.length; k++) {
      const p = rec.pieces[k]!;
      pieces[k] = { container: containers[p.depth]!, kind: p.kind, from: from + p.from, to: from + p.to, fromColumn: p.fromColumn, toColumn: p.toColumn, partialTab: p.partialTab };
    }
    prefix = pieces;
  }
  const last = prefix[prefix.length - 1];
  const contentFrom = last ? last.to : from;
  const empty = isBlankText(text, contentFrom, to);
  return {
    index: i,
    from,
    to,
    ending: lineEnding(text, to),
    prefix,
    contentFrom,
    contentColumn: last ? last.toColumn : 0,
    containers,
    container: containers[containers.length - 1] ?? new MdBlockAt(root, 0),
    leaf,
    lazy: rec.lazy,
    blank: empty && (contentFrom === from || isBlankText(text, from, contentFrom)),
    empty,
  };
}

/** Whether two records are equal as data (what the tree is made from). */
function sameRecord(a: MdLineRecord, b: MdLineRecord): boolean {
  if (a === b) return true;
  if (a.depth !== b.depth || a.lazy !== b.lazy || a.text !== b.text || a.pad !== b.pad || a.ahead !== b.ahead) return false;
  if (a.leaf !== b.leaf && !sameData(a.leaf, b.leaf)) return false;
  if (a.pieces.length !== b.pieces.length || a.opened.length !== b.opened.length) return false;
  for (let k = 0; k < a.pieces.length; k++) if (!sameData(a.pieces[k], b.pieces[k])) return false;
  for (let k = 0; k < a.opened.length; k++) if (!sameData(a.opened[k], b.opened[k])) return false;
  return true;
}

/** Equality of plain data: primitives, arrays, plain objects. */
function sameData(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!sameData(a[i], b[i])) return false;
    return true;
  }
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  for (const k in x) if (!sameData(x[k], y[k])) return false;
  for (const k in y) if (!(k in x)) return false;
  return true;
}
