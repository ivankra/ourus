// Logseq's DB version on its test channel (https://test.logseq.com/, see README.md), cached as any
// site's. Its undo history is the database worker's, per graph, and takes every transaction, the
// driver's own load of a test's page among them: three undos after a load emptied the page. The app
// can empty it (`frontend.undo-redo/clear-history!`, which only its developer panel calls), so one
// statement added on the way out names that on `globalThis.__ourusLogseq`, so that a test's history
// starts where the test does, as ourus's does. Each name is found by Logseq's own code around it (the
// bundle is ClojureScript, compiled with every name shortened): the main thread's call into the
// worker that tolerates a worker not yet up ("db-worker has not been initialized"), and the keyword
// it is called with, `:thread-api/undo-redo-clear-history`; the argument list as the developer
// panel's own call makes it (`<invoke>(<keyword>, $APP.<seq>([repo],0))`). Applied on the way out, so
// the cache keeps what the site sent; the driver says so if a name isn't found.

import { withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

/** The bundle with the statement added, or null if what it is found by isn't there. */
export function expose(js: string): string | null {
  const invoke = /([\w$]+)=function\(a,b\)\{try\{return \$APP\.[\w$]+\.V\([\w$]+,a,b\)\}catch\(c\)\{a=c;if\(\$APP\.[\w$]+\.F\("db-worker has not been initialized"/.exec(js);
  const keyword = /([\w$]+)=new \$APP\.F\("thread-api","undo-redo-clear-history","thread-api\/undo-redo-clear-history"/.exec(js)?.[1];
  if (!invoke || !keyword) return null;
  const call = new RegExp(`${invoke[1]!.replace(/\$/g, '\\$')}\\(${keyword.replace(/\$/g, '\\$')},\\$APP\\.([\\w$]+)\\(\\[e\\],0\\)\\)`).exec(js);
  if (!call) return null;
  const statement = `globalThis.__ourusLogseq={clearHistory:(r)=>${invoke[1]}(${keyword},$APP.${call[1]}([r],0))};`;
  return js.slice(0, invoke.index) + statement + js.slice(invoke.index);
}

export const rules: ProxyRules = {
  hosts: ['test.logseq.com'],
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    if (req.url.pathname !== '/js/main.js') return undefined;
    const js = expose(res.body.toString('utf8'));
    return js === null ? undefined : withBody(res, js);
  },
};
