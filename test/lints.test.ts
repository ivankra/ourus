// Lints over ourus's sources: what reviews found one at a time (B281, B317: an array spread into a call
// past JavaScript's limit on arguments), checked once for all. The public API at a note's extremes, the
// other half, is `test/extremes.ts`, in the full run (it takes seconds).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { codeOnly, lineAt, sourceFiles, spreadArguments } from './lib/source-scan.ts';

test('no array is spread into a call\'s arguments but one said bounded: `pushAll`, `spliceIn` and `largest` take any number', () => {
  const unbounded: string[] = [];
  for (const { path, text } of sourceFiles()) {
    const lines = text.split('\n');
    for (const at of spreadArguments(codeOnly(text))) {
      const line = lineAt(text, at);
      // (a reason on its line or the one above: `(bounded: an entity's code points, one or two)`)
      if (!/\(bounded: /.test(`${lines[line - 2] ?? ''}\n${lines[line - 1]}`)) unbounded.push(`src/${path}:${line}: ${lines[line - 1]!.trim()}`);
    }
  }
  assert.deepEqual(unbounded, []);
});
