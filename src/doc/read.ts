// A node's text read from the document: its own lines past their containers'
// prefixes, the first line's padding left out, markup escapes left out where they are markup, its
// placeholders as marks; and where each of its offsets is in the document.

import type { MdBlock, MdLine, MdTree } from '../parser/index.ts';
import { emptyNodeAt, heldSpaceAt, isEmptyNodePlaceholder, isHeldSpacePlaceholder, MarkSet, trimMd, type Mark } from '../text/index.ts';
import type { OurusNode } from './node.ts';
import { markupEscapes } from './escapes.ts';
import { OurusProse, OurusAtom, type OurusText, type OurusProseType } from './text.ts';

/** Where a text's line is in the document: its first character's offset, and the offsets left out of it (a markup escape, a held space). */
export interface TextLine {
  readonly from: number;
  /** Where the line's content ends in the document. */
  readonly to: number;
  /** Document offsets of characters not in the string, in order. */
  readonly omitted: readonly number[];
  /**
   * A tab its containers took part of, written as the spaces left of it, and each tab of the blanks
   * after it as the spaces it spans from where it is: their offsets, and how many, in order.
   */
  readonly tabs: readonly { readonly at: number; readonly spaces: number }[];
  /** Its length in the text's string. */
  readonly length: number;
}

export interface ReadText {
  readonly text: OurusText;
  /** Each line of the text, in order. */
  readonly lines: readonly TextLine[];
}

/**
 * The text of `node` in `tree`, with `marks` (the document's placeholders); null for a node with no
 * text. A quote that is a node's text (`OurusConfig.quotes`: `text`, a paragraph framed by its
 * `>`s; `atom`, its lines as written) is read from its own `>` on each line.
 */
export function readText(tree: MdTree, marks: MarkSet, node: OurusNode): ReadText | null {
  const p = node.persistentNode;
  const flavor = tree.flavor;
  if (p.kind === 'root') return null;
  let type: OurusProseType = 'paragraph';
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
    if (trimMd(content)) lines.push({ content, line: { from: marker.contentFrom, to: marker.to, omitted: [], tabs: [], length: content.length } });
    else {
      const omitted = Array.from({ length: marker.to - marker.contentFrom }, (_, k) => marker.contentFrom + k);
      lines.push({ content: '', line: { from: marker.contentFrom, to: marker.to, omitted, tabs: [], length: 0 } });
    }
    // blank lines between the marker's and the text's
    for (let i = node.startLine + 1; i < first; i++) {
      const blank = tree.line(i);
      const omitted = Array.from({ length: blank.to - blank.contentFrom }, (_, k) => blank.contentFrom + k);
      lines.push({ content: '', line: { from: blank.contentFrom, to: blank.to, omitted, tabs: [], length: 0 } });
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
  return { text: kind ? new OurusAtom(kind, item, string, placeholders) : new OurusProse(type, item, string, placeholders), lines: lines.map((l) => ({ ...l.line, length: l.content.length })) };
}

/** The offset in a line's string of document offset `pos` on it. */
export function stringOffset(line: TextLine, pos: number): number {
  let k = pos - line.from;
  for (const o of line.omitted) if (o < pos) k--;
  for (const t of line.tabs) if (pos > t.at) k += t.spaces - 1;
  return k;
}

/**
 * Line `line`'s content past its containers' prefix, as its text: a tab they took part of as the
 * spaces left of it; on the text's first line, its padding left out, and a held space; a held space
 * at a later line's start too. A footnote definition's label is its own, and so is the `>` of a quote
 * that is the node's text (`quote`), its padding past the `> ` left out on the first line.
 */
function contentOf(tree: MdTree, line: MdLine, node: OurusNode, first: boolean, marks: MarkSet, quote: MdBlock | null): { content: string; line: TextLine } {
  const text = tree.text;
  let from = line.contentFrom;
  // a footnote definition's label and indentation are its own prefix piece, which its text keeps
  // (an item's too, whose text the definition is)
  if ((node.kind === 'atom' ? node.block : node.kind === 'item' ? node.persistentNode.head : null)?.type === 'footnote_definition') {
    const piece = line.prefix.find((p) => p.kind === 'footnote');
    if (piece) from = piece.from;
  }
  // (a lazy line has none)
  const own = quote ? line.prefix.find((p) => p.container.block === quote) : undefined;
  if (own) {
    from = own.from;
    // (its `>` past a tab the container before it took part of, `>→> q`: the rest of that tab, the
    // spaces it spans)
    const before = line.prefix[line.prefix.indexOf(own) - 1];
    const tabs = before?.partialTab && text[from] === '\t' ? [{ at: from, spaces: 4 - (before.toColumn % 4) }] : [];
    const lead = tabs.length ? ' '.repeat(tabs[0]!.spaces) + text.slice(from + 1, own.to) : text.slice(from, own.to);
    if (first) {
      const omitted: number[] = [];
      let k = own.to;
      while (k < line.to && (text[k] === ' ' || text[k] === '\t')) omitted.push(k++);
      const content = lead + text.slice(k, line.to);
      return { content, line: { from, to: line.to, omitted, tabs, length: content.length } };
    }
    if (tabs.length) {
      const content = lead + text.slice(own.to, line.to);
      return { content, line: { from, to: line.to, omitted: [], tabs, length: content.length } };
    }
  }
  const tabs: { at: number; spaces: number }[] = [];
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
    return { content, line: { from, to: line.to, omitted, tabs, length: content.length } };
  }
  if (line.prefix[line.prefix.length - 1]?.partialTab && text[from] === '\t') {
    // (and the tabs of the blanks after it, which span from the columns they are at: read from the
    // line's content start, they would span otherwise)
    let column = line.contentColumn;
    let k = from;
    let lead = '';
    for (; k < line.to && (text[k] === ' ' || text[k] === '\t'); k++) {
      const spaces = text[k] === '\t' ? 4 - (column % 4) : 1;
      if (text[k] === '\t') tabs.push({ at: k, spaces });
      lead += ' '.repeat(spaces);
      column += spaces;
    }
    content = lead + text.slice(k, line.to);
  } else if (held(from)) {
    omitted.push(from);
    content = content.slice(1);
  }
  return { content, line: { from, to: line.to, omitted, tabs, length: content.length } };
}

/**
 * The document offset of offset `k` of a line's string. Where characters are left out at it (a
 * markup escape, a held space), one offset is two positions: `assoc` -1 the one before them, 1 the
 * one after.
 */
export function documentOffset(line: TextLine, k: number, assoc: -1 | 1 = 1): number {
  // (in a tab written as spaces: before it at its first, after it past that)
  let shown = 0;
  let at = line.from;
  for (const t of line.tabs) {
    if (k < shown + (t.at - at)) break;
    shown += t.at - at;
    if (k < shown + t.spaces) return t.at + (k > shown ? 1 : 0);
    shown += t.spaces;
    at = t.at + 1;
  }
  let pos = at + (k - shown);
  for (const o of line.omitted) if (o < pos || (o === pos && assoc === 1)) pos++;
  return pos;
}

