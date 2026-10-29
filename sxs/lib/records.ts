// Where the records of what runs go: pids, ports, locks, a browser's flags, when a run last took an
// app's window. In the container's own state directory (`stateDir`), beside the profiles, instances
// and workspaces they are of, laid out as `.sxs/` is: not in `.sxs/`, which containers on one checkout
// share without sharing their process tables, so one's pid or lock there would be read by another as
// its own, or as stale. A record of something in `.sxs/` (a run's lock on an app, `<app>/<app>.lock`;
// a download's lock) is at the same path in `stateDir`.

import { mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { cacheDir, stateDir } from '../proxy.ts';

/** Where the records are: the container's state directory, which `run.ts --stop` walks. */
export const runDir = stateDir;

/** A path's record: itself where it is in `stateDir` (a record beside its data), else its path in `.sxs/` under `stateDir`. */
function recordPath(path: string): string {
  const inState = relative(stateDir, path);
  if (!inState.startsWith('..')) return join(stateDir, inState);
  const rel = relative(cacheDir, path);
  if (rel.startsWith('..')) throw new Error(`a record outside .sxs/ and ${stateDir}: ${path}`);
  return join(stateDir, rel);
}

/** The record for a path inside `stateDir` or `.sxs/` (`chromium/0/pool.lock`), its directory made. */
export function record(path: string): string {
  const at = recordPath(path);
  mkdirSync(dirname(at), { recursive: true });
  return at;
}

/** The records' directory for a directory inside `stateDir` or `.sxs/` (`chromium/0/`), made. */
export function recordDir(dir: string): string {
  const at = recordPath(dir);
  mkdirSync(at, { recursive: true });
  return at;
}
