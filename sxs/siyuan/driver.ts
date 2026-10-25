/// <reference lib="dom" />
// SiYuan (https://b3log.org/siyuan/, see README.md): a block editor over Markdown, open source
// (AGPL-3.0), run here from its release: a kernel for each of a run's workers (kernel.ts) serves the
// web UI and the API on 127.0.0.1, the page's port telling its kernel. Each test's outline is a document of its own, made from Markdown through the API
// (`filetree/createDocWithMd`, in free form: a paragraph, a heading or code a block of its own, a list
// item an item, what a free block owns beside it as Markdown has it) and opened in the editor through
// the driver's plugin (plugin/, the plugin API's `openTab`); the last test's document is removed, which
// closes its tab. Undo is the kernel's, per document, so it stays within the test. The actions are
// SiYuan's keymap on Linux (⌘ is Ctrl there).
//
// Reading is the editor's DOM (`protyle.wysiwyg`), SiYuan's own tree: list items in order, each
// block's text its own blocks' Markdown by SiYuan's converter (Lute's `BlockDOM2StdMd`), a task item
// `[ ] ` / `[x] ` before it. Any block but an item's text is free, and owned as the spec's buffers'
// blocks are (`ownBlocks`, ../lib/block.ts): a paragraph owns the list right after it, a heading its
// section. The caret is mapped into a block's Markdown, and back, through a marker character put
// where it is, so markup the editor draws as no text (`**b**`, a heading's `## `) counts as it does in
// the text. (The whole document's Markdown, projected as the spec's buffers are, would read SiYuan's
// tree wrong where its Markdown doesn't say it: `-  b` with a child indented two columns, after a
// deletion at the text's start, isn't the child's parent in CommonMark.)

import type { Page } from 'playwright-core';
import { perPage, type Driver } from '../lib/driver.ts';
import { liftOwned, ownBlocks, type Block, type Outline } from '../lib/block.ts';
import { api, holdKernel, kernelOf, kernelOfPage, leaseKernel, serve, type Kernel } from './kernel.ts';

/** SiYuan's keys for the spec's motions (Linux); the `select…` motions add Shift. */
const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
  DocStart: 'Control+Home',
  DocEnd: 'Control+End',
};

/**
 * A free block's text as Markdown's lines: a paragraph's lines escaped where they would read as a
 * list's item or a quote (`- x` is the paragraph's text); a heading, code, math, a table or a thematic
 * break as it is.
 */
function freeLines(text: string): string[] {
  const lines = text.split('\n');
  if (/^(?:#{1,6}(?:[ \t]|$)|`{3,}|~{3,}|\$\$|\||<| {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$)/.test(lines[0]!)) return lines;
  return lines.map((l) => l.replace(/^([-*+>])(?=[ \t]|$)/, '\\$1').replace(/^(\d{1,9})([.)])(?=[ \t]|$)/, '$1\\$2'));
}

/**
 * An outline as Markdown for `createDocWithMd`, in free form: a free block (`Block.free`: a paragraph,
 * a heading, code) a block of its own, set off by blank lines, at the top level or in the item it is
 * under, at its content column; what one owns in ourus's outline (a heading its section, a paragraph
 * the list after it) beside it, as Markdown has them (`liftOwned`). An item a list item, nested by its
 * depth, a numbered one (`1. x`) an ordered list's, its children at its content column. A numbered
 * item that doesn't go on from the one before it (`1. a`, `1. b`) starts a list of its own, by the
 * other delimiter (`1)`), which SiYuan keeps as a list apart (drawing it `1.`).
 */
function markdownOf(outline: readonly Block[]): string {
  const columns: number[] = [];
  // each depth's last sibling, if numbered: its number and delimiter
  const runs: ({ n: number; delim: string } | null)[] = [];
  const out: string[] = [];
  let afterFree = false;
  for (const b of liftOwned(outline)) {
    const pad = ' '.repeat(b.depth ? (columns[b.depth - 1] ?? 2 * b.depth) : 0);
    if (b.free) {
      // a free block ends the list at its depth: an item after it starts another
      runs.length = b.depth;
      columns.length = b.depth;
      // an empty one (a paragraph Markdown can't hold) as a zero-width space, which SiYuan makes an
      // empty paragraph of and its converter drops
      out.push('', ...(b.text ? freeLines(b.text).map((l) => (l ? pad + l : '')) : [`${pad}\u200b`]));
      afterFree = true;
      continue;
    }
    if (afterFree) out.push('');
    afterFree = false;
    const numbered = /^(\d{1,9})\. /.exec(b.text);
    const before = runs[b.depth];
    const n = numbered ? Number(numbered[1]) : 0;
    const delim = !numbered || !before || n === before.n + 1 ? (before?.delim ?? '.') : before.delim === '.' ? ')' : '.';
    runs.length = b.depth;
    runs[b.depth] = numbered ? { n, delim } : null;
    const marker = numbered ? `${numbered[1]}${delim}` : '-';
    columns.length = b.depth;
    columns[b.depth] = pad.length + marker.length + 1;
    const [first, ...rest] = (numbered ? b.text.slice(numbered[0].length) : b.text).split('\n');
    out.push(`${pad}${marker} ${first}`, ...rest.map((l) => (l ? `${' '.repeat(columns[b.depth]!)}${l}` : '')));
  }
  return `${out.join('\n').replace(/^\n/, '')}\n`;
}

/**
 * A block's fenced code, if it has one: where the fenced block is in the text (`from` the opening
 * fence's line `to` the closing one's end), and the code between (`start`, `end`).
 */
function codeOf(text: string): { from: number; to: number; start: number; end: number } | null {
  const open = /(?:^|\n)((`{3,}|~{3,})[^\n]*)\n/.exec(text);
  if (!open) return null;
  const from = open.index + open[0].length - open[1]!.length - 1;
  const start = open.index + open[0].length;
  const close = new RegExp(`\n(${open[2]![0]}{${open[2]!.length},}[ \t]*)(?=\n|$)`).exec(text.slice(start - 1));
  if (!close) return { from, to: text.length, start, end: text.length };
  const end = start - 1 + close.index;
  return { from, to: end + 1 + close[1]!.length, start, end };
}

/**
 * What SiYuan can't start from, measured (each was a start it held otherwise): text it trims or
 * reads as structure, markup it drops, and carets in what it draws as no text.
 */
function holds(o: Outline): string | undefined {
  for (const b of o.blocks) {
    const first = b.text.split('\n')[0]!;
    // a no-break space: held as a space
    if (b.text.includes('\u00a0')) return 'no-break space, which SiYuan holds as a space';
    // `- →x` and `-     code`: a tab or an indented line becomes structure, or is trimmed
    if (/^[ \t]/.test(b.text)) return "block's text starting with whitespace";
    // and a later line's, trimmed (Regression32, Indent33)
    if (/\n[ \t]/.test(b.text)) return "line's leading whitespace";
    // a hard break's spaces, a space after the text: trimmed (an empty task's `[ ] ` is its checkbox, held)
    if (/[ \t]$/m.test(b.text.replace(/^\[[ xX]\] /, ''))) return "line's trailing whitespace";
    // an empty last line: trimmed
    if (b.text.endsWith('\n')) return "block's text ending in a line break";
    // `**b**`: held as bold, read back without its markers (Copy1)
    if (/(\*\*|__)(?=\S)[^]*?\S\1/.test(b.text)) return 'strong emphasis, which SiYuan holds as formatting';
    // `# Title #`: held as `# Title`
    if (/^#{1,6}(?:[ \t].*)?[ \t]#+[ \t]*$/.test(first) || /^#{1,6}[ \t]+#+[ \t]*$/.test(first)) return "heading's closing #s";
    // `- ---` is a thematic break, not an item holding one
    if (!b.free && /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(first)) return 'thematic break as an item';
    // a table SiYuan writes otherwise: a column with a cell of three characters or more is padded to
    // it, its delimiter longer (measured: `| a | b |` stays, `| a   | b |` above `| one | 2 |`)
    const rows = b.text.split('\n').filter((l) => /^\s*\|.*\|\s*$/.test(l));
    if (rows.length && rows.some((r) => r.split('|').slice(1, -1).some((c) => (/^\s*:?-+:?\s*$/.test(c) ? c !== ' --- ' : c.trim().length > 2 || c !== ` ${c.trim()} `)))) return 'table SiYuan writes otherwise (its columns padded to their widest cell)';
    // `# first` / `abc`: a heading is one line, the next a paragraph after it
    if (/^#{1,6}(?:[ \t]|$)/.test(first) && b.text.includes('\n')) return 'heading with more lines';
    // an unclosed fence: SiYuan closes it (DuplicateSubtree9)
    const fence = /^ {0,3}(`{3,}|~{3,})/.exec(first)?.[1];
    if (fence && !b.text.split('\n').slice(1).some((l) => new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*$`).test(l))) return 'unclosed fence, which SiYuan closes';
    // `p` / `- g`: a later line of a block's text that starts with a list marker, held otherwise (Paste70)
    if (b.text.split('\n').slice(1).some((l) => /^ {0,3}(?:[-*+]|\d{1,9}[.)])(?:[ \t]|$)/.test(l))) return 'later line starting with a list marker';
  }
  if (!o.sel) return undefined;
  const text = o.blocks[o.sel.block]!.text;
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  // a task's checkbox is drawn, not text
  if (/^\[[ xX]\] /.test(text) && from < 4) return "caret in a task's checkbox";
  // a thematic break is a line drawn, with no text to hold a caret (Enter67)
  if (/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(text)) return 'caret on a thematic break';
  // a heading's #s are its level, not text
  const hashes = /^(?:\d{1,9}\. )?(?:\[[ xX]\] )?#{1,6} /.exec(text);
  if (hashes && from < hashes[0].length) return "caret in a heading's #s";
  // a code block's editor has the code alone
  const code = codeOf(text);
  const onFence = (p: number): boolean => !!code && p >= code.from && p <= code.to && (p < code.start || p > code.end);
  if (onFence(from) || onFence(to)) return "caret on a code block's fence";
  // a math block is drawn (KaTeX), its TeX edited in a popup
  const math = /(?:^|\n)\$\$[^\n]*(?:\n[^]*?(?:\n\$\$[ \t]*(?=\n|$)|$)|$)/.exec(text);
  const inMath = (p: number): boolean => !!math && p >= math.index && p <= math.index + math[0].length;
  if (inMath(from) || inMath(to)) return 'caret in a math block';
  // a table's cells are its text: a caret on a pipe, its padding or the delimiter row has no place
  const outsideCell = (p: number): boolean => {
    const start = text.lastIndexOf('\n', p - 1) + 1;
    const line = text.slice(start, (text.indexOf('\n', p) + 1 || text.length + 1) - 1);
    if (!/^\s*\|.*\|\s*$/.test(line)) return false;
    if (/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line)) return true;
    const at = p - start;
    // within a cell's text, from its first character to past its last
    return ![...line.matchAll(/\|([^|]*)(?=\|)/g)].some((m) => {
      const cell = m[1]!;
      const lead = cell.length - cell.trimStart().length;
      const begin = m.index + 1 + lead;
      return at >= begin && at <= begin + cell.trim().length;
    });
  };
  if (outsideCell(from) || outsideCell(to)) return "caret outside a table's cells";
  return undefined;
}

/** What the page gives back: the blocks in order, the caret in Markdown offsets, the blocks selected. */
interface Raw {
  blocks: Block[];
  /** Each block's owning the list right after it, as Markdown's paragraph does (`ownBlocks`). */
  owns: boolean[];
  sel: { block: number; anchor: number; head: number } | null;
  selected: number[];
}

/**
 * In the page: the open document's blocks, and where `want` (a block's Markdown offsets) is in the DOM.
 * Run through `page.evaluate`, so it carries everything it needs.
 */
function inPage(want: { block: number; anchor: number; head: number } | null): Raw & { placed?: string } {
  const S1 = '⁣'; // invisible separator: the anchor
  const S2 = '⁤'; // invisible plus: the head
  const p = (window as any).__ourusSxs.editor()?.protyle;
  if (!p) throw new Error('no editor open');
  const wys = p.wysiwyg.element as HTMLElement;
  // the zero-width joiner SiYuan puts before three backticks in code, so that they close no fence
  // (its `removeZWJ` takes it out of what it copies): no character of the code's, the caret's markers
  // (S1, S2) maybe among the backticks
  // (with it gone a code line of backticks would close the fence, which SiYuan writes as three
  // whatever the code: so a code block's fences are read as Markdown's, longer than any such line,
  // Fence36, Regression6)
  const md = (el: Element): string => {
    const t = (p.lute.BlockDOM2StdMd(el.outerHTML) as string).replace(/\n$/, '').replace(/\u200D(?=(?:[\u2063\u2064\u200D]*`){3})/g, '');
    if ((el as HTMLElement).dataset?.type !== 'NodeCodeBlock') return t;
    const lines = t.split('\n');
    const open = /^`{3,}/.exec(lines[0]!)?.[0];
    if (!open || lines.length < 2 || lines.at(-1) !== open) return t;
    const runs = lines.slice(1, -1).map((l) => /^[ \t]*(`+)[ \t]*$/.exec(l.replace(/[\u2063\u2064]/g, ''))?.[1]!.length ?? 0);
    const fence = '`'.repeat(Math.max(open.length, ...runs.map((n) => n + 1)));
    return fence === open ? t : [fence + lines[0]!.slice(open.length), ...lines.slice(1, -1), fence].join('\n');
  };
  const data = (el: Element): DOMStringMap => (el as HTMLElement).dataset ?? {};
  // a block: a list item's own blocks (not its nested lists), or a block outside every list; free (a
  // paragraph, a heading, code, ...) but an item's text, a paragraph owning the list right after it
  type Group = { els: HTMLElement[]; depth: number; prefix: string; holder: HTMLElement; free: boolean; owns: boolean };
  const groups: Group[] = [];
  const items = (list: Element, depth: number): void => {
    [...list.children].filter((c) => data(c).type === 'NodeListItem').forEach((li, k) => {
      const kids = [...li.children].filter((c) => data(c).nodeId) as HTMLElement[];
      const task = (li as HTMLElement).dataset.task;
      // an ordered list's item: its number, as the canonical text has it (`1. `)
      const number = data(list).subtype === 'o' ? `${parseInt(data(li).marker ?? '', 10) || k + 1}. ` : '';
      // its first block is its text; its other blocks (code after its text, a second paragraph) are
      // its children, in order with its nested lists, as the projection has an item's blocks. An empty
      // paragraph too, where it is: SiYuan leaves one where an item's blocks went into the item above
      // (Backspace at an empty item's start, Enter on an empty child), a block until it is deleted, and
      // typing there fills it, the read's structure the same
      const first = kids[0] && data(kids[0]).type !== 'NodeList' ? kids[0] : undefined;
      const text = first ? [first] : [];
      groups.push({ els: text, depth, prefix: number + (task === undefined ? '' : task === ' ' ? '[ ] ' : '[x] '), holder: li as HTMLElement, free: false, owns: false });
      for (const kid of kids) {
        if (data(kid).type === 'NodeList') items(kid, depth + 1);
        else if (!text.includes(kid)) groups.push({ els: [kid], depth: depth + 1, prefix: '', holder: kid, free: true, owns: data(kid).type === 'NodeParagraph' });
      }
    });
  };
  // blocks outside every list, free; owned as ourus owns them (a heading its section, a paragraph the
  // list right after it) by `ownBlocks`, out of the page
  for (const c of [...wys.children].filter((c) => data(c).nodeId) as HTMLElement[]) {
    if (data(c).type === 'NodeList') items(c, 0);
    else groups.push({ els: [c], depth: 0, prefix: '', holder: c, free: true, owns: data(c).type === 'NodeParagraph' });
  }
  // a position (node, offset) inside `el`, copied into a clone of it with a marker there
  const path = (root: Node, n: Node): number[] => {
    const out: number[] = [];
    for (let at = n; at !== root; at = at.parentNode!) out.unshift([...at.parentNode!.childNodes].indexOf(at as ChildNode));
    return out;
  };
  const mark = (clone: Node, at: number[], offset: number, s: string): void => {
    let n = clone;
    for (const i of at) n = n.childNodes[i]!;
    if (n.nodeType === Node.TEXT_NODE) (n as Text).insertData(offset, s);
    else n.insertBefore(document.createTextNode(s), n.childNodes[offset] ?? null);
  };
  /** `el`'s Markdown with markers at the given positions (in `el`): the text without them, and where each was (-1: not there). */
  const withMarks = (el: HTMLElement, marks: { node: Node; offset: number; s: string }[]): { text: string; at: Record<string, number> } => {
    if (!marks.length) return { text: md(el), at: { [S1]: -1, [S2]: -1 } };
    const clone = el.cloneNode(true) as HTMLElement;
    // the later position first, so that the earlier one's path and offset still hold
    const ordered = [...marks].sort((x, y) => (x.node === y.node ? y.offset - x.offset : x.node.compareDocumentPosition(y.node) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : -1));
    for (const m of ordered) mark(clone, path(el, m.node), m.offset, m.s);
    const t = md(clone);
    const i1 = t.indexOf(S1);
    const i2 = t.indexOf(S2);
    const text = t.replaceAll(S1, '').replaceAll(S2, '');
    // a table's columns are padded to their widest cell, a marker counted in it: the text unmarked,
    // and each marker by its cell (row, column, offset in the cell's text)
    const plain = md(el);
    if (plain !== text && /^\s*\|.*\|\s*$/m.test(plain)) {
      const cellAt = (marked: string, m: string): number => {
        const i = marked.indexOf(m);
        if (i < 0) return -1;
        const lineStart = marked.lastIndexOf('\n', i - 1) + 1;
        const row = marked.slice(0, lineStart).split('\n').length - 1;
        const upTo = marked.slice(lineStart, i);
        const column = (upTo.match(/\|/g) ?? []).length;
        const inCell = upTo.split('|').pop()!.trimStart().length;
        const lines = plain.split('\n');
        const line = lines[row] ?? '';
        let at = 0;
        for (let j = 0, pipes = 0; j < line.length && pipes < column; j++) if (line[j] === '|' && ++pipes === column) at = j + 1;
        const rest = line.slice(at);
        return lines.slice(0, row).reduce((n, l) => n + l.length + 1, 0) + at + (rest.length - rest.trimStart().length) + inCell;
      };
      return { text: plain, at: { [S1]: cellAt(t.replaceAll(S2, ''), S1), [S2]: cellAt(t.replaceAll(S1, ''), S2) } };
    }
    return {
      text,
      at: { [S1]: i1 < 0 ? -1 : i1 - (i2 >= 0 && i2 < i1 ? 1 : 0), [S2]: i2 < 0 ? -1 : i2 - (i1 >= 0 && i1 < i2 ? 1 : 0) },
    };
  };
  // the caret, if it is in the document
  const s = getSelection();
  const inDoc = (n: Node | null): boolean => !!n && wys.contains(n) && !!document.activeElement && wys.contains(document.activeElement);
  const caretIn = s && s.rangeCount && inDoc(s.anchorNode) && inDoc(s.focusNode) ? s : null;
  const blocks: Block[] = [];
  let anchor: [number, number] | null = null;
  let head: [number, number] | null = null;
  // a free block's escape at its start (`\- x`: SiYuan keeps a paragraph's backslash), off, as the
  // projection has a block's text: the block needs none there (a number's, `1\.`, isn't at the start)
  const lead = (g: Group, el: HTMLElement): number => (g.free && el === g.els[0] && /^\\[!-/:-@[-`{-~]/.test(md(el)) ? 1 : 0);
  const less = (at: number, l: number): number => (l && at > 0 ? at - 1 : at);
  groups.forEach((g, k) => {
    const parts: string[] = [];
    let base = g.prefix.length;
    for (const el of g.els) {
      const marks: { node: Node; offset: number; s: string }[] = [];
      if (caretIn && el.contains(caretIn.anchorNode)) marks.push({ node: caretIn.anchorNode!, offset: caretIn.anchorOffset, s: S1 });
      if (caretIn && el.contains(caretIn.focusNode)) marks.push({ node: caretIn.focusNode!, offset: caretIn.focusOffset, s: S2 });
      const l = lead(g, el);
      const { text: marked, at } = withMarks(el, marks);
      const text = marked.slice(l);
      if (at[S1]! >= 0) anchor = [k, base + less(at[S1]!, l)];
      if (at[S2]! >= 0) head = [k, base + less(at[S2]!, l)];
      parts.push(text);
      base += text.length + 1;
    }
    blocks.push({ depth: g.depth, text: g.prefix + parts.join('\n'), ...(g.free && { free: true as const }) });
  });
  // a caret or selection within one block (one across blocks has no place in the model)
  const [a0, h0] = [anchor as [number, number] | null, head as [number, number] | null];
  const sel: Raw['sel'] = a0 && h0 && a0[0] === h0[0] ? { block: a0[0], anchor: a0[1], head: h0[1] } : null;
  const selected = groups.map((g, k) => (g.holder.classList.contains('protyle-wysiwyg--select') || g.els.some((e) => e.classList.contains('protyle-wysiwyg--select')) ? k : -1)).filter((k) => k >= 0);
  const owns = groups.map((g) => g.owns);
  if (!want) return { blocks, owns, sel, selected };

  // placing: the DOM position whose Markdown offset is the one wanted, in the block's own elements
  const g = groups[want.block];
  if (!g) return { blocks, owns, sel, selected, placed: `no block ${want.block}` };
  const find = (offset: number): { node: Node; offset: number; el: HTMLElement } | null => {
    let base = g.prefix.length;
    for (const el of g.els) {
      const ce = (el.querySelector('[contenteditable="true"]') as HTMLElement | null) ?? el;
      const candidates: { node: Node; offset: number }[] = [];
      const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
      // not before the escape of three backticks: it joins the character before it, a user's caret
      // goes past them both
      for (let t = walker.nextNode() as Text | null; t; t = walker.nextNode() as Text | null) for (let i = 0; i <= t.data.length; i++) if (t.data[i] !== '‍') candidates.push({ node: t, offset: i });
      if (!candidates.length) candidates.push({ node: ce, offset: 0 });
      const l = lead(g, el);
      for (const c of candidates) {
        const { at } = withMarks(el, [{ ...c, s: S1 }]);
        if (base + less(at[S1]!, l) === offset) return { ...c, el: ce };
      }
      base += md(el).length - l + 1;
    }
    return null;
  };
  const a = find(want.anchor);
  const h = want.head === want.anchor ? a : find(want.head);
  if (!a || !h) return { blocks, owns, sel, selected, placed: `no place for ${!a ? want.anchor : want.head} in "${blocks[want.block]?.text}"` };
  a.el.focus();
  getSelection()!.setBaseAndExtent(a.node, a.offset, h.node, h.offset);
  return { blocks, owns, sel, selected, placed: 'placed' };
}

/** Each kernel's test notebook (by its origin): `ourus sxs`, made if its workspace has none. */
const notebooks = new Map<string, string>();
async function notebookId(origin: string): Promise<string> {
  const known = notebooks.get(origin);
  if (known) return known;
  const { notebooks: all } = await api<{ notebooks: { id: string; name: string }[] }>(origin, 'notebook/lsNotebooks');
  const id = all.find((n) => n.name === 'ourus sxs')?.id ?? (await api<{ notebook: { id: string } }>(origin, 'notebook/createNotebook', { name: 'ourus sxs' })).notebook.id;
  notebooks.set(origin, id);
  return id;
}

/** Documents are named for the run and numbered within it. */
const run = Date.now().toString(36);
let docs = 0;
/** A worker's (`perPage`): its kernel, and its current test's document ('' before its first). */
const pageState = perPage(() => ({ kernel: null as Kernel | null, current: '' }));
/** The kernels whose earlier runs' documents are gone (by origin): removed by the run's first test on each. */
const swept = new Set<string>();

/**
 * The kernel of a worker's page, held for the worker: the one `open` leased, or, for a window an
 * earlier run left, the one it is on (by its port), which throws if another worker holds it: the
 * runner then opens a window anew, on a kernel of its own.
 */
async function kernelFor(page: Page): Promise<Kernel> {
  const state = pageState(page);
  if (!state.kernel) {
    const k = kernelOfPage(page.url());
    await holdKernel(k);
    state.kernel = k;
  }
  return state.kernel;
}

export const driver: Driver = {
  shortId: 'SY',
  longId: 'siyuan',
  displayName: 'SiYuan',
  url: `${kernelOf(0).origin}/stage/build/desktop/`,
  // its UI on every kernel's port
  scope: 'http://127.0.0.1:',
  model: 'block',
  // paragraphs, headings and code are blocks outside every list, and in items, as the spec's buffers
  // have them; list items the rest
  freeForm: true,
  // a kernel for each worker (kernel.ts)
  parallel: 4,
  // structured paste in the middle of a block's text goes after it; a typed fence is left open
  // (Backtick2, Backtick12, Backtick15)
  behaves: {
    enterSplitSpace: 'start',
    // Backspace at an item's text start: a paragraph in the item above (Backspace1, Backspace8)
    backspaceAtItemStart: 'body',
    // Enter on an empty item, but the last of its list: a paragraph where it is (Enter7, Enter27)
    enterOnEmptyItem: 'unwrap',
    // Backspace right after a task's checkbox: a paragraph where it is (TaskBackspace2, TaskBackspace3)
    taskEditing: 'unwrap',
    closeBackticks: 'none',
    pasteAtTextStart: 'before',
    pasteOnParent: 'after',
    pasteParagraphList: 'children',
  },
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "Move up", "Move down" (⇧⌘↑, ⇧⌘↓)
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    // "Duplicate" (⌘D): the block being edited, which in an item is its paragraph, not the item
    duplicateSubtree: 'Control+d',
    // no `deleteSubtree`: Escape puts the item's paragraph in block selection, Space selects it, and
    // Backspace empties it, the item and its children staying; an item is selected by its bullet, a click
    // no command: selecting to the line's start, then deleting
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // a code or math block is a block of its own, its fences no text: a caret on one has no place
  // (`holds`); a join into code, or of code lines that make a fence, is SiYuan's to show
  refuses: [],
  ordered: true,
  holds: (doc) => holds(doc as Outline),
  idle: {
    // edits go to the kernel (a transaction), undo and redo come back from it: a request owed is work
    busy: '(window.__sxsFetching?.() ?? 0) > 0',
  },

  async open(page: Page) {
    // a kernel of the worker's own, running, its UI loaded
    const k = await leaseKernel();
    await serve(k, (line) => console.log(line));
    pageState(page).kernel = k;
    await page.goto(`${k.origin}/stage/build/desktop/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => (window as any).siyuan?.isReady && (window as any).__ourusSxs, null, { timeout: 60000 });
    // the requests the page owes, counted (the busy signal)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__sxsFetching) return;
      const f = window.fetch.bind(window);
      let n = 0;
      window.fetch = (...a: Parameters<typeof fetch>) => (n++, f(...a).finally(() => n--));
      w.__sxsFetching = () => n;
    });
    const idle = () => page.evaluate((busy) => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000, busy }), this.idle!.busy!);
    await idle();
    // ready once a key does what it should: Tab indents
    await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
    await idle();
    await page.keyboard.press('Tab');
    await idle();
    if (((await this.read(page)) as Outline).blocks[1]?.depth !== 1) throw new Error("SiYuan's keys didn't come up: Tab doesn't indent");
    return page.evaluate(() => (window as any).siyuan.config.system.kernelVersion as string);
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const { origin } = await kernelFor(page);
    const nb = await notebookId(origin);
    const id = await api<string>(origin, 'filetree/createDocWithMd', { notebook: nb, path: `/ourus-sxs-${run}-${String(++docs).padStart(5, '0')}`, markdown: markdownOf(o.blocks) });
    await page.evaluate((id) => (window as any).__ourusSxs.open(id), id);
    await page.waitForFunction((id) => {
      const p = (window as any).__ourusSxs.editor()?.protyle;
      return p?.block.rootID === id && p.wysiwyg.element.querySelector('[data-node-id]');
    }, id);
    // the worker's last test's document removed (its tab closes with it); at the run's first on the
    // kernel, every earlier run's there (named for another run)
    const state = pageState(page);
    const old = state.current ? [state.current] : [];
    if (!swept.has(origin)) {
      swept.add(origin);
      const files = (await api<{ files: { id: string; name: string }[] }>(origin, 'filetree/listDocsByPath', { notebook: nb, path: '/' })).files;
      old.push(...files.filter((f) => !f.name.startsWith(`ourus-sxs-${run}-`)).map((f) => f.id));
    }
    for (const d of old) await api(origin, 'filetree/removeDocByID', { id: d }).catch(() => {});
    state.current = id;
    const idle = () => page.evaluate((busy) => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 60, timeout: 5000, busy }), this.idle!.busy!);
    await idle();
    if (!o.sel) {
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      return;
    }
    // a caret with no place in what SiYuan made of the start is left to the runner's load check, which says what it made
    await page.evaluate(inPage, o.sel);
    await idle();
  },

  async read(page: Page) {
    const r = await page.evaluate(inPage, null);
    return { blocks: ownBlocks(r.blocks, (_, i) => r.owns[i]!), sel: r.sel, ...(r.selected.length && { selected: r.selected }) };
  },
};
