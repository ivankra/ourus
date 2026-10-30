// The edit layer: an edit as the outline it wants, put in normal form, spelled as
// changes to the text, and checked against what the new text reads as.
//
//   const draft = new OurusDraft(doc).split(node, offset, { children: 'follow' });   // an edit, as the outline it wants
//   draft.done();                     // normal form, written, read back and checked: { doc, changes, selection }, or a refusal
//   settleSteps(doc, caret);          // the placeholders the caret left settled: each step's { doc, changes }

export { OurusDraft, type Anchor, type Applied, type AnchorSpec, type DraftResult, type ListPlace, type NodeRef, type Refusal } from './draft.ts';
export { settleSteps, type Settled } from './settle.ts';
