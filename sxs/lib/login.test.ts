// Reading the cookies a person copies from a signed-in browser (login.ts), offline.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCookies } from './login.ts';

test('a cookie header, with or without its name', () => {
  assert.deepEqual(parseCookies('wos-session=abc=; ph_x=%7B%7D'), [
    { name: 'wos-session', value: 'abc=' },
    { name: 'ph_x', value: '%7B%7D' },
  ]);
  assert.deepEqual(parseCookies('cookie: a=1'), [{ name: 'a', value: '1' }]);
});

test("a browser's Copy as cURL: its -b, or its cookie header", () => {
  const curl = `curl --url 'https://home.tana.inc/' \\\n  -H 'accept: text/html' \\\n  -b 'a=1; b=two' \\\n  -H 'user-agent: Mozilla/5.0'`;
  assert.deepEqual(parseCookies(curl), [
    { name: 'a', value: '1' },
    { name: 'b', value: 'two' },
  ]);
  assert.deepEqual(parseCookies(`curl 'https://x/' -H 'Cookie: s=1; t=2'`), [
    { name: 's', value: '1' },
    { name: 't', value: '2' },
  ]);
});

test("a curl's quoting: a double quote in '...', and bash's $'...' with its escapes", () => {
  assert.deepEqual(parseCookies(`curl 'https://x/' -b 'a=1; b="x"'`), [
    { name: 'a', value: '1' },
    { name: 'b', value: '"x"' },
  ]);
  assert.deepEqual(parseCookies(`curl 'https://x/' -H 'accept: */*' -b $'a=1; b=\\'x\\''`), [
    { name: 'a', value: '1' },
    { name: 'b', value: "'x'" },
  ]);
});
