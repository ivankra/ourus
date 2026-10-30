// The view: a document and one reader's folds and zoom over it. What a fold hides and a zoom shows,
// what a selection or a position is in what the reader sees, and the view carried through an edit.

import type { OurusConfig } from '../config.ts';
import type { Located, OurusDoc, OurusDocUpdate, OurusNode } from '../doc/index.ts';
import { diffLines, normalizeChanges, type ChangeSpec, type OurusSelection } from '../text/index.ts';
import { carryView, viewByLine, viewIn, type ViewState } from './carry.ts';
import { zoomEscape } from './escape.ts';
import { selectedNodes, subtreesSelection, touchedNodes, visibleSelection } from './select.ts';

/** A view's state, as `OurusView.of` takes it and a host saves it. */
export interface OurusViewState {
  /** The nodes whose children the view hides. */
  readonly folded?: Iterable<number>;
  /** The node the view is zoomed into; null: the whole document. */
  readonly zoom?: number | null;
}

/**
 * A document and one reader's view of it: the nodes whose children it hides and the node it is
 * zoomed into. Make one with `of`; it is immutable, and `update`, `withDoc` and the `with…`s return
 * the next, or this one where nothing changes. Commands take one and give one (`executeCommand`).
 *
 * Internally, every view of a document shares its nodes: a fold toggled makes no node. The view is
 * carried through an edit by node (`carry.ts`): a fold goes with its node and opens where what it
 * hides changed; the zoom goes with its root.
 */
export class OurusView {
  /** The document. */
  readonly doc: OurusDoc;
  /** The nodes whose children the view hides. */
  readonly folded: ReadonlySet<number>;
  /** The node the view is zoomed into; null: the whole document. */
  readonly zoom: number | null;
  #zoomFolded: ReadonlySet<number> | null = null;
  #lastRead: SelectionRead | null = null;

  private constructor(doc: OurusDoc, state: ViewState) {
    this.doc = doc;
    this.folded = state.folded;
    this.zoom = state.zoom;
  }

  /**
   * `doc` with this state, none by default. A fold that can't be (no such node, nothing to hide) and
   * a zoom on no node are dropped: the state comes from outside, a saved view or an editor's folds.
   */
  static of(doc: OurusDoc, state: OurusViewState = {}): OurusView {
    return new OurusView(doc, viewIn(doc, { folded: new Set(state.folded ?? []), zoom: state.zoom ?? null }));
  }

  /** This view's document with `state`: this view where it is the same. */
  #with(doc: OurusDoc, state: ViewState): OurusView {
    if (doc === this.doc && sameState(state, this)) return this;
    // (a carry that kept every fold keeps this view's set)
    return new OurusView(doc, sameFolds(state.folded, this.folded) ? { folded: this.folded, zoom: state.zoom } : state);
  }

  /** The zoom root, or null. */
  get zoomRoot(): OurusNode | null {
    return this.zoom === null ? null : (this.doc.node(this.zoom) ?? null);
  }

  /** The folds in effect: those of nodes strictly inside the zoom root; all of `folded` where not zoomed. */
  get zoomFolded(): ReadonlySet<number> {
    if (this.#zoomFolded) return this.#zoomFolded;
    const zoom = this.zoom;
    if (zoom === null) return (this.#zoomFolded = this.folded);
    const inside = new Set<number>();
    for (const id of this.folded) if (this.doc.node(id)?.parent?.isWithin(zoom)) inside.add(id);
    return (this.#zoomFolded = inside);
  }

  /** Whether `node`'s fold is in effect (in `zoomFolded`). */
  isFolded(node: OurusNode): boolean {
    return this.zoomFolded.has(node.id);
  }

  /** Whether the view hides `node`: under a fold in effect, or outside the zoom. */
  isHidden(node: OurusNode): boolean {
    const folds = this.zoomFolded;
    for (const p of node.ancestors()) if (folds.has(p.id)) return true;
    return this.zoom !== null && !node.isWithin(this.zoom);
  }

  /** The node the reader sees for `node`: its outermost ancestor whose fold hides it, else itself. */
  shown(node: OurusNode): OurusNode {
    const folds = this.zoomFolded;
    if (!folds.size) return node;
    let owner = node;
    for (const p of node.ancestors()) if (folds.has(p.id)) owner = p;
    return owner;
  }

  /** What the zoom shows, in offsets (`doc.coverRange` of the root); null where not zoomed. */
  zoomRange(): { from: number; to: number } | null {
    const root = this.zoomRoot;
    return root ? this.doc.coverRange(root) : null;
  }

  /** Other folds; an id that can't fold dropped. */
  withFolded(ids: Iterable<number>): OurusView {
    return this.#with(this.doc, viewIn(this.doc, { folded: new Set(ids), zoom: this.zoom }));
  }

  /** Another zoom, no fold changed. Throws where `id` is no node here, or the root. */
  withZoom(id: number | null): OurusView {
    if (id !== null && (this.doc.node(id)?.kind ?? 'root') === 'root') throw new Error(`no node ${id} to zoom into`);
    return this.#with(this.doc, { folded: this.folded, zoom: id });
  }

  /** A host's edit: `doc.update(params)`, this view carried onto it through the update's changes. */
  update(params: OurusDocUpdate = {}): OurusView {
    const next = this.doc.update(params);
    return this.withDoc(next, params.text !== undefined ? undefined : (params.changes ?? []));
  }

  /**
   * `next`, another snapshot of this document's lineage (a command's, an undo's, another pane's),
   * with this view carried onto it through `changes`, this document's text to `next`'s (by default,
   * the lines that differ). Throws for another lineage.
   */
  withDoc(next: OurusDoc, changes: readonly ChangeSpec[] = diffLines(this.doc.text, next.text)): OurusView {
    if (next === this.doc) return this;
    if (!next.isSameLineage(this.doc)) throw new Error('withDoc: a snapshot of another lineage');
    return this.#with(next, viewIn(next, carryView(this.doc, this, next, normalizeChanges(changes))));
  }

  /** `doc.withConfig(config)`, the view carried by id, or by line where the flavor changed (the ids anew). */
  withConfig(config: Partial<OurusConfig>): OurusView {
    const next = this.doc.withConfig(config);
    if (next === this.doc) return this;
    return this.#with(next, next.config.flavor !== this.doc.config.flavor ? viewByLine(this.doc, next, this) : viewIn(next, this));
  }

  /** Where `next`, another snapshot of the lineage, leaves the zoom, or null (also where not zoomed); `removed`: the root went whole. */
  escape(next: OurusDoc, removed = false): string | null {
    return this.zoom === null ? null : zoomEscape(this.doc, this.zoom, next, removed);
  }

  /** What is at `pos`: `doc.locateRaw(pos)`, a gap's owner the node the reader sees (`shown`). */
  locate(pos: number): Located {
    const at = this.doc.locateRaw(pos);
    return at.zone === 'gap' ? { zone: 'gap', owner: this.shown(at.owner) } : at;
  }

  /**
   * The roots of the subtrees a selection touches: the topmost nodes whose own lines it touches, in
   * document order, at whatever depths, a caret's node too (the innermost where nodes share a line,
   * `- - a`); a blank line the gap of the node above it, a node a fold hides its folded row's. What
   * a key acts on. None only where there is no node to touch (the blank lines before the first, an
   * empty document).
   */
  touchedSubtrees(selection: OurusSelection): readonly OurusNode[] {
    const read = this.#readOf(selection);
    return (read.touched ??= touchedNodes(this, selection));
  }

  /**
   * The roots of a subtree selection, the selection that is exactly their subtrees as whole lines:
   * from column 0 of the first's first line to the start of the line after the last's subtree (the
   * canonical shape, `selectionOf`'s), its last line's end, or the end of the blank lines after it;
   * where nodes share those lines, the outermost inside the zoom. Null for any other selection: a
   * caret, text, one node's own text (but at the document's end, where it is the node too). What a
   * host draws as blocks.
   */
  selectedSubtrees(selection: OurusSelection): readonly OurusNode[] | null {
    const read = this.#readOf(selection);
    if (read.selected === undefined) read.selected = selectedNodes(this, selection);
    return read.selected;
  }

  /**
   * The selection of the subtrees of `roots`, nodes or ids, as whole lines: from column 0 of the
   * first's first line to the start of the line after the last line of any of them (or the
   * document's end), everything between included; the anchor at the top unless `direction` is `up`.
   * Throws for none, an id the document doesn't have, the root, one outside the zoom or one a fold
   * hides.
   */
  selectionOf(roots: readonly OurusNode[] | readonly number[], direction: 'down' | 'up' = 'down'): OurusSelection {
    const nodes = roots.map((r: OurusNode | number) => {
      if (typeof r !== 'number') return r;
      const node = this.doc.node(r);
      if (!node) throw new Error(`no node ${r} to select`);
      return node;
    });
    return subtreesSelection(this, nodes, direction);
  }

  /** `selection` moved out of what the view hides. */
  visibleSelection(selection: OurusSelection): OurusSelection {
    return visibleSelection(this, selection);
  }

  /** What this view read of `selection` (the last selection asked about only). */
  #readOf(selection: OurusSelection): SelectionRead {
    const last = this.#lastRead;
    if (last && last.anchor === selection.anchor && last.head === selection.head) return last;
    return (this.#lastRead = { anchor: selection.anchor, head: selection.head });
  }
}

/** What a view read of a selection: its touched and selected subtrees, each once asked for. */
interface SelectionRead {
  readonly anchor: number;
  readonly head: number;
  touched?: readonly OurusNode[];
  selected?: readonly OurusNode[] | null;
}

/** Whether two sets of folds hold the same ids. */
function sameFolds(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

/** Whether two states are the same folds and zoom. */
function sameState(a: ViewState, b: ViewState): boolean {
  return a.zoom === b.zoom && sameFolds(a.folded, b.folded);
}
