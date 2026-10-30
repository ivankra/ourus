// The heavy suites at once, against a frozen copy of the working tree, so editing can go on while
// they run: the view pass, the inverse pairs (and the same corpus played by the last commit's code,
// so a change's round trips are told from the corpus's), and the differential run against the last
// commit. The suites run side by side (each its own process; the view pass and the differential run
// spread their work over the cores themselves). Each report goes to a file in the run's directory; a
// summary is printed.
//
//   node test/heavy.ts            # every suite
//   node test/heavy.ts view diff  # some: view, inverse, diff

import { execFileSync, spawn } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const asked = process.argv.slice(2);
const suites = asked.length ? asked : ['view', 'inverse', 'diff'];
const run = mkdtempSync(join(tmpdir(), 'ourus-heavy-'));

/**
 * A copy of the tree at `to`: the working tree's files (but `.git` and every `node_modules`); where
 * `head`, `src/` the last commit's, with the harness written for it (`test/`, `sxs/`), so a change of
 * the API between them plays each with its own: the corpus (`spec/`) the working tree's.
 */
function copy(to: string, head: boolean): string {
  cpSync(here, to, { recursive: true, filter: (from) => !/^\.git(?:\/|$)|(?:^|\/)node_modules(?:\/|$)/.test(relative(here, from)) });
  if (head) {
    for (const dir of ['src', 'test', 'sxs']) execFileSync('rm', ['-rf', join(to, dir)]);
    execFileSync('tar', ['-x', '-C', to], { input: execFileSync('git', ['archive', 'HEAD', 'src', 'test', 'sxs'], { cwd: here, maxBuffer: 1 << 28 }) });
  }
  symlinkSync(join(here, 'node_modules'), join(to, 'node_modules'));
  return to;
}

const now = copy(join(run, 'now'), false);
const head = suites.some((s) => s === 'inverse' || s === 'diff') ? copy(join(run, 'head'), true) : null;

/** Runs `script` in `root`, its report to `report`: whether it passed. */
function play(root: string, script: string, args: readonly string[], report: string, env: Record<string, string> = {}): Promise<boolean> {
  return new Promise((done) => {
    const child = spawn('node', [script, ...args], { cwd: root, env: { ...process.env, ...env } });
    const out: Buffer[] = [];
    child.stdout.on('data', (b: Buffer) => out.push(b));
    child.stderr.on('data', (b: Buffer) => out.push(b));
    child.on('close', (status) => {
      writeFileSync(join(run, report), Buffer.concat(out));
      done(status === 0);
    });
  });
}

/** The lines of `a` not in `b`. */
const added = (a: string, b: string): string[] => {
  const old = new Set(readFileSync(b, 'utf8').split('\n'));
  return readFileSync(a, 'utf8').split('\n').filter((l) => l && !old.has(l));
};

console.log(`heavy suites in ${run}`);
/** Each suite, run: the line it reports. */
const suite = async (name: string): Promise<string> => {
  if (name === 'view') return `view: ${(await play(now, 'test/view-exhaustive.ts', [], 'view.txt')) ? 'pass' : 'FAIL'} (view.txt)`;
  if (name === 'inverse') {
    const [ok] = await Promise.all([
      play(now, 'test/inverse.ts', [], 'inverse.txt', { INVERSE_DUMP: join(run, 'inverse-now.dump') }),
      play(head!, 'test/inverse.ts', [], 'inverse-head.txt', { INVERSE_DUMP: join(run, 'inverse-head.dump') }),
    ]);
    // (the round trips that don't come back with the tree's code, but do with the last commit's, on the same corpus)
    const gained = added(join(run, 'inverse-now.dump'), join(run, 'inverse-head.dump'));
    writeFileSync(join(run, 'inverse-gained.txt'), gained.join('\n') + '\n');
    return `inverse: ${ok ? 'pass' : 'FAIL'} (inverse.txt); ${gained.length} round trips gained against the last commit's code (inverse-gained.txt)`;
  }
  if (name === 'diff') {
    // (it exits 1 where an outcome moved or a run fails to write: which, its report says)
    await play(now, 'test/differential.ts', [head!, now], 'diff.txt', { DIFF_DUMP: join(run, 'diff-failed.jsonl') });
    const report = readFileSync(join(run, 'diff.txt'), 'utf8');
    // (a run that didn't finish, a worker crashed, has no summary: a failure, whatever it printed before)
    if (!/^\d+ command runs on /m.test(report) || !/^\d+ runs fail to write in /m.test(report)) return 'diff: FAIL, the run did not finish (diff.txt)';
    const fails = /^(\d+) runs fail to write in /m.exec(report)![1];
    const same = /^no differences$/m.test(report);
    return `diff: ${fails === '0' ? 'pass' : 'FAIL'}, ${fails} runs fail to write; ${same ? 'no outcome moved' : 'outcomes moved, each to judge'} (diff.txt)`;
  }
  return `no suite "${name}": view, inverse, diff`;
};
for (const line of await Promise.all(suites.map(suite))) console.log(line);
