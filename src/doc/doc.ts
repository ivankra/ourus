// The document: one snapshot of a Markdown text with its placeholders, its parse, its outline and its
// config. Immutable; `update` makes the next snapshot, reading again only what the changes reach.

import { OurusConfig } from '../config.ts';
import { MdBlockAt, MdFlavor, MdTree, type MdLine } from '../parser/index.ts';
import { ChangeSet, MarkSet, advanceColumns, createPlaceholder, diffLines, heldSpaceAt, isSpaceOrTab, lineIndexAt, trimMd, type ChangeSpec, type Mark, type OurusSelection } from '../text/index.ts';
import { OurusNode, type PersistentNode } from './node.ts';
import { Touched, readOutline } from './outline.ts';
import { validPlaceholder } from './placeholders.ts';
import { locate, type Located } from './locate.ts';
import { documentOffset, readText, stringOffset, type ReadText } from './read.ts';
import { escapeParagraph } from './escapes.ts';
import { markdownOf, markdownStart } from './copy.ts';
import { OurusProse, textEnd, type OurusAtom, type OurusText } from './text.ts';
import { readBlockIds, type BlockId } from './block-ids.ts';
import { listAdopters } from './rules.ts';
import { selectedNodes, subtreesSelection, touchedNodes } from './select.ts';
import { NO_VIEW, carryView, coverEnd, foldRange, isHidden, startingAt, viewByLine, viewIn, zoomEscape, zoomFolded, zoomRange, type ViewState } from './view.ts';

/**
 * An update (`OurusDoc.update`): its changes, and its placeholders. A host's edit maps them through
 * its changes, dropping some and adding others; a writer's edit (or an undo) gives the whole set.
 */
export interface OurusDocUpdate {
  /** The text's changes, in this snapshot's offsets; none by default. */
  readonly changes?: readonly ChangeSpec[];
  /**
   * The new text whole, instead of `changes` (the file changed elsewhere): its changes are the lines
   * that differ.
   */
  readonly text?: string;
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
}

/**
 * The id counter shared by every snapshot of one document: the one `OurusDoc.parse` returns and
 * every snapshot derived from it (updates, drafts, `with…` copies; `isSameLineage`). Each id is
 * handed out once, so a snapshot brought back later (an undo's) never shares an id with a node
 * created since. The root's id is always `ROOT`.
 */
export class Lineage {
  /** The root's id, the same in every snapshot; every other node's is past it. */
  static readonly ROOT = 0;

  #next = Lineage.ROOT + 1;

  /** The next id to give. */
  get next(): number {
    return this.#next;
  }

  /** A new id. */
  take(): number {
    return this.#next++;
  }
}

/**
 * A Markdown document read as an outline: its text, placeholders, parse, outline and config, and
 * the view's folds and zoom. Make one with `parse`; it is immutable, and `update` returns the
 * next snapshot. Get its nodes from `rootNode`, `node(id)` and `nodeAtLine`, and a node's text
 * from `textOf`.
 *
 * Internally, `update` reads again only the blocks the changes reach and shares the rest of the
 * outline (`PersistentNode`s) with the snapshot before; node ids carry over. Snapshots of one
 * document share a `Lineage`, the one mutable part, which gives each new id once.
 */
export class OurusDoc {
  /** The text; an update applies its changes to it and to `marks`. */
  readonly text: string;
  /** The placeholders, in `text`'s offsets. */
  readonly marks: MarkSet;
  /** The parse, with the placeholders read as sentinels. */
  readonly mdTree: MdTree;
  /** Carried for the commands; reading uses `config.flavor`, `config.quotes` and `config.listParent` only. */
  readonly config: OurusConfig;
  /** The outline, stored: shared with every snapshot whose nodes an edit didn't reach. */
  readonly root: PersistentNode;
  /** Its lineage's ids (`isSameLineage`), which the writer's drafts take theirs from too. */
  readonly lineage: Lineage;
  /** The lineage's next id when this outline was read: a node with an id past it was made since. */
  readonly nextId: number;
  /** The nodes whose children the view hides: a view's, not the text's. */
  readonly folded: ReadonlySet<number>;
  /** The node the view is zoomed into; null: the whole document. */
  readonly zoom: number | null;
  #rootNode: OurusNode | null = null;
  #byId: Map<number, OurusNode> | null = null;
  #blockIds: readonly BlockId[] | null = null;
  #zoomFolded: ReadonlySet<number> | null = null;
  #lastRead: SelectionRead | null = null;

  private constructor(text: string, marks: MarkSet, mdTree: MdTree, config: OurusConfig, root: PersistentNode, lineage: Lineage, nextId: number, view: ViewState = NO_VIEW) {
    this.text = text;
    this.marks = marks;
    this.mdTree = mdTree;
    this.config = config;
    this.root = root;
    this.lineage = lineage;
    this.nextId = nextId;
    this.folded = view.folded;
    this.zoom = view.zoom;
  }

  /** Parses `text`. Options missing from `config` take defaults; `marks` are its placeholders. */
  static parse(text: string, options: { readonly config?: Partial<OurusConfig>; readonly marks?: readonly Mark[] } = {}): OurusDoc {
    return OurusDoc.#readWhole(text, OurusConfig.of(options.config), options.marks ?? [], new Lineage());
  }

  /** `text` read whole, its new ids `lineage`'s. */
  static #readWhole(text: string, config: OurusConfig, marks: readonly Mark[], lineage: Lineage): OurusDoc {
    const [held, tree] = read(MarkSet.of(marks), (sentinels) => MdTree.parse(text, MdFlavor.named(config.flavor), { sentinels }));
    const root = readOutline(tree, lineage, null, Touched.none, undefined, config);
    return new OurusDoc(text, held, tree, config, root, lineage, lineage.next);
  }

  /** Whether `other` is a snapshot of this document: the same `parse`'s, through any updates. */
  isSameLineage(other: OurusDoc): boolean {
    return other.lineage === this.lineage;
  }

  /** The snapshot after `params.changes`, its placeholders changed as `params` says. */
  update(params: OurusDocUpdate = {}): OurusDoc {
    if (params.text !== undefined && params.changes) throw new Error('text gives the changes: no changes with it');
    const set = ChangeSet.of(params.text !== undefined ? diffLines(this.text, params.text) : (params.changes ?? []), this.text.length);
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
    const root = readOutline(tree, this.lineage, { tree: old, root: this.root, changes: set.changes, startOf: (id) => this.node(id)?.startLine }, touched, params.identity, this.config);
    const next = new OurusDoc(text, marks, tree, this.config, root, this.lineage, this.lineage.next);
    // the view carried, a writer's edit as any: a fold opened where what it hides changed, the zoom
    // ended where a node left it
    return next.#withView(viewIn(next, carryView(this, next, set.changes)));
  }

  /**
   * This snapshot (its text, nodes, ids and marks) with the folds and zoom of `view`, another
   * snapshot of its lineage, carried onto it by id through `changes` (`view`'s text to this one's;
   * by default, the lines that differ), as an update carries them. A second pane takes the snapshot
   * a first made, rather than replaying its changes, whose replay would give the nodes the writer
   * moved new ids; an undo takes back the snapshot from before the step, its nodes and all, an undone
   * move's node with its fold (`like.withConfig(doc.config).withViewOf(doc)`). Throws for a
   * snapshot of another lineage.
   */
  withViewOf(view: OurusDoc, changes: readonly ChangeSpec[] = diffLines(view.text, this.text)): OurusDoc {
    if (!this.isSameLineage(view)) throw new Error('withViewOf: a snapshot of another lineage');
    return this.#withView(viewIn(this, carryView(view, this, changes)));
  }

  /**
   * The same document under other options (a host's setting changed): `config` over this one's. An
   * option that says only how commands write (`indentUnit`, `markup`, ...) changes on the same
   * snapshot, its outline and ids shared; `quotes` and `listParent`, which change how the text reads,
   * have the outline read again from the same parse, ids carried as an update carries them; `flavor`,
   * which changes the parse, reads the text anew, its ids anew too.
   */
  withConfig(config: Partial<OurusConfig>): OurusDoc {
    const next = OurusConfig.of({ ...this.config, ...config });
    // (no option changed: this snapshot, so an undo takes one from before it back as it is)
    if (OurusConfig.same(next, this.config)) return this;
    if (next.flavor !== this.config.flavor) {
      const marks: Mark[] = [];
      this.marks.between(0, this.text.length, (m) => void marks.push(m));
      // read anew, the ids anew (the lineage's still): the folds and the zoom go by line
      const parsed = OurusDoc.#readWhole(this.text, next, marks, this.lineage);
      return parsed.#withView(viewByLine(this, parsed, this));
    }
    if (next.quotes === this.config.quotes && next.listParent === this.config.listParent) return new OurusDoc(this.text, this.marks, this.mdTree, next, this.root, this.lineage, this.nextId, this);
    const previous = { tree: this.mdTree, root: this.root, changes: [], startOf: (id: number) => this.node(id)?.startLine, regroup: true };
    const root = readOutline(this.mdTree, this.lineage, previous, Touched.of([[0, this.mdTree.lineCount]]), undefined, next);
    const read = new OurusDoc(this.text, this.marks, this.mdTree, next, root, this.lineage, this.lineage.next);
    return read.#withView(viewIn(read, this));
  }

  /** The same document with these folds (an id that isn't a node here, or has no children to hide, dropped). */
  withFolded(ids: Iterable<number>): OurusDoc {
    return this.#withView(viewIn(this, { folded: new Set(ids), zoom: this.zoom }));
  }

  /** The same document zoomed into node `id`, or not zoomed (null); no fold changes. Throws where `id` is no node here, or the root. */
  withZoom(id: number | null): OurusDoc {
    if (id !== null && (this.node(id)?.kind ?? 'root') === 'root') throw new Error(`no node ${id} to zoom into`);
    return this.#withView({ folded: this.folded, zoom: id });
  }

  /** The folds in effect within the zoom: those of the nodes strictly inside its root; all of `folded` where not zoomed. */
  get zoomFolded(): ReadonlySet<number> {
    return (this.#zoomFolded ??= zoomFolded(this));
  }

  /** What folding `node` hides, in offsets: from the end of its text to the end of its subtree's last line; null where it doesn't fold. */
  foldRange(node: OurusNode): { from: number; to: number } | null {
    return foldRange(this, node);
  }

  /** The node a row's fold is: the outermost starting on `line`; null where none starts there. */
  rowOwner(line: number): OurusNode | null {
    return startingAt(this, line)[0] ?? null;
  }

  /** What the zoom shows, in offsets: its root's lines, its descendants' and its trailing gap; null where not zoomed. */
  zoomRange(): { from: number; to: number } | null {
    return zoomRange(this);
  }

  /** A node's last line with its descendants' and the blank lines after them, up to the next node not its own. */
  coverEnd(node: OurusNode): number {
    return coverEnd(this, node);
  }

  /** Whether the view hides `node`: under a fold in effect (`zoomFolded`), or outside the zoom. */
  isHidden(node: OurusNode): boolean {
    return isHidden(this, node);
  }

  /**
   * Where `next`, a later snapshot of this lineage, leaves this one's zoom: what went outside it, or
   * null where it keeps it (or isn't zoomed). `removed`: the zoom root went whole, its subtree with it.
   */
  zoomEscape(next: OurusDoc, removed = false): string | null {
    return zoomEscape(this, next, removed);
  }

  /**
   * The subtrees a selection touches: the topmost nodes whose own lines it touches, in document order,
   * at whatever depths, a caret's node too (the innermost where nodes share a line, `- - a`); a blank
   * line the gap of the node above it. What a key acts on (Tab with a caret indents its item). None
   * only where there is no node to touch (the blank lines before the first, an empty document).
   */
  touchedSubtrees(selection: OurusSelection): readonly number[] {
    return this.touchedNodes(selection).map((n) => n.id);
  }

  /**
   * The roots of a subtree selection, the selection that is exactly their subtrees as whole lines:
   * from column 0 of the first's first line to the start of the line after the last's subtree (the
   * canonical shape, `selectionOf`'s), its last line's end, or the end of the blank lines after it;
   * where nodes share those lines, the outermost inside the zoom, wherever they are (a select all of a
   * document that is its nodes only is them). Null for any other selection: a caret, text, one node's
   * own text (but at the document's end, where it is the node too). What a host draws as blocks.
   */
  selectedSubtrees(selection: OurusSelection): readonly number[] | null {
    return this.selectedNodes(selection)?.map((n) => n.id) ?? null;
  }

  /**
   * The selection of the subtrees of `ids` as whole lines: from column 0 of the first's first line to
   * the start of the line after the last line of any of them (or the document's end), everything
   * between included; the anchor at the top unless `direction` is `up`. Throws for no ids, an id the
   * document doesn't have, the root, an id outside the zoom or one a fold hides.
   */
  selectionOf(ids: readonly number[], direction: 'down' | 'up' = 'down'): OurusSelection {
    const nodes = ids.map((id) => {
      const node = this.node(id);
      if (!node) throw new Error(`no node ${id} to select`);
      return node;
    });
    return subtreesSelection(this, nodes, direction);
  }

  /** `touchedSubtrees`, as nodes. */
  touchedNodes(selection: OurusSelection): readonly OurusNode[] {
    const read = this.#readOf(selection);
    return (read.touched ??= touchedNodes(this, selection));
  }

  /** `selectedSubtrees`, as nodes. */
  selectedNodes(selection: OurusSelection): readonly OurusNode[] | null {
    const read = this.#readOf(selection);
    if (read.selected === undefined) read.selected = selectedNodes(this, selection);
    return read.selected;
  }

  /** What this snapshot read of `selection` (the last selection asked about only). */
  #readOf(selection: OurusSelection): SelectionRead {
    const last = this.#lastRead;
    if (last && last.anchor === selection.anchor && last.head === selection.head) return last;
    return (this.#lastRead = { anchor: selection.anchor, head: selection.head });
  }

  /** This snapshot with another view: the text, parse, outline and their indexes shared. */
  #withView(view: ViewState): OurusDoc {
    if (view.folded === this.folded && view.zoom === this.zoom) return this;
    const doc = new OurusDoc(this.text, this.marks, this.mdTree, this.config, this.root, this.lineage, this.nextId, view);
    doc.#rootNode = this.#rootNode;
    doc.#byId = this.#byId;
    doc.#blockIds = this.#blockIds;
    return doc;
  }

  /** The blank lines before the first node (all of the document's, where it has none): how many; null where another line is there (frontmatter). */
  get leadingBlankLines(): number | null {
    const end = this.root.children.length ? this.root.offsets[0]! : this.mdTree.lineCount;
    for (let i = 0; i < end; i++) if (!this.mdTree.line(i).blank) return null;
    return end;
  }

  /** The outline's root, positioned. */
  get rootNode(): OurusNode {
    return (this.#rootNode ??= new OurusNode(this.root, 0, null, 0));
  }

  /** The node with id `id` (an index of every node, made on the first call: off the hot paths). */
  node(id: number): OurusNode | undefined {
    if (!this.#byId) {
      const byId = (this.#byId = new Map());
      const visit = (node: OurusNode): void => {
        byId.set(node.id, node);
        node.children.forEach(visit);
      };
      visit(this.rootNode);
    }
    return this.#byId.get(id);
  }

  /**
   * Every block id written in the document, in order, stray ones included (`block-ids.ts`): the node
   * it is written on, what its flavor names by it, whether another one for the same is the one that
   * counts, and why a stray one's target is no node it is written on. Read on the first call. A link
   * to a node uses the one not shadowed whose target is that node.
   */
  blockIds(): readonly BlockId[] {
    return (this.#blockIds ??= readBlockIds(this));
  }

  /**
   * `node`'s text: its own lines past their containers' prefixes, its frame and its placeholders; null
   * for a node with no text (the root, a quote with no title, an item whose first block is a quote or a
   * list on its line). Read once per stored node: every snapshot sharing the node has its text.
   */
  textOf(node: OurusNode): OurusText | null {
    const p = node.persistentNode;
    let text = texts.get(p);
    if (text === undefined) texts.set(p, (text = this.#read(node)?.text ?? null));
    return text;
  }

  /** Where offset `offset` of `node`'s text is in the document; at characters left out of it, `assoc` picks the side. */
  posOf(node: OurusNode, offset: number, assoc: -1 | 1 = 1): number {
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
  offsetOf(node: OurusNode, pos: number): number {
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

  #reads = new WeakMap<OurusNode, ReadText | null>();

  #read(node: OurusNode): ReadText | null {
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
  hiddenSpaces(node: OurusNode): { readonly from: number; readonly to: number } | null {
    const text = this.textOf(node);
    if (!(text instanceof OurusProse) || text.type !== 'paragraph' || (node.kind !== 'item' && node.kind !== 'paragraph')) return null;
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
  markerOf(item: OurusNode): string {
    const at = new MdBlockAt(item.block, item.startLine);
    return this.text.slice(this.mdTree.markerFrom(at), this.mdTree.markerTo(at));
  }

  /** How many lines the text has. */
  get lineCount(): number {
    return this.mdTree.lineCount;
  }

  /**
   * The line `pos` is on: its index, where it starts and ends (before its line ending). Past a final
   * line ending, where an editor has an empty last line, this is the line before it (`pos > to`); in an
   * empty text, line 0 at 0.
   */
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
    if (!this.mdTree.lineCount) return 0;
    const line = this.mdTree.line(i);
    const node = this.nodeAtLine(i);
    const text = node && this.textOf(node);
    if (!node || !text) return line.contentFrom;
    // (a block-id line its text carries: under `decorated`, where the caret stays out of it, the end
    // of the text; else past its indentation)
    if (i > node.textLastLine) return this.config.markup === 'decorated' ? this.posOf(node, textEnd(text), -1) : line.contentFrom + /^[ \t]*/.exec(this.text.slice(line.contentFrom, line.to))![0].length;
    const hidden = this.hiddenSpaces(node);
    if (hidden && this.lineAt(hidden.from).index === i) return hidden.from;
    const k = i - this.lineAt(this.posOf(node, 0)).index;
    const lines = text.text.split('\n');
    if (k < 0 || k >= lines.length) return line.contentFrom;
    const from = lines.slice(0, k).reduce((n, l) => n + l.length + 1, 0);
    // (code: past what starts its line but a fence, indented code's columns or a footnote's label)
    let at = text instanceof OurusProse ? text.textStart(k) : (text.frame.find((p) => p.from === from && (p.part === 'indent' || p.part === 'label'))?.to ?? from);
    // (on a marker's line its text starts below: at the line's end)
    at = Math.min(at, from + lines[k]!.length);
    // (a later line of a text keeps its spaces as text, the user's whitespace, as Markdown hides them
    // on the first: ShiftEnter1)
    if (!(k > 0 && text instanceof OurusProse)) while (at < from + lines[k]!.length && isSpaceOrTab(text.text.charCodeAt(at))) at++;
    // past the blanks Markdown leaves out of the text there, before an escape's backslash
    let pos = this.posOf(node, at, -1);
    const end = this.posOf(node, at, 1);
    while (pos < end && isSpaceOrTab(this.text.charCodeAt(pos))) pos++;
    return pos;
  }

  /**
   * Whether `node` adopts the list right after it (`OurusConfig.listParent`): a node of the kinds
   * that do, in the document's own sections (the root's, a heading's), not in an item or a quote.
   */
  adoptsLists(node: OurusNode): boolean {
    return listAdopters(this.config.listParent).has(node.kind) && (node.parent?.ownsLists ?? false);
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
  atTextColumn(pos: number, node: OurusNode): boolean {
    if (!this.textOf(node)) return false;
    const line = this.mdTree.line(lineIndexAt(this.mdTree.starts, pos));
    const first = this.mdTree.line(node.textFirstLine);
    if (trimMd(this.text.slice(line.from, line.to).replace(/^[ \t>]*/, '')) !== '' || pos !== line.to) return false;
    // (in the quotes the text is in: as many `>` as they are, its own too where it is a quote's)
    const text = this.textOf(node);
    const framed = text instanceof OurusProse && text.type === 'quote';
    let quotes = framed ? 1 : 0;
    for (let up: OurusNode | null = node; up; up = up.parent) if (up.kind === 'quote') quotes++;
    if ((this.text.slice(line.from, line.to).match(/>/g)?.length ?? 0) !== quotes) return false;
    const column = (l: MdLine, at: number): number => advanceColumns(this.text, l.from, at, 0);
    // (a quote's text past its `> `, where a line of it starts)
    return column(line, pos) === column(first, this.posOf(node, framed ? text.textStart(0) : 0, -1));
  }

  /** Whether line `i` continues a paragraph lazily (without its containers' prefix). */
  isLazyLine(i: number): boolean {
    return i >= 0 && i < this.mdTree.lineCount && this.mdTree.line(i).lazy;
  }

  /** Where `node`'s lines are in the text, its descendants' too: from its first line's start to its last line's end (before its line ending). */
  rangeOf(node: OurusNode): { readonly from: number; readonly to: number } {
    return { from: this.mdTree.starts[node.startLine]!, to: this.mdTree.line(node.endLine).to };
  }

  /** Whether the document holds nothing but blank lines. */
  get blank(): boolean {
    return trimMd(this.text) === '';
  }

  /** The list an item is in, as the parser reads it (its `tight`, its first item's `list`, its items). */
  listOf(item: OurusNode): MdBlockAt | null {
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
  markdownStart(node: OurusNode): number {
    return markdownStart(this, node);
  }

  /**
   * Whether an atom text's lines, alone, read as one block of its type, closed as it is, in this
   * document's flavor; written at `column` (its container's content column), where a tab a line
   * starts with spans to the next stop from there.
   */
  readsAs(text: OurusAtom, column = 0): boolean {
    const lines = text.text.split('\n');
    // (off a tab stop, the lines read in an item that starts below its marker, whose lines start
    // there: `-` for 2, `1.` for 3, `100.` for 5)
    const at = column % 4 === 1 ? 5 : column % 4;
    const wrapped = at > 0 && lines[0] !== '' && lines.some((l) => /^ *\t/.test(l));
    const first = wrapped ? 1 : 0;
    // (an empty last line, a code line, read as one: a final line ending starts none)
    const source = wrapped ? `${['', '', '-', '1.', '', '100.'][at]}\n` + lines.map((l) => ' '.repeat(at) + l).join('\n') : lines.join('\n');
    let root = MdTree.parse(source, this.mdTree.flavor, lines[lines.length - 1] === '' && lines.length > 1 ? { sentinels: [source.length] } : {}).root;
    if (wrapped) {
      const list = root.children[0];
      if (!list || root.children.length > 1 || list.children.length > 1) return false;
      root = list.children[0]!;
    }
    const n = root.children.length;
    const block = root.children[n - 1];
    if (!block || n > 1 || root.offsets[0]! - first + block.lines < lines.length) return false;
    const type = block.type === 'code_block' ? (block.attrs.fenced ? 'fenced_code' : 'indented_code') : block.type;
    // (indented code can't start with a blank line: it would be the gap above it)
    return type === text.type && (type !== 'fenced_code' || !!block.attrs.closed === text.closed) && (type !== 'indented_code' || root.offsets[0] === first);
  }

  /** The node whose own text holds line `line`: the deepest, where nested items share a line; null on blank lines and the preamble. */
  nodeAtLine(line: number): OurusNode | null {
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
    // (and only past nothing on its line but markup, containers' markers, a checkbox of any status,
    // `#`s: a deletion in a line of text, most of them, reads nothing again)
    const lineStart = Math.max(text.lastIndexOf('\n', caret - 1), text.lastIndexOf('\r', caret - 1)) + 1;
    if (!/^[ \t>*+\-0-9.)[\]xX#]*(?:\[[^\r\n]\][ \t]*)?$/.test(text.slice(lineStart, caret))) return false;
    const held = this.update({ changes: changes.changes, setMarks: [createPlaceholder(caret)] });
    if (held.marks.size === 0) return false;
    const before = shape(this.root);
    return shape(this.update({ changes: changes.changes, setMarks: [] }).root) !== before && shape(held.root) === before;
  }
}

/** What a snapshot read of a selection: its touched and selected subtrees, each once asked for. */
interface SelectionRead {
  readonly anchor: number;
  readonly head: number;
  touched?: readonly OurusNode[];
  selected?: readonly OurusNode[] | null;
}

/** Each stored node's text, read once: valid in every snapshot that shares the node, whose lines are the same. */
const texts = new WeakMap<PersistentNode, OurusText | null>();

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
function shape(root: PersistentNode): string {
  const out: string[] = [];
  const visit = (node: PersistentNode, depth: number): void => {
    out.push(`${depth}:${node.kind}:${node.head?.type ?? 'paragraph'}`);
    for (const child of node.children) visit(child, depth + 1);
  };
  visit(root, 0);
  return out.join(',');
}
