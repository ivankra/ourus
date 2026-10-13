/// <reference lib="dom" />
// SilverBullet's live demo (https://demo.silverbullet.md/personal/, see README.md): a Markdown editor
// (CodeMirror 6) with outline commands, so a test's buffer is its document as written (the `text`
// model). The demo is read-only as served; the proxy makes it editable and keeps it from being
// written to (proxy.ts). Each test gets a page of its own, written into SilverBullet's space in the
// browser and opened, so its editor starts with an empty history; the caret is placed through
// CodeMirror, and the actions are SilverBullet's keys on Linux.

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import type { TextDoc } from '../lib/text.ts';

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

/** Pages are numbered within a page load, so each test's page is new. */
let pages = 0;

export const driver: Driver = {
  name: 'silverbullet',
  title: 'SilverBullet',
  url: 'https://demo.silverbullet.md/personal/',
  model: 'text',
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    // "Outline: Move Right" and "Move Left": an item with its children, a heading's level (Tab is
    // CodeMirror's indentMore, which indents lines, not items)
    indent: ['Control+.', 'l'],
    outdent: ['Control+.', 'h'],
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "Outline: Move Up" and "Move Down"
    moveBlockUp: 'Alt+ArrowUp',
    moveBlockDown: 'Alt+ArrowDown',
    // "Delete Line Boundary Backward" is bound on a Mac only (Cmd-Backspace)
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  holds(doc) {
    // CodeMirror keeps line breaks as LF
    return (doc as TextDoc).text.includes('\r') ? 'CR line endings' : undefined;
  },
  idle: {
    // commands run in plug workers: one is under way while a worker owes an answer
    busy: `[...(window.client?.clientSystem?.system?.loadedPlugs?.values() ?? [])].some((p) => p.sandbox?.outstandingInvocations?.size > 0)`,
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => (window as any).client?.systemReady && (window as any).client?.editorView, null, { timeout: 120000 });
    // a profile that hasn't synced the space yet (a cold run) has its service worker pass every
    // request to the server until the first full sync, a write too (503 here: "Offline"); after it,
    // the worker serves the space from the browser's copy, and a write stays there
    await page.waitForFunction(() => navigator.serviceWorker?.controller && (window as any).client?.fullSyncCompleted, null, { timeout: 120000 });
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`SilverBullet didn't settle after loading: ${settled.pending}`);
    // ready once an outline command (a plug, loaded on first use) indents an item
    const idle = () => page.evaluate((busy) => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000, busy }), this.idle!.busy!);
    let ready = false;
    for (let t0 = Date.now(); !ready && Date.now() - t0 < 30000; ) {
      await this.load(page, { text: '- a\n- b\n', sel: { anchor: 7, head: 7 } });
      await idle();
      for (const key of this.keys.indent as string[]) {
        await page.keyboard.press(key);
        await idle();
      }
      ready = ((await this.read(page)) as TextDoc).text === '- a\n  - b\n';
      if (!ready) await page.waitForTimeout(250);
    }
    if (!ready) throw new Error("SilverBullet's outline commands didn't come up: Ctrl+. l doesn't indent");
    return page.evaluate(() => (window as any).syscall('system.getVersion') as Promise<string>);
  },

  async load(page: Page, doc) {
    const { text, sel } = doc as TextDoc;
    const name = `ourus-sxs-${Date.now().toString(36)}-${++pages}`;
    await page.evaluate(
      async ({ name, text, sel }) => {
        const w = window as any;
        // the page as stored, then opened: its editor starts with it, and with no history to undo
        await w.syscall('space.writePage', name, text);
        await w.client.navigate({ path: `${name}.md` });
        const opened = () => w.client.currentName() === name && w.client.editorView.state.doc.toString() === text;
        for (let i = 0; i < 300 && !opened(); i++) await new Promise((r) => setTimeout(r, 10));
        if (!opened()) throw new Error(`the test page didn't open (at ${w.client.currentName()})`);
        const v = w.client.editorView;
        v.dispatch({ selection: sel ?? { anchor: 0 } });
        v.focus();
      },
      { name, text, sel },
    );
  },

  async read(page: Page) {
    return page.evaluate(() => {
      const v = (window as any).client.editorView;
      const { anchor, head } = v.state.selection.main;
      return { text: v.state.doc.toString() as string, sel: v.hasFocus ? { anchor, head } : null };
    });
  },
};
