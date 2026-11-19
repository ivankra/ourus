import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import {
  executeCommand,
  nearestDropPoint,
  type OurusCommand,
  type DropPoint,
  type DropSeam,
  OurusDeferred,
  OurusFailed,
  OurusRejected,
  OurusSuccess,
} from '../../src/commands/index.ts';
import { DECORATIONS, OurusConfig } from '../../src/config.ts';
import { OurusAtom, OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { MdFlavor, MdTree } from '../../src/parser/index.ts';
import {
  parseWithMarks,
  allNodes,
  nodePlainText,
  resultStatus,
  executeOnText,
  executeAfter,
  appliedText,
  assertApplied,
  convertPastedHtml,
  assertNoWriteFailure,
  htmlFailures,
  lostMarksOnText,
} from '../lib/index.ts';
import { applyChanges } from '../../src/text/index.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** The broad test's seed: it plays the same runs each time; `OURUS_FUZZ_SEED` plays others. */
const SEED = Number(process.env.OURUS_FUZZ_SEED ?? 1);

/** The flavor a document is read in: commands behave alike in all, but read tasks and callouts apart. */
const arbFlavor = fc.constantFrom(...OurusConfig.values.flavor);

/** Outline-shaped documents: headings, paragraphs and nested lists in tidy and untidy styles. */
const arbOutlineDoc = fc
  .array(
    fc.oneof(
      {
        weight: 6,
        arbitrary: fc.tuple(
          fc.integer({ min: 0, max: 3 }),
          fc.constantFrom('- ', '* ', '1. ', '2) ', '- [ ] ', '- [x] '),
          fc.constantFrom('a', 'b c', 'x', 'long text', ''),
        ),
      },
      {
        weight: 1,
        arbitrary: fc.constantFrom('', '# H', '## H2', 'para', '```', 'code', '  cont', '> [!note] T', '> q', '> - q'),
      },
    ),
    { minLength: 1, maxLength: 14 },
  )
  .chain((lines) =>
    fc
      .constantFrom('  ', '\t', '   ', '    ')
      .map((unit) => lines.map((l) => (typeof l === 'string' ? l : unit.repeat(l[0]) + l[1] + l[2])).join('\n') + '\n'),
  );

/** Consistently indented outlines: every nesting level is one unit deeper than its parent's marker. */
const arbTidyOutline = fc
  .array(
    fc.tuple(fc.integer({ min: 0, max: 3 }), fc.constantFrom('- ', '* ', '- [ ] '), fc.constantFrom('a', 'b c', 'x')),
    { minLength: 1, maxLength: 12 },
  )
  .map((items) => {
    // a level can only go one deeper than the previous item
    let prev = -1;
    return items.map(([d, m, t]) => {
      const depth = Math.min(d, prev + 1);
      prev = depth;
      return [depth, m, t] as const;
    });
  })
  .chain((items) =>
    fc.constantFrom('  ', '\t').map((unit) => items.map(([d, m, t]) => unit.repeat(d) + m + t).join('\n') + '\n'),
  );

const COMMANDS: OurusCommand['type'][] = [
  'indent',
  'outdent',
  'moveSubtreeUp',
  'moveSubtreeDown',
  'enter',
  'shiftEnter',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteSoftLineBackward',
];

/** Commands that act at a caret; the others take a selection. */
const CARET_COMMANDS = new Set<OurusCommand['type']>([
  'enter',
  'shiftEnter',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteSoftLineBackward',
]);

test('commands keep text, changes and selection consistent', () => {
  const failing: string[] = [];
  fc.assert(
    fc.property(
      fc.oneof(arbOutlineDoc, arbTidyOutline),
      arbFlavor,
      fc.nat(),
      fc.nat(),
      fc.constantFrom(...COMMANDS),
      (text, flavor, a, b, type) => {
        const doc = OurusDoc.parse(text, { config: { flavor } });
        const anchor = a % (text.length + 1);
        const head = CARET_COMMANDS.has(type) ? anchor : b % (text.length + 1);
        const r = executeCommand(OurusView.of(doc, { selection: { anchor, head } }), { type } as OurusCommand);
        if (r instanceof OurusFailed) failing.push(JSON.stringify([type, flavor, text, anchor, head]));
        if (!(r instanceof OurusSuccess)) return;
        assert.equal(applyChanges(text, r.changes), r.view.doc.text);
        for (const p of [r.view.selection.anchor, r.view.selection.head])
          assert.ok(p >= 0 && p <= r.view.doc.text.length);
      },
    ),
    { numRuns: RUNS, seed: SEED },
  );
  // the check exists to catch the writer's mistakes: a run that fails to write is a bug
  assert.deepEqual(failing, [], 'runs that fail to write: [command, flavor, text, anchor, head]');
});

test('outdent undoes indent of a list item in a tidy outline', () => {
  fc.assert(
    fc.property(arbTidyOutline, arbFlavor, fc.nat(), (text, flavor, a) => {
      const doc = OurusDoc.parse(text, { config: { flavor } });
      const pos = a % (text.length + 1);
      const r1 = executeCommand(OurusView.of(doc, { selection: pos }), { type: 'indent' });
      if (!(r1 instanceof OurusSuccess)) return;
      const r2 = executeCommand(r1.view, { type: 'outdent' });
      assert.ok(r2 instanceof OurusSuccess);
      if (!(r2 instanceof OurusSuccess)) return;
      // the outline comes back; the text may differ in renumbering or bullet adoption
      const shape = (d: OurusDoc) =>
        allNodes(d)
          .map((n) => `${n.depth}:${n.kind}:${nodePlainText(d, n).replace(/\n/g, '|')}`)
          .join('\n');
      assert.equal(shape(r2.view.doc), shape(doc));
    }),
    { numRuns: RUNS },
  );
});

test('ids follow nodes through structural commands', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const idOf = (d: OurusDoc, text: string) => allNodes(d).find((n) => nodePlainText(d, n).split('\n')[0] === text)!.id;
  const before = ['a', 'b', 'c', 'd'].map((t) => idOf(doc, t));
  const pos = doc.text.indexOf('b');
  const r = executeCommand(OurusView.of(doc, { selection: pos }), { type: 'moveSubtreeDown' });
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  assert.equal(r.view.doc.text, '- a\n- d\n- b\n  - c\n');
  assert.deepEqual(
    ['a', 'b', 'c', 'd'].map((t) => idOf(r.view.doc, t)),
    before,
  );
});

test('ids stay with nodes that a command indents or opens a line above', () => {
  const ids = (d: OurusDoc) => allNodes(d).map((n) => `${n.id}:${nodePlainText(d, n).replace(/\n/g, '')}`);
  const run = (text: string, type: OurusCommand['type'], pos: number, config = {}) => {
    const doc = OurusDoc.parse(text, { config });
    const r = executeCommand(OurusView.of(doc, { selection: pos }), { type } as OurusCommand);
    assert.ok(r instanceof OurusSuccess);
    return r instanceof OurusSuccess ? [ids(doc), ids(r.view.doc)] : [];
  };
  const [a, b] = run('- a\n- b\n  - c\n', 'indent', 7);
  assert.deepEqual(b, a);
  // an empty paragraph put above (`enterAtTextStart: into`) is a new node; the others keep their ids
  const [e, f] = run('# H\n\npara\n', 'enter', 5);
  assert.deepEqual([f!.filter((n) => !n.endsWith(':')), f!.length], [e, e!.length + 1]);
});

// The empty document, and the bare line break with and without a held empty paragraph: three states
// the spec's drawings can't tell apart (a buffer's last line always ends with a line ending, and `''`
// has no line at all), each its own path through the commands.
test('every command from an empty document neither throws nor fails to write', () => {
  const starts: [string, string, number[]][] = [
    ['nothing', '', []],
    ['a line break', '\n', []],
    ['a held empty paragraph', '\n', [0]],
  ];
  const clipboards = ['- x\n', 'x\n', 'x', '\n', 'a\n\nb\n', '# h\n', '---\ntitle: x\n---\n', '```\ncode\n```\n'];
  const commands: OurusCommand[] = [
    ...(
      [
        'indent',
        'outdent',
        'moveSubtreeUp',
        'moveSubtreeDown',
        'deleteSubtree',
        'duplicateSubtree',
        ...CARET_COMMANDS,
      ] as const
    ).map((type) => ({ type }) as OurusCommand),
    ...clipboards.flatMap((text) => [
      { type: 'paste', clipboard: { 'text/plain': text } } as const,
      { type: 'pastePlain', text } as const,
    ]),
  ];
  const problems: string[] = [];
  for (const flavor of OurusConfig.values.flavor) {
    for (const [name, text, placeholders] of starts) {
      const doc = parseWithMarks(text, placeholders, { flavor });
      for (let pos = 0; pos <= text.length; pos++) {
        for (const command of commands) {
          const what = `${flavor}, ${name}, at ${pos}: ${JSON.stringify(command)}`;
          try {
            const r = executeCommand(OurusView.of(doc, { selection: pos }), command);
            if (r instanceof OurusFailed) problems.push(`${what}: ${r.detail}`);
            if (r instanceof OurusSuccess) assert.equal(applyChanges(text, r.changes), r.view.doc.text, what);
          } catch (e) {
            problems.push(`${what}: throws ${(e as Error).message}`);
          }
        }
      }
    }
  }
  assert.deepEqual(problems, []);
  // with no line to act on, a structural command is refused; a paste is the document
  const empty = OurusDoc.parse('');
  assert.ok(executeCommand(OurusView.of(empty, { selection: 0 }), { type: 'indent' }) instanceof OurusRejected);
  const pasted = executeCommand(OurusView.of(empty, { selection: 0 }), {
    type: 'paste',
    clipboard: { 'text/plain': '- x\n' },
  });
  assert.deepEqual(pasted instanceof OurusSuccess && [pasted.view.doc.text, pasted.view.selection.head], ['- x\n', 3]);
});

// The document's true end, after its last line ending, is on no line, which the spec's buffers can't
// draw: a structural command from there acts on the last node, and the caret goes into its text
// (spec: MoveUp39, from a trailing blank line).
test('a structural command from the document end leaves the caret in the node it moved', () => {
  const doc = OurusDoc.parse('- one\n- two\n');
  const end = doc.text.length;
  for (const [type, text] of [
    ['moveSubtreeUp', '- two\n- one\n'],
    ['indent', '- one\n  - two\n'],
  ] as const) {
    const r = executeCommand(OurusView.of(doc, { selection: end }), { type });
    assert.ok(r instanceof OurusSuccess, type);
    if (!(r instanceof OurusSuccess)) continue;
    assert.equal(r.view.doc.text, text, type);
    const node = r.view.doc.nodeAtLine(r.view.doc.lineAt(r.view.selection.head).index);
    assert.equal(node && nodePlainText(r.view.doc, node).split('\n')[0], 'two', `${type}: the caret in "two"`);
    // so the next press acts on it again
    if (type === 'moveSubtreeUp')
      assert.ok(executeCommand(r.view, { type: 'moveSubtreeDown' }) instanceof OurusSuccess);
  }
});

// Enter at the end of a text without a final line ending holds an empty line that is the text's last,
// unterminated, which the spec's buffers can't draw: a paste there fills it (it failed to write).
test('a paste on the empty line Enter holds at the text end fills it', () => {
  const entered = executeOnText('# h1', { type: 'enter' }, { caret: 4 });
  assert.ok(entered instanceof OurusSuccess);
  if (!(entered instanceof OurusSuccess)) return;
  // (set off from the heading by a blank line, which the paste leaves: a heading keeps one, Gap20)
  assert.equal(entered.view.doc.text, '# h1\n\n');
  for (const [clipboard, text] of [
    ['- a\n  - b', '# h1\n\n- a\n  - b\n'],
    ['> q', '# h1\n\n> q\n'],
    ['# h2\ntext', '# h1\n\n# h2\ntext\n'],
  ] as const) {
    const r = executeCommand(entered.view, { type: 'paste', clipboard: { 'text/plain': clipboard } });
    assert.equal(
      r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r instanceof OurusRejected ? r.reason : ''}`,
      text,
      clipboard,
    );
  }
  // Shift-Enter's the same: the blank line it makes the paste fills, the nodes after the paragraph (Paste26)
  const broken = executeOnText('p', { type: 'shiftEnter' }, { caret: 1 });
  assert.ok(broken instanceof OurusSuccess);
  if (!(broken instanceof OurusSuccess)) return;
  const pasted = executeCommand(broken.view, { type: 'paste', clipboard: { 'text/plain': '- a\n- b' } });
  assert.equal(pasted instanceof OurusSuccess ? pasted.view.doc.text : resultStatus(pasted), 'p\n- a\n- b\n');
});

test('several characters typed at once are played a character at a time, as keys type them', () => {
  const typed = (text: string, at: number, insert: string) => {
    const doc = OurusDoc.parse(text);
    const result = executeCommand(OurusView.of(doc, { selection: at }), { type: 'insertText', text: insert });
    if (!(result instanceof OurusSuccess)) return resultStatus(result);
    assert.equal(applyChanges(text, result.changes), result.view.doc.text);
    return { text: result.view.doc.text, caret: result.view.selection.head };
  };
  // a fence typed whole (a text replacement's) is closed, as typed key by key; its info string after it
  assert.deepEqual(typed('intro\n\n\n', 7, '```'), { text: 'intro\n\n```\n```\n', caret: 10 });
  assert.deepEqual(typed('intro\n\n\n', 7, '```js'), { text: 'intro\n\n```js\n```\n', caret: 12 });
  // a backtick in text, and text without one, the host's
  assert.equal(typed('- a\n', 3, 'b`c'), 'deferredToHost');
  assert.equal(typed('x\n', 1, 'ab'), 'deferredToHost');
});

// moveSubtree by the API (spec/move-subtree.md): the places a drawing can't name, and `nodes` on the
// structural commands, acting on nodes the caret isn't in
test('a drop checks its ids and its place', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n\npara\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const caret = { anchor: 0, head: 0 };
  const drop = (nodes: number[], parent: number | 'root', after: number | null) =>
    executeCommand(OurusView.of(doc, { selection: caret }), { type: 'moveSubtree', nodes, to: { parent, after } });
  const reason = (r: ReturnType<typeof drop>) => (r instanceof OurusRejected ? r.reason : resultStatus(r));
  assert.equal(reason(drop([999], 'root', null)), 'no-such-node');
  assert.equal(reason(drop([id('b')], 999, null)), 'no-such-node');
  assert.equal(reason(drop([id('b')], 'root', 999)), 'no-such-node');
  // the root is never a sibling to go after
  assert.equal(reason(drop([id('b')], 'root', doc.rootNode.id)), 'no-such-node');
  assert.equal(reason(drop([id('d')], id('b'), id('a'))), 'invalid-insertion-point');
  assert.equal(reason(drop([id('a'), id('b')], 'root', id('b'))), 'invalid-insertion-point');
  assert.equal(reason(drop([id('b')], id('c'), null)), 'into-itself');
  assert.equal(reason(drop([id('b')], id('b'), null)), 'into-itself');
  assert.equal(reason(drop([id('a'), id('d')], 'root', null)), 'non-contiguous');
  // a paragraph that adopts no list holds none (`listParent: container`)
  const flat = OurusDoc.parse('- a\n\npara\n', { config: { listParent: 'container' } });
  const flatId = (text: string): number => allNodes(flat).find((n) => nodePlainText(flat, n) === text)!.id;
  const r = executeCommand(OurusView.of(flat, { selection: caret }), {
    type: 'moveSubtree',
    nodes: [flatId('a')],
    to: { parent: flatId('para'), after: null },
  });
  assert.equal(reason(r), 'not-expressible');
});

test('a drop at its own place changes nothing, and one elsewhere says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const own = executeCommand(OurusView.of(doc, { selection: caret }), {
    type: 'moveSubtree',
    nodes: [id('b')],
    to: { parent: 'root', after: id('a') },
  });
  assert.ok(own instanceof OurusSuccess && own.changes.length === 0 && own.view.doc === doc);
  const r = executeCommand(OurusView.of(doc, { selection: caret }), {
    type: 'moveSubtree',
    nodes: [id('b')],
    to: { parent: id('d'), after: null },
  });
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  assert.equal(r.view.doc.text, '- a\n- d\n  - b\n    - c\n');
  assert.deepEqual(r.placed, [id('b')]);
  // the caret in `a`, which didn't move, stays there
  assert.equal(r.view.selection.head, 2);
});

test('a place named by ids survives an edit elsewhere', () => {
  const doc = OurusDoc.parse('- a\n- b\n- c\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const [b, c] = [id('b'), id('c')];
  const edited = doc.update({ changes: [{ from: 3, to: 3, insert: 'x' }] });
  const r = executeCommand(OurusView.of(edited, { selection: 0 }), {
    type: 'moveSubtree',
    nodes: [c],
    to: { parent: 'root', after: null },
  });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- c\n- ax\n- b\n');
  assert.equal(r instanceof OurusSuccess && r.view.doc.node(b)?.prev?.id, id('a'));
});

test('a structural command given nodes acts on them, the caret elsewhere staying in its text', () => {
  const doc = OurusDoc.parse('- a\n- b\n- c\n- d\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const run = (command: OurusCommand) => {
    const r = executeCommand(OurusView.of(doc, { selection: caret }), command);
    assert.ok(r instanceof OurusSuccess, command.type);
    return r instanceof OurusSuccess ? r : null!;
  };
  const indented = run({ type: 'indent', nodes: [id('c')] });
  assert.equal(indented.view.doc.text, '- a\n- b\n  - c\n- d\n');
  assert.equal(indented.view.selection.head, 2);
  const deleted = run({ type: 'deleteSubtree', nodes: [id('c'), id('d')] });
  assert.equal(deleted.view.doc.text, '- a\n- b\n');
  assert.equal(deleted.view.selection.head, 2);
  const duplicated = run({ type: 'duplicateSubtree', nodes: [id('d')] });
  assert.equal(duplicated.view.doc.text, '- a\n- b\n- c\n- d\n- d\n');
  assert.equal(duplicated.view.selection.head, 2);
  const moved = run({ type: 'moveSubtreeUp', nodes: [id('d')] });
  assert.equal(moved.view.doc.text, '- a\n- b\n- d\n- c\n');
  const copied = run({ type: 'copy', nodes: [id('b'), id('c')] });
  assert.equal(copied.clipboard?.['text/plain'], '- b\n- c\n');
  const refused = executeCommand(OurusView.of(doc, { selection: caret }), {
    type: 'indent',
    nodes: [id('b'), id('d')],
  });
  assert.equal(refused instanceof OurusRejected && refused.reason, 'non-contiguous');
});

test('a pickup takes the pressed node, its lines and its clipboard, and changes nothing', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const r = executeCommand(OurusView.of(doc, { selection: 2 }), { type: 'drag', pressed: id('b') });
  assert.ok(r instanceof OurusSuccess && r.dropMap);
  if (!(r instanceof OurusSuccess) || !r.dropMap) return;
  assert.equal(r.changes.length, 0);
  assert.deepEqual(r.dropMap.nodes, [id('b')]);
  assert.deepEqual(r.dropMap.lines, [[1, 3]]);
  assert.equal(r.clipboard?.['text/plain'], '- b\n  - c\n');
  // every point's drop is ready to run, and names the run
  for (const seam of r.dropMap.seams)
    for (const point of seam.points)
      assert.deepEqual(point.drop, {
        type: 'moveSubtree',
        nodes: [id('b')],
        to: { parent: point.parent, after: point.after },
      });
  const stale = executeCommand(OurusView.of(doc, { selection: 2 }), { type: 'drag', pressed: 999 });
  assert.equal(stale instanceof OurusRejected && stale.reason, 'no-such-node');
});

test('a pickup leaves out the places its drop refuses before writing', () => {
  // each drop it offers applies: below a fence nothing closes, the fence itself with something after
  // it, a heading under an item or as a heading's first child, a quote in a paragraph's list, an item
  // with no text of its own a paragraph, a rule in a list of its character's bullet
  const cases: [string, number][] = [
    ['charlie\n```', 1],
    ['1. alpha\n```', 1],
    ['# a\n```', 2],
    ['alpha\n\n```\nx', 1],
    ['## b\n## c\n- d', 1],
    ['alpha\n> - charlie', 2],
    ['- - charlie\n> delta', 1],
    ['- a\n  - x\n---', 3],
  ];
  // and from outside: a block in a paragraph's list, an item above indented code, a task a paragraph,
  // a `---` closing the one the document starts with into front matter
  const clipboards: [string, string, OurusConfig['flavor']?][] = [
    ['p\n\n- a', '---'],
    ['    code\n- a', '- g'],
    ['> alpha\n1. bravo', '- [ ] gt'],
    ['---\n\n- alpha\n', '---', 'obsidian'],
  ];
  const pickups = [
    ...cases.map(([text, node]) => ({
      text,
      command: { type: 'drag', nodes: [node] } as OurusCommand,
      flavor: undefined as OurusConfig['flavor'] | undefined,
    })),
    ...clipboards.map(([text, c, flavor]) => ({
      text,
      command: { type: 'drag', clipboard: { 'text/markdown': c, 'text/plain': c } } as OurusCommand,
      flavor,
    })),
  ];
  for (const { text, command, flavor } of pickups) {
    const doc = OurusDoc.parse(text, { config: { flavor } });
    const r = executeCommand(OurusView.of(doc, { selection: 0 }), command);
    assert.ok(r instanceof OurusSuccess && r.dropMap, text);
    if (!(r instanceof OurusSuccess) || !r.dropMap) continue;
    for (const seam of r.dropMap.seams) {
      for (const point of seam.points) {
        const dropped = executeCommand(OurusView.of(doc, { selection: 0 }), point.drop);
        assert.ok(
          dropped instanceof OurusSuccess,
          `${JSON.stringify(text)} at ${point.parent}, ${point.after}: ${dropped instanceof OurusRejected ? dropped.detail : ''}`,
        );
      }
    }
  }
  // and a drop there still refuses
  const doc = OurusDoc.parse('## b\n## c\n- d');
  const r = executeCommand(OurusView.of(doc, { selection: 0 }), {
    type: 'moveSubtree',
    nodes: [1],
    to: { parent: 3, after: null },
  });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('the nearest drop point: by column, then the own place, one that keeps the kind, the deeper', () => {
  const point = (depth: number, extra: Partial<DropPoint> = {}): DropPoint => ({
    parent: 'root',
    after: null,
    depth,
    listDepth: depth,
    current: false,
    converts: false,
    drop: { type: 'copy' },
    ...extra,
  });
  const seam = (points: DropPoint[]): DropSeam => ({
    beforeLine: 0,
    nodeAbove: null,
    nodeBelow: null,
    gapLines: 0,
    points,
  });
  const x = (p: DropPoint): number => p.listDepth * 20;
  const all = () => true;
  const [p0, p1, p2] = [point(0), point(1), point(2)];
  assert.equal(nearestDropPoint(seam([p0, p1, p2]), 22, x, all), p1);
  assert.equal(nearestDropPoint(seam([p0, p1, p2]), 500, x, all), p2);
  // a refused column resolves to the nearest accepted one, and none to nothing
  assert.equal(
    nearestDropPoint(seam([p0, p1, p2]), 18, x, (p) => p !== p1),
    p0,
  );
  assert.equal(
    nearestDropPoint(seam([p0, p1]), 0, x, () => false),
    null,
  );
  // columns that tie: the own place, then one that doesn't convert, then the deeper
  const own = point(1, { listDepth: 0, current: true });
  const converting = point(1, { listDepth: 0, converts: true });
  const deeper = point(2, { listDepth: 0 });
  assert.equal(nearestDropPoint(seam([p0, own]), 0, x, all), own);
  assert.equal(nearestDropPoint(seam([converting, p0]), 0, x, all), p0);
  assert.equal(nearestDropPoint(seam([p0, deeper]), 0, x, all), deeper);
});

test('a drag from outside offers the document as it is, each place a paste there', () => {
  const doc = OurusDoc.parse('- a\n- b\n');
  const clipboard = { 'text/plain': 'para\n' };
  const r = executeCommand(OurusView.of(doc, { selection: 2 }), { type: 'drag', clipboard });
  assert.ok(r instanceof OurusSuccess && r.dropMap);
  if (!(r instanceof OurusSuccess) || !r.dropMap) return;
  assert.deepEqual(r.dropMap.nodes, []);
  // no own place, no dead seam: the top, between, the end
  assert.equal(r.dropMap.seams.length, 3);
  for (const seam of r.dropMap.seams) {
    assert.ok(seam.points.length > 0);
    for (const point of seam.points) {
      assert.equal(point.current, false);
      assert.deepEqual(point.drop, { type: 'pasteAt', at: { parent: point.parent, after: point.after }, clipboard });
      // a paragraph among items is one (paste's fitting)
      assert.equal(point.converts, true);
    }
  }
  const empty = executeCommand(OurusView.of(doc, { selection: 2 }), { type: 'drag', clipboard: { 'text/plain': '' } });
  assert.equal(empty instanceof OurusRejected && empty.reason, 'not-expressible');
});

test('a drop from outside checks its place, and says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const paste = (parent: number | 'root', after: number | null) =>
    executeCommand(OurusView.of(doc, { selection: 2 }), {
      type: 'pasteAt',
      at: { parent, after },
      clipboard: { 'text/plain': '- x\n- y\n' },
    });
  const reason = (r: ReturnType<typeof paste>) => (r instanceof OurusRejected ? r.reason : resultStatus(r));
  assert.equal(reason(paste(999, null)), 'no-such-node');
  assert.equal(reason(paste(id('a'), id('b'))), 'invalid-insertion-point');
  const r = paste(id('b'), null);
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  assert.equal(r.view.doc.text, '- a\n- b\n  - x\n  - y\n');
  assert.deepEqual(
    r.placed!.map((n) => nodePlainText(r.view.doc, r.view.doc.node(n)!)),
    ['x', 'y'],
  );
  assert.equal(r.view.selection.head, 2);
});

test('the source of a drag out deletes its nodes only while they are what was dragged out', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const picked = executeCommand(OurusView.of(doc, { selection: caret }), { type: 'drag', pressed: id('b') });
  assert.ok(picked instanceof OurusSuccess && picked.clipboard);
  if (!(picked instanceof OurusSuccess)) return;
  const expectMarkdown = picked.clipboard!['text/plain']!;
  const removed = executeCommand(OurusView.of(doc, { selection: caret }), {
    type: 'deleteSubtree',
    nodes: [id('b')],
    expectMarkdown,
  });
  assert.equal(removed instanceof OurusSuccess && removed.view.doc.text, '- a\n- d\n');
  // a child added to the run during the drag: it wasn't carried, so the run stays
  const edited = doc.update({
    changes: [{ from: doc.text.indexOf('- d'), to: doc.text.indexOf('- d'), insert: '  - new\n' }],
  });
  const refused = executeCommand(OurusView.of(edited, { selection: caret }), {
    type: 'deleteSubtree',
    nodes: [id('b')],
    expectMarkdown,
  });
  assert.equal(refused instanceof OurusRejected && refused.reason, 'content-changed');
});

test("a text drag's deletion is a cut's, and the host's where ourus doesn't do it", () => {
  const doc = OurusDoc.parse('```\nx\n```\n');
  const r = executeCommand(OurusView.of(doc, { selection: { anchor: 4, head: 5 } }), { type: 'deleteByDrag' });
  assert.ok(r instanceof OurusDeferred);
});

test("the empty paragraph Enter makes after a title at a text's end, with no line ending, goes again", () => {
  // (it spans no characters, past the final line ending: its placeholder goes with it, or moves)
  for (const start of ['# x', 'x\n===']) {
    const entered = executeOnText(start, { type: 'enter' }, { caret: start.length });
    assert.ok(entered instanceof OurusSuccess);
    if (!(entered instanceof OurusSuccess)) continue;
    for (const type of ['deleteContentBackward', 'deleteSoftLineBackward', 'cut', 'moveSubtreeUp'] as const) {
      const r = executeCommand(entered.view, { type });
      assert.ok(
        r instanceof OurusSuccess,
        `${type} after Enter in ${JSON.stringify(start)}: ${r instanceof OurusRejected ? r.detail : ''}`,
      );
    }
    const back = executeCommand(entered.view, { type: 'deleteContentBackward' });
    if (back instanceof OurusSuccess) assert.equal(back.view.doc.rootNode.child(0).children.length, 0);
  }
});

test("Enter at the end of an unclosed fence at a text's end, with no line ending, makes an empty code line", () => {
  const r = executeOnText('```\ncode', { type: 'enter' }, { caret: 8 });
  assert.ok(r instanceof OurusSuccess);
  if (r instanceof OurusSuccess) assert.deepEqual([r.view.doc.text, r.view.selection.head], ['```\ncode\n\n', 9]);
});

test('a text whose lines end with a lone CR is edited as with LF', () => {
  for (const [type, text] of [
    ['duplicateSubtree', '- a\r- a\r- b'],
    ['enter', '- a\r- \r- b'],
  ] as const) {
    const r = executeOnText('- a\r- b', { type }, { caret: 3 });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, text, type);
  }
});

test("a duplicate of a node whose blank line ends the text, with no line ending, keeps the copy's", () => {
  const r = executeOnText('> a\n>', { type: 'duplicateSubtree' }, { caret: 2 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '> a\n\n> a\n\n');
});

test('a paste of a hundred thousand lines and more applies, as plain text and as Markdown', () => {
  const lines = 'x\n'.repeat(150000);
  for (const command of [
    { type: 'paste', clipboard: { 'text/plain': lines } },
    { type: 'pastePlain', text: lines },
  ] as const) {
    assert.equal(executeOnText('- a\n', command, { caret: 3 }) instanceof OurusSuccess, true, command.type);
  }
});

test('HTML whose text holds the characters a code span is held by in conversion keeps them', async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.parse('<p>a0b</p>').markdown, 'a0b');
  assert.equal(MdHtmlParser.parse('<p><code>x</code> 0</p>').markdown, '`x` 0');
});

test('text typed at once with a line break in quoted code keeps the quote, its fences grown past a typed one', () => {
  const r = executeOnText('> ```\n> PAYLOAD\n> ```\n> AFTER', { type: 'insertText', text: '`\nX' }, { caret: 5 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '> ````\n> X\n> PAYLOAD\n> ````\n> AFTER');
});

test('delete subtree given a node, the caret on its blank line, takes the caret with it', () => {
  const r = executeOnText('a\n ', { type: 'deleteSubtree', nodes: [1] }, { caret: 3 });
  assert.deepEqual(r instanceof OurusSuccess && [r.view.doc.text, r.view.selection.head], ['', 0]);
});

test('delete subtree given a node and its child takes the node, the child with it', () => {
  const r = executeOnText('- a\n  - b\n  - c\n- d\n', { type: 'deleteSubtree', nodes: [1, 2] });
  assert.deepEqual(r instanceof OurusSuccess && [r.view.doc.text, r.view.selection.head], ['- d\n', 2]);
});

test("outdent given a quote's paragraph, an item's text then, keeps a caret elsewhere where it is", () => {
  const doc = OurusDoc.parse('- z\n- > q\n- w\n', { config: { quotes: 'container' } });
  const r = executeCommand(OurusView.of(doc, { selection: 12 }), { type: 'outdent', nodes: [4] });
  assert.deepEqual(r instanceof OurusSuccess && [r.view.doc.text, r.view.selection.head], ['- z\n- q\n- w\n', 10]);
  const code = executeOnText(
    '    - bravo\n- > bravo',
    { type: 'outdent', nodes: [4] },
    { caret: 9, config: { quotes: 'container' } },
  );
  assert.deepEqual(code instanceof OurusSuccess && [code.view.doc.text, code.view.selection.head], [
    '    - bravo\n- bravo',
    9,
  ]);
});

test("a selection whose ends aren't positions in the text is refused, whatever the command", () => {
  const doc = OurusDoc.parse('- a\n  - b\n');
  for (const selection of [
    { anchor: -1, head: -1 },
    { anchor: 11, head: 11 },
    { anchor: 0, head: NaN },
    { anchor: 1.5, head: 2 },
    { anchor: Infinity, head: Infinity },
  ]) {
    for (const type of ['indent', 'cut', 'copy', 'fold', 'enter'] as const) {
      const r = executeCommand(OurusView.of(doc, { selection: selection }), { type });
      assert.equal(
        r instanceof OurusRejected && r.reason,
        'invalid-selection',
        `${type} at ${JSON.stringify(selection)}`,
      );
    }
  }
});

test('a text ending in a blank line with no line ending keeps it a blank line where a command writes it again', () => {
  const cases: [string, OurusCommand, number, number, string, Partial<OurusConfig>?][] = [
    ['>>\n\t', { type: 'outdent' }, 4, 4, '>\n\t'],
    ['+\n ', { type: 'duplicateSubtree' }, 3, 3, '+\n+ \n\n'],
    ['x\n- y\n ', { type: 'indent' }, 0, 2, '- x\n  - y\n '],
    ['> a\n>', { type: 'duplicateSubtree' }, 2, 2, '> a\n>\n> a\n>', { quotes: 'container' }],
    ['-\t```\nc\n\t', { type: 'moveSubtreeDown' }, 0, 0, 'c\n- ```'],
  ];
  for (const [text, command, anchor, head, want, config] of cases) {
    const r = executeOnText(text, command, { anchor, head, config: config ?? {} });
    assert.equal(
      r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r.detail ?? ''}`,
      want,
      JSON.stringify(text),
    );
  }
});

test('a list pasted after an unclosed fence that would own it is refused: it would be a line of the code', () => {
  const r = executeOnText(
    '```',
    { type: 'paste', clipboard: { 'text/plain': '- x\n- y' } },
    { caret: 3, config: { listParent: 'block' } },
  );
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('an empty line written after a lone CR, an old LF line after it, keeps three line breaks', () => {
  const r = executeOnText(
    'a\r\rc\n\nc\n',
    { type: 'deleteSoftLineBackward' },
    { caret: 4, config: { flavor: 'obsidian' } },
  );
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, 'a\r\r\r\n\nc\n');
  const code = executeOnText('- ```\n\n\n```b\n```', { type: 'deleteContentForward' }, { caret: 10 });
  assert.equal(code instanceof OurusSuccess && code.view.doc.text, '- ```\n\n\n');
});

test("a lone CR before a blank line's spaces, both lines copied: the spaces gone, the CR written as an LF, the blank line kept", () => {
  for (const type of ['enter', 'duplicateSubtree', 'outdent'] as const) {
    const r = executeOnText('- - a\r  \n', { type }, { caret: 4 });
    assert.ok(r instanceof OurusSuccess, type);
  }
  const r = executeOnText('- - a\r  \n', { type: 'enter' });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- - \n  - a\n\n');
});

test("Enter at the end of a quote of a text with no final line break: the empty quoted line ends the text, as an item's does", () => {
  for (const [text, at, want] of [
    ['> a', 3, '> a\n> '],
    ['> q\n> rs', 8, '> q\n> rs\n> '],
    ['- a', 3, '- a\n- '],
    ['> a\n', 3, '> a\n> \n'],
  ] as const) {
    const r = executeOnText(text, { type: 'enter' }, { caret: at });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, want, text);
  }
});

test("Backspace on an empty last item after a folded one keeps the blank lines inside the folded one; a quote's paragraph outdented, its last blank `>` with no line ending, the quote gone", () => {
  const view = OurusView.of(OurusDoc.parse('- a\n\n  p\n\n  -\n-')).withFolded([1]);
  const r = executeCommand(view.withSelection(15), { type: 'deleteContentBackward' });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- a\n\n  p\n\n  -');
  const out = executeOnText('> a\n>', { type: 'outdent', nodes: [2] }, { caret: 2, config: { quotes: 'container' } });
  assert.equal(out instanceof OurusSuccess && out.view.doc.text, 'a\n\n');
});

test("Enter in a nested item on its quoted parent's marker line, no space after the `>`: the new item at its sibling's column, the quote written in normal form, `> ` (B57; normalized, decided 2026-11-11)", () => {
  const r = executeOnText('>0. - h\n', { type: 'enter' }, { caret: 7 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '> 0. - h\n>    - \n');
  const before = executeOnText('>0. - h\n', { type: 'enter' }, { caret: 6 });
  assert.equal(before instanceof OurusSuccess && before.view.doc.text, '> 0. - \n>    - h\n');
});

test("a quote atom's Enter, Shift-Enter and plain paste read its lines as the document does: tabs kept where they were, CRLF, an item's quote, the caret in markup (B198–B201)", () => {
  // [drawn start, command, config, drawn result or `rejected <reason>`]; ┃ the caret, ┊ a selection's head
  const enter: OurusCommand = { type: 'enter' };
  const shiftEnter: OurusCommand = { type: 'shiftEnter' };
  const rows: [string, OurusCommand, Partial<OurusConfig>, string][] = [
    // tabs: each character of the prefix at the column it was at, a marker as spaces but its tab
    ['>\t- a┃', enter, {}, '>\t- a\n>\t- ┃'],
    ['>\t- a┃', shiftEnter, {}, '>\t- a\n>\t  ┃'],
    ['> -\ta┃', shiftEnter, {}, '> -\ta\n>  \t┃'],
    ['>\t>\ta┃', enter, {}, '>\t>\ta\n>\t> ┃'],
    ['> 1.\t- a┃', enter, {}, '> 1.\t- a\n>   \t- ┃'],
    ['> 1.\t- a┃', shiftEnter, {}, '> 1.\t- a\n>   \t  ┃'],
    ['  >\t- a┃', enter, {}, '  >\t- a\n  >\t- ┃'],
    // (a tab and spaces to one column are one list)
    ['> \t1. a┃\n>   2. b', enter, {}, '> \t1. a\n> \t2. ┃\n>   3. b'],
    // CRLF: the note's line ending, a widened marker's lines moved
    ['> 8. a┃\r\n> 9. b\r\n>    c', enter, {}, '> 8. a\r\n> 9. ┃\r\n> 10. b\r\n>     c'],
    // a quote that is an item's text: its lines past the item's indentation
    ['- > 1. a┃\n  > 2. b', enter, {}, '- > 1. a\n  > 2. ┃\n  > 3. b'],
    ['1. > 8. a┃\n   > 9. b\n   >    c', enter, {}, '1. > 8. a\n   > 9. ┃\n   > 10. b\n   >     c'],
    ['- > - a┃', shiftEnter, {}, '- > - a\n  >   ┃'],
    // the list's bullet and delimiter; numbers as written where unchanged, the list renumbered from its first
    ['> * a┃', enter, {}, '> * a\n> * ┃'],
    ['> 1) a┃', enter, {}, '> 1) a\n> 2) ┃'],
    // (a list numbered alike too, as every text editor numbers it)
    ['> 1. a┃\n> 1. b', enter, {}, '> 1. a\n> 2. ┃\n> 3. b'],
    ['> 1. a┃\n> 2. b\n> 5. c', enter, {}, '> 1. a\n> 2. ┃\n> 3. b\n> 4. c'],
    ['> 1. a┃\n> 2. b\n> 5. c', enter, { orderedLists: 'shift' }, '> 1. a\n> 2. ┃\n> 3. b\n> 5. c'],
    ['> 007. a┃\n> 008. b', enter, {}, '> 007. a\n> 8. ┃\n> 9. b'],
    ['> 999999998. a┃', enter, {}, '> 999999998. a\n> 999999999. ┃'],
    // a task's checkbox is the outline's, every flavor; `enterTask`
    ['> - [ ] a┃', enter, { flavor: 'commonmark' }, '> - [ ] a\n> - [ ] ┃'],
    ['> - [x] a┃', enter, { enterTask: 'plain' }, '> - [x] a\n> - ┃'],
    ['> 1. [x] a┃\n> 2. b', enter, {}, '> 1. [x] a\n> 2. [ ] ┃\n> 3. b'],
    ['> - [ ]┃', enter, {}, '> ┃'],
    // the spaces at the caret, as `enterSplitSpace` says; not in code
    ['> - a┃ b', enter, {}, '> - a\n> - ┃b'],
    ['> - a ┃b', enter, {}, '> - a \n> - ┃b'],
    ['> - a ┃b', enter, { enterSplitSpace: 'trim' }, '> - a\n> - ┃b'],
    ['> - a┃ b', enter, { enterSplitSpace: 'start' }, '> - a\n> - ┃ b'],
    ['> ```\n> a┃ b\n> ```', enter, {}, '> ```\n> a\n> ┃ b\n> ```'],
    // a caret in the line's markup, its `>` or its item's marker or checkbox, as at its text's start
    ['> 1┃0. a', enter, {}, '> 10. \n> 11. ┃a'],
    ['> - ┃[x] task', enter, {}, '> - [x] \n> - [ ] ┃task'],
    ['> 1. First\n┃> 2. Second\n> 3. Third', enter, {}, '> 1. First\n> 2. \n> 3. ┃Second\n> 4. Third'],
    ['> 1. a\n┃> 2. ', enter, {}, '> 1. a\n> ┃'],
    ['> - parent\n>   - child\n┃>   - ', enter, {}, '> - parent\n>   - child\n> - ┃'],
    // a line with nothing past its prefix, no marker of its own, is the quote's: its empty last line leaves it
    ['> - a\n> ┃', enter, {}, '> - a\n\n┃'],
    ['> - a\n┃> ', enter, {}, '> - a\n\n┃'],
    // `>- a`: the next line's `>` takes a blank this one has none of, so `>  - b` is a sibling
    ['>- a\n>  - b\n>  - ┃', enter, {}, '>- a\n>  - b\n> ┃'],
    ['>- a┃', shiftEnter, {}, '>- a\n> ┃'],
    // nested quotes, and the quote's own `>` alone
    ['> > 1. a┃\n> > 2. b\n> c', enter, {}, '> > 1. a\n> > 2. ┃\n> > 3. b\n> c'],
    ['> > - ┃', enter, {}, '> > ┃'],
    ['> a\nlazy┃', enter, {}, '> a\nlazy\n> ┃'],
    // (an underline of the paragraph above, no item: the quote's line, no list's)
    ['> - p\n>\n> q\n>   -┃', enter, {}, '> - p\n>\n> q\n>   -\n> ┃'],
    // Shift-Enter: lazy where the document reads the quote so as one, by the readback; refused at the
    // quote's start, its indentation too
    ['> a┃b', shiftEnter, {}, '> a\n┃b'],
    ['  ┃> a', shiftEnter, {}, 'rejected not-expressible'],
    [' ┃ > a', shiftEnter, {}, 'rejected not-expressible'],
    ['> a┃- b', shiftEnter, {}, '> a\n> ┃- b'],
    ['> ┃b', shiftEnter, {}, '> \n> ┃b'],
    // a selection in one quote, across its lines
    ['> - a┃b\n> - c┊d', enter, {}, '> - a\n> - ┃d'],
    // plain paste in the spaces the quote is indented by: at its start (PastePlain27)
    ['  ┃> a', { type: 'pastePlain', text: '\n' }, {}, 'rejected not-expressible'],
    ['> - a┃', { type: 'pastePlain', text: 'x\ny' }, {}, '> - ax\n>   y┃'],
    // an empty item not last in its list: as `enterOnEmptyItem` says; the last outdents with every value
    ['> - a\n> - ┃\n> - b', enter, { enterOnEmptyItem: 'sibling' }, '> - a\n> - \n> - ┃\n> - b'],
    ['> 1. a\n> 2. ┃\n> 3. b', enter, { enterOnEmptyItem: 'sibling' }, '> 1. a\n> 2. \n> 3. ┃\n> 4. b'],
    ['> - a\n> - ┃\n> - b', enter, { enterOnEmptyItem: 'outdent' }, '> - a\n> ┃\n> - b'],
    ['> - a\n>   - x\n>   - ┃\n>   - b', enter, { enterOnEmptyItem: 'outdent' }, '> - a\n>   - x\n> - ┃\n>   - b'],
    ['> - a\n> - ┃\n> - b', enter, { enterOnEmptyItem: 'exit' }, '> - a\n> ┃\n> - b'],
    [
      '> - a\n>   - x\n>   - ┃\n>   - b',
      enter,
      { enterOnEmptyItem: 'exit' },
      '> - a\n>   - x\n>   - \n>   - ┃\n>   - b',
    ],
    ['> - a\n>   - x\n>   - ┃\n>   - b', enter, { enterOnEmptyItem: 'unwrap' }, '> - a\n>   - x\n>   ┃\n>   - b'],
    ['> - a\n>   - x\n>   - ┃', enter, { enterOnEmptyItem: 'sibling' }, '> - a\n>   - x\n> - ┃'],
    ['> - a\n> - ┃', enter, { enterOnEmptyItem: 'sibling' }, '> - a\n> ┃'],
  ];
  for (const [drawn, command, config, want] of rows) {
    const anchor = drawn.indexOf('┃');
    const plain = drawn.replace('┃', '');
    const head = plain.indexOf('┊') < 0 ? anchor : plain.indexOf('┊');
    const r = executeOnText(plain.replace('┊', ''), command, { anchor, head, config: { quotes: 'atom', ...config } });
    const got =
      r instanceof OurusSuccess
        ? r.view.doc.text.slice(0, r.view.selection.head) + '┃' + r.view.doc.text.slice(r.view.selection.head)
        : r instanceof OurusRejected
          ? `rejected ${r.reason}`
          : r.constructor.name;
    assert.equal(got, want, `${JSON.stringify(drawn)} ${command.type} ${JSON.stringify(config)}`);
  }
});

test("indenting an empty quote atom that carries a block id is refused: the id would be the item's (B31)", () => {
  const run = (text: string) =>
    executeOnText(text, { type: 'indent' }, { caret: 1, config: { flavor: 'obsidian', quotes: 'atom' } });
  const r = run('>\n^id');
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible');
  const ok = run('> q\n^id');
  assert.equal(ok instanceof OurusSuccess && ok.view.doc.text, '- > q\n  ^id');
});

test('indented code copied out of a quote whose `>` took part of a tab: the rest of the tab as spaces, the payload as it was (B93)', () => {
  const r = executeOnText('>\t    code', { type: 'copy', nodes: [2] });
  assert.equal(r instanceof OurusSuccess && r.clipboard?.['text/plain'], '      code\n');
});

test('a CRLF typed in a code block in a container is a line of the payload, as an LF', () => {
  const r = executeOnText('-\n  ```\n  x', { type: 'insertText', text: '\r\n' }, { caret: 11 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '-\n  ```\n  x\n  ');
});

test("the block-id guard finds a line's start past a lone CR: a soft Backspace in a later block is the host's", () => {
  for (const nl of ['\n', '\r', '\r\n']) {
    const text = ['p ^id', '', '<div>', 'text', '</div>'].join(nl);
    const r = executeOnText(
      text,
      { type: 'deleteSoftLineBackward' },
      { caret: 16 + 3 * (nl.length - 1), config: { flavor: 'obsidian' } },
    );
    assert.ok(r instanceof OurusDeferred, JSON.stringify(nl));
  }
});

test('indented code moved into a quote with no space after its `>` keeps its four columns past the space the `>` takes', () => {
  const r = executeOnText(
    '    x\n>',
    { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } },
    { config: { flavor: 'obsidian' } },
  );
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '>\n>     x');
});

test("a quote paragraph whose first line is one space further in (`>  b`) moved up onto an item's marker line: the space goes with it", () => {
  for (const [config, text, at, out] of [
    [{ quotes: 'container' }, '- > a\n  >\n  >  b\n', 15, '- >  b\n  >\n  > a\n'],
    [
      { flavor: 'commonmark', indentUnit: 'tab' },
      '1. num\n2. > quot\n   >\n   >  e\n   > more\n',
      27,
      '1. num\n2. >  e\n   > more\n   >\n   > quot\n',
    ],
    // (the moved line spelled with a tab for the `>`'s space, `>→ e`: the marker over it spans as far)
    [
      { indentUnit: 'tab' },
      '- num\n- > quot\n  >\n  >  e\n  > more\n',
      23,
      '- num\n- >  e\n  >\tmore\n  >\n  >\tquot\n',
    ],
  ] as const) {
    const r = executeOnText(text, { type: 'moveSubtreeUp' }, { caret: at, config });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, out);
  }
});

test("a node dropped first into a quote on an item's marker line: the marker over the quote's `>→`", () => {
  for (const [text, out] of [
    ['-\n- > q', '- > - \n  >\tq'],
    ['- > q\n\np', '- > p\n  >\n  >\tq'],
    ['- > q\n\n```\nc\n```', '- > ```\n  >\tc\n  >\t```\n  >\n  >\tq'],
  ] as const) {
    const doc = OurusDoc.parse(text, { config: { quotes: 'container', indentUnit: 'tab' } });
    const quote = doc.root.children.flatMap((c) => [c, ...c.children]).find((c) => c.kind === 'quote')!;
    const moved = text.startsWith('-\n') ? doc.root.children[0]! : doc.root.children.at(-1)!;
    const r = executeCommand(OurusView.of(doc, { selection: 0 }), {
      type: 'moveSubtree',
      nodes: [moved.id],
      to: { parent: quote.id, after: null },
    });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, out, text);
  }
});

test('an item whose marker shares its line with its quote, dropped first under the item above across 9/10: its quote named past the new marker', () => {
  const r = executeOnText(
    '9. b\n10. > q\n    > r\n',
    { type: 'moveSubtree', nodes: [2], to: { parent: 1, after: null } },
    { config: { quotes: 'container' } },
  );
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '9. b\n   1. > q\n      > r\n');
});

test('outdenting mixed-depth roots, an empty item in a quote led by `>  ` among them', () => {
  const r = executeOnText(
    '>  -\n- a\n\n  x',
    { type: 'outdent' },
    { anchor: 2, head: 13, config: { indentUnit: 'tab' } },
  );
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- \n- a\n\n  x');
});

test("a duplicate or a paste writes a footnote or reference definition as it is, a label the note defines too: labels needn't be unique, the host's to keep so, as block ids (B228)", () => {
  assert.equal(
    appliedText(executeOnText('[^1]: foo\nx', { type: 'duplicateSubtree' }, { caret: 9 })),
    '[^1]: foo\nx\n[^1]: foo\nx',
  );
  assert.equal(
    appliedText(executeOnText('[a]: http://x', { type: 'duplicateSubtree' }, { caret: 13 })),
    '[a]: http://x\n[a]: http://x',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- a[^1]\n\n[^1]: n1',
        { type: 'paste', clipboard: { 'text/plain': '[^1]: other\n' } },
        { caret: 17 },
      ),
    ),
    '- a[^1]\n\n[^1]: n1\n\n[^1]: other',
  );
});

test("a footnote definition dropped first under an empty item is refused, as code there is: it would be read as the item's text", () => {
  const r = executeOnText(
    '0.',
    { type: 'pasteAt', clipboard: { 'text/plain': '[^b]: x' }, at: { parent: 1, after: null } },
    { caret: 2 },
  );
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('a heading pasted into an item of a tab-indented text under `indentUnit: 2`: where its item would take in the paragraph after it, refused', () => {
  const r = executeOnText(
    '-\n\ta\n\n\te',
    { type: 'paste', clipboard: { 'text/plain': '# X\n' } },
    { caret: 4, config: { indentUnit: 2 } },
  );
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
  const tabs = executeOnText('-\n\ta\n\n\te', { type: 'paste', clipboard: { 'text/plain': '# X\n' } }, { caret: 4 });
  assert.ok(tabs instanceof OurusSuccess);
});

test("a paragraph `[!e]` moved into an empty quote, its first line, would read as its callout title: refused in Obsidian; in GFM, without callouts, the quote's text", () => {
  const r = executeOnText('>\n[!e]\n', { type: 'indent' }, { caret: 6, config: { flavor: 'obsidian' } });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
  const gfm = executeOnText('>\n[!e]\n', { type: 'indent' }, { caret: 6 });
  assert.equal(gfm instanceof OurusSuccess && gfm.view.doc.text, '> [!e]\n');
});

test("the differential's last write failures, in HEAD too: each writes", () => {
  const cases: [string, OurusCommand, number, number, Partial<OurusConfig>?][] = [
    ['- [a]:u\nT\n', { type: 'pastePlain', text: '1. a\n2. b\n' }, 9, 9, { flavor: 'commonmark' }],
    ['- - a\n  - b\n', { type: 'paste', clipboard: { 'text/plain': '> # q\n' } }, 4, 11],
    ['\t\n1. -', { type: 'paste', clipboard: { 'text/plain': 'x\n- ' } }, 6, 6],
    ['- -', { type: 'paste', clipboard: { 'text/plain': '>y' } }, 3, 3, { quotes: 'container' }],
    ['>a\n>\n>z\n>  e\n', { type: 'pastePlain', text: '- x **b**\n\t- y\n- z' }, 11, 12, { flavor: 'obsidian' }],
  ];
  for (const [text, command, anchor, head, config] of cases) {
    const r = executeOnText(text, command, { anchor, head, config: config ?? {} });
    assert.ok(r instanceof OurusSuccess, `${JSON.stringify(text)}: ${'detail' in r ? r.detail : ''}`);
  }
});

test('ledger cases a later fix took along write: each applies', () => {
  const cases: [string, OurusCommand, number, number, string, Partial<OurusConfig>?][] = [
    ['>\t  k', { type: 'pastePlain', text: 'x\ny' }, 5, 5, '>     kx\n>     y'],
    ['>\t  a\n a', { type: 'indent' }, 6, 6, '>\t  a\n>  a'],
    ['>- e\n\t>', { type: 'outdent' }, 0, 0, '- e\n  \t\\>'],
    ['0. -', { type: 'duplicateSubtree' }, 0, 4, '0. -\n1. -'],
    ['2) 0.\r+\r0.', { type: 'moveSubtreeDown' }, 3, 3, '+\r0. 0.\r1.'],
    ['- a\n\n  b\n# H\n  c', { type: 'moveSubtreeDown' }, 2, 2, '# H\n- a\n\n  b\n\nc'],
  ];
  for (const [text, command, anchor, head, want, config] of cases) {
    const r = executeOnText(text, command, { anchor, head, config: config ?? {} });
    assert.equal(
      r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r.detail ?? ''}`,
      want,
      JSON.stringify(text),
    );
  }
});

test('a line break typed at the start of an opening fence: a blank line above the block, in a section and in an item too', () => {
  const typed = (text: string, config = {}) => {
    const at = text.search(/```|\$\$/);
    const r = executeOnText(text, { type: 'insertText', text: '\n' }, { caret: at, config });
    assert.ok(
      r instanceof OurusSuccess || r instanceof OurusDeferred,
      `${JSON.stringify(text)}: ${r instanceof OurusRejected ? r.detail : ''}`,
    );
    return r instanceof OurusSuccess ? { text: r.view.doc.text, caret: r.view.selection.head } : null;
  };
  assert.deepEqual(typed('## N\n\n```\nx\n```\n'), { text: '## N\n\n\n```\nx\n```\n', caret: 7 });
  assert.deepEqual(typed('a\n## N\n```\nx\n```\n'), { text: 'a\n## N\n\n```\nx\n```\n', caret: 8 });
  assert.deepEqual(typed('- a\n  ```\n  code\n  ```\n'), { text: '- a\n\n  ```\n  code\n  ```\n', caret: 7 });
  assert.deepEqual(typed('p\n\n$$\nx\n$$\n', { flavor: 'obsidian' }), { text: 'p\n\n\n$$\nx\n$$\n', caret: 4 });
});

test("a copy of code keeps the spaces of its blank lines, which are the code's (fenced, indented, in an item)", () => {
  const clip = (text: string, nodes: number[]) => {
    const r = executeOnText(text, { type: 'copy', nodes });
    assert.ok(r instanceof OurusSuccess);
    return r.clipboard?.['text/plain'];
  };
  assert.equal(clip('```\n  \n```\n', [1]), '```\n  \n```\n');
  assert.equal(clip('p\n\n    a\n      \n    b\n', [2]), '    a\n      \n    b\n');
  assert.equal(clip('- x\n  ```\n    \n  ```\n', [1]), '- x\n  ```\n    \n  ```\n');
  // (a blank line of text, taken whole, is empty)
  assert.equal(clip('a\n  \nb\n', [1]), 'a\n');
});

test('code indented into a quote keeps the spaces of a line that has nothing else', () => {
  for (const [text, at] of [
    ['>\n```\n  \n```\n', 4],
    ['> q\n\n```\n  \n```\n', 7],
  ] as const) {
    const r = executeOnText(text, { type: 'indent' }, { caret: at, config: { quotes: 'container' } });
    assert.ok(r instanceof OurusSuccess, `${JSON.stringify(text)}: ${r instanceof OurusRejected ? r.detail : ''}`);
    const code = [...r.view.doc.rootNode.children]
      .flatMap(function all(n): OurusNode[] {
        return [n, ...n.children.flatMap(all)];
      })
      .find((n) => n.kind === 'atom');
    assert.ok(code && r.view.doc.textOf(code)!.text.includes('\n  \n'), JSON.stringify(r.view.doc.text));
  }
});

test("a line break in an image's alt text is a space: the image pasted inline, where the caret is", () => {
  const r = executeOnText(
    '# ab',
    { type: 'paste', clipboard: { 'text/html': '<img src="x" alt="one&#10;two">' } },
    { caret: 3 },
  );
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '# a![one two](x)b');
});

test("indented code copied with ourus and pasted into an empty note is indented code still; a plain text's shared indentation goes", () => {
  const copied = executeOnText('p\n\n    code1\n    code2\n', { type: 'copy', nodes: [2] });
  assert.ok(copied instanceof OurusSuccess && copied.clipboard);
  const pasted = executeOnText('', { type: 'paste', clipboard: copied.clipboard });
  assert.ok(pasted instanceof OurusSuccess);
  assert.equal(pasted.view.doc.text, '    code1\n    code2\n');
  const plain = executeOnText('', { type: 'paste', clipboard: { 'text/plain': '    - c\n      - d\n' } });
  assert.ok(plain instanceof OurusSuccess);
  assert.equal(plain.view.doc.text, '- c\n  - d\n');
});

test('a link or image from HTML keeps its destination: an entity-like `&`, a last backslash and a line break in it stay what they were', async () => {
  const { MdHtmlParser, MdTree, MdFlavor } = await import('../../src/parser/index.ts');
  const href = (html: string): string | undefined =>
    /href="([^"]*)"|src="([^"]*)"/
      .exec(MdTree.parse(MdHtmlParser.parse(html).markdown, MdFlavor.gfm).renderHtml())
      ?.slice(1)
      .find((x) => x !== undefined);
  assert.equal(href('<a href="https://x.test/?q=&amp;copy;">l</a>'), 'https://x.test/?q=&amp;copy;');
  assert.equal(href('<a href="https://x.test/a\\">l</a>'), 'https://x.test/a%5C');
  assert.equal(href('<a href="https://x.test/a&#10;b">l</a>'), 'https://x.test/a%0Ab');
  assert.equal(href('<img src="x&amp;amp;y.png" alt="i">'), 'x&amp;amp;y.png');
});

test('HTML conversion: an uppercase checkbox type, a title, an image without source, a script link in any case, a code block of one empty line', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<ul><li><input type="CHECKBOX" checked>done</li></ul>'), '- [x] done');
  assert.equal(md('<a href="x" title="tip">a</a>'), '[a](x "tip")');
  assert.equal(md('<img src="x" alt="a" title="tip">'), '![a](x "tip")');
  assert.equal(md('<p><img alt="diagram"></p>'), 'diagram');
  assert.equal(md('<a href="JaVaScRiPt:alert(1)">x</a>'), 'x');
  assert.equal(md('<pre><code>\n</code></pre>'), '```\n\n```');
  assert.equal(md('<pre><code></code></pre>'), '```\n```');
});

test("HTML conversion: no script in code, a pre of several codes whole, a page's language class not the code's, underscore runs escaped whole", async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<pre>a<script>hidden()</script>b</pre>'), '```\nab\n```');
  assert.equal(md('<pre><code>a</code> + <code>b</code></pre>'), '```\na + b\n```');
  assert.equal(
    md('<div class="language-en"><div class="highlight-source-python"><pre><code>print(1)</code></pre></div></div>'),
    '```python\nprint(1)\n```',
  );
  assert.equal(md('<p><b>x</b> __a__</p>'), '**x** \\_\\_a\\_\\_');
  assert.equal(md('<p><b>x</b> snake_case_name</p>'), '**x** snake_case_name');
});

test("a bracket `autoClose` lists pairs in code, wraps a selection there, and its closer is stepped over; not on a fence's line; a callout title it would make is the host's", () => {
  const run = (text: string, anchor: number, head: number, typed: string, config = {}) =>
    executeOnText(text, { type: 'insertText', text: typed }, { anchor, head, config: { autoClose: ['('], ...config } });
  const wrapped = run('```\nvalue\n```\n', 4, 9, '(');
  assert.ok(wrapped instanceof OurusSuccess);
  assert.equal(wrapped.view.doc.text, '```\n(value)\n```\n');
  assert.deepEqual(wrapped.view.selection, { anchor: 5, head: 10 });
  const paired = run('- ```\n  value\n  ```\n', 13, 13, '(');
  assert.equal(paired instanceof OurusSuccess && paired.view.doc.text, '- ```\n  value()\n  ```\n');
  if (paired instanceof OurusSuccess) {
    const over = executeCommand(paired.view, { type: 'insertText', text: ')' });
    assert.ok(
      over instanceof OurusSuccess && over.view.doc.text === paired.view.doc.text && over.view.selection.head === 15,
    );
  }
  assert.ok(run('```\nvalue\n```\n', 3, 3, '(') instanceof OurusDeferred, 'the info string');
  assert.ok(
    run('> [!note Title\n> Body\n', 8, 8, '[', { flavor: 'obsidian', quotes: 'container', autoClose: ['['] }) instanceof
      OurusDeferred,
  );
});

test("HTML conversion: table spans keep columns, a backslashed pipe in a cell's code, list counters and kinds, Word lists apart, footnotes, plain text for code", async () => {
  const { MdHtmlParser } = await import('../../src/parser/html-parser.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  // (B122) a cell spanning columns or rows: the ones it spans empty
  assert.equal(
    md('<table><tr><th>A</th><th>B</th><th>C</th></tr><tr><td colspan="2">x</td><td>c</td></tr></table>'),
    '| A | B | C |\n| --- | --- | --- |\n| x |  | c |',
  );
  assert.equal(
    md('<table><tr><th>A</th><th>B</th></tr><tr><td rowspan="2">x</td><td>1</td></tr><tr><td>2</td></tr></table>'),
    '| A | B |\n| --- | --- |\n| x | 1 |\n|  | 2 |',
  );
  // (B115) code with a backslash before a pipe: its text, escaped, the cell whole
  const table = md('<table><tr><th>x</th><th>y</th></tr><tr><td><code>\\|secret</code></td><td>end</td></tr></table>');
  assert.match(OurusDoc.parse(table).mdTree.renderHtml(), /<td>\\\|secret<\/td>\n<td>end<\/td>/);
  // (B125) counters: an item's value, reversed, past nine digits
  assert.equal(md('<ol><li value="5">a</li><li>b</li></ol>'), '5. a\n6. b');
  assert.equal(md('<ol reversed><li>a</li><li>b</li></ol>'), '2. a\n\n1) b');
  assert.equal(md('<ol start="999999999"><li>a</li><li>b</li></ol>'), '999999999. a\n\n- b');
  // (B123, B138) Word's lists, each its own and of its kind; a glyph outside one is text
  const word = (id: string, glyph: string, text: string): string =>
    `<p style="mso-list:${id} level1 lfo1"><span style="mso-list:Ignore">${glyph}</span>${text}</p>`;
  assert.equal(md(word('l0', '1.', 'one') + word('l1', '•', 'two')), '1. one\n\n- two');
  assert.equal(md('<p>header</p><p><span style="mso-list:Ignore">1.</span> one</p>'), 'header\n\n1\\. one');
  // (B141) footnotes as GFM renders them read back as footnotes
  const source = 'Footnote[^1].\n\n[^1]: the note\n';
  assert.equal(md(OurusDoc.parse(source).mdTree.renderHtml()), source.trimEnd());
  // (B133) a clipboard of HTML alone pasted into code: its text
  const r = executeOnText(
    '- ```\n  a\n  ```',
    { type: 'paste', clipboard: { 'text/html': '<p><b>x</b></p><p>y</p>' } },
    { caret: 9 },
  );
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- ```\n  ax\n\n  y\n  ```');
  assert.equal(
    MdHtmlParser.plainText('<ul><li>a</li><li>b</li></ul><table><tr><td>c</td><td>d</td></tr></table><pre>  e</pre>'),
    'a\nb\n\nc\td\n\n  e',
  );
});

test('`orderedLists: shift` keeps the numbers written, a new item numbered on from the one above, and the run counting on from it shifting with it; `renumber`, the default, numbers the list from its first', () => {
  const text = (t: string, at: number, command: OurusCommand, config = {}) => {
    const r = executeOnText(t, command, { caret: at, config });
    return r instanceof OurusSuccess ? r.view.doc.text : r.constructor.name;
  };
  const shift = { orderedLists: 'shift' };
  assert.equal(text('1. a\n9. c\n', 9, { type: 'enter' }), '1. a\n2. c\n3. \n');
  assert.equal(text('1. a\n9. c\n', 9, { type: 'enter' }, shift), '1. a\n9. c\n10. \n');
  assert.equal(text('1. a\n9. c\n', 4, { type: 'enter' }, shift), '1. a\n2. \n9. c\n');
  assert.equal(text('1. a\n2. b\n3. c\n', 4, { type: 'enter' }, shift), '1. a\n2. \n3. b\n4. c\n');
  assert.equal(text('1. a\n2. b\n3. c\n', 8, { type: 'deleteSubtree' }, shift), '1. a\n3. c\n');
});

test('Shift-Tab on a top-level item: a paragraph in place, the items after it its list; refused with `outdentTopLevel: refuse`', () => {
  const run = (config = {}) => executeOnText('- a\n- b\n- c\n', { type: 'outdent' }, { caret: 6, config });
  const r = run();
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- a\n\nb\n- c\n');
  const refused = run({ outdentTopLevel: 'refuse' });
  assert.ok(refused instanceof OurusRejected && refused.reason === 'at-top-level');
});

test('HTML `<br>` pastes as a line of the paragraph, or with `pasteHtmlBreak: hard` a hard break; `<br><br>` a paragraph break either way', () => {
  const paste = (html: string, config = {}) => {
    const r = executeOnText('', { type: 'paste', clipboard: { 'text/html': html } }, { config });
    return r instanceof OurusSuccess ? r.view.doc.text : r.constructor.name;
  };
  assert.equal(paste('<p>a<br>b</p>'), 'a\nb\n');
  assert.equal(paste('<p>a<br>b</p>', { pasteHtmlBreak: 'hard' }), 'a\\\nb\n');
  assert.equal(paste('<p>a<br><br>b</p>', { pasteHtmlBreak: 'hard' }), 'a\n\nb\n');
  assert.equal(paste('<ul><li>a<br>b</li></ul>', { pasteHtmlBreak: 'hard' }), '- a\\\n  b\n');
});

test("Obsidian's tags and wikilinks in a link's text render as text, no anchor in an anchor", () => {
  const html = (t: string): string => OurusDoc.parse(t, { config: { flavor: 'obsidian' } }).mdTree.renderHtml();
  assert.equal(html('[x #tag y](u)'), '<p><a href="u">x #tag y</a></p>\n');
  assert.equal(html('[link [[n]]](u)'), '<p><a href="u">link n</a></p>\n');
});

test('HTML nested past the call stack pastes as its text', async () => {
  const { MdHtmlParser } = await import('../../src/parser/html-parser.ts');
  for (const html of [
    '<span>'.repeat(5000) + 'a*' + '</span>'.repeat(5000),
    '<blockquote>'.repeat(5000) + 'a*',
    '<ul><li>'.repeat(3000) + 'a*',
    '<pre>' + '<span>'.repeat(5000) + 'a*',
  ]) {
    assert.equal(MdHtmlParser.parse(html).markdown, 'a\\*', html.slice(0, 12));
  }
});

test('HTML conversion: formatting already open adds none, a normal span in bold closes it around itself, the last declaration counts, edges move out, spaces stay code', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<p><b>a<b>b</b>c</b></p>'), '**abc**');
  assert.equal(md('<p><b>a<span style="font-weight:normal">b</span>c</b></p>'), '**a**b**c**');
  assert.equal(md('<p><i>a<span style="font-style:normal">b</span>c</i></p>'), '*a*b*c*');
  assert.equal(md('<p><span style="font-weight:bold;font-weight:normal">x</span></p>'), 'x');
  assert.equal(md('<b style="font-weight:normal"><p>doc</p></b>'), 'doc');
  assert.equal(md('<p><b>abc<br></b>def</p>'), '**abc**\ndef');
  assert.equal(md('<p>a <code> </code> b</p>'), 'a ` ` b');
});

test('HTML conversion: a style parsed as CSS reads it, once: spaces, any case, `!important`, a property by its whole name (B265)', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<p><span style="font-weight : bold">x</span></p>'), '**x**');
  assert.equal(md('<p><span style="FONT-WEIGHT: BOLD">x</span></p>'), '**x**');
  assert.equal(md('<p><span style="font-weight:bold!important;font-weight:normal">x</span></p>'), '**x**');
  assert.equal(md('<p><span style="not-font-weight:bold">x</span></p>'), 'x');
});

test("HTML conversion: two lists side by side stay two, a table's caption is a paragraph before it, a cell's blocks are set apart", async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<ul><li>a</li></ul><ul><li>b</li></ul>'), '- a\n\n* b');
  assert.equal(md('<ol><li>a</li></ol><ol><li>b</li></ol>'), '1. a\n\n1) b');
  assert.equal(
    md('<table><caption>Cap</caption><tr><th>A</th></tr><tr><td>x</td></tr></table>'),
    'Cap\n\n| A |\n| --- |\n| x |',
  );
  assert.equal(md('<table><tr><th>x</th></tr><tr><td><p>a</p><p>b</p></td></tr></table>'), '| x |\n| --- |\n| a b |');
});

test("HTML conversion: a style sets formatting on any element, a block's for what it holds", async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<p><em style="font-weight:bold">x</em></p>'), '***x***');
  assert.equal(md('<p><em style="font-style:normal">x</em></p>'), 'x');
  assert.equal(md('<p style="font-weight:bold">x</p>'), '**x**');
  assert.equal(md('<div style="font-style:italic"><p>a</p><p style="font-style:normal">b</p></div>'), '*a*\n\nb');
});

test('HTML conversion: a line break in inline code is a code span a line', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  assert.equal(MdHtmlParser.parse('<p><code>a<br>b</code></p>').markdown, '`a`\n`b`');
});

test("pasteAt keeps the indentation of ourus's own clipboard, as paste does", () => {
  const copied = assertApplied(executeOnText('    code\n', { type: 'copy' }, { caret: 4 }));
  assert.equal(
    appliedText(
      executeOnText('', { type: 'pasteAt', at: { parent: 'root', after: null }, clipboard: copied.clipboard! }),
    ),
    '    code\n',
  );
});

test("ourus's copy of a node pastes as a node with its text/markdown lost on the way", () => {
  const { 'text/markdown': _, ...clipboard } = assertApplied(executeOnText('abc\n', { type: 'copy', nodes: [1] }))
    .clipboard!;
  assert.equal(appliedText(executeOnText('xyz', { type: 'paste', clipboard }, { caret: 1 })), 'xyz\n\nabc');
});

test("a run shorter than a fence's closes nothing, so a clipboard's indented lines stay its code", () => {
  const text = appliedText(
    executeOnText('', { type: 'paste', clipboard: { 'text/plain': '````\n    code\n    ```' } }),
  );
  assert.ok(text.includes('    code\n    ```'), text);
});

test("ourus's copy of an unclosed fence keeps its code, a line like a closing fence among it", () => {
  const copied = assertApplied(executeOnText('```\n    code\n    ```', { type: 'copy', nodes: [1] }));
  assert.ok(
    appliedText(executeOnText('', { type: 'paste', clipboard: copied.clipboard! })).includes('    code\n    ```'),
  );
});

test('a bracket autoClose lists pairs in an empty note, the closer ours', () => {
  const paired = assertApplied(executeOnText('', { type: 'insertText', text: '(' }, { config: { autoClose: ['('] } }));
  assert.equal(paired.view.doc.text, '()');
  assert.equal(paired.view.selection.head, 1);
  assert.deepEqual([...paired.view.doc.marks.auto], [1]);
});

test('Enter and Shift-Enter split between characters: a stale caret inside a surrogate pair, a grapheme or a CRLF goes to its start', () => {
  assert.equal(appliedText(executeOnText('- a😀b\n', { type: 'shiftEnter' }, { caret: 4 })), '- a\n  😀b\n');
  assert.equal(appliedText(executeOnText('- a😀b\n', { type: 'enter' }, { caret: 4 })), '- a\n- 😀b\n');
  assert.equal(appliedText(executeOnText('- a\u0301b\n', { type: 'enter' }, { caret: 3 })), '- \n- a\u0301b\n');
  assert.equal(appliedText(executeOnText('a\r\nb\r\n', { type: 'enter' }, { caret: 2 })), 'a\r\n\r\nb\r\n');
  // (a selection widens to take the characters it cuts)
  assert.equal(appliedText(executeOnText('- a😀b\n', { type: 'enter' }, { anchor: 6, head: 4 })), '- a\n- \n');
});

test('a note opening with a byte-order mark: every command as on the note without one, the mark kept at its start', () => {
  const BOM = '\ufeff';
  const notes = [
    '- a\n- b\n',
    '# T\n\nx\n',
    '---\ntitle: x\n---\n\n- a\n- b\n',
    '- a\n  - b\n- c\n',
    '1. a\n2. b\n',
    '```\ncode\n```\n',
    '- [ ] t\n- u\n',
    '> q\n\np\n',
    'p ^id\n\nq\n',
    '- a\n\n  b\n',
  ];
  const commands: OurusCommand[] = [
    { type: 'moveSubtreeDown' },
    { type: 'moveSubtreeUp' },
    { type: 'indent' },
    { type: 'outdent' },
    { type: 'enter' },
    { type: 'shiftEnter' },
    { type: 'deleteContentBackward' },
    { type: 'deleteContentForward' },
    { type: 'deleteSubtree' },
    { type: 'duplicateSubtree' },
    { type: 'cut' },
    { type: 'pastePlain', text: '- x\n- y' },
    { type: 'insertText', text: 'k' },
    { type: 'selectNode' },
  ];
  for (const flavor of ['gfm', 'obsidian'] as const) {
    for (const note of notes) {
      // (carets on the first two lines, where the mark is; and the whole note selected, from past it)
      const second = note.indexOf('\n', note.indexOf('\n') + 1);
      const selections = [...Array.from({ length: second + 1 }, (_, c) => [c, c]), [0, note.length]];
      for (const command of commands) {
        for (const [anchor, head] of selections) {
          const without = executeOnText(note, command, { anchor, head, config: { flavor } });
          const withMark = executeOnText(BOM + note, command, {
            anchor: anchor! + 1,
            head: head! + 1,
            config: { flavor },
          });
          const context = `${flavor} ${JSON.stringify(note)} ${command.type} ${anchor}–${head}`;
          assert.equal(resultStatus(withMark), resultStatus(without), context);
          if (without instanceof OurusSuccess && withMark instanceof OurusSuccess) {
            assert.equal(withMark.view.doc.text, BOM + without.view.doc.text, context);
            assert.deepEqual(
              withMark.view.selection,
              { anchor: without.view.selection.anchor + 1, head: without.view.selection.head + 1 },
              context,
            );
            assert.deepEqual(
              [...withMark.view.doc.marks.placeholders],
              [...without.view.doc.marks.placeholders].map((p) => p + 1),
              context,
            );
          }
        }
      }
    }
  }
});

test('a paragraph starting with a byte-order mark, moved first, gets a blank line before it: opening the note, the mark would be no character', () => {
  const moved = assertApplied(
    executeOnText(
      '## Notes\n\ufeff\n- item\n',
      { type: 'moveSubtreeUp' },
      { caret: 9, config: { listParent: 'container' } },
    ),
  );
  assert.equal(moved.view.doc.text, '\n\ufeff\n## Notes\n- item\n');
  assert.deepEqual(
    moved.view.doc.rootNode.children.map((n) => n.kind),
    ['paragraph', 'heading'],
  );
  const text = assertApplied(executeOnText('a\n\n\ufeffb\n', { type: 'moveSubtreeUp' }, { caret: 4 }));
  assert.equal(text.view.doc.text, '\n\ufeffb\n\na\n');
  assert.deepEqual(text.view.selection, { anchor: 2, head: 2 });
});

test("a drag's deletion is the selection deleted as a cut deletes it: a subtree selection's roots taken out, the host's deletion checked by the zoom guard", () => {
  // (a subtree selection, as cut: its roots out, the zoom root too)
  const list = OurusView.of(OurusDoc.parse('- a\n- b\n- c\n'));
  const dragged = assertApplied(executeCommand(list.withSelection(list.selectionOf([2])), { type: 'deleteByDrag' }));
  assert.equal(dragged.view.doc.text, '- a\n- c\n');
  assert.deepEqual(dragged.view.selection, { anchor: 3, head: 3 });
  const zoomed = OurusView.of(OurusDoc.parse('- a\n  - b\n- c'), { zoom: 1 });
  const root = assertApplied(executeCommand(zoomed.withSelection(zoomed.selectionOf([1])), { type: 'deleteByDrag' }));
  assert.equal(root.view.doc.text, '- c');
  assert.equal(
    root.view.doc.text,
    assertApplied(executeCommand(zoomed.withSelection(zoomed.selectionOf([1])), { type: 'cut' })).view.doc.text,
  );
  // (part of a text, the host's, a block id's markup too; refused where it would leave the zoom)
  const id = executeOnText(
    'p ^abc',
    { type: 'deleteByDrag' },
    { anchor: 2, head: 3, config: { flavor: 'obsidian', decorations: DECORATIONS } },
  );
  assert.ok(id instanceof OurusDeferred);
  const leaves = executeCommand(
    OurusView.of(OurusDoc.parse('p\n- child\n\nq'), { zoom: 1, selection: { anchor: 4, head: 11 } }),
    { type: 'deleteByDrag' },
  );
  assert.ok(leaves instanceof OurusRejected && leaves.reason === 'outside-zoom');
  // (a selection ending before a marker, `«p⏎»- child`: the texts join, the zoom root's text the child's, B188)
  const joined = executeCommand(
    OurusView.of(OurusDoc.parse('p\n- child\n\nq'), { zoom: 1, selection: { anchor: 0, head: 2 } }),
    { type: 'deleteByDrag' },
  );
  assert.equal(assertApplied(joined).view.doc.text, 'child\n\nq');
});

test("a splice of many items, past JavaScript's limit on a call's arguments", async () => {
  const { spliceIn } = await import('../../src/text/index.ts');
  // (200,000 put in at once, past the limit on arguments: in order, around what was there)
  const list = ['a', 'b', 'c'];
  spliceIn(
    list,
    1,
    1,
    Array.from({ length: 200000 }, (_, k) => `${k}`),
  );
  assert.deepEqual([list.length, list[0], list[1], list[200000], list[200001]], [200002, 'a', '0', '199999', 'c']);
  const small = [0, 1, 2];
  spliceIn(small, 3, 0, [3, 4]);
  assert.deepEqual(small, [0, 1, 2, 3, 4]);
});

test("HTML conversion: a pre's first line break, an empty href, a tag's #, a table of no cells, deep HTML's blocks, very many children merged", async () => {
  const { MdHtmlParser, MdTree, MdFlavor } = await import('../../src/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  // (the line break right after `<pre>` is none of its text, as HTML has it; one inside `<code>` is)
  assert.equal(md('<pre>\nabc\n</pre>'), '```\nabc\n```');
  assert.equal(md('<pre>\n\nabc\n</pre>'), '```\n\nabc\n```');
  assert.equal(md('<pre><code>\nabc\n</code></pre>'), '```\n\nabc\n```');
  // (a link to the page itself is a link; one with no href is none)
  assert.equal(md('<p><a href="">here</a></p>'), '[here](<>)');
  assert.equal(md('<p><a>here</a></p>'), 'here');
  // (a `#` where an Obsidian tag would start is text; one in a word isn't touched)
  assert.equal(md('<p>#topic</p>'), '\\#topic');
  assert.equal(md('<p>C# and a #b</p>'), 'C# and a \\#b');
  assert.equal(MdTree.parse(md('<p>#topic</p>'), MdFlavor.obsidian).renderHtml(), '<p>#topic</p>\n');
  // (a table of no cells is its caption, no grid)
  assert.equal(md('<table><caption>Summary</caption></table>'), 'Summary');
  assert.equal(md('<table><tr></tr></table>'), '');
  assert.equal(md('<table><caption>S</caption><tr></tr></table>'), 'S');
  // (nested past the depth limit: its text alone, its blocks apart)
  assert.equal(
    md('<span>'.repeat(514) + '<p>one</p><p>two <b>x</b></p><p># h</p>' + '</span>'.repeat(514)),
    'one\n\ntwo x\n\n\\# h',
  );
  // (adjacent formatting merged, its children however many)
  assert.equal(md('<b>x</b><b>' + '<span>y</span>'.repeat(3) + '</b>'), '**xyyy**');
  assert.ok(md('<b>x</b><b>' + '<span>y</span>'.repeat(130000) + '</b>').startsWith('**xyy'));
});

test("HTML conversion: an image's alt text, with no source, held as text is; in plain text, the alt of every image", async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.parse('<p><img alt="&#xE000;0&#xE001;"></p>').markdown, '\uE0000\uE001');
  assert.equal(MdHtmlParser.parse('<p>a<img alt="x*y">b</p>').markdown, 'ax\\*yb');
  assert.equal(MdHtmlParser.plainText('<p>a<img alt="diagram">b</p>'), 'adiagramb');
  assert.equal(MdHtmlParser.plainText('<p><img src="u" alt="a  pic"> c</p>'), 'a pic c');
});

test("the readback compares a verbatim block's lines as they read: a re-indent that would change its code is refused, one that keeps it writes", () => {
  // (a fence indented one space takes a column of its tab-led line: `␠␠␠PAYLOAD`; made an item, nothing would)
  for (const [source, nodes] of [
    [' ```\n\tPAYLOAD\n ```', [1]],
    ['- a\n\n ```\n\tx\n ```', [2]],
  ] as const) {
    const refused = executeOnText(source, { type: 'indent', nodes: [...nodes] });
    assert.ok(
      refused instanceof OurusFailed &&
        /^the text written doesn't read as the draft: root › \d: code /.test(refused.detail ?? ''),
      JSON.stringify(source),
    );
  }
  // (moves whose code reads the same still write)
  assert.equal(
    appliedText(executeOnText('- a\n  - ```\n    \tx\n    ```', { type: 'outdent', nodes: [2] })),
    '- a\n- ```\n  \tx\n  ```',
  );
  assert.equal(appliedText(executeOnText('```\nx\n```', { type: 'indent', nodes: [1] })), '- ```\n  x\n  ```');
  assert.equal(appliedText(executeOnText(' ```\n  x\n ```', { type: 'indent', nodes: [1] })), '- ```\n   x\n  ```');
  assert.equal(
    appliedText(executeOnText('$$\n\tx\n$$', { type: 'indent', nodes: [1] }, { config: { flavor: 'obsidian' } })),
    '- $$\n  \tx\n  $$',
  );
});

test("a paste over a selection from a text's start puts the nodes where the selection was, before what is left", () => {
  const md = { 'text/markdown': '- x\n- y' };
  for (const config of [{ flavor: 'obsidian', decorations: [] }, {}] as const) {
    const first = assertApplied(
      executeOnText('abc\ndef', { type: 'paste', clipboard: md }, { anchor: 0, head: 3, config }),
    );
    assert.equal(first.view.doc.text, '- x\n- y\n\ndef');
    assert.deepEqual(first.view.selection, { anchor: 7, head: 7 });
  }
  assert.equal(
    appliedText(executeOnText('abc def', { type: 'paste', clipboard: md }, { anchor: 0, head: 3 })),
    '- x\n- y\n\ndef',
  );
  // (from mid-text, after the node, as a caret there pastes)
  assert.equal(
    appliedText(executeOnText('abc\ndef', { type: 'paste', clipboard: md }, { anchor: 1, head: 3 })),
    'a\ndef\n\n- x\n- y',
  );
  assert.equal(
    appliedText(executeOnText('- abc\n- def', { type: 'paste', clipboard: md }, { anchor: 2, head: 5 })),
    '- x\n- y\n- def',
  );
});

test("a structured paste keeps a code block's lines of blanks; outside code they are blank lines", () => {
  const paste = (src: string) =>
    appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': src, 'text/markdown': src } }));
  assert.equal(paste('```txt\n  \n```'), '```txt\n  \n```\n');
  assert.equal(paste('```\n\t\n```'), '```\n\t\n```\n');
  // (the clipboard's common indentation off them too)
  assert.equal(paste('  ```\n    \n  ```'), '```\n  \n```\n');
  assert.equal(paste('a\n  \nb'), 'a\n\nb\n');
  // (a fence copied out of a container, its lines indented past it: dedented as the lines with text
  // share, a line of blanks no measure of it; past that indentation its blanks are kept)
  const plain = (src: string) => appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': src } }));
  assert.equal(plain('```\n    x\n  \n    ```'), '```\nx\n\n```\n');
  assert.equal(plain('```\n    x\n      \n    ```'), '```\nx\n  \n```\n');
});

test("a table pasted on an empty item is the item's text, as code is: on its marker's line, the item's children kept", () => {
  const table = '| a |\n| --- |\n| b |\n';
  for (const flavor of ['gfm', 'obsidian'] as const) {
    for (const [start, caret] of [
      ['- ', 2],
      ['-', 1],
      ['- [ ] ', 6],
    ] as const) {
      const pasted = assertApplied(
        executeOnText(start, { type: 'paste', clipboard: { 'text/markdown': table } }, { caret, config: { flavor } }),
      );
      assert.equal(pasted.view.doc.text, '- | a |\n  | --- |\n  | b |', `${flavor} ${JSON.stringify(start)}`);
      assert.deepEqual(pasted.view.selection, { anchor: 25, head: 25 });
      assert.match(pasted.view.doc.mdTree.renderHtml(), /^<ul>\n<li>\n<table>/);
    }
  }
  assert.equal(
    appliedText(
      executeOnText(
        '- \n  - child',
        { type: 'paste', clipboard: { 'text/plain': table } },
        { caret: 2, config: { flavor: 'gfm' } },
      ),
    ),
    '- | a |\n  | --- |\n  | b |\n  - child',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- a\n- \n- c',
        { type: 'paste', clipboard: { 'text/markdown': table } },
        { caret: 6, config: { flavor: 'gfm' } },
      ),
    ),
    '- a\n- | a |\n  | --- |\n  | b |\n- c',
  );
  // (the item itself, its text set: its number, its blank lines, a zoom on it kept)
  assert.equal(
    appliedText(
      executeOnText(
        '1. a\n2. b\n3. ',
        { type: 'paste', clipboard: { 'text/markdown': table } },
        { caret: 13, config: { flavor: 'gfm', orderedLists: 'shift' } },
      ),
    ),
    '1. a\n2. b\n3. | a |\n   | --- |\n   | b |',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- \n\n\nnext',
        { type: 'paste', clipboard: { 'text/markdown': table } },
        { caret: 2, config: { flavor: 'gfm' } },
      ),
    ),
    '- | a |\n  | --- |\n  | b |\n\n\nnext',
  );
  const zoomed = assertApplied(
    executeOnText(
      '- \n  - child',
      { type: 'paste', clipboard: { 'text/markdown': table } },
      { caret: 2, config: { flavor: 'gfm' }, view: { zoom: 1 } },
    ),
  );
  assert.equal(zoomed.view.doc.text, '- | a |\n  | --- |\n  | b |\n  - child');
  assert.equal(zoomed.view.zoom, 1);
});

test("the clipboard's HTML is the copy as it read in its note: its definitions, its place, a text's inline text; a block id leaves no blank (B260)", () => {
  const html = (text: string, command: OurusCommand, start: Parameters<typeof executeOnText>[2] = {}): string =>
    assertApplied(executeOnText(text, command, start)).clipboard!['text/html']!;
  // (a footnote copied without its reference: its content)
  assert.notEqual(
    html('[^1]: note\n  more\n', { type: 'copy' }, { caret: 4 })
      .replace(/<!--.*?-->/g, '')
      .trim(),
    '',
  );
  // (no blank where a block id was)
  assert.doesNotMatch(
    html('- a ^id\n  - b ^id2\n', { type: 'copy' }, { caret: 3, config: { flavor: 'obsidian' } }),
    /[ab] (\n|<)/,
  );
  // (a reference link, with the note's definition)
  assert.match(
    html('[x][a]\n\n[a]: /url "title"', { type: 'copy', nodes: [1] }),
    /<a href="\/url" title="title">x<\/a>/,
  );
  // (rules from mid-note, no front matter)
  assert.match(
    html(
      'Intro\n\n---\n\nDetails\n\n---\n\nEnd',
      { type: 'copy', nodes: [2, 3, 4] },
      { config: { flavor: 'obsidian' } },
    ),
    /Details/,
  );
  // (text from inside a paragraph: text, no block)
  for (const [text, from, to, block] of [
    ['before # Heading after', 7, 16, /<h1>/],
    ['before - item after', 7, 13, /<ul>/],
    ['before > quote after', 7, 14, /<blockquote>/],
  ] as const) {
    const copied = html(text, { type: 'copy' }, { anchor: from, head: to });
    assert.doesNotMatch(copied, block);
    assert.ok(copied.includes(text.slice(from, to).replace('>', '&gt;')), copied);
  }
});

test("a command at the note's end where its last line is blank but not empty, with no line break after it, keeps the blank line it ends with (B305)", () => {
  // (Backspace joining an empty last item above a last line of spaces or a tab)
  for (const last of [' ', '\t']) {
    const r = assertApplied(executeOnText(`- a\n\n-\n${last}`, { type: 'deleteContentBackward' }, { caret: 6 }));
    assert.equal(r.view.doc.text, '- a\n\n', JSON.stringify(last));
    assert.deepEqual(r.view.selection, { anchor: 3, head: 3 });
  }
});

test("a decorated caret entering a node starts where it edits, not on an opening fence: blank code's code line, a textless quote's code, a folded quote opened (B214)", () => {
  const decorated = { decorations: DECORATIONS } as const;
  assert.equal(
    assertApplied(executeOnText('p\n\n```\n\n```', { type: 'zoomIn', nodes: [2] }, { config: decorated })).view
      .selection.head,
    7,
  );
  assert.equal(
    assertApplied(
      executeOnText(
        'p\n\n> ```\n> x\n> ```',
        { type: 'zoomIn', nodes: [2] },
        { config: { ...decorated, quotes: 'container' } },
      ),
    ).view.selection.head,
    11,
  );
  const view = OurusView.of(OurusDoc.parse('> ```\n> x\n> ```', { config: { ...decorated, quotes: 'container' } }), {
    folded: [1],
  });
  const left = assertApplied(executeCommand(view.withSelection(view.selectionOf([1])), { type: 'selectNode' }));
  assert.equal(left.view.selection.head, 8);
  assert.deepEqual([...left.view.folded], []);
});

test("one line placed at a bare marker whose text starts below it: a no-break space typed, and a plain paste under `pastePlainLines: enter`, stay the item's (B196)", () => {
  assert.equal(
    appliedText(executeOnText('-\n  a', { type: 'insertText', text: '\u00a0' }, { caret: 1 })),
    '- \u00a0\n  a',
  );
  assert.equal(
    appliedText(
      executeOnText('-\n  a', { type: 'pastePlain', text: 'x' }, { caret: 1, config: { pastePlainLines: 'enter' } }),
    ),
    '- x\n  a',
  );
});

test("Markdown's blank, not JavaScript's: a label's no-break space, a line of them, a fence's info, a form feed's line are text (B250)", () => {
  assert.equal(MdTree.parse('[a] [\u00a0a]\n\n[a]: /plain\n[\u00a0a]: /nbsp').references.size, 2);
  assert.notEqual(MdFlavor.gfm.firstNonParagraph(['\u00a0', '', '\u00a0']), -1);
  assert.equal(MdTree.parse('```\u00a0js\u00a0\nx\n```').root.children[0]!.attrs.info, '\u00a0js\u00a0');
  assert.equal(OurusDoc.parse('a\n\n\f\n\nb').isEmptyLine(2), false);
});

test("brackets pair, wrap and come back alike in prose, a quote atom and code; not in markup, a quote line's `>`s, its marker, a heading's `#`s, a checkbox, a fence (B242, B244)", () => {
  const atom: Partial<OurusConfig> = { autoClose: ['('], quotes: 'atom' };
  // (a quote atom: at a caret, over a selection)
  assert.equal(
    appliedText(executeOnText('> a ', { type: 'insertText', text: '(' }, { caret: 4, config: atom })),
    '> a ()',
  );
  assert.equal(
    appliedText(executeOnText('> abc', { type: 'insertText', text: '(' }, { anchor: 2, head: 5, config: atom })),
    '> (abc)',
  );
  // (its markup: the host's)
  for (const [text, anchor, head] of [
    ['> - a b', 3, 3],
    ['> - a b', 2, 4],
    ['> # h', 3, 3],
    ['> - [ ] t', 6, 6],
  ] as const) {
    assert.ok(
      executeOnText(text, { type: 'insertText', text: '(' }, { anchor, head, config: atom }) instanceof OurusDeferred,
      `${text} ${anchor}`,
    );
  }
  // (code: Backspace takes back a pair of ours; a double listed alone closes)
  const paired = executeOnText(
    '```\n\n```',
    { type: 'insertText', text: '(' },
    { caret: 4, config: { autoClose: ['('] } },
  );
  assert.equal(appliedText(executeAfter(paired, { type: 'deleteContentBackward' })), '```\n\n```');
  assert.equal(
    appliedText(
      executeOnText('```\n[\n```', { type: 'insertText', text: '[' }, { caret: 5, config: { autoClose: ['[['] } }),
    ),
    '```\n[[]]\n```',
  );
  // (and in a quote atom, a pair of ours comes back too)
  assert.equal(
    appliedText(
      executeAfter(executeOnText('> a ', { type: 'insertText', text: '(' }, { caret: 4, config: atom }), {
        type: 'deleteContentBackward',
      }),
    ),
    '> a ',
  );
});

test('addBlockId on an empty paragraph a placeholder holds is refused: the id alone would be no paragraph; an empty item takes one (B236)', () => {
  const entered = executeOnText('a\n\nb', { type: 'enter' }, { caret: 1, config: { flavor: 'obsidian' } });
  const r = executeAfter(entered, { type: 'addBlockId', name: 'x' });
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible', r.constructor.name);
  assert.equal(
    appliedText(
      executeAfter(executeOnText('- a', { type: 'enter' }, { caret: 3, config: { flavor: 'obsidian' } }), {
        type: 'addBlockId',
        name: 'x',
      }),
    ),
    '- a\n- ^x',
  );
});

test("a placeholder on a text's empty first line settles, the line going, as an empty last line's does (B239)", async () => {
  const { settlePlaceholders } = await import('../../src/commands/index.ts');
  for (const [text, at, want] of [
    ['\ntext', 0, 'text'],
    ['a\n\n\ntext', 3, 'a\n\ntext'],
    ['- a\n- \n  text', 6, '- a\n- text'],
  ] as const) {
    const doc = OurusDoc.parse(text, { marks: { placeholders: [at] } });
    const settled = settlePlaceholders(OurusView.of(doc, { selection: doc.text.length }))!;
    assert.equal(settled.view.doc.text, want, JSON.stringify(text));
    assert.deepEqual([...settled.view.doc.marks.placeholders], []);
  }
});

test("a held space in a text the draft carries as it was, moved or under another prefix, settles as in a text it sets (B237's shape reached from keys)", () => {
  // (`- a⏎  ┃```…`, Delete: the host's edit, one space held; then Alt-Down)
  assertApplied(
    executeOnText('- a\n ```\n  x\n  ```\n- b\n', { type: 'moveSubtreeDown' }, { caret: 4, placeholders: [4] }),
  );
  assertApplied(
    executeOnText(
      'a\n- b\n  - c\n',
      { type: 'moveSubtreeUp', nodes: [2] },
      { config: { flavor: 'obsidian' }, placeholders: [6] },
    ),
  );
});

test("a blank line of ours between two quotes goes only where they stay apart without it: Tab on the first one's last paragraph, made an item, keeps it (B296)", () => {
  const source = '> first\n>\n> second\n\n>';
  for (const quotes of ['container', 'atom'] as const) {
    const doc = OurusDoc.parse(source, { config: { quotes }, marks: { auto: [source.lastIndexOf('\n')] } });
    const r = assertApplied(
      executeCommand(OurusView.of(doc, { selection: source.indexOf('second') }), { type: 'indent' }),
    );
    assert.equal(r.view.doc.rootNode.children.length, 2, quotes);
  }
  const plain = OurusDoc.parse(source, { marks: { auto: [source.lastIndexOf('\n')] } });
  assert.equal(
    assertApplied(executeCommand(OurusView.of(plain, { selection: source.indexOf('second') }), { type: 'indent' })).view
      .doc.text,
    '> first\n>\n> - second\n\n>',
  );
});

test('a child further in than its sibling, moved out after its parent, is read at its new depth: the paragraph after it kept apart (B303)', () => {
  const moved = executeCommand(OurusView.of(OurusDoc.parse('a\n- b\n\n- p\n    - c\n  - d\n\nz\n')), {
    type: 'moveSubtree',
    nodes: [4],
    to: { parent: 1, after: 3 },
  });
  assert.equal(appliedText(moved), 'a\n- b\n\n- p\n  - d\n\n- c\n\nz\n');
});

test('outdenting an item over a quoted list at an in-between indent: the quote after it, padded at the root, its padding dropped so it stays out of the item (B190; refused until 2026-11-14)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '%% comment %%\n1. first\n   - nested bul\nx- sibling\n  > - list in quote',
        { type: 'outdent' },
        { caret: 40, config: { flavor: 'gfm' } },
      ),
    ),
    '%% comment %%\n1. first\n- nested bul\nx- sibling\n> - list in quote',
  );
});

test("a refusal names a node in words, not by the parser's names: a rule, code (B259)", () => {
  const detail = (r: ReturnType<typeof executeOnText>): string | undefined =>
    r instanceof OurusRejected ? r.detail : undefined;
  assert.equal(detail(executeOnText('p\n\n---', { type: 'outdent' }, { caret: 3 })), 'a rule has no level to leave');
  assert.equal(
    detail(
      executeOnText(
        'x\n\n```\ncode\n```\n\ny',
        { type: 'deleteContentBackward' },
        { caret: 17, config: { decorations: ['fence'] } },
      ),
    ),
    "can't join into code",
  );
});

test('a paragraph cut under code and pasted back (B346)', () => {
  const cut = assertApplied(executeOnText('```\ncode\n```\n\npara\n', { type: 'cut' }, { caret: 16 }));
  const back = assertApplied(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! }));
  assert.equal(back.view.doc.text, '```\ncode\n```\n\npara\n');
});

test('an item cut under an item ending in code and pasted back (B346)', () => {
  const cut = assertApplied(executeOnText('- item\n  ```\n  x\n  ```\n- next\n', { type: 'cut' }, { caret: 26 }));
  const back = assertApplied(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! }));
  assert.equal(back.view.doc.text, '- item\n  ```\n  x\n  ```\n- next\n');
});

test("cutting a quote's first paragraph after an item writes the quote outside the item, its uneven padding normalized (B350, B449)", () => {
  const cut = assertApplied(executeOnText('- a\n > x\n  > - b\n', { type: 'cut' }, { caret: 6 }));
  assert.equal(cut.view.doc.text, '- a\n> - b\n');
  assert.equal(cut.view.doc.rootNode.children.length, 2);
});

test("Enter at a heading's start after a quoted item: an empty paragraph held between them, set off from both (B365)", () => {
  const r = assertApplied(
    executeOnText(
      '  - > [!\n    >\n    > x\n#     > note] Title\n',
      { type: 'enter' },
      { caret: 25, config: { flavor: 'obsidian', listParent: 'container' } },
    ),
  );
  assert.equal(r.view.doc.text, '  - > [!\n    >\n    > x\n\n\n\n#     > note] Title\n');
  assert.deepEqual([...r.view.doc.marks.placeholders], [24]);
});

test('a two-paragraph plain paste on a bare marker leaves the paragraph after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(
    appliedText(executeOnText('-\n\n  a\n', { type: 'pastePlain', text: 'a\n\nb' }, { caret: 1 })),
    '- a\n\n  b\n\na\n',
  );
});

test('two lines plain-pasted on a bare marker leave the fence after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(
    appliedText(executeOnText('-\n\n  ```\n', { type: 'pastePlain', text: 'x\ny' }, { caret: 1 })),
    '- x\n  y\n\n```\n',
  );
});

test('a paste of paragraphs on a bare marker leaves the list after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(
    appliedText(executeOnText('-\n\n  - b\n', { type: 'paste', clipboard: { 'text/plain': 'p\n\nq' } }, { caret: 1 })),
    '- p\n\n  q\n\n- b\n',
  );
});

test('Delete joining text to a bare marker leaves the paragraph after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(
    appliedText(executeOnText('-\n\n===\n\n  a\n', { type: 'deleteContentForward' }, { caret: 1 })),
    '- ===\n\na\n',
  );
});

test('a paragraph joins an empty item, the code after it its own: the code after it fenced, a block of its own (B328)', () => {
  // root: 2 children, read as 1
  assert.equal(
    appliedText(
      executeOnText('-\nx\n\n    c', { type: 'deleteContentBackward' }, { caret: 2, config: { flavor: 'obsidian' } }),
    ),
    '- x\n```\nc\n```',
  );
});

test('Backspace joins a line under an empty numbered item: what follows kept apart, out of the item, as the outliners keep it (B352)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '2.\nx > quote\n   > more\n',
        { type: 'deleteContentBackward' },
        { caret: 3, config: { flavor: 'gfm', quotes: 'atom' } },
      ),
    ),
    '2. x > quote\n> more\n',
  );
});

test('Backspace joins an escaped line under an empty item: what follows kept apart, out of the item, as the outliners keep it (B352)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '```js\n```\n-\n\\> [!note] Title\n  > body text\n',
        { type: 'deleteContentBackward' },
        { caret: 12, config: { flavor: 'commonmark', indentUnit: 'tab' }, auto: [12] },
      ),
    ),
    '```js\n```\n- \\> [!note] Title\n> body text\n',
  );
});

test("Delete at an empty item's end: what follows kept apart, out of the item, as the outliners keep it (B352)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '-\nx > [!note] Title\n  > body text\n',
        { type: 'deleteContentForward' },
        { caret: 1, config: { flavor: 'obsidian' } },
      ),
    ),
    '- x > [!note] Title\n> body text\n',
  );
});

test('Backspace joins a line before a table: the table set apart, the joined text escaped (B352)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '-\n--\n| a | b |\n|---|---|\n',
        { type: 'deleteContentBackward' },
        { caret: 2, config: { flavor: 'gfm', listParent: 'container' } },
      ),
    ),
    '- \\--\n\n| a | b |\n|---|---|\n',
  );
});

test("Enter at a fence after an item's unclosed fence: the new line the open code's, an empty line of it, as a text editor writes it (B205)", () => {
  assert.equal(appliedText(executeOnText('- ```\n```', { type: 'enter' }, { caret: 6 })), '- ```\n\n```');
  assert.equal(
    appliedText(executeOnText('- item\n  ```js\n ```\n', { type: 'enter' }, { caret: 15 })),
    '- item\n  ```js\n\n ```\n',
  );
  assert.equal(
    appliedText(executeOnText('- $$\n$$\n', { type: 'enter' }, { caret: 5, config: { flavor: 'obsidian' } })),
    '- $$\n\n$$\n',
  );
});

test("Backspace on an empty item after an item's unclosed fence: the blank line after it the open code's (B205)", () => {
  assert.equal(
    appliedText(executeOnText('- item\n  ```js\n- \n\n', { type: 'deleteContentBackward' }, { caret: 17 })),
    '- item\n  ```js\n\n',
  );
});

test('the third shared marker emptied: the nested empty items each on a line of their own, as the outliners show them, not `- - - `, a rule (B209)', () => {
  assert.equal(appliedText(executeOnText('- - - a\n', { type: 'enter' }, { caret: 4 })), '- \n  - \n    - \n    - a\n');
  assert.equal(
    appliedText(executeOnText('- - - a', { type: 'deleteSoftLineBackward' }, { caret: 7 })),
    '- \n  - \n    - ',
  );
  assert.equal(
    appliedText(executeOnText('* * * a', { type: 'deleteSoftLineBackward' }, { caret: 7 })),
    '* \n  * \n    * ',
  );
});

test('the inner item of an indented shared marker line taken out, its child led by a tab: the block, its items mixing tabs and spaces, written anew in normal form (B348)', () => {
  assert.equal(
    appliedText(
      executeOnText('  - - \n\t- x\n', { type: 'deleteContentBackward' }, { caret: 6, config: { indentUnit: 'tab' } }),
    ),
    '- - x\n',
  );
  assert.equal(appliedText(executeOnText('  - - \n\t- x\n', { type: 'deleteSubtree' }, { caret: 6 })), '- - x\n');
  assert.equal(appliedText(executeOnText('  - - a\n\t- x\n', { type: 'deleteSubtree' }, { caret: 7 })), '- - x\n');
  // (moved down and back: in normal form both ways)
  assert.equal(
    appliedText(executeOnText('  - - \n\t- x\n', { type: 'moveSubtreeDown' }, { caret: 6 })),
    '- - x\n  - \n',
  );
  assert.equal(
    appliedText(executeOnText('  - - x\n\t- \n', { type: 'moveSubtreeUp' }, { caret: 11 })),
    '- - \n  - x\n',
  );
});

test("a quoted paragraph with no space after its `>` moved up onto an item's marker line: written with one (B349)", () => {
  assert.equal(
    appliedText(executeOnText('- > a\n  >\n  >x t\n', { type: 'moveSubtreeUp' }, { caret: 14 })),
    '- > x t\n  >\n  > a\n',
  );
});

test("in Obsidian, a paste ending in `---` after a `---` at the note's start: a blank line before the first, which would open front matter with it (`pasteAtTextStart: after`; B387)", () => {
  const text = appliedText(
    executeOnText(
      '---\n',
      {
        type: 'paste',
        clipboard: {
          'text/plain':
            '## Notes\n\n- parent\n  - child one\n    - grandchild\n  - child two\n\n    second paragraph of child two\n  - child three\n\n- item\n  ```js\n  let x;\n  ```\n- next\n\n---\n',
          'text/markdown':
            '## Notes\n\n- parent\n  - child one\n    - grandchild\n  - child two\n\n    second paragraph of child two\n  - child three\n\n- item\n  ```js\n  let x;\n  ```\n- next\n\n---\n',
          'text/html':
            '<!-- ourus --><h2>Notes</h2>\n<ul>\n<li>\n<p>parent</p>\n<ul>\n<li>\n<p>child one</p>\n<ul>\n<li>grandchild</li>\n</ul>\n</li>\n<li>\n<p>child two</p>\n<p>second paragraph of child two</p>\n</li>\n<li>\n<p>child three</p>\n</li>\n</ul>\n</li>\n<li>\n<p>item</p>\n<pre><code class="language-js">let x;\n</code></pre>\n</li>\n<li>\n<p>next</p>\n</li>\n</ul>\n<hr />\n',
        },
      },
      { caret: 0, config: { flavor: 'obsidian', pasteAtTextStart: 'after' } },
    ),
  );
  assert.ok(text.startsWith('\n---\n'), JSON.stringify(text));
});

test('Enter on a padded empty item, an item after it two columns in: the empty item written `- `, narrower, the item after it lined up, a sibling still (B378)', () => {
  assert.equal(
    appliedText(executeOnText('-  \n  - item\n', { type: 'enter' }, { caret: 3, placeholders: [3] })),
    '- \n- \n- item\n',
  );
  assert.equal(
    appliedText(
      executeOnText('  - child one\n\t-  \n\t  - grandchild\n', { type: 'enter' }, { caret: 18, placeholders: [18] }),
    ),
    '  - child one\n\n\t- \n\t- \n\t- grandchild\n',
  );
});

test("a quote's first block on an item's marker line moved down past a quoted heading: into its section, the heading on the marker line, not a second item (B360, B351)", () => {
  assert.equal(
    appliedText(executeOnText('- > a\n  > # b\n', { type: 'moveSubtreeDown' }, { caret: 5 })),
    '- > # b\n  > a\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '1. > [!note] Title\n   > bo\n   > # dy text\n',
        { type: 'moveSubtreeDown' },
        { caret: 26, config: { flavor: 'commonmark', listParent: 'container' } },
      ),
    ),
    '1. > # dy text\n   > [!note] Title\n   > bo\n',
  );
  assert.equal(
    appliedText(executeOnText('- > \n  > # x\n', { type: 'moveSubtreeDown' }, { caret: 4, placeholders: [4] })),
    '- > # x\n  > \n',
  );
  // (past an empty item that is a setext underline, `b` a heading: seed 51's)
  assert.equal(
    appliedText(executeOnText('- > - a\n  >\n  > b\n  > - \n', { type: 'moveSubtreeDown' }, { caret: 6 })),
    '- > b\n  > - \n  >\n  > - a\n',
  );
});

test("a line joined into a padded empty numbered item, a quote after it: the item's padding goes, as the writer writes it, so the quote is kept a block of its own (B390)", () => {
  assert.equal(
    appliedText(executeOnText('2.  \n x\n   > more\n', { type: 'deleteContentBackward' }, { caret: 5 })),
    '2. x\n> more\n',
  );
  assert.equal(
    appliedText(executeOnText('1.  \nquote\n   > more\n', { type: 'deleteContentForward' }, { caret: 4 })),
    '1. quote\n> more\n',
  );
});

test("Shift-Tab on the last item after a quote and a tab-led empty item's paragraph: a blank line raised, the paragraph out of the one above (B386)", () => {
  assert.equal(
    appliedText(executeOnText('- a\n  > q\n\t-\n\t  b\n- c\n', { type: 'outdent' }, { caret: 21 })),
    '- a\n  > q\n\t-\n\t  b\n\nc\n',
  );
});

test('a quote written `>-`, no space after its `>`, its items edited: the quote written in normal form, `> -` (B56, B289, B349, B341; decided 2026-11-11)', () => {
  assert.equal(appliedText(executeOnText('>\n >- [x] x', { type: 'enter' }, { caret: 9 })), '> - [ ] \n> - [x] x');
  assert.equal(appliedText(executeOnText('> - a\n>- b', { type: 'moveSubtreeUp' }, { caret: 6 })), '> - b\n> - a');
  assert.equal(
    appliedText(executeOnText('> a\n>- b\n>- c\n', { type: 'moveSubtreeUp' }, { caret: 12 })),
    '> a\n> - c\n> - b\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '>- x\n>\n>',
        { type: 'duplicateSubtree', nodes: [2] },
        { config: { flavor: 'gfm', quotes: 'container' } },
      ),
    ),
    '> - x\n> - x\n\n\n',
  );
});

test('Enter on an empty padded child before a quote its parent holds: the child out of its list, the quote its (B355), at the column `- ` gives, not past the padding it had (B237; read as a quote atom too)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- sibling\n  -  \n  > - list in quote\n',
        { type: 'enter' },
        { caret: 15, config: { flavor: 'gfm' }, placeholders: [15] },
      ),
    ),
    '- sibling\n- \n  > - list in quote\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- sibling\n  -  \n  > quoted in item\n',
        { type: 'enter' },
        { caret: 15, config: { flavor: 'gfm', quotes: 'atom' }, placeholders: [15] },
      ),
    ),
    '- sibling\n- \n  > quoted in item\n',
  );
});

test('Shift-Tab under `indentUnit: tab` on a nested quote with spaces after the outer `>`: written in the item, a tab and a space (B356)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > quoted in item\n  >    > over two lines\n',
        { type: 'outdent' },
        { caret: 24, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    ),
    '- > quoted in item\n\n\t > over two lines\n',
  );
});

test("Backspace joining a lazy item into the item above: the tab-led quote after it at the narrower item's column (B364)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '  ```js\n  ```\n- next\n - quoted in item\n\t  > over two lines\n',
        { type: 'deleteContentBackward' },
        { caret: 24, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    ),
    '  ```js\n  ```\n- nextquoted in item\n\t > over two lines\n',
  );
});

test('a tab-led child moved down onto an item whose first block is a callout: on its marker line, its id kept (B392)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- item\n\t- [x] done\n- > [!note] Title\n',
        { type: 'moveSubtreeDown' },
        { caret: 14, config: { flavor: 'obsidian' } },
      ),
    ),
    '- item\n- - [x] done\n  > [!note] Title\n',
  );
});

test("Backspace at the start of an item's quote whose next line is `>#`: the quote's new first line spelled with its space (B393)", () => {
  assert.equal(
    appliedText(executeOnText('- > a\n  >#\n', { type: 'deleteContentBackward' }, { caret: 4 })),
    '- a\n  > #\n',
  );
});

test("Alt-Down in an item's quote padded further on a later line than its next: the quote written anew in normal form (B396)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > x\n\n   >\n  > ted in item\n',
        { type: 'moveSubtreeDown' },
        { caret: 6, config: { quotes: 'container' } },
      ),
    ),
    '- > ted in item\n\n  > x\n',
  );
});

test("outdenting a lazy paragraph out of a quote, past a tab after its `>`, after an empty item: the tab's rest the quote's, no padding the item would take in (B70)", () => {
  const r = assertApplied(
    executeOnText('-\n>\tq\n d', { type: 'outdent', nodes: [3] }, { caret: 1, config: { quotes: 'container' } }),
  );
  assert.equal(r.view.doc.text, '-\nq\n d');
});

test("moving an empty quote into the item after it, that item's text going on lazily: the item on its parent's marker line now, its lazy line past its content column, its text as it was (B39)", () => {
  const r = assertApplied(
    executeOnText(
      '- >\n   - d\n    a',
      { type: 'moveSubtree', to: { parent: 3, after: null } },
      { caret: 2, config: { quotes: 'container' } },
    ),
  );
  assert.equal(r.view.doc.text, '- - d\n      a\n    >');
});

test('under `indentUnit: tab`, items dropped first under an item whose quote shares its marker line: the first on that line, the next lined up with it in spaces, no tab past it (B15)', () => {
  const r = assertApplied(
    executeOnText(
      '- >',
      { type: 'pasteAt', at: { parent: 1, after: null }, clipboard: { 'text/plain': '- a\n- b' } },
      { config: { flavor: 'obsidian', quotes: 'container', indentUnit: 'tab' } },
    ),
  );
  assert.equal(r.view.doc.text, '- - a\n  - b\n  >');
});

test('an item whose text is a heading pasted over a paragraph after another, the note ending there: a heading, not a paragraph its `#` would make one (B301)', () => {
  const r = assertApplied(
    executeOnText(
      'm\n\nx',
      { type: 'paste', clipboard: { 'text/plain': '- # title\n', 'text/markdown': '- # title\n' } },
      { anchor: 3, head: 4 },
    ),
  );
  assert.equal(r.view.doc.text, 'm\n# title');
});

test("Enter on the blank line between an empty item's marker and its fence below it: the new blank line at the item's column, which keeps the item open, the fence its text still (B367)", () => {
  const r = assertApplied(
    executeOnText('-\n  \n  ```\n', { type: 'enter' }, { caret: 4, config: { flavor: 'commonmark' } }),
  );
  assert.equal(r.view.doc.text, '-\n  \n  \n  ```\n');
});

test("cut the item above an item whose text is a fence, then Paste: back before it, at the fence's start (`pasteAtTextStart: before`), after it with `after` (B21)", () => {
  for (const [config, want] of [
    [{}, '- first\n- ```\n  code\n  ```\n'],
    [{ pasteAtTextStart: 'after' }, '- ```\n  code\n  ```\n- first\n'],
  ] as const) {
    const cut = assertApplied(executeOnText('- first\n- ```\n  code\n  ```\n', { type: 'cut' }, { caret: 3, config }));
    assert.equal(cut.view.doc.text, '- ```\n  code\n  ```\n');
    assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! })), want);
  }
});

test("an empty nested quote, its spaces before its `>` in the callout, moved onto its item's marker line: written without them, which would be the item's padding there", () => {
  const doc = parseWithMarks('- > [!note] Title\n  >   >\n', [], { flavor: 'obsidian' });
  const r = executeCommand(OurusView.of(doc, { selection: 25 }), {
    type: 'moveSubtree',
    nodes: [3],
    to: { parent: 1, after: null },
  });
  assert.ok(r instanceof OurusSuccess, JSON.stringify(r));
  assert.equal(r.view.doc.text, '- >\n\n  > [!note] Title\n');
});

test('a callout pasted on an empty item whose first child is a quote: a blank line between them, the two read apart (B361)', () => {
  const r = assertApplied(
    executeOnText(
      '- \n  > [!note] U\n',
      { type: 'paste', clipboard: { 'text/plain': '> [!note] T\n', 'text/markdown': '> [!note] T\n' } },
      { caret: 2, config: { flavor: 'obsidian' } },
    ),
  );
  assert.equal(r.view.doc.text, '- > [!note] T\n\n  > [!note] U\n');
});

test("cut a numbered item whose text is a callout, then Paste at the next one's title start: written, the callout back in that item (`pasteAtTextStart: before`)", () => {
  const cut = assertApplied(
    executeOnText('1. > [!note] T\n2. > [!note] U\n', { type: 'cut' }, { caret: 13, config: { flavor: 'obsidian' } }),
  );
  assert.equal(
    appliedText(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! })),
    '1. > [!note] T\n\n   > [!note] U\n',
  );
});

test("Backspace on an empty item holding a quote after a numbered item's quote, under `indentUnit: tab`: the quote, the numbered item's now, named at its `>` past the tab (B363)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '2. > quote\n- \n   > more\n',
        { type: 'deleteContentBackward' },
        { caret: 13, config: { flavor: 'commonmark', indentUnit: 'tab' } },
      ),
    ),
    '2. > quote\n\n\t> more\n',
  );
});

test("converted HTML: text that reads as a delimiter row stays text (B323), a `<` before an email's address stays (B332), a footnote reference counts as formatting (B338)", async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  const row = convertPastedHtml('<p>a | b<br>--- | ---</p>');
  assert.doesNotMatch(row.rendered, /<table>/);
  assert.match(row.shown, /--- \| ---/);
  // (its brackets shown; the address GFM's literal autolink, as any address in the text)
  assert.match(convertPastedHtml('<p>&lt;3@example.com&gt;</p>').rendered, /^<p>&lt;.*&gt;<\/p>/);
  const note = MdHtmlParser.parse('<p><a data-footnote-ref href="#fn-a">1</a></p>');
  assert.equal(note.markdown, '[^a]');
  assert.equal(note.formatted, true);
});

test("HTML's plain text keeps a `pre` of spaces and the tabs of empty edge cells (B335), as a browser shows it (B270)", async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.plainText('<pre>   </pre>'), '   ');
  assert.equal(MdHtmlParser.plainText('<table><tr><td></td><td>b</td></tr></table>'), '\tb');
  assert.equal(MdHtmlParser.plainText('<table><tr><td>a</td><td></td></tr></table>'), 'a\t');
  assert.equal(
    MdHtmlParser.plainText('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>'),
    'a\tb\nc\td',
  );
  // (B270: blanks collapsed across inline elements, a code block's leading blank line kept, cells
  // holding paragraphs on one line)
  assert.equal(MdHtmlParser.plainText('<p>a <span> b</span> c</p>'), 'a b c');
  assert.equal(MdHtmlParser.plainText('<pre><code>\nabc\n\n</code></pre>'), '\nabc\n');
  assert.equal(MdHtmlParser.plainText('<pre>\nabc</pre>'), 'abc');
  assert.equal(MdHtmlParser.plainText('<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>'), 'a\tb');
});

test('code styled `white-space: pre` keeps its spaces in the code span (B336)', async () => {
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  assert.equal(
    convertPastedHtml('<p><code style="white-space:pre">a  b</code></p>').rendered,
    '<p><code>a  b</code></p>\n',
  );
  assert.equal(convertPastedHtml('<p><code>a  b</code></p>').rendered, '<p><code>a b</code></p>\n');
});

test("converted HTML: hidden content isn't pasted, a link of blanks keeps the words apart (B271)", async () => {
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  assert.equal(convertPastedHtml('<p>a<span hidden>secret</span>b</p><p>c</p>').markdown, 'ab\n\nc');
  assert.equal(convertPastedHtml('<p>a<span style="color: red; display: none">secret</span>b</p>').markdown, 'ab');
  assert.equal(convertPastedHtml('<p>a<a href="u"> </a>b</p>').markdown, 'a b');
});

test("Word's paragraph lists: a jump in the numbers starts another list (B339); levels past Word's nine are the ninth's, no stack overflow (B340)", async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  const p = (n: number) => `<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${n}.</span>x</p>`;
  assert.match(convertPastedHtml(p(1) + p(5)).rendered, /<ol start="5">/);
  assert.doesNotMatch(convertPastedHtml(p(1) + p(2)).rendered, /<ol start/);
  const html = Array.from(
    { length: 3000 },
    (_, i) => `<p style="mso-list:l0 level${i + 1} lfo1"><span style="mso-list:Ignore">•</span>x</p>`,
  ).join('');
  assert.doesNotThrow(() => MdHtmlParser.parse(html));
});

test('expand selection from inside a block id, or right after it: a selection that holds the caret (B216)', () => {
  for (const caret of [9, 11]) {
    const { anchor, head } = assertApplied(
      executeOnText('- item ^id1\n', { type: 'expandSelection' }, { caret, config: { flavor: 'obsidian' } }),
    ).view.selection;
    assert.ok(anchor <= caret && caret <= head, `${anchor}–${head}`);
  }
});

test("Backspace after a backtick typed on a text's last line, `autoClose` listing it: the host's, no pair at the text's end (B246)", () => {
  for (const [text, caret] of [
    ['- a\n`', 5],
    ['a\n`', 3],
  ] as const)
    assert.ok(
      executeOnText(text, { type: 'deleteContentBackward' }, { caret, config: { autoClose: ['`'] } }) instanceof
        OurusDeferred,
    );
});

test("a soft-line deletion that would make a quote's first paragraph a callout's title, a nested quote below it: refused, as on one line (B279)", () => {
  const r = executeOnText(
    '>([!e]\n>>',
    { type: 'deleteSoftLineBackward' },
    { caret: 2, config: { flavor: 'obsidian' } },
  );
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible', JSON.stringify(r));
});

test('Shift-Tab on the first item of a padded quote: out before the quote, each named where it is written (B408)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '  > - sibling\n  > - list in quote\n',
        { type: 'outdent' },
        { caret: 13, config: { flavor: 'commonmark' } },
      ),
    ),
    '- sibling\n> - list in quote\n',
  );
});

test('a paragraph with a list-like lazy line, after a leading blank line, dropped into a quote: written (B182)', () => {
  const r = executeOnText(
    '\nalpha\n    - bravo\n> - charlie',
    { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: 3 } },
    { config: { flavor: 'obsidian' } },
  );
  assert.ok(r instanceof OurusSuccess, JSON.stringify(r));
});

test("Tab on a numbered item after its item's bullet child list: a list of its own, from 1 (B443)", () => {
  assert.equal(
    appliedText(executeOnText('5. a\n   - x\n6. b', { type: 'indent' }, { caret: 14 })),
    '5. a\n   - x\n   1. b',
  );
  assert.equal(
    appliedText(executeOnText('5. a\n   - x\n\n6. b', { type: 'indent' }, { caret: 15 })),
    '5. a\n   - x\n\n   1. b',
  );
});

test("Tab on a numbered item after an item's numbered child list counts on; a list from another number than 1 right under the item's text is that text's lazy line, no list, so the item starts one from 1 (B442, no bug)", () => {
  assert.equal(
    appliedText(executeOnText('5. a\n\n   7. x\n6. b', { type: 'indent' }, { caret: 16 })),
    '5. a\n\n   7. x\n   8. b',
  );
  assert.equal(
    appliedText(executeOnText('5. a\n   1. x\n6. b', { type: 'indent' }, { caret: 15 })),
    '5. a\n   1. x\n   2. b',
  );
  assert.equal(
    appliedText(executeOnText('5. a\n   7. x\n6. b', { type: 'indent' }, { caret: 15 })),
    '5. a\n   7. x\n   1. b',
  );
});

test('Shift-Tab on an empty quote nested in a quote: the quote out, its line as written (`>`), the caret past it, in no markup: an empty quote has no text (B179, closed)', () => {
  const result = assertApplied(executeOnText('> >', { type: 'outdent' }));
  assert.equal(result.view.doc.text, '>');
  assert.equal(result.view.locate(result.view.selection.head).zone, 'none');
});

test('typing right before a block id, then Backspace: the blank typing put after the character goes with it (B245)', () => {
  const obsidian = { flavor: 'obsidian' } as const;
  for (const [text, caret] of [
    ['- item ^id1\n', 7],
    ['para ^b\n', 5],
  ] as const) {
    const typed = executeOnText(text, { type: 'insertText', text: 'x' }, { caret, config: obsidian });
    const back = assertApplied(executeAfter(typed, { type: 'deleteContentBackward' }));
    assert.equal(back.view.doc.text, text);
    assert.equal(back.view.selection.head, caret);
  }
  // a word before the id, or the text's last character: the host's
  assert.ok(
    executeOnText('- x ^id1\n', { type: 'deleteContentBackward' }, { caret: 3, config: obsidian }) instanceof
      OurusDeferred,
  );
  assert.ok(
    executeOnText('- ab ^id1\n', { type: 'deleteContentBackward' }, { caret: 4, config: obsidian }) instanceof
      OurusDeferred,
  );
});

test('a caret on the last blank line or past the final line break: duplicate and `addBlockId` act on the last node, as indent does (B217)', () => {
  for (const [text, caret] of [
    ['- a\n- b\n\n', 9],
    ['- a\n- b\n\n', 8],
    ['- a\n- b\n', 8],
  ] as const) {
    assert.equal(
      assertApplied(executeOnText(text, { type: 'duplicateSubtree' }, { caret })).view.doc.text,
      text.replace('- b\n', '- b\n- b\n'),
    );
  }
  assert.equal(
    appliedText(
      executeOnText('- a\n- b\n', { type: 'addBlockId', name: 'x' }, { caret: 8, config: { flavor: 'obsidian' } }),
    ),
    '- a\n- b ^x\n',
  );
});

test("drop preflight: an item's unclosed fence ends with the item; code too shallow for a wide marker is no line of it; a `---` in an item or the moved rule's own line closes no front matter (B419 to B422)", () => {
  const moved = (text: string, nodes: number[], to: { parent: 'root'; after: number | null }, config = {}): string =>
    appliedText(executeOnText(text, { type: 'moveSubtree', nodes, to }, { config }));
  assert.equal(moved('- ```\n- b\n- c', [3], { parent: 'root', after: 1 }), '- ```\n- c\n- b');
  assert.equal(moved('- ```\n- b\n- c', [1], { parent: 'root', after: 2 }), '- b\n- ```\n- c');
  assert.equal(
    moved('100. a\n\n    code\n\n100. b', [3], { parent: 'root', after: 1 }, { listParent: 'container' }),
    '100. a\n101. b\n\n    code',
  );
  // a bullet's content column is 2: the code would be its lines, refused still
  assert.ok(
    executeOnText(
      '100. a\n\n    code\n\n- b',
      { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } },
      { config: { listParent: 'container' } },
    ) instanceof OurusRejected,
  );
  const obsidian = { flavor: 'obsidian', listParent: 'container' } as const;
  assert.equal(
    moved('---\n\n- a\n- ```\n  ---\n  ```', [3], { parent: 'root', after: 1 }, obsidian),
    '---\n\n- ```\n  ---\n  ```\n- a',
  );
  assert.equal(moved('# h\n---', [2], { parent: 'root', after: null }, obsidian), '---\n# h');
});

test("a drag's seams count no blank line of a node's own as a gap: an unclosed fence's blank code line (B293)", () => {
  const result = assertApplied(executeOnText('```\n\n', { type: 'drag', clipboard: { 'text/plain': '- x' } }));
  const end = result.dropMap!.seams.at(-1)!;
  assert.equal(end.beforeLine, 2);
  assert.equal(end.gapLines, 0);
  // a blank line after a closed fence is its gap
  const closed = assertApplied(executeOnText('```\n```\n\n', { type: 'drag', clipboard: { 'text/plain': '- x' } }));
  assert.equal(closed.dropMap!.seams.at(-1)!.gapLines, 1);
});

test("Backspace at a fence's or math block's start after a block id on a line of its own: refused, the block would read with that line; with the id on the text's line, the blank line goes (B207)", () => {
  const obsidian = { flavor: 'obsidian' } as const;
  for (const text of ['o\n\n^r\n\n$$', 'o\n\n^r\n\n```\nx\n```']) {
    const r = executeOnText(text, { type: 'deleteContentBackward' }, { caret: 7, config: obsidian });
    assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible', JSON.stringify(r));
  }
  assert.equal(
    appliedText(executeOnText('o ^r\n\n$$', { type: 'deleteContentBackward' }, { caret: 6, config: obsidian })),
    'o ^r\n$$',
  );
});

test("pasted HTML: a checkbox alone before an item's first paragraph, as GFM renders a loose task, is the task's box (B424)", async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  assert.equal(MdHtmlParser.parse('<ul><li><input type="checkbox"><p>task</p></li></ul>').markdown, '- [ ] task');
  assert.equal(
    MdHtmlParser.parse('<ul><li><input type="checkbox" checked><p>a</p><p>b</p></li></ul>').markdown,
    '- [x] a\n\n  b',
  );
});

test("Obsidian: code holding a `---` line unwrapped from an item under a `---` the note starts with: a blank line before that first `---`, which would open frontmatter the code's line closes (as DeleteSubtree9)", () => {
  const r = executeOnText(
    '---\n\n- a\n- ```\n  ---\n  ```\n',
    { type: 'outdent' },
    { caret: 14, config: { flavor: 'obsidian', listParent: 'container' } },
  );
  assert.equal(appliedText(r), '\n---\n\n- a\n```\n---\n```\n');
});

test("Shift-Enter among a padded marker's spaces: an unspaced quote's item's later line past the space its `>` takes there; a quote atom under a narrowed item moved with its column (B357)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '>-  a quote\n> over two lines\n',
        { type: 'shiftEnter' },
        { caret: 3, config: { flavor: 'gfm', quotes: 'container' } },
      ),
    ),
    '>-\n>    a quote\n>   over two lines\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '   1.  \\> quote\n       > more\n',
        { type: 'shiftEnter' },
        { caret: 8, config: { flavor: 'obsidian', quotes: 'atom' }, auto: [7] },
      ),
    ),
    '   1.\n      \\> quote\n      > more\n',
  );
  // a paragraph under it keeps its line as it was (Regression267)
  assert.equal(
    appliedText(executeOnText('-  a\n\n     b\n', { type: 'shiftEnter' }, { caret: 2 })),
    '-\n   a\n\n     b\n',
  );
});

test("Shift-Enter among a padded marker's spaces in an item's unspaced quote: the text below the marker, its later line past the space a later line's `>` takes (B399, with B357)", () => {
  assert.equal(
    appliedText(executeOnText('- >-  [!note] Title\n  > body text\n', { type: 'shiftEnter' }, { caret: 5 })),
    '- >-\n  >    [!note] Title\n  >   body text\n',
  );
});

test('Obsidian: a blank line of ours after block-id lines a text carries stays where a command would trim it, a block right under them leaving them naming their own line (B409)', () => {
  const r = executeOnText(
    '> \\# \n\n ^blk\n\n> a quote\n',
    { type: 'enter' },
    { caret: 7, config: { flavor: 'obsidian' }, auto: [2, 13] },
  );
  assert.equal(appliedText(r), '> \\# \n\n\n^blk\n\n> a quote\n');
});

test("Backspace on the inner empty item of a tab-led shared marker line: written anew in normal form, indented by the note's unit, a tab; a sibling of the item on the shared line at its column (B410)", () => {
  const tab = { flavor: 'commonmark', indentUnit: 'tab' } as const;
  assert.equal(
    appliedText(
      executeOnText('- a\n\t- - \n\t\t- item\n', { type: 'deleteContentBackward' }, { caret: 9, config: tab }),
    ),
    '- a\n\t- - item\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- Intro\n\t- - \n\t\t- item ^id1\n\t\t- other\n',
        { type: 'deleteContentBackward' },
        { caret: 13, config: tab },
      ),
    ),
    '- Intro\n\t- - item ^id1\n\t  - other\n',
  );
  // a note indented by 2 or 4 spaces keeps its unit
  assert.equal(
    appliedText(
      executeOnText('- a\n  - b\n    - - \n      - item\n', { type: 'deleteContentBackward' }, { caret: 22 }),
    ),
    '- a\n  - b\n    - - item\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- a\n    - b\n        - - \n            - item\n',
        { type: 'deleteContentBackward' },
        { caret: 30 },
      ),
    ),
    '- a\n    - b\n        - - item\n',
  );
});

test("an empty item's first child deleted, a paragraph after a blank line first then: the item held, or it would read what follows as its text (B401)", () => {
  const r = assertApplied(
    executeOnText('-\n  \n  - ```js\n  let x;\n', { type: 'deleteContentBackward' }, { anchor: 5, head: 15 }),
  );
  assert.equal(r.view.doc.text, '- \n  \n  let x;\n');
  assert.deepEqual(r.view.doc.marks.placeholders, [2]);
});

test("an item's heading marks taken off, its paragraph below with a lazy `-|` line: a blank line between, the lazy line no table row (B308)", () => {
  for (const flavor of ['gfm', 'obsidian', 'commonmark'] as const) {
    assert.equal(
      appliedText(
        executeOnText('- # h\n  x\n-|', { type: 'deleteSoftLineBackward' }, { caret: 4, config: { flavor } }),
      ),
      '- h\n\n  x\n-|',
    );
  }
});

test("Tab on a selection of a quote's paragraphs: items in the quote, each line with its `>`; an item made from a paragraph lines up with no other one made so (B359)", () => {
  assert.equal(
    appliedText(executeOnText('> a\n>\n> b\n>\n> c\n>\n> d\n', { type: 'indent' }, { anchor: 6, head: 13 })),
    '> a\n>\n> - b\n> - c\n>\n> d\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '> a quote\n>\n> over two lines\n>\n> \n',
        { type: 'indent' },
        { anchor: 33, head: 12, config: { flavor: 'commonmark', listParent: 'container' }, placeholders: [33] },
      ),
    ).startsWith('> a quote\n>\n> - over two lines\n'),
    true,
  );
});

test("Enter over a padded item's whole text, a root paragraph after a blank line of spaces: the empty items' blank line bare, the paragraph out of them (B366)", () => {
  assert.equal(
    appliedText(executeOnText('-  next\n  \n  para\n', { type: 'enter' }, { anchor: 3, head: 7 })),
    '- \n- \n\n  para\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '  ```js\n  ```\n-  next- [x] outline\n  \n  [ ] write spec\n- [ ] draft\n- [ ] review\n',
        { type: 'enter' },
        { anchor: 17, head: 34, config: { flavor: 'gfm', indentUnit: 'tab' } },
      ),
    ),
    '  ```js\n  ```\n- \n- \n\n  [ ] write spec\n- [ ] draft\n- [ ] review\n',
  );
});

test("written now, with this round's writer fixes: loose paragraphs indented in an item headed by an empty heading (B197); a padded item's first line cleared, its loose paragraph the root's (B166); Tab over a held empty paragraph in an item and the paragraph after it (B417)", () => {
  assert.equal(
    appliedText(executeOnText('- #\n  n\n\n  e\n\n  m', { type: 'indent', nodes: [3, 4] }, { anchor: 6, head: 14 })),
    '- #\n  n\n\n  - e\n  - m',
  );
  assert.equal(
    appliedText(
      executeOnText('-  more\n   \n  After the quote.\n\n- b\n', { type: 'deleteSoftLineBackward' }, { caret: 7 }),
    ),
    '- \n\n  After the quote.\n\n- b\n',
  );
  const r = assertApplied(
    executeOnText(
      '- > quoted in item\n\n    second para\n\n    \n\n    graph of child two\n',
      { type: 'indent' },
      { anchor: 37, head: 47, config: { flavor: 'commonmark', quotes: 'container' }, placeholders: [41] },
    ),
  );
  assert.equal(r.view.doc.text, '- > quoted in item\n\n    second para\n\n  - \n  - graph of child two\n');
});

test("a block written anew in normal form keeps its lists' own bullets: the root item's `+` too, not the default bullet", () => {
  for (const config of [{ indentUnit: 'tab', flavor: 'obsidian' }, { flavor: 'commonmark' }] as const) {
    assert.equal(
      appliedText(executeOnText('+ a\n\t+ + \n\t\t+ item\n', { type: 'deleteContentBackward' }, { caret: 9, config })),
      '+ a\n\t+ + item\n',
    );
  }
});

// HTML paste, fixed 2026-11-12 (dev/30-bugs.md): each bug's cases as they were in test/bugs.ts

test('adjacent nested lists stay two (B423)', () => {
  assert.equal(
    convertPastedHtml('<ul><li>x<ol><li>a</li></ol><ol><li>b</li></ol></li></ul>').rendered.match(/<ol/g)?.length,
    2,
  );
});

test('a rule in an item keeps the item (B425)', () => {
  assert.equal(convertPastedHtml('<ul><li><hr></li><li>next</li></ul>').rendered.match(/<li/g)?.length, 2);
});

test("a title's entity decodes once (B426)", () => {
  assert.match(convertPastedHtml('<p><a href="u" title="&amp;copy;">x</a></p>').rendered, /title="&amp;copy;"/);
});

test("a destination's spaces all stay (B427)", () => {
  assert.match(convertPastedHtml('<p><a href="x&#32;&#32;y">x</a></p>').rendered, /href="x%20%20y"/);
});

test('deeply nested parentheses stay a link (B428)', () => {
  assert.match(
    convertPastedHtml('<p><a href="a' + '('.repeat(33) + 'b' + ')'.repeat(33) + '">link</a></p>').rendered,
    /<a href/,
  );
});

test("a nested table's cells stay apart (B429)", () => {
  assert.match(
    convertPastedHtml('<table><tr><td>a<table><tr><td>b</td><td>c</td></tr></table>d</td></tr></table>').markdown,
    /b c/,
  );
});

test('rowspan 0 spans the row group (B430)', () => {
  assert.match(
    convertPastedHtml('<table><tr><td rowspan="0">a</td><td>b</td></tr><tr><td>c</td></tr></table>').markdown,
    /\|  \| c \|/,
  );
});

test('a rowspan stops at its row group (B431)', () => {
  assert.equal(
    convertPastedHtml(
      '<table><thead><tr><th rowspan="2">A</th><th>B</th></tr></thead><tbody><tr><td>C</td><td>D</td></tr></tbody></table>',
    ).markdown.split('\n')[0],
    '| A | B |',
  );
});

test('inherit keeps what is inherited (B435)', () => {
  assert.equal(
    convertPastedHtml('<div style="font-style:italic"><p><span style="font-style:inherit">x</span></p></div>').markdown,
    '*x*',
  );
});

test("text-decoration: none doesn't lift an ancestor's line (B436)", () => {
  assert.equal(
    convertPastedHtml(
      '<p><span style="text-decoration:line-through">a<span style="text-decoration:none">b</span>c</span></p>',
    ).markdown,
    '~~abc~~',
  );
});

test("a table cell's bold (B437)", () => {
  assert.equal(
    convertPastedHtml('<table><tr><td style="font-weight:bold">bold</td></tr></table>').markdown,
    '| **bold** |\n| --- |',
  );
});

test("a list's bold (B438)", () => {
  assert.equal(convertPastedHtml('<ul style="font-weight:bold"><li>x</li></ul>').markdown, '- **x**');
});

test("a link's own bold (B439)", () => {
  assert.match(convertPastedHtml('<p><a style="font-weight:bold" href="u">x</a></p>').rendered, /<strong>/);
});

test("duplicate with the caret past the final line break, the last node holding an empty last line: the caret at the copy's text end, in the text (seed 301, after B217)", () => {
  const r = assertApplied(executeOnText('- a\n- b\n', { type: 'duplicateSubtree' }, { caret: 8 }));
  assert.ok(r.view.selection.head <= r.view.doc.text.length);
});

test("a callout pasted after another, a blank line of ours between, or over a nested callout's body: the seam check reads the new callout's title after its `>`, the blank line kept (seed 301, B415)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '> [!note] Title\n\n> [!note] Title\n',
        { type: 'paste', clipboard: { 'text/plain': '> [!note] Title\n' } },
        { caret: 27, config: { flavor: 'obsidian' }, auto: [16] },
      ),
    ),
    '> [!note] Title\n\n> [!note] Title\n\n> [!note] Title\n',
  );
  assertNoWriteFailure(
    executeOnText(
      '> > [!note] Title\n> body text\n',
      { type: 'paste', clipboard: { 'text/plain': '> [!note] Title\n> body text\n' } },
      { anchor: 20, head: 30, config: { flavor: 'obsidian', indentUnit: 'tab' }, placeholders: [30] },
    ),
  );
});

test("Enter before a numbered item holding an empty quote at the note's end, no final line break: the quote, on the renumbered marker's line, named at its `>` (B450)", () => {
  for (const config of [{ flavor: 'obsidian', listParent: 'container' }, { flavor: 'gfm' }] as const) {
    assert.equal(
      appliedText(executeOnText('2. x\n3. > ', { type: 'enter' }, { caret: 4, config })),
      '2. x\n3. \n4. > ',
    );
  }
});

test('Enter in an item of a quote padded further on a later line than its first: the quote written in normal form, at one column (B449)', () => {
  assert.equal(
    appliedText(
      executeOnText('3. > quote\n      > - more\n', { type: 'enter' }, { caret: 21, config: { flavor: 'gfm' } }),
    ),
    '3. > quote\n   >\n   > - \n   > - more\n',
  );
  assert.equal(
    appliedText(executeOnText('> quote\n   > - more\n', { type: 'enter' }, { caret: 15 })),
    '> quote\n>\n> - \n> - more\n',
  );
});

test("a bold tag or a link around blocks: each block's text bold, or the link's (B440, B441)", () => {
  assert.equal(convertPastedHtml('<b><p>a</p><p>b</p></b>').markdown, '**a**\n\n**b**');
  assert.equal(convertPastedHtml('<a href="u"><p>a</p><p>b</p></a>').markdown, '[a](u)\n\n[b](u)');
  // (a wrapper turning bold off stays off)
  assert.equal(convertPastedHtml('<b style="font-weight:normal"><p>a</p></b>').markdown, 'a');
});

test("a quoted item's later line keeps the item's indentation (B347)", () => {
  // kept: 0f73d6f922bc
  const result = assertApplied(executeOnText('  > body\n\n- > a\n  > b\n', { type: 'copy', nodes: [1] }, { caret: 4 }));
  assert.equal(result.clipboard?.['text/plain'], '> body\n\n- > a\n  > b\n');
});

test("an item's later line keeps it (B347)", () => {
  const result = assertApplied(executeOnText('  > body\n\n- > a\n  b\n', { type: 'copy', nodes: [1] }, { caret: 4 }));
  assert.equal(result.clipboard?.['text/plain'], '> body\n\n- > a\n  b\n');
});

test("ourus's HTML of a callout, a wiki link and math, read back in Obsidian: their syntax; in GFM, the text they show (B373, B374, B375)", async () => {
  const { MdTree, MdFlavor, MdHtmlParser } = await import('../../src/parser/index.ts');
  const obsidian = MdFlavor.named('obsidian');
  const back = (t: string, flavor = obsidian): string =>
    MdHtmlParser.parse(MdTree.parse(t, obsidian).renderHtml(), { flavor }).markdown;
  assert.equal(back('> [!note] Title\n> body text\n'), '> [!note] Title\n> body text');
  assert.equal(back('a [[link]] b [[p|alias]]\n'), 'a [[link]] b [[p|alias]]');
  assert.equal(back('$$\nx^2\n$$\n'), '$$\nx^2\n$$');
  assert.equal(back('a $x$ b\n'), 'a $x$ b');
  assert.equal(back('> [!note] Title\n> body text\n', MdFlavor.named('gfm')), 'Title\n\nbody text');
  for (const t of ['```js\n```\n$$', '> [!note] Title\n> body text\n', 'a [[link]] b\n'])
    assert.deepEqual(htmlFailures(t, { flavor: 'obsidian' }), []);
});

test('a moved node with odd spacing in its subtree is written in normal form, that subtree only: a padded marker, a tab after one, a paragraph padded past its container (recommendation 1)', () => {
  const run = (t: string, c: OurusCommand, o: object): string => appliedText(executeOnText(t, c, o));
  // (B157: a tab after the marker, which a shift would widen into code)
  assert.equal(
    run('2.\n-\tfoo\n    - d\n[r]: /u', { type: 'indent', nodes: [2] }, { caret: 8 }),
    '2.\n   - foo\n     - d\n       [r]: /u',
  );
  // (B156)
  assert.equal(
    run('- a\n\n  b\n- \tf', { type: 'moveSubtree', to: { parent: 1, after: null } }, { caret: 13 }),
    '- a\n\n  - f\n\n  b',
  );
  // (B160: a quoted paragraph padded with a tab)
  assert.equal(
    run('>```\n-\n> \t:', { type: 'moveSubtree', nodes: [4], to: { parent: 1, after: null } }, { caret: 5 }),
    '> > :\n>```\n-',
  );
  // (B47: a duplicate of a padded paragraph and its list, the copy in normal form, the original as it is)
  assert.equal(
    run(' p\n\n-\n  \n  -', { type: 'duplicateSubtree' }, { caret: 2 }),
    ' p\n\n-\n  \n  -\np\n\n- \n\n  - ',
  );
  // (B468: a heading padded past its quote's `>`, under tabs)
  assert.equal(
    run('1. num\n   >  # \n', { type: 'outdent' }, { caret: 15, config: { flavor: 'gfm', indentUnit: 'tab' } }),
    '1. num\n   # \n',
  );
  // (B492: its child paragraph padded past its content column; the held space after the marker kept)
  assert.equal(
    run(
      '> a quote\n-   two\n\n     second paragraph of child two\n',
      { type: 'moveSubtreeUp' },
      { caret: 13, config: { flavor: 'commonmark', listParent: 'container' }, placeholders: [13] },
    ),
    '-  two\n\n   second paragraph of child two\n> a quote\n',
  );
  // (a padded item, its child's lines at its content column)
  assert.equal(run('- a\n-   b\n    more\n', { type: 'indent' }, { caret: 9 }), '- a\n  - b\n    more\n');
});

test("a tab after a marker, the item moved or copied: the copy in normal form across 9/10 (B278's first case); moved out of an unspaced quote, refused, not written wrong (B95's first case) (recommendation 1)", () => {
  assert.equal(appliedText(executeOnText('9. \tb', { type: 'duplicateSubtree' })), '9. \tb\n10. b');
  const moved = executeOnText(
    '-\n>a\n>1. \t[',
    { type: 'moveSubtree', nodes: [4], to: { parent: 'root', after: null } },
    { caret: 11 },
  );
  assert.ok(moved instanceof OurusRejected && moved.reason === 'not-expressible');
});

test("what the normal form keeps: padding every item of a list shares, the note's style; padding the caret is in, the user's (recommendation 1)", () => {
  assert.equal(
    appliedText(executeOnText('1.  one\n2.  two\n', { type: 'indent' }, { caret: 13 })),
    '1.  one\n    1.  two\n',
  );
  // (Enter's space kept, `enterSplitSpace: start`, then Tab with the caret in it: Enter65h)
  assert.equal(
    appliedText(executeOnText('- one two\n-  three\n- next\n', { type: 'indent' }, { caret: 12 })),
    '- one two\n  -  three\n- next\n',
  );
  assert.equal(
    appliedText(executeOnText('- Earlier\n-  Review\n  - Detail\n- Later\n', { type: 'indent' }, { caret: 13 })),
    '- Earlier\n  -  Review\n- Detail\n- Later\n',
  );
});

test("Enter in a tab-led shared marker line deeper in a spaced block, zoomed in or not: that line's items written in normal form, the lines above and beside it as they are (B497)", () => {
  const t =
    '- parent\n  - child one\n    - g\n  - child two\n\n\t- - xrandchild\n\n    second paragraph of child two\n  - child three\n';
  const want =
    '- parent\n  - child one\n    - g\n  - child two\n\n\t- - x\n\t  - randchild\n\n    second paragraph of child two\n  - child three\n';
  assert.equal(
    appliedText(
      executeOnText(
        t,
        { type: 'enter' },
        { caret: 52, config: { flavor: 'obsidian', indentUnit: 'tab' }, auto: [62], view: { folded: [], zoom: 5 } },
      ),
    ),
    want,
  );
  assert.equal(
    appliedText(executeOnText(t, { type: 'enter' }, { caret: 52, config: { flavor: 'obsidian', indentUnit: 'tab' } })),
    want,
  );
});

test('a selection end in a checkbox of a node written anew stays where it was in that node (recommendation 1)', () => {
  const r = assertApplied(
    executeOnText('1. a\n1. x\n\t  - [x] x\n', { type: 'moveSubtreeUp' }, { anchor: 8, head: 16 }),
  );
  const text = r.view.doc.text;
  assert.equal(text, '1. x\n\t- [x] x\n2. a\n');
  assert.deepEqual(r.view.selection, { anchor: 3, head: text.indexOf('[x]') + 1 });
});

test("a text copy's mark says how a paste takes its ends: `[` / `]` a boundary between blocks, kept apart; none within one text; an old mark read as no boundary (B188, dev/30-bugs.md's clipboard format)", () => {
  const mark = (text: string, anchor: number, head: number): string =>
    /^<!-- ourus[^>]*-->/.exec(
      assertApplied(executeOnText(text, { type: 'copy' }, { anchor, head })).clipboard!['text/html']!,
    )![0];
  assert.equal(mark('- one two', 2, 5), '<!-- ourus text -->', 'within one text, from its start');
  assert.equal(mark('para\nline', 2, 5), '<!-- ourus text -->', "within one text, to a line's start in it");
  assert.equal(mark('- one\n- two', 3, 9), '<!-- ourus text -->', 'inside both texts');
  assert.equal(mark('- one\n- two', 2, 9), '<!-- ourus text -->', "from a text's start: the paste joins it");
  assert.equal(mark('- one\n- two', 5, 9), '<!-- ourus [text -->', "past a text's end, its line break taken");
  assert.equal(mark('- one\n- two', 3, 8), '<!-- ourus text] -->', "to a text's start, the line break before it taken");
  assert.equal(mark('- one\n- two', 3, 6), '<!-- ourus text] -->', "to a line's start, before its marker");
  // (an old ourus copy, `<!-- ourus --><!-- text -->`, pastes as text with its seams open)
  const old = {
    'text/plain': 'e\n- tw',
    'text/markdown': 'e\n- tw',
    'text/html': '<!-- ourus --><!-- text --><p>e</p>',
  };
  assert.equal(appliedText(executeOnText('- x\n', { type: 'paste', clipboard: old }, { caret: 3 })), '- xe\n- tw\n');
});

test("a text selection whose two ends are both boundaries between blocks is whole nodes: copied as nodes, the selection kept; cut, Backspace and Delete take them out (dev/30-bugs.md's clipboard format)", () => {
  const text = '- one\n- two\n- three\n';
  const copied = assertApplied(executeOnText(text, { type: 'copy' }, { anchor: 5, head: 12 }));
  assert.equal(copied.clipboard!['text/markdown'], '- two\n');
  assert.ok(copied.clipboard!['text/html']!.startsWith('<!-- ourus --><'));
  assert.deepEqual(copied.view.selection, { anchor: 5, head: 12 });
  for (const type of ['cut', 'deleteContentBackward', 'deleteContentForward'] as const)
    assert.equal(appliedText(executeOnText(text, { type }, { anchor: 5, head: 12 })), '- one\n- three\n', type);
  // (a child taken too where the selection covers it)
  assert.equal(
    assertApplied(executeOnText('- one\n- two\n  - kid\n- three\n', { type: 'copy' }, { anchor: 5, head: 20 }))
      .clipboard!['text/markdown'],
    '- two\n  - kid\n',
  );
});

test("a text cut pastes back where it leaves the caret: across items, into a child, to a line's start before a marker, from a marker's padding (B188, B498)", () => {
  const back = (text: string, anchor: number, head: number): string => {
    const cut = executeOnText(text, { type: 'cut' }, { anchor, head });
    return appliedText(executeAfter(cut, { type: 'paste', clipboard: assertApplied(cut).clipboard! }));
  };
  for (const [text, a, h] of [
    ['- one\n- two\n- three', 4, 10],
    ['- one\n- two', 4, 6],
    ['para\n- one\n- two', 2, 10],
    ['- one two\n  - kid\n- three', 6, 17],
    ['- one\n- two\n  - kid\n', 7, 17],
    ['- one\n- two\n- three', 3, 12],
    ['> - one\n> - two\n', 6, 13],
    ['- one\n  more\n- two', 4, 8],
    ['pa\nra', 1, 4],
    ['> quote', 0, 3],
    ['> one\n> two', 3, 8],
  ] as const)
    assert.equal(back(text, a, h), text, text);
});

test("a text copy starting at a boundary, pasted at a text's end: the nodes after it, as a paste of nodes puts them, the raised line after it kept (seed 601)", () => {
  const clipboard = {
    'text/plain': '  > body text\n- > q',
    'text/markdown': '  > body text\n- > q',
    'text/html': '<!-- ourus [text --><p>&gt; body text</p>',
  };
  const start = { caret: 17, config: { flavor: 'commonmark' as const }, auto: [18] };
  assert.equal(
    appliedText(executeOnText('- > [!note] Title\n\n', { type: 'paste', clipboard }, start)),
    '- > [!note] Title\n- > body text\n- > q\n\n',
  );
  assert.deepEqual(lostMarksOnText('- > [!note] Title\n\n', { type: 'paste', clipboard }, start), []);
});

test("a plain text copy ending at a boundary, pasted on a blank line, goes into the text as plain lines do, the host's, the raised line after it kept (seed 651)", () => {
  const clipboard = { 'text/plain': '`\n', 'text/markdown': '`\n', 'text/html': '<!-- ourus text] --><p>`</p>\n' };
  assert.ok(
    executeOnText(
      '- item\n  \n\n',
      { type: 'paste', clipboard },
      { caret: 9, config: { flavor: 'gfm', listParent: 'container' }, auto: [10] },
    ) instanceof OurusDeferred,
  );
});

test('a quote of one paragraph written anew under `quotes: text` keeps a `>` line before it, so it reads as a quote, not the paragraph it frames (B491, B506)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '# Project plan\n1. > quote\n  >\n   > more\n',
        { type: 'moveSubtreeUp' },
        { caret: 26, config: { flavor: 'commonmark' } },
      ),
    ),
    '# Project plan\n>\n> more\n1. > quote\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '\n- > \n  >  quote\n---\n\n',
        { type: 'moveSubtreeDown' },
        { caret: 0, config: { flavor: 'obsidian' }, placeholders: [0] },
      ),
    ),
    '---\n\n- >\n  > quote\n\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '# Project plan\n- > [!note] Title\n > \n  > body text\n',
        { type: 'outdent' },
        { caret: 19, config: { flavor: 'gfm', indentUnit: 'tab' } },
      ),
    ),
    '# Project plan\n> [!note] Title\n\n>\n> body text\n',
  );
});

test("the seam check reads an item written anew at the writer's marker, so a block after it short of its old content column is lifted out of it (B503's shared lines)", () => {
  const run = (t: string, c: OurusCommand, o: object): string => appliedText(executeOnText(t, c, o));
  assert.equal(
    run(
      '-  - child two\n\n  second paragraph of child two\n',
      { type: 'enter' },
      { caret: 5, config: { flavor: 'obsidian', indentUnit: 'tab' } },
    ),
    '- - \n  - child two\n\nsecond paragraph of child two\n',
  );
  assert.equal(
    run(' - - item\n  ```js\n', { type: 'enter' }, { caret: 1, config: { flavor: 'gfm', indentUnit: 'tab' } }),
    '- - \n  - item\n```js\n',
  );
  assertNoWriteFailure(
    executeOnText(
      ' - - \n - sibling\n  > quoted in item\n',
      { type: 'indent' },
      { anchor: 5, head: 11, config: { flavor: 'gfm', indentUnit: 'tab' } },
    ),
  );
  // (an item whose quote's held empty first line goes, Shift-Tab: its marker alone on its line, the quote below, B467, B503)
  assert.equal(
    run(
      '2.  > \n    >\n    > quote\n   > more\n',
      { type: 'outdent' },
      { caret: 6, config: { flavor: 'obsidian', quotes: 'container' }, placeholders: [6], auto: [12] },
    ),
    '2. \n    > quote\n> more\n',
  );
  assert.equal(
    run(
      '-  > \n   >\n   > [!note] Title\n  > body text\n',
      { type: 'outdent' },
      { caret: 5, config: { flavor: 'gfm', quotes: 'container' }, placeholders: [5], auto: [10] },
    ),
    '- \n   > [!note] Title\n> body text\n',
  );
  // (an item given a text over the quote on its line: the quote on a line of its own below it, as written, `2. quote⏎   > quote`)
  assert.equal(
    run(
      '2.  > quote\n    >\n    > quote\n   > more\n',
      { type: 'deleteContentBackward' },
      { caret: 6, config: { flavor: 'commonmark', quotes: 'container' }, auto: [17] },
    ),
    '2. quote\n   > quote\n> more\n',
  );
});

test('Alt-Up on a held empty task last in a note with no final line break: the task moved, no placeholder carried for it, as an empty task needs none (seed 751)', () => {
  const r = assertApplied(
    executeOnText(
      '- item\n- [ ] ',
      { type: 'moveSubtreeUp' },
      { caret: 13, placeholders: [13], config: { flavor: 'obsidian' } },
    ),
  );
  assert.equal(r.view.doc.text, '- [ ] \n- item');
  assert.deepEqual(r.view.doc.marks.placeholders, []);
  assert.equal(
    appliedText(
      executeOnText(
        '  - [x] outline\n  - [ ] ',
        { type: 'moveSubtreeUp' },
        { caret: 24, placeholders: [24], config: { flavor: 'gfm', quotes: 'atom' } },
      ),
    ),
    '  - [ ] \n  - [x] outline',
  );
});

test('an item lined up further left with its list, last under a block that owns the list: the block after that one lifted with it, not read into it (B505, B513)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        'Final line ^blk\n- [ ] review\n- [ ] \n\n  - [ ] write spec\n  ```js\n',
        { type: 'indent' },
        { caret: 36, config: { flavor: 'gfm', quotes: 'container' } },
      ),
    ),
    'Final line ^blk\n- [ ] review\n  - [ ] \n\n- [ ] write spec\n```js\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '| a | b |\n-  child two\n  - grandchild\n\n  second paragraph of child two\n',
        { type: 'shiftEnter' },
        { caret: 13, config: { flavor: 'commonmark' }, auto: [38] },
      ),
    ),
    '| a | b |\n\n-\n  child two\n- grandchild\n\nsecond paragraph of child two\n',
  );
});

test("a block regrouped under an item that itself moved is read by the seam check at that item's content column, the raised line before a table kept (B493)", () => {
  const start = { caret: 30, config: { flavor: 'gfm' as const, quotes: 'atom' as const }, auto: [69] };
  const text = 'Final line ^blk\n- parent\n  -  two\n\n    second paragraph of child two\n\n| a | b |\n|---|---|\n';
  assert.equal(
    appliedText(executeOnText(text, { type: 'outdent' }, start)),
    'Final line ^blk\n- parent\n-  two\n\n   second paragraph of child two\n\n| a | b |\n|---|---|\n',
  );
});

test('a text copy pasted with a seam closed beside blanks alone: the blanks joined, no node of blanks made (seed 801)', () => {
  const clipboard = {
    'text/plain': 'child two\n',
    'text/markdown': 'child two\n',
    'text/html': '<!-- ourus text] --><p>child two</p>\n',
  };
  assert.equal(
    appliedText(executeOnText('  - x# \n', { type: 'paste', clipboard }, { caret: 6, config: { flavor: 'gfm' } })),
    '  - x#child two \n',
  );
});

test("a text cut whose end is under a node it takes out joins that end's text, the node's children after it staying under the upper node; a checkbox after a marker stays", () => {
  assert.equal(
    appliedText(executeOnText('- one\n- two\n  - kid\n  - more\n- three', { type: 'cut' }, { anchor: 3, head: 14 })),
    '- okid\n  - more\n- three',
  );
  // (an end in a marker before a checkbox: the host's, the checkbox kept, not taken with the marker)
  assert.ok(
    executeOnText('- [ ] task\n- [x] done', { type: 'deleteContentBackward' }, { anchor: 7, head: 12 }) instanceof
      OurusDeferred,
  );
});

test("Backspace over a selection ending before an item's marker joins the texts, the marker not read as text (B188)", () => {
  assert.equal(
    appliedText(executeOnText('- one\n- two', { type: 'deleteContentBackward' }, { anchor: 4, head: 6 })),
    '- ontwo',
  );
  assert.equal(
    appliedText(executeOnText('- one\n- two\n- three', { type: 'deleteContentBackward' }, { anchor: 0, head: 9 })),
    '- wo\n- three',
  );
});

test("a text copy ends at a line's start where it ends in that line's indentation, and renders the lines after its first as the blocks they are (B499, B500)", () => {
  const copy = (text: string, anchor: number, head: number) =>
    assertApplied(executeOnText(text, { type: 'copy' }, { anchor, head, config: { copySelection: 'text' } }))
      .clipboard!;
  assert.equal(copy('- one\n- two\n  - kid\n', 3, 14)['text/markdown'], 'ne\n- two\n');
  assert.equal(
    copy('- one\n- two\n  - kid\n', 3, 19)['text/html'],
    '<!-- ourus text --><p>ne</p>\n<ul>\n<li>two\n<ul>\n<li>kid</li>\n</ul>\n</li>\n</ul>\n',
  );
});

test('a join after a trailing backslash is a text join: `foo\\` and `*bar*` make `foo\\*bar*`, as the outliners that keep Markdown do (B203, decided 2026-11-13)', () => {
  assert.equal(
    appliedText(executeOnText('- foo\\\n- *bar*\n', { type: 'deleteContentBackward' }, { caret: 9 })),
    '- foo\\*bar*\n',
  );
  assert.equal(
    appliedText(executeOnText('- foo\\\n- *bar*\n', { type: 'deleteContentForward' }, { caret: 6 })),
    '- foo\\*bar*\n',
  );
});

test("a command whose lines the writer can't carry through the change as they are spelled is written again, what it places anew in normal form (recommendation 1, step 2)", () => {
  const run = (t: string, c: OurusCommand, o: object = {}): string => appliedText(executeOnText(t, c, o));
  // (moved out of quotes spelled `>-`, `>q`, `>→-`: B43, B44, B45)
  assert.equal(
    run(
      '\n> -\n>   - b\n> a\n>-\n- ]\n>',
      { type: 'moveSubtree', to: { parent: 'root', after: 5 }, nodes: [3] },
      { anchor: 10, head: 9 },
    ),
    '\n> -\n>-\n- ]\n- b\n  a\n>',
  );
  assert.equal(
    run(
      '[r]:u\nH\n=\n>-\n>   - b\n>q\n[r]: /u\n-',
      { type: 'moveSubtree', to: { parent: 2, after: 3 }, nodes: [5] },
      { caret: 17 },
    ),
    '[r]:u\nH\n=\n>-\n- b\n  q\n  [r]: /u\n-',
  );
  assert.equal(
    run(
      '-\n>\t-\n>     + [a]:u\n\t- x',
      { type: 'moveSubtree', nodes: [4], to: { parent: 'root', after: 1 } },
      { caret: 24 },
    ),
    '-\n- [a]:u\n  \\- x\n>\t-',
  );
  // (a quote paragraph padded one space, onto an item's marker line: B52)
  assert.equal(
    run(
      '- > a\n  >\n  >  b',
      { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: null } },
      { config: { quotes: 'container' } },
    ),
    'a\n\n- > b',
  );
  // (nested quotes spelled `>>`, before an unclosed fence: B181)
  assert.equal(run('> >e\n>>```', { type: 'outdent' }), '> e\n> > ```');
  // (a fence padded with a tab, moved under an item: B95)
  assert.equal(
    run(']\n>-\n\n> \t```', { type: 'moveSubtree', nodes: [5], to: { parent: 2, after: null } }),
    ']\n>> \t```\n>-',
  );
  // (unclosed math outdented, its blank line kept: B299's second case)
  assert.equal(
    run('- - $$\n\n ', { type: 'outdent' }, { caret: 7, config: { flavor: 'obsidian', quotes: 'container' } }),
    '- \n- $$\n  \n\n',
  );
  // (a padded footnote indented into an empty quote: B290's first case)
  assert.equal(run('>\n [^1]:', { type: 'indent' }, { caret: 8 }), '>\n>  [^1]:');
  // (a numbered run duplicated across 9/10, its quote kept: B169)
  assert.equal(
    run(
      '8. A\n9. Parent\n   > q\n10. Parent\n\n    second\n',
      { type: 'duplicateSubtree', nodes: [1, 2] },
      { config: { quotes: 'container' } },
    ),
    '8. A\n9. Parent\n   > q\n\n10. A\n\n11. Parent\n    > q\n\n12. Parent\n\n    second\n',
  );
  // (an empty item indented, a paragraph after it at another column: B404)
  assert.equal(
    run(
      '  - child two\n- \n    second paragraph of child two\n\npara one\n',
      { type: 'indent' },
      { caret: 16, auto: [51] },
    ),
    '  - child two\n\n    - \n      second paragraph of child two\n\npara one\n',
  );
  // (Shift-Tab on held empty tab-led items, B456, B466; on padded shared marker lines, B457, B485, B486)
  assert.equal(
    run(
      '> - si\n>\t- \n>\t- bling\n',
      { type: 'outdent' },
      { caret: 11, config: { flavor: 'obsidian', indentUnit: 'tab' }, placeholders: [11] },
    ),
    '> - si\n> - \n>\t- bling\n',
  );
  assert.equal(
    run(
      '-  item\n\t- \n  ```js\n',
      { type: 'outdent' },
      { caret: 11, config: { flavor: 'gfm', indentUnit: 'tab' }, placeholders: [11] },
    ),
    '-  item\n- \n\n  ```js\n',
  );
  assert.equal(
    run(
      '5.  -   second\n   - nested bullet\n',
      { type: 'outdent' },
      { caret: 8, config: { flavor: 'gfm', quotes: 'container' } },
    ),
    '5. \n- second\n- nested bullet\n',
  );
  assert.equal(
    run(' - - \n  - item\n  ```js\n', { type: 'outdent' }, { caret: 1, config: { flavor: 'obsidian' } }),
    ' - \n- \n- item\n```js\n',
  );
  assert.equal(
    run(
      '  >- -  over two lines\n over two lines\n',
      { type: 'outdent' },
      { caret: 23, config: { flavor: 'obsidian' } },
    ),
    '> - \n> - over two lines\n>    over two lines\n',
  );
  // (duplicated in a quote padded unevenly with a lazy line, B470; beside an item lined up further left, B487)
  assert.equal(
    run(
      '> a\n b\n  > - c\n  >    d\n  > - e\n',
      { type: 'duplicateSubtree' },
      { caret: 23, config: { flavor: 'obsidian', quotes: 'container' } },
    ),
    '> a\n b\n  > - c\n  >    d\n> - c\n>    d\n> - e\n',
  );
  assert.equal(
    run(
      '-\n\n  - sibling\n  > - list in quote\n',
      { type: 'duplicateSubtree' },
      { caret: 2, config: { flavor: 'commonmark', quotes: 'container' } },
    ),
    '-\n\n- \n\n- sibling\n> - list in quote\n',
  );
  // (Alt-Up in unspaced quotes, `>- x`: B474)
  assert.equal(
    run(
      '  > - list in quote\n  >- x\n  > \\> quoted in item\n',
      { type: 'moveSubtreeUp' },
      { caret: 26, config: { flavor: 'commonmark' }, auto: [31] },
    ),
    '  > - x\n  >   \\> quoted in item\n  > - list in quote\n',
  );
  assert.equal(
    run(
      '$$\n$$\n> [!note] Title\n>-  body text\n> more\n>-  body text\n',
      { type: 'moveSubtreeUp' },
      { caret: 47, config: { flavor: 'obsidian', listParent: 'container' } },
    ),
    '$$\n$$\n> [!note] Title\n> - body text\n> - body text\n>   more\n',
  );
  // (Tab on an empty item before a tab-padded blank line: B489)
  assert.equal(
    run(
      '  - child one\n  - \n\t\n\t  second paragraph of child two\n',
      { type: 'indent' },
      { caret: 20, config: { flavor: 'obsidian', indentUnit: 'tab' } },
    ),
    '  - child one\n\n\t- \n\t  \n\t  second paragraph of child two\n',
  );
});

test('where writing what a command places anew fails too, the root blocks it changes are written anew (recommendation 1, step 2)', () => {
  const run = (t: string, c: OurusCommand, o: object = {}): string => appliedText(executeOnText(t, c, o));
  // (a child pasted after a lazy line of nested quotes: the lazy line given its prefixes, B16)
  assert.equal(
    run('#\n>>-\t[a]:u\n\t"', {
      type: 'pasteAt',
      at: { parent: 4, after: 5 },
      clipboard: { 'text/plain': '> a\n>\n> b' },
    }),
    '#\n> > - [a]:u\n> >   "\n> >   > a\n> >   >\n> >   > b',
  );
  // (across 9/10: a drop first under a quoted item, B191; indents widening the parent, B210)
  assert.equal(
    run(
      '9. b\n10. > q\n    > r\n',
      { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } },
      { config: { quotes: 'container' } },
    ),
    '9. 9. b\n   > q\n   > r\n',
  );
  assert.equal(run('9. a\n9. b\n10. c', { type: 'indent', nodes: [3] }), '9. a\n10. b\n    1. c');
  assert.equal(run('99. a\n99. b\n100. c', { type: 'indent', nodes: [3] }), '99. a\n100. b\n     1. c');
  assert.equal(
    run(
      '3. third\n1. num\n2. > quote\n1. first\n2. second\n3. third\n1. first\n2. second\n3. third\n',
      { type: 'indent' },
      { caret: 77, config: { flavor: 'commonmark', quotes: 'container' } },
    ),
    '3. third\n4. num\n5. > quote\n6. first\n7. second\n8. third\n9. first\n10. second\n    1. third\n',
  );
  // (Enter in a quote's empty item under a lazy line, B480; in an unspaced quote's shared marker line, B482)
  assert.equal(
    run(
      '- sibling\n  > quoted in item\nx  - \n    > - list in quote\n',
      { type: 'enter' },
      { caret: 43, config: { flavor: 'commonmark', quotes: 'container' } },
    ),
    '- sibling\n  > quoted in item\n  > x  - \n  >\n  > - \n  > - list in quote\n',
  );
  assert.equal(
    run('>- > # y text\n', { type: 'enter' }, { caret: 3, config: { flavor: 'obsidian', indentUnit: 'tab' } }),
    '> - > \n>   >\n>   > # y text\n',
  );
  // (Enter after a quoted paragraph whose space after `>` is held: the space settled as the paragraph's, B413's Enter)
  assert.equal(
    run('> q', { type: 'enter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }),
    '>  q\n>\n> ',
  );
});

test('a draft that places nothing is written again too where the first writing fails: Backspace and Enter on a shared marker line under the tab unit, its root block anew (seed 551); B453, B473', () => {
  const run = (t: string, c: OurusCommand, o: object = {}): string => appliedText(executeOnText(t, c, o));
  assert.equal(
    run(
      '- parent\n  - child one\n  - - child two\n',
      { type: 'deleteContentBackward' },
      { caret: 29, config: { flavor: 'obsidian', indentUnit: 'tab' } },
    ),
    '- parent\n\t- child one\n\t- child two\n',
  );
  assert.equal(
    run(
      '- parent\n  - child one\n  - - child two\n',
      { type: 'enter' },
      { caret: 29, config: { flavor: 'gfm', indentUnit: 'tab' } },
    ),
    '- parent\n\t- child one\n\t- - \n\t  - child two\n',
  );
  assert.equal(
    run(
      '- item ^id1\n  - child one\n  - - child three\n',
      {
        type: 'paste',
        clipboard: {
          'text/plain': 'second paragraph of child two\n',
          'text/markdown': 'second paragraph of child two\n',
          'text/html': '<!-- ourus --><p>second paragraph of child two</p>\n',
        },
      },
      { caret: 32, config: { flavor: 'commonmark', indentUnit: 'tab' } },
    ),
    '- item ^id1\n\t- child one\n\t- - second paragraph of child two\n\t  - child three\n',
  );
  assert.equal(
    run(
      'x- Intro paragraph with a [[link]] and `code`.\n  - > [!note] Title\n  $$\n',
      { type: 'indent' },
      { caret: 1, config: { flavor: 'gfm', quotes: 'atom' } },
    ),
    '- x- Intro paragraph with a [[link]] and `code`.\n  - > [!note] Title\n      $$\n',
  );
  assert.equal(
    run(
      '- item ^id1\n  - child one\n\n  \n\t- grandchild\n',
      { type: 'indent' },
      { caret: 29, config: { flavor: 'commonmark', indentUnit: 'tab' }, placeholders: [29] },
    ),
    '- item ^id1\n\t- child one\n\t- \n\t- grandchild\n',
  );
});

test('a command written faithfully keeps its spelling: the second writing only where the first fails (recommendation 1, step 2)', () => {
  // (a padded marker the list shares, moved: written as it is, not anew)
  assert.equal(
    appliedText(executeOnText('1.  one\n2.  two\n', { type: 'moveSubtreeDown' }, { caret: 5 })),
    '1.  two\n2.  one\n',
  );
});

test('plain text indented as code, pasted into an empty note, stays code; with `pasteIndentedCode: dedent` it loses its indentation; a list without it pastes as the list (B26)', () => {
  const paste = (clip: string, config = {}): string =>
    appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': clip } }, { config }));
  assert.equal(paste('    code1\n    code2\n'), '    code1\n    code2\n');
  assert.equal(paste('\tcode1\n\tcode2\n'), '\tcode1\n\tcode2\n');
  assert.equal(paste('    code\n\n    more\n'), '    code\n\n    more\n');
  assert.equal(paste('    - child\n      - grandchild\n'), '- child\n  - grandchild\n');
  assert.equal(paste('  two spaces\n  only\n'), 'two spaces\nonly\n');
  assert.equal(paste('    a\n  b\n'), 'a\nb\n');
  assert.equal(paste('    code1\n    code2\n', { pasteIndentedCode: 'dedent' }), 'code1\ncode2\n');
  assert.equal(paste('\tcode1\n\tcode2\n', { pasteIndentedCode: 'dedent' }), 'code1\ncode2\n');
});

test('an empty heading in pasted HTML is dropped, as the text editors and most outliners do (B337, policy decided)', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  assert.equal(MdHtmlParser.parse('<h2></h2><p>x</p>').markdown, 'x');
});

test("a duplicated paragraph padded one space: the copy written without it, odd spacing normalized on the block the command makes (B47's second case, no bug)", () => {
  assert.equal(
    appliedText(executeOnText(' p\n- a\n', { type: 'duplicateSubtree' }, { caret: 1 })),
    ' p\n- a\n\np\n- a\n',
  );
});

test('adjacent bold of two spellings merges (B432)', () => {
  assert.equal(convertPastedHtml('<p><b>a</b><span style="font-weight:bold">b</span></p>').markdown, '**ab**');
});

test('an empty span between two bolds merges them (B432)', () => {
  assert.equal(convertPastedHtml('<p><b>a</b><span></span><b>b</b></p>').markdown, '**ab**');
});

test('code spans around a wrapper merge (B432)', () => {
  assert.equal(convertPastedHtml('<p><code>a</code><span><code>b</code></span></p>').markdown, '`ab`');
});

test('bold turned off at its start shows no delimiter (B433)', () => {
  assert.equal(convertPastedHtml('<p><b><span style="font-weight:normal">a</span>b</b></p>').markdown, 'a**b**');
});

test('bold turned off at its end shows no delimiter (B433)', () => {
  assert.equal(convertPastedHtml('<p><b>a<span style="font-weight:normal">b</span></b></p>').markdown, '**a**b');
});

test('bold turned off throughout is plain (B433)', () => {
  assert.equal(convertPastedHtml('<p><b><span style="font-weight:normal">a</span></b></p>').markdown, 'a');
});

test('spaces around a normal run stay out of the bold (B433)', () => {
  assert.equal(
    convertPastedHtml('<p><b>a<span style="font-weight:normal"> b </span>c</b></p>').markdown,
    '**a** b **c**',
  );
});

test('an italic opened after a bold and an italic close is spelled with underscores (B459)', () => {
  const converted = convertPastedHtml('<p><b>a<i>b</i></b><i>c</i></p>');
  assert.equal(converted.markdown, '**a*b***_c_');
  assert.doesNotMatch(converted.shown, /[*_]/);
  assert.doesNotMatch(convertPastedHtml('<p><i>a<b>b</b></i><b>c</b></p>').shown, /[*_]/);
});

test('an italic after one close keeps its asterisks (B459)', () => {
  assert.equal(convertPastedHtml('<p><i>a</i><b>b</b></p>').markdown, '*a***b**');
});

test("Unicode blanks at a bold's edges show no delimiter (B434)", () => {
  assert.doesNotMatch(convertPastedHtml('<p><b>\u2003x\u2003</b></p>').shown, /\*/);
});

test('a combining mark after bold punctuation shows no delimiter (B434)', () => {
  assert.doesNotMatch(convertPastedHtml('<p><b>a!</b>\u0301</p>').shown, /\*/);
});

test("Alt-Up on a held empty item at the note's end, no final line break, the caret on it: written without the placeholder the draft drops there (seed 351, B455)", () => {
  for (const [text, caret, config] of [
    ['- # item ^id1\n- other\n  - ', 26, { flavor: 'gfm', listParent: 'container' }],
    ['- sibling\n  > quoted in item\n- last\n\t- ', 39, { flavor: 'commonmark', indentUnit: 'tab' }],
    ['1. first\n   - nested bullet\n3. third\n\t1. ', 41, { flavor: 'commonmark', indentUnit: 'tab' }],
    ['  > quoted in item\n  > - list in quote\n  >   - ', 47, { flavor: 'commonmark', listParent: 'container' }],
  ] as const)
    assertApplied(executeOnText(text, { type: 'moveSubtreeUp' }, { caret, config, placeholders: [caret] }));
});

test('a node whose gap alone a command changes has its seam checked: Backspace on the blank line between an empty item and an indented unclosed fence after it keeps that line, the fence apart (B460)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- \n\n  ```\n- next\n',
        { type: 'deleteContentBackward' },
        { caret: 4, config: { flavor: 'gfm', indentUnit: 'tab' } },
      ),
    ),
    '- \n\n  ```\n- next\n',
  );
});

test("Enter staying at the start of a marker-like paragraph under a reference definition (`enterAtTextStart: stay`): the line written escaped, an item no more (B280, with B460's seam check)", () => {
  for (const marker of ['-', '+', '1.'])
    assertNoWriteFailure(
      executeOnText(
        `[a]:f\n${marker}`,
        { type: 'enter' },
        { caret: 6, config: { flavor: 'commonmark', enterAtTextStart: 'stay' } },
      ),
    );
});

test('outdenting a tab-led item whose text is a quote, a paragraph after a blank line of ours: the line kept, the paragraph no lazy line of the quote (seed 401)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        'P\n- sibling\n\t- > T\n\nQ\n',
        { type: 'outdent' },
        { caret: 18, config: { flavor: 'gfm', indentUnit: 'tab' }, auto: [19] },
      ),
    ),
    'P\n- sibling\n- > T\n\nQ\n',
  );
});

test('a tab-led item joined into an empty item above, a paragraph after it: the blank line between kept (B447)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        'third\n- \n\t- > [!note] Title\n\npara one\n',
        { type: 'deleteContentBackward' },
        { caret: 8, config: { flavor: 'commonmark', indentUnit: 'tab' }, placeholders: [8], auto: [28] },
      ),
    ),
    'third\n- > [!note] Title\n\npara one\n',
  );
});

test('an unevenly padded quote unwrapped by Backspace keeps the blank line of ours before the quote below (seed 401)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        ' > a\n  > - b\n\n> c\n',
        { type: 'deleteContentBackward' },
        { caret: 3, config: { flavor: 'gfm' }, auto: [13] },
      ),
    ),
    'a\n> - b\n\n> c\n',
  );
});

test("a quote's tab-led items under an item deleted, moved or outdented: written (B462)", () => {
  const text = '- sibling\n  > - \n\t-   >\t- x\n  >\t- list in quote\n';
  for (const type of ['deleteSubtree', 'moveSubtreeUp'] as const)
    assertNoWriteFailure(
      executeOnText(text, { type }, { caret: 20, config: { flavor: 'obsidian', indentUnit: 'tab' } }),
    );
  assertNoWriteFailure(
    executeOnText(
      '- item ^id1\n\t-   > - list in quote\n  >\t- \n',
      { type: 'outdent' },
      { anchor: 12, head: 35, config: { flavor: 'commonmark', indentUnit: 'tab' } },
    ),
  );
});

test('duplicating a quote padded unevenly in an item writes the copy after it, not into it (B469)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- sibling\n   > quoted in item\n  > - list in quote\n',
        { type: 'duplicateSubtree', nodes: [2] },
        { config: { flavor: 'gfm' } },
      ),
    ),
    '- sibling\n  > quoted in item\n  > - list in quote\n\n  > quoted in item\n  > - list in quote\n',
  );
});

test('Enter in a shared marker line `- - - ` of a note indented with tabs: the line split, its items on lines of their own by tabs (seed 401)', () => {
  assert.equal(
    appliedText(
      executeOnText('- - - last\n', { type: 'enter' }, { caret: 6, config: { flavor: 'obsidian', indentUnit: 'tab' } }),
    ),
    '- \n\t- \n\t\t- \n\t\t- last\n',
  );
});

test("Enter in an unspaced quote's padded shared marker line, in a note indented with tabs: written (B451)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '2. >- -  quote\n   > more\n',
        { type: 'enter' },
        { caret: 8, config: { flavor: 'commonmark', indentUnit: 'tab' } },
      ),
    ),
    '2. > - - \n   >   - quote\n   >     more\n',
  );
});

test('Alt-Up on an item holding a padded empty line, past a padded empty item: the placeholder moves with its line, not onto the like line that stays (seed 451)', () => {
  const moved = executeOnText(
    '-  \n- next\n  \n',
    { type: 'moveSubtreeUp' },
    { caret: 13, config: { flavor: 'obsidian' }, placeholders: [13] },
  );
  assert.equal(appliedText(moved), '- next\n  \n-  \n');
  assert.deepEqual(assertApplied(moved).view.doc.marks.placeholders, [9]);
  const twice = executeOnText(
    '- item ^id1\n  \n- x\n  \n```js\n',
    { type: 'moveSubtreeUp' },
    { caret: 21, config: { flavor: 'gfm' }, placeholders: [21] },
  );
  assert.deepEqual(assertApplied(twice).view.doc.marks.placeholders, [6]);
  assertNoWriteFailure(
    executeOnText(
      '   > more   > \n4. > quote\n   > \n',
      { type: 'moveSubtreeUp' },
      { caret: 31, config: { flavor: 'gfm', listParent: 'container' }, placeholders: [31] },
    ),
  );
});

test("Alt-Up on the second of two identical held empty quote items: the other keeps its placeholder on its own line (B471, the carry by the copy's piece)", () => {
  const moved = executeOnText(
    '- > \n\n- > \n\n- p\n',
    { type: 'moveSubtreeUp' },
    { caret: 9, config: { flavor: 'obsidian' }, placeholders: [4, 9] },
  );
  assert.equal(appliedText(moved), '- > \n\n- > \n\n- p\n');
  assert.deepEqual(assertApplied(moved).view.doc.marks.placeholders, [10]);
});

test('an item lined up further left, past an empty item taken out: the paragraph after it, which its column would put in the item, lifted with it (B414)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- p\n  - c\n  - \n\n    - g\n\n    s\n',
        { type: 'deleteSubtree' },
        { caret: 13, config: { flavor: 'commonmark' } },
      ),
    ),
    '- p\n  - c\n  - g\n\n  s\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- p\n  - c\n  - \n\n    - g\n\n    s\n',
        { type: 'deleteContentBackward' },
        { caret: 14, config: { flavor: 'commonmark' } },
      ),
    ),
    '- p\n  - c\n\n  - g\n\n  s\n',
  );
  assertNoWriteFailure(
    executeOnText(
      '- parent\n  -  \n    - \n    second paragraph of child two\n',
      { type: 'enter' },
      { caret: 14, config: { flavor: 'gfm', quotes: 'container' }, placeholders: [14] },
    ),
  );
});

test('a parent outdented to a paragraph, its child further in lined up: the paragraph moved out with it lifted too (B414)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- parent\n  - child one\n   - child two\n\n    second paragraph of child two\n',
        { type: 'outdent' },
        { caret: 8, config: { flavor: 'gfm', listParent: 'container' } },
      ),
    ),
    'parent\n- child one\n- child two\n\nsecond paragraph of child two\n',
  );
});

test("Tab on an empty item whose children follow a blank line: the paragraph after them at its container's column (B465)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- parent\n  - child three\n  - \n\n    - grandchild\n\n    second paragraph of child two\n',
        { type: 'indent' },
        { caret: 30, config: { flavor: 'gfm', listParent: 'container' } },
      ),
    ),
    '- parent\n  - child three\n\n    - \n\n  - grandchild\n\n  second paragraph of child two\n',
  );
});

test('Shift-Tab on a padded item whose next items sit short of its content column: written, its padding normalized, its children at its content column (B475; recommendation 1)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- parent\n  -  `\n    - \\- child two\n    - grandchild\n\n    second paragraph of child two\n  - child three\n',
        { type: 'outdent' },
        { caret: 15, config: { flavor: 'commonmark', quotes: 'atom' }, auto: [22] },
      ),
    ),
    '- parent\n- `\n  - \\- child two\n  - grandchild\n\n  second paragraph of child two\n  - child three\n',
  );
});

test("Shift-Enter before a padded item's text, an empty child and a fence after it: the empty item lined up, the fence lifted out of it (seed 451, B414's lift)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '-  em\n  - \n  ```js\n',
        { type: 'shiftEnter' },
        { caret: 3, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    ),
    '-\n  em\n- \n```js\n',
  );
});

test('Alt-Up on a bullet after an empty numbered item and a paragraph short of its content column: the bullet above the paragraph (B454)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '2.\n  x rst\n   - nested bullet\n',
        { type: 'moveSubtreeUp' },
        { caret: 16, config: { flavor: 'gfm', quotes: 'atom' } },
      ),
    ),
    '2.\n\n- nested bullet\n\nx rst\n',
  );
});

test("Tab on an item or a paragraph over a fence at an in-between indent after it: the fence, padded at the root, its padding dropped so it stays out of the list (B190, seed 501's seam check; refused until 2026-11-14)", () => {
  assert.equal(
    appliedText(
      executeOnText('x\n\n\\- \n - item\n  ```', { type: 'indent' }, { caret: 3, config: { flavor: 'commonmark' } }),
    ),
    'x\n\n- \\- \n  - item\n```',
  );
  assert.equal(
    appliedText(
      executeOnText(
        'item\n\n\\```js\n-   let x;\n  ```\n',
        { type: 'indent' },
        { caret: 6, config: { flavor: 'commonmark' }, auto: [5, 6] },
      ),
    ),
    'item\n- \\```js\n  -   let x;\n```\n',
  );
});

test("Tab on a held empty paragraph owning a list, a padded heading after it: the heading's padding dropped so it stays out of the list (B416, seed 501's seam check; refused until 2026-11-14)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        'Final line ^blk\n\n\n1. num\n  #  > more\n',
        { type: 'indent' },
        { caret: 17, config: { flavor: 'gfm', indentUnit: 'tab' }, placeholders: [17] },
      ),
    ),
    'Final line ^blk\n\n- \n\t1. num\n#  > more\n',
  );
});

test("Tab on a paragraph before a padded item whose text runs into a quote: the quote after it, its padding dropped, stays out of the list (B452, seed 501's seam check; refused until 2026-11-14)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        'para one\n\nnum\n1.  x> quote\n   > more\n',
        { type: 'indent' },
        { caret: 11, config: { flavor: 'obsidian', quotes: 'container' } },
      ),
    ),
    'para one\n\n- num\n  1.  x> quote\n> more\n',
  );
});

test("Tab on a padded paragraph owning a `2.` list whose text is a quote: the quote after it, its padding dropped, stays out of the list (B483, seed 501's seam check; refused until 2026-11-14)", () => {
  assert.equal(
    appliedText(
      executeOnText('x\n\n num\n2. > quote\n   > more\n', { type: 'indent' }, { caret: 5, config: { flavor: 'gfm' } }),
    ),
    'x\n\n- num\n  2. > quote\n> more\n',
  );
});

test("Tab on a paragraph above a padded item, a quote after it short of its content column: the quote's padding dropped so it stays out of the list (B484, seed 501's seam check; refused until 2026-11-14)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        'x\n\nx\n-  [!note] Title\n  > body text\n',
        { type: 'indent' },
        { caret: 4, config: { flavor: 'gfm' }, auto: [2] },
      ),
    ),
    'x\n- x\n  -  [!note] Title\n> body text\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        'Final line ^blk\n\n[^1]: a footnotenum\n1.  quote\n   > more\n',
        { type: 'indent' },
        { caret: 33, config: { flavor: 'commonmark', indentUnit: 'tab' } },
      ),
    ),
    'Final line ^blk\n\n- [^1]: a footnotenum\n\t1.  quote\n> more\n',
  );
});

test("a copy written anew with its marker on its first child's line: the seam check sees the marker there, the padded quote after it dropped to the root's column, out of the copy (B515)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        'second line\n- sibling\n-   > quoted in item\n  > - list in quote\n',
        { type: 'duplicateSubtree' },
        { caret: 11, config: { flavor: 'commonmark', quotes: 'container' } },
      ),
    ),
    'second line\n- sibling\n-   > quoted in item\n\nsecond line\n- sibling\n- > quoted in item\n> - list in quote\n',
  );
});

test("Alt-Down on a shared marker line's item under the tab unit, past the parent's paragraph (B517)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- parent\n\t- - two\n\t  - two\n\n  second paragraph of child two\n',
        { type: 'moveSubtreeDown' },
        { caret: 23, config: { flavor: 'commonmark', indentUnit: 'tab' } },
      ),
    ),
    '- parent\n\t- - two\n\n  second paragraph of child two\n\n\t- two\n',
  );
});

test('a callout left with its title alone, its body cut or deleted: the seam check reads its title line with its `>`, the blank line before the quote after it kept (seed 851)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        ' > [!note] Title\n  > body text\n\n> a quote\n',
        { type: 'cut' },
        { caret: 21, config: { flavor: 'obsidian' } },
      ),
    ),
    '> [!note] Title\n\n> a quote\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '> [!note] Title\n  > over two lines\n\n> a quote\n',
        { type: 'deleteSubtree' },
        { caret: 35, config: { flavor: 'obsidian' } },
      ),
    ),
    '> [!note] Title\n\n> a quote\n',
  );
});

test("an item's empty quote written anew: its `>` alone on the marker's line, `- >` (seed 851, B501, B472)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '# Project plan\n- >\n quoted in item\n  > `\n> \nover two lines\n',
        { type: 'deleteContentBackward' },
        { caret: 44, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    ),
    '# Project plan\n- >\nquoted in item\n  > `over two lines\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '# Project plan\n- >\n quoted in item\n  > `\n> over two lines\n',
        { type: 'enter' },
        { caret: 43, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    ),
    '# Project plan\n- >\nquoted in item\n> `\n>\n> over two lines\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- - item ^id1\n  > \n1. > quote\n\n',
        { type: 'indent' },
        { caret: 30, config: { flavor: 'gfm', indentUnit: 'tab' } },
      ),
    ),
    '- - item ^id1\n  >\n  1. > quote\n\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '%% comment %%\n> a quote\n- \t- >\n',
        { type: 'indent' },
        { caret: 16, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    ),
    '%% comment %%\n- > a quote\n\t- - >\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '- > - > \n\t1. num\n\n',
        { type: 'enter' },
        { caret: 17, config: { flavor: 'gfm', indentUnit: 'tab' }, placeholders: [17] },
      ),
    ),
    '- > - >\n  1. num\n  2. \n',
  );
});

test('an indented fence lifted out of the list above it: its lines lifted with its opening, its code as it was (seed 851)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > [!note] Title\n  - \n\n\n  - \n  ```js\n  let x;\n',
        { type: 'indent' },
        { caret: 23, config: { flavor: 'commonmark', listParent: 'container' }, placeholders: [23], auto: [24] },
      ),
    ),
    '- > [!note] Title\n  - \n- \n- \n\n```js\nlet x;\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '-  em\n  - \n  ```js\n  let x;\n',
        { type: 'shiftEnter' },
        { caret: 3, config: { flavor: 'gfm' } },
      ),
    ),
    '-\n  em\n- \n```js\nlet x;\n',
  );
});

test("an indented fence's body is its code: its lines past the opening's indentation (seed 851)", () => {
  const doc = OurusDoc.parse('  ```js\n  let x;\n    y\n  ```\n');
  const text = doc.textOf(doc.rootNode.children[0]!);
  assert.ok(text instanceof OurusAtom);
  assert.equal(text.body, 'let x;\n  y');
});

test("a raised blank line after a quote, the quote's own `>` lines before it gone: its mark kept on the bare blank line left (B444, B418)", () => {
  assert.deepEqual(
    lostMarksOnText(
      '  > quoted in item\n  > - list in quoteother\n  >\n\n  >   - last\n',
      { type: 'cut' },
      { caret: 25, config: { flavor: 'commonmark' }, auto: [48] },
    ),
    [],
  );
  const pasted = assertApplied(
    executeOnText(
      '- > [!note] Title\n  > \n\n  xFinal line ^blk\n',
      { type: 'paste', clipboard: { 'text/plain': '# body text\n' } },
      { caret: 22, config: { flavor: 'commonmark', indentUnit: 'tab' }, auto: [23] },
    ),
  );
  // (the blank line above the paste, where the held `>` line was, and the one setting it apart from
  // the paragraph after it, ours where the item's was: B418)
  assert.equal(pasted.view.doc.text, '- > [!note] Title\n\n\t- # body text\n\n  xFinal line ^blk\n');
  assert.deepEqual([...pasted.view.doc.marks.auto], [18, 34]);
  assert.deepEqual(
    lostMarksOnText(
      '- > a quote\n  > over tw\n  > \n\n  o lines\n',
      { type: 'enter' },
      { caret: 16, config: { flavor: 'commonmark', indentUnit: 'tab' }, auto: [29] },
    ),
    [],
  );
  assert.deepEqual(
    lostMarksOnText(
      '> Title\n>\n\n> body text\n',
      { type: 'enter' },
      { caret: 7, config: { flavor: 'obsidian' }, auto: [10] },
    ),
    [],
  );
  assert.deepEqual(
    lostMarksOnText(
      '> body text\n> more\n> \n\n> body text\n',
      { type: 'enter' },
      { caret: 14, config: { flavor: 'obsidian', indentUnit: 'tab' }, auto: [22] },
    ),
    [],
  );
  assert.deepEqual(
    lostMarksOnText(
      '- > [!note] Title\n  > body text\n  > \n\n## Notes\n',
      {
        type: 'paste',
        clipboard: {
          'text/plain': 'para one\nsecond line\n',
          'text/markdown': 'para one\nsecond line\n',
          'text/html': '<!-- ourus --><p>para one\nsecond line</p>\n',
        },
      },
      { caret: 22, config: { flavor: 'commonmark', quotes: 'container' }, auto: [37] },
    ),
    [],
  );
});

test('an item renumbered narrower, `101.` as `1.`: the seam after it checked, the indented code after it fenced, not read into it', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '100. a\n101. b\n\n    code\n',
        { type: 'outdent' },
        { caret: 0, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    ),
    'a\n1. b\n\n```\ncode\n```\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '100. a\n101. b\n\n    code\n',
        { type: 'deleteContentBackward' },
        { caret: 5, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    ),
    'a\n1. b\n\n```\ncode\n```\n',
  );
});

test("Alt-Down on an item past an empty heading: the seam check reads its paragraph at the item's content column, the indented code after it fenced, out of the item (B511)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > [!note] Title\n  - child two\n\n     second paragraph of child two\n# \n    - \n',
        { type: 'moveSubtreeDown' },
        { caret: 32, config: { flavor: 'gfm', quotes: 'container' } },
      ),
    ),
    '- > [!note] Title\n# \n- child two\n\n  second paragraph of child two\n```\n- \n```\n',
  );
});

test('in Obsidian, Alt-Down or Shift-Tab putting a `---` where it would close front matter: a blank line before the first, as DeleteSubtree9 (B525)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '---\n ---\n- > [!note] Title\n',
        { type: 'moveSubtreeDown' },
        { caret: 5, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    ),
    '\n---\n- > [!note] Title\n---\n',
  );
  assert.equal(
    appliedText(
      executeOnText(
        '* ---\n```js\nconst x = 1;\n---\n',
        { type: 'outdent' },
        { caret: 2, config: { flavor: 'obsidian' } },
      ),
    ),
    '\n---\n```js\nconst x = 1;\n---\n',
  );
});

test("Enter on a callout's held last line in an item, a blank line before its body (B516)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > [!note] Ti\n\n   > body text\n  > \n',
        { type: 'enter' },
        { caret: 35, config: { flavor: 'obsidian', listParent: 'container' }, placeholders: [35], auto: [15] },
      ),
    ),
    '- > [!note] Ti\n\n   > body text\n\n  \n',
  );
});

test("Delete Subtree in an unspaced callout's lazy `2. >` line (B488)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > [!note]2. > quote\n   > more\n\n  > body text\n',
        { type: 'deleteSubtree' },
        { caret: 32, config: { flavor: 'obsidian', quotes: 'container' } },
      ),
    ),
    '- > [!note]2. > quote\n\n  > body text\n',
  );
});

test("Alt-Up on a padded item past a callout's item: the padded quote after it dropped to the root's column, out of the callout (B518)", () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- > [!note] Title\n-  quoted in item\n  > over two lines\n',
        { type: 'moveSubtreeUp' },
        { caret: 35, config: { flavor: 'obsidian' } },
      ),
    ),
    '- quoted in item\n- > [!note] Title\n> over two lines\n',
  );
});

test("Shift-Enter, and Enter under `enterAtTextStart: stay`, at a lazy paragraph's start opens no line above it: a blank line would end the item it continues", () => {
  assert.ok(executeOnText('- [a]:u\nT\n', { type: 'shiftEnter' }, { caret: 8 }) instanceof OurusRejected);
  assert.equal(
    appliedText(executeOnText('- [a]:u\nT\n', { type: 'enter' }, { caret: 8, config: { enterAtTextStart: 'stay' } })),
    '- [a]:u\n\n  \n\n  T\n',
  );
  assert.equal(appliedText(executeOnText('a\nb\n', { type: 'shiftEnter' }, { caret: 0 })), '\na\nb\n');
});

test('Tab on an empty tab-led item above indented code its parent holds: the code, which would read into the item, fenced (B369)', () => {
  assert.equal(
    appliedText(
      executeOnText(
        '- item\n\n\t- \n\t-\n\n\t  done\n',
        { type: 'indent' },
        { caret: 15, config: { flavor: 'gfm', indentUnit: 'tab' }, auto: [7] },
      ),
    ),
    '- item\n\n\t- \n\t\t- \n\n  ```\n  done\n  ```\n',
  );
});

test('nodes pasted first under an item set apart from its children by a raised blank line: the line setting the paste apart from them ours (B418)', () => {
  const clipboard = {
    'text/plain': '> [!note] Title\n> body text\n> more\n',
    'text/markdown': '> [!note] Title\n> body text\n> more\n',
    'text/html': '<!-- ourus --><blockquote>\n<p>[!note] Title\nbody text\nmore</p>\n</blockquote>\n',
  };
  assert.deepEqual(
    lostMarksOnText(
      '- > quoted in item\n  > \n\n  over two lines\n',
      { type: 'paste', clipboard },
      { caret: 23, config: { flavor: 'gfm', listParent: 'container' }, auto: [24] },
    ),
    [],
  );
  const plain = assertApplied(
    executeOnText(
      '- quoted in item\n\n  over two lines\n',
      { type: 'paste', clipboard },
      { caret: 16, config: { flavor: 'gfm', listParent: 'container' }, auto: [17] },
    ),
  );
  assert.equal(
    plain.view.doc.text,
    '- quoted in item\n  - > [!note] Title\n    > body text\n    > more\n\n  over two lines\n',
  );
  assert.deepEqual([...plain.view.doc.marks.auto], [64]);
});
