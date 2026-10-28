/// <reference lib="dom" />
// Tana Outliner (https://app.tana.inc/, see README.md), the outliner of nodes and supertags (Tana's
// meeting platform, home.tana.inc, is another product), in its own UI-test mode: `/tests` boots the
// app with no account and no server (an anonymous user, Firebase never asked), keeps everything in
// the page, and waits for a test to hand it a workspace (`window.bootTest`, its test boot loader's).
// The driver boots it once with a workspace of a root and a home node, as Tana's tests boot theirs,
// and makes each test's nodes through the app's model (`window.appState`, which the mode exposes): a
// node of its own under home, opened in the panel, everything expanded; made without undo records
// (`withoutUndoRecording`, as Tana makes its layouts), the undo history emptied, so that undo stops at
// the start.
//
// - A block is a node's name: rich text, as HTML (`<b>`, `<i>`, `<code>`, entities), read as Markdown;
//   one line (a name holds no line break). A to-do is the node's checkbox
//   (`showDoneStateWithCheckbox`), done or not; an H1 its section flag (Tana's one heading, `!`).
// - The caret is the DOM's, in the focused node's editable span; its node is the span's wrapper's id,
//   the node's path in the panel (`<doc>|<parent>|<node>`).
// - The keys are Tana's on Linux, from its shortcut table.

import type { Page } from 'playwright-core';
import { gesture } from '../lib/drag.ts';
import type { Driver, Drop } from '../lib/driver.ts';
import { Unsupported, type Outline } from '../lib/block.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** Tana's node flag for a section, its heading (`_flags`). */
const SECTION = 2;

/** The attribute of a list view that numbers its node's children ("Show numbered bullets"). */
const NUMBERED = 'SYS_A283';

/** A fenced code block: its fence, its info string (a language), its code. */
const FENCE = /^(`{3,}|~{3,})([^`\n]*)\n([\s\S]*)\n\1$/;

/** A code block's language field (`Code block language`); Tana's own default, `plaintext`, is none. */
const LANGUAGE = 'SYS_A70';

/** The fence a code block reads back with (a code block keeps none): Markdown's, the shortest run of backticks, three or more, longer than any in the code. */
const fenceFor = (code: string): string => '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1)));

/** A node as the page makes and reads it. */
interface Item {
  depth: number;
  /** The name's text: plain where the driver makes it (HTML-escaped in the page), Markdown where it reads it. */
  content: string;
  todo: boolean;
  done: boolean;
  section: boolean;
  /** Its parent numbers its children: its number is its place among them. */
  numbered: boolean;
  /** A code block (`docType` `codeblock`): its name the code, without fences. */
  code: boolean;
  /** A code block's language, its field: its fence's info string. */
  language?: string;
  /** Its description, the lines under its name (Alt+I's): a block's text after its first line. */
  description?: string;
}

/**
 * A block's canonical text as a node, and how many characters of it the node's number, checkbox and
 * section took; a number that is text is escaped in the canonical text, not in the name (`cut`).
 */
function toItem(depth: number, block: string): Item & { prefix: number; cut?: number } {
  const code = FENCE.exec(block);
  if (code) return { depth, content: code[3]!, todo: false, done: false, section: false, numbered: false, code: true, ...(code[2]!.trim() && { language: code[2]!.trim() }), prefix: code[1]!.length + code[2]!.length + 1 };
  // the first line the name, the rest its description
  const br = block.indexOf('\n');
  const text = br < 0 ? block : block.slice(0, br);
  const description = br < 0 ? undefined : block.slice(br + 1);
  const numbered = /^\d{1,9}\. /.exec(text);
  const after = numbered ? text.slice(numbered[0].length) : text;
  const task = /^\[([ xX])\](?: |$)/.exec(after);
  const rest = task ? after.slice(task[0].length) : after;
  const heading = /^# /.exec(rest);
  const prefix = (numbered?.[0].length ?? 0) + (task?.[0].length ?? 0) + (heading?.[0].length ?? 0);
  let content = text.slice(prefix);
  // a number that is text (after a numbered node's own number too)
  const literal = prefix === (numbered?.[0].length ?? 0) ? /^(\d{1,9})\\(?=[.)])/.exec(content) : null;
  if (literal) content = literal[1] + content.slice(literal[0].length);
  return { depth, content, todo: !!task, done: !!task && task[1] !== ' ', section: !!heading, numbered: !!numbered, code: false, prefix, ...(literal && { cut: prefix + literal[1]!.length }), ...(description !== undefined && { description }) };
}

/** A node's canonical text, and the length of the prefix its number (`number`, where numbered), checkbox and section stand for. */
function fromItem(it: Item, number: number | null): { text: string; prefix: number; cut?: number } {
  if (it.code) {
    const fence = fenceFor(it.content);
    const info = it.language && it.language !== 'plaintext' ? it.language : '';
    return { text: `${fence}${info}\n${it.content}\n${fence}`, prefix: fence.length + info.length + 1 };
  }
  const prefix = (number !== null ? `${number}. ` : '') + (it.todo ? (it.done ? '[x] ' : '[ ] ') : '') + (it.section ? '# ' : '');
  const literal = !prefix || prefix === `${number}. ` ? /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(it.content) : null;
  const content = literal ? it.content.slice(0, literal[0].length) + '\\' + it.content.slice(literal[0].length) : it.content;
  return { text: prefix + content + (it.description !== undefined ? `\n${it.description}` : ''), prefix: prefix.length, ...(literal && { cut: literal[0].length }) };
}

const HOME = 'SXS_HOME';

export const driver: Driver = {
  shortId: 'TA',
  longId: 'tana',
  displayName: 'Tana',
  // its UI-test page: the app with no account, waiting for a test's workspace (opened by hand, it waits
  // for `bootTest`, as `open` calls it)
  url: 'https://app.tana.inc/tests',
  model: 'block',
  keys: {
    enter: 'Enter',
    // no `shiftEnter`: Shift+Enter inserts an empty node after this one, another action than a line
    // break, which a name doesn't hold (its cases skip)
    indent: 'Tab',
    outdent: 'Shift+Tab',
    deleteContentBackward: 'Backspace',
    deleteContentForward: 'Delete',
    moveSubtreeUp: 'Shift+Alt+ArrowUp',
    moveSubtreeDown: 'Shift+Alt+ArrowDown',
    deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
    // "delete item", "duplicate"
    deleteSubtree: 'Control+Shift+Backspace',
    duplicateSubtree: 'Shift+Alt+D',
    copy: 'Control+c',
    cut: 'Control+x',
    paste: 'Control+v',
    // "cleanpaste"
    pastePlain: 'Control+Shift+v',
    undo: 'Control+z',
    redo: 'Control+Shift+z',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
  },
  emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
  // a press on a bullet takes the focus from the name being edited, and a drop selects nothing
  noCaretAfter: ['move'],
  // its `load` selects nodes whole, as `read` reports them
  selectsBlocks: true,
  ordered: true,
  // a name is one line of rich text, with nothing of Markdown's blocks but code (a code block, its
  // name the code). A checkbox and a section are a node's attributes, and a code block's fences no
  // text: a caret in them has no place (`holds`), and a join or split at them is Tana's to show. No
  // quote: `> q` would be a name's text
  refuses: ['html', 'table', 'math', 'thematic break', 'link reference definition', 'comment', 'footnote', 'quote'],
  // Shift+Tab leaves the later siblings with the parent; Enter mid-text in a node with children makes
  // its first child; Backspace at a section's start and Delete before one join its name, the section
  // gone; a list pasted into a node with children goes after them (played with `--ignore-options`);
  // a typed fence is left open (Backtick2, Backtick12, Backtick15)
  behaves: {
    outdent: 'logical',
    enterSplitSpace: 'start',
    enterMidItem: 'child',
    joinWithChildren: 'refuse',
    headingEditing: 'block',
    closeBackticks: 'none',
    copySelection: 'nodes',
    // pasted blocks leave a selection's text as it is (Paste17, probed 2026-10-25)
    pasteOverSelection: 'ignore',
    pastePlainLines: 'items',
    pasteOnParent: 'after',
  },
  holds(doc) {
    const o = doc as Outline;
    // a no-break space: held as a space
    if (o.blocks.some((b) => b.text.includes('\u00a0'))) return 'no-break space, which Tana holds as a space';
    // a character outside the Basic Multilingual Plane (an emoji): its two UTF-16 units put the caret past
    // where Tana counts it
    if (o.blocks.some((b) => /[\u{10000}-\u{10ffff}]/u.test(b.text))) return 'character outside the Basic Multilingual Plane, where the caret lands elsewhere';
    const fenced = o.blocks.map((b) => /^(`{3,}|~{3,})/.test(b.text) && b.text.includes('\n'));
    if (o.blocks.some((b, i) => fenced[i] && !FENCE.test(b.text))) return "code block's fences that don't match";
    const fences = o.blocks.map((b) => FENCE.exec(b.text));
    if (fences.some((f) => f && (f[1] !== fenceFor(f[3]!) || f[2] !== f[2]!.trim()))) return "code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language";
    // a block's later lines are its node's description, which an empty last line isn't
    if (o.blocks.some((b, i) => b.text.endsWith('\n') && !fenced[i])) return "block's text ending in a line break: an empty description is none";
    if (o.blocks.some((b) => /^#{2,6} /.test(b.text.replace(/^\[[ xX]\] /, '')))) return "heading other than H1: Tana's (a section) has one level";
    if (o.sel) {
      const b = o.blocks[o.sel.block]!.text;
      const it = toItem(0, b);
      // before a to-do's `[ ] ` is its checkbox focused, as Up and Down leave it (`load` focuses it)
      const onCheckbox = it.todo && !it.numbered && o.sel.anchor === 0 && o.sel.head === 0;
      if ((Math.min(o.sel.anchor, o.sel.head) < it.prefix && !onCheckbox) || (it.code && Math.max(o.sel.anchor, o.sel.head) > b.length - it.prefix)) return "caret in a number, a task's checkbox, a heading's # or a code block's fences";
      const br = it.code ? -1 : b.indexOf('\n');
      if (br >= 0 && Math.min(o.sel.anchor, o.sel.head) <= br && Math.max(o.sel.anchor, o.sel.head) > br) return "selection across a node's name and its description, each an editor of its own";
    }
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
    return undefined;
  },

  async open(page: Page) {
    await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof (window as any).bootTest === 'function' && (window as any).appState?.nodeSpace, null, { timeout: 120000 });
    const version = await page.evaluate(async (home) => {
      const w = window as any;
      const now = Date.now();
      // a workspace as Tana's export writes one: the file's root node, and its home node
      const docs = [
        { id: 'SXS', props: { created: now, name: 'Root node for file:SXS' }, children: [home] },
        { id: home, props: { created: now, name: 'Home', _docType: 'home', _ownerId: 'SXS' }, children: [] },
      ];
      await w.bootTest({ caseFiles: [{ fileId: 'SXS', storeData: { formatVersion: 1, docs, editors: [], workspaces: {}, lastTxid: 0, lastFbKey: '', optimisticTransIds: [], currentWorkspaceId: 'SXS' } }] }, { openSidebar: false });
      // the user `bootTest` makes hasn't been through onboarding, which would take the app to /welcome
      w.appState.nodeSpace.appUser.setOnboardingCompleted(true);
      return document.querySelector('meta[name="ui-version"]')?.getAttribute('content') ?? undefined;
    }, HOME);
    await page.waitForFunction(() => (window as any).appState.layoutManager.currentPanelUIState?.firstPanel && document.querySelector('[data-editable-wrapper]'), null, { timeout: 30000 });
    if (!page.url().startsWith(this.url)) throw new Error(`Tana went to ${page.url()} after booting its test mode`);
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
    if (!ready) throw new Error("Tana's keys didn't come up: Tab doesn't indent");
    return version;
  },

  async load(page: Page, doc) {
    const o = doc as Outline;
    const items = o.blocks.map((b) => toItem(b.depth, b.text));
    // a caret in the name (its text's offset), or past the first line in the description
    const local = (p: number, it: (typeof items)[number], b: string): number => (it.description !== undefined && p > b.indexOf('\n') ? p - b.indexOf('\n') - 1 : p - it.prefix - (it.cut !== undefined && p > it.cut ? 1 : 0));
    // a selection of nodes: the caret at the first one's start, then Escape and Shift+Down (`selectsBlocks`)
    const selected = !o.sel && o.selected?.length ? o.selected : null;
    const sel = selected ? { block: selected[0]!, anchor: 0, head: 0, inDescription: false, onCheckbox: false } : o.sel && (() => {
      const b = o.blocks[o.sel!.block]!.text;
      const it = items[o.sel!.block]!;
      const inDescription = it.description !== undefined && Math.min(o.sel!.anchor, o.sel!.head) > b.indexOf('\n');
      const onCheckbox = it.todo && !it.numbered && o.sel!.anchor === 0 && o.sel!.head === 0;
      return { block: o.sel!.block, anchor: local(o.sel!.anchor, it, b), head: local(o.sel!.head, it, b), inDescription, onCheckbox };
    })();
    await page.evaluate(
      async ({ items, sel, home, SECTION, NUMBERED, LANGUAGE }) => {
        const w = window as any;
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const ns = w.appState.nodeSpace;
        (document.activeElement as HTMLElement | null)?.blur();
        const homeNode = ns.getNodeOrPlaceholder(home);
        const paths: string[] = [];
        /** Each node with children, as the panel names a path: its nodes from the test's own. */
        const parents: any[][] = [];
        ns.withoutUndoRecording(() => {
          const old = w.__ourusTana && ns.getNodeOrPlaceholder(w.__ourusTana);
          if (old) homeNode.removeChild(old);
          const docNode = homeNode.insertNewNodeAtEnd();
          docNode.name = 'ourus sxs';
          const chain = [docNode];
          for (const it of items) {
            const n = chain[it.depth].insertNewNodeAtEnd();
            n.name = escape(it.content);
            if (it.code) n.docType = 'codeblock';
            if (it.description !== undefined) n.description = escape(it.description);
            if (it.language) n.insertTuple(ns.getNodeIfInMemory(LANGUAGE), it.language);
            if (it.todo) n.showDoneStateWithCheckbox = true;
            if (it.done) n.done = true;
            if (it.section) n.addFlag(SECTION);
            // as Tana's "Toggle numbered list" does: the parent's list view, and its numbering
            const parent = chain[it.depth];
            if (it.numbered && !parent.hasView) {
              parent.createMetaNodeIfMissing();
              parent.metaNode.addNewListView('Default');
              const view = parent.metaNode.userOrDefaultView;
              view.addChild(view.parentFile.nodeFactory.createTupleWithAttr('', '', ns.getNodeIfInMemory(NUMBERED), [view.parentFile.createNodeWithName()], {}));
            }
            if (it.depth > 0 && chain[it.depth].children.length === 1) parents.push(chain.slice(0, it.depth + 1));
            chain[it.depth + 1] = n;
            chain.length = it.depth + 2;
            paths.push(chain.map((c) => c.id).join('|'));
          }
          w.__ourusTana = docNode.id;
        });
        const panel = () => w.appState.layoutManager.currentPanelUIState.firstPanel;
        panel().setRootNode(w.__ourusTana);
        for (let i = 0; i < 300 && panel().rootNode?.id !== w.__ourusTana; i++) await sleep(10);
        panel().clearAllSelected();
        // a node with children shows them only once expanded (`expandAll` passes over one whose children
        // are all empty, as a node a user has just made them in isn't)
        for (const path of parents) panel().expand(path);
        const rendered = () => paths.every((p) => document.getElementById(p));
        for (let i = 0; i < 300 && !rendered(); i++) await sleep(10);
        if (!rendered()) throw new Error("the test's nodes didn't render");
        // what the earlier test did, undone by nothing in this one
        ns.undoService.undoStack.length = 0;
        ns.undoService.redoStack.length = 0;
        if (!sel) return;
        // before a to-do's `[ ] `: its checkbox, a button (`<path>|donecheck`), focused
        if (sel.onCheckbox) {
          const box = document.getElementById(`${paths[sel.block]}|donecheck`);
          const button = (box?.tagName === 'BUTTON' ? box : box?.querySelector('button')) as HTMLElement | null;
          for (let i = 0; i < 200 && button && document.activeElement !== button; i++) {
            button.focus();
            await sleep(10);
          }
          if (document.activeElement !== button) throw new Error(`the to-do's checkbox didn't take the focus (focus: ${document.activeElement?.parentElement?.id})`);
          return;
        }
        // the name's editor, or the description's (`<path>|description`)
        const wrapper = document.getElementById(sel.inDescription ? `${paths[sel.block]}|description` : paths[sel.block]!);
        if (!wrapper) throw new Error(`no editor for ${sel.inDescription ? 'the description of ' : ''}node ${sel.block}`);
        const span = wrapper.querySelector('.editable') as HTMLElement;
        // a point at a plain-text offset in the span
        const point = (off: number): [Node, number] => {
          const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
          let last: Text | null = null;
          for (let t = walker.nextNode() as Text | null; t; t = walker.nextNode() as Text | null) {
            if (off <= t.data.length) return [t, off];
            off -= t.data.length;
            last = t;
          }
          return last ? [last, last.data.length] : [span, 0];
        };
        if (sel.inDescription) span.focus();
        else ns.focusService.focusOnPathIdAtContentOffset(paths[sel.block], sel.head);
        const placed = () => {
          const s = getSelection()!;
          if (!s.rangeCount || !span.contains(s.anchorNode) || document.activeElement !== span) return false;
          const offset = (n: Node, o: number) => {
            const r = document.createRange();
            r.setStart(span, 0);
            r.setEnd(n, o);
            return r.toString().length;
          };
          return offset(s.anchorNode!, s.anchorOffset) === sel.anchor && offset(s.focusNode!, s.focusOffset) === sel.head;
        };
        const place = async () => {
          for (let i = 0; i < 200 && !placed(); i++) {
            if (document.activeElement === span) getSelection()!.setBaseAndExtent(...point(sel.anchor), ...point(sel.head));
            await sleep(10);
          }
        };
        await place();
        // a code block's editor makes its text anew once more as it takes the focus, the caret going to
        // its start: placed again once the page has settled
        if (items[sel.block]!.code) {
          await w.__ourusIdle.wait({ shortTimer: 300, quiet: 40, timeout: 2000 });
          await place();
        }
        if (!placed()) throw new Error(`the caret didn't land (focus: ${document.activeElement?.parentElement?.id})`);
      },
      { items, sel, home: HOME, SECTION, NUMBERED, LANGUAGE },
    );
    if (!selected) return;
    const last = selected[selected.length - 1]!;
    const reached = async (): Promise<number> => {
      await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 40, timeout: 3000 }));
      return Math.max(-1, ...(((await this.read(page)) as Outline).selected ?? []));
    };
    for (let k = 0; k < 3 && (await reached()) < 0; k++) await page.keyboard.press('Escape');
    for (let k = 0; k <= o.blocks.length && (await reached()) < last; k++) await page.keyboard.press('Shift+ArrowDown');
  },

  async read(page: Page) {
    const raw = await page.evaluate(
      ({ SECTION, NUMBERED, LANGUAGE }) => {
        const w = window as any;
        const ns = w.appState.nodeSpace;
        const docId: string = w.__ourusTana;
        /**
         * A name's rich text as Markdown (bold, italic, code, strikethrough; other markup its text), and
         * where each of its plain text's offsets is in it.
         */
        const markdown = (root: Node): { text: string; at: number[] } => {
          let text = '';
          const at: number[] = [];
          const marks: Record<string, string> = { B: '**', STRONG: '**', I: '*', EM: '*', CODE: '`', S: '~~', STRIKE: '~~', DEL: '~~' };
          const walk = (n: Node) => {
            if (n.nodeType === Node.TEXT_NODE) {
              // a no-break space is how an editable span keeps a space visible at its end
              for (const ch of (n as Text).data) {
                at.push(text.length);
                text += ch === '\u00a0' ? ' ' : ch;
              }
              return;
            }
            const mark = n.nodeType === Node.ELEMENT_NODE ? marks[(n as Element).tagName] : undefined;
            if (mark) text += mark;
            n.childNodes.forEach(walk);
            if (mark) text += mark;
          };
          root.childNodes.forEach(walk);
          at.push(text.length);
          return { text, at };
        };
        const parsed = (html: string): Node => {
          const t = document.createElement('template');
          t.innerHTML = html;
          return t.content;
        };
        const active = document.activeElement as HTMLElement | null;
        const span = active?.classList.contains('editable') ? active : null;
        // a to-do's checkbox, which Up and Down go to on their way into its node (`<path>|donecheck`)
        const checkbox = active?.tagName === 'BUTTON' && active.parentElement?.id.endsWith('|donecheck') ? active.parentElement.id.slice(0, -'|donecheck'.length) : null;
        // a description's editor is `<path>|description`, beside its name's
        const editorId = checkbox ?? span?.closest('[data-editable-wrapper]')?.id ?? '';
        const inDescription = !checkbox && editorId.endsWith('|description');
        const path = inDescription ? editorId.slice(0, -'|description'.length) : editorId;
        // the node being edited: one of the test's (the panel's title is the test's own node; Tana's
        // placeholder row, the empty row under an expanded node without children or at a panel's end, is
        // none of them)
        const focused = path.startsWith(`${docId}|`) ? path.slice(path.lastIndexOf('|') + 1) : null;
        const flat: { depth: number; content: string; todo: boolean; done: boolean; section: boolean; numbered: boolean; number: number | null; code: boolean; language?: string; description?: string; id: string; at: number[]; descAt?: number[] }[] = [];
        const walk = (node: any, depth: number) => {
          const numbered = !!(node.hasView && node.metaNode.userOrDefaultView?.tupleNodeMap.get(NUMBERED));
          // a node's fields (tuples, a code block's language among them) are no children of the outline:
          // Tana shows them as the node's properties
          const kids = node.children.filter((c: any) => !c.isTuple);
          for (const [k, c] of kids.entries()) {
            // the node being edited from its editor, ahead of the model, which follows its input; a code
            // block's code as it is (its editor's markup is highlighting)
            const root = c.id === focused && span && !inDescription ? span : parsed(c.name ?? '');
            const { text, at } = c.isCodeBlock ? { text: root.textContent ?? '', at: [...Array((root.textContent ?? '').length + 1).keys()] } : markdown(root);
            const language: string | undefined = c.isCodeBlock ? c.tupleNodeMap.get(LANGUAGE)?.tupleValue?.name : undefined;
            // its description, the lines after its name: one being edited, empty or not, from its editor
            const editing = c.id === focused && inDescription;
            const desc = editing ? markdown(span!) : c.description ? markdown(parsed(c.description)) : null;
            flat.push({ depth, content: text, todo: !!c.hasOwnDoneStateAsCheckboxSetting, done: !!c.isDone, section: ((c.getOwnNodeFlags?.() ?? 0) & SECTION) !== 0, numbered, number: numbered ? k + 1 : null, code: !!c.isCodeBlock, ...(language && { language }), ...(desc && { description: desc.text, descAt: desc.at }), id: c.id, at });
            walk(c, depth + 1);
          }
        };
        const docNode = docId && ns.getNodeOrPlaceholder(docId);
        if (docNode) walk(docNode, 0);
        let sel: { block: number; anchor: number; head: number } | null = null;
        const block = flat.findIndex((f) => f.id === focused);
        const s = getSelection();
        // on a checkbox: before the to-do's `[ ] `
        if (block >= 0 && checkbox) sel = { block, anchor: -1, head: -1 };
        else if (block >= 0 && s?.rangeCount && span!.contains(s.anchorNode)) {
          const f = flat[block]!;
          const offset = (n: Node, o: number) => {
            const r = document.createRange();
            r.setStart(span!, 0);
            r.setEnd(n, o);
            const k = r.toString().length;
            // in the description: past the name and its line break (-2: the read adds the name's length)
            return inDescription ? -2 - ((f.descAt ?? [])[k] ?? (f.description ?? '').length) : (f.at[k] ?? f.content.length);
          };
          sel = { block, anchor: offset(s.anchorNode!, s.anchorOffset), head: offset(s.focusNode!, s.focusOffset) };
        }
        // nodes selected whole, the topmost of them (Tana's has their descendants too); the editor
        // keeps the focus, on the node the selection's head is on, no caret drawn
        const panel = w.appState.layoutManager.currentPanelUIState?.firstPanel;
        const selectedIds: string[] = (panel?.selectedNodes ?? []).map((n: any) => n?.id ?? n);
        const all = new Set(selectedIds.map((id) => flat.findIndex((f) => f.id === id)).filter((i) => i >= 0));
        const under = (i: number): boolean => {
          for (let j = i - 1, d = flat[i]!.depth; j >= 0 && d > 0; j--) if (flat[j]!.depth < d) {
            if (all.has(j)) return true;
            d = flat[j]!.depth;
          }
          return false;
        };
        const selected = [...all].filter((i) => !under(i)).sort((a, b) => a - b);
        return { flat, sel: selected.length ? null : sel, selected };
      },
      { SECTION, NUMBERED, LANGUAGE },
    );
    const texts = raw.flat.map((f) => fromItem(f, f.number));
    const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text }));
    let sel: Outline['sel'] = null;
    if (raw.sel) {
      const { prefix, cut } = texts[raw.sel.block]!;
      // -1: on the checkbox, before the to-do's `[ ] `; -2 - k: k into the description, after the name's line
      const name = raw.flat[raw.sel.block]!;
      const nameEnd = texts[raw.sel.block]!.text.length - (name.description !== undefined ? name.description.length + 1 : 0);
      const at = (p: number): number => (p <= -2 ? nameEnd + 1 + (-2 - p) : p < 0 ? 0 : prefix + p + (cut !== undefined && p > cut ? 1 : 0));
      sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
    }
    return { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
  },

  drops: ['move'],
  drop,

  async act(page: Page, action: string, settle: () => Promise<void>) {
    // Tana has no key for the document's ends: Up (Down) until the caret is in the first node (the
    // last), then Home (End) unless it is at the node's start (end) already, where Tana's Home (End)
    // leaves the node for its parent, or the panel's title. Up from the first node goes to the title too,
    // the test's own node, no block of the test. With Shift, a caret crossing a node's edge may select
    // nodes, as a user's Shift+Up does: extended until it stops growing
    const up = /DocStart$/.test(action);
    const shift = action.startsWith('select') ? 'Shift+' : '';
    const there = (o: Outline): boolean => !!o.sel && o.sel.block === (up ? 0 : o.blocks.length - 1);
    let last = '';
    for (let i = 0; i < 200; i++) {
      const o = (await this.read(page)) as Outline;
      const now = JSON.stringify([o.sel, o.selected]);
      if (now === last || there(o)) break;
      last = now;
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
    }
    let o = (await this.read(page)) as Outline;
    // a node's description is its later lines: from the first node's, Up to its name; into the last
    // node's, Down from its name (each lands at the start)
    const br = (t: string): number => (FENCE.test(t) ? -1 : t.indexOf('\n'));
    const text = (): string => o.blocks[o.sel!.block]!.text;
    if (o.sel && br(text()) >= 0 && (up ? o.sel.head > br(text()) : o.sel.head <= br(text()))) {
      await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
      await settle();
      o = (await this.read(page)) as Outline;
    }
    if (!o.sel || o.sel.head === (up ? toItem(0, text()).prefix : text().length)) return;
    await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
    await settle();
  },
};

/**
 * A drop in Tana (its list element's drop target, `rm` in its bundle; react-dnd's HTML5 backend, which
 * Playwright's mouse drives): the pressed node's bullet (`.bulletSide`, draggable) held, moved past
 * it, to where the place's node takes it, and released. A node's element, its row with its children
 * under it, is a drop target where no child's is: in its top half the place is before the node, in its
 * bottom half after it, in its parent; nothing is inside a node (its middle is a native file's). So
 * a node with no children has no place in it, and after one with children is beside them, in its
 * bullet's column. The place is taken before the node below the drop line where that is the next
 * sibling, else after the one it follows, else before the parent's first child; the point is in the
 * node's bullet column, checked to be its own (a child's chevron hangs left of the child). It drags
 * the pressed node, or the selection's nodes where it is one of them (a drop of the selection presses its first).
 */
async function drop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  // (the mouse off the nodes: one resting on a bullet, from the last case's drop, has a popover open
  // over the rows, the node's name and when it was edited)
  await page.mouse.move(1, 1);
  await settle();
  const at = await page.evaluate(({ press, rows, seam, to }) => {
    const w = window as any;
    const ns = w.appState.nodeSpace;
    // the blocks as `read` has them: each node's path in the panel, its parent's block
    const flat: { path: string; parent: number | 'root' }[] = [];
    const walk = (node: any, path: string, parent: number | 'root') => {
      for (const c of node.children.filter((c: any) => !c.isTuple)) {
        const k = flat.push({ path: `${path}|${c.id}`, parent }) - 1;
        walk(c, `${path}|${c.id}`, k);
      }
    };
    walk(ns.getNodeOrPlaceholder(w.__ourusTana), w.__ourusTana, 'root');
    // a node's element (the drop target), its row the first child
    const element = (i: number): HTMLElement | null => document.getElementById(flat[i]!.path)?.closest('[data-containing-block]') ?? null;
    const centre = (e: Element) => {
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const pressed = element(press ?? rows[0]!)?.firstElementChild?.querySelector('.bulletSide');
    if (!pressed) return 'the pressed node has no bullet on screen';
    // the parent's children, those in flight taken out
    const kids = flat.flatMap((f, i) => (f.parent === to.parent && !rows.includes(i) ? [i] : []));
    const next = kids[to.after === null ? 0 : kids.indexOf(to.after) + 1];
    const [target, before] = next !== undefined && (next === seam.below || to.after === null) ? [next, true] : to.after !== null ? [to.after, false] : [null, false];
    if (target === null) return 'a place inside a node with no children: Tana drops before or after a node';
    const el = element(target)!;
    const r = el.getBoundingClientRect();
    const row = el.firstElementChild!.getBoundingClientRect();
    const x = centre(el.firstElementChild!.querySelector('.bulletSide')!).x;
    // a quarter of the row in from the element's edge, else nearer its middle, at its own; in the
    // bullet's column, else further right (a selection's toolbar, under it once the mouse passed over
    // it, hides the row below's left)
    for (const at of [x, row.right - 40])
      for (let d = row.height / 4; d < r.height / 2; d += 2) {
        const y = before ? r.top + d : r.bottom - d;
        if (document.elementFromPoint(at, y)?.closest('[data-containing-block]') === el) return { from: centre(pressed), to: { x: at, y } };
      }
    return `no point of the ${before ? 'top' : 'bottom'} half of the node's element that is its own`;
  }, { press: drop.press, rows: drop.rows, seam: drop.seam, to: drop.to });
  if (typeof at === 'string') throw new Unsupported(at);
  await gesture(page, at.from, at.to, settle);
}
