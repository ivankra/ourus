// Mubu's shared outlines (https://mubu.com/explore/<id>, see README.md): the real editor, read-only
// to a visitor without an account, made editable in the page by the driver and saving nothing. Its
// API (`api2.mubu.com`) answers by POST, the document too (`/v3/api/explore/get`, by its id): those
// are cached by their body, as a GET is by its URL, so only a cold cache's first load reaches Mubu
// (and adds one to the outline's public count of reads). What only reports on the visitor (its
// device, its session's events) is answered here and sent nowhere: those bodies carry a fresh id or
// time on every load, so caching them would reach Mubu every time. So are the browser's CORS
// preflights (the API is another origin than the page's), with the headers Mubu's API answers with:
// they don't depend on anything a test does.

import { createHash } from 'node:crypto';
import type { ProxyRequest, ProxyResponse, ProxyRules } from '../proxy.ts';

/** The API's reports on the visitor, never sent: its device, its app, its events. */
const REPORTS = /^\/v4\/api\/(common\/user\/(device_info|user_app_info)|user\/trace)$/;

/** CORS headers as Mubu's API sends them, the headers a preflight asks for allowed. */
function cors(req: ProxyRequest): [string, string][] {
  const asked = req.headers['access-control-request-headers'];
  return [
    ['access-control-allow-origin', '*'],
    ['access-control-allow-credentials', 'true'],
    ['access-control-allow-methods', 'POST,GET,OPTIONS,DELETE,HEAD,PUT'],
    ...(asked ? [['access-control-allow-headers', String(asked)] as [string, string]] : []),
    ['access-control-max-age', '86400'],
  ];
}

export const rules: ProxyRules = {
  hosts: ['mubu.com', '.mubu.com'],
  key(req: ProxyRequest) {
    if (req.method === 'POST' && req.url.hostname === 'api2.mubu.com') return `${req.url.href} ${createHash('sha1').update(req.body).digest('hex')}`;
    // the A/B groups, asked for under the browser's device id (a profile's own): one answer for any
    if (req.url.pathname === '/v4/api/common/ab/config') return `${req.url.origin}${req.url.pathname}`;
    return undefined;
  },
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (req.url.hostname !== 'api2.mubu.com') return undefined;
    if (req.method === 'OPTIONS') return { status: 204, headers: cors(req), body: Buffer.alloc(0) };
    if (REPORTS.test(req.url.pathname)) return { status: 200, headers: [...cors(req), ['content-type', 'application/json']], body: Buffer.from('{"code":0,"msg":null,"data":null}') };
    return undefined;
  },
};
