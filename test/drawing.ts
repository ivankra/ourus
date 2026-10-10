// Drawn editor states: `┃` caret, `«…»` selection (head where `┃` touches), `◌` provisional
// place, `→` tab, `␍` carriage return.

import type { Selection } from '../src/commands.ts';

/**
 * Reads a drawn state: text plus caret (`┃`) or selection (`«…»`), provisional places (`◌`),
 * tabs drawn as `→`.
 */
export function readDrawing(drawn: string): { text: string; selection: Selection; provisional: number[] } {
  let text = '';
  const provisional: number[] = [];
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
    } else if (c === '◌') provisional.push(text.length);
    else if (c === '«') open = text.length;
    else if (c === '»') close = text.length;
    else text += c;
  }
  if (open >= 0 && close >= 0) {
    return { text, selection: headAtStart ? { anchor: close, head: open } : { anchor: open, head: close }, provisional };
  }
  const pos = caret >= 0 ? caret : 0;
  return { text, selection: { anchor: pos, head: pos }, provisional };
}

export function drawState(text: string, sel: Selection, provisional: readonly number[] = []): string {
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
  for (const p of provisional) add(p, '◌');
  let out = '';
  for (let i = 0; i <= text.length; i++) out += (marks.get(i) ?? '') + (text[i] ?? '');
  return out.replace(/\t/g, '→').replace(/\r/g, '␍');
}

