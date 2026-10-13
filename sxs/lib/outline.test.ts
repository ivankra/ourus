// The projection of spec buffers onto blocks (outline.ts), offline: what every block app's comparison
// rests on.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareOutlines, draw, project, Unsupported, type Outline } from './outline.ts';

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
});
