/// <reference lib="dom" />
// Roam Research's public help graph (https://roamresearch.com/#/app/help, see README.md): open to
// anyone without a login, editable in the session, and saved nowhere (Roam says "No changes to the
// help database will be saved", and sends none). Each test gets a page of its own, made and read
// through Roam's public API (`window.roamAlphaAPI`); the actions are Roam's keys on Linux.
//
// - A block's text is its string; a task is Roam's `{{[[TODO]]}} ` / `{{[[DONE]]}} `, a heading the
//   block's heading attribute (1 to 3), shown here as `#` to `###`.
// - The block being edited is read from its textarea.

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import type { Outline } from '../lib/outline.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A block as Roam holds it: its string, and its heading level (0: none). */
interface RoamBlock {
  depth: number;
  string: string;
  heading: number;
}

/** Canonical prefixes and what Roam holds for them: a task's marker is text, a heading's level an attribute. */
function toRoam(depth: number, text: string): RoamBlock & { from: number; to: number } {
  const task = /^\[([ xX])\](?= |$)/.exec(text);
  if (task) {
    const marker = task[1] === ' ' ? '{{[[TODO]]}}' : '{{[[DONE]]}}';
    return { depth, string: marker + text.slice(3), heading: 0, from: 3, to: marker.length };
  }
  const heading = /^(#{1,3}) /.exec(text);
  if (heading) return { depth, string: text.slice(heading[0].length), heading: heading[1]!.length, from: heading[0].length, to: 0 };
  return { depth, string: text, heading: 0, from: 0, to: 0 };
}

function fromRoam(b: RoamBlock): { text: string; from: number; to: number } {
  const task = /^\{\{\[\[(TODO|DONE)\]\]\}\}/.exec(b.string);
  if (task) {
    const box = task[1] === 'TODO' ? '[ ]' : '[x]';
    return { text: box + b.string.slice(task[0].length), from: task[0].length, to: 3 };
  }
  if (b.heading) {
    const marks = '#'.repeat(b.heading) + ' ';
    return { text: marks + b.string, from: 0, to: marks.length };
  }
  return { text: b.string, from: 0, to: 0 };
}

/** An offset in a text whose prefix of `from` characters became `to` characters: past it, shifted; inside it, clamped. */
const shiftOffset = (p: number, from: number, to: number): number => (p >= from ? p - from + to : Math.min(p, to));

/** The page the current test runs on, to delete when the next test starts. */
let current: string | null = null;

export const driver: Driver = {
  name: 'roam',
  title: 'Roam',
  url: 'https://roamresearch.com/#/app/help',
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
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
  // Shift+Tab leaves later siblings with the parent (logical outdenting); Enter on an empty nested
  // block outdents it, as ourus's config says of Roam
  behaves: { outdent: 'logical', enterOnEmptyItem: 'outdent', pasteStructuredLines: 'items', pasteStructuredMidText: 'after' },
  // Roam's code blocks are a format of its own
  refuses: ['code block', 'html', 'table', 'math'],
  holds(doc) {
    const o = doc as Outline;
    if (o.blocks.some((b) => /^#{4,6} /.test(b.text))) return 'a heading deeper than H3';
    if (o.sel && Math.min(o.sel.anchor, o.sel.head) < toRoam(0, o.blocks[o.sel.block]!.text).from && /^#/.test(o.blocks[o.sel.block]!.text)) return "a caret in a heading's #s";
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => (window as any).roamAlphaAPI?.data && document.querySelector('.roam-block'), null, { timeout: 120000 });
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`Roam didn't settle after loading: ${settled.pending}`);
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
    let ready = false;
    for (let t0 = Date.now(); !ready && Date.now() - t0 < 30000; ) {
      await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
      await idle();
      await page.keyboard.press('Tab');
      await idle();
      ready = ((await this.read(page)) as Outline).blocks[1]?.depth === 1;
      if (!ready) await page.waitForTimeout(250);
    }
    if (!ready) throw new Error("Roam's keys didn't come up: Tab doesn't indent");
    // Roam's version and commit are written into its bundle, not exposed (the API has a version of its own)
    return page.evaluate(async () => {
      const src = [...document.scripts].map((s) => s.src).find((s) => /\/compiled\/main\.js/.test(s));
      const m = src ? /"(\d+\.\d+\.\d+)","([0-9a-f]{7,})"/.exec(await (await fetch(src)).text()) : null;
      return m ? `${m[1]} (${m[2]}; API ${(window as any).roamAlphaAPI.apiVersion})` : undefined;
    });
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const blocks = o.blocks.map((b) => toRoam(b.depth, b.text));
    const sel = o.sel && { block: o.sel.block, anchor: shiftOffset(o.sel.anchor, blocks[o.sel.block]!.from, blocks[o.sel.block]!.to), head: shiftOffset(o.sel.head, blocks[o.sel.block]!.from, blocks[o.sel.block]!.to) };
    current = await page.evaluate(
      async ({ blocks, sel, previous }) => {
        const api = (window as any).roamAlphaAPI;
        const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
        (document.activeElement as HTMLElement | null)?.blur();
        if (previous) await api.data.page.delete({ page: { uid: previous } }).catch(() => {});
        const pageUid = api.util.generateUID();
        await api.data.page.create({ page: { title: `ourus sxs ${pageUid}`, uid: pageUid } });
        const uids: string[] = [];
        const parents: string[] = [pageUid];
        const order: number[] = [0];
        for (const b of blocks) {
          const uid = api.util.generateUID();
          await api.data.block.create({ location: { 'parent-uid': parents[b.depth], order: order[b.depth] }, block: { string: b.string, uid, ...(b.heading && { heading: b.heading }), open: true } });
          order[b.depth] = (order[b.depth] ?? 0) + 1;
          parents[b.depth + 1] = uid;
          order[b.depth + 1] = 0;
          parents.length = b.depth + 2;
          order.length = b.depth + 2;
          uids.push(uid);
        }
        await api.ui.mainWindow.openPage({ page: { uid: pageUid } });
        const rendered = () => uids.every((u) => document.querySelector(`.roam-article [id$="${u}"]`));
        for (let i = 0; i < 300 && !rendered(); i++) await wait(10);
        if (!rendered()) throw new Error(`the test page didn't render (at ${location.hash})`);
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        if (sel) {
          const uid = uids[sel.block]!;
          const editing = () => (document.activeElement as HTMLElement | null)?.tagName === 'TEXTAREA' && api.ui.getFocusedBlock()?.['block-uid'] === uid;
          for (let attempt = 0; attempt < 3 && !editing(); attempt++) {
            await api.ui.setBlockFocusAndSelection({ location: { 'block-uid': uid, 'window-id': 'main-window' }, selection: { start: Math.min(sel.anchor, sel.head), end: Math.max(sel.anchor, sel.head) } });
            for (let i = 0; i < 100 && !editing(); i++) await wait(10);
          }
          if (!editing()) throw new Error(`the block didn't open for editing (focus: ${document.activeElement?.tagName})`);
          const ta = document.activeElement as HTMLTextAreaElement;
          ta.setSelectionRange(Math.min(sel.anchor, sel.head), Math.max(sel.anchor, sel.head), sel.head < sel.anchor ? 'backward' : 'forward');
        }
        return pageUid;
      },
      { blocks: blocks.map(({ depth, string, heading }) => ({ depth, string, heading })), sel, previous: current },
    );
  },

  async read(page: Page) {
    const raw = await page.evaluate((pageUid) => {
      const api = (window as any).roamAlphaAPI;
      const tree = api.pull('[:block/uid :block/string :block/heading :block/order {:block/children ...}]', [':block/uid', pageUid]);
      const flat: { depth: number; string: string; heading: number; uid: string }[] = [];
      const walk = (kids: any[] | undefined, depth: number) => {
        for (const k of [...(kids ?? [])].sort((a, b) => a[':block/order'] - b[':block/order'])) {
          flat.push({ depth, string: k[':block/string'] ?? '', heading: k[':block/heading'] ?? 0, uid: k[':block/uid'] });
          walk(k[':block/children'], depth + 1);
        }
      };
      walk(tree?.[':block/children'], 0);
      const focused = api.ui.getFocusedBlock()?.['block-uid'];
      const ta = document.activeElement as HTMLTextAreaElement | null;
      const i = focused && ta?.tagName === 'TEXTAREA' ? flat.findIndex((b) => b.uid === focused) : -1;
      // the block being edited: its textarea, ahead of what Roam stored
      if (i >= 0) flat[i]!.string = ta!.value;
      const back = ta?.selectionDirection === 'backward';
      return { flat, sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null };
    }, current);
    const texts = raw.flat.map((b) => fromRoam(b));
    const blocks = raw.flat.map((b, i) => ({ depth: b.depth, text: texts[i]!.text }));
    let sel = raw.sel;
    if (sel) {
      const { from, to } = texts[sel.block]!;
      sel = { block: sel.block, anchor: shiftOffset(sel.anchor, from, to), head: shiftOffset(sel.head, from, to) };
    }
    return { blocks, sel };
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // no key for the document's ends: Up (Down) until the caret stops, then Home (End); Up from the
    // first block goes into the page's title, which is no block of the test, so back down from there
    const up = /DocStart$/.test(action);
    const shift = action.startsWith('select') ? 'Shift+' : '';
    let last = '';
    for (let i = 0; i < 200; i++) {
      const sel = ((await this.read(page)) as Outline).sel;
      const now = JSON.stringify(sel);
      if (now === last || !sel) break;
      last = now;
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
    }
    if (!((await this.read(page)) as Outline).sel) {
      await page.keyboard.press(up ? 'ArrowDown' : 'ArrowUp');
      await settle();
    }
    await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
    await settle();
  },
};
