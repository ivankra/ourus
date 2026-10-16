// Obsidian, the desktop app (see obsidian/README.md), as a driver to be made for each setup of it: bare,
// or with plugins (`obsidianDriver`). It is an Electron app, not a web page, so the driver starts it
// itself (`Driver.launch`): obsidian-launcher downloads the version asked for into
// `.sxs/obsidian/files/` and opens a vault written for the run (`.sxs/<setup>/vault/`), with a sandboxed configuration
// directory and its plugins installed; the runner drives the window over the DevTools protocol. Under
// Linux without a display it gets an Xvfb of its own; it runs offline.
//
// A Markdown editor (CodeMirror 6): the `text` model. Each test gets a note of its
// own, opened in the editor so that it starts with no history to undo; the caret is placed through
// CodeMirror, and the actions are Obsidian's keys on Linux, in the setup's editing mode: Live Preview
// (its default) or Source mode.
//
// Obsidian indents with a tab, or with four spaces when told not to use tabs; never two, which the
// spec draws. It runs with tabs, and a test indented with spaces as drawn has each two spaces of
// its lines' indentation loaded as a tab and read back as two spaces (`asTabs`, `asSpaces`). A test
// whose starting buffer is already indented with tabs is taken as written.

import { closeSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ObsidianLauncher, { type PluginEntry } from 'obsidian-launcher';
import { chromium, type Page } from 'playwright-core';
import { freePort, sleep, startXvfb, takeLock } from '../lib/desktop.ts';
import type { Driver } from '../lib/driver.ts';
import { ensureAptInstalled, type Need } from '../lib/system.ts';
import { cacheDir } from '../proxy.ts';
import type { TextDoc } from '../lib/text.ts';

/** Electron's libraries (they bring the rest), by their names from Debian 13 on (`t64`: 64-bit time) and before. */
const ELECTRON_LIBRARIES: Need[] = [
  ['libgtk-3-0t64', 'libgtk-3-0'],
  ['libnss3'],
  ['libasound2t64', 'libasound2'],
  ['libgbm1'],
  ['libxkbcommon0'],
  ['libcups2t64', 'libcups2'],
  ['libatk-bridge2.0-0t64', 'libatk-bridge2.0-0'],
  ['libxcomposite1'],
  ['libxdamage1'],
  ['libxrandr2'],
].map((pkg) => ({ pkg }));

const MOTIONS: Record<string, string> = {
  CharLeft: 'ArrowLeft',
  CharRight: 'ArrowRight',
  LineUp: 'ArrowUp',
  LineDown: 'ArrowDown',
  LineBoundaryBackward: 'Home',
  LineBoundaryForward: 'End',
  DocStart: 'Control+Home',
  DocEnd: 'Control+End',
};

/** A hotkey as `.obsidian/hotkeys.json` has it. */
interface Hotkey {
  modifiers: ('Mod' | 'Ctrl' | 'Alt' | 'Shift' | 'Meta')[];
  key: string;
}

/**
 * One setup of Obsidian: what the vault holds, and the keys that differ from bare Obsidian's. Each
 * setup is a directory here whose `driver.ts` passes one to `obsidianDriver` (`obsidian/`,
 * `obsidian-lp/`, `obsidian-outliner/`, and `obsidian-true-outliner/`, the example with a plugin's
 * settings).
 */
export interface Profile {
  /** The directory name: `obsidian`. */
  readonly name: string;
  /** In reports: `Obsidian`. */
  readonly title: string;
  /**
   * Installed and enabled in the vault, as obsidian-launcher takes them: a community plugin by `id`, a
   * GitHub release by `repo` (the repository's URL), or a built plugin by `path` (its `manifest.json`
   * and `main.js`), each with a `version`. `open` stops the run unless every plugin the vault enables
   * has loaded, and the version it returns names each with its version.
   */
  readonly plugins?: readonly PluginEntry[];
  /** Plugins' settings, by plugin id: their `data.json`, as if set before the first start. */
  readonly pluginData?: Readonly<Record<string, unknown>>;
  /** The editing mode: Live Preview (Obsidian's default, which draws markup) or Source mode (the text as it is). */
  readonly mode: 'live-preview' | 'source';
  /** `.obsidian/app.json`, over the driver's own (`useTab`, `livePreview`). */
  readonly appConfig?: Readonly<Record<string, unknown>>;
  /** `.obsidian/hotkeys.json`, over the driver's own, by command id. */
  readonly hotkeys?: Readonly<Record<string, readonly Hotkey[]>>;
  /** The keys for actions, over bare Obsidian's. */
  readonly keys?: Driver['keys'];
  /** Why this setup can't start from a document, besides bare Obsidian's reasons. */
  readonly holds?: (doc: TextDoc) => string | undefined;
  /** How the setup behaves where ourus has an option, over bare Obsidian's. */
  readonly behaves?: Driver['behaves'];
}

// ------------------------------------------------------------------ indentation

/** A document with each line's indentation rewritten, and its selection carried along. */
function reindent(d: TextDoc, lead: (ws: string) => string, at: (ws: string, i: number) => number): TextDoc {
  const lines = d.text.split('\n');
  const out: string[] = [];
  /** Old offset of each line's start, and new. */
  let from = 0;
  let to = 0;
  const starts: [number, number, string, string][] = [];
  for (const line of lines) {
    const ws = /^[ \t]*/.exec(line)![0];
    const now = lead(ws);
    starts.push([from, to, ws, now]);
    out.push(now + line.slice(ws.length));
    from += line.length + 1;
    to += now.length + line.length - ws.length + 1;
  }
  const map = (offset: number): number => {
    let i = starts.length - 1;
    while (i > 0 && starts[i]![0] > offset) i--;
    const [old, now, ws, nowWs] = starts[i]!;
    const col = offset - old;
    return now + (col <= ws.length ? at(ws, col) : nowWs.length + col - ws.length);
  };
  return { text: out.join('\n'), sel: d.sel && { anchor: map(d.sel.anchor), head: map(d.sel.head) } };
}

/** Each two spaces of a line's indentation as a tab (an odd one left a space). */
export const asTabs = (d: TextDoc): TextDoc =>
  reindent(
    d,
    (ws) => '\t'.repeat(ws.length >> 1) + ' '.repeat(ws.length & 1),
    (_, i) => (i >> 1) + (i & 1),
  );

/** Each tab of a line's indentation as two spaces. */
export const asSpaces = (d: TextDoc): TextDoc =>
  reindent(
    d,
    (ws) => ws.replace(/\t/g, '  '),
    (ws, i) => i + (ws.slice(0, i).match(/\t/g)?.length ?? 0),
  );

/** Whether a document is indented with tabs already, and so is taken as written. */
export const tabbed = (text: string): boolean => /^ *\t/m.test(text);

/** Each end of a document's selection: its offset, and its line and column. */
function ends(d: TextDoc): { offset: number; line: string; col: number }[] {
  if (!d.sel) return [];
  return [d.sel.anchor, d.sel.head].map((offset) => {
    const start = d.text.lastIndexOf('\n', offset - 1) + 1;
    const end = d.text.indexOf('\n', offset);
    return { offset, line: d.text.slice(start, end < 0 ? undefined : end), col: offset - start };
  });
}

/**
 * A list item's line: where its marker ends (and the space after it, or `spaces` all of them), and
 * where its text starts (after a task's checkbox).
 */
function item(line: string, spaces = false): { marker: number; text: number } | null {
  const m = (spaces ? /^[ \t]*(?:[-*+]|\d{1,9}[.)])(?: +|$)/ : /^[ \t]*(?:[-*+]|\d{1,9}[.)])(?: |$)/).exec(line);
  if (!m) return null;
  const box = /^\[[ xX]\](?: |$)/.exec(line.slice(m[0].length));
  return { marker: m[0].length, text: m[0].length + (box?.[0].length ?? 0) };
}

/** Why a document indented with spaces can't be loaded as tabs: an end of its selection is between two of them. */
function splitsIndent(d: TextDoc): string | undefined {
  if (tabbed(d.text)) return undefined;
  for (const { line, col } of ends(d)) if (col < /^ */.exec(line)![0].length && col & 1) return 'a caret inside two spaces of indentation';
  return undefined;
}

/** Why Live Preview won't keep a caret where a document has it: the frontmatter is shown as properties. */
function inFrontmatter(d: TextDoc): string | undefined {
  const frontmatter = /^---\n[\s\S]*?\n---(?:\n|$)/.exec(d.text)?.[0].length ?? 0;
  return ends(d).some((e) => e.offset < frontmatter) ? 'a caret in the frontmatter (Live Preview shows it as properties)' : undefined;
}

/**
 * Bare Obsidian's `holds` for a caret in a task's checkbox, between the marker and the checkbox's
 * end: Live Preview draws the checkbox, and the caret goes to the line's start (a plugin may keep it).
 */
export function inCheckbox(d: TextDoc): string | undefined {
  for (const { line, col } of ends(d)) {
    const it = item(line);
    if (it && col >= it.marker && col < it.text) return "a caret in a task's checkbox (Live Preview draws it)";
  }
  return undefined;
}

/**
 * A plugin's `holds` for a caret it moves to an item's text start: one before it, at the line's start
 * or in the marker. The marker ends after its space, or (`spaces`) all the spaces after it; and
 * (`checkbox`) the text starts after a task's checkbox.
 */
export const keepsCaretOnText =
  (plugin: string, { spaces = false, checkbox = false } = {}) =>
  (doc: TextDoc): string | undefined => {
    for (const { line, col } of ends(doc)) {
      const it = item(line, spaces);
      if (it && col < (checkbox ? it.text : it.marker)) return `a caret before an item's text (${plugin} keeps it on the text)`;
    }
    return undefined;
  };

// ------------------------------------------------------------------ the app

/** What obsidian-launcher downloads (the app, the installer, plugins), shared by every setup: `.sxs/obsidian/files/`, its lock beside it. */
const files = join(cacheDir, 'obsidian', 'files');
/** A setup's own: its lock, log and vault, `.sxs/<setup>/`. */
const setupDir = (profile: Profile): string => join(cacheDir, profile.name);
/** The versions a launch resolved, for `open` to report. */
let launched: { app: string; installer: string } | undefined;

/** Notes are numbered within a launch, so each test's note is new. */
let notes = 0;
/** The test's buffer is loaded with its spaces as tabs, and is read back so. */
let retabbed = false;

export function obsidianDriver(profile: Profile): Driver {
  const hotkeys: Record<string, readonly Hotkey[]> = {
    // "Move line up" and "Move line down" have no hotkey out of the box
    'editor:swap-line-up': [{ modifiers: ['Alt'], key: 'ArrowUp' }],
    'editor:swap-line-down': [{ modifiers: ['Alt'], key: 'ArrowDown' }],
    ...profile.hotkeys,
  };
  return {
    name: profile.name,
    title: profile.title,
    url: 'app://obsidian.md/',
    model: 'text',
    keys: {
      enter: 'Enter',
      shiftEnter: 'Shift+Enter',
      indent: 'Tab',
      outdent: 'Shift+Tab',
      deleteContentBackward: 'Backspace',
      deleteContentForward: 'Delete',
      moveSubtreeUp: 'Alt+ArrowUp',
      moveSubtreeDown: 'Alt+ArrowDown',
      // CodeMirror binds "delete line boundary backward" on a Mac only (Cmd-Backspace)
      deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
      pasteStructured: 'Control+v',
      pastePlain: 'Control+Shift+v',
      undo: 'Control+z',
      redo: 'Control+Shift+z',
      ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
      ...profile.keys,
    },
    // bare Obsidian (measured): the caret stays with the text on Enter at an item's start, Backspace
    // after a checkbox deletes a character, Delete before a blank line deletes it, and Enter on an
    // empty item outdents it or leaves the list wherever it is
    behaves: { flavor: 'obsidian', enterAtTextStart: 'stay', taskEditing: 'text', deleteAtGap: 'gap', enterOnEmptyItem: 'outdent', ...profile.behaves },
    holds(doc) {
      const d = doc as TextDoc;
      // CodeMirror keeps line breaks as LF
      if (d.text.includes('\r')) return 'CR line endings';
      return splitsIndent(d) ?? (profile.mode === 'live-preview' ? inFrontmatter(d) : undefined) ?? profile.holds?.(d);
    },

    async launch({ headed, say }) {
      const dir = setupDir(profile);
      mkdirSync(dir, { recursive: true });
      // the setup is this run's until it stops, or exits some other way
      // a second run of the setup stops rather than rewrite the vault under the first
      const unlock = await takeLock(join(dir, `${profile.name}.lock`), false, profile.name);
      process.once('exit', unlock);
      const log = join(dir, 'obsidian.log');
      ensureAptInstalled('Obsidian', ELECTRON_LIBRARIES, say);
      const xvfb = headed && process.env.DISPLAY ? null : await startXvfb(say);
      if (xvfb) process.once('exit', () => xvfb.proc.kill());
      // the vault, written anew for each launch
      const vault = join(dir, 'vault');
      rmSync(vault, { recursive: true, force: true });
      mkdirSync(join(vault, '.obsidian'), { recursive: true });
      writeFileSync(join(vault, '.obsidian', 'app.json'), JSON.stringify({ useTab: true, livePreview: profile.mode === 'live-preview', ...profile.appConfig }, null, 2));
      writeFileSync(join(vault, '.obsidian', 'hotkeys.json'), JSON.stringify(hotkeys, null, 2));
      for (const [id, data] of Object.entries(profile.pluginData ?? {})) {
        mkdirSync(join(vault, '.obsidian', 'plugins', id), { recursive: true });
        writeFileSync(join(vault, '.obsidian', 'plugins', id, 'data.json'), JSON.stringify(data, null, 2));
      }

      mkdirSync(files, { recursive: true });
      const launcher = new ObsidianLauncher({ cacheDir: files });
      // the downloads (the app, the installer, plugins) are fetched by the launcher, not through the
      // proxy: setups starting at once take turns, so a cold cache downloads each once
      const downloaded = await takeLock(`${files}.lock`, true, "Obsidian's downloads");
      process.once('exit', downloaded);
      const [app, installer] = await launcher.resolveVersion(process.env.OBSIDIAN_VERSION?.trim() || 'latest', 'latest').catch((e) => {
        downloaded();
        throw e;
      });
      launched = { app, installer };
      notes = 0;
      const port = await freePort();
      const out = openSync(log, 'w');
      const { proc, configDir } = await launcher.launch({
        appVersion: app,
        installerVersion: installer,
        vault,
        plugins: [...(profile.plugins ?? [])],
        args: [
          `--remote-debugging-port=${port}`,
          '--no-sandbox',
          // /dev/shm is small in a container (64 MB), and several of them at once crash a renderer there
          '--disable-dev-shm-usage',
          // offline: nothing it fetches (an update, a plugin list) changes what is tested
          '--proxy-server=127.0.0.1:9',
          '--disable-renderer-backgrounding',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
        ],
        spawnOptions: { detached: true, stdio: ['ignore', out, out], env: { ...process.env, ...(xvfb && { DISPLAY: xvfb.display }) } },
      }).finally(downloaded);
      closeSync(out);
      let stopped = false;
      const stop = (): void => {
        if (stopped) return;
        stopped = true;
        try {
          process.kill(-proc.pid!);
        } catch {}
        xvfb?.proc.kill();
        unlock();
        // the app may still be writing its configuration as it goes, and what is left is only clutter
        try {
          rmSync(configDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
        } catch {}
      };
      process.once('exit', stop);
      /** Stops the app, once it has had a moment to exit. */
      const quit = async (): Promise<void> => {
        try {
          process.kill(-proc.pid!);
        } catch {}
        for (let i = 0; i < 50 && proc.exitCode === null && proc.signalCode === null; i++) await sleep(100);
        stop();
      };
      const tail = (): string => readFileSync(log, 'utf8').split('\n').slice(-20).join('\n');
      try {
        for (let t0 = Date.now(); ; ) {
          if (proc.exitCode !== null) throw new Error(`Obsidian exited (${proc.exitCode}):\n${tail()}`);
          if (await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok, () => false)) break;
          if (Date.now() - t0 > 60000) throw new Error(`Obsidian's debugging port didn't answer in 60s:\n${tail()}`);
          await sleep(100);
        }
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        let page: Page | undefined;
        for (let t0 = Date.now(); !page && Date.now() - t0 < 30000; await sleep(100)) page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().startsWith('app://obsidian.md/'));
        if (!page) throw new Error(`Obsidian opened no window:\n${tail()}`);
        say(`started Obsidian ${app} (installer ${installer})${xvfb ? ` on Xvfb ${xvfb.display}` : ''}, log ${log}`);
        return {
          page,
          reused: false,
          release: async () => {
            await browser.close().catch(() => {});
            await quit();
          },
        };
      } catch (e) {
        stop();
        throw e;
      }
    },

    async open(page: Page) {
      // the window was loaded before the runner could add its init script
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => (window as any).app?.workspace?.layoutReady, null, { timeout: 60000 });
      const settled = await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 300, timeout: 20000 }));
      if (settled.timedOut) throw new Error(`Obsidian didn't settle after loading: ${settled.pending}`);
      // every plugin the vault enables, loaded: its id and version
      const plugins: { id: string; version?: string; loaded: boolean }[] = await page.evaluate(() => {
        const p = (window as any).app.plugins;
        return [...p.enabledPlugins].map((id: string) => ({ id, version: p.manifests[id]?.version, loaded: !!p.plugins[id]?._loaded }));
      });
      const missing = plugins.filter((p) => !p.loaded).map((p) => p.id);
      if (missing.length) throw new Error(`Obsidian didn't load ${missing.join(', ')}: see ${join(setupDir(profile), 'obsidian.log')}`);
      // ready once a key does what it should: Tab indents
      await this.load(page, { text: '- a\n- b', sel: { anchor: 7, head: 7 } });
      await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
      await page.keyboard.press('Tab');
      await page.evaluate(() => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 100, timeout: 5000 }));
      const got = (await this.read(page)) as TextDoc;
      if (got.text !== '- a\n  - b') throw new Error(`Obsidian's keys didn't come up: Tab made ${JSON.stringify(got.text)}`);
      // the editor in the setup's editing mode: Source mode is the editing view's `source`
      const source = await page.evaluate(() => (window as any).app.workspace.activeLeaf?.view?.getState?.()?.source);
      if (source !== (profile.mode === 'source')) throw new Error(`Obsidian's editor isn't in ${profile.mode === 'source' ? 'Source mode' : 'Live Preview'} (source: ${source})`);
      return [`${launched!.app} (installer ${launched!.installer})`, ...plugins.map((p) => `${p.id} ${p.version}`)].join(', ');
    },

    async load(page: Page, doc) {
      const d = doc as TextDoc;
      retabbed = !tabbed(d.text);
      const { text, sel } = retabbed ? asTabs(d) : d;
      await page.evaluate(
        async ({ path, text, sel }) => {
          const app = (window as any).app;
          const before = app.workspace.getActiveFile();
          const file = await app.vault.create(path, text);
          await app.workspace.getLeaf(false).openFile(file, { active: true });
          const editor = () => app.workspace.activeEditor?.editor;
          const opened = () => app.workspace.getActiveFile()?.path === path && editor()?.getValue() === text;
          for (let i = 0; i < 300 && !opened(); i++) await new Promise((r) => setTimeout(r, 10));
          if (!opened()) throw new Error(`the test's note didn't open (at ${app.workspace.getActiveFile()?.path})`);
          // the last test's note goes once this one is open in its place
          if (before && before.path !== path) await app.vault.delete(before, true);
          const cm = editor().cm;
          cm.dispatch({ selection: sel ?? { anchor: 0 } });
          cm.focus();
        },
        { path: `ourus-${++notes}.md`, text, sel },
      );
    },

    async read(page: Page) {
      const got: TextDoc = await page.evaluate(() => {
        const cm = (window as any).app.workspace.activeEditor.editor.cm;
        const { anchor, head } = cm.state.selection.main;
        return { text: cm.state.doc.toString() as string, sel: cm.hasFocus ? { anchor, head } : null };
      });
      return retabbed ? asSpaces(got) : got;
    },
  };
}
