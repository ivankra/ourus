// The tab pass (`tabs.ts`) over the whole spec: every example plays back with its indentation in
// tabs, but the known ones, each a writer's tab path to write. A new one fails, and so does a known
// one that plays back now, so the list only shrinks.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tabPass } from './tabs.ts';
import { readSpecFile, specFiles } from './specfile.ts';

/** The examples that don't play back with tabs yet, and why: the writer's tab paths not written. */
const KNOWN: Readonly<Record<string, string>> = {
  // a marker written over a line's whitespace that a tab spelled (`writeOver`)
  Quote81: "a marker's line written over a tab",
  Quote85: "a marker's line written over a tab",
  // a lazy line's own tab, kept by the text speller where the line moves off its stop: what follows it
  // escaped (`\- g`), the same document spelled otherwise
  Quote87: "a lazy line's tab, kept where its text is spelled again",
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
