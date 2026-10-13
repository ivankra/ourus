// The syntax layer's public types: a lossless line table, a block tree over it, and inline nodes over
// each leaf's text. Positions are UTF-16 offsets into the document's text; lines are 0-based.

import type { LineEnding } from '../text.ts';

export interface ListData {
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
export interface TaskMarker {
  readonly checked: boolean;
  /** The character in the brackets (a space when unchecked). */
  readonly status: string;
  /** The checkbox, brackets included, in offsets from its line's start. */
  readonly start: number;
  readonly end: number;
}

/** An Obsidian callout, `> [!type]± title`, on its quote. */
export interface Callout {
  /** The type as written (`note`, `Warning`). */
  readonly kind: string;
  /** `+` (open) or `-` (folded) after the type, if any. */
  readonly fold: '+' | '-' | null;
}

export type TableAlign = 'left' | 'center' | 'right' | null;

/**
 * A block. Containers (the document, quotes, lists, items, footnote definitions) hold blocks; leaves
 * (paragraphs, headings, code, HTML, ...) hold lines, and some hold parts (a table's rows, a row's
 * cells). Which attributes are set depends on `type`.
 *
 * A block holds line numbers and columns, and offsets only from its line's start (`…Start`,
 * `…End`): no absolute offset, so an edit that leaves the structure as it was reuses the blocks.
 * The snapshot gives offsets in the text (`Syntax.markerFrom`, `Syntax.offset`).
 */
export interface Block {
  /**
   * CommonMark: `document`, `blockquote`, `list`, `item`, `paragraph`, `heading`, `thematic_break`,
   * `code_block`, `html_block`, `refdef` (a link reference definition, split off its paragraph).
   * GFM: `table` (its parts: `table_row`, `table_cell`), `footnote_definition`.
   * Obsidian: `frontmatter`, `callout_title`, `math_block`, `comment_block`.
   */
  readonly type: string;
  /** First line. */
  readonly startLine: number;
  /** Last line, inclusive. Blank lines after a block's last content line are not part of it. */
  readonly endLine: number;
  readonly children: readonly Block[];
  readonly parent: Block | null;

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
  readonly list?: ListData;
  /** list: tight, as CommonMark defines it. */
  readonly tight?: boolean;
  /** item: the marker itself (`-`, `1.`), in offsets from its first line's start. */
  readonly markerStart?: number;
  readonly markerEnd?: number;
  /** item: columns of the marker and of the item's content on its first line. */
  readonly markerColumn?: number;
  readonly contentColumn?: number;
  /** item (GFM): its task checkbox. */
  readonly task?: TaskMarker;
  /** refdef, footnote_definition: the label as written, brackets included (`[a]`, `[^a]`). */
  readonly label?: string;
  /** table: the columns' alignment. */
  readonly align?: readonly TableAlign[];
  /** table_row: `header`, `delimiter` (the alignment row) or `body`. */
  readonly row?: 'header' | 'delimiter' | 'body';
  /** table_cell: the cell's text, without the pipes around it or its padding, in offsets from its line's start. */
  readonly start?: number;
  readonly end?: number;
  /** table_cell: its column, from 0. */
  readonly column?: number;
  /** blockquote (Obsidian): a callout. */
  readonly callout?: Callout;
}

/**
 * The part of a line a container consumed: a quote's `>` (and an optional space), an item's
 * indentation, marker and padding on its first line or its indentation on later ones.
 */
export interface PrefixPiece {
  readonly block: Block;
  /** `quote`, `marker`, `indent`, or an extension's (`footnote`, for a footnote definition's label). */
  readonly kind: string;
  readonly from: number;
  readonly to: number;
  readonly fromColumn: number;
  readonly toColumn: number;
  /** The piece ends inside a tab: the container consumed part of the tab at `to`, up to `toColumn`. */
  readonly partialTab: boolean;
}

export interface LineInfo {
  readonly index: number;
  readonly from: number;
  /** End of the line's text, before its line ending. */
  readonly to: number;
  readonly ending: LineEnding;
  /** Container pieces, outermost first. */
  readonly prefix: readonly PrefixPiece[];
  /** Where the line's content starts after the prefix pieces. */
  readonly contentFrom: number;
  readonly contentColumn: number;
  /** The containers the line is in, outermost first (the document excluded). */
  readonly containers: readonly Block[];
  /** The innermost container (the document when none). */
  readonly container: Block;
  /** The leaf block the line belongs to, or null (blank lines, lines of container markers only). */
  readonly leaf: Block | null;
  /** The line continued a paragraph lazily: some enclosing containers didn't match it. */
  readonly lazy: boolean;
  /** Only whitespace on the whole line. */
  readonly blank: boolean;
  /** Only whitespace after the prefix pieces. */
  readonly empty: boolean;
}

/**
 * An inline node. Positions are offsets into the leaf's inline text (`InlineText.text`); a node's
 * range covers its markup (`**`, `[`…`](url)`), its children's ranges lie inside it, and the parts
 * of a node's range outside every child are its markup.
 */
export interface Inline {
  /**
   * CommonMark: `text`, `softbreak`, `hardbreak`, `escape`, `entity`, `code`, `emph`, `strong`,
   * `link`, `image`, `autolink`, `html`. GFM: `strikethrough`, `footnote_ref`. Obsidian: `wikilink`,
   * `embed`, `tag`, `highlight`, `math`, `comment`, `block_id`, `inline_footnote`.
   */
  readonly type: string;
  readonly from: number;
  readonly to: number;
  readonly children?: readonly Inline[];
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
export interface InlineText {
  readonly text: string;
  /** The source offset of offset `i` of `text` (`text.length` maps past the last part). */
  sourceAt(i: number): number;
  /** The offset in `text` of source offset `pos`, or -1 when `pos` is outside every part. */
  textAt(pos: number): number;
}
