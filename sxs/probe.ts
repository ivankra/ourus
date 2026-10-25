#!/usr/bin/env node
// Probe: a buffer and actions, played on ourus and, if asked, on the apps of the SxS side by side.
// Ourus's states print first; then each app as its run ends (its verdict, its long id, its seconds,
// what it agrees with, aligned; then its state as it is). To see what ourus does
// before drawing a case, or what the apps do on a shape no case draws, without writing one into spec/.
//
//   node sxs/probe.ts '- one⏎  ┃two' shiftEnter deleteContentBackward         # ourus alone
//   node sxs/probe.ts all '- one\n  ┃two' shiftEnter deleteContentBackward
//   node sxs/probe.ts LO,RR,text --clipboard='x\ny' '- a┃b' pastePlain
//   node sxs/probe.ts block --file=probes.md        # several probes, one start of each app
//   node sxs/probe.ts block probes.md               # the same: an .md file that exists
//   node sxs/probe.ts all --case=Enter28            # a spec case's start and actions
//   node sxs/probe.ts all Enter28                   # the same: a case's ID alone
//
// Run with no arguments, or --help, for every option.

import { spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Config } from '../src/config.ts';
import { docOf, drawDoc, drawOutline, drawText, readDrawing, readText } from '../test/drawing.ts';
import { isAction, play, type Played } from '../test/player.ts';
import { normalize, outcome, readClipboard } from '../test/spec-run.ts';
import { readSpec, specConfig, TAGS, tokenize, type Clipboard, type SpecTest } from '../test/specfile.ts';
import { appNames, drivers, resolveApps } from './lib/apps.ts';
import { ensureProxy } from './lib/browser.ts';
import type { Driver } from './lib/driver.ts';
import { LOGIN_EXIT } from './lib/login.ts';
import { cacheDir, cacheMode } from './proxy.ts';

const HELP = `usage: node sxs/probe.ts [<apps>] [options] [<buffer> <step>...|<file.md>|<case>]

  <apps>               what to test besides ourus, comma-separated: all; a group (block, text,
                       outliners, free); apps by directory or two capitals (LO, logseq, RR...);
                       -XX leaves one out (all,-RN,-RB). Left out, ourus plays alone (US).
  <buffer>             drawn as the spec draws it: ┃ caret (or one |, where the buffer draws no ┃
                       or «»: a | is then the text's), «» selection, ◌ placeholder, → tab,
                       ␍ CR, ⍽ no-break space; \\n or ⏎ a line break, a final one added unless --exact;
                       - reads it from stdin
  <step>               an argument per step, its actions in the spec's notation: commands (enter,
                       indent, ...), "typed text", motions (cursorDocEnd), undo, redo ('enter "x"')
  [--file=]<file.md>   probes from a file in the spec's format (each case's drawn buffers after the
                       actions are ignored: ourus's are taken), every app started once for all
  [--case=]<case>      a spec case's start, clipboard, options and actions (Enter28, enter.md#enter28,
                       a name's end); where ourus differs from its drawing, the drawing is shown
  --<option>=<value>   a config option (--flavor=obsidian --outdent=logical ...): the case's, so an
                       app is judged under its own declared values where it has others, as the SxS does
  --clipboard=<text>   the clipboard a paste pastes (\\n or ⏎ a line break)
  --clipboard-html=<html>  the clipboard's text/html beside its text, as a page's copy has it (left
                       out: the text alone). ourus reads the text. In a --file probe's config block,
                       the clipboard's formats: clipboard: / text/plain: | / text/html: '<ul>…</ul>'
  --tags=<tags>        the case's tags (free-form, markup-task, ...): which apps skip it
  --each=<option>      ourus alone: play under every value of an option (repeat for combinations)
  --outline            also print how ourus reads each state (the spec's outline block)
  --spec               print each probe as a spec case's blocks, ourus's states drawn
  --json               print the probes and every app's states as JSON
  --exact              take the buffer's bytes as given, no final line break added

The apps' runs go to .sxs/probe/<time>/ (the probe as a spec file, each app's log and run as
data), never into .sxs/results or a report. Exit status 1 where ourus fails to write or throws, or
differs from a --case's drawing.`;

// ------------------------------------------------------------------ arguments

interface Probe {
  name: string;
  /** The buffer, drawn. */
  start: string;
  steps: string[][];
  options: Record<string, string>;
  /** The clipboard, each format's text. */
  clipboard: Clipboard;
  tags: string[];
  /** A spec case's drawings of its steps (`--case`), to set beside ourus's. */
  drawn?: (string | undefined)[];
  /** Given on the command line: its name is made up (`P1`), and not shown. */
  unnamed?: true;
}

interface Args {
  apps: string;
  config: Record<string, string>;
  each: string[];
  clip: string;
  clipHtml?: string;
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
    else if (key === 'clipboard-html') o.clipHtml = breaks(value);
    else if (key === 'tags') o.tags.push(...value.split(/[,\s]+/).filter(Boolean));
    else if (key === 'file') o.file = value;
    else if (key === 'case') o.caseName = value;
    // the SxS's own (`--cache=offline`, `--plain-clipboard`, `--pace=`, `--headed`, ...), for each app's run
    else if (['cache', 'pace', 'slow', 'plain-clipboard', 'headed', 'fresh', 'timing'].includes(key)) o.pass.push(arg);
    else if (key in Config.values) o.config[key] = value;
    else fail(`unknown option --${key}; the config's are ${Object.keys(Config.values).join(', ')} (node sxs/probe.ts --help)`);
  }
  for (const tag of o.tags) if (!(TAGS as readonly string[]).includes(tag)) fail(`unknown tag ${tag}: the tags are ${TAGS.join(', ')}`);
  // `|` for the caret, in the buffer's argument alone (the first, or the one after the apps)
  const buffer = o.positional[0]?.includes('|') ? 0 : o.positional[0] !== undefined && !isBuffer(o.positional[0]) && o.positional[1]?.includes('|') ? 1 : -1;
  if (buffer >= 0) o.positional[buffer] = typedCaret(o.positional[buffer]!);
  // a file of probes alone (an `.md` that exists), after the apps or without them, is `--file`
  if (o.caseName === undefined && o.file === undefined) {
    const last = o.positional[o.positional.length - 1];
    if (last !== undefined && o.positional.length <= 2 && last.endsWith('.md') && existsSync(last)) {
      o.file = o.positional.pop()!;
      o.apps = o.positional.shift() ?? 'US';
      return o;
    }
  }
  // a spec case's ID alone, after the apps or without them, is `--case`: `probe.ts all Cut4`, `probe.ts Cut4`
  if (o.caseName === undefined && o.file === undefined) {
    const last = o.positional[o.positional.length - 1];
    if (last !== undefined && o.positional.length <= 2 && caseIds().has(last)) {
      o.caseName = o.positional.pop()!;
      o.apps = o.positional.shift() ?? 'US';
      return o;
    }
    // a word where a buffer goes, no caret in it (after the apps, or alone and capitalized, as IDs are):
    // a case's ID mistyped, not a buffer; after a buffer it is a step (`probe.ts 'hello┃' enter`)
    const apps = o.positional.length === 2 && !isBuffer(o.positional[0]!);
    if (last !== undefined && /^[A-Za-z][\w-]*$/.test(last) && (apps || (o.positional.length === 1 && /^[A-Z]/.test(last)))) {
      fail(`no case ${last} (a spec case's ID, or a buffer with a caret ┃)`);
    }
  }
  // the apps first, as run.ts takes them; a buffer there (a caret, a selection, a space, a line break,
  // or `-` for stdin), or nothing before --file or --case, is ourus alone
  const first = o.positional[0];
  o.apps = first === undefined || isBuffer(first) ? 'US' : o.positional.shift()!;
  return o;
}

/** A buffer's argument with its one `|` as the caret `┃`, where it draws no caret or selection of its
 * own (with one, a `|` is the text's: a table's); refused where it has several. */
function typedCaret(arg: string): string {
  if (/[┃«»]/.test(arg)) return arg;
  const bars = arg.split('|').length - 1;
  if (bars > 1) fail(`the buffer ${JSON.stringify(arg)} has ${bars} |: one, the caret (a | in the text wants the caret drawn ┃)`);
  return arg.replace('|', '┃');
}

/** Whether an argument is a buffer, not apps: a caret, a selection, a space, a line break, or `-` for stdin. */
const isBuffer = (arg: string): boolean => arg === '-' || /[┃«»⏎\s]|\\n/.test(arg);

/** Every spec case's ID (its own heading), unique across the spec's files. */
function caseIds(): Set<string> {
  const ids = new Set<string>();
  for (const f of readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
    for (const t of readSpec(f, readFileSync(join(specDir, f), 'utf8'))) ids.add(t.name);
  }
  return ids;
}

const specDir = fileURLToPath(new URL('../spec/', import.meta.url));

/** The spec case a name picks: its ID, or `file.md#anchor`. */
function findCase(name: string): SpecTest {
  const [file, anchor] = name.includes('#') ? name.split('#') : [null, null];
  const all = readdirSync(specDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && (!file || f === file || f === `${file}.md`))
    .flatMap((f) => readSpec(f, readFileSync(join(specDir, f), 'utf8')));
  const slug = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');
  const picked = anchor
    ? all.filter((t) => slug(t.name) === anchor.toLowerCase())
    : all.filter((t) => t.name === name);
  if (picked.length === 0) fail(`no case ${name}`);
  if (picked.length > 1) fail(`${name} is ${picked.length} cases: ${picked.map((t) => `${t.name} (${t.file})`).join(', ')}`);
  return picked[0]!;
}

/** The command line's clipboard: its text, and its HTML beside it. */
const clipboardOf = (o: Args): Clipboard => (o.clip || o.clipHtml !== undefined ? { 'text/plain': readText(o.clip), ...(o.clipHtml !== undefined && { 'text/html': o.clipHtml }) } : {});

/** A spec case as a probe: its options with the command line's over them. */
const fromCase = (t: SpecTest, o: Args): Probe => ({
  name: t.name,
  start: t.initial.buffer!,
  steps: t.steps.map((s) => [...s.actions]),
  options: { ...t.options, ...o.config },
  clipboard: t.initial.clipboard ? readClipboard(t.initial.clipboard) : clipboardOf(o),
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
  return [{ name: 'P1', start, steps: stepArgs.map((a) => tokenize(a)), options: o.config, clipboard: clipboardOf(o), tags: o.tags, unnamed: true }];
}

// ------------------------------------------------------------------ ourus

interface OurStep {
  actions: string[];
  /** The buffer after the step, drawn as the spec draws it; null where it can't be (no final line break). */
  buffer: string;
  drawable: boolean;
  result: string;
  outline: string;
  /** An action that failed to write or threw, with why. */
  broken?: string;
  /** The clipboard's text after a step that copies or cuts: what the apps' copy is compared with. */
  clipboard?: string;
}

function playOurus(p: Probe, config: Record<string, string>): OurStep[] {
  const start = readDrawing(p.start);
  let state: Played = {
    doc: docOf(start.text, start.placeholders, specConfig(config)),
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
        if (last?.status === 'rejected' && last.reason === 'write-failed') broken ??= `${action} fails to write${last.detail ? `: ${last.detail}` : ''}`;
      }
    } catch (e) {
      broken = `throws: ${e instanceof Error ? e.message : String(e)}`;
    }
    const text = state.doc.text;
    out.push({
      actions,
      buffer: normalize(drawDoc(state.doc, state.selection)),
      drawable: text === '' || /[\r\n]$/.test(text),
      result: outcome(state),
      outline: drawOutline(state.doc),
      ...(broken ? { broken } : {}),
      ...(actions.some((a) => a === 'copy' || a === 'cut') && state.clipboard['text/plain'] !== undefined ? { clipboard: state.clipboard['text/plain'] } : {}),
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

/** A state as printed: its lines held by a bracket on the left (`⎡ ⎢ ⎣`, `[` for one line). */
const bracketed = (drawn: string): string => {
  const lines = shown(drawn, '').split('\n');
  if (lines.length === 1) return `[${lines[0]}`;
  return lines.map((line, i) => (i === 0 ? '⎡' : i === lines.length - 1 ? '⎣' : '⎢') + line).join('\n');
};

/** A fence for `content`: longer than any run of backticks starting one of its lines. */
const fenceFor = (content: string): string => '`'.repeat(Math.max(3, ...content.split('\n').map((l) => (/^ {0,3}(`+)/.exec(l)?.[1]!.length ?? 0) + 1)));

const block = (kind: string, content: string): string => {
  const fence = fenceFor(content);
  return `${fence}${kind}\n${content.replace(/\n$/, '')}\n${fence}`;
};

/** A text as a config block's `key: ` literal, `by` its key's indentation: its final line breaks kept as YAML keeps them. */
function textYaml(key: string, text: string, by = ''): string {
  text = drawText(text);
  if (!/[\r\n]/.test(text)) return `${by}${key}: ${JSON.stringify(text)}`;
  const trailing = /\n*$/.exec(text)![0].length;
  const body = trailing ? text.slice(0, -trailing) : text;
  // lines that all start with spaces need an indentation indicator, or YAML takes them for its own
  const indicator = (/^ /.test(body.split('\n').find((l) => l !== '') ?? '') ? '|2' : '|') + (trailing === 0 ? '-' : trailing === 1 ? '' : '+');
  const lines = [...body.split('\n'), ...Array(Math.max(0, trailing - 1)).fill('')];
  return `${by}${key}: ${indicator}\n${lines.map((l) => (l === '' ? '' : `${by}  ${l}`)).join('\n')}`;
}

/** The clipboard as a config block's: its text alone as `clipboard: |`, else each format under it. */
function clipboardYaml(clipboard: Clipboard): string[] {
  const formats = Object.entries(clipboard);
  if (formats.length === 0) return [];
  if (formats.length === 1 && clipboard['text/plain'] !== undefined) return [textYaml('clipboard', clipboard['text/plain'])];
  return ['clipboard:', ...formats.map(([type, text]) => textYaml(type, text, '  '))];
}

/** A probe as a spec case: its config, its start, and each step with ourus's state drawn. */
function caseOf(p: Probe, ours: OurStep[]): string {
  const yaml = [`tags: ${['edge', ...p.tags].join(' ')}`, ...Object.entries(p.options).map(([k, v]) => `${k}: ${v}`), ...clipboardYaml(p.clipboard)].join('\n');
  // a step that copies or cuts checks the clipboard too, as the spec's cases do; a spec case's step
  // (`--case`) checks its buffer only where the case draws one, as the SxS does (what isn't drawn isn't checked)
  const steps = ours.map((s, k) => {
    const buffer = p.drawn && p.drawn[k] === undefined ? [] : [block('buffer', s.buffer)];
    return [`> ${s.actions.join(' ')}`, ...(s.clipboard !== undefined ? [block('yaml', clipboardYaml({ 'text/plain': s.clipboard }).join('\n'))] : []), ...buffer].join('\n\n');
  });
  return [`## ${p.name}`, block('yaml', yaml), block('buffer', p.start), ...steps].join('\n\n');
}

// ------------------------------------------------------------------ apps

/** What a run of an app wrote (`AppRun` in run.ts), as far as a probe reads it. */
interface AppRun {
  examples: { name: string; verdict: string; adapted?: string[]; error?: string; steps: { actions: string[]; verdict?: string; ourus: string | null; app: string | null; clipboard?: { ourus: string | null; app: string | null } }[] }[];
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

async function runApps(apps: readonly string[], all: Map<string, Driver>, specFile: string, dir: string, pass: readonly string[], say: (line: string) => void, done: (r: AppResult) => void = () => {}): Promise<AppResult[]> {
  await ensureProxy(cacheMode([...pass]), say);
  // Obsidian's instances fewer with the pool's browsers beside them, as a run of several apps has it
  if (apps.some((a) => !all.get(a)!.launch)) process.env.OURUS_SXS_OBSIDIANS ??= '2';
  const runner = fileURLToPath(new URL('./run.ts', import.meta.url));
  return Promise.all(
    apps.map(async (app) => {
      const t0 = Date.now();
      const json = join(dir, `${app}.json`);
      const log = openSync(join(dir, `${app}.log`), 'w');
      // the app's window kept loaded for the next probe, which then takes it over rather than loading it
      const child = spawn(process.execPath, [...process.execArgv, runner, app, `--probe=${specFile}`, `--json=${json}`, '--no-report', '--keep-windows', ...pass], { stdio: ['ignore', log, log] });
      const code = await new Promise<number>((done) => child.on('exit', (c) => done(c ?? 1)));
      closeSync(log);
      const seconds = (Date.now() - t0) / 1000;
      const driver = all.get(app)!;
      const run = code === 0 && existsSync(json) ? (JSON.parse(readFileSync(json, 'utf8')) as AppRun) : null;
      const result: AppResult = { app, driver, run, seconds, ...(run ? {} : { missing: code === LOGIN_EXIT ? 'wants a login' : `failed (exit ${code}): ${relative(process.cwd(), join(dir, `${app}.log`))}` }) };
      done(result);
      return result;
    }),
  );
}

const SYMBOL: Record<string, string> = { agree: '✓', caret: 'C', whitespace: 'S', disagree: '✗', error: 'E' };

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

  const text = o.format !== 'spec' && o.format !== 'json';
  const out = (line: string): void => console.log(line);
  // header lines coloured on a terminal: a step's actions, ourus's result, each app's line by its verdict
  const tty = process.stdout.isTTY === true;
  const paint = (code: string) => (line: string): string => (tty ? `\x1b[${code}m${line}\x1b[0m` : line);
  const bold = paint('1');
  const dim = paint('2');
  const cyan = paint('1;36');
  const blue = paint('1;34');
  const whiteBold = paint('1;37');
  const BY_MARK: Record<string, (line: string) => string> = { '✓': paint('32'), C: paint('33'), S: paint('33'), '✗': paint('1;31'), E: paint('35'), '?': paint('35'), '-': dim };
  const marked = (mark: string, line: string): string => (BY_MARK[mark] ?? ((l: string) => l))(line);
  const verbatim = (drawn: string): void => out(bracketed(drawn));
  let results: AppResult[] = [];
  let dir: string | null = null;
  let specFile: string | null = null;
  if (apps.length) {
    // a probe the apps can't be given: one whose ourus fails, or whose state a buffer can't draw
    const playable = probes.filter((p, i) => ours[i]![0]!.steps.every((s) => !s.broken && s.drawable));
    for (const p of probes) if (!playable.includes(p)) say(`${p.name}: not played on the apps (ourus fails, or a state has no final line break)`);
    if (playable.length) {
      dir = join(cacheDir, 'probe', new Date().toISOString().replace(/[:.]/g, '-'));
      mkdirSync(dir, { recursive: true });
      specFile = join(dir, 'probe.md');
      writeFileSync(specFile, `# Probe\n\n${playable.map((p) => caseOf(p, ours[probes.indexOf(p)]![0]!.steps)).join('\n\n')}\n`);
      readSpec('probe.md', readFileSync(specFile, 'utf8')); // as the apps' runs will read it: a format error is ours, here
    }
  }

  // a probe as text: its start, and for each step ourus's result, printed before any app plays it
  if (text) {
    let first = true;
    for (const [i, p] of probes.entries()) {
      for (const run of ours[i]!) {
        // a blank line between probes, or one probe's runs under several values: none within one
        if (!first) out('');
        first = false;
        const options = Object.entries(run.config).map(([k, v]) => `${k}: ${v}`);
        const clipboard = Object.entries(p.clipboard).map(([type, body]) => `${type} ${JSON.stringify(body)}`);
        // a probe's name where it has one (a file's case), its options where it has any
        if (!p.unnamed || options.length) out(bold(`== ${p.unnamed ? '' : p.name}${options.length ? `${p.unnamed ? '' : '  '}(${options.join(', ')})` : ''}`));
        if (clipboard.length) out(bold(`clipboard: ${clipboard.join(', ')}`));
        verbatim(p.start);
        for (const [k, s] of run.steps.entries()) {
          // ourus's result where it didn't apply (a refusal, the host's), on the actions' line
          out(cyan(`> ${s.actions.join(' ')}${s.result === 'applied' ? '' : `  (ourus: ${s.result})`}${s.broken ? `  !! ${s.broken}` : ''}`));
          verbatim(s.buffer);
          if (s.clipboard !== undefined) out(`clipboard: ${JSON.stringify(s.clipboard)}`);
          const drawn = p.drawn?.[k];
          if (drawn !== undefined && normalize(drawn) !== s.buffer) {
            out(marked('✗', '✗ the case draws:'));
            verbatim(drawn);
            broken = true;
          }
          if (o.outline) out(shown(s.outline, '│ '));
        }
      }
    }
  }

  // each step of each probe the apps play, by its probe and its index
  const steps = probes.flatMap((p, i) => ours[i]![0]!.steps.map((s, k) => ({ p, k, s })));
  const many = steps.length > 1;
  /** The ourus states other than ourus's own result that apps were compared with, printed once each. */
  const bases = new Set<string>();
  /** The column an app's line goes on in after its verdict, id and seconds: the longest id's, aligned. */
  let column = 0;
  /** An app's results as it finishes: a line a step (its verdict, id and seconds, then what it is
   * compared with, or why it has no verdict, aligned), then its state. */
  const entry = (r: AppResult): void => {
    const secs = `${r.seconds.toFixed(1)}s`;
    const line = (mark: string, star: boolean, more: string): void => {
      const rest = more.trimEnd();
      const head = `${mark} ${r.driver.longId}${star ? '*' : ''} ${secs}`;
      out(marked(mark, rest ? `${head.padEnd(column - 2)}  ${rest}` : head));
    };
    for (const [j, { p, k, s }] of steps.entries()) {
      const at = many ? `${p.unnamed ? '' : `${p.name} `}> ${s.actions.join(' ')}  ` : '';
      const name = p.name;
      const skip = r.run?.skipped.find((x) => x.name === name);
      const e = r.run?.examples.find((x) => x.name === name);
      if (!r.run) {
        if (j === 0) line('?', false, r.missing ?? '');
        continue;
      }
      if (skip) {
        if (k === 0) line('-', false, `${many ? `${p.name}  ` : ''}skipped: ${skip.reason}`);
        continue;
      }
      const step = e?.steps[k];
      // an error stops the run at the first step without a verdict
      const failed = !e || !step || (e.verdict === 'error' && step.verdict === undefined);
      if (failed) {
        const first = e ? e.steps.findIndex((x) => x.verdict === undefined) : 0;
        if (k === Math.max(first, 0)) line('E', false, `${at}${e?.error?.split('\n')[0] ?? 'error'}`);
        continue;
      }
      const under = (e.adapted ?? []).filter((a) => a.startsWith('under ')).map((a) => a.slice(6));
      const adapted = (e.adapted ?? []).some((a) => !a.startsWith('under '));
      // what the app is compared with: ourus's own result, or ourus's as blocks or under the app's values
      // (ourus's own as a text app draws it, without placeholders, is ourus's)
      const differs = step.ourus !== null && step.ourus !== s.buffer;
      const label = differs ? `${r.driver.model === 'block' ? 'ourus as blocks' : 'ourus'}${under.length ? `, under ${under.join(', ')}` : ''}` : 'ourus';
      const other = label !== 'ourus';
      const key = `${at}${label}\n${step.ourus}`;
      const mark = SYMBOL[step.verdict ?? ''] ?? step.verdict ?? '?';
      // an agreeing app's state is what it agrees with; where one doesn't agree with another state than
      // ourus's own, that state is printed once, before the first such app, unless an agreeing app showed it
      if (step.verdict === 'agree') bases.add(key);
      else if (other && !bases.has(key)) {
        bases.add(key);
        out(blue(`= ${at}${label}`));
        verbatim(step.ourus!);
      }
      // compared with ourus's own result: nothing to say; with another state, which
      line(mark, adapted, `${at}${other ? `${step.verdict === 'agree' ? '=' : 'against'} ${label}` : ''}`);
      if (step.app === undefined || step.app === null) out('(not read)');
      else verbatim(step.app);
      // the app's clipboard where it isn't ourus's
      if (step.clipboard && step.clipboard.app !== step.clipboard.ourus) out(`clipboard: ${JSON.stringify(step.clipboard.app)}`);
    }
  };
  if (specFile) {
    const all = await drivers();
    // the verdict, the id, a `*` where adapted, the seconds (to 9.9s), two spaces
    column = Math.max(...apps.map((app) => `✓ ${all.get(app)!.longId}* 0.0s`.length)) + 2;
    if (text) out(whiteBold(`Probing ${apps.length} app${apps.length === 1 ? '' : 's'}, logs: ${relative(process.cwd(), dir!)}/`));
    results = await runApps(apps, all, specFile, dir!, o.pass, say, text ? entry : undefined);
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
          const e = r.run?.examples.find((x) => x.name === p.name);
          const skip = r.run?.skipped.find((x) => x.name === p.name);
          return [r.driver.longId, e ? { verdict: e.verdict, adapted: e.adapted ?? [], error: e.error, steps: e.steps } : skip ? { skipped: skip.reason } : { missing: r.missing ?? 'not run' }];
        }),
      ),
    }));
    console.log(JSON.stringify(json, null, 2));
    process.exitCode = broken ? 1 : 0;
    return;
  }

  process.exitCode = broken ? 1 : 0;
}

await main();
