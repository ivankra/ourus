// The projection of spec buffers onto blocks (outline.ts), offline: what every block app's comparison
// rests on.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareOutlines, draw, project, sectioned, unescapeLaterLines, Unsupported, type Outline } from './outline.ts';

const blocks = (o: Outline): string[] => o.blocks.map((b) => `${'  '.repeat(b.depth)}${b.text}`);

test('an original outline: blocks at their depths, the caret in its block', () => {
  const p = project('- a\n  - b┃c\n    more\n- d\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['a', '  bc\nmore', 'd']);
  assert.deepEqual(p.outline.sel, { block: 1, anchor: 1, head: 1 });
  assert.deepEqual([...p.notes], []);
});

test('a selection keeps its direction', () => {
  assert.deepEqual(project('- a«bc»\n', 'gfm').outline.sel, { block: 0, anchor: 1, head: 3 });
  assert.deepEqual(project('- a┃«bc»\n', 'gfm').outline.sel, { block: 0, anchor: 3, head: 1 });
});

test('paragraphs, headings and their sections become blocks, noted', () => {
  const p = project('# H\n\nintro\n- a\n\nTitle\n---\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['# H', '  intro', '    a', '  ## Title']);
  assert.deepEqual([...p.notes].sort(), ['blank lines', 'heading', 'paragraph', 'setext heading']);
});

test('tasks keep their checkbox, numbered and starred items are plain blocks', () => {
  const p = project('1. [ ] a┃\n2. b\n* c\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['[ ] a', 'b', 'c']);
  assert.deepEqual(p.outline.sel, { block: 0, anchor: 5, head: 5 });
  assert.deepEqual([...p.notes].sort(), ['bullet *', 'numbered list', 'task']);
});

test('an empty item, and one with only a checkbox', () => {
  assert.deepEqual(project('- a\n- ┃\n', 'gfm').outline, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: '' }], sel: { block: 1, anchor: 0, head: 0 } });
  assert.deepEqual(project('- [ ] ┃\n', 'gfm').outline.sel, { block: 0, anchor: 4, head: 4 });
});

test('a placeholder holds an empty node', () => {
  assert.deepEqual(blocks(project('- a\n  - ┃◌\n', 'gfm').outline), ['a', '  ']);
});

test('code keeps its indentation and fences', () => {
  const p = project('- a\n  ```\n  x\n\n    y\n  ```\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['a', '  ```\nx\n\n  y\n```']);
  assert.ok(p.notes.has('code block'));
});

test("an escape at a line's start is dropped, and the caret moves with it", () => {
  const p = project('- a\n  \\- b┃\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['a\n- b']);
  assert.deepEqual(p.outline.sel, { block: 0, anchor: 5, head: 5 });
  assert.ok(p.notes.has('escape'));
  // a setext title's lines too: the block holds `- x`, as the app does
  assert.deepEqual(blocks(project('first\n┃\\- x\n===\n', 'gfm').outline), ['# first\n- x']);
});

test('CRLF endings go, positions shifting with them', () => {
  const p = project('- a␍\n- b┃␍\n', 'gfm');
  assert.deepEqual(blocks(p.outline), ['a', 'b']);
  assert.deepEqual(p.outline.sel, { block: 1, anchor: 1, head: 1 });
  assert.ok(p.notes.has('CR line endings'));
});

test('a caret with no place in a block is lost, with the reason', () => {
  assert.equal(project('┃- a\n', 'gfm').caretLost, 'a caret in a marker');
  assert.equal(project('a\n┃\nb\n', 'gfm').caretLost, 'a caret on a blank line');
  assert.equal(project('- a\n┃', 'gfm').caretLost, 'a caret after the last line');
  assert.equal(project('- «a\n- b»\n', 'gfm').caretLost, 'a selection across blocks');
});

test('quotes, callouts and frontmatter have no block form', () => {
  assert.throws(() => project('> q┃\n', 'gfm'), (e) => e instanceof Unsupported && e.message === 'a quote');
  assert.throws(() => project('> [!note] t\n> q┃\n', 'obsidian'), (e) => e instanceof Unsupported && e.message === 'a callout');
  assert.throws(() => project('---\na: 1\n---\n- x┃\n', 'obsidian'), (e) => e instanceof Unsupported && e.message === 'frontmatter');
});

test('drawing an outline gives a buffer that projects back to it', () => {
  for (const drawn of ['- a\n  - b┃\n- c\n', '- a\n  more\n  \\- not an item┃\n', '- «ab»\n', '- ┃«ab»\n']) {
    const o = project(drawn, 'gfm').outline;
    assert.equal(draw(o), drawn);
    assert.deepEqual(project(draw(o), 'gfm').outline, o);
  }
});

test('comparing: blocks first, then whitespace at line breaks, then the caret', () => {
  const want = project('- a\n- b┃\n', 'gfm').outline;
  assert.equal(compareOutlines(want, want), 'agree');
  assert.equal(compareOutlines(want, { ...want, sel: { block: 1, anchor: 0, head: 0 } }), 'caret');
  assert.equal(compareOutlines(want, { ...want, selected: [1] }), 'caret');
  assert.equal(compareOutlines(want, { blocks: [{ depth: 0, text: 'a ' }, { depth: 0, text: 'b' }], sel: want.sel }), 'whitespace');
  assert.equal(compareOutlines(want, { blocks: [{ depth: 0, text: 'a' }, { depth: 1, text: 'b' }], sel: want.sel }), 'disagree');
  assert.equal(compareOutlines({ ...want, sel: null }, { ...want, sel: null }), 'agree');
  // spaces right after a block's prefix (its number, checkbox, `#`s) are whitespace too
  const numbered = { blocks: [{ depth: 0, text: '10. b' }, { depth: 0, text: '[ ] c' }], sel: null };
  assert.equal(compareOutlines(numbered, { blocks: [{ depth: 0, text: '10.  b' }, { depth: 0, text: '[ ]  c' }], sel: null }), 'whitespace');
  assert.equal(compareOutlines(numbered, { blocks: [{ depth: 0, text: '10. b ' }, { depth: 0, text: '[ ] cc' }], sel: null }), 'disagree');
});

test("blocks after a heading compare as its section, beside it or under it", () => {
  const read = (drawn: string) => project(drawn, 'gfm').outline;
  const want = (drawn: string) => [project(drawn, 'gfm').outline, project(drawn, 'gfm').sections] as const;
  // Enter at a heading's end: the app's block beside the heading is the projection's under it
  const [notes, ownsNotes] = want('# Notes\nfirst┃\n');
  assert.equal(compareOutlines(notes, read('- # Notes\n- first┃\n'), ownsNotes), 'agree');
  // a sub-heading takes what follows it; a heading of its level or above ends it
  assert.deepEqual(sectioned(read('- # A\n- ## s\n- x\n- # B\n'), [0, 1, 3]).blocks.map((b) => b.depth), [0, 1, 2, 0]);
  // a heading an app nests in a section of its level is that section's sibling, as Markdown reads it
  const [z, ownsZ] = want('# A\n## B\ntext\n# Z┃\n## C\n');
  assert.equal(compareOutlines(z, read('- # A\n  - ## B\n    - text\n    - # Z┃\n  - ## C\n'), ownsZ), 'agree');
  // a real difference stays one: the block under the wrong heading
  const [ab, ownsAB] = want('# A\nx\n# B\n');
  assert.equal(compareOutlines(ab, read('- # A\n- # B\n  - x\n'), ownsAB), 'disagree');
  // an item whose text is a heading owns no section: text in the item isn't an item beside it
  const [item, ownsItem] = want('- a\n- # h\n  text┃\n');
  assert.deepEqual(ownsItem, []);
  assert.equal(compareOutlines(item, read('- a\n- # h\n- text┃\n'), ownsItem), 'disagree');
});

test("a heading's closing #s and indented code have no block form", () => {
  assert.throws(() => project('# Title #\n- ┃more\n', 'gfm'), (e) => e instanceof Unsupported && /closing #s/.test(e.message));
  assert.throws(() => project('    ┃code\n', 'gfm'), (e) => e instanceof Unsupported && /indented code/.test(e.message));
  // a setext title of several lines is a heading block with line breaks, which block apps hold
  assert.deepEqual(blocks(project('one\n┃two\n---\n', 'gfm').outline), ['## one\ntwo']);
});

test("Markdown source's escapes at a block's later lines are taken off, the caret moving with them", () => {
  const o = unescapeLaterLines({ blocks: [{ depth: 0, text: '21\\. a\n\\. y' }, { depth: 0, text: '\\- x' }], sel: { block: 0, anchor: 10, head: 10 } });
  // a first line keeps its escape: it is what tells the text from a block's own form
  assert.deepEqual(o.blocks.map((b) => b.text), ['21\\. a\n. y', '\\- x']);
  assert.deepEqual(o.sel, { block: 0, anchor: 9, head: 9 });
});

test('for an app that numbers blocks, an ordered item is a numbered block and a number that is text keeps its escape', () => {
  const read = (drawn: string) => project(drawn, 'gfm', { ordered: true });
  // as a reader sees the numbers: the list's start, counted on
  assert.deepEqual(blocks(read('1. a\n1. b┃\n').outline), ['1. a', '2. b']);
  assert.deepEqual(blocks(read('9. a\n   - x\n10. b┃\n').outline), ['9. a', '  x', '10. b']);
  assert.deepEqual(blocks(read('- a\n- 1\\. x┃\n').outline), ['a', '1\\. x']);
  assert.ok(!read('1. a┃\n').notes.has('numbered list'));
  // else the number goes, an adaptation
  assert.deepEqual(blocks(project('1. a┃\n', 'gfm').outline), ['a']);
  assert.ok(project('1. a┃\n', 'gfm').notes.has('numbered list'));
});

