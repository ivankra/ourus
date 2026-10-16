// The spec reader's rules (spec/README.md). The player's caret motions are spec/cursor.md.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSpec, specConfig, SpecError } from './specfile.ts';

const F = '```';

test('each test has a heading of its own; the blocks after each action are checked', () => {
  const tests = readSpec(
    'x.md',
    [
      '# Title', '', '## Indent', '', 'Prose.', '',
      `${F}buffer`, '- a', '- b┃', F, '', '> indent "c"', '', `${F}buffer`, '- a', '  - bc┃', F, '',
      `${F}clipboard`, 'x', F, '',
      '> moveSubtreeUp', '', `${F}result`, 'rejected: no-previous-sibling', F, '', `${F}buffer`, '- a', '  - bc┃', F, '',
      '### Pending one', '', `${F}yaml`, 'status: pending', F, '', `${F}buffer`, '- z┃', F, '', '> outdent', '',
      '### Own', '', `${F}yaml`, 'clipboard: |', '  c', F, '', `${F}buffer`, '- y┃', F, '', '> pasteStructured',
      '', `${F}js`, 'ignored', F,
    ].join('\n'),
  );
  assert.deepEqual(
    tests.map((t) => [t.name, t.line, t.pending, t.initial, t.steps.map((s) => [s.actions, s.expect])]),
    [
      ['Indent', 7, false, { buffer: '- a\n- b┃\n' }, [
        [['indent', '"c"'], { buffer: '- a\n  - bc┃\n', clipboard: 'x\n' }],
        [['moveSubtreeUp'], { result: 'rejected: no-previous-sibling', buffer: '- a\n  - bc┃\n' }],
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
  bad([...h, `${F}yaml`, 'clipboard: |', '  a', F, '', '> pasteStructured'], /actions before any buffer/);
  bad([...h, `${F}clipboard`, 'a', F, '', `${F}buffer`, 'a', F, '', '> pasteStructured'], /x\.md:3: the clipboard a test starts with goes in its config block/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}clipboard`, 'a', F, '', '> pasteStructured'], /x\.md:7: the clipboard a test starts with goes in its config block/);
  bad([...h, `${F}buffer`, 'a', F, '', '> indent', '', `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F], /a second buffer block for one state \(each test needs a heading of its own\)/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}result`, 'applied', F], /a result before any action/);
  bad([...h, `${F}buffer`, 'a', F, '', '> copy', '', `${F}clipboard`, 'a', F, '', `${F}clipboard`, 'b', F], /a second clipboard/);
  bad([...h, `${F}buffer pending`, 'a', F, '', '> indent'], /x\.md:3: "pending" after "buffer": options go in a config block/);
  bad(['---', 'policy: logseq', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:2: unknown option "policy"/);
  bad([...h, `${F}yaml`, 'outdent: sideways', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:4: option "outdent" takes direct, logical/);
  bad([...h, `${F}yaml`, 'status: later', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:4: option "status" takes ready, pending/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}yaml`, 'status: pending', F, '', '> indent'], /x\.md:7: a config block goes before a test's first block/);
  bad([...h, `${F}yaml`, 'status: pending', F, '', '## B', ''], /x\.md:3: a config block with no test after it/);
  bad([...h, `${F}config`, 'status: pending', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:3: a config block is a `yaml` block/);
});

test("a test's config block is combined with the frontmatter, and wins", () => {
  const tests = readSpec(
    'x.md',
    [
      '---', 'outdent: logical', 'status: pending', '---', '',
      '## A', '', `${F}buffer`, 'a', F, '', '> outdent', '',
      '## B', '', `${F}yaml`, 'outdent: direct', 'bullet: "*"', 'status: ready', F, '', `${F}buffer`, 'a', F, '', '> outdent',
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

test('rank is review metadata, never an editor option, and takes only its four values', () => {
  const source = ['---', 'rank: common', '---', '', '## A', '', `${F}yaml`, 'rank: core', F, '', `${F}buffer`, '- a┃', F, '', '> enter'].join('\n');
  const [t] = readSpec('x.md', source);
  assert.equal(t!.options.rank, 'core');
  assert.deepEqual(specConfig(t!.options), {});
  assert.throws(() => readSpec('x.md', source.replace('rank: core', 'rank: urgent')), /option "rank" takes/);
});

test("a config block is YAML: every value a string, and the clipboard a test starts with a literal block", () => {
  const read = (config: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, ...config, F, '', `${F}buffer`, 'a┃', F, '', '> pasteStructured'].join('\n'))[0]!;
  // `|` ends the text with a line break, `|-` without one; the block's indentation isn't the text's
  assert.equal(read(['clipboard: |', '  # h', '  - a', '', '  > q']).initial.clipboard, '# h\n- a\n\n> q\n');
  assert.equal(read(['clipboard: |-', '  x']).initial.clipboard, 'x');
  // an indentation indicator keeps the spaces every line starts with
  assert.equal(read(['clipboard: |2', '      first', '', '      > quote']).initial.clipboard, '    first\n\n    > quote\n');
  // a comment is a comment, `false` is the word, and the clipboard is no option
  const t = read(['# a note', 'handleFenceContents: false', 'clipboard: |', '  x', 'rank: rare']);
  assert.deepEqual([t.options, t.initial.clipboard], [{ handleFenceContents: 'false', rank: 'rare' }, 'x\n']);
  assert.deepEqual(specConfig(t.options), { handleFenceContents: false });

  const bad = (config: string[], message: RegExp) => assert.throws(() => read(config), (e) => e instanceof SpecError && message.test(e.message));
  bad(['clipboard: x'], /x\.md:4: a clipboard is a literal block/);
  bad(['clipboard: "# h"'], /x\.md:4: a clipboard is a literal block/);
  bad(['clipboard: >', '  x'], /x\.md:4: a clipboard is a literal block/);
  // indented deeper, without an indicator, its lines would lose the spaces they share
  bad(['clipboard: |', '    - b', '    - c'], /x\.md:5: a clipboard's lines are indented two spaces under it/);
  bad(['rank: rare', 'rank: edge'], /x\.md:5: not YAML: Map keys must be unique/);
  bad(['bullet: *'], /x\.md:4: not YAML/);
  bad(['outdent: [direct]'], /x\.md:4: option "outdent" takes one value/);
  assert.throws(() => readSpec('x.md', ['---', 'clipboard: |', '  x', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:2: a clipboard is a test's/);
  assert.throws(() => readSpec('x.md', ['## A', '', `${F}clipboard-no-newline`, 'x', F, '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:3: no "clipboard-no-newline" block/);
});
