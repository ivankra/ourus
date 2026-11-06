// The kinds of number that say where something is, each its own type: a document's offsets, a node's
// text's, a line's, line indices, columns, node ids. A branded number reads as a number for free; a
// plain number becomes one only through its function here, where arithmetic made it. Widths, counts
// and indices into any other string stay plain numbers.

declare const brand: unique symbol;
type Brand<B extends string> = number & { readonly [brand]: B };

/** An offset into a document's text (UTF-16): `MdLine.from`, a change's `from`, a selection's ends. */
export type DocPos = Brand<'DocPos'>;
/** An offset into a node's text (`OurusText.text`, its frame included): an anchor's `offset`. */
export type LocalOffset = Brand<'LocalOffset'>;
/** An offset from a line's start: an item's `markerStart` and `markerEnd`, a table cell's `start`. */
export type LineOffset = Brand<'LineOffset'>;
/** A line of a document, from 0: `MdLine.index`, `node.startLine`. */
export type LineIndex = Brand<'LineIndex'>;
/** A visual column, from 0, a tab to the next stop of 4: not an index into the line's string. */
export type ColumnIndex = Brand<'ColumnIndex'>;
/** A node's id. */
export type NodeId = Brand<'NodeId'>;

export const docPos = (n: number): DocPos => n as DocPos;
export const localOffset = (n: number): LocalOffset => n as LocalOffset;
export const lineOffset = (n: number): LineOffset => n as LineOffset;
export const lineIndex = (n: number): LineIndex => n as LineIndex;
export const columnIndex = (n: number): ColumnIndex => n as ColumnIndex;
export const nodeId = (n: number): NodeId => n as NodeId;

/** An id no node has: a stored node's before its document gives it one, a key that finds nothing. */
export const NO_NODE = nodeId(-1);

/** Where offset `k` from a line's start is in the document. */
export const atLine = (line: { readonly from: DocPos }, k: LineOffset): DocPos => (line.from + k) as DocPos;
