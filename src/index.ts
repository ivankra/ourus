// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OutlineState, type OutlineUpdateParams, type OutlineKind, type OutlineNode } from './outline/index.ts';
export { Config } from './config.ts';
export { executeCommand, settlePlaceholders, type Clipboard, type Command, type RejectReason, type CommandResult, type Selection } from './commands/index.ts';
export * from './parser/index.ts';
export { applyChanges, invertChanges, mapPos, type ChangeSpec } from './text.ts';
