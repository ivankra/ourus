// Timings on a large outline: a full parse, a keystroke, and each command near the middle of the
// document, as median and 95th percentile in milliseconds. A report, not a gate.
//
//   node test/bench.ts            # 10,000 lines
//   BENCH_LINES=50000 node test/bench.ts
//   BENCH_RUNS=100 node test/bench.ts   # runs per timing (default 30)

import { performance } from 'node:perf_hooks';
import { executeCommand, type Command } from '../src/commands/index.ts';
import { OurusDoc, type OutlineNode } from '../src/doc/index.ts';
import { nodesOf } from './drawing.ts';

const target = Number(process.env.BENCH_LINES ?? 10_000);
const runs = Number(process.env.BENCH_RUNS ?? 30);

/** An outline of about `lines` lines: sections, paragraphs owning lists, nested items, quotes and code. */
function outline(lines: number): string {
  const out: string[] = [];
  for (let section = 0; out.length < lines; section++) {
    out.push(`## Section ${section}`, '', `Notes for section ${section}:`);
    for (let item = 0; item < 8; item++) {
      out.push(`- item ${section}.${item} with some text`);
      for (let child = 0; child < 3; child++) out.push(`  - child ${child} of ${item}`, `    - grandchild ${child}`);
    }
    out.push('', '> a quote', '> - quoted item', '', '```', 'code', '```', '');
  }
  return out.join('\n') + '\n';
}

function measure(name: string, run: () => void): void {
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    run();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const at = (q: number): string => times[Math.min(times.length - 1, Math.floor(q * times.length))]!.toFixed(2);
  console.log(`${name.padEnd(28)} ${at(0.5).padStart(8)} ${at(0.95).padStart(8)}`);
}

const text = outline(target);
const doc = OurusDoc.parse(text);
const nodes = nodesOf(doc);
const middle = Math.floor(doc.lineCount / 2);
// an item near the middle, with children and a sibling above: its text start, and the end of its text
const item = nodes.find((node) => node.kind === 'item' && node.startLine >= middle && node.children.length > 0 && node.index > 0)!;
const textEnd = (node: OutlineNode): number => doc.posOf(node, doc.textOf(node)!.text.length);
const start = doc.posOf(item, 0);
const end = textEnd(item);
const at = (pos: number) => ({ anchor: pos, head: pos });
const command = (name: string, type: Command, pos: number): void =>
  measure(name, () => {
    const result = executeCommand(doc, type, at(pos));
    if (result.status !== 'applied') throw new Error(`${name}: ${result.status} ${'reason' in result ? result.reason : ''}`);
  });

console.log(`${doc.lineCount} lines, ${nodes.length + 1} nodes, ${(text.length / 1024).toFixed(0)} KB; ${runs} runs each`);
console.log(`${''.padEnd(28)} ${'median'.padStart(8)} ${'p95'.padStart(8)}`);
measure('full parse', () => OurusDoc.parse(text));
measure('keystroke (OurusDoc.update)', () => doc.update([{ from: end, to: end, insert: 'x' }], { caret: end + 1 }));
command('moveSubtreeDown', { type: 'moveSubtreeDown' }, end);
command('indent', { type: 'indent' }, end);
command('outdent (child)', { type: 'outdent' }, textEnd(item.children[0]!));
command('enter (split)', { type: 'enter' }, start + 2);
command('shiftEnter', { type: 'shiftEnter' }, start + 2);
command('deleteContentBackward', { type: 'deleteContentBackward' }, start);
command('paste (list)', { type: 'paste', clipboard: { 'text/plain': '- pasted\n  - nested' } }, end);
command('duplicateSubtree', { type: 'duplicateSubtree' }, end);
command('deleteSubtree', { type: 'deleteSubtree' }, end);
