// The immutable document snapshot: text plus its derived block tree, line table and outline.

import { Config } from '../config.ts';
import { Flavor, SyntaxTree, type Block, type LineInfo } from '../parser/index.ts';
import { applyChanges, diffLines, isSpaceOrTab, lineIndexAt, mapPos, normalizeChanges, skipSpaces, trimMd, type ChangeSpec } from '../text.ts';
import { buildOutline, calloutTitle, headOwners, outlineNodes, type OutlineNode } from './build.ts';
import { IdCarrier, headStartIn } from './identity.ts';
import { isPlace, validPlaces } from './placeholders.ts';

export interface OutlineUpdateParams {
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

export class OutlineState {
  /** The Markdown source; everything else is read from it, with the config and the placeholders. */
  readonly text: string;
  /** Its parse: block tree, line table and inlines, updated incrementally from snapshot to snapshot. */
  readonly syntaxTree: SyntaxTree;
  /** The outline's root; its children are the top-level nodes. */
  readonly root: OutlineNode;
  /** Every node in document order, root first. */
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
  /** Each node's index in `nodes`, made when first asked for. */
  #index: Map<OutlineNode, number> | undefined;

  private constructor(
    text: string,
    placeholders: readonly number[],
    config: Config,
    ids?: (node: OutlineNode, syntax: SyntaxTree) => number | undefined,
    nextId = 1,
    parse: (placeholders: readonly number[]) => SyntaxTree = (sentinels) => SyntaxTree.parse(text, Flavor.named(config.flavor), { sentinels }),
    /** A snapshot whose outline holds for this one when the parse kept its blocks. */
    same?: OutlineState,
  ) {
    this.text = text;
    this.config = config;
    this.placeholders = validPlaces(text, placeholders);
    this.syntaxTree = parse(this.placeholders);
    const blocks = this.syntaxTree.root;
    // the outline reads text as well as blocks: whether a quote's first paragraph is a callout title
    if (same && same.syntaxTree.root === blocks && same.nodes.every((n) => n.kind !== 'quote' || calloutTitle(n.block, (i) => this.syntaxTree.line(i), text) === n.head)) {
      // the same blocks: the same outline, ids and all (they hold line numbers, not offsets)
      this.root = same.root;
      this.nodes = same.nodes;
      this.owners = same.owners;
      this.byId = same.byId;
      this.nextId = same.nextId;
      return;
    }
    const root = buildOutline(blocks, (i) => this.syntaxTree.line(i), text);
    const nodes = outlineNodes(root);
    // carry ids over from a previous snapshot where the caller can match nodes
    if (ids) {
      const used = new Set<number>([0]);
      for (const n of nodes) {
        if (n.kind === 'root') continue;
        const id = ids(n, this.syntaxTree);
        (n as { id: number }).id = id !== undefined && !used.has(id) ? id : nextId++;
        used.add(n.id);
      }
    } else {
      nextId = nodes.length;
    }
    this.nextId = nextId;
    this.root = root;
    this.nodes = nodes;
    this.owners = headOwners(nodes, this.syntaxTree.lineCount);
    this.byId = new Map(nodes.map((n) => [n.id, n]));
  }

  /** The line table (built when first asked for: prefer `line`). */
  get lines(): readonly LineInfo[] {
    return this.syntaxTree.lines;
  }

  /** Line `i`. */
  line(i: number): LineInfo {
    return this.syntaxTree.line(i);
  }

  /** Where an item's marker (`-`, `1.`) starts and ends in the text. */
  markerFrom(item: Block): number {
    return this.syntaxTree.markerFrom(item);
  }

  markerTo(item: Block): number {
    return this.syntaxTree.markerTo(item);
  }

  static parse(text: string, params: { placeholders?: readonly number[]; config?: Partial<Config> } = {}): OutlineState {
    return new OutlineState(text, params.placeholders ?? [], Config.of(params.config));
  }

  /**
   * The snapshot after `changes` (in this document's coordinates). A node keeps its id when
   * `params.identity` names it, or else when its first line maps onto the first line of a node
   * of the same kind (the same one of them, when nested items share a line). A line's start maps
   * past text inserted at it, so typing, indenting or opening a line above keeps a node's id;
   * a node whose first line was deleted is gone.
   */
  update(changes: readonly ChangeSpec[], params: OutlineUpdateParams = {}): OutlineState {
    const text = applyChanges(this.text, changes);
    const sorted = normalizeChanges(changes);
    const carrier = new IdCarrier(this, sorted, params.identity);
    const dropped = new Set(params.drop);
    // a place follows typing that keeps its line empty (a space), so map it past insertions; one inside
    // text replaced is gone with it
    const replaced = (p: number): boolean => sorted.some((c) => c.from < p && p < c.to);
    // a place keeps what it stands for: an empty line's end mapped onto a space isn't a held space
    const space = (t: string, p: number): boolean => t[p] === ' ' || t[p] === '\t';
    const places = this.placeholders
      .filter((p) => !dropped.has(p) && !replaced(p))
      .flatMap((p) => {
        const at = mapPos(changes, p, 1);
        return space(text, at) && !space(this.text, p) ? [] : [at];
      });
    if (params.caret !== undefined && this.keptAt(changes, text, params.caret)) places.push(params.caret);
    return new OutlineState(
      text,
      [...places, ...(params.placeholders ?? [])],
      this.config,
      (n, syntax) => carrier.idOf(n, syntax),
      this.nextId,
      (sentinels) => this.syntaxTree.update(sorted, { sentinels }),
      !params.identity && this.withinLines(sorted) ? this : undefined,
    );
  }

  /**
   * Whether every change stays inside one line, adds no line and leaves part of the line's text:
   * then ids carry by position exactly as the outline would be rebuilt, and a kept parse keeps it.
   */
  private withinLines(changes: readonly ChangeSpec[]): boolean {
    const { starts, ends } = this.syntaxTree;
    for (const c of changes) {
      if (/[\r\n]/.test(c.insert)) return false;
      const i = lineIndexAt(starts, c.from);
      if (c.to > ends[i]! || (c.to > c.from && c.from <= starts[i]! && c.to >= ends[i]!)) return false;
    }
    return true;
  }

  /**
   * Whether a placeholder at `caret` (in the new text) keeps the outline a deletion would otherwise
   * change: the deletion emptied a node (the caret at its line's end) or widened an item's padding
   * (the caret on the space now after its marker), and read with a placeholder there the outline has
   * the shape it had, each node's text the same kind of block (`-  ``` x` is code). Typing never
   * makes one: what is typed is text.
   */
  private keptAt(changes: readonly ChangeSpec[], text: string, caret: number): boolean {
    if (!changes.some((change) => change.to > change.from) || !isPlace(text, caret)) return false;
    // an emptied node's text reads as a paragraph's: emptying keeps its kind
    const shape = (doc: OutlineState): string => doc.nodes.map((node) => `${node.depth}:${node.kind}:${node.head?.type ?? 'paragraph'}`).join(',');
    const before = shape(this);
    const read = (placeholders: readonly number[]): OutlineState =>
      new OutlineState(text, placeholders, this.config, undefined, 1, (sentinels) => this.syntaxTree.update(changes, { sentinels }));
    return shape(read([])) !== before && shape(read([caret])) === before;
  }

  /** Replaces the whole text (e.g. after an external change), keeping ids outside the lines that differ. */
  replace(text: string, params: OutlineUpdateParams = {}): OutlineState {
    return this.update(diffLines(this.text, text), params);
  }

  node(id: number): OutlineNode | undefined {
    return this.byId.get(id);
  }

  /** The node before `node` in document order (the root comes first), or undefined. */
  before(node: OutlineNode): OutlineNode | undefined {
    return this.nodes[this.indexOf(node) - 1];
  }

  /** The node after `node` in document order, or undefined. */
  after(node: OutlineNode): OutlineNode | undefined {
    return this.nodes[this.indexOf(node) + 1];
  }

  /** The last node of `node`'s subtree in document order: itself when it has no children. */
  lastDescendant(node: OutlineNode): OutlineNode {
    return node.children.length ? this.lastDescendant(node.children[node.children.length - 1]!) : node;
  }

  private indexOf(node: OutlineNode): number {
    this.#index ??= new Map(this.nodes.map((n, i) => [n, i]));
    return this.#index.get(node) ?? -1;
  }

  /** Whether `node` has no text of its own: no head, or a paragraph head with nothing but a task's checkbox. */
  isEmpty(node: OutlineNode): boolean {
    if (node.head && node.head.type !== 'paragraph') return false;
    return OutlineState.isEmptyText(this.headLines(node).join('\n'));
  }

  /** Whether offset `p` of `text` can be a placeholder (see `placeholders.ts`). */
  static isPlace(text: string, p: number): boolean {
    return isPlace(text, p);
  }

  /** What "empty" means for a node's text, however it was obtained: nothing, or only a task's checkbox, which is markup. */
  static isEmptyText(text: string): boolean {
    return trimMd(trimMd(text).replace(/^\[[ xX]\]/, '')) === '';
  }

  /**
   * Where Home goes from `pos`: the start of the text on its line, past container prefixes, list
   * markers, a task's checkbox and a heading's `#`s; from there, the start of the line. A blank
   * line's text starts after its prefixes.
   */
  homePosition(pos: number): number {
    const line = this.lineAt(pos);
    if (pos > line.to) return pos; // the empty line after a final line ending
    const start = this.textStart(pos);
    return pos === start ? line.from : start;
  }

  /**
   * Where the text starts on `pos`'s line: past container prefixes, a list marker, a task's checkbox, a
   * heading's `#`s and a callout's `[!type]`. With `enterSplitSpace: start`, an item's spaces there
   * past the padding of the item above it are its text's (`extraPadding`).
   */
  textStart(pos: number): number {
    const start = this.markupEnd(pos);
    const node = this.nodeAt(pos);
    const line = this.lineAt(pos);
    if (this.config.enterSplitSpace !== 'start' || !node?.head || line.index !== node.head.startLine) return start;
    if (node.kind === 'item' && node.head.startLine === node.startLine) return start - this.extraPadding(node.block, start);
    // a paragraph's first line, or an item's text on the line after its marker: its leading spaces past
    // where its container's content starts, which Markdown strips (`One.` / `␠Two.`)
    if (node.head.type !== 'paragraph' || (node.kind !== 'paragraph' && node.kind !== 'item')) return start;
    const from = node.kind === 'item' ? this.columnAt(line, node.block.contentColumn!) : line.contentFrom;
    return from < start && start - from < 4 && trimMd(this.text.slice(from, start)) === '' ? from : start;
  }

  /** Where column `column` is on `line` (tabs to the next stop of four), or its end. */
  private columnAt(line: LineInfo, column: number): number {
    let col = 0;
    let p = line.from;
    while (p < line.to && col < column) col = this.text.charCodeAt(p++) === 9 ? col + 4 - (col % 4) : col + 1;
    return p;
  }

  /**
   * How many of the spaces before an item's text (at `start`) a split kept as text
   * (`enterSplitSpace: start`, `- one two` / `-  three`): those past the padding of the item above
   * it, its previous sibling, else the item whose first child it is; none past four columns (code)
   * and none where the padding is the list's own (`-   a` / `-   b`), Markdown's padding either way.
   */
  private extraPadding(item: Block, start: number): number {
    const spacesBefore = (at: number): number => {
      let k = at;
      while (k > 0 && isSpaceOrTab(this.text.charCodeAt(k - 1))) k--;
      return at - k;
    };
    const mine = spacesBefore(start);
    if (mine < 2 || mine > 4) return 0;
    const siblings = item.parent?.children ?? [];
    const above = siblings[siblings.indexOf(item) - 1] ?? (item.parent?.parent?.type === 'item' ? item.parent.parent : undefined);
    if (!above || above.type !== 'item') return 0;
    const theirs = spacesBefore(this.markupEnd(this.markerTo(above)));
    return Math.max(0, mine - Math.max(theirs, 1));
  }

  /** Where the text starts on `pos`'s line as Markdown reads it, past its markup (`textStart`). */
  private markupEnd(pos: number): number {
    const line = this.lineAt(pos);
    let start = line.contentFrom;
    start = skipSpaces(this.text, start, line.to, 1);
    const rest = this.text.slice(start, line.to);
    const node = this.nodeAt(pos);
    if (node?.kind === 'item' && line.index === node.startLine && (!node.head || line.index === node.head.startLine)) {
      // the flavor's checkbox (GFM: an empty task has no head, only it), else one read as text
      const task = node.block.task;
      if (task) start = skipSpaces(this.text, Math.max(start, line.from + task.end), line.to, 1);
      else {
        const box = /^\[[ xX]\][ \t]+/.exec(rest);
        if (box) start += box[0].length;
      }
    }
    // a callout's `[!type]` is markup its title starts after
    if (node?.kind === 'quote' && node.head && line.index === node.head.startLine) {
      const type = /^\[![^\]\s]*\][+-]?(?:[ \t]+|$)/.exec(rest);
      if (type) start += type[0].length;
    }
    if (line.leaf?.type === 'heading' && !line.leaf.setext) {
      const marks = /^#{1,6}(?:[ \t]+|$)/.exec(rest);
      if (marks) start += marks[0].length;
    }
    return start;
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
    return this.syntaxTree.lineCount ? this.syntaxTree.line(lineIndexAt(this.syntaxTree.starts, pos)) : emptyLine;
  }

  /** Offset where a node starts: an item's marker, or the content start of its first line. */
  headStart(node: OutlineNode): number {
    return headStartIn(node, this.syntaxTree);
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
      const line = this.syntaxTree.line(node.block.startLine);
      return [this.text.slice(line.from + task.start, line.to)];
    }
    const head = node.head;
    const out: string[] = [];
    for (let lineNo = head.startLine; lineNo <= head.endLine; lineNo++) {
      const line = this.syntaxTree.line(lineNo);
      out.push(this.text.slice(line.contentFrom, line.to));
    }
    if (head.type === 'heading') {
      if (head.setext) out.pop();
      else out[0] = out[0]!.replace(/^[ \t]*#{1,6}(?=[ \t]|$)/, '').replace(/[ \t]+#+[ \t]*$|^[ \t]*#+[ \t]*$/, '');
    }
    return out;
  }

  /** A node's text as verification compares it: an atom's lines as they are, any other node's trimmed, joined by `\n`. */
  nodeText(node: OutlineNode): string {
    const lines = this.headLines(node);
    return node.kind === 'atom' ? lines.join('\n') : lines.map((line) => trimMd(line)).join('\n');
  }

  /** The lines `node` holds of its own, those `contentOf` gives the content of. */
  ownLines(node: OutlineNode): LineInfo[] {
    const lines: LineInfo[] = [];
    let after = false;
    for (const line of this.lines.slice(node.startLine)) {
      const owner = this.nodeAtLine(line.index);
      if (owner === node) lines.push(line);
      else if (!owner && lines.length) after = true;
      else if (owner || after) break;
    }
    return lines;
  }

  /**
   * What `node` is written as: its own lines after their containers' prefixes (an item's first line
   * after its marker), the blank lines after them (its gap), and an item's marker.
   */
  contentOf(node: OutlineNode): { lines: string[]; gap: number; marker?: string } {
    const lines: string[] = [];
    let gap = 0;
    let after = false;
    // a footnote definition's label and indentation are its own prefix piece, which its lines keep
    const own = node.kind === 'atom' && node.block.type === 'footnote_definition';
    for (const line of this.lines.slice(node.startLine)) {
      const owner = this.nodeAtLine(line.index);
      const piece = own ? line.prefix.find((p) => p.block === node.block) : undefined;
      if (owner === node) lines.push(this.text.slice(piece ? piece.from : line.contentFrom, line.to));
      else if (!owner && lines.length) {
        after = true;
        gap++;
      } else if (owner || after) break;
    }
    const marker = node.kind === 'item' ? { marker: this.text.slice(this.markerFrom(node.block), this.markerTo(node.block)) } : {};
    return { lines: lines.length || node.kind === 'quote' ? lines : [''], gap, ...marker };
  }

  /**
   * Content offsets of a node's head: from its first character to the end of its last line, or
   * for a heading, of its title (before a setext underline or a closing sequence of `#`s).
   */
  headRange(node: OutlineNode): { from: number; to: number } | null {
    if (!node.head) return null;
    const first = this.syntaxTree.line(node.head.startLine);
    const last = this.syntaxTree.line(node.head.endLine);
    let from = first.contentFrom;
    while (from < first.to && isSpaceOrTab(this.text.charCodeAt(from))) from++;
    let to = last.to;
    if (node.head.type === 'heading' && node.head.setext) to = this.syntaxTree.line(node.head.endLine - 1).to;
    else if (node.head.type === 'heading') {
      const m = /^#{1,6}[ \t]*/.exec(this.text.slice(from, first.to));
      if (m) from += m[0].length;
      const closing = /(?:^|[ \t]+)#+[ \t]*$/.exec(this.text.slice(from, to));
      if (closing) to = from + closing.index;
    }
    return { from, to };
  }
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
