// Incremental parsing equals a full parse, on every observable field: the machine's records and
// states, the block tree, the line table, every leaf's inline text and inlines, and the HTML. Edits
// come one at a time, several at once, chained, and with sentinels (placeholders) moving.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { commonmark, type MdFlavor } from '../../src/parser/flavor.ts';
import { gfm } from '../../src/parser/gfm.ts';
import type { MdBlockSpec, MdState } from '../../src/parser/machine.ts';
import { MdTree } from '../../src/parser/syntax.ts';

import type { MdBlock, MdBlockAt } from '../../src/parser/types.ts';
import { BLOCKS, INLINES, arbDoc, arbEdit, changeOf, changesOf, sentinelSpots } from './generators.ts';
import { FLAVORS } from './flavors.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);

const specIds = new Map<MdBlockSpec, number>();
const specId = (s: MdBlockSpec): string => {
  if (!specIds.has(s)) specIds.set(s, specIds.size);
  return `${s.type}#${specIds.get(s)}`;
};

function stateJson(s: MdState): string {
  return JSON.stringify(s.map((f) => ({ ...f, spec: specId(f.spec) })));
}

/** Everything a parse shows, as comparable strings. */
export function snapshot(syntax: MdTree): Record<string, string> {
  // (a stored block is in a tree once: blocks are named by their place in the walk)
  const ids = new Map<MdBlock, number>();
  const ats: MdBlockAt[] = [];
  const blocks: unknown[] = [];
  const visit = (at: MdBlockAt): unknown => {
    ids.set(at.block, ids.size);
    ats.push(at);
    const { type, attrs, kind, lines, span } = at.block;
    return { type, line: at.line, attrs, kind, lines, span, children: at.children().map(visit) };
  };
  blocks.push(visit(syntax.rootAt));
  const lines = syntax.lines.map((l) => ({
    ...l,
    prefix: l.prefix.map((p) => ({ ...p, container: ids.get(p.container.block) })),
    containers: l.containers.map((c) => ids.get(c.block)),
    container: ids.get(l.container.block),
    leaf: l.leaf ? ids.get(l.leaf.block) : null,
  }));
  const inlines: unknown[] = [];
  for (const b of ats) {
    const t = syntax.inlineText(b);
    if (!t) continue;
    const map: number[] = [];
    for (let i = 0; i <= t.text.length; i++) map.push(t.sourceAt(i));
    inlines.push({ block: ids.get(b.block), text: t.text, map, inlines: syntax.inlines(b) });
  }
  return {
    text: JSON.stringify(syntax.text),
    records: JSON.stringify(syntax.records),
    states: syntax.states.map(stateJson).join('\n'),
    blocks: JSON.stringify(blocks),
    lines: JSON.stringify(lines),
    inlines: JSON.stringify(inlines),
    html: syntax.renderHtml(),
    // the lines that looked ahead, which an update keeps rather than finds again
    lookaheads: JSON.stringify((syntax as unknown as { lookaheads: number[] }).lookaheads),
  };
}

export function assertSameParse(got: MdTree, want: MdTree, context: string): void {
  const a = snapshot(got);
  const b = snapshot(want);
  for (const key of Object.keys(b)) {
    if (a[key] !== b[key]) assert.fail(`${context}: incremental ${key} differ\n  got  ${a[key]!.slice(0, 1500)}\n  want ${b[key]!.slice(0, 1500)}`);
  }
}

function property(flavor: MdFlavor, docs: fc.Arbitrary<string>): void {
  fc.assert(
    fc.property(docs, fc.array(arbEdit, { minLength: 1, maxLength: 4 }), (text, edits) => {
      let syntax = MdTree.parse(text, flavor);
      for (const edit of edits) {
        const change = changeOf(syntax.text, edit);
        // the old tree built, so the update takes what it can of it
        void syntax.root;
        const next = syntax.update([change]);
        assertSameParse(next, MdTree.parse(next.text, flavor), `${JSON.stringify(syntax.text)} + ${JSON.stringify(change)}`);
        syntax = next;
      }
    }),
    { numRuns: RUNS },
  );
}

for (const [name, flavor] of Object.entries(FLAVORS)) {
  test(`${name}: an update equals a full parse, block-heavy documents`, () => property(flavor, arbDoc(BLOCKS, { frontmatter: name === 'obsidian' })));
  test(`${name}: an update equals a full parse, inline-heavy documents`, () => property(flavor, arbDoc(INLINES)));

  test(`${name}: several changes at once`, () => {
    fc.assert(
      fc.property(arbDoc(BLOCKS, { frontmatter: name === 'obsidian' }), fc.array(arbEdit, { minLength: 2, maxLength: 5 }), (text, edits) => {
        const changes = changesOf(text, edits);
        const old = MdTree.parse(text, flavor);
        void old.root;
        const next = old.update(changes);
        assertSameParse(next, MdTree.parse(next.text, flavor), `${JSON.stringify(text)} + ${JSON.stringify(changes)}`);
      }),
      { numRuns: RUNS },
    );
  });

  test(`${name}: sentinels moving, with and without edits`, () => {
    fc.assert(
      fc.property(arbDoc(BLOCKS), fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { maxLength: 3 }), fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { maxLength: 3 }), fc.option(arbEdit), (text, before, after, edit) => {
        const pick = (t: string, fractions: readonly number[]): number[] => {
          const spots = sentinelSpots(t);
          return fractions.map((f) => spots[Math.floor(f * spots.length)]!).filter((x) => x !== undefined);
        };
        const syntax = MdTree.parse(text, flavor, { sentinels: pick(text, before) });
        void syntax.root;
        const changes = edit ? [changeOf(text, edit)] : [];
        const newText = changes.length ? text.slice(0, changes[0]!.from) + changes[0]!.insert + text.slice(changes[0]!.to) : text;
        const sentinels = pick(newText, after);
        const next = syntax.update(changes, { sentinels });
        assertSameParse(next, MdTree.parse(newText, flavor, { sentinels }), `${JSON.stringify(text)} + ${JSON.stringify(changes)} sentinels ${JSON.stringify(sentinels)}`);
      }),
      { numRuns: RUNS },
    );
  });
}

test('line endings that join or split across a change', () => {
  const cases: [string, number, number, string][] = [
    ['\r    code', 1, 1, '\n'],
    ['a\rx\ny', 2, 3, ''],
    ['a\r\nb', 1, 2, ''],
    ['a\r\nb', 2, 2, 'x'],
    ['a\nb', 1, 1, '\r'],
    ['- a\r\r  b', 4, 4, '\n'],
  ];
  for (const [text, from, to, insert] of cases) {
    for (const flavor of Object.values(FLAVORS)) {
      const old = MdTree.parse(text, flavor);
      void old.root;
      const next = old.update([{ from, to, insert }]);
      assertSameParse(next, MdTree.parse(next.text, flavor), `${JSON.stringify(text)} [${from}, ${to}) ${JSON.stringify(insert)}`);
    }
  }
});

test('an update leaves the snapshot it starts from as it was', () => {
  // a placeholder after the final line ending adds a line, which an update without changes once
  // appended to the old snapshot's own lines (a structural command from the text end then threw)
  const old = MdTree.parse('- a\n- - b\n', gfm);
  const next = old.update([], { sentinels: [10] });
  assert.equal(next.lineCount, 3);
  assert.equal(old.lineCount, 2);
  assert.deepEqual(old.starts, [0, 4]);
});

test('an update reads only the changed lines and the paragraph around them', () => {
  const lines = Array.from({ length: 2000 }, (_, i) => (i % 10 === 0 ? `# Section ${i}` : `- item ${i} with some text`));
  const text = lines.join('\n') + '\n';
  const syntax = MdTree.parse(text, commonmark);
  const at = text.indexOf('item 1000') + 4;
  const next = syntax.update([{ from: at, to: at, insert: 'x' }]);
  assert.ok(next.reread.to - next.reread.from < 4, `reread ${JSON.stringify(next.reread)}`);
  assertSameParse(next, MdTree.parse(next.text, commonmark), 'typing');
  const enter = syntax.update([{ from: at, to: at, insert: '\n' }]);
  assert.ok(enter.reread.to - enter.reread.from < 5, `reread ${JSON.stringify(enter.reread)}`);
  void gfm;
});

test('an update shares every block away from the lines it read again', () => {
  // sections of lists, and one long list: Enter in the middle of each
  const sections = Array.from({ length: 300 }, (_, i) => [`# Section ${i}`, '', `- item ${i}`, `  - child ${i}`, '']).flat();
  const list = Array.from({ length: 1500 }, (_, i) => (i % 3 ? `  - child ${i}` : `- item ${i}`));
  for (const lines of [sections, list]) {
    const text = lines.join('\n') + '\n';
    const syntax = MdTree.parse(text, commonmark);
    const at = text.indexOf(lines[Math.floor(lines.length / 2)]!) + 4;
    const old = new Set<unknown>();
    const stored = (t: MdTree): unknown[] => {
      const out: unknown[] = [];
      const visit = [t.root];
      while (visit.length) {
        const b = visit.pop()!;
        out.push(b);
        visit.push(...b.children);
      }
      return out;
    };
    for (const n of stored(syntax)) old.add(n);
    const next = syntax.update([{ from: at, to: at, insert: '\n' }]);
    assertSameParse(next, MdTree.parse(next.text, commonmark), 'enter');
    const now = stored(next);
    const fresh = now.filter((n) => !old.has(n)).length;
    // the path from the root to the edit, and the blocks just before it (ended by a line read
    // again); the rest is the old tree's
    assert.ok(fresh < 20, `${fresh} of ${now.length} blocks made anew`);
  }
});
