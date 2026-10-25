// Block structure against commonmark.js 0.31.2 (a dev dependency): block types, nesting, line ranges
// and list tightness, on the spec's examples and on generated documents (see test/oracle.ts for what
// is compared and the differences normalized away).

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import fc from 'fast-check';
import { MdTree } from '../../src/parser/syntax.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { arbDoc, TIDY, WILD } from './arbitraries.ts';
import { ourusSkeleton, refdefLines, referenceSkeleton } from './oracle.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

const spec: { markdown: string; example: number; section: string }[] = JSON.parse(readFileSync(new URL('../fixtures/commonmark-spec-0.31.2.json', import.meta.url), 'utf8'));

const agree = (md: string): void => {
  const root = MdTree.parse(md).root;
  assert.equal(ourusSkeleton(root), referenceSkeleton(md, refdefLines(root)), JSON.stringify(md));
};

test('block structure agrees with commonmark.js on every CommonMark 0.31.2 spec example', () => {
  const failures: string[] = [];
  for (const ex of spec) {
    const root = MdTree.parse(ex.markdown).root;
    const want = referenceSkeleton(ex.markdown, refdefLines(root));
    const got = ourusSkeleton(root);
    if (got !== want) failures.push(`#${ex.example} (${ex.section}) ${JSON.stringify(ex.markdown)}\n  want ${want}\n  got  ${got}`);
  }
  assert.equal(failures.length, 0, `${failures.length} of ${spec.length} differ:\n${failures.slice(0, 15).join('\n')}`);
});

test('block structure agrees with commonmark.js on wild documents', () => {
  fc.assert(fc.property(arbDoc(WILD, { endings: ['\n', '\r\n'] }), agree), { numRuns: RUNS });
});

test('block structure agrees with commonmark.js on tidy documents', () => {
  fc.assert(fc.property(arbDoc(TIDY, { maxLines: 20 }), agree), { numRuns: RUNS });
});

test('an ordered list interrupts a paragraph when it starts at 1, however the 1 is written', () => {
  for (const md of ['a\n1. b\n', 'a\n01. b\n', 'a\n2. b\n', 'a\n1) b\n']) agree(md);
});

test('prefix pieces of a nested list inside a quote', () => {
  const md = '> - a\n>   - b\n>\n>   c\n';
  const syntax = MdTree.parse(md);
  const kinds = syntax.lines.map((l) => l.prefix.map((p) => `${p.container.block.type}:${p.kind}:${JSON.stringify(md.slice(p.from, p.to))}`).join(' '));
  assert.deepEqual(kinds, [
    'blockquote:quote:"> " item:marker:"- "',
    'blockquote:quote:"> " item:indent:"  " item:marker:"- "',
    'blockquote:quote:">" item:indent:"" item:indent:""',
    'blockquote:quote:"> " item:indent:"  "',
  ]);
  assert.equal(syntax.lines[3]!.leaf?.block.type, 'paragraph');
});

test("text right after a task's checkbox is no link reference definition (GFM: cmark-gfm reads the checkbox after the blocks, as micromark does)", () => {
  assert.equal(MdTree.parse('- [ ] [r]: /u\n', gfm).renderHtml(), '<ul>\n<li><input type="checkbox" disabled="" /> [r]: /u</li>\n</ul>\n');
  // a definition starting a later paragraph of the item is one
  assert.equal(MdTree.parse('- [ ] x\n\n  [r]: /u\n', gfm).root.children[0]!.children[0]!.children.map((b) => b.type).join(' '), 'paragraph refdef');
});
