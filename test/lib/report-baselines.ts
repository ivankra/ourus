// What the reports over the generated notes (`conserve.ts`, `inverse.ts`, `sessions.ts`, `sweep.ts`)
// share: their groups of failures, and each group's count held to a baseline on the same corpus.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import type { GeneratedStart } from './generated-notes.ts';

/** A baseline file: each group's count, on the corpus they were counted on. */
export interface ReportBaseline {
  readonly corpus: string;
  readonly groups: Record<string, number>;
}

/** A kind of failure: how many runs met it, and the first few examples. */
export interface FailureGroup {
  runs: number;
  readonly examples: string[];
}

/** A short hash saying which notes a report played. */
export function corpusHash(starts: readonly GeneratedStart[]): string {
  return createHash('sha256').update(JSON.stringify(starts.map((start) => [start.text, start.config]))).digest('hex').slice(0, 16);
}

/** One more run in the group `key`, keeping `example` while it has fewer than `limit`. */
export function noteFailure(groups: Map<string, FailureGroup>, key: string, example: string, limit: number): void {
  const group = groups.get(key) ?? { runs: 0, examples: [] };
  group.runs++;
  if (group.examples.length < limit) group.examples.push(example);
  groups.set(key, group);
}

/** The baseline in `file`, or null where there is none. */
export function readBaseline(file: string): ReportBaseline | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Records `groups`' counts on `corpus` as the baseline in `file`. */
export function writeBaseline(file: string, corpus: string, groups: ReadonlyMap<string, { readonly runs: number }>): void {
  const counts = [...groups].map(([key, group]) => [key, group.runs] as const).sort();
  writeFileSync(file, `${JSON.stringify({ corpus, groups: Object.fromEntries(counts) }, null, 2)}\n`);
}
