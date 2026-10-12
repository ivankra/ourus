// Reads an ourus OutlineDoc as a model tree, and maps carets between document positions and
// (node, offset in the node's model text).

import type { OutlineDoc } from '../../src/doc.ts';
import type { OutlineNode } from '../../src/outline.ts';
import type { Caret, MNode } from './model.ts';

const reBox = /^\[([ xX])\](?:[ \t]+|$)/;
const isSpace = (c: number) => c === 32 || c === 9;

interface Seg {
  line: number;
  from: number;
  to: number;
}

export interface Lifted {
  root: MNode;
  /** model nodes a caret can be in: not atoms, not items whose head is another block */
  editable: MNode[];
  toCaret(pos: number, strict?: boolean): Caret | null;
  toPos(caret: Caret): number;
}

export function lift(doc: OutlineDoc): Lifted {
  const segs = new Map<MNode, Seg[]>();
  const byOutline = new Map<OutlineNode, MNode>();
  const editable: MNode[] = [];

  const make = (n: OutlineNode): MNode => {
    const m: MNode = { kind: n.kind, text: '', children: [] };
    byOutline.set(n, m);
    if (n.head?.type === 'heading') {
      m.level = n.head.level!;
      if (n.head.setext) m.setext = true;
    }
    if (n.kind === 'atom') {
      m.block = n.block.type;
      m.text = doc.headLines(n).join('\n');
    } else if (n.kind === 'item' && n.head && n.head.type !== 'paragraph') {
      m.block = n.head.type;
      m.text = doc.headLines(n).map((l) => l.trim()).join('\n');
    } else if (n.kind !== 'root') {
      const s = segments(doc, n);
      if (n.kind === 'item') {
        m.task = null;
        const first = s[0];
        if (first && n.head) {
          const box = reBox.exec(doc.text.slice(first.from, first.to));
          if (box) {
            m.task = box[1] === ' ' ? ' ' : 'x';
            first.from += box[0].length;
          }
        }
      }
      m.text = s.map((g) => doc.text.slice(g.from, g.to)).join('\n');
      segs.set(m, s);
      editable.push(m);
    }
    m.children = n.children.map(make);
    return m;
  };
  const root = make(doc.outline);

  return {
    root,
    editable,
    toCaret(pos, strict = false) {
      const n = doc.nodeAt(pos);
      if (!n) return null;
      const m = byOutline.get(n)!;
      const s = segs.get(m);
      if (!s) return null;
      const line = doc.lineAt(pos).index;
      let base = 0;
      for (const g of s) {
        if (g.line === line) {
          // a caret in whitespace or chrome the model has no offset for
          if (strict && (pos < g.from || pos > g.to)) return null;
          return { node: m, offset: base + Math.max(0, Math.min(pos, g.to) - g.from) };
        }
        base += g.to - g.from + 1;
      }
      return { node: m, offset: m.text.length };
    },
    toPos({ node, offset }) {
      const s = segs.get(node)!;
      let base = 0;
      for (const g of s) {
        if (offset <= base + (g.to - g.from)) return g.from + (offset - base);
        base += g.to - g.from + 1;
      }
      const last = s[s.length - 1]!;
      return last.to;
    },
  };
}

/** The ranges holding a node's own text, line by line, trimmed; a heading's title only. */
function segments(doc: OutlineDoc, n: OutlineNode): Seg[] {
  if (!n.head) {
    // an empty item: its text would go at the end of the marker line
    const line = doc.lines[n.startLine]!;
    return [{ line: line.index, from: line.to, to: line.to }];
  }
  const out: Seg[] = [];
  const last = n.head.type === 'heading' && n.head.setext ? n.head.endLine - 1 : n.head.endLine;
  for (let l = n.head.startLine; l <= last; l++) {
    const line = doc.lines[l]!;
    let from = line.contentFrom;
    let to = line.to;
    while (from < to && isSpace(doc.text.charCodeAt(from))) from++;
    while (to > from && isSpace(doc.text.charCodeAt(to - 1))) to--;
    out.push({ line: l, from, to });
  }
  if (n.head.type === 'heading' && !n.head.setext) {
    const r = doc.headRange(n)!;
    out[0] = { line: n.head.startLine, from: r.from, to: Math.max(r.from, r.to) };
    // a title with trailing spaces before closing #s
    while (out[0].to > out[0].from && isSpace(doc.text.charCodeAt(out[0].to - 1))) out[0].to--;
  }
  return out;
}
