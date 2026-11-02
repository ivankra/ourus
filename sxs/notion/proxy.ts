// Notion's published pages (https://<space>.notion.site/<page>): Notion's own editor over a public
// page, which an anonymous visitor gets as a "reader". The page's data says so (`publicAccessRole`,
// and a `role` on every record), and the editor draws every block read-only (`canEditText=false`).
// Its role is rewritten on the way out to "editor", so the app builds its stores editable from the
// start; the cache keeps what Notion sent. Nothing is saved: the app's writes and its reports on the
// visitor are answered here and sent nowhere, and its reads are cached by their body, so only a cold
// cache's first load reaches Notion (which rate-limits an unknown browser after a few loads).

import { createHash } from 'node:crypto';
import { header, withBody, type ProxyRequest, type ProxyResponse, type ProxyRules } from '../proxy.ts';

/**
 * The API's writes and its reports on the visitor: answered `{}`, never sent. Its reads are the page's
 * own data (the app breaks on an empty answer: `backlinks is not iterable`), cached by their body.
 */
const LOCAL = /^\/api\/v3\/(submitTransaction|saveTransactions\w*|ping|etClient|record\w+|logClientEvent\w*|getUserAnalyticsSettings)$/;

/**
 * Notion's event collectors (Splunk, Statsig's `exp.notion.com`): another origin than the page's, so
 * the browser asks first (CORS). Refused or unanswered, the app logs an error and retries for ever, as
 * Mubu's did (sxs/mubu/proxy.ts); answered here, it is done with them.
 */
const COLLECTORS = ['http-inputs-notion.splunkcloud.com', 'exp.notion.com'];

/** The user a paste's blocks are made by, for a visitor, who is none (`SCRIPT_PATCHES`). */
const VISITOR = '5a000000-0000-4000-8000-0000000000ff';

/**
 * What the app's scripts check that a visitor fails, rewritten in them as they pass: a marker each is
 * found by, the code, and what it becomes. Tied to the minifier's output; a rewrite that stops matching
 * leaves the check as it is, quietly (README: what each one stops).
 */
export const SCRIPT_PATCHES: [string, RegExp, string][] = [
  // The editor's mode for a block's page (`getModeType`): "edit" takes a signed-in user, and a page
  // being edited or shared as editable. An anonymous visitor gets "view" whatever the role: the
  // function takes both as given, so the mode is "edit" for a role that may edit.
  ['getModeType(', /(getModeType\(\w+,\w+,\w+\)\{[^}]*?\w+=)\w+\.currentUser\.isLoggedIn\(\);return (\w+)&&(\w+)&&\(this\.state\.editing\|\|/, '$1!0;return $2&&$3&&(!0||'],
  // the block actions' check that a public page is in "edit" mode (a block selection's Delete, ...):
  // a visitor's stays "view" whatever the editor's mode
  ['hasPublicPermission&&"edit"!==', /function (\w+)\((\w+)\)\{return!!\2&&\2\.hasPublicPermission&&"edit"!==\2\.permission\}/, 'function $1($2){return!1}'],
  // the space's block limit, which a paste of blocks checks first (`canCreate`): a visitor's space is
  // over it, and the paste does nothing; as for a space with no limit
  ['gracePeriodEndDate?{canCreate', /(function \w+\(\w+,(\w+),\w+\)\{return )(\2\?\2\.gracePeriodEndDate\?)/, '$1$2=void 0,$3'],
  // a paste's blocks, made from its HTML, name their author: the signed-in user's record, which a
  // visitor hasn't, and the paste does nothing. A made-up one's id instead (nothing is saved)
  // whether selected blocks may be deleted (`canDelete`): the signed-in user's roles in the space, and
  // a visitor has none, so a block selection's Delete did nothing
  ['needsParentEditAccess', /(function \w+\(\{environment:\w+,publicEditMode:\w+,blocks:\w+\}\)\{)(if\(\w+\(\d+\)\.l\.state\)return\{canDelete:!1)/, '$1return{canDelete:!0};$2'],
  ['AppStoreCurrentUserStore.state,', /(AppStoreCurrentUserStore\.state,(\w+)=\(0,\w+\(\d+\)\.Z\)\(\);)if\(!(\w+)\|\|!\2\)return;let (\w+)=\3\.getValue\(\);if\(!\4\)return;/, `$1if(!$2)return;let $4=$3&&$3.getValue()||{id:"${VISITOR}"};`],
];

/**
 * A test's block, as the driver gives it (`?sxs=`): its depth, Notion's type for it (`bulleted_list`,
 * `numbered_list`, `to_do`, `text`, `header`, `sub_header`, `sub_sub_header`, `quote`, `code`), its
 * title as Notion's rich text (`[[text, [mark, ...]], ...]`), a to-do's check, a code block's language,
 * a numbered list's first number where it isn't 1.
 */
export interface NotionBlock {
  depth: number;
  type: string;
  title: (string | string[][])[][];
  checked?: boolean;
  language?: string;
  start?: number;
}

const isApi = (req: ProxyRequest) => req.url.pathname.startsWith('/api/v3/');

export const rules: ProxyRules = {
  hosts: ['.notion.site', 'app.notion.com', 'www.notion.so', ...COLLECTORS],
  key(req: ProxyRequest) {
    // the app's feature flags, asked for with a body of the visitor's ids and times: one answer for any
    if (req.url.pathname === '/api/v3/getAppConfig') return req.url.href;
    if (req.method === 'POST' && isApi(req)) return `${req.url.href} ${createHash('sha1').update(req.body).digest('hex')}`;
    // the page, whatever test's document its query carries (`?sxs=`, read from the cookie and the
    // referer, not from the page): one copy, so one build of the app's for every test (each copy
    // cached when its test first ran had the build of that day, and cost a load from Notion)
    if (req.method === 'GET' && req.url.searchParams.has('sxs')) {
      const u = new URL(req.url.href);
      u.searchParams.delete('sxs');
      return u.href;
    }
    return undefined;
  },
  respond(req: ProxyRequest): ProxyResponse | undefined {
    if (COLLECTORS.includes(req.url.hostname)) {
      const cors: [string, string][] = [
        ['access-control-allow-origin', String(req.headers.origin ?? '*')],
        ['access-control-allow-credentials', 'true'],
        ['access-control-allow-methods', 'GET,POST,OPTIONS'],
        ['access-control-allow-headers', String(req.headers['access-control-request-headers'] ?? '*')],
      ];
      if (req.method === 'OPTIONS') return { status: 204, headers: cors, body: Buffer.alloc(0) };
      return { status: 200, headers: [...cors, ['content-type', 'application/json']], body: Buffer.from('{}') };
    }
    if (isApi(req) && LOCAL.test(req.url.pathname)) {
      return { status: 200, headers: [['content-type', 'application/json']], body: Buffer.from('{}') };
    }
    return undefined;
  },
  patch(req: ProxyRequest, res: ProxyResponse): ProxyResponse | undefined {
    if (req.method === 'GET' && /\.js$/.test(req.url.pathname)) {
      const js = res.body.toString('utf8');
      const out = SCRIPT_PATCHES.reduce((t, [marker, re, to]) => (t.includes(marker) ? t.replace(re, to) : t), js);
      return out === js ? undefined : withBody(res, out);
    }
    if (req.method !== 'POST' || !isApi(req) || !/json/.test(header(res, 'content-type') ?? '')) return undefined;
    // the page's own blocks go: a test starts from an empty page and types its document (the driver)
    if (req.url.pathname === '/api/v3/loadCachedPageChunkV2') {
      const data = JSON.parse(res.body.toString('utf8'));
      const page = data?.recordMap?.block?.[JSON.parse(req.body.toString('utf8')).page?.id]?.value?.value;
      if (page) {
        page.content = [];
        // a test's document, given in the page's URL (`?sxs=`, its blocks as JSON: `NotionBlock`)
        // (or in a cookie of that name: the app may drop the query from its URL before it asks)
        const cookie = /(?:^|;\s*)sxs=([^;]*)/.exec(String(req.headers.cookie ?? ''))?.[1];
        const sxs = (cookie && decodeURIComponent(cookie)) || new URL(String(req.headers.referer ?? 'http://x/')).searchParams.get('sxs');
        if (sxs) {
          const blocks: NotionBlock[] = JSON.parse(sxs);
          const spaceId = page.space_id;
          const ids = blocks.map((_, i) => `5a000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
          const parents: number[] = [];
          blocks.forEach((b, i) => {
            const parent = b.depth ? parents[b.depth - 1]! : -1;
            parents[b.depth] = i;
            parents.length = b.depth + 1;
            const properties: Record<string, unknown> = { title: b.title };
            if (b.type === 'to_do') properties.checked = [[b.checked ? 'Yes' : 'No']];
            if (b.type === 'code') properties.language = [[b.language ?? 'Plain Text']];
            const value = { id: ids[i], version: 1, type: b.type, properties, ...(b.start !== undefined && { format: { list_start_index: b.start } }), content: [], created_time: 1, last_edited_time: 1, parent_id: parent < 0 ? page.id : ids[parent], parent_table: 'block', alive: true, space_id: spaceId };
            data.recordMap.block[ids[i]!] = { spaceId, value: { value, role: 'reader' } };
            (parent < 0 ? page.content : data.recordMap.block[ids[parent]!].value.value.content).push(ids[i]);
          });
        }
      }
      return withBody(res, JSON.stringify(data).replace(/"(role|publicAccessRole)":"reader"/g, '"$1":"editor"'));
    }
    const text = res.body.toString('utf8');
    const out = text.replace(/"(role|publicAccessRole)":"reader"/g, '"$1":"editor"');
    return out === text ? undefined : withBody(res, out);
  },
};
