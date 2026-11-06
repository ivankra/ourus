// A node's text: its own lines past their containers' prefixes, one string with its marks (a
// `MarkSet`), a type, and a frame computed from its characters, which `body` leaves out. Two kinds: a
// `OurusProse` is a paragraph's, a heading's, a quote's (`OurusConfig.quotes: text`) or a callout
// title's, text ourus edits as text (its frame a checkbox, a heading's `#`s, a quote's `>`s, a
// callout's type, an underline, a block id ending it; its backslashes, markup ones too, its own); an `OurusAtom` is
// an atom's lines as written (code, math, a comment, HTML, a table, ...), its frame a fence's runs and
// info, indented code's columns, a footnote's label. Either can carry block-id lines after its string
// (`blockIdLines`): blocks of their own in the document, which its flavor names the text's node by.

/** A node's text, of either kind. */
export type OurusText = OurusProse | OurusAtom;

import { MD_BLOCK_ID_NAME, MdFlavor, MdTree, mdBlockIdEnd, mdCalloutAt } from '../parser/index.ts';
import { lineOf, MarkSet, trimMd, type MarkLists } from '../text/index.ts';

/**
 * What a text is: a paragraph's (an item's too), a heading's, a quote's of one paragraph (each line's
 * `> ` its frame, `OurusConfig.quotes: text`), or a callout's title.
 */
export type OurusProseType = 'paragraph' | 'heading' | 'quote' | 'title';

/** A piece of a text's frame, in its string's offsets (`text`). */
export interface FramePart {
  /** `task`: a checkbox; `heading`: `#`s; `quote`: a line's `>` and the space after it; `close`: a closing sequence; `callout`: `[!type]` and its fold; `underline`: a setext underline, with the line break before it; `below`: the line breaks before an item's text, which starts below its marker; `blockId`: a block id ending the text, with the blank or line break before it (` ^id`, `⏎^id`). */
  readonly part: 'task' | 'heading' | 'quote' | 'close' | 'callout' | 'underline' | 'below' | 'blockId';
  readonly from: number;
  readonly to: number;
}

/** How a flavor writes block ids in a text (`MdFlavor.has('blockIds')`): Obsidian's ` ^id`. */
export type BlockIdSyntax = 'caret';

/**
 * A block-id line a text carries after its string: a block of its own in the document, which its
 * flavor names the text's node by (`Intro.`, a table, `⏎⏎^t1`). `blankLines`: the blank lines before
 * it; `line`: the line as written, past its containers' prefix and its indentation.
 */
export interface BlockIdLine {
  readonly blankLines: number;
  readonly line: string;
}

/** A block id's name, as Obsidian has them: the pattern, the parser's. */
export const BLOCK_ID_NAME = MD_BLOCK_ID_NAME;
/** A line that is a block id and nothing else, exactly: with trailing blanks, Obsidian registers none. */
export const reBlockIdLine = new RegExp(`^\\^(${BLOCK_ID_NAME})$`);

/**
 * A checkbox at an item's text start, and the blanks after it; or alone (`- [ ]`). In every flavor,
 * as the outline reads tasks, with Obsidian's statuses: any one character between the brackets
 * (`[?]`, `[a]`).
 */
const reCheckbox = /^\[[^\n]\](?:[ \t]+|$)/;

/** The checkbox at the start of an item's text line `line`, with the blanks after it, as the outline reads a task's (`reCheckbox`): its length; 0 where there is none. */
export function checkboxLength(line: string): number {
  return reCheckbox.exec(line)?.[0].length ?? 0;
}
/** An ATX heading's opening `#`s and the blanks after them. */
const reAtxOpen = /^#{1,6}(?:[ \t]+|$)/;
/** An ATX heading's closing sequence, with the blanks around it. */
const reAtxClose = /(?:^|[ \t]+)#+[ \t]*$/;
/** A quote's `>` on a line (its indentation, three columns at most) and the space after it. */
const reQuote = /^ {0,3}>[ \t]?/;
/** A setext heading's underline, after its indentation (a heading's type says it is one: the parser has counted the columns). */
const reUnderline = /^[ \t]*(?:=+|-+)[ \t]*$/;

/**
 * The text of a paragraph, a heading, a quote (`OurusConfig.quotes: text`) or a callout title: text
 * ourus edits as text. `body` is what the user edits; `frame` is the markup around it (a
 * checkbox, a heading's `#`s, a quote's `>`s, a callout's `[!type]`, a setext underline).
 *
 * Internally, `text` is the node's lines past their containers' prefixes, as written (an escape
 * ourus wrote has an `auto` mark), with its marks as `marks`; the frame is computed lazily from its
 * characters.
 */
export class OurusProse {
  /** What the text is of (`OurusProseType`). */
  readonly type: OurusProseType;
  /** An item's text, which can start with a checkbox, or on the line after its marker. */
  readonly item: boolean;
  /** The lines past their prefixes, `\n` between them: the frame and the body (`marks.text`). */
  readonly text: string;
  /** The marks on `text`. */
  readonly marks: MarkSet;
  /** How its flavor writes a block id in it; null: a flavor without them, or a text a command made from nothing. */
  readonly blockIds: BlockIdSyntax | null;
  /** The block-id lines it carries after its string. */
  readonly blockIdLines: readonly BlockIdLine[];
  /**
   * A piece of a text (`slice`, and what is built on one), which says nothing of the block-id lines
   * the text it was cut from carries: set as the text of a node that carries some, the draft refuses
   * it, unless it says what they are (`withBlockIdLines`).
   */
  readonly fragment: boolean;
  #frame: readonly FramePart[] | undefined;

  /** `text` includes the frame; a string has no marks. */
  constructor(type: OurusProseType, item: boolean, text: MarkSet | string, blockIds: BlockIdSyntax | null = null, blockIdLines: readonly BlockIdLine[] = NO_LINES, fragment = false) {
    this.type = type;
    this.item = item;
    this.marks = typeof text === 'string' ? MarkSet.of(text) : text;
    this.text = this.marks.text;
    this.blockIds = blockIds;
    this.blockIdLines = ownLines(blockIdLines);
    this.fragment = fragment;
  }

  /** The frame, computed from the characters, the type, `item` and `blockIds`. */
  get frame(): readonly FramePart[] {
    return (this.#frame ??= frameOf(this.type, this.item, this.text, (at) => this.marks.hasEmptyNodeAt(at), this.blockIds));
  }

  /** The same text read in a flavor that writes block ids so, or has none. */
  withBlockIds(blockIds: BlockIdSyntax | null): OurusProse {
    return blockIds === this.blockIds ? this : this.#with({ blockIds });
  }

  /**
   * The same string as a text of another type (and an item's or not: `item`), its marks, its
   * flavor's syntax and the block-id lines it carries kept: a quote's lines unquoted a paragraph's, a
   * setext title an ATX one's. Read as that type, but no transition (`normalize`).
   */
  retyped(type: OurusProseType, item = this.item): OurusProse {
    return type === this.type && item === this.item ? this : this.#with({ type, item });
  }

  /** A quote's text (`quotes: text`) without its `>`s, every line's (a block id's own line's too, which its part holds: `> q⏎> ^x`), a paragraph's. */
  unquoted(): OurusProse {
    let out: OurusProse = this;
    for (const p of [...this.frame].reverse()) {
      if (p.part === 'quote') out = out.splice(p.from, p.to);
      if (p.part !== 'blockId') continue;
      for (let k = this.text.lastIndexOf('\n', p.to - 1); k >= p.from; k = this.text.lastIndexOf('\n', k - 1)) {
        const quote = reQuote.exec(this.text.slice(k + 1, p.to));
        if (quote) out = out.splice(k + 1, k + 1 + quote[0].length);
      }
    }
    return out.retyped('paragraph');
  }

  /** The same string with the lists `lists` gives in place of its marks' (`MarkSet.with`); this one where they are the same. */
  withMarks(lists: MarkLists): OurusProse {
    const marks = this.marks.with(lists);
    return marks === this.marks ? this : this.#with({ marks });
  }

  /** The text without its held spaces, each one's space and placeholder out, as settling writes it; this one where it has none. */
  withoutHeldSpaces(): OurusProse {
    const held = this.marks.placeholders.filter((pos) => this.marks.hasHeldSpaceAt(pos));
    if (!held.length) return this;
    // (the spaces taken out at once, the other marks moved once: one at a time it was quadratic)
    const heldAt = new Set(held);
    const kept = this.withMarks({ placeholders: this.marks.placeholders.filter((pos) => !heldAt.has(pos)) });
    return kept.#with({ marks: kept.marks.map(held.map((pos) => ({ from: pos, to: pos + 1, insert: '' }))) });
  }

  /** The same text carrying other block-id lines (none: `[]`); a whole text, a fragment's lines said. */
  withBlockIdLines(lines: readonly BlockIdLine[]): OurusProse {
    return !this.fragment && (lines === this.blockIdLines || (!lines.length && !this.blockIdLines.length)) ? this : this.#with({ blockIdLines: lines, fragment: false });
  }

  /** A text like this one, but for what `changes` says, its block ids' syntax and lines carried, a fragment or not. */
  #with(changes: { type?: OurusProseType; item?: boolean; marks?: MarkSet; blockIds?: BlockIdSyntax | null; blockIdLines?: readonly BlockIdLine[]; fragment?: boolean }): OurusProse {
    const { type = this.type, item = this.item, marks = this.marks, blockIds = this.blockIds, blockIdLines = this.blockIdLines, fragment = this.fragment } = changes;
    return new OurusProse(type, item, marks, blockIds, blockIdLines, fragment);
  }

  /** The string without its frame: what the user edits, and the check compares. */
  get body(): string {
    let out = '';
    let at = 0;
    for (const part of this.frame) {
      out += this.text.slice(at, part.from);
      at = part.to;
    }
    return out + this.text.slice(at);
  }

  /** The checkbox's status: the character in its brackets. */
  get task(): { readonly status: string } | null {
    const part = this.frame.find((p) => p.part === 'task');
    return part ? { status: this.text[part.from + 1]! } : null;
  }

  /** A heading's level and form; null for any other text. */
  get heading(): { readonly level: number; readonly form: 'atx' | 'setext' } | null {
    const open = this.frame.find((p) => p.part === 'heading');
    if (open) return { level: /^#+/.exec(this.text.slice(open.from, open.to))![0].length, form: 'atx' };
    const underline = this.frame.find((p) => p.part === 'underline');
    return underline ? { level: this.text.slice(underline.from, underline.to).includes('=') ? 1 : 2, form: 'setext' } : null;
  }

  /** A callout's type and fold (`+`, `-` or none); null for any other text. */
  get callout(): { readonly type: string; readonly fold: '+' | '-' | null } | null {
    const part = this.frame.find((p) => p.part === 'callout');
    if (!part) return null;
    const callout = mdCalloutAt(this.text.slice(part.from, part.to))!;
    return { type: callout.kind, fold: callout.fold };
  }

  /**
   * Whether the text holds nothing but Markdown's whitespace (a no-break space is text). A text that
   * is only a block id (`- ^x`) isn't empty: its node is named, and goes as no empty one does.
   */
  get empty(): boolean {
    return trimMd(this.body) === '' && !this.frame.some((p) => p.part === 'blockId');
  }

  /**
   * Whether its last line, a later one, holds nothing past its frame: blanks after a quote's `>` (a
   * quote's text's), or none. The empty last line Shift-Enter leaves, a placeholder holding it.
   */
  get emptyLastLine(): boolean {
    const last = this.text.lastIndexOf('\n');
    if (last < 0) return false;
    const quote = this.frame.find((p) => p.part === 'quote' && p.from === last + 1);
    return trimMd(this.text.slice(quote ? quote.to : last + 1)) === '';
  }

  /** The first offset of line `line` past its frame. */
  textStart(line: number): number {
    let at = 0;
    for (let k = 0; k < line; k++) {
      const next = this.text.indexOf('\n', at);
      if (next < 0) return this.text.length;
      at = next + 1;
    }
    for (const part of this.frame) if (part.from <= at && part.to > at && part.part !== 'underline' && part.part !== 'blockId') at = part.to;
    return at;
  }

  /** The same string read as an item's text, or not. */
  asItem(item: boolean): OurusProse {
    return item === this.item ? this : this.#with({ item });
  }

  /** `[from, to)` replaced by `insert` (`MarkSet.splice`): the marks around move, the insertion's come with it. */
  splice(from: number, to: number, insert: OurusProse | string = ''): OurusProse {
    return this.#with({ marks: this.marks.splice(from, to, typeof insert === 'string' ? insert : insert.marks) });
  }

  /**
   * `[from, to)` with its marks: a point at `to` only at the text's end (`MarkSet.slice`). A
   * fragment, without the block-id lines: a split or a join gives them to one node explicitly
   * (`withBlockIdLines`).
   */
  slice(from = 0, to = this.text.length): OurusProse {
    return this.#with({ marks: this.marks.slice(from, to, to === this.text.length), blockIdLines: NO_LINES, fragment: true });
  }

  /** The texts after this one, their marks with them; this one's block-id lines, a fragment where it is one. */
  concat(...others: readonly (OurusProse | string)[]): OurusProse {
    return this.#with({ marks: this.marks.concat(...others.map((other) => (typeof other === 'string' ? other : other.marks))) });
  }

  /**
   * The text after an edit, its transitions applied: a heading whose characters no longer read
   * as one is a paragraph's, as is a title that no longer reads as a callout and a quote's whose first
   * line lost its `>`; a paragraph never becomes a heading or a quote by its characters. A checkbox is read again from the characters with the
   * frame, both ways, with nothing to do here. A paragraph's block-id line right under it is a line of its text.
   */
  normalize(): OurusProse {
    let text: OurusProse = this;
    if (this.type === 'heading' && !this.frame.some((p) => p.part === 'heading' || p.part === 'underline')) text = this.#with({ type: 'paragraph' });
    else if (this.type === 'title' && !this.frame.some((p) => p.part === 'callout')) text = this.#with({ type: 'paragraph' });
    else if (this.type === 'quote' && !this.frame.some((p) => p.part === 'quote' && p.from === 0)) text = this.#with({ type: 'paragraph' });
    // (a block-id line right under a paragraph is its text's last line, which Markdown reads it as)
    const [first, ...rest] = text.blockIdLines;
    if ((text.type === 'paragraph' || text.type === 'quote') && first?.blankLines === 0) text = text.#with({ marks: text.marks.concat(`\n${first.line}`), blockIdLines: rest });
    return text;
  }
}

const NO_LINES: readonly BlockIdLine[] = Object.freeze([]);

/** `lines` as a text keeps them: frozen, the records too, so no caller changes them after (a frozen list as it is). */
function ownLines(lines: readonly BlockIdLine[]): readonly BlockIdLine[] {
  // (a frozen list of frozen records is no one's to change: shared as it is; freezing is shallow)
  if (Object.isFrozen(lines) && lines.every((l) => Object.isFrozen(l))) return lines;
  return Object.freeze(lines.map(({ blankLines, line }) => Object.freeze({ blankLines, line })));
}

/**
 * The frame of `text`, typed `type`, an item's or not; `held`: whether a placeholder holds an empty
 * line ending at an offset; `blockIds`: how a block id ending it is written, where its flavor has them.
 */
function frameOf(type: OurusProseType, item: boolean, text: string, held: (at: number) => boolean = () => false, blockIds: BlockIdSyntax | null = null): FramePart[] {
  const parts: FramePart[] = [];
  const endOf = (from: number): number => (text.indexOf('\n', from) < 0 ? text.length : text.indexOf('\n', from));
  // a checkbox at an item's text start: a paragraph's, or a setext title's (`- [x] a⏎  -`; an ATX
  // heading can't follow one: past a checkbox the line's rest is text)
  // (a setext title that is a checkbox alone is its title: `- [a]⏎  ===`)
  const found = item && type !== 'title' ? reCheckbox.exec(text.slice(0, endOf(0))) : null;
  const box = found && !(type === 'heading' && found[0].length === endOf(0) && text.indexOf('\n') >= 0) ? found : null;
  if (box) parts.push({ part: 'task', from: 0, to: box[0].length });
  let start = box ? box[0].length : 0;
  // an item's text below its marker: its marker's line holds nothing else, nor the blank lines after it
  // (a placeholder there holds it as a line of the text, typed on)
  if (item && text[start] === '\n' && !held(start)) {
    let end = start;
    while (text[end] === '\n') end++;
    parts.push({ part: 'below', from: start, to: end });
    start = end;
  }
  const lineEnd = endOf(start);
  const first = text.slice(start, lineEnd);
  if (type === 'quote') {
    // each line's `>`, but a lazy line's, which has none
    for (let at = start; at <= text.length; ) {
      const quote = reQuote.exec(text.slice(at, endOf(at)));
      if (quote) parts.push({ part: 'quote', from: at, to: at + quote[0].length });
      at = endOf(at) + 1;
    }
  } else if (type === 'title') {
    // its type and fold (Obsidian's syntax, in every flavor), and the blanks after them
    const callout = mdCalloutAt(first);
    if (callout) {
      let to = callout.to;
      while (first[to] === ' ' || first[to] === '\t') to++;
      parts.push({ part: 'callout', from: start, to: start + to });
    }
  } else if (type === 'heading') {
    // an ATX title is one line: a heading's text of several is a setext title, whatever its first line starts with
    const open = box || text.indexOf('\n', start) >= 0 ? null : reAtxOpen.exec(first);
    if (open) {
      parts.push({ part: 'heading', from: start, to: start + open[0].length });
      const rest = first.slice(open[0].length);
      const close = reAtxClose.exec(rest);
      if (close) parts.push({ part: 'close', from: start + open[0].length + close.index, to: lineEnd });
    } else {
      const last = text.lastIndexOf('\n');
      if (last >= start && reUnderline.test(text.slice(last + 1))) parts.push({ part: 'underline', from: last, to: text.length });
    }
  }
  // a block id ends the text, before what else closes it (`## H ^x ##`, `Title ^x⏎===`), past what
  // opens it (`- [ ] ^x`, `## ^h`); not a callout title's, where it would end the quote's first line
  if (blockIds && type !== 'title') {
    const end = parts.find((p) => p.part === 'close' || p.part === 'underline')?.from ?? text.length;
    const found = mdBlockIdEnd(text.slice(0, end));
    if (found) {
      // (the blanks before it, and the line break where it is alone on its line; but what another part
      // has: a quote's `> ` on its line, a heading's `#`s)
      const at = found.at;
      let from = at;
      while (from > 0 && (text[from - 1] === ' ' || text[from - 1] === '\t')) from--;
      // (in a quote's text, alone on a line but for its `> `: the line whole, that `> ` the block id's)
      const lineStart = text.lastIndexOf('\n', at - 1) + 1;
      const own = type === 'quote' && lineStart > 0 ? parts.findIndex((p) => p.part === 'quote' && p.from === lineStart && /^[ \t]*$/.test(text.slice(p.to, at))) : -1;
      if (own >= 0) {
        parts.splice(own, 1);
        from = lineStart;
      }
      if (text[from - 1] === '\n') from--;
      for (const p of parts) if (p.from <= from && from < p.to) from = p.to;
      if (from <= at) {
        parts.push({ part: 'blockId', from, to: end });
        parts.sort((a, b) => a.from - b.from);
      }
    }
  }
  return parts;
}

/** A fence's opening run (backticks or tildes, three or more), after its indentation (a tab's width depends on the column, which the parser has counted). */
const reFenceOpen = /^[ \t]*(`{3,}|~{3,})/;
/** A footnote definition's label and the blanks after it. */
const reFootnoteLabel = /^\[\^[^\]]+\]:[ \t]*/;

/** A piece of an atom text's frame. */
export interface AtomFramePart {
  /** `open`: a fence's run, `$$`, `%%`; `info`: a fence's info string; `close`: the closing delimiter; `indent`: indented code's four columns; `label`: a footnote's; `rule`: a thematic break. */
  readonly part: 'open' | 'info' | 'close' | 'indent' | 'label' | 'rule';
  readonly from: number;
  readonly to: number;
}

/**
 * The text of an atom: code, math, a comment, HTML, a table and any other block ourus moves whole
 * rather than edits as text. `body` is its content; `frame` its delimiters (a fence's runs and
 * info, indented code's columns, a footnote's label).
 *
 * Internally, `text` is its lines as written past their containers' prefixes (a partly taken tab
 * as its spaces), with its marks as `marks`; the frame is computed lazily from its
 * characters, by `type`.
 */
export class OurusAtom {
  /** The parser's block type, but code's: `fenced_code` or `indented_code`. */
  readonly type: string;
  /** An item's text. */
  readonly item: boolean;
  /** The lines past their prefixes, `\n` between them: the frame and the body (`marks.text`). */
  readonly text: string;
  /** The marks on `text`. */
  readonly marks: MarkSet;
  /** The block-id lines it carries after its string (a table's, a fence's `^id`). */
  readonly blockIdLines: readonly BlockIdLine[];
  #frame: readonly AtomFramePart[] | undefined;

  /** `text` includes the frame; a string has no marks. */
  constructor(type: string, item: boolean, text: MarkSet | string, blockIdLines: readonly BlockIdLine[] = NO_LINES) {
    this.type = type;
    this.item = item;
    this.marks = typeof text === 'string' ? MarkSet.of(text) : text;
    this.text = this.marks.text;
    this.blockIdLines = ownLines(blockIdLines);
  }

  /** The same string with the lists `lists` gives in place of its marks' (`MarkSet.with`); this one where they are the same. */
  withMarks(lists: MarkLists): OurusAtom {
    const marks = this.marks.with(lists);
    return marks === this.marks ? this : new OurusAtom(this.type, this.item, marks, this.blockIdLines);
  }

  /** The same text carrying other block-id lines. */
  withBlockIdLines(lines: readonly BlockIdLine[]): OurusAtom {
    return lines === this.blockIdLines || (!lines.length && !this.blockIdLines.length) ? this : new OurusAtom(this.type, this.item, this.marks, lines);
  }

  /**
   * As Markdown reads it: a block-id line right under a quote that ends in a paragraph is that
   * paragraph's lazy last line, in the string (`> a⏎^x`); under one that doesn't, carried (`> ## h⏎^x`).
   */
  normalize(): OurusAtom {
    const [first, ...rest] = this.blockIdLines;
    if (this.type !== 'blockquote' || first?.blankLines !== 0) return this;
    const text = this.marks.concat(`\n${first.line}`);
    const last = MdTree.parse(text.text, MdFlavor.named('obsidian')).line(text.text.split('\n').length - 1);
    return last.containers.some((c) => c.block.type === 'blockquote') ? new OurusAtom(this.type, this.item, text, rest) : this;
  }

  /** The same lines read as an item's text, or not. */
  asItem(item: boolean): OurusAtom {
    return item === this.item ? this : new OurusAtom(this.type, item, this.marks, this.blockIdLines);
  }

  /** The delimiters, computed from the characters by `type`. */
  get frame(): readonly AtomFramePart[] {
    return (this.#frame ??= atomFrameOf(this.type, this.text));
  }

  /** The payload: the lines between a fence's, past indented code's columns; the text but a footnote's label; nothing of a rule. */
  get body(): string {
    const s = this.text;
    const frame = this.frame;
    const open = frame.find((p) => p.part === 'open');
    // math's and a comment's: what is between their delimiters, beside them too (`$$x⏎y$$`), but the
    // line breaks right after the opening and before the closing
    if (open && (this.type === 'math_block' || this.type === 'comment_block')) {
      const close = frame.find((p) => p.part === 'close');
      let body = s.slice(open.to, close ? close.from : s.length);
      if (body.startsWith('\n')) body = body.slice(1);
      return close && body.endsWith('\n') ? body.slice(0, -1) : body;
    }
    if (open) {
      const first = s.indexOf('\n', open.from);
      if (first < 0) return '';
      const close = frame.find((p) => p.part === 'close');
      return s.slice(first + 1, close ? Math.max(first + 1, s.lastIndexOf('\n', close.from) ) : s.length);
    }
    let out = '';
    let at = 0;
    for (const part of frame) {
      out += s.slice(at, part.from);
      at = part.to;
    }
    return out + s.slice(at);
  }

  /** A fence's character and length, `$$` or `%%`; null for a text with no delimiters. */
  get fence(): string | null {
    const open = this.frame.find((p) => p.part === 'open');
    return open ? trimMd(this.text.slice(open.from, open.to)) : null;
  }

  /** A fence's info string. */
  get info(): string {
    const info = this.frame.find((p) => p.part === 'info');
    return info ? this.text.slice(info.from, info.to) : '';
  }

  /**
   * Where its delimiters' runs are in its string: a fence's backticks or tildes (without the closing
   * line's indentation or trailing blanks), a `$$` or `%%`; null for a text without them.
   */
  get delimiters(): { readonly open: { readonly from: number; readonly to: number }; readonly close: { readonly from: number; readonly to: number } | null } | null {
    const open = this.frame.find((p) => p.part === 'open');
    if (!open) return null;
    const close = this.frame.find((p) => p.part === 'close');
    if (!close) return { open: { from: open.from, to: open.to }, close: null };
    const s = this.text;
    let a = close.from;
    let b = close.to;
    while (a < b && (s[a] === ' ' || s[a] === '\t')) a++;
    while (b > a && (s[b - 1] === ' ' || s[b - 1] === '\t')) b--;
    return { open: { from: open.from, to: open.to }, close: { from: a, to: b } };
  }

  /** Whether a delimited text has its closing delimiter. */
  get closed(): boolean {
    return this.frame.some((p) => p.part === 'close');
  }

  /** Whether line `k` of the text is a delimiter's: a fence's opening or closing line, `$$`'s, `%%`'s. */
  delimiterLine(k: number): boolean {
    const open = this.frame.find((p) => p.part === 'open');
    const close = this.frame.find((p) => p.part === 'close');
    return (!!open && k === lineOf(this.text, open.from)) || (!!close && k === lineOf(this.text, close.from));
  }

  /** `[from, to)` replaced by `insert`, the marks around moving (`MarkSet.splice`). */
  splice(from: number, to: number, insert = ''): OurusAtom {
    return new OurusAtom(this.type, this.item, this.marks.splice(from, to, insert), this.blockIdLines);
  }
}

function atomFrameOf(type: string, text: string): AtomFramePart[] {
  const parts: AtomFramePart[] = [];
  const lines = text.split('\n');
  const firstEnd = lines[0]!.length;
  const lastStart = text.length - lines[lines.length - 1]!.length;
  if (type === 'fenced_code') {
    // an item's code can start on the line after its marker (`+⏎  ~~~`)
    let f = 0;
    while (f < lines.length - 1 && trimMd(lines[f]!) === '') f++;
    const base = lines.slice(0, f).reduce((n, l) => n + l.length + 1, 0);
    const open = lines[f]!;
    const fence = reFenceOpen.exec(open);
    if (fence) {
      const runFrom = fence[0].length - fence[1]!.length;
      parts.push({ part: 'open', from: base + runFrom, to: base + fence[0].length });
      const info = trimMd(open.slice(fence[0].length));
      if (info) {
        const from = open.indexOf(info, fence[0].length);
        parts.push({ part: 'info', from: base + from, to: base + from + info.length });
      }
      // the closing run indented three columns at most (four make it code)
      const closing = new RegExp(`^([ \\t]*)${fence[1]![0] === '`' ? '`' : '~'}{${fence[1]!.length},}[ \\t]*$`);
      const close = lines.length > f + 1 ? closing.exec(lines[lines.length - 1]!) : null;
      if (close && columnsOf(close[1]!) <= 3) parts.push({ part: 'close', from: lastStart, to: text.length });
    }
    return parts;
  }
  if (type === 'indented_code') {
    // four columns of each line
    let at = 0;
    for (const line of lines) {
      let k = 0;
      let column = 0;
      while (k < line.length && column < 4 && (line[k] === ' ' || line[k] === '\t')) column = line[k++] === '\t' ? column + 4 - (column % 4) : column + 1;
      if (k) parts.push({ part: 'indent', from: at, to: at + k });
      at += line.length + 1;
    }
    return parts;
  }
  if (type === 'math_block' || type === 'comment_block') {
    const delimiter = type === 'math_block' ? '$$' : '%%';
    // (an item's block can start on the line after its marker, as a fence)
    let f = 0;
    while (f < lines.length - 1 && trimMd(lines[f]!) === '') f++;
    const base = lines.slice(0, f).reduce((n, l) => n + l.length + 1, 0);
    const lead = base + /^[ \t]*/.exec(lines[f]!)![0].length;
    if (!text.startsWith(delimiter, lead)) return parts;
    parts.push({ part: 'open', from: lead, to: lead + 2 });
    // `$$` and `%%` close after text too (`x$$`), on the opening's line too (`$$x$$`), blanks after
    // them, a no-break space not one
    const end = text.replace(/[ \t\r\n]+$/, '').length;
    if (text.endsWith(delimiter, end) && end - 2 >= (lines.length > f + 1 ? lastStart : lead + 2)) parts.push({ part: 'close', from: end - 2, to: end });
    return parts;
  }
  if (type === 'thematic_break') return [{ part: 'rule', from: 0, to: firstEnd }];
  if (type === 'footnote_definition') {
    const label = reFootnoteLabel.exec(lines[0]!);
    if (label) parts.push({ part: 'label', from: 0, to: label[0].length });
  }
  return parts;
}

/** The columns blanks at a line's start span. */
function columnsOf(blanks: string): number {
  let column = 0;
  for (const c of blanks) column = c === '\t' ? column + 4 - (column % 4) : column + 1;
  return column;
}

/** Whether a frame part closes its text: a block id ending it, an ATX closing sequence, a setext underline. */
export function isClosingPart(part: FramePart): boolean {
  return part.part === 'blockId' || part.part === 'close' || part.part === 'underline';
}

/**
 * Where a prose text's closing frame starts: the run of closing parts that ends it (` ^x` before
 * `===` or ` ##`, which the inline text leaves out too); its length where it has none.
 */
export function closingFrameStart(text: OurusProse): number {
  let at = text.text.length;
  for (let k = text.frame.length - 1; k >= 0; k--) {
    const part = text.frame[k]!;
    if (part.to !== at || !isClosingPart(part)) break;
    at = part.from;
  }
  return at;
}

/** Whether `name` is a valid block id's name. */
export function isBlockIdName(name: string): boolean {
  return new RegExp(`^${BLOCK_ID_NAME}$`).test(name);
}

/**
 * A block id written in a text: its name, and in its string, where it is (`^` through the name's
 * end) and the part of the string it takes (the blank or line break before it too); or carried
 * (`k`, which of its `blockIdLines`).
 */
export type TextBlockId =
  | { readonly name: string; readonly carried: false; readonly from: number; readonly to: number; readonly partFrom: number; readonly partTo: number }
  | { readonly name: string; readonly carried: true; readonly k: number };

/**
 * The block ids a text holds, in order: one ending its string (a `blockId` frame part; a quote
 * atom's, ending its last line), then the lines it carries.
 */
export function blockIdsOf(text: OurusText): TextBlockId[] {
  const out: TextBlockId[] = [];
  for (const b of stringBlockIds(text)) out.push({ name: b.name, carried: false, from: b.at, to: b.at + 1 + b.name.length, partFrom: b.from, partTo: b.to });
  text.blockIdLines.forEach((l, k) => {
    const name = reBlockIdLine.exec(l.line)?.[1];
    if (name) out.push({ name, carried: true, k });
  });
  return out;
}

/**
 * The block ids in a text's string, in order: the one ending it (its `blockId` frame part); in a
 * quote read as an atom, the one ending each paragraph in it, past its `>`s (`> q⏎^q2`, `> a ^x⏎>⏎>
 * b`), but in code (`> ```⏎> code ^x`). Each with its name, where its `^` is, and the part of the
 * string it takes (the blanks or line break before it; a quote atom's line that is only it, whole).
 */
function stringBlockIds(text: OurusText): { name: string; at: number; from: number; to: number }[] {
  if (text instanceof OurusProse) {
    const part = text.frame.find((p) => p.part === 'blockId');
    if (!part) return [];
    const at = text.text.indexOf('^', part.from);
    return [{ name: new RegExp(`^\\^(${BLOCK_ID_NAME})`).exec(text.text.slice(at))![1]!, at, from: part.from, to: part.to }];
  }
  const s = text.text;
  if (text.type !== 'blockquote' || !s.includes('^')) return [];
  const tree = MdTree.parse(s, MdFlavor.named('obsidian'));
  const out: { name: string; at: number; from: number; to: number }[] = [];
  let lineFrom = 0;
  s.split('\n').forEach((line, i) => {
    const leaf = tree.line(i).leaf;
    const type = leaf?.block.type;
    // (the last line of a paragraph's text or a heading's title, ATX or setext, its text as the line's
    // markup has it: past the quote's `>`s, before a closing `#` run)
    const end = leaf ? leaf.line + leaf.block.lines - 1 : -1;
    const last = (type === 'paragraph' || type === 'heading') && i === end - (tree.markup(end).marks.some((m) => m.kind === 'underline') ? 1 : 0);
    const { textFrom, textTo } = tree.markup(i);
    const found = last ? mdBlockIdEnd(s.slice(textFrom, textTo)) : null;
    if (found) {
      const at = textFrom + found.at;
      // (a line that is only the block id goes whole, with the line break before it)
      const alone = lineFrom > 0 && found.at === 0;
      out.push({ name: found.name, at, from: alone ? lineFrom - 1 : at - (found.at > 0 ? 1 : 0), to: type === 'heading' ? textTo : lineFrom + line.length });
    }
    lineFrom += line.length + 1;
  });
  return out;
}

/**
 * `text` without its block ids (a copy's: a block id names one block), or without those `which`
 * says, by where they are in `blockIdsOf(text)` (one of a name written twice, the other kept): those
 * in its string, the lines it carries (each with the blank lines before it, but the first left's,
 * which keeps its own). Without `which`, none is left: what ended before one that went goes too,
 * where it reads as one then (`^a ^b`). A text that is only block ids comes out empty.
 */
export function withoutBlockIds(text: OurusText, which?: ReadonlySet<number>): OurusText {
  const strings = stringBlockIds(text);
  const dropped = (k: number): boolean => !which || which.has(k);
  let spliced = text;
  // (from the last, the earlier ones' places as they are)
  for (let k = strings.length - 1; k >= 0; k--) if (dropped(k)) spliced = spliced.splice(strings[k]!.from, strings[k]!.to);
  if (!which) for (let more = stringBlockIds(spliced); more.length; more = stringBlockIds(spliced)) for (const b of [...more].reverse()) spliced = spliced.splice(b.from, b.to);
  // (a carried line's place among the block ids: past those in the string)
  const lines = text.blockIdLines.filter((_, k) => !dropped(k + strings.length));
  return spliced.withBlockIdLines(lines.length === text.blockIdLines.length ? text.blockIdLines : lines);
}

/**
 * Where a text ends, before a closing frame (a block id, an ATX closing sequence, a setext underline); in a block
 * between delimiters, a fence's at the end of its last line with text, or of its opening; `$$` and
 * `%%` before the closing delimiter.
 */
export function textEnd(text: OurusText): number {
  if (!(text instanceof OurusProse)) {
    const s = text.text;
    const close = text.frame.find((p) => p.part === 'close');
    if (!close) return s.length;
    // math and comments close after text on their line (`x$$`): typing before the delimiter is payload
    if (text.type === 'math_block' || text.type === 'comment_block') return close.from;
    const lines = s.split('\n');
    let at = 0;
    let end = lines[0]!.length;
    for (let k = 0; k < lines.length - 1; k++) {
      if (k > 0 && trimMd(lines[k]!) !== '') end = at + lines[k]!.length;
      at += lines[k]!.length + 1;
    }
    return end;
  }
  return closingFrameStart(text);
}

/**
 * Where typing extends a text: past its frame on its first line (an item's checkbox, a heading's
 * `#`s); in a block between delimiters, at its first line of payload with text, else after its
 * opening (a fence's whole line: after it, typing would be its info string).
 */
export function textStart(text: OurusText): number {
  if (text instanceof OurusProse) return text.textStart(0);
  const open = text.frame.find((p) => p.part === 'open');
  // indented code: past its first line's four columns; a footnote: past its label
  if (!open) return text.frame.find((p) => (p.part === 'indent' || p.part === 'label') && p.from === 0)?.to ?? 0;
  const lines = text.text.split('\n');
  const closed = text.frame.some((p) => p.part === 'close');
  // (from the opening's line, an item's below its marker's)
  const first = lineOf(text.text, open.from);
  const openEnd = lines.slice(0, first).reduce((n, l) => n + l.length + 1, 0) + lines[first]!.length;
  let at = openEnd + 1;
  for (let k = first + 1; k < lines.length - (closed ? 1 : 0); k++) {
    if (trimMd(lines[k]!) !== '') return at;
    at += lines[k]!.length + 1;
  }
  return text.type === 'fenced_code' ? openEnd : open.to;
}
