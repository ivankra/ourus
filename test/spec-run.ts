// One example of the behaviour spec (spec/*.md) played on the core in a flavor, throwing where it
// doesn't do what the example draws: for the spec's tests, and for the SxS, whose heatmap has ourus.

import assert from 'node:assert/strict';
import { Config } from '../src/config.ts';
import { OutlineState } from '../src/outline/index.ts';
import { drawState, drawText, readDrawing, readText } from './drawing.ts';
import { isAction, play, type Played } from './player.ts';
import { specConfig, type SpecTest } from './specfile.ts';

/** The result block's form of the last action's outcome. */
function outcome(state: Played): string {
  const r = state.last;
  if (!r) return 'none (the last action is not an ourus command)';
  return r.status === 'rejected' ? `rejected: ${r.reason}` : r.status;
}

// a drawn selection without a caret glyph is forward
const normalize = (drawn: string): string => drawn.replace(/»┃/g, '»');

/** The flavors an example runs in: the one it names, or all (most behaviour doesn't depend on it). */
export const flavorsOf = (t: SpecTest): readonly Config['flavor'][] => (t.options.flavor ? [t.options.flavor as Config['flavor']] : Config.values.flavor);

/** Plays example `t` in `flavor`, asserting each step's buffer, clipboard and result as drawn. */
export function run(t: SpecTest, flavor: Config['flavor']): void {
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
    for (const action of step.actions) {
      state = play(state, [action]);
      // encoding-failed is a bug, never an outcome: a later action can't hide one
      assert.ok(state.last?.status !== 'rejected' || state.last.reason !== 'encoding-failed', `${at}: ${action} failed to encode${state.last?.status === 'rejected' && state.last.detail ? `: ${state.last.detail}` : ''}`);
    }
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

/** Whether the core does what example `t` draws, in every flavor it runs in. */
export function passes(t: SpecTest): boolean {
  try {
    for (const flavor of flavorsOf(t)) run(t, flavor);
    return true;
  } catch {
    return false;
  }
}
