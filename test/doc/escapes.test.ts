// A text's escapes where it is: what the parser is asked, from the text's type and frame.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { escapeParagraph } from '../../src/doc/index.ts';
import { MdFlavor } from '../../src/parser/index.ts';

test('past a frame, the first line\'s rest is text whatever it starts with; the lines after continue it', () => {
  const gfm = MdFlavor.gfm;
  assert.deepEqual(escapeParagraph(gfm, 'paragraph', true, ['[ ] ## Title'], [false])!.markup, [], 'a task\'s line');
  assert.deepEqual(escapeParagraph(gfm, 'paragraph', true, ['[ ] a', '- b'], [false, false])!.markup, [{ line: 1, at: 0 }]);
  assert.deepEqual(escapeParagraph(gfm, 'paragraph', false, ['[ ] a', '- b'], [false, false])!.markup, [{ line: 1, at: 0 }], 'a paragraph\'s `[ ]` is text');
  assert.deepEqual(escapeParagraph(gfm, 'paragraph', false, ['- a'], [false])!.markup, [{ line: 0, at: 0 }]);
  assert.deepEqual(escapeParagraph(gfm, 'paragraph', true, ['- a'], [false])!.markup, [{ line: 0, at: 0 }], 'an item\'s text without a checkbox: as any');
});

test('a setext title\'s underline isn\'t asked about; a quote\'s title is asked where a quote starts', () => {
  const { gfm, obsidian } = MdFlavor;
  assert.deepEqual(escapeParagraph(gfm, 'heading', false, ['Title', '==='], [false, false])!.markup, []);
  assert.deepEqual(escapeParagraph(obsidian, 'title', false, ['[!tip] x'], [false])!.lines, ['[!tip] x'], 'a callout\'s title: past its frame');
});
