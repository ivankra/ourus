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
import { perPage, type Driver, type Drop } from '../lib/driver.ts';
import { italicsAsMarkdown, Unsupported, type Outline } from '../lib/block.ts';
import { gesture } from '../lib/drag.ts';

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

/**
 * Canonical prefixes and what Roam holds for them: a task's marker is text, a heading's level an
 * attribute, a numbered block's number its parent's view (`numbered`: the children of a parent with
 * `children-view-type: numbered` are numbered from 1).
 */
function toRoam(depth: number, text: string): RoamBlock & { from: number; to: number; numbered: boolean; cut?: number } {
  const n = /^\d{1,9}\. /.exec(text);
  if (n) {
    const rest = toRoam(depth, text.slice(n[0].length));
    return { ...rest, from: rest.from + n[0].length, numbered: true, ...(rest.cut !== undefined && { cut: rest.cut + n[0].length }) };
  }
  // a number that is text: escaped in the canonical text, not in Roam's, which has no Markdown to
  // escape in (`cut`, where the escape was)
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(text);
  if (literal) return { ...toRoamText(depth, literal[1] + text.slice(literal[0].length)), numbered: false, cut: literal[1]!.length };
  return { ...toRoamText(depth, text), numbered: false };
}

function toRoamText(depth: number, text: string): RoamBlock & { from: number; to: number } {
  const task = /^\[([ xX])\](?= |$)/.exec(text);
  if (task) {
    const marker = task[1] === ' ' ? '{{[[TODO]]}}' : '{{[[DONE]]}}';
    return { depth, string: marker + text.slice(3), heading: 0, from: 3, to: marker.length };
  }
  const heading = /^(#{1,3}) /.exec(text);
  if (heading) return { depth, string: text.slice(heading[0].length), heading: heading[1]!.length, from: heading[0].length, to: 0 };
  return { depth, string: text, heading: 0, from: 0, to: 0 };
}

/** Roam's block as canonical text: its number where its parent numbers its children, else a number that is text escaped (`cut`). */
function fromRoam(b: RoamBlock, number: number | null): { text: string; from: number; to: number; cut?: number } {
  const t = fromRoamText(b);
  // a number that is text, escaped also after a numbered block's own number (`2. 2\. x`)
  const pre = number !== null ? `${number}. ` : '';
  const literal = /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(t.text);
  const text = literal ? t.text.slice(0, literal[0].length) + '\\' + t.text.slice(literal[0].length) : t.text;
  return { text: pre + text, from: t.from, to: t.to + pre.length, ...(literal && { cut: t.to + pre.length + literal[0].length }) };
}

function fromRoamText(b: RoamBlock): { text: string; from: number; to: number } {
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

/** The page the current test runs on, a worker's (`perPage`), to delete when the next test starts. */
const pageState = perPage(() => ({ current: null as string | null }));

export const driver: Driver = {
  shortId: 'RR', // Roam Research
  longId: 'roam',
  displayName: 'Roam',
  url: 'https://roamresearch.com/#/app/help',
  model: 'block',
  // a block's text holds a blank line, its paragraphs apart
  paragraphsInBlock: true,
  // after deleting the page's every block no block is edited (DeleteSubtree6); with a block above, its end.
  // A drop leaves the focus on the pressed bullet, a block's caret lost but for the dragged block's (Drag2)
  noCaretAfter: ['deleteSubtree', 'move'],
  // a selection of whole blocks: loaded with Escape and Shift+Down, read from their highlight
  selectsBlocks: true,
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
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  drops: ['move'],
  drop,
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd', 'selectSubtree', 'deleteSubtree'],
  // Shift+Tab leaves later siblings with the parent (logical outdenting); Enter on an empty nested
  // block outdents it; Backspace on a page's first block does nothing: as ourus's config says of Roam
  behaves: {
    // a quote is the block's text, its lines as written, `>` and all (probed 2026-10-25, ../../dev/19-quotes.md, Part 1)
    quotes: 'atom',
    // Enter in a quote splits it, the rest a block of its own (probed 2026-10-25, ../../dev/19-quotes.md, Part 1)
    enterInQuote: 'split',
    // Enter mid-heading: the new block above takes the text before the caret, the heading (an
    // attribute) staying with the rest (TO-E13-E16, TO-E14-E20)
    quirkEnterMidHeading: 'workflowy',
    // after a paste of blocks, the caret at the end of the first (checked in a page of its own: `- x┃`)
    quirkPasteCaret: 'roam',
    outdent: 'logical',
    enterSplitSpace: 'start',
    enterOnEmptyItem: 'outdent',
    enterTask: 'plain',
    joinWithChildren: 'refuse',
    backspaceAtTopItem: 'refuse',
    emptyItemWithChildren: 'refuse',
    copyAtCaret: 'host',
    pasteLines: 'items',
    // pasted blocks leave a selection's text as it is (Paste17, probed 2026-10-25)
    pasteOverSelection: 'ignore',
    pasteAtTextStart: 'before',
    pasteParagraphList: 'children',
  },
  // Roam's code blocks are a format of its own (not driven yet: a CodeMirror editor in the block); a
  // heading is a block's attribute, with no boundary in its text, and a task's `{{[[TODO]]}}` is text,
  // edited a character at a time, as math's `$$` are. Math, tables and HTML are a block's text, as typed
  // (measured), so Enter in math splits the block (`enter-in-fence`)
  refuses: ['code block', 'markup-heading', 'markup-task', 'markup-fence', 'enter-in-fence'],
  ordered: true,
  holds(doc) {
    const o = doc as Outline;
    if (o.blocks.some((b) => /^#{4,6} /.test(b.text.replace(/^\d{1,9}\. /, '')))) return 'heading deeper than H3';
    // numbering is a parent's: all its children numbered, from 1, or none
    const kids = new Map<number, number[]>();
    const path: number[] = [];
    o.blocks.forEach((b, i) => {
      path.length = b.depth;
      const parent = b.depth ? path[b.depth - 1]! : -1;
      kids.set(parent, [...(kids.get(parent) ?? []), i]);
      path[b.depth] = i;
    });
    for (const list of kids.values()) {
      const numbers = list.map((i) => /^(\d{1,9})\. /.exec(o.blocks[i]!.text)?.[1]);
      if (numbers.some(Boolean) && !numbers.every((n, k) => Number(n) === k + 1)) return 'list numbered in part, or not from 1';
    }
    if (o.sel && Math.min(o.sel.anchor, o.sel.head) < toRoam(0, o.blocks[o.sel.block]!.text).from && /^#/.test(o.blocks[o.sel.block]!.text)) return "caret in a heading's #s";
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
    const at = (p: number, { from, to, cut }: { from: number; to: number; cut?: number }): number => shiftOffset(p - (cut !== undefined && p > cut ? 1 : 0), from, to);
    // (blocks selected whole: the first opened at its start, to select from with the keys below)
    const selected = o.selected?.length ? o.selected : null;
    const sel = o.sel ? { block: o.sel.block, anchor: at(o.sel.anchor, blocks[o.sel.block]!), head: at(o.sel.head, blocks[o.sel.block]!) } : selected && { block: selected[0]!, anchor: 0, head: 0 };
    pageState(page).current = await page.evaluate(
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
        const numbered = new Set<string>();
        for (const b of blocks) {
          const uid = api.util.generateUID();
          if (b.numbered) numbered.add(parents[b.depth]!);
          await api.data.block.create({ location: { 'parent-uid': parents[b.depth], order: order[b.depth] }, block: { string: b.string, uid, ...(b.heading && { heading: b.heading }), open: true } });
          order[b.depth] = (order[b.depth] ?? 0) + 1;
          parents[b.depth + 1] = uid;
          order[b.depth + 1] = 0;
          parents.length = b.depth + 2;
          order.length = b.depth + 2;
          uids.push(uid);
        }
        // a parent whose children are numbered views them so: the page, or a block
        for (const parent of numbered) {
          if (parent === pageUid) await api.data.page.update({ page: { uid: parent, 'children-view-type': 'numbered' } });
          else await api.data.block.update({ block: { uid: parent, 'children-view-type': 'numbered' } });
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
      { blocks: blocks.map(({ depth, string, heading, numbered }) => ({ depth, string, heading, numbered })), sel, previous: pageState(page).current },
    );
    // blocks selected whole, as a user selects them: Escape selects the block being edited, each
    // Shift+Down the next on screen, till the last is (`read` reports the topmost)
    if (selected) {
      const last = selected[selected.length - 1]!;
      // (read once Roam has drawn the key's selection: its highlight comes a moment after)
      const reached = async (): Promise<number> => {
        await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 50, timeout: 3000 }));
        return Math.max(-1, ...(((await this.read(page)) as Outline).selected ?? []));
      };
      for (let i = 0; i < 3 && (await reached()) < 0; i++) await page.keyboard.press('Escape');
      for (let k = 0; k <= o.blocks.length && (await reached()) < last; k++) await page.keyboard.press('Shift+ArrowDown');
    }
  },

  async read(page: Page) {
    const raw = await page.evaluate((pageUid) => {
      const api = (window as any).roamAlphaAPI;
      const tree = api.pull('[:block/uid :block/string :block/heading :block/order :children/view-type {:block/children ...}]', [':block/uid', pageUid]);
      const flat: { depth: number; string: string; heading: number; uid: string; number: number | null }[] = [];
      // a parent viewing its children as numbered numbers them from 1
      const numbers = (x: any): boolean => String(x?.[':children/view-type'] ?? '').replace(/^:/, '') === 'numbered';
      const walk = (parent: any, depth: number) => {
        [...(parent?.[':block/children'] ?? [])].sort((a, b) => a[':block/order'] - b[':block/order']).forEach((k, n) => {
          flat.push({ depth, string: k[':block/string'] ?? '', heading: k[':block/heading'] ?? 0, uid: k[':block/uid'], number: numbers(parent) ? n + 1 : null });
          walk(k, depth + 1);
        });
      };
      walk(tree, 0);
      const focused = api.ui.getFocusedBlock()?.['block-uid'];
      const ta = document.activeElement as HTMLTextAreaElement | null;
      const i = focused && ta?.tagName === 'TEXTAREA' ? flat.findIndex((b) => b.uid === focused) : -1;
      // the block being edited: its textarea, ahead of what Roam stored
      if (i >= 0) flat[i]!.string = ta!.value;
      const back = ta?.selectionDirection === 'backward';
      // the blocks selected whole (highlighted), the topmost: a block's children are selected with it
      const lit = new Set([...document.querySelectorAll('.roam-article .block-highlight-blue')].map((e) => flat.findIndex((b) => b.uid === e.closest('.roam-block-container')?.getAttribute('data-block-uid'))).filter((k) => k >= 0));
      const under = (k: number): boolean => {
        for (let j = k - 1, d = flat[k]!.depth; j >= 0 && d > 0; j--) if (flat[j]!.depth < d && ((d = flat[j]!.depth), lit.has(j))) return true;
        return false;
      };
      const selected = i >= 0 ? [] : [...lit].filter((k) => !under(k)).sort((a, b) => a - b);
      return { flat, sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null, selected };
    }, pageState(page).current);
    const texts = raw.flat.map((b) => fromRoam(b, b.number));
    const blocks = raw.flat.map((b, i) => ({ depth: b.depth, text: texts[i]!.text }));
    let sel = raw.sel;
    if (sel) {
      const { from, to, cut } = texts[sel.block]!;
      const at = (p: number): number => shiftOffset(p, from, to) + (cut !== undefined && shiftOffset(p, from, to) > cut ? 1 : 0);
      sel = { block: sel.block, anchor: at(sel.anchor), head: at(sel.head) };
    }
    // (its italic `__x__` as Markdown's)
    return italicsAsMarkdown({ blocks, sel, ...(raw.selected.length && { selected: raw.selected }) });
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    if (action === 'selectSubtree' || action === 'deleteSubtree') {
      // Escape selects the block being edited with its children (`init-or-cancel-selection`): copied,
      // cut, or with Backspace deleted with them. It cancels a selection Roam still holds (an earlier
      // test's copy left one, on a page since deleted), so it is pressed until a block is selected
      const selected = (): Promise<boolean> => page.evaluate(() => !!document.querySelector('.block-highlight-blue'));
      for (let i = 0; i < 3 && !(await selected()); i++) {
        await page.keyboard.press('Escape');
        await settle();
      }
      if (!(await selected())) throw new Error('Escape selected no block');
      if (action === 'selectSubtree') return;
      await page.keyboard.press('Backspace');
      await settle();
      return;
    }
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

/**
 * A drop in Roam: the pressed block's bullet (`.rm-bullet`, an HTML5 drag source) held, moved past it,
 * to the drop area of the place, and released. While a block is dragged Roam puts a separator in each
 * list of children (the page's, a block's) before its first child, or in an empty one, and after each
 * child, the dragged block's own not counted: a line of no height, its drop area (`.dnd-drop-area`) a
 * band from 11px above it to 17px below, from its list's left (20px in, below the top level) to the
 * right, a deeper list's on top. So the place is aimed at its separator, a few pixels below it, at
 * the column the pressed bullet would land: its list's left, plus the bullet's own offset in its list.
 * It drags the pressed block, or the selected blocks where it is one of them; a drop of the selection
 * presses its first block's bullet.
 *
 * While dragging, Roam runs a frame loop (its scrolling at the window's edges, `requestAnimationFrame`
 * each frame till the drag ends), so the page never settles mid-drag: there the drag has settled once
 * Roam shows its drop bar at the place.
 */
async function drop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  // (a drop of the selection: a press on its first block's bullet)
  const press = drop.press ?? drop.rows[0];
  if (press === undefined) throw new Unsupported('a drop of nothing pressed or selected');
  const at = await page.evaluate(
    ({ pageUid, press, to }) => {
      const api = (window as any).roamAlphaAPI;
      // the blocks as `read` has them, in document order
      const uids: string[] = [];
      const walk = (b: any) => [...(b?.[':block/children'] ?? [])].sort((x, y) => x[':block/order'] - y[':block/order']).forEach((k) => (uids.push(k[':block/uid']), walk(k)));
      walk(api.pull('[:block/uid :block/order {:block/children ...}]', [':block/uid', pageUid]));
      const block = (i: number) => document.querySelector(`.roam-article .roam-block-container[data-block-uid="${uids[i]}"]`) as HTMLElement | null;
      const pressed = block(press!);
      const bullet = pressed?.querySelector(':scope > .rm-block-main .rm-bullet');
      if (!pressed || !bullet) return null;
      // the list the place is in: the page's (a top-level block's), or the parent's children
      const list = (to.parent === 'root' ? block(0)?.parentElement : block(to.parent)?.querySelector(':scope > .rm-block-children')) as HTMLElement | null | undefined;
      const after = to.after === null ? null : block(to.after);
      if (!list || after === undefined) return null;
      const y = after ? after.getBoundingClientRect().bottom : list.getBoundingClientRect().top;
      const b = bullet.getBoundingClientRect();
      const x = list.getBoundingClientRect().left + (b.left + b.width / 2 - pressed.parentElement!.getBoundingClientRect().left);
      return { from: { x: b.left + b.width / 2, y: b.top + b.height / 2 }, to: { x, y: y + 4 }, line: y };
    },
    { pageUid: pageState(page).current, press, to: drop.to },
  );
  if (!at) throw new Unsupported("the pressed block's bullet, or the place's list, isn't on the page");
  let dragging = true;
  const shown = async (): Promise<void> => {
    if (!dragging) return settle();
    dragging = false;
    // (the bar: 4px high, its bottom on the separator; the place's area hovered)
    await page
      .waitForFunction((line) => [...document.querySelectorAll('.dnd-drop-bar')].some((e) => Math.abs(e.getBoundingClientRect().bottom - line) < 2), at.line, { timeout: 2000 })
      // (no bar: released all the same, as a hand would, and judged by what it did)
      .catch(() => {});
  };
  await gesture(page, at.from, at.to, shown);
}
