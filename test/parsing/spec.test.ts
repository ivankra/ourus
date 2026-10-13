// The parsers against the spec suites, compared as HTML, exactly: CommonMark 0.31.2's examples and
// commonmark.js's regression tests; GFM's spec, extensions and regression tests from cmark-gfm,
// each example run with the extensions its fence names (as cmark-gfm's own runner does; the
// extensions file with all of them).

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { commonmark, defineFlavor, type Extension, type Flavor } from '../../src/parsing/flavor.ts';
import { autolink, footnotes, gfmCore, strikethrough, table, tagfilter, tasklist } from '../../src/parsing/gfm.ts';
import { renderHtml } from '../../src/parsing/html.ts';
import { Syntax } from '../../src/parsing/syntax.ts';

interface Example {
  example: number;
  section: string;
  extensions?: string[];
  markdown: string;
  html: string;
}

const load = (name: string): Example[] => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));

const gfmExtensions: Record<string, Extension> = { table, strikethrough, autolink, tagfilter, footnotes, tasklist };
const flavors = new Map<string, Flavor>();
function gfmWith(names: readonly string[]): Flavor {
  const key = [...new Set(names)].sort().join(' ');
  let f = flavors.get(key);
  if (!f) flavors.set(key, (f = defineFlavor(`gfm (${key})`, [gfmCore, ...key.split(' ').filter(Boolean).map((n) => gfmExtensions[n]!)])));
  return f;
}

/** Attribute order and `/>` don't matter: for the examples cmark-gfm's runner disables for that reason. */
function normalize(html: string): string {
  return html.replace(/<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/g, (_, name: string, attrs: string) => {
    const list = attrs.trim() ? attrs.trim().split(/\s+/).sort() : [];
    return `<${name}${list.map((a) => ' ' + a).join('')}>`;
  });
}

function run(examples: readonly Example[], flavorOf: (ex: Example) => Flavor): string[] {
  const failures: string[] = [];
  for (const ex of examples) {
    const disabled = ex.extensions?.includes('disabled') ?? false;
    let got: string;
    try {
      got = renderHtml(Syntax.parse(ex.markdown, flavorOf(ex)));
    } catch (e) {
      got = `threw ${(e as Error).stack}`;
    }
    const ok = ex.html.trim() === '<IGNORE>' ? !got.startsWith('threw') : disabled ? normalize(got) === normalize(ex.html) : got === ex.html;
    if (!ok) failures.push(`#${ex.example} (${ex.section}) ${JSON.stringify(ex.markdown)}\n  want ${JSON.stringify(ex.html)}\n  got  ${JSON.stringify(got)}`);
  }
  return failures;
}

function check(name: string, examples: readonly Example[], flavorOf: (ex: Example) => Flavor): void {
  test(`${name}: ${examples.length} examples`, () => {
    const failures = run(examples, flavorOf);
    assert.equal(failures.length, 0, `${failures.length} of ${examples.length} fail:\n${failures.slice(0, 10).join('\n')}`);
  });
}

check('CommonMark 0.31.2 spec', load('commonmark-spec-0.31.2'), () => commonmark);
check('commonmark.js regression tests', load('commonmark-js-regression'), () => commonmark);
// the two disabled examples are the task list items', which name no extension
check('GFM spec (cmark-gfm spec.txt)', load('gfm-spec-0.29'), (ex) =>
  gfmWith(ex.extensions?.includes('disabled') ? ['tasklist'] : (ex.extensions ?? [])),
);
check('GFM extensions (cmark-gfm extensions.txt)', load('gfm-extensions'), () => gfmWith(Object.keys(gfmExtensions)));
check('GFM regression tests (cmark-gfm regression.txt)', load('gfm-regression'), (ex) => gfmWith(ex.extensions ?? []));
