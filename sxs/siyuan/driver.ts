/// <reference lib="dom" />
// SiYuan (https://b3log.org/siyuan/, see README.md): a block editor over Markdown, open source
// (AGPL-3.0), run here from its release: its kernel (kernel.ts) serves the web UI and the API on
// 127.0.0.1. Each test's outline is a document of its own, made from Markdown through the API
// (`filetree/createDocWithMd`: every block a list item at its depth) and opened in the editor through
// the driver's plugin (plugin/, the plugin API's `openTab`); the last test's document is removed, which
// closes its tab. Undo is the kernel's, per document, so it stays within the test. The actions are
// SiYuan's keymap on Linux (⌘ is Ctrl there).
//
// Reading is the editor's DOM (`protyle.wysiwyg`), SiYuan's own tree: list items in order, each
// block's text its own blocks' Markdown by SiYuan's converter (Lute's `BlockDOM2StdMd`), a task item
// `[ ] ` / `[x] ` before it. A block outside every list (a paragraph SiYuan made of an item) is owned
// as the spec's buffers' blocks are (../lib/outline.ts): a paragraph owns the list right after it, a heading
// its section. The caret is mapped into a block's Markdown, and back, through a marker character put
// where it is, so markup the editor draws as no text (`**b**`, a heading's `## `) counts as it does in
// the text. (The whole document's Markdown, projected as the spec's buffers are, would read SiYuan's
// tree wrong where its Markdown doesn't say it: `-  b` with a child indented two columns, after a
// deletion at the text's start, isn't the child's parent in CommonMark.)

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import type { Block, Outline } from '../lib/outline.ts';
import { api, origin, serve } from './kernel.ts';

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
 * An outline as Markdown for `createDocWithMd`: every block a list item, nested by its depth, a
 * numbered block (`1. x`) an ordered list's item, its children at its content column.
 */
function markdownOf(blocks: readonly Block[]): string {
  const columns: number[] = [];
  return (
    blocks
      .map((b) => {
        const pad = ' '.repeat(b.depth ? (columns[b.depth - 1] ?? 2 * b.depth) : 0);
        const numbered = /^(\d{1,9})\. /.exec(b.text);
        const marker = numbered ? `${numbered[1]}.` : '-';
        columns.length = b.depth;
        columns[b.depth] = pad.length + marker.length + 1;
        const [first, ...rest] = (numbered ? b.text.slice(numbered[0].length) : b.text).split('\n');
        return [`${pad}${marker} ${first}`, ...rest.map((l) => (l ? `${' '.repeat(columns[b.depth]!)}${l}` : ''))].join('\n');
      })
      .join('\n') + '\n'
  );
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
    // `- →x` and `-     code`: a tab or an indented line becomes structure, or is trimmed
    if (/^[ \t]/.test(b.text)) return "a block's text starting with whitespace";
    // a hard break's spaces, a space after the text: trimmed (an empty task's `[ ] ` is its checkbox, held)
    if (/[ \t]$/m.test(b.text.replace(/^\[[ xX]\] /, ''))) return "a line's trailing whitespace";
    // an empty last line: trimmed
    if (b.text.endsWith('\n')) return "a block's text ending in a line break";
    // `# Title #`: held as `# Title`
    if (/^#{1,6}(?:[ \t].*)?[ \t]#+[ \t]*$/.test(first) || /^#{1,6}[ \t]+#+[ \t]*$/.test(first)) return "a heading's closing #s";
    // `- ---` is a thematic break, not an item holding one
    if (/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(first)) return 'a thematic break as an item';
  }
  if (!o.sel) return undefined;
  const text = o.blocks[o.sel.block]!.text;
  const from = Math.min(o.sel.anchor, o.sel.head);
  const to = Math.max(o.sel.anchor, o.sel.head);
  // a task's checkbox is drawn, not text
  if (/^\[[ xX]\] /.test(text) && from < 4) return "a caret in a task's checkbox";
  // a code block's editor has the code alone
  const code = codeOf(text);
  const onFence = (p: number): boolean => !!code && p >= code.from && p <= code.to && (p < code.start || p > code.end);
  if (onFence(from) || onFence(to)) return "a caret on a code block's fence";
  return undefined;
}

/** What the page gives back: the blocks in order, the caret in Markdown offsets, the blocks selected. */
interface Raw {
  blocks: Block[];
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
  const md = (el: Element): string => (p.lute.BlockDOM2StdMd(el.outerHTML) as string).replace(/\n$/, '');
  const data = (el: Element): DOMStringMap => (el as HTMLElement).dataset ?? {};
  // a block: a list item's own blocks (not its nested lists), or a block outside every list
  type Group = { els: HTMLElement[]; depth: number; prefix: string; holder: HTMLElement };
  const groups: Group[] = [];
  const items = (list: Element, depth: number): void => {
    [...list.children].filter((c) => data(c).type === 'NodeListItem').forEach((li, k) => {
      const kids = [...li.children].filter((c) => data(c).nodeId) as HTMLElement[];
      const task = (li as HTMLElement).dataset.task;
      // an ordered list's item: its number, as the canonical text has it (`1. `)
      const number = data(list).subtype === 'o' ? `${parseInt(data(li).marker ?? '', 10) || k + 1}. ` : '';
      // its first block is its text; its other blocks (code after its text, a second paragraph) are
      // its children, in order with its nested lists, as the projection has an item's blocks. An empty
      // paragraph SiYuan leaves in it is no block in Markdown: it stays with the text, a line of it
      const empty = (c: Element): boolean => data(c).type === 'NodeParagraph' && md(c).trim() === '';
      const own = kids.filter((c) => data(c).type !== 'NodeList');
      const first = own.find((c) => !empty(c)) ?? own[0];
      const text = own.filter((c) => c === first || empty(c));
      groups.push({ els: text, depth, prefix: number + (task === undefined ? '' : task === ' ' ? '[ ] ' : '[x] '), holder: li as HTMLElement });
      for (const kid of kids) {
        if (data(kid).type === 'NodeList') items(kid, depth + 1);
        else if (!text.includes(kid)) groups.push({ els: [kid], depth: depth + 1, prefix: '', holder: kid });
      }
    });
  };
  // blocks outside every list, owned as ourus owns them: a heading its section (to the next heading
  // of its level or higher), a paragraph the list right after it
  const levels: number[] = [];
  let ownsList = false;
  for (const c of [...wys.children].filter((c) => data(c).nodeId) as HTMLElement[]) {
    const type = data(c).type;
    if (type === 'NodeList') {
      items(c, levels.length + (ownsList ? 1 : 0));
    } else if (type === 'NodeHeading') {
      const level = Number(data(c).subtype?.slice(1)) || 1;
      while (levels.length && levels[levels.length - 1]! >= level) levels.pop();
      groups.push({ els: [c], depth: levels.length, prefix: '', holder: c });
      levels.push(level);
    } else {
      groups.push({ els: [c], depth: levels.length, prefix: '', holder: c });
    }
    ownsList = type === 'NodeParagraph';
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
    return {
      text: t.replaceAll(S1, '').replaceAll(S2, ''),
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
  groups.forEach((g, k) => {
    const parts: string[] = [];
    let base = g.prefix.length;
    for (const el of g.els) {
      const marks: { node: Node; offset: number; s: string }[] = [];
      if (caretIn && el.contains(caretIn.anchorNode)) marks.push({ node: caretIn.anchorNode!, offset: caretIn.anchorOffset, s: S1 });
      if (caretIn && el.contains(caretIn.focusNode)) marks.push({ node: caretIn.focusNode!, offset: caretIn.focusOffset, s: S2 });
      const { text, at } = withMarks(el, marks);
      if (at[S1]! >= 0) anchor = [k, base + at[S1]!];
      if (at[S2]! >= 0) head = [k, base + at[S2]!];
      parts.push(text);
      base += text.length + 1;
    }
    blocks.push({ depth: g.depth, text: g.prefix + parts.join('\n') });
  });
  // a caret or selection within one block (one across blocks has no place in the model)
  const [a0, h0] = [anchor as [number, number] | null, head as [number, number] | null];
  const sel: Raw['sel'] = a0 && h0 && a0[0] === h0[0] ? { block: a0[0], anchor: a0[1], head: h0[1] } : null;
  const selected = groups.map((g, k) => (g.holder.classList.contains('protyle-wysiwyg--select') || g.els.some((e) => e.classList.contains('protyle-wysiwyg--select')) ? k : -1)).filter((k) => k >= 0);
  if (!want) return { blocks, sel, selected };

  // placing: the DOM position whose Markdown offset is the one wanted, in the block's own elements
  const g = groups[want.block];
  if (!g) return { blocks, sel, selected, placed: `no block ${want.block}` };
  const find = (offset: number): { node: Node; offset: number; el: HTMLElement } | null => {
    let base = g.prefix.length;
    for (const el of g.els) {
      const ce = (el.querySelector('[contenteditable="true"]') as HTMLElement | null) ?? el;
      const candidates: { node: Node; offset: number }[] = [];
      const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode() as Text | null; t; t = walker.nextNode() as Text | null) for (let i = 0; i <= t.data.length; i++) candidates.push({ node: t, offset: i });
      if (!candidates.length) candidates.push({ node: ce, offset: 0 });
      for (const c of candidates) {
        const { at } = withMarks(el, [{ ...c, s: S1 }]);
        if (base + at[S1]! === offset) return { ...c, el: ce };
      }
      base += md(el).length + 1;
    }
    return null;
  };
  const a = find(want.anchor);
  const h = want.head === want.anchor ? a : find(want.head);
  if (!a || !h) return { blocks, sel, selected, placed: `no place for ${!a ? want.anchor : want.head} in "${blocks[want.block]?.text}"` };
  a.el.focus();
  getSelection()!.setBaseAndExtent(a.node, a.offset, h.node, h.offset);
  return { blocks, sel, selected, placed: 'placed' };
}

/** The test notebook: `ourus sxs`, made if the workspace has none. */
let notebook = '';
async function notebookId(): Promise<string> {
  if (notebook) return notebook;
  const { notebooks } = await api<{ notebooks: { id: string; name: string }[] }>('notebook/lsNotebooks');
  notebook = notebooks.find((n) => n.name === 'ourus sxs')?.id ?? (await api<{ notebook: { id: string } }>('notebook/createNotebook', { name: 'ourus sxs' })).notebook.id;
  return notebook;
}

/** Documents are named for the run and numbered within it. */
const run = Date.now().toString(36);
let docs = 0;
/** The current test's document; '' before this run's first, when every earlier one is removed. */
let current = '';

export const driver: Driver = {
  name: 'siyuan',
  title: 'SiYuan',
  url: `${origin}/stage/build/desktop/`,
  model: 'block',
  // structured paste in the middle of a block's text goes after it
  behaves: { pasteStructuredMidText: 'after', pasteStructuredListForm: 'drop', pasteStructuredOnParent: 'after' },
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
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // a code or math block is a block of its own, its fences no text: a caret on one has no place, and
  // code lines that would make a fence are only text there
  refuses: ['markup-fence'],
  ordered: true,
  holds: (doc) => holds(doc as Outline),
  idle: {
    // edits go to the kernel (a transaction), undo and redo come back from it: a request owed is work
    busy: '(window.__sxsFetching?.() ?? 0) > 0',
  },

  serve,

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
    const nb = await notebookId();
    const id = await api<string>('filetree/createDocWithMd', { notebook: nb, path: `/ourus-sxs-${run}-${String(++docs).padStart(5, '0')}`, markdown: markdownOf(o.blocks) });
    await page.evaluate((id) => (window as any).__ourusSxs.open(id), id);
    await page.waitForFunction((id) => {
      const p = (window as any).__ourusSxs.editor()?.protyle;
      return p?.block.rootID === id && p.wysiwyg.element.querySelector('[data-node-id]');
    }, id);
    // the last test's document removed (its tab closes with it); before this run's first, every earlier one
    const old = current ? [current] : (await api<{ files: { id: string }[] }>('filetree/listDocsByPath', { notebook: nb, path: '/' })).files.map((f) => f.id).filter((d) => d !== id);
    for (const d of old) await api('filetree/removeDocByID', { id: d }).catch(() => {});
    current = id;
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
    return { blocks: r.blocks, sel: r.sel, ...(r.selected.length && { selected: r.selected }) };
  },
};
