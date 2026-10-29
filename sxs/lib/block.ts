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
import { ProseText, OurusDoc, type OutlineNode } from '../../src/doc/index.ts';
import { textEnd, textStart } from '../../src/doc/index.ts';
import { docOf, nodesOf, readDrawing } from '../../test/drawing.ts';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { drawView, splitView, type RowView } from './view.ts';

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
  /** Its folds and zoom, by block (`view.ts`), where the case has a view. */
  view?: RowView;
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
  /**
   * The app's block holds paragraphs (`Driver.paragraphsInBlock`): an item's paragraphs right after
   * its text are its block's text, after their blank lines (`- foo⏎⏎  bar` is the block `foo⏎⏎bar`,
   * as Logseq holds it), what they own its children; else each is a block of its own, its child.
   */
  readonly paragraphsInBlock?: boolean;
  /**
   * The case's options, where they decide how ourus reads the text: with `enterSplitSpace: start` an
   * item's padding past the item above's is its text, as the app's block starts with the spaces.
   */
  readonly config?: Partial<Config>;
  /**
   * How the app's block holds a quote (`Driver.behaves.quotes`): `atom`, any quote, a callout too, its
   * lines as written (Logseq's block text); else only a quote of one paragraph, `> ` before its text.
   */
  readonly quotes?: Config['quotes'];
  /** What a list after a block is the children of in the app's blocks (`Driver.behaves.listParent`): read so. */
  readonly listParent?: Config['listParent'];
  /**
   * The app holds a selection of whole blocks (`Driver.selectsBlocks`): a drawn selection from one
   * block's text start to another's text end is those blocks selected (`Outline.selected`), the
   * topmost the selection touches, as ourus's structural commands take them; else it has no block form.
   */
  readonly blockSelection?: boolean;
}

export interface Projection {
  outline: Outline;
  /** What the projection adapted: `paragraph`, `blank lines`, `numbered list`, ... */
  notes: Set<string>;
  /** Why the drawn caret has no place in a block (in a marker, on a blank line), when it hasn't. */
  caretLost?: string;
  /** The blocks that are headings owning a section (not an item whose text is a heading), by index. */
  sections: number[];
  /** The block each node became, by the line the node starts on (a drop's rows, `drag.ts`). */
  rows?: ReadonlyMap<number, number>;
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
  /** Where a backslash the block's text leaves out was, in the document. */
  cuts?: readonly number[];
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
  // (quotes read as containers, whatever ourus's `quotes`: which of them a block holds, and how, is
  // the projection's, `quoted`)
  // and a list after a block under it or beside it as the app's blocks have it (`listParent`)
  const doc = docOf(text, drawing.placeholders.map(at), { ...options.config, flavor, quotes: 'container', ...(options.listParent && { listParent: options.listParent }) });
  if (doc.mdTree.root.children.some((b) => b.type === 'frontmatter')) throw new Unsupported('frontmatter');

  const nodes = nodesOf(doc);
  // an empty document is an app's empty page: one empty block, the caret in it
  if (!nodes.length && text.trim() === '' && /┃/.test(drawn)) {
    notes.add('empty document');
    return { outline: { blocks: [{ depth: 0, text: '', ...(options.freeForm && { free: true as const }) }], sel: { block: 0, anchor: 0, head: 0 } }, notes, sections: [] };
  }
  if (!nodes.length) throw new Unsupported('no nodes');
  const blocks: Block[] = [];
  const maps: LineMap[][] = [];
  const sections: number[] = [];
  const blockOf = new Map<number, number>();
  // paragraphs that are their item's block's text (`paragraphsInBlock`), the blank lines before them
  // too; what is under one is a level up
  const merged = new Set<number>();
  const inBlock = new Set<number>();
  const lift = new Map<number, number>();
  /** The paragraphs that are a quote's whole text (`quoted`), in its block. */
  const quotedParagraphs = new Set<number>();
  for (const node of nodes) {
    if (quotedParagraphs.has(node.id)) continue;
    const parent = node.parent;
    const up = parent ? (lift.get(parent.id) ?? 0) + (merged.has(parent.id) ? 1 : 0) : 0;
    lift.set(node.id, up);
    const prev = parent?.children[node.index - 1];
    const atom = options.quotes === 'atom';
    // (under `atom` a callout is one too, its `[!type]` the block's text, as an outliner holds it)
    const quote = atom ? (node.kind === 'quote' ? node : null) : quoted(doc, node);
    const bare = (n: OutlineNode): boolean => !n.children.length || (atom ? n.kind === 'quote' : !!quoted(doc, n));
    const into = options.paragraphsInBlock && (node.kind === 'paragraph' || !!quote) && parent?.kind === 'item' && blockOf.has(parent.id) && (!prev || (merged.has(prev.id) && bare(prev)));
    const own = new Set<string>();
    let { text, lines } = quote && atom ? asWritten(doc, node) : blockText(doc, quote ?? node, own, options.ordered ?? false, options.freeForm ?? false);
    // (an item whose first block is a quote the app holds as its text, `- > a⏎  > - b`: no list there)
    const first = node.children[0];
    if (atom && node.kind === 'item' && first?.kind === 'quote' && first.startLine === node.startLine) own.delete("list as an item's first block");
    if (quote) {
      // a quote of one paragraph is a block's text, `> ` before the paragraph's, as a heading's is
      // `# ` before its title; where the app's block holds any quote (`quotes: atom`), its lines as written
      own.delete('paragraph');
      own.add('quote');
      if (!atom) {
        text = `> ${text}`;
        lines = lines.map((m) => ({ ...m, at: m.at + 2 }));
      }
      for (const d of atom ? descendants(node) : [quote]) quotedParagraphs.add(d.id);
      // an item whose first block it is, on its marker's line (`- > q`), has no text but it
      const host = parent?.kind === 'item' && !parent.head && node.index === 0 && node.startLine === parent.startLine ? blockOf.get(parent.id) : undefined;
      if (host !== undefined) {
        for (const n of own) notes.add(n);
        const block = blocks[host]!;
        maps[host]!.push(...lines.map((m) => ({ ...m, at: m.at + block.text.length })));
        blocks[host] = { ...block, text: block.text + text };
        blockOf.set(node.id, host);
        continue;
      }
    }
    // (a paragraph in a block's text is none adapted)
    for (const n of own) if (!into || n !== 'paragraph') notes.add(n);
    if (into) {
      const i = blockOf.get(parent.id)!;
      const block = blocks[i]!;
      let joined = block.text;
      for (let l = (prev ?? parent).textLastLine + 1; l < node.textFirstLine; l++) {
        const line = doc.mdTree.line(l);
        joined += '\n';
        maps[i]!.push({ line: l, from: line.to, to: line.to, at: joined.length });
        inBlock.add(l);
      }
      joined += '\n';
      maps[i]!.push(...lines.map((m) => ({ ...m, at: m.at + joined.length })));
      blocks[i] = { ...block, text: joined + text };
      merged.add(node.id);
      blockOf.set(node.id, i);
      continue;
    }
    if (node.kind === 'heading') sections.push(blocks.length);
    blockOf.set(node.id, blocks.length);
    blocks.push({ depth: node.depth - 1 - up, text, ...(options.freeForm && node.kind !== 'item' && { free: true as const }) });
    maps.push(lines);
  }
  // the caret on a blank line at its node's text column, right after its text (where Shift-Enter
  // leaves it at a text's end): in a block, that text's next line, empty, the caret on it
  const { anchor, head } = drawing.selection;
  let held: { block: number; offset: number; lines: Set<number> } | null = null;
  if (/┃/.test(drawn) && anchor === head) {
    const p = at(head);
    const where = doc.locate(p);
    const i = where.zone === 'gap' && !where.owner.children.length && doc.atTextColumn(p, where.owner) ? blockOf.get(where.owner.id) : undefined;
    const line = doc.lineAt(p).index;
    // (but the gap's last line where a paragraph is on either side of it: the blank line setting them apart)
    const next = where.zone === 'gap' ? where.owner.afterSubtree : null;
    const apart = where.zone === 'gap' && !!next && line === where.owner.textLastLine + where.owner.gap && (where.owner.kind === 'paragraph' || next.kind === 'paragraph');
    if (where.zone === 'gap' && i !== undefined && !apart) {
      const lines = new Set<number>();
      for (let k = where.owner.textLastLine + 1; k <= line; k++) lines.add(k);
      blocks[i] = { ...blocks[i]!, text: blocks[i]!.text + '\n'.repeat(lines.size) };
      held = { block: i, offset: blocks[i]!.text.length, lines };
    }
  }
  for (let i = 0; i < doc.lineCount; i++) {
    if (doc.nodeAtLine(i) || !doc.isEmptyLine(i) || held?.lines.has(i) || inBlock.has(i)) continue;
    if (options.freeForm) {
      // the nodes on either side: a blank line next to a free block is free form's own boundary
      let before = i - 1;
      while (before >= 0 && !doc.nodeAtLine(before)) before--;
      let after = i + 1;
      while (after < doc.lineCount && !doc.nodeAtLine(after)) after++;
      const near = [before >= 0 ? doc.nodeAtLine(before) : null, after < doc.lineCount ? doc.nodeAtLine(after) : null];
      if (near.some((n) => n && n.kind !== 'item')) continue;
    }
    notes.add('blank lines');
  }

  const locate = (p: number): { block: number; offset: number } | string => {
    const line = doc.lineAt(p);
    if (held?.lines.has(line.index)) return { block: held.block, offset: held.offset };
    if (p > line.to) return 'caret after the last line';
    for (let i = 0; i < maps.length; i++) {
      for (const m of maps[i]!) {
        if (m.line !== line.index) continue;
        if (p < m.from) return 'caret in a marker';
        return { block: i, offset: m.at + (p - m.from) - (m.cuts ?? []).filter((c) => p > c).length };
      }
    }
    return 'caret on a blank line';
  };
  const hasCaret = /┃|«/.test(drawn);
  const rows = new Map<number, number>();
  for (const node of nodes) if (blockOf.has(node.id) && !rows.has(node.startLine)) rows.set(node.startLine, blockOf.get(node.id)!);
  if (!hasCaret) return { outline: { blocks, sel: null }, notes, sections, rows };
  // a subtree selection (`««…»»`): the nodes its span touches selected whole (a selection drawn
  // `«…»`, whole lines or not, is the text drawn)
  if (options.blockSelection && drawing.subtrees) {
    const roots = doc.touchedNodes({ anchor: at(anchor), head: at(head) });
    const selected = [...new Set(roots.flatMap((n) => (blockOf.has(n.id) ? [blockOf.get(n.id)!] : [])))].sort((x, y) => x - y);
    return { outline: { blocks, sel: null, selected }, notes, sections, rows };
  }
  const h = locate(at(head));
  const a = anchor === head ? h : locate(at(anchor));
  if (typeof h === 'string') return { outline: { blocks, sel: null }, notes, caretLost: h, sections, rows };
  if (typeof a === 'string') return { outline: { blocks, sel: null }, notes, caretLost: a, sections, rows };
  if (a.block !== h.block) {
    // over whole blocks, from one's text start to another's end: those blocks selected
    // (as ourus reads the nodes: from a node's text start, a number or a checkbox before it, to another's end)
    const [from, to] = [Math.min(at(anchor), at(head)), Math.max(at(anchor), at(head))];
    const edge = (p: number, end: boolean): boolean => {
      const where = doc.locate(p);
      if (where.zone !== 'text' && where.zone !== 'frame') return false;
      return p === doc.posOf(where.node, end ? textEnd(where.text) : textStart(where.text), end ? -1 : 1);
    };
    if (!options.blockSelection || !edge(from, false) || !edge(to, true)) return { outline: { blocks, sel: null }, notes, caretLost: 'selection across blocks', sections, rows };
    const selected = [...new Set(doc.touchedNodes({ anchor: at(anchor), head: at(head) }).flatMap((n) => (blockOf.has(n.id) ? [blockOf.get(n.id)!] : [])))].sort((x, y) => x - y);
    return { outline: { blocks, sel: null, selected }, notes, sections, rows };
  }
  return { outline: { blocks, sel: { block: h.block, anchor: a.offset, head: h.offset } }, notes, sections, rows };
}

/** Every node under `node`, depth first. */
function descendants(node: OutlineNode): OutlineNode[] {
  return node.children.flatMap((c) => [c, ...descendants(c)]);
}

/**
 * A quote's lines as written, from its `>` on each (a lazy line's from its content), blank `>` lines
 * included: a block's text where the app's block holds any quote as Markdown (`quotes: atom`).
 */
function asWritten(doc: OurusDoc, node: OutlineNode): { text: string; lines: LineMap[] } {
  const lines: LineMap[] = [];
  const parts: string[] = [];
  let at = 0;
  for (let l = node.startLine; l <= node.endLine; l++) {
    const line = doc.mdTree.line(l);
    const from = line.prefix.find((p) => p.container.block === node.block)?.from ?? line.contentFrom;
    lines.push({ line: l, from, to: line.to, at });
    parts.push(doc.text.slice(from, line.to));
    at += line.to - from + 1;
  }
  return { text: parts.join('\n'), lines };
}

/**
 * The paragraph that is all of a quote (`> q`, its later lines quoted or lazy), which a block holds as
 * its text, or null. Any other quote (more blocks, a list, a quoted blank line, nothing) is a
 * container, which a block can't hold; a callout's title is no paragraph's.
 */
function quoted(doc: OurusDoc, node: OutlineNode): OutlineNode | null {
  if (node.kind !== 'quote') return null;
  const first = doc.mdTree.line(node.startLine);
  if (/^\s*>\s*\[!/.test(doc.text.slice(first.from, first.to))) return null;
  const p = node.children.length === 1 ? node.children[0]! : null;
  return p?.kind === 'paragraph' && !p.children.length && p.textFirstLine === node.startLine && p.textLastLine === node.endLine ? p : null;
}

/** A node's own text as a block holds it, and where each of its lines came from. */
function blockText(doc: OurusDoc, node: OutlineNode, notes: Set<string>, ordered: boolean, freeForm: boolean): { text: string; lines: LineMap[] } {
  const source = doc.text;
  const lineOf = (l: number) => doc.mdTree.line(l);
  if (node.kind === 'quote') throw new Unsupported(/^\s*>\s*\[!/.test(source.slice(lineOf(node.startLine).from, lineOf(node.startLine).to)) ? 'callout' : 'quote');
  const lines: LineMap[] = [];
  const parts: string[] = [];
  const add = (line: number, from: number, to: number, prefix = '', unescape = false): void => {
    const at = parts.reduce((k, p) => k + p.length + 1, 0) + prefix.length;
    let s = source.slice(from, to);
    // a Markdown escape at a line's start (`\#`, `\-`, `1\.`) only keeps the line from reading as
    // markup in the file; a block's text needs none, but where blocks are numbered, `1\.` starting a
    // block is text a numbered block's `1. ` isn't, and stays; so does `\#` starting a paragraph where
    // blocks are free-form, whose headings are free blocks starting with `# ` (Placeholder18)
    // (after spaces a split kept before the text, `enterSplitSpace: start`, as at its start)
    const heading = freeForm && node.kind === 'paragraph' && !parts.length && /^[ \t]*\\#/.test(s);
    const m = !unescape || heading ? null : ordered && !parts.length ? /^[ \t]*\\(?=[!-/:-@[-`{-~])/.exec(s) : /^[ \t]*\\(?=[!-/:-@[-`{-~])|^[ \t]*\d{1,9}\\(?=[.)])/.exec(s);
    const cuts: number[] = [];
    if (m) {
      notes.add('escape');
      cuts.push(from + m[0].length - 1);
    }
    // and the other markup escapes, which ourus's text leaves out (a definition's label's `\:`): only
    // the file's, as at a line's start
    if (unescape) {
      for (let p = from; p < to; p++) {
        // (one at the line's start is the rule above's, its exceptions kept)
        if (source[p] !== '\\' || cuts.includes(p) || /^[ \t]*\d{0,9}$/.test(source.slice(from, p)) || doc.offsetOf(node, p) !== doc.offsetOf(node, p + 1)) continue;
        notes.add('escape');
        cuts.push(p);
      }
    }
    for (const c of [...cuts].sort((a, b) => b - a)) s = s.slice(0, c - from) + s.slice(c - from + 1);
    lines.push(cuts.length ? { line, from, to, at, cuts } : { line, from, to, at });
    parts.push(prefix + s);
  };
  const skipSpaces = (from: number, to: number): number => {
    while (from < to && (source[from] === ' ' || source[from] === '\t')) from++;
    return from;
  };

  // an ordered item, where blocks are numbered: its number as a reader sees it (the list's start,
  // counted on), canonical `1. ` before its text
  const inList = doc.listOf(node)?.block;
  const number = ordered && inList?.attrs.list?.type === 'ordered' ? `${(inList.attrs.list.start ?? 1) + inList.children.indexOf(node.block)}. ` : '';
  if (node.kind === 'item') {
    const list = inList?.attrs.list ?? node.block.attrs.list;
    if (list?.type === 'ordered' && !ordered) notes.add('numbered list');
    else if (list?.bulletChar && list.bulletChar !== '-') notes.add(`bullet ${list.bulletChar}`);
    if (node.block.attrs.task) notes.add('task');
  } else if (node.kind === 'paragraph') {
    if (!freeForm) notes.add('paragraph');
  } else if (node.kind === 'heading') {
    if (!freeForm) notes.add('heading');
  } else if (node.kind === 'atom') notes.add(ATOM_NOTES[node.block.type] ?? node.block.type);

  const head = node.kind === 'atom' ? node.block : node.head;
  // where its own text starts, and ends
  const headStart = node.kind === 'atom' ? node.startLine : node.textFirstLine;
  const headEnd = head ? headStart + head.lines - 1 : headStart;
  // markup no block has a form for: a block would hold it as text, and edit it so
  const text = doc.textOf(node);
  if (head?.type === 'heading' && text instanceof ProseText && text.frame.some((p) => p.part === 'close')) throw new Unsupported("heading's closing #s");
  if (head?.type === 'code_block' && !head.attrs.fenced) throw new Unsupported('indented code');
  if (!head && node.kind === 'item' && node.block.children.length && node.block.offsets[0] === 0) {
    // an item whose first block is a list (`- - a`): it has no text, and the rest of its marker's line
    // is the inner item's, a child block; a quote of one paragraph there (`- > q`) is its text
    // (`project`'s)
    if (!quoted(doc, node.children[0]!)) notes.add("list as an item's first block");
    return { text: number, lines };
  }
  if (!head) {
    // an empty item, or one holding only a task's checkbox
    const line = lineOf(node.startLine);
    const task = node.block.attrs.task;
    const from = task ? line.from + task.start : Math.min(line.from + node.block.attrs.markerEnd! + 1, line.to);
    add(line.index, from, line.to, number);
    return { text: parts.join(''), lines };
  }
  if (head.type === 'heading' && head.attrs.setext) {
    notes.add('setext heading');
    for (let l = headStart; l < headEnd; l++) {
      const line = lineOf(l);
      add(l, skipSpaces(line.contentFrom, line.to), line.to, l === headStart ? number + '#'.repeat(head.attrs.level!) + ' ' : '', true);
    }
    return { text: parts.join('\n'), lines };
  }
  if (node.kind === 'item' && head.type === 'heading') notes.add('heading');
  if (node.kind === 'item' && ATOM_NOTES[head.type]) notes.add(ATOM_NOTES[head.type]!);
  // paragraphs and headings lose their lines' leading whitespace; atoms keep theirs
  const trim = head.type === 'paragraph' || head.type === 'heading';
  // an item's text below its marker (`-⏎  text`, a Shift-Enter at its start): its block's text starts
  // with an empty line, as an app's block after that Shift-Enter does (ShiftEnter13)
  const below = node.kind === 'item' && text instanceof ProseText && text.frame.some((p) => p.part === 'below') ? '\n' : '';
  for (let l = headStart; l <= headEnd; l++) {
    const line = lineOf(l);
    // (a later line's spaces past its content column are its text, as ourus's and the apps' are:
    // ShiftEnter1)
    let from = trim && l === headStart ? skipSpaces(line.contentFrom, line.to) : line.contentFrom;
    // spaces before it that are the text's are the block's, as the app's block starts with them: a
    // space a placeholder holds as text (`- ◌ x`), what a split kept (`enterSplitSpace: start`: an
    // item's padding, a paragraph's leading spaces, where ourus's text start is before them)
    if (l === headStart) {
      const held = doc.marks.points().find((p) => p >= line.from && p < from && (source[p] === ' ' || source[p] === '\t'));
      from = Math.min(held ?? from, node.kind === 'item' || node.kind === 'paragraph' ? doc.textStart(l) : from);
    }
    add(l, from, line.to, l === headStart ? number + below : '', trim);
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
 * two spaces a level under bullets, the number's width under a number. Blocks selected whole are drawn
 * as the spec draws a subtree selection, `««` before the first's text and `»»` after the last's own,
 * a span to each run of them with nothing unselected between; `bars`, as runs stored before that drew
 * them, `▮` before each one's text.
 */
export function draw(o: Outline, options: Pick<ProjectOptions, 'ordered'> & { readonly bars?: boolean } = {}): string {
  const out: string[] = [];
  /** Where the text of the last block at each depth starts: its children's indentation. */
  const cols: number[] = [];
  const spans = options.bars ? { open: new Set<number>(), close: new Set<number>() } : selectedSpans(o);
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
    const mark = options.bars && o.selected?.includes(i) ? '▮ ' : '';
    // a caret or selection inside the number leaves it text, under a bullet
    const number = options.ordered && !b.free ? /^\d{1,9}\. /.exec(t)?.[0] : undefined;
    if (number) t = t.slice(number.length);
    t = (spans.open.has(i) ? '««' : '') + t + (spans.close.has(i) ? '»»' : '');
    const marker = number ? number.slice(0, -1) : b.free ? '¶' : '-';
    const at = b.depth ? (cols[b.depth - 1] ?? 2 * b.depth) : 0;
    cols.length = b.depth;
    cols[b.depth] = at + marker.length + 1;
    t.split('\n').forEach((line, k) => out.push(k === 0 ? `${' '.repeat(at)}${marker} ${mark}${line}` : `${' '.repeat(cols[b.depth]!)}${line}`));
  });
  return out.join('\n').replace(/\t/g, '→') + '\n' + (o.view ? drawView(o.view) : '');
}

/** The end of block `i`'s subtree: the index of its last descendant, itself where it has none. */
function subtreeEnd(blocks: readonly Block[], i: number): number {
  let j = i;
  while (j + 1 < blocks.length && blocks[j + 1]!.depth > blocks[i]!.depth) j++;
  return j;
}

/** Where `draw` opens and closes a span of blocks selected whole: a run of them with nothing unselected between. */
function selectedSpans(o: Outline): { open: Set<number>; close: Set<number> } {
  const open = new Set<number>();
  const close = new Set<number>();
  const roots = [...(o.selected ?? [])].sort((a, b) => a - b);
  roots.forEach((r, k) => {
    if (k === 0 || subtreeEnd(o.blocks, roots[k - 1]!) + 1 !== r) open.add(r);
    if (k === roots.length - 1 || subtreeEnd(o.blocks, r) + 1 !== roots[k + 1]) close.add(r);
  });
  return { open, close };
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
 * `ownsList` says owns one (a paragraph) the items right after it. A block's own children stay its
 * children (`asMarkdownReads` lifts them first, for an app that nests any block).
 */
export function ownBlocks(blocks: readonly Block[], ownsList: (b: Block, i: number) => boolean): Block[] {
  const scope: { headings: number[]; paragraph: boolean }[] = [];
  const depthOf: number[] = [];
  /** Whether the last block at each depth is an item: a paragraph in an item owns no list there, as in ourus's outline. */
  const item: boolean[] = [];
  return blocks.map((b, i) => {
    scope.length = b.depth + 1;
    depthOf.length = b.depth;
    const inItem = b.depth > 0 && !!item[b.depth - 1];
    item.length = b.depth;
    item[b.depth] = !b.free;
    const sc = (scope[b.depth] ??= { headings: [], paragraph: false });
    let shift: number;
    if (b.free) {
      const level = /^(#{1,6}) /.exec(b.text)?.[1]!.length ?? 0;
      if (level) while (sc.headings.length && sc.headings.at(-1)! >= level) sc.headings.pop();
      shift = sc.headings.length;
      if (level) sc.headings.push(level);
      sc.paragraph = !level && !inItem && ownsList(b, i);
    } else shift = sc.headings.length + (sc.paragraph ? 1 : 0);
    const depth = (b.depth ? depthOf[b.depth - 1]! + 1 : 0) + shift;
    depthOf[b.depth] = depth;
    return depth === b.depth ? b : { ...b, depth };
  });
}

/**
 * The free blocks that own the list right after them under `listParent`, as ourus's outline reads
 * the projection's text (its quotes containers, which own nothing): `paragraph` a paragraph (not a
 * heading, code, a divider, a quote); `block` any but a heading and a quote; `container` none.
 */
export function listOwner(listParent: Config['listParent'] = 'paragraph'): (b: Block) => boolean {
  if (listParent === 'container') return () => false;
  const paragraph = listParent === 'paragraph';
  return (b) => !!b.free && !/^#{1,6} /.test(b.text) && !b.text.startsWith('> ') && (!paragraph || (!/^(`{3,}|~{3,})/.test(b.text) && !/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(b.text) && !/^\|/.test(b.text)));
}

/**
 * An app's blocks, any of which may hold children (BlockNote's), as their Markdown reads in ourus's
 * outline: what a free block holds is beside it, as Markdown has no child of a paragraph (`Intro⏎  -
 * a` is the list after it, as `Intro⏎- a` is), then owned as `listParent` says (`liftOwned`,
 * `ownBlocks`).
 */
export function asMarkdownReads(blocks: readonly Block[], listParent: Config['listParent'] = 'paragraph'): Block[] {
  return ownBlocks(liftOwned(blocks), listOwner(listParent));
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
export function readOutline(drawing: string, options: Pick<ProjectOptions, 'ordered'> = {}): Outline | null {
  const { drawn, view } = splitView(drawing);
  const blocks: Block[] = [];
  const raw: string[][] = [];
  /** The length of the number drawn in each block's bullet's place (`1. `), before a span's `««`. */
  const numbers: number[] = [];
  const selected: number[] = [];
  /** Where the text of the last block at each depth starts, as `draw` indents. */
  const cols: number[] = [];
  // no blocks at all draw as one empty line
  for (const line of drawn === '\n' ? [] : drawn.replace(/\n$/, '').replace(/→/g, '\t').replace(/␠/g, ' ').split('\n')) {
    const item = /^( *)(?:([-¶])|(\d{1,9}\.)) (▮ )?(.*)$/.exec(line);
    const spaces = item?.[1]!.length ?? 0;
    // a block's depth: where blocks are numbered, it starts where its parent's text does; else two
    // spaces a level
    const depth = !item || (item[3] && !options.ordered) ? -1 : !spaces ? 0 : options.ordered ? (cols.includes(spaces) ? cols.indexOf(spaces) + 1 : -1) : spaces % 2 ? -1 : spaces / 2;
    // (deeper than a child of the block above, it is a line of that block's text: `- > - q⏎      - g`,
    // its text's `    - g`, as `draw` indents it)
    if (item && depth >= 0 && depth <= (blocks.at(-1)?.depth ?? -1) + 1) {
      if (item[4]) selected.push(blocks.length);
      blocks.push({ depth, text: '', ...(item[2] === '¶' && { free: true as const }) });
      raw.push([item[3] ? `${item[3]} ${item[5]!}` : item[5]!]);
      numbers.push(item[3] ? item[3].length + 1 : 0);
      cols.length = depth;
      cols[depth] = spaces + (item[2] ?? item[3]!).length + 1;
      continue;
    }
    const ind = blocks.length ? ' '.repeat(cols[blocks.at(-1)!.depth]!) : null;
    if (ind === null || !line.startsWith(ind)) return null;
    raw.at(-1)!.push(line.slice(ind.length));
  }
  let sel: Sel | null = null;
  const bars = selected.length > 0;
  /** The spans of blocks selected whole (`««…»»`), by the blocks they open and close at. */
  const spans: [number, number][] = [];
  raw.forEach((lines, i) => {
    // the caret or selection out first, then the backslashes `draw` escaped continuation lines with
    let t = lines.join('\n');
    const n = numbers[i]!;
    if (t.startsWith('««', n)) [t, spans[spans.length]] = [t.slice(0, n) + t.slice(n + 2), [i, -1]];
    if (t.endsWith('»»') && spans.at(-1)?.[1] === -1) [t, spans.at(-1)![1]] = [t.slice(0, -2), i];
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
  // a span's roots: the blocks in it not under another block in it
  for (const [from, to] of spans) {
    if (to < 0) return null;
    let root = -1;
    for (let k = from; k <= to; k++) {
      if (root < 0 || blocks[k]!.depth <= blocks[root]!.depth) selected.push((root = k));
    }
  }
  const o: Outline = { blocks, sel, ...(selected.length && { selected }), ...(view && { view }) };
  return draw(o, { bars }) === drawing || (options.ordered && draw(o, { ...options, bars }) === drawing) ? o : null;
}

export type Verdict = 'agree' | 'whitespace' | 'caret' | 'disagree';

/**
 * Text compared without the spaces next to line breaks, at the ends and right after a block's
 * canonical prefix (`10. `, `[ ] `, `# `), where editors differ in trimming.
 */
const loose = (b: Block): string =>
  `${b.depth}${b.free ? '¶' : ''}:${b.text
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/^((?:\d{1,9}\. )?(?:\[[ xX]\] )?(?:#{1,6} |> )?)[ \t]+/, '$1')
    .trim()}`;

/**
 * A block's text without the closing fence of the code it ends with (but blank lines): a block ends its code, so the
 * fence closing it there says nothing (ourus closes what it writes, to keep the Markdown well
 * formed; Logseq and Tine leave it open).
 */
export function endFenceOptional(text: string): string {
  const lines = text.split('\n');
  let open: { char: string; length: number } | null = null;
  for (const [i, line] of lines.entries()) {
    const run = /^[ \t]{0,3}(`{3,}|~{3,})/.exec(line);
    if (!open) {
      if (run) open = { char: run[1]![0]!, length: run[1]!.length };
      continue;
    }
    const close = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
    if (close && close[1]![0] === open.char && close[1]!.length >= open.length) {
      // (blank lines after it stay, a difference of whitespace)
      if (lines.slice(i + 1).every((l) => l.trim() === '')) return [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n');
      open = null;
    }
  }
  return text;
}

/**
 * An outline with each quote's later lines lazy, as the projection has them (`> a⏎b`): the `>` an app
 * or ourus writes on them (`> a⏎> b`, SiYuan's, ourus's under `quotes: atom`) taken off, the same quote
 * to Markdown, wherever in a block the quote starts (after an item's text, with `paragraphsInBlock`),
 * and a selection after it moved back with it.
 */
export function lazyQuotes(o: Outline): Outline {
  let sel = o.sel;
  const blocks = o.blocks.map((b, i) => {
    if (!/(?:^(?:\d{1,9}\. )?(?:\[[ xX]\] )?|\n) {0,3}>/.test(b.text)) return b;
    // each later line's `>` and its space in a quote: where it was in the text, and how long (a quote
    // starts at a line starting with `>`, and goes on to a blank line)
    const cuts: [number, number][] = [];
    let at = 0;
    let inQuote = false;
    const text = b.text
      .split('\n')
      .map((line, k) => {
        const mark = /^ {0,3}> ?/.exec(k ? line : line.replace(/^(?:\d{1,9}\. )?(?:\[[ xX]\] )?/, ''))?.[0];
        let quoted = 0;
        if (inQuote && k) quoted = /^ {0,3}> ?/.exec(line)?.[0].length ?? 0;
        else if (mark) inQuote = true;
        if (inQuote && !mark && line.trim() === '') inQuote = false;
        if (quoted) cuts.push([at, quoted]);
        at += line.length + 1;
        return line.slice(quoted);
      })
      .join('\n');
    if (sel?.block === i && cuts.length) {
      const map = (p: number): number => p - cuts.reduce((n, [c, len]) => n + Math.max(0, Math.min(len, p - c)), 0);
      sel = { ...sel, anchor: map(sel.anchor), head: map(sel.head) };
    }
    return text === b.text ? b : { ...b, text };
  });
  return { ...o, blocks, sel };
}

/** How `got` compares with `want`; a selection is compared only where `want` has one. */
export function compareOutlines(want: Outline, got: Outline, sections: readonly number[] = []): Verdict {
  // a code block's closing fence at a block's end is the block's own end; a quote's later lines lazy
  const ended = (o: Outline): Outline => lazyQuotes({ ...o, blocks: o.blocks.map((b) => ({ ...b, text: endFenceOptional(b.text) })) });
  [want, got] = [sectioned(ended(want), sections), sectioned(ended(got), sections)];
  const same = want.blocks.length === got.blocks.length && want.blocks.every((b, i) => b.depth === got.blocks[i]!.depth && !b.free === !got.blocks[i]!.free && sameText(b.text, got.blocks[i]!.text));
  if (!same) {
    // (an empty free block is an empty paragraph, which Markdown has only as blank lines: Placeholder3;
    // what it owns comes up a level with it gone, as the text has it: Backspace17)
    const shown = (o: Outline): string[] => {
      const out: string[] = [];
      const gone: number[] = [];
      for (const b of o.blocks) {
        while (gone.length && gone.at(-1)! >= b.depth) gone.pop();
        if (b.free && b.text.trim() === '') gone.push(b.depth);
        else out.push(loose({ ...b, depth: b.depth - gone.length }));
      }
      return out;
    };
    const close = JSON.stringify(shown(want)) === JSON.stringify(shown(got));
    return close ? 'whitespace' : 'disagree';
  }
  if (want.sel && (JSON.stringify(want.sel) !== JSON.stringify(got.sel) || got.selected?.length)) return 'caret';
  // blocks selected whole, as a caret: other blocks, or a caret instead
  if (want.selected?.length && (JSON.stringify(want.selected) !== JSON.stringify(got.selected ?? []) || got.sel)) return 'caret';
  return 'agree';
}

/** A run of a block's text with its inline formatting, as an app with rich text holds it. */
export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  /** A link's target. */
  href?: string;
}

/**
 * Rich text as Markdown: each formatted run in its markup (`**b**`, `*i*`, `~~s~~`, `` `c` ``,
 * `[l](url)`), the text itself as it is (an app's plain text is read unescaped, as before), a run's
 * spaces at its edges outside its markup, where Markdown has emphasis end; and where a place in the
 * text is in the Markdown (`at`), between runs after the markup closing the one before and ahead of
 * the markup opening the next.
 */
export function runsAsMarkdown(runs: readonly Run[]): { text: string; at: (p: number) => number } {
  type Mark = 'link' | 'bold' | 'italic' | 'strike' | 'code';
  const ORDER: Mark[] = ['link', 'bold', 'italic', 'strike', 'code'];
  // a formatted run's edge spaces as runs of their own, out of its emphasis (code keeps its own; a
  // link keeps them)
  const split: Run[] = [];
  for (const r of runs) {
    if (!r.text) continue;
    const marked = r.bold || r.italic || r.strike || r.href !== undefined;
    const m = marked && !r.code ? /^(\s*)([\s\S]*?)(\s*)$/.exec(r.text)! : null;
    if (!m || (!m[1] && !m[3])) split.push(r);
    else {
      const space = (text: string): Run => ({ text, ...(r.href !== undefined && { href: r.href }) });
      if (m[1]) split.push(space(m[1]));
      if (m[2]) split.push({ ...r, text: m[2] });
      if (m[3]) split.push(space(m[3]));
    }
  }
  const has = (r: Run, k: Mark): boolean => (k === 'link' ? r.href !== undefined : !!r[k]);
  const ticks = (r: Run): string => '`'.repeat(Math.max(1, ...[...r.text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  let out = '';
  const open: Mark[] = [];
  let href: string | undefined;
  let code = '';
  const close = (k: Mark): void => {
    out += k === 'link' ? `](${href})` : k === 'bold' ? '**' : k === 'italic' ? '*' : k === 'strike' ? '~~' : code;
  };
  // where each run starts in the plain text and in the Markdown
  const starts: { plain: number; md: number; boundary: number }[] = [];
  let plain = 0;
  for (const r of split) {
    // close down to the first open mark this run doesn't continue (a link to another target too, and
    // code always: each code run is a span of its own)
    const keep = open.findIndex((k) => !has(r, k) || (k === 'link' && r.href !== href) || k === 'code');
    if (keep >= 0) for (const k of open.splice(keep).reverse()) close(k);
    const boundary = out.length;
    for (const k of ORDER) {
      if (!has(r, k) || open.includes(k)) continue;
      open.push(k);
      if (k === 'link') href = r.href;
      if (k === 'code') code = ticks(r);
      out += k === 'link' ? '[' : k === 'bold' ? '**' : k === 'italic' ? '*' : k === 'strike' ? '~~' : code + (/^`|`$/.test(r.text) ? ' ' : '');
    }
    starts.push({ plain, md: out.length, boundary });
    out += r.text;
    if (r.code && /^`|`$/.test(r.text)) out += ' ';
    plain += r.text.length;
  }
  for (const k of open.reverse()) close(k);
  const end = { plain, md: out.length };
  return {
    text: out,
    at(p) {
      if (p >= end.plain) return end.md;
      for (let i = starts.length - 1; i >= 0; i--) {
        const s = starts[i]!;
        if (p > s.plain) return s.md + Math.min(p - s.plain, split[i]!.text.length);
        if (p === s.plain && (i === 0 || p > starts[i - 1]!.plain)) return s.boundary;
      }
      return 0;
    },
  };
}

/**
 * An outline read from an app whose italic is `__x__` (Roam's, Dynalist's), which Markdown reads as
 * strong: as Markdown's `*x*`, the caret moved with it.
 */
export function italicsAsMarkdown(o: Outline): Outline {
  let sel = o.sel;
  const blocks = o.blocks.map((b, i) => {
    // where a character goes: one of each pair of underscores
    const cuts: number[] = [];
    const text = b.text.replace(/__(?=[^\s_])([^\n]*?[^\s_])__/g, (_, inner: string, at: number) => {
      cuts.push(at, at + 2 + inner.length);
      return `*${inner}*`;
    });
    if (sel?.block === i && cuts.length) {
      const map = (p: number): number => p - cuts.filter((c) => c < p).length;
      sel = { ...sel, anchor: map(sel.anchor), head: map(sel.head) };
    }
    return text === b.text ? b : { ...b, text };
  });
  return { ...o, blocks, sel };
}

/**
 * Whether two blocks' texts say the same: the same but for escapes, which Markdown's inline content
 * reads the same (an escape where nothing needs one: `\[y\]` and `[y]`), and for emphasis spelled
 * otherwise that renders the same (Tine's `_i_` and `~s~` for `*i*` and `~~s~~`). An escape that keeps
 * markup text (`\*x\*`, against `*x*` an app made italic) still differs, and so does any other
 * character, whitespace too (`whitespace` is its own verdict). Each line is read as inline content only: what
 * would start a block there is the projection's.
 */
export function sameText(a: string, b: string): boolean {
  if (a === b) return true;
  const unescaped = (text: string): string => text.replace(/\\([!-/:-@[-`{-~])/g, '$1');
  const spelled = (text: string): string => text.replace(/(?<![\w_])_(?=[^\s_])([^_\n]*?[^\s_])_(?![\w_])/g, '*$1*').replace(/(?<!~)~(?=[^\s~])([^~\n]*?[^\s~])~(?!~)/g, '~~$1~~');
  if (unescaped(spelled(a)) !== unescaped(spelled(b))) return false;
  const inline = (text: string): string => micromark(text.split('\n').map((line) => `\uFFFD${line}`).join('\n'), { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  return inline(a) === inline(b);
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
export const sameOutline = (a: Outline, b: Outline): boolean => JSON.stringify([a.blocks, a.sel, a.selected ?? [], a.view ?? null]) === JSON.stringify([b.blocks, b.sel, b.selected ?? [], b.view ?? null]);
