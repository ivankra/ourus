// Node labels (`①`, spec/README.md): taken out of a drawing, bound to the nodes they name as a case
// goes, and checked.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { drawLabels, labelGlyph, labelNumber, readDrawing, readLabels } from './drawing.ts';
import { run } from './spec-run.ts';
import { readSpec } from './specfile.ts';

/** A case of one step, its start and its step's buffer drawn as given. */
const one = (start: string, actions: string, then: string): void => {
  const [t] = readSpec('x.md', ['## X1', '', '```yaml', 'tags: rare', '```', '', '```buffer', start, '```', '', `> ${actions}`, '', '```buffer', then, '```', ''].join('\n'));
  run(t!, 'gfm');
};

test('a label is no part of the text, last on its line, numbered 1 to 50', () => {
  assert.deepEqual(readDrawing('- a┃①\n- b②\n').text, '- a\n- b\n');
  assert.deepEqual([...readDrawing('- a┃①\n- b②\n').labels], [[0, [1]], [1, [2]]]);
  assert.deepEqual([...readLabels('> a①②␍\n').labels], [[0, [1, 2]]], 'two, and before a CR');
  assert.equal(readLabels('> a①②␍\n').drawn, '> a␍\n');
  assert.throws(() => readLabels('- ①a\n'), /last on its line/);
  for (const n of [1, 20, 21, 35, 36, 50]) assert.equal(labelNumber(labelGlyph(n)), n);
  assert.deepEqual([labelGlyph(1), labelGlyph(21), labelGlyph(50)], ['①', '㉑', '㊿']);
  assert.equal(drawLabels('- a\n- b␍\n', new Map([[1, [3]]])), '- a\n- b③␍\n');
});

test('a step checks the labels it draws: the same node, or a new one it made', () => {
  one('- a┃b①', 'enter', '- a①\n- ┃b②');
  assert.throws(() => one('- a┃b①', 'enter', '- a②\n- ┃b①'), /labels/, 'the first half keeps the node, not the second');
  assert.throws(() => one('- a①\n- ┃b②', 'deleteContentBackward', '- a┃b②'), /labels/, 'the joined node goes');
  assert.throws(() => one('- a\n- ┃b②', 'deleteContentBackward', '- a┃b③'), /labels/, "a new label on a node the step didn't make");
  assert.throws(() => one('- a①\n- ┃b', 'deleteContentBackward', '- a┃b①②'), /labels/, 'more labels than nodes on the line');
});

test('one label names the innermost node starting on its line, a second the one outside it', () => {
  one('> - a┃①②', 'shiftEnter', '> - a①②\n>   ┃');
  assert.throws(() => one('> - a┃①', 'shiftEnter', '> - a②\n>   ┃'), /labels/);
});

test("an undo is the host's: the text back, its nodes' ids as an update carries them, so a line it rewrites is a new node", () => {
  const steps = (undone: string): string[] => ['## X1', '', '```yaml', 'tags: rare', '```', '', '```buffer', '- a┃b①', '```', '', '> enter', '', '```buffer', '- a①', '- ┃b②', '```', '', '> undo', '', '```buffer', undone, '```', ''];
  const [t] = readSpec('x.md', steps('- a┃b③').join('\n'));
  run(t!, 'gfm');
  const [kept] = readSpec('x.md', steps('- a┃b①').join('\n'));
  assert.throws(() => run(kept!, 'gfm'), /labels/, "the split's undo writes `- ab` again: no longer node ①");
});
