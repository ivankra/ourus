// Lexical's playground (https://playground.lexical.dev/, see README.md): a static site, its pages and
// bundles cached as any site's. Vercel's analytics on it (`/_vercel/insights/`, `/_vercel/speed-insights/`:
// the scripts, then what they report) are answered here, empty, and sent nowhere.

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['playground.lexical.dev'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (!req.url.pathname.startsWith('/_vercel/')) return undefined;
    if (req.method === 'GET') return { status: 200, headers: [['content-type', 'text/javascript']], body: Buffer.alloc(0) };
    return { status: 204, headers: [], body: Buffer.alloc(0) };
  },
};
