// A draft in normal form: the outline `done()` fixed and what the command asked of the writer, frozen.
// The writer's input, and the readback's, alone: they read nothing of the mutable draft, which a
// command builds and `done()` normalizes.

import type { OurusDoc, OurusNode, OurusText, PersistentNode } from '../doc/index.ts';
import { advanceColumns, type DocPos, type LocalOffset, type NodeId, type ColumnIndex } from '../text/index.ts';

/** An anchor as `done()` fixed it: in a node of `draft.root` whose text the draft set, or a position of `from`. */
export type Anchor =
  /** In a node's text; `before`: that many columns before it, in the padding before the text's start (offset 0). */
  | { readonly node: PersistentNode; readonly offset: LocalOffset; readonly assoc: -1 | 1; readonly before?: number }
  | { readonly old: DocPos; readonly assoc: -1 | 1; readonly otherwise?: Anchor; readonly before?: number }
  /**
   * On blank line `line` of a node's gap: one `done()` made of a text's empty last line; `carried`, of
   * the blank lines before the first block-id line its text carries, where it made them so.
   */
  | { readonly blank: PersistentNode; readonly line: number; readonly carried?: true };

/** Where an item is in its list: whether it starts one, the list's kind and marker (a bullet's character, an ordered list's delimiter), its number. */
export interface ListPlace {
  readonly start: boolean;
  readonly type: 'bullet' | 'ordered';
  readonly marker: string;
  readonly number: number | null;
}

/**
 * Where a node's blank lines after its text come from, by node id (`OurusDraft`'s, then `done()`'s): a
 * node with none recorded has its own lines in `from`, as written.
 */
export interface GapOrigin {
  /** The command stated it (`gap`): `done()`'s scope ends keep it as set. */
  stated?: boolean;
  /** Taken from another node's lines (a split, a join, a move, `inheritGap`, a scope end): that node's id, -1 none's. */
  from?: number;
  /**
   * The lines of `from` the writer copies for it; null: blank lines written anew. As many as the gap
   * once `done()` is through: lines a later change left fewer or more are dropped then, written anew.
   */
  lines?: readonly [number, number] | null;
  /**
   * The author's lines it keeps at least, of the node that took it in (`inheritGap`): how many of its
   * blank lines may be ours to drop, read once (`#autoBlankLines`); a gap lowered after can be below it.
   */
  floor?: number;
  /**
   * The gap's last line is whitespace ourus added, its line break the writer marks where it writes the
   * gap anew (on a gap of one or more: lowered to none after, it marks nothing): raised from none by
   * `done()` because Markdown needed a blank line there, or the gap the node had, whose last line was ours.
   */
  auto?: boolean;
  /**
   * The command took a line out of the gap, or put one in, before its last (Backspace, Shift-Enter on a
   * blank line): the gap's last line is the one it had, ours where that was (`auto`).
   */
  lastKept?: boolean;
  /** The command kept the gap's first lines, the rest gone below them (a paste or Enter filling a blank line under them): its last line the one it had there. */
  firstKept?: boolean;
}

/** What `done()` fixed: the outline, and the maps the writer lays it out by. */
export interface NormalForm {
  /** The outline the command wants, in normal form, every text fixed. */
  readonly root: PersistentNode;
  readonly caret: Anchor | null;
  /** A selection's other end: the caret's own where nothing is selected. */
  readonly anchor: Anchor | null;
  /** Each item's place in its list, for the items of every list the draft changed. */
  readonly lists: ReadonlyMap<NodeId, ListPlace>;
  /** The nodes whose text `done()` escaped where it is (every one it set): their escapes are in their text, ours marked `auto`. */
  readonly escaped: ReadonlySet<NodeId>;
  /** The column a text's later lines start at, by node id, where one starts with a tab: the escapes are for that column. */
  readonly columns: ReadonlyMap<NodeId, ColumnIndex>;
  /** Where each drafted node's source is in `from`, and each read node right under a drafted one. */
  readonly origins: ReadonlyMap<PersistentNode, OurusNode>;
  /** Where each gap came from, where it isn't the node's own (`GapOrigin`): the lines the writer copies, and the ones `done()` raised, whose line break it marks (`auto`). */
  readonly gaps: ReadonlyMap<NodeId, Readonly<GapOrigin>>;
  /** The blank lines before the first node, where `done()` set them (null: as in `from`). */
  readonly preamble: number | null;
  /** The spaces before a text on its first line, past the one after an item's marker (a paragraph's indentation), by node id: a text's leading spaces, which Markdown holds only so. */
  readonly paddings: ReadonlyMap<NodeId, number>;
  /** Blocks the command didn't touch written lifted by so many columns, by node id: kept out of the item above them, as the outliners keep them (B193). */
  readonly lifts: ReadonlyMap<NodeId, number>;
  /** Nodes written anew, in normal form, their layout as it was not kept (B348). */
  readonly anew: ReadonlySet<NodeId>;
}

/** What the command asked of the writer, as it stood when the draft was done. */
export interface WriterAsks {
  /** The nodes the draft placed, by id: moved (removed and placed again), or made. */
  readonly placedIds: ReadonlySet<NodeId>;
  /** For each node a split made, by id: the read node of `from` whose text's end it holds (its lazy lines the writer keeps lazy). */
  readonly splitFrom: ReadonlyMap<NodeId, OurusNode>;
  /** A new item's marker, by node id. */
  readonly hints: ReadonlyMap<NodeId, string>;
  /** What goes between a new item's marker and its text (`-   b`'s spaces, `-→b`'s tab), by node id. */
  readonly separators: ReadonlyMap<NodeId, string>;
  /** The read item of `from` a new item lines up with, its line's indentation and prefixes as written, by node id. */
  readonly lineUps: ReadonlyMap<NodeId, OurusNode>;
}

/** A draft in normal form (`OurusDraft.done()`'s): immutable, what `write()` and the readback take. */
export class NormalizedDraft implements NormalForm, WriterAsks {
  /** The document the draft is of. */
  readonly from: OurusDoc;
  readonly root: PersistentNode;
  readonly caret: Anchor | null;
  readonly anchor: Anchor | null;
  readonly lists: ReadonlyMap<NodeId, ListPlace>;
  readonly escaped: ReadonlySet<NodeId>;
  readonly columns: ReadonlyMap<NodeId, ColumnIndex>;
  readonly origins: ReadonlyMap<PersistentNode, OurusNode>;
  readonly gaps: ReadonlyMap<NodeId, Readonly<GapOrigin>>;
  readonly preamble: number | null;
  readonly paddings: ReadonlyMap<NodeId, number>;
  readonly lifts: ReadonlyMap<NodeId, number>;
  readonly anew: ReadonlySet<NodeId>;
  readonly placedIds: ReadonlySet<NodeId>;
  readonly splitFrom: ReadonlyMap<NodeId, OurusNode>;
  readonly hints: ReadonlyMap<NodeId, string>;
  readonly separators: ReadonlyMap<NodeId, string>;
  readonly lineUps: ReadonlyMap<NodeId, OurusNode>;

  /** `form`, `done()`'s, and `asks`, the command's, copied: the draft they came from can't change them after. */
  constructor(from: OurusDoc, form: NormalForm, asks: WriterAsks) {
    this.from = from;
    this.root = form.root;
    this.caret = form.caret;
    this.anchor = form.anchor;
    this.lists = new Map(form.lists);
    this.escaped = new Set(form.escaped);
    this.columns = new Map(form.columns);
    this.origins = new Map(form.origins);
    this.gaps = new Map([...form.gaps].map(([id, g]) => [id, Object.freeze({ ...g })]));
    this.preamble = form.preamble;
    this.paddings = new Map(form.paddings);
    this.lifts = new Map(form.lifts);
    this.anew = new Set(form.anew);
    this.placedIds = new Set(asks.placedIds);
    this.splitFrom = new Map(asks.splitFrom);
    this.hints = new Map(asks.hints);
    this.separators = new Map(asks.separators);
    this.lineUps = new Map(asks.lineUps);
    Object.freeze(this);
  }

  /** Where a node of `root` is in `from`: a drafted node's source, or a read node right under a drafted one; null for one the draft made. */
  originOf(node: PersistentNode): OurusNode | null {
    return this.origins.get(node) ?? null;
  }

  /** A text of the draft's: a drafted node's as set, else (`origin`) its source's in `from`. */
  textOf(node: PersistentNode, origin: OurusNode | null): OurusText | null {
    if (node.text !== undefined) return node.text;
    return origin ? this.from.textOf(origin) : null;
  }

  /**
   * Item `id`'s separator where its marker ends at `column`: the one asked, but a space where a tab
   * in it would span there to more than four columns past the marker, which would make its text code.
   */
  separatorAt(id: NodeId, column: number): string | undefined {
    return separatorAt(this.separators.get(id), column);
  }
}

/** `separator` where a marker ends at `column`: a space where a tab in it would span past four columns. */
export function separatorAt(separator: string | undefined, column: number): string | undefined {
  if (separator === undefined || !separator.includes('\t')) return separator;
  return advanceColumns(separator, 0, separator.length, column) - column > 4 ? ' ' : separator;
}
