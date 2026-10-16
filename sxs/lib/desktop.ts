// What a driver that starts a desktop app itself needs (`Driver.launch`): a free port for the app's
// DevTools protocol, an Xvfb when there is no display, and a lock, so that two runs don't start the
// same setup at once. Obsidian's driver (obsidian/obsidian.ts) uses them.

import { spawn, type ChildProcess } from 'node:child_process';
import { linkSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { ensureAptInstalled } from './system.ts';

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });

/** An Xvfb on a display it finds free itself (`-displayfd`: two runs starting at once can't pick the same one), once it takes connections. */
export function startXvfb(say: (line: string) => void): Promise<{ display: string; proc: ChildProcess }> {
  ensureAptInstalled('a display', [{ pkg: 'xvfb', command: 'Xvfb' }], say);
  const proc = spawn('Xvfb', ['-displayfd', '3', '-screen', '0', '1280x900x24', '-nolisten', 'tcp'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe'] });
  return new Promise((resolve, reject) => {
    const fail = (why: string): void => {
      proc.kill();
      reject(new Error(`can't start Xvfb (${why})`));
    };
    const timer = setTimeout(() => fail('no display in 10s'), 10000);
    let out = '';
    proc.stdio[3]!.on('data', (d: Buffer) => {
      out += d;
      if (!out.includes('\n')) return;
      clearTimeout(timer);
      resolve({ display: `:${out.trim()}`, proc });
    });
    proc.once('error', (e) => (clearTimeout(timer), fail(e.message)));
    proc.once('exit', (code) => (clearTimeout(timer), fail(`it exited, ${code}`)));
  });
}

export const alive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'EPERM';
  }
};

/**
 * A lock for this run: the file `lock` (`<name>.lock`), holding the run's pid, linked into place whole
 * (so taken atomically) from a file of the run's own beside it (`<name>-<pid>.lock`, while it waits);
 * one whose run is gone is taken over. While another run holds it, `wait` says whether to wait for it
 * (polling, up to ten minutes) or stop. Returns its release.
 */
export async function takeLock(lock: string, wait: boolean, what: string): Promise<() => void> {
  const mine = lock.replace(/(\.lock)?$/, `-${process.pid}.lock`);
  writeFileSync(mine, String(process.pid));
  try {
    for (const t0 = Date.now(); ; ) {
      try {
        linkSync(mine, lock);
        return () => rmSync(lock, { force: true });
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
        let holder = 0;
        try {
          holder = Number(readFileSync(lock, 'utf8'));
        } catch {}
        if (!holder || !alive(holder)) rmSync(lock, { force: true });
        else if (!wait) throw new Error(`another run has ${what} (pid ${holder}, ${lock})`);
        else if (Date.now() - t0 > 600000) throw new Error(`another run has held ${what} for ten minutes (pid ${holder}, ${lock})`);
        else await sleep(200);
      }
    }
  } finally {
    rmSync(mine, { force: true });
  }
}
