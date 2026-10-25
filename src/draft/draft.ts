// The draft: the outline a command wants, made from a document's, in which every node
// the command didn't touch is the document's own. A command changes it with its operations; `done()`
// puts it in normal form and fixes what the result must read as (lists, blank lines, escapes,
// placeholders, where the anchors are), or refuses what Markdown can't say; then writes it as changes
// (`write.ts`), and reads the new document back against it (`check.ts`).
//
// While it is built, the nodes it touched are working copies (`Working`), opened on the path from the
// root to them; everything else is the document's stored nodes. `done()` freezes the working copies
// into drafted `OutlineNodePersistent`s, and a working copy that changed nothing back into its
// source.

import { mdCalloutAt, MdTree, type MdBlockAt, type MdLine } from '../parser/index.ts';
import { advanceColumns, createPlaceholder, emptyNodeAt, isHeldSpacePlaceholder, isPlaceholder, MarkSet, trimMd, type ChangeSpec, type Mark } from '../text/index.ts';
import { OutlineNodePersistent, ProseText, escapeParagraph, outlineChildren, AtomText, type OutlineNode, type OutlineNodeText, type OutlineNodeKind, type OurusDoc, type OutlineChild } from '../doc/index.ts';
import { differenceFrom } from './check.ts';
import { continuationAsWas, write } from './write.ts';

/** A node of the draft's document, as a command holds it; or a node the draft touched, by id. */
export type NodeRef = OutlineNode | number;

/** Where an anchor (the caret, a selection's end) goes, as a command states it. */
export type AnchorSpec =
  /**
   * In a node's text: an offset of its string (`text`, the frame included); `assoc` picks the side
   * where characters are left out there. `before`: that many columns before it, in the padding
   * before the text's start (offset 0: the spaces Markdown hides there, `OurusDoc.hiddenSpaces`).
   */
  | { readonly ref: NodeRef; readonly offset: number; readonly assoc?: -1 | 1; readonly before?: number }
  /** On blank line `line` of a node's gap, at its text's column (the line Shift-Enter makes at a text's end). */
  | { readonly blank: NodeRef; readonly line: number; readonly old?: number }
  /**
   * In markup no text holds: a position of the draft's document, in lines the draft copies;
   * `otherwise`, where the writer doesn't copy its line (a blank line a seam lowered), in a node's text.
   */
  | { readonly old: number; readonly assoc?: -1 | 1; readonly otherwise?: { readonly ref: NodeRef; readonly offset: number; readonly assoc?: -1 | 1 } };

/** An anchor as `done()` fixed it: in a node of `draft.root` whose text the draft set, or a position of `from`. */
export type Anchor =
  /** In a node's text; `before`: that many columns before it, in the padding before the text's start (offset 0). */
  | { readonly node: OutlineNodePersistent; readonly offset: number; readonly assoc: -1 | 1; readonly before?: number }
  | { readonly old: number; readonly assoc: -1 | 1; readonly otherwise?: Anchor; readonly before?: number }
  /** On blank line `line` of a node's gap: one `done()` made of a text's empty last line. */
  | { readonly blank: OutlineNodePersistent; readonly line: number };

/** Where an item is in its list: whether it starts one, the list's kind and marker (a bullet's character, an ordered list's delimiter), its number. */
export interface ListPlace {
  readonly start: boolean;
  readonly type: 'bullet' | 'ordered';
  readonly marker: string;
  readonly number: number | null;
}

/** A draft applied: the document after it, the changes to its text, the selection. */
export interface Applied {
  readonly doc: OurusDoc;
  readonly changes: readonly ChangeSpec[];
  readonly selection: { readonly anchor: number; readonly head: number };
}

/** What Markdown can't say. */
/**
 * A draft refused: `not-expressible`, Markdown can't say what it asks; `write-failed`, the writer
 * failed to write it (a layout it has no rule for, or a text that doesn't read back as the draft): a
 * bug to fix, never an outcome.
 */
export interface Refusal {
  readonly reason: 'not-expressible' | 'write-failed';
  readonly detail: string;
}

/** What `done()` gives: the draft applied, or refused. */
export type DraftResult = Applied | Refusal;

/** The character the parser reads a placeholder as: text no block starts with. */
const SENTINEL = '￼';

type Child = Working | OutlineNodePersistent;

/** A node the draft touched, while it is built: a copy of a read node (`source`), or one it made. */
class Working {
  readonly id: number;
  kind: OutlineNodeKind;
  readonly source: OutlineNodePersistent | null;
  /** Where `source` is in the draft's document. */
  readonly origin: OutlineNode | null;
  /** Its text as set (null: none), or undefined: `source`'s. */
  text: OutlineNodeText | null | undefined;
  gap: number;
  children: Child[];
  /** Null for the root, and for a detached node. */
  parent: Working | null = null;

  constructor(id: number, kind: OutlineNodeKind, source: OutlineNodePersistent | null, origin: OutlineNode | null, text: OutlineNodeText | null | undefined, gap: number, children: Child[]) {
    this.id = id;
    this.kind = kind;
    this.source = source;
    this.origin = origin;
    this.text = text;
    this.gap = gap;
    this.children = children;
  }
}

/** What `done()` fixed, for the writer and the check. */
interface Fixed {
  readonly root: OutlineNodePersistent;
  readonly caret: Anchor | null;
  readonly anchor: Anchor | null;
  readonly lists: ReadonlyMap<number, ListPlace>;
  readonly escapes: ReadonlyMap<number, readonly number[]>;
  /** The column a text's later lines start at, by node id, where one starts with a tab: the escapes are for that column. */
  readonly columns: ReadonlyMap<number, number>;
  /** Where each drafted node's source is in `from`, and each read node right under a drafted one. */
  readonly origins: ReadonlyMap<OutlineNodePersistent, OutlineNode>;
  readonly gapLines: ReadonlyMap<number, readonly [number, number] | null>;
  /** The blank lines before the first node, where `done()` set them (null: as they are). */
  readonly preamble: number | null;
  /** The spaces before a text on its first line, past the one after an item's marker (a paragraph's indentation), by node id, where `done()` set them. */
  readonly paddings: ReadonlyMap<number, number>;
}

export class OurusDraft {
  /** The document the draft edits. */
  readonly from: OurusDoc;
  #root: Working | null = null;
  /** Each node touched, by id: opened, made, detached. */
  #byId = new Map<number, Working>();
  /** Each read node opened → its working copy. */
  #current = new Map<OutlineNodePersistent, Working>();
  #nextId: number;
  #caret: AnchorSpec | null = null;
  #anchor: AnchorSpec | null = null;
  #hints = new Map<number, string>();
  /** Markers new items would rather have where they join no list there is: a list's form (`listForm`). */
  #listForms = new Map<number, string>();
  #ownForms = new Set<number>();
  /** The nodes whose gap the command stated (`gap`), by id. */
  #statedGaps = new Set<number>();
  /** The blank lines before the first node, as the command stated them (`leadingBlankLines`; null: as they are). */
  #leading: number | null = null;
  /** Gaps written from other lines of `from` than their node's own (null: as new blank lines), by node id: a split's. */
  #gapLines = new Map<number, readonly [number, number] | null>();
  /** Each node a split made → the read node whose text's end it holds, in `from`. */
  #splitFrom = new Map<number, OutlineNode>();
  /** The nodes the draft placed (moved, or made), by id. */
  #placedIds = new Set<number>();
  /** New items, by id: placed before another node (`next`: in its list) or after one. */
  #joins = new Map<number, 'next' | 'previous'>();
  /** Read nodes `done()` regrouped under another parent: where they are in `from`. */
  #placed = new Map<OutlineNodePersistent, OutlineNode>();
  #fixed: Fixed | Refusal | null = null;

  constructor(from: OurusDoc, nextId = from.nextId) {
    this.from = from;
    this.#nextId = nextId;
  }

  // ------------------------------------------------------------------ building

  /** The draft without `refs`, each with its subtree: detached, to place again or drop at `done()`. */
  remove(refs: readonly NodeRef[]): this {
    this.#building();
    for (const ref of refs) this.#detach(this.#node(ref));
    return this;
  }

  /** `refs` (detached) before or after `sibling`, under its parent. */
  place(where: 'before' | 'after', sibling: NodeRef, refs: readonly NodeRef[]): this {
    this.#building();
    const s = this.#node(sibling);
    const parent = s.parent;
    if (!parent) throw new Error(`node ${s.id} isn't in the draft's outline`);
    const nodes = this.#placeable(refs, parent);
    for (const n of nodes) if (!n.source) this.#joins.set(n.id, where === 'before' ? 'next' : 'previous');
    const i = parent.children.indexOf(s);
    parent.children.splice(where === 'after' ? i + 1 : i, 0, ...nodes);
    for (const n of nodes) n.parent = parent;
    return this;
  }

  /** `refs` (detached) as `parent`'s first or last children. */
  append(parent: NodeRef, where: 'first' | 'last', refs: readonly NodeRef[]): this {
    this.#building();
    const p = this.#node(parent);
    const nodes = this.#placeable(refs, p);
    if (where === 'first') p.children.unshift(...nodes);
    else p.children.push(...nodes);
    for (const n of nodes) n.parent = p;
    return this;
  }

  /** `ref` without its own text: it goes, its children taking its place (an empty paragraph's list). */
  dissolve(ref: NodeRef): this {
    this.#building();
    const w = this.#node(ref);
    const parent = w.parent;
    if (!parent) throw new Error(`node ${w.id} isn't in the draft's outline`);
    const children = w.children.map((_, k) => this.#openChild(w, k));
    const at = parent.children.indexOf(w);
    this.#detach(w);
    w.children = [];
    parent.children.splice(at, 0, ...children);
    for (const c of children) c.parent = parent;
    return this;
  }

  /**
   * `ref` as another kind, the same id (an item unwrapped); its text read again as that kind's, and
   * written whole where it is, with the escapes its new place needs.
   */
  convert(ref: NodeRef, kind: Exclude<OutlineNodeKind, 'root'>): this {
    this.#building();
    const w = this.#node(ref);
    const text = this.#textOf(w);
    w.kind = kind;
    if (text instanceof ProseText) w.text = text.asItem(kind === 'item').normalize();
    else if (text) w.text = new AtomText(text.type, kind === 'item', text.text, text.marks);
    return this;
  }

  /** `ref`'s text, read as its kind's (an item's or not), its transitions applied; null, a quote's title gone. */
  setText(ref: NodeRef, text: OutlineNodeText | null): this {
    this.#building();
    const w = this.#node(ref);
    if (text === null && w.kind !== 'quote') throw new Error(`node ${w.id} has a text: only a quote's title goes`);
    w.text = text instanceof ProseText ? text.asItem(w.kind === 'item').normalize() : text;
    return this;
  }

  /** A new node, detached (place it), with a real id reserved from the document's counter. `hint`: an item's marker, for the writer. */
  create(kind: Exclude<OutlineNodeKind, 'root'>, text: OutlineNodeText | null, hint?: string): number {
    this.#building();
    const id = this.#nextId++;
    const w = new Working(id, kind, null, null, text instanceof ProseText ? text.asItem(kind === 'item').normalize() : text, 0, []);
    this.#byId.set(id, w);
    if (hint !== undefined) this.#hints.set(id, hint);
    return id;
  }

  /**
   * A copy of `node` with its subtree, detached (place it): new ids reserved from the document's
   * counter, each node read from its original, so the writer writes it as the original is written.
   * `ids`, where given, gets each original node's copy, by the original's stored node.
   */
  copy(node: OutlineNode, ids?: Map<OutlineNodePersistent, number>): number {
    this.#building();
    const make = (at: OutlineNode): Working => {
      const p = at.persistentNode;
      const c = new Working(this.#nextId++, p.kind, p, at, undefined, p.gap, []);
      ids?.set(p, c.id);
      c.children = at.children.map(make);
      for (const k of c.children as Working[]) k.parent = c;
      this.#byId.set(c.id, c);
      return c;
    };
    return make(node).id;
  }

  /**
   * `ref`'s text cut at `at`: it keeps what is before, and a new node of its kind (a heading's: a
   * paragraph) takes what is from `to` on (`to`, default `at`: the characters between go), with a
   * closing frame (an ATX closing sequence) staying with the first. The new node is the next sibling,
   * taking the gap (blank lines travel with the end of the text), and the children if they `follow`;
   * or (`into: 'child'`) the first child. `kind`: the new node's, a paragraph's text. Returns the two
   * ids.
   */
  split(ref: NodeRef, at: number, options: { readonly children: 'stay' | 'follow'; readonly to?: number; readonly into?: 'sibling' | 'child'; readonly kind?: 'paragraph' }): [number, number] {
    this.#building();
    const w = this.#node(ref);
    const text = this.#textOf(w);
    if (!(text instanceof ProseText)) throw new Error(`node ${w.id} has no text to split`);
    if (!w.parent) throw new Error(`node ${w.id} isn't in the draft's outline`);
    const to = options.to ?? at;
    const close = text.frame.find((p) => (p.part === 'close' || p.part === 'underline') && p.from >= to);
    const end = close ? close.from : text.text.length;
    const kind = options.kind ?? (w.kind === 'heading' || w.kind === 'quote' ? 'paragraph' : (w.kind as Exclude<OutlineNodeKind, 'root'>));
    // the rest is a paragraph's text, a heading's or a title's too: its characters make it no heading
    const rest = text.slice(to, end);
    const id = this.create(kind, new ProseText('paragraph', text.item, rest.text, rest.marks));
    const b = this.#byId.get(id)!;
    w.text = (close ? text.slice(0, at).concat(text.slice(close.from)) : text.slice(0, at)).normalize();
    // the blank lines after the text go with its end, as they were written
    b.gap = w.gap;
    w.gap = 0;
    const lines = w.origin && w.source ? ownGapLines(w.origin) : null;
    if (lines && lines[1] - lines[0] === b.gap) this.#gapLines.set(id, lines);
    if (w.origin) this.#gapLines.set(w.id, null);
    if (w.origin) this.#splitFrom.set(id, this.#splitFrom.get(w.id) ?? w.origin);
    if (options.into === 'child') {
      this.append(w.id, 'first', [id]);
      return [w.id, id];
    }
    if (options.children === 'follow') {
      const children = w.children.map((_, k) => this.#openChild(w, k));
      w.children = [];
      b.children = children;
      for (const c of children) c.parent = b;
    }
    this.place('after', w.id, [id]);
    return [w.id, id];
  }

  /**
   * `lower`'s text joined to `upper`'s (after `separator`: a line break joins it as the text's next
   * line), past its own frame; its gap `upper`'s. Its children go after `upper`'s (`adopt`), or into
   * its place (`place`: where `upper` is its parent, or can't hold them). Returns `upper`'s id.
   */
  join(upper: NodeRef, lower: NodeRef, options: { readonly children?: 'adopt' | 'place'; readonly separator?: string } = {}): number {
    this.#building();
    const u = this.#node(upper);
    const l = this.#node(lower);
    const ut = this.#textOf(u);
    const lt = this.#textOf(l);
    if (!(ut instanceof ProseText) || !(lt instanceof ProseText)) throw new Error('a join takes two texts');
    const children = l.children.map((_, k) => this.#openChild(l, k));
    const parent = l.parent;
    const at = parent ? parent.children.indexOf(l) : -1;
    this.#detach(l);
    l.children = [];
    // before a closing frame (an ATX heading's `#`s, a setext underline): the text's end
    const close = ut.frame.find((p) => (p.part === 'close' || p.part === 'underline') && p.to === ut.text.length);
    const end = close ? close.from : ut.text.length;
    const rest = lt.slice(lt.textStart(0));
    u.text = ut.slice(0, end).concat(options.separator ?? '', rest, ut.slice(end)).normalize();
    u.gap = l.gap;
    if (options.children === 'place' && parent) {
      parent.children.splice(at, 0, ...children);
      // (placed where they now are: lined up with the list they join, Backspace45)
      for (const c of children) {
        c.parent = parent;
        this.#placedIds.add(c.id);
      }
    } else {
      for (const c of children) {
        c.parent = u;
        u.children.push(c);
      }
    }
    return u.id;
  }

  /**
   * The marker a new item's list would rather have (`-`, `*`, `1.`, `3)`), where it joins no list
   * there is: its kind, its bullet or delimiter, its start. A list it joins gives its own; `own`, it
   * keeps it, a list of its own where the list it lands in has another form (`pasteListForm: own`).
   */
  listForm(id: number, marker: string, own = false): this {
    this.#building();
    this.#listForms.set(id, marker);
    if (own) this.#ownForms.add(id);
    else this.#ownForms.delete(id);
    return this;
  }

  /** A node the draft touched (made, moved, changed), by id, as it is in the draft now: its kind, text, gap and children's ids. */
  touched(id: number): { readonly kind: OutlineNodeKind; readonly text: OutlineNodeText | null; readonly gap: number; readonly children: readonly number[] } {
    const w = this.#node(id);
    return { kind: w.kind, text: this.#textOf(w), gap: w.gap, children: w.children.map((c) => c.id) };
  }

  /** Blank lines after `ref`'s text, as the command states them: `done()`'s scope ends keep them (Markdown's separation may still raise them). */
  gap(ref: NodeRef, n: number): this {
    this.#building();
    const w = this.#node(ref);
    w.gap = n;
    this.#statedGaps.add(w.id);
    return this;
  }

  /**
   * The blank lines before the document's first node: `n` of them. Only where the lines above it are
   * blank (no frontmatter): the writer writes them as blank lines.
   */
  leadingBlankLines(n: number): this {
    this.#building();
    if (this.from.leadingBlankLines === null) throw new Error('the lines before the first node aren\'t blank');
    this.#leading = n;
    // (the root opened, as an edit does, so the writer writes the document: every node copied as it is)
    void this.#rootWorking;
    return this;
  }

  setCaret(ref: NodeRef, offset: number, assoc: -1 | 1 = 1): this {
    return this.select({ ref, offset, assoc }, { ref, offset, assoc });
  }

  /** The caret in markup no text holds, at a position of the document in lines the draft copies. */
  setCaretAt(old: number, assoc: -1 | 1 = 1): this {
    return this.select({ old, assoc }, { old, assoc });
  }

  select(anchor: AnchorSpec, head: AnchorSpec): this {
    this.#building();
    this.#anchor = anchor;
    this.#caret = head;
    return this;
  }

  // ------------------------------------------------------------------ done

  /** Puts the draft in normal form and fixes what it reads as, or says why Markdown can't say it; frozen after. Idempotent. */
  #normalize(): Refusal | null {
    if (!this.#fixed) this.#fixed = new Done(this).run();
    return 'reason' in this.#fixed ? this.#fixed : null;
  }

  /**
   * The draft put in normal form, written, and the document after it read back and checked against
   * it: the document, its changes and selection; else a refusal (`write-failed` where the writer
   * failed, a bug).
   */
  done(): DraftResult {
    const refused = this.#normalize();
    if (refused) return refused;
    const written = write(this);
    if ('reason' in written) return written;
    const doc = this.from.update(written.changes, { setMarks: written.marks, identity: written.identity, nextId: this.nextId });
    const wrong = differenceFrom(doc, this);
    return wrong ? { reason: 'write-failed', detail: `the text written doesn't read as the draft: ${wrong}` } : { doc, changes: written.changes, selection: written.selection };
  }

  /** The outline the command wants, in normal form, every text fixed. */
  get root(): OutlineNodePersistent {
    return this.#normalized().root;
  }

  get caret(): Anchor | null {
    return this.#normalized().caret;
  }

  /** A selection's other end: the caret's own where nothing is selected. */
  get anchor(): Anchor | null {
    return this.#normalized().anchor;
  }

  /** Each item's place in its list, for the items of every list the draft changed. */
  get lists(): ReadonlyMap<number, ListPlace> {
    return this.#normalized().lists;
  }

  /** The markup escapes to write, by node id and offset in its text (before the character there): for every text `done()` spelled where it is, none where it needs none. */
  get escapes(): ReadonlyMap<number, readonly number[]> {
    return this.#normalized().escapes;
  }

  /** The column a text's later lines start at, by node id, where one starts with a tab: the escapes are for that column. */
  get columns(): ReadonlyMap<number, number> {
    return this.#normalized().columns;
  }

  /** The spaces before a text on its first line, past the one after an item's marker (a paragraph's indentation), by node id: a text's leading spaces, which Markdown holds only so. */
  get paddings(): ReadonlyMap<number, number> {
    return this.#normalized().paddings;
  }

  /** The blank lines before the first node, where `done()` set them (null: as in `from`). */
  get preamble(): number | null {
    return this.#normalized().preamble;
  }

  /** Where a gap `done()` moved to a new scope end was: its lines in `from`, by node id, for the writer to copy as written. */
  get gapLines(): ReadonlyMap<number, readonly [number, number] | null> {
    return this.#normalized().gapLines;
  }

  /** The nodes the draft placed, by id: moved (removed and placed again), or made. */
  get placedIds(): ReadonlySet<number> {
    return this.#placedIds;
  }

  /** For each node a split made, by id: the read node of `from` whose text's end it holds (its lazy lines the writer keeps lazy). */
  get splitFrom(): ReadonlyMap<number, OutlineNode> {
    return this.#splitFrom;
  }

  /** What a command asked of the writer: a new item's marker, by node id. */
  get hints(): ReadonlyMap<number, string> {
    return this.#hints;
  }

  /** The next id after those the draft reserved. */
  get nextId(): number {
    return this.#nextId;
  }

  /** Where a node of `root` is in `from`: a drafted node's source, or a read node right under a drafted one; null for one the draft made. */
  originOf(node: OutlineNodePersistent): OutlineNode | null {
    return this.#normalized().origins.get(node) ?? null;
  }

  /** A text of the draft's: a drafted node's as set, else (`origin`) its source's in `from`. */
  textOf(node: OutlineNodePersistent, origin: OutlineNode | null): OutlineNodeText | null {
    if (node.text !== undefined) return node.text;
    return origin ? this.from.textOf(origin) : null;
  }

  #normalized(): Fixed {
    const fixed = this.#fixed;
    if (!fixed) throw new Error('the draft is not done: call done() first');
    if ('reason' in fixed) throw new Error(`the draft was refused: ${fixed.detail}`);
    return fixed;
  }

  #building(): void {
    if (this.#fixed) throw new Error('the draft is done: start a new one to change it');
  }

  // ------------------------------------------------------------------ resolving

  /** The root, opened. */
  get #rootWorking(): Working {
    if (!this.#root) {
      const r = this.from.root;
      this.#root = new Working(r.id, r.kind, r, this.from.rootNode, undefined, r.gap, [...r.children]);
      this.#current.set(r, this.#root);
      this.#byId.set(r.id, this.#root);
    }
    return this.#root;
  }

  #node(ref: NodeRef): Working {
    if (typeof ref === 'number') {
      const w = this.#byId.get(ref) ?? (ref === 0 ? this.#rootWorking : undefined);
      if (!w) throw new Error(`node ${ref} isn't one the draft touched: pass its OutlineNode`);
      return w;
    }
    return this.#open(ref);
  }

  /** `node`'s working copy, opened with the path to it: found through the nearest ancestor the draft touched. */
  #open(node: OutlineNode): Working {
    const p = node.persistentNode;
    const known = this.#current.get(p);
    if (known) return known;
    if (!node.parent) {
      if (p !== this.from.root) throw new Error("a node of another document than the draft's");
      return this.#rootWorking;
    }
    const parent = this.#open(node.parent);
    const k = parent.children[node.index] === p ? node.index : parent.children.indexOf(p);
    if (k < 0) throw new Error(`node ${p.id} is no longer in the draft`);
    return this.#openAt(parent, k, node);
  }

  /** Child `k` of `parent`, opened: a read child's origin is found under `parent`'s. */
  #openChild(parent: Working, k: number): Working {
    const child = parent.children[k]!;
    if (child instanceof Working) return child;
    const origin = this.#placed.get(child) ?? (parent.origin ? childOrigin(parent.origin, child) : null);
    if (!origin) throw new Error(`node ${child.id} has no place in the draft's document`);
    return this.#openAt(parent, k, origin);
  }

  #openAt(parent: Working, k: number, origin: OutlineNode): Working {
    const p = origin.persistentNode;
    const w = new Working(p.id, p.kind, p, origin, undefined, p.gap, [...p.children]);
    w.parent = parent;
    parent.children[k] = w;
    this.#current.set(p, w);
    this.#byId.set(p.id, w);
    return w;
  }

  #detach(w: Working): void {
    if (w === this.#root) throw new Error('the root stays');
    const parent = w.parent;
    if (!parent) return;
    parent.children.splice(parent.children.indexOf(w), 1);
    w.parent = null;
  }

  /** `refs` as nodes to place under `parent`: detached, not the root, not `parent` or an ancestor of it. */
  #placeable(refs: readonly (NodeRef | Working)[], parent: Working): Working[] {
    return refs.map((ref) => {
      const w = ref instanceof Working ? ref : this.#node(ref);
      if (w === this.#root) throw new Error('the root has no place');
      if (w.parent) throw new Error(`node ${w.id} is placed already: remove it first (a node is in a draft once)`);
      for (let up: Working | null = parent; up; up = up.parent) if (up === w) throw new Error(`node ${w.id} can't go under itself`);
      this.#placedIds.add(w.id);
      return w;
    });
  }

  #textOf(w: Working): OutlineNodeText | null {
    return w.text !== undefined ? w.text : w.origin ? this.from.textOf(w.origin) : null;
  }

  // what `Done` reads of a draft being finished
  static internals(draft: OurusDraft) {
    return {
      root: draft.#root,
      byId: draft.#byId,
      current: draft.#current,
      placed: draft.#placed,
      gapLines: draft.#gapLines,
      joins: draft.#joins,
      listForms: draft.#listForms,
      ownForms: draft.#ownForms,
      statedGaps: draft.#statedGaps,
      leading: draft.#leading,
      caret: draft.#caret,
      anchor: draft.#anchor,
      openChild: (parent: Working, k: number) => draft.#openChild(parent, k),
      textOf: (w: Working) => draft.#textOf(w),
    };
  }
}

/** `origin`'s child that is `child`, by identity (its index when unchanged). */
function childOrigin(origin: OutlineNode, child: OutlineNodePersistent): OutlineNode | null {
  const children = origin.persistentNode.children;
  const k = children.indexOf(child);
  return k < 0 ? null : origin.child(k);
}

// ------------------------------------------------------------------ done(), step by step

class Refused extends Error {
  readonly refusal: Refusal;
  constructor(detail: string) {
    super(detail);
    this.refusal = { reason: 'not-expressible', detail };
  }
}

class Done {
  readonly draft: OurusDraft;
  readonly from: OurusDoc;
  readonly io: ReturnType<typeof OurusDraft.internals>;
  readonly lists = new Map<number, ListPlace>();
  readonly escapes = new Map<number, number[]>();
  readonly gained = new Map<Working, number[]>();
  /** Characters a text lost, by where they were in it as set (ascending), for the anchors past them. */
  readonly lost = new Map<Working, { readonly at: number; readonly n: number }[]>();
  /** The spaces a text started with, taken out as its node's padding: where they were in it, and how many (`#leadingSpaces`). */
  readonly leading = new Map<Working, { readonly at: number; readonly n: number }>();
  readonly paddings = new Map<number, number>();
  readonly columns = new Map<number, number>();
  /** The blank lines before the first node, where they must change (null: as they are). */
  preamble: number | null = null;
  /** Texts whose empty last lines `done()` made blank lines after them: where the text now ends. */
  readonly blankTails = new Map<Working, number>();
  /** Gaps moved to a new scope end: the lines of `from` they were, by node id (the writer copies them). */
  readonly gapLines: Map<number, readonly [number, number] | null>;
  /** The working copies in the final outline. */
  readonly attached = new Set<Working>();

  constructor(draft: OurusDraft) {
    this.draft = draft;
    this.from = draft.from;
    this.io = OurusDraft.internals(draft);
    this.gapLines = new Map(this.io.gapLines);
    this.preamble = this.io.leading;
  }

  run(): Fixed | Refusal {
    try {
      const root = this.io.root;
      if (root) {
        this.#collect(root);
        this.#transitions();
        this.#normalForm();
        this.#frontmatter();
        this.#collect(root);
        this.#lists();
        this.#leadingSpaces();
        // the placeholders first: an empty line they hold reads as typed on, which the escapes depend on;
        // then the escapes, which a text's own lines decide, and which seams read
        this.#movedEmpty();
        this.#placeholders();
        this.#escapes();
        this.#atomTexts();
        this.#gaps();
      }
      const caret = this.#anchor(this.io.caret);
      const anchor = this.io.anchor === this.io.caret ? caret : this.#anchor(this.io.anchor);
      const origins = new Map<OutlineNodePersistent, OutlineNode>();
      const frozen = root ? this.#freeze(root, origins) : this.from.root;
      const map = (a: Anchor | null): Anchor | null => {
        if (a && 'node' in a) return { ...a, node: this.#frozen.get(a.node as unknown as Working)! };
        if (a && 'blank' in a) return { ...a, blank: this.#frozen.get(a.blank as unknown as Working)! };
        return a?.otherwise ? { ...a, otherwise: map(a.otherwise)! } : a;
      };
      return { root: frozen, caret: map(caret), anchor: map(anchor), lists: this.lists, escapes: this.escapes, columns: this.columns, origins, gapLines: this.gapLines, preamble: this.preamble, paddings: this.paddings };
    } catch (e) {
      if (e instanceof Refused) return e.refusal;
      throw e;
    }
  }

  /** Every working copy in the final outline. */
  #collect(root: Working): void {
    this.attached.clear();
    const visit = (w: Working): void => {
      this.attached.add(w);
      for (const c of w.children) if (c instanceof Working) visit(c);
    };
    visit(root);
  }

  /** Where child `c` of `parent` is in `from`: a working copy's origin, else a read node's under `parent`'s, or where `done()` found it. */
  #under(parent: Working, c: Child): OutlineNode | null {
    if (c instanceof Working) return c.origin;
    return this.io.placed.get(c) ?? (parent.origin ? childOrigin(parent.origin, c) : null);
  }

  #edited(w: Working): boolean {
    return w.text !== undefined;
  }

  // ---- 1. normal form

  /** A heading whose text no longer reads as one is a paragraph; a quote's title that no longer reads as a callout, its first paragraph. */
  #transitions(): void {
    for (const w of this.attached) {
      if (!(w.text instanceof ProseText)) continue;
      if (w.kind === 'heading' && w.text.type === 'paragraph') w.kind = 'paragraph';
      if (w.kind === 'quote' && w.text.type === 'paragraph') {
        const id = this.draft.create('paragraph', w.text);
        w.text = null;
        this.draft.append(w.id, 'first', [id]);
        this.attached.add(this.io.byId.get(id)!);
      }
    }
  }

  /**
   * Every container (the root, an item, a quote) holding a node the draft touched, regrouped as the
   * outline reads it (`outlineChildren`): a heading owns what follows it up to one of its level or higher; in
   * the document's own sections a paragraph owns the items right after it. Regrouping never merges
   * nodes: one another would absorb as its text is refused.
   */
  #normalForm(): void {
    const containers = new Set<Working>();
    for (const w of this.#structural()) {
      for (const at of [w, w.parent]) {
        let c: Working | null = at;
        while (c && c.kind !== 'root' && c.kind !== 'item' && c.kind !== 'quote') c = c.parent;
        if (c) containers.add(c);
      }
    }
    for (const c of containers) {
      this.#regroup(c);
      this.#absorbs(c);
    }
  }

  /**
   * The working copies whose structure the draft changed: made, of another kind, with other children
   * than their source's, or a heading of another level. Only around them can grouping, lists and
   * seams change.
   */
  #structural(): Working[] {
    return [...this.attached].filter((w) => {
      const s = w.source;
      if (!s || w.kind !== s.kind) return true;
      if (w.children.length !== s.children.length || w.children.some((c, i) => sourceOf(c) !== s.children[i])) return true;
      if (w.kind === 'heading' && w.text instanceof ProseText && w.origin) {
        const before = this.from.textOf(w.origin);
        return before instanceof ProseText && before.heading?.level !== w.text.heading?.level;
      }
      return false;
    });
  }

  #regroup(container: Working): void {
    interface Entry { node: Child; kind: OutlineNodeKind; level: number; origin: OutlineNode | null }
    const entries: Entry[] = [];
    const flatten = (parent: Child, origin: OutlineNode | null): void => {
      for (const c of parent.children) {
        // (a stored node's children are stored nodes)
        const o = parent instanceof Working ? this.#under(parent, c) : origin ? childOrigin(origin, c as OutlineNodePersistent) : null;
        const kind = c.kind;
        entries.push({ node: c, kind, level: kind === 'heading' ? this.#level(c, o) : 0, origin: o });
        if (kind === 'heading' || kind === 'paragraph') flatten(c, o);
      }
    };
    flatten(container, container.origin);
    // each node with its children as grouped, built first: a read node whose children come out the same stays as it is
    const build = ({ entry: e, children }: OutlineChild<Entry>, parent: Working): Child => {
      const node = e.node;
      if (!(node instanceof Working) && e.origin) this.io.placed.set(node, e.origin);
      if (node.kind !== 'heading' && node.kind !== 'paragraph') {
        if (node instanceof Working) node.parent = parent;
        return node;
      }
      const kids = children.map((k) => build(k, parent));
      let w: Working;
      if (node instanceof Working) w = node;
      else {
        if (kids.length === node.children.length && kids.every((k, i) => k === node.children[i])) return node;
        w = this.#openRead(node, e.origin!);
        this.attached.add(w);
      }
      w.parent = parent;
      w.children = kids;
      for (const c of kids) if (c instanceof Working) c.parent = w;
      return w;
    };
    container.children = outlineChildren(entries, container.kind === 'root').map((e) => build(e, container));
  }

  /** A read node opened where `done()` changes it (regrouped, a gap fixed), its place in `from` known. */
  #openRead(node: OutlineNodePersistent, origin: OutlineNode): Working {
    const known = this.io.current.get(node);
    if (known) return known;
    const w = new Working(node.id, node.kind, node, origin, undefined, node.gap, [...node.children]);
    this.io.current.set(node, w);
    this.io.byId.set(node.id, w);
    return w;
  }

  #level(node: Child, origin: OutlineNode | null): number {
    const text = node instanceof Working ? this.io.textOf(node) : origin ? this.from.textOf(origin) : null;
    return text instanceof ProseText ? (text.heading?.level ?? 7) : 7;
  }

  /** Refuses an Obsidian note the draft makes start with a thematic break: `---` on its first line opens frontmatter. */
  #frontmatter(): void {
    const root = this.io.root;
    if (!root || this.from.config.flavor !== 'obsidian') return;
    const first = root.children[0];
    const was = this.from.root.children[0];
    const read = first instanceof Working ? first.source : first;
    if (!first || read === was || (this.from.root.children.length && this.from.root.offsets[0] !== 0)) return;
    // a `---` first, with another below it, would open frontmatter: a blank line before it (DeleteSubtree9)
    if (first.kind !== 'atom' || read?.block?.type !== 'thematic_break') return;
    const origin = this.#under(root, first);
    const tree = this.from.mdTree;
    const fence = (i: number): boolean => /^---[ \t]*$/.test(this.from.text.slice(tree.line(i).from, tree.line(i).to));
    if (!origin || !fence(origin.startLine)) return;
    for (let i = 0; i < tree.lineCount; i++) if (i !== origin.startLine && fence(i)) this.preamble = 1;
  }

  /** Refuses a node another would read as its text: a block first in an item with no text of its own, a paragraph starting `[!type]` first in a quote with none. */
  #absorbs(container: Working): void {
    const first = container.children[0];
    if (!first || this.io.textOf(container) !== null) return;
    const firstOrigin = this.#under(container, first);
    const firstText = first instanceof Working ? this.io.textOf(first) : firstOrigin ? this.from.textOf(firstOrigin) : null;
    if (container.kind === 'item' && first.kind !== 'item' && first.kind !== 'quote') throw new Refused(`the ${first.kind} would be read as the text of the item above it, which has none`);
    if (container.kind === 'quote' && first.kind === 'paragraph' && firstText instanceof ProseText && mdCalloutAt(firstText.text.split('\n')[0]!)) {
      throw new Refused("a paragraph starting `[!type]` first in a quote would be read as the quote's callout title");
    }
  }

  // ---- 2. lists

  /**
   * Each item's list, for the items under a node the draft touched: an item starts a new list where
   * the node before it isn't an item of the list it came from; an ordered list the draft changed is
   * numbered from the start of the list its first item came from, one keeping its
   * items keeps its numbers, and one numbered all alike stays so.
   */
  #lists(): void {
    // the parents whose children changed, and of each node of another kind (a paragraph made an item)
    const parents = new Set<Working>();
    for (const w of this.#structural()) {
      parents.add(w);
      if (w.parent && w.source && w.kind !== w.source.kind) parents.add(w.parent);
    }
    for (const parent of parents) {
      const children = parent.children;
      let run: { item: Child; origin: OutlineNode | null }[] = [];
      // the list of the run's first item the document has: an item of another starts a new run
      let list: MdBlockAt | null = null;
      // whether the item before was moved here: a moved item and one that stays beside it are one list
      // (it joins the list it lands in); moved items of different lists stay apart
      let movedBefore: boolean | null = null;
      // the list the item before came from, where it was moved: moved items of one list stay together
      let movedFrom: MdBlockAt | null = null;
      // the form of the run's items, and whether it is a pasted list's own
      let runKey: string | null = null;
      let runForm = false;
      // the list of the run's first item that stays: one that stays in another list, of another
      // marker, starts its own run, a moved item joining only one of them
      let staying: MdBlockAt | null = null;
      const flush = (): void => {
        if (run.length) this.#list(run, parent);
        run = [];
        list = null;
        staying = null;
      };
      children.forEach((c, i) => {
        if (c.kind !== 'item') {
          flush();
          movedBefore = null;
          return;
        }
        const origin = this.#under(parent, c);
        const moved = !!origin && this.draft.placedIds.has(c.id);
        // items `done()` regrouped under a paragraph, or whose item was unwrapped into one, are its one
        // list (DirectOutdent3: `- a⏎  - a1⏎- b` outdented, `a1` and `b` `a`'s list)
        const regrouped = !!origin && !moved && (origin.parent?.persistentNode !== parent.source || (!!parent.source && parent.kind !== parent.source.kind));
        let own = origin ? this.from.listOf(origin) : null;
        // (a bullet item and an ordered one are two lists wherever they are)
        const type = (l: MdBlockAt | null): string | undefined => l?.block.attrs.list?.type;
        const marker = (l: MdBlockAt): string => `${l.block.attrs.list?.type} ${l.block.attrs.list?.bulletChar ?? l.block.attrs.list?.delimiter}`;
        const otherStaying = !moved && !!own && !!staying && own.block !== staying.block && marker(own) !== marker(staying);
        const withMoved = moved && !!own && movedFrom?.block === own.block;
        movedFrom = moved ? own : null;
        const joining = movedBefore !== null && (moved !== movedBefore || regrouped) && (!own || !list || type(own) === type(list)) && !otherStaying;
        movedBefore = moved;
        if (!moved && own && !staying && (joining || !run.length)) staying = own;
        if (joining) {
          // (the run's list is the one it lands in: an item that stays there says which)
          list = moved ? (list ?? own) : (own ?? list);
          run.push({ item: c, origin });
          return;
        }
        // a new item put in before another is in that one's list
        if (!origin && this.io.joins.get(c.id) === 'next') {
          const next = children.slice(i + 1).find((n) => n.kind !== 'item' || this.#under(parent, n));
          const nextOrigin = next?.kind === 'item' ? this.#under(parent, next) : null;
          own = nextOrigin ? this.from.listOf(nextOrigin) : null;
        }
        // (two lists of one kind and marker side by side are one: Markdown has no seam between them)
        if ((!withMoved && list && own && own.block !== list.block && marker(own) !== marker(list)) || otherStaying) flush();
        if (!moved && own && !staying) staying = own;
        // new items keeping their form (`pasteListForm: own`), where it differs from the list's: a list of their own
        const form = !origin && this.io.ownForms.has(c.id) ? formKey(this.io.listForms.get(c.id)!) : null;
        const key = form ?? (own ? marker(own) : (runKey ?? null));
        if (run.length && (form !== null || runForm) && key !== runKey) flush();
        runForm = form !== null;
        runKey = key;
        list ??= own;
        run.push({ item: c, origin });
      });
      flush();
    }
  }

  #list(run: readonly { item: Child; origin: OutlineNode | null }[], parent: Working): void {
    // the list's kind and marker: of an item that stays in it, else of one moved in
    const known = run.find((r) => r.origin?.kind === 'item' && !this.draft.placedIds.has(r.item.id)) ?? run.find((r) => r.origin?.kind === 'item');
    const list = known ? this.from.listOf(known.origin!) : null;
    const attrs = list?.block.attrs.list ?? null;
    // a list of new items only: the form they would rather have
    const form = list ? undefined : run.map((r) => this.io.listForms.get(r.item.id)).find((f) => f !== undefined);
    const ordered = form ? /^(\d{1,9})([.)])$/.exec(form) : null;
    const type = attrs?.type ?? (ordered ? 'ordered' : 'bullet');
    const marker = type === 'ordered' ? (attrs?.delimiter ?? ordered?.[2] ?? '.') : (attrs?.bulletChar ?? (form && !ordered ? form : this.from.config.bullet));
    const numberOf = (origin: OutlineNode): number | null => (origin.kind === 'item' ? parseInt(this.from.markerOf(origin), 10) : null);
    let numbers: (number | null)[] = run.map(() => null);
    if (type === 'ordered') {
      const own = run.map((r) => (r.origin ? numberOf(r.origin) : null));
      const listItems = list ? list.children() : [];
      const sameItems = list !== null && listItems.length === run.length && run.every((r, i) => r.origin && r.origin.startLine === listItems[i]!.line);
      const was = listItems.map((item) => parseInt(this.from.text.slice(this.from.mdTree.markerFrom(item), this.from.mdTree.markerTo(item)), 10));
      const alike = was.length > 1 && was.every((n) => n === was[0]);
      if (sameItems || alike) numbers = own.map((n) => n ?? (alike ? was[0]! : null));
      else {
        // the lower part of a list split in two keeps its numbers; else from the start of the list its first item came from
        const head = list && listItems[0]!.line !== run[0]!.origin?.startLine && this.#before(parent, run[0]!.item, listItems[0]!.line);
        const start = head ? (own[0] ?? 1) : (was[0] ?? own.find((n) => n !== null) ?? (ordered ? Number(ordered[1]) : 1));
        numbers = run.map((_, i) => start + i);
      }
      // moved right under a paragraph's text, which a list from another number can't interrupt: from 1
      const first = run[0]!.item;
      const k = parent.children.indexOf(first);
      const above = k > 0 ? parent.children[k - 1]! : parent;
      const aboveText = above === parent || above.kind === 'paragraph' ? (above instanceof Working ? this.io.textOf(above) : this.from.textOf(this.#under(parent, above)!)) : null;
      // (moved, its parent changed, or first now where an item was before it)
      const cameUnder = !!run[0]!.origin && (run[0]!.origin.parent?.persistentNode !== parent.source || (run[0]!.origin.index > 0 && k === 0 && parent.kind === 'item'));
      if ((this.draft.placedIds.has(first.id) || cameUnder) && numbers[0] !== 1 && aboveText instanceof ProseText && aboveText.type === 'paragraph' && !aboveText.empty) numbers = run.map((_, i) => 1 + i);
    }
    run.forEach((r, i) => this.lists.set(r.item.id, { start: i === 0, type, marker, number: numbers[i] ?? null }));
  }

  /** Whether the item of `from` at line `line` is among `parent`'s children before `item`. */
  #before(parent: Working, item: Child, line: number): boolean {
    for (const c of parent.children) {
      if (c === item) return false;
      const origin = this.#under(parent, c);
      if (origin?.startLine === line) return true;
    }
    return false;
  }

  // ---- 3. gaps

  /**
   * Blank lines at the seams the draft changed: each node keeps its own gap, wherever the
   * draft put it, but the document's end and each section's keep theirs; then a seam whose nodes
   * would run together is raised to one blank line, and one that would loosen a tight list, or end
   * an empty item, lowered.
   */
  #gaps(): void {
    const structural = this.#structural();
    this.#scopeEnds();
    // the seams to look at: every one under a parent whose children changed; around a text the draft set
    const seams = new Map<Working, Set<number>>();
    const add = (parent: Working, k: number): void => {
      if (k < parent.children.length) (seams.get(parent) ?? seams.set(parent, new Set()).get(parent)!).add(k);
    };
    // the seam after a subtree whose last line changed, and after each ancestor it ends
    const after = (w: Working): void => {
      for (let n = w; n.parent; n = n.parent) {
        const k = n.parent.children.indexOf(n);
        add(n.parent, k + 1);
        if (k < n.parent.children.length - 1) break;
      }
    };
    for (const parent of structural) {
      for (let k = -1; k < parent.children.length; k++) add(parent, k);
      after(parent);
    }
    for (const w of this.attached) {
      if (!this.#edited(w)) continue;
      add(w, -1);
      const parent = w.parent;
      if (!parent) continue;
      const k = parent.children.indexOf(w);
      add(parent, k === 0 ? -1 : k);
      if (!w.children.length) after(w);
    }
    for (const [parent, ks] of seams) this.#raise(parent, ks);
  }

  /**
   * The end of the document, and of each heading's section, keeps its blank lines (the user's, not a
   * moved node's): where the draft changed which node ends it, that node takes them, and the node
   * that ended it, still in the draft, the gap the new one had.
   */
  #scopeEnds(): void {
    const root = this.io.root;
    if (!root) return;
    const headings = [...this.attached].filter((w) => w.kind === 'heading' && w.source?.kind === 'heading');
    // (a scope and the one it ends, the document and its last section, end at one node: once)
    const ended = new Set<Working>();
    for (const scope of [root, ...headings]) {
      let was = scope.origin!;
      while (was.persistentNode.children.length) was = was.child(was.persistentNode.children.length - 1);
      let now: Working = scope;
      while (now.children.length) {
        now = this.io.openChild(now, now.children.length - 1);
        this.attached.add(now);
      }
      if (now === root || now.source === was.persistentNode || ended.has(now)) continue;
      ended.add(now);
      const own = now.gap;
      // (a node keeps a gap the command stated for it: Enter67's blank line after `---`, Enter37's line
      // that became an item)
      if (!this.io.statedGaps.has(now.id)) {
        now.gap = was.gap;
        this.gapLines.set(now.id, null);
      }
      const before = this.#opened(was);
      if (before && !this.io.statedGaps.has(before.id)) {
        before.gap = own;
        this.gapLines.set(before.id, null);
      }
    }
  }

  /** `node` of `from` opened where it is in the draft, with the path to it; null where the draft removed it. */
  #opened(node: OutlineNode): Working | null {
    const known = this.io.current.get(node.persistentNode);
    if (known) return known === this.io.root || this.attached.has(known) ? known : null;
    const parent = node.parent && this.#opened(node.parent);
    const k = parent ? parent.children.indexOf(node.persistentNode) : -1;
    if (!parent || k < 0) return null;
    const w = this.io.openChild(parent, k);
    this.attached.add(w);
    return w;
  }

  /** Whether anything follows child `k`'s subtree in the draft. */
  #followed(parent: Working, k: number): boolean {
    if (k < parent.children.length - 1) return true;
    for (let w: Working = parent; w.parent; w = w.parent) if (w.parent.children.indexOf(w) < w.parent.children.length - 1) return true;
    return false;
  }

  /** The blank lines after child `k` of `node`: its subtree's last descendant's gap. */
  #trailingGapOf(node: Child, k: number): number {
    let at: Child = node.children[k]!;
    while (at.children.length) at = at.children[at.children.length - 1]!;
    return at.gap;
  }

  #setTrailingGap(parent: Working, k: number, gap: number): void {
    let w = this.io.openChild(parent, k);
    this.attached.add(w);
    while (w.children.length) {
      const next = this.io.openChild(w, w.children.length - 1);
      this.attached.add(next);
      w = next;
    }
    w.gap = gap;
  }

  /**
   * Seams under `parent` (`ks`: the lower side's index; -1, its own text and its first child) with no
   * blank line where its nodes would run together: one blank line; refused where even that doesn't
   * keep them apart (indented code after an item, a node after an unclosed fence).
   */
  #raise(parent: Working, ks: ReadonlySet<number>): void {
    const n = parent.children.length;
    if (!n) return;
    const source = parent.source;
    const index = source ? new Map(source.children.map((c, i) => [c, i])) : null;
    const changed = (c: Child): boolean => c instanceof Working && (c.source === null || this.#edited(c));
    const made = (c: Child): boolean => c instanceof Working && c.source === null;
    for (const k of [...ks].sort((a, b) => a - b)) {
      if (k === -1) {
        // under an empty item, a node moved in comes right after its marker's line: `-` and one blank
        // line end an item, so the blank lines between go (Indent30)
        const own = this.io.textOf(parent);
        const emptyItem = parent.kind === 'item' && own instanceof ProseText && own.empty && !own.text.includes('\n') && this.draft.placedIds.has(parent.children[0]!.id);
        if (parent.gap > 0 && emptyItem) {
          parent.gap = 0;
          this.gapLines.set(parent.id, null);
        }
        // its own text and its first child, in the parent's container (an item's, its own)
        // (a quote's title in Obsidian is a block of one line; by the convention elsewhere a paragraph, which what follows can continue)
        const obsidianTitle = parent.source?.head?.type === 'callout_title' || (own instanceof ProseText && own.type === 'title' && this.from.config.flavor === 'obsidian');
        if (parent.kind === 'root' || parent.gap !== 0 || own === null || obsidianTitle) continue;
        const first = parent.children[0]!;
        // a new empty paragraph first under it, but a split's second half, is set off from its text
        if (made(first) && first.kind === 'paragraph' && first.text instanceof ProseText && first.text.empty && !this.gapLines.has(first.id)) {
          parent.gap = 1;
          continue;
        }
        const upper = this.#ownLines(parent, parent.origin, true);
        const lower = this.#firstLines(first, parent);
        // an item with no text but its frame (`-`, `- [ ]`) has no paragraph for what follows to continue
        const empty = parent.kind === 'item' && own instanceof ProseText && trimMd(own.body) === '' && !own.text.includes('\n');
        if (this.#apart(upper, lower, empty)) continue;
        if (!this.#apart(upper, ['', ...lower], empty)) throw new Refused(`the ${parent.children[0]!.kind} would be read as part of the ${parent.kind}'s text above it`);
        parent.gap = 1;
        continue;
      }
      if (k === 0) {
        const first = parent.children[0]!;
        if (!index || index.get(sourceOf(first)!) !== 0 || changed(first)) this.#keepsKind(parent, 0);
        continue;
      }
      const a = parent.children[k - 1]!;
      const b = parent.children[k]!;
      const ia = index?.get(sourceOf(a)!);
      const adjacent = ia !== undefined && index!.get(sourceOf(b)!) === ia + 1;
      // where they were, the upper side untouched (its subtree ends as it did) and the lower's first line too
      if (adjacent && !(a instanceof Working) && !changed(b)) continue;
      // (an item that was empty, given text, is a seam like any: what followed it, indented, may now be its)
      const filled = a instanceof Working && a.text instanceof ProseText && !a.text.empty && !!a.origin && this.from.textOf(a.origin) instanceof ProseText && (this.from.textOf(a.origin) as ProseText).empty;
      const sameList = a.kind === 'item' && b.kind === 'item' && this.#sameList(parent, a, b);
      // (the filled item's next sibling still one where its first line starts an item of the list)
      if (sameList && filled && this.#nextItem(this.#lastLines(a, parent), this.#firstLines(b, parent))) continue;
      if (sameList && !filled) {
        // an item the draft placed in a tight list (moved, or made an item), with its gap: the blank
        // line would loosen the list (Quote18, Indent29); a list joined where nothing moved keeps it (Backspace20)
        const placed = (c: Child): boolean => c instanceof Working && !!c.source && (this.draft.placedIds.has(c.id) || c.kind !== c.source.kind);
        // (the list it joined: of the item that stays)
        const stays = [a, b].filter((c) => !placed(c));
        const loose = (stays.length ? stays : [a, b]).some((c) => {
          const o = this.#under(parent, c);
          return !!o && this.from.listOf(o)?.block.attrs.tight === false;
        });
        const blanks = this.#trailingGapOf(parent, k - 1);
        if ((placed(a) || placed(b)) && !loose && blanks > 0) {
          this.#setTrailingGap(parent, k - 1, 0);
          this.gapLines.delete(this.#lastDescendant(parent.children[k - 1]!).id);
          // they still set the list apart from what follows it, where something does (a section's heading)
          let end = k;
          while (end + 1 < n && parent.children[end + 1]!.kind === 'item' && this.#sameList(parent, parent.children[end]!, parent.children[end + 1]!)) end++;
          if (this.#followed(parent, end) && this.#trailingGapOf(parent, end) < blanks) this.#setTrailingGap(parent, end, blanks);
          continue;
        }
        // a loose list stays loose: the item at the caret, new or not, set off from the item above by a blank line
        // (not a new item put in before another, which goes in tight)
        // (only where the draft put a new item in it)
        if (b === this.#caretNode() && this.io.joins.get(b.id) !== 'next' && parent.children.some(made) && this.#loose(parent, a, b) && this.#trailingGapOf(parent, k - 1) === 0) this.#setTrailingGap(parent, k - 1, 1);
        continue;
      }
      // the lower side reading as its kind first (a paragraph's padding that would make it code goes)
      this.#keepsKind(parent, k);
      const upper = this.#lastLines(a, parent);
      const lower = this.#firstLines(parent.children[k]!, parent);
      // a new empty paragraph, its placeholder's line, is set off by a blank line from what follows, but
      // where it has the blank lines that were there (a split's second half); from what is above, where
      // it would continue it (not a closed fence: Fence59)
      const last = this.#lastDescendant(a);
      const emptyNew = made(last) && last.kind === 'paragraph' && last.text instanceof ProseText && last.text.empty;
      if (this.#trailingGapOf(parent, k - 1) === 0 && emptyNew && !this.gapLines.has(last.id)) this.#setTrailingGap(parent, k - 1, 1);
      const blanks = this.#trailingGapOf(parent, k - 1);
      if (blanks > 0) {
        // apart already, unless even blank lines don't keep it (indented code after an item)
        if (!this.#apart(upper, [...Array<string>(blanks).fill(''), ...lower], false)) throw new Refused(`the ${b.kind} would join the ${a.kind} above it, even with a blank line between`);
        continue;
      }
      if (!this.#apart(upper, lower, false)) {
        if (!this.#apart(upper, ['', ...lower], false)) throw new Refused(`the ${b.kind} would join the ${a.kind} above it, even with a blank line between`);
        this.#setTrailingGap(parent, k - 1, 1);
      }
    }
  }

  /**
   * Child `k` of `parent`, its first lines written where they now are, reads as its kind: a paragraph
   * that would start indented code there (its first line's padding, four columns) is written again;
   * any other node that wouldn't is refused.
   */
  #keepsKind(parent: Working, k: number): void {
    const node = parent.children[k]!;
    if (node instanceof Working && node.text !== undefined) return;
    const origin = this.#under(parent, node);
    if (!origin) return;
    // (a setext heading read through its underline: its first lines alone are a paragraph)
    const text = this.from.textOf(origin);
    const setext = node.kind === 'heading' && text instanceof ProseText && text.heading?.form === 'setext';
    const lines = setext ? this.#readLines(containerIn(origin), origin.startLine, origin.textLastLine) : this.#firstLines(node, parent);
    const block = MdTree.parse(lines.join('\n'), this.from.mdTree.flavor).root.children[0];
    const want: Record<string, string> = { paragraph: 'paragraph', heading: 'heading', item: 'list', quote: 'blockquote' };
    const kind = want[node.kind] ?? origin.persistentNode.block!.type;
    if (!block || block.type === kind || trimMd(lines[0]!) === '') return;
    if (node.kind !== 'paragraph' || !(text instanceof ProseText)) throw new Refused(`the ${node.kind} would read as a ${block.type} where it now is`);
    const w = this.io.openChild(parent, k);
    this.attached.add(w);
    w.text = text;
    this.#escape(w);
  }

  /** Whether the list of items `a` and `b` (one of them read) was loose. */
  #loose(parent: Working, a: Child, b: Child): boolean {
    const origin = this.#under(parent, a) ?? this.#under(parent, b);
    return origin ? this.from.listOf(origin)?.block.attrs.tight === false : false;
  }

  /** The node `node`'s subtree ends with. */
  #lastDescendant(node: Child): Child {
    while (node.children.length) node = node.children[node.children.length - 1]!;
    return node;
  }

  /** Whether items `a` and `b`, one after the other under `parent`, are in one list: apart by their markers. */
  #sameList(parent: Working, a: Child, b: Child): boolean {
    const la = this.lists.get(a.id);
    const lb = this.lists.get(b.id);
    if (la && lb) return !lb.start;
    const origin = (c: Child): OutlineNode | null => this.#under(parent, c);
    const oa = origin(a);
    const ob = origin(b);
    return !!oa && !!ob && this.from.listOf(oa)?.block === this.from.listOf(ob)?.block;
  }

  /**
   * The lines of the text that ends `node`'s subtree, as written in its container: past the prefix of
   * the container it was in (where it stays, the one it will be in).
   */
  #lastLines(node: Child, parent: Working): string[] {
    let origin: OutlineNode | null = this.#under(parent, node);
    const container = origin ? containerIn(origin) : null;
    // the containers still open at its last line (items, quotes on the way down), by their first lines
    const open: string[] = [];
    let inQuote = false;
    let inside = '';
    // a subtree moved here from elsewhere: its lines as read in the container it was in, its
    // indentation there taken out (the writer lines it up), after the prefix where it is now
    let movedPrefix: string | null = null;
    let readIn = container;
    let dedent = 0;
    const moved = (lines: readonly string[]): string[] =>
      movedPrefix === null ? [...lines] : lines.map((l) => movedPrefix + l.slice(Math.min(dedent, /^ */.exec(l)![0].length)));
    const push = (lines: readonly string[]): void => {
      open.push(...moved(lines));
    };
    for (;;) {
      const n: number = node.children.length;
      if (!n) break;
      if ((node.kind === 'item' || node.kind === 'quote') && origin) {
        // its own text, and a blank line where one sets it off from what follows in it (in a quote, `>`)
        inQuote ||= node.kind === 'quote';
        push(node instanceof Working && node.text !== undefined ? this.#ownLines(node, readIn) : this.#remarked(node, origin, this.#readLines(readIn, origin.startLine, origin.textLastLine)));
        // what a new line in it starts with: its first line's prefix, its markers as spaces
        const first = this.from.mdTree.line(origin.startLine);
        const block = origin.persistentNode.block;
        const piece = first.prefix.find((p) => p.container.block === block);
        const end = node.kind === 'quote' && piece ? piece.to : first.contentFrom;
        inside = this.#lineIn(first, readIn).slice(0, Math.max(0, end - this.#cut(first, readIn))).replace(/[^>\t ]/g, ' ');
        if (node.gap > 0 || (n > 1 && this.#trailingGapOf(node, n - 2) > 0)) open.push(inQuote ? (movedPrefix ?? '') + '>' : '');
      } else if ((node.kind === 'item' || node.kind === 'quote') && node instanceof Working && !node.origin) {
        // one the draft made: its own text after its marker, where a new line in it starts at its content column
        inQuote ||= node.kind === 'quote';
        if (node.kind === 'item') open.push(...this.#ownLines(node, null).map((l) => inside + l));
        const place = this.lists.get(node.id);
        const marker = place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-');
        inside += node.kind === 'quote' ? '> ' : ' '.repeat(marker.length + 1);
        if (node.gap > 0 || (n > 1 && this.#trailingGapOf(node, n - 2) > 0)) open.push(inside.replace(/[ \t]+$/, ''));
      }
      const last: Child = node.children[n - 1]!;
      const next = last instanceof Working ? last.origin : origin ? childOrigin(origin, last) : null;
      // a child on its parent's first line (`- - a`) has that line already
      if (next && origin && next.startLine === origin.startLine && open.length) open.pop();
      // one moved here from elsewhere is written after this node's prefix, as a new one is
      // (or under a container the draft made another kind: an item unwrapped, its children out of it)
      const unwrapped = node instanceof Working && !!node.source && node.kind !== node.source.kind && (node.source.kind === 'item' || node.source.kind === 'quote');
      if (movedPrefix === null && next && origin && (!isDescendant(next, origin) || unwrapped)) {
        movedPrefix = inside;
        readIn = containerIn(next);
        dedent = /^ */.exec(this.#readLines(readIn, next.startLine, next.startLine)[0]!)![0].length;
      }
      origin = next;
      node = last;
    }
    let own = node instanceof Working && node.text !== undefined ? this.#ownLines(node, readIn) : origin ? this.#remarked(node, origin, this.#readLines(readIn, origin.persistentNode.kind === 'item' ? origin.startLine : origin.textFirstLine, origin.textLastLine)) : node instanceof Working ? this.#ownLines(node, readIn) : [''];
    // a read paragraph's first-line padding isn't text: read alone, four columns of it would be code
    if (node.kind === 'paragraph' && !(node instanceof Working && node.text !== undefined) && movedPrefix === null && own.length) own[0] = own[0]!.replace(/^[ \t]+/, '');
    // a node the draft made has no old lines: it is written after the prefix of the container it is in
    if (movedPrefix !== null) {
      // its lazy lines stay lazy, as the writer keeps them
      const first = origin && !(node instanceof Working && node.text !== undefined) ? (origin.persistentNode.kind === 'item' ? origin.startLine : origin.textFirstLine) : -1;
      const lazy = (k: number): boolean => first >= 0 && k > 0 && this.from.mdTree.line(first + k).lazy;
      own = moved(own).map((l, k) => (lazy(k) ? own[k]! : l));
    } else if (!origin && inside) own = own.map((l) => inside + l);
    return [...open, ...own];
  }

  /**
   * How far past `container`'s content column a new item is written in a document indented with
   * tabs, where it lines up with no item there: a tab past the container's marker (the writer's `tabChild`).
   */
  #tabChild(node: Working, container: OutlineNode | null): number {
    const text = this.from.text;
    container ??= node.parent?.origin ?? null;
    if (!container || container.kind !== 'item' || !/(?:^|\n)[ >]*\t/.test(text)) return 0;
    if (node.parent?.children.some((c) => c !== node && c.kind === 'item' && !!this.#under(node.parent!, c))) return 0;
    const line = this.from.mdTree.line(container.startLine);
    const block = container.persistentNode.block!;
    let column = 0;
    for (const c of text.slice(line.from, line.from + block.attrs.markerStart!)) column = c === '\t' ? column + 4 - (column % 4) : column + 1;
    if (text.slice(line.from, line.contentFrom).includes('>')) return 0;
    return Math.max(0, column + 4 - (column % 4) - block.attrs.contentColumn!);
  }

  /** The lines of `node`'s own text, as written in `container` (an outer one, or the node itself: an item's past its marker). */
  #ownLines(node: Working, container: OutlineNode | null, own = !!node.origin && container === node.origin): string[] {
    const origin = node.origin;
    if (node.text === undefined) {
      if (!origin) return [''];
      return this.#readLines(container, own || node.kind !== 'item' ? origin.textFirstLine : origin.startLine, origin.textLastLine);
    }
    const written = this.#written(node);
    if (!origin || node.kind !== node.source?.kind) {
      // a node the draft made, or of another kind (written whole, as a new one): an item after its marker, its list's
      if (node.kind !== 'item' || own) return written;
      const place = this.lists.get(node.id);
      const marker = place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-');
      // (in a document indented with tabs, a new item first in an item a tab past its marker, as the writer puts it)
      const indent = ' '.repeat(this.#tabChild(node, container));
      return written.map((l, k) => (k === 0 ? `${indent}${marker} ${l}` : `${indent}${' '.repeat(marker.length + 1)}${l}`));
    }
    // after the prefix its first line had in the container, the rest at its content column
    const tree = this.from.mdTree;
    const first = tree.line(node.kind === 'item' && !own ? origin.startLine : origin.textFirstLine);
    const cut = this.#cut(first, container);
    // up to where its text starts, in the line as the container holds it (a partly taken tab as its columns)
    const held = this.#lineIn(first, container);
    const widened = held.length - (first.to - cut);
    // (an item that had no text, its first block on its line: after its marker and a space)
    const textless = !this.from.textOf(origin);
    const at = textless ? first.from + origin.persistentNode.block!.attrs.markerEnd! : this.from.posOf(origin, 0, -1);
    const lead = own ? '' : held.slice(0, Math.max(0, at - cut + widened)) + (textless ? ' ' : '');
    // the later lines' prefix: the first line's pieces past the container's, a quote's `>` as written, an item's as spaces to its text
    const after = container && container.kind !== 'root' ? first.prefix.findIndex((p) => p.container.block === container.persistentNode.block) + 1 : 0;
    const ownItem = node.kind === 'item' && !own ? origin.persistentNode.block : null;
    const indent = first.prefix
      .slice(after)
      .map((p) => (p.container.block.type === 'blockquote' ? this.from.text.slice(p.from, p.to) : ' '.repeat((p.container.block === ownItem ? ownItem.attrs.contentColumn! : p.toColumn) - p.fromColumn)))
      .join('');
    return written.map((l, k) => (k === 0 ? lead + l : indent + l));
  }

  /** The first lines of `node`, up to two, as written in its container, from where it starts (an item's marker, a quote's `>`). */
  #firstLines(node: Child, parent: Working): string[] {
    // a new quote with no text: its first child's, after its `>`
    if (node instanceof Working && !node.origin && node.kind === 'quote' && node.text === null && node.children.length) return this.#firstLines(node.children[0]!, node).map((l) => `> ${l}`);
    const origin = this.#under(parent, node);
    const container = origin ? containerIn(origin) : null;
    let lines: string[];
    if (node instanceof Working && node.text !== undefined) lines = this.#ownLines(node, container).slice(0, 2);
    else if (!origin) return [''];
    else lines = this.#readLines(container, origin.startLine, Math.min(origin.startLine + 1, Math.max(origin.startLine, origin.textLastLine)));
    return this.#remarked(node, origin, lines);
  }

  /** `lines`, the first `node`'s first line as read in its container, with the marker its list gives it now: renumbered, another bullet. */
  #remarked(node: Child, origin: OutlineNode | null, lines: string[]): string[] {
    const place = node.kind === 'item' && origin?.kind === 'item' ? this.lists.get(node.id) : undefined;
    if (!place || !origin || (place.type === 'ordered' && place.number === null) || !lines.length) return lines;
    // (its marker past the indentation the line has in the container, tabs and all)
    const at = /^[ \t]*/.exec(lines[0]!)![0].length;
    const old = this.from.markerOf(origin);
    const now = place.type === 'bullet' ? place.marker : `${place.number}${place.marker}`;
    if (lines[0]!.slice(at, at + old.length) !== old) return lines;
    return [lines[0]!.slice(0, at) + now + lines[0]!.slice(at + old.length), ...lines.slice(1)];
  }

  /** Lines `a`–`b` of `from` as written in `container`: past its prefix; an empty line a placeholder holds read as typed on. */
  #readLines(container: OutlineNode | null, a: number, b: number): string[] {
    const tree = this.from.mdTree;
    const out: string[] = [];
    for (let i = a; i <= b; i++) {
      const line = tree.line(i);
      const held = emptyNodeAt(this.from.marks, this.from.text, line.to);
      // a held space reads as typed on, as the parse reads it
      const cut = this.#cut(line, container);
      const space = this.from.marks.marks.find((m) => m.from >= cut && m.from < line.to && isHeldSpacePlaceholder(m, this.from.text));
      let content = this.#lineIn(line, container);
      if (space) {
        const at = space.from - cut + (content.length - (line.to - cut));
        content = content.slice(0, at) + SENTINEL + content.slice(at + 1);
      }
      out.push(content + (held ? SENTINEL : ''));
    }
    return out;
  }

  /** `line` as `container` holds it: past its prefix, a tab the prefix took part of written as the columns left of it. */
  #lineIn(line: MdLine, container: OutlineNode | null): string {
    const text = this.from.text;
    const cut = this.#cut(line, container);
    const column = this.#cutColumn(line, container);
    if (text[cut] === '\t' && line.prefix.some((p) => p.partialTab && p.to === cut)) return ' '.repeat(4 - (column % 4)) + text.slice(cut + 1, line.to);
    return text.slice(cut, line.to);
  }

  /** Where `line`'s content in `container` starts: past the container's prefix piece (a lazy line has none: its content). */
  #cut(line: MdLine, container: OutlineNode | null): number {
    if (!container || container.kind === 'root') return line.from;
    const piece = line.prefix.find((p) => p.container.block === container.persistentNode.block);
    return piece ? piece.to : line.contentFrom;
  }

  #cutColumn(line: MdLine, container: OutlineNode | null): number {
    if (!container || container.kind === 'root') return 0;
    const piece = line.prefix.find((p) => p.container.block === container.persistentNode.block);
    return piece ? piece.toColumn : line.contentColumn;
  }

  /** A text the draft set, its lines as they will be written: its markup escapes in, an empty line a placeholder holds read as typed on. */
  #written(w: Working): string[] {
    const text = w.text;
    if (!text) return [''];
    const s = text.text;
    const escapes = this.escapes.get(w.id) ?? [];
    const out: string[] = [];
    let at = 0;
    for (const l of s.split('\n')) {
      let line = l;
      for (const e of [...escapes].reverse()) if (e >= at && e <= at + l.length) line = line.slice(0, e - at) + '\\' + line.slice(e - at);
      out.push(emptyNodeAt(text.marks, s, at + l.length) ? line + SENTINEL : line);
      at += l.length + 1;
    }
    return out;
  }

  /** Whether `lower`'s first line, written after `upper` (an item's last lines), starts an item of the list `upper` starts. */
  #nextItem(upper: readonly string[], lower: readonly string[]): boolean {
    const root = MdTree.parse([...upper, ...lower].join('\n'), this.from.mdTree.flavor).root;
    const list = root.children[0];
    return list?.type === 'list' && list.offsets.some((at) => root.offsets[0]! + at === upper.length);
  }

  /**
   * Whether `lower`, written under `upper` (lines as their container holds them), starts a block of
   * its own and leaves `upper` reading as it does. `emptyItem`: `upper` is an empty item's text, and
   * `lower` its first child, which would be its text if it held text (a list, a quote stay children).
   */
  #apart(upper: readonly string[], lower: readonly string[], emptyItem: boolean): boolean {
    const flavor = this.from.mdTree.flavor;
    const n = upper.length;
    if (emptyItem) {
      // written as the item writes them, after its marker and at its content column: its first block
      // past its own line a block of blocks (its checkbox alone, `- [ ]`, holds no paragraph in GFM)
      if (lower.every((l) => trimMd(l) === '')) return true;
      const item = MdTree.parse([...upper.map((l, k) => (k ? '  ' : '- ') + l), ...lower.map((l) => (l ? '  ' + l : l))].join('\n'), flavor).root.children[0]?.children[0];
      const k = item ? item.offsets.findIndex((at) => at >= n) : -1;
      return k >= 0 && item!.offsets[k] === n && flavor.content(item!.children[k]!.type) === 'blocks';
    }
    const tree = MdTree.parse([...upper, ...lower].join('\n'), flavor);
    const root = tree.root;
    const blocks = root.children;
    const alone = MdTree.parse(upper.join('\n'), flavor).root;
    const ends = (r: typeof root, i: number): number => r.offsets[i]! + r.children[i]!.lines;
    if (blocks.length <= alone.children.length || alone.children.some((b, i) => blocks[i]!.type !== b.type || ends(root, i) !== ends(alone, i))) return false;
    // past the blank lines `lower` starts with, its first line starts a block
    let k = n;
    while (k < n + lower.length && trimMd(lower[k - n]!) === '') k++;
    const line = tree.line(Math.min(k, tree.lineCount - 1));
    return line.leaf?.line === k || line.containers.some((c) => c.line === k);
  }

  // ---- 4. roles and escapes

  /** For every node whose text the draft set: the escapes that keep its lines its text where they are (`escapeParagraph`). */
  #escapes(): void {
    // a paragraph that moves, its text as it was, whose later line could start a block (`- c` under
    // `1. b` once re-indented): its text set, spelled whole where it is, with the escapes
    // that keep the line its text
    // (and a paragraph anywhere in a subtree that moves: its lines move with it)
    // (or on its item's marker line, `- > q`, no longer first there, or under the item's text now: its
    // line is written anew, as the writer's)
    const onItemsLine = (node: OutlineNode): boolean => {
      for (let up = node.parent; up && up.kind !== 'root' && up.startLine === node.startLine; up = up.parent) if (up.kind === 'item') return true;
      return false;
    };
    // (what it is: placed, which may leave its container; or its lines written anew where they are)
    const moving = (parent: Working, c: Child, k: number): 'placed' | 'rewritten' | null => {
      if (!!parent.source && parent.kind !== parent.source.kind) return 'rewritten';
      if (this.draft.placedIds.has(c.id)) return 'placed';
      const origin = this.#under(parent, c);
      return origin && onItemsLine(origin) && (k > 0 || (parent.kind === 'item' && !!this.io.textOf(parent) && !!parent.origin && !this.from.textOf(parent.origin))) ? 'rewritten' : null;
    };
    const containerId = (node: OutlineNode | null): number | null => {
      let up = node;
      while (up && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root') up = up.parent;
      return up ? up.id : null;
    };
    const needs = (text: OutlineNodeText | null): text is ProseText => text instanceof ProseText && text.type === 'paragraph' && text.text.split('\n').slice(1).some((l) => /^[ \t]*[-+*>#=|0-9]/.test(l));
    // (the read nodes under one, by where they are in `from`: whether one of them is such a paragraph)
    const holds = (origin: OutlineNode): boolean => origin.children.some((c) => needs(this.from.textOf(c)) || holds(c));
    const visit = (parent: Working, inMoved: boolean): void => {
      parent.children.forEach((c, k) => {
        // (a copy as its original is written)
        if (c.source && c.source.id !== c.id) return;
        const how = inMoved ? 'rewritten' : moving(parent, c, k);
        if (!how) return;
        const origin = c instanceof Working ? c.origin : this.#under(parent, c);
        const text = c instanceof Working && c.text !== undefined ? null : origin ? this.from.textOf(origin) : null;
        if (needs(text)) {
          const w = this.io.openChild(parent, k);
          this.attached.add(w);
          w.text = text;
        }
        // (in a subtree that leaves its container, whose lines are written past another prefix; opened
        // only on the way to one)
        const leaves = how === 'rewritten' || (!!origin && containerId(origin.parent) !== this.#containerOf(parent));
        if (leaves && (c instanceof Working ? c.children.length > 0 : !!origin && holds(origin))) {
          const w = this.io.openChild(parent, k);
          this.attached.add(w);
          visit(w, true);
        }
      });
    };
    for (const parent of [...this.attached]) visit(parent, false);
    for (const w of this.attached) this.#escape(w);
  }

  /**
   * `w`'s escapes, where the draft set its text: the backslashes that are markup where it now is
   * absorbed (`revise 2\\. draft` split before `2\\.`: the text loses it), then the escapes that keep
   * its lines its text, markup ones kept apart, others the text gains.
   * To revisit: an author's backslash is absorbed as a generated one is, so a join back drops it
   * (`revise 2\\. draft`, Enter before `2`, then Backspace: `revise2. draft`); with a mark on the
   * escapes ourus writes, only those would go.
   */
  #escape(w: Working): void {
    if (!(w.text instanceof ProseText)) return;
    const text = w.text;
    const below = text.frame.find((p) => p.part === 'below');
    const base = below ? below.to : 0;
    const lines = text.text.slice(base).split('\n');
    // where each line starts in the text
    const starts = (ls: readonly string[]): number[] => {
      const out: number[] = [];
      let from = base;
      for (const l of ls) {
        out.push(from);
        from += l.length + 1;
      }
      return out;
    };
    const at = starts(lines);
    // a line a placeholder holds reads as typed on at its end (a checkbox's too)
    const held = lines.map((l, k) => emptyNodeAt(text.marks, text.text, at[k]! + l.length));
    // (a line starting with a tab: it spans as far as from the column the line is written at)
    const column = lines.some((l) => /^ *\t/.test(l)) ? this.#textColumn(w) : null;
    if (column !== null) this.columns.set(w.id, column);
    const spelled = escapeParagraph(this.from.mdTree.flavor, text.type, text.item, lines, held, column === null ? undefined : lines.map(() => column));
    if (!spelled) throw new Refused(`no escape keeps the text of node ${w.id} where it is`);
    let out = text;
    for (const e of [...spelled.absorbed].reverse()) out = out.splice(at[e.line]! + e.at, at[e.line]! + e.at + 1);
    if (spelled.gained.length) {
      // the backslashes the text gains, in the text before them, last first
      const plain = starts(out.text.slice(base).split('\n'));
      const gained = spelled.gained.map((g) => plain[g.line]! + g.at);
      for (let i = gained.length - 1; i >= 0; i--) out = out.splice(gained[i]!, gained[i]!, '\\');
      this.gained.set(w, gained);
    }
    w.text = out;
    // (none, too: the text is spelled where it is)
    const written = starts(spelled.lines);
    this.escapes.set(w.id, spelled.markup.map((m) => written[m.line]! + m.at));
  }

  /**
   * The column the later lines of `w`'s text start at, as the writer writes them: where `w` is as it
   * was (same kind, same parent, not placed), where they started; else its container's column, an
   * item's past its marker, a space and its padding.
   */
  #textColumn(w: Working): number {
    const origin = w.origin;
    if (origin && w.source && w.kind === w.source.kind && !this.draft.placedIds.has(w.id) && origin.parent?.id === w.parent?.id) {
      // (as the writer continues it: `continuationAsWas`)
      const prefix = continuationAsWas(this.from.text, origin, this.from.mdTree.line(origin.kind === 'item' ? origin.startLine : origin.textFirstLine));
      return advanceColumns(prefix, 0, prefix.length, 0);
    }
    if (w.kind !== 'item') return this.#containerColumn(w.parent);
    const place = this.lists.get(w.id);
    const marker = this.draft.hints.get(w.id) ?? (place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-'));
    // (a read item moved keeps its marker and what follows it to its text)
    const width = origin?.kind === 'item' && w.kind === origin.kind ? origin.block.attrs.contentColumn! - origin.block.attrs.markerColumn! : marker.length + 1 + (this.paddings.get(w.id) ?? 0);
    return this.#markerColumn(w) + width;
  }

  /**
   * The column item `w`'s marker is written at, as the writer places it: where it was, if it is;
   * else lined up with an item of its list beside it that stays; else, in a document indented with
   * tabs, a tab past its parent item's marker; else at its container's column.
   */
  #markerColumn(w: Working): number {
    const origin = w.origin;
    if (origin?.kind === 'item' && !this.draft.placedIds.has(w.id) && origin.parent?.id === w.parent?.id) return origin.block.attrs.markerColumn!;
    const parent = w.parent;
    if (parent) {
      const k = parent.children.indexOf(w);
      for (const step of [-1, 1]) {
        for (let j = k + step; j >= 0 && j < parent.children.length; j += step) {
          const sibling = parent.children[j]!;
          if (sibling.kind !== 'item' || this.lists.get((step < 0 ? parent.children[j + 1]! : sibling).id)?.start) break;
          if (this.draft.placedIds.has(sibling.id)) continue;
          const at = this.#under(parent, sibling);
          if (at && at.parent?.id === parent.id) return at.block.attrs.markerColumn!;
          break;
        }
      }
      if (parent.kind === 'item' && /(?:^|\n)[ >]*\t/.test(this.from.text)) {
        const column = this.#markerColumn(parent);
        return column + 4 - (column % 4);
      }
    }
    return this.#containerColumn(parent);
  }

  /** The id of the container (item, quote, root) children of `p` are in: `p`'s own, or its nearest. */
  #containerOf(p: Working | null): number | null {
    let up = p;
    while (up && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root') up = up.parent;
    return up ? up.id : null;
  }

  /** The column the children of `p` are written at: an item's text's, a quote's past its `> `, a section's its container's. */
  #containerColumn(p: Working | null): number {
    if (!p || p.kind === 'root') return 0;
    if (p.kind === 'item') return this.#textColumn(p);
    if (p.kind === 'quote') {
      const origin = p.origin;
      if (origin && !this.draft.placedIds.has(p.id) && origin.parent?.id === p.parent?.id) {
        const piece = this.from.mdTree.line(origin.startLine).prefix.find((q) => q.container.block === origin.block);
        if (piece) return piece.toColumn;
      }
      return this.#containerColumn(p.parent) + 2;
    }
    return this.#containerColumn(p.parent);
  }

  /**
   * Every atom text the draft set reads as its block, alone: where a line of fenced code would
   * close it early, its fences grow past every such run (the shortest that holds, as WorkFlowy and Tana
   * write them; never shorter than they were); a block that can't grow (`$$`, `%%`, indented code) is
   * refused.
   */
  #atomTexts(): void {
    for (const w of this.attached) {
      let text = w.text;
      if (!(text instanceof AtomText)) continue;
      // code an item's text, on its marker's line: the spaces its fence was indented with would be the
      // item's padding there; they go from every line, as code past its fence's indentation reads
      if (w.kind === 'item' && text.type === 'fenced_code' && /^ +/.test(text.text)) {
        const indent = /^ */.exec(text.text)![0].length;
        const lost: { at: number; n: number }[] = [];
        let at = 0;
        for (const l of text.text.split('\n')) {
          const n = Math.min(indent, /^ */.exec(l)![0].length);
          if (n) lost.push({ at, n });
          at += l.length + 1;
        }
        for (const { at: from, n } of [...lost].reverse()) text = text.splice(from, from + n);
        w.text = text;
        this.lost.set(w, lost);
      }
      // a block closed by its delimiter stays closed: its lines alone read as unclosed too, but it would take in what follows
      const was = w.origin ? this.from.textOf(w.origin) : null;
      if (was instanceof AtomText && was.closed && !text.closed) throw new Refused(`the ${text.type.replace('_', ' ')} would lose its closing delimiter`);
      if (this.from.readsAs(text)) continue;
      const open = text.frame.find((p) => p.part === 'open');
      const char = text.type === 'fenced_code' && open ? text.text[open.from]! : null;
      if (!char || !open) throw new Refused(`the lines would end the ${text.type.replace('_', ' ')}`);
      const s = text.text;
      const length = open.to - open.from;
      const runs = [...s.slice(s.indexOf('\n', open.to) + 1).matchAll(new RegExp(`^[ \\t]*(${char === '`' ? '`' : '~'}+)`, 'gm'))].map((m) => Math.max(3, m[1]!.length + 1));
      const close = text.frame.find((p) => p.part === 'close');
      const closeEnd = close ? close.from + /^[ \t]*[`~]+/.exec(s.slice(close.from))![0].length : -1;
      const grown = [...new Set(runs)].sort((a, b) => a - b).filter((n) => n > length).map((n) => {
        const more = char.repeat(n - length);
        const closed = close ? text.splice(closeEnd, closeEnd, more) : text;
        return { more: n - length, text: closed.splice(open.to, open.to, more) };
      }).find((g) => this.from.readsAs(g.text));
      if (!grown) throw new Refused('the code would close its fence, however long');
      w.text = grown.text;
      // anchors past each run move on, in the text as it grows
      const at: number[] = [];
      for (let k = 0; k < grown.more; k++) at.push(open.to + k);
      if (close) for (let k = 0; k < grown.more; k++) at.push(closeEnd + grown.more + k);
      this.gained.set(w, at);
    }
  }

  // ---- 5. placeholders

  /** A moved node with an empty text is written again where it lands: where it is now decides its placeholder (Indent8). */
  #movedEmpty(): void {
    for (const w of this.attached) {
      if (w.text !== undefined || !w.source || !this.draft.placedIds.has(w.id)) continue;
      const text = this.io.textOf(w);
      if (text instanceof ProseText && text.empty) w.text = text;
    }
  }

  /**
   * The placeholders of every text the draft set: none of its held spaces (writing it settles them),
   * and an empty node's where no spelling holds it otherwise: an empty paragraph; an empty item at the
   * caret right under its parent's paragraph text (away from it a blank line above holds it); an
   * empty item, or a checkbox alone, whose children follow a blank line. An empty last line is a blank
   * line after the text; any other empty line inside a text has no Markdown: refused.
   */
  #placeholders(): void {
    for (const w of this.attached) {
      let text = w.text;
      if (!(text instanceof ProseText)) continue;
      const below = text.frame.find((p) => p.part === 'below');
      const base = below ? below.to : 0;
      // an empty last line (Shift-Enter at the text's end, a paste ending with a line break, a last line
      // emptied): Markdown holds none in a text; it is a blank line after it, the first of the node's
      // gap, an anchor in it on that line
      let cut = text.text.length;
      for (let k = text.text.lastIndexOf('\n', cut - 1); k >= base && trimMd(text.text.slice(k + 1, cut)) === ''; k = text.text.lastIndexOf('\n', k - 1)) cut = k;
      if (cut < text.text.length && cut > base) {
        w.gap += text.text.slice(cut).split('\n').length - 1;
        this.blankTails.set(w, cut);
        w.text = text = text.slice(0, cut);
      }
      // a text that starts below its marker now (its first line emptied): what its next line starts
      // with is padding there, not text
      if (below && /^[ \t]+/.test(text.text.slice(base))) w.text = text = text.splice(base, base + /^[ \t]+/.exec(text.text.slice(base))![0].length);
      const s = text.text;
      const lines = s.split('\n');
      // any other empty line has no Markdown in a text, and a text below its marker with nothing left
      if (s.slice(base).split('\n').some((l, _, all) => (all.length > 1 || !!below) && trimMd(l) === '')) throw new Refused('an empty line inside a text');
      const task = text.frame.find((p) => p.part === 'task');
      const boxOnly = !!task && task.from === 0 && task.to === lines[0]!.length;
      const marks: Mark[] = text.marks.marks.filter((m) => !isPlaceholder(m));
      // an empty item alone reads as one, but right under its parent's text, which `-` would underline:
      // there a placeholder holds it at the caret, and away from it a blank line above
      const parentText = w.parent && w.parent.kind !== 'root' ? this.io.textOf(w.parent) : null;
      const underText = parentText instanceof ProseText && parentText.type === 'paragraph' && !parentText.empty && w.parent!.children[0] === w && w.parent!.gap === 0;
      const atCaret = w === this.#caretNode();
      if (w.kind === 'item' && s === '' && underText && !atCaret) w.parent!.gap = 1;
      // and an empty item, or a checkbox alone, whose children follow a blank line: `-` and one blank line end an item
      const apartChildren = w.kind === 'item' && w.children.length > 0 && w.gap > 0 && (s === '' || (lines.length === 1 && boxOnly));
      if ((s === '' && (w.kind !== 'item' || (underText && atCaret))) || apartChildren) marks.push(createPlaceholder(s.length));
      const next = MarkSet.of(marks);
      if (next.size !== text.marks.size || next.marks.some((m, i) => m.kind !== text.marks.marks[i]!.kind || m.from !== text.marks.marks[i]!.from)) {
        w.text = new ProseText(text.type, text.item, s, next);
      }
    }
  }

  /** The working copy the caret is in, if the draft touched it. */
  #caretNode(): Working | undefined {
    const spec = this.io.caret;
    if (!spec || !('ref' in spec)) return undefined;
    return typeof spec.ref === 'number' ? this.io.byId.get(spec.ref) : this.io.current.get(spec.ref.persistentNode);
  }

  /**
   * The spaces a text the draft set starts with (an item's, a paragraph's: a split's second half that
   * kept them, `enterSplitSpace: start`): Markdown reads them as its first line's padding, not text, so
   * they leave the text for its node's padding, three at most (four would make it code: the rest go).
   */
  #leadingSpaces(): void {
    for (const w of this.attached) {
      const text = w.text;
      if (!(text instanceof ProseText) || text.type !== 'paragraph' || (w.kind !== 'item' && w.kind !== 'paragraph')) continue;
      // (past the line breaks an item's text starts with below its marker: its first line of text's)
      const at = text.textStart(0);
      let end = at;
      while (text.text[end] === ' ') end++;
      if (end === at || end === text.text.length || text.text[end] === '\n') continue;
      w.text = text.splice(at, end);
      this.leading.set(w, { at, n: end - at });
      this.paddings.set(w.id, Math.min(3, end - at));
    }
  }

  // ---- 6. anchors

  #anchor(spec: AnchorSpec | null): Anchor | null {
    if (!spec) return null;
    if ('blank' in spec) {
      const w = typeof spec.blank === 'number' ? this.io.byId.get(spec.blank) : this.io.current.get(spec.blank.persistentNode);
      // (a node the draft didn't change: its blank lines as they are, where the position was)
      if ((!w || !this.attached.has(w)) && spec.old !== undefined) return { old: spec.old, assoc: 1 };
      if (!w || !this.attached.has(w)) throw new Error("an anchor on a blank line of a node the draft didn't change");
      return { blank: w as unknown as OutlineNodePersistent, line: spec.line };
    }
    const assoc = spec.assoc ?? 1;
    if ('old' in spec) {
      const otherwise = spec.otherwise && this.#anchor(spec.otherwise);
      return otherwise ? { old: spec.old, assoc, otherwise } : { old: spec.old, assoc };
    }
    const ref = spec.ref;
    let w: Working | undefined;
    if (typeof ref === 'number') w = this.io.byId.get(ref) ?? (ref === 0 ? (this.io.root ?? undefined) : undefined);
    else w = this.io.current.get(ref.persistentNode);
    if (!w) {
      if (typeof ref === 'number') throw new Error(`an anchor in node ${ref}, which the draft didn't touch`);
      // a node the draft didn't touch: where it is, in lines copied as they are
      // in the subtree of the nearest ancestor the draft touched: removed with it, or where it went
      for (let up: OutlineNode | null = ref.parent; up; up = up.parent) {
        const opened = this.io.current.get(up.persistentNode);
        if (!opened) continue;
        if (!this.attached.has(opened) && opened !== this.io.root) throw new Error(`an anchor in node ${ref.id}, which the draft removed`);
        break;
      }
      return withBefore({ old: this.from.posOf(ref, spec.offset, assoc), assoc }, spec.before);
    }
    if (w !== this.io.root && !this.attached.has(w)) throw new Error(`an anchor in node ${w.id}, which the draft removed`);
    // in lines copied as they are, where they were; a copy's (`copy`), where the copy is
    if (w.text === undefined && w.source?.id === w.id) return withBefore({ old: this.from.posOf(w.origin!, spec.offset, assoc), assoc }, spec.before);
    // past the text's end, in an empty last line made a blank line after it: on that line
    const tail = this.blankTails.get(w);
    if (tail !== undefined && spec.offset > tail) return { blank: w as unknown as OutlineNodePersistent, line: 0 };
    let offset = spec.offset;
    // (in the spaces a text started with, now its padding: as many columns before its text)
    let before = spec.before ?? 0;
    const lead = this.leading.get(w);
    if (lead && offset >= lead.at && offset <= lead.at + lead.n) {
      before = Math.max(0, Math.min(3, lead.n) - (offset - lead.at));
      offset = lead.at;
    } else if (lead && offset > lead.at) offset -= lead.n;
    let gone = 0;
    for (const { at, n } of this.lost.get(w) ?? []) if (offset > at) gone += Math.min(n, offset - at);
    offset -= gone;
    for (const at of this.gained.get(w) ?? []) if (offset > at || (offset === at && assoc > 0)) offset++;
    return before ? { node: w as unknown as OutlineNodePersistent, offset, assoc, before } : { node: w as unknown as OutlineNodePersistent, offset, assoc };
  }

  // ---- freezing

  readonly #frozen = new Map<Working, OutlineNodePersistent>();

  #freeze(w: Working, origins: Map<OutlineNodePersistent, OutlineNode>): OutlineNodePersistent {
    const children = w.children.map((c) => {
      if (c instanceof Working) return this.#freeze(c, origins);
      const origin = this.#under(w, c);
      if (origin) origins.set(c, origin);
      return c;
    });
    const s = w.source;
    // (a root whose leading blank lines change is the writer's to write, its children copied)
    const unchanged = s && w.text === undefined && w.kind === s.kind && w.gap === s.gap && !this.gapLines.has(w.id) && w.id === s.id && children.length === s.children.length && children.every((c, i) => c === s.children[i]) && !(w === this.io.root && this.preamble !== null);
    const node = unchanged ? s : OutlineNodePersistent.drafted(w.id, w.kind, s, w.text, w.gap, children);
    if (w.origin) origins.set(node, w.origin);
    this.#frozen.set(w, node);
    return node;
  }
}

/** `anchor`, `before` columns before where it is (in the padding before a text), where that is any. */
function withBefore<T extends Anchor>(anchor: T, before: number | undefined): T {
  return before ? { ...anchor, before } : anchor;
}

/** The nearest container (root, item, quote) above `node` in its document. */
function containerIn(node: OutlineNode): OutlineNode {
  let up = node.parent ?? node;
  while (up.parent && up.kind !== 'item' && up.kind !== 'quote') up = up.parent;
  return up;
}

/** The read node a child of the draft was, or null for one it made. */
function sourceOf(c: Child): OutlineNodePersistent | null {
  return c instanceof Working ? c.source : c;
}

/** The lines of `from` holding `node`'s own gap, after its text: `[from, to)`. */
function ownGapLines(node: OutlineNode): readonly [number, number] {
  const p = node.persistentNode;
  const end = node.startLine + (p.children.length ? p.offsets[0]! : p.lines);
  return [node.textLastLine + 1, end];
}

/** Whether `node` is `ancestor` or below it, in `from`. */
function isDescendant(node: OutlineNode, ancestor: OutlineNode): boolean {
  for (let up: OutlineNode | null = node; up; up = up.parent) if (up.persistentNode === ancestor.persistentNode) return true;
  return false;
}

/** A marker's list form, as two lists side by side compare (`ordered .`, `bullet -`). */
function formKey(marker: string): string {
  const ordered = /^\d{1,9}([.)])$/.exec(marker);
  return ordered ? `ordered ${ordered[1]}` : `bullet ${marker}`;
}
