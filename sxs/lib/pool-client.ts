// The pool's clients' side (the pool itself: `../pool.ts`). A client talks to the pool over a unix
// socket in the container's state directory, a JSON message a line, and a connection is a lease: what
// it holds (a window, an app's lock, a clipboard) is held while the connection is open and given back
// when it closes. A lease given back with `release({ clean: true })` stays loaded for the next client
// that asks for the same app (a hot start); any other end (a dirty release, the connection dropped, the
// client gone) destroys what it held, its browser context with it.
//
// The first client to find no pool starts it, detached; one finding a pool of other code than its own
// (`poolVersion`) asks it to drain (refuse new leases, exit once the last ends), waits, and starts one
// of its own.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, openSync, readFileSync } from 'node:fs';
import { connect as dial, type Socket } from 'node:net';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateDir } from '../proxy.ts';

export const poolDir = join(stateDir, 'pool');
export const poolSocket = join(poolDir, 'pool.sock');
export const poolLog = join(poolDir, 'pool.log');
const poolScript = fileURLToPath(new URL('../pool.ts', import.meta.url));

/** The sources the pool runs: a pool started from other ones is replaced (drained first). */
const SOURCES = ['../pool.ts', './pool-client.ts', './cdp.ts', './desktop.ts', './system.ts', '../siyuan/kernel.ts', '../obsidian/instance.ts'];
let version: string | undefined;
export function poolVersion(): string {
  if (version) return version;
  const h = createHash('sha1');
  for (const s of SOURCES) h.update(readFileSync(new URL(s, import.meta.url)));
  return (version = h.digest('hex').slice(0, 12));
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
type Say = (line: string) => void;

/** A connection to the pool: requests and their answers, and what the pool tells it unasked (`say`, `lost`). */
export class PoolConn {
  private buf = '';
  private next = 0;
  private readonly pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  private readonly lostFns = new Set<(why: string) => void>();
  closed = false;

  private readonly sock: Socket;
  private readonly say: Say;

  constructor(sock: Socket, say: Say) {
    this.sock = sock;
    this.say = say;
    sock.setEncoding('utf8');
    sock.on('data', (d: string) => {
      this.buf += d;
      for (let i; (i = this.buf.indexOf('\n')) >= 0; ) {
        const line = this.buf.slice(0, i);
        this.buf = this.buf.slice(i + 1);
        if (line) this.message(JSON.parse(line));
      }
    });
    const end = (): void => {
      if (this.closed) return;
      this.closed = true;
      for (const p of this.pending.values()) p.reject(new Error(`the pool closed the connection (its log: ${poolLog})`));
      this.pending.clear();
    };
    sock.on('close', end);
    sock.on('error', end);
  }

  private message(m: { id?: number; ok?: boolean; error?: string; event?: string; line?: string; why?: string; [k: string]: unknown }): void {
    if (m.event === 'say') return this.say(m.line!);
    if (m.event === 'lost') {
      for (const fn of this.lostFns) fn(m.why!);
      return;
    }
    const p = this.pending.get(m.id!);
    if (!p) return;
    this.pending.delete(m.id!);
    if (m.ok) p.resolve(m);
    else p.reject(new Error(m.error));
  }

  request<T = any>(op: string, args: object = {}): Promise<T> {
    if (this.closed) return Promise.reject(new Error('the connection to the pool is closed'));
    const id = ++this.next;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.sock.write(`${JSON.stringify({ id, op, ...args })}\n`);
    });
  }

  /** Told when what the lease holds is gone under it (its window crashed, its browser exited). */
  onLost(fn: (why: string) => void): void {
    this.lostFns.add(fn);
  }

  close(): void {
    this.closed = true;
    this.sock.destroy();
  }
}

function tryDial(): Promise<Socket | null> {
  return new Promise((resolve) => {
    const s = dial(poolSocket);
    s.once('connect', () => resolve(s));
    s.once('error', () => resolve(null));
  });
}

function startPool(): void {
  mkdirSync(poolDir, { recursive: true });
  const out = openSync(poolLog, 'a');
  spawn(process.execPath, [...process.execArgv, poolScript, 'serve'], { detached: true, stdio: ['ignore', out, out] }).unref();
}

/** Whether this process has checked the pool's code against its own (once, at its first connection). */
let checked = false;

/**
 * A connection to the pool, which is started if none runs (`start`; else null where none does), and
 * replaced if it runs other code than this process's.
 */
export async function connectPool(who: string, say: Say, { start = true } = {}): Promise<PoolConn | null> {
  let started = false;
  for (const t0 = Date.now(); ; ) {
    const sock = await tryDial();
    if (!sock) {
      if (!start) return null;
      if (!started) startPool();
      started = true;
      if (Date.now() - t0 > 30000) throw new Error(`the pool didn't start in 30s; see ${poolLog}`);
      await sleep(100);
      continue;
    }
    const conn = new PoolConn(sock, say);
    const hello = await Promise.race([
      conn.request<{ version: string; pid: number }>('hello', { version: poolVersion(), pid: process.pid, who }),
      sleep(15000).then(() => Promise.reject(new Error(`the pool doesn't answer on ${poolSocket} (its log: ${poolLog}); \`node sxs/pool.ts stop\`, or kill it`))),
    ]).catch((e: Error) => {
      conn.close();
      throw e;
    });
    if (hello.version === poolVersion() || checked || !start) {
      checked = true;
      return conn;
    }
    // a pool of other code: drained, and one of this code started once it is gone
    say(`the pool (pid ${hello.pid}) runs other code than this: waiting for its leases to end, then starting a new one`);
    await conn.request('drain').catch(() => {});
    conn.close();
    for (let i = 0; ; i++) {
      const s = await tryDial();
      if (!s) break;
      s.destroy();
      if (i % 60 === 59) say(`still waiting for the old pool (pid ${hello.pid}) to drain: \`node sxs/pool.ts status\` says what holds it`);
      await sleep(500);
    }
    checked = true;
  }
}

/** One request on a connection of its own, closed after. */
export async function poolRequest<T = any>(op: string, args: object, say: Say, who = 'a request'): Promise<T> {
  const conn = (await connectPool(who, say))!;
  try {
    return await conn.request<T>(op, args);
  } finally {
    conn.close();
  }
}

/**
 * A lock held in the pool while this process runs (or until the returned release): `name` is anything
 * (`app:<app>`, one run of an app at a time). With `wait`, waits its turn; else throws if it's held.
 */
export async function poolLock(name: string, wait: boolean, say: Say): Promise<() => void> {
  const conn = (await connectPool(`lock ${name}`, say))!;
  try {
    await conn.request('lock', { name, wait });
  } catch (e) {
    conn.close();
    throw e;
  }
  return () => conn.close();
}

/**
 * Room under the container's cap on tasks for `cost` of them, outside the pool (a run's own processes,
 * an app it starts itself: Emacs), waited for as the pool has it, and held until the returned release
 * (or the process's end).
 */
export async function poolRoom(what: string, cost: number, say: Say): Promise<() => void> {
  const conn = (await connectPool(`room for ${what}`, say))!;
  try {
    await conn.request('room', { what, cost });
  } catch (e) {
    conn.close();
    throw e;
  }
  return () => conn.close();
}

/**
 * Stops the pool and all it runs, whatever its code. Where none runs, one is started to stop: a pool
 * starting stops what the design before it left running (`cleanUpOldDesign` in `pool.ts`).
 */
export async function stopPool(say: Say): Promise<void> {
  const conn = (await connectPool('stop', say, { start: false })) ?? (await connectPool('stop', say))!;
  const r = await conn.request<{ lines: string[] }>('stop').catch(() => ({ lines: [] }));
  for (const l of r.lines) say(l);
  conn.close();
}

export interface WindowGrant {
  /** The browser's DevTools endpoint (`http://127.0.0.1:<port>`), for Playwright's `connectOverCDP`. */
  cdp: string;
  targetId: string;
  contextId: string;
  browser: number;
  /** The app is loaded in it already: a client released it cleanly (a hot start). */
  warm: boolean;
  /** What that client left with it (`release`'s `meta`: the app's version). */
  meta?: Record<string, unknown>;
}
export interface ObsidianGrant {
  n: number;
  port: number;
  dir: string;
  warm: boolean;
  /** The setup's window, where `warm`. */
  targetId?: string;
  meta?: Record<string, unknown>;
}
export interface KernelGrant {
  n: number;
  port: number;
  origin: string;
}

/** A lease: a window (of the pool's browsers, or of an Obsidian), and what goes with it. */
export class Lease {
  readonly conn: PoolConn;
  private constructor(conn: PoolConn) {
    this.conn = conn;
  }

  private static async take<T>(op: string, args: object, who: string, say: Say, gone?: () => boolean): Promise<{ lease: Lease; grant: T } | null> {
    const conn = (await connectPool(who, say))!;
    const asked = conn.request<T>(op, args);
    // given up on while waiting for room (`gone`): its connection closed, which takes it off the pool's queue
    let timer: NodeJS.Timeout | undefined;
    const given = gone
      ? new Promise<null>((resolve) => {
          timer = setInterval(() => gone() && resolve(null), 500);
        })
      : null;
    try {
      const grant = await (given ? Promise.race([asked, given]) : asked);
      if (!grant) {
        conn.close();
        asked.catch(() => {});
        return null;
      }
      return { lease: new Lease(conn), grant };
    } catch (e) {
      conn.close();
      throw e;
    } finally {
      clearInterval(timer);
    }
  }

  /**
   * A window of the pool's browsers for `app`, in a browser context of its own: the warm one a client
   * released cleanly if its `key` is this one's (and not `fresh`), else a new one in a new context.
   * Waits for room; null once `gone` says it's no longer wanted.
   */
  static window(req: { app: string; key: string; fresh: boolean }, who: string, say: Say, gone?: () => boolean): Promise<{ lease: Lease; grant: WindowGrant } | null> {
    return Lease.take<WindowGrant>('window', req, who, say, gone);
  }

  /** A window of an Obsidian instance for `setup` (`window` above, for Obsidian's instances). */
  static obsidian(req: { setup: string; key: string; fresh: boolean; appVersion?: string; installerVersion?: string }, who: string, say: Say, gone?: () => boolean): Promise<{ lease: Lease; grant: ObsidianGrant } | null> {
    return Lease.take<ObsidianGrant>('obsidian', req, who, say, gone);
  }

  /** Holds the clipboard the window shares with its browser's (or instance's) others, until the returned release. */
  async clipboard(): Promise<() => void> {
    await this.conn.request('clipboard');
    return () => void this.conn.request('unclipboard').catch(() => {});
  }

  /** The SiYuan kernel of the window, started if it isn't running (`restart`: it exited under the window). */
  kernel(restart = false): Promise<KernelGrant> {
    return this.conn.request<KernelGrant>('kernel', { restart });
  }

  /** Tells the pool which target is the lease's window (an Obsidian window, opened by the client). */
  async bind(targetId: string): Promise<void> {
    await this.conn.request('bind', { targetId });
  }

  /**
   * Gives the window back: `clean`, it stays loaded for the next client of its app (with `meta`); else
   * the pool destroys it, its context too. The connection closes after.
   */
  async release(clean: boolean, meta?: Record<string, unknown>): Promise<void> {
    try {
      await this.conn.request('release', { clean, meta });
    } finally {
      this.conn.close();
    }
  }
}
