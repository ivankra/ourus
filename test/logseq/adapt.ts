// Adapts spec examples to what Logseq can hold, so they can be replayed there and Logseq's own
// results recorded (`spec/logseq.md`).
//
// Each outline node becomes a block, read with ourus's parser: items, paragraphs, headings (as
// `## title`, their sections nested under them), and atoms (code, quotes, HTML, breaks) as raw
// content. Task checkboxes become Logseq's `TODO` / `DONE`; ordered and `*` items become blocks like
// any other; blank lines and CR endings go. A caret maps to its block and an offset in the block's
// content (in a marker: the text start); a selection must stay inside one block.

import { Doc } from '../../src/doc.ts';
import type { OutlineNode } from '../../src/outline.ts';
import { readDrawing, readText } from '../drawing.ts';
import type { SpecTest } from '../specfile.ts';

export interface Block {
  depth: number;
  text: string;
}
export interface Sel {
  block: number;
  anchor: number;
  head: number;
}
export interface Outline {
  blocks: Block[];
  sel: Sel | null;
}
export interface Adapted {
  source: string;
  initial: Outline;
  clipboard: string | null;
  steps: string[][];
}

/** Logseq's keys for each spec action (Linux bindings); `select…` motions add Shift. */
const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryForward: 'End',
  LineBoundaryBackward: 'Home',
};
export const KEYS: Record<string, string> = {
  insertParagraph: 'Enter',
  insertLineBreak: 'Shift+Enter',
  formatIndent: 'Tab',
  formatOutdent: 'Shift+Tab',
  deleteContentBackward: 'Backspace',
  deleteContentForward: 'Delete',
  moveUp: 'Alt+Shift+ArrowUp',
  moveDown: 'Alt+Shift+ArrowDown',
  undo: 'Control+z',
  redo: 'Control+Shift+z',
  ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
};

export const actionSupported = (a: string): boolean => /^"[^"]*"$/.test(a) || a in KEYS || a === 'insertFromPaste';

/** A node's content as a Logseq block holds it, with where each kept line started in the source. */
function contentOf(doc: Doc, n: OutlineNode): { text: string; lines: { from: number; to: number; at: number }[]; prefix: number } {
  const head = n.head;
  if (!head) {
    const line = doc.lines[n.startLine]!;
    return { text: '', lines: [{ from: line.to, to: line.to, at: 0 }], prefix: 0 };
  }
  const isHeading = head.type === 'heading';
  const raw = n.kind === 'atom' || (head.type !== 'paragraph' && !isHeading);
  const lines: { from: number; to: number; at: number }[] = [];
  const parts: string[] = [];
  let prefix = 0;
  const last = isHeading && head.setext ? head.endLine - 1 : head.endLine;
  for (let l = head.startLine; l <= last; l++) {
    const line = doc.lines[l]!;
    let from = line.contentFrom;
    let to = line.to;
    if (!raw) while (from < to && /[ \t]/.test(doc.text[from]!)) from++;
    if (isHeading && !head.setext) {
      const range = doc.headRange(n)!;
      from = range.from;
      to = range.to;
    }
    let s = doc.text.slice(from, to);
    if (l === head.startLine) {
      if (isHeading) {
        prefix = head.level! + 1;
        s = '#'.repeat(head.level!) + ' ' + s;
      } else if (n.kind === 'item') {
        const box = /^\[([ xX])\][ \t]+/.exec(s);
        if (box) {
          // `[ ] ` is four characters, `TODO ` five: the caret after the box moves by one
          s = (box[1] === ' ' ? 'TODO ' : 'DONE ') + s.slice(box[0].length);
          from += box[0].length;
          prefix = 5;
        }
      }
    }
    const at = parts.reduce((k, p) => k + p.length + 1, 0);
    lines.push({ from, to, at: l === head.startLine ? at + prefix : at });
    parts.push(s);
  }
  return { text: parts.join('\n'), lines, prefix };
}

/** Adapts one spec example, or returns why it can't be. */
export function adapt(t: SpecTest): Adapted | string {
  if (!t.steps.length) return 'no actions';
  for (const s of t.steps) for (const a of s.actions) if (!actionSupported(a)) return `action ${a}`;
  const drawn = readDrawing(t.initial.buffer);
  // CR line endings: dropped, positions shifted with them
  const shiftCR = (p: number) => p - (drawn.text.slice(0, p).match(/\r/g)?.length ?? 0);
  const text = drawn.text.replace(/\r/g, '');
  const doc = Doc.parse(text, { placeholders: drawn.placeholders.map(shiftCR) });
  const nodes = doc.nodes.filter((n) => n.kind !== 'root');
  if (!nodes.length) return 'no nodes';
  const contents = nodes.map((n) => contentOf(doc, n));
  const blocks = nodes.map((n, i) => ({ depth: n.depth - 1, text: contents[i]!.text }));
  const locate = (p: number): { block: number; offset: number } | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const c = contents[i]!;
      for (const l of c.lines) {
        const line = doc.lineAt(l.from);
        if (p < line.from || p > line.to) continue;
        // in a marker, a checkbox or a heading's #s: the text start
        return { block: i, offset: l.at + Math.max(0, Math.min(p, l.to) - l.from) };
      }
    }
    return null;
  };
  let sel: Sel | null = null;
  const { anchor, head } = drawn.selection;
  const h = locate(shiftCR(head));
  if (!h) return 'a caret outside every node';
  if (anchor === head) sel = { block: h.block, anchor: h.offset, head: h.offset };
  else {
    const a = locate(shiftCR(anchor));
    if (!a || a.block !== h.block) return 'a selection across blocks';
    sel = { block: h.block, anchor: a.offset, head: h.offset };
  }
  return {
    source: `${t.file} › ${t.name}`,
    initial: { blocks, sel },
    clipboard: t.initial.clipboard !== undefined ? readText(t.initial.clipboard) : null,
    steps: t.steps.map((s) => [...s.actions]),
  };
}

// ------------------------------------------------------------------ reading drawn outlines

export class Unsupported extends Error {}

/**
 * Reads a drawn buffer that is a pure outline, or throws Unsupported with the reason. `exact` reads
 * buffers `draw` wrote: one space after a marker, and a continuation line's own leading whitespace
 * kept past the block's content column. Without it (hand-drawn spec buffers), padding and indentation
 * are read leniently, as a reader of Markdown would.
 */
export function readOutline(drawn: string, exact = false): Outline {
  const { text, selection } = readDrawing(drawn);
  const lines: { from: number; text: string }[] = [];
  let pos = 0;
  for (const line of text.split('\n')) {
    lines.push({ from: pos, text: line });
    pos += line.length + 1;
  }
  if (lines.length && lines[lines.length - 1]!.text === '') lines.pop();
  if (lines.some((l) => l.text.includes('\r'))) throw new Unsupported('CR line endings');
  const col = (s: string, n: number) => {
    let c = 0;
    for (let i = 0; i < n; i++) c = s[i] === '\t' ? c + 4 - (c % 4) : c + 1;
    return c;
  };
  type B = Block & { markerCol: number; contentCol: number; starts: { from: number; to: number; at: number; marker: number }[] };
  const blocks: B[] = [];
  const stack: number[] = [];
  for (const l of lines) {
    const last = blocks[blocks.length - 1];
    const indent = /^[ \t]*/.exec(l.text)![0];
    // an empty content line inside a block is drawn as indentation alone
    if (l.text.trim() === '') {
      if (!last || col(l.text, indent.length) < last.contentCol) throw new Unsupported('a blank line');
      const end = l.from + l.text.length;
      last.starts.push({ from: end, to: end, at: last.text.length + 1, marker: end });
      last.text += '\n';
      continue;
    }
    const m = (exact ? /^( *)(-)( |$)(.*)$/ : /^([ \t]*)([-*+]|\d+[.)])([ \t]+|$)(.*)$/).exec(l.text);
    if (m) {
      if (m[2] !== '-') throw new Unsupported(`a ${/\d/.test(m[2]!) ? 'numbered' : `"${m[2]}"`} marker`);
      if (/^\[[ xX]\]( |$)/.test(m[4]!)) throw new Unsupported('a task checkbox');
      // a quote inside an item is a container to ourus and plain text to Logseq: not comparable
      if (!exact && /^>/.test(m[4]!)) throw new Unsupported('a quote inside an item');
      const markerCol = col(l.text, m[1]!.length);
      const contentCol = col(l.text, m[1]!.length + 1 + m[3]!.length);
      while (stack.length && blocks[stack[stack.length - 1]!]!.markerCol >= markerCol) stack.pop();
      const textFrom = l.from + m[1]!.length + 1 + m[3]!.length;
      blocks.push({ depth: stack.length, text: m[4]!, markerCol, contentCol, starts: [{ from: textFrom, to: l.from + l.text.length, at: 0, marker: l.from + m[1]!.length }] });
      stack.push(blocks.length - 1);
    } else {
      if (!last || col(l.text, indent.length) < last.contentCol) throw new Unsupported('text outside an item');
      // exact: the content column is spaces, and whatever follows is the line's own text
      const cut = exact ? last.contentCol : indent.length;
      if (exact && l.text.slice(0, cut).trim() !== '') throw new Unsupported('a continuation line left of its block');
      if (!exact && /^>/.test(l.text.slice(cut))) throw new Unsupported('a quote inside an item');
      const from = l.from + cut;
      last.starts.push({ from, to: l.from + l.text.length, at: last.text.length + 1, marker: from });
      last.text += '\n' + l.text.slice(cut);
    }
  }
  if (!blocks.length) throw new Unsupported('no items');
  const locate = (p: number): { block: number; offset: number } => {
    for (let b = blocks.length - 1; b >= 0; b--) {
      for (const s of blocks[b]!.starts) {
        if (p < s.marker || p > s.to) continue;
        // a Logseq block has no marker text, so a caret inside the marker can't be placed there
        if (p < s.from) throw new Unsupported('a caret in a marker');
        return { block: b, offset: s.at + (p - s.from) };
      }
    }
    throw new Unsupported('a caret outside the items');
  };
  const hasCaret = /┃|«/.test(drawn);
  if (!hasCaret) return { blocks: blocks.map(({ depth, text }) => ({ depth, text })), sel: null };
  const h = locate(selection.head);
  const a = selection.anchor === selection.head ? h : locate(selection.anchor);
  if (a.block !== h.block) throw new Unsupported('a selection across blocks');
  return { blocks: blocks.map(({ depth, text }) => ({ depth, text })), sel: { block: h.block, anchor: a.offset, head: h.offset } };
}

/**
 * The spec's text is Markdown, a Logseq block's is content: a backslash escape at a line start
 * (`\#`, `\-`) or in an ordered marker (`1\.`) is encoding Logseq doesn't need. Removed, the
 * selection shifting with it.
 */
export function unescape(o: Outline): Outline {
  let shiftA = 0;
  let shiftH = 0;
  const blocks = o.blocks.map((b, i) => {
    let text = '';
    for (let k = 0; k < b.text.length; k++) {
      const atLineStart = k === 0 || b.text[k - 1] === '\n';
      const afterDigits = /(^|\n)\d{1,9}$/.test(b.text.slice(0, k)) && /[.)]/.test(b.text[k + 1] ?? '');
      if (b.text[k] === '\\' && ((atLineStart && /[!-/:-@[-`{-~]/.test(b.text[k + 1] ?? '')) || afterDigits)) {
        if (o.sel?.block === i && o.sel.anchor > k) shiftA++;
        if (o.sel?.block === i && o.sel.head > k) shiftH++;
        continue;
      }
      text += b.text[k];
    }
    return { depth: b.depth, text };
  });
  return { blocks, sel: o.sel ? { block: o.sel.block, anchor: o.sel.anchor - shiftA, head: o.sel.head - shiftH } : null };
}

// ------------------------------------------------------------------ drawing outlines as buffers

/** A continuation line that would read as a list item is escaped (`\-`, `1\.`). */
const escapeLine = (s: string): string => s.replace(/^([-*+])(?=[ \t]|$)/, '\\$1').replace(/^(\d{1,9})([.)])(?=[ \t]|$)/, '$1\\$2');

/** Draws an outline as a spec buffer: `-` items, two spaces per level, the caret or selection. */
export function draw(o: Outline): string {
  const out: string[] = [];
  o.blocks.forEach((b, i) => {
    // escape continuation lines that would read as items first, moving the selection with them
    let t = '';
    let sel = o.sel?.block === i ? { ...o.sel } : null;
    b.text.split('\n').forEach((line, k) => {
      const escaped = k === 0 ? line : escapeLine(line);
      if (k > 0) t += '\n';
      if (sel && escaped.length > line.length) {
        const at = t.length + (escaped.indexOf('\\'));
        if (sel.anchor > at) sel.anchor++;
        if (sel.head > at) sel.head++;
      }
      t += escaped;
    });
    if (sel) o = { ...o, sel };
    if (o.sel?.block === i) {
      const from = Math.min(o.sel.anchor, o.sel.head);
      const to = Math.max(o.sel.anchor, o.sel.head);
      t = from === to ? t.slice(0, from) + '┃' + t.slice(from) : t.slice(0, from) + (o.sel.head === from ? '┃«' : '«') + t.slice(from, to) + '»' + t.slice(to);
    }
    const ind = '  '.repeat(b.depth);
    t.split('\n').forEach((line, k) => {
      out.push(k === 0 ? `${ind}- ${line}` : `${ind}  ${line}`);
    });
  });
  return out.join('\n').replace(/\t/g, '→') + '\n';
}
