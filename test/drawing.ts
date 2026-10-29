// Drawn editor states: `┃` caret, `«…»` selection (head where `┃` touches), `««…»»` subtree
// selection (the subtrees of the nodes it touches, as whole lines: `drawnSelection`), `◌` placeholders
// place, `→` tab, `␍` carriage return, `⍽` no-break space (U+00A0, which Markdown reads as text).

import type { TextSelection } from '../src/commands/index.ts';
import type { Config } from '../src/config.ts';
import { ProseText, OurusDoc, textEnd, textStart, type OutlineNode } from '../src/doc/index.ts';
import { createPlaceholder, trimMd } from '../src/text/index.ts';

/**
 * Whether a drawing draws the caret or a selection. A step's expected buffer may not, where only
 * what the text becomes matters (the caret left a node, say): the caret is then not checked. A start
 * always draws it.
 */
export const drawsCaret = (drawn: string): boolean => /[┃«»]/.test(drawn);

/** A drawing without its caret and selection, to set beside one that draws none. */
export const withoutCaret = (drawn: string): string => drawn.replace(/[┃«»]/g, '');

/** A node label's glyph: `①` to `⑳`, `㉑` to `㉟`, `㊱` to `㊿` (spec/README.md). */
const LABEL = /[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]/u;
const LABELS = /[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]+(?=␍?$)/u;

/** A label glyph's number, 1 to 50. */
export function labelNumber(glyph: string): number {
  const c = glyph.codePointAt(0)!;
  return c <= 0x2473 ? c - 0x2460 + 1 : c <= 0x325f ? c - 0x3251 + 21 : c - 0x32b1 + 36;
}

/** Label `n`'s glyph. */
export function labelGlyph(n: number): string {
  return String.fromCodePoint(n <= 20 ? 0x2460 + n - 1 : n <= 35 ? 0x3251 + n - 21 : 0x32b1 + n - 36);
}

/**
 * A drawing's node labels (`①`), taken out: each line's, by its index, in the order drawn (the
 * outermost of the nodes starting there first). A label is last on its line, before a `␍`; one
 * anywhere else is an error.
 */
export function readLabels(drawn: string): { drawn: string; labels: Map<number, number[]> } {
  const labels = new Map<number, number[]>();
  const lines = drawn.split('\n').map((line, i) => {
    const m = LABELS.exec(line);
    const rest = m ? line.slice(0, m.index) + line.slice(m.index + m[0].length) : line;
    if (LABEL.test(rest)) throw new Error(`line ${i + 1}: a label is last on its line: ${JSON.stringify(line)}`);
    if (m) labels.set(i, [...m[0]].map(labelNumber));
    return rest;
  });
  return { drawn: lines.join('\n'), labels };
}

/** A drawing with `labels` (each line's, as `readLabels` gives them) drawn last on their lines. */
export function drawLabels(drawn: string, labels: ReadonlyMap<number, readonly number[]>): string {
  if (!labels.size) return drawn;
  return drawn
    .split('\n')
    .map((line, i) => {
      const own = labels.get(i);
      if (!own?.length) return line;
      const glyphs = own.map(labelGlyph).join('');
      return line.endsWith('␍') ? line.slice(0, -1) + glyphs + '␍' : line + glyphs;
    })
    .join('\n');
}

/** Where a drawing drops (spec/README.md): the gap before line `line` of its text (the line count at its end), at `depth`. */
export interface DropLine {
  readonly line: number;
  readonly depth: number;
}

/**
 * A drawing's drop line (`▸` alone on a line, at twice the depth the run lands at), taken out: the
 * gap and the depth it names, or none. A second one, a `▸` anywhere else, or one at an odd column is
 * an error.
 */
export function readDropLine(drawn: string): { drawn: string; drop: DropLine | null } {
  const lines = drawn.split('\n');
  const at = lines.flatMap((line, i) => (/^ *▸ *$/.test(line) ? [i] : []));
  const stray = lines.findIndex((line, i) => /[▸▹]/.test(line) && !at.includes(i));
  if (stray >= 0) throw new Error(`line ${stray + 1}: a drop line holds a \`▸\` and spaces only: ${JSON.stringify(lines[stray])}`);
  if (at.length > 1) throw new Error(`line ${at[1]! + 1}: a second drop line: a case drops once`);
  if (!at.length) return { drawn, drop: null };
  const line = at[0]!;
  const column = lines[line]!.indexOf('▸');
  if (column % 2) throw new Error(`line ${line + 1}: a drop line's \`▸\` is at an even column, twice the depth (column ${column})`);
  return { drawn: lines.filter((_, i) => i !== line).join('\n'), drop: { line, depth: column / 2 } };
}

/**
 * Reads a drawn state: text plus caret (`┃`) or selection (`«…»`, or `««…»»` for a subtree selection,
 * `subtrees`, its direction, its offsets those drawn: `drawnSelection` makes it), placeholders (`◌`), tabs drawn as
 * `→`; node labels (`①`) are taken out, and given by line; so is a drop line (`▸`).
 */
export function readDrawing(drawn: string): { text: string; selection: TextSelection; subtrees: 'down' | 'up' | null; placeholders: number[]; labels: Map<number, number[]>; drop: DropLine | null } {
  let text = '';
  const placeholders: number[] = [];
  let caret = -1;
  let open = -1;
  let close = -1;
  let headAtStart = false;
  let subtrees: 'down' | 'up' | null = null;
  const { drawn: unmarked, drop } = readDropLine(drawn);
  const read = readLabels(unmarked);
  const labels = read.labels;
  const s = readText(read.drawn);
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '┃') {
      caret = text.length;
      if (s[i + 1] === '«') headAtStart = true;
    } else if (c === '◌') placeholders.push(text.length);
    else if (c === '«') {
      if (s[i + 1] === '«') [i, subtrees] = [i + 1, 'down'];
      open = text.length;
    } else if (c === '»') {
      if (s[i + 1] === '»') i++;
      close = text.length;
    } else text += c;
  }
  if (open >= 0 && close >= 0) {
    return { text, selection: headAtStart ? { anchor: close, head: open } : { anchor: open, head: close }, subtrees: subtrees && headAtStart ? 'up' : subtrees, placeholders, labels, drop };
  }
  const pos = caret >= 0 ? caret : 0;
  return { text, selection: { anchor: pos, head: pos }, subtrees: null, placeholders, labels, drop };
}

/**
 * A drawing's selection in `doc`, its text's: a subtree selection (`««…»»`) the canonical selection of
 * the nodes its span touches (`OurusDoc.selectionOf`), upward where `┃` is before it; else as drawn.
 */
export function drawnSelection(doc: OurusDoc, drawing: { readonly selection: TextSelection; readonly subtrees: 'down' | 'up' | null }): TextSelection {
  if (!drawing.subtrees) return drawing.selection;
  return doc.selectionOf(doc.touchedSubtrees(drawing.selection), drawing.subtrees);
}

/**
 * Where `sel`, a subtree selection of the canonical shape (`OurusDoc.selectionOf`'s), is drawn: `««`
 * where the first root's text starts (its first descendant's with text, where it has none), `»»`
 * where the last's own text ends (its last child's, where it has none), the shortest span that reads
 * back as it; null for any other selection, drawn as it is, and where no span reads back as it (an
 * empty last node on an empty line: any offset there is the line's start, which touches nothing).
 */
export function subtreeSpan(doc: OurusDoc, sel: TextSelection): { from: number; to: number } | null {
  const roots = doc.selectedNodes(sel);
  if (!roots) return null;
  const up = sel.head < sel.anchor;
  const canonical = doc.selectionOf(roots.map((n) => n.id), up ? 'up' : 'down');
  if (canonical.anchor !== sel.anchor || canonical.head !== sel.head) return null;
  let first: OutlineNode = roots[0]!;
  while (!doc.textOf(first) && first.children.length) first = first.children[0]!;
  let last: OutlineNode = roots[roots.length - 1]!;
  while (!doc.textOf(last) && last.children.length) last = last.children[last.children.length - 1]!;
  const start = doc.textOf(first);
  if (!start) return null;
  const from = doc.posOf(first, textStart(start), 1);
  // the last's own text end; where that touches nothing (an empty text on an empty line), its last
  // descendant's
  for (const node of [last, last.lastDescendant]) {
    const text = doc.textOf(node);
    if (!text) continue;
    // (an empty text's end, the side left of what isn't text, can be before its start: one point)
    const span = { from, to: Math.max(from, doc.posOf(node, textEnd(text), -1)) };
    const back = drawnSelection(doc, { selection: { anchor: span.from, head: span.to }, subtrees: up ? 'up' : 'down' });
    if (back.anchor === sel.anchor && back.head === sel.head) return span;
  }
  return null;
}

/** A text and a selection in it drawn; `span`, where the selection is a subtree selection, where it draws it (`subtreeSpan`). */
export function drawState(text: string, sel: TextSelection, placeholders: readonly number[] = [], span: { from: number; to: number } | null = null): string {
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  const marks = new Map<number, string>();
  const add = (pos: number, glyph: string) => marks.set(pos, (marks.get(pos) ?? '') + glyph);
  if (span) {
    add(span.from, sel.head < sel.anchor ? '┃««' : '««');
    add(span.to, '»»');
  } else if (from === to) add(from, '┃');
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
export const drawDoc = (doc: OurusDoc, sel: TextSelection): string => drawState(doc.text, sel, doc.marks.points(), subtreeSpan(doc, sel));
