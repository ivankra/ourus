// Runs the behaviour spec in spec/*.md (the format is in spec/README.md) against the core, in every
// Markdown flavor, or in the one an example names.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test, type TestContext } from 'node:test';
import { Config } from '../src/config.ts';
import { OutlineState } from '../src/outline/index.ts';
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

/** The flavors an example runs in: the one it names, or all (most behaviour doesn't depend on it). */
const flavorsOf = (t: SpecTest): readonly Config['flavor'][] => (t.options.flavor ? [t.options.flavor as Config['flavor']] : Config.values.flavor);

function run(t: SpecTest, flavor: Config['flavor']): void {
  const start = readDrawing(t.initial.buffer);
  let state: Played = {
    doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: { flavor, ...specConfig(t.options) } }),
    selection: start.selection,
    clipboard: readText(t.initial.clipboard ?? ''),
  };
  for (const step of t.steps) {
    const at = `${t.file}:${step.line} (${flavor})`;
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
    const runAll = (): void => {
      for (const flavor of flavorsOf(t)) run(t, flavor);
    };
    test(`${file} › ${t.name}`, (ctx: TestContext) => {
      if (!t.pending) return runAll();
      // a pending example fails once it passes (in every flavor), so it gets promoted rather than forgotten
      try {
        runAll();
      } catch (e) {
        ctx.todo('pending');
        throw e;
      }
      assert.fail(`${t.file}:${t.line}: a pending example passes now; drop "pending"`);
    });
  }
}
