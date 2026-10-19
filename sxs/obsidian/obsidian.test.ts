// Obsidian's indentation (obsidian/obsidian.ts), offline: a test indented with spaces is loaded as
// Obsidian writes it (a tab a level), and what Obsidian makes of it read back with spaces.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asSpaces, asTabs, tabbed } from './obsidian.ts';
import { readTextDoc, drawTextDoc } from '../lib/text.ts';

const tabs = (drawn: string): string => drawTextDoc(asTabs(readTextDoc(drawn)));
const spaces = (drawn: string): string => drawTextDoc(asSpaces(readTextDoc(drawn)));

test("an item nested in an item is indented by a tab, whatever its parent's marker", () => {
  assert.equal(tabs('- a\n  - b┃\n    - c\n'), '- a\n→- b┃\n→→- c\n');
  assert.equal(tabs('9. a\n   - x\n10. b\n    - y┃\n'), '9. a\n→- x\n10. b\n→- y┃\n');
  assert.equal(tabs('-  a\n   -  b\n'), '-  a\n→-  b\n');
  assert.equal(tabs('- a  b\n  - c  d\n'), '- a  b\n→- c  d\n');
});

test("any other line in an item is the item's indentation and spaces to its text, as Shift+Enter writes it", () => {
  assert.equal(tabs('1. a\n   b┃\n'), '1. a\n   b┃\n');
  assert.equal(tabs('- a\n  - b\n    text\n'), '- a\n→- b\n→  text\n');
  assert.equal(tabs('- a\n  ```\n  - x\n      y\n  ```\n'), '- a\n  ```\n  - x\n      y\n  ```\n');
});

test('indentation past the structure, or outside any item, is two spaces a tab, an odd one a space', () => {
  assert.equal(tabs('- a\n    * x\n'), '- a\n→→* x\n');
  assert.equal(tabs('  x\n   y\n'), '→x\n→ y\n');
});

test('the caret and a selection keep their places', () => {
  assert.equal(tabs('- a\n  ┃- b\n'), '- a\n→┃- b\n');
  assert.equal(tabs('- a\n┃  - b\n'), '- a\n┃→- b\n');
  assert.equal(tabs('- «a\n    - b»\n'), '- «a\n→→- b»\n');
  assert.equal(tabs('1. a\n   - ┃b\n'), '1. a\n→- ┃b\n');
  assert.equal(tabs('- a\n  - b\n    ┃\n'), '- a\n→- b\n→  ┃\n');
});

test("read back, a tab into an item is its text's column, and spaces stay", () => {
  assert.equal(spaces('- a\n→- b┃\n'), '- a\n  - b┃\n');
  assert.equal(spaces('1. a\n→1. b┃\n2. c\n'), '1. a\n   1. b┃\n2. c\n');
  assert.equal(spaces('10. a\n→- b\n→  ┃\n'), '10. a\n    - b\n      ┃\n');
  assert.equal(spaces('1. a\n   text\n'), '1. a\n   text\n');
  assert.equal(spaces('- a→b\n'), '- a→b\n');
});

test("a caret after the marker's space starts the text: the spaces after it are the text's", () => {
  assert.equal(spaces('- ┃ b\n→- c\n'), '- ┃ b\n  - c\n');
  assert.equal(spaces('-  b┃\n→- c\n'), '-  b┃\n   - c\n');
  assert.equal(tabs('- ┃ b\n  - c\n'), '- ┃ b\n→- c\n');
});

test('read back, a tab with no item to go into, or in a mix, is two spaces', () => {
  assert.equal(spaces('→x┃\n'), '  x┃\n');
  assert.equal(spaces('- a\n→ →┃- b\n'), '- a\n     ┃- b\n');
});

test('spaces to tabs and back is where it started', () => {
  for (const drawn of ['- a\n  - b┃\n    - c\n', '1. a\n   b┃\n', '- «x\n      y»\n', '┃\n  \n', '9. a┃\n   - x\n10. b\n    - y\n', '- a\n  ```\n  co┃de\n\n      y\n  ```\n', '- a\n    * x\n- b┃\n']) assert.equal(spaces(tabs(drawn)), drawn);
});

test('a document indented with tabs already is taken as written', () => {
  assert.equal(tabbed('- a\n\t- b'), true);
  assert.equal(tabbed('- a\n  \t- b'), true);
  assert.equal(tabbed('- a\t\n  - b'), false);
});
