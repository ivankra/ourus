// The behavior spec played on the core with its documents indented with tabs, as Obsidian writes them
// (`sxs/lib/tabs.ts`, the Obsidian drivers' loading: a tab a nesting step, where `tabs.test.ts` puts
// one at each tab stop, so the two find different writer paths): each example's start loaded as tabs, and each
// step checked against the drawing by what it reads as: the outline, and where the selection's ends
// are in it. The spec draws spaces; this is the check that the writer's re-indentation holds where the
// document's indentation is tabs. Bytes aren't compared: with tabs the writer keeps a line's column
// relative to its item's where the spec draws it at the item's text (`> - b⏎>→  - c`, `> - b⏎>   - c`).
//
// Skipped: an example the tabs don't give back as written (`retabs`), or that reads as another
// outline with them (top-level indentation of two spaces is a tab, four columns: indented code, a lazy
// line); one whose steps move the caret by columns (Up, Down), which a tab is wider than its spaces in;
// a step left to the host, or drawing a placeholder.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OurusDoc, OutlineNode } from '../src/doc/index.ts';
import type { Config } from '../src/config.ts';
import { asTabs, retabs } from '../sxs/lib/tabs.ts';
import type { TextDoc } from '../sxs/lib/text.ts';
import { docOf, drawDoc, drawnSelection, drawOutline, drawsCaret, readDrawing } from './drawing.ts';
import { play, type Played } from './player.ts';
import { flavorsOf, Labels, normalize, outcome, readClipboard, viewOf } from './spec-run.ts';
import { readSpecFile, specConfig, specFiles, type SpecTest } from './specfile.ts';

/** A drawn buffer's document, and its start loaded as tabs (placeholders carried as carets are). */
function tabbedStart(t: SpecTest, config: Partial<Config>): { spaces: OurusDoc; tabs: Played } {
  const start = readDrawing(t.initial.buffer);
  const at = (p: number): number => asTabs({ text: start.text, sel: { anchor: p, head: p } }).sel!.anchor;
  // (a subtree selection as the whole lines it is, carried to tabs as any selection)
  const d: TextDoc = asTabs({ text: start.text, sel: drawnSelection(docOf(start.text, start.placeholders, config), start) });
  // (the start's labels, and its drop line: a line, which the tabs keep)
  const labels = new Labels();
  labels.check(docOf(start.text, start.placeholders, config), start.labels, null);
  return {
    spaces: viewOf(t, docOf(start.text, start.placeholders, config), labels.ids),
    // (tabs change no line: a label names the same line's node)
    tabs: { doc: viewOf(t, docOf(d.text, start.placeholders.map(at), config), labels.ids), selection: d.sel!, clipboard: readClipboard(t.initial.clipboard), labels: labels.ids, drop: start.drop },
  };
}

/** Where `pos` is, by what the document reads as: in a node's text (the node in document order, the offset), else its zone. */
function place(doc: OurusDoc, pos: number): string {
  const order: OutlineNode[] = [];
  const visit = (n: OutlineNode): void => (order.push(n), n.children.forEach(visit));
  doc.rootNode.children.forEach(visit);
  const at = doc.locate(pos);
  if (at.zone === 'text' || at.zone === 'frame') {
    // (a line's leading whitespace isn't what it reads as: a later line's column is its own, by tabs or spaces)
    const lines = at.text.text.slice(0, at.offset).split('\n');
    const k = lines.length - 1;
    const line = at.text.text.split('\n')[k]!;
    const column = Math.max(0, lines[k]!.length - /^[ \t]*/.exec(line)![0].length);
    return `${at.zone} of node ${order.findIndex((n) => n.persistentNode === at.node.persistentNode)}, line ${k} at ${column}`;
  }
  if (at.zone === 'gap') return `gap of node ${order.findIndex((n) => n.persistentNode === at.owner.persistentNode)}`;
  // (a line's start, a whole-line selection's end: in its parent's prefix by spaces, in its own
  // marker's indentation by a tab; tabs change no line)
  if ((at.zone === 'marker' || at.zone === 'prefix') && pos === doc.lineAt(pos).from) return `start of line ${doc.lineAt(pos).index}`;
  return at.zone;
}

/** A document and selection as the check compares them: its outline, and the selection's ends in it. */
const reading = (doc: OurusDoc, sel: { anchor: number; head: number }, caret: boolean): string =>
  `${drawOutline(doc)}\n${caret ? `anchor: ${place(doc, sel.anchor)}, head: ${place(doc, sel.head)}` : ''}`;

const columnMotion = (action: string): boolean => /^(?:cursor|select)(?:Line|Page)(?:Up|Down)$/.test(action);

/** Plays example `t` in `flavor` from its start loaded as tabs; throws where a step fails to write, or reads otherwise than its drawing. */
function runTabbed(t: SpecTest, flavor: Config['flavor']): void {
  const config = { flavor, ...specConfig(t.options) };
  let { tabs: state } = tabbedStart(t, config);
  const from = drawDoc(state.doc, state.selection);
  for (const step of t.steps) {
    const at = `${t.file}:${step.line} (${flavor}, tabs)`;
    for (const action of step.actions) {
      state = play(state, [action]);
      assert.ok(state.last?.status !== 'rejected' || state.last.reason !== 'write-failed', `${at}: ${action} failed to write${state.last?.status === 'rejected' && state.last.detail ? `: ${state.last.detail}` : ''}`);
    }
    const { buffer, result } = step.expect;
    if (result !== undefined) assert.equal(outcome(state), result, `${at}: result`);
    // (the host's own edit is the player's emulation of it, and a placeholder the spaces need, a tab's
    // wider column may not: a child past a padding widened by a deleted first character)
    if (buffer === undefined || state.last?.status === 'deferredToHost' || buffer.includes('◌')) continue;
    const drawn = readDrawing(normalize(buffer));
    // (with the view the state has, by line, which tabs keep: a subtree selection ends at a zoom's end)
    const byLine = (id: number | null): number | null => (id === null ? null : (state.doc.node(id)?.startLine ?? null));
    const plain = docOf(drawn.text, drawn.placeholders, config);
    const zoomLine = byLine(state.doc.zoom);
    const expectedDoc = plain.withFolded([...state.doc.folded].flatMap((id) => plain.rowOwner(byLine(id) ?? -1)?.id ?? [])).withZoom(zoomLine === null ? null : (plain.rowOwner(zoomLine)?.id ?? null));
    const expected = reading(expectedDoc, drawnSelection(expectedDoc, drawn), drawsCaret(buffer));
    const got = reading(state.doc, state.selection, drawsCaret(buffer));
    assert.equal(got, expected, `${at}: reads otherwise, as tabs ${JSON.stringify(from)} → ${JSON.stringify(drawDoc(state.doc, state.selection))}`);
  }
}

for (const file of specFiles()) {
  for (const t of readSpecFile(file)) {
    if (t.pending || t.steps.some((s) => s.actions.some(columnMotion))) continue;
    const start = readDrawing(t.initial.buffer);
    // a document with no indentation is the spec's own run
    if (!/^[ ]+\S/m.test(start.text) || !retabs({ text: start.text, sel: start.selection })) continue;
    const flavors = flavorsOf(t).filter((flavor) => {
      const { spaces, tabs } = tabbedStart(t, { flavor, ...specConfig(t.options) });
      return drawOutline(spaces) === drawOutline(tabs.doc);
    });
    if (!flavors.length) continue;
    test(`${t.name} (tabs)`, () => {
      for (const flavor of flavors) runTabbed(t, flavor);
    });
  }
}
