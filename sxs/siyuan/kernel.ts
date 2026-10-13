// SiYuan's kernel (https://github.com/siyuan-note/siyuan, AGPL-3.0), for its driver (driver.ts). The
// release for this machine is downloaded once into `.sxs/siyuan/files/` (its SHA-256 checked against
// the release's SHA256SUMS.txt), its `resources/` unpacked there (`siyuan-<version>-linux-<arch>/`) and
// the archive deleted; the kernel
// (`resources/kernel/SiYuan-Kernel serve`) runs on a workspace of its own, `.sxs/siyuan/workspace/`,
// and serves the web UI the shared browser loads and the API (`/api/...`) the driver loads and reads
// through. It listens on 127.0.0.1 only (the workspace's `system.networkServe` is off), needs no auth
// code there (`SIYUAN_ACCESS_AUTH_CODE_BYPASS`), and has no way out: its HTTP(S) proxy is a port
// nothing listens on. Started detached and left running for the next run, as the shared browser is,
// while its workspace has the driver's plugin (a workspace deleted under it, it is started anew);
// `run.ts --stop` stops it (`recordServer`).
//
// The driver's plugin (`plugin/`, the plugin API's `openTab`) is installed into the workspace, enabled,
// and plugins trusted there (Settings › Marketplace: a user's setting of the workspace).

import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, openSync, rmSync, writeFileSync } from 'node:fs';
import { arch } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { recordServer, serverPid, stopServer } from '../lib/browser.ts';
import { cacheDir } from '../proxy.ts';

/** The release to run: pinned, so a report changes when the app does, not when SiYuan releases. */
export const VERSION = process.env.SIYUAN_VERSION ?? '3.8.6';
export const PORT = Number(process.env.OURUS_SIYUAN_PORT ?? 6816);
export const origin = `http://127.0.0.1:${PORT}`;
const root = join(cacheDir, 'siyuan');
export const workspace = join(root, 'workspace');
export const kernelLog = join(root, 'kernel.log');
const PLUGIN = 'ourus-sxs';
/** A port nothing listens on, as the kernel's proxy: no update, announcement or sync reaches out. */
const NOWHERE = 'http://127.0.0.1:9';

/** A call of the kernel's API: its `data`, or an error with its message. */
export async function api<T = unknown>(path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${origin}/api/${path}`, { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const j = (await res.json()) as { code: number; msg: string; data: T };
  if (j.code !== 0) throw new Error(`SiYuan's /api/${path}: ${j.msg || `code ${j.code}`}`);
  return j.data;
}

/** The running kernel's version, if one answers on the port. */
async function running(): Promise<string | null> {
  try {
    return await api<string>('system/version');
  } catch {
    return null;
  }
}

/** The release's `resources/` (kernel, stage, appearance, ...), downloaded and unpacked if it isn't yet (the archive not kept). */
async function resources(say: (line: string) => void): Promise<string> {
  const suffix = { arm64: '-arm64', x64: '' }[arch() as string];
  if (suffix === undefined) throw new Error(`no SiYuan release for ${arch()}`);
  const name = `siyuan-${VERSION}-linux${suffix}`;
  const files = join(root, 'files');
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

/** The driver's plugin in the workspace. */
const pluginDir = join(workspace, 'data', 'plugins', PLUGIN);

/** The driver's plugin in the workspace, enabled (the kernel reads both when the UI asks for its plugins). */
function installPlugin(): void {
  const dir = pluginDir;
  mkdirSync(dir, { recursive: true });
  for (const f of ['plugin.json', 'index.js']) copyFileSync(fileURLToPath(new URL(`./plugin/${f}`, import.meta.url)), join(dir, f));
  const petal = join(workspace, 'data', 'storage', 'petal');
  mkdirSync(petal, { recursive: true });
  writeFileSync(join(petal, 'petals.json'), JSON.stringify([{ name: PLUGIN, enabled: true }]));
}

/**
 * The kernel of `VERSION`, running and booted: the one already running if it is that version and its
 * workspace has the plugin, else a new one (the other stopped first).
 */
export async function serve(say: (line: string) => void): Promise<void> {
  const v = await running();
  if (v === VERSION && existsSync(pluginDir)) return;
  if (v || serverPid('siyuan')) await stopServer('siyuan', say);
  if (await running()) throw new Error(`a SiYuan kernel on 127.0.0.1:${PORT} isn't recorded (.sxs/siyuan/server.pid), so not stopped: stop it`);
  const res = await resources(say);
  mkdirSync(workspace, { recursive: true });
  installPlugin();
  const out = openSync(kernelLog, 'a');
  const env = { ...process.env, SIYUAN_ACCESS_AUTH_CODE_BYPASS: 'true', HTTP_PROXY: NOWHERE, HTTPS_PROXY: NOWHERE, http_proxy: NOWHERE, https_proxy: NOWHERE, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' };
  const args = ['serve', `--workspace=${workspace}`, `--port=${PORT}`, `--wd=${res}`, '--lang=en'];
  const child = spawn(join(res, 'kernel', 'SiYuan-Kernel'), args, { detached: true, stdio: ['ignore', out, out], env });
  child.unref();
  if (!child.pid) throw new Error(`SiYuan's kernel didn't start (${join(res, 'kernel', 'SiYuan-Kernel')}); see ${kernelLog}`);
  recordServer('siyuan', child.pid);
  for (let i = 0; ; i++) {
    if (i > 600) throw new Error(`SiYuan's kernel didn't boot in a minute; see ${kernelLog}`);
    if (child.exitCode !== null) throw new Error(`SiYuan's kernel exited (${child.exitCode}); see ${kernelLog}`);
    await new Promise((r) => setTimeout(r, 100));
    const boot = await api<{ progress: number }>('system/bootProgress').catch(() => null);
    if (boot?.progress === 100) break;
  }
  const conf = await api<{ conf: { system: { networkServe: boolean } } }>('system/getConf');
  if (conf.conf.system.networkServe) throw new Error("SiYuan's workspace serves the network (system.networkServe), with no auth code: refusing");
  // plugins trusted in the workspace (a fresh one doesn't), so that the UI loads the driver's
  await api('setting/setBazaar', { trust: true, petalDisabled: false });
  say(`started SiYuan's kernel ${VERSION} on 127.0.0.1:${PORT} (pid ${child.pid}, log ${kernelLog})`);
}
