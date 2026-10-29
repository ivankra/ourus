// The outline tree read from the parse: nodes stored with positions relative to their parent, as the
// parser's blocks are (`PersistentNode`), so snapshots share every node an edit didn't reach. After an
// update, the build reads the containers on the path to the changed lines again and takes every other
// node whole from the old tree; ids are carried to the nodes made anew.

import { OurusConfig } from '../config.ts';
import type { MdBlock, MdTree } from '../parser/index.ts';
import { ChangeIndex, lineIndexAt, type ChangeSpec } from '../text/index.ts';
import { itemHead, nodeKindOf, outlineChildren, quoteHead, type OurusNodeKind, type OutlineChild } from './rules.ts';
import { Lineage } from './doc.ts';
import { PersistentNode } from './node.ts';

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
  readonly root: PersistentNode;
  /** Sorted, in the old text's offsets. */
  readonly changes: readonly ChangeSpec[];
  /** The first line of the old node with id `id`, in the old text, or undefined (`OurusDoc.node`'s index, made once per snapshot). */
  readonly startOf: (id: number) => number | undefined;
  /** The old outline was read under other settings for what owns what (`listParent`, `quotes`): no grouping of it is copied. */
  readonly regroup?: boolean;
}

/**
 * The outline of `tree`: read whole, or from `previous`, taking whole every old node `touched`
 * doesn't reach. New ids are `lineage`'s.
 */
export function readOutline(
  tree: MdTree,
  lineage: Lineage,
  previous: OutlinePrevious | null,
  touched: Touched,
  identity?: ReadonlyMap<number, number>,
  config: ReadConfig = OurusConfig.defaults,
): PersistentNode {
  const build = new Build(tree, previous, previous && identity?.size ? touched.with(identityLines(tree, previous, identity)) : touched, config);
  const root = build.container('root', tree.root, 0, tree.lineCount, previous ? { node: previous.root, start: 0 } : null);
  build.assignIds(root, identity, lineage);
  return root;
}

/** What reading the outline asks of the config. */
export type ReadConfig = Pick<OurusConfig, 'quotes' | 'listParent'>;

/** An old node and its first line in the old text. */
interface Located {
  readonly node: PersistentNode;
  readonly start: number;
}

/** A block of a container, as the node it will be: its first line in the new text; a heading's level. */
interface Entry {
  readonly block: MdBlock;
  readonly kind: Exclude<OurusNodeKind, 'root'>;
  readonly start: number;
  readonly level: number;
}

/** A container's nodes as the outline has them (`outlineChildren`: sections, owned lists), before they are made. */
type Shell = OutlineChild<Entry>;

/**
 * A step of the outline's build: it yields the steps whose nodes it needs, one at a time, each given
 * back as its node (null: a copy that couldn't be made), and returns its own.
 */
type Steps = Generator<Steps, PersistentNode | null, PersistentNode | null>;

/** The node `steps` builds, each step it yields run first, on a stack of its own rather than the call stack. */
function run(steps: Steps): PersistentNode {
  const stack: Steps[] = [steps];
  let given: PersistentNode | null = null;
  for (;;) {
    const next = stack[stack.length - 1]!.next(given);
    if (next.done) {
      stack.pop();
      if (!stack.length) return next.value!;
      given = next.value;
    } else {
      stack.push(next.value);
      given = null;
    }
  }
}

class Build {
  readonly tree: MdTree;
  readonly previous: OutlinePrevious | null;
  readonly touched: Touched;
  /** What a quote is and what a list after a block is the children of. */
  readonly config: ReadConfig;
  /** Old nodes taken whole. */
  readonly reused = new Set<PersistentNode>();
  /** Nodes made anew, their ids still to give. */
  readonly made = new Set<PersistentNode>();

  constructor(tree: MdTree, previous: OutlinePrevious | null, touched: Touched, config: ReadConfig) {
    this.tree = tree;
    this.previous = previous;
    this.touched = touched;
    this.config = config;
  }

  /**
   * A root, an item or a quote on `[start, end)`, from its old node where one is known. Built without
   * recursion (`run`): a document nests as deep as its lines go, past the call stack.
   */
  container(kind: 'root' | 'item' | 'quote', block: MdBlock, start: number, end: number, old: Located | null): PersistentNode {
    return run(this.containerOf(kind, block, start, end, old));
  }

  /** `container`'s steps: each node under it, built as a step `run` takes in turn. */
  private *containerOf(kind: 'root' | 'item' | 'quote', block: MdBlock, start: number, end: number, old: Located | null): Steps {
    if (old && old.node.block === block && this.untouched(old.node, start, end)) return this.reuse(old.node);
    let head: MdBlock | null = null;
    if (kind === 'item') head = itemHead(block, this.tree.flavor, this.config.quotes, () => this.contentOf(start));
    else if (kind === 'quote') head = quoteHead(block, () => this.contentOf(start + block.offsets[0]!));
    // the same stored block holds the same blocks, grouped the same: only the nodes on touched lines change
    // (but a quote that is of another kind now, read anew)
    // (and not where the old one was grouped under other settings: `listParent`, `quotes`)
    const copied = old && !this.previous?.regroup && old.node.block === block && old.node.head === head ? yield this.copy(old, start, end) : null;
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
    const { nodes, starts } = yield* this.nodes(outlineChildren(entries, kind === 'root', this.config), end, candidates);
    return this.make(kind, block, head, start, end, nodes, starts);
  }

  /** Nodes for `shells`, which tile `[their first start, end)`. */
  private *nodes(shells: readonly Shell[], end: number, candidates: Candidates | null): Generator<Steps, { nodes: PersistentNode[]; starts: number[] }, PersistentNode | null> {
    const nodes = new Array<PersistentNode>(shells.length);
    const starts = new Array<number>(shells.length);
    for (let i = 0; i < shells.length; i++) {
      const s = shells[i]!;
      const next = i + 1 < shells.length ? shells[i + 1]!.entry.start : end;
      starts[i] = s.entry.start;
      nodes[i] = (yield this.node(s, next, candidates))!;
    }
    return { nodes, starts };
  }

  private *node(shell: Shell, end: number, candidates: Candidates | null): Steps {
    const { block, kind, start } = shell.entry;
    const old = candidates?.find(block, kind, start) ?? null;
    if (kind === 'item' || kind === 'quote') return yield this.containerOf(kind, block, start, end, old);
    if (old && sameBlocks(old.node, shell) && this.untouched(old.node, start, end)) return this.reuse(old.node);
    const { nodes, starts } = yield* this.nodes(shell.children, end, candidates);
    // (a quote read as a paragraph: its text the paragraph in it, the blank lines after that its gap)
    return this.make(kind, block, kind === 'paragraph' && block.type === 'blockquote' ? block.children[0]! : block, start, end, nodes, starts);
  }

  /**
   * `old`, now on `[start, end)`, read from the same stored block: its children taken whole but those
   * on touched lines, which are copied the same way (a quote's read again: its title is its text's).
   * Null where a quote on a touched line is of another kind now (`quoteKind`: a callout no longer, a
   * paragraph that is one more): its container is read anew.
   */
  private *copy(old: Located, start: number, end: number): Steps {
    const { node } = old;
    const n = node.children.length;
    const children = new Array<PersistentNode>(n);
    const starts = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const child = node.children[i]!;
      const at = (starts[i] = start + node.offsets[i]!);
      const next = i + 1 < n ? start + node.offsets[i + 1]! : end;
      const located = { node: child, start: old.start + node.offsets[i]! };
      if (this.untouched(child, at, next)) children[i] = this.reuse(child);
      else if (child.block!.type === 'blockquote' && nodeKindOf(child.block!, this.config.quotes, () => this.contentOf(at)) !== child.kind) return null;
      else if (child.kind === 'item' || child.kind === 'quote') children[i] = (yield this.containerOf(child.kind, child.block!, at, next, located))!;
      else {
        const copied = yield this.copy(located, at, next);
        if (!copied) return null;
        children[i] = copied;
      }
    }
    return this.make(node.kind, node.block!, node.head, start, end, children, starts);
  }

  /** Whether `node`, now on `[start, end)`, has the same extent and no touched line in it or on the line after it. */
  private untouched(node: PersistentNode, start: number, end: number): boolean {
    return node.lines === end - start && !this.touched.any(start, end);
  }

  private reuse(node: PersistentNode): PersistentNode {
    this.reused.add(node);
    return node;
  }

  private make(kind: OurusNodeKind, block: MdBlock, head: MdBlock | null, start: number, end: number, children: PersistentNode[], starts: readonly number[]): PersistentNode {
    const offsets = starts.map((s) => s - start);
    const node = new PersistentNode(kind, block, head, end - start, offsets, children);
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
    const visit = (node: PersistentNode, start: number): void => {
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
    // (indexed once: an update of many changes maps every line)
    const index = (this.changeIndex ??= new ChangeIndex(changes));
    const from = tree.starts[line]!;
    const to = tree.ends[line]!;
    const over = index.covering(from, to);
    if (over) return writtenOver && over.from === from && over.insert ? lineIndexAt(this.tree.starts, index.mapPos(from, -1)) : -1;
    return lineIndexAt(this.tree.starts, index.mapPos(from, 1));
  }

  /** The previous snapshot's changes, indexed for `mapLine`. */
  private changeIndex: ChangeIndex | undefined;

  /**
   * Gives the nodes made anew their ids, new ones from `lineage`. Read whole, nodes are numbered in
   * document order, the root `Lineage.ROOT`. After an update, a node keeps the id `identity`
   * gives it (by where it starts), or else the id of an old node, not taken whole, whose first line went to
   * its first line, of its kind (the same one of them, where nested items share a line), a line
   * written over from its start included; else a new one.
   */
  assignIds(root: PersistentNode, identity: ReadonlyMap<number, number> | undefined, lineage: Lineage): void {
    const made: Located[] = [];
    const walk = (node: PersistentNode, start: number): void => {
      if (!this.made.has(node)) return;
      made.push({ node, start });
      for (let i = 0; i < node.children.length; i++) walk(node.children[i]!, start + node.offsets[i]!);
    };
    walk(root, 0);
    const set = (node: PersistentNode, id: number): void => {
      (node as { id: number }).id = id;
    };
    if (!this.previous) {
      for (const { node } of made) set(node, node.kind === 'root' ? Lineage.ROOT : lineage.take());
      return;
    }
    if (!made.length) return;
    // the old nodes not taken whole, their ids by the key they have in the new lines
    const claimed = new Set(identity?.values());
    const carried = new Map<string, number>();
    const oldRanks = new Map<string, number>();
    const visit = (node: PersistentNode, start: number): void => {
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
    const used = new Set<number>([Lineage.ROOT]);
    const ranks = new Map<string, number>();
    for (const { node, start } of made) {
      if (node.kind === 'root') {
        set(node, Lineage.ROOT);
        continue;
      }
      const explicit = identity?.size ? identity.get(this.headStartOffset(node, start)) : undefined;
      const key = ranked(ranks, `${node.kind}@${start}`);
      let id = explicit !== undefined && !kept!.has(explicit) ? explicit : carried.get(key);
      if (id === undefined || used.has(id)) id = lineage.take();
      used.add(id);
      set(node, id);
    }
  }

  /** The ids of every node taken whole. */
  private reusedIds(): Set<number> {
    const ids = new Set<number>();
    const visit = (node: PersistentNode): void => {
      ids.add(node.id);
      node.children.forEach(visit);
    };
    this.reused.forEach(visit);
    return ids;
  }

  /** Where a node starts in the text, as `identity` names it: an item's marker, a quote's `>` (a block's own prefix), else its first line's content. */
  private headStartOffset(node: PersistentNode, start: number): number {
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
  find(block: MdBlock, kind: OurusNodeKind, start: number): Located | undefined;
}

/** Whether old `node` was read from the same blocks as `shell`, its section's or owned lists' included. */
function sameBlocks(node: PersistentNode, shell: Shell): boolean {
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
  const index = new ChangeIndex(previous.changes);
  /** Where in the new text the old node with `id`'s first line went, or -1 where it was deleted, or undefined for no such node. */
  const wentTo = (id: number): number | undefined => {
    const start = previous.startOf(id);
    if (start === undefined) return undefined;
    const from = previous.tree.starts[start];
    const to = previous.tree.ends[start];
    if (from === undefined || index.covering(from, to!)) return -1;
    return index.mapPos(from, 1);
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
