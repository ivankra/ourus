// Redraw: the spec cases whose drawings ourus no longer matches, each step's drawing beside what ourus
// does now, and with `--apply` those drawings rewritten to it. For a behavior changed on purpose:
// read every difference first, and redraw by hand where the actions themselves should change.
//
//   node test/redraw.ts                          # every case: what differs
//   node test/redraw.ts enter.md Enter28         # a file's cases, a case (its ID, a name's end, file.md#anchor)
//   node test/redraw.ts enter.md --apply         # and rewrite their buffer blocks and result keys
//
// A case plays in every flavor it runs in; where the flavors come out differently, or a step fails to
// write, or the text has no final line break (which a buffer can't draw), it is reported and left as
// it is. Pending cases are left out. Blocks are rewritten from the bottom of each file up, so a
// rewritten block never moves one still to write.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OurusConfig } from '../src/config.ts';
import { drawDoc, drawLabels, drawsCaret, readDrawing, readLabels, withoutCaret } from './drawing.ts';
import { isAction, play } from './player.ts';
import { flavorsOf, Labels, normalize, outcome, startOf } from './spec-run.ts';
import { readSpecFile, slug, specFiles, SPEC_DIR, type SpecTest } from './specfile.ts';
import { OurusRejected } from '../src/commands/index.ts';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const selectors = args.filter((a) => !a.startsWith('--'));
for (const a of args) if (a.startsWith('--') && a !== '--apply') {
  console.error(`unknown option ${a}\nusage: node test/redraw.ts [file.md | case | file.md#anchor]... [--apply]`);
  process.exit(2);
}

/** Whether `t` is one a selector picks: its file, its ID, or `file.md#anchor`. */
const picks = (selector: string, t: SpecTest): boolean => {
  if (selector.includes('#')) {
    const [file, anchor] = selector.split('#');
    return (!file || t.file === file || t.file === `${file}.md`) && slug(t.name) === anchor!.toLowerCase();
  }
  return t.file === selector || t.file === `${selector}.md` || t.name === selector;
};

/** Spaces ending a line drawn `␠`, so a difference in them shows. */
const visible = (drawn: string): string => drawn.replace(/ +$/gm, (spaces) => '␠'.repeat(spaces.length));
const indented = (drawn: string): string => visible(drawn.replace(/\n$/, '')).split('\n').map((line) => `      ${line}`).join('\n');

interface Redrawn {
  readonly t: SpecTest;
  readonly step: number;
  readonly kind: 'buffer' | 'result';
  readonly drawn: string;
  readonly now: string;
}

/** Each step's buffer and result as ourus has them now, in `flavor`; a string says why it can't be drawn. */
function played(t: SpecTest, flavor: OurusConfig['flavor']): { buffer: string; result: string }[] | string {
  let state = startOf(t, flavor);
  // (the labels a step's buffer draws, drawn again where their nodes are: a redrawn buffer keeps them)
  const labels = new Labels();
  const named = labels.check(state.view.doc, readDrawing(t.initial.buffer).labels, null);
  if (named) return `the start's labels: ${named}`;
  const out: { buffer: string; result: string }[] = [];
  for (const [k, step] of t.steps.entries()) {
    const unknown = step.actions.filter((a) => !isAction(a));
    if (unknown.length) return `step ${k + 1}: unknown actions ${unknown.join(' ')}`;
    const before = state.view.doc.nextId;
    for (const action of step.actions) {
      state = play(state, [action]);
      if (state.last instanceof OurusRejected && state.last.reason === 'write-failed') return `step ${k + 1}: ${action} fails to write${state.last.detail ? `: ${state.last.detail}` : ''}`;
    }
    if (state.view.doc.text !== '' && !/[\r\n]$/.test(state.view.doc.text)) return `step ${k + 1}: no final line break, which a buffer can't draw`;
    const own = readLabels(step.expect.buffer ?? '').labels;
    labels.check(state.view.doc, own, before);
    const drawn = drawLabels(drawDoc(state.view, state.selection), labels.drawn(state.view.doc, new Set([...own.values()].flat())));
    out.push({ buffer: normalize(drawn), result: outcome(state) });
  }
  return out;
}

const files = specFiles();
const redrawn: Redrawn[] = [];
/** ourus's buffer as a drawing has it: without the caret where the drawing draws none (not checked there). */
const as = (drawn: string, got: string): string => (drawsCaret(drawn) ? got : withoutCaret(got));
const unredrawable: string[] = [];
let checked = 0;
for (const file of files) {
  for (const t of readSpecFile(file)) {
    if (t.pending || (selectors.length && !selectors.some((s) => picks(s, t)))) continue;
    checked++;
    const runs = flavorsOf(t).map((flavor) => ({ flavor, steps: played(t, flavor) }));
    const broken = runs.find((r) => typeof r.steps === 'string');
    const differs = (k: number): boolean => {
      const step = t.steps[k]!;
      const got = (runs[0]!.steps as { buffer: string; result: string }[])[k]!;
      return (step.expect.buffer !== undefined && normalize(step.expect.buffer) !== as(step.expect.buffer, got.buffer)) || (step.expect.result !== undefined && step.expect.result !== got.result);
    };
    if (broken) {
      unredrawable.push(`${t.file}:${t.line} ${t.name} (${broken.flavor}): ${broken.steps as string}`);
      continue;
    }
    if (!t.steps.some((_, k) => differs(k))) continue;
    const [first, ...rest] = runs as { flavor: string; steps: { buffer: string; result: string }[] }[];
    const split = rest.find((r) => r.steps.some((s, k) => s.buffer !== first!.steps[k]!.buffer || s.result !== first!.steps[k]!.result));
    if (split) {
      unredrawable.push(`${t.file}:${t.line} ${t.name}: ${first!.flavor} and ${split.flavor} come out differently`);
      continue;
    }
    t.steps.forEach((step, k) => {
      const got = first!.steps[k]!;
      if (step.expect.result !== undefined && step.expect.result !== got.result) redrawn.push({ t, step: k, kind: 'result', drawn: step.expect.result, now: got.result });
      if (step.expect.buffer !== undefined && normalize(step.expect.buffer) !== as(step.expect.buffer, got.buffer)) redrawn.push({ t, step: k, kind: 'buffer', drawn: step.expect.buffer, now: as(step.expect.buffer, got.buffer) });
    });
  }
}

for (const r of redrawn) {
  const step = r.t.steps[r.step]!;
  console.log(`${r.t.file}:${step.line} ${r.t.name}, step ${r.step + 1} (${step.actions.join(' ')}): ${r.kind}`);
  console.log(`    drawn:\n${indented(r.drawn)}\n    now:\n${indented(r.now)}`);
}
for (const line of unredrawable) console.log(`left as drawn: ${line}`);
const cases = new Set(redrawn.map((r) => r.t)).size;
console.log(`\n${checked} cases checked: ${cases} drawn otherwise than ourus does now (${redrawn.length} blocks)${unredrawable.length ? `, ${unredrawable.length} that can't be redrawn` : ''}`);

if (apply && redrawn.length) {
  for (const file of new Set(redrawn.map((r) => r.t.file))) {
    const path = join(SPEC_DIR, file);
    const lines = readFileSync(path, 'utf8').split('\n');
    // bottom up: a block rewritten changes the lines after it, never those before
    const edits = redrawn.filter((r) => r.t.file === file).sort((a, b) => b.t.steps[b.step]!.line - a.t.steps[a.step]!.line || (a.kind === 'buffer' ? -1 : 1));
    for (const r of edits) {
      const block = blockAfter(lines, r.t.steps[r.step]!.line, r.kind === 'result' ? 'yaml' : r.kind);
      if (!block) throw new Error(`${file}:${r.t.steps[r.step]!.line}: no ${r.kind === 'result' ? 'yaml' : r.kind} block after the step`);
      if (r.kind === 'result') {
        // the state's yaml block: its `result:` key
        const at = lines.slice(block.open + 1, block.close).findIndex((line) => line.startsWith('result: '));
        if (at < 0) throw new Error(`${file}:${r.t.steps[r.step]!.line}: no result key after the step`);
        lines[block.open + 1 + at] = `result: ${r.now}`;
        continue;
      }
      const content = r.now.replace(/\n$/, '').split('\n');
      // a fence longer than any backtick run starting a line of the content
      const run = Math.max(0, ...content.map((line) => /^`*/.exec(line)![0].length));
      const fence = '`'.repeat(Math.max(block.fence.length, run >= 3 ? run + 1 : 3));
      lines.splice(block.open, block.close - block.open + 1, `${fence}${r.kind}`, ...content, fence);
    }
    writeFileSync(path, lines.join('\n'));
    console.log(`rewrote ${edits.length} blocks in spec/${file}`);
  }
}

/** The `kind` block after the quote on line `quote` (1-based), before the next step or heading: its fence and its lines' indexes. */
function blockAfter(lines: readonly string[], quote: number, kind: string): { open: number; close: number; fence: string } | null {
  for (let i = quote; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^(> |#)/.test(line)) return null;
    const open = /^(`{3,}|~{3,})\s*(\S*)\s*$/.exec(line);
    if (!open) continue;
    const fence = open[1]!;
    let close = i + 1;
    while (close < lines.length && !(lines[close]!.startsWith(fence[0]!.repeat(fence.length)) && /^(`+|~+)\s*$/.test(lines[close]!))) close++;
    if (open[2] === kind) return { open: i, close, fence };
    i = close;
  }
  return null;
}
