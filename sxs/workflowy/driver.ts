/// <reference lib="dom" />
// WorkFlowy (see README.md): the live app WorkFlowy's "Try WorkFlowy Instantly" page
// (https://beta.workflowy.com/demo/embed/) embeds, for an anonymous user who needs no login. Each test runs in one item kept for it at the top of the outline, zoomed into; its children are
// the test's blocks, made and read through WorkFlowy's scripting API (`window.WF`). The actions are
// WorkFlowy's keys on Linux.
//
// - An item has a name (one line, rich text) and a note (any number of lines): a block's first line
//   is the name, the rest the note. The caret in the note is past the name and the line break.
// - Item types stand for Markdown: a to-do is a task (`[ ] `, `[x] ` when completed), H1 to H3 are
//   `#` to `###` headings.
// - The item being edited is read from its editor (`.editor.plainText`, `WF.DomEditableText`):
//   WorkFlowy stores what is typed half a second after typing stops (`WF.Editor.saveLater`).

import type { Page } from 'playwright-core';
import type { Driver, Drop } from '../lib/driver.ts';
import { gesture } from '../lib/drag.ts';
import { compareOutlines, draw, project, runsAsMarkdown, Unsupported, type Outline, type Run } from '../lib/block.ts';

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
  name: string;
  /** null: no note. */
  note: string | null;
  /** `code-block`: its name the code, many lines; `quote-block`: one item's quote. Other layouts read as bullets. */
  layout: 'bullets' | 'todo' | 'h1' | 'h2' | 'h3' | 'numbered' | 'code-block' | 'quote-block';
  completed: boolean;
  /** A numbered item's number as written, which the first of a run starts the run with (`numbered_start`). */
  number?: number;
}

/** A fenced code block as WorkFlowy's code block holds it: backticks, no info string (it keeps no language). */
const FENCE = /^(`{3,})\n([\s\S]*)\n\1$/;

/** The fence a code block reads back with (WorkFlowy's export writes three backticks): the shortest run of three or more longer than any in the code. */
const fenceFor = (code: string): string => '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1)));

/** A block's canonical text as an item, and how many characters of its first line the item type took. */
function toItem(depth: number, text: string): Item & { prefix: number; cut?: number } {
  const code = FENCE.exec(text);
  if (code) return { depth, name: code[2]!, note: null, layout: 'code-block', completed: false, prefix: code[1]!.length + 1 };
  const [first, ...rest] = text.split('\n');
  const note = rest.length ? rest.join('\n') : null;
  const task = /^\[([ xX])\](?: |$)/.exec(first!);
  if (task) return { depth, name: first!.slice(task[0].length), note, layout: 'todo', completed: task[1] !== ' ', prefix: task[0].length };
  const heading = /^(#{1,3}) /.exec(first!);
  if (heading) return { depth, name: first!.slice(heading[0].length), note, layout: `h${heading[1]!.length}` as Item['layout'], completed: false, prefix: heading[0].length };
  if (first!.startsWith('> ')) return { depth, name: first!.slice(2), note, layout: 'quote-block', completed: false, prefix: 2 };
  // a numbered item: its number its place in its run of numbered siblings
  const numbered = /^\d{1,9}\. /.exec(first!);
  const prefix = numbered?.[0].length ?? 0;
  const name = first!.slice(prefix);
  // a number that is text (after a numbered item's own number too): escaped in the canonical text,
  // not in the item's name
  const literal = /^(\d{1,9})\\(?=[.)])/.exec(name);
  const layout = numbered ? 'numbered' : 'bullets';
  const number = numbered ? { number: Number(numbered[0].slice(0, -2)) } : {};
  if (literal) return { depth, name: literal[1] + name.slice(literal[0].length), note, layout, completed: false, prefix, cut: prefix + literal[1]!.length, ...number };
  return { depth, name, note, layout, completed: false, prefix, ...number };
}

/**
 * An item's canonical text, and the length of the prefix its type stands for: a numbered item's
 * number is `number`, its place in its run; a number that is text is escaped (`cut`).
 */
function fromItem(it: Item, number: number | null): { text: string; prefix: number; cut?: number; fence?: string } {
  if (it.layout === 'code-block') {
    const fence = fenceFor(it.name);
    return { text: `${fence}\n${it.name}\n${fence}` + (it.note !== null ? '\n' + it.note : ''), prefix: fence.length + 1, fence };
  }
  if (it.layout === 'quote-block') return { text: '> ' + it.name + (it.note !== null ? '\n' + it.note : ''), prefix: 2 };
  const prefix = it.layout === 'todo' ? (it.completed ? '[x] ' : '[ ] ') : /^h[123]$/.test(it.layout) ? '#'.repeat(Number(it.layout[1])) + ' ' : it.layout === 'numbered' && number !== null ? `${number}. ` : it.completed ? '[x] ' : '';
  const literal = !prefix || it.layout === 'numbered' ? /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(it.name) : null;
  const name = literal ? it.name.slice(0, literal[0].length) + '\\' + it.name.slice(literal[0].length) : it.name;
  return { text: prefix + name + (it.note !== null ? '\n' + it.note : ''), prefix: prefix.length, ...(literal && { cut: literal[0].length }) };
}

/** The test's item, made once per page. */
const CONTAINER = 'ourus sxs';

/**
 * `OURUS_SXS_WF_EXPORT=1`: a read checked against WorkFlowy's own Markdown export of the test's items
 * (`WF.Export.as`, as its share dialog calls it), projected as a spec buffer is: where the two outlines
 * differ, both are logged. The blocks only (the export has no caret). The item being edited is saved
 * first (`WF.Editor.saveFocused`, what WorkFlowy's own timer does half a second after typing stops,
 * done now: at a step's end, where the runner settles, and before a case's next step undoes it waits
 * that out anyway), or the export would have its text as it was. The test's item is exported, its
 * name dropped: WorkFlowy writes a lone exported item as a title, no bullet.
 */
async function checkExport(page: Page, got: Outline): Promise<void> {
  const md: string = await page.evaluate(() => {
    const WF = (window as any).WF;
    const box = WF.getItemById((window as any).__ourusBox);
    WF.Editor.saveFocused();
    const out = new WF.Format.StringOutput();
    WF.Export.as(out, 'markdown', [box.data.projectReferenceOrThrow.getItem()], true);
    return out.text as string;
  });
  const items = md.replace(/^[^\n]*\n+/, '');
  // (no items: nothing to check)
  if (!items.trim()) return;
  let exported: Outline;
  try {
    exported = project(items, 'gfm', { ordered: true }).outline;
  } catch (e) {
    console.log(`WorkFlowy's export doesn't project (${e instanceof Error ? e.message : e}):\n${items}`);
    return;
  }
  const verdict = compareOutlines({ ...exported, sel: null }, { ...got, sel: null });
  const show = (s: string): string => s.replace(/\n$/, '').replace(/^/gm, '    ');
  if (verdict !== 'agree') console.log(`WorkFlowy's export reads otherwise (${verdict}):\n  export:\n${show(items)}\n  as blocks:\n${show(draw({ ...exported, sel: null }, { ordered: true }))}\n  read:\n${show(draw({ ...got, sel: null }, { ordered: true }))}`);
}

export const driver: Driver = {
  shortId: 'WF',
  longId: 'workflowy',
  displayName: 'WorkFlowy',
  url: 'https://beta.workflowy.com/guide/embed/',
  model: 'block',
  // after deleting the first item no item is edited (its runs: DeleteSubtree3, 4), nor after a drop:
  // the drag blurs the item being edited as it starts (Drag1, Drag2)
  noCaretAfter: ['deleteSubtree', 'move'],
  // its `load` selects items as items, as `read` reports them
  selectsBlocks: true,
  keys: {
    enter: 'Enter',
    // no `shiftEnter`: Shift+Enter opens the item's note, another action than a line break in its
    // text, which a name doesn't hold (its cases skip)
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Alt+Shift+ArrowUp',
    moveSubtreeDown: 'Alt+Shift+ArrowDown',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    deleteSubtree: 'Control+Shift+Backspace',
    duplicateSubtree: 'Alt+Shift+d',
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+y',
    // WorkFlowy's "focus last" item, then the end of its text (the start: `act`)
    cursorDocEnd: ['Control+End', 'End'],
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart'],
  // a fenced block is a code block item (`holds` declines what it can't hold); tables and other atoms
  // have no faithful item form yet. No `markup-` tag: a heading's or a to-do's text start is the item's
  // start (a caret inside the `#`s or the checkbox `holds` declines), and those cases play as any
  refuses: ['html', 'table', 'math', 'thematic break', 'link reference definition', 'comment', 'footnote'],
  ordered: true,
  // Shift+Tab moves an item past its parent, leaving its later siblings there: logical outdenting;
  // paste opens the seam (the first pasted text joins), though not on an item with children
  // (on the paste files, 14 cases better under `open`, 3 worse)
  behaves: {
    // a quote is a style on one block: a quote of one paragraph is that block, its `>` the style (../../dev/19-quotes.md, Part 1)
    quotes: 'text',
    // Enter mid-heading: the new block above takes the text before the caret, the heading (an
    // attribute) staying with the rest (TO-E13-E16, TO-E14-E20)
    quirkEnterMidHeading: 'workflowy',
    outdent: 'logical',
    enterSplitSpace: 'start',
    enterOnEmptyItem: 'sibling',
    joinWithChildren: 'refuse',
    backspaceAtTopItem: 'refuse',
    emptyItemWithChildren: 'refuse',
    copyAtCaret: 'host',
    pasteSeams: 'open',
    pasteLines: 'items',
    pastePlainLines: 'items',
    pasteAtTextStart: 'before',
    pasteOnParent: 'after',
  },
  // WorkFlowy counts its animations (an item sliding into place, a zoom) while they run
  idle: { busy: `window.WF?.GuiAnimate?.animationsAreInProgress?.()` },
  holds(doc: Outline) {
    if (doc.blocks.some((b) => /^#{4,6} /.test(b.text))) return 'heading deeper than H3';
    // a code block is an item of its own, its fence three or more backticks, no more than its code needs,
    // and no language (WorkFlowy keeps none); the caret in its code
    for (const b of doc.blocks) {
      if (!/(^|\n)(`{3,}|~{3,})/.test(b.text)) continue;
      const code = FENCE.exec(b.text);
      if (!code) return "fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone";
      if (code[1] !== fenceFor(code[2]!)) return "code block's fence longer than its code needs, which WorkFlowy's reads back without";
    }
    if (doc.sel) {
      const it = toItem(0, doc.blocks[doc.sel.block]!.text);
      if (it.layout === 'code-block' && Math.max(doc.sel.anchor, doc.sel.head) > it.prefix + it.name.length) return "caret in a code block's fences";
      // the name and the note are fields of their own: no selection spans both
      const nameEnd = it.prefix + it.name.length;
      if (it.note !== null && Math.min(doc.sel.anchor, doc.sel.head) <= nameEnd && Math.max(doc.sel.anchor, doc.sel.head) > nameEnd) return "selection across an item's name and its note";
    }
    // a to-do's checkbox, a heading's level and a quote's `>` are the item's type, not text: no caret goes there
    if (doc.sel && Math.min(doc.sel.anchor, doc.sel.head) < toItem(0, doc.blocks[doc.sel.block]!.text).prefix) return "caret in a task's checkbox, a heading's #s or a quote's >";
    // an item has one layout: numbered, or a task, or a heading, or a quote
    if (doc.blocks.some((b) => /^\d{1,9}\. (?:\[[ xX]\]|#{1,6} |> )/.test(b.text))) return 'numbered task, heading or quote';
    // a run of numbered siblings counts on from its first item's number (its `numbered_start`)
    const run: number[] = [];
    for (const b of doc.blocks) {
      run.length = b.depth + 1;
      const n = /^(\d{1,9})\. /.exec(b.text);
      if (n && run[b.depth] && Number(n[1]) !== run[b.depth]! + 1) return 'numbered list that skips a number';
      run[b.depth] = n ? Number(n[1]) : 0;
    }
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => (window as any).WF?.rootItem && document.querySelector('.name > .content'), null, { timeout: 120000 });
    const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
    if (settled.timedOut) throw new Error(`WorkFlowy didn't settle after loading: ${settled.pending}`);
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
    if (!ready) throw new Error("WorkFlowy's keys didn't come up: Tab doesn't indent");
    // the features WorkFlowy's server enables for this user (`/get_enabled_features/`: numbered lists,
    // dates, the slash command, ...): the demo's settings carry only their own features, which replace
    // the server's, and without them a numbered item is drawn as a bullet, though the item keeps its
    // layout. And "Recognize markdown pasting" (Settings › Features): pasted Markdown becomes items,
    // headings and to-dos, as ourus's structured paste reads it.
    await page.evaluate(async () => {
      const WF = (window as any).WF;
      const { features } = await (await fetch('/get_enabled_features/')).json();
      for (const [name, on] of Object.entries(features as Record<string, boolean>)) if (on && !WF.Features.on(name)) WF.Features.enable(name);
      if (!WF.Features.on('markdown_pasting')) WF.Features.enable('markdown_pasting');
      if (!WF.Features.on('numbered_list')) throw new Error("WorkFlowy's numbered lists didn't come on");
    });
    return page.evaluate(() => (window as any).WF.AppBuild.number as string);
  },

  async load(page: Page, doc: Outline) {
    const items = doc.blocks.map((b) => toItem(b.depth, b.text));
    let sel: { block: number; anchor: number; head: number; inNote: boolean } | null = null;
    /** An empty note being edited has no element to put the caret in: Shift+Enter at the name's end opens it, as a user would. */
    let openNote = false;
    if (doc.sel) {
      const it = items[doc.sel.block]!;
      // an offset in the block's text: in the item's type prefix, the name's start; past the first line, the note
      const nameEnd = it.prefix + it.name.length;
      const inNote = Math.max(doc.sel.anchor, doc.sel.head) > nameEnd && it.note !== null;
      const local = (p: number) => (inNote ? p - nameEnd - 1 : Math.max(0, p - it.prefix - (it.cut !== undefined && p > it.cut ? 1 : 0)));
      sel = { block: doc.sel.block, anchor: local(doc.sel.anchor), head: local(doc.sel.head), inNote };
      if (inNote && it.note === '') {
        openNote = true;
        sel = { block: doc.sel.block, anchor: it.name.length, head: it.name.length, inNote: false };
      }
    }
    await page.evaluate(
      async ({ items, sel, selected, container }) => {
        const WF = (window as any).WF;
        const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        (document.activeElement as HTMLElement | null)?.blur();
        WF.setSelection([]);
        if (!WF.completedVisible()) WF.toggleCompletedVisible();
        // the test's item, by its id: a caret left in its title (the zoomed-in item's name, which Up
        // from the first block and Backspace at an empty first block go into) types into it, and
        // found by name, a renamed one would be lost and another made, test after test
        const W = window as any;
        let box = W.__ourusBox ? WF.getItemById(W.__ourusBox) : null;
        box ??= WF.rootItem()
          .getChildren()
          .find((c: any) => c.getNameInPlainText() === container);
        await WF.editGroup(() => {
          if (!box) box = WF.createItem(WF.rootItem(), 0);
          if (box.getNameInPlainText() !== container) WF.setItemName(box, container);
        });
        W.__ourusBox = box.getId();
        if (!WF.currentItem().equals(box)) WF.zoomTo(box);
        const rendered = (it: any) => !!it.getElement();
        for (let i = 0; i < 300 && !box.getChildren().every(rendered); i++) await new Promise((r) => setTimeout(r, 10));
        // the last test's items go, then this test's are made
        for (const child of box.getChildren()) WF.deleteItem(child);
        const made: any[] = [];
        await WF.editGroup(() => {
          const parents: any[] = [box];
          const count: number[] = [0];
          for (const it of items) {
            const parent = parents[it.depth];
            const item = WF.createItem(parent, count[it.depth]!);
            count[it.depth] = (count[it.depth] ?? 0) + 1;
            parents[it.depth + 1] = item;
            parents.length = it.depth + 2;
            count[it.depth + 1] = 0;
            count.length = it.depth + 2;
            WF.setItemName(item, escape(it.name));
            if (it.note) WF.setItemNote(item, escape(it.note));
            const ref = item.data.projectReferenceOrThrow;
            // an Immer recipe: it changes the draft and returns nothing
            if (it.layout !== 'bullets') ref.setMetadata((m: any) => void (m.layoutMode = it.layout));
            // a run's first number, where it isn't 1 (a later item's number counts on from the one before)
            const before = parent.getChildren()[count[it.depth]! - 2];
            const runStarts = it.layout === 'numbered' && !(before && before.data.projectReferenceOrThrow.getItem()?.layoutMode === 'numbered');
            if (runStarts && it.number !== undefined && it.number !== 1) ref.setMetadata((m: any) => void (m.numbered_start = it.number));
            if (it.completed) ref.getItem().applyLocalComplete();
            made.push(item);
          }
        });
        // a new item's children show once it is expanded
        for (const item of made) if (item.getChildren().length && !item.isExpanded()) WF.expandItem(item);
        // a note set through `setItemNote` is stored but not drawn (its line kept, empty, and its editor
        // too) until the item is drawn again: zooming out and back in does it
        if (items.some((it) => it.note)) {
          WF.zoomTo(WF.rootItem());
          await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
          WF.zoomTo(box);
          await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        }
        for (let i = 0; i < 300 && !made.every(rendered); i++) await new Promise((r) => setTimeout(r, 10));
        const drawn = (it: any, i: number) => !items[i]!.note || it.getElement().querySelector(':scope > .notes > .content')?.textContent === it.getNoteInPlainText();
        for (let i = 0; i < 300 && !made.every(drawn); i++) await new Promise((r) => setTimeout(r, 10));
        if (!made.every(drawn)) throw new Error("the test's notes weren't drawn");
        if (!made.every(rendered)) throw new Error("the test's items didn't render");
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        // a selection of items, as Shift+Up or Down past an item's edge makes one (`selectsBlocks`)
        if (selected) {
          (document.activeElement as HTMLElement | null)?.blur();
          WF.setSelection(selected.map((i: number) => made[i]));
          await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
          return;
        }
        if (!sel) return;
        // the caret, placed in the item's name or note by plain-text offsets
        const el = made[sel.block].getElement() as HTMLElement;
        const query = sel.inNote ? ':scope > .notes > .content' : ':scope > .name > .content';
        (el.querySelector(query) as HTMLElement).focus();
        // focusing an item renders it for editing: the caret goes into what that left
        await (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
        const content = el.querySelector(query) as HTMLElement;
        if (document.activeElement !== content) content.focus();
        const at = (offset: number): [Node, number] => {
          const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
          let left = offset;
          let last: Node | null = null;
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const len = n.textContent!.length;
            if (left <= len) return [n, left];
            left -= len;
            last = n;
          }
          return last ? [last, last.textContent!.length] : [content, 0];
        };
        const range = document.createRange();
        const [an, ao] = at(Math.min(sel.anchor, sel.head));
        const [hn, ho] = at(Math.max(sel.anchor, sel.head));
        range.setStart(an, ao);
        range.setEnd(hn, ho);
        const s = getSelection()!;
        s.removeAllRanges();
        if (sel.head < sel.anchor) {
          s.collapse(hn, ho);
          s.extend(an, ao);
        } else s.addRange(range);
      },
      { items, sel, selected: !doc.sel && doc.selected?.length ? doc.selected : null, container: CONTAINER },
    );
    if (openNote) {
      await page.keyboard.press('Shift+Enter');
      await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 40, timeout: 3000 }));
    }
  },

  async read(page: Page) {
    const raw = await page.evaluate((container) => {
      const WF = (window as any).WF;
      const box = (window as any).__ourusBox ? WF.getItemById((window as any).__ourusBox) : null;
      const active = document.activeElement as HTMLElement | null;
      const content = active?.classList.contains('content') ? active : null;
      const inNote = !!content?.closest('.notes');
      const focusedId = content ? WF.focusedItem()?.getId() : null;
      const flat: { depth: number; name: string; runs: Run[]; note: string | null; layout: string; completed: boolean; id: string; shown: number | null; start: number | null }[] = [];
      // a name's rich text (WorkFlowy's HTML: `<b>`, `<i>`, `<s>`, `<code>`, `<a href>`) as runs, each
      // with its formatting; any other element is its text
      const runsOf = (root: Node): Run[] => {
        const out: Run[] = [];
        const visit = (n: Node, f: Omit<Run, 'text'>): void => {
          if (n.nodeType === Node.TEXT_NODE) {
            out.push({ text: n.textContent ?? '', ...f });
            return;
          }
          const tag = n.nodeType === Node.ELEMENT_NODE ? (n as Element).tagName : '';
          const href = tag === 'A' ? (n as Element).getAttribute('href') : null;
          const g = { ...f, ...((tag === 'B' || tag === 'STRONG') && { bold: true }), ...((tag === 'I' || tag === 'EM') && { italic: true }), ...((tag === 'S' || tag === 'STRIKE' || tag === 'DEL') && { strike: true }), ...(tag === 'CODE' && { code: true }), ...(href !== null && { href }) };
          for (const c of n.childNodes) visit(c, g);
        };
        visit(root, {});
        return out;
      };
      const html = (s: string): Node => {
        const t = document.createElement('template');
        t.innerHTML = s;
        return t.content;
      };
      const walk = (it: any, depth: number) => {
        for (const c of it.getChildren()) {
          const internal = c.data.projectReferenceOrThrow.getItem();
          const layout = internal?.layoutMode ?? 'bullets';
          let name = c.getNameInPlainText();
          let runs = runsOf(html(c.getName()));
          let note: string | null = c.getNoteInPlainText() || null;
          // the name or note being edited: its editor's text, ahead of what WorkFlowy stored (it saves
          // half a second after typing stops); a note being edited is there even when empty
          if (c.getId() === focusedId) {
            const text: string = (content as any).editor?.plainText ?? content!.textContent ?? '';
            if (inNote) note = text;
            else {
              name = text;
              runs = runsOf(content!);
            }
          }
          // a numbered item's number as WorkFlowy draws it: a prefix of the name, outside its text
          const drawn = layout === 'numbered' ? [...(c.getElement()?.querySelectorAll(':scope > .name span') ?? [])].find((sp: any) => !sp.closest('.content') && /^\d+\.$/.test(sp.textContent.trim())) : undefined;
          const start = internal?.metadata?.numbered_start ?? null;
          flat.push({ depth, name, runs, note, layout, completed: c.isCompleted(), id: c.getId(), shown: drawn ? parseInt(drawn.textContent, 10) : null, start });
          walk(c, depth + 1);
        }
      };
      if (box) walk(box, 0);
      let sel: { block: number; anchor: number; head: number; inNote: boolean } | null = null;
      if (content && focusedId) {
        // the selection in the editor's own text offsets
        const { start, end, reversed } = WF.DomEditableText.selectedIn(content);
        sel = { block: flat.findIndex((f) => f.id === focusedId), anchor: reversed ? end : start, head: reversed ? start : end, inNote };
      }
      const selected = WF.getSelection().map((it: any) => flat.findIndex((f) => f.id === it.getId())).filter((i: number) => i >= 0);
      return { flat, sel, selected };
    }, CONTAINER);
    // a numbered item's number: as drawn, else as WorkFlowy counts it (the run's start, then one more
    // than the numbered sibling before)
    const run: number[] = [];
    const numbers = raw.flat.map((f) => {
      run.length = f.depth + 1;
      run[f.depth] = f.layout === 'numbered' ? (f.shown ?? (run[f.depth] ? run[f.depth]! + 1 : (f.start ?? 1))) : 0;
      return f.layout === 'numbered' ? run[f.depth]! : null;
    });
    // a name as Markdown, its formatting in markup (a code block's as it is), and where an offset in
    // the name is in it
    const mds = raw.flat.map((f) => (f.layout === 'code-block' ? { text: f.name, at: (p: number) => p } : runsAsMarkdown(f.runs)));
    const texts = raw.flat.map((f, i) => fromItem({ ...f, name: mds[i]!.text } as Item, numbers[i]!));
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel && raw.sel.block >= 0) {
      const { prefix, cut } = texts[raw.sel.block]!;
      const { fence } = texts[raw.sel.block]!;
      const md = mds[raw.sel.block]!;
      const base = raw.sel.inNote ? prefix + md.text.length + (cut !== undefined ? 1 : 0) + 1 + (fence ? fence.length + 1 : 0) : prefix;
      const at = (p: number): number => (raw.sel!.inNote ? base + p : base + md.at(p) + (cut !== undefined && md.at(p) > cut ? 1 : 0));
      sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
    }
    const got: Outline = { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
    if (process.env.OURUS_SXS_WF_EXPORT) await checkExport(page, got);
    return got;
  },

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // "focus first" (Ctrl+Home) lands in the title of the item the test is zoomed into, which is no
    // block of the test: from there Down goes to the first block, as a user would, then Home
    await page.keyboard.press('Control+Home');
    await settle();
    const inTitle = await page.evaluate(() => {
      const WF = (window as any).WF;
      return !!WF.focusedItem()?.equals(WF.currentItem());
    });
    if (inTitle) {
      await page.keyboard.press('ArrowDown');
      await settle();
    }
    await page.keyboard.press('Home');
    await settle();
  },

  drops: ['move'],
  drop: workflowyDrop,
};

/**
 * A drop as WorkFlowy's drag places it (its `Moving` module: the bullet's mousedown, a drag from 3
 * pixels on, mouse events, no HTML5 drag). The pressed item's bullet held and moved to where its ghost
 * puts the place: the ghost's top (the pointer less what it was below the item's top when pressed)
 * on the row of the item above the drop line, the item it goes after, or on the title for the first
 * place; the pointer's x the depth: a child of an item where x is past its left by 0.7 of an
 * indentation (36 pixels), else on up its ancestors, to the zoomed item (a container: inside it). It
 * drags the item whose bullet is pressed, or the selection's items where it is one of them (a drop of
 * the selection presses its first).
 */
async function workflowyDrop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  const at = await page.evaluate(({ press, rows, seam, depth }) => {
    const WF = (window as any).WF;
    const box = WF.getItemById((window as any).__ourusBox);
    // the blocks' items, in the order `read` gives them
    const flat: any[] = [];
    const walk = (it: any) => {
      for (const c of it.getChildren()) {
        flat.push(c);
        walk(c);
      }
    };
    walk(box);
    const el = (it: any): HTMLElement => it.getElement();
    const rect = (e: Element) => e.getBoundingClientRect();
    const item = el(flat[press ?? rows[0]!]!);
    const bullet = item.querySelector(':scope > .name > .bullet');
    if (!bullet) return null;
    const b = rect(bullet);
    const from = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    // the row the ghost's top goes on: the name of the item above the line, else the zoomed item's title
    const above = seam.above === null ? box : flat[seam.above]!;
    const name = rect(el(above).querySelector(':scope > .name')!);
    const offset = from.y - rect(item).top + 1;
    // (the pointer below the window's top 15%, where WorkFlowy scrolls on, frame after frame, while a
    // drag is held there: the ghost's top lower on the row, the title's for the first place)
    const y = Math.min(Math.max(name.top + name.height / 2 + offset, innerHeight * 0.15 + 2), name.bottom - 2 + offset);
    if (seam.above === null) return { from, to: { x: from.x, y } };
    // the column: 7 pixels past the left of the item at the depth on the chain up from the item above
    // (an indentation past its own for its child), inside the 0.7 indentation either way
    const chain: any[] = [];
    for (let it = above; !it.equals(box); it = it.getParent()) chain.unshift(it);
    const left = depth < chain.length ? rect(el(chain[depth])).left : rect(el(above)).left + 36 * (depth - chain.length + 1);
    return { from, to: { x: left + 7, y } };
  }, drop);
  if (!at) throw new Unsupported('the pressed item has no bullet');
  await gesture(page, at.from, at.to, settle);
}
