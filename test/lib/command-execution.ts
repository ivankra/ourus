// Helpers for a test that plays a command on a note and checks what it did: the bug repros in
// `test/bugs.ts`, and any test file a repro moves to once its bug is fixed.

import assert from 'node:assert/strict';
import {
  executeCommand,
  OurusFailed,
  OurusRejected,
  OurusSuccess,
  type OurusCommand,
  type OurusResult,
} from '../../src/commands/index.ts';
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
  /** Auto marks: characters ourus put in (a raised blank line's line break, an escape). */
  readonly auto?: readonly number[];
}

/** `command` played on `text` from `start`. */
export function executeOnText(text: string, command: OurusCommand, start: CommandStart = {}): OurusResult {
  const { caret = 0, anchor = caret, head = anchor, config = {}, view, placeholders = [], auto = [] } = start;
  const doc = OurusDoc.parse(text, { config, marks: { placeholders, auto } });
  return executeCommand(OurusView.of(doc, view).withSelection({ anchor, head }), command);
}

/** `command` played on the view and selection `result` left. */
export function executeAfter(result: OurusResult, command: OurusCommand): OurusResult {
  const applied = assertApplied(result);
  return executeCommand(applied.view, command);
}

/** What a result was, for an assertion's message. */
function resultSummary(result: OurusResult): string {
  if (result instanceof OurusFailed) return `failed (${result.phase} ${result.code}): ${result.detail}`;
  return result instanceof OurusRejected
    ? `rejected ${result.reason}: ${result.detail ?? ''}`
    : result.constructor.name;
}

/** Fails where `result` is a write failure: applied and refused on purpose both pass. */
export function assertNoWriteFailure(result: OurusResult): void {
  assert.ok(!(result instanceof OurusFailed), resultSummary(result));
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
export function convertPastedHtml(source: string): {
  readonly markdown: string;
  readonly rendered: string;
  readonly shown: string;
} {
  const { markdown } = MdHtmlParser.parse(source);
  const rendered = MdTree.parse(markdown, MdFlavor.gfm).renderHtml();
  return { markdown, rendered, shown: rendered.replace(/<[^>]*>/g, '') };
}

/** The inline nodes of `text`'s first block, read in `flavor`. */
export function firstBlockInlines(text: string, flavor: MdFlavor = MdFlavor.gfm): ReturnType<MdTree['inlines']> {
  const tree = MdTree.parse(text, flavor);
  return tree.inlines(tree.rootAt.child(0));
}
