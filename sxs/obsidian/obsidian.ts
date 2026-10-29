// Obsidian, the desktop app (see obsidian/README.md), as a driver to be made for each setup of it: bare,
// or with plugins (`obsidianDriver`). It is an Electron app, not a web page, so the driver starts it
// itself (`Driver.launch`): obsidian-launcher downloads the version asked for into
// `.sxs/obsidian/files/`, and a worker opens a vault written for the run (its plugins installed) as a
// window of an Obsidian of the driver's pool, which every setup shares as apps share the pool's
// browsers (`obsidian/<n>/` in `stateDir`, `leaseInstance`); the runner drives the window over the DevTools
// protocol. Under Linux without a display an instance gets an Xvfb of its own; it runs offline.
//
// A Markdown editor (CodeMirror 6): the `text` model. Each test gets a note of its
// own, opened in the editor so that it starts with no history to undo; the caret is placed through
// CodeMirror, and the actions are Obsidian's keys on Linux, in the setup's editing mode: Live Preview
// (its default) or Source mode.
//
// Obsidian indents with a tab, or with four spaces when told not to use tabs; never two, which the
// spec draws. It runs with tabs, and a test indented with spaces as drawn has each two spaces of
// its lines' indentation loaded as a tab and read back as two spaces (`asTabs`, `asSpaces`). A test
// whose starting buffer is already indented with tabs, or that tabs wouldn't give back as written
// (`retabs`), is taken as written.

import { spawn } from 'node:child_process';
import { appendFileSync, closeSync, copyFileSync, linkSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import ObsidianLauncher, { type PluginEntry } from 'obsidian-launcher';
import { chromium, type BrowserContext, type Page } from 'playwright-core';
import { recordServer, serverPid, stopServer } from '../lib/browser.ts';
import { alive, freePort, sleep, startXvfb, takeLock } from '../lib/desktop.ts';
import { record, recordDir } from '../lib/records.ts';
import { perPage, type Driver, type Drop } from '../lib/driver.ts';
import { gesture } from '../lib/drag.ts';
import { Unsupported } from '../lib/block.ts';
import { ensureAptInstalled, type Need } from '../lib/system.ts';
import { cacheDir, stateDir } from '../proxy.ts';
import { asSpaces, asTabs, retabs, tabbed } from '../lib/tabs.ts';
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
  /** In `sxs.md`'s tables: `OB`. */
  readonly shortId: string;
  /** The directory name: `obsidian`. */
  readonly longId: string;
  /** In reports: `Obsidian`. */
  readonly displayName: string;
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
  /**
   * How a node is dragged, where a plugin drags one: Outliner's drag of an item by its bullet
   * (`outlinerDrop`), true-outliner's of any node by its mark (`trueOutlinerDrop`).
   */
  readonly drag?: 'outliner' | 'true-outliner';
  /**
   * Zooms into a node, where a plugin does (`Driver.zooms`), loaded by the plugin's own zoom-in command at
   * the root's row: true-outliner's, read from its anchor (`zoomAnchor`); obsidian-zoom's, read from
   * its API (`ObsidianZoomPlugin.getZoomRange`, the zoomed range's first line).
   */
  readonly zoom?: 'true-outliner' | 'obsidian-zoom';
}

// ------------------------------------------------------------------ indentation

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

/** Why a document indented with spaces can't be loaded as tabs: an end of its selection is inside what becomes a tab. */
function splitsIndent(d: TextDoc): string | undefined {
  if (tabbed(d.text)) return undefined;
  const there = asTabs(d);
  const back = asSpaces(there);
  // (a text the tabs don't give back is loaded as written: `retabs`)
  if (back.text !== d.text) return undefined;
  // a caret inside a tab's spaces lands at its start: loaded and read back, it moved
  if (d.sel && JSON.stringify(back.sel) !== JSON.stringify(d.sel)) return 'caret inside the spaces of a tab of indentation';
  return undefined;
}

/** Why Live Preview won't keep a caret where a document has it: the frontmatter is shown as properties. */
function inFrontmatter(d: TextDoc): string | undefined {
  const frontmatter = /^---\n[\s\S]*?\n---(?:\n|$)/.exec(d.text)?.[0].length ?? 0;
  return ends(d).some((e) => e.offset < frontmatter) ? 'caret in the frontmatter (Live Preview shows it as properties)' : undefined;
}

/**
 * Why Live Preview won't keep a caret where a document has it: in a table, which it draws as a table
 * of its own, a caret goes into a cell's editor (the note's loses the focus), and the table is padded.
 */
function inTable(d: TextDoc): string | undefined {
  const lines = d.text.split('\n');
  const delimiter = /^ *\|? *:?-+:? *(\| *:?-+:? *)*\|? *$/;
  for (const { offset } of ends(d)) {
    const at = d.text.slice(0, offset).split('\n').length - 1;
    let from = at;
    while (from > 0 && lines[from - 1]!.trim()) from--;
    let to = at;
    while (to < lines.length - 1 && lines[to + 1]!.trim()) to++;
    if (lines[at]!.includes('|') && lines.slice(from, to + 1).some((l) => l.includes('|') && delimiter.test(l))) return 'caret in a table (Live Preview edits it in a table of its own)';
  }
  return undefined;
}

/**
 * Live Preview's `holds` for a caret it moves at inline code's backticks, outside code (a fence's and
 * its code's backticks it leaves alone): at a line's end right after a backtick (`` `` `` alone on a
 * line, Backtick15, Backtick17: the caret goes before the run), or right before a code span's closing
 * run (`a ``x┃`` b`, Backtick32: past it). Text after the run (`` ``┃print(1) ``) it holds.
 */
function atInlineCode(d: TextDoc): string | undefined {
  const lines = d.text.split('\n');
  // the lines of fenced code, fences included
  const code = new Set<number>();
  let fence: string | null = null;
  lines.forEach((l, i) => {
    const m = /^[ \t>]*(?:(?:[-*+]|\d+[.)])[ \t]+)?(`{3,}|~{3,})(.*)$/.exec(l);
    if (fence !== null) {
      code.add(i);
      if (m && m[1]![0] === fence[0] && m[1]!.length >= fence.length && !m[2]!.trim()) fence = null;
    } else if (m && !(m[1]![0] === '`' && m[2]!.includes('`'))) {
      code.add(i);
      fence = m[1]!;
    }
  });
  for (const { offset, line, col } of ends(d)) {
    if (code.has(d.text.slice(0, offset).split('\n').length - 1)) continue;
    const before = line.slice(0, col);
    const after = line.slice(col);
    if (before.endsWith('`') && after === '') return "caret right after a backtick at a line's end (Live Preview moves it before the run)";
    if (after.startsWith('`') && !before.endsWith('`') && before.includes('`')) return "caret before a code span's closing backticks (Live Preview moves it past them)";
  }
  return undefined;
}

/**
 * Bare Obsidian's `holds` for a caret in a task's checkbox, between the marker and the checkbox's
 * end: Live Preview draws the checkbox, and the caret goes to the line's start (a plugin may keep it).
 */
export function inCheckbox(d: TextDoc): string | undefined {
  for (const { line, col } of ends(d)) {
    const it = item(line);
    if (it && col >= it.marker && col < it.text) return "caret in a task's checkbox (Live Preview draws it)";
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
    // (a selection's end at a line's start is whole lines, which it keeps: true-outliner's covers)
    const whole = !!doc.sel && doc.sel.anchor !== doc.sel.head;
    for (const { line, col } of ends(doc)) {
      const it = item(line, spaces);
      if (it && col < (checkbox ? it.text : it.marker) && !(whole && col === 0)) return `caret before an item's text (${plugin} keeps it on the text)`;
    }
    return undefined;
  };

// ------------------------------------------------------------------ the app

/** What obsidian-launcher downloads (the app, the installer, plugins), shared by every setup: `.sxs/obsidian/files/`, its lock beside it. */
const files = join(cacheDir, 'obsidian', 'files');
const launcher = new ObsidianLauncher({ cacheDir: files });

/**
 * The versions to run (the app, the installer) and their downloads, resolved once a run. The downloads
 * are fetched by the launcher, not through the proxy: runs starting at once take turns, so a cold cache
 * downloads each once.
 */
let resolved: Promise<{ app: string; installer: string; appPath: string; installerPath: string }> | undefined;
const versions = (): NonNullable<typeof resolved> =>
  (resolved ??= (async () => {
    mkdirSync(files, { recursive: true });
    const unlock = await takeLock(record(`${files}.lock`), true, "Obsidian's downloads");
    try {
      const [app, installer] = await launcher.resolveVersion(process.env.OBSIDIAN_VERSION?.trim() || 'latest', 'latest');
      return { app, installer, appPath: await launcher.downloadApp(app), installerPath: await launcher.downloadInstaller(installer) };
    } finally {
      unlock();
    }
  })());

/**
 * Obsidian's instances, shared by every setup's runs as the pool's browsers are by apps': instance n in
 * `obsidian/<n>/` in `stateDir` (this container's; its downloads, `files/`, stay in `.sxs/`). One Obsidian opens any number of vaults, each in a window of its own (its own
 * `app`, settings and plugins); an instance has at most one window of each setup (its vault
 * `<n>/<setup>/`, written anew for each run), a run's at a time (`<setup>.lock`), and one clipboard its
 * windows share (`clipboard.lock`). Beside them its configuration directory (`config/`, Electron's
 * `--user-data-dir`), log, debugging port, versions, and pid (`server.pid`, so that `run.ts --stop`
 * stops it). Started detached on an Xvfb of its own (gone with it), and stopped once no run has a window
 * in it (`release`: an idle instance is some 95 tasks); its starter window (the vault chooser, which it
 * opens with no vault) keeps it up between one setup's window and the next.
 */
const pool = join(stateDir, 'obsidian');
const instanceDir = (n: number | string): string => join(pool, String(n));
/**
 * At most this many instances, each with a window of each setup at most: a setup's run has as many
 * workers at once (`parallel`). 4 (the pool, full, some 800 tasks: an instance some 95, a window 25), or
 * as `OURUS_SXS_OBSIDIANS` says: 2 in a run of several apps with apps of the pool's browsers among
 * them (`run.ts`), the two pools, full, under the container's cap on tasks (2048).
 */
const obsidians = (): number => Number(process.env.OURUS_SXS_OBSIDIANS) || 4;
const serverOf = (n: number): string => `obsidian/${n}`;

/** Electron's flags. */
const FLAGS = [
  '--no-sandbox',
  // /dev/shm is small in a container (64 MB), and several of them at once crash a renderer there
  '--disable-dev-shm-usage',
  // offline: nothing it fetches (an update, a plugin list) changes what is tested
  '--proxy-server=127.0.0.1:9',
  '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
];

/** An instance a worker uses: its number (or `headed`), directory and debugging port, and its release. */
interface Instance {
  n: number | 'headed';
  dir: string;
  port: number;
  release(): Promise<void>;
}

/** Whether a run has a window in instance n (a setup's lock in its directory, its holder running). */
function held(n: number): boolean {
  const locks = recordDir(instanceDir(n));
  return readdirSync(locks)
    .filter((f) => f.endsWith('.lock') && f !== 'clipboard.lock')
    .some((f) => {
      try {
        return alive(Number(readFileSync(join(locks, f), 'utf8')));
      } catch {
        return false;
      }
    });
}

/** Instance n's debugging port, if it runs and answers there. */
async function portOf(n: number): Promise<number | null> {
  if (!serverPid(serverOf(n))) return null;
  try {
    const port = Number(readFileSync(record(join(instanceDir(n), 'port')), 'utf8'));
    return (await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(5000) }).then((r) => r.ok)) ? port : null;
  } catch {
    return null;
  }
}

/** Starts an instance in `dir`, detached, on `display` (else an Xvfb of its own), once its debugging port answers. */
async function startInstance(dir: string, display: string | undefined, say: (line: string) => void): Promise<{ pid: number; port: number }> {
  const v = await versions();
  const config = join(dir, 'config');
  rmSync(config, { recursive: true, force: true });
  mkdirSync(config, { recursive: true });
  // no updates; no vault, so that it opens its starter window
  writeFileSync(join(config, 'obsidian.json'), JSON.stringify({ updateDisabled: true }));
  // the app's bundle, which the installer loads from its configuration directory
  try {
    linkSync(v.appPath, join(config, basename(v.appPath)));
  } catch {
    copyFileSync(v.appPath, join(config, basename(v.appPath)));
  }
  const xvfb = display ? null : await startXvfb(say, { detached: true });
  const port = await freePort();
  const log = join(dir, 'obsidian.log');
  const out = openSync(log, 'w');
  const proc = spawn(v.installerPath, [`--user-data-dir=${config}`, `--remote-debugging-port=${port}`, ...FLAGS], {
    detached: true,
    stdio: ['ignore', out, out],
    env: { ...process.env, DISPLAY: display ?? xvfb!.display },
  });
  closeSync(out);
  proc.unref();
  const tail = (): string => readFileSync(log, 'utf8').split('\n').slice(-20).join('\n');
  try {
    for (const t0 = Date.now(); ; await sleep(100)) {
      if (proc.exitCode !== null) throw new Error(`Obsidian exited (${proc.exitCode}):\n${tail()}`);
      if (await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok, () => false)) break;
      if (Date.now() - t0 > 60000) throw new Error(`Obsidian's debugging port didn't answer in 60s:\n${tail()}`);
    }
  } catch (e) {
    try {
      process.kill(-proc.pid!);
    } catch {}
    xvfb?.proc.kill();
    throw e;
  }
  writeFileSync(record(join(dir, 'port')), String(port));
  writeFileSync(record(join(dir, 'version')), `${v.app} ${v.installer}`);
  const name = `${v.app}${v.installer === v.app ? '' : ` (installer ${v.installer})`}`;
  say(`started Obsidian ${name} in ${dir}${xvfb ? ` on Xvfb ${xvfb.display}` : ''} (pid ${proc.pid}, log ${log})`);
  return { pid: proc.pid!, port };
}

/**
 * An instance for a worker of `setup`'s run, held for it (`<setup>.lock`) until released: a running
 * instance of the versions to run with no window of the setup's in use, else one started at the first
 * number none runs at while fewer than `obsidians()` run (one running that doesn't answer is left alone:
 * `--stop` stops it), else, the pool full, the first that has room, waited for until `gone` says the
 * worker is no longer wanted (null). Taken under the pool's lock, one worker at a time.
 */
async function leaseInstance(setup: string, say: (line: string) => void, gone?: () => boolean): Promise<Instance | null> {
  for (const t0 = Date.now(); ; await sleep(1000)) {
    const got = await tryInstance(setup, say);
    if (got) return got;
    if (gone?.()) return null;
    if (Date.now() - t0 < 1000) say(`Obsidian's ${obsidians()} instances have no room for ${setup}: waiting for a run to end`);
  }
}

/** One look at the pool for `leaseInstance`: an instance, or null if the pool is full. */
async function tryInstance(setup: string, say: (line: string) => void): Promise<Instance | null> {
  mkdirSync(pool, { recursive: true });
  const { app, installer } = await versions();
  const unlockPool = await takeLock(record(join(pool, 'pool.lock')), true, "Obsidian's pool");
  const hold = async (n: number): Promise<(() => void) | null> =>
    takeLock(record(join(instanceDir(n), `${setup}.lock`)), false, `${setup}'s window in Obsidian ${n}`).catch((e: Error) => {
      if (/^another run has/.test(e.message)) return null;
      throw e;
    });
  const instance = (n: number, port: number, unlock: () => void): Instance => {
    process.once('exit', unlock);
    const release = async (): Promise<void> => {
      process.off('exit', unlock);
      unlock();
      // the instance stopped with the last window a run had in it, under the pool's lock (a worker
      // taking it then starts another)
      const unlockPool = await takeLock(record(join(pool, 'pool.lock')), true, "Obsidian's pool");
      try {
        if (!held(n)) await stopServer(serverOf(n), say);
      } finally {
        unlockPool();
      }
    };
    return { n, dir: instanceDir(n), port, release };
  };
  try {
    // the instances with a directory or a record (one may run with its directory cleaned away)
    const numbers = [...new Set([...readdirSync(pool), ...readdirSync(recordDir(pool))].filter((d) => /^\d+$/.test(d)).map(Number))].sort((a, b) => a - b);
    for (const n of numbers) {
      const port = await portOf(n);
      let version = '';
      try {
        version = readFileSync(record(join(instanceDir(n), 'version')), 'utf8');
      } catch {}
      if (!port || version !== `${app} ${installer}`) continue;
      // one past the pool's size (a run with a larger one left it): stopped once no run holds it
      if (n >= obsidians()) {
        if (!held(n)) await stopServer(serverOf(n), say);
        continue;
      }
      const unlock = await hold(n);
      if (unlock) return instance(n, port, unlock);
    }
    if (numbers.filter((n) => serverPid(serverOf(n))).length >= obsidians()) return null;
    for (let n = 0; ; n++) {
      if (serverPid(serverOf(n))) continue;
      mkdirSync(instanceDir(n), { recursive: true });
      const unlock = await hold(n);
      if (!unlock) continue;
      try {
        const { pid, port } = await startInstance(instanceDir(n), undefined, say);
        recordServer(serverOf(n), pid);
        return instance(n, port, unlock);
      } catch (e) {
        unlock();
        throw e;
      }
    }
  } finally {
    unlockPool();
  }
}

/** An instance of the run's own on the display it has (`--headed`), stopped at its release. */
async function ownInstance(say: (line: string) => void): Promise<Instance> {
  const dir = instanceDir('headed');
  mkdirSync(dir, { recursive: true });
  const unlock = await takeLock(record(join(dir, 'launch.lock')), false, 'the headed Obsidian');
  const { pid, port } = await startInstance(dir, process.env.DISPLAY, say);
  const stop = (): void => {
    try {
      process.kill(-pid);
    } catch {}
    unlock();
  };
  process.once('exit', stop);
  return { n: 'headed', dir, port, release: async () => (process.off('exit', stop), stop()) };
}

/** The vault a window of an instance has open, if it has one (the starter window has none). */
const vaultOf = (page: Page): Promise<string | undefined> => page.evaluate(() => (window as any).app?.vault?.adapter?.basePath as string | undefined).catch(() => undefined);

/**
 * Opens `vault` in an instance (from its starter window, else any other: its vault-open message) and
 * returns its window. Its plugins are trusted, as a user does once for a vault: else Obsidian starts a
 * vault it hasn't seen in restricted mode, its community plugins off (the `enable-plugin-<vault id>`
 * flag in local storage, which the instance's windows share). The id is the instance's, given as the
 * vault is first opened there, so the flag is set before the window loads where the vault was opened
 * before, and right after its opening where it wasn't, the window's first load perhaps too early for it:
 * `open` reloads the window, and checks that every plugin loaded. The app's version is set as seen too
 * (no changelog).
 */
async function openVault(context: BrowserContext, vault: string, version: string): Promise<Page> {
  const windows = context.pages().filter((p) => p.url().startsWith('app://obsidian.md/'));
  windows.sort((a, b) => Number(b.url().endsWith('/starter.html')) - Number(a.url().endsWith('/starter.html')));
  let opened: unknown = 'no window to open it from';
  for (const w of windows) {
    opened = await w
      .evaluate(
        ({ path, version }) => {
          const ipc = (window as any).require('electron').ipcRenderer;
          const trust = (): boolean => {
            const id = Object.entries(ipc.sendSync('vault-list') as Record<string, { path: string }>).find(([, v]) => v.path === path)?.[0];
            if (id) localStorage.setItem(`enable-plugin-${id}`, 'true');
            return !!id;
          };
          localStorage.setItem('most-recently-installed-version', version);
          const known = trust();
          const result = ipc.sendSync('vault-open', path, false);
          if (!known) trust();
          return result;
        },
        { path: vault, version },
      )
      .catch((e: Error) => e.message);
    if (opened === true) break;
  }
  if (opened !== true) throw new Error(`Obsidian didn't open ${vault}: ${String(opened)}`);
  for (const t0 = Date.now(); Date.now() - t0 < 30000; await sleep(100)) for (const p of context.pages()) if ((await vaultOf(p)) === vault) return p;
  throw new Error(`Obsidian opened no window for ${vault}`);
}

/** Notes are numbered in the run, so each test's note is new (each worker has a vault of its own). */
let notes = 0;
/**
 * A worker's: its instance's log, whether its test's buffer was loaded with its spaces as tabs, to be
 * read back so, and whether it was loaded with a view (folds, a zoom), which is read back then alone.
 */
const pageState = perPage(() => ({ log: '', retabbed: false, viewed: false }));

/**
 * The line true-outliner's zoom root starts on, or null where it isn't zoomed, read in the page: its
 * anchor's state field (`zoomAnchorField`, the root's first line's offset), found among the editor
 * state's fields by its update, the plugin's modules being its own.
 */
function zoomAnchor(cm: any): number | null {
  const fields: any[] = [];
  const seen = new Set<unknown>();
  const walk = (e: any): void => {
    if (!e || typeof e !== 'object' || seen.has(e)) return;
    seen.add(e);
    if (Array.isArray(e)) return e.forEach(walk);
    if ('createF' in e && 'updateF' in e) return void fields.push(e);
    if ('inner' in e) walk(e.inner);
    if ('extension' in e && e.extension !== e) walk(e.extension);
  };
  walk(cm.state.config.base);
  for (const inner of cm.state.config.compartments?.values?.() ?? []) walk(inner);
  const field = fields.find((f) => /effect\.is\(zoomTo\)\) return effect\.value/.test(String(f.updateF)));
  if (!field) throw new Error("true-outliner's zoom anchor field isn't in the editor's state");
  const anchor = cm.state.field(field, false);
  return anchor === null || anchor === undefined ? null : cm.state.doc.lineAt(anchor).number - 1;
}

export function obsidianDriver(profile: Profile): Driver {
  const hotkeys: Record<string, readonly Hotkey[]> = {
    // "Move line up" and "Move line down" have no hotkey out of the box
    'editor:swap-line-up': [{ modifiers: ['Alt'], key: 'ArrowUp' }],
    'editor:swap-line-down': [{ modifiers: ['Alt'], key: 'ArrowDown' }],
    // "Toggle fold" has no hotkey out of the box
    'editor:toggle-fold': [{ modifiers: ['Mod', 'Alt'], key: 'F' }],
    ...profile.hotkeys,
  };
  return {
    shortId: profile.shortId,
    longId: profile.longId,
    displayName: profile.displayName,
    url: 'app://obsidian.md/',
    // a window of its own for each worker, in an instance of the pool (`leaseInstance`), one a setup each
    get parallel() {
      return obsidians();
    },
    model: 'text',
    // CodeMirror's folds, Obsidian's own (by indentation and headings, or a plugin's), loaded and read
    // through its edit view (`getFoldInfo`), by line
    folds: true,
    ...(profile.zoom && { zooms: true }),
    keys: {
      toggleFold: 'Control+Alt+f',
      enter: 'Enter',
      shiftEnter: 'Shift+Enter',
      indent: 'Tab',
      outdent: 'Shift+Tab',
      deleteContentBackward: 'Backspace',
      deleteContentForward: 'Delete',
      moveSubtreeUp: 'Alt+ArrowUp',
      moveSubtreeDown: 'Alt+ArrowDown',
      // the selection commands (spec/select.md): Ctrl-A, Shift-Down and Shift-Up as the app has them
      expandSelection: 'Control+a',
      selectNodeDown: 'Shift+ArrowDown',
      selectNodeUp: 'Shift+ArrowUp',
      // CodeMirror binds "delete line boundary backward" on a Mac only (Cmd-Backspace)
      deleteSoftLineBackward: ['Shift+Home', 'Backspace'],
      copy: 'Control+c',
      cut: 'Control+x',
      paste: 'Control+v',
      pastePlain: 'Control+Shift+v',
      undo: 'Control+z',
      redo: 'Control+Shift+z',
      ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, `Shift+${k}`]])),
      ...profile.keys,
    },
    // bare Obsidian (measured): the caret stays with the text on Enter at an item's start, Backspace
    // after a checkbox deletes a character, Delete before a blank line deletes it, and Enter on an
    // empty item outdents it or leaves the list wherever it is; a typed fence is closed, and inline
    // backticks are paired ("Auto pair Markdown syntax", on by default)
    behaves: {
      // a quote is text, its `>`s characters edited on its lines: of `quotes`' values the one its runs agree with most (166 quote cases a setup)
      quotes: 'atom',
      flavor: 'obsidian',
      enterSplitSpace: 'drop',
      enterOnEmptyItem: 'outdent',
      enterAtTextStart: 'stay',
      taskEditing: 'text',
      closeBackticks: 'all',
      copyAtCaret: 'host',
      pastePlainLines: 'host',
      ...profile.behaves,
    },
    holds(doc) {
      const d = doc as TextDoc;
      // CodeMirror keeps line breaks as LF
      if (d.text.includes('\r')) return 'CR line endings';
      return splitsIndent(d) ?? (profile.mode === 'live-preview' ? (inFrontmatter(d) ?? inTable(d) ?? atInlineCode(d)) : undefined) ?? profile.holds?.(d);
    },

    async launch({ headed, say, gone }) {
      ensureAptInstalled('Obsidian', ELECTRON_LIBRARIES, say);
      // one run of the setup at a time is the runner's (its lock); each of its workers a window in an
      // instance of the pool of its own, or the run's own on its display
      const inst = headed && process.env.DISPLAY ? await ownInstance(say) : await leaseInstance(profile.longId, say, gone);
      if (!inst) return null;
      try {
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:${inst.port}`);
        const context = browser.contexts()[0]!;
        const vault = join(inst.dir, profile.longId);
        // the setup's window an earlier run left open (one that stopped some other way), closed first
        for (const p of context.pages()) if ((await vaultOf(p)) === vault) await p.evaluate(() => window.close()).catch(() => {});
        // the vault, written anew for each run
        rmSync(vault, { recursive: true, force: true });
        mkdirSync(join(vault, '.obsidian'), { recursive: true });
        writeFileSync(join(vault, '.obsidian', 'app.json'), JSON.stringify({ useTab: true, livePreview: profile.mode === 'live-preview', ...profile.appConfig }, null, 2));
        writeFileSync(join(vault, '.obsidian', 'hotkeys.json'), JSON.stringify(hotkeys, null, 2));
        for (const [id, data] of Object.entries(profile.pluginData ?? {})) {
          mkdirSync(join(vault, '.obsidian', 'plugins', id), { recursive: true });
          writeFileSync(join(vault, '.obsidian', 'plugins', id, 'data.json'), JSON.stringify(data, null, 2));
        }
        const downloaded = await takeLock(record(`${files}.lock`), true, "Obsidian's downloads");
        await launcher.installPlugins(vault, [...(profile.plugins ?? [])]).finally(downloaded);
        const page = await openVault(context, vault, (await versions()).app);
        pageState(page).log = join(inst.dir, 'obsidian.log');
        say(`opened ${vault} in Obsidian ${inst.n}`);
        return {
          page,
          reused: false,
          // the instance's, which its other setups' windows share
          clipboard: () => takeLock(record(join(inst.dir, 'clipboard.lock')), true, `Obsidian ${inst.n}'s clipboard`),
          release: async () => {
            await page.evaluate(() => window.close()).catch(() => {});
            await browser.close().catch(() => {});
            await inst.release();
          },
        };
      } catch (e) {
        await inst.release();
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
      if (missing.length) throw new Error(`Obsidian didn't load ${missing.join(', ')}: see ${pageState(page).log}`);
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
      // the app (its bundle) and the installer (the Electron it runs in) are versioned apart: the
      // installer named only where it isn't the app's
      const { app, installer } = await versions();
      return [installer === app ? app : `${app} (installer ${installer})`, ...plugins.map((p) => `${p.id} ${p.version}`)].join(', ');
    },

    async load(page: Page, doc) {
      const d = doc as TextDoc;
      const state = pageState(page);
      state.retabbed = retabs(d);
      const { text, sel } = state.retabbed ? asTabs(d) : d;
      await page.evaluate(
        async ({ path, text, sel, view, zoom }) => {
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
          // its folds, each folded as Obsidian folds the row at the caret (the last first: a fold inside
          // another before it), then its zoom by the plugin's own command at the root's row
          const settle = (): Promise<unknown> => (window as any).__ourusIdle.wait({ shortTimer: 300, quiet: 50, timeout: 3000 });
          for (const row of [...(view?.folded ?? [])].sort((a, b) => b - a)) {
            cm.dispatch({ selection: { anchor: cm.state.doc.line(row + 1).to } });
            app.commands.executeCommandById('editor:toggle-fold');
            await settle();
          }
          if (view && view.zoom !== null) {
            cm.dispatch({ selection: { anchor: cm.state.doc.line(view.zoom + 1).to } });
            if (!app.commands.executeCommandById(`${zoom}:zoom-in`)) throw new Error(`${zoom} has no zoom-in command`);
            await settle();
          }
          cm.dispatch({ selection: sel ?? { anchor: 0 } });
          cm.focus();
        },
        { path: `ourus-${++notes}.md`, text, sel, view: d.view ?? null, zoom: profile.zoom ?? null },
      );
      state.viewed = !!d.view;
    },

    ...(profile.drag && { drops: ['moveSubtree'] as const, drop: profile.drag === 'outliner' ? outlinerDrop : trueOutlinerDrop }),

    async read(page: Page) {
      const { viewed } = pageState(page);
      const { doc: got, lost } = await page.evaluate(({ viewed, zoomAnchor, zoom }) => {
        const cm = (window as any).app.workspace.activeEditor.editor.cm;
        // the folds by their rows, Obsidian's (its edit view's), and the zoom: a case loaded with a view
        const view = viewed
          ? {
              folded: ((window as any).app.workspace.activeLeaf.view.currentMode.getFoldInfo()?.folds ?? []).map((f: { from: number }) => f.from) as number[],
              zoom:
                zoom === 'obsidian-zoom'
                  ? ((window as any).ObsidianZoomPlugin.getZoomRange((window as any).app.workspace.activeEditor.editor)?.from.line ?? null)
                  : zoom
                    ? (new Function(`return ${zoomAnchor}`)() as (cm: unknown) => number | null)(cm)
                    : null,
            }
          : undefined;
        const { anchor, head } = cm.state.selection.main;
        // the caret is the editor's where its content has the page's focus, whether or not the
        // window has the system's (CodeMirror's `hasFocus` wants both: a window of the shared
        // instance can lose it a moment under load); another element's focus (the note's title) is no caret.
        // true-outliner blurs the editor while its selection covers whole nodes (its block selection,
        // marked by a class on the editor), the selection still the editor's.
        const active = document.activeElement;
        const focused = cm.hasFocus || (!!active && cm.contentDOM.contains(active)) || cm.dom.classList.contains('to-decor-block-selecting');
        return {
          doc: { text: cm.state.doc.toString() as string, sel: focused ? { anchor, head } : null, ...(view && { view }) },
          lost: !cm.hasFocus && focused ? `window ${document.hasFocus() ? 'focused' : 'unfocused'}, ${document.visibilityState}` : null,
        };
      }, { viewed, zoomAnchor: zoomAnchor.toString(), zoom: profile.zoom ?? null });
      // a record of each read that only the page's focus kept a caret in: what took the window's
      if (lost) appendFileSync(join(dirname(pageState(page).log), 'focus.log'), `${new Date().toISOString()} ${profile.longId}: ${lost}\n`);
      // (a tab for an indentation moves no line: the view's rows stand)
      return pageState(page).retabbed ? { ...asSpaces(got), ...(got.view && { view: got.view }) } : got;
    },
  };
}

/**
 * A drop in Outliner (its `DragAndDrop.ts`): the pressed item's bullet held, moved past it, to where
 * its drop variant for the place is (its top the bottom of the row above the drop line, or the top of
 * the row below, eight pixels up; its left the editor's first line's, a tab's width a list level), and
 * released. It drags one item, the one pressed: a drop of the selection it has no gesture for.
 */
async function outlinerDrop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  if (drop.press === null) throw new Unsupported('a drop of the selection: Outliner drags the item whose bullet is pressed');
  const at = await page.evaluate(({ press, seam, listDepth }) => {
    const cm = (window as any).app.workspace.activeEditor.editor.cm;
    const lineOf = (i: number) => cm.state.doc.line(i + 1);
    const lineEl = (i: number): HTMLElement | null => {
      const { node } = cm.domAtPos(lineOf(i).from);
      return ((node.nodeType === 1 ? node : node.parentElement) as HTMLElement | null)?.closest('.cm-line') ?? null;
    };
    const bullet = lineEl(press!)?.querySelector('.cm-formatting-list, .task-list-item-checkbox');
    if (!bullet) return null;
    const b = bullet.getBoundingClientRect();
    const bottom = (i: number): number => {
      const from = lineOf(i).from;
      return cm.coordsAtPos(from, -1).top + cm.lineBlockAt(from).height;
    };
    const y = (seam.above !== null ? bottom(seam.above) : cm.coordsAtPos(lineOf(seam.below!).from, -1).top) - 8;
    // (its tab width as it measures it: an indentation's element, or a line that starts with one)
    const left = cm.dom.querySelector('div.cm-line').getBoundingClientRect().left;
    const indent = cm.dom.querySelector('.cm-indent') as HTMLElement | null;
    let tab = indent?.offsetWidth ?? 0;
    for (let i = 1; !tab && i <= cm.state.doc.lines; i++) {
      const line = cm.state.doc.line(i);
      const lead = /^(\t| {2,4})/.exec(line.text)?.[0];
      if (lead) tab = cm.coordsAtPos(line.from + lead.length, -1).left - cm.coordsAtPos(line.from, -1).left;
    }
    tab ||= cm.defaultCharacterWidth * 4;
    return { from: { x: b.left + b.width / 2, y: b.top + b.height / 2 }, to: { x: left + listDepth * tab, y } };
  }, drop);
  if (!at) throw new Unsupported("the pressed row has no bullet Outliner drags by");
  await gesture(page, at.from, at.to, settle);
}

/**
 * A drop in true-outliner (its `zoom-click.ts` and `drag-geometry.ts`): the pressed node's mark held,
 * moved past its threshold, to its seam's y (the top of the row below the drop line, or past the last
 * row the bottom of the last line with text) and its depth's column (the content's left past its
 * padding, a unit a depth, measured as it measures it, off its probe), and released. It drags the
 * node whose mark is pressed, or the selection's nodes where it is one of them; a drop of the
 * selection with no press it has no gesture for.
 */
async function trueOutlinerDrop(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void> {
  if (drop.press === null) throw new Unsupported('a drop of the selection: true-outliner drags the node whose mark is pressed');
  const at = await page.evaluate(({ press, seam, depth }) => {
    const cm = (window as any).app.workspace.activeEditor.editor.cm;
    const doc = cm.state.doc;
    const lineOf = (i: number) => doc.line(i + 1);
    const { node } = cm.domAtPos(lineOf(press!).from);
    const lineEl = ((node.nodeType === 1 ? node : node.parentElement) as HTMLElement | null)?.closest('.cm-line');
    const mark = lineEl?.querySelector('.to-decor-marker-icon, .list-bullet, .list-number, .to-decor-ol-digits, .task-list-item-checkbox');
    if (!mark) return null;
    const b = mark.getBoundingClientRect();
    let y: number;
    if (seam.below !== null) y = cm.documentTop + cm.lineBlockAt(lineOf(seam.below).from).top;
    else {
      let last = doc.lines;
      while (last > 1 && doc.line(last).text.trim() === '') last--;
      y = cm.documentTop + cm.lineBlockAt(doc.line(last).from).bottom;
    }
    const probe = document.createElement('div');
    probe.className = 'to-drag-unit-probe';
    cm.dom.appendChild(probe);
    const unit = probe.getBoundingClientRect().width;
    probe.remove();
    const content = cm.contentDOM.getBoundingClientRect();
    const origin = content.left + parseFloat(getComputedStyle(cm.contentDOM).paddingLeft || '0');
    return { from: { x: b.left + b.width / 2, y: b.top + b.height / 2 }, to: { x: origin + depth * unit, y: y + 1 } };
  }, drop);
  if (!at) throw new Unsupported('the pressed row has no mark true-outliner drags by');
  await gesture(page, at.from, at.to, settle);
}
