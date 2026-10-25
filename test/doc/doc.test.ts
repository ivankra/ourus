import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc } from '../../src/doc/index.ts';
import { createPlaceholder, isEmptyNodePlaceholder, type Mark } from '../../src/text/index.ts';

// (one kind of mark: an empty node's or a held space's by where it is)
const empty = (p: number): Mark => createPlaceholder(p);
const held = (p: number): Mark => createPlaceholder(p);
const kept = (doc: OurusDoc): string[] => doc.marks.marks.map((m) => `${isEmptyNodePlaceholder(m, doc.text) ? 'empty-node' : 'held-space'}@${m.from}`);

test('an empty line holds where its line has no text past its prefix, a checkbox on an item\'s first line included', () => {
  assert.deepEqual(kept(OurusDoc.parse('- a\n- ', { marks: [empty(6)] })), ['empty-node@6']);
  assert.deepEqual(kept(OurusDoc.parse('> \n', { marks: [empty(2)] })), ['empty-node@2']);
  assert.deepEqual(kept(OurusDoc.parse('\n', { marks: [empty(1)] })), ['empty-node@1'], 'the empty last line, after the final line ending');
  assert.deepEqual(kept(OurusDoc.parse('a\n', { marks: [empty(2)] })), [], 'a line inside a text: Markdown holds no empty one there');
  assert.deepEqual(kept(OurusDoc.parse('- [ ] ', { marks: [empty(6)] })), ['empty-node@6']);
  assert.deepEqual(kept(OurusDoc.parse('- a', { marks: [empty(3)] })), [], 'the line has text');
  assert.deepEqual(kept(OurusDoc.parse('-', { marks: [empty(1)] })), [], 'no marker without its space');
  assert.deepEqual(kept(OurusDoc.parse('> [ ] ', { marks: [empty(6)] })), [], 'a checkbox only in an item');
  assert.deepEqual(kept(OurusDoc.parse('- a ', { marks: [empty(3)] })), [], 'not at the line\'s end');
});

test('a held space holds on a space that starts its line\'s text, with text after it, under any containers', () => {
  assert.deepEqual(kept(OurusDoc.parse('-  x', { marks: [held(2)] })), ['held-space@2']);
  assert.deepEqual(kept(OurusDoc.parse('-  ', { marks: [held(2)] })), [], 'no text after it');
  assert.deepEqual(kept(OurusDoc.parse('- a x', { marks: [held(3)] })), [], 'mid-line');
  // under any containers: an item's marker and a quote's `>` before it
  const nested = OurusDoc.parse('- >  # h', { marks: [held(4)] });
  assert.deepEqual(kept(nested), ['held-space@4']);
  const quote = nested.mdTree.root.children[0]!.children[0]!.children[0]!;
  assert.equal(quote.children[0]!.type, 'paragraph', 'the held space keeps `# h` text');
});

test('a mark moves through changes, and expires where it no longer holds', () => {
  const doc = OurusDoc.parse('- a\n- ', { marks: [empty(6)] });
  assert.deepEqual(kept(doc.update([{ from: 6, to: 6, insert: ' ' }])), ['empty-node@7'], 'a space typed keeps the line empty');
  assert.deepEqual(kept(doc.update([{ from: 6, to: 6, insert: 'x' }])), [], 'text typed fills it');
  // an empty line's mark, moved past what is typed there, holds nothing: the line has text
  const spaced = OurusDoc.parse('- \n', { marks: [empty(2)] }).update([{ from: 2, to: 2, insert: ' x' }]);
  assert.deepEqual(kept(spaced), []);
});

test('an update drops and adds marks, or sets them whole', () => {
  const doc = OurusDoc.parse('- a\n- \n- ', { marks: [empty(6), empty(9)] });
  assert.deepEqual(kept(doc.update([], { dropMarks: [empty(6)] })), ['empty-node@9']);
  assert.deepEqual(kept(doc.update([{ from: 0, to: 0, insert: 'x\n\n' }], { dropMarks: [empty(9)], addMarks: [empty(2), empty(1)] })), ['empty-node@9'], 'the one added at the end of `x` expires, as does the one on the line below it, inside its text');
  assert.deepEqual(kept(doc.update([], { setMarks: [] })), []);
  assert.deepEqual(kept(doc.update([], { setMarks: [empty(9)] })), ['empty-node@9']);
});

test('a mark that expires is read out of the parse too', () => {
  // `- ` under text reads as a setext underline without its placeholder
  const doc = OurusDoc.parse('a\n- ', { marks: [empty(4)] });
  assert.equal(doc.mdTree.root.children[0]!.type, 'paragraph');
  // (one at the end of `a`, a line with text, expires)
  const without = doc.update([], { setMarks: [empty(1)] });
  assert.deepEqual(kept(without), []);
  assert.equal(without.mdTree.root.children[0]!.type, 'heading');
});

test('a replaced text brings its own placeholders, the ones that hold', () => {
  const doc = OurusDoc.parse('- a\n', { marks: [empty(4)] });
  const next = doc.replace('- a\n- \n- b', [empty(6), empty(10)]);
  assert.equal(next.text, '- a\n- \n- b');
  assert.deepEqual(kept(next), ['empty-node@6'], 'the one at the end of `- b` expires; the old one is gone');
});
