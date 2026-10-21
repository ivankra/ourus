// One example of the behavior spec (spec/*.md) played on the core in a flavor, throwing where it
// doesn't do what the example draws: for the spec's tests, and for the SxS, whose heatmap has ourus.

import assert from 'node:assert/strict';
import { Config } from '../src/config.ts';
import { OutlineState } from '../src/outline/index.ts';
import { drawOutline, drawState, drawText, readDrawing, readText } from './drawing.ts';
import { isAction, play, type Played } from './player.ts';
import { CLIPBOARD_TYPES, specConfig, type Clipboard, type ClipboardType, type SpecTest } from './specfile.ts';

/** A `result` key's form of the last action's outcome. */
export function outcome(state: Played): string {
  const r = state.last;
  if (!r) return 'none (the last action is not an ourus command)';
  return r.status === 'rejected' ? `rejected ${r.reason}` : r.status;
}

/** A clipboard with its formats in one order (`CLIPBOARD_TYPES`'), whatever order a case wrote them in: a key to compare by. */
export const canonicalClipboard = (clipboard: Clipboard): Clipboard =>
  Object.fromEntries(CLIPBOARD_TYPES.filter((type) => clipboard[type] !== undefined).map((type) => [type, clipboard[type]!]));

/** A drawn clipboard's texts, as the player holds them, in `canonicalClipboard`'s order. */
export const readClipboard = (drawn: Clipboard | undefined): Clipboard =>
  canonicalClipboard(Object.fromEntries(Object.entries(drawn ?? {}).map(([type, text]) => [type, readText(text)])));

/** The formats `drawn` names, in `clipboard` drawn as the spec draws them (null where it has none). */
const drawnAs = (clipboard: Clipboard, drawn: Clipboard): Record<string, string | null> =>
  Object.fromEntries(Object.keys(drawn).map((type) => [type, clipboard[type as ClipboardType] === undefined ? null : drawText(clipboard[type as ClipboardType]!)]));

// a drawn selection without a caret glyph is forward
export const normalize = (drawn: string): string => drawn.replace(/»┃/g, '»');

/** The flavors an example runs in: the one it names, or all (most behavior doesn't depend on it). */
export const flavorsOf = (t: SpecTest): readonly Config['flavor'][] => (t.options.flavor ? [t.options.flavor as Config['flavor']] : Config.values.flavor);

/** Plays example `t` in `flavor`, asserting each step's buffer, clipboard and result as drawn. */
export function run(t: SpecTest, flavor: Config['flavor']): void {
  const start = readDrawing(t.initial.buffer);
  let state: Played = {
    doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: { flavor, ...specConfig(t.options) } }),
    selection: start.selection,
    clipboard: readClipboard(t.initial.clipboard),
  };
  if (t.initial.outline !== undefined) assert.equal(drawOutline(state.doc), t.initial.outline, `${t.file}:${t.line} (${flavor}): the start's outline`);
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
    if (clipboard !== undefined) assert.deepEqual(drawnAs(state.clipboard, clipboard), clipboard, `${at}: clipboard`);
    if (step.expect.outline !== undefined) assert.equal(drawOutline(state.doc), step.expect.outline, `${at}: outline`);
  }
}

/**
 * What the core does in example `t`, in `flavor`, with `config` over the example's options: each
 * step's buffer drawn, as the example would draw it (no checks), and the clipboard's text after it
 * (a copy's). For the SxS, to tell whether an app's own option values change the example's outcome.
 */
export function drawnSteps(t: SpecTest, flavor: Config['flavor'], config: Partial<Config> = {}): { buffer: string; clipboard?: string }[] {
  const start = readDrawing(t.initial.buffer);
  let state: Played = {
    doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: { flavor, ...specConfig(t.options), ...config } }),
    selection: start.selection,
    clipboard: readClipboard(t.initial.clipboard),
  };
  return t.steps.map((step) => {
    state = play(state, step.actions);
    const text = state.clipboard['text/plain'];
    return { buffer: normalize(drawState(state.doc.text, state.selection, state.doc.placeholders)), ...(text !== undefined && { clipboard: text }) };
  });
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
