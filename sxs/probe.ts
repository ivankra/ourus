// Probe: a buffer and actions, played on ourus and, if asked, on the apps of the SxS side by side,
// each step's states printed with the apps grouped by what they did. To see what ourus does before
// drawing a case, or what the apps do on a shape no case draws, without writing one into spec/.
//
//   node sxs/probe.ts '- one⏎  ┃two' shiftEnter deleteContentBackward         # ourus alone
//   node sxs/probe.ts all '- one\n  ┃two' shiftEnter deleteContentBackward
//   node sxs/probe.ts LO,RR,text --clipboard='x\ny' '- a┃b' pastePlain
//   node sxs/probe.ts block --file=probes.md        # several probes, one start of each app
//   node sxs/probe.ts all --case=Enter28            # a spec case's start and actions
//
// Run with no arguments, or --help, for every option.

import { spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Config } from '../src/config.ts';
import { OutlineState } from '../src/outline/index.ts';
import { drawOutline, drawState, readDrawing, readText } from '../test/drawing.ts';
import { isAction, play, type Played } from '../test/player.ts';
import { normalize, outcome } from '../test/spec-run.ts';
import { readSpec, specConfig, TAGS, tokenize, type SpecTest } from '../test/specfile.ts';
import { appNames, drivers, resolveApps } from './lib/apps.ts';
import { ensureProxy } from './lib/browser.ts';
import type { Driver } from './lib/driver.ts';
import { LOGIN_EXIT } from './lib/login.ts';
import { cacheDir, cacheMode } from './proxy.ts';

const HELP = `usage: node sxs/probe.ts [<apps>] [options] <buffer | -> <step>...
       node sxs/probe.ts [<apps>] [options] --file=<probes.md>
       node sxs/probe.ts [<apps>] [options] --case=<case>

  <apps>               where to play besides ourus, comma-separated: all; a group (block, text,
                       outliners, free); apps by directory or two capitals (LO, logseq, RR...);
                       -XX leaves one out (all,-RN,-RB). Left out, ourus plays alone (US): a first
                       argument with a caret, a selection, a space or a line break is the buffer
  <buffer>             drawn as the spec draws it: ┃ caret, «» selection, ◌ placeholder, → tab,
                       ␍ CR, ⍽ no-break space; \\n or ⏎ a line break, a final one added unless --exact;
                       - reads it from stdin
  <step>               an argument per step, its actions in the spec's notation: commands (enter,
                       indent, ...), "typed text", motions (cursorDocEnd), undo, redo ('enter "x"')
  --<option>=<value>   a config option (--flavor=obsidian --outdent=logical ...): the case's, so an
                       app is judged under its own declared values where it has others, as the SxS does
  --clipboard=<text>   the clipboard a paste pastes (\\n or ⏎ a line break)
  --tags=<tags>        the case's tags (free-form, markup-task, ...): which apps skip it
  --file=<file.md>     probes from a file in the spec's format (each case's drawn buffers after the
                       actions are ignored: ourus's are taken), every app started once for all
  --case=<case>        a spec case's start, clipboard, options and actions (Enter28, enter.md#enter28,
                       a name's end); where ourus differs from its drawing, the drawing is shown
  --each=<option>      ourus alone: play under every value of an option (repeat for combinations)
  --outline            also print how ourus reads each state (the spec's outline block)
  --spec               print each probe as a spec case's blocks, ourus's states drawn
  --json               print the probes and every app's states as JSON
  --exact              take the buffer's bytes as given, no final line break added

The apps' runs go to .sxs/probe/<time>/ (the probe as a spec file, each app's log and run as
data), never into .sxs/results or a report. Exit status 1 where ourus fails to encode or throws, or
differs from a --case's drawing.`;

// ------------------------------------------------------------------ arguments

interface Probe {
  name: string;
  /** The buffer, drawn. */
  start: string;
  steps: string[][];
  options: Record<string, string>;
  clipboard: string;
  tags: string[];
  /** A spec case's drawings of its steps (`--case`), to set beside ourus's. */
  drawn?: (string | undefined)[];
}

interface Args {
  apps: string;
  config: Record<string, string>;
  each: string[];
  clip: string;
  tags: string[];
  file?: string;
  caseName?: string;
  outline: boolean;
  format: 'human' | 'spec' | 'json';
  exact: boolean;
  positional: string[];
  pass: string[];
}

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

/** `\n` and `⏎` in an argument are line breaks. */
const breaks = (s: string): string => s.replace(/\\n|⏎/g, '\n');

function parseArgs(argv: readonly string[]): Args {
  const o: Args = { apps: '', config: {}, each: [], clip: '', tags: [], outline: false, format: 'human', exact: false, positional: [], pass: [] };
  if (argv.length === 0) {
    console.log(HELP);
    process.exit(0);
  }
  for (const arg of argv) {
    if (arg === '-h' || arg === '--help') {
      console.log(HELP);
      process.exit(0);
    }
    const m = /^--([\w-]+)(?:=(.*))?$/s.exec(arg);
    if (!m || arg === '-') {
      o.positional.push(arg);
      continue;
    }
    const [, key, value = ''] = m as unknown as [string, string, string | undefined];
    if (key === 'outline') o.outline = true;
    else if (key === 'spec' || key === 'json') o.format = key;
    else if (key === 'exact') o.exact = true;
    else if (key === 'each') o.each.push(...value.split(','));
    else if (key === 'clipboard') o.clip = breaks(value);
    else if (key === 'tags') o.tags.push(...value.split(/[,\s]+/).filter(Boolean));
    else if (key === 'file') o.file = value;
    else if (key === 'case') o.caseName = value;
    // the SxS's own (`--cache=offline`, `--plain-clipboard`, `--pace=`, `--headed`, ...), for each app's run
    else if (['cache', 'pace', 'slow', 'plain-clipboard', 'headed', 'fresh', 'timing'].includes(key)) o.pass.push(arg);
    else if (key in Config.values) o.config[key] = value;
    else fail(`unknown option --${key}; the config's are ${Object.keys(Config.values).join(', ')} (node sxs/probe.ts --help)`);
  }
  for (const tag of o.tags) if (!(TAGS as readonly string[]).includes(tag)) fail(`unknown tag ${tag}: the tags are ${TAGS.join(', ')}`);
  // the apps first, as run.ts takes them; a buffer there (a caret, a selection, a space, a line break,
  // or `-` for stdin), or nothing before --file or --case, is ourus alone
  const first = o.positional[0];
  o.apps = first === undefined || first === '-' || /[┃«»⏎\s]|\\n/.test(first) ? 'US' : o.positional.shift()!;
  return o;
}

const specDir = fileURLToPath(new URL('../spec/', import.meta.url));

/** The spec case a name picks: its ID or its whole name, a name's end, or `file.md#anchor`. */
function findCase(name: string): SpecTest {
  const [file, anchor] = name.includes('#') ? name.split('#') : [null, null];
  const all = readdirSync(specDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && (!file || f === file || f === `${file}.md`))
    .flatMap((f) => readSpec(f, readFileSync(join(specDir, f), 'utf8')));
  const slug = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');
  const picked = anchor
    ? all.filter((t) => slug(t.name.split(' › ').pop()!) === anchor.toLowerCase())
    : all.filter((t) => t.name === name || t.name.endsWith(` › ${name}`) || t.name.split(' › ').pop() === name);
  if (picked.length === 0) fail(`no case ${name}`);
  if (picked.length > 1) fail(`${name} is ${picked.length} cases: ${picked.map((t) => `${t.file} › ${t.name}`).join(', ')}`);
  return picked[0]!;
}

/** A spec case as a probe: its options with the command line's over them. */
const fromCase = (t: SpecTest, o: Args): Probe => ({
  name: t.name.split(' › ').pop()!,
  start: t.initial.buffer!,
  steps: t.steps.map((s) => [...s.actions]),
  options: { ...t.options, ...o.config },
  clipboard: readText(t.initial.clipboard ?? o.clip),
  tags: [...new Set([...t.tags, ...o.tags])],
  drawn: t.steps.map((s) => s.expect.buffer),
});

function probesOf(o: Args): Probe[] {
  if (o.caseName !== undefined) {
    if (o.positional.length || o.file) fail('--case plays the case: no buffer, steps or --file beside it');
    return [fromCase(findCase(o.caseName), o)];
  }
  if (o.file !== undefined) {
    if (o.positional.length) fail('--file has the probes: no buffer or steps beside it');
    return readSpec('probe.md', readFileSync(o.file, 'utf8')).map((t) => ({ ...fromCase(t, o), name: t.name, drawn: undefined }));
  }
  const [source, ...stepArgs] = o.positional;
  if (source === undefined) fail('a buffer to start from (node sxs/probe.ts --help)');
  let start = source === '-' ? readFileSync(0, 'utf8') : breaks(source);
  if (source !== '-' && !o.exact && !start.endsWith('\n')) start += '\n';
  if (!/[┃«]/.test(start)) fail('the buffer has no caret (┃) or selection («»)');
  if (!stepArgs.length) fail('no actions: an argument per step after the buffer');
  return [{ name: 'P1', start, steps: stepArgs.map((a) => tokenize(a)), options: o.config, clipboard: o.clip, tags: o.tags }];
}

// ------------------------------------------------------------------ ourus

interface OurStep {
  actions: string[];
  /** The buffer after the step, drawn as the spec draws it; null where it can't be (no final line break). */
  buffer: string;
  drawable: boolean;
  result: string;
  outline: string;
  /** An action that failed to encode or threw, with why. */
  broken?: string;
}

function playOurus(p: Probe, config: Record<string, string>): OurStep[] {
  const start = readDrawing(p.start);
  let state: Played = {
    doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: specConfig(config) }),
    selection: start.selection,
    clipboard: p.clipboard,
  };
  const out: OurStep[] = [];
  for (const actions of p.steps) {
    const unknown = actions.filter((a) => !isAction(a));
    if (unknown.length) fail(`unknown action ${unknown[0]}: a command (enter, indent, ...), "typed text", a motion (cursorDocEnd, ...), undo or redo`);
    let broken: string | undefined;
    try {
      for (const action of actions) {
        state = play(state, [action]);
        const last = state.last;
        if (last?.status === 'rejected' && last.reason === 'encoding-failed') broken ??= `${action} fails to encode${last.detail ? `: ${last.detail}` : ''}`;
      }
    } catch (e) {
      broken = `throws: ${e instanceof Error ? e.message : String(e)}`;
    }
    const text = state.doc.text;
    out.push({
      actions,
      buffer: normalize(drawState(text, state.selection, state.doc.placeholders)),
      drawable: text === '' || /[\r\n]$/.test(text),
      result: outcome(state),
      outline: drawOutline(state.doc),
      ...(broken ? { broken } : {}),
    });
    if (broken) break;
  }
  return out;
}

/** Every combination of the values of the options in `each`, over `base`. */
function combinations(base: Record<string, string>, each: readonly string[]): Record<string, string>[] {
  let runs = [base];
  for (const key of each) {
    const values = (Config.values as Record<string, readonly unknown[]>)[key];
    if (!values) fail(`--each=${key}: no such option`);
    runs = runs.flatMap((r) => values.map((v) => ({ ...r, [key]: String(v) })));
  }
  return runs;
}

// ------------------------------------------------------------------ drawing

/** A drawing as printed: spaces ending a line as `␠`, so they show; indented. */
const shown = (drawn: string, by = '    '): string =>
  drawn
    .replace(/\n$/, '')
    .replace(/ +$/gm, (spaces) => '␠'.repeat(spaces.length))
    .split('\n')
    .map((line) => by + line)
    .join('\n');

/** A fence for `content`: longer than any run of backticks starting one of its lines. */
const fenceFor = (content: string): string => '`'.repeat(Math.max(3, ...content.split('\n').map((l) => (/^ {0,3}(`+)/.exec(l)?.[1]!.length ?? 0) + 1)));

const block = (kind: string, content: string): string => {
  const fence = fenceFor(content);
  return `${fence}${kind}\n${content.replace(/\n$/, '')}\n${fence}`;
};

/** The clipboard as a config block's literal: its final line breaks kept as YAML keeps them. */
function clipboardYaml(text: string): string {
  const trailing = /\n*$/.exec(text)![0].length;
  const indicator = trailing === 0 ? '|-' : trailing === 1 ? '|' : '|+';
  const body = trailing ? text.slice(0, -trailing) : text;
  const lines = [...body.split('\n'), ...Array(Math.max(0, trailing - 1)).fill('')];
  return `clipboard: ${indicator}\n${lines.map((l) => (l === '' ? '' : `  ${l}`)).join('\n')}`;
}

/** A probe as a spec case: its config, its start, and each step with ourus's state drawn. */
function caseOf(p: Probe, ours: OurStep[]): string {
  const yaml = [`tags: ${['edge', ...p.tags].join(' ')}`, ...Object.entries(p.options).map(([k, v]) => `${k}: ${v}`), ...(p.clipboard ? [clipboardYaml(p.clipboard)] : [])].join('\n');
  const steps = ours.map((s) => `> ${s.actions.join(' ')}\n\n${block('buffer', s.buffer)}`);
  return [`## ${p.name}`, block('yaml', yaml), block('buffer', p.start), ...steps].join('\n\n');
}

// ------------------------------------------------------------------ apps

/** What a run of an app wrote (`AppRun` in run.ts), as far as a probe reads it. */
interface AppRun {
  examples: { name: string; verdict: string; adapted?: string[]; error?: string; steps: { actions: string[]; verdict?: string; ourus: string | null; app: string | null }[] }[];
  skipped: { name: string; reason: string }[];
}

interface AppResult {
  app: string;
  driver: Driver;
  run: AppRun | null;
  /** Why there is no run: a login wanted, or the run failed (its log says why). */
  missing?: string;
  seconds: number;
}

async function runApps(apps: readonly string[], all: Map<string, Driver>, specFile: string, dir: string, pass: readonly string[], say: (line: string) => void): Promise<AppResult[]> {
  await ensureProxy(cacheMode([...pass]), say);
  // Obsidian's instances fewer with the pool's browsers beside them, as a run of several apps has it
  if (apps.some((a) => !all.get(a)!.launch)) process.env.OURUS_SXS_OBSIDIANS ??= '2';
  const runner = fileURLToPath(new URL('./run.ts', import.meta.url));
  say(`${apps.length} apps at once: ${apps.map((a) => all.get(a)!.shortId).join(' ')} (logs in ${relative(process.cwd(), dir)}/)`);
  return Promise.all(
    apps.map(async (app) => {
      const t0 = Date.now();
      const json = join(dir, `${app}.json`);
      const log = openSync(join(dir, `${app}.log`), 'w');
      const child = spawn(process.execPath, [...process.execArgv, runner, app, `--probe=${specFile}`, `--json=${json}`, '--no-report', ...pass], { stdio: ['ignore', log, log] });
      const code = await new Promise<number>((done) => child.on('exit', (c) => done(c ?? 1)));
      closeSync(log);
      const seconds = (Date.now() - t0) / 1000;
      const driver = all.get(app)!;
      say(`  ${driver.shortId} ${code === 0 ? 'done' : code === LOGIN_EXIT ? 'wants a login' : `failed (exit ${code})`} in ${seconds.toFixed(0)}s`);
      const run = code === 0 && existsSync(json) ? (JSON.parse(readFileSync(json, 'utf8')) as AppRun) : null;
      return { app, driver, run, seconds, ...(run ? {} : { missing: code === LOGIN_EXIT ? 'wants a login' : `failed: ${relative(process.cwd(), join(dir, `${app}.log`))}` }) };
    }),
  );
}

const SYMBOL: Record<string, string> = { agree: '✓', caret: 'C', whitespace: 'S', disagree: '✗', error: 'E' };

/** A step's apps, grouped: by model, by the ourus state they are compared with, then by their own state. */
function stepGroups(results: readonly AppResult[], probe: string, k: number) {
  const bases = new Map<string, { model: string; base: string; under: string[]; states: Map<string, { verdict: string; ids: string[] }> }>();
  for (const r of results) {
    const e = r.run?.examples.find((x) => x.name === `probe.md › ${probe}`);
    const s = e?.steps[k];
    if (!e || !s || s.ourus === null) continue;
    const under = (e.adapted ?? []).filter((a) => a.startsWith('under ')).map((a) => a.slice(6));
    const adapted = (e.adapted ?? []).some((a) => !a.startsWith('under '));
    const key = `${r.driver.model}\u0000${s.ourus}`;
    if (!bases.has(key)) bases.set(key, { model: r.driver.model, base: s.ourus, under, states: new Map() });
    const g = bases.get(key)!;
    for (const u of under) if (!g.under.includes(u)) g.under.push(u);
    const state = s.app ?? '(not read)';
    if (!g.states.has(state)) g.states.set(state, { verdict: s.verdict ?? (e.verdict === 'error' ? 'error' : '?'), ids: [] });
    g.states.get(state)!.ids.push(r.driver.shortId + (adapted ? '*' : ''));
  }
  return [...bases.values()].sort((a, b) => (a.model === b.model ? 0 : a.model === 'text' ? -1 : 1));
}

// ------------------------------------------------------------------ main

async function main(): Promise<void> {
  const o = parseArgs(process.argv.slice(2));
  const probes = probesOf(o);
  const picked = await resolveApps(o.apps);
  if (picked.unknown.length) fail(`no such app: ${picked.unknown.join(', ')}; name US (ourus), ${await appNames()}`);
  const apps = picked.apps;
  if (o.each.length && apps.length) fail('--each plays ourus alone: the apps play the case under their own declared values');
  let broken = false;
  const say = (line: string): void => console.error(line);

  // ourus first: what the apps are compared with, and the probe file's drawings
  const ours = probes.map((p) => combinations(p.options, o.each).map((config) => ({ config, steps: playOurus(p, config) })));
  for (const runs of ours) for (const r of runs) if (r.steps.some((s) => s.broken)) broken = true;

  let results: AppResult[] = [];
  let dir: string | null = null;
  if (apps.length) {
    // a probe the apps can't be given: one whose ourus fails, or whose state a buffer can't draw
    const playable = probes.filter((p, i) => ours[i]![0]!.steps.every((s) => !s.broken && s.drawable));
    for (const p of probes) if (!playable.includes(p)) say(`${p.name}: not played on the apps (ourus fails, or a state has no final line break)`);
    if (playable.length) {
      dir = join(cacheDir, 'probe', new Date().toISOString().replace(/[:.]/g, '-'));
      mkdirSync(dir, { recursive: true });
      const specFile = join(dir, 'probe.md');
      writeFileSync(specFile, `# Probe\n\n${playable.map((p) => caseOf(p, ours[probes.indexOf(p)]![0]!.steps)).join('\n\n')}\n`);
      readSpec('probe.md', readFileSync(specFile, 'utf8')); // as the apps' runs will read it: a format error is ours, here
      results = await runApps(apps, await drivers(), specFile, dir, o.pass, say);
    }
  }

  if (o.format === 'spec') {
    for (const [i, p] of probes.entries()) console.log(`${caseOf(p, ours[i]![0]!.steps)}\n`);
    process.exitCode = broken ? 1 : 0;
    return;
  }
  if (o.format === 'json') {
    const json = probes.map((p, i) => ({
      name: p.name,
      start: p.start,
      options: p.options,
      clipboard: p.clipboard,
      ourus: ours[i]!.map((r) => ({ config: r.config, steps: r.steps })),
      apps: Object.fromEntries(
        results.map((r) => {
          const e = r.run?.examples.find((x) => x.name === `probe.md › ${p.name}`);
          const skip = r.run?.skipped.find((x) => x.name === `probe.md › ${p.name}`);
          return [r.driver.shortId, e ? { verdict: e.verdict, adapted: e.adapted ?? [], error: e.error, steps: e.steps } : skip ? { skipped: skip.reason } : { missing: r.missing ?? 'not run' }];
        }),
      ),
    }));
    console.log(JSON.stringify(json, null, 2));
    process.exitCode = broken ? 1 : 0;
    return;
  }

  for (const [i, p] of probes.entries()) {
    for (const run of ours[i]!) {
      const shownOptions = Object.entries(run.config).map(([k, v]) => `${k}: ${v}`);
      console.log(`== ${p.name}${shownOptions.length ? `  (${shownOptions.join(', ')})` : ''}${p.clipboard ? `  clipboard ${JSON.stringify(p.clipboard)}` : ''}\n`);
      console.log(shown(p.start));
      for (const [k, s] of run.steps.entries()) {
        console.log(`\n> ${s.actions.join(' ').padEnd(36)} ${s.result}${s.broken ? `  !! ${s.broken}` : ''}`);
        console.log(shown(s.buffer));
        const drawn = p.drawn?.[k];
        if (drawn !== undefined && normalize(drawn) !== s.buffer) {
          console.log(`  ✗ the case draws:\n${shown(drawn)}`);
          broken = true;
        }
        if (o.outline) console.log(shown(s.outline, '  │ '));
        if (run !== ours[i]![0]) continue;
        // each model's apps under the ourus state they are compared with (a text app's is ourus's own,
        // but under its declared values; a block app's, projected onto blocks)
        for (const g of stepGroups(results, p.name, k)) {
          const under = g.under.length ? `, ourus under ${g.under.join(', ')}` : '';
          const plain = g.model === 'text' && g.base === s.buffer;
          console.log(plain ? `  text apps${under}` : `  ${g.model === 'block' ? 'block apps, ourus as blocks' : 'text apps'}${under}:\n${shown(g.base, '        ')}`);
          for (const [state, { verdict, ids }] of [...g.states].sort((a, b) => b[1].ids.length - a[1].ids.length)) {
            console.log(`    ${SYMBOL[verdict] ?? verdict} ${ids.join(' ')}${verdict === 'agree' ? '' : `\n${shown(state, '        ')}`}`);
          }
        }
      }
      if (run === ours[i]![0] && results.length) {
        const skips = new Map<string, string[]>();
        const errors: string[] = [];
        for (const r of results) {
          const name = `probe.md › ${p.name}`;
          const skip = r.run?.skipped.find((x) => x.name === name);
          const e = r.run?.examples.find((x) => x.name === name);
          if (skip) skips.set(skip.reason, [...(skips.get(skip.reason) ?? []), r.driver.shortId]);
          else if (!r.run) errors.push(`${r.driver.shortId} ${r.missing}`);
          else if (e?.error) errors.push(`${r.driver.shortId}: ${e.error.split('\n')[0]}`);
        }
        if (skips.size) console.log(`\n  skipped: ${[...skips].map(([why, ids]) => `${ids.join(' ')} (${why})`).join('; ')}`);
        for (const e of errors) console.log(`  error: ${e}`);
      }
      console.log();
    }
  }
  if (dir) console.log(`(the probe and each app's log and run: ${relative(process.cwd(), dir)}/; ✓ agrees with ourus, C caret, S whitespace, ✗ disagrees, * adapted)`);
  process.exitCode = broken ? 1 : 0;
}

await main();
