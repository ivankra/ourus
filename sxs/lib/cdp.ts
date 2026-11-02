// A bare DevTools protocol client over a WebSocket, for the pool (`pool.ts`): it makes contexts and
// windows, grants permissions, watches targets crash, and asks a window whether it still answers. Not
// Playwright: a Playwright connection attaches to every page of a browser and enables its domains in
// each, which the pool, holding a connection to each browser for good, has no use for.

export class Cdp {
  private next = 0;
  private readonly pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  private readonly listeners = new Map<string, Set<(params: any, sessionId?: string) => void>>();
  private readonly closers = new Set<() => void>();
  closed = false;

  private readonly ws: WebSocket;

  private constructor(ws: WebSocket) {
    this.ws = ws;
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(String(e.data));
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(`${msg.error.message}${msg.error.data ? ` (${msg.error.data})` : ''}`));
        else p.resolve(msg.result);
        return;
      }
      for (const fn of this.listeners.get(msg.method) ?? []) fn(msg.params, msg.sessionId);
    });
    ws.addEventListener('close', () => {
      this.closed = true;
      for (const p of this.pending.values()) p.reject(new Error('the DevTools connection closed'));
      this.pending.clear();
      for (const fn of this.closers) fn();
    });
  }

  /** A connection to a browser's endpoint (`ws://…/devtools/browser/<id>`). */
  static connect(url: string, timeout = 5000): Promise<Cdp> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const timer = setTimeout(() => (ws.close(), reject(new Error(`no DevTools connection to ${url} in ${timeout}ms`))), timeout);
      ws.addEventListener('open', () => (clearTimeout(timer), resolve(new Cdp(ws))), { once: true });
      ws.addEventListener('error', () => (clearTimeout(timer), reject(new Error(`can't connect to ${url}`))), { once: true });
    });
  }

  /** The browser endpoint of a DevTools port (`/json/version`). */
  static async endpoint(port: number): Promise<string> {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(3000) });
    return ((await res.json()) as { webSocketDebuggerUrl: string }).webSocketDebuggerUrl;
  }

  send<T = any>(method: string, params: object = {}, sessionId?: string, timeout = 15000): Promise<T> {
    if (this.closed) return Promise.reject(new Error('the DevTools connection is closed'));
    const id = ++this.next;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method}: no answer in ${timeout}ms`));
      }, timeout);
      this.pending.set(id, { resolve: (v) => (clearTimeout(timer), resolve(v)), reject: (e) => (clearTimeout(timer), reject(e)) });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
    });
  }

  on(method: string, fn: (params: any, sessionId?: string) => void): void {
    let set = this.listeners.get(method);
    if (!set) this.listeners.set(method, (set = new Set()));
    set.add(fn);
  }

  onClose(fn: () => void): void {
    if (this.closed) fn();
    else this.closers.add(fn);
  }

  close(): void {
    try {
      this.ws.close();
    } catch {}
  }

  /**
   * Evaluates `expression` in a page target (attached for the call alone): its value, or throws where
   * the page doesn't answer in `timeout` (a hung page, a dialog up).
   */
  async evaluate<T = unknown>(targetId: string, expression: string, timeout = 3000): Promise<T> {
    const { sessionId } = await this.send<{ sessionId: string }>('Target.attachToTarget', { targetId, flatten: true }, undefined, timeout);
    try {
      const r = await this.send<{ result: { value: T }; exceptionDetails?: { text: string } }>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId, timeout);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    } finally {
      this.send('Target.detachFromTarget', { sessionId }, undefined, 2000).catch(() => {});
    }
  }
}
