// The heavy suites at once, against a frozen copy of the working tree, so editing can go on while
// they run: the view pass, the inverse pairs (and the same corpus played by the last commit's code,
// so a change's round trips are told from the corpus's), and the differential run against the last
// commit. Each report goes to a file in the run's directory; a summary is printed.
//
//   node test/heavy.ts            # every suite
//   node test/heavy.ts view diff  # some: view, inverse, diff

import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const asked = process.argv.slice(2);
const suites = asked.length ? asked : ['view', 'inverse', 'diff'];
const run = mkdtempSync(join(tmpdir(), 'ourus-heavy-'));

/** A copy of the tree at `to`: the working tree's files (but `.git` and every `node_modules`), `src/` the last commit's where `head`. */
function copy(to: string, head: boolean): string {
  cpSync(here, to, { recursive: true, filter: (from) => !/^\.git(?:\/|$)|(?:^|\/)node_modules(?:\/|$)/.test(relative(here, from)) });
  if (head) {
    execFileSync('rm', ['-rf', join(to, 'src')]);
    execFileSync('tar', ['-x', '-C', to], { input: execFileSync('git', ['archive', 'HEAD', 'src'], { cwd: here, maxBuffer: 1 << 28 }) });
  }
  symlinkSync(join(here, 'node_modules'), join(to, 'node_modules'));
  return to;
}

const now = copy(join(run, 'now'), false);
const head = suites.some((s) => s === 'inverse' || s === 'diff') ? copy(join(run, 'head'), true) : null;

/** Runs `script` in `root`, its report to `report`: whether it passed. */
function play(root: string, script: string, args: readonly string[], report: string, env: Record<string, string> = {}): boolean {
  const out = spawnSync('node', [script, ...args], { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 1 << 30 });
  writeFileSync(join(run, report), out.stdout + out.stderr);
  return out.status === 0;
}

/** The lines of `a` not in `b`. */
const added = (a: string, b: string): string[] => {
  const old = new Set(readFileSync(b, 'utf8').split('\n'));
  return readFileSync(a, 'utf8').split('\n').filter((l) => l && !old.has(l));
};

console.log(`heavy suites in ${run}`);
for (const suite of suites) {
  if (suite === 'view') console.log(`view: ${play(now, 'test/view-exhaustive.ts', [], 'view.txt') ? 'pass' : 'FAIL'} (view.txt)`);
  else if (suite === 'inverse') {
    const ok = play(now, 'test/inverse.ts', [], 'inverse.txt', { INVERSE_DUMP: join(run, 'inverse-now.dump') });
    play(head!, 'test/inverse.ts', [], 'inverse-head.txt', { INVERSE_DUMP: join(run, 'inverse-head.dump') });
    // (the round trips that don't come back with the tree's code, but do with the last commit's, on the same corpus)
    const gained = added(join(run, 'inverse-now.dump'), join(run, 'inverse-head.dump'));
    writeFileSync(join(run, 'inverse-gained.txt'), gained.join('\n') + '\n');
    console.log(`inverse: ${ok ? 'pass' : 'FAIL'} (inverse.txt); ${gained.length} round trips gained against the last commit's code (inverse-gained.txt)`);
  } else if (suite === 'diff') {
    // (it exits 1 wherever an outcome moved, by design: what fails is a run that fails to write)
    const same = play(now, 'test/differential.ts', [head!, now], 'diff.txt', { DIFF_DUMP: join(run, 'diff-failed.jsonl') });
    const fails = /^(\d+) runs fail to write in /m.exec(readFileSync(join(run, 'diff.txt'), 'utf8'))?.[1] ?? '?';
    console.log(`diff: ${fails === '0' ? 'pass' : 'FAIL'}, ${fails} runs fail to write; ${same ? 'no outcome moved' : 'outcomes moved, each to judge'} (diff.txt)`);
  } else console.log(`no suite "${suite}": view, inverse, diff`);
}
