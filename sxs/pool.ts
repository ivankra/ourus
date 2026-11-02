#!/usr/bin/env node
// The pool: one process per container (its state directory) that owns what the SxS's runs share, the
// headless Chromiums the apps run in, SiYuan's kernels and Obsidian's instances, and hands them out to
// clients (`run.ts`'s workers) as leases. dev/27-sxs.md has the design and why.
//
//   node sxs/pool.ts status      what runs, who holds what, since when, what waits
//   node sxs/pool.ts stop        stops it and everything it runs
//   node sxs/pool.ts serve       runs it (a client starts it as needed: `lib/pool-client.ts`)
//   node sxs/pool.ts --help      the commands, the settings it reads, its files
//
// - A lease is a connection (a unix socket in the state directory, a JSON message a line). What it
//   holds is held while it is open: closed (the client exited, crashed, was killed) or its client's pid
//   gone, what it held is destroyed.
// - A window is a browser context of its own in one of the browsers (`Target.createBrowserContext`):
//   its storage, cookies, service workers, locks and channels its own, so that two setups of one app on
//   one origin (RemNote's) run side by side, and each window starts with nothing an earlier one left.
//   A client releasing it cleanly (`release`, `clean`) leaves it loaded, warm, for the next client of
//   the same app (a hot start, run after run); any other end destroys it, its context with it. A warm
//   window no client took for `IDLE` minutes is destroyed too, and a browser with no window stops after
//   as long; the pool exits once it has nothing and no client for two minutes.
// - The pool's children are started under `setpriv --pdeathsig`: the pool gone, killed even, they go
//   with it. Nothing is recorded in files to be read back as stale.
// - What a browser (or an Obsidian instance) has one of, its clipboard, is held in turn (`clipboard`),
//   and a lock of any name (`lock`: one run of an app at a time) is held while its connection is open.
// - The proxy (`proxy.ts`), which its browsers reach every site through (their flags name its port), is
//   the pool's too: started before a browser is, with the cache mode the last run asked for
//   (`proxy`, `--cache`), restarted where it exits or its sources change.

import { spawn, type ChildProcess } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, rmSync, statSync, truncateSync } from 'node:fs';
import { createServer, type Server, type Socket } from 'node:net';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { Cdp } from './lib/cdp.ts';
import { alive, takeLock } from './lib/desktop.ts';
import { connectPool, poolDir, poolLog, poolSocket, poolVersion, stopPool } from './lib/pool-client.ts';
import { has, tasks } from './lib/system.ts';
import type { SpawnChild } from './obsidian/instance.ts';
import { cacheDir, DEFAULT_PORT, httpDir, proxyVersion, stateDir, type CacheMode } from './proxy.ts';

const env = process.env;
/** Browsers at most: each one clipboard, so as many examples using it at once. */
const BROWSERS = Number(env.OURUS_SXS_BROWSERS) || 2;
/** Windows (contexts) a browser holds at most, leased and warm. */
const WINDOWS = Number(env.OURUS_SXS_WINDOWS) || 12;
/** Obsidian's instances at most; each holds a window of each setup at most. */
const OBSIDIANS = Number(env.OURUS_SXS_OBSIDIANS) || 3;
/** A warm window no client took, a browser or an instance with no window, stops after this long. */
const IDLE = (Number(env.OURUS_SXS_IDLE_MIN) || 10) * 60_000;
/** The pool with nothing running and no client exits after this long. */
const EXIT_AFTER = 2 * 60_000;
/**
 * What things cost of the container's cap on tasks (`pids.max`) at full size, measured under a full run
 * (2026-11-02): a Chromium with ten windows some 410 tasks, an Obsidian with four some 200, a kernel 15;
 * two Chromiums with twenty windows of the heavier apps 1046 (some 39 a window).
 */
const COST = { browser: 130, window: 40, obsidian: 100, obsidianWindow: 25, kernel: 20 };
/**
 * The share of the cap the pool fills up to: a fifth spared for what grows after it is admitted (a
 * window loading its app has more processes than loaded) and what isn't the pool's (the runs, Emacs).
 */
const MARGIN = 0.8;

const executablePath = env.CHROMIUM ?? '/usr/bin/chromium';
const proxyPort = Number(env.OURUS_PROXY_PORT ?? DEFAULT_PORT);
const proxyUrl = `http://127.0.0.1:${proxyPort}`;
const proxyLog = join(cacheDir, 'proxy.log');
const PERMISSIONS = ['clipboardReadWrite', 'clipboardSanitizedWrite'];
const VIEWPORT = { width: 1280, height: 900 };

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
  // /dev/shm is small in a container (64 MB)
  '--disable-dev-shm-usage',
  // the browser's own services that call home: form autofill (on every focused field), hints, casting, translation
  '--disable-features=AutofillServerCommunication,OptimizationHints,MediaRouter,Translate',
  // lighter, as a container caps its tasks: no crash handlers, the GPU's work in the browser's process
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--in-process-gpu',
];

// ------------------------------------------------------------------ log, children

function log(line: string): void {
  try {
    process.stdout.write(`${new Date().toISOString().slice(0, 19)} ${line}\n`);
  } catch {}
}

const setpriv = has('setpriv');
const children = new Set<ChildProcess>();

/** Starts a child of the pool: in a process group of its own (stopped whole), killed if the pool dies (`setpriv --pdeathsig`). */
const spawnChild: SpawnChild = (cmd, args, { log: file, env: childEnv }) => {
  const out = openSync(file, 'a');
  const [c, a] = setpriv ? ['setpriv', ['--pdeathsig', 'KILL', '--', cmd, ...args]] : [cmd, args];
  const proc = spawn(c, a, { detached: true, stdio: ['ignore', out, out], env: childEnv ?? process.env });
  closeSync(out);
  children.add(proc);
  proc.once('exit', () => children.delete(proc));
  return proc;
};

/** Stops a child and its process group: SIGTERM, then after `ms` SIGKILL. */
async function stopChild(proc: ChildProcess | null | undefined, ms = 5000): Promise<void> {
  if (!proc?.pid || proc.exitCode !== null || proc.signalCode !== null) return;
  const exited = new Promise<void>((r) => proc.once('exit', () => r()));
  const kill = (sig: NodeJS.Signals): void => {
    try {
      process.kill(-proc.pid!, sig);
    } catch {
      try {
        proc.kill(sig);
      } catch {}
    }
  };
  kill('SIGTERM');
  if (await Promise.race([exited.then(() => true), sleep(ms).then(() => false)])) return;
  kill('SIGKILL');
  await Promise.race([exited, sleep(2000)]);
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const ago = (t: number): string => {
  const s = Math.round((Date.now() - t) / 1000);
  return s < 120 ? `${s}s` : `${Math.round(s / 60)}m`;
};

// ------------------------------------------------------------------ state

interface Conn {
  id: number;
  sock: Socket;
  pid: number;
  who: string;
  since: number;
  closed: boolean;
  lease?: Win | OWin;
  locks: Set<string>;
  /** Tasks it was given room for (`room`): a run's own processes, outside the pool (`run.ts`, Emacs), for as long as it is connected. */
  room: number;
  roomFor?: string;
}

/** Something held in turn: a browser's clipboard, a lock. */
interface Turn {
  holder: Conn | null;
  /** Those waiting: each granted it in turn, or denied (`deny`) where it can no longer have it (its lease gone). */
  queue: { conn: Conn; grant: () => void; deny?: (why: string) => void }[];
}

interface Browser {
  n: number;
  dir: string;
  ready: Promise<void>;
  up: boolean;
  proc?: ChildProcess;
  port?: number;
  cdp?: Cdp;
  windows: Set<Win>;
  clipboard: Turn;
  /**
   * Contexts of its no window has (one whose creation was given up on and came after, one a dispose
   * timed out on), as the last sweep found them (`sweep`): disposed where the next finds them again.
   */
  strays: Set<string>;
  since: number;
  /** Since when it has had no window. */
  emptySince: number;
  closing: boolean;
}

interface Win {
  kind: 'window';
  id: number;
  app: string;
  key: string;
  browser: Browser;
  contextId?: string;
  targetId?: string;
  state: 'leased' | 'warm';
  conn?: Conn;
  meta?: Record<string, unknown>;
  since: number;
  lastUsed: number;
  kernel?: Kernel;
  destroying: boolean;
}

interface Kernel {
  n: number;
  ready: Promise<void>;
  proc?: ChildProcess;
  win: Win;
  origin: string;
  port: number;
}

interface Instance {
  n: number;
  dir: string;
  ready: Promise<void>;
  up: boolean;
  proc?: ChildProcess;
  xvfb?: ChildProcess | null;
  port?: number;
  cdp?: Cdp;
  /** `<app> <installer>`, as it runs. */
  version?: string;
  /** The versions it was started for, before it is up. */
  wanted?: string;
  windows: Map<string, OWin>;
  clipboard: Turn;
  since: number;
  emptySince: number;
  closing: boolean;
}

interface OWin {
  kind: 'obsidian';
  setup: string;
  key: string;
  instance: Instance;
  targetId?: string;
  state: 'leased' | 'warm';
  conn?: Conn;
  meta?: Record<string, unknown>;
  since: number;
  lastUsed: number;
  destroying: boolean;
}

interface Waiter {
  conn: Conn;
  what: string;
  since: number;
  told: boolean;
  /** Takes what it waits for if there is room (deciding at once, the rest done after), else false. */
  attempt(): boolean;
}

const conns = new Set<Conn>();
const browsers = new Map<number, Browser>();
const instances = new Map<number, Instance>();
const kernels = new Map<number, Kernel>();
const locks = new Map<string, Turn>();
const waiters: Waiter[] = [];
/** Tasks reserved by what is starting, not yet counted in `pids.current`. */
let reserved = 0;
/** Tasks of what is being destroyed, still counted in `pids.current` for a moment. */
let freeing = 0;
/** Counts `cost` as freed while `done` settles, and a moment after (a renderer takes a moment to go). */
function freed(cost: number, done: Promise<unknown>): void {
  freeing += cost;
  void done.finally(() => setTimeout(() => (freeing -= cost), 2000));
}
let draining = false;
let stopping = false;
let emptySince = Date.now();
let ids = 0;

const VERSION = poolVersion();

function send(conn: Conn, msg: object): void {
  if (!conn.closed) conn.sock.write(`${JSON.stringify(msg)}\n`);
}
/** Says a line in the pool's log and to the client the line is for. */
const sayTo =
  (conn?: Conn) =>
  (line: string): void => {
    log(line);
    if (conn) send(conn, { event: 'say', line });
  };
const whoOf = (conn: Conn | undefined): string => (conn ? `${conn.who} (pid ${conn.pid})` : 'no one');

/** The tasks of the pool's process tree now (itself and every descendant), from `/proc`. */
function poolTasks(): number {
  const kids = new Map<number, number[]>();
  const threads = new Map<number, number>();
  for (const d of readdirSync('/proc')) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = readFileSync(`/proc/${d}/stat`, 'utf8');
      // pid (comm) state ppid ... num_threads (the 20th field)
      const f = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      const ppid = Number(f[1]);
      threads.set(Number(d), Number(f[17]));
      kids.set(ppid, [...(kids.get(ppid) ?? []), Number(d)]);
    } catch {}
  }
  let sum = 0;
  for (const stack = [process.pid]; stack.length; ) {
    const pid = stack.pop()!;
    sum += threads.get(pid) ?? 0;
    stack.push(...(kids.get(pid) ?? []));
  }
  return sum;
}

/** What the pool runs will cost at full size (`COST`): a browser, an instance just started have far fewer tasks than they come to. */
function modelTasks(): number {
  let n = 0;
  for (const b of browsers.values()) n += COST.browser + b.windows.size * COST.window;
  for (const i of instances.values()) n += COST.obsidian + i.windows.size * COST.obsidianWindow;
  return n + kernels.size * COST.kernel;
}

/** The tasks the runs were given room for (`room`), outside the pool's own process tree. */
const roomTasks = (): number => [...conns].reduce((n, c) => n + (c.closed ? 0 : c.room), 0);

/**
 * Whether `cost` more tasks fit under the container's cap (`pids.max`, as read), with a fifth to spare
 * (`MARGIN`): the tasks not the pool's as the larger of what they are and the room the runs were given
 * (a run's Emacs not started yet is counted), and the pool's as the larger of what they are and what
 * they will come to.
 */
function fits(cost: number): boolean {
  const t = tasks();
  if (!t) return true;
  const mine = poolTasks();
  return Math.max(t.current - mine, roomTasks()) + Math.max(mine - freeing, modelTasks()) + reserved + cost <= t.max * MARGIN;
}
/** Whether no client holds anything: then whatever is asked for is tried, the cap or not, rather than waiting for no one. */
const nothingLeased = (): boolean => ![...conns].some((c) => c.lease);

async function reserve<T>(cost: number, f: () => Promise<T>): Promise<T> {
  reserved += cost;
  try {
    return await f();
  } finally {
    reserved -= cost;
  }
}

// ------------------------------------------------------------------ the proxy

interface Health {
  pid: number;
  version: string;
  cache: CacheMode;
  httpDir: string;
}

async function proxyHealth(timeout = 1000): Promise<Health | null> {
  try {
    const res = await fetch(`${proxyUrl}/__proxy/health`, { signal: AbortSignal.timeout(timeout) });
    return res.ok ? ((await res.json()) as Health) : null;
  } catch {
    return null;
  }
}

/** The pool's proxy, and the cache mode the last run asked for. */
let proxyProc: ChildProcess | null = null;
let proxyCache: CacheMode = 'use';
let proxyStarting: Promise<void> | null = null;

/**
 * The proxy running, the pool's (its child), on its sources as they are and the cache mode asked for
 * (`cache`, else the last asked): one running otherwise, or not the pool's (one the design before
 * left), is stopped and the pool's started.
 */
async function ensureProxy(cache?: CacheMode, say: (line: string) => void = log): Promise<void> {
  while (proxyStarting) await proxyStarting.catch(() => {});
  if (cache) proxyCache = cache;
  proxyStarting = (async () => {
    let h = await proxyHealth();
    // the pool's proxy still running but not answering in time is busy (every run starting at once),
    // not gone: asked again, longer, before it is taken for hung and replaced (a second one started
    // beside it only fails on its port, and passes for the pool's)
    for (let i = 0; !h && proxyProc && proxyProc.exitCode === null && i < 3; i++) h = await proxyHealth(5000);
    if (!h && proxyProc && proxyProc.exitCode === null) {
      log(`the proxy (pid ${proxyProc.pid}) answers nothing in 16 s: restarting it`);
      const was = proxyProc;
      proxyProc = null;
      await stopChild(was, 1000);
    }
    const ours = !!h && h.pid === proxyProc?.pid && proxyProc.exitCode === null;
    if (h && ours && h.version === proxyVersion() && h.cache === proxyCache && h.httpDir === httpDir) return;
    if (h) {
      const why = !ours ? "it isn't the pool's" : h.version !== proxyVersion() ? 'its sources changed' : h.cache !== proxyCache ? `--cache=${proxyCache}, not ${h.cache}` : `its cache is ${h.httpDir}, not ${httpDir}`;
      say(`restarting the proxy (pid ${h.pid}): ${why}`);
      const was = proxyProc;
      proxyProc = null;
      await fetch(`${proxyUrl}/__proxy/stop`).catch(() => {});
      for (let i = 0; i < 50 && (await proxyHealth()); i++) await sleep(100);
      await stopChild(was, 1000);
    }
    mkdirSync(cacheDir, { recursive: true });
    const proc = spawnChild(process.execPath, [join(import.meta.dirname, 'proxy.ts'), `--port=${proxyPort}`, `--cache=${proxyCache}`], { log: proxyLog });
    proxyProc = proc;
    proc.once('exit', (code, sig) => {
      if (proxyProc !== proc || stopping) return;
      proxyProc = null;
      log(`the proxy exited (${sig ?? code})${browsers.size ? ': starting it again, the browsers reach every site through it' : ''}`);
      if (browsers.size) void ensureProxy().catch((e: Error) => log(e.message));
    });
    for (let i = 0; i < 100; i++) {
      const now = await proxyHealth();
      if (now?.pid === proc.pid) return say(`started the proxy on :${proxyPort}, pid ${proc.pid}, --cache=${proxyCache}, log ${proxyLog}`);
      // one that exits (offline without a certificate) says why last in its log
      if (proc.exitCode !== null) break;
      await sleep(100);
    }
    const last = readFileSync(proxyLog, 'utf8').trimEnd().split('\n').pop();
    throw new Error(`the proxy didn't start: ${last}; see ${proxyLog}`);
  })();
  try {
    await proxyStarting;
  } finally {
    proxyStarting = null;
  }
}

// ------------------------------------------------------------------ browsers and windows

const allWindows = (): Win[] => [...browsers.values()].flatMap((b) => [...b.windows]);
const leasedIn = (b: Browser): number => [...b.windows].filter((w) => w.state === 'leased').length;

/** Starts browser `n`: a fresh profile (a temporary directory, removed at each start), its DevTools port, the pool connected. */
function startBrowser(n: number): Browser {
  const dir = join(poolDir, `chromium-${n}`);
  const b: Browser = { n, dir, up: false, ready: Promise.resolve(), windows: new Set(), clipboard: { holder: null, queue: [] }, strays: new Set(), since: Date.now(), emptySince: Date.now(), closing: false };
  browsers.set(n, b);
  b.ready = reserve(COST.browser, async () => {
    // the proxy its flags name, up first
    await ensureProxy();
    rmSync(dir, { recursive: true, force: true });
    const profile = join(dir, 'profile');
    mkdirSync(profile, { recursive: true });
    const logFile = join(dir, 'chromium.log');
    const proc = spawnChild(executablePath, ['--headless=new', ...FLAGS, `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { log: logFile });
    b.proc = proc;
    proc.once('exit', (code, sig) => browserGone(b, `it exited (${sig ?? code})`));
    let port = 0;
    let path = '';
    for (let i = 0; i < 300 && !port; i++) {
      await sleep(50);
      if (proc.exitCode !== null) throw new Error(`Chromium ${n} exited (${proc.exitCode}); see ${logFile}`);
      try {
        [port, path] = (([p, q]) => [Number(p), q!])(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n'));
      } catch {}
    }
    if (!port) throw new Error(`Chromium ${n} didn't start in 15s; see ${logFile}`);
    const cdp = await Cdp.connect(`ws://127.0.0.1:${port}${path}`);
    b.port = port;
    b.cdp = cdp;
    cdp.onClose(() => browserGone(b, 'its DevTools connection closed'));
    await cdp.send('Target.setDiscoverTargets', { discover: true });
    // a window's page gone under it: crashed, or closed by something else than the pool
    const lost = (why: string) => (p: { targetId: string }) => {
      const w = [...b.windows].find((x) => x.targetId === p.targetId);
      if (w && !w.destroying) destroyWindow(w, why, true);
    };
    cdp.on('Target.targetCrashed', lost('its page crashed'));
    cdp.on('Target.targetDestroyed', lost('its page was closed'));
    b.up = true;
    log(`started Chromium ${n} (pid ${proc.pid}, port ${port}, ${dir})`);
  });
  b.ready.catch((e: Error) => {
    log(`Chromium ${n} didn't start: ${e.message}`);
    void closeBrowser(b, "it didn't start");
  });
  return b;
}

/** A browser gone (exited, its connection lost): its windows lost with it. */
function browserGone(b: Browser, why: string): void {
  if (browsers.get(b.n) !== b) return;
  browsers.delete(b.n);
  if (!b.closing) log(`Chromium ${b.n} is gone: ${why}`);
  b.closing = true;
  for (const w of [...b.windows]) destroyWindow(w, `its browser is gone (${why})`, true);
  for (const q of b.clipboard.queue) q.conn.sock.destroy();
  b.cdp?.close();
  void stopChild(b.proc, 1000).then(() => rmSync(b.dir, { recursive: true, force: true }));
  pump();
}

async function closeBrowser(b: Browser, why: string): Promise<void> {
  if (b.closing && browsers.get(b.n) !== b) return;
  b.closing = true;
  log(`stopping Chromium ${b.n}: ${why}`);
  await b.cdp?.send('Browser.close', {}, undefined, 3000).catch(() => {});
  await stopChild(b.proc, 3000);
  browserGone(b, why);
}

/**
 * The browser for a new window, deciding at once (a browser it starts is in the pool before it is up):
 * one with room and no lease (runs spread over the browsers, each its clipboard), else a new one while
 * fewer than `BROWSERS` run, else the one with room and the fewest leases; with no room anywhere, the
 * longest idle warm window (of any app) destroyed for it. Null: wait.
 */
function browserFor(): Browser | null {
  const up = [...browsers.values()].filter((b) => !b.closing);
  const roomy = up.filter((b) => b.windows.size < WINDOWS).sort((a, b) => leasedIn(a) - leasedIn(b) || a.windows.size - b.windows.size);
  const best = roomy[0];
  const free = Array.from({ length: BROWSERS }, (_, n) => n).find((n) => !browsers.has(n));
  const canStart = free !== undefined && (fits(COST.browser + COST.window) || nothingLeased());
  if (best && (leasedIn(best) === 0 || !canStart)) {
    if (fits(COST.window) || nothingLeased()) return best;
    // room made (a warm window, of any kind, destroyed), the request is tried again on the next pass
    evictIdlest('the container is short of tasks');
    return null;
  }
  if (canStart) return startBrowser(free);
  const victim = idlest(up.flatMap((b) => [...b.windows]));
  if (victim) {
    destroyWindow(victim, 'its place taken by a window of another app', false);
    return victim.browser;
  }
  return null;
}

/** Destroys the warm window, of any kind, no client has taken for longest; false where there is none. */
function evictIdlest(why: string): boolean {
  const w = idlest<Win | OWin>([...allWindows(), ...allOWindows()]);
  if (!w) return false;
  if (w.kind === 'window') destroyWindow(w, why, false);
  else destroyOWindow(w, why, false);
  return true;
}

/** The warm window no client has taken for longest. */
function idlest<W extends Win | OWin>(ws: W[]): W | undefined {
  return ws.filter((w) => w.state === 'warm' && !w.destroying).sort((a, b) => a.lastUsed - b.lastUsed)[0];
}

function claim<W extends Win | OWin>(w: W, conn: Conn): W {
  if (conn.lease && conn.lease !== w) throw new Error(`a second lease for ${whoOf(conn)}`);
  w.state = 'leased';
  w.conn = conn;
  w.lastUsed = Date.now();
  conn.lease = w;
  return w;
}

/** A window of the app for `conn` (`Lease.window`), or false where there is no room yet. */
function attemptWindow(conn: Conn, req: { id: number; app: string; key: string; fresh: boolean }): boolean {
  const reply = (w: Win, warm: boolean): void => {
    if (conn.closed || w.destroying) {
      if (!w.destroying) destroyWindow(w, `its client (${whoOf(conn)}) left before it was ready`, true);
      return;
    }
    log(`${whoOf(conn)} has ${w.app}'s window ${w.id} in Chromium ${w.browser.n}${warm ? ', warm (a hot start)' : ', new'}`);
    send(conn, { id: req.id, ok: true, cdp: `http://127.0.0.1:${w.browser.port}`, targetId: w.targetId, contextId: w.contextId, browser: w.browser.n, warm, meta: w.meta });
  };
  const fail = (e: Error): void => send(conn, { id: req.id, ok: false, error: e.message });
  // the app's warm windows: one of this key taken, the others (another key, or all where `fresh`) destroyed
  for (const w of allWindows()) {
    if (w.state !== 'warm' || w.app !== req.app || w.destroying) continue;
    if (req.fresh || w.key !== req.key) {
      destroyWindow(w, req.fresh ? 'a fresh window was asked for' : 'its key changed (the app, or the idle script)', false);
      continue;
    }
    claim(w, conn);
    void w.browser
      .cdp!.evaluate(w.targetId!, '1', 3000)
      .then(
        () => reply(w, true),
        (e: Error) => {
          destroyWindow(w, `it doesn't answer (${e.message})`, true);
          // a new one instead, first in line
          waiters.unshift(windowWaiter(conn, req));
          pump();
        },
      );
    return true;
  }
  const b = browserFor();
  if (!b) return false;
  const w = claim<Win>({ kind: 'window', id: ++ids, app: req.app, key: req.key, browser: b, state: 'leased', since: Date.now(), lastUsed: Date.now(), destroying: false }, conn);
  b.windows.add(w);
  void reserve(COST.window, async () => {
    await b.ready;
    const cdp = b.cdp!;
    // (a window destroyed while it is made, its client gone, has its context disposed as it comes)
    const gone = (contextId: string): boolean => {
      if (!w.destroying) return false;
      void cdp.send('Target.disposeBrowserContext', { browserContextId: contextId }, undefined, 30000).catch(() => {});
      return true;
    };
    const contextId = (await cdp.send<{ browserContextId: string }>('Target.createBrowserContext', { disposeOnDetach: false })).browserContextId;
    if (gone(contextId)) throw new Error('its client went while it was made');
    w.contextId = contextId;
    await cdp.send('Browser.grantPermissions', { permissions: PERMISSIONS, browserContextId: contextId });
    const targetId = (await cdp.send<{ targetId: string }>('Target.createTarget', { url: 'about:blank', newWindow: true, ...VIEWPORT, browserContextId: contextId })).targetId;
    if (gone(contextId)) throw new Error('its client went while it was made');
    w.targetId = targetId;
  }).then(
    () => reply(w, false),
    (e: Error) => {
      destroyWindow(w, `it didn't open: ${e.message}`, true);
      fail(new Error(`no window in Chromium ${b.n}: ${e.message}`));
    },
  );
  return true;
}

const windowWaiter = (conn: Conn, req: { id: number; app: string; key: string; fresh: boolean }): Waiter => ({
  conn,
  what: `a window of ${req.app}`,
  since: Date.now(),
  told: false,
  attempt: () => attemptWindow(conn, req),
});

/**
 * Destroys a window: its browser context disposed (its pages, storage and all with it), its kernel
 * stopped. `lost`: under a client, which is told.
 */
function destroyWindow(w: Win, why: string, _dirty: boolean): void {
  if (w.destroying) return;
  w.destroying = true;
  const b = w.browser;
  b.windows.delete(w);
  if (!b.windows.size) b.emptySince = Date.now();
  if (w.conn) {
    if (w.conn.lease === w) send(w.conn, { event: 'lost', why });
    w.conn.lease = undefined;
    releaseTurn(b.clipboard, w.conn, `its window is gone: ${why}`);
  }
  log(`closed ${w.app}'s window ${w.id} in Chromium ${b.n}${w.conn ? ` (${whoOf(w.conn)}'s)` : ''}: ${why}`);
  w.conn = undefined;
  if (w.kernel) void stopKernel(w.kernel);
  if (w.contextId && b.up && !b.closing) {
    const disposed = b.cdp!.send('Target.disposeBrowserContext', { browserContextId: w.contextId }, undefined, 30000).catch(async (e: Error) => {
      // a browser busy enough to be slow at it (its other windows' runs) is left to them, the context to
      // the sweep; one that answers nothing is in no state to hold the others, and is restarted
      const answers = await b.cdp!.send('Browser.getVersion', {}, undefined, 15000).then(
        () => true,
        () => false,
      );
      if (answers) return log(`Chromium ${b.n} didn't dispose a context (${e.message}), but answers: the sweep disposes it`);
      log(`Chromium ${b.n} didn't dispose a context (${e.message}) and answers nothing: restarting it`);
      void closeBrowser(b, "it didn't dispose a context, and answers nothing");
    });
    freed(COST.window, disposed);
  }
  pump();
}

// ------------------------------------------------------------------ SiYuan's kernels

/** The window's kernel (`Lease.kernel`): started on a new workspace for a new window, kept with a warm one, started again where it exited. */
async function kernelFor(conn: Conn, restart: boolean): Promise<{ n: number; port: number; origin: string }> {
  const w = conn.lease;
  if (!w || w.kind !== 'window') throw new Error('a kernel goes with a window: lease one first');
  if (w.kernel && !restart) {
    await w.kernel.ready;
    if (w.kernel.proc?.exitCode === null) return { n: w.kernel.n, port: w.kernel.port, origin: w.kernel.origin };
  }
  const was = w.kernel;
  if (was) await stopKernel(was);
  const { kernelOf, startKernel } = await import('./siyuan/kernel.ts');
  let n = 0;
  while (kernels.has(n)) n++;
  const info = kernelOf(n);
  const k: Kernel = { n, win: w, ready: Promise.resolve(), origin: info.origin, port: info.port };
  kernels.set(n, k);
  w.kernel = k;
  // a new window's on a new workspace (nothing an earlier window left there); one that exited, on its own again
  k.ready = reserve(COST.kernel, async () => {
    k.proc = await startKernel(info, spawnChild, sayTo(conn), !was);
    k.proc.once('exit', (code, sig) => {
      if (kernels.get(n) === k) log(`SiYuan's kernel ${n} exited (${sig ?? code})${w.destroying ? '' : `, under ${w.app}'s window ${w.id}`}`);
    });
  });
  try {
    await k.ready;
  } catch (e) {
    if (kernels.get(n) === k) kernels.delete(n);
    if (w.kernel === k) w.kernel = undefined;
    throw e;
  }
  if (w.destroying) {
    await stopKernel(k);
    throw new Error('the window went while its kernel started');
  }
  return { n, port: k.port, origin: k.origin };
}

async function stopKernel(k: Kernel): Promise<void> {
  if (kernels.get(k.n) === k) kernels.delete(k.n);
  if (k.win.kernel === k) k.win.kernel = undefined;
  await k.ready.catch(() => {});
  if (k.proc && k.proc.exitCode === null) {
    await stopChild(k.proc);
    log(`stopped SiYuan's kernel ${k.n}`);
  }
}

// ------------------------------------------------------------------ Obsidian's instances

const allOWindows = (): OWin[] => [...instances.values()].flatMap((i) => [...i.windows.values()]);

function startInstance(n: number, say: (line: string) => void, want?: { app: string; installer: string }): Instance {
  const dir = join(stateDir, 'obsidian', String(n));
  const inst: Instance = { n, dir, up: false, ready: Promise.resolve(), windows: new Map(), clipboard: { holder: null, queue: [] }, since: Date.now(), emptySince: Date.now(), closing: false, ...(want && { wanted: `${want.app} ${want.installer}` }) };
  instances.set(n, inst);
  inst.ready = reserve(COST.obsidian, async () => {
    mkdirSync(dir, { recursive: true });
    const { startInstance: start } = await import('./obsidian/instance.ts');
    const s = await start(dir, say, { spawnChild, ...(want && { want }) });
    Object.assign(inst, { proc: s.proc, xvfb: s.xvfb, port: s.port, version: s.version });
    s.proc.once('exit', (code, sig) => instanceGone(inst, `it exited (${sig ?? code})`));
    const cdp = await Cdp.connect(await Cdp.endpoint(s.port));
    inst.cdp = cdp;
    cdp.onClose(() => instanceGone(inst, 'its DevTools connection closed'));
    await cdp.send('Target.setDiscoverTargets', { discover: true });
    const lost = (why: string) => (p: { targetId: string }) => {
      const w = [...inst.windows.values()].find((x) => x.targetId === p.targetId);
      if (w && !w.destroying) destroyOWindow(w, why, true);
    };
    cdp.on('Target.targetCrashed', lost('its page crashed'));
    cdp.on('Target.targetDestroyed', lost('its window was closed'));
    inst.up = true;
  });
  inst.ready.catch((e: Error) => {
    log(`Obsidian ${n} didn't start: ${e.message}`);
    void stopInstance(inst, "it didn't start");
  });
  return inst;
}

function instanceGone(inst: Instance, why: string): void {
  if (instances.get(inst.n) !== inst) return;
  instances.delete(inst.n);
  if (!inst.closing) log(`Obsidian ${inst.n} is gone: ${why}`);
  inst.closing = true;
  for (const w of [...inst.windows.values()]) destroyOWindow(w, `its instance is gone (${why})`, true);
  for (const q of inst.clipboard.queue) q.conn.sock.destroy();
  inst.cdp?.close();
  void stopChild(inst.proc, 1000);
  void stopChild(inst.xvfb, 1000);
  pump();
}

async function stopInstance(inst: Instance, why: string): Promise<void> {
  inst.closing = true;
  log(`stopping Obsidian ${inst.n}: ${why}`);
  await stopChild(inst.proc, 3000);
  await stopChild(inst.xvfb, 1000);
  instanceGone(inst, why);
}

/** A window of an Obsidian instance for the setup (`Lease.obsidian`), or false where there is no room yet. */
function attemptObsidian(conn: Conn, req: { id: number; setup: string; key: string; fresh: boolean; appVersion?: string; installerVersion?: string }): boolean {
  // the versions asked for (`<app> <installer>`, as an instance says its own): an instance of others
  // (an older release's, started before one came out) takes no window of this request's
  const want = req.appVersion && req.installerVersion ? { app: req.appVersion, installer: req.installerVersion } : undefined;
  const wanted = want ? `${want.app} ${want.installer}` : undefined;
  const runs = (i: Instance): boolean => {
    if (!wanted) return true;
    const v = i.up ? i.version : i.wanted;
    return v === undefined || v === wanted;
  };
  const reply = (w: OWin, warm: boolean): void => {
    if (conn.closed || w.destroying) {
      if (!w.destroying) destroyOWindow(w, `its client (${whoOf(conn)}) left before it was ready`, true);
      return;
    }
    const i = w.instance;
    log(`${whoOf(conn)} has ${w.setup}'s window in Obsidian ${i.n}${warm ? ', warm (a hot start)' : ''}`);
    send(conn, { id: req.id, ok: true, n: i.n, port: i.port, dir: i.dir, warm, targetId: w.targetId, meta: w.meta });
  };
  for (const w of allOWindows()) {
    if (w.state !== 'warm' || w.setup !== req.setup || w.destroying) continue;
    if (req.fresh || w.key !== req.key || !w.targetId) {
      destroyOWindow(w, req.fresh ? 'a fresh window was asked for' : 'its key changed', false);
      continue;
    }
    claim(w, conn);
    void w.instance
      .cdp!.evaluate(w.targetId, '1', 3000)
      .then(
        () => reply(w, true),
        (e: Error) => {
          destroyOWindow(w, `it doesn't answer (${e.message})`, true);
          waiters.unshift(obsidianWaiter(conn, req));
          pump();
        },
      );
    return true;
  }
  // an instance without a window of the setup: the one with the fewest leases, else a new one
  const up = [...instances.values()].filter((i) => !i.closing && !i.windows.has(req.setup) && runs(i));
  let inst = up.sort((a, b) => a.windows.size - b.windows.size)[0];
  if (inst && !fits(COST.obsidianWindow) && !nothingLeased()) {
    // room made by the longest-idle warm window, of any kind, the request tried again after
    if (evictIdlest('the container is short of tasks')) return false;
    inst = undefined;
  }
  if (!inst) {
    let n = 0;
    while (instances.has(n)) n++;
    if (n >= OBSIDIANS) {
      // an instance of other versions no client holds a window of: stopped for one of these
      const stale = [...instances.values()].find((i) => !i.closing && !runs(i) && ![...i.windows.values()].some((w) => w.state === 'leased'));
      const named = (v?: string): string => (v ? `${v.split(' ')[0]} (installer ${v.split(' ')[1]})` : 'an unknown version');
      if (stale) void stopInstance(stale, `it runs Obsidian ${named(stale.version)}, and ${named(wanted)} is asked for`);
      return false;
    }
    if (!(fits(COST.obsidian + COST.obsidianWindow) || nothingLeased())) {
      evictIdlest('the container is short of tasks');
      return false;
    }
    inst = startInstance(n, sayTo(conn), want);
  }
  const w = claim<OWin>({ kind: 'obsidian', setup: req.setup, key: req.key, instance: inst, state: 'leased', since: Date.now(), lastUsed: Date.now(), destroying: false }, conn);
  inst.windows.set(req.setup, w);
  const i = inst;
  i.ready.then(
    () => reply(w, false),
    (e: Error) => {
      destroyOWindow(w, `its instance didn't start: ${e.message}`, true);
      send(conn, { id: req.id, ok: false, error: `Obsidian ${i.n} didn't start: ${e.message}` });
    },
  );
  return true;
}

const obsidianWaiter = (conn: Conn, req: { id: number; setup: string; key: string; fresh: boolean; appVersion?: string; installerVersion?: string }): Waiter => ({
  conn,
  what: `a window of ${req.setup} in Obsidian`,
  since: Date.now(),
  told: false,
  attempt: () => attemptObsidian(conn, req),
});

/** Closes a setup's window in an instance (its target, else every window on its vault); one that won't close takes its instance with it, where no other client is in it. */
function destroyOWindow(w: OWin, why: string, dirty: boolean): void {
  if (w.destroying) return;
  w.destroying = true;
  const inst = w.instance;
  if (inst.windows.get(w.setup) === w) inst.windows.delete(w.setup);
  if (!inst.windows.size) inst.emptySince = Date.now();
  if (w.conn) {
    if (w.conn.lease === w) send(w.conn, { event: 'lost', why });
    w.conn.lease = undefined;
    releaseTurn(inst.clipboard, w.conn, `its window is gone: ${why}`);
  }
  log(`closed ${w.setup}'s window in Obsidian ${inst.n}${w.conn ? ` (${whoOf(w.conn)}'s)` : ''}: ${why}`);
  w.conn = undefined;
  if (!inst.up || inst.closing) return pump();
  const vault = join(inst.dir, w.setup);
  const closing = (async () => {
    const cdp = inst.cdp!;
    const targets = w.targetId
      ? [w.targetId]
      : (await cdp.send<{ targetInfos: { targetId: string; type: string }[] }>('Target.getTargets')).targetInfos.filter((t) => t.type === 'page').map((t) => t.targetId);
    for (const t of targets) {
      const path = w.targetId ? vault : await cdp.evaluate<string | undefined>(t, 'window.app?.vault?.adapter?.basePath', 2000).catch(() => undefined);
      if (path === vault) await cdp.evaluate(t, 'window.close()', 2000).catch(() => cdp.send('Target.closeTarget', { targetId: t }, undefined, 3000));
    }
    if (dirty) rmSync(vault, { recursive: true, force: true });
  })();
  freed(COST.obsidianWindow, closing);
  closing.catch((e: Error) => {
    if ([...inst.windows.values()].some((x) => x.state === 'leased')) return log(`Obsidian ${inst.n} didn't close ${w.setup}'s window: ${e.message}`);
    void stopInstance(inst, `it didn't close ${w.setup}'s window (${e.message})`);
  });
  pump();
}

// ------------------------------------------------------------------ turns: clipboards, locks

function takeTurn(turn: Turn, conn: Conn, grant: () => void, deny?: (why: string) => void): void {
  if (turn.holder === conn) return grant();
  if (!turn.holder || turn.holder.closed) {
    turn.holder = conn;
    return grant();
  }
  turn.queue.push({ conn, grant, ...(deny && { deny }) });
}

/**
 * Gives a turn back (where `conn` holds it), to the next in line still connected; and takes `conn` out
 * of the line, its request there answered (`why`: denied), never left waiting for an answer that can't come.
 */
function releaseTurn(turn: Turn, conn: Conn, why = 'its lease is gone'): void {
  for (const q of turn.queue) if (q.conn === conn) q.deny?.(why);
  turn.queue = turn.queue.filter((q) => q.conn !== conn);
  if (turn.holder !== conn) return;
  turn.holder = null;
  for (let q; (q = turn.queue.shift()); ) {
    if (q.conn.closed) continue;
    turn.holder = q.conn;
    q.grant();
    return;
  }
}

function clipboardOf(conn: Conn): Turn | null {
  const w = conn.lease;
  if (!w) return null;
  return w.kind === 'window' ? w.browser.clipboard : w.instance.clipboard;
}

function unlockAll(conn: Conn): void {
  for (const name of conn.locks) {
    const l = locks.get(name);
    if (!l) continue;
    releaseTurn(l, conn);
    if (!l.holder) locks.delete(name);
  }
  conn.locks.clear();
}

// ------------------------------------------------------------------ requests

/**
 * Tries each waiting request in turn. Not re-entered: making room (a warm window destroyed) asks for
 * another pass, which runs after this one, so that no request is tried while it is being served.
 */
let pumping = false;
let pumpAgain = false;
function pump(): void {
  if (stopping) return;
  if (pumping) {
    pumpAgain = true;
    return;
  }
  pumping = true;
  try {
    do {
      pumpAgain = false;
      pumpOnce();
    } while (pumpAgain);
  } finally {
    pumping = false;
  }
}

function pumpOnce(): void {
  for (let i = 0; i < waiters.length; ) {
    const w = waiters[i]!;
    if (w.conn.closed || w.conn.lease) {
      waiters.splice(i, 1);
      continue;
    }
    // taken off the line before it is tried: served, it is gone; not, it goes back where it was
    waiters.splice(i, 1);
    let served = false;
    try {
      served = w.attempt();
    } catch (e) {
      send(w.conn, { id: -1, event: 'say', line: `the pool failed a request: ${(e as Error).message}` });
      log(`a request of ${whoOf(w.conn)} failed: ${(e as Error).stack}`);
      w.conn.sock.destroy();
      continue;
    }
    if (served) continue;
    waiters.splice(i, 0, w);
    if (!w.told) {
      w.told = true;
      sayTo(w.conn)(`the pool has no room for ${w.what} yet: waiting (\`node sxs/pool.ts status\` says what holds it)`);
    }
    i++;
  }
}

function release(conn: Conn, clean: boolean, meta?: Record<string, unknown>): void {
  const w = conn.lease;
  if (!w) return;
  const turn = clipboardOf(conn);
  if (turn) releaseTurn(turn, conn);
  if (clean && !w.destroying) {
    conn.lease = undefined;
    w.conn = undefined;
    w.state = 'warm';
    w.meta = meta;
    w.lastUsed = Date.now();
    log(`${whoOf(conn)} released ${w.kind === 'window' ? `${w.app}'s window ${w.id}` : `${w.setup}'s window in Obsidian ${w.instance.n}`} cleanly: kept loaded`);
  } else if (w.kind === 'window') destroyWindow(w, `${whoOf(conn)} released it after errors`, true);
  else destroyOWindow(w, `${whoOf(conn)} released it after errors`, true);
  pump();
}

async function handle(conn: Conn, m: { id: number; op: string; [k: string]: any }): Promise<void> {
  const reply = (r: object = {}): void => send(conn, { id: m.id, ok: true, ...r });
  const refuse = (): void => {
    if (draining || stopping) throw new Error('the pool is draining (its code changed, or it stops): try again once it is gone');
  };
  switch (m.op) {
    case 'hello':
      conn.pid = Number(m.pid) || 0;
      conn.who = String(m.who ?? 'a client');
      return reply({ version: VERSION, pid: process.pid });
    case 'status':
      return reply({ status: status() });
    case 'stop': {
      const lines = await shutdown(`${whoOf(conn)} asked it to stop`);
      reply({ lines });
      setTimeout(() => process.exit(0), 200);
      return;
    }
    case 'drain':
      draining = true;
      log(`draining, as ${whoOf(conn)} asked (it runs other code): no new leases`);
      reply();
      return;
    case 'proxy':
      refuse();
      await ensureProxy(m.cache as CacheMode, sayTo(conn));
      return reply({ port: proxyPort });
    case 'lock': {
      refuse();
      const name = String(m.name);
      let l = locks.get(name);
      if (!l) locks.set(name, (l = { holder: null, queue: [] }));
      if (l.holder && !l.holder.closed && l.holder !== conn && !m.wait) throw new Error(`another run has ${name} (${whoOf(l.holder)})`);
      conn.locks.add(name);
      if (l.holder && l.holder !== conn) sayTo(conn)(`waiting for ${name}, which ${whoOf(l.holder)} has`);
      return takeTurn(l, conn, () => reply());
    }
    case 'room': {
      // room for a run's own processes (itself, an app it starts outside the pool): granted as it fits,
      // in line with the windows asked for, and held while the connection is
      refuse();
      if (conn.room) throw new Error('this connection has room already: one a connection');
      const cost = Math.max(1, Math.round(Number(m.cost) || 0));
      const what = String(m.what ?? whoOf(conn));
      waiters.push({
        conn,
        what: `room for ${what} (${cost} tasks)`,
        since: Date.now(),
        told: false,
        attempt: () => {
          // (the pool holds nothing, and no run has room: it starts, the cap or not, rather than wait for no one)
          if (!fits(cost) && !(nothingLeased() && !roomTasks())) {
            evictIdlest('the container is short of tasks');
            return false;
          }
          conn.room = cost;
          conn.roomFor = what;
          reply();
          return true;
        },
      });
      return pump();
    }
    case 'window':
    case 'obsidian': {
      refuse();
      if (conn.lease) throw new Error('this connection holds a lease already: one a connection');
      const req = { id: m.id, key: String(m.key ?? ''), fresh: !!m.fresh, ...(m.op === 'window' ? { app: String(m.app) } : { setup: String(m.setup), ...(m.appVersion && m.installerVersion && { appVersion: String(m.appVersion), installerVersion: String(m.installerVersion) }) }) };
      const waiter = m.op === 'window' ? windowWaiter(conn, req as never) : obsidianWaiter(conn, req as never);
      waiters.push(waiter);
      return pump();
    }
    case 'clipboard': {
      const turn = clipboardOf(conn);
      if (!turn) throw new Error('no window leased: a clipboard goes with one');
      const w = conn.lease!;
      // the permissions to read it granted again as it is taken (the pool's own grant, per context: no client's connection resets it)
      return takeTurn(
        turn,
        conn,
        () => {
          if (w.kind === 'window' && w.contextId && w.browser.up)
            void w.browser.cdp!.send('Browser.grantPermissions', { permissions: PERMISSIONS, browserContextId: w.contextId }).catch(() => {});
          reply();
        },
        (why) => send(conn, { id: m.id, ok: false, error: `no clipboard: ${why}` }),
      );
    }
    case 'unclipboard': {
      const turn = clipboardOf(conn);
      if (turn) releaseTurn(turn, conn);
      return reply();
    }
    case 'kernel':
      return reply(await kernelFor(conn, !!m.restart));
    case 'bind': {
      const w = conn.lease;
      if (!w || w.kind !== 'obsidian') throw new Error('bind: no Obsidian window leased');
      w.targetId = String(m.targetId);
      return reply();
    }
    case 'release':
      release(conn, !!m.clean, m.meta);
      return reply();
    default:
      throw new Error(`unknown request: ${m.op}`);
  }
}

function onConnection(sock: Socket): void {
  const conn: Conn = { id: ++ids, sock, pid: 0, who: 'a client', since: Date.now(), closed: false, locks: new Set(), room: 0 };
  conns.add(conn);
  let buf = '';
  sock.setEncoding('utf8');
  sock.on('data', (d: string) => {
    buf += d;
    for (let i; (i = buf.indexOf('\n')) >= 0; ) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (!line) continue;
      let m: { id: number; op: string };
      try {
        m = JSON.parse(line);
      } catch {
        continue;
      }
      handle(conn, m).catch((e: Error) => send(conn, { id: m.id, ok: false, error: e.message }));
    }
  });
  const close = (): void => {
    if (conn.closed) return;
    conn.closed = true;
    conns.delete(conn);
    const w = conn.lease;
    if (w) {
      const why = `its client, ${whoOf(conn)}, left without releasing it`;
      if (w.kind === 'window') destroyWindow(w, why, true);
      else destroyOWindow(w, why, true);
    }
    unlockAll(conn);
    for (const b of browsers.values()) releaseTurn(b.clipboard, conn);
    for (const i of instances.values()) releaseTurn(i.clipboard, conn);
    pump();
  };
  sock.on('close', close);
  sock.on('error', close);
}

// ------------------------------------------------------------------ housekeeping

/** Every two seconds: clients whose process is gone dropped, what was idle too long stopped, the pool exited once empty. */
/**
 * Disposes the contexts of a browser no window of its has, found on two sweeps in a row (every 30 s:
 * a context a window is being made in, not its yet, is its by the next): a creation given up
 * on that the browser carried out after, a dispose that timed out.
 */
async function sweep(b: Browser): Promise<void> {
  if (!b.up || b.closing || !b.cdp) return;
  // (not while a window of its is being made: its context, not yet its, isn't a stray)
  if ([...b.windows].some((w) => !w.targetId)) return;
  const ids = await b.cdp.send<{ browserContextIds: string[] }>('Target.getBrowserContexts', {}, undefined, 5000).then(
    (r) => r.browserContextIds,
    () => null,
  );
  if (!ids) return;
  const known = new Set([...b.windows].map((w) => w.contextId));
  const strays = new Set(ids.filter((id) => !known.has(id)));
  for (const id of strays) {
    if (!b.strays.has(id)) continue;
    log(`disposing a context of Chromium ${b.n} no window has (${id.slice(0, 8)})`);
    void b.cdp.send('Target.disposeBrowserContext', { browserContextId: id }, undefined, 30000).catch(() => {});
    strays.delete(id);
  }
  b.strays = strays;
}

let ticks = 0;
function tick(): void {
  if (stopping) return;
  const now = Date.now();
  for (const c of conns)
    if (c.pid && !alive(c.pid)) {
      log(`${whoOf(c)} is gone`);
      c.sock.destroy();
    }
  for (const w of allWindows()) if (w.state === 'warm' && now - w.lastUsed > IDLE) destroyWindow(w, `no client of ${w.app} took it for ${ago(w.lastUsed)}`, false);
  for (const w of allOWindows()) if (w.state === 'warm' && now - w.lastUsed > IDLE) destroyOWindow(w, `no client of ${w.setup} took it for ${ago(w.lastUsed)}`, false);
  if (++ticks % 15 === 0) for (const b of browsers.values()) void sweep(b);
  const waiting = waiters.some((w) => !w.conn.closed);
  for (const b of browsers.values()) if (b.up && !b.closing && !b.windows.size && !waiting && now - b.emptySince > IDLE) void closeBrowser(b, `no window for ${ago(b.emptySince)}`);
  for (const i of instances.values()) if (i.up && !i.closing && !i.windows.size && !waiting && now - i.emptySince > IDLE) void stopInstance(i, `no window for ${ago(i.emptySince)}`);
  pump();
  if (draining && ![...conns].some((c) => c.lease || c.room || c.locks.size) && !waiting) {
    void shutdown('drained').then(() => process.exit(0));
    return;
  }
  const empty = !conns.size && !browsers.size && !instances.size && !kernels.size;
  if (!empty) emptySince = now;
  else if (now - emptySince > EXIT_AFTER) void shutdown(`nothing to do for ${ago(emptySince)}`).then(() => process.exit(0));
}

let server: Server | undefined;

async function shutdown(why: string): Promise<string[]> {
  const lines: string[] = [];
  const say = (l: string): void => {
    lines.push(l);
    log(l);
  };
  if (stopping) return lines;
  stopping = true;
  say(`the pool stops: ${why}`);
  server?.close();
  rmSync(poolSocket, { force: true });
  for (const c of conns) send(c, { event: 'say', line: `the pool stops: ${why}` });
  await Promise.all([...browsers.values()].map(async (b) => (await closeBrowser(b, why), say(`stopped Chromium ${b.n}`))));
  await Promise.all([...instances.values()].map(async (i) => (await stopInstance(i, why), say(`stopped Obsidian ${i.n}`))));
  await Promise.all([...kernels.values()].map(async (k) => (await stopKernel(k), say(`stopped SiYuan's kernel ${k.n}`))));
  const proxied = !!(await proxyHealth());
  await Promise.all([...children].map((p) => stopChild(p, 2000)));
  // a proxy not the pool's (the design before's)
  if (await proxyHealth()) await fetch(`${proxyUrl}/__proxy/stop`).catch(() => {});
  if (proxied) say('stopped the proxy');
  for (const c of conns) c.sock.destroy();
  return lines;
}

/**
 * What the pool before this one (browsers, kernels and instances started detached, recorded in files)
 * left running in this container: stopped, its profiles removed. Only processes that are what their
 * records say (by their command line), a pid since reused being left alone.
 */
function cleanUpOldDesign(say: (line: string) => void): void {
  const cmdline = (pid: number): string => {
    try {
      return readFileSync(`/proc/${pid}/cmdline`, 'utf8').replaceAll('\0', ' ');
    } catch {
      return '';
    }
  };
  const kill = (pid: number, like: RegExp, what: string): void => {
    if (!pid || !alive(pid) || !like.test(cmdline(pid))) return;
    for (const target of [-pid, pid])
      try {
        process.kill(target, 'SIGKILL');
      } catch {}
    say(`stopped ${what} (pid ${pid}) the old pool left running`);
  };
  const old = join(stateDir, 'chromium');
  if (existsSync(old)) {
    for (const n of readdirSync(old)) {
      const dir = join(old, n);
      try {
        kill(Number(readFileSync(join(dir, 'pid'), 'utf8')), /chrom/i, `Chromium ${n}`);
      } catch {}
      try {
        const [, host, pid] = /^(.*)-(\d+)$/.exec(readlinkSync(join(dir, 'profile', 'SingletonLock'))) ?? [];
        if (host === hostname()) kill(Number(pid), /chrom/i, `Chromium ${n}`);
      } catch {}
    }
    rmSync(old, { recursive: true, force: true });
  }
  for (const app of ['siyuan', 'obsidian']) {
    const base = join(stateDir, app);
    if (!existsSync(base)) continue;
    for (const n of readdirSync(base)) {
      const file = join(base, n, 'server.pid');
      try {
        kill(Number(readFileSync(file, 'utf8')), app === 'siyuan' ? /SiYuan/ : /obsidian|electron/i, `${app === 'siyuan' ? "SiYuan's kernel" : 'Obsidian'} ${n}`);
      } catch {}
      rmSync(file, { force: true });
      for (const f of ['kernel.lock', 'port', 'version', 'pool.lock']) rmSync(join(base, n, f), { force: true });
    }
  }
}

// ------------------------------------------------------------------ status

function status(): object {
  const t = tasks();
  const holder = (c: Conn | null | undefined): string | null => (c ? whoOf(c) : null);
  return {
    pid: process.pid,
    version: VERSION,
    up: ago(startedAt),
    draining,
    tasks: t && { current: t.current, max: t.max, refused: t.hits },
    limits: { browsers: BROWSERS, windows: WINDOWS, obsidians: OBSIDIANS, idleMinutes: IDLE / 60_000 },
    browsers: [...browsers.values()].map((b) => ({
      n: b.n,
      pid: b.proc?.pid,
      port: b.port,
      up: b.up ? ago(b.since) : 'starting',
      clipboard: holder(b.clipboard.holder),
      clipboardQueue: b.clipboard.queue.length,
      windows: [...b.windows].map((w) => ({ id: w.id, app: w.app, state: w.state, holder: holder(w.conn), since: ago(w.since), idle: w.state === 'warm' ? ago(w.lastUsed) : null, context: w.contextId?.slice(0, 8), kernel: w.kernel?.n })),
    })),
    obsidians: [...instances.values()].map((i) => ({
      n: i.n,
      pid: i.proc?.pid,
      port: i.port,
      version: i.version,
      up: i.up ? ago(i.since) : 'starting',
      clipboard: holder(i.clipboard.holder),
      windows: [...i.windows.values()].map((w) => ({ setup: w.setup, state: w.state, holder: holder(w.conn), since: ago(w.since), idle: w.state === 'warm' ? ago(w.lastUsed) : null })),
    })),
    kernels: [...kernels.values()].map((k) => ({ n: k.n, pid: k.proc?.pid, port: k.port, window: `${k.win.app} ${k.win.id}` })),
    proxy: proxyProc && proxyProc.exitCode === null ? { pid: proxyProc.pid, port: proxyPort, cache: proxyCache } : null,
    locks: [...locks].map(([name, l]) => ({ name, holder: holder(l.holder), waiting: l.queue.map((q) => whoOf(q.conn)) })),
    clients: [...conns].map((c) => ({ who: c.who, pid: c.pid, alive: c.pid ? alive(c.pid) : null, since: ago(c.since), holds: c.lease ? (c.lease.kind === 'window' ? `${c.lease.app}'s window ${c.lease.id}` : `${c.lease.setup} in Obsidian ${c.lease.instance.n}`) : c.room ? `room for ${c.roomFor} (${c.room} tasks)` : null, locks: [...c.locks] })),
    waiting: waiters.filter((w) => !w.conn.closed).map((w) => ({ who: whoOf(w.conn), for: w.what, since: ago(w.since) })),
  };
}

function printStatus(s: any): void {
  const out: string[] = [];
  out.push(`pool pid ${s.pid}, code ${s.version}, up ${s.up}${s.draining ? ', DRAINING' : ''}; tasks ${s.tasks ? `${s.tasks.current}/${s.tasks.max}${s.tasks.refused ? `, ${s.tasks.refused} refused` : ''}` : 'uncapped'}`);
  out.push(`limits: ${s.limits.browsers} browsers × ${s.limits.windows} windows, ${s.limits.obsidians} Obsidians, idle ${s.limits.idleMinutes} min`);
  out.push(s.proxy ? `proxy pid ${s.proxy.pid} on :${s.proxy.port}, --cache=${s.proxy.cache}` : 'proxy: not running (started with the first browser)');
  for (const b of s.browsers) {
    out.push(`Chromium ${b.n} (pid ${b.pid ?? '-'}, port ${b.port ?? '-'}, up ${b.up})${b.clipboard ? `, clipboard: ${b.clipboard}${b.clipboardQueue ? ` (+${b.clipboardQueue} waiting)` : ''}` : ''}`);
    for (const w of b.windows) out.push(`  window ${String(w.id).padEnd(4)} ${w.app.padEnd(24)} ${w.state === 'warm' ? `warm, idle ${w.idle}` : `leased by ${w.holder}`}  (since ${w.since}, context ${w.context ?? '-'}${w.kernel !== undefined ? `, kernel ${w.kernel}` : ''})`);
  }
  for (const i of s.obsidians) {
    out.push(`Obsidian ${i.n} ${i.version ? `${i.version.split(' ')[0]} (installer ${i.version.split(' ')[1]})` : ''} (pid ${i.pid ?? '-'}, port ${i.port ?? '-'}, up ${i.up})${i.clipboard ? `, clipboard: ${i.clipboard}` : ''}`);
    for (const w of i.windows) out.push(`  ${w.setup.padEnd(28)} ${w.state === 'warm' ? `warm, idle ${w.idle}` : `leased by ${w.holder}`}  (since ${w.since})`);
  }
  for (const k of s.kernels) out.push(`SiYuan kernel ${k.n} (pid ${k.pid ?? 'starting'}, port ${k.port}) for window ${k.window}`);
  for (const l of s.locks) out.push(`lock ${l.name}: ${l.holder ?? 'free'}${l.waiting.length ? `; waiting: ${l.waiting.join(', ')}` : ''}`);
  for (const w of s.waiting) out.push(`waiting: ${w.who} for ${w.for}, ${w.since}`);
  out.push(`clients: ${s.clients.length}`);
  for (const c of s.clients) out.push(`  ${c.who} (pid ${c.pid}${c.alive === false ? ', GONE' : ''}), ${c.since}${c.holds ? `: ${c.holds}` : ''}${c.locks.length ? ` [${c.locks.join(', ')}]` : ''}`);
  console.log(out.join('\n'));
}

// ------------------------------------------------------------------ main

let startedAt = Date.now();

async function serve(): Promise<void> {
  mkdirSync(poolDir, { recursive: true });
  try {
    if (statSync(poolLog).size > 20_000_000) truncateSync(poolLog, 0);
  } catch {}
  // (stdout is pool.log, or a pipe that may close: what can't be written isn't, rather than throw)
  process.stdout.on('error', () => {});
  // one pool: another starting at once (two clients found none) leaves it to the first. A pool that
  // stops (drained, its code changed) removes its socket first and holds the lock a moment more, as it
  // stops its browsers: the next one, started by a client that saw the socket go, waits for that lock
  // while no socket comes, rather than leave the client with none
  for (const t0 = Date.now(); ; ) {
    try {
      await takeLock(join(poolDir, 'daemon.lock'), false, 'the pool');
      break;
    } catch {
      if (existsSync(poolSocket) || Date.now() - t0 > 20000) return;
      await sleep(200);
    }
  }
  startedAt = Date.now();
  // a socket left by a pool that died; and the browsers' profiles it left
  rmSync(poolSocket, { force: true });
  for (const d of readdirSync(poolDir)) if (/^chromium-\d+$/.test(d)) rmSync(join(poolDir, d), { recursive: true, force: true });
  cleanUpOldDesign(log);
  if (!setpriv) log('setpriv not found: the pool\'s children outlive it if it is killed (util-linux has it)');
  server = createServer(onConnection);
  await new Promise<void>((resolve, reject) => server!.listen(poolSocket, resolve).once('error', reject));
  log(`the pool runs: pid ${process.pid}, code ${VERSION}, ${poolSocket}; ${BROWSERS} browsers × ${WINDOWS} windows, ${OBSIDIANS} Obsidians, idle ${IDLE / 60_000} min`);
  const stop = (why: string, code: number) => (): void => void shutdown(why).finally(() => process.exit(code));
  process.on('SIGTERM', stop('SIGTERM', 0));
  process.on('SIGINT', stop('SIGINT', 0));
  process.on('SIGHUP', () => {});
  let failing = false;
  process.on('uncaughtException', (e) => {
    // (once: an error in the stopping isn't another reason to stop)
    if (failing) return;
    failing = true;
    log(`uncaught: ${e.stack ?? e}`);
    stop('an uncaught error', 1)();
  });
  process.on('unhandledRejection', (e) => log(`unhandled rejection: ${(e as Error)?.stack ?? e}`));
  setInterval(tick, 2000);
}

const HELP = `The SxS's pool: the headless Chromiums, SiYuan's kernels, Obsidian's instances and the proxy the
runs share, handed out to them as leases (dev/27-sxs.md has the design).

usage: node sxs/pool.ts <command>

commands:
  status [--json]   what runs, who holds what, since when, what waits; the tasks in use of the cap
  stop              stops the pool and everything it runs (as \`node sxs/run.ts --stop\` does)
  serve             runs the pool in the foreground (a run starts it as needed; it exits once it has
                    had nothing to do for ${EXIT_AFTER / 60_000} minutes)
  help, --help, -h  this

read as the pool starts (a pool running keeps its own: \`stop\` it to change them):
  OURUS_SXS_BROWSERS    Chromiums at most                              (${BROWSERS})
  OURUS_SXS_WINDOWS     windows a Chromium at most                     (${WINDOWS})
  OURUS_SXS_OBSIDIANS   Obsidian instances at most                     (${OBSIDIANS})
  OURUS_SXS_IDLE_MIN    minutes a warm window, an idle browser, stays  (${IDLE / 60_000})
  OURUS_PROXY_PORT      the proxy's port                               (${proxyPort})
  CHROMIUM              the Chromium to run                            (${env.CHROMIUM ?? '/usr/bin/chromium'})

The container's cap on tasks is read from /sys/fs/cgroup/pids.max (${tasks()?.max ?? 'none'} here); the pool admits
what it starts, and the room runs ask for, up to ${MARGIN * 100}% of it.

files: ${poolDir}
  pool.sock  the socket the runs connect to (one connection a lease)
  pool.log   what the pool did, and why
`;

if (import.meta.main) {
  const cmd = process.argv[2];
  if (cmd === 'help' || cmd === '--help' || cmd === '-h' || process.argv.includes('--help')) console.log(HELP);
  else if (cmd === 'serve') await serve();
  else if (cmd === 'status') {
    const conn = await connectPool('status', console.log, { start: false });
    if (!conn) console.log(`no pool runs (${poolSocket})`);
    else {
      const r = await conn.request<{ status: unknown }>('status');
      conn.close();
      if (process.argv.includes('--json')) console.log(JSON.stringify(r.status, null, 2));
      else printStatus(r.status);
    }
  } else if (cmd === 'stop') {
    await stopPool(console.log);
  } else {
    console.error(`${cmd ? `unknown command: ${cmd}\n` : ''}usage: node sxs/pool.ts status [--json] | stop | serve | --help`);
    process.exit(2);
  }
}
