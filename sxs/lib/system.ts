// The system's programs and libraries a run needs (Chromium, Xvfb, openssl, Electron's libraries,
// Emacs and tmux), installed when missing where that needs no one: on Debian and its derivatives, by
// `apt-get` as root or with passwordless `sudo`. Elsewhere, or without either, an error that says
// what to install.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/**
 * A Debian package a run needs: present when its `command` is on the PATH, or, a library, when the
 * package is installed. Alternatives are names across releases (`libasound2t64` from Debian 13 on,
 * `libasound2` before): the first apt knows is the one installed.
 */
export interface Need {
  readonly pkg: string | readonly string[];
  readonly command?: string;
}

const names = (need: Need): readonly string[] => (typeof need.pkg === 'string' ? [need.pkg] : need.pkg);

const succeeds = (command: string, args: readonly string[]): boolean => {
  try {
    execFileSync(command, args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/** Whether `command` is on the PATH (or, a path, an executable there). */
export const has = (command: string): boolean => succeeds('sh', ['-c', 'command -v "$1"', 'sh', command]);

const installed = (pkg: string): boolean => {
  try {
    return execFileSync('dpkg-query', ['-W', '-f=${db:Status-Status}', pkg], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) === 'installed';
  } catch {
    return false;
  }
};

const present = (need: Need): boolean => (need.command ? has(need.command) : names(need).some(installed));

/** How to run a command as root without asking anyone: as is, through `sudo -n`, or null when neither works. */
function asRoot(): string[] | null {
  if (process.getuid?.() === 0) return [];
  return has('sudo') && succeeds('sudo', ['-n', 'true']) ? ['sudo', '-n'] : null;
}

/** Installs by apt what of `needs` is missing, or throws saying what to install, for `who`. */
export function ensureAptInstalled(who: string, needs: readonly Need[], say: (line: string) => void): void {
  const missing = needs.filter((need) => !present(need));
  if (missing.length === 0) return;
  const wanted = [...new Set(missing.map((need) => names(need).join('|')))];
  const what = `${who} needs ${wanted.join(' ')}`;
  const manual = `install ${wanted.length > 1 ? 'them' : 'it'} (on Debian: apt install ${missing.map((need) => names(need)[0]).join(' ')})`;
  const release = existsSync('/etc/os-release') ? readFileSync('/etc/os-release', 'utf8') : '';
  if (!/^(?:ID|ID_LIKE)=.*\b(?:debian|ubuntu)\b/m.test(release) || !has('apt-get')) throw new Error(`${what}: ${manual}`);
  const root = asRoot();
  if (!root) throw new Error(`${what}, and installing needs root or passwordless sudo: ${manual}`);
  const apt = (...args: string[]): void => {
    const [command, ...rest] = [...root, 'env', 'DEBIAN_FRONTEND=noninteractive', 'apt-get', ...args];
    try {
      execFileSync(command!, rest, { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 26 });
    } catch (e) {
      const err = e as { stderr?: Buffer; message: string };
      throw new Error(`${what}; apt-get ${args[0]} failed: ${(err.stderr?.toString() || err.message).trim().split('\n').pop()}`);
    }
  };
  say(`installing ${wanted.join(' ')} for ${who} (apt-get${root.length ? ', by sudo' : ''})`);
  apt('update', '-q');
  // of each need's names, the first this release has
  const packages = [...new Set(missing.map((need) => names(need).find((name) => succeeds('apt-cache', ['show', name])) ?? names(need)[0]!))];
  apt('install', '-y', '-q', '--no-install-recommends', ...packages);
  const still = missing.filter((need) => !present(need));
  if (still.length) throw new Error(`${what}; apt-get installed ${packages.join(' ')}, but ${still.map((need) => need.command ?? names(need)[0]).join(' and ')} isn't there`);
}

// ------------------------------------------------------------------ the container's cap on tasks

/**
 * The container's tasks (processes and threads, cgroup v2): how many run, its cap (`pids.max`), and how
 * often the cap has refused one (`pids.events`' `max`). Null where there is no cap.
 */
function tasks(): { current: number; max: number; hits: number } | null {
  const read = (f: string): string => readFileSync(`/sys/fs/cgroup/${f}`, 'utf8');
  try {
    const max = Number(read('pids.max'));
    if (!Number.isFinite(max)) return null;
    return { current: Number(read('pids.current')), max, hits: Number(/^max (\d+)/m.exec(read('pids.events'))?.[1] ?? 0) };
  } catch {
    return null;
  }
}

/**
 * Watches the container's cap on tasks while a run plays (the pools are sized under it:
 * `lib/browser.ts`): where it refuses a task, a browser's or an app's thread fails to start, which
 * crashes or hangs windows, browsers and runs, so it says so as it happens (every ten seconds at
 * most). The stop it returns says how often it was refused during the run and how many tasks ran at
 * most, or how close they came where that was within a tenth of the cap.
 */
export function watchTasks(say: (line: string) => void): () => void {
  const first = tasks();
  if (!first) return () => {};
  let peak = first.current;
  let told = first.hits;
  let toldAt = 0;
  const check = (): void => {
    const now = tasks();
    if (!now) return;
    peak = Math.max(peak, now.current);
    if (now.hits > told && Date.now() - toldAt >= 10_000) {
      say(`warning: the container's cap on tasks (${now.max}) refused ${now.hits - told} just now, ${now.current} running: browsers and windows may crash or hang, and the runs in them fail`);
      [told, toldAt] = [now.hits, Date.now()];
    }
  };
  const timer = setInterval(check, 1000);
  timer.unref();
  return () => {
    clearInterval(timer);
    check();
    const last = tasks() ?? first;
    const refused = last.hits - first.hits;
    if (refused) say(`warning: the container's cap on tasks (${last.max}) refused ${refused} during the run, ${peak} running at most: a crash or a hang may be that, not the app`);
    else if (peak >= 0.9 * last.max) say(`tasks: ${peak} running at most, near the container's cap (${last.max})`);
  };
}
