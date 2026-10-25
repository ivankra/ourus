// Drawn editor states: `┃` caret, `«…»` selection (head where `┃` touches), `◌` placeholders
// place, `→` tab, `␍` carriage return, `⍽` no-break space (U+00A0, which Markdown reads as text).

import type { Selection } from '../src/commands/index.ts';
import type { Config } from '../src/config.ts';
import { ProseText, OurusDoc, type OutlineNode } from '../src/doc/index.ts';
import { createPlaceholder, trimMd } from '../src/text/index.ts';

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
  const s = readText(drawn);
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
  return drawText(out);
}

/**
 * Plain text drawn with the buffer glyphs for invisible characters (a clipboard's): `→` tab, `␍` CR, `⍽`
 * U+00A0, `␠` a space (as `probe.ts` draws a line's trailing ones; drawing writes them as they are).
 */
export const readText = (drawn: string): string => drawn.replace(/→/g, '\t').replace(/␍/g, '\r').replace(/⍽/g, '\u00a0').replace(/␠/g, ' ');
export const drawText = (text: string): string => text.replace(/\t/g, '→').replace(/\r/g, '␍').replace(/\u00a0/g, '⍽');

/**
 * How a document reads, drawn: a line per node in document order, indented two spaces a level, its
 * kind (a heading with its level, an atom with its block's type, a task with its checkbox), then its
 * text, line breaks drawn `⏎`. For a case whose point is a reading the bytes don't show (a setext
 * underline against an empty child, a lazy line against a paragraph, a task against `[ ]` text).
 */
export function drawOutline(doc: OurusDoc): string {
  const out: string[] = [];
  const visit = (node: OutlineNode): void => {
    const text = doc.textOf(node);
    const kind = node.kind === 'heading' ? `heading ${node.head!.attrs.level}` : node.kind === 'atom' ? `atom ${node.block.type}` : node.kind;
    const task = node.kind === 'item' && text instanceof ProseText && text.task ? ` [${text.task.status}]` : '';
    const own = drawText(plainText(doc, node)).replace(/\r?\n/g, '⏎');
    out.push(`${'  '.repeat(node.depth - 1)}${kind}${task}${own ? `: ${own}` : ''}`);
    node.children.forEach(visit);
  };
  doc.rootNode.children.forEach(visit);
  return out.join('\n');
}

/** A node's text without its frame (a checkbox, `#`s, a callout's `[!type]`), each line trimmed; code's as it is. */
export function plainText(doc: OurusDoc, node: OutlineNode): string {
  const text = doc.textOf(node);
  if (!(text instanceof ProseText)) return text?.text ?? '';
  return text.body
    .split('\n')
    .map((line) => trimMd(line))
    .join('\n');
}

/** Every node of `doc` but the root, in document order. */
export function nodesOf(doc: OurusDoc): OutlineNode[] {
  const out: OutlineNode[] = [];
  const visit = (node: OutlineNode): void => {
    out.push(node);
    node.children.forEach(visit);
  };
  doc.rootNode.children.forEach(visit);
  return out;
}

/** The document a drawn state reads as: its text and placeholders, read with `config`. */
export const docOf = (text: string, placeholders: readonly number[] = [], config: Partial<Config> = {}): OurusDoc =>
  OurusDoc.parse(text, { config, marks: placeholders.map((p) => createPlaceholder(p)) });

/** A document and a selection in it, drawn. */
export const drawDoc = (doc: OurusDoc, sel: Selection): string => drawState(doc.text, sel, doc.marks.points());
