import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { applyChanges, AUTO_CLOSED_MARK, AUTO_WHITESPACE_MARK, ChangeSet, composeChanges, PLACEHOLDER_MARK, invertChanges, mapPos, MarkSet, normalizeChanges, type ChangeSpec, type Mark } from '../src/text/index.ts';
// the text layer's own test: its kinds are defined in it, and the entry doesn't export `defineMarkKind`
import { defineMarkKind } from '../src/text/marks.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** Sorted, non-overlapping changes over a text of length `len`. */
const arbChanges = (len: number) =>
  fc.array(fc.tuple(fc.nat(len), fc.nat(len), fc.string({ maxLength: 4 })), { maxLength: 4 }).map((cs) => {
    const sorted = cs.map(([a, b, s]) => ({ from: Math.min(a, b), to: Math.max(a, b), insert: s })).sort((x, y) => x.from - y.from);
    const out: ChangeSpec[] = [];
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

test('a change set applies, inverts and maps as its changes do', () => {
  fc.assert(
    fc.property(arbEdit, fc.nat(), ([t, cs], x) => {
      const set = ChangeSet.of(cs, t.length);
      const after = applyChanges(t, cs);
      assert.equal(set.apply(t), after);
      assert.equal(set.newLength, after.length);
      assert.equal(set.invert(t).apply(after), t);
      const p = x % (t.length + 1);
      for (const assoc of [-1, 1] as const) assert.equal(set.mapPos(p, assoc), mapPos(cs, p, assoc));
    }),
    { numRuns: RUNS },
  );
});

test('composing is exact: one change set, replacing only what either replaced', () => {
  // b's insertion in or at the ends of what a wrote joins it; a change in text a left alone stays apart
  const a = ChangeSet.of([{ from: 1, to: 1, insert: 'xy' }], 4);
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 2, to: 2, insert: 'z' }], 6)).changes, [{ from: 1, to: 1, insert: 'xzy' }]);
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 3, to: 3, insert: 'z' }], 6)).changes, [{ from: 1, to: 1, insert: 'xyz' }]);
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 1, to: 1, insert: 'z' }], 6)).changes, [{ from: 1, to: 1, insert: 'zxy' }]);
  // a replacement touching what a wrote stays apart (a renumbered marker after an inserted line)
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 3, to: 4, insert: 'Q' }], 6)).changes, [{ from: 1, to: 1, insert: 'xy' }, { from: 1, to: 2, insert: 'Q' }]);
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 4, to: 5, insert: '' }], 6)).changes, [{ from: 1, to: 1, insert: 'xy' }, { from: 2, to: 3, insert: '' }]);
  // one overlapping a's insertion and the text after it replaces both, nothing more
  assert.deepEqual(a.compose(ChangeSet.of([{ from: 2, to: 4, insert: 'Q' }], 6)).changes, [{ from: 1, to: 2, insert: 'xQ' }]);
  // b's deletion over the end of a's insertion and the text after it is one change
  assert.deepEqual(ChangeSet.of([{ from: 0, to: 0, insert: 'ab' }], 4).compose(ChangeSet.of([{ from: 1, to: 3, insert: '' }], 6)).changes, [{ from: 0, to: 1, insert: 'a' }]);
  // a's deletion under b's insertion
  const d = ChangeSet.of([{ from: 1, to: 3, insert: '' }], 4);
  assert.deepEqual(d.compose(ChangeSet.of([{ from: 1, to: 1, insert: 'k' }], 2)).changes, [{ from: 1, to: 3, insert: 'k' }]);
  assert.throws(() => a.compose(ChangeSet.empty(4)), RangeError);
});

test('composed change sets stay within what either changed', () => {
  fc.assert(
    fc.property(
      arbEdit.chain(([t, a]) => fc.tuple(fc.constant(t), fc.constant(a), arbChanges(applyChanges(t, a).length))),
      ([t, a, b]) => {
        const first = ChangeSet.of(a, t.length);
        const both = first.compose(ChangeSet.of(b, first.newLength));
        assert.equal(both.apply(t), applyChanges(applyChanges(t, a), b));
        // every original character outside a's changes and b's (mapped back) is kept
        const replaced = (p: number): boolean => a.some((c) => c.from <= p && p < c.to) || b.some((c) => c.from < c.to && c.from <= first.mapPos(p, 1) && first.mapPos(p, -1) < c.to);
        for (const c of both.changes) for (let p = c.from; p < c.to; p++) assert.ok(replaced(p), `${p} kept in ${JSON.stringify(both.changes)}`);
      },
    ),
    { numRuns: RUNS },
  );
});

// ---------------------------------------------------------------- marks

const point = defineMarkKind('test-point', { assoc: 1, mapMode: 'trackDel' });
const before = defineMarkKind('test-before', { assoc: -1, mapMode: 'simple' });
const range = defineMarkKind('test-range', { assoc: 1, mapMode: 'trackDel', onInsertInside: 'extend' });
const at = (kind: string, from: number, to = from): Mark => ({ kind, from, to });

test('a point moves as mapPos moves it, and goes where text around it is replaced', () => {
  const set = MarkSet.of([at(point, 3), at(before, 3)]);
  assert.deepEqual(set.map([{ from: 3, to: 3, insert: 'xy' }]).marks, [at(before, 3), at(point, 5)]);
  assert.deepEqual(set.map([{ from: 1, to: 5, insert: 'z' }]).marks, [at(before, 2)]);
  assert.deepEqual(set.map([{ from: 0, to: 3, insert: '' }]).marks, [at(point, 0), at(before, 0)].sort((a, b) => a.kind.localeCompare(b.kind)));
});

test('points map as the placeholders they replace do (mapPos, gone strictly inside a replacement)', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 5 }), fc.string({ maxLength: 4 }), (p, from, len, insert) => {
    const change = { from, to: from + len, insert };
    const mapped = MarkSet.of([at(point, p)]).map([change]).points();
    const expected = from < p && p < from + len ? [] : [mapPos([change], p, 1)];
    assert.deepEqual(mapped, expected);
  }));
});

test('a range grows over text typed inside it, not at its ends, and goes when covered', () => {
  const set = MarkSet.of([at(range, 2, 5)]);
  assert.deepEqual(set.map([{ from: 3, to: 3, insert: 'ab' }]).marks, [at(range, 2, 7)]);
  assert.deepEqual(set.map([{ from: 2, to: 2, insert: 'ab' }]).marks, [at(range, 4, 7)]);
  assert.deepEqual(set.map([{ from: 5, to: 5, insert: 'ab' }]).marks, [at(range, 2, 5)]);
  assert.deepEqual(set.map([{ from: 1, to: 6, insert: 'q' }]).marks, []);
});

test('slices that tile a text keep each mark once; splice moves the marks around and carries the insertion\'s', () => {
  // on `ab cd`
  const set = MarkSet.of([at(point, 0), at(point, 2), at(point, 5), at(range, 3, 5)]);
  for (let k = 0; k <= 5; k++) {
    const back = set.slice(0, k, k === 5).update({ add: set.slice(k, 5, true).shift(k).marks });
    assert.deepEqual(back.points(point), set.points(point));
  }
  // cut at the space: the part before it takes a point at its end
  assert.deepEqual(set.slice(0, 2, true).points(point), [0, 2]);
  assert.deepEqual(set.slice(3, 5, true).marks, [at(range, 0, 2), at(point, 2)]);
  const spliced = set.splice(0, 1, 'XY', MarkSet.of([at(point, 1)]));
  // the point at 0 was at the replaced text's start: it moves past the replacement, as mapPos moves it
  assert.deepEqual(spliced.points(point), [1, 2, 3, 6]);
  assert.equal(spliced.has(1, point), true);
  assert.equal(spliced.has(4, range), true);
  assert.equal(spliced.has(6, range), false);
});

test('auto whitespace or an auto-closed delimiter goes when the user types inside it or deletes it, and moves with text around it', () => {
  // `a` / a blank line ourus added (its line break at 2) / `b`; a pair of backticks, the closing one at 6
  const set = MarkSet.of([at(AUTO_WHITESPACE_MARK, 2, 3), at(AUTO_CLOSED_MARK, 6, 7)]);
  assert.deepEqual(set.map([{ from: 0, to: 0, insert: 'xy' }]).marks, [at(AUTO_WHITESPACE_MARK, 4, 5), at(AUTO_CLOSED_MARK, 8, 9)]);
  assert.deepEqual(set.map([{ from: 2, to: 3, insert: '' }]).marks, [at(AUTO_CLOSED_MARK, 5, 6)]);
  assert.deepEqual(set.map([{ from: 6, to: 6, insert: 'code' }]).marks, [at(AUTO_WHITESPACE_MARK, 2, 3), at(AUTO_CLOSED_MARK, 10, 11)]);
  assert.deepEqual(MarkSet.of([at(AUTO_CLOSED_MARK, 6, 9)]).map([{ from: 7, to: 7, insert: '`' }]).marks, []);
});

test('a set updates as CM6 RangeSet.update does (filter, then add), and between reports what touches a span, in order', () => {
  const set = MarkSet.of([at(point, 1), at(range, 2, 5), at(point, 8)]);
  assert.deepEqual(set.update({ filter: (m) => m.kind !== point, add: [at(point, 0)] }).marks, [at(point, 0), at(range, 2, 5)]);
  assert.equal(set.update({}), set);
  const seen: Mark[] = [];
  set.between(5, 8, (m) => void seen.push(m));
  assert.deepEqual(seen, [at(range, 2, 5), at(point, 8)]);
  const first: Mark[] = [];
  set.between(0, 9, (m) => (first.push(m), false));
  assert.deepEqual(first, [at(point, 1)]);
});

test('a set maps through a change set as through its changes', () => {
  const set = MarkSet.of([at(PLACEHOLDER_MARK, 2)]);
  const changes = [{ from: 0, to: 1, insert: 'xx' }];
  assert.deepEqual(set.map(ChangeSet.of(changes, 5)).marks, [at(PLACEHOLDER_MARK, 3)]);
  assert.deepEqual(set.map(changes).marks, [at(PLACEHOLDER_MARK, 3)]);
  assert.equal(set.map(ChangeSet.empty(5)), set);
});

test('a range that goes when typed in goes when text inside it is replaced too, not when it is only deleted', () => {
  const set = MarkSet.of([at(AUTO_WHITESPACE_MARK, 2, 5)]);
  assert.deepEqual(set.map([{ from: 3, to: 4, insert: 'x' }]).marks, []);
  assert.deepEqual(set.map([{ from: 2, to: 4, insert: 'x' }]).marks, []);
  assert.deepEqual(set.map([{ from: 3, to: 4, insert: '' }]).marks, [at(AUTO_WHITESPACE_MARK, 2, 4)]);
  assert.deepEqual(set.map([{ from: 5, to: 6, insert: 'x' }]).marks, [at(AUTO_WHITESPACE_MARK, 2, 5)]);
});
