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
import type { Driver } from '../lib/driver.ts';
import { runsAsMarkdown, type Block, type Outline, type Run } from '../lib/block.ts';

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
 * after it.
 */
export function own(o: Outline): Outline {
  const headings: number[] = [];
  let paragraph = false;
  const blocks = o.blocks.map((b) => {
    if (b.free) {
      paragraph = false;
      const level = freeLevel(b);
      if (level) while (headings.length && headings.at(-1)! >= level) headings.pop();
      const depth = b.depth + headings.length;
      if (level) headings.push(level);
      // (an atom owns no list: a code block, a thematic break)
      else paragraph = !FENCE.test(b.text) && !/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(b.text);
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
    keys: {
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
      // "Delete Bullet"
      deleteSubtree: 'Control+Shift+Alt+Backspace',
      copy: 'Control+c',
      cut: 'Control+x',
      paste: 'Control+v',
      pastePlain: 'Control+Shift+v',
      undo: 'Control+z',
      redo: 'Control+y',
      ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
    },
    emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd'],
    // headings and to-dos are a rem's attributes, with no boundary in its text; a code rem's fences are
    // no text either
    refuses: ['markup-heading', 'markup-task', 'markup-fence'],
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
      ...(setup.bulletless ? { enterOnEmptyItem: 'exit' as const } : {}),
    },
    idle: { busy: `window.getNumOngoingWriteGuarantees?.() > 0` },
    holds(doc) {
      const o = doc as Outline;
      if (setup.bulletless) {
        const no = bulletless(o);
        if (no) return no;
      }
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
      const o = setup.bulletless ? lift(doc as Outline) : (doc as Outline);
      const items = o.blocks.map((b) => toItem(b.depth, b.text, !!b.free));
      const local = (p: number, it: (typeof items)[number]): number => p - it.prefix - (it.cut !== undefined && p > it.cut ? 1 : 0);
      const sel = o.sel && { block: o.sel.block, anchor: local(o.sel.anchor, items[o.sel.block]!), head: local(o.sel.head, items[o.sel.block]!) };
      await page.evaluate(
        async ({ items, sel, bulletless }) => {
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
          const controller = (): any => [...Object.values(trees)].flatMap((t: any) => (Array.isArray(t) ? t : [t])).map((t: any) => t?.controller).find((c: any) => c?.rootRem?._id === docRem._id);
          const rendered = () => controller() && made.every((id) => document.querySelector(`[data-rem-id="${id}"]`));
          for (let i = 0; i < 400 && !rendered(); i++) await sleep(10);
          if (!rendered()) throw new Error("the test's rems didn't render");
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
        { items, sel, bulletless: !!setup.bulletless },
      );
    },

    async read(page: Page) {
      const raw = await page.evaluate(async () => {
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
        const c = trees && [...Object.values(trees)].flatMap((t: any) => (Array.isArray(t) ? t : [t])).map((t: any) => t?.controller).find((c: any) => c?.rootRem?._id === w.__ourusSxsDoc);
        const focused = c?.currentlyFocusedRemId?.();
        const flat: { depth: number; content: string; runs: Run[]; placeholders: number[]; todo: boolean; done: boolean; heading: number; numbered: boolean; code: boolean; free: boolean; number: number | null; id: string }[] = [];
        const walk = async (rem: any, depth: number) => {
          for (const r of await rem.childrenRemAsync()) {
            // the rem being edited: its editor's text, which the caret (getFocusProps) is an offset in; the
            // text cache and the model can hold less (Shift+Enter at a rem's start: `\none` in the editor,
            // `one` in both)
            const editing = r._id === focused ? (w.editor?.text ?? c.currentFocusedRemTextCache?.()?.getCurrentRichText?.()) : undefined;
            const font = /^H(\d)$/.exec(r.getFontSize?.() ?? '');
            const numbered = !!r.getIsListItem();
            // (a rem shows no bullet only in a document without bullets)
            const free = !!r.portalContext(w.__ourusSxsDoc).renderAsNoBullet();
            // (the editor keeps an empty line with a zero-width placeholder, U+FEFF, no text of the rem's)
            flat.push({ depth, content: plain(editing ?? r.key).replace(/\ufeff/g, ''), runs: runs(editing ?? r.key), placeholders: editing ? [...plain(editing).matchAll(/\ufeff/g)].map((m) => m.index!) : [], todo: !!r.getIsTodo(), done: r.getTodoStatus() === 'Finished', heading: font ? Number(font[1]) : 0, numbered, code: !!r.getIsCode(), free, number: numbered ? r.getListItemIndex() : null, id: r._id });
            await walk(r, depth + 1);
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
        return { flat, sel, selected, focusType: p?.type };
      });
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
      const got: Outline = { blocks, sel, ...(raw.selected.length && { selected: raw.selected }) };
      return setup.bulletless ? own(got) : got;
    },

    async act(page: Page, action: string, settle: () => Promise<void>) {
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
  };
}

// documents without bullets, RemNote's free form; with bullets, ../remnote-bl/
export const driver = remnoteDriver({ shortId: 'RN', longId: 'remnote', displayName: 'RemNote (nbl)', bulletless: true });
