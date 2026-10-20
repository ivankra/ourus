/// <reference lib="dom" />
// Logseq, both of its apps, one driver (`logseqDriver`): the file-based app ("OG") on its web demo
// (https://demo.logseq.com/, this setup) and the database version on its test channel
// (../logseq-db/). Each keeps a graph in the browser that saves nothing elsewhere. Each test gets a
// fresh page, built and its caret placed through Logseq's plugin API (`window.logseq.api`, the same in
// both); the actions are Logseq's keys on Linux, the same in both. What a flavor decides is how a
// block's canonical text is held: OG keeps it all in the block's text (a task's `TODO`, a heading's
// `#`s, a fence; a number as a property line in the content), the DB version holds those as properties
// of the block, its text the rest.
//
// - Undo stays within the test: each test's undo history starts with it (proxy.ts names a function in
//   the bundle that empties it, called once the test's page is made; else an undo past the test's took
//   back part of the load), and OG's is its "page only" history.
// - `outdent: logical` is Logseq's "logical outdenting" setting, switched per test.
// - The block being edited is read from its editor: Logseq saves the editor to its database about half
//   a second after typing stops, so the database lags behind it.
// - `editor/op`, Logseq's flag for an insert, delete, indent, paste or undo in flight, counts as busy
//   when settling. An exception inside such an operation leaves it set (and Logseq then stops saving
//   an editor it leaves): the runner reports the test where it got stuck, and the next test starts by
//   clearing it. README.md has the rest of what Logseq does that a driver has to know.

import type { Page } from 'playwright-core';
import { perPage, type Driver } from '../lib/driver.ts';
import { unescapeLaterLines, type Outline } from '../lib/block.ts';

/** Logseq's keys for the spec's actions (Linux); the `select…` motions add Shift. */
const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
};

/** A canonical block as a Logseq holds it. */
export interface BlockToLoad {
  /** What is inserted as the block's content. */
  content: string;
  /** Its properties, set once it is inserted (the DB version's), by their idents. */
  props: Record<string, string | number>;
  /** The text its editor shows, which the block being edited is given. */
  edit: string;
  /** The canonical text's prefix the editor doesn't show (`from` characters), and the editor's own (`to`), for the caret. */
  from: number;
  to: number;
  numbered: boolean;
}

/** A block as read: its content (or its editor's text, the block being edited) and what its properties say. */
export interface BlockAsRead {
  content: string;
  /** OG: its content as stored, which has its number's property where its editor's text hasn't. */
  stored?: string;
  /** OG: its properties as the API gives them. */
  properties?: Record<string, unknown>;
  /** DB: its heading level, its task's status (`todo`, `done`, ...), its number, its code block's language, a math block. */
  heading?: number;
  status?: string;
  ordered?: boolean;
  code?: string;
  math?: boolean;
}

/** A read block's canonical text; `from` and `to` as in `BlockToLoad` the other way, `cut` where an escape went in. */
export interface CanonicalBlock {
  text: string;
  from: number;
  to: number;
  cut?: number;
}

/** What one Logseq differs in. */
export interface LogseqFlavor {
  readonly shortId: string;
  readonly longId: string;
  readonly displayName: string;
  readonly url: string;
  /** The database version: pages go to a recycle bin, code blocks are code editors, the history is graph-wide. */
  readonly db: boolean;
  toLogseq(text: string): BlockToLoad;
  /** `number`: its place in its run of numbered siblings, if it is numbered. */
  fromLogseq(raw: BlockAsRead, number: number | null): CanonicalBlock;
  numbered(raw: BlockAsRead): boolean;
  /** The settings it can be switched between, `outdent` its logical outdenting. */
  readonly settings?: Driver['settings'];
  /** A start this Logseq can't hold, besides a numbered run that starts at another number than 1. */
  holds(doc: Outline): string | undefined;
  /** A script for its page, run before Logseq's own (the DB version's: what settling waits for in it). */
  readonly initScript?: () => void;
  /** A JavaScript expression that is true while it is busy, besides an `editor/op` in flight. */
  readonly busy?: string;
  /** Values of `editor/op` it leaves set with nothing in flight, besides OG's `nil` (`indent-outdent`'s `:nil`). */
  readonly staleOps?: readonly string[];
}

/** `text` with its first matching prefix swapped: the new text and the swapped prefixes' lengths. */
export function swapPrefix(text: string, table: [RegExp, string][]): { text: string; from: number; to: number } {
  for (const [re, to] of table) {
    const m = re.exec(text);
    if (m) return { text: to + text.slice(m[0].length), from: m[0].length, to: to.length };
  }
  return { text, from: 0, to: 0 };
}

/** An offset in a text whose prefix of `from` characters became `to` characters: past it, shifted; inside it, clamped. */
const shiftOffset = (p: number, from: number, to: number): number => (p >= from ? p - from + to : Math.min(p, to));

/** A number at a text's start that is text, not a list marker (`1.5`, `2)x` are text too, Markdown's marker needing a space after it). */
export const LITERAL_NUMBER = /^\d{1,9}(?=[.)](?:[ \t\n]|$))/;

/** OG's task markers: `[ ]` is `TODO` and `[x]` is `DONE`, and what follows stays; its other markers read as tasks too. */
const TO_OG: [RegExp, string][] = [
  [/^\[ \](?= |$)/, 'TODO'],
  [/^\[[xX]\](?= |$)/, 'DONE'],
];
const FROM_OG: [RegExp, string][] = [
  [/^(?:TODO|LATER|NOW|DOING|WAIT|WAITING|IN-PROGRESS)(?= |$)/, '[ ]'],
  [/^(?:DONE|CANCELED|CANCELLED)(?= |$)/, '[x]'],
];

/** The property that makes an OG block numbered: a run of such siblings is numbered from 1. */
const NUMBERED = 'logseq.order-list-type:: number';

/** Logseq OG on its web demo: a block's text is all of it, a task's checkbox Logseq's `TODO` / `DONE`. */
export const OG: LogseqFlavor = {
  shortId: 'LO',
  longId: 'logseq',
  displayName: 'Logseq (OG)',
  url: 'https://demo.logseq.com/',
  db: false,
  // Logseq's "logical outdenting" (Settings › Editor, `:editor/logical-outdenting?`)
  settings: { outdent: ['direct', 'logical'] },
  // a numbered block (`1. x`) without its number, the property after its text; its editor shows no
  // hidden property (`hidden-built-in-properties`), the number's among them
  toLogseq(text) {
    const n = /^\d{1,9}\. /.exec(text);
    const rest = n ? text.slice(n[0].length) : text;
    const task = swapPrefix(rest, TO_OG);
    return { content: n ? `${task.text}\n${NUMBERED}` : task.text, props: {}, edit: task.text, from: (n?.[0].length ?? 0) + task.from, to: task.to, numbered: !!n };
  },
  // the property of a numbered one taken off and its number put before its text; a number that is
  // text escaped (`1\. x`, also after a numbered block's own number: `2. 2\. x`); a task's marker as its checkbox
  fromLogseq(raw, number) {
    const task = swapPrefix(raw.content.replace(/\n?logseq\.order-list-type:: number[ \t]*(?=\n|$)/, ''), FROM_OG);
    const pre = number !== null ? `${number}. ` : '';
    const literal = LITERAL_NUMBER.exec(task.text);
    const text = literal ? task.text.slice(0, literal[0].length) + '\\' + task.text.slice(literal[0].length) : task.text;
    return { text: pre + text, from: task.from, to: task.to + pre.length, ...(literal && { cut: task.to + pre.length + literal[0].length }) };
  },
  numbered: (raw) =>
    /(?:^|\n)logseq\.order-list-type:: number[ \t]*(?:\n|$)/.test(raw.stored ?? raw.content) || raw.properties?.['logseqOrderListType'] === 'number' || raw.properties?.['logseq.order-list-type'] === 'number',
  holds(doc) {
    // Logseq trims a stored block's text; only the block being edited (its textarea) keeps it as is
    const trimmed = doc.blocks.findIndex((b, i) => i !== doc.sel?.block && /^\s|\s$/.test(swapPrefix(b.text.replace(/^\d{1,9}\. /, ''), TO_OG).text));
    if (trimmed >= 0) return 'whitespace at the edge of a block not being edited';
    return undefined;
  },
};

/** The page the current test runs on, a worker's (`perPage`), to delete once the next test has moved on. */
const pageState = perPage(() => ({ current: null as string | null }));

export function logseqDriver(flavor: LogseqFlavor): Driver {
  const { db } = flavor;
  return {
    shortId: flavor.shortId,
    longId: flavor.longId,
    displayName: flavor.displayName,
    url: flavor.url,
    model: 'block',
    keys: {
      enter: 'Enter',
      shiftEnter: 'Shift+Enter',
      indent: 'Tab',
      outdent: 'Shift+Tab',
      deleteContentBackward: 'Backspace',
      deleteContentForward: 'Delete',
      moveSubtreeUp: 'Alt+Shift+ArrowUp',
      moveSubtreeDown: 'Alt+Shift+ArrowDown',
      // "kill line before" (`kill-line-before!`): from the start of the caret's line to the caret, nothing at a line's start
      deleteSoftLineBackward: 'Alt+u',
      pasteStructured: 'Control+v',
      pastePlain: 'Control+Shift+v',
      undo: 'Control+z',
      redo: 'Control+Shift+z',
      ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
    },
    emulated: ['cursorDocStart', 'cursorDocEnd', 'selectDocStart', 'selectDocEnd', 'deleteSubtree'],
    // quotes and callouts are skipped for every block app (../lib/block.ts); a heading's `#`s, a task's
    // checkbox and a code block's fences are OG's text in a block, edited a character at a time, and
    // the DB version's properties of a block
    refuses: ['markup-heading', 'markup-task', 'markup-fence'],
    ordered: true,
    // Backspace at the first block's start does nothing in both (measured with `--ignore-options`:
    // `backspace.md › Backspace34` agrees; its `unwrap` case needs a paragraph, which no block app runs)
    behaves: { enterTask: 'plain', outdent: 'direct', enterOnEmptyItem: 'sibling', enterMidItem: 'child', pasteStructuredMidText: 'after', emptyItemWithChildren: 'refuse', joinWithChildren: 'refuse', pasteStructuredListForm: 'drop', backspaceAtTopItem: 'refuse' },
    ...(flavor.settings && { settings: flavor.settings }),
    holds(doc: Outline) {
      const own = flavor.holds(doc);
      if (own) return own;
      // a run of numbered siblings is numbered from 1, whatever it was written with
      const run: number[] = [];
      for (const b of doc.blocks) {
        run.length = b.depth + 1;
        const n = /^(\d{1,9})\. /.exec(b.text);
        run[b.depth] = n ? (run[b.depth] ?? 0) + 1 : 0;
        if (n && Number(n[1]) !== run[b.depth]) return 'numbered list from another number than 1';
      }
      return undefined;
    },
    idle: {
      busy: `(() => { const op = window.logseq?.api?.get_state_from_store('editor/op'); return op != null && !${JSON.stringify(['nil', ...(flavor.staleOps ?? [])])}.includes(String(op)); })()${flavor.busy ? ` || (${flavor.busy})` : ''}`,
    },

    async open(page: Page) {
      if (flavor.initScript) await page.addInitScript(flavor.initScript);
      // the plugin API comes up before the graph is open and the journal rendered; the bundle with
      // what proxy.ts adds to it (`__ourusLogseq`), which the browser's own cache may hold unpatched
      const loaded = async (): Promise<boolean> => {
        await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.waitForFunction(() => (window as any).logseq?.api?.create_page && document.querySelector('#main-content-container .ls-block'), null, { timeout: 120000 });
        return page.evaluate(() => !!(window as any).__ourusLogseq);
      };
      if (!(await loaded())) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Network.clearBrowserCache');
        await cdp.detach();
        if (!(await loaded())) throw new Error(`Logseq's bundle came without what ${flavor.longId}/proxy.ts adds to it (its names not found in it?)`);
      }
      const idle = () => page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
      // Logseq installs its global keys (Tab among them) through `shortcut/refresh!`, debounced by a
      // second after startup; until then Tab moves the focus out of the editor and the key is lost. So
      // the app is ready once Tab indents a block.
      let ready = false;
      for (let t0 = Date.now(); !ready && Date.now() - t0 < 30000; ) {
        await this.load(page, { blocks: [{ depth: 0, text: 'a' }, { depth: 0, text: 'b' }], sel: { block: 1, anchor: 1, head: 1 } });
        await idle();
        await page.keyboard.press('Tab');
        await idle();
        ready = ((await this.read(page)) as Outline).blocks[1]?.depth === 1;
        if (!ready) await page.waitForTimeout(250);
      }
      if (!ready) throw new Error("Logseq's keys didn't come up: Tab doesn't indent");
      // OG: undo only on the page being edited (its "page only" history, a setting of its right
      // sidebar), so undo can't reach into an earlier test; the DB version's history, graph-wide, is
      // emptied at every load anyway
      if (!db) await page.evaluate(() => (window as any).logseq.api.set_state_from_store('history/page-only-mode?', true));
      // the build: the bundle's ETag stands in for it, after the DB version's own version
      return page.evaluate(async (db) => {
        const res = await fetch('/js/main.js', { method: 'HEAD' });
        const etag = res.headers.get('etag')?.replace(/^W\//, '').replace(/"/g, '');
        const version = db ? (await (window as any).logseq.api.get_app_info())?.version : undefined;
        return [version, etag && `build ${etag.slice(0, 8)}`].filter(Boolean).join(' ') || undefined;
      }, db);
    },

    async load(page: Page, doc: Outline) {
      const blocks = doc.blocks.map((b) => ({ depth: b.depth, ...flavor.toLogseq(b.text) }));
      const swapped = doc.sel && blocks[doc.sel.block]!;
      const sel = doc.sel && { block: doc.sel.block, anchor: shiftOffset(doc.sel.anchor, swapped!.from, swapped!.to), head: shiftOffset(doc.sel.head, swapped!.from, swapped!.to) };
      pageState(page).current = await page.evaluate(
        async ({ blocks, sel, previous, db }) => {
          const api = (window as any).logseq.api;
          const wait = (quiet: number) => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet, timeout: 3000 });
          // a flag an exception left set would read as busy all through this test
          if (api.get_state_from_store('editor/op') != null) api.set_state_from_store('editor/op', null);
          await api.exit_editing_mode(false);
          // the last test's page goes first (deleting a page takes OG to its home page; the DB version
          // keeps it in its recycle bin, from which it goes for good); a run's first test sweeps up what
          // earlier runs left
          const stale = previous ? [previous] : ((await api.get_all_pages()) ?? []).map((p: any) => p.name ?? p['original-name']).filter((n: string) => /^spec-/.test(n ?? ''));
          for (const name of stale) {
            const gone = db ? (await api.get_page(name))?.uuid : null;
            await api.delete_page(name).catch(() => {});
            if (gone) await api.delete_recycled_page_permanently(gone).catch(() => {});
          }
          const name = 'spec-' + Math.random().toString(36).slice(2, 10);
          const roots: any[] = [];
          const stack: any[] = [];
          // the DB version's batch insert refuses a tag (`#a`: its transaction is invalid, the tag made
          // or not); such a block goes in empty, and the update below writes it, as typing would
          const tagged = (text: string): boolean => db && /(^|\s)#\S/.test(text);
          for (const b of blocks) {
            const node = { content: tagged(b.content) ? '' : b.content, children: [] as any[] };
            stack.length = b.depth;
            (b.depth === 0 ? roots : stack[b.depth - 1].children).push(node);
            stack[b.depth] = node;
          }
          if (db) {
            // the blocks under the page, then the page shown: shown empty first, it gets a block of its own
            const pg = await api.create_page(name, {}, { redirect: false });
            await api.insert_batch_block(pg.uuid, roots, { sibling: false });
          } else {
            await api.create_page(name, {}, { redirect: true, createFirstBlock: true });
            const first = (await api.get_page_blocks_tree(name))[0];
            await api.insert_batch_block(first.uuid, roots, { sibling: true });
            await api.remove_block(first.uuid);
          }
          const flat: any[] = [];
          const walk = (bs: any[]) => bs.forEach((x) => (flat.push(x), walk(x.children ?? [])));
          walk(await api.get_page_blocks_tree(name));
          for (let i = 0; i < flat.length; i++) {
            // a batch insert drops a line's leading whitespace (code loses its indentation); a single
            // update keeps it. The DB version makes a fenced block a code block, its content the code,
            // which its editor's text is, and a `$$` block a math block likewise
            const display = db && (flat[i][':logseq.property.node/display-type'] ?? flat[i]['logseq.property.node/display-type']);
            const content = display === 'code' || display === 'math' ? blocks[i]!.edit : blocks[i]!.content;
            if (flat[i].content !== content) await api.update_block(flat[i].uuid, content);
            for (const [k, v] of Object.entries(blocks[i]!.props)) await api.upsert_block_property(flat[i].uuid, k, v);
          }
          if (db) api.push_state('page', { name });
          // the page renders after the redirect, and a block can be edited once it is on screen
          const rendered = () => flat.every((b) => document.querySelector(`#main-content-container .ls-block[blockid="${b.uuid}"]`));
          for (let i = 0; i < 300 && !rendered(); i++) await new Promise((r) => setTimeout(r, 10));
          if (!rendered()) throw new Error(`the test page didn't render (at ${location.hash})`);
          // inserting opens a block for editing, later: let that pass before choosing the block
          await wait(30);
          if (sel) {
            const { anchor, head } = sel;
            const target = flat[sel.block].uuid;
            // a code block's editor (the DB version's): CodeMirror's, its text the code
            const mirror = (): any => (document.activeElement?.closest('.CodeMirror') as any)?.CodeMirror ?? null;
            // the target's editor, if it is the one with the focus: Logseq opens an inserted block for
            // editing a moment later, so the focus can move to another block's after the target's opened
            const own = (): HTMLTextAreaElement | null => {
              const ta = document.activeElement as HTMLTextAreaElement | null;
              return ta?.tagName === 'TEXTAREA' && !mirror() && ta.closest('.ls-block')?.getAttribute('blockid') === target ? ta : null;
            };
            const code = () => !!mirror() && document.activeElement?.closest('.ls-block')?.getAttribute('blockid') === target;
            // in CodeMirror, Logseq has no block being edited (`check_editing` is false) until Escape takes it back to the block
            const editing = async () => code() || (!!own() && (await api.check_editing()) === target);
            const open = async (): Promise<void> => {
              for (let attempt = 0; attempt < 3 && !(await editing()); attempt++) {
                await api.edit_block(target, { pos: head });
                // edit_block opens the editor asynchronously
                for (let i = 0; i < 100 && !(await editing()); i++) await new Promise((r) => setTimeout(r, 10));
              }
              if (!(await editing())) throw new Error(`the block didn't open for editing (focus: ${document.activeElement?.tagName}, editing: ${await api.check_editing()})`);
            };
            await open();
            if (code()) {
              const cm = mirror();
              cm.setSelection(cm.posFromIndex(anchor), cm.posFromIndex(head));
            } else {
              // what Logseq trimmed on storing (a trailing line break, OG's edge spaces) the target's
              // editor holds, as if typed; Logseq may still re-render the editor from what it stored, so
              // until it sticks, and always into the target's editor (once, the text went into another
              // block's). An editor shows the text alone: OG's hidden properties (the number's among
              // them) aren't in it, nor the DB version's
              const text = blocks[sel.block]!.edit;
              for (let attempt = 0; attempt < 5 && own()?.value !== text; attempt++) {
                if (!own()) await open();
                Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(own()!, text);
                own()!.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(30);
              }
              if (!own()) await open();
              own()!.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), head < anchor ? 'backward' : 'forward');
            }
          } else await api.exit_editing_mode(false);
          // the undo history from here: every transaction goes into it, this load's too, and an undo past
          // what the test did would take back part of it (proxy.ts)
          const ours = (window as any).__ourusLogseq;
          if (!ours) throw new Error("Logseq's page has no __ourusLogseq (loaded before its proxy.ts patched its bundle?)");
          await ours.clearHistory(api.get_state_from_store('git/current-repo'));
          return name;
        },
        { blocks: blocks.map(({ depth, content, props, edit }) => ({ depth, content, props, edit })), sel, previous: pageState(page).current, db },
      );
    },

    async read(page: Page) {
      const raw = await page.evaluate(
        async ({ name, db }) => {
          const api = (window as any).logseq.api;
          const prop = (x: any, k: string) => x[`:${k}`] ?? x[k];
          // the DB version's task statuses, by the id a block's property refers to
          const statuses: Record<number, string> = db
            ? Object.fromEntries(
                ((await api.datascript_query('[:find ?e ?i :where [?p :db/ident :logseq.property/status] [?e :block/closed-value-property ?p] [?e :db/ident ?i]]')) ?? []).map(([e, i]: [number, string]) => [e, String(i).replace(/^:?logseq\.property\/status\./, '')]),
              )
            : {};
          const flat: { depth: number; uuid: string; raw: any }[] = [];
          const walk = (bs: any[], d: number) =>
            bs.forEach((x) => {
              const status = db ? prop(x, 'logseq.property/status') : undefined;
              flat.push({
                depth: d,
                uuid: x.uuid,
                raw: db
                  ? {
                      content: x.content ?? '',
                      heading: prop(x, 'logseq.property/heading') || undefined,
                      status: status ? statuses[status.id ?? status] ?? 'todo' : undefined,
                      ordered: !!prop(x, 'logseq.property/order-list-type') || undefined,
                      code: prop(x, 'logseq.property.node/display-type') === 'code' ? String(prop(x, 'logseq.property.code/lang') ?? '') : undefined,
                      math: prop(x, 'logseq.property.node/display-type') === 'math' || undefined,
                    }
                  : { content: x.content ?? '', stored: x.content ?? '', properties: x.properties },
              });
              walk(x.children ?? [], d + 1);
            });
          walk(await api.get_page_blocks_tree(name), 0);
          // the DB version stores a reference by its uuid (`#[[uuid]]`, `[[uuid]]`), its editor shows the
          // name: the text as written
          if (db) {
            const uuidRef = /(#?)\[\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]/g;
            for (const b of flat) {
              const refs = [...String(b.raw.content).matchAll(uuidRef)];
              if (!refs.length) continue;
              const titles = new Map<string, string>();
              for (const [, , uuid] of refs) titles.set(uuid!, (await api.get_block(uuid))?.title ?? uuid);
              b.raw.content = String(b.raw.content).replace(uuidRef, (_: string, hash: string, uuid: string) => {
                const title = titles.get(uuid)!;
                return hash && !/\s/.test(title) ? `#${title}` : `${hash}[[${title}]]`;
              });
            }
          }
          const active = document.activeElement as HTMLTextAreaElement | null;
          const cm = (active?.closest('.CodeMirror') as any)?.CodeMirror;
          // a code block's editor (the DB version's) is no block being edited to Logseq: its block is the editor's
          const editing = cm ? active!.closest('.ls-block')?.getAttribute('blockid') : await api.check_editing();
          const i = editing && active?.tagName === 'TEXTAREA' ? flat.findIndex((b) => b.uuid === editing) : -1;
          let sel = null;
          // the block being edited: its editor, ahead of the database (its number and properties the
          // database's, an editor showing the text alone)
          if (i >= 0 && cm) {
            flat[i]!.raw.content = cm.getValue();
            sel = { block: i, anchor: cm.indexFromPos(cm.getCursor('anchor')), head: cm.indexFromPos(cm.getCursor('head')) };
          } else if (i >= 0) {
            flat[i]!.raw.content = active!.value;
            const back = active!.selectionDirection === 'backward';
            sel = { block: i, anchor: back ? active!.selectionEnd : active!.selectionStart, head: back ? active!.selectionStart : active!.selectionEnd };
          }
          const selected = ((await api.get_selected_blocks()) ?? []).map((b: any) => flat.findIndex((f) => f.uuid === b.uuid)).filter((k: number) => k >= 0);
          return { blocks: flat.map(({ depth, raw }) => ({ depth, raw })), sel, selected };
        },
        { name: pageState(page).current, db },
      );
      // a numbered block's place in its run of numbered siblings, from 1
      const run: number[] = [];
      const numbers = raw.blocks.map((b) => {
        run.length = b.depth + 1;
        const numbered = flavor.numbered(b.raw);
        run[b.depth] = numbered ? (run[b.depth] ?? 0) + 1 : 0;
        return numbered ? run[b.depth]! : null;
      });
      const swaps = raw.blocks.map((b, i) => flavor.fromLogseq(b.raw, numbers[i] ?? null));
      const blocks = raw.blocks.map((b, i) => ({ depth: b.depth, text: swaps[i]!.text }));
      let sel = raw.sel;
      if (sel) {
        const { from, to, cut } = swaps[sel.block]!;
        const at = (p: number): number => shiftOffset(p, from, to) + (cut !== undefined && shiftOffset(p, from, to) > cut ? 1 : 0);
        sel = { block: sel.block, anchor: at(sel.anchor), head: at(sel.head) };
      }
      // the block's later lines keep the escapes Markdown source has at their start; a block's text needs none
      return unescapeLaterLines({ blocks, sel, ...(raw.selected.length && { selected: raw.selected }) });
    },

    async configure(page: Page, settings) {
      // what the Settings toggle sets, in the graph's config as Logseq holds it; the toggle also writes
      // OG's config.edn, and Logseq reinstalls its keys a second after that file changes, which a test
      // starting meanwhile would race. `@` keeps the graph's name a string in the state's path.
      await page.evaluate((logical) => {
        const api = (window as any).logseq.api;
        const repo = api.get_state_from_store('git/current-repo');
        api.set_state_from_store(['config', `@${repo}`, 'editor/logical-outdenting?'], logical);
        if (!!api.get_current_graph_configs('editor/logical-outdenting?') !== logical) throw new Error(`Logseq's logical outdenting didn't change to ${logical}`);
      }, settings.outdent === 'logical');
    },

    async act(page: Page, action: string, settle: () => Promise<void>) {
      if (action === 'deleteSubtree') {
        // the block being edited selected, then Backspace deletes the selected blocks with their
        // children. Escape selects it, but never an OG block whose text has a code fence (Logseq's
        // editor: `select? (not (string/includes? value "```"))`); there Ctrl+A selects the text, and
        // once all of it is selected, the block (`select-parent`). From a DB code block's editor, the
        // first Escape leaves the code for the block, the second selects it
        const fenced = !db && (await page.evaluate(() => (document.activeElement as HTMLTextAreaElement | null)?.value?.includes('```') ?? false));
        const selected = async (): Promise<boolean> => !!(await page.evaluate(async () => ((await (window as any).logseq.api.get_selected_blocks()) ?? []).length));
        for (let i = 0; i < 2 && !(await selected()); i++) {
          await page.keyboard.press(fenced ? 'Control+a' : 'Escape');
          await settle();
          if (!fenced && !db) break;
        }
        await page.keyboard.press('Backspace');
        await settle();
        return;
      }
      // Logseq has no key for the document's ends: Up (Down) until the caret stops, then Home (End).
      // The DB version's page title is editable, and Up from the first block goes into it: back down.
      // With Shift, no caret is a selection of blocks, which goes on growing
      const up = /DocStart$/.test(action);
      const shift = action.startsWith('select') ? 'Shift+' : '';
      let last = '';
      for (let i = 0; i < 200; i++) {
        const sel = (await this.read(page)).sel;
        if (!sel && last && !shift) {
          await page.keyboard.press(`${shift}${up ? 'ArrowDown' : 'ArrowUp'}`);
          await settle();
          break;
        }
        const now = JSON.stringify(sel);
        if (now === last) break;
        last = now;
        await page.keyboard.press(`${shift}${up ? 'ArrowUp' : 'ArrowDown'}`);
        await settle();
      }
      await page.keyboard.press(`${shift}${up ? 'Home' : 'End'}`);
      await settle();
    },
  };
}

export const driver: Driver = logseqDriver(OG);
