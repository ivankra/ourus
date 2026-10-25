// A text's escapes where it is, asked of the parser in its own terms: which of its
// backslashes are markup (reading), and how its lines are spelled there (writing). What the parser
// can't know is the text's: its type and frame, the lines a placeholder holds, a setext underline.

import type { MdEscapeAt, MdEscapedParagraph, MdFlavor, MdParagraphPlace } from '../parser/index.ts';
import { advanceColumns } from '../text/index.ts';
import { ProseText, type ProseTextType } from './text.ts';

/** The character the parser reads a placeholder as. */
export const SENTINEL = '￼';

/**
 * The backslashes of a text's lines (past a `below` frame; `held`: the lines a placeholder holds;
 * `columns`: the column each line starts at, by default 0), read where they are, that are markup
 * escapes: out of its string. In the lines' own offsets.
 */
export function markupEscapes(flavor: MdFlavor, type: ProseTextType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): MdEscapeAt[] {
  const a = asked(type, item, lines, held, columns);
  return flavor.markupEscapes(a.lines, a.place).map(a.back);
}

/**
 * A text's lines (past a `below` frame; `held`: the lines a placeholder holds; `columns`: the column
 * each line starts at, by default 0) spelled where they are written: the backslashes that are markup
 * there absorbed, and the escapes that keep each line the text's, markup ones or backslashes it gains
 * (`MdFlavor.escapeParagraph`); null where none does.
 */
export function escapeParagraph(flavor: MdFlavor, type: ProseTextType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): MdEscapedParagraph | null {
  const a = asked(type, item, lines, held, columns);
  const spelled = flavor.escapeParagraph(a.lines, a.place);
  if (!spelled) return null;
  const out = [...lines];
  spelled.lines.forEach((l, k) => {
    const own = a.lead[k]!;
    const line = own ? lines[k + a.from]!.slice(0, own.was) + l.slice(own.now) : l;
    out[k + a.from] = held[k + a.from] && line.endsWith(SENTINEL) ? line.slice(0, -SENTINEL.length) : line;
  });
  return { absorbed: spelled.absorbed.map(a.back), lines: out, markup: spelled.markup.map(a.back), gained: spelled.gained.map(a.back) };
}

/**
 * The lines of a text the parser is asked about, and where: a line a placeholder holds read as typed
 * on; a setext heading's underline left out (its title is the lines above it); past a frame (a
 * checkbox, `#`s, a callout's type), the first line's rest is text whatever it starts with, so only
 * the lines after it are asked, as its continuation. `from`: the first line asked. A line's leading
 * tabs are asked as the spaces they span from its column (the parser reads each line from column 0),
 * `lead` saying how far, and `back` putting an escape where it is in the line as written.
 */
function asked(type: ProseTextType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): { from: number; lines: string[]; place: MdParagraphPlace; lead: ({ was: number; now: number } | null)[]; back: (e: MdEscapeAt) => MdEscapeAt } {
  const written = lines.map((l, k) => (held[k] ? l + SENTINEL : l));
  const end = frameEnd(type, item, written);
  const to = type === 'heading' && end < 0 ? written.length - 1 : written.length;
  const from = end < 0 ? 0 : 1;
  const lead = written.slice(from, to).map((l, k) => {
    const was = /^[ \t]*/.exec(l)![0].length;
    const column = columns?.[k + from] ?? 0;
    return l.slice(0, was).includes('\t') ? { was, now: advanceColumns(l, 0, was, column) - column } : null;
  });
  const asking = written.slice(from, to).map((l, k) => (lead[k] ? ' '.repeat(lead[k]!.now) + l.slice(lead[k]!.was) : l));
  const back = (e: MdEscapeAt): MdEscapeAt => ({ line: e.line + from, at: lead[e.line] ? e.at - lead[e.line]!.now + lead[e.line]!.was : e.at });
  if (end < 0) return { from, lines: asking, place: { context: type === 'title' ? 'quoteStart' : 'start' }, lead, back };
  // the paragraph the lines continue is the first line past its frame (a table's delimiter row is
  // matched against it), or the frame where nothing follows it on its line (`[!note]⏎q0`)
  const rest = written[0]!.slice(end);
  return { from, lines: asking, place: { context: 'continuation', above: rest.trim() ? rest : written[0]! }, lead, back };
}

/** Where a frame at the text's start ends on its first line (a checkbox, an ATX heading's `#`s, a callout's type, and the blanks after them), or -1. */
function frameEnd(type: ProseTextType, item: boolean, lines: readonly string[]): number {
  const first = (lines[0] ?? '').length;
  const parts = new ProseText(type, item, lines.join('\n')).frame.filter((p) => (p.part === 'task' || p.part === 'heading' || p.part === 'callout') && p.from <= first);
  return parts.length ? Math.min(first, Math.max(...parts.map((p) => p.to))) : -1;
}
