// Runs the behaviour spec in spec/*.md (the format is in spec/README.md) against the core.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test, type TestContext } from 'node:test';
import { OutlineDoc } from '../src/doc.ts';
import { drawState, drawText, readDrawing, readText } from './drawing.ts';
import { isAction, play, type Played } from './player.ts';
import { readSpec, specConfig, type SpecTest } from './specfile.ts';

const specDir = new URL('../spec/', import.meta.url);

/** The result block's form of the last action's outcome. */
function outcome(state: Played): string {
  const r = state.last;
  if (!r) return 'none (the last action is not an ourus command)';
  return r.status === 'rejected' ? `rejected: ${r.reason}` : r.status;
}

// a drawn selection without a caret glyph is forward
const normalize = (drawn: string): string => drawn.replace(/»┃/g, '»');

function run(t: SpecTest): void {
  const start = readDrawing(t.initial.buffer);
  let state: Played = {
    doc: OutlineDoc.parse(start.text, { placeholders: start.placeholders, config: specConfig(t.options) }),
    selection: start.selection,
    clipboard: readText(t.initial.clipboard ?? ''),
  };
  for (const step of t.steps) {
    const at = `${t.file}:${step.line}`;
    const unknown = step.actions.filter((a) => !isAction(a));
    assert.deepEqual(unknown, [], `${at}: unknown actions`);
    state = play(state, step.actions);
    const { buffer, clipboard, result } = step.expect;
    const why = state.last?.status === 'rejected' && state.last.detail ? ` (${state.last.reason}: ${state.last.detail})` : '';
    if (result !== undefined) assert.equal(outcome(state), result, `${at}: result${why}`);
    if (buffer !== undefined) {
      const got = drawState(state.doc.text, state.selection, state.doc.placeholders);
      assert.equal(normalize(got), normalize(buffer), `${at}: buffer${why}`);
    }
    if (clipboard !== undefined) assert.equal(drawText(state.clipboard), clipboard, `${at}: clipboard`);
  }
}

for (const file of readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
  let tests: SpecTest[];
  try {
    tests = readSpec(file, readFileSync(new URL(file, specDir), 'utf8'));
  } catch (e) {
    test(`${file}: reads`, () => {
      throw e;
    });
    continue;
  }
  for (const t of tests) {
    // files drawing another editor's behaviour (`editor: logseq`) are that editor's runner's
    if ((t.options.editor ?? 'ourus') !== 'ourus') continue;
    test(`${file} › ${t.name}`, (ctx: TestContext) => {
      if (!t.pending) return run(t);
      // a pending example fails once it passes, so it gets promoted rather than forgotten
      try {
        run(t);
      } catch (e) {
        ctx.todo('pending');
        throw e;
      }
      assert.fail(`${t.file}:${t.line}: a pending example passes now; drop "pending"`);
    });
  }
}
