#!/usr/bin/env node
// Two round trips over the generated notes (`lib/generated-notes.ts`), where nothing may be lost:
//
//   html    a note rendered to HTML (`MdTree.renderHtml`) and read back (`MdHtmlParser.parse`) must
//           render to the same HTML again: what a user copies out of one app and pastes into another
//   paste   each clipboard in `CLIPS` pasted at carets of every note (and over a selection) must
//           keep every letter of the note and of the clipboard: nothing dropped, nothing doubled.
//           (Letters only: digits renumber, markers and spaces move.) A write failure, an exception
//           or a selection off the text counts as a failure of its own kind
//
// A report of what fails, grouped by kind (and for paste, by clipboard); each group's count is held to
// a baseline (`conserve.baseline.json`) on the same corpus, so a new kind of loss, or more of one,
// fails the run. An exception always fails it. The checks are `lib/report-checks.ts`'s; an update
// keeps a few cases of each group untriaged (`bugs-untriaged.json`), which `bugs.ts` replays.
//
//   node test/conserve.ts                      # the report, against the baseline
//   CONSERVE_UPDATE=1 node test/conserve.ts    # the same, then its counts as the new baseline, once read
//   CONSERVE_EXAMPLES=8 node test/conserve.ts  # examples per group (default 2)
//   CONSERVE_GENERATED=300 node test/conserve.ts  # notes in the corpus (default 80)

import { join, resolve } from 'node:path';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { CASES_PER_GROUP, CLIPS, corpusHash, generatedStarts, htmlFailures, noteFailure, pasteFailures, readBaseline, recordUntriaged, writeBaseline, type Found, type UntriagedCase } from './lib/index.ts';

const here = resolve(import.meta.dirname, '..');
const examples = Number(process.env.CONSERVE_EXAMPLES ?? 2);
const starts = generatedStarts(Number(process.env.CONSERVE_GENERATED ?? 80), 7);
const corpus = corpusHash(starts);

const groups = new Map<string, { runs: number; examples: string[] }>();
const fails: string[] = [];
const updating = process.env.CONSERVE_UPDATE === '1';
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
  // ---- html
  runs++;
  try {
    note(htmlFailures(s.text, s.config), JSON.stringify(s.text), (group) => ({ check: 'html', group, text: s.text, config: s.config }));
  } catch (e) {
    fails.push(`html threw: ${JSON.stringify(s.text)}: ${(e as Error).message.split('\n')[0]}`);
  }
  // ---- paste
  const view = OurusView.of(OurusDoc.parse(s.text, { config: s.config }));
  const carets = new Set<number>([0, s.text.length]);
  for (let i = 0; i < s.text.length; i++) if (s.text[i] === '\n' || s.text[i - 1] === '\n' || i % 7 === 0) carets.add(i);
  for (const clip of Object.keys(CLIPS)) {
    for (const from of carets) {
      for (const over of [0, 5]) {
        const to = Math.min(s.text.length, from + over);
        runs++;
        const where = `${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${from}${over ? `-${to}` : ''}`;
        try {
          note(pasteFailures(view, clip, from, to), where, (group) => ({ check: 'paste', group, text: s.text, config: s.config, clip, from, to }));
        } catch (e) {
          fails.push(`paste ${clip} threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
        }
      }
    }
  }
}

console.log(`${runs} runs on ${starts.length} notes`);
const baselineFile = join(here, 'test/conserve.baseline.json');
const baseline = readBaseline(baselineFile);
const sameCorpus = baseline?.corpus === corpus;
const rose: string[] = [];
for (const [key, group] of [...groups].sort((x, y) => y[1].runs - x[1].runs || (x[0] < y[0] ? -1 : 1))) {
  const before = baseline ? (baseline.groups[key] ?? 0) : null;
  if (sameCorpus && before !== null && group.runs > before) rose.push(key);
  console.log(`${String(group.runs).padStart(6)} runs  ${key}${before === null ? '' : ` (baseline ${before})`}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
for (const failure of fails) console.log(`FAIL ${failure}`);
if (rose.length) console.log(`\nmore failures than the baseline: ${rose.join('; ')}`);
if (baseline && !sameCorpus) console.log('\nthe corpus changed since the baseline: its counts are not held to it; CONSERVE_UPDATE=1 records them');
if (updating) {
  writeBaseline(baselineFile, corpus, groups);
  console.log(`baseline updated: ${baselineFile}; ${recordUntriaged('conserve', cases)} cases kept untriaged (test/bugs-untriaged.json)`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
