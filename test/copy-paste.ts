#!/usr/bin/env node
// Copy and paste against duplicate: on every node without children of every distinct start buffer
// the spec draws, `duplicateSubtree` with the caret at the node's text end, against `copy` there (the
// node, `copyAtCaret: node`) and `paste` at the same caret. Paste places nodes as duplicate does, so
// where both apply they should write the same text; a report of where they don't, grouped by the
// node's kind and the shape of the difference:
//
//   same       the same text
//   blank+, blank-   the same lines but for more, or fewer, blank lines after paste
//   tree       another outline
//   text       the same outline, other text
//   <status>   one of them didn't apply (`duplicate: rejected`, `paste: notApplicable`)
//
// Each group's count is held to a baseline (`copy-paste.baseline.json`) on the same corpus, so a
// change that moves a run from one group to another fails the run until it is read; items must stay
// `same` whatever the baseline says (but an empty one, which fills the empty item it is pasted on,
// an unclosed fence, which paste closes, and lazy lines, which may read otherwise out of a quote).
//
//   node test/copy-paste.ts                       # the report, against the baseline
//   COPYPASTE_UPDATE=1 node test/copy-paste.ts    # the same, then its counts as the new baseline, once read
//   COPYPASTE_EXAMPLES=8 node test/copy-paste.ts  # examples per group (default 3)
//   COPYPASTE_DUMP=f.txt node test/copy-paste.ts  # every run that isn't `same`, a line each, sorted

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OutlineState, type OutlineNode } from '../src/outline/index.ts';
import { drawState, readDrawing } from './drawing.ts';
import { play, type Played } from './player.ts';
import { readSpec, specConfig } from './specfile.ts';
import { flavorsOf } from './spec-run.ts';

// --help: the comment at the top of this file; an argument it doesn't list is an error, never a run
{
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
    const usage = lines.slice(1, lines.findIndex((line, i) => i > 0 && !line.startsWith('//')));
    console.log(usage.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  }
  const unknown = args;
  if (unknown.length) {
    console.error(`no such option: ${unknown.join(', ')} (--help lists them)`);
    process.exit(2);
  }
}

const here = resolve(import.meta.dirname, '..');
const baselineFile = join(here, 'test/copy-paste.baseline.json');
const examples = Number(process.env.COPYPASTE_EXAMPLES ?? 3);

// every distinct start buffer, with its case's options, in its first flavor (as the inverse test's)
const specDir = join(here, 'spec');
const starts: { text: string; config: Record<string, unknown> }[] = [];
const seen = new Set<string>();
for (const file of readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md' && f !== 'obsidian-true-outliner.md').sort()) {
  for (const t of readSpec(file, readFileSync(join(specDir, file), 'utf8'))) {
    const start = readDrawing(t.initial.buffer);
    if (start.placeholders.length) continue;
    // (open seams join the paste's ends to the text around it: no duplicate)
    const config = { ...specConfig(t.options), flavor: flavorsOf(t)[0], copyAtCaret: 'node', pasteSeams: 'closed' };
    const key = JSON.stringify([start.text, config]);
    if (seen.has(key)) continue;
    seen.add(key);
    starts.push({ text: start.text, config });
  }
}
const corpus = createHash('sha256').update(JSON.stringify(starts.map((s) => JSON.stringify([s.text, s.config])).sort())).digest('hex').slice(0, 16);

const isBlank = (line: string): boolean => /^[ \t>]*$/.test(line);
const outline = (doc: OutlineState): string => JSON.stringify(doc.nodes.map((n) => [n.depth, n.kind, n.head?.type ?? null]));
function classify(duplicated: Played, pasted: Played): string {
  const [a, b] = [duplicated.doc.text, pasted.doc.text];
  if (a === b) return 'same';
  if (outline(duplicated.doc) !== outline(pasted.doc)) return 'tree';
  const solid = (s: string): string => s.split('\n').filter((l) => !isBlank(l)).join('\n');
  if (solid(a) === solid(b)) return a.split('\n').filter(isBlank).length < b.split('\n').filter(isBlank).length ? 'blank+' : 'blank-';
  return 'text';
}

/** Where the caret is at `node`'s text end: its head's end, or its block's last line's. */
function textEnd(doc: OutlineState, node: OutlineNode): number {
  return doc.headRange(node)?.to ?? doc.lines[node.block.endLine]!.to;
}

const counts = new Map<string, number>();
const noted = new Map<string, string[]>();
const dump: string[] = [];
let runs = 0;
for (const start of starts) {
  const doc = OutlineState.parse(start.text, { config: start.config });
  for (const node of doc.nodes) {
    if (node.kind === 'root' || node.children.length) continue;
    const at = textEnd(doc, node);
    const state: Played = { doc, selection: { anchor: at, head: at }, clipboard: {} };
    const duplicated = play(state, ['duplicateSubtree']);
    const copied = play(state, ['copy']);
    if (copied.last?.status !== 'applied') continue;
    const pasted = play({ ...state, clipboard: copied.clipboard }, ['paste']);
    runs++;
    const statuses = [duplicated.last?.status, pasted.last?.status];
    const shape = statuses.every((s) => s === 'applied') ? classify(duplicated, pasted) : `duplicate: ${statuses[0]}, paste: ${statuses[1]}`;
    // by design, apart: an empty node (an empty task too) copied fills the one it is pasted on; an
    // unclosed fence copied is closed where the copy ends
    const block = node.kind === 'atom' ? node.block : node.head;
    const unclosed = !!block && ((block.type === 'code_block' && block.fenced) || block.type === 'math_block' || block.type === 'comment_block') && !block.closed;
    // (and lazy lines, which out of their quote may read otherwise: `> - q` / `    - g`)
    const lazy = doc.ownLines(node).some((line) => line.lazy);
    const what = /^(?:\[[ xX]\])?$/.test(doc.nodeText(node).trim()) ? 'empty' : unclosed ? 'unclosed' : lazy ? 'lazy' : node.head && node.head.type !== 'paragraph' ? node.head.type : null;
    const group = `${node.kind}${what ? ` (${what})` : ''} ${shape}`;
    counts.set(group, (counts.get(group) ?? 0) + 1);
    if (shape === 'same') continue;
    const line = `${group}: ${JSON.stringify(drawState(doc.text, state.selection))} → duplicate ${JSON.stringify(duplicated.doc.text)}, paste ${JSON.stringify(pasted.doc.text)}`;
    dump.push(line);
    const list = noted.get(group) ?? [];
    if (list.length < examples) noted.set(group, [...list, `    ${drawState(doc.text, state.selection).replace(/\n/g, '⏎')}\n      duplicate ${duplicated.doc.text.replace(/\n/g, '⏎')}\n      paste     ${pasted.doc.text.replace(/\n/g, '⏎')}`]);
  }
}

const baseline: { corpus: string; counts: Record<string, number> } | null = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : null;
const comparable = baseline?.corpus === corpus;
console.log(`${starts.length} buffers, ${runs} nodes copied and pasted (corpus ${corpus}${baseline && !comparable ? `, baseline's ${baseline.corpus}: not compared` : ''})`);
let failed = false;
for (const group of [...new Set([...counts.keys(), ...Object.keys(comparable ? baseline!.counts : {})])].sort()) {
  const n = counts.get(group) ?? 0;
  const was = comparable ? (baseline!.counts[group] ?? 0) : n;
  // an item must paste as it duplicates
  const wrong = (group.startsWith('item') && !/^item \((?:empty|unclosed|lazy)\)/.test(group) && !group.endsWith(' same') && n > 0) || n > was;
  if (wrong) failed = true;
  console.log(`${wrong ? '✗' : ' '} ${String(n).padStart(6)}${n !== was ? ` (was ${was})` : ''}  ${group}`);
  if (!group.endsWith(' same')) for (const e of noted.get(group) ?? []) console.log(e);
}
if (process.env.COPYPASTE_DUMP) writeFileSync(process.env.COPYPASTE_DUMP, dump.sort().join('\n') + '\n');
if (process.env.COPYPASTE_UPDATE) writeFileSync(baselineFile, JSON.stringify({ corpus, counts: Object.fromEntries([...counts].sort()) }, null, 2) + '\n');
process.exitCode = failed && !process.env.COPYPASTE_UPDATE ? 1 : 0;
