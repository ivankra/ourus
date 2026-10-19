// Spec tests adapted to one app: which can run there, and what each becomes. A test runs when every
// action has a key (or an emulation) in the app, its options are ones the app has, its tags are none
// the app skips, and its buffers are something the app holds: for a block app, they project onto
// blocks (block.ts); for a text editor, they are taken as written (text.ts). Otherwise it is
// skipped, with the reason.

import { readdirSync, readFileSync } from 'node:fs';
import { Config } from '../../src/config.ts';
import { readText } from '../../test/drawing.ts';
import { drawnSteps } from '../../test/spec-run.ts';
import { readSpec, slug, specConfig, type SpecTest } from '../../test/specfile.ts';
import type { Doc, Driver } from './driver.ts';
import { draw, project, sameOutline, Unsupported, type Outline } from './block.ts';
import { readTextDoc } from './text.ts';

export interface PlanStep {
  /** Line of the step's quote in the spec file. */
  readonly line: number;
  readonly actions: readonly string[];
  /** The expected state, as the app's model has it (projected onto blocks, or as text); null when the step draws no buffer. */
  readonly want: Doc | null;
  /** The spec's own drawing of it. */
  readonly drawn?: string;
  /** Why the expected caret isn't compared (it has no place in a block). */
  readonly caretLost?: string;
  /** Which of the expected blocks are headings owning a section (`sectioned` in block.ts). */
  readonly sections?: readonly number[];
  /** The expected clipboard. */
  readonly clipboard?: string;
}

export interface Plan {
  readonly test: SpecTest;
  /** `indent.md › Indent1`. */
  readonly name: string;
  readonly initial: Doc;
  readonly clipboard: string | null;
  readonly steps: readonly PlanStep[];
  /** What the projection adapted; empty for an original outline, and for a text app's examples. */
  readonly notes: readonly string[];
  /** The app's settings it runs with (`Driver.settings`): its options, or ourus's defaults. */
  readonly settings: Partial<Config>;
  /** The same for tests that adapt to the same plan, which then run once. */
  readonly key: string;
}

export type Adapted = { plan: Plan } | { skip: string };

/** Options the spec has besides ourus's config. */
const SPEC_ONLY = new Set(['status', 'flavor']);
const isMotion = (a: string): boolean => /^(?:cursor|select)(?:CharLeft|CharRight|LineUp|LineDown|LineBoundaryBackward|LineBoundaryForward|DocStart|DocEnd)$/.test(a);

/** Whether the app can play an action. */
export function playable(driver: Driver, action: string): boolean {
  if (/^"[^"]*"$/.test(action)) return true;
  if (action === 'pasteStructured' || action === 'pastePlain') return action in driver.keys;
  return action in driver.keys || !!driver.emulated?.includes(action);
}

/**
 * How a test is adapted: `ignoreOptions` plays the tests an option would skip (a value the app lacks,
 * or one it has its own of), each against ourus with its options, to check what a driver declares
 * (`run.ts --ignore-options`).
 */
export interface AdaptOptions {
  readonly ignoreOptions?: boolean;
}

export function adapt(driver: Driver, test: SpecTest, opts: AdaptOptions = {}): Adapted {
  const name = `${test.file} › ${test.name}`;
  const skip = (why: string): Adapted => ({ skip: why });
  // a `free-form` case, projected onto blocks, tests something else or nothing: no block app runs it
  // but one that tells a free block from an item (`Driver.freeForm`)
  const tag = test.tags.find((t) => (driver.model === 'block' && !driver.freeForm && t === 'free-form') || driver.refuses?.includes(t));
  if (tag) return skip(`tag ${tag}`);
  for (const [key, value] of opts.ignoreOptions ? [] : Object.entries(test.options)) {
    if (SPEC_ONLY.has(key)) continue;
    // the marker ourus writes for an item, which a block has none of
    if (key === 'bullet' && driver.model === 'block') continue;
    const k = key as keyof Config;
    const settable = driver.settings?.[k]?.some((v) => String(v) === value);
    if (!settable && value !== String(Config.defaults[k]) && String(driver.behaves?.[k]) !== value) return skip(`option ${key}: ${value}`);
  }
  const options = specConfig(test.options);
  const settings = Object.fromEntries(Object.keys(driver.settings ?? {}).map((k) => [k, options[k as keyof Config] ?? Config.defaults[k as keyof Config]])) as Partial<Config>;
  for (const s of test.steps) for (const a of s.actions) if (!playable(driver, a)) return skip(`action ${isMotion(a) || /^[a-z]/i.test(a) ? a : 'unknown'}`);
  // an option the app has another value of, and can't be set to the example's: where that value
  // changes what ourus does in the example, the app differs by its option, which the spec draws in a
  // case of its own (Enter3b for Enter3)
  const flavor = (test.options.flavor ?? 'gfm') as Config['flavor'];
  const theirs = opts.ignoreOptions ? [] : Object.entries(driver.behaves ?? {}).filter(([k, v]) => v !== undefined && !(k in (driver.settings ?? {})) && String(v) !== String(options[k as keyof Config] ?? Config.defaults[k as keyof Config]));
  if (theirs.length) {
    const ours = drawnSteps(test, flavor).join('\n');
    const by = theirs.find(([k, v]) => drawnSteps(test, flavor, { [k]: v }).join('\n') !== ours);
    if (by) return skip(`option ${by[0]}: the app's ${by[1]}`);
  }
  const clipboard = test.initial.clipboard !== undefined ? readText(test.initial.clipboard) : null;
  if (driver.model === 'text') return adaptText(driver, test, name, clipboard, settings);
  // ourus's document end is past the last line ending, on an empty line no block has: what is typed
  // or moved from there differs from the end of the last block by construction, so it only may leave
  const actions = test.steps.flatMap((s) => s.actions);
  for (let i = 0; i < actions.length; i++) {
    if (/^(?:cursor|select)DocEnd$/.test(actions[i]!) && i + 1 < actions.length && actions[i + 1] !== 'cursorDocStart') return skip(`${actions[i + 1]} after ${actions[i]}`);
  }
  const notes = new Set<string>();
  const refused = (n: Set<string>): string | undefined => driver.refuses?.find((r) => n.has(r));
  try {
    const start = project(test.initial.buffer, flavor, { ordered: driver.ordered, freeForm: driver.freeForm });
    if (start.caretLost) return skip(start.caretLost);
    const no = refused(start.notes) ?? driver.holds?.(start.outline);
    if (no) return skip(no);
    start.notes.forEach((n) => notes.add(n));
    const steps: PlanStep[] = [];
    let prev: { outline: Outline; drawn: string } | null = { outline: start.outline, drawn: test.initial.buffer };
    let meaningful = false;
    for (const s of test.steps) {
      const clipboard = s.expect.clipboard !== undefined ? readText(s.expect.clipboard) : undefined;
      if (s.expect.buffer === undefined) {
        steps.push({ line: s.line, actions: s.actions, want: null, ...(clipboard !== undefined && { clipboard }) });
        if (clipboard !== undefined) meaningful = true;
        prev = null;
        continue;
      }
      const p = project(s.expect.buffer, flavor, { ordered: driver.ordered, freeForm: driver.freeForm });
      const no = refused(p.notes);
      if (no) return skip(`${no} (expected)`);
      p.notes.forEach((n) => notes.add(n));
      // a step whose buffer changed only in what blocks can't show (blank lines, markers) tests nothing here
      const lost = prev && prev.drawn !== s.expect.buffer && sameOutline(prev.outline, p.outline) && !p.caretLost;
      if (!lost || clipboard !== undefined) meaningful = true;
      steps.push({ line: s.line, actions: s.actions, want: p.outline, drawn: s.expect.buffer, ...(p.caretLost && { caretLost: p.caretLost }), ...(p.sections.length && { sections: p.sections }), ...(clipboard !== undefined && { clipboard }) });
      prev = { outline: p.outline, drawn: s.expect.buffer };
    }
    if (!steps.some((s) => s.want || s.clipboard !== undefined)) return skip('nothing to compare');
    if (!meaningful) return skip('changes only what blocks can\'t show');
    // the same for the blocks the app is given: an adapted start can be where the app's option acts
    // though the Markdown isn't (a paragraph's list its children, so Enter mid-paragraph splits a
    // block with children: E9 and `enterMidItem`), so ourus plays the start as drawn, items, both ways
    if (theirs.length && start.notes.size && !driver.freeForm) {
      const asBlocks: SpecTest = { ...test, initial: { ...test.initial, buffer: draw(start.outline, { ordered: driver.ordered }) } };
      const played = (config?: Partial<Config>): string | null => {
        try {
          return drawnSteps(asBlocks, flavor, config).join('\n');
        } catch {
          return null;
        }
      };
      const ours = played();
      const by = ours === null ? undefined : theirs.find(([k, v]) => played({ [k]: v }) !== ours);
      if (by) return skip(`option ${by[0]}: the app's ${by[1]}, as blocks`);
    }
    const key = JSON.stringify([start.outline, clipboard, steps.map((s) => [s.actions, s.want, s.clipboard]), settings]);
    return { plan: { test, name, initial: start.outline, clipboard, steps, notes: [...notes].sort(), settings, key } };
  } catch (e) {
    if (e instanceof Unsupported) return skip(e.message);
    throw e;
  }
}

/** A text app's plan: every buffer as written, the caret where drawn. */
function adaptText(driver: Driver, test: SpecTest, name: string, clipboard: string | null, settings: Partial<Config>): Adapted {
  const initial = readTextDoc(test.initial.buffer);
  const no = driver.holds?.(initial);
  if (no) return { skip: no };
  const steps: PlanStep[] = test.steps.map((s) => {
    const clip = s.expect.clipboard !== undefined ? readText(s.expect.clipboard) : undefined;
    const want = s.expect.buffer !== undefined ? readTextDoc(s.expect.buffer) : null;
    return { line: s.line, actions: s.actions, want, ...(s.expect.buffer !== undefined && { drawn: s.expect.buffer }), ...(clip !== undefined && { clipboard: clip }) };
  });
  if (!steps.some((s) => s.want || s.clipboard !== undefined)) return { skip: 'nothing to compare' };
  const key = JSON.stringify([initial, clipboard, steps.map((s) => [s.actions, s.want, s.clipboard]), settings]);
  return { plan: { test, name, initial, clipboard, steps, notes: [], settings, key } };
}

// ------------------------------------------------------------------ choosing tests

const specDir = new URL('../../spec/', import.meta.url);

/** Every test of the spec (spec/*.md but its README). */
export function allTests(): SpecTest[] {
  return readdirSync(specDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .flatMap((f) => readSpec(f, readFileSync(new URL(f, specDir), 'utf8')));
}

/**
 * Whether a test is one a selector names: a file (`indent.md`, or `indent`), a test by its anchor
 * (`indent.md#indent3`), or any part of its full name (`Indent3`, `indent.md › Indent`).
 */
export function selects(selector: string, t: SpecTest): boolean {
  const anchor = slug(t.name.split(' › ').pop()!);
  const hash = selector.indexOf('#');
  if (hash >= 0) {
    const file = selector.slice(0, hash);
    return (file === '' || t.file === file || t.file === `${file}.md`) && anchor === selector.slice(hash + 1).toLowerCase();
  }
  return t.file === selector || t.file === `${selector}.md` || `${t.file} › ${t.name}`.includes(selector);
}
