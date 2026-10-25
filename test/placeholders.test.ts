import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executeCommand } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { settlePlaceholders } from '../src/draft/index.ts';
import { docOf, nodesOf, plainText } from './drawing.ts';

const shape = (d: OurusDoc) => nodesOf(d).map((n) => `${'  '.repeat(n.depth - 1)}${n.kind}:${plainText(d, n).replace(/\n/g, '|')}`).join('\n');
const placeholders = (d: OurusDoc) => d.marks.points();

function indentNewItem(): OurusDoc {
  const doc = OurusDoc.parse('- a\n- ');
  const r = executeCommand(doc, { type: 'indent' }, { anchor: 6, head: 6 });
  assert.equal(r.status, 'applied');
  return (r as Extract<typeof r, { status: 'applied' }>).doc;
}

test('an indented empty item is a placeholder under its parent', () => {
  const doc = indentNewItem();
  assert.equal(doc.text, '- a\n  - ');
  assert.deepEqual(placeholders(doc), [8]);
  assert.equal(shape(doc), 'item:a\n  item:');
  // without the place, CommonMark reads the line as a setext underline
  assert.equal(shape(OurusDoc.parse(doc.text)), 'item:a');
});

test('typing into a place fills it; typing a space keeps it open', () => {
  const doc = indentNewItem();
  const spaced = doc.update([{ from: 8, to: 8, insert: ' ' }]);
  assert.deepEqual(placeholders(spaced), [9]);
  assert.equal(shape(spaced), 'item:a\n  item:');
  const typed = doc.update([{ from: 8, to: 8, insert: 'x' }]);
  assert.deepEqual(placeholders(typed), []);
  assert.equal(shape(typed), 'item:a\n  item:x');
});

test('leaving an empty child keeps it, set off by a blank line', () => {
  const doc = indentNewItem();
  assert.equal(settlePlaceholders(doc, 8), null, 'the caret is still there');
  const r = settlePlaceholders(doc, 1)!;
  assert.equal(r.doc.text, '- a\n\n  - ');
  assert.deepEqual(placeholders(r.doc), []);
  assert.equal(shape(r.doc), shape(doc));
});

test('leaving a place the text can hold just drops it', () => {
  const item = docOf('- a\n- ', [6]);
  const r1 = settlePlaceholders(item, 0)!;
  assert.deepEqual(r1.changes, []);
  assert.equal(r1.doc.text, '- a\n- ');
  assert.deepEqual(placeholders(r1.doc), []);
  const para = docOf('- a\n\n', [5]);
  assert.equal(shape(para), 'item:a\nparagraph:');
  const r2 = settlePlaceholders(para, 0)!;
  // (the empty paragraph goes, and the document's end with it: the item's)
  assert.equal(r2.doc.text, '- a\n');
  assert.equal(shape(r2.doc), 'item:a');
});

test('a place left at the top is removed, the list it owned in its place', () => {
  // (the one on the line below it would be inside its text: none holds there)
  const doc = docOf('\n\n- a\n', [0, 1]);
  // the empty paragraph owns the list right after it
  assert.equal(shape(doc), 'paragraph:\n  item:a');
  const r = settlePlaceholders(doc, 4)!;
  assert.equal(r.doc.text, '- a\n');
  assert.equal(shape(r.doc), 'item:a');
});

test('Enter twice leaves a list, and typing makes the paragraph', () => {
  let doc = OurusDoc.parse('- a');
  let sel = { anchor: 3, head: 3 };
  for (const _ of [1, 2]) {
    const r = executeCommand(doc, { type: 'enter' }, sel);
    assert.equal(r.status, 'applied');
    if (r.status !== 'applied') return;
    doc = r.doc;
    sel = { anchor: r.selection.head, head: r.selection.head };
  }
  assert.equal(doc.text, '- a\n\n');
  assert.equal(shape(doc), 'item:a\nparagraph:');
  const typed = doc.update([{ from: sel.head, to: sel.head, insert: 'text' }]);
  assert.equal(typed.text, '- a\n\ntext');
  assert.equal(shape(typed), 'item:a\nparagraph:text');
});
