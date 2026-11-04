// A small slice of the generated-notes reports (README.md): a command that throws, or a report that
// can't finish, fails `npm test`. The counts are the reports' own (`npm run test:heavy`), held to their
// baselines on their full corpora.

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);
const here = resolve(import.meta.dirname, '..');
const SMALL: readonly (readonly [string, Record<string, string>])[] = [
  ['test/sweep.ts', { SWEEP_GENERATED: '3' }],
  ['test/sessions.ts', { SESSIONS: '60' }],
  ['test/conserve.ts', { CONSERVE_GENERATED: '3' }],
];

for (const [script, env] of SMALL) {
  test(`${script} on a few notes: nothing throws`, async () => {
    // (a different corpus than the baseline's: its counts aren't compared, only the throws, which fail the run)
    const { stdout } = await run('node', [script], { cwd: here, env: { ...process.env, ...env }, maxBuffer: 1 << 26 }).catch((e: { stdout?: string }) => {
      assert.fail(`${script} failed:\n${(e.stdout ?? '').split('\n').filter((l) => l.startsWith('FAIL')).slice(0, 5).join('\n')}`);
    });
    assert.match(stdout, /^\d+ (runs|sessions)/m);
  });
}
