// The immutable document snapshot: text plus its derived block tree, line table and outline.

import { configOf, flavorOf, type Config } from './config.ts';
import { buildOutline, headOwners, outlineNodes, type OutlineNode } from './outline.ts';
import { Syntax } from './parsing/syntax.ts';
import type { Block, LineInfo } from './parsing/types.ts';
import { applyChanges, diffLines, invertChanges, lineIndexAt, mapPos, normalizeChanges, type TextChange } from './text.ts';

export interface OutlineDocApplyParams {
  /**
   * Identity for nodes the changes moved, which position mapping can't follow: new head-start
   * offset (in the new text) → id of the node that now starts there.
   */
  readonly identity?: ReadonlyMap<number, number>;
  /** Placeholders to add, in the new text's coordinates. */
  readonly placeholders?: readonly number[];
  /**
   * Where the caret is after the changes (an edit the host made): when a deletion would change the
   * outline there (emptying a node, widening an item's padding), a placeholder at the caret keeps it.
   */
  readonly caret?: number;
  /** Placeholders of this snapshot to drop rather than carry over. */
  readonly drop?: readonly number[];
}

/** A placeholder stays one while its line holds no text: nothing, or only container markers. */
const reEmptyPlaceLine = /^[ \t>]*(?:(?:[-+*]|\d{1,9}[.)])[ \t]+)*$/;

/** A marker and its one padding space, after the line's containers: what precedes a stand-in space. */
const reMarkerAndSpace = /^[ \t>]*(?:[-+*]|\d{1,9}[.)])[ \t]$/;

/**
 * Whether `p` can be a placeholder: the end of a line holding no text, or a space right after a list
 * marker's padding space, with text after it (a deleted character's place, read as text).
 */
function isPlace(text: string, p: number): boolean {
  if (p < 0 || p > text.length) return false;
  let start = p;
  while (start > 0 && text.charCodeAt(start - 1) !== 10 && text.charCodeAt(start - 1) !== 13) start--;
  const c = text.charCodeAt(p);
  if (p === text.length || c === 10 || c === 13) return reEmptyPlaceLine.test(text.slice(start, p));
  if (c !== 32 && c !== 9) return false;
  return reMarkerAndSpace.test(text.slice(start, p)) && text.slice(p, lineEndAt(text, p)).trim() !== '';
}

function validPlaces(text: string, marks: readonly number[]): number[] {
  return [...new Set(marks.filter((p) => isPlace(text, p)))].sort((a, b) => a - b);
}

export class OutlineDoc {
  readonly text: string;
  /** The parse: block tree, line table and inlines, updated incrementally from snapshot to snapshot. */
  readonly syntax: Syntax;
  /** The block tree's root: the document. */
  readonly blocks: Block;
  readonly outline: OutlineNode;
  /** Outline nodes in document order, root first. */
  readonly nodes: readonly OutlineNode[];
  /**
   * Placeholders: ends of empty lines read as if text had been typed there, so an empty
   * item or paragraph the user is about to fill exists in the outline. Session state the text
   * can't hold; a place goes away when its line gets text.
   */
  readonly placeholders: readonly number[];
  /** How commands behave on this document; snapshots after it carry it. */
  readonly config: Config;
  private readonly owners: readonly (OutlineNode | null)[];
  private readonly byId: ReadonlyMap<number, OutlineNode>;
  /** Next id to hand out in this lineage. */
  private readonly nextId: number;

  private constructor(
    text: string,
    placeholders: readonly number[],
    config: Config,
    ids?: (node: OutlineNode, syntax: Syntax) => number | undefined,
    nextId = 1,
    parse: (placeholders: readonly number[]) => Syntax = (sentinels) => Syntax.parse(text, flavorOf(config.flavor), { sentinels }),
    /** A snapshot whose outline holds for this one when the parse kept its blocks. */
    same?: OutlineDoc,
  ) {
    this.text = text;
    this.config = config;
    this.placeholders = validPlaces(text, placeholders);
    this.syntax = parse(this.placeholders);
    const blocks = this.syntax.root;
    this.blocks = blocks;
    if (same && same.syntax.root === blocks) {
      // the same blocks: the same outline, ids and all (they hold line numbers, not offsets)
      this.outline = same.outline;
      this.nodes = same.nodes;
      this.owners = same.owners;
      this.byId = same.byId;
      this.nextId = same.nextId;
      return;
    }
    const root = buildOutline(blocks, (i) => this.syntax.line(i), text);
    const nodes = outlineNodes(root);
    // carry ids over from a previous snapshot where the caller can match nodes
    if (ids) {
      const used = new Set<number>([0]);
      for (const n of nodes) {
        if (n.kind === 'root') continue;
        const id = ids(n, this.syntax);
        (n as { id: number }).id = id !== undefined && !used.has(id) ? id : nextId++;
        used.add(n.id);
      }
    } else {
      nextId = nodes.length;
    }
    this.nextId = nextId;
    this.outline = root;
    this.nodes = nodes;
    this.owners = headOwners(nodes, this.syntax.lineCount);
    this.byId = new Map(nodes.map((n) => [n.id, n]));
  }

  /** The line table (built when first asked for: prefer `line`). */
  get lines(): readonly LineInfo[] {
    return this.syntax.lines;
  }

  /** Line `i`. */
  line(i: number): LineInfo {
    return this.syntax.line(i);
  }

  /** Where an item's marker (`-`, `1.`) starts and ends in the text. */
  markerFrom(item: Block): number {
    return this.syntax.markerFrom(item);
  }

  markerTo(item: Block): number {
    return this.syntax.markerTo(item);
  }

  static parse(text: string, params: { placeholders?: readonly number[]; config?: Partial<Config> } = {}): OutlineDoc {
    return new OutlineDoc(text, params.placeholders ?? [], configOf(params.config));
  }

  /**
   * The snapshot after `changes` (in this document's coordinates). A node keeps its id when
   * `params.identity` names it, or else when its first line maps onto the first line of a node
   * of the same kind (the same one of them, when nested items share a line). A line's start maps
   * past text inserted at it, so typing, indenting or opening a line above keeps a node's id;
   * a node whose first line was deleted is gone.
   */
  apply(changes: readonly TextChange[], params: OutlineDocApplyParams = {}): OutlineDoc {
    const text = applyChanges(this.text, changes);
    // explicitly placed nodes don't also claim the line their old start maps to
    const claimed = new Set(params.identity?.values());
    const sorted = normalizeChanges(changes);
    let carried: Map<string, number> | null = null;
    const ranks = new Map<string, number>();
    const dropped = new Set(params.drop);
    // a place follows typing that keeps its line empty (a space), so map it past insertions
    const places = this.placeholders.filter((p) => !dropped.has(p)).map((p) => mapPos(changes, p, 1));
    if (params.caret !== undefined && this.keptAt(changes, text, params.caret)) places.push(params.caret);
    return new OutlineDoc(
      text,
      [...places, ...(params.placeholders ?? [])],
      this.config,
      (n, syntax) => {
        const explicit = params.identity?.get(headStartIn(n, syntax));
        if (explicit !== undefined) return explicit;
        carried ??= this.carriedIds(sorted, syntax, claimed);
        return carried.get(rankedKey(ranks, `${n.kind}@${n.startLine}`));
      },
      this.nextId,
      (sentinels) => this.syntax.update(sorted, { sentinels }),
      !params.identity && this.withinLines(sorted) ? this : undefined,
    );
  }

  /**
   * Whether every change stays inside one line, adds no line and leaves part of the line's text:
   * then ids carry by position exactly as the outline would be rebuilt, and a kept parse keeps it.
   */
  private withinLines(changes: readonly TextChange[]): boolean {
    const { starts, ends } = this.syntax;
    for (const c of changes) {
      if (/[\r\n]/.test(c.insert)) return false;
      const i = lineIndexAt({ starts, ends }, c.from);
      if (c.to > ends[i]! || (c.to > c.from && c.from <= starts[i]! && c.to >= ends[i]!)) return false;
    }
    return true;
  }

  /**
   * Whether a placeholder at `caret` (in the new text) keeps the outline a deletion would otherwise
   * change: the deletion emptied a node (the caret at its line's end) or widened an item's padding
   * (the caret on the space now after its marker), and read with a placeholder there the outline has
   * the shape it had. Typing never makes one: what is typed is text.
   */
  private keptAt(changes: readonly TextChange[], text: string, caret: number): boolean {
    if (!changes.some((change) => change.to > change.from) || !isPlace(text, caret)) return false;
    const shape = (doc: OutlineDoc): string => doc.nodes.map((node) => `${node.depth}:${node.kind}`).join(',');
    const before = shape(this);
    const read = (placeholders: readonly number[]): OutlineDoc =>
      new OutlineDoc(text, placeholders, this.config, undefined, 1, (sentinels) => this.syntax.update(changes, { sentinels }));
    return shape(read([])) !== before && shape(read([caret])) === before;
  }

  /** Ids of this snapshot's nodes by the key they will have in the new lines, after `changes`. */
  private carriedIds(changes: readonly TextChange[], syntax: Syntax, claimed: ReadonlySet<number>): Map<string, number> {
    const starts = { starts: syntax.starts, ends: [] };
    const ranks = new Map<string, number>();
    const out = new Map<string, number>();
    for (const n of this.nodes) {
      if (n.kind === 'root' || claimed.has(n.id)) continue;
      const first = { from: this.syntax.starts[n.startLine]!, to: this.syntax.ends[n.startLine]! };
      if (changes.some((c) => c.from < c.to && c.from <= first.from && c.to >= first.to)) continue;
      const line = lineIndexAt(starts, mapPos(changes, first.from, 1));
      const key = rankedKey(ranks, `${n.kind}@${line}`);
      if (!out.has(key)) out.set(key, n.id);
    }
    return out;
  }

  /** Replaces the whole text (e.g. after an external change), keeping ids outside the lines that differ. */
  replace(text: string, params: OutlineDocApplyParams = {}): OutlineDoc {
    return this.apply(diffLines(this.text, text), params);
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
    return this.syntax.lineCount ? this.syntax.line(lineIndexAt({ starts: this.syntax.starts, ends: [] }, pos)) : emptyLine;
  }

  /** Offset where a node starts: an item's marker, or the content start of its first line. */
  headStart(node: OutlineNode): number {
    return headStartIn(node, this.syntax);
  }

  /**
   * The node's own text, line by line, without container prefixes, list markers or heading marks.
   * A task's checkbox is text, as in CommonMark, also where the flavor reads it as markup: a task
   * with nothing after its checkbox (GFM's `- [ ] `, which has no paragraph) has the checkbox.
   */
  headLines(node: OutlineNode): string[] {
    if (!node.head) {
      const task = node.kind === 'item' ? node.block.task : undefined;
      if (!task) return [];
      const line = this.syntax.line(node.block.startLine);
      return [this.text.slice(line.from + task.start, line.to)];
    }
    const head = node.head;
    const out: string[] = [];
    for (let lineNo = head.startLine; lineNo <= head.endLine; lineNo++) {
      const line = this.syntax.line(lineNo);
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
    const first = this.syntax.line(node.head.startLine);
    const last = this.syntax.line(node.head.endLine);
    let from = first.contentFrom;
    while (from < first.to && isSpace(this.text.charCodeAt(from))) from++;
    let to = last.to;
    if (node.head.type === 'heading' && node.head.setext) to = this.syntax.line(node.head.endLine - 1).to;
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

/** The end of the line `pos` is on, before its line ending. */
function lineEndAt(text: string, pos: number): number {
  let end = pos;
  while (end < text.length && text[end] !== '\n' && text[end] !== '\r') end++;
  return end;
}

const emptyLine: LineInfo = {
  index: 0,
  from: 0,
  to: 0,
  ending: '',
  prefix: [],
  contentFrom: 0,
  contentColumn: 0,
  containers: [],
  container: null as never,
  leaf: null,
  lazy: false,
  blank: true,
  empty: true,
};

/** `key` numbered by how many times it was seen before: `item@3#0`, then `item@3#1` for an item nested on the same line. */
function rankedKey(seen: Map<string, number>, key: string): string {
  const rank = seen.get(key) ?? 0;
  seen.set(key, rank + 1);
  return `${key}#${rank}`;
}

function headStartIn(node: OutlineNode, syntax: Syntax): number {
  if (node.kind === 'item') return syntax.markerFrom(node.block);
  return node.startLine < syntax.lineCount ? syntax.line(node.startLine).contentFrom : 0;
}
