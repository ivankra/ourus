// The live app at beta.workflowy.com (see README.md): pages and scripts are cached as any site's. Its
// "signal" WebSocket, which tells other open tabs of a signed-in user about changes, is refused: the
// anonymous demo has none, and the app does without it (the copy on disk stubs it in the page). The
// calls that would save a setting for the anonymous user (the driver turns on markdown pasting) are
// answered here: the setting takes effect in the page either way. So is the server's clock

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

export const rules: ProxyRules = {
  hosts: ['beta.workflowy.com'],
  respond(req: ProxyRequest): ProxyResponse | undefined {
    const path = req.url.pathname;
    if (path.startsWith('/ws/')) return { status: 403, headers: [], body: Buffer.alloc(0) };
    // the server's clock, which WorkFlowy keeps its times by: cached, it stood still, the page took the
    // server to be days behind, and a profile that had stored items since stopped loading
    if (path === '/api/server-time/') return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from(JSON.stringify({ timestamp: Date.now() / 1000 })) };
    if (req.method === 'POST' && (path === '/change_settings' || path.startsWith('/features/'))) return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') };
    return undefined;
  },
};
