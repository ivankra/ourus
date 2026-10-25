#!/usr/bin/env node
/// <reference lib="dom" />
// Replays the spec (spec/*.md) in another app, headless, and reports where it agrees with ourus.
//
//   node sxs/run.ts <app> [selector...] [options]     (or: npm run sxs -- <app> ...)
//   node sxs/run.ts <app>,<app>... [selector...] [options]
//   node sxs/run.ts all [selector...] [options]     (all: also when no app is given)
//
// <app> is a directory here with a driver.ts (sxs/logseq/), or its two capitals (LO); several,
// comma-separated, a group (block, text, outliners, free), `-` before one leaving it out
// (all,-RN,-RB): lib/apps.ts. A selector picks tests: a
// file (`indent.md`, `indent`), one test (`indent.md#indent3`), or any part of a test's ID
// (`Indent3`, `Indent`); none runs them all. Several apps, or `all` of them, run side by
// side, a run of this for each, and their verdicts come out as one table ("several apps", below).
//
//   -v, --verbose   print every test's verdict, not only the disagreements, and every URL the proxy saw
//   --strict        only examples that are original outlines (no paragraph, blank line, ... adapted)
//   --repeat=N      run each example N times and report the ones whose outcome varies
//   --list          print what would run and what is skipped, and stop (no browser)
//   --headed        show the browser
//   --slow=MS       pause after every action, on top of settling (to watch, or to rule timing out)
//   --cache=MODE    how the proxy uses its cache: use (the default: serve what it has, fetch and keep the
//                   rest), offline (serve only what it has, reach no network, write nothing: a miss fails),
//                   refresh (fetch anew, once per proxy run, and keep)
//   --fresh         load the app anew, rather than take over the page a run that died left loaded
//   --keep-windows  leave the app's window loaded when the run ends, for the next run to take over
//                   (probe.ts's); by default it closes
//   --no-report     don't copy the report into <app>.md (a run of every test does by default)
//   --json=FILE     write the run as data to FILE too, as .sxs/results/<app>/sxs.json has it
//   --pace=MS       keys at least MS apart (100, a typist's pace; 0: as fast as the app settles)
//   --workers=N     N workers side by side (by default one per 30 examples, at most one per browser of the pool, and the driver's `parallel`)
//   --rejudge       run no app: replay ourus on every case, judge what the app did in its last run
//                   against the spec as it is now, and write the report (and with several apps, the
//                   table) again ("regenerating", below); what wants a run of the app is "Not run"
//   --timing        print how long the app took to settle after each action, and what kept it busy
//   --probe=FILE    play the cases of a spec-format file anywhere, and write the run to --json's file
//                   alone, no results kept, no report (sxs/probe.ts runs it so, an app a process)
//   --plain-clipboard  give the app the clipboard's text/plain alone, without the case's text/html
//   --compare[=REF] run no app: set the current judgment (each app's sxs.json) beside the one committed
//                   at REF in .sxs (HEAD by default), case by case (lib/compare.ts); -v lists what got better
//   -h, --help      print this and stop; an option not listed here is an error, never a run
//
//   node sxs/run.ts --stop    stops the shared proxy and browsers, and the servers drivers started
//
// The proxy, a pool of headless Chromiums and the app's loaded page (a window of one of them) are
// shared between runs (lib/browser.ts): started by the first run that needs them and left running. Each test starts from a fresh document
// in the loaded app. After every key the runner waits for the app to settle (lib/idle.ts) rather than
// for a fixed time.

import { spawn } from 'node:child_process';
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser, Page } from 'playwright-core';
import { Config } from '../src/config.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { drawOutline, nodesOf } from '../test/drawing.ts';
import { appPage, BROWSERS, ensureProxy, launch, lockApp, proxyStats, stopShared, type AppPage } from './lib/browser.ts';
import { clipboardHtml } from './lib/clipboard.ts';
import type { Doc, Driver, Session } from './lib/driver.ts';
import { idleVersion, installIdle, type IdleOptions, type IdleResult } from './lib/idle.ts';
import { LOGIN_EXIT, LoginRequired } from './lib/login.ts';
import { compareOutlines, draw, project, readOutline, sameOutline, type Outline, type Verdict } from './lib/block.ts';
import { compareTexts, drawTextDoc, readTextDoc, sameText, type TextDoc } from './lib/text.ts';
import { adapt, allTests, fileOf, selects, type Plan, type PlanStep } from './lib/plan.ts';
import { compareJudgments } from './lib/compare.ts';
import { appDirs, appNames, resolveApps } from './lib/apps.ts';
import { canonicalClipboard, passes } from '../test/spec-run.ts';
import { RANKS, readSpec, TAGS, type Clipboard } from '../test/specfile.ts';
import { cacheDir, cacheMode } from './proxy.ts';

const started = Date.now();
const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(name);
const option = (name: string): string | undefined => args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
// --help: the usage at the top of this file; an option it doesn't list stops the run, rather than
// being taken for nothing (a mistyped option then ran every app on every case)
if (flag('--help') || flag('-h')) {
  const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
  const usage = lines.slice(1, lines.findIndex((line, i) => i > 0 && !line.startsWith('//')));
  console.log(usage.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const FLAGS = ['-v', '--verbose', '--strict', '--ignore-options', '--list', '--headed', '--fresh', '--keep-windows', '--no-report', '--rejudge', '--timing', '--plain-clipboard', '--compare', '--stop'];
const OPTIONS = ['--repeat', '--slow', '--cache', '--json', '--pace', '--workers', '--probe', '--compare'];
const unknown = args.filter((a) => a.startsWith('-') && !FLAGS.includes(a) && !OPTIONS.some((o) => a.startsWith(`${o}=`)));
if (unknown.length) {
  console.error(`no such option: ${unknown.join(', ')} (--help lists them)`);
  process.exit(2);
}
// no app given: every app (`--rejudge` alone judges them all again); else the apps it names, by
// directory or two capitals, a group, `-` before one leaving it out (lib/apps.ts)
const [named = 'all', ...selectors] = args.filter((a) => !a.startsWith('-'));
const picked = named === 'all' ? null : await resolveApps(named);
if (picked && (picked.unknown.length || !picked.apps.length)) {
  console.error(`${picked.unknown.length ? `no such app: ${picked.unknown.join(', ')}` : picked.ourus ? 'ourus plays in every run: name an app' : `${named} names no app`}; name ${await appNames()}`);
  process.exit(2);
}
const app = picked === null ? 'all' : picked.apps.join(',');
/** A run of some of the examples (selectors, `--strict` or `--ignore-options`): its report and data go to `.partial` files, the full run's kept. */
const partialRun = selectors.length > 0 || flag('--strict') || flag('--ignore-options');
if (flag('--stop')) {
  await stopShared((line) => console.log(line));
  process.exit(0);
}
// ------------------------------------------------------------------ several apps
//
// Several apps (`logseq,dynalist`, or `all`) run side by side: a run of this for each, in a process
// of its own (so the apps in browsers and the ones that start themselves go together), all at once,
// their workers waiting for room in the pools, and one table of every example's verdict in each app. Each run's output goes
// to `.sxs/<app>/sxs.log`, beside its report and run as data. The table is printed (every row for a few
// examples or with -v, else the rows where the apps don't all agree), and written to `.sxs/results/README.md`,
// with its heatmap, linking each app's report there (`<app>.md`); for every app on the whole spec,
// here too.

const here = fileURLToPath(new URL('./', import.meta.url));
/**
 * What the last run of an app left, not checked in: its report and run as data in the app's results,
 * `.sxs/results/<app>/sxs.{md,json}`, or for a run of some of the examples (selectors, `--strict`),
 * `sxs.partial.{md,json}`, the full run's left as they were; its output in the app's directory,
 * `.sxs/<app>/sxs.log`.
 */
const lastRun = (app: string, ext: 'md' | 'json' | 'log', partial = false): string =>
  ext === 'log'
    ? join(cacheDir, app, 'sxs.log')
    : ext === 'md'
      ? join(resultsRoot, `${app}${partial ? '.partial' : ''}.md`)
      : join(resultsDir(app), `sxs${partial ? '.partial' : ''}.json`);
/**
 * The results in `.sxs/`, as `sxs/` has its checked-in ones: the last table (`README.md`, `heatmap.svg`),
 * each app's report (`<app>.md`), and each app's run as data (`<app>/`: its last run, `sxs.json`, and each
 * spec file's, `<file>.json`).
 */
const resultsRoot = join(cacheDir, 'results');
const resultsDir = (app: string): string => join(resultsRoot, app);
/**
 * A report or table written for `sxs/`, as it reads in `.sxs/results/`, one directory deeper: each
 * relative link out of it (`../spec/`) one `../` more; its links within (an app's report
 * from the table) hold as they are.
 */
const inResults = (md: string): string => md.replace(/(\]\(|href=")\.\.\//g, '$1../../');

/**
 * What an app did in a spec file's examples, as the last run of every one of them left it
 * (`.sxs/results/<app>/<file>.json`, `indent.json` for `indent.md`); a run of some of a file's examples
 * writes them alone to `<file>.partial.json`, and the file's own stays as it was. A regenerated report
 * is made from the files' own (a run's, `sxs.json`, from what it ran).
 */
interface FileRun {
  type: 'SxS';
  app: string;
  file: string;
  /** Its latest run's: the app's version, the command, how long it took, and when it ran. */
  version: string | null;
  command: string;
  elapsed_s: number;
  ran: string;
  examples: RunExample[];
}
const fileRun = (app: string, file: string, partial = false): string => join(resultsDir(app), `${file.replace(/\.md$/, '')}${partial ? '.partial' : ''}.json`);

/**
 * A run as data: what its report says, and what the app did in each example, every state drawn as
 * the spec draws a buffer. Every run writes it beside its report (`.sxs/results/<app>/sxs.json`); a run of
 * several apps reads each run's there.
 */
interface AppRun {
  type: 'SxS';
  app: string;
  title: string;
  version: string | null;
  url: string;
  model: Driver['model'];
  command: string;
  elapsed_s: number;
  /** The workers it ran with (`--workers`): its time over one worker's is about this many. */
  workers?: number;
  /** How many examples came out each way, skipped and in all; a block app's original and adapted ones apart too. */
  summary: Counts & { skipped: number; original?: Counts; adapted?: Counts };
  /** The examples run, in the spec's order. */
  examples: RunExample[];
  /** The examples skipped, in the spec's order, each with why. */
  skipped: { name: string; file: string; anchor: string; line: number; reason: string }[];
  /** A regenerated report's examples its last run didn't play as the spec now has them, each with why: they want a run. */
  notRun?: { name: string; file: string; anchor: string; line: number; reason: string }[];
}

/** A count per verdict, and the total. */
type Counts = Record<(typeof VERDICTS)[number] | 'total', number>;

/** An example as it ran. */
interface RunExample {
  /** Its ID, `Indent1`; its spec file, the anchor of its heading there, the line of its first block. */
  name: string;
  file: string;
  anchor: string;
  line: number;
  verdict: Verdict | 'error';
  /** The step the verdict is about (the first that came out so), where it isn't `agree`. */
  step?: number;
  /** What its buffers lost or had reinterpreted on blocks (lib/block.ts); none for an original outline, and a text app's. */
  adapted: string[];
  /** Its options as the spec sets them (the file's frontmatter, then its config block). */
  options: Record<string, string>;
  /** Where repeated runs (`--repeat`) didn't come out the same: the first that differed. */
  flaky?: string;
  error?: string;
  /** Actions after which the app didn't settle in time, and what was pending. */
  unsettled?: string[];
  /**
   * The clipboard it starts with, each format the app was given. A run before the clipboard had formats
   * kept its text alone (a string), the app given its HTML rendering too where it had structure
   * (lib/clipboard.ts): `startClipboard` reads it back so.
   */
  clipboard: Clipboard | string | null;
  /** Its start as the app was given it (onto blocks, for a block app); `written`, the spec's drawing, where that differs. */
  start: string;
  written?: string;
  steps: RunStep[];
}

/**
 * A step of an example: its actions, then the state ourus has after them and the app's, each as its
 * model has it (`app` null where the step draws no buffer, or wasn't reached).
 */
interface RunStep {
  /** The line of its quote in the spec file. */
  line: number;
  actions: string[];
  /** None where there is nothing to compare, or it wasn't reached. */
  verdict?: Verdict;
  ourus: string | null;
  app: string | null;
  /** A text app's state projected onto blocks as a block app's is drawn, to set beside one (null where it has none). */
  blocks?: string | null;
  /** The spec's drawing of `ourus`, where that differs. */
  written?: string;
  /** Why the expected caret isn't compared (it has no place in a block). */
  caretLost?: string;
  clipboard?: { ourus: string; app: string | null };
}

/** Every app: a directory here with a driver (lib/apps.ts). */
const allApps = appDirs;

const VERDICTS = ['agree', 'caret', 'whitespace', 'disagree', 'error'] as const;
/** A verdict in the table: printed, and in Markdown. */
const CELL: Record<string, [string, string]> = {
  agree: ['ok', '✓'],
  caret: ['C', 'C'],
  whitespace: ['S', 'S'],
  disagree: ['D', '✗'],
  error: ['ERROR', 'E'],
  skipped: ['-', ''],
  missing: ['?', '?'],
};

/** The anchor of an example's heading in its spec file (as run.ts's report links it). */
const anchor = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

/**
 * How many workers each app's run gets (`--workers`), and its examples: as many as it can use, as a run
 * of the app alone takes (one per 30 examples, at most one per browser of the pool, `BROWSERS`, never more than its driver allows,
 * `Driver.parallel`); `--workers` given, every app's (within its driver's limit).
 */
async function workersOf(apps: string[], selectors: string[], pass: string[]): Promise<Map<string, { workers: number; examples: number }>> {
  const asked = pass.find((f) => f.startsWith('--workers='))?.slice('--workers='.length);
  const tests = allTests().filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t)));
  return new Map(
    await Promise.all(
      apps.map(async (app) => {
        const d = ((await import(`./${app}/driver.ts`)) as { driver: Driver }).driver;
        // its examples this run, adapted as its run will adapt them (no browser)
        const examples = new Set(
          tests
            .map((t) => adapt(d, t, { ignoreOptions: pass.includes('--ignore-options'), plainClipboard: pass.includes('--plain-clipboard') }))
            .flatMap((a) => ('plan' in a && !(pass.includes('--strict') && a.plan.notes.length) ? [a.plan.key] : [])),
        ).size;
        const most = Math.min(d.parallel ?? (d.launch ? 1 : BROWSERS), BROWSERS, Math.max(1, examples));
        const workers = asked !== undefined ? Math.max(1, Math.min(most, Number(asked) || 1)) : Math.max(1, Math.min(most, Math.ceil(examples / 30)));
        return [app, { workers, examples }] as const;
      }),
    ),
  );
}

async function runMany(spec: string, selectors: string[], flags: string[]): Promise<number> {
  const say = (line: string): void => console.log(line);
  let apps = spec === 'all' ? allApps() : spec.split(',').filter(Boolean);
  const unknown = apps.filter((a) => !existsSync(join(here, a, 'driver.ts')));
  if (unknown.length || !apps.length) {
    console.error(`no such app: ${unknown.join(', ') || spec}; the apps are ${allApps().join(', ')}`);
    return 2;
  }
  const pass = flags.filter((f) => !f.startsWith('--json='));
  // every app's run of some examples (selectors, `--strict`): their `.partial` data, a `.partial` table
  const partial = selectors.length > 0 || pass.includes('--strict') || pass.includes('--ignore-options');
  const verbose = pass.includes('-v') || pass.includes('--verbose');
  const regenerating = pass.includes('--rejudge');
  const t0 = Date.now();
  const exits = new Map<string, number>();
  const failed = new Set<string>();

  // the proxy, up before the runs that share it, so they don't race to start it (each app has a browser of its own)
  if (!pass.includes('--list') && !regenerating) await ensureProxy(cacheMode(pass), say);

  // Obsidian's instances fewer with apps of the pool's browsers beside them, the two pools, full, under
  // the container's cap on tasks (`obsidian/obsidian.ts`); the apps' runs have it from here
  const drivers = new Map(await Promise.all(apps.map(async (a) => [a, ((await import(`./${a}/driver.ts`)) as { driver: Driver }).driver] as const)));
  if ([...drivers.values()].some((d) => !d.launch)) process.env.OURUS_SXS_OBSIDIANS ??= '2';
  const plan = await workersOf(apps, selectors, pass);
  say(`${apps.length} apps at once: ${apps.map((a) => `${a}${plan.get(a)!.workers > 1 ? ` ×${plan.get(a)!.workers}` : ''}`).join(', ')}`);
  const one = async (app: string): Promise<void> => {
    const log = lastRun(app, 'log');
    const json = lastRun(app, 'json', partial);
    mkdirSync(join(log, '..'), { recursive: true });
    // the run's own data, written anew: none since it started, and it failed (what it had, the files' keep)
    const since = Date.now();
    const out = openSync(log, 'w');
    // the app's workers (`--workers` given, every app's)
    const workers = pass.some((f) => f.startsWith('--workers=')) ? [] : [`--workers=${plan.get(app)!.workers}`];
    const child = spawn(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url), app, ...selectors, ...pass, ...workers], { stdio: ['ignore', out, out] });
    const code = await new Promise<number>((resolve) => child.on('exit', (c) => resolve(c ?? 1)));
    closeSync(out);
    exits.set(app, code);
    const r = existsSync(json) && statSync(json).mtimeMs >= since ? read(json) : null;
    if (!r) failed.add(app);
    const s = (Date.now() - t0) / 1000;
    if (pass.includes('--list')) return;
    if (!r && code === LOGIN_EXIT) say(`${app.padEnd(24)} wants a signed-in session, left out: ${relative(process.cwd(), log)} says how to give it one`);
    else if (!r && code === 0) say(`${app.padEnd(24)} no verdicts, left out: ${relative(process.cwd(), log)}`);
    else if (!r) say(`${app.padEnd(24)} failed (exit ${code}): ${relative(process.cwd(), log)}`);
    else say(`${app.padEnd(24)} ${VERDICTS.map((v) => `${v} ${r.examples.filter((e) => e.verdict === v).length}`).join(', ')}; skipped ${r.skipped.length}${r.notRun?.length ? `; not run ${r.notRun.length}` : ''}  (${r.elapsed_s}s, done at ${s.toFixed(0)}s)`);
  };
  // every app at once: its workers wait for room in the pools (`lib/browser.ts`, an app's own)
  await Promise.all(apps.map(one));
  if (pass.includes('--list')) {
    for (const app of apps) say(`\n== ${app}\n${readFileSync(lastRun(app, 'log'), 'utf8').trimEnd()}`);
    return [...exits.values()].some((c) => c !== 0) ? 1 : 0;
  }

  // the table: the examples selected, in the spec's order, and each app's verdict
  const selected = allTests().filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t)));
  const names = selected.map((t) => t.name);
  // ourus, replayed on every case selected (the table's ourus column): the apps are judged against the
  // spec's drawings, which are what ourus does where it passes them
  const fails = selected.filter((t) => !t.pending && !passes(t));
  const pending = selected.filter((t) => t.pending).length;
  say(`ourus replayed on ${selected.length} cases: ${selected.length - pending - fails.length} pass${pending ? `, ${pending} pending` : ''}${fails.length ? `; ${fails.length} fail, so the apps are judged there against drawings ourus doesn't meet: ${fails.map((t) => t.name).join(', ')}` : ''}`);
  const byApp = new Map<string, AppRun | null>(apps.map((app) => [app, failed.has(app) ? null : read(lastRun(app, 'json', partial))]));
  // an app with no verdicts (its run failed: behind a login with no session, say; or none to regenerate
  // from) is left out, not a column of `?`
  const without = apps.filter((app) => !byApp.get(app));
  if (without.length) say(`left out of the table, with no verdicts: ${without.join(', ')}`);
  apps = apps.filter((app) => byApp.get(app));
  const cell = (app: string, name: string): string => {
    const r = byApp.get(app);
    if (!r) return 'missing';
    return r.examples.find((e) => e.name === name)?.verdict ?? (r.skipped.some((e) => e.name === name) ? 'skipped' : 'missing');
  };
  // the apps by the share of their runs that agree, the most first (then by how many agree): the order
  // of every table
  const count = (app: string, verdict: string): number => names.filter((n) => cell(app, n) === verdict).length;
  const agreed = (app: string): number => count(app, 'agree') / Math.max(1, VERDICTS.reduce((n, v) => n + count(app, v), 0));
  const order = [...apps].sort((x, y) => agreed(y) - agreed(x) || count(y, 'agree') - count(x, 'agree') || x.localeCompare(y));
  // an example an app ran adapted (its buffers projected onto blocks, lib/block.ts), per app
  const adapted = (app: string, name: string): string[] => byApp.get(app)?.examples.find((e) => e.name === name)?.adapted ?? [];
  const rows = names.map((name) => ({ name, cells: order.map((app) => cell(app, name)), adapted: order.map((app) => adapted(app, name)) }));

  // printed: every row of a few, or with -v; else those where the apps don't all agree
  const shown = verbose || rows.length <= 60 ? rows : rows.filter((r) => r.cells.some((c) => c !== 'agree'));
  // a row per spec file, then its cases by their ids alone; the apps by their short ids
  const caseOf = (name: string): string => `  ${name}`;
  const width = Math.min(60, Math.max(...shown.map((r) => caseOf(r.name).length), 10));
  const clip = (s: string): string => (s.length > width ? `${s.slice(0, width - 1)}…` : s.padEnd(width));
  const heads = order.map((a) => drivers.get(a)!.shortId);
  const cols = heads.map((h) => Math.max(h.length, 5));
  say('');
  say(`${''.padEnd(width)}  ${heads.map((h, i) => h.padEnd(cols[i]!)).join('  ')}`.trimEnd());
  let file = '';
  for (const r of shown) {
    if (fileOf(r.name) !== file) say((file = fileOf(r.name)));
    say(`${clip(caseOf(r.name))}  ${r.cells.map((c, i) => CELL[c]![0].padEnd(cols[i]!)).join('  ')}`.trimEnd());
  }
  if (shown.length < rows.length) say(`(${rows.length - shown.length} test cases every app agrees on not shown; -v shows them)`);

  // written to .sxs/, beside the apps' reports; every app on the whole spec, copied beside the
  // reports checked in here too
  const everything = spec === 'all' && selectors.length === 0 && !pass.includes('--strict') && !pass.includes('--ignore-options') && !pass.includes('--no-report');
  // the run's time; a table of runs before, the longest of them (they ran side by side)
  const elapsed = regenerating ? Math.max(0, ...[...byApp.values()].map((r) => r?.elapsed_s ?? 0)) : (Date.now() - t0) / 1000;
  const command = `node sxs/run.ts ${spec}${selectors.length ? ` ${selectors.join(' ')}` : ''}`;
  // the apps by their ids in the tables, as their drivers say them
  const ids = new Map(order.map((a) => [a, drivers.get(a)!.shortId]));
  const twice = [...ids].filter(([a, id]) => [...ids].some(([b, other]) => b !== a && other === id));
  if (twice.length) throw new Error(`apps with the same id: ${twice.map(([a, id]) => `${a} ${id}`).join(', ')}`);
  const ordered = new Set(order.filter((a) => drivers.get(a)!.ordered));
  const written = matrix({ apps: order, ids, ordered, byApp, rows, command, elapsed });
  mkdirSync(resultsRoot, { recursive: true });
  // a run of some of the examples: the table and its heatmap as `.partial`, the full run's kept
  const [md, svg] = partial ? ['README.partial.md', 'heatmap.partial.svg'] : ['README.md', 'heatmap.svg'];
  const intro = readmeIntro();
  writeFileSync(join(resultsRoot, md), inResults(withIntro(partial ? written.md.replace('(heatmap.svg)', `(${svg})`) : written.md, intro.replace(/\]\((?![a-z]+:|#|\.\.\/|\/)/g, '](../sxs/'))));
  writeFileSync(join(resultsRoot, svg), written.svg);
  say(`\nwrote ${relative(process.cwd(), join(resultsRoot, md))}`);
  // an app that failed would lose its column in the table checked in: kept as it was until a run of every app works
  // (an app wanting a session isn't a failure: it has no column until it has one)
  const broken = [...exits].filter(([, c]) => c !== 0 && c !== LOGIN_EXIT).map(([a]) => a);
  if (everything && broken.length) say(`not copied to sxs/README.md: ${broken.join(', ')} failed`);
  else if (everything) {
    writeFileSync(join(here, 'README.md'), withIntro(written.md, intro));
    copyFileSync(join(resultsRoot, 'heatmap.svg'), join(here, 'heatmap.svg'));
    say(`copied it to sxs/README.md`);
  }
  return broken.length ? 1 : 0;
}

function read<T = AppRun>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

/**
 * The introduction the table goes after in `sxs/README.md`, kept as written: the README above its
 * `## Summary` (its frontmatter aside), or all of it where it has none yet.
 */
function readmeIntro(): string {
  const path = join(here, 'README.md');
  const readme = existsSync(path) ? readFileSync(path, 'utf8').replace(/^---\n[\s\S]*?\n---\n+/, '') : '# SxS\n';
  const at = readme.search(/^## Summary$/m);
  return (at < 0 ? readme : readme.slice(0, at)).trimEnd() + '\n\n';
}

/** The table's Markdown with `intro` between its frontmatter and its summary. */
const withIntro = (md: string, intro: string): string => {
  const at = md.indexOf('## Summary');
  return md.slice(0, at) + intro + md.slice(at);
};

/**
 * The table as Markdown: what ran as frontmatter, the counts per app, then a table per spec file; its
 * links are from `README.md` (here or in `.sxs/`): each app's report, `<app>.md`, the spec, `../spec/`,
 * and the heatmap beside it, `heatmap.svg`, an SVG (GitHub keeps no colors in a table's cells).
 */
function matrix(o: {
  apps: string[];
  /** Each app's two capitals (`Driver.id`), its column's heading where the summary's row has named it. */
  ids: Map<string, string>;
  /** The apps that number blocks (`Driver.ordered`), whose states are drawn so. */
  ordered: ReadonlySet<string>;
  byApp: Map<string, AppRun | null>;
  rows: { name: string; cells: string[]; adapted: string[][] }[];
  command: string;
  elapsed: number;
}): { md: string; svg: string } {
  const toReport = (app: string): string => `${app}.md`;
  const row = (cells: (string | number)[]): string => `| ${cells.join(' | ')} |`;
  // an example by its own name (not its sections'), at most 20 characters and an ellipsis
  const short = (name: string): string => ([...name].length > 20 ? `${[...name].slice(0, 20).join('').trimEnd()}…` : name);
  // the examples' table: each example, how many apps agree on it, then each app's verdict
  const count = (app: string, v: string): number => o.rows.filter((r) => r.cells[o.apps.indexOf(app)] === v).length;
  // examples a regenerated report's app hasn't run as the spec has them now, a column if any
  const columns = [...VERDICTS, 'skipped', ...(o.rows.some((r) => r.cells.includes('missing')) ? ['missing'] : [])];
  // the heatmap has ourus too, its verdict its own run of the example (a pending one disagrees)
  const tests = new Map(allTests().map((t) => [t.name, t]));
  const ours = (name: string): string => (tests.has(name) ? (passes(tests.get(name)!) ? 'agree' : 'disagree') : 'missing');
  const map = heatmap({ apps: [OURUS, ...o.apps], ids: new Map([[OURUS, 'US'], ...o.ids]), ordered: o.ordered, byApp: o.byApp, rows: o.rows.map((r) => ({ name: r.name, cells: [ours(r.name), ...r.cells], adapted: [[], ...r.adapted] })) });
  // per spec file, and per rank and tag, the disagreements: the apps' runs of its examples, the
  // disagreements among them and their share, the block apps' among them, and each app's (blank where
  // it ran none)
  const block = o.apps.map((a) => o.byApp.get(a)?.model === 'block');
  const group = (key: string, inGroup: typeof o.rows) => {
    const ran = (i: number): number => inGroup.filter((r) => (VERDICTS as readonly string[]).includes(r.cells[i]!)).length;
    const dis = (i: number): number => inGroup.filter((r) => r.cells[i] === 'disagree').length;
    return { key, cases: inGroup.length, runs: o.apps.reduce((n, _, i) => n + ran(i), 0), dis: o.apps.reduce((n, _, i) => n + dis(i), 0), blockDis: o.apps.reduce((n, _, i) => n + (block[i] ? dis(i) : 0), 0), blockRan: o.apps.reduce((n, _, i) => n + (block[i] ? ran(i) : 0), 0), apps: o.apps.map((_, i) => (ran(i) ? String(dis(i)) : '')) };
  };
  const mostFirst = (a: { dis: number; key: string }, b: { dis: number; key: string }): number => b.dis - a.dis || a.key.localeCompare(b.key);
  const byFile = [...new Set(o.rows.map((r) => fileOf(r.name)))].map((f) => group(f, o.rows.filter((r) => fileOf(r.name) === f))).sort(mostFirst);
  // the ranks in their order, then the other tags, the most disagreements first; a case counts under
  // its rank and each of its tags
  const testOf = (r: (typeof o.rows)[number]) => tests.get(r.name);
  const byTag = [
    ...RANKS.map((rank) => group(rank, o.rows.filter((r) => testOf(r)?.rank === rank))),
    ...TAGS.map((tag) => group(tag, o.rows.filter((r) => testOf(r)?.tags.includes(tag)))).sort(mostFirst),
  ].filter((g) => g.cases);
  const share = (dis: number, runs: number): string => (runs ? `${Math.round((100 * dis) / runs)}%` : '');
  const sum = { cases: byFile.reduce((n, r) => n + r.cases, 0), runs: byFile.reduce((n, r) => n + r.runs, 0), dis: byFile.reduce((n, r) => n + r.dis, 0), blockDis: byFile.reduce((n, r) => n + r.blockDis, 0), blockRan: byFile.reduce((n, r) => n + r.blockRan, 0) };
  // disagreements of runs, and their share
  const tally = (dis: number, runs: number): string => (runs ? `${dis}/${runs} (${share(dis, runs)})` : '');
  const groupTable = (head: string, groups: ReturnType<typeof group>[], name: (key: string) => string): string[] => [
    `| ${head} | cases | disagree | block apps | ${o.apps.map((a) => `[${o.ids.get(a)}](${toReport(a)} "${o.byApp.get(a)?.title ?? a}")`).join(' | ')} |`,
    `| --- | ---: | ---: | ---: | ${o.apps.map(() => '---:').join(' | ')} |`,
    ...groups.map((r) => `| ${name(r.key)} | ${r.cases} | ${tally(r.dis, r.runs)} | ${tally(r.blockDis, r.blockRan)} | ${r.apps.join(' | ')} |`),
  ];
  const byFileLines = [
    'By spec file:',
    '',
    ...groupTable('spec file', byFile, (f) => `[${f}](../spec/${f})`),
    `| **total** | **${sum.cases}** | **${tally(sum.dis, sum.runs)}** | **${tally(sum.blockDis, sum.blockRan)}** | ${o.apps.map((_, i) => `**${o.rows.filter((r) => r.cells[i] === 'disagree').length}**`).join(' | ')} |`,
    '',
    'By tag:',
    '',
    ...groupTable('tag', byTag, (t) => `\`${t}\``),
    '',
  ];
  const out = [
    '---',
    `type: ${JSON.stringify('SxS')}`,
    `command: ${JSON.stringify(o.command)}`,
    `elapsed_s: ${Math.round(o.elapsed)}`,
    '---',
    '',
    '## Summary',
    '',
    // a row per app, its id (its column's heading in the tables below), its model (block or text), a
    // column per verdict
    row(['', 'id', 'model', ...columns.map((c) => (c === 'missing' ? 'not run' : c)), 'total']),
    `| --- | --- | --- |${' --- |'.repeat(columns.length + 1)}`,
    // (agree and disagree with their share of the app's runs, every verdict's)
    ...o.apps.map((a) => {
      const runs = VERDICTS.reduce((n, v) => n + count(a, v), 0);
      const cell = (v: string): string | number => (count(a, v) && (v === 'agree' || v === 'disagree') ? `${count(a, v)} (${share(count(a, v), runs)})` : count(a, v) || '');
      return row([`[${o.byApp.get(a)?.title ?? a}](${toReport(a)})`, o.ids.get(a)!, o.byApp.get(a)?.model ?? '', ...columns.map(cell), `**${o.rows.length}**`]);
    }),
    '',
    ...byFileLines,
    ...map.lines,
    '',
  ];
  // the examples, one HTML table, so that its columns line up: per spec file, in the spec's order, a
  // header row (the file's name, the apps, `disagree` and `rank`), its examples (each with the count
  // of apps that disagree on it, and its rank), and a row, `total`, of each app's disagreements in it
  // (blank if it ran none) and their sum; an empty row between files. No `</td>`s, for size.
  const html = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rows: string[] = [];
  const tr = (cells: string[]): void => void rows.push(`<tr>${cells.join('')}</tr>`);
  for (const f of [...new Set(o.rows.map((r) => fileOf(r.name)))]) {
    const inFile = o.rows.filter((x) => fileOf(x.name) === f);
    const tally = (i: number): string => {
      const ran = inFile.filter((r) => (VERDICTS as readonly string[]).includes(r.cells[i]!)).length;
      return `<td>${ran ? `<b>${inFile.filter((r) => r.cells[i] === 'disagree').length}</b>` : ''}`;
    };
    const disagree = (r: (typeof inFile)[number]): number => r.cells.filter((c) => c === 'disagree').length;
    // between files, one or two empty rows: GitHub shades every even row, and each file's header is one
    if (rows.length) {
      const gap = (): void => tr([`<td colspan="${o.apps.length + 3}">`]);
      gap();
      if (rows.length % 2 === 0) gap();
    }
    tr([`<td><b>${html(f)}</b>`, ...o.apps.map((a) => `<td><b><a href="${toReport(a)}" title="${html(a)}">${html(o.ids.get(a)!)}</a></b>`), '<td><b>disagree</b>', '<td><b>rank</b>']);
    for (const r of inFile) {
      const cells = r.cells.map((c, i) => (r.adapted[i]!.length && c !== 'agree' && c !== 'skipped' ? `<td>(${CELL[c]![1]})` : `<td>${CELL[c]![1]}`));
      const rank = tests.get(r.name)?.rank;
      tr([`<td><a href="../spec/${f}#${anchor(r.name)}">${html(short(r.name))}</a>`, ...cells, `<td align="right">${disagree(r)}`, `<td>${html(rank ?? '')}`]);
    }
    tr(['<td><b>total</b>', ...o.apps.map((_, i) => tally(i)), `<td align="right"><b>${inFile.reduce((n, r) => n + disagree(r), 0)}</b>`, '<td>']);
  }
  out.push(
    '## Legend',
    '',
    '| cell | the app, compared with ourus |',
    '| --- | --- |',
    `| ${CELL.agree![1]} | agrees: the same result, caret included |`,
    `| ${CELL.disagree![1]} | disagrees: other text, or (a block app) other blocks, nesting or count |`,
    `| ${CELL.caret![1]} | caret: the same result, the caret elsewhere |`,
    `| ${CELL.whitespace![1]} | spaces: the same but for spaces next to line breaks, or (a text app) spaces that leave the document as ourus reads it the same |`,
    `| ${CELL.error![1]} | error: the run failed, or the app didn't hold the starting state |`,
    `| blank | skipped: the app can't run the example as written (its report says why) |`,
    ...(columns.includes('missing') ? [`| ${CELL.missing![1]} | not run: the app's last run didn't play the example as the spec has it now |`] : []),
    `| (${CELL.disagree![1]}) | in brackets, a difference in an example adapted for the app: its buffers projected onto blocks, so it compares those |`,
    '',
    'An example\'s **rank** is how often users meet it (`core`, `common`, `edge` or `rare`: [the spec\'s README](../spec/README.md)); a file\'s **disagree** column counts the apps that disagree on the example; its **total** row, the examples each app disagrees on, and all of them. An app is its id in the tables, as the [summary](#summary) has it.',
    '',
    'By spec file and by tag, under the summary: each one\'s cases; the apps\' runs of them that disagree, of all the runs (and their share); the block apps\' alike; and each app\'s disagreements (blank: it ran none there). A case counts under its rank and under each of its other tags ([the spec\'s README](../spec/README.md)), so the tags\' rows overlap.',
    '',
  );
  out.push('## Test cases', '', '<table>', ...rows, '</table>', '');
  return { md: out.join('\n'), svg: map.svg };
}

/** A heatmap cell's colors by its share, in percent: light yellow to dark red, from 30% up. */
const HEAT: readonly [number, readonly [number, number, number]][] = [
  [30, [255, 255, 204]],
  [50, [254, 217, 118]],
  [65, [254, 178, 76]],
  [75, [253, 141, 60]],
  [85, [240, 59, 32]],
  [100, [189, 0, 38]],
];
function heat(p: number): { bg: string; fg: string } {
  // the stops around it (below the first, the first's color)
  const k = HEAT.findIndex(([at]) => at >= p);
  const i = k === -1 ? HEAT.length - 1 : Math.max(1, k);
  const [[p0, c0], [p1, c1]] = [HEAT[i - 1]!, HEAT[i]!];
  const t = Math.min(1, Math.max(0, (p - p0) / (p1 - p0)));
  const [r, g, b] = c0.map((c, k) => Math.round(c + (c1[k]! - c) * t)) as [number, number, number];
  return { bg: `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`, fg: 0.299 * r + 0.587 * g + 0.114 * b < 140 ? '#fff' : '#000' };
}

/** ourus's own column in the heatmap: its verdicts are its runs of the examples. */
const OURUS = 'ourus';

/**
 * The heatmap: for each two apps, how alike they did in the examples both ran alike, as written or
 * adapted the same way (`score`: the same result 1, the same but for the caret or spaces ½), colored by
 * it, ourus among them, in the order given: the table's, by how few examples disagree, ourus first.
 */
function heatmap(o: { apps: string[]; ids: Map<string, string>; ordered: ReadonlySet<string>; byApp: Map<string, AppRun | null>; rows: { name: string; cells: string[]; adapted: string[][] }[] }): { lines: string[]; svg: string } {
  const ran = (c: string): boolean => c !== 'error' && (VERDICTS as readonly string[]).includes(c);
  const examples = new Map(o.apps.map((a) => [a, new Map((o.byApp.get(a)?.examples ?? []).map((e) => [e.name, e]))]));
  /** A verdict's points: agreeing with ourus is 1, a difference only in the caret or in spaces half. */
  const points = (v: string): number => (v === 'agree' ? 1 : v === 'caret' || v === 'whitespace' ? 0.5 : 0);
  /** A state of `app`'s as an outline, read as the app's are drawn, or null where it reads as none. */
  const outline = (app: string, drawn: string): Outline | null => readOutline(drawn, { ordered: o.ordered.has(app) });
  /** A state of `app`'s as it is drawn now: a run's data keeps the drawing of its day. */
  const redrawn = (app: string, drawn: string): string => {
    const d = outline(app, drawn);
    return d ? draw(d, { ordered: o.ordered.has(app) }) : drawn;
  };
  /** How two apps' outputs compare: as outlines where both read as one, else as text. */
  const compare = (a: string, x: string, b: string, y: string): string => {
    const [ox, oy] = [outline(a, x), outline(b, y)];
    return ox && oy ? compareOutlines(ox, oy) : compareTexts(readTextDoc(x), readTextDoc(y));
  };
  /**
   * How alike two apps did in an example, 0 to 1, or null where it doesn't say (not run by both, run
   * adapted by one and not the other, or both apart from ourus from different starts): from the same
   * start, their
   * outputs compared step by step, the worst step counting; else by how each did against ourus.
   */
  const score = (a: string, b: string, row: { name: string; cells: string[]; adapted: string[][] }): number | null => {
    const [i, k] = [o.apps.indexOf(a), o.apps.indexOf(b)];
    const [va, vb] = [row.cells[i]!, row.cells[k]!];
    if (!ran(va) || !ran(vb)) return null;
    // ourus's own outcome where it fails an example isn't recorded: only that it differs from those that
    // pass; an app's verdict compares it with ourus's outcome adapted as its own run was
    if (a === OURUS || b === OURUS) {
      const [ours, theirs] = a === OURUS ? [va, vb] : [vb, va];
      return ours === 'agree' ? points(theirs) : theirs === 'agree' ? 0 : null;
    }
    // two apps compare only on an example both ran alike, as written or adapted the same way: one's
    // blocks and another's text, or two adaptations, aren't the same document
    if (row.adapted[i]!.join() !== row.adapted[k]!.join()) return null;
    const [x, y] = [examples.get(a)!.get(row.name), examples.get(b)!.get(row.name)];
    if (x && y && redrawn(a, x.start) === redrawn(b, y.start) && x.steps.length === y.steps.length) {
      const steps = x.steps.flatMap((step, i) => (step.app !== null && y.steps[i]!.app !== null ? [points(compare(a, step.app, b, y.steps[i]!.app!))] : []));
      if (steps.length) return Math.min(...steps);
    }
    if (va === 'agree' || vb === 'agree') return points(va === 'agree' ? vb : va);
    return points(va) && points(vb) ? 0.5 : null;
  };
  /** How alike two apps did, in points, of the examples that say. */
  const alike = (a: string, b: string): { same: number; of: number } => {
    const told = o.rows.map((r) => score(a, b, r)).filter((v) => v !== null);
    return { same: told.reduce((n, v) => n + v, 0), of: told.length };
  };
  const apps = o.apps;
  const label = (a: string): string => (a === OURUS ? 'label ours' : 'label');
  const xml = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // the grid: app names down the left, their ids along the top (in the same order, right-aligned as
  // the cells' numbers), a cell per two apps, colored by their share, its count as its title (a tooltip
  // where the SVG is opened as itself)
  const W = 36;
  const H = 22;
  const left = 8 + Math.max(...apps.map((a) => a.length)) * 7;
  const top = 24;
  const width = left + W * apps.length + 8;
  const height = top + H * apps.length + 8;
  const svg: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">`,
    // on a transparent ground, the cells edge to edge (`crispEdges`: no seam between two): the labels a
    // gray read on a light page and a dark one alike (GitHub's muted text), the empty cells a
    // translucent gray; brighter labels where the viewer says it is dark (an image is told the
    // system's preference, which needn't be the page's)
    '<style>.label{fill:#8b949e}.ours{font-weight:bold}.empty{fill:rgba(128,128,128,0.15)}' +
      '@media (prefers-color-scheme: dark){.label{fill:#c9d1d9}}</style>',
    ...apps.map((a, k) => `<text class="${label(a)}" x="${left + W * k + W - 6}" y="${top - 8}" text-anchor="end">${xml(o.ids.get(a) ?? a)}</text>`),
    ...apps.map((a, i) => `<text class="${label(a)}" x="${left - 8}" y="${top + H * i + H / 2 + 4}" text-anchor="end">${xml(a)}</text>`),
  ];
  apps.forEach((a, i) =>
    apps.forEach((b, k) => {
      const [x, y] = [left + W * k, top + H * i];
      const { same, of } = a === b ? { same: 0, of: 0 } : alike(a, b);
      if (!of) {
        svg.push(`<rect class="empty" x="${x}" y="${y}" width="${W}" height="${H}"/>`);
        return;
      }
      const p = (100 * same) / of;
      const { bg, fg } = heat(p);
      svg.push(
        `<g><title>${xml(`${a} and ${b}: ${Math.round(same * 10) / 10} points of the ${of} examples both ran (and could be compared)`)}</title>` +
          `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${bg}"/>` +
          `<text x="${x + W - 6}" y="${y + H / 2 + 4}" text-anchor="end" fill="${fg}">${Math.round(p)}</text></g>`,
      );
    }),
  );
  svg.push('</svg>', '');
  return {
    lines: [
      '## Heatmap',
      '',
      'Each cell is how alike two apps did, in percent of the examples both ran alike: both as written, or',
      'both adapted the same way (block apps), an example one ran adapted and the other as written left',
      'out. One where they end the same counts 1, the same but for the caret or for spaces ½, otherwise 0,',
      'their results compared from the same start, or, from different',
      'starts, as each compares with ourus (both apart from ourus, it is left out). ourus is there too, as',
      'its own runs of the examples have it: its cell with an app is how that app compares with it.',
      'The apps are in the table\'s order, by how many examples they disagree on, the fewest first, ourus first.',
      '',
      `![Heatmap: how alike two apps did](heatmap.svg)`,
    ],
    svg: svg.join('\n'),
  };
}

// the current judgment against one committed in `.sxs` (lib/compare.ts); no app runs
if (flag('--compare') || option('--compare') !== undefined) {
  const picked = new Set(allTests().filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t))).map((t) => t.name));
  const named = selectors.length === 0 ? () => true : (name: string) => picked.has(name);
  process.exit(compareJudgments(cacheDir, app === 'all' ? allApps() : app.split(','), option('--compare') ?? 'HEAD', named, (line) => console.log(line), flag('-v') || flag('--verbose')));
}
if (app === 'all' || app?.includes(',')) process.exit(await runMany(app, selectors, args.filter((a) => a.startsWith('-'))));

const verbose = flag('-v') || flag('--verbose');
const repeat = Number(option('--repeat') ?? 1);
const slow = Number(option('--slow') ?? 0);
const timing = flag('--timing');
const regenerating = flag('--rejudge');

if (!app || !existsSync(new URL(`./${app}/driver.ts`, import.meta.url))) {
  console.error(`usage: node sxs/run.ts <app> [selector...] [options]; an app is a directory of sxs/ with a driver.ts`);
  process.exit(2);
}
const driver = ((await import(`./${app}/driver.ts`)) as { driver: Driver }).driver;
const say = (line: string): void => console.log(line);

/**
 * What the app did in every spec file's examples (`FileRun`); a run of the whole spec from before them
 * (`sxs.json` but no file's), split into them first.
 */
function fileRuns(): FileRun[] {
  const files = [...new Set(allTests().map((t) => t.file))];
  // every file's, whether or not the spec still has its cases: a case moved to another file is matched there too
  const dir = resultsDir(driver.longId);
  const all = (): FileRun[] =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith('.json') && !f.endsWith('.partial.json') && f !== 'sxs.json')
          .map((f) => read<FileRun>(join(dir, f)))
          .filter((r): r is FileRun => r?.type === 'SxS' && typeof r.file === 'string')
      : [];
  const runs = all();
  const whole = runs.length ? null : read(lastRun(driver.longId, 'json'));
  if (!whole) return runs;
  const ran = statSync(lastRun(driver.longId, 'json')).mtime.toISOString();
  for (const file of files) {
    const examples = whole.examples.filter((e) => e.file === file);
    if (examples.length) writeFileRun({ type: 'SxS', app: driver.longId, file, version: whole.version, command: whole.command, elapsed_s: whole.elapsed_s, ran, examples });
  }
  return all();
}
function writeFileRun(r: FileRun, partial = false): void {
  mkdirSync(join(fileRun(r.app, r.file), '..'), { recursive: true });
  writeFileSync(fileRun(r.app, r.file, partial), `${JSON.stringify(r, null, 2)}\n`);
}

/**
 * A regenerated report's last runs: every example's (`FileRun`). Its version, command and time are the
 * report's as it stands (`<app>.md`): regenerating runs nothing, and changes no run's facts. An app
 * with no report yet takes the latest run of every example's (its command without selectors), else the
 * latest run's.
 */
const previous = regenerating
  ? (() => {
      const runs = fileRuns();
      const latestOf = (rs: FileRun[]): FileRun | null => rs.reduce<FileRun | null>((a, b) => (a && a.ran > b.ran ? a : b), null);
      const latest = latestOf(runs);
      if (!latest) return null;
      const report = existsSync(join(here, `${driver.longId}.md`)) ? readFileSync(join(here, `${driver.longId}.md`), 'utf8') : '';
      const field = (name: string): string | undefined => new RegExp(`^${name}: (.*)$`, 'm').exec(report.split(/^---$/m)[1] ?? '')?.[1];
      const examples = runs.flatMap((r) => r.examples);
      const [version, command, elapsed, workers] = [field('version'), field('command'), field('elapsed_s'), field('workers')];
      // a run that said no version is reported as "unknown"
      if (command !== undefined && elapsed !== undefined) return { version: version === undefined ? latest.version : version === '"unknown"' ? null : (JSON.parse(version) as string | null), command: JSON.parse(command) as string, elapsed_s: Number(elapsed), workers: Number(workers ?? 1), examples };
      const whole = latestOf(runs.filter((r) => /^node sxs\/run\.ts [\w-]+$/.test(r.command))) ?? latest;
      return { version: whole.version, command: whole.command, elapsed_s: whole.elapsed_s, workers: 1, examples };
    })()
  : null;
if (regenerating && !previous) {
  // nothing to judge again is no failure: a run of several apps leaves the app out
  console.error(`no run of ${driver.displayName} to regenerate the report from in ${relative(process.cwd(), join(cacheDir, driver.longId))}`);
  process.exit(0);
}

// the app's kind of document (`Driver.model`): how one is drawn, compared, and told apart from another
const isText = driver.model === 'text';
const drawDoc = (d: Doc): string => (isText ? drawTextDoc(d as TextDoc) : draw(d as Outline, { ordered: driver.ordered }));
const compareDocs = (want: Doc, got: Doc, sections?: readonly number[], flavor?: Config['flavor']): Verdict =>
  isText ? compareTexts(want as TextDoc, got as TextDoc, flavor) : compareOutlines(want as Outline, got as Outline, sections);
/** The flavor a plan's example is read in. */
const flavorOf = (plan: Plan): Config['flavor'] => (plan.test.options.flavor ?? Config.defaults.flavor) as Config['flavor'];
const sameDoc = (a: Doc, b: Doc): boolean => (isText ? sameText(a as TextDoc, b as TextDoc) : sameOutline(a as Outline, b as Outline));

// ------------------------------------------------------------------ choosing and adapting

/** A probe's cases (`--probe=FILE`, a spec-format file anywhere: sxs/probe.ts writes one): played, written to `--json`'s file alone. */
const probing = option('--probe');
const tests = probing ? readSpec(basename(probing), readFileSync(probing, 'utf8')) : allTests().filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t)));
const plans: Plan[] = [];
const skipped = new Map<string, string[]>();
/** A regenerated report's examples that its last run didn't play as they are now, by why: they want a run. */
const notRun = new Map<string, string[]>();
for (const t of tests) {
  const a = adapt(driver, t, { ignoreOptions: flag('--ignore-options'), plainClipboard: flag('--plain-clipboard') });
  const why = 'skip' in a ? a.skip : flag('--strict') && a.plan.notes.length ? `adapted (${a.plan.notes.join(', ')})` : null;
  if (why === null && 'plan' in a) plans.push(a.plan);
  else skipped.set(why!, [...(skipped.get(why!) ?? []), t.name]);
}
/** Tests that adapt to the same plan run once: by key, the plan run and the names it stands for. */
const unique = new Map<string, { plan: Plan; names: string[] }>();
for (const p of plans) {
  const u = unique.get(p.key);
  if (u) u.names.push(p.name);
  else unique.set(p.key, { plan: p, names: [p.name] });
}

if (flag('--list')) {
  for (const { plan, names } of unique.values()) say(`run   ${names.join(' = ')}${plan.notes.length ? `  [${plan.notes.join(', ')}]` : ''}`);
  for (const [why, names] of skipped) for (const n of names) say(`skip  ${n}: ${why}`);
  say(`\n${plans.length} to run (${unique.size} distinct), ${tests.length - plans.length} skipped`);
  process.exit(0);
}
/** The run as data (`AppRun`), from its results; a run that ran nothing has none. */
function runData(results: readonly Result[], version: string | undefined): AppRun {
  const order = new Map(tests.map((t) => [t.name, t]));
  const where = (name: string): { file: string; anchor: string; line: number } => ({ file: order.get(name)!.file, anchor: anchor(name), line: order.get(name)!.line });
  const inSpecOrder = <T extends { name: string }>(xs: T[]): T[] => {
    const index = new Map([...order.keys()].map((n, i) => [n, i]));
    return xs.sort((a, b) => index.get(a.name)! - index.get(b.name)!);
  };
  const examples = results.flatMap(({ plan, names, outcome, flaky }) => {
    const steps = plan.steps.map((step, i): RunStep => {
      const reached = outcome.verdict !== 'error' || i < outcome.step;
      const got = reached ? (outcome.got[i] ?? null) : null;
      const ourus = step.want ? drawDoc(step.want) : null;
      const s: RunStep = { line: step.line, actions: [...step.actions], ...(reached && (step.want || step.clipboard !== undefined) && { verdict: stepVerdict(step, got, outcome.clipboards[i], flavorOf(plan)) }), ourus, app: got ? drawDoc(got) : null };
      if (isText) s.blocks = got ? projected(got as TextDoc, plan) : null;
      if (step.drawn !== undefined && step.drawn !== ourus) s.written = step.drawn;
      if (step.caretLost) s.caretLost = step.caretLost;
      if (step.clipboard !== undefined) s.clipboard = { ourus: step.clipboard, app: reached ? (outcome.clipboards[i] ?? null) : null };
      return s;
    });
    const start = drawDoc(plan.initial);
    return names.map(
      (name): RunExample => ({
        name,
        ...where(name),
        verdict: outcome.verdict,
        ...(outcome.verdict !== 'agree' && { step: outcome.step }),
        adapted: [...plan.notes],
        options: { ...order.get(name)!.options },
        ...(flaky && { flaky }),
        ...(outcome.error !== undefined && { error: outcome.error }),
        ...(outcome.unsettled.length && { unsettled: outcome.unsettled }),
        clipboard: plan.clipboard,
        start,
        ...(plan.test.initial.buffer !== start && { written: plan.test.initial.buffer }),
        steps,
      }),
    );
  });
  const tally = (xs: RunExample[]): Counts => ({ ...(Object.fromEntries(VERDICTS.map((v) => [v, xs.filter((e) => e.verdict === v).length])) as Record<(typeof VERDICTS)[number], number>), total: xs.length });
  const skips = inSpecOrder([...skipped].flatMap(([reason, names]) => names.map((name) => ({ name, ...where(name), reason }))));
  const unrun = inSpecOrder([...notRun].flatMap(([reason, names]) => names.map((name) => ({ name, ...where(name), reason }))));
  return {
    type: 'SxS',
    app: driver.longId,
    title: driver.displayName,
    version: version ?? null,
    url: driver.url,
    model: driver.model,
    // a regenerated report's, the run's it was made from
    command: previous?.command ?? `node sxs/run.ts ${[driver.longId, ...selectors].join(' ')}`,
    elapsed_s: previous?.elapsed_s ?? Math.round((Date.now() - started) / 1000),
    ...((previous?.workers ?? workersUsed) > 1 && { workers: previous?.workers ?? workersUsed }),
    summary: {
      ...tally(examples),
      skipped: skips.length,
      total: examples.length + skips.length + unrun.length,
      ...(!isText && { original: tally(examples.filter((e) => !e.adapted.length)), adapted: tally(examples.filter((e) => e.adapted.length)) }),
    },
    examples: inSpecOrder(examples),
    skipped: skips,
    ...(unrun.length && { notRun: unrun }),
  };
}

/** A text app's state projected onto blocks as the spec's buffers are for a block app (a caret with no place in one not drawn), or null where it has none. */
function projected(d: TextDoc, plan: Plan): string | null {
  try {
    const p = project(drawTextDoc(d), flavorOf(plan));
    return draw(p.caretLost ? { ...p.outline, sel: null } : p.outline);
  } catch {
    return null;
  }
}

/** How a step came out: its buffer against the spec's (a caret with no place in a block not compared), and its clipboard. */
function stepVerdict(step: PlanStep, got: Doc | null, clipboard: string | null | undefined, flavor: Config['flavor']): Verdict {
  let v: Verdict = 'agree';
  if (step.want && got) v = compareDocs(step.caretLost ? { ...step.want, sel: null } : step.want, got, step.sections, flavor);
  // a clipboard written otherwise but reading as the same outline (an app's tabs, no final line break) is whitespace
  if (step.clipboard !== undefined && clipboard !== step.clipboard) v = clipboard && sameMarkdown(clipboard, step.clipboard, flavor) ? (rank[v] > rank.whitespace ? v : 'whitespace') : 'disagree';
  return v;
}

/** Whether two Markdown texts read as the same outline: the same nodes, at the same depths, with the same texts, items in lists of the same kind (bullets, numbers). */
function sameMarkdown(a: string, b: string, flavor: Config['flavor']): boolean {
  const read = (text: string): string => {
    const doc = OurusDoc.parse(text, { config: { flavor } });
    return JSON.stringify([drawOutline(doc), nodesOf(doc).map((n) => (n.kind === 'item' ? n.block.attrs.list?.type : null))]);
  };
  return read(a) === read(b);
}

/** The run as data, in `.sxs/results/<app>/sxs.json` (a run of some examples, `sxs.partial.json`), and to `--json`'s file if asked. */
function writeJson(run: AppRun): void {
  mkdirSync(join(lastRun(driver.longId, 'json'), '..'), { recursive: true });
  for (const file of [probing ? null : lastRun(driver.longId, 'json', partialRun), option('--json')]) if (file) writeFileSync(file, `${JSON.stringify(run, null, 2)}\n`);
}

/** The workers the run played with. */
let workersUsed = 1;

// an app that skips every test selected has no verdicts, which isn't a failure: the table leaves it out
if (unique.size === 0) {
  say(`nothing to run: ${tests.length} tests selected, all skipped`);
  writeJson(runData([], undefined));
  process.exit(0);
}

// ------------------------------------------------------------------ playing

const idle: IdleOptions = { shortTimer: 300, quiet: 40, timeout: 5000, ...driver.idle };

interface Outcome {
  verdict: Verdict | 'error';
  /** Index of the step the verdict is about (the first that isn't agreed). */
  step: number;
  got: (Doc | null)[];
  clipboards: (string | null)[];
  error?: string;
  /** Actions after which the app didn't settle in time, with what was pending. */
  unsettled: string[];
  ms: number;
}

/**
 * What the runner plays the app through: a page's keyboard, Clipboard API and idle script, or the
 * session of an app that isn't a page (`Session`, lib/driver.ts), which settles by returning.
 */
interface Actor extends Omit<Session, 'clipboard'> {
  /** The clipboard: every format the case gives (a session's takes the text alone); read back, its text. */
  clipboard: { write(clipboard: Clipboard): Promise<void>; read(): Promise<string> };
  settle(o: IdleOptions): Promise<IdleResult>;
  /** Brings the app's page to the front, where its Clipboard API works. */
  front(): Promise<void>;
}
const pageActor = (page: Page): Actor => ({
  press: (key) => page.keyboard.press(key),
  type: (text) => page.keyboard.type(text),
  clipboard: {
    // through a copy event, whose `setData` takes any format (the Clipboard API's write takes text and
    // HTML only): Chromium keeps the others as its own, and a paste then has them all, as after a copy
    // from the app that wrote them. The page's own copy handlers don't see it, nor add to it.
    write: async (clipboard) => {
      const copied = await page.evaluate((formats) => {
        const onCopy = (e: ClipboardEvent): void => {
          e.stopImmediatePropagation();
          e.preventDefault();
          e.clipboardData!.clearData();
          for (const [type, text] of Object.entries(formats)) e.clipboardData!.setData(type, text);
        };
        window.addEventListener('copy', onCopy, { capture: true });
        try {
          return document.execCommand('copy');
        } finally {
          window.removeEventListener('copy', onCopy, { capture: true });
        }
      }, clipboard as Record<string, string>);
      if (!copied) throw new Error('the clipboard could not be written: the page refused a copy');
    },
    read: () => page.evaluate(() => navigator.clipboard.readText()),
  },
  settle: (o) => page.evaluate((o) => (window as unknown as { __ourusIdle: { wait(o: IdleOptions): Promise<IdleResult> } }).__ourusIdle.wait(o), o),
  front: () => page.bringToFront(),
});
const sessionActor = (session: Session): Actor => ({
  ...session,
  clipboard: { write: (clipboard) => session.clipboard.write(clipboard['text/plain'] ?? ''), read: () => session.clipboard.read() },
  settle: async () => ({ ms: 0, timedOut: false }),
  front: async () => {},
});
/**
 * A worker of the run (`--workers`): the app's page in a browser of its own, what it plays the app
 * through, and what it holds. The workers take the run's examples one after another from one queue.
 */
interface Worker {
  page: Page;
  actor: Actor;
  /** It types a text at once (a session). */
  typesAtOnce: boolean;
  /** Holds the clipboard of the worker's browser, which other apps' windows in it share (`AppPage.clipboard`). */
  holdClipboard?: () => Promise<() => void>;
  /** The settings the app was last set to in its page (`Driver.configure`); unknown at first, in a page an earlier run may have left set. */
  configured: string | null;
}

/**
 * A typist's pace: a key (or a typed character) at least this long after the one before (80 to 120
 * words a minute). Apps that tell one undo step from the next by the time between edits see the pace
 * they are typed at: settling alone gave about 45 ms, at Tana's 50 ms (records closer than that are
 * undone together), so which characters one undo took back was the machine's timing.
 */
const PACE = Number(option('--pace') ?? 100);

/**
 * In an example that undoes or redoes, the pause between its steps, and before an undo or redo after
 * other actions of its step: a user's steps are seconds apart, and apps group what one undo takes back
 * by the time between edits (ProseMirror's 500 ms, BlockNote's; Tana's 50 ms), or store an edit when a
 * timer of theirs fires (Logseq's save, 500 ms after the last input; WorkFlowy's, debounced 500 ms).
 * Played at the pace, a step's edits joined the last step's, or weren't stored yet, as the machine's
 * load had it: the same undo example came out otherwise from run to run (Logseq's late save, after the
 * first of two undos, stored the undone text again, and the second undo took that back, not the step
 * before). So a pause is this long, and then waits for the timers the app had pending (`drain`, up to
 * `UNDO_DRAIN`: its saves) and settles.
 */
const UNDO_GAP = 750;
const UNDO_DRAIN = 2000;
const isUndo = (action: string): boolean => action === 'undo' || action === 'redo';

async function settle(w: Worker, after: string, unsettled: string[]): Promise<void> {
  const t0 = Date.now();
  const r = await w.actor.settle(idle);
  if (r.timedOut) unsettled.push(`${after}: ${r.pending}`);
  if (timing) say(`    ${String(Date.now() - t0).padStart(5)}ms  ${after}${r.busiest ? `  (longest wait: ${r.busiest})` : ''}`);
  // a session's app has done what it was asked when its call returns, and keeps no clock between keys
  const rest = PACE - (Date.now() - t0);
  if (!w.typesAtOnce && !after.startsWith('loading') && rest > 0) await new Promise((r) => setTimeout(r, rest));
  if (slow) await new Promise((r) => setTimeout(r, slow));
}

async function play(w: Worker, action: string, settleAfter: (what: string) => Promise<void>): Promise<void> {
  if (action.startsWith('"')) {
    // a session takes the text as one run, as a user's typing (it settles by returning; Emacs's undo
    // takes a run of typing as one change, and characters typed in calls of their own as one each)
    if (w.typesAtOnce) {
      await w.actor.type(action.slice(1, -1));
      await settleAfter(`typing ${action}`);
      return;
    }
    // one character at a time, each settled: an app may react to a character (pairing a bracket)
    for (const ch of action.slice(1, -1)) {
      await w.actor.type(ch);
      await settleAfter(`typing ${JSON.stringify(ch)}`);
    }
    return;
  }
  const keys = driver.keys[action];
  if (keys !== undefined) {
    for (const key of typeof keys === 'string' ? [keys] : keys) {
      await w.actor.press(key);
      await settleAfter(`${action} (${key})`);
    }
    return;
  }
  if (!driver.act) throw new Error(`${driver.longId} has no key for ${action}`);
  await driver.act(w.page, action, () => settleAfter(action));
}

const indent = (s: string, by = '    '): string => s.replace(/\n$/, '').replace(/^/gm, by);

const rank: Record<Verdict | 'error', number> = { agree: 0, caret: 1, whitespace: 2, disagree: 3, error: 4 };

async function runPlan(w: Worker, plan: Plan): Promise<Outcome> {
  const { page } = w;
  const t0 = Date.now();
  const unsettled: string[] = [];
  const got: (Doc | null)[] = [];
  const clipboards: (string | null)[] = [];
  const settleAfter = (what: string): Promise<void> => settle(w, what, unsettled);
  /** A user's pause (`UNDO_GAP`): time, then what the app put off till then done, then settled. */
  const pause = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, UNDO_GAP));
    if (page) await page.evaluate((upTo) => (window as unknown as { __ourusIdle: { drain(o: { upTo: number; timeout: number }): Promise<unknown> } }).__ourusIdle.drain({ upTo, timeout: 3 * upTo }), UNDO_DRAIN);
    await settleAfter('a pause');
  };
  // an example that pastes or checks the clipboard
  const usesClipboard = plan.clipboard !== null || plan.steps.some((s) => s.clipboard !== undefined || s.actions.some((a) => /^(paste|copy|cut)/.test(a)));
  // the browser's clipboard, its other windows' too: held for the whole example
  const unhold = usesClipboard ? await w.holdClipboard?.() : undefined;
  try {
    const settings = JSON.stringify(plan.settings);
    if (driver.configure && settings !== w.configured) {
      w.configured = null;
      await driver.configure(page, plan.settings);
      w.configured = settings;
    }
    // an example that uses the clipboard has its tab in front (behind another, a Clipboard API write
    // is dropped and a read comes back empty, without an error)
    if (usesClipboard) await w.actor.front();
    await driver.load(page, plan.initial);
    // a test that starts with none starts with an empty one: a copy that copies nothing reads back as
    // nothing, not as whatever an earlier test (another app's, in the browser) left there
    if (plan.clipboard !== null || usesClipboard) await w.actor.clipboard.write(plan.clipboard ?? { 'text/plain': '' });
    await settleAfter('loading');
    // the app holds what the test starts from, or the test means nothing: an app may rewrite what it
    // is given (trimming, normalizing), and that is no behavior of a key
    let loaded = await driver.read(page);
    // once more before calling it the app's: a load can race the app (a run on a machine busy with
    // others), and an app that rewrites what it is given rewrites it again
    if (!sameDoc(loaded, plan.initial)) {
      await driver.load(page, plan.initial);
      await settleAfter('loading again');
      loaded = await driver.read(page);
    }
    if (!sameDoc(loaded, plan.initial)) throw new Error(`${driver.displayName} holds the starting state differently:\n  meant:\n${indent(drawDoc(plan.initial))}\n  holds:\n${indent(drawDoc(loaded))}`);
    const undoes = plan.steps.some((s) => s.actions.some(isUndo));
    for (const [i, step] of plan.steps.entries()) {
      if (undoes && i > 0) await pause();
      for (const [j, action] of step.actions.entries()) {
        if (undoes && j > 0 && isUndo(action) && !isUndo(step.actions[j - 1]!)) await pause();
        await play(w, action, settleAfter);
      }
      got.push(step.want ? await driver.read(page) : null);
      clipboards.push(step.clipboard !== undefined ? await w.actor.clipboard.read() : null);
    }
  } catch (e) {
    const message = String(e instanceof Error ? e.message : e);
    // `OURUS_SXS_DEBUG=1`: an error's whole stack in the log, the driver's line among it (the report
    // keeps its first line)
    if (process.env.OURUS_SXS_DEBUG) console.log(`DEBUG ${plan.name}, ${got.length} steps read:\n${e instanceof Error ? e.stack : e}`);
    // a Playwright error's first line says it; an error of ours may draw a state below it
    const error = message.startsWith(`${driver.displayName} holds`) ? message : message.split('\n')[0]!.slice(0, 300);
    return { verdict: 'error', step: got.length, got, clipboards, error, unsettled, ms: Date.now() - t0 };
  } finally {
    unhold?.();
    await driver.unload?.(page).catch(() => {});
  }
  return { ...judge(plan, got, clipboards), got, clipboards, unsettled, ms: Date.now() - t0 };
}

/** How an example came out from what the app did in each step: as its worst step, the first that came out so. */
function judge(plan: Plan, got: readonly (Doc | null)[], clipboards: readonly (string | null)[]): { verdict: Verdict; step: number } {
  let verdict: Verdict = 'agree';
  let at = -1;
  plan.steps.forEach((step, i) => {
    const v = stepVerdict(step, got[i] ?? null, clipboards[i], flavorOf(plan));
    if (rank[v] > rank[verdict]) {
      verdict = v;
      at = i;
    }
  });
  return { verdict, step: Math.max(at, 0) };
}

// ------------------------------------------------------------------ regenerating
//
// A regenerated report (--rejudge) runs no app: each example is judged again, against the spec
// as it is now, from what the app did in it in its last run (`.sxs/results/<app>/sxs.json` draws every state the
// app reached), where that run played it as the spec has it now: the same start, clipboard and settings,
// and the same actions in each step (of an example since grown more steps, in its first ones). The
// rest want a run of the app: they are left out (`?` in the table of several apps), and say why.

/** A state as the last run drew it, read back as the app's model has it; null where it doesn't read back. */
function readDoc(drawn: string): Doc | null {
  if (!isText) return readOutline(drawn, { ordered: driver.ordered });
  const d = readTextDoc(drawn);
  return drawTextDoc(d) === drawn ? d : null;
}

/** The app's settings (`Driver.settings`) as strings, each as `get` has it. */
const settingsOf = (get: (k: keyof Config) => unknown): string[] => Object.keys(driver.settings ?? {}).map((k) => String(get(k as keyof Config)));

/** A plan's outcome in the last run's example, if that played it as it is now; else why not. */
function replay(plan: Plan, e: RunExample): Outcome | string {
  if (e.steps.length < plan.steps.length) return 'step added since';
  const got: (Doc | null)[] = [];
  const clipboards: (string | null)[] = [];
  for (const [i, step] of plan.steps.entries()) {
    const was = e.steps[i]!;
    if (JSON.stringify(was.actions) !== JSON.stringify(step.actions)) return 'its actions changed since';
    if (e.verdict === 'error' && e.step === i) return { verdict: 'error', step: i, got, clipboards, ...(e.error !== undefined && { error: e.error }), unsettled: e.unsettled ?? [], ms: 0 };
    const doc = step.want && was.app !== null ? readDoc(was.app) : null;
    if (step.want && !doc) return was.app === null ? 'buffer expected since' : 'state that doesn\'t read back';
    if (step.clipboard !== undefined && !was.clipboard) return 'clipboard expected since';
    got.push(doc);
    clipboards.push(step.clipboard !== undefined ? was.clipboard!.app : null);
  }
  return { ...judge(plan, got, clipboards), got, clipboards, unsettled: e.unsettled ?? [], ms: 0 };
}

/** The clipboard an example of the last run started with, as the app was given it (`RunExample.clipboard`). */
function startClipboard(e: RunExample): Clipboard | null {
  if (typeof e.clipboard !== 'string') return e.clipboard && canonicalClipboard(e.clipboard);
  const html = clipboardHtml(e.clipboard, (e.options.flavor ?? Config.defaults.flavor) as Config['flavor']);
  return { 'text/plain': e.clipboard, ...(html !== null && { 'text/html': html }) };
}

/** Judges every example again from the last run, into `results`, or `notRun` with why; the app's version then. */
function regenerate(): string | undefined {
  const key = (start: string, clipboard: Clipboard | null, settings: string[]): string => JSON.stringify([start, clipboard, settings]);
  // a start as it is drawn now: a run's data keeps the drawing of its day
  const redrawn = (drawn: string): string => {
    const d = readDoc(drawn);
    return d ? drawDoc(d) : drawn;
  };
  const played = new Map<string, RunExample[]>();
  for (const e of previous!.examples) {
    const k = key(redrawn(e.start), startClipboard(e), settingsOf((s) => e.options[s] ?? Config.defaults[s]));
    played.set(k, [...(played.get(k) ?? []), e]);
  }
  for (const { plan, names } of unique.values()) {
    const tries = (played.get(key(drawDoc(plan.initial), plan.clipboard, settingsOf((s) => plan.settings[s]))) ?? []).map((e) => ({ e, outcome: replay(plan, e) }));
    const found = tries.find((t) => typeof t.outcome !== 'string');
    if (found) results.push({ plan, names, outcome: found.outcome as Outcome, ...(found.e.flaky && { flaky: found.e.flaky }) });
    else {
      const why = (tries[0]?.outcome as string | undefined) ?? 'new, or its start changed since';
      notRun.set(why, [...(notRun.get(why) ?? []), ...names]);
    }
  }
  const unrun = [...notRun.values()].reduce((n, names) => n + names.length, 0);
  say(`${driver.displayName}${previous!.version ? ` ${previous!.version}` : ''}: regenerated from its last run, no run; ${plans.length - unrun} tests judged again, ${unrun} not run as they are now, ${tests.length - plans.length} skipped`);
  return previous!.version ?? undefined;
}

// ------------------------------------------------------------------ main

interface Result {
  plan: Plan;
  names: string[];
  outcome: Outcome;
  /** Whether repeated runs disagreed. */
  flaky?: string;
}
const results: Result[] = [];

/** Errors the app's page threw. */
const errors: string[] = [];
const version = regenerating ? regenerate() : await playAll();

/**
 * How many workers the run has (`--workers`, each in a browser of the pool of its own, or with an app it
 * starts of its own): as asked, else as many as its examples warrant (one per 30, at most `BROWSERS`); never
 * more than the driver allows
 * (`Driver.parallel`: 1 by default for one that starts its app), nor more than one for a
 * browser of the run's own (`--headed`).
 */
function workerCount(): number {
  if (flag('--headed')) return 1;
  const most = driver.parallel ?? (driver.launch ? 1 : Infinity);
  const asked = option('--workers');
  if (asked !== undefined) return Math.max(1, Math.min(most, unique.size, Math.floor(Number(asked)) || 1));
  return Math.max(1, Math.min(most, BROWSERS, Math.ceil(unique.size / 30)));
}

/** Plays every example in the app, into `results`, its workers side by side; the app's version. */
async function playAll(): Promise<string | undefined> {
  await ensureProxy(cacheMode(args), say);
  await proxyStats(); // counts from here on
  const count = workerCount();
  // one run of the app at a time; each worker holds a browser of the pool besides (or an app it starts,
  // a desktop app, of its own)
  // a probe waits for another run of the app to end: two probes side by side play in turn
  const unlockApp = !flag('--headed')
    ? await lockApp(driver.longId, !!probing).catch((e: Error) => {
        console.error(e.message);
        return process.exit(1);
      })
    : () => {};
  const opened = Date.now();
  type Marked = { __ourusApp?: string; __ourusVersion?: string };
  // the name a browser's window of the app is held by: the driver's, or its app's for setups that share one (`Driver.pool`)
  const pooled = driver.pool ?? driver.longId;

  type Ready = { app: AppPage; version: string | undefined; how: string; browser?: Browser };

  /**
   * The app's page in `browser`, loaded: an earlier run's, if it still holds a document and reads it
   * back, else a new one; or the window of an app the driver starts itself (no browser), null if `gone`
   * says the worker is no longer wanted while it waits for room.
   */
  async function ready(browser: Browser | null, gone?: () => boolean): Promise<Ready | null> {
    if (!browser) {
      const app = await driver.launch!({ headed: flag('--headed'), say, gone }).catch((e: Error) => {
        console.error(`can't start ${driver.displayName}: ${e.message}`);
        return process.exit(1);
      });
      if (!app) return null;
      // a page's settling is the idle script's; a session's calls return once the app is done
      if (!app.session) await app.page.addInitScript(installIdle, idleVersion());
      return { app, version: await driver.open(app.page), how: 'started' };
    }
    let app = await appPage(browser, pooled, driver.scope ?? driver.url, { shared: !flag('--headed'), fresh: flag('--fresh'), keep: flag('--keep-windows') });
    // the window's page in front: its Clipboard API works only there, and a tab behind another can crawl
    await app.page.bringToFront();
    if (app.reused) {
      const probe: Doc = isText ? { text: '- a\n- b\n', sel: { anchor: 7, head: 7 } } : { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } };
      let why = '';
      // read once the app settles, as a test's state is (Dynalist puts the caret in after the load returns)
      const works = await driver
        .load(app.page, probe)
        .then(() => app.page.evaluate(() => (window as { __ourusIdle?: { wait(o: object): Promise<unknown> } }).__ourusIdle?.wait({ shortTimer: 300, quiet: 100, timeout: 5000 })))
        .then(() => driver.read(app.page))
        .then((o) => sameDoc(o, probe) || ((why = `it holds ${JSON.stringify(o)}`), false))
        .catch((e: Error) => ((why = e.message.split('\n')[0]!), false));
      if (works) return { app, version: await app.page.evaluate(() => (window as Marked).__ourusVersion), how: 'reused from an earlier run' };
      say(`the window an earlier run left doesn't take a document (${why}): loading the app anew`);
      await app.page.close();
      app = await appPage(browser, pooled, driver.scope ?? driver.url, { shared: !flag('--headed'), fresh: true, keep: flag('--keep-windows') });
    }
    await app.page.addInitScript(installIdle, idleVersion());
    // a window its app didn't open in closes, not left blank in the shared browser
    const version = await driver.open(app.page).catch(async (e: unknown) => {
      await app.release().catch(() => {});
      throw e;
    });
    await app.page.evaluate(([name, v]) => Object.assign(window as Marked, { __ourusApp: name, __ourusVersion: v }), [pooled, version] as const);
    return { app, version, how: 'loaded' };
  }
  function detail(plan: Plan, o: Outcome): string {
    if (o.verdict === 'error') return `  error at step ${o.step + 1}: ${o.error}`;
    const step = plan.steps[o.step]!;
    const lines = [`  line ${step.line}: > ${step.actions.join(' ')}`];
    if (step.want && o.got[o.step]) lines.push('  expected:', indent(drawDoc(step.want)), `  ${driver.longId}:`, indent(drawDoc(o.got[o.step]!)));
    if (step.caretLost) lines.push(`  (the expected caret isn't compared: ${step.caretLost})`);
    if (step.clipboard !== undefined && o.clipboards[o.step] !== step.clipboard) lines.push(`  clipboard: expected ${JSON.stringify(step.clipboard)}, got ${JSON.stringify(o.clipboards[o.step])}`);
    return lines.join('\n');
  }

  const signature = (o: Outcome): string => JSON.stringify([o.verdict, o.got, o.clipboards, o.error]);

  // the examples, in the spec's order, taken by whichever worker is free; what came out said in that
  // order too, each as soon as those before it are done
  const queue = [...unique.values()];
  const done: (Result | undefined)[] = [];
  let next = 0;
  let shown = 0;
  const show = (): void => {
    for (; done[shown]; shown++) {
      const { plan, names, outcome, flaky } = done[shown]!;
      const tag = `${outcome.verdict}${flaky ? ' FLAKY' : ''}`;
      if (outcome.verdict !== 'agree' || flaky || verbose) {
        say(`${tag.padEnd(10)} ${names.join(' = ')}${plan.notes.length ? `  [${plan.notes.join(', ')}]` : ''}  ${outcome.ms}ms`);
        if (outcome.verdict !== 'agree') say(detail(plan, outcome));
        if (flaky) say(`  but ${flaky}`);
      }
      for (const u of outcome.unsettled) say(`  unsettled after ${u}`);
    }
  };
  const work = async (w: Worker): Promise<void> => {
    for (let i = next++; i < queue.length; i = next++) {
      const { plan, names } = queue[i]!;
      let outcome = await runPlan(w, plan);
      // a promise of the app's that never settles is collected instead of waited on (V8's inspector holds
      // an evaluation's promise weakly): rare, and nothing of the example's, so it runs once more
      if (outcome.verdict === 'error' && /Resulting promise was garbage collected/.test(outcome.error ?? '')) {
        say(`again      ${names.join(' = ')}: ${outcome.error}`);
        outcome = await runPlan(w, plan);
      }
      // the app's page is gone (it crashed; the machine ran out of processes): every example after would
      // be an error of no app's doing, and the report one to copy over the last; the run stops, writing
      // nothing
      if (outcome.verdict === 'error' && /Target crashed|Target page, context or browser has been closed|Browser has been closed/.test(outcome.error ?? '')) {
        console.error(`${driver.displayName}'s page is gone at ${names.join(' = ')} (${outcome.error}): stopped, with no report and no run data written`);
        process.exit(1);
      }
      let flaky: string | undefined;
      for (let k = 1; k < repeat && !flaky; k++) {
        const again = await runPlan(w, plan);
        if (signature(again) !== signature(outcome)) flaky = `run ${k + 1}: ${again.verdict}${again.verdict !== 'agree' ? `\n${detail(plan, again)}` : ''}`;
      }
      done[i] = { plan, names, outcome, ...(flaky && { flaky }) };
      show();
    }
  };
  // each worker: a place in a pool as one has room (a browser's window, or the driver's own app's: an
  // Obsidian's), its page readied, then examples from the queue as they come; the first waits as long as
  // it takes, the others only while examples are left
  const readied: Ready[] = [];
  const browsers: Browser[] = [];
  let version: string | undefined;
  const join = async (k: number): Promise<void> => {
    const gone = k === 0 ? undefined : (): boolean => next >= queue.length;
    let r: Ready | null;
    let b: Browser | null = null;
    try {
      if (driver.launch) r = await ready(null, gone);
      else {
        b = await launch(flag('--headed'), say, pooled, gone, driver.browsers);
        if (!b) return;
        browsers.push(b);
        r = await ready(b);
      }
    } catch (e) {
      // a worker that can't open the app leaves the examples to the others; the first's failure is the run's
      if (k === 0 || e instanceof LoginRequired) throw e;
      say(`worker ${k + 1} couldn't open ${driver.displayName}, the others go on: ${String(e).slice(0, 200)}`);
      return;
    }
    if (!r) return;
    if (b) r.browser = b;
    // which worker is ready first, decided here: workers ready together all pushed before any check after an await
    const nth = readied.push(r);
    const w: Worker = { page: r.app.page, actor: r.app.session ? sessionActor(r.app.session) : pageActor(r.app.page), typesAtOnce: !!r.app.session, holdClipboard: r.app.clipboard, configured: null };
    await w.actor.front();
    if (!r.app.session) w.page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    if (nth === 1) {
      version = r.version;
      say(`${driver.displayName}${version ? ` ${version}` : ''} at ${driver.url}, ${r.how} in ${((Date.now() - opened) / 1000).toFixed(1)}s; ${unique.size} examples to run (${plans.length} tests), ${tests.length - plans.length} skipped${count > 1 ? `; up to ${count} workers` : ''}`);
    } else say(`worker ${nth} joined (${r.how})`);
    await work(w);
  };
  await Promise.all(Array.from({ length: count }, (_, k) => join(k))).catch((e: unknown) => {
    // an app behind a login without a session: what to give it, not a stack
    if (!(e instanceof LoginRequired)) throw e;
    console.error(`${driver.displayName} wants a signed-in session. ${e.message}`);
    return process.exit(LOGIN_EXIT);
  });
  workersUsed = readied.length;
  results.push(...(done as Result[]));
  // each worker's window closes, the shared browsers staying up for the next run (an instance of
  // Obsidian's stops with its last window, `obsidian/obsidian.ts`)
  // each worker disconnects holding its browser's clipboard: a connection's end resets the permissions
  // it granted, the clipboard's, for every page of the browser, so another run's example reading the
  // clipboard then would read nothing (the next to hold it grants them again)
  for (const r of readied) {
    const unhold = await r.app.clipboard?.();
    await r.app.release().catch((e) => say(`couldn't release ${driver.displayName}: ${String(e).slice(0, 200)}`));
    await r.browser?.close();
    unhold?.();
  }
  for (const b of browsers) if (!readied.some((r) => r.browser === b)) await b.close();
  unlockApp();
  return version;
}

// ------------------------------------------------------------------ summary

const tally = new Map<string, number>();
for (const r of results) {
  const kind = r.plan.notes.length ? 'adapted' : 'original';
  const k = `${r.outcome.verdict}|${kind}`;
  tally.set(k, (tally.get(k) ?? 0) + r.names.length);
}
const count = (v: string, kind?: string): number => [...tally].filter(([k]) => k.startsWith(`${v}|`) && (!kind || k.endsWith(`|${kind}`))).reduce((n, [, c]) => n + c, 0);
const verdicts = ['agree', 'caret', 'whitespace', 'disagree', 'error'] as const;
say(`\n${driver.displayName}: ` + verdicts.map((v) => `${v} ${count(v)}${isText ? '' : ` (${count(v, 'original')} original)`}`).join(', ') + `; skipped ${tests.length - plans.length}`);
const flakes = results.filter((r) => r.flaky).length;
if (repeat > 1) say(`flaky over ${repeat} runs: ${flakes}`);
if (skipped.size) say('skipped, by reason: ' + [...skipped].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k} ${v.length}`).join(', '));
if (notRun.size) say('not run as they are now, by reason: ' + [...notRun].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k} ${v.length}`).join(', '));
const unsettledRuns = results.filter((r) => r.outcome.unsettled.length).length;
if (unsettledRuns) say(`${unsettledRuns} examples had actions after which ${driver.displayName} didn't settle (see "unsettled after" above)`);
if (errors.length) say(`page errors: ${errors.length} (first: ${errors[0]})`);
const run = runData(results, version);
if (!regenerating && !probing) keep(run);
writeJson(run);
// a probe's run is its JSON alone: no results kept, no report
if (probing) process.exit(0);

/** Keeps what the app did in the examples run (`FileRun`), by spec file: a file's own where it ran every example of it, else its `.partial.json`. */
function keep(run: AppRun): void {
  fileRuns(); // a run of the whole spec from before, split first
  const all = allTests();
  const selected = new Set(tests.map((t) => t.name));
  for (const file of new Set(run.examples.map((e) => e.file))) {
    const ran = run.examples.filter((e) => e.file === file);
    const whole = !flag('--strict') && !flag('--ignore-options') && all.filter((t) => t.file === file).every((t) => selected.has(t.name));
    writeFileRun({ type: 'SxS', app: driver.longId, file, version: run.version, command: run.command, elapsed_s: run.elapsed_s, ran: new Date().toISOString(), examples: ran }, !whole);
  }
}

// traffic: what the proxy fetched or passed through live is what a warm cache should not need, and
// what it blocked may be something an app needs; -v lists every host and URL
if (!regenerating) {
  const stats = await proxyStats();
  const served = Object.values(stats).flatMap((b) => Object.entries(b));
  const sum = (how: string): number => served.filter(([h]) => h === how).reduce((n, [, c]) => n + c.n, 0);
  say(`proxy: ${sum('hit')} from cache, ${sum('miss')} fetched and cached, ${sum('live') + sum('live-ws')} live, ${sum('blocked')} blocked`);
  for (const [host, byHow] of Object.entries(stats).sort()) {
    const hows = Object.entries(byHow).filter(([how]) => verbose || how !== 'hit');
    if (!hows.length) continue;
    say(`  ${host}: ${hows.map(([how, c]) => `${how} ${c.n}`).join(', ')}`);
    if (verbose) for (const [how, c] of hows) for (const u of c.urls) say(`    ${how.padEnd(8)} ${u.slice(0, 200)}`);
  }
}

// ------------------------------------------------------------------ report

// in .sxs/results/<app>/, beside the run as data; a run of every example, beside the driver too, checked in
const reported = report();
writeFileSync(lastRun(driver.longId, 'md', partialRun), inResults(reported));
say(`wrote ${relative(process.cwd(), lastRun(driver.longId, 'md', partialRun))} and its run as data beside it`);
if (selectors.length === 0 && !flag('--strict') && !flag('--ignore-options') && !flag('--no-report')) {
  writeFileSync(join(here, `${driver.longId}.md`), reported);
  say(`copied it to sxs/${driver.longId}.md`);
}

function report(): string {
  /** A heading's anchor, as GitHub makes it. */
  const slug = (heading: string): string => heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
  /** An example's spec file, its ID (its heading there), and that heading's anchor. */
  const parts = (name: string): { file: string; title: string; anchor: string } => {
    return { file: fileOf(name), title: name, anchor: slug(name) };
  };
  /** A section's heading: the examples that came out a way (adapted ones saying so), or were skipped or not run, and how many. */
  const heading = (what: string, n: number, kind?: string): string => {
    const s = kind === 'adapted' ? `adapted: ${what}` : what;
    return `${s[0]!.toUpperCase()}${s.slice(1)} (${n})`;
  };
  /** A count, linked to its section. */
  const linked = (n: number, what: string, kind?: string): string => `[${n}](#${slug(heading(what, n, kind))})`;
  const href = (name: string): string => `../spec/${parts(name).file}#${parts(name).anchor}`;
  const fence = (kind: string, body: string): string => {
    const longest = Math.max(2, ...(body.match(/`+/g) ?? []).map((r) => r.length));
    const f = '`'.repeat(longest + 1);
    return `${f}${kind}\n${body.replace(/\n$/, '')}\n${f}`;
  };
  /**
   * Buffers side by side in an HTML table, a column per buffer: each fenced (a `buffer` unless it says),
   * between blank lines so Markdown renders it.
   */
  const sideBySide = (cols: { head: string; body: string; kind?: string }[]): string[] => [
    '<table>',
    `<tr>${cols.map((c) => `<th>${c.head}</th>`).join('')}</tr>`,
    '<tr valign="top"><td>',
    ...cols.flatMap((c, i) => [...(i ? ['</td><td>'] : []), '', fence(c.kind ?? 'buffer', c.body), '']),
    '</td></tr>',
    '</table>',
  ];
  // the examples of each spec file, in the spec's order: how many came out each way or were skipped, and
  // (for a block app) how many of those run were original outlines and how many adapted
  const byFile = new Map(tests.map((t) => [t.file, new Map<string, number>()]));
  const tallyIn = (name: string, ...ks: string[]): void => {
    const m = byFile.get(parts(name).file)!;
    for (const k of ks) m.set(k, (m.get(k) ?? 0) + 1);
  };
  for (const r of results) for (const n of r.names) tallyIn(n, r.outcome.verdict, r.plan.notes.length ? 'adapted' : 'original');
  for (const names of skipped.values()) for (const n of names) tallyIn(n, 'skipped');
  for (const names of notRun.values()) for (const n of names) tallyIn(n, 'not run');
  const columns = [...verdicts, 'skipped', ...(notRun.size ? ['not run'] : [])];
  const kinds = isText ? [] : ['original', 'adapted'];
  /** A count's share of all the examples, to two significant digits: `38%`, `6.6%`. */
  const percent = (n: number): string => `${Number(((100 * n) / tests.length).toPrecision(2))}%`;
  /** A count with its share: `175 (38%)`; the count shown as given (linked, say). */
  const share = (n: number, shown: string | number = n): string => `${shown} (${percent(n)})`;
  const bold = (s: string | number): string => `**${s}**`;
  const row = (cells: (string | number)[]): string => `| ${cells.join(' | ')} |`;
  /** A count in a table, blank for none; totals show theirs. */
  const cell = (n: number): string | number => n || '';
  const allFiles = (c: string): number => [...byFile.values()].reduce((n, m) => n + (m.get(c) ?? 0), 0);
  // a row per file, its total bold; then the total row, bold, each column's share of all the examples
  const perFile = [
    'Per-file:',
    '',
    row(['', ...columns, 'total', ...kinds]),
    `|${' --- |'.repeat(columns.length + kinds.length + 2)}`,
    ...[...byFile].map(([file, m]) => {
      const of = (c: string): number => m.get(c) ?? 0;
      return row([`[${file}](../spec/${file})`, ...columns.map((c) => cell(of(c))), bold(columns.reduce((n, c) => n + of(c), 0)), ...kinds.map((c) => cell(of(c)))]);
    }),
    row([bold('total'), ...columns.map((c) => bold(share(allFiles(c)))), bold(tests.length), ...kinds.map((c) => bold(share(allFiles(c))))]),
    '',
  ];
  const ran = (kind?: string): number => verdicts.reduce((n, v) => n + count(v, kind), 0);
  // the same columns as per file, and the same bold totals: (for a block app) a row each for original
  // and adapted examples, then the total row, each column's share of all the examples; a count links to
  // its subsection, where it has one (agreements have none, nor a block app's totals of a verdict)
  const skips = tests.length - plans.length;
  const unrun = [...notRun.values()].reduce((n, names) => n + names.length, 0);
  // a text app's one row needs no label: its leftmost column goes
  const labelled = (label: string, cells: (string | number)[]): (string | number)[] => (isText ? cells : [label, ...cells]);
  const summary = [
    'Summary:',
    '',
    row(labelled('', [...columns, 'total'])),
    `|${' --- |'.repeat(columns.length + (isText ? 1 : 2))}`,
    ...kinds.map((k) => row([k, ...verdicts.map((v) => (v !== 'agree' && count(v, k) ? linked(count(v, k), v, k) : cell(count(v, k)))), '', ...(notRun.size ? [''] : []), bold(ran(k))])),
    row(labelled(bold('total'), [
      ...verdicts.map((v) => bold(share(count(v), isText && v !== 'agree' && count(v) ? linked(count(v), v) : count(v)))),
      bold(share(skips, skips ? linked(skips, 'skipped') : skips)),
      ...(notRun.size ? [bold(share(unrun, linked(unrun, 'not run')))] : []),
      bold(tests.length),
    ])),
    '',
  ];
  // what ran, as frontmatter; values quoted as JSON, which YAML reads as double-quoted strings
  const out: string[] = [
    '---',
    `type: ${JSON.stringify('SxS')}`,
    `app: ${JSON.stringify(driver.longId)}`,
    `version: ${JSON.stringify(version ?? 'unknown')}`,
    `url: ${JSON.stringify(driver.url)}`,
    `model: ${JSON.stringify(driver.model)}`,
    `command: ${JSON.stringify(`node sxs/run.ts ${driver.longId}`)}`,
    // the run data's, not the clock's a moment later
    `elapsed_s: ${run.elapsed_s}`,
    // the run's workers, if more than one (its time is one worker's over about this many)
    ...((previous?.workers ?? workersUsed) > 1 ? [`workers: ${previous?.workers ?? workersUsed}`] : []),
    '---',
    '',
    `# ${driver.displayName} vs ourus`,
    '',
    ...summary,
    ...perFile,
  ];
  // original outlines first, then adapted examples: each with its disagreements drawn (the agreements are
  // only counted, in the summary); a text app's examples are all as written
  const sections: [string | undefined, Result[]][] = isText
    ? [[undefined, results]]
    : [
        ['original', results.filter((r) => !r.plan.notes.length)],
        ['adapted', results.filter((r) => r.plan.notes.length)],
      ];
  for (const [kind, group] of sections) {
    // a section per verdict (disagree, whitespace, caret, error): its heading says each example's
    for (const verdict of ['disagree', 'whitespace', 'caret', 'error'] as const) {
      const examples = group.filter((r) => r.outcome.verdict === verdict);
      if (!examples.length) continue;
      out.push(`## ${heading(verdict, examples.reduce((n, r) => n + r.names.length, 0), kind)}`, '');
      for (const r of examples) {
        const { plan, outcome } = r;
        const adapted = plan.notes.length > 0;
        out.push(`### [${parts(plan.name).title}](${href(plan.name)})`, '');
        // above the buffers: how the example was adapted
        const notesLine = adapted ? `Adapted: ${plan.notes.join(', ')}` : '';
        // the clipboard the app was given, a table of its own above the command: headed "clipboard"
        // across a column per MIME type, each named in a row of its own; one named in the heading
        const formats = Object.entries(plan.clipboard ?? {});
        const clipboard = formats.length
          ? [
              '<table>',
              ...(formats.length === 1
                ? [`<tr><th>clipboard (${formats[0]![0]})</tr>`]
                : [`<tr><th colspan=${formats.length}>clipboard</tr>`, `<tr>${formats.map(([type]) => `<td>${type}`).join('')}</tr>`]),
              '<tr valign="top"><td>',
              ...formats.flatMap(([, body], i) => [...(i ? ['</td><td>'] : []), '', fence('clipboard', body), '']),
              '</td></tr>',
              '</table>',
              '',
            ]
          : [];
        // one step: the clipboard, its command, then the start, the app's outcome and ourus's side by side
        const [only] = plan.steps;
        const once = outcome.got[0];
        if (plan.steps.length === 1 && outcome.verdict !== 'error' && only!.want && once) {
          out.push(...clipboard, `> ${only!.actions.join(' ')}`, '');
          if (notesLine) out.push(notesLine, '');
          out.push(...sideBySide([{ head: 'buffer', body: drawDoc(plan.initial) }, { head: driver.longId, body: drawDoc(once) }, { head: 'ourus', body: drawDoc(only!.want) }]), '');
        } else {
          // more steps: the clipboard and the start, then each step's command and the app's outcome,
          // beside ourus's where they differ; a buffer the two agree on stands alone
          out.push(...clipboard);
          if (notesLine) out.push(notesLine, '');
          out.push(...sideBySide([{ head: 'buffer', body: drawDoc(plan.initial) }]), '');
          plan.steps.forEach((step, i) => {
            out.push(`> ${step.actions.join(' ')}`, '');
            if (outcome.verdict === 'error' && i >= outcome.step) {
              if (i === outcome.step) out.push(`Error: ${outcome.error}`, '');
              return;
            }
            const got = outcome.got[i];
            if (step.want && got && compareDocs(step.want, got, step.sections, flavorOf(plan)) !== 'agree') out.push(...sideBySide([{ head: driver.longId, body: drawDoc(got) }, { head: 'ourus', body: drawDoc(step.want) }]), '');
            else if (got) out.push(...sideBySide([{ head: 'buffer', body: drawDoc(got) }]), '');
          });
        }
        // an adapted example: last, the spec's buffers as written, the start and after each step
        if (adapted) {
          const drawn = plan.steps.filter((s) => s.drawn !== undefined);
          const after = (s: (typeof drawn)[number]): string => (plan.steps.length === 1 ? 'ourus' : s.actions.join(' '));
          out.push('Original:', ...sideBySide([{ head: 'buffer', body: plan.test.initial.buffer }, ...drawn.map((s) => ({ head: after(s), body: s.drawn! }))]), '');
        }
      }
    }
  }
  // the examples skipped or not run, one table, a row each in the spec's order under a row for its file,
  // so a new one is a row added
  const index = new Map(tests.map((t, i) => [t.name, i]));
  const table = (what: string, byWhy: Map<string, string[]>): string[] => {
    const rows = [...byWhy].flatMap(([why, names]) => names.map((name) => ({ name, why }))).sort((a, b) => index.get(a.name)! - index.get(b.name)!);
    return [
      `## ${heading(what, rows.length)}`,
      '',
      '| example | why |',
      '| --- | --- |',
      ...rows.flatMap(({ name, why }, i) => {
        const { file, title: example } = parts(name);
        const row = `| [${example}](${href(name)}) | ${why.replace(/\|/g, '\\|')} |`;
        return i && parts(rows[i - 1]!.name).file === file ? [row] : [`| **${file}** | |`, row];
      }),
      '',
    ];
  };
  if (skipped.size) out.push(...table('skipped', skipped));
  if (notRun.size) out.push(...table('not run', notRun));
  return out.join('\n');
}
