// Two judgments of the same apps side by side (`run.ts --compare[=REF]`): the current one, each app's
// `.sxs/results/<app>/sxs.json`, against one committed in `.sxs` (its HEAD by default), case by case.
// A case is its ID (`Enter1`), unique across the spec, so a renamed file (`del.md` to `delete.md`) or a
// case moved between files (`paste.md` to `paste-plain.md`) is the same case.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** What a judgment has of an example: its name, verdict, adaptations, and each step's states. */
interface Judged {
  name: string;
  verdict: string;
  adapted?: string[];
  steps: { actions: string[]; verdict?: string; ourus: string | null; app: string | null }[];
}

interface Judgment {
  app: string;
  model: 'block' | 'text';
  examples: Judged[];
}

/** From better to worse: a transition along it is worse. */
const ORDER = ['agree', 'caret', 'whitespace', 'disagree', 'error'];
const SYMBOL: Record<string, string> = { agree: '✓', caret: 'C', whitespace: 'S', disagree: '✗', error: 'E' };

/** A case's ID: its name, or in a run recorded before cases were keyed by their ID alone (`file › headings › ID`), its last part. */
const caseOf = (name: string): string => (name.includes(' › ') ? name.slice(name.lastIndexOf(' › ') + ' › '.length) : name);

/** A verdict as the table draws it: in parentheses where the example was adapted for the app. */
const cell = (e: Judged): string => (e.adapted?.length && e.verdict !== 'agree' ? `(${SYMBOL[e.verdict] ?? e.verdict})` : (SYMBOL[e.verdict] ?? e.verdict));

/** Setups of one app count once: both Logseqs, both RemNotes, the Obsidians but true-outliner. */
const family = (app: string): string => (app.startsWith('logseq') ? 'logseq' : app.startsWith('remnote') ? 'remnote' : app.startsWith('obsidian') && app !== 'obsidian-true-outliner' ? 'obsidian' : app);

/** The commit `ref` names in the results' repository, short, with its subject; null where it names none. */
function describe(dir: string, ref: string): string | null {
  try {
    return execFileSync('git', ['-C', dir, 'log', '-1', '--format=%h %s', ref], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function committed(dir: string, ref: string, app: string): Judgment | null {
  try {
    return JSON.parse(execFileSync('git', ['-C', dir, 'show', `${ref}:results/${app}/sxs.json`], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return null;
  }
}

/**
 * The comparison, printed with `say`: per app, how many of the cases both judgments have agree in
 * each and how verdicts moved; every cell that got worse; and the cells only the current one has (a
 * new case, or one an app runs now and skipped then), with the camps against ourus in them (two apps or more, setups of one app once, reaching the
 * same state at a step ourus doesn't). `selected` keeps only the cases it says (all, by default).
 * Returns the exit code: 1 where a ref or an app's judgment can't be read.
 */
export function compareJudgments(cacheDir: string, apps: readonly string[], ref: string, selected: (name: string) => boolean, say: (line: string) => void, verbose = false): number {
  const dir = cacheDir;
  const commit = describe(dir, ref);
  if (!commit) {
    say(`${ref} names no commit in ${dir}`);
    return 1;
  }
  say(`the current judgment (${join(dir, 'results')}) against ${ref} (${commit}), by case\n`);
  const moved = new Map<string, number>();
  const worse: string[] = [];
  const better: string[] = [];
  const fresh = new Map<string, { app: string; model: string; e: Judged }[]>();
  const gone = new Map<string, string[]>();
  const rows: string[][] = [['app', 'both', 'agree then', 'agree now', '±', 'worse', 'better', 'new', 'gone']];
  // (`gone`: cases the app had then and hasn't now, deleted or skipped now)
  let failed = 0;
  for (const app of apps) {
    const file = join(dir, 'results', app, 'sxs.json');
    const now: Judgment | null = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    const then = committed(dir, ref, app);
    if (!now || !then) {
      say(`${app}: no judgment ${!now ? 'now' : `at ${ref}`}`);
      failed++;
      continue;
    }
    const before = new Map(then.examples.filter((e) => selected(e.name)).map((e) => [caseOf(e.name), e]));
    const after = new Map(now.examples.filter((e) => selected(e.name)).map((e) => [caseOf(e.name), e]));
    let both = 0;
    let agreedThen = 0;
    let agreedNow = 0;
    let worseHere = 0;
    let betterHere = 0;
    let newHere = 0;
    for (const [name, e] of after) {
      const was = before.get(name);
      if (!was) {
        newHere++;
        fresh.set(e.name, [...(fresh.get(e.name) ?? []), { app, model: now.model, e }]);
        continue;
      }
      both++;
      if (was.verdict === 'agree') agreedThen++;
      if (e.verdict === 'agree') agreedNow++;
      if (cell(was) === cell(e)) continue;
      const key = `${cell(was)} → ${cell(e)}`;
      moved.set(key, (moved.get(key) ?? 0) + 1);
      const step = ORDER.indexOf(e.verdict) - ORDER.indexOf(was.verdict);
      const line = `${e.name}: ${app} ${key}`;
      if (step > 0) {
        worseHere++;
        worse.push(line);
      } else if (step < 0) {
        betterHere++;
        better.push(line);
      }
    }
    const goneHere = [...before.keys()].filter((name) => !after.has(name));
    for (const name of goneHere) gone.set(name, [...(gone.get(name) ?? []), app]);
    const delta = agreedNow - agreedThen;
    rows.push([app, `${both}`, `${agreedThen}`, `${agreedNow}`, delta > 0 ? `+${delta}` : `${delta}`, `${worseHere}`, `${betterHere}`, `${newHere}`, `${goneHere.length}`]);
  }
  const widths = rows[0]!.map((_, k) => Math.max(...rows.map((r) => r[k]!.length)));
  for (const r of rows) say(r.map((c, k) => (k === 0 ? c.padEnd(widths[k]!) : c.padStart(widths[k]!))).join('  '));

  say('\nverdicts moved, on the cases both have:');
  if (!moved.size) say('  none');
  for (const [key, n] of [...moved].sort((a, b) => b[1] - a[1])) say(`  ${String(n).padStart(5)}  ${key}`);

  say(`\ngot worse (${worse.length}):`);
  if (!worse.length) say('  none');
  for (const line of worse) say(`  ${line}`);
  if (verbose) {
    say(`\ngot better (${better.length}):`);
    for (const line of better) say(`  ${line}`);
  }

  const cells = [...fresh.values()].flat();
  const counts = new Map<string, number>();
  for (const c of cells) counts.set(c.e.verdict, (counts.get(c.e.verdict) ?? 0) + 1);
  say(`\nnew cells, cases an app has now and didn't then (${fresh.size} cases, ${cells.length} cells: ${ORDER.filter((v) => counts.has(v)).map((v) => `${counts.get(v)} ${v}`).join(', ') || 'none'}), where a camp is against ourus (all with -v):`);
  for (const [name, judged] of fresh) {
    // apps grouped by the state they reach at each step ourus doesn't, within a model
    const camps: string[] = [];
    const stepCount = Math.max(...judged.map((j) => j.e.steps.length));
    for (let k = 0; k < stepCount; k++) {
      const groups = new Map<string, Set<string>>();
      for (const { app, model, e } of judged) {
        const s = e.steps[k];
        if (!s || s.app === null || !s.verdict || s.verdict === 'agree') continue;
        const key = `${model}\u0000${s.app}`;
        groups.set(key, new Set([...(groups.get(key) ?? []), app]));
      }
      for (const [key, members] of groups) {
        if (new Set([...members].map(family)).size < 2) continue;
        camps.push(`step ${k + 1}: ${[...members].join(', ')}: ${JSON.stringify(key.split('\u0000')[1])}`);
      }
    }
    const against = judged.filter((j) => j.e.verdict !== 'agree');
    if (!camps.length && !verbose) continue;
    say(`  ${name}: ${judged.length - against.length} of ${judged.length} agree${against.length ? `; ${against.map((j) => `${j.app} ${cell(j.e)}`).join(', ')}` : ''}`);
    for (const camp of camps) say(`      ${camp}`);
  }
  if (gone.size) {
    say(`\ngone (in ${ref} only, ${gone.size}):`);
    for (const [name, apps] of gone) say(`  ${name}: ${apps.join(', ')}`);
  }
  return failed ? 1 : 0;
}
