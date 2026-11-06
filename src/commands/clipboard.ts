// The clipboard: which of its formats paste reads as the Markdown (spec/paste-conv.md), HTML converted
// (spec/paste-html.md); and what copy writes. The Markdown read as a document is the doc layer's
// (`clipboardFragment`).

import type { OurusConfig } from '../config.ts';
import { renderedHtml, type OurusDoc } from '../doc/index.ts';
import { MdHtmlParser } from '../parser/index.ts';

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
const SOURCE_MARK = /<!--\s*(?:ourus\s*-->|data-siyuan=)/;

/**
 * The Markdown a clipboard holds (spec/paste-conv.md): a Markdown app's own copy; else the text, where
 * the HTML says it's the source (a Markdown app's mark) or is a picture of it (a code editor's copy,
 * VS Code's marked so); else HTML with structure, converted; else HTML with inline formatting,
 * converted, a phrase (`phrase`: one line of text, which keeps its formatting); else the text.
 */
export function clipboardMarkdown(clipboard: OurusClipboard, config?: Pick<OurusConfig, 'pasteHtmlBreak'>): { markdown: string; phrase: boolean; ours?: boolean; nodes?: boolean } | null {
  const text = clipboard['text/plain'];
  const html = clipboard['text/html'];
  // (ourus's own, its HTML marked so, whichever format holds its source: Markdown out of the containers
  // it was copied from already)
  const own: { ours?: boolean; nodes?: boolean } = html?.startsWith(OURUS_MARK) ? { ours: true, ...(html.startsWith(OURUS_MARK + TEXT_MARK) ? {} : { nodes: true }) } : {};
  if (clipboard['text/markdown'] !== undefined) return { markdown: clipboard['text/markdown'], phrase: false, ...own };
  if (own.ours && text !== undefined) return { markdown: text, phrase: false, ...own };
  if (html !== undefined && clipboard['vscode-editor-data'] === undefined && !(text !== undefined && SOURCE_MARK.test(html))) {
    const converted = MdHtmlParser.parse(html, { hardBreaks: config?.pasteHtmlBreak === 'hard' });
    // (one block of one line, a heading or a rule, ends with a line break: a node, not inline text)
    if (converted.structured) return { markdown: converted.markdown.includes('\n') ? converted.markdown : `${converted.markdown}\n`, phrase: false };
    if (text === undefined) return { markdown: converted.markdown, phrase: false };
    if (converted.formatted && converted.markdown !== '') return { markdown: converted.markdown, phrase: true };
  }
  return text === undefined ? null : { markdown: text, phrase: false };
}

/** What ourus's HTML says beside its Markdown: the text is the source (spec/paste-conv.md reads it so). */
const OURUS_MARK = '<!-- ourus -->';
/** After it, where what ourus copied is text, not whole nodes (a selection from inside one node into another). */
const TEXT_MARK = '<!-- text -->';

/** The clipboard ourus writes for `markdown`: the Markdown as text and as itself, and its rendering, marked as ourus's, and as text where it isn't whole nodes. */
export function clipboardOf(markdown: string, from: OurusDoc, text = false): OurusClipboard {
  const html = renderedHtml(markdown, from, text);
  return { 'text/plain': markdown, 'text/markdown': markdown, 'text/html': OURUS_MARK + (text ? TEXT_MARK : '') + html };
}
