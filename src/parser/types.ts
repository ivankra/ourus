// The syntax layer's public types: a lossless line table, a block tree over it, and inline nodes over
// each leaf's text. Positions are UTF-16 offsets into the document's text; lines are 0-based.

import type { LineEnding } from '../text/index.ts';

/** A list item's marker, as written: on an item, and on its list (its first item's). */
export interface MdList {
  readonly type: 'bullet' | 'ordered';
  /** `-`, `+` or `*` for bullet lists. */
  readonly bulletChar: string | null;
  /** `.` or `)` for ordered lists. */
  readonly delimiter: string | null;
  /** The number an ordered item is written with (a list's: its first item's). */
  readonly start: number | null;
  /** Columns between the container's content start and the marker (0–3). */
  readonly markerOffset: number;
  /** Columns from the marker's start to the item's content column. */
  readonly padding: number;
}

/** A task list item's checkbox, `[ ]` or `[x]` (Obsidian: any one character, `[?]`). */
export interface MdTask {
  readonly checked: boolean;
  /** The character in the brackets (a space when unchecked). */
  readonly status: string;
  /** The checkbox, brackets included, in offsets from its line's start. */
  readonly start: number;
  readonly end: number;
}

/** An Obsidian callout, `> [!type]± title`, on its quote. */
export interface MdCallout {
  /** The type as written (`note`, `Warning`). */
  readonly kind: string;
  /** `+` (open) or `-` (folded) after the type, if any. */
  readonly fold: '+' | '-' | null;
}

/** A table column's alignment, from its delimiter row (`:--`, `:-:`, `--:`); null for none. */
export type MdTableAlign = 'left' | 'center' | 'right' | null;

/**
 * A block, as stored: immutable, shared by every snapshot of a document that took it whole, so it
 * holds no parent and no absolute line (those change when lines are added above it). Containers (the
 * document, quotes, lists, items, footnote definitions) hold blocks, leaves (paragraphs, headings,
 * code, ...) hold lines, a table holds rows of cells. Where it is in one tree is an `MdBlockAt`.
 */
export interface MdBlock {
  /**
   * CommonMark: `document`, `blockquote`, `list`, `item`, `paragraph`, `heading`, `thematic_break`,
   * `code_block`, `html_block`, `refdef` (a link reference definition, split off its paragraph).
   * GFM: `table` (its parts: `table_row`, `table_cell`), `footnote_definition`.
   * Obsidian: `frontmatter`, `callout_title`, `math_block`, `comment_block`.
   */
  readonly type: string;
  readonly attrs: MdAttrs;
  /** A container (the document, quotes, lists, items, ...), a leaf, or a part of a leaf (a table's rows and cells). */
  readonly kind: 'container' | 'leaf' | 'part';
  /** From its first line to its last, inclusive. Blank lines after a block's last content line are not part of it. */
  readonly lines: number;
  /** Lines from its first up to the one that ended it: the lines it is open on. */
  readonly span: number;
  readonly children: readonly MdBlock[];
  /** Each child's first line, from this block's. */
  readonly offsets: readonly number[];
}

/**
 * A block's attributes; which are set depends on its type. Offsets (`…Start`, `…End`) are from their
 * line's start (an item's marker in the text: `MdTree.markerFrom`).
 */
export interface MdAttrs {
  /** heading: 1–6. */
  readonly level?: number;
  /** heading: written with an underline. */
  readonly setext?: boolean;
  /** code_block. */
  readonly fenced?: boolean;
  readonly fenceChar?: string;
  readonly fenceLength?: number;
  readonly fenceOffset?: number;
  /** code_block: the info string as written (escapes and references not decoded). */
  readonly info?: string;
  /** code_block (fenced), math_block, comment_block, frontmatter: a closing line ends it (else the container or document did). */
  readonly closed?: boolean;
  /** html_block: the CommonMark HTML block kind, 1–7. */
  readonly htmlType?: number;
  /** list and item. A list's is its first item's. */
  readonly list?: MdList;
  /** list: tight, as CommonMark defines it. */
  readonly tight?: boolean;
  /** item: the marker itself (`-`, `1.`), in offsets from its first line's start. */
  readonly markerStart?: number;
  readonly markerEnd?: number;
  /** item: columns of the marker and of the item's content on its first line. */
  readonly markerColumn?: number;
  readonly contentColumn?: number;
  /** item (GFM): its task checkbox. */
  readonly task?: MdTask;
  /** refdef, footnote_definition: the label as written, brackets included (`[a]`, `[^a]`). */
  readonly label?: string;
  /** table: the columns' alignment. */
  readonly align?: readonly MdTableAlign[];
  /** table_row: `header`, `delimiter` (the alignment row) or `body`. */
  readonly row?: 'header' | 'delimiter' | 'body';
  /** table_cell: the cell's text, without the pipes around it or its padding, in offsets from its line's start. */
  readonly start?: number;
  readonly end?: number;
  /** table_cell: its column, from 0. */
  readonly column?: number;
  /** blockquote (Obsidian): a callout. */
  readonly callout?: MdCallout;
}

import type { MdBlockAt } from './tree.ts';

export type { MdBlockAt };

/**
 * The part of a line a container consumed: a quote's `>` (and an optional space), an item's
 * indentation, marker and padding on its first line or its indentation on later ones.
 */
export interface MdPrefixPiece {
  /** The container that consumed it: one of its line's `containers`. */
  readonly container: MdBlockAt;
  /** `quote`, `marker`, `indent`, or an extension's (`footnote`, for a footnote definition's label). */
  readonly kind: string;
  readonly from: number;
  readonly to: number;
  readonly fromColumn: number;
  readonly toColumn: number;
  /** The piece ends inside a tab: the container consumed part of the tab at `to`, up to `toColumn`. */
  readonly partialTab: boolean;
}

/** One line of a tree: its offsets and ending, the containers' prefix on it, and the blocks it is in. */
export interface MdLine {
  readonly index: number;
  readonly from: number;
  /** End of the line's text, before its line ending. */
  readonly to: number;
  readonly ending: LineEnding;
  /** Container pieces, outermost first. */
  readonly prefix: readonly MdPrefixPiece[];
  /** Where the line's content starts after the prefix pieces. */
  readonly contentFrom: number;
  readonly contentColumn: number;
  /** The containers the line is in, outermost first (the document excluded). */
  readonly containers: readonly MdBlockAt[];
  /** The innermost container (the document when none). */
  readonly container: MdBlockAt;
  /** The leaf block the line belongs to, or null (blank lines, lines of container markers only). */
  readonly leaf: MdBlockAt | null;
  /** The line continued a paragraph lazily: some enclosing containers didn't match it. */
  readonly lazy: boolean;
  /** Only whitespace on the whole line. */
  readonly blank: boolean;
  /** Only whitespace after the prefix pieces. */
  readonly empty: boolean;
}

/**
 * An inline node: text, emphasis, a link, code, ... Positions are offsets into its leaf's
 * `MdInlineText.text`; a node's range covers its markup (`**`, `[`…`](url)`), and the parts of it
 * outside every child are that markup.
 */
export interface MdInline {
  /**
   * CommonMark: `text`, `softbreak`, `hardbreak`, `escape`, `entity`, `code`, `emph`, `strong`,
   * `link`, `image`, `autolink`, `html`. GFM: `strikethrough`, `footnote_ref`. Obsidian: `wikilink`,
   * `embed`, `tag`, `highlight`, `math`, `comment`, `block_id`, `inline_footnote`.
   */
  readonly type: string;
  readonly from: number;
  readonly to: number;
  readonly children?: readonly MdInline[];
  /**
   * What the node stands for: an escape's or entity's character, a code span's or math's content,
   * an autolink's URL as written, a tag or block id without its `#`/`^`.
   */
  readonly value?: string;
  /** link, image, autolink: the destination, decoded and URL-normalized (absent for references). */
  readonly destination?: string;
  readonly title?: string;
  /** link, image (references), footnote_ref: the normalized label it refers to. */
  readonly label?: string;
  /** wikilink, embed: the target (`note#heading^block`) and the displayed alias (after `|`). */
  readonly target?: string;
  readonly alias?: string;
}

/** A leaf's inline text: its lines without prefixes and indentation, joined by `\n`, and where each part came from. */
export interface MdInlineText {
  readonly text: string;
  /** The source offset of offset `i` of `text` (`text.length` maps past the last part). */
  sourceAt(i: number): number;
  /** The offset in `text` of source offset `pos`, or -1 when `pos` is outside every part. */
  textAt(pos: number): number;
}

/**
 * Markup a leaf has on one of its lines: everything there that is neither its containers' prefix,
 * nor its text, nor the whitespace around them. Offsets in the document's text.
 */
export interface MdMark {
  /**
   * `open` and `close`: what a leaf starts and ends with (a heading's `#`s and closing `#`s, a fence's
   * runs, `$$` and `%%`, a callout's `[!type]`); `info`: a fence's info string; `underline`: a setext
   * heading's; `rule`: a thematic break; `task`: an item's checkbox; or an extension's.
   */
  readonly kind: string;
  readonly from: number;
  readonly to: number;
}

/** What a line is made of past its containers' prefix: its leaf's markup, and the text between it. */
export interface MdLineMarkup {
  /** In order along the line. */
  readonly marks: readonly MdMark[];
  /** The line's text: a heading's title, a paragraph's line, a code line; empty (`textFrom === textTo`) on a line of markup alone. */
  readonly textFrom: number;
  readonly textTo: number;
}
