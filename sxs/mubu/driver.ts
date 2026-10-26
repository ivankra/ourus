/// <reference lib="dom" />
// Mubu (幕布, see README.md): an outline shared on its site (https://mubu.com/explore/<id>), which
// opens in Mubu's own editor, read-only to a visitor without an account. The driver makes it editable
// (the editor's `editable` setting, `outliner.config`), so it edits as a signed-in owner's does and
// saves nothing: a visitor may not, and Mubu checks that apart from the editor. Each test replaces the
// outline's nodes with its own, made and read through the editor's model (`outliner.modelEditor`,
// `outliner.model`), found in the page's Redux store (`state.doc.outliner`). The actions are Mubu's
// keys on Linux.
//
// - A node has a text (one line, rich text) and a note (Shift+Enter): a block's first line is the
//   text, the rest the note. The caret in the note is past the text and the line break.
// - A to-do is a task (`taskStatus` 1, `[ ] `; 2, done, `[x] `), H1 to H3 a node's heading level:
//   attributes, not text. Mubu's other marks on a node (finished, a colour) have no Markdown, and
//   none of them is made or read.
// - A node's text is runs (`{ type: 1, text, style }`); one given as a string is read as HTML.

import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { runsAsMarkdown, type Outline, type Run } from '../lib/block.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A node as the page makes and reads it. */
interface Item {
  depth: number;
  text: string;
  /** null: no note. */
  note: string | null;
  /** 0: no task, 1: to do, 2: done. */
  task: number;
  /** 0: none, 1 to 3: H1 to H3. */
  heading: number;
}

/** A block's canonical text as a node, and how many characters of its first line the node's attributes took. */
function toItem(depth: number, text: string): Item & { prefix: number } {
  const [first, ...rest] = text.split('\n');
  const note = rest.length ? rest.join('\n') : null;
  const task = /^\[([ xX])\](?: |$)/.exec(first!);
  const after = task ? first!.slice(task[0].length) : first!;
  const heading = /^(#{1,3}) /.exec(after);
  const prefix = (task?.[0].length ?? 0) + (heading?.[0].length ?? 0);
  return { depth, text: first!.slice(prefix), note, task: task ? (task[1] === ' ' ? 1 : 2) : 0, heading: heading?.[1]!.length ?? 0, prefix };
}

/** A node's canonical text, and the length of the prefix its attributes stand for. */
function fromItem(it: Item): { text: string; prefix: number } {
  const prefix = (it.task ? (it.task === 2 ? '[x] ' : '[ ] ') : '') + (it.heading ? '#'.repeat(it.heading) + ' ' : '');
  return { text: prefix + it.text + (it.note !== null ? '\n' + it.note : ''), prefix: prefix.length };
}

/** The page's Redux store, found through React (the root's fiber tree, the first `store` prop). */
const FIND_STORE = `(() => {
  if (window.__sxsStore) return window.__sxsStore;
  const root = document.getElementById('root');
  const key = root && Object.keys(root).find((k) => k.startsWith('__reactContainer'));
  const stack = key ? [root[key]] : [];
  while (stack.length) {
    const f = stack.pop();
    if (f?.memoizedProps?.store?.getState) return (window.__sxsStore = f.memoizedProps.store);
    if (f?.child) stack.push(f.child);
    if (f?.sibling) stack.push(f.sibling);
  }
  return null;
})()`;

export const driver: Driver = {
  shortId: 'MB',
  longId: 'mubu',
  displayName: 'Mubu',
  url: 'https://mubu.com/explore/rHSdgLpbl',
  model: 'block',
  keys: {
    enter: 'Enter',
    // no `shiftEnter`: Shift+Enter goes to the node's note, another action than a line break in its
    // text, which a node's text doesn't hold (its cases skip)
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    // "move up", "move down": the node with its children
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    // "delete node", "clone"
    deleteSubtree: 'Control+Shift+Backspace',
    duplicateSubtree: 'Control+d',
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  // Ctrl+Home and Ctrl+End go to the node's text's start and end, not the outline's
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
  // a node's text is one line of rich text, with nothing of Markdown's blocks: no code block, no quote
  // (`> q` would be its text). A task and a heading level are a node's attributes: a caret in them has
  // no place (`holds`), and a join or split at them is Mubu's to show
  refuses: ['code block', 'html', 'table', 'math', 'thematic break', 'link reference definition', 'comment', 'footnote', 'quote'],
  // measured with `--ignore-options` (2026-10-26): each value agrees where ourus's default doesn't
  behaves: {
    // Shift+Tab takes the later siblings along as children (LogicalOutdent1, LogicalOutdent4, TO7)
    outdent: 'logical',
    // a split keeps the space at the new node's start (Enter65 to Enter65d, Enter65i, Enter65j)
    enterSplitSpace: 'start',
    // Backspace joins a node only to its previous sibling, never a node with children
    // (`mergeToPrevNode`: Backspace45b, Delete31b, Regression20), nor an empty one with children
    // (Backspace17f, Backspace17g), nor the first node into the title (Backspace34)
    joinWithChildren: 'refuse',
    emptyItemWithChildren: 'refuse',
    backspaceAtTopItem: 'refuse',
    // a heading level is the node's: a join takes it along, Backspace at its start doesn't drop it
    // (Regression18, Regression19, Backspace18f, Delete13b, Delete13f)
    headingEditing: 'block',
    // pasted lines are nodes (Paste17g, Paste18, Paste19, Scenario17), and leave a selection's text
    // as it is (Paste17b to Paste17d, Paste17f, PastePlain33c)
    pasteLines: 'items',
    pasteOverSelection: 'ignore',
  },
  holds(doc) {
    const o = doc as Outline;
    if (o.blocks.some((b) => /^#{4,6} /.test(b.text.replace(/^\[[ xX]\] /, '')))) return 'heading deeper than H3';
    // a block's later lines are its node's note, which an empty last line isn't
    if (o.blocks.some((b) => b.text.endsWith('\n'))) return "block's text ending in a line break: an empty note is none";
    if (o.sel) {
      const it = toItem(0, o.blocks[o.sel.block]!.text);
      // a task's checkbox and a heading's level are the node's attributes, not text: no caret goes there
      if (Math.min(o.sel.anchor, o.sel.head) < it.prefix) return "caret in a task's checkbox or a heading's #s";
      // a node's text is drawn without its trailing spaces (`a ` as `<span>a</span>`), which its
      // model keeps: no caret goes past them (Enter58)
      if (Math.max(o.sel.anchor, o.sel.head) > it.prefix + it.text.trimEnd().length && Math.max(o.sel.anchor, o.sel.head) <= it.prefix + it.text.length) return "caret past a node's trailing spaces, which Mubu doesn't draw";
      // the text and the note are editors of their own: no selection spans both
      const textEnd = it.prefix + it.text.length;
      if (it.note !== null && Math.min(o.sel.anchor, o.sel.head) <= textEnd && Math.max(o.sel.anchor, o.sel.head) > textEnd) return "selection across a node's text and its note";
    }
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction((find) => (0, eval)(find)?.getState().doc.outliner?.model && document.querySelector('.outliner-page .content.mm-editor'), FIND_STORE, { timeout: 120000 });
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`Mubu didn't settle after loading: ${settled.pending}`);
    await page.evaluate((find) => {
      const store = (0, eval)(find);
      // the sign-in dialog a visitor is shown (`state.modal.loginModal`), closed as its own close button
      // does, whenever it opens: it takes the focus
      const close = () => {
        if (store.getState().modal?.loginModal?.visible) store.dispatch({ type: '@modal/set_login_modal_visible', payload: { visible: false } });
      };
      if (!(window as any).__sxsLoginClosed) {
        (window as any).__sxsLoginClosed = true;
        store.subscribe(close);
      }
      close();
    }, FIND_STORE);
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
    if (!ready) throw new Error("Mubu's keys didn't come up: Tab doesn't indent");
    // the release Mubu's error reporting names (its build time)
    return page.evaluate(() => `web ${(window as any).__SENTRY__?.hub?.getClient?.()?.getOptions?.()?.release ?? '?'}`);
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const items = o.blocks.map((b) => toItem(b.depth, b.text));
    let sel: { block: number; anchor: number; head: number; inNote: boolean } | null = null;
    if (o.sel) {
      const it = items[o.sel.block]!;
      // an offset in the block's text: in the node's attributes, its text's start; past the first line, the note
      const textEnd = it.prefix + it.text.length;
      const inNote = Math.max(o.sel.anchor, o.sel.head) > textEnd && it.note !== null;
      const local = (p: number) => (inNote ? p - textEnd - 1 : Math.max(0, p - it.prefix));
      sel = { block: o.sel.block, anchor: local(o.sel.anchor), head: local(o.sel.head), inNote };
    }
    await page.evaluate(
      async ({ items, sel, find }) => {
        const outliner = (0, eval)(find).getState().doc.outliner;
        const { model, modelEditor } = outliner;
        const idle = () => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        // editable, as the owner's outline is (Mubu sets it so for a page the visitor may only read)
        if (!outliner.config.getConfig('editable')) outliner.config.setConfig('editable', true);
        (document.activeElement as HTMLElement | null)?.blur();
        // the last test's nodes go and this test's come, each top-level one with its children; then the
        // history is emptied, so that undo stops where the test starts
        for (const n of model.nodes.slice()) modelEditor.delete(n.id);
        const runs = (s: string) => (s ? [{ type: 1, text: s }] : []);
        const roots: any[] = [];
        const parents: any[] = [];
        for (const it of items) {
          const node = { text: runs(it.text), note: it.note === null ? '' : runs(it.note), ...(it.heading && { heading: it.heading }), ...(it.task && { taskStatus: it.task }), children: [] as any[] };
          (it.depth ? parents[it.depth - 1].children : roots).push(node);
          parents[it.depth] = node;
          parents.length = it.depth + 1;
        }
        roots.forEach((n, i) => modelEditor.create(n, null, i));
        modelEditor.undoManager.clearStack();
        // the nodes in the outline's order, as `read` walks them
        const ids: string[] = [];
        const walk = (ns: any[]) => ns.forEach((n) => (ids.push(n.id), walk(n.children ?? [])));
        walk(model.toJSON().nodes);
        if (ids.length !== items.length) throw new Error(`made ${ids.length} nodes of the test's ${items.length}`);
        const editor = (id: string, note = false) => document.querySelector(`.outliner-page .${note ? 'note' : 'content'}.mm-editor[data-id="${id}"]`) as HTMLElement | null;
        for (let i = 0; i < 300 && !ids.every((id) => editor(id)); i++) await new Promise((r) => setTimeout(r, 10));
        if (!ids.every((id) => editor(id))) throw new Error("the test's nodes didn't render");
        await idle();
        if (!sel) return;
        // the caret, as Mubu's own commands put it (moving a node, say), then its direction
        const id = ids[sel.block]!;
        outliner.command.execute('focus', id, sel.inNote, { start: Math.min(sel.anchor, sel.head), end: Math.max(sel.anchor, sel.head) });
        const el = editor(id, sel.inNote)!;
        for (let i = 0; i < 100 && document.activeElement !== el; i++) await new Promise((r) => setTimeout(r, 10));
        if (document.activeElement !== el) throw new Error(`the node didn't take the caret (focus: ${(document.activeElement as HTMLElement | null)?.className})`);
        if (sel.head < sel.anchor) {
          const at = (offset: number): [Node, number] => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let left = offset;
            let last: Node | null = null;
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
              const len = n.textContent!.length;
              if (left <= len) return [n, left];
              left -= len;
              last = n;
            }
            return last ? [last, last.textContent!.length] : [el, 0];
          };
          const s = getSelection()!;
          s.collapse(...at(sel.anchor));
          s.extend(...at(sel.head));
        }
        await idle();
      },
      { items, sel, find: FIND_STORE },
    );
  },

  async read(page: Page) {
    const raw = await page.evaluate((find) => {
      const outliner = (0, eval)(find).getState().doc.outliner;
      const plain = (t: any): string => (Array.isArray(t) ? t.map((s) => s.text ?? '').join('') : String(t ?? ''));
      // a node's runs, each with its formatting (Mubu's underline has no Markdown: plain)
      const runsOf = (t: any): Run[] =>
        Array.isArray(t)
          ? t.map((s) => ({ text: s.text ?? '', ...(s.style?.bold && { bold: true }), ...(s.style?.italic && { italic: true }), ...(s.style?.strikethrough && { strike: true }), ...(s.style?.code && { code: true }), ...(s.link && { href: s.link }) }))
          : [{ text: String(t ?? '') }];
      const flat: { depth: number; runs: Run[]; note: string | null; task: number; heading: number; id: string }[] = [];
      const walk = (ns: any[], depth: number) =>
        ns.forEach((n) => {
          const note = plain(n.note);
          flat.push({ depth, runs: runsOf(n.text), note: note ? note : null, task: n.taskStatus === 1 || n.taskStatus === 2 ? n.taskStatus : 0, heading: n.heading || 0, id: n.id });
          walk(n.children ?? [], depth + 1);
        });
      walk(outliner.model.toJSON().nodes, 0);
      // nodes selected as nodes (Shift+Up or Down past a node's edge): the caret's editor keeps the focus
      const s = outliner.getService('Selection').getSelection();
      const selected: number[] = s?.type === 'node' ? s.nodes.map((id: string) => flat.findIndex((f) => f.id === id)).filter((i: number) => i >= 0) : [];
      let sel: { block: number; anchor: number; head: number; inNote: boolean; text: string } | null = null;
      const el = document.activeElement as HTMLElement | null;
      if (!selected.length && el?.classList.contains('mm-editor') && el.closest('.outliner-page') && el.dataset.id) {
        // offsets in the editor's text, from the DOM's selection
        const ds = getSelection()!;
        const offset = (node: Node | null, at: number): number => {
          if (!node || !el.contains(node)) return 0;
          const r = document.createRange();
          r.setStart(el, 0);
          r.setEnd(node, at);
          return r.toString().length;
        };
        const block = flat.findIndex((f) => f.id === el.dataset.id);
        if (block >= 0) sel = { block, anchor: offset(ds.anchorNode, ds.anchorOffset), head: offset(ds.focusNode, ds.focusOffset), inNote: el.classList.contains('note'), text: el.textContent ?? '' };
      }
      return { flat, sel, selected };
    }, FIND_STORE);
    // a node's text as Markdown, its formatting in markup, and where an offset in the text is in it
    const mds = raw.flat.map((f) => runsAsMarkdown(f.runs));
    // a note being edited, empty, is none in the model yet: the caret's editor says it's there
    const notes = raw.flat.map((f, i) => (raw.sel?.block === i && raw.sel.inNote && f.note === null ? raw.sel.text : f.note));
    const texts = raw.flat.map((f, i) => fromItem({ ...f, text: mds[i]!.text, note: notes[i]! }));
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel) {
      const { prefix } = texts[raw.sel.block]!;
      const md = mds[raw.sel.block]!;
      const at = (p: number): number => (raw.sel!.inNote ? prefix + md.text.length + 1 + p : prefix + md.at(p));
      sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // Mubu has no key for the outline's ends: Up (Down) until the caret stops, then Home (End). Up from
    // the first node goes into the outline's title (editable with the outline), no block: back down.
    // With Shift, past a node's edge the selection is of nodes, which goes on growing
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
