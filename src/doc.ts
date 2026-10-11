// The immutable document snapshot: text plus its derived syntax tree and outline.

import { headOwners, project, type OutlineNode } from './outline.ts';
import { parseCommonMark } from './syntax/commonmark.ts';
import type { LineInfo, SyntaxTree } from './syntax/types.ts';
import { applyChanges, diffLines, lineIndexAt, mapPos, normalizeChanges, type Change } from './text.ts';

export interface ApplyOptions {
  /**
   * Identity for nodes the changes moved, which position mapping can't follow: new head-start
   * offset (in the new text) → id of the node that now starts there.
   */
  readonly identity?: ReadonlyMap<number, number>;
  /** Provisional places to add, in the new text's coordinates. */
  readonly provisional?: readonly number[];
  /** Provisional places of this snapshot to drop rather than carry over. */
  readonly drop?: readonly number[];
}

/** A place stays provisional while its line holds no text: nothing, or only container markers. */
const reEmptyPlaceLine = /^[ \t>]*(?:(?:[-+*]|\d{1,9}[.)])[ \t]+)*$/;

function validPlaces(text: string, marks: readonly number[]): number[] {
  const out = new Set<number>();
  for (const p of marks) {
    if (p < 0 || p > text.length) continue;
    const c = text.charCodeAt(p);
    if (p < text.length && c !== 10 && c !== 13) continue; // not at a line end
    let start = p;
    while (start > 0 && text.charCodeAt(start - 1) !== 10 && text.charCodeAt(start - 1) !== 13) start--;
    if (reEmptyPlaceLine.test(text.slice(start, p))) out.add(p);
  }
  return [...out].sort((a, b) => a - b);
}

export class Doc {
  readonly text: string;
  readonly syntax: SyntaxTree;
  readonly outline: OutlineNode;
  /** Outline nodes in document order, root first. */
  readonly nodes: readonly OutlineNode[];
  readonly lines: readonly LineInfo[];
  /**
   * Provisional places: ends of empty lines read as if text had been typed there, so an empty
   * item or paragraph the user is about to fill exists in the outline. Session state the text
   * can't hold; a place goes away when its line gets text.
   */
  readonly provisional: readonly number[];
  private readonly owners: readonly (OutlineNode | null)[];
  private readonly byId: ReadonlyMap<number, OutlineNode>;
  private readonly lineStarts: readonly number[];
  /** Next id to hand out in this lineage. */
  private readonly nextId: number;

  private constructor(
    text: string,
    provisional: readonly number[],
    ids?: (node: OutlineNode, lines: readonly LineInfo[]) => number | undefined,
    nextId = 1,
  ) {
    this.text = text;
    this.provisional = validPlaces(text, provisional);
    this.syntax = parseCommonMark(text, { provisional: this.provisional });
    this.lines = this.syntax.lines;
    this.lineStarts = this.lines.map((l) => l.from);
    const projection = project(this.syntax);
    // carry ids over from a previous snapshot where the caller can match nodes
    if (ids) {
      const used = new Set<number>([0]);
      for (const n of projection.nodes) {
        if (n.kind === 'root') continue;
        const id = ids(n, this.lines);
        (n as { id: number }).id = id !== undefined && !used.has(id) ? id : nextId++;
        used.add(n.id);
      }
    } else {
      nextId = projection.nodes.length;
    }
    this.nextId = nextId;
    this.outline = projection.root;
    this.nodes = projection.nodes;
    this.owners = headOwners(projection, this.lines.length);
    this.byId = new Map(projection.nodes.map((n) => [n.id, n]));
  }

  static parse(text: string, options: { provisional?: readonly number[] } = {}): Doc {
    return new Doc(text, options.provisional ?? []);
  }

  /**
   * The snapshot after `changes` (in this document's coordinates). A node keeps its id when
   * `options.identity` names it, or else when its first line maps onto the first line of a node
   * of the same kind (the same one of them, when nested items share a line). A line's start maps
   * past text inserted at it, so typing, indenting or opening a line above keeps a node's id;
   * a node whose first line was deleted is gone.
   */
  apply(changes: readonly Change[], options: ApplyOptions = {}): Doc {
    const text = applyChanges(this.text, changes);
    // explicitly placed nodes don't also claim the line their old start maps to
    const claimed = new Set(options.identity?.values());
    const sorted = normalizeChanges(changes);
    let carried: Map<string, number> | null = null;
    const ranks = new Map<string, number>();
    const dropped = new Set(options.drop);
    // a place follows typing that keeps its line empty (a space), so map it past insertions
    const places = this.provisional.filter((p) => !dropped.has(p)).map((p) => mapPos(changes, p, 1));
    return new Doc(
      text,
      [...places, ...(options.provisional ?? [])],
      (n, lines) => {
        const explicit = options.identity?.get(headStartIn(n, lines));
        if (explicit !== undefined) return explicit;
        carried ??= this.carriedIds(sorted, lines, claimed);
        return carried.get(rankedKey(ranks, `${n.kind}@${n.startLine}`));
      },
      this.nextId,
    );
  }

  /** Ids of this snapshot's nodes by the key they will have in the new lines, after `changes`. */
  private carriedIds(changes: readonly Change[], lines: readonly LineInfo[], claimed: ReadonlySet<number>): Map<string, number> {
    const starts = { starts: lines.map((l) => l.from), ends: [] };
    const ranks = new Map<string, number>();
    const out = new Map<string, number>();
    for (const n of this.nodes) {
      if (n.kind === 'root' || claimed.has(n.id)) continue;
      const first = this.lines[n.startLine]!;
      if (changes.some((c) => c.from < c.to && c.from <= first.from && c.to >= first.to)) continue;
      const line = lineIndexAt(starts, mapPos(changes, first.from, 1));
      const key = rankedKey(ranks, `${n.kind}@${line}`);
      if (!out.has(key)) out.set(key, n.id);
    }
    return out;
  }

  /** Replaces the whole text (e.g. after an external change), keeping ids outside the lines that differ. */
  replace(text: string): Doc {
    return this.apply(diffLines(this.text, text));
  }

  node(id: number): OutlineNode | undefined {
    return this.byId.get(id);
  }

  /** The node whose own text contains line `line`, or null (blank lines, gaps). */
  nodeAtLine(line: number): OutlineNode | null {
    return this.owners[line] ?? null;
  }

  /** The node whose own text contains `pos`. A position after the final line ending is on no line. */
  nodeAt(pos: number): OutlineNode | null {
    const line = this.lineAt(pos);
    if (pos > line.to) return null;
    return this.nodeAtLine(line.index);
  }

  lineAt(pos: number): LineInfo {
    return this.lines[lineIndexAt({ starts: this.lineStarts, ends: [] }, pos)] ?? emptyLine;
  }

  /** Offset where a node starts: an item's marker, or the content start of its first line. */
  headStart(node: OutlineNode): number {
    return headStartIn(node, this.lines);
  }

  /** The node's own text, line by line, without container prefixes, list markers or heading marks. */
  headLines(node: OutlineNode): string[] {
    if (!node.head) return [];
    const head = node.head;
    const out: string[] = [];
    for (let l = head.startLine; l <= head.endLine; l++) {
      const line = this.lines[l]!;
      out.push(this.text.slice(line.contentFrom, line.to));
    }
    if (head.type === 'heading') {
      if (head.setext) out.pop();
      else out[0] = out[0]!.replace(/^[ \t]*#{1,6}(?=[ \t]|$)/, '').replace(/[ \t]+#+[ \t]*$|^[ \t]*#+[ \t]*$/, '');
    }
    return out;
  }

  /**
   * Content offsets of a node's head: from its first character to the end of its last line, or
   * for a heading, of its title (before a setext underline or a closing sequence of `#`s).
   */
  headRange(node: OutlineNode): { from: number; to: number } | null {
    if (!node.head) return null;
    const first = this.lines[node.head.startLine]!;
    const last = this.lines[node.head.endLine]!;
    let from = first.contentFrom;
    while (from < first.to && isSpace(this.text.charCodeAt(from))) from++;
    let to = last.to;
    if (node.head.type === 'heading' && node.head.setext) to = this.lines[node.head.endLine - 1]!.to;
    else if (node.head.type === 'heading') {
      const m = /^#{1,6}[ \t]*/.exec(this.text.slice(from, first.to));
      if (m) from += m[0].length;
      const closing = /(?:^|[ \t]+)#+[ \t]*$/.exec(this.text.slice(from, to));
      if (closing) to = from + closing.index;
    }
    return { from, to };
  }
}

const isSpace = (c: number): boolean => c === 32 || c === 9;

const emptyLine: LineInfo = {
  index: 0,
  from: 0,
  to: 0,
  ending: '',
  prefix: [],
  contentFrom: 0,
  contentColumn: 0,
  container: null as never,
  leaf: null,
  lazy: false,
  blank: true,
};

/** `key` numbered by how many times it was seen before: `item@3#0`, then `item@3#1` for an item nested on the same line. */
function rankedKey(seen: Map<string, number>, key: string): string {
  const rank = seen.get(key) ?? 0;
  seen.set(key, rank + 1);
  return `${key}#${rank}`;
}

function headStartIn(node: OutlineNode, lines: readonly LineInfo[]): number {
  if (node.kind === 'item') return node.block.markerFrom!;
  return lines[node.startLine]?.contentFrom ?? 0;
}
