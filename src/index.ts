// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OutlineDoc, type OutlineDocApplyParams } from './doc.ts';
export { configOf, defaultConfig, readConfig, readSettings, type Config } from './config.ts';
export { execute, homePosition, settle, textStart, type Command, type RejectReason, type Result, type Selection } from './commands.ts';
export type { OutlineKind, OutlineNode } from './outline.ts';
export * from './parsing/index.ts';
export { applyChanges, invertChanges, mapPos, type TextChange } from './text.ts';
