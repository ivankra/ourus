// One example of the behavior spec (spec/*.md) played on the core in a flavor, throwing where it
// doesn't do what the example draws: for the spec's tests, and for the SxS, whose heatmap has ourus.

import assert from 'node:assert/strict';
import { executeCommand, type DropMap, type OurusSelection } from '../src/commands/index.ts';
import { OurusConfig } from '../src/config.ts';
import type { OurusDoc, OurusNode } from '../src/doc/index.ts';
import { visibleSelection } from '../src/commands/view.ts';
import { docOf, drawDoc, drawnSelection, drawOutline, drawsCaret, drawText, labelGlyph, labelNumber, nodesOf, readDrawing, readLabels, readText, withoutCaret } from './drawing.ts';
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

// a drawn selection without a caret glyph is forward; `␠` is a space, drawn where one would be hard to see
export const normalize = (drawn: string): string => drawn.replace(/»┃/g, '»').replace(/␠/g, ' ');

/** The flavors an example runs in: the one it names, or all (most behavior doesn't depend on it). */
export const flavorsOf = (t: SpecTest): readonly OurusConfig['flavor'][] => (t.options.flavor ? [t.options.flavor as OurusConfig['flavor']] : OurusConfig.values.flavor);

/** The nodes that start on line `i` of `doc`, the outermost first. */
const startingOn = (doc: OurusDoc, i: number): OurusNode[] => nodesOf(doc).filter((n) => n.startLine === i).sort((a, b) => a.depth - b.depth);

/**
 * A case's node labels (`①`, spec/README.md), bound to ids as its steps go: a start's label names the
 * node there; a step's names the node with the id bound to it, or, new, one the step made (its id at
 * least the document's next id before the step), bound then. One label on a line names the innermost
 * node starting there, a second before it the one outside it.
 */
export class Labels {
  readonly #bound = new Map<number, number>();

  /** The labels a drawing has (`readLabels`), checked against `doc` and bound; `before`, the next id before the step (null at the start). A problem, or null. */
  check(doc: OurusDoc, labels: ReadonlyMap<number, readonly number[]>, before: number | null): string | null {
    for (const [line, own] of labels) {
      const nodes = startingOn(doc, line);
      if (nodes.length < own.length) return `line ${line + 1}: ${own.map(labelGlyph).join('')}, ${own.length} label${own.length > 1 ? 's' : ''} for ${nodes.length} node${nodes.length === 1 ? '' : 's'} starting there`;
      for (const [k, label] of own.entries()) {
        const node = nodes[nodes.length - own.length + k]!;
        const bound = this.#bound.get(label);
        if (bound !== undefined) {
          if (bound !== node.id) return `line ${line + 1}: ${labelGlyph(label)} is node ${bound}, and this is node ${node.id} (a ${node.kind})`;
          continue;
        }
        if ([...this.#bound.values()].includes(node.id)) return `line ${line + 1}: ${labelGlyph(label)} names a node another label has`;
        if (before !== null && node.id < before) return `line ${line + 1}: ${labelGlyph(label)}, new, names a node the step didn't make (node ${node.id}, a ${node.kind})`;
        this.#bound.set(label, node.id);
      }
    }
    return null;
  }

  /** The labels bound so far: each label's number to its node's id. */
  get ids(): ReadonlyMap<number, number> {
    return this.#bound;
  }

  /** The labels to draw on `doc`, by line (`drawLabels`): those of `only`, where their nodes are. */
  drawn(doc: OurusDoc, only: ReadonlySet<number>): Map<number, number[]> {
    const lines = new Map<number, { depth: number; label: number }[]>();
    for (const [label, id] of this.#bound) {
      if (!only.has(label)) continue;
      const node = doc.node(id);
      if (!node) continue;
      lines.set(node.startLine, [...(lines.get(node.startLine) ?? []), { depth: node.depth, label }]);
    }
    return new Map([...lines].map(([line, own]) => [line, own.sort((a, b) => a.depth - b.depth).map((l) => l.label)]));
  }
}

/** Where example `t` starts, in `flavor`, with `config` over the example's options. */
export function startOf(t: SpecTest, flavor: OurusConfig['flavor'], config: Partial<OurusConfig> = {}): Played {
  const start = readDrawing(t.initial.buffer);
  const doc = docOf(start.text, start.placeholders, { flavor, ...specConfig(t.options), ...config });
  // (the start's labels, for a drop that names one)
  const labels = new Labels();
  labels.check(doc, start.labels, null);
  const viewed = viewOf(t, doc, labels.ids);
  return { doc: viewed, selection: drawnSelection(viewed, start), clipboard: readClipboard(t.initial.clipboard), drop: start.drop, labels: labels.ids };
}

/** `doc`, a start of example `t`, with the view its config block gives (`folded:`, `zoom:`), by the start's labels (`labels`: a label's number to its node's id). */
export function viewOf(t: SpecTest, doc: OurusDoc, labels: ReadonlyMap<number, number>): OurusDoc {
  const ids = (drawn: string): number[] =>
    [...drawn.replace(/[\s,]/g, '')].map((glyph) => {
      const id = labels.get(labelNumber(glyph));
      if (id === undefined) throw new Error(`${t.file}:${t.line}: ${glyph}, in the view, labels no node in the start`);
      return id;
    });
  const folded = t.view.folded === undefined ? [] : ids(t.view.folded);
  const zoom = t.view.zoom === undefined ? null : ids(t.view.zoom)[0]!;
  const viewed = doc.withFolded(folded).withZoom(zoom);
  const unfolding = folded.filter((id) => !viewed.folded.has(id));
  if (unfolding.length) throw new Error(`${t.file}:${t.line}: folded: a node with nothing to fold (id ${unfolding.join(', ')})`);
  return viewed;
}

/**
 * The view after an action: the selection in no hidden line, every fold on a node
 * with something to hide, and, zoomed, an applied command keeping the zoom's invariant (which the
 * command checked itself: this checks the check). An undo and a redo, the host's, aren't checked.
 */
export function viewHolds(prior: OurusDoc, state: Played, at: string): void {
  const { doc, selection } = state;
  assert.deepEqual(visibleSelection(doc, selection), selection, `${at}: the selection is in hidden lines`);
  for (const id of doc.folded) assert.ok(doc.node(id) && doc.foldRange(doc.node(id)!), `${at}: node ${id} is folded with nothing to hide`);
  const last = state.last;
  if (prior.zoom === null || last?.status !== 'applied' || !last.changes.length) return;
  const removed = !last.doc.node(prior.zoom);
  assert.equal(prior.zoomEscape(last.doc, removed), null, `${at}: the result leaves the zoom`);
}

/** Plays example `t` in `flavor`, asserting each step's buffer, clipboard and result as drawn. */
export function run(t: SpecTest, flavor: OurusConfig['flavor']): void {
  let state = startOf(t, flavor);
  const labels = new Labels();
  const named = labels.check(state.doc, readDrawing(t.initial.buffer).labels, null);
  assert.equal(named, null, `${t.file}:${t.line} (${flavor}): the start's labels`);
  state = { ...state, labels: labels.ids };
  if (t.initial.outline !== undefined) assert.equal(drawOutline(state.doc), t.initial.outline, `${t.file}:${t.line} (${flavor}): the start's outline`);
  for (const step of t.steps) {
    const at = `${t.file}:${step.line} (${flavor})`;
    const unknown = step.actions.filter((a) => !isAction(a));
    assert.deepEqual(unknown, [], `${at}: unknown actions`);
    const before = state.doc.nextId;
    for (const action of step.actions) {
      const prior = state.doc;
      state = play(state, [action]);
      // write-failed is a bug, never an outcome: a later action can't hide one
      assert.ok(state.last?.status !== 'rejected' || state.last.reason !== 'write-failed', `${at}: ${action} failed to write${state.last?.status === 'rejected' && state.last.detail ? `: ${state.last.detail}` : ''}`);
      viewHolds(prior, state, `${at}: ${action}`);
    }
    const { clipboard, result } = step.expect;
    const why = state.last?.status === 'rejected' && state.last.detail ? ` (${state.last.reason}: ${state.last.detail})` : '';
    if (result !== undefined) assert.equal(outcome(state), result, `${at}: result${why}`);
    if (step.expect.buffer !== undefined) {
      const { drawn: buffer, labels: own } = readLabels(step.expect.buffer);
      // (a buffer that draws no caret doesn't check it)
      const got = drawsCaret(buffer) ? drawDoc(state.doc, state.selection) : withoutCaret(drawDoc(state.doc, state.selection));
      assert.equal(normalize(got), normalize(buffer), `${at}: buffer${why}`);
      assert.equal(labels.check(state.doc, own, before), null, `${at}: labels`);
    }
    if (clipboard !== undefined) assert.deepEqual(drawnAs(state.clipboard, clipboard), clipboard, `${at}: clipboard`);
    if (step.expect.outline !== undefined) assert.equal(drawOutline(state.doc), step.expect.outline, `${at}: outline`);
    // the view after the step, by label: a label it names is bound by now (the start's, or a buffer's)
    const glyphs = (ids: Iterable<number>): string => {
      const named = new Map([...labels.ids].map(([label, id]) => [id, label]));
      return [...ids].map((id) => (named.has(id) ? labelGlyph(named.get(id)!) : `node ${id}`)).sort().join(' ') || 'none';
    };
    if (step.expect.folded !== undefined) assert.equal(glyphs(state.doc.folded), step.expect.folded.trim().split(/[\s,]+/).sort().join(' '), `${at}: folded`);
    if (step.expect.zoom !== undefined) assert.equal(state.doc.zoom === null ? 'none' : glyphs([state.doc.zoom]), step.expect.zoom.trim(), `${at}: zoom`);
    const { dragNodes, dropPoints } = step.expect;
    if (dragNodes === undefined && dropPoints === undefined) continue;
    const dropMap = state.last?.status === 'applied' ? state.last.dropMap : undefined;
    assert.ok(dropMap, `${at}: dragNodes and dropPoints are a pickup's, and the last action picked up nothing (${outcome(state)})`);
    if (dragNodes !== undefined) {
      const named = new Map([...labels.ids].map(([label, id]) => [id, label]));
      assert.equal(dropMap.nodes.map((id) => (named.has(id) ? labelGlyph(named.get(id)!) : `node ${id}`)).join(' '), dragNodes.trim().split(/\s+/).join(' '), `${at}: dragNodes`);
    }
    if (dropPoints !== undefined) assert.equal(drawDropPoints(state.doc, dropMap, state.selection), readLabels(dropPoints).drawn.replace(/ +$/gm, ''), `${at}: dropPoints`);
  }
}

/**
 * The places a pickup offers, drawn (spec/drag.md): the buffer's lines, no caret, and in each gap
 * whose drop line has an accepted place a line of markers, right after the node above's last line, at
 * twice each place's depth: `▸` a place, `▹` the run's own, which a place sharing its column with it
 * doesn't show over. Each place's drop is run, and only those applied are drawn.
 */
export function drawDropPoints(doc: OurusDoc, dropMap: DropMap, selection: OurusSelection): string {
  const lines = doc.text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const markers = new Map<number, string>();
  for (const seam of dropMap.seams) {
    const accepted = seam.points.filter((point) => point.current || executeCommand(doc, point.drop, selection).status === 'applied');
    if (!accepted.length) continue;
    const row: string[] = [];
    for (const point of [...accepted].sort((a, b) => +a.current - +b.current)) {
      const column = point.depth * 2;
      while (row.length <= column) row.push(' ');
      row[column] = point.current ? '▹' : '▸';
    }
    markers.set(seam.beforeLine - seam.gapLines, row.join(''));
  }
  const out: string[] = [];
  for (let i = 0; i <= lines.length; i++) {
    if (markers.has(i)) out.push(markers.get(i)!);
    if (i < lines.length) out.push(drawText(lines[i]!));
  }
  return out.join('\n') + '\n';
}

/**
 * What the core does in example `t`, in `flavor`, with `config` over the example's options: each
 * step's buffer drawn, as the example would draw it (no checks), and the clipboard's text after it
 * (a copy's). For the SxS, to tell whether an app's own option values change the example's outcome.
 */
export function drawnSteps(t: SpecTest, flavor: OurusConfig['flavor'], config: Partial<OurusConfig> = {}): { buffer: string; clipboard?: string; view: RowView }[] {
  let state = startOf(t, flavor, config);
  return t.steps.map((step) => {
    state = play(state, step.actions);
    const text = state.clipboard['text/plain'];
    return { buffer: normalize(drawDoc(state.doc, state.selection)), ...(text !== undefined && { clipboard: text }), view: rowView(state.doc) };
  });
}

/** A view by rows, as an app shows it: the first lines of the nodes whose folds are in effect, and of the zoom root. */
export interface RowView {
  readonly folded: readonly number[];
  readonly zoom: number | null;
}

/** `doc`'s view by rows (`RowView`): its folds in effect (`zoomFolded`) and its zoom root, each by the line it starts on. */
export function rowView(doc: OurusDoc): RowView {
  const folded = [...new Set([...doc.zoomFolded].map((id) => doc.node(id)!.startLine))].sort((a, b) => a - b);
  return { folded, zoom: doc.zoom === null ? null : doc.node(doc.zoom)!.startLine };
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
