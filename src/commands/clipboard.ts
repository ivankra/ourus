// The clipboard: which of its formats paste reads as the Markdown (spec/paste-conv.md), HTML converted
// (spec/paste-html.md); and what copy writes. The Markdown read as a document is the doc layer's
// (`clipboardFragment`).

import type { OurusConfig } from '../config.ts';
import { renderedHtml, type OurusDoc } from '../doc/index.ts';
import { MdFlavor, MdHtmlParser } from '../parser/index.ts';

/** A clipboard as the host reads it: each format it holds, named as a `DataTransfer` names them. */
export interface OurusClipboard {
  /** Every copy's: a Markdown source's text, or a page's as it shows (`innerText`: no markers). */
  readonly 'text/plain'?: string;
  /** A Markdown app's own copy (Obsidian's, and ourus's). */
  readonly 'text/markdown'?: string;
  /** A rendered page's or a rich-text app's copy; a code editor's, a picture of its text. */
  readonly 'text/html'?: string;
  /** VS Code's mark beside its HTML, which is then a picture of the text. */
  readonly 'vscode-editor-data'?: string;
}

/** What a clipboard's HTML may carry beside a Markdown app's source as its text, saying that's what the text is: ourus's own mark, SiYuan's copy's comment. */
const SOURCE_MARK = /<!--\s*(?:ourus(?:\s+\[?text\]?)?\s*-->|data-siyuan=)/;

/**
 * The Markdown a clipboard holds (spec/paste-conv.md): a Markdown app's own copy; else the text, where
 * the HTML says it's the source (a Markdown app's mark) or is a picture of it (a code editor's copy,
 * VS Code's marked so); else HTML with structure, converted; else HTML with inline formatting,
 * converted, a phrase (`phrase`: one line of text, which keeps its formatting); else the text.
 */
export function clipboardMarkdown(
  clipboard: OurusClipboard,
  config?: Pick<OurusConfig, 'pasteHtmlBreak'> & Partial<Pick<OurusConfig, 'flavor'>>,
): { markdown: string; phrase: boolean; ours?: boolean; nodes?: boolean; ends?: ClipboardTextEnds } | null {
  const text = clipboard['text/plain'];
  const html = clipboard['text/html'];
  // (ourus's own, its HTML marked so, whichever format holds its source: Markdown out of the containers
  // it was copied from already)
  const own = html === undefined ? {} : ourMark(html);
  if (clipboard['text/markdown'] !== undefined) return { markdown: clipboard['text/markdown'], phrase: false, ...own };
  if (own.ours && text !== undefined) return { markdown: text, phrase: false, ...own };
  if (
    html !== undefined &&
    clipboard['vscode-editor-data'] === undefined &&
    !(text !== undefined && SOURCE_MARK.test(html))
  ) {
    // (in the note's flavor: an Obsidian callout's, wiki link's, math's HTML read back as their syntax)
    const converted = MdHtmlParser.parse(html, {
      hardBreaks: config?.pasteHtmlBreak === 'hard',
      ...(config?.flavor ? { flavor: MdFlavor.named(config.flavor) } : {}),
    });
    // (one block of one line, a heading or a rule, ends with a line break: a node, not inline text)
    if (converted.structured)
      return {
        markdown: converted.markdown.includes('\n') ? converted.markdown : `${converted.markdown}\n`,
        phrase: false,
      };
    if (text === undefined) return { markdown: converted.markdown, phrase: false };
    if (converted.formatted && converted.markdown !== '') return { markdown: converted.markdown, phrase: true };
  }
  return text === undefined ? null : { markdown: text, phrase: false };
}

/**
 * How a paste takes each end of a text ourus copied (spec/copy.md's rule 1): `edge`, a boundary between blocks there (the selection took none of a text at that end:
 * past a text's end, before one's start, in a marker or a prefix, on a blank line), the text on that
 * side of the caret kept apart; `mid`, joined to it. A copy within one node's text is `mid` at both.
 */
export interface ClipboardTextEnds {
  readonly start: 'mid' | 'edge';
  readonly end: 'mid' | 'edge';
}

/**
 * ourus's mark, the first thing in its HTML, saying the text is the source (spec/paste-conv.md reads
 * it so): `<!-- ourus -->` for whole nodes; `<!-- ourus text -->` for text, a `[` before `text` where
 * it starts at a boundary between blocks, or a `]` after it where it ends at one
 * (`ClipboardTextEnds`). A selection with both ends at boundaries is whole nodes, copied so
 * (`wholeBlocksSelection`); a `<!-- ourus [text] -->` read is taken as text all the same.
 */
const OUR_MARK = /^<!-- ourus(?: (\[?)text(\]?))? -->/;
/** The mark of ourus's copies before 2026-11-13, for text: `<!-- ourus --><!-- text -->`, its ends unknown, taken as inside texts. */
const OLD_TEXT_MARK = '<!-- ourus --><!-- text -->';

/** What ourus's mark at the start of `html` says: nothing where it has none. */
function ourMark(html: string): { ours?: boolean; nodes?: boolean; ends?: ClipboardTextEnds } {
  if (html.startsWith(OLD_TEXT_MARK)) return { ours: true, ends: { start: 'mid', end: 'mid' } };
  const m = OUR_MARK.exec(html);
  if (!m) return {};
  if (m[1] === undefined) return { ours: true, nodes: true };
  return { ours: true, ends: { start: m[1] ? 'edge' : 'mid', end: m[2] ? 'edge' : 'mid' } };
}

/** The clipboard ourus writes for `markdown`: the Markdown as text and as itself, and its rendering, marked as ourus's, and as text, with how a paste takes its ends, where it isn't whole nodes (`across`: from inside one node into another). */
export function clipboardOf(
  markdown: string,
  from: OurusDoc,
  ends: ClipboardTextEnds | null = null,
  across = false,
): OurusClipboard {
  // (text from inside one node into another: its first line a text's, the lines after it the blocks
  // they are)
  const html = renderedHtml(markdown, from, ends === null ? false : across ? 'firstLine' : true);
  const mark = ends
    ? `<!-- ourus ${ends.start === 'edge' ? '[' : ''}text${ends.end === 'edge' ? ']' : ''} -->`
    : '<!-- ourus -->';
  return { 'text/plain': markdown, 'text/markdown': markdown, 'text/html': mark + html };
}
