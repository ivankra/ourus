// The spec reader's rules (spec/README.md). The player's caret motions are spec/cursor.md.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSpec, specConfig, SpecError } from './specfile.ts';

const F = '```';

test('each test has a heading of its own; the blocks after each action are checked', () => {
  const tests = readSpec(
    'x.md',
    [
      '# Title', '', '## Indent', '', 'Prose.', '', `${F}yaml`, 'tags: core', F, '',
      `${F}buffer`, '- a', '- b┃', F, '', '> indent "c"', '', `${F}buffer`, '- a', '  - bc┃', F, '',
      `${F}yaml`, 'clipboard: |', '  x', F, '',
      '> moveSubtreeUp', '', `${F}yaml`, 'result: rejected no-previous-sibling', F, '', `${F}buffer`, '- a', '  - bc┃', F, '',
      '### Pending one', '', `${F}yaml`, 'status: pending', 'tags: rare', F, '', `${F}buffer`, '- z┃', F, '', '> outdent', '',
      '### Own', '', `${F}yaml`, 'tags: edge', 'clipboard: |', '  c', F, '', `${F}buffer`, '- y┃', F, '', '> paste',
      '', `${F}js`, 'ignored', F,
    ].join('\n'),
  );
  assert.deepEqual(
    tests.map((t) => [t.name, t.line, t.pending, t.rank, t.initial, t.steps.map((s) => [s.actions, s.expect])]),
    [
      ['Indent', 7, false, 'core', { buffer: '- a\n- b┃\n' }, [
        [['indent', '"c"'], { buffer: '- a\n  - bc┃\n', clipboard: { 'text/plain': 'x\n' } }],
        [['moveSubtreeUp'], { result: 'rejected no-previous-sibling', buffer: '- a\n  - bc┃\n' }],
      ]],
      ['Pending one', 41, true, 'rare', { buffer: '- z┃\n' }, [[['outdent'], {}]]],
      ['Own', 54, false, 'edge', { clipboard: { 'text/plain': 'c\n' }, buffer: '- y┃\n' }, [[['paste'], {}]]],
    ],
  );
});

test('headings are unique, each holds at most one test, and --- separates nothing', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const t = (name: string) => [name, '', `${F}yaml`, 'tags: edge', F, '', `${F}buffer`, 'a', F, '', '> indent', ''];
  bad(['# T', '', ...t('## A'), '---', '', `${F}buffer`, 'b', F, '', '> indent'], /x\.md:15: --- no longer separates tests/);
  // a second test under one heading reads as a second buffer for the state after the first test's actions
  bad(['# T', '', ...t('## A'), `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F, '', '> indent'], /x\.md:19: a second buffer block for one state/);
  bad(['# T', '', ...t('## A'), ...t('### A')], /x\.md:15: duplicate heading "A" \(as line 3\)/);
  bad(['# T', '', ...t('## Same, thing'), ...t('## same thing')], /duplicate heading "same thing"/);
  bad(['# T', '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:3: a test needs a heading of its own/);
});

test('a buffer with a longer fence holds a code fence', () => {
  const [t] = readSpec('x.md', ['## A', '', `${F}yaml`, 'tags: edge', F, '', '````buffer', '- a┃', '  ```', '  x', '  ```', '````', '', '> indent'].join('\n'));
  assert.equal(t!.initial.buffer, '- a┃\n  ```\n  x\n  ```\n');
});

test('misplaced blocks and unknown options are errors', () => {
  const bad = (lines: string[], message: RegExp) => assert.throws(() => readSpec('x.md', lines.join('\n')), (e) => e instanceof SpecError && message.test(e.message));
  const h = ['## A', '', `${F}yaml`, 'tags: edge', F, ''];
  bad([...h, '> indent'], /x\.md:7: actions before any buffer/);
  bad([...h, `${F}buffer`, 'a', F], /a test with no actions/);
  bad(['## A', '', `${F}yaml`, 'tags: edge', 'clipboard: |', '  a', F, '', '> paste'], /actions before any buffer/);
  bad([...h, `${F}clipboard`, 'a', F, '', `${F}buffer`, 'a', F, '', '> paste'], /x\.md:7: a clipboard is a key of the state's `yaml` block/);
  bad([...h, `${F}buffer`, 'a', F, '', '> indent', '', `${F}result`, 'applied', F], /x\.md:13: a result is a key of the state's `yaml` block/);
  bad([...h, `${F}buffer`, 'a', F, '', '> indent', '', `${F}outline`, 'paragraph: a', F], /x\.md:13: an outline is a key of the state's `yaml` block/);
  bad([...h, `${F}buffer`, 'a', F, '', '> indent', '', `${F}buffer`, 'b', F, '', `${F}buffer`, 'c', F], /a second buffer block for one state \(each test needs a heading of its own\)/);
  bad([...h, `${F}buffer`, 'a', F, '', '> copy', '', `${F}yaml`, 'result: applied', F, '', `${F}yaml`, 'clipboard: "b"', F], /x\.md:17: a second yaml block for one state/);
  bad([...h, `${F}buffer pending`, 'a', F, '', '> indent'], /x\.md:7: "pending" after "buffer": options go in a config block/);
  bad(['---', 'policy: logseq', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:2: unknown option "policy"/);
  bad(['## A', '', `${F}yaml`, 'tags: edge', 'outdent: sideways', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:5: option "outdent" takes direct, logical/);
  bad(['## A', '', `${F}yaml`, 'tags: edge', 'status: later', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:5: option "status" takes ready, pending/);
  bad([...h, `${F}buffer`, 'a', F, '', `${F}yaml`, 'status: pending', F, '', '> indent'], /x\.md:11: a config block goes before a test's first block/);
  bad([...h, '## B', ''], /x\.md:3: a config block with no test after it/);
  bad(['## A', '', `${F}config`, 'tags: edge', F, '', `${F}buffer`, 'a', F, '', '> indent'], /x\.md:3: a config block is a `yaml` block/);
});

test("a test's config block is combined with the frontmatter, and wins", () => {
  const tests = readSpec(
    'x.md',
    [
      '---', 'outdent: logical', 'status: pending', '---', '',
      '## A', '', `${F}yaml`, 'tags: edge', F, '', `${F}buffer`, 'a', F, '', '> outdent', '',
      '## B', '', `${F}yaml`, 'tags: edge', 'outdent: direct', 'bullet: "*"', 'status: ready', F, '', `${F}buffer`, 'a', F, '', '> outdent',
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

test("a test's rank is its first tag: always there, one of four, review metadata and no option", () => {
  const read = (config: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, ...config, F, '', `${F}buffer`, '- a┃', F, '', '> enter'].join('\n'))[0]!;
  const t = read(['tags: core']);
  assert.deepEqual([t.rank, t.tags, t.options], ['core', [], {}]);
  assert.deepEqual(specConfig(t.options), {});
  const bad = (config: string[], message: RegExp) => assert.throws(() => read(config), (e) => e instanceof SpecError && message.test(e.message));
  bad(['status: pending'], /x\.md:3: a test is ranked/);
  bad(['tags: urgent'], /x\.md:4: the first tag is the rank: core, common, edge, rare, not "urgent"/);
  bad(['tags: free-form edge'], /x\.md:4: the first tag is the rank/);
  bad(['tags: edge core'], /x\.md:4: no tag "core"/);
  bad(['rank: edge'], /x\.md:4: the rank is the first tag/);
  assert.throws(() => readSpec('x.md', ['## A', '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:3: a test is ranked/);
});

test("a config block is YAML: every value a string, and the clipboard a test starts with a literal block or one quoted line", () => {
  const read = (config: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, ...config, ...(config.some((l) => l.startsWith('tags:')) ? [] : ['tags: edge']), F, '', `${F}buffer`, 'a┃', F, '', '> paste'].join('\n'))[0]!;
  // `|` ends the text with a line break, `|-` without one; the block's indentation isn't the text's
  assert.deepEqual(read(['clipboard: |', '  # h', '  - a', '', '  > q']).initial.clipboard, { 'text/plain': '# h\n- a\n\n> q\n' });
  assert.deepEqual(read(['clipboard: |-', '  x', '  y']).initial.clipboard, { 'text/plain': 'x\ny' });
  // one line without a line break is a quoted string
  assert.deepEqual(read(['clipboard: "1. Introduction"']).initial.clipboard, { 'text/plain': '1. Introduction' });
  assert.deepEqual(read(["clipboard: '# h'"]).initial.clipboard, { 'text/plain': '# h' });
  // an indentation indicator keeps the spaces every line starts with
  assert.deepEqual(read(['clipboard: |2', '      first', '', '      > quote']).initial.clipboard, { 'text/plain': '    first\n\n    > quote\n' });
  // a comment is a comment, `false` is the word, and the clipboard is no option
  const t = read(['# a note', 'handleFenceContents: false', 'clipboard: |', '  x', 'tags: rare']);
  assert.deepEqual([t.options, t.initial.clipboard, t.rank], [{ handleFenceContents: 'false' }, { 'text/plain': 'x\n' }, 'rare']);
  assert.deepEqual(specConfig(t.options), { handleFenceContents: false });

  const bad = (config: string[], message: RegExp) => assert.throws(() => read(config), (e) => e instanceof SpecError && message.test(e.message));
  bad(['clipboard: x'], /x\.md:4: a clipboard is a literal block/);
  bad(['clipboard: |-', '  x'], /x\.md:4: a clipboard of one line without a line break is a quoted string/);
  bad(['clipboard: "a\\nb"'], /x\.md:4: a quoted clipboard is one line without a line break/);
  bad(['clipboard: >', '  x'], /x\.md:4: a clipboard is a literal block/);
  // indented deeper, without an indicator, its lines would lose the spaces they share
  bad(['clipboard: |', '    - b', '    - c'], /x\.md:5: a clipboard's lines are indented two spaces under it/);
  bad(['tags: rare', 'tags: edge'], /x\.md:5: not YAML: Map keys must be unique/);
  bad(['bullet: *'], /x\.md:4: not YAML/);
  bad(['outdent: [direct]'], /x\.md:4: option "outdent" takes one value/);
  assert.throws(() => readSpec('x.md', ['---', 'clipboard: |', '  x', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:2: a clipboard is a test's/);
  assert.throws(() => readSpec('x.md', ['## A', '', `${F}clipboard-no-newline`, 'x', F, '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:3: a clipboard is a key of the state's `yaml` block/);
});

test('a clipboard is its text, or its formats under it; a state after a step holds its result, clipboard and outline', () => {
  const start = (config: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, 'tags: edge', ...config, F, '', `${F}buffer`, 'a┃', F, '', '> paste'].join('\n'))[0]!;
  // a format's lines are indented two spaces under its key; one line without a line break is quoted, single quotes for HTML's
  assert.deepEqual(start(['clipboard:', '  text/plain: |-', '    x', '    y', '  text/html: \'<p class="a">x<br>y</p>\'']).initial.clipboard, { 'text/plain': 'x\ny', 'text/html': '<p class="a">x<br>y</p>' });
  assert.equal(start(['outline: |', '  paragraph: a']).initial.outline, 'paragraph: a');
  const badStart = (config: string[], message: RegExp) => assert.throws(() => start(config), (e) => e instanceof SpecError && message.test(e.message));
  badStart(['clipboard:', '  text/rtf: "x"'], /x\.md:6: no clipboard format "text\/rtf": formats are text\/plain, text\/markdown, text\/html, vscode-editor-data/);
  badStart(['clipboard:', '  text/html: "<p>x</p>"'], /x\.md:5: the clipboard a test starts with has a text\/plain/);
  // bare, ` #` would start a comment
  badStart(['clipboard:', '  text/plain: "x"', '  text/html: <p>a #b</p>'], /x\.md:7: a clipboard's text\/html is a literal block/);
  badStart(['clipboard:', '  text/plain: |', '  x'], /not YAML|indented two spaces/);
  badStart(['clipboard:', '  text/plain: |', '      x'], /x\.md:7: a clipboard's text\/plain's lines are indented two spaces under it/);
  badStart(['result: applied'], /x\.md:5: a result is a step's/);

  const after = (yaml: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, 'tags: edge', F, '', `${F}buffer`, 'a┃', F, '', '> copy', '', `${F}yaml`, ...yaml, F].join('\n'))[0]!.steps[0]!.expect;
  assert.deepEqual(after(['result: notApplicable', 'clipboard:', '  text/markdown: |', '    - a', 'outline: |', '  paragraph: a', '    item: b']), {
    result: 'notApplicable',
    clipboard: { 'text/markdown': '- a\n' },
    outline: 'paragraph: a\n  item: b',
  });
  assert.deepEqual(after(['result: rejected not-expressible']), { result: 'rejected not-expressible' });
  const badAfter = (yaml: string[], message: RegExp) => assert.throws(() => after(yaml), (e) => e instanceof SpecError && message.test(e.message));
  badAfter(['result: refused'], /x\.md:14: a result is applied, notApplicable or "rejected <reason>", not "refused"/);
  badAfter(['result: rejected: not-expressible'], /x\.md:14: not YAML/);
  badAfter(['bullet: "*"'], /x\.md:14: "bullet" in a state after a step/);
  badAfter(['tags: edge'], /x\.md:14: "tags" in a state after a step/);
});

test("a test's tags after its rank are words from the closed list, in its config block, none twice", () => {
  const read = (config: string[]) => readSpec('x.md', ['## A', '', `${F}yaml`, ...config, F, '', `${F}buffer`, 'a┃', F, '', '> enter'].join('\n'))[0]!;
  const t = read(['tags: rare free-form  markup-task']);
  assert.deepEqual([t.rank, t.tags, t.options], ['rare', ['free-form', 'markup-task'], {}]);
  assert.deepEqual(read(['tags: rare']).tags, []);
  const bad = (config: string[], message: RegExp) => assert.throws(() => read(config), (e) => e instanceof SpecError && message.test(e.message));
  bad(['tags: rare free-form sideways'], /x\.md:4: no tag "sideways"/);
  bad(['tags: rare free-form free-form'], /x\.md:4: tag "free-form" given twice/);
  bad(['tags: [free-form]'], /x\.md:4: option "tags" takes one value/);
  assert.throws(() => readSpec('x.md', ['---', 'tags: edge', '---', '', '## A', '', `${F}buffer`, 'a', F, '', '> indent'].join('\n')), /x\.md:2: tags are a test's/);
});
