// Spec buffers as Markdown text, for apps that edit text rather than blocks (SilverBullet, Obsidian):
// the drawn buffer is the document as it is, with its caret or selection, and an app's text is
// compared with the spec's as drawn. A placeholder (`◌`) is a place, not text: it is dropped.

import { drawState, drawText, readDrawing } from '../../test/drawing.ts';
import type { Verdict } from './outline.ts';

export interface TextDoc {
  text: string;
  /** The caret or selection, as offsets into the text; null when the buffer draws none. */
  sel: { anchor: number; head: number } | null;
}

/** A drawn buffer as a text document. */
export function readTextDoc(drawn: string): TextDoc {
  const { text, selection } = readDrawing(drawn);
  return { text, sel: /┃|«/.test(drawn) ? selection : null };
}

/** A text document drawn as a spec buffer. */
export const drawTextDoc = (d: TextDoc): string => (d.sel ? drawState(d.text, d.sel) : drawText(d.text));

/** Text compared without the spaces and tabs that end lines, where editors differ in trimming. */
const loose = (text: string): string => text.replace(/[ \t]+$/gm, '');

/** How `got` compares with `want`; the selection is compared only where `want` has one. */
export function compareTexts(want: TextDoc, got: TextDoc): Verdict {
  if (want.text !== got.text) return loose(want.text) === loose(got.text) ? 'whitespace' : 'disagree';
  if (want.sel && JSON.stringify(want.sel) !== JSON.stringify(got.sel)) return 'caret';
  return 'agree';
}

export const sameText = (a: TextDoc, b: TextDoc): boolean => a.text === b.text && JSON.stringify(a.sel) === JSON.stringify(b.sel);
