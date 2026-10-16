// Placeholders: offsets read as if text had been typed there, so an empty node the user is about to
// fill exists in the outline. Which offsets can be one.

import { lineSpan } from '../text.ts';

/** A placeholder stays one while its line holds no text: nothing, or only container markers (a task's checkbox included). */
const reEmptyPlaceLine = /^(?:[ \t>]|(?:[-+*]|\d{1,9}[.)])[ \t]+(?:\[[ xX]\][ \t]+)?)*$/;

/** A marker and its one padding space, after the line's containers: what precedes a stand-in space. */
const reMarkerAndSpace = /^[ \t>]*(?:[-+*]|\d{1,9}[.)])[ \t]$/;

/**
 * Whether `p` can be a placeholder: the end of a line holding no text, or a space right after a list
 * marker's padding space, with text after it (a deleted character's place, read as text).
 */
export function isPlace(text: string, p: number): boolean {
  if (p < 0 || p > text.length) return false;
  let start = p;
  while (start > 0 && text.charCodeAt(start - 1) !== 10 && text.charCodeAt(start - 1) !== 13) start--;
  const c = text.charCodeAt(p);
  if (p === text.length || c === 10 || c === 13) return reEmptyPlaceLine.test(text.slice(start, p));
  if (c !== 32 && c !== 9) return false;
  return reMarkerAndSpace.test(text.slice(start, p)) && text.slice(p, lineSpan(text, p)[1]).trim() !== '';
}

export function validPlaces(text: string, marks: readonly number[]): number[] {
  return [...new Set(marks.filter((p) => isPlace(text, p)))].sort((a, b) => a - b);
}
