// A DevTools endpoint scoped to one browser context: what a run's Playwright connects to instead of
// the shared browser's own (`appWindow` in `browser.ts`).
//
// Playwright's `connectOverCDP` auto-attaches to every target of the browser and sets each page up
// (its domains enabled, its frames read, an init script added), and waits for every page to be set
// up before it returns. In a browser of the pool's, whose ten windows are as many runs', every run's
// connection did that to every run's page: each page's events went out to every connection, a
// connection took longer than its timeout to come up under load, and a target of another run's
// (a service worker reported with no context) could throw in Playwright's handler and end the run.
//
// Between the two, this passes everything the client sends, and of what the browser sends, only
// what is the context's: a target auto-attached at the root is let through where it is in
// `contextId`, else detached here (run first, where it waits for a debugger); a session's messages
// pass where its target was let through, or is one under it (a frame's, a worker's), or the client
// asked for it (`Target.attachToTarget`, `attachToBrowserTarget`).

import { createRequire } from 'node:module';
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:http';

const require = createRequire(import.meta.url);
// Playwright's own bundled `ws` (a dependency already, exported by `playwright-core`)
const { ws: WebSocket, wsServer: WebSocketServer } = require('playwright-core/lib/utilsBundle') as { ws: any; wsServer: any };

type Msg = { id?: number; method?: string; sessionId?: string; params?: any; result?: any; error?: unknown };

export interface Scoped {
  /** The endpoint to connect to (`ws://127.0.0.1:<port>/`). */
  endpoint: string;
  close(): void;
}

/** A scoped endpoint for `contextId` of the browser at `cdp` (`http://127.0.0.1:<port>`). */
export async function scopeTo(cdp: string, contextId: string): Promise<Scoped> {
  const version = (await (await fetch(`${cdp}/json/version`, { signal: AbortSignal.timeout(10000) })).json()) as { webSocketDebuggerUrl: string };
  const upstreamUrl = version.webSocketDebuggerUrl;
  const http = createServer((_req, res) => res.writeHead(404).end());
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
  const sockets = new Set<any>();
  http.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (client: any) => wss.emit('connection', client)));
  wss.on('connection', (client: any) => {
    sockets.add(client);
    const upstream = new WebSocket(upstreamUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
    sockets.add(upstream);
    const pending: string[] = [];
    /** The sessions whose messages reach the client. */
    const allowed = new Set<string>();
    /** The client's requests that open a session, by id: their answers' sessions are allowed. */
    const opening = new Set<number>();
    /** Targets the client attached to itself (`Target.attachToTarget`, by id): theirs whatever their context. */
    const asked = new Set<string>();
    let own = 1e9;
    const toUpstream = (m: Msg): void => {
      const s = JSON.stringify(m);
      if (upstream.readyState === WebSocket.OPEN) upstream.send(s);
      else pending.push(s);
    };
    upstream.on('open', () => {
      for (const s of pending.splice(0)) upstream.send(s);
    });
    client.on('message', (data: Buffer) => {
      const s = data.toString();
      try {
        const m = JSON.parse(s) as Msg;
        if (m.id !== undefined && (m.method === 'Target.attachToTarget' || m.method === 'Target.attachToBrowserTarget')) opening.add(m.id);
        if (m.method === 'Target.attachToTarget' && m.params?.targetId) asked.add(m.params.targetId);
        if (process.env.OURUS_SXS_SCOPE_DEBUG) console.error(`-> ${m.id} ${m.method} ${m.sessionId?.slice(0, 6) ?? ''} ${JSON.stringify(m.params ?? {}).slice(0, 120)}`);
      } catch {}
      if (upstream.readyState === WebSocket.OPEN) upstream.send(s);
      else pending.push(s);
    });
    upstream.on('message', (data: Buffer) => {
      const s = data.toString();
      let m: Msg;
      try {
        m = JSON.parse(s) as Msg;
      } catch {
        return;
      }
      if (process.env.OURUS_SXS_SCOPE_DEBUG) console.error(`<- ${m.id ?? ''} ${m.method ?? ''} ${m.sessionId?.slice(0, 6) ?? ''} ${m.method === 'Target.attachedToTarget' ? `${m.params.targetInfo.type}@${m.params.targetInfo.browserContextId?.slice(0, 6)} ${m.params.sessionId.slice(0, 6)}` : ''}${m.error ? JSON.stringify(m.error) : ''}`);
      // an answer to a request of ours (a detach), not the client's
      if (m.id !== undefined && m.id >= 1e9) return;
      if (m.id !== undefined) {
        if (opening.delete(m.id) && m.result?.sessionId) allowed.add(m.result.sessionId);
        if (!m.sessionId || allowed.has(m.sessionId)) client.send(s);
        return;
      }
      if (m.method === 'Target.attachedToTarget') {
        const { sessionId, targetInfo, waitingForDebugger } = m.params;
        // at the root, the context decides (or the client asked for it: the browser's own target, one it
        // attached to by id); under a session let through, it is that target's
        const ours = m.sessionId ? allowed.has(m.sessionId) : targetInfo?.browserContextId === contextId || targetInfo?.type === 'browser' || asked.delete(targetInfo?.targetId);
        if (ours) {
          allowed.add(sessionId);
          client.send(s);
        } else if (!m.sessionId || !allowed.has(m.sessionId)) {
          // another run's target: let go at once, so that it never waits on this connection
          if (waitingForDebugger) toUpstream({ id: own++, method: 'Runtime.runIfWaitingForDebugger', sessionId });
          toUpstream({ id: own++, method: 'Target.detachFromTarget', params: { sessionId }, ...(m.sessionId && { sessionId: m.sessionId }) });
        }
        return;
      }
      if (m.method === 'Target.detachedFromTarget') {
        const id = m.params?.sessionId as string | undefined;
        if (id && allowed.delete(id)) client.send(s);
        return;
      }
      if (m.method?.startsWith('Target.target')) {
        const info = m.params?.targetInfo;
        if (!info || info.browserContextId === contextId) client.send(s);
        return;
      }
      if (m.sessionId && !allowed.has(m.sessionId)) return;
      client.send(s);
    });
    const end = (): void => {
      try {
        client.close();
      } catch {}
      try {
        upstream.close();
      } catch {}
    };
    client.on('close', end);
    upstream.on('close', end);
    client.on('error', end);
    upstream.on('error', end);
  });
  await new Promise<void>((resolve) => http.listen(0, '127.0.0.1', resolve));
  const { port } = http.address() as AddressInfo;
  return {
    endpoint: `ws://127.0.0.1:${port}/`,
    close: () => {
      for (const s of sockets)
        try {
          s.terminate?.() ?? s.close();
        } catch {}
      wss.close();
      http.close();
    },
  };
}
