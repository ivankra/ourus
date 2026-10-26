/// <reference lib="dom" />
// Moo.do (https://www.moo.do/, see README.md): an outliner (items in an infinite hierarchy, with
// panes, boards and Google sync), driven in its demo: the app's own page, opened in demo mode on its
// help document (`/web/#demo=true&live=true&data=demo-help`, what https://www.moo.do/demo/ frames),
// with no account and saving nothing. Each test's items replace the document's, made and read through
// the app's own modules, reached through its webpack runtime (`webpackChunkLegend`): its item factory
// (`createVMLI`), its history (`undoStack`, `redoStack`) and its selection (`setSelectionIndices`,
// `getStartItem`, `getStartOffset`). The actions are Moo.do's keys on Linux.
//
// - An item's text is Markdown as written (`a **b** c`), with Moo.do's prefixes: `# ` to `###### ` a
//   header, `[ ` a task (done: a flag on the item), `1. ` a numbered item, `- ` a bullet. Moo.do draws
//   them, the prefix as a marker and the formatting styled (`a b c`), and counts the caret in what it
//   draws: the driver aligns that with the raw text.
// - A to-do is a task (`[ ] `, `[x] ` when done), a heading a header, a numbered item its prefix; a
//   bullet's prefix is dropped (every block an item).

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { reloadPage } from '../lib/browser.ts';
import type { Outline } from '../lib/block.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A block's canonical text as Moo.do's raw text, whether it is a done task, and how long its prefix is in each. */
function toMoodo(text: string): { raw: string; done: boolean; canon: number; prefix: number } {
  const task = /^\[([ xX])\] /.exec(text);
  if (task) return { raw: '[ ' + text.slice(4), done: task[1] !== ' ', canon: 4, prefix: 2 };
  const marker = /^(#{1,6} |\d{1,9}\. )/.exec(text);
  const n = marker?.[0].length ?? 0;
  return { raw: text, done: false, canon: n, prefix: n };
}

/** Moo.do's prefix as canonical text: a task's checkbox, a header's #s, a number; a bullet's dropped. */
function canonPrefix(prefix: string, done: boolean): string {
  if (/^\[/.test(prefix)) return done ? '[x] ' : '[ ] ';
  if (/^- $/.test(prefix)) return '';
  return prefix;
}

/**
 * Where each displayed character is in the raw text after the prefix: matched in order, the markup the
 * display leaves out skipped (`a **b** c` drawn `a b c`).
 */
function align(raw: string, display: string): number[] {
  const pos: number[] = [];
  let i = 0;
  for (let j = 0; j < display.length; j++) {
    while (i < raw.length && raw[i] !== display[j]) i++;
    pos.push(Math.min(i, raw.length));
    i++;
  }
  return pos;
}

/**
 * A displayed offset in the raw text, as Moo.do puts a caret there: past the markup between two
 * characters (`**b**┃c`, `` `┃x` ``), before it at the text's start (`┃**b**`), past it at the end.
 */
const toRaw = (pos: readonly number[], p: number, rawLength: number): number => (p <= 0 ? 0 : p >= pos.length ? rawLength : pos[p]!);

/** A raw offset as a displayed one: the displayed characters before it. */
const toDisplay = (pos: readonly number[], r: number): number => pos.filter((x) => x < r).length;

/** In the page: the app's modules (its item factory, history, selection, change types, batching) and the open document. */
const MODULES = `(() => {
  const w = window;
  if (!w.__sxsMoodo) {
    let req;
    w.webpackChunkLegend.push([[Symbol('sxs')], {}, (r) => { req = r; }]);
    const find = (test) => {
      for (const id of Object.keys(req.m)) {
        let mod;
        try { mod = req(id); } catch { continue; }
        if (!mod || typeof mod !== 'object') continue;
        for (const k of Object.keys(mod)) {
          let v;
          try { v = mod[k]; if (v && test(v)) return v; } catch {}
        }
      }
      return null;
    };
    w.__sxsMoodo = {
      items: find((v) => typeof v.createVMLI === 'function' && typeof v.generateID === 'function'),
      history: find((v) => Array.isArray(v.undoStack) && typeof v.undo === 'function'),
      selection: find((v) => typeof v.setSelectionIndices === 'function' && typeof v.getStartItem === 'function'),
      // items selected whole (a pane's), apart from the text selection
      selected: find((v) => typeof v.numSelectedInPane === 'function' && typeof v.reset === 'function'),
      changeType: find((v) => v.ChangeType && v.ChangeType.Local !== undefined)?.ChangeType,
      batcher: find((v) => typeof v.PaneUpdateBatcher?.beginUpdateItems === 'function')?.PaneUpdateBatcher,
    };
  }
  const m = w.__sxsMoodo;
  // the document: an item's, from any item the pane draws (React's props)
  if (!m.doc || !m.doc._rootItem || m.doc.isDeleted === true) {
    const r = document.getElementById('outerWrapper');
    const key = r && Object.keys(r).find((k) => k.startsWith('__reactContainer'));
    const stack = key ? [r[key]] : [];
    while (stack.length) {
      const f = stack.pop();
      const doc = f?.memoizedProps?.paneObject?.item?._documentOwner;
      if (doc?._rootItem) { m.doc = doc; break; }
      if (f?.child) stack.push(f.child);
      if (f?.sibling) stack.push(f.sibling);
    }
  }
  return m;
})()`;

/** The actions that delete through the pane, and their keys: deleting more than one item, Moo.do asks first. */
const PANE_DELETES: Record<string, string> = { cut: 'Control+x', deleteSubtree: 'Control+Shift+Backspace' };

/** In the page: whether Moo.do's confirmation dialog is open ("Are you sure you want to delete 2 items?"). */
const CONFIRMING = `!!document.querySelector('.fancyModalButtons')`;

/**
 * Waits until the app's modules and document are there and stay there through a settle: the app
 * reloads itself once after its first load (its service worker, installed, takes over the page).
 */
async function appReady(page: Page): Promise<void> {
  const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000, frames: false }));
  for (let attempt = 0; ; attempt++) {
    try {
      await page.waitForFunction((modules) => {
        if (!(window as any).webpackChunkLegend || !document.querySelector('.itemInPaneText')) return false;
        const m = (0, eval)(modules);
        return !!(m.items && m.history && m.selection && m.selected && m.changeType && m.batcher && m.doc);
      }, MODULES, { timeout: 120000 });
      await idle();
      await page.waitForTimeout(1000);
      await idle();
      return;
    } catch (e) {
      if (attempt >= 3 || !/context was destroyed|navigation/i.test(String(e))) throw e;
      await page.waitForLoadState('domcontentloaded', { timeout: 120000 });
    }
  }
}

export const driver: Driver = {
  shortId: 'MD',
  longId: 'moodo',
  displayName: 'Moo.do',
  url: 'https://www.moo.do/web/#demo=true&live=true&data=demo-help',
  scope: 'https://www.moo.do/web/',
  model: 'block',
  keys: {
    enter: 'Enter',
    // no `shiftEnter`: Shift+Enter edits the item's note ("EditNote"), another action than a line
    // break, which an item's text doesn't hold (its cases skip)
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "MoveUp", "MoveDown" (Alt+Shift+Up, Down; Ctrl+Shift+Up, Down too): the item with its children
    moveSubtreeUp: 'Alt+Shift+ArrowUp',
    moveSubtreeDown: 'Alt+Shift+ArrowDown',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    copy: 'Control+c',
    // (`cut` and `deleteSubtree` are played by `act`: Ctrl+X, Ctrl+Shift+Backspace ("DeleteItem": the
    // item with its children), then Y where Moo.do asks to confirm)
    paste: 'Control+v',
    pastePlain: 'Control+Shift+V',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd', 'cut', 'deleteSubtree'],
  // framer-motion's frame loop never stops in Moo.do (an animation repeating, drawing nothing): a frame
  // pending is no work of a key's
  idle: { frames: false },
  // an item's text is one line of Markdown, with Moo.do's prefixes; no Markdown block but a heading
  refuses: ['code block', 'html', 'table', 'math', 'thematic break', 'link reference definition', 'comment', 'footnote', 'quote'],
  ordered: true,
  // measured with `--ignore-options` (2026-10-26): each value agrees where ourus's default doesn't
  behaves: {
    // Shift+Tab takes the later siblings along as children (LogicalOutdent1, LogicalOutdent4, TO7)
    outdent: 'logical',
    // a split keeps the space at the new item's start (Enter65 to Enter65d, Enter65h to Enter65j)
    enterSplitSpace: 'start',
    // Backspace on an empty item with children, and at the first item's start, does nothing
    // (Backspace17f, Backspace17h, Delete5f; Backspace34)
    emptyItemWithChildren: 'refuse',
    backspaceAtTopItem: 'refuse',
    // a header's prefix is the item's, kept through a join (Delete13b, Delete13f, Regression19)
    headingEditing: 'block',
    // pasted lines are items (Paste17g, Paste18, Paste19), and on an item with children they go after
    // its children (PasteList18, PasteList19)
    pasteLines: 'items',
    pasteOnParent: 'after',
  },
  holds(doc) {
    const o = doc as Outline;
    for (const b of o.blocks) {
      // a block's later lines would be its item's note, which the driver doesn't make
      if (b.text.includes('\n')) return "block of more than one line (an item's text is one line)";
      // a code span of two backticks or more, which Moo.do writes with one (`` ``x`` `` becomes `` `x` ``)
      if (/(^|[^`])``+[^`]/.test(b.text)) return 'code span of more than one backtick (Moo.do writes it with one)';
      // text Moo.do would read as a prefix (a bullet's, a task's), or a Markdown escape it has none of
      if (/^(- |\* |\+ |\[ (?!\] )|\\)/.test(b.text.replace(/^\[[ xX]\] /, ''))) return 'text Moo.do reads as a prefix, or an escape';
    }
    // Moo.do numbers a run of numbered siblings from 1, whatever the text says
    const run: number[] = [];
    for (const b of o.blocks) {
      run.length = b.depth + 1;
      const n = /^(\d{1,9})\. /.exec(b.text);
      if (n && Number(n[1]) !== (run[b.depth] ?? 0) + 1) return 'numbered list not counting from 1 (Moo.do numbers a run of numbered items from 1)';
      run[b.depth] = n ? Number(n[1]) : 0;
    }
    // a done task is hidden from the demo's pane (its filter shows what isn't completed)
    if (o.blocks.some((b) => /^\[[xX]\] /.test(b.text))) return 'done task (the pane hides completed items)';
    if (o.sel) {
      // Moo.do's selection has no direction: Shift+Left from a caret selects leftwards, and the next
      // Shift+Left takes it back from the right (measured: from `ab┃`, `a«b»`, then `a┃b`)
      if (o.sel.head < o.sel.anchor) return "backward selection (Moo.do's selection has no direction)";
      const at = toMoodo(o.blocks[o.sel.block]!.text);
      if (Math.min(o.sel.anchor, o.sel.head) < at.canon) return "caret in a task's checkbox, a heading's #s or an item's number";
    }
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await appReady(page);
    const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 10000, frames: false }));
    // ready once a key does what it should: Tab indents
    let ready = false;
    for (let t0 = Date.now(); !ready && Date.now() - t0 < 30000; ) {
      await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
      await idle();
      await page.keyboard.press('Tab');
      await idle();
      ready = ((await this.read(page)) as Outline).blocks[1]?.depth === 1;
      if (!ready) await page.waitForTimeout(250);
    }
    if (!ready) throw new Error("Moo.do's keys didn't come up: Tab doesn't indent");
    // its build, in its bundle's name (`app-1642203397223.js`)
    return page.evaluate(() => {
      const src = [...document.scripts].map((s) => /\/js\/app-(\d+)\.js/.exec(s.src)?.[1]).find(Boolean);
      return src ? `web build ${src} (${new Date(Number(src)).toISOString().slice(0, 10)})` : undefined;
    });
  },

  async load(page: Page, doc) {
    // a confirmation a key left open (a selection of items deleted with Backspace, say), which takes
    // every key and keeps the pane's deletes from finishing: the page anew
    if (await page.evaluate(CONFIRMING)) {
      await reloadPage(page);
      await appReady(page);
    }
    const o = doc as Outline;
    const items = o.blocks.map((b) => ({ depth: b.depth, ...toMoodo(b.text) }));
    const sel = o.sel && { block: o.sel.block, anchor: Math.max(0, o.sel.anchor - items[o.sel.block]!.canon), head: Math.max(0, o.sel.head - items[o.sel.block]!.canon) };
    const placed = await page.evaluate(
      async ({ items, sel, modules, alignSrc, toDisplaySrc }) => {
        const m = (0, eval)(modules);
        const align = (0, eval)(`(${alignSrc})`);
        const toDisplay = (0, eval)(`(${toDisplaySrc})`);
        const { items: R, history: H, selection: S, changeType: CT, batcher: B, doc } = m;
        const root = doc._rootItem;
        (document.activeElement as HTMLElement | null)?.blur();
        // the last test's selection goes (a text selection a key left, items selected whole), which
        // the next keys would act on
        S.reset();
        m.selected.reset();
        // the last test's items go and this test's come, in one batch; then the history is emptied, so
        // that undo stops where the test starts
        B.beginUpdateItems();
        for (const c of root.getChildren().slice()) root.deleteChild(c);
        const made: any[] = [];
        const parents: any[] = [root];
        const count: number[] = [0];
        for (const it of items) {
          const parent = parents[it.depth];
          const item = R.createVMLI({ id: R.generateID(), text: it.raw }, { documentOwner: doc, parent, changeType: CT.Local });
          parent.insertItem(item, count[it.depth]!);
          count[it.depth] = (count[it.depth] ?? 0) + 1;
          if (it.done) item.setComplete(true, CT.Local);
          parents[it.depth + 1] = item;
          parents.length = it.depth + 2;
          count[it.depth + 1] = 0;
          count.length = it.depth + 2;
          made.push(item);
        }
        B.commitUpdateItems();
        H.undoStack.length = 0;
        H.redoStack.length = 0;
        const drawn = () => made.every((it) => document.querySelector(`[data-id="${it.id}"] .itemInPaneText`));
        for (let i = 0; i < 300 && !drawn(); i++) await new Promise((r) => setTimeout(r, 10));
        if (!drawn()) return "the test's items weren't drawn";
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000, frames: false });
        if (!sel) return 'no caret';
        // the caret, in the offsets Moo.do counts: what it draws of the text after the prefix
        const item = made[sel.block];
        const raw: string = item.getParsedTextWithoutPrefix();
        const prefix = item.getRawText().length - raw.length;
        const display: string = item.getUnstyledText().slice(prefix);
        const pos: number[] = align(raw, display);
        const shown = (r: number) => toDisplay(pos, r);
        const pane = S.pane.get();
        const index = pane.items.get().findIndex((x: any) => x.item?.id === item.id);
        if (index < 0) return "the item isn't in the pane";
        const [a, h] = [shown(sel.anchor), shown(sel.head)];
        S.setFocusedPane(pane);
        S.setSelectionIndices(index, a, index, h);
        S.setValid(true);
        S.updateCaret();
        // keys go to the pane's hidden input
        (document.querySelector('.paneHiddenInput') as HTMLElement | null)?.focus();
        S.updateHiddenInput?.();
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000, frames: false });
        return (document.activeElement as HTMLElement | null)?.classList.contains('paneHiddenInput') ? 'placed' : 'the hidden input lost the focus';
      },
      { items, sel, modules: MODULES, alignSrc: align.toString(), toDisplaySrc: toDisplay.toString() },
    );
    if (placed !== 'placed' && placed !== 'no caret') throw new Error(`the caret has no place: ${placed}`);
  },

  async read(page: Page) {
    const raw = await page.evaluate(
      ({ modules }) => {
        const m = (0, eval)(modules);
        const { selection: S, doc } = m;
        const flat: { depth: number; raw: string; body: string; display: string; done: boolean; id: string }[] = [];
        const walk = (it: any, depth: number) =>
          it.getChildren().forEach((c: any) => {
            if (c.isNote?.()) return;
            const body: string = c.getParsedTextWithoutPrefix();
            const r: string = c.getRawText();
            // a numbered item's number as Moo.do draws it: it counts a run of numbered siblings from 1,
            // whatever number the raw text has
            const drawn = /^\d+\. /.test(r) ? /(?:^|\n)(\d+)\.(?:\n|$)/.exec((document.querySelector(`[data-id="${c.id}"]`) as HTMLElement | null)?.innerText ?? '')?.[1] : undefined;
            flat.push({ depth, raw: drawn ? r.replace(/^\d+/, drawn) : r, body, display: c.getUnstyledText().slice(r.length - body.length), done: !!c._cachedFlagProps?.isComplete, id: c.id });
            walk(c, depth + 1);
          });
        walk(doc._rootItem, 0);
        const index = (it: any) => (it ? flat.findIndex((f) => f.id === it.id) : -1);
        // the selection: while the pane's hidden input has the focus; within one item a caret, across
        // items the items selected whole
        const focused = (document.activeElement as HTMLElement | null)?.classList.contains('paneHiddenInput');
        let sel: { block: number; anchor: number; head: number } | null = null;
        let selected: number[] = [];
        if (focused && S.isValid()) {
          const [s, e] = [index(S.getStartItem()), index(S.getEndItem())];
          if (s >= 0 && s === e) {
            // (no direction: from its start to its end)
            sel = { block: s, anchor: S.getStartOffset(true), head: S.getEndOffset(true) };
          } else if (s >= 0 && e >= 0) selected = flat.map((_, i) => i).filter((i) => i >= Math.min(s, e) && i <= Math.max(s, e));
        }
        return { flat, sel, selected };
      },
      { modules: MODULES },
    );
    const texts = raw.flat.map((f) => {
      const prefix = canonPrefix(f.raw.slice(0, f.raw.length - f.body.length), f.done);
      return { text: prefix + f.body, prefix: prefix.length, pos: align(f.body, f.display), length: f.body.length };
    });
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel) {
      const t = texts[raw.sel.block]!;
      const at = (p: number) => t.prefix + toRaw(t.pos, p, t.length);
      sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    if (PANE_DELETES[action]) {
      // deleting an item with children, Moo.do asks "Are you sure you want to delete 2 items?": Y, as
      // the user who asked for the delete answers (left open, the dialog takes every key after, and
      // the pane finishes no delete)
      await page.keyboard.press(PANE_DELETES[action]!);
      await settle();
      if (await page.evaluate(CONFIRMING)) {
        await page.keyboard.press('y');
        await settle();
      }
      return;
    }
    // Moo.do has no key for the outline's ends: Up (Down) until the caret stops, then Home (End). With
    // Shift, past an item's edge the selection is of items, which goes on growing
    const up = /DocStart$/.test(action);
    const shift = action.startsWith('select') ? 'Shift+' : '';
    let last = '';
    for (let i = 0; i < 200; i++) {
      const o = (await this.read(page)) as Outline;
      if (!o.sel && !o.selected && last && !shift) {
        await page.keyboard.press(up ? 'ArrowDown' : 'ArrowUp');
        await settle();
        break;
      }
      const now = JSON.stringify(o);
      if (now === last) break;
      last = now;
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
    }
    await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
    await settle();
  },
};
