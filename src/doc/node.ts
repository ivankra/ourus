// A node of one snapshot's outline with its position: its lines, its parent and its siblings. It
// wraps an `OutlineNodePersistent`, which holds none of those (so snapshots can share it), and is
// made when a query reaches it; a snapshot makes each once, so its nodes compare by identity.

import { mdCalloutAt, type MdBlock } from '../parser/index.ts';
import type { OutlineNodePersistent } from './outline.ts';
import type { OutlineNodeKind } from './rules.ts';
import type { ProseText } from './text.ts';

export class OutlineNode {
  /** What it is, wherever it is: the same object in every snapshot that shares it. */
  readonly persistentNode: OutlineNodePersistent;
  readonly parent: OutlineNode | null;
  /** Its index among its parent's children. */
  readonly index: number;
  readonly depth: number;
  /** Its first line. */
  readonly startLine: number;
  #children: (OutlineNode | undefined)[] | null = null;
  #endLine = -1;

  constructor(node: OutlineNodePersistent, startLine: number, parent: OutlineNode | null, index: number) {
    this.persistentNode = node;
    this.startLine = startLine;
    this.parent = parent;
    this.index = index;
    this.depth = parent ? parent.depth + 1 : 0;
  }

  get id(): number {
    return this.persistentNode.id;
  }

  get kind(): OutlineNodeKind {
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

  /** Its last line with its descendants', blank lines after them not included. */
  get endLine(): number {
    if (this.#endLine < 0) {
      const node = this.persistentNode;
      const own = node.kind === 'item' || node.kind === 'quote' ? this.startLine + node.block!.lines - 1 : this.textLastLine;
      const n = node.children.length;
      this.#endLine = n ? Math.max(own, this.child(n - 1).endLine) : own;
    }
    return this.#endLine;
  }

  /** Blank lines after its own text, before its first child or what follows it. */
  get gap(): number {
    return this.persistentNode.gap;
  }

  /** Child `i`, made when first asked for. */
  child(i: number): OutlineNode {
    const node = this.persistentNode;
    this.#children ??= new Array(node.children.length);
    return (this.#children[i] ??= new OutlineNode(node.children[i]!, this.startLine + node.offsets[i]!, this, i));
  }

  get children(): readonly OutlineNode[] {
    const n = this.persistentNode.children.length;
    for (let i = 0; i < n; i++) this.child(i);
    return (this.#children ?? []) as OutlineNode[];
  }

  get prev(): OutlineNode | null {
    return this.parent && this.index > 0 ? this.parent.child(this.index - 1) : null;
  }

  get next(): OutlineNode | null {
    return this.parent && this.index + 1 < this.parent.persistentNode.children.length ? this.parent.child(this.index + 1) : null;
  }

  /** Its last descendant in document order: itself where it has no children. */
  get lastDescendant(): OutlineNode {
    let at: OutlineNode = this;
    while (at.persistentNode.children.length) at = at.child(at.persistentNode.children.length - 1);
    return at;
  }

  /** The node before it in document order: its previous sibling's last descendant, else its parent (the root at the top). */
  get preceding(): OutlineNode | null {
    const prev = this.prev;
    return prev ? prev.lastDescendant : this.parent;
  }

  /** The node after its subtree in document order, or null at the document's end. */
  get afterSubtree(): OutlineNode | null {
    for (let at: OutlineNode | null = this; at; at = at.parent) if (at.next) return at.next;
    return null;
  }

  /** Whether a node among its children can own the list right after it: in the document's own sections (the root's, a heading's), not in an item or a quote (which kinds do, `OurusDoc.adoptsLists`). */
  get ownsLists(): boolean {
    let holder: OutlineNode | null = this;
    while (holder && (holder.kind === 'heading' || holder.kind === 'paragraph')) holder = holder.parent;
    return !holder || holder.kind === 'root';
  }

  /** Whether `text`, set on it, would make it its quote's callout title: a quote's first paragraph whose first line opens a callout. */
  becomesTitle(text: ProseText): boolean {
    return this.parent?.kind === 'quote' && this.index === 0 && mdCalloutAt(text.body.split('\n')[0]!) !== null;
  }

  /** The node whose own text holds line `line`, below this one: the deepest, where nested items share a line; or null. */
  nodeAtLine(line: number): OutlineNode | null {
    let best: OutlineNode | null = null;
    for (let node: OutlineNode = this; ; ) {
      if (node.kind !== 'root' && line >= node.startLine && line <= node.textLastLine) best = node;
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
