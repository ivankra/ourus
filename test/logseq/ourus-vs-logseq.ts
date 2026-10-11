// Offline: replays spec/logseq.md (Logseq's recorded behaviour) with ourus, through the core player,
// and reports where ourus and Logseq agree. Outlines are compared as the Logseq runner compares them.
//   node test/logseq/ourus-vs-logseq.ts [-v]
import { readFileSync } from 'node:fs';
import { Doc } from '../../src/doc.ts';
import { drawState, readDrawing, readText } from '../drawing.ts';
import { play, type Played } from '../player.ts';
import { readSpec } from '../specfile.ts';
import { draw, readOutline, unescape, type Outline } from './adapt.ts';

const verbose = process.argv.includes('-v');
const tests = readSpec('logseq.md', readFileSync(new URL('../../spec/logseq.md', import.meta.url), 'utf8'));
const tally = new Map<string, number>();
const bySource = new Map<string, Map<string, number>>();
const loose = (o: Outline) => o.blocks.map((b) => `${b.depth}:${b.text.replace(/ *\n */g, '\n').trim()}`).join('|');
for (const t of tests) {
  const start = readDrawing(t.initial.buffer);
  let state: Played = { doc: Doc.parse(start.text, { provisional: start.provisional }), selection: start.selection, clipboard: readText(t.initial.clipboard ?? '') };
  let verdict = 'agree';
  let detail = '';
  try {
    for (const s of t.steps) {
      state = play(state, s.actions);
      if (s.expect.buffer === undefined) continue;
      const want = unescape(readOutline(s.expect.buffer, true));
      let got: Outline;
      try {
        got = unescape(readOutline(drawState(state.doc.text, state.selection).replace(/◌/g, '')));
      } catch (e) {
        verdict = 'not an outline';
        detail = `  ourus left: ${JSON.stringify(state.doc.text)} (${(e as Error).message})`;
        break;
      }
      const same = got.blocks.length === want.blocks.length && got.blocks.every((b, i) => b.depth === want.blocks[i]!.depth && b.text === want.blocks[i]!.text);
      if (!same) verdict = loose(got) === loose(want) ? 'whitespace' : 'outline';
      else if (want.sel && JSON.stringify(got.sel) !== JSON.stringify(want.sel)) verdict = 'caret';
      if (verdict !== 'agree') {
        detail = `  > ${s.actions.join(' ')}\n  logseq:\n${draw(want).replace(/^/gm, '    ')}  ourus:\n${draw(got).replace(/^/gm, '    ')}`;
        break;
      }
    }
  } catch (e) {
    verdict = 'error';
    detail = '  ' + String(e).slice(0, 150);
  }
  tally.set(verdict, (tally.get(verdict) ?? 0) + 1);
  const src = t.name.split(':')[0]!;
  const m = bySource.get(src) ?? new Map<string, number>();
  m.set(verdict, (m.get(verdict) ?? 0) + 1);
  bySource.set(src, m);
  if (verbose && verdict !== 'agree') console.log(`${verdict.padEnd(14)} ${t.name}\n${detail}`);
}
console.log(`${tests.length} examples: ` + [...tally].map(([k, v]) => `${k} ${v}`).join(', '));
for (const [src, m] of bySource) console.log(`  ${src.padEnd(28)} ` + [...m].map(([k, v]) => `${k} ${v}`).join(', '));
