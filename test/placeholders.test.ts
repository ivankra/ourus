import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executeCommand, settlePlaceholders, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { appliedText, assertApplied, executeAfter, executeOnText, parseWithMarks, allNodes, nodePlainText } from './lib/index.ts';

const shape = (d: OurusDoc) => allNodes(d).map((n) => `${'  '.repeat(n.depth - 1)}${n.kind}:${nodePlainText(d, n).replace(/\n/g, '|')}`).join('\n');
const placeholders = (d: OurusDoc) => d.marks.placeholders;

function indentNewItem(): OurusDoc {
  const doc = OurusDoc.parse('- a\n- ');
  const r = executeCommand(OurusView.of(doc), { type: 'indent' }, { anchor: 6, head: 6 });
  assert.ok(r instanceof OurusSuccess);
  return (r as OurusSuccess).view.doc;
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
  const spaced = doc.update({ changes: [{ from: 8, to: 8, insert: ' ' }] });
  assert.deepEqual(placeholders(spaced), [9]);
  assert.equal(shape(spaced), 'item:a\n  item:');
  const typed = doc.update({ changes: [{ from: 8, to: 8, insert: 'x' }] });
  assert.deepEqual(placeholders(typed), []);
  assert.equal(shape(typed), 'item:a\n  item:x');
});

test('leaving an empty child keeps it, set off by a blank line', () => {
  const doc = indentNewItem();
  assert.equal(settlePlaceholders(OurusView.of(doc), 8), null, 'the caret is still there');
  const r = settlePlaceholders(OurusView.of(doc), 1)!;
  assert.equal(r.view.doc.text, '- a\n\n  - ');
  assert.deepEqual(placeholders(r.view.doc), []);
  assert.equal(shape(r.view.doc), shape(doc));
});

test('leaving a place the text can hold just drops it', () => {
  const item = parseWithMarks('- a\n- ', [6]);
  const r1 = settlePlaceholders(OurusView.of(item), 0)!;
  assert.deepEqual(r1.changes, []);
  assert.equal(r1.view.doc.text, '- a\n- ');
  assert.deepEqual(placeholders(r1.view.doc), []);
  const para = parseWithMarks('- a\n\n', [5]);
  assert.equal(shape(para), 'item:a\nparagraph:');
  const r2 = settlePlaceholders(OurusView.of(para), 0)!;
  // (the empty paragraph goes, and the document's end with it: the item's)
  assert.equal(r2.view.doc.text, '- a\n');
  assert.equal(shape(r2.view.doc), 'item:a');
});

test('a place left at the top is removed, the list it owned in its place', () => {
  // (the one on the line below it would be inside its text: none holds there)
  const doc = parseWithMarks('\n\n- a\n', [0, 1]);
  // the empty paragraph owns the list right after it
  assert.equal(shape(doc), 'paragraph:\n  item:a');
  const r = settlePlaceholders(OurusView.of(doc), 4)!;
  assert.equal(r.view.doc.text, '- a\n');
  assert.equal(shape(r.view.doc), 'item:a');
});

test('Enter twice leaves a list, and typing makes the paragraph', () => {
  let doc = OurusDoc.parse('- a');
  let sel = { anchor: 3, head: 3 };
  for (const _ of [1, 2]) {
    const r = executeCommand(OurusView.of(doc), { type: 'enter' }, sel);
    assert.ok(r instanceof OurusSuccess);
    if (!(r instanceof OurusSuccess)) return;
    doc = r.view.doc;
    sel = { anchor: r.selection.head, head: r.selection.head };
  }
  assert.equal(doc.text, '- a\n\n');
  assert.equal(shape(doc), 'item:a\nparagraph:');
  const typed = doc.update({ changes: [{ from: sel.head, to: sel.head, insert: 'text' }] });
  assert.equal(typed.text, '- a\n\ntext');
  assert.equal(shape(typed), 'item:a\nparagraph:text');
});

test('an item\'s first word deleted, its space held, then Enter at its end: the new item lines up with its children, moved as the held space moves them', async () => {
  const { playActions: play } = await import('./lib/index.ts');
  let played: Parameters<typeof play>[0] = { view: OurusView.of(OurusDoc.parse('- x b\n  - c\n')), selection: { anchor: 3, head: 3 }, clipboard: {} };
  for (const action of ['deleteContentBackward', 'cursorLineBoundaryForward', 'enter']) played = play(played, [action]);
  assert.equal(played.view.doc.text, '-  b\n   - \n   - c\n');
  const doc = OurusDoc.parse('- x b\n  - c\n').update({ changes: [{ from: 2, to: 3, insert: '' }], caret: 2 });
  const pasted = executeCommand(OurusView.of(doc), { type: 'pastePlain', text: 'x\n\ny' }, { anchor: 4, head: 4 });
  assert.ok(pasted instanceof OurusSuccess, pasted instanceof OurusRejected ? (pasted.detail ?? '') : '');
});

test('a held last line moved to the note\'s end, with no final line break, stays held', () => {
  const shifted = executeOnText('- t\n- u', { type: 'shiftEnter' }, { caret: 3 });
  assert.equal(appliedText(executeAfter(shifted, { type: 'moveSubtreeDown' })), '- u\n- t\n  ');
});

test('a held empty paragraph stays when the node after it goes, ending the note', () => {
  const entered = executeOnText('a\n- b', { type: 'enter' }, { caret: 1 });
  assert.equal(appliedText(executeAfter(entered, { type: 'deleteSubtree', nodes: [2] })), 'a\n\n');
  const inSection = executeOnText('# h\n\n- a', { type: 'enter' }, { caret: 3 });
  assert.equal(appliedText(executeAfter(inSection, { type: 'deleteSubtree', nodes: [2] })), '# h\n');
  assert.equal(appliedText(executeOnText(' \n- a', { type: 'deleteSubtree' }, { caret: 4, placeholders: [1] })), ' ');
  assert.equal(appliedText(executeOnText('\n\n#', { type: 'deleteSubtree' }, { caret: 3, placeholders: [1] })), '\n');
});

test('an empty zoom root stays while the zoom holds it, and settles when the zoom leaves', () => {
  const zoomed = executeAfter(executeOnText('# a\n\n# b', { type: 'enter' }, { caret: 3 }), { type: 'zoomIn' });
  const selected = assertApplied(executeAfter(zoomed, { type: 'selectNode' }));
  assert.equal(settlePlaceholders(selected.view, selected.selection.head), null);
  const left = assertApplied(executeAfter(selected, { type: 'zoomOut' }));
  assert.equal(settlePlaceholders(left.view, 0)?.view.doc.text, '# a\n\n# b');
});

test('settling gives the selection after it, mapped, where the view shows it: in the zoom when the last empty node in it goes', () => {
  // (Enter at `para`'s end zoomed into `# h`, the empty paragraph selected, then settled: the host's
  // own mapping put the caret at 11, past the zoom's end, 10)
  const view = OurusView.of(OurusDoc.parse('# h\n\npara\n\n# z\n'), { zoom: 1 });
  const selected = assertApplied(executeAfter(executeCommand(view, { type: 'enter' }, { anchor: 9, head: 9 }), { type: 'selectNode' }));
  const settled = settlePlaceholders(selected.view, selected.selection)!;
  assert.equal(settled.view.doc.text, '# h\n\npara\n\n# z\n');
  assert.deepEqual(settled.selection, { anchor: 10, head: 10 });
  assert.deepEqual(settled.view.zoomRange(), { from: 0, to: 10 });
  // (a caret given alone: the selection a caret)
  const doc = indentNewItem();
  assert.deepEqual(settlePlaceholders(OurusView.of(doc), 1)!.selection, { anchor: 1, head: 1 });
});

test('an empty paragraph left between blocks nothing set apart is a blank line, the author\'s separator; elsewhere it goes', () => {
  const settle = (text: string, caret: number, type: 'enter' | 'shiftEnter' = 'enter'): string => {
    const r = assertApplied(executeOnText(text, { type }, { caret, config: { flavor: 'gfm' } }));
    return (settlePlaceholders(r.view, 0)?.view ?? r.view).doc.text;
  };
  // (a heading then a table or a paragraph, touching: one blank line kept, Enter's or Shift-Enter's)
  assert.equal(settle('## h\n| a |\n| --- |', 4), '## h\n\n| a |\n| --- |');
  assert.equal(settle('# h\np', 3), '# h\n\np');
  assert.equal(settle('# h\np', 3, 'shiftEnter'), '# h\n\np');
  // (at a section's end, before the next heading of its level, as before a deeper one)
  assert.equal(settle('# a\n# b\n', 3), '# a\n\n# b\n');
  assert.equal(settle('# a\n## b\n', 3), '# a\n\n## b\n');
  // (a blank line there already: no more; nothing after: none; a list and a quote as they were)
  assert.equal(settle('# h\n\np', 3), '# h\n\np');
  assert.equal(settle('a\n\nb', 1), 'a\n\nb');
  assert.equal(settle('p', 1), 'p\n');
  assert.equal(settle('- a\n- b', 3), '- a\n- \n- b');
});
