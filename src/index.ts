// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OurusConfig } from './config.ts';
export { OurusDoc, OurusNode, OurusProse, OurusAtom, type OurusText, type OurusDocUpdate, type BlockId, type BlockIdTarget, type BlockIdStray } from './doc/index.ts';
export { OurusView, type OurusViewState } from './view/index.ts';
export { executeCommand, leavesZoom, settlePlaceholders, nearestDropPoint, OurusSuccess, OurusRejected, OurusDeferred, type OurusCommand, type OurusResult, type OurusClipboard, type OurusSelection, type RejectReason, type DropMap, type DropPoint, type DropSeam, type InsertionPoint } from './commands/index.ts';
export { applyChanges, invertChanges, mapPos, MarkError, MarkSet, type ChangeSpec, type MarkLists } from './text/index.ts';
export * from './parser/index.ts';
