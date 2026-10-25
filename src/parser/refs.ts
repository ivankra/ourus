// Link syntax shared by the block parser (reference definitions) and the inline parser (links):
// labels, destinations and titles, as commonmark.js 0.31.2 scans them.

import { normalizeLabel, normalizeUri, unescapeString } from './chars.ts';

const ESCAPED = '\\\\[!-/:-@[-`{-~]';
const reTitle = new RegExp(
  `"(?:${ESCAPED}|\\\\[^\\\\]|[^\\\\"\\x00])*"|'(?:${ESCAPED}|\\\\[^\\\\]|[^\\\\'\\x00])*'|\\((?:${ESCAPED}|\\\\[^\\\\]|[^\\\\()\\x00])*\\)`,
  'y',
);
const reDestinationBraces = /<(?:[^<>\n\\\x00]|\\.)*>/y;
const reLabel = /\[(?:[^\\[\]]|\\.){0,1000}\]/ys;
const reSpnl = / *(?:\n *)?/y;
const reSpaceAtLineEnd = / *(?:\n|$)/y;

/** Length of the match of sticky `re` at `pos`, or -1. */
function matchAt(re: RegExp, s: string, pos: number): number {
  re.lastIndex = pos;
  return re.test(s) ? re.lastIndex - pos : -1;
}

/** Spaces with at most one line ending in between, from `pos`: where they end. */
export function skipSpnl(s: string, pos: number): number {
  reSpnl.lastIndex = pos;
  reSpnl.test(s);
  return reSpnl.lastIndex;
}

/** The end of a link label (`[...]`, at most 999 characters inside) starting at `pos`, or -1. */
export function scanLabel(s: string, pos: number): number {
  const n = matchAt(reLabel, s, pos);
  return n < 0 || n > 1001 ? -1 : pos + n;
}

/** A link destination at `pos`: its end and its value (unescaped and URL-normalized), or null. */
export function scanDestination(s: string, pos: number): { end: number; value: string } | null {
  const braced = matchAt(reDestinationBraces, s, pos);
  if (braced >= 0) return { end: pos + braced, value: normalizeUri(unescapeString(s.slice(pos + 1, pos + braced - 1))) };
  if (s.charCodeAt(pos) === 60 /* < */) return null;
  let i = pos;
  let parens = 0;
  for (; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 92 /* \ */ && isEscapable(s.charCodeAt(i + 1))) i++;
    else if (c === 40 /* ( */) {
      // nesting is capped, as cmark does it (the spec allows a limit): else `[a](b` repeated is quadratic
      if (++parens > 32) return null;
    }
    else if (c === 41 /* ) */) {
      if (parens < 1) break;
      parens--;
    } else if (c === 32 || (c >= 9 && c <= 13)) break;
  }
  if (i === pos && s.charCodeAt(i) !== 41) return null;
  if (parens !== 0) return null;
  return { end: i, value: normalizeUri(unescapeString(s.slice(pos, i))) };
}

/** A link title (`"..."`, `'...'` or `(...)`) at `pos`: its end and its unescaped value, or null. */
export function scanTitle(s: string, pos: number): { end: number; value: string } | null {
  const n = matchAt(reTitle, s, pos);
  return n < 0 ? null : { end: pos + n, value: unescapeString(s.slice(pos + 1, pos + n - 1)) };
}

const isEscapable = (c: number): boolean => (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126);

export interface MdReference {
  /** The label as written, brackets included. */
  readonly label: string;
  readonly destination: string;
  readonly title: string;
}

/**
 * The link reference definition at `pos` in `s` (a paragraph's content, lines joined by `\n`): where
 * it ends (after its line ending) and what it defines, or null. A definition always ends at a line
 * end.
 */
export function scanReference(s: string, pos = 0): { end: number; reference: MdReference; normalized: string } | null {
  const labelEnd = scanLabel(s, pos);
  if (labelEnd < 0 || s.charCodeAt(labelEnd) !== 58 /* : */) return null;
  const label = s.slice(pos, labelEnd);
  const dest = scanDestination(s, skipSpnl(s, labelEnd + 1));
  if (!dest) return null;
  const beforeTitle = dest.end;
  let end = skipSpnl(s, beforeTitle);
  let title: { end: number; value: string } | null = null;
  if (end !== beforeTitle) title = scanTitle(s, end);
  if (title) end = title.end;
  else end = beforeTitle;
  let lineEnd = matchAt(reSpaceAtLineEnd, s, end);
  if (lineEnd < 0) {
    if (!title) return null;
    // the title isn't at the line end, but the definition may still end at the destination
    title = null;
    end = beforeTitle;
    lineEnd = matchAt(reSpaceAtLineEnd, s, end);
    if (lineEnd < 0) return null;
  }
  const normalized = normalizeLabel(label);
  if (normalized === '') return null;
  return { end: end + lineEnd, reference: { label, destination: dest.value, title: title?.value ?? '' }, normalized };
}
