/// <reference lib="dom" />
// Dynalist's live demo (https://dynalist.io/demo, see README.md): a sample document anyone can edit
// without a login, kept in the page and saved nowhere. Each test replaces the document's items with
// its own, made and read through Dynalist's app objects (`DYNALIST.app.app_document`); the actions are
// Dynalist's keys on Linux.
//
// - A block is an item's content, which holds line breaks (Ctrl+Shift+Enter, "insert new line", is
//   the spec's Shift-Enter; Dynalist's Shift+Enter goes to the item's note, which blocks don't have).
// - A to-do is an item with a checkbox (`[ ] `, `[x] ` when checked), H1 to H3 its heading level:
//   both are the item's attributes, not text, so a caret can't be inside them.
// - Dynalist outdents logically unless "unindent in place" is on (a preference): set per test.
// - The model follows the editor as it types: what is read is what Dynalist holds.

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

/** An item as the page makes and reads it. */
interface Item {
  depth: number;
  content: string;
  /** Not made by a test; read, after the content and a line break, should an action make one. */
  note: string;
  checkbox: boolean;
  checked: boolean;
  /** 0: none, 1 to 3: H1 to H3. */
  heading: number;
}

/** A block's canonical text as an item, and how many characters of it the item's attributes took. */
function toItem(depth: number, text: string): Item & { prefix: number } {
  const task = /^\[([ xX])\](?: |$)/.exec(text);
  const rest = task ? text.slice(task[0].length) : text;
  const heading = /^(#{1,3}) /.exec(rest);
  const prefix = (task?.[0].length ?? 0) + (heading?.[0].length ?? 0);
  return { depth, content: text.slice(prefix), note: '', checkbox: !!task, checked: !!task && task[1] !== ' ', heading: heading?.[1]!.length ?? 0, prefix };
}

/** An item's canonical text, and the length of the prefix its attributes stand for. */
function fromItem(it: Item): { text: string; prefix: number } {
  const prefix = (it.checkbox || it.checked ? (it.checked ? '[x] ' : '[ ] ') : '') + (it.heading ? '#'.repeat(it.heading) + ' ' : '');
  return { text: prefix + it.content + (it.note ? '\n' + it.note : ''), prefix: prefix.length };
}

export const driver: Driver = {
  name: 'dynalist',
  title: 'Dynalist',
  url: 'https://dynalist.io/demo',
  model: 'block',
  keys: {
    enter: 'Enter',
    shiftEnter: 'Control+Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Control+ArrowUp',
    moveSubtreeDown: 'Control+ArrowDown',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    deleteSubtree: 'Control+Shift+Backspace',
    pasteStructured: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    // "go to first item" and "go to last item" land at the item's start and end
    cursorDocStart: 'Control+Home',
    cursorDocEnd: 'Control+End',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  refuses: [],
  behaves: { outdent: 'logical', pasteStructuredLines: 'items' },
  // "Unindent in place" (Settings › Editor): Shift+Tab takes the item's later siblings along as children
  settings: { outdent: ['logical', 'direct'] },
  holds(doc) {
    const o = doc as Outline;
    if (o.blocks.some((b) => /^(\[[ xX]\] )?#{4,6} /.test(b.text))) return 'a heading deeper than H3';
    // a checkbox and a heading level are the item's attributes, not text: no caret goes there
    if (o.sel && Math.min(o.sel.anchor, o.sel.head) < toItem(0, o.blocks[o.sel.block]!.text).prefix) return "a caret in a task's checkbox or a heading's #s";
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => (window as any).DYNALIST?.app?.app_document?.document && document.querySelector('.Node-content'), null, { timeout: 120000 });
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`Dynalist didn't settle after loading: ${settled.pending}`);
    // ready once a key does what it should: Tab indents
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
    if (!ready) throw new Error("Dynalist's keys didn't come up: Tab doesn't indent");
    return page.evaluate(() => {
      const D = (window as any).DYNALIST;
      return `${D.VERSION} (build ${D.DEPLOY_BUILD}, ${String(D.DEPLOY_COMMIT).slice(0, 7)})`;
    });
  },

  async configure(page: Page, settings) {
    await page.evaluate((inPlace) => (window as any).DYNALIST.app.preferences.set_boolean('unindent_in_place', inPlace), settings.outdent === 'direct');
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const items = o.blocks.map((b) => toItem(b.depth, b.text));
    const sel = o.sel && { block: o.sel.block, anchor: o.sel.anchor - items[o.sel.block]!.prefix, head: o.sel.head - items[o.sel.block]!.prefix };
    await page.evaluate(
      async ({ items, sel }) => {
        const ad = (window as any).DYNALIST.app.app_document;
        (document.activeElement as HTMLElement | null)?.blur();
        ad.ui.selection().set_no_select();
        const root = ad.document.get_node_collection().get_root();
        if (!ad.ui.current_root.is_root()) ad.view.zoom_node(root);
        // the last test's items go and this test's come, in one edit; then the history is emptied, so
        // that undo stops where the test starts
        const made: any[] = [];
        ad.view.exec((a: any) => {
          for (const child of root.children.array().slice()) a.detach(child);
          const parents = [root];
          for (const it of items) {
            const node = ad.controller.create_node();
            const parent = parents[it.depth];
            a.attach(node, parent, parent.children.length());
            a.edit(node, (m: any) => {
              m.set_content(it.content);
              if (it.checkbox) m.set_checkbox(true);
              if (it.checked) m.set_checked(true);
              if (it.heading) m.set_heading(it.heading);
            });
            parents[it.depth + 1] = node;
            parents.length = it.depth + 2;
            made.push(node);
          }
        });
        const history = ad.controller.get_history();
        history.undoStack = [];
        history.redoStack = [];
        history.lastEdit = null;
        const rendered = () => made.every((n) => ad.ui.get_node_state(n)?.dom?.content_el?.isConnected);
        for (let i = 0; i < 300 && !rendered(); i++) await new Promise((r) => setTimeout(r, 10));
        if (!rendered()) throw new Error("the test's items didn't render");
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        if (!sel) return;
        // the caret, from anchor to head in the item's content
        ad.ui.set_selection(made[sel.block], sel.anchor, sel.head);
        const el = ad.ui.get_node_state(made[sel.block]).dom.content_el as HTMLElement;
        for (let i = 0; i < 100 && document.activeElement !== el; i++) await new Promise((r) => setTimeout(r, 10));
        if (document.activeElement !== el) throw new Error(`the item didn't take the caret (focus: ${(document.activeElement as HTMLElement | null)?.className})`);
      },
      { items, sel },
    );
  },

  async read(page: Page) {
    const raw = await page.evaluate(() => {
      const ad = (window as any).DYNALIST.app.app_document;
      const root = ad.document.get_node_collection().get_root();
      const flat: { depth: number; content: string; note: string; checkbox: boolean; checked: boolean; heading: number; id: string }[] = [];
      const walk = (node: any, depth: number) =>
        node.children.each((c: any) => {
          const m = c.get_meta_object();
          flat.push({ depth, content: m.get_content(), note: m.get_note(), checkbox: m.has_checkbox(), checked: m.is_checked(), heading: m.get_heading() || 0, id: c.get_id() });
          walk(c, depth + 1);
        });
      walk(root, 0);
      const s = ad.ui.selection().get();
      const index = (n: any) => (n ? flat.findIndex((f) => f.id === n.get_id()) : -1);
      const active = document.activeElement as HTMLElement | null;
      const editing = active?.classList.contains('Node-content') ? 'content' : active?.classList.contains('Node-note') ? 'note' : null;
      let sel: { block: number; anchor: number; head: number; inNote: boolean } | null = null;
      if (editing && s?.get_position_start) {
        const block = index(s.get_node());
        // the model's selection runs start to end; the editor's says which end the head is
        const ds = getSelection()!;
        let back = false;
        if (ds.anchorNode && ds.focusNode && !ds.isCollapsed) {
          const r = document.createRange();
          r.setStart(ds.anchorNode, ds.anchorOffset);
          back = r.comparePoint(ds.focusNode, ds.focusOffset) < 0;
        }
        const [start, end] = [s.get_position_start(), s.get_position_end()];
        if (block >= 0) sel = { block, anchor: back ? end : start, head: back ? start : end, inNote: editing === 'note' };
      }
      // items selected as items (Shift+Up or Down past an item's edge)
      const selected = !editing && s?.get_nodes ? s.get_nodes().map(index).filter((i: number) => i >= 0) : [];
      return { flat, sel, selected };
    });
    const texts = raw.flat.map((f) => fromItem(f));
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel) {
      const it = raw.flat[raw.sel.block]!;
      const base = texts[raw.sel.block]!.prefix + (raw.sel.inNote ? it.content.length + 1 : 0);
      sel = { block: raw.sel.block, anchor: base + raw.sel.anchor, head: base + raw.sel.head };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },
};
