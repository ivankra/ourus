// The writer: a draft `done()` fixed, spelled as changes to its document's text;
// `OurusDraft.write()` is its entry point. It decides nothing the check (`check.ts`) compares, and
// shares no code with it.
//
// It copies what the draft didn't touch, byte for byte; a subtree moved to another container (or next
// to items at another column) as its lines past the old container's prefix, after the new one's,
// shifted to line up with its new siblings; writes the gaps `done()` fixed; spells each text the
// draft set whole, in its place, with the escapes `done()` gave; and renumbers items whose markers
// keep their width. A layout it has no rule for is a bug to fix (`WriteFailure`): `done()` refuses
// the edit as `write-failed`, as it does a text that doesn't read back as the draft.

import type { MdLine, MdTree } from '../parser/index.ts';
import { ProseText, AtomText, type OutlineNode, type OutlineNodeText, type OutlineNodePersistent, type OurusDoc } from '../doc/index.ts';
import type { Anchor, OurusDraft, Refusal } from './draft.ts';
import { advanceColumns, diffLines, mapPos, emptyNodeAt, heldSpaceAt, isHeldSpacePlaceholder, isPlaceholder, dominantEnding, trimMd, type ChangeSpec, type Mark } from '../text/index.ts';

/** The draft written: the changes to its document, and what the document after them is told. */
export interface WriterOutput {
  /** The changes to the draft's document, in its offsets. */
  readonly changes: readonly ChangeSpec[];
  /** The id of each node it wrote, by where it starts in the new text. */
  readonly identity: ReadonlyMap<number, number>;
  /** The new text's placeholders, every one. */
  readonly marks: readonly Mark[];
  readonly selection: { readonly anchor: number; readonly head: number };
}

/** A layout the writer has no rule for: a bug, which `write` reports as a refusal. */
class WriteFailure extends Error {}

/**
 * Where nodes are written: a container of the document (the root, an item, a quote), or an item the
 * draft made, its text at `column`, in `outer`: what its lines start with is `prefix`.
 */
type Container = OutlineNode | { readonly outer: OutlineNode; readonly column: number; readonly prefix: string; readonly markerColumn?: number };

/** `draft`, in normal form, as changes to its document; refused as `write-failed` where the writer has no rule for its layout. */
export function write(draft: OurusDraft): WriterOutput | Refusal {
  try {
    return new Writer(draft).write();
  } catch (e) {
    if (e instanceof WriteFailure) return { reason: 'write-failed', detail: `the writer can't write ${e.message}` };
    throw e;
  }
}

/**
 * A subtree written in another place than it was: its old lines `[from, to)` past `column` (the old
 * container's prefix) go after `prefix`, the indentation after it `delta` columns wider (narrower
 * where negative).
 */
interface Shift {
  readonly origin: OutlineNode;
  readonly from: number;
  readonly to: number;
  /** Where the blank lines after the subtree start: they are written after `trailing`, where what follows it is. */
  readonly trailingFrom: number;
  readonly trailing: string;
  readonly column: number;
  readonly prefix: string;
  readonly delta: number;
  /** The document is indented with tabs: lines without quotes are re-indented by columns, with tabs. */
  readonly tabs: boolean;
  /** A copy written beside its original, its lazy lines as the original's (`draft.copy`). */
  readonly copy?: boolean;
}

/** A piece of the new text: old text copied, or new. */
type Piece = { readonly old: readonly [number, number]; readonly at: number } | { readonly text: string; readonly at: number };

/** Where a text the writer spelled is in the new text, line by line. */
interface Spelled {
  /** Each of its lines' first text character's position in the new text. */
  readonly starts: readonly number[];
  /** Each line's offset in the text's string. */
  readonly offsets: readonly number[];
  /** Each line's markup escapes, by offset in the string. */
  readonly escapes: readonly (readonly number[])[];
}

class Writer {
  readonly draft: OurusDraft;
  readonly from: OurusDoc;
  readonly tree: MdTree;
  readonly old: string;
  readonly eol: string;
  readonly pieces: Piece[] = [];
  length = 0;
  /** The output ends inside a line: what comes next starts with a line ending. */
  open = false;
  /** The line ending of the old line written last: a new line takes it (a split's second half, the broken line's). */
  ending: string;
  readonly identity = new Map<number, number>();
  readonly marks: Mark[] = [];
  readonly spelled = new Map<OutlineNodePersistent, Spelled>();
  /** Where each blank line of a node's gap the writer wrote anew starts, for anchors on them (`{ blank }`). */
  readonly blankStarts = new Map<OutlineNodePersistent, number[]>();
  /** The prefix each text it spelled continues on: a line in it starts with that. */
  readonly continuations = new Map<OutlineNodePersistent, string>();
  /** The pieces written for copies (`draft.copy`), `[from, to)`: their old text is there twice, and positions in a copy map through these. */
  readonly copyPieces: [number, number][] = [];
  /** Read nodes with children, copied as they were: where they are written. */
  readonly copied: { readonly origin: OutlineNode; readonly from: number; readonly to: number }[] = [];
  /** The subtrees being written in another place, outermost first: one moved into one that moved too is inside it. */
  readonly shifts: Shift[] = [];
  /** How far each moved item was re-indented, for the items moved with it. */
  readonly movedDelta = new Map<OutlineNodePersistent, number>();
  /**
   * Text written over the start of the line written after it, as wide as what it replaces: an item's
   * marker line (`- `, `- > `), its first block another now, over that block's indentation (`  `, `  > `).
   */
  readonly leads: { readonly at: number; readonly text: string }[] = [];
  /** Where each old blank line written under a shift ends its prefix in the new text, for an anchor on it. */
  readonly blankAt = new Map<number, number>();
  /** Old blank lines written under a shift at their node's text column, the caret on them: by old line. */
  readonly heldBlank = new Map<number, { readonly node: OutlineNodePersistent; readonly line: number; readonly prefix: string }>();
  /** Where the blank lines last written anew end: at the text's end, they keep their line ending. */
  blankEnd = -1;
  /** Old lines `[from, to)` an item's marker of another width runs over: past `column`, `d` columns more. */
  readonly widened: { readonly from: number; readonly to: number; readonly column: number; readonly d: number }[] = [];
  /** Where each old line written under a shift starts in the new text. */
  readonly shiftedStarts = new Map<number, number>();
  /**
   * A block first in its item now, on the item's marker line, by how many columns its line was
   * indented past the item's content column: written that much further left, to start where the
   * item's content does (a marker line `- ` and two more spaces would move the item's content column).
   */
  readonly lifted = new Map<OutlineNodePersistent, number>();
  /** Code spelled past a tab its container took part of, written with that tab: where it starts, at the tab. */
  readonly splitHeads = new Map<OutlineNodePersistent, number>();

  constructor(draft: OurusDraft) {
    this.draft = draft;
    this.from = draft.from;
    this.tree = draft.from.mdTree;
    this.old = draft.from.text;
    this.eol = dominantEnding(this.old);
    this.ending = this.eol;
  }

  write(): WriterOutput {
    const root = this.draft.root;
    const from = this.from;
    if (root === from.root) {
      this.written = this.old;
      return this.result([]);
    }
    const source = from.root;
    // the blank lines above the first node (in a document with none, they precede nothing: they go)
    if (this.draft.preamble !== null) for (let k = 0; k < this.draft.preamble; k++) this.line('');
    else if (source.children.length) this.copyLines(0, source.offsets[0]!);
    this.children(root, from.rootNode, from.rootNode);
    this.finish();
    for (const lead of this.leads) this.writeOver(lead.at, lead.text);
    const text = this.pieces.map((p) => ('text' in p ? p.text : this.old.slice(p.old[0], p.old[1]))).join('');
    this.written = text;
    return this.result(this.changes(text));
  }

  /** The new text, once written. */
  written = '';

  /** `pos`, `before` columns back, over the spaces written before it there (a text's padding). */
  back(pos: number, before: number | undefined): number {
    let at = pos;
    while (before && at > pos - before && this.written[at - 1] === ' ') at--;
    return at;
  }

  // ---------------------------------------------------------------- nodes

  /**
   * `parent`'s children; `container` its nearest container (root, item, quote), where they must stay;
   * `trailing`, the container the blank lines after `parent`'s subtree are in (where what follows it is).
   */
  children(parent: OutlineNodePersistent, container: Container, trailing: Container): void {
    const n = parent.children.length;
    const reordered = this.reordered(parent);
    for (let i = 0; i < n; i++) {
      const child = parent.children[i]!;
      const at = this.draft.originOf(child);
      this.checkList(parent, i);
      // (an item's marker widening its subtree's lines, while that subtree is written)
      const widened = this.widened.length;
      try {
        this.child(parent, i, child, at, container, trailing, n, reordered);
      } finally {
        this.widened.length = widened;
      }
    }
  }

  /** Child `i` of `parent` (at `at` in `from`), written: `children`'s, for one. */
  child(parent: OutlineNodePersistent, i: number, child: OutlineNodePersistent, at: OutlineNode | null, container: Container, trailing: Container, n: number, reordered: Set<number>): void {
    // the blank lines after a subtree are where the node after it is: in this container, but after the last child
    const after = i < n - 1 ? container : trailing;
    // made, or of another kind (an item unwrapped into a paragraph, a paragraph into an item): written
    // whole where it is, as a new node is, its text its own
    if (!at || (child.source && child.kind !== child.source.kind)) {
      const inside = this.created(child, parent, i, container, child.children.length ? container : after, at);
      this.children(child, inside ?? container, after);
      return;
    }
    // a copy in its original's container, as the original is: its lines as they are written
    // (an item after an item of another column would nest, or leave it: lined up instead)
    const prev = i > 0 && child.kind === 'item' && parent.children[i - 1]!.kind === 'item' ? this.draft.originOf(parent.children[i - 1]!) : null;
    const asIs = isCopy(child) && holds(container, at) && copiedAsIs(child, at) && !onContainersLine(at) && (!prev || this.markerColumn(prev) === this.markerColumn(at));
    const shift = asIs ? null : this.shiftFor(child, parent, i, at, container, after);
    if (shift) {
      this.moved(child, at, shift, child.children.length ? (child.kind === 'item' || child.kind === 'quote' ? at : container) : after, after);
      return;
    }
    if (child.read || asIs) {
      // named by where it starts: the changes around it may let another node's first line carry to it
      this.ensureLineStart();
      const first = this.pieces.length;
      this.identity.set(this.headStart(child, at, this.length), child.id);
      const start = this.length;
      // the blank lines after it, as written where what follows it now is (in a quote, `>`)
      const end = at.startLine + at.persistentNode.lines;
      const blanks = lastGap(at);
      if (blanks > 0 && !this.blankIn([end - blanks, end], after)) {
        this.copyNode(child, at, end - blanks);
        for (let k = 0; k < blanks; k++) this.line(this.blankPrefix(after));
      } else this.copyNode(child, at, end);
      // moved past a sibling, or into another parent: read again where it lands, its descendants are named
      // too (two equal siblings exchanged write no change, and only the names say so)
      if (asIs) {
        // its old text is there twice: positions in it map through its own pieces
        this.copyPieces.push([first, this.pieces.length]);
        this.nameCopies(child, at, [[first, this.pieces.length]]);
      } else if (child.children.length && (this.shifts.length || this.widened.length || this.leads.length || reordered.has(i) || this.draft.placedIds.has(child.id))) this.nameDescendants(at);
      else if (child.children.length) this.copied.push({ origin: at, from: start, to: this.length });
      return;
    }
    this.drafted(child, at, child.children.length ? (child.kind === 'item' || child.kind === 'quote' ? at : container) : after);
    this.children(child, child.kind === 'item' || child.kind === 'quote' ? at : container, after);
  }

  /**
   * How `child` (at `at` in `from`) is written in `container` where it isn't where it was: in another
   * container, or an item moved next to items at another column; null where it is copied as it was.
   */
  shiftFor(child: OutlineNodePersistent, parent: OutlineNodePersistent, i: number, at: OutlineNode, container: Container, after: Container): Shift | null {
    // (a copy is written where its original isn't)
    // (on an item's marker line, `- - a`, but no longer its first block: its line is written anew)
    // (or first still, its item with a text of its own now on that line: Quote75)
    const moved = !holds(container, at) || isCopy(child) || (onItemsLine(at) && (i > 0 || (parent.kind === 'item' && !!parent.text && !this.from.textOf(this.draft.originOf(parent)!))));
    // an item of a list where it was, after an item the draft put before it at another column: lined up with it
    const realign = moved ? 0 : this.realign(parent, i, at, container);
    const lift = moved ? 0 : (this.lifted.get(child) ?? 0);
    if (!moved && !realign && !lift && !(child.kind === 'item' && this.draft.placedIds.has(child.id))) return null;
    // indentation spelled by the unit (`indentUnit`): with tabs where it is `tab`, else with spaces
    const tabs = indentUnitOf(this.from) === 'tab';
    if (lift && !(child.kind === 'item' && this.draft.placedIds.has(child.id))) {
      // (the items of its list after it lined up with it: `realign`)
      if (child.kind === 'item') this.movedDelta.set(child, -lift);
      const to = at.startLine + at.persistentNode.lines;
      return { origin: at, from: at.startLine, to, trailingFrom: to - lastGap(at), trailing: this.blankPrefix(child.children.length ? container : after), column: this.columnIn(this.tree.line(at.startLine), containerOf(at)), prefix: this.inside(container), delta: -lift, tabs };
    }
    const oldContainer = containerOf(at);
    const line = this.tree.line(at.startLine);
    const column = this.columnIn(line, oldContainer);
    // an item lines up with an item of its list beside it, else sits at its container's column
    let delta = 0;
    if (child.kind === 'item') {
      const indent = (origin: OutlineNode): number => {
        const l = this.tree.line(origin.startLine);
        return columns(this.old.slice(l.from, l.from + origin.persistentNode.block!.attrs.markerStart!)) - this.columnIn(l, containerOf(origin));
      };
      // the nearest item of its list that stays, before it past the items moved with it, else after
      // them; with none, where it was in its container
      let target: number | null = null;
      search: for (const step of [-1, 1]) {
        for (let k = i + step; k >= 0 && k < parent.children.length; k += step) {
          const sibling = parent.children[k]!;
          if (sibling.kind !== 'item') break;
          if (this.draft.lists.get((step < 0 ? parent.children[k + 1]! : sibling).id)?.start) break;
          if (this.draft.placedIds.has(sibling.id)) continue;
          const other = this.draft.originOf(sibling);
          if (other && holds(container, other)) {
            // (lined up by columns: in a list indented with tabs, under a unit of spaces, at its column in spaces)
            target = indent(other);
            break search;
          }
          break;
        }
      }
      // with none: as the item moved with it before it is, lined up with it in its list (where that one
      // was written: it was at another column, maybe), else at its container's column where it moved
      // to another container, else where it was
      const before = parent.children[i - 1];
      const beforeMoved = before?.kind === 'item' && this.draft.placedIds.has(before.id) ? this.movedDelta.get(before) : undefined;
      const beforeAt = beforeMoved !== undefined && !this.draft.lists.get(child.id)?.start ? this.writtenColumn(before!.id, container) : null;
      // (a list of its own after it: as far as that one moved, never past its container's column)
      const withBefore = beforeAt !== null ? beforeAt - indent(at) : beforeMoved !== undefined ? Math.max(beforeMoved, -indent(at)) : undefined;
      // (at none, where the unit isn't the content column: as the unit has it past its new parent's marker)
      // (not first in an item with no text: its line is that item's marker's, at its content column)
      const onMarkersLine = i === 0 && parent.kind === 'item' && !this.draft.textOf(parent, this.draft.originOf(parent));
      const tab = target === null && withBefore === undefined && moved && !onMarkersLine ? this.unitChild(container) : null;
      // (a list of its own after an item, where it was, unless that item would take it in there: copied
      // beside its original, as its original is; placed in its container, where at its container's
      // column it, or the items placed with it, would take in the item after them that stays, which
      // would have to move, and what follows it with it)
      let after = i + 1;
      while (parent.children[after]?.kind === 'item' && this.draft.placedIds.has(parent.children[after]!.id)) after++;
      const stays = parent.children[after]?.kind === 'item' ? this.draft.originOf(parent.children[after]!) : null;
      const pushes = stays?.kind === 'item' && holds(container, stays) && indent(stays) >= this.markerWidth(child);
      const keeps = ((!moved && this.draft.placedIds.has(child.id) && pushes) || (isCopy(child) && holds(container, at))) && this.draft.lists.get(child.id)?.start && before?.kind === 'item' && !this.takesIn(before, indent(at), container);
      delta = realign || (target !== null ? target - indent(at) : withBefore !== undefined ? withBefore : tab !== null ? columns(tab) - (this.markerColumn(at) - column + columns(this.inside(container))) : keeps ? 0 : moved || (this.draft.lists.get(child.id)?.start && parent.children[i - 1]?.kind === 'item') ? -indent(at) : -lift);
      // never where the item written before it would take it in, past its marker (`* x` written at 0,
      // `- b` lined up with its list's `  - x`: `* x`'s child): at that one's column, the items of its
      // list after it lined up with it (`realign`)
      const beforeColumn = before?.kind === 'item' ? this.writtenColumn(before.id, container) : null;
      // (where it was, is it that one's child?)
      const takenIn = beforeColumn !== null && indent(at) >= beforeColumn + this.markerWidth(before!);
      if ((moved || this.draft.placedIds.has(child.id)) && beforeColumn !== null && indent(at) + delta >= beforeColumn + this.markerWidth(before!)) delta = beforeColumn - indent(at);
      // (in its container still, and not that one's child where it was: not lined up where the shift
      // would move a paragraph's line that could start a block, which a copy is written with, or, to
      // the left, take in the indented block after it)
      else if ((moved || this.draft.placedIds.has(child.id)) && holds(container, at) && delta !== 0 && !takenIn && (this.startsBlocks(at) || (delta < 0 && this.indentedAfter(parent, i)))) delta = 0;
      // where it, or the items moved in with it, would take in the item after them that stays (of another
      // list: `- [x] x` outdented before `  1. `), at that one's column instead, where the one before it doesn't take it in: lining that one
      // up with it would shift it, and what follows it with it (the code after `  1. `, its child then)
      // (one moved into its container: past the items moved in with it, the first that stays)
      const movedIn = (c: OutlineNodePersistent | undefined): boolean => {
        const o = c?.kind === 'item' ? this.draft.originOf(c) : null;
        return !!o && !this.draft.placedIds.has(c!.id) && !holds(container, o);
      };
      let k = i + 1;
      if (moved && !this.draft.placedIds.has(child.id)) while (movedIn(parent.children[k])) k++;
      const next = parent.children[k];
      const nextAt = next?.kind === 'item' && !this.draft.placedIds.has(next.id) ? this.draft.originOf(next) : null;
      if ((moved || this.draft.placedIds.has(child.id)) && nextAt?.kind === 'item' && holds(container, nextAt)) {
        const nextColumn = indent(nextAt);
        const column = indent(at) + delta;
        if (nextColumn > column && nextColumn >= column + this.markerWidth(child) && (beforeColumn === null || nextColumn < beforeColumn + this.markerWidth(before!))) delta = nextColumn - indent(at);
      }
      // (never four past its container's content column, which would make it code: an item there moved
      // by what it lines up with, its container narrower now, at three past it)
      if ((moved || this.draft.placedIds.has(child.id)) && indent(at) + delta > 3) delta = 3 - indent(at);
      this.movedDelta.set(child, delta);
    } else if (!moved) return null;
    if (!moved && delta === 0) return null;
    // the subtree's lines, its blank lines included, after the container's prefix as a new line there
    // has it; the blank lines after it, after the prefix of where what follows it is
    const to = at.startLine + at.persistentNode.lines;
    return { origin: at, from: at.startLine, to, trailingFrom: to - lastGap(at), trailing: this.blankPrefix(child.children.length ? container : after), column, prefix: this.inside(container), delta, tabs, copy: isCopy(child) && holds(container, at) };
  }

  /**
   * How far item `i` of `parent` (at `at`, where it was) is from the column the item before it in its
   * list was written at: where the draft put that one there; where the writer shifted it (its parent
   * made a paragraph), only if this one, as it is, would be its child. 0 where it lines up, or nothing moved.
   */
  realign(parent: OutlineNodePersistent, i: number, at: OutlineNode, container: Container): number {
    const child = parent.children[i]!;
    const prev = parent.children[i - 1];
    if (child.kind !== 'item' || prev?.kind !== 'item') return 0;
    // (columns from where the container's content starts on each line: a quote's `>` takes the space
    // after it on some lines, not others)
    const column = this.markerColumn(at) - this.columnIn(this.tree.line(at.startLine), containerOf(at));
    const placed = this.draft.placedIds.has(prev.id);
    if (this.draft.lists.get(child.id)?.start) {
      // a list of its own: where the item before it moved, at its column if it would take it in
      if (!placed && !this.movedDelta.has(prev)) return 0;
      const written = this.writtenColumn(prev.id, container);
      return written !== null && column >= written + this.markerWidth(prev) ? written - column : 0;
    }
    if (!placed && !this.movedDelta.has(prev)) {
      // two lists that are one now, both where they were: the later one's items lined up with the earlier's
      const was = this.draft.originOf(prev);
      const written = this.writtenColumn(prev.id, container);
      if (was?.kind !== 'item' || !this.draft.lists.has(child.id) || written === null || this.draft.placedIds.has(child.id) || this.listStart(was) === this.listStart(at)) return 0;
      // (not where the shift would move a paragraph's line that could start a block, or take in the
      // indented block after it, and needn't: as it is, not that one's child)
      if ((this.startsBlocks(at) || this.indentedAfter(parent, i)) && column < written + was.block.attrs.contentColumn! - was.block.attrs.markerColumn!) return 0;
      return written - column;
    }
    const written = this.writtenColumn(prev.id, container);
    if (written === null) return 0;
    // (as it is, would it be that one's child? A placed one's lined up with all the same, but where
    // the shift would move a paragraph's line that could start a block, which it can't move)
    const { markerColumn, contentColumn } = this.draft.originOf(prev)?.block.attrs ?? {};
    const under = markerColumn !== undefined && column >= written + contentColumn! - markerColumn;
    if (!under && (!placed || this.startsBlocks(at) || this.indentedAfter(parent, i))) return 0;
    return written - column;
  }

  /** Whether the node after child `i` of `parent` is a block, not an item, whose first line is indented: where `i`, lined up further left, would take it in (`  1. ⏎    - `, code). */
  indentedAfter(parent: OutlineNodePersistent, i: number): boolean {
    // (last under a block that adopts a list, `listParent`, its section's next node, in its container still)
    let next = parent.children[i + 1];
    for (let up = parent; !next && up.kind !== 'item' && up.kind !== 'quote' && up.kind !== 'root'; ) {
      const above = this.parentOf(up);
      if (!above) break;
      next = above.children[above.children.indexOf(up) + 1];
      up = above;
    }
    const origin = next && next.kind !== 'item' ? this.draft.originOf(next) : null;
    if (!origin) return false;
    const line = this.tree.line(origin.startLine);
    return /^[ \t]/.test(this.old.slice(line.from, line.to));
  }

  #parents: Map<OutlineNodePersistent, OutlineNodePersistent> | null = null;

  /** The node `node` is a child of in the draft. */
  parentOf(node: OutlineNodePersistent): OutlineNodePersistent | null {
    if (!this.#parents) {
      this.#parents = new Map();
      const visit = (n: OutlineNodePersistent): void => n.children.forEach((c) => (this.#parents!.set(c, n), visit(c)));
      visit(this.draft.root);
    }
    return this.#parents.get(node) ?? null;
  }

  /** Whether item `item`, written before, takes in an item at `column` (in `container`): past its content column. Not written yet: no. */
  takesIn(item: OutlineNodePersistent, column: number, container: Container): boolean {
    const written = this.writtenColumn(item.id, container);
    return written !== null && column >= written + this.markerWidth(item);
  }

  /** How far item `item`'s content is from its marker as written: its marker as its list gives it, and the spaces after it as they were (one, for a new one). */
  markerWidth(item: OutlineNodePersistent): number {
    const was = this.draft.originOf(item);
    const place = this.draft.lists.get(item.id);
    const marker = place ? (place.type === 'bullet' ? place.marker : `${place.number ?? 1}${place.marker}`) : null;
    if (was?.kind !== 'item') return (marker?.length ?? 1) + 1;
    const { markerStart, markerEnd, contentColumn, markerColumn } = was.block.attrs;
    return contentColumn! - markerColumn! + (marker ? marker.length - (markerEnd! - markerStart!) : 0);
  }

  /**
   * Whether `at`'s subtree has a paragraph's later line a shift can't carry: not lazy, one that could
   * start a block (`2) x` under `- x`, which `copyLine` refuses); lazy past spaces, which a shift would
   * put in its container, no longer lazy (`    1. x` continuing `  1. b`, lined up to column 0: `b`'s list).
   */
  startsBlocks(at: OutlineNode): boolean {
    for (let i = at.startLine; i < at.startLine + at.persistentNode.lines; i++) {
      const line = this.tree.line(i);
      if (this.draft.escapes.has(this.from.nodeAtLine(i)?.id ?? -1) || line.leaf?.block.type !== 'paragraph' || line.index <= line.leaf.line) continue;
      if (line.lazy ? /^[ \t]/.test(this.old.slice(line.from, line.to)) : /^[ \t]*[-+*>#=|0-9]/.test(this.old.slice(line.contentFrom, line.to))) return true;
    }
    return false;
  }

  /**
   * The column node `id` was written at, its marker's (null where it isn't written yet); in
   * `container`, from where its content starts on that line (past a `>`'s space where it took one).
   */
  writtenColumn(id: number, container?: Container): number | null {
    let pos: number | null = null;
    for (const [p, at] of this.identity) if (at === id) pos = p;
    if (pos === null) return null;
    const before = this.textAt(0, pos);
    const line = before.slice(before.lastIndexOf('\n') + 1);
    if (!container) return columns(line);
    const prefix = this.inside(container);
    return columns(line) - contentStart(prefix, line.slice(prefix.length));
  }

  /** `node` (at `at`), written under `shift`, its children and blank lines with it; its ids named where they land. */
  moved(node: OutlineNodePersistent, at: OutlineNode, shift: Shift, gapIn: Container, after: Container): void {
    this.shifts.push(shift);
    // a blank line of its gap the caret (or the selection's other end) is on, written at its text's
    // column, as a line of its text would start (TO12: Shift-Enter's line, indented with its node)
    for (const a of [this.draft.caret, this.draft.anchor]) {
      if (!a || !('blank' in a) || a.blank !== node || node.children.length) continue;
      const i = at.textLastLine + 1 + a.line;
      if (i >= at.startLine + at.persistentNode.lines) continue;
      const prefix = this.continuation(at, this.tree.line(node.kind === 'item' ? at.startLine : at.textFirstLine));
      // (the gap's last line, where it is in a container the text isn't: what follows would join the text's)
      if (a.line === node.gap - 1 && prefix.replace(/[ \t]+$/, '') !== shift.trailing) continue;
      // (and the blank lines above it in the gap inside the text's containers too, as `blankLines` writes them)
      for (let k = 0; k < a.line; k++) if (!this.heldBlank.has(i - a.line + k)) this.heldBlank.set(i - a.line + k, { node, line: k, prefix: prefix.replace(/[ \t]+$/, '') });
      this.heldBlank.set(i, { node, line: a.line, prefix });
    }
    const first = this.pieces.length;
    const copy = isCopy(node);
    // a copy is its original's lines, its layout kept: written whole, as a read node moved is; one
    // `done()` changed is written as a drafted node is, its children each a copy of their own
    const whole = copy && copiedAsIs(node, at);
    if (node.read || whole) this.copyNode(node, at, at.startLine + at.persistentNode.lines);
    else {
      this.drafted(node, at, gapIn);
      this.children(node, node.kind === 'item' || node.kind === 'quote' ? at : gapIn, after);
    }
    // a copy's old text is there twice: positions in it map through its own pieces
    const own: [number, number][] | undefined = copy ? [[first, this.pieces.length]] : undefined;
    if (own) this.copyPieces.push(own[0]!);
    // named where they start now: read again where they land
    // (where writing it named it already: its first line now another's, on an item's marker line)
    const pos = this.newPosition(at, this.oldHeadStart(node, at), own);
    if (pos !== null && !(onItemsLine(at) && [...this.identity.values()].includes(node.id))) this.identity.set(pos, node.id);
    if (node.read) this.nameDescendants(at);
    if (whole) this.nameCopies(node, at, own!);
    this.shifts.pop();
  }

  /** The column on `line` past the prefix of `container` (the root's: 0). */
  columnIn(line: MdLine, container: OutlineNode): number {
    if (!container.parent) return 0;
    const piece = line.prefix.find((p) => p.container.block === container.persistentNode.block);
    if (!piece) throw new WriteFailure(`a line of node ${container.id}'s without its prefix`);
    return piece.toColumn;
  }

  /** Whether every line of `node`'s subtree with a `>` has no space after its last one (`>- a`, `>- b`). */
  unspacedLines(node: OutlineNode): boolean {
    let any = false;
    for (let i = node.startLine; i <= node.endLine; i++) {
      const line = this.tree.line(i);
      const s = this.old.slice(line.from, line.to);
      const at = s.lastIndexOf('>', line.contentFrom - line.from);
      if (at < 0 || line.blank) continue;
      if (/^[ \t]/.test(s.slice(at + 1))) return false;
      any = true;
    }
    return any;
  }

  /**
   * An old line's text from its start (`s`), as written under the shift: the new container's prefix,
   * then the rest past the old one's, re-indented. `line`, the old line it is: cut where the old
   * container's prefix ends on it (a quote's `>` takes the space after it on some lines, not others,
   * and what is in it is laid out from there); else at the shift's column, its first line's.
   */
  shifted(s: string, blank: boolean, shift: Shift, line?: number): string {
    const column = line === undefined ? shift.column : this.cutColumn(line, shift);
    // out of a quote, each line is cut where its own `>` ends, what is past it laid out from there; after
    // a new `>` with no space, `> ` is written, as a new line has it, the new content starting past it
    const delta = shift.delta;
    // with tabs: the indentation by columns, from where the old container's content starts (a tab it
    // took part of, its rest), written with tabs to its tab stops after the new prefix, whose content
    // starts past a `>`'s space (or the column of a tab it takes)
    if (shift.tabs) {
      let col = 0;
      let k = 0;
      while (k < s.length && col < column) col = s[k++] === '\t' ? col + 4 - (col % 4) : col + 1;
      const lead = /^[ \t]*/.exec(s.slice(k))![0];
      const end = advanceColumns(s, k, k + lead.length, col);
      // (a prefix ending in a `>`'s tab, `>→`: the `>` takes a column of it, the rest is indentation)
      const prefix = /^(.*>)\t$/.exec(shift.prefix)?.[1] ?? shift.prefix;
      // (whitespace is written after it to the line's column: a `>`'s space among it)
      const start = contentStart(prefix, ' ');
      // (a blank line, written without its whitespace, needs none)
      const to = blank ? Math.max(start, start + end - column + delta) : start + end - column + delta;
      if (to < start || (end < column && !blank)) throw new WriteFailure("a moved node's lines aren't indented as far as its first");
      // a tab after a quote's `>` spans by where it is: where the shift moves it off its stop, spelled
      // again as the spaces it spanned (`padded`; one after an item's marker, in the text, or in code, stays)
      const rest = (to - end) % 4 === 0 ? s.slice(k + lead.length) : padded(s.slice(k + lead.length), end, this.from.config.quotes === 'atom');
      // (the prefix's `>`s as written, every column after the last one by tabs)
      const quotes = prefix.slice(0, prefix.lastIndexOf('>') + 1);
      const out = quotes + whitespace(columns(quotes), to, true) + rest;
      return blank ? out.replace(/[ \t]+$/, '') : out;
    }
    let col = 0;
    let k = 0;
    while (k < s.length && col < column) col = s[k++] === '\t' ? col + 4 - (col % 4) : col + 1;
    // (a tab across the container's edge: the part of it past the edge, the spaces it spans there)
    let rest = ' '.repeat(Math.max(0, col - column)) + s.slice(k);
    // a tab in its indentation, or after a quote's `>`, spans by where it is: where the line moves,
    // spelled again as the spaces it spanned (one after an item's marker, in the text, or in code, stays)
    if (delta !== 0 || columns(shift.prefix) !== shift.column) {
      const lead = /^[ \t]*/.exec(rest)![0];
      const end = advanceColumns(rest, 0, lead.length, column);
      rest = ' '.repeat(end - column) + padded(rest.slice(lead.length), end, this.from.config.quotes === 'atom');
    }
    if (delta > 0 && !(blank && trimMd(rest) === '')) rest = ' '.repeat(delta) + rest;
    else if (delta < 0) {
      let j = 0;
      while (j < rest.length && j < -delta && rest[j] === ' ') j++;
      if (j < -delta && !blank) throw new WriteFailure("a moved node's lines aren't indented as far as its first");
      rest = rest.slice(j);
    }
    // (after a `>` with no space, a space the rest starts with would be the `>`'s own: written as one; a
    // copy in its original's quote as its original's lines are, where none of them has the space, `>- a`;
    // one has it on its later lines, the quote's own, and its copy has it too: Quote86)
    const unspaced = shift.copy && this.unspacedLines(shift.origin);
    const space = shift.prefix.endsWith('>') && ((spacedIn(shift.prefix, containerOf(shift.origin)) && !unspaced) || /^[ \t]/.test(rest)) ? ' ' : '';
    const out = shift.prefix + space + rest;
    return blank ? out.replace(/[ \t]+$/, '') : out;
  }

  /** Where old line `i`, under `shift`, is cut: past its old container's `>` where it is a quote's, else at the shift's column. */
  cutColumn(i: number, shift: Shift): number {
    const container = containerOf(shift.origin);
    if (container.kind !== 'quote') return shift.column;
    const piece = this.tree.line(i).prefix.find((p) => p.container.block === container.persistentNode.block);
    return piece ? piece.toColumn : shift.column;
  }

  /** The innermost shift old line `i` is written under, if any. */
  shiftAt(i: number): Shift | null {
    for (let k = this.shifts.length - 1; k >= 0; k--) {
      const shift = this.shifts[k]!;
      if (i >= shift.from && i < shift.to) return shift;
    }
    return null;
  }

  /** Where the identity of `node` (at `origin`) is in the old text: an item's marker, a quote's `>`, else its first line's content. */
  oldHeadStart(node: OutlineNodePersistent, origin: OutlineNode): number {
    return this.headStart(node, origin, this.tree.starts[origin.startLine]!, false);
  }

  /** Where old position `pos`, on `origin`'s first line, is in the new text: through the shift's prefix, else as copied. */
  newPosition(origin: OutlineNode, pos: number, within?: readonly (readonly [number, number])[]): number | null {
    const start = this.shiftedStarts.get(origin.startLine);
    const shift = this.shiftAt(origin.startLine);
    const line = this.tree.line(origin.startLine);
    const widened = this.widen(origin.startLine, this.old.slice(line.from, pos));
    if (start === undefined || (!shift && widened === null)) return this.mapOld(pos, 1, within);
    const head = shift ? this.partialTabHead(line, pos, widened ?? this.old.slice(line.from, pos), shift, origin.startLine) : null;
    if (head !== null) return start + head;
    if (pos >= line.contentFrom) return this.mapOld(pos, 1, within);
    const prefix = widened ?? this.old.slice(line.from, pos);
    return start + (shift ? this.shifted(prefix, false, shift, origin.startLine) : prefix).length;
  }

  /**
   * Old line `i`'s prefix `s` (from its start), past the content column of each item whose marker
   * widens over it as many columns wider; null where none does.
   */
  widen(i: number, s: string): string | null {
    const over = this.widened.filter((w) => i >= w.from && i < w.to);
    if (!over.length) return null;
    let out = s;
    // innermost (rightmost column) first, so the columns of the others stay where they are
    for (const w of [...over].sort((x, y) => y.column - x.column)) {
      let col = 0;
      let k = 0;
      // (indentation with tabs, as the columns it spans: a tab past the widening would span otherwise)
      if (out.slice(0, w.column).includes('\t')) out = spacesOf(out);
      while (k < out.length && col < w.column) {
        col++;
        k++;
      }
      if (col < w.column) continue;
      if (w.d > 0) out = out.slice(0, k) + ' '.repeat(w.d) + out.slice(k);
      else {
        if (!/^ *$/.test(out.slice(k + w.d, k))) throw new WriteFailure("an item's marker narrows over a line it doesn't leave the room for");
        out = out.slice(0, k + w.d) + out.slice(k);
      }
    }
    return out;
  }

  /**
   * A node the draft made, written whole in `container`: an item after a sibling item's indentation
   * and its list's marker, anything else after the container's prefix; its gap in `gapIn`. Returns
   * the container its children are written in: the item itself.
   */
  created(node: OutlineNodePersistent, parent: OutlineNodePersistent, i: number, container: Container, gapIn: Container, origin: OutlineNode | null = null): Container | null {
    const text = this.draft.textOf(node, origin);
    // a new quote with no text: its children's lines after its `>`, its own none
    if (!text && !origin && node.kind === 'quote' && node.children.length) {
      const indent = this.inside(container);
      const prefix = `${indent}> `;
      this.ensureLineStart();
      this.identity.set(this.length + indent.length, node.id);
      return { outer: outerOf(container), column: columns(prefix), prefix };
    }
    // (a new item with no text, its first block on its marker's line, `- > q`: written as below)
    if (!text && !(node.kind === 'item' && !origin && node.children.length)) throw new WriteFailure(`node ${node.id} is new and has no text the writer spells yet`);
    if (origin && origin.persistentNode.children.length && origin.persistentNode.offsets[0] === 0) throw new WriteFailure(`node ${node.id}'s first child is on its line`);
    // of another kind on its container's first line (`- > - a`): its first line starts with the
    // markers it was written after there, its later lines after its container's prefix
    let markers: string | null = null;
    // (one the draft placed elsewhere starts on a line of its own)
    if (origin && onItemsLine(origin) && !this.draft.placedIds.has(node.id)) {
      if (node.kind === 'item') throw new WriteFailure(`node ${node.id}, an item now, on a line it doesn't start`);
      const line = this.tree.line(origin.startLine);
      markers = this.old.slice(line.from, origin.kind === 'item' ? line.from + origin.persistentNode.block!.attrs.markerStart! : line.contentFrom);
    }
    // what its first line starts with, up to its marker; and its later lines
    let indent = this.inside(container);
    let marker = '';
    // (lined up with the read item a command named, its line's prefix as written: a `>` as it is)
    let verbatim = false;
    if (node.kind === 'item') {
      // as wide as an item of its list beside it, where there is one: below it unless that one starts a
      // list (an item put in before another lines up with it), else above it unless it starts the list
      const lists = this.draft.lists;
      // (past the new items beside it, in its list: they line up as it does)
      const near = (step: 1 | -1): number => {
        let k = i + step;
        while (parent.children[k]?.kind === 'item' && !this.draft.originOf(parent.children[k]!) && !lists.get((step < 0 ? parent.children[k + 1] : parent.children[k])!.id)?.start) k += step;
        return k;
      };
      // (with none, where the unit isn't the content column, as the unit has it past its parent's marker)
      indent = this.unitChild(container) ?? indent;
      // lined up with the item a command named (a paste's: the item it is pasted at), as its line is written
      const up = this.draft.lineUps.get(node.id);
      if (up) {
        const line = this.tree.line(up.startLine);
        indent = this.old.slice(line.from, line.from + up.persistentNode.block!.attrs.markerStart!).replace(/[^>\t ]/g, ' ');
        verbatim = true;
      }
      for (const k of up ? [] : [near(1), near(-1)]) {
        const sibling = parent.children[k];
        const at = sibling?.kind === 'item' ? this.draft.originOf(sibling) : null;
        const same = k < i ? !lists.get(parent.children[k + 1]!.id)?.start : !lists.get(sibling?.id ?? -1)?.start;
        if (at && same && holds(container, at)) {
          const line = this.tree.line(at.startLine);
          const lined = this.old.slice(line.from, line.from + at.persistentNode.block!.attrs.markerStart!).replace(/[^>\t ]/g, ' ');
          // (never where the item before it, of another list, would take it in: `- a⏎  1. x`; an empty
          // one a blank line ends takes in nothing)
          const before = parent.children[i - 1];
          const ended = before?.kind === 'item' && !before.children.length && before.gap > 0 && (this.draft.textOf(before, this.draft.originOf(before)) as ProseText | null)?.empty;
          if (before?.kind === 'item' && !ended && this.takesIn(before, columns(lined) - this.columnIn(line, containerOf(at)), container)) break;
          indent = lined;
          // (a list indented with tabs: new items in it with them, the line's whole prefix as written)
          break;
        }
      }
      const place = this.draft.lists.get(node.id);
      marker = this.draft.hints.get(node.id) ?? (place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-'));
    }
    // a quote's `>` takes a space after it where there is one: written with it, a new line's columns hold
    // (an item lined up with one in an unspaced quote, `>- a`: its marker's line as that one's, and its
    // later lines past the space the quote's `>` takes there)
    let lined = indent;
    if (indent.endsWith('>')) indent += ' ';
    if (!verbatim) lined = indent;
    // (a new quote with a title, a callout's: its `>` before it, and before each line in it)
    const head = indent.length;
    if (node.kind === 'quote' && !origin) indent += '> ';
    // (the spaces its text started with, as its padding: past the space after its marker, or its first line's indentation)
    // (a text starting below its marker has them on its first line of text: `spellLines`)
    const below = text instanceof ProseText && text.frame.some((p) => p.part === 'below');
    const padding = below ? '' : ' '.repeat(this.draft.paddings.get(node.id) ?? 0);
    // (between its marker and its text: a space and its padding, or what a command asked, a pasted item's own)
    // (a text starting below its marker: what its marker's line ends with, its columns the marker's own)
    const separator = !origin && marker ? (below ? this.draft.separators.get(node.id) : this.draft.separatorAt(node.id, columns(lined + marker))) : undefined;
    const spaced = below ? undefined : separator;
    const lead = marker ? `${lined}${marker}${separator ?? ` ${padding}`}` : (markers ?? indent) + padding;
    const continuation = marker ? indent.replace(/[^>\t ]/g, ' ') + ' '.repeat(spaced !== undefined ? columns(`${indent}${marker}${spaced}`) - columns(indent) : marker.length + 1) + (spaced !== undefined ? '' : padding) : indent;
    this.ensureLineStart();
    // (named by its marker, a quote by its `>`)
    this.identity.set(this.length + (node.kind === 'quote' ? head : lined.length), node.id);
    if (!text) {
      // its marker written over its first block's first line, as wide as that line's indentation
      this.leads.push({ at: this.length, text: lead });
      return { outer: outerOf(container), column: columns(continuation), prefix: continuation, markerColumn: columns(lined) };
    }
    this.spellLines(node, text, lead, continuation, origin, text instanceof AtomText ? null : (origin ?? this.draft.splitFrom.get(node.id) ?? null));
    const inside = node.kind === 'item' || (node.kind === 'quote' && !origin) ? { outer: outerOf(container), column: columns(continuation), prefix: continuation, markerColumn: columns(lined) } : null;
    // (the blank lines between a new quote's title and its children are the quote's: `>`)
    const own = inside && node.kind === 'quote' && node.children.length ? inside : gapIn;
    const moved = this.draft.gapLines.get(node.id);
    if (moved && moved[1] - moved[0] === node.gap && this.blankIn(moved, own)) this.copyLines(moved[0], moved[1]);
    else this.blankLines(node, own);
    return inside;
  }

  /** A node the draft changed: its own lines (as they were, or its text spelled), its gap, in `gapIn`; its children are the caller's. */
  drafted(node: OutlineNodePersistent, origin: OutlineNode, gapIn: Container): void {
    const source = node.source!;
    const shared = source.children.length > 0 && source.offsets[0] === 0;
    // a quote with no text of its own (its title gone): its `>` is its first child's line's, whichever
    // that is now, as on each of its lines
    if (node.kind === 'quote' && (shared || node.text === null) && !onItemsLine(origin)) {
      this.ensureLineStart();
      this.identity.set(this.headStart(node, origin, this.length), node.id);
      return;
    }
    // (an item that has a text now, where its first block was: spelled, its marker before it)
    const was = (c: OutlineNodePersistent): OutlineNodePersistent | null => (c.read ? c : (c.source ?? null));
    const texted = shared && node.kind === 'item' && !!node.text;
    if (shared && !texted) {
      // its first block shares its line (`- > q`): its marker is that child's line's
      const first = node.children[0];
      const kept = !!first && was(first) === source.children[0];
      if (this.draft.lists.get(node.id)?.number != null) throw new WriteFailure(`node ${node.id}'s marker is on its first child's line, which goes`);
      if (!kept) {
        // another block first now: its first line starts with the marker (and the containers on its
        // line), written over the indentation the line is written with
        if (!first) throw new WriteFailure(`node ${node.id}'s marker is on its first child's line, which goes`);
        const line = this.tree.line(origin.startLine);
        const piece = line.prefix.find((p) => p.container.block === origin.persistentNode.block);
        // (under the shift it is moved by, past the prefix it leaves: no marker of an item it isn't first in
        // now; not one of a node moved off its line, which it doesn't go with)
        const lineShift = this.shiftAt(origin.startLine);
        const shift = lineShift && within(origin, lineShift.origin) ? lineShift : null;
        const lead = piece ? (shift ? this.shifted(this.old.slice(line.from, piece.to), false, shift, origin.startLine) : this.old.slice(line.from, piece.to)) : '';
        if (!piece || lead.includes('\t')) throw new WriteFailure(`node ${node.id}'s marker is on its first child's line, which goes`);
        // (that block's line indented past the item's content column: the block lifted to it)
        const at = this.draft.originOf(first);
        if (at) {
          const own = this.tree.line(at.startLine).prefix.find((p) => p.container.block === origin.persistentNode.block);
          // (in columns: a tab the item's content column falls inside counts past it)
          const l = this.tree.line(at.startLine);
          const rest = own ? /^[ \t]*/.exec(this.old.slice(own.to, l.to))![0] : '';
          const extra = own ? advanceColumns(this.old, own.to, own.to + rest.length, advanceColumns(this.old, l.from, own.to, 0)) - own.toColumn : 0;
          if (extra) this.lifted.set(first, extra);
        }
        this.ensureLineStart();
        this.identity.set(this.headStart(node, origin, this.length), node.id);
        this.leads.push({ at: this.length, text: lead });
        return;
      }
      this.ensureLineStart();
      this.identity.set(this.headStart(node, origin, this.length), node.id);
      // and the nodes below it that start on that line, read as they are: rebuilt with it, they keep their ids
      for (let child = node.children[0], at = origin.child(0); child?.read && at.startLine === origin.startLine; child = child.children[0], at = at.children[0]!) {
        this.identity.set(this.headStart(child, at, this.length), child.id);
        if (!child.children.length) break;
      }
      return;
    }
    const end = source.children.length ? source.offsets[0]! : source.lines;
    const textEnd = origin.textLastLine + 1;
    this.ensureLineStart();
    const start = this.length;
    if (node.text === undefined) {
      this.copyNode(node, origin, textEnd);
      // what a line of its text starts with, for a blank line of its gap the caret is on
      this.continuations.set(node, this.continuation(origin, this.tree.line(node.kind === 'item' ? origin.startLine : origin.textFirstLine)) + quotedLine(this.from.textOf(origin)));
    } else this.spell(node, origin);
    this.identity.set(this.headStart(node, origin, start), node.id);
    // blank lines moved from another scope end or a split, as they were written there; null: written anew
    const moved = this.draft.gapLines.get(node.id);
    if (moved && moved[1] - moved[0] === node.gap && this.blankIn(moved, gapIn)) this.copyLines(moved[0], moved[1]);
    else if (moved === undefined && node.gap === source.gap && this.blankIn([textEnd, origin.startLine + end], gapIn)) this.copyLines(textEnd, origin.startLine + end);
    else this.blankLines(node, gapIn);
  }

  /** `node`'s gap, written anew in `gapIn`: each blank line its prefix, where it is recorded for an anchor on it. */
  blankLines(node: OutlineNodePersistent, gapIn: Container): void {
    const starts: number[] = [];
    // a blank line the caret or the selection is on is written as a line of the text would start (an
    // item's indentation, a quote's `> `): where what is typed continues it
    const on = (a: Anchor | null): number | null => (a && 'blank' in a && a.blank === node ? a.line : null);
    const held = [on(this.draft.caret), on(this.draft.anchor)];
    for (let k = 0; k < node.gap; k++) {
      this.ensureLineStart();
      // (and the blank lines before it inside the text's containers too, a quote's last child's; those
      // after it where the gap is, setting apart what follows)
      const last = Math.max(...held.map((h) => h ?? -1));
      const continuation = k <= last ? this.continuations.get(node) : undefined;
      const prefix = continuation === undefined ? this.blankPrefix(gapIn) : held.includes(k) ? continuation : continuation.replace(/[ \t]+$/, '');
      starts.push(this.length + prefix.length);
      this.line(prefix);
    }
    this.blankStarts.set(node, starts);
    if (node.gap > 0) this.blankEnd = this.length;
  }

  /** Old lines `[origin.startLine, end)` of a node, its marker renumbered where `done()` gave it another number. */
  copyNode(node: OutlineNodePersistent, origin: OutlineNode, end: number): void {
    const place = node.kind === 'item' ? this.draft.lists.get(node.id) : undefined;
    // an ordered item's number and delimiter, a bullet's character: its list's
    if (place && (place.type === 'bullet' || place.number !== null)) {
      const block = origin.persistentNode.block!;
      const lineFrom = this.tree.starts[origin.startLine]!;
      const from = lineFrom + block.attrs.markerStart!;
      const to = lineFrom + block.attrs.markerEnd!;
      const marker = place.type === 'bullet' ? place.marker : `${place.number}${place.marker}`;
      if (this.old.slice(from, to) !== marker) {
        // a marker of another width moves the item's content column: its later lines and its
        // descendants' are written past it as far (Enter25: `9.` renumbered `10.`)
        const d = marker.length - (to - from);
        if (d !== 0) this.widened.push({ from: origin.startLine + 1, to: origin.startLine + origin.persistentNode.lines, column: block.attrs.contentColumn!, d });
        this.copyLine(origin.startLine, { from, to, text: marker });
        this.copyLines(origin.startLine + 1, end);
        return;
      }
    }
    this.copyLines(origin.startLine, end);
  }

  /**
   * A text the draft set, spelled whole where its node is: its first line after the prefix it had (a
   * held space there settled), every other line after its containers' continuation prefix, with
   * the markup escapes `done()` gave.
   */
  spell(node: OutlineNodePersistent, origin: OutlineNode): void {
    const text = node.text;
    if (!text) throw new WriteFailure(`node ${node.id} has no text to spell`);
    const firstLine = node.kind === 'item' ? origin.startLine : origin.textFirstLine;
    const line = this.tree.line(firstLine);
    const s = text.text;
    const lines = s.split('\n');
    // the first line's prefix: up to where its text started, its padding kept but a held space (settled) and the old markup escapes
    let lead: string;
    const markerEnd = (): number => line.from + origin.persistentNode.block!.attrs.markerEnd!;
    if (text instanceof AtomText && node.kind === 'item' && origin.textFirstLine > origin.startLine) throw new WriteFailure(`item ${node.id}'s code starts below its marker`);
    if (lines[0] === '' && node.kind === 'item') {
      // an empty item: its marker and the space after it (`- `), as a new one is written
      lead = this.old.slice(line.from, markerEnd()) + (lines.length === 1 || emptyNodeAt(text.marks, text.text, 0) ? ' ' : '');
    } else if (this.draft.paddings.has(node.id)) {
      // the spaces its text started with, as its padding (`done()`'s)
      const padding = ' '.repeat(this.draft.paddings.get(node.id)!);
      lead = node.kind === 'item' ? `${this.old.slice(line.from, markerEnd())} ${padding}` : this.old.slice(line.from, this.from.posOf(origin, 0, -1)) + padding;
    } else if (node.kind === 'item' && origin.textFirstLine > origin.startLine) {
      // a text that started below its marker, on its line now: after the marker and a space
      lead = this.old.slice(line.from, markerEnd()) + ' ';
    }
    else if (node.kind === 'item' && emptyBefore(this.from.textOf(origin))) {
      // an item empty before, or with no text (its first block on its line): its marker and one space
      lead = this.old.slice(line.from, markerEnd()) + ' ';
    } else {
      const [p0, p1] = [this.from.posOf(origin, 0, -1), this.from.posOf(origin, 0, 1)];
      const held = (at: number): boolean => heldSpaceAt(this.from.marks, this.old, at);
      let padding = '';
      for (let at = p0; at < p1; at++) if ((this.old[at] === ' ' || this.old[at] === '\t') && !held(at)) padding += this.old[at];
      // four columns of it would make the text code (past its containers' content column: a tab they
      // took part of counts only its rest)
      const from = advanceColumns(this.old, line.from, p0, 0);
      const content = Math.max(from, line.prefix[line.prefix.length - 1]?.toColumn ?? 0);
      if (advanceColumns(padding, 0, padding.length, from) - content >= 4) padding = '';
      lead = this.old.slice(line.from, p0) + padding;
    }
    // an item empty before (`-`) with text now: a space after its marker
    if (node.kind === 'item' && lines[0] !== '' && !/[ \t]$/.test(lead)) lead += ' ';
    const place = node.kind === 'item' ? this.draft.lists.get(node.id) : undefined;
    if (place && (place.type === 'bullet' || place.number !== null)) {
      const block = origin.persistentNode.block!;
      const [a, b] = [block.attrs.markerStart!, block.attrs.markerEnd!];
      const marker = place.type === 'bullet' ? place.marker : `${place.number}${place.marker}`;
      // (of another width: the item's later lines, and its descendants', as far past its content column)
      const d = marker.length - (b - a);
      if (d !== 0) this.widened.push({ from: origin.startLine + 1, to: origin.startLine + origin.persistentNode.lines, column: block.attrs.contentColumn!, d });
      lead = lead.slice(0, a) + marker + lead.slice(b);
    }
    const shift = this.shiftAt(firstLine);
    if (shift) this.shiftedStarts.set(firstLine, this.length);
    // (an item whose first block was on its line: its own continuation, not that block's)
    const was = this.continuationAsWas(origin, line);
    const widened = this.widen(origin.startLine + 1, was) ?? was;
    // (where `done()` set an item's padding: its later lines at the column its marker and that padding
    // make, past the marker and one space where its text starts below it)
    const padded = node.kind === 'item' && this.draft.paddings.has(node.id) && !shift ? lead.replace(/[^>\t ]/g, ' ') + (/[ \t]$/.test(lead) ? '' : ' ') : null;
    const own = padded ?? (node.kind === 'item' && !this.from.textOf(origin) ? this.inside(origin) : shift ? this.shifted(widened, false, shift) : widened);
    // (code past a tab its container took part of: its text holds the rest of the tab as spaces, its
    // first line after the prefix every other line has)
    const split = text instanceof AtomText && node.kind !== 'item' && line.prefix.some((p) => p.partialTab);
    this.spellLines(node, text, split ? own : shift ? this.shifted(lead, false, shift, firstLine) : lead, own, origin, undefined, split);
  }

  /**
   * `text`'s lines, the first after `lead`, the others after `continuation`, with the markup escapes
   * `done()` gave `node`; where they are, for anchors and placeholders. `origin`: the node's old place,
   * whose lines' endings it keeps; `tail`: the old node whose text's end it holds (itself, or the node
   * a split cut it from), whose lazy lines it keeps lazy.
   */
  spellLines(node: OutlineNodePersistent, text: OutlineNodeText, lead: string, continuation: string, origin: OutlineNode | null, tail: OutlineNode | null = text instanceof AtomText ? null : origin, split = false): void {
    this.continuations.set(node, continuation + quotedLine(text));
    const lines = text.text.split('\n');
    const escapes = this.draft.escapes.get(node.id) ?? [];
    // each line ends as the old line it is did, a new one as the line before it
    const old = origin ? (origin.kind === 'item' ? origin.startLine : origin.textFirstLine) : -1;
    const endingOf = (k: number): string | null => (origin && old + k <= origin.textLastLine ? this.tree.line(old + k).ending || null : null);
    const starts: number[] = [];
    const offsets: number[] = [];
    const perLine: number[][] = [];
    const belowPart = text instanceof ProseText ? text.frame.find((p) => p.part === 'below') : undefined;
    const belowLines = belowPart ? belowPart.to - belowPart.from : -1;
    // an empty line that was in the old text: matched by the lines before it, and by those after it,
    // as they were (where both match, the same old line or two alike: one of two blank lines gone)
    const oldLines = origin ? (this.from.textOf(origin)?.text.split('\n') ?? []) : [];
    let same = 0;
    while (same < lines.length && same < oldLines.length && lines[same] === oldLines[same]) same++;
    let sameEnd = 0;
    while (sameEnd < lines.length && sameEnd < oldLines.length && lines[lines.length - 1 - sameEnd] === oldLines[oldLines.length - 1 - sameEnd]) sameEnd++;
    const spacedAt = (i: number): boolean => {
      if (!origin || old + i > origin.textLastLine) return false;
      const l = this.tree.line(old + i);
      return /^[ \t>]*[ \t]$/.test(this.old.slice(l.from, l.to));
    };
    const spaced = (k: number): boolean => {
      const matches = [k < same ? k : -1, lines.length - 1 - k < sameEnd ? oldLines.length - lines.length + k : -1].filter((i) => i >= 0);
      return matches.length > 0 && matches.every(spacedAt);
    };
    let offset = 0;
    lines.forEach((l, k) => {
      const own = escapes.filter((e) => e >= offset && e <= offset + l.length).map((e) => e - offset);
      let written = l;
      for (const e of [...own].reverse()) written = written.slice(0, e) + '\\' + written.slice(e);
      // a lazy line whose text is as it was stays lazy, its prefix as written: the old line there, or
      // as far from the text's end (lines put in or taken out above it)
      const first = tail ? (tail.kind === 'item' ? tail.startLine : tail.textFirstLine) : -1;
      const lazy = (i: number): MdLine | null => {
        // (where the node moves, its old prefix is no lazy line's there, nor where it is of another
        // kind now: a paragraph an item, its lines past the item's marker)
        if (!tail || i <= first || i > tail.textLastLine || this.shiftAt(i) || (tail === origin && tail.kind !== node.kind)) return null;
        const was = this.tree.line(i);
        return was.lazy && this.old.slice(was.contentFrom, was.to) === written ? was : null;
      };
      // (a text starting below its marker has no first line a lazy one could continue)
      const startsBelow = text instanceof ProseText && text.frame.some((p) => p.part === 'below');
      const was = k > 0 && !startsBelow ? (lazy(first + k) ?? (tail ? lazy(tail.textLastLine - (lines.length - 1 - k)) : null)) : null;
      // (a text starting below its marker: its padding on its first line of text)
      const padded = startsBelow && k === belowLines ? ' '.repeat(this.draft.paddings.get(node.id) ?? 0) : '';
      const prefix = (k === 0 ? lead : was ? this.old.slice(was.from, was.contentFrom) : continuation) + padded;
      // a tab a line of text starts with spans columns by where it is: `done()`'s escapes are for the
      // column it said (code has none, its tabs its own)
      if (k > 0 && !was && text instanceof ProseText && /^[ ]*\t/.test(written) && columns(prefix) % 4 !== (this.draft.columns.get(node.id) ?? 0) % 4) throw new WriteFailure(`a line of node ${node.id}'s text starting with a tab, at another column than done() gave it`);
      // (code past a tab its container took part of, its text holding the rest of it as spaces: the
      // prefix and those spaces a tab again, to its first stop)
      let out = prefix;
      let merged = 0;
      if (split && /^ *$/.test(prefix) && columns(prefix) % 4 !== 0 && columns(prefix) + /^ */.exec(written)![0].length >= columns(prefix) + 4 - (columns(prefix) % 4)) {
        merged = 4 - (columns(prefix) % 4);
        out = whitespace(0, columns(prefix) + merged, true);
        if (k === 0) this.splitHeads.set(node, this.length + out.length - 1);
      }
      // (an empty line after the first ends at its prefix's last mark, no spaces after it, which mean
      // nothing there; but the line the caret or the selection's other end is on, where they are its
      // column: Enter's new line in a fence, `> ┃`; and one the old text had with them, as it was)
      const held = [this.draft.caret, this.draft.anchor].some((a) => !!a && 'node' in a && a.node === node && a.offset === offset);
      if (k > 0 && !was && written === '' && !held && !spaced(k)) out = out.replace(/[ \t]+$/, '');
      this.ensureLineStart();
      starts.push(this.length + out.length - merged);
      offsets.push(offset);
      perLine.push(own.map((e) => e + offset));
      this.line(out + written.slice(merged), endingOf(k) ?? this.ending);
      offset += l.length + 1;
    });
    const spelled = { starts, offsets, escapes: perLine };
    this.spelled.set(node, spelled);
    for (const m of text.marks.marks) {
      if (isHeldSpacePlaceholder(m, text.text)) continue;
      const at = position(spelled, m.from, 1);
      this.marks.push({ kind: m.kind, from: at, to: at });
    }
  }

  /** The children of `parent` (by index) that aren't in the order of their places in `from`. */
  reordered(parent: OutlineNodePersistent): Set<number> {
    const out = new Set<number>();
    const at = parent.children.map((c) => this.draft.originOf(c));
    const index = at.map((o) => (o ? o.startLine : null));
    let max = -Infinity;
    const before = index.map((x) => {
      const m = max;
      if (x !== null) max = Math.max(max, x);
      return m;
    });
    let min = Infinity;
    for (let k = index.length - 1; k >= 0; k--) {
      const x = index[k];
      if (x === null || x === undefined) continue;
      if (x < before[k]! || x > min) out.add(k);
      min = Math.min(min, x);
    }
    return out;
  }

  /** The id of each descendant of `origin`, copied as they were (under the shift, if any), by where it starts now. */
  nameDescendants(origin: OutlineNode): void {
    for (const child of origin.children) {
      const pos = this.newPosition(child, this.oldHeadStart(child.persistentNode, child));
      if (pos !== null) this.identity.set(pos, child.id);
      this.nameDescendants(child);
    }
  }

  /**
   * Where a child item of item `container` starts that lines up with no sibling, by the unit
   * (`indentUnit`): under `tab`, a tab past its marker, written by columns with tabs; under `4`, its
   * container's prefix as written and spaces to four past its marker; either made up to its content
   * column, where it falls short. Null under `2`, which is the content column, and where `container`
   * is no item.
   */
  unitChild(container: Container): string | null {
    const unit = indentUnitOf(this.from);
    if (unit === 2) return null;
    const column = 'persistentNode' in container ? (container.kind === 'item' ? (this.writtenColumn(container.id) ?? this.markerColumn(container)) : null) : (container.markerColumn ?? null);
    if (column === null) return null;
    const inside = this.inside(container);
    const content = columns(inside);
    if (unit === 4) return inside + ' '.repeat(Math.max(0, column + 4 - content));
    // (in a quote, after its `>`s)
    const quotes = inside.slice(0, inside.lastIndexOf('>') + 1);
    return quotes + whitespace(columns(quotes), Math.max(column + 4 - (column % 4), content), true);
  }

  /** An item's marker's column on its line. */
  markerColumn(item: OutlineNode): number {
    const line = this.tree.line(item.startLine);
    return columns(this.old.slice(line.from, line.from + item.persistentNode.block!.attrs.markerStart!));
  }

  /** A copy's descendants, each named by its id where it was written, in the copy's own pieces (`within`). */
  nameCopies(node: OutlineNodePersistent, origin: OutlineNode, within: readonly (readonly [number, number])[]): void {
    node.children.forEach((child, k) => {
      const at = origin.child(k);
      const pos = this.newPosition(at, this.oldHeadStart(child, at), within);
      if (pos !== null) this.identity.set(pos, child.id);
      this.nameCopies(child, at, within);
    });
  }

  /** Where a node written from `start` (its first line's start) starts, as `identity` names it: an item's marker, a quote's `>`, else its first line's content; under the shift, past the prefix written there. */
  headStart(node: OutlineNodePersistent, origin: OutlineNode, start: number, shifted = true): number {
    const line = this.tree.line(origin.startLine);
    // (code spelled past a tab its container took part of: where its first line's text was written)
    const spelled = this.spelled.get(node);
    if (spelled && node.kind !== 'item' && node.text instanceof AtomText && line.prefix.some((p) => p.partialTab)) return this.splitHeads.get(node) ?? spelled.starts[0]!;
    let at = line.contentFrom;
    if (node.kind === 'item') at = line.from + origin.persistentNode.block!.attrs.markerStart!;
    else if (origin.persistentNode.block) {
      // a quote's `>`, any other block's own prefix (a footnote's label)
      const block = origin.persistentNode.block;
      at = line.prefix.find((piece) => piece.container.block === block)?.from ?? line.contentFrom;
    }
    // (the shift of a node moved off this line is no shift of one that stays on it)
    const lineShift = shifted && !line.lazy ? this.shiftAt(origin.startLine) : null;
    const shift = lineShift && within(origin, lineShift.origin) ? lineShift : null;
    const prefix = (shifted && !line.lazy ? this.widen(origin.startLine, this.old.slice(line.from, at)) : null) ?? this.old.slice(line.from, at);
    const head = shift ? this.partialTabHead(line, at, prefix, shift, origin.startLine) : null;
    if (head !== null) return start + head;
    return start + (shift ? this.shifted(prefix, false, shift, origin.startLine).length : prefix.length);
  }

  /**
   * Where the content of old line `line` starts in what a shift writes for it, where it starts at
   * `pos` on a tab its containers took part of (null elsewhere): that tab is written anew, not copied,
   * so the content starts where its column is in what was written, at the tab that crosses it.
   * `prefix`: the line up to `pos`, as the writer has it.
   */
  partialTabHead(line: MdLine, pos: number, prefix: string, shift: Shift, i: number): number | null {
    const piece = line.prefix[line.prefix.length - 1];
    if (pos !== line.contentFrom || !piece?.partialTab || this.old[pos] !== '\t') return null;
    const old = prefix + '\t';
    const out = this.shifted(old, false, shift, i);
    const column = columns(out) - (columns(old) - piece.toColumn);
    let col = 0;
    let k = 0;
    while (k < out.length && col < column) {
      const next = out[k] === '\t' ? col + 4 - (col % 4) : col + 1;
      if (next > column) break;
      col = next;
      k++;
    }
    return k;
  }

  /**
   * The prefix a later line of a text starts with, in the containers of its first line: a quote's `>`
   * as written, an item's indentation as spaces, or tabs where the line's own indentation has them.
   */
  continuation(origin: OutlineNode, line: MdLine): string {
    const out = this.continuationAsWas(origin, line);
    const shift = this.shiftAt(line.index);
    return shift ? this.shifted(out, false, shift) : out;
  }

  /** `continuationAsWas` in the draft's document. */
  continuationAsWas(origin: OutlineNode, line: MdLine): string {
    return continuationAsWas(this.old, origin, line);
  }


  /** What a new line in `container` starts with: the prefixes of the containers to it, an item's as spaces to its text. */
  inside(container: Container): string {
    if (!('persistentNode' in container)) return container.prefix;
    if (!container.parent) return '';
    const line = this.tree.line(container.startLine);
    const k = line.prefix.findIndex((p) => p.container.block === container.persistentNode.block);
    const pieces = k < 0 ? line.prefix : line.prefix.slice(0, k + 1);
    return this.continuation(container, { ...line, prefix: pieces });
  }

  /** Whether old blank lines `[a, b)` are blank lines of `container` as written (a quote's `>`), to copy there. */
  blankIn([a, b]: readonly [number, number], container: Container): boolean {
    const prefix = this.blankPrefix(container).replace(/[ \t]/g, '');
    for (let k = a; k < b; k++) {
      const line = this.tree.line(k);
      if (this.old.slice(line.from, line.to).replace(/[ \t]/g, '') !== prefix) return false;
    }
    return true;
  }

  /** A blank line in `container`: what a line there starts with, without trailing spaces. */
  blankPrefix(container: Container): string {
    return this.inside(container).replace(/[ \t]+$/, '');
  }

  /** The line the list `item` is in starts on. */
  listStart(item: OutlineNode): number | undefined {
    // (the list is open around the item on its first line)
    const containers = this.tree.line(item.startLine).containers;
    return containers[containers.findIndex((c) => c.block === item.persistentNode.block) - 1]?.line;
  }

  /** Items `i - 1` and `i` of `parent`: a list `done()` starts there must not run into the one before it. */
  checkList(parent: OutlineNodePersistent, i: number): void {
    const a = parent.children[i - 1];
    const b = parent.children[i]!;
    if (!a || a.kind !== 'item' || b.kind !== 'item') return;
    const la = this.draft.lists.get(a.id);
    const lb = this.draft.lists.get(b.id);
    if (la && lb && lb.start && la.type === lb.type && la.marker === lb.marker) throw new WriteFailure('two lists would run together');
  }

  // ---------------------------------------------------------------- the text

  copyLines(a: number, b: number): void {
    if (b <= a) return;
    if (this.shifts.some((shift) => a < shift.to && b > shift.from) || this.widened.some((w) => a < w.to && b > w.from)) {
      for (let i = a; i < b; i++) this.copyLine(i);
      return;
    }
    const from = this.tree.starts[a]!;
    const to = b < this.tree.lineCount ? this.tree.starts[b]! : this.old.length;
    this.ensureLineStart();
    this.copyRange(from, to);
    // the document's last line has no line ending
    this.open = b >= this.tree.lineCount && this.tree.line(this.tree.lineCount - 1).ending === '';
    this.ending = this.tree.line(b - 1).ending || this.ending;
  }

  /** Old line `i`, under the shift where it applies (a lazy line as it is), its marker replaced by `marker` where given. */
  copyLine(i: number, marker?: { readonly from: number; readonly to: number; readonly text: string }): void {
    const line = this.tree.line(i);
    const end = this.lineEnd(i);
    this.ensureLineStart();
    const withMarker = (from: number, to: number): string => {
      const s = this.old.slice(from, to);
      return marker && marker.from >= from && marker.to <= to ? s.slice(0, marker.from - from) + marker.text + s.slice(marker.to - from) : s;
    };
    const shift = this.shiftAt(i);
    // a paragraph's later line that could start a block, at another column: its escapes are `done()`'s
    // to give, where it spelled its text (a lazy line is copied as it is, continuing the paragraph
    // wherever it goes; a copy beside its original, at its column, is written as it is)
    if (shift && !(shift.copy && shift.delta === 0) && !line.lazy && !this.draft.escapes.has(this.from.nodeAtLine(i)?.id ?? -1) && line.leaf?.block.type === 'paragraph' && line.index > line.leaf.line && /^[ \t]*[-+*>#=|0-9]/.test(this.old.slice(line.contentFrom, line.to))) {
      throw new WriteFailure("a moved paragraph's line that could start a block");
    }
    // a lazy line with the prefix of the container its node leaves (a quote's `>`): past it, after the new one's
    const left = shift && line.lazy ? line.prefix.find((p) => p.container.block === containerOf(shift.origin).persistentNode.block) : undefined;
    if (left && containerOf(shift!.origin).parent) {
      this.shiftedStarts.set(i, this.length);
      this.text(shift!.prefix);
      this.copyRange(skipBlanks(this.old, left.to, line.contentFrom), end);
    } else if (!shift || (line.lazy && !prefixedIn(line, shift.origin))) {
      const prefix = line.lazy || line.blank ? null : this.widen(i, this.old.slice(line.from, line.contentFrom));
      if (prefix !== null) {
        this.shiftedStarts.set(i, this.length);
        this.text(prefix);
        this.copyRange(line.contentFrom, end);
      } else if (marker) {
        this.text(withMarker(line.from, line.contentFrom));
        this.copyRange(line.contentFrom, end);
      } else this.copyRange(line.from, end);
    } else {
      this.shiftedStarts.set(i, this.length);
      const held = this.heldBlank.get(i);
      if (held) {
        const starts = [...(this.blankStarts.get(held.node) ?? [])];
        starts[held.line] = this.length + held.prefix.length;
        this.blankStarts.set(held.node, starts);
        this.text(held.prefix);
        this.copyRange(line.to, end);
      } else if ((line.blank || (!line.leaf && !shift.origin.persistentNode.children.length && trimMd(this.old.slice(line.contentFrom, line.to)) === '')) && !emptyNodeAt(this.from.marks, this.old, line.to) && i >= shift.trailingFrom) {
        // a blank line after the subtree (a quote's `>` too, after a node with no children; but one a
        // placeholder holds: a line of a text), where what follows it is
        this.text(shift.trailing);
        this.blankAt.set(i, this.length);
        this.copyRange(line.to, end);
      } else if (line.blank && !emptyNodeAt(this.from.marks, this.old, line.to)) {
        const written = this.old.slice(line.from, line.to);
        // in code, never wider (any number of spaces keeps it in its item: Indent13), narrower where
        // its container is (its spaces past the column are the code's: Fence48), and short of the
        // container's column as it was, but where that is past the new column: there its spaces would
        // be the code's, and it is cut to the new prefix, an empty line of the code as it was
        const code = !!line.leaf && line.leaf.block.type !== 'paragraph' && !written.includes('>') && !shift.prefix.includes('>');
        const to = columns(shift.prefix) + shift.delta;
        const short = columns(written) < shift.column;
        if (code && (to >= shift.column || (short && columns(written) <= to))) this.copyRange(line.from, end);
        else {
          this.text(this.shifted(written, !code || short, shift, i));
          this.blankAt.set(i, this.length);
          this.copyRange(line.to, end);
        }
      } else {
        // (a tab its containers took part of, re-indented whole: the rest of it is the line's indentation)
        let from = line.prefix[line.prefix.length - 1]?.partialTab && this.old[line.contentFrom] === '\t' ? line.contentFrom + 1 : line.contentFrom;
        // (an indented code block's four columns are its indentation, not its text: where a tab in them
        // would span otherwise, re-indented with the line, the code's text past them as it is)
        if (line.leaf?.block.type === 'code_block' && !line.leaf.block.attrs.fenced && (shift.delta % 4 !== 0 || (columns(shift.prefix) - shift.column) % 4 !== 0)) {
          let col = advanceColumns(this.old, line.from, from, 0);
          const stop = line.contentColumn + 4;
          let k = from;
          while (k < line.to && col < stop && (this.old[k] === ' ' || this.old[k] === '\t')) col = advanceColumns(this.old, k, ++k, col);
          if (this.old.slice(from, k).includes('\t')) from = k;
        }
        this.text(this.shifted(this.widen(i, withMarker(line.from, from)) ?? withMarker(line.from, from), false, shift, i));
        this.copyRange(from, end);
      }
    }
    this.open = end === this.old.length && line.ending === '';
    this.ending = line.ending || this.ending;
  }

  /** `text` over the new text at `at`, where it is the same text but for markers written as spaces. */
  writeOver(at: number, text: string): void {
    const end = at + text.length;
    const out: Piece[] = [];
    let over = '';
    for (const p of this.pieces) {
      const s = 'text' in p ? p.text : this.old.slice(p.old[0], p.old[1]);
      const [a, b] = [p.at, p.at + s.length];
      if (b <= at || a >= end) {
        out.push(p);
        continue;
      }
      const cut = (from: number, to: number): Piece => ('text' in p ? { text: p.text.slice(from - a, to - a), at: from } : { old: [p.old[0] + from - a, p.old[0] + to - a], at: from });
      over += s.slice(Math.max(at, a) - a, Math.min(end, b) - a);
      if (a < at) out.push(cut(a, at));
      if (a <= at) out.push({ text, at });
      if (b > end) out.push(cut(end, b));
    }
    // (and the block's own line at the item's text, no wider: past it, it would be the item's padding)
    const next = this.textAt(end, end + 1);
    if (over !== text.replace(/[^>\t ]/g, ' ') || next === ' ' || next === '\t') throw new WriteFailure(`a marker's line written over "${over}${next}"`);
    this.pieces.splice(0, this.pieces.length, ...out);
  }

  /** The new text `[from, to)`, from the pieces. */
  textAt(from: number, to: number): string {
    let out = '';
    for (const p of this.pieces) {
      const s = 'text' in p ? p.text : this.old.slice(p.old[0], p.old[1]);
      if (p.at + s.length <= from || p.at >= to) continue;
      out += s.slice(Math.max(from, p.at) - p.at, Math.min(to, p.at + s.length) - p.at);
    }
    return out;
  }

  copyRange(from: number, to: number): void {
    if (to <= from) return;
    this.pieces.push({ old: [from, to], at: this.length });
    this.length += to - from;
  }

  text(text: string): void {
    if (!text) return;
    this.pieces.push({ text, at: this.length });
    this.length += text.length;
  }

  /** A line of new text, with its line ending. */
  line(text: string, ending = this.ending): void {
    this.ensureLineStart();
    this.text(text + ending);
    this.ending = ending;
  }

  ensureLineStart(): void {
    if (!this.open) return;
    this.open = false;
    this.text(this.ending);
  }

  /** The end of old line `i`, its line ending included. */
  lineEnd(i: number): number {
    return i + 1 < this.tree.lineCount ? this.tree.starts[i + 1]! : this.old.length;
  }

  /**
   * The text ends as the old one did: with a line ending, or without one (an empty one keeps its last
   * line ending). An empty last line a placeholder holds is a line of text, not the line ending's.
   */
  finish(): void {
    const last = this.pieces[this.pieces.length - 1];
    // an empty last line a placeholder holds past the final line ending is a line of text, not the
    // line ending's: the text ends without one where the new text ends with such a line too
    const bare = /[\r\n]$/.test(this.old) && emptyNodeAt(this.from.marks, this.old, this.old.length);
    // (a placeholder at the text's end is an empty node's: at its last line's end)
    const stillBare = this.marks.some((m) => isPlaceholder(m) && m.from === this.length);
    // (an empty document has no last line to end as it did: a written one ends with a line ending)
    const oldEnds = this.old === '' || (/(?:\r\n|\n|\r)$/.test(this.old) && !(bare && stillBare));
    if (!last) {
      if (oldEnds) this.text(/\r\n$/.test(this.old) ? '\r\n' : this.old[this.old.length - 1]!);
      return;
    }
    const s = 'text' in last ? last.text : this.old.slice(last.old[0], last.old[1]);
    const ending = /(?:\r\n|\n|\r)$/.exec(s)?.[0] ?? '';
    const oldEnding = /(?:\r\n|\n|\r)$/.exec(this.old)?.[0] ?? '';
    if (oldEnds && ending && oldEnding && ending !== oldEnding) {
      // the last line ends as the old text's last did
      this.pieces.pop();
      if ('text' in last) this.pieces.push({ text: last.text.slice(0, -ending.length), at: last.at });
      else this.pieces.push({ old: [last.old[0], last.old[1] - ending.length], at: last.at });
      this.length -= ending.length;
      this.text(oldEnding);
    } else if (!oldEnds && ending && this.length !== this.blankEnd) {
      // (but after a blank line written anew: without its line ending it would be no line)
      this.pieces.pop();
      if ('text' in last) this.pieces.push({ text: last.text.slice(0, -ending.length), at: last.at });
      else this.pieces.push({ old: [last.old[0], last.old[1] - ending.length], at: last.at });
      this.length -= ending.length;
    } else if (oldEnds && !ending) this.text(this.eol);
  }

  /** The changes from the old text to `text`: the copied pieces, in order, are where they were; else line by line. */
  changes(text: string): ChangeSpec[] {
    const changes: ChangeSpec[] = [];
    let cursor = 0;
    let pending = '';
    for (const p of this.pieces) {
      if ('text' in p) {
        pending += p.text;
        continue;
      }
      if (p.old[0] < cursor) return diffLines(this.old, text);
      if (p.old[0] > cursor || pending) changes.push(...this.refined(cursor, p.old[0], pending));
      pending = '';
      cursor = p.old[1];
    }
    if (cursor < this.old.length || pending) changes.push(...this.refined(cursor, this.old.length, pending));
    return changes;
  }

  /** Old `[from, to)` replaced by `insert`, as the characters that differ: what they end with trimmed first, so a new line goes in at the end of the line before it. */
  refined(from: number, to: number, insert: string): ChangeSpec[] {
    const before = this.old.slice(from, to);
    if (before === insert) return [];
    let end = 0;
    while (end < before.length && end < insert.length && before[before.length - 1 - end] === insert[insert.length - 1 - end]) end++;
    let start = 0;
    while (start < before.length - end && start < insert.length - end && before[start] === insert[start]) start++;
    return [{ from: from + start, to: to - end, insert: insert.slice(start, insert.length - end) }];
  }

  // ---------------------------------------------------------------- positions

  /** Where old position `pos` is in the new text, in copied text; null where it wasn't copied. */
  mapOld(pos: number, assoc: -1 | 1, within?: readonly (readonly [number, number])[]): number | null {
    let found: number | null = null;
    const pieces = within ? within.flatMap(([a, b]) => this.pieces.slice(a, b)) : this.pieces;
    for (const p of pieces) {
      if (!('old' in p)) continue;
      if (pos >= p.old[0] && pos <= p.old[1]) {
        found = p.at + pos - p.old[0];
        if (pos < p.old[1] || assoc < 0) return found;
      }
    }
    return found;
  }

  /** Where old position `pos`, in text that went, is now: where the next copied text starts, else the end (before a final line ending). */
  mapGone(pos: number): number {
    for (const p of this.pieces) if ('old' in p && p.old[0] >= pos) return p.at;
    return this.length - (/(?:\r\n|\n|\r)$/.exec(this.pieces.map((p) => ('text' in p ? p.text : this.old.slice(p.old[0], p.old[1]))).join(''))?.[0].length ?? 0);
  }

  anchor(a: Anchor | null): number {
    if (!a) return 0;
    if ('blank' in a) {
      const at = this.blankStarts.get(a.blank)?.[a.line];
      if (at !== undefined) return at;
      // a blank line copied as it was, with its node: the end of it as written (its prefix)
      const origin = this.draft.originOf(a.blank);
      const i = origin ? origin.textLastLine + 1 + a.line : -1;
      const copied = origin && i < origin.startLine + origin.persistentNode.lines ? (this.blankAt.get(i) ?? this.mapOld(this.tree.line(i).to, 1)) : null;
      if (copied !== null) return copied;
      // (a line that went, the blank lines a seam lowered: at the end of the node's text)
      const text = a.blank.text ?? (origin ? this.from.textOf(origin) : null);
      if (!text) throw new WriteFailure(`an anchor on a blank line of node ${a.blank.id}, which the writer didn't write`);
      if (this.spelled.has(a.blank)) return this.anchor({ node: a.blank, offset: text.text.length, assoc: -1 });
      const end = origin ? this.mapOld(this.from.posOf(origin, text.text.length, -1), -1) : null;
      if (end === null) throw new WriteFailure(`an anchor on a blank line of node ${a.blank.id}, which the writer didn't write`);
      return end;
    }
    // (`before`: as many columns before it, in the padding before a text)
    if ('old' in a && this.draft.root === this.from.root) return a.before ? this.back(a.old, a.before) : a.old;
    if ('old' in a) {
      if (a.otherwise && !this.inCopy(a.old)) return this.anchor(a.otherwise);
      return this.back(this.mapOld(a.old, a.assoc) ?? this.mapGone(a.old), a.before);
    }
    const spelled = this.spelled.get(a.node);
    const origin = this.draft.originOf(a.node);
    // in a copy's old lines, where the copy wrote them
    if (!spelled && origin && isCopy(a.node)) {
      const pos = this.mapOld(this.from.posOf(origin, a.offset, a.assoc), a.assoc, this.copyPieces);
      if (pos !== null) return pos;
    }
    if (!spelled) throw new WriteFailure(`an anchor in node ${a.node.id}, which the writer didn't spell`);
    // (in the padding before its text)
    return this.back(position(spelled, a.offset, a.assoc), a.before);
  }

  result(changes: readonly ChangeSpec[]): WriterOutput {
    const root = this.draft.root;
    // a subtree copied into text a change inserts is read again there (a move): its descendants are named too
    let delta = 0;
    const inserted: [number, number][] = [];
    for (const c of changes) {
      const at = c.from + delta;
      if (c.insert) inserted.push([at, at + c.insert.length]);
      delta += (c.insert?.length ?? 0) - ((c.to ?? c.from) - c.from);
    }
    // and so is one the changes don't carry to where it was written (two equal subtrees, the changes
    // made line by line: the lines left alone can be the other one's)
    for (const copy of this.copied) {
      const carried = mapPos(changes, this.from.rangeOf(copy.origin).from, 1) === copy.from;
      if (!carried || inserted.some(([a, b]) => a < copy.to && b > copy.from)) this.nameDescendants(copy.origin);
    }
    // the old placeholders in what was copied, where they were
    if (root !== this.from.root) {
      for (const m of this.from.marks.marks) {
        const at = this.mapOld(m.from, 1);
        if (at !== null && this.inCopy(m.from)) this.marks.push({ kind: m.kind, from: at, to: at });
      }
    } else this.marks.push(...this.from.marks.marks);
    const head = this.anchor(this.draft.caret);
    const anchor = this.draft.anchor === this.draft.caret ? head : this.anchor(this.draft.anchor);
    return { changes, identity: this.identity, marks: this.marks, selection: { anchor, head } };
  }

  /** Whether old position `pos` is in a line the writer copied whole. */
  inCopy(pos: number): boolean {
    return this.pieces.some((p) => 'old' in p && pos >= p.old[0] && (pos < p.old[1] || (pos === p.old[1] && p.old[1] === this.old.length)));
  }
}

/** Whether `node` is `root` or inside it. */
function within(node: OutlineNode, root: OutlineNode): boolean {
  for (let n: OutlineNode | null = node; n; n = n.parent) if (n.persistentNode === root.persistentNode && n.startLine === root.startLine) return true;
  return false;
}

/**
 * Whether `line` carries the prefix of a container in `origin`'s subtree (a moved quote's `>`): lazy
 * for a paragraph in it, the line is still the moved node's, written where it goes.
 */
function prefixedIn(line: MdLine, origin: OutlineNode): boolean {
  const blocks = new Set<unknown>();
  const visit = (n: OutlineNode): void => {
    if (n.kind === 'quote' || n.kind === 'item') blocks.add(n.persistentNode.block);
    n.children.forEach(visit);
  };
  visit(origin);
  return line.prefix.some((p) => blocks.has(p.container.block));
}

/** Whether a text was empty, or none (an item whose first block is on its marker's line). */
const emptyBefore = (text: OutlineNodeText | null): boolean => !text || (text instanceof ProseText && text.empty);

/**
 * The prefix a later line of `origin`'s text starts with where it was, in the containers of `line`
 * (its first line's, or some of them): a quote's `>` as written (with the space its content starts
 * past), an item's indentation as spaces, or tabs where the line's own indentation has them.
 */
export function continuationAsWas(old: string, origin: OutlineNode, line: MdLine): string {
  const own = origin.kind === 'item' ? origin.persistentNode.block : null;
  // a quote that is the node's text keeps its `>` on each line: the prefix stops before it
  const quote = origin.persistentNode.textQuote;
  const cut = quote ? line.prefix.findIndex((p) => p.container.block === quote) : -1;
  if (cut >= 0) line = { ...line, prefix: line.prefix.slice(0, cut), contentFrom: line.prefix[cut]!.from };
  // (up to where the pieces asked for end: a container's own prefix, `inside`)
  const last = line.prefix[line.prefix.length - 1];
  const written = old.slice(line.from, last ? Math.min(last.to, line.contentFrom) : line.contentFrom);
  // with tabs after a quote's `>`, the line's own prefix: its markers as spaces, its `>`s and tabs as written
  if (written.includes('\t') && inQuote(line)) return written.replace(/[^>\t ]/g, ' ');
  const tabs = itemTabs(line, old);
  const pieces = line.prefix;
  let out = '';
  let column = 0;
  // a run of indentation, written at once: tabs to its tab stops
  let run = 0;
  const flush = (): void => {
    out += whitespace(column - run, column, tabs);
    run = 0;
  };
  pieces.forEach((p, k) => {
    if (p.container.block.type === 'blockquote') {
      flush();
      const marker = old.slice(p.from, p.to);
      const next = pieces[k + 1];
      const spaced = !!next && next.container.block.type !== 'blockquote' && next.toColumn > next.fromColumn && marker.endsWith('>');
      out += spaced ? marker + ' ' : marker;
      column = p.toColumn + (spaced ? 1 : 0);
      return;
    }
    const width = (own && p.container.block === own ? own.attrs.contentColumn! : p.toColumn) - p.fromColumn;
    column += width;
    run += width;
  });
  flush();
  return out;
}

/** What a line of a quote's text starts with past its containers' prefix (`> `), for a blank line of its gap the caret is on; nothing for any other text. */
function quotedLine(text: OutlineNodeText | null): string {
  return text instanceof ProseText && text.type === 'quote' ? '> ' : '';
}

/** Whether `line`'s prefix has a quote's marker. */
function inQuote(line: MdLine): boolean {
  return line.prefix.some((p) => p.container.block.type === 'blockquote');
}

/** Past the spaces and tabs in `s` from `from`, up to `to`. */
function skipBlanks(s: string, from: number, to: number): number {
  while (from < to && (s[from] === ' ' || s[from] === '\t')) from++;
  return from;
}

/** Blank columns `[from, to)`: spaces, or tabs to each tab stop and spaces after. */
function whitespace(from: number, to: number, tabs: boolean): string {
  let out = '';
  let column = from;
  if (tabs) {
    for (let stop = column + 4 - (column % 4); stop <= to; stop += 4) {
      out += '\t';
      column = stop;
    }
  }
  return out + ' '.repeat(Math.max(0, to - column));
}

/** The position in the new text of offset `offset` of a spelled text; at a markup escape there, `assoc` picks the side. */
function position(spelled: Spelled, offset: number, assoc: -1 | 1): number {
  let k = spelled.offsets.length - 1;
  while (k > 0 && spelled.offsets[k]! > offset) k--;
  const col = offset - spelled.offsets[k]!;
  const before = spelled.escapes[k]!.filter((e) => e < offset || (e === offset && assoc > 0)).length;
  return spelled.starts[k]! + col + before;
}

/**
 * Whether a node of the document at `at` stays in its container written in `container`: the same one,
 * or an item the draft made in the same outer container, its text at the column the old one's was.
 */
function holds(container: Container, at: OutlineNode): boolean {
  const old = containerOf(at);
  if ('persistentNode' in container) return old.persistentNode === container.persistentNode;
  return old.kind === 'item' && containerOf(old).persistentNode === container.outer.persistentNode && old.persistentNode.block!.attrs.contentColumn! === container.column;
}

/** The document's container a container is in, or is. */
function outerOf(container: Container): OutlineNode {
  return 'persistentNode' in container ? container : container.outer;
}

/** The columns `prefix` spans. */
/**
 * A line's text from its markers on (`rest`, starting at column `at`), the whitespace after each quote's
 * `>` that has a tab as the spaces it spanned: that tab gives the `>` its space, and what is left of it
 * is the quote's content's indentation, which would change with where the line goes. A tab after a
 * list item's marker stays (Indent14: it moves where the text starts by no more than to its stop), and
 * where quotes are atoms (`atoms`), a `>` and what follows it are the atom's own text. Anything else,
 * `rest` as it is.
 */
function padded(rest: string, at: number, atoms: boolean): string {
  let out = '';
  let col = at;
  let k = 0;
  for (;;) {
    const m = /^(?:>|(?:[-*+]|\d{1,9}[.)])(?=[ \t]|$))/.exec(rest.slice(k));
    // (a quote that is an atom, `quotes: atom`: its `>`s and what follows them are its text, as written)
    if (!m || (atoms && m[0] === '>')) break;
    out += m[0];
    col += m[0].length;
    k += m[0].length;
    const space = /^[ \t]*/.exec(rest.slice(k))![0];
    const to = advanceColumns(rest, k, k + space.length, col);
    out += m[0] === '>' && space.includes('\t') ? ' '.repeat(to - col) : space;
    col = to;
    k += space.length;
  }
  return k ? out + rest.slice(k) : rest;
}

/** A line's leading indentation (between its quotes' `>`s too) with its tabs the spaces they span. */
function spacesOf(s: string): string {
  const lead = /^[ \t>]*/.exec(s)![0];
  let out = '';
  let col = 0;
  for (const c of lead) {
    if (c === '\t') {
      const to = col + 4 - (col % 4);
      out += ' '.repeat(to - col);
      col = to;
    } else {
      out += c;
      col++;
    }
  }
  return out + s.slice(lead.length);
}

const units = new WeakMap<OurusDoc, 'tab' | 2 | 4>();
const tabbed = new WeakMap<OurusDoc, boolean>();

/**
 * The unit a new nesting in `doc` takes (`indentUnit`): its config's, or under `detect` the one most of
 * its nested items have, each by its indentation past its parent's marker (a tab in it, `tab`; at both
 * its parent's content column and four past its marker, as under `10. `, or at neither, none; else
 * `2` at the content column, `4` four past the marker); with none, a tab where the document indents
 * with tabs outside code (`tabbedOf`), else `2`, and `2` on a tie.
 */
export function indentUnitOf(doc: OurusDoc): 'tab' | 2 | 4 {
  const set = doc.config.indentUnit;
  if (set !== 'detect') return set;
  let unit = units.get(doc);
  if (unit !== undefined) return unit;
  const votes = { tab: 0, 2: 0, 4: 0 };
  const visit = (node: OutlineNode): void => {
    for (const child of node.children) {
      if (child.kind === 'item' && node.kind === 'item' && child.startLine !== node.startLine) {
        const vote = nestingOf(doc, node, child);
        if (vote !== null) votes[vote]++;
      }
      visit(child);
    }
  };
  visit(doc.rootNode);
  const most = Math.max(votes.tab, votes[2], votes[4]);
  const top = (['tab', 2, 4] as const).filter((u) => votes[u] === most);
  unit = most === 0 ? (tabbedOf(doc) ? 'tab' : 2) : top.length > 1 ? 2 : top[0]!;
  units.set(doc, unit);
  return unit;
}

/** How item `child` nests under item `parent`, by its indentation past `parent`'s marker; null for none. */
function nestingOf(doc: OurusDoc, parent: OutlineNode, child: OutlineNode): 'tab' | 2 | 4 | null {
  const outer = parent.block.attrs;
  const own = child.block.attrs;
  if (outer.markerColumn === undefined || outer.contentColumn === undefined || own.markerColumn === undefined || own.markerStart === undefined) return null;
  // a tab in its indentation past the parent's marker (one that starts before it and reaches past it too)
  const line = doc.mdTree.line(child.startLine);
  let column = 0;
  for (let k = line.from; k < line.from + own.markerStart; k++) {
    const next = doc.text[k] === '\t' ? column + 4 - (column % 4) : column + 1;
    if (doc.text[k] === '\t' && next > outer.markerColumn) return 'tab';
    column = next;
  }
  const content = own.markerColumn === outer.contentColumn;
  const four = own.markerColumn === outer.markerColumn + 4;
  return content && four ? null : content ? 2 : four ? 4 : null;
}

/** Whether `doc` indents with tabs outside code: the unit `detect` reads where no nested item says one. */
function tabbedOf(doc: OurusDoc): boolean {
  let found = tabbed.get(doc);
  if (found !== undefined) return found;
  found = false;
  for (let i = 0; i < doc.lineCount && !found; i++) {
    const line = doc.mdTree.line(i);
    // (an item's indentation with a tab, a tab it takes part of before code in it too)
    if (itemTabs(line, doc.text)) found = true;
    // (a code block's lines past its fence are its own, as an indented one's all are)
    const leaf = line.leaf;
    if (leaf && CODE.has(leaf.block.type) && (!leaf.block.attrs.fenced || i !== leaf.line)) continue;
    if (/^[ >]*\t/.test(doc.text.slice(line.from, line.to))) found = true;
  }
  tabbed.set(doc, found);
  return found;
}

/** Whether an item's indentation on `line` has a tab: in its prefix, or one it takes part of. */
const itemTabs = (line: MdLine, old: string): boolean =>
  line.prefix.some((p) => p.container.block.type === 'item' && (/^[ \t]*/.exec(old.slice(p.from, p.to))![0].includes('\t') || (p.partialTab && /^[ \t]*$/.test(old.slice(p.from, p.to)))));

/** Blocks of lines whose indentation past their first line is their own. */
const CODE = new Set(['code_block', 'math_block', 'comment_block', 'html_block']);

function columns(prefix: string): number {
  let column = 0;
  for (const c of prefix) column = c === '\t' ? column + 4 - (column % 4) : column + 1;
  return column;
}

/** The blank lines after `node`'s subtree in its document: its last descendant's gap. */
function lastGap(node: OutlineNode): number {
  let p = node.persistentNode;
  while (p.children.length) p = p.children[p.children.length - 1]!;
  return p.gap;
}

/** The nearest container (root, item, quote) above `node` in its document. */
function containerOf(node: OutlineNode): OutlineNode {
  let up = node.parent!;
  while (up.parent && up.kind !== 'item' && up.kind !== 'quote') up = up.parent;
  return up;
}

/** Whether `node` is a copy of a read node (`draft.copy`): drafted, with another id than the node it copies. */
function isCopy(node: OutlineNodePersistent): boolean {
  return !node.read && !!node.source && node.id !== node.source.id;
}

/**
 * The column a container's content starts at on a line written `prefix` then `rest`: past a `>`'s
 * space, or the column it takes of a tab (`>→`), where there is one.
 */
function contentStart(prefix: string, rest: string): number {
  const bare = /^(.*>)\t$/.exec(prefix)?.[1];
  if (bare !== undefined) return columns(bare) + 1;
  return columns(prefix) + (prefix.endsWith('>') && (rest[0] === ' ' || rest[0] === '\t') ? 1 : 0);
}

/** Whether lines cut past a quote's `>` (`from`'s) go after `prefix` with a space: `> `, as a new line's, where its `>` has none. */
function spacedIn(prefix: string, from: OutlineNode): boolean {
  return prefix.endsWith('>') && from.kind === 'quote';
}

/** Whether a copy is its original below it as well: every node a copy with the original's text, gap and children. */
function copiedAsIs(node: OutlineNodePersistent, origin: OutlineNode): boolean {
  const source = origin.persistentNode;
  if (!isCopy(node) || node.source !== source || node.text !== undefined || node.gap !== source.gap || node.children.length !== source.children.length) return false;
  return node.children.every((child, k) => copiedAsIs(child, origin.child(k)));
}

/** Whether `node` starts on the first line of an item it is in, past its marker (`- > q`, `- - a`): a line only that item's first has. */
function onItemsLine(node: OutlineNode): boolean {
  for (let up = containerOf(node); up.parent && up.startLine === node.startLine; up = containerOf(up)) if (up.kind === 'item') return true;
  return false;
}

/** Whether `node` starts on its container's first line (`- > q`): its line holds the container's marker. */
function onContainersLine(node: OutlineNode): boolean {
  const container = containerOf(node);
  return !!container.parent && container.startLine === node.startLine;
}
