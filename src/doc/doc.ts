// The document: one snapshot of a Markdown text with its placeholders, its parse, its outline and its
// config. Immutable; `update` makes the next snapshot, reading again only what the changes reach.

import { Config } from '../config.ts';
import { MdBlockAt, MdFlavor, MdTree, type MdLine } from '../parser/index.ts';
import { ChangeSet, MarkSet, advanceColumns, createPlaceholder, diffLines, heldSpaceAt, isSpaceOrTab, lineIndexAt, trimMd, type ChangeSpec, type Mark } from '../text/index.ts';
import { OutlineNode } from './node.ts';
import { Touched, readOutline, type OutlineNodePersistent } from './outline.ts';
import { validPlaceholder } from './placeholders.ts';
import { locate, type Located } from './locate.ts';
import { documentOffset, readText, stringOffset, type ReadText } from './read.ts';
import { escapeParagraph } from './escapes.ts';
import { markdownOf, markdownStart } from './copy.ts';
import { ProseText, type AtomText, type OutlineNodeText } from './text.ts';

/**
 * What an update is told besides its changes. The placeholders: a host's edit maps them through its
 * changes, dropping some and adding others; a writer's edit (or an undo) gives the whole set.
 */
export interface DocUpdateParams {
  /** A host's edit: placeholders to drop, in this snapshot's offsets. */
  readonly dropMarks?: readonly Mark[];
  /** A host's edit: placeholders to add, in the new text's offsets. */
  readonly addMarks?: readonly Mark[];
  /** A writer's edit, an undo: every placeholder, in the new text's offsets, instead of this snapshot's mapped. */
  readonly setMarks?: readonly Mark[];
  /**
   * Where the caret is after a host's edit: where a deletion would change the outline there (emptying
   * a node, widening an item's padding), a placeholder at the caret keeps it.
   */
  readonly caret?: number;
  /** A writer's edit: the id of each node it wrote or moved, by where it starts in the new text. */
  readonly identity?: ReadonlyMap<number, number>;
  /** A writer's edit: the lineage's next id at least this (a draft reserved the ids below it for its new nodes). */
  readonly nextId?: number;
}

export class OurusDoc {
  /** The text; an update applies its changes to it and to `marks`. */
  readonly text: string;
  /** The placeholders, in `text`'s offsets. */
  readonly marks: MarkSet;
  /** The parse, with the placeholders read as sentinels. */
  readonly mdTree: MdTree;
  /** Carried for the commands; reading uses `config.flavor` only. */
  readonly config: Config;
  /** The outline, stored: shared with every snapshot whose nodes an edit didn't reach. */
  readonly root: OutlineNodePersistent;
  /** The next id to give in this lineage. */
  readonly nextId: number;
  #rootNode: OutlineNode | null = null;
  #byId: Map<number, OutlineNode> | null = null;

  private constructor(text: string, marks: MarkSet, mdTree: MdTree, config: Config, root: OutlineNodePersistent, nextId: number) {
    this.text = text;
    this.marks = marks;
    this.mdTree = mdTree;
    this.config = config;
    this.root = root;
    this.nextId = nextId;
  }

  static parse(text: string, options: { readonly config?: Partial<Config>; readonly marks?: readonly Mark[] } = {}): OurusDoc {
    const config = Config.of(options.config);
    const flavor = MdFlavor.named(config.flavor);
    const [marks, tree] = read(MarkSet.of(options.marks ?? []), (sentinels) => MdTree.parse(text, flavor, { sentinels }));
    const { root, nextId } = readOutline(tree, null, Touched.none);
    return new OurusDoc(text, marks, tree, config, root, nextId);
  }

  /** The snapshot after `changes`, in this document's offsets, its placeholders changed as `params` says. */
  update(changes: readonly ChangeSpec[], params: DocUpdateParams = {}): OurusDoc {
    const set = ChangeSet.of(changes, this.text.length);
    const text = set.apply(this.text);
    let candidates: MarkSet;
    if (params.setMarks) {
      if (params.addMarks || params.dropMarks) throw new Error('setMarks gives every placeholder: no addMarks or dropMarks with it');
      candidates = MarkSet.of(params.setMarks);
    } else {
      const drop = params.dropMarks ?? [];
      const kept = drop.length ? this.marks.update({ filter: (m) => !drop.some((d) => d.kind === m.kind && d.from === m.from && d.to === m.to) }) : this.marks;
      const add = [...(params.addMarks ?? [])];
      if (params.caret !== undefined && this.keptAt(set, text, params.caret)) add.push(createPlaceholder(params.caret));
      candidates = kept.map(set).update({ add });
    }
    const old = this.mdTree;
    const [marks, tree] = read(candidates, (sentinels) => old.update(set.changes, { sentinels }));
    const touched = touchedLines(tree, set, this.marks.map(set), marks);
    const { root, nextId } = readOutline(tree, { tree: old, root: this.root, changes: set.changes, nextId: Math.max(this.nextId, params.nextId ?? 0), startOf: (id) => this.node(id)?.startLine }, touched, params.identity);
    return new OurusDoc(text, marks, tree, this.config, root, nextId);
  }

  /**
   * The snapshot with `text` in place of this one's (the file changed elsewhere), `marks` its
   * placeholders: the lines that differ read again, as changes.
   */
  replace(text: string, marks: readonly Mark[]): OurusDoc {
    return this.update(diffLines(this.text, text), { setMarks: marks });
  }

  /** The blank lines before the first node (all of the document's, where it has none): how many; null where another line is there (frontmatter). */
  get leadingBlankLines(): number | null {
    const end = this.root.children.length ? this.root.offsets[0]! : this.mdTree.lineCount;
    for (let i = 0; i < end; i++) if (!this.mdTree.line(i).blank) return null;
    return end;
  }

  /** The outline's root, positioned. */
  get rootNode(): OutlineNode {
    return (this.#rootNode ??= new OutlineNode(this.root, 0, null, 0));
  }

  /** The node with id `id` (an index of every node, made on the first call: off the hot paths). */
  node(id: number): OutlineNode | undefined {
    if (!this.#byId) {
      const byId = (this.#byId = new Map());
      const visit = (node: OutlineNode): void => {
        byId.set(node.id, node);
        node.children.forEach(visit);
      };
      visit(this.rootNode);
    }
    return this.#byId.get(id);
  }

  /**
   * `node`'s text: its own lines past their containers' prefixes, its frame and its placeholders; null
   * for a node with no text (the root, a quote with no title, an item whose first block is a quote or a
   * list on its line). Read once per stored node: every snapshot sharing the node has its text.
   */
  textOf(node: OutlineNode): OutlineNodeText | null {
    const p = node.persistentNode;
    let text = texts.get(p);
    if (text === undefined) texts.set(p, (text = this.#read(node)?.text ?? null));
    return text;
  }

  /** Where offset `offset` of `node`'s text is in the document; at characters left out of it, `assoc` picks the side. */
  posOf(node: OutlineNode, offset: number, assoc: -1 | 1 = 1): number {
    const read = this.#read(node);
    if (!read) throw new RangeError(`the ${node.kind} at line ${node.startLine} has no text`);
    let k = offset;
    for (const line of read.lines) {
      if (k <= line.length) return documentOffset(line, k, assoc);
      k -= line.length + 1;
    }
    throw new RangeError(`offset ${offset} past the text of the ${node.kind} at line ${node.startLine}`);
  }

  /** The offset in `node`'s text of document position `pos` on one of its text's lines. */
  offsetOf(node: OutlineNode, pos: number): number {
    const read = this.#read(node);
    if (!read) throw new RangeError(`the ${node.kind} at line ${node.startLine} has no text`);
    let base = 0;
    const text = this.text;
    for (const line of read.lines) {
      if (pos >= line.from && pos <= line.to) return base + Math.max(0, stringOffset(line, pos));
      // before the line's first character, on its document line (its content's padding): its start
      if (pos < line.from && !/[\r\n]/.test(text.slice(pos, line.from))) return base;
      base += line.length + 1;
    }
    throw new RangeError(`position ${pos} isn't on the text of the ${node.kind} at line ${node.startLine}`);
  }

  /** Where `pos` is: in a node's text or its frame, in a marker or a prefix, a blank line's gap, the preamble, or no line (`locate.ts`). */
  locate(pos: number): Located {
    return locate(this, pos);
  }

  #reads = new WeakMap<OutlineNode, ReadText | null>();

  #read(node: OutlineNode): ReadText | null {
    let read = this.#reads.get(node);
    if (read === undefined) this.#reads.set(node, (read = readText(this.mdTree, this.marks, node)));
    return read;
  }

  /**
   * `lines` (a paragraph's text, past their containers' prefix) as Markdown at a block's start, in
   * this document's flavor: the backslashes that keep them its text in; null where none does.
   */
  escapeParagraph(lines: readonly string[]): string[] | null {
    const spelled = escapeParagraph(this.mdTree.flavor, 'paragraph', false, lines, lines.map(() => false));
    if (!spelled) return null;
    return spelled.lines.map((l, k) => {
      let out = l;
      for (const m of spelled.markup.filter((e) => e.line === k).reverse()) out = out.slice(0, m.at) + '\\' + out.slice(m.at);
      return out;
    });
  }

  /** The code span `pos` is inside (past its opening backtick): where its closing run starts and where it ends; null outside one. */
  codeSpanAt(pos: number): { readonly closer: number; readonly to: number } | null {
    return this.mdTree.codeSpanAt(pos);
  }

  /**
   * The spaces Markdown hides before `node`'s text on its first line: an item's padding past the space
   * after its marker (or a checkbox's blanks past one), a paragraph's indentation. `[from, to)` in the
   * text, or null where there are none (a held space isn't one). They are the user's whitespace, not
   * markup: a join gives them back as spaces (a split keeps them so, with `enterSplitSpace: start`).
   */
  hiddenSpaces(node: OutlineNode): { readonly from: number; readonly to: number } | null {
    const text = this.textOf(node);
    if (!(text instanceof ProseText) || text.type !== 'paragraph' || (node.kind !== 'item' && node.kind !== 'paragraph')) return null;
    // (before a text: an empty one has trailing blanks)
    if (text.empty) return null;
    const task = text.frame.find((p) => p.part === 'task');
    const below = text.frame.find((p) => p.part === 'below');
    let from: number;
    // (a text below its marker: on its first line of text)
    if (below) from = this.mdTree.line(node.textFirstLine).contentFrom;
    else if (task) from = this.posOf(node, task.from + 4, 1);
    else if (node.kind === 'item') from = this.mdTree.line(node.startLine).from + node.block.attrs.markerEnd! + 1;
    else from = this.mdTree.line(node.textFirstLine).contentFrom;
    // (up to the text, or a markup escape it starts with)
    const end = this.posOf(node, text.textStart(0), 1);
    let to = from;
    while (to < end && this.text[to] === ' ' && !heldSpaceAt(this.marks, this.text, to)) to++;
    // (three columns at most: four are no padding, as after a definition a paragraph's lazy line)
    return to > from && to - from <= 3 && (to === end || this.text[to] === '\\') ? { from, to } : null;
  }

  /** An item's marker as written (`-`, `1.`). */
  markerOf(item: OutlineNode): string {
    const at = new MdBlockAt(item.block, item.startLine);
    return this.text.slice(this.mdTree.markerFrom(at), this.mdTree.markerTo(at));
  }

  /** How many lines the text has. */
  get lineCount(): number {
    return this.mdTree.lineCount;
  }

  /** The line `pos` is on: its index, where it starts and ends (before its line ending). */
  lineAt(pos: number): { readonly index: number; readonly from: number; readonly to: number } {
    if (!this.mdTree.lineCount) return { index: 0, from: 0, to: 0 };
    const line = this.mdTree.line(lineIndexAt(this.mdTree.starts, pos));
    return { index: line.index, from: line.from, to: line.to };
  }

  /**
   * Where the text starts on line `i` (Home goes there): past its containers' prefixes, an item's
   * marker, its node's frame there (a checkbox, a heading's `#`s, a callout's `[!type]`, indented
   * code's four columns, a footnote's label) and the blanks after them, but the spaces Markdown hides
   * before a text there, which are the user's (`hiddenSpaces`); a line of no node's text past its
   * prefixes.
   */
  textStart(i: number): number {
    const line = this.mdTree.line(i);
    const node = this.nodeAtLine(i);
    const text = node && this.textOf(node);
    if (!node || !text) return line.contentFrom;
    const hidden = this.hiddenSpaces(node);
    if (hidden && this.lineAt(hidden.from).index === i) return hidden.from;
    const k = i - this.lineAt(this.posOf(node, 0)).index;
    const lines = text.text.split('\n');
    if (k < 0 || k >= lines.length) return line.contentFrom;
    const from = lines.slice(0, k).reduce((n, l) => n + l.length + 1, 0);
    // (code: past what starts its line but a fence, indented code's columns or a footnote's label)
    let at = text instanceof ProseText ? text.textStart(k) : (text.frame.find((p) => p.from === from && (p.part === 'indent' || p.part === 'label'))?.to ?? from);
    // (on a marker's line its text starts below: at the line's end)
    at = Math.min(at, from + lines[k]!.length);
    // (a later line of a text keeps its spaces as text, the user's whitespace, as Markdown hides them
    // on the first: ShiftEnter1)
    if (!(k > 0 && text instanceof ProseText)) while (at < from + lines[k]!.length && isSpaceOrTab(text.text.charCodeAt(at))) at++;
    // past the blanks Markdown leaves out of the text there, before an escape's backslash
    let pos = this.posOf(node, at, -1);
    const end = this.posOf(node, at, 1);
    while (pos < end && isSpaceOrTab(this.text.charCodeAt(pos))) pos++;
    return pos;
  }

  /** Whether line `i` holds nothing past its containers' prefix (a blank line, in a quote `>`); false past the last line. */
  isBlankLine(i: number): boolean {
    if (i < 0 || i >= this.mdTree.lineCount) return false;
    const line = this.mdTree.line(i);
    return trimMd(this.text.slice(line.contentFrom, line.to)) === '';
  }

  /** Whether line `i` is whitespace only, without even its containers' markers (a quote's `>` line isn't). */
  isEmptyLine(i: number): boolean {
    return i >= 0 && i < this.mdTree.lineCount && this.mdTree.line(i).blank;
  }

  /**
   * Whether `pos` is on a blank line at the column `node`'s text starts at: past its line's prefix, as
   * a line of the text would start (the line Shift-Enter makes at a text's end), not at a blank line's
   * start where the text's column is further in. (A node with no text has no column: false.)
   */
  atTextColumn(pos: number, node: OutlineNode): boolean {
    if (!this.textOf(node)) return false;
    const line = this.mdTree.line(lineIndexAt(this.mdTree.starts, pos));
    const first = this.mdTree.line(node.textFirstLine);
    if (trimMd(this.text.slice(line.from, line.to).replace(/^[ \t>]*/, '')) !== '' || pos !== line.to) return false;
    // (in the quotes the text is in: as many `>` as they are)
    let quotes = 0;
    for (let up: OutlineNode | null = node; up; up = up.parent) if (up.kind === 'quote') quotes++;
    if ((this.text.slice(line.from, line.to).match(/>/g)?.length ?? 0) !== quotes) return false;
    const column = (l: MdLine, at: number): number => advanceColumns(this.text, l.from, at, 0);
    return column(line, pos) === column(first, this.posOf(node, 0, -1));
  }

  /** Whether line `i` continues a paragraph lazily (without its containers' prefix). */
  isLazyLine(i: number): boolean {
    return i >= 0 && i < this.mdTree.lineCount && this.mdTree.line(i).lazy;
  }

  /** Where `node`'s lines are in the text, its descendants' too: from its first line's start to its last line's end (before its line ending). */
  rangeOf(node: OutlineNode): { readonly from: number; readonly to: number } {
    return { from: this.mdTree.starts[node.startLine]!, to: this.mdTree.line(node.endLine).to };
  }

  /** Whether the document holds nothing but blank lines. */
  get blank(): boolean {
    return trimMd(this.text) === '';
  }

  /** The list an item is in, as the parser reads it (its `tight`, its first item's `list`, its items). */
  listOf(item: OutlineNode): MdBlockAt | null {
    if (item.kind !== 'item') return null;
    // (the list is open around the item on its first line)
    const containers = this.mdTree.line(item.startLine).containers;
    return containers[containers.findIndex((c) => c.block === item.block) - 1] ?? null;
  }

  /** The Markdown of `from`–`to` as written, out of the containers holding all of it (`copy.ts`): what a copy writes. */
  markdownOf(from: number, to: number): string {
    return markdownOf(this, from, to);
  }

  /** Where `node`'s own Markdown starts: an item at its marker, a quote at its `>`, else past its containers' prefix. */
  markdownStart(node: OutlineNode): number {
    return markdownStart(this, node);
  }

  /** Whether an atom text's lines, alone, read as one block of its type, closed as it is, in this document's flavor. */
  readsAs(text: AtomText): boolean {
    const lines = text.text.split('\n');
    // (an empty last line, a code line, read as one: a final line ending starts none)
    const source = lines.join('\n');
    const root = MdTree.parse(source, this.mdTree.flavor, lines[lines.length - 1] === '' && lines.length > 1 ? { sentinels: [source.length] } : {}).root;
    const n = root.children.length;
    const block = root.children[n - 1];
    if (!block || n > 1 || root.offsets[0]! + block.lines < lines.length) return false;
    const type = block.type === 'code_block' ? (block.attrs.fenced ? 'fenced_code' : 'indented_code') : block.type;
    // (indented code can't start with a blank line: it would be the gap above it)
    return type === text.type && (type !== 'fenced_code' || !!block.attrs.closed === text.closed) && (type !== 'indented_code' || root.offsets[0] === 0);
  }

  /** The node whose own text holds line `line`: the deepest, where nested items share a line; null on blank lines and the preamble. */
  nodeAtLine(line: number): OutlineNode | null {
    return this.rootNode.nodeAtLine(line);
  }

  /**
   * Whether a placeholder at `caret`, in the text after `changes`, keeps the outline a deletion would
   * otherwise change: the deletion emptied a node (the caret at its line's end) or widened an item's
   * padding (the caret on the space now after its marker), and read with a placeholder there the
   * outline has the shape it had, each node's text the same kind of block (`-  ``` x` is code).
   * Typing never makes one: what is typed is text.
   */
  private keptAt(changes: ChangeSet, text: string, caret: number): boolean {
    if (!changes.changes.some((change) => change.to > change.from)) return false;
    // only a line's end or a space can be a placeholder: no need to read the text for anything else
    if (caret < 0 || caret > text.length) return false;
    const c = text.charCodeAt(caret);
    if (caret < text.length && !isSpaceOrTab(c) && c !== 10 && c !== 13) return false;
    const held = this.update(changes.changes, { setMarks: [createPlaceholder(caret)] });
    if (held.marks.size === 0) return false;
    const before = shape(this.root);
    return shape(this.update(changes.changes, { setMarks: [] }).root) !== before && shape(held.root) === before;
  }
}

/** Each stored node's text, read once: valid in every snapshot that shares the node, whose lines are the same. */
const texts = new WeakMap<OutlineNodePersistent, OutlineNodeText | null>();

/**
 * The text read with `marks` as sentinels, keeping the marks that hold: one that doesn't is dropped,
 * and the lines read again without it, until every one holds.
 */
function read(marks: MarkSet, parse: (sentinels: readonly number[]) => MdTree): [MarkSet, MdTree] {
  let tree = parse(marks.points());
  for (;;) {
    const valid = marks.update({ filter: (m) => validPlaceholder(tree, m) });
    if (valid === marks) return [marks, tree];
    marks = valid;
    tree = tree.update([], { sentinels: valid.points() });
  }
}

/**
 * The lines of the new text no old node is taken whole on: the lines the changes wrote; the lines of
 * placeholders that came or went (`-  x` and `- ◌ x` can share their records, not their reading).
 * (`readOutline` adds the lines where `identity` moves an id.)
 */
function touchedLines(tree: MdTree, changes: ChangeSet, mapped: MarkSet, marks: MarkSet): Touched {
  if (tree.lineCount === 0) return Touched.none;
  const line = (pos: number): number => lineIndexAt(tree.starts, pos);
  const ranges: [number, number][] = [];
  let delta = 0;
  for (const c of changes.changes) {
    const from = c.from + delta;
    ranges.push([line(from), line(from + c.insert.length)]);
    delta += c.insert.length - (c.to - c.from);
  }
  const key = (m: Mark): string => `${m.kind}@${m.from}`;
  const before = new Set(mapped.marks.map(key));
  const after = new Set(marks.marks.map(key));
  for (const m of mapped.marks) if (!after.has(key(m))) ranges.push([line(m.from), line(m.from)]);
  for (const m of marks.marks) if (!before.has(key(m))) ranges.push([line(m.from), line(m.from)]);
  return Touched.of(ranges);
}

/** The outline's shape: each node's depth, kind and the kind of block its text is (an emptied node's reads as a paragraph's). */
function shape(root: OutlineNodePersistent): string {
  const out: string[] = [];
  const visit = (node: OutlineNodePersistent, depth: number): void => {
    out.push(`${depth}:${node.kind}:${node.head?.type ?? 'paragraph'}`);
    for (const child of node.children) visit(child, depth + 1);
  };
  visit(root, 0);
  return out.join(',');
}
