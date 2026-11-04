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
// fails the run. An exception always fails it.
//
//   node test/conserve.ts                      # the report, against the baseline
//   CONSERVE_UPDATE=1 node test/conserve.ts    # the same, then its counts as the new baseline, once read
//   CONSERVE_EXAMPLES=8 node test/conserve.ts  # examples per group (default 2)
//   CONSERVE_GENERATED=300 node test/conserve.ts  # notes in the corpus (default 80)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { MdFlavor, MdHtmlParser, MdTree } from '../src/index.ts';
import { executeCommand, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { generatedStarts, type Clipboard, readBaseline, writeBaseline, corpusHash, noteFailure } from './lib/index.ts';

const here = resolve(import.meta.dirname, '..');
const examples = Number(process.env.CONSERVE_EXAMPLES ?? 2);
const starts = generatedStarts(Number(process.env.CONSERVE_GENERATED ?? 80), 7);
const corpus = corpusHash(starts);

const CLIPS: Readonly<Record<string, Clipboard>> = {
  word: { 'text/plain': 'word' },
  twolines: { 'text/plain': 'line one\nline two' },
  paragraphs: { 'text/plain': 'first para\n\nsecond para' },
  trailing: { 'text/plain': 'solo\n' },
  list: { 'text/plain': '- list one\n- list two' },
  nested: { 'text/plain': '- nest one\n  - nest two\n    - nest three\n- nest four' },
  ordered: { 'text/plain': '1. ord one\n2. ord two' },
  task: { 'text/plain': '- [ ] task one\n- [x] task two' },
  heading: { 'text/plain': '# head one\ntext under' },
  code: { 'text/plain': '```js\nlet code;\n```' },
  table: { 'text/plain': '| aa | bb |\n|---|---|\n| cc | dd |' },
  quote: { 'text/plain': '> quote one\n> quote two' },
  callout: { 'text/plain': '> [!note] call\n> body' },
  indented: { 'text/plain': '    indent one\n    indent two' },
  htmlList: { 'text/html': '<ul><li>hl one</li><li>hl two<ul><li>hl three</li></ul></li></ul>', 'text/plain': 'hl one\nhl two\nhl three' },
  htmlPara: { 'text/html': '<p>hp one</p><p>hp two</p>', 'text/plain': 'hp one\n\nhp two' },
  markdown: { 'text/markdown': '- md one\n  - md two', 'text/plain': '- md one\n  - md two' },
};

/** Failures by kind: how many, and the first few as examples. */
const groups = new Map<string, { runs: number; examples: string[] }>();
const fails: string[] = [];
const note = (key: string, example: string): void => noteFailure(groups, key, example, examples);
const letters = (s: string): string => [...s.replace(/[^\p{L}]/gu, '')].sort().join('');
/** The HTML with the differences that don't matter taken out; the text of a `<pre>` is kept as it is, to the space. */
const norm = (h: string): string =>
  h
    .split(/(<pre[\s\S]*?<\/pre>)/)
    .map((part, k) =>
      k % 2
        ? part
        : part
            .replace(/<!-- ourus -->/, '')
            .replace(/ title="[^"]*"/g, '')
            .replace(/<br \/>/g, ' ')
            .replace(/<\/?p>/g, '')
            .replace(/<section class="footnotes".*$/s, '')
            .replace(/<sup class="footnote-ref">.*?<\/sup>/g, '')
            .replace(/\s+/g, ' ')
            .replace(/> </g, '><'),
    )
    .join('')
    .trim();
const mdFlavor = (flavor: unknown): MdFlavor => (flavor === 'obsidian' ? MdFlavor.obsidian : flavor === 'commonmark' ? MdFlavor.commonmark : MdFlavor.gfm);

let runs = 0;
for (const s of starts) {
  // ---- html
  const flavor = mdFlavor(s.config.flavor);
  runs++;
  try {
    const first = MdTree.parse(s.text, flavor).renderHtml();
    const back = MdHtmlParser.parse(first).markdown;
    if (norm(MdTree.parse(back, flavor).renderHtml()) !== norm(first)) note('html: renders differently after a round trip', `${JSON.stringify(s.text)}\n         → ${JSON.stringify(back)}`);
  } catch (e) {
    fails.push(`html threw: ${JSON.stringify(s.text)}: ${(e as Error).message.split('\n')[0]}`);
  }
  // ---- paste
  const doc = OurusDoc.parse(s.text, { config: s.config });
  const view = OurusView.of(doc);
  const carets = new Set<number>([0, s.text.length]);
  for (let i = 0; i < s.text.length; i++) if (s.text[i] === '\n' || s.text[i - 1] === '\n' || i % 7 === 0) carets.add(i);
  for (const [name, clip] of Object.entries(CLIPS)) {
    const text = clip['text/plain'] ?? '';
    for (const pos of carets) {
      for (const over of [0, 5]) {
        const to = Math.min(s.text.length, pos + over);
        // (a selection over text drops that text: the letters it holds don't count)
        const kept = s.text.slice(0, pos) + s.text.slice(to);
        runs++;
        const where = `${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${pos}${over ? `-${to}` : ''}`;
        try {
          const result = executeCommand(view, { type: 'paste', clipboard: clip }, { anchor: pos, head: to });
          if (result instanceof OurusRejected) {
            if (result.reason === 'write-failed') note(`paste ${name}: write-failed`, where);
            continue;
          }
          if (!(result instanceof OurusSuccess)) continue;
          const after = result.view.doc.text;
          const { anchor, head } = result.selection;
          if (anchor < 0 || head < 0 || anchor > after.length || head > after.length) note(`paste ${name}: selection off the text`, where);
          else if (letters(after) !== letters(kept + text)) note(`paste ${name}: letters lost or doubled`, `${where}\n         → ${JSON.stringify(after)}`);
        } catch (e) {
          fails.push(`paste ${name} threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
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
if (process.env.CONSERVE_UPDATE === '1') {
  writeBaseline(baselineFile, corpus, groups);
  console.log(`baseline updated: ${baselineFile}`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
