// A node's text read from the document: its own lines past their containers'
// prefixes, the first line's padding left out, markup escapes left out where they are markup, its
// placeholders as marks; and where each of its offsets is in the document.

import type { MdBlock, MdLine, MdTree } from '../parser/index.ts';
import { emptyNodeAt, heldSpaceAt, isEmptyNodePlaceholder, isHeldSpacePlaceholder, MarkSet, type Mark } from '../text/index.ts';
import type { OutlineNode } from './node.ts';
import { markupEscapes } from './escapes.ts';
import { ProseText, AtomText, type OutlineNodeText, type ProseTextType } from './text.ts';

/** Where a text's line is in the document: its first character's offset, and the offsets left out of it (a markup escape, a held space). */
export interface TextLine {
  readonly from: number;
  /** Where the line's content ends in the document. */
  readonly to: number;
  /** Document offsets of characters not in the string, in order. */
  readonly omitted: readonly number[];
  /** A tab its containers took part of, written as the spaces left of it: its offset, and how many. */
  readonly tab: { readonly at: number; readonly spaces: number } | null;
  /** Its length in the text's string. */
  readonly length: number;
}

export interface ReadText {
  readonly text: OutlineNodeText;
  /** Each line of the text, in order. */
  readonly lines: readonly TextLine[];
}

/**
 * The text of `node` in `tree`, with `marks` (the document's placeholders); null for a node with no
 * text. A quote that is a node's text (`Config.quotes`: `text`, a paragraph framed by its `>`s; `atom`, its
 * lines as written) is read from its own `>` on each line.
 */
export function readText(tree: MdTree, marks: MarkSet, node: OutlineNode): ReadText | null {
  const p = node.persistentNode;
  const flavor = tree.flavor;
  if (p.kind === 'root') return null;
  let type: ProseTextType = 'paragraph';
  let atomText = false;
  let below = false;
  let first: number;
  let last: number;
  // a quote that is the node's text, whose `>`s its text keeps
  const quote = p.textQuote;
  if (p.kind === 'atom') {
    atomText = true;
    first = node.startLine;
    last = node.textLastLine;
  } else if (p.kind === 'item') {
    if (!p.head) {
      // its first block on its own line is a quote's or a list's: no text; else its marker line's (`- `, `- [ ]`)
      if (p.block!.children.length && p.block!.offsets[0] === 0) return null;
      first = last = node.startLine;
    } else {
      // (an atom's lines as written: code, a table, a rule; a paragraph's or a heading's prose)
      atomText = quote ? quote === p.head : p.head.type !== 'paragraph' && p.head.type !== 'heading';
      type = p.head.type === 'heading' ? 'heading' : quote ? 'quote' : 'paragraph';
      first = node.textFirstLine;
      last = node.textLastLine;
      below = first > node.startLine;
    }
  } else if (p.kind === 'quote') {
    if (!p.head) return null;
    type = 'title';
    first = node.textFirstLine;
    last = node.textLastLine;
  } else {
    type = p.kind === 'heading' ? 'heading' : quote ? 'quote' : 'paragraph';
    first = node.textFirstLine;
    last = node.textLastLine;
  }
  const item = p.kind === 'item';
  const lines: { content: string; line: TextLine }[] = [];
  if (below) {
    // the marker's line: a checkbox (`- [x]⏎  a`), else its content (blanks, a tab's rest) isn't text
    const marker = tree.line(node.startLine);
    const content = tree.text.slice(marker.contentFrom, marker.to);
    if (content.trim()) lines.push({ content, line: { from: marker.contentFrom, to: marker.to, omitted: [], tab: null, length: content.length } });
    else {
      const omitted = Array.from({ length: marker.to - marker.contentFrom }, (_, k) => marker.contentFrom + k);
      lines.push({ content: '', line: { from: marker.contentFrom, to: marker.to, omitted, tab: null, length: 0 } });
    }
    // blank lines between the marker's and the text's
    for (let i = node.startLine + 1; i < first; i++) {
      const blank = tree.line(i);
      const omitted = Array.from({ length: blank.to - blank.contentFrom }, (_, k) => blank.contentFrom + k);
      lines.push({ content: '', line: { from: blank.contentFrom, to: blank.to, omitted, tab: null, length: 0 } });
    }
  }
  const textAt = lines.length;
  for (let i = first; i <= last; i++) lines.push(contentOf(tree, tree.line(i), node, i === first && !atomText, marks, quote));
  // an empty line a placeholder holds reads as typed on, as the parse read it
  const held = lines.map(({ line }) => emptyNodeAt(marks, tree.text, line.to));
  if (!atomText) {
    // the markup escapes, left out of the string: each where its line has it as read
    const text = lines.slice(textAt);
    // (each line from the column its content starts at: a tab it starts with spans as far as from there)
    // (a quote's text from its `>`, where a line has one)
    const columns = text.map((_, k) => {
      const line = tree.line(first + k);
      return (quote && line.prefix.find((p) => p.container.block === quote)?.fromColumn) ?? line.contentColumn;
    });
    const found = markupEscapes(flavor, type, item, text.map((l) => l.content), held.slice(textAt), columns);
    for (const [k, entry] of text.entries()) {
      const own = found.filter((e) => e.line === k);
      if (!own.length) continue;
      const at = own.map((e) => documentOffset(entry.line, e.at));
      for (const e of [...own].reverse()) entry.content = entry.content.slice(0, e.at) + entry.content.slice(e.at + 1);
      (entry.line.omitted as number[]).push(...at);
      (entry.line.omitted as number[]).sort((a, b) => a - b);
    }
  }
  // the placeholders on the text's lines, in the string's offsets
  const string = lines.map((l) => l.content).join('\n');
  const points: Mark[] = [];
  let offset = 0;
  for (const { content, line } of lines) {
    marks.between(line.from, line.to, (m) => {
      if (m.from === line.to && isEmptyNodePlaceholder(m, tree.text)) points.push({ ...m, from: offset + content.length, to: offset + content.length });
      else if (line.omitted.includes(m.from) && isHeldSpacePlaceholder(m, tree.text)) points.push({ ...m, from: offset + stringOffset(line, m.from), to: offset + stringOffset(line, m.from) });
    });
    offset += content.length + 1;
  }
  const placeholders = MarkSet.of(points);
  const block = p.kind === 'item' ? p.head : p.block;
  const kind = !atomText ? null : block!.type === 'code_block' ? (block!.attrs.fenced ? 'fenced_code' : 'indented_code') : block!.type;
  return { text: kind ? new AtomText(kind, item, string, placeholders) : new ProseText(type, item, string, placeholders), lines: lines.map((l) => ({ ...l.line, length: l.content.length })) };
}

/** The offset in a line's string of document offset `pos` on it. */
export function stringOffset(line: TextLine, pos: number): number {
  let k = pos - line.from;
  for (const o of line.omitted) if (o < pos) k--;
  if (line.tab && pos > line.tab.at) k += line.tab.spaces - 1;
  return k;
}

/**
 * Line `line`'s content past its containers' prefix, as its text: a tab they took part of as the
 * spaces left of it; on the text's first line, its padding left out, and a held space; a held space
 * at a later line's start too. A footnote definition's label is its own, and so is the `>` of a quote
 * that is the node's text (`quote`), its padding past the `> ` left out on the first line.
 */
function contentOf(tree: MdTree, line: MdLine, node: OutlineNode, first: boolean, marks: MarkSet, quote: MdBlock | null): { content: string; line: TextLine } {
  const text = tree.text;
  let from = line.contentFrom;
  // a footnote definition's label and indentation are its own prefix piece, which its text keeps
  if (node.kind === 'atom' && node.block.type === 'footnote_definition') {
    const piece = line.prefix.find((p) => p.kind === 'footnote');
    if (piece) from = piece.from;
  }
  // (a lazy line has none)
  const own = quote ? line.prefix.find((p) => p.container.block === quote) : undefined;
  if (own) {
    from = own.from;
    if (first) {
      const omitted: number[] = [];
      let k = own.to;
      while (k < line.to && (text[k] === ' ' || text[k] === '\t')) omitted.push(k++);
      const content = text.slice(from, own.to) + text.slice(k, line.to);
      return { content, line: { from, to: line.to, omitted, tab: null, length: content.length } };
    }
  }
  let tab: TextLine['tab'] = null;
  let content = text.slice(from, line.to);
  const omitted: number[] = [];
  const held = (pos: number): boolean => heldSpaceAt(marks, text, pos);
  if (first) {
    // the first line's padding isn't text (a tab its containers took part of included), nor a held space where the text starts
    let k = 0;
    while (k < content.length && (content[k] === ' ' || content[k] === '\t')) k++;
    if (k) {
      for (let j = 0; j < k; j++) omitted.push(from + j);
      content = content.slice(k);
    }
    return { content, line: { from, to: line.to, omitted, tab, length: content.length } };
  }
  if (line.prefix[line.prefix.length - 1]?.partialTab && text[from] === '\t') {
    const spaces = 4 - (line.contentColumn % 4);
    tab = { at: from, spaces };
    content = ' '.repeat(spaces) + content.slice(1);
  } else if (held(from)) {
    omitted.push(from);
    content = content.slice(1);
  }
  return { content, line: { from, to: line.to, omitted, tab, length: content.length } };
}

/**
 * The document offset of offset `k` of a line's string. Where characters are left out at it (a
 * markup escape, a held space), one offset is two positions: `assoc` -1 the one before them, 1 the
 * one after.
 */
export function documentOffset(line: TextLine, k: number, assoc: -1 | 1 = 1): number {
  let pos = line.from + k;
  if (line.tab) {
    if (k < line.tab.spaces && line.tab.at === line.from) return line.tab.at + (k > 0 ? 1 : 0);
    if (line.tab.at === line.from) pos -= line.tab.spaces - 1;
  }
  for (const o of line.omitted) if (o < pos || (o === pos && assoc === 1)) pos++;
  return pos;
}

