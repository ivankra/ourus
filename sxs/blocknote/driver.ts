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
// BlockNote, as in Markdown (`liftOwned`, `ownBlocks`).

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { liftOwned, ownBlocks, type Block, type Outline, type Sel } from '../lib/block.ts';

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
 * block (outside every list, `Block.free`) is a paragraph, or by its text a heading or a code block;
 * an item a list item: a task, numbered or a bullet.
 */
function toBlockNote(text: string, free = false): { block: Omit<BnBlock, 'children'>; prefix: number; cut?: number } {
  const heading = /^(#{1,6}) /.exec(text);
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (free && heading) return { block: { type: 'heading', props: { level: heading[1]!.length }, content: text.slice(heading[0].length) }, prefix: heading[0].length };
  if (free && fence) return { block: { type: 'codeBlock', props: { language: fence[1] || 'text' }, content: fence[2] }, prefix: 4 + fence[1]!.length };
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
  // a list item is a list item's text: BlockNote's headings and code blocks are blocks of their own
  for (const b of o.blocks) {
    if (b.free) continue;
    if (/^#{1,6} /.test(b.text)) return 'heading as a list item (a heading is a block of its own)';
    if (/^```/.test(b.text)) return 'code block as a list item (a code block is a block of its own)';
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
  // a code block's editor has the code alone, its language a menu
  const fence = /^```[^\n`]*\n([\s\S]*?)\n?```$/.exec(text);
  if (fence) {
    const start = text.indexOf('\n') + 1;
    const end = start + fence[1]!.length;
    if (from < start || to > end) return "caret on a code block's fence";
  }
  return undefined;
}

/** A free block that owns the list right after it, as Markdown's paragraph does (not code, a divider, a heading). */
const ownsList = (b: Block): boolean => !!b.free && !/^#{1,6} /.test(b.text) && !b.text.startsWith('```') && !/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(b.text);

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

/** In the page: the blocks (canonical text, depth, prefix length) and the caret, by block and offset. */
function readPage(): { blocks: { depth: number; text: string; prefix: number; free: boolean }[]; sel: Sel | null } {
  const w = window as any;
  const view = w.__sxsView;
  const flat: { depth: number; text: string; prefix: number; cut?: number; id: string; free: boolean }[] = [];
  const textOf = (b: any): string => (Array.isArray(b.content) ? b.content.map((c: any) => (c.type === 'text' ? c.text : c.type === 'link' ? c.content.map((x: any) => x.text).join('') : '')).join('') : '');
  const walk = (bs: any[], depth: number): void => {
    // a run of numbered blocks is numbered from its first's `start`
    let number = 0;
    bs.forEach((b, k) => {
      let t = textOf(b);
      let prefix = '';
      let suffix = '';
      let cut: number | undefined;
      if (b.type === 'numberedListItem') {
        number = k > 0 && bs[k - 1].type === 'numberedListItem' ? number + 1 : Number(b.props?.start) || 1;
        prefix = `${number}. `;
      }
      if ((b.type === 'numberedListItem' || b.type === 'bulletListItem' || b.type === 'paragraph') && /^\d{1,9}[.)]/.test(t)) {
        // a number that is text, escaped in the canonical text
        cut = /^\d+/.exec(t)![0].length;
        t = t.slice(0, cut) + '\\' + t.slice(cut);
      }
      if (b.type === 'checkListItem') prefix = b.props.checked ? '[x] ' : '[ ] ';
      else if (b.type === 'heading') prefix = `${'#'.repeat(b.props.level)} `;
      else if (b.type === 'codeBlock') {
        prefix = `\`\`\`${b.props.language === 'text' ? '' : b.props.language}\n`;
        suffix = '\n```';
      } else if (b.type === 'quote') prefix = '> ';
      // a divider is a thematic break, as the projection has one
      else if (b.type === 'divider') prefix = '---';
      else if (b.type !== 'bulletListItem' && b.type !== 'numberedListItem' && b.type !== 'paragraph') prefix = `<${b.type}> `;
      // outside every list: a paragraph, a heading, code, a quote, a divider, any block but a list item
      const free = !['bulletListItem', 'numberedListItem', 'checkListItem', 'toggleListItem'].includes(b.type);
      flat.push({ depth, text: prefix + t + suffix, prefix: prefix.length, ...(cut !== undefined && { cut }), id: b.id, free });
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
      const { prefix, cut } = flat[block]!;
      return { block, offset: prefix + pos - content + (cut !== undefined && pos - content > cut ? 1 : 0) };
    }
    return null;
  };
  const { anchor, head } = view.state.selection;
  const a = view.hasFocus() ? at(anchor) : null;
  const h = view.hasFocus() ? at(head) : null;
  const sel = a && h && a.block === h.block ? { block: a.block, anchor: a.offset, head: h.offset } : null;
  return { blocks: flat.map(({ depth, text, prefix, free }) => ({ depth, text, prefix, free })), sel };
}

/** In the page: the outline loaded, the history made empty, the caret placed (block, offsets past its prefix). */
function loadPage({ blocks, at }: { blocks: BnBlock[]; at: { block: number; anchor: number; head: number } | null }): string {
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
  let n = -1;
  let content = -1;
  view.state.doc.descendants((node: any, pos: number) => {
    if (content >= 0) return false;
    if (node.type.name === 'blockContainer' && ++n === at.block) content = pos + 2; // inside the container, inside its content
    return content < 0;
  });
  if (content < 0) return `no block ${at.block}`;
  const TextSelection = view.state.selection.constructor;
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, content + at.anchor, content + at.head)));
  view.focus();
  return 'placed';
}

export const driver: Driver = {
  shortId: 'BN',
  longId: 'blocknote',
  displayName: 'BlockNote',
  url: 'https://www.blocknotejs.org/examples/basic/minimal',
  model: 'block',
  // paragraphs, headings and code are blocks outside every list, as the spec's buffers have them; list
  // items the rest
  freeForm: true,
  // measured: Enter at an item's text start leaves the caret with the text
  // ProseMirror's paste opens both seams, and a list keeps its form
  behaves: {
    enterSplitSpace: 'start',
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
    const placed = await page.evaluate(loadPage, {
      blocks: nest(liftOwned(o.blocks)),
      at: o.sel && at ? { block: o.sel.block, anchor: appOffset(o.sel.anchor, at), head: appOffset(o.sel.head, at) } : null,
    });
    if (placed !== 'placed' && placed !== 'no caret') throw new Error(`the caret has no place: ${placed}`);
  },

  async read(page: Page) {
    const r = await page.evaluate(readPage);
    return { blocks: ownBlocks(r.blocks.map(({ depth, text, free }) => ({ depth, text, ...(free && { free: true as const }) })), ownsList), sel: r.sel };
  },
};
