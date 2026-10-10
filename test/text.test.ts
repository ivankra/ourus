import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { applyChanges, composeChanges, invertChanges, mapPos, normalizeChanges, type Change } from '../src/text.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** Sorted, non-overlapping changes over a text of length `len`. */
const arbChanges = (len: number) =>
  fc.array(fc.tuple(fc.nat(len), fc.nat(len), fc.string({ maxLength: 4 })), { maxLength: 4 }).map((cs) => {
    const sorted = cs.map(([a, b, s]) => ({ from: Math.min(a, b), to: Math.max(a, b), insert: s })).sort((x, y) => x.from - y.from);
    const out: Change[] = [];
    let end = 0;
    for (const c of sorted) if (c.from >= end) { out.push(c); end = Math.max(c.to, c.from + 1); }
    return out;
  });

const arbEdit = fc.string({ maxLength: 20 }).chain((t) => fc.tuple(fc.constant(t), arbChanges(t.length)));

test('inverse changes restore the text', () => {
  fc.assert(fc.property(arbEdit, ([t, cs]) => assert.equal(applyChanges(applyChanges(t, cs), invertChanges(t, cs)), t)), { numRuns: RUNS });
});

test('composed changes equal applying both in turn', () => {
  fc.assert(
    fc.property(
      arbEdit.chain(([t, a]) => fc.tuple(fc.constant(t), fc.constant(a), arbChanges(applyChanges(t, a).length))),
      ([t, a, b]) => {
        const c = composeChanges(t, a, b);
        normalizeChanges(c);
        assert.equal(applyChanges(t, c), applyChanges(applyChanges(t, a), b));
      },
    ),
    { numRuns: RUNS },
  );
});

test('mapped positions stay in bounds and keep their order', () => {
  fc.assert(
    fc.property(arbEdit, fc.nat(), fc.nat(), ([t, cs], x, y) => {
      const n = applyChanges(t, cs).length;
      const [p, q] = [x % (t.length + 1), y % (t.length + 1)].sort((a, b) => a - b);
      for (const assoc of [-1, 1] as const) {
        const mp = mapPos(cs, p!, assoc);
        assert.ok(mp >= 0 && mp <= n);
        assert.ok(mp <= mapPos(cs, q!, assoc));
      }
    }),
    { numRuns: RUNS },
  );
});
