// Athens (https://athensresearch.github.io/athens/, see README.md): its web build, archived, cached as any
// site's. Its graph is a DataScript database in the page, which the bundle (ClojureScript, compiled with
// every name shortened) keeps to itself. One statement added on the way out names what the driver needs
// on `globalThis.__ourusAthens`, each found by the code of Athens's own that uses it:
//
// - the connection, and `transact!` and `deref`: Athens's transaction wrapper (its tracing span
//   `ds/transact!-wrap-span`) derefs a connection and calls `transact!(conn, tx)`, and the graph's health
//   check right after it reads Athens's connection (`var a=<conn>;`);
// - transit's `read` and `reader`, which make ClojureScript data (keywords, maps, vectors) from JSON:
//   Athens reads its settings with them (`read(reader(:json, null), localStorage.getItem(...))`);
// - ClojureScript's `Volatile`, by its constructor (`this.state=a`, IDeref its one protocol): an Entity
//   of DataScript's (exported, `datascript.impl.entity.Entity`) holds two.
//
// And one number changed: a block's editor stores its text two seconds after the last change to it (a
// debounced idle save, `(debounce #(save :idle) 2000)` in its state), so a block the caret has left reads
// as it was for those seconds; the save is made right after each change instead. Applied on the way out,
// so the cache keeps what the site sent; the driver says so if a name isn't found.

import { withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

/** The bundle with the statement added, or null if what it is found by isn't there. */
export function expose(js: string): string | null {
  const span = js.indexOf('"ds/transact!-wrap-span"');
  if (span < 0) return null;
  const deref = [...js.slice(Math.max(0, span - 2000), span).matchAll(/var f=([\w$]+)\(a\)/g)].pop()?.[1];
  const after = /a=([\w$]+)\.j\(a,[\w$]+\);[^}]*return a\}(\s*)function [\w$]+\(\)\{var a=([\w$]+);/.exec(js.slice(span, span + 600));
  const transit = /=([\w$]+)\(([\w$]+)\(([\w$]+),null\),localStorage\.getItem\(/.exec(js);
  const volatile = /function ([\w$]+)\(a\)\{this\.state=a;this\.[\w$]+=32768;this\.[\w$]+=0\}/.exec(js)?.[1];
  if (!deref || !after || !transit || !volatile) return null;
  const [, transact, , conn] = after;
  const [, read, reader, json] = transit;
  const at = span + after.index + after[0].indexOf('function ');
  const statement = `globalThis.__ourusAthens={conn:()=>${conn},deref:c=>${deref}(c),transact:(c,t)=>${transact}.j(c,t),read:s=>${read}(${reader}(${json},null),s),volatile:v=>new ${volatile}(v)};`;
  // the block editor's idle save: `debounce(() => save(:idle), 2000)`, the last of its state's entries
  const idle = /(\(function\(\)\{return [\w$]+\([\w$]+\)\},)2E3(\)\]\)\);return function\()/;
  const patched = js.slice(0, at) + statement + js.slice(at);
  return idle.test(patched) ? patched.replace(idle, '$10$2') : null;
}

export const rules: ProxyRules = {
  hosts: ['athensresearch.github.io'],
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    if (req.url.pathname !== '/athens/js/compiled/app.js') return undefined;
    const js = expose(res.body.toString('utf8'));
    return js === null ? undefined : withBody(res, js);
  },
};
