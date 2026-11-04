// The clipboard as paste reads it: which of its formats is the Markdown (spec/paste-conv.md), HTML
// converted (spec/paste-html.md), and its lines as they read out of what they were copied from.

import type { OurusConfig } from '../config.ts';
import { OurusDoc, VERBATIM } from '../doc/index.ts';
import { MdHtmlParser } from '../parser/index.ts';
import { advanceColumns, dropColumns, trimMd } from '../text/index.ts';


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

/**
 * A clipboard's lines (its blank ones at either end gone) as paste reads them: without the indentation
 * all of them share; and a fenced block copied from inside a list or a quote, from its fence on, whose
 * fence's line lost the indentation the others keep, its closing fence among them, which then doesn't
 * close the block (a code fence four columns in), read with the others losing it too, which closes the
 * fence and gives the code its own indentation back. A block that closes as it is reads as it is, its
 * code's indentation kept (so do other clipboards).
 */
export function clipboardSource(lines: readonly string[], config: Partial<OurusConfig>, ours = false): string[] {
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  // (by a reduction, not a spread: a clipboard of a hundred thousand lines is past the arguments a call takes)
  // (none from ourus's own copy, written out of its containers: what indentation it has is its own,
  // indented code's)
  const common = ours ? 0 : lines.filter((text) => trimMd(text) !== '').reduce((m, text) => Math.min(m, indentOf(text)), Infinity);
  let source = lines.map((text) => (trimMd(text) === '' ? '' : dropColumns(text, common)));
  // (but a line of blanks in code, math, a comment, HTML is the block's: kept, its share of the common
  // indentation taken off as the others', where the clipboard read so has the line in such a block)
  if (lines.some((text) => text !== '' && trimMd(text) === '')) {
    const tree = OurusDoc.parse(source.join('\n'), { config }).mdTree;
    source = source.map((text, i) => (text === '' && lines[i] !== '' && trimMd(lines[i]!) === '' && VERBATIM.has(tree.line(i).leaf?.block.type ?? '') ? dropColumns(lines[i]!, common) : text));
  }
  const fence = /^(`{3,}|~{3,}|\$\$|%%)/.exec(source[0]!);
  // (the indentation the fence's other lines share: of those with text, a line of blanks kept as code
  // being no line's indentation)
  const rest = source.slice(1).filter((text) => trimMd(text) !== '');
  const inner = rest.length ? rest.reduce((m, text) => Math.min(m, indentOf(text)), Infinity) : 0;
  const closes = (): boolean => !!OurusDoc.parse(source.join('\n'), { config }).mdTree.root.children[0]?.attrs.closed;
  // (ourus's own is written out of its containers: a line in it that looks like a closing fence is code)
  if (!ours && fence && inner > 0 && indentOf(source[source.length - 1]!) === inner && !closes() && new RegExp(`^[ \\t]*\\${fence[1]![0]}{${fence[1]!.length},}[ \\t]*$`).test(source[source.length - 1]!)) {
    return [source[0]!, ...source.slice(1).map((text) => (text === '' ? '' : dropColumns(text, inner)))];
  }
  return source;
}

/** What ourus's HTML says beside its Markdown: the text is the source (spec/paste-conv.md reads it so). */
const OURUS_MARK = '<!-- ourus -->';
/** After it, where what ourus copied is text, not whole nodes (a selection from inside one node into another). */
const TEXT_MARK = '<!-- text -->';

/** The clipboard ourus writes for `markdown`: the Markdown as text and as itself, and its rendering, marked as ourus's, and as text where it isn't whole nodes. */
export function clipboardOf(markdown: string, config: Partial<OurusConfig>, text = false): OurusClipboard {
  const html = OurusDoc.parse(markdown, { config }).mdTree.renderHtml();
  return { 'text/plain': markdown, 'text/markdown': markdown, 'text/html': OURUS_MARK + (text ? TEXT_MARK : '') + html };
}

/**
 * The clipboard's Markdown as paste reads it, a document of its own: its lines without the blank ones
 * at its ends, read out of what they were copied from (`clipboardSource`), and whether it is one line
 * without a line break (inline text): frontmatter read after a blank line, a block it leaves open
 * (a fence it doesn't close) closed where it ends. Null where it holds nothing.
 */
export function clipboardFragment(markdown: string, config: Partial<OurusConfig>, ours = false): { readonly doc: OurusDoc; readonly inline: boolean } | null {
  const all = markdown.split(/\r\n|\n|\r/);
  // (the blank lines at the start dropped at once: one at a time, each shift moves the rest)
  let first = 0;
  while (first < all.length && trimMd(all[first]!) === '') first++;
  const lines = first ? all.slice(first) : all;
  while (lines.length && trimMd(lines[lines.length - 1]!) === '') lines.pop();
  if (!lines.length) return null;
  let source = clipboardSource(lines, config, ours);
  // (a line break among the blanks it ends with, found from the end: the regex backtracks quadratically over a run of them)
  let tail = markdown.length;
  while (tail > 0 && ' \t\r\n'.includes(markdown[tail - 1]!)) tail--;
  const inline = lines.length < 2 && !/[\r\n]/.test(markdown.slice(tail));
  let doc = OurusDoc.parse(source.join('\n'), { config });
  // frontmatter is only at a document's start: pasted, its lines are what they read as anywhere else
  // (a thematic break, a setext heading), read after a blank line
  if (doc.mdTree.line(0).leaf?.block.type === 'frontmatter') {
    source = ['', ...source];
    doc = OurusDoc.parse(source.join('\n'), { config });
  }
  // a block the clipboard leaves open (a fence it doesn't close) is closed where it ends, in what
  // holds it: open, it would run on into the text after the paste (PasteList27)
  const tree = doc.mdTree;
  const last = tree.line(tree.lineCount - 1).leaf;
  if (last && tree.flavor.delimited(last.block) && !last.block.attrs.closed) {
    const line = tree.line(last.line);
    const text = doc.text;
    const opening = /^[ \t]*(?:`{3,}|~{3,}|\$\$|%%)/.exec(text.slice(line.contentFrom, line.to));
    if (!opening) return null;
    source = [...source, text.slice(line.from, line.contentFrom).replace(/[^>\t ]/g, ' ') + opening[0]];
    doc = OurusDoc.parse(source.join('\n'), { config });
  }
  return { doc, inline };
}
