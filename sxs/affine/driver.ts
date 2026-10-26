/// <reference lib="dom" />
// AFFiNE (https://affine.pro/, see README.md): a block editor of Notion's kind on BlockSuite, driven in
// its web app's demo workspace, which opens with no account and is kept in the browser (IndexedDB),
// saving nothing to AFFiNE's servers. Each test's blocks go into the workspace's "Getting Started" doc,
// in place of what it had, through the editor's store (`window.currentEditor.doc`, BlockSuite's
// `Store`: `deleteBlock`, `addBlock`, then `resetHistory`, so undo stays within the test); the caret is
// a BlockSuite text selection, set through the block's inline editor. Reading is the store's blocks and
// the editor's selection (`std.selection`).
//
// In free form: a paragraph (`affine:paragraph`: text, a heading, a quote) or code (`affine:code`) is a
// block outside every list (`free`), a list item (`affine:list`: bulleted, numbered, a to-do) an item.
// Any block may hold children (Tab nests a paragraph under the one before), which Markdown can't say of
// a paragraph: what a free block owns in ourus's outline is beside it in AFFiNE, as in Markdown
// (`liftOwned`), and read back, what a free block holds is beside it, then owned as `listParent` says
// (`asMarkdownReads`).

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { asMarkdownReads, liftOwned, runsAsMarkdown, type Block, type Outline, type Run } from '../lib/block.ts';

/** AFFiNE's keys for the spec's motions; the `select…` motions add Shift. */
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

/** The demo workspace's doc the tests run in, by its title (its id is the workspace's own). */
const DOC = 'Getting Started';

/** A block of AFFiNE's, as the page makes it. */
interface AfBlock {
  flavour: 'affine:paragraph' | 'affine:list' | 'affine:code';
  type: string;
  text: string;
  checked?: boolean;
  language?: string;
  /** A numbered list's first number, where it isn't 1. */
  order?: number;
  children: AfBlock[];
}

/**
 * A block's canonical text as AFFiNE's: its flavour, type and text, how long its prefix is, and where
 * a number that is text has its escape (`1\. x`), which AFFiNE's text hasn't (`cut`). A free block is
 * a paragraph, or by its text a heading, a quote or code; an item a list item: a to-do, numbered or a
 * bullet.
 */
function toAffine(text: string, free: boolean): { block: Omit<AfBlock, 'children'>; prefix: number; cut?: number } {
  const heading = /^(#{1,6}) /.exec(text);
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (free && heading) return { block: { flavour: 'affine:paragraph', type: `h${heading[1]!.length}`, text: text.slice(heading[0].length) }, prefix: heading[0].length };
  if (free && fence) return { block: { flavour: 'affine:code', type: 'code', text: fence[2]!, ...(fence[1] && { language: fence[1] }) }, prefix: 4 + fence[1]!.length };
  if (free && text.startsWith('> ')) return { block: { flavour: 'affine:paragraph', type: 'quote', text: text.slice(2) }, prefix: 2 };
  const task = free ? null : /^\[([ xX])\] /.exec(text);
  if (task) return { block: { flavour: 'affine:list', type: 'todo', checked: task[1] !== ' ', text: text.slice(4) }, prefix: 4 };
  const numbered = free ? null : /^(\d{1,9})\. /.exec(text);
  const prefix = numbered?.[0].length ?? 0;
  const base = free ? { flavour: 'affine:paragraph' as const, type: 'text' } : { flavour: 'affine:list' as const, type: numbered ? 'numbered' : 'bulleted' };
  // a number that is text (after a numbered block's own number too): the escape's backslash off
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(text.slice(prefix));
  if (literal) return { block: { ...base, text: literal[1] + text.slice(prefix + literal[0].length) }, prefix, cut: prefix + literal[1]!.length };
  return { block: { ...base, text: text.slice(prefix) }, prefix };
}

/** A canonical offset in a block's text as one in AFFiNE's, the prefix and an escape (`cut`) taken off. */
const appOffset = (offset: number, at: { prefix: number; cut?: number }): number => Math.max(0, offset - at.prefix - (at.cut !== undefined && offset > at.cut ? 1 : 0));

/** Starts AFFiNE can't hold: a heading, code or a quote as a list item, numbers that don't count on, a caret in markup that is a block's type. */
function holds(o: Outline): string | undefined {
  for (const b of o.blocks) {
    if (b.free) continue;
    if (/^#{1,6} /.test(b.text)) return 'heading as a list item (a heading is a block of its own)';
    if (/^```/.test(b.text)) return 'code block as a list item (a code block is a block of its own)';
    if (b.text.startsWith('> ')) return 'quote as a list item (a quote is a block of its own)';
  }
  // numbered siblings that don't count on (`1. a`, `1. b`): AFFiNE numbers a run of them on from its first
  const last: (number | null)[] = [];
  for (const b of o.blocks) {
    last.length = b.depth + 1;
    const n = !b.free && /^(\d{1,9})\. /.exec(b.text);
    if (n && last[b.depth] != null && Number(n[1]) !== last[b.depth]! + 1) return 'numbered list right after another (AFFiNE numbers them as one)';
    last[b.depth] = n ? Number(n[1]) : null;
  }
  if (!o.sel) return undefined;
  const b = o.blocks[o.sel.block]!;
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  const at = toAffine(b.text, !!b.free);
  if (from < at.prefix) return at.block.type === 'todo' ? "caret in a task's checkbox" : at.block.type === 'quote' ? "caret in a quote's >" : at.block.flavour === 'affine:code' ? "caret on a code block's fence" : "caret in a heading's #s";
  if (at.block.flavour === 'affine:code' && to > at.prefix + at.block.text.length) return "caret on a code block's fence";
  return undefined;
}

/** The outline's blocks as AFFiNE's, nested by depth. */
function nest(blocks: readonly Block[]): AfBlock[] {
  const roots: AfBlock[] = [];
  const stack: AfBlock[] = [];
  for (const b of blocks) {
    const af: AfBlock = { ...toAffine(b.text, !!b.free).block, children: [] };
    stack.length = b.depth;
    const siblings = b.depth === 0 ? roots : stack[b.depth - 1]!.children;
    // a run of numbered blocks counts on from its first's number, the one it was written with
    const n = /^(\d{1,9})\. /.exec(b.text);
    const prev = siblings[siblings.length - 1];
    if (af.type === 'numbered' && !(prev?.type === 'numbered') && n && n[1] !== '1') af.order = Number(n[1]);
    siblings.push(af);
    stack[b.depth] = af;
  }
  return roots;
}

/** A block as the page reads it: its canonical text but for its content, which is `runs` (formatted) or `plain`. */
interface PageBlock {
  depth: number;
  prefix: string;
  suffix: string;
  /** Its content with its formatting (null: code, its text as it is). */
  runs: Run[] | null;
  plain: string;
  /** Where a number that is text ends, an escape after it in the canonical text. */
  cut?: number;
  free: boolean;
}

/** In the page: the blocks, the caret (by block and offset in its content) and blocks selected whole. */
function readPage(): { blocks: PageBlock[]; sel: { block: number; anchor: number; head: number } | null; selected: number[] } {
  const ed = (window as any).currentEditor;
  const doc = ed.doc;
  const flat: (PageBlock & { id: string })[] = [];
  const runsOf = (t: any): Run[] =>
    (t?.toDelta?.() ?? []).map((d: any) => ({
      text: typeof d.insert === 'string' ? d.insert : '',
      ...(d.attributes?.bold && { bold: true }),
      ...(d.attributes?.italic && { italic: true }),
      ...(d.attributes?.strike && { strike: true }),
      ...(d.attributes?.code && { code: true }),
      ...(d.attributes?.link && { href: d.attributes.link }),
    }));
  const walk = (ms: any[], depth: number): void => {
    let number = 0;
    ms.forEach((m: any, k: number) => {
      const type = m.props.type;
      const t: string = m.props.text?.toString() ?? '';
      let prefix = '';
      let suffix = '';
      let cut: number | undefined;
      if (m.flavour === 'affine:list' && type === 'numbered') {
        // its number as AFFiNE draws it (each item's own `order`, which a move leaves as it was: `2.`
        // before `1.`), else counted on from the item before
        const prev = ms[k - 1];
        const drawn = /^(\d+)\.$/.exec(ed.std.view.getBlock(m.id)?.querySelector('.affine-list-block__prefix')?.textContent?.trim() ?? '');
        number = drawn ? Number(drawn[1]) : prev?.flavour === 'affine:list' && prev.props.type === 'numbered' ? number + 1 : Number(m.props.order) || 1;
        prefix = `${number}. `;
      }
      if ((m.flavour === 'affine:list' && type !== 'todo') || (m.flavour === 'affine:paragraph' && type === 'text')) {
        if (/^\d{1,9}[.)]/.test(t)) cut = /^\d+/.exec(t)![0].length;
      }
      if (m.flavour === 'affine:list' && type === 'todo') prefix = m.props.checked ? '[x] ' : '[ ] ';
      else if (m.flavour === 'affine:paragraph' && /^h[1-6]$/.test(type)) prefix = `${'#'.repeat(Number(type[1]))} `;
      else if (m.flavour === 'affine:paragraph' && type === 'quote') prefix = '> ';
      else if (m.flavour === 'affine:code') {
        // its fence longer than a run of backticks starting one of its lines, as Markdown needs
        const ticks = '`'.repeat(Math.max(3, ...[...t.matchAll(/^ {0,3}(`+)/gm)].map((x) => x[1]!.length + 1)));
        const lang = m.props.language && m.props.language !== 'plain text' && m.props.language !== 'text' ? m.props.language : '';
        prefix = `${ticks}${lang}\n`;
        suffix = `\n${ticks}`;
      } else if (m.flavour === 'affine:divider') prefix = '---';
      else if (m.flavour !== 'affine:list' && m.flavour !== 'affine:paragraph') prefix = `<${m.flavour}> `;
      flat.push({ depth, prefix, suffix, runs: m.flavour === 'affine:code' ? null : runsOf(m.props.text), plain: t, ...(cut !== undefined && { cut }), id: m.id, free: m.flavour !== 'affine:list' });
      walk(m.children, depth + 1);
    });
  };
  const note = doc.root.children.find((c: any) => c.flavour === 'affine:note');
  walk(note?.children ?? [], 0);
  const index = (id: string) => flat.findIndex((b) => b.id === id);
  const value: any[] = ed.std.selection.value;
  // the caret is the editor's only while the page's editor has the focus: in the doc's title, its
  // selection is left as it was
  const inPage = !!(document.activeElement as HTMLElement | null)?.closest('affine-page-root');
  const text = inPage ? value.find((s) => s.type === 'text') : null;
  let sel: { block: number; anchor: number; head: number } | null = null;
  if (text && (!text.to || text.to.blockId === text.from.blockId)) {
    const block = index(text.from.blockId);
    const [start, end] = text.to ? [text.from.index, text.to.index + text.to.length] : [text.from.index, text.from.index + text.from.length];
    if (block >= 0) sel = { block, anchor: text.reverse ? end : start, head: text.reverse ? start : end };
  }
  const selected = value.filter((s) => s.type === 'block').map((s) => index(s.blockId)).filter((i) => i >= 0);
  return { blocks: flat.map(({ id, ...b }) => b), sel, selected };
}

/** In the page: the outline loaded in place of the doc's, the history made empty, the caret placed (block, offsets past its prefix). */
async function loadPage({ blocks, at }: { blocks: AfBlock[]; at: { block: number; anchor: number; head: number } | null }): Promise<string> {
  const ed = (window as any).currentEditor;
  const doc = ed.doc;
  const std = ed.std;
  (document.activeElement as HTMLElement | null)?.blur();
  std.selection.clear();
  // one note, the doc's first, holding the test's blocks
  const notes = doc.root.children.filter((c: any) => c.flavour === 'affine:note');
  for (const n of notes.slice(1)) doc.deleteBlock(n);
  const note = notes[0];
  for (const c of note.children.slice()) doc.deleteBlock(c);
  // BlockSuite's text, by the class of a block's own (the title's: the doc always has one)
  const Text = doc.root.props.title.constructor;
  const ids: string[] = [];
  const add = (bs: AfBlock[], parent: string): void =>
    bs.forEach((b) => {
      const props: Record<string, unknown> = { type: b.type, text: new Text(b.text) };
      if (b.flavour === 'affine:code') delete props.type;
      if (b.checked !== undefined) props.checked = b.checked;
      if (b.language) props.language = b.language;
      if (b.order !== undefined) props.order = b.order;
      ids.push(doc.addBlock(b.flavour, props, parent));
      add(b.children, ids[ids.length - 1]!);
    });
  add(blocks, note.id);
  doc.resetHistory();
  const rendered = () => ids.every((id) => std.view.getBlock(id)?.querySelector('rich-text')?.inlineEditor);
  for (let i = 0; i < 300 && !rendered(); i++) await new Promise((r) => setTimeout(r, 10));
  if (!rendered()) return "the test's blocks didn't render";
  await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
  if (!at) return 'no caret';
  const id = ids[at.block];
  if (!id) return `no block ${at.block}`;
  // the page's editor takes the focus (its blocks' inline editors are inside it), then the caret
  (document.querySelector('affine-page-root') as HTMLElement | null)?.focus({ preventScroll: true });
  const ie = std.view.getBlock(id).querySelector('rich-text').inlineEditor;
  ie.setInlineRange({ index: Math.min(at.anchor, at.head), length: Math.abs(at.head - at.anchor) });
  await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
  if (at.head < at.anchor) {
    // backward: the same text selection, reversed, which the editor puts in the DOM
    const s = std.selection.value.find((x: any) => x.type === 'text');
    if (!s) return 'no text selection to reverse';
    std.selection.set([std.selection.create(s.constructor, { from: s.from, to: s.to, reverse: true })]);
    await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
  }
  return 'placed';
}

export const driver: Driver = {
  shortId: 'AF',
  longId: 'affine',
  displayName: 'AFFiNE',
  url: 'https://app.affine.pro/',
  model: 'block',
  // a block's text holds line breaks (Shift+Enter), a blank line its paragraphs apart
  paragraphsInBlock: true,
  // paragraphs, headings, quotes and code are blocks outside every list, as the spec's buffers have
  // them; list items the rest
  freeForm: true,
  // measured with `--ignore-options` (2026-10-26): each value agrees where ourus's default doesn't
  behaves: {
    // its blocks a flat sequence, each item a block of its own: a list after a paragraph is no block's
    // (Lists6, Lists8b, Lists10, Lists12 to Lists15), and a move passes one block, an item included
    // (Lists13 to Lists15)
    listParent: 'container',
    listMoves: 'item',
    // Enter on an empty item: a paragraph where it is (Enter7c, Enter21b; Enter7 disagrees)
    enterOnEmptyItem: 'unwrap',
    // Enter at a block's text start: the caret stays with the text (Enter26b, Enter29b)
    enterAtTextStart: 'stay',
    // Backspace right after a to-do's checkbox: a paragraph where it is (TaskBackspace3b)
    taskEditing: 'unwrap',
    // a heading's level is the block's, kept through a join (Delete13b, Delete13d, Delete13f)
    headingEditing: 'block',
    // a paste opens both seams: the first pasted line joins the text before the caret, the last the
    // text after (Paste4b, Paste21, Paste24b, Paste26b, PasteList22, PasteList23)
    pasteSeams: 'open',
  },
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "Move Up", "Move Down" (Mod-Alt-ArrowUp, -ArrowDown; Mod-Shift- too): the block with its children
    moveSubtreeUp: 'Control+Alt+ArrowUp',
    moveSubtreeDown: 'Control+Alt+ArrowDown',
    // no command: selecting to the line's start, then deleting
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    // Escape selects the block being edited (with its children), Backspace deletes it
    deleteSubtree: ['Escape', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    // (a capital: AFFiNE's keymap reads the key Shift makes)
    pastePlain: 'Control+Shift+V',
    undo: 'Control+z',
    redo: 'Control+Shift+Z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // after deleting a block selected whole no block is edited
  noCaretAfter: ['deleteSubtree'],
  // a code block is a block of its own, its fences no text. AFFiNE's tables, LaTeX and dividers are
  // blocks of their own too, with no text to put a caret in, which the driver doesn't make (as text
  // in a paragraph they would be another start): skipped, with Markdown's other atoms
  refuses: ['markup-fence', 'table', 'math', 'thematic break', 'html', 'link reference definition', 'comment', 'footnote'],
  ordered: true,
  holds: (doc) => holds(doc as Outline),

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    // a new browser's first visit makes the demo workspace and opens "Getting Started"; a later one
    // opens the workspace's list of docs, which links to it by its title
    await page.waitForURL(/\/workspace\/[^/]+\//, { timeout: 120000 });
    const editor = (timeout: number) => page.waitForFunction(() => (window as any).currentEditor?.doc?.root && document.querySelector('affine-page-root'), null, { timeout }).then(() => true, () => false);
    if (!(await editor(15000))) {
      const href = await page.waitForFunction((title) => [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/workspace/"]')].find((a) => a.textContent?.trim().startsWith(title))?.getAttribute('href'), DOC, { timeout: 60000 });
      await page.goto(new URL((await href.jsonValue())!, this.url).href, { waitUntil: 'domcontentloaded', timeout: 120000 });
      if (!(await editor(120000))) throw new Error(`AFFiNE's "${DOC}" doc didn't open`);
    }
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000 }));
    await idle();
    // ready once a key does what it should: Tab nests a block
    await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
    await idle();
    await page.keyboard.press('Tab');
    await idle();
    if (((await this.read(page)) as Outline).blocks[1]?.depth !== 1) throw new Error("AFFiNE's keys didn't come up: Tab doesn't nest a block");
    // the version, in the names of the workers it loads (`workspace-profile-0.27.4.worker.js`)
    return page.evaluate(() => performance.getEntriesByType('resource').map((e) => /\/js\/[\w-]+-(\d+\.\d+\.\d+[\w.-]*)\.worker\.js$/.exec(e.name)?.[1]).find(Boolean));
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const blocks = liftOwned(o.blocks);
    const at = o.sel && toAffine(blocks[o.sel.block]!.text, !!blocks[o.sel.block]!.free);
    const placed = await page.evaluate(loadPage, {
      blocks: nest(blocks),
      at: o.sel && at ? { block: o.sel.block, anchor: appOffset(o.sel.anchor, at), head: appOffset(o.sel.head, at) } : null,
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
    return { blocks: asMarkdownReads(blocks, driver.behaves?.listParent), sel, ...(r.selected.length && { selected: r.selected }) };
  },
};
