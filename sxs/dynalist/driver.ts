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
import { perPage, type Driver, type Drop } from '../lib/driver.ts';
import { italicsAsMarkdown, type Outline } from '../lib/block.ts';
import { gesture } from '../lib/drag.ts';

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
  /** Numbered: its parent's list style numbers all its children, from 1 (a CSS counter per parent). */
  numbered: boolean;
}

/** Each block's siblings, the blocks of one parent (-1: the top level), by their parent's index. */
function siblings(o: Outline): Map<number, number[]> {
  const kids = new Map<number, number[]>();
  const path: number[] = [];
  o.blocks.forEach((b, i) => {
    path.length = b.depth;
    const parent = b.depth ? path[b.depth - 1]! : -1;
    kids.set(parent, [...(kids.get(parent) ?? []), i]);
    path[b.depth] = i;
  });
  return kids;
}

/**
 * A block's canonical text as an item, and how many characters of it the item's attributes took; a
 * number that is text is escaped in the canonical text, not in the content (`cut`).
 */
function toItem(depth: number, text: string): Item & { prefix: number; cut?: number } {
  const numbered = /^\d{1,9}\. /.exec(text);
  const after = numbered ? text.slice(numbered[0].length) : text;
  const task = /^\[([ xX])\](?: |$)/.exec(after);
  const rest = task ? after.slice(task[0].length) : after;
  const heading = /^(#{1,3}) /.exec(rest);
  const prefix = (numbered?.[0].length ?? 0) + (task?.[0].length ?? 0) + (heading?.[0].length ?? 0);
  let content = text.slice(prefix);
  // a number that is text (after a numbered item's own number too)
  const literal = prefix === (numbered?.[0].length ?? 0) ? /^(\d{1,9})\\(?=[.)])/.exec(content) : null;
  if (literal) content = literal[1] + content.slice(literal[0].length);
  return { depth, content, note: '', checkbox: !!task, checked: !!task && task[1] !== ' ', heading: heading?.[1]!.length ?? 0, numbered: !!numbered, prefix, ...(literal && { cut: prefix + literal[1]!.length }) };
}

/** An item's canonical text, and the length of the prefix its attributes stand for: its number `number` where it is numbered. */
function fromItem(it: Item, number: number | null): { text: string; prefix: number; cut?: number } {
  const prefix = (number !== null ? `${number}. ` : '') + (it.checkbox || it.checked ? (it.checked ? '[x] ' : '[ ] ') : '') + (it.heading ? '#'.repeat(it.heading) + ' ' : '');
  const literal = !prefix || prefix === `${number}. ` ? /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(it.content) : null;
  const content = literal ? it.content.slice(0, literal[0].length) + '\\' + it.content.slice(literal[0].length) : it.content;
  return { text: prefix + content + (it.note ? '\n' + it.note : ''), prefix: prefix.length, ...(literal && { cut: literal[0].length }) };
}

/** A worker's: whether its test was loaded with a view (folds, a zoom), which is read back then alone. */
const viewed = perPage(() => ({ on: false }));

export const driver: Driver = {
  shortId: 'DL',
  longId: 'dynalist',
  displayName: 'Dynalist',
  url: 'https://dynalist.io/demo',
  model: 'block',
  // a block's text holds a blank line, its paragraphs apart
  paragraphsInBlock: true,
  // an item collapsed (`view.set_node_collapse`, read as `is_collapsed`), and a zoom into one
  // (`view.zoom_node`, read as `ui.current_root`), the document's root, zoomed into for every test,
  // standing for none
  folds: true,
  zooms: true,
  keys: {
    // `doc-collapse` toggles (no key folds or unfolds alone); `doc-zoom-in`, `doc-zoom-out`
    toggleFold: 'Control+Period',
    zoomIn: 'Control+BracketRight',
    zoomOut: 'Control+BracketLeft',
    enter: 'Enter',
    shiftEnter: 'Control+Shift+Enter',
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Control+ArrowUp',
    moveSubtreeDown: 'Control+ArrowDown',
    // the selection commands (spec/select.md): Ctrl-A, Shift-Down and Shift-Up as the app has them
    expandSelection: 'Control+a',
    selectNodeDown: 'Shift+ArrowDown',
    selectNodeUp: 'Shift+ArrowUp',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    deleteSubtree: 'Control+Shift+Backspace',
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    // "go to first item" and "go to last item" land at the item's start and end
    cursorDocStart: 'Control+Home',
    cursorDocEnd: 'Control+End',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // a code block's fences are text, edited a character at a time, with no boundary to compare where
  // ourus has one (`markup-fence`, as for Logseq, Tine, Athens and Roam); the other `markup-` tags are
  // played: a caret at a heading's or a to-do's text start is the item's start (one inside the `#`s or
  // the checkbox, `holds` declines), a join takes the item's attributes along. Code and math are an
  // item's text, with no editor of their own: Enter in them splits the item (`enter-in-fence`)
  refuses: ['markup-fence', 'enter-in-fence'],
  ordered: true,
  // a drop leaves the dropped item selected as an item, the caret gone (README.md, "Drag and drop")
  noCaretAfter: ['moveSubtree'],
  // its `load` selects items as items, as `read` reports them
  selectsBlocks: true,
  // a typed fence is left open (Backtick2, Backtick12, Backtick15)
  behaves: {
    // Shift-Up takes the sibling above with its subtree
    selectNodeUp: 'sibling',
    // a quote is the block's text, its lines as written, `>` and all (probed 2026-10-25)
    quotes: 'atom',
    // Enter in a quote splits it, the rest a block of its own (probed 2026-10-25)
    enterInQuote: 'split',
    // Enter mid-heading: the new block above takes the text before the caret, the heading (an
    // attribute) staying with the rest (TO-E13-E16, TO-E14-E20)
    quirkEnterMidHeading: 'workflowy',
    // a clipboard of text alone pasted as plain text, its markers text (checked by hand: `- x⏎- y` at
    // `a┃` gives `a- x`, `- y`; with HTML, a list)
    quirkPasteText: 'dynalist',
    outdent: 'logical',
    enterSplitSpace: 'start',
    joinWithChildren: 'refuse',
    emptyItemWithChildren: 'refuse',
    closeBackticks: 'none',
    copyAtCaret: 'host',
    copySelection: 'nodes',
    pasteLines: 'items',
    pastePlainLines: 'enter',
    pasteOnParent: 'after',
    pasteParagraphList: 'children',
  },
  // "Unindent in place" (Settings › Editor): Shift+Tab takes the item's later siblings along as children
  settings: { outdent: ['logical', 'direct'] },
  holds(doc) {
    const o = doc as Outline;
    if (o.blocks.some((b) => /^(\[[ xX]\] )?#{4,6} /.test(b.text))) return 'heading deeper than H3';
    // (blocks are selected by Shift-Down from the first, which takes the parent in past a deeper one)
    if (o.selected && new Set(o.selected.map((i) => o.blocks[i]!.depth)).size > 1) return 'blocks selected at two depths: Shift-Down takes their parent in';
    // a checkbox and a heading level are the item's attributes, not text: no caret goes there
    if (o.sel && Math.min(o.sel.anchor, o.sel.head) < toItem(0, o.blocks[o.sel.block]!.text).prefix) return "caret in a task's checkbox or a heading's #s";
    // numbering is a parent's list style: all its children numbered, from 1, or none
    for (const list of siblings(o).values()) {
      const numbers = list.map((i) => /^(\d{1,9})\. /.exec(o.blocks[i]!.text)?.[1]);
      if (numbers.some(Boolean) && !numbers.every((n, k) => Number(n) === k + 1)) return 'list numbered in part, or not from 1';
    }
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
    const local = (p: number, it: (typeof items)[number]): number => p - it.prefix - (it.cut !== undefined && p > it.cut ? 1 : 0);
    // a selection of items: the caret at the first one's start, then Shift+Down (`selectsBlocks`)
    const selected = !o.sel && o.selected?.length ? o.selected : null;
    const sel = o.sel ? { block: o.sel.block, anchor: local(o.sel.anchor, items[o.sel.block]!), head: local(o.sel.head, items[o.sel.block]!) } : selected && { block: selected[0]!, anchor: 0, head: 0 };
    // a numbered list is its parent's list style (the root's for the top level): `holds` saw to it
    // that a parent's children are all numbered or none
    const numbers = new Set([...siblings(o)].filter(([, list]) => items[list[0]!]!.numbered).map(([parent]) => parent));
    const lists = items.map((_, i) => numbers.has(i));
    await page.evaluate(
      async ({ items, lists, topNumbered, sel, view }) => {
        const ad = (window as any).DYNALIST.app.app_document;
        // a popup the last test opened (`!` at a word's start opens the date picker) is a scope over
        // the editor's, and outlives the test: under it, the paste handler leaves a paste to the browser
        (window as any).DYNALIST.app.scope.fix_scope_to_editor();
        (document.activeElement as HTMLElement | null)?.blur();
        ad.ui.selection().set_no_select();
        const root = ad.document.get_node_collection().get_root();
        if (!ad.ui.current_root.is_root()) ad.view.zoom_node(root);
        // the last test's items go and this test's come, in one edit; then the history is emptied, so
        // that undo stops where the test starts
        const made: any[] = [];
        ad.view.exec((a: any) => {
          for (const child of root.children.array().slice()) a.detach(child);
          // the title as the demo has it: Backspace at the first item's start joins the item to it,
          // and a caret left there types into it, test after test
          a.edit(root, (m: any) => {
            m.set_content('Welcome to Dynalist');
            m.set_list_style(topNumbered ? 1 : 0);
          });
          const parents = [root];
          for (const [i, it] of items.entries()) {
            const node = ad.controller.create_node();
            const parent = parents[it.depth];
            a.attach(node, parent, parent.children.length());
            a.edit(node, (m: any) => {
              m.set_content(it.content);
              if (it.checkbox) m.set_checkbox(true);
              if (it.checked) m.set_checked(true);
              if (it.heading) m.set_heading(it.heading);
              if (lists[i]) m.set_list_style(1);
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
        // its view, every item on screen: the folded ones collapsed, then the zoom root zoomed into
        if (view) {
          for (const i of view.folded) ad.view.set_node_collapse(made[i], true);
          if (view.zoom !== null) ad.view.zoom_node(made[view.zoom]);
          await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        }
        if (!sel) return;
        // the caret, from anchor to head in the item's content
        ad.ui.set_selection(made[sel.block], sel.anchor, sel.head);
        const el = ad.ui.get_node_state(made[sel.block]).dom.content_el as HTMLElement;
        for (let i = 0; i < 100 && document.activeElement !== el; i++) await new Promise((r) => setTimeout(r, 10));
        if (document.activeElement !== el) throw new Error(`the item didn't take the caret (focus: ${(document.activeElement as HTMLElement | null)?.className})`);
      },
      { items, lists, topNumbered: numbers.has(-1), sel, view: o.view ?? null },
    );
    viewed(page).on = !!o.view;
    if (!selected) return;
    // past the first item's text, Shift+Down selects it as an item, then each next one
    const last = selected[selected.length - 1]!;
    const reached = async (): Promise<number> => {
      await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 }));
      return Math.max(-1, ...(((await this.read(page)) as Outline).selected ?? []));
    };
    for (let k = 0; k <= o.blocks.length + o.blocks[selected[0]!]!.text.split('\n').length && (await reached()) < last; k++) await page.keyboard.press('Shift+ArrowDown');
  },

  async read(page: Page) {
    const raw = await page.evaluate((viewed) => {
      const ad = (window as any).DYNALIST.app.app_document;
      const root = ad.document.get_node_collection().get_root();
      const flat: { depth: number; content: string; note: string; checkbox: boolean; checked: boolean; heading: number; numbered: boolean; number: number | null; id: string; collapsed: boolean }[] = [];
      const walk = (node: any, depth: number) => {
        // a parent's list style numbers all its children, from 1 (a CSS counter per parent)
        const numbered = node.get_meta_object().is_numbered_list();
        let n = 0;
        node.children.each((c: any) => {
          const m = c.get_meta_object();
          n++;
          flat.push({ depth, content: m.get_content(), note: m.get_note(), checkbox: m.has_checkbox(), checked: m.is_checked(), heading: m.get_heading() || 0, numbered, number: numbered ? n : null, id: c.get_id(), collapsed: c.children.length() > 0 && c.is_collapsed() });
          walk(c, depth + 1);
        });
      };
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
      // the view: the collapsed items, and the item zoomed into, if one of the test's (the root: none)
      const zoom = index(ad.ui.current_root.is_root() ? null : ad.ui.current_root);
      const view = viewed ? { folded: flat.flatMap((f, k) => (f.collapsed ? [k] : [])), zoom: zoom >= 0 ? zoom : null } : undefined;
      return { flat, sel, selected, view };
    }, viewed(page).on);
    const texts = raw.flat.map((f) => fromItem(f, f.number));
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel) {
      const it = raw.flat[raw.sel.block]!;
      const { prefix, cut } = texts[raw.sel.block]!;
      const base = prefix + (raw.sel.inNote ? it.content.length + (cut !== undefined ? 1 : 0) + 1 : 0);
      const at = (p: number): number => base + p + (!raw.sel!.inNote && cut !== undefined && p > cut ? 1 : 0);
      sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
    }
    // (its italic `__x__` as Markdown's)
    return { ...italicsAsMarkdown({ blocks, sel, ...(raw.selected.length && { selected: raw.selected }) }), ...(raw.view && { view: raw.view }) };
  },

  drops: ['moveSubtree'],
  drop,
};

/**
 * A drop in Dynalist (its `DocumentDragManager`, mouse events, not HTML5's): the pressed item's
 * bullet held, moved past its threshold, to where `node_drop_location` puts the place, and released.
 * That reads the pointer's y against the items' rows, the dragged ones left out: the upper half of an
 * item's line is before it, the lower half of a leaf's after it, the lower half of a parent's before
 * its first child, the strip of padding under an item's last child after it; x only says "into" a leaf,
 * past a column 30 pixels and a fifth of its line right of its bullet (`cursor_hit_inner_children`).
 * It drags the item pressed, or the selection's items where it is one of them (a drop of the
 * selection presses its first). Where the items already are, a line it refuses as no move keeps the
 * place last shown, one the way there passed: the pointer goes on the first's own line, where there
 * is no place, and nothing moves.
 */
async function drop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  const at = await page.evaluate(({ press, rows, to }) => {
    const ad = (window as any).DYNALIST.app.app_document;
    // the items in document order, as `read` has them
    const flat: any[] = [];
    const walk = (node: any) => node.children.each((c: any) => (flat.push(c), walk(c)));
    const root = ad.document.get_node_collection().get_root();
    walk(root);
    const pressed = flat[press ?? rows[0]!];
    const dragged = new Set(rows.map((r) => flat[r]));
    const first = flat[rows[0]!];
    const parent = to.parent === 'root' ? root : flat[to.parent];
    const after = to.after === null ? null : flat[to.after];
    const dom = (n: any) => ad.ui.get_node_state(n).dom;
    const box = (el: HTMLElement) => el.getBoundingClientRect();
    const bullet = box(dom(pressed).bullet_el);
    const from = { x: bullet.left + bullet.width / 2, y: bullet.top + bullet.height / 2 };
    // a point on an item's line, `f` of the way down, at its bullet's column
    const on = (n: any, f: number) => {
      const self = box(dom(n).self_el);
      const b = box(dom(n).bullet_el);
      return { x: b.left + b.width / 2, y: self.top + self.height * f };
    };
    const kids = (n: any) => n.children.array().filter((c: any) => !dragged.has(c));
    // where they are: on the first's own line
    if (first.get_parent() === parent && (first.prev() ?? null) === after) return { from, to: on(first, 0.5) };
    if (after === null) {
      const top = kids(parent)[0];
      if (top) return { from, to: on(top, 0.25) };
      // into a leaf: its line's lower half, past its "inner" column (its line starts 100 pixels left of its bullet)
      const self = box(dom(parent).self_el);
      return { from, to: { x: self.left + 100 + 0.2 * (self.width - 100) + 30 + 40, y: self.top + self.height * 0.75 } };
    }
    const next = kids(parent)[kids(parent).indexOf(after) + 1];
    if (next) return { from, to: on(next, 0.25) };
    if (!after.children.length()) return { from, to: on(after, 0.75) };
    // after a parent, the last of its own parent's: the padding under its children
    const outer = box(dom(after).node_outer_el);
    const children = box(dom(after).children_el);
    return { from, to: { x: on(after, 0.5).x, y: (children.bottom + outer.bottom) / 2 } };
  }, drop);
  await gesture(page, at.from, at.to, settle);
}
