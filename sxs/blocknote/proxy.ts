// BlockNote's site (https://www.blocknotejs.org/, see README.md): its pages and bundles are cached as
// any site's. Its error reporting, Sentry through the site's own `/monitoring` route (Sentry's
// tunnel), is answered here, as accepted: a test's browser reports nothing to the site. So are
// Next.js's prefetches (`?_rsc=`: the pages the example's links go to, the example's own, in segments,
// which ones depending on timing), as empty: a test loads the example as a page and never navigates,
// and a prefetch the cache lacks would come from the site as it is now, a newer build than the page,
// with chunks of its own. And the site's pictures around the example, none of the editor's, as not
// found and fetched nowhere: an npm version badge (`img.shields.io`) and contributors' avatars
// (`github.com/<user>.png`, redirected to `avatars.githubusercontent.com`).

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['www.blocknotejs.org', 'img.shields.io', 'avatars.githubusercontent.com', 'github.com'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    const { hostname, pathname } = req.url;
    if (hostname === 'img.shields.io' || hostname === 'avatars.githubusercontent.com' || (hostname === 'github.com' && /^\/[\w.-]+\.png$/.test(pathname))) return { status: 404, headers: [], body: Buffer.alloc(0) };
    if (req.method === 'POST' && req.url.pathname === '/monitoring') return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') };
    if (req.url.searchParams.has('_rsc')) return { status: 204, headers: [], body: Buffer.alloc(0) };
    return undefined;
  },
};
