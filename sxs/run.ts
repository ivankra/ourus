/// <reference lib="dom" />
// Replays the spec (spec/*.md) in another app, headless, and reports where it agrees with ourus.
//
//   node sxs/run.ts <app> [selector...] [options]     (or: npm run sxs -- <app> ...)
//   node sxs/run.ts <app>,<app>... [selector...] [options] [--jobs=N]
//   node sxs/run.ts all [selector...] [options] [--jobs=N]
//
// <app> is a directory here with a driver.ts (sxs/logseq/). A selector picks tests: a
// file (`indent.md`, `indent`), one test (`indent.md#indent3`), or any part of a test's full name
// (`Indent3`, `enter.md › Enter1`); none runs them all. Several apps, or `all` of them, run side by
// side, a run of this for each, and their verdicts come out as one table ("several apps", below).
//
//   -v, --verbose   print every test's verdict, not only the disagreements, and every URL the proxy saw
//   --strict        only examples that are original outlines (no paragraph, blank line, ... adapted)
//   --repeat=N      run each example N times and report the ones whose outcome varies
//   --list          print what would run and what is skipped, and stop (no browser)
//   --headed        show the browser
//   --slow=MS       pause after every action, on top of settling (to watch, or to rule timing out)
//   --offline       serve only what the proxy has cached; a miss fails instead of being fetched
//   --fresh         load the app anew, rather than take over the page an earlier run left loaded
//   --no-report     don't copy the report into <app>/sxs.md (a run of every test does by default)
//   --json=FILE     write the run as data to FILE too, as .sxs/<app>/sxs.json has it
//   --jobs=N        with several apps, run at most N at once (all of them by default)
//   --table         with several apps, run nothing: write the table from the verdicts the last runs left
//   --regenerate-report  run no app: judge what it did in its last run against the spec as it is now, and
//                   write the report (and with several apps, the table) again ("regenerating", below)
//   --timing        print how long the app took to settle after each action, and what kept it busy
//
//   node sxs/run.ts --stop    stops the shared proxy and browsers, and the servers drivers started
//
// The proxy, a headless Chromium and the app's loaded page are shared between runs (lib/browser.ts):
// started by the first run that needs them and left running. Each test starts from a fresh document
// in the loaded app. After every key the runner waits for the app to settle (lib/idle.ts) rather than
// for a fixed time.

import { spawn } from 'node:child_process';
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright-core';
import { Config } from '../src/config.ts';
import { appPage, ensureProxy, launch, proxyStats, stopShared, type AppPage } from './lib/browser.ts';
import type { Doc, Driver, Session } from './lib/driver.ts';
import { idleVersion, installIdle, type IdleOptions, type IdleResult } from './lib/idle.ts';
import { compareOutlines, draw, project, readOutline, sameOutline, type Outline, type Verdict } from './lib/outline.ts';
import { compareTexts, drawTextDoc, readTextDoc, sameText, type TextDoc } from './lib/text.ts';
import { adapt, allTests, selects, type Plan, type PlanStep } from './lib/plan.ts';
import { passes } from '../test/spec-run.ts';
import { cacheDir } from './proxy.ts';

const started = Date.now();
const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(name);
const option = (name: string): string | undefined => args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
const [app, ...selectors] = args.filter((a) => !a.startsWith('-'));
if (flag('--stop')) {
  await stopShared((line) => console.log(line));
  process.exit(0);
}
// ------------------------------------------------------------------ several apps
//
// Several apps (`logseq,dynalist`, or `all`) run side by side: a run of this for each, in a process
// of its own (so the apps in browsers and the ones that start themselves go together), at
// most `--jobs` at once, and one table of every example's verdict in each app. Each run's output goes
// to `.sxs/<app>/sxs.log`, beside its report and run as data. The table is printed (every row for a few
// examples or with -v, else the rows where the apps don't all agree), and written to `.sxs/sxs.md`, with
// its heatmap, linking each app's report (`<app>/sxs.md`); for every app on the whole spec, copied here too.

const here = fileURLToPath(new URL('./', import.meta.url));
/**
 * What the last run of an app left, not checked in: `.sxs/<app>/sxs.{md,json,log}`; `.sxs/` mirrors
 * this directory (`.sxs/sxs.md`, `.sxs/<app>/sxs.md`), so the links of a report or the table hold in both.
 */
const lastRun = (app: string, ext: 'md' | 'json' | 'log'): string => join(cacheDir, app, `sxs.${ext}`);

/**
 * What an app did in a spec file's examples, as the last run of each left it (`.sxs/<app>/<file>.json`,
 * `indent.json` for `indent.md`): a run replaces the examples it ran and keeps the file's others, so runs
 * of a few examples add up; a run of every example of a file replaces them all. A regenerated report is
 * made from them (a run's own, `sxs.json`, from what it ran).
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
const fileRun = (app: string, file: string): string => join(cacheDir, app, `${file.replace(/\.md$/, '')}.json`);

/**
 * A run as data: what its report says, and what the app did in each example, every state drawn as
 * the spec draws a buffer. Every run writes it beside its report (`.sxs/<app>/sxs.json`); a run of
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
  /** `indent.md › Indent1`: its spec file, the anchor of its heading there, the line of its first block. */
  name: string;
  file: string;
  anchor: string;
  line: number;
  verdict: Verdict | 'error';
  /** The step the verdict is about (the first that came out so), where it isn't `agree`. */
  step?: number;
  /** What its buffers lost or had reinterpreted on blocks (lib/outline.ts); none for an original outline, and a text app's. */
  adapted: string[];
  /** Its options as the spec sets them (the file's frontmatter, then its config block). */
  options: Record<string, string>;
  /** Where repeated runs (`--repeat`) didn't come out the same: the first that differed. */
  flaky?: string;
  error?: string;
  /** Actions after which the app didn't settle in time, and what was pending. */
  unsettled?: string[];
  /** The clipboard it starts with. */
  clipboard: string | null;
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

/** Every app: a directory here with a driver (`lib/`'s `driver.ts` is what a driver provides, no app). */
const allApps = (): string[] =>
  readdirSync(here, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'lib' && existsSync(join(here, d.name, 'driver.ts')))
    .map((d) => d.name)
    .sort();

const VERDICTS = ['agree', 'caret', 'whitespace', 'disagree', 'error'] as const;
/** A verdict in the table: printed, and in Markdown. */
const CELL: Record<string, [string, string]> = {
  agree: ['ok', '✓'],
  caret: ['caret', 'C'],
  whitespace: ['space', 'S'],
  disagree: ['DIFF', '✗'],
  error: ['ERROR', 'E'],
  skipped: ['-', ''],
  missing: ['?', '?'],
};

/** The anchor of an example's heading in its spec file (as run.ts's report links it). */
const anchor = (name: string): string =>
  name
    .split(' › ')
    .pop()!
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

async function runMany(spec: string, selectors: string[], flags: string[]): Promise<number> {
  const say = (line: string): void => console.log(line);
  let apps = spec === 'all' ? allApps() : spec.split(',').filter(Boolean);
  const unknown = apps.filter((a) => !existsSync(join(here, a, 'driver.ts')));
  if (unknown.length || !apps.length) {
    console.error(`no such app: ${unknown.join(', ') || spec}; the apps are ${allApps().join(', ')}`);
    return 2;
  }
  const jobs = Math.max(1, Number(flags.find((f) => f.startsWith('--jobs='))?.slice('--jobs='.length) ?? apps.length) || apps.length);
  const pass = flags.filter((f) => !f.startsWith('--jobs=') && !f.startsWith('--json='));
  const verbose = pass.includes('-v') || pass.includes('--verbose');
  const tableOnly = pass.includes('--table');
  const regenerating = pass.includes('--regenerate-report');
  const t0 = Date.now();
  const exits = new Map<string, number>();
  const failed = new Set<string>();

  if (tableOnly) {
    // the verdicts of each app's last run (`.sxs/<app>/sxs.json`), as they are; an app with none is left out
    for (const app of apps) {
      const r = read(lastRun(app, 'json'));
      say(r ? `${app.padEnd(24)} ${r.version ?? ''}, run in ${r.elapsed_s}s` : `${app.padEnd(24)} no verdicts (${relative(process.cwd(), lastRun(app, 'json'))}): left out`);
    }
    apps = apps.filter((app) => read(lastRun(app, 'json')));
  } else {
    // the proxy, up before the runs that share it, so they don't race to start it (each app has a browser of its own)
    if (!pass.includes('--list') && !regenerating) await ensureProxy(pass.includes('--offline'), say);

    say(`${apps.length} apps, ${Math.min(jobs, apps.length)} at a time: ${apps.join(', ')}; logs in ${relative(process.cwd(), cacheDir)}/<app>/sxs.log`);
    const queue = [...apps];
    const one = async (app: string): Promise<void> => {
      const log = lastRun(app, 'log');
      const json = lastRun(app, 'json');
      mkdirSync(join(log, '..'), { recursive: true });
      // the run's own data, written anew: none since it started, and it failed (what it had, the files' keep)
      const since = Date.now();
      const out = openSync(log, 'w');
      const child = spawn(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url), app, ...selectors, ...pass], { stdio: ['ignore', out, out] });
      const code = await new Promise<number>((resolve) => child.on('exit', (c) => resolve(c ?? 1)));
      closeSync(out);
      exits.set(app, code);
      const r = existsSync(json) && statSync(json).mtimeMs >= since ? read(json) : null;
      if (!r) failed.add(app);
      const s = (Date.now() - t0) / 1000;
      if (pass.includes('--list')) return;
      if (!r) say(`${app.padEnd(24)} failed (exit ${code}): ${relative(process.cwd(), log)}`);
      else say(`${app.padEnd(24)} ${VERDICTS.map((v) => `${v} ${r.examples.filter((e) => e.verdict === v).length}`).join(', ')}; skipped ${r.skipped.length}${r.notRun?.length ? `; not run ${r.notRun.length}` : ''}  (${r.elapsed_s}s, done at ${s.toFixed(0)}s)`);
    };
    await Promise.all(
      Array.from({ length: Math.min(jobs, apps.length) }, async () => {
        for (let app = queue.shift(); app; app = queue.shift()) await one(app);
      }),
    );
  }
  if (pass.includes('--list')) {
    for (const app of apps) say(`\n== ${app}\n${readFileSync(lastRun(app, 'log'), 'utf8').trimEnd()}`);
    return [...exits.values()].some((c) => c !== 0) ? 1 : 0;
  }

  // the table: the examples selected, in the spec's order, and each app's verdict
  const names = allTests()
    .filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t)))
    .map((t) => `${t.file} › ${t.name}`);
  const byApp = new Map<string, AppRun | null>(apps.map((app) => [app, failed.has(app) ? null : read(lastRun(app, 'json'))]));
  const cell = (app: string, name: string): string => {
    const r = byApp.get(app);
    if (!r) return 'missing';
    return r.examples.find((e) => e.name === name)?.verdict ?? (r.skipped.some((e) => e.name === name) ? 'skipped' : 'missing');
  };
  // the apps by how many examples agree, the most first: the order of every table
  const agrees = (app: string): number => names.filter((n) => cell(app, n) === 'agree').length;
  const order = [...apps].sort((x, y) => agrees(y) - agrees(x) || x.localeCompare(y));
  // an example an app ran adapted (its buffers projected onto blocks, lib/outline.ts), per app
  const adapted = (app: string, name: string): string[] => byApp.get(app)?.examples.find((e) => e.name === name)?.adapted ?? [];
  const rows = names.map((name) => ({ name, cells: order.map((app) => cell(app, name)), adapted: order.map((app) => adapted(app, name)) }));

  // printed: every row of a few, or with -v; else those where the apps don't all agree
  const shown = verbose || rows.length <= 60 ? rows : rows.filter((r) => r.cells.some((c) => c !== 'agree'));
  const width = Math.min(60, Math.max(...shown.map((r) => r.name.length), 10));
  const clip = (s: string): string => (s.length > width ? `${s.slice(0, width - 1)}…` : s.padEnd(width));
  const cols = order.map((a) => Math.max(a.length, 5));
  say('');
  say(`${''.padEnd(width)}  ${order.map((a, i) => a.padEnd(cols[i]!)).join('  ')}`);
  for (const r of shown) say(`${clip(r.name)}  ${r.cells.map((c, i) => CELL[c]![0].padEnd(cols[i]!)).join('  ')}`);
  if (shown.length < rows.length) say(`(${rows.length - shown.length} test cases every app agrees on not shown; -v shows them)`);

  // written to .sxs/, beside the apps' reports; every app on the whole spec, copied beside the
  // reports checked in here too
  const everything = spec === 'all' && selectors.length === 0 && !pass.includes('--strict') && !pass.includes('--no-report');
  // the run's time; a table of runs before, the longest of them (they ran side by side)
  const elapsed = tableOnly || regenerating ? Math.max(0, ...[...byApp.values()].map((r) => r?.elapsed_s ?? 0)) : (Date.now() - t0) / 1000;
  const command = `node sxs/run.ts ${spec}${selectors.length ? ` ${selectors.join(' ')}` : ''}`;
  const written = matrix({ apps: order, byApp, rows, command, elapsed });
  writeFileSync(join(cacheDir, 'sxs.md'), written.md);
  writeFileSync(join(cacheDir, 'sxs-heatmap.svg'), written.svg);
  say(`\nwrote ${relative(process.cwd(), join(cacheDir, 'sxs.md'))}`);
  if (everything) {
    for (const f of ['sxs.md', 'sxs-heatmap.svg']) copyFileSync(join(cacheDir, f), join(here, f));
    say(`copied it to sxs/sxs.md`);
  }
  return [...exits.values()].some((c) => c !== 0) ? 1 : 0;
}

function read<T = AppRun>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

/**
 * The table as Markdown: what ran as frontmatter, the counts per app, then a table per spec file; its
 * links are from `sxs.md` (here or in `.sxs/`): each app's report, `<app>/sxs.md`, the spec, `../spec/`,
 * and the heatmap beside it, `sxs-heatmap.svg`, an SVG (GitHub keeps no colors in a table's cells).
 */
function matrix(o: {
  apps: string[];
  byApp: Map<string, AppRun | null>;
  rows: { name: string; cells: string[]; adapted: string[][] }[];
  command: string;
  elapsed: number;
}): { md: string; svg: string } {
  const toReport = (app: string): string => `${app}/sxs.md`;
  const row = (cells: (string | number)[]): string => `| ${cells.join(' | ')} |`;
  // an example by its own name (not its sections'), at most 20 characters and an ellipsis
  const short = (name: string): string => ([...name].length > 20 ? `${[...name].slice(0, 20).join('').trimEnd()}…` : name);
  // the examples' table: each example, how many apps agree on it, then each app's verdict
  const count = (app: string, v: string): number => o.rows.filter((r) => r.cells[o.apps.indexOf(app)] === v).length;
  // examples a regenerated report's app hasn't run as the spec has them now, a column if any
  const columns = [...VERDICTS, 'skipped', ...(o.rows.some((r) => r.cells.includes('missing')) ? ['missing'] : [])];
  // the heatmap has ourus too, its verdict its own run of the example (a pending one disagrees)
  const tests = new Map(allTests().map((t) => [`${t.file} › ${t.name}`, t]));
  const ours = (name: string): string => (tests.has(name) ? (passes(tests.get(name)!) ? 'agree' : 'disagree') : 'missing');
  const map = heatmap({ apps: [OURUS, ...o.apps], byApp: o.byApp, rows: o.rows.map((r) => ({ name: r.name, cells: [ours(r.name), ...r.cells], adapted: [[], ...r.adapted] })) });
  const out = [
    '---',
    `type: ${JSON.stringify('SxS')}`,
    `command: ${JSON.stringify(o.command)}`,
    `elapsed_s: ${Math.round(o.elapsed)}`,
    '---',
    '',
    '# Every app side by side',
    '',
    `Each test case of the spec, run in each app and compared with ourus (the [legend](#legend) is above`,
    `the test cases). An app's report (its name above its column) has the outcomes and the reasons for its skips.`,
    '',
    '## Summary',
    '',
    // a row per app, its model (block or text), a column per verdict
    row(['', 'model', ...columns.map((c) => (c === 'missing' ? 'not run' : c)), 'total']),
    `| --- | --- |${' --- |'.repeat(columns.length + 1)}`,
    ...o.apps.map((a) => row([`[${a}](${toReport(a)})`, o.byApp.get(a)?.model ?? '', ...columns.map((v) => count(a, v) || ''), `**${o.rows.length}**`])),
    '',
    ...map.lines,
    '',
  ];
  // the examples, one HTML table, so that its columns line up: per spec file, in the spec's order, a
  // header row (the file's name, `agree` and the apps), its examples, and a row, `total`, of each
  // app's agreements in it (blank if it ran none); an empty row between files. No `</td>`s, for size.
  const html = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rows: string[] = [];
  const tr = (cells: string[]): void => void rows.push(`<tr>${cells.join('')}</tr>`);
  for (const f of [...new Set(o.rows.map((r) => r.name.split(' › ')[0]!))]) {
    const inFile = o.rows.filter((x) => x.name.split(' › ')[0] === f);
    const tally = (i: number): string => {
      const ran = inFile.filter((r) => (VERDICTS as readonly string[]).includes(r.cells[i]!)).length;
      return `<td>${ran ? `<b>${inFile.filter((r) => r.cells[i] === 'agree').length}</b>` : ''}`;
    };
    // between files, one or two empty rows: GitHub shades every even row, and each file's header is one
    if (rows.length) {
      const gap = (): void => tr([`<td colspan="${o.apps.length + 3}">`]);
      gap();
      if (rows.length % 2 === 0) gap();
    }
    tr([`<td><b>${html(f)}</b>`, '<td><b>rank</b>', '<td><b>agree</b>', ...o.apps.map((a) => `<td><b><a href="${toReport(a)}"${SHORT[a] ? ` title="${html(a)}"` : ''}>${html(SHORT[a] ?? a)}</a></b>`)]);
    for (const r of inFile) {
      const agree = r.cells.filter((c) => c === 'agree').length;
      const cells = r.cells.map((c, i) => (r.adapted[i]!.length && c !== 'agree' && c !== 'skipped' ? `<td>(${CELL[c]![1]})` : `<td>${CELL[c]![1]}`));
      tr([`<td><a href="../spec/${f}#${anchor(r.name)}">${html(short(r.name.split(' › ').pop()!))}</a>`, `<td>${html(tests.get(r.name)?.options.rank ?? '')}`, `<td align="right">${agree}`, ...cells]);
    }
    tr(['<td><b>total</b>', '<td>', '<td>', ...o.apps.map((_, i) => tally(i))]);
  }
  out.push(
    '## Legend',
    '',
    '| cell | the app, compared with ourus |',
    '| --- | --- |',
    `| ${CELL.agree![1]} | agrees: the same result, caret included |`,
    `| ${CELL.disagree![1]} | disagrees: other text, or (a block app) other blocks, nesting or count |`,
    `| ${CELL.caret![1]} | caret: the same result, the caret elsewhere |`,
    `| ${CELL.whitespace![1]} | spaces: the same but for spaces next to line breaks |`,
    `| ${CELL.error![1]} | error: the run failed, or the app didn't hold the starting state |`,
    `| blank | skipped: the app can't run the example as written (its report says why) |`,
    ...(columns.includes('missing') ? [`| ${CELL.missing![1]} | not run: the app's last run didn't play the example as the spec has it now |`] : []),
    `| (${CELL.disagree![1]}) | in brackets, a difference in an example adapted for the app: its buffers projected onto blocks, so it compares those |`,
    '',
    'An example\'s **rank** is how often users meet it (`core`, `common`, `edge` or `rare`: [the spec\'s README](../spec/README.md)); a file\'s **agree** column counts the apps that agree on the example; its **total** row, the examples each app agrees on.',
    Object.entries(SHORT)
      .filter(([app]) => o.apps.includes(app))
      .map(([app, short]) => `**${short}** is ${app}.`)
      .join(' '),
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

/** Apps by a shorter name in the test cases' table, for its width (the legend says which). */
const SHORT: Record<string, string> = { 'obsidian-true-outliner': 'TO', 'obsidian-outliner': 'outliner', 'obsidian-lp': 'lp', 'emacs-markdown': 'emacs' };

/** ourus's own column in the heatmap: its verdicts are its runs of the examples. */
const OURUS = 'ourus';

/** The heatmap's poles: an outliner of blocks and a Markdown editor of text, the two most unlike kinds. */
const POLES = ['logseq', 'obsidian'] as const;

/**
 * The heatmap: for each two apps, how alike they did in the examples both ran as written, none adapted
 * (`score`: the same result 1, the same but for the caret or spaces ½), colored by it, ourus among them.
 * The apps go from one pole to the other (`POLES`), the rest between them by how like the first they
 * are, less how like the second; without both, block apps first, then text apps.
 */
function heatmap(o: { apps: string[]; byApp: Map<string, AppRun | null>; rows: { name: string; cells: string[]; adapted: string[][] }[] }): { lines: string[]; svg: string } {
  const ran = (c: string): boolean => c !== 'error' && (VERDICTS as readonly string[]).includes(c);
  const examples = new Map(o.apps.map((a) => [a, new Map((o.byApp.get(a)?.examples ?? []).map((e) => [e.name, e]))]));
  /** A verdict's points: agreeing with ourus is 1, a difference only in the caret or in spaces half. */
  const points = (v: string): number => (v === 'agree' ? 1 : v === 'caret' || v === 'whitespace' ? 0.5 : 0);
  /** How two outputs compare, as an app's with ourus's: as outlines where both read as one, else as text. */
  const compare = (x: string, y: string): string => {
    const [ox, oy] = [readOutline(x), readOutline(y)];
    return ox && oy ? compareOutlines(ox, oy) : compareTexts(readTextDoc(x), readTextDoc(y));
  };
  /**
   * How alike two apps did in an example, 0 to 1, or null where it doesn't say (not run by both, run
   * adapted by either, or both apart from ourus from different starts): from the same start, their
   * outputs compared step by step, the worst step counting; else by how each did against ourus.
   */
  const score = (a: string, b: string, row: { name: string; cells: string[]; adapted: string[][] }): number | null => {
    const [i, k] = [o.apps.indexOf(a), o.apps.indexOf(b)];
    const [va, vb] = [row.cells[i]!, row.cells[k]!];
    if (!ran(va) || !ran(vb) || row.adapted[i]!.length || row.adapted[k]!.length) return null;
    // ourus's own outcome where it fails an example isn't recorded: only that it differs from those that pass
    if (a === OURUS || b === OURUS) {
      const [ours, theirs] = a === OURUS ? [va, vb] : [vb, va];
      return ours === 'agree' ? points(theirs) : theirs === 'agree' ? 0 : null;
    }
    const [x, y] = [examples.get(a)!.get(row.name), examples.get(b)!.get(row.name)];
    if (x && y && x.start === y.start && x.steps.length === y.steps.length) {
      const steps = x.steps.flatMap((step, i) => (step.app !== null && y.steps[i]!.app !== null ? [points(compare(step.app, y.steps[i]!.app!))] : []));
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
  const share = (a: string, b: string): number => {
    const { same, of } = alike(a, b);
    return of ? same / of : 0;
  };
  const model = (a: string): string => o.byApp.get(a)?.model ?? '';
  const [near, far] = POLES;
  const poled = o.apps.includes(near) && o.apps.includes(far);
  const lean = (a: string): number => share(a, near) - share(a, far);
  const apps = poled
    ? [near, ...o.apps.filter((a) => a !== near && a !== far).sort((x, y) => lean(y) - lean(x)), far]
    : [...o.apps].sort((x, y) => (model(x) === model(y) ? 0 : model(x) === 'block' ? -1 : 1));
  const label = (a: string): string => (a === OURUS ? 'label ours' : 'label');
  const xml = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // the grid: app names down the left and slanted along the top, a cell per two apps, colored by
  // their share, its count as its title (a tooltip where the SVG is opened as itself)
  const W = 36;
  const H = 22;
  const left = 8 + Math.max(...apps.map((a) => a.length)) * 7;
  const top = 12 + Math.max(...apps.map((a) => a.length)) * 5;
  const width = left + W * apps.length + top;
  const height = top + H * apps.length + 8;
  const svg: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">`,
    // on a transparent ground, the cells edge to edge (`crispEdges`: no seam between two): the labels a
    // gray read on a light page and a dark one alike (GitHub's muted text), the empty cells a
    // translucent gray; brighter labels where the viewer says it is dark (an image is told the
    // system's preference, which needn't be the page's)
    '<style>.label{fill:#8b949e}.ours{font-weight:bold}.empty{fill:rgba(128,128,128,0.15)}' +
      '@media (prefers-color-scheme: dark){.label{fill:#c9d1d9}}</style>',
    ...apps.map((a, k) => `<text class="${label(a)}" transform="translate(${left + W * k + W / 2 - 3},${top - 6}) rotate(-45)">${xml(a)}</text>`),
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
      'Each cell is how alike two apps did, in percent of the examples both ran as written (an example',
      'either ran adapted is left out): one where they end the same counts 1, the same but for the caret',
      'or for spaces ½, otherwise 0, their results compared from the same start, or, from different',
      'starts, as each compares with ourus (both apart from ourus, it is left out). ourus is there too, as',
      'its own runs of the examples have it: its cell with an app is how that app compares with it.',
      poled ? `Apps most like ${near} come first, apps most like ${far} last, ourus among them.` : 'Block apps come first, then text apps.',
      '',
      `![Heatmap: how alike two apps did](sxs-heatmap.svg)`,
    ],
    svg: svg.join('\n'),
  };
}

if (app === 'all' || app?.includes(',')) process.exit(await runMany(app, selectors, args.filter((a) => a.startsWith('-'))));

const verbose = flag('-v') || flag('--verbose');
const repeat = Number(option('--repeat') ?? 1);
const slow = Number(option('--slow') ?? 0);
const timing = flag('--timing');
const regenerating = flag('--regenerate-report');

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
  const dir = join(cacheDir, driver.name);
  const all = (): FileRun[] =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith('.json') && f !== 'sxs.json')
          .map((f) => read<FileRun>(join(dir, f)))
          .filter((r): r is FileRun => r?.type === 'SxS' && typeof r.file === 'string')
      : [];
  const runs = all();
  const whole = runs.length ? null : read(lastRun(driver.name, 'json'));
  if (!whole) return runs;
  const ran = statSync(lastRun(driver.name, 'json')).mtime.toISOString();
  for (const file of files) {
    const examples = whole.examples.filter((e) => e.file === file);
    if (examples.length) writeFileRun({ type: 'SxS', app: driver.name, file, version: whole.version, command: whole.command, elapsed_s: whole.elapsed_s, ran, examples });
  }
  return all();
}
function writeFileRun(r: FileRun): void {
  mkdirSync(join(fileRun(r.app, r.file), '..'), { recursive: true });
  writeFileSync(fileRun(r.app, r.file), `${JSON.stringify(r, null, 2)}\n`);
}

/** A regenerated report's last runs: every example's (`FileRun`), with the version, command and time of the latest. */
const previous = regenerating
  ? (() => {
      const runs = fileRuns();
      const latest = runs.reduce<FileRun | null>((a, b) => (a && a.ran > b.ran ? a : b), null);
      return latest && { version: latest.version, command: latest.command, elapsed_s: latest.elapsed_s, examples: runs.flatMap((r) => r.examples) };
    })()
  : null;
if (regenerating && !previous) {
  console.error(`no run of ${driver.title} to regenerate the report from in ${relative(process.cwd(), join(cacheDir, driver.name))}`);
  process.exit(1);
}

// the app's kind of document (`Driver.model`): how one is drawn, compared, and told apart from another
const isText = driver.model === 'text';
const drawDoc = (d: Doc): string => (isText ? drawTextDoc(d as TextDoc) : draw(d as Outline));
const compareDocs = (want: Doc, got: Doc): Verdict => (isText ? compareTexts(want as TextDoc, got as TextDoc) : compareOutlines(want as Outline, got as Outline));
const sameDoc = (a: Doc, b: Doc): boolean => (isText ? sameText(a as TextDoc, b as TextDoc) : sameOutline(a as Outline, b as Outline));

// ------------------------------------------------------------------ choosing and adapting

const tests = allTests().filter((t) => selectors.length === 0 || selectors.some((s) => selects(s, t)));
const plans: Plan[] = [];
const skipped = new Map<string, string[]>();
/** A regenerated report's examples that its last run didn't play as they are now, by why: they want a run. */
const notRun = new Map<string, string[]>();
for (const t of tests) {
  const a = adapt(driver, t);
  const why = 'skip' in a ? a.skip : flag('--strict') && a.plan.notes.length ? `adapted (${a.plan.notes.join(', ')})` : null;
  if (why === null && 'plan' in a) plans.push(a.plan);
  else skipped.set(why!, [...(skipped.get(why!) ?? []), `${t.file} › ${t.name}`]);
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
  const order = new Map(tests.map((t) => [`${t.file} › ${t.name}`, t]));
  const where = (name: string): { file: string; anchor: string; line: number } => ({ file: name.split(' › ')[0]!, anchor: anchor(name), line: order.get(name)!.line });
  const inSpecOrder = <T extends { name: string }>(xs: T[]): T[] => {
    const index = new Map([...order.keys()].map((n, i) => [n, i]));
    return xs.sort((a, b) => index.get(a.name)! - index.get(b.name)!);
  };
  const examples = results.flatMap(({ plan, names, outcome, flaky }) => {
    const steps = plan.steps.map((step, i): RunStep => {
      const reached = outcome.verdict !== 'error' || i < outcome.step;
      const got = reached ? (outcome.got[i] ?? null) : null;
      const ourus = step.want ? drawDoc(step.want) : null;
      const s: RunStep = { line: step.line, actions: [...step.actions], ...(reached && (step.want || step.clipboard !== undefined) && { verdict: stepVerdict(step, got, outcome.clipboards[i]) }), ourus, app: got ? drawDoc(got) : null };
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
    app: driver.name,
    title: driver.title,
    version: version ?? null,
    url: driver.url,
    model: driver.model,
    // a regenerated report's, the run's it was made from
    command: previous?.command ?? `node sxs/run.ts ${[driver.name, ...selectors].join(' ')}`,
    elapsed_s: previous?.elapsed_s ?? Math.round((Date.now() - started) / 1000),
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
    const p = project(drawTextDoc(d), (plan.test.options.flavor ?? 'gfm') as Config['flavor']);
    return draw(p.caretLost ? { ...p.outline, sel: null } : p.outline);
  } catch {
    return null;
  }
}

/** How a step came out: its buffer against the spec's (a caret with no place in a block not compared), and its clipboard. */
function stepVerdict(step: PlanStep, got: Doc | null, clipboard: string | null | undefined): Verdict {
  let v: Verdict = 'agree';
  if (step.want && got) v = compareDocs(step.caretLost ? { ...step.want, sel: null } : step.want, got);
  if (step.clipboard !== undefined && clipboard !== step.clipboard) v = 'disagree';
  return v;
}

/** The run as data, in `.sxs/<app>/sxs.json`, and to `--json`'s file if asked. */
function writeJson(run: AppRun): void {
  mkdirSync(join(lastRun(driver.name, 'json'), '..'), { recursive: true });
  for (const file of [lastRun(driver.name, 'json'), option('--json')]) if (file) writeFileSync(file, `${JSON.stringify(run, null, 2)}\n`);
}
if (unique.size === 0) {
  say(`nothing to run: ${tests.length} tests selected, all skipped`);
  writeJson(runData([], undefined));
  process.exit(1);
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
interface Actor extends Session {
  settle(o: IdleOptions): Promise<IdleResult>;
  /** Brings the app's page to the front, where its Clipboard API works. */
  front(): Promise<void>;
}
const pageActor = (page: Page): Actor => ({
  press: (key) => page.keyboard.press(key),
  type: (text) => page.keyboard.type(text),
  clipboard: {
    write: (text) => page.evaluate((t) => navigator.clipboard.writeText(t), text),
    read: () => page.evaluate(() => navigator.clipboard.readText()),
  },
  settle: (o) => page.evaluate((o) => (window as unknown as { __ourusIdle: { wait(o: IdleOptions): Promise<IdleResult> } }).__ourusIdle.wait(o), o),
  front: () => page.bringToFront(),
});
const sessionActor = (session: Session): Actor => ({
  ...session,
  settle: async () => ({ ms: 0, timedOut: false }),
  front: async () => {},
});
/** The run's actor, once the app is ready; whether it types a text at once (a session). */
let actor: Actor;
let typesAtOnce = false;

async function settle(after: string, unsettled: string[]): Promise<void> {
  const t0 = Date.now();
  const r = await actor.settle(idle);
  if (r.timedOut) unsettled.push(`${after}: ${r.pending}`);
  if (timing) say(`    ${String(Date.now() - t0).padStart(5)}ms  ${after}${r.busiest ? `  (longest wait: ${r.busiest})` : ''}`);
  if (slow) await new Promise((r) => setTimeout(r, slow));
}

async function play(page: Page, action: string, settleAfter: (what: string) => Promise<void>): Promise<void> {
  if (action.startsWith('"')) {
    // a session takes the text as one run, as a user's typing (it settles by returning; Emacs's undo
    // takes a run of typing as one change, and characters typed in calls of their own as one each)
    if (typesAtOnce) {
      await actor.type(action.slice(1, -1));
      await settleAfter(`typing ${action}`);
      return;
    }
    // one character at a time, each settled: an app may react to a character (pairing a bracket)
    for (const ch of action.slice(1, -1)) {
      await actor.type(ch);
      await settleAfter(`typing ${JSON.stringify(ch)}`);
    }
    return;
  }
  const keys = driver.keys[action];
  if (keys !== undefined) {
    for (const key of typeof keys === 'string' ? [keys] : keys) {
      await actor.press(key);
      await settleAfter(`${action} (${key})`);
    }
    return;
  }
  if (!driver.act) throw new Error(`${driver.name} has no key for ${action}`);
  await driver.act(page, action, () => settleAfter(action));
}

const indent = (s: string, by = '    '): string => s.replace(/\n$/, '').replace(/^/gm, by);

const rank: Record<Verdict | 'error', number> = { agree: 0, caret: 1, whitespace: 2, disagree: 3, error: 4 };

/** The settings the app was last set to (`Driver.configure`); unknown at first, in a page an earlier run may have left set. */
let configured: string | null = null;

async function runPlan(page: Page, plan: Plan): Promise<Outcome> {
  const t0 = Date.now();
  const unsettled: string[] = [];
  const got: (Doc | null)[] = [];
  const clipboards: (string | null)[] = [];
  const settleAfter = (what: string): Promise<void> => settle(what, unsettled);
  // an example that pastes or checks the clipboard
  const usesClipboard = plan.clipboard !== null || plan.steps.some((s) => s.clipboard !== undefined || s.actions.some((a) => /^(paste|copy|cut)/.test(a)));
  try {
    const settings = JSON.stringify(plan.settings);
    if (driver.configure && settings !== configured) {
      configured = null;
      await driver.configure(page, plan.settings);
      configured = settings;
    }
    // an example that uses the clipboard has its tab in front (behind another, a Clipboard API write
    // is dropped and a read comes back empty, without an error)
    if (usesClipboard) await actor.front();
    await driver.load(page, plan.initial);
    if (plan.clipboard !== null) await actor.clipboard.write(plan.clipboard);
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
    if (!sameDoc(loaded, plan.initial)) throw new Error(`${driver.title} holds the starting state differently:\n  meant:\n${indent(drawDoc(plan.initial))}\n  holds:\n${indent(drawDoc(loaded))}`);
    for (const step of plan.steps) {
      for (const action of step.actions) await play(page, action, settleAfter);
      got.push(step.want ? await driver.read(page) : null);
      clipboards.push(step.clipboard !== undefined ? await actor.clipboard.read() : null);
    }
  } catch (e) {
    const message = String(e instanceof Error ? e.message : e);
    // a Playwright error's first line says it; an error of ours may draw a state below it
    const error = message.startsWith(`${driver.title} holds`) ? message : message.split('\n')[0]!.slice(0, 300);
    return { verdict: 'error', step: got.length, got, clipboards, error, unsettled, ms: Date.now() - t0 };
  } finally {
    await driver.unload?.(page).catch(() => {});
  }
  return { ...judge(plan, got, clipboards), got, clipboards, unsettled, ms: Date.now() - t0 };
}

/** How an example came out from what the app did in each step: as its worst step, the first that came out so. */
function judge(plan: Plan, got: readonly (Doc | null)[], clipboards: readonly (string | null)[]): { verdict: Verdict; step: number } {
  let verdict: Verdict = 'agree';
  let at = -1;
  plan.steps.forEach((step, i) => {
    const v = stepVerdict(step, got[i] ?? null, clipboards[i]);
    if (rank[v] > rank[verdict]) {
      verdict = v;
      at = i;
    }
  });
  return { verdict, step: Math.max(at, 0) };
}

// ------------------------------------------------------------------ regenerating
//
// A regenerated report (--regenerate-report) runs no app: each example is judged again, against the spec
// as it is now, from what the app did in it in its last run (`.sxs/<app>/sxs.json` draws every state the
// app reached), where that run played it as the spec has it now: the same start, clipboard and settings,
// and the same actions in each step (of an example since grown more steps, in its first ones). The
// rest want a run of the app: they are left out (`?` in the table of several apps), and say why.

/** A state as the last run drew it, read back as the app's model has it; null where it doesn't read back. */
function readDoc(drawn: string): Doc | null {
  if (!isText) return readOutline(drawn);
  const d = readTextDoc(drawn);
  return drawTextDoc(d) === drawn ? d : null;
}

/** The app's settings (`Driver.settings`) as strings, each as `get` has it. */
const settingsOf = (get: (k: keyof Config) => unknown): string[] => Object.keys(driver.settings ?? {}).map((k) => String(get(k as keyof Config)));

/** A plan's outcome in the last run's example, if that played it as it is now; else why not. */
function replay(plan: Plan, e: RunExample): Outcome | string {
  if (e.steps.length < plan.steps.length) return 'a step added since';
  const got: (Doc | null)[] = [];
  const clipboards: (string | null)[] = [];
  for (const [i, step] of plan.steps.entries()) {
    const was = e.steps[i]!;
    if (JSON.stringify(was.actions) !== JSON.stringify(step.actions)) return 'its actions changed since';
    if (e.verdict === 'error' && e.step === i) return { verdict: 'error', step: i, got, clipboards, ...(e.error !== undefined && { error: e.error }), unsettled: e.unsettled ?? [], ms: 0 };
    const doc = step.want && was.app !== null ? readDoc(was.app) : null;
    if (step.want && !doc) return was.app === null ? 'a buffer expected since' : 'a state that doesn\'t read back';
    if (step.clipboard !== undefined && !was.clipboard) return 'a clipboard expected since';
    got.push(doc);
    clipboards.push(step.clipboard !== undefined ? was.clipboard!.app : null);
  }
  return { ...judge(plan, got, clipboards), got, clipboards, unsettled: e.unsettled ?? [], ms: 0 };
}

/** Judges every example again from the last run, into `results`, or `notRun` with why; the app's version then. */
function regenerate(): string | undefined {
  const key = (start: string, clipboard: string | null, settings: string[]): string => JSON.stringify([start, clipboard, settings]);
  const played = new Map<string, RunExample[]>();
  for (const e of previous!.examples) {
    const k = key(e.start, e.clipboard, settingsOf((s) => e.options[s] ?? Config.defaults[s]));
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
  say(`${driver.title}${previous!.version ? ` ${previous!.version}` : ''}: regenerated from its last run, no run; ${plans.length - unrun} tests judged again, ${unrun} not run as they are now, ${tests.length - plans.length} skipped`);
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

/** Plays every example in the app, into `results`; the app's version. */
async function playAll(): Promise<string | undefined> {
  await ensureProxy(flag('--offline'), say);
  await proxyStats(); // counts from here on
  // an app that starts itself (a desktop app) needs no shared browser
  const browser = driver.launch ? null : await launch(flag('--headed'), say, driver.name);
  // an app served from this machine: its server up before its page loads (or an earlier run's tab is tried)
  await driver.serve?.(say).catch((e: Error) => {
    console.error(`can't start ${driver.title}'s server: ${e.message}`);
    return process.exit(1);
  });
  const opened = Date.now();
  type Marked = { __ourusApp?: string; __ourusVersion?: string };

  /**
   * The app's page, loaded: an earlier run's, if it still holds a document and reads it back, else a new
   * one; or the window of an app the driver starts itself.
   */
  async function ready(): Promise<{ app: AppPage; version: string | undefined; how: string }> {
    if (!browser) {
      const app = await driver.launch!({ headed: flag('--headed'), say }).catch((e: Error) => {
        console.error(`can't start ${driver.title}: ${e.message}`);
        return process.exit(1);
      });
      // a page's settling is the idle script's; a session's calls return once the app is done
      if (!app.session) await app.page.addInitScript(installIdle, idleVersion());
      return { app, version: await driver.open(app.page), how: 'started' };
    }
    let app = await appPage(browser, driver.name, driver.url, { shared: !flag('--headed'), fresh: flag('--fresh') });
    // the tab in front: its Clipboard API works only there, and a tab behind another can crawl
    await app.page.bringToFront();
    if (app.reused) {
      const probe: Doc = isText ? { text: '- a\n- b\n', sel: { anchor: 7, head: 7 } } : { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } };
      const works = await driver
        .load(app.page, probe)
        .then(() => driver.read(app.page))
        .then((o) => sameDoc(o, probe))
        .catch(() => false);
      if (works) return { app, version: await app.page.evaluate(() => (window as Marked).__ourusVersion), how: 'reused from an earlier run' };
      await app.page.close();
      await app.release();
      app = await appPage(browser, driver.name, driver.url, { shared: !flag('--headed'), fresh: true });
    }
    await app.page.addInitScript(installIdle, idleVersion());
    const version = await driver.open(app.page);
    await app.page.evaluate(([name, v]) => Object.assign(window as Marked, { __ourusApp: name, __ourusVersion: v }), [driver.name, version] as const);
    return { app, version, how: 'loaded' };
  }
  const { app: appTab, version, how } = await ready();
  const page = appTab.page;
  actor = appTab.session ? sessionActor(appTab.session) : pageActor(page);
  typesAtOnce = !!appTab.session;
  await actor.front();
  if (!appTab.session) page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  say(`${driver.title}${version ? ` ${version}` : ''} at ${driver.url}, ${how} in ${((Date.now() - opened) / 1000).toFixed(1)}s; ${unique.size} examples to run (${plans.length} tests), ${tests.length - plans.length} skipped`);

  function detail(plan: Plan, o: Outcome): string {
    if (o.verdict === 'error') return `  error at step ${o.step + 1}: ${o.error}`;
    const step = plan.steps[o.step]!;
    const lines = [`  line ${step.line}: > ${step.actions.join(' ')}`];
    if (step.want && o.got[o.step]) lines.push('  expected:', indent(drawDoc(step.want)), `  ${driver.name}:`, indent(drawDoc(o.got[o.step]!)));
    if (step.caretLost) lines.push(`  (the expected caret isn't compared: ${step.caretLost})`);
    if (step.clipboard !== undefined && o.clipboards[o.step] !== step.clipboard) lines.push(`  clipboard: expected ${JSON.stringify(step.clipboard)}, got ${JSON.stringify(o.clipboards[o.step])}`);
    return lines.join('\n');
  }

  const signature = (o: Outcome): string => JSON.stringify([o.verdict, o.got, o.clipboards, o.error]);

  for (const { plan, names } of unique.values()) {
    let outcome = await runPlan(page, plan);
    // a promise of the app's that never settles is collected instead of waited on (V8's inspector holds
    // an evaluation's promise weakly): rare, and nothing of the example's, so it runs once more
    if (outcome.verdict === 'error' && /Resulting promise was garbage collected/.test(outcome.error ?? '')) {
      say(`again      ${names.join(' = ')}: ${outcome.error}`);
      outcome = await runPlan(page, plan);
    }
    let flaky: string | undefined;
    for (let i = 1; i < repeat && !flaky; i++) {
      const again = await runPlan(page, plan);
      if (signature(again) !== signature(outcome)) flaky = `run ${i + 1}: ${again.verdict}${again.verdict !== 'agree' ? `\n${detail(plan, again)}` : ''}`;
    }
    results.push({ plan, names, outcome, ...(flaky && { flaky }) });
    const tag = `${outcome.verdict}${flaky ? ' FLAKY' : ''}`;
    if (outcome.verdict !== 'agree' || flaky || verbose) {
      say(`${tag.padEnd(10)} ${names.join(' = ')}${plan.notes.length ? `  [${plan.notes.join(', ')}]` : ''}  ${outcome.ms}ms`);
      if (outcome.verdict !== 'agree') say(detail(plan, outcome));
      if (flaky) say(`  but ${flaky}`);
    }
    for (const u of outcome.unsettled) say(`  unsettled after ${u}`);
  }
  // the shared browser stays up, the app loaded in it for the next run; this only disconnects
  await appTab.release().catch((e) => say(`couldn't release ${driver.title}: ${String(e).slice(0, 200)}`));
  await browser?.close();
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
say(`\n${driver.title}: ` + verdicts.map((v) => `${v} ${count(v)}${isText ? '' : ` (${count(v, 'original')} original)`}`).join(', ') + `; skipped ${tests.length - plans.length}`);
const flakes = results.filter((r) => r.flaky).length;
if (repeat > 1) say(`flaky over ${repeat} runs: ${flakes}`);
if (skipped.size) say('skipped, by reason: ' + [...skipped].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k} ${v.length}`).join(', '));
if (notRun.size) say('not run as they are now, by reason: ' + [...notRun].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k} ${v.length}`).join(', '));
const unsettledRuns = results.filter((r) => r.outcome.unsettled.length).length;
if (unsettledRuns) say(`${unsettledRuns} examples had actions after which ${driver.title} didn't settle (see "unsettled after" above)`);
if (errors.length) say(`page errors: ${errors.length} (first: ${errors[0]})`);
const run = runData(results, version);
if (!regenerating) keep(run);
writeJson(run);

/** Keeps what the app did in the examples run (`FileRun`): theirs replaced, their files' others kept, unless it ran every example of the file. */
function keep(run: AppRun): void {
  fileRuns(); // a run of the whole spec from before, split first
  const all = allTests();
  const selected = new Set(tests.map((t) => `${t.file} › ${t.name}`));
  for (const file of new Set(run.examples.map((e) => e.file))) {
    const ran = run.examples.filter((e) => e.file === file);
    const whole = !flag('--strict') && all.filter((t) => t.file === file).every((t) => selected.has(`${t.file} › ${t.name}`));
    const before = whole ? [] : (read<FileRun>(fileRun(driver.name, file))?.examples ?? []).filter((e) => !ran.some((r) => r.name === e.name));
    writeFileRun({ type: 'SxS', app: driver.name, file, version: run.version, command: run.command, elapsed_s: run.elapsed_s, ran: new Date().toISOString(), examples: [...before, ...ran] });
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

// in .sxs/<app>/, beside the run as data; a run of every example, copied beside the driver, checked in
writeFileSync(lastRun(driver.name, 'md'), report());
say(`wrote ${relative(process.cwd(), lastRun(driver.name, 'md'))} and sxs.json`);
if (selectors.length === 0 && !flag('--strict') && !flag('--no-report')) {
  copyFileSync(lastRun(driver.name, 'md'), join(here, driver.name, 'sxs.md'));
  say(`copied it to sxs/${driver.name}/sxs.md`);
}

function report(): string {
  /** A heading's anchor, as GitHub makes it. */
  const slug = (heading: string): string => heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
  /** An example's spec file, its own heading there (not the headings above it), and that heading's anchor. */
  const parts = (name: string): { file: string; title: string; anchor: string } => {
    const [file, ...rest] = name.split(' › ');
    const title = rest[rest.length - 1]!;
    return { file: file!, title, anchor: slug(title) };
  };
  /** A section's heading: the examples that came out a way (adapted ones saying so), or were skipped or not run, and how many. */
  const heading = (what: string, n: number, kind?: string): string => {
    const s = kind === 'adapted' ? `adapted: ${what}` : what;
    return `${s[0]!.toUpperCase()}${s.slice(1)} (${n})`;
  };
  /** A count, linked to its section. */
  const linked = (n: number, what: string, kind?: string): string => `[${n}](#${slug(heading(what, n, kind))})`;
  const href = (name: string): string => `../../spec/${parts(name).file}#${parts(name).anchor}`;
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
      return row([`[${file}](../../spec/${file})`, ...columns.map((c) => cell(of(c))), bold(columns.reduce((n, c) => n + of(c), 0)), ...kinds.map((c) => cell(of(c)))]);
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
  const summary = [
    'Summary:',
    '',
    row(['', ...columns, 'total']),
    `|${' --- |'.repeat(columns.length + 2)}`,
    ...kinds.map((k) => row([k, ...verdicts.map((v) => (v !== 'agree' && count(v, k) ? linked(count(v, k), v, k) : cell(count(v, k)))), '', ...(notRun.size ? [''] : []), bold(ran(k))])),
    row([
      bold('total'),
      ...verdicts.map((v) => bold(share(count(v), isText && v !== 'agree' && count(v) ? linked(count(v), v) : count(v)))),
      bold(share(skips, skips ? linked(skips, 'skipped') : skips)),
      ...(notRun.size ? [bold(share(unrun, linked(unrun, 'not run')))] : []),
      bold(tests.length),
    ]),
    '',
  ];
  // what ran, as frontmatter; values quoted as JSON, which YAML reads as double-quoted strings
  const out: string[] = [
    '---',
    `type: ${JSON.stringify('SxS')}`,
    `app: ${JSON.stringify(driver.name)}`,
    `version: ${JSON.stringify(version ?? 'unknown')}`,
    `url: ${JSON.stringify(driver.url)}`,
    `model: ${JSON.stringify(driver.model)}`,
    `command: ${JSON.stringify(`node sxs/run.ts ${driver.name}`)}`,
    `elapsed_s: ${previous?.elapsed_s ?? Math.round((Date.now() - started) / 1000)}`,
    '---',
    '',
    `# ${driver.title} vs ourus`,
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
        const clipboard = plan.clipboard === null ? [] : [{ head: 'clipboard', body: plan.clipboard, kind: 'clipboard' }];
        // one step: its command, then the clipboard, the start, the app's outcome and ourus's side by side
        const [only] = plan.steps;
        const once = outcome.got[0];
        if (plan.steps.length === 1 && outcome.verdict !== 'error' && only!.want && once) {
          out.push(`> ${only!.actions.join(' ')}`, '');
          if (notesLine) out.push(notesLine, '');
          out.push(...sideBySide([...clipboard, { head: 'buffer', body: drawDoc(plan.initial) }, { head: driver.name, body: drawDoc(once) }, { head: 'ourus', body: drawDoc(only!.want) }]), '');
        } else {
          // more steps: the clipboard and the start, then each step's command and the app's outcome,
          // beside ourus's where they differ; a buffer the two agree on stands alone
          if (notesLine) out.push(notesLine, '');
          out.push(...sideBySide([...clipboard, { head: 'buffer', body: drawDoc(plan.initial) }]), '');
          plan.steps.forEach((step, i) => {
            out.push(`> ${step.actions.join(' ')}`, '');
            if (outcome.verdict === 'error' && i >= outcome.step) {
              if (i === outcome.step) out.push(`Error: ${outcome.error}`, '');
              return;
            }
            const got = outcome.got[i];
            if (step.want && got && compareDocs(step.want, got) !== 'agree') out.push(...sideBySide([{ head: driver.name, body: drawDoc(got) }, { head: 'ourus', body: drawDoc(step.want) }]), '');
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
  const index = new Map(tests.map((t, i) => [`${t.file} › ${t.name}`, i]));
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
