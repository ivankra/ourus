// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OurusDoc, OutlineNode, ProseText, AtomText, type OutlineNodeText, type DocUpdateParams } from './doc/index.ts';
export { settlePlaceholders } from './draft/index.ts';
export { Config } from './config.ts';
export { executeCommand, leavesZoom, nearestDropPoint, type Clipboard, type Command, type DropMap, type DropPoint, type DropSeam, type InsertionPoint, type RejectReason, type CommandResult, type Selection } from './commands/index.ts';
export * from './parser/index.ts';
export { applyChanges, invertChanges, mapPos, createPlaceholder, type ChangeSpec, type Mark } from './text/index.ts';
