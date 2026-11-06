// Helpers for a test that plays a command on a note and checks what it did: the bug repros in
// `test/bugs.ts`, and any test file a repro moves to once its bug is fixed.

import assert from 'node:assert/strict';
import { executeCommand, OurusRejected, OurusSuccess, type OurusCommand, type OurusResult } from '../../src/commands/index.ts';
import type { OurusConfig } from '../../src/config.ts';
import { OurusDoc } from '../../src/doc/index.ts';
import { MdFlavor, MdHtmlParser, MdTree } from '../../src/parser/index.ts';
import { OurusView, type OurusViewState } from '../../src/view/index.ts';

/** Where a command starts: the caret (or `anchor` and `head`), and the document's and view's state. */
export interface CommandStart {
  readonly caret?: number;
  readonly anchor?: number;
  readonly head?: number;
  readonly config?: Partial<OurusConfig>;
  readonly view?: OurusViewState;
  readonly placeholders?: readonly number[];
}

/** `command` played on `text` from `start`. */
export function executeOnText(text: string, command: OurusCommand, start: CommandStart = {}): OurusResult {
  const { caret = 0, anchor = caret, head = anchor, config = {}, view, placeholders = [] } = start;
  const doc = OurusDoc.parse(text, { config, marks: { placeholders } });
  return executeCommand(OurusView.of(doc, view).withSelection({ anchor, head }), command);
}

/** `command` played on the view and selection `result` left. */
export function executeAfter(result: OurusResult, command: OurusCommand): OurusResult {
  const applied = assertApplied(result);
  return executeCommand(applied.view, command);
}

/** What a result was, for an assertion's message. */
function resultSummary(result: OurusResult): string {
  return result instanceof OurusRejected ? `rejected ${result.reason}: ${result.detail ?? ''}` : result.constructor.name;
}

/** Fails where `result` is a write failure: applied and refused on purpose both pass. */
export function assertNoWriteFailure(result: OurusResult): void {
  assert.ok(!(result instanceof OurusRejected && result.reason === 'write-failed'), resultSummary(result));
}

/** `result`, failing unless it applied. */
export function assertApplied(result: OurusResult): OurusSuccess {
  assert.ok(result instanceof OurusSuccess, resultSummary(result));
  return result;
}

/** The text `result` left, failing unless it applied. */
export function appliedText(result: OurusResult): string {
  return assertApplied(result).view.doc.text;
}

/** What paste makes of clipboard HTML: its Markdown, that rendered, and the text the rendering shows. */
export function convertPastedHtml(source: string): { readonly markdown: string; readonly rendered: string; readonly shown: string } {
  const { markdown } = MdHtmlParser.parse(source);
  const rendered = MdTree.parse(markdown, MdFlavor.gfm).renderHtml();
  return { markdown, rendered, shown: rendered.replace(/<[^>]*>/g, '') };
}

/** The inline nodes of `text`'s first block, read in `flavor`. */
export function firstBlockInlines(text: string, flavor: MdFlavor = MdFlavor.gfm): ReturnType<MdTree['inlines']> {
  const tree = MdTree.parse(text, flavor);
  return tree.inlines(tree.rootAt.child(0));
}

/** Least CPU time a measurement runs for: the thread's clock is too coarse to time less. */
const MEASURED_MS = 50;

/**
 * The least CPU time one run of `action` took, in milliseconds, of this thread alone: waiting for a core
 * doesn't count, nor a collector's threads, still at what ran before it. Over `attempts` measurements,
 * each repeating `action` until the clock can tell.
 */
function bestCpuTime(action: () => void, attempts: number): number {
  let best = Infinity;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const start = process.threadCpuUsage();
    let runs = 0;
    let spent = 0;
    while (spent < MEASURED_MS) {
      action();
      runs++;
      const used = process.threadCpuUsage(start);
      spent = (used.user + used.system) / 1000;
    }
    best = Math.min(best, spent / runs);
  }
  return best;
}

/**
 * How many times longer `action` takes at `largeSize` than at `smallSize`, by CPU time: about their
 * ratio where it scales linearly, its square where quadratically. Sizes far apart tell the two apart
 * on a busy machine, where a test next to others runs slower but not differently.
 */
export function scalingFactor(action: (size: number) => void, smallSize: number, largeSize: number): number {
  return bestCpuTime(() => action(largeSize), 2) / bestCpuTime(() => action(smallSize), 5);
}
