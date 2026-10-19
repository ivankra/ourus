// Spec buffers as Markdown text, for apps that edit text rather than blocks (SilverBullet, Obsidian):
// the drawn buffer is the document as it is, with its caret or selection, and an app's text is
// compared with the spec's as drawn. A placeholder (`◌`) is a place, not text: it is dropped.

import type { Config } from '../../src/config.ts';
import { OutlineState } from '../../src/outline/index.ts';
import { drawState, drawText, readDrawing } from '../../test/drawing.ts';
import type { Verdict } from './block.ts';

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

/** A document's nodes as ourus verifies them: kind, depth, what the head is, and the text (an atom's as written, other nodes' lines trimmed). */
const nodes = (text: string, flavor: Config['flavor']): string => {
  const doc = OutlineState.parse(text, { config: { flavor } });
  return JSON.stringify(doc.nodes.map((n) => [n.kind, n.depth, n.head?.type, n.head?.level, doc.nodeText(n)]));
};

/**
 * How `got` compares with `want`; the selection is compared only where `want` has one. Texts that
 * differ only in spaces before line breaks, or in spaces anywhere where ourus reads the same document
 * from both (a continuation line's indentation, a lazy line, a marker's padding), differ in spaces;
 * a space that changes what the text is (nesting, a code line's indentation) is a difference.
 */
export function compareTexts(want: TextDoc, got: TextDoc, flavor: Config['flavor'] = 'gfm'): Verdict {
  if (want.text !== got.text) {
    if (loose(want.text) === loose(got.text)) return 'whitespace';
    const bare = (t: string): string => t.replace(/[ \t]+/g, '');
    return bare(want.text) === bare(got.text) && nodes(want.text, flavor) === nodes(got.text, flavor) ? 'whitespace' : 'disagree';
  }
  if (want.sel && JSON.stringify(want.sel) !== JSON.stringify(got.sel)) return 'caret';
  return 'agree';
}

export const sameText = (a: TextDoc, b: TextDoc): boolean => a.text === b.text && JSON.stringify(a.sel) === JSON.stringify(b.sel);
