import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, nearestDropPoint, type OurusCommand, type DropPoint, type DropSeam, OurusDeferred, OurusFailed, OurusRejected, OurusSuccess } from '../../src/commands/index.ts';
import { OurusConfig } from '../../src/config.ts';
import { OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { MdFlavor, MdTree } from '../../src/parser/index.ts';
import { parseWithMarks, allNodes, nodePlainText, resultStatus, executeOnText, executeAfter, appliedText, assertApplied, scalingFactor } from '../lib/index.ts';
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
      { weight: 6, arbitrary: fc.tuple(fc.integer({ min: 0, max: 3 }), fc.constantFrom('- ', '* ', '1. ', '2) ', '- [ ] ', '- [x] '), fc.constantFrom('a', 'b c', 'x', 'long text', '')) },
      { weight: 1, arbitrary: fc.constantFrom('', '# H', '## H2', 'para', '```', 'code', '  cont', '> [!note] T', '> q', '> - q') },
    ),
    { minLength: 1, maxLength: 14 },
  )
  .chain((lines) =>
    fc.constantFrom('  ', '\t', '   ', '    ').map((unit) =>
      lines.map((l) => (typeof l === 'string' ? l : unit.repeat(l[0]) + l[1] + l[2])).join('\n') + '\n',
    ),
  );

/** Consistently indented outlines: every nesting level is one unit deeper than its parent's marker. */
const arbTidyOutline = fc
  .array(fc.tuple(fc.integer({ min: 0, max: 3 }), fc.constantFrom('- ', '* ', '- [ ] '), fc.constantFrom('a', 'b c', 'x')), { minLength: 1, maxLength: 12 })
  .map((items) => {
    // a level can only go one deeper than the previous item
    let prev = -1;
    return items.map(([d, m, t]) => {
      const depth = Math.min(d, prev + 1);
      prev = depth;
      return [depth, m, t] as const;
    });
  })
  .chain((items) => fc.constantFrom('  ', '\t').map((unit) => items.map(([d, m, t]) => unit.repeat(d) + m + t).join('\n') + '\n'));

const COMMANDS: OurusCommand['type'][] = ['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward'];

/** Commands that act at a caret; the others take a selection. */
const CARET_COMMANDS = new Set<OurusCommand['type']>(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward']);

test('commands keep text, changes and selection consistent', () => {
  const failing: string[] = [];
  fc.assert(
    fc.property(fc.oneof(arbOutlineDoc, arbTidyOutline), arbFlavor, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, flavor, a, b, type) => {
      const doc = OurusDoc.parse(text, { config: { flavor } });
      const anchor = a % (text.length + 1);
      const head = CARET_COMMANDS.has(type) ? anchor : b % (text.length + 1);
      const r = executeCommand(OurusView.of(doc, { selection: { anchor, head } }), { type } as OurusCommand);
      if (r instanceof OurusFailed) failing.push(JSON.stringify([type, flavor, text, anchor, head]));
      if (!(r instanceof OurusSuccess)) return;
      assert.equal(applyChanges(text, r.changes), r.view.doc.text);
      for (const p of [r.view.selection.anchor, r.view.selection.head]) assert.ok(p >= 0 && p <= r.view.doc.text.length);
    }),
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
      const shape = (d: OurusDoc) => allNodes(d).map((n) => `${n.depth}:${n.kind}:${nodePlainText(d, n).replace(/\n/g, '|')}`).join('\n');
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
  assert.deepEqual(['a', 'b', 'c', 'd'].map((t) => idOf(r.view.doc, t)), before);
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
  const starts: [string, string, number[]][] = [['nothing', '', []], ['a line break', '\n', []], ['a held empty paragraph', '\n', [0]]];
  const clipboards = ['- x\n', 'x\n', 'x', '\n', 'a\n\nb\n', '# h\n', '---\ntitle: x\n---\n', '```\ncode\n```\n'];
  const commands: OurusCommand[] = [
    ...(['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'deleteSubtree', 'duplicateSubtree', ...CARET_COMMANDS] as const).map((type) => ({ type }) as OurusCommand),
    ...clipboards.flatMap((text) => [{ type: 'paste', clipboard: { 'text/plain': text } } as const, { type: 'pastePlain', text } as const]),
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
  const pasted = executeCommand(OurusView.of(empty, { selection: 0 }), { type: 'paste', clipboard: { 'text/plain': '- x\n' } });
  assert.deepEqual(pasted instanceof OurusSuccess && [pasted.view.doc.text, pasted.view.selection.head], ['- x\n', 3]);
});

// The document's true end, after its last line ending, is on no line, which the spec's buffers can't
// draw: a structural command from there acts on the last node, and the caret goes into its text
// (spec: MoveUp39, from a trailing blank line).
test('a structural command from the document end leaves the caret in the node it moved', () => {
  const doc = OurusDoc.parse('- one\n- two\n');
  const end = doc.text.length;
  for (const [type, text] of [['moveSubtreeUp', '- two\n- one\n'], ['indent', '- one\n  - two\n']] as const) {
    const r = executeCommand(OurusView.of(doc, { selection: end }), { type });
    assert.ok(r instanceof OurusSuccess, type);
    if (!(r instanceof OurusSuccess)) continue;
    assert.equal(r.view.doc.text, text, type);
    const node = r.view.doc.nodeAtLine(r.view.doc.lineAt(r.view.selection.head).index);
    assert.equal(node && nodePlainText(r.view.doc, node).split('\n')[0], 'two', `${type}: the caret in "two"`);
    // so the next press acts on it again
    if (type === 'moveSubtreeUp') assert.ok(executeCommand(r.view, { type: 'moveSubtreeDown' }) instanceof OurusSuccess);
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
  for (const [clipboard, text] of [['- a\n  - b', '# h1\n\n- a\n  - b\n'], ['> q', '# h1\n\n> q\n'], ['# h2\ntext', '# h1\n\n# h2\ntext\n']] as const) {
    const r = executeCommand(entered.view, { type: 'paste', clipboard: { 'text/plain': clipboard } });
    assert.equal(r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r instanceof OurusRejected ? r.reason : ''}`, text, clipboard);
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
  const drop = (nodes: number[], parent: number | 'root', after: number | null) => executeCommand(OurusView.of(doc, { selection: caret }), { type: 'moveSubtree', nodes, to: { parent, after } });
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
  const r = executeCommand(OurusView.of(flat, { selection: caret }), { type: 'moveSubtree', nodes: [flatId('a')], to: { parent: flatId('para'), after: null } });
  assert.equal(reason(r), 'not-expressible');
});

test('a drop at its own place changes nothing, and one elsewhere says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => allNodes(doc).find((n) => nodePlainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const own = executeCommand(OurusView.of(doc, { selection: caret }), { type: 'moveSubtree', nodes: [id('b')], to: { parent: 'root', after: id('a') } });
  assert.ok(own instanceof OurusSuccess && own.changes.length === 0 && own.view.doc === doc);
  const r = executeCommand(OurusView.of(doc, { selection: caret }), { type: 'moveSubtree', nodes: [id('b')], to: { parent: id('d'), after: null } });
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
  const r = executeCommand(OurusView.of(edited, { selection: 0 }), { type: 'moveSubtree', nodes: [c], to: { parent: 'root', after: null } });
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
  const refused = executeCommand(OurusView.of(doc, { selection: caret }), { type: 'indent', nodes: [id('b'), id('d')] });
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
  for (const seam of r.dropMap.seams) for (const point of seam.points) assert.deepEqual(point.drop, { type: 'moveSubtree', nodes: [id('b')], to: { parent: point.parent, after: point.after } });
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
    ...cases.map(([text, node]) => ({ text, command: { type: 'drag', nodes: [node] } as OurusCommand, flavor: undefined as OurusConfig['flavor'] | undefined })),
    ...clipboards.map(([text, c, flavor]) => ({ text, command: { type: 'drag', clipboard: { 'text/markdown': c, 'text/plain': c } } as OurusCommand, flavor })),
  ];
  for (const { text, command, flavor } of pickups) {
    const doc = OurusDoc.parse(text, { config: { flavor } });
    const r = executeCommand(OurusView.of(doc, { selection: 0 }), command);
    assert.ok(r instanceof OurusSuccess && r.dropMap, text);
    if (!(r instanceof OurusSuccess) || !r.dropMap) continue;
    for (const seam of r.dropMap.seams) {
      for (const point of seam.points) {
        const dropped = executeCommand(OurusView.of(doc, { selection: 0 }), point.drop);
        assert.ok(dropped instanceof OurusSuccess, `${JSON.stringify(text)} at ${point.parent}, ${point.after}: ${dropped instanceof OurusRejected ? dropped.detail : ''}`);
      }
    }
  }
  // and a drop there still refuses
  const doc = OurusDoc.parse('## b\n## c\n- d');
  const r = executeCommand(OurusView.of(doc, { selection: 0 }), { type: 'moveSubtree', nodes: [1], to: { parent: 3, after: null } });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('the nearest drop point: by column, then the own place, one that keeps the kind, the deeper', () => {
  const point = (depth: number, extra: Partial<DropPoint> = {}): DropPoint => ({ parent: 'root', after: null, depth, listDepth: depth, current: false, converts: false, drop: { type: 'copy' }, ...extra });
  const seam = (points: DropPoint[]): DropSeam => ({ beforeLine: 0, nodeAbove: null, nodeBelow: null, gapLines: 0, points });
  const x = (p: DropPoint): number => p.listDepth * 20;
  const all = () => true;
  const [p0, p1, p2] = [point(0), point(1), point(2)];
  assert.equal(nearestDropPoint(seam([p0, p1, p2]), 22, x, all), p1);
  assert.equal(nearestDropPoint(seam([p0, p1, p2]), 500, x, all), p2);
  // a refused column resolves to the nearest accepted one, and none to nothing
  assert.equal(nearestDropPoint(seam([p0, p1, p2]), 18, x, (p) => p !== p1), p0);
  assert.equal(nearestDropPoint(seam([p0, p1]), 0, x, () => false), null);
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
  const paste = (parent: number | 'root', after: number | null) => executeCommand(OurusView.of(doc, { selection: 2 }), { type: 'pasteAt', at: { parent, after }, clipboard: { 'text/plain': '- x\n- y\n' } });
  const reason = (r: ReturnType<typeof paste>) => (r instanceof OurusRejected ? r.reason : resultStatus(r));
  assert.equal(reason(paste(999, null)), 'no-such-node');
  assert.equal(reason(paste(id('a'), id('b'))), 'invalid-insertion-point');
  const r = paste(id('b'), null);
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  assert.equal(r.view.doc.text, '- a\n- b\n  - x\n  - y\n');
  assert.deepEqual(r.placed!.map((n) => nodePlainText(r.view.doc, r.view.doc.node(n)!)), ['x', 'y']);
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
  const removed = executeCommand(OurusView.of(doc, { selection: caret }), { type: 'deleteSubtree', nodes: [id('b')], expectMarkdown });
  assert.equal(removed instanceof OurusSuccess && removed.view.doc.text, '- a\n- d\n');
  // a child added to the run during the drag: it wasn't carried, so the run stays
  const edited = doc.update({ changes: [{ from: doc.text.indexOf('- d'), to: doc.text.indexOf('- d'), insert: '  - new\n' }] });
  const refused = executeCommand(OurusView.of(edited, { selection: caret }), { type: 'deleteSubtree', nodes: [id('b')], expectMarkdown });
  assert.equal(refused instanceof OurusRejected && refused.reason, 'content-changed');
});

test("a text drag's deletion is a cut's, and the host's where ourus doesn't do it", () => {
  const doc = OurusDoc.parse('```\nx\n```\n');
  const r = executeCommand(OurusView.of(doc, { selection: { anchor: 4, head: 5 } }), { type: 'deleteByDrag' });
  assert.ok(r instanceof OurusDeferred);
});

test('the empty paragraph Enter makes after a title at a text\'s end, with no line ending, goes again', () => {
  // (it spans no characters, past the final line ending: its placeholder goes with it, or moves)
  for (const start of ['# x', 'x\n===']) {
    const entered = executeOnText(start, { type: 'enter' }, { caret: start.length });
    assert.ok(entered instanceof OurusSuccess);
    if (!(entered instanceof OurusSuccess)) continue;
    for (const type of ['deleteContentBackward', 'deleteSoftLineBackward', 'cut', 'moveSubtreeUp'] as const) {
      const r = executeCommand(entered.view, { type });
      assert.ok(r instanceof OurusSuccess, `${type} after Enter in ${JSON.stringify(start)}: ${r instanceof OurusRejected ? r.detail : ''}`);
    }
    const back = executeCommand(entered.view, { type: 'deleteContentBackward' });
    if (back instanceof OurusSuccess) assert.equal(back.view.doc.rootNode.child(0).children.length, 0);
  }
});

test('Enter at the end of an unclosed fence at a text\'s end, with no line ending, makes an empty code line', () => {
  const r = executeOnText('```\ncode', { type: 'enter' }, { caret: 8 });
  assert.ok(r instanceof OurusSuccess);
  if (r instanceof OurusSuccess) assert.deepEqual([r.view.doc.text, r.view.selection.head], ['```\ncode\n\n', 9]);
});

test('a text whose lines end with a lone CR is edited as with LF', () => {
  for (const [type, text] of [['duplicateSubtree', '- a\r- a\r- b'], ['enter', '- a\r- \r- b']] as const) {
    const r = executeOnText('- a\r- b', { type }, { caret: 3 });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, text, type);
  }
});

test('a duplicate of a node whose blank line ends the text, with no line ending, keeps the copy\'s', () => {
  const r = executeOnText('> a\n>', { type: 'duplicateSubtree' }, { caret: 2 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '> a\n\n> a\n\n');
});

test('a paste of a hundred thousand lines and more applies, as plain text and as Markdown', () => {
  const lines = 'x\n'.repeat(150000);
  for (const command of [{ type: 'paste', clipboard: { 'text/plain': lines } }, { type: 'pastePlain', text: lines }] as const) {
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

test('outdent given a quote\'s paragraph, an item\'s text then, keeps a caret elsewhere where it is', () => {
  const doc = OurusDoc.parse('- z\n- > q\n- w\n', { config: { quotes: 'container' } });
  const r = executeCommand(OurusView.of(doc, { selection: 12 }), { type: 'outdent', nodes: [4] });
  assert.deepEqual(r instanceof OurusSuccess && [r.view.doc.text, r.view.selection.head], ['- z\n- q\n- w\n', 10]);
  const code = executeOnText('    - bravo\n- > bravo', { type: 'outdent', nodes: [4] }, { caret: 9, config: { quotes: 'container' } });
  assert.deepEqual(code instanceof OurusSuccess && [code.view.doc.text, code.view.selection.head], ['    - bravo\n- bravo', 9]);
});

test('a selection whose ends aren\'t positions in the text is refused, whatever the command', () => {
  const doc = OurusDoc.parse('- a\n  - b\n');
  for (const selection of [{ anchor: -1, head: -1 }, { anchor: 11, head: 11 }, { anchor: 0, head: NaN }, { anchor: 1.5, head: 2 }, { anchor: Infinity, head: Infinity }]) {
    for (const type of ['indent', 'cut', 'copy', 'fold', 'enter'] as const) {
      const r = executeCommand(OurusView.of(doc, { selection: selection }), { type });
      assert.equal(r instanceof OurusRejected && r.reason, 'invalid-selection', `${type} at ${JSON.stringify(selection)}`);
    }
  }
});

test('a text ending in a blank line with no line ending keeps it a blank line where a command writes it again', () => {
  const cases: [string, OurusCommand, number, number, string, Partial<OurusConfig>?][] = [
    ['>>\n\t', { type: 'outdent' }, 4, 4, '>\n\t'],
    ['+\n ', { type: 'duplicateSubtree' }, 3, 3, '+\n+ \n\n'],
    ['x\n- y\n ', { type: 'indent' }, 0, 2, '- x\n  - y\n '],
    ['> a\n>', { type: 'duplicateSubtree' }, 2, 2, '> a\n>\n> a\n>', { quotes: 'container' }],
    ['-\t```\nc\n\t', { type: 'moveSubtreeDown' }, 0, 0, 'c\n-\t```'],
  ];
  for (const [text, command, anchor, head, want, config] of cases) {
    const r = executeOnText(text, command, { anchor, head, config: config ?? {} });
    assert.equal(r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r.detail ?? ''}`, want, JSON.stringify(text));
  }
});

test('a list pasted after an unclosed fence that would own it is refused: it would be a line of the code', () => {
  const r = executeOnText('```', { type: 'paste', clipboard: { 'text/plain': '- x\n- y' } }, { caret: 3, config: { listParent: 'block' } });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('an empty line written after a lone CR, an old LF line after it, keeps three line breaks', () => {
  const r = executeOnText('a\r\rc\n\nc\n', { type: 'deleteSoftLineBackward' }, { caret: 4, config: { flavor: 'obsidian' } });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, 'a\r\r\r\n\nc\n');
  const code = executeOnText('- ```\n\n\n```b\n```', { type: 'deleteContentForward' }, { caret: 10 });
  assert.equal(code instanceof OurusSuccess && code.view.doc.text, '- ```\n\n\n');
});

test('a lone CR before a blank line\'s spaces, both lines copied: the spaces gone, the CR written as an LF, the blank line kept', () => {
  for (const type of ['enter', 'duplicateSubtree', 'outdent'] as const) {
    const r = executeOnText('- - a\r  \n', { type }, { caret: 4 });
    assert.ok(r instanceof OurusSuccess, type);
  }
  const r = executeOnText('- - a\r  \n', { type: 'enter' });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- - \n  - a\n\n');
});

test('Enter at the end of a quote of a text with no final line break: the empty quoted line ends the text, as an item\'s does', () => {
  for (const [text, at, want] of [['> a', 3, '> a\n> '], ['> q\n> rs', 8, '> q\n> rs\n> '], ['- a', 3, '- a\n- '], ['> a\n', 3, '> a\n> \n']] as const) {
    const r = executeOnText(text, { type: 'enter' }, { caret: at });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, want, text);
  }
});

test('Backspace on an empty last item after a folded one keeps the blank lines inside the folded one; a quote\'s paragraph outdented, its last blank `>` with no line ending, the quote gone', () => {
  const view = OurusView.of(OurusDoc.parse('- a\n\n  p\n\n  -\n-')).withFolded([1]);
  const r = executeCommand(view.withSelection(15), { type: 'deleteContentBackward' });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- a\n\n  p\n\n  -');
  const out = executeOnText('> a\n>', { type: 'outdent', nodes: [2] }, { caret: 2, config: { quotes: 'container' } });
  assert.equal(out instanceof OurusSuccess && out.view.doc.text, 'a\n\n');
});

test('Enter in a nested item on its quoted parent\'s marker line, no space after the `>`: the new item at its sibling\'s column, the quote written in normal form, `> ` (B57; normalized, decided 2026-11-11)', () => {
  const r = executeOnText('>0. - h\n', { type: 'enter' }, { caret: 7 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '> 0. - h\n>    - \n');
  const before = executeOnText('>0. - h\n', { type: 'enter' }, { caret: 6 });
  assert.equal(before instanceof OurusSuccess && before.view.doc.text, '> 0. - \n>    - h\n');
});

test('a quote atom\'s Enter, Shift-Enter and plain paste read its lines as the document does: tabs kept where they were, CRLF, an item\'s quote, the caret in markup (B198–B201)', () => {
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
    ['> - a\n>   - x\n>   - ┃\n>   - b', enter, { enterOnEmptyItem: 'exit' }, '> - a\n>   - x\n>   - \n>   - ┃\n>   - b'],
    ['> - a\n>   - x\n>   - ┃\n>   - b', enter, { enterOnEmptyItem: 'unwrap' }, '> - a\n>   - x\n>   ┃\n>   - b'],
    ['> - a\n>   - x\n>   - ┃', enter, { enterOnEmptyItem: 'sibling' }, '> - a\n>   - x\n> - ┃'],
    ['> - a\n> - ┃', enter, { enterOnEmptyItem: 'sibling' }, '> - a\n> ┃'],
  ];
  for (const [drawn, command, config, want] of rows) {
    const anchor = drawn.indexOf('┃');
    const plain = drawn.replace('┃', '');
    const head = plain.indexOf('┊') < 0 ? anchor : plain.indexOf('┊');
    const r = executeOnText(plain.replace('┊', ''), command, { anchor, head, config: { quotes: 'atom', ...config } });
    const got = r instanceof OurusSuccess ? r.view.doc.text.slice(0, r.view.selection.head) + '┃' + r.view.doc.text.slice(r.view.selection.head) : r instanceof OurusRejected ? `rejected ${r.reason}` : r.constructor.name;
    assert.equal(got, want, `${JSON.stringify(drawn)} ${command.type} ${JSON.stringify(config)}`);
  }
});

test('indenting an empty quote atom that carries a block id is refused: the id would be the item\'s (B31)', () => {
  const run = (text: string) => executeOnText(text, { type: 'indent' }, { caret: 1, config: { flavor: 'obsidian', quotes: 'atom' } });
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

test('the block-id guard finds a line\'s start past a lone CR: a soft Backspace in a later block is the host\'s', () => {
  for (const nl of ['\n', '\r', '\r\n']) {
    const text = ['p ^id', '', '<div>', 'text', '</div>'].join(nl);
    const r = executeOnText(text, { type: 'deleteSoftLineBackward' }, { caret: 16 + 3 * (nl.length - 1), config: { flavor: 'obsidian' } });
    assert.ok(r instanceof OurusDeferred, JSON.stringify(nl));
  }
});

test('indented code moved into a quote with no space after its `>` keeps its four columns past the space the `>` takes', () => {
  const r = executeOnText('    x\n>', { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } }, { config: { flavor: 'obsidian' } });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '>\n>     x');
});

test('a quote paragraph whose first line is one space further in (`>  b`) moved up onto an item\'s marker line: the space goes with it', () => {
  for (const [config, text, at, out] of [
    [{ quotes: 'container' }, '- > a\n  >\n  >  b\n', 15, '- >  b\n  >\n  > a\n'],
    [{ flavor: 'commonmark', indentUnit: 'tab' }, '1. num\n2. > quot\n   >\n   >  e\n   > more\n', 27, '1. num\n2. >  e\n   > more\n   >\n   > quot\n'],
    // (the moved line spelled with a tab for the `>`'s space, `>→ e`: the marker over it spans as far)
    [{ indentUnit: 'tab' }, '- num\n- > quot\n  >\n  >  e\n  > more\n', 23, '- num\n- >  e\n  >\tmore\n  >\n  >\tquot\n'],
  ] as const) {
    const r = executeOnText(text, { type: 'moveSubtreeUp' }, { caret: at, config });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, out);
  }
});

test('a node dropped first into a quote on an item\'s marker line: the marker over the quote\'s `>→`', () => {
  for (const [text, out] of [
    ['-\n- > q', '- > - \n  >\tq'],
    ['- > q\n\np', '- > p\n  >\n  >\tq'],
    ['- > q\n\n```\nc\n```', '- > ```\n  >\tc\n  >\t```\n  >\n  >\tq'],
  ] as const) {
    const doc = OurusDoc.parse(text, { config: { quotes: 'container', indentUnit: 'tab' } });
    const quote = doc.root.children.flatMap((c) => [c, ...c.children]).find((c) => c.kind === 'quote')!;
    const moved = text.startsWith('-\n') ? doc.root.children[0]! : doc.root.children.at(-1)!;
    const r = executeCommand(OurusView.of(doc, { selection: 0 }), { type: 'moveSubtree', nodes: [moved.id], to: { parent: quote.id, after: null } });
    assert.equal(r instanceof OurusSuccess && r.view.doc.text, out, text);
  }
});

test('an item whose marker shares its line with its quote, dropped first under the item above across 9/10: its quote named past the new marker', () => {
  const r = executeOnText('9. b\n10. > q\n    > r\n', { type: 'moveSubtree', nodes: [2], to: { parent: 1, after: null } }, { config: { quotes: 'container' } });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '9. b\n   1. > q\n      > r\n');
});

test('outdenting mixed-depth roots, an empty item in a quote led by `>  ` among them', () => {
  const r = executeOnText('>  -\n- a\n\n  x', { type: 'outdent' }, { anchor: 2, head: 13, config: { indentUnit: 'tab' } });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- \n- a\n\n  x');
});

test('a duplicate or a paste writes a footnote or reference definition as it is, a label the note defines too: labels needn\'t be unique, the host\'s to keep so, as block ids (B228)', () => {
  assert.equal(appliedText(executeOnText('[^1]: foo\nx', { type: 'duplicateSubtree' }, { caret: 9 })), '[^1]: foo\nx\n[^1]: foo\nx');
  assert.equal(appliedText(executeOnText('[a]: http://x', { type: 'duplicateSubtree' }, { caret: 13 })), '[a]: http://x\n[a]: http://x');
  assert.equal(appliedText(executeOnText('- a[^1]\n\n[^1]: n1', { type: 'paste', clipboard: { 'text/plain': '[^1]: other\n' } }, { caret: 17 })), '- a[^1]\n\n[^1]: n1\n\n[^1]: other');
});

test('a footnote definition dropped first under an empty item is refused, as code there is: it would be read as the item\'s text', () => {
  const r = executeOnText('0.', { type: 'pasteAt', clipboard: { 'text/plain': '[^b]: x' }, at: { parent: 1, after: null } }, { caret: 2 });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
});

test('a heading pasted into an item of a tab-indented text under `indentUnit: 2`: where its item would take in the paragraph after it, refused', () => {
  const r = executeOnText('-\n\ta\n\n\te', { type: 'paste', clipboard: { 'text/plain': '# X\n' } }, { caret: 4, config: { indentUnit: 2 } });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
  const tabs = executeOnText('-\n\ta\n\n\te', { type: 'paste', clipboard: { 'text/plain': '# X\n' } }, { caret: 4 });
  assert.ok(tabs instanceof OurusSuccess);
});

test('a paragraph `[!e]` moved into an empty quote, its first line, would read as its callout title: refused in Obsidian; in GFM, without callouts, the quote\'s text', () => {
  const r = executeOnText('>\n[!e]\n', { type: 'indent' }, { caret: 6, config: { flavor: 'obsidian' } });
  assert.equal(r instanceof OurusRejected && r.reason, 'not-expressible');
  const gfm = executeOnText('>\n[!e]\n', { type: 'indent' }, { caret: 6 });
  assert.equal(gfm instanceof OurusSuccess && gfm.view.doc.text, '> [!e]\n');
});

test('the differential\'s last write failures, in HEAD too: each writes', () => {
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
    assert.equal(r instanceof OurusSuccess ? r.view.doc.text : `${resultStatus(r)} ${r.detail ?? ''}`, want, JSON.stringify(text));
  }
});

test('a write in a long list or quote takes time in proportion to its length, not to its square', () => {
  // (the fastest of seven, from 2,000 lines to 8,000: four times as long where it is linear, sixteen
  // where it is quadratic, the bound leaving room for a busy machine; Enter mid a list, and mid a
  // quote's text, where it breaks it in two)
  for (const line of ['- item', '> line']) {
    const ratio = time(line, 8000) / time(line, 2000);
    assert.ok(ratio < 12, `${line}: 8,000 lines take ${ratio.toFixed(1)} times as long as 2,000`);
  }
  function time(line: string, n: number): number {
    const text = Array.from({ length: n }, (_, i) => `${line} ${i}`).join('\n');
    const doc = OurusDoc.parse(text);
    const at = text.indexOf(`${line} ${n / 2}`) + `${line} ${n / 2}`.length;
    let best = Infinity;
    for (let k = 0; k < 7; k++) {
      const start = performance.now();
      const r = executeCommand(OurusView.of(doc, { selection: at }), { type: 'enter' });
      best = Math.min(best, performance.now() - start);
      assert.ok(r instanceof OurusSuccess);
    }
    return best;
  }
});

test('a line break typed at the start of an opening fence: a blank line above the block, in a section and in an item too', () => {
  const typed = (text: string, config = {}) => {
    const at = text.search(/```|\$\$/);
    const r = executeOnText(text, { type: 'insertText', text: '\n' }, { caret: at, config });
    assert.ok(r instanceof OurusSuccess || r instanceof OurusDeferred, `${JSON.stringify(text)}: ${r instanceof OurusRejected ? r.detail : ''}`);
    return r instanceof OurusSuccess ? { text: r.view.doc.text, caret: r.view.selection.head } : null;
  };
  assert.deepEqual(typed('## N\n\n```\nx\n```\n'), { text: '## N\n\n\n```\nx\n```\n', caret: 7 });
  assert.deepEqual(typed('a\n## N\n```\nx\n```\n'), { text: 'a\n## N\n\n```\nx\n```\n', caret: 8 });
  assert.deepEqual(typed('- a\n  ```\n  code\n  ```\n'), { text: '- a\n\n  ```\n  code\n  ```\n', caret: 7 });
  assert.deepEqual(typed('p\n\n$$\nx\n$$\n', { flavor: 'obsidian' }), { text: 'p\n\n\n$$\nx\n$$\n', caret: 4 });
});

test('a pickup, expanding a whole list\'s selection and deleting it take time in proportion to the list, not to its square', () => {
  // (the fastest of five, 2,000 items to 8,000: four times as long where linear, sixteen where quadratic)
  const commands: [string, OurusCommand, (text: string) => { anchor: number; head: number }][] = [
    ['drag', { type: 'drag', pressed: 1 } as OurusCommand, () => ({ anchor: 2, head: 2 })],
    ['expandSelection', { type: 'expandSelection' }, (text) => ({ anchor: 0, head: text.length })],
    ['deleteSubtree', { type: 'deleteSubtree' }, (text) => ({ anchor: 0, head: text.length })],
  ];
  for (const [name, command, selection] of commands) {
    const time = (n: number): number => {
      const text = Array.from({ length: n }, (_, i) => `- Item ${i}`).join('\n') + '\n';
      const view = OurusView.of(OurusDoc.parse(text));
      let best = Infinity;
      for (let k = 0; k < 5; k++) {
        const start = performance.now();
        executeCommand(view.withSelection(selection(text)), command);
        best = Math.min(best, performance.now() - start);
      }
      return best;
    };
    const ratio = time(8000) / Math.max(time(2000), 1);
    assert.ok(ratio < 12, `${name}: 8,000 items take ${ratio.toFixed(1)} times as long as 2,000`);
  }
});

test('a copy of code keeps the spaces of its blank lines, which are the code\'s (fenced, indented, in an item)', () => {
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
  for (const [text, at] of [['>\n```\n  \n```\n', 4], ['> q\n\n```\n  \n```\n', 7]] as const) {
    const r = executeOnText(text, { type: 'indent' }, { caret: at, config: { quotes: 'container' } });
    assert.ok(r instanceof OurusSuccess, `${JSON.stringify(text)}: ${r instanceof OurusRejected ? r.detail : ''}`);
    const code = [...r.view.doc.rootNode.children].flatMap(function all(n): OurusNode[] { return [n, ...n.children.flatMap(all)]; }).find((n) => n.kind === 'atom');
    assert.ok(code && r.view.doc.textOf(code)!.text.includes('\n  \n'), JSON.stringify(r.view.doc.text));
  }
});

test('a line break in an image\'s alt text is a space: the image pasted inline, where the caret is', () => {
  const r = executeOnText('# ab', { type: 'paste', clipboard: { 'text/html': '<img src="x" alt="one&#10;two">' } }, { caret: 3 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '# a![one two](x)b');
});

test('indented code copied with ourus and pasted into an empty note is indented code still; a plain text\'s shared indentation goes', () => {
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
  const href = (html: string): string | undefined => /href="([^"]*)"|src="([^"]*)"/.exec(MdTree.parse(MdHtmlParser.parse(html).markdown, MdFlavor.gfm).renderHtml())?.slice(1).find((x) => x !== undefined);
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

test('HTML conversion: no script in code, a pre of several codes whole, a page\'s language class not the code\'s, underscore runs escaped whole', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<pre>a<script>hidden()</script>b</pre>'), '```\nab\n```');
  assert.equal(md('<pre><code>a</code> + <code>b</code></pre>'), '```\na + b\n```');
  assert.equal(md('<div class="language-en"><div class="highlight-source-python"><pre><code>print(1)</code></pre></div></div>'), '```python\nprint(1)\n```');
  assert.equal(md('<p><b>x</b> __a__</p>'), '**x** \\_\\_a\\_\\_');
  assert.equal(md('<p><b>x</b> snake_case_name</p>'), '**x** snake_case_name');
});

test('a bracket `autoClose` lists pairs in code, wraps a selection there, and its closer is stepped over; not on a fence\'s line; a callout title it would make is the host\'s', () => {
  const run = (text: string, anchor: number, head: number, typed: string, config = {}) => executeOnText(text, { type: 'insertText', text: typed }, { anchor, head, config: { autoClose: ['('], ...config } });
  const wrapped = run('```\nvalue\n```\n', 4, 9, '(');
  assert.ok(wrapped instanceof OurusSuccess);
  assert.equal(wrapped.view.doc.text, '```\n(value)\n```\n');
  assert.deepEqual(wrapped.view.selection, { anchor: 5, head: 10 });
  const paired = run('- ```\n  value\n  ```\n', 13, 13, '(');
  assert.equal(paired instanceof OurusSuccess && paired.view.doc.text, '- ```\n  value()\n  ```\n');
  if (paired instanceof OurusSuccess) {
    const over = executeCommand(paired.view, { type: 'insertText', text: ')' });
    assert.ok(over instanceof OurusSuccess && over.view.doc.text === paired.view.doc.text && over.view.selection.head === 15);
  }
  assert.ok(run('```\nvalue\n```\n', 3, 3, '(') instanceof OurusDeferred, 'the info string');
  assert.ok(run('> [!note Title\n> Body\n', 8, 8, '[', { flavor: 'obsidian', quotes: 'container', autoClose: ['['] }) instanceof OurusDeferred);
});

test('HTML conversion: table spans keep columns, a backslashed pipe in a cell\'s code, list counters and kinds, Word lists apart, footnotes, plain text for code', async () => {
  const { MdHtmlParser } = await import('../../src/parser/html-parser.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  // (B122) a cell spanning columns or rows: the ones it spans empty
  assert.equal(md('<table><tr><th>A</th><th>B</th><th>C</th></tr><tr><td colspan="2">x</td><td>c</td></tr></table>'), '| A | B | C |\n| --- | --- | --- |\n| x |  | c |');
  assert.equal(md('<table><tr><th>A</th><th>B</th></tr><tr><td rowspan="2">x</td><td>1</td></tr><tr><td>2</td></tr></table>'), '| A | B |\n| --- | --- |\n| x | 1 |\n|  | 2 |');
  // (B115) code with a backslash before a pipe: its text, escaped, the cell whole
  const table = md('<table><tr><th>x</th><th>y</th></tr><tr><td><code>\\|secret</code></td><td>end</td></tr></table>');
  assert.match(OurusDoc.parse(table).mdTree.renderHtml(), /<td>\\\|secret<\/td>\n<td>end<\/td>/);
  // (B125) counters: an item's value, reversed, past nine digits
  assert.equal(md('<ol><li value="5">a</li><li>b</li></ol>'), '5. a\n6. b');
  assert.equal(md('<ol reversed><li>a</li><li>b</li></ol>'), '2. a\n\n1) b');
  assert.equal(md('<ol start="999999999"><li>a</li><li>b</li></ol>'), '999999999. a\n\n- b');
  // (B123, B138) Word's lists, each its own and of its kind; a glyph outside one is text
  const word = (id: string, glyph: string, text: string): string => `<p style="mso-list:${id} level1 lfo1"><span style="mso-list:Ignore">${glyph}</span>${text}</p>`;
  assert.equal(md(word('l0', '1.', 'one') + word('l1', '•', 'two')), '1. one\n\n- two');
  assert.equal(md('<p>header</p><p><span style="mso-list:Ignore">1.</span> one</p>'), 'header\n\n1\\. one');
  // (B141) footnotes as GFM renders them read back as footnotes
  const source = 'Footnote[^1].\n\n[^1]: the note\n';
  assert.equal(md(OurusDoc.parse(source).mdTree.renderHtml()), source.trimEnd());
  // (B133) a clipboard of HTML alone pasted into code: its text
  const r = executeOnText('- ```\n  a\n  ```', { type: 'paste', clipboard: { 'text/html': '<p><b>x</b></p><p>y</p>' } }, { caret: 9 });
  assert.equal(r instanceof OurusSuccess && r.view.doc.text, '- ```\n  ax\n\n  y\n  ```');
  assert.equal(MdHtmlParser.plainText('<ul><li>a</li><li>b</li></ul><table><tr><td>c</td><td>d</td></tr></table><pre>  e</pre>'), 'a\nb\n\nc\td\n\n  e');
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
  assert.ok(refused instanceof OurusRejected && refused.reason === 'not-expressible');
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

test('Obsidian\'s tags and wikilinks in a link\'s text render as text, no anchor in an anchor', () => {
  const html = (t: string): string => OurusDoc.parse(t, { config: { flavor: 'obsidian' } }).mdTree.renderHtml();
  assert.equal(html('[x #tag y](u)'), '<p><a href="u">x #tag y</a></p>\n');
  assert.equal(html('[link [[n]]](u)'), '<p><a href="u">link n</a></p>\n');
});

test('HTML nested past the call stack pastes as its text; a long run of formatting elements, and a clipboard of blank lines and a word, convert in linear time', async () => {
  const { MdHtmlParser } = await import('../../src/parser/html-parser.ts');
  const { clipboardFragment } = await import('../../src/doc/index.ts');
  for (const html of ['<span>'.repeat(5000) + 'a*' + '</span>'.repeat(5000), '<blockquote>'.repeat(5000) + 'a*', '<ul><li>'.repeat(3000) + 'a*', '<pre>' + '<span>'.repeat(5000) + 'a*']) {
    assert.equal(MdHtmlParser.parse(html).markdown, 'a\\*', html.slice(0, 12));
  }
  // (the fastest of five, 8,000 against 2,000: four times as long where it is linear)
  const time = (f: () => void): number => Math.min(...Array.from({ length: 5 }, () => {
    const start = performance.now();
    f();
    return performance.now() - start;
  }));
  const bold = (n: number) => () => MdHtmlParser.parse('<b>a</b>'.repeat(n));
  const blank = (n: number) => () => clipboardFragment('\n'.repeat(n) + 'x', {});
  for (const [name, f] of [['formatting', bold], ['blank lines', blank]] as const) {
    const ratio = time(f(8000)) / Math.max(time(f(2000)), 0.5);
    assert.ok(ratio < 12, `${name}: 8,000 take ${ratio.toFixed(1)} times as long as 2,000`);
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

test('HTML conversion: two lists side by side stay two, a table\'s caption is a paragraph before it, a cell\'s blocks are set apart', async () => {
  const { MdHtmlParser } = await import('../../src/parser/index.ts');
  const md = (html: string): string => MdHtmlParser.parse(html).markdown;
  assert.equal(md('<ul><li>a</li></ul><ul><li>b</li></ul>'), '- a\n\n* b');
  assert.equal(md('<ol><li>a</li></ol><ol><li>b</li></ol>'), '1. a\n\n1) b');
  assert.equal(md('<table><caption>Cap</caption><tr><th>A</th></tr><tr><td>x</td></tr></table>'), 'Cap\n\n| A |\n| --- |\n| x |');
  assert.equal(md('<table><tr><th>x</th></tr><tr><td><p>a</p><p>b</p></td></tr></table>'), '| x |\n| --- |\n| a b |');
});

test('HTML conversion: a style sets formatting on any element, a block\'s for what it holds', async () => {
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

test('pasteAt keeps the indentation of ourus\'s own clipboard, as paste does', () => {
  const copied = assertApplied(executeOnText('    code\n', { type: 'copy' }, { caret: 4 }));
  assert.equal(appliedText(executeOnText('', { type: 'pasteAt', at: { parent: 'root', after: null }, clipboard: copied.clipboard! })), '    code\n');
});

test('ourus\'s copy of a node pastes as a node with its text/markdown lost on the way', () => {
  const { 'text/markdown': _, ...clipboard } = assertApplied(executeOnText('abc\n', { type: 'copy', nodes: [1] })).clipboard!;
  assert.equal(appliedText(executeOnText('xyz', { type: 'paste', clipboard }, { caret: 1 })), 'xyz\n\nabc');
});

test('a run shorter than a fence\'s closes nothing, so a clipboard\'s indented lines stay its code', () => {
  const text = appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': '````\n    code\n    ```' } }));
  assert.ok(text.includes('    code\n    ```'), text);
});

test('ourus\'s copy of an unclosed fence keeps its code, a line like a closing fence among it', () => {
  const copied = assertApplied(executeOnText('```\n    code\n    ```', { type: 'copy', nodes: [1] }));
  assert.ok(appliedText(executeOnText('', { type: 'paste', clipboard: copied.clipboard! })).includes('    code\n    ```'));
});

test('a bracket autoClose lists pairs in an empty note, the closer ours', () => {
  const paired = assertApplied(executeOnText('', { type: 'insertText', text: '(' }, { config: { autoClose: ['('] } }));
  assert.equal(paired.view.doc.text, '()');
  assert.equal(paired.view.selection.head, 1);
  assert.deepEqual([...paired.view.doc.marks.auto], [1]);
});

test('plain paste scales linearly, of list-looking lines and of leading blank lines', () => {
  const lines = (count: number) => executeOnText('text', { type: 'pastePlain', text: Array(count).fill('- x').join('\n') }, { caret: 4 });
  const blanks = (count: number) => executeOnText('- a', { type: 'pastePlain', text: '\n'.repeat(count) + 'x' }, { caret: 2 });
  // (eight times as many: linear is about 8, quadratic 64)
  assert.ok(scalingFactor(lines, 200, 1600) < 24);
  assert.ok(scalingFactor(blanks, 20000, 160000) < 24);
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
  const notes = ['- a\n- b\n', '# T\n\nx\n', '---\ntitle: x\n---\n\n- a\n- b\n', '- a\n  - b\n- c\n', '1. a\n2. b\n', '```\ncode\n```\n', '- [ ] t\n- u\n', '> q\n\np\n', 'p ^id\n\nq\n', '- a\n\n  b\n'];
  const commands: OurusCommand[] = [{ type: 'moveSubtreeDown' }, { type: 'moveSubtreeUp' }, { type: 'indent' }, { type: 'outdent' }, { type: 'enter' }, { type: 'shiftEnter' }, { type: 'deleteContentBackward' }, { type: 'deleteContentForward' }, { type: 'deleteSubtree' }, { type: 'duplicateSubtree' }, { type: 'cut' }, { type: 'pastePlain', text: '- x\n- y' }, { type: 'insertText', text: 'k' }, { type: 'selectNode' }];
  for (const flavor of ['gfm', 'obsidian'] as const) {
    for (const note of notes) {
      // (carets on the first two lines, where the mark is; and the whole note selected, from past it)
      const second = note.indexOf('\n', note.indexOf('\n') + 1);
      const selections = [...Array.from({ length: second + 1 }, (_, c) => [c, c]), [0, note.length]];
      for (const command of commands) {
        for (const [anchor, head] of selections) {
          const without = executeOnText(note, command, { anchor, head, config: { flavor } });
          const withMark = executeOnText(BOM + note, command, { anchor: anchor! + 1, head: head! + 1, config: { flavor } });
          const context = `${flavor} ${JSON.stringify(note)} ${command.type} ${anchor}–${head}`;
          assert.equal(resultStatus(withMark), resultStatus(without), context);
          if (without instanceof OurusSuccess && withMark instanceof OurusSuccess) {
            assert.equal(withMark.view.doc.text, BOM + without.view.doc.text, context);
            assert.deepEqual(withMark.view.selection, { anchor: without.view.selection.anchor + 1, head: without.view.selection.head + 1 }, context);
            assert.deepEqual([...withMark.view.doc.marks.placeholders], [...without.view.doc.marks.placeholders].map((p) => p + 1), context);
          }
        }
      }
    }
  }
});

test('a paragraph starting with a byte-order mark, moved first, gets a blank line before it: opening the note, the mark would be no character', () => {
  const moved = assertApplied(executeOnText('## Notes\n\ufeff\n- item\n', { type: 'moveSubtreeUp' }, { caret: 9, config: { listParent: 'container' } }));
  assert.equal(moved.view.doc.text, '\n\ufeff\n## Notes\n- item\n');
  assert.deepEqual(moved.view.doc.rootNode.children.map((n) => n.kind), ['paragraph', 'heading']);
  const text = assertApplied(executeOnText('a\n\n\ufeffb\n', { type: 'moveSubtreeUp' }, { caret: 4 }));
  assert.equal(text.view.doc.text, '\n\ufeffb\n\na\n');
  assert.deepEqual(text.view.selection, { anchor: 2, head: 2 });
});

test('a drag\'s deletion is the selection deleted as a cut deletes it: a subtree selection\'s roots taken out, the host\'s deletion checked by the zoom guard', () => {
  // (a subtree selection, as cut: its roots out, the zoom root too)
  const list = OurusView.of(OurusDoc.parse('- a\n- b\n- c\n'));
  const dragged = assertApplied(executeCommand(list.withSelection(list.selectionOf([2])), { type: 'deleteByDrag' }));
  assert.equal(dragged.view.doc.text, '- a\n- c\n');
  assert.deepEqual(dragged.view.selection, { anchor: 3, head: 3 });
  const zoomed = OurusView.of(OurusDoc.parse('- a\n  - b\n- c'), { zoom: 1 });
  const root = assertApplied(executeCommand(zoomed.withSelection(zoomed.selectionOf([1])), { type: 'deleteByDrag' }));
  assert.equal(root.view.doc.text, '- c');
  assert.equal(root.view.doc.text, assertApplied(executeCommand(zoomed.withSelection(zoomed.selectionOf([1])), { type: 'cut' })).view.doc.text);
  // (part of a text, the host's, a block id's markup too; refused where it would leave the zoom)
  const id = executeOnText('p ^abc', { type: 'deleteByDrag' }, { anchor: 2, head: 3, config: { flavor: 'obsidian', markup: 'decorated' } });
  assert.ok(id instanceof OurusDeferred);
  const leaves = executeCommand(OurusView.of(OurusDoc.parse('p\n- child\n\nq'), { zoom: 1, selection: { anchor: 0, head: 2 } }), { type: 'deleteByDrag' });
  assert.ok(leaves instanceof OurusRejected && leaves.reason === 'outside-zoom');
});

test('a flat paste of many items is written in linear time, and past JavaScript\'s limit on a call\'s arguments', async () => {
  const { spliceIn } = await import('../../src/text/index.ts');
  // (200,000 put in at once, past the limit on arguments: in order, around what was there)
  const list = ['a', 'b', 'c'];
  spliceIn(list, 1, 1, Array.from({ length: 200000 }, (_, k) => `${k}`));
  assert.deepEqual([list.length, list[0], list[1], list[200000], list[200001]], [200002, 'a', '0', '199999', 'c']);
  const small = [0, 1, 2];
  spliceIn(small, 3, 0, [3, 4]);
  assert.deepEqual(small, [0, 1, 2, 3, 4]);
  // (eight times the items: linear about 8; lining each new item up with its run's was quadratic, 30 and more)
  const paste = (n: number) => executeOnText('', { type: 'paste', clipboard: { 'text/plain': '- x\n'.repeat(n) } });
  assert.ok(scalingFactor(paste, 1000, 8000) < 24);
});

test('HTML conversion: a pre\'s first line break, an empty href, a tag\'s #, a table of no cells, deep HTML\'s blocks, very many children merged', async () => {
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
  assert.equal(md('<span>'.repeat(514) + '<p>one</p><p>two <b>x</b></p><p># h</p>' + '</span>'.repeat(514)), 'one\n\ntwo x\n\n\\# h');
  // (adjacent formatting merged, its children however many)
  assert.equal(md('<b>x</b><b>' + '<span>y</span>'.repeat(3) + '</b>'), '**xyyy**');
  assert.ok(md('<b>x</b><b>' + '<span>y</span>'.repeat(130000) + '</b>').startsWith('**xyy'));
});

test('HTML conversion: an image\'s alt text, with no source, held as text is; in plain text, the alt of every image', async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.parse('<p><img alt="&#xE000;0&#xE001;"></p>').markdown, '\uE0000\uE001');
  assert.equal(MdHtmlParser.parse('<p>a<img alt="x*y">b</p>').markdown, 'ax\\*yb');
  assert.equal(MdHtmlParser.plainText('<p>a<img alt="diagram">b</p>'), 'adiagramb');
  assert.equal(MdHtmlParser.plainText('<p><img src="u" alt="a  pic"> c</p>'), 'a pic c');
});

test('the readback compares a verbatim block\'s lines as they read: a re-indent that would change its code is refused, one that keeps it writes', () => {
  // (a fence indented one space takes a column of its tab-led line: `␠␠␠PAYLOAD`; made an item, nothing would)
  for (const [source, nodes] of [[' ```\n\tPAYLOAD\n ```', [1]], ['- a\n\n ```\n\tx\n ```', [2]]] as const) {
    const refused = executeOnText(source, { type: 'indent', nodes: [...nodes] });
    assert.ok(refused instanceof OurusFailed && /^the text written doesn't read as the draft: root › \d: code /.test(refused.detail ?? ''), JSON.stringify(source));
  }
  // (moves whose code reads the same still write)
  assert.equal(appliedText(executeOnText('- a\n  - ```\n    \tx\n    ```', { type: 'outdent', nodes: [2] })), '- a\n- ```\n  \tx\n  ```');
  assert.equal(appliedText(executeOnText('```\nx\n```', { type: 'indent', nodes: [1] })), '- ```\n  x\n  ```');
  assert.equal(appliedText(executeOnText(' ```\n  x\n ```', { type: 'indent', nodes: [1] })), '- ```\n   x\n  ```');
  assert.equal(appliedText(executeOnText('$$\n\tx\n$$', { type: 'indent', nodes: [1] }, { config: { flavor: 'obsidian' } })), '- $$\n  \tx\n  $$');
});

test('a paste over a selection from a text\'s start puts the nodes where the selection was, before what is left', () => {
  const md = { 'text/markdown': '- x\n- y' };
  for (const config of [{ flavor: 'obsidian', markup: 'text' }, {}] as const) {
    const first = assertApplied(executeOnText('abc\ndef', { type: 'paste', clipboard: md }, { anchor: 0, head: 3, config }));
    assert.equal(first.view.doc.text, '- x\n- y\n\ndef');
    assert.deepEqual(first.view.selection, { anchor: 7, head: 7 });
  }
  assert.equal(appliedText(executeOnText('abc def', { type: 'paste', clipboard: md }, { anchor: 0, head: 3 })), '- x\n- y\n\ndef');
  // (from mid-text, after the node, as a caret there pastes)
  assert.equal(appliedText(executeOnText('abc\ndef', { type: 'paste', clipboard: md }, { anchor: 1, head: 3 })), 'a\ndef\n\n- x\n- y');
  assert.equal(appliedText(executeOnText('- abc\n- def', { type: 'paste', clipboard: md }, { anchor: 2, head: 5 })), '- x\n- y\n- def');
});

test('a structured paste keeps a code block\'s lines of blanks; outside code they are blank lines', () => {
  const paste = (src: string) => appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': src, 'text/markdown': src } }));
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

test('a table pasted on an empty item is the item\'s text, as code is: on its marker\'s line, the item\'s children kept', () => {
  const table = '| a |\n| --- |\n| b |\n';
  for (const flavor of ['gfm', 'obsidian'] as const) {
    for (const [start, caret] of [['- ', 2], ['-', 1], ['- [ ] ', 6]] as const) {
      const pasted = assertApplied(executeOnText(start, { type: 'paste', clipboard: { 'text/markdown': table } }, { caret, config: { flavor } }));
      assert.equal(pasted.view.doc.text, '- | a |\n  | --- |\n  | b |', `${flavor} ${JSON.stringify(start)}`);
      assert.deepEqual(pasted.view.selection, { anchor: 25, head: 25 });
      assert.match(pasted.view.doc.mdTree.renderHtml(), /^<ul>\n<li>\n<table>/);
    }
  }
  assert.equal(appliedText(executeOnText('- \n  - child', { type: 'paste', clipboard: { 'text/plain': table } }, { caret: 2, config: { flavor: 'gfm' } })), '- | a |\n  | --- |\n  | b |\n  - child');
  assert.equal(appliedText(executeOnText('- a\n- \n- c', { type: 'paste', clipboard: { 'text/markdown': table } }, { caret: 6, config: { flavor: 'gfm' } })), '- a\n- | a |\n  | --- |\n  | b |\n- c');
  // (the item itself, its text set: its number, its blank lines, a zoom on it kept)
  assert.equal(appliedText(executeOnText('1. a\n2. b\n3. ', { type: 'paste', clipboard: { 'text/markdown': table } }, { caret: 13, config: { flavor: 'gfm', orderedLists: 'shift' } })), '1. a\n2. b\n3. | a |\n   | --- |\n   | b |');
  assert.equal(appliedText(executeOnText('- \n\n\nnext', { type: 'paste', clipboard: { 'text/markdown': table } }, { caret: 2, config: { flavor: 'gfm' } })), '- | a |\n  | --- |\n  | b |\n\n\nnext');
  const zoomed = assertApplied(executeOnText('- \n  - child', { type: 'paste', clipboard: { 'text/markdown': table } }, { caret: 2, config: { flavor: 'gfm' }, view: { zoom: 1 } }));
  assert.equal(zoomed.view.doc.text, '- | a |\n  | --- |\n  | b |\n  - child');
  assert.equal(zoomed.view.zoom, 1);
});

test('the clipboard\'s HTML is the copy as it read in its note: its definitions, its place, a text\'s inline text; a block id leaves no blank (B260)', () => {
  const html = (text: string, command: OurusCommand, start: Parameters<typeof executeOnText>[2] = {}): string => assertApplied(executeOnText(text, command, start)).clipboard!['text/html']!;
  // (a footnote copied without its reference: its content)
  assert.notEqual(html('[^1]: note\n  more\n', { type: 'copy' }, { caret: 4 }).replace(/<!--.*?-->/g, '').trim(), '');
  // (no blank where a block id was)
  assert.doesNotMatch(html('- a ^id\n  - b ^id2\n', { type: 'copy' }, { caret: 3, config: { flavor: 'obsidian' } }), /[ab] (\n|<)/);
  // (a reference link, with the note's definition)
  assert.match(html('[x][a]\n\n[a]: /url "title"', { type: 'copy', nodes: [1] }), /<a href="\/url" title="title">x<\/a>/);
  // (rules from mid-note, no front matter)
  assert.match(html('Intro\n\n---\n\nDetails\n\n---\n\nEnd', { type: 'copy', nodes: [2, 3, 4] }, { config: { flavor: 'obsidian' } }), /Details/);
  // (text from inside a paragraph: text, no block)
  for (const [text, from, to, block] of [['before # Heading after', 7, 16, /<h1>/], ['before - item after', 7, 13, /<ul>/], ['before > quote after', 7, 14, /<blockquote>/]] as const) {
    const copied = html(text, { type: 'copy' }, { anchor: from, head: to });
    assert.doesNotMatch(copied, block);
    assert.ok(copied.includes(text.slice(from, to).replace('>', '&gt;')), copied);
  }
});

test('a command at the note\'s end where its last line is blank but not empty, with no line break after it, keeps the blank line it ends with (B305)', () => {
  // (Backspace joining an empty last item above a last line of spaces or a tab)
  for (const last of [' ', '\t']) {
    const r = assertApplied(executeOnText(`- a\n\n-\n${last}`, { type: 'deleteContentBackward' }, { caret: 6 }));
    assert.equal(r.view.doc.text, '- a\n\n', JSON.stringify(last));
    assert.deepEqual(r.view.selection, { anchor: 3, head: 3 });
  }
});

test('a decorated caret entering a node starts where it edits, not on an opening fence: blank code\'s code line, a textless quote\'s code, a folded quote opened (B214)', () => {
  const decorated = { markup: 'decorated' } as const;
  assert.equal(assertApplied(executeOnText('p\n\n```\n\n```', { type: 'zoomIn', nodes: [2] }, { config: decorated })).view.selection.head, 7);
  assert.equal(assertApplied(executeOnText('p\n\n> ```\n> x\n> ```', { type: 'zoomIn', nodes: [2] }, { config: { ...decorated, quotes: 'container' } })).view.selection.head, 11);
  const view = OurusView.of(OurusDoc.parse('> ```\n> x\n> ```', { config: { ...decorated, quotes: 'container' } }), { folded: [1] });
  const left = assertApplied(executeCommand(view.withSelection(view.selectionOf([1])), { type: 'selectNode' }));
  assert.equal(left.view.selection.head, 8);
  assert.deepEqual([...left.view.folded], []);
});

test('one line placed at a bare marker whose text starts below it: a no-break space typed, and a plain paste under `pastePlainLines: enter`, stay the item\'s (B196)', () => {
  assert.equal(appliedText(executeOnText('-\n  a', { type: 'insertText', text: '\u00a0' }, { caret: 1 })), '- \u00a0\n  a');
  assert.equal(appliedText(executeOnText('-\n  a', { type: 'pastePlain', text: 'x' }, { caret: 1, config: { pastePlainLines: 'enter' } })), '- x\n  a');
});

test('Markdown\'s blank, not JavaScript\'s: a label\'s no-break space, a line of them, a fence\'s info, a form feed\'s line are text (B250)', () => {
  assert.equal(MdTree.parse('[a] [\u00a0a]\n\n[a]: /plain\n[\u00a0a]: /nbsp').references.size, 2);
  assert.notEqual(MdFlavor.gfm.firstNonParagraph(['\u00a0', '', '\u00a0']), -1);
  assert.equal(MdTree.parse('```\u00a0js\u00a0\nx\n```').root.children[0]!.attrs.info, '\u00a0js\u00a0');
  assert.equal(OurusDoc.parse('a\n\n\f\n\nb').isEmptyLine(2), false);
});

test('brackets pair, wrap and come back alike in prose, a quote atom and code; not in markup, a quote line\'s `>`s, its marker, a heading\'s `#`s, a checkbox, a fence (B242, B244)', () => {
  const atom: Partial<OurusConfig> = { autoClose: ['('], quotes: 'atom' };
  // (a quote atom: at a caret, over a selection)
  assert.equal(appliedText(executeOnText('> a ', { type: 'insertText', text: '(' }, { caret: 4, config: atom })), '> a ()');
  assert.equal(appliedText(executeOnText('> abc', { type: 'insertText', text: '(' }, { anchor: 2, head: 5, config: atom })), '> (abc)');
  // (its markup: the host's)
  for (const [text, anchor, head] of [['> - a b', 3, 3], ['> - a b', 2, 4], ['> # h', 3, 3], ['> - [ ] t', 6, 6]] as const) {
    assert.ok(executeOnText(text, { type: 'insertText', text: '(' }, { anchor, head, config: atom }) instanceof OurusDeferred, `${text} ${anchor}`);
  }
  // (code: Backspace takes back a pair of ours; a double listed alone closes)
  const paired = executeOnText('```\n\n```', { type: 'insertText', text: '(' }, { caret: 4, config: { autoClose: ['('] } });
  assert.equal(appliedText(executeAfter(paired, { type: 'deleteContentBackward' })), '```\n\n```');
  assert.equal(appliedText(executeOnText('```\n[\n```', { type: 'insertText', text: '[' }, { caret: 5, config: { autoClose: ['[['] } })), '```\n[[]]\n```');
  // (and in a quote atom, a pair of ours comes back too)
  assert.equal(appliedText(executeAfter(executeOnText('> a ', { type: 'insertText', text: '(' }, { caret: 4, config: atom }), { type: 'deleteContentBackward' })), '> a ');
});

test('addBlockId on an empty paragraph a placeholder holds is refused: the id alone would be no paragraph; an empty item takes one (B236)', () => {
  const entered = executeOnText('a\n\nb', { type: 'enter' }, { caret: 1, config: { flavor: 'obsidian' } });
  const r = executeAfter(entered, { type: 'addBlockId', name: 'x' });
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible', r.constructor.name);
  assert.equal(appliedText(executeAfter(executeOnText('- a', { type: 'enter' }, { caret: 3, config: { flavor: 'obsidian' } }), { type: 'addBlockId', name: 'x' })), '- a\n- ^x');
});

test('a placeholder on a text\'s empty first line settles, the line going, as an empty last line\'s does (B239)', async () => {
  const { settlePlaceholders } = await import('../../src/commands/index.ts');
  for (const [text, at, want] of [['\ntext', 0, 'text'], ['a\n\n\ntext', 3, 'a\n\ntext'], ['- a\n- \n  text', 6, '- a\n- text']] as const) {
    const doc = OurusDoc.parse(text, { marks: { placeholders: [at] } });
    const settled = settlePlaceholders(OurusView.of(doc, { selection: doc.text.length }))!;
    assert.equal(settled.view.doc.text, want, JSON.stringify(text));
    assert.deepEqual([...settled.view.doc.marks.placeholders], []);
  }
});

test('a held space in a text the draft carries as it was, moved or under another prefix, settles as in a text it sets (B237\'s shape reached from keys)', () => {
  // (`- a⏎  ┃```…`, Delete: the host's edit, one space held; then Alt-Down)
  assertApplied(executeOnText('- a\n ```\n  x\n  ```\n- b\n', { type: 'moveSubtreeDown' }, { caret: 4, placeholders: [4] }));
  assertApplied(executeOnText('a\n- b\n  - c\n', { type: 'moveSubtreeUp', nodes: [2] }, { config: { flavor: 'obsidian' }, placeholders: [6] }));
});

test('a blank line of ours between two quotes goes only where they stay apart without it: Tab on the first one\'s last paragraph, made an item, keeps it (B296)', () => {
  const source = '> first\n>\n> second\n\n>';
  for (const quotes of ['container', 'atom'] as const) {
    const doc = OurusDoc.parse(source, { config: { quotes }, marks: { auto: [source.lastIndexOf('\n')] } });
    const r = assertApplied(executeCommand(OurusView.of(doc, { selection: source.indexOf('second') }), { type: 'indent' }));
    assert.equal(r.view.doc.rootNode.children.length, 2, quotes);
  }
  const plain = OurusDoc.parse(source, { marks: { auto: [source.lastIndexOf('\n')] } });
  assert.equal(assertApplied(executeCommand(OurusView.of(plain, { selection: source.indexOf('second') }), { type: 'indent' })).view.doc.text, '> first\n>\n> - second\n\n>');
});

test('a child further in than its sibling, moved out after its parent, is read at its new depth: the paragraph after it kept apart (B303)', () => {
  const moved = executeCommand(OurusView.of(OurusDoc.parse('a\n- b\n\n- p\n    - c\n  - d\n\nz\n')), { type: 'moveSubtree', nodes: [4], to: { parent: 1, after: 3 } });
  assert.equal(appliedText(moved), 'a\n- b\n\n- p\n  - d\n\n- c\n\nz\n');
});

test('outdenting an item over a quoted list at an in-between indent is refused, not failed: its child read at its new depth (B190)', () => {
  const r = executeOnText('%% comment %%\n1. first\n   - nested bul\nx- sibling\n  > - list in quote', { type: 'outdent' }, { caret: 40, config: { flavor: 'gfm' } });
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible');
});

test('a refusal names a node in words, not by the parser\'s names: a rule, code (B259)', () => {
  const detail = (r: ReturnType<typeof executeOnText>): string | undefined => (r instanceof OurusRejected ? r.detail : undefined);
  assert.equal(detail(executeOnText('p\n\n---', { type: 'outdent' }, { caret: 3 })), 'a rule has no level to leave');
  assert.equal(detail(executeOnText('x\n\n```\ncode\n```\n\ny', { type: 'deleteContentBackward' }, { caret: 17 })), "can't join into code");
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

test('cutting a quote\'s first paragraph after an item writes the quote at its column, outside the item (B350)', () => {
  const cut = assertApplied(executeOnText('- a\n > x\n  > - b\n', { type: 'cut' }, { caret: 6 }));
  assert.equal(cut.view.doc.text, '- a\n > - b\n');
  assert.equal(cut.view.doc.rootNode.children.length, 2);
});

test('Enter at a heading\'s start after a quoted item: an empty paragraph held between them, set off from both (B365)', () => {
  const r = assertApplied(executeOnText('  - > [!\n    >\n    > x\n#     > note] Title\n', { type: 'enter' }, { caret: 25, config: { flavor: 'obsidian', listParent: 'container' } }));
  assert.equal(r.view.doc.text, '  - > [!\n    >\n    > x\n\n\n\n#     > note] Title\n');
  assert.deepEqual([...r.view.doc.marks.placeholders], [24]);
});

test('a two-paragraph plain paste on a bare marker leaves the paragraph after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(appliedText(executeOnText('-\n\n  a\n', { type: 'pastePlain', text: 'a\n\nb' }, { caret: 1 })), "- a\n\n  b\n\na\n");
});

test('two lines plain-pasted on a bare marker leave the fence after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(appliedText(executeOnText('-\n\n  ```\n', { type: 'pastePlain', text: 'x\ny' }, { caret: 1 })), "- x\n  y\n\n```\n");
});

test('a paste of paragraphs on a bare marker leaves the list after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(appliedText(executeOnText('-\n\n  - b\n', { type: 'paste', clipboard: { 'text/plain': 'p\n\nq' } }, { caret: 1 })), "- p\n\n  q\n\n- b\n");
});

test('Delete joining text to a bare marker leaves the paragraph after it apart: what follows kept apart, out of the item, as the outliners keep it (B193)', () => {
  assert.equal(appliedText(executeOnText('-\n\n===\n\n  a\n', { type: 'deleteContentForward' }, { caret: 1 })), "- ===\n\na\n");
});

test('a paragraph joins an empty item, the code after it its own: the code after it fenced, a block of its own (B328)', () => {
  // root: 2 children, read as 1
  assert.equal(appliedText(executeOnText('-\nx\n\n    c', { type: 'deleteContentBackward' }, { caret: 2, config: { flavor: 'obsidian' } })), "- x\n```\nc\n```");
});

test('Backspace joins a line under an empty numbered item: what follows kept apart, out of the item, as the outliners keep it (B352)', () => {
  assert.equal(appliedText(executeOnText("2.\nx > quote\n   > more\n", { type: "deleteContentBackward" }, { caret: 3, config: { flavor: "gfm", quotes: "atom" } })), "2. x > quote\n> more\n");
});

test('Backspace joins an escaped line under an empty item: what follows kept apart, out of the item, as the outliners keep it (B352)', () => {
  assert.equal(appliedText(executeOnText("```js\n```\n-\n\\> [!note] Title\n  > body text\n", { type: "deleteContentBackward" }, { caret: 12, config: { flavor: "commonmark", indentUnit: "tab" }, auto: [12] })), "```js\n```\n- \\> [!note] Title\n> body text\n");
});

test('Delete at an empty item\'s end: what follows kept apart, out of the item, as the outliners keep it (B352)', () => {
  assert.equal(appliedText(executeOnText("-\nx > [!note] Title\n  > body text\n", { type: "deleteContentForward" }, { caret: 1, config: { flavor: "obsidian" } })), "- x > [!note] Title\n> body text\n");
});

test('Backspace joins a line before a table: the table set apart, the joined text escaped (B352)', () => {
  assert.equal(appliedText(executeOnText("-\n--\n| a | b |\n|---|---|\n", { type: "deleteContentBackward" }, { caret: 2, config: { flavor: "gfm", listParent: "container" } })), '- \\--\n\n| a | b |\n|---|---|\n');
});

test('Enter at a fence after an item\'s unclosed fence: the new line the open code\'s, an empty line of it, as a text editor writes it (B205)', () => {
  assert.equal(appliedText(executeOnText('- ```\n```', { type: 'enter' }, { caret: 6 })), '- ```\n\n```');
  assert.equal(appliedText(executeOnText('- item\n  ```js\n ```\n', { type: 'enter' }, { caret: 15 })), '- item\n  ```js\n\n ```\n');
  assert.equal(appliedText(executeOnText('- $$\n$$\n', { type: 'enter' }, { caret: 5, config: { flavor: 'obsidian' } })), '- $$\n\n$$\n');
});

test('Backspace on an empty item after an item\'s unclosed fence: the blank line after it the open code\'s (B205)', () => {
  assert.equal(appliedText(executeOnText('- item\n  ```js\n- \n\n', { type: 'deleteContentBackward' }, { caret: 17 })), '- item\n  ```js\n\n');
});

test('the third shared marker emptied: the nested empty items each on a line of their own, as the outliners show them, not `- - - `, a rule (B209)', () => {
  assert.equal(appliedText(executeOnText('- - - a\n', { type: 'enter' }, { caret: 4 })), '- \n  - \n    - \n    - a\n');
  assert.equal(appliedText(executeOnText('- - - a', { type: 'deleteSoftLineBackward' }, { caret: 7 })), '- \n  - \n    - ');
  assert.equal(appliedText(executeOnText('* * * a', { type: 'deleteSoftLineBackward' }, { caret: 7 })), '* \n  * \n    * ');
});

test('the inner item of an indented shared marker line taken out, its child led by a tab: the block, its items mixing tabs and spaces, written anew in normal form (B348)', () => {
  assert.equal(appliedText(executeOnText('  - - \n\t- x\n', { type: 'deleteContentBackward' }, { caret: 6, config: { indentUnit: 'tab' } })), '- - x\n');
  assert.equal(appliedText(executeOnText('  - - \n\t- x\n', { type: 'deleteSubtree' }, { caret: 6 })), '- - x\n');
  assert.equal(appliedText(executeOnText('  - - a\n\t- x\n', { type: 'deleteSubtree' }, { caret: 7 })), '- - x\n');
  // (moved down and back: in normal form both ways)
  assert.equal(appliedText(executeOnText('  - - \n\t- x\n', { type: 'moveSubtreeDown' }, { caret: 6 })), '- - x\n  - \n');
  assert.equal(appliedText(executeOnText('  - - x\n\t- \n', { type: 'moveSubtreeUp' }, { caret: 11 })), '- - \n  - x\n');
});

test('a quoted paragraph with no space after its `>` moved up onto an item\'s marker line: written with one (B349)', () => {
  assert.equal(appliedText(executeOnText('- > a\n  >\n  >x t\n', { type: 'moveSubtreeUp' }, { caret: 14 })), '- > x t\n  >\n  > a\n');
});

test('in Obsidian, a paste ending in `---` after a `---` at the note\'s start: a blank line before the first, which would open front matter with it (`pasteAtTextStart: after`; B387)', () => {
  const text = appliedText(executeOnText("---\n", {"type": "paste", "clipboard": {"text/plain": "## Notes\n\n- parent\n  - child one\n    - grandchild\n  - child two\n\n    second paragraph of child two\n  - child three\n\n- item\n  ```js\n  let x;\n  ```\n- next\n\n---\n", "text/markdown": "## Notes\n\n- parent\n  - child one\n    - grandchild\n  - child two\n\n    second paragraph of child two\n  - child three\n\n- item\n  ```js\n  let x;\n  ```\n- next\n\n---\n", "text/html": "<!-- ourus --><h2>Notes</h2>\n<ul>\n<li>\n<p>parent</p>\n<ul>\n<li>\n<p>child one</p>\n<ul>\n<li>grandchild</li>\n</ul>\n</li>\n<li>\n<p>child two</p>\n<p>second paragraph of child two</p>\n</li>\n<li>\n<p>child three</p>\n</li>\n</ul>\n</li>\n<li>\n<p>item</p>\n<pre><code class=\"language-js\">let x;\n</code></pre>\n</li>\n<li>\n<p>next</p>\n</li>\n</ul>\n<hr />\n"}}, {"caret": 0, "config": {"flavor": "obsidian", "pasteAtTextStart": "after"}}));
  assert.ok(text.startsWith('\n---\n'), JSON.stringify(text));
});

test('Enter on a padded empty item, an item after it two columns in: the empty item written `- `, narrower, the item after it lined up, a sibling still (B378)', () => {
  assert.equal(appliedText(executeOnText('-  \n  - item\n', { type: 'enter' }, { caret: 3, placeholders: [3] })), '- \n- \n- item\n');
  assert.equal(appliedText(executeOnText('  - child one\n\t-  \n\t  - grandchild\n', { type: 'enter' }, { caret: 18, placeholders: [18] })), '  - child one\n\n\t- \n\t- \n\t- grandchild\n');
});

test('a quote\'s first block on an item\'s marker line moved down past a quoted heading: into its section, the heading on the marker line, not a second item (B360, B351)', () => {
  assert.equal(appliedText(executeOnText('- > a\n  > # b\n', { type: 'moveSubtreeDown' }, { caret: 5 })), '- > # b\n  > a\n');
  assert.equal(appliedText(executeOnText('1. > [!note] Title\n   > bo\n   > # dy text\n', { type: 'moveSubtreeDown' }, { caret: 26, config: { flavor: 'commonmark', listParent: 'container' } })), '1. > # dy text\n   > [!note] Title\n   > bo\n');
  assert.equal(appliedText(executeOnText('- > \n  > # x\n', { type: 'moveSubtreeDown' }, { caret: 4, placeholders: [4] })), '- > # x\n  > \n');
  // (past an empty item that is a setext underline, `b` a heading: seed 51's)
  assert.equal(appliedText(executeOnText('- > - a\n  >\n  > b\n  > - \n', { type: 'moveSubtreeDown' }, { caret: 6 })), '- > b\n  > - \n  >\n  > - a\n');
});

test('a line joined into a padded empty numbered item, a quote after it: the item\'s padding goes, as the writer writes it, so the quote is kept a block of its own (B390)', () => {
  assert.equal(appliedText(executeOnText('2.  \n x\n   > more\n', { type: 'deleteContentBackward' }, { caret: 5 })), '2. x\n> more\n');
  assert.equal(appliedText(executeOnText('1.  \nquote\n   > more\n', { type: 'deleteContentForward' }, { caret: 4 })), '1. quote\n> more\n');
});

test('Shift-Tab on the last item after a quote and a tab-led empty item\'s paragraph: a blank line raised, the paragraph out of the one above (B386)', () => {
  assert.equal(appliedText(executeOnText('- a\n  > q\n\t-\n\t  b\n- c\n', { type: 'outdent' }, { caret: 21 })), '- a\n  > q\n\t-\n\t  b\n\nc\n');
});

test('a quote written `>-`, no space after its `>`, its items edited: the quote written in normal form, `> -` (B56, B289, B349, B341; decided 2026-11-11)', () => {
  assert.equal(appliedText(executeOnText('>\n >- [x] x', { type: 'enter' }, { caret: 9 })), '> - [ ] \n> - [x] x');
  assert.equal(appliedText(executeOnText('> - a\n>- b', { type: 'moveSubtreeUp' }, { caret: 6 })), '> - b\n> - a');
  assert.equal(appliedText(executeOnText('> a\n>- b\n>- c\n', { type: 'moveSubtreeUp' }, { caret: 12 })), '> a\n> - c\n> - b\n');
  assert.equal(appliedText(executeOnText('>- x\n>\n>', { type: 'duplicateSubtree', nodes: [2] }, { config: { flavor: 'gfm', quotes: 'container' } })), '> - x\n> - x\n\n\n');
});

test('Enter on an empty padded child before a quote its parent holds: the child out of its list, the quote its (B355), at the column `- ` gives, not past the padding it had (B237; read as a quote atom too)', () => {
  assert.equal(appliedText(executeOnText("- sibling\n  -  \n  > - list in quote\n", { type: "enter" }, { caret: 15, config: { flavor: "gfm" }, placeholders: [15] })), "- sibling\n- \n  > - list in quote\n");
  assert.equal(appliedText(executeOnText("- sibling\n  -  \n  > quoted in item\n", { type: "enter" }, { caret: 15, config: { flavor: "gfm", quotes: "atom" }, placeholders: [15] })), "- sibling\n- \n  > quoted in item\n");
});

test('Shift-Tab under `indentUnit: tab` on a nested quote with spaces after the outer `>`: written in the item, a tab and a space (B356)', () => {
  assert.equal(appliedText(executeOnText("- > quoted in item\n  >    > over two lines\n", { type: "outdent" }, { caret: 24, config: { flavor: "obsidian", indentUnit: "tab" } })), "- > quoted in item\n\n\t > over two lines\n");
});

test('Backspace joining a lazy item into the item above: the tab-led quote after it at the narrower item\'s column (B364)', () => {
  assert.equal(appliedText(executeOnText("  ```js\n  ```\n- next\n - quoted in item\n\t  > over two lines\n", { type: "deleteContentBackward" }, { caret: 24, config: { flavor: "obsidian", indentUnit: "tab" } })), "  ```js\n  ```\n- nextquoted in item\n\t > over two lines\n");
});

test('a tab-led child moved down onto an item whose first block is a callout: on its marker line, its id kept (B392)', () => {
  assert.equal(appliedText(executeOnText("- item\n\t- [x] done\n- > [!note] Title\n", { type: "moveSubtreeDown" }, { caret: 14, config: { flavor: "obsidian" } })), "- item\n- - [x] done\n  > [!note] Title\n");
});

test('Backspace at the start of an item\'s quote whose next line is `>#`: the quote\'s new first line spelled with its space (B393)', () => {
  assert.equal(appliedText(executeOnText("- > a\n  >#\n", { type: "deleteContentBackward" }, { caret: 4 })), "- a\n  > #\n");
});

test('Alt-Down in an item\'s quote padded further on a later line than its next: the quote written anew in normal form (B396)', () => {
  assert.equal(appliedText(executeOnText("- > x\n\n   >\n  > ted in item\n", { type: "moveSubtreeDown" }, { caret: 6, config: { quotes: "container" } })), "- > ted in item\n\n  > x\n");
});

test('outdenting a lazy paragraph out of a quote, past a tab after its `>`, after an empty item: the tab\'s rest the quote\'s, no padding the item would take in (B70)', () => {
  const r = assertApplied(executeOnText('-\n>\tq\n d', { type: 'outdent', nodes: [3] }, { caret: 1, config: { quotes: 'container' } }));
  assert.equal(r.view.doc.text, '-\nq\n d');
});

test('moving an empty quote into the item after it, that item\'s text going on lazily: the item on its parent\'s marker line now, its lazy line past its content column, its text as it was (B39)', () => {
  const r = assertApplied(executeOnText('- >\n   - d\n    a', { type: 'moveSubtree', to: { parent: 3, after: null } }, { caret: 2, config: { quotes: 'container' } }));
  assert.equal(r.view.doc.text, '- - d\n      a\n    >');
});

test('under `indentUnit: tab`, items dropped first under an item whose quote shares its marker line: the first on that line, the next lined up with it in spaces, no tab past it (B15)', () => {
  const r = assertApplied(executeOnText('- >', { type: 'pasteAt', at: { parent: 1, after: null }, clipboard: { 'text/plain': '- a\n- b' } }, { config: { flavor: 'obsidian', quotes: 'container', indentUnit: 'tab' } }));
  assert.equal(r.view.doc.text, '- - a\n  - b\n  >');
});

test('an item whose text is a heading pasted over a paragraph after another, the note ending there: a heading, not a paragraph its `#` would make one (B301)', () => {
  const r = assertApplied(executeOnText('m\n\nx', { type: 'paste', clipboard: { 'text/plain': '- # title\n', 'text/markdown': '- # title\n' } }, { anchor: 3, head: 4 }));
  assert.equal(r.view.doc.text, 'm\n# title');
});

test('Enter on the blank line between an empty item\'s marker and its fence below it: the new blank line at the item\'s column, which keeps the item open, the fence its text still (B367)', () => {
  const r = assertApplied(executeOnText('-\n  \n  ```\n', { type: 'enter' }, { caret: 4, config: { flavor: 'commonmark' } }));
  assert.equal(r.view.doc.text, '-\n  \n  \n  ```\n');
});

test('cut the item above an item whose text is a fence, then Paste: back before it, at the fence\'s start (`pasteAtTextStart: before`), after it with `after` (B21)', () => {
  for (const [config, want] of [[{}, '- first\n- ```\n  code\n  ```\n'], [{ pasteAtTextStart: 'after' }, '- ```\n  code\n  ```\n- first\n']] as const) {
    const cut = assertApplied(executeOnText('- first\n- ```\n  code\n  ```\n', { type: 'cut' }, { caret: 3, config }));
    assert.equal(cut.view.doc.text, '- ```\n  code\n  ```\n');
    assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! })), want);
  }
});

test('an empty nested quote, its spaces before its `>` in the callout, moved onto its item\'s marker line: written without them, which would be the item\'s padding there', () => {
  const doc = parseWithMarks('- > [!note] Title\n  >   >\n', [], { flavor: 'obsidian' });
  const r = executeCommand(OurusView.of(doc, { selection: 25 }), { type: 'moveSubtree', nodes: [3], to: { parent: 1, after: null } });
  assert.ok(r instanceof OurusSuccess, JSON.stringify(r));
  assert.equal(r.view.doc.text, '- >\n\n  > [!note] Title\n');
});

test('a callout pasted on an empty item whose first child is a quote: a blank line between them, the two read apart (B361)', () => {
  const r = assertApplied(executeOnText('- \n  > [!note] U\n', { type: 'paste', clipboard: { 'text/plain': '> [!note] T\n', 'text/markdown': '> [!note] T\n' } }, { caret: 2, config: { flavor: 'obsidian' } }));
  assert.equal(r.view.doc.text, '- > [!note] T\n\n  > [!note] U\n');
});

test('cut a numbered item whose text is a callout, then Paste at the next one\'s title start: written, the callout back in that item (`pasteAtTextStart: before`)', () => {
  const cut = assertApplied(executeOnText('1. > [!note] T\n2. > [!note] U\n', { type: 'cut' }, { caret: 13, config: { flavor: 'obsidian' } }));
  assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: cut.clipboard! })), '1. > [!note] T\n\n   > [!note] U\n');
});

test('Backspace on an empty item holding a quote after a numbered item\'s quote, under `indentUnit: tab`: the quote, the numbered item\'s now, named at its `>` past the tab (B363)', () => {
  assert.equal(appliedText(executeOnText('2. > quote\n- \n   > more\n', { type: 'deleteContentBackward' }, { caret: 13, config: { flavor: 'commonmark', indentUnit: 'tab' } })), '2. > quote\n\n\t> more\n');
});

test('converted HTML: text that reads as a delimiter row stays text (B323), a `<` before an email\'s address stays (B332), a footnote reference counts as formatting (B338)', async () => {
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

test('HTML\'s plain text keeps a `pre` of spaces and the tabs of empty edge cells (B335), as a browser shows it (B270)', async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.plainText('<pre>   </pre>'), '   ');
  assert.equal(MdHtmlParser.plainText('<table><tr><td></td><td>b</td></tr></table>'), '\tb');
  assert.equal(MdHtmlParser.plainText('<table><tr><td>a</td><td></td></tr></table>'), 'a\t');
  assert.equal(MdHtmlParser.plainText('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>'), 'a\tb\nc\td');
  // (B270: blanks collapsed across inline elements, a code block's leading blank line kept, cells
  // holding paragraphs on one line)
  assert.equal(MdHtmlParser.plainText('<p>a <span> b</span> c</p>'), 'a b c');
  assert.equal(MdHtmlParser.plainText('<pre><code>\nabc\n\n</code></pre>'), '\nabc\n');
  assert.equal(MdHtmlParser.plainText('<pre>\nabc</pre>'), 'abc');
  assert.equal(MdHtmlParser.plainText('<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>'), 'a\tb');
});

test('code styled `white-space: pre` keeps its spaces in the code span (B336)', async () => {
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  assert.equal(convertPastedHtml('<p><code style="white-space:pre">a  b</code></p>').rendered, '<p><code>a  b</code></p>\n');
  assert.equal(convertPastedHtml('<p><code>a  b</code></p>').rendered, '<p><code>a b</code></p>\n');
});

test('converted HTML: hidden content isn\'t pasted, a link of blanks keeps the words apart (B271)', async () => {
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  assert.equal(convertPastedHtml('<p>a<span hidden>secret</span>b</p><p>c</p>').markdown, 'ab\n\nc');
  assert.equal(convertPastedHtml('<p>a<span style="color: red; display: none">secret</span>b</p>').markdown, 'ab');
  assert.equal(convertPastedHtml('<p>a<a href="u"> </a>b</p>').markdown, 'a b');
});

test('Word\'s paragraph lists: a jump in the numbers starts another list (B339); levels past Word\'s nine are the ninth\'s, no stack overflow (B340)', async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  const { convertPastedHtml } = await import('../lib/command-execution.ts');
  const p = (n: number) => `<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${n}.</span>x</p>`;
  assert.match(convertPastedHtml(p(1) + p(5)).rendered, /<ol start="5">/);
  assert.doesNotMatch(convertPastedHtml(p(1) + p(2)).rendered, /<ol start/);
  const html = Array.from({ length: 3000 }, (_, i) => `<p style="mso-list:l0 level${i + 1} lfo1"><span style="mso-list:Ignore">•</span>x</p>`).join('');
  assert.doesNotThrow(() => MdHtmlParser.parse(html));
});

test('expand selection from inside a block id, or right after it: a selection that holds the caret (B216)', () => {
  for (const caret of [9, 11]) {
    const { anchor, head } = assertApplied(executeOnText('- item ^id1\n', { type: 'expandSelection' }, { caret, config: { flavor: 'obsidian' } })).view.selection;
    assert.ok(anchor <= caret && caret <= head, `${anchor}–${head}`);
  }
});

test('Backspace after a backtick typed on a text\'s last line, `autoClose` listing it: the host\'s, no pair at the text\'s end (B246)', () => {
  for (const [text, caret] of [['- a\n`', 5], ['a\n`', 3]] as const) assert.ok(executeOnText(text, { type: 'deleteContentBackward' }, { caret, config: { autoClose: ['`'] } }) instanceof OurusDeferred);
});

test('a soft-line deletion that would make a quote\'s first paragraph a callout\'s title, a nested quote below it: refused, as on one line (B279)', () => {
  const r = executeOnText('>([!e]\n>>', { type: 'deleteSoftLineBackward' }, { caret: 2, config: { flavor: 'obsidian' } });
  assert.ok(r instanceof OurusRejected && r.reason === 'not-expressible', JSON.stringify(r));
});

test('Shift-Tab on the first item of a padded quote: out before the quote, each named where it is written (B408)', () => {
  assert.equal(appliedText(executeOnText('  > - sibling\n  > - list in quote\n', { type: 'outdent' }, { caret: 13, config: { flavor: 'commonmark' } })), '- sibling\n> - list in quote\n');
});

test('a paragraph with a list-like lazy line, after a leading blank line, dropped into a quote: written (B182)', () => {
  const r = executeOnText('\nalpha\n    - bravo\n> - charlie', { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: 3 } }, { config: { flavor: 'obsidian' } });
  assert.ok(r instanceof OurusSuccess, JSON.stringify(r));
});
