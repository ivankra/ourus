// The failing cases the reports over generated notes found and nobody has filed yet
// (`test/bugs-untriaged.json`): each a case to replay, through the report's own check
// (`report-checks.ts`), and the group it failed in. A report adds the cases of its groups on its
// `*_UPDATE=1` run, a few each; `bugs.ts` replays them all. Triage moves a case into `bugs.ts`, under
// the bug it is, a new one or one it joins.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OurusCommand } from '../../src/commands/index.ts';
import { OurusDoc } from '../../src/doc/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { allNodes } from './drawn-states.ts';
import { commandFailures, copyPasteFailures, cutPasteFailures, htmlFailures, pasteFailures, sessionFailures } from './report-checks.ts';

/** A case kept untriaged: the note, its config, what was played on it, and the group it failed in. */
export type UntriagedCase = { readonly group: string; readonly text: string; readonly config: Record<string, unknown> } & (
  | { readonly check: 'session'; readonly caret: number; readonly actions: readonly string[] }
  | { readonly check: 'command'; readonly pos: number; readonly command: OurusCommand }
  /** `node`: the node's index in document order (`allNodes`). */
  | { readonly check: 'copy→paste' | 'cut→paste'; readonly node: number }
  | { readonly check: 'html' }
  | { readonly check: 'paste'; readonly clip: string; readonly from: number; readonly to: number }
);

/** The report a check is of: the one that records its cases. */
export const REPORT_OF: Readonly<Record<UntriagedCase['check'], string>> = {
  session: 'sessions',
  command: 'sweep',
  'copy→paste': 'sweep',
  'cut→paste': 'sweep',
  html: 'conserve',
  paste: 'conserve',
};

/** How many cases a group keeps: enough to see it holds more than one mechanism, not a corpus. */
export const CASES_PER_GROUP = 10;

const FILE = join(import.meta.dirname, '..', 'bugs-untriaged.json');
const BUGS = join(import.meta.dirname, '..', 'bugs.ts');

/** `value` as JSON with every object's keys sorted: the same case, the same string. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(value);
}

/** A case's id: 12 hex digits of a hash of what it replays (its group left out: a group's name can change). */
export function caseId(c: UntriagedCase): string {
  const { group: _, ...replayed } = c;
  return createHash('sha256').update(canonical(replayed)).digest('hex').slice(0, 12);
}

/**
 * The kept cases triaged: each id `bugs.ts` names in a `// kept: <id> <id> …` comment, in a case of the
 * bug that stands for it, by that bug's id; or in a `// not a bug: <id> …` one, as `not a bug`. (Read
 * as text: `bugs.ts` runs when imported.)
 */
export function filedCases(text = readFileSync(BUGS, 'utf8')): Map<string, string> {
  const filed = new Map<string, string>();
  let bug = '';
  for (const line of text.split('\n')) {
    const opened = /^openBug\('(B\d+)'/.exec(line);
    if (opened) bug = opened[1]!;
    const kept = /^\s*\/\/ kept: (.*)$/.exec(line);
    if (kept) for (const id of kept[1]!.match(/\b[0-9a-f]{12}\b/g) ?? []) filed.set(id, bug);
    const none = /^\s*\/\/ not a bug: (.*)$/.exec(line);
    if (none) for (const id of none[1]!.match(/\b[0-9a-f]{12}\b/g) ?? []) filed.set(id, 'not a bug');
  }
  return filed;
}

/** The groups `c` fails in now, through its report's check; a throw from `src/` propagates. */
export function untriagedFailures(c: UntriagedCase): string[] {
  const view = (): OurusView => OurusView.of(OurusDoc.parse(c.text, { config: c.config }));
  switch (c.check) {
    case 'session':
      return sessionFailures(c.text, c.config, c.caret, c.actions).map((f) => f.kind);
    case 'command':
      return commandFailures(view(), c.pos, c.command).map((f) => f.kind);
    case 'copy→paste':
    case 'cut→paste': {
      const v = view();
      const node = allNodes(v.doc)[c.node];
      if (!node) return [`no node ${c.node}`];
      return (c.check === 'copy→paste' ? copyPasteFailures(v, node) : cutPasteFailures(v, node)).map((f) => f.kind);
    }
    case 'html':
      return htmlFailures(c.text, c.config).map((f) => f.kind);
    case 'paste':
      return pasteFailures(view(), c.clip, c.from, c.to).map((f) => f.kind);
  }
}

/** The cases kept, in the file's order. */
export function readUntriaged(): UntriagedCase[] {
  let file: Record<string, Record<string, Record<string, unknown>[]>>;
  try {
    file = JSON.parse(readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
  return Object.values(file).flatMap((groups) => Object.entries(groups).flatMap(([group, cases]) => cases.map(({ id: _, ...c }: Record<string, unknown>) => ({ ...c, group }) as UntriagedCase)));
}

/**
 * Writes `cases` by report, then group, then the group's cases, one a line (a diff shows each come and
 * go), each in order, its id first: `{ "sweep": { "cut→paste: …": [ { "id": "…", "check": "cut→paste", … }, … ] } }`.
 */
export function writeUntriaged(cases: readonly UntriagedCase[]): void {
  const byReport = new Map<string, Map<string, string[]>>();
  for (const c of cases) {
    const { group, ...replayed } = c;
    const report = REPORT_OF[c.check];
    const groups = byReport.get(report) ?? new Map<string, string[]>();
    groups.set(group, [...(groups.get(group) ?? []), JSON.stringify({ id: caseId(c), ...replayed })]);
    byReport.set(report, groups);
  }
  const sorted = <T>(m: Map<string, T>): [string, T][] => [...m].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const reports = sorted(byReport).map(([report, groups]) => {
    const inner = sorted(groups).map(([group, lines]) => `    ${JSON.stringify(group)}: [\n${[...lines].sort().map((l) => `      ${l}`).join(',\n')}\n    ]`);
    return `  ${JSON.stringify(report)}: {\n${inner.join(',\n')}\n  }`;
  });
  writeFileSync(FILE, reports.length ? `{\n${reports.join(',\n')}\n}\n` : '{}\n');
}

/**
 * A report's `*_UPDATE=1`: its cases are the ones it kept that fail in their group still, then `found`
 * (its run's, each group's first few) up to `CASES_PER_GROUP` a group; a case of its that passes now
 * goes, and so does one filed (`filedCases`). Other reports' cases stay as they are.
 */
export function recordUntriaged(report: string, found: readonly UntriagedCase[]): number {
  const all = readUntriaged();
  const filed = filedCases();
  const others = all.filter((c) => REPORT_OF[c.check] !== report);
  const kept = all.filter((c) => REPORT_OF[c.check] === report && !filed.has(caseId(c)) && untriagedFailures(c).includes(c.group));
  const seen = new Set(kept.map((c) => JSON.stringify(c)));
  const per = new Map<string, number>();
  for (const c of kept) per.set(c.group, (per.get(c.group) ?? 0) + 1);
  const mine = [...kept];
  for (const c of found) {
    const key = JSON.stringify(c);
    if (seen.has(key) || (per.get(c.group) ?? 0) >= CASES_PER_GROUP || filed.has(caseId(c))) continue;
    seen.add(key);
    per.set(c.group, (per.get(c.group) ?? 0) + 1);
    mine.push(c);
  }
  writeUntriaged([...others, ...mine]);
  return mine.length;
}
