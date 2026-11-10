// The tab pass (`tabs.ts`) over the whole spec: every example plays back with its indentation in
// tabs, but the known ones, each a writer's tab path to write. A new one fails, and so does a known
// one that plays back now, so the list only shrinks.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tabPass } from './tabs.ts';
import { readSpecFile, specFiles } from './lib/index.ts';

/** The examples that don't play back with tabs yet, and why: the writer's tab paths not written. */
const KNOWN: Readonly<Record<string, string>> = {
  // a lazy line's own tab, kept by the text speller where the line moves off its stop: what follows it
  // escaped (`\- g`), the same document spelled otherwise
  Quote87: "a lazy line's tab, kept where its text is spelled again",
  // a tab-led lazy line in an item the writer lines up further left, its text the whole line: past
  // the content column it has then, its tab would span less (B382, B162 with spaces)
  Regression328: "a tab-led lazy line in an item shifted left, past its content column",
  Regression329: "a tab-led lazy line in an item shifted left, past its content column",
  // a paragraph's later line led by a tab past its item's content, the item shifted: the tab spans by
  // the column it lands at, so the line, a marker after it, could start a block (B383 with spaces)
  Regression331: "a tab-led continuation line, a marker after it, under a shift",
};

test('every example plays back with its indentation in tabs, but the known ones', () => {
  const failed: string[] = [];
  const fixed: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      const why = tabPass(t);
      if (why && !(t.name in KNOWN)) failed.push(`${t.name}: ${why}`);
      if (!why && t.name in KNOWN) fixed.push(t.name);
    }
  }
  assert.deepEqual(failed, [], 'examples that no longer play back with tabs');
  assert.deepEqual(fixed, [], 'known examples that play back now: drop them from KNOWN');
});
