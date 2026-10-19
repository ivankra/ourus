// RemNote (https://www.remnote.com/notes, see README.md), in its own test mode: its pages and data are
// cached as any site's. Its analytics are answered here and fetched nowhere: Segment's library, which
// it loads through AMBOSS's first-party proxy (`www.amboss.com/us/api/sprx/cdn/<key>/a.min.js`; RemNote
// is AMBOSS's), and which its test mode keeps from sending, not from loading. Nothing else of RemNote's
// is on that host.

import type { ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['www.amboss.com'],
  respond(): ProxyResponse {
    return { status: 200, headers: [['content-type', 'text/javascript']], body: Buffer.alloc(0) };
  },
};
