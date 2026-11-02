// Tine's guide (https://tine.page/guide/app/, see README.md) is Tine's own editor, published
// read-only over a snapshot: its page says so with a `tine-published` meta, and the app then takes a
// backend that refuses every write. Without the meta it takes its in-memory one (the mock the app
// ships for running in a browser), editable and saving nothing. Its bundle keeps the document store
// and the mock's pages to itself; two patches name them on `globalThis` for the driver. A third names
// Tine's own reading of a block's header (`deriveFacets`: its task marker, priority, heading level,
// dates, tags, properties, from the wasm parse): a page's blocks come with those as the backend
// computed them, which Tine takes as they are (`seedFacets`), so the driver's must be Tine's own
// reading, as the real backend's are. All are applied on the way out, so the cache keeps what the
// site sent.

import { header, withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['tine.page'],
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    const path = req.url.pathname;
    if ((path === '/guide/app/' || path === '/guide/app/index.html') && /html/.test(header(res, 'content-type') ?? '')) {
      return withBody(res, res.body.toString('utf8').replace(/<meta name="tine-published"[^>]*>/, ''));
    }
    if (/^\/guide\/app\/assets\/app-[\w-]+\.js$/.test(path)) {
      // (identifiers as the minifier makes them: `$` among their characters, `j$`)
      const id = '[\\w$]+';
      const js = res.body
        .toString('utf8')
        // the document store, `[doc, setDoc] = createStore({ byId, pages, feed, loaded })`
        .replace(new RegExp(`\\[(${id}),(${id})\\]=(${id})\\(\\{byId:\\{\\},pages:\\[\\],feed:\\[\\],loaded:!1\\}\\)`), '[$1,$2]=globalThis.__sxsDoc=$3({byId:{},pages:[],feed:[],loaded:!1})')
        // the mock backend's pages, which opening a page reads: an array of its page lists spread
        // together, looked up by a `find` of its own a few declarations on (`const A=[...x,...y],
        // g=e=>A.find(`; since the bundle of 2026-11, `const e=[...x,...y,...A],B=…,Q=n=>e.find(`)
        .replace(new RegExp(`\\{const (${id})=(\\[\\.\\.\\.${id}(?:,\\.\\.\\.${id})*\\]),(?=[^;]{0,400}?=>\\1\\.find\\()`), (_, a, all) => `{const ${a}=globalThis.__sxsPages=${all},`)
        // a block's header facets from its text (`deriveFacets(raw, format)`: the parse's first block,
        // a bullet's or a heading's marker, priority and size, then the parse's properties)
        .replace(
          new RegExp(`function (${id})\\((${id}),(${id})\\)\\{const (${id})=${id}\\(\\2,\\3\\),(${id})=\\4\\[0\\];let ${id}=null,${id}=null,${id}=null;if\\(\\5&&\\(\\5\\.kind==="bullet"\\|\\|\\5\\.kind==="heading"\\)\\)`),
          (m, f) => `globalThis.__sxsFacets=${f};${m}`,
        );
      return withBody(res, js);
    }
    return undefined;
  },
};
