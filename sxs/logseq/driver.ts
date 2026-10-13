/// <reference lib="dom" />
// Logseq's web demo (https://demo.logseq.com/, the file-based app, "OG"): a demo graph that lives in
// the browser and saves nothing. Each test gets a fresh page, built and its caret placed through
// Logseq's plugin API (`window.logseq.api`); the actions are Logseq's keys on Linux.
//
// - A block's text is its content; a task's checkbox is Logseq's `TODO` / `DONE`.
// - Undo is Logseq's "page only" history, so it stays within the test's page.
// - `outdent: logical` is Logseq's "logical outdenting" setting, switched per test.
// - The block being edited is read from its textarea: Logseq saves the textarea to its database
//   about half a second after typing stops, so the database lags behind it.
// - `editor/op`, Logseq's flag for an insert, delete, indent, paste or undo in flight, counts as busy
//   when settling. An exception inside such an operation leaves it set (and Logseq then stops saving
//   an editor it leaves): the runner reports the test where it got stuck, and the next test starts by
//   clearing it. README.md has the rest of what Logseq does that a driver has to know.

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import type { Outline } from '../lib/outline.ts';

/** Logseq's keys for the spec's actions (Linux); the `select…` motions add Shift. */
const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/**
 * Canonical task checkboxes and Logseq's markers, both ways: `[ ]` is `TODO` and `[x]` is `DONE`, and
 * what follows stays (`[ ] a` is `TODO a`, an empty `[ ]` is `TODO`). Logseq's other markers read as
 * tasks too.
 */
const TO_LOGSEQ: [RegExp, string][] = [
  [/^\[ \](?= |$)/, 'TODO'],
  [/^\[[xX]\](?= |$)/, 'DONE'],
];
const FROM_LOGSEQ: [RegExp, string][] = [
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

/** The page the current test runs on, to delete once the next test has moved on. */
let current: string | null = null;

export const driver: Driver = {
  name: 'logseq',
  title: 'Logseq',
  url: 'https://demo.logseq.com/',
  model: 'block',
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveBlockUp: 'Alt+Shift+ArrowUp',
    moveBlockDown: 'Alt+Shift+ArrowDown',
    // Logseq has no key to delete to the line's start on Linux; selecting there and deleting is what a user does
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    // Escape selects the block being edited, and Backspace deletes the selected blocks with their children
    deleteSubtree: ['Escape', 'Backspace'],
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
  // quotes and callouts are skipped for every block app (../lib/outline.ts)
  refuses: [],
  behaves: { outdent: 'direct', enterOnEmptyItem: 'sibling' },
  // Logseq's "logical outdenting" (Settings › Editor, `:editor/logical-outdenting?`)
  settings: { outdent: ['direct', 'logical'] },
  holds(doc: Outline) {
    // Logseq trims a stored block's text; only the block being edited (its textarea) keeps it as is
    const trimmed = doc.blocks.findIndex((b, i) => i !== doc.sel?.block && /^\s|\s$/.test(swapPrefix(b.text, TO_LOGSEQ).text));
    return trimmed >= 0 ? 'whitespace at the edge of a block not being edited' : undefined;
  },
  idle: {
    busy: `(() => { const op = window.logseq?.api?.get_state_from_store('editor/op'); return op != null && op !== 'nil'; })()`,
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    // the plugin API comes up before the demo graph is parsed and the journal rendered
    await page.waitForFunction(() => (window as any).logseq?.api?.create_page && document.querySelector('#main-content-container .ls-block'), null, { timeout: 120000 });
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
    // Logseq installs its global keys (Tab among them) through `shortcut/refresh!`, debounced by a
    // second after startup; until then Tab moves the focus out of the editor and the key is lost. So
    // the app is ready once Tab indents a block.
    let ready = false;
    for (let t0 = Date.now(); !ready && Date.now() - t0 < 30000; ) {
      await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
      await idle();
      await page.keyboard.press('Tab');
      await idle();
      ready = ((await this.read(page)) as Outline).blocks[1]?.depth === 1;
      if (!ready) await page.waitForTimeout(250);
    }
    if (!ready) throw new Error("Logseq's keys didn't come up: Tab doesn't indent");
    // undo only on the page being edited (Logseq's "page only" history, a setting of its right
    // sidebar): each test has a page of its own, so undo can't reach into an earlier test
    await page.evaluate(() => (window as any).logseq.api.set_state_from_store('history/page-only-mode?', true));
    // the build: the web demo doesn't say its version, its bundle's ETag stands in for it
    return page.evaluate(async () => {
      const res = await fetch('/js/main.js', { method: 'HEAD' });
      const etag = res.headers.get('etag')?.replace(/^W\//, '').replace(/"/g, '');
      return etag ? `build ${etag.slice(0, 8)}` : undefined;
    });
  },

  async load(page: Page, doc: Outline) {
    const blocks = doc.blocks.map((b) => ({ depth: b.depth, ...swapPrefix(b.text, TO_LOGSEQ) }));
    const swapped = doc.sel && blocks[doc.sel.block]!;
    const sel = doc.sel && { block: doc.sel.block, anchor: shiftOffset(doc.sel.anchor, swapped!.from, swapped!.to), head: shiftOffset(doc.sel.head, swapped!.from, swapped!.to) };
    current = await page.evaluate(
      async ({ blocks, sel, previous }) => {
        const api = (window as any).logseq.api;
        // a flag an exception left set would read as busy all through this test
        if (api.get_state_from_store('editor/op') != null) api.set_state_from_store('editor/op', null);
        await api.exit_editing_mode(false);
        // the last test's page goes first (deleting a page takes Logseq to its home page); a run's
        // first test sweeps up what earlier runs left
        const stale = previous ? [previous] : ((await api.get_all_pages()) ?? []).map((p: any) => p.name ?? p['original-name']).filter((n: string) => /^spec-/.test(n ?? ''));
        for (const name of stale) await api.delete_page(name).catch(() => {});
        const name = 'spec-' + Math.random().toString(36).slice(2, 10);
        await api.create_page(name, {}, { redirect: true, createFirstBlock: true });
        const roots: any[] = [];
        const stack: any[] = [];
        for (const b of blocks) {
          const node = { content: b.text, children: [] as any[] };
          stack.length = b.depth;
          (b.depth === 0 ? roots : stack[b.depth - 1].children).push(node);
          stack[b.depth] = node;
        }
        const first = (await api.get_page_blocks_tree(name))[0];
        await api.insert_batch_block(first.uuid, roots, { sibling: true });
        await api.remove_block(first.uuid);
        const flat: any[] = [];
        const walk = (bs: any[]) => bs.forEach((x) => (flat.push(x), walk(x.children ?? [])));
        walk(await api.get_page_blocks_tree(name));
        // a batch insert drops a line's leading whitespace (code loses its indentation); a single update keeps it
        for (let i = 0; i < flat.length; i++) if (flat[i].content !== blocks[i]!.text) await api.update_block(flat[i].uuid, blocks[i]!.text);
        // the page renders after the redirect, and a block can be edited once it is on screen
        const rendered = () => flat.every((b) => document.querySelector(`#main-content-container .ls-block[blockid="${b.uuid}"]`));
        for (let i = 0; i < 300 && !rendered(); i++) await new Promise((r) => setTimeout(r, 10));
        if (!rendered()) throw new Error(`the test page didn't render (at ${location.hash})`);
        // inserting opens a block for editing, later: let that pass before choosing the block
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        if (sel) {
          const { anchor, head } = sel;
          const target = flat[sel.block].uuid;
          // the target's editor, if it is the one with the focus: Logseq opens an inserted block for
          // editing a moment later, so the focus can move to another block's after the target's opened
          const own = (): HTMLTextAreaElement | null => {
            const ta = document.activeElement as HTMLTextAreaElement | null;
            return ta?.tagName === 'TEXTAREA' && ta.closest('.ls-block')?.getAttribute('blockid') === target ? ta : null;
          };
          const editing = async () => !!own() && (await api.check_editing()) === target;
          const open = async (): Promise<void> => {
            for (let attempt = 0; attempt < 3 && !(await editing()); attempt++) {
              await api.edit_block(target, { pos: head });
              // edit_block opens the editor asynchronously
              for (let i = 0; i < 100 && !(await editing()); i++) await new Promise((r) => setTimeout(r, 10));
            }
            if (!(await editing())) throw new Error(`the block didn't open for editing (focus: ${document.activeElement?.tagName}, editing: ${await api.check_editing()})`);
          };
          await open();
          // what Logseq trimmed on storing (a trailing line break, edge spaces) the target's editor
          // holds, as if typed; Logseq may still re-render the editor from what it stored, so until it
          // sticks, and always into the target's editor (once, the text went into another block's)
          const text = blocks[sel.block]!.text;
          for (let attempt = 0; attempt < 5 && own()?.value !== text; attempt++) {
            if (!own()) await open();
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(own()!, text);
            own()!.dispatchEvent(new Event('input', { bubbles: true }));
            await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
          }
          if (!own()) await open();
          own()!.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), head < anchor ? 'backward' : 'forward');
        } else await api.exit_editing_mode(false);
        return name;
      },
      { blocks: blocks.map(({ depth, text }) => ({ depth, text })), sel, previous: current },
    );
  },

  async read(page: Page) {
    const raw = await page.evaluate(async (name) => {
      const api = (window as any).logseq.api;
      const flat: { depth: number; text: string; uuid: string }[] = [];
      const walk = (bs: any[], d: number) => bs.forEach((x) => (flat.push({ depth: d, text: x.content, uuid: x.uuid }), walk(x.children ?? [], d + 1)));
      walk(await api.get_page_blocks_tree(name), 0);
      const editing = await api.check_editing();
      const ta = document.activeElement as HTMLTextAreaElement | null;
      const i = editing && ta?.tagName === 'TEXTAREA' ? flat.findIndex((b) => b.uuid === editing) : -1;
      // the block being edited: its textarea, ahead of the database
      if (i >= 0) flat[i]!.text = ta!.value;
      const back = ta?.selectionDirection === 'backward';
      const selected = ((await api.get_selected_blocks()) ?? []).map((b: any) => flat.findIndex((f) => f.uuid === b.uuid)).filter((k: number) => k >= 0);
      return {
        blocks: flat.map(({ depth, text }) => ({ depth, text })),
        sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null,
        selected,
      };
    }, current);
    const swaps = raw.blocks.map((b) => swapPrefix(b.text, FROM_LOGSEQ));
    const blocks = raw.blocks.map((b, i) => ({ depth: b.depth, text: swaps[i]!.text }));
    let sel = raw.sel;
    if (sel) {
      const { from, to } = swaps[sel.block]!;
      sel = { block: sel.block, anchor: shiftOffset(sel.anchor, from, to), head: shiftOffset(sel.head, from, to) };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },

  async configure(page: Page, settings) {
    // what the Settings toggle sets, in the graph's config as Logseq holds it; the toggle also writes
    // config.edn, and Logseq reinstalls its keys a second after that file changes, which a test
    // starting meanwhile would race. `@` keeps the graph's name a string in the state's path.
    await page.evaluate((logical) => {
      const api = (window as any).logseq.api;
      const repo = api.get_state_from_store('git/current-repo');
      api.set_state_from_store(['config', `@${repo}`, 'editor/logical-outdenting?'], logical);
      if (!!api.get_current_graph_configs('editor/logical-outdenting?') !== logical) throw new Error(`Logseq's logical outdenting didn't change to ${logical}`);
    }, settings.outdent === 'logical');
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // Logseq has no key for the document's ends: Up (Down) until the caret stops, then Home (End)
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
    await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
    await settle();
  },
};
