/// <reference lib="dom" />
// Knowing when an app has finished reacting to a key. Apps handle a key partly later: a timer
// focuses the new block's editor, a frame re-renders, and a key that arrives in between is lost or
// lands in the wrong place (a fixed sleep after each key fails whenever the machine is slow). So the
// page is instrumented before the app's scripts run (`installIdle`, an init script): short timers
// and animation frames are tracked until they fire or are cleared, DOM mutations are timestamped,
// and `window.__ourusIdle.wait()` resolves once none is pending and nothing has changed for a while.
//
// Long timers are left out (autosave debounces, polling, housekeeping): they are not the reaction
// to a key, and waiting for them would make every action slow.

export interface IdleOptions {
  /** Timers up to this delay (ms) are part of reacting to a key. */
  shortTimer: number;
  /** How long (ms) nothing may change before the page counts as idle. */
  quiet: number;
  /** Gives up after this long (ms), reporting what is still pending. */
  timeout: number;
  /**
   * Gives up sooner when only the app's busy signal holds and nothing else has happened for this long
   * (ms): the app is stuck (an exception left its flag set), not working.
   */
  stuck?: number;
  /** A JavaScript expression that is true while the app says it is busy (a driver's own signal). */
  busy?: string;
  /**
   * Whether a pending animation frame is work (true by default): false for an app whose animation
   * library keeps a frame loop running whatever happens (Moo.do's), where settling is timers and quiet.
   */
  frames?: boolean;
}

export interface IdleResult {
  ms: number;
  timedOut: boolean;
  /** What was still pending when it gave up. */
  pending?: string;
  /** What it waited on last before it was idle: the short timers pending, or quiet time. */
  busiest?: string;
}

/** This script's version, so a page loaded by an earlier run with another version isn't reused. */
export const idleVersion = (): string => String([...installIdle.toString()].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 0));

/** The init script: run in the page before any of its own scripts (`version`: `idleVersion()`). */
export function installIdle(version: string): void {
  const w = window as unknown as Record<string, unknown> & typeof window;
  if (w.__ourusIdle) return;
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeClearTimeout = window.clearTimeout.bind(window);
  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
  /** Pending short timers and frames, by the id the page got for them. */
  const timers = new Map<number, number>();
  /**
   * Pending timers longer than that, up to 5 s, by id: what the app puts off (a debounced save), not
   * part of reacting to a key; `drain` waits for those pending at a moment.
   */
  const later = new Map<number, number>();
  const frames = new Set<number>();
  let shortTimer = 300;
  let lastChange = performance.now();
  /** What changed last (for diagnosing a page that doesn't settle). */
  let lastKind = '';
  const changed = (kind: string): void => {
    lastChange = performance.now();
    lastKind = kind;
  };

  window.setTimeout = ((handler: TimerHandler, ms?: number, ...args: unknown[]): number => {
    const delay = Number(ms) || 0;
    if (delay > 5000) return nativeSetTimeout(handler, ms, ...args);
    if (delay > shortTimer) {
      const id = nativeSetTimeout(() => {
        later.delete(id);
        if (typeof handler === 'function') (handler as (...a: unknown[]) => void)(...args);
        else (0, eval)(handler);
      }, delay);
      later.set(id, delay);
      return id;
    }
    const id = nativeSetTimeout(() => {
      timers.delete(id);
      changed(`a ${delay}ms timer`);
      if (typeof handler === 'function') (handler as (...a: unknown[]) => void)(...args);
      else (0, eval)(handler);
    }, delay);
    timers.set(id, delay);
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id?: number): void => {
    if (id !== undefined) {
      timers.delete(id);
      later.delete(id);
    }
    nativeClearTimeout(id);
  }) as typeof window.clearTimeout;
  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    const id = nativeRaf((t) => {
      frames.delete(id);
      cb(t);
    });
    frames.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id: number): void => {
    frames.delete(id);
    nativeCancelRaf(id);
  };
  // a message over a MessageChannel: a task the page scheduled, as a timer is (React's scheduler runs
  // its render work so, a task after the key's: under load it can come later than a quiet window,
  // and the next key reached a block not rendered yet). Pending from its post till the other port
  // has it, but not longer than a second (a port its page never started holds its messages)
  /** The messages in flight: when each was posted, by a number of its own. */
  const messages = new Map<number, number>();
  let posted = 0;
  const NativeChannel = window.MessageChannel;
  if (typeof NativeChannel === 'function') {
    const link = (from: MessagePort, to: MessagePort): void => {
      const post = from.postMessage.bind(from) as (...a: unknown[]) => void;
      const sent: number[] = [];
      from.postMessage = ((...a: unknown[]): void => {
        const id = ++posted;
        sent.push(id);
        messages.set(id, performance.now());
        post(...a);
      }) as MessagePort['postMessage'];
      to.addEventListener('message', () => {
        const id = sent.shift();
        if (id !== undefined) messages.delete(id);
        changed('a message');
      });
    };
    w.MessageChannel = class extends NativeChannel {
      constructor() {
        super();
        link(this.port1, this.port2);
        link(this.port2, this.port1);
      }
    } as typeof MessageChannel;
  }
  const messagePending = (now: number): number => {
    let n = 0;
    for (const [id, at] of messages)
      if (now - at > 1000) messages.delete(id);
      else n++;
    return n;
  };
  // the clipboard: a read or write is a promise the browser answers, with nothing on the page to show
  // the wait (an app's paste reads it so: Logseq's), and a blob read from it a FileReader's events.
  // Each is pending until it settles.
  let reading = 0;
  const done = (what: string): void => {
    reading--;
    changed(what);
  };
  const wrap = (proto: Record<string, unknown> | undefined, name: string): void => {
    const native = proto?.[name];
    if (typeof native !== 'function') return;
    proto![name] = function (this: unknown, ...a: unknown[]): unknown {
      reading++;
      const p = (native as (...b: unknown[]) => Promise<unknown>).apply(this, a);
      p.then(
        () => done(`a clipboard ${name}`),
        () => done(`a clipboard ${name}`),
      );
      return p;
    };
  };
  const g = window as unknown as Record<string, { prototype: Record<string, unknown> } | undefined>;
  for (const name of ['read', 'readText', 'write', 'writeText']) wrap(g.Clipboard?.prototype, name);
  wrap(g.ClipboardItem?.prototype, 'getType');
  for (const name of ['readAsText', 'readAsDataURL', 'readAsArrayBuffer']) {
    const proto = FileReader.prototype as unknown as Record<string, (...a: unknown[]) => void>;
    const native = proto[name]!;
    proto[name] = function (this: FileReader, ...a: unknown[]): void {
      reading++;
      this.addEventListener('loadend', () => done(`a FileReader ${name}`), { once: true });
      native.apply(this, a);
    };
  }
  const observe = (): void => {
    new MutationObserver((records) => {
      const r = records[records.length - 1]!;
      const el = r.target as Element;
      changed(`${r.type}${r.attributeName ? ` ${r.attributeName}` : ''} of <${el.tagName?.toLowerCase() ?? '#text'}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''}>`);
    }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  };
  if (document.documentElement) observe();
  else document.addEventListener('DOMContentLoaded', observe);
  for (const type of ['focusin', 'focusout', 'selectionchange', 'input']) document.addEventListener(type, () => changed(type), true);
  // a trace of the keys and what they did, the last 40: each key, input and focus change, with the
  // focused editor's text then, for a step that comes out otherwise than ourus to say where its key went
  // (`trace`, run.ts's second look)
  const trace: string[] = [];
  const t0 = performance.now();
  const note = (what: string): void => {
    const a = document.activeElement as HTMLTextAreaElement | HTMLElement | null;
    const value = a && 'value' in a && typeof a.value === 'string' ? JSON.stringify(a.value.slice(0, 40)) : a?.isContentEditable ? JSON.stringify((a.textContent ?? '').slice(0, 40)) : '';
    // (and what was pending then: messages, short timers, frames; the oldest message's age)
    const now = performance.now();
    const oldest = Math.max(0, ...[...messages.values()].map((at) => now - at));
    trace.push(`${Math.round(now - t0)} ${what} @${a?.tagName?.toLowerCase() ?? '-'} ${value} [m${messages.size}${messages.size ? `/${Math.round(oldest)}ms` : ''} t${timers.size} f${frames.size}]`);
    if (trace.length > 40) trace.shift();
  };
  document.addEventListener('keydown', (e) => note(`keydown ${e.key}`), true);
  document.addEventListener('input', () => queueMicrotask(() => note('input')), true);
  document.addEventListener('focusin', () => note('focusin'), true);
  document.addEventListener('focusout', () => note('focusout'), true);

  w.__ourusIdle = {
    version,
    /** The trace since `since` ms (the page's clock, as the trace counts), and that clock now. */
    trace(since = 0): { now: number; lines: string[] } {
      return { now: Math.round(performance.now() - t0), lines: trace.filter((l) => Number(l.split(' ')[0]) >= since) };
    },
    /**
     * Resolves once each timer pending now, of up to `upTo` ms, has fired or been cleared (or after
     * `timeout`): what the app put off till a user's pause, done. Timers made after don't count.
     */
    drain(o: { upTo: number; timeout: number }): Promise<{ ms: number; left: number }> {
      const start = performance.now();
      const pending = [...later].filter(([, delay]) => delay <= o.upTo).map(([id]) => id);
      return new Promise((resolve) => {
        const poll = (): void => {
          const left = pending.filter((id) => later.has(id)).length;
          const ms = Math.round(performance.now() - start);
          if (!left || ms > o.timeout) return resolve({ ms, left });
          nativeSetTimeout(poll, 10);
        };
        poll();
      });
    },
    /** Resolves once no short timer or frame is pending, the app isn't busy, and nothing changed for `quiet` ms. */
    wait(o: IdleOptions): Promise<IdleResult> {
      shortTimer = o.shortTimer;
      const start = performance.now();
      const busy = o.busy ? (new Function(`return (${o.busy})`) as () => unknown) : () => false;
      return new Promise((resolve) => {
        let last = '';
        const poll = (): void => {
          const now = performance.now();
          let appBusy = false;
          try {
            appBusy = !!busy();
          } catch {
            appBusy = false;
          }
          const pendingMessages = messagePending(now);
          const quiet = timers.size === 0 && (o.frames === false || frames.size === 0) && reading === 0 && pendingMessages === 0;
          if (quiet && !appBusy && now - lastChange >= o.quiet) return resolve({ ms: Math.round(now - start), timedOut: false, busiest: last });
          if (!quiet) last = `timers ${[...timers.values()].join(',') || '-'}, frames ${frames.size}${reading ? `, clipboard reads ${reading}` : ''}${pendingMessages ? `, messages ${pendingMessages}` : ''}`;
          else if (appBusy) last = 'app busy';
          else last = `changes, the last: ${lastKind}`;
          if (quiet && appBusy && now - Math.max(lastChange, start) >= (o.stuck ?? 1000)) {
            return resolve({ ms: Math.round(now - start), timedOut: true, pending: `app busy, and nothing else for ${Math.round(now - Math.max(lastChange, start))}ms: stuck` });
          }
          if (now - start > o.timeout) {
            const pending = [`timers ${[...timers.values()].join(',') || '-'}`, `frames ${frames.size}`, reading ? `clipboard reads ${reading}` : '', pendingMessages ? `messages ${pendingMessages}` : '', appBusy ? 'app busy' : '', `last change ${Math.round(now - lastChange)}ms ago`].filter(Boolean).join('; ');
            return resolve({ ms: Math.round(now - start), timedOut: true, pending });
          }
          nativeSetTimeout(poll, 4);
        };
        // at least one frame: input dispatched just now may not have been handled yet (but a page in a
        // background tab gets no frames, so not longer than a frame should take)
        let started = false;
        const begin = (): void => {
          if (started) return;
          started = true;
          nativeSetTimeout(poll, 0);
        };
        nativeRaf(begin);
        nativeSetTimeout(begin, 50);
      });
    },
  };
}
