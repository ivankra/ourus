// How a text app's document compares with the spec's (text.ts): spaces that leave the document the same.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareTexts, readTextDoc } from './text.ts';

const compare = (want: string, got: string): string => compareTexts(readTextDoc(want), readTextDoc(got));

test('spaces that leave the document as ourus reads it the same are spaces; others are a difference', () => {
  // spaces before a line break
  assert.equal(compare('- a┃\n', '- a ┃\n'), 'whitespace');
  // a continuation line's indentation, a lazy line, a marker's padding
  assert.equal(compare('- one two\n  ┃three\n', '- one two\n  ┃ three\n'), 'whitespace');
  assert.equal(compare('- ax\n  y\n  ┃b\n', '- ax\ny\n┃b\n'), 'whitespace');
  assert.equal(compare('- one\n- ┃three\n', '- one\n- ┃ three\n'), 'whitespace');
  // indentation that changes the nesting, and a code line's, which is its text
  assert.equal(compare('- a\n- ┃b\n', '- a\n  - ┃b\n'), 'disagree');
  assert.equal(compare('- c\n  ```\n  a = 1\n    b = 2┃\n  ```\n', '- c\n  ```\n  a = 1\n  b = 2┃\n  ```\n'), 'disagree');
  // and a space inside a line's text
  assert.equal(compare('one two┃\n', 'onetwo┃\n'), 'disagree');
});

test('a subtree selection in another whole-line shape or direction is the same selection: the same nodes selected whole', () => {
  // true-outliner's cover ends before the last line's break, ourus's at the next line's start
  assert.equal(compare('- a\n«- b\n  - c\n»- d\n', '- a\n«- b\n  - c»\n- d\n'), 'agree');
  assert.equal(compare('- a\n┃«- b\n  - c\n»- d\n', '- a\n«- b\n  - c»\n- d\n'), 'agree');
  // other nodes, or text: the caret's verdict still
  assert.equal(compare('- a\n«- b\n  - c\n»- d\n', '- a\n«- b»\n  - c\n- d\n'), 'caret');
  assert.equal(compare('- «a»\n- b\n', '- «a\n»- b\n'), 'caret');
});
