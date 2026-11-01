import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { applyChanges, ChangeIndex, ChangeSet, composeChanges, diffLines, invertChanges, mapPos, MarkError, MarkSet, normalizeChanges, type ChangeSpec } from '../src/text/index.ts';

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

test('a set sorts its lists, drops duplicates, and refuses an offset off its text', () => {
  const marks = MarkSet.of('ab\n\\d', { placeholders: [5, 2, 2], auto: [3, 2] });
  assert.deepEqual(marks.placeholders, [2, 5]);
  assert.deepEqual(marks.auto, [2, 3]);
  assert.equal(marks.isEmpty(), false);
  assert.equal(MarkSet.of('ab').isEmpty(), true, 'a text, no marks');
  assert.throws(() => MarkSet.of('ab', { placeholders: [3] }), RangeError, 'a point past the end');
  assert.throws(() => MarkSet.of('ab', { auto: [2] }), RangeError, 'no character at the end');
  assert.throws(() => MarkSet.of('ab', { placeholders: [-1] }), RangeError);
  assert.deepEqual(MarkSet.of('ab', { placeholders: [2] }).placeholders, [2], 'a point at the end');
});

test('a set refuses a mark on a character it can\'t be on: the list that gave it is corrupt', () => {
  // a placeholder: at a line's end or on a blank
  assert.deepEqual(MarkSet.of('a b\n\t c\n', { placeholders: [1, 3, 4, 5, 7, 8] }).placeholders, [1, 3, 4, 5, 7, 8]);
  assert.throws(() => MarkSet.of('ab', { placeholders: [1] }), MarkError, 'inside a word');
  assert.throws(() => MarkSet.of('a\nb', { placeholders: [2] }), MarkError, 'at a line\'s start, on its text');
  assert.throws(() => MarkSet.of('> a', { placeholders: [2] }), MarkError, 'past a `>`');
  assert.throws(() => MarkSet.of('a\\b', { placeholders: [2] }), MarkError, 'between an escape and its character');
  // an auto mark: an escape's backslash, a line break, a closing backtick or tilde
  assert.deepEqual(MarkSet.of('\\-\r\n\n`~', { auto: [0, 2, 3, 4, 5, 6] }).auto, [0, 2, 3, 4, 5, 6]);
  assert.throws(() => MarkSet.of('a b', { auto: [0] }), MarkError, 'a letter');
  assert.throws(() => MarkSet.of('a b', { auto: [1] }), MarkError, 'a blank');
  assert.throws(() => MarkSet.of('a b', { auto: [0] }).with({}), MarkError);
  assert.throws(() => MarkSet.of('a b').with({ placeholders: [2] }), MarkError);
});

test('a placeholder\'s role is where it is: at a line\'s end an empty node, elsewhere a held space', () => {
  const marks = MarkSet.of('- \n  x\r\n', { placeholders: [2, 4, 8] });
  assert.deepEqual(marks.placeholders.filter((pos) => marks.hasEmptyNodeAt(pos)), [2, 8]);
  assert.deepEqual(marks.placeholders.filter((pos) => marks.hasHeldSpaceAt(pos)), [4]);
  assert.equal(marks.hasEmptyNodeAt(2), true);
  assert.equal(marks.hasHeldSpaceAt(2), false);
  assert.equal(marks.hasHeldSpaceAt(4), true);
  assert.equal(marks.hasEmptyNodeAt(4), false);
  assert.equal(marks.hasPlaceholderAt(3), false);
});

test('the binary searches find what a scan finds', () => {
  fc.assert(fc.property(fc.uniqueArray(fc.nat(30)), fc.nat(31), fc.nat(31), (offsets, a, b) => {
    const sorted = [...offsets].sort((x, y) => x - y);
    const [from, to] = a <= b ? [a, b] : [b, a];
    assert.equal(MarkSet.has(sorted, a), sorted.includes(a));
    assert.deepEqual([...MarkSet.within(sorted, from, to)], sorted.filter((pos) => pos >= from && pos < to));
  }));
});

test('a placeholder moves as mapPos moves it (past an insertion at it), and goes where text on both sides of it does', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 5 }), fc.string({ maxLength: 4 }), (pos, from, len, insert) => {
    // (blanks: wherever it moves, it is still before one, or at the end)
    const text = ' '.repeat(26);
    const change = { from, to: from + len, insert };
    const mapped = MarkSet.of(text, { placeholders: [pos] }).map([change]);
    assert.deepEqual(mapped.placeholders, from < pos && pos < from + len ? [] : [mapPos([change], pos, 1)]);
    assert.equal(mapped.text, applyChanges(text, [change]));
  }));
  // the space it held taken out: no place any more, wherever it lands
  assert.deepEqual(MarkSet.of('a b', { placeholders: [1] }).map([{ from: 1, to: 2, insert: '' }]).placeholders, []);
  assert.deepEqual(MarkSet.of('a\n b', { placeholders: [2] }).map([{ from: 2, to: 3, insert: '' }]).placeholders, []);
});

test('an auto mark is its character: it moves with it, and goes with it', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 5 }), fc.string({ maxLength: 4 }), (pos, from, len, insert) => {
    const text = '\\'.repeat(26);
    const change = { from, to: from + len, insert };
    const mapped = MarkSet.of(text, { auto: [pos] }).map([change]);
    assert.deepEqual(mapped.auto, from <= pos && pos < from + len ? [] : [mapPos([change], pos, 1)]);
  }));
  // typed right before it: it moves on; right after it: it stays
  const marks = MarkSet.of('a\\', { auto: [1] });
  assert.deepEqual(marks.map([{ from: 1, to: 1, insert: 'x' }]).auto, [2]);
  assert.deepEqual(marks.map([{ from: 2, to: 2, insert: 'x' }]).auto, [1]);
});

test('a set maps through a change set as through its changes', () => {
  const marks = MarkSet.of('ab\ncd', { placeholders: [2] });
  const changes = [{ from: 0, to: 1, insert: 'xx' }];
  assert.deepEqual(marks.map(ChangeSet.of(changes, 5)).placeholders, [3]);
  assert.deepEqual(marks.map(changes).placeholders, [3]);
  assert.equal(marks.map(changes).text, 'xxb\ncd');
  assert.equal(marks.map(ChangeSet.empty(5)), marks);
});

test('slices that tile a text concat back to it, each mark once; splice moves the marks around and carries the insertion\'s', () => {
  const marks = MarkSet.of(' b \\\n', { placeholders: [0, 2, 5], auto: [3, 4] });
  for (let k = 0; k <= 5; k++) {
    const back = marks.slice(0, k).concat(marks.slice(k, 5, true));
    assert.equal(back.text, marks.text);
    assert.deepEqual(back.placeholders, marks.placeholders, `cut at ${k}`);
    assert.deepEqual(back.auto, marks.auto, `cut at ${k}`);
  }
  // a part cut at the space takes a point at its end only when asked
  assert.deepEqual(marks.slice(0, 2).placeholders, [0]);
  assert.deepEqual(marks.slice(0, 2, true).placeholders, [0, 2]);
  assert.deepEqual(marks.slice(3, 5, true).auto, [0, 1]);
  const spliced = marks.splice(0, 0, MarkSet.of('X ', { placeholders: [1] }));
  // the point at 0 was where the text goes in: it moves past it, as mapPos moves it
  assert.equal(spliced.text, 'X  b \\\n');
  assert.deepEqual(spliced.placeholders, [1, 2, 4, 7]);
  assert.deepEqual(spliced.auto, [5, 6]);
  assert.equal(marks.splice(2, 4).text, ' b\n');
  assert.deepEqual(marks.splice(2, 4).auto, [2], 'the deleted character\'s mark goes');
});

test('with replaces the lists given, and is the same set where they are the same', () => {
  const marks = MarkSet.of('a \\', { placeholders: [1], auto: [2] });
  assert.deepEqual(marks.with({ placeholders: [] }).auto, [2]);
  assert.deepEqual(marks.with({ placeholders: [] }).placeholders, []);
  assert.equal(marks.with({ placeholders: [1, 1] }), marks, 'canonical first: the same lists');
  assert.equal(marks.with({}), marks);
  assert.throws(() => marks.with({ auto: [3] }), RangeError);
});

test('a change is a range of whole offsets, start to end; one that changes nothing is dropped before the overlap check', () => {
  for (const c of [{ from: 2, to: 1, insert: 'X' }, { from: Number.NaN, to: 1, insert: 'X' }, { from: 1.5, to: 2, insert: '' }, { from: -1, to: 0, insert: '' }]) {
    assert.throws(() => applyChanges('abcd', [c]), RangeError);
  }
  assert.equal(applyChanges('abcd', [{ from: 1, to: 4, insert: 'X' }, { from: 2, to: 2, insert: '' }]), 'aX');
});

test('an index of changes maps every position as `mapPos` does, and finds the change covering a range as a scan does', () => {
  const arbChanges = fc.array(fc.record({ from: fc.nat(20), len: fc.nat(3), insert: fc.constantFrom('', 'x', 'yz') }), { maxLength: 6 }).map((cs) => {
    // non-overlapping: each from past the last change's end
    const out: ChangeSpec[] = [];
    let at = 0;
    for (const c of cs) {
      const from = at + c.from % 5;
      out.push({ from, to: from + c.len, insert: c.insert });
      at = from + c.len;
    }
    return out;
  });
  fc.assert(
    fc.property(arbChanges, (changes) => {
      const index = new ChangeIndex(changes);
      for (let pos = 0; pos <= 40; pos++) {
        for (const assoc of [-1, 1] as const) assert.equal(index.mapPos(pos, assoc), mapPos(changes, pos, assoc), `${JSON.stringify(changes)} ${pos} ${assoc}`);
        for (let to = pos; to <= pos + 3; to++) {
          assert.equal(index.covering(pos, to), changes.find((c) => c.from < c.to && c.from <= pos && c.to >= to), `${JSON.stringify(changes)} ${pos}–${to}`);
          const removes = changes.some((c) => c.from < c.to && (pos === to ? c.from < pos && pos < c.to : c.from < to && c.to > pos));
          assert.equal(index.removes(pos, to), removes, `removes ${JSON.stringify(changes)} ${pos}–${to}`);
        }
      }
    }),
    { numRuns: 500 },
  );
});

test('diffLines changes whole lines of the old text, a CRLF never split', () => {
  assert.deepEqual(diffLines('a\r\nb\r\n', 'a\r\nc\r\n'), [{ from: 3, to: 6, insert: 'c\r\n' }]);
  assert.deepEqual(diffLines('a\nb\n', 'a\nc\n'), [{ from: 2, to: 4, insert: 'c\n' }]);
  assert.deepEqual(diffLines('x\ny', 'x\nz\ny'), [{ from: 2, to: 2, insert: 'z\n' }]);
});
