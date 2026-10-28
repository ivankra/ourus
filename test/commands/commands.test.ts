import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, nearestDropPoint, type Command, type DropPoint, type DropSeam } from '../../src/commands/index.ts';
import { Config } from '../../src/config.ts';
import { OurusDoc } from '../../src/doc/index.ts';
import { docOf, nodesOf, plainText } from '../drawing.ts';
import { applyChanges } from '../../src/text/index.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** The broad test's seed: it plays the same runs each time; `OURUS_FUZZ_SEED` plays others. */
const SEED = Number(process.env.OURUS_FUZZ_SEED ?? 1);

/** The flavor a document is read in: commands behave alike in all, but read tasks and callouts apart. */
const arbFlavor = fc.constantFrom(...Config.values.flavor);

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

const COMMANDS: Command['type'][] = ['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward'];

/** Commands that act at a caret; the others take a selection. */
const CARET_COMMANDS = new Set<Command['type']>(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward']);

test('commands keep text, changes and selection consistent', () => {
  const failing: string[] = [];
  fc.assert(
    fc.property(fc.oneof(arbOutlineDoc, arbTidyOutline), arbFlavor, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, flavor, a, b, type) => {
      const doc = OurusDoc.parse(text, { config: { flavor } });
      const anchor = a % (text.length + 1);
      const head = CARET_COMMANDS.has(type) ? anchor : b % (text.length + 1);
      const r = executeCommand(doc, { type } as Command, { anchor, head });
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
  const run = (text: string, type: Command['type'], pos: number, config = {}) => {
    const doc = OurusDoc.parse(text, { config });
    const r = executeCommand(doc, { type } as Command, { anchor: pos, head: pos });
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
  const commands: Command[] = [
    ...(['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'deleteSubtree', 'duplicateSubtree', ...CARET_COMMANDS] as const).map((type) => ({ type }) as Command),
    ...clipboards.flatMap((text) => [{ type: 'paste', clipboard: { 'text/plain': text } } as const, { type: 'pastePlain', text } as const]),
  ];
  const problems: string[] = [];
  for (const flavor of Config.values.flavor) {
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

// moveSubtreeTo by the API (spec/drag.md): the places a drawing can't name, and `nodes` on the
// structural commands, acting on nodes the caret isn't in
test('a drop checks its ids and its place', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n\npara\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 0, head: 0 };
  const drop = (nodes: number[], parent: number | 'root', after: number | null) => executeCommand(doc, { type: 'moveSubtreeTo', nodes, to: { parent, after } }, caret);
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
  const r = executeCommand(flat, { type: 'moveSubtreeTo', nodes: [flatId('a')], to: { parent: flatId('para'), after: null } }, caret);
  assert.equal(reason(r), 'not-expressible');
});

test('a drop at its own place changes nothing, and one elsewhere says what it placed', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const own = executeCommand(doc, { type: 'moveSubtreeTo', nodes: [id('b')], to: { parent: 'root', after: id('a') } }, caret);
  assert.ok(own.status === 'applied' && own.changes.length === 0 && own.doc === doc);
  const r = executeCommand(doc, { type: 'moveSubtreeTo', nodes: [id('b')], to: { parent: id('d'), after: null } }, caret);
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
  const edited = doc.update([{ from: 3, to: 3, insert: 'x' }]);
  const r = executeCommand(edited, { type: 'moveSubtreeTo', nodes: [c], to: { parent: 'root', after: null } }, { anchor: 0, head: 0 });
  assert.ok(r.status === 'applied');
  assert.equal(r.status === 'applied' && r.doc.text, '- c\n- ax\n- b\n');
  assert.equal(r.status === 'applied' && r.doc.node(b)?.prev?.id, id('a'));
});

test('a structural command given nodes acts on them, the caret elsewhere staying in its text', () => {
  const doc = OurusDoc.parse('- a\n- b\n- c\n- d\n');
  const id = (text: string): number => nodesOf(doc).find((n) => plainText(doc, n) === text)!.id;
  const caret = { anchor: 2, head: 2 };
  const run = (command: Command) => {
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
  for (const seam of r.dropMap.seams) for (const point of seam.points) assert.deepEqual(point.drop, { type: 'moveSubtreeTo', nodes: [id('b')], to: { parent: point.parent, after: point.after } });
  const stale = executeCommand(doc, { type: 'drag', pressed: 999 }, { anchor: 2, head: 2 });
  assert.equal(stale.status === 'rejected' && stale.reason, 'no-such-node');
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
  const edited = doc.update([{ from: doc.text.indexOf('- d'), to: doc.text.indexOf('- d'), insert: '  - new\n' }]);
  const refused = executeCommand(edited, { type: 'deleteSubtree', nodes: [id('b')], expectMarkdown }, caret);
  assert.equal(refused.status === 'rejected' && refused.reason, 'content-changed');
});

test("a text drag's deletion is a cut's, and the host's where ourus doesn't do it", () => {
  const doc = OurusDoc.parse('```\nx\n```\n');
  const r = executeCommand(doc, { type: 'deleteByDrag' }, { anchor: 4, head: 5 });
  assert.equal(r.status, 'deferredToHost');
});
