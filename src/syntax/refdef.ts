// Link reference definition recognition, ported from commonmark.js 0.31.2 (lib/inlines.js,
// BSD-2-Clause). Only what block parsing needs: whether a paragraph's raw content starts with
// a definition, and how many characters it spans.

const ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]";
const ESCAPED_CHAR = '\\\\' + ESCAPABLE;

const reLinkTitle = new RegExp(
  '^(?:"(' +
    ESCAPED_CHAR +
    '|\\\\[^\\\\]' +
    '|[^\\\\"\\x00])*"' +
    '|' +
    "'(" +
    ESCAPED_CHAR +
    '|\\\\[^\\\\]' +
    "|[^\\\\'\\x00])*'" +
    '|' +
    '\\((' +
    ESCAPED_CHAR +
    '|\\\\[^\\\\]' +
    '|[^\\\\()\\x00])*\\))',
);
const reLinkDestinationBraces = /^(?:<(?:[^<>\n\\\x00]|\\.)*>)/;
const reEscapable = new RegExp('^' + ESCAPABLE);
const reSpnl = /^ *(?:\n *)?/;
const reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;
const reSpaceAtEndOfLine = /^ *(?:\n|$)/;
const reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/s;

export function normalizeLabel(label: string): string {
  return label
    .slice(1, label.length - 1)
    .trim()
    .replace(/[ \t\r\n]+/g, ' ')
    .toLowerCase()
    .toUpperCase();
}

class Scanner {
  pos = 0;
  readonly subject: string;

  constructor(subject: string) {
    this.subject = subject;
  }

  match(re: RegExp): string | null {
    const m = re.exec(this.subject.slice(this.pos));
    if (m === null) return null;
    this.pos += m.index + m[0].length;
    return m[0];
  }

  peek(): number {
    return this.pos < this.subject.length ? this.subject.charCodeAt(this.pos) : -1;
  }

  linkLabel(): number {
    const m = this.match(reLinkLabel);
    return m === null || m.length > 1001 ? 0 : m.length;
  }

  linkDestination(): boolean {
    if (this.match(reLinkDestinationBraces) !== null) return true;
    if (this.peek() === 60 /* < */) return false;
    const savepos = this.pos;
    let openparens = 0;
    let c: number;
    while ((c = this.peek()) !== -1) {
      if (c === 92 /* \ */ && reEscapable.test(this.subject.charAt(this.pos + 1))) {
        this.pos += 1;
        if (this.peek() !== -1) this.pos += 1;
      } else if (c === 40 /* ( */) {
        this.pos += 1;
        openparens += 1;
      } else if (c === 41 /* ) */) {
        if (openparens < 1) break;
        this.pos += 1;
        openparens -= 1;
      } else if (reWhitespaceChar.test(String.fromCharCode(c))) {
        break;
      } else {
        this.pos += 1;
      }
    }
    if (this.pos === savepos && c !== 41) return false;
    return openparens === 0;
  }
}

/**
 * Length of the link reference definition at the start of `s` (a paragraph's raw content,
 * lines joined with `\n`), or 0 when there is none. A definition always ends at a line end,
 * and the returned length includes that line's `\n`.
 */
export function scanReference(s: string): { length: number; label: string } | null {
  const p = new Scanner(s);
  const labelLength = p.linkLabel();
  if (labelLength === 0) return null;
  const label = s.slice(0, labelLength);
  if (p.peek() !== 58 /* : */) return null;
  p.pos++;
  p.match(reSpnl);
  if (!p.linkDestination()) return null;
  const beforeTitle = p.pos;
  p.match(reSpnl);
  let title: string | null = null;
  if (p.pos !== beforeTitle) title = p.match(reLinkTitle);
  if (title === null) p.pos = beforeTitle;
  let atLineEnd = true;
  if (p.match(reSpaceAtEndOfLine) === null) {
    if (title === null) atLineEnd = false;
    else {
      // The title isn't at the line end, but the definition may still end at the destination.
      p.pos = beforeTitle;
      atLineEnd = p.match(reSpaceAtEndOfLine) !== null;
    }
  }
  if (!atLineEnd) return null;
  if (normalizeLabel(label) === '') return null;
  return { length: p.pos, label };
}
