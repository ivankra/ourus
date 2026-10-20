// Differential run: every command at every line of generated documents, in two copies of the
// source, and a report of where the outcomes differ, grouped, with examples. By default the old
// copy is the last commit's `src/` (extracted with `git archive`), so a run says what the working
// tree changes. For a refactoring the report must be empty; for a behavior change each group needs
// a judgment.
//
// An outcome is everything a host sees: the status and reason, and for an applied command the
// changes themselves, the text, the selection, the outline's node ids and the placeholders; what settling the placeholders
// then does (with the caret where the command left it, and moved to the start); and a short host
// lifecycle after it: typing at the caret, settling, and undoing back to the text before the
// command with its placeholders, as the player and the CM6 demo do.
// Documents are read in every flavor and with every config option; carets and selections both, on
// every line, blank ones (empty or indented, a node's gap) included, in generated documents and in every
// buffer the spec draws (settled first where a placeholder is off the caret's line, as a host settles one
// the caret leaves). Runs the new copy fails to encode are reported apart too, against a baseline
// (`differential.baseline.json`) they may only fall below: `encoding-failed` is a bug whether or not
// the old copy had it.
//
//   DIFF_UPDATE=1 node test/differential.ts   # the same, then the failures as the new baseline
//   DIFF_DUMP=f.jsonl node test/differential.ts  # every failing run as a JSON line: command, text,
//                                                 # selection, config, placeholders, paste, detail
//
//   node test/differential.ts                 # HEAD against the working tree
//   node test/differential.ts <old> [<new>]   # two directories that each hold a `src/`
//   DIFF_DOCS=3000 DIFF_EXAMPLES=8 node test/differential.ts
//   DIFF_WORKERS=1 node test/differential.ts  # one thread (by default one per core): the same report
//
// The documents are played in worker threads, each a share of them; what they report is merged in the
// documents' order, so the report is the same however many play it.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { join, resolve } from 'node:path';
import { Config } from '../src/config.ts';
import { lineSpan, mapPos, type ChangeSpec } from '../src/text.ts';
import { readDrawing, readText } from './drawing.ts';
import { readSpec, specConfig } from './specfile.ts';

const here = resolve(import.meta.dirname, '..');
const [oldArg, newArg] = process.argv.slice(2);

/** A directory holding the last commit's `src/`. */
function headSource(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ourus-head-'));
  const archive = execFileSync('git', ['archive', 'HEAD', 'src'], { cwd: here });
  execFileSync('tar', ['-x', '-C', dir], { input: archive });
  return dir;
}

// a worker plays the copies its main thread named
const oldRoot: string = isMainThread ? (oldArg ? resolve(oldArg) : headSource()) : workerData.oldRoot;
const newRoot: string = isMainThread ? (newArg ? resolve(newArg) : here) : workerData.newRoot;

interface Snapshot {
  readonly text: string;
  readonly placeholders: readonly number[];
  readonly nodes: readonly { readonly id: number; readonly kind: string; readonly startLine: number }[];
  readonly lines: readonly { readonly from: number; readonly to: number; readonly contentFrom: number; readonly blank: boolean }[];
}
interface Core {
  parse(text: string, config: Record<string, unknown>, placeholders?: readonly number[]): Snapshot;
  execute(doc: Snapshot, command: { type: string; text?: string }, selection: { anchor: number; head: number }): any;
  settle(doc: Snapshot, caret: number): { changes: unknown[]; doc: Snapshot } | null;
  /** A host's edit (typing, undo), with the caret it leaves, or the whole text replaced. */
  edit(doc: Snapshot, changes: { from: number; to: number; insert: string }[], params: Record<string, unknown>): Snapshot;
  replace(doc: Snapshot, text: string, params: Record<string, unknown>): Snapshot;
}

/** Commands by their names before they were renamed, for a copy from before. */
const formerNames: Record<string, string> = { moveSubtreeUp: 'moveBlockUp', moveSubtreeDown: 'moveBlockDown', duplicateSubtree: 'duplicateNode' };

/** The core of a copy, through its package entry, whatever its API's names are at that point. */
async function load(root: string): Promise<Core> {
  const api = await import(join(root, 'src/index.ts'));
  const State = api.OutlineState ?? api.OutlineDoc;
  const execute = api.executeCommand ?? api.execute;
  const settle = api.settlePlaceholders ?? api.settle;
  // a copy from before the commands' renaming knows them by their former names
  const former = !readFileSync(join(root, 'src/commands/index.ts'), 'utf8').includes("'moveSubtreeUp'");
  return {
    parse: (text, config, placeholders = []) => State.parse(text, { config, placeholders }),
    execute: (doc, command, selection) => {
      const result = execute(doc, former ? { ...command, type: formerNames[command.type] ?? command.type } : command, selection);
      return result.status === 'applied' ? { ...result, doc: result.state ?? result.doc } : result;
    },
    edit: (doc: any, changes, params) => (doc.update ?? doc.apply).call(doc, changes, params),
    replace: (doc: any, text, params) => doc.replace(text, params),
    settle: (doc, caret) => {
      const settled = settle(doc, caret);
      return settled && { changes: settled.changes, doc: settled.state ?? settled.doc };
    },
  };
}
// a small deterministic generator, so two runs see the same documents; each document's runs draw
// from one of their own, seeded by its index, so a share of them plays as it would with the rest
const generator = (start: number): ((n: number) => number) => {
  let seed = start;
  return (n) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return (seed >>> 8) % n;
  };
};
const random = generator(11);
const blocks = [
  'p', 'p', 'two\nlines', '- i', '- i', '  - c', '    - g', '- [ ] t', '- [x] t', '# H', '## S', 'S\n---', '```\nx\n```', '> q', '> - q', '1. n', '2. m', '- ',
  '> [!note] q', '| a | b |\n|---|---|', '$$\nm\n$$', '%%\nm\n%%', '- [[w]] #t',
  // text that reads as something else at a line's start, for splits, joins and pastes to escape
  'p - x', '- i 1. x', 'p # h', '# H - x', 'p > q', 'p\n[r]: /u', '- i ``` c', 'p ---', 'p 2) x', '[a]: b c',
  // blocks of an item, as users write them under one: a quote as its first block, math, code
  '- > q', '- i\n  $$\n  m\n  $$', '- i\n  ```js\n  x\n  ```', '- i\n\n      code',
];
const commands = ['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'pasteStructured', 'pastePlain', 'deleteSubtree', 'duplicateSubtree'];
// what users paste: besides Markdown of each kind, a line copied with its line break, and a block
// copied from inside a list from its fence on (its other lines keep the item's indentation)
const pastes = ['x', '- a\n- b', '> q', '```\nc\n```', 'one\ntwo', '1. a\n2. b\n', 'x\n', '```js\n    c\n    ```', '# h\ntext\n', '| a |\n| - |\n| 1 |\n', '- [ ] t\n  - c\n'];
/** Every flavor with the defaults, then every other value of every option (in the default flavor), one at a time. */
const configs: Record<string, unknown>[] = [
  { flavor: 'gfm' }, { flavor: 'commonmark' }, { flavor: 'obsidian' },
  { outdent: 'logical' }, { bullet: '*' }, { enterOnEmptyItem: 'outdent' }, { enterOnEmptyItem: 'exit' }, { enterMidItem: 'child' }, { enterAtTextStart: 'stay' },
  { backspaceAtTopItem: 'refuse' }, { emptyItemWithChildren: 'refuse' }, { joinWithChildren: 'refuse' }, { handleFenceContents: false },
  { headingEditing: 'block' }, { taskEditing: 'text' }, { taskEditing: 'block' }, { enterTask: 'plain' }, { enterSplitSpace: 'drop' }, { enterSplitSpace: 'start' }, { pasteStructuredLines: 'items' }, { pasteStructuredMidText: 'after' },
  { markup: 'decorated' },
];
const documents = Number(process.env.DIFF_DOCS ?? 1500);
const examples = Number(process.env.DIFF_EXAMPLES ?? 3);

/** An example, at the run it came from: the document's index, then the run's within it, for the merge's order. */
interface Example {
  readonly at: [number, number];
  readonly text: string;
}
/** Runs whose outcomes differ, by kind: how many, and the first few. */
type Groups = Map<string, { count: number; examples: Example[] }>;
/** What playing a share of the documents found. */
interface Found {
  runs: number;
  groups: Groups;
  /** Runs the new copy fails to encode, by command: bugs whatever the old copy did. */
  failures: Groups;
  /** Every failing run, for `DIFF_DUMP`: to cluster the failures by command, the caret line's shape and the detail. */
  dump: Example[];
}
const label = (r: { status: string; reason?: string }): string => `${r.status}${r.reason ? ' ' + r.reason : ''}`;
const drawn = (text: string, sel: { anchor: number; head: number }): string => {
  const [from, to] = [Math.min(sel.anchor, sel.head), Math.max(sel.anchor, sel.head)];
  return JSON.stringify(from === to ? text.slice(0, from) + '┃' + text.slice(from) : text.slice(0, from) + '«' + text.slice(from, to) + '»' + text.slice(to));
};
/** What a host sees of a snapshot: text, placeholders, and the ids of the outline's nodes. */
const seen = (doc: Snapshot): string => JSON.stringify([doc.text, doc.placeholders, doc.nodes.map((n) => `${n.kind}@${n.startLine}#${n.id}`)]);
const outcome = (core: Core, start: Snapshot, r: any): string => {
  if (r.status !== 'applied') return label(r);
  const settledHere = core.settle(r.doc, r.selection.head);
  const settledAway = core.settle(r.doc, 0);
  // the host's lifecycle: type at the caret, leave, then undo to before the command
  const caret = r.selection.head;
  const typed = core.edit(r.doc, [{ from: caret, to: caret, insert: 'x' }], { caret: caret + 1 });
  const left = core.settle(typed, 0)?.doc ?? typed;
  const undone = core.replace(left, start.text, { drop: [...left.placeholders], placeholders: start.placeholders });
  return JSON.stringify([label(r), seen(r.doc), r.selection, r.changes, settledHere && [settledHere.changes, seen(settledHere.doc)], settledAway && [settledAway.changes, seen(settledAway.doc)], seen(typed), seen(left), seen(undone)]);
};
/** A command's result, or what it threw (a host would see the exception): an outcome of its own. */
const attempt = (core: Core, doc: Snapshot, command: { type: string; text?: string }, selection: { anchor: number; head: number }): any => {
  try {
    return core.execute(doc, command, selection);
  } catch (e) {
    return { status: 'threw', reason: (e as Error).message.split('\n')[0] };
  }
};

/** Where two outcomes first differ, for the report. */
const aspect = (a: string, b: string): string => {
  if (!a.startsWith('[') || !b.startsWith('[')) return '';
  const [x, y] = [JSON.parse(a), JSON.parse(b)];
  const names = ['status', 'snapshot', 'selection', 'changes', 'settled at the caret', 'settled elsewhere', 'typed at the caret', 'typed, then left', 'undone'];
  const i = names.findIndex((_, k) => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
  return i < 0 ? '' : ` (${names[i]})`;
};

/** A document to play every command in: generated, or a buffer the spec draws, as it draws it. */
interface Doc {
  readonly text: string;
  readonly config: Record<string, unknown>;
  readonly placeholders: readonly number[];
  readonly pastes: readonly string[];
}
const docs: Doc[] = [];
for (let d = 0; isMainThread && d < documents; d++) {
  const count = 2 + random(6);
  let text = '';
  for (let k = 0; k < count; k++) {
    // blank lines between blocks, empty or (as editors leave them) indented
    const blank = (): string => [' ', '  ', '      '][random(3)]!.slice(0, random(2) === 0 ? 0 : undefined);
    text += blocks[random(blocks.length)]!.replace(/(p|i|c|g|t|H|S|q|n|m)$/m, (x) => x + k) + '\n' + Array.from({ length: random(3) === 0 ? 1 + random(2) : 0 }, () => blank() + '\n').join('');
  }
  // the flavor named, so a copy from before, whose default may be another, reads it the same
  docs.push({ text, config: { flavor: Config.defaults.flavor, ...configs[d % configs.length]! }, placeholders: [], pastes });
}
// every buffer the spec draws, with its case's options (a case of every flavor in one, chosen by its
// ID, so a case added or a file renamed changes no other case's), and its clipboards among the
// pastes: a shape a case draws is played by every command, so what users hit, once it is a case,
// stays in the corpus
const specDir = join(here, 'spec');
const specPastes = new Set<string>(pastes);
const specDocs = new Map<string, Doc>();
for (const file of isMainThread ? readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort() : []) {
  for (const t of readSpec(file, readFileSync(join(specDir, file), 'utf8'))) {
    if (t.initial.clipboard !== undefined) specPastes.add(readText(t.initial.clipboard));
    const config: Record<string, unknown> = { ...specConfig(t.options) };
    config.flavor ??= Config.values.flavor[createHash('sha256').update(t.name.split(' › ').pop()!).digest()[0]! % Config.values.flavor.length];
    for (const buffer of [t.initial.buffer, ...t.steps.map((step) => step.expect.buffer)]) {
      if (buffer === undefined) continue;
      const { text, placeholders } = readDrawing(buffer);
      const key = JSON.stringify([text, placeholders, config]);
      if (!specDocs.has(key)) specDocs.set(key, { text, config, placeholders, pastes: [] });
    }
  }
}
for (const doc of specDocs.values()) docs.push({ ...doc, pastes: [...specPastes] });

/** Plays every command at every line of the documents `share` names, in both copies. */
async function play(share: readonly number[]): Promise<Found> {
  const before = await load(oldRoot);
  const after = await load(newRoot);
  const found: Found = { runs: 0, groups: new Map(), failures: new Map(), dump: [] };
  const note = (into: Groups, key: string, at: [number, number], example: () => string): void => {
    const group = into.get(key) ?? { count: 0, examples: [] };
    group.count++;
    if (group.examples.length < examples) group.examples.push({ at, text: example() });
    into.set(key, group);
  };
  for (const index of share) {
    const { text, config, placeholders, pastes } = docs[index]!;
    const random = generator(1 + index);
    let run = 0;
    const oldDoc = before.parse(text, config, placeholders);
    const newDoc = after.parse(text, config, placeholders);
    const lines = oldDoc.lines;
    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo]!;
      // on a blank line (the gap of the node above), carets at its edges
      const blankSelections = line.blank ? [...new Set([line.from, line.to])].map((pos) => ({ anchor: pos, head: pos })) : null;
      // carets at the line's edges, its text start, and after the first space in its text (mid-text)
      const space = oldDoc.text.indexOf(' ', line.contentFrom + 1);
      const mid = space > 0 && space < line.to ? space + 1 : line.contentFrom;
      const selections = blankSelections ?? [...new Set([line.from, line.to, line.contentFrom, Math.min(line.to, line.contentFrom + 1), mid])].map((pos) => ({ anchor: pos, head: pos }));
      // a selection inside the line's text, and one reaching into the next line
      if (!blankSelections && line.to > line.contentFrom + 1) selections.push({ anchor: line.contentFrom + 1, head: line.to });
      const next = lines[lineNo + 1];
      if (!blankSelections && next && random(2) === 0) selections.push({ anchor: line.contentFrom, head: Math.min(next.to, next.contentFrom + 1) });
      for (const drawnSelection of selections) {
        // a placeholder off the caret's line is one a host has settled already, as the caret left it
        // (the new copy's settling, for both): the run starts from there
        const [from, to] = lineSpan(text, drawnSelection.head);
        const settled = placeholders.some((p) => p < from || p > to) ? after.settle(newDoc, drawnSelection.head) : null;
        const runText = settled ? settled.doc.text : text;
        const runPlaceholders = settled ? settled.doc.placeholders : placeholders;
        const selection = settled ? { anchor: mapPos(settled.changes as ChangeSpec[], drawnSelection.anchor), head: mapPos(settled.changes as ChangeSpec[], drawnSelection.head) } : drawnSelection;
        const [oldAt, newAt] = settled ? [before.parse(runText, config, runPlaceholders), after.parse(runText, config, runPlaceholders)] : [oldDoc, newDoc];
        for (const type of commands) {
          const command = type === 'pasteStructured' || type === 'pastePlain' ? { type, text: pastes[random(pastes.length)] } : { type };
          const a = outcome(before, oldAt, attempt(before, oldAt, command, selection));
          const result = attempt(after, newAt, command, selection);
          const b = outcome(after, newAt, result);
          found.runs++;
          const at: [number, number] = [index, run++];
          // encoding-failed is a bug, whether or not the old copy had it too, and a command that throws worse
          if ((result.status === 'rejected' && result.reason === 'encoding-failed') || result.status === 'threw') {
            note(found.failures, type, at, () => `${drawn(runText, selection)} [${JSON.stringify(config)}]${command.text !== undefined ? ` pasting ${JSON.stringify(command.text)}` : ''}: ${result.detail ?? result.reason ?? ''}`);
            if (process.env.DIFF_DUMP) found.dump.push({ at, text: JSON.stringify({ type, text: runText, selection, config, placeholders: runPlaceholders, paste: command.text, detail: result.detail ?? result.reason, ...(settled ? { settled: true } : {}) }) });
          }
          if (a === b) continue;
          const short = (o: string): string => (o.startsWith('[') ? JSON.parse(o)[0] : o);
          note(found.groups, `${type} [${JSON.stringify(config)}]: ${short(a)} → ${short(b)}${aspect(a, b)}`, at, () => `${drawn(runText, selection)}\n           was ${a.slice(0, 300)}\n           now ${b.slice(0, 300)}`);
        }
      }
    }
  }
  return found;
}

// a worker plays its share and hands back what it found; the main thread deals the documents out, one
// in so many to each, and merges what they found in the documents' order
if (!isMainThread) {
  docs.push(...workerData.docs);
  parentPort!.postMessage(await play(workerData.share));
  process.exit(0);
}
const workers = Math.max(1, Math.min(Number(process.env.DIFF_WORKERS ?? availableParallelism()), docs.length));
const shares = Array.from({ length: workers }, (_, w) => docs.map((_, i) => i).filter((i) => i % workers === w));
const parts: Found[] =
  workers === 1
    ? [await play(shares[0]!)]
    : await Promise.all(
        shares.map(
          (share) =>
            new Promise<Found>((done, failed) => {
              const worker = new Worker(new URL(import.meta.url), { workerData: { oldRoot, newRoot, docs, share } });
              worker.once('message', done);
              worker.once('error', failed);
            }),
        ),
      );
const order = (x: Example, y: Example): number => x.at[0] - y.at[0] || x.at[1] - y.at[1];
const merge = (all: Groups[]): Map<string, { count: number; examples: string[] }> => {
  const merged = new Map<string, { count: number; examples: Example[] }>();
  for (const part of all) {
    for (const [key, g] of part) {
      const m = merged.get(key) ?? { count: 0, examples: [] };
      m.count += g.count;
      m.examples.push(...g.examples);
      merged.set(key, m);
    }
  }
  return new Map([...merged].map(([key, g]) => [key, { count: g.count, examples: g.examples.sort(order).slice(0, examples).map((e) => e.text) }]));
};
const runs = parts.reduce((n, p) => n + p.runs, 0);
const groups = merge(parts.map((p) => p.groups));
const failures = merge(parts.map((p) => p.failures));
const dump = parts.flatMap((p) => p.dump).sort(order).map((e) => e.text);

console.log(`${runs} command runs on ${documents} documents: ${oldRoot} → ${newRoot}`);
// ties by key, so the order is the same however many workers found them
const sorted = [...groups].sort(([x, gx], [y, gy]) => Number(y.includes('→ rejected')) - Number(x.includes('→ rejected')) || gy.count - gx.count || (x < y ? -1 : x > y ? 1 : 0));
for (const [key, group] of sorted) {
  console.log(`${String(group.count).padStart(6)} ${key}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
if (groups.size === 0) console.log('no differences');

// the runs that fail to encode, against the baseline: a ratchet, the count of no command going up.
// With the default corpus only; `DIFF_UPDATE=1` writes the counts as the new baseline once they fell.
const baselineFile = join(here, 'test/differential.baseline.json');
// the corpus the counts are of: generated documents and the spec's, which a new case changes, and how
// runs start from them (`starts`, to change with it: since 2, settled where a placeholder is off the caret's line;
// since 3, each document's choices drawn from a generator of its own), whatever order its files are read in
const starts = 3;
const corpus = createHash('sha256').update(JSON.stringify([starts, docs.map((d) => JSON.stringify([d.text, d.config, d.placeholders, d.pastes.length])).sort()])).digest('hex').slice(0, 16);
const baseline: { documents: number; corpus?: string; failures: Record<string, number> } | null = (() => {
  try {
    return JSON.parse(readFileSync(baselineFile, 'utf8'));
  } catch {
    return null;
  }
})();
if (process.env.DIFF_DUMP) writeFileSync(process.env.DIFF_DUMP, dump.join('\n') + (dump.length ? '\n' : ''));
const comparable = baseline !== null && baseline.documents === documents;
// on another corpus (the spec changed) the counts are shown against the baseline, not held to it
const sameCorpus = comparable && baseline.corpus === corpus;
const failed = [...failures.values()].reduce((n, f) => n + f.count, 0);
const was = comparable ? Object.values(baseline.failures).reduce((n, c) => n + c, 0) : null;
console.log(`\n${failed} runs fail to encode in ${newRoot}${was === null ? '' : ` (baseline ${was})`}${failed ? ':' : ''}`);
const rose: string[] = [];
for (const type of [...new Set([...failures.keys(), ...(comparable ? Object.keys(baseline.failures) : [])])].sort((x, y) => (failures.get(y)?.count ?? 0) - (failures.get(x)?.count ?? 0) || (x < y ? -1 : x > y ? 1 : 0))) {
  const failure = failures.get(type) ?? { count: 0, examples: [] };
  const before = comparable ? (baseline.failures[type] ?? 0) : null;
  if (before !== null && sameCorpus && failure.count > before) rose.push(`${type} ${before} → ${failure.count}`);
  console.log(`${String(failure.count).padStart(6)} ${type}${before === null ? '' : ` (baseline ${before})`}`);
  for (const example of failure.examples) console.log(`         ${example}`);
}
if (rose.length) console.log(`\nmore runs fail to encode than the baseline: ${rose.join(', ')}`);
if (comparable && !sameCorpus) console.log('\nthe corpus changed since the baseline (the spec): its counts are not held to it; DIFF_UPDATE=1 records them');
if (process.env.DIFF_UPDATE === '1') {
  if (rose.length) console.log('baseline not updated: it only goes down');
  else {
    writeFileSync(baselineFile, JSON.stringify({ documents, corpus, failures: Object.fromEntries([...failures].map(([type, f]) => [type, f.count]).sort()) }, null, 2) + '\n');
    console.log(`baseline updated: ${baselineFile}`);
  }
}
// a refactoring must change nothing; a behavior change, each difference judged; failures only fall
process.exitCode = groups.size === 0 && rose.length === 0 ? 0 : 1;
