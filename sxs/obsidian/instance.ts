// Obsidian's instances, as the pool starts them (`../pool.ts`) and as a `--headed` run starts one of its
// own (`obsidian.ts`). obsidian-launcher downloads the version asked for into `.sxs/obsidian/files/`
// (shared by containers on one checkout); an instance is the installer's Electron on a configuration
// directory of its own (`config/`, its `--user-data-dir`, written anew at each start), with no vault, so
// that it opens its starter window (which keeps it up between one setup's window and the next), on an
// Xvfb of its own under Linux without a display, offline. One Obsidian opens any number of vaults, each
// in a window of its own (its own `app`, settings and plugins); its windows share one clipboard.

import { spawn, type ChildProcess } from 'node:child_process';
import { closeSync, copyFileSync, linkSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ObsidianLauncher from 'obsidian-launcher';
import { freePort, sleep, startXvfb, takeLock } from '../lib/desktop.ts';
import { record } from '../lib/records.ts';
import { cacheDir } from '../proxy.ts';

/** What obsidian-launcher downloads (the app, the installer, plugins), shared by every setup: `.sxs/obsidian/files/`, its lock beside it. */
export const files = join(cacheDir, 'obsidian', 'files');
export const launcher = new ObsidianLauncher({ cacheDir: files });

export interface Versions {
  app: string;
  installer: string;
  appPath: string;
  installerPath: string;
}

/**
 * The versions to run (the app, the installer) and their downloads, resolved once a process. The
 * downloads are fetched by the launcher, not through the proxy: processes starting at once take turns,
 * so a cold cache downloads each once.
 */
const resolved = new Map<string, Promise<Versions>>();
/**
 * (`want`: the versions a run resolved, for the pool, a process that outlives a release: an instance
 * of the run's versions, not of those the pool's own resolving once found, `latest` when it started.)
 */
export const versions = (want?: { app: string; installer: string }): Promise<Versions> => {
  const asked = want ? `${want.app} ${want.installer}` : '';
  let p = resolved.get(asked);
  if (!p) {
    p = (async () => {
      mkdirSync(files, { recursive: true });
      const unlock = await takeLock(record(`${files}.lock`), true, "Obsidian's downloads");
      try {
        const [app, installer] = want ? [want.app, want.installer] : await launcher.resolveVersion(process.env.OBSIDIAN_VERSION?.trim() || 'latest', 'latest');
        return { app, installer, appPath: await launcher.downloadApp(app), installerPath: await launcher.downloadInstaller(installer) };
      } finally {
        unlock();
      }
    })().catch((e) => {
      resolved.delete(asked);
      throw e;
    });
    resolved.set(asked, p);
  }
  return p;
};

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

/** How a process is started: the pool's own spawner (its child, gone with it), else a detached one. */
export type SpawnChild = (cmd: string, args: string[], opts: { log: string; env?: NodeJS.ProcessEnv }) => ChildProcess;

const detachedSpawn: SpawnChild = (cmd, args, { log, env }) => {
  const out = openSync(log, 'w');
  const proc = spawn(cmd, args, { detached: true, stdio: ['ignore', out, out], env });
  closeSync(out);
  return proc;
};

export interface Started {
  proc: ChildProcess;
  /** Its own Xvfb, where it has one (none on a display given). */
  xvfb: ChildProcess | null;
  port: number;
  /** `<app> <installer>`. */
  version: string;
}

/** Starts an instance in `dir` on `display` (else an Xvfb of its own), once its DevTools port answers. */
export async function startInstance(dir: string, say: (line: string) => void, { display, spawnChild = detachedSpawn, want }: { display?: string; spawnChild?: SpawnChild; want?: { app: string; installer: string } } = {}): Promise<Started> {
  const v = await versions(want);
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
  const proc = spawnChild(v.installerPath, [`--user-data-dir=${config}`, `--remote-debugging-port=${port}`, ...FLAGS], { log, env: { ...process.env, DISPLAY: display ?? xvfb!.display } });
  const tail = (): string => readFileSync(log, 'utf8').split('\n').slice(-20).join('\n');
  try {
    for (const t0 = Date.now(); ; await sleep(100)) {
      if (proc.exitCode !== null) throw new Error(`Obsidian exited (${proc.exitCode}):\n${tail()}`);
      if (await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok, () => false)) break;
      if (Date.now() - t0 > 60000) throw new Error(`Obsidian's debugging port didn't answer in 60s:\n${tail()}`);
    }
  } catch (e) {
    try {
      process.kill(-proc.pid!, 'SIGKILL');
    } catch {}
    xvfb?.proc.kill();
    throw e;
  }
  const name = `${v.app}${v.installer === v.app ? '' : ` (installer ${v.installer})`}`;
  say(`started Obsidian ${name} in ${dir}${xvfb ? ` on Xvfb ${xvfb.display}` : ''} (pid ${proc.pid}, log ${log})`);
  return { proc, xvfb: xvfb?.proc ?? null, port, version: `${v.app} ${v.installer}` };
}
