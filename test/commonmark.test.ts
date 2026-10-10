import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseCommonMark } from '../src/syntax/commonmark.ts';
import { DEVIATIONS, ourusSkeleton, refdefLines, referenceSkeleton } from './oracle.ts';

interface SpecExample {
  markdown: string;
  example: number;
  section: string;
}

const spec: SpecExample[] = JSON.parse(readFileSync(new URL('./fixtures/commonmark-spec-0.31.2.json', import.meta.url), 'utf8'));

test('block structure agrees with commonmark.js on every CommonMark 0.31.2 spec example', () => {
  const failures: string[] = [];
  for (const ex of spec) {
    const tree = parseCommonMark(ex.markdown);
    const want = DEVIATIONS[ex.example]?.ourus ?? referenceSkeleton(ex.markdown, refdefLines(tree.root));
    const got = ourusSkeleton(tree.root);
    if (got !== want) failures.push(`#${ex.example} (${ex.section}) ${JSON.stringify(ex.markdown)}\n  want ${want}\n  got  ${got}`);
  }
  assert.equal(failures.length, 0, `${failures.length} of ${spec.length} differ:\n${failures.slice(0, 15).join('\n')}`);
});
