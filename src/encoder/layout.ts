// The plan laid out: each node placed where it lands, with its columns and its list marker.

import type { OutlineState, OutlineKind, OutlineNode } from '../outline/index.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree } from './outline-plan.ts';
import type { Block } from '../parser/index.ts';

/** A node as the encoder lays it out, at its place in the plan. */
export interface Placed {
  /** The old node it is, or null for a new one. */
  readonly node: OutlineNode | null;
  /** For a new node keeping an old one's id (converted to another kind), that old node: its seams are its. */
  readonly was: OutlineNode | null;
  readonly edited: OutlinePlanNode | null;
  readonly kind: OutlineKind;
  /** The lines written instead of the old node's: a new node's, or a rewritten one's. */
  readonly lines: readonly string[] | null;
  /** A new node's blank lines after its own lines. */
  readonly gap: number;
  readonly parent: Placed | null;
  readonly children: Placed[];
  prev: Placed | null;
  next: Placed | null;
  /** An old node's column shift, and the pieces that shift: where the whitespace changes, and whose lines move. */
  delta: number;
  base: Block | null;
  owner: Block | null;
  /** An item's columns where it now is. */
  markerColumn: number;
  contentColumn: number;
  /** Its list marker: a new item's, or an old one's when it changes. */
  marker: string | null;
  /** It, or an ancestor, is new or comes from another parent. */
  arrived: boolean;
  /** An old node whose quotes changed (or an ancestor's did): its lines get their prefix rendered anew. */
  readonly rerender: boolean;
  /** Its own lines in the output, and where the content starts on each. */
  readonly output: { index: number; prefix: number }[];
}

/** The plan as placed nodes. */
export function place(doc: OutlineState, tree: PlanTree, parent: Placed | null): Placed | string {
  const edited = OutlinePlan.isPlanned(tree) ? tree : null;
  const node = edited ? (edited.original ?? null) : (tree as OutlineNode);
  if (edited?.level !== undefined && !edited.lines) return 'a heading level change without lines: not written yet';
  if (!node && !edited!.lines) return `a new ${tree.kind} without lines`;
  if (node && edited?.text !== undefined && !edited.lines) return `a rewritten ${tree.kind} without lines`;
  const arrived = !node || (!!parent && (parent.arrived || node.parent !== parent.node));
  // the quotes around it, before and after: a change needs its lines' `>` rewritten
  const oldQuotes: OutlineNode[] = [];
  for (let at = node?.parent ?? null; at; at = at.parent) if (at.kind === 'quote') oldQuotes.push(at);
  const newQuotes: (OutlineNode | Placed)[] = [];
  for (let at = parent; at; at = at.parent) if (at.kind === 'quote') newQuotes.push(at.node ?? at);
  const quotesChanged = oldQuotes.length !== newQuotes.length || oldQuotes.some((quote, i) => quote !== newQuotes[i]);
  const rerender = !!node && (!!parent?.rerender || quotesChanged);
  const placed: Placed = {
    node,
    was: !node && edited?.id != null ? (doc.node(edited.id) ?? null) : null,
    edited,
    kind: tree.kind,
    lines: edited?.lines ?? null,
    gap: edited?.gap ?? 0,
    parent,
    children: [],
    prev: null,
    next: null,
    delta: 0,
    base: null,
    owner: null,
    markerColumn: 0,
    contentColumn: 0,
    marker: null,
    arrived,
    rerender,
    output: [],
  };
  for (const treeChild of tree.children) {
    const child = place(doc, treeChild, placed);
    if (typeof child === 'string') return child;
    const last = placed.children[placed.children.length - 1];
    if (last) {
      last.next = child;
      child.prev = last;
    }
    placed.children.push(child);
  }
  return placed;
}

/** Where the first child item of `parent` goes: its content column, or the next tab stop in a tab-indented document. */
function firstChildColumn(parent: Placed, tabs: boolean): number {
  const marker = parent.markerColumn;
  const content = parent.contentColumn;
  return tabs && marker + 4 >= content && marker + 4 <= content + 3 ? marker + 4 : content;
}

/**
 * The column an item arriving in its place (new, or from another parent) lands at: its previous
 * item's, else that of the old item after it (past the ones arriving with it), else its parent
 * item's first-child column, else the start of the line.
 */
function landingColumn(placed: Placed, sibling: Placed | null, tabs: boolean): number {
  if (sibling) return sibling.markerColumn;
  let after = placed.next;
  while (after && (!after.node || after.node.parent !== placed.parent!.node)) after = after.next;
  if (after?.node?.kind === 'item') return after.node.block.markerColumn! + placed.parent!.delta;
  const parent = placed.parent!;
  return parent.kind === 'item' ? firstChildColumn(parent, tabs) : parent.kind === 'quote' ? parent.contentColumn : 0;
}

/**
 * Decides each node's columns and marker, in document order. A node moves along with its parent.
 * An item that comes from another parent (or is new) lands at its new siblings' column, or its new
 * parent's first-child column, and takes their marker; one that stays under its parent keeps its
 * column unless that would change its nesting, past its new previous sibling's content column or
 * short of its parent's.
 */
export function shift(doc: OutlineState, placed: Placed, tabs: boolean): string | null {
  const parent = placed.parent;
  const node = placed.node;
  const sibling = placed.prev?.kind === 'item' ? placed.prev : null;
  if (parent && !node) {
    // a new node
    if (placed.kind === 'item') {
      placed.markerColumn = Math.max(landingColumn(placed, sibling, tabs), containerColumn(parent));
      placed.marker = placed.edited?.exactMarker && placed.edited.marker ? placed.edited.marker : markerOf(doc, placed, sibling);
      placed.contentColumn = placed.markerColumn + placed.marker.length + 1;
    } else {
      placed.markerColumn = placed.contentColumn = containerColumn(parent);
      // a quote's content starts after its `> `
      if (placed.kind === 'quote') placed.contentColumn = placed.markerColumn + 2;
    }
  } else if (parent && node) {
    const arrived = node.parent !== parent.node;
    placed.delta = parent.delta;
    placed.base = parent.base;
    placed.owner = parent.owner;
    if (node.kind === 'quote') {
      const piece = doc.lines[node.startLine]!.prefix.find((candidate) => candidate.block === node.block);
      placed.markerColumn = (piece?.fromColumn ?? 0) + placed.delta;
      // where lines are written in it, after its `> `: a first line's `>` without the space (`>- a`)
      // doesn't hold for the others
      placed.contentColumn = Math.max(piece?.toColumn ?? 0, (piece?.fromColumn ?? 0) + 2) + placed.delta;
    }
    if (node.kind !== 'item') {
      if (arrived) {
        // a block under another parent moves from its old parent's content column to its new one's
        const oldParent = node.parent;
        const from = oldParent ? oldContentColumn(doc, oldParent) : 0;
        const to = containerColumn(parent);
        placed.delta = to - from;
        if (placed.delta !== 0 && !placed.rerender) {
          if (oldParent?.kind !== 'item') return `a ${node.kind} moving into an item: not written yet`;
          placed.base = placed.owner = oldParent.block;
        }
      }
    } else {
      const column = node.block.markerColumn! + parent.delta;
      let target = column;
      if (arrived) target = landingColumn(placed, sibling, tabs);
      else if (sibling && column >= sibling.contentColumn) target = sibling.markerColumn;
      else if (!sibling && parent.kind === 'item' && column < parent.contentColumn) target = firstChildColumn(parent, tabs);
      // first in an item whose first block shares its marker's line (`- - a`), it goes on that line, at
      // the item's content column
      if (!placed.prev && parent.kind === 'item' && sharesMarkerLine(parent)) target = parent.contentColumn;
      if (target !== column) {
        placed.delta = target - node.block.markerColumn!;
        placed.base = placed.delta < 0 && node.parent?.kind === 'item' ? node.parent.block : node.block;
        placed.owner = node.block;
      }
      const exact = placed.edited?.exactMarker ? placed.edited.marker : undefined;
      if (exact || arrived) {
        const marker = exact ?? markerOf(doc, placed, sibling);
        if (marker !== doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block))) placed.marker = marker;
      } else if (!sibling && placed.prev?.kind !== 'item' && (parent.kind === 'paragraph' || (parent.kind === 'item' && !!parent.node?.head))) {
        // an ordered item first in its list now, from further down it, right under text: it takes the
        // list's start, which lets it interrupt the text (renumbering the rest needs the list read as one)
        const list = node.block.list;
        const own = doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
        if (list?.type === 'ordered' && node.block.parent?.children[0] !== node.block && /^\d/.test(own)) placed.marker = `${node.block.parent?.list?.start ?? 1}${own.slice(-1)}`;
      }
      placed.markerColumn = node.block.markerColumn! + placed.delta;
      placed.contentColumn = node.block.contentColumn! + placed.delta + (placed.marker ?? '').length - (placed.marker ? doc.markerTo(node.block) - doc.markerFrom(node.block) : 0);
    }
    if (placed.lines && placed.delta !== 0) return `a rewritten ${node.kind} moving columns: not written yet`;
  }
  for (const child of placed.children) {
    const childFailure = shift(doc, child, tabs);
    if (childFailure) return childFailure;
  }
  return null;
}

/**
 * Where an old node's children start: an item's content column, after a quote's `>`; a section's (a
 * heading's, a paragraph's list) are its container's, the nearest item or quote holding it, else 0.
 */
function oldContentColumn(doc: OutlineState, node: OutlineNode): number {
  for (let at: OutlineNode | null = node; at; at = at.parent) {
    if (at.kind === 'item') return at.block.contentColumn!;
    if (at.kind === 'quote') return doc.lines[at.startLine]!.prefix.find((piece) => piece.block === at!.block)?.toColumn ?? 0;
  }
  return 0;
}

/** Where a placed node's children start, as `oldContentColumn` for where it now is. */
function containerColumn(placed: Placed | null): number {
  for (let at = placed; at; at = at.parent) if (at.kind === 'item' || at.kind === 'quote') return at.contentColumn;
  return 0;
}

/** Whether an old item's first block is on its marker's line (`- > q`, `- - a`): it has no line of its own. */
function sharesMarkerLine(placed: Placed): boolean {
  const node = placed.node;
  return !!node && !placed.lines && !node.head && node.children[0]?.startLine === node.startLine;
}

/** The marker an item takes in its place: always a new item's, an old one's only when it changes. */
function markerOf(doc: OutlineState, placed: Placed, sibling: Placed | null): string {
  const markerText = (item: Placed): string => item.marker ?? (item.node ? doc.text.slice(doc.markerFrom(item.node.block), doc.markerTo(item.node.block)) : doc.config.bullet);
  const own = placed.node ? doc.text.slice(doc.markerFrom(placed.node.block), doc.markerTo(placed.node.block)) : (placed.edited!.marker ?? doc.config.bullet);
  const theirs = sibling ? markerText(sibling) : null;
  const ordered = (marker: string): boolean => /^\d/.test(marker);
  // a new item joins its list whatever its own kind; an old one keeps its kind
  const kind = theirs !== null && !placed.node ? ordered(theirs) : ordered(own);
  if (!kind) {
    // an item joining a list takes its bullet
    return theirs !== null && !ordered(theirs) ? theirs : own;
  }
  // an ordered item joining a list counts on from its new previous item, or starts one at 1 (only a
  // list starting at 1 can interrupt a paragraph)
  const delimiter = theirs !== null && ordered(theirs) ? theirs.slice(-1) : ordered(own) ? own.slice(-1) : '.';
  const before = theirs !== null && ordered(theirs) ? parseInt(theirs, 10) : 0;
  return `${before + 1}${delimiter}`;
}
