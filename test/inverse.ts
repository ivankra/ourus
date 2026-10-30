// Inverse pairs: every pair of commands that undo each other (Enter and Backspace, Shift-Enter and
// Backspace, indent and outdent, up and down, both ways) at every caret position of every distinct
// start buffer the spec draws, through the spec's player; and every drop a pickup offers there (each
// node pressed, the caret at its text's start), then the drop back to where the run was. A report of
// the round trips that don't give the text back, grouped by the pair and the shape of the difference:
//
//   blank+, blank-  the same lines but for more, or fewer, blank lines
//   space           the same text but for spaces and tabs
//   text            the same outline, other text (an escape, a marker)
//   tree            another outline
//   caret           the same text, the caret elsewhere
//   <status>        the second command didn't apply (refused, or the host's)
//
// Only pairs whose first command applied count: two no-ops would come back. Some groups are what the
// spec decides (direct outdent hands the later siblings to the item, which indent then takes along;
// a heading's section and setext to ATX are Markdown's; an indented paragraph under a paragraph loses
// its blank line; a blank line a join or a move leaves where it no longer separates anything); each group's count is
// held to a baseline (`inverse.baseline.json`) on the same corpus, so a new kind of round trip that
// doesn't come back, or more of one, fails the run. A write failure or an exception on either
// step always fails it.
//
//   node test/inverse.ts                     # the report, against the baseline
//   INVERSE_UPDATE=1 node test/inverse.ts    # the same, then its counts as the new baseline, once read
//   INVERSE_EXAMPLES=8 node test/inverse.ts  # examples per group (default 3)
//   INVERSE_WORKERS=1 node test/inverse.ts   # one thread (by default one per core): the same report
//   INVERSE_DUMP=f.txt node test/inverse.ts  # every round trip that doesn't come back, a line each, sorted:
//                                            # diff two trees' dumps to see which runs a change moved
//
// The buffers are played in worker threads, each a share of them; what they report is merged in the
// buffers' order, so the report is the same however many play it.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { executeCommand, type InsertionPoint, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { textStart } from '../src/commands/util.ts';
import { drawDoc, nodesOf, readDrawing } from './drawing.ts';
import { play, type Played } from './player.ts';
import { readSpecFile, specConfig, specFiles } from './specfile.ts';
import { flavorsOf } from './spec-run.ts';
import { KNOWN } from './drops.ts';
import { statusOf } from './drawing.ts';

const here = resolve(import.meta.dirname, '..');
const PAIRS: readonly [string, string][] = [
  ['enter', 'deleteContentBackward'],
  ['shiftEnter', 'deleteContentBackward'],
  ['indent', 'outdent'],
  ['outdent', 'indent'],
  ['moveSubtreeUp', 'moveSubtreeDown'],
  ['moveSubtreeDown', 'moveSubtreeUp'],
  // a cut (at a caret, the node with its subtree) pasted back where it leaves the caret
  ['cut', 'paste'],
];
const examples = Number(process.env.INVERSE_EXAMPLES ?? 3);

// every distinct start buffer, with its case's options, in its first flavor; the true-outliner
// file's are another app's catalogue, and a start with placeholders is a middle state
const starts: { text: string; config: Record<string, unknown>; name: string }[] = [];
const seen = new Set<string>();
for (const file of isMainThread ? specFiles().filter((f) => f !== 'obsidian-true-outliner.md') : []) {
  for (const t of readSpecFile(file)) {
    const start = readDrawing(t.initial.buffer);
    if (start.placeholders.length) continue;
    const config = { ...specConfig(t.options), flavor: flavorsOf(t)[0] };
    const key = JSON.stringify([start.text, config]);
    if (seen.has(key)) continue;
    seen.add(key);
    starts.push({ text: start.text, config, name: t.name });
  }
}
// the corpus's identity, whatever order its files are read in (a renamed file changes nothing)
const corpus = createHash('sha256').update(JSON.stringify(starts.map((s) => JSON.stringify([s.text, s.config])).sort())).digest('hex').slice(0, 16);

const isBlank = (line: string): boolean => /^[ \t>]*$/.test(line);
const outline = (doc: OurusDoc): string => JSON.stringify(nodesOf(doc).map((n) => [n.depth, n.kind, n.head?.type ?? null]));
function classify(start: OurusDoc, end: Played, from: number): string {
  const [a, b] = [start.text, end.view.doc.text];
  if (a === b) return end.selection.head === from && end.selection.anchor === from ? 'same' : 'caret';
  if (outline(start) !== outline(end.view.doc)) return 'tree';
  const solid = (s: string): string => s.split('\n').filter((l) => !isBlank(l)).join('\n');
  if (solid(a) === solid(b)) return a.split('\n').filter(isBlank).length < b.split('\n').filter(isBlank).length ? 'blank+' : 'blank-';
  if (a.replace(/[ \t]/g, '') === b.replace(/[ \t]/g, '')) return 'space';
  return 'text';
}

/** An example or a failure, at the start buffer it came from, for the merge's order. */
interface Noted {
  readonly at: number;
  readonly buffer: string;
  readonly text: string;
}
/** What playing a share of the start buffers found: the round trips that don't come back, by kind, and the failures. */
interface Found {
  runs: number;
  groups: Map<string, { runs: number; buffers: string[]; examples: Noted[] }>;
  failures: Noted[];
  /** Write failures at the starts the drop pass knows (`drops.ts`'s `KNOWN`): reported, not failed. */
  known: string[];
  /** Every round trip that doesn't come back, with `INVERSE_DUMP`. */
  dumped: string[];
}
const dumping = !!process.env.INVERSE_DUMP;
const draw = (p: Played): string => JSON.stringify(drawDoc(p.view, p.selection));

/** Plays every pair at every caret position of the start buffers `share` names. */
function playShare(share: readonly number[]): Found {
  const found: Found = { runs: 0, groups: new Map(), failures: [], known: [], dumped: [] };
  const known = found.known;
  const groups = new Map<string, { runs: number; buffers: Set<string>; examples: Noted[] }>();
  const fail = (index: number, text: string): void => void found.failures.push({ at: index, buffer: '', text });
  for (const index of share) {
    const s = starts[index]!;
    const doc = OurusDoc.parse(s.text, { config: s.config });
    const view = OurusView.of(doc);
    for (const [first, second] of PAIRS) {
      for (let pos = 0; pos <= s.text.length; pos++) {
        if (s.text[pos - 1] === '\r' && s.text[pos] === '\n') continue;
        const at: Played = { view, selection: { anchor: pos, head: pos }, clipboard: {} };
        found.runs++;
        let mid: Played;
        let end: Played;
        try {
          mid = play(at, [first]);
          if (mid.last instanceof OurusRejected && mid.last.reason === 'write-failed') {
            fail(index, `${first} failed to write: ${s.name} ${draw(at)}`);
            continue;
          }
          if (!(mid.last instanceof OurusSuccess)) continue;
          end = play(mid, [second]);
        } catch (e) {
          fail(index, `${first}, ${second} threw: ${s.name} ${draw(at)}: ${(e as Error).message.split('\n')[0]}`);
          continue;
        }
        const last = end.last;
        if (last instanceof OurusRejected && last.reason === 'write-failed') {
          fail(index, `${second} after ${first} failed to write: ${s.name} ${draw(at)} → ${draw(mid)}`);
          continue;
        }
        const shape = last instanceof OurusSuccess ? classify(doc, end, pos) : last instanceof OurusRejected ? `rejected ${last.reason}` : (last ? statusOf(last) : '-');
        if (shape === 'same') continue;
        const key = `${first}, ${second}: ${shape}`;
        if (dumping) found.dumped.push(`${key}\t${s.name}\t${draw(at)}\t${draw(mid)}\t${draw(end)}`);
        const group = groups.get(key) ?? { runs: 0, buffers: new Set<string>(), examples: [] };
        group.runs++;
        if (!group.buffers.has(s.text) && group.examples.length < examples) group.examples.push({ at: index, buffer: s.text, text: `${s.name}\n           ${draw(at)}\n         → ${draw(mid)}\n         → ${draw(end)}` });
        group.buffers.add(s.text);
        groups.set(key, group);
      }
    }
    // drops: each node pressed, every place offered dropped at, then back where it was
    for (const node of nodesOf(doc)) {
      // (the caret in the first text in the node: a quote's is its first child's)
      let held = node;
      while (!doc.textOf(held) && held.children.length) held = held.children[0]!;
      const text = doc.textOf(held);
      const pos = text ? doc.posOf(held, textStart(text), 1) : doc.rangeOf(node).from;
      const caret = { anchor: pos, head: pos };
      const picked = executeCommand(view, { type: 'drag', pressed: node.id }, caret);
      if (!(picked instanceof OurusSuccess) || !picked.dropMap) continue;
      const nodes = picked.dropMap.nodes;
      const root = doc.node(nodes[0]!)!;
      const back: InsertionPoint = { parent: root.parent!.kind === 'root' ? 'root' : root.parent!.id, after: root.prev?.id ?? null };
      for (const point of picked.dropMap.seams.flatMap((seam) => seam.points)) {
        if (point.current) continue;
        found.runs++;
        const at: Played = { view, selection: caret, clipboard: {} };
        const where = `${s.name} ${draw(at)} → depth ${point.depth} under ${point.parent === 'root' ? 'the root' : `line ${doc.node(point.parent)!.startLine + 1}`}`;
        let mid: Played;
        let end: Played;
        try {
          const dropped = executeCommand(view, point.drop, caret);
          if (dropped instanceof OurusRejected && dropped.reason === 'write-failed') {
            // (at a start the drop pass knows, reported, not failed: its list says why)
            if (s.name in KNOWN) known.push(`moveSubtree failed to write, known (drops.ts): ${where}`);
            else fail(index, `moveSubtree failed to write: ${where}`);
            continue;
          }
          if (!(dropped instanceof OurusSuccess) || !dropped.changes.length) continue;
          mid = { view: dropped.view, selection: dropped.selection, clipboard: {}, last: dropped };
          const returned = executeCommand(mid.view, { type: 'moveSubtree', nodes, to: back }, mid.selection);
          end = { view: returned instanceof OurusSuccess ? returned.view : mid.view, selection: returned instanceof OurusSuccess ? returned.selection : mid.selection, clipboard: {}, last: returned };
        } catch (e) {
          fail(index, `moveSubtree threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
          continue;
        }
        const last = end.last!;
        if (last instanceof OurusRejected && last.reason === 'write-failed') {
          fail(index, `moveSubtree back failed to write: ${where} → ${draw(mid)}`);
          continue;
        }
        const shape = last instanceof OurusSuccess ? classify(doc, end, pos) : last instanceof OurusRejected ? `rejected ${last.reason}` : statusOf(last);
        if (shape === 'same') continue;
        const key = `moveSubtree, back: ${shape}`;
        if (dumping) found.dumped.push(`${key}\t${where}\t${draw(mid)}\t${draw(end)}`);
        const group = groups.get(key) ?? { runs: 0, buffers: new Set<string>(), examples: [] };
        group.runs++;
        if (!group.buffers.has(s.text) && group.examples.length < examples) group.examples.push({ at: index, buffer: s.text, text: `${where}\n         → ${draw(mid)}\n         → ${draw(end)}` });
        group.buffers.add(s.text);
        groups.set(key, group);
      }
    }
  }
  for (const [key, g] of groups) found.groups.set(key, { runs: g.runs, buffers: [...g.buffers], examples: g.examples });
  return found;
}

// a worker plays its share and hands back what it found; the main thread deals the buffers out, one in
// so many to each, and merges what they found in the buffers' order
if (!isMainThread) {
  starts.push(...workerData.starts);
  parentPort!.postMessage(playShare(workerData.share));
  process.exit(0);
}
const workers = Math.max(1, Math.min(Number(process.env.INVERSE_WORKERS ?? availableParallelism()), starts.length));
const shares = Array.from({ length: workers }, (_, w) => starts.map((_, i) => i).filter((i) => i % workers === w));
const parts: Found[] =
  workers === 1
    ? [playShare(shares[0]!)]
    : await Promise.all(
        shares.map(
          (share) =>
            new Promise<Found>((done, failed) => {
              const worker = new Worker(new URL(import.meta.url), { workerData: { starts, share } });
              worker.once('message', done);
              worker.once('error', failed);
            }),
        ),
      );
const runs = parts.reduce((n, p) => n + p.runs, 0);
const failures = parts.flatMap((p) => p.failures).sort((x, y) => x.at - y.at).map((f) => f.text);
const groups = new Map<string, { runs: number; buffers: Set<string>; examples: string[] }>();
for (const [key] of new Map(parts.flatMap((p) => [...p.groups]))) {
  const of = parts.map((p) => p.groups.get(key)).filter((g) => g !== undefined);
  // the first examples of distinct buffers, in the buffers' order, as one thread would note them
  const shown = new Set<string>();
  const picked: string[] = [];
  for (const e of of.flatMap((g) => g.examples).sort((x, y) => x.at - y.at)) {
    if (shown.has(e.buffer) || picked.length >= examples) continue;
    shown.add(e.buffer);
    picked.push(e.text);
  }
  groups.set(key, { runs: of.reduce((n, g) => n + g.runs, 0), buffers: new Set(of.flatMap((g) => g.buffers)), examples: picked });
}

console.log(`${runs} runs on ${starts.length} buffers`);
const baselineFile = join(here, 'test/inverse.baseline.json');
const baseline: { corpus: string; groups: Record<string, number> } | null = (() => {
  try {
    return JSON.parse(readFileSync(baselineFile, 'utf8'));
  } catch {
    return null;
  }
})();
const sameCorpus = baseline?.corpus === corpus;
const rose: string[] = [];
for (const [key, group] of [...groups].sort((x, y) => y[1].buffers.size - x[1].buffers.size || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0))) {
  const before = baseline ? (baseline.groups[key] ?? 0) : null;
  if (sameCorpus && before !== null && group.runs > before) rose.push(key);
  console.log(`${String(group.runs).padStart(6)} runs, ${String(group.buffers.size).padStart(4)} buffers  ${key}${before === null ? '' : ` (baseline ${before})`}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
for (const failure of failures) console.log(`FAIL ${failure}`);
for (const line of parts.flatMap((p) => p.known)) console.log(`known ${line}`);
if (dumping) writeFileSync(process.env.INVERSE_DUMP!, parts.flatMap((p) => p.dumped).sort().join('\n') + '\n');
if (rose.length) console.log(`\nmore round trips than the baseline don't come back: ${rose.join('; ')}`);
if (baseline && !sameCorpus) console.log('\nthe corpus changed since the baseline (the spec): its counts are not held to it; INVERSE_UPDATE=1 records them');
if (process.env.INVERSE_UPDATE === '1') {
  writeFileSync(baselineFile, JSON.stringify({ corpus, groups: Object.fromEntries([...groups].map(([key, g]) => [key, g.runs]).sort()) }, null, 2) + '\n');
  console.log(`baseline updated: ${baselineFile}`);
}
process.exitCode = failures.length === 0 && rose.length === 0 ? 0 : 1;
