/// <reference lib="dom" />
// RemNote (https://www.remnote.com/notes, see README.md), in its own guest mode: the full app with no
// account, its knowledge base local to the browser (IndexedDB), synced nowhere. It runs in the mode
// RemNote's own Playwright tests run it in: two flags in localStorage (`isPlaywright`,
// `isPlaywrightServerless`) that its code reads at boot, with no backend at all, Sentry off, and its
// test recorder's trackers on.
//
// Each test is a document of its own, made the way RemNote's test fixtures make their rems
// (`playwrightCreateEmptyParentDeletionFixture` and the like, in its bundle): inside a
// `writeGuarantee`, `Rem(kb).createNew()`, `update({ key })`, `setParent(parent, index)`, then their
// flush (every write guarantee, every consumer job, the database store). It is opened by the router, and
// the caret placed through the document's editor tree (its controller, `focusOnChild`) and the focus
// props every editor follows (`setFocusedElementProps`); the last test's document goes with
// `playwrightDeleteDocumentRem`, theirs too. Reading is the rem tree, but for the rem being edited,
// whose text is its editor's (`currentFocusedRemTextCache`): the model follows a moment later.
//
// - A block is a rem's text (its `key`, rich text), which holds line breaks (Shift+Enter, "Add Line
//   Break"). A heading is the rem's font size (`H1` to `H6`), a to-do its status, a numbered item a "list
//   item" (RemNote numbers a run of them), code a code rem: attributes, not text.
// - The keys are RemNote's defaults on Linux (its shortcut table, `mod` Control and `opt` Alt).
// - One RemNote tab per browser: two of them tell each other to refresh after every write
//   (`/database_error`) and reload for good.
// - Two setups (`remnoteDriver`): documents without bullets, this one (`bulletless`): a document that
//   hides its bullets (`setDocumentLevelNoBulletMode`), whose rems read as paragraphs but the bulleted
//   ones (`sb`, "show bullet"): free-form Markdown's paragraphs and lists, its blocks free or items
//   (`Driver.freeForm`); and with bullets, RemNote's default, every rem an item (../remnote-bl/).

import type { Page } from 'playwright-core';
import type { Config } from '../../src/config.ts';
import { perPage, type Driver, type Drop } from '../lib/driver.ts';
import { runsAsMarkdown, Unsupported, type Block, type Outline, type Run } from '../lib/block.ts';
import { gesture } from '../lib/drag.ts';

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A rem as the page makes and reads it. */
interface Item {
  depth: number;
  content: string;
  todo: boolean;
  done: boolean;
  /** 0: none, 1 to 6: H1 to H6. */
  heading: number;
  /** A "list item": numbered, its number RemNote's count. */
  numbered: boolean;
  /** A code rem: its content the code, without fences. */
  code: boolean;
  /** Outside every list: a rem with no bullet, in a document without bullets. */
  free: boolean;
}

/** A fenced code block: its fence, its info string (a language), its code. */
const FENCE = /^(`{3,}|~{3,})([^`\n]*)\n([\s\S]*)\n\1$/;

/** The fence a code rem reads back with (it keeps none): Markdown's, the shortest run of backticks, three or more, longer than any in the code. */
const fenceFor = (code: string): string => '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1)));

/**
 * A block's canonical text as a rem, and how many characters of it the rem's attributes took; a number
 * that is text is escaped in the canonical text, not in the content (`cut`).
 */
function toItem(depth: number, text: string, free = false): Item & { prefix: number; cut?: number } {
  const code = FENCE.exec(text);
  if (code) return { depth, content: code[3]!, todo: false, done: false, heading: 0, numbered: false, code: true, free, prefix: code[1]!.length + code[2]!.length + 1 };
  const numbered = /^\d{1,9}\. /.exec(text);
  const after = numbered ? text.slice(numbered[0].length) : text;
  const task = /^\[([ xX])\](?: |$)/.exec(after);
  const rest = task ? after.slice(task[0].length) : after;
  const heading = /^(#{1,6}) /.exec(rest);
  const prefix = (numbered?.[0].length ?? 0) + (task?.[0].length ?? 0) + (heading?.[0].length ?? 0);
  let content = text.slice(prefix);
  // a number that is text (after a numbered item's own number too)
  const literal = prefix === (numbered?.[0].length ?? 0) ? /^(\d{1,9})\\(?=[.)])/.exec(content) : null;
  if (literal) content = literal[1] + content.slice(literal[0].length);
  return { depth, content, todo: !!task, done: !!task && task[1] !== ' ', heading: heading?.[1]!.length ?? 0, numbered: !!numbered, code: false, free, prefix, ...(literal && { cut: prefix + literal[1]!.length }) };
}

/** A rem's canonical text, and the length of the prefix its attributes stand for: its number `number` where it is numbered. */
function fromItem(it: Item, number: number | null): { text: string; prefix: number; cut?: number } {
  if (it.code) {
    const fence = fenceFor(it.content);
    return { text: `${fence}\n${it.content}\n${fence}`, prefix: fence.length + 1 };
  }
  const prefix = (number !== null ? `${number}. ` : '') + (it.todo ? (it.done ? '[x] ' : '[ ] ') : '') + (it.heading ? '#'.repeat(it.heading) + ' ' : '');
  const literal = !prefix || prefix === `${number}. ` ? /^\d{1,9}(?=[.)](?:[ \t\n]|$))/.exec(it.content) : null;
  const content = literal ? it.content.slice(0, literal[0].length) + '\\' + it.content.slice(literal[0].length) : it.content;
  return { text: prefix + content, prefix: prefix.length, ...(literal && { cut: literal[0].length }) };
}

/** A setup of RemNote: its name, title and id, and whether its documents hide their bullets. */
export interface Setup {
  readonly shortId: string;
  readonly longId: string;
  readonly displayName: string;
  /** Documents without bullets: a rem a paragraph unless bulleted (free form). */
  readonly bulletless?: boolean;
}

/** A free block's heading level, if it is a heading (0: a paragraph or an atom). */
const freeLevel = (b: Block): number => (b.free ? (/^(?:\d{1,9}\. )?(?:\[[ xX]\] )?(#{1,6}) /.exec(b.text)?.[1]!.length ?? 0) : 0);

/**
 * An outline as a document without bullets holds it: what a free block owns in ourus's outline (a
 * heading its section, a paragraph the list right after it) beside it, as Markdown has them; a rem
 * shows no bullet only as the document's child (its `hideBulletsInDoc`), so every free block is one.
 * `own` is the way back.
 */
/** The last block of a block's subtree. */
function subtreeEnd(blocks: readonly Block[], i: number): number {
  let j = i;
  while (j + 1 < blocks.length && blocks[j + 1]!.depth > blocks[i]!.depth) j++;
  return j;
}

export function lift(o: Outline): Outline {
  // the free blocks the blocks so far are under, by depth
  const path: Block[] = [];
  const blocks = o.blocks.map((b) => {
    path.length = b.depth;
    const up = path.filter((p) => p.free).length;
    path.push(b);
    return up ? { ...b, depth: b.depth - up } : b;
  });
  return { ...o, blocks };
}

/**
 * An outline read from a document without bullets, nested as ourus's outline is (`lift`'s inverse): a
 * heading takes what follows it up to a heading of its level or above, a paragraph the items right
 * after it where `listParent` says it adopts them (a rem without a bullet holds no children, so
 * nothing is lifted first).
 */
export function own(o: Outline, listParent: Config['listParent'] = 'paragraph'): Outline {
  const headings: number[] = [];
  let paragraph = false;
  const blocks = o.blocks.map((b) => {
    if (b.free) {
      paragraph = false;
      const level = freeLevel(b);
      if (level) while (headings.length && headings.at(-1)! >= level) headings.pop();
      const depth = b.depth + headings.length;
      if (level) headings.push(level);
      // (an atom owns no list: a code block, a thematic break; but under `block`; and nothing under `container`)
      else paragraph = listParent === 'block' || (listParent === 'paragraph' && !FENCE.test(b.text) && !/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(b.text));
      return depth === b.depth ? b : { ...b, depth };
    }
    const depth = b.depth + headings.length + (paragraph ? 1 : 0);
    return depth === b.depth ? b : { ...b, depth };
  });
  return { ...o, blocks };
}

/**
 * Why a document without bullets can't hold an outline: a block outside every list (a paragraph, a
 * heading, an atom) shows no bullet only as the document's or a heading's child, and a paragraph or an
 * atom with no children (`canDisplayAsNoBullet` in RemNote's bundle); elsewhere RemNote shows a bullet.
 */
export function bulletless(outline: Outline): string | undefined {
  const o = lift(outline);
  for (const [i, b] of o.blocks.entries()) {
    if (b.free && b.depth > 0) return 'paragraph inside an item (a rem there shows a bullet)';
    if (b.free && (o.blocks[i + 1]?.depth ?? -1) > b.depth) return 'free block with children (a rem with children shows a bullet)';
  }
  return undefined;
}

/** A worker's: whether its test was loaded with a view (folds, a zoom), which is read back then alone. */
const viewed = perPage(() => ({ on: false }));

export function remnoteDriver(setup: Setup): Driver {
  return {
    shortId: setup.shortId,
    longId: setup.longId,
    displayName: setup.displayName,
    // its guest mode; a test's document is `/w/null/<id>` (`null`, the guest's knowledge base)
    url: 'https://www.remnote.com/notes',
    scope: 'https://www.remnote.com/',
    // a browser's RemNote window, whichever setup's: two RemNote tabs in one browser break each other
    pool: 'remnote',
    // the setups' browsers apart (no bullets the even ones, bullets the odd), three of the pool's six each
    browsers: setup.bulletless ? 'even' : 'odd',
    parallel: 3,
    model: 'block',
    // a rem's text holds a blank line, its paragraphs apart
    paragraphsInBlock: true,
    ...(setup.bulletless && { freeForm: true }),
    // after deleting a rem no rem is edited, often (its runs: DeleteSubtree3, 4)
    noCaretAfter: ['deleteSubtree'],
    // its `load` selects rems whole, as `read` reports them
    selectsBlocks: true,
    // a rem collapsed in the page's root (its portal's `setIsCollapsed`, read as `getIsCollapsed`),
    // and a zoom, the rem as the page (its route), the test's document standing for none
    folds: true,
    zooms: true,
    keys: {
      // "Collapse", "Expand", "Zoom Out of Bullet"; no `zoomIn`: "Zoom Into Bullet" (Ctrl+') goes to
      // `/database_error` here, where the route to the rem (`load`'s) shows it
      fold: 'Control+ArrowUp',
      unfold: 'Control+ArrowDown',
      zoomOut: 'Control+Semicolon',
      enter: 'Enter',
      shiftEnter: 'Shift+Enter',
      indent: 'Tab',
      outdent: 'Shift+Tab',
      deleteContentBackward: 'Backspace',
      deleteContentForward: 'Delete',
      // "Swap Up" and "Swap Down"
      moveSubtreeUp: 'Alt+ArrowUp',
      moveSubtreeDown: 'Alt+ArrowDown',
      deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
      copy: 'Control+c',
      cut: 'Control+x',
      paste: 'Control+v',
      pastePlain: 'Control+Shift+v',
      undo: 'Control+z',
      redo: 'Control+y',
      ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
    },
    emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd', 'deleteSubtree'],
    // headings and to-dos are a rem's attributes, with no boundary in its text; a code rem's fences are
    // no text either; a quote (`> q`) not mapped to RemNote's quote yet
    refuses: ['markup-heading', 'markup-task', 'markup-fence', 'quote'],
    ordered: true,
    // Shift+Tab leaves the later siblings with the parent (and a Tab right after puts the rem back where it
    // was, `outdentInOriginalLocation`); Enter mid-text in a rem with children makes its first child
    // (without bullets, Enter on an empty top-level item makes it a paragraph, its Enter handler's
    // `SHOW_BULLET` set false, but an empty nested one still a sibling: `enterOnEmptyItem: exit`, with
    // bullets the default, measured on Enter7b and Enter30); Enter at a text's start makes an empty rem
    // above, the caret staying in the text; Backspace at the first rem's start does nothing (the last
    // two measured, and their examples played with `run.ts --ignore-options`, 2026-10-18); paste opens
    // the seam, the first pasted text joining (the caret after it), and a pasted list keeps its form
    // (`open` measured 8 cases better with bullets, none worse)
    behaves: {
      // after a paste of rems, the caret at the end of the first, as Roam's (9 caret verdicts, none worse)
      quirkPasteCaret: 'roam',
      outdent: 'logical',
      enterSplitSpace: 'drop',
      enterMidItem: 'child',
      enterAtTextStart: 'stay',
      backspaceAtTopItem: 'refuse',
      copyAtCaret: 'host',
      copySelection: 'nodes',
      pasteSeams: 'open',
      pasteListForm: 'own',
      // without bullets a document is a flat run of rems, a paragraph one, each item one: a list after a
      // paragraph is no rem's, a move passes one rem (Lists1, Lists5, Lists9)
      ...(setup.bulletless ? { enterOnEmptyItem: 'exit' as const, listParent: 'container' as const, listMoves: 'item' as const } : {}),
    },
    idle: { busy: `window.getNumOngoingWriteGuarantees?.() > 0` },
    drops: ['moveSubtree'],
    holds(doc) {
      const o = doc as Outline;
      if (setup.bulletless) {
        const no = bulletless(o);
        if (no) return no;
      }
      // zoomed, the root is the page's title, which the editor tree doesn't focus as a rem of its own;
      // and a rem without a bullet doesn't keep a collapse
      if (o.view && o.view.zoom !== null && o.sel?.block === o.view.zoom) return 'the caret in the zoom root, the page\'s title';
      if (o.view?.folded.some((i) => o.blocks[i]!.free)) return 'a fold on a rem without a bullet';
      // (without bullets, what a free block owns is beside it: zoomed into, it shows none of it)
      if (setup.bulletless && o.view && o.view.zoom !== null && o.blocks[o.view.zoom]!.free) return 'a zoom into a rem without a bullet, what it owns its siblings';
      const fenced = o.blocks.map((b) => /^(`{3,}|~{3,})/.test(b.text) && b.text.includes('\n'));
      if (o.blocks.some((b, i) => fenced[i] && !FENCE.test(b.text))) return "code block's fences that don't match";
      const fences = o.blocks.map((b) => FENCE.exec(b.text));
      if (fences.some((f) => f?.[2])) return "code block's language";
      if (fences.some((f) => f && f[1] !== fenceFor(f[3]!))) return "code block's fences other than the shortest backticks that hold its code, which a code rem reads back with (it keeps no fences)";
      if (o.sel) {
        const b = o.blocks[o.sel.block]!.text;
        const it = toItem(0, b);
        const [from, to] = [Math.min(o.sel.anchor, o.sel.head), Math.max(o.sel.anchor, o.sel.head)];
        // a to-do's checkbox, a heading's level, a code rem's fences are attributes: no caret goes there
        // (a code rem's closing fence: the fence and the newline before it)
        if (from < it.prefix || (it.code && to > b.length - FENCE.exec(b)![1]!.length - 1)) return "caret in a task's checkbox, a heading's #s or a code block's fences";
      }
      // numbered siblings count 1, 2, ... in a run
      const count: number[] = [];
      for (const b of o.blocks) {
        count.length = b.depth + 1;
        const n = /^(\d{1,9})\. /.exec(b.text);
        count[b.depth] = n ? (count[b.depth] ?? 0) + 1 : 0;
        if (n && Number(n[1]) !== count[b.depth]) return 'numbered list that RemNote would number otherwise';
      }
      return undefined;
    },

    async open(page: Page) {
      // RemNote's test mode, read from localStorage as its code boots
      await page.addInitScript(() => {
        if (location.hostname !== 'www.remnote.com') return;
        localStorage.setItem('isPlaywright', 'true');
        localStorage.setItem('isPlaywrightServerless', 'true');
      });
      for (const other of page.context().pages()) if (other !== page && other.url().includes('remnote.com')) await other.close();
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForFunction(() => typeof (window as any).waitForPlaywrightToLoad === 'function' && typeof (window as any).writeGuarantee === 'function', null, { timeout: 120000 });
      const env = await page.evaluate(async () => {
        const w = window as any;
        // its trackers up; a window that never came up in test mode never resolves this (a run of every app
        // once waited on one for good): a minute, then the worker gives up
        const up = await Promise.race([w.waitForPlaywrightToLoad().then(() => true), new Promise((r) => setTimeout(() => r(false), 60000))]);
        if (!up) return null;
        return { playwright: w.Env.app.isPlaywright, serverless: w.Env.playwright.isPlaywrightServerless, kb: w.currentKnowledgeBaseId(), version: w.__builtinWebRelease?.version };
      });
      if (!env) throw new Error("RemNote's test mode didn't come up in a minute (waitForPlaywrightToLoad)");
      if (!env.playwright || !env.serverless) throw new Error("RemNote didn't start in its serverless test mode");
      if (env.kb !== 'null') throw new Error(`RemNote is signed in to a knowledge base (${env.kb}), not a guest: its profile, .sxs/remnote/chromium/, is the driver's alone`);
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
      if (!ready) throw new Error("RemNote's keys didn't come up: Tab doesn't indent");
      return env.version;
    },

    async load(page: Page, doc) {
      // (what the last test left open closed first: a key typed on a selection of rems, after a drop,
      // is a shortcut of the selection's, and a menu it opens takes the caret this load places)
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      const o = setup.bulletless ? lift(doc as Outline) : (doc as Outline);
      const items = o.blocks.map((b) => toItem(b.depth, b.text, !!b.free));
      const local = (p: number, it: (typeof items)[number]): number => p - it.prefix - (it.cut !== undefined && p > it.cut ? 1 : 0);
      // a selection of rems: the caret at the first one's start, then Shift+Down past the last one's
      // subtree, ourus's (without bullets, its rems are the last one's siblings) (`selectsBlocks`)
      const selected = !o.sel && o.selected?.length ? o.selected : null;
      const sel = o.sel ? { block: o.sel.block, anchor: local(o.sel.anchor, items[o.sel.block]!), head: local(o.sel.head, items[o.sel.block]!) } : selected && { block: selected[0]!, anchor: 0, head: 0 };
      await page.evaluate(
        async ({ items, sel, bulletless, view }) => {
          const w = window as any;
          const KB = w.CURRENT_KNOWLEDGE_BASE;
          const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
          // as RemNote's fixtures wait for their writes (`test_recorder_track_waits` in its bundle)
          const flush = async (name: string) => {
            await w.waitUntilFinishedAllWriteGuarantees(name);
            await w.waitUntilFinishedAllConsumerJobs();
            await w.flushToDatabaseStore(name);
          };
          (document.activeElement as HTMLElement | null)?.blur();
          let docRem: any;
          const made: string[] = [];
          const last = w.__ourusSxsDoc;
          await w.writeGuarantee('ourusSxsLoad', async () => {
            // the last test's document goes in the same batch (with what `playwrightDeleteDocumentRem` deletes one with)
            const old = last && w.Rem(KB).findOne(last);
            if (old) await old.remove('documentMenu.deleteDocument', false, true, true, true, true);
            docRem = await w.Rem(KB).createNew();
            await docRem.update({ key: ['ourus sxs'] });
            await docRem.setIsDocument(true);
            if (bulletless) await docRem.setDocumentLevelNoBulletMode(true);
            const parents = [docRem];
            for (const it of items) {
              const r = await w.Rem(KB).createNew();
              await r.update({ key: it.content ? [it.content] : [] });
              await r.setParent(parents[it.depth], 99999);
              if (it.heading) await r.setFontSize(`H${it.heading}`);
              if (it.todo) await r.setIsTodo(true);
              if (it.done) await r.setTodoStatus('Finished');
              if (it.numbered) await r.setIsListItem(true);
              if (it.code) await r.setIsCode(true);
              // an item in a document without bullets shows one ("show bullet"), but a numbered one, its number
              if (bulletless && !it.free && !it.numbered) await r.update({ sb: true });
              parents[it.depth + 1] = r;
              parents.length = it.depth + 2;
              made.push(r._id);
            }
          });
          await flush('ourusSxsLoad');
          w.__ourusSxsDoc = docRem._id;
          w.FlowRouter.go(`/w/null/${docRem._id}`);
          // the document's editor tree: its rems on screen, its controller registered (the focused tree's,
          // or the first mounted, in RemNote's module of hierarchy editors)
          let req: any;
          w.rspackChunk_remnote_client.push([[Symbol('ourus')], {}, (r: unknown) => (req = r)]);
          w.__ourusSxsTrees ??= (() => {
            const recorder = Object.keys(req.m).find((id) => String(req.m[id]).includes('playwrightShiftFocusedRemRelative'))!;
            const src = String(req.m[recorder]);
            const v = /(\w+)\.\w+\?\.controller/.exec(src)![1];
            return req(new RegExp(`\\b${v}=\\w\\((\\d+)\\)`).exec(src)![1]);
          })();
          const trees = w.__ourusSxsTrees;
          // the editor tree of the rem the page shows: the document, or the rem zoomed into
          let root: string = docRem._id;
          const controller = (): any => [...Object.values(trees)].flatMap((t: any) => (Array.isArray(t) ? t : [t])).map((t: any) => t?.controller).find((c: any) => c?.rootRem?._id === root);
          const rendered = (ids: string[]) => controller() && ids.every((id) => document.querySelector(`[data-rem-id="${id}"]`));
          for (let i = 0; i < 400 && !rendered(made); i++) await sleep(10);
          if (!rendered(made)) throw new Error("the test's rems didn't render");
          // its view, every rem on screen: the zoom root's page shown, then the folded rems collapsed in
          // what it shows (a rem's collapse is its portal's, the root the page shows)
          if (view) {
            if (view.zoom !== null) {
              root = made[view.zoom]!;
              w.FlowRouter.go(`/w/null/${root}`);
              const inside = made.filter((_, k) => k > view.zoom! && items.slice(view.zoom! + 1, k + 1).every((it) => it.depth > items[view.zoom!]!.depth));
              for (let i = 0; i < 400 && !rendered(inside); i++) await sleep(10);
              if (!rendered(inside)) throw new Error("the zoom root's rems didn't render");
            }
            for (const k of view.folded) await w.Rem(KB).findOne(made[k]).portalContext(root).setIsCollapsed(true);
            await flush('ourusSxsView');
            await w.__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 });
          }
          if (!sel) return;
          const c = controller();
          const id = made[sel.block]!;
          c.focusOnChild(c.rootRem._id, id, true);
          for (let i = 0; i < 200 && c.currentlyFocusedRemId() !== id; i++) await sleep(10);
          if (c.currentlyFocusedRemId() !== id) throw new Error(`the rem didn't take the focus (focused: ${c.currentlyFocusedRemId()})`);
          w.setFocusedElementProps({ type: 'text', anchor: sel.anchor, focus: sel.head });
          const placed = () => {
            const p = w.getFocusProps();
            return p?.type === 'text' && p.anchor === sel.anchor && p.focus === sel.head && document.activeElement?.closest(`[data-rem-id="${id}"]`);
          };
          for (let i = 0; i < 200 && !placed(); i++) await sleep(10);
          if (!placed()) throw new Error(`the caret didn't land: ${JSON.stringify(w.getFocusProps())}`);
        },
        { items, sel, bulletless: !!setup.bulletless, view: o.view ?? null },
      );
      viewed(page).on = !!o.view;
      if (!selected) return;
      const nested = (doc as Outline).blocks;
      const last = subtreeEnd(nested, selected[selected.length - 1]!);
      const reached = async (): Promise<number> => {
        await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 30, timeout: 3000 }));
        const got = (await this.read(page)) as Outline;
        return Math.max(-1, ...(got.selected ?? []).map((i) => subtreeEnd(got.blocks, i)));
      };
      for (let k = 0; k <= nested.length + nested[selected[0]!]!.text.split('\n').length && (await reached()) < last; k++) await page.keyboard.press('Shift+ArrowDown');
    },

    async read(page: Page) {
      const raw = await page.evaluate(async (viewed) => {
        const w = window as any;
        const KB = w.CURRENT_KNOWLEDGE_BASE;
        // rich text as plain text: a formatted run its text, anything else (a reference, an image) a mark
        const plain = (rt: unknown[]): string => (rt ?? []).map((e: any) => (typeof e === 'string' ? e : typeof e?.text === 'string' ? e.text : '￼')).join('');
        // and as runs, each with its formatting (`b` bold, `l` italic, `q` code, `str` struck, `iUrl` a
        // link's target), the placeholders out
        const runs = (rt: unknown[]): Run[] =>
          (rt ?? []).map((e: any): Run => {
            if (typeof e === 'string') return { text: e.replace(/\ufeff/g, '') };
            if (typeof e?.text !== 'string') return { text: '￼' };
            return { text: e.text.replace(/\ufeff/g, ''), bold: !!e.b, italic: !!e.l, code: !!e.q, strike: !!e.str, ...(typeof e.iUrl === 'string' && { href: e.iUrl }) };
          });
        const trees = w.__ourusSxsTrees;
        // the rem the page shows: the document, or one zoomed into (its id last in the route, after a
        // slug of its text where RemNote puts one: `/w/null/ourus-sxs-<id>`)
        const root: string = /\/w\/null\/(?:[^/?#]*-)?([A-Za-z0-9]+)(?:[/?#]|$)/.exec(w.FlowRouter.current().path)?.[1] ?? w.__ourusSxsDoc;
        const c = trees && [...Object.values(trees)].flatMap((t: any) => (Array.isArray(t) ? t : [t])).map((t: any) => t?.controller).find((c: any) => c?.rootRem?._id === root);
        const focused = c?.currentlyFocusedRemId?.();
        const flat: { depth: number; content: string; runs: Run[]; placeholders: number[]; todo: boolean; done: boolean; heading: number; numbered: boolean; code: boolean; free: boolean; number: number | null; id: string; collapsed: boolean }[] = [];
        // (`under`: the portal a rem shows in, the root the page shows where it is in it)
        const walk = async (rem: any, depth: number, under = w.__ourusSxsDoc) => {
          for (const r of await rem.childrenRemAsync()) {
            const portal = r._id === root || under === root ? root : under;
            // the rem being edited: its editor's text, which the caret (getFocusProps) is an offset in; the
            // text cache and the model can hold less (Shift+Enter at a rem's start: `\none` in the editor,
            // `one` in both)
            const editing = r._id === focused ? (w.editor?.text ?? c.currentFocusedRemTextCache?.()?.getCurrentRichText?.()) : undefined;
            const font = /^H(\d)$/.exec(r.getFontSize?.() ?? '');
            const numbered = !!r.getIsListItem();
            // (a rem shows no bullet only in a document without bullets)
            const free = !!r.portalContext(w.__ourusSxsDoc).renderAsNoBullet();
            // (the editor keeps an empty line with a zero-width placeholder, U+FEFF, no text of the rem's)
            flat.push({ depth, content: plain(editing ?? r.key).replace(/\ufeff/g, ''), runs: runs(editing ?? r.key), placeholders: editing ? [...plain(editing).matchAll(/\ufeff/g)].map((m) => m.index!) : [], todo: !!r.getIsTodo(), done: r.getTodoStatus() === 'Finished', heading: font ? Number(font[1]) : 0, numbered, code: !!r.getIsCode(), free, number: numbered ? r.getListItemIndex() : null, id: r._id, collapsed: viewed && !!r.portalContext(portal).getIsCollapsed() });
            await walk(r, depth + 1, portal);
          }
        };
        const docRem = w.Rem(KB).findOne(w.__ourusSxsDoc);
        if (docRem) await walk(docRem, 0);
        const p = w.getFocusProps();
        const block = flat.findIndex((f) => f.id === focused);
        // an offset in the editor's text, its placeholders taken out
        const off = (o: number): number => o - (block >= 0 ? flat[block]!.placeholders.filter((i) => i < o).length : 0);
        const sel = p?.type === 'text' && block >= 0 ? { block, anchor: off(p.anchor), head: off(p.focus) } : null;
        const range: string[] = p?.type !== 'text' && Array.isArray(p?.selectedRange) ? p.selectedRange : [];
        const selected = range.map((id) => flat.findIndex((f) => f.id === id)).filter((i) => i >= 0);
        // the view: the collapsed rems, and the rem zoomed into, if one of the test's (the document: none)
        const zoom = flat.findIndex((f) => f.id === root);
        const view = viewed ? { folded: flat.flatMap((f, k) => (f.collapsed && (flat[k + 1]?.depth ?? -1) > f.depth ? [k] : [])), zoom: zoom >= 0 ? zoom : null } : undefined;
        return { flat, sel, selected, focusType: p?.type, view };
      }, viewed(page).on);
      // a rem's text as Markdown, its formatting in markup (a code rem's as it is), and where an offset
      // in its text is in it
      const mds = raw.flat.map((f) => (f.code ? { text: f.content, at: (p: number) => p } : runsAsMarkdown(f.runs)));
      const texts = raw.flat.map((f, i) => fromItem({ ...f, content: mds[i]!.text }, f.number));
      const blocks = raw.flat.map((f, i) => ({ depth: f.depth, text: texts[i]!.text, ...(setup.bulletless && f.free && { free: true as const }) }));
      let sel: Outline['sel'] = null;
      if (raw.sel) {
        const { prefix, cut } = texts[raw.sel.block]!;
        const md = mds[raw.sel.block]!;
        const at = (p: number): number => prefix + md.at(p) + (cut !== undefined && md.at(p) > cut ? 1 : 0);
        sel = { block: raw.sel.block, anchor: at(raw.sel.anchor), head: at(raw.sel.head) };
      }
      const got: Outline = { blocks, sel, ...(raw.selected.length && { selected: raw.selected }), ...(raw.view && { view: raw.view }) };
      if (!setup.bulletless) return got;
      // (without bullets, a selection's rems the topmost of ourus's nesting)
      const owned = own(got, this.behaves?.listParent);
      const selected = owned.selected?.filter((i) => !owned.selected!.some((j) => j < i && subtreeEnd(owned.blocks, j) >= i));
      return { ...owned, ...(selected && { selected }) };
    },

    async act(page: Page, action: string, settle: () => Promise<void>) {
      // deleting a subtree: "Delete Bullet" on the rem being edited; rems selected, Backspace (the
      // shortcut leaves a selection as it is)
      if (action === 'deleteSubtree') {
        await page.keyboard.press(((await this.read(page)) as Outline).selected?.length ? 'Backspace' : 'Control+Shift+Alt+Backspace');
        return settle();
      }
      // RemNote has no key for the document's ends: Up (Down) until the caret is on the first rem's first
      // line (the last rem's last), then Home (End). Up from the first rem goes to the document's title, no
      // rem of the test. With Shift, a caret crossing a rem's edge makes a selection of rems, as a user's
      // Shift+Up does: extended until it stops growing
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

    async drop(page: Page, drop: Drop, settle: () => Promise<void>) {
      await remnoteDrop(page, drop, settle, (await this.read(page)) as Outline);
    },
  };
}

// documents without bullets, RemNote's free form; with bullets, ../remnote-bl/
export const driver = remnoteDriver({ shortId: 'RN', longId: 'remnote', displayName: 'RemNote (nbl)', bulletless: true });

/** Where RemNote's drop regions for a rem are (`getRectsInfoForDropRegion`), aimed at: each null where the rem has none. */
interface Regions {
  depth: number;
  bullet: { x: number; y: number } | null;
  above: { x: number; y: number };
  below: { x: number; y: number };
  child: { x: number; y: number };
  side: { x: number; y: number } | null;
}

/**
 * A drop in RemNote (`startDragging`, `onBulletPointerLeave` and its drop regions in its bundle): the
 * pressed rem's bullet held, left (the drag starts as the pointer leaves the bullet), moved to the drop
 * region of the place, and released (the region is the one the release is in, of the smallest rem
 * that holds it). Each rem's row, three pixels taller above and fourteen wider at the left, splits in
 * halves: the top half drops above it; the bottom half, its first 84 pixels below it (above it, where
 * it has children), past them as its first child; beside its children, their bottom half drops below
 * it. A place is a rem's region: below the rem it goes after, among the rem's siblings; else above the
 * rem it goes before at the top, or as its parent's first child. It drags the rem pressed, or the
 * selection's rems where it is one of them (a drop of the selection presses its first), and a rem
 * without a bullet it doesn't.
 * Without bullets, ourus's place is a rem's: under the nearest item it is in, after the last of that
 * item's rems before it.
 */
async function remnoteDrop(page: Page, drop: Drop, settle: () => Promise<void>, outline: Outline): Promise<void> {
  const press = drop.press ?? drop.rows[0]!;
  const rems = await page.evaluate(async () => {
    const w = window as any;
    const c = [...Object.values(w.__ourusSxsTrees)].flatMap((t: any) => (Array.isArray(t) ? t : [t])).map((t: any) => t?.controller).find((c: any) => c?.rootRem?._id === w.__ourusSxsDoc);
    const m = c.hierarchyEditor.mounterModule;
    // the rems in document order, as `read` walks them
    const all: { rem: any; depth: number }[] = [];
    const walk = async (rem: any, depth: number) => {
      for (const r of await rem.childrenRemAsync()) {
        all.push({ rem: r, depth });
        await walk(r, depth + 1);
      }
    };
    await walk(w.Rem(w.CURRENT_KNOWLEDGE_BASE).findOne(w.__ourusSxsDoc), 0);
    return all.map(({ rem, depth }): Regions | null => {
      const node = c.nodesAsList.find((n: any) => n.nodeType === 'REM' && n.rem?._id === rem._id);
      const content = node && m.nodeIdToContentDiv.get(node._id);
      const container = node && m.nodeIdToContainerDiv.get(node._id);
      if (!content || !container) return null;
      const box = container.getBoundingClientRect();
      const row = content.getBoundingClientRect();
      // (its regions: the row from 3 pixels above the rem to its children, 14 pixels left of it; its
      // children's, 23 pixels in; each region aimed at its middle)
      const left = box.left - 14;
      const top = box.top - 3;
      const mid = (top + row.bottom) / 2;
      const split = left + 84;
      const bottom = box.bottom + 3;
      const side = (row.bottom + bottom) / 2;
      const dot = content.querySelector('[data-test="Rem Bullet"]')?.getBoundingClientRect();
      return {
        depth,
        bullet: dot && dot.width ? { x: dot.left + dot.width / 2, y: dot.top + dot.height / 2 } : null,
        above: { x: left + 42, y: (top + mid) / 2 },
        below: { x: left + 42, y: (mid + row.bottom) / 2 },
        child: { x: split + Math.min(40, (box.right - split) / 2), y: (mid + row.bottom) / 2 },
        side: box.bottom > row.bottom ? { x: left + 23 / 2, y: (side + bottom) / 2 } : null,
      };
    });
  });
  const { blocks } = outline;
  if (rems.length !== blocks.length) throw new Error(`the page has ${rems.length} rems, its outline ${blocks.length} blocks`);
  const regions = rems.map((r, i) => {
    if (!r) throw new Error(`rem ${i} isn't on screen`);
    return r;
  });
  const pressed = regions[press]!;
  if (!pressed.bullet) throw new Unsupported("the pressed rem has no bullet: RemNote drags a rem by its bullet");
  // (past a block's subtree, in an outline's depths; a block's parent)
  const end = (i: number, depth: (j: number) => number): number => {
    let j = i + 1;
    while (j < blocks.length && depth(j) > depth(i)) j++;
    return j;
  };
  const parent = (i: number, depth: (j: number) => number): number | 'root' => {
    for (let j = i - 1; j >= 0; j--) if (depth(j) < depth(i)) return j;
    return 'root';
  };
  const ours = (j: number): number => blocks[j]!.depth;
  const theirs = (j: number): number => regions[j]!.depth;
  const dragged = (j: number): boolean => drop.rows.some((r) => j >= r && j < end(r, theirs));
  // the place as rems: under the nearest item (a rem without a bullet holds none), after the last of its
  // rems before where ourus's place is
  let under = drop.to.parent;
  while (under !== 'root' && blocks[under]!.free) under = parent(under, ours);
  const at = drop.to.after !== null ? end(drop.to.after, ours) : drop.to.parent === 'root' ? 0 : drop.to.parent + 1;
  let after: number | null = null;
  for (let j = under === 'root' ? 0 : under + 1; j < at; j++) if (!dragged(j) && parent(j, theirs) === under) after = j;
  let to: { x: number; y: number };
  if (after !== null) to = regions[after]!.side ?? regions[after]!.below;
  else if (under !== 'root') to = regions[under]!.child;
  else {
    const first = regions.findIndex((r, j) => r.depth === 0 && !dragged(j));
    if (first < 0) throw new Unsupported('no rem to drop above');
    to = regions[first]!.above;
  }
  await gesture(page, pressed.bullet, to, settle);
  // (the pointer off the rems: left resting where the drop was, it is over the next test's, which
  // RemNote's pointer handlers take, the caret placed there lost)
  await page.mouse.move(1, 1);
  await settle();
}
