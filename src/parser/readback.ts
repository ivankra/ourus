// How lines read back: written where a node's text goes, do they stay a paragraph's lines, and which
// backslashes keep them so? Asked of the parser itself, in the flavor, so the answer is exact: what
// reading text and writing it (escaping) share.

import type { MdFlavor } from './flavor.ts';
import { MdTree } from './syntax.ts';

/**
 * Where lines go, for `MdFlavor.firstNonParagraph`: `start`, the first lines of a node's text;
 * `continuation`, after a line of a paragraph; `quoteStart`, the first lines in a quote.
 */
export type MdLineContext = 'start' | 'continuation' | 'quoteStart';

/**
 * The first of `lines`, written in `context`, that doesn't stay paragraph text (it starts a block,
 * ends the paragraph, underlines it, or makes it a link reference definition), or -1 when every one
 * does. Blank lines alone are an empty text, which stays one. `above`: in `continuation`, the
 * paragraph's line they follow, as written (what a table's delimiter row is matched against); a
 * one-word line by default. `lazy`: in `quoteStart`, the lines written without the quote's `>`, its
 * paragraph's lazy continuations, which out of the quote may start a block it couldn't interrupt
 * there (`> q⏎2) x`, a list from 2).
 */
export function firstNonParagraph(flavor: MdFlavor, lines: readonly string[], context: MdLineContext = 'start', above = 'x', lazy?: readonly boolean[]): number {
  if (lines.length === 0 || lines.every((l) => l.trim() === '')) return -1;
  const lead = context === 'continuation' ? 1 : 0;
  const written = context === 'quoteStart' ? lines.map((l, k) => (lazy?.[k] ? l : '> ' + l)) : context === 'continuation' ? [above, ...lines] : lines;
  const tree = MdTree.parse(written.join('\n'), flavor);
  // (a quote's children start where it does, on line 0; it ends where a lazy line starts a block)
  let parent = tree.root;
  let ends = written.length;
  if (context === 'quoteStart') {
    const quote = parent.children[0];
    if (!quote || quote.type !== 'blockquote' || quote.attrs.callout) return 0;
    if (parent.children.length > 1) ends = parent.offsets[1]!;
    parent = quote;
  }
  const first = parent.children[0];
  const start = parent.offsets[0];
  const end = first ? start! + first.lines - 1 : 0;
  // a setext heading from the first line: its underline is the line that changed it
  if (first?.type === 'heading' && first.attrs.setext && start === 0) return end - lead;
  if (!first || first.type !== 'paragraph' || start !== 0) return 0;
  if (end === ends - 1 && parent.children.length === 1) return ends === written.length ? -1 : ends;
  // the paragraph stopped early: the line after it is the one
  return Math.max(0, end + 1 - lead);
}

const reDigits = /^\d{1,9}$/;
const reLabel = /^\[(?:[^\\[\]]|\\.)+\]$/;
const reDelimiterRow = /^\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

/**
 * Whether a backslash at `at` in `line` (a line's content past its containers' prefix) is at one of
 * the flavor's markup-escape positions: where an escape can break the line's block
 * syntax and, there, means nothing inline. A line's first character among `-`, `+`, `#`, `>`, `=`
 * (in Obsidian `#` only before a space, a tab or the line's end, where a tag can't start, and no `=`,
 * which highlights); the `.` or `)` after a line-start run of digits; the `:` after a line-start link
 * label; the first `-` of a line that would be a table's delimiter row, where tables are read.
 * Whether the line needs it, and whether the parser reads the backslash as an escape there, are
 * other questions (`MdTree.inlineEscapeAt`, `firstNonParagraph`).
 */
export function markupEscapeAt(flavor: MdFlavor, line: string, at: number): boolean {
  if (line[at] !== '\\') return false;
  const c = line[at + 1];
  if (c === undefined) return false;
  let lead = 0;
  let column = 0;
  while (lead < line.length && (line[lead] === ' ' || line[lead] === '\t')) column = line[lead++] === '\t' ? column + 4 - (column % 4) : column + 1;
  // four columns in, a line starts no block: indented code, or a paragraph's continuation
  if (column >= 4 || at < lead) return false;
  if (at === lead) {
    if (c === '-' || c === '+' || c === '>') return true;
    if (c === '#') return !flavor.has('tags') || at + 2 >= line.length || line[at + 2] === ' ' || line[at + 2] === '\t';
    if (c === '=') return !flavor.has('highlights');
  }
  const before = line.slice(lead, at);
  if ((c === '.' || c === ')') && reDigits.test(before)) return true;
  if (c === ':' && reLabel.test(before)) return true;
  if (c === '-' && flavor.has('table') && !before.includes('-')) return reDelimiterRow.test(line.slice(lead, at) + line.slice(at + 1));
  return false;
}

/**
 * Where a paragraph's lines are asked about: `context` (`start` by default) and, in `continuation`,
 * `above`, as for `firstNonParagraph`; `below`, the lines after them up to the next blank one, which
 * can change how the last of them reads (a definition's lines).
 */
export interface MdParagraphPlace {
  readonly context?: MdLineContext;
  readonly above?: string;
  readonly below?: readonly string[];
  /** In `quoteStart`, the lines written without the quote's `>` (`firstNonParagraph`). */
  readonly lazy?: readonly boolean[];
}

/** A backslash in a paragraph's lines: before offset `at` of line `line`. */
export interface MdEscapeAt {
  readonly line: number;
  readonly at: number;
}

/** A paragraph's lines spelled where they are written (`MdFlavor.escapeParagraph`). */
export interface MdEscapedParagraph {
  /** The backslashes of the lines given that are markup escapes there, in those lines: out of the text. */
  readonly absorbed: readonly MdEscapeAt[];
  /** The lines as text: without the absorbed backslashes, with the ones the text gains. */
  readonly lines: readonly string[];
  /** Where markup escapes are written, in `lines`. */
  readonly markup: readonly MdEscapeAt[];
  /** The backslashes the text gains, in `lines` as they are without them, in order. */
  readonly gained: readonly MdEscapeAt[];
}

/**
 * The backslashes of `lines`, as written at `place`, that are markup escapes: at
 * one of the flavor's positions, an inline escape there, and needed: without it (and the markup
 * escapes found to its left on its line), the lines wouldn't stay a paragraph's. Each is judged
 * against the lines as written, every other line's backslashes in, so a line's are its own.
 */
export function markupEscapes(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace = {}): MdEscapeAt[] {
  const out: MdEscapeAt[] = [];
  let tree: MdTree | null = null;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]!;
    let taken = 0;
    for (let at = line.indexOf('\\'); at >= 0; at = line.indexOf('\\', at + 1)) {
      if (!markupEscapeAt(flavor, line, at)) continue;
      tree ??= parsed(flavor, lines, place);
      if (!inlineEscape(tree, lines, place, { line: i, at: at + taken })) continue;
      const without = lines.map((l, k) => (k === i ? line.slice(0, at) + line.slice(at + 1) : l));
      const needed = paragraphEscapes(flavor, without, place);
      if (needed && needed.length === 0) continue;
      out.push({ line: i, at: at + taken });
      line = line.slice(0, at) + line.slice(at + 1);
      taken++;
      at--;
    }
  }
  return out;
}

/**
 * `lines` (a text's, wherever they come from) spelled as a paragraph's at `place`: the backslashes
 * reading would take as markup there absorbed, then the escapes that keep each line the paragraph's.
 * An escape at one of the flavor's markup-escape positions is preferred, on the line that changes or
 * the one after it (a table's delimiter row makes the line above it a header); else a backslash
 * before the line's first character, which the text gains. Null where no escape does.
 */
export function escapeParagraph(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace = {}): MdEscapedParagraph | null {
  const absorbed = markupEscapes(flavor, lines, place);
  const text = lines.map((l, k) => {
    let out = l;
    for (const e of absorbed.filter((a) => a.line === k).reverse()) out = out.slice(0, e.at) + out.slice(e.at + 1);
    return out;
  });
  const found = paragraphEscapes(flavor, text, place);
  if (!found) return null;
  // each escape is in the lines with those before it in: every one moved into the lines with all of them in
  const all: { line: number; at: number; markup: boolean }[] = [];
  for (const e of found) {
    for (const m of all) if (m.line === e.line && m.at >= e.at) m.at++;
    all.push({ ...e });
  }
  // then out of them: a markup escape's in the text with the gained ones in, a gained one's in the text before them
  const before = (e: MdEscapeAt, gainedToo: boolean): number => all.filter((m) => m.line === e.line && m.at < e.at && (gainedToo || m.markup)).length;
  const markup = all.filter((e) => e.markup).map((e) => ({ line: e.line, at: e.at - before(e, false) }));
  const gained = all.filter((e) => !e.markup).map((e) => ({ line: e.line, at: e.at - before(e, true) })).sort((a, b) => a.line - b.line || a.at - b.at);
  const spelled = text.map((l, k) => {
    let out = l;
    for (const g of gained.filter((e) => e.line === k).reverse()) out = out.slice(0, g.at) + '\\' + out.slice(g.at);
    return out;
  });
  return { absorbed, lines: spelled, markup: markup.sort((a, b) => a.line - b.line || a.at - b.at), gained };
}

/** An escape `paragraphEscapes` gives: `markup` where it is a markup escape, else a backslash the text gains. */
type FoundEscape = MdEscapeAt & { readonly markup: boolean };

/**
 * The escapes that keep `lines` a paragraph's at `place`, in order, each in the lines with those
 * before it in: none where they are already; null where no escape does.
 */
function paragraphEscapes(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace): FoundEscape[] | null {
  const escapes: FoundEscape[] = [];
  let current = [...lines];
  for (let guard = 0; guard <= lines.length; guard++) {
    const i = firstChanged(flavor, current, place);
    if (i < 0) {
      // markup only where, with every escape in, the backslash reads as an inline escape (a code span
      // the later escapes let close makes an earlier one literal: text the line gains)
      const placed: FoundEscape[] = [];
      for (const e of escapes) {
        for (const [k, p] of placed.entries()) if (p.line === e.line && p.at >= e.at) placed[k] = { ...p, at: p.at + 1 };
        placed.push(e);
      }
      const tree = escapes.some((e) => e.markup) ? parsed(flavor, current, place) : null;
      return escapes.map((e, k) => (e.markup && !inlineEscape(tree!, current, place, placed[k]!) ? { ...e, markup: false } : e));
    }
    const escape = keeping(flavor, current, place, i);
    if (!escape) return null;
    escapes.push(escape);
    current = withEscape(current, escape);
  }
  return null;
}

/** The first of `lines` that doesn't stay the paragraph's at `place`, or -1; a line of `below` counts as their last. */
function firstChanged(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace): number {
  const changed = firstNonParagraph(flavor, [...lines, ...(place.below ?? [])], place.context, place.above, place.lazy);
  return changed < 0 ? -1 : Math.min(changed, lines.length - 1);
}

/** An escape on line `i` or the one after it that keeps that line the paragraph's; else a backslash before line `i`'s first character, if that does. */
function keeping(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace, i: number): FoundEscape | null {
  const fixes = (escape: FoundEscape): boolean => {
    const changed = firstChanged(flavor, withEscape(lines, escape), place);
    return changed < 0 || changed > i;
  };
  for (const k of [i, i + 1]) {
    const line = lines[k];
    if (line === undefined) continue;
    for (let at = 0; at < line.length; at++) {
      const escaped = line.slice(0, at) + '\\' + line.slice(at);
      if (!markupEscapeAt(flavor, escaped, at)) continue;
      const escape = { line: k, at, markup: true };
      // (where the backslash is no inline escape, in a code span or math across lines, it is text the line gains)
      if (fixes(escape)) return escape;
    }
  }
  const line = lines[i]!;
  let lead = 0;
  while (lead < line.length && (line[lead] === ' ' || line[lead] === '\t')) lead++;
  const text = { line: i, at: lead, markup: false };
  return lead < line.length && fixes(text) ? text : null;
}

/** `lines` parsed alone, after `place.above` in `continuation`: where their inline escapes are. */
function parsed(flavor: MdFlavor, lines: readonly string[], place: MdParagraphPlace): MdTree {
  return MdTree.parse((place.context === 'continuation' ? [place.above ?? 'x', ...lines] : lines).join('\n'), flavor);
}

/** Whether the backslash at `escape` in `lines` (`tree`, as `parsed` reads them) reads as an inline escape there (not literal, in a code span or math). */
function inlineEscape(tree: MdTree, lines: readonly string[], place: MdParagraphPlace, escape: MdEscapeAt): boolean {
  const lead = place.context === 'continuation' ? 1 : 0;
  const pos = (lead ? (place.above ?? 'x').length + 1 : 0) + lines.slice(0, escape.line).reduce((n, l) => n + l.length + 1, 0) + escape.at;
  const line = tree.line(escape.line + lead);
  // (a line that starts no inline text, alone, reads it as one)
  return tree.inlineEscapeAt(pos) || !line.leaf || tree.inlineText(line.leaf) === null;
}

function withEscape(lines: readonly string[], escape: MdEscapeAt): string[] {
  const out = [...lines];
  const line = out[escape.line]!;
  out[escape.line] = line.slice(0, escape.at) + '\\' + line.slice(escape.at);
  return out;
}
