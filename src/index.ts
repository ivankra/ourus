// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OurusDoc, OurusNode, OurusProse, OurusAtom, type OurusText, type OurusDocUpdate } from './doc/index.ts';
export { settlePlaceholders } from './writer/index.ts';
export { OurusConfig } from './config.ts';
export { executeCommand, leavesZoom, nearestDropPoint, type OurusCommand, type OurusCommandResult, type OurusClipboard, type OurusSelection, type RejectReason, type DropMap, type DropPoint, type DropSeam, type InsertionPoint } from './commands/index.ts';
export * from './parser/index.ts';
export { applyChanges, invertChanges, mapPos, createPlaceholder, type ChangeSpec, type Mark } from './text/index.ts';
