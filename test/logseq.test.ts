// spec/logseq.md is Logseq's recorded behaviour (`editor: logseq`; `npm run test:logseq` replays it
// in Logseq). Offline, this checks the file still reads as outlines and draws back unchanged, so the
// recorder and the reader can't drift apart unnoticed.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { readSpec } from './specfile.ts';
import { draw, readOutline, unescape } from './logseq/adapt.ts';

test('spec/logseq.md reads as outlines and draws back unchanged', () => {
  const tests = readSpec('logseq.md', readFileSync(new URL('../spec/logseq.md', import.meta.url), 'utf8'));
  assert.ok(tests.length > 100, 'the recorded examples are there');
  for (const t of tests) {
    assert.equal(t.options.editor, 'logseq', `${t.name}: declares editor: logseq`);
    for (const b of [t.initial.buffer, ...t.steps.flatMap((s) => (s.expect.buffer === undefined ? [] : [s.expect.buffer]))]) {
      const again = draw(unescape(readOutline(b, true)));
      assert.equal(again.replace(/→/g, '\t'), b.replace(/→/g, '\t'), `${t.name}: draws back unchanged`);
    }
  }
});
