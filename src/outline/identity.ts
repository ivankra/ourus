// Node ids across an edit: which node of the new outline is which node of the old one.

import type { SyntaxTree } from '../parser/index.ts';
import { lineIndexAt, mapPos, type ChangeSpec } from '../text.ts';
import type { OutlineNode } from './build.ts';
import type { OutlineState } from './state.ts';

/**
 * The ids of `old`'s nodes for the outline after `changes`. A node keeps its id when `identity` names
 * it (by where it now starts), or else when its first line maps onto the first line of a node of the
 * same kind (the same one of them, when nested items share a line). A line's start maps past text
 * inserted at it, so typing, indenting or opening a line above keeps a node's id; a node whose first
 * line was deleted is gone.
 */
export class IdCarrier {
  readonly #old: OutlineState;
  readonly #changes: readonly ChangeSpec[];
  readonly #identity: ReadonlyMap<number, number> | undefined;
  /** Ids by `kind@line#rank` in the new lines, made when first needed. */
  #carried: Map<string, number> | null = null;
  readonly #ranks = new Map<string, number>();

  constructor(old: OutlineState, changes: readonly ChangeSpec[], identity: ReadonlyMap<number, number> | undefined) {
    this.#old = old;
    this.#changes = changes;
    this.#identity = identity;
  }

  /** The id node `node` of the new outline (read by `syntax`) keeps, or undefined for a new one. */
  idOf(node: OutlineNode, syntax: SyntaxTree): number | undefined {
    const explicit = this.#identity?.get(headStartIn(node, syntax));
    if (explicit !== undefined) return explicit;
    this.#carried ??= this.carried(syntax);
    return this.#carried.get(rankedKey(this.#ranks, `${node.kind}@${node.startLine}`));
  }

  /** Ids of the old nodes by the key they will have in the new lines. */
  private carried(syntax: SyntaxTree): Map<string, number> {
    const old = this.#old;
    const changes = this.#changes;
    // explicitly placed nodes don't also claim the line their old start maps to
    const claimed = new Set(this.#identity?.values());
    const ranks = new Map<string, number>();
    const out = new Map<string, number>();
    for (const n of old.nodes) {
      if (n.kind === 'root' || claimed.has(n.id)) continue;
      const first = { from: old.syntaxTree.starts[n.startLine]!, to: old.syntaxTree.ends[n.startLine]! };
      if (changes.some((c) => c.from < c.to && c.from <= first.from && c.to >= first.to)) continue;
      const line = lineIndexAt(syntax.starts, mapPos(changes, first.from, 1));
      const key = rankedKey(ranks, `${n.kind}@${line}`);
      if (!out.has(key)) out.set(key, n.id);
    }
    return out;
  }
}

/** `key` numbered by how many times it was seen before: `item@3#0`, then `item@3#1` for an item nested on the same line. */
function rankedKey(seen: Map<string, number>, key: string): string {
  const rank = seen.get(key) ?? 0;
  seen.set(key, rank + 1);
  return `${key}#${rank}`;
}

/** Where a node starts: an item's marker, or the content start of its first line. */
export function headStartIn(node: OutlineNode, syntax: SyntaxTree): number {
  if (node.kind === 'item') return syntax.markerFrom(node.block);
  return node.startLine < syntax.lineCount ? syntax.line(node.startLine).contentFrom : 0;
}
