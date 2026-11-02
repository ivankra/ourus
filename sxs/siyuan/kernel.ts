// SiYuan's kernel (https://github.com/siyuan-note/siyuan, AGPL-3.0), for its driver (driver.ts). The
// release for this machine is downloaded once into `.sxs/siyuan/files/` (its SHA-256 checked against
// the release's SHA256SUMS.txt), its `resources/` unpacked there (`siyuan-<version>-linux-<arch>/`) and
// the archive deleted. A kernel (`resources/kernel/SiYuan-Kernel serve`) runs for each
// window of SiYuan's the pool has (`../pool.ts`), bound to it: kernel n on a workspace of its own,
// `siyuan/<n>/workspace/` in `stateDir` (this container's: another's kernel holds its own workspace's
// lock), on port 6816 + n, its log beside it; the pool starts it (`startKernel`) as the window's first
// client asks for it (`Lease.kernel`), and stops it with the window. Each serves the web UI its window loads
// and the API (`/api/...`) the driver loads and reads through. It listens on 127.0.0.1 only (the
// workspace's `system.networkServe` is off), needs no auth code there
// (`SIYUAN_ACCESS_AUTH_CODE_BYPASS`), and has no way out: its HTTP(S) proxy is a port nothing listens
// on. A window destroyed (its client left without releasing it cleanly) has its kernel's workspace
// wiped with it; one released cleanly keeps both, loaded, for the next run.
//
// The driver's plugin (`plugin/`, the plugin API's `openTab`) is installed into the workspace, enabled,
// and plugins trusted there (Settings › Marketplace: a user's setting of the workspace).

import { execFileSync, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { arch } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { takeLock } from '../lib/desktop.ts';
import { record } from '../lib/records.ts';
import { cacheDir, stateDir } from '../proxy.ts';

/** The release to run: pinned, so a report changes when the app does, not when SiYuan releases. */
export const VERSION = process.env.SIYUAN_VERSION ?? '3.8.6';
/** Kernel 0's port; kernel n listens on the n-th after it. */
const BASE_PORT = Number(process.env.OURUS_SIYUAN_PORT ?? 6816);
/** The release, shared by containers on one checkout (`.sxs/siyuan/files/`); the kernels, each container's own (`siyuan/<n>/` in `stateDir`). */
const files = join(cacheDir, 'siyuan', 'files');
const kernels = join(stateDir, 'siyuan');
const PLUGIN = 'ourus-sxs';

/** A kernel: its number, directory (`siyuan/<n>/` in `stateDir`: workspace, log), port and origin. */
export interface Kernel {
  n: number;
  dir: string;
  workspace: string;
  log: string;
  port: number;
  origin: string;
}

export function kernelOf(n: number): Kernel {
  const dir = join(kernels, String(n));
  return { n, dir, workspace: join(dir, 'workspace'), log: join(dir, 'kernel.log'), port: BASE_PORT + n, origin: `http://127.0.0.1:${BASE_PORT + n}` };
}

/** The kernel serving a page of SiYuan's UI: by its port. */
export const kernelOfPage = (url: string): Kernel => kernelOf(Number(new URL(url).port) - BASE_PORT);

/** A port nothing listens on, as the kernel's proxy: no update, announcement or sync reaches out. */
const NOWHERE = 'http://127.0.0.1:9';

/** A call of a kernel's API (at `origin`): its `data`, or an error with its message. */
export async function api<T = unknown>(origin: string, path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${origin}/api/${path}`, { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const j = (await res.json()) as { code: number; msg: string; data: T };
  if (j.code !== 0) throw new Error(`SiYuan's /api/${path}: ${j.msg || `code ${j.code}`}`);
  return j.data;
}

/** The version of the kernel answering at `origin`, if one does. */
export async function running(origin: string): Promise<string | null> {
  try {
    return await api<string>(origin, 'system/version');
  } catch {
    return null;
  }
}

/** The release's `resources/` (kernel, stage, appearance, ...), downloaded and unpacked if it isn't yet (the archive not kept). */
async function resources(say: (line: string) => void): Promise<string> {
  const suffix = { arm64: '-arm64', x64: '' }[arch() as string];
  if (suffix === undefined) throw new Error(`no SiYuan release for ${arch()}`);
  const name = `siyuan-${VERSION}-linux${suffix}`;
  const res = join(files, name, 'resources');
  if (existsSync(join(res, 'kernel', 'SiYuan-Kernel'))) return res;
  const base = `https://github.com/siyuan-note/siyuan/releases/download/v${VERSION}`;
  const tgz = join(files, `${name}.tar.gz`);
  mkdirSync(files, { recursive: true });
  say(`downloading SiYuan ${VERSION} (${name}.tar.gz, from GitHub) ...`);
  const sums = await fetch(`${base}/SHA256SUMS.txt`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`SHA256SUMS.txt: ${r.status}`))));
  const want = sums
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .find(([, f]) => f === `${name}.tar.gz`)?.[0];
  if (!want) throw new Error(`${name}.tar.gz isn't in the release's SHA256SUMS.txt`);
  const r = await fetch(`${base}/${name}.tar.gz`);
  if (!r.ok || !r.body) throw new Error(`${name}.tar.gz: ${r.status}`);
  try {
    await pipeline(Readable.fromWeb(r.body as never), createWriteStream(tgz));
    const hash = createHash('sha256');
    await pipeline(createReadStream(tgz), hash);
    const got = hash.digest('hex');
    if (got !== want) throw new Error(`${name}.tar.gz: SHA-256 ${got}, the release says ${want}`);
    say(`unpacking SiYuan ${VERSION} into ${join(files, name)}/ ...`);
    execFileSync('tar', ['-xzf', tgz, '-C', files, `${name}/resources`]);
  } finally {
    rmSync(tgz, { force: true });
  }
  return res;
}

/** The driver's plugin in a workspace. */
const pluginDir = (workspace: string): string => join(workspace, 'data', 'plugins', PLUGIN);

/** The driver's plugin in a workspace, enabled (the kernel reads both when the UI asks for its plugins). */
function installPlugin(workspace: string): void {
  const dir = pluginDir(workspace);
  mkdirSync(dir, { recursive: true });
  for (const f of ['plugin.json', 'index.js']) copyFileSync(fileURLToPath(new URL(`./plugin/${f}`, import.meta.url)), join(dir, f));
  const petal = join(workspace, 'data', 'storage', 'petal');
  mkdirSync(petal, { recursive: true });
  writeFileSync(join(petal, 'petals.json'), JSON.stringify([{ name: PLUGIN, enabled: true }]));
}

/** How the pool starts a process: its child, in a process group of its own, gone with the pool. */
export type SpawnChild = (cmd: string, args: string[], opts: { log: string; env?: NodeJS.ProcessEnv }) => ChildProcess;

/**
 * Starts kernel `k` of `VERSION` (for the pool, which owns it: `spawnChild`), booted, with the driver's
 * plugin installed and trusted; `wipe` starts it on a new workspace.
 */
export async function startKernel(k: Kernel, spawnChild: SpawnChild, say: (line: string) => void, wipe = false): Promise<ChildProcess> {
  const { origin, workspace, port, log: kernelLog } = k;
  if (await running(origin)) throw new Error(`something answers as a SiYuan kernel on 127.0.0.1:${port}, not the pool's: stop it`);
  // the release downloaded and unpacked once, kernels starting at once taking turns
  const unlock = await takeLock(record(`${files}.lock`), true, "SiYuan's download");
  const res = await resources(say).finally(unlock);
  if (wipe) rmSync(workspace, { recursive: true, force: true });
  mkdirSync(workspace, { recursive: true });
  installPlugin(workspace);
  const env = { ...process.env, SIYUAN_ACCESS_AUTH_CODE_BYPASS: 'true', HTTP_PROXY: NOWHERE, HTTPS_PROXY: NOWHERE, http_proxy: NOWHERE, https_proxy: NOWHERE, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' };
  const args = ['serve', `--workspace=${workspace}`, `--port=${port}`, `--wd=${res}`, '--lang=en'];
  const child = spawnChild(join(res, 'kernel', 'SiYuan-Kernel'), args, { log: kernelLog, env });
  try {
    for (let i = 0; ; i++) {
      if (i > 600) throw new Error(`SiYuan's kernel didn't boot in a minute; see ${kernelLog}`);
      if (child.exitCode !== null) throw new Error(`SiYuan's kernel exited (${child.exitCode}); see ${kernelLog}`);
      await new Promise((r) => setTimeout(r, 100));
      const boot = await api<{ progress: number }>(origin, 'system/bootProgress').catch(() => null);
      if (boot?.progress === 100) break;
    }
    const conf = await api<{ conf: { system: { networkServe: boolean } } }>(origin, 'system/getConf');
    if (conf.conf.system.networkServe) throw new Error("SiYuan's workspace serves the network (system.networkServe), with no auth code: refusing");
    // plugins trusted in the workspace (a fresh one doesn't), so that the UI loads the driver's
    await api(origin, 'setting/setBazaar', { trust: true, petalDisabled: false });
  } catch (e) {
    child.kill('SIGKILL');
    throw e;
  }
  say(`started SiYuan's kernel ${k.n}, ${VERSION}, on 127.0.0.1:${port}${wipe ? ', on a new workspace' : ''} (pid ${child.pid}, log ${kernelLog})`);
  return child;
}
