// Dynalist's live demo (https://dynalist.io/demo, see README.md). Its document and app data come by POST
// (`/api/file/load`, `/api/bundle_binary`), whose answers depend only on what is asked: cached by
// their body, as a GET is by its URL. Its beacons (`dynlst.com/update`, Cloudflare's `/cdn-cgi/rum`)
// are answered here and sent nowhere.

import { createHash } from 'node:crypto';
import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['dynalist.io', 'dynlst.com'],
  key(req: ProxyRequest) {
    if (req.method === 'POST' && /^\/api\/(file\/load|bundle_binary)$/.test(req.url.pathname)) return `${req.url.href} ${createHash('sha1').update(req.body).digest('hex')}`;
    return undefined;
  },
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.url.hostname === 'dynlst.com' || req.url.pathname.startsWith('/cdn-cgi/rum')) return { status: 204, headers: [], body: Buffer.alloc(0) };
    return undefined;
  },
};
