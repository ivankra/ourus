// What a line is made of past its containers' prefix (`MdLineMarkup`): each leaf type says where its
// markup and its text are on its lines (`Extension.lineMarkup`); these are CommonMark's. A line
// without a leaf, or of a leaf without markup, is text from where its leaf's text starts.

import { isSpaceOrTab } from './chars.ts';
import type { MdTree } from './syntax.ts';

import type { MdBlockAt, MdMark, MdLineMarkup } from './types.ts';

/** A leaf type's markup on line `line` of it. */
export type MdLineMarkupOf = (tree: MdTree, leaf: MdBlockAt, line: number) => MdLineMarkup;

/** Past the spaces and tabs from `pos`, up to `limit` (back, with `limit` below `pos`). */
function skip(text: string, pos: number, limit: number): number {
  if (limit >= pos) while (pos < limit && isSpaceOrTab(text.charCodeAt(pos))) pos++;
  else while (pos > limit && isSpaceOrTab(text.charCodeAt(pos - 1))) pos--;
  return pos;
}

/** Line `line` as text, from where its leaf's text starts (its content's start, without one) to its end. */
export function plainMarkup(tree: MdTree, line: number): MdLineMarkup {
  const info = tree.line(line);
  const start = tree.textStart(line);
  return { marks: [], textFrom: start < 0 ? info.contentFrom : start, textTo: info.to };
}

/** A line of markup alone, `kind` over what it holds past its indentation. */
function markOnly(tree: MdTree, line: number, kind: string): MdLineMarkup {
  const { text } = tree;
  const info = tree.line(line);
  const from = skip(text, info.contentFrom, info.to);
  const to = skip(text, info.to, from);
  return { marks: [{ kind, from, to }], textFrom: to, textTo: to };
}

/**
 * A heading: an ATX heading's `#`s, then its title, then a closing sequence (`#`s alone, or after a
 * space); a setext heading's lines of text, then its underline. The title's trailing spaces are its
 * text where it has no closing sequence, as a paragraph's are.
 */
function headingMarkup(tree: MdTree, leaf: MdBlockAt, line: number): MdLineMarkup {
  if (leaf.block.attrs.setext) return line === leaf.lastLine ? markOnly(tree, line, 'underline') : plainMarkup(tree, line);
  const { text } = tree;
  const info = tree.line(line);
  const from = skip(text, info.contentFrom, info.to);
  let hashes = from;
  while (hashes < info.to && text.charCodeAt(hashes) === 35) hashes++;
  const marks: MdMark[] = [{ kind: 'open', from, to: hashes }];
  const textFrom = skip(text, hashes, info.to);
  let textTo = info.to;
  const end = skip(text, info.to, textFrom);
  let close = end;
  while (close > textFrom && text.charCodeAt(close - 1) === 35) close--;
  if (close < end && (close === textFrom || isSpaceOrTab(text.charCodeAt(close - 1)))) {
    marks.push({ kind: 'close', from: close, to: end });
    textTo = skip(text, close, textFrom);
  }
  return { marks, textFrom, textTo };
}

/** Fenced code: the opening fence's run and info string, the closing fence's run; its other lines are code. */
function codeMarkup(tree: MdTree, leaf: MdBlockAt, line: number): MdLineMarkup {
  const { attrs } = leaf.block;
  const opening = line === leaf.line;
  if (!attrs.fenced || (!opening && !(attrs.closed && line === leaf.lastLine))) return plainMarkup(tree, line);
  const { text } = tree;
  const info = tree.line(line);
  const from = skip(text, info.contentFrom, info.to);
  let run = from;
  while (run < info.to && text[run] === attrs.fenceChar) run++;
  const marks: MdMark[] = [{ kind: opening ? 'open' : 'close', from, to: run }];
  const infoFrom = skip(text, run, info.to);
  const infoTo = skip(text, info.to, infoFrom);
  if (opening && infoFrom < infoTo) marks.push({ kind: 'info', from: infoFrom, to: infoTo });
  return { marks, textFrom: info.to, textTo: info.to };
}

export const coreLineMarkup: Readonly<Record<string, MdLineMarkupOf>> = {
  heading: headingMarkup,
  code_block: codeMarkup,
  thematic_break: (tree, _leaf, line) => markOnly(tree, line, 'rule'),
};
