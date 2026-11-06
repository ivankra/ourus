#!/usr/bin/env node
// Every command at every caret of the generated notes (`lib/generated-notes.ts`), alone, and the same notes
// with an odd character put in (a no-break space, a BOM, a line or paragraph separator, a tab, an
// emoji, a lone surrogate). What a command does isn't judged, only what no command may do:
//
//   threw             always a failure
//   write-failed      the text written didn't read back as the draft: ourus's own bug, not a refusal
//   selection         the selection after is off the text
//   changes           the `changes` applied to the text don't give the text after
//   endings           line breaks of both kinds where the note had one
//   final newline     the note ended with one and the text after doesn't
//
// and one round trip of the clipboard: every node copied (the caret at its text) and pasted into an
// empty note must come back as the same blocks (`copy→paste`); and every node cut and pasted at the
// caret the cut leaves must give every letter back, and every code, math and table block its text
// (`cut→paste`): where the paste lands is the spec's (after the node the caret is on), so an order or a
// parent can change.
//
// Each group's count is held to a baseline (`sweep.baseline.json`) on the same corpus, so a new kind
// of failure, or more of one, fails the run; a throw always does.
// The checks are `lib/report-checks.ts`'s; an update keeps a few cases of each group untriaged
// (`bugs-untriaged.json`), which `bugs.ts` replays.
//
//   node test/sweep.ts                       # the report, against the baseline
//   SWEEP_UPDATE=1 node test/sweep.ts        # the same, then its counts as the new baseline, once read
//   SWEEP_EXAMPLES=8 node test/sweep.ts      # examples per group (default 2)
//   SWEEP_GENERATED=200 node test/sweep.ts   # notes in the corpus (default 60, and as many with an odd character)

import { join, resolve } from 'node:path';
import type { OurusCommand } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { allNodes, CASES_PER_GROUP, commandFailures, commandLabel, copyPasteFailures, corpusHash, cutPasteFailures, generatedStarts, nodeCaret, noteFailure, readBaseline, recordUntriaged, writeBaseline, type Found, type GeneratedStart, type UntriagedCase } from './lib/index.ts';

const here = resolve(import.meta.dirname, '..');
const examples = Number(process.env.SWEEP_EXAMPLES ?? 2);
const count = Number(process.env.SWEEP_GENERATED ?? 60);

const ODD = ['\u00a0', '\ufeff', '\u2028', '\u2029', '\u0085', '\t', '\u200b', '\u{1f600}', '\u0301', '\ud800', '\u3000', '\u202e'];
/** The notes, then the same shapes with one odd character each at a place in a line. */
function corpus(): GeneratedStart[] {
  const base = generatedStarts(count, 11);
  let state = 5;
  const below = (n: number): number => Math.floor(((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32) * n);
  const odd = generatedStarts(count, 23).map((s, k) => {
    const lines = s.text.split('\n');
    const at = below(lines.length - 1);
    const line = lines[at]!;
    const col = below(line.length + 1);
    lines[at] = line.slice(0, col) + ODD[k % ODD.length]! + line.slice(col);
    return { ...s, text: lines.join('\n'), name: `odd #${k} (${JSON.stringify(ODD[k % ODD.length])})` };
  });
  return [...base, ...odd];
}
const starts = corpus();
const hash = corpusHash(starts);

const COMMANDS: readonly OurusCommand[] = [
  { type: 'indent' },
  { type: 'outdent' },
  { type: 'moveSubtreeUp' },
  { type: 'moveSubtreeDown' },
  { type: 'enter' },
  { type: 'shiftEnter' },
  { type: 'deleteContentBackward' },
  { type: 'deleteContentForward' },
  { type: 'deleteSoftLineBackward' },
  { type: 'deleteSubtree' },
  { type: 'duplicateSubtree' },
  { type: 'cut' },
  { type: 'addBlockId' },
  { type: 'removeBlockId' },
  { type: 'insertText', text: 'x' },
  { type: 'insertText', text: '\n' },
  { type: 'insertText', text: '`' },
];

const groups = new Map<string, { runs: number; examples: string[] }>();
const fails: string[] = [];
const updating = process.env.SWEEP_UPDATE === '1';
const cases: UntriagedCase[] = [];
/** The failures `found` of a case, each in its group, an example kept with what it adds; the case kept untriaged on an update. */
const note = (found: readonly Found[], where: string, kept: (group: string) => UntriagedCase): void => {
  for (const f of found) {
    noteFailure(groups, f.kind, f.detail ? `${where}\n         ${f.detail}` : where, examples);
    if (updating && groups.get(f.kind)!.runs <= CASES_PER_GROUP) cases.push(kept(f.kind));
  }
};

let runs = 0;
for (const s of starts) {
  const doc = OurusDoc.parse(s.text, { config: s.config });
  const view = OurusView.of(doc);
  for (const command of COMMANDS) {
    const label = commandLabel(command);
    for (let pos = 0; pos <= s.text.length; pos++) {
      runs++;
      const where = `${s.name}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${pos}`;
      try {
        note(commandFailures(view, pos, command), where, (group) => ({ check: 'command', group, text: s.text, config: s.config, pos, command }));
      } catch (e) {
        fails.push(`${label} threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
  }
  // ---- copy → paste into an empty note: the blocks come back; cut → paste at the caret the cut leaves: the note comes back
  allNodes(doc).forEach((node, index) => {
    const pos = nodeCaret(doc, node);
    for (const check of ['copy→paste', 'cut→paste'] as const) {
      runs++;
      const where = `${s.name}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} ${check === 'copy→paste' ? 'copy' : 'cut'} @${pos} (${node.kind})`;
      try {
        note(check === 'copy→paste' ? copyPasteFailures(view, node) : cutPasteFailures(view, node), where, (group) => ({ check, group, text: s.text, config: s.config, node: index }));
      } catch (e) {
        fails.push(`${check} threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
  });
}

console.log(`${runs} runs on ${starts.length} notes`);
const baselineFile = join(here, 'test/sweep.baseline.json');
const baseline = readBaseline(baselineFile);
const sameCorpus = baseline?.corpus === hash;
const rose: string[] = [];
for (const [key, group] of [...groups].sort((x, y) => y[1].runs - x[1].runs || (x[0] < y[0] ? -1 : 1))) {
  const was = baseline ? (baseline.groups[key] ?? 0) : null;
  if (sameCorpus && was !== null && group.runs > was) rose.push(key);
  console.log(`${String(group.runs).padStart(6)} runs  ${key}${was === null ? '' : ` (baseline ${was})`}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
for (const failure of fails) console.log(`FAIL ${failure}`);
if (rose.length) console.log(`\nmore failures than the baseline: ${rose.join('; ')}`);
if (baseline && !sameCorpus) console.log('\nthe corpus changed since the baseline: its counts are not held to it; SWEEP_UPDATE=1 records them');
if (updating) {
  writeBaseline(baselineFile, hash, groups);
  console.log(`baseline updated: ${baselineFile}; ${recordUntriaged('sweep', cases)} cases kept untriaged (test/bugs-untriaged.json)`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
