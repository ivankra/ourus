// A text's escapes where it is, asked of the parser in its own terms: which of its
// backslashes are markup (reading), and how its lines are spelled there (writing). What the parser
// can't know is the text's: its type and frame, the lines a placeholder holds, a setext underline.

import type { MdEscapeAt, MdEscapedParagraph, MdFlavor, MdParagraphPlace } from '../parser/index.ts';
import { advanceColumns, trimMd } from '../text/index.ts';
import { OurusProse, type OurusProseType } from './text.ts';

/** The character the parser reads a placeholder as. */
export const SENTINEL = '￼';

/**
 * The backslashes of a text's lines (past a `below` frame; `held`: the lines a placeholder holds;
 * `columns`: the column each line starts at, by default 0), read where they are, that are markup
 * escapes: out of its string. In the lines' own offsets.
 */
export function markupEscapes(flavor: MdFlavor, type: OurusProseType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): MdEscapeAt[] {
  const a = asked(type, item, lines, held, columns);
  return flavor.markupEscapes(a.lines, a.place).map(a.back);
}

/**
 * A text's lines (past a `below` frame; `held`: the lines a placeholder holds; `columns`: the column
 * each line starts at, by default 0) spelled where they are written: the backslashes that are markup
 * there absorbed, and the escapes that keep each line the text's, markup ones or backslashes it gains
 * (`MdFlavor.escapeParagraph`); null where none does.
 */
export function escapeParagraph(flavor: MdFlavor, type: OurusProseType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): MdEscapedParagraph | null {
  const a = asked(type, item, lines, held, columns);
  const spelled = flavor.escapeParagraph(a.lines, a.place);
  if (!spelled) return null;
  const out = [...lines];
  spelled.lines.forEach((l, k) => {
    const own = a.lead[k]!;
    const cut = a.cut[k]!;
    const line = lines[k + a.from]!.slice(0, cut) + (own ? lines[k + a.from]!.slice(cut, cut + own.was) + l.slice(own.now) : l);
    out[k + a.from] = held[k + a.from] && line.endsWith(SENTINEL) ? line.slice(0, -SENTINEL.length) : line;
  });
  return { absorbed: spelled.absorbed.map(a.back), lines: out, markup: spelled.markup.map(a.back), gained: spelled.gained.map(a.back) };
}

/**
 * The lines of a text the parser is asked about, and where: a line a placeholder holds read as typed
 * on; a setext heading's underline left out (its title is the lines above it); past a frame (a
 * checkbox, `#`s, a callout's type), the first line's rest is text whatever it starts with, so only
 * the lines after it are asked, as its continuation; a quote's lines past each one's `>` (`cut`), as
 * a paragraph at a quote's start. `from`: the first line asked. A line's leading tabs are asked as the
 * spaces they span from its column (the parser reads each line from column 0), `lead` saying how far,
 * and `back` putting an escape where it is in the line as written.
 */
function asked(type: OurusProseType, item: boolean, lines: readonly string[], held: readonly boolean[], columns?: readonly number[]): { from: number; lines: string[]; place: MdParagraphPlace; lead: ({ was: number; now: number } | null)[]; cut: number[]; back: (e: MdEscapeAt) => MdEscapeAt } {
  if (type === 'quote') {
    // (each line's `>`, by where it starts)
    const quotes = new Map(new OurusProse(type, item, lines.join('\n')).frame.filter((p) => p.part === 'quote').map((p) => [p.from, p.to - p.from]));
    let at = 0;
    const cut = lines.map((l) => {
      const width = quotes.get(at) ?? 0;
      at += l.length + 1;
      return width;
    });
    // (each line past its `>`, from the column there: a tab after it spans by where it is)
    const inner = asked('paragraph', false, lines.map((l, k) => l.slice(cut[k])), held, lines.map((l, k) => (columns?.[k] ?? 0) + advanceColumns(l, 0, cut[k]!, columns?.[k] ?? 0) - (columns?.[k] ?? 0)));
    // (a paragraph has no frame: every line asked, `from` 0)
    const back = (e: MdEscapeAt): MdEscapeAt => {
      const b = inner.back(e);
      return { line: b.line, at: b.at + cut[b.line]! };
    };
    // (a line with no `>` of its own a lazy continuation: written so, out of the quote)
    return { ...inner, place: { context: 'quoteStart', lazy: cut.map((c, k) => k > 0 && c === 0) }, cut, back };
  }
  const written = lines.map((l, k) => (held[k] ? l + SENTINEL : l));
  const end = frameEnd(type, item, written);
  // (a setext heading's underline isn't asked: its title's lines are; past a checkbox too, `- [x] a⏎  -`)
  const setext = type === 'heading' && (end < 0 || new OurusProse(type, item, lines.join('\n')).frame.some((p) => p.part === 'underline'));
  const to = setext ? written.length - 1 : written.length;
  const from = end < 0 ? 0 : 1;
  const lead = written.slice(from, to).map((l, k) => {
    const was = /^[ \t]*/.exec(l)![0].length;
    const column = columns?.[k + from] ?? 0;
    return l.slice(0, was).includes('\t') ? { was, now: advanceColumns(l, 0, was, column) - column } : null;
  });
  const asking = written.slice(from, to).map((l, k) => (lead[k] ? ' '.repeat(lead[k]!.now) + l.slice(lead[k]!.was) : l));
  const back = (e: MdEscapeAt): MdEscapeAt => ({ line: e.line + from, at: lead[e.line] ? e.at - lead[e.line]!.now + lead[e.line]!.was : e.at });
  const cut = asking.map(() => 0);
  if (end < 0) return { from, lines: asking, place: { context: type === 'title' ? 'quoteStart' : 'start' }, lead, cut, back };
  // the paragraph the lines continue is the first line past its frame (a table's delimiter row is
  // matched against it), or the frame where nothing follows it on its line (`[!note]⏎q0`)
  const rest = written[0]!.slice(end);
  return { from, lines: asking, place: { context: 'continuation', above: trimMd(rest) ? rest : written[0]! }, lead, cut, back };
}

/** Where a frame at the text's start ends on its first line (a checkbox, an ATX heading's `#`s, a callout's type, and the blanks after them), or -1. */
function frameEnd(type: OurusProseType, item: boolean, lines: readonly string[]): number {
  const first = (lines[0] ?? '').length;
  const parts = new OurusProse(type, item, lines.join('\n')).frame.filter((p) => (p.part === 'task' || p.part === 'heading' || p.part === 'callout') && p.from <= first);
  return parts.length ? Math.min(first, Math.max(...parts.map((p) => p.to))) : -1;
}
