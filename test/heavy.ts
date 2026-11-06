// The full run, `npm test`, against a frozen copy of the working tree, so editing can go on while it
// runs: the typecheck (`npm run typecheck`: the sources, the tests and the demos) and the fast suite (`npm run test:fast`) first and alone, as its
// timing tests fail on a busy machine;
// then the others at once: the view pass, the inverse pairs (and the same corpus played by the last commit's code,
// so a change's round trips are told from the corpus's), the differential run against the last
// commit, the generated-notes checks (conserve, sweep, sessions), the public API at a note's extremes
// (extremes) and the open bugs (bugs). The suites run side by side
// (each its own process; the view pass and the differential run spread their work over the cores
// themselves). Each report goes to a file in the run's directory; a
// summary is printed.
//
//   node test/heavy.ts            # every suite
//   node test/heavy.ts view diff  # some: types, fast, view, inverse, diff, conserve, sweep, sessions, extremes, bugs
//   TEST_BASE_REV=<ref> node test/heavy.ts  # against another commit than the last

import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const asked = process.argv.slice(2);
const suites = asked.length ? asked : ['types', 'fast', 'view', 'inverse', 'diff', 'conserve', 'sweep', 'sessions', 'extremes', 'bugs'];
const run = mkdtempSync(join(tmpdir(), 'ourus-heavy-'));
const base = process.env.TEST_BASE_REV ?? 'HEAD';

/** Whether the spec's notation changed since `base` (its reader, `test/lib/spec-reader.ts` and `test/lib/drawn-states.ts`): the base's harness can't read the working tree's corpus then. */
const notationChanged = (): boolean => {
  try {
    execFileSync('git', ['diff', '--quiet', base, '--', 'test/lib/spec-reader.ts', 'test/lib/drawn-states.ts'], { cwd: here });
    return false;
  } catch {
    return true;
  }
};

/** Whether the harness in `root` reads the corpus there: not where a case sets an option its `src/` doesn't have (one renamed since). */
const readable = (root: string): boolean => {
  try {
    execFileSync('node', ['--input-type=module', '-e', "import { readSpecFile, specFiles } from './test/lib/index.ts'; for (const f of specFiles()) readSpecFile(f);"], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/**
 * A copy of the tree at `to`: the working tree's files (but `.git` and every `node_modules`); where
 * `head`, `src/` the last commit's, with the harness written for it (`test/`, `sxs/`), so a change of
 * the API between them plays each with its own: the corpus (`spec/`) the working tree's, but where
 * its notation changed since, or the base's harness can't read it, the base's own (the cases as its
 * reader reads them).
 */
function copy(to: string, head: boolean): string {
  cpSync(here, to, { recursive: true, filter: (from) => !/^\.git(?:\/|$)|(?:^|\/)node_modules(?:\/|$)/.test(relative(here, from)) });
  symlinkSync(join(here, 'node_modules'), join(to, 'node_modules'));
  if (head) {
    const extract = (dirs: string[]): void => {
      for (const dir of dirs) execFileSync('rm', ['-rf', join(to, dir)]);
      execFileSync('tar', ['-x', '-C', to], { input: execFileSync('git', ['archive', base, ...dirs], { cwd: here, maxBuffer: 1 << 28 }) });
    };
    extract(['src', 'test', 'sxs']);
    if (notationChanged() || !readable(to)) extract(['spec']);
  }
  return to;
}

const now = copy(join(run, 'now'), false);
const head = suites.some((s) => s === 'inverse' || s === 'diff') ? copy(join(run, 'head'), true) : null;

/** Runs `script` in `root`, its report to `report`: whether it passed. */
function play(root: string, script: string, args: readonly string[], report: string, env: Record<string, string> = {}, command = 'node'): Promise<boolean> {
  return new Promise((done) => {
    const child = spawn(command, [script, ...args], { cwd: root, env: { ...process.env, ...env } });
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
  // (the typecheck, in the copy, its `node_modules` the working tree's: the sources and tests, and every
  // demo, which hosts the API as a host would, `npm run typecheck`)
  if (name === 'types') return `types: ${(await play(now, 'run', ['typecheck'], 'types.txt', {}, 'npm')) ? 'pass' : 'FAIL'} (types.txt)`;
  if (name === 'fast') return `fast: ${(await play(now, '--test', ['test/*.test.ts', 'test/*/*.test.ts', 'sxs/*/*.test.ts'], 'fast.txt')) ? 'pass' : 'FAIL'} (fast.txt)`;
  if (name === 'view') return `view: ${(await play(now, 'test/view-exhaustive.ts', [], 'view.txt')) ? 'pass' : 'FAIL'} (view.txt)`;
  if (name === 'inverse') {
    // (both play the same corpus: the generated notes only where the last commit's harness has them too)
    const generated: Record<string, string> = ['test/lib/generated-notes.ts', 'test/generated.ts'].some((file) => existsSync(join(head!, file))) ? {} : { INVERSE_GENERATED: '0' };
    const [ok] = await Promise.all([
      play(now, 'test/inverse.ts', [], 'inverse.txt', { INVERSE_DUMP: join(run, 'inverse-now.dump'), ...generated }),
      play(head!, 'test/inverse.ts', [], 'inverse-head.txt', { INVERSE_DUMP: join(run, 'inverse-head.dump'), ...generated }),
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
    // (a run failing in both copies is a known bug, test/bugs.ts's; one the old copy writes is new)
    const regressions = /^(\d+) runs fail to write that the old copy writes/m.exec(report)?.[1] ?? '0';
    const same = /^no differences$/m.test(report);
    return `diff: ${regressions === '0' ? 'pass' : 'FAIL'}, ${regressions} regressions, ${fails} runs fail to write; ${same ? 'no outcome moved' : 'outcomes moved, each to judge'} (diff.txt)`;
  }
  // (the generated-notes checks: each held to its baseline on its own corpus)
  if (name === 'conserve' || name === 'sweep' || name === 'sessions' || name === 'extremes' || name === 'bugs') return `${name}: ${(await play(now, `test/${name}.ts`, [], `${name}.txt`)) ? 'pass' : 'FAIL'} (${name}.txt)`;
  return `no suite "${name}": types, fast, view, inverse, diff, conserve, sweep, sessions, bugs`;
};
const lines: string[] = [];
const report = (line: string): void => {
  console.log(line);
  lines.push(line);
};
for (const first of ['types', 'fast']) if (suites.includes(first)) report(await suite(first));
for (const line of await Promise.all(suites.filter((name) => name !== 'types' && name !== 'fast').map(suite))) report(line);
process.exitCode = lines.some((line) => /: FAIL|^no suite/.test(line)) ? 1 : 0;
