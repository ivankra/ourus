import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, type Command } from '../../src/commands/index.ts';
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
  assert.equal(typed('- a\n', 3, 'b`c'), 'notApplicable');
  assert.equal(typed('x\n', 1, 'ab'), 'notApplicable');
});
