// The browser side of a run: a proxy, and a headless Chromium per app that reaches every site
// through it. Both are shared between runs: a run reuses the ones running (the proxy if its sources
// are current, the app's browser if its flags are), or starts them detached and leaves them running
// for the next run. The app's page is shared too: it stays loaded in its browser after a run, and the
// next run of that app takes it over if it still works (`appPage`). A browser per app, not one for
// all: a browser has one clipboard (headless, its own, not the desktop's), and its Clipboard API works
// only in the tab in front, so apps running side by side in one browser took each other's clipboard
// and focus; and one run of an app at a time, so that its browser's clipboard and front tab are the run's. An app served from this
// machine has its server started by its driver (`Driver.serve`) and recorded here, shared the same
// way. `stopShared` stops the browsers, the servers and the proxy.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import type { Session } from './driver.ts';
import { idleVersion } from './idle.ts';
import { cacheDir, DEFAULT_PORT, proxyVersion } from '../proxy.ts';

export const proxyPort = Number(process.env.OURUS_PROXY_PORT ?? DEFAULT_PORT);
const proxyUrl = `http://127.0.0.1:${proxyPort}`;
export const proxyLog = join(cacheDir, 'proxy.log');

interface Health {
  pid: number;
  version: string;
  offline: boolean;
}

async function health(): Promise<Health | null> {
  try {
    const res = await fetch(`${proxyUrl}/__proxy/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok ? ((await res.json()) as Health) : null;
  } catch {
    return null;
  }
}

/**
 * A running proxy in the mode asked for: the one already running if its sources are current, else a
 * new one, started detached (its log in `proxy.log` in the cache) so later runs reuse it.
 */
export async function ensureProxy(offline: boolean, say: (line: string) => void): Promise<void> {
  const running = await health();
  if (running && running.version === proxyVersion() && running.offline === offline) return;
  if (running) {
    say(`restarting the proxy (pid ${running.pid}): ${running.version !== proxyVersion() ? 'its sources changed' : `offline ${offline}`}`);
    await fetch(`${proxyUrl}/__proxy/stop`).catch(() => {});
    for (let i = 0; i < 50 && (await health()); i++) await new Promise((r) => setTimeout(r, 100));
  }
  mkdirSync(cacheDir, { recursive: true });
  const out = openSync(proxyLog, 'a');
  const args = [new URL('../proxy.ts', import.meta.url).pathname, `--port=${proxyPort}`, ...(offline ? ['--offline'] : [])];
  const child = spawn(process.execPath, args, { detached: true, stdio: ['ignore', out, out] });
  child.unref();
  for (let i = 0; i < 100; i++) {
    const h = await health();
    if (h) return say(`started the proxy on :${proxyPort} (pid ${h.pid}, log ${proxyLog})`);
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`the proxy didn't start; see ${proxyLog}`);
}

/** Per-host traffic since the last call: what was served from the cache, fetched, blocked. */
export type ProxyStats = Record<string, Record<string, { n: number; bytes: number; urls: string[] }>>;

export async function proxyStats(): Promise<ProxyStats> {
  const res = await fetch(`${proxyUrl}/__proxy/stats?reset`);
  return (await res.json()) as ProxyStats;
}

const executablePath = process.env.CHROMIUM ?? '/usr/bin/chromium';
/** Where the app's browser keeps its profile (`.sxs/<app>/chromium/`); Chromium writes the port it listens on into it (DevToolsActivePort). */
const profileOf = (app: string): string => join(cacheDir, app, 'chromium');
const portFileOf = (profile: string): string => join(profile, 'DevToolsActivePort');
export const browserLogOf = (app: string): string => join(cacheDir, app, 'chromium.log');

/** Flags for a browser that only runs tests: no background traffic, no throttled timers, no prompts. */
const FLAGS = [
  `--proxy-server=${proxyUrl}`,
  '--ignore-certificate-errors',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-sync',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-ipc-flooding-protection',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--metrics-recording-only',
  '--password-store=basic',
  '--use-mock-keychain',
  '--mute-audio',
  '--hide-scrollbars',
  // /dev/shm is small in a container (64 MB), and a browser per app running at once crashes renderers there
  '--disable-dev-shm-usage',
  // the browser's own services that call home: form autofill (on every focused field), hints, casting, translation
  '--disable-features=AutofillServerCommunication,OptimizationHints,MediaRouter,Translate',
];

/** The flags a shared browser was started with (in its profile), so a run can tell when they changed since. */
const flagsFileOf = (profile: string): string => join(profile, 'ourus-flags');
const flagsNow = (): string => [executablePath, ...FLAGS].join('\n');

/** A shared browser if it is running, connected to: by its profile. */
async function connectShared(profile: string): Promise<Browser | null> {
  try {
    const port = readFileSync(portFileOf(profile), 'utf8').split('\n')[0];
    return await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 3000 });
  } catch {
    return null;
  }
}

async function closeShared(browser: Browser, profile: string): Promise<void> {
  const session = await browser.newBrowserCDPSession();
  await session.send('Browser.close').catch(() => {});
  for (let i = 0; i < 50 && (await connectShared(profile)); i++) await new Promise((r) => setTimeout(r, 100));
}

/**
 * Removes the profile's lock if the Chromium that took it is gone: one killed without cleaning up, or
 * one of another machine (a container since replaced) sharing the checkout. Chromium refuses a locked
 * profile and exits.
 */
function clearStaleLock(profile: string): void {
  let target: string;
  try {
    target = readlinkSync(join(profile, 'SingletonLock'));
  } catch {
    return;
  }
  const [, host, pid] = /^(.*)-(\d+)$/.exec(target) ?? [];
  if (host === hostname() && alive(Number(pid))) return;
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) rmSync(join(profile, f), { force: true });
}

/**
 * A browser for a run of `app`: the app's shared headless one (started detached if none is running),
 * or with `headed`, a visible one of the run's own.
 */
export async function launch(headed: boolean, say: (line: string) => void, app: string): Promise<Browser> {
  if (headed) return chromium.launch({ executablePath, headless: false, proxy: { server: proxyUrl }, args: ['--ignore-certificate-errors'] });
  const profile = profileOf(app);
  const log = browserLogOf(app);
  const running = await connectShared(profile);
  if (running) {
    let flags = '';
    try {
      flags = readFileSync(flagsFileOf(profile), 'utf8');
    } catch {}
    if (flags === flagsNow()) return running;
    say(`restarting ${app}'s Chromium: its flags changed`);
    await closeShared(running, profile);
  }
  mkdirSync(profile, { recursive: true });
  rmSync(portFileOf(profile), { force: true });
  clearStaleLock(profile);
  writeFileSync(flagsFileOf(profile), flagsNow());
  mkdirSync(join(log, '..'), { recursive: true });
  const out = openSync(log, 'a');
  const child = spawn(executablePath, ['--headless=new', ...FLAGS, `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { detached: true, stdio: ['ignore', out, out] });
  child.unref();
  for (let i = 0; i < 150; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const browser = await connectShared(profile);
    if (browser) {
      say(`started ${app}'s headless Chromium (pid ${child.pid}, log ${log})`);
      return browser;
    }
  }
  throw new Error(`Chromium didn't start; see ${log}`);
}

/** Where a server a driver starts (`Driver.serve`) is recorded, its pid: `.sxs/<name>/server.pid`, beside the app's other files. */
const serverFile = (name: string): string => join(cacheDir, name, 'server.pid');

/**
 * Records a server a driver started for its app (its process group's leader, started detached), so
 * that `stopShared` stops it.
 */
export function recordServer(name: string, pid: number): void {
  mkdirSync(join(cacheDir, name), { recursive: true });
  writeFileSync(serverFile(name), `${pid}\n`);
}

/** The pid of a recorded server that is still running, or 0. */
export function serverPid(name: string): number {
  try {
    const pid = Number(readFileSync(serverFile(name), 'utf8'));
    return pid && alive(pid) ? pid : 0;
  } catch {
    return 0;
  }
}

/** Stops a recorded server (its whole process group), waiting a few seconds for it to go. */
export async function stopServer(name: string, say: (line: string) => void): Promise<void> {
  const pid = serverPid(name);
  if (pid) {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {}
    // a process whose parent doesn't reap it stays a zombie: alive to a signal, but stopped
    for (let i = 0; i < 50 && alive(pid) && !zombie(pid); i++) await new Promise((r) => setTimeout(r, 100));
    say(`stopped ${name}'s server`);
  }
  rmSync(serverFile(name), { force: true });
}

/** Whether a process has exited and waits only for its parent to reap it. */
function zombie(pid: number): boolean {
  try {
    return /^\d+ \(.*\) Z/.test(readFileSync(`/proc/${pid}/stat`, 'utf8'));
  } catch {
    return false;
  }
}

/** Stops each app's shared browser and the server its driver started (`.sxs/<app>/`), and the proxy, if running. */
export async function stopShared(say: (line: string) => void): Promise<void> {
  let apps: string[] = [];
  try {
    apps = readdirSync(cacheDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {}
  for (const app of apps) {
    const browser = existsSync(profileOf(app)) ? await connectShared(profileOf(app)) : null;
    if (browser) {
      await closeShared(browser, profileOf(app));
      say(`stopped ${app}'s Chromium`);
    }
    if (existsSync(serverFile(app))) await stopServer(app, say);
  }
  if (await health()) {
    await fetch(`${proxyUrl}/__proxy/stop`).catch(() => {});
    say('stopped the proxy');
  }
}

const viewport = { width: 1280, height: 900 };
const permissions = ['clipboard-read', 'clipboard-write'];

/** Whether a process is running. */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export interface AppPage {
  /** The page; none (`null`, cast) for an app driven through a `session`. */
  page: Page;
  /** How the runner plays an app that isn't a page (driver.ts): its keys, typing and clipboard. */
  session?: Session;
  /** The app was already loaded by an earlier run (`window.__ourusApp`), and is to be checked, not opened. */
  reused: boolean;
  /** Ends the run's use of it: a shared page stays loaded for the next run, a private one goes. */
  release(): Promise<void>;
}

/**
 * The page a run drives `app` in. In the shared browser: the page an earlier run left with the app
 * loaded from `url`, unless `fresh` asks for a new one; else a new page in the browser's default
 * context, which outlives the run. A run holds the app's browser (`.sxs/<app>/<app>.lock`, its pid): another
 * run of the app while it does fails, as two would share its clipboard and front tab. Elsewhere (a
 * headed browser): a page in a context of the run's own.
 */
export async function appPage(browser: Browser, app: string, url: string, opts: { shared: boolean; fresh: boolean }): Promise<AppPage> {
  if (!opts.shared) {
    const context: BrowserContext = await browser.newContext({ viewport, ignoreHTTPSErrors: true, permissions });
    return { page: await context.newPage(), reused: false, release: () => context.close() };
  }
  const lock = join(cacheDir, app, `${app}.lock`);
  let holder = 0;
  try {
    holder = Number(readFileSync(lock, 'utf8'));
  } catch {}
  if (holder && holder !== process.pid && alive(holder)) throw new Error(`another run of ${app} is going (pid ${holder}, ${lock})`);
  mkdirSync(join(cacheDir, app), { recursive: true });
  writeFileSync(lock, String(process.pid));
  const context = browser.contexts()[0]!;
  await context.grantPermissions(permissions);
  const release = async (): Promise<void> => rmSync(lock, { force: true });
  for (const page of context.pages()) {
    type Marked = { __ourusApp?: string; __ourusIdle?: { version?: string } };
    const loaded = await page.evaluate(() => ({ app: (window as Marked).__ourusApp, idle: (window as Marked).__ourusIdle?.version })).catch(() => null);
    // the app, loaded from where its driver says (a driver may have moved, keeping its name), with
    // this run's idle script (an older one stays in a page until it reloads)
    if (loaded?.app !== app || loaded.idle !== idleVersion() || !page.url().startsWith(url)) continue;
    if (!opts.fresh) return { page, reused: true, release };
    await page.close();
  }
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  return { page, reused: false, release };
}
