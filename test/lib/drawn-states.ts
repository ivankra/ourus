// Drawn editor states: `┃` caret, `«…»` selection (head where `┃` touches), `◌` placeholders place,
// `→` tab, `␍` carriage return, `⍽` no-break space (U+00A0, which Markdown reads as text). Last on a
// node's first line, its marks: `⟦folded⟧` the node folded, `⟦zoomed⟧` the zoom root, `⟦selected⟧`
// the node a subtree selection's root (its subtree selected as whole lines; upward with `┃` at the
// first root's line start).
// Auto marks, the characters ourus put in: a combining caron below (U+032C) after one (`2\̬. b`, an
// escape of ours); a line break of ours (a blank line ourus raised) isn't drawn yet.

import { OurusRejected, OurusSuccess, type OurusResult, type OurusSelection } from '../../src/commands/index.ts';
import type { OurusConfig } from '../../src/config.ts';
import { OurusProse, OurusDoc, textEnd, textStart, type OurusNode } from '../../src/doc/index.ts';
import { trimMd } from '../../src/text/index.ts';
import { OurusView } from '../../src/view/index.ts';

/**
 * Whether a drawing draws the caret or a selection. A step's expected buffer may not, where only
 * what the text becomes matters (the caret left a node, say): the caret is then not checked. A start
 * always draws it.
 */
export const drawsCaret = (drawn: string): boolean => /[┃«»]|⟦selected⟧/.test(drawn);

/** A drawing without its caret and selection, to set beside one that draws none (a `␄` there for a caret past the text's last line break alone gone with it). */
export const withoutCaret = (drawn: string): string => drawn.replace(/[┃«»]|⟦selected⟧/g, '').replace(/\n␄\n$/, '\n');

/** A node's marks, last on its first line (spec/README.md): folded, the zoom root, a subtree selection's root. */
export type LineMark = 'folded' | 'zoomed' | 'selected';
const LINE_MARK = /⟦(folded|zoomed|selected)⟧$/;

/**
 * A drawing's line marks (`⟦folded⟧`, `⟦zoomed⟧`, `⟦selected⟧`), taken out: each line's, by its index,
 * in the order drawn. They are last on their line, after its labels; a `⟦` anywhere else is an error.
 */
export function readLineMarks(drawn: string): { drawn: string; marks: Map<number, LineMark[]> } {
  const marks = new Map<number, LineMark[]>();
  const lines = drawn.split('\n').map((line, i) => {
    const own: LineMark[] = [];
    for (let m = LINE_MARK.exec(line); m; m = LINE_MARK.exec(line)) {
      own.unshift(m[1] as LineMark);
      line = line.slice(0, m.index);
    }
    if (/[⟦⟧]/.test(line)) throw new Error(`line ${i + 1}: a mark (\`⟦folded⟧\`, \`⟦zoomed⟧\`, \`⟦selected⟧\`) is last on its line: ${JSON.stringify(line)}`);
    if (own.length) marks.set(i, own);
    return line;
  });
  return { drawn: lines.join('\n'), marks };
}

/** A drawing with `marks` (each line's) drawn last on their lines, in the order folded, zoomed, selected. */
export function drawLineMarks(drawn: string, marks: ReadonlyMap<number, readonly LineMark[]>): string {
  if (!marks.size) return drawn;
  const order: readonly LineMark[] = ['folded', 'zoomed', 'selected'];
  return drawn
    .split('\n')
    .map((line, i) => line + [...(marks.get(i) ?? [])].sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((m) => `⟦${m}⟧`).join(''))
    .join('\n');
}

/** An auto mark on the character before it: a combining caron below (U+032C). */
const AUTO_CHAR = '\u032c';

/** A drawing without its auto marks: what an app shows, which has none (the SxS). */
export const withoutAuto = (drawn: string): string => drawn.replaceAll(AUTO_CHAR, '');

/** A node label's glyph: `①` to `⑳`, `㉑` to `㉟`, `㊱` to `㊿` (spec/README.md). */
const LABEL = /[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]/u;
const LABELS = /[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]+(?=␍?(?:⟦(?:folded|zoomed|selected)⟧)*$)/u;

/** A label glyph's number, 1 to 50. */
/** A result's status as the spec writes it (`result:`): `success`, `rejected`, `deferredToHost`. */
export function resultStatus(r: OurusResult): 'success' | 'rejected' | 'deferredToHost' {
  return r instanceof OurusSuccess ? 'success' : r instanceof OurusRejected ? 'rejected' : 'deferredToHost';
}

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
 * outermost of the nodes starting there first). A label is last on its line, before a `␍` and the
 * line's marks (`⟦folded⟧`); one anywhere else is an error.
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

/** A drawing's view, by line (`readDrawing`): each folded node's first line (a line twice where two starting there are), and the zoom root's. */
export interface DrawnView {
  readonly folded: readonly number[];
  readonly zoom: number | null;
}

/**
 * Reads a drawn state: text plus caret (`┃`) or selection (`«…»`), or a subtree selection by its
 * roots' lines (`⟦selected⟧`, `selected`; upward where `┃` starts the first one's line: `subtrees`,
 * its direction; `drawnSelection` makes it), placeholders (`◌`), auto marks (a caron below a
 * character), tabs drawn as `→`; its view by line (`⟦folded⟧`, `⟦zoomed⟧`); node labels (`①`) are
 * taken out, and given by line; so is a drop line (`▸`). (A subtree selection drawn `««…»»`, as runs
 * the SxS stored before, reads too: its span's.)
 */
export function readDrawing(drawn: string): { text: string; selection: OurusSelection; subtrees: 'down' | 'up' | null; selected: readonly number[] | null; view: DrawnView; placeholders: number[]; auto: number[]; labels: Map<number, number[]>; drop: DropLine | null } {
  let text = '';
  const placeholders: number[] = [];
  const auto: number[] = [];
  let caret = -1;
  let open = -1;
  let close = -1;
  let headAtStart = false;
  let subtrees: 'down' | 'up' | null = null;
  const { drawn: unmarked, drop } = readDropLine(drawn);
  const { drawn: unviewed, marks } = readLineMarks(unmarked);
  const read = readLabels(unviewed);
  const labels = read.labels;
  // (`␄` ends the text, no line break after it: the buffer's own, the line its block ends, isn't the text's)
  if (read.drawn.includes('␄') && !/␄\n?$/.test(read.drawn)) throw new Error('`␄` ends the text: nothing after it on its line, nor a line below');
  const lineOf = (mark: LineMark): number[] => [...marks].flatMap(([line, own]) => own.filter((m) => m === mark).map(() => line)).sort((a, b) => a - b);
  const zoomed = lineOf('zoomed');
  if (zoomed.length > 1) throw new Error(`a second \`⟦zoomed⟧\` (line ${zoomed[1]! + 1}): one node is zoomed into`);
  const viewLines = { folded: lineOf('folded'), zoom: zoomed[0] ?? null };
  const marked = lineOf('selected');
  if (new Set(marked).size < marked.length) throw new Error('a line marked `⟦selected⟧` twice: a line has one root of a subtree selection');
  const s = readText(read.drawn.replace(/␄\n?$/, ''));
  /** Where each line of the drawing starts in the text. */
  const lineStarts = [0];
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '\n') lineStarts.push(text.length + 1);
    if (c === '┃') {
      caret = text.length;
      if (s[i + 1] === '«') headAtStart = true;
    } else if (c === '◌') placeholders.push(text.length);
    else if (c === AUTO_CHAR) {
      if (!text.length) throw new Error(`a caron below (an auto mark) with no character before it: ${JSON.stringify(drawn)}`);
      auto.push(text.length - 1);
    } else if (c === '«') {
      if (s[i + 1] === '«') [i, subtrees] = [i + 1, 'down'];
      open = text.length;
    } else if (c === '»') {
      if (s[i + 1] === '»') i++;
      close = text.length;
    } else text += c;
  }
  const selectedLines = marked;
  // (a mark is by the line of the drawing; the text's line starting it, which a lone CR, `␍` in a line, makes another)
  const textLine = (k: number): number => lineIndexAt(text, lineStarts[k] ?? text.length);
  const view: DrawnView = { folded: viewLines.folded.map(textLine), zoom: viewLines.zoom === null ? null : textLine(viewLines.zoom) };
  if (selectedLines.length) {
    // the first root's line start, where `┃` makes it upward: no other caret or selection drawn
    const first = lineStarts[selectedLines[0]!]!;
    if (open >= 0 || close >= 0 || (caret >= 0 && caret !== first)) throw new Error('a subtree selection (`⟦selected⟧`) draws no other caret or selection: `┃` alone, at its first root\'s line start, makes it upward');
    return { text, selection: { anchor: first, head: first }, subtrees: caret >= 0 ? 'up' : 'down', selected: selectedLines.map(textLine), view, placeholders, auto, labels, drop };
  }
  if (open >= 0 && close >= 0) {
    return { text, selection: headAtStart ? { anchor: close, head: open } : { anchor: open, head: close }, subtrees: subtrees && headAtStart ? 'up' : subtrees, selected: null, view, placeholders, auto, labels, drop };
  }
  const pos = caret >= 0 ? caret : 0;
  return { text, selection: { anchor: pos, head: pos }, subtrees: null, selected: null, view, placeholders, auto, labels, drop };
}

/** The line of `text` that offset `pos` is on (a CR alone, a CR LF and a LF each end one, as the parser has them). */
function lineIndexAt(text: string, pos: number): number {
  let n = 0;
  for (let i = 0; i < pos; i++) if (text[i] === '\n' || (text[i] === '\r' && text[i + 1] !== '\n')) n++;
  return n;
}

/** The line of a drawing of `text` that offset `pos` is on (its lines end at LFs only: a lone CR is `␍` in a line). */
const drawnLineAt = (text: string, pos: number): number => text.slice(0, pos).split('\n').length - 1;

/** Whether offset `pos` starts a line of a drawing of `text`. */
const startsDrawnLine = (text: string, pos: number): boolean => pos === 0 || text[pos - 1] === '\n';

/** The node a line mark names on line `line` of `view`'s document: the `k`th outermost of those starting there that `fits` (inside the zoom, for a selection). */
function markedNode(view: OurusView, line: number, fits: (node: OurusNode) => boolean, k = 0): OurusNode | null {
  return allNodes(view.doc).filter((n) => n.startLine === line && fits(n)).sort((a, b) => a.depth - b.depth)[k] ?? null;
}

/** Whether `node` is inside `view`'s zoom, its root included (anywhere, unzoomed). */
const inZoom = (view: OurusView, node: OurusNode): boolean => {
  if (view.zoom === null) return true;
  for (let n: OurusNode | null = node; n; n = n.parent) if (n.id === view.zoom) return true;
  return false;
};

/**
 * A drawing's view (`readDrawing`'s, by line) in `doc`: the folded nodes, each line's `⟦folded⟧`s the
 * outermost of the nodes starting there with something to fold; the zoom root, the outermost there.
 * A mark on a line with no such node is an error.
 */
export function drawnView(doc: OurusDoc, view: DrawnView): { folded: number[]; zoom: number | null } {
  const plain = OurusView.of(doc);
  const folded: number[] = [];
  const seen = new Map<number, number>();
  for (const line of view.folded) {
    const k = seen.get(line) ?? 0;
    seen.set(line, k + 1);
    const node = markedNode(plain, line, (n) => !!doc.foldRange(n), k);
    if (!node) throw new Error(`line ${line + 1}: \`⟦folded⟧\` on a line where no node${k ? ' more' : ''} with something to fold starts`);
    folded.push(node.id);
  }
  const zoom = view.zoom === null ? null : markedNode(plain, view.zoom, () => true)?.id;
  if (zoom === undefined) throw new Error(`line ${view.zoom! + 1}: \`⟦zoomed⟧\` on a line where no node starts`);
  return { folded, zoom };
}

/**
 * A drawing's selection in `view`, its text's: a subtree selection (`⟦selected⟧`) the canonical
 * selection of the nodes its lines mark (`OurusView.selectionOf`), upward where `┃` starts the first
 * one's line, the marks those of its roots or an error; else as drawn. (One drawn `««…»»`: of the
 * nodes its span touches.)
 */
export function drawnSelection(view: OurusView, drawing: { readonly selection: OurusSelection; readonly subtrees: 'down' | 'up' | null; readonly selected?: readonly number[] | null }): OurusSelection {
  if (!drawing.subtrees) return drawing.selection;
  if (!drawing.selected) return view.selectionOf(view.touchedSubtrees(drawing.selection), drawing.subtrees);
  const roots = drawing.selected.map((line) => {
    const node = markedNode(view, line, (n) => inZoom(view, n));
    if (!node) throw new Error(`line ${line + 1}: \`⟦selected⟧\` on a line where no node starts`);
    return node;
  });
  const sel = view.selectionOf(roots, drawing.subtrees);
  const back = view.selectedSubtrees(sel)?.map((n) => n.id) ?? [];
  if (JSON.stringify(back) !== JSON.stringify(roots.map((n) => n.id))) throw new Error(`the \`⟦selected⟧\` lines (${drawing.selected.map((l) => l + 1).join(', ')}) aren't the roots of the subtree selection they span: mark each root, and only the roots`);
  return sel;
}

/**
 * The roots of `sel`, where it is a subtree selection of the canonical shape (`OurusView.selectionOf`'s)
 * that their lines' marks name (`⟦selected⟧`: each the outermost node starting on its line, inside
 * the zoom); else null, the selection drawn at its offsets (an inner node selected on a line it
 * shares, `- - a`, its line naming the outer one).
 */
export function subtreeRoots(view: OurusView, sel: OurusSelection): readonly OurusNode[] | null {
  const roots = view.selectedSubtrees(sel);
  if (!roots) return null;
  const canonical = view.selectionOf(roots, sel.head < sel.anchor ? 'up' : 'down');
  if (canonical.anchor !== sel.anchor || canonical.head !== sel.head) return null;
  const starts = view.doc.mdTree.starts;
  return roots.every((r) => startsDrawnLine(view.doc.text, starts[r.startLine]!) && markedNode(view, r.startLine, (n) => inZoom(view, n))?.id === r.id) ? roots : null;
}

/**
 * A text and a selection in it drawn, its placeholders and auto marks (but on line breaks, not drawn
 * yet); `caret` false, the selection not drawn (a subtree selection's roots are, by their lines).
 */
export function drawState(text: string, sel: OurusSelection, placeholders: readonly number[] = [], caret = true, auto: readonly number[] = []): string {
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  const marks = new Map<number, string>();
  const add = (pos: number, glyph: string) => marks.set(pos, (marks.get(pos) ?? '') + glyph);
  if (!caret) {
    // (nothing drawn)
  } else if (from === to) add(from, '┃');
  else {
    const forward = sel.head === to;
    add(from, forward ? '«' : '┃«');
    add(to, '»');
  }
  for (const p of placeholders) add(p, '◌');
  // an auto character, a caron below it (an auto line break, a blank line's, isn't drawn yet)
  const marked = new Set(auto.filter((pos) => text[pos] !== '\n' && text[pos] !== '\r'));
  let out = '';
  for (let i = 0; i <= text.length; i++) out += (marks.get(i) ?? '') + (text[i] ?? '') + (marked.has(i) ? AUTO_CHAR : '');
  return endingText(drawText(out));
}

/**
 * A drawing that doesn't end with a line break (a text without a final one, or a mark past it) ended
 * with `␄`, then the line break every buffer ends with, which isn't the text's: `q⏎┃␄⏎` is `q⏎`, the
 * caret at its end.
 */
export const endingText = (drawn: string): string => (drawn.endsWith('\n') ? drawn : `${drawn}␄\n`);

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
  const visit = (node: OurusNode): void => {
    const text = doc.textOf(node);
    const kind = node.kind === 'heading' ? `heading ${node.head!.attrs.level}` : node.kind === 'atom' ? `atom ${node.block.type}` : node.kind;
    const task = node.kind === 'item' && text instanceof OurusProse && text.task ? ` [${text.task.status}]` : '';
    const own = drawText(nodePlainText(doc, node)).replace(/\r?\n/g, '⏎');
    out.push(`${'  '.repeat(node.depth - 1)}${kind}${task}${own ? `: ${own}` : ''}`);
    node.children.forEach(visit);
  };
  doc.rootNode.children.forEach(visit);
  return out.join('\n');
}

/**
 * A node's text without its frame (a checkbox, `#`s, a callout's `[!type]`), each line trimmed, and without
 * the backslashes that are markup there (`2\. x`: Markdown's escape, not what the text says); code's as it is.
 */
export function nodePlainText(doc: OurusDoc, node: OurusNode): string {
  const text = doc.textOf(node);
  if (!(text instanceof OurusProse)) return text?.text ?? '';
  const lines = text.body.split('\n');
  const escapes = doc.mdTree.flavor.markupEscapes(lines);
  return lines
    .map((line, k) => trimMd(escapes.filter((e) => e.line === k).reduceRight((out, e) => out.slice(0, e.at) + out.slice(e.at + 1), line)))
    .join('\n');
}

/** Every node of `doc` but the root, in document order. */
export function allNodes(doc: OurusDoc): OurusNode[] {
  const out: OurusNode[] = [];
  const visit = (node: OurusNode): void => {
    out.push(node);
    node.children.forEach(visit);
  };
  doc.rootNode.children.forEach(visit);
  return out;
}

/** The document a drawn state reads as: its text, placeholders and auto marks, read with `config`. */
export const parseWithMarks = (text: string, placeholders: readonly number[] = [], config: Partial<OurusConfig> = {}, auto: readonly number[] = []): OurusDoc =>
  OurusDoc.parse(text, { config, marks: { placeholders, auto } });

/** `text` read with `config`, in a view of nothing folded and no zoom. */
export const parseView = (text: string, config: Partial<OurusConfig> = {}): OurusView => OurusView.of(OurusDoc.parse(text, { config }));

/**
 * A view's document and a selection in it, drawn: a subtree selection by its roots' lines
 * (`⟦selected⟧`, upward with `┃` at the first one's line start), the view's folds and zoom by their
 * nodes' first lines (`⟦folded⟧`, `⟦zoomed⟧`).
 */
export function drawDoc(view: OurusView, sel: OurusSelection): string {
  const doc = view.doc;
  const roots = subtreeRoots(view, sel);
  const up = !!roots && sel.head < sel.anchor;
  const at = roots ? doc.mdTree.starts[roots[0]!.startLine]! : 0;
  const drawn = roots ? drawState(doc.text, { anchor: at, head: at }, doc.marks.placeholders, up, doc.marks.auto) : drawState(doc.text, sel, doc.marks.placeholders, true, doc.marks.auto);
  const marks = new Map<number, LineMark[]>();
  const mark = (line: number, m: LineMark): void => void marks.set(line, [...(marks.get(line) ?? []), m]);
  // (on the drawing's line where each node's first line starts)
  const lineOf = (node: OurusNode): number => drawnLineAt(doc.text, doc.mdTree.starts[node.startLine]!);
  for (const id of view.folded) mark(lineOf(doc.node(id)!), 'folded');
  if (view.zoom !== null) mark(lineOf(doc.node(view.zoom)!), 'zoomed');
  for (const r of roots ?? []) mark(lineOf(r), 'selected');
  return drawLineMarks(drawn, marks);
}
