import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executeCommand, settlePlaceholders } from '../src/commands/index.ts';
import { OutlineState } from '../src/outline/index.ts';

const shape = (d: OutlineState) => d.nodes.slice(1).map((n) => `${'  '.repeat(n.depth - 1)}${n.kind}:${d.headLines(n).join('|').trim()}`).join('\n');

function indentNewItem(): OutlineState {
  const doc = OutlineState.parse('- a\n- ');
  const r = executeCommand(doc, { type: 'indent' }, { anchor: 6, head: 6 });
  assert.equal(r.status, 'applied');
  return (r as Extract<typeof r, { status: 'applied' }>).state;
}

test('an indented empty item is a placeholder under its parent', () => {
  const doc = indentNewItem();
  assert.equal(doc.text, '- a\n  - ');
  assert.deepEqual(doc.placeholders, [8]);
  assert.equal(shape(doc), 'item:a\n  item:');
  // without the place, CommonMark reads the line as a setext underline
  assert.equal(shape(OutlineState.parse(doc.text)), 'item:a');
});

test('typing into a place fills it; typing a space keeps it open', () => {
  const doc = indentNewItem();
  const spaced = doc.update([{ from: 8, to: 8, insert: ' ' }]);
  assert.deepEqual(spaced.placeholders, [9]);
  assert.equal(shape(spaced), 'item:a\n  item:');
  const typed = doc.update([{ from: 8, to: 8, insert: 'x' }]);
  assert.deepEqual(typed.placeholders, []);
  assert.equal(shape(typed), 'item:a\n  item:x');
});

test('leaving an empty child keeps it, set off by a blank line', () => {
  const doc = indentNewItem();
  assert.equal(settlePlaceholders(doc, 8), null, 'the caret is still there');
  const r = settlePlaceholders(doc, 1)!;
  assert.equal(r.state.text, '- a\n\n  - ');
  assert.deepEqual(r.state.placeholders, []);
  assert.equal(shape(r.state), shape(doc));
});

test('leaving a place the text can hold just drops it', () => {
  const item = OutlineState.parse('- a\n- ', { placeholders: [6] });
  const r1 = settlePlaceholders(item, 0)!;
  assert.deepEqual(r1.changes, []);
  assert.equal(r1.state.text, '- a\n- ');
  assert.deepEqual(r1.state.placeholders, []);
  const para = OutlineState.parse('- a\n\n', { placeholders: [5] });
  assert.equal(shape(para), 'item:a\nparagraph:');
  const r2 = settlePlaceholders(para, 0)!;
  assert.equal(r2.state.text, '- a\n\n');
  assert.equal(shape(r2.state), 'item:a');
});

test('places left on adjacent lines at the top are removed together', () => {
  const doc = OutlineState.parse('\n\n- a\n', { placeholders: [0, 1] });
  // the empty paragraph owns the list right after it
  assert.equal(shape(doc), 'paragraph:|\n  item:a');
  const r = settlePlaceholders(doc, 4)!;
  assert.equal(r.state.text, '- a\n');
  assert.equal(shape(r.state), 'item:a');
});

test('Enter twice leaves a list, and typing makes the paragraph', () => {
  let doc = OutlineState.parse('- a');
  let sel = { anchor: 3, head: 3 };
  for (const _ of [1, 2]) {
    const r = executeCommand(doc, { type: 'enter' }, sel);
    assert.equal(r.status, 'applied');
    if (r.status !== 'applied') return;
    doc = r.state;
    sel = { anchor: r.selection.head, head: r.selection.head };
  }
  assert.equal(doc.text, '- a\n\n');
  assert.equal(shape(doc), 'item:a\nparagraph:');
  const typed = doc.update([{ from: sel.head, to: sel.head, insert: 'text' }]);
  assert.equal(typed.text, '- a\n\ntext');
  assert.equal(shape(typed), 'item:a\nparagraph:text');
});
