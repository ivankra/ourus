// The text layer, the bottom of ourus, with no Markdown in it but its whitespace: changes to a text
// and positions through them (`changes.ts`), lines, columns and whitespace (`lines.ts`), and marks on
// a text that move with its changes (`marks.ts`: offsets, one list per kind, with the text they are on).

export { ChangeIndex, ChangeSet, applyChanges, composeChanges, diffLines, invertChanges, mapPos, normalizeChanges, type ChangeSpec, type OurusSelection } from './changes.ts';
export * from './lines.ts';
export * from './coords.ts';
export { largest, pushAll, spliceIn } from './arrays.ts';
export { MarkError, MarkSet, type MarkLists } from './marks.ts';
