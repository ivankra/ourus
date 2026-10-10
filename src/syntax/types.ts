// The block syntax layer: a lossless line table plus a block tree over it.

import type { LineEnding } from '../text.ts';

export type BlockType =
  | 'document'
  | 'blockquote'
  | 'list'
  | 'item'
  | 'paragraph'
  | 'heading'
  | 'thematic_break'
  | 'code_block'
  | 'html_block'
  /** A link reference definition, split off the paragraph it was written in. */
  | 'refdef';

export interface ListData {
  readonly type: 'bullet' | 'ordered';
  /** `-`, `+` or `*` for bullet lists. */
  readonly bulletChar: string | null;
  /** `.` or `)` for ordered lists. */
  readonly delimiter: string | null;
  /** Start number for ordered lists. */
  readonly start: number | null;
  /** Columns between the container's content start and the marker (0–3). */
  readonly markerOffset: number;
  /** Columns from the marker's start to the item's content column. */
  readonly padding: number;
}

export interface Block {
  readonly type: BlockType;
  /** First line (0-based). */
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
  /** code_block: the raw info string (unescaped not applied). */
  readonly info?: string;
  /** html_block: the CommonMark HTML block kind, 1–7. */
  readonly htmlType?: number;
  /** list and item. For a list, the data of its first item. */
  readonly list?: ListData;
  /** list: tight per CommonMark. */
  readonly tight?: boolean;
  /** item: offsets of the marker itself (`-`, `1.`) on its first line. */
  readonly markerFrom?: number;
  readonly markerTo?: number;
  /** item: absolute column of the marker and of the item's content. */
  readonly markerColumn?: number;
  readonly contentColumn?: number;
  /** refdef: the label as written, including brackets. */
  readonly label?: string;
}

/**
 * The part of a line a container consumed: a quote's `>` (plus an optional space), an item's
 * indentation and marker plus padding on its first line, or its continuation indentation.
 */
export interface PrefixPiece {
  readonly block: Block;
  readonly from: number;
  readonly to: number;
  readonly fromColumn: number;
  readonly toColumn: number;
  /**
   * The piece ends inside a tab: the tab at `to` was partly consumed by this container.
   * `toColumn` is where the container's consumption ends.
   */
  readonly partialTab: boolean;
}

export interface LineInfo {
  readonly index: number;
  readonly from: number;
  /** End of content, excluding the line ending. */
  readonly to: number;
  readonly ending: LineEnding;
  /** Container pieces, outermost first. Empty for lines in no container but the document. */
  readonly prefix: readonly PrefixPiece[];
  /** Offset and column where the line's content starts after all prefix pieces. */
  readonly contentFrom: number;
  readonly contentColumn: number;
  /** The innermost container this line was matched into (the document, a quote or an item). */
  readonly container: Block;
  /** The leaf block this line belongs to, or null for blank or prefix-only lines. */
  readonly leaf: Block | null;
  /** The line continued a paragraph lazily: some enclosing containers did not match. */
  readonly lazy: boolean;
  readonly blank: boolean;
}

export interface SyntaxTree {
  readonly text: string;
  readonly root: Block;
  readonly lines: readonly LineInfo[];
}
