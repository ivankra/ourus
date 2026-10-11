// The spec reader's rules (spec/README.md) and the player's caret motions.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Doc } from '../src/doc.ts';
import { drawState, readDrawing } from './drawing.ts';
import { play } from './player.ts';
import { readSpec, SpecError } from './specfile.ts';

const F = '```';

test('each test has a heading of its own; the blocks after each action are checked', () => {
  const tests = readSpec(
    'x.md',
    [
      '# Title', '', '## Indent', '', 'Prose.', '',
      `${F}buffer`, '- a', '- b┃', F, '', '> formatIndent "c"', '', `${F}buffer`, '- a', '  - bc┃', F, '',
      `${F}clipboard`, 'x', F, '',
      '> moveUp', '', `${F}result`, 'rejected: no-previous-sibling', F, '', `${F}buffer`, '- a', '  - bc┃', F, '',
      '### Pending one', '', `${F}buffer pending`, '- z┃', F, '', '> formatOutdent', '',
      '### Own', '', `${F}clipboard`, 'c', F, '', `${F}buffer`, '- y┃', F, '', '> insertFromPaste',
      '', `${F}js`, 'ignored', F,
    ].join('\n'),
  );
  assert.deepEqual(
    tests.map((t) => [t.name, t.line, t.pending, t.initial, t.steps.map((s) => [s.actions, s.expect])]),
    [
      ['Indent', 7, false, { buffer: '- a\n- b┃\n' }, [
        [['formatIndent', '"c"'], { buffer: '- a\n  - bc┃\n', clipboard: 'x\n' }],
        [['moveUp'], { result: 'rejected: no-previous-sibling', buffer: '- a\n  - bc┃\n' }],
      ]],
      ['Indent › Pending one', 36, true, { buffer: '- z┃\n' }, [[['formatOutdent'], {}]]],
      ['Indent › Own', 44, false, { clipboard: 'c\n', buffer: '- y┃\n' }, [[['insertFromPaste'], {}]]],
    ],
  );
});

test('headings are unique, each holds at most one test, and --- separates nothing', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const t = (name: string) => [name, '', `${F}buffer`, 'a', F, '', '> formatIndent', ''];
  bad(['# T', '', ...t('## A'), '---', '', `${F}buffer`, 'b', F, '', '> formatIndent'], /x\.md:11: --- no longer separates tests/);
  // a second test under one heading reads as a second buffer for the state after the first test's actions
  bad(['# T', '', ...t('## A'), `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F, '', '> formatIndent'], /x\.md:15: a second buffer block for one state/);
  bad(['# T', '', ...t('## A'), ...t('### A')], /x\.md:11: duplicate heading "A" \(as line 3\)/);
  bad(['# T', '', ...t('## Same, thing'), ...t('## same thing')], /duplicate heading "same thing"/);
  bad(['# T', '', `${F}buffer`, 'a', F, '', '> formatIndent'], /x\.md:3: a test needs a heading of its own/);
});

test('a buffer with a longer fence holds a code fence', () => {
  const [t] = readSpec('x.md', ['## A', '', '````buffer', '- a┃', '  ```', '  x', '  ```', '````', '', '> formatIndent'].join('\n'));
  assert.equal(t!.initial.buffer, '- a┃\n  ```\n  x\n  ```\n');
});

test('misplaced blocks and unknown options are errors', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const h = ['## A', ''];
  bad([...h, '> formatIndent'], /x\.md:3: actions before any buffer/);
  bad([...h, `${F}buffer`, 'a', F], /a test with no actions/);
  bad([...h, `${F}clipboard`, 'a', F, '', '> insertFromPaste'], /a test with no buffer/);
  bad([...h, `${F}buffer`, 'a', F, '', '> formatIndent', '', `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F], /a second buffer block for one state \(each test needs a heading of its own\)/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}result`, 'applied', F], /a result before any action/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}clipboard`, 'a', F, '', `${F}clipboard`, 'b', F], /a second clipboard/);
  bad([...h, `${F}buffer`, 'a', F, '', '> formatIndent', '', `${F}result pending`, 'applied', F], /flags belong on a test's first buffer/);
  bad([...h, `${F}buffer wobbly`, 'a', F, '', '> formatIndent'], /unknown buffer flag "wobbly"/);
  bad(['---', 'policy: logseq', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> formatIndent'], /x\.md:2: unknown option "policy"/);
});

test('caret motions: columns of a monospace font, a goal column kept going up and down', () => {
  const run = (drawn: string, actions: string[]) => {
    const s = readDrawing(drawn);
    const r = play({ doc: Doc.parse(s.text), selection: s.selection, clipboard: '' }, actions);
    return drawState(r.doc.text, r.selection);
  };
  assert.equal(run('abc┃\n\nabcdef\n', ['cursorLineDown', 'cursorLineDown']), 'abc\n\nabc┃def\n');
  assert.equal(run('→x┃\nabcdefg\n', ['cursorLineDown']), '→x\nabcde┃fg\n');
  assert.equal(run('ab┃\n', ['cursorLineUp']), '┃ab\n');
  assert.equal(run('a\n┃b\n', ['cursorCharLeft']), 'a┃\nb\n');
  assert.equal(run('a␍\n┃b\n', ['cursorCharLeft']), 'a┃␍\nb\n');
  assert.equal(run('«ab»┃\n', ['cursorCharLeft']), '┃ab\n');
  assert.equal(run('a┃bc\n', ['selectCharRight', 'selectLineBoundaryForward']), 'a«bc»\n');
  assert.equal(run('- a┃b\n', ['cursorLineBoundaryBackward', 'cursorLineBoundaryForward', 'cursorDocStart']), '┃- ab\n');
});
