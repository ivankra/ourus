import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { execute, type Command } from '../src/commands.ts';
import { OutlineDoc } from '../src/doc.ts';
import { applyChanges } from '../src/text.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** Outline-shaped documents: headings, paragraphs and nested lists in tidy and untidy styles. */
const arbOutlineDoc = fc
  .array(
    fc.oneof(
      { weight: 6, arbitrary: fc.tuple(fc.integer({ min: 0, max: 3 }), fc.constantFrom('- ', '* ', '1. ', '2) ', '- [ ] '), fc.constantFrom('a', 'b c', 'x', 'long text')) },
      { weight: 1, arbitrary: fc.constantFrom('', '# H', '## H2', 'para', '```', 'code', '  cont') },
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

const COMMANDS: Command['type'][] = ['indent', 'outdent', 'moveBlockUp', 'moveBlockDown', 'enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward'];

/** Commands that act at a caret; the others take a selection. */
const CARET_COMMANDS = new Set<Command['type']>(['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward']);

test('commands keep text, changes and selection consistent', () => {
  const tally = new Map<string, number>();
  fc.assert(
    fc.property(arbOutlineDoc, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, a, b, type) => {
      const doc = OutlineDoc.parse(text);
      const anchor = a % (text.length + 1);
      const head = CARET_COMMANDS.has(type) ? anchor : b % (text.length + 1);
      const r = execute(doc, { type } as Command, { anchor, head });
      const key = `${type} ${r.status}${r.status === 'rejected' ? ' ' + r.reason : ''}`;
      tally.set(key, (tally.get(key) ?? 0) + 1);
      if (r.status !== 'applied') return;
      assert.equal(applyChanges(text, r.changes), r.doc.text);
      for (const p of [r.selection.anchor, r.selection.head]) assert.ok(p >= 0 && p <= r.doc.text.length);
    }),
    { numRuns: RUNS },
  );
  const failed = [...tally].filter(([k]) => k.includes('encoding-failed'));
  if (process.env.OURUS_TALLY) console.log([...tally].sort().map(([k, v]) => `${k}: ${v}`).join('\n'));
  // verification exists to catch planner mistakes; on these documents they should be rare
  const total = [...tally.values()].reduce((x, y) => x + y, 0);
  const failures = failed.reduce((x, [, v]) => x + v, 0);
  assert.ok(failures / total < 0.05, `encoding-failed ${failures}/${total}: ${failed.map(([k, v]) => `${k}: ${v}`).join(', ')}`);
});

test('outdent undoes indent of a list item in a tidy outline', () => {
  fc.assert(
    fc.property(arbTidyOutline, fc.nat(), (text, a) => {
      const doc = OutlineDoc.parse(text);
      const pos = a % (text.length + 1);
      const r1 = execute(doc, { type: 'indent' }, { anchor: pos, head: pos });
      if (r1.status !== 'applied') return;
      const r2 = execute(r1.doc, { type: 'outdent' }, r1.selection);
      assert.equal(r2.status, 'applied');
      if (r2.status !== 'applied') return;
      // the outline comes back; the text may differ in renumbering or bullet adoption
      const shape = (d: OutlineDoc) => d.nodes.map((n) => `${n.depth}:${n.kind}:${d.headLines(n).map((l) => l.trim()).join('|')}`).join('\n');
      assert.equal(shape(r2.doc), shape(doc));
    }),
    { numRuns: RUNS },
  );
});

test('on tidy outlines every command plans correctly (verification never has to step in)', () => {
  fc.assert(
    fc.property(arbTidyOutline, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, a, b, type) => {
      const anchor = a % (text.length + 1);
      const head = CARET_COMMANDS.has(type) ? anchor : b % (text.length + 1);
      const r = execute(OutlineDoc.parse(text), { type } as Command, { anchor, head });
      if (r.status === 'rejected') assert.notEqual(r.reason, 'encoding-failed', r.detail ?? '');
    }),
    { numRuns: RUNS },
  );
});

test('ids follow nodes through structural commands', () => {
  const doc = OutlineDoc.parse('- a\n- b\n  - c\n- d\n');
  const idOf = (d: OutlineDoc, text: string) => d.nodes.find((n) => d.headLines(n)[0] === text)!.id;
  const before = ['a', 'b', 'c', 'd'].map((t) => idOf(doc, t));
  const pos = doc.text.indexOf('b');
  const r = execute(doc, { type: 'moveBlockDown' }, { anchor: pos, head: pos });
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- a\n- d\n- b\n  - c\n');
  assert.deepEqual(['a', 'b', 'c', 'd'].map((t) => idOf(r.doc, t)), before);
});

test('ids stay with nodes that a command indents or opens a line above', () => {
  const ids = (d: OutlineDoc) => d.nodes.slice(1).map((n) => `${n.id}:${d.headLines(n).join('').trim()}`);
  const run = (text: string, type: Command['type'], pos: number) => {
    const doc = OutlineDoc.parse(text);
    const r = execute(doc, { type } as Command, { anchor: pos, head: pos });
    assert.equal(r.status, 'applied');
    return r.status === 'applied' ? [ids(doc), ids(r.doc)] : [];
  };
  const [a, b] = run('- a\n- b\n  - c\n', 'indent', 7);
  assert.deepEqual(b, a);
  const [c, d] = run('# H\n\npara\n', 'enter', 5);
  assert.deepEqual(d, c);
});

test('typing at the start of a node keeps its id', () => {
  const doc = OutlineDoc.parse('para\n\n- item\n');
  const typed = doc.apply([{ from: 0, to: 0, insert: 'x' }]).apply([{ from: 7, to: 7, insert: ' ' }]);
  assert.deepEqual(typed.nodes.map((n) => n.id), doc.nodes.map((n) => n.id));
});

test('replacing the text keeps the ids of nodes outside the lines that differ', () => {
  const doc = OutlineDoc.parse('# A\n\n- x\n- z\n');
  const next = doc.replace('# A\n\n- x\n- y\n- z\n');
  const idOf = (d: OutlineDoc, text: string) => d.nodes.find((n) => d.headLines(n).join('').trim() === text)?.id;
  for (const t of ['A', 'x', 'z']) assert.equal(idOf(next, t), idOf(doc, t), t);
  assert.ok(!doc.nodes.some((n) => n.id === idOf(next, 'y')), 'the new item gets a new id');
});
