// The draft: the outline a command wants, made from a document's, in which every node
// the command didn't touch is the document's own. A command changes it with its operations; `done()`
// puts it in normal form and fixes what the result must read as (lists, blank lines, escapes,
// placeholders, where the anchors are), or refuses what Markdown can't say; then writes it as changes
// (`write.ts`), and reads the new document back against it (`check.ts`).
//
// While it is built, the nodes it touched are working copies (`Working`), opened on the path from the
// root to them; everything else is the document's stored nodes. `done()` freezes the working copies
// into drafted `PersistentNode`s, and a working copy that changed nothing back into its
// source.

import { MAX_ITEM_NUMBER, mdCalloutAt, MdFlavor, MdTree, type MdBlockAt, type MdLine } from '../parser/index.ts';
import { advanceColumns, atLine, columnIndex, docPos, localOffset, type ColumnIndex, type NodeId, MarkSet, spliceIn, trimMd, type ChangeSpec } from '../text/index.ts';
import { PersistentNode, Lineage, OurusProse, nodeName, withArticle, escapeParagraph, keepsEscape, outlineChildren, OurusAtom, blockIdsOf, withoutBlockIds, blockIdTargetOf, closingFrameStart, isClosingPart, reBlockIdLine, textEnd, type BlockIdDeclarations, type OurusNode, type OurusText, type OurusNodeKind, type OurusDoc, type OutlineChild } from '../doc/index.ts';
import type { OurusConfig } from '../config.ts';
import { describeDifference, differenceFrom } from './check.ts';
import { write, type WriteFailed } from './write.ts';
import { blockIdLinesOf, continuationAsWas, indentUnitOf, markerOf, placeMarker } from './lines.ts';
import { NormalizedDraft, separatorAt, type Anchor, type GapOrigin, type ListPlace, type NormalForm, type WriterAsks } from './normalized.ts';

/** A node of the draft's document, as a command holds it; or a node the draft touched, by id. */
export type NodeRef = OurusNode | NodeId;

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

/**
 * A draft applied: the document after it, the changes to its text, the selection; and what it did to
 * block ids on purpose (`movedBlockIds`, a join's), for the check of block ids.
 */
export interface Applied {
  readonly doc: OurusDoc;
  readonly changes: readonly ChangeSpec[];
  readonly selection: { readonly anchor: number; readonly head: number };
  readonly blockIds: BlockIdDeclarations;
}

/** A draft refused (`not-expressible`, Markdown can't say what it asks), or failed to write (`WriteFailed`). */
export type Refusal = { readonly reason: 'not-expressible'; readonly detail: string } | WriteFailed;

/** What `done()` gives: the draft applied, or refused. */
export type DraftResult = Applied | Refusal;

/** The character the parser reads a placeholder as: text no block starts with. */
const SENTINEL = '￼';

type Child = Working | PersistentNode;

/** How many of the blank lines after `node`, in `doc`, ourus raised: those whose line break has an `auto` mark. */
export function autoLinesOf(doc: OurusDoc, node: OurusNode): number {
  if (!doc.marks.auto.length || node.gap === 0) return 0;
  let n = 0;
  for (let i = node.ownLastLine + 1; i <= node.ownLastLine + node.gap; i++) if (doc.marks.hasAutoAt(doc.mdTree.line(i).to)) n++;
  return n;
}

/**
 * An ordered list's numbers after an edit, as `orderedLists` says: `own`, its items' numbers as written,
 * null for one the edit makes; `was`, the list's as it was; `start`, its first one's. Under
 * `renumber`, on from `start`, one up each, a list numbered all alike (`1.`, `1.`) too, as every text
 * editor numbers it; under `shift`, as the text editors: each as written, a new one's on from the item above it,
 * and one that counted on from the one above it counting on still. Both the draft's lists and a quote
 * atom's (`commands/quote.ts`) are numbered so.
 */
export function listNumbering(own: readonly (number | null)[], was: readonly number[], start: number, policy: OurusConfig['orderedLists']): number[] {
  if (policy === 'renumber') return own.map((_, i) => start + i);
  let last = start - 1;
  let lastOwn: number | null = null;
  return own.map((n) => {
    const kept = n === null ? last + 1 : lastOwn !== null && n === lastOwn + 1 ? last + 1 : n;
    if (n !== null) lastOwn = n;
    return (last = kept);
  });
}

/** A node the draft touched, while it is built: a copy of a read node (`source`), or one it made. */
class Working {
  readonly id: NodeId;
  kind: OurusNodeKind;
  readonly source: PersistentNode | null;
  /** Where `source` is in the draft's document. */
  readonly origin: OurusNode | null;
  /** Its text as set (null: none), or undefined: `source`'s. */
  text: OurusText | null | undefined;
  gap: number;
  children: Child[];
  /** Null for the root, and for a detached node. */
  parent: Working | null = null;

  constructor(id: NodeId, kind: OurusNodeKind, source: PersistentNode | null, origin: OurusNode | null, text: OurusText | null | undefined, gap: number, children: Child[]) {
    this.id = id;
    this.kind = kind;
    this.source = source;
    this.origin = origin;
    this.text = text;
    this.gap = gap;
    this.children = children;
  }
}

/** A block of a container in the order Markdown lays them out: the node, the entry it is under (null: the container), where it is in `from`. */
interface FlatEntry {
  node: Child;
  readonly parent: FlatEntry | null;
  readonly origin: OurusNode | null;
}


export class OurusDraft {
  /** The document the draft edits. */
  readonly from: OurusDoc;
  #root: Working | null = null;
  /** Each node touched, by id: opened, made, detached. */
  #byId = new Map<NodeId, Working>();
  /** Each read node opened → its working copy. */
  #current = new Map<PersistentNode, Working>();
  #caret: AnchorSpec | null = null;
  #anchor: AnchorSpec | null = null;
  #hints = new Map<NodeId, string>();
  #separators = new Map<NodeId, string>();
  #paddingsAsked = new Map<NodeId, number>();
  #lineUps = new Map<NodeId, OurusNode>();
  /** Markers new items would rather have where they join no list there is: a list's form (`listForm`). */
  #listForms = new Map<NodeId, string>();
  #ownForms = new Set<NodeId>();
  /** Where each gap the command touched came from (`GapOrigin`), by node id. */
  #gaps = new Map<NodeId, GapOrigin>();
  /** The blank lines before the first node, as the command stated them (`leadingBlankLines`; null: as they are). */
  #leading: number | null = null;
  /** Each node a split made → the read node whose text's end it holds, in `from`. */
  #splitFrom = new Map<NodeId, OurusNode>();
  /** The nodes the draft placed (moved, or made), by id. */
  #placedIds = new Set<NodeId>();
  /** New items, by id: placed before another node (`next`: in its list) or after one. */
  #joins = new Map<NodeId, 'next' | 'previous'>();
  /** Read nodes `done()` regrouped under another parent: where they are in `from`. */
  #placed = new Map<PersistentNode, OurusNode>();
  #fixed: NormalizedDraft | Refusal | null = null;
  /** A refusal a building step found (a join of two nodes that both have a block id), which `done()` gives. */
  #refusal: Refusal | null = null;
  /** The block ids the draft wrote on another node on purpose, and dropped for another (`BlockIdDeclarations`). */
  #movedBlockIds: { name: string; to: number }[] = [];
  #mergedBlockIds: { from: string; into: string }[] = [];

  constructor(from: OurusDoc) {
    this.from = from;
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
    spliceIn(parent.children, where === 'after' ? i + 1 : i, 0, nodes);
    for (const n of nodes) n.parent = parent;
    return this;
  }

  /** `refs` (detached) as `parent`'s first or last children. */
  append(parent: NodeRef, where: 'first' | 'last', refs: readonly NodeRef[]): this {
    this.#building();
    const p = this.#node(parent);
    const nodes = this.#placeable(refs, p);
    spliceIn(p.children, where === 'first' ? 0 : p.children.length, 0, nodes);
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
    spliceIn(parent.children, at, 0, children);
    for (const c of children) c.parent = parent;
    return this;
  }

  /**
   * `ref` as another kind, the same id (an item unwrapped); its text read again as that kind's, and
   * written whole where it is, with the escapes its new place needs.
   */
  convert(ref: NodeRef, kind: Exclude<OurusNodeKind, 'root'>): this {
    this.#building();
    const w = this.#node(ref);
    const text = this.#textOf(w);
    w.kind = kind;
    if (text) w.text = text.asItem(kind === 'item').normalize();
    return this;
  }

  /**
   * Says block ids `names` go to node `to` on purpose (workflowy's split giving it the heading's):
   * the check of block ids takes them as moved, not lost.
   */
  movedBlockIds(names: readonly string[], to: NodeRef): this {
    this.#building();
    const id = this.#node(to).id;
    for (const name of names) this.#movedBlockIds.push({ name, to: id });
    return this;
  }

  /**
   * `ref`'s text, read as its kind's (an item's or not), its transitions applied; null, a quote's title
   * gone, or an item's, its first child a quote then, on its marker's line (`- > a⏎  >⏎  > b`).
   */
  setText(ref: NodeRef, text: OurusText | null): this {
    this.#building();
    const w = this.#node(ref);
    if (text === null && w.kind !== 'quote' && w.kind !== 'item') throw new Error(`node ${w.id} has a text: only a quote's title goes, and an item's`);
    // (a piece of a text, which says nothing of the block-id lines, for a node that carries some: the
    // command has to say what becomes of them, kept, moved or gone; else they would go unsaid)
    if (text instanceof OurusProse && text.fragment && this.#textOf(w)?.blockIdLines.length) this.#refusal ??= { reason: 'write-failed', detail: `node ${w.id} is given a piece of a text, which doesn't say what becomes of the block-id lines it carries`, phase: 'draft', code: 'fragment-with-block-id-lines' };
    w.text = text instanceof OurusProse ? text.asItem(w.kind === 'item').normalize() : (text?.normalize() ?? null);
    return this;
  }

  /** A new node, detached (place it), with a real id from the document's lineage. `hint`: an item's marker, for the writer. */
  create(kind: Exclude<OurusNodeKind, 'root'>, text: OurusText | null, hint?: string): NodeId {
    this.#building();
    const id = this.from.lineage.take();
    const w = new Working(id, kind, null, null, text instanceof OurusProse ? text.asItem(kind === 'item').normalize() : (text?.normalize() ?? null), 0, []);
    this.#byId.set(id, w);
    if (hint !== undefined) this.#hints.set(id, hint);
    return id;
  }

  /**
   * A copy of `node` with its subtree, detached (place it): new ids from the document's
   * lineage, each node read from its original, so the writer writes it as the original is written.
   * `ids`, where given, gets each original node's copy, by the original's stored node.
   */
  copy(node: OurusNode, ids?: Map<PersistentNode, NodeId>): NodeId {
    this.#building();
    const make = (at: OurusNode): Working => {
      const p = at.persistentNode;
      const c = new Working(this.from.lineage.take(), p.kind, p, at, undefined, p.gap, []);
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
   * closing frame (a block id, an ATX closing sequence, a setext underline) and the block-id lines
   * the text carries staying with the first: a block id stays with the node the caret was in; but
   * the closing frame with the new node under `closing: lower`, where it came after the cut. The new node is the next sibling,
   * taking the gap (blank lines travel with the end of the text), and the children if they `follow`;
   * or (`into: 'child'`) the first child. `kind`: the new node's, a paragraph's text. Returns the two
   * ids.
   */
  split(ref: NodeRef, at: number, options: { readonly children: 'stay' | 'follow'; readonly to?: number; readonly into?: 'sibling' | 'child'; readonly kind?: 'paragraph'; readonly closing?: 'upper' | 'lower' }): [NodeId, NodeId] {
    this.#building();
    const w = this.#node(ref);
    const text = this.#textOf(w);
    if (!(text instanceof OurusProse)) throw new Error(`node ${w.id} has no text to split`);
    if (!w.parent) throw new Error(`node ${w.id} isn't in the draft's outline`);
    const to = options.to ?? at;
    // (from where the closing frame's run starts; cut inside it, the parts after the cut)
    const run = closingFrameStart(text);
    // (`closing: lower`, a closing frame the command put in after the cut, a pasted ` ^x`: the rest's)
    const end = options.closing === 'lower' ? text.text.length : run >= to ? run : (text.frame.find((p) => isClosingPart(p) && p.from >= to)?.from ?? text.text.length);
    const kind = options.kind ?? (w.kind === 'heading' || w.kind === 'quote' ? 'paragraph' : (w.kind as Exclude<OurusNodeKind, 'root'>));
    // the rest is a paragraph's text, a heading's or a title's too: its characters make it no heading
    const rest = text.slice(to, end);
    const id = this.create(kind, rest.retyped('paragraph'));
    const b = this.#byId.get(id)!;
    w.text = (end < text.text.length ? text.slice(0, at).concat(text.slice(end)) : text.slice(0, at)).withBlockIdLines(text.blockIdLines).normalize();
    // the blank lines after the text go with its end, as they were written
    b.gap = w.gap;
    w.gap = 0;
    this.#gap(b.id).from = w.id;
    this.#gap(w.id).from = -1;
    const lines = w.origin && w.source ? ownGapLines(w.origin) : null;
    if (lines && lines[1] - lines[0] === b.gap) this.#gap(id).lines = lines;
    if (w.origin) this.#gap(w.id).lines = null;
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
   * line), past its own frame, before `upper`'s closing frame; its gap `upper`'s. Its children go
   * after `upper`'s (`adopt`), or into its place (`place`: where `upper` is its parent, or can't hold
   * them). Returns `upper`'s id.
   *
   * `lower`'s block ids: where `upper` has none, it takes them, moved
   * (a carried line alone as ` ^id` at the end of its text, which carried under an item would loosen a
   * tight list); where both have one, `upper`'s kept and `lower`'s merged into it.
   */
  join(upper: NodeRef, lower: NodeRef, options: { readonly children?: 'adopt' | 'place'; readonly separator?: string } = {}): NodeId {
    this.#building();
    const u = this.#node(upper);
    const l = this.#node(lower);
    const ut = this.#textOf(u);
    const lt = this.#textOf(l);
    if (!(ut instanceof OurusProse) || !(lt instanceof OurusProse)) throw new Error('a join takes two texts');
    const children = l.children.map((_, k) => this.#openChild(l, k));
    const parent = l.parent;
    const at = parent ? parent.children.indexOf(l) : -1;
    this.#detach(l);
    l.children = [];
    // (lower's block id ending its text is taken out of what is appended: kept, moved or dropped below)
    const part = lt.frame.find((p) => p.part === 'blockId');
    let rest = (part ? lt.splice(part.from, part.to) : lt).slice(lt.textStart(0));
    // (a backslash of ours its start gained, written where the text started a line (a split's,
    // `- \*`), goes where it joins after text on the line: `**bold*` and `\*` are `**bold**` again)
    const end0 = closingFrameStart(ut);
    if (rest.text[0] === '\\' && rest.marks.hasAutoAt(0) && !(options.separator ?? '').includes('\n') && ut.text.slice(ut.textStart(0), end0) !== '') rest = rest.slice(1);
    let taken = '';
    let carried = ut.blockIdLines;
    if (this.#joinedBlockIds(u, ut, l, lt)) {
      if (part) taken = lt.text.slice(part.from, part.to);
      if (!part && lt.blockIdLines.length === 1) taken = ` ${lt.blockIdLines[0]!.line}`;
      else if (lt.blockIdLines.length) carried = lt.blockIdLines;
    }
    // before a closing frame (a block id, an ATX heading's `#`s, a setext underline): the text's end;
    // where the text is nothing but that frame, what is joined is its start, the blanks before it
    // padding (`^x⏎===`)
    const end = closingFrameStart(ut);
    const separator = options.separator ?? '';
    const bare = end < ut.text.length && ut.text.slice(ut.textStart(0), end) === '' && !separator.includes('\n');
    const head = bare ? ut.slice(0, end).concat(rest.slice(/^[ \t]*/.exec(rest.text)![0].length)) : ut.slice(0, end).concat(separator, rest);
    // (and set apart from a block id the text starts with: `a ^x`, not `a^x`)
    const close = ut.slice(end);
    const glued = head.text.slice(ut.textStart(0)) !== '' && ut.frame.some((p) => p.part === 'blockId' && p.from === end) && ut.text[end] === '^' && !/[ \t]$/.test(head.text);
    // (a block id taken after text: a blank before it, `- a` and `- ^x` giving `- a ^x`; on a line of
    // its own but in a heading, whose text is one line; none after no text, `- ┃^x`)
    if (taken && ut.type === 'heading') taken = taken.replace(/^[ \t\r\n]*/, ' ');
    if (taken && (head.text.slice(head.textStart(0)) === '' || /[ \t]$/.test(head.text))) taken = taken.replace(/^[ \t\r\n]+/, '');
    else if (taken && !/^[ \t\r\n]/.test(taken)) taken = ` ${taken}`;
    u.text = head.concat(taken, glued ? ' ' : '', close).withBlockIdLines(carried).normalize();
    u.gap = l.gap;
    this.#gap(u.id).from = l.id;
    if (options.children === 'place' && parent) {
      spliceIn(parent.children, at, 0, children);
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
   * A command's own join of `lower`'s text into `upper`'s (a quote read as an atom joining the text
   * above it, or a text joining it), as `join` takes block ids: true where `lower`'s go with what is
   * joined, `upper`'s text having none (moved to it); false where both have one, `lower`'s to be left
   * out (merged into the one a link to `upper` uses). The command writes the texts.
   */
  joinBlockIds(upper: NodeRef, upperText: OurusText, lower: NodeRef, lowerText: OurusText): boolean {
    this.#building();
    return this.#joinedBlockIds(this.#node(upper), upperText, this.#node(lower), lowerText);
  }

  /** `joinBlockIds`'s: `lower`'s block ids moved to `upper`, where it has none, or merged into its. */
  #joinedBlockIds(u: Working, ut: OurusText, l: Working, lt: OurusText): boolean {
    const own = blockIdsOf(ut);
    const lowers = blockIdsOf(lt);
    if (!lowers.length || !own.length) {
      for (const b of lowers) this.#movedBlockIds.push({ name: b.name, to: u.id });
      return true;
    }
    // (into the one a link to `upper` uses, which may be another's: an item's, for a block inside it;
    // else, its text's, inside an item the first, else the last)
    const target = u.origin ? blockIdTargetOf(u.origin) : null;
    const counted = target && this.from.blockIds().find((b) => !b.shadowed && b.target && 'id' in b.target && b.target.id === target.id);
    const into = counted ? counted.name : own[u.kind === 'item' ? 0 : own.length - 1]!.name;
    for (const b of lowers) this.#mergedBlockIds.push({ from: b.name, into });
    return false;
  }

  /**
   * The marker a new item's list would rather have (`-`, `*`, `1.`, `3)`), where it joins no list
   * there is: its kind, its bullet or delimiter, its start. A list it joins gives its own; `own`, it
   * keeps it, a list of its own where the list it lands in has another form (`pasteListForm: own`).
   */
  listForm(id: NodeId, marker: string, own = false): this {
    this.#building();
    this.#listForms.set(id, marker);
    if (own) this.#ownForms.add(id);
    else this.#ownForms.delete(id);
    return this;
  }

  /**
   * Enter's (B223): a block id naming a quote, at its last block's end, stays at the quote's end, as a
   * text editor's Enter leaves it at the line's end. Where the split leaves a block after its own in the
   * quote, it goes to the end of the quote's new last block's text, declared moved. Not where the new
   * last block holds no prose, or none yet (Enter's at the end: the id alone there would read as the
   * block above's block-id line).
   */
  keepQuoteIds(): this {
    this.#building();
    for (const b of this.from.blockIds()) {
      const target = b.target;
      if (!target || !('id' in target) || target.kind !== 'quote' || target.id === b.owner.id) continue;
      const quote = this.#byId.get(target.id);
      if (!quote) continue;
      const kids = quote.children;
      const last = kids[kids.length - 1];
      if (!last || last.id === b.owner.id || !kids.some((c) => c.id === b.owner.id)) continue;
      const owner = this.#node(b.owner);
      const own = this.#textOf(owner);
      const k = own ? blockIdsOf(own).findIndex((x) => !x.carried && x.name === b.name) : -1;
      if (!own || k < 0) continue;
      const lower = last instanceof Working ? last : this.#open(this.from.node(last.id)!);
      const text = this.#textOf(lower);
      // (not an empty one, Enter's new paragraph at the end: the id alone there would be the block above's
      // block-id line, no paragraph)
      if ((lower.kind !== 'paragraph' && lower.kind !== 'heading') || !(text instanceof OurusProse) || text.empty) continue;
      if (!blockIdsOf(text).some((x) => !x.carried && x.name === b.name)) {
        const end = closingFrameStart(text);
        const before = text.text.slice(0, end);
        this.setText(lower.id, text.splice(end, end, /[ \t]$/.test(before) ? `^${b.name}` : ` ^${b.name}`));
      }
      this.movedBlockIds([b.name], lower.id);
      this.setText(owner.id, withoutBlockIds(own, new Set([k])));
    }
    return this;
  }

  /** A node the draft touched (made, moved, changed), by id, as it is in the draft now: its kind, text, gap and children's ids. */
  touched(id: NodeId): { readonly kind: OurusNodeKind; readonly text: OurusText | null; readonly gap: number; readonly children: readonly NodeId[] } {
    const w = this.#node(id);
    return { kind: w.kind, text: this.#textOf(w), gap: w.gap, children: w.children.map((c) => c.id) };
  }

  /** Blank lines after `ref`'s text, as the command states them: `done()`'s scope ends keep them (Markdown's separation may still raise them). */
  gap(ref: NodeRef, n: number): this {
    this.#building();
    const w = this.#node(ref);
    w.gap = n;
    this.#gap(w.id).stated = true;
    return this;
  }

  /** The record of where `id`'s gap came from, made where there is none. */
  #gap(id: NodeId): GapOrigin {
    let g = this.#gaps.get(id);
    if (!g) this.#gaps.set(id, (g = {}));
    return g;
  }

  /**
   * `to` takes the blank lines after `from`'s text, as they were written: a join's way, for a command that
   * removes `from` (an empty node going). The ones ourus raised stay ours (an `auto` mark).
   */
  inheritGap(to: NodeRef, from: OurusNode): this {
    const id = this.#node(to).id;
    const own = this.from.node(id);
    // (the lines it had of its own, the author's, and its gap is no fewer; only where `from` has a sibling
    // after it or children to take its place, which they set apart from `to`: when it is the last of its
    // list, what follows is its parent's, and the blank lines were never between them)
    const floor = own && (from.next || from.children.length) ? own.gap - autoLinesOf(this.from, own) : 0;
    this.gap(to, Math.max(from.gap, floor));
    this.#gap(id).from = from.id;
    if (own) this.#gap(id).floor = own.gap - autoLinesOf(this.from, own);
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
    if (!this.#fixed) {
      const form = new Done(this).run();
      this.#fixed = 'reason' in form ? form : new NormalizedDraft(this.from, form, this.#asks());
    }
    return 'reason' in this.#fixed ? this.#fixed : null;
  }

  /**
   * The draft put in normal form, written, and the document after it read back and checked against
   * it: the document, its changes and selection; else a refusal (`write-failed` where the writer
   * failed, a bug).
   */
  done(): DraftResult {
    if (this.#refusal) return this.#refusal;
    try {
      const refused = this.#normalize();
      if (refused) return refused;
      const normal = this.normalized();
      const written = write(normal);
      if ('reason' in written) return written;
      const doc = this.from.update({ changes: written.changes, marks: written.marks, identity: written.identity });
      const wrong = differenceFrom(doc, normal);
      if (wrong) return { reason: 'write-failed', detail: `the text written doesn't read as the draft: ${describeDifference(wrong)}`, phase: 'readback', ...wrong };
      return { doc, changes: written.changes, selection: written.selection, blockIds: { moved: this.#movedBlockIds, merged: this.#mergedBlockIds } };
    } catch (e) {
      // (the normal form and the writer walk the outline by recursion: a document nested deeper than
      // the call stack goes, which the outline itself reads, isn't written)
      if (e instanceof RangeError && /call stack/.test(e.message)) return { reason: 'write-failed', detail: 'the document nests deeper than the writer goes', phase: 'depth', code: 'too-deep' };
      throw e;
    }
  }

  /**
   * `from`'s blank lines after `to` instead, as they were written (a paste's end takes the ones after
   * the node it was pasted at, as a split's second half takes its text's).
   */
  moveGap(from: NodeRef, to: NodeId): this {
    this.#building();
    const w = this.#node(from);
    const b = this.#node(to);
    // (both stated, as `gap` states them: the writer writes them as set)
    const gap = w.gap;
    this.gap(b.id, gap).gap(w.id, 0);
    this.#gap(b.id).from = w.id;
    this.#gap(w.id).from = -1;
    const lines = w.origin && w.source ? ownGapLines(w.origin) : null;
    if (lines && lines[1] - lines[0] === gap) this.#gap(b.id).lines = lines;
    if (w.origin) this.#gap(w.id).lines = null;
    return this;
  }

  /**
   * New item `id`'s text, starting on the line below its marker, written `n` columns past its content
   * column (under four: Markdown reads them as padding, not text), as a pasted item's own lines are.
   */
  padding(id: NodeId, n: number): this {
    this.#building();
    this.#paddingsAsked.set(id, Math.min(3, n));
    return this;
  }

  /**
   * New item `id` written with `separator` after its marker, rather than a space (a pasted item's own
   * form); for a text starting on the line below its marker, what its marker's line ends with.
   */
  separator(id: NodeId, separator: string): this {
    this.#building();
    this.#separators.set(id, separator);
    return this;
  }


  /** New item `id` lined up with `with`, a read item it goes beside: its indentation and its containers' prefixes as `with`'s line has them. */
  lineUp(id: NodeId, item: OurusNode): this {
    this.#building();
    this.#lineUps.set(id, item);
    return this;
  }

  /** The draft in normal form, once `done()` (a refused one throws): what the writer and the readback read. */
  normalized(): NormalizedDraft {
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
      const w = this.#byId.get(ref) ?? (ref === Lineage.ROOT ? this.#rootWorking : undefined);
      if (!w) throw new Error(`node ${ref} isn't one the draft touched: pass its OurusNode`);
      return w;
    }
    return this.#open(ref);
  }

  /** `node`'s working copy, opened with the path to it: found through the nearest ancestor the draft touched. */
  #open(node: OurusNode): Working {
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

  #openAt(parent: Working, k: number, origin: OurusNode): Working {
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

  #textOf(w: Working): OurusText | null {
    return w.text !== undefined ? w.text : w.origin ? this.from.textOf(w.origin) : null;
  }

  // what `Done` reads of a draft being finished
  /** What the command asked of the writer, as it stands: `done()` reads it, and the normalized draft takes a copy. */
  #asks(): WriterAsks {
    return { placedIds: this.#placedIds, splitFrom: this.#splitFrom, hints: this.#hints, separators: this.#separators, lineUps: this.#lineUps };
  }

  static internals(draft: OurusDraft) {
    return {
      root: draft.#root,
      byId: draft.#byId,
      current: draft.#current,
      placed: draft.#placed,
      gaps: draft.#gaps,
      joins: draft.#joins,
      listForms: draft.#listForms,
      ownForms: draft.#ownForms,
      paddingsAsked: draft.#paddingsAsked,
      asks: draft.#asks(),
      leading: draft.#leading,
      caret: draft.#caret,
      anchor: draft.#anchor,
      openChild: (parent: Working, k: number) => draft.#openChild(parent, k),
      textOf: (w: Working) => draft.#textOf(w),
    };
  }
}

/** `origin`'s child that is `child`, by identity (its index when unchanged). */
function childOrigin(origin: OurusNode, child: PersistentNode): OurusNode | null {
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
  /** What the command asked of the writer (`WriterAsks`): which nodes it placed, its markers, separators and line-ups. */
  readonly asks: WriterAsks;
  readonly lists = new Map<NodeId, ListPlace>();
  readonly escaped = new Set<NodeId>();
  readonly gained = new Map<Working, number[]>();
  /** Characters a text lost, by where they were in it as set (ascending), for the anchors past them. */
  readonly lost = new Map<Working, { readonly at: number; readonly n: number }[]>();
  /** The spaces a text started with, taken out as its node's padding: where they were in it, and how many (`#leadingSpaces`). */
  readonly leading = new Map<Working, { readonly at: number; readonly n: number }>();
  readonly paddings = new Map<NodeId, number>();
  readonly columns = new Map<NodeId, ColumnIndex>();
  /** The blank lines before the first node, where they must change (null: as they are). */
  preamble: number | null = null;
  /** Texts whose empty last lines `done()` made blank lines after them: where the text now ends. */
  readonly blankTails = new Map<Working, number>();
  /** Texts carrying block-id lines whose empty last lines `done()` made blank lines before the first of them: where the text now ends. */
  readonly carriedTails = new Map<Working, number>();
  /** Where each gap came from (`GapOrigin`): the draft's, then this pass's, a scope end's moved gap and one raised for Markdown's sake. */
  readonly gaps: Map<NodeId, GapOrigin>;
  /** The working copies in the final outline. */
  readonly attached = new Set<Working>();

  constructor(draft: OurusDraft) {
    this.draft = draft;
    this.from = draft.from;
    this.io = OurusDraft.internals(draft);
    this.asks = this.io.asks;
    this.gaps = new Map([...this.io.gaps].map(([id, g]) => [id, { ...g }]));
    this.preamble = this.io.leading;
    for (const [id, n] of this.io.paddingsAsked) this.paddings.set(id, n);
  }

  /** A node's kind in words, for a refusal's detail (`nodeName`): an atom by its block's type, `code`, `rule`. */
  #nameOf(node: Child): string {
    if (node.kind !== 'atom') return nodeName(node.kind);
    const text = node instanceof Working ? this.io.textOf(node) : null;
    return nodeName('atom', text instanceof OurusAtom ? text.type : node instanceof Working ? node.origin?.block.type : node.block?.type);
  }

  /** The record of where `id`'s gap came from, made where there is none. */
  gap(id: NodeId): GapOrigin {
    let g = this.gaps.get(id);
    if (!g) this.gaps.set(id, (g = {}));
    return g;
  }

  run(): NormalForm | Refusal {
    try {
      const root = this.io.root;
      if (root) {
        this.#collect(root);
        // (the held spaces of the texts set out first: writing a text settles them, its own spaces no more)
        for (const w of this.attached) this.#settleHeldSpaces(w);
        this.#transitions();
        this.#normalForm();
        this.#frontmatter();
        this.#byteOrderMark();
        this.#collect(root);
        this.#lists();
        this.#leadingSpaces();
        // the placeholders first: an empty line they hold reads as typed on, which the escapes depend on;
        // then the escapes, which a text's own lines decide, and which seams read
        this.#movedEmpty();
        this.#movedLines();
        // (our escapes out first: a text that was only them is empty, which a placeholder holds; and the
        // held spaces of the texts set since)
        for (const w of this.attached) {
          this.#settleHeldSpaces(w);
          this.#dropOurEscapes(w);
        }
        this.#placeholders();
        this.#escapes();
        this.#atomTexts();
        this.#gaps();
        this.#attachBlockIdLines();
        this.#emptiedCarriers();
      }
      const caret = this.#anchor(this.io.caret);
      const anchor = this.io.anchor === this.io.caret ? caret : this.#anchor(this.io.anchor);
      const origins = new Map<PersistentNode, OurusNode>();
      const frozen = root ? this.#freeze(root, origins) : this.from.root;
      const map = (a: Anchor | null): Anchor | null => {
        if (a && 'node' in a) return { ...a, node: this.#frozen.get(a.node as unknown as Working)! };
        if (a && 'blank' in a) return { ...a, blank: this.#frozen.get(a.blank as unknown as Working)! };
        return a?.otherwise ? { ...a, otherwise: map(a.otherwise)! } : a;
      };
      // (recorded lines a later change to the gap left fewer or more than it: written anew)
      for (const [id, g] of this.gaps) {
        const w = this.io.byId.get(id);
        if (w && g.lines && g.lines[1] - g.lines[0] !== w.gap) g.lines = null;
      }
      return { root: frozen, caret: map(caret), anchor: map(anchor), lists: this.lists, escaped: this.escaped, columns: this.columns, origins, gaps: this.gaps, preamble: this.preamble, paddings: this.paddings };
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
  #under(parent: Working, c: Child): OurusNode | null {
    if (c instanceof Working) return c.origin;
    return this.io.placed.get(c) ?? (parent.origin ? childOrigin(parent.origin, c) : null);
  }

  #edited(w: Working): boolean {
    return w.text !== undefined;
  }

  // ---- 1. normal form

  /**
   * A heading whose text no longer reads as one is a paragraph; a quote's title that no longer reads as
   * a callout, its first paragraph. With `quotes: text`, a quote left holding one paragraph and nothing
   * else is that paragraph, framed (`#quotedParagraphs`).
   */
  #transitions(): void {
    for (const w of [...this.attached]) {
      if (!(w.text instanceof OurusProse)) continue;
      if (w.kind === 'heading' && w.text.type === 'paragraph') w.kind = 'paragraph';
      if (w.kind === 'quote' && w.text.type === 'paragraph') {
        const id = this.draft.create('paragraph', w.text);
        w.text = null;
        this.draft.append(w.id, 'first', [id]);
        this.attached.add(this.io.byId.get(id)!);
      }
    }
    if (this.from.config.quotes === 'text') this.#quotedParagraphs();
    if (this.from.config.quotes === 'atom') this.#quoteAtoms();
  }

  /**
   * With `quotes: atom`, a quote left with no title (a callout's `[!type]` gone) is an atom, its
   * paragraphs' lines as written after `> `s, a blank `>` line between them, an anchor in one moved to
   * where its line is now; an item with no text whose first block it was (`- > q`) takes it as its
   * text. Refused where it holds anything but paragraphs (not done yet).
   */
  #quoteAtoms(): void {
    for (const q of [...this.attached]) {
      if (q.kind !== 'quote' || !q.parent || !q.children.length) continue;
      if (q.text !== null && (q.text !== undefined || q.source?.head)) continue;
      const parts: { p: Working; text: OurusProse; at: number }[] = [];
      let out = '';
      for (let k = 0; k < q.children.length; k++) {
        const c = q.children[k]!;
        const p = c instanceof Working ? c : this.io.openChild(q, k);
        const text = this.io.textOf(p);
        if (p.kind !== 'paragraph' || p.children.length || !(text instanceof OurusProse)) throw new Refused("the quote's blocks would read as its text");
        if (k) out += '\n>\n';
        parts.push({ p, text, at: out.length });
        out += text.text.split('\n').map((l) => `> ${l}`).join('\n');
      }
      q.kind = 'atom';
      q.text = new OurusAtom('blockquote', false, out);
      q.children = [];
      for (const { p } of parts) {
        p.parent = null;
        this.attached.delete(p);
      }
      const moved = (spec: AnchorSpec | null): AnchorSpec | null => {
        if (!spec || !('ref' in spec)) return spec;
        const part = parts.find(({ p }) => (typeof spec.ref === 'number' ? spec.ref === p.id : this.io.current.get(spec.ref.persistentNode) === p));
        if (!part) return spec;
        return { ref: q.id, offset: part.at + spec.offset + 2 * part.text.text.slice(0, spec.offset).split('\n').length, ...(spec.assoc !== undefined && { assoc: spec.assoc }) };
      };
      const same = this.io.anchor === this.io.caret;
      this.io.caret = moved(this.io.caret);
      this.io.anchor = same ? this.io.caret : moved(this.io.anchor);
      // an item with no text, whose first block that quote was on its marker's line: its text
      const parent = q.parent;
      if (parent.kind !== 'item' || parent.children[0] !== q || this.io.textOf(parent) !== null) continue;
      parent.text = new OurusAtom('blockquote', true, out);
      parent.children.shift();
      q.parent = null;
      this.attached.delete(q);
      const toItem = (spec: AnchorSpec | null): AnchorSpec | null => (spec && 'ref' in spec && (typeof spec.ref === 'number' ? spec.ref === q.id : false) ? { ...spec, ref: parent.id } : spec);
      this.io.caret = toItem(this.io.caret);
      this.io.anchor = same ? this.io.caret : toItem(this.io.anchor);
    }
  }

  /**
   * With `quotes: text`, each quote with no title left holding one paragraph with nothing under it (a
   * join, a deletion, a move took the rest) is that paragraph in its place, its text framed by `> ` on
   * each line, as the document reads it; an anchor in the text moves past the frames. A quote that
   * held only that paragraph already, below its first line, stays (a blank `>` first: `>⏎>z`).
   */
  #quotedParagraphs(): void {
    for (const q of [...this.attached]) {
      if (q.kind !== 'quote' || q.children.length !== 1 || !q.parent) continue;
      if (q.text !== null && (q.text !== undefined || q.source?.head)) continue;
      const only = q.children[0]!;
      if (only.kind !== 'paragraph' || only.children.length) continue;
      const held = q.origin?.children.length === 1 ? q.origin.children[0]! : null;
      if (held?.id === only.id && held.startLine > q.origin!.startLine) continue;
      const p = only instanceof Working ? only : this.io.openChild(q, 0);
      const text = this.io.textOf(p);
      if (!(text instanceof OurusProse) || text.type !== 'paragraph') continue;
      const lines = text.text.split('\n');
      let framed = text.asItem(false);
      for (let k = lines.length - 1, at = text.text.length - lines[k]!.length; k >= 0; at -= (lines[--k]?.length ?? 0) + 1) framed = framed.splice(at, at, '> ');
      p.text = framed.retyped('quote', false);
      const parent = q.parent;
      parent.children[parent.children.indexOf(q)] = p;
      p.parent = parent;
      q.parent = null;
      q.children = [];
      this.attached.delete(q);
      // (an offset in the text, past as many `> `s as lines start at or before it)
      const moved = (spec: AnchorSpec | null): AnchorSpec | null => {
        if (!spec || !('ref' in spec)) return spec;
        const named = typeof spec.ref === 'number' ? spec.ref === p.id : this.io.current.get(spec.ref.persistentNode) === p;
        if (!named) return spec;
        return { ...spec, offset: spec.offset + 2 * (text.text.slice(0, spec.offset).split('\n').length) };
      };
      const same = this.io.anchor === this.io.caret;
      this.io.caret = moved(this.io.caret);
      this.io.anchor = same ? this.io.caret : moved(this.io.anchor);
      // an item with no text, whose first block that quote was on its marker's line (`- > q`): its text
      const item = parent.kind === 'item' && parent.children[0] === p && this.io.textOf(parent) === null ? parent : null;
      if (!item) continue;
      item.text = (p.text as OurusProse).asItem(true);
      item.children.shift();
      p.parent = null;
      this.attached.delete(p);
      const toItem = (spec: AnchorSpec | null): AnchorSpec | null => {
        if (!spec || !('ref' in spec)) return spec;
        const named = typeof spec.ref === 'number' ? spec.ref === p.id : this.io.current.get(spec.ref.persistentNode) === p;
        return named ? { ...spec, ref: item.id } : spec;
      };
      this.io.caret = toItem(this.io.caret);
      this.io.anchor = same ? this.io.caret : toItem(this.io.anchor);
    }
  }

  /**
   * Every container (the root, an item, a quote) holding a node the draft touched, regrouped as the
   * outline reads it (`outlineChildren`): a heading owns what follows it up to one of its level or higher; in
   * the document's own sections a node `listParent` says owns the items right after it. Regrouping never merges
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
      if (w.kind === 'heading' && w.text instanceof OurusProse && w.origin) {
        const before = this.from.textOf(w.origin);
        return before instanceof OurusProse && before.heading?.level !== w.text.heading?.level;
      }
      return false;
    });
  }

  #regroup(container: Working): void {
    interface Entry { node: Child; kind: OurusNodeKind; level: number; origin: OurusNode | null }
    const entries: Entry[] = [];
    const flatten = (parent: Child, origin: OurusNode | null): void => {
      for (const c of parent.children) {
        // (a stored node's children are stored nodes)
        const o = parent instanceof Working ? this.#under(parent, c) : origin ? childOrigin(origin, c as PersistentNode) : null;
        const kind = c.kind;
        entries.push({ node: c, kind, level: kind === 'heading' ? this.#level(c, o) : 0, origin: o });
        // (a section's nodes, a list a block adopted: an atom's too, `listParent: block`)
        if (kind === 'heading' || kind === 'paragraph' || kind === 'atom') flatten(c, o);
      }
    };
    flatten(container, container.origin);
    // each node with its children as grouped, built first: a read node whose children come out the same stays as it is
    const build = ({ entry: e, children }: OutlineChild<Entry>, parent: Working): Child => {
      const node = e.node;
      if (!(node instanceof Working) && e.origin) this.io.placed.set(node, e.origin);
      if (node.kind !== 'heading' && node.kind !== 'paragraph' && node.kind !== 'atom') {
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
    container.children = outlineChildren(entries, container.kind === 'root', this.from.config).map((e) => build(e, container));
  }

  /**
   * The paragraphs that are a block id alone, in the containers the draft touched, that their flavor
   * reads as naming the block before them, or the item they are under, taken out: that node's text
   * carries the line, as reading has it (`PersistentNode.blockIdCount`). Inside a list item, only the
   * item's own, right after its text; outside one, after the block before it, a blank line after it
   * or the container's end. Read once the blank lines are fixed, which decide it. A block id that
   * comes to name a block so, where it named nothing.
   */
  #attachBlockIdLines(): void {
    if (!this.from.mdTree.flavor.has('blockIds') || !this.io.root) return;
    const containers = new Set<Working>([this.io.root]);
    for (const w of this.attached) {
      if (w.kind === 'item' || w.kind === 'quote') containers.add(w);
      let c = w.parent;
      while (c && c.kind !== 'root' && c.kind !== 'item' && c.kind !== 'quote') c = c.parent;
      if (c) containers.add(c);
    }
    for (const c of containers) if (c === this.io.root || this.attached.has(c)) this.#attachIn(c);
  }

  /** `#attachBlockIdLines` in one container: its blocks in the order Markdown lays them out. */
  #attachIn(container: Working): void {
    const entries: FlatEntry[] = [];
    const flatten = (parent: FlatEntry | null, node: Child, origin: OurusNode | null): void => {
      for (const c of node.children) {
        const o = node instanceof Working ? this.#under(node, c) : origin ? childOrigin(origin, c as PersistentNode) : null;
        const e = { node: c, parent, origin: o };
        entries.push(e);
        if (c.kind === 'heading' || c.kind === 'paragraph' || c.kind === 'atom') flatten(e, c, o);
      }
    };
    flatten(null, container, container.origin);
    let inItem = false;
    for (let up: Working | null = container; up; up = up.parent) if (up.kind === 'item') inItem = true;
    // (an item with no text, or an empty one, carries no line, as reading has it: `-` and a blank line end it)
    const own = container.kind === 'item' ? this.io.textOf(container) : null;
    let host: FlatEntry | 'self' | null = own && !(own instanceof OurusProse && own.empty) ? 'self' : null;
    let regroup = false;
    for (let k = 0; k < entries.length; k++) {
      const e = entries[k]!;
      const text = e.node.kind === 'paragraph' || e.node.kind === 'atom' ? (e.node instanceof Working ? this.io.textOf(e.node) : e.origin ? this.from.textOf(e.origin) : null) : null;
      const lone = e.node.kind === 'paragraph' && text instanceof OurusProse && text.type === 'paragraph' && reBlockIdLine.test(text.text);
      // (a block id alone carries no line: reading has one after it a paragraph of its own)
      if (lone && text.blockIdLines.length) throw new Refused("a paragraph that is only a block id can't carry the block-id lines after it");
      // (inside a list item only its own text does: one after another block there is a paragraph of its own)
      if (inItem && (text instanceof OurusProse || text instanceof OurusAtom) && text.blockIdLines.length) throw new Refused("a block inside a list item, after its text, can't carry block-id lines");
      const followed = k === entries.length - 1 || e.node.gap > 0;
      // (a footnote's definition carries none: the line would be its text's: block-ids.test.ts)
      if (lone && host && host !== 'self' && host.node.kind === 'atom' && this.#entryText(host)?.type === 'footnote_definition') throw new Refused("a footnote's definition can't carry the block id after it");
      if (lone && host && (inItem ? host === 'self' : host !== 'self' && followed)) {
        regroup ||= e.node.children.length > 0;
        this.#carry(host === 'self' ? container : this.#working(host, container), this.#working(e, container), text.text);
        continue;
      }
      // (a quote that is a container, an item, a block id left alone: none carries a line; nor a block
      // of lines nothing closes, which would take it in; nor an empty paragraph, which is nothing on
      // disk, as reading has it)
      const held = e.node.kind === 'paragraph' && text instanceof OurusProse && text.empty;
      host = lone || held || unclosed(text) || e.node.kind === 'item' || e.node.kind === 'quote' ? null : e;
    }
    // (the children of one that went, a list it owned, nested again: the carrier's now, as reading has it)
    if (regroup) this.#regroup(container);
  }

  /** A flat entry's text. */
  #entryText(e: FlatEntry): OurusText | null {
    return e.node instanceof Working ? this.io.textOf(e.node) : e.origin ? this.from.textOf(e.origin) : null;
  }

  /** A flat entry of `container` as a working copy, opened where it is, as its parent's child. */
  #working(e: FlatEntry, container: Working): Working {
    if (e.node instanceof Working) return e.node;
    const parent = e.parent ? this.#working(e.parent, container) : container;
    const w = this.io.openChild(parent, parent.children.indexOf(e.node));
    this.attached.add(w);
    return (e.node = w);
  }

  /**
   * Block-id paragraph `node` taken out, its children in its place, `carrier` carrying its `line` after
   * the blank lines before it, and taking the blank lines after it. An end of the selection in it goes
   * to the end of the carrier's text, where a caret on its line acts.
   */
  #carry(carrier: Working, node: Working, line: string): void {
    const parent = node.parent!;
    const children = node.children.map((_, k) => this.io.openChild(node, k));
    spliceIn(parent.children, parent.children.indexOf(node), 1, children);
    for (const c of children) c.parent = parent;
    node.parent = null;
    this.attached.delete(node);
    const text = this.io.textOf(carrier)!;
    carrier.text = text.withBlockIdLines([...text.blockIdLines, { blankLines: carrier.gap, line }]);
    carrier.gap = node.gap;
    this.attached.add(carrier);
    this.gap(carrier.id).lines = null;
    this.#escape(carrier);
    const end = { ref: carrier.id, offset: textEnd(carrier.text), assoc: -1 } as const;
    const holds = (a: AnchorSpec | null): boolean => {
      const ref = !a ? null : 'ref' in a ? a.ref : 'blank' in a ? a.blank : (a.otherwise?.ref ?? null);
      return ref !== null && (typeof ref === 'number' ? ref : ref.id) === node.id;
    };
    if (holds(this.io.caret)) this.io.caret = end;
    if (holds(this.io.anchor)) this.io.anchor = end;
  }

  /** A read node opened where `done()` changes it (regrouped, a gap fixed), its place in `from` known. */
  #openRead(node: PersistentNode, origin: OurusNode): Working {
    const known = this.io.current.get(node);
    if (known) return known;
    const w = new Working(node.id, node.kind, node, origin, undefined, node.gap, [...node.children]);
    this.io.current.set(node, w);
    this.io.byId.set(node.id, w);
    return w;
  }

  #level(node: Child, origin: OurusNode | null): number {
    const text = node instanceof Working ? this.io.textOf(node) : origin ? this.from.textOf(origin) : null;
    return text instanceof OurusProse ? (text.heading?.level ?? 7) : 7;
  }

  /** Refuses an Obsidian note the draft makes start with a thematic break: `---` on its first line opens frontmatter. */
  #frontmatter(): void {
    const root = this.io.root;
    if (!root || this.from.config.flavor !== 'obsidian') return;
    const first = root.children[0];
    const was = this.from.root.children[0];
    const read = first instanceof Working ? first.source : first;
    if (!first || (this.from.root.children.length && this.from.root.offsets[0] !== 0)) return;
    if (read === was) {
      // the `---` first where it was, and another the draft writes below it (a copy, a rule moved or
      // made: the old text had none, or it would have read as frontmatter): a blank line before it
      const tree = this.from.mdTree;
      const fence = (n: OurusNode): boolean => n.block?.type === 'thematic_break' && /^---[ \t]*$/.test(this.from.text.slice(tree.line(n.startLine).from, tree.line(n.startLine).to));
      // (or a setext heading's underline the draft writes `---`, a heading demoted to level 2: B79)
      const underline = (w: Working): boolean => w.text instanceof OurusProse && w.text.heading?.form === 'setext' && /\n {0,3}---[ \t]*$/.test(w.text.text);
      if (first.kind === 'atom' && fence(this.from.rootNode.child(0)) && [...this.attached].some((w) => w !== first && ((w.kind === 'atom' && !!w.origin && fence(w.origin)) || underline(w)))) this.preamble = 1;
      return;
    }
    // a `---` first, with another below it, would open frontmatter: a blank line before it (DeleteSubtree9)
    if (first.kind !== 'atom' || read?.block?.type !== 'thematic_break') return;
    const origin = this.#under(root, first);
    const tree = this.from.mdTree;
    const fence = (i: number): boolean => /^---[ \t]*$/.test(this.from.text.slice(tree.line(i).from, tree.line(i).to));
    if (!origin || !fence(origin.startLine)) return;
    for (let i = 0; i < tree.lineCount; i++) if (i !== origin.startLine && fence(i)) this.preamble = 1;
  }

  /**
   * A blank line before the first node where its text starts with a byte-order mark (a paragraph of
   * it, moved first): opening the note, the mark would be before its Markdown (`mdDocumentStart`), no
   * character of the text. But where the note opens with one already, or with lines the writer keeps.
   */
  #byteOrderMark(): void {
    const root = this.io.root;
    const first = root?.children[0];
    if (!root || !first || (first.kind !== 'paragraph' && first.kind !== 'heading') || this.preamble || this.from.mdTree.documentStart) return;
    if (this.from.root.children.length && this.from.root.offsets[0] !== 0) return;
    const origin = first instanceof Working ? null : this.#under(root, first);
    const text = first instanceof Working ? this.io.textOf(first) : origin ? this.from.textOf(origin) : null;
    if (text?.text.startsWith('\ufeff')) this.preamble = 1;
  }

  /** Refuses a node another would read as its text: a block first in an item with no text of its own, a paragraph starting `[!type]` first in a quote with none. */
  #absorbs(container: Working): void {
    const first = container.children[0];
    const own = this.io.textOf(container);
    // (an empty quote, `>`, has no title either)
    const titleless = own === null || (container.kind === 'quote' && own instanceof OurusProse && trimMd(own.body) === '');
    if (!first || !titleless) return;
    const firstOrigin = this.#under(container, first);
    const firstText = first instanceof Working ? this.io.textOf(first) : firstOrigin ? this.from.textOf(firstOrigin) : null;
    if (own === null && container.kind === 'item' && first.kind !== 'item' && first.kind !== 'quote') throw new Refused(`the ${this.#nameOf(first)} would be read as the text of the item above it, which has none`);
    if (this.from.mdTree.flavor.has('callouts') && container.kind === 'quote' && first.kind === 'paragraph' && firstText instanceof OurusProse && mdCalloutAt(firstText.text.split('\n')[0]!)) {
      throw new Refused("a paragraph starting `[!type]` first in a quote would be read as the quote's callout title");
    }
  }

  // ---- 2. lists

  /**
   * Each item's list, for the items under a node the draft touched: an item starts a new list where
   * the node before it isn't an item of the list it came from; an ordered list the draft changed is
   * numbered from the start of the list its first item came from, one keeping its
   * items keeps its numbers.
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
      let run: { item: Child; origin: OurusNode | null }[] = [];
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
        const moved = !!origin && this.asks.placedIds.has(c.id);
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

  #list(run: readonly { item: Child; origin: OurusNode | null }[], parent: Working): void {
    // the list's kind and marker: of an item that stays in it, else of one moved in
    const known = run.find((r) => r.origin?.kind === 'item' && !this.asks.placedIds.has(r.item.id)) ?? run.find((r) => r.origin?.kind === 'item');
    const list = known ? this.from.listOf(known.origin!) : null;
    const attrs = list?.block.attrs.list ?? null;
    // a list of new items only: the form they would rather have
    const form = list ? undefined : run.map((r) => this.io.listForms.get(r.item.id)).find((f) => f !== undefined);
    const ordered = form ? /^(\d{1,9})([.)])$/.exec(form) : null;
    const type = attrs?.type ?? (ordered ? 'ordered' : 'bullet');
    let marker = type === 'ordered' ? (attrs?.delimiter ?? ordered?.[2] ?? '.') : (attrs?.bulletChar ?? (form && !ordered ? form : this.from.config.bullet));
    // a rule among its items, of the bullet's character, would read as one rule with it (`- ---`): a
    // list of new items takes another bullet; one an item stays in, refused
    if (type === 'bullet') {
      const rules = run.map((r) => (r.item instanceof Working ? this.io.textOf(r.item) : r.origin ? this.from.textOf(r.origin) : null)).filter((t) => t instanceof OurusAtom && t.type === 'thematic_break').map((t) => trimMd(t!.text)[0]);
      if (rules.includes(marker) && list) throw new Refused("the item's bullet and its rule would read as one rule");
      if (rules.includes(marker)) marker = [this.from.config.bullet, '-', '*', '+'].find((b) => !rules.includes(b))!;
    }
    const numberOf = (origin: OurusNode): number | null => (origin.kind === 'item' ? parseInt(this.from.markerOf(origin), 10) : null);
    let numbers: (number | null)[] = run.map(() => null);
    if (type === 'ordered') {
      const own = run.map((r) => (r.origin ? numberOf(r.origin) : null));
      const listItems = list ? list.children() : [];
      const sameItems = list !== null && listItems.length === run.length && run.every((r, i) => r.origin && r.origin.startLine === listItems[i]!.line);
      const was = listItems.map((item) => item.block.attrs.list!.start!);
      if (sameItems) numbers = own;
      else {
        // the lower part of a list split in two keeps its numbers; else from the start of the list its first item came from
        const head = list && listItems[0]!.line !== run[0]!.origin?.startLine && this.#before(parent, run[0]!.item, listItems[0]!.line);
        const start = head ? (own[0] ?? 1) : (was[0] ?? own.find((n) => n !== null) ?? (ordered ? Number(ordered[1]) : 1));
        numbers = listNumbering(own, was, start, this.from.config.orderedLists);
      }
      // moved right under a paragraph's text, which a list from another number can't interrupt: from 1
      // (a split list's lower part, TO6); but a list of its own, whole, outside every item keeps its
      // numbers, a blank line setting it apart (Backspace40b), where in an item that blank line would
      // loosen the item's list (Regression1, Regression8)
      const first = run[0]!.item;
      const k = parent.children.indexOf(first);
      const above = k > 0 ? parent.children[k - 1]! : parent;
      const aboveText = above === parent || above.kind === 'paragraph' ? (above instanceof Working ? this.io.textOf(above) : this.from.textOf(this.#under(parent, above)!)) : null;
      // (moved, its parent changed, or first now where an item was before it; or right under the
      // paragraph the item above it became, beside it where no paragraph adopts a list, as SiYuan and
      // BlockNote number it: DirectOutdent6, TO6 under `listParent: container`)
      const unwrapped = above !== parent && above instanceof Working && above.kind === 'paragraph' && above.source?.kind === 'item';
      const cameUnder = !!run[0]!.origin && (run[0]!.origin.parent?.persistentNode !== parent.source || (run[0]!.origin.index > 0 && k === 0 && parent.kind === 'item') || unwrapped);
      let inItem = false;
      for (let n: Working | null = parent; n && !inItem; n = n.parent) inItem = n.kind === 'item';
      if ((inItem || !sameItems) && (this.asks.placedIds.has(first.id) || cameUnder) && numbers[0] !== 1 && aboveText instanceof OurusProse && aboveText.type === 'paragraph' && !aboveText.empty) numbers = run.map((_, i) => 1 + i);
      // (a list marker's number has nine digits at most)
      if (numbers.some((n) => n !== null && n > MAX_ITEM_NUMBER)) throw new Refused('an item numbered past 999999999 is no list item');
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

  /**
   * A text the draft emptied can't carry its block-id lines: `-` and a blank line end an item, an
   * empty paragraph is nothing on disk (a placeholder holds it), and the block id after either would
   * name another block, or nothing.
   */
  #emptiedCarriers(): void {
    for (const w of this.attached) {
      if (w.text === undefined) continue;
      const text = w.text;
      if (text instanceof OurusProse && text.blockIdLines.length && text.empty) throw new Refused(`the ${this.#nameOf(w)}'s text would be empty, and an empty one can't carry its block-id lines`);
    }
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
    // (each node's gap before any scope set it; the nodes a scope set one for)
    const initial = new Map<Working, number>();
    const keep = (w: Working): number => (initial.has(w) ? initial.get(w)! : (initial.set(w, w.gap), w.gap));
    const given = new Set<Working>();
    // (the sections first, the document's end last: a node moved to it ends it with its blank lines,
    // but one a section's end gave its gap keeps it)
    for (const scope of [...headings, root]) {
      let was = scope.origin!;
      while (was.persistentNode.children.length) was = was.child(was.persistentNode.children.length - 1);
      let now: Working = scope;
      while (now.children.length) {
        now = this.io.openChild(now, now.children.length - 1);
        this.attached.add(now);
      }
      if (now === root || now.source === was.persistentNode || ended.has(now)) continue;
      // (the nodes from one to the other as they were, none moved or gone, the scope changed around
      // them, a heading's level or kind: the blank lines between them stay theirs)
      if (now.origin && this.#asWere(was, now.origin)) continue;
      ended.add(now);
      const own = keep(now);
      // (a node keeps a gap the command stated for it: Enter67's blank line after `---`, Enter37's line
      // that became an item)
      // (but a block of lines closed by no delimiter takes none: they would be its lines)
      const open = unclosed(now.text !== undefined ? now.text : now.origin ? this.from.textOf(now.origin) : null);
      if (!this.gaps.get(now.id)?.stated && !(open && was.gap > now.gap)) {
        now.gap = was.gap;
        this.gap(now.id).from = was.id;
        this.gap(now.id).lines = null;
        given.add(now);
      }
      const before = this.#opened(was);
      const closes = !unclosed(before ? this.io.textOf(before) : null) || own <= was.gap;
      if (before && closes &&!this.gaps.get(before.id)?.stated && !given.has(before)) {
        keep(before);
        before.gap = own;
        this.gap(before.id).from = now.id;
        this.gap(before.id).lines = null;
        given.add(before);
      }
    }
  }

  /** Whether the nodes of `from` from `a` to `b` (either way), both too, are where they were in the draft, none placed (or in a node placed) or removed. */
  #asWere(a: OurusNode, b: OurusNode): boolean {
    const [first, last] = a.startLine <= b.startLine ? [a, b] : [b, a];
    const placed = (n: OurusNode): boolean => {
      for (let up: OurusNode | null = n; up; up = up.parent) if (this.asks.placedIds.has(up.id)) return true;
      return false;
    };
    for (let n: OurusNode | null = first; n; n = n.children[0] ?? n.afterSubtree) {
      if (placed(n) || !this.#present(n)) return false;
      if (n === last) return true;
    }
    return false;
  }

  /** Whether `node` of `from` is in the draft still, opening nothing (`#opened` writes what it opens again). */
  #present(node: OurusNode): boolean {
    if (!this.#inDraft) {
      // every node of `from` the draft holds: its working copies' sources, and the read subtrees under them
      const held = new Set<PersistentNode>();
      const add = (n: PersistentNode): void => {
        held.add(n);
        n.children.forEach(add);
      };
      for (const w of [this.io.root!, ...this.attached]) {
        if (w.source) held.add(w.source);
        for (const c of w.children) if (!(c instanceof Working)) add(c);
      }
      this.#inDraft = held;
    }
    return this.#inDraft.has(node.persistentNode);
  }

  /** (`#present`'s nodes, read once a scope asks: `#scopeEnds` changes no child list) */
  #inDraft: Set<PersistentNode> | null = null;

  /** `node` of `from` opened where it is in the draft, with the path to it; null where the draft removed it. */
  #opened(node: OurusNode): Working | null {
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

  /**
   * How many of the blank lines after `node`, as it was in `from`, are whitespace ourus added: the lines
   * whose line break has an `auto` mark; none where the command stated the node's gap, or where the gap
   * isn't the one it had there.
   */
  #autoBlankLines(node: Child): number {
    if (!this.from.marks.auto.length) return 0;
    // (the lines are those of the node the gap came from, where a split, a join or a command carried it)
    const source = this.gaps.get(node.id)?.from ?? node.id;
    const was = source < 0 ? undefined : this.from.node(source);
    if (!was || node.gap !== was.gap || was.gap === 0 || (source === node.id && !!this.gaps.get(node.id)?.stated)) return 0;
    // (never below the author's lines of the node that took them in: its own gap, which this one replaced)
    return Math.max(0, Math.min(autoLinesOf(this.from, was), node.gap - (this.gaps.get(node.id)?.floor ?? 0)));
  }

  /** The gap after child `k` of `parent` (its last descendant's) set to `gap`; `auto`: raised from none for Markdown's sake, ours. */
  #setTrailingGap(parent: Working, k: number, gap: number, auto = false): void {
    let w = this.io.openChild(parent, k);
    this.attached.add(w);
    while (w.children.length) {
      const next = this.io.openChild(w, w.children.length - 1);
      this.attached.add(next);
      w = next;
    }
    // (but none after a block of lines nothing closes: they would be its lines)
    if (gap > 0 && unclosed(this.io.textOf(w))) return;
    if (auto && w.gap === 0 && gap > 0) this.gap(w.id).auto = true;
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
    // (a first child whose first line is lazy, first no longer right after what it continued)
    if (ks.has(-1) || ks.has(0)) this.#keepsIn(parent, 0);
    for (const k of [...ks].sort((a, b) => a - b)) {
      if (k === -1) {
        // under an empty item, a node moved in comes right after its marker's line: `-` and one blank
        // line end an item, so the blank lines between go (Indent30)
        const own = this.io.textOf(parent);
        const emptyItem = parent.kind === 'item' && own instanceof OurusProse && own.empty && !own.text.includes('\n') && this.asks.placedIds.has(parent.children[0]!.id);
        if (parent.gap > 0 && emptyItem) {
          parent.gap = 0;
          this.gap(parent.id).lines = null;
        }
        // its own text and its first child, in the parent's container (an item's, its own)
        // (a quote's title in Obsidian is a block of one line; by the convention elsewhere a paragraph, which what follows can continue)
        const obsidianTitle = parent.source?.head?.type === 'callout_title' || (own instanceof OurusProse && own.type === 'title' && this.from.config.flavor === 'obsidian');
        // (after a block of lines no delimiter closes, any line is the block's: a blank line too)
        if (parent.kind !== 'root' && unclosed(own)) throw new Refused(`the ${this.#nameOf(parent.children[0]!)} would be a line of the ${nodeName('atom', (own as OurusAtom).type)} above it, which nothing closes`);
        // (a blank line of ours under it, which stays unless they are apart without it)
        const auto = parent.kind !== 'root' && parent.gap > 0 && own !== null ? this.#autoBlankLines(parent) : 0;
        // (under a title Obsidian reads as a block of one line nothing needs one: it goes)
        if (obsidianTitle && auto) {
          parent.gap -= auto;
          this.gap(parent.id).lines = null;
        }
        if (parent.kind === 'root' || (parent.gap !== 0 && !auto) || own === null || obsidianTitle) continue;
        if (!auto && this.#endsWithBlockIdLines(parent, null)) {
          parent.gap = 1;
          this.gap(parent.id).auto = true;
          continue;
        }
        const first = parent.children[0]!;
        // an item with no text but its frame (`-`, `- [ ]`) has no paragraph for what follows to continue
        const empty = parent.kind === 'item' && own instanceof OurusProse && trimMd(own.body) === '' && !own.text.includes('\n');
        // a new empty paragraph first under it, but a split's second half, is set off from its text (not
        // an item's with none, a checkbox but in CommonMark, where it is text: a blank line after it would
        // end the item)
        const textless = empty && (!(own instanceof OurusProse) || own.task === null || this.from.config.flavor !== 'commonmark');
        if (!auto && !textless && made(first) && first.kind === 'paragraph' && first.text instanceof OurusProse && first.text.empty && this.gaps.get(first.id)?.lines === undefined) {
          parent.gap = 1;
          this.gap(parent.id).auto = true;
          continue;
        }
        const upper = this.#afterDefinition(parent, parent.parent, this.#ownLines(parent, parent.origin, true));
        const lower = this.#firstLines(first, parent);
        // (a text with lazy lines, where as the parent holds them they read as more than its paragraph,
        // `| a |⏎|---|` a table: read by its first line alone, the paragraph it is, which is what what
        // follows would continue or not)
        const lazy = parent.text === undefined && !!parent.origin && lazyLines(this.from, parent.origin) && !onePara(upper, this.from.mdTree.flavor);
        const held = lazy ? upper.slice(0, 1) : upper;
        if (auto) {
          const left = parent.gap - auto;
          if (!this.#endsWithBlockIdLines(parent, null) && this.#apart(held, [...Array<string>(left).fill(''), ...lower], empty)) {
            parent.gap = left;
            this.gap(parent.id).lines = null;
          }
          continue;
        }
        if (this.#apart(held, lower, empty)) continue;
        if (!this.#apart(held, ['', ...lower], empty)) throw new Refused(`the ${this.#nameOf(parent.children[0]!)} would be read as part of the ${this.#nameOf(parent)}'s text above it`);
        parent.gap = 1;
        this.gap(parent.id).auto = true;
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
      // where they were, the upper side untouched (its subtree ends as it did, its items' numbers as
      // wide) and the lower's first line too
      if (adjacent && !(a instanceof Working) && !changed(b) && !this.#narrowed(a)) continue;
      // (an item that was empty, given text, an atom's too, a table pasted there, or its first child, a
      // zoomed Enter's, is a seam like any: what followed it, indented, may now be its)
      const was = a instanceof Working && a.origin ? this.from.textOf(a.origin) : null;
      const filled = a instanceof Working && was instanceof OurusProse && was.empty && (a.text instanceof OurusAtom || (a.text instanceof OurusProse && !a.text.empty) || (a.children.length > 0 && !a.origin!.persistentNode.children.length));
      const sameList = a.kind === 'item' && b.kind === 'item' && this.#sameList(parent, a, b);
      // (the filled item's next sibling still one where its first line starts an item of the list)
      if (sameList && filled && this.#nextItem(this.#lastLines(a, parent), this.#firstLines(b, parent))) continue;
      if (sameList && !filled) {
        // (an item joining a list of another bullet reads as its kind with that one: B82)
        if (b instanceof Working && b.source && this.asks.placedIds.has(b.id)) this.#keepsKind(parent, k);
        // an item the draft placed in a tight list (moved, or made an item), with its gap: the blank
        // line would loosen the list (Quote18, Indent29); a list joined where nothing moved keeps it (Backspace20)
        const placed = (c: Child): boolean => c instanceof Working && !!c.source && (this.asks.placedIds.has(c.id) || c.kind !== c.source.kind);
        // (the list it joined: of the item that stays)
        const stays = [a, b].filter((c) => !placed(c));
        const loose = (stays.length ? stays : [a, b]).some((c) => {
          const o = this.#under(parent, c);
          return !!o && this.from.listOf(o)?.block.attrs.tight === false;
        });
        const blanks = this.#trailingGapOf(parent, k - 1);
        if ((placed(a) || placed(b)) && !loose && blanks > 0) {
          this.#setTrailingGap(parent, k - 1, 0);
          delete this.gaps.get(this.#lastDescendant(parent.children[k - 1]!).id)?.lines;
          // they still set the list apart from what follows it, where something does (a section's heading)
          let end = k;
          while (end + 1 < n && parent.children[end + 1]!.kind === 'item' && this.#sameList(parent, parent.children[end]!, parent.children[end + 1]!)) end++;
          if (this.#followed(parent, end) && this.#trailingGapOf(parent, end) < blanks) this.#setTrailingGap(parent, end, blanks);
          continue;
        }
        // a loose list stays loose: the item at the caret, new or not, set off from the item above by a blank line
        // (not a new item put in before another, which goes in tight)
        // (only where the draft put a new item in it)
        if (b === this.#caretNode() && this.io.joins.get(b.id) !== 'next' && parent.children.some(made) && this.#loose(parent, a, b) && this.#trailingGapOf(parent, k - 1) === 0) this.#setTrailingGap(parent, k - 1, 1, true);
        continue;
      }
      // the lower side reading as its kind first (a paragraph's padding that would make it code goes)
      this.#keepsKind(parent, k);
      this.#keepsOut(parent, k);
      this.#keepsIn(parent, k);
      // (a paragraph with lazy lines, read without the prefixes that make them lazy, would read as
      // more than it is, `=` an underline: by its first line, the paragraph it is, which is what what
      // follows would continue or not)
      const read = a instanceof Working ? a.origin : this.#under(parent, a);
      const lazy = a.kind === 'paragraph' && !a.children.length && !!read && lazyLines(this.from, read) && (!(a instanceof Working) || a.text === undefined);
      const upper = this.#afterDefinition(a, parent, lazy ? this.#lastLines(a, parent).slice(0, 1) : this.#lastLines(a, parent));
      const lower = this.#firstLines(parent.children[k]!, parent);
      const column = /\t/.test(upper.join('') + lower.join('')) ? this.#containerColumn(parent) : 0;
      // (the document's first node above: its first line the document's, where front matter is read)
      const first = parent.kind === 'root' && k === 1;
      // a new empty paragraph, its placeholder's line, is set off by a blank line from what follows, but
      // where it has the blank lines that were there (a split's second half); from what is above, where
      // it would continue it (not a closed fence: Fence59)
      const last = this.#lastDescendant(a);
      const emptyNew = made(last) && last.kind === 'paragraph' && last.text instanceof OurusProse && last.text.empty;
      if (this.#trailingGapOf(parent, k - 1) === 0 && emptyNew && this.gaps.get(last.id)?.lines === undefined) this.#setTrailingGap(parent, k - 1, 1, true);
      // (block-id lines, outside an item, a blank line after them whatever follows: right under them,
      // a block would leave them naming only their own line)
      if (this.#trailingGapOf(parent, k - 1) === 0 && this.#endsWithBlockIdLines(parent, a)) this.#setTrailingGap(parent, k - 1, 1, true);
      const blanks = this.#trailingGapOf(parent, k - 1);
      // blank lines ourus added where Markdown needed them (`auto`) and the command didn't ask for: gone
      // where the nodes stay apart without them (a join taking an empty node out)
      const own = this.#autoBlankLines(last);
      if (blanks > 0 && own > 0 && blanks <= last.gap + own && this.#apart(upper, [...Array<string>(blanks - own).fill(''), ...lower], false, column, first)) {
        this.#setTrailingGap(parent, k - 1, blanks - own);
        this.gap(last.id).lines = null;
        continue;
      }
      if (blanks > 0) {
        // apart already, unless even blank lines don't keep it (indented code after an item)
        if (!this.#apart(upper, [...Array<string>(blanks).fill(''), ...lower], false, column, first)) throw new Refused(`the ${this.#nameOf(b)} would join the ${this.#nameOf(a)} above it, even with a blank line between`);
        continue;
      }
      if (!this.#apart(upper, lower, false, column, first)) {
        if (!this.#apart(upper, ['', ...lower], false, column, first)) throw new Refused(`the ${this.#nameOf(b)} would join the ${this.#nameOf(a)} above it, even with a blank line between`);
        this.#setTrailingGap(parent, k - 1, 1, true);
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
    const setext = node.kind === 'heading' && text instanceof OurusProse && text.heading?.form === 'setext';
    const lines = setext ? this.#readLines(containerIn(origin), origin.startLine, origin.textLastLine) : this.#firstLines(node, parent);
    // (an item in a list of another bullet now: its first line with that one, `+ --` a rule as `- --`, B82)
    const place = node.kind === 'item' ? this.lists.get(node.id) : undefined;
    if (place?.type === 'bullet' && lines.length) lines[0] = lines[0]!.replace(/^([ \t>]*)[-*+](?=[ \t]|$)/, `$1${place.marker}`);
    // (the document's first line opens front matter; any other `---` is a rule)
    const flavor = parent.kind === 'root' && k === 0 ? this.from.mdTree.flavor : midText(this.from.mdTree.flavor);
    const block = MdTree.parse(lines.join('\n'), flavor).root.children[0];
    const want: Record<string, string> = { paragraph: 'paragraph', heading: 'heading', item: 'list', quote: 'blockquote' };
    // (a quote's text, `quotes: text`, a quote's)
    const kind = node.kind === 'paragraph' && text instanceof OurusProse && text.type === 'quote' ? 'blockquote' : (want[node.kind] ?? origin.persistentNode.block!.type);
    if (!block || block.type === kind || trimMd(lines[0]!) === '') return;
    // (such an item's text escaped, as a new one's is: `- \--`)
    const ruleItem = node.kind === 'item' && block.type === 'thematic_break' && text instanceof OurusProse && text.type === 'paragraph' && !text.frame.length;
    if (!ruleItem && (node.kind !== 'paragraph' || !(text instanceof OurusProse))) throw new Refused(`the ${this.#nameOf(node)} would read as ${withArticle(nodeName('atom', block.type))} where it now is`);
    const w = this.io.openChild(parent, k);
    this.attached.add(w);
    w.text = text;
    this.#escape(w);
  }

  /**
   * A paragraph after child `k - 1` of `parent`, its first line's padding (the spaces Markdown hides)
   * as written, where the subtree above ends inside an item: there that padding may put it in the
   * item, its content; written again without it. So too an atom's indentation (a rule's, a table's,
   * HTML's, up to three columns: as Markdown reads them, none), from each of its lines.
   */
  #keepsOut(parent: Working, k: number): void {
    const node = parent.children[k]!;
    if ((node.kind !== 'paragraph' && node.kind !== 'atom') || this.paddings.has(node.id)) return;
    const origin = this.#under(parent, node);
    const text = node instanceof Working && node.text !== undefined ? node.text : origin ? this.from.textOf(origin) : null;
    // (not code, nor math or a comment, whose lines are past their opening's indentation, which may be
    // a tab's columns its container takes part of)
    const atom = text instanceof OurusAtom && !/^(?:fenced_code|indented_code|math_block|comment_block)$/.test(text.type) ? /^ {1,3}(?=\S)/.exec(text.text)?.[0].length ?? 0 : 0;
    if (!origin || (!atom && (!(text instanceof OurusProse) || text.type !== 'paragraph' || !this.#padding(origin)))) return;
    // (the node above where it was: its padding as it was there, the item it was out of still, but
    // where a number of its last items is narrower now, its content column too: `10.` renumbered `1.`)
    const above = parent.children[k - 1]!;
    if (origin.preceding && this.#under(parent, above)?.persistentNode === origin.prev?.persistentNode && !this.#narrowed(above)) return;
    // (an item whose content column a narrower number moved left: the padding may reach it now)
    let inItem = above.kind === 'item' && this.#narrowed(above);
    for (let n: Child = above; n.children.length && !inItem; n = n.children[n.children.length - 1]!) inItem = n.kind === 'item' || n.children.some((c) => c.kind === 'item');
    if (!inItem) return;
    const w = node instanceof Working ? node : this.io.openChild(parent, k);
    this.attached.add(w);
    if (atom && text instanceof OurusAtom) {
      const lost: { at: number; n: number }[] = [];
      let at = 0;
      // (HTML's first line only: the lines after it are the block's whatever they start with, and its
      // characters, a `<pre>`'s spaces)
      const lines = text.text.split('\n');
      for (const l of text.type === 'html_block' ? lines.slice(0, 1) : lines) {
        const n = Math.min(atom, /^ */.exec(l)![0].length);
        if (n) lost.push({ at, n });
        at += l.length + 1;
      }
      let out = text;
      for (const { at: from, n } of [...lost].reverse()) out = out.splice(from, from + n);
      w.text = out;
      this.lost.set(w, [...(this.lost.get(w) ?? []), ...lost]);
      return;
    }
    if (w.text === undefined) {
      w.text = text;
      this.#escape(w);
    }
    this.paddings.set(w.id, 0);
  }

  /**
   * `lines`, the last lines of `node`, a child of `parent`, read with the lines of the reference
   * definition it goes on from, where it is a paragraph right after one, with no blank line between,
   * still before it: the parser's paragraph the definition starts, which an empty item can't interrupt
   * (`[a]:u⏎-`: `-` a paragraph, which `b` after it would go on, and `-` after `0.` underlines).
   */
  #afterDefinition(node: Child, parent: Working | null, lines: string[]): string[] {
    const origin = node instanceof Working ? node.origin : parent ? this.#under(parent, node) : null;
    const prev = origin?.kind === 'paragraph' ? origin.prev : null;
    if (!parent || !prev || prev.persistentNode.block?.type !== 'refdef' || prev.endLine + 1 !== origin!.startLine) return lines;
    const k = parent.children.indexOf(node);
    if (k < 1 || this.#under(parent, parent.children[k - 1]!)?.persistentNode !== prev.persistentNode) return lines;
    return [...this.#readLines(containerIn(prev), prev.startLine, prev.endLine), ...lines];
  }

  /**
   * Whether `node` or a last descendant of it is an item whose number is written narrower than it was,
   * where it was (one moved is written at another column: its old width says nothing of it).
   */
  #narrowed(node: Child): boolean {
    for (let n: Child | undefined = node; n; n = n.children[n.children.length - 1]) {
      if (this.asks.placedIds.has(n.id)) continue;
      const number = n.kind === 'item' ? this.lists.get(n.id)?.number : null;
      const was = this.from.node(n.id);
      if (number !== null && number !== undefined && was?.kind === 'item' && String(number).length < parseInt(this.from.markerOf(was), 10).toString().length) return true;
    }
    return false;
  }

  /**
   * A read paragraph after child `k - 1` of `parent`, its first line lazy (`T` after `- [a]:u`): lazy
   * only right after what it continued, so after another node above it, spelled again, its lines
   * after the container's prefix. So too an atom whose first line is a paragraph's it continued
   * lazily, a table's header (`> a⏎b⏎> |---|`).
   */
  #keepsIn(parent: Working, k: number): void {
    const node = parent.children[k]!;
    if ((node.kind !== 'paragraph' && node.kind !== 'atom') || (node instanceof Working && node.text !== undefined)) return;
    const origin = this.#under(parent, node);
    const text = origin ? this.from.textOf(origin) : null;
    if (!origin || !text || (node.kind === 'paragraph' && !(text instanceof OurusProse)) || !this.from.mdTree.line(origin.textFirstLine).lazy) return;
    // (in the container it was in, under the node it was or another, a heading made above it: moved
    // to another, it is written as moved lines are)
    let container: Working | null = parent;
    while (container && container.kind !== 'root' && container.kind !== 'item' && container.kind !== 'quote') container = container.parent;
    let was: OurusNode | null = origin.parent;
    while (was && was.kind !== 'root' && was.kind !== 'item' && was.kind !== 'quote') was = was.parent;
    const above = k > 0 ? this.#under(parent, parent.children[k - 1]!) : parent.origin;
    if (!container || was?.persistentNode !== container.source || above?.persistentNode === origin.preceding?.persistentNode) return;
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

  /**
   * Whether `parent`'s own lines (`child` null), or its child `child`'s subtree, end with block-id
   * lines a text carries, outside every list item, where Obsidian reads one only with a blank line
   * after it.
   */
  #endsWithBlockIdLines(parent: Working, child: Child | null): boolean {
    for (let up: Working | null = parent; up; up = up.parent) if (up.kind === 'item') return false;
    let node: Child = child ?? parent;
    if (child) {
      while (node.kind !== 'item' && node.children.length) node = node.children[node.children.length - 1]!;
      if (node.kind === 'item') return false;
    }
    return node instanceof Working ? !!this.io.textOf(node)?.blockIdLines.length : node.blockIdCount > 0;
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
    const origin = (c: Child): OurusNode | null => this.#under(parent, c);
    const oa = origin(a);
    const ob = origin(b);
    return !!oa && !!ob && this.from.listOf(oa)?.block === this.from.listOf(ob)?.block;
  }

  /**
   * The lines of the text that ends `node`'s subtree, as written in its container: past the prefix of
   * the container it was in (where it stays, the one it will be in).
   */
  #lastLines(node: Child, parent: Working): string[] {
    let origin: OurusNode | null = this.#under(parent, node);
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
    // (an item moved here from another container: at this one's column, as the writer sets it)
    if (this.#movedIn(parent, node, origin)) {
      movedPrefix = '';
      dedent = /^ */.exec(this.#readLines(readIn, origin!.startLine, origin!.startLine)[0]!)![0].length;
    }
    const moved = (lines: readonly string[]): string[] =>
      movedPrefix === null ? [...lines] : lines.map((l) => movedPrefix + l.slice(Math.min(dedent, /^ */.exec(l)![0].length)));
    const push = (lines: readonly string[]): void => {
      spliceIn(open, open.length, 0, moved(lines));
    };
    for (;;) {
      const n: number = node.children.length;
      if (!n) break;
      let pushedOwn = false;
      // (an item the draft made of a paragraph: written as a new one is, its list at its content column)
      const madeItem = node instanceof Working && node.kind === 'item' && !!node.source && node.source.kind !== 'item';
      if ((node.kind === 'item' || node.kind === 'quote') && origin && !madeItem) {
        // its own text, and a blank line where one sets it off from what follows in it (in a quote, `>`)
        inQuote ||= node.kind === 'quote';
        const ownText = node instanceof Working && node.text !== undefined ? this.io.textOf(node) : this.from.textOf(origin);
        // (a quote with no text of its own: its first line its first child's, which keeps a lazy line
        // after it in the quote; but a block of lines' opening, read out of what comes after it there,
        // a fence that would take in the lines after it, none)
        const firstBlock = node.children[0];
        const firstText = !firstBlock || firstBlock.kind !== 'atom' ? null : firstBlock instanceof Working ? this.io.textOf(firstBlock) : origin ? this.from.textOf(childOrigin(origin, firstBlock)!) : null;
        const opens = firstText instanceof OurusAtom && /^(?:fenced_code|math_block|comment_block|html_block)$/.test(firstText.type);
        pushedOwn = node.kind === 'item' || !!ownText || !opens;
        if (pushedOwn) push(node instanceof Working && node.text !== undefined ? this.#ownLines(node, readIn) : this.#remarked(node, origin, this.#readLines(readIn, origin.startLine, origin.ownLastLine)));
        // (an item with no text: its first child's first line too, which keeps it open past a blank
        // line, as an empty item and a blank line end one: `1. ⏎    1. x⏎⏎      - x`)
        const firstChild = node.children[0]!;
        const firstOrigin = n > 1 && node.kind === 'item' && (!ownText || (ownText instanceof OurusProse && trimMd(ownText.body) === '')) ? (firstChild instanceof Working ? firstChild.origin : childOrigin(origin, firstChild)) : null;
        if (firstOrigin && firstOrigin.startLine > origin.startLine) push(this.#readLines(readIn, firstOrigin.startLine, firstOrigin.startLine));
        // what a new line in it starts with: its first line's prefix, its markers as spaces
        const first = this.from.mdTree.line(origin.startLine);
        const block = origin.persistentNode.block;
        const piece = first.prefix.find((p) => p.container.block === block);
        const end = node.kind === 'quote' && piece ? piece.to : first.contentFrom;
        inside = this.#lineIn(first, readIn).slice(0, Math.max(0, end - this.#cut(first, readIn))).replace(/[^>\t ]/g, ' ');
        // (an item whose text starts below its marker, its line ending there: its content column, one
        // past the marker, as the writer writes its children)
        if (node.kind === 'item' && end === first.to) inside += ' '.repeat(Math.max(0, block!.attrs.contentColumn! - advanceColumns(this.from.text, first.from, first.to, 0)));
        // (in a quote, `>`; past the prefix of where a subtree moved, that prefix, its `>`s the quotes
        // above it, and a `>` more for one in the subtree)
        if (node.gap > 0 || (n > 1 && this.#trailingGapOf(node, n - 2) > 0)) open.push(inQuote ? (movedPrefix ?? '') + '>' : (movedPrefix ?? '').replace(/[ \t]+$/, ''));
      } else if ((node.kind === 'item' || node.kind === 'quote') && node instanceof Working && (!node.origin || madeItem)) {
        // one the draft made: its own text after its marker, where a new line in it starts at its content column
        inQuote ||= node.kind === 'quote';
        pushedOwn = node.kind === 'item';
        if (pushedOwn) spliceIn(open, open.length, 0, this.#ownLines(node, null).map((l) => inside + l));
        // (its children at its text's column: its indentation, its marker and what follows it)
        if (node.kind === 'quote') inside += '> ';
        else {
          const { indent, width } = this.#madeItem(node, null);
          inside += indent + ' '.repeat(width);
        }
        if (node.gap > 0 || (n > 1 && this.#trailingGapOf(node, n - 2) > 0)) open.push(inside.replace(/[ \t]+$/, ''));
      }
      const last: Child = node.children[n - 1]!;
      // (a read node regrouped under it from elsewhere, an item a paragraph adopts: where it was)
      const next = last instanceof Working ? last.origin : ((node instanceof Working ? this.#under(node, last) : null) ?? (origin ? childOrigin(origin, last) : null));
      // a child on its parent's first line (`- - a`) has that line already
      if (next && origin && next.startLine === origin.startLine && pushedOwn && open.length) open.pop();
      // one moved here from elsewhere is written after this node's prefix, as a new one is
      // (or under a container the draft made another kind: an item unwrapped, its children out of it)
      const unwrapped = node instanceof Working && !!node.source && node.kind !== node.source.kind && (node.source.kind === 'item' || node.source.kind === 'quote');
      // (or moved in from deeper in it, its lines at another depth, B303; but tab-led ones, read as they
      // were: the dedent counts spaces)
      const movedUp = last instanceof Working && !!next && !!origin && next.parent !== origin && isDescendant(next, origin) && !/^[ >]*\t/.test(this.from.text.slice(this.from.mdTree.line(next.startLine).from, this.from.mdTree.line(next.startLine).contentFrom));
      if (movedPrefix === null && next && origin && (!isDescendant(next, origin) || unwrapped || madeItem || movedUp)) {
        movedPrefix = inside;
        inQuote = false;
        readIn = containerIn(next);
        dedent = /^ */.exec(this.#readLines(readIn, next.startLine, next.startLine)[0]!)![0].length;
      }
      origin = next;
      node = last;
    }
    let own = node instanceof Working && node.text !== undefined ? this.#ownLines(node, readIn) : origin ? this.#remarked(node, origin, this.#readLines(readIn, origin.persistentNode.kind === 'item' ? origin.startLine : origin.textFirstLine, origin.ownLastLine)) : node instanceof Working ? this.#ownLines(node, readIn) : [''];
    // a read paragraph's first-line padding isn't text: read alone, four columns of it would be code
    // (but the prefix of the containers it is in, an item's continuation, read from further out, is
    // theirs: without it the line would read out of them, a table after it apart from it)
    if (node.kind === 'paragraph' && !(node instanceof Working && node.text !== undefined) && movedPrefix === null && own.length) {
      const kept = inside && own[0]!.startsWith(inside) ? inside : '';
      own[0] = kept + own[0]!.slice(kept.length).replace(/^[ \t]+/, '');
    }
    // a node the draft made has no old lines: it is written after the prefix of the container it is in
    if (movedPrefix !== null) {
      // its lazy lines stay lazy, as the writer keeps them
      const first = origin && !(node instanceof Working && node.text !== undefined) ? (origin.persistentNode.kind === 'item' ? origin.startLine : origin.textFirstLine) : -1;
      const lazy = (k: number): boolean => first >= 0 && k > 0 && this.from.mdTree.line(first + k).lazy;
      own = moved(own).map((l, k) => (lazy(k) ? own[k]! : l));
    } else if (inside && (!origin || (node instanceof Working && node.text !== undefined && node.kind !== node.source?.kind))) {
      // (one made, or made another kind, a paragraph an item: written whole as a new one, after the prefix
      // of the container it is in, as a read one's lines have it: `> - second`, B296)
      own = own.map((l) => inside + l);
    }
    return [...open, ...own];
  }

  /**
   * How far past `container`'s content column a new item is written in a document indented with
   * tabs, where it lines up with no item there: a tab past the container's marker (the writer's `tabChild`).
   */
  #tabChild(node: Working, container: OurusNode | null): number {
    const text = this.from.text;
    container ??= node.parent?.origin ?? null;
    // (by the unit, as the writer's `unitChild`: at the content column under 2)
    const unit = indentUnitOf(this.from);
    if (!container || container.kind !== 'item' || unit === 2 || (unit === 'tab' && !/(?:^|\n)[ >]*\t/.test(text))) return 0;
    if (node.parent?.children.some((c) => c !== node && c.kind === 'item' && !!this.#under(node.parent!, c))) return 0;
    const line = this.from.mdTree.line(container.startLine);
    const block = container.persistentNode.block!;
    let column = 0;
    for (const c of text.slice(line.from, atLine(line, block.attrs.markerStart!))) column = c === '\t' ? column + 4 - (column % 4) : column + 1;
    if (text.slice(line.from, line.contentFrom).includes('>')) return 0;
    return Math.max(0, (unit === 4 ? column + 4 : column + 4 - (column % 4)) - block.attrs.contentColumn!);
  }

  /**
   * The lines of `node`'s own text, as written in `container` (an outer one, or the node itself: an
   * item's past its marker), and the block-id lines it carries after them.
   */
  #ownLines(node: Working, container: OurusNode | null, own = !!node.origin && container === node.origin): string[] {
    const origin = node.origin;
    if (node.text === undefined) {
      if (!origin) return [''];
      return this.#readLines(container, own || node.kind !== 'item' ? origin.textFirstLine : origin.startLine, origin.ownLastLine);
    }
    const written = this.#written(node);
    // (its block-id lines at its later lines' column, their blank lines bare)
    const carried = (indent: string): string[] => (node.text ? blockIdLinesOf(node.text) : []).map((l) => (l ? indent + l : indent.replace(/[ \t]+$/, '')));
    if (!origin || node.kind !== node.source?.kind) {
      // a node the draft made, or of another kind (written whole, as a new one): an item after its marker, its list's
      if (node.kind !== 'item' || own) return [...written, ...carried('')];
      const { indent, marker, separator, width } = this.#madeItem(node, container);
      const later = `${indent}${' '.repeat(width)}`;
      return [...written.map((l, k) => (k === 0 ? `${indent}${marker}${separator}${l}` : later + l)), ...carried(later)];
    }
    // after the prefix its first line had in the container, the rest at its content column
    const tree = this.from.mdTree;
    const first = tree.line(node.kind === 'item' && !own ? origin.startLine : origin.textFirstLine);
    const cut = this.#cut(first, container);
    // up to where its text starts, in the line as the container holds it (a partly taken tab as its columns)
    const held = this.#lineIn(first, container);
    const widened = held.length - (first.to - cut);
    // (an item that had no text, its first block on its line: after its marker and a space; so one whose
    // text was below its marker and now starts on its line: `-⏎  x` joined is `- x`)
    const was = this.from.textOf(origin);
    const wasBelow = was instanceof OurusProse && was.frame.some((p) => p.part === 'below');
    const nowBelow = node.text instanceof OurusProse && node.text.frame.some((p) => p.part === 'below');
    const textless = !was || (node.kind === 'item' && !own && wasBelow && !nowBelow);
    const at = textless ? atLine(first, origin.persistentNode.block!.attrs.markerEnd!) : this.from.posOf(origin, 0, -1);
    // (and the padding the writer keeps, under four columns: a paragraph's `  x`)
    // (a padding the draft set: as set)
    const padding = (): string => (this.paddings.has(node.id) ? ' '.repeat(this.paddings.get(node.id)!) : this.#padding(origin));
    const lead = own ? '' : held.slice(0, Math.max(0, at - cut + widened)) + (textless ? ' ' : padding());
    // the later lines' prefix: the first line's pieces past the container's, a quote's `>` as written, an
    // item's as spaces to its text; written as the node itself holds them, none but its own (a paragraph
    // out of the quote it was in has none: `q⏎    - a`, not `> …`)
    const piece = container && container.kind !== 'root' ? first.prefix.findIndex((p) => p.container.block === container.persistentNode.block) : -1;
    const after = piece >= 0 ? piece + 1 : own ? first.prefix.length : 0;
    const ownItem = node.kind === 'item' && !own ? origin.persistentNode.block : null;
    // (a quote that was the node's text, `> q`: its `>`s are the text's, written with it, or gone with
    // its frame, not a container's)
    const textQuote = origin.persistentNode.textQuote;
    // (an atom's own lines hold its containers' prefixes, a quote read as an atom's `>`, a list in it: none of them twice, B59)
    const ownBlock = node.kind === 'atom' ? first.prefix.findIndex((p) => p.container.block === origin.persistentNode.block) : -1;
    const indent = first.prefix
      .slice(after, ownBlock >= after ? ownBlock : undefined)
      .filter((p) => p.container.block !== textQuote)
      .map((p) => (p.container.block.type === 'blockquote' ? this.from.text.slice(p.from, p.to) : ' '.repeat((p.container.block === ownItem ? ownItem.attrs.contentColumn! : p.toColumn) - p.fromColumn)))
      .join('');
    return [...written.map((l, k) => (k === 0 ? lead + l : indent + l)), ...carried(indent)];
  }

  /**
   * How an item the draft made is laid out in its container, as the writer writes it: its indentation
   * (in a document indented with tabs, first in an item, a tab past its marker; lined up with an item
   * a command named, at its column), its marker, what follows it (a space, or what a command asked, a
   * pasted item's own), and the columns from its marker to its text.
   */
  #madeItem(node: Working, container: OurusNode | null): { indent: string; marker: string; separator: string; width: number } {
    const place = this.lists.get(node.id);
    const marker = placeMarker(place);
    const up = this.asks.lineUps.get(node.id);
    const indent = ' '.repeat(up ? Math.max(0, up.block.attrs.markerColumn! - this.#containerColumn(node.parent)) : this.#tabChild(node, container));
    const start = this.#containerColumn(node.parent) + indent.length;
    // (a text starting below its marker: one column past the marker, whatever its line ends with)
    const below = node.text instanceof OurusProse && node.text.frame.some((p) => p.part === 'below');
    const separator = (below ? this.asks.separators.get(node.id) : separatorAt(this.asks.separators.get(node.id), start + marker.length)) ?? ' ';
    const width = below ? marker.length + 1 : advanceColumns(marker + separator, 0, marker.length + separator.length, start) - start;
    return { indent, marker, separator, width };
  }

  /** The spaces before `origin`'s text that the writer keeps where it spells it: under four columns, none a held space. */
  #padding(origin: OurusNode): string {
    const [p0, p1] = [this.from.posOf(origin, 0, -1), this.from.posOf(origin, 0, 1)];
    let padding = '';
    for (let at = p0; at < p1; at++) if ((this.from.text[at] === ' ' || this.from.text[at] === '\t') && !this.from.marks.hasHeldSpaceAt(at)) padding += this.from.text[at];
    return padding.replace(/\t/g, '    ').length >= 4 ? '' : padding;
  }

  /** The first lines of `node`, up to two, as written in its container, from where it starts (an item's marker, a quote's `>`). */
  #firstLines(node: Child, parent: Working): string[] {
    // a new quote with no text: its first child's, after its `>`
    if (node instanceof Working && !node.origin && node.kind === 'quote' && node.text === null && node.children.length) return this.#firstLines(node.children[0]!, node).map((l) => `> ${l}`);
    // an item whose text went, a quote its first block now: that quote's, after its marker
    if (node instanceof Working && node.kind === 'item' && node.text === null && node.children[0] instanceof Working && !node.children[0].origin) {
      const marker = node.origin ? this.from.markerOf(node.origin) : this.#madeItem(node, null).marker;
      return this.#firstLines(node.children[0], node).map((l, k) => (k ? ' '.repeat(marker.length + 1) : `${marker} `) + l);
    }
    const origin = this.#under(parent, node);
    const container = origin ? containerIn(origin) : null;
    let lines: string[];
    if (node instanceof Working && node.text !== undefined) lines = this.#ownLines(node, container).slice(0, 2);
    else if (!origin) return [''];
    else lines = this.#readLines(container, origin.startLine, Math.min(origin.startLine + 1, Math.max(origin.startLine, origin.textLastLine)));
    // (an item moved here from another container: at this one's column, as the writer sets it)
    if (this.#movedIn(parent, node, origin)) {
      const dedent = /^ */.exec(lines[0]!)![0].length;
      lines = lines.map((l) => l.slice(Math.min(dedent, /^ */.exec(l)![0].length)));
    }
    return this.#remarked(node, origin, lines);
  }

  /** Whether `node`, a read item with no item beside it, is in `parent` out of another container than the one it was in. */
  #movedIn(parent: Working, node: Child, origin: OurusNode | null): boolean {
    if (node.kind !== 'item' || !origin || !parent.origin) return false;
    // (beside an item, it lines up with that one's list instead)
    const k = parent.children.indexOf(node);
    if (parent.children[k - 1]?.kind === 'item' || parent.children[k + 1]?.kind === 'item') return false;
    const now = parent.origin.kind === 'item' || parent.origin.kind === 'quote' || parent.origin.kind === 'root' ? parent.origin : containerIn(parent.origin);
    return containerIn(origin).persistentNode !== now.persistentNode;
  }

  /** `lines`, the first `node`'s first line as read in its container, with the marker its list gives it now: renumbered, another bullet. */
  #remarked(node: Child, origin: OurusNode | null, lines: string[]): string[] {
    const place = node.kind === 'item' && origin?.kind === 'item' ? this.lists.get(node.id) : undefined;
    if (!place || !origin || (place.type === 'ordered' && place.number === null) || !lines.length) return lines;
    // (its marker past the indentation the line has in the container, tabs and all)
    const at = /^[ \t]*/.exec(lines[0]!)![0].length;
    const old = this.from.markerOf(origin);
    const now = markerOf(place, old);
    if (lines[0]!.slice(at, at + old.length) !== old) return lines;
    return [lines[0]!.slice(0, at) + now + lines[0]!.slice(at + old.length), ...lines.slice(1)];
  }

  /** Lines `a`–`b` of `from` as written in `container`: past its prefix; an empty line a placeholder holds read as typed on. */
  #readLines(container: OurusNode | null, a: number, b: number): string[] {
    const tree = this.from.mdTree;
    const out: string[] = [];
    for (let i = a; i <= b; i++) {
      const line = tree.line(i);
      const held = this.from.marks.hasEmptyNodeAt(line.to);
      // a held space reads as typed on, as the parse reads it
      const cut = this.#cut(line, container);
      // (one before the line's end: a held space's)
      const space = MarkSet.within(this.from.marks.placeholders, cut, line.to)[0];
      let content = this.#lineIn(line, container);
      if (space !== undefined) {
        const at = space - cut + (content.length - (line.to - cut));
        content = content.slice(0, at) + SENTINEL + content.slice(at + 1);
      }
      out.push(content + (held ? SENTINEL : ''));
    }
    return out;
  }

  /** `line` as `container` holds it: past its prefix, a tab the prefix took part of written as the columns left of it. */
  #lineIn(line: MdLine, container: OurusNode | null): string {
    const text = this.from.text;
    const cut = this.#cut(line, container);
    const column = this.#cutColumn(line, container);
    if (text[cut] === '\t' && line.prefix.some((p) => p.partialTab && p.to === cut)) return ' '.repeat(4 - (column % 4)) + text.slice(cut + 1, line.to);
    return text.slice(cut, line.to);
  }

  /** Where `line`'s content in `container` starts: past the container's prefix piece (a lazy line has none: its content). */
  #cut(line: MdLine, container: OurusNode | null): number {
    if (!container || container.kind === 'root') return line.from;
    const piece = line.prefix.find((p) => p.container.block === container.persistentNode.block);
    return piece ? piece.to : line.contentFrom;
  }

  #cutColumn(line: MdLine, container: OurusNode | null): number {
    if (!container || container.kind === 'root') return 0;
    const piece = line.prefix.find((p) => p.container.block === container.persistentNode.block);
    return piece ? piece.toColumn : line.contentColumn;
  }

  /** A text the draft set, its lines as they will be written: an empty line a placeholder holds read as typed on. */
  #written(w: Working): string[] {
    const text = w.text;
    if (!text) return [''];
    const out: string[] = [];
    let at = 0;
    for (const line of text.text.split('\n')) {
      out.push(text.marks.hasEmptyNodeAt(at + line.length) ? line + SENTINEL : line);
      at += line.length + 1;
    }
    return out;
  }

  /** Whether `lower`'s first line, written after `upper` (an item's last lines), starts an item of the list `upper` starts. */
  #nextItem(upper: readonly string[], lower: readonly string[]): boolean {
    const root = MdTree.parse([...upper, ...lower].join('\n'), midText(this.from.mdTree.flavor)).root;
    const list = root.children[0];
    return list?.type === 'list' && list.offsets.some((at) => root.offsets[0]! + at === upper.length);
  }

  /**
   * Whether `lower`, written under `upper` (lines as their container holds them), starts a block of
   * its own and leaves `upper` reading as it does. `emptyItem`: `upper` is an empty item's text, and
   * `lower` its first child, which would be its text if it held text (a list, a quote stay children).
   * `first`: `upper` is the document's first node, read with the front matter only that line opens;
   * else without it (`midText`).
   */
  #apart(upper: readonly string[], lower: readonly string[], emptyItem: boolean, column = 0, first = false): boolean {
    const flavor = first ? this.from.mdTree.flavor : midText(this.from.mdTree.flavor);
    // (lines read from their container's content start: a tab in them spans by the column the line is
    // written at, which reading them from column 0 would move off its stop)
    if (column % 4) [upper, lower] = [upper.map((l) => detab(l, column)), lower.map((l) => detab(l, column))];
    const n = upper.length;
    if (emptyItem) {
      // written as the item writes them, after its marker and at its content column: its first block
      // past its own line a block of blocks (its checkbox alone, `- [ ]`, holds no paragraph in GFM)
      if (lower.every((l) => trimMd(l) === '')) return true;
      const item = MdTree.parse([...upper.map((l, k) => (k ? '  ' : '- ') + l), ...lower.map((l) => (l ? '  ' + l : l))].join('\n'), flavor).root.children[0]?.children[0];
      const k = item ? item.offsets.findIndex((at) => at >= n) : -1;
      // (a footnote's definition is a block of blocks the outline reads as a text, an item's there)
      return k >= 0 && item!.offsets[k] === n && flavor.content(item!.children[k]!.type) === 'blocks' && item!.children[k]!.type !== 'footnote_definition';
    }
    const tree = MdTree.parse([...upper, ...lower].join('\n'), flavor);
    const root = tree.root;
    const blocks = root.children;
    const alone = MdTree.parse(upper.join('\n'), flavor).root;
    const ends = (r: typeof root, i: number): number => r.offsets[i]! + r.children[i]!.lines;
    if (blocks.length <= alone.children.length || alone.children.some((b, i) => blocks[i]!.type !== b.type || ends(root, i) !== ends(alone, i))) return false;
    // past the blank lines `lower` starts with, its first line starts a block, the one it starts alone
    // (not a paragraph where an empty item can't interrupt a definition: `[a]: /u⏎- `)
    let k = n;
    while (k < n + lower.length && trimMd(lower[k - n]!) === '') k++;
    const line = tree.line(Math.min(k, tree.lineCount - 1));
    if (!(line.leaf?.line === k || line.containers.some((c) => c.line === k))) return false;
    const at = root.offsets.indexOf(k);
    const own = MdTree.parse(lower.slice(k - n).join('\n'), flavor).root.children[0];
    return at < 0 || !own || blocks[at]!.type === own.type;
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
    const onItemsLine = (node: OurusNode): boolean => {
      for (let up = node.parent; up && up.kind !== 'root' && up.startLine === node.startLine; up = up.parent) if (up.kind === 'item') return true;
      return false;
    };
    const containerId = (node: OurusNode | null): number | null => {
      let up = node;
      while (up && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root') up = up.parent;
      return up ? up.id : null;
    };
    const inSection = (parent: Working): boolean => {
      let up: Working | null = parent;
      while (up && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root') up = up.parent;
      return !up || up.kind === 'root';
    };
    // (what it is: placed, which may leave its container; or its lines written anew where they are)
    const moving = (parent: Working, c: Child, k: number): 'placed' | 'rewritten' | null => {
      if (!!parent.source && parent.kind !== parent.source.kind) return 'rewritten';
      if (this.asks.placedIds.has(c.id)) return 'placed';
      const origin = this.#under(parent, c);
      // (regrouped into another container, behind a node placed there: as placed)
      if (origin && containerId(origin.parent) !== this.#containerOf(parent)) return 'placed';
      return origin && onItemsLine(origin) && (k > 0 || (parent.kind === 'item' && !!this.io.textOf(parent) && !!parent.origin && !this.from.textOf(parent.origin))) ? 'rewritten' : null;
    };
    const asWritten = (parent: Working, c: Child, k: number): boolean => {
      // (in a copy with its original's children, as that copy is: its nodes are written with it; one
      // the draft took some out of, each lined up again where it is)
      const whole = !!parent.source && parent.children.length === parent.source.children.length && parent.children.every((x, i) => sourceOf(x) === parent.source!.children[i]);
      if (parent.source && parent.source.id !== parent.id && parent.parent && whole) return asWritten(parent.parent, parent, parent.parent.children.indexOf(parent));
      const origin = c instanceof Working ? c.origin : null;
      // (its container as its original's: a copy's for the nodes copied in it)
      let up: Working | null = parent;
      while (up && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root') up = up.parent;
      if (!origin || !up || containerId(origin.parent) !== (up.source?.id ?? up.id)) return false;
      if (c.kind !== 'item') return true;
      // (an item at the column of the item it lines up with, as the writer lines it up: the nearest
      // of its list in the draft that stays, before it past those placed, else after them; with none,
      // where it was)
      for (const step of [-1, 1]) {
        for (let j = k + step; j >= 0 && j < parent.children.length; j += step) {
          const s = parent.children[j]!;
          if (s.kind !== 'item' || this.lists.get((step < 0 ? parent.children[j + 1]! : s).id)?.start) break;
          if (this.asks.placedIds.has(s.id)) continue;
          const at = s instanceof Working ? s.origin : this.#under(parent, s);
          if (!at) break;
          return at.block.attrs.markerColumn === origin.block.attrs.markerColumn;
        }
      }
      return true;
    };
    // (a quote of one paragraph, `quotes: text`, is that paragraph, its lines framed; a callout's title
    // is a paragraph's lines too)
    const needs = (text: OurusText | null, origin: OurusNode | null, leaves: boolean): text is OurusProse => text instanceof OurusProse && (text.type === 'paragraph' || text.type === 'quote' || text.type === 'title') && !!origin && this.#unmovable(origin, leaves);
    // (the read nodes under one, by where they are in `from`: whether one of them is such a paragraph)
    const holds = (origin: OurusNode, leaves: boolean): boolean => origin.children.some((c) => needs(this.from.textOf(c), c, leaves) || holds(c, leaves));
    // (`moved`: in a subtree that moves, whether it leaves its container, its lines written past
    // another prefix; or is placed in it, which the writer may line up with the list it joins)
    const visit = (parent: Working, moved: { leaves: boolean } | null): void => {
      parent.children.forEach((c, k) => {
        // (a copy as its original is written, where it is in its original's container and, an item,
        // after an item of its original's list; lined up elsewhere, as a node moved there)
        const copy = !!c.source && c.source.id !== c.id;
        if (copy && asWritten(parent, c, k)) return;
        const how = moved ? 'rewritten' : copy ? 'placed' : moving(parent, c, k);
        if (!how) return;
        const origin = c instanceof Working ? c.origin : this.#under(parent, c);
        // (a paragraph out of the quote or item it was in, into a section: its lazy lines regular ones
        // there, which may start a block a lazy line couldn't, `|---|` after `| a |` a table)
        const leaves = c.kind === 'paragraph' && (moved ? moved.leaves : !!origin && containerId(origin.parent) !== this.#containerOf(parent) && inSection(parent));
        const text = c instanceof Working && c.text !== undefined ? null : origin ? this.from.textOf(origin) : null;
        if (needs(text, origin, leaves)) {
          const w = this.io.openChild(parent, k);
          this.attached.add(w);
          w.text = text;
        }
        // (opened only on the way to one)
        if (c instanceof Working ? c.children.length > 0 : !!origin && holds(origin, leaves)) {
          const w = this.io.openChild(parent, k);
          this.attached.add(w);
          visit(w, { leaves });
        }
      });
    };
    for (const parent of [...this.attached]) visit(parent, null);
    for (const w of this.attached) this.#escape(w);
  }

  /**
   * `w`'s text with its held spaces settled, which writing it does: each one's space out, or with
   * `heldSpace: repair` those at the text's start kept, its padding to be (`#leadingSpaces` makes them
   * so), the others out.
   */
  #settleHeldSpaces(w: Working): void {
    // (a text not set, as it was, in a subtree the draft moved: its held spaces settled as a set one's,
    // the writer laying it out anew where the mark wouldn't hold, B237; a node it only carries, a
    // parent given a child, keeps its lines and their marks as they are)
    let moved = false;
    for (let n: Working | null = w; n && !moved; n = n.parent) moved = this.asks.placedIds.has(n.id);
    const own = w.text === undefined && w.origin && moved ? this.from.textOf(w.origin) : w.text;
    if (!(own instanceof OurusProse)) return;
    const text = own;
    const held = text.marks.placeholders.filter((pos) => text.marks.hasHeldSpaceAt(pos));
    if (!held.length) return;
    // (`repair`: those in the run of spaces at the text's start, on its first line, kept, where text
    // follows them there: before a line break or the text's end they start nothing, and go, as a
    // split's do under `enterSplitSpace: start`)
    let kept: number[] = [];
    if (this.from.config.heldSpace !== 'trim') {
      const start = text.textStart(0);
      let end = start;
      while (text.text[end] === ' ') end++;
      if (end < text.text.length && text.text[end] !== '\n') kept = held.filter((pos) => pos >= start && pos < end);
    }
    const gone = held.filter((pos) => !kept.includes(pos));
    // (an anchor past one that goes moves back with the text)
    if (gone.length) this.lost.set(w, [...(this.lost.get(w) ?? []), ...gone.map((pos) => ({ at: pos, n: 1 }))]);
    // (their placeholders out; the spaces of those that go out, those kept the text's padding to be)
    let next = text.withMarks({ placeholders: text.marks.placeholders.filter((pos) => !held.includes(pos)) });
    for (const pos of [...gone].reverse()) next = next.splice(pos, pos + 1);
    w.text = next;
  }

  /** `w`'s text without the backslashes of ours (`auto`) it doesn't need wherever it is (`#escape`). */
  #dropOurEscapes(w: Working): void {
    if (!(w.text instanceof OurusProse)) return;
    const flavor = this.from.mdTree.flavor;
    let text = w.text;
    const ours = text.marks.auto.filter((pos) => text.text[pos] === '\\' && !keepsEscape(flavor, text.text[pos + 1], text.text[pos + 2]));
    if (!ours.length) return;
    // (an anchor past one moves back with the text)
    for (const pos of [...ours].reverse()) text = text.splice(pos, pos + 1);
    this.lost.set(w, [...(this.lost.get(w) ?? []), ...ours.map((pos) => ({ at: pos, n: 1 }))]);
    w.text = text;
  }

  /**
   * `w`'s escapes, where the draft set its text: the backslashes of ours (`auto`) taken out, but
   * those the text needs wherever it is (`keepsEscape`: `\\<div>`), then the escapes that keep its
   * lines its text put in, each one of ours (`2\\. draft` joined after `revise `: the text loses its
   * escape; split there again, gains it). A backslash that isn't ours is the author's: a character of
   * the text, never taken out, and an escape where it is markup.
   */
  #escape(w: Working): void {
    this.#dropOurEscapes(w);
    if (!(w.text instanceof OurusProse)) return;
    const flavor = this.from.mdTree.flavor;
    let text = w.text;
    // a paragraph that is a quote's lines, its first starting `[!type]`: a callout's title, which no
    // escape keeps text in every flavor (Obsidian's `\[!note]` none in GFM)
    // (only where the flavor has callouts: elsewhere `[!x]` is a quote's text, B22)
    if (flavor.has('callouts') && text.type === 'quote' && w.kind === 'paragraph' && mdCalloutAt(text.text.split('\n')[0]!.replace(/^ {0,3}>[ \t]?/, ''))) {
      const was = w.origin ? this.from.textOf(w.origin) : null;
      if (!(was instanceof OurusProse && was.type === 'quote' && mdCalloutAt(was.text.split('\n')[0]!.replace(/^ {0,3}>[ \t]?/, '')))) throw new Refused("the quote's first line would read as a callout's title");
    }
    // (below a checkbox alone on its line, in CommonMark, which has no tasks, the paragraph the
    // checkbox starts goes on, as the read asks it: `- [ ] ⏎  2) x`, `2)` interrupting nothing)
    const below = text.frame.find((p) => p.part === 'below');
    const base = below && !this.#goesOnBelowBox(text) ? below.to : 0;
    const lines = text.text.slice(base).split('\n');
    // where each line starts in the text
    const at: number[] = [];
    for (let from = base, k = 0; k < lines.length; from += lines[k]!.length + 1, k++) at.push(from);
    // a line a placeholder holds reads as typed on at its end (a checkbox's too)
    const held = lines.map((l, k) => text.marks.hasEmptyNodeAt(at[k]! + l.length));
    // (a line starting with a tab, past a quote's `>`: it spans as far as from the column the line is written at)
    const column = lines.some((l) => /^ *\t/.test(text.type === 'quote' ? l.replace(/^ {0,3}>[ \t]?/, '') : l)) ? this.#textColumn(w) : null;
    if (column !== null) this.columns.set(w.id, columnIndex(column));
    // (every backslash left in a character of the text: none absorbed)
    const spelled = escapeParagraph(flavor, text.type, text.item, lines, held, column === null ? undefined : lines.map(() => column), false);
    if (!spelled) throw new Refused(`no escape keeps the text of node ${w.id} where it is`);
    let out = text;
    // every escape put in, where it is in the lines with all of them in
    const written: number[] = [];
    for (let from = base, k = 0; k < spelled.lines.length; k++) {
      written.push(from);
      from += spelled.lines[k]!.length + spelled.markup.filter((m) => m.line === k).length + 1;
    }
    for (const e of spelled.escapes) out = this.#putEscape(w, out, written[e.line]! + e.at);
    // a read node's ATX title ending in `#`s after a blank it didn't end in (a join's, a paste's): its
    // text, the first escaped, no closing sequence (a node made, pasted, has the one it was given)
    const close = w.origin && out.heading?.form === 'atx' && !spelled.gained.length ? out.frame.find((p) => p.part === 'close') : undefined;
    if (close) {
      const was = this.from.textOf(w.origin!);
      const wasClose = was instanceof OurusProse && was.heading?.form === 'atx' ? was.frame.find((p) => p.part === 'close') : undefined;
      if (!wasClose || trimMd(was!.text.slice(wasClose.from)) !== trimMd(out.text.slice(close.from))) out = this.#putEscape(w, out, close.from + out.text.slice(close.from).indexOf('#'));
    }
    // an item's text a run of its bullet's character, two of them and blanks (`--`): with the bullet,
    // a rule; its first escaped, text
    // (where the writer escapes it already, a rule alone, `---`, no)
    const escaped = spelled.markup.some((m) => m.line === 0 && m.at === 0);
    const place = w.kind === 'item' && out.type === 'paragraph' && !out.frame.length && !spelled.gained.length && !escaped ? this.lists.get(w.id) : undefined;
    // (an item whose list the draft left as it was: its own marker)
    const bullet = place ? (place.type === 'bullet' ? place.marker : null) : w.kind === 'item' && !escaped && !spelled.gained.length && w.origin?.kind === 'item' ? this.from.markerOf(w.origin) : null;
    if (bullet && /^[-*+]$/.test(bullet) && out.type === 'paragraph' && !out.frame.length && new RegExp(`^\\${bullet}(?:[ \\t]*\\${bullet})+[ \\t]*(?:\\n|$)`).test(out.text)) out = this.#putEscape(w, out, 0);
    w.text = out;
    this.escaped.add(w.id);
  }

  /**
   * `text` (`w`'s) with a backslash of ours put in at `pos`, an anchor at the character there staying
   * with it, past the backslash (`gained`, in the text with the ones before it in).
   */
  #putEscape(w: Working, text: OurusProse, pos: number): OurusProse {
    const gained = (this.gained.get(w) ?? []).map((g) => (g >= pos ? g + 1 : g));
    this.gained.set(w, [...gained, pos].sort((a, b) => a - b));
    return text.splice(pos, pos, new OurusProse(text.type, text.item, MarkSet.of('\\', { auto: [0] })));
  }

  /**
   * The column the later lines of `w`'s text start at, as the writer writes them: where `w` is as it
   * was (same kind, same parent, not placed), where they started; else its container's column, an
   * item's past its marker, a space and its padding.
   */
  #textColumn(w: Working): number {
    const origin = w.origin;
    if (origin && w.source && w.kind === w.source.kind && !this.asks.placedIds.has(w.id) && origin.parent?.id === w.parent?.id) {
      // (as the writer continues it: `continuationAsWas`)
      const prefix = continuationAsWas(this.from.text, origin, this.from.mdTree.line(origin.kind === 'item' ? origin.startLine : origin.textFirstLine));
      // (after a `>` with no space, the writer writes one before a line starting with a blank, a tab's)
      return advanceColumns(prefix, 0, prefix.length, 0) + (prefix.endsWith('>') ? 1 : 0);
    }
    if (w.kind !== 'item') return this.#containerColumn(w.parent);
    const place = this.lists.get(w.id);
    const marker = this.asks.hints.get(w.id) ?? (place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-'));
    // (a read item moved keeps its marker and what follows it to its text)
    const column = this.#markerColumn(w);
    const startsBelow = w.text instanceof OurusProse && w.text.frame.some((p) => p.part === 'below');
    if (!(origin?.kind === 'item' && w.kind === origin.kind) && this.asks.separators.has(w.id) && !startsBelow) {
      const lead = marker + separatorAt(this.asks.separators.get(w.id), column + marker.length)!;
      return advanceColumns(lead, 0, lead.length, column);
    }
    // (a read item's own width, and past it the padding a text's leading spaces became: a held space a
    // deletion left, kept, `heldSpace: repair`, which moves its children with it)
    const width = (origin?.kind === 'item' && w.kind === origin.kind ? origin.block.attrs.contentColumn! - origin.block.attrs.markerColumn! : marker.length + 1) + (this.paddings.get(w.id) ?? 0);
    return column + width;
  }

  /**
   * How far right of where it was read item `w`'s content is written: the padding its text's leading
   * spaces became (`#leadingSpaces`: a held space kept, `heldSpace: repair`), and its parent's, an item
   * read and not moved; 0 for anything else.
   */
  #contentShift(w: Working | null): number {
    if (!w || w.kind !== 'item' || w.origin?.kind !== 'item' || this.asks.placedIds.has(w.id)) return 0;
    return (w.origin.parent?.id === w.parent?.id ? this.#contentShift(w.parent) : 0) + (this.paddings.get(w.id) ?? 0);
  }

  /**
   * The column item `w`'s marker is written at, as the writer places it: where it was, if it is;
   * else lined up with an item of its list beside it that stays; else, in a document indented with
   * tabs, a tab past its parent item's marker; else at its container's column.
   */
  #markerColumn(w: Working): number {
    const origin = w.origin;
    // (where it was, moved right as far as its parent's text moved: a held space kept as its padding)
    if (origin?.kind === 'item' && !this.asks.placedIds.has(w.id) && origin.parent?.id === w.parent?.id) return origin.block.attrs.markerColumn! + this.#contentShift(w.parent);
    const up = this.asks.lineUps.get(w.id);
    if (up) return up.block.attrs.markerColumn!;
    const parent = w.parent;
    if (parent) {
      const k = parent.children.indexOf(w);
      for (const step of [-1, 1]) {
        for (let j = k + step; j >= 0 && j < parent.children.length; j += step) {
          const sibling = parent.children[j]!;
          if (sibling.kind !== 'item' || this.lists.get((step < 0 ? parent.children[j + 1]! : sibling).id)?.start) break;
          if (this.asks.placedIds.has(sibling.id)) continue;
          const at = this.#under(parent, sibling);
          // (one the draft made an item of another node has no marker to line up with)
          if (at && at.kind === 'item' && at.parent?.id === parent.id) return at.block.attrs.markerColumn!;
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
      if (origin && !this.asks.placedIds.has(p.id) && origin.parent?.id === p.parent?.id) {
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
      if (!(text instanceof OurusAtom)) continue;
      // code that started below an item's marker, its first line the marker's, empty: out of the item
      // (outdented, moved), no marker's, so not a line of it
      if (w.kind !== 'item' && text.text.startsWith('\n') && w.origin?.kind === 'item') {
        text = text.splice(0, 1);
        w.text = text;
        this.lost.set(w, [...(this.lost.get(w) ?? []), { at: 0, n: 1 }]);
      }
      // a rule an item's text, of its bullet's character: the two read as one rule (`- ---`)
      if (w.kind === 'item' && text.type === 'thematic_break' && this.lists.get(w.id)?.marker === trimMd(text.text)[0]) throw new Refused("the item's bullet and its rule would read as one rule");
      // code an item's text, on its marker's line: the spaces its fence was indented with would be the
      // item's padding there; they go from every line, as code past its fence's indentation reads
      // any other block an item's text: the blanks its first line had are the item's padding there, no
      // text of it (` [a]: /url` indented)
      if (w.kind === 'item' && text.type !== 'fenced_code' && text.type !== 'indented_code' && /^[ \t]+/.test(text.text)) {
        const n = /^[ \t]+/.exec(text.text)![0].length;
        text = text.splice(0, n);
        w.text = text;
        this.lost.set(w, [...(this.lost.get(w) ?? []), { at: 0, n }]);
      }
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
      if (was instanceof OurusAtom && was.closed && !text.closed) throw new Refused(`the ${nodeName('atom', text.type)} would lose its closing delimiter`);
      // (a line starting with a tab spans from the column it is written at)
      const column = /(?:^|\n) *\t/.test(text.text) ? this.#textColumn(w) : 0;
      // code past a tab its container takes part of (`→ code` in an item): a line whose blanks reach
      // that tab's stop is written with them as the tab again, and read with every tab of its blanks
      // as the spaces it spans; so in its text (a paste's `→- b`)
      if (column % 4 && w.kind !== 'item' && w.origin && this.from.mdTree.line(w.origin.startLine).prefix.some((p) => p.partialTab)) {
        // (each such tab, where it was, the spaces it spans: one character lost, those gained, for
        // the anchors past it)
        const tabs: { at: number; spaces: number }[] = [];
        let from = 0;
        for (const l of text.text.split('\n')) {
          const lead = /^[ \t]*/.exec(l)![0];
          if (lead.includes('\t') && lead.startsWith(' '.repeat(4 - (column % 4)))) {
            let col = column;
            for (let k = 0; k < lead.length; k++) {
              const spaces = lead[k] === '\t' ? 4 - (col % 4) : 1;
              if (lead[k] === '\t') tabs.push({ at: from + k, spaces });
              col += spaces;
            }
          }
          from += l.length + 1;
        }
        for (const { at, spaces } of [...tabs].reverse()) text = text.splice(at, at + 1, ' '.repeat(spaces));
        w.text = text;
        if (tabs.length) {
          this.lost.set(w, [...(this.lost.get(w) ?? []), ...tabs.map(({ at }) => ({ at, n: 1 }))]);
          // (in the text past what it lost, as it grows: a tab's spaces where it was, less the tabs
          // before it, plus their spaces)
          const gained: number[] = [];
          let grown = 0;
          tabs.forEach(({ at, spaces }, i) => {
            for (let k = 0; k < spaces; k++) gained.push(at - i + grown + k);
            grown += spaces;
          });
          this.gained.set(w, gained);
        }
      }
      if (this.from.readsAs(text, column)) continue;
      const open = text.frame.find((p) => p.part === 'open');
      const char = text.type === 'fenced_code' && open ? text.text[open.from]! : null;
      if (!char || !open) throw new Refused(`the lines would end the ${nodeName('atom', text.type)}`);
      const s = text.text;
      const length = open.to - open.from;
      const runs = [...s.slice(s.indexOf('\n', open.to) + 1).matchAll(new RegExp(`^[ \\t]*(${char === '`' ? '`' : '~'}+)`, 'gm'))].map((m) => Math.max(3, m[1]!.length + 1));
      const close = text.frame.find((p) => p.part === 'close');
      const closeEnd = close ? close.from + /^[ \t]*[`~]+/.exec(s.slice(close.from))![0].length : -1;
      const grown = [...new Set(runs)].sort((a, b) => a - b).filter((n) => n > length).map((n) => {
        const more = char.repeat(n - length);
        const closed = close ? text.splice(closeEnd, closeEnd, more) : text;
        return { more: n - length, text: closed.splice(open.to, open.to, more) };
      }).find((g) => this.from.readsAs(g.text, column));
      if (!grown) throw new Refused('the code would close its fence, however long');
      w.text = grown.text;
      // anchors past each run move on, in the text as it grows
      const at: number[] = [];
      for (let k = 0; k < grown.more; k++) at.push(open.to + k);
      if (close) for (let k = 0; k < grown.more; k++) at.push(closeEnd + grown.more + k);
      this.gained.set(w, [...(this.gained.get(w) ?? []), ...at].sort((a, b) => a - b));
    }
  }

  // ---- 5. placeholders

  /**
   * Whether `origin`'s text has a later line the writer can't move as it is (`copyLine`): one that
   * could start a block, not lazy, or lazy where a paragraph `leaves` the container that made it lazy
   * for a section (out of a quote, `| a |⏎|---|` after `q` a table); or lazy past spaces, which may reach the column
   * of a container it lands in, there no longer lazy, its spaces read as that container's (`- [x] ⏎
   * cont` moved to column 0: `cont` the item's, its spaces gone). A lazy one at its line's start, in
   * its container still, is written as it is, continuing the paragraph. A heading's underline is its
   * frame, no block (Done escapes no heading's lines).
   */
  #unmovable(origin: OurusNode, leaves: boolean): boolean {
    const text = this.from.textOf(origin);
    if (!(text instanceof OurusProse) || text.heading) return false;
    const tree = this.from.mdTree;
    for (let i = origin.textFirstLine + 1; i <= origin.textLastLine; i++) {
      const line = tree.line(i);
      const content = this.from.text.slice(line.contentFrom, line.to);
      // (a lazy line's spaces as written, some maybe a container's it still matched)
      if (line.lazy && /^[ \t]/.test(this.from.text.slice(line.from, line.to))) return true;
      if ((!line.lazy || leaves) && /^[ \t]*[-+*>#=|0-9]/.test(content)) return true;
    }
    return false;
  }

  /** Whether the item before child `k` of `parent`, where the draft has it, would take in the item `origin` is, at its old column: the writer lines it up then. */
  #takenIn(parent: Working, k: number, origin: OurusNode): boolean {
    const before = parent.children[k - 1];
    const prev = before ? this.#under(parent, before) : null;
    if (origin.kind !== 'item' || prev?.kind !== 'item' || prev === origin.parent) return false;
    const column = (n: OurusNode): number => {
      const line = this.from.mdTree.line(n.startLine);
      return advanceColumns(this.from.text, line.from, atLine(line, n.persistentNode.block!.attrs.markerStart!), 0);
    };
    return column(origin) >= prev.persistentNode.block!.attrs.contentColumn!;
  }

  /** Whether `origin`'s text has a later line, not lazy, that could start a block: one the writer shifts no further (`copyLine`). */
  #blockLine(origin: OurusNode): boolean {
    const text = this.from.textOf(origin);
    if (!(text instanceof OurusProse) || text.heading) return false;
    const tree = this.from.mdTree;
    for (let i = origin.textFirstLine + 1; i <= origin.textLastLine; i++) {
      const line = tree.line(i);
      if (!line.lazy && /^[ \t]*[-+*>#=|0-9]/.test(this.from.text.slice(line.contentFrom, line.to))) return true;
    }
    return false;
  }

  /**
   * A node now in another container than it was (moved, or regrouped there: a paragraph's list out
   * from under it, `listParent: container`) whose text has a later line that could start a block
   * (`2) y` continuing `x`, a numbered item from 2 interrupting nothing), not lazy or lazy past spaces
   * (which may reach the new container's column), is spelled again where it lands, its escapes the
   * draft's, and so is any such node under it, moved with it: the writer moves no such line as it is.
   */
  #movedLines(): void {
    // (any flavor of list ownership: a moved paragraph's line that could start a block is spelled
    // again, not refused, B167)
    const container = (n: { kind: OurusNodeKind; parent: unknown } | null): unknown => {
      let at: any = n;
      while (at && at.kind !== 'root' && at.kind !== 'item' && at.kind !== 'quote') at = at.parent;
      return at instanceof Working ? (at.source ?? at) : at?.persistentNode;
    };
    const inside = (origin: OurusNode): boolean => this.#unmovable(origin, false) || origin.children.some(inside);
    // child `k` of `parent`, spelled where it is risky, and its descendants (moved with it): each
    // stored node on the way opened
    const spell = (parent: Working, k: number): void => {
      const c = parent.children[k]!;
      const origin = this.#under(parent, c);
      if (!origin || !inside(origin)) return;
      const w = c instanceof Working ? c : this.#openRead(c, origin);
      if (w !== c) {
        parent.children[k] = w;
        w.parent = parent;
        this.attached.add(w);
      }
      if (w.text === undefined && this.#unmovable(origin, false)) w.text = this.from.textOf(origin);
      w.children.forEach((_, j) => spell(w, j));
    };
    for (const parent of [...this.attached]) {
      // (and beside a node the draft placed among them, or after another one than it was: the writer
      // lines it up anew where the one before it would take it in, B167)
      const placed = parent.children.some((c) => this.asks.placedIds.has(c.id));
      parent.children.forEach((c, k) => {
        const origin = this.#under(parent, c);
        if (!origin) return;
        if (container(parent) !== container(origin.parent)) spell(parent, k);
        else if ((placed || parent.children[k - 1]?.id !== origin.prev?.id) && !(c instanceof Working && c.text !== undefined) && this.#takenIn(parent, k, origin) && this.#blockLine(origin)) {
          const w = c instanceof Working ? c : this.#openRead(c, origin);
          if (w !== c) {
            parent.children[k] = w;
            w.parent = parent;
            this.attached.add(w);
          }
          w.text = this.from.textOf(origin);
        }
      });
    }
  }

  /** A moved node with an empty text is written again where it lands: where it is now decides its placeholder (Indent8). */
  #movedEmpty(): void {
    for (const w of this.attached) {
      if (w.text !== undefined || !w.source || !this.asks.placedIds.has(w.id)) continue;
      const text = this.io.textOf(w);
      if (text instanceof OurusProse && text.empty) w.text = text;
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
      if (!(text instanceof OurusProse)) continue;
      const below = text.frame.find((p) => p.part === 'below');
      const base = below ? below.to : 0;
      // (a quote's line with nothing past its `>` is empty too)
      const quoted = text.type === 'quote';
      const blank = (line: string): boolean => trimMd(quoted ? line.replace(/^ {0,3}>[ \t]?/, '') : line) === '';
      // an empty last line (Shift-Enter at the text's end, a paste ending with a line break, a last line
      // emptied): Markdown holds none in a text; it is a blank line after it, the first of the node's
      // gap, an anchor in it on that line
      let cut = text.text.length;
      // (`lastIndexOf` from -1 searches from 0: at a line break first, stop there)
      for (let k = text.text.lastIndexOf('\n', cut - 1); k >= base && blank(text.text.slice(k + 1, cut)); k = k > 0 ? text.text.lastIndexOf('\n', k - 1) : -1) cut = k;
      // (but one empty last line the caret is on, Shift-Enter's or a paste's ending with a line break:
      // a line of the text a placeholder holds, which settling takes out where it's left empty, B23)
      const caret = this.io.caret;
      const caretHere = !!caret && 'ref' in caret && w === this.#caretNode() ? caret.offset : -1;
      // (not after a `^name` ending the line above, which, the line held, would be no block id until it
      // settles: a blank line after it, as before)
      const idAbove = this.from.mdTree.flavor.has('blockIds') && /(?:^|[ \t])\^[A-Za-z0-9-]+[ \t]*$/.test(text.text.slice(0, cut));
      // (only where a blank line would change what is around it: in an item, whose list it would loosen,
      // and in a quote's text; after a paragraph a blank line, as the text editors leave it)
      // (not where blank lines already set its children apart: the list loose there already)
      const structural = (w.kind === 'item' || text.type === 'quote') && !(w.children.length && w.gap > 0);
      let heldTail = structural && cut > base && !text.blockIdLines.length && !idAbove && caretHere === text.text.length && text.text.slice(cut).split('\n').length === 2;
      // (and where some escape keeps the text, the line held: else a blank line, as before)
      if (heldTail) {
        const lines = text.text.slice(base).split('\n');
        heldTail = escapeParagraph(this.from.mdTree.flavor, text.type, text.item, lines, lines.map((_, k) => k === lines.length - 1)) !== null;
      }
      if (heldTail) cut = text.text.length;
      if (cut < text.text.length && cut > base && text.blockIdLines.length) {
        const [first, ...rest] = text.blockIdLines;
        this.carriedTails.set(w, cut);
        w.text = text = text.slice(0, cut).withBlockIdLines([{ ...first!, blankLines: first!.blankLines + text.text.slice(cut).split('\n').length - 1 }, ...rest]);
      } else if (cut < text.text.length && cut > base) {
        w.gap += text.text.slice(cut).split('\n').length - 1;
        this.blankTails.set(w, cut);
        w.text = text = text.slice(0, cut).withBlockIdLines(text.blockIdLines);
      }
      // a text that starts below its marker now (its first line emptied): what its next line starts
      // with is padding there, not text (but past a checkbox in CommonMark: `#goesOnBelowBox`)
      if (below && !this.#goesOnBelowBox(text) && /^[ \t]+/.test(text.text.slice(base))) w.text = text = text.splice(base, base + /^[ \t]+/.exec(text.text.slice(base))![0].length);
      const s = text.text;
      const lines = s.split('\n');
      // any other empty line has no Markdown in a text, and a text below its marker with nothing left
      if (s.slice(base).split('\n').some((l, k, all) => (all.length > 1 || !!below) && blank(l) && !(heldTail && k === all.length - 1))) throw new Refused('an empty line inside a text');
      const task = text.frame.find((p) => p.part === 'task');
      const boxOnly = !!task && task.from === 0 && task.to === lines[0]!.length;
      // an empty item alone reads as one, but right under its parent's text, which `-` would underline:
      // there a placeholder holds it at the caret, and away from it a blank line above
      const parentText = w.parent && w.parent.kind !== 'root' ? this.io.textOf(w.parent) : null;
      const underText = parentText instanceof OurusProse && parentText.type === 'paragraph' && !parentText.empty && w.parent!.children[0] === w && w.parent!.gap === 0;
      const atCaret = w === this.#caretNode();
      if (w.kind === 'item' && s === '' && underText && !atCaret) {
        w.parent!.gap = 1;
        this.gap(w.parent!.id).auto = true;
      }
      // and an empty item, or a checkbox alone, whose children follow a blank line: `-` and one blank line end an item
      // (a checkbox with no blank after it, `- [x]`, is the item's text still, which a blank line ends no item after: B107)
      const apartChildren = w.kind === 'item' && w.children.length > 0 && w.gap > 0 && (s === '' || (lines.length === 1 && boxOnly && /[ \t]$/.test(lines[0]!)));
      // (a quote emptied, `> `, is an empty quote to Markdown, no paragraph: held as an empty paragraph is)
      const emptyQuote = quoted && lines.length === 1 && blank(s);
      const held = (s === '' && (w.kind !== 'item' || (underText && atCaret))) || emptyQuote || apartChildren || heldTail;
      w.text = text.withMarks({ placeholders: held ? [s.length] : [] });
    }
  }

  /** The working copy the caret is in, if the draft touched it. */
  #caretNode(): Working | undefined {
    const spec = this.io.caret;
    if (!spec || !('ref' in spec)) return undefined;
    return typeof spec.ref === 'number' ? this.io.byId.get(spec.ref) : this.io.current.get(spec.ref.persistentNode);
  }

  /**
   * Whether `text`'s lines below a checkbox alone on its line go on the paragraph the checkbox starts:
   * where the flavor reads no task there (`- [ ] ⏎  2) x` in CommonMark, which has none: `2)`
   * interrupting nothing, the line's spaces text; `- [a]⏎   a` in GFM, whose statuses are ` `, `x` and
   * `X`; a checkbox with no whitespace after it, in every flavor), not where it does, an empty task's
   * text below it a paragraph of its own.
   */
  #goesOnBelowBox(text: OurusProse): boolean {
    const below = text.frame.find((p) => p.part === 'below');
    const box = text.frame.find((p) => p.part === 'task');
    if (!below || below.to - below.from !== 1 || !box) return false;
    const item = MdTree.parse(`- ${text.text.slice(box.from, box.to)}\n`, this.from.mdTree.flavor).root.children[0]?.children[0];
    return !item?.attrs.task;
  }

  /**
   * The spaces a text the draft set starts with (an item's, a paragraph's: a split's second half that
   * kept them, `enterSplitSpace: start`): Markdown reads them as its first line's padding, not text, so
   * they leave the text for its node's padding, three at most (four would make it code: the rest go).
   * A quoted text's, past its first `> `, go: the quote's paragraph's padding, which the writer has no
   * place for (a plain paste of indented lines into a quote). A setext title's too, its first line's
   * (below a checkbox emptied: four columns there would make it code).
   */
  #leadingSpaces(): void {
    for (const w of this.attached) {
      const text = w.text;
      // (a setext title whose first line is a checkbox alone, a blank after it, and goes on past it, in
      // a flavor with tasks: an empty task there, its next line no title's, Markdown can't say it; a
      // checkbox alone is a title, `- [a]⏎  ===`, and with nothing after it no task, `- [x]⏎  a⏎  -`)
      if (text instanceof OurusProse && text.type === 'heading' && w.kind === 'item' && this.from.config.flavor !== 'commonmark' && /^\[[^\n]\][ \t]+\n[^\n]*\n/.test(text.text)) throw new Refused("a setext title can't start with a task's checkbox alone on its line");
      if (!(text instanceof OurusProse) || (text.type !== 'paragraph' && text.type !== 'quote' && text.type !== 'heading') || (w.kind !== 'item' && w.kind !== 'paragraph')) continue;
      // (past the line breaks an item's text starts with below its marker: its first line of text's;
      // but below a checkbox, in CommonMark, the paragraph started at the checkbox: its next line's
      // spaces are text)
      if (this.#goesOnBelowBox(text)) continue;
      // (a quote an item's text: the spaces before its first `>` would be the item's padding, which its
      // later lines' `>`s, short of it, would leave)
      const indent = w.kind === 'item' && text.type === 'quote' ? /^ +(?=>)/.exec(text.text)?.[0].length ?? 0 : 0;
      if (indent) {
        w.text = text.splice(0, indent);
        this.leading.set(w, { at: 0, n: indent });
        continue;
      }
      const at = text.textStart(0);
      let end = at;
      while (text.text[end] === ' ') end++;
      if (end === at || end === text.text.length || text.text[end] === '\n') continue;
      w.text = text.splice(at, end);
      this.leading.set(w, { at, n: end - at });
      if (text.type !== 'quote') this.paddings.set(w.id, Math.min(3, end - at));
    }
  }

  // ---- 6. anchors

  #anchor(spec: AnchorSpec | null): Anchor | null {
    if (!spec) return null;
    if ('blank' in spec) {
      const w = typeof spec.blank === 'number' ? this.io.byId.get(spec.blank) : this.io.current.get(spec.blank.persistentNode);
      // (a node the draft didn't change: its blank lines as they are, where the position was)
      if ((!w || !this.attached.has(w)) && spec.old !== undefined) return { old: docPos(spec.old), assoc: 1 };
      if (!w || !this.attached.has(w)) throw new Error("an anchor on a blank line of a node the draft didn't change");
      return { blank: w as unknown as PersistentNode, line: spec.line };
    }
    const assoc = spec.assoc ?? 1;
    if ('old' in spec) {
      const otherwise = spec.otherwise && this.#anchor(spec.otherwise);
      const old = docPos(spec.old);
      return otherwise ? { old, assoc, otherwise } : { old, assoc };
    }
    const ref = spec.ref;
    let w: Working | undefined;
    if (typeof ref === 'number') w = this.io.byId.get(ref) ?? (ref === Lineage.ROOT ? (this.io.root ?? undefined) : undefined);
    else w = this.io.current.get(ref.persistentNode);
    if (!w) {
      if (typeof ref === 'number') throw new Error(`an anchor in node ${ref}, which the draft didn't touch`);
      // a node the draft didn't touch: where it is, in lines copied as they are
      // in the subtree of the nearest ancestor the draft touched: removed with it, or where it went
      for (let up: OurusNode | null = ref.parent; up; up = up.parent) {
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
    if (tail !== undefined && spec.offset > tail) return { blank: w as unknown as PersistentNode, line: 0 };
    const carried = this.carriedTails.get(w);
    if (carried !== undefined && spec.offset > carried) return { blank: w as unknown as PersistentNode, line: 0, carried: true };
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
    const fixed = localOffset(offset);
    return before ? { node: w as unknown as PersistentNode, offset: fixed, assoc, before } : { node: w as unknown as PersistentNode, offset: fixed, assoc };
  }

  // ---- freezing

  readonly #frozen = new Map<Working, PersistentNode>();

  #freeze(w: Working, origins: Map<PersistentNode, OurusNode>): PersistentNode {
    const children = w.children.map((c) => {
      if (c instanceof Working) return this.#freeze(c, origins);
      const origin = this.#under(w, c);
      if (origin) origins.set(c, origin);
      return c;
    });
    const s = w.source;
    // (a root whose leading blank lines change is the writer's to write, its children copied)
    const unchanged = s && w.text === undefined && w.kind === s.kind && w.gap === s.gap && this.gaps.get(w.id)?.lines === undefined && w.id === s.id && children.length === s.children.length && children.every((c, i) => c === s.children[i]) && !(w === this.io.root && this.preamble !== null);
    const node = unchanged ? s : PersistentNode.drafted(w.id, w.kind, s, w.text, w.gap, children);
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
function containerIn(node: OurusNode): OurusNode {
  let up = node.parent ?? node;
  while (up.parent && up.kind !== 'item' && up.kind !== 'quote') up = up.parent;
  return up;
}

/** The read node a child of the draft was, or null for one it made. */
function sourceOf(c: Child): PersistentNode | null {
  return c instanceof Working ? c.source : c;
}

/** The lines of `from` holding `node`'s own gap, after its text: `[from, to)`. */
function ownGapLines(node: OurusNode): readonly [number, number] {
  const p = node.persistentNode;
  const end = node.startLine + (p.children.length ? p.offsets[0]! : p.lines);
  return [node.ownLastLine + 1, end];
}

/** Whether `node` is `ancestor` or below it, in `from`. */
function isDescendant(node: OurusNode, ancestor: OurusNode): boolean {
  for (let up: OurusNode | null = node; up; up = up.parent) if (up.persistentNode === ancestor.persistentNode) return true;
  return false;
}

/** A marker's list form, as two lists side by side compare (`ordered .`, `bullet -`). */
function formKey(marker: string): string {
  const ordered = /^\d{1,9}([.)])$/.exec(marker);
  return ordered ? `ordered ${ordered[1]}` : `bullet ${marker}`;
}

/** Whether `text` is a block of lines its delimiter opened and none closed: what follows it is its. */
function unclosed(text: OurusText | null): boolean {
  return text instanceof OurusAtom && !text.closed && text.frame.some((p) => p.part === 'open');
}

/** Whether `node`'s own text has a lazy line, past its first. */
function lazyLines(doc: OurusDoc, node: OurusNode): boolean {
  for (let i = node.textFirstLine + 1; i <= node.textLastLine; i++) if (doc.mdTree.line(i).lazy) return true;
  return false;
}

/**
 * `flavor` without front matter, for lines read alone that are no document's first: a `---` there is
 * a rule, which front matter, the first line's alone, never takes in.
 */
const midText = (flavor: MdFlavor): MdFlavor => MdFlavor.without(flavor, 'frontmatter');

/** Whether `lines` read alone as one paragraph, every line of it. */
function onePara(lines: readonly string[], flavor: MdTree['flavor']): boolean {
  const root = MdTree.parse(lines.join('\n'), midText(flavor)).root;
  return root.children.length === 1 && root.children[0]!.type === 'paragraph' && root.children[0]!.lines === lines.length;
}

/** `line`, written from `column`, its tabs as the spaces they span there. */
function detab(line: string, column: number): string {
  let out = '';
  let col = column;
  for (const c of line) {
    const n = c === '\t' ? 4 - (col % 4) : 1;
    out += c === '\t' ? ' '.repeat(n) : c;
    col += n;
  }
  return out;
}
