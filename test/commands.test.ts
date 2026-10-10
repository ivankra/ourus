import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { execute, type Command } from '../src/commands.ts';
import { Doc } from '../src/doc.ts';
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

const COMMANDS: Command['type'][] = ['formatIndent', 'formatOutdent', 'moveUp', 'moveDown', 'insertParagraph', 'insertLineBreak', 'deleteContentBackward'];

test('commands keep text, changes and selection consistent', () => {
  const tally = new Map<string, number>();
  fc.assert(
    fc.property(arbOutlineDoc, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, a, b, type) => {
      const doc = Doc.parse(text);
      const anchor = a % (text.length + 1);
      const head = type === 'insertParagraph' || type === 'insertLineBreak' || type === 'deleteContentBackward' ? anchor : b % (text.length + 1);
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
      const doc = Doc.parse(text);
      const pos = a % (text.length + 1);
      const r1 = execute(doc, { type: 'formatIndent' }, { anchor: pos, head: pos });
      if (r1.status !== 'applied') return;
      const r2 = execute(r1.doc, { type: 'formatOutdent' }, r1.selection);
      assert.equal(r2.status, 'applied');
      if (r2.status !== 'applied') return;
      // the outline comes back; the text may differ in renumbering or bullet adoption
      const shape = (d: Doc) => d.nodes.map((n) => `${n.depth}:${n.kind}:${d.headLines(n).map((l) => l.trim()).join('|')}`).join('\n');
      assert.equal(shape(r2.doc), shape(doc));
    }),
    { numRuns: RUNS },
  );
});

test('on tidy outlines every command plans correctly (verification never has to step in)', () => {
  fc.assert(
    fc.property(arbTidyOutline, fc.nat(), fc.nat(), fc.constantFrom(...COMMANDS), (text, a, b, type) => {
      const anchor = a % (text.length + 1);
      const head = type === 'insertParagraph' || type === 'insertLineBreak' || type === 'deleteContentBackward' ? anchor : b % (text.length + 1);
      const r = execute(Doc.parse(text), { type } as Command, { anchor, head });
      if (r.status === 'rejected') assert.notEqual(r.reason, 'encoding-failed', r.detail ?? '');
    }),
    { numRuns: RUNS },
  );
});

test('ids follow nodes through structural commands', () => {
  const doc = Doc.parse('- a\n- b\n  - c\n- d\n');
  const idOf = (d: Doc, text: string) => d.nodes.find((n) => d.headLines(n)[0] === text)!.id;
  const before = ['a', 'b', 'c', 'd'].map((t) => idOf(doc, t));
  const pos = doc.text.indexOf('b');
  const r = execute(doc, { type: 'moveDown' }, { anchor: pos, head: pos });
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- a\n- d\n- b\n  - c\n');
  assert.deepEqual(['a', 'b', 'c', 'd'].map((t) => idOf(r.doc, t)), before);
});
