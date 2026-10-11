import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execute, settle } from '../src/commands.ts';
import { Doc } from '../src/doc.ts';

const shape = (d: Doc) => d.nodes.slice(1).map((n) => `${'  '.repeat(n.depth - 1)}${n.kind}:${d.headLines(n).join('|').trim()}`).join('\n');

function indentNewItem(): Doc {
  const doc = Doc.parse('- a\n- ');
  const r = execute(doc, { type: 'formatIndent' }, { anchor: 6, head: 6 });
  assert.equal(r.status, 'applied');
  return (r as Extract<typeof r, { status: 'applied' }>).doc;
}

test('an indented empty item is a provisional place under its parent', () => {
  const doc = indentNewItem();
  assert.equal(doc.text, '- a\n  - ');
  assert.deepEqual(doc.provisional, [8]);
  assert.equal(shape(doc), 'item:a\n  item:');
  // without the place, CommonMark reads the line as a setext underline
  assert.equal(shape(Doc.parse(doc.text)), 'item:a');
});

test('typing into a place fills it; typing a space keeps it open', () => {
  const doc = indentNewItem();
  const spaced = doc.apply([{ from: 8, to: 8, insert: ' ' }]);
  assert.deepEqual(spaced.provisional, [9]);
  assert.equal(shape(spaced), 'item:a\n  item:');
  const typed = doc.apply([{ from: 8, to: 8, insert: 'x' }]);
  assert.deepEqual(typed.provisional, []);
  assert.equal(shape(typed), 'item:a\n  item:x');
});

test('leaving an empty place removes it when the text cannot hold it', () => {
  const doc = indentNewItem();
  assert.equal(settle(doc, 8), null, 'the caret is still there');
  const r = settle(doc, 1)!;
  assert.equal(r.doc.text, '- a');
  assert.deepEqual(r.doc.provisional, []);
  assert.equal(shape(r.doc), 'item:a');
});

test('leaving a place the text can hold just drops it', () => {
  const item = Doc.parse('- a\n- ', { provisional: [6] });
  const r1 = settle(item, 0)!;
  assert.deepEqual(r1.changes, []);
  assert.equal(r1.doc.text, '- a\n- ');
  assert.deepEqual(r1.doc.provisional, []);
  const para = Doc.parse('- a\n\n', { provisional: [5] });
  assert.equal(shape(para), 'item:a\nparagraph:');
  const r2 = settle(para, 0)!;
  assert.equal(r2.doc.text, '- a\n\n');
  assert.equal(shape(r2.doc), 'item:a');
});

test('places left on adjacent lines at the top are removed together', () => {
  const doc = Doc.parse('\n\n- a\n', { provisional: [0, 1] });
  assert.equal(shape(doc), 'paragraph:|\nitem:a');
  const r = settle(doc, 4)!;
  assert.equal(r.doc.text, '- a\n');
  assert.equal(shape(r.doc), 'item:a');
});

test('Enter twice leaves a list, and typing makes the paragraph', () => {
  let doc = Doc.parse('- a');
  let sel = { anchor: 3, head: 3 };
  for (const _ of [1, 2]) {
    const r = execute(doc, { type: 'insertParagraph' }, sel);
    assert.equal(r.status, 'applied');
    if (r.status !== 'applied') return;
    doc = r.doc;
    sel = { anchor: r.selection.head, head: r.selection.head };
  }
  assert.equal(doc.text, '- a\n\n');
  assert.equal(shape(doc), 'item:a\nparagraph:');
  const typed = doc.apply([{ from: sel.head, to: sel.head, insert: 'text' }]);
  assert.equal(typed.text, '- a\n\ntext');
  assert.equal(shape(typed), 'item:a\nparagraph:text');
});
