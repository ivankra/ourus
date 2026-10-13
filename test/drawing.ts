// Drawn editor states: `┃` caret, `«…»` selection (head where `┃` touches), `◌` placeholders
// place, `→` tab, `␍` carriage return.

import type { Selection } from '../src/commands/index.ts';

/**
 * Reads a drawn state: text plus caret (`┃`) or selection (`«…»`), placeholders (`◌`),
 * tabs drawn as `→`.
 */
export function readDrawing(drawn: string): { text: string; selection: Selection; placeholders: number[] } {
  let text = '';
  const placeholders: number[] = [];
  let caret = -1;
  let open = -1;
  let close = -1;
  let headAtStart = false;
  const s = drawn.replace(/→/g, '\t').replace(/␍/g, '\r');
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '┃') {
      caret = text.length;
      if (s[i + 1] === '«') headAtStart = true;
    } else if (c === '◌') placeholders.push(text.length);
    else if (c === '«') open = text.length;
    else if (c === '»') close = text.length;
    else text += c;
  }
  if (open >= 0 && close >= 0) {
    return { text, selection: headAtStart ? { anchor: close, head: open } : { anchor: open, head: close }, placeholders };
  }
  const pos = caret >= 0 ? caret : 0;
  return { text, selection: { anchor: pos, head: pos }, placeholders };
}

export function drawState(text: string, sel: Selection, placeholders: readonly number[] = []): string {
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  const marks = new Map<number, string>();
  const add = (pos: number, glyph: string) => marks.set(pos, (marks.get(pos) ?? '') + glyph);
  if (from === to) add(from, '┃');
  else {
    const forward = sel.head === to;
    add(from, forward ? '«' : '┃«');
    add(to, '»');
  }
  for (const p of placeholders) add(p, '◌');
  let out = '';
  for (let i = 0; i <= text.length; i++) out += (marks.get(i) ?? '') + (text[i] ?? '');
  return out.replace(/\t/g, '→').replace(/\r/g, '␍');
}

/** Plain text drawn with the buffer glyphs for invisible characters (a clipboard's): `→` tab, `␍` CR. */
export const readText = (drawn: string): string => drawn.replace(/→/g, '\t').replace(/␍/g, '\r');
export const drawText = (text: string): string => text.replace(/\t/g, '→').replace(/\r/g, '␍');
