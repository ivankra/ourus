// A node's text: its own lines past their containers' prefixes, one string with its placeholders as
// marks, a type, and a frame computed from its characters, which `body` leaves out. Two kinds: a
// `ProseText` is a paragraph's, a heading's or a callout title's, text ourus edits as text (its frame
// a checkbox, a heading's `#`s, a callout's type, an underline; its markup escapes left out); an
// `AtomText` is an atom's lines as written (code, math, a comment, HTML, a table, ...), its frame a
// fence's runs and info, indented code's columns, a footnote's label.

/** A node's text, of either kind. */
export type OutlineNodeText = ProseText | AtomText;

import { mdCalloutAt } from '../parser/index.ts';
import { emptyNodeAt, lineOf, MarkSet, trimMd } from '../text/index.ts';

/** What a text is: a paragraph's (an item's too), a heading's, or a quote's, its callout's title. */
export type ProseTextType = 'paragraph' | 'heading' | 'title';

/** A piece of a text's frame, in its string's offsets (`text`). */
export interface FramePart {
  /** `task`: a checkbox; `heading`: `#`s; `close`: a closing sequence; `callout`: `[!type]` and its fold; `underline`: a setext underline, with the line break before it; `below`: the line breaks before an item's text, which starts below its marker. */
  readonly part: 'task' | 'heading' | 'close' | 'callout' | 'underline' | 'below';
  readonly from: number;
  readonly to: number;
}

/**
 * A checkbox at an item's text start, and the blanks after it; or alone (`- [ ]`). In every flavor,
 * as the outline reads tasks, with Obsidian's statuses: any one character between the brackets
 * (`[?]`, `[a]`).
 */
const reCheckbox = /^\[[^\n]\](?:[ \t]+|$)/;
/** An ATX heading's opening `#`s and the blanks after them. */
const reAtxOpen = /^#{1,6}(?:[ \t]+|$)/;
/** An ATX heading's closing sequence, with the blanks around it. */
const reAtxClose = /(?:^|[ \t]+)#+[ \t]*$/;
/** A setext heading's underline, after its indentation (a heading's type says it is one: the parser has counted the columns). */
const reUnderline = /^[ \t]*(?:=+|-+)[ \t]*$/;

export class ProseText {
  readonly type: ProseTextType;
  /** An item's text, which can start with a checkbox, or on the line after its marker. */
  readonly item: boolean;
  /** The lines past their prefixes, without markup escapes, `\n` between them: the frame and the body. */
  readonly text: string;
  /** The placeholders, in `text`'s offsets. */
  readonly marks: MarkSet;
  #frame: readonly FramePart[] | undefined;

  constructor(type: ProseTextType, item: boolean, text: string, marks: MarkSet = MarkSet.empty) {
    this.type = type;
    this.item = item;
    this.text = text;
    this.marks = marks;
  }

  /** The frame, computed from the characters, the type and `item`. */
  get frame(): readonly FramePart[] {
    return (this.#frame ??= frameOf(this.type, this.item, this.text, (at) => emptyNodeAt(this.marks, this.text, at)));
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

  get heading(): { readonly level: number; readonly form: 'atx' | 'setext' } | null {
    const open = this.frame.find((p) => p.part === 'heading');
    if (open) return { level: /^#+/.exec(this.text.slice(open.from, open.to))![0].length, form: 'atx' };
    const underline = this.frame.find((p) => p.part === 'underline');
    return underline ? { level: this.text.slice(underline.from, underline.to).includes('=') ? 1 : 2, form: 'setext' } : null;
  }

  get callout(): { readonly type: string; readonly fold: '+' | '-' | null } | null {
    const part = this.frame.find((p) => p.part === 'callout');
    if (!part) return null;
    const callout = mdCalloutAt(this.text.slice(part.from, part.to))!;
    return { type: callout.kind, fold: callout.fold };
  }

  /** Whether the text holds nothing but Markdown's whitespace (a no-break space is text). */
  get empty(): boolean {
    return trimMd(this.body) === '';
  }

  /** The first offset of line `line` past its frame. */
  textStart(line: number): number {
    let at = 0;
    for (let k = 0; k < line; k++) {
      const next = this.text.indexOf('\n', at);
      if (next < 0) return this.text.length;
      at = next + 1;
    }
    for (const part of this.frame) if (part.from <= at && part.to > at && part.part !== 'underline') at = part.to;
    return at;
  }

  /** The same string read as an item's text, or not. */
  asItem(item: boolean): ProseText {
    return item === this.item ? this : new ProseText(this.type, item, this.text, this.marks);
  }

  /** `[from, to)` replaced by `insert`: the marks around move by their policies, the insertion's come with it. */
  splice(from: number, to: number, insert: ProseText | string = ''): ProseText {
    const [text, marks] = typeof insert === 'string' ? [insert, MarkSet.empty] : [insert.text, insert.marks];
    return new ProseText(this.type, this.item, this.text.slice(0, from) + text + this.text.slice(to), this.marks.splice(from, to, text, marks));
  }

  /** `[from, to)` with its marks: a point at `to` only at the text's end (`MarkSet.slice`). */
  slice(from = 0, to = this.text.length): ProseText {
    return new ProseText(this.type, this.item, this.text.slice(from, to), this.marks.slice(from, to, to === this.text.length));
  }

  /** The texts after this one, their marks with them. */
  concat(...others: readonly (ProseText | string)[]): ProseText {
    let text = this.text;
    let marks = this.marks;
    for (const o of others) {
      if (typeof o === 'string') text += o;
      else {
        marks = marks.update({ add: o.marks.shift(text.length).marks });
        text += o.text;
      }
    }
    return new ProseText(this.type, this.item, text, marks);
  }

  /**
   * The text after an edit, its transitions applied: a heading whose characters no longer read
   * as one is a paragraph's, as is a title that no longer reads as a callout; a paragraph never
   * becomes a heading by its characters. A checkbox is read again from the characters with the
   * frame, both ways, with nothing to do here.
   */
  normalize(): ProseText {
    if (this.type === 'heading' && !this.frame.some((p) => p.part === 'heading' || p.part === 'underline')) return new ProseText('paragraph', this.item, this.text, this.marks);
    if (this.type === 'title' && !this.frame.some((p) => p.part === 'callout')) return new ProseText('paragraph', this.item, this.text, this.marks);
    return this;
  }
}

/** The frame of `text`, typed `type`, an item's or not; `held`: whether a placeholder holds an empty line ending at an offset. */
function frameOf(type: ProseTextType, item: boolean, text: string, held: (at: number) => boolean = () => false): FramePart[] {
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
  if (type === 'title') {
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
 * The text of code, math, a comment and every other atom: its lines as written past their
 * containers' prefixes (a partly taken tab as its spaces), one string with its placeholders as
 * marks, and a frame computed from its characters by its type: the parser's block type, but code's,
 * which is `fenced_code` or `indented_code`.
 */
export class AtomText {
  readonly type: string;
  readonly item: boolean;
  /** The lines past their prefixes, `\n` between them: the frame and the body. */
  readonly text: string;
  /** The placeholders, in `text`'s offsets. */
  readonly marks: MarkSet;
  #frame: readonly AtomFramePart[] | undefined;

  constructor(type: string, item: boolean, text: string, marks: MarkSet = MarkSet.empty) {
    this.type = type;
    this.item = item;
    this.text = text;
    this.marks = marks;
  }

  get frame(): readonly AtomFramePart[] {
    return (this.#frame ??= atomFrameOf(this.type, this.text));
  }

  /** The payload: the lines between a fence's, past indented code's columns; the text but a footnote's label; nothing of a rule. */
  get body(): string {
    const s = this.text;
    const frame = this.frame;
    const open = frame.find((p) => p.part === 'open');
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
    return open ? this.text.slice(open.from, open.to).trim() : null;
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

  /** `[from, to)` replaced by `insert`, the marks around moving by their policies. */
  splice(from: number, to: number, insert = ''): AtomText {
    return new AtomText(this.type, this.item, this.text.slice(0, from) + insert + this.text.slice(to), this.marks.splice(from, to, insert));
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
    while (f < lines.length - 1 && lines[f]!.trim() === '') f++;
    const base = lines.slice(0, f).reduce((n, l) => n + l.length + 1, 0);
    const open = lines[f]!;
    const fence = reFenceOpen.exec(open);
    if (fence) {
      const runFrom = fence[0].length - fence[1]!.length;
      parts.push({ part: 'open', from: base + runFrom, to: base + fence[0].length });
      const info = open.slice(fence[0].length).trim();
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
    const lead = lines[0]!.indexOf(delimiter);
    if (lead >= 0) parts.push({ part: 'open', from: lead, to: lead + 2 });
    // `$$` and `%%` close after text too (`x$$`)
    const end = text.trimEnd();
    if (lines.length > 1 && end.endsWith(delimiter) && end.length - 2 >= lastStart) parts.push({ part: 'close', from: end.length - 2, to: end.length });
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
