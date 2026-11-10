#!/usr/bin/env node
// The sessions of `sessions.ts` at volume: many more of them, over notes drawn afresh for each round
// (`generatedStarts` with the round's seed), each played through the same check
// (`lib/report-checks.ts`). A failure in a group with fewer than `CASES_PER_GROUP` cases kept is
// shrunk and kept untriaged (`bugs-untriaged.json`), so what a long run finds outlives it; the sessions'
// cases that pass now go. Not part of `npm test`: run it when there is time, then `npm run bugs` to read
// what it kept, and triage.
//
// The rounds play on a pool of worker threads, one per core (`VOLUME_WORKERS`), and the shrinks after
// them, in batches; the main thread reads the results in the rounds' order, so a run reports and keeps
// what one thread would.
//
//   npm run test:volume                              # 100,000 sessions, from seed 1
//   VOLUME=20000 VOLUME_SEED=7 npm run test:volume   # fewer, from another seed (a round's notes and actions follow from it)
//   VOLUME_DRY=1 npm run test:volume                 # the report, keeping nothing

import { availableParallelism } from 'node:os';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { CASES_PER_GROUP, caseId, filedCases, generatedStarts, readUntriaged, recordUntriaged, REPORT_OF, sessionFailures, sessionWheel, shrinkSession, type UntriagedCase } from './lib/index.ts';

const total = Number(process.env.VOLUME ?? 100_000);
const seed = Number(process.env.VOLUME_SEED ?? 1);
const dry = process.env.VOLUME_DRY === '1';
/** Sessions a round: then its notes are drawn again, from the next seed. */
const ROUND = 2000;
const length = 20;

/** A session that failed, in the order its round played it: its first failure of each kind. */
interface Failed {
  readonly text: string;
  readonly config: Record<string, unknown>;
  readonly caret: number;
  readonly actions: readonly string[];
  readonly kind: string;
  readonly at: number;
}

type Job = { id: number; round: number } | { id: number; shrink: Failed };
type Done = { id: number; failed: Failed[] } | { id: number; small: string[] };

/** Round `round`'s sessions played, the failures they found. */
function playRound(round: number, wheel: readonly string[]): Failed[] {
  const roundSeed = seed + round;
  const starts = generatedStarts(400, 31 + roundSeed);
  let state = roundSeed >>> 0;
  const below = (n: number): number => Math.floor(((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32) * n);
  const out: Failed[] = [];
  for (let n = 0; n < ROUND && round * ROUND + n < total; n++) {
    const s = starts[below(starts.length)]!;
    const caret = below(s.text.length + 1);
    const actions = Array.from({ length }, () => wheel[below(wheel.length)]!);
    const kinds = new Set<string>();
    for (const f of sessionFailures(s.text, s.config, caret, actions)) {
      if (kinds.has(f.kind)) continue;
      kinds.add(f.kind);
      out.push({ text: s.text, config: s.config, caret, actions, kind: f.kind, at: f.at });
    }
  }
  return out;
}

if (!isMainThread) {
  const wheel = sessionWheel();
  parentPort!.on('message', (job: Job) => {
    if ('round' in job) parentPort!.postMessage({ id: job.id, failed: playRound(job.round, wheel) } satisfies Done);
    else {
      const f = job.shrink;
      parentPort!.postMessage({ id: job.id, small: shrinkSession(f.text, f.config, f.caret, f.actions.slice(0, f.at + 1), f.kind) } satisfies Done);
    }
  });
} else {
  await main();
}

async function main(): Promise<void> {
  const rounds = Math.ceil(total / ROUND);
  const size = Math.max(1, Math.min(Number(process.env.VOLUME_WORKERS ?? availableParallelism()), rounds));
  const workers = Array.from({ length: size }, () => new Worker(new URL(import.meta.url)));
  // (the jobs given out one at a time to the worker that's free: rounds take unlike times)
  const run = <T,>(jobs: readonly ((id: number) => Job)[], take: (done: Done) => T): Promise<T[]> =>
    new Promise((resolve, reject) => {
      const results: T[] = new Array(jobs.length);
      let next = 0;
      let left = jobs.length;
      if (!left) return resolve(results);
      const give = (w: Worker): void => {
        if (next < jobs.length) w.postMessage(jobs[next]!(next++));
      };
      for (const w of workers) {
        w.removeAllListeners('message');
        w.removeAllListeners('error');
        w.on('message', (done: Done) => {
          results[done.id] = take(done);
          if (--left === 0) resolve(results);
          else give(w);
        });
        w.on('error', reject);
        give(w);
      }
    });

  // how many cases each group keeps already: a run shrinks only what it would keep
  const kept = new Map<string, number>();
  for (const c of readUntriaged()) if (REPORT_OF[c.check] === 'sessions') kept.set(c.group, (kept.get(c.group) ?? 0) + 1);
  const known = new Set(kept.keys());
  const filed = filedCases();

  const started = Date.now();
  const played = await run(
    Array.from({ length: rounds }, (_, round) => (id: number): Job => ({ id, round })),
    (done) => ('failed' in done ? done.failed : []),
  );

  const groups = new Map<string, number>();
  const threw: string[] = [];
  // each group's failures, in the order one thread would have found them, to shrink
  const queued = new Map<string, Failed[]>();
  for (const f of played.flat()) {
    if (f.kind.includes(' threw')) {
      threw.push(`${f.kind}: ${JSON.stringify(f.text)} ${JSON.stringify(f.config)} @${f.caret} ${JSON.stringify(f.actions)}`);
      continue;
    }
    groups.set(f.kind, (groups.get(f.kind) ?? 0) + 1);
    if ((kept.get(f.kind) ?? 0) < CASES_PER_GROUP) queued.set(f.kind, [...(queued.get(f.kind) ?? []), f]);
  }

  const found: UntriagedCase[] = [];
  /** The bugs whose filed cases a group's failures were, by group. */
  const filedFound = new Map<string, string[]>();
  // the shrinks in batches: each group's next failures, as many as it still keeps (a filed one keeps
  // nothing, so a batch may not fill it), then read in order, as one thread would
  const at = new Map<string, number>();
  for (;;) {
    const batch: { group: string; f: Failed }[] = [];
    for (const [group, fs] of queued) {
      const need = CASES_PER_GROUP - (kept.get(group) ?? 0);
      const from = at.get(group) ?? 0;
      if (need <= 0 || from >= fs.length) continue;
      const take = fs.slice(from, from + need);
      at.set(group, from + take.length);
      for (const f of take) batch.push({ group, f });
    }
    if (!batch.length) break;
    const smalls = await run(
      batch.map(({ f }) => (id: number): Job => ({ id, shrink: f })),
      (done) => ('small' in done ? done.small : []),
    );
    batch.forEach(({ group, f }, k) => {
      if ((kept.get(group) ?? 0) >= CASES_PER_GROUP) return;
      const c: UntriagedCase = { check: 'session', group, text: f.text, config: f.config, caret: f.caret, actions: smalls[k]! };
      // (a case filed as a bug is that bug's: not kept again)
      const bug = filed.get(caseId(c));
      if (bug) {
        filedFound.set(group, [...new Set([...(filedFound.get(group) ?? []), bug])]);
        return;
      }
      kept.set(group, (kept.get(group) ?? 0) + 1);
      found.push(c);
    });
  }
  await Promise.all(workers.map((w) => w.terminate()));

  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(`${total} sessions of ${length} actions, seeds ${seed} to ${seed + rounds - 1}, in ${seconds} s on ${size} threads`);
  for (const [key, runs] of [...groups].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))) {
    const bugs = filedFound.get(key);
    console.log(`${String(runs).padStart(7)} sessions  ${key}${known.has(key) ? '' : '  (new group)'}${bugs ? `  (cases filed: ${bugs.join(' ')})` : ''}`);
  }
  for (const t of threw) console.log(`FAIL ${t}`);
  if (!dry) console.log(`${recordUntriaged('sessions', found)} sessions cases kept untriaged (test/bugs-untriaged.json), ${found.length} found this run`);
  process.exitCode = threw.length ? 1 : 0;
}
