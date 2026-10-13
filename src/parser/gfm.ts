// GitHub Flavored Markdown: the extensions of the GFM spec (0.29-gfm) as cmark-gfm implements them
// (extensions/*.c, BSD-2-Clause, see NOTICE): tables, task list items, strikethrough, extended
// autolinks, the disallowed raw HTML filter, and footnotes (a cmark-gfm option GitHub enables).
//
// Deliberate differences from cmark-gfm, where it disagrees with the GFM spec's text: a task list
// item's checkbox is recognized in any list item's first line (cmark-gfm only at a line's start,
// so not in quotes or after another marker on the line), with `X` as well as `x`.

import { escapeHtml, isAsciiAlnum, isAsciiAlpha, isSpaceOrTab, isUnicodeWhitespace, normalizeLabel, normalizeUri } from './chars.ts';
import { ITEM, PARAGRAPH, extractRefdefs, type ParagraphFrame } from './blocks.ts';
import { defineFlavor, type Extension, type Flavor, type MutableBlock } from './flavor.ts';
import { coreBlocks, inTightList, type HtmlRenderer } from './html.ts';
import { InlineTextBuilder } from './inline-text.ts';
import { Node, type BracketRule, type DelimiterRule, type InlineParser, type InlineRule, type TextRule } from './inlines.ts';
import type { BlockSpec, Frame, LeafRole, Machine } from './machine.ts';
import type { SyntaxTree } from './syntax.ts';
import type { Block, TableAlign } from './types.ts';
import { inlinePreorder, postorder, preorder } from './walk.ts';

// --------------------------------------------------------------------------------- the core

/**
 * cmark-gfm's rendering of CommonMark: a `<strong>` directly inside another isn't written, and line
 * endings between blocks are cmark's.
 */
export const gfmCore: Extension = {
  name: 'gfm',
  render: { collapseNestedStrong: true, cmarkLineEnds: true },
};

// ------------------------------------------------------------------------------------ tables

/** A table row's cells: the offsets of each cell's text (trimmed) in the row's string. */
type Cells = { from: number; to: number }[];

const isTableSpace = (c: number): boolean => c === 32 || c === 9 || c === 11 || c === 12;

/** `|` and the spaces after it, at `i`: its length, or 0. */
function cellEnd(s: string, i: number, end: number): number {
  if (i >= end || s.charCodeAt(i) !== 124) return 0;
  let j = i + 1;
  while (j < end && isTableSpace(s.charCodeAt(j))) j++;
  return j - i;
}

/** A cell's text at `i`: anything up to an unescaped `|`; its length. */
function cellText(s: string, i: number, end: number): number {
  let j = i;
  while (j < end) {
    const c = s.charCodeAt(j);
    if (c === 124) break;
    if (c === 92 && j + 1 < end && isTableEscapable(s.charCodeAt(j + 1))) j += 2;
    else j++;
  }
  return j - i;
}

const isTableEscapable = (c: number): boolean => c !== 32 && ((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126));

/**
 * The cells of a table row, `s[from, to)` (cmark-gfm's `row_from_string` on one line), or null: a row is
 * `|`? cell (`|` cell)* `|`?, cells possibly empty.
 */
export function rowCells(s: string, from: number, to: number): Cells | null {
  const cells: Cells = [];
  let offset = from + cellEnd(s, from, to);
  let more = true;
  while (offset < to && more) {
    const cell = cellText(s, offset, to);
    const pipe = cellEnd(s, offset + cell, to);
    if (cell || pipe) {
      let a = offset;
      let b = offset + cell;
      while (a < b && isCmarkSpace(s.charCodeAt(a))) a++;
      while (b > a && isCmarkSpace(s.charCodeAt(b - 1))) b--;
      cells.push({ from: a, to: b });
    }
    offset += cell + pipe;
    if (!pipe) {
      // the rest of the row must be spaces
      while (offset < to && isTableSpace(s.charCodeAt(offset))) offset++;
      more = false;
    }
  }
  return offset !== to || cells.length === 0 ? null : cells;
}

/** cmark's `cmark_isspace`: space, tab, LF, FF, CR (not VT). */
const isCmarkSpace = (c: number): boolean => c === 32 || c === 9 || c === 10 || c === 12 || c === 13;

const reDelimiterRow = /^\|?(?:[ \t\v\f]*:?-+:?[ \t\v\f]*)(?:\|[ \t\v\f]*:?-+:?[ \t\v\f]*)*\|?[ \t\v\f]*$/;

interface TableFrame extends Frame {
  readonly columns: number;
  /** Cells filled in for short rows so far (cmark-gfm caps them, against blowing up the output). */
  readonly filled: number;
}

const MAX_FILLED_CELLS = 0x80000;

function makeTableSpec(requirePipe: boolean): BlockSpec<TableFrame> {
  const spec: BlockSpec<TableFrame> = {
    type: 'table',
    container: false,
    acceptsLines: true,
    interruptible: true,
    continue(m, table) {
      if (m.blank || table.filled > MAX_FILLED_CELLS) return 1;
      const line = m.line;
      if (requirePipe && line.indexOf('|', m.nextNonspace) < 0) return 1;
      return rowCells(line, m.nextNonspace, line.length) ? 0 : 1;
    },
    addLine(m, table, index) {
      const line = m.line;
      const at = m.nextNonspace;
      m.takeLine();
      // the delimiter row, which opened the table, is recorded already
      if (m.role) return;
      const cells = rowCells(line, at, line.length) ?? [];
      const kept = cells.slice(0, table.columns).map((c) => ({ start: m.real(c.from), end: m.real(c.to) }));
      if (kept.length < table.columns) m.replace(index, { ...table, filled: table.filled + table.columns - kept.length } as TableFrame);
      m.setLeaf({ type: 'table', first: false, part: { row: 'body', cells: kept } });
    },
  };
  return spec;
}

function makeTableStart(spec: BlockSpec<TableFrame>, requirePipe: boolean) {
  return {
    name: 'table',
    start(m: Machine, container: Frame): 0 | 1 | 2 {
      if (m.indented || container.spec !== PARAGRAPH || m.tip.spec !== PARAGRAPH) return 0;
      // the open paragraph as it is now (a setext candidate may have split definitions off it)
      const p = m.tip as ParagraphFrame & { tableVisited?: boolean };
      if (p.tableVisited) return 0;
      const line = m.line;
      const rest = line.slice(m.nextNonspace);
      if (!reDelimiterRow.test(rest)) return 0;
      const delimiters = rowCells(line, m.nextNonspace, line.length);
      if (!delimiters) return 0;
      const header = rowCells(p.last, 0, p.last.length);
      if (!header || header.length !== delimiters.length || (requirePipe && p.last.indexOf('|') < 0 && rest.indexOf('|') < 0)) {
        m.replace(m.stack.length - 1, { ...p, tableVisited: true } as Frame);
        return 0;
      }
      const align: TableAlign[] = delimiters.map((c) => {
        const left = line.charCodeAt(c.from) === 58;
        const right = line.charCodeAt(c.to - 1) === 58;
        return left && right ? 'center' : left ? 'left' : right ? 'right' : null;
      });
      m.closeUnmatchedBlocks();
      // the paragraph's last line is the header row; the lines above stay a paragraph
      const headerLine = m.lineIndex - 1;
      const index = m.stack.length - 1;
      if (p.lines > 1) {
        const cut = p.content.lastIndexOf('\n', p.content.length - 2) + 1;
        extractRefdefs(m, { ...p, content: p.content.slice(0, cut), lines: p.lines - 1 }, headerLine - 1);
      }
      const base = p.lastFrom;
      m.rewriteRole(headerLine, {
        type: 'table',
        first: true,
        align,
        part: { row: 'header', cells: header.map((c) => ({ start: c.from + base, end: c.to + base })) },
      });
      m.popTop();
      m.addChild({ spec, columns: header.length, filled: 0 } as TableFrame);
      m.setLeaf({ type: 'table', first: false, part: { row: 'delimiter', cells: delimiters.map((c) => ({ start: m.real(c.from), end: m.real(c.to) })) } });
      return 2;
    },
  };
}

const tableBuilder = {
  line(block: MutableBlock, role: LeafRole, line: number): void {
    const part = role.part as { row: string; cells: { start: number; end: number }[] };
    const row: MutableBlock = { type: 'table_row', startLine: line, endLine: line, children: [], parent: block, row: part.row };
    if (Object.isFrozen(block.children)) block.children = [row];
    else block.children.push(row);
    part.cells.forEach((c, column) => {
      row.children.push({ type: 'table_cell', startLine: line, endLine: line, children: [], parent: row, start: c.start, end: c.end, column });
    });
  },
};

/** A table cell's inline text: its text, `\|` read as `|`. */
function cellInlineText(syntax: SyntaxTree, block: Block) {
  const b = new InlineTextBuilder(syntax.text);
  const { text } = syntax;
  const lineStart = syntax.starts[block.startLine]!;
  let from = lineStart + block.start!;
  const to = lineStart + block.end!;
  for (let i = from; i < to; i++) {
    if (text.charCodeAt(i) === 92 && text.charCodeAt(i + 1) === 124) {
      b.add(from, i);
      from = i + 1;
      i++;
    }
  }
  b.add(from, to);
  return b.finish();
}

const tableRenderers = {
  table(r: HtmlRenderer, _table: Block, entering: boolean): void {
    if (entering) {
      r.cr();
      r.lit('<table>');
      r.state.set('tbody', false);
      return;
    }
    if (r.state.get('tbody')) {
      r.cr();
      r.lit('</tbody>');
      r.cr();
    }
    r.cr();
    r.lit('</table>');
    r.cr();
  },
  table_row(r: HtmlRenderer, row: Block, entering: boolean): void | boolean {
    if (row.row === 'delimiter') return false;
    const header = row.row === 'header';
    if (entering) {
      r.cr();
      if (header) {
        r.lit('<thead>');
        r.cr();
      } else if (!r.state.get('tbody')) {
        r.lit('<tbody>');
        r.cr();
        r.state.set('tbody', true);
      }
      r.lit('<tr>');
      return;
    }
    // a short row gets empty cells
    const align = row.parent!.align!;
    for (let i = row.children.length; i < align.length; i++) {
      r.cr();
      r.lit(`${cellTag(header, align[i]!)}</${header ? 'th' : 'td'}>`);
    }
    r.cr();
    r.lit('</tr>');
    if (header) {
      r.cr();
      r.lit('</thead>');
    }
  },
  table_cell(r: HtmlRenderer, cell: Block, entering: boolean): void {
    const row = cell.parent!;
    const header = row.row === 'header';
    if (entering) {
      r.cr();
      r.lit(cellTag(header, row.parent!.align![cell.column!]!));
    } else r.lit(header ? '</th>' : '</td>');
  },
};

const cellTag = (header: boolean, align: TableAlign): string => `<${header ? 'th' : 'td'}${align ? ` align="${align}"` : ''}>`;

/** Tables. `requirePipe`: a row needs a `|` (Obsidian's reading; GFM continues a table with any line). */
export function tableExtension(options: { readonly requirePipe?: boolean } = {}): Extension {
  const requirePipe = options.requirePipe ?? false;
  const spec = makeTableSpec(requirePipe);
  return {
    name: 'table',
    blockStarts: [makeTableStart(spec, requirePipe)],
    blockStartChars: '|:',
    leafBuilders: { table: tableBuilder },
    inlineText: { table_cell: cellInlineText },
    render: { blocks: tableRenderers },
  };
}

export const table: Extension = tableExtension();

// ------------------------------------------------------------------------------- task lists

/**
 * A list item's checkbox, then whitespace, first thing on the item's first line: `[ ]`, `[x]` or
 * `[X]` (GFM), or any one character in the brackets (`anyStatus`: Obsidian's custom statuses,
 * checked unless a space).
 */
function makeTaskStart(anyStatus: boolean, cmark: boolean) {
  return {
    name: 'tasklist',
    start(m: Machine, container: Frame): 0 | 1 | 2 {
      const index = m.stack.length - 1;
      if (container.spec !== ITEM || m.tip !== container || !m.openedHere(index) || m.indented) return 0;
      if (cmark && !reCmarkTask.test(m.line)) return 0;
      const line = m.line;
      const at = m.nextNonspace;
      const box = line.charCodeAt(at + 1);
      if (line.charCodeAt(at) !== 91 || line.charCodeAt(at + 2) !== 93) return 0;
      if (anyStatus ? box === 93 || box !== box || box === 10 || box === 13 : !(box === 32 || box === 9 || box === 120 || box === 88)) return 0;
      if (!isSpaceOrTab(line.charCodeAt(at + 3))) return 0;
      const blank = box === 32 || box === 9;
      m.annotate(index, { task: { checked: !blank, status: blank ? ' ' : line[at + 1], start: m.real(at), end: m.real(at + 3) } });
      m.advanceNextNonspace();
      m.advanceOffset(3, false);
      m.findNextNonspace();
      // the rest of the line is the item's text, whatever it starts with
      return 2;
    },
  };
}

/** cmark-gfm's `tasklist` scanner, from the line's start: so only a first marker, and only `x`. */
const reCmarkTask = /^[ \t\v\f]*(?:[-+*]|[0-9]+.)[ \t\v\f]+\[[ x]\][ \t\v\f]+/;

/**
 * Task list items. `anyStatus`: any character in the brackets. `cmark`: only where cmark-gfm finds
 * them (the line's first marker, `[ ]` or `[x]`), for comparing with it.
 */
export function tasklistExtension(options: { readonly anyStatus?: boolean; readonly cmark?: boolean } = {}): Extension {
  return {
    name: 'tasklist',
    blockStarts: [makeTaskStart(options.anyStatus ?? false, options.cmark ?? false)],
    blockStartChars: '[',
    render: {
      blocks: {
        item(r, b, entering) {
          if (entering) {
            r.cr();
            r.lit('<li>');
            if (b.task) r.lit(`<input type="checkbox"${b.task.checked ? ' checked=""' : ''} disabled="" /> `);
          } else {
            r.lit('</li>');
            r.cr();
          }
        },
      },
    },
  };
}

export const tasklist: Extension = tasklistExtension();

// ---------------------------------------------------------------------------- strikethrough

/** Strikethrough with `~` or `~~` (GFM), or only `~~` (`doubleOnly`, as Obsidian). */
export function strikethroughExtension(options: { readonly doubleOnly?: boolean } = {}): Extension {
  const tilde: DelimiterRule = {
    char: '~',
    accepts: options.doubleOnly ? (length) => length === 2 : (length) => length === 1 || length === 2,
    match: (opener, closer) => (opener.length === closer.length ? { use: opener.length, type: 'strikethrough' } : null),
  };
  return {
    name: 'strikethrough',
    inlines: [{ name: 'strikethrough', triggers: '~', parse: (p) => p.handleDelimiters(tilde) }],
    delimiters: [tilde],
    render: {
      inlines: {
        strikethrough: (r, _node, entering) => r.tag(entering ? 'del' : '/del'),
      },
    },
  };
}

export const strikethrough: Extension = strikethroughExtension();

// -------------------------------------------------------------------------------- autolinks

/** A character a host name can have: not whitespace, not punctuation. */
function isHostChar(s: string, i: number): boolean {
  const cp = s.codePointAt(i)!;
  return !isUnicodeWhitespace(cp) && !(cp < 128 ? isAsciiPunct(cp) : isUnicodePunctuationOnly(cp));
}

const isAsciiPunct = (c: number): boolean => (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126);
const reP = /\p{P}/u;
const isUnicodePunctuationOnly = (cp: number): boolean => reP.test(String.fromCodePoint(cp));

/**
 * The length of a valid domain at `from` (cmark-gfm's `check_domain`): host characters, `-` and
 * `.`, no `_` in the last two labels; with `allowShort`, no dot is needed. 0 if not valid.
 */
function checkDomain(s: string, from: number, end: number, allowShort: boolean): number {
  let i = from + 1;
  let np = 0;
  let uscore1 = 0;
  let uscore2 = 0;
  for (; i < end - 1; i++) {
    if (s.charCodeAt(i) === 92 && i < end - 2) i++;
    const c = s.charCodeAt(i);
    if (c === 95) uscore2++;
    else if (c === 46) {
      uscore1 = uscore2;
      uscore2 = 0;
      np++;
    } else if (c >= 128) {
      // cmark-gfm steps by bytes: a non-ASCII character ends the domain right after it starts
      if (!isHostChar(s, i)) break;
      i++;
      break;
    } else if (!isHostChar(s, i) && c !== 45) break;
  }
  if ((uscore1 > 0 || uscore2 > 0) && np <= 10) return 0;
  return allowShort || np ? i - from : 0;
}

/** Trailing punctuation off a link's end (cmark-gfm's `autolink_delim`); the new length. */
function autolinkDelim(s: string, from: number, length: number): number {
  let end = from + length;
  let opening = 0;
  let closing = 0;
  for (let i = from; i < end; i++) {
    const c = s.charCodeAt(i);
    if (c === 60) {
      end = i;
      break;
    } else if (c === 40) opening++;
    else if (c === 41) closing++;
  }
  while (end > from) {
    const c = s.charCodeAt(end - 1);
    if (c === 41) {
      if (closing <= opening) return end - from;
      closing--;
      end--;
    } else if (c === 63 || c === 33 || c === 46 || c === 44 || c === 58 || c === 42 || c === 95 || c === 126 || c === 39 || c === 34) end--;
    else if (c === 59) {
      // an entity-like `&name;` at the end goes, else just the `;`
      let k = end - 2;
      while (k > from && isAsciiAlpha(s.charCodeAt(k))) k--;
      if (k < end - 2 && s.charCodeAt(k) === 38) end = k;
      else end--;
    } else return end - from;
  }
  return end - from;
}

/** Extends a link from `at` to the next whitespace or `<`. */
function linkEnd(s: string, at: number): number {
  while (at < s.length && !isCmarkSpace(s.charCodeAt(at)) && s.charCodeAt(at) !== 60) at++;
  return at;
}

const wwwRule: InlineRule = {
  name: 'wwwAutolink',
  triggers: 'w',
  parse(p) {
    if (p.brackets) return false;
    const { text } = p;
    const at = p.pos;
    if (at > 0) {
      const prev = text.charCodeAt(at - 1);
      if (!(prev === 42 || prev === 95 || prev === 126 || prev === 40 || isCmarkSpace(prev))) return false;
    }
    if (!text.startsWith('www.', at)) return false;
    const domain = checkDomain(text, at, text.length, false);
    if (domain === 0) return false;
    const length = autolinkDelim(text, at, linkEnd(text, at + domain) - at);
    if (length === 0) return false;
    const raw = text.slice(at, at + length);
    p.pos = at + length;
    p.add(new Node('autolink', at, p.pos, { value: raw, destination: normalizeUri('http://' + raw), literal: true }));
    return true;
  },
};

const reSafeScheme = /^(?:https?|ftp):\/\//i;

const urlRule: InlineRule = {
  name: 'urlAutolink',
  triggers: ':',
  parse(p) {
    if (p.brackets) return false;
    const { text } = p;
    const at = p.pos;
    if (text.length - at < 4 || text.charCodeAt(at + 1) !== 47 || text.charCodeAt(at + 2) !== 47) return false;
    let rewind = 0;
    while (rewind < at && isAsciiAlpha(text.charCodeAt(at - rewind - 1))) rewind++;
    const start = at - rewind;
    const scheme = reSafeScheme.exec(text.slice(start, at + 3));
    if (!scheme || scheme[0].length !== rewind + 3 || at + 3 >= text.length || !isHostChar(text, at + 3)) return false;
    const domain = checkDomain(text, at + 3, text.length, true);
    if (domain === 0) return false;
    const length = autolinkDelim(text, at, linkEnd(text, at + 3 + domain) - at);
    if (length === 0) return false;
    if (rewind && !p.unputText(rewind)) return false;
    const raw = text.slice(start, at + length);
    p.pos = at + length;
    p.add(new Node('autolink', start, p.pos, { value: raw, destination: normalizeUri(raw), literal: true }));
    return true;
  },
};

/**
 * Email addresses in text outside links, `mailto:` and `xmpp:` ones too (cmark-gfm's
 * `postprocess_text`, its quirks kept: the scan restarts at a second `@` with the counts it had).
 */
const emailRule: TextRule = {
  name: 'emailAutolink',
  process(p, node) {
    const s = p.text;
    let text = node;
    let start = node.from;
    let remaining = node.to - node.from;
    let offset = 0;
    outer: while (offset < remaining) {
      const atSign = s.indexOf('@', start + offset);
      if (atSign < 0 || atSign >= start + remaining) break;
      let maxRewind = atSign - (start + offset);
      let autoMailto = true;
      let xmpp = false;
      let np = 0;
      let rewind = 0;
      let length = 0;
      for (;;) {
        const at = start + offset + maxRewind;
        for (rewind = 0; rewind < maxRewind; rewind++) {
          const c = s.charCodeAt(at - rewind - 1);
          if (isAsciiAlnum(c) || c === 46 || c === 43 || c === 45 || c === 95) continue;
          if (c === 58) {
            if (validProtocol('mailto:', s, at, rewind, maxRewind)) {
              autoMailto = false;
              continue;
            }
            if (validProtocol('xmpp:', s, at, rewind, maxRewind)) {
              autoMailto = false;
              xmpp = true;
              continue;
            }
          }
          break;
        }
        if (rewind === 0) {
          offset += maxRewind + 1;
          continue outer;
        }
        let again = false;
        for (length = 1; length < remaining - offset - maxRewind; length++) {
          const c = s.charCodeAt(at + length);
          if (isAsciiAlnum(c)) continue;
          if (c === 64) {
            // another `@`: try again from it
            offset += maxRewind + 1;
            maxRewind = length - 1;
            again = true;
            break;
          }
          if (c === 46 && length < remaining - offset - maxRewind - 1 && isAsciiAlnum(s.charCodeAt(at + length + 1))) np++;
          else if (c === 47 && xmpp) continue;
          else if (c !== 45 && c !== 95) break;
        }
        if (!again) break;
      }
      const at = start + offset + maxRewind;
      const last = s.charCodeAt(at + length - 1);
      if (length < 2 || np === 0 || (!isAsciiAlpha(last) && last !== 46)) {
        offset += maxRewind + length;
        continue;
      }
      length = autolinkDelim(s, at, length);
      if (length === 0) {
        offset += maxRewind + 1;
        continue;
      }
      const linkFrom = at - rewind;
      const linkTo = at + length;
      const raw = s.slice(linkFrom, linkTo);
      const link = new Node('autolink', linkFrom, linkTo, { value: raw, destination: normalizeUri((autoMailto ? 'mailto:' : '') + raw), literal: true });
      const post = new Node('text', linkTo, start + remaining);
      text.to = linkFrom;
      text.insertAfter(link);
      link.insertAfter(post);
      text = post;
      remaining -= offset + maxRewind + length;
      start += offset + maxRewind + length;
      offset = 0;
    }
  },
};

function validProtocol(protocol: string, s: string, at: number, rewind: number, maxRewind: number): boolean {
  const len = protocol.length;
  if (len > maxRewind - rewind) return false;
  if (s.slice(at - rewind - len, at - rewind) !== protocol) return false;
  if (len === maxRewind - rewind) return true;
  return !isAsciiAlnum(s.charCodeAt(at - rewind - len - 1));
}

export const autolink: Extension = {
  name: 'autolink',
  inlines: [wwwRule, urlRule],
  textRules: [emailRule],
};

// ------------------------------------------------------------------------------- tag filter

export const tagfilter: Extension = {
  name: 'tagfilter',
  render: { filteredTags: ['title', 'textarea', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'script', 'plaintext'] },
};

// -------------------------------------------------------------------------------- footnotes

/** `[^label]:` and the spaces after it: a footnote definition, a container whose lines are indented by 4. */
const FOOTNOTE: BlockSpec = {
  type: 'footnote_definition',
  container: true,
  acceptsLines: false,
  continue(m, _frame, index) {
    const from = m.offset;
    const fromColumn = m.column;
    if (m.indent >= 4) m.advanceOffset(4, true);
    // only a line with nothing on it at all goes on through a blank (cmark-gfm)
    else if (m.realLength !== 0) return 1;
    m.piece(index, 'indent', from, fromColumn);
    return 0;
  },
};

const FOOTNOTE_FRAME: Frame = Object.freeze({ spec: FOOTNOTE });
const reFootnoteDefinition = /^\[\^([^\] \r\n\0\t]+)\]:[ \t]*/;

const footnoteStart = {
  name: 'footnoteDefinition',
  before: 'listItem',
  start(m: Machine): 0 | 1 | 2 {
    if (m.indented || m.peek(m.nextNonspace) !== 91 || m.peek(m.nextNonspace + 1) !== 94) return 0;
    const match = reFootnoteDefinition.exec(m.line.slice(m.nextNonspace));
    if (!match) return 0;
    const from = m.offset;
    const fromColumn = m.column;
    m.advanceNextNonspace();
    m.advanceOffset(match[0].length, false);
    m.closeUnmatchedBlocks();
    m.addChild(FOOTNOTE_FRAME, { label: `[^${match[1]}]` });
    m.piece(m.stack.length - 1, 'footnote', from, fromColumn);
    return 1;
  },
};

/** `[^label]`, which no link took: a footnote reference, or its text when no definition has the label. */
const footnoteBracket: BracketRule = {
  name: 'footnoteReference',
  phase: 'after',
  resolve(p: InlineParser, opener) {
    const first = opener.node.next;
    if (opener.image || !first || first.type !== 'text' || p.text.charCodeAt(first.from) !== 94) return false;
    if (first.to - first.from <= 1 && !first.next) return false;
    const close = p.pos - 1;
    const raw = p.text.slice(opener.index + 2, close);
    p.processEmphasis(opener.prevDelimiter);
    for (let n = opener.node.next; n; ) {
      const next = n.next;
      n.unlink();
      n = next;
    }
    const label = normalizeLabel(`[${raw}]`);
    const node = p.context.footnotes.has(label) ? new Node('footnote_ref', opener.node.from, p.pos, { label, value: raw }) : new Node('text', opener.node.from, p.pos);
    opener.node.insertAfter(node);
    opener.node.unlink();
    p.removeBracket();
    return true;
  },
};

interface FootnoteState {
  /** Definitions by normalized label: their number (by first reference), references counted. */
  readonly defs: Map<string, { block: Block; ix: number; count: number; written: boolean }>;
  /** Per leaf, the reference ordinal of each of its footnote references, in order. */
  readonly refs: Map<Block, number[]>;
  readonly cursor: Map<Block, number>;
  next: number;
  /** The footnotes section is being written. */
  section: boolean;
}

function footnoteState(r: HtmlRenderer): FootnoteState {
  return r.state.get('footnotes') as FootnoteState;
}

const defLabel = (def: Block): string => def.label!.slice(2, -1);
const escapeHref = (s: string): string => escapeHtml(normalizeUri(s));

function writeBackref(r: HtmlRenderer, def: { block: Block; ix: number; count: number; written: boolean }): boolean {
  if (def.written) return false;
  def.written = true;
  const label = escapeHref(defLabel(def.block));
  const m = String(def.ix);
  r.lit(`<a href="#fnref-${label}" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="${m}" aria-label="Back to reference ${m}">↩</a>`);
  for (let i = 2; i <= def.count; i++) {
    r.lit(` <a href="#fnref-${label}-${i}" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="${m}-${i}" aria-label="Back to reference ${m}-${i}">↩<sup class="footnote-ref">${i}</sup></a>`);
  }
  return true;
}

/** `![^`: the `!` is text, and the bracket a footnote reference's, not an image's (cmark-gfm). */
const bangBeforeFootnote: InlineRule = {
  name: 'bangBeforeFootnote',
  triggers: '!',
  before: 'bang',
  parse(p) {
    if (p.text.charCodeAt(p.pos + 1) !== 91 || p.text.charCodeAt(p.pos + 2) !== 94) return false;
    p.addText(p.pos, p.pos + 1);
    p.pos += 1;
    return true;
  },
};

export const footnotes: Extension = {
  name: 'footnotes',
  blockStarts: [footnoteStart],
  blockStartChars: '[',
  inlines: [bangBeforeFootnote],
  brackets: [footnoteBracket],
  render: {
    start(r) {
      const state: FootnoteState = { defs: new Map(), refs: new Map(), cursor: new Map(), next: 0, section: false };
      r.state.set('footnotes', state);
      const syntax = r.syntax;
      // the first definition of a label to end wins (cmark-gfm: a definition nested in another wins)
      for (const b of postorder(syntax.root)) {
        if (b.type !== 'footnote_definition') continue;
        const label = normalizeLabel('[' + defLabel(b) + ']');
        if (!state.defs.has(label)) state.defs.set(label, { block: b, ix: 0, count: 0, written: false });
      }
      // number the definitions by their first reference, in document order
      for (const b of preorder(syntax.root)) {
        if (!syntax.inlineText(b)) continue;
        const out: number[] = [];
        for (const n of inlinePreorder(syntax.inlines(b))) {
          if (n.type !== 'footnote_ref') continue;
          const def = state.defs.get(n.label!)!;
          if (!def.ix) def.ix = ++state.next;
          out.push(++def.count);
        }
        if (out.length) state.refs.set(b, out);
      }
    },
    end(r) {
      const state = footnoteState(r);
      const used = [...state.defs.values()].filter((d) => d.ix > 0).sort((a, b) => a.ix - b.ix);
      if (!used.length) return;
      r.lit('<section class="footnotes" data-footnotes>\n<ol>\n');
      state.section = true;
      for (const def of used) r.render(def.block);
      state.section = false;
      r.lit('</ol>\n</section>\n');
    },
    blocks: {
      // definitions are written at the end, in the order of their first reference
      footnote_definition(r, b, entering) {
        const state = footnoteState(r);
        if (!state.section) return false;
        const def = state.defs.get(normalizeLabel('[' + defLabel(b) + ']'))!;
        if (entering) r.lit(`<li id="fn-${escapeHref(defLabel(b))}">\n`);
        else {
          if (writeBackref(r, def)) r.lit('\n');
          r.lit('</li>\n');
        }
      },
      // a definition's last paragraph ends with the backreferences
      paragraph(r, b, entering) {
        const parent = b.parent;
        if (!entering && parent?.type === 'footnote_definition' && parent.children[parent.children.length - 1] === b && !inTightList(b)) {
          const state = footnoteState(r);
          if (state.section) {
            r.lit(' ');
            writeBackref(r, state.defs.get(normalizeLabel('[' + defLabel(parent) + ']'))!);
          }
        }
        return coreBlocks.paragraph!(r, b, entering);
      },
    },
    inlines: {
      footnote_ref(r, node, entering) {
        if (!entering) return;
        const state = footnoteState(r);
        const def = state.defs.get(node.label!)!;
        const leaf = r.leaf!;
        const k = state.cursor.get(leaf) ?? 0;
        state.cursor.set(leaf, k + 1);
        const refIx = state.refs.get(leaf)?.[k] ?? 1;
        const label = escapeHref(defLabel(def.block));
        r.lit(`<sup class="footnote-ref"><a href="#fn-${label}" id="fnref-${label}${refIx > 1 ? '-' + refIx : ''}" data-footnote-ref>${def.ix}</a></sup>`);
      },
    },
  },
};

// ---------------------------------------------------------------------------------- flavors

/** All of GFM's extensions, as GitHub renders comments and files. */
export const gfmExtensions: readonly Extension[] = [gfmCore, table, tasklist, strikethrough, autolink, tagfilter, footnotes];

export const gfm: Flavor = defineFlavor('gfm', gfmExtensions);
