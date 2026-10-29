// The text layer, the bottom of ourus, with no Markdown in it but its whitespace: changes to a text
// and positions through them (`changes.ts`), lines, columns and whitespace (`lines.ts`), and marks on
// a text that move with its changes (`marks.ts`, whose kinds are defined there and nowhere else).

export { ChangeIndex, ChangeSet, applyChanges, composeChanges, diffLines, invertChanges, mapPos, normalizeChanges, type ChangeSpec, type OurusSelection } from './changes.ts';
export * from './lines.ts';
export { MarkSet, AUTO_CLOSED_MARK, AUTO_WHITESPACE_MARK, PLACEHOLDER_MARK, createPlaceholder, emptyNodeAt, heldSpaceAt, isEmptyNodePlaceholder, isHeldSpacePlaceholder, isPlaceholder, type Mark } from './marks.ts';
