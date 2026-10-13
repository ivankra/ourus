// BlockNote's site (https://www.blocknotejs.org/, see README.md): its pages and bundles are cached as
// any site's. Its error reporting, Sentry through the site's own `/monitoring` route (Sentry's
// tunnel), is answered here, as accepted: a test's browser reports nothing to the site. So are
// Next.js's prefetches (`?_rsc=`: the pages the example's links go to, the example's own, in segments,
// which ones depending on timing), as empty: a test loads the example as a page and never navigates,
// and a prefetch the cache lacks would come from the site as it is now, a newer build than the page,
// with chunks of its own.

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['www.blocknotejs.org'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.method === 'POST' && req.url.pathname === '/monitoring') return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') };
    if (req.url.searchParams.has('_rsc')) return { status: 204, headers: [], body: Buffer.alloc(0) };
    return undefined;
  },
};
