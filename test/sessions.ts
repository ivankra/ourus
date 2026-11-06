#!/usr/bin/env node
// Random sessions: the generated notes (`lib/generated-notes.ts`) edited by 20 random actions a user takes
// (typing, Enter, Backspace, indent, move, cut, copy, paste, duplicate, delete, select a node, fold,
// zoom, undo, redo, a motion), through the spec's player, so the host's defaults, settling and
// history are as the spec has them. After every step:
//
//   threw             always a failure
//   write-failed      a command's text didn't read back as its draft: ourus's own bug, not a refusal
//   view              `assertViewHolds` (spec-run.ts) throws after an applied command: the selection in a
//                     hidden line, a fold with nothing to hide, a zoom a command left
//   selection         the selection is off the text
//   marks             a placeholder or an auto mark lost on a line the command didn't change
//
// and at the end, undoing every step that changed the text must give the note back (`undo all`).
//
// A failing session is shrunk to the actions that still fail the same way. Each group's count is held
// to a baseline (`sessions.baseline.json`) on the same corpus, so a new kind of failure, or more of
// one, fails the run; a throw always does. The checks are `lib/report-checks.ts`'s; an update keeps a
// few shrunk cases of each group untriaged (`bugs-untriaged.json`), which `bugs.ts` replays.
//
//   node test/sessions.ts                         # the report, against the baseline
//   SESSIONS_UPDATE=1 node test/sessions.ts       # the same, then its counts as the new baseline, once read
//   SESSIONS_EXAMPLES=6 node test/sessions.ts     # examples per group (default 2)
//   SESSIONS=2000 SESSIONS_SEED=9 node test/sessions.ts   # more sessions (default 2000) from another seed

import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { CASES_PER_GROUP, generatedStarts, readBaseline, recordUntriaged, sessionFailures, sessionWheel, shrinkSession, writeBaseline, type SessionFound, type UntriagedCase } from './lib/index.ts';

const here = resolve(import.meta.dirname, '..');
const examples = Number(process.env.SESSIONS_EXAMPLES ?? 2);
const total = Number(process.env.SESSIONS ?? 2000);
const seed = Number(process.env.SESSIONS_SEED ?? 1);
const length = 20;
const starts = generatedStarts(Math.max(40, Math.ceil(total / 5)), 31);
const hash = createHash('sha256').update(JSON.stringify([starts.map((s) => [s.text, s.config]), total, seed, length])).digest('hex').slice(0, 16);

const wheel = sessionWheel();
let state = seed >>> 0;
const below = (n: number): number => Math.floor(((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32) * n);

/** Plays `actions` from start `startIndex`; the kinds of failure it finds, each with the step it shows at. */
const run = (startIndex: number, caret: number, actions: readonly string[]): SessionFound[] => sessionFailures(starts[startIndex]!.text, starts[startIndex]!.config, caret, actions);

const groups = new Map<string, { runs: number; examples: string[] }>();
const fails: string[] = [];
const updating = process.env.SESSIONS_UPDATE === '1';
const cases: UntriagedCase[] = [];
for (let n = 0; n < total; n++) {
  const startIndex = below(starts.length);
  const s = starts[startIndex]!;
  const caret = below(s.text.length + 1);
  const actions = Array.from({ length }, () => wheel[below(wheel.length)]!);
  const kinds = new Set<string>();
  for (const f of run(startIndex, caret, actions)) {
    if (kinds.has(f.kind)) continue;
    kinds.add(f.kind);
    if (f.kind.includes(' threw')) {
      fails.push(`${f.kind}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${caret} ${JSON.stringify(actions)}`);
      continue;
    }
    const group = groups.get(f.kind) ?? { runs: 0, examples: [] };
    group.runs++;
    // (shrunk for the examples shown, and on an update for the cases kept: shrinking is slow)
    if (group.examples.length < examples || (updating && group.runs <= CASES_PER_GROUP)) {
      const small = shrinkSession(s.text, s.config, caret, actions.slice(0, f.at + 1), f.kind);
      if (group.examples.length < examples) group.examples.push(`${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${caret}\n         ${small.join(' ')}`);
      if (updating) cases.push({ check: 'session', group: f.kind, text: s.text, config: s.config, caret, actions: small });
    }
    groups.set(f.kind, group);
  }
}

console.log(`${total} sessions of ${length} actions on ${starts.length} notes`);
const baselineFile = join(here, 'test/sessions.baseline.json');
const baseline = readBaseline(baselineFile);
const sameCorpus = baseline?.corpus === hash;
const rose: string[] = [];
for (const [key, group] of [...groups].sort((x, y) => y[1].runs - x[1].runs || (x[0] < y[0] ? -1 : 1))) {
  const was = baseline ? (baseline.groups[key] ?? 0) : null;
  if (sameCorpus && was !== null && group.runs > was) rose.push(key);
  if (sameCorpus && was === null && baseline) rose.push(key);
  console.log(`${String(group.runs).padStart(6)} sessions  ${key}${was === null ? '' : ` (baseline ${was})`}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
for (const failure of fails) console.log(`FAIL ${failure}`);
if (rose.length) console.log(`\nmore failures than the baseline: ${rose.join('; ')}`);
if (baseline && !sameCorpus) console.log('\nthe sessions changed since the baseline: its counts are not held to it; SESSIONS_UPDATE=1 records them');
if (updating) {
  writeBaseline(baselineFile, hash, groups);
  console.log(`baseline updated: ${baselineFile}; ${recordUntriaged('sessions', cases)} cases kept untriaged (test/bugs-untriaged.json)`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
