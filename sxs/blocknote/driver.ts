/// <reference lib="dom" />
// BlockNote (https://www.blocknotejs.org/, see README.md): a block editor of Notion's kind, a library
// on ProseMirror and Tiptap, driven in its site's minimal example (the library's default editor, no
// collaboration, saving nothing). The site's demo page is collaborative (a Yjs room on a server of
// its own, shared with whoever has the link), so it isn't the one driven.
//
// BlockNote's editor is found through React (the `editor` prop of `BlockNoteView`, on its container's
// fiber); a test's outline goes in through its API (`replaceBlocks`, every block a bullet list item at
// its depth, or a heading, a task, a code block by its text), then the editor's ProseMirror state is
// made anew from the same document and plugins, so the history is empty and undo stays within the
// test. The caret is a ProseMirror selection, by block and offset; reading is `editor.document`, each
// block's text as the spec's canonical form has it (`[ ] `, `## `, a fence), a paragraph as its text,
// as the projection has a paragraph (BlockNote makes one of an item: Backspace at its start, Enter on
// an empty one). Marked (`¶ `), the 52 differences with a paragraph read gave 3 more, all where ourus
// made a paragraph there too, and none of the rest agreed for want of the mark (2026-10-14).

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import type { Block, Outline, Sel } from '../lib/outline.ts';

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

/** A block's canonical text as BlockNote's: its type, props and text, and how long its prefix is. */
function toBlockNote(text: string): { block: Omit<BnBlock, 'children'>; prefix: number } {
  const task = /^\[([ xX])\] /.exec(text);
  if (task) return { block: { type: 'checkListItem', props: { checked: task[1] !== ' ' }, content: text.slice(4) }, prefix: 4 };
  const heading = /^(#{1,6}) /.exec(text);
  if (heading) return { block: { type: 'heading', props: { level: heading[1]!.length }, content: text.slice(heading[0].length) }, prefix: heading[0].length };
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (fence) return { block: { type: 'codeBlock', props: { language: fence[1] || 'text' }, content: fence[2] }, prefix: 4 + fence[1]!.length };
  return { block: { type: 'bulletListItem', content: text }, prefix: 0 };
}

/**
 * Starts BlockNote can't hold, measured (each was a start the load check found held otherwise): a
 * caret where a block's text has no place in BlockNote, its markup being a widget or the block's type.
 */
function holds(o: Outline): string | undefined {
  if (!o.sel) return undefined;
  const text = o.blocks[o.sel.block]!.text;
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  // a task's checkbox is drawn, not text
  if (/^\[[ xX]\] /.test(text) && from < 4) return "a caret in a task's checkbox";
  // a code block's editor has the code alone, its language a menu
  const fence = /^```[^\n`]*\n([\s\S]*?)\n?```$/.exec(text);
  if (fence) {
    const start = text.indexOf('\n') + 1;
    const end = start + fence[1]!.length;
    if (from < start || to > end) return "a caret on a code block's fence";
  }
  return undefined;
}

/** The outline's blocks as BlockNote's, nested by depth. */
function nest(blocks: readonly Block[]): BnBlock[] {
  const roots: BnBlock[] = [];
  const stack: BnBlock[] = [];
  for (const b of blocks) {
    const bn: BnBlock = { ...toBlockNote(b.text).block, children: [] };
    stack.length = b.depth;
    (b.depth === 0 ? roots : stack[b.depth - 1]!.children).push(bn);
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
function readPage(): { blocks: { depth: number; text: string; prefix: number }[]; sel: Sel | null } {
  const w = window as any;
  const view = w.__sxsView;
  const flat: { depth: number; text: string; prefix: number; id: string }[] = [];
  const textOf = (b: any): string => (Array.isArray(b.content) ? b.content.map((c: any) => (c.type === 'text' ? c.text : c.type === 'link' ? c.content.map((x: any) => x.text).join('') : '')).join('') : '');
  const walk = (bs: any[], depth: number): void =>
    bs.forEach((b) => {
      const t = textOf(b);
      let prefix = '';
      let suffix = '';
      if (b.type === 'checkListItem') prefix = b.props.checked ? '[x] ' : '[ ] ';
      else if (b.type === 'heading') prefix = `${'#'.repeat(b.props.level)} `;
      else if (b.type === 'codeBlock') {
        prefix = `\`\`\`${b.props.language === 'text' ? '' : b.props.language}\n`;
        suffix = '\n```';
      } else if (b.type === 'quote') prefix = '> ';
      else if (b.type !== 'bulletListItem' && b.type !== 'numberedListItem' && b.type !== 'paragraph') prefix = `<${b.type}> `;
      flat.push({ depth, text: prefix + t + suffix, prefix: prefix.length, id: b.id });
      walk(b.children, depth + 1);
    });
  walk(w.__sxsBn.document, 0);
  // the caret: the block container each end of the selection is in, and its offset in the block's content
  const at = (pos: number): { block: number; offset: number } | null => {
    const $p = view.state.doc.resolve(pos);
    for (let d = $p.depth; d >= 0; d--) {
      if ($p.node(d).type.name !== 'blockContainer') continue;
      const id = $p.node(d).attrs.id;
      const block = flat.findIndex((b) => b.id === id);
      const content = $p.start(d) + 1; // the container's content node, then its text
      return block < 0 || pos < content ? null : { block, offset: flat[block]!.prefix + pos - content };
    }
    return null;
  };
  const { anchor, head } = view.state.selection;
  const a = view.hasFocus() ? at(anchor) : null;
  const h = view.hasFocus() ? at(head) : null;
  const sel = a && h && a.block === h.block ? { block: a.block, anchor: a.offset, head: h.offset } : null;
  return { blocks: flat.map(({ depth, text, prefix }) => ({ depth, text, prefix })), sel };
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
  name: 'blocknote',
  title: 'BlockNote',
  url: 'https://www.blocknotejs.org/examples/basic/minimal',
  model: 'block',
  // measured: Enter at an item's text start leaves the caret with the text
  behaves: { enterAtTextStart: 'stay' },
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
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  refuses: [],
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
    const at = o.sel && { block: o.sel.block, prefix: toBlockNote(o.blocks[o.sel.block]!.text).prefix };
    const placed = await page.evaluate(loadPage, {
      blocks: nest(o.blocks),
      at: o.sel && at ? { block: at.block, anchor: Math.max(0, o.sel.anchor - at.prefix), head: Math.max(0, o.sel.head - at.prefix) } : null,
    });
    if (placed !== 'placed' && placed !== 'no caret') throw new Error(`the caret has no place: ${placed}`);
  },

  async read(page: Page) {
    const r = await page.evaluate(readPage);
    return { blocks: r.blocks.map(({ depth, text }) => ({ depth, text })), sel: r.sel };
  },
};
