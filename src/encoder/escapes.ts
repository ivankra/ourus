// Text at a line's start, where it can mean something else: a block start, a list marker, a
// setext underline, a link reference definition. Where it must stay text, a backslash escapes it.
// What counts as a block start is the flavor's (`Flavor.startsBlock`).

import type { Flavor } from '../parser/index.ts';
import { trimMd, trimMdStart } from '../text.ts';

const reListMarker = /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/;

/** Where a line's escape goes: after an ordered marker's digits (a backslash before a digit escapes nothing), else at its start. */
const escapePoint = (text: string): number => /^\d*/.exec(text)![0].length;

/**
 * `text` escaped where it would not read as text at a line's start, and where the backslash went
 * (null when it needs none). `start`: the line starts a node's text, where any block start or list
 * marker would take it; `continuation`: it continues a paragraph, where only a block that
 * interrupts one (or a setext underline) would, or what other readers take for a block there
 * (`readsAsBlockElsewhere`). With `below`, the lines after it: also where it and they would read
 * as a link reference definition.
 */
export function escape(flavor: Flavor, text: string, where: 'start' | 'continuation', below?: readonly string[]): { text: string; at: number | null } {
  const needed =
    where === 'start'
      ? flavor.startsBlock(text, false) || reListMarker.test(text) || (below !== undefined && readsAsReference(flavor, text, below))
      : flavor.startsBlock(text, true) || readsAsBlockElsewhere(text);
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

/**
 * Whether a line continuing a paragraph reads as a block to another reader, though not to the flavor:
 * an ordered item from any number (CommonMark lets only `1.` interrupt a paragraph, but lezer, in
 * CodeMirror and Obsidian's Live Preview, nests it), or a table's delimiter row (which makes the line
 * above a table's header in GFM). Escaped in every flavor, so the text is the same in each.
 */
function readsAsBlockElsewhere(text: string): boolean {
  if (/^\d{1,9}[.)][ \t]+[^ \t]/.test(text)) return true;
  if (!text.includes('|')) return false;
  const cells = trimMd(text).replace(/^\|/, '').replace(/\|$/, '').split('|');
  return cells.every((cell) => /^[ \t]*:?-+:?[ \t]*$/.test(cell));
}

/** Whether `text`, on the line after paragraph text, starts a block of its own rather than continuing it. */
export function interruptsParagraph(flavor: Flavor, text: string): boolean {
  if (flavor.startsBlock(text, true)) return true;
  // a list item with text interrupts a paragraph; an ordered one only from 1
  const m = reListMarker.exec(text);
  return !!m && trimMd(text.slice(m[0].length)) !== '' && (!/^\d/.test(text) || /^0*1[.)]/.test(text));
}

const readsAsReference = (flavor: Flavor, text: string, below: readonly string[]): boolean =>
  flavor.readsAsReference([text, ...below.map((line) => trimMdStart(line))].join('\n'));
