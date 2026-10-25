// The block tree: blocks stored with positions relative to their parent, so the snapshots of a
// document share every block an edit didn't reach.
//
// A stored block (`MdBlock`) holds its type, its attributes, how many lines it has, its span (the
// lines up to the one that ended it: a container's blank lines while it stays open count), and its
// children with each one's first line counted from its own. It holds no parent and no absolute line,
// which change when lines are added above it. After an edit, `buildTree` runs over the records again,
// but where a block starts on a line outside the lines the parse read again, and the old tree has
// that block there, it takes the old one whole and goes on past it: only the blocks around the
// edit are made anew. Where a block is in one tree is an `MdBlockAt`: the block and its first line.

import type { MdFlavor, MdMutableBlock } from './flavor.ts';
import type { MdLeafRole, MdLineRecord } from './machine.ts';
import type { MdAttrs, MdBlock } from './types.ts';

/**
 * What a new parse can take of an old tree: its lines before `from` read as before, and its lines
 * after `to` (the new parse's) as the old ones `delta` lines up.
 */
export interface Reuse {
  readonly old: MdBlock;
  readonly from: number;
  readonly to: number;
  readonly delta: number;
}

/** One step down a tree: a child, where it starts, and its index in its parent. */
interface Step {
  readonly node: MdBlock;
  readonly start: number;
  readonly index: number;
}

/** The containers open on `line`, outermost first (the document excluded), and the leaf holding it. */
function locate(root: MdBlock, line: number): { chain: Step[]; leaf: Step | null } {
  const chain: Step[] = [];
  let node = root;
  let start = 0;
  for (;;) {
    const { offsets } = node;
    // the last child starting at or before the line
    let lo = 0;
    let hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (start + offsets[mid]! <= line) lo = mid;
      else hi = mid - 1;
    }
    if (hi < 0 || start + offsets[lo]! > line) return { chain, leaf: null };
    const child = node.children[lo]!;
    const at = start + offsets[lo]!;
    if (child.kind === 'container' && line < at + child.span) {
      chain.push({ node: child, start: at, index: lo });
      node = child;
      start = at;
      continue;
    }
    return { chain, leaf: child.kind === 'leaf' && line < at + child.lines ? { node: child, start: at, index: lo } : null };
  }
}

// ---------------------------------------------------------------------------- building

/**
 * A block while the tree is built: a `MdMutableBlock`, as leaf builders take it (they add a leaf's
 * parts to its children), with its attributes apart and what storing it needs. Stored, it becomes
 * its own `MdBlock` (`store`): the fields only building reads stay on it, meaning nothing.
 */
interface Building extends MdMutableBlock {
  children: MdMutableBlock[];
  parent: Building | null;
  /** Shared where it can be (a container's from its record, a leaf's from its role): replaced, not changed. */
  attrs: Readonly<Record<string, unknown>>;
  kind: 'container' | 'leaf';
  span: number;
  lines: number;
  offsets: readonly number[];
  /** Its place in the order blocks were made: a block is made after its parent. */
  index: number;
  /** The old block this one stands in for, taken whole. */
  taken: MdBlock | null;
}

/** Until a block gets a child: one frozen empty list, shared (leaf builders check for it). */
const NO_CHILDREN = Object.freeze([]) as unknown as MdMutableBlock[];
const NO_OFFSETS: readonly number[] = Object.freeze([]);

const NO_ATTRIBUTES: Readonly<Record<string, unknown>> = Object.freeze({});

const roleAttributes = new WeakMap<MdLeafRole, Readonly<Record<string, unknown>>>();

/**
 * A leaf's attributes, from the role of its first line: shared by every leaf made from that role
 * object (most lines share theirs), so frozen.
 */
function leafAttributes(role: MdLeafRole): Readonly<Record<string, unknown>> {
  let attrs = roleAttributes.get(role);
  if (!attrs) {
    const own: Record<string, unknown> = {};
    // `part`: what the line is within its leaf (a table row), for the leaf's builder; `blank`: a
    // whitespace line of indented code
    for (const key of Object.keys(role)) if (key !== 'type' && key !== 'first' && key !== 'part' && key !== 'blank') own[key] = role[key];
    roleAttributes.set(role, (attrs = Object.freeze(own)));
  }
  return attrs;
}

/** A part's fields that aren't attributes. */
const OWN = new Set(['type', 'startLine', 'endLine', 'children', 'parent']);

/**
 * The block tree from the records (and nothing else: so equal records make an equal tree), taking
 * from `reuse`'s old tree every block it holds the same.
 */
export function buildTree(records: readonly MdLineRecord[], flavor: MdFlavor, reuse: Reuse | null): MdBlock {
  const n = records.length;
  /** Every block made, in order. */
  const made: Building[] = [];
  const makeBlock = (type: string, line: number, parent: Building | null, kind: 'container' | 'leaf'): Building => {
    const b: Building = { type, startLine: line, endLine: line, children: NO_CHILDREN, parent, attrs: NO_ATTRIBUTES, kind, span: 1, lines: 1, offsets: NO_OFFSETS, index: made.length, taken: null };
    made.push(b);
    if (parent) {
      if (parent.children === NO_CHILDREN) parent.children = [b];
      else parent.children.push(b);
    }
    return b;
  };
  const root = makeBlock('document', 0, null, 'container');
  const chain: Building[] = [];
  let leaf: Building | null = null;
  let leafType = '';
  /** Containers made here, in the order they opened. */
  const containers: Building[] = [];
  /** Indented code blocks and their last line that isn't only whitespace. */
  const indentedCode = new Map<Building, number>();

  const endLeaf = (i: number): void => {
    if (leaf) leaf.span = i - leaf.startLine;
    leaf = null;
  };

  /** The old block of `type` starting on line `i` with `depth` containers around it, if the new parse reads it the same. */
  const old = (i: number, depth: number, type: string, kind: 'container' | 'leaf'): MdBlock | null => {
    if (!reuse) return null;
    const before = i < reuse.from;
    if (!before && i <= reuse.to) return null;
    const o = before ? i : i - reuse.delta;
    const { chain: path, leaf: at } = locate(reuse.old, o);
    const step = kind === 'container' ? path[depth] : path.length === depth ? at : null;
    if (!step || step.start !== o || step.node.type !== type) return null;
    // before the lines read again, the line that ended it must be too
    return before && o + step.node.span >= reuse.from ? null : step.node;
  };

  const take = (node: MdBlock, i: number, parent: Building): void => {
    const stand = makeBlock(node.type, i, parent, node.kind === 'container' ? 'container' : 'leaf');
    stand.endLine = i + node.lines - 1;
    stand.taken = node;
  };

  let i = 0;
  while (i < n) {
    const rec = records[i]!;
    const keep = rec.depth - rec.opened.length;
    if (chain.length > keep || rec.opened.length) endLeaf(i);
    while (chain.length > keep) {
      const b = chain.pop()!;
      if (b.type === 'blockquote' || b.type === 'footnote_definition') b.endLine = i - 1;
      b.span = i - b.startLine;
    }
    let skip = 0;
    for (const o of rec.opened) {
      const parent = chain[chain.length - 1] ?? root;
      const firstItem = o.type === 'item' && parent.type === 'list' && parent.children === NO_CHILDREN;
      const node = old(i, chain.length, o.type, 'container');
      if (node) {
        take(node, i, parent);
        if (firstItem) parent.attrs = { ...parent.attrs, list: node.attrs.list };
        skip = node.span;
        break;
      }
      const b = makeBlock(o.type, i, parent, 'container');
      // the record's own attributes, which nothing changes
      if (o.attrs) b.attrs = o.attrs;
      if (firstItem) parent.attrs = { ...parent.attrs, list: b.attrs.list };
      chain.push(b);
      containers.push(b);
    }
    if (skip) {
      i += skip;
      continue;
    }
    const container = chain[chain.length - 1] ?? root;
    const role = rec.leaf;
    if (!role) {
      endLeaf(i);
      i++;
      continue;
    }
    if (role.first || !leaf || leafType !== role.type || leaf.parent !== container) {
      endLeaf(i);
      const node = old(i, chain.length, role.type, 'leaf');
      if (node) {
        take(node, i, container);
        i += node.span;
        continue;
      }
      leaf = makeBlock(role.type, i, container, 'leaf');
      leaf.attrs = leafAttributes(role);
      leafType = role.type;
      if (role.type === 'code_block' && role.fenced === false) indentedCode.set(leaf, i);
    } else {
      leaf.endLine = i;
      if (role.closed && !leaf.attrs.closed) leaf.attrs = { ...leaf.attrs, closed: true };
      if (!role.blank && indentedCode.has(leaf)) indentedCode.set(leaf, i);
    }
    flavor.leafBuilders.get(role.type)?.line(leaf!, role, i);
    i++;
  }
  endLeaf(n);
  for (const b of chain) {
    if (b.type === 'blockquote' || b.type === 'footnote_definition') b.endLine = n - 1;
    b.span = n - b.startLine;
  }
  root.endLine = n - 1;
  root.span = n;

  // indented code doesn't end with blank lines
  for (const [b, last] of indentedCode) b.endLine = last;

  // items and footnote definitions end with their last child (the blank lines they go on through
  // are the gap after them), lists with their last item; tightness; innermost first
  for (let k = containers.length - 1; k >= 0; k--) {
    const b = containers[k]!;
    if (b.type === 'item' || b.type === 'footnote_definition') b.endLine = b.children.length ? b.children[b.children.length - 1]!.endLine : b.startLine;
    else if (b.type === 'list') {
      b.endLine = b.children[b.children.length - 1]!.endLine;
      b.attrs = { ...b.attrs, tight: isTight(b) };
    }
  }
  return store(made);
}

/**
 * CommonMark list tightness: no blank line between the items, nor between the blocks of an item.
 * Reference definitions count as the paragraph they were written in.
 */
function isTight(list: Building): boolean {
  const separated = (blocks: readonly { startLine: number; endLine: number }[]): boolean => {
    for (let i = 0; i + 1 < blocks.length; i++) if (blocks[i]!.endLine !== blocks[i + 1]!.startLine - 1) return true;
    return false;
  };
  if (separated(list.children)) return false;
  for (const item of list.children as Building[]) {
    const node = item.taken;
    const blocks = node ? node.children.map((c, k) => ({ startLine: node.offsets[k]!, endLine: node.offsets[k]! + c.lines - 1 })) : item.children;
    if (separated(blocks)) return false;
  }
  return true;
}

/**
 * The blocks made, stored, each after its children (made after it): each becomes its own node, its
 * children list kept, with a stand-in replaced by the old block it took and a part stored.
 */
function store(made: readonly Building[]): MdBlock {
  for (let k = made.length - 1; k >= 0; k--) {
    const b = made[k]!;
    if (b.taken) continue;
    const kids = b.children;
    if (kids.length) {
      const offsets = new Array<number>(kids.length);
      for (let j = 0; j < kids.length; j++) {
        const c = kids[j]!;
        offsets[j] = c.startLine - b.startLine;
        if (made[(c as Building).index] !== c) kids[j] = storePart(c) as unknown as MdMutableBlock;
        else if ((c as Building).taken) kids[j] = (c as Building).taken as unknown as MdMutableBlock;
      }
      b.offsets = offsets;
    }
    b.lines = b.endLine - b.startLine + 1;
    // a stored block has no parent: it may sit in other trees
    b.parent = null;
  }
  return made[0] as unknown as MdBlock;
}

/** A part of a leaf (a table's row, a row's cell), as its leaf's builder made it. */
function storePart(b: MdMutableBlock): MdBlock {
  const attrs: Record<string, unknown> = {};
  for (const key in b) if (!OWN.has(key)) attrs[key] = b[key];
  const lines = b.endLine - b.startLine + 1;
  return { type: b.type, attrs: attrs as MdAttrs, kind: 'part', lines, span: lines, children: b.children.map(storePart), offsets: b.children.map((c) => c.startLine - b.startLine) };
}

// ---------------------------------------------------------------------------- where blocks are

/**
 * A block of one tree with its position: the stored block, which holds no absolute line (so trees can
 * share it), and its first line in this tree. A value, made where it is asked for: two compare by their
 * block.
 */
export class MdBlockAt {
  readonly block: MdBlock;
  readonly line: number;

  constructor(block: MdBlock, line: number) {
    this.block = block;
    this.line = line;
  }

  /** Its last line. */
  get lastLine(): number {
    return this.line + this.block.lines - 1;
  }

  /** Its child `k`, where it is. */
  child(k: number): MdBlockAt {
    return new MdBlockAt(this.block.children[k]!, this.line + this.block.offsets[k]!);
  }

  /** Its children, where they are. */
  children(): MdBlockAt[] {
    const out = new Array<MdBlockAt>(this.block.children.length);
    for (let k = 0; k < out.length; k++) out[k] = this.child(k);
    return out;
  }

  /** It and the blocks in it, in document order; iteratively: nesting can be as deep as the text is long. */
  *preorder(): Generator<MdBlockAt> {
    const stack: MdBlockAt[] = [this];
    while (stack.length) {
      const b = stack.pop()!;
      yield b;
      for (let i = b.block.children.length - 1; i >= 0; i--) stack.push(b.child(i));
    }
  }

  /** The blocks in it, each after everything in it, then it; iteratively. */
  *postorder(): Generator<MdBlockAt> {
    const stack: { at: MdBlockAt; next: number }[] = [{ at: this, next: 0 }];
    while (stack.length) {
      const top = stack[stack.length - 1]!;
      if (top.next < top.at.block.children.length) stack.push({ at: top.at.child(top.next++), next: 0 });
      else {
        stack.pop();
        yield top.at;
      }
    }
  }
}

/** The containers open on `line` (outermost first, the document excluded) and the leaf holding it. */
export function lineBlocks(root: MdBlock, line: number): { containers: MdBlockAt[]; leaf: MdBlockAt | null } {
  const { chain, leaf } = locate(root, line);
  return { containers: chain.map((s) => new MdBlockAt(s.node, s.start)), leaf: leaf && new MdBlockAt(leaf.node, leaf.start) };
}

/** For every line of a tree of `n` lines, what `lineBlocks` gives, in one walk. */
export function allLineBlocks(root: MdBlock, n: number): { containers: (readonly MdBlockAt[])[]; leaves: (MdBlockAt | null)[] } {
  const containers = new Array<readonly MdBlockAt[]>(n);
  const leaves = new Array<MdBlockAt | null>(n).fill(null);
  const stack: { node: MdBlock; start: number; end: number; chain: readonly MdBlockAt[]; k: number; at: number }[] = [{ node: root, start: 0, end: n, chain: [], k: 0, at: 0 }];
  while (stack.length) {
    const f = stack[stack.length - 1]!;
    if (f.k === f.node.children.length) {
      // the container's lines after its last child
      for (let l = f.at; l < f.end; l++) containers[l] = f.chain;
      stack.pop();
      continue;
    }
    const k = f.k++;
    const child = f.node.children[k]!;
    const start = f.start + f.node.offsets[k]!;
    for (let l = f.at; l < start; l++) containers[l] = f.chain;
    const at = new MdBlockAt(child, start);
    if (child.kind === 'container') {
      f.at = start + child.span;
      stack.push({ node: child, start, end: f.at, chain: [...f.chain, at], k: 0, at: start });
    } else {
      f.at = start + child.lines;
      for (let l = start; l < f.at; l++) {
        containers[l] = f.chain;
        leaves[l] = at;
      }
    }
  }
  return { containers, leaves };
}
