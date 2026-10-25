// A leaf's inline text: the source ranges its inlines are parsed from, joined, with the mapping
// between offsets in the joined text and offsets in the document.

import { isSpaceOrTab } from './chars.ts';
import type { MdTree } from './syntax.ts';

import type { MdBlockAt, MdInlineText } from './types.ts';

/** NUL reads as the replacement character. */
const clean = (s: string): string => (s.indexOf('\0') < 0 ? s : s.replace(/\0/g, '\uFFFD'));

/** Builds an `MdInlineText` from source ranges. */
export class MdInlineTextBuilder {
  private text = '';
  private readonly textStarts: number[] = [];
  private readonly sourceStarts: number[] = [];
  private readonly lengths: number[] = [];
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  /**
   * Appends the source text `[from, to)`. An empty part still marks its place: the text there (an
   * empty line a placeholder holds, an empty heading) maps to it.
   */
  add(from: number, to: number): void {
    this.textStarts.push(this.text.length);
    this.sourceStarts.push(from);
    if (to <= from) {
      this.lengths.push(0);
      return;
    }
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

  finish(): MdInlineText {
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
export function paragraphText(tree: MdTree, leaf: MdBlockAt, endLine = leaf.lastLine, startAt = -1): MdInlineText {
  const b = new MdInlineTextBuilder(tree.text);
  const { text } = tree;
  for (let l = leaf.line; l <= endLine; l++) {
    let from = l === leaf.line && startAt >= 0 ? startAt : tree.textStart(l);
    let to = tree.ends[l]!;
    if (from < 0) from = to;
    if (l === leaf.line) while (from < to && isSpaceOrTab(text.charCodeAt(from))) from++;
    if (l === endLine) while (to > from && isTrimmable(text.charCodeAt(to - 1))) to--;
    if (l > leaf.line) b.newline(tree.ends[l - 1]!);
    b.add(from, to);
  }
  return b.finish();
}

const isTrimmable = (c: number): boolean => c === 32 || c === 9 || c === 10 || c === 13;

/** An ATX heading's inline text: between its `#`s and its closing sequence, trimmed. */
export function atxHeadingText(tree: MdTree, leaf: MdBlockAt): MdInlineText {
  const { text } = tree;
  const { textFrom, textTo } = tree.markup(leaf.line);
  let to = textTo;
  while (to > textFrom && isSpaceOrTab(text.charCodeAt(to - 1))) to--;
  const b = new MdInlineTextBuilder(text);
  b.add(textFrom, to);
  return b.finish();
}

export const coreInlineText = {
  paragraph: (tree: MdTree, leaf: MdBlockAt): MdInlineText => paragraphText(tree, leaf),
  heading: (tree: MdTree, leaf: MdBlockAt): MdInlineText => (leaf.block.attrs.setext ? paragraphText(tree, leaf, leaf.lastLine - 1) : atxHeadingText(tree, leaf)),
};
