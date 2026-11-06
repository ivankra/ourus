#!/usr/bin/env node
// The sessions of `sessions.ts` at volume: many more of them, over notes drawn afresh for each round
// (`generatedStarts` with the round's seed), each played through the same check
// (`lib/report-checks.ts`). A failure in a group with fewer than `CASES_PER_GROUP` cases kept is
// shrunk and kept untriaged (`bugs-untriaged.json`), so what a long run finds outlives it; the sessions'
// cases that pass now go. Not part of `npm test`: run it when there is time, then `npm run bugs` to read
// what it kept, and triage.
//
//   npm run test:volume                              # 100,000 sessions, from seed 1
//   VOLUME=20000 VOLUME_SEED=7 npm run test:volume   # fewer, from another seed (a round's notes and actions follow from it)
//   VOLUME_DRY=1 npm run test:volume                 # the report, keeping nothing

import { CASES_PER_GROUP, caseId, filedCases, generatedStarts, readUntriaged, recordUntriaged, REPORT_OF, sessionFailures, sessionWheel, shrinkSession, type UntriagedCase } from './lib/index.ts';

const total = Number(process.env.VOLUME ?? 100_000);
const seed = Number(process.env.VOLUME_SEED ?? 1);
const dry = process.env.VOLUME_DRY === '1';
/** Sessions a round: then its notes are drawn again, from the next seed. */
const ROUND = 2000;
const length = 20;
const wheel = sessionWheel();

// how many cases each group keeps already: a run shrinks only what it would keep
const kept = new Map<string, number>();
for (const c of readUntriaged()) if (REPORT_OF[c.check] === 'sessions') kept.set(c.group, (kept.get(c.group) ?? 0) + 1);
const known = new Set(kept.keys());
const filed = filedCases();

const groups = new Map<string, number>();
const found: UntriagedCase[] = [];
/** The bugs whose filed cases a group's failures were, by group. */
const filedFound = new Map<string, string[]>();
const threw: string[] = [];
const started = Date.now();
for (let round = 0; round * ROUND < total; round++) {
  const roundSeed = seed + round;
  const starts = generatedStarts(400, 31 + roundSeed);
  let state = roundSeed >>> 0;
  const below = (n: number): number => Math.floor(((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32) * n);
  for (let n = 0; n < ROUND && round * ROUND + n < total; n++) {
    const s = starts[below(starts.length)]!;
    const caret = below(s.text.length + 1);
    const actions = Array.from({ length }, () => wheel[below(wheel.length)]!);
    const kinds = new Set<string>();
    for (const f of sessionFailures(s.text, s.config, caret, actions)) {
      if (kinds.has(f.kind)) continue;
      kinds.add(f.kind);
      if (f.kind.includes(' threw')) {
        threw.push(`${f.kind}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${caret} ${JSON.stringify(actions)}`);
        continue;
      }
      groups.set(f.kind, (groups.get(f.kind) ?? 0) + 1);
      if ((kept.get(f.kind) ?? 0) >= CASES_PER_GROUP) continue;
      const small = shrinkSession(s.text, s.config, caret, actions.slice(0, f.at + 1), f.kind);
      const c: UntriagedCase = { check: 'session', group: f.kind, text: s.text, config: s.config, caret, actions: small };
      // (a case filed as a bug is that bug's: not kept again)
      const bug = filed.get(caseId(c));
      if (bug) {
        filedFound.set(f.kind, [...new Set([...(filedFound.get(f.kind) ?? []), bug])]);
        continue;
      }
      kept.set(f.kind, (kept.get(f.kind) ?? 0) + 1);
      found.push(c);
    }
  }
}

const seconds = Math.round((Date.now() - started) / 1000);
console.log(`${total} sessions of ${length} actions, seeds ${seed} to ${seed + Math.ceil(total / ROUND) - 1}, in ${seconds} s`);
for (const [key, runs] of [...groups].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))) {
  const bugs = filedFound.get(key);
  console.log(`${String(runs).padStart(7)} sessions  ${key}${known.has(key) ? '' : '  (new group)'}${bugs ? `  (cases filed: ${bugs.join(' ')})` : ''}`);
}
for (const t of threw) console.log(`FAIL ${t}`);
if (!dry) console.log(`${recordUntriaged('sessions', found)} sessions cases kept untriaged (test/bugs-untriaged.json), ${found.length} found this run`);
process.exitCode = threw.length ? 1 : 0;
