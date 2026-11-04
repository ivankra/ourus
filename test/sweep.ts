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
// caret the cut leaves must give the same blocks back, whatever the blank lines and numbers (`cut→paste`: C10–C12's caret rules). Part of that group is the spec's: paste goes after the node the caret
// is on, so a first item cut and pasted lands under the next one; the baseline holds the count, not the cause.
//
// Each group's count is held to a baseline (`sweep.baseline.json`) on the same corpus, so a new kind
// of failure, or more of one, fails the run; a throw always does.
//
//   node test/sweep.ts                       # the report, against the baseline
//   SWEEP_UPDATE=1 node test/sweep.ts        # the same, then its counts as the new baseline, once read
//   SWEEP_EXAMPLES=8 node test/sweep.ts      # examples per group (default 2)
//   SWEEP_GENERATED=200 node test/sweep.ts   # notes in the corpus (default 60, and as many with an odd character)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { executeCommand, OurusRejected, OurusSuccess, type OurusCommand } from '../src/commands/index.ts';
import { textStart } from '../src/commands/util.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { applyChanges } from '../src/text/index.ts';
import { OurusView } from '../src/view/index.ts';
import { allNodes, generatedStarts, type GeneratedStart, readBaseline, writeBaseline, corpusHash, noteFailure } from './lib/index.ts';

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
const note = (key: string, example: string): void => noteFailure(groups, key, example, examples);
const outline = (d: OurusDoc): string => JSON.stringify(allNodes(d).map((n) => [n.depth, n.kind]));
/** A step that did not apply (refused, or the host's): nothing to compare. */
class Skip extends Error {}
const endings = (s: string): string => (/\r\n/.test(s) ? 'crlf' : '') + (/(^|[^\r])\n/.test(s) ? 'lf' : '');

let runs = 0;
for (const s of starts) {
  const doc = OurusDoc.parse(s.text, { config: s.config });
  const view = OurusView.of(doc);
  const before = endings(s.text);
  for (const command of COMMANDS) {
    const label = command.type === 'insertText' ? `insertText ${JSON.stringify(command.text)}` : command.type;
    for (let pos = 0; pos <= s.text.length; pos++) {
      runs++;
      const where = `${s.name}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} @${pos}`;
      try {
        const result = executeCommand(view, command, { anchor: pos, head: pos });
        if (result instanceof OurusRejected) {
          if (result.reason === 'write-failed') note(`${label}: write-failed`, where);
          continue;
        }
        if (!(result instanceof OurusSuccess)) continue;
        const after = result.view.doc.text;
        const { anchor, head } = result.selection;
        if (anchor < 0 || head < 0 || anchor > after.length || head > after.length) note(`${label}: selection off the text`, where);
        if (command.type !== 'cut' && applyChanges(s.text, result.changes) !== after) note(`${label}: changes don't give the text`, where);
        if (before && endings(after) !== before && after.length) note(`${label}: line endings changed`, `${where}\n         → ${JSON.stringify(after)}`);
        if (s.text.endsWith('\n') && after && !after.endsWith('\n')) note(`${label}: final newline lost`, `${where}\n         → ${JSON.stringify(after)}`);
      } catch (e) {
        fails.push(`${label} threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
  }
  // ---- copy → paste into an empty note: the blocks come back
  const kinds = (n: ReturnType<typeof allNodes>[number]): string[] => [n.kind, ...n.children.flatMap(kinds)];
  for (const node of allNodes(doc)) {
    let held = node;
    while (!doc.textOf(held) && held.children.length) held = held.children[0]!;
    const text = doc.textOf(held);
    const pos = text ? doc.posOf(held, textStart(text), 1) : doc.rangeOf(node).from;
    runs++;
    const where = `${s.name}: ${JSON.stringify(s.text)} ${JSON.stringify(s.config)} copy @${pos} (${node.kind})`;
    try {
      // (the node by its id: a caret in its text may be in a child, whose copy is not the node's)
      const copied = executeCommand(view, { type: 'copy', nodes: [node.id] }, { anchor: pos, head: pos });
      if (copied instanceof OurusRejected && copied.reason === 'write-failed') note(`copy: ${node.kind}: write-failed`, where);
      if (!(copied instanceof OurusSuccess) || !copied.clipboard) throw new Skip();
      const empty = OurusView.of(OurusDoc.parse('', { config: s.config }));
      const pasted = executeCommand(empty, { type: 'paste', clipboard: copied.clipboard }, { anchor: 0, head: 0 });
      if (pasted instanceof OurusRejected && pasted.reason === 'write-failed') note(`copy→paste: ${node.kind}: paste write-failed`, `${where}\n         ${JSON.stringify(copied.clipboard['text/plain'])}`);
      if (!(pasted instanceof OurusSuccess)) throw new Skip();
      const got = allNodes(pasted.view.doc).filter((n) => n.depth === 1).flatMap(kinds).join();
      const want = kinds(node).join();
      if (got !== want) note(`copy→paste: ${node.kind} comes back as other blocks`, `${where}\n         ${JSON.stringify(copied.clipboard['text/plain'])} → ${JSON.stringify(pasted.view.doc.text)}`);
    } catch (e) {
      if (!(e instanceof Skip)) fails.push(`copy→paste threw: ${where}: ${(e as Error).message.split('\n')[0]}`);
    }
    // ---- cut → paste at the caret the cut leaves: the note comes back exactly
    runs++;
    try {
      const cut = executeCommand(view, { type: 'cut', nodes: [node.id] }, { anchor: pos, head: pos });
      if (cut instanceof OurusRejected && cut.reason === 'write-failed') note(`cut: ${node.kind}: write-failed`, where.replace('copy', 'cut'));
      if (!(cut instanceof OurusSuccess) || !cut.clipboard) throw new Skip();
      const back = executeCommand(cut.view, { type: 'paste', clipboard: cut.clipboard }, cut.selection);
      if (back instanceof OurusRejected && back.reason === 'write-failed') note(`cut→paste: ${node.kind}: paste write-failed`, `${where.replace('copy', 'cut')}\n         → cut ${JSON.stringify(cut.view.doc.text)} @${cut.selection.head}`);
      if (!(back instanceof OurusSuccess)) throw new Skip();
      if (outline(back.view.doc) !== outline(doc)) note(`cut→paste: ${node.kind} doesn't come back as the same blocks`, `${where.replace('copy', 'cut')}\n         → cut ${JSON.stringify(cut.view.doc.text)} @${cut.selection.head} → ${JSON.stringify(back.view.doc.text)}`);
    } catch (e) {
      if (!(e instanceof Skip)) fails.push(`cut→paste threw: ${where.replace('copy', 'cut')}: ${(e as Error).message.split('\n')[0]}`);
    }
  }
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
if (process.env.SWEEP_UPDATE === '1') {
  writeBaseline(baselineFile, hash, groups);
  console.log(`baseline updated: ${baselineFile}`);
}
process.exitCode = fails.length === 0 && rose.length === 0 ? 0 : 1;
