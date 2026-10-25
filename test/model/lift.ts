// Reads an ourus document as a model tree, and maps carets between document positions and
// (node, offset in the node's model text).

import { ProseText, type OutlineNode, type OurusDoc } from '../../src/doc/index.ts';
import type { Caret, MNode } from './model.ts';

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

export function lift(doc: OurusDoc): Lifted {
  const segs = new Map<MNode, Seg[]>();
  const byOutline = new Map<unknown, MNode>();
  const editable: MNode[] = [];
  const source = doc.text;

  const make = (n: OutlineNode): MNode => {
    const m: MNode = { kind: n.kind, text: '', children: [] };
    byOutline.set(n.persistentNode, m);
    const text = doc.textOf(n);
    if (n.head?.type === 'heading') {
      m.level = n.head.attrs.level!;
      if (n.head.attrs.setext) m.setext = true;
    }
    if (n.kind === 'atom') {
      m.block = n.block.type;
      m.text = text?.text ?? '';
    } else if (n.kind === 'item' && n.head && n.head.type !== 'paragraph') {
      m.block = n.head.type;
      m.text = (text?.text ?? '')
        .split('\n')
        .map((l) => l.trim())
        .join('\n');
    } else if (n.kind !== 'root') {
      if (n.kind === 'item') m.task = text instanceof ProseText && text.task ? (text.task.status === ' ' ? ' ' : 'x') : null;
      const s = segments(doc, n);
      m.text = s.map((g) => source.slice(g.from, g.to)).join('\n');
      segs.set(m, s);
      editable.push(m);
    }
    m.children = n.children.map(make);
    return m;
  };
  const root = make(doc.rootNode);

  return {
    root,
    editable,
    toCaret(pos, strict = false) {
      const at = doc.lineAt(pos);
      const n = pos <= at.to ? doc.nodeAtLine(at.index) : null;
      if (!n) return null;
      const m = byOutline.get(n.persistentNode)!;
      const s = segs.get(m);
      if (!s) return null;
      const line = at.index;
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

/** The ranges holding a node's own text, line by line, past its frame (a checkbox, `#`s, a callout's type), trimmed; a heading's title only. */
function segments(doc: OurusDoc, n: OutlineNode): Seg[] {
  const text = doc.textOf(n);
  if (!(text instanceof ProseText)) {
    // an item whose first block is a quote or a list: its text would go at the end of the marker line
    const line = doc.mdTree.line(n.startLine);
    return [{ line: line.index, from: line.to, to: line.to }];
  }
  const source = doc.text;
  const lines = text.text.split('\n');
  const underline = text.frame.find((p) => p.part === 'underline');
  const close = text.frame.find((p) => p.part === 'close');
  const below = text.frame.find((p) => p.part === 'below');
  const out: Seg[] = [];
  let at = 0;
  for (let k = 0; k < lines.length; k++) {
    const [start, end] = [at, at + lines[k]!.length];
    at = end + 1;
    // a setext underline's line, and a marker's line its text starts below, hold none of it
    if ((underline && start > underline.from) || (below && end < below.to)) continue;
    const to = Math.max(Math.min(end, close && close.from >= start ? close.from : end), Math.min(end, text.textStart(k)));
    let [f, t] = [doc.posOf(n, Math.min(text.textStart(k), to)), doc.posOf(n, to, -1)];
    while (f < t && isSpace(source.charCodeAt(f))) f++;
    while (t > f && isSpace(source.charCodeAt(t - 1))) t--;
    out.push({ line: doc.lineAt(f).index, from: f, to: t });
  }
  return out;
}
