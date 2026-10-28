/// <reference lib="dom" />
// BlockNote (https://www.blocknotejs.org/, see README.md): a block editor of Notion's kind, a library
// on ProseMirror and Tiptap, driven in its site's minimal example (the library's default editor, no
// collaboration, saving nothing). The site's demo page is collaborative (a Yjs room on a server of
// its own, shared with whoever has the link), so it isn't the one driven.
//
// BlockNote's editor is found through React (the `editor` prop of `BlockNoteView`, on its container's
// fiber); a test's outline goes in through its API (`replaceBlocks`: a free block a paragraph, or by
// its text a heading or a code block; an item a bullet, numbered or check list item), then the
// editor's ProseMirror state is
// made anew from the same document and plugins, so the history is empty and undo stays within the
// test. The caret is a ProseMirror selection, by block and offset; reading is `editor.document`, each
// block's text as the spec's canonical form has it (`[ ] `, `## `, a fence). In free form: a
// paragraph, a heading or code is a block outside every list (`free`), as BlockNote's are, and what one
// owns in ourus's outline (a heading its section, a paragraph the list after it) is beside it in
// BlockNote, as in Markdown (`liftOwned`). Any block of BlockNote's may hold children (Tab nests a
// list item under a paragraph), which Markdown can't say of a paragraph: read back, what a free block
// holds is beside it, as its Markdown reads, then owned as `listParent` says (`asMarkdownReads`).

import type { Page } from 'playwright-core';
import type { Driver, Drop } from '../lib/driver.ts';
import { asMarkdownReads, liftOwned, runsAsMarkdown, Unsupported, type Block, type Outline, type Run, type Sel } from '../lib/block.ts';
import { gesture, type Point } from '../lib/drag.ts';

/** BlockNote's keys for the spec's motions; the `select…` motions add Shift. */
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

/** A block of BlockNote's, as `replaceBlocks` takes it. */
interface BnBlock {
  type: string;
  props?: Record<string, unknown>;
  content?: string;
  children: BnBlock[];
}

/**
 * A block's canonical text as BlockNote's: its type, props and text, and how long its prefix is; and
 * where a number that is text has its escape (`1\. x`), which BlockNote's text hasn't (`cut`). A free
 * block (outside every list, `Block.free`) is a paragraph, or by its text a heading, a code block or a
 * quote;
 * an item a list item: a task, numbered or a bullet.
 */
function toBlockNote(text: string, free = false): { block: Omit<BnBlock, 'children'>; prefix: number; cut?: number } {
  const heading = /^(#{1,6}) /.exec(text);
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (free && heading) return { block: { type: 'heading', props: { level: heading[1]!.length }, content: text.slice(heading[0].length) }, prefix: heading[0].length };
  if (free && fence) return { block: { type: 'codeBlock', props: { language: fence[1] || 'text' }, content: fence[2] }, prefix: 4 + fence[1]!.length };
  if (free && text.startsWith('> ')) return { block: { type: 'quote', content: text.slice(2) }, prefix: 2 };
  const task = free ? null : /^\[([ xX])\] /.exec(text);
  if (task) return { block: { type: 'checkListItem', props: { checked: task[1] !== ' ' }, content: text.slice(4) }, prefix: 4 };
  // a numbered block, numbered as its run of them is (`nest` gives the run its first number)
  const numbered = free ? null : /^(\d{1,9})\. /.exec(text);
  const prefix = numbered?.[0].length ?? 0;
  const type = free ? 'paragraph' : numbered ? 'numberedListItem' : 'bulletListItem';
  // a number that is text (after a numbered block's own number too): the escape's backslash off
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(text.slice(prefix));
  if (literal) return { block: { type, content: literal[1] + text.slice(prefix + literal[0].length) }, prefix, cut: prefix + literal[1]!.length };
  return { block: { type, content: text.slice(prefix) }, prefix };
}

/** A canonical offset in a block's text as one in BlockNote's, the prefix and an escape (`cut`) taken off. */
const appOffset = (offset: number, at: { prefix: number; cut?: number }): number => Math.max(0, offset - at.prefix - (at.cut !== undefined && offset > at.cut ? 1 : 0));

/**
 * Starts BlockNote can't hold, measured (each was a start the load check found held otherwise): a
 * caret where a block's text has no place in BlockNote, its markup being a widget or the block's type.
 */
function holds(o: Outline): string | undefined {
  // a list item is a list item's text: BlockNote's headings, code blocks and quotes are blocks of their own
  for (const b of o.blocks) {
    if (b.free) continue;
    if (/^#{1,6} /.test(b.text)) return 'heading as a list item (a heading is a block of its own)';
    if (/^```/.test(b.text)) return 'code block as a list item (a code block is a block of its own)';
    if (b.text.startsWith('> ')) return 'quote as a list item (a quote is a block of its own)';
  }
  // numbered siblings that don't count on (`1. a`, `1. b`): BlockNote numbers a run of them on from its
  // first, whose `start` alone it draws (measured)
  const last: (number | null)[] = [];
  for (const b of o.blocks) {
    last.length = b.depth + 1;
    const n = !b.free && /^(\d{1,9})\. /.exec(b.text);
    if (n && last[b.depth] != null && Number(n[1]) !== last[b.depth]! + 1) return 'numbered list right after another (BlockNote numbers them as one)';
    last[b.depth] = n ? Number(n[1]) : null;
  }
  if (!o.sel) return undefined;
  const text = o.blocks[o.sel.block]!.text;
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  // a task's checkbox is drawn, not text
  if (/^\[[ xX]\] /.test(text) && from < 4) return "caret in a task's checkbox";
  // a heading's #s are its level, not text: the caret goes to the title's start (Enter55)
  const hashes = /^#{1,6} /.exec(text);
  if (hashes && from < hashes[0].length) return "caret in a heading's #s";
  // and a quote's `>` its type
  if (o.blocks[o.sel.block]!.free && text.startsWith('> ') && from < 2) return "caret in a quote's >";
  // a code block's editor has the code alone, its language a menu
  const fence = /^```[^\n`]*\n([\s\S]*?)\n?```$/.exec(text);
  if (fence) {
    const start = text.indexOf('\n') + 1;
    const end = start + fence[1]!.length;
    if (from < start || to > end) return "caret on a code block's fence";
  }
  return undefined;
}

/** The outline's blocks as BlockNote's, nested by depth. */
function nest(blocks: readonly Block[]): BnBlock[] {
  const roots: BnBlock[] = [];
  const stack: BnBlock[] = [];
  for (const b of blocks) {
    const bn: BnBlock = { ...toBlockNote(b.text, !!b.free).block, children: [] };
    stack.length = b.depth;
    const siblings = b.depth === 0 ? roots : stack[b.depth - 1]!.children;
    // a run of numbered blocks counts on from its first's number, the one it was written with
    const n = /^(\d{1,9})\. /.exec(b.text);
    if (bn.type === 'numberedListItem' && siblings[siblings.length - 1]?.type !== 'numberedListItem' && n && n[1] !== '1') bn.props = { start: Number(n[1]) };
    siblings.push(bn);
    stack[b.depth] = bn;
  }
  return roots;
}

/** In the page: BlockNote's editor (found through React) and its ProseMirror view, kept on `window`. */
function find(): boolean {
  const w = window as any;
  if (w.__sxsBn && w.__sxsBn.prosemirrorView?.dom?.isConnected !== false) return true;
  const el = document.querySelector('.bn-container');
  if (!el) return false;
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  let f = key ? (el as any)[key] : null;
  w.__sxsBn = null;
  for (let i = 0; f && i < 80 && !w.__sxsBn; i++, f = f.return) if (typeof f.memoizedProps?.editor?.replaceBlocks === 'function') w.__sxsBn = f.memoizedProps.editor;
  w.__sxsView = (document.querySelector('.ProseMirror') as any)?.editor?.editorView;
  return !!(w.__sxsBn && w.__sxsView);
}

/** A block as the page reads it: its canonical text but for its content, which is `runs` (formatted) or `plain`. */
interface PageBlock {
  depth: number;
  prefix: string;
  suffix: string;
  /** Its content with its formatting, for a block of text (null: code, its text as it is). */
  runs: Run[] | null;
  plain: string;
  /** Where a number that is text ends, an escape after it in the canonical text. */
  cut?: number;
  free: boolean;
}

/** In the page: the blocks, and the caret, by block and offset in its content. */
function readPage(): { blocks: PageBlock[]; sel: Sel | null; selected: number[] } {
  const w = window as any;
  const view = w.__sxsView;
  const flat: (PageBlock & { id: string })[] = [];
  // its content as runs of text, each with its formatting (a link's text its own runs)
  const runsOf = (b: any): Run[] =>
    (Array.isArray(b.content) ? b.content : []).flatMap((c: any) => {
      const run = (x: any, href?: string): Run => ({ text: x.text, bold: !!x.styles?.bold, italic: !!x.styles?.italic, strike: !!x.styles?.strike, code: !!x.styles?.code, ...(href !== undefined && { href }) });
      return c.type === 'text' ? [run(c)] : c.type === 'link' ? c.content.map((x: any) => run(x, c.href)) : [];
    });
  const textOf = (b: any): string => runsOf(b).map((r) => r.text).join('');
  const walk = (bs: any[], depth: number): void => {
    // a run of numbered blocks is numbered from its first's `start`
    let number = 0;
    bs.forEach((b, k) => {
      const t = textOf(b);
      let prefix = '';
      let suffix = '';
      let cut: number | undefined;
      if (b.type === 'numberedListItem') {
        number = k > 0 && bs[k - 1].type === 'numberedListItem' ? number + 1 : Number(b.props?.start) || 1;
        prefix = `${number}. `;
      }
      // a number that is text, escaped in the canonical text
      if ((b.type === 'numberedListItem' || b.type === 'bulletListItem' || b.type === 'paragraph') && /^\d{1,9}[.)]/.test(t)) cut = /^\d+/.exec(t)![0].length;
      if (b.type === 'checkListItem') prefix = b.props.checked ? '[x] ' : '[ ] ';
      else if (b.type === 'heading') prefix = `${'#'.repeat(b.props.level)} `;
      else if (b.type === 'codeBlock') {
        // its fence longer than a run of backticks starting one of its lines, as Markdown needs
        const ticks = '`'.repeat(Math.max(3, ...[...t.matchAll(/^ {0,3}(`+)/gm)].map((m) => m[1]!.length + 1)));
        prefix = `${ticks}${b.props.language === 'text' ? '' : b.props.language}\n`;
        suffix = `\n${ticks}`;
      } else if (b.type === 'quote') prefix = '> ';
      // a divider is a thematic break, as the projection has one
      else if (b.type === 'divider') prefix = '---';
      else if (b.type !== 'bulletListItem' && b.type !== 'numberedListItem' && b.type !== 'paragraph') prefix = `<${b.type}> `;
      // outside every list: a paragraph, a heading, code, a quote, a divider, any block but a list item
      const free = !['bulletListItem', 'numberedListItem', 'checkListItem', 'toggleListItem'].includes(b.type);
      flat.push({ depth, prefix, suffix, runs: b.type === 'codeBlock' ? null : runsOf(b), plain: t, ...(cut !== undefined && { cut }), id: b.id, free });
      walk(b.children, depth + 1);
    });
  };
  walk(w.__sxsBn.document, 0);
  // the caret: the block container each end of the selection is in, and its offset in the block's content
  const at = (pos: number): { block: number; offset: number } | null => {
    const $p = view.state.doc.resolve(pos);
    for (let d = $p.depth; d >= 0; d--) {
      if ($p.node(d).type.name !== 'blockContainer') continue;
      const id = $p.node(d).attrs.id;
      const block = flat.findIndex((b) => b.id === id);
      const content = $p.start(d) + 1; // the container's content node, then its text
      if (block < 0 || pos < content) return null;
      return { block, offset: pos - content };
    }
    return null;
  };
  const { anchor, head } = view.state.selection;
  const a = view.hasFocus() ? at(anchor) : null;
  const h = view.hasFocus() ? at(head) : null;
  const sel = a && h && a.block === h.block ? { block: a.block, anchor: a.offset, head: h.offset } : null;
  // blocks selected whole: a node selection's (a drop's), or a text selection's from a block's content
  // start to another's end, as the drag takes it (its blocks, all of them, in document order)
  const selected: number[] = [];
  const { from, to } = view.state.selection;
  const type = view.state.selection.toJSON().type;
  const node = type !== 'text' && type !== 'all';
  const [f, t] = [at(from), at(to)];
  const whole = f && t && f.block !== t.block && f.offset === 0 && to === view.state.doc.resolve(to).end();
  if (view.hasFocus() && (whole || node)) {
    let k = -1;
    view.state.doc.descendants((n: any, pos: number) => {
      if (n.type.name !== 'blockContainer') return true;
      k++;
      if (whole ? k >= f!.block && k <= t!.block : pos >= from && pos + n.nodeSize <= to) selected.push(k);
      return true;
    });
  }
  return { blocks: flat.map(({ id, ...b }) => b), sel, selected };
}

/** In the page: the outline loaded, the history made empty, the caret placed (block, offsets past its prefix). */
function loadPage({ blocks, at }: { blocks: BnBlock[]; at: { block: number; anchor: number; head: number; to?: number } | null }): string {
  const w = window as any;
  const bn = w.__sxsBn;
  const view = w.__sxsView;
  bn.replaceBlocks(bn.document, blocks);
  // a new state of the same document and plugins: an empty history (loading was a transaction)
  view.updateState(view.state.constructor.create({ doc: view.state.doc, plugins: view.state.plugins }));
  if (!at) {
    (document.activeElement as HTMLElement | null)?.blur();
    return 'no caret';
  }
  // each block's content's start, inside its container, and end
  const contents: { start: number; end: number }[] = [];
  view.state.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'blockContainer') contents.push({ start: pos + 2, end: pos + 2 + node.firstChild.content.size });
    return true;
  });
  const content = contents[at.block]?.start;
  if (content === undefined || (at.to !== undefined && !contents[at.to])) return `no block ${at.block}`;
  const TextSelection = view.state.selection.constructor;
  // (a selection of blocks: from the first's content start to the last's end, `at.to`)
  const head = at.to !== undefined ? contents[at.to]!.end : content + at.head;
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, content + at.anchor, head)));
  view.focus();
  return 'placed';
}

/**
 * In the page: where a drop's gesture goes, aimed where ProseMirror's `drop` (its `dropPoint`) puts a
 * block, else why it has none. It drops beside the block whose text the pointer is over, as its
 * sibling: before it with the pointer in its text's first half, after it in the second, but before it
 * always where it has children (the half is of the block with them); x picks no depth, and below the
 * last block it lands last at the top level. The run's parent in BlockNote is `to.parent`, or for a
 * paragraph's or a heading's (beside it in BlockNote, `liftOwned`) that block's own; the run goes where
 * the drop line is, before `seam.below`. So: the start of the first block from there (the dragged
 * ones skipped) if it is that parent's, else past the end of the parent's last block before there,
 * childless and with text, else below the document if the parent is its top level.
 */
function dropAt({ press, rows, below, parent }: { press: number; rows: readonly number[]; below: number | null; parent: number | 'root' }): { hover: Point; to: Point } | string {
  const outers = [...document.querySelectorAll<HTMLElement>('.bn-block-outer')];
  const up = (i: number): number | null => {
    const p = outers[i]!.parentElement!.closest('.bn-block-outer');
    return p ? outers.indexOf(p as HTMLElement) : null;
  };
  const text = (i: number) => outers[i]!.querySelector('.bn-block-content')!;
  const free = (i: number): boolean => !/ListItem$/.test(text(i).getAttribute('data-content-type') ?? '');
  // the dragged: the run's blocks, their children with them
  const dragged = (i: number): boolean => rows.some((r) => outers[r]!.contains(outers[i]!));
  const to = parent === 'root' ? null : free(parent) ? up(parent) : parent;
  let next = below ?? outers.length;
  while (next < outers.length && dragged(next)) next++;
  const inline = (i: number) => (outers[i]!.querySelector('.bn-inline-content') ?? text(i)).getBoundingClientRect();
  const first = inline(press);
  const hover = { x: first.left + 2, y: first.top + Math.min(first.height / 2, 10) };
  if (next < outers.length && up(next) === to) {
    const r = inline(next);
    return { hover, to: { x: r.left + 1, y: r.top + Math.min(r.height / 2, 10) } };
  }
  let prev = next - 1;
  while (prev >= 0 && (dragged(prev) || up(prev) !== to)) prev--;
  if (prev < 0) return "as a childless block's first child: BlockNote drops a block beside one, never into it";
  const childless = outers.slice(prev + 1, next).every((_, k) => dragged(prev + 1 + k));
  if (to === null && next === outers.length) {
    const last = outers[0]!.parentElement!.getBoundingClientRect();
    return { hover, to: { x: outers[0]!.getBoundingClientRect().left + 2, y: last.bottom + 12 } };
  }
  if (!childless) return 'after a block with children, last: BlockNote drops there before the block, or in its children';
  if (!(text(prev).textContent ?? '')) return 'after an empty block, last: BlockNote drops there before it';
  const r = inline(prev);
  return { hover, to: { x: text(prev).getBoundingClientRect().right - 4, y: r.bottom - 4 } };
}

/**
 * A drop in BlockNote (its side menu's `blockDragStart`, ProseMirror's `drop`): the pressed block
 * hovered, which shows its side menu, the menu's drag handle measured; the pointer away until the menu
 * is gone (a menu fading out keeps its handle where the next is drawn, and takes the press); then the
 * handle held, moved to the place (`dropAt`) and released, Playwright's mouse making Chromium's HTML5
 * drag of it (`dragstart`, `dragover`, `drop`, `dragend`). It drags the block whose handle is pressed,
 * with its children, or the blocks a selection across blocks is in where it is one of them, as a
 * selection of nodes (a drop of the selection presses its first).
 */
async function blockNoteDrop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  const press = drop.press ?? drop.rows[0]!;
  const at = await page.evaluate(dropAt, { press, rows: drop.rows, below: drop.seam.below, parent: drop.to.parent });
  if (typeof at === 'string') throw new Unsupported(at);
  await page.mouse.move(at.hover.x, at.hover.y, { steps: 3 });
  // the menu at the pressed block, drawn by React (not one fading out)
  const shown = (press: number): Point | null => {
    const handle = document.querySelector('.bn-side-menu [draggable=true]');
    if (!handle || !Object.keys(handle).some((k) => k.startsWith('__reactProps$'))) return null;
    const h = handle.getBoundingClientRect();
    const b = document.querySelectorAll('.bn-block-outer')[press]!.querySelector('.bn-block-content')!.getBoundingClientRect();
    const y = h.top + h.height / 2;
    return y >= b.top && y <= b.bottom ? { x: h.left + h.width / 2, y } : null;
  };
  const from = await (await page.waitForFunction(shown, press, { timeout: 5000 })).jsonValue();
  await page.mouse.move(1, 1);
  await page.waitForFunction(() => !document.querySelector('.bn-side-menu'), null, { timeout: 5000 });
  await gesture(page, from!, at.to, settle);
}

export const driver: Driver = {
  shortId: 'BN',
  longId: 'blocknote',
  displayName: 'BlockNote',
  url: 'https://www.blocknotejs.org/examples/basic/minimal',
  model: 'block',
  // a block's text holds a blank line, its paragraphs apart
  paragraphsInBlock: true,
  // paragraphs, headings and code are blocks outside every list, as the spec's buffers have them; list
  // items the rest
  freeForm: true,
  // measured: Enter at an item's text start leaves the caret with the text
  // ProseMirror's paste opens both seams, and a list keeps its form
  behaves: {
    // a quote is a style on one block: a quote of one paragraph is that block, its `>` the style
    quotes: 'text',
    // Enter in a quote splits it, the rest a block of its own (probed 2026-10-25)
    enterInQuote: 'split',
    // its blocks a flat sequence, each item a block of its own: a list after a paragraph is no block's,
    // what a paragraph holds in BlockNote (Tab nests one) Markdown's list after it, and a move passes one
    // block, an item included (Lists1, Lists8)
    listParent: 'container',
    listMoves: 'item',
    enterSplitSpace: 'start',
    // Backspace at an item's text start: a paragraph where it is (Backspace1, Enter38)
    backspaceAtItemStart: 'unwrap',
    // Enter on an empty item: a paragraph where it is (Enter7, Enter27; the last of a nested list too,
    // Enter5, which ourus outdents)
    enterOnEmptyItem: 'unwrap',
    // Backspace right after a task's checkbox: a paragraph where it is (TaskBackspace2, TaskBackspace3)
    taskEditing: 'unwrap',
    enterAtTextStart: 'stay',
    copyAtCaret: 'host',
    pasteSeams: 'open',
    pasteListForm: 'own',
  },
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "Move block up", "down" (Mod-Shift-ArrowUp, -ArrowDown): the block with its children
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    // no command: selecting to the line's start, then deleting
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // a code block is a block of its own, its fences no text: code lines that would make a fence are
  // only text there
  refuses: ['markup-fence'],
  ordered: true,
  holds: (doc) => holds(doc as Outline),
  // by the side menu's drag handle (`blockNoteDrop`); after a drop its editor is blurred (`blockDragEnd`)
  drops: ['moveSubtree'],
  drop: blockNoteDrop,
  noCaretAfter: ['moveSubtree'],
  // its `load` selects text across whole blocks, which its drag takes as the blocks, as `read` reports them
  selectsBlocks: true,

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('.bn-container .ProseMirror', { timeout: 120000 });
    await page.waitForFunction(find, null, { timeout: 30000 });
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000 }));
    await idle();
    // ready once a key does what it should: Tab nests a block
    await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
    await idle();
    await page.keyboard.press('Tab');
    await idle();
    if (((await this.read(page)) as Outline).blocks[1]?.depth !== 1) throw new Error("BlockNote's keys didn't come up: Tab doesn't nest a block");
    // the site says no version: it is built from BlockNote's main branch, and its Next.js build id stands in
    const build = await page.evaluate(() => /"buildId":"([^"]+)"/.exec(document.documentElement.innerHTML)?.[1]);
    return build ? `site build ${build}` : undefined;
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    if (!(await page.evaluate(find))) throw new Error("BlockNote's editor isn't on the page");
    const at = o.sel && toBlockNote(o.blocks[o.sel.block]!.text, !!o.blocks[o.sel.block]!.free);
    // a selection of blocks (`selectsBlocks`): text from the first's start to the end of the last's
    // subtree, which the drag takes as those blocks
    const selected = !o.sel && o.selected?.length ? o.selected : null;
    let last = selected?.at(-1);
    if (last !== undefined) for (const d = o.blocks[last]!.depth; last + 1 < o.blocks.length && o.blocks[last + 1]!.depth > d; ) last++;
    const placed = await page.evaluate(loadPage, {
      blocks: nest(liftOwned(o.blocks)),
      at: o.sel && at ? { block: o.sel.block, anchor: appOffset(o.sel.anchor, at), head: appOffset(o.sel.head, at) } : selected ? { block: selected[0]!, anchor: 0, head: 0, to: last! } : null,
    });
    if (placed !== 'placed' && placed !== 'no caret') throw new Error(`the caret has no place: ${placed}`);
  },

  async read(page: Page) {
    const r = await page.evaluate(readPage);
    // a block's text: its content as Markdown, its formatting in markup, and where an offset in the
    // content is in it
    const texts = r.blocks.map((b) => {
      const md = b.runs ? runsAsMarkdown(b.runs) : { text: b.plain, at: (p: number) => p };
      const cut = b.cut !== undefined ? md.at(b.cut) : -1;
      const body = cut >= 0 ? `${md.text.slice(0, cut)}\\${md.text.slice(cut)}` : md.text;
      return { text: b.prefix + body + b.suffix, at: (p: number) => b.prefix.length + md.at(p) + (b.cut !== undefined && p > b.cut ? 1 : 0) };
    });
    const sel = r.sel && { block: r.sel.block, anchor: texts[r.sel.block]!.at(r.sel.anchor), head: texts[r.sel.block]!.at(r.sel.head) };
    // (any block may hold children, a paragraph too: what a free block holds read as its Markdown
    // reads, beside it, then owned as the app's `listParent` says)
    const blocks: Block[] = r.blocks.map(({ depth, free }, i) => ({ depth, text: texts[i]!.text, ...(free && { free: true as const }) }));
    const outline = asMarkdownReads(blocks, driver.behaves?.listParent);
    // (the topmost of the selected, in the outline's nesting)
    const under = (i: number): boolean => r.selected.some((j) => j < i && outline.slice(j + 1, i + 1).every((b) => b.depth > outline[j]!.depth));
    const selected = r.selected.filter((i) => !under(i));
    return { blocks: outline, sel, ...(selected.length && { selected }) };
  },
};
