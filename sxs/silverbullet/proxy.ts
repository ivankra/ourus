// SilverBullet's live demo (https://demo.silverbullet.md/personal/, see README.md) is read-only: its boot
// config says so, and its server refuses writes. Pages and plugs are cached as any site's; the boot
// config is patched to let the editor edit, and every write to the server (a sync push, a delete) is
// answered 503 here, as if the server were briefly away. SilverBullet is local-first: it keeps the
// edits in the browser and tries again later, so the demo is never written to. A test's page, which
// the server never has, is answered "not found" here: each has a name of its own, so its lookup would
// reach the server on every run.

import { header, withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['demo.silverbullet.md'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') return { status: 503, headers: [['content-type', 'text/plain']], body: Buffer.from('ourus proxy: the demo is not written to\n') };
    // the driver's pages (driver.ts), as the server answers for a page it doesn't have
    if (/\/\.fs\/ourus-sxs/.test(req.url.pathname)) return { status: 404, headers: [['content-type', 'text/plain; charset=utf-8']], body: Buffer.from('404 page not found\n') };
    return undefined;
  },
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    if (!req.url.pathname.endsWith('/.config') || !/json/.test(header(res, 'content-type') ?? '')) return undefined;
    const config = JSON.parse(res.body.toString('utf8'));
    return withBody(res, JSON.stringify({ ...config, readOnly: false }));
  },
};
