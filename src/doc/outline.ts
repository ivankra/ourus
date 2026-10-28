// The outline tree: nodes stored with positions relative to their parent, as the parser's blocks are,
// so snapshots share every node an edit didn't reach.
//
// A stored node holds no absolute line and no parent: its kind and id, the blocks it was read from, its
// extent (`lines`: from its first line to the next node's, its descendants and blank lines included,
// so siblings tile their parent), its blank lines after its own text (`gap`), and each child's first
// line from its own. After an update, the build reads the containers on the path to the changed lines
// again and takes every other node whole from the old tree; ids are carried to the nodes made anew.

import { Config } from '../config.ts';
import type { MdBlock, MdTree } from '../parser/index.ts';
import { lineIndexAt, mapPos, type ChangeSpec } from '../text/index.ts';
import { itemHead, nodeKindOf, outlineChildren, quoteHead, type OutlineNodeKind, type OutlineChild } from './rules.ts';
import type { OutlineNodeText } from './text.ts';

/**
 * A node as stored, shared by every snapshot and draft it holds for. A **read** node was read from a
 * document: it has its blocks, its extent and its children's offsets. A **drafted** node was made or
 * changed by a draft (`OurusDraft`): it has no blocks and no lines until the document is read again,
 * but its `source`, the read node it was (null for one the draft made), and its `text` where the
 * draft set it.
 */
export class OutlineNodePersistent {
  /** Given once the build has made the outline (`assignIds`), or by the draft; fixed from then on. */
  readonly id: number = -1;
  readonly kind: OutlineNodeKind;
  /** The parser's block the node is (the document, for the root); null for a drafted node. */
  readonly block: MdBlock | null;
  /** The parser's block holding its own text, if it has one; null for a drafted node. */
  readonly head: MdBlock | null;
  /** Blank lines after its own text, before its first child or what follows it. */
  readonly gap: number;
  /** A read node's extent: from its first line to the next node's (or the document's end). */
  readonly lines: number;
  /** A read node's children's first lines, from its own. */
  readonly offsets: readonly number[];
  readonly children: readonly OutlineNodePersistent[];
  /** A drafted node's: the read node it was, or null for one the draft made. Undefined for a read node. */
  readonly source: OutlineNodePersistent | null | undefined;
  /**
   * A drafted node's text, as the draft set it (null: no text), or undefined: its source's, unchanged.
   * Undefined for a read node, whose text is read from its document (`OurusDoc.textOf`).
   */
  readonly text: OutlineNodeText | null | undefined;

  constructor(kind: OutlineNodeKind, block: MdBlock, head: MdBlock | null, lines: number, offsets: readonly number[], children: readonly OutlineNodePersistent[]) {
    this.kind = kind;
    this.block = block;
    this.head = head;
    this.lines = lines;
    this.offsets = offsets;
    this.children = children;
    const next = children.length ? offsets[0]! : lines;
    this.gap = kind === 'root' ? 0 : Math.max(0, next - this.textLines().last - 1);
  }

  /** A drafted node: `id`, `kind`, its text (undefined: `source`'s), gap and children. */
  static drafted(
    id: number,
    kind: OutlineNodeKind,
    source: OutlineNodePersistent | null,
    text: OutlineNodeText | null | undefined,
    gap: number,
    children: readonly OutlineNodePersistent[],
  ): OutlineNodePersistent {
    const node = Object.create(OutlineNodePersistent.prototype) as { -readonly [K in keyof OutlineNodePersistent]: OutlineNodePersistent[K] };
    Object.assign(node, { id, kind, block: null, head: null, gap, lines: 0, offsets: [], children, source, text });
    return node as OutlineNodePersistent;
  }

  /**
   * The quote that is a read node's text (`Config.quotes`): `text`'s, a paragraph framed by it, its
   * head the paragraph inside it; `atom`'s, its head the quote; an item's on its marker's line too
   * (`- > q`). Null for any other node.
   */
  get textQuote(): MdBlock | null {
    const block = this.block;
    if (!block || this.kind === 'quote' || this.kind === 'root') return null;
    const own = this.kind === 'item' ? block.children[0] : block;
    return own?.type === 'blockquote' && this.head !== null && (this.head === own || this.head === own.children[0]) ? own : null;
  }

  /** Whether it was read from a document (it has blocks), not made or changed by a draft. */
  get read(): boolean {
    return this.block !== null;
  }

  /**
   * The lines of a read node's own text, counted from its first line: an item's or a quote's text is
   * its first block (below its marker, `-⏎  one`, it starts on the next line); a node with no text
   * has its first line only.
   */
  textLines(): { readonly first: number; readonly last: number } {
    if (!this.head) return { first: 0, last: 0 };
    const first = this.kind === 'item' || this.kind === 'quote' ? this.block!.offsets[0]! : 0;
    return { first, last: first + this.head.lines - 1 };
  }
}

/** Lines of the new text an update touched (closed intervals), where no old node is taken whole. */
export class Touched {
  static readonly none = new Touched([]);
  readonly #ranges: readonly (readonly [number, number])[];

  private constructor(ranges: readonly (readonly [number, number])[]) {
    this.#ranges = ranges;
  }

  static of(ranges: readonly (readonly [number, number])[]): Touched {
    if (!ranges.length) return Touched.none;
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const [a, b] of sorted) {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    }
    return new Touched(merged);
  }

  /** These lines and `ranges`'. */
  with(ranges: readonly (readonly [number, number])[]): Touched {
    return ranges.length ? Touched.of([...this.#ranges, ...ranges]) : this;
  }

  /** Whether any touched line is in `[from, to]`. */
  any(from: number, to: number): boolean {
    const ranges = this.#ranges;
    // the last range starting at or before `to`
    let lo = 0;
    let hi = ranges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (ranges[mid]![0] <= to) lo = mid + 1;
      else hi = mid - 1;
    }
    return hi >= 0 && ranges[hi]![1] >= from;
  }
}

/** The old snapshot an update reads from: its tree and outline, and the changes from it. */
export interface OutlinePrevious {
  readonly tree: MdTree;
  readonly root: OutlineNodePersistent;
  /** Sorted, in the old text's offsets. */
  readonly changes: readonly ChangeSpec[];
  readonly nextId: number;
  /** The first line of the old node with id `id`, in the old text, or undefined (`OurusDoc.node`'s index, made once per snapshot). */
  readonly startOf: (id: number) => number | undefined;
}

/** The outline of `tree`: read whole, or from `previous`, taking whole every old node `touched` doesn't reach. */
export function readOutline(
  tree: MdTree,
  previous: OutlinePrevious | null,
  touched: Touched,
  identity?: ReadonlyMap<number, number>,
  config: ReadConfig = Config.defaults,
): { root: OutlineNodePersistent; nextId: number } {
  const build = new Build(tree, previous, previous && identity?.size ? touched.with(identityLines(tree, previous, identity)) : touched, config);
  const root = build.container('root', tree.root, 0, tree.lineCount, previous ? { node: previous.root, start: 0 } : null);
  const nextId = build.assignIds(root, identity);
  return { root, nextId };
}

/** What reading the outline asks of the config. */
export type ReadConfig = Pick<Config, 'quotes' | 'listParent'>;

/** An old node and its first line in the old text. */
interface Located {
  readonly node: OutlineNodePersistent;
  readonly start: number;
}

/** A block of a container, as the node it will be: its first line in the new text; a heading's level. */
interface Entry {
  readonly block: MdBlock;
  readonly kind: Exclude<OutlineNodeKind, 'root'>;
  readonly start: number;
  readonly level: number;
}

/** A container's nodes as the outline has them (`outlineChildren`: sections, owned lists), before they are made. */
type Shell = OutlineChild<Entry>;

class Build {
  readonly tree: MdTree;
  readonly previous: OutlinePrevious | null;
  readonly touched: Touched;
  /** What a quote is and what a list after a block is the children of. */
  readonly config: ReadConfig;
  /** Old nodes taken whole. */
  readonly reused = new Set<OutlineNodePersistent>();
  /** Nodes made anew, their ids still to give. */
  readonly made = new Set<OutlineNodePersistent>();

  constructor(tree: MdTree, previous: OutlinePrevious | null, touched: Touched, config: ReadConfig) {
    this.tree = tree;
    this.previous = previous;
    this.touched = touched;
    this.config = config;
  }

  /** A root, an item or a quote on `[start, end)`, from its old node where one is known. */
  container(kind: 'root' | 'item' | 'quote', block: MdBlock, start: number, end: number, old: Located | null): OutlineNodePersistent {
    if (old && old.node.block === block && this.untouched(old.node, start, end)) return this.reuse(old.node);
    let head: MdBlock | null = null;
    if (kind === 'item') head = itemHead(block, this.tree.flavor, this.config.quotes, () => this.contentOf(start));
    else if (kind === 'quote') head = quoteHead(block, () => this.contentOf(start + block.offsets[0]!));
    // the same stored block holds the same blocks, grouped the same: only the nodes on touched lines change
    // (but a quote that is of another kind now, read anew)
    const copied = old && old.node.block === block && old.node.head === head ? this.copy(old, start, end) : null;
    if (copied) return copied;
    const entries: Entry[] = [];
    for (let k = head ? 1 : 0; k < block.children.length; k++) {
      const child = block.children[k]!;
      const at = start + block.offsets[k]!;
      if (child.type === 'list') {
        for (let j = 0; j < child.children.length; j++) entries.push({ block: child.children[j]!, kind: 'item', start: at + child.offsets[j]!, level: 0 });
        continue;
      }
      const childKind = nodeKindOf(child, this.config.quotes, () => this.contentOf(at));
      if (childKind) entries.push({ block: child, kind: childKind, start: at, level: child.type === 'heading' ? child.attrs.level! : 0 });
    }
    const candidates = old ? this.candidates(old) : null;
    const { nodes, starts } = this.nodes(outlineChildren(entries, kind === 'root', this.config), end, candidates);
    return this.make(kind, block, head, start, end, nodes, starts);
  }

  /** Nodes for `shells`, which tile `[their first start, end)`. */
  private nodes(shells: readonly Shell[], end: number, candidates: Candidates | null): { nodes: OutlineNodePersistent[]; starts: number[] } {
    const nodes = new Array<OutlineNodePersistent>(shells.length);
    const starts = new Array<number>(shells.length);
    for (let i = 0; i < shells.length; i++) {
      const s = shells[i]!;
      const next = i + 1 < shells.length ? shells[i + 1]!.entry.start : end;
      starts[i] = s.entry.start;
      nodes[i] = this.node(s, next, candidates);
    }
    return { nodes, starts };
  }

  private node(shell: Shell, end: number, candidates: Candidates | null): OutlineNodePersistent {
    const { block, kind, start } = shell.entry;
    const old = candidates?.find(block, kind, start) ?? null;
    if (kind === 'item' || kind === 'quote') return this.container(kind, block, start, end, old);
    if (old && sameBlocks(old.node, shell) && this.untouched(old.node, start, end)) return this.reuse(old.node);
    const { nodes, starts } = this.nodes(shell.children, end, candidates);
    // (a quote read as a paragraph: its text the paragraph in it, the blank lines after that its gap)
    return this.make(kind, block, kind === 'paragraph' && block.type === 'blockquote' ? block.children[0]! : block, start, end, nodes, starts);
  }

  /**
   * `old`, now on `[start, end)`, read from the same stored block: its children taken whole but those
   * on touched lines, which are copied the same way (a quote's read again: its title is its text's).
   * Null where a quote on a touched line is of another kind now (`quoteKind`: a callout no longer, a
   * paragraph that is one more): its container is read anew.
   */
  private copy(old: Located, start: number, end: number): OutlineNodePersistent | null {
    const { node } = old;
    const n = node.children.length;
    const children = new Array<OutlineNodePersistent>(n);
    const starts = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const child = node.children[i]!;
      const at = (starts[i] = start + node.offsets[i]!);
      const next = i + 1 < n ? start + node.offsets[i + 1]! : end;
      const located = { node: child, start: old.start + node.offsets[i]! };
      if (this.untouched(child, at, next)) children[i] = this.reuse(child);
      else if (child.block!.type === 'blockquote' && nodeKindOf(child.block!, this.config.quotes, () => this.contentOf(at)) !== child.kind) return null;
      else if (child.kind === 'item' || child.kind === 'quote') children[i] = this.container(child.kind, child.block!, at, next, located);
      else {
        const copied = this.copy(located, at, next);
        if (!copied) return null;
        children[i] = copied;
      }
    }
    return this.make(node.kind, node.block!, node.head, start, end, children, starts);
  }

  /** Whether `node`, now on `[start, end)`, has the same extent and no touched line in it or on the line after it. */
  private untouched(node: OutlineNodePersistent, start: number, end: number): boolean {
    return node.lines === end - start && !this.touched.any(start, end);
  }

  private reuse(node: OutlineNodePersistent): OutlineNodePersistent {
    this.reused.add(node);
    return node;
  }

  private make(kind: OutlineNodeKind, block: MdBlock, head: MdBlock | null, start: number, end: number, children: OutlineNodePersistent[], starts: readonly number[]): OutlineNodePersistent {
    const offsets = starts.map((s) => s - start);
    const node = new OutlineNodePersistent(kind, block, head, end - start, offsets, children);
    this.made.add(node);
    return node;
  }

  /** Line `line`'s content past its containers' prefix. */
  private contentOf(line: number): string {
    const l = this.tree.line(line);
    return this.tree.text.slice(l.contentFrom, l.to);
  }

  /** The old nodes a container's blocks were, found by their block, or by kind and where their first line went. */
  private candidates(container: Located): Candidates {
    const byBlock = new Map<MdBlock, Located>();
    const byKey = new Map<string, Located>();
    const visit = (node: OutlineNodePersistent, start: number): void => {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!;
        const at = start + node.offsets[i]!;
        const located = { node: child, start: at };
        byBlock.set(child.block!, located);
        const line = this.mapLine(at);
        if (line >= 0) {
          const key = `${child.kind}@${line}`;
          if (!byKey.has(key)) byKey.set(key, located);
        }
        // a section's and an owned list's nodes are the container's blocks too
        if (child.kind === 'heading' || child.kind === 'paragraph' || child.kind === 'atom') visit(child, at);
      }
    };
    visit(container.node, container.start);
    return {
      find: (block, kind, start) => {
        const found = byBlock.get(block) ?? byKey.get(`${kind}@${start}`);
        return found && found.node.kind === kind ? found : undefined;
      },
    };
  }

  /**
   * Where old line `line` went in the new text, or -1 where the changes deleted it whole. With
   * `writtenOver`, a line a change replaces from its start with text of its own (`abc` typed over
   * with `xyz`) is the same line, written over: it went where that text starts.
   */
  private mapLine(line: number, writtenOver = false): number {
    const { tree, changes } = this.previous!;
    const from = tree.starts[line]!;
    const to = tree.ends[line]!;
    const over = changes.find((c) => c.from < c.to && c.from <= from && c.to >= to);
    if (over) return writtenOver && over.from === from && over.insert ? lineIndexAt(this.tree.starts, mapPos(changes, from, -1)) : -1;
    return lineIndexAt(this.tree.starts, mapPos(changes, from, 1));
  }

  /**
   * Gives the nodes made anew their ids and returns the lineage's next one. Read whole, nodes are
   * numbered in document order, the root 0. After an update, a node keeps the id `identity` gives it
   * (by where it starts), or else the id of an old node, not taken whole, whose first line went to
   * its first line, of its kind (the same one of them, where nested items share a line), a line
   * written over from its start included; else a new one.
   */
  assignIds(root: OutlineNodePersistent, identity: ReadonlyMap<number, number> | undefined): number {
    const made: Located[] = [];
    const walk = (node: OutlineNodePersistent, start: number): void => {
      if (!this.made.has(node)) return;
      made.push({ node, start });
      for (let i = 0; i < node.children.length; i++) walk(node.children[i]!, start + node.offsets[i]!);
    };
    walk(root, 0);
    const set = (node: OutlineNodePersistent, id: number): void => {
      (node as { id: number }).id = id;
    };
    if (!this.previous) {
      made.forEach(({ node }, i) => set(node, i));
      return made.length;
    }
    let nextId = this.previous.nextId;
    if (!made.length) return nextId;
    // the old nodes not taken whole, their ids by the key they have in the new lines
    const claimed = new Set(identity?.values());
    const carried = new Map<string, number>();
    const oldRanks = new Map<string, number>();
    const visit = (node: OutlineNodePersistent, start: number): void => {
      if (this.reused.has(node)) return;
      if (node.kind !== 'root') {
        const line = this.mapLine(start, true);
        // a node `identity` names keeps its rank among those nested on its line, but carries nothing
        if (line >= 0) {
          const key = ranked(oldRanks, `${node.kind}@${line}`);
          if (!claimed.has(node.id) && !carried.has(key)) carried.set(key, node.id);
        }
      }
      for (let i = 0; i < node.children.length; i++) visit(node.children[i]!, start + node.offsets[i]!);
    };
    visit(this.previous.root, 0);
    // an id `identity` gives may be one a node taken whole still has: that node keeps it
    const kept = identity?.size ? this.reusedIds() : null;
    const used = new Set<number>([0]);
    const ranks = new Map<string, number>();
    for (const { node, start } of made) {
      if (node.kind === 'root') {
        set(node, 0);
        continue;
      }
      const explicit = identity?.size ? identity.get(this.headStartOffset(node, start)) : undefined;
      const key = ranked(ranks, `${node.kind}@${start}`);
      let id = explicit !== undefined && !kept!.has(explicit) ? explicit : carried.get(key);
      if (id === undefined || used.has(id)) id = nextId++;
      used.add(id);
      set(node, id);
    }
    return nextId;
  }

  /** The ids of every node taken whole. */
  private reusedIds(): Set<number> {
    const ids = new Set<number>();
    const visit = (node: OutlineNodePersistent): void => {
      ids.add(node.id);
      node.children.forEach(visit);
    };
    this.reused.forEach(visit);
    return ids;
  }

  /** Where a node starts in the text, as `identity` names it: an item's marker, a quote's `>` (a block's own prefix), else its first line's content. */
  private headStartOffset(node: OutlineNodePersistent, start: number): number {
    const { tree } = this;
    if (start >= tree.lineCount) return 0;
    if (node.kind === 'item') return tree.starts[start]! + node.block!.attrs.markerStart!;
    const line = tree.line(start);
    // a quote at its `>`, any other block with a prefix of its own (a footnote's label) at it
    const block = node.block;
    return (block && line.prefix.find((piece) => piece.container.block === block)?.from) ?? line.contentFrom;
  }
}

interface Candidates {
  find(block: MdBlock, kind: OutlineNodeKind, start: number): Located | undefined;
}

/** Whether old `node` was read from the same blocks as `shell`, its section's or owned lists' included. */
function sameBlocks(node: OutlineNodePersistent, shell: Shell): boolean {
  if (node.block !== shell.entry.block || node.kind !== shell.entry.kind) return false;
  if (node.kind === 'item' || node.kind === 'quote') return true;
  if (node.children.length !== shell.children.length) return false;
  for (let i = 0; i < node.children.length; i++) if (!sameBlocks(node.children[i]!, shell.children[i]!)) return false;
  return true;
}

/** `key` numbered by how many times it was seen before: `item@3#0`, then `item@3#1` for an item nested on the same line. */
function ranked(seen: Map<string, number>, key: string): string {
  const rank = seen.get(key) ?? 0;
  seen.set(key, rank + 1);
  return `${key}#${rank}`;
}

/**
 * The lines where `identity` gives a node another id than where its old node went: an id named
 * somewhere else than its old node's first line went to, both lines. An entry that agrees with
 * where the old node went changes nothing (a writer names every node it placed, most where they were).
 */
function identityLines(tree: MdTree, previous: OutlinePrevious, identity: ReadonlyMap<number, number>): [number, number][] {
  const { changes } = previous;
  /** Where in the new text the old node with `id`'s first line went, or -1 where it was deleted, or undefined for no such node. */
  const wentTo = (id: number): number | undefined => {
    const start = previous.startOf(id);
    if (start === undefined) return undefined;
    const from = previous.tree.starts[start];
    const to = previous.tree.ends[start];
    if (from === undefined || changes.some((c) => c.from < c.to && c.from <= from && c.to >= to!)) return -1;
    return mapPos(changes, from, 1);
  };
  const lines: [number, number][] = [];
  for (const [at, id] of identity) {
    const line = lineIndexAt(tree.starts, at);
    const old = wentTo(id);
    // on the line the entry names: it agrees
    if (old !== undefined && old >= tree.starts[line]! && old <= tree.ends[line]!) continue;
    lines.push([line, line]);
    if (old !== undefined && old >= 0) lines.push([lineIndexAt(tree.starts, old), lineIndexAt(tree.starts, old)]);
  }
  return lines;
}
