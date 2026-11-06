// Block ids as a snapshot reads them: every block id written in the
// text, the node it is written on (its owner), what its flavor names by it (its link target), whether
// another one for the same target is the one that counts (shadowed), and, for one whose target is no
// node it is written on (stray), why. Obsidian's reading, the one flavor with block ids so far. And
// what a command declares about them (moved, merged).

import type { OurusDoc } from './doc.ts';
import { pushAll } from '../text/index.ts';
import type { OurusNode } from './node.ts';
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
  if (!doc.mdTree.flavor.has('blockIds')) return [];
  const found: Omit<BlockId, 'shadowed'>[] = [];
  const strays = new Map<OurusNode, Reading>();
  // (every node, by a stack: a note nested 10,000 deep is past the call stack's recursion)
  const stack: OurusNode[] = [doc.rootNode];
  for (let node = stack.pop(); node; node = stack.pop()) {
    if (node.kind !== 'root') pushAll(found, ofNode(doc, node, strays));
    for (let k = node.persistentNode.children.length - 1; k >= 0; k--) stack.push(node.child(k));
  }
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
  return found.map((b, i) => ({ ...b, shadowed: shadowed.has(i) }));
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
  let line: number = node.textLastLine;
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

// -------------------------------------------------------------------- declarations

/**
 * What a command declared about block ids: `moved`, written on another node on purpose (a merge's
 * node that stays taking the other's, workflowy's split giving the heading's to the node it makes);
 * `merged`, dropped for another (a join of two nodes that both have one).
 */
export interface BlockIdDeclarations {
  readonly moved: readonly { readonly name: string; readonly to: number }[];
  readonly merged: readonly { readonly from: string; readonly into: string }[];
}
