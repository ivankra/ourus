// AFFiNE's web app (https://app.affine.pro/, see README.md): with no account it opens a demo
// workspace kept in the browser (IndexedDB), saving nothing to AFFiNE's servers. Its pages and
// bundles (`prod.affineassets.com`) are cached as any site's. Its GraphQL queries at startup (the
// server's config, its sign-in providers) answer the same for any visitor: cached by their body, as a
// GET is by its URL. Cloudflare's bot check on the page (`/cdn-cgi/challenge-platform/`) posts what
// it saw of the browser to a URL of its own each load, which no cache would hold: answered here,
// accepted, and sent nowhere; so is AFFiNE's own telemetry (`/api/telemetry/collect`).

import { createHash } from 'node:crypto';
import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['app.affine.pro', 'prod.affineassets.com'],
  key(req: ProxyRequest) {
    if (req.method === 'POST' && req.url.hostname === 'app.affine.pro' && req.url.pathname === '/graphql') return `${req.url.href} ${createHash('sha1').update(req.body).digest('hex')}`;
    return undefined;
  },
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.method === 'POST' && req.url.pathname.startsWith('/cdn-cgi/challenge-platform/')) return { status: 200, headers: [], body: Buffer.alloc(0) };
    if (req.url.hostname === 'app.affine.pro' && req.url.pathname === '/api/telemetry/collect') return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') };
    return undefined;
  },
};
