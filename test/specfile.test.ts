// The spec reader's rules (spec/README.md). The player's caret motions are spec/cursor.md.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSpec, SpecError } from './specfile.ts';

const F = '```';

test('each test has a heading of its own; the blocks after each action are checked', () => {
  const tests = readSpec(
    'x.md',
    [
      '# Title', '', '## Indent', '', 'Prose.', '',
      `${F}buffer`, '- a', '- b┃', F, '', '> indent "c"', '', `${F}buffer`, '- a', '  - bc┃', F, '',
      `${F}clipboard`, 'x', F, '',
      '> moveBlockUp', '', `${F}result`, 'rejected: no-previous-sibling', F, '', `${F}buffer`, '- a', '  - bc┃', F, '',
      '### Pending one', '', `${F}config`, 'status: pending', F, '', `${F}buffer`, '- z┃', F, '', '> outdent', '',
      '### Own', '', `${F}clipboard`, 'c', F, '', `${F}buffer`, '- y┃', F, '', '> pasteStructured',
      '', `${F}js`, 'ignored', F,
    ].join('\n'),
  );
  assert.deepEqual(
    tests.map((t) => [t.name, t.line, t.pending, t.initial, t.steps.map((s) => [s.actions, s.expect])]),
    [
      ['Indent', 7, false, { buffer: '- a\n- b┃\n' }, [
        [['indent', '"c"'], { buffer: '- a\n  - bc┃\n', clipboard: 'x\n' }],
        [['moveBlockUp'], { result: 'rejected: no-previous-sibling', buffer: '- a\n  - bc┃\n' }],
      ]],
      ['Indent › Pending one', 36, true, { buffer: '- z┃\n' }, [[['outdent'], {}]]],
      ['Indent › Own', 48, false, { clipboard: 'c\n', buffer: '- y┃\n' }, [[['pasteStructured'], {}]]],
    ],
  );
});

test('headings are unique, each holds at most one test, and --- separates nothing', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const t = (name: string) => [name, '', `${F}buffer`, 'a', F, '', '> indent', ''];
  bad(['# T', '', ...t('## A'), '---', '', `${F}buffer`, 'b', F, '', '> indent'], /x\.md:11: --- no longer separates tests/);
  // a second test under one heading reads as a second buffer for the state after the first test's actions
  bad(['# T', '', ...t('## A'), `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F, '', '> indent'], /x\.md:15: a second buffer block for one state/);
  bad(['# T', '', ...t('## A'), ...t('### A')], /x\.md:11: duplicate heading "A" \(as line 3\)/);
  bad(['# T', '', ...t('## Same, thing'), ...t('## same thing')], /duplicate heading "same thing"/);
  bad(['# T', '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:3: a test needs a heading of its own/);
});

test('a buffer with a longer fence holds a code fence', () => {
  const [t] = readSpec('x.md', ['## A', '', '````buffer', '- a┃', '  ```', '  x', '  ```', '````', '', '> indent'].join('\n'));
  assert.equal(t!.initial.buffer, '- a┃\n  ```\n  x\n  ```\n');
});

test('misplaced blocks and unknown options are errors', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const h = ['## A', ''];
  bad([...h, '> indent'], /x\.md:3: actions before any buffer/);
  bad([...h, `${F}buffer`, 'a', F], /a test with no actions/);
  bad([...h, `${F}clipboard`, 'a', F, '', '> pasteStructured'], /a test with no buffer/);
  bad([...h, `${F}buffer`, 'a', F, '', '> indent', '', `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F], /a second buffer block for one state \(each test needs a heading of its own\)/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}result`, 'applied', F], /a result before any action/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}clipboard`, 'a', F, '', `${F}clipboard`, 'b', F], /a second clipboard/);
  bad([...h, `${F}buffer pending`, 'a', F, '', '> indent'], /x\.md:3: "pending" after "buffer": options go in a config block/);
  bad(['---', 'policy: logseq', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:2: unknown option "policy"/);
  bad([...h, `${F}config`, 'outdent: sideways', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:4: option "outdent" takes direct, logical/);
  bad([...h, `${F}config`, 'status: later', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:4: option "status" takes ready, pending/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}config`, 'status: pending', F, '', '> indent'], /x\.md:7: a config block goes before a test's first block/);
  bad([...h, `${F}config`, 'status: pending', F, '', '## B', ''], /x\.md:3: a config block with no test after it/);
});

test("a test's config block is combined with the frontmatter, and wins", () => {
  const tests = readSpec(
    'x.md',
    [
      '---', 'outdent: logical', 'status: pending', '---', '',
      '## A', '', `${F}buffer`, 'a', F, '', '> outdent', '',
      '## B', '', `${F}config`, 'outdent: direct', 'bullet: *', 'status: ready', F, '', `${F}buffer`, 'a', F, '', '> outdent',
    ].join('\n'),
  );
  assert.deepEqual(
    tests.map((t) => [t.name, t.pending, t.options]),
    [
      ['A', true, { outdent: 'logical', status: 'pending' }],
      ['B', false, { outdent: 'direct', status: 'ready', bullet: '*' }],
    ],
  );
});
