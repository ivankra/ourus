// The edit layer: an edit as the outline it wants, put in normal form, spelled as
// changes to the text, and checked against what the new text reads as.
//
//   const draft = new OurusDraft(doc).split(node, offset, { children: 'follow' });   // an edit, as the outline it wants
//   draft.done();                     // normal form, written, read back and checked: { doc, changes, selection }, or a refusal
//   settleSteps(doc, selection);      // the placeholders the selection left settled: each step's { doc, changes }

export { OurusDraft, listNumbering, type Applied, type AnchorSpec, type DraftResult, type NodeRef, type Refusal } from './draft.ts';
export { NormalizedDraft, type Anchor, type ListPlace } from './normalized.ts';
export type { WriteFailed } from './write.ts';
export { settleSteps, type Settled } from './settle.ts';
