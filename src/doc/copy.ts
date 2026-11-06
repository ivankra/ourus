// A range of a document as Markdown out of the containers holding it (what copy writes), and where a
// node's own Markdown starts (what a copy of whole nodes takes); and a clipboard's Markdown read back as
// a document of its own (what paste reads), and rendered (what copy puts beside it).

import type { OurusConfig } from '../config.ts';
import { MdBlockAt, type MdLine, type MdPrefixPiece, type MdTree } from '../parser/index.ts';
import { advanceColumns, dropColumns, lineIndexAt, skipSpaces, trimMd } from '../text/index.ts';
import { OurusDoc } from './doc.ts';
import { escapeParagraph } from './escapes.ts';
import type { OurusNode } from './node.ts';

/**
 * Where `node`'s own Markdown starts: an item at its marker, a quote at its `>`, a footnote definition
 * at its label, else past its containers' prefix (what holds it isn't its own).
 */
export function markdownStart(doc: OurusDoc, node: OurusNode): number {
  const tree = doc.mdTree;
  // (an empty text has no lines: its root starts at 0)
  if (!tree.lineCount) return 0;
  const line = tree.line(node.startLine);
  if (node.kind === 'item') return tree.markerFrom(new MdBlockAt(node.block, node.startLine));
  // a quote's `>` and a footnote definition's `[^1]:` are its own prefix piece, and so is the `>` of a
  // quote that is the node's text (`quotes: text`, `atom`)
  const own = node.kind === 'quote' || node.block.type === 'footnote_definition' ? node.block : node.persistentNode.textQuote;
  const piece = own ? line.prefix.find((p) => p.container.block === own) : undefined;
  return piece ? skipSpaces(doc.text, piece.from, piece.to, 1) : line.contentFrom;
}

/** The parser's blocks whose lines are kept as they are, blank ones' spaces too: code, math, a comment, HTML. */
/** The leaf blocks whose text is verbatim: code, math, a comment, HTML. */
export const VERBATIM: ReadonlySet<string> = new Set(['code_block', 'math_block', 'comment_block', 'html_block']);

/**
 * The lines of the verbatim block (code, math, a comment, HTML) that is `node`'s text, as they read
 * where it is written: past its containers' prefixes and its own indentation, a tab partly taken its
 * rest as spaces (`MdTree.leafLines`). What the code is, which its spelling is only in its context: the
 * same lines written at another column can read as other code. Null for a node with no such block.
 */
export function verbatimLinesOf(doc: OurusDoc, node: OurusNode): readonly string[] | null {
  const tree = doc.mdTree;
  for (let i = node.startLine; i <= node.ownLastLine && i < tree.lineCount; i++) {
    const leaf = tree.line(i).leaf;
    if (leaf) return VERBATIM.has(leaf.block.type) ? tree.leafLines(leaf) : null;
  }
  return null;
}

/**
 * The Markdown of `from`–`to` as written, without what the containers holding all of it put on its
 * lines (a quote's `>`, an item's indentation, where the copy starts past the item's marker): it reads
 * as it did, out of them; a quote read as an atom (`quotes: atom`) is the text, its `>`s kept. Lines
 * that are blank there are empty.
 */
export function markdownOf(doc: OurusDoc, from: number, to: number): string {
  const tree = doc.mdTree;
  const text = doc.text;
  // (an empty text has no lines to copy out of, an empty range nothing: not the line ending at the text's end)
  if (!tree.lineCount || from === to) return '';
  const lo = lineIndexAt(tree.starts, from);
  const end = tree.line(lineIndexAt(tree.starts, to));
  // a copy ending at a line's start ends with the line break before it
  const hi = end.index > lo && end.from === to ? end.index - 1 : end.index;
  // the containers holding the whole copy: those started before it (on an earlier line, or with their
  // marker before it: an item's piece starts at the indentation before its marker) and ending in or
  // after its last line
  const first = tree.line(lo);
  const opens = (p: MdPrefixPiece): number => (p.kind === 'marker' ? tree.markerFrom(p.container) : skipSpaces(text, p.from, p.to, 1));
  // (but a quote that is a node's lines as written, `quotes: atom`: its `>`s are that text's)
  const own = doc.config.quotes === 'atom' ? doc.nodeAtLine(lo)?.persistentNode.textQuote : null;
  const holding = new Set(first.prefix.filter((p) => (p.container.line < lo || opens(p) < from) && p.container.lastLine >= hi && p.container.block !== own).map((p) => p.container.block));
  const held = (line: MdLine): number => line.prefix.reduce((start, piece) => (holding.has(piece.container.block) ? Math.max(start, piece.to) : start), line.from);
  // indentation the first line loses past what holds the copy (an item indented past its parent's
  // text, copied from its marker), the lines after it lose too: they keep their columns to it
  const column = (line: MdLine, at: number): number => advanceColumns(text, line.from, at, 0);
  const lead = /^[ \t]+$/.test(text.slice(held(first), from)) ? column(first, from) - column(first, held(first)) : 0;
  const out: string[] = [];
  for (let i = lo; i <= hi; i++) {
    const line = tree.line(i);
    let start = held(line);
    let piece: string;
    if (i === lo) piece = text.slice(Math.max(start, from), i === end.index ? Math.min(to, line.to) : line.to);
    else {
      // (a tab partly within the lead leaves spaces for the rest of its width)
      const base = column(line, start);
      let col = base;
      while (start < line.to && col < base + lead && (text[start] === ' ' || text[start] === '\t')) col = advanceColumns(text, start, ++start, col);
      piece = ' '.repeat(Math.max(0, col - base - lead)) + text.slice(start, i === end.index ? Math.min(to, line.to) : line.to);
    }
    // (a tab a container's prefix took part of, `>→`: the rest of its width, in spaces, which the tab
    // at column 0 would span differently, B93)
    const partial = line.prefix.find((p) => holding.has(p.container.block) && p.to === start && p.partialTab);
    if (partial && text[start] === '\t' && piece.startsWith('\t') && (i !== lo || from <= start)) piece = ' '.repeat(advanceColumns(text, line.from, start + 1, 0) - partial.toColumn) + piece.slice(1);
    // (a line the copy takes whole, blank there, is empty; part of one, spaces between words, is as it
    // is; and a code block's line, its spaces the payload's)
    const whole = (i !== lo || from <= held(line)) && (i !== end.index || to >= line.to);
    out.push(whole && trimMd(piece) === '' && !(line.leaf && VERBATIM.has(line.leaf.block.type)) ? '' : piece);
  }
  // (ending at a line's start, or past its last line's end, in its line ending: the final one too)
  return out.join('\n') + ((end.index > lo && end.from === to) || to > end.to ? '\n' : '');
}

/**
 * Markdown copied from `from`, rendered as it read there: what copy puts on the clipboard as HTML.
 * `text`: copied from inside one node's text, the paragraph text it was (what would start a block
 * escaped: `# Heading` from `before # Heading after` no heading); else blocks, read after a blank line
 * (`---` from mid-note no front matter). With the note's link and footnote definitions after it, and
 * a footnote definition copied without a reference to it as its content: GFM renders none such.
 */
export function renderedHtml(markdown: string, from: OurusDoc, text = false): string {
  const config = from.config;
  let source = markdown;
  if (text) {
    const lines = markdown.split(/\r\n|\n|\r/);
    const spelled = escapeParagraph(from.mdTree.flavor, 'paragraph', false, lines, lines.map(() => false), undefined, false);
    const escaped = [...(spelled?.lines ?? lines)];
    // (a backslash at each markup escape it asks for, from a line's last)
    for (const e of [...(spelled?.markup ?? [])].reverse()) escaped[e.line] = escaped[e.line]!.slice(0, e.at) + '\\' + escaped[e.line]!.slice(e.at);
    source = escaped.join('\n');
  }
  // (a footnote definition at the copy's top level that nothing in it refers to: its content, from the last)
  const copy = OurusDoc.parse(source, { config });
  const tree = copy.mdTree;
  for (const def of tree.unreferencedFootnotes().filter((b) => tree.line(b.line).containers[0]?.block === b.block).reverse()) {
    const label = tree.line(def.line).prefix.find((p) => p.container.block === def.block)!;
    const [start, end] = [tree.line(def.line).from, tree.line(def.lastLine).to];
    source = source.slice(0, start) + copy.markdownOf(label.to, end) + source.slice(end);
  }
  // the note's definitions, each once (one inside another with it), out of what holds them
  const defs: string[] = [];
  let reached = -1;
  for (const b of from.mdTree.rootAt.preorder()) {
    if (b.block.type !== 'refdef' && b.block.type !== 'footnote_definition') continue;
    const first = from.mdTree.line(b.line);
    const start = b.block.type === 'refdef' ? first.contentFrom : first.prefix.find((p) => p.container.block === b.block)!.from;
    const end = from.mdTree.line(b.lastLine).to;
    if (start < reached) continue;
    defs.push(from.markdownOf(start, end));
    reached = end;
  }
  return OurusDoc.parse(`\n${source}${defs.length ? `\n\n${defs.join('\n\n')}\n` : ''}`, { config }).mdTree.renderHtml();
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
  const indentOf = (text: string): number => advanceColumns(text, 0, skipSpaces(text, 0, text.length, 1), 0);
  const read = (source: readonly string[]): MdTree => OurusDoc.parse(source.join('\n'), { config }).mdTree;
  // (by a reduction, not a spread: a clipboard of a hundred thousand lines is past the arguments a call takes)
  // (none from ourus's own copy, written out of its containers: what indentation it has is its own,
  // indented code's)
  const common = ours ? 0 : lines.filter((text) => trimMd(text) !== '').reduce((m, text) => Math.min(m, indentOf(text)), Infinity);
  let source = lines.map((text) => (trimMd(text) === '' ? '' : dropColumns(text, common)));
  // (but a line of blanks in code, math, a comment, HTML is the block's: kept, its share of the common
  // indentation taken off as the others', where the clipboard read so has the line in such a block)
  if (lines.some((text) => text !== '' && trimMd(text) === '')) {
    const tree = read(source);
    source = source.map((text, i) => (text === '' && lines[i] !== '' && trimMd(lines[i]!) === '' && VERBATIM.has(tree.line(i).leaf?.block.type ?? '') ? dropColumns(lines[i]!, common) : text));
  }
  // (ourus's own is written out of its containers: a line in it that looks like a closing fence is code)
  if (ours) return source;
  // (the indentation the fence's other lines share: of those with text, a line of blanks kept as code
  // being no line's indentation)
  const rest = source.slice(1).filter((text) => trimMd(text) !== '');
  const inner = rest.length ? rest.reduce((m, text) => Math.min(m, indentOf(text)), Infinity) : 0;
  if (inner === 0 || indentOf(source[source.length - 1]!) !== inner) return source;
  // a delimited block (a fence, `$$`, `%%`) opened at the first line's start, outside any container
  const opened = (tree: MdTree): MdBlockAt | null => {
    const leaf = tree.line(0).leaf;
    return leaf && leaf.line === 0 && !tree.line(0).containers.length && tree.flavor.delimited(leaf.block) && tree.markup(0).marks.find((m) => m.kind === 'open')?.from === 0 ? leaf : null;
  };
  const as = opened(read(source));
  if (!as || as.block.attrs.closed) return source;
  // its last line, without that indentation, the fence's closing (read right under its opening)
  const closing = opened(read([source[0]!, dropColumns(source[source.length - 1]!, inner)]));
  if (!closing?.block.attrs.closed || closing.lastLine !== 1) return source;
  return [source[0]!, ...source.slice(1).map((text) => (text === '' ? '' : dropColumns(text, inner)))];
}

/**
 * A clipboard's Markdown as paste reads it, a document of its own: its lines without the blank ones
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
  // holds it: open, it would run on into the text after the paste (PasteList27); the closing line its
  // opening's delimiter, as indented, under the same containers
  const tree = doc.mdTree;
  const last = tree.line(tree.lineCount - 1).leaf;
  if (last && tree.flavor.delimited(last.block) && !last.block.attrs.closed) {
    const open = tree.markup(last.line).marks.find((m) => m.kind === 'open');
    if (!open) return null;
    source = [...source, tree.continuedLine(last.line, open.to)];
    doc = OurusDoc.parse(source.join('\n'), { config });
  }
  return { doc, inline };
}
