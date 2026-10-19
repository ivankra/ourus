// Spec buffers as outlines of blocks, for apps whose documents are blocks rather than Markdown text
// (Logseq, Roam, Workflowy, Dynalist): a buffer is read with ourus's parser and every outline node
// becomes a block, at its depth, holding its own text. The expected buffers go through the same
// projection, so what an app did is compared with what ourus did, block for block.
//
// A block's text is canonical Markdown, whatever the app stores: an item's text without its marker,
// a task's checkbox as `[ ] `, a heading as `## title`, continuation lines joined by `\n`, an atom
// (code, table, HTML) as written. A driver maps it to the app's own form and back.
//
// What the projection had to drop or reinterpret is noted (`notes`): a paragraph standing in for a
// block, blank lines dropped, a numbered item made a plain block, ... so a report can tell an original
// outline example from an adapted one, and a driver can refuse what its app can't hold.

import type { Config } from '../../src/config.ts';
import { OutlineState, type OutlineNode } from '../../src/outline/index.ts';
import { readDrawing } from '../../test/drawing.ts';

export interface Block {
  depth: number;
  text: string;
  /**
   * A block outside every list (a paragraph, a heading, an atom), where the projection keeps free form
   * (`ProjectOptions.freeForm`); without it, an item, a block as block apps have them. Drawn `¶`.
   */
  free?: true;
}

/** A caret or selection inside one block's text. */
export interface Sel {
  block: number;
  anchor: number;
  head: number;
}

export interface Outline {
  blocks: Block[];
  /** The caret or text selection, when one block is being edited. */
  sel: Sel | null;
  /** Blocks selected whole (an app's block selection), by index. */
  selected?: number[];
}

/** Why a buffer can't be an outline of blocks. */
export class Unsupported extends Error {}

/** How a projection reads what an app's blocks may hold. */
export interface ProjectOptions {
  /**
   * The app numbers blocks (`Driver.ordered`): an ordered item is a numbered block, its text after
   * its number as a reader sees it (`1. x`), and a number that is text keeps its escape (`1\. x`).
   * Else an ordered item is a plain block, its number dropped (`numbered list`).
   */
  readonly ordered?: boolean;
  /**
   * The app tells a block outside every list from an item (`Driver.freeForm`): a paragraph, a heading
   * or an atom is a free block (`Block.free`), no adaptation, and so is a blank line next to one (the
   * boundary free form has); else every node is a block alike.
   */
  readonly freeForm?: boolean;
}

export interface Projection {
  outline: Outline;
  /** What the projection adapted: `paragraph`, `blank lines`, `numbered list`, ... */
  notes: Set<string>;
  /** Why the drawn caret has no place in a block (in a marker, on a blank line), when it hasn't. */
  caretLost?: string;
  /** The blocks that are headings owning a section (not an item whose text is a heading), by index. */
  sections: number[];
}

/**
 * Where one source line of a block's text went: source offsets [from, to] became text from `at`,
 * less the backslash of an escape at `cut`, if one was dropped.
 */
interface LineMap {
  line: number;
  from: number;
  to: number;
  at: number;
  cut?: number;
}

const ATOM_NOTES: Readonly<Record<string, string>> = {
  code_block: 'code block',
  html_block: 'html',
  thematic_break: 'thematic break',
  refdef: 'link reference definition',
  table: 'table',
  math_block: 'math',
  comment_block: 'comment',
  footnote_definition: 'footnote',
};

/**
 * Projects a drawn buffer onto blocks. Throws Unsupported for what has no block form at all: quotes
 * and callouts (containers to ourus, a block's text to block apps), frontmatter, a heading's closing
 * `#`s and indented code (markup to ourus, text a block app edits as text, or drops).
 */
export function project(drawn: string, flavor: Config['flavor'], options: ProjectOptions = {}): Projection {
  const notes = new Set<string>();
  const drawing = readDrawing(drawn);
  // CR line endings become LF; a CRLF's CR goes, and positions after it shift
  const shift: number[] = [];
  let text = '';
  for (let i = 0; i <= drawing.text.length; i++) {
    shift[i] = text.length;
    const c = drawing.text[i];
    if (c === '\r') {
      notes.add('CR line endings');
      if (drawing.text[i + 1] !== '\n') text += '\n';
    } else if (c !== undefined) text += c;
  }
  const at = (p: number): number => shift[p]!;
  const doc = OutlineState.parse(text, { placeholders: drawing.placeholders.map(at), config: { flavor } });
  if (doc.syntaxTree.root.children.some((b) => b.type === 'frontmatter')) throw new Unsupported('frontmatter');

  const nodes = doc.nodes.filter((n) => n.kind !== 'root');
  if (!nodes.length) throw new Unsupported('no nodes');
  const blocks: Block[] = [];
  const maps: LineMap[][] = [];
  const sections: number[] = [];
  for (const node of nodes) {
    const { text, lines } = blockText(doc, node, notes, options.ordered ?? false, options.freeForm ?? false);
    if (node.kind === 'heading') sections.push(blocks.length);
    blocks.push({ depth: node.depth - 1, text, ...(options.freeForm && node.kind !== 'item' && { free: true as const }) });
    maps.push(lines);
  }
  doc.lines.forEach((line, i) => {
    if (doc.nodeAtLine(i) || !line.blank) return;
    if (options.freeForm) {
      // the nodes on either side: a blank line next to a free block is free form's own boundary
      let before = i - 1;
      while (before >= 0 && !doc.nodeAtLine(before)) before--;
      let after = i + 1;
      while (after < doc.lines.length && !doc.nodeAtLine(after)) after++;
      const near = [before >= 0 ? doc.nodeAtLine(before) : null, after < doc.lines.length ? doc.nodeAtLine(after) : null];
      if (near.some((n) => n && n.kind !== 'item')) return;
    }
    notes.add('blank lines');
  });

  const locate = (p: number): { block: number; offset: number } | string => {
    const line = doc.lineAt(p);
    if (p > line.to) return 'a caret after the last line';
    for (let i = 0; i < maps.length; i++) {
      for (const m of maps[i]!) {
        if (m.line !== line.index) continue;
        if (p < m.from) return 'a caret in a marker';
        return { block: i, offset: m.at + (p - m.from) - (m.cut !== undefined && p > m.cut ? 1 : 0) };
      }
    }
    return 'a caret on a blank line';
  };
  const hasCaret = /┃|«/.test(drawn);
  if (!hasCaret) return { outline: { blocks, sel: null }, notes, sections };
  const { anchor, head } = drawing.selection;
  const h = locate(at(head));
  const a = anchor === head ? h : locate(at(anchor));
  if (typeof h === 'string') return { outline: { blocks, sel: null }, notes, caretLost: h, sections };
  if (typeof a === 'string') return { outline: { blocks, sel: null }, notes, caretLost: a, sections };
  if (a.block !== h.block) return { outline: { blocks, sel: null }, notes, caretLost: 'a selection across blocks', sections };
  return { outline: { blocks, sel: { block: h.block, anchor: a.offset, head: h.offset } }, notes, sections };
}

/** A node's own text as a block holds it, and where each of its lines came from. */
function blockText(doc: OutlineState, node: OutlineNode, notes: Set<string>, ordered: boolean, freeForm: boolean): { text: string; lines: LineMap[] } {
  if (node.kind === 'quote') throw new Unsupported(doc.syntaxTree.line(node.startLine) && /^\s*>\s*\[!/.test(doc.text.slice(doc.line(node.startLine).from, doc.line(node.startLine).to)) ? 'a callout' : 'a quote');
  const lines: LineMap[] = [];
  const parts: string[] = [];
  const add = (line: number, from: number, to: number, prefix = '', unescape = false): void => {
    const at = parts.reduce((k, p) => k + p.length + 1, 0) + prefix.length;
    let s = doc.text.slice(from, to);
    // a Markdown escape at a line's start (`\#`, `\-`, `1\.`) only keeps the line from reading as
    // markup in the file; a block's text needs none, but where blocks are numbered, `1\.` starting a
    // block is text a numbered block's `1. ` isn't, and stays
    const m = !unescape ? null : ordered && !parts.length ? /^\\(?=[!-/:-@[-`{-~])/.exec(s) : /^\\(?=[!-/:-@[-`{-~])|^\d{1,9}\\(?=[.)])/.exec(s);
    if (m) {
      notes.add('escape');
      const cut = m[0].length - 1;
      s = s.slice(0, cut) + s.slice(cut + 1);
      lines.push({ line, from, to, at, cut: from + cut });
    } else lines.push({ line, from, to, at });
    parts.push(prefix + s);
  };
  const skipSpaces = (from: number, to: number): number => {
    while (from < to && (doc.text[from] === ' ' || doc.text[from] === '\t')) from++;
    return from;
  };

  // an ordered item, where blocks are numbered: its number as a reader sees it (the list's start,
  // counted on), canonical `1. ` before its text
  const listBlock = node.kind === 'item' ? node.block.parent : null;
  const number = ordered && listBlock?.list?.type === 'ordered' ? `${(listBlock.list.start ?? 1) + listBlock.children.indexOf(node.block)}. ` : '';
  if (node.kind === 'item') {
    const list = node.block.parent?.list ?? node.block.list;
    if (list?.type === 'ordered' && !ordered) notes.add('numbered list');
    else if (list?.bulletChar && list.bulletChar !== '-') notes.add(`bullet ${list.bulletChar}`);
    if (node.block.task) notes.add('task');
  } else if (node.kind === 'paragraph') {
    if (!freeForm) notes.add('paragraph');
  } else if (node.kind === 'heading') {
    if (!freeForm) notes.add('heading');
  } else if (node.kind === 'atom') notes.add(ATOM_NOTES[node.block.type] ?? node.block.type);

  const head = node.kind === 'atom' ? node.block : node.head;
  // markup no block has a form for: a block would hold it as text, and edit it so
  const title = head?.type === 'heading' && !head.setext ? doc.headRange(node) : null;
  if (title && /^[ \t]*#/.test(doc.text.slice(title.to, doc.line(head!.startLine).to))) throw new Unsupported("a heading's closing #s");
  if (head?.type === 'code_block' && !head.fenced) throw new Unsupported('indented code');
  if (!head && node.kind === 'item' && node.block.children[0]?.startLine === node.block.startLine) {
    // an item whose first block is a list (`- - a`): it has no text, and the rest of its marker's line
    // is the inner item's, a child block
    notes.add("a list as an item's first block");
    return { text: number, lines };
  }
  if (!head) {
    // an empty item, or one holding only a task's checkbox
    const line = doc.line(node.block.startLine);
    const task = node.block.task;
    const from = task ? line.from + task.start : Math.min(doc.markerTo(node.block) + 1, line.to);
    add(line.index, from, line.to, number);
    return { text: parts.join(''), lines };
  }
  if (head.type === 'heading' && head.setext) {
    notes.add('setext heading');
    for (let l = head.startLine; l < head.endLine; l++) {
      const line = doc.line(l);
      add(l, skipSpaces(line.contentFrom, line.to), line.to, l === head.startLine ? number + '#'.repeat(head.level!) + ' ' : '', true);
    }
    return { text: parts.join('\n'), lines };
  }
  if (node.kind === 'item' && head.type === 'heading') notes.add('heading');
  if (node.kind === 'item' && ATOM_NOTES[head.type]) notes.add(ATOM_NOTES[head.type]!);
  // paragraphs and headings lose their lines' leading whitespace; atoms keep theirs
  const trim = head.type === 'paragraph' || head.type === 'heading';
  for (let l = head.startLine; l <= head.endLine; l++) {
    const line = doc.line(l);
    add(l, trim ? skipSpaces(line.contentFrom, line.to) : line.contentFrom, line.to, l === head.startLine ? number : '', trim);
  }
  return { text: parts.join('\n'), lines };
}

// ------------------------------------------------------------------ drawing and comparing

/** A continuation line that would read as a list item or heading is escaped (`\-`, `1\.`, `\#`). */
const escapeLine = (s: string): string =>
  s
    .replace(/^([-*+])(?=[ \t]|$)/, '\\$1')
    .replace(/^(\d{1,9})([.)])(?=[ \t]|$)/, '$1\\$2')
    .replace(/^(#{1,6})(?=[ \t]|$)/, '\\$1');

/**
 * Draws an outline as a spec buffer: `-` items (`¶` a free block), the caret or selection. Where blocks
 * are numbered (`ordered`, `ProjectOptions.ordered`), a numbered block has its number in its bullet's
 * place (`1. a`), as the apps show it. A block's later lines and its children start where its text does:
 * two spaces a level under bullets, the number's width under a number.
 */
export function draw(o: Outline, options: Pick<ProjectOptions, 'ordered'> = {}): string {
  const out: string[] = [];
  /** Where the text of the last block at each depth starts: its children's indentation. */
  const cols: number[] = [];
  o.blocks.forEach((b, i) => {
    let sel = o.sel?.block === i ? { ...o.sel } : null;
    let t = '';
    b.text.split('\n').forEach((line, k) => {
      if (k > 0) t += '\n';
      const escaped = k === 0 ? line : escapeLine(line);
      // a backslash added before the selection moves it along
      if (sel && escaped.length > line.length) {
        const at = t.length + escaped.indexOf('\\');
        if (sel.anchor > at) sel.anchor++;
        if (sel.head > at) sel.head++;
      }
      t += escaped;
    });
    if (sel) {
      const from = Math.min(sel.anchor, sel.head);
      const to = Math.max(sel.anchor, sel.head);
      t = from === to ? t.slice(0, from) + '┃' + t.slice(from) : t.slice(0, from) + (sel.head === from ? '┃«' : '«') + t.slice(from, to) + '»' + t.slice(to);
    }
    const mark = o.selected?.includes(i) ? '▮ ' : '';
    // a caret or selection inside the number leaves it text, under a bullet
    const number = options.ordered && !b.free ? /^\d{1,9}\. /.exec(t)?.[0] : undefined;
    if (number) t = t.slice(number.length);
    const marker = number ? number.slice(0, -1) : b.free ? '¶' : '-';
    const at = b.depth ? (cols[b.depth - 1] ?? 2 * b.depth) : 0;
    cols.length = b.depth;
    cols[b.depth] = at + marker.length + 1;
    t.split('\n').forEach((line, k) => out.push(k === 0 ? `${' '.repeat(at)}${marker} ${mark}${line}` : `${' '.repeat(cols[b.depth]!)}${line}`));
  });
  return out.join('\n').replace(/\t/g, '→') + '\n';
}

/**
 * An outline as an app in free form holds it, as Markdown has it: what a free block owns in ourus's
 * outline (a heading its section, a paragraph the list right after it) beside it, not its child
 * (BlockNote's blocks, SiYuan's). `ownBlocks` is the way back.
 */
export function liftOwned(blocks: readonly Block[]): Block[] {
  const path: Block[] = [];
  return blocks.map((b) => {
    path.length = b.depth;
    const up = path.filter((p) => p.free).length;
    path.push(b);
    return up ? { ...b, depth: b.depth - up } : b;
  });
}

/**
 * An app's free-form blocks nested as ourus's outline is (`liftOwned`'s inverse), among each block's
 * siblings: a heading takes what follows it up to a heading of its level or above, a free block that
 * `ownsList` says owns one (a paragraph) the items right after it. A block's own children (an app may
 * nest any block: BlockNote's Tab nests a paragraph) stay its children.
 */
export function ownBlocks(blocks: readonly Block[], ownsList: (b: Block, i: number) => boolean): Block[] {
  const scope: { headings: number[]; paragraph: boolean }[] = [];
  const depthOf: number[] = [];
  return blocks.map((b, i) => {
    scope.length = b.depth + 1;
    depthOf.length = b.depth;
    const sc = (scope[b.depth] ??= { headings: [], paragraph: false });
    let shift: number;
    if (b.free) {
      const level = /^(#{1,6}) /.exec(b.text)?.[1]!.length ?? 0;
      if (level) while (sc.headings.length && sc.headings.at(-1)! >= level) sc.headings.pop();
      shift = sc.headings.length;
      if (level) sc.headings.push(level);
      sc.paragraph = !level && ownsList(b, i);
    } else shift = sc.headings.length + (sc.paragraph ? 1 : 0);
    const depth = (b.depth ? depthOf[b.depth - 1]! + 1 : 0) + shift;
    depthOf[b.depth] = depth;
    return depth === b.depth ? b : { ...b, depth };
  });
}

/**
 * An outline whose blocks hold Markdown source (Logseq's, Tine's) as the projection has it: an escape
 * at the start of a block's later line (`\. y`, `\- y`) taken off, as a block's text needs none there
 * (drawing puts back the ones a buffer needs), and a caret after it moved back with it.
 */
export function unescapeLaterLines(o: Outline): Outline {
  const sel = o.sel && { ...o.sel };
  const blocks = o.blocks.map((b, i) => {
    let at = 0;
    const text = b.text
      .split('\n')
      .map((line, k) => {
        const escaped = k > 0 && /^\\(?=[!-/:-@[-`{-~])/.test(line);
        if (escaped && sel?.block === i) {
          if (sel.anchor > at) sel.anchor--;
          if (sel.head > at) sel.head--;
        }
        const kept = escaped ? line.slice(1) : line;
        at += kept.length + 1;
        return kept;
      })
      .join('\n');
    return text === b.text ? b : { ...b, text };
  });
  return { ...o, blocks, sel };
}

/**
 * Reads back an outline `draw` drew (a run's data keeps the app's states drawn), or null where the
 * drawing is no outline's. Where blocks are numbered (`ordered`), a number in a bullet's place is a
 * numbered block, and a drawing from before numbers took the bullet's place (`- 1. a`) reads too;
 * elsewhere a line starting with a number is no block's.
 */
export function readOutline(drawn: string, options: Pick<ProjectOptions, 'ordered'> = {}): Outline | null {
  const blocks: Block[] = [];
  const raw: string[][] = [];
  const selected: number[] = [];
  /** Where the text of the last block at each depth starts, as `draw` indents. */
  const cols: number[] = [];
  // no blocks at all draw as one empty line
  for (const line of drawn === '\n' ? [] : drawn.replace(/\n$/, '').replace(/→/g, '\t').split('\n')) {
    const item = /^( *)(?:([-¶])|(\d{1,9}\.)) (▮ )?(.*)$/.exec(line);
    const spaces = item?.[1]!.length ?? 0;
    // a block's depth: where blocks are numbered, it starts where its parent's text does; else two
    // spaces a level
    const depth = !item || (item[3] && !options.ordered) ? -1 : !spaces ? 0 : options.ordered ? (cols.includes(spaces) ? cols.indexOf(spaces) + 1 : -1) : spaces % 2 ? -1 : spaces / 2;
    if (item && depth >= 0) {
      if (item[4]) selected.push(blocks.length);
      blocks.push({ depth, text: '', ...(item[2] === '¶' && { free: true as const }) });
      raw.push([item[3] ? `${item[3]} ${item[5]!}` : item[5]!]);
      cols.length = depth;
      cols[depth] = spaces + (item[2] ?? item[3]!).length + 1;
      continue;
    }
    const ind = blocks.length ? ' '.repeat(cols[blocks.at(-1)!.depth]!) : null;
    if (ind === null || !line.startsWith(ind)) return null;
    raw.at(-1)!.push(line.slice(ind.length));
  }
  let sel: Sel | null = null;
  raw.forEach((lines, i) => {
    // the caret or selection out first, then the backslashes `draw` escaped continuation lines with
    let t = lines.join('\n');
    const caret = t.indexOf('┃');
    const open = t.indexOf('«');
    if (caret >= 0 || open >= 0) {
      const marks = t.replace(/┃«/, '«');
      const from = marks.indexOf('«') >= 0 ? marks.indexOf('«') : marks.indexOf('┃');
      const to = marks.indexOf('»') >= 0 ? marks.indexOf('»') - 1 : from;
      sel = { block: i, anchor: caret >= 0 && open >= 0 ? to : from, head: caret >= 0 ? from : to };
      t = t.replace(/[┃«»]/g, '');
    }
    let at = 0;
    t = t
      .split('\n')
      .map((line, k) => {
        const unescaped = k === 0 ? line : line.replace(/^\\([-*+](?=[ \t]|$))/, '$1').replace(/^(\d{1,9})\\([.)](?=[ \t]|$))/, '$1$2').replace(/^\\(#{1,6}(?=[ \t]|$))/, '$1');
        if (unescaped.length < line.length && sel?.block === i) {
          const cut = at + line.indexOf('\\');
          if (sel.anchor > cut) sel.anchor--;
          if (sel.head > cut) sel.head--;
        }
        at += unescaped.length + 1;
        return unescaped;
      })
      .join('\n');
    blocks[i]!.text = t;
  });
  const o: Outline = { blocks, sel, ...(selected.length && { selected }) };
  return draw(o) === drawn || (options.ordered && draw(o, options) === drawn) ? o : null;
}

export type Verdict = 'agree' | 'whitespace' | 'caret' | 'disagree';

/**
 * Text compared without the spaces next to line breaks, at the ends and right after a block's
 * canonical prefix (`10. `, `[ ] `, `# `), where editors differ in trimming.
 */
const loose = (b: Block): string =>
  `${b.depth}${b.free ? '¶' : ''}:${b.text
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/^((?:\d{1,9}\. )?(?:\[[ xX]\] )?(?:#{1,6} )?)[ \t]+/, '$1')
    .trim()}`;

/** How `got` compares with `want`; a selection is compared only where `want` has one. */
export function compareOutlines(want: Outline, got: Outline, sections: readonly number[] = []): Verdict {
  [want, got] = [sectioned(want, sections), sectioned(got, sections)];
  const same = want.blocks.length === got.blocks.length && want.blocks.every((b, i) => b.depth === got.blocks[i]!.depth && !b.free === !got.blocks[i]!.free && b.text === got.blocks[i]!.text);
  if (!same) {
    const close = want.blocks.length === got.blocks.length && want.blocks.every((b, i) => loose(b) === loose(got.blocks[i]!));
    return close ? 'whitespace' : 'disagree';
  }
  if (want.sel && (JSON.stringify(want.sel) !== JSON.stringify(got.sel) || got.selected?.length)) return 'caret';
  return 'agree';
}

/**
 * An outline with each heading's section nested under it: the blocks after a heading at its depth,
 * up to a heading of its level or above, go under it, with their children. Markdown reads what
 * follows a heading as its section, so a block an app puts beside a heading, where the projection
 * has it under it, is the same text; compared so, they agree. `sections` says which blocks are
 * headings that own a section (a projection's, by index): an item whose text is a heading owns
 * none, and the blocks after it are not its. Blocks keep their order, so a selection's index holds.
 */
export function sectioned(o: Outline, sections: readonly number[]): Outline {
  type Node = { block: Block; index: number; children: Node[] };
  const owners = new Set(sections);
  const level = (n: Node): number => (owners.has(n.index) ? (/^(#{1,6})(?: |$)/.exec(n.block.text)?.[1]!.length ?? 0) : 0);
  const root: Node[] = [];
  const path: Node[] = [];
  for (const [index, block] of o.blocks.entries()) {
    const node: Node = { block, index, children: [] };
    path.length = Math.min(path.length, block.depth);
    (path.at(-1)?.children ?? root).push(node);
    path.push(node);
  }
  // in a container (the root, an item, any block that isn't a section heading), what Markdown has:
  // its blocks in order, a heading's children only what follows it; then each heading takes what
  // follows it up to a heading of its level or above, so the nesting is the levels' alone (a heading
  // an app nests in a section of its level or below is that section's sibling)
  const flat = (list: Node[]): Node[] => list.flatMap((n) => (level(n) ? [{ ...n, children: [] }, ...flat(n.children)] : [{ ...n, children: arrange(n.children) }]));
  const arrange = (list: Node[]): Node[] => {
    const out: Node[] = [];
    const open: Node[] = [];
    for (const n of flat(list)) {
      while (open.length && level(n) && level(open.at(-1)!) >= level(n)) open.pop();
      (open.at(-1)?.children ?? out).push(n);
      if (level(n)) open.push(n);
    }
    return out;
  };
  const blocks: Block[] = [];
  const flatten = (list: Node[], depth: number): void => {
    for (const n of list) {
      blocks.push({ ...n.block, depth });
      flatten(n.children, depth + 1);
    }
  };
  flatten(arrange(root), 0);
  return { ...o, blocks };
}

/** Whether two outlines are the same, selection included. */
export const sameOutline = (a: Outline, b: Outline): boolean => JSON.stringify([a.blocks, a.sel, a.selected ?? []]) === JSON.stringify([b.blocks, b.sel, b.selected ?? []]);
