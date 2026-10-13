// A leaf's inline text: the source ranges its inlines are parsed from, joined, with the mapping
// between offsets in the joined text and offsets in the document.

import { isSpaceOrTab } from './chars.ts';
import type { Syntax } from './syntax.ts';
import type { Block, InlineText } from './types.ts';

/** NUL reads as the replacement character. */
const clean = (s: string): string => (s.indexOf('\0') < 0 ? s : s.replace(/\0/g, '\uFFFD'));

/** Builds an InlineText from source ranges. */
export class InlineTextBuilder {
  private text = '';
  private readonly textStarts: number[] = [];
  private readonly sourceStarts: number[] = [];
  private readonly lengths: number[] = [];
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  /** Appends the source text `[from, to)`. */
  add(from: number, to: number): void {
    if (to <= from) return;
    this.textStarts.push(this.text.length);
    this.sourceStarts.push(from);
    this.lengths.push(to - from);
    this.text += clean(this.source.slice(from, to));
  }

  /** Appends a line break, standing for the line ending at source offset `at`. */
  newline(at: number): void {
    this.textStarts.push(this.text.length);
    this.sourceStarts.push(at);
    this.lengths.push(0);
    this.text += '\n';
  }

  finish(): InlineText {
    const { text, textStarts, sourceStarts, lengths } = this;
    const find = (keys: readonly number[], x: number): number => {
      let lo = 0;
      let hi = keys.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (keys[mid]! <= x) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    };
    return {
      text,
      sourceAt(i) {
        if (textStarts.length === 0) return 0;
        const k = find(textStarts, i);
        const off = i - textStarts[k]!;
        return sourceStarts[k]! + Math.min(off, lengths[k]!);
      },
      textAt(pos) {
        if (textStarts.length === 0) return -1;
        const k = find(sourceStarts, pos);
        const off = pos - sourceStarts[k]!;
        if (off < 0 || off > lengths[k]!) return -1;
        return textStarts[k]! + off;
      },
    };
  }
}

/**
 * A paragraph's (or setext heading's) inline text: its lines from where their text starts, joined
 * by line breaks, trailing whitespace off the end. `startAt` overrides where the first line starts.
 */
export function paragraphText(syntax: Syntax, block: Block, endLine = block.endLine, startAt = -1): InlineText {
  const b = new InlineTextBuilder(syntax.text);
  const { text } = syntax;
  for (let l = block.startLine; l <= endLine; l++) {
    let from = l === block.startLine && startAt >= 0 ? startAt : syntax.textStart(l);
    let to = syntax.ends[l]!;
    if (from < 0) from = to;
    if (l === block.startLine) while (from < to && isSpaceOrTab(text.charCodeAt(from))) from++;
    if (l === endLine) while (to > from && isTrimmable(text.charCodeAt(to - 1))) to--;
    if (l > block.startLine) b.newline(syntax.ends[l - 1]!);
    b.add(from, to);
  }
  return b.finish();
}

const isTrimmable = (c: number): boolean => c === 32 || c === 9 || c === 10 || c === 13;

/** An ATX heading's inline text: between its `#`s and its closing sequence, trimmed. */
export function atxHeadingText(syntax: Syntax, block: Block): InlineText {
  const { text } = syntax;
  const line = syntax.lines[block.startLine]!;
  let from = line.contentFrom;
  let to = line.to;
  while (from < to && isSpaceOrTab(text.charCodeAt(from))) from++;
  while (from < to && text.charCodeAt(from) === 35) from++;
  while (from < to && isSpaceOrTab(text.charCodeAt(from))) from++;
  // a closing sequence: `#`s alone, or after a space
  let end = to;
  while (end > from && isSpaceOrTab(text.charCodeAt(end - 1))) end--;
  let hashes = end;
  while (hashes > from && text.charCodeAt(hashes - 1) === 35) hashes--;
  if (hashes < end && (hashes === from || isSpaceOrTab(text.charCodeAt(hashes - 1)))) end = hashes;
  while (end > from && isSpaceOrTab(text.charCodeAt(end - 1))) end--;
  to = end;
  const b = new InlineTextBuilder(text);
  b.add(from, to);
  return b.finish();
}

export const coreInlineText = {
  paragraph: (syntax: Syntax, block: Block): InlineText => paragraphText(syntax, block),
  heading: (syntax: Syntax, block: Block): InlineText => (block.setext ? paragraphText(syntax, block, block.endLine - 1) : atxHeadingText(syntax, block)),
};
