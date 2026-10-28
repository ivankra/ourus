/// <reference lib="dom" />
// Athens (https://athensresearch.github.io/athens/, see README.md): an outliner of Roam's kind, archived
// in 2022, whose web build still runs, its graph a DataScript database in the page, saved nowhere. The
// bundle keeps the database to itself; the proxy names it (`proxy.ts`): its connection, `transact!`,
// `deref`, transit's reader (ClojureScript data from JSON) and `Volatile`; and it has a block's editor
// store its text right after each change, not two seconds after (until then, a block the caret had left
// read as it was). Each test is a page of its
// own, transacted in one go (its entity id the driver's, so it can be read back) and opened by its route;
// the last test's page is retracted. Reading walks the page's entity (DataScript's exported `Entity`,
// whose JavaScript map interface survives the compiler), but the block being edited, whose text is its
// textarea's.
//
// - A block is its string, Markdown and Roam's syntax as text: a heading is `## ` in it, a task Roam's
//   `{{[[TODO]]}} ` / `{{[[DONE]]}} `, code its fences. Athens numbers no blocks.
// - Its keys are those of its help page and its source (Linux: `mod` is Control). Deleting a block with
//   its children is selecting it (Shift+Up on its first line) and Backspace; none moves a block (that is
//   drag and drop, whose drop is the behavior under test) or duplicates one: those tests are skipped.
// - A drop (spec/drag.md) is the mouse's: a block's bullet dragged (`athensDrop`).

import type { Page } from 'playwright-core';
import type { Driver, Drop } from '../lib/driver.ts';
import { Unsupported, type Outline } from '../lib/block.ts';
import { gesture } from '../lib/drag.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A block's canonical text as Athens holds it: a task's `[ ] ` is Roam's marker, the rest as it is. */
function toAthens(text: string): { string: string; from: number; to: number } {
  const task = /^\[([ xX])\](?= |$)/.exec(text);
  if (!task) return { string: text, from: 0, to: 0 };
  const marker = task[1] === ' ' ? '{{[[TODO]]}}' : '{{[[DONE]]}}';
  return { string: marker + text.slice(3), from: 3, to: marker.length };
}

/** Athens's string as canonical text. */
function fromAthens(string: string): { text: string; from: number; to: number } {
  const task = /^\{\{\[\[(TODO|DONE)\]\]\}\}/.exec(string);
  if (!task) return { text: string, from: 0, to: 0 };
  return { text: (task[1] === 'TODO' ? '[ ]' : '[x]') + string.slice(task[0].length), from: task[0].length, to: 3 };
}

/** An offset in a text whose prefix of `from` characters became `to` characters: past it, shifted; inside it, clamped. */
const shiftOffset = (p: number, from: number, to: number): number => (p >= from ? p - from + to : Math.min(p, to));

export const driver: Driver = {
  shortId: 'AR', // Athens Research
  longId: 'athens',
  displayName: 'Athens',
  url: 'https://athensresearch.github.io/athens/',
  model: 'block',
  // a block's text holds a blank line, its paragraphs apart
  paragraphsInBlock: true,
  // after deleting a selected block no block is edited (checked by hand, keys only)
  // nor after a drop: editing ends as a drag starts (measured)
  noCaretAfter: ['deleteSubtree', 'move'],
  // a selection of whole blocks: loaded with Shift+Up and Shift+Down, read from `.is-selected`
  selectsBlocks: true,
  keys: {
    enter: 'Enter',
    shiftEnter: 'Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd', 'selectSubtree', 'deleteSubtree'],
  // a heading's `#`s, a task's marker and a code block's fences are text in the block, edited a
  // character at a time; code and math are a block's text, with no editor of their own, so Enter in
  // them splits the block (`enter-in-fence`)
  refuses: ['markup-heading', 'markup-task', 'markup-fence', 'enter-in-fence'],
  // Shift+Tab leaves later siblings with the parent; Enter on an empty nested block outdents it; an empty
  // block with children isn't joined into or out of, as in Roam. A paste goes after the block, nothing
  // split, lines as blocks, numbers as text, a paragraph's list under it (each measured, playing its
  // examples with `run.ts --ignore-options`)
  behaves: {
    // a quote is the block's text, its lines as written, `>` and all (probed 2026-10-25, ../../dev/19-quotes.md, Part 1)
    quotes: 'atom',
    // Enter in a quote splits it, the rest a block of its own (probed 2026-10-25, ../../dev/19-quotes.md, Part 1)
    enterInQuote: 'split',
    // after a paste of blocks, the caret at the start of the first (checked in a page of its own: `- ┃x`)
    quirkPasteCaret: 'athens',
    outdent: 'logical',
    enterSplitSpace: 'start',
    enterOnEmptyItem: 'outdent',
    enterTask: 'plain',
    joinWithChildren: 'refuse',
    emptyItemWithChildren: 'refuse',
    copyAtCaret: 'host',
    copySelection: 'nodes',
    pasteLines: 'items',
    // pasted blocks leave a selection's text as it is (Paste17, probed 2026-10-25)
    pasteOverSelection: 'ignore',
    pasteParagraphList: 'children',
  },

  drops: ['move'],
  drop: athensDrop,

  async open(page: Page) {
    // Athens's own opt-out of error reporting, read as it starts: else every transaction sends Sentry a trace
    await page.addInitScript(() => {
      if (location.hostname === 'athensresearch.github.io') localStorage.setItem('sentry', 'off');
    });
    const exposed = async (): Promise<boolean> => {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      return page
        .waitForFunction(() => (window as any).__ourusAthens && document.querySelector('.block-container'), null, { timeout: 60000 })
        .then(() => true)
        .catch(() => false);
    };
    // the browser's own cache may hold the bundle unpatched (`proxy.ts` patches it on its way out)
    if (!(await exposed())) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Network.clearBrowserCache');
      await cdp.detach();
      if (!(await exposed())) throw new Error("Athens's bundle came without the names athens/proxy.ts adds to it (not found in it?)");
    }
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`Athens didn't settle after loading: ${settled.pending}`);
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
    if (!ready) throw new Error("Athens's keys didn't come up: Tab doesn't indent");
    // no version is compiled in (Sentry's release is `athens@` and nothing): the bundle's date stands in
    return page.evaluate(async () => {
      const res = await fetch('js/compiled/app.js', { method: 'HEAD' });
      const date = res.headers.get('last-modified');
      return date ? new Date(date).toISOString().slice(0, 10) : undefined;
    });
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const blocks = o.blocks.map((b) => ({ depth: b.depth, ...toAthens(b.text) }));
    // (blocks selected whole: the first opened at its start, to select from with the keys below)
    const selected = o.selected?.length ? o.selected : null;
    const sel = o.sel ? { block: o.sel.block, anchor: shiftOffset(o.sel.anchor, blocks[o.sel.block]!.from, blocks[o.sel.block]!.to), head: shiftOffset(o.sel.head, blocks[o.sel.block]!.from, blocks[o.sel.block]!.to) } : selected && { block: selected[0]!, anchor: 0, head: 0 };
    const target = await page.evaluate(
      async ({ blocks, sel }) => {
        const w = window as any;
        const A = w.__ourusAthens;
        // the page's entity id, the driver's: above any Athens makes, one per test, counted in the page
        // (which outlives a run, and holds the graph)
        const eid: number = (w.__ourusSxsNext = (w.__ourusSxsNext ?? 1_000_000_000) + 1);
        const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const kw = (s: string) => A.read(JSON.stringify(`~:${s}`));
        const entity = (db: unknown, id: number) => new w.datascript.impl.entity.Entity(db, id, A.volatile(false), A.volatile(A.read('["^ "]')));
        (document.activeElement as HTMLElement | null)?.blur();
        const now = Date.now();
        const uids = blocks.map((_, i) => `sxs${eid}-${i}`);
        // transit: a map is `["^ ", key, value, ...]`, a keyword `~:ns/name`; the blocks nest under the page
        const node = (i: number): unknown[] => {
          const b = blocks[i]!;
          const kids: number[] = [];
          for (let k = i + 1; k < blocks.length && blocks[k]!.depth > b.depth; k++) if (blocks[k]!.depth === b.depth + 1) kids.push(k);
          return ['^ ', '~:block/uid', uids[i], '~:block/string', b.string, '~:block/open', true, '~:create/time', now, '~:edit/time', now, '~:block/order', siblingOrder(i), ...(kids.length ? ['~:block/children', kids.map(node)] : [])];
        };
        const siblingOrder = (i: number): number => {
          let n = 0;
          for (let k = i - 1; k >= 0 && blocks[k]!.depth >= blocks[i]!.depth; k--) if (blocks[k]!.depth === blocks[i]!.depth) n++;
          return n;
        };
        const top = blocks.flatMap((b, i) => (b.depth === 0 ? [i] : []));
        const tx: unknown[] = [['^ ', '~:db/id', eid, '~:node/title', `ourus sxs ${eid}`, '~:block/uid', `sxs${eid}`, '~:create/time', now, '~:edit/time', now, ...(top.length ? ['~:block/children', top.map(node)] : [])]];
        // the last test's page goes, with its blocks
        if (w.__ourusSxsPage) {
          const db = A.deref(A.conn());
          const gone: number[] = [];
          const walk = (e: any): void => {
            gone.push(e.get(':db/id'));
            for (const k of e.get(kw('block/children')) ?? []) walk(k);
          };
          if (entity(db, w.__ourusSxsPage).get(kw('block/uid'))) walk(entity(db, w.__ourusSxsPage));
          tx.push(...gone.map((id) => ['~:db/retractEntity', id]));
        }
        A.transact(A.conn(), A.read(JSON.stringify(tx)));
        w.__ourusSxsPage = eid;
        location.hash = `#/page/sxs${eid}`;
        const rendered = () => uids.every((u) => document.querySelector(`.block-container[data-uid="${u}"]`));
        for (let i = 0; i < 300 && !rendered(); i++) await wait(10);
        if (!rendered()) throw new Error(`the test page didn't render (at ${location.hash})`);
        await w.__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        (document.activeElement as HTMLElement | null)?.blur();
        if (!sel) return null;
        // where a click opens the block for editing, as a user's does
        const uid = uids[sel.block]!;
        const r = document.querySelector(`.block-container[data-uid="${uid}"] > .block-body .block-content`)?.getBoundingClientRect();
        return r ? { uid, x: r.left + 2, y: r.top + Math.min(r.height / 2, 10) } : null;
      },
      { blocks: blocks.map(({ depth, string }) => ({ depth, string })), sel },
    );
    if (!sel) return;
    if (!target) throw new Error("the block to edit isn't on screen");
    const editing = (): Promise<boolean> => page.evaluate((uid) => document.activeElement?.id === `editable-uid-${uid}`, target.uid);
    for (let attempt = 0; attempt < 3 && !(await editing()); attempt++) {
      await page.mouse.click(target.x, target.y);
      for (let i = 0; i < 50 && !(await editing()); i++) await page.waitForTimeout(10);
    }
    if (!(await editing())) throw new Error(`the block didn't open for editing (focus: ${await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id || document.activeElement?.tagName)})`);
    await page.evaluate((sel) => {
      const ta = document.activeElement as HTMLTextAreaElement;
      ta.setSelectionRange(Math.min(sel.anchor, sel.head), Math.max(sel.anchor, sel.head), sel.head < sel.anchor ? 'backward' : 'forward');
    }, sel);
    // blocks selected whole, as a user selects them: Shift+Up on the first block's first line selects
    // it, each Shift+Down the next on screen, till the last is (`read` reports the topmost)
    if (selected) {
      const last = selected[selected.length - 1]!;
      const reached = async (): Promise<number> => {
        await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 }));
        return Math.max(-1, ...(((await this.read(page)) as Outline).selected ?? []));
      };
      for (let i = 0; i < 3 && (await reached()) < 0; i++) await page.keyboard.press('Shift+ArrowUp');
      for (let k = 0; k <= o.blocks.length && (await reached()) < last; k++) await page.keyboard.press('Shift+ArrowDown');
    }
  },

  async read(page: Page) {
    const raw = await page.evaluate(() => {
      const w = window as any;
      const A = w.__ourusAthens;
      const kw = (s: string) => A.read(JSON.stringify(`~:${s}`));
      const db = A.deref(A.conn());
      const pageEntity = new w.datascript.impl.entity.Entity(db, w.__ourusSxsPage, A.volatile(false), A.volatile(A.read('["^ "]')));
      const ta = document.activeElement as HTMLTextAreaElement | null;
      const editingUid = ta?.tagName === 'TEXTAREA' && ta.id.startsWith('editable-uid-') ? ta.id.slice('editable-uid-'.length) : null;
      const flat: { depth: number; string: string; uid: string }[] = [];
      const walk = (e: any, depth: number): void => {
        const kids = [...(e.get(kw('block/children')) ?? [])].sort((a: any, b: any) => a.get(kw('block/order')) - b.get(kw('block/order')));
        for (const k of kids) {
          const uid = k.get(kw('block/uid'));
          // the block being edited: its textarea, ahead of what Athens stored
          flat.push({ depth, string: uid === editingUid ? ta!.value : (k.get(kw('block/string')) ?? ''), uid });
          walk(k, depth + 1);
        }
      };
      walk(pageEntity, 0);
      const i = editingUid ? flat.findIndex((b) => b.uid === editingUid) : -1;
      const back = ta?.selectionDirection === 'backward';
      // blocks selected whole (Shift+Up at a block's edge), the topmost: a block's children go with it
      const lit = new Set([...document.querySelectorAll('.block-container.is-selected')].map((el) => flat.findIndex((b) => b.uid === el.getAttribute('data-uid'))).filter((k) => k >= 0));
      const under = (k: number): boolean => {
        for (let j = k - 1, d = flat[k]!.depth; j >= 0 && d > 0; j--) if (flat[j]!.depth < d && ((d = flat[j]!.depth), lit.has(j))) return true;
        return false;
      };
      const selected = [...lit].filter((k) => !under(k)).sort((a, b) => a - b);
      return { flat, sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null, selected };
    });
    const texts = raw.flat.map((b) => fromAthens(b.string));
    const blocks = raw.flat.map((b, i) => ({ depth: b.depth, text: texts[i]!.text }));
    let sel = raw.sel;
    if (sel) {
      const { from, to } = texts[sel.block]!;
      sel = { block: sel.block, anchor: shiftOffset(sel.anchor, from, to), head: shiftOffset(sel.head, from, to) };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    if (action === 'selectSubtree' || action === 'deleteSubtree') {
      // a selected block is its subtree: copied, cut, or with Backspace deleted with its children
      // (`listeners.cljs`); Shift+Up on a block's first line selects it (`textarea_keydown.cljs`), and on
      // a later line extends the text first
      for (let i = 0; i < 50 && !((await this.read(page)) as Outline).selected?.length; i++) {
        await page.keyboard.press('Shift+ArrowUp');
        await settle();
      }
      if (action === 'selectSubtree') return;
      await page.keyboard.press('Backspace');
      await settle();
      return;
    }
    // no key for the document's ends: Up (Down) until the caret is on the first block's first line (the
    // last block's last), then Home (End); Up from the first block would go to the page's title. With
    // Shift, a caret crossing a block's edge selects blocks, extended until they stop growing
    const up = /DocStart$/.test(action);
    const shift = action.startsWith('select') ? 'Shift+' : '';
    const there = (o: Outline): boolean => {
      if (!o.sel) return false;
      const text = o.blocks[o.sel.block]!.text;
      return up ? o.sel.block === 0 && !text.slice(0, o.sel.head).includes('\n') : o.sel.block === o.blocks.length - 1 && !text.slice(o.sel.head).includes('\n');
    };
    let last = '';
    for (let i = 0; i < 200; i++) {
      const o = (await this.read(page)) as Outline;
      const now = JSON.stringify([o.sel, o.selected]);
      if (now === last || there(o)) break;
      last = now;
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
    }
    if (!((await this.read(page)) as Outline).sel) return;
    await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
    await settle();
  },
};

/**
 * A drop in Athens (its block's `on-drag-over` and `on-drop`): HTML5 drag and drop, which Playwright's
 * mouse plays in Chromium. The pressed block's bullet (its anchor, `draggable`) is carried to the block
 * whose container is innermost under the pointer, and the place read off where in that container (its
 * subtree's box) it is: in its upper half, before it; in its lower half, after it left of 50 px from
 * its left, and right of that its first child, where it has none. So after a block is its container's
 * bottom, left of its children's; first under a parent, the top of its first child, or a childless
 * parent's lower half, right. Over the block dragged, nothing moves (its own place). It drags the
 * block pressed, or the blocks selected whole: a drop of a run or of the selection it has no gesture
 * for.
 */
async function athensDrop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  // (a drop of the selection: a press on its first block's bullet)
  const press = drop.press ?? drop.rows[0];
  if (press === undefined) throw new Unsupported('a drop of nothing pressed or selected');
  const at = await page.evaluate(({ press, to }) => {
    const w = window as any;
    // (a drop is a case's first action: block i is the one `load` made i-th)
    const el = (i: number) => document.querySelector(`.block-container[data-uid="sxs${w.__ourusSxsPage}-${i}"]`) as HTMLElement | null;
    const index = (e: Element | null | undefined): number | 'root' => (e ? Number(e.getAttribute('data-uid')!.split('-').pop()) : 'root');
    const container = (e: Element) => e.parentElement?.closest(`.block-container[data-uid^="sxs${w.__ourusSxsPage}-"]`);
    const kids = (parent: number | 'root'): number[] => {
      const all = [...document.querySelectorAll(`.block-container[data-uid^="sxs${w.__ourusSxsPage}-"]`)];
      return all.filter((e) => index(container(e)) === parent).map(index) as number[];
    };
    const pressed = el(press);
    const anchor = pressed?.querySelector(':scope > .block-body > .anchor')?.getBoundingClientRect();
    if (!pressed || !anchor) return null;
    const from = { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2 };
    const box = (i: number) => el(i)!.getBoundingClientRect();
    const siblings = kids(index(container(pressed))).filter((i) => i !== press);
    const before = kids(to.parent).filter((i) => i !== press)[0];
    const own = index(container(pressed)) === to.parent && (siblings.filter((i) => i < press).pop() ?? null) === to.after;
    let target: { x: number; y: number };
    // its own place: over itself
    if (own) target = { x: box(press).left + 60, y: box(press).top + 8 };
    // after a block: its bottom, left of its children (a level is 32 px)
    else if (to.after !== null) target = { x: box(to.after).left + 16, y: box(to.after).bottom - 4 };
    // first: before the first child, at its top
    else if (before !== undefined) target = { x: box(before).left + 16, y: box(before).top + 4 };
    // in a childless block, its lower half, right
    else if (to.parent !== 'root') target = { x: box(to.parent).left + 60, y: box(to.parent).bottom - 4 };
    else return null;
    return { from, to: target };
  }, { press, to: drop.to });
  if (!at) throw new Unsupported('the pressed block has no bullet on screen');
  await gesture(page, at.from, at.to, settle);
}
