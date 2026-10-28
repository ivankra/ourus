// The drop pass (`drops.ts`) over the whole spec: every pickup's every place dropped, with no gap but
// at the known starts, each a writer's or a rule's to close. A new one fails, and so does a known one
// with none now, so the list only shrinks.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allDropGaps, KNOWN } from './drops.ts';

test('every drop a pickup lists is a refusal or a result, but at the known starts', () => {
  const gaps = allDropGaps();
  const found = [...gaps].filter(([name]) => !(name in KNOWN)).map(([name, list]) => `${name}: ${list.join('; ')}`);
  const fixed = Object.keys(KNOWN).filter((name) => !gaps.has(name));
  assert.deepEqual(found, [], 'starts whose drops have gaps');
  assert.deepEqual(fixed, [], 'known starts with no gap now: drop them from KNOWN');
});
