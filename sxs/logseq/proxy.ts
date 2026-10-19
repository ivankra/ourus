// Logseq's web demo (https://demo.logseq.com/, see README.md), cached as any site's. Its undo history
// takes every transaction but an undo's or a redo's (`listen-db-changes!`), the driver's own load of a
// test's page among them, and keeps it to itself: an undo past what a test did took back part of its
// load (an empty block the page was made with, back at the top: `scenarios.md › Scenario23`, one run
// in five). One statement added on the way out names a function on `globalThis.__ourusLogseq` that
// empties the graph's undo and redo stacks, so that a test's history starts where the test does, as
// ourus's does. Each name is found by Logseq's own code that uses it (the bundle is ClojureScript,
// compiled with every name shortened): page-only undo (`page-pop-undo`, which logs "[debug] undo
// remove: ") reads the undo stack from the graph's history, `(:undo-stack (get-state))`, and sets it
// with `reset!` to a `vec`; the redo stack is the history's `:redo-stack`. Applied on the way out, so
// the cache keeps what the site sent; the driver says so if a name isn't found.

import { withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

/** The bundle with the statement added, or null if what it is found by isn't there. */
export function expose(js: string): string | null {
  const log = js.indexOf('"[debug] undo remove: "');
  if (log < 0) return null;
  // page-pop-undo: `<name>=function(a){var b=<:undo-stack>.A(<get-state>()),...`, the last before its log
  const defs = [...js.slice(Math.max(0, log - 3000), log).matchAll(/([\w$]+)=function\(a\)\{var b=([\w$]+)\.A\(([\w$]+)\(\)\)/g)];
  const def = defs.pop();
  if (!def) return null;
  const [, , undoStack, getState] = def;
  const body = js.slice(log - 3000 + def.index, log);
  const set = /e=\$APP\.([\w$]+)\(\$APP\.[\w$]+\.j\(e,f\)\);\$APP\.([\w$]+)\(b,e\)/.exec(body);
  const redoStack = /([\w$]+)=new \$APP\.M\(null,"redo-stack","redo-stack",/.exec(js)?.[1];
  if (!set || !redoStack) return null;
  const [, vec, reset] = set;
  const at = Math.max(0, log - 3000) + def.index;
  const empty = (stack: string): string => `$APP.${reset}(${stack}.A(s),$APP.${vec}([]))`;
  const statement = `globalThis.__ourusLogseq={clearHistory:()=>{const s=${getState}();${empty(undoStack!)};${empty(redoStack)}}};`;
  return js.slice(0, at) + statement + js.slice(at);
}

export const rules: ProxyRules = {
  hosts: ['demo.logseq.com'],
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    if (req.url.pathname !== '/js/main.js') return undefined;
    const js = expose(res.body.toString('utf8'));
    return js === null ? undefined : withBody(res, js);
  },
};
