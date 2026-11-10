/// <reference lib="dom" />
// Notion (see README.md): a page published to the web (`<space>.notion.site/<page>`), which opens in
// Notion's own editor, read-only to a visitor. `proxy.ts` makes it editable, gives the page no blocks
// of its own, and saves nothing. Each test's document goes in the page's URL (`?sxs=`, its blocks as
// JSON: `NotionBlock`), which the proxy turns into the page's blocks, as Notion's own data would have
// them: a load of the page is the test's start. The outline is read from the editor's block stores
// (found through React), the caret from the DOM's selection.
//
// In free form, as AFFiNE's driver has it: a text, a heading, a quote or code is a block outside every
// list (`free`), a bulleted, numbered or to-do block an item. Any block may hold children (Tab nests a
// text under the block before), which Markdown can't say of a paragraph: what a free block owns in
// ourus's outline is beside it in Notion (`liftOwned`), and read back, what a free block holds is
// beside it, then owned as `listParent` says (`asMarkdownReads`). A block's text is rich: its title's
// runs, read as Markdown (`runsAsMarkdown`), and a test's Markdown loaded as runs (`markdownRuns`).

import type { Page } from 'playwright-core';
import { micromark } from 'micromark';
import { gfmStrikethrough, gfmStrikethroughHtml } from 'micromark-extension-gfm-strikethrough';
import type { Driver } from '../lib/driver.ts';
import { asMarkdownReads, liftOwned, runsAsMarkdown, type Block, type Outline, type Run } from '../lib/block.ts';
import type { NotionBlock } from './proxy.ts';

const URL_ = 'https://jordanscales.notion.site/Nested-TODOs-d1769a74c4c04d2a8e36f45c1520a150';

/** The anonymous browser ids a visitor has: Cloudflare asks an unknown browser to prove itself (README). */
const COOKIES = [
  ['device_id', '1719bab2-a066-420d-aa66-100bc05ae369'],
  ['notion_browser_id', '14879bd2-9a85-428c-a66d-282967630b8e'],
  ['notion_check_cookie_consent', 'false'],
] as const;

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** Notion's heading types, by level. */
const HEADINGS = ['header', 'sub_header', 'sub_sub_header'];

/** Notion's types of a list's items: the rest are blocks outside every list. */
const ITEMS = new Set(['bulleted_list', 'numbered_list', 'to_do']);

/** The page's block store, found through React from a text leaf: the first `store` that is a page. */
const FIND_PAGE = `(() => {
  const leaf = document.querySelector('[data-content-editable-leaf]');
  const key = leaf && Object.keys(leaf).find((k) => k.startsWith('__reactFiber'));
  for (let f = key ? leaf[key] : null; f; f = f.return) {
    const s = f.memoizedProps && f.memoizedProps.store;
    if (s && s.getType && s.getContentStores && s.getType() === 'page') return s;
  }
  return null;
})()`;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => ENTITIES[e]!);

/**
 * Markdown as rich text, Notion's runs: its emphasis, strikethrough, code and links (micromark's HTML of
 * it, read back); null where it holds anything else (an HTML tag, a hard break, a list), or isn't
 * written as `runsAsMarkdown` writes those runs back (an escape, `__b__`): a start Notion's
 * text would be read back otherwise from.
 */
export function markdownRuns(md: string): Run[] | null {
  if (!/[*_~`[\\<&]/.test(md)) return md ? [{ text: md }] : [];
  // (the spaces at its ends, which a paragraph drops, kept as text)
  const [, lead, mid, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(md)!;
  const html = micromark(mid!, { extensions: [gfmStrikethrough()], htmlExtensions: [gfmStrikethroughHtml()] }).trim();
  const p = /^<p>([\s\S]*)<\/p>$/.exec(html);
  if (!p) return null;
  const runs: Run[] = lead ? [{ text: lead }] : [];
  const on = { bold: 0, italic: 0, strike: 0, code: 0 };
  const TAGS: Record<string, keyof typeof on> = { strong: 'bold', em: 'italic', del: 'strike', code: 'code' };
  let href: string | undefined;
  for (const tok of p[1]!.split(/(<[^>]*>)/)) {
    if (!tok) continue;
    const tag = /^<(\/?)(strong|em|del|code|a)(?: href="([^"]*)")?>$/.exec(tok);
    if (tok.startsWith('<') && !tag) return null;
    if (tag && tag[2] === 'a') href = tag[1] ? undefined : decode(tag[3] ?? '');
    else if (tag) on[TAGS[tag[2]!]!] += tag[1] ? -1 : 1;
    else runs.push({ text: decode(tok), ...(on.bold && { bold: true }), ...(on.italic && { italic: true }), ...(on.strike && { strike: true }), ...(on.code && { code: true }), ...(href !== undefined && { href }) });
  }
  if (trail) runs.push({ text: trail });
  return runsAsMarkdown(runs).text === md ? runs : null;
}

/** Runs as Notion's rich text (`title`): `[text, [mark, ...]]` each. */
const asTitle = (runs: readonly Run[]): (string | string[][])[][] =>
  runs.map((r) => {
    const marks: string[][] = [];
    if (r.bold) marks.push(['b']);
    if (r.italic) marks.push(['i']);
    if (r.strike) marks.push(['s']);
    if (r.code) marks.push(['c']);
    if (r.href !== undefined) marks.push(['a', r.href]);
    return marks.length ? [r.text, marks] : [r.text];
  });

/**
 * A block's canonical text as Notion's: its type, its content (Markdown), how long its prefix is, and
 * where a number or `#` that is text has its escape (`1\. x`, `\# x`), which Notion's text hasn't
 * (`cut`); or why Notion can't have it. A free block is a text, or by its text a heading, a quote or
 * code; an item a to-do, numbered or a bullet.
 */
function toNotion(text: string, free: boolean): { type: string; body: string; prefix: number; cut?: number; checked?: boolean; number?: number } | string {
  const heading = /^(#{1,6}) /.exec(text);
  const fence = /^```([^\n`]*)\n([\s\S]*?)\n?```$/.exec(text);
  if (free && heading) {
    if (heading[1]!.length > 3) return 'heading of level 4 to 6 (Notion has three)';
    return { type: HEADINGS[heading[1]!.length - 1]!, body: text.slice(heading[0].length), prefix: heading[0].length };
  }
  if (free && fence && fence[1]) return 'code block with a language (Notion names its own)';
  // (a code block always has a line in Notion: one with none, its fences together, it hasn't)
  if (free && fence) return /^```\n```$/.test(text) ? 'code block with no line (Notion\'s has one)' : { type: 'code', body: fence[2]!, prefix: 4 };
  if (free && text.startsWith('> ')) return { type: 'quote', body: text.slice(2), prefix: 2 };
  if (!free && heading) return 'heading as a list item (a heading is a block of its own)';
  if (!free && /^```/.test(text)) return 'code block as a list item (a code block is a block of its own)';
  if (!free && text.startsWith('> ')) return 'quote as a list item (a quote is a block of its own)';
  const task = free ? null : /^\[([ xX])\] /.exec(text);
  if (task) return { type: 'to_do', checked: task[1] !== ' ', body: text.slice(4), prefix: 4 };
  const numbered = free ? null : /^(\d{1,9})\. /.exec(text);
  const prefix = numbered?.[0].length ?? 0;
  const type = free ? 'text' : numbered ? 'numbered_list' : 'bulleted_list';
  const base = { type, prefix, ...(numbered && { number: Number(numbered[1]) }) };
  // a number that is text (after a numbered block's own number too): the escape's backslash off
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(text.slice(prefix));
  if (literal) return { ...base, body: literal[1] + text.slice(prefix + literal[0].length), cut: prefix + literal[1]!.length };
  // and a `#` that is text (a heading is a block's type, its text plain)
  if (/^\\#/.test(text.slice(prefix))) return { ...base, body: text.slice(prefix + 1), cut: prefix };
  return { ...base, body: text.slice(prefix) };
}

/** A canonical offset in a block's text as one in Notion's plain text, or null inside markup. */
function appOffset(offset: number, at: { prefix: number; cut?: number }, runs: readonly Run[]): number | null {
  const o = offset - at.prefix - (at.cut !== undefined && offset > at.cut ? 1 : 0);
  if (o < 0) return null;
  const md = runsAsMarkdown(runs);
  const plain = runs.reduce((n, r) => n + r.text.length, 0);
  for (let p = 0; p <= plain; p++) if (md.at(p) === o) return p;
  return null;
}

/** The outline's blocks as Notion's (`NotionBlock`), or why Notion can't start from them. */
function asNotion(blocks: readonly Block[]): { blocks: NotionBlock[]; runs: Run[][]; at: ReturnType<typeof toNotion>[] } | string {
  const out: NotionBlock[] = [];
  const runs: Run[][] = [];
  const at: ReturnType<typeof toNotion>[] = [];
  /** The number the block before at each depth has, where it is numbered. */
  const last: (number | null)[] = [];
  for (const b of blocks) {
    const n = toNotion(b.text, !!b.free);
    if (typeof n === 'string') return n;
    const r = n.type === 'code' ? [{ text: n.body }] : markdownRuns(n.body);
    if (!r) return 'markup Notion has no runs for (an escape, HTML, a hard break)';
    last.length = b.depth + 1;
    // a numbered list counts on from its first's number: one that doesn't is another list Notion hasn't
    const prev = last[b.depth];
    if (n.number !== undefined && prev != null && n.number !== prev + 1) return 'numbered list right after another (Notion numbers them as one)';
    const start = n.number !== undefined && prev == null && n.number !== 1 ? n.number : undefined;
    last[b.depth] = n.number ?? null;
    out.push({ depth: b.depth, type: n.type, title: asTitle(r), ...(n.checked !== undefined && { checked: n.checked }), ...(start !== undefined && { start }) });
    runs.push(r);
    at.push(n);
  }
  return { blocks: out, runs, at };
}

/** In the page: the blocks (type, runs, checked, number), the caret (by block and offset in its plain text) and blocks selected whole. */
function readPage(find: string) {
  const root = (0, eval)(find);
  const flat: { depth: number; type: string; runs: Run[]; plain: string; checked: boolean; start?: number; language?: string; id: string }[] = [];
  const runsOf = (title: any[][]): Run[] =>
    (title ?? []).map(([text, marks]: any) => {
      const r: Run = { text: String(text ?? '') };
      for (const m of marks ?? []) {
        if (m[0] === 'b') r.bold = true;
        else if (m[0] === 'i') r.italic = true;
        else if (m[0] === 's') r.strike = true;
        else if (m[0] === 'c') r.code = true;
        else if (m[0] === 'a') r.href = m[1];
      }
      return r;
    });
  const walk = (s: any, depth: number) =>
    s.getContentStores().forEach((c: any) => {
      const p = c.getProperties() ?? {};
      let runs = runsOf(p.title);
      // a code block's editor holds what is typed or pasted in it, and writes it to the block later:
      // its text is the page's (measured as the caret is, from its leaf's start)
      if (c.getType() === 'code') {
        const leaf = document.querySelector(`[data-block-id="${c._pointer.id}"] [data-content-editable-leaf]`);
        if (leaf) {
          const r = document.createRange();
          r.selectNodeContents(leaf);
          runs = [{ text: r.toString() }];
        }
      }
      const format = c.getFormat?.() ?? {};
      flat.push({ depth, type: c.getType(), runs, plain: runs.map((r) => r.text).join(''), checked: p.checked?.[0]?.[0] === 'Yes', ...(format.list_start_index != null && { start: Number(format.list_start_index) }), ...(p.language && { language: String(p.language[0][0]) }), id: c._pointer.id });
      walk(c, depth + 1);
    });
  walk(root, 0);
  let sel: { block: number; anchor: number; head: number } | null = null;
  const ds = getSelection()!;
  const leaf = (ds.anchorNode instanceof Element ? ds.anchorNode : ds.anchorNode?.parentElement)?.closest('[data-content-editable-leaf]') as HTMLElement | null;
  const bid = leaf?.closest('[data-block-id]')?.getAttribute('data-block-id');
  const block = flat.findIndex((f) => f.id === bid);
  if (leaf && block >= 0) {
    const offset = (node: Node | null, at: number): number => {
      if (!node || !leaf.contains(node)) return 0;
      const r = document.createRange();
      r.setStart(leaf, 0);
      r.setEnd(node, at);
      return r.toString().length;
    };
    sel = { block, anchor: offset(ds.anchorNode, ds.anchorOffset), head: offset(ds.focusNode, ds.focusOffset) };
  }
  const selected = [...document.querySelectorAll('.notion-selectable-halo')]
    .map((e) => flat.findIndex((f) => f.id === e.closest('[data-block-id]')?.getAttribute('data-block-id')))
    .filter((i) => i >= 0);
  return { flat, sel, selected };
}

export const driver: Driver = {
  shortId: 'NO',
  longId: 'notion',
  displayName: 'Notion',
  url: URL_,
  scope: 'https://jordanscales.notion.site/',
  model: 'block',
  // texts, headings, quotes and code are blocks outside every list, as the spec's buffers have them;
  // bulleted, numbered and to-do blocks the items
  freeForm: true,
  // a heading is a block's type, a text starting `# ` plain (`read` escapes it)
  headings: true,
  ordered: true,
  // measured with `--ignore-options` (2026-11-03): each value agrees where ourus's default doesn't
  behaves: {
    // its blocks a flat sequence beside a text, each item a block of its own: a list after a text is no
    // block's (Backspace50b: the item after a text unwrapped by Backspace stays where it was)
    listParent: 'container',
    // Backspace at an item's text start: a text where it is (Backspace1, Backspace50b)
    backspaceAtItemStart: 'unwrap',
    // Enter on an empty item: a text where it is (Enter7c, Enter21b, Enter27b)
    enterOnEmptyItem: 'unwrap',
    // Enter at a block's text start: the caret stays with the text (Enter26b, Enter29b)
    enterAtTextStart: 'stay',
    // a heading's level is the block's, kept through a join (Backspace18b, Backspace18f, Delete13b)
    headingEditing: 'block',
    // Backspace right after a to-do's checkbox: a text where it is (TaskBackspace3b)
    taskEditing: 'unwrap',
    // a split keeps the space at the new block's start (Enter65c, Enter65d, ...)
    enterSplitSpace: 'start',
    // blocks pasted at a block's text start go after it (probed 2026-11-11)
    pasteAtTextStart: 'after',
  },
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    // no command: selecting to the line's start, then deleting
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    // Escape selects the block being edited (with its children), Backspace deletes it
    deleteSubtree: ['Escape', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    // (Ctrl+Home goes to the page's title, which is no block: no `cursorDocStart`)
    cursorDocEnd: 'Control+End',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // after deleting a block selected whole no block is edited
  noCaretAfter: ['deleteSubtree'],
  // a selection of whole blocks: Escape selects the block being edited, Shift+ArrowDown the next one
  // with it (the topmost of them drawn with a halo, `.notion-selectable-halo`)
  selectsBlocks: true,
  // Notion's tables, equations, dividers and callouts are blocks with no text to put a caret in (or
  // none of Markdown's), which the driver doesn't make: skipped, with Markdown's other atoms
  refuses: ['markup-fence', 'html', 'table', 'math', 'thematic break', 'link reference definition', 'comment', 'footnote', 'callout'],

  holds(doc) {
    const o = doc as Outline;
    for (const b of o.blocks) {
      // an emoji's caret lands inside it (`a�┃�b`) in the page's selection: not held
      if (/[\u{10000}-\u{10FFFF}]/u.test(b.text)) return 'character outside the BMP, which the DOM selection splits';
    }
    const n = asNotion(liftOwned(o.blocks));
    if (typeof n === 'string') return n;
    if (!o.sel) return undefined;
    const at = n.at[o.sel.block] as Exclude<ReturnType<typeof toNotion>, string>;
    if (o.sel.anchor < at.prefix || o.sel.head < at.prefix) return at.type === 'to_do' ? "caret in a task's checkbox" : at.type === 'quote' ? "caret in a quote's >" : at.type === 'code' ? "caret on a code block's fence" : "caret in a block's marker";
    if (at.type === 'code' && Math.max(o.sel.anchor, o.sel.head) > at.prefix + at.body.length) return "caret on a code block's fence";
    if (appOffset(o.sel.anchor, at, n.runs[o.sel.block]!) === null || appOffset(o.sel.head, at, n.runs[o.sel.block]!) === null) return 'caret in markup, which is formatting in Notion';
    return undefined;
  },

  async open(page: Page) {
    // an edit Notion hasn't saved (the proxy answers its saves, and it still holds them) makes leaving the
    // page ask "Leave site?" (`beforeunload`), which Playwright dismisses: the next load never came back
    page.on('dialog', (d) => void d.accept().catch(() => {}));
    await page.context().addCookies(COOKIES.map(([name, value]) => ({ name, value, domain: 'jordanscales.notion.site', path: '/' })));
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('[data-content-editable-leaf][contenteditable="true"]'), undefined, { timeout: 120000 });
    await page.waitForFunction((find) => (0, eval)(find), FIND_PAGE, { timeout: 60000 });
    await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    // ready once a key does what it should: Tab indents
    for (let t0 = Date.now(), ready = false; !ready; ) {
      await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      ready = ((await this.read(page)) as Outline).blocks[1]?.depth === 1;
      if (!ready && Date.now() - t0 > 30000) throw new Error("Notion's keys didn't come up: Tab doesn't indent");
    }
    // the build of Notion's the page loads (`app-<hash>.js`), which ships continuously
    return page.evaluate(() => performance.getEntriesByType('resource').map((e) => /\/_assets\/app-([0-9a-f]+)\.js/.exec(e.name)?.[1]).find(Boolean) ?? 'published page');
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 50, timeout: 3000 }));
    const lifted = liftOwned(o.blocks);
    const n = asNotion(lifted);
    if (typeof n === 'string') throw new Error(`Notion can't hold the start: ${n}`);
    // the document goes in the page's URL (`?sxs=`) and a cookie, which the proxy turns into the page's
    // blocks (`proxy.ts`): a load of the page is the test's start, whatever the document holds
    const json = encodeURIComponent(JSON.stringify(n.blocks));
    // (three loads in 309 never came back in 2 minutes: one retry, sooner)
    // (through a blank page: a load of the same site again keeps its renderer, which grew until it crashed, some 150 tests in)
    await page.goto('about:blank');
    const target = `${this.url}?sxs=${json}`;
    // (a cookie holds some 4 KB: a longer document goes in the URL alone, the last test's cookie gone)
    if (json.length < 3800) await page.context().addCookies([{ name: 'sxs', value: json, domain: 'jordanscales.notion.site', path: '/' }]);
    else await page.context().clearCookies({ name: 'sxs' });
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => page.goto(target, { waitUntil: 'domcontentloaded', timeout: 80000 }));
    await page.waitForFunction(
      ([find, n]) => {
        const root = (0, eval)(find as string);
        const flat = (s: any): number => s.getContentStores().reduce((t: number, c: any) => t + 1 + flat(c), 0);
        return root && flat(root) === n && document.querySelectorAll('.notion-page-content [data-content-editable-leaf][contenteditable="true"]').length >= Math.min(n as number, 1);
      },
      [FIND_PAGE, n.blocks.length] as const,
      { timeout: 60000 },
    );
    await idle();
    if (o.selected?.length) {
      // the first block's text edited, then Escape: it is selected; Shift+ArrowDown takes the next in
      // with it, until the selection is the test's
      await this.place(page, { block: o.selected[0]!, anchor: 0, head: 0 });
      await idle();
      await page.keyboard.press('Escape');
      await idle();
      const want = JSON.stringify(o.selected);
      for (let k = 0; k < o.blocks.length && JSON.stringify(((await this.read(page)) as Outline).selected ?? []) !== want; k++) {
        await page.keyboard.press('Shift+ArrowDown');
        await idle();
      }
      const got = ((await this.read(page)) as Outline).selected ?? [];
      if (JSON.stringify(got) !== want) throw new Error(`Notion selects blocks ${got.join(', ')}, not ${o.selected.join(', ')}`);
      return;
    }
    if (!o.sel) return;
    const at = n.at[o.sel.block] as Exclude<ReturnType<typeof toNotion>, string>;
    const runs = n.runs[o.sel.block]!;
    await this.place(page, { block: o.sel.block, anchor: appOffset(o.sel.anchor, at, runs)!, head: appOffset(o.sel.head, at, runs)! });
    await idle();
  },

  /** Puts the caret or selection in a block's text, as the DOM's selection (the editor follows it): offsets in its plain text. */
  async place(page: Page, sel: { block: number; anchor: number; head: number }) {
    // the block's text drawn first: a code block's editor comes later than the page's other blocks,
    // late under load (Fence3, in a run of every app)
    await page
      .waitForFunction(
        ({ block, find }) => {
          const flat: any[] = [];
          const walk = (s: any) => s.getContentStores().forEach((c: any) => (flat.push(c), walk(c)));
          walk((0, eval)(find));
          return !!document.querySelector(`[data-block-id="${flat[block]?._pointer.id}"] [data-content-editable-leaf]`);
        },
        { block: sel.block, find: FIND_PAGE },
        { timeout: 20000 },
      )
      .catch(() => {});
    await page.evaluate(
      ({ sel, find }) => {
        const flat: any[] = [];
        const walk = (s: any) => s.getContentStores().forEach((c: any) => (flat.push(c), walk(c)));
        walk((0, eval)(find));
        const id = flat[sel.block]?._pointer.id;
        const leaf = document.querySelector(`[data-block-id="${id}"] [data-content-editable-leaf]`) as HTMLElement | null;
        if (!leaf) throw new Error(`no leaf for block ${sel.block}: ${flat.length} blocks, ${document.querySelectorAll('[data-block-id]').length} in the DOM`);
        leaf.focus();
        const at = (offset: number): [Node, number] => {
          const w = document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT);
          let left = offset;
          let last: Node | null = null;
          for (let n = w.nextNode(); n; n = w.nextNode()) {
            const len = n.textContent!.length;
            if (left <= len) return [n, left];
            left -= len;
            last = n;
          }
          return last ? [last, last.textContent!.length] : [leaf, 0];
        };
        const [an, ao] = at(sel.anchor);
        const [fn, fo] = at(sel.head);
        getSelection()!.setBaseAndExtent(an, ao, fn, fo);
      },
      { sel, find: FIND_PAGE },
    );
  },

  async read(page: Page) {
    const raw = await page.evaluate(readPage, FIND_PAGE);
    // each block's canonical text: its type's prefix (a number counted on from the block before, as
    // Notion numbers a list), its runs as Markdown, an escape where its text would read as markup
    const numbers: number[] = [];
    const prevAt: number[] = [];
    const texts = raw.flat.map((b, i) => {
      prevAt.length = b.depth + 1;
      const prev = prevAt[b.depth];
      prevAt[b.depth] = i;
      let prefix = '';
      let suffix = '';
      let cut: number | undefined;
      if (b.type === 'numbered_list') {
        numbers[i] = b.start ?? (prev !== undefined && raw.flat[prev]!.type === 'numbered_list' ? numbers[prev]! + 1 : 1);
        prefix = `${numbers[i]}. `;
      }
      if (b.type === 'bulleted_list' || b.type === 'numbered_list' || b.type === 'text') {
        if (/^\d{1,9}[.)]/.test(b.plain)) cut = /^\d+/.exec(b.plain)![0].length;
        else if (/^#{1,6}(?=[ \t]|$)/.test(b.plain)) cut = 0;
      }
      if (b.type === 'to_do') prefix = b.checked ? '[x] ' : '[ ] ';
      else if (HEADINGS.includes(b.type)) prefix = `${'#'.repeat(HEADINGS.indexOf(b.type) + 1)} `;
      else if (b.type === 'quote') prefix = '> ';
      else if (b.type === 'code') {
        const ticks = '`'.repeat(Math.max(3, ...[...b.plain.matchAll(/^ {0,3}(`+)/gm)].map((x) => x[1]!.length + 1)));
        const lang = b.language && b.language !== 'Plain Text' ? b.language.toLowerCase() : '';
        prefix = `${ticks}${lang}\n`;
        // (an empty one has a line, as Notion draws it, the caret on it)
        suffix = `\n${ticks}`;
      } else if (b.type === 'divider') prefix = '---';
      else if (!ITEMS.has(b.type) && b.type !== 'text') prefix = `<${b.type}> `;
      const md = b.type === 'code' ? { text: b.plain, at: (p: number) => p } : runsAsMarkdown(b.runs);
      const c = cut !== undefined ? md.at(cut) : -1;
      const body = c >= 0 ? `${md.text.slice(0, c)}\\${md.text.slice(c)}` : md.text;
      return { text: prefix + body + suffix, at: (p: number) => prefix.length + md.at(p) + (cut !== undefined && p > cut ? 1 : 0) };
    });
    const blocks: Block[] = raw.flat.map((b, i) => ({ depth: b.depth, text: texts[i]!.text, ...(!ITEMS.has(b.type) && { free: true as const }) }));
    const sel = raw.selected.length || !raw.sel ? null : { block: raw.sel.block, anchor: texts[raw.sel.block]!.at(raw.sel.anchor), head: texts[raw.sel.block]!.at(raw.sel.head) };
    // (any block may hold children, a text too: what a free block holds read as its Markdown reads,
    // beside it, then owned as the app's `listParent` says)
    return { blocks: asMarkdownReads(blocks, driver.behaves?.listParent), sel, ...(raw.selected.length && { selected: raw.selected }) } as Outline;
  },
} as Driver & { place(page: Page, sel: { block: number; anchor: number; head: number }): Promise<void> };
