// Obsidian's indentation (obsidian/obsidian.ts), offline: a test indented with spaces is loaded with
// tabs, and what Obsidian makes of it read back with spaces.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asSpaces, asTabs, tabbed } from './obsidian.ts';
import { readTextDoc, drawTextDoc } from '../lib/text.ts';

const tabs = (drawn: string): string => drawTextDoc(asTabs(readTextDoc(drawn)));
const spaces = (drawn: string): string => drawTextDoc(asSpaces(readTextDoc(drawn)));

test('two spaces of indentation are a tab, an odd one stays a space', () => {
  assert.equal(tabs('- a\n  - b┃\n    - c\n'), '- a\n→- b┃\n→→- c\n');
  assert.equal(tabs('1. a\n   b┃\n'), '1. a\n→ b┃\n');
  assert.equal(tabs('- a  b\n  - c  d\n'), '- a  b\n→- c  d\n');
});

test('the caret and a selection keep their places', () => {
  assert.equal(tabs('- a\n  ┃- b\n'), '- a\n→┃- b\n');
  assert.equal(tabs('- a\n┃  - b\n'), '- a\n┃→- b\n');
  assert.equal(tabs('- «a\n    - b»\n'), '- «a\n→→- b»\n');
  assert.equal(tabs('1. a\n   ┃b\n'), '1. a\n→ ┃b\n');
});

test('read back, each tab of indentation is two spaces, wherever it is in it', () => {
  assert.equal(spaces('- a\n→- b┃\n'), '- a\n  - b┃\n');
  assert.equal(spaces('- a\n→ →┃- b\n'), '- a\n     ┃- b\n');
  assert.equal(spaces('- a→b\n'), '- a→b\n');
});

test('spaces to tabs and back is where it started', () => {
  for (const drawn of ['- a\n  - b┃\n    - c\n', '1. a\n   b┃\n', '- «x\n      y»\n', '┃\n  \n']) assert.equal(spaces(tabs(drawn)), drawn);
});

test('a document indented with tabs already is taken as written', () => {
  assert.equal(tabbed('- a\n\t- b'), true);
  assert.equal(tabbed('- a\n  \t- b'), true);
  assert.equal(tabbed('- a\t\n  - b'), false);
});
