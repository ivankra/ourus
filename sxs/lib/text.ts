// Spec buffers as Markdown text, for apps that edit text rather than blocks (SilverBullet, Obsidian):
// the drawn buffer is the document as it is, with its caret or selection, and an app's text is
// compared with the spec's as drawn. A placeholder (`◌`) is a place, not text: it is dropped.

import type { Config } from '../../src/config.ts';
import { OurusDoc } from '../../src/doc/index.ts';
import { drawState, drawText, drawnSelection, nodesOf, plainText, readDrawing } from '../../test/drawing.ts';
import type { Verdict } from './block.ts';
import { drawView, sameView, splitView, type RowView } from './view.ts';

export interface TextDoc {
  text: string;
  /** The caret or selection, as offsets into the text; null when the buffer draws none. */
  sel: { anchor: number; head: number } | null;
  /** Its folds and zoom, by line (`view.ts`), where the case has a view. */
  view?: RowView;
}

/** A drawn buffer as a text document (its view, `view.ts`, read off its last line); a subtree selection (`««…»»`) as the whole lines it is. */
export function readTextDoc(drawing: string): TextDoc {
  const { drawn, view } = splitView(drawing);
  const read = readDrawing(drawn);
  const selection = read.subtrees ? drawnSelection(OurusDoc.parse(read.text, { marks: [] }), read) : read.selection;
  return { text: read.text, sel: /┃|«/.test(drawn) ? selection : null, ...(view && { view }) };
}

/** A text document drawn as a spec buffer, its view a last line: its selection at its offsets, as a text editor has it (`«…»`, whole lines or not; the stored runs are keyed so). */
export const drawTextDoc = (d: TextDoc): string => (d.sel ? drawState(d.text, d.sel) : drawText(d.text)) + (d.view ? drawView(d.view) : '');

/** Text compared without the spaces and tabs that end lines, where editors differ in trimming. */
const loose = (text: string): string => text.replace(/[ \t]+$/gm, '');

/** A document's nodes as ourus verifies them: kind, depth, what the head is, and the text (an atom's as written, other nodes' lines trimmed). */
const nodes = (text: string, flavor: Config['flavor']): string => {
  const doc = OurusDoc.parse(text, { config: { flavor } });
  return JSON.stringify(nodesOf(doc).map((n) => [n.kind, n.depth, n.head?.type, n.head?.attrs.level, plainText(doc, n)]));
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
  if (want.sel && JSON.stringify(want.sel) !== JSON.stringify(got.sel) && !sameSubtrees(want.text, want.sel, got.sel, flavor)) return 'caret';
  return 'agree';
}

/**
 * Whether two selections of `text` are the same subtree selection, whatever their whole-line shape
 * (to the next line's start, to the last line's end, with the blank lines after) or direction: the
 * same nodes selected whole, as a host draws them (true-outliner's covers end before the break).
 */
function sameSubtrees(text: string, a: TextDoc['sel'], b: TextDoc['sel'], flavor: Config['flavor']): boolean {
  if (!a || !b) return false;
  const doc = OurusDoc.parse(text, { config: { flavor } });
  const roots = doc.selectedSubtrees(a);
  return !!roots && roots.join() === doc.selectedSubtrees(b)?.join();
}

export const sameText = (a: TextDoc, b: TextDoc): boolean => a.text === b.text && JSON.stringify(a.sel) === JSON.stringify(b.sel) && sameView(a.view, b.view);
