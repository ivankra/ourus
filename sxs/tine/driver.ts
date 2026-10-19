/// <reference lib="dom" />
// Tine (https://tine.page/, see README.md): an outliner of Logseq's kind, whose guide is Tine's own
// editor, published read-only; the proxy (proxy.ts) makes it run over its in-memory backend instead,
// editable and saving nothing, and names its document store and the backend's pages for the driver.
// Each test's page is pushed into the backend's pages and opened through the search (Ctrl+K); the
// caret is the block's textarea's. The actions are Tine's keys on Linux.
//
// - A block's text is its `raw`; a task's checkbox is `TODO` / `DONE`, and a numbered block has
//   Logseq's property `logseq.order-list-type:: number`, as in Logseq.
// - Undo is "page only" (Tine's "Toggle undo/redo mode"), so it stays within the test's page.
// - The textarea is committed to the store as it is typed in, so the store is read as it is.
// - A test's blocks come with their header facets (task marker, heading level, properties) from
//   Tine's own parse, as its backend ships them: given none, Tine took a numbered block for no list
//   and a `TODO` for no task until its text changed.

import type { Page } from 'playwright-core';
import { perPage, type Driver } from '../lib/driver.ts';
import { unescapeLaterLines, type Outline } from '../lib/block.ts';

/** Tine's keys for the spec's actions (Linux); the `select…` motions add Shift. */
const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** Canonical task checkboxes and Tine's markers, both ways (as Logseq's driver has them). */
const TO_TINE: [RegExp, string][] = [
  [/^\[ \](?= |$)/, 'TODO'],
  [/^\[[xX]\](?= |$)/, 'DONE'],
];
const FROM_TINE: [RegExp, string][] = [
  [/^(?:TODO|LATER|NOW|DOING|WAIT|WAITING|IN-PROGRESS)(?= |$)/, '[ ]'],
  [/^(?:DONE|CANCELED|CANCELLED)(?= |$)/, '[x]'],
];

/** `text` with its first matching prefix swapped: the new text and the swapped prefixes' lengths. */
function swapPrefix(text: string, table: [RegExp, string][]): { text: string; from: number; to: number } {
  for (const [re, to] of table) {
    const m = re.exec(text);
    if (m) return { text: to + text.slice(m[0].length), from: m[0].length, to: to.length };
  }
  return { text, from: 0, to: 0 };
}

/** An offset in a text whose prefix of `from` characters became `to` characters: past it, shifted; inside it, clamped. */
const shiftOffset = (p: number, from: number, to: number): number => (p >= from ? p - from + to : Math.min(p, to));

/** The property that makes a block numbered (Logseq's, which Tine reads): a run of such siblings is numbered from 1. */
const NUMBERED = 'logseq.order-list-type:: number';

/**
 * A block's canonical text as Tine's: a task's checkbox as its marker, and a numbered block (`1. x`)
 * without its number, the property after its text; `from` and `to` the prefixes' lengths, for the caret.
 */
function toTine(text: string): { text: string; from: number; to: number } {
  const n = /^\d{1,9}\. /.exec(text);
  const task = swapPrefix(n ? text.slice(n[0].length) : text, TO_TINE);
  return { text: n ? `${task.text}\n${NUMBERED}` : task.text, from: (n?.[0].length ?? 0) + task.from, to: task.to };
}

/**
 * Tine's text of a block as canonical: a numbered one's property taken off and its number (its place
 * in its run of numbered siblings) put before its text; a number that is text escaped (`1\. x`, the
 * escape at `cut`); a task's marker as its checkbox.
 */
function fromTine(raw: string, number: number | null): { text: string; from: number; to: number; cut?: number } {
  const task = swapPrefix(raw.replace(/\n?logseq\.order-list-type:: number[ \t]*(?=\n|$)/, ''), FROM_TINE);
  // a number that is text, escaped also after a numbered block's own number (`2. 2\. x`)
  const pre = number !== null ? `${number}. ` : '';
  const literal = /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(task.text);
  const text = literal ? task.text.slice(0, literal[0].length) + '\\' + task.text.slice(literal[0].length) : task.text;
  return { text: pre + text, from: task.from, to: task.to + pre.length, ...(literal && { cut: task.to + pre.length + literal[0].length }) };
}

/**
 * A fenced code block's code, where its text has one: Tine edits a code block in an editor of the code
 * alone (a textarea `.code-edit`), so a caret there is an offset in the code, `start` characters into
 * the block's text.
 */
function codeOf(text: string): { start: number; end: number } | null {
  const open = /^(`{3,}|~{3,})[^\n]*\n/.exec(text);
  if (!open) return null;
  const close = new RegExp(`\n${open[1]![0]}{${open[1]!.length},}\\s*$`).exec(text);
  return { start: open[0].length, end: close ? close.index : text.length };
}

/**
 * Pages are named for the run (a tab outlives a run, and the next run of Tine takes it over, its pages
 * still there) and numbered within it, at a fixed width, so that no page's name begins another's.
 */
const run = Date.now().toString(36);
let pages = 0;
/** The current test's page, a worker's (`perPage`). */
const pageState = perPage(() => ({ current: '' }));

export const driver: Driver = {
  name: 'tine',
  title: 'Tine',
  id: 'TI',
  url: 'https://tine.page/guide/app/',
  model: 'block',
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Alt+Shift+ArrowUp',
    moveSubtreeDown: 'Alt+Shift+ArrowDown',
    // "kill line before"
    deleteSoftLineBackward: 'Alt+u',
    // Escape selects the block being edited, and Backspace deletes the selected blocks with their children
    deleteSubtree: ['Escape', 'Backspace'],
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
  // a heading's `#`s, a task's `TODO` and a code block's fences are text in a block, edited a
  // character at a time
  refuses: ['markup-heading', 'markup-task', 'markup-fence'],
  ordered: true,
  behaves: { outdent: 'direct', enterOnEmptyItem: 'sibling', enterMidItem: 'child', pasteStructuredMidText: 'after', pasteStructuredListForm: 'drop', pasteStructuredOnParent: 'after' },
  holds(doc) {
    const o = doc as Outline;
    // a run of numbered siblings is numbered from 1, whatever it was written with
    const run: number[] = [];
    for (const b of o.blocks) {
      run.length = b.depth + 1;
      const n = /^(\d{1,9})\. /.exec(b.text);
      run[b.depth] = n ? (run[b.depth] ?? 0) + 1 : 0;
      if (n && Number(n[1]) !== run[b.depth]) return 'a numbered list from another number than 1';
    }
    if (!o.sel) return undefined;
    const code = codeOf(o.blocks[o.sel.block]!.text);
    const inCode = (p: number): boolean => !!code && p >= code.start && p <= code.end;
    // the code's editor has the code alone: a caret on a fence has no place there
    if (code && !(inCode(o.sel.anchor) && inCode(o.sel.head))) return "a caret on a code block's fence";
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('.ls-block', { timeout: 120000 });
    // the proxy's patches name the store and the backend's pages: a bundle they don't match leaves them out
    const named = await page.evaluate(() => Array.isArray((globalThis as any).__sxsDoc) && Array.isArray((globalThis as any).__sxsPages) && typeof (globalThis as any).__sxsFacets === 'function');
    if (!named) throw new Error("Tine's bundle didn't take the proxy's patches (tine/proxy.ts): its store or pages aren't named");
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
    await idle();
    // undo only on the page being edited: each test has a page of its own, so undo can't reach into an
    // earlier test (the default, global, undid the last test's edit and went back to its page)
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await page.keyboard.press('Control+Shift+p');
      await idle();
      await page.keyboard.type('Toggle undo/redo mode');
      await idle();
      await page.keyboard.press('Enter');
      await idle();
      const toast = await page.evaluate(() => [...document.querySelectorAll('[class*=toast]')].map((e) => (e as HTMLElement).innerText).join(' | '));
      if (/page only/i.test(toast)) break;
      if (i === 1) throw new Error(`Tine's undo didn't go page-only (${toast || 'no toast'})`);
    }
    // ready once a key does what it should: Tab indents
    await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
    await idle();
    await page.keyboard.press('Tab');
    await idle();
    if (((await this.read(page)) as Outline).blocks[1]?.depth !== 1) throw new Error("Tine's keys didn't come up: Tab doesn't indent");
    // the app says no version in a browser: its bundle's name and the guide's export date stand in
    return page.evaluate(async () => {
      const bundle = [...document.scripts].map((s) => /app-([\w-]+)\.js/.exec(s.src)?.[1]).find(Boolean);
      const exported = await fetch('snapshot.json')
        .then((r) => r.json())
        .then((j) => String(j.exported_at ?? '').slice(0, 10), () => '');
      return [exported && `guide of ${exported}`, bundle && `app-${bundle}`].filter(Boolean).join(', ') || undefined;
    });
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const blocks = o.blocks.map((b) => ({ depth: b.depth, ...toTine(b.text) }));
    const swapped = o.sel && blocks[o.sel.block]!;
    const sel = o.sel && { block: o.sel.block, anchor: shiftOffset(o.sel.anchor, swapped!.from, swapped!.to), head: shiftOffset(o.sel.head, swapped!.from, swapped!.to) };
    const current = (pageState(page).current = `sxs-${run}-${String(++pages).padStart(5, '0')}`);
    await page.evaluate(
      ({ name, blocks }) => {
        const roots: any[] = [];
        const stack: any[] = [];
        // a block's header facets as the backend ships them (Tine takes them as they are, `seedFacets`):
        // Tine's own reading of its text, so a numbered block is ordered to it, a `TODO` a task, a `# ` a heading
        const facets = (raw: string) => {
          const f = (globalThis as any).__sxsFacets(raw, 'md');
          return { marker: f.marker ?? undefined, priority: f.priority ?? undefined, heading_level: f.headingLevel ?? undefined, scheduled: f.scheduled ?? undefined, deadline: f.deadline ?? undefined, tags: f.tags, properties: f.properties };
        };
        blocks.forEach((b, k) => {
          const dto = { id: `${name}-${k}`, raw: b.text, collapsed: false, children: [], ...facets(b.text) };
          stack.length = b.depth;
          (b.depth === 0 ? roots : stack[b.depth - 1].children).push(dto);
          stack[b.depth] = dto;
        });
        (globalThis as any).__sxsPages.push({ name, kind: 'page', title: name, pre_block: null, format: 'md', read_only: false, guide: false, blocks: roots });
        (document.activeElement as HTMLElement | null)?.blur();
      },
      { name: current, blocks: blocks.map(({ depth, text }) => ({ depth, text })) },
    );
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 60, timeout: 5000 }));
    // opened as a user would: the search, its name, Enter (the app has no route to a page)
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await idle();
    await page.keyboard.type(current);
    await idle();
    await page.keyboard.press('Enter');
    await idle();
    const opened = await page.evaluate((name) => !!(globalThis as any).__sxsDoc[0].pages.find((p: any) => p.name === name) && !!document.querySelector(`.ls-block[data-block-id="${name}-0"]`), current);
    if (!opened) throw new Error(`the test's page didn't open (${current})`);
    if (!sel) return;
    await page.locator(`.ls-block[data-block-id="${current}-${sel.block}"] > .block-main .block-content`).first().click();
    await idle();
    // the caret where the test has it, until it stays: a block opened for editing may set its own a
    // moment later (a code block puts it at the start)
    const place = ({ id, anchor, head }: { id: string; anchor: number; head: number }): string => {
      const ta = document.activeElement as HTMLTextAreaElement | null;
      if (ta?.tagName !== 'TEXTAREA' || ta.closest('.ls-block')?.getAttribute('data-block-id') !== id) return 'not editing';
      const [start, end, dir] = [Math.min(anchor, head), Math.max(anchor, head), head < anchor ? 'backward' : 'forward'];
      if (ta.selectionStart === start && ta.selectionEnd === end && (start === end || ta.selectionDirection === dir)) return 'placed';
      ta.setSelectionRange(start, end, dir as 'forward' | 'backward');
      return 'set';
    };
    const code = codeOf(blocks[sel.block]!.text);
    const at = { id: `${current}-${sel.block}`, anchor: sel.anchor - (code?.start ?? 0), head: sel.head - (code?.start ?? 0) };
    let state = '';
    for (let attempt = 0; attempt < 5 && state !== 'placed'; attempt++) {
      state = await page.evaluate(place, at);
      if (state === 'not editing') throw new Error(`the block didn't open for editing (${at.id})`);
      if (state === 'set') await idle();
    }
  },

  async read(page: Page) {
    const raw = await page.evaluate((name) => {
      const [doc] = (globalThis as any).__sxsDoc;
      const p = doc.pages.find((q: any) => q.name === name);
      const flat: { depth: number; text: string; id: string; number: number | null }[] = [];
      // a numbered block's place in its run of numbered siblings, from 1, as Tine counts it
      const numbered = (raw: string): boolean => /(?:^|\n)logseq\.order-list-type:: number[ \t]*(?:\n|$)/.test(raw ?? '');
      const walk = (ids: string[], d: number) => {
        let n = 0;
        ids.forEach((id) => {
          n = numbered(doc.byId[id].raw) ? n + 1 : 0;
          flat.push({ depth: d, text: doc.byId[id].raw, id, number: n || null });
          walk(doc.byId[id].children, d + 1);
        });
      };
      walk(p?.roots ?? [], 0);
      const ta = document.activeElement as HTMLTextAreaElement | null;
      const editing = ta?.tagName === 'TEXTAREA' ? ta.closest('.ls-block')?.getAttribute('data-block-id') : null;
      const i = editing ? flat.findIndex((b) => b.id === editing) : -1;
      const back = ta?.selectionDirection === 'backward';
      const selected = [...document.querySelectorAll('.block-main.selected')]
        .map((e) => flat.findIndex((b) => b.id === e.closest('.ls-block')?.getAttribute('data-block-id')))
        .filter((k) => k >= 0);
      return {
        blocks: flat.map(({ depth, text }) => ({ depth, text })),
        numbers: flat.map(({ number }) => number),
        sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null,
        code: i >= 0 && ta!.classList.contains('code-edit'),
        selected,
      };
    }, pageState(page).current);
    // in a code block's editor, the offsets are the code's
    if (raw.sel && raw.code) {
      const start = codeOf(raw.blocks[raw.sel.block]!.text)?.start ?? 0;
      raw.sel = { block: raw.sel.block, anchor: raw.sel.anchor + start, head: raw.sel.head + start };
    }
    const swaps = raw.blocks.map((b, i) => fromTine(b.text, raw.numbers[i] ?? null));
    const blocks = raw.blocks.map((b, i) => ({ depth: b.depth, text: swaps[i]!.text }));
    let sel = raw.sel;
    if (sel) {
      const { from, to, cut } = swaps[sel.block]!;
      const at = (p: number): number => shiftOffset(p, from, to) + (cut !== undefined && shiftOffset(p, from, to) > cut ? 1 : 0);
      sel = { block: sel.block, anchor: at(sel.anchor), head: at(sel.head) };
    }
    // the block's later lines keep the escapes Markdown source has at their start; a block's text needs none
    return unescapeLaterLines({ blocks, sel, ...(raw.selected.length && { selected: raw.selected }) });
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // no key for the document's ends: Up (Down) until the caret stops, then the block's start (end)
    const up = /DocStart$/.test(action);
    const shift = action.startsWith('select') ? 'Shift+' : '';
    let last = '';
    for (let i = 0; i < 200; i++) {
      const now = JSON.stringify((await this.read(page)).sel);
      if (now === last) break;
      last = now;
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
    }
    await page.keyboard.press(`${shift}${up ? 'Control+Home' : 'Control+End'}`);
    await settle();
  },
};
