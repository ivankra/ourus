// Block ids as a snapshot reads them: every block id written in the
// text, the node it is written on (its owner), what its flavor names by it (its link target), whether
// another one for the same target is the one that counts (shadowed), and, for one whose target is no
// node it is written on (stray), why. Obsidian's reading, the one flavor with block ids so far. And the
// rule a command keeps: no block id loses what it names, but as the command declares.

import type { OurusDoc } from './doc.ts';
import type { OurusNode } from './node.ts';
import { lineIndexAt, type ChangeSpec } from '../text/index.ts';
import { BLOCK_ID_NAME, OurusProse, blockIdsOf } from './text.ts';

/** What a block id names: a node, a whole list (by its first item), or nothing. */
export type BlockIdTarget = OurusNode | { readonly list: OurusNode } | null;

/** Why what a block id names is no node it is written on (`BlockId.stray`). */
export type BlockIdStray = 'whole-list' | 'item' | 'quote' | 'nothing-above' | 'block-below' | 'trailing-space';

export interface BlockId {
  /** Without its `^`. */
  readonly name: string;
  /** Document offsets of the block id as written, `^` through its name's last character. */
  readonly from: number;
  readonly to: number;
  /**
   * Document offsets of all of it: ` ^id` with the blank before it; on a line of its own, from the
   * end of the line before (its line break, and the blank lines before it where carried).
   */
  readonly partFrom: number;
  readonly partTo: number;
  /** On a line of its own: carried, a paragraph of its own, or a text's last line (`Lead.` / `^id1`). */
  readonly ownLine: boolean;
  /** Carried by its owner's text, outside its string (`OurusText.blockIdLines`). */
  readonly carried: boolean;
  /** How the flavor writes it: Obsidian's `caret`. */
  readonly syntax: 'caret';
  /** The node it is written on. */
  readonly owner: OurusNode;
  readonly target: BlockIdTarget;
  /** Another block id for the same target is the one the flavor counts: a link to this one finds nothing. */
  readonly shadowed: boolean;
  /** Derived from a heading's text, not written: none in Obsidian. */
  readonly implicit: false;
  /**
   * Why what it names is no node it is written on; null where it is. After a list, Obsidian
   * names the list; after a block inside an item, or on a line under one, the item; after a quote of
   * several blocks, which carries no line, the quote; else nothing (`target` null): nothing above
   * it, a block right under it, blanks after it (no block id to Obsidian, which ourus's parser reads
   * as one).
   */
  readonly stray: BlockIdStray | null;
}

/** A paragraph that is a block id and nothing else, blanks after it or none. */
const reLoneBlockId = new RegExp(`^\\^(${BLOCK_ID_NAME})([ \\t]*)$`);

/** Every block id in `doc`, in document order (`OurusDoc.blockIds`). */
export function readBlockIds(doc: OurusDoc): BlockId[] {
  return readIn(doc, null).ids;
}

/**
 * The block ids of the nodes whose extents meet lines `[from, to]` (all of them, with no range), and
 * those nodes' ids. A range the check reads is one `regionOf` widened, so that every block id for a
 * target inside is inside too, and shadowing is read whole.
 */
function readIn(doc: OurusDoc, range: readonly [number, number] | null): { ids: BlockId[]; nodes: Set<number> } {
  const nodes = new Set<number>();
  if (!doc.mdTree.flavor.has('blockIds')) return { ids: [], nodes };
  const found: Omit<BlockId, 'shadowed'>[] = [];
  const strays = new Map<OurusNode, Reading>();
  const visit = (node: OurusNode): void => {
    if (node.kind !== 'root') {
      nodes.add(node.id);
      found.push(...ofNode(doc, node, strays));
    }
    const { offsets, children } = node.persistentNode;
    // (the children meeting the range: from the last starting at or before its first line)
    const first = range ? Math.max(0, lastAtOrBefore(offsets, range[0] - node.startLine)) : 0;
    for (let k = first; k < children.length; k++) {
      const child = node.child(k);
      if (range && child.startLine > range[1]) break;
      if (range && child.startLine + child.persistentNode.lines - 1 < range[0]) continue;
      visit(child);
    }
  };
  visit(doc.rootNode);
  found.sort((a, b) => a.from - b.from);
  // per target, the one the flavor counts: inside an item the first, else the last
  const groups = new Map<string, number[]>();
  found.forEach((b, i) => {
    const key = blockIdTargetKey(b.target);
    if (key !== null) (groups.get(key) ?? groups.set(key, []).get(key)!).push(i);
  });
  const shadowed = new Set<number>();
  for (const group of groups.values()) {
    const target = found[group[0]!]!.target!;
    const counts = 'list' in target || target.kind !== 'item' ? group[group.length - 1]! : group[0]!;
    for (const i of group) if (i !== counts) shadowed.add(i);
  }
  return { ids: found.map((b, i) => ({ ...b, shadowed: shadowed.has(i) })), nodes };
}

/** The last index of sorted `offsets` at or before `at`; -1 where none is. */
function lastAtOrBefore(offsets: readonly number[], at: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid]! <= at) lo = mid + 1;
    else hi = mid - 1;
  }
  return hi;
}

/** A target as a key: a node's id, a list's by its first item's; null for nothing. */
function blockIdTargetKey(target: BlockIdTarget): string | null {
  if (!target) return null;
  return 'list' in target ? `list:${target.list.id}` : `${target.id}`;
}

/**
 * What a block id written on `node` names, in Obsidian: inside a list item, the item (the nearest);
 * inside a quote, the quote where the block id ends it (the outermost: a quote is one block to
 * Obsidian), else nothing; else the node itself.
 */
export function blockIdTargetOf(node: OurusNode): OurusNode | null {
  for (let up: OurusNode | null = node; up && up.kind !== 'root'; up = up.parent) if (up.kind === 'item') return up;
  let quote: OurusNode | null = null;
  for (let up = node.parent; up && up.kind !== 'root'; up = up.parent) if (up.kind === 'quote') quote = up;
  if (quote) return quote.lastDescendant === node ? quote : null;
  return node;
}

/** What Obsidian reads a block-id paragraph that didn't attach as: why it is stray, and what it names. */
interface Reading {
  readonly stray: BlockIdStray;
  readonly target: BlockIdTarget;
}

/** The block ids written on `node`: ending its string (a stray paragraph that is only one too), and on the lines its text carries. */
function ofNode(doc: OurusDoc, node: OurusNode, strays: Map<OurusNode, Reading>): Omit<BlockId, 'shadowed'>[] {
  const text = doc.textOf(node);
  if (!text) return [];
  const out: Omit<BlockId, 'shadowed'>[] = [];
  const base = { syntax: 'caret', owner: node, implicit: false } as const;
  // a paragraph of nothing but a block id is one that didn't attach (one with text under it is one
  // paragraph, and no block id to Obsidian)
  const lone = node.kind === 'paragraph' && text instanceof OurusProse && text.type === 'paragraph' ? reLoneBlockId.exec(text.text) : null;
  if (lone) {
    const reading = strayReading(doc, node, lone[2]!.length > 0, strays);
    strays.set(node, reading);
    const from = doc.posOf(node, 0);
    out.push({ ...base, name: lone[1]!, from, to: from + 1 + lone[1]!.length, partFrom: node.startLine > 0 ? doc.mdTree.line(node.startLine - 1).to : from, partTo: doc.posOf(node, text.text.length), ownLine: true, carried: false, ...reading });
    return out;
  }
  let line = node.textLastLine;
  for (const b of blockIdsOf(text)) {
    if (!b.carried) {
      const ownLine = text.text[b.partFrom] === '\n';
      // (in a quote read as an atom, one ending a paragraph before its last names nothing, as in a
      // quote that is a container: a quote is one block to Obsidian)
      const target = text instanceof OurusProse || b.partTo === text.text.length ? blockIdTargetOf(node) : null;
      // (on a line of its own under a block inside an item, which it looks written for: it names the item)
      const stray = ownLine && target && target !== node && target.kind === 'item' ? 'item' : null;
      out.push({ ...base, name: b.name, from: doc.posOf(node, b.from), to: doc.posOf(node, b.to), partFrom: doc.posOf(node, b.partFrom, -1), partTo: doc.posOf(node, b.partTo), ownLine, carried: false, target, stray });
      continue;
    }
    // a carried line, after its blank lines
    const before = doc.mdTree.line(line);
    const carried = text.blockIdLines[b.k]!;
    line += carried.blankLines + 1;
    const at = doc.mdTree.line(line);
    const from = at.to - carried.line.length;
    out.push({ ...base, name: b.name, from, to: from + 1 + b.name.length, partFrom: before.to, partTo: at.to, ownLine: true, carried: true, target: blockIdTargetOf(node), stray: null });
  }
  return out;
}

/** What Obsidian reads a block-id paragraph that didn't attach as (`BlockId.stray`), and names by it. */
function strayReading(doc: OurusDoc, node: OurusNode, spaced: boolean, strays: ReadonlyMap<OurusNode, Reading>): Reading {
  if (spaced) return { stray: 'trailing-space', target: null };
  const tree = doc.mdTree;
  const line = tree.line(node.startLine);
  // inside a list item: the item, whatever follows
  if (line.containers.some((c) => c.block.type === 'item')) {
    let item = node.parent;
    while (item && item.kind !== 'item') item = item.parent;
    return { stray: 'item', target: item };
  }
  const container = line.container;
  const k = container.block.children.indexOf(node.block);
  const prev = k > 0 ? container.child(k - 1) : null;
  if (!prev || prev.block.type === 'frontmatter') return { stray: 'nothing-above', target: null };
  // (a line under it in its container, or opening another there, `>`)
  const below = node.startLine + 1 < tree.lineCount ? tree.line(node.startLine + 1) : null;
  if (below && below.containers.length >= line.containers.length && (!below.empty || below.containers.length > line.containers.length)) return { stray: 'block-below', target: null };
  if (prev.block.type === 'list') {
    const first = doc.nodeAtLine(prev.child(0).line);
    return { stray: 'whole-list', target: first ? { list: first } : null };
  }
  // after another stray one, of a run: what that one names
  const before = doc.nodeAtLine(prev.line);
  const earlier = before && before.block === prev.block && strays.get(before);
  if (earlier) return earlier;
  // after a quote that is a container, which carries no line
  if (prev.block.type === 'blockquote') {
    let quote = before;
    while (quote && quote.kind !== 'quote') quote = quote.parent;
    if (quote) return { stray: 'quote', target: quote };
  }
  return { stray: 'nothing-above', target: null };
}

// -------------------------------------------------------------------- the rule

/**
 * What a command declared about block ids: `moved`, written on another node on purpose (a merge's
 * node that stays taking the other's, workflowy's split giving the heading's to the node it makes);
 * `merged`, dropped for another (`joinBlockIds: 'merge'`).
 */
export interface BlockIdDeclarations {
  readonly moved: readonly { readonly name: string; readonly to: number }[];
  readonly merged: readonly { readonly from: string; readonly into: string }[];
}

/**
 * What a command may do to block ids, besides keeping them: those it `declared` (moved, merged); one
 * written wholly inside `taken`, the text it took (the user's selection, typed over or cut; the block
 * id `removeBlockId` removes); and one gone with its node where that node is in `removed`, the
 * nodes the command removed on purpose with their subtrees (`removedNodes`: `deleteSubtree`, a cut
 * of nodes); and whatever becomes of the one whose markup (`partFrom` to `partTo`) is `edited`, an
 * edit inside it the user's (`markup: text`, where it is text), but every other kept.
 */
export interface BlockIdAllowances {
  readonly declared?: BlockIdDeclarations;
  readonly taken?: { readonly from: number; readonly to: number } | null;
  readonly removed?: readonly number[];
  readonly edited?: { readonly from: number; readonly to: number } | null;
}

const NOTHING_DECLARED: BlockIdDeclarations = { moved: [], merged: [] };

/** The lines of each snapshot the check reads (`checkedRegion`), the same region in both. */
interface CheckedLines {
  readonly before: readonly [number, number];
  readonly after: readonly [number, number];
}

/**
 * Where `after`, the result of a command's `changes` to `before`, breaks the rule of block ids, or
 * null: every block id of `before` is written on the node it was written on, names what it named,
 * and counts where it counted. Allowed: what `allowed` says (one moved or merged as declared, a
 * claim checked: moved, it names something where it did; merged, the other is written, unshadowed,
 * naming something where it did; one inside the text the command took, one gone with a node the command removed); one whose target
 * went while it stays (orphaned); a target that was an enclosing item narrowed to its own owner; a
 * whole list as a target while it follows a list holding one of the items it held; every gain (one
 * that came to name something, or to count), but of a name the note already holds. Reads only
 * where the changes reached (`checkedRegion`), or the whole of both with `whole` (for the tests,
 * which hold the two to agree).
 */
export function checkBlockIds(
  before: OurusDoc,
  after: OurusDoc,
  changes: readonly ChangeSpec[],
  allowed: BlockIdAllowances = {},
  whole = false,
): string | null {
  const { declared = NOTHING_DECLARED, taken = null, removed = [], edited = null } = allowed;
  if (!before.mdTree.flavor.has('blockIds') || !changes.length) return null;
  const regions = whole ? null : checkedRegion(before, after, changes);
  const was = regions ? readIn(before, regions.before).ids : before.blockIds();
  const read = regions ? readIn(after, regions.after) : null;
  const now = read ? read.ids : after.blockIds();
  if (!was.length && !now.length) return null;
  const exists = (id: number): boolean => (read ? read.nodes.has(id) : after.node(id) !== undefined);
  const byName = new Map<string, BlockId[]>();
  for (const b of now) (byName.get(b.name) ?? byName.set(b.name, []).get(b.name)!).push(b);
  // a gain of a name the note holds (outside the region the lines are the same, and so the names)
  const had = new Map<string, number>();
  for (const b of was) had.set(b.name, (had.get(b.name) ?? 0) + 1);
  for (const [name, list] of byName) {
    const n = had.get(name) ?? 0;
    if (list.length > n && (list.length > 1 || (regions && heldOutside(after, name, regions.after)))) return `^${name} would be written twice: a link finds one of them`;
  }
  // each block id paired with one of its name on its owner after (or where it was moved), in order:
  // a name written twice on a node is two
  const paired = new Set<BlockId>();
  const pair = (name: string, owner: number): BlockId | undefined => {
    const a = byName.get(name)?.find((x) => x.owner.id === owner && !paired.has(x));
    if (a) paired.add(a);
    return a;
  };
  // (a node of `before` in a subtree the command removed)
  const roots = new Set(removed);
  const removedNode = (id: number): boolean => {
    for (let n: OurusNode | null | undefined = before.node(id); n; n = n.parent) if (roots.has(n.id)) return true;
    return false;
  };
  for (const b of was) {
    if (edited && b.partFrom === edited.from && b.partTo === edited.to) continue;
    const move = declared.moved.find((m) => m.name === b.name);
    const a = pair(b.name, b.owner.id) ?? (move ? pair(b.name, move.to) : undefined);
    if (!a) {
      // (merged into another as declared: the other written after, unshadowed, naming something
      // where this one did)
      const merge = declared.merged.find((m) => m.from === b.name);
      if (merge) {
        const into = byName.get(merge.into)?.find((x) => !x.shadowed && (x.target || !b.target));
        if (into) continue;
        return `^${b.name} would be merged into ^${merge.into}, which ${byName.has(merge.into) ? 'names nothing it named' : "isn't written"}`;
      }
      // (taken with the text the command took: a paste over it may bring it back elsewhere, a move)
      if (taken && b.from >= taken.from && b.to <= taken.to) continue;
      // (its node gone: a name that node's going left on another, which it named something before,
      // moved where no command said, but one that named nothing comes to name a block so; else gone
      // with it, only where the command removes nodes on purpose)
      if (!move && !exists(b.owner.id)) {
        const elsewhere = byName.get(b.name)?.find((x) => !paired.has(x) && !was.some((w) => w.name === x.name && w.owner.id === x.owner.id));
        if (elsewhere && b.target) return `^${b.name} would be written on node ${elsewhere.owner.id} instead of node ${b.owner.id}`;
        if (elsewhere || removedNode(b.owner.id)) continue;
      }
      return `^${b.name} would be lost from node ${b.owner.id}`;
    }
    if (!b.shadowed && a.shadowed && b.target) return `^${b.name} would be shadowed by another block id for what it names`;
    // (moved as declared: naming something where it did)
    if (move && a.owner.id === move.to) {
      if (b.target && !a.target) return `^${b.name} would be moved to node ${move.to}, where it names nothing`;
      continue;
    }
    const key = blockIdTargetKey(b.target);
    if (key === null || key === blockIdTargetKey(a.target)) continue;
    const t = b.target!;
    // (its target gone, the block id left naming its own node now, or nothing where nodes go on purpose)
    if ('id' in t && !exists(t.id) && (a.target || removedNode(t.id))) continue;
    // (narrowed: from the item around its owner to the owner)
    if ('id' in t && t.id !== b.owner.id && t.kind === 'item' && a.target && 'id' in a.target && a.target.id === a.owner.id) continue;
    if ('list' in t && a.target && 'list' in a.target && overlap(listItems(before, t.list), listItems(after, a.target.list))) continue;
    return `^${b.name} would name ${describe(a.target)} instead of ${describe(b.target)}`;
  }
  return null;
}

/** Whether `doc` has a block id named `name` outside lines `range`: of the lines its text could be on, one that reads as one. */
function heldOutside(doc: OurusDoc, name: string, range: readonly [number, number]): boolean {
  // (anywhere on a line: before a heading's closing `#`s too)
  const re = new RegExp(`\\^${name}`, 'g');
  for (const m of doc.text.matchAll(re)) {
    const line = doc.lineAt(m.index).index;
    if (line >= range[0] && line <= range[1]) continue;
    // (its node's, read where it is: a carried line is its owner's, past the line)
    const owner = doc.nodeAtLine(line);
    if (owner && readIn(doc, [owner.startLine, owner.ownLastLine]).ids.some((b) => b.name === name && doc.lineAt(b.from).index === line)) return true;
  }
  return false;
}

/**
 * The lines the check reads, in `before` and in `after`: where `changes` are, widened (`regionOf`)
 * so that every block id they could reach, and every one naming the same, is inside. One region: up
 * to the first change the lines of both are the same, past the last the same, shifted.
 */
function checkedRegion(before: OurusDoc, after: OurusDoc, changes: readonly ChangeSpec[]): CheckedLines {
  const sorted = [...changes].sort((a, b) => a.from - b.from);
  let delta = 0;
  let [a, b, c, d] = [Infinity, -Infinity, Infinity, -Infinity];
  for (const ch of sorted) {
    const from = ch.from + delta;
    a = Math.min(a, before.lineAt(ch.from).index);
    b = Math.max(b, before.lineAt(ch.to).index);
    c = Math.min(c, lineIndexAt(after.mdTree.starts, from));
    d = Math.max(d, lineIndexAt(after.mdTree.starts, from + ch.insert.length));
    delta += ch.insert.length - (ch.to - ch.from);
  }
  const shift = after.lineCount - before.lineCount;
  // (and down to where the outline after is the nodes it was before: a fence opened or closed reads the
  // lines below it anew, far past the changes)
  for (let line = d + 1; line < after.lineCount; line = d + 1) {
    const now = aroundLine(after, line);
    const was = line - shift < before.lineCount ? aroundLine(before, line - shift) : null;
    if (!now || now.persistentNode === was?.persistentNode) break;
    d = Math.max(line, now.startLine + now.persistentNode.lines - 1);
    b = Math.max(b, d - shift);
  }
  const r1 = regionOf(before, a, b);
  const r2 = regionOf(after, c, d);
  const from = Math.min(r1[0], r2[0]);
  return { before: [from, Math.max(r1[1], r2[1] - shift)], after: [from, Math.max(r2[1], r1[1] + shift)] };
}

/**
 * The lines of `doc` the check reads for a change on lines `[from, to]`: the nodes there, up to the
 * items and quotes around them (a target can be one) and a paragraph or an atom whose list they are,
 * to the end of a list they are in (a stray block id after a list names the list), with the sibling
 * before and the block-id paragraphs on either side (a run of them).
 */
function regionOf(doc: OurusDoc, from: number, to: number): [number, number] {
  const widen = (line: number): OurusNode | null => {
    let node = aroundLine(doc, line);
    let top = node;
    while (node && node.kind !== 'root') {
      // (a heading's section is no container: past it, to the items and quotes it is in)
      if (node.kind === 'item' || node.kind === 'quote' || (top !== node && (node.kind === 'paragraph' || node.kind === 'atom'))) top = node;
      node = node.parent;
    }
    return top;
  };
  const first = widen(from);
  const last = widen(to);
  if (!first || !last) return [0, doc.lineCount - 1];
  let a: OurusNode = first;
  while (a.prev && loneId(doc, a.prev)) a = a.prev;
  if (a.prev) a = a.prev;
  let b: OurusNode = last;
  while (b.kind === 'item' && b.next?.kind === 'item' && doc.listOf(b.next)?.block === doc.listOf(b)?.block) b = b.next;
  while (b.next && loneId(doc, b.next)) b = b.next;
  return [Math.min(a.startLine, from), Math.max(b.startLine + b.persistentNode.lines - 1, to)];
}

/** The deepest node whose extent holds `line` (its text, its children, its blank lines), or null before the first. */
function aroundLine(doc: OurusDoc, line: number): OurusNode | null {
  let node = doc.rootNode;
  for (;;) {
    const k = lastAtOrBefore(node.persistentNode.offsets, line - node.startLine);
    if (k < 0) return node.kind === 'root' ? null : node;
    node = node.child(k);
  }
}

/** Whether `node` is a paragraph of nothing but a block id. */
function loneId(doc: OurusDoc, node: OurusNode): boolean {
  if (node.kind !== 'paragraph') return false;
  const text = doc.textOf(node);
  return text instanceof OurusProse && reLoneBlockId.test(text.text);
}

/** The ids of the items of the list `first` is in. */
function listItems(doc: OurusDoc, first: OurusNode): Set<number> {
  const list = doc.listOf(first)?.block;
  const out = new Set<number>();
  for (const c of first.parent?.children ?? []) if (c.kind === 'item' && doc.listOf(c)?.block === list) out.add(c.id);
  return out;
}

function overlap(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  for (const x of a) if (b.has(x)) return true;
  return false;
}

function describe(target: BlockIdTarget): string {
  if (!target) return 'nothing';
  return 'list' in target ? `the list of node ${target.list.id}` : `node ${target.id}`;
}
