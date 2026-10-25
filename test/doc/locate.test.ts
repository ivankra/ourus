// Where a position is: every zone, and every position of generated documents
// answered, a text's offsets round-tripping through `posOf`.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { OurusDoc, type Located } from '../../src/doc/index.ts';
import { createPlaceholder } from '../../src/text/index.ts';
import { BLOCKS, arbDoc } from '../parser/generators.ts';

type Flavor = 'commonmark' | 'gfm' | 'obsidian';
const parse = (text: string, flavor: Flavor = 'gfm', placeholders: number[] = []) => OurusDoc.parse(text, { config: { flavor }, marks: placeholders.map((p) => createPlaceholder(p)) });

/** A position's zone, briefly: `text 4`, `frame task 0`, `marker 1`, `gap paragraph@0`, ... */
function where(doc: OurusDoc, pos: number): string {
  const at: Located = doc.locate(pos);
  switch (at.zone) {
    case 'text':
      return `text ${at.node.kind} ${at.offset}`;
    case 'frame':
      return `frame ${at.part} ${at.offset}`;
    case 'marker':
    case 'prefix':
      return `${at.zone} ${at.piece} ${at.offset}`;
    case 'gap':
      return `gap ${at.owner.kind}@${at.owner.startLine}`;
    default:
      return at.zone;
  }
}

test('a task: its marker, its checkbox, its text', () => {
  const doc = parse('- [ ] task');
  assert.deepEqual([0, 1, 2, 3, 6, 10].map((p) => where(doc, p)), ['marker 0 0', 'marker 0 1', 'frame task 0', 'frame task 1', 'text item 4', 'text item 8']);
});

test('a quote\'s prefix, a heading\'s `#`s, text below a marker', () => {
  const container = (text: string): OurusDoc => OurusDoc.parse(text, { config: { quotes: 'container' } });
  assert.deepEqual([0, 2].map((p) => where(container('> a'), p)), ['prefix 0 0', 'text paragraph 0']);
  // (a quote's text, `quotes: text`: its `>` its frame; `atom`: its characters)
  assert.deepEqual([0, 1, 2].map((p) => where(parse('> a'), p)), ['frame quote 0', 'frame quote 1', 'text paragraph 2']);
  assert.deepEqual([2, 4].map((p) => where(parse('- > a'), p)), ['frame quote 0', 'text item 2']);
  assert.deepEqual([0, 2].map((p) => where(OurusDoc.parse('> a', { config: { quotes: 'atom' } }), p)), ['text atom 0', 'text atom 2']);
  assert.deepEqual([1, 3].map((p) => where(parse('## Title'), p)), ['frame heading 1', 'text heading 3']);
  assert.deepEqual(where(parse('-\n  one'), 1), 'frame below 0');
  assert.deepEqual([2, 3].map((p) => where(parse('S0\n---'), p)), ['text heading 2', 'frame underline 3'], "the title line's end is the text's");
});

test('blank lines are the gap of the node above; the preamble and past the end are no node\'s', () => {
  assert.equal(where(parse('a\n\nb'), 2), 'gap paragraph@0');
  assert.equal(where(parse('- a\n  - b\n\nc'), 10), 'gap item@1', 'a subtree\'s blank lines are its last descendant\'s');
  assert.equal(where(parse('---\ntitle: x\n---\na', 'obsidian'), 4), 'preamble');
  assert.equal(where(parse('\n\na'), 0), 'preamble');
  assert.equal(where(parse('a\n'), 2), 'none');
});

test('a character left out of the text: a held space, a markup escape', () => {
  assert.equal(where(parse('-  x', 'gfm', [2]), 2), 'text item 0');
  assert.deepEqual([0, 1, 2].map((p) => where(parse('\\- x'), p)), ['text paragraph 0', 'text paragraph 0', 'text paragraph 1']);
});

for (const flavor of ['commonmark', 'gfm', 'obsidian'] as const) {
  test(`${flavor}: every position is somewhere, a text's offset a side of it`, () => {
    fc.assert(
      fc.property(arbDoc(BLOCKS, { frontmatter: flavor === 'obsidian' }), (text) => {
        const doc = parse(text, flavor);
        for (let pos = 0; pos <= text.length; pos++) {
          const at = doc.locate(pos);
          if (at.zone !== 'text' && at.zone !== 'frame') continue;
          // the offset's two sides hold the position between them (characters left out of the text lie between)
          const before = doc.posOf(at.node, at.offset, -1);
          const after = doc.posOf(at.node, at.offset, 1);
          assert.ok(before <= pos && pos <= after, `${JSON.stringify(text)} at ${pos}: offset ${at.offset} is ${before}..${after}`);
        }
      }),
      { numRuns: Number(process.env.OURUS_FUZZ_RUNS ?? 300) },
    );
  });
}
