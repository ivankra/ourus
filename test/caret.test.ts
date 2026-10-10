import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homePosition } from '../src/commands.ts';
import { Doc } from '../src/doc.ts';

/** Presses Home from the `┃` caret, returning the drawing with the caret where it lands. */
function home(drawn: string): string {
  const pos = drawn.indexOf('┃');
  const text = drawn.replace('┃', '');
  const to = homePosition(Doc.parse(text), pos);
  return text.slice(0, to) + '┃' + text.slice(to);
}

test('Home goes to the start of the text, then the start of the line', () => {
  assert.equal(home('- one two┃'), '- ┃one two');
  assert.equal(home('- ┃one two'), '┃- one two');
  assert.equal(home('┃- one two'), '- ┃one two');
  assert.equal(home('-┃ one'), '- ┃one');
});

test('Home skips nesting, ordered markers, task boxes and heading marks', () => {
  assert.equal(home('- a\n  - b┃'), '- a\n  - ┃b');
  assert.equal(home('- a\n\t- b┃'), '- a\n\t- ┃b');
  assert.equal(home('10. ten┃'), '10. ┃ten');
  assert.equal(home('- [ ] task┃'), '- [ ] ┃task');
  assert.equal(home('- [x] done┃'), '- [x] ┃done');
  assert.equal(home('## Title┃'), '## ┃Title');
  assert.equal(home('> quote┃'), '> ┃quote');
});

test('on continuation lines Home goes to the text, past the item indentation', () => {
  assert.equal(home('- one\n  two┃'), '- one\n  ┃two');
  assert.equal(home('- one\n  ┃two'), '- one\n┃  two');
  assert.equal(home('para\nmore┃'), 'para\n┃more');
});
