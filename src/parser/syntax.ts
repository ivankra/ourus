// A parsed document: the line machine's records and states for every line, and the views built from
// them when first asked for (the block tree, the line table, each leaf's inlines).
//
// Parsing is incremental. After an edit, the machine restarts at the first changed line (or earlier,
// at a line that looked ahead into the change, or at the start of the paragraph open there) and
// reads on until its state equals the old parse's state at the same place in the old text: every
// line after that reads as before, so the old records are reused (they are relative to their line's
// start, so they hold wherever the line moved). Equal state includes the open paragraph's content,
// since the only effects reaching back to earlier lines depend on it.

import { applyChanges, lineEnding, lineIndexAt, normalizeChanges, splitLines, type ChangeSpec } from '../text.ts';
import { isBlankText, isSpaceOrTab, normalizeLabel } from './chars.ts';
import { PARAGRAPH, PARAGRAPH_FIRST, PARAGRAPH_NEXT, type ParagraphFrame } from './blocks.ts';
import { commonmark, type Flavor, type MutableBlock } from './flavor.ts';
import { InlineParser } from './inlines.ts';
import { frameEquals, Machine, type LineRecord, type LineSource, type State } from './machine.ts';
import { scanReference, type Reference } from './refs.ts';
import type { Block, InlineNode, InlineText, LineInfo, PrefixPiece } from './types.ts';
import { preorder } from './walk.ts';

export interface ParseOptions {
  /**
   * Offsets read as if a character had been typed there (an editor's placeholders): at a line's end
   * the character is appended, at a space or tab it is read in place of it. An offset after the
   * text's final line ending stands for an empty last line.
   */
  readonly sentinels?: readonly number[];
}

/** Which lines an update read again, in the new document's line numbers (`to` inclusive; empty when `to < from`). */
export interface Reread {
  readonly from: number;
  readonly to: number;
  /** Whether everything was parsed afresh. */
  readonly full: boolean;
}


/** InlineNode trees by leaf text, shared by the snapshots of a document while its definitions stay the same. */
interface InlineCache {
  readonly key: string;
  readonly map: Map<string, readonly InlineNode[]>;
}

const EMPTY_SENTINELS: ReadonlyMap<number, readonly number[]> = new Map();
const NO_INLINES: readonly InlineNode[] = Object.freeze([]);

export class SyntaxTree {
  readonly text: string;
  readonly flavor: Flavor;
  /** Line starts and ends (before the line ending), for every line the machine read. */
  readonly starts: readonly number[];
  readonly ends: readonly number[];
  readonly records: readonly LineRecord[];
  readonly states: readonly State[];
  /** Sentinels by line: offsets within the line. */
  readonly sentinels: ReadonlyMap<number, readonly number[]>;
  /** The last line is an empty line after the text's final line ending, there only for a sentinel. */
  readonly extraLine: boolean;
  readonly reread: Reread;
  /** Lines whose reading looked at lines after them, ascending. */
  private readonly lookaheads: readonly number[];
  private tree: Tree | null;
  private readonly lineInfos: LineInfo[] = [];
  private allLines: LineInfo[] | null = null;
  private refs: ReadonlyMap<string, Reference> | null = null;
  private footnoteLabels: ReadonlySet<string> | null = null;
  private inlineCache: InlineCache | null;
  private cacheChecked = false;
  private readonly leafInlines = new Map<Block, readonly InlineNode[]>();
  private readonly leafTexts = new Map<Block, InlineText | null>();

  private constructor(
    text: string,
    flavor: Flavor,
    starts: number[],
    ends: number[],
    records: LineRecord[],
    states: State[],
    sentinels: ReadonlyMap<number, readonly number[]>,
    extraLine: boolean,
    reread: Reread,
    inlineCache: InlineCache | null,
    tree: Tree | null = null,
  ) {
    this.tree = tree;
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
    const lookaheads: number[] = [];
    for (let i = 0; i < records.length; i++) if (records[i]!.ahead > 0) lookaheads.push(i);
    this.lookaheads = lookaheads;
  }

  /** Parses `text`. Never fails: every string is a document. */
  static parse(text: string, flavor: Flavor = commonmark, options: ParseOptions = {}): SyntaxTree {
    const { starts, ends } = splitLines(text);
    const s = [...starts];
    const e = [...ends];
    const { sentinels, extraLine } = placeSentinels(text, s, e, options.sentinels);
    const n = s.length;
    const records: LineRecord[] = new Array(n);
    const states: State[] = new Array(n);
    const machine = new Machine(flavor, { text, starts: s, ends: e, sentinels }, records, states, flavor.initialState);
    for (let i = 0; i < n; i++) machine.read(i);
    machine.finish(n);
    return new SyntaxTree(text, flavor, s, e, records, states, sentinels, extraLine, { from: 0, to: n - 1, full: true }, null);
  }

  /**
   * The syntax of the text after `changes` (in this text's coordinates, CodeMirror's ChangeSpec
   * semantics), read again only where the changes can have made a difference.
   */
  update(changes: readonly ChangeSpec[], options: ParseOptions = {}): SyntaxTree {
    const list = normalizeChanges(changes);
    const text = list.length ? applyChanges(this.text, list) : this.text;
    const flavor = this.flavor;
    if (this.extraLine) return SyntaxTree.parse(text, flavor, options);

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
      starts = this.starts as number[];
      ends = this.ends as number[];
      afterNew = oldN;
    }
    const lineDelta = afterNew - (lastOld + 1);
    const { sentinels, extraLine } = placeSentinels(text, starts, ends, options.sentinels);
    if (extraLine) return SyntaxTree.parse(text, flavor, options);
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
    const records: LineRecord[] = this.records.slice(0, restart) as LineRecord[];
    const states: State[] = this.states.slice(0, restart) as State[];
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
    const machine = new Machine(flavor, source, records, states, before);
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
    const reread: Reread = { from: restart, to: converged >= 0 ? converged : n - 1, full: restart === 0 && converged < 0 };
    // the same lines, read the same: the old blocks still hold (they keep no absolute offsets)
    let tree: Tree | null = null;
    if (this.tree && lineDelta === 0 && n === oldN) {
      const from = open.spec === PARAGRAPH ? restart - (open as ParagraphFrame).lines : restart;
      let same = true;
      for (let l = from; l <= reread.to && same; l++) same = sameRecord(records[l]!, this.records[l]!);
      if (same) tree = this.tree;
    }
    return new SyntaxTree(text, flavor, starts, ends, records, states, sentinels, false, reread, this.inlineCache, tree);
  }

  // ----------------------------------------------------------------------------- the views

  /** The number of lines (an empty text has none; a final line ending doesn't start one). */
  get lineCount(): number {
    return this.starts.length;
  }

  /** The block tree's root: the document. */
  get root(): Block {
    return this.build().root;
  }

  /** Line `i`'s info (made when first asked for). */
  line(i: number): LineInfo {
    return (this.lineInfos[i] ??= lineInfo(this, this.build(), i));
  }

  /** The line table: every line's info. */
  get lines(): readonly LineInfo[] {
    if (this.allLines) return this.allLines;
    const all: LineInfo[] = new Array(this.starts.length);
    for (let i = 0; i < all.length; i++) all[i] = this.line(i);
    return (this.allLines = all);
  }

  /** The offset in the text of `offset` from line `line`'s start (blocks hold their offsets that way). */
  offset(line: number, offset: number): number {
    return this.starts[line]! + offset;
  }

  /** An item's marker (`-`, `1.`): where it starts and ends in the text. */
  markerFrom(item: Block): number {
    return this.starts[item.startLine]! + item.markerStart!;
  }

  markerTo(item: Block): number {
    return this.starts[item.startLine]! + item.markerEnd!;
  }

  private build(): Tree {
    return (this.tree ??= buildTree(this));
  }

  /** Link reference definitions by normalized label; the first definition of a label wins. */
  get references(): ReadonlyMap<string, Reference> {
    if (this.refs) return this.refs;
    const refs = new Map<string, Reference>();
    for (const b of preorder(this.root)) {
      if (b.type !== 'refdef') continue;
      const ref = scanReference(this.leafLines(b, b.startLine, b.endLine).join('\n') + '\n');
      if (ref && !refs.has(ref.normalized)) refs.set(ref.normalized, ref.reference);
    }
    return (this.refs = refs);
  }

  /** Normalized labels of footnote definitions (GFM). */
  get footnotes(): ReadonlySet<string> {
    if (this.footnoteLabels) return this.footnoteLabels;
    const labels = new Set<string>();
    if (this.flavor.has('footnotes')) for (const b of preorder(this.root)) if (b.type === 'footnote_definition') labels.add(normalizeLabel('[' + b.label!.slice(2)));
    return (this.footnoteLabels = labels);
  }

  /** A leaf's inline text (paragraphs, headings, table cells, ...), or null for blocks without inlines. */
  inlineText(block: Block): InlineText | null {
    let t = this.leafTexts.get(block);
    if (t === undefined) {
      const of = this.flavor.inlineText.get(block.type);
      t = of ? of(this, block) : null;
      this.leafTexts.set(block, t);
    }
    return t;
  }

  /** A leaf's inlines. */
  inlines(block: Block): readonly InlineNode[] {
    let result = this.leafInlines.get(block);
    if (result) return result;
    const t = this.inlineText(block);
    if (!t) return NO_INLINES;
    const cache = this.cache();
    result = cache.map.get(t.text);
    if (!result) {
      result = new InlineParser(this.flavor.inline, { references: this.references, footnotes: this.footnotes }, t.text).parse();
      cache.map.set(t.text, result);
    }
    this.leafInlines.set(block, result);
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
  leafLines(block: Block, from = block.startLine, to = block.endLine): string[] {
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
function sameState(): (a: State, b: State, i: number) => boolean {
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

// ---------------------------------------------------------------------------- the tree

/** The block tree, and per line its containers and leaf: what line infos are made from. */
interface Tree {
  readonly root: Block;
  readonly chains: readonly (readonly Block[])[];
  readonly leaves: readonly (Block | null)[];
}

const NO_PIECES: readonly PrefixPiece[] = Object.freeze([]);

const keyLists = new WeakMap<object, readonly string[]>();

/** An attribute object's keys that become block attributes; cached, as most lines share their role objects. */
function attributeKeys(attrs: object): readonly string[] {
  let keys = keyLists.get(attrs);
  if (!keys) {
    // `part`: what the line is within its leaf (a table row), for the leaf's builder; `blank`: a
    // whitespace line of indented code
    keys = Object.keys(attrs).filter((k) => k !== 'type' && k !== 'first' && k !== 'part' && k !== 'blank');
    keyLists.set(attrs, keys);
  }
  return keys;
}

function copyAttributes(attrs: Readonly<Record<string, unknown>>, into: Record<string, unknown>): void {
  for (const key of attributeKeys(attrs)) into[key] = attrs[key];
}

function makeBlock(type: string, line: number, parent: MutableBlock | null): MutableBlock {
  const b: MutableBlock = { type, startLine: line, endLine: line, children: NO_CHILDREN, parent };
  if (parent) {
    if (parent.children === NO_CHILDREN) parent.children = [b];
    else parent.children.push(b);
  }
  return b;
}

/** Until a block gets a child: one frozen empty list, shared. */
const NO_CHILDREN = Object.freeze([]) as unknown as MutableBlock[];

/** The block tree from the records (and nothing else: so equal records make an equal tree). */
function buildTree(syntax: SyntaxTree): Tree {
  const { records, flavor } = syntax;
  const n = records.length;
  const root = makeBlock('document', 0, null);
  const chain: MutableBlock[] = [];
  let chainView: readonly MutableBlock[] = [];
  let leaf: MutableBlock | null = null;
  let leafType = '';
  const chains: (readonly MutableBlock[])[] = new Array(n);
  const leaves: (MutableBlock | null)[] = new Array(n);
  /** Indented code blocks and their last line that isn't only whitespace. */
  const indentedCode = new Map<MutableBlock, number>();
  const containers: MutableBlock[] = [];

  for (let i = 0; i < n; i++) {
    const rec = records[i]!;
    const keep = rec.depth - rec.opened.length;
    if (chain.length > keep || rec.opened.length) leaf = null;
    let changed = false;
    while (chain.length > keep) {
      const b = chain.pop()!;
      if (b.type === 'blockquote' || b.type === 'footnote_definition') b.endLine = i - 1;
      changed = true;
    }
    for (const o of rec.opened) {
      const parent = chain[chain.length - 1] ?? root;
      const b = makeBlock(o.type, i, parent);
      if (o.attrs) copyAttributes(o.attrs, b);
      if (o.type === 'item' && parent.type === 'list' && parent.children.length === 1) parent.list = b.list;
      chain.push(b);
      containers.push(b);
      changed = true;
    }
    if (changed) chainView = chain.slice();
    chains[i] = chainView;
    const container = chain[chain.length - 1] ?? root;
    const role = rec.leaf;
    if (!role) {
      leaf = null;
      leaves[i] = null;
      continue;
    }
    if (role.first || !leaf || leafType !== role.type || leaf.parent !== container) {
      leaf = makeBlock(role.type, i, container);
      copyAttributes(role, leaf);
      leafType = role.type;
      if (role.type === 'code_block' && role.fenced === false) indentedCode.set(leaf, i);
    } else {
      leaf.endLine = i;
      if (role.closed) leaf.closed = true;
      if (!role.blank && indentedCode.has(leaf)) indentedCode.set(leaf, i);
    }
    flavor.leafBuilders.get(role.type)?.line(leaf, role, i);
    leaves[i] = leaf;
  }
  for (const b of chain) if (b.type === 'blockquote' || b.type === 'footnote_definition') b.endLine = n - 1;
  root.endLine = n - 1;

  // indented code doesn't end with blank lines
  for (const [b, last] of indentedCode) {
    for (let l = last + 1; l <= b.endLine; l++) if (leaves[l] === b) leaves[l] = null;
    b.endLine = last;
  }

  // items end with their last child, lists with their last item; tightness; innermost first
  for (let k = containers.length - 1; k >= 0; k--) {
    const b = containers[k]!;
    if (b.type === 'item') b.endLine = b.children.length ? b.children[b.children.length - 1]!.endLine : b.startLine;
    else if (b.type === 'list') {
      b.endLine = b.children[b.children.length - 1]!.endLine;
      b.tight = isTight(b);
    }
  }
  return { root: root as unknown as Block, chains: chains as unknown as (readonly Block[])[], leaves: leaves as unknown as (Block | null)[] };
}

/** Line `i`'s info, from the tree and the snapshot's text. */
function lineInfo(syntax: SyntaxTree, tree: Tree, i: number): LineInfo {
  const { text } = syntax;
  const rec = syntax.records[i]!;
  const from = syntax.starts[i]!;
  const to = syntax.ends[i]!;
  const chain = tree.chains[i]!;
  let prefix = NO_PIECES;
  if (rec.pieces.length) {
    const pieces: PrefixPiece[] = new Array(rec.pieces.length);
    for (let k = 0; k < rec.pieces.length; k++) {
      const p = rec.pieces[k]!;
      pieces[k] = { block: chain[p.depth]!, kind: p.kind, from: from + p.from, to: from + p.to, fromColumn: p.fromColumn, toColumn: p.toColumn, partialTab: p.partialTab };
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
    containers: chain,
    container: chain[chain.length - 1] ?? tree.root,
    leaf: tree.leaves[i]!,
    lazy: rec.lazy,
    blank: empty && (contentFrom === from || isBlankText(text, from, contentFrom)),
    empty,
  };
}

/** Whether two records are equal as data (what the tree is made from). */
function sameRecord(a: LineRecord, b: LineRecord): boolean {
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

/**
 * CommonMark list tightness: no blank line between the items, nor between the blocks of an item.
 * Reference definitions count as the paragraph they were written in.
 */
function isTight(list: MutableBlock): boolean {
  const separated = (blocks: readonly MutableBlock[]): boolean => {
    for (let i = 0; i + 1 < blocks.length; i++) if (blocks[i]!.endLine !== blocks[i + 1]!.startLine - 1) return true;
    return false;
  };
  if (separated(list.children)) return false;
  for (const item of list.children) if (separated(item.children)) return false;
  return true;
}
