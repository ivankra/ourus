// Spec tests adapted to one app: which can run there, and what each becomes. A test runs when every
// action has a key (or an emulation) in the app, its options are ones the app has, its tags are none
// the app skips, and its buffers are something the app holds: for a block app, they project onto
// blocks (block.ts); for a text editor, they are taken as written (text.ts). Otherwise it is
// skipped, with the reason.

import { readdirSync, readFileSync } from 'node:fs';
import { Config } from '../../src/config.ts';
import { drawsCaret, readText, withoutCaret } from '../../test/drawing.ts';
import { isDrop } from '../../test/player.ts';
import { drawnSteps, readClipboard, rowView, startOf, type RowView } from '../../test/spec-run.ts';
import { readSpec, slug, specConfig, type Clipboard, type SpecTest } from '../../test/specfile.ts';
import type { Doc, Driver, Drop } from './driver.ts';
import { inBlocks, resolveDrop } from './drag.ts';
import { draw, project, sameOutline, Unsupported, type Outline } from './block.ts';
import { readTextDoc } from './text.ts';
import { inBlockRows } from './view.ts';

/** A case's view as ourus plays it: at its start, and after each step with its buffer. */
interface Views {
  readonly start: RowView;
  readonly steps: readonly { readonly view: RowView; readonly buffer: string }[];
}

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
  /** The expected clipboard's text: the harness reads an app's `text/plain` only. */
  readonly clipboard?: string;
}

export interface Plan {
  readonly test: SpecTest;
  /** Its ID, `Indent1` (unique across the spec). */
  readonly name: string;
  readonly initial: Doc;
  /** The clipboard it starts with, every format the case gives the apps. */
  readonly clipboard: Clipboard | null;
  readonly steps: readonly PlanStep[];
  /** What the projection adapted; empty for an original outline, and for a text app's examples. */
  readonly notes: readonly string[];
  /** The app's settings it runs with (`Driver.settings`): its options, or ourus's defaults. */
  readonly settings: Partial<Config>;
  /** The same for tests that adapt to the same plan, which then run once. */
  readonly key: string;
  /** Its drop, as rows (`resolveDrop`), where it makes one. */
  readonly drop?: Drop;
}

export type Adapted = { plan: Plan } | { skip: string };


const isMotion = (a: string): boolean => /^(?:cursor|select)(?:CharLeft|CharRight|LineUp|LineDown|LineBoundaryBackward|LineBoundaryForward|DocStart|DocEnd)$/.test(a);

/** Whether the app can play an action. */
export function playable(driver: Driver, action: string): boolean {
  if (/^"[^"]*"$/.test(action)) return true;
  // a drop: a gesture the driver plays (`Driver.drop`), by its action (`moveSubtree ②` is a `moveSubtree`)
  if (isDrop(action)) return !!driver.drop && !!driver.drops?.includes(action.split(' ')[0] as Drop['action']);
  if (action === 'paste' || action === 'pastePlain') return action in driver.keys;
  return action in driver.keys || !!driver.emulated?.includes(action);
}

/**
 * How a test is adapted: `ignoreOptions` plays the tests an option would skip (a value the app lacks,
 * or one it has its own of), each against ourus with its options, to check what a driver declares
 * (`run.ts --ignore-options`).
 */
export interface AdaptOptions {
  readonly ignoreOptions?: boolean;
  /** The clipboard's text alone, its HTML dropped (`run.ts --plain-clipboard`): what the app is given, and what its run records. */
  readonly plainClipboard?: boolean;
}

export function adapt(driver: Driver, test: SpecTest, opts: AdaptOptions = {}): Adapted {
  const name = test.name;
  const skip = (why: string): Adapted => ({ skip: why });
  // a `free-form` case, projected onto blocks, tests something else or nothing: no block app runs it
  // but one that tells a free block from an item (`Driver.freeForm`)
  const tag = test.tags.find((t) => (driver.model === 'block' && !driver.freeForm && t === 'free-form') || driver.refuses?.includes(t));
  if (tag) return skip(`tag ${tag}`);
  // folds or a zoom, at the start or after a step: only where the app has them
  // and the driver loads and reads them (`Driver.folds`, `Driver.zooms`), never played without them
  if ((test.view.folded !== undefined || test.steps.some((s) => s.expect.folded !== undefined)) && !driver.folds) return skip('no folds');
  if ((test.view.zoom !== undefined || test.steps.some((s) => s.expect.zoom !== undefined)) && !driver.zooms) return skip('no zoom');
  for (const [key, value] of opts.ignoreOptions ? [] : Object.entries(test.options)) {
    // the flavor the case is read in, which an app has no setting for
    if (key === 'flavor') continue;
    // the marker ourus writes for an item, which a block has none of
    if (key === 'bullet' && driver.model === 'block') continue;
    const k = key as keyof Config;
    const settable = driver.settings?.[k]?.some((v) => String(v) === value);
    if (!settable && value !== String(Config.defaults[k]) && String(driver.behaves?.[k]) !== value) return skip(`option ${key}: ${value}`);
  }
  const options = specConfig(test.options);
  const settings = Object.fromEntries(Object.keys(driver.settings ?? {}).map((k) => [k, options[k as keyof Config] ?? Config.defaults[k as keyof Config]])) as Partial<Config>;
  for (const s of test.steps) for (const a of s.actions) if (!playable(driver, a)) return skip(`action ${isMotion(a) || /^[a-z]/i.test(a) ? a : 'unknown'}`);
  // options the app has other values of, and can't be set to the example's: where they change what
  // ourus does in the example, the app is judged against ourus with them, the example replayed so
  // (`under <option>: <value>` among what was adapted), rather than the example's drawings
  const flavor = (test.options.flavor ?? Config.defaults.flavor) as Config['flavor'];
  let theirs = opts.ignoreOptions ? [] : Object.entries(driver.behaves ?? {}).filter(([k, v]) => v !== undefined && !(k in (driver.settings ?? {})) && String(v) !== String(options[k as keyof Config] ?? Config.defaults[k as keyof Config]));
  // a copy or cut at a caret (a step's first action), which ourus takes as the node's and an app that
  // copies nothing there (`copyAtCaret: host`) can take as it takes a selected block, its subtree:
  // played on the node selected the app's way (`selectSubtree`), and judged against ourus's copy
  let played: (readonly string[])[] = test.steps.map((s) => s.actions);
  const copies = test.steps.some((s) => s.actions[0] === 'copy' || s.actions[0] === 'cut');
  if (copies && theirs.some(([k, v]) => k === 'copyAtCaret' && v === 'host') && playable(driver, 'selectSubtree')) {
    const before = [test.initial.buffer, ...drawnSteps(test, flavor).map((s) => s.buffer)];
    played = test.steps.map((s, i) => ((s.actions[0] === 'copy' || s.actions[0] === 'cut') && !before[i]!.includes('«') ? ['selectSubtree', ...s.actions] : s.actions));
    if (played.some((a, i) => a !== test.steps[i]!.actions)) theirs = theirs.filter(([k]) => k !== 'copyAtCaret');
  }
  // each step's buffer, and where the step checks one, its clipboard's text: what an option can change
  let replayed: (string | undefined)[] | null = null;
  let replayedClipboards: (string | undefined)[] | null = null;
  const under: string[] = [];
  if (theirs.length) {
    const outcome = (config?: Partial<Config>): string => JSON.stringify(drawnSteps(test, flavor, config).map((s, i) => [s.buffer, test.steps[i]!.expect.clipboard ? (s.clipboard ?? null) : null]));
    const ours = outcome();
    const values = Object.fromEntries(theirs) as Partial<Config>;
    let theirsPlayed: { buffer: string; clipboard?: string }[];
    try {
      theirsPlayed = drawnSteps(test, flavor, values);
    } catch {
      return skip(`option ${theirs[0]![0]}: the app's ${theirs[0]![1]}, not replayable`);
    }
    if (outcome(values) !== ours) {
      const alone = theirs.filter(([k, v]) => outcome({ [k]: v }) !== ours);
      for (const [k, v] of alone.length ? alone : theirs) under.push(`under ${k}: ${v}`);
      replayed = test.steps.map((step, i) => (step.expect.buffer === undefined ? undefined : theirsPlayed[i]!.buffer));
      // a clipboard ourus doesn't write under them (the host's copy, at a caret) has nothing to compare
      replayedClipboards = test.steps.map((step, i) => (step.expect.clipboard === undefined ? undefined : theirsPlayed[i]!.clipboard));
    }
  }
  /** The clipboard's text a step checks: as drawn, or as ourus replays it under the app's values. */
  const clipboardAfter = (i: number): string | undefined => {
    const drawn = test.steps[i]!.expect.clipboard?.['text/plain'];
    if (replayedClipboards) return replayedClipboards[i];
    return drawn !== undefined ? readText(drawn) : undefined;
  };
  const given = test.initial.clipboard !== undefined ? readClipboard(test.initial.clipboard) : null;
  const clipboard = given && opts.plainClipboard ? { 'text/plain': given['text/plain'] } : given;
  // a clipboard checked after a step: its text, which is what the harness reads back
  const unread = [...new Set(test.steps.flatMap((s) => Object.keys(s.expect.clipboard ?? {}).filter((type) => type !== 'text/plain')))];
  if (unread.length) under.push(`clipboard's ${unread.join(', ')} not compared`);
  if (played.some((a, i) => a !== test.steps[i]!.actions)) under.push('the node at the caret selected (selectSubtree)');
  // a case with a view: its start's and each step's, as ourus plays it (under the app's values where
  // those change the case), every step's checked, one that draws no buffer on ourus's without its caret
  let views: Views | null = null;
  if (test.view.folded !== undefined || test.view.zoom !== undefined || test.steps.some((s) => s.expect.folded !== undefined || s.expect.zoom !== undefined)) {
    const values = (replayed ? Object.fromEntries(theirs) : {}) as Partial<Config>;
    try {
      views = { start: rowView(startOf(test, flavor, values).doc), steps: drawnSteps(test, flavor, values) };
    } catch {
      return skip('its view, not replayable');
    }
  }
  if (driver.model === 'text') return adaptText(driver, test, name, clipboard, settings, replayed, under, clipboardAfter, played, views);
  // ourus's document end is past the last line ending, on an empty line no block has: what is typed
  // or moved from there differs from the end of the last block by construction, so it only may leave
  // (a step that only needs the caret to leave draws none: Placeholder9)
  const actions = test.steps.flatMap((s) => s.actions);
  for (let i = 0; i < actions.length; i++) {
    if (/^(?:cursor|select)DocEnd$/.test(actions[i]!) && i + 1 < actions.length && actions[i + 1] !== 'cursorDocStart') return skip(`${actions[i + 1]} after ${actions[i]}`);
  }
  const notes = new Set<string>(under);
  const refused = (n: Set<string>): string | undefined => driver.refuses?.find((r) => n.has(r));
  try {
    const config = specConfig(test.options);
    // what the app's blocks hold, as the projection reads it
    const shape = { ordered: driver.ordered, freeForm: driver.freeForm, paragraphsInBlock: driver.paragraphsInBlock, quotes: driver.behaves?.quotes, listParent: driver.behaves?.listParent, blockSelection: driver.selectsBlocks };
    const start = project(test.initial.buffer, flavor, { ...shape, config });
    if (start.caretLost) return skip(start.caretLost);
    // (its view first, which the app may not hold either)
    if (views) {
      const view = inBlockRows(views.start, start.rows ?? new Map());
      if (!view) return skip('its view: a row no block holds');
      start.outline.view = view;
    }
    const no = refused(start.notes) ?? driver.holds?.(start.outline);
    if (no) return skip(no);
    // a drop, resolved from where the case starts, its rows the blocks they became
    let drop: Drop | undefined;
    if (test.steps.some((s) => s.actions.some(isDrop))) {
      const resolved = resolveDrop(test, flavor);
      const blocks = typeof resolved === 'string' ? resolved : inBlocks(resolved, start.rows ?? new Map(), start.outline);
      if (typeof blocks === 'string') return skip(`drop: ${blocks}`);
      drop = blocks;
    }
    start.notes.forEach((n) => notes.add(n));
    // an adapted start is another document than the example's (`Notes⏎⏎more`, a paragraph each, is
    // `- Notes⏎- more` to the app): where its blocks drawn as items read back as the same blocks, the
    // same headings owning sections, the app is judged against ourus on those items, under its values
    // (`as blocks`), not against the example's drawings; not on an empty document, an app's empty page
    // being one, its empty block no item. Else (a heading's section, a thematic break, a link reference
    // definition, which items don't spell) the drawings, projected
    if (start.notes.size && !driver.freeForm && !start.notes.has('empty document')) {
      // (a view's labels name the drawn start's nodes, not the items')
      if (views) return skip('its view, on an adapted start');
      const items = draw(start.outline, { ordered: driver.ordered });
      const back = project(items, flavor, { ...shape, config });
      if (sameOutline(back.outline, start.outline) && String(back.sections) === String(start.sections)) {
        try {
          const onItems = drawnSteps({ ...test, initial: { ...test.initial, buffer: items } }, flavor, Object.fromEntries(theirs) as Partial<Config>);
          replayed = test.steps.map((step, i) => (step.expect.buffer === undefined ? undefined : onItems[i]!.buffer));
          notes.add('as blocks');
        } catch {
          // (not replayable on items: the drawings, projected)
        }
      }
    }
    const steps: PlanStep[] = [];
    let prev: { outline: Outline; drawn: string } | null = { outline: start.outline, drawn: test.initial.buffer };
    let meaningful = false;
    for (const [i, s] of test.steps.entries()) {
      const clipboard = clipboardAfter(i);
      // the step's buffer as drawn, or as ourus replays it under the app's values; with a view and none
      // drawn, ourus's, its caret not compared
      const buffer = (replayed ? replayed[i] : s.expect.buffer) ?? (views ? withoutCaret(views.steps[i]!.buffer) : undefined);
      if (buffer === undefined) {
        steps.push({ line: s.line, actions: played[i]!, want: null, ...(clipboard !== undefined && { clipboard }) });
        if (clipboard !== undefined) meaningful = true;
        prev = null;
        continue;
      }
      const p = project(caretAsDrawn(buffer, s.expect.buffer), flavor, { ...shape, config: { ...config, ...(replayed ? Object.fromEntries(theirs) : {}) } });
      const no = refused(p.notes);
      if (no) return skip(`${no} (expected)`);
      if (views) {
        const view = inBlockRows(views.steps[i]!.view, p.rows ?? new Map());
        if (!view) return skip('its view: a row no block holds (expected)');
        p.outline.view = view;
      }
      p.notes.forEach((n) => notes.add(n));
      // a step whose buffer changed only in what blocks can't show (blank lines, markers) tests nothing here
      const lost = prev && prev.drawn !== buffer && sameOutline(prev.outline, p.outline) && !p.caretLost;
      if (!lost || clipboard !== undefined) meaningful = true;
      steps.push({ line: s.line, actions: played[i]!, want: p.outline, drawn: buffer, ...(p.caretLost && { caretLost: p.caretLost }), ...(p.sections.length && { sections: p.sections }), ...(clipboard !== undefined && { clipboard }) });
      prev = { outline: p.outline, drawn: buffer };
    }
    if (!steps.some((s) => s.want || s.clipboard !== undefined)) return skip('nothing to compare');
    if (!meaningful) return skip('changes only what blocks can\'t show');
    // the same for the blocks the app is given: an adapted start can be where the app's option acts
    // though the Markdown isn't (a paragraph's list its children, so Enter mid-paragraph splits a
    // block with children: E9 and `enterMidItem`), so ourus plays the start as drawn, items, both ways
    if (theirs.length && !replayed && start.notes.size && !driver.freeForm) {
      const asBlocks: SpecTest = { ...test, initial: { ...test.initial, buffer: draw(start.outline, { ordered: driver.ordered }) } };
      const played = (config?: Partial<Config>): string | null => {
        try {
          return JSON.stringify(drawnSteps(asBlocks, flavor, config));
        } catch {
          return null;
        }
      };
      const ours = played();
      const by = ours === null ? undefined : theirs.find(([k, v]) => played({ [k]: v }) !== ours);
      if (by) return skip(`option ${by[0]}: the app's ${by[1]}, as blocks`);
    }
    const key = JSON.stringify([start.outline, clipboard, steps.map((s) => [s.actions, s.want, s.clipboard]), settings, ...(drop ? [drop] : [])]);
    return { plan: { test, name, initial: start.outline, clipboard, steps, notes: [...notes].sort(), settings, key, ...(drop && { drop }) } };
  } catch (e) {
    if (e instanceof Unsupported) return skip(e.message);
    throw e;
  }
}

/**
 * A step's buffer (as drawn, or as ourus replays it) with the caret where the step's drawing has
 * one: a drawing without one doesn't check it, and neither does the app's judgment.
 */
const caretAsDrawn = (buffer: string, drawn: string | undefined): string => (drawn !== undefined && !drawsCaret(drawn) ? withoutCaret(buffer) : buffer);

/** A text app's plan: every buffer as written, the caret where drawn. */
function adaptText(driver: Driver, test: SpecTest, name: string, clipboard: Clipboard | null, settings: Partial<Config>, replayed: (string | undefined)[] | null, under: readonly string[], clipboardAfter: (i: number) => string | undefined, played: readonly (readonly string[])[], views: Views | null): Adapted {
  const initial = { ...readTextDoc(test.initial.buffer), ...(views && { view: views.start }) };
  const no = driver.holds?.(initial);
  if (no) return { skip: no };
  const steps: PlanStep[] = test.steps.map((s, i) => {
    const clip = clipboardAfter(i);
    // as drawn, or as ourus replays it under the app's values; with a view and none drawn, ourus's, its
    // caret not compared
    const buffer = (replayed ? replayed[i] : s.expect.buffer) ?? (views ? withoutCaret(views.steps[i]!.buffer) : undefined);
    const want = buffer !== undefined ? { ...readTextDoc(caretAsDrawn(buffer, s.expect.buffer)), ...(views && { view: views.steps[i]!.view }) } : null;
    return { line: s.line, actions: played[i]!, want, ...(buffer !== undefined && { drawn: buffer }), ...(clip !== undefined && { clipboard: clip }) };
  });
  if (!steps.some((s) => s.want || s.clipboard !== undefined)) return { skip: 'nothing to compare' };
  // a drop, resolved from where the case starts: rows the driver finds on screen
  let drop: Drop | undefined;
  if (test.steps.some((s) => s.actions.some(isDrop))) {
    const resolved = resolveDrop(test, (test.options.flavor ?? Config.defaults.flavor) as Config['flavor']);
    if (typeof resolved === 'string') return { skip: `drop: ${resolved}` };
    drop = resolved;
  }
  const key = JSON.stringify([initial, clipboard, steps.map((s) => [s.actions, s.want, s.clipboard]), settings, ...(drop ? [drop] : [])]);
  return { plan: { test, name, initial, clipboard, steps, notes: [...under], settings, key, ...(drop && { drop }) } };
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

/** The spec file a case's ID is in (IDs are unique across the spec), or `?` for one it no longer has (an old run's). */
let files: Map<string, string> | null = null;
export function fileOf(id: string): string {
  files ??= new Map(allTests().map((t) => [t.name, t.file]));
  return files.get(id) ?? '?';
}

/**
 * Whether a test is one a selector names: a file (`indent.md`, or `indent`), a test by its anchor
 * (`indent.md#indent3`), or any part of its ID (`Indent3`, `Indent`).
 */
export function selects(selector: string, t: SpecTest): boolean {
  const anchor = slug(t.name);
  const hash = selector.indexOf('#');
  if (hash >= 0) {
    const file = selector.slice(0, hash);
    return (file === '' || t.file === file || t.file === `${file}.md`) && anchor === selector.slice(hash + 1).toLowerCase();
  }
  return t.file === selector || t.file === `${selector}.md` || t.name.includes(selector);
}
