// Timings on a large outline: a full parse, a keystroke, and each command near the middle of the
// document, as median and 95th percentile in milliseconds. A report, not a gate.
//
//   node test/bench.ts            # 10,000 lines
//   BENCH_LINES=50000 node test/bench.ts

import { performance } from 'node:perf_hooks';
import { execute, type Command } from '../src/commands.ts';
import { OutlineDoc } from '../src/doc.ts';

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
const doc = OutlineDoc.parse(text);
const middle = doc.lines[Math.floor(doc.lines.length / 2)]!;
// an item near the middle, with children and a sibling above: its text start, and the end of its text
const item = doc.nodes.find((node) => node.kind === 'item' && node.startLine >= middle.index && node.children.length > 0 && node.parent!.children.indexOf(node) > 0)!;
const start = doc.headRange(item)!.from;
const end = doc.headRange(item)!.to;
const at = (pos: number) => ({ anchor: pos, head: pos });
const command = (name: string, type: Command, pos: number): void =>
  measure(name, () => {
    const result = execute(doc, type, at(pos));
    if (result.status !== 'applied') throw new Error(`${name}: ${result.status} ${'reason' in result ? result.reason : ''}`);
  });

console.log(`${doc.lines.length} lines, ${doc.nodes.length} nodes, ${(text.length / 1024).toFixed(0)} KB; ${runs} runs each`);
console.log(`${''.padEnd(28)} ${'median'.padStart(8)} ${'p95'.padStart(8)}`);
measure('full parse', () => OutlineDoc.parse(text));
measure('keystroke (OutlineDoc.apply)', () => doc.apply([{ from: end, to: end, insert: 'x' }], { caret: end + 1 }));
command('moveBlockDown', { type: 'moveBlockDown' }, end);
command('indent', { type: 'indent' }, end);
command('outdent (child)', { type: 'outdent' }, doc.headRange(item.children[0]!)!.to);
command('enter (split)', { type: 'enter' }, start + 2);
command('shiftEnter', { type: 'shiftEnter' }, start + 2);
command('deleteContentBackward', { type: 'deleteContentBackward' }, start);
command('pasteStructured (list)', { type: 'pasteStructured', text: '- pasted\n  - nested' }, end);
command('duplicateNode', { type: 'duplicateNode' }, end);
command('deleteSubtree', { type: 'deleteSubtree' }, end);
