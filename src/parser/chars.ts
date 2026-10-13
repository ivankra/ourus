// Character classes and text helpers shared by the block and inline parsers, and the decoding the
// spec defines: backslash escapes, entity and numeric character references, URL normalization.

import { ENTITY_DATA } from './entities-data.ts';

export { isSpaceOrTab } from '../text.ts';

/** Space, tab, line feed, line tabulation, form feed or carriage return: what the spec calls a blank. */
export const isBlankChar = (c: number): boolean => c === 32 || c === 9 || c === 10 || c === 11 || c === 12 || c === 13;

/** Nothing but spaces, tabs, line endings, vertical tabs and form feeds. */
export function isBlankText(s: string, from = 0, to = s.length): boolean {
  for (let i = from; i < to; i++) if (!isBlankChar(s.charCodeAt(i))) return false;
  return true;
}

export const isAsciiAlpha = (c: number): boolean => (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
export const isAsciiDigit = (c: number): boolean => c >= 48 && c <= 57;
export const isAsciiAlnum = (c: number): boolean => isAsciiAlpha(c) || isAsciiDigit(c);

/** ASCII punctuation: what a backslash can escape. */
export const isAsciiPunctuation = (c: number): boolean =>
  (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126);

const reUnicodePunctuation = /[\p{P}\p{S}]/u;
const reUnicodeWhitespace = /[\t\n\f\r\p{Zs}]/u;

/** Unicode punctuation as CommonMark 0.31 defines it: general categories P and S, ASCII punctuation included. */
export function isPunctuation(cp: number): boolean {
  if (cp < 128) return isAsciiPunctuation(cp);
  return reUnicodePunctuation.test(String.fromCodePoint(cp));
}

/** Unicode whitespace: general category Zs, tab, line feed, form feed, carriage return. */
export function isUnicodeWhitespace(cp: number): boolean {
  if (cp < 128) return cp === 32 || cp === 9 || cp === 10 || cp === 12 || cp === 13;
  return reUnicodeWhitespace.test(String.fromCodePoint(cp));
}

/** The code point ending at `pos` (exclusive), or -1 at the start. */
export function codePointBefore(s: string, pos: number): number {
  if (pos <= 0) return -1;
  const low = s.charCodeAt(pos - 1);
  if (low >= 0xdc00 && low <= 0xdfff && pos >= 2) {
    const high = s.charCodeAt(pos - 2);
    if (high >= 0xd800 && high <= 0xdbff) return ((high - 0xd800) << 10) + (low - 0xdc00) + 0x10000;
  }
  return low;
}

/** The code point starting at `pos`, or -1 at the end. */
export function codePointAt(s: string, pos: number): number {
  return pos < s.length ? s.codePointAt(pos)! : -1;
}

// ----------------------------------------------------------------------------------- entities

let entities: Map<string, string> | null = null;

function entityMap(): Map<string, string> {
  if (entities) return entities;
  entities = new Map();
  for (const entry of ENTITY_DATA.split(',')) {
    const colon = entry.indexOf(':');
    const cps = entry.slice(colon + 1).split('.').map((c) => parseInt(c, 36));
    entities.set(entry.slice(0, colon), String.fromCodePoint(...cps));
  }
  return entities;
}

/** An entity or numeric character reference (`&amp;`, `&#35;`, `&#x22;`) decoded, or null when it names nothing. */
export function decodeReference(ref: string): string | null {
  if (ref.charCodeAt(1) === 35 /* # */) {
    const hex = ref.charCodeAt(2) === 120 || ref.charCodeAt(2) === 88;
    const cp = parseInt(ref.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    // invalid code points and NUL become the replacement character
    if (!(cp > 0 && cp <= 0x10ffff) || (cp >= 0xd800 && cp <= 0xdfff)) return '�';
    return String.fromCodePoint(cp);
  }
  return entityMap().get(ref.slice(1, -1)) ?? null;
}

/** An entity or numeric character reference, as the spec defines them (named ones still need checking against the list). */
export const ENTITY = '&(?:#[xX][a-fA-F0-9]{1,6}|#[0-9]{1,7}|[A-Za-z][A-Za-z0-9]{1,31});';
const reEntityOrEscape = new RegExp('\\\\[!-/:-@[-`{-~]|' + ENTITY, 'g');

/** Backslash escapes and entity references replaced by the characters they stand for. */
export function unescapeString(s: string): string {
  if (s.indexOf('\\') < 0 && s.indexOf('&') < 0) return s;
  return s.replace(reEntityOrEscape, (m) => (m.charCodeAt(0) === 92 ? m.charAt(1) : (decodeReference(m) ?? m)));
}

const reEntity = new RegExp(ENTITY, 'g');

/** Entity and numeric character references replaced by their characters (backslashes left alone). */
export function decodeEntities(s: string): string {
  if (s.indexOf('&') < 0) return s;
  return s.replace(reEntity, (m) => decodeReference(m) ?? m);
}

// -------------------------------------------------------------------------------------- output

const reHtmlSpecial = /[&<>"]/g;
const htmlSpecial: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** `&`, `<`, `>` and `"` as HTML references. */
export function escapeHtml(s: string): string {
  return reHtmlSpecial.test(s) ? s.replace(reHtmlSpecial, (c) => htmlSpecial[c]!) : s;
}

// what a URL may hold unencoded, besides ASCII letters and digits (mdurl's default set)
const URL_SAFE = new Set(";/?:@&=+$,-_.!~*'()#");

/**
 * A link destination percent-encoded as commonmark.js and cmark do: unsafe ASCII and every non-ASCII
 * character encoded as UTF-8, existing `%XX` escapes kept, a lone surrogate as U+FFFD.
 */
export function normalizeUri(uri: string): string {
  let out = '';
  for (let i = 0; i < uri.length; i++) {
    const c = uri.charCodeAt(i);
    if (c === 37 /* % */ && i + 2 < uri.length && isHex(uri.charCodeAt(i + 1)) && isHex(uri.charCodeAt(i + 2))) {
      out += uri.slice(i, i + 3);
      i += 2;
    } else if (c < 128) {
      out += isAsciiAlnum(c) || URL_SAFE.has(uri[i]!) ? uri[i] : '%' + (c < 16 ? '0' : '') + c.toString(16).toUpperCase();
    } else if (c >= 0xd800 && c <= 0xdfff) {
      const next = uri.charCodeAt(i + 1);
      if (c <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
        out += encodeURIComponent(uri[i]! + uri[i + 1]!);
        i++;
      } else out += '%EF%BF%BD';
    } else out += encodeURIComponent(uri[i]!);
  }
  return out;
}

const isHex = (c: number): boolean => isAsciiDigit(c) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102);

/**
 * A link label normalized for matching: brackets off, trimmed, inner whitespace collapsed, case
 * folded (as commonmark.js does: lower then upper case, with dotless i kept apart).
 */
export function normalizeLabel(label: string): string {
  const trimmed = label.slice(1, -1).trim().replace(/[ \t\r\n]+/g, ' ');
  if (trimmed.indexOf('ı') < 0) return trimmed.toLowerCase().toUpperCase();
  return trimmed.replace(/[^ı]+/g, (part) => part.toLowerCase().toUpperCase());
}
