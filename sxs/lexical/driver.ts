/// <reference lib="dom" />
// Lexical (https://lexical.dev/, see README.md): Meta's editor framework, driven in its playground
// (https://playground.lexical.dev/: the framework's own demo of its rich-text editor, with lists, code,
// quotes and tables), opened empty and without its debug view (`?emptyEditor=true&showTreeView=false`),
// no collaboration, saving nothing.
//
// The editor is on its root element (`__lexicalEditor`). A test's outline goes in as a serialized
// editor state (`parseEditorState`, `setEditorState`), then the history is cleared (the playground's
// `CLEAR_HISTORY_COMMAND`, found among the editor's commands by its name), so undo stays within the
// test. The caret is a DOM selection in the block's element, which Lexical takes as its own. Reading is
// the editor state's nodes (`_nodeMap`, walked by `__first` and `__next`) and its selection.
//
// In free form: a paragraph, a heading, a quote or code is a block outside every list (`free`), a
// list item an item. Lexical's top level is a sequence of blocks and lists, a nested list held by an
// item of its own (`<li><ul>…</ul></li>`), and no block but a list item holds another: what a free
// block owns in ourus's outline is beside it in Lexical, as in Markdown (`liftOwned`), and owned again
// as it is read (`asMarkdownReads`). A paragraph's indent (Ctrl+] on a paragraph) is a padding Markdown
// has no form for: it isn't read.

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { asMarkdownReads, liftOwned, runsAsMarkdown, type Block, type Outline, type Run } from '../lib/block.ts';

/** Lexical's keys for the spec's motions; the `select…` motions add Shift. */
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

/** A serialized Lexical node, as `parseEditorState` takes it. */
type LxNode = Record<string, unknown> & { type: string; children?: LxNode[] };

/** A block of the outline as Lexical's: its kind, its text, how long its prefix is, and an escape's place (`cut`). */
interface LxBlock {
  kind: 'paragraph' | 'heading' | 'quote' | 'code' | 'bullet' | 'number' | 'check';
  text: string;
  tag?: string;
  language?: string;
  checked?: boolean;
  number?: number;
  prefix: number;
  cut?: number;
}

/** A block's canonical text as Lexical's: a free block a paragraph, or by its text a heading, a quote or code; an item a bullet, numbered or a to-do. */
function toLexical(text: string, free: boolean): LxBlock {
  const heading = /^(#{1,6}) /.exec(text);
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (free && heading) return { kind: 'heading', tag: `h${heading[1]!.length}`, text: text.slice(heading[0].length), prefix: heading[0].length };
  if (free && fence) return { kind: 'code', text: fence[2]!, language: fence[1] || undefined, prefix: 4 + fence[1]!.length };
  if (free && text.startsWith('> ')) return { kind: 'quote', text: text.slice(2), prefix: 2 };
  const task = free ? null : /^\[([ xX])\] /.exec(text);
  if (task) return { kind: 'check', checked: task[1] !== ' ', text: text.slice(4), prefix: 4 };
  const numbered = free ? null : /^(\d{1,9})\. /.exec(text);
  const prefix = numbered?.[0].length ?? 0;
  const kind = free ? 'paragraph' : numbered ? 'number' : 'bullet';
  const base = { kind, prefix, ...(numbered && { number: Number(numbered[1]) }) } as const;
  // a number that is text (after a numbered item's own number too): the escape's backslash off
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(text.slice(prefix));
  if (literal) return { ...base, text: literal[1] + text.slice(prefix + literal[0].length), cut: prefix + literal[1]!.length };
  return { ...base, text: text.slice(prefix) };
}

/** A canonical offset in a block's text as one in Lexical's, the prefix and an escape (`cut`) taken off. */
const appOffset = (offset: number, at: { prefix: number; cut?: number }): number => Math.max(0, offset - at.prefix - (at.cut !== undefined && offset > at.cut ? 1 : 0));

/** Starts Lexical can't hold. */
function holds(o: Outline): string | undefined {
  const blocks = liftOwned(o.blocks);
  for (const b of blocks) {
    if (b.free && b.depth > 0) return 'block in a list item (a list item holds text alone)';
    if (b.free) continue;
    if (/^#{1,6} /.test(b.text)) return 'heading as a list item (a heading is a block of its own)';
    if (/^```/.test(b.text)) return 'code block as a list item (a code block is a block of its own)';
    if (b.text.startsWith('> ')) return 'quote as a list item (a quote is a block of its own)';
  }
  // a list is of one kind (bullets, numbers or to-dos) and numbers count on from its first
  const last: ({ kind: string; n?: number } | null)[] = [];
  for (const b of blocks) {
    last.length = b.depth + 1;
    if (b.free) {
      last[b.depth] = null;
      continue;
    }
    const at = toLexical(b.text, false);
    const prev = last[b.depth];
    // (at the top level, items of another kind are a list of their own, after the first)
    if (prev && prev.kind !== at.kind && b.depth > 0) return 'nested list of items of more than one kind (a list is bullets, numbers or to-dos)';
    if (prev && prev.kind !== at.kind) {
      last[b.depth] = { kind: at.kind, n: at.number };
      continue;
    }
    if (prev && at.kind === 'number' && at.number !== prev.n! + 1) return "numbered list that doesn't count on";
    last[b.depth] = { kind: at.kind, n: at.number };
  }
  if (!o.sel) return undefined;
  const b = blocks[o.sel.block]!;
  const at = toLexical(b.text, !!b.free);
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  if (from < at.prefix) return at.kind === 'check' ? "caret in a task's checkbox" : at.kind === 'number' ? "caret in an item's number" : at.kind === 'quote' ? "caret in a quote's >" : at.kind === 'code' ? "caret on a code block's fence" : "caret in a heading's #s";
  if (at.kind === 'code' && to > at.prefix + at.text.length) return "caret on a code block's fence";
  return undefined;
}

/** A block's text as Lexical's inline nodes: text, a line break between lines, a tab for a tab. */
function inline(text: string, code: boolean): LxNode[] {
  const out: LxNode[] = [];
  for (const [i, line] of text.split('\n').entries()) {
    if (i) out.push({ type: 'linebreak', version: 1 });
    for (const [j, part] of line.split('\t').entries()) {
      if (j) out.push({ type: 'tab', detail: 2, format: 0, mode: 'normal', style: '', text: '\t', version: 1 });
      if (part) out.push({ type: code ? 'code-highlight' : 'text', detail: 0, format: 0, mode: 'normal', style: '', text: part, version: 1 });
    }
  }
  return out;
}

const element = (type: string, children: LxNode[], more: Record<string, unknown> = {}): LxNode => ({ type, children, direction: null, format: '', indent: 0, version: 1, ...more });

/** The outline's blocks as Lexical's serialized root's children: free blocks, and lists, nested as Lexical nests them. */
function serialize(blocks: readonly Block[]): LxNode[] {
  const top: LxNode[] = [];
  // the open list at each depth
  const lists: LxNode[] = [];
  for (const b of blocks) {
    const at = toLexical(b.text, !!b.free);
    if (b.free) {
      lists.length = 0;
      if (at.kind === 'heading') top.push(element('heading', inline(at.text, false), { tag: at.tag }));
      else if (at.kind === 'quote') top.push(element('quote', inline(at.text, false)));
      else if (at.kind === 'code') top.push(element('code', inline(at.text, true), { language: at.language ?? null }));
      else top.push(element('paragraph', inline(at.text, false), { textFormat: 0, textStyle: '' }));
      continue;
    }
    lists.length = b.depth + 1;
    let list = lists[b.depth];
    // a list is of one kind: at the top level an item of another kind starts a list of its own
    if (list && b.depth === 0 && list.listType !== at.kind) list = undefined;
    if (!list) {
      const listType = at.kind as 'bullet' | 'number' | 'check';
      list = element('list', [], { listType, start: at.number ?? 1, tag: listType === 'number' ? 'ol' : 'ul' });
      if (b.depth === 0) top.push(list);
      // a nested list is held by an item of its own, after the item it is under
      else lists[b.depth - 1]!.children!.push(element('listitem', [list], { value: lists[b.depth - 1]!.children!.length + 1 }));
      lists[b.depth] = list;
    }
    const value = (list.start as number) + list.children!.filter((c) => !c.children!.some((x) => x.type === 'list')).length;
    list.children!.push(element('listitem', inline(at.text, false), { value, ...(at.kind === 'check' && { checked: at.checked }) }));
  }
  return top;
}

/** A block as the page reads it: its canonical text but for its content, which is `runs` (formatted) or `plain`. */
interface PageBlock {
  depth: number;
  prefix: string;
  suffix: string;
  runs: Run[] | null;
  plain: string;
  cut?: number;
  free: boolean;
}

/** In the page: the blocks, and the caret (by block and offset in its content). */
function readPage(): { blocks: PageBlock[]; sel: { block: number; anchor: number; head: number } | null } {
  const root = document.querySelector('[data-lexical-editor="true"]') as any;
  const st = root.__lexicalEditor.getEditorState();
  const map: Map<string, any> = st._nodeMap;
  const kids = (key: string): string[] => {
    const out: string[] = [];
    for (let k = map.get(key).__first; k; k = map.get(k).__next) out.push(k);
    return out;
  };
  const flat: (PageBlock & { key: string })[] = [];
  /** Each block's text nodes and elements inside it, by key: where its text starts in the block's. */
  const starts = new Map<string, { block: number; start: number }>();
  const textOf = (key: string): string => {
    const n = map.get(key);
    if (n.__type === 'linebreak') return '\n';
    if (typeof n.__text === 'string') return n.__text;
    return kids(key).map(textOf).join('');
  };
  // inline content as runs (Lexical's format bits: 1 bold, 2 italic, 4 strikethrough, 16 code), its
  // text nodes' places noted
  const runsOf = (keys: string[], block: number, from: number, href?: string): { runs: Run[]; end: number } => {
    const runs: Run[] = [];
    let at = from;
    for (const k of keys) {
      const n = map.get(k);
      starts.set(k, { block, start: at });
      if (n.__type === 'link' || n.__type === 'autolink') {
        const inner = runsOf(kids(k), block, at, n.__url);
        runs.push(...inner.runs);
        at = inner.end;
        continue;
      }
      const t = textOf(k);
      const f = n.__format ?? 0;
      runs.push({ text: t, ...(f & 1 && { bold: true }), ...(f & 2 && { italic: true }), ...(f & 4 && { strike: true }), ...(f & 16 && { code: true }), ...(href !== undefined && { href }) });
      at += t.length;
    }
    return { runs, end: at };
  };
  const push = (key: string, depth: number, prefix: string, suffix: string, free: boolean, code: boolean, inlineKeys: string[]) => {
    const block = flat.length;
    starts.set(key, { block, start: 0 });
    const { runs } = runsOf(inlineKeys, block, 0);
    const plain = runs.map((r) => r.text).join('');
    const cut = !code && !prefix.startsWith('[') && /^\d{1,9}[.)]/.test(plain) ? /^\d+/.exec(plain)![0].length : undefined;
    flat.push({ key, depth, prefix, suffix, runs: code ? null : runs, plain, ...(cut !== undefined && { cut }), free });
  };
  const walkList = (key: string, depth: number) => {
    const list = map.get(key);
    kids(key).forEach((li, k) => {
      const children = kids(li);
      const nested = children.filter((c) => map.get(c).__type === 'list');
      const inl = children.filter((c) => map.get(c).__type !== 'list');
      // an item holding only a nested list is the item above's (Lexical's form of a child list), but
      // first in its list (an item indented with none above it) it is an empty item, as its HTML reads
      if (inl.length || !nested.length || k === 0) {
        const item = map.get(li);
        const prefix = list.__listType === 'number' ? `${item.__value}. ` : list.__listType === 'check' ? (item.__checked ? '[x] ' : '[ ] ') : '';
        push(li, depth, prefix, '', false, false, inl);
      }
      for (const n of nested) walkList(n, depth + 1);
    });
  };
  for (const key of kids('root')) {
    const n = map.get(key);
    if (n.__type === 'list') walkList(key, 0);
    else if (n.__type === 'heading') push(key, 0, `${'#'.repeat(Number(String(n.__tag).slice(1)))} `, '', true, false, kids(key));
    else if (n.__type === 'quote') push(key, 0, '> ', '', true, false, kids(key));
    else if (n.__type === 'code') {
      const t = textOf(key);
      // its fence longer than a run of backticks starting one of its lines, as Markdown needs
      const ticks = '`'.repeat(Math.max(3, ...[...t.matchAll(/^ {0,3}(`+)/gm)].map((x) => x[1]!.length + 1)));
      push(key, 0, `${ticks}${n.__language && n.__language !== 'plain' ? n.__language : ''}\n`, `\n${ticks}`, true, true, kids(key));
    } else if (n.__type === 'paragraph') push(key, 0, '', '', true, false, kids(key));
    else push(key, 0, `<${n.__type}> `, '', true, false, []);
  }
  // the caret: Lexical's range selection, while the editor has the focus, both ends in one block
  const sel = st._selection;
  const point = (p: any): { block: number; offset: number } | null => {
    const s = starts.get(p.key);
    if (!s) return null;
    if (p.type === 'text') return { block: s.block, offset: s.start + p.offset };
    // an element point: before its `offset`th child
    const before = kids(p.key).slice(0, p.offset);
    return { block: s.block, offset: s.start + before.map(textOf).join('').length };
  };
  let caret: { block: number; anchor: number; head: number } | null = null;
  if (document.activeElement === root && sel?.anchor && sel?.focus) {
    const a = point(sel.anchor);
    const h = point(sel.focus);
    if (a && h && a.block === h.block) caret = { block: a.block, anchor: a.offset, head: h.offset };
  }
  return { blocks: flat.map(({ key, ...b }) => b), sel: caret };
}

/** In the page: the outline loaded, the history cleared, the caret placed (block, offsets past its prefix). */
async function loadPage({ children, at }: { children: LxNode[]; at: { block: number; anchor: number; head: number } | null }): Promise<string> {
  const root = document.querySelector('[data-lexical-editor="true"]') as any;
  const ed = root.__lexicalEditor;
  root.blur();
  ed.setEditorState(ed.parseEditorState({ root: { children, direction: null, format: '', indent: 0, type: 'root', version: 1 } }));
  const clear = [...ed._commands.keys()].find((c: any) => c.type === 'CLEAR_HISTORY_COMMAND');
  if (!clear) return 'no CLEAR_HISTORY_COMMAND';
  ed.dispatchCommand(clear, undefined);
  await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
  if (!at) return 'no caret';
  // the block's element: the blocks in the order `readPage` walks them
  const map: Map<string, any> = ed.getEditorState()._nodeMap;
  const kids = (key: string): string[] => {
    const out: string[] = [];
    for (let k = map.get(key).__first; k; k = map.get(k).__next) out.push(k);
    return out;
  };
  const blocks: string[] = [];
  const walkList = (key: string) => {
    kids(key).forEach((li, k) => {
      const children = kids(li);
      const nested = children.filter((c) => map.get(c).__type === 'list');
      if (children.length > nested.length || !nested.length || k === 0) blocks.push(li);
      nested.forEach(walkList);
    });
  };
  for (const key of kids('root')) (map.get(key).__type === 'list' ? walkList(key) : blocks.push(key));
  const el = ed.getElementByKey(blocks[at.block]) as HTMLElement | null;
  if (!el) return `no block ${at.block}`;
  // an offset in the block's text as a DOM point: its text nodes, a <br> one character (a line break),
  // a nested list's items not the block's
  const where = (offset: number): [Node, number] => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: (n) => ((n as Element).tagName === 'UL' || (n as Element).tagName === 'OL' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let left = offset;
    let last: Node | null = null;
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 1 && (n as Element).tagName === 'BR') {
        if (left === 0) return [n.parentNode!, [...n.parentNode!.childNodes].indexOf(n as ChildNode)];
        left -= 1;
        continue;
      }
      if (n.nodeType !== 3) continue;
      const len = (n as Text).length;
      if (left <= len) return [n, left];
      left -= len;
      last = n;
    }
    return last ? [last, (last as Text).length] : [el, 0];
  };
  root.focus({ preventScroll: true });
  const s = getSelection()!;
  s.collapse(...where(at.anchor));
  s.extend(...where(at.head));
  await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
  return document.activeElement === root ? 'placed' : 'the editor lost the focus';
}

export const driver: Driver = {
  shortId: 'LX',
  longId: 'lexical',
  displayName: 'Lexical',
  url: 'https://playground.lexical.dev/?emptyEditor=true&showTreeView=false',
  model: 'block',
  // a block's text holds line breaks (Shift+Enter), a blank line its paragraphs apart
  paragraphsInBlock: true,
  // paragraphs, headings, quotes and code are blocks outside every list; list items the rest
  freeForm: true,
  // measured with `--ignore-options` (2026-10-26): each value agrees where ourus's default doesn't
  behaves: {
    // its top level a sequence of blocks and lists: a list after a paragraph is no block's
    listParent: 'container',
    // Enter at a block's text start: the caret stays with the text (Enter26b, Enter29b; Enter26,
    // Enter29 and Enter32 differ only by the caret)
    enterAtTextStart: 'stay',
    // Enter in a quote splits it, the rest a block of its own (QuoteText21, QuoteAtom4)
    enterInQuote: 'split',
    // a heading is the block's type, kept through a join (Backspace18b, Backspace18f, Delete13b,
    // Delete13d, Delete13f)
    headingEditing: 'block',
    // pasted plain lines as typed with Enter between them (PastePlain31, Quirk4)
    pastePlainLines: 'enter',
  },
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    // the playground's "Indent" and "Outdent" (Ctrl+], Ctrl+[): Tab indents only at a line's start
    // (or with a selection) and types a tab elsewhere (Lexical's TabIndentationPlugin), which would
    // measure that rather than how Lexical indents
    indent: 'Control+BracketRight',
    outdent: 'Control+BracketLeft',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // no command: selecting to the line's start, then deleting
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    // (a capital: the shortcut tables match the key Shift makes)
    pastePlain: 'Control+Shift+V',
    undo: 'Control+z',
    redo: 'Control+Shift+Z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // a code block is a block of its own, its fences no text. Tables, equations and rules are nodes of
  // their own, which the driver doesn't make: skipped, with Markdown's other atoms
  refuses: ['markup-fence', 'table', 'math', 'thematic break', 'html', 'link reference definition', 'comment', 'footnote'],
  ordered: true,
  holds: (doc) => holds(doc as Outline),

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => (document.querySelector('[data-lexical-editor="true"]') as any)?.__lexicalEditor, null, { timeout: 120000 });
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000 }));
    await idle();
    // ready once a key does what it should: Ctrl+] nests an item
    await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
    await idle();
    await page.keyboard.press('Control+BracketRight');
    await idle();
    if (((await this.read(page)) as Outline).blocks[1]?.depth !== 1) throw new Error("Lexical's keys didn't come up: Ctrl+] doesn't nest an item");
    return page.evaluate(() => String((document.querySelector('[data-lexical-editor="true"]') as any).__lexicalEditor.constructor.version).replace(/\.esm$/, ''));
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const blocks = liftOwned(o.blocks);
    const at = o.sel && toLexical(blocks[o.sel.block]!.text, !!blocks[o.sel.block]!.free);
    const placed = await page.evaluate(loadPage, {
      children: serialize(blocks),
      at: o.sel && at ? { block: o.sel.block, anchor: appOffset(o.sel.anchor, at), head: appOffset(o.sel.head, at) } : null,
    });
    if (placed !== 'placed' && placed !== 'no caret') throw new Error(`the caret has no place: ${placed}`);
  },

  async read(page: Page) {
    const r = await page.evaluate(readPage);
    const texts = r.blocks.map((b) => {
      const md = b.runs ? runsAsMarkdown(b.runs) : { text: b.plain, at: (p: number) => p };
      const cut = b.cut !== undefined ? md.at(b.cut) : -1;
      const body = cut >= 0 ? `${md.text.slice(0, cut)}\\${md.text.slice(cut)}` : md.text;
      return { text: b.prefix + body + b.suffix, at: (p: number) => b.prefix.length + md.at(p) + (b.cut !== undefined && p > b.cut ? 1 : 0) };
    });
    const sel = r.sel && { block: r.sel.block, anchor: texts[r.sel.block]!.at(r.sel.anchor), head: texts[r.sel.block]!.at(r.sel.head) };
    // (a heading's section, beside it in Lexical, owned as ourus's outline has it; a list after a
    // paragraph owned as `listParent` says)
    const blocks: Block[] = r.blocks.map(({ depth, free }, i) => ({ depth, text: texts[i]!.text, ...(free && { free: true as const }) }));
    return { blocks: asMarkdownReads(blocks, driver.behaves?.listParent), sel };
  },
};
