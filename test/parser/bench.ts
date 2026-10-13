// Parser timings: a full parse (the line machine), building the block tree and line table, all
// inlines, HTML; commonmark.js on the same text for scale; and incremental updates (typing, Enter, a
// fence that changes the rest) on long documents. Median and 95th percentile, in milliseconds. A
// report, not a gate.
//
//   node test/parser/bench.ts [corpus.md ...]

import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { commonmark, type Flavor } from '../../src/parser/flavor.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { renderHtml } from '../../src/parser/html.ts';
import { obsidian } from '../../src/parser/obsidian.ts';
import { SyntaxTree } from '../../src/parser/syntax.ts';
import { preorder } from '../../src/parser/walk.ts';

const runs = Number(process.env.BENCH_RUNS ?? 20);

function measure(name: string, run: () => void): void {
  for (let i = 0; i < 3; i++) run();
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    run();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const at = (q: number): string => times[Math.min(times.length - 1, Math.floor(q * times.length))]!.toFixed(3);
  console.log(`  ${name.padEnd(34)} ${at(0.5).padStart(9)} ${at(0.95).padStart(9)}`);
}

/** Sections with paragraphs owning nested lists, quotes and code (test/bench.ts's outline). */
function sections(lines: number): string {
  const out: string[] = [];
  for (let section = 0; out.length < lines; section++) {
    out.push(`## Section ${section}`, '', `Notes for section ${section}, with *some* text and a [link](http://x.y):`);
    for (let item = 0; item < 8; item++) {
      out.push(`- item ${section}.${item} with some \`code\` text`);
      for (let child = 0; child < 3; child++) out.push(`  - child ${child} of ${item}`, `    - grandchild ${child} **bold**`);
    }
    out.push('', '> a quote', '> - quoted item', '', '```', 'code', '```', '');
  }
  return out.join('\n') + '\n';
}

/** Everything under one root bullet, as outliners write. */
function oneRoot(lines: number): string {
  const out = ['- root'];
  for (let i = 1; i < lines; i++) out.push('  '.repeat(1 + (i % 4)) + `- node ${i} with some text`);
  return out.join('\n') + '\n';
}

const documents: [string, string][] = [
  ['sections, 10k lines', sections(10_000)],
  ['one root bullet, 10k lines', oneRoot(10_000)],
];
for (const file of process.argv.slice(2)) documents.push([file, readFileSync(file, 'utf8')]);

const cm = await import('commonmark').catch(() => null);

for (const [name, text] of documents) {
  const lines = text.split('\n').length;
  console.log(`\n${name}: ${lines} lines, ${(text.length / 1024).toFixed(0)} KB, ${runs} runs`);
  console.log(`  ${''.padEnd(34)} ${'median'.padStart(9)} ${'p95'.padStart(9)}`);
  for (const [flavorName, flavor] of [['commonmark', commonmark], ['gfm', gfm], ['obsidian', obsidian]] as [string, Flavor][]) {
    measure(`${flavorName}: parse`, () => SyntaxTree.parse(text, flavor));
    measure(`${flavorName}: parse + tree + lines`, () => void SyntaxTree.parse(text, flavor).lines);
    measure(`${flavorName}: + all inlines`, () => {
      const s = SyntaxTree.parse(text, flavor);
      for (const b of preorder(s.root)) s.inlines(b);
    });
    measure(`${flavorName}: + HTML`, () => renderHtml(SyntaxTree.parse(text, flavor)));
  }
  if (cm) {
    const parser = new cm.Parser();
    const renderer = new cm.HtmlRenderer();
    measure('commonmark.js: parse + HTML', () => renderer.render(parser.parse(text)));
  }
  const base = SyntaxTree.parse(text, gfm);
  void base.lines;
  const middle = base.lines[Math.floor(base.lines.length / 2)]!;
  const at = middle.to;
  measure('gfm: keystroke (update)', () => base.update([{ from: at, to: at, insert: 'x' }]));
  measure('gfm: keystroke + tree + lines', () => void base.update([{ from: at, to: at, insert: 'x' }]).lines);
  measure('gfm: Enter (update)', () => base.update([{ from: at, to: at, insert: '\n' }]));
  measure('gfm: fence at the top (update)', () => base.update([{ from: 0, to: 0, insert: '```\n' }]));
  const typed = base.update([{ from: at, to: at, insert: 'x' }]);
  console.log(`  lines re-read: keystroke ${typed.reread.to - typed.reread.from + 1}`);
}
