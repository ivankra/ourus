// The browser side of a run: a proxy, and a pool of headless Chromiums (`.sxs/chromium/<n>/`) that
// reach every site through it. Both are shared between runs: a run reuses the ones running (the proxy
// if its sources are current, a browser if its flags are), or starts them detached and leaves them
// running for the next run. Each app's page is a window of its own in a browser, one in a browser,
// closed at the run's end (a window is some 25 tasks); one a run that died left loaded, the next run of
// the app takes over if it still works (`appPage`), in the browser it is in where that one has room.
//
// Runs share a browser, each in its app's window (`lease`), with what they share held in turn:
// - One run of an app at a time (`.sxs/<app>/<app>.lock`, `lockApp`): its report and data are the
//   app's. A run's workers (`run.ts --workers`) are each in a browser of their own (`<app>.lock` in the
//   browser's directory): an app's storage (localStorage, IndexedDB) is its origin's in a profile.
// - A browser has one clipboard (headless, its own, not the desktop's), its windows' alike: an example
//   that uses it holds the browser's `clipboard.lock` (`AppPage.clipboard`).
// - A window of its own, not a tab: a tab behind another gets no animation frames (2 in 500 ms against
//   31 in front, measured), which an editor renders in and settling waits for, and its Clipboard API
//   works only in front; each window's page is in front of its own, and has the focus (Playwright
//   emulates it per page).
// A pool rather than a browser per app (the first design): a browser is some 110 tasks (processes and
// threads) before any page, and a container's cap on tasks (2048) held fewer than the 16 apps' browsers;
// an app's window is some 25 more. The pool's size is fixed (`BROWSERS`, `WINDOWS`), to hold under it,
// with Obsidian's instances beside it (`obsidian/obsidian.ts`). An app served from this machine has its servers started by its driver
// (SiYuan's kernels, a worker's each) and recorded here, shared the same way. `stopShared` stops the browsers, the servers
// and the proxy.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { dirname, join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import type { Session } from './driver.ts';
import { takeLock } from './desktop.ts';
import { record, recordDir, runDir } from './records.ts';
import { idleVersion, installIdle } from './idle.ts';
import { ensureAptInstalled } from './system.ts';
import { cacheDir, DEFAULT_PORT, httpDir, proxyVersion, type CacheMode } from '../proxy.ts';

export const proxyPort = Number(process.env.OURUS_PROXY_PORT ?? DEFAULT_PORT);
const proxyUrl = `http://127.0.0.1:${proxyPort}`;
export const proxyLog = join(cacheDir, 'proxy.log');

interface Health {
  pid: number;
  version: string;
  cache: CacheMode;
  httpDir: string;
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
 * A running proxy using its cache as asked (`--cache`): the one already running if its sources are
 * current, else a new one, started detached (its log in `proxy.log` in the cache) so later runs reuse it.
 */
export async function ensureProxy(cache: CacheMode, say: (line: string) => void): Promise<void> {
  const running = await health();
  if (running && running.version === proxyVersion() && running.cache === cache && running.httpDir === httpDir) return;
  if (running) {
    const why = running.version !== proxyVersion() ? 'its sources changed' : running.cache !== cache ? `--cache=${cache}, not ${running.cache}` : `its cache is ${running.httpDir}, not ${httpDir}`;
    say(`Restarting the proxy (pid ${running.pid}): ${why}`);
    await fetch(`${proxyUrl}/__proxy/stop`).catch(() => {});
    for (let i = 0; i < 50 && (await health()); i++) await new Promise((r) => setTimeout(r, 100));
  }
  // its certificate is made once with openssl
  ensureAptInstalled('the proxy', [{ pkg: 'openssl', command: 'openssl' }], say);
  mkdirSync(cacheDir, { recursive: true });
  const out = openSync(proxyLog, 'a');
  const args = [new URL('../proxy.ts', import.meta.url).pathname, `--port=${proxyPort}`, `--cache=${cache}`];
  const child = spawn(process.execPath, args, { detached: true, stdio: ['ignore', out, out] });
  child.unref();
  for (let i = 0; i < 100; i++) {
    const h = await health();
    if (h) return say(`Started proxy on :${proxyPort}, pid ${h.pid}, --cache=${cache}, log ${proxyLog}`);
    // one that exits (offline without a certificate) says why last in its log
    if (child.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const last = readFileSync(proxyLog, 'utf8').trimEnd().split('\n').pop();
  throw new Error(`the proxy didn't start: ${last}; see ${proxyLog}`);
}

/** Per-host traffic since the last call: what was served from the cache, fetched, blocked. */
export type ProxyStats = Record<string, Record<string, { n: number; bytes: number; urls: string[] }>>;

export async function proxyStats(): Promise<ProxyStats> {
  const res = await fetch(`${proxyUrl}/__proxy/stats?reset`);
  return (await res.json()) as ProxyStats;
}

const executablePath = process.env.CHROMIUM ?? '/usr/bin/chromium';
/** The pool: each browser's directory (`.sxs/chromium/<n>/`) has its profile, its log and its locks. */
const poolDir = join(cacheDir, 'chromium');
const browserDir = (n: number): string => join(poolDir, String(n));
/** A browser's profile; Chromium writes the port it listens on into it (DevToolsActivePort). */
const profileOf = (n: number): string => join(browserDir(n), 'profile');
const portFileOf = (profile: string): string => join(profile, 'DevToolsActivePort');
const browserLogOf = (n: number): string => join(browserDir(n), 'chromium.log');

/**
 * The pool: at most `BROWSERS` browsers, each with at most `WINDOWS` app windows (a run's, or an idle
 * one a run that died left, the longest idle closed for a run that needs its place), so that the pool,
 * full, holds under a container's cap on tasks (2048 here: a browser is some 110 tasks idle, more
 * with its thread pools busy, a window some 25; the pool, full, some 950, two of Obsidian's
 * instances beside it some 400). Fewer browsers with more windows each: six of three hit the cap in
 * full runs (Chromium's `pthread_create` failing, the cgroup's `pids.events` counting 686 at the
 * cap, windows and browsers dying or hanging under runs, 2026-10-25). Runs spread over the browsers
 * before any takes a second (a browser's one main thread serves every run in it); with every browser
 * full, a run waits for room.
 */
export const BROWSERS = 4;
const WINDOWS = 5;

/** The pool's browsers by number: those with a directory or a record (`records.ts`), running or not. */
function poolBrowsers(): number[] {
  const numbers = (dir: string): number[] => {
    try {
      return readdirSync(dir)
        .filter((d) => /^\d+$/.test(d))
        .map(Number);
    } catch {
      return [];
    }
  };
  return [...new Set([...numbers(poolDir), ...numbers(recordDir(poolDir))])].sort((a, b) => a - b);
}

/** The pid that holds a lock file, if it still runs, else 0. */
function holderOf(lock: string): number {
  try {
    const pid = Number(readFileSync(lock, 'utf8'));
    return pid && alive(pid) ? pid : 0;
  } catch {
    return 0;
  }
}

/** The apps a run holds browser `n` for now (its `<app>.lock`s; a waiting lock is `<app>-<pid>.lock`). */
function runsIn(n: number): string[] {
  try {
    const locks = recordDir(browserDir(n));
    return readdirSync(locks)
      .filter((f) => f.endsWith('.lock') && f !== 'clipboard.lock' && !/-\d+\.lock$/.test(f))
      .filter((f) => holderOf(join(locks, f)))
      .map((f) => f.slice(0, -'.lock'.length));
  } catch {
    return [];
  }
}

/** Whether a run of the app is going (its lock, `.sxs/<app>/<app>.lock`). */
const running = (app: string): boolean => !!holderOf(record(join(cacheDir, app, `${app}.lock`)));

/** Where a window of `app` loaded in browser `n` is recorded: a run writes it as it opens or takes over the window, and takes it away as it closes it. */
const windowRecord = (n: number, app: string): string => record(join(browserDir(n), `${app}.window`));

/** The apps with a window loaded in browser `n`, as their runs recorded them: no browser asked. */
function windowsIn(n: number): Set<string> {
  try {
    return new Set(readdirSync(recordDir(browserDir(n))).filter((f) => f.endsWith('.window')).map((f) => f.slice(0, -'.window'.length)));
  } catch {
    return new Set();
  }
}

/** Records that browser `n` has a window of `app` loaded (`open`), or no longer has. */
function recordWindow(n: number, app: string, open: boolean): void {
  if (open) writeFileSync(windowRecord(n, app), '');
  else rmSync(windowRecord(n, app), { force: true });
}

/** Forgets every window recorded for browser `n`: one starting, or stopped, has none. */
function forgetWindows(n: number): void {
  for (const app of windowsIn(n)) recordWindow(n, app, false);
}

/**
 * The app a window holds (`window.__ourusApp`): undefined for none, `hung` where the window doesn't
 * answer in two seconds (a page stuck in a dialog or a busy script would hold every run that asks it).
 */
async function appOf(page: Page): Promise<string | undefined> {
  const asked = page.evaluate(() => (window as { __ourusApp?: string }).__ourusApp).catch(() => undefined);
  return Promise.race([asked, new Promise<string>((done) => setTimeout(() => done('hung'), 2000))]);
}

/** Closes a window, one that doesn't answer too: by its target, through the browser, which a hung page doesn't hold up. */
async function closeWindow(page: Page): Promise<void> {
  const closed = page.close({ runBeforeUnload: false }).catch(() => {});
  if (await Promise.race([closed.then(() => true), new Promise<boolean>((done) => setTimeout(() => done(false), 2000))])) return;
  const session = await page.context().newCDPSession(page).catch(() => null);
  await session?.send('Page.close').catch(() => {});
}

/** The apps loaded in a browser's windows (`window.__ourusApp`), with their pages. */
async function appsIn(browser: Browser): Promise<Map<string, Page>> {
  const found = new Map<string, Page>();
  for (const page of browser.contexts()[0]?.pages() ?? []) {
    const app = await appOf(page);
    if (app && app !== 'hung') found.set(app, page);
  }
  return found;
}

/** A page in a window of its own, in a browser of the pool (`Target.createTarget`, found by its target). */
async function newWindow(browser: Browser): Promise<Page> {
  const context = browser.contexts()[0]!;
  const session = await browser.newBrowserCDPSession();
  // the window itself the viewport's size: an emulated viewport ends with the connection that set it
  const { targetId } = (await session.send('Target.createTarget', { url: 'about:blank', newWindow: true, ...viewport })) as { targetId: string };
  await session.detach().catch(() => {});
  for (let i = 0; i < 100; i++) {
    for (const page of context.pages()) {
      const s = await context.newCDPSession(page).catch(() => null);
      const info = (await s?.send('Target.getTargetInfo').catch(() => null)) as { targetInfo: { targetId: string } } | null;
      await s?.detach().catch(() => {});
      if (info?.targetInfo.targetId === targetId) return page;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('a new window opened no page');
}

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
  // lighter, as a container caps its tasks (processes and threads): no crash handlers (two
  // processes a browser, writing to ~/.config/chromium), and the GPU's work in the browser's process. A
  // browser is still some 6 processes and 110 tasks, most of them its own threads; the sandbox stays
  // (`--no-zygote` needs it gone), as does site isolation
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--in-process-gpu',
];

/** The flags a shared browser was started with (a record beside its locks), so a run can tell when they changed since. */
const flagsFileOf = (profile: string): string => record(join(dirname(profile), 'flags'));
/** A shared browser's port and pid, recorded as it starts (Chromium's own port file is in its profile, data). */
const portRecordOf = (profile: string): string => record(join(dirname(profile), 'port'));
const pidRecordOf = (profile: string): string => record(join(dirname(profile), 'pid'));
const flagsNow = (): string => [executablePath, ...FLAGS].join('\n');

/** A shared browser if it is running, connected to: by its profile. */
async function connectShared(profile: string): Promise<Browser | null> {
  // its record, else the port file Chromium wrote into its profile (as it starts: recorded then)
  for (const [file, recorded] of [[portRecordOf(profile), true], [portFileOf(profile), false]] as const) {
    try {
      const port = readFileSync(file, 'utf8').split('\n')[0]!.trim();
      if (!port) continue;
      const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 3000 });
      if (!recorded) writeFileSync(portRecordOf(profile), `${port}\n`);
      return browser;
    } catch {}
  }
  return null;
}

async function closeShared(browser: Browser, profile: string): Promise<void> {
  const session = await browser.newBrowserCDPSession();
  await session.send('Browser.close').catch(() => {});
  for (let i = 0; i < 50 && (await connectShared(profile)); i++) await new Promise((r) => setTimeout(r, 100));
}

/** The pid of the Chromium running on a profile (its `SingletonLock`, `<host>-<pid>`), if one is, on this machine; else 0. */
function profileHolder(profile: string): number {
  try {
    const [, host, pid] = /^(.*)-(\d+)$/.exec(readlinkSync(join(profile, 'SingletonLock'))) ?? [];
    if (host === hostname() && alive(Number(pid))) return Number(pid);
  } catch {}
  // its record: the profile may be gone from under it (`.sxs/` cleaned)
  return holderOf(pidRecordOf(profile));
}

/**
 * Removes the profile's lock if the Chromium that took it is gone: one killed without cleaning up, or
 * one of another machine (a container since replaced) sharing the checkout. Chromium refuses a locked
 * profile and exits.
 */
function clearStaleLock(profile: string): void {
  if (profileHolder(profile)) return;
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) rmSync(join(profile, f), { force: true });
}

/** When an app's page was last taken by a run (its `last-run` file), for `appPage` to close the longest idle window first. */
const lastRunOf = (app: string): number => {
  try {
    return statSync(record(join(cacheDir, app, 'last-run'))).mtimeMs;
  } catch {
    return 0;
  }
};

/** The servers recorded (`recordServer`): an app's (`<app>`), or a worker's (`<app>/<n>`). */
function recordedServers(): string[] {
  const found: string[] = [];
  const walk = (rel: string, depth: number): void => {
    let entries;
    try {
      entries = readdirSync(join(runDir, rel), { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.name === 'server.pid')) found.push(rel);
    if (depth < 2) for (const e of entries) if (e.isDirectory() && e.name !== 'chromium') walk(rel ? `${rel}/${e.name}` : e.name, depth + 1);
  };
  walk('', 0);
  return found.filter(Boolean);
}

/** Starts browser `n` of the pool, detached, and connects to it. */
async function startBrowser(n: number, say: (line: string) => void): Promise<Browser> {
  const profile = profileOf(n);
  const log = browserLogOf(n);
  // started again on a profile in use, Chromium would hand over to the one running and exit
  if (profileHolder(profile)) throw new Error(`Chromium ${n} runs already (pid ${profileHolder(profile)}), unreached`);
  mkdirSync(profile, { recursive: true });
  rmSync(portFileOf(profile), { force: true });
  rmSync(portRecordOf(profile), { force: true });
  clearStaleLock(profile);
  writeFileSync(flagsFileOf(profile), flagsNow());
  forgetWindows(n);
  const out = openSync(log, 'a');
  const child = spawn(executablePath, ['--headless=new', ...FLAGS, `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { detached: true, stdio: ['ignore', out, out] });
  child.unref();
  for (let i = 0; i < 150; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const browser = await connectShared(profile);
    if (browser) {
      writeFileSync(pidRecordOf(profile), `${child.pid}\n`);
      say(`started headless Chromium ${n} (pid ${child.pid}, log ${log})`);
      return browser;
    }
  }
  throw new Error(`Chromium didn't start; see ${log}`);
}

/** What a run holds of the pool: its browser's number, and the locks it took (`lease`). */
const leases = new WeakMap<Browser, { n: number; release: () => void }>();

/**
 * The app's lock, for a run of it (its workers each hold a browser too, `lease`): another run of the app
 * while it is held stops, or (`wait`, a probe's) waits its turn. Returns its release.
 */
export async function lockApp(app: string, wait = false): Promise<() => void> {
  mkdirSync(join(cacheDir, app), { recursive: true });
  return takeLock(record(join(cacheDir, app, `${app}.lock`)), wait, `${app} (a run of it)`);
}

/**
 * A browser of the pool for a worker of a run of `app` (the run holds the app's lock, `lockApp`), held
 * until the worker releases its page (`AppPage.release`): deciding while it holds the pool's lock (so
 * that runs and workers starting together don't start the same browser), one without a worker of the
 * app: the one with the app's window loaded (busy or not), else, with room for a run, the fewest runs
 * first and of those the fewest windows: an idle one, else a new one while fewer than `BROWSERS` run,
 * else a busy one; of the even-numbered or the odd ones only where `parity` says (`Driver.browsers`).
 * It decides from files alone (the browsers' processes, their flags, the runs' locks, the windows'
 * records), connecting only to the browser it takes (one that doesn't answer is left alone and another
 * taken) and to one it stops. With the pool full, it waits for room, or
 * until `gone` says the worker is no longer wanted (null). One running with other flags than these
 * starts again once no run holds it.
 */
async function lease(app: string, say: (line: string) => void, gone?: () => boolean, parity?: 'even' | 'odd'): Promise<Browser | null> {
  const mine = (n: number): boolean => !parity || n % 2 === (parity === 'even' ? 0 : 1);
  mkdirSync(poolDir, { recursive: true });
  /** Browsers that run but didn't answer a connection, this lease: left alone, their numbers too. */
  const unreached = new Set<number>();
  /** The browser a round took: its number, its run's lock's release, and itself where the round started it. */
  let taken: { n: number; releaseHere: () => void; browser: Browser | null } | null = null;
  for (const t0 = Date.now(); ; await new Promise((r) => setTimeout(r, 1000))) {
    const releasePool = await takeLock(record(join(poolDir, 'pool.lock')), true, 'the pool of browsers');
    try {
      // what the pool holds, from its files alone: which browsers run (their processes), their flags,
      // the runs in each (their locks), the windows loaded in each (their records)
      const up: { n: number; runs: string[]; windows: Set<string> }[] = [];
      for (const n of poolBrowsers()) {
        if (!profileHolder(profileOf(n))) continue;
        let flags = '';
        try {
          flags = readFileSync(flagsFileOf(profileOf(n)), 'utf8');
        } catch {}
        const runs = runsIn(n);
        // one past the pool's size (a run with a larger one left it), or started with other flags: stopped
        // once no run holds it (a connection, to close it)
        if ((n >= BROWSERS || flags !== flagsNow()) && !runs.length) {
          const browser = await connectShared(profileOf(n));
          if (browser) {
            say(n >= BROWSERS ? `stopping Chromium ${n}: past the pool's ${BROWSERS}` : `restarting Chromium ${n}: its flags changed`);
            await closeShared(browser, profileOf(n));
            forgetWindows(n);
          }
          continue;
        }
        if (n >= BROWSERS) continue;
        if (unreached.has(n)) continue;
        up.push({ n, runs, windows: windowsIn(n) });
      }
      // the first number free for a new browser, if the pool (the app's part of it) has one
      let next = 0;
      while (next < BROWSERS && (!mine(next) || up.some((b) => b.n === next) || unreached.has(next) || profileHolder(profileOf(next)))) next++;
      const full = next >= BROWSERS;
      const free = up.filter((b) => mine(b.n) && b.runs.length < WINDOWS && !b.runs.includes(app));
      // the app's window where one is loaded (a run that kept it, `keep`), in any browser of the app's part
      // of the pool without a run of the app: taken over, however many runs its browser has (it adds no
      // window), not loaded again elsewhere, closing another app's window there
      let pick: { n: number; runs: string[]; windows: Set<string> } | undefined = up.find((b) => mine(b.n) && !b.runs.includes(app) && b.windows.has(app));
      // else a browser with room for a new window, so that it closes no other app's while one has room;
      // of those (or, the pool's windows all taken, of all) runs spread over the browsers before any takes
      // a second, and then the fewest windows
      if (!pick && free.length) {
        const roomy = free.filter((b) => b.windows.size < WINDOWS);
        const among = roomy.length ? roomy : free;
        const least = Math.min(...among.map((b) => b.runs.length));
        // a new browser rather than a second run in one, while the pool has room for one and no browser
        // up has room for a window and no run
        if (least === 0 || full || roomy.length) pick = among.filter((b) => b.runs.length === least).reduce((a, b) => (b.windows.size < a.windows.size ? b : a));
      }
      // the browser taken: its run's lock (a file) under the pool's lock, so that no other lease takes the
      // same room; a new browser started under it too, so that no other starts the same one
      if (pick || !full) {
        const n = pick ? pick.n : next;
        const started = pick ? null : await startBrowser(next, say);
        const releaseHere = await takeLock(record(join(browserDir(n), `${app}.lock`)), false, `${app} in Chromium ${n}`);
        taken = { n, releaseHere, browser: started };
      }
    } finally {
      releasePool();
    }
    if (taken) {
      // the one connection a lease makes, to the browser it took, with the pool's lock given back: the
      // leases waiting on it don't wait for a connection too
      const browser = taken.browser ?? (await connectShared(profileOf(taken.n)));
      if (browser) {
        leases.set(browser, { n: taken.n, release: taken.releaseHere });
        return browser;
      }
      taken.releaseHere();
      unreached.add(taken.n);
      say(`Chromium ${taken.n} runs (pid ${profileHolder(profileOf(taken.n))}) but doesn't answer: left alone`);
      taken = null;
      continue;
    }
    if (gone?.()) return null;
    if (Date.now() - t0 < 1000) say(`the pool's ${parity ? `${parity}-numbered ` : ''}browsers have no room for ${app}: waiting for a run to end`);
  }
}

/**
 * A browser for a worker of a run of `app`: one of the pool's, shared (`lease`; the run holds the app's
 * lock), of those `parity` says if it does, or with `headed`, a visible one of the run's own.
 */
export async function launch(headed: boolean, say: (line: string) => void, app: string, gone?: () => boolean, parity?: 'even' | 'odd'): Promise<Browser | null> {
  // Debian's Chromium, unless `CHROMIUM` names another
  if (!process.env.CHROMIUM) ensureAptInstalled('the browser', [{ pkg: 'chromium', command: executablePath }], say);
  if (headed) return chromium.launch({ executablePath, headless: false, proxy: { server: proxyUrl }, args: ['--ignore-certificate-errors'] });
  return lease(app, say, gone, parity);
}

/** Where a server a driver starts is recorded, its pid: `<name>/server.pid` (a worker's `<app>/<n>`), among the records (`records.ts`). */
const serverFile = (name: string): string => record(join(cacheDir, name, 'server.pid'));

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

/** Stops the pool's browsers, each server a driver started (`.sxs/<app>/`, or a worker's in `.sxs/<app>/<n>/`), and the proxy, if running. */
export async function stopShared(say: (line: string) => void): Promise<void> {
  for (const n of poolBrowsers()) {
    forgetWindows(n);
    const browser = await connectShared(profileOf(n));
    if (browser) {
      await closeShared(browser, profileOf(n));
      for (const f of [portRecordOf(profileOf(n)), pidRecordOf(profileOf(n))]) rmSync(f, { force: true });
      say(`stopped Chromium ${n}`);
      continue;
    }
    // one that doesn't answer (its port file gone, or hung), by its pid
    const pid = profileHolder(profileOf(n));
    if (!pid) continue;
    try {
      process.kill(pid, 'SIGTERM');
    } catch {}
    for (let i = 0; i < 50 && alive(pid); i++) await new Promise((r) => setTimeout(r, 100));
    if (alive(pid)) process.kill(pid, 'SIGKILL');
    for (const f of [portRecordOf(profileOf(n)), pidRecordOf(profileOf(n))]) rmSync(f, { force: true });
    say(`stopped Chromium ${n} (pid ${pid}), which didn't answer`);
  }
  // a server of the app's, or one of each of its workers (`<app>/<n>/server.pid`: SiYuan's kernels, Obsidian's instances)
  for (const name of recordedServers()) await stopServer(name, say);
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
  /** Ends the run's use of it: its window closes, or with `keep` stays loaded for the next run (a shared browser stays up either way). */
  release(): Promise<void>;
  /**
   * Holds the browser's clipboard, which its other windows share, until the returned release: for an
   * example that uses it. None where the browser is the run's own.
   */
  clipboard?(): Promise<() => void>;
}

/** The pages whose settling script this process has added (`reloadPage`). */
const idleAdded = new WeakSet<Page>();

/**
 * Loads a driver's page anew (an app left in a state its next test can't start from), as a run's own
 * load leaves it: with this run's settling script, which a window taken over from an earlier run has
 * only until it reloads (a page's init scripts are its connection's), and the marks a run reuses a
 * window by (`window.__ourusApp`, `__ourusVersion`).
 */
export async function reloadPage(page: Page): Promise<void> {
  type Marked = { __ourusApp?: string; __ourusVersion?: string };
  const marks = await page.evaluate(() => ({ app: (window as Marked).__ourusApp, version: (window as Marked).__ourusVersion })).catch(() => ({ app: undefined, version: undefined }));
  if (!idleAdded.has(page)) {
    // (twice is harmless: the script stops where a page has one)
    await page.addInitScript(installIdle, idleVersion());
    idleAdded.add(page);
  }
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluate(([app, version]) => Object.assign(window as Marked, { __ourusApp: app, __ourusVersion: version }), [marks.app, marks.version] as const);
}

/**
 * The page a worker drives `app` in. In a browser of the pool: the app's window an earlier run left with
 * it loaded from `url` (one that kept it, `keep`, or died before closing it), unless `fresh` asks for a
 * new one; else a new window (one of the app's in a browser). With `keep`, the window stays loaded when
 * the run ends, for the next run to take over (the probe's: a probe after another loads nothing), the
 * longest idle closing when a browser's windows are all taken. Elsewhere (a headed browser): a page in
 * a context of the run's own.
 */
export async function appPage(browser: Browser, app: string, url: string, opts: { shared: boolean; fresh: boolean; keep?: boolean }): Promise<AppPage> {
  const held = leases.get(browser);
  if (!opts.shared || !held) {
    const context: BrowserContext = await browser.newContext({ viewport, ignoreHTTPSErrors: true, permissions });
    return { page: await context.newPage(), reused: false, release: () => context.close() };
  }
  writeFileSync(record(join(cacheDir, app, 'last-run')), `${new Date().toISOString()}\n`);
  const context = browser.contexts()[0]!;
  await context.grantPermissions(permissions);
  // the window closed, its tasks with it (or kept, loaded, its record staying), and the browser left to the next run
  const release = (page: Page) => async (): Promise<void> => {
    if (!opts.keep) {
      await closeWindow(page);
      recordWindow(held.n, app, false);
    }
    held.release();
  };
  // the browser's clipboard, held, with the permission to read it granted again: a DevTools connection's
  // end resets the permissions it granted for every page of the browser (Chromium's), so another run's
  // ending takes this page's (measured: "Read permission denied" for a page whose run granted it)
  const clipboard = async (): Promise<() => void> => {
    const unhold = await takeLock(record(join(browserDir(held.n), 'clipboard.lock')), true, `the clipboard of Chromium ${held.n}`);
    await context.grantPermissions(permissions).catch(() => {});
    return unhold;
  };
  // one window of the app in a browser: any more (a run that died opening one) go
  const mine: Page[] = [];
  for (const p of context.pages()) {
    const of = await appOf(p);
    // a window that doesn't answer is no use to any run, and would hold the next one that asks it
    if (of === 'hung') {
      console.log(`closed a window that doesn't answer (${p.url().slice(0, 80)}) in Chromium ${held.n}`);
      await closeWindow(p);
    } else if (of === app) mine.push(p);
  }
  for (const extra of mine.slice(1)) await closeWindow(extra);
  const page = mine[0];
  if (page) {
    type Marked = { __ourusIdle?: { version?: string } };
    const idle = await page.evaluate(() => (window as Marked).__ourusIdle?.version).catch(() => null);
    // the app, loaded from where its driver says (a driver may have moved, keeping its name), with
    // this run's idle script (an older one stays in a page until it reloads)
    // its viewport set again: the one an earlier run set ended with that run's connection, leaving the
    // window's own size (780 wide in a window made before windows were made the viewport's size, and
    // Dynalist, for one, lays itself out for a phone there)
    if (!opts.fresh && idle === idleVersion() && page.url().startsWith(url)) {
      await page.setViewportSize(viewport);
      recordWindow(held.n, app, true);
      return { page, reused: true, release: release(page), clipboard };
    }
    await closeWindow(page);
    recordWindow(held.n, app, false);
  }
  // a place among the browser's windows: while every one is taken, the longest idle (an app no run here
  // holds) closes
  const busy = runsIn(held.n);
  const idle = [...(await appsIn(browser))].filter(([a]) => a !== app && !busy.includes(a)).sort((x, y) => lastRunOf(x[0]) - lastRunOf(y[0]));
  // (the blank page a browser starts with is no window of an app's)
  for (let open = context.pages().filter((p) => p.url() !== 'about:blank').length; open >= WINDOWS && idle.length; open--) {
    const [a, p] = idle.shift()!;
    await closeWindow(p);
    recordWindow(held.n, a, false);
    console.log(`closed ${a}'s idle window in Chromium ${held.n}, for ${app}'s`);
  }
  const fresh = await newWindow(browser);
  await fresh.setViewportSize(viewport);
  recordWindow(held.n, app, true);
  return { page: fresh, reused: false, release: release(fresh), clipboard };
}
