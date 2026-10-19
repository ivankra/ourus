// Apps behind a login (none driven now: Tana's meeting product, home.tana.inc, would be one): a driver
// finds the wall as it opens the app and stops the run, saying which environment variable to give a
// signed-in session in (`Driver.login`). Given, the session's cookies go into the profile of the pool's
// browser the run is in (`.sxs/chromium/<n>/profile/`), which keeps them: a later run in it needs the
// variable again only once the session expires or the profile goes; one in another browser asks again.

import type { BrowserContext } from 'playwright-core';

/** The app wants a signed-in session it hasn't got: the message says how to give it one. */
export class LoginRequired extends Error {}

/** The exit code of a run stopped for a session (2 is a wrong command line): a run of several apps leaves such an app out. */
export const LOGIN_EXIT = 3;

/**
 * The shell word `s` starts with, unquoted: `'...'` as it is, `"..."` and bash's `$'...'` (which Copy as
 * cURL uses for a cookie with a quote in it) with their escapes taken off, or a bare word.
 */
function shellWord(s: string): string {
  const ansi = /^\$'((?:\\.|[^\\'])*)'/.exec(s);
  if (ansi) return ansi[1]!.replace(/\\(.)/g, (_, c: string) => ({ n: '\n', t: '\t', r: '\r' })[c] ?? c);
  const single = /^'([^']*)'/.exec(s);
  if (single) return single[1]!;
  const double = /^"((?:\\.|[^\\"])*)"/.exec(s);
  if (double) return double[1]!.replace(/\\(.)/g, '$1');
  return /^\S*/.exec(s)![0];
}

/**
 * The cookies in what a person copies from a signed-in browser: a request's `cookie` header
 * (`a=1; b=2`), or a whole "Copy as cURL" (its `-b`, `--cookie`, or `-H 'cookie: ...'`).
 */
export function parseCookies(copied: string): { name: string; value: string }[] {
  const s = copied.trim();
  const words = (option: RegExp): string[] => [...s.matchAll(option)].map((m) => shellWord(s.slice(m.index + m[0].length)));
  const fromCurl = words(/(?:^|\s)(?:-b|--cookie)\s+/g)[0] ?? words(/(?:^|\s)(?:-H|--header)\s+/g).find((h) => /^cookie:/i.test(h))?.replace(/^cookie:\s*/i, '');
  const header = fromCurl ?? s.replace(/^cookie:\s*/i, '');
  return header
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.includes('='))
    .map((part) => ({ name: part.slice(0, part.indexOf('=')).trim(), value: part.slice(part.indexOf('=') + 1).trim() }));
}

/**
 * Puts the session in `env` (a cookie header, or a curl command, from a signed-in browser) into the
 * app's browser, but analytics' cookies (PostHog's `ph_…`, Google's `_ga…`); false when `env` isn't set.
 * A header says no cookie's attributes: each goes to `url`'s site and its subdomains (`.tana.inc`),
 * readable by the page's scripts, as the most a session cookie could have been.
 */
export async function addSessionCookies(context: BrowserContext, env: string, url: string): Promise<boolean> {
  const copied = process.env[env];
  if (!copied) return false;
  const cookies = parseCookies(copied).filter((c) => !/^(ph_|_ga|_gid|_fbp|ajs_)/.test(c.name));
  if (!cookies.length) throw new LoginRequired(`${env} holds no cookies: give it the \`cookie\` header of a signed-in request to ${new URL(url).host}, or the whole "Copy as cURL" of one`);
  const site = new URL(url).hostname.split('.').slice(-2).join('.');
  await context.addCookies(cookies.map((c) => ({ ...c, domain: `.${site}`, path: '/', secure: true, httpOnly: false, sameSite: 'Lax' as const })));
  return true;
}
