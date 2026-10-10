// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { Doc, type ApplyOptions } from './doc.ts';
export { execute, homePosition, settle, type Command, type RejectReason, type Result, type Selection } from './commands.ts';
export type { OutlineKind, OutlineNode } from './outline.ts';
export { parseCommonMark } from './syntax/commonmark.ts';
export type { Block, BlockType, LineInfo, ListData, PrefixPiece, SyntaxTree } from './syntax/types.ts';
export { applyChanges, invertChanges, mapPos, type Change } from './text.ts';
