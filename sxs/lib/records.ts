// Where the records of what runs go: pids, ports, locks, a browser's flags, when a run last took an
// app's window. Not in `.sxs/`, whose data (the cache, the results, the downloads, the browsers'
// profiles) the user may clean while browsers, Obsidians and kernels run: a record lost with it left
// them running unrecorded, out of `--stop`'s reach. So a runtime directory keeps them, laid out as
// `.sxs/` is (a lock beside the data it guards there), one for each `.sxs/` (checkouts don't share):
// `OURUS_SXS_RUN`, else `/run/ourus-sxs/<id>` where it can be written (root), else
// `$XDG_RUNTIME_DIR/ourus-sxs/<id>`, else the system's temporary directory's. A reboot clears it, as it
// stops what it recorded.

import { createHash } from 'node:crypto';
import { accessSync, constants, mkdirSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { cacheDir } from '../proxy.ts';

const writable = (dir: string): boolean => {
  try {
    accessSync(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

/** The runtime directory of this `.sxs/`. */
export const runDir = ((): string => {
  if (process.env.OURUS_SXS_RUN) return resolve(process.env.OURUS_SXS_RUN);
  const id = createHash('sha1').update(resolve(cacheDir)).digest('hex').slice(0, 8);
  if (writable('/run')) return join('/run/ourus-sxs', id);
  if (process.env.XDG_RUNTIME_DIR && writable(process.env.XDG_RUNTIME_DIR)) return join(process.env.XDG_RUNTIME_DIR, 'ourus-sxs', id);
  return join(tmpdir(), `ourus-sxs-${userInfo().uid}`, id);
})();

/** The record for a path inside `.sxs/` (`.sxs/chromium/0/pool.lock`): the same path under `runDir`, its directory made. */
export function record(path: string): string {
  const rel = relative(cacheDir, path);
  if (rel.startsWith('..')) throw new Error(`a record outside .sxs/: ${path}`);
  const at = join(runDir, rel);
  mkdirSync(dirname(at), { recursive: true });
  return at;
}

/** The records' directory for a directory inside `.sxs/` (`.sxs/chromium/0/`), made. */
export function recordDir(dir: string): string {
  const at = join(runDir, relative(cacheDir, dir));
  mkdirSync(at, { recursive: true });
  return at;
}
