// A caching forward proxy for the side-by-side runs: the browser fetches every page through it, the
// first fetch goes to the network and lands on disk, and later runs are served from disk, so a live
// demo is taxed once per cold cache rather than once per run.
//
//   node sxs/proxy.ts [--port=8899] [--host=127.0.0.1] [--cache=use|offline|refresh] [--quiet]
//
// - HTTP requests (absolute-form URLs) and HTTPS (CONNECT) are both served. HTTPS is intercepted
//   with one self-signed certificate for every host, generated once with `openssl`; the browser must
//   ignore certificate errors (Chromium's --ignore-certificate-errors, Playwright's
//   `ignoreHTTPSErrors`). Pages keep their real origins, so storage, cookies and origin checks work.
// - GET and HEAD are cached under their URL, other methods go live, unless an app's rules say
//   otherwise (`ProxyRules`, below). WebSockets are tunnelled live.
// - Analytics, error reporting, embedded video and the browser's own background traffic are answered
//   empty and never contacted (`BLOCKED_HOSTS`, below).
// - `--cache` says how the cache is used (`CacheMode`): `use` (the default) serves what it has and
//   fetches and keeps the rest; `offline` serves what it has and nothing else, a miss (and what would
//   go live: other methods, a rule's live requests, WebSockets) answered 504 or refused, writing
//   nothing, so the cache may be read-only (it needs a run online first, for the certificate too);
//   `refresh` fetches everything it is asked for once per proxy run, and keeps it.
// - Started on a terminal, it prints each app's editor, where a browser pointed at it opens one
//   (`Driver.url`), and how to start Chromium so.
// - It listens on 127.0.0.1, unless `--host` says otherwise: `--host=0.0.0.0` in a container whose
//   port is published (podman's `-p 8899:8899` reaches the container's interface, not its loopback).
// - Every request is logged, one line each with how it was served (hit, miss, live, local, blocked);
//   `GET /__proxy/stats` (asked of the proxy itself) tallies them per host, with their distinct URLs, since the last `/__proxy/stats?reset`, so traffic
//   that should be blocked or cached stands out, and so does something blocked that shouldn't be.
//   `/__proxy/health` reports its pid and version; `/__proxy/stop` stops it.
//
// The cache is `.sxs/http/<host>/` in the ourus checkout (git-ignored; `OURUS_SXS_DIR` moves
// `.sxs/`, `OURUS_SXS_HTTP` the cache alone), one `.json` (status, headers, URL) and one `.body` per
// response, named for the path; delete a file to refetch it.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { extname, join, resolve, sep } from 'node:path';
import type { Duplex } from 'node:stream';
import tls from 'node:tls';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ------------------------------------------------------------------ app rules

// What an app tells the proxy about its hosts: which requests are cached and under what key, which
// are answered locally, and how responses are patched on their way to the browser. Each app that
// needs any of it exports `rules` from `sxs/<app>/proxy.ts` (importing from here with
// `import type`, or the helpers); the proxy loads every such file at startup and again whenever one
// changes, so a running proxy picks up edits.

/** A request as the proxy sees it: absolute URL, method, headers (lower-case names), body. */
export interface ProxyRequest {
  readonly url: URL;
  readonly method: string;
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly body: Buffer;
}

/** A response the proxy serves: from the cache, the network, a local file or a rule. */
export interface ProxyResponse {
  status: number;
  /** Header pairs, a name repeated for each of its values (`set-cookie`). */
  headers: [string, string][];
  body: Buffer;
}

export interface ProxyRules {
  /** The hosts these rules are for: `example.com` exactly, or `.example.com` for it and its subdomains. */
  readonly hosts: readonly string[];
  /**
   * The cache key of a request, or `null` to always fetch it live. By default GET and HEAD are cached
   * under their URL and every other method is live; a rule can drop cache-busting query parameters,
   * or cache a POST whose answer depends only on its body (`${url} ${sha1(body)}`).
   */
  key?(req: ProxyRequest): string | null | undefined;
  /**
   * Answers a request without the network or the cache (a stub), or `undefined` to go on. A WebSocket's
   * upgrade request comes here too (as `http(s):`): any answer refuses the socket.
   */
  respond?(req: ProxyRequest): ProxyResponse | undefined;
  /**
   * Rewrites a response on its way to the browser, or returns `undefined` to leave it. The cache keeps
   * what the server sent, so editing a patch needs no refetch.
   */
  patch?(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined;
}

/** Hosts that only collect data (analytics, error reporting, ads): answered empty, never contacted. */
export const BLOCKED_HOSTS: readonly string[] = [
  '.google-analytics.com',
  '.googletagmanager.com',
  '.doubleclick.net',
  '.sentry.io',
  '.sentry-cdn.com',
  '.posthog.com',
  '.segment.io',
  '.segment.com',
  '.amplitude.com',
  '.mixpanel.com',
  '.hotjar.com',
  '.intercom.io',
  '.intercomcdn.com',
  '.fullstory.com',
  '.plausible.io',
  // Cloudflare's Web Analytics beacon, on Dynalist's and SilverBullet's pages
  '.cloudflareinsights.com',
  '.clarity.ms',
  '.facebook.net',
  '.bugsnag.com',
  '.logrocket.io',
  '.datadoghq.com',
  '.browser-intake-datadoghq.com',
  'sentry.workflowy.com',
  // payments, loaded by apps for upgrade dialogs
  '.stripe.com',
  '.stripe.network',
  // video embeds in demo content: heavy, and they stream analytics of their own
  '.youtube.com',
  '.youtube-nocookie.com',
  '.ytimg.com',
  '.googlevideo.com',
  'jnn-pa.googleapis.com',
  // Chromium's own background traffic (updates, sign-in, model downloads), when its flags don't stop it
  'update.googleapis.com',
  'clients2.google.com',
  'accounts.google.com',
  'android.clients.google.com',
  'optimizationguide-pa.googleapis.com',
  'content-autofill.googleapis.com',
  'safebrowsing.googleapis.com',
  'www.google.com',
  '.gvt1.com',
  // its captive-portal check (`/generate_204`): the empty 204 a block answers is what it expects
  'connectivitycheck.gstatic.com',
];

/** Content types by file extension, for apps served from a directory on disk (`fromDirectory`). */
export const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/**
 * Serves an app from a directory on disk (a copy of a site, patched to run without its server): a
 * request's path names a file there (a directory, its index.html), served with its content type and
 * no caching. For an app's `respond`: undefined when the directory has no such file, so the rule can
 * fall back (to the network, or a 404 that keeps the real site out of it).
 */
export function fromDirectory(root: string, req: ProxyRequest): ProxyResponse | undefined {
  if (req.method !== 'GET' && req.method !== 'HEAD') return undefined;
  const dir = resolve(root);
  const file = resolve(join(dir, decodeURIComponent(req.url.pathname)));
  if (file !== dir && !file.startsWith(dir + sep)) return undefined;
  const candidate = existsSync(file) && statSync(file).isDirectory() ? join(file, 'index.html') : file;
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return undefined;
  return { status: 200, headers: [['content-type', TYPES[extname(candidate)] ?? 'application/octet-stream'], ['cache-control', 'no-cache']], body: readFileSync(candidate) };
}

/** Whether `host` is one of `hosts` (`.example.com` covering example.com and its subdomains). */
export function hostMatches(host: string, hosts: readonly string[]): boolean {
  return hosts.some((h) => (h.startsWith('.') ? host === h.slice(1) || host.endsWith(h) : host === h));
}

/** A header's value, the first if repeated. */
export function header(res: ProxyResponse, name: string): string | undefined {
  return res.headers.find(([k]) => k.toLowerCase() === name)?.[1];
}

/** `res` with its body replaced (and its length header dropped: the proxy sets it). */
export function withBody(res: ProxyResponse, body: string | Buffer): ProxyResponse {
  return { ...res, headers: res.headers.filter(([k]) => k.toLowerCase() !== 'content-length'), body: Buffer.isBuffer(body) ? body : Buffer.from(body) };
}


export const DEFAULT_PORT = 8899;
/** Where the side-by-side runs keep their state: the HTTP cache, the certificate, the shared browser's profile, logs. */
export const cacheDir = process.env.OURUS_SXS_DIR || fileURLToPath(new URL('../.sxs/', import.meta.url));
/** The HTTP cache: in `cacheDir`, or wherever `OURUS_SXS_HTTP` says (a read-only copy, for `--cache=offline`). */
export const httpDir = process.env.OURUS_SXS_HTTP || join(cacheDir, 'http');

/** How the proxy uses its cache: serve and keep (`use`), serve only (`offline`), or fetch anew and keep (`refresh`). */
export type CacheMode = 'use' | 'offline' | 'refresh';
export const CACHE_MODES: readonly CacheMode[] = ['use', 'offline', 'refresh'];

/** The last `--cache=<mode>` among `args` (a script's own, then the user's), `use` without one; throws on a mode it doesn't know. */
export function cacheMode(args: readonly string[]): CacheMode {
  const mode = [...args].reverse().find((a) => a.startsWith('--cache='))?.slice('--cache='.length) ?? 'use';
  if (!(CACHE_MODES as readonly string[]).includes(mode)) throw new Error(`--cache=${mode}: one of ${CACHE_MODES.join(', ')}`);
  return mode as CacheMode;
}
const sxsDir = fileURLToPath(new URL('./', import.meta.url));

/** This proxy's version: a hash of its sources, so a runner can tell a stale running proxy from a current one. */
export function proxyVersion(): string {
  const h = createHash('sha1');
  h.update(readFileSync(new URL(import.meta.url)));
  return h.digest('hex').slice(0, 12);
}

// ------------------------------------------------------------------ loading app rules

interface LoadedRules {
  rules: ProxyRules[];
  /** mtimes of the files they came from, to notice edits. */
  stamp: string;
}

let loaded: LoadedRules = { rules: [], stamp: '' };
let checkedAt = 0;

/** The files with app rules: `sxs/<app>/proxy.ts`. */
function rulesFiles(): string[] {
  return readdirSync(sxsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(sxsDir, d.name, 'proxy.ts')))
    .map((d) => join(sxsDir, d.name, 'proxy.ts'));
}

/** The app rules, reloaded when a rules file changed (checked at most once a second). */
async function currentRules(): Promise<ProxyRules[]> {
  if (Date.now() - checkedAt < 1000) return loaded.rules;
  checkedAt = Date.now();
  const files = rulesFiles();
  const stamp = files.map((f) => `${f}@${statSync(f).mtimeMs}`).join('|');
  if (stamp === loaded.stamp) return loaded.rules;
  const rules: ProxyRules[] = [];
  for (const f of files) {
    try {
      // a query string per version makes the module loader read the file again
      const mod = (await import(`${pathToFileURL(f).href}?v=${statSync(f).mtimeMs}`)) as { rules?: ProxyRules };
      if (mod.rules) rules.push(mod.rules);
    } catch (e) {
      log(`rules ${f}: ${String(e)}`);
    }
  }
  if (loaded.stamp) log(`rules reloaded (${rules.length})`);
  loaded = { rules, stamp };
  return rules;
}

const rulesFor = (rules: ProxyRules[], host: string): ProxyRules | undefined => rules.find((r) => hostMatches(host, r.hosts));

// ------------------------------------------------------------------ cache

interface Entry {
  url: string;
  method: string;
  status: number;
  headers: [string, string][];
  fetched: string;
}

/** Headers that describe one connection or one encoding of the body, not the resource. */
const HOP = new Set(['connection', 'keep-alive', 'proxy-connection', 'proxy-authorization', 'proxy-authenticate', 'transfer-encoding', 'te', 'trailer', 'upgrade', 'content-encoding', 'content-length', 'alt-svc']);

/** A cache file's base path: the host's directory, the path made readable, and a hash of the key. */
function cachePath(url: URL, key: string): string {
  const readable = (url.pathname + (url.search ? '_' : ''))
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(-80);
  const hash = createHash('sha1').update(key).digest('hex').slice(0, 12);
  return join(httpDir, url.host.replace(/[^A-Za-z0-9.-]/g, '_'), `${readable || 'index'}-${hash}`);
}

function readCache(base: string): ProxyResponse | null {
  try {
    const entry = JSON.parse(readFileSync(base + '.json', 'utf8')) as Entry;
    return { status: entry.status, headers: entry.headers, body: readFileSync(base + '.body') };
  } catch {
    return null;
  }
}

function writeCache(base: string, req: ProxyRequest, res: ProxyResponse): void {
  mkdirSync(join(base, '..'), { recursive: true });
  const entry: Entry = { url: req.url.href, method: req.method, status: res.status, headers: res.headers, fetched: new Date().toISOString() };
  // written aside and renamed, so a concurrent reader never sees half a file
  const tmp = `${base}.${process.pid}.tmp`;
  writeFileSync(tmp + '.body', res.body);
  writeFileSync(tmp + '.json', JSON.stringify(entry, null, 1));
  renameSync(tmp + '.body', base + '.body');
  renameSync(tmp + '.json', base + '.json');
}

// ------------------------------------------------------------------ upstream

async function fetchUpstream(req: ProxyRequest): Promise<ProxyResponse> {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    // fetch sets its own host and encodings, and decodes the body
    if (v === undefined || HOP.has(k) || k === 'host' || k === 'accept-encoding') continue;
    for (const one of Array.isArray(v) ? v : [v]) headers.append(k, one);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const res = await fetch(req.url, { method: req.method, headers, body: hasBody ? new Uint8Array(req.body) : undefined, redirect: 'manual' });
  const out: [string, string][] = [];
  res.headers.forEach((value, name) => {
    if (!HOP.has(name) && name !== 'set-cookie') out.push([name, value]);
  });
  for (const c of res.headers.getSetCookie()) out.push(['set-cookie', c]);
  return { status: res.status, headers: out, body: Buffer.from(await res.arrayBuffer()) };
}

// ------------------------------------------------------------------ serving

export interface ProxyOptions {
  port: number;
  /** The address it listens on: 127.0.0.1, or all of them (`0.0.0.0`) in a container. */
  host: string;
  cache: CacheMode;
  quiet: boolean;
}

let options: ProxyOptions = { port: DEFAULT_PORT, host: '127.0.0.1', cache: 'use', quiet: false };
/** Fetches under way, by cache key, so concurrent misses for one resource fetch it once. */
const inflight = new Map<string, Promise<ProxyResponse>>();
/** Keys refetched in this run (`--cache=refresh` refetches each once). */
const refreshed = new Set<string>();
/** Requests per host and how they were served, with bytes and the first distinct URLs, since the last reset. */
let stats = new Map<string, Record<string, { n: number; bytes: number; urls: string[] }>>();

function count(url: string, host: string, how: string, bytes: number): void {
  const byHow = stats.get(host) ?? {};
  const c = (byHow[how] ??= { n: 0, bytes: 0, urls: [] });
  c.n++;
  c.bytes += bytes;
  if (c.urls.length < 20 && !c.urls.includes(url)) c.urls.push(url);
  stats.set(host, byHow);
}

const log = (line: string): void => {
  if (!options.quiet) console.log(`${new Date().toISOString().slice(11, 23)} ${line}`);
};

const empty = (status: number): ProxyResponse => ({ status, headers: [['content-type', 'text/plain']], body: Buffer.alloc(0) });
const text = (status: number, body: string): ProxyResponse => ({ status, headers: [['content-type', 'text/plain; charset=utf-8']], body: Buffer.from(body) });

/** What the proxy answers a request with, and how it came by it (for the log). */
async function answer(req: ProxyRequest): Promise<{ res: ProxyResponse; how: string }> {
  const host = req.url.hostname;
  if (hostMatches(host, BLOCKED_HOSTS)) return { res: empty(204), how: 'blocked' };
  const rules = rulesFor(await currentRules(), host);
  const stub = rules?.respond?.(req);
  if (stub) return { res: stub, how: 'local' };
  const ruled = rules?.key?.(req);
  const key = ruled !== undefined ? ruled : req.method === 'GET' || req.method === 'HEAD' ? req.url.href : null;
  if (key === null && options.cache === 'offline') return { res: text(504, `ourus proxy: offline, and never cached: ${req.method} ${req.url.href}\n`), how: 'offline-live' };
  if (key === null) return { res: await fetchUpstream(req), how: 'live' };
  const base = cachePath(req.url, `${req.method} ${key}`);
  const fresh = options.cache === 'refresh' && !refreshed.has(base);
  const cached = fresh ? null : readCache(base);
  if (cached) return { res: cached, how: 'hit' };
  if (options.cache === 'offline') return { res: text(504, `ourus proxy: offline, and not cached: ${req.method} ${req.url.href}\n`), how: 'offline-miss' };
  let pending = inflight.get(base);
  if (!pending) {
    pending = fetchUpstream(req).then((res) => {
      // a server error is likely passing: served, not kept
      if (res.status < 500) writeCache(base, req, res);
      refreshed.add(base);
      return res;
    });
    inflight.set(base, pending);
    pending.finally(() => inflight.delete(base)).catch(() => {});
  }
  return { res: await pending, how: 'miss' };
}

async function serve(url: URL, req: http.IncomingMessage, out: http.ServerResponse): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const request: ProxyRequest = { url, method: req.method ?? 'GET', headers: req.headers, body: Buffer.concat(chunks) };
  let res: ProxyResponse;
  let how: string;
  try {
    ({ res, how } = await answer(request));
    const rules = rulesFor(loaded.rules, url.hostname);
    const patched = rules?.patch?.(request, res);
    if (patched) {
      res = patched;
      how += '+patched';
    }
  } catch (e) {
    res = text(502, `ourus proxy: ${request.method} ${url.href}: ${String(e)}\n`);
    how = 'error';
  }
  log(`${how.padEnd(12)} ${res.status} ${request.method} ${url.href.slice(0, 300)}${how === 'error' ? ' ' + res.body.toString().trim() : ''}`);
  count(url.href, url.host, how.replace(/\+patched$/, ''), res.body.length);
  const headers: [string, string][] = res.headers.filter(([k]) => !HOP.has(k.toLowerCase()));
  headers.push(['content-length', String(res.body.length)], ['x-ourus-proxy', how]);
  out.writeHead(res.status, headers.flat());
  out.end(request.method === 'HEAD' ? undefined : res.body);
}

/** A WebSocket (or other upgrade): the request is replayed to the real server and the two sockets joined. */
function tunnelUpgrade(secure: boolean, req: http.IncomingMessage, client: Duplex, head: Buffer): void {
  const [host, port] = splitHost(req.headers.host ?? '', secure ? 443 : 80);
  const url = `${secure ? 'wss' : 'ws'}://${host}${req.url}`;
  if (hostMatches(host, BLOCKED_HOSTS)) {
    log(`${'blocked'.padEnd(12)} ${url}`);
    count(url, host, 'blocked', 0);
    return void client.destroy();
  }
  // an app's rules may answer the upgrade request too, which refuses the socket
  const stub = rulesFor(loaded.rules, host)?.respond?.({ url: new URL(url.replace(/^ws/, 'http')), method: req.method ?? 'GET', headers: req.headers, body: Buffer.alloc(0) });
  if (stub) {
    log(`${'local-ws'.padEnd(12)} ${stub.status} ${url}`);
    count(url, host, 'local-ws', 0);
    client.end(`HTTP/1.1 ${stub.status} Refused\r\ncontent-length: 0\r\nconnection: close\r\n\r\n`);
    return;
  }
  if (options.cache === 'offline') {
    log(`${'offline-ws'.padEnd(12)} ${url}`);
    count(url, host, 'offline-ws', 0);
    client.end('HTTP/1.1 504 Offline\r\ncontent-length: 0\r\nconnection: close\r\n\r\n');
    return;
  }
  log(`${'live-ws'.padEnd(12)} ${url}`);
  count(url, host, 'live-ws', 0);
  const upstream: Duplex = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
  upstream.on('error', () => client.destroy());
  client.on('error', () => upstream.destroy());
  upstream.once(secure ? 'secureConnect' : 'connect', () => {
    const lines = [`${req.method} ${req.url} HTTP/1.1`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    upstream.write(lines.join('\r\n') + '\r\n\r\n');
    if (head.length) upstream.write(head);
    upstream.pipe(client).pipe(upstream);
  });
}

function splitHost(hostport: string, fallback: number): [string, number] {
  const m = /^\[?([^\]]+?)\]?(?::(\d+))?$/.exec(hostport);
  return [m?.[1] ?? hostport, m?.[2] ? Number(m[2]) : fallback];
}

/** The one certificate every intercepted host gets, made once with openssl (not offline: that runs on what an online run made). */
function certificate(): { key: Buffer; cert: Buffer } {
  const dir = join(cacheDir, 'cert');
  const key = join(dir, 'key.pem');
  const cert = join(dir, 'cert.pem');
  if (!existsSync(key) || !existsSync(cert)) {
    if (options.cache === 'offline') throw new Error(`--cache=offline, and no certificate in ${dir}: run once online first`);
    mkdirSync(dir, { recursive: true });
    execFileSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes', '-keyout', key, '-out', cert, '-days', '3650', '-subj', '/CN=ourus sxs proxy', '-addext', 'subjectAltName=DNS:localhost'], { stdio: 'ignore' });
  }
  return { key: readFileSync(key), cert: readFileSync(cert) };
}

export async function startProxy(opts: Partial<ProxyOptions> = {}): Promise<http.Server> {
  options = { ...options, ...opts };
  const version = proxyVersion();
  const started = new Date().toISOString();
  const { key, cert } = certificate();
  await currentRules();

  // HTTPS requests arrive here, decrypted, from CONNECT tunnels
  const inner = http.createServer((req, res) => void serve(new URL(`https://${req.headers.host}${req.url}`), req, res));
  inner.on('upgrade', (req, socket, head) => tunnelUpgrade(true, req, socket, head));
  inner.on('clientError', (_e, socket) => socket.destroy());

  const server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    if (/^https?:\/\//.test(url)) return void serve(new URL(url), req, res);
    // asked of the proxy itself
    if (url === '/__proxy/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return void res.end(JSON.stringify({ pid: process.pid, version, started, cacheDir, httpDir, cache: options.cache }));
    }
    if (url === '/__proxy/stats' || url === '/__proxy/stats?reset') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(Object.fromEntries(stats)));
      if (url.endsWith('?reset')) stats = new Map();
      return;
    }
    if (url === '/__proxy/stop') {
      res.end('stopping\n');
      log('stopping');
      return void setImmediate(() => process.exit(0));
    }
    res.writeHead(400, { 'content-type': 'text/plain' }).end('ourus sxs proxy: point a browser at it as its HTTP proxy\n');
  });
  server.on('connect', (req, socket: Duplex, head: Buffer) => {
    socket.on('error', () => {});
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head.length) socket.unshift(head);
    const secure = new tls.TLSSocket(socket as net.Socket, { isServer: true, key, cert, ALPNProtocols: ['http/1.1'] });
    secure.on('error', () => socket.destroy());
    inner.emit('connection', secure);
  });
  server.on('upgrade', (req, socket, head) => tunnelUpgrade(false, req, socket, head));
  server.on('clientError', (_e, socket) => socket.destroy());
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port, options.host, resolve);
  });
  log(`ourus sxs proxy ${version} on ${options.host}:${options.port}`);
  // it intercepts TLS and answers anyone: on a port others reach, it is theirs too, /__proxy/stop included
  if (!/^(127\.|::1$|localhost$)/.test(options.host)) log(`listening beyond the loopback: whoever reaches port ${options.port} can use it (in a container, publish it as -p 127.0.0.1:${options.port}:${options.port})`);
  log(`cache: ${httpDir} (${options.cache})`);
  return server;
}

/**
 * Says what a person points a browser at to open each app's editor through the proxy (its driver's
 * `url`: only the apps a browser opens, not a desktop app or one whose server a run
 * starts), and how to start Chromium so. Drivers are imported for it, after the proxy listens.
 */
async function sayApps(): Promise<void> {
  const rows: [string, string][] = [];
  for (const d of readdirSync(sxsDir, { withFileTypes: true })) {
    const file = join(sxsDir, d.name, 'driver.ts');
    if (!d.isDirectory() || !existsSync(file)) continue;
    try {
      const { driver } = (await import(pathToFileURL(file).href)) as { driver?: { url: string; login?: string; launch?: unknown; serve?: unknown } };
      // lib/driver.ts says what a driver is, and is none
      if (driver && !driver.launch && !driver.serve) rows.push([d.name, driver.url + (driver.login ? `  (signed in: ${driver.login} once)` : '')]);
    } catch (e) {
      rows.push([d.name, `(its driver didn't load: ${String(e).split('\n')[0]})`]);
    }
  }
  const table: [string, string][] = [['app', 'url'], ['', ''], ...rows];
  const width = (i: 0 | 1): number => Math.max(...table.map((r) => r[i].length));
  table[1] = ['-'.repeat(width(0)), '-'.repeat(width(1))];
  log('available apps:');
  console.log(table.map((r) => `  ${r[0].padEnd(width(0))}  ${r[1]}`).join('\n'));
  // a profile of its own: Chromium handed a profile another one holds ignores the flags
  log('start chromium to browse them as:');
  console.log(`  ${process.env.CHROMIUM ?? 'chromium'} --proxy-server=http://127.0.0.1:${options.port} --ignore-certificate-errors --user-data-dir=${join(cacheDir, 'browse')} --no-first-run`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const port = Number(args.find((a) => a.startsWith('--port='))?.slice(7) ?? process.env.OURUS_PROXY_PORT ?? DEFAULT_PORT);
  const host = args.find((a) => a.startsWith('--host='))?.slice(7) ?? '127.0.0.1';
  // not awaited at the top level: app rules importing from this module (silverbullet's) would wait
  // for it to finish evaluating, and it for them, and Node would exit with the proxy never listening
  Promise.resolve()
    .then(() => startProxy({ port, host, cache: cacheMode(args), quiet: args.includes('--quiet') }))
    .then(async () => {
      // for a person at a terminal; the shared proxy a run starts writes to a log, and needn't import every driver
      if (!options.quiet && process.stdout.isTTY) await sayApps();
    })
    .catch((e) => {
      // the shared proxy a run started (lib/browser.ts) holds the port until stopped
      if ((e as NodeJS.ErrnoException).code === 'EADDRINUSE') console.error(`a proxy already listens on ${host}:${port}: \`node sxs/run.ts --stop\` stops the shared one, or give another --port=`);
      else console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
