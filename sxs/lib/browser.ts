// The browser side of a run: the proxy every browser reaches every site through, and the app's page,
// a window of the pool's (`../pool.ts`, `pool-client.ts`) in a browser context of its own; the pool
// runs both. A window is leased from the pool for a worker and given back at
// the worker's end: cleanly (`release(true)`), it stays loaded for the next run of the app (a hot
// start, `reused`); else, or where the run dies, the pool destroys it, its context with it.

import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import type { Session } from './driver.ts';
import { Lease, poolLock, poolRequest, poolRoom, stopPool } from './pool-client.ts';
import { scopeTo } from './scope.ts';
import { ensureAptInstalled } from './system.ts';
import { cacheDir, DEFAULT_PORT, type CacheMode } from '../proxy.ts';

export const proxyPort = Number(process.env.OURUS_PROXY_PORT ?? DEFAULT_PORT);
const proxyUrl = `http://127.0.0.1:${proxyPort}`;
export const proxyLog = join(cacheDir, 'proxy.log');

/**
 * The proxy running with its cache used as asked (`--cache`): the pool's (`../pool.ts`), which starts it
 * with its browsers, or restarts it where it runs with another mode or older sources.
 */
export async function ensureProxy(cache: CacheMode, say: (line: string) => void): Promise<void> {
  // its certificate is made once with openssl
  ensureAptInstalled('the proxy', [{ pkg: 'openssl', command: 'openssl' }], say);
  await poolRequest('proxy', { cache }, say, 'ensureProxy');
}

/** Per-host traffic since the last call: what was served from the cache, fetched, blocked. */
export type ProxyStats = Record<string, Record<string, { n: number; bytes: number; urls: string[] }>>;

export async function proxyStats(): Promise<ProxyStats> {
  const res = await fetch(`${proxyUrl}/__proxy/stats?reset`);
  return (await res.json()) as ProxyStats;
}

/** Stops the pool: its browsers, kernels, instances and the proxy. */
export async function stopShared(say: (line: string) => void): Promise<void> {
  await stopPool(say);
}

const executablePath = process.env.CHROMIUM ?? '/usr/bin/chromium';
const viewport = { width: 1280, height: 900 };

/** Debian's Chromium, unless `CHROMIUM` names another. */
function ensureChromium(say: (line: string) => void): void {
  if (!process.env.CHROMIUM) ensureAptInstalled('the browser', [{ pkg: 'chromium', command: executablePath }], say);
}

/** One run of an app at a time (a lock in the pool, held while the run's process lives); `wait` (a probe's) waits its turn. Returns its release. */
/** Room under the container's cap on tasks for a run's own processes (`poolRoom`), held until the returned release. */
export function runRoom(what: string, cost: number, say: (line: string) => void): Promise<() => void> {
  return poolRoom(what, cost, say);
}

/**
 * Playwright asserts, in its handler of a target attached (`CRBrowser._onAttachedToTarget`), that the
 * target has a browser context, and Chromium sometimes reports a service worker without one (one of
 * another run's windows, SilverBullet's: every run sees all of a shared browser's targets). Thrown in
 * an event handler, it ended the run, any run in that browser, whatever app it played. Only that
 * error is let go (nothing of Playwright's was left half-made: the target, never set up, is no
 * page of the run's); any other is what it was, the process's end.
 */
let toleratingTargets = false;
export function tolerateContextlessTargets(say: (line: string) => void): void {
  if (toleratingTargets) return;
  toleratingTargets = true;
  process.on('uncaughtException', (e) => {
    if (e instanceof Error && e.message.startsWith('targetInfo: {') && /_onAttachedToTarget/.test(e.stack ?? '') && !/"browserContextId"/.test(e.message)) {
      const type = /"type": "([^"]+)"/.exec(e.message)?.[1] ?? 'a target';
      const url = /"url": "([^"]*)"/.exec(e.message)?.[1] ?? '';
      say(`(Playwright's assertion on a ${type} with no browser context let go: ${url.slice(0, 100)})`);
      return;
    }
    console.error(e);
    process.exit(1);
  });
}

export function lockApp(app: string, wait: boolean, say: (line: string) => void): Promise<() => void> {
  return poolLock(`app:${app}`, wait, say);
}

export interface AppPage {
  /** The page; none (`null`, cast) for an app driven through a `session`. */
  page: Page;
  /** How the runner plays an app that isn't a page (driver.ts): its keys, typing and clipboard. */
  session?: Session;
  /** The app is loaded in it already, by a run that released it cleanly: to be checked, not opened. */
  reused: boolean;
  /** What that run left with it (`release`'s `meta`: the app's version). */
  meta?: Record<string, unknown>;
  /**
   * Ends the worker's use of it: `clean` (no example errored), it stays loaded for the next run of the
   * app, with `meta`; else it is destroyed.
   */
  release(clean: boolean, meta?: Record<string, unknown>): Promise<void>;
  /** Holds the clipboard its browser's other windows share, until the returned release: for an example that uses it. */
  clipboard?(): Promise<() => void>;
}

const leases = new WeakMap<Page, Lease>();
/** The pool's lease a page is in: for a driver that wants what goes with its window (SiYuan's kernel). */
export const leaseOf = (page: Page): Lease | undefined => leases.get(page);
export const setLease = (page: Page, lease: Lease): void => void leases.set(page, lease);

/**
 * The page of a target among a connection's pages. (Playwright files the pages of browser contexts it
 * didn't make under its default context: `page.context()` is no context of the page's, and its
 * `pages()` are every window's. A page's own calls go to its target, as they should.)
 */
export async function pageOf(browser: Browser, targetId: string): Promise<Page> {
  for (const t0 = Date.now(); Date.now() - t0 < 30000; await new Promise((r) => setTimeout(r, 100))) {
    for (const context of browser.contexts())
      for (const page of context.pages()) {
        const s = await context.newCDPSession(page).catch(() => null);
        const info = (await s?.send('Target.getTargetInfo').catch(() => null)) as { targetInfo: { targetId: string } } | null;
        await s?.detach().catch(() => {});
        if (info?.targetInfo.targetId === targetId) return page;
      }
  }
  const cdp = await browser.newBrowserCDPSession().catch(() => null);
  const targets = ((await cdp?.send('Target.getTargets').catch(() => null)) as { targetInfos: { targetId: string }[] } | null)?.targetInfos ?? [];
  const there = targets.some((t) => t.targetId === targetId);
  throw new Error(`no page for the window's target ${targetId} in 30s (${there ? 'the target is there, Playwright never attached to it' : 'the target is gone'})`);
}

/** A page's target id. */
export async function targetOf(page: Page): Promise<string> {
  const s = await page.context().newCDPSession(page);
  try {
    return ((await s.send('Target.getTargetInfo')) as { targetInfo: { targetId: string } }).targetInfo.targetId;
  } finally {
    await s.detach().catch(() => {});
  }
}

/**
 * A window of the pool's browsers for a worker of `app`: the one a run of it released cleanly, loaded
 * (`reused`), if its `key` is this one's and not `fresh`; else a new one in a new context. Waits for
 * room; null once `gone` says the worker is no longer wanted.
 */
export async function appWindow(app: string, key: string, opts: { fresh: boolean; who: string; gone?: () => boolean }, say: (line: string) => void): Promise<AppPage | null> {
  ensureChromium(say);
  const got = await Lease.window({ app, key, fresh: opts.fresh }, opts.who, say, opts.gone);
  if (!got) return null;
  const { lease, grant } = got;
  let scope: { close(): void } | undefined;
  try {
    tolerateContextlessTargets(say);
    // the window's context alone, not every run's window of the browser (`scope.ts`)
    const scoped = await scopeTo(grant.cdp, grant.contextId);
    scope = scoped;
    const browser = await chromium.connectOverCDP(scoped.endpoint, { timeout: 30000 });
    const page = await pageOf(browser, grant.targetId);
    // an emulated viewport ends with the connection that set it
    await page.setViewportSize(viewport);
    setLease(page, lease);
    lease.conn.onLost((why) => say(`${app}'s window is gone: ${why}`));
    return {
      page,
      reused: grant.warm,
      meta: grant.meta,
      clipboard: () => lease.clipboard(),
      release: async (clean, meta) => {
        await browser.close().catch(() => {});
        scoped.close();
        await lease.release(clean, meta).catch(() => {});
      },
    };
  } catch (e) {
    scope?.close();
    await lease.release(false).catch(() => {});
    throw e;
  }
}

/** A visible browser of the worker's own (`--headed`), closed at its release. */
export async function headedWindow(say: (line: string) => void): Promise<AppPage> {
  ensureChromium(say);
  const browser = await chromium.launch({ executablePath, headless: false, proxy: { server: proxyUrl }, args: ['--ignore-certificate-errors'] });
  const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true, permissions: ['clipboard-read', 'clipboard-write'] });
  return { page: await context.newPage(), reused: false, release: () => browser.close() };
}

/**
 * Loads a driver's page anew (an app left in a state its next test can't start from: Moo.do's). Its
 * settling script comes back with it: `run.ts` adds it to every page it drives, as an init script of
 * its connection's.
 */
export async function reloadPage(page: Page): Promise<void> {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
}
