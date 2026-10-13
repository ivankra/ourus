// Tine's guide (https://tine.page/guide/app/, see README.md) is Tine's own editor, published
// read-only over a snapshot: its page says so with a `tine-published` meta, and the app then takes a
// backend that refuses every write. Without the meta it takes its in-memory one (the mock the app
// ships for running in a browser), editable and saving nothing. Its bundle keeps the document store
// and the mock's pages to itself; two patches name them on `globalThis` for the driver. Both are
// applied on the way out, so the cache keeps what the site sent.

import { header, withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['tine.page'],
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    const path = req.url.pathname;
    if ((path === '/guide/app/' || path === '/guide/app/index.html') && /html/.test(header(res, 'content-type') ?? '')) {
      return withBody(res, res.body.toString('utf8').replace(/<meta name="tine-published"[^>]*>/, ''));
    }
    if (/^\/guide\/app\/assets\/app-[\w-]+\.js$/.test(path)) {
      const js = res.body
        .toString('utf8')
        // the document store, `[doc, setDoc] = createStore({ byId, pages, feed, loaded })`
        .replace(/\[(\w+),(\w+)\]=(\w+)\(\{byId:\{\},pages:\[\],feed:\[\],loaded:!1\}\)/, '[$1,$2]=globalThis.__sxsDoc=$3({byId:{},pages:[],feed:[],loaded:!1})')
        // the mock backend's pages, which opening a page reads
        .replace(/\{const (\w+)=(\[\.\.\.\w+(?:,\.\.\.\w+)*\]),(\w+)=(\w+)=>\1\.find\(/, (_, a, all, g, e) => `{const ${a}=globalThis.__sxsPages=${all},${g}=${e}=>${a}.find(`);
      return withBody(res, js);
    }
    return undefined;
  },
};
