// The outline's nodes: `PersistentNode`, a node as stored, and `OurusNode`, one snapshot's node
// with its position. A stored node holds no absolute line and no parent: its kind and id, the
// blocks it was read from, its extent (`lines`: from its first line to the next node's, its
// descendants and blank lines included, so siblings tile their parent), its blank lines after its
// own lines (`gap`), and each child's first line from its own; snapshots share it. A node's own lines
// are its text's and the block-id lines its text carries after them (`blockIdCount`).

import { mdCalloutAt, type MdBlock } from '../parser/index.ts';
import type { OurusNodeKind } from './rules.ts';
import type { OurusProse, OurusText } from './text.ts';

/**
 * A node as stored, shared by every snapshot and draft it holds for. A **read** node was read from a
 * document: it has its blocks, its extent and its children's offsets. A **drafted** node was made or
 * changed by a draft (`OurusDraft`): it has no blocks and no lines until the document is read again,
 * but its `source`, the read node it was (null for one the draft made), and its `text` where the
 * draft set it.
 */
export class PersistentNode {
  /** Given once the build has made the outline (`assignIds`), or by the draft; fixed from then on. */
  readonly id: number = -1;
  readonly kind: OurusNodeKind;
  /** The parser's block the node is (the document, for the root); null for a drafted node. */
  readonly block: MdBlock | null;
  /** The parser's block holding its own text, if it has one; null for a drafted node. */
  readonly head: MdBlock | null;
  /** Blank lines after its own lines (its text's, the block-id lines it carries), before its first child or what follows it. */
  readonly gap: number;
  /** A read node's extent: from its first line to the next node's (or the document's end). */
  readonly lines: number;
  /** A read node's children's first lines, from its own. */
  readonly offsets: readonly number[];
  /**
   * The lines after a read node's text that it carries: its block-id lines (`^t1` after a table),
   * with the blank lines before them; 0 where it carries none, and for a drafted node.
   */
  readonly blockIdCount: number;
  readonly children: readonly PersistentNode[];
  /** A drafted node's: the read node it was, or null for one the draft made. Undefined for a read node. */
  readonly source: PersistentNode | null | undefined;
  /**
   * A drafted node's text, as the draft set it (null: no text), or undefined: its source's, unchanged.
   * Undefined for a read node, whose text is read from its document (`OurusDoc.textOf`).
   */
  readonly text: OurusText | null | undefined;

  constructor(kind: OurusNodeKind, block: MdBlock, head: MdBlock | null, lines: number, offsets: readonly number[], children: readonly PersistentNode[], blockIdCount = 0) {
    this.kind = kind;
    this.block = block;
    this.head = head;
    this.lines = lines;
    this.offsets = offsets;
    this.children = children;
    this.blockIdCount = blockIdCount;
    const next = children.length ? offsets[0]! : lines;
    this.gap = kind === 'root' ? 0 : Math.max(0, next - this.ownLines().last - 1);
  }

  /** A drafted node: `id`, `kind`, its text (undefined: `source`'s), gap and children. */
  static drafted(
    id: number,
    kind: OurusNodeKind,
    source: PersistentNode | null,
    text: OurusText | null | undefined,
    gap: number,
    children: readonly PersistentNode[],
  ): PersistentNode {
    const node = Object.create(PersistentNode.prototype) as { -readonly [K in keyof PersistentNode]: PersistentNode[K] };
    Object.assign(node, { id, kind, block: null, head: null, gap, lines: 0, offsets: [], blockIdCount: 0, children, source, text });
    return node as PersistentNode;
  }

  /**
   * The quote that is a read node's text (`OurusConfig.quotes`): `text`'s, a paragraph framed by
   * it, its head the paragraph inside it; `atom`'s, its head the quote; an item's on its marker's
   * line too (`- > q`). Null for any other node.
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

  /** The lines of a read node's own, counted from its first line: its text's and the block-id lines it carries after them. */
  ownLines(): { readonly first: number; readonly last: number } {
    const text = this.textLines();
    return this.blockIdCount ? { first: text.first, last: text.last + this.blockIdCount } : text;
  }
}

/**
 * A node of the outline: a heading, item, paragraph, quote or atom, or the document's root.
 * Get one from an `OurusDoc` (`rootNode`, `node(id)`, `nodeAtLine`). A node belongs to its
 * snapshot; to find it again after an update, keep its `id`.
 *
 * Internally, a lazy wrapper around a `PersistentNode`, which snapshots share, adding what
 * differs per snapshot: start line, parent and index among siblings. A snapshot creates at most
 * one wrapper per node, so nodes compare with `===`.
 */
export class OurusNode {
  /** What it is, wherever it is: the same object in every snapshot that shares it. */
  readonly persistentNode: PersistentNode;
  /** Null for the root. */
  readonly parent: OurusNode | null;
  /** Its index among its parent's children. */
  readonly index: number;
  /** The root's is 0. */
  readonly depth: number;
  /** Its first line. */
  readonly startLine: number;
  #children: (OurusNode | undefined)[] | null = null;
  #endLine = -1;

  /** Made by its snapshot, not by a host: see the class. */
  constructor(node: PersistentNode, startLine: number, parent: OurusNode | null, index: number) {
    this.persistentNode = node;
    this.startLine = startLine;
    this.parent = parent;
    this.index = index;
    this.depth = parent ? parent.depth + 1 : 0;
  }

  /** The same from snapshot to snapshot. */
  get id(): number {
    return this.persistentNode.id;
  }

  /** Heading, item, paragraph, quote, atom or root. */
  get kind(): OurusNodeKind {
    return this.persistentNode.kind;
  }

  /** The parser's block it is. */
  get block(): MdBlock {
    return this.persistentNode.block!;
  }

  /** The parser's block holding its own text, or null. */
  get head(): MdBlock | null {
    return this.persistentNode.head;
  }

  /** Where its own text starts (an item's below its marker, `-⏎  one`): its first line where it has none. */
  get textFirstLine(): number {
    return this.startLine + this.persistentNode.textLines().first;
  }

  /** The last line of its own text: its first where it has none. */
  get textLastLine(): number {
    return this.startLine + this.persistentNode.textLines().last;
  }

  /** The last of its own lines: its text's, or the last block-id line its text carries after them. */
  get ownLastLine(): number {
    return this.startLine + this.persistentNode.ownLines().last;
  }

  /** Its last line with its descendants', blank lines after them not included. */
  get endLine(): number {
    if (this.#endLine < 0) {
      const node = this.persistentNode;
      const own = node.kind === 'item' || node.kind === 'quote' ? this.startLine + node.block!.lines - 1 : this.ownLastLine;
      const n = node.children.length;
      this.#endLine = n ? Math.max(own, this.child(n - 1).endLine) : own;
    }
    return this.#endLine;
  }

  /** Blank lines after its own lines, before its first child or what follows it. */
  get gap(): number {
    return this.persistentNode.gap;
  }

  /** Child `i`, made when first asked for. */
  child(i: number): OurusNode {
    const node = this.persistentNode;
    this.#children ??= new Array(node.children.length);
    return (this.#children[i] ??= new OurusNode(node.children[i]!, this.startLine + node.offsets[i]!, this, i));
  }

  /** In document order. */
  get children(): readonly OurusNode[] {
    const n = this.persistentNode.children.length;
    for (let i = 0; i < n; i++) this.child(i);
    return (this.#children ?? []) as OurusNode[];
  }

  /** The sibling before it; null for the first. */
  get prev(): OurusNode | null {
    return this.parent && this.index > 0 ? this.parent.child(this.index - 1) : null;
  }

  /** The sibling after it; null for the last. */
  get next(): OurusNode | null {
    return this.parent && this.index + 1 < this.parent.persistentNode.children.length ? this.parent.child(this.index + 1) : null;
  }

  /** Its last descendant in document order: itself where it has no children. */
  get lastDescendant(): OurusNode {
    let at: OurusNode = this;
    while (at.persistentNode.children.length) at = at.child(at.persistentNode.children.length - 1);
    return at;
  }

  /** The node before it in document order: its previous sibling's last descendant, else its parent (the root at the top). */
  get preceding(): OurusNode | null {
    const prev = this.prev;
    return prev ? prev.lastDescendant : this.parent;
  }

  /** The node after its subtree in document order, or null at the document's end. */
  get afterSubtree(): OurusNode | null {
    for (let at: OurusNode | null = this; at; at = at.parent) if (at.next) return at.next;
    return null;
  }

  /** Whether a node among its children can own the list right after it: in the document's own sections (the root's, a heading's), not in an item or a quote (which kinds do, `OurusDoc.adoptsLists`). */
  get ownsLists(): boolean {
    let holder: OurusNode | null = this;
    while (holder && (holder.kind === 'heading' || holder.kind === 'paragraph')) holder = holder.parent;
    return !holder || holder.kind === 'root';
  }

  /** Whether `text`, set on it, would make it its quote's callout title: a quote's first paragraph whose first line opens a callout. */
  becomesTitle(text: OurusProse): boolean {
    return this.parent?.kind === 'quote' && this.index === 0 && mdCalloutAt(text.body.split('\n')[0]!) !== null;
  }

  /** The node whose own lines hold line `line` (its text's, its block-id lines'), below this one: the deepest, where nested items share a line; or null. */
  nodeAtLine(line: number): OurusNode | null {
    let best: OurusNode | null = null;
    for (let node: OurusNode = this; ; ) {
      if (node.kind !== 'root' && line >= node.startLine && line <= node.ownLastLine) best = node;
      const { offsets, children } = node.persistentNode;
      const rel = line - node.startLine;
      // the last child starting at or before the line
      let lo = 0;
      let hi = offsets.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (offsets[mid]! <= rel) lo = mid;
        else hi = mid - 1;
      }
      if (hi < 0 || offsets[lo]! > rel || rel >= offsets[lo]! + children[lo]!.lines) return best;
      node = node.child(lo);
    }
  }
}
