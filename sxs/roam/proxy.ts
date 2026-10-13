// Roam's backend (see README.md): pages and scripts are cached as any site's, and the help graph comes
// from Firebase live, once per load (a token exchange, the realtime database). What creating the
// tests' blocks would send on every test is answered here: the AI embeddings of new blocks
// (`voyage-embed`), which Roam's servers refuse an anonymous visitor anyway (401). So is the help
// graph's search index (`search.db`, 10 MB, from Cloud Storage, through a URL signed anew on every load),
// as not found: no test searches.

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['us-central1-firescript-577a2.cloudfunctions.net', 'storage.googleapis.com'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.url.hostname === 'storage.googleapis.com' && req.url.pathname.startsWith('/firescript-577a2.appspot.com/') && req.url.pathname.endsWith('/search.db')) return { status: 404, headers: [['access-control-allow-origin', '*']], body: Buffer.alloc(0) };
    if (!req.url.pathname.startsWith('/voyage-embed')) return undefined;
    const cors: [string, string][] = [
      ['access-control-allow-origin', String(req.headers.origin ?? '*')],
      ['access-control-allow-headers', String(req.headers['access-control-request-headers'] ?? '*')],
      ['access-control-allow-methods', 'POST, OPTIONS'],
    ];
    if (req.method === 'OPTIONS') return { status: 204, headers: cors, body: Buffer.alloc(0) };
    return { status: 401, headers: [...cors, ['content-type', 'application/json']], body: Buffer.from('{"error":"unauthenticated"}') };
  },
};
