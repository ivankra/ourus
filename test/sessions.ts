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
//
// and at the end, undoing every step that changed the text must give the note back (`undo all`).
//
// A failing session is shrunk to the actions that still fail the same way. Each group's count is held
// to a baseline (`sessions.baseline.json`) on the same corpus, so a new kind of failure, or more of
// one, fails the run; a throw always does.
//
//   node test/sessions.ts                         # the report, against the baseline
//   SESSIONS_UPDATE=1 node test/sessions.ts       # the same, then its counts as the new baseline, once read
//   SESSIONS_EXAMPLES=6 node test/sessions.ts     # examples per group (default 2)
//   SESSIONS=2000 SESSIONS_SEED=9 node test/sessions.ts   # more sessions (default 2000) from another seed

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { generatedStarts, playActions, type PlayedState, assertViewHolds, readBaseline, writeBaseline } from './lib/index.ts';

const here = resolve(import.meta.dirname, '..');
const examples = Number(process.env.SESSIONS_EXAMPLES ?? 2);
const total = Number(process.env.SESSIONS ?? 2000);
const seed = Number(process.env.SESSIONS_SEED ?? 1);
const length = 20;
const starts = generatedStarts(Math.max(40, Math.ceil(total / 5)), 31);
const hash = createHash('sha256').update(JSON.stringify([starts.map((s) => [s.text, s.config]), total, seed, length])).digest('hex').slice(0, 16);

// the actions, as often as a user takes them
const ACTIONS: readonly (readonly [string, number])[] = [
  ['"x"', 6], ['" "', 3], ['"- "', 1], ['"# "', 1], ['"`"', 1],
  ['enter', 8], ['shiftEnter', 2], ['deleteContentBackward', 6], ['deleteContentForward', 2], ['deleteSoftLineBackward', 1],
  ['indent', 4], ['outdent', 4], ['moveSubtreeUp', 3], ['moveSubtreeDown', 3],
  ['cut', 2], ['copy', 1], ['paste', 4], ['pastePlain', 1], ['duplicateSubtree', 2], ['deleteSubtree', 2],
  ['selectNode', 2], ['expandSelection', 1], ['fold', 1], ['unfold', 1], ['toggleFold', 1], ['zoomIn', 1], ['zoomOut', 1],
  ['undo', 3], ['redo', 1],
  ['cursorLineUp', 5], ['cursorLineDown', 6], ['cursorCharLeft', 2], ['cursorCharRight', 2], ['cursorLineBoundaryBackward', 2], ['cursorLineBoundaryForward', 2],
  ['selectCharRight', 1], ['selectLineDown', 1],
];
const wheel = ACTIONS.flatMap(([a, w]) => Array<string>(w).fill(a));
let state = seed >>> 0;
const below = (n: number): number => Math.floor(((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32) * n);

const motion = (a: string): boolean => /^(cursor|select)(?!Node)/.test(a) && a !== 'selectNode';
/** Plays `actions` from `start`; the kinds of failure it finds, each with the step it shows at. */
function run(startIndex: number, caret: number, actions: readonly string[]): { kind: string; at: number }[] {
  const s = starts[startIndex]!;
  const found: { kind: string; at: number }[] = [];
  const doc = OurusDoc.parse(s.text, { config: s.config });
  let played: PlayedState = { view: OurusView.of(doc, { selection: caret }), clipboard: {} };
  for (let k = 0; k < actions.length; k++) {
    const action = actions[k]!;
    const prior = played.view;
    const hidden = JSON.stringify(prior.visibleSelection(played.view.selection)) !== JSON.stringify(played.view.selection);
    try {
      played = playActions(played, [action]);
    } catch (e) {
      found.push({ kind: `${action} threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`, at: k });
      return found;
    }
    const last = played.last;
    if (last instanceof OurusRejected && last.reason === 'write-failed') {
      found.push({ kind: `${action}: write-failed`, at: k });
      continue;
    }
    const text = played.view.doc.text;
    const { anchor, head } = played.view.selection;
    if (anchor < 0 || head < 0 || anchor > text.length || head > text.length) found.push({ kind: `${action}: selection off the text`, at: k });
    // (what only the host does, a motion and a history step, can leave the caret in a hidden line: not checked, nor a command that starts from one)
    if (!hidden && last instanceof OurusSuccess && !motion(action) && action !== 'undo' && action !== 'redo') {
      try {
        assertViewHolds(prior, played, `step ${k + 1} ${action}`);
      } catch (e) {
        found.push({ kind: `${action}: view invariant (${(e as Error).message.split('\n')[0]!.replace(/^step \d+ \S+: /, '').slice(0, 60)})`, at: k });
      }
    }
  }
  // undo everything: the note comes back
  let back = played;
  try {
    for (let n = 0; n < actions.length + 5 && (back.undone?.length ?? 0) > 0; n++) back = playActions(back, ['undo']);
    // (an undo that leaves steps behind is a failure of its own, not a reason to skip the comparison)
    if ((back.undone?.length ?? 0) > 0) found.push({ kind: 'undo all: history not exhausted', at: actions.length - 1 });
    else if (back.view.doc.text.replace(/[ \t]+$/gm, '') !== s.text.replace(/[ \t]+$/gm, '')) found.push({ kind: 'undo all: not the note back', at: actions.length - 1 });
  } catch (e) {
    found.push({ kind: `undo all threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`, at: actions.length - 1 });
  }
  return found;
}

/** The fewest actions (dropping one at a time) that still show `kind`. */
function shrink(startIndex: number, caret: number, actions: readonly string[], kind: string): string[] {
  let cur = [...actions];
  for (let changed = true; changed; ) {
    changed = false;
    for (let k = 0; k < cur.length; k++) {
      const less = [...cur.slice(0, k), ...cur.slice(k + 1)];
      if (run(startIndex, caret, less).some((f) => f.kind === kind)) {
        cur = less;
        changed = true;
        break;
      }
    }
  }
  return cur;
}

const groups = new Map<string, { runs: number; examples: string[] }>();
const fails: string[] = [];
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
    if (group.examples.length < examples) {
      const small = shrink(startIndex, caret, actions.slice(0, f.at + 1), f.kind);
      group.examples.push(`${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${caret}\n         ${small.join(' ')}`);
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
if (process.env.SESSIONS_UPDATE === '1') {
  writeBaseline(baselineFile, hash, groups);
  console.log(`baseline updated: ${baselineFile}`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
