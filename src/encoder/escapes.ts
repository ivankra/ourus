// Text at a line's start, where it can mean something else: a block start, a list marker, a
// setext underline, a link reference definition. Where it must stay text, a backslash escapes it.
// What counts as a block start is the flavor's (`Flavor.startsBlock`).

import type { Flavor } from '../parser/index.ts';

const reListMarker = /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/;

/** Where a line's escape goes: after an ordered marker's digits (a backslash before a digit escapes nothing), else at its start. */
const escapePoint = (text: string): number => /^\d*/.exec(text)![0].length;

/**
 * `text` escaped where it would not read as text at a line's start, and where the backslash went
 * (null when it needs none). `start`: the line starts a node's text, where any block start or list
 * marker would take it; `continuation`: it continues a paragraph, where only a block that
 * interrupts one (or a setext underline) would. With `below`, the lines after it: also where it
 * and they would read as a link reference definition.
 */
export function escape(flavor: Flavor, text: string, where: 'start' | 'continuation', below?: readonly string[]): { text: string; at: number | null } {
  const needed =
    where === 'start'
      ? flavor.startsBlock(text, false) || reListMarker.test(text) || (below !== undefined && readsAsReference(flavor, text, below))
      : flavor.startsBlock(text, true);
  if (!needed) return { text, at: null };
  const at = escapePoint(text);
  return { text: text.slice(0, at) + '\\' + text.slice(at), at };
}

/**
 * How text written at the start of a new node reads: a list marker it starts with becomes the new
 * node's marker (`- abc ┃- def` makes two items, `marker` its length); text that would open another
 * block there, or make it and the `below` lines a link reference definition, needs an escape.
 */
export function startOfNode(flavor: Flavor, text: string, below: readonly string[]): { escape: boolean; marker: number } {
  if (flavor.startsBlock(text, false) || readsAsReference(flavor, text, below)) return { escape: true, marker: 0 };
  const m = reListMarker.exec(text);
  return { escape: false, marker: m ? m[0].length : 0 };
}

/** Whether `text`, on the line after paragraph text, starts a block of its own rather than continuing it. */
export function interruptsParagraph(flavor: Flavor, text: string): boolean {
  if (flavor.startsBlock(text, true)) return true;
  // a list item with text interrupts a paragraph; an ordered one only from 1
  const m = reListMarker.exec(text);
  return !!m && text.slice(m[0].length).trim() !== '' && (!/^\d/.test(text) || /^0*1[.)]/.test(text));
}

const readsAsReference = (flavor: Flavor, text: string, below: readonly string[]): boolean =>
  flavor.readsAsReference([text, ...below.map((line) => line.trimStart())].join('\n'));
