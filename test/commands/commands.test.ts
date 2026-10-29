import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, nearestDropPoint, type OurusCommand, type DropPoint, type DropSeam } from '../../src/commands/index.ts';
import { OurusConfig } from '../../src/config.ts';
import { OurusDoc } from '../../src/doc/index.ts';
import { docOf, nodesOf, plainText } from '../drawing.ts';
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
      const r = executeCommand(doc, { type } as OurusCommand, { anchor, head });
      if (r.status === 'rejected' && r.reason === 'write-failed') failing.push(JSON.stringify([type, flavor, text, anchor, head]));
      if (r.status !== 'applied') return;
      assert.equal(applyChanges(text, r.changes), r.doc.text);
      for (const p of [r.selection.anchor, r.selection.head]) assert.ok(p >= 0 && p <= r.doc.text.length);
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
      const r1 = executeCommand(doc, { type: 'indent' }, { anchor: pos, head: pos });
      if (r1.status !== 'applied') return;
      const r2 = executeCommand(r1.doc, { type: 'outdent' }, r1.selection);
      assert.equal(r2.status, 'applied');
      if (r2.status !== 'applied') return;
      // the outline comes back; the text may differ in renumbering or bullet adoption
      const shape = (d: OurusDoc) => nodesOf(d).map((n) => `${n.depth}:${n.kind}:${plainText(d, n).replace(/\n/g, '|')}`).join('\n');
      assert.equal(shape(r2.doc), shape(doc));
    }),
    { numRuns: RUNS },
  );
});

test('ids follow nodes through structural commands', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const idOf = (d: OurusDoc, text: string) => nodesOf(d).find((n) => plainText(d, n).split('\n')[0] === text)!.id;
  const before = ['a', 'b', 'c', 'd'].map((t) => idOf(doc, t));
  const pos = doc.text.indexOf('b');
  const r = executeCommand(doc, { type: 'moveSubtreeDown' }, { anchor: pos, head: pos });
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- a\n- d\n- b\n  - c\n');
  assert.deepEqual(['a', 'b', 'c', 'd'].map((t) => idOf(r.doc, t)), before);
});

test('ids stay with nodes that a command indents or opens a line above', () => {
  const ids = (d: OurusDoc) => nodesOf(d).map((n) => `${n.id}:${plainText(d, n).replace(/\n/g, '')}`);
  const run = (text: string, type: OurusCommand['type'], pos: number, config = {}) => {
    const doc = OurusDoc.parse(text, { config });
    const r = executeCommand(doc, { type } as OurusCommand, { anchor: pos, head: pos });
    assert.equal(r.status, 'applied');
    return r.status === 'applied' ? [ids(doc), ids(r.doc)] : [];
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
      const doc = docOf(text, placeholders, { flavor });
      for (let pos = 0; pos <= text.length; pos++) {
        for (const command of commands) {
          const what = `${flavor}, ${name}, at ${pos}: ${JSON.stringify(command)}`;
          try {
            const r = executeCommand(doc, command, { anchor: pos, head: pos });
            if (r.status === 'rejected' && r.reason === 'write-failed') problems.push(`${what}: ${r.detail}`);
            if (r.status === 'applied') assert.equal(applyChanges(text, r.changes), r.doc.text, what);
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
  assert.equal(executeCommand(empty, { type: 'indent' }, { anchor: 0, head: 0 }).status, 'rejected');
  const pasted = executeCommand(empty, { type: 'paste', clipboard: { 'text/plain': '- x\n' } }, { anchor: 0, head: 0 });
  assert.deepEqual(pasted.status === 'applied' && [pasted.doc.text, pasted.selection.head], ['- x\n', 3]);
});

// The document's true end, after its last line ending, is on no line, which the spec's buffers can't
// draw: a structural command from there acts on the last node, and the caret goes into its text
// (spec: MoveUp39, from a trailing blank line).
test('a structural command from the document end leaves the caret in the node it moved', () => {
  const doc = OurusDoc.parse('- one\n- two\n');
  const end = doc.text.length;
  for (const [type, text] of [['moveSubtreeUp', '- two\n- one\n'], ['indent', '- one\n  - two\n']] as const) {
    const r = executeCommand(doc, { type }, { anchor: end, head: end });
    assert.equal(r.status, 'applied', type);
    if (r.status !== 'applied') continue;
    assert.equal(r.doc.text, text, type);
    const node = r.doc.nodeAtLine(r.doc.lineAt(r.selection.head).index);
    assert.equal(node && plainText(r.doc, node).split('\n')[0], 'two', `${type}: the caret in "two"`);
    // so the next press acts on it again
    if (type === 'moveSubtreeUp') assert.equal(executeCommand(r.doc, { type: 'moveSubtreeDown' }, r.selection).status, 'applied');
  }
});

// Enter at the end of a text without a final line ending holds an empty line that is the text's last,
// unterminated, which the spec's buffers can't draw: a paste there fills it (it failed to write).
test('a paste on the empty line Enter holds at the text end fills it', () => {
  const entered = executeCommand(OurusDoc.parse('# h1'), { type: 'enter' }, { anchor: 4, head: 4 });
  assert.equal(entered.status, 'applied');
  if (entered.status !== 'applied') return;
  assert.equal(entered.doc.text, '# h1\n');
  for (const [clipboard, text] of [['- a\n  - b', '# h1\n- a\n  - b\n'], ['> q', '# h1\n> q\n'], ['# h2\ntext', '# h1\n# h2\ntext\n']] as const) {
    const r = executeCommand(entered.doc, { type: 'paste', clipboard: { 'text/plain': clipboard } }, entered.selection);
    assert.equal(r.status === 'applied' ? r.doc.text : `${r.status} ${r.status === 'rejected' ? r.reason : ''}`, text, clipboard);
  }
  // Shift-Enter's the same: the blank line it makes the paste fills, the nodes after the paragraph (Paste26)
  const broken = executeCommand(OurusDoc.parse('p'), { type: 'shiftEnter' }, { anchor: 1, head: 1 });
  assert.equal(broken.status, 'applied');
  if (broken.status !== 'applied') return;
  const pasted = executeCommand(broken.doc, { type: 'paste', clipboard: { 'text/plain': '- a\n- b' } }, broken.selection);
  assert.equal(pasted.status === 'applied' ? pasted.doc.text : pasted.status, 'p\n- a\n- b\n');
});

test('several characters typed at once are played a character at a time, as keys type them', () => {
  const typed = (text: string, at: number, insert: string) => {
    const doc = OurusDoc.parse(text);
    const result = executeCommand(doc, { type: 'insertText', text: insert }, { anchor: at, head: at });
    if (result.status !== 'applied') return result.status;
    assert.equal(applyChanges(text, result.changes), result.doc.text);
    return { text: result.doc.text, caret: result.selection.head };
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
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 0, head: 0 };
  const drop = (nodes: number[], parent: number | 'root', after: number | null) => executeCommand(doc, { type: 'moveSubtree', nodes, to: { parent, after } }, caret);
  const reason = (r: ReturnType<typeof drop>) => (r.status === 'rejected' ? r.reason : r.status);
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
  const flatId = (text: string): number => nodesOf(flat).find((n) => plainText(flat, n) === text)!.id;
  const r = executeCommand(flat, { type: 'moveSubtree', nodes: [flatId('a')], to: { parent: flatId('para'), after: null } }, caret);
  assert.equal(reason(r), 'not-expressible');
});

test('a drop at its own place changes nothing, and one elsewhere says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const own = executeCommand(doc, { type: 'moveSubtree', nodes: [id('b')], to: { parent: 'root', after: id('a') } }, caret);
  assert.ok(own.status === 'applied' && own.changes.length === 0 && own.doc === doc);
  const r = executeCommand(doc, { type: 'moveSubtree', nodes: [id('b')], to: { parent: id('d'), after: null } }, caret);
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- a\n- d\n  - b\n    - c\n');
  assert.deepEqual(r.placed, [id('b')]);
  // the caret in `a`, which didn't move, stays there
  assert.equal(r.selection.head, 2);
});

test('a place named by ids survives an edit elsewhere', () => {
  const doc = OurusDoc.parse('- a\n- b\n- c\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const [b, c] = [id('b'), id('c')];
  const edited = doc.update({ changes: [{ from: 3, to: 3, insert: 'x' }] });
  const r = executeCommand(edited, { type: 'moveSubtree', nodes: [c], to: { parent: 'root', after: null } }, { anchor: 0, head: 0 });
  assert.ok(r.status === 'applied');
  assert.equal(r.status === 'applied' && r.doc.text, '- c\n- ax\n- b\n');
  assert.equal(r.status === 'applied' && r.doc.node(b)?.prev?.id, id('a'));
});

test('a structural command given nodes acts on them, the caret elsewhere staying in its text', () => {
  const doc = OurusDoc.parse('- a\n- b\n- c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const run = (command: OurusCommand) => {
    const r = executeCommand(doc, command, caret);
    assert.equal(r.status, 'applied', command.type);
    return r.status === 'applied' ? r : null!;
  };
  const indented = run({ type: 'indent', nodes: [id('c')] });
  assert.equal(indented.doc.text, '- a\n- b\n  - c\n- d\n');
  assert.equal(indented.selection.head, 2);
  const deleted = run({ type: 'deleteSubtree', nodes: [id('c'), id('d')] });
  assert.equal(deleted.doc.text, '- a\n- b\n');
  assert.equal(deleted.selection.head, 2);
  const duplicated = run({ type: 'duplicateSubtree', nodes: [id('d')] });
  assert.equal(duplicated.doc.text, '- a\n- b\n- c\n- d\n- d\n');
  assert.equal(duplicated.selection.head, 2);
  const moved = run({ type: 'moveSubtreeUp', nodes: [id('d')] });
  assert.equal(moved.doc.text, '- a\n- b\n- d\n- c\n');
  const copied = run({ type: 'copy', nodes: [id('b'), id('c')] });
  assert.equal(copied.clipboard?.['text/plain'], '- b\n- c\n');
  const refused = executeCommand(doc, { type: 'indent', nodes: [id('b'), id('d')] }, caret);
  assert.equal(refused.status === 'rejected' && refused.reason, 'non-contiguous');
});

test('a pickup takes the pressed node, its lines and its clipboard, and changes nothing', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const r = executeCommand(doc, { type: 'drag', pressed: id('b') }, { anchor: 2, head: 2 });
  assert.ok(r.status === 'applied' && r.dropMap);
  if (r.status !== 'applied' || !r.dropMap) return;
  assert.equal(r.changes.length, 0);
  assert.deepEqual(r.dropMap.nodes, [id('b')]);
  assert.deepEqual(r.dropMap.lines, [[1, 3]]);
  assert.equal(r.clipboard?.['text/plain'], '- b\n  - c\n');
  // every point's drop is ready to run, and names the run
  for (const seam of r.dropMap.seams) for (const point of seam.points) assert.deepEqual(point.drop, { type: 'moveSubtree', nodes: [id('b')], to: { parent: point.parent, after: point.after } });
  const stale = executeCommand(doc, { type: 'drag', pressed: 999 }, { anchor: 2, head: 2 });
  assert.equal(stale.status === 'rejected' && stale.reason, 'no-such-node');
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
    const r = executeCommand(doc, command, { anchor: 0, head: 0 });
    assert.ok(r.status === 'applied' && r.dropMap, text);
    if (r.status !== 'applied' || !r.dropMap) continue;
    for (const seam of r.dropMap.seams) {
      for (const point of seam.points) {
        const dropped = executeCommand(doc, point.drop, { anchor: 0, head: 0 });
        assert.equal(dropped.status, 'applied', `${JSON.stringify(text)} at ${point.parent}, ${point.after}: ${dropped.status === 'rejected' ? dropped.detail : ''}`);
      }
    }
  }
  // and a drop there still refuses
  const doc = OurusDoc.parse('## b\n## c\n- d');
  const r = executeCommand(doc, { type: 'moveSubtree', nodes: [1], to: { parent: 3, after: null } }, { anchor: 0, head: 0 });
  assert.equal(r.status === 'rejected' && r.reason, 'not-expressible');
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
  const r = executeCommand(doc, { type: 'drag', clipboard }, { anchor: 2, head: 2 });
  assert.ok(r.status === 'applied' && r.dropMap);
  if (r.status !== 'applied' || !r.dropMap) return;
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
  const empty = executeCommand(doc, { type: 'drag', clipboard: { 'text/plain': '' } }, { anchor: 2, head: 2 });
  assert.equal(empty.status === 'rejected' && empty.reason, 'not-expressible');
});

test('a drop from outside checks its place, and says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const paste = (parent: number | 'root', after: number | null) => executeCommand(doc, { type: 'pasteAt', at: { parent, after }, clipboard: { 'text/plain': '- x\n- y\n' } }, { anchor: 2, head: 2 });
  const reason = (r: ReturnType<typeof paste>) => (r.status === 'rejected' ? r.reason : r.status);
  assert.equal(reason(paste(999, null)), 'no-such-node');
  assert.equal(reason(paste(id('a'), id('b'))), 'invalid-insertion-point');
  const r = paste(id('b'), null);
  assert.ok(r.status === 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- a\n- b\n  - x\n  - y\n');
  assert.deepEqual(r.placed!.map((n) => plainText(r.doc, r.doc.node(n)!)), ['x', 'y']);
  assert.equal(r.selection.head, 2);
});

test('the source of a drag out deletes its nodes only while they are what was dragged out', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const picked = executeCommand(doc, { type: 'drag', pressed: id('b') }, caret);
  assert.ok(picked.status === 'applied' && picked.clipboard);
  if (picked.status !== 'applied') return;
  const expectMarkdown = picked.clipboard!['text/plain']!;
  const removed = executeCommand(doc, { type: 'deleteSubtree', nodes: [id('b')], expectMarkdown }, caret);
  assert.equal(removed.status === 'applied' && removed.doc.text, '- a\n- d\n');
  // a child added to the run during the drag: it wasn't carried, so the run stays
  const edited = doc.update({ changes: [{ from: doc.text.indexOf('- d'), to: doc.text.indexOf('- d'), insert: '  - new\n' }] });
  const refused = executeCommand(edited, { type: 'deleteSubtree', nodes: [id('b')], expectMarkdown }, caret);
  assert.equal(refused.status === 'rejected' && refused.reason, 'content-changed');
});

test("a text drag's deletion is a cut's, and the host's where ourus doesn't do it", () => {
  const doc = OurusDoc.parse('```\nx\n```\n');
  const r = executeCommand(doc, { type: 'deleteByDrag' }, { anchor: 4, head: 5 });
  assert.equal(r.status, 'deferredToHost');
});

test('the empty paragraph Enter makes after a title at a text\'s end, with no line ending, goes again', () => {
  // (it spans no characters, past the final line ending: its placeholder goes with it, or moves)
  for (const start of ['# x', 'x\n===']) {
    const entered = executeCommand(OurusDoc.parse(start), { type: 'enter' }, { anchor: start.length, head: start.length });
    assert.equal(entered.status, 'applied');
    if (entered.status !== 'applied') continue;
    for (const type of ['deleteContentBackward', 'deleteSoftLineBackward', 'cut', 'moveSubtreeUp'] as const) {
      const r = executeCommand(entered.doc, { type }, entered.selection);
      assert.equal(r.status, 'applied', `${type} after Enter in ${JSON.stringify(start)}: ${r.status === 'rejected' ? r.detail : ''}`);
    }
    const back = executeCommand(entered.doc, { type: 'deleteContentBackward' }, entered.selection);
    if (back.status === 'applied') assert.equal(back.doc.rootNode.child(0).children.length, 0);
  }
});

test('Enter at the end of an unclosed fence at a text\'s end, with no line ending, makes an empty code line', () => {
  const r = executeCommand(OurusDoc.parse('```\ncode'), { type: 'enter' }, { anchor: 8, head: 8 });
  assert.equal(r.status, 'applied');
  if (r.status === 'applied') assert.deepEqual([r.doc.text, r.selection.head], ['```\ncode\n\n', 9]);
});

test('a text whose lines end with a lone CR is edited as with LF', () => {
  for (const [type, text] of [['duplicateSubtree', '- a\r- a\r- b'], ['enter', '- a\r- \r- b']] as const) {
    const r = executeCommand(OurusDoc.parse('- a\r- b'), { type }, { anchor: 3, head: 3 });
    assert.equal(r.status === 'applied' && r.doc.text, text, type);
  }
});

test('a duplicate of a node whose blank line ends the text, with no line ending, keeps the copy\'s', () => {
  const r = executeCommand(OurusDoc.parse('> a\n>'), { type: 'duplicateSubtree' }, { anchor: 2, head: 2 });
  assert.equal(r.status === 'applied' && r.doc.text, '> a\n\n> a\n\n');
});

test('a paste of a hundred thousand lines and more applies, as plain text and as Markdown', () => {
  const lines = 'x\n'.repeat(150000);
  for (const command of [{ type: 'paste', clipboard: { 'text/plain': lines } }, { type: 'pastePlain', text: lines }] as const) {
    assert.equal(executeCommand(OurusDoc.parse('- a\n'), command, { anchor: 3, head: 3 }).status, 'applied', command.type);
  }
});

test('HTML whose text holds the characters a code span is held by in conversion keeps them', async () => {
  const { MdHtmlParser } = await import('../../src/index.ts');
  assert.equal(MdHtmlParser.parse('<p>a0b</p>').markdown, 'a0b');
  assert.equal(MdHtmlParser.parse('<p><code>x</code> 0</p>').markdown, '`x` 0');
});

test('text typed at once with a line break in quoted code keeps the quote, its fences grown past a typed one', () => {
  const r = executeCommand(OurusDoc.parse('> ```\n> PAYLOAD\n> ```\n> AFTER'), { type: 'insertText', text: '`\nX' }, { anchor: 5, head: 5 });
  assert.equal(r.status === 'applied' && r.doc.text, '> ````\n> X\n> PAYLOAD\n> ````\n> AFTER');
});

test('delete subtree given a node, the caret on its blank line, takes the caret with it', () => {
  const r = executeCommand(OurusDoc.parse('a\n '), { type: 'deleteSubtree', nodes: [1] }, { anchor: 3, head: 3 });
  assert.deepEqual(r.status === 'applied' && [r.doc.text, r.selection.head], ['', 0]);
});

test('delete subtree given a node and its child takes the node, the child with it', () => {
  const r = executeCommand(OurusDoc.parse('- a\n  - b\n  - c\n- d\n'), { type: 'deleteSubtree', nodes: [1, 2] }, { anchor: 0, head: 0 });
  assert.deepEqual(r.status === 'applied' && [r.doc.text, r.selection.head], ['- d\n', 2]);
});

test('outdent given a quote\'s paragraph, an item\'s text then, keeps a caret elsewhere where it is', () => {
  const doc = OurusDoc.parse('- z\n- > q\n- w\n', { config: { quotes: 'container' } });
  const r = executeCommand(doc, { type: 'outdent', nodes: [4] }, { anchor: 12, head: 12 });
  assert.deepEqual(r.status === 'applied' && [r.doc.text, r.selection.head], ['- z\n- q\n- w\n', 10]);
  const code = executeCommand(OurusDoc.parse('    - bravo\n- > bravo', { config: { quotes: 'container' } }), { type: 'outdent', nodes: [4] }, { anchor: 9, head: 9 });
  assert.deepEqual(code.status === 'applied' && [code.doc.text, code.selection.head], ['    - bravo\n- bravo', 9]);
});

test('a selection whose ends aren\'t positions in the text is refused, whatever the command', () => {
  const doc = OurusDoc.parse('- a\n  - b\n');
  for (const selection of [{ anchor: -1, head: -1 }, { anchor: 11, head: 11 }, { anchor: 0, head: NaN }, { anchor: 1.5, head: 2 }, { anchor: Infinity, head: Infinity }]) {
    for (const type of ['indent', 'cut', 'copy', 'fold', 'enter'] as const) {
      const r = executeCommand(doc, { type }, selection);
      assert.equal(r.status === 'rejected' && r.reason, 'invalid-selection', `${type} at ${JSON.stringify(selection)}`);
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
    const r = executeCommand(OurusDoc.parse(text, { config: config ?? {} }), command, { anchor, head });
    assert.equal(r.status === 'applied' ? r.doc.text : `${r.status} ${'detail' in r ? r.detail : ''}`, want, JSON.stringify(text));
  }
});

test('a list pasted after an unclosed fence that would own it is refused: it would be a line of the code', () => {
  const r = executeCommand(OurusDoc.parse('```', { config: { listParent: 'block' } }), { type: 'paste', clipboard: { 'text/plain': '- x\n- y' } }, { anchor: 3, head: 3 });
  assert.equal(r.status === 'rejected' && r.reason, 'not-expressible');
});

test('an empty line written after a lone CR, an old LF line after it, keeps three line breaks', () => {
  const r = executeCommand(OurusDoc.parse('a\r\rc\n\nc\n', { config: { flavor: 'obsidian' } }), { type: 'deleteSoftLineBackward' }, { anchor: 4, head: 4 });
  assert.equal(r.status === 'applied' && r.doc.text, 'a\r\r\r\n\nc\n');
  const code = executeCommand(OurusDoc.parse('- ```\n\n\n```b\n```'), { type: 'deleteContentForward' }, { anchor: 10, head: 10 });
  assert.equal(code.status === 'applied' && code.doc.text, '- ```\n\n\n');
});

test('indented code moved into a quote with no space after its `>` keeps its four columns past the space the `>` takes', () => {
  const r = executeCommand(OurusDoc.parse('    x\n>', { config: { flavor: 'obsidian' } }), { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } }, { anchor: 0, head: 0 });
  assert.equal(r.status === 'applied' && r.doc.text, '>\n>     x');
});

test('a footnote definition dropped first under an empty item is refused, as code there is: it would be read as the item\'s text', () => {
  const r = executeCommand(OurusDoc.parse('0.'), { type: 'pasteAt', clipboard: { 'text/plain': '[^b]: x' }, at: { parent: 1, after: null } }, { anchor: 2, head: 2 });
  assert.equal(r.status === 'rejected' && r.reason, 'not-expressible');
});

test('a heading pasted into an item of a tab-indented text under `indentUnit: 2`: where its item would take in the paragraph after it, refused', () => {
  const r = executeCommand(OurusDoc.parse('-\n\ta\n\n\te', { config: { indentUnit: 2 } }), { type: 'paste', clipboard: { 'text/plain': '# X\n' } }, { anchor: 4, head: 4 });
  assert.equal(r.status === 'rejected' && r.reason, 'not-expressible');
  const tabs = executeCommand(OurusDoc.parse('-\n\ta\n\n\te'), { type: 'paste', clipboard: { 'text/plain': '# X\n' } }, { anchor: 4, head: 4 });
  assert.equal(tabs.status, 'applied');
});

test('a paragraph `[!e]` moved into an empty quote, its first line, would read as its callout title: refused', () => {
  const r = executeCommand(OurusDoc.parse('>\n[!e]\n'), { type: 'indent' }, { anchor: 6, head: 6 });
  assert.equal(r.status === 'rejected' && r.reason, 'not-expressible');
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
    const r = executeCommand(OurusDoc.parse(text, { config: config ?? {} }), command, { anchor, head });
    assert.equal(r.status, 'applied', `${JSON.stringify(text)}: ${'detail' in r ? r.detail : ''}`);
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
    const r = executeCommand(OurusDoc.parse(text, { config: config ?? {} }), command, { anchor, head });
    assert.equal(r.status === 'applied' ? r.doc.text : `${r.status} ${'detail' in r ? r.detail : ''}`, want, JSON.stringify(text));
  }
});

test('a write in a long list or quote takes time in proportion to its length, not to its square', () => {
  // (the fastest of three, from 2,000 lines to 8,000: four times as long where it is linear, sixteen
  // where it is quadratic; Enter mid a list, and mid a quote's text, where it breaks it in two)
  for (const line of ['- item', '> line']) {
    const ratio = time(line, 8000) / time(line, 2000);
    assert.ok(ratio < 9, `${line}: 8,000 lines take ${ratio.toFixed(1)} times as long as 2,000`);
  }
  function time(line: string, n: number): number {
    const text = Array.from({ length: n }, (_, i) => `${line} ${i}`).join('\n');
    const doc = OurusDoc.parse(text);
    const at = text.indexOf(`${line} ${n / 2}`) + `${line} ${n / 2}`.length;
    let best = Infinity;
    for (let k = 0; k < 3; k++) {
      const start = performance.now();
      const r = executeCommand(doc, { type: 'enter' }, { anchor: at, head: at });
      best = Math.min(best, performance.now() - start);
      assert.equal(r.status, 'applied');
    }
    return best;
  }
});
