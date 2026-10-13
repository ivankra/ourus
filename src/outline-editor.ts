// The outline editor: edited outlines, and the text changes that write them.
//
// An edited outline is what a command wants the outline to be. Nodes it doesn't touch are the old
// outline's own nodes, by reference; nodes on the path from the root to an edit are copied, and so
// are nodes the edit creates. The writer turns it into text changes, and verification checks that
// the new text reads as it.
//
// The text is the preamble (the lines above the first node), then one unit per node in document
// order: the node's own lines, then its trailing gap (the blank lines after them). The writer lays
// the units out in the edited outline's order, with:
// - each old node's lines shifted where it lands at another column (a new parent, or a slot written
//   at another column), its subtree along with it;
// - a new node's lines, and an old node's rewritten ones, written with the prefix of where they are;
// - list markers adopted: an item joining a list takes its bullet, and an ordered item its number;
// - the blank lines between units chosen by the rules of `spec/gaps.md`: a node's gap travels with
//   it, the gap that ends a scope stays at its end, and nodes arriving from elsewhere take the
//   separation of the place they land in. A seam the edit made gets a blank line where the text
//   needs one, and new text where the command asks (`separate`).
// The changes leave every line that keeps its order where it is (the heaviest run of them), so a
// move is written as a move.

import type { OutlineDoc } from './doc.ts';
import type { OutlineKind, OutlineNode } from './outline.ts';
import type { Block, LineInfo } from './parsing/types.ts';
import { advanceColumns, dominantEnding, mapPos, type TextChange } from './text.ts';

// ------------------------------------------------------------------ edited outlines

/** A node a command copied or created. Fields it leaves out are the `from` node's. */
export interface EditedOutlineNode {
  /** The id to keep, or null for a node the edit creates. */
  readonly id: number | null;
  readonly kind: OutlineKind;
  /** The node of the old outline this one was: its lines are reused. Absent for a new node. */
  readonly from?: OutlineNode;
  /** heading: its level, when it differs from `from`'s. */
  readonly level?: number;
  /** The node's own text, when it differs from `from`'s: trimmed lines joined by `\n`. */
  readonly text?: string;
  /** A new atom's block type, or a new item's head type when it isn't a paragraph. */
  readonly blockType?: string;
  /**
   * The node's own lines as written, without their list prefix (an item's first line starts after
   * its marker): a new node's, or an old node's when its text changes. `text` is what they read as.
   */
  readonly lines?: readonly string[];
  /** A new item's own marker (`-`, `1.`); the writer adopts its list's where it joins one. */
  readonly marker?: string;
  /** Write `marker` as given, on a new item or an old one, instead of adopting the list's (a paste keeps the numbers it brings). */
  readonly exactMarker?: boolean;
  /** Blank lines after the node's own lines: a new node's, or a rewritten one's in place of its old gap. */
  readonly gap?: number;
  readonly children: readonly (OutlineNode | EditedOutlineNode)[];
}

/** Whether `node` is a copied or created node, not one of the old outline's (which alone have a `block`). */
export const isEdited = (node: OutlineNode | EditedOutlineNode): node is EditedOutlineNode => !('block' in node);

/** A copy of `node` to edit: the same node, its children still the old outline's. */
export const editable = (node: OutlineNode | EditedOutlineNode): EditedOutlineNode =>
  isEdited(node) ? node : { id: node.id, kind: node.kind, from: node, children: node.children };

/**
 * The edited outline as its text will read: in a section (the root's or a heading's children), the
 * items right after a paragraph are its children, as `buildOutline` reads them, and anything else
 * among them ends its list there: it and what follows it are the section's again. Nodes it doesn't
 * regroup stay as they were.
 */
export function withOwnedLists(node: OutlineNode | EditedOutlineNode): OutlineNode | EditedOutlineNode {
  const children = node.children.map(withOwnedLists);
  let changed = children.some((child, i) => child !== node.children[i]);
  let regrouped = children;
  if (node.kind === 'root' || node.kind === 'heading') {
    regrouped = [];
    const pending = [...children];
    while (pending.length) {
      let child = pending.shift()!;
      if (child.kind === 'paragraph') {
        // a paragraph's list ends at the first child that isn't an item
        const end = child.children.findIndex((grandchild) => grandchild.kind !== 'item');
        if (end >= 0) {
          pending.unshift(...child.children.slice(end));
          child = { ...editable(child), children: child.children.slice(0, end) };
          changed = true;
        }
      }
      const before = regrouped[regrouped.length - 1];
      if (child.kind === 'item' && before?.kind === 'paragraph') {
        regrouped[regrouped.length - 1] = { ...editable(before), children: [...before.children, child] };
        changed = true;
      } else regrouped.push(child);
    }
  }
  return changed ? { ...editable(node), children: regrouped } : node;
}

/**
 * The outline with node `id` replaced by `change` of a copy of it. Only the path from the root to that
 * node is copied; every other node stays as it was, by reference.
 */
export function editNode(
  root: OutlineNode | EditedOutlineNode,
  id: number,
  change: (node: EditedOutlineNode) => EditedOutlineNode,
): EditedOutlineNode {
  const visit = (node: OutlineNode | EditedOutlineNode): EditedOutlineNode | null => {
    if (node.id === id) return change(editable(node));
    for (const child of node.children) {
      const edited = visit(child);
      if (edited) return { ...editable(node), children: node.children.map((sibling) => (sibling === child ? edited : sibling)) };
    }
    return null;
  };
  const out = visit(root);
  if (!out) throw new Error(`no node ${id} in the outline`);
  return out;
}

/** What a new node is written as: its lines, marker and gap. */
export type NewContent = Pick<EditedOutlineNode, 'lines' | 'marker' | 'gap'>;

/**
 * A new node meaning what `node` means (a pasted node, say), its subtree copied the same way.
 * `content` gives what it is written as.
 */
export function asNewNode(node: OutlineNode, text: (node: OutlineNode) => string, content: (node: OutlineNode) => NewContent): EditedOutlineNode {
  const { level, block } = describe(node, text);
  return {
    id: null,
    kind: node.kind,
    text: text(node),
    ...(level !== undefined ? { level } : {}),
    ...(block !== undefined ? { blockType: block } : {}),
    ...content(node),
    children: node.children.map((child) => asNewNode(child, text, content)),
  };
}

/** How a node's own text is read: in the old outline (the one an edited outline was made from), and in the new one. */
export interface OutlineText {
  readonly old: (node: OutlineNode) => string;
  readonly new: (node: OutlineNode) => string;
}

/**
 * Where node `actual` of the new outline differs from the node it was meant to be, children aside,
 * or null when it is that node. Compares kind, heading level, text and block (an atom's type, or an
 * item whose text isn't a paragraph). Ids aren't compared.
 */
export function nodeDifference(expected: OutlineNode | EditedOutlineNode, actual: OutlineNode, text: OutlineText): string | null {
  const source = isEdited(expected) ? expected.from : expected;
  const want = { ...(source ? describe(source, text.old) : { level: undefined, text: '', block: undefined }), kind: expected.kind };
  if (isEdited(expected)) {
    if (expected.level !== undefined) want.level = expected.level;
    if (expected.text !== undefined) want.text = expected.text;
    if (expected.blockType !== undefined) want.block = expected.blockType;
  }
  const got = describe(actual, text.new);
  for (const key of ['kind', 'level', 'text', 'block'] as const) {
    if (want[key] !== got[key]) return `${key} ${JSON.stringify(want[key])}, got ${JSON.stringify(got[key])}`;
  }
  return null;
}

/** Where the new outline differs from the edited outline it was meant to be, or null when it is that outline. */
export function outlineDifference(expected: OutlineNode | EditedOutlineNode, actual: OutlineNode, text: OutlineText, at = 'root'): string | null {
  const own = nodeDifference(expected, actual, text);
  if (own) return `${at}: ${own}`;
  const count = Math.max(expected.children.length, actual.children.length);
  for (let i = 0; i < count; i++) {
    const expectedChild = expected.children[i];
    const actualChild = actual.children[i];
    if (!expectedChild || !actualChild) return `${at}: ${expected.children.length} children, got ${actual.children.length}`;
    const difference = outlineDifference(expectedChild, actualChild, text, `${at} › ${i}`);
    if (difference) return difference;
  }
  return null;
}

/** What verification compares of a node, besides its children. */
type Description = { kind: OutlineKind; level: number | undefined; text: string; block: string | undefined };

function describe(node: OutlineNode, text: (node: OutlineNode) => string): Description {
  return {
    kind: node.kind,
    level: node.head?.type === 'heading' ? node.head.level : undefined,
    text: text(node),
    // an atom's block type, or an item's head type when it isn't a paragraph (`- # h`, `- <div>`)
    block: node.kind === 'atom' ? node.block.type : node.kind === 'item' && node.head && node.head.type !== 'paragraph' ? node.head.type : undefined,
  };
}

// ------------------------------------------------------------------ writing

export interface WrittenOutline {
  readonly changes: TextChange[];
  /** A position of the old text in the new one: text the writer kept follows its line. */
  map(pos: number, assoc?: -1 | 1): number;
  /** Where offset `offset` of own line `line` of `node` (an edited node with `lines`) now is. */
  at(node: EditedOutlineNode, line: number, offset: number): number;
  /** Every old node's id, by where it now starts (see `OutlineDoc.apply`'s `identity`). */
  readonly identity: Map<number, number>;
  /** How many seams the edit made could take a blank line they don't have (see `pad`). */
  readonly candidates: number;
}

export interface OutlineWriteOptions {
  /**
   * Outside a list, set new text off by a blank line from the text after it, or on both sides
   * (`around`), where it has none.
   */
  readonly separate?: 'after' | 'around';
  /** The seams the edit made that get a blank line, by their index among the candidates, or all. */
  readonly pad?: ReadonlySet<number> | 'all';
}

/** A node as the writer lays it out, at its place in the edited outline. */
interface Placed {
  /** The old node it is, or null for a new one. */
  readonly node: OutlineNode | null;
  /** For a new node keeping an old one's id (converted to another kind), that old node: its seams are its. */
  readonly was: OutlineNode | null;
  readonly edited: EditedOutlineNode | null;
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

/** One line of the new text: an old line (`origin`) rewritten by `local` changes, or new text. */
interface OutputLine {
  readonly origin: number | null;
  readonly text: string;
  ending: string;
  /** Changes to the old line, relative to its start. */
  readonly local: readonly TextChange[];
  /** How much keeping the line in place is worth: less for a node arriving from elsewhere, which moves. */
  readonly weight: number;
}

/** Writes `edited`, an edited outline of `doc`. A string says why it can't be written. */
export function writeOutline(doc: OutlineDoc, edited: OutlineNode | EditedOutlineNode, options: OutlineWriteOptions = {}): WrittenOutline | string {
  const root = place(doc, edited, null);
  if (typeof root === 'string') return root;
  const tabs = usesTabs(doc);
  const failure = shift(doc, root, tabs);
  if (failure) return failure;

  const order: Placed[] = [];
  const visit = (placed: Placed): void => {
    if (placed.kind !== 'root') order.push(placed);
    placed.children.forEach(visit);
  };
  visit(root);

  const units = unitsOf(doc);
  const lines = doc.lines;
  const eol = dominantEnding(doc.text);
  const out: OutputLine[] = [];
  const emitted = new Set<number>();
  const emitGap = (gap: readonly number[], weight: number, blank: string | null = null): void => {
    for (const lineNo of gap) {
      const line = lines[lineNo]!;
      const old = doc.text.slice(line.from, line.to);
      // a blank line keeps its quotes' markers only while it sits in the same quotes
      const quotes = (text: string): number => (text.match(/>/g) ?? []).length;
      const text = blank !== null && quotes(old) !== quotes(blank) ? blank : old;
      // a gap line written twice (a separation copied) is new text the second time
      out.push({ origin: emitted.has(lineNo) ? null : lineNo, text, ending: line.ending, local: difference(old, text), weight });
      emitted.add(lineNo);
    }
  };
  const blankLine = (text = ''): OutputLine => ({ origin: null, text, ending: eol, local: [], weight: 0 });
  emitGap(units.preamble, 2);
  let candidates = 0;
  for (let i = 0; i < order.length; i++) {
    const placed = order[i]!;
    const weight = placed.arrived ? 1 : 2;
    const own = placed.node ? units.own.get(placed.node) : null;
    if (placed.lines) {
      const written = writeLines(doc, placed, own ?? null, tabs);
      written.forEach((line) => {
        placed.output.push({ index: out.length, prefix: line.prefix });
        out.push({ origin: line.origin, text: line.text, ending: line.ending || eol, local: line.local, weight });
        if (line.origin !== null) emitted.add(line.origin);
      });
    } else if (own && placed.rerender) {
      for (let lineNo = own.first; lineNo <= own.last; lineNo++) {
        const line = lines[lineNo]!;
        const text = rerendered(doc, placed, lineNo, tabs);
        out.push({ origin: lineNo, text, ending: line.ending, local: difference(doc.text.slice(line.from, line.to), text), weight });
        emitted.add(lineNo);
      }
    } else if (own) {
      for (let lineNo = own.first; lineNo <= own.last; lineNo++) {
        const line = lines[lineNo]!;
        const local: TextChange[] = [];
        const change = reindent(doc, lineNo, placed.base, placed.owner, placed.delta, tabs);
        if (change === 'fail') return `the lines of ${placed.kind} ${placed.node!.id} can't move ${placed.delta} columns`;
        if (change) local.push({ from: change.from - line.from, to: change.to - line.from, insert: change.insert });
        if (placed.marker !== null && lineNo === placed.node!.startLine) {
          local.push({ from: doc.markerFrom(placed.node!.block) - line.from, to: doc.markerTo(placed.node!.block) - line.from, insert: placed.marker });
        }
        out.push({ origin: lineNo, text: applyLocal(doc.text.slice(line.from, line.to), local), ending: line.ending, local, weight });
        emitted.add(lineNo);
      }
    } else continue;
    const nextUnit = order.slice(i + 1).find((later) => later.lines || (later.node && units.own.has(later.node))) ?? null;
    const gap = seam(units, placed, nextUnit && order[i + 1]!, nextUnit);
    // the blank line's text, only where a blank line is written
    let blankText: string | null = null;
    const blank = (): string => (blankText ??= blankBetween(placed, order[i + 1] ?? null, tabs));
    emitGap(gap.lines, weight, gap.lines.length ? blank() : null);
    for (let count = 0; count < gap.blanks; count++) out.push(blankLine(blank()));
    if (!gap.separable || gap.blanks > 0 || gap.lines.some((lineNo) => lines[lineNo]!.blank)) continue;
    if (gap.fresh === 'after' ? options.separate : gap.fresh === 'before' && options.separate === 'around') {
      out.push(blankLine(blank()));
      continue;
    }
    const candidate = candidates++;
    if (options.pad === 'all' || options.pad?.has(candidate)) out.push(blankLine(blank()));
  }
  if (out.length === 0) return 'nothing to write';
  // every line but the last ends in a line break; the last ends as the old text did
  const lastEnding = lines.length ? lines[lines.length - 1]!.ending : '';
  for (const output of out) if (output.ending === '') output.ending = eol;
  out[out.length - 1]!.ending = lastEnding;

  const changes = changesOf(doc, out);
  // where each written line now starts
  const starts: number[] = [];
  const byOrigin = new Map<number, number>();
  let at = 0;
  out.forEach((output, index) => {
    starts.push(at);
    if (output.origin !== null) byOrigin.set(output.origin, index);
    at += output.text.length + output.ending.length;
  });
  const map = (pos: number, assoc: -1 | 1 = -1): number => {
    const line = doc.lineAt(pos);
    const index = byOrigin.get(line.index);
    if (index === undefined || pos > line.to + line.ending.length) return mapPos(changes, pos, assoc);
    const output = out[index]!;
    if (pos > line.to) return starts[index]! + output.text.length + Math.min(pos - line.to, output.ending.length);
    return starts[index]! + mapPos(output.local, pos - line.from, assoc);
  };
  const atContent = (node: EditedOutlineNode, line: number, offset: number): number => {
    // the node, or a copy of it (regrouped by `withOwnedLists`), which keeps its lines
    const placed = order.find((candidate) => candidate.edited === node || (!!node.lines && candidate.edited?.lines === node.lines));
    const entry = placed?.output[line];
    if (!entry) throw new Error(`no line ${line} written for that node`);
    return starts[entry.index]! + entry.prefix + offset;
  };
  const identity = new Map<number, number>();
  for (const placed of order) if (placed.node) identity.set(map(doc.headStart(placed.node), 1), placed.node.id);
  return { changes, map, at: atContent, identity, candidates };
}

/** The edited outline as placed nodes. */
function place(doc: OutlineDoc, tree: OutlineNode | EditedOutlineNode, parent: Placed | null): Placed | string {
  const edited = isEdited(tree) ? tree : null;
  const node = edited ? (edited.from ?? null) : (tree as OutlineNode);
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
function shift(doc: OutlineDoc, placed: Placed, tabs: boolean): string | null {
  const parent = placed.parent;
  const node = placed.node;
  const sibling = placed.prev?.kind === 'item' ? placed.prev : null;
  if (parent && !node) {
    // a new node
    if (placed.kind === 'item') {
      placed.markerColumn = landingColumn(placed, sibling, tabs);
      placed.marker = placed.edited?.exactMarker && placed.edited.marker ? placed.edited.marker : markerOf(doc, placed, sibling);
      placed.contentColumn = placed.markerColumn + placed.marker.length + 1;
    } else {
      placed.markerColumn = placed.contentColumn = parent.kind === 'item' || parent.kind === 'quote' ? parent.contentColumn : 0;
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
      placed.contentColumn = (piece?.toColumn ?? 0) + placed.delta;
    }
    if (node.kind !== 'item') {
      if (arrived) {
        // a block under another parent moves from its old parent's content column to its new one's
        const oldParent = node.parent;
        const from = oldParent ? oldContentColumn(doc, oldParent) : 0;
        const to = parent.kind === 'item' || parent.kind === 'quote' ? parent.contentColumn : 0;
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
      if (target !== column) {
        placed.delta = target - node.block.markerColumn!;
        placed.base = placed.delta < 0 && node.parent?.kind === 'item' ? node.parent.block : node.block;
        placed.owner = node.block;
      }
      const exact = placed.edited?.exactMarker ? placed.edited.marker : undefined;
      if (exact || arrived) {
        const marker = exact ?? markerOf(doc, placed, sibling);
        if (marker !== doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block))) placed.marker = marker;
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

/** Where an old container's content starts: an item's content column, after a quote's `>`; 0 elsewhere. */
function oldContentColumn(doc: OutlineDoc, node: OutlineNode): number {
  if (node.kind === 'item') return node.block.contentColumn!;
  if (node.kind !== 'quote') return 0;
  return doc.lines[node.startLine]!.prefix.find((piece) => piece.block === node.block)?.toColumn ?? 0;
}

/** The marker an item takes in its place: always a new item's, an old one's only when it changes. */
function markerOf(doc: OutlineDoc, placed: Placed, sibling: Placed | null): string {
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

// ------------------------------------------------------------------ new and rewritten lines

/** A line written from content: an old line it replaces (if any), its text, and where its content starts. */
interface ContentLine {
  readonly origin: number | null;
  readonly text: string;
  readonly ending: string;
  readonly local: readonly TextChange[];
  readonly prefix: number;
}

/** A node's lines written from its `lines`, with the prefix of where it is. */
function writeLines(doc: OutlineDoc, placed: Placed, own: { first: number; last: number } | null, tabs: boolean): ContentLine[] {
  const content = placed.lines!;
  let first: string;
  let rest: string;
  if (placed.node && own) {
    // an old node keeps its prefixes: its first line's, and its second's (or its content column)
    const firstLine = doc.lines[own.first]!;
    first = doc.text.slice(firstLine.from, contentStart(firstLine));
    if (placed.marker !== null) {
      const block = placed.node.block;
      first = first.slice(0, doc.markerFrom(block) - firstLine.from) + placed.marker + first.slice(doc.markerTo(block) - firstLine.from);
    }
    const secondLine = own.last > own.first ? doc.lines[own.first + 1]! : null;
    rest = secondLine && !secondLine.blank ? doc.text.slice(secondLine.from, contentStart(secondLine)) : linePrefix(placed.kind === 'item' ? placed : placed.parent, tabs);
  } else if (placed.kind === 'item') {
    const within = prefixWithin(placed.parent, tabs);
    first = within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + placed.marker + ' ';
    rest = linePrefix(placed, tabs);
  } else {
    first = rest = linePrefix(placed.parent, tabs);
  }
  return content.map((text, i) => {
    const prefix = i === 0 ? first : rest;
    // an empty line keeps only its quotes' markers
    const line = i === 0 || text !== '' ? prefix + text : prefix.trimEnd();
    const oldNo = own && own.first + i <= own.last ? own.first + i : null;
    if (oldNo === null) return { origin: null, text: line, ending: '', local: [], prefix: prefix.length };
    const old = doc.lines[oldNo]!;
    return { origin: oldNo, text: line, ending: old.ending, local: difference(doc.text.slice(old.from, old.to), line), prefix: prefix.length };
  });
}

/** Line `lineNo` of `placed` (an old node), its prefix rendered from where it now is, its content kept. */
function rerendered(doc: OutlineDoc, placed: Placed, lineNo: number, tabs: boolean): string {
  const line = doc.lines[lineNo]!;
  const content = doc.text.slice(contentStart(line), line.to);
  // a lazy continuation stays lazy, as it was written
  if (line.lazy) return content;
  const node = placed.node!;
  if (node.kind === 'item' && lineNo === node.startLine) {
    // the marker line: indentation to the marker, the marker, and its padding as written
    const piece = line.prefix.find((candidate) => candidate.block === node.block);
    const within = prefixWithin(placed.parent, tabs);
    const marker = placed.marker ?? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
    const padding = piece ? doc.text.slice(doc.markerTo(node.block), piece.to) : ' ';
    return within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + marker + padding + content;
  }
  const prefix = linePrefix(node.kind === 'item' ? placed : placed.parent, tabs);
  return content === '' ? prefix.trimEnd() : prefix + content;
}

/** Where a line's content starts after its containers' prefix: quotes' `>` and items' indentation. */
function contentStart(line: LineInfo): number {
  const last = line.prefix[line.prefix.length - 1];
  return last ? last.to : line.from;
}

/**
 * The prefix of a line inside `container`: up to and including the last enclosing quote's `> `
 * (`text`, ending at `column`), and the column the container's content starts at, which the
 * caller indents to, so that items' indentation is one run of whitespace.
 */
function prefixWithin(container: Placed | null, tabs: boolean): { text: string; column: number; content: number } {
  const chain: Placed[] = [];
  for (let at = container; at; at = at.parent) if (at.kind === 'item' || at.kind === 'quote') chain.unshift(at);
  let text = '';
  let column = 0;
  let content = 0;
  for (const at of chain) {
    if (at.kind === 'quote') {
      text += whitespace(column, Math.max(column, at.markerColumn), tabs) + '> ';
      column = content = Math.max(column, at.markerColumn) + 2;
    } else content = Math.max(content, at.contentColumn);
  }
  return { text, column, content };
}

/** The whole prefix of a content line inside `container`. */
function linePrefix(container: Placed | null, tabs: boolean): string {
  const within = prefixWithin(container, tabs);
  return within.text + whitespace(within.column, within.content, tabs);
}

/** A blank line between two nodes: the `>` of every quote that holds both. */
function blankBetween(before: Placed, after: Placed | null, tabs: boolean): string {
  if (!after) return '';
  const holding = new Set<Placed>();
  for (let at: Placed | null = before; at; at = at.parent) holding.add(at);
  let common: Placed | null = after.parent;
  while (common && !holding.has(common)) common = common.parent;
  return linePrefix(common, tabs).trimEnd();
}

/** The one change that turns `before` into `after`: what lies between their common start and end. */
function difference(before: string, after: string): TextChange[] {
  if (before === after) return [];
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let end = 0;
  while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end++;
  return [{ from: start, to: before.length - end, insert: after.slice(start, after.length - end) }];
}

/** What `node` of `doc` is written as when it's copied as a new node: its lines, marker and gap. */
export function contentOf(doc: OutlineDoc, node: OutlineNode): NewContent {
  const lines: string[] = [];
  let gap = 0;
  let after = false;
  for (const line of doc.lines.slice(node.startLine)) {
    const owner = doc.nodeAtLine(line.index);
    if (owner === node) lines.push(doc.text.slice(contentStart(line), line.to));
    else if (!owner && lines.length) {
      after = true;
      gap++;
    } else if (owner || after) break;
  }
  const marker = node.kind === 'item' ? { marker: doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block)) } : {};
  return { lines: lines.length || node.kind === 'quote' ? lines : [''], gap, ...marker };
}

// ------------------------------------------------------------------ units and seams

interface Units {
  readonly preamble: readonly number[];
  /** Each node's own lines (absent for a node sharing its only line with a child: `- - a`). */
  readonly own: Map<OutlineNode, { first: number; last: number }>;
  /** The gap after each node's own lines: the blank lines up to the next node's. */
  readonly gap: Map<OutlineNode, number[]>;
  /** The last node with own lines in each node's subtree. */
  readonly lastUnit: (node: OutlineNode) => OutlineNode;
  /** The next node with own lines in the old document order. */
  readonly nextUnit: Map<OutlineNode, OutlineNode | null>;
  /** The last node with own lines in the text. */
  readonly last: OutlineNode | null;
}

function unitsOf(doc: OutlineDoc): Units {
  const preamble: number[] = [];
  const own = new Map<OutlineNode, { first: number; last: number }>();
  const gap = new Map<OutlineNode, number[]>();
  const nextUnit = new Map<OutlineNode, OutlineNode | null>();
  let current: OutlineNode | null = null;
  for (const line of doc.lines) {
    const node = doc.nodeAtLine(line.index);
    if (!node) {
      if (current) gap.get(current)!.push(line.index);
      else preamble.push(line.index);
      continue;
    }
    if (node === current) {
      own.get(node)!.last = line.index;
      continue;
    }
    if (current) nextUnit.set(current, node);
    current = node;
    own.set(node, { first: line.index, last: line.index });
    gap.set(node, []);
  }
  if (current) nextUnit.set(current, null);
  const lastUnit = (node: OutlineNode): OutlineNode => {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const last = lastUnit(node.children[i]!);
      if (own.has(last)) return last;
    }
    return node;
  };
  return { preamble, own, gap, lastUnit, nextUnit, last: current };
}

/** Whether `after`, right after sibling `node`, continues `node`'s scope: siblings, and for an item, of its list. */
const continues = (node: OutlineNode, after: OutlineNode | undefined, sameList: boolean): boolean =>
  !!after && (node.kind !== 'item' || (after.kind === 'item' && (!sameList || after.block.parent === node.block.parent)));

interface Seam {
  /** Old blank lines to write. */
  readonly lines: readonly number[];
  /** New blank lines to write. */
  readonly blanks: number;
  /** Outside a list: a blank line may set the two apart. */
  readonly separable: boolean;
  /** Where it meets new text: after it, or before it (see `separate`). */
  readonly fresh: 'after' | 'before' | null;
}

/**
 * The blank lines written after `unit` (the last own lines written), when node `next` comes next
 * and `nextUnit` is the next one with own lines (both null at the end of the text).
 */
function seam(units: Units, unit: Placed, next: Placed | null, nextUnit: Placed | null): Seam {
  const gapAfter = (node: OutlineNode): number[] => units.gap.get(units.lastUnit(node)) ?? [];
  // a converted node counts as its old self here
  const old = (placed: Placed): OutlineNode | null => placed.node ?? placed.was;
  const own = old(unit) ? (units.gap.get(old(unit)!) ?? []) : [];
  // a rewritten node may say what its own gap is
  const rewritten = unit.node && unit.lines && unit.edited?.gap !== undefined ? unit.edited.gap : null;
  const kept = (lines: readonly number[]): Seam =>
    lines === own && rewritten !== null ? { lines: [], blanks: rewritten, separable: false, fresh: null } : { lines, blanks: 0, separable: false, fresh: null };
  // the end of the text keeps the old end's gap
  if (!next) return kept(units.last ? units.gap.get(units.last)! : []);
  const fresh = !unit.node ? 'after' : !next.node ? 'before' : null;
  const prev = next.prev;
  const separable = !((prev ?? unit).kind === 'item' && next.kind === 'item');
  const made = (lines: readonly number[]): Seam =>
    lines === own && rewritten !== null ? { lines: [], blanks: rewritten, separable, fresh } : { lines, blanks: 0, separable, fresh };
  // new text keeps its own gaps within it
  if (!old(unit) && !old(next)) return { lines: [], blanks: unit.gap, separable: false, fresh: null };
  // two units that were already next to each other keep what was between them
  const nextOld = nextUnit ? old(nextUnit) : null;
  if (old(unit) && (!nextUnit || nextOld) && (units.nextUnit.get(old(unit)!) ?? null) === nextOld) {
    // still, a seam whose quotes changed may need a blank line where a quote's `>` set them apart
    return fresh || unit.rerender || nextUnit?.rerender ? made(own) : kept(own);
  }
  // a first child follows its parent's own lines and their gap; new first children come right after
  // the parent's lines, its gap staying after them, unless they keep an old node's id (a node
  // converted to another kind is still where it was)
  const arrived = (placed: Placed): boolean => !old(placed) || old(placed)!.parent !== placed.parent!.node;
  // an item moved down below a paragraph, into its list, swaps with it around the blank lines between them
  const owner = next.parent?.node;
  if (!prev && owner?.kind === 'paragraph' && next.kind === 'item' && old(next) && old(next)!.parent === owner.parent && arrived(next) && old(next)!.startLine < owner.startLine) {
    return made(gapAfter(old(next)!));
  }
  if (!prev) return fresh === 'before' && next.edited?.id == null ? made([]) : fresh ? made(own) : kept(own);
  if (arrived(next) !== arrived(prev)) {
    // a run arriving from elsewhere takes the separation of the place it lands in, on both sides:
    // the gap after the last node before it that was already there, or its parent's own gap
    let landing: Placed | null = prev;
    while (landing && arrived(landing)) landing = landing.prev;
    // items arriving at the head of a paragraph's list are set apart from its items as the list sets them apart
    if (!landing && owner?.kind === 'paragraph' && next.kind === 'item' && old(next)) {
      return { lines: [], blanks: old(next)!.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    if (!landing) return made(next.parent?.node ? (units.gap.get(next.parent.node) ?? []) : []);
    const node = old(landing)!;
    // items joining a list after its last item are separated as the list separates its items; the
    // gap after the list goes after them
    if (arrived(next) && node.kind === 'item' && next.kind === 'item' && !continues(node, siblingAfter(node), true)) {
      return { lines: [], blanks: node.block.parent!.tight ? 0 : 1, separable: false, fresh: null };
    }
    // at the end of the text, the gap there is how the text ends, not a separation
    const atEnd = units.nextUnit.get(units.lastUnit(node)) === null;
    return made(atEnd ? [] : gapAfter(node));
  }
  // a new node's subtree ends with the last unit written
  if (arrived(next)) return made(old(prev) ? gapAfter(old(prev)!) : own);
  // within one scope, a node's gap (its subtree's last) travels with it, but the gap that ends the
  // scope stays at its end
  const before = old(prev)!;
  const oldFinal = !continues(before, siblingAfter(before), true);
  const newFinal = !continues(before, old(next)!, true);
  if (oldFinal === newFinal) return made(gapAfter(before));
  if (oldFinal) {
    // the new last node's own gap comes up in exchange
    let last = next;
    while (last.next && old(last.next) && continues(old(last)!, old(last.next)!, false)) last = last.next;
    return made(gapAfter(old(last)!));
  }
  let last = before;
  for (let sibling = siblingAfter(last); continues(last, sibling, true); sibling = siblingAfter(last)) last = sibling!;
  return made(gapAfter(last));
}

const siblingAfter = (node: OutlineNode): OutlineNode | undefined => {
  const siblings = node.parent?.children ?? [];
  return siblings[siblings.indexOf(node) + 1];
};

// ------------------------------------------------------------------ changes

/**
 * The changes from the old text to the written lines. Lines that keep their order (the heaviest
 * increasing run of their old indexes) stay, edited in place; the others are deleted where they
 * were and written where they now are.
 */
function changesOf(doc: OutlineDoc, out: readonly OutputLine[]): TextChange[] {
  const lines = doc.lines;
  const kept = heaviestIncreasing(out, lines.length);
  const changes: TextChange[] = [];
  let cursor = 0;
  let pending = '';
  const lineStart = (lineNo: number): number => (lineNo < lines.length ? lines[lineNo]!.from : doc.text.length);
  out.forEach((output, i) => {
    if (!kept.has(i)) {
      pending += output.text + output.ending;
      return;
    }
    const lineNo = output.origin!;
    const line = lines[lineNo]!;
    if (lineStart(cursor) !== line.from || pending) changes.push({ from: lineStart(cursor), to: line.from, insert: pending });
    pending = '';
    for (const change of output.local) changes.push({ from: line.from + change.from, to: line.from + change.to, insert: change.insert });
    if (output.ending !== line.ending) changes.push({ from: line.to, to: line.to + line.ending.length, insert: output.ending });
    cursor = lineNo + 1;
  });
  if (lineStart(cursor) !== doc.text.length || pending) changes.push({ from: lineStart(cursor), to: doc.text.length, insert: pending });
  return changes;
}

/** Indexes of the lines whose old indexes increase, with the most weight in all (a Fenwick tree of best runs). */
function heaviestIncreasing(out: readonly OutputLine[], size: number): Set<number> {
  // tree[index]: the best run ending at an old index of at most index, as [weight, line]
  const tree: [number, number][] = Array.from({ length: size + 1 }, () => [0, -1]);
  const best = (index: number): [number, number] => {
    let found: [number, number] = [0, -1];
    for (let i = index; i > 0; i -= i & -i) if (tree[i]![0] > found[0]) found = tree[i]!;
    return found;
  };
  const before: number[] = new Array(out.length).fill(-1);
  let top: [number, number] = [0, -1];
  out.forEach((output, i) => {
    if (output.origin === null) return;
    const [weight, prev] = best(output.origin);
    const run: [number, number] = [weight + output.weight, i];
    before[i] = prev;
    for (let j = output.origin + 1; j <= size; j += j & -j) if (run[0] > tree[j]![0]) tree[j] = run;
    if (run[0] > top[0]) top = run;
  });
  const kept = new Set<number>();
  for (let i = top[1]; i >= 0; i = before[i]!) kept.add(i);
  return kept;
}

function applyLocal(s: string, changes: readonly TextChange[]): string {
  let out = '';
  let pos = 0;
  for (const change of [...changes].sort((first, second) => first.from - second.from)) {
    out += s.slice(pos, change.from) + change.insert;
    pos = change.to;
  }
  return out + s.slice(pos);
}

// ------------------------------------------------------------------ indentation

const tabbed = new WeakMap<OutlineDoc, boolean>();

/** Whether list nesting in this document is written with tabs (remembered per document). */
export function usesTabs(doc: OutlineDoc): boolean {
  let tabs = tabbed.get(doc);
  if (tabs === undefined) tabbed.set(doc, (tabs = scanTabs(doc)));
  return tabs;
}

function scanTabs(doc: OutlineDoc): boolean {
  for (const line of doc.lines) {
    if (line.blank) continue;
    for (const prefix of line.prefix) {
      if (prefix.block.type !== 'item') continue;
      // the indentation before a marker or of a continuation line, not the padding after a marker
      const piece = doc.text.slice(prefix.from, prefix.to);
      const lead = /^[ \t]*/.exec(piece)![0];
      if (lead.includes('\t') || (prefix.partialTab && lead === piece)) return true;
    }
  }
  return false;
}

export function whitespace(fromCol: number, toCol: number, tabs: boolean): string {
  let s = '';
  let col = fromCol;
  if (tabs) {
    while (col + 4 - (col % 4) <= toCol) {
      s += '\t';
      col += 4 - (col % 4);
    }
  }
  return s + ' '.repeat(toCol - col);
}

/**
 * Widens or narrows by `delta` columns the whitespace where `base`'s piece starts on line `lineNo`,
 * shifting everything after it. `base` is the item whose level the line moves into (indent) or
 * out of (outdent). Returns the change (null when the line is left alone: blank lines and lazy
 * continuations), or 'fail' when the line can't move that far.
 */
export function reindent(doc: OutlineDoc, lineNo: number, base: Block | null, owner: Block | null, delta: number, tabs: boolean): TextChange | null | 'fail' {
  if (delta === 0 || !base || !owner) return null;
  const line = doc.lines[lineNo]!;
  const text = doc.text;
  // blank lines carry nothing to shift: inside an item even a code block's blank line is empty
  if (line.blank) return null;
  const piece = line.prefix.find((candidate) => candidate.block === base);
  // lazy continuation lines (the moving item didn't match them) stay as they are
  if (!piece || !line.prefix.some((candidate) => candidate.block === owner)) return null;
  let runTo = piece.from;
  while (runTo < line.to && (text.charCodeAt(runTo) === 32 || text.charCodeAt(runTo) === 9)) runTo++;
  const charCol = advanceColumns(text, line.from, piece.from, 0);
  const endCol = advanceColumns(text, piece.from, runTo, charCol);
  const target = endCol + delta;
  if (target < piece.fromColumn) return 'fail';
  if (delta > 0) {
    if (tabs && delta % 4 === 0) {
      // a tab-indented document gets its tabs on every line, continuations included: where the
      // piece starts when that is a tab stop, so the line's own spaces stay after them
      if (charCol % 4 === 0 && piece.fromColumn === charCol) return { from: piece.from, to: piece.from, insert: '\t'.repeat(delta / 4) };
      if (endCol % 4 === 0) return { from: runTo, to: runTo, insert: '\t'.repeat(delta / 4) };
    }
    // right after a `>` written without its optional space, the first space inserted is the quote's
    const before = line.prefix[line.prefix.indexOf(piece) - 1];
    const quoteTakes = before?.block.type === 'blockquote' && before.to === piece.from && runTo === piece.from && text[before.to - 1] === '>';
    return { from: runTo, to: runTo, insert: ' '.repeat(delta + (quoteTakes ? 1 : 0)) };
  }
  const narrower = -delta;
  if (runTo - narrower >= piece.from && /^ *$/.test(text.slice(runTo - narrower, runTo)) && !(piece.partialTab && runTo - narrower === piece.from)) {
    return { from: runTo - narrower, to: runTo, insert: '' };
  }
  return { from: piece.from, to: runTo, insert: whitespace(charCol, target, tabs) };
}
