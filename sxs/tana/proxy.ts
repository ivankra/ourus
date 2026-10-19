// Tana Outliner (https://app.tana.inc/, see README.md), in its UI-test mode, which asks no server for
// anything: its page (`/tests`, the app's shell, the same for every route and every visitor), its
// static files (scripts, styles, fonts, images, wasm), its version check (`/VERSION?nocache`) and its
// feature flags for an anonymous user are cached; its telemetry is answered here and sent nowhere:
// Sentry through its own host (`/api/<project>/envelope/`, `/security/`), its usage tracking
// (`/api/improve`), OpenTelemetry traces (`ot.tana.inc`). Anything else on its hosts goes live (a
// person browsing them by hand, signed in, gets nothing of theirs cached).

import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

const ok = (): ProxyResponse => ({ status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') });

export const rules: ProxyRules = {
  hosts: ['.tana.inc'],
  key(req: ProxyRequest) {
    const { hostname, pathname } = req.url;
    if (req.method !== 'GET' && req.method !== 'HEAD') return null;
    if (hostname !== 'app.tana.inc') return null;
    if (pathname === '/tests') return `${req.url.origin}/tests`;
    if (pathname === '/VERSION') return `${req.url.origin}/VERSION`;
    if (pathname === '/functions/featureFlags/sdk/v2/vardata') return undefined;
    if (/\.(js|mjs|css|wasm|woff2?|ttf|png|svg|ico|webp|jpe?g|gif)$/.test(pathname)) return undefined;
    return null;
  },
  respond(req: ProxyRequest): ProxyResponse | undefined {
    const { hostname, pathname } = req.url;
    if (hostname === 'app.tana.inc' && /^\/api\/(\d+\/(envelope|security)\/|improve$)/.test(pathname)) return ok();
    if (hostname === 'ot.tana.inc') return ok();
    return undefined;
  },
};
