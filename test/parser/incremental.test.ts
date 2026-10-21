// Incremental parsing equals a full parse, on every observable field: the machine's records and
// states, the block tree, the line table, every leaf's inline text and inlines, and the HTML. Edits
// come one at a time, several at once, chained, and with sentinels (placeholders) moving.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { commonmark, type Flavor } from '../../src/parser/flavor.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { renderHtml } from '../../src/parser/html.ts';
import type { BlockSpec, State } from '../../src/parser/machine.ts';
import { SyntaxTree } from '../../src/parser/syntax.ts';
import type { Block } from '../../src/parser/types.ts';
import { BLOCKS, INLINES, arbDoc, arbEdit, changeOf, changesOf, sentinelSpots } from './generators.ts';
import { FLAVORS } from './flavors.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);

const specIds = new Map<BlockSpec, number>();
const specId = (s: BlockSpec): string => {
  if (!specIds.has(s)) specIds.set(s, specIds.size);
  return `${s.type}#${specIds.get(s)}`;
};

function stateJson(s: State): string {
  return JSON.stringify(s.map((f) => ({ ...f, spec: specId(f.spec) })));
}

/** Everything a parse shows, as comparable strings. */
export function snapshot(syntax: SyntaxTree): Record<string, string> {
  const ids = new Map<Block, number>();
  const blocks: unknown[] = [];
  const visit = (b: Block): unknown => {
    ids.set(b, ids.size);
    const { parent: _p, children, ...attrs } = b;
    return { ...attrs, children: children.map(visit) };
  };
  blocks.push(visit(syntax.root));
  const lines = syntax.lines.map((l) => ({
    ...l,
    prefix: l.prefix.map((p) => ({ ...p, block: ids.get(p.block) })),
    containers: l.containers.map((c) => ids.get(c)),
    container: ids.get(l.container),
    leaf: l.leaf ? ids.get(l.leaf) : null,
  }));
  const inlines: unknown[] = [];
  for (const b of ids.keys()) {
    const t = syntax.inlineText(b);
    if (!t) continue;
    const map: number[] = [];
    for (let i = 0; i <= t.text.length; i++) map.push(t.sourceAt(i));
    inlines.push({ block: ids.get(b), text: t.text, map, inlines: syntax.inlines(b) });
  }
  return {
    text: JSON.stringify(syntax.text),
    records: JSON.stringify(syntax.records),
    states: syntax.states.map(stateJson).join('\n'),
    blocks: JSON.stringify(blocks),
    lines: JSON.stringify(lines),
    inlines: JSON.stringify(inlines),
    html: renderHtml(syntax),
  };
}

export function assertSameParse(got: SyntaxTree, want: SyntaxTree, context: string): void {
  const a = snapshot(got);
  const b = snapshot(want);
  for (const key of Object.keys(b)) {
    if (a[key] !== b[key]) assert.fail(`${context}: incremental ${key} differ\n  got  ${a[key]!.slice(0, 1500)}\n  want ${b[key]!.slice(0, 1500)}`);
  }
}

function property(flavor: Flavor, docs: fc.Arbitrary<string>): void {
  fc.assert(
    fc.property(docs, fc.array(arbEdit, { minLength: 1, maxLength: 4 }), (text, edits) => {
      let syntax = SyntaxTree.parse(text, flavor);
      for (const edit of edits) {
        const change = changeOf(syntax.text, edit);
        const next = syntax.update([change]);
        assertSameParse(next, SyntaxTree.parse(next.text, flavor), `${JSON.stringify(syntax.text)} + ${JSON.stringify(change)}`);
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
        const next = SyntaxTree.parse(text, flavor).update(changes);
        assertSameParse(next, SyntaxTree.parse(next.text, flavor), `${JSON.stringify(text)} + ${JSON.stringify(changes)}`);
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
        const syntax = SyntaxTree.parse(text, flavor, { sentinels: pick(text, before) });
        const changes = edit ? [changeOf(text, edit)] : [];
        const newText = changes.length ? text.slice(0, changes[0]!.from) + changes[0]!.insert + text.slice(changes[0]!.to) : text;
        const sentinels = pick(newText, after);
        const next = syntax.update(changes, { sentinels });
        assertSameParse(next, SyntaxTree.parse(newText, flavor, { sentinels }), `${JSON.stringify(text)} + ${JSON.stringify(changes)} sentinels ${JSON.stringify(sentinels)}`);
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
      const next = SyntaxTree.parse(text, flavor).update([{ from, to, insert }]);
      assertSameParse(next, SyntaxTree.parse(next.text, flavor), `${JSON.stringify(text)} [${from}, ${to}) ${JSON.stringify(insert)}`);
    }
  }
});

test('an update leaves the snapshot it starts from as it was', () => {
  // a placeholder after the final line ending adds a line, which an update without changes once
  // appended to the old snapshot's own lines (a structural command from the text end then threw)
  const old = SyntaxTree.parse('- a\n- - b\n', gfm);
  const next = old.update([], { sentinels: [10] });
  assert.equal(next.lineCount, 3);
  assert.equal(old.lineCount, 2);
  assert.deepEqual(old.starts, [0, 4]);
});

test('an update reads only the changed lines and the paragraph around them', () => {
  const lines = Array.from({ length: 2000 }, (_, i) => (i % 10 === 0 ? `# Section ${i}` : `- item ${i} with some text`));
  const text = lines.join('\n') + '\n';
  const syntax = SyntaxTree.parse(text, commonmark);
  const at = text.indexOf('item 1000') + 4;
  const next = syntax.update([{ from: at, to: at, insert: 'x' }]);
  assert.ok(next.reread.to - next.reread.from < 4, `reread ${JSON.stringify(next.reread)}`);
  assertSameParse(next, SyntaxTree.parse(next.text, commonmark), 'typing');
  const enter = syntax.update([{ from: at, to: at, insert: '\n' }]);
  assert.ok(enter.reread.to - enter.reread.from < 5, `reread ${JSON.stringify(enter.reread)}`);
  void gfm;
});
