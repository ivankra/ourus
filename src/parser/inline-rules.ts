// CommonMark's inline syntax as rules for the inline parser. Ported from commonmark.js 0.31.2
// (lib/inlines.js, BSD-2-Clause, see NOTICE).

import { decodeEntities, decodeReference, ENTITY, isAsciiAlpha, isAsciiPunctuation, normalizeUri } from './chars.ts';
import { CLOSETAG, OPENTAG } from './blocks.ts';
import { Node, type MdBracketRule, type MdDelimiterRule, type MdInlineParser, type MdInlineRule } from './inlines.ts';
import { scanDestination, scanLabel, scanTitle, skipSpnl } from './refs.ts';

const reEmailAutolink = /<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/y;
const reAutolink = /<([A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*)>/y;
const reTag = new RegExp(`(?:${OPENTAG}|${CLOSETAG})`, 'iy');
const reEntityHere = new RegExp(ENTITY, 'y');

function stickyMatch(re: RegExp, s: string, pos: number): RegExpExecArray | null {
  re.lastIndex = pos;
  return re.exec(s);
}

/** A line ending: a soft break, or a hard one after two spaces. The next line's leading spaces go with it. */
export const newlineRule: MdInlineRule = {
  name: 'newline',
  triggers: '\n',
  parse(p) {
    const at = p.pos;
    let from = at;
    let hard = false;
    const last = p.lastNode;
    if (last && last.type === 'text' && last.to === at && p.text.charCodeAt(at - 1) === 32) {
      let spaces = 0;
      while (last.to - spaces > last.from && p.text.charCodeAt(last.to - spaces - 1) === 32) spaces++;
      hard = spaces >= 2;
      last.to -= spaces;
      from = last.to;
      if (last.to === last.from) last.unlink();
    }
    let pos = at + 1;
    while (p.text.charCodeAt(pos) === 32) pos++;
    p.pos = pos;
    p.add(new Node(hard ? 'hardbreak' : 'softbreak', from, pos));
    return true;
  },
};

/** A backslash: an escaped punctuation character, a hard break before a line ending, or itself. */
export const backslashRule: MdInlineRule = {
  name: 'backslash',
  triggers: '\\',
  parse(p) {
    const at = p.pos;
    const c = p.text.charCodeAt(at + 1);
    if (c === 10) {
      p.pos = at + 2;
      p.add(new Node('hardbreak', at, at + 2));
    } else if (isAsciiPunctuation(c)) {
      p.pos = at + 2;
      p.add(new Node('escape', at, at + 2, { value: p.text[at + 1] }));
    } else {
      p.pos = at + 1;
      p.addText(at, at + 1);
    }
    return true;
  },
};

/** A code span, or a run of backticks as text. */
export const codeSpanRule: MdInlineRule = {
  name: 'code',
  triggers: '`',
  parse(p) {
    const { text } = p;
    const start = p.pos;
    let after = start;
    while (text.charCodeAt(after) === 96) after++;
    const length = after - start;
    const close = p.findTicks(after, length);
    if (close < 0) {
      p.pos = after;
      p.addText(start, after);
      return true;
    }
    let value = text.slice(after, close).replace(/\n/g, ' ');
    if (value.length > 2 && value[0] === ' ' && value[value.length - 1] === ' ' && /[^ ]/.test(value)) value = value.slice(1, -1);
    p.pos = close + length;
    p.add(new Node('code', start, p.pos, { value }));
    return true;
  },
};

/** `*` and `_` emphasis. */
export const asterisk: MdDelimiterRule = { char: '*', match: emphasis };
export const underscore: MdDelimiterRule = { char: '_', strict: true, match: emphasis };

function emphasis(opener: { count: number }, closer: { count: number }): { use: number; type: string } {
  const use = closer.count >= 2 && opener.count >= 2 ? 2 : 1;
  return { use, type: use === 1 ? 'emph' : 'strong' };
}

export const emphasisRule: MdInlineRule = {
  name: 'emphasis',
  triggers: '*_',
  parse: (p) => p.handleDelimiters(p.config.delimiters.get(p.text.charCodeAt(p.pos))!),
};

export const openBracketRule: MdInlineRule = {
  name: 'openBracket',
  triggers: '[',
  parse(p) {
    const at = p.pos;
    p.pos = at + 1;
    p.addBracket(p.addText(at, at + 1), at, false);
    return true;
  },
};

export const bangRule: MdInlineRule = {
  name: 'bang',
  triggers: '!',
  parse(p) {
    const at = p.pos;
    if (p.text.charCodeAt(at + 1) === 91 /* [ */) {
      p.pos = at + 2;
      p.addBracket(p.addText(at, at + 2), at + 1, true);
    } else {
      p.pos = at + 1;
      p.addText(at, at + 1);
    }
    return true;
  },
};

const isWhitespaceChar = (c: number): boolean => c === 32 || (c >= 9 && c <= 13);

/** A `]`: a link or image if it closes an opener and a destination or a known reference follows; else text. */
export const closeBracketRule: MdInlineRule = {
  name: 'closeBracket',
  triggers: ']',
  parse(p) {
    const { text } = p;
    p.pos += 1;
    const startpos = p.pos;
    const opener = p.brackets;
    if (!opener) {
      p.addText(startpos - 1, startpos);
      return true;
    }
    if (!p.isActive(opener)) {
      p.addText(startpos - 1, startpos);
      p.removeBracket();
      return true;
    }
    for (const rule of p.config.brackets) if (rule.phase === 'before' && rule.resolve(p, opener)) return true;
    if (opener.kind) {
      // an extension's bracket its rule didn't take: text
      p.removeBracket();
      p.addText(startpos - 1, startpos);
      return true;
    }

    const isImage = opener.image;
    let destination: string | undefined;
    let title: string | undefined;
    let label: string | undefined;
    let matched = false;
    // an inline link: `(destination "title")`
    if (text.charCodeAt(startpos) === 40 /* ( */) {
      let pos = skipSpnl(text, startpos + 1);
      const dest = scanDestination(text, pos);
      if (dest) {
        pos = skipSpnl(text, dest.end);
        if (isWhitespaceChar(text.charCodeAt(pos - 1))) {
          const t = scanTitle(text, pos);
          if (t) {
            title = t.value;
            pos = t.end;
          }
        }
        pos = skipSpnl(text, pos);
        if (text.charCodeAt(pos) === 41 /* ) */) {
          p.pos = pos + 1;
          destination = dest.value;
          matched = true;
        }
      }
    }
    // a reference: `[label]`, `[]` or nothing
    if (!matched) {
      p.pos = startpos;
      const labelEnd = scanLabel(text, startpos);
      let reflabel: string | null = null;
      if (labelEnd > startpos + 2) reflabel = text.slice(startpos, labelEnd);
      else if (!opener.bracketAfter) reflabel = text.slice(opener.index, startpos);
      if (labelEnd >= 0) p.pos = labelEnd;
      const ref = reflabel ? p.reference(reflabel) : undefined;
      if (ref) {
        destination = ref.destination;
        title = ref.title;
        label = reflabel!;
        matched = true;
      } else p.pos = startpos;
    }
    if (matched) {
      const attrs: Record<string, unknown> = { destination, title: title ?? '' };
      if (label !== undefined) attrs.label = label;
      p.closeBracket(opener, new Node(isImage ? 'image' : 'link', opener.node.from, p.pos, attrs));
      // no links in links
      if (!isImage) p.deactivateLinkOpeners();
      return true;
    }
    for (const rule of p.config.brackets) if (rule.phase === 'after' && rule.resolve(p, opener)) return true;
    p.removeBracket();
    p.pos = startpos;
    p.addText(startpos - 1, startpos);
    return true;
  },
};

/** `<`: an autolink (a URI or an email address), or raw HTML. */
export const angleRule: MdInlineRule = {
  name: 'angle',
  triggers: '<',
  parse(p) {
    const at = p.pos;
    let m = stickyMatch(reEmailAutolink, p.text, at);
    if (m) {
      const value = decodeEntities(m[1]!);
      p.pos = at + m[0].length;
      p.add(new Node('autolink', at, p.pos, { value, destination: normalizeUri('mailto:' + value) }));
      return true;
    }
    m = stickyMatch(reAutolink, p.text, at);
    if (m) {
      const value = decodeEntities(m[1]!);
      p.pos = at + m[0].length;
      p.add(new Node('autolink', at, p.pos, { value, destination: normalizeUri(value) }));
      return true;
    }
    const end = htmlEnd(p, at);
    if (end < 0) return false;
    p.pos = end;
    p.add(new Node('html', at, end));
    return true;
  },
};

/**
 * The end of the raw HTML at `at` (a tag, a comment, a processing instruction, a declaration or a
 * CDATA section), or -1. The ones closed by a delimiter far ahead remember when there is none (as
 * cmark does), so `<!--` repeated isn't quadratic.
 */
function htmlEnd(p: MdInlineParser, at: number): number {
  const { text } = p;
  const c = text.charCodeAt(at + 1);
  const flags = p.flags;
  const closedBy = (flag: string, closer: string, from: number): number => {
    if (flags.has(flag)) return -1;
    const i = text.indexOf(closer, from);
    if (i < 0) {
      flags.add(flag);
      return -1;
    }
    return i + closer.length;
  };
  if (c === 33 /* ! */) {
    if (text.startsWith('<!--', at)) {
      if (text.startsWith('<!-->', at)) return at + 5;
      if (text.startsWith('<!--->', at)) return at + 6;
      return closedBy('comment', '-->', at + 4);
    }
    if (text.startsWith('<![CDATA[', at)) return closedBy('cdata', ']]>', at + 9);
    if (isAsciiAlpha(text.charCodeAt(at + 2))) return closedBy('declaration', '>', at + 2);
    return -1;
  }
  if (c === 63 /* ? */) return closedBy('pi', '?>', at + 2);
  const m = stickyMatch(reTag, text, at);
  return m ? at + m[0].length : -1;
}

/** `&`: an entity or numeric character reference. */
export const entityRule: MdInlineRule = {
  name: 'entity',
  triggers: '&',
  parse(p) {
    const m = stickyMatch(reEntityHere, p.text, p.pos);
    if (!m) return false;
    const at = p.pos;
    p.pos = at + m[0].length;
    const value = decodeReference(m[0]);
    if (value === null) p.addText(at, p.pos);
    else p.add(new Node('entity', at, p.pos, { value }));
    return true;
  },
};

export const commonMarkInlines: readonly MdInlineRule[] = [
  newlineRule,
  backslashRule,
  codeSpanRule,
  emphasisRule,
  openBracketRule,
  bangRule,
  closeBracketRule,
  angleRule,
  entityRule,
];

export const commonMarkDelimiters: readonly MdDelimiterRule[] = [asterisk, underscore];

export const commonMarkBrackets: readonly MdBracketRule[] = [];
