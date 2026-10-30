// The tab pass: every example of the spec played again with its indentation written with tabs, each
// line's leading spaces a tab wherever they reach a tab stop, so the document reads as it did
// (CommonMark reads indentation by columns), and each step's state read back with its tabs as the
// columns they span, against what the example draws: the same text, or one ourus reads as the same
// document (a tab after a quote's `>` spelled back as more spaces than it had). The spec is drawn with spaces, so the writer's
// tab paths are what it doesn't reach; this does. Where the tabs make `detect` read another unit (a
// tab past a parent's marker reads as `tab`), the example is played with the unit its spaces read.
//
//   node test/tabs.ts          # the report: the examples that don't play back
//
// Left out: an example that draws tabs itself, and one that sets `indentUnit`, whose unit is its point.

import { indentUnitOf } from '../src/writer/write.ts';
import { compareTexts, readTextDoc } from '../sxs/lib/text.ts';
import { docOf, drawDoc, drawnSelection, drawsCaret, readDrawing, readLabels, withoutCaret } from './drawing.ts';
import { play, type Played } from './player.ts';
import { Labels, readClipboard, normalize, outcome, flavorsOf, viewOf } from './spec-run.ts';
import { readSpecFile, specConfig, specFiles, type SpecTest } from './specfile.ts';
import { OurusRejected } from '../src/commands/index.ts';

/** A drawn buffer with each line's leading spaces (between its quotes' `>`s too) tabs to the stops they reach; a drop line (`▸`) as it is, no part of the text. */
export function withTabs(drawn: string): string {
  return drawn
    .split('\n')
    .map((line) => {
      if (/^ *▸ *$/.test(line)) return line;
      const lead = /^[ >]*/.exec(line)![0];
      let out = '';
      let column = 0;
      for (const run of lead.match(/>| +/g) ?? []) {
        if (run === '>') {
          out += '>';
          column++;
          continue;
        }
        const to = column + run.length;
        for (let stop = column + 4 - (column % 4); stop <= to; stop += 4) {
          out += '→';
          column = stop;
        }
        out += ' '.repeat(to - column);
        column = to;
      }
      return out + line.slice(lead.length);
    })
    .join('\n');
}

/** A drawn buffer with each line's leading tabs (`→`) the spaces of the columns they span. */
export function withSpaces(drawn: string): string {
  return drawn
    .split('\n')
    .map((line) => {
      const lead = /^[ >→]*/.exec(line)![0];
      let out = '';
      for (const c of lead) out += c === '→' ? ' '.repeat(4 - (out.length % 4)) : c;
      return out + line.slice(lead.length);
    })
    .join('\n');
}

/** What happened when example `t` was played with tabs: null where it played back, else where and why not. */
export function tabPass(t: SpecTest): string | null {
  if (t.options.indentUnit !== undefined || /→/.test(t.initial.buffer)) return null;
  const tabbed = withTabs(t.initial.buffer);
  if (tabbed === t.initial.buffer) return null;
  const flavor = flavorsOf(t)[0]!;
  const config = { flavor, ...specConfig(t.options) };
  const spaces = readDrawing(t.initial.buffer);
  const start = readDrawing(tabbed);
  const unit = indentUnitOf(docOf(spaces.text, spaces.placeholders, config));
  const doc = docOf(start.text, start.placeholders, { ...config, indentUnit: unit });
  const labels = new Labels();
  labels.check(doc, start.labels, null);
  const viewed = viewOf(t, doc, labels.ids);
  let state: Played = { view: viewed, selection: drawnSelection(viewed, start), clipboard: readClipboard(t.initial.clipboard), drop: start.drop, labels: labels.ids };
  for (const step of t.steps) {
    for (const action of step.actions) {
      state = play(state, [action]);
      if (state.last instanceof OurusRejected && state.last.reason === 'write-failed') return `write-failed at line ${step.line}: ${action}: ${state.last.detail ?? ''}`;
    }
    const { result } = step.expect;
    if (result !== undefined && outcome(state) !== result) return `result at line ${step.line}: ${outcome(state)}, not ${result}`;
    if (step.expect.buffer === undefined || /→/.test(step.expect.buffer)) continue;
    // (labels are no text: drawn before the caret, they would move it)
    const buffer = readLabels(step.expect.buffer).drawn;
    const drawn = drawDoc(state.view, state.selection);
    const got = withSpaces(drawsCaret(buffer) ? drawn : withoutCaret(drawn));
    // (spelled otherwise but read the same, as a tab after a quote's `>` is: the same document)
    if (normalize(got) !== normalize(buffer) && compareTexts(readTextDoc(normalize(buffer)), readTextDoc(normalize(got)), flavor) !== 'whitespace') return `buffer at line ${step.line}:\n    want ${JSON.stringify(normalize(buffer))}\n    got  ${JSON.stringify(normalize(got))}\n    tabs ${JSON.stringify(normalize(drawn))}\n    from ${JSON.stringify(tabbed)}`;
  }
  return null;
}

if (import.meta.main) {
  let played = 0;
  const failed: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      played++;
      const why = tabPass(t);
      if (why) failed.push(`${t.name}: ${why}`);
    }
  }
  console.log(`${played} examples, ${failed.length} don't play back with tabs`);
  for (const f of failed) console.log(f);
}
