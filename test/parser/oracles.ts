// Differential test against reference implementations, on generated documents: our HTML must equal
// commonmark.js's (CommonMark) and cmark-gfm's (GFM, all extensions). Not part of `npm test`: it
// needs the oracles, given by path.
//
//   COMMONMARK_JS=path/to/commonmark.js/lib/index.js CMARK_GFM=path/to/cmark-gfm \
//     node test/parser/oracles.ts [documents per vocabulary] [seed]
//
// commonmark.js should be a revision after 0.31.2 (two fixes ourus follows: blank lines in items
// keep the spaces past the item's indentation; info strings are trimmed after unescaping).
//
// cmark (C) and commonmark.js read some corners of CommonMark differently, and ourus follows
// commonmark.js and the spec's text there (10-parsing.md lists them). So GFM is compared on the
// documents where cmark-gfm without extensions agrees with commonmark.js: what is left to differ
// is the extensions. Differences ourus makes on purpose are counted apart (gfm.ts's header).

import { spawnSync } from 'node:child_process';
import fc from 'fast-check';
import { commonmark } from '../../src/parser/flavor.ts';
import { defineFlavor } from '../../src/parser/flavor.ts';
import { autolink, footnotes, gfmCore, strikethrough, table, tagfilter, tasklistExtension } from '../../src/parser/gfm.ts';
import { renderHtml } from '../../src/parser/html.ts';
import { SyntaxTree } from '../../src/parser/syntax.ts';
import { BLOCKS, INLINES, arbDoc } from './generators.ts';

const count = Number(process.argv[2] ?? 2000);
const seed = Number(process.argv[3] ?? 42);
const show = Number(process.env.SHOW ?? 5);

type Render = (md: string) => string;
let commonmarkJs: Render | null = null;
if (process.env.COMMONMARK_JS) {
  const cm = await import(process.env.COMMONMARK_JS);
  const parser = new cm.Parser();
  const renderer = new cm.HtmlRenderer();
  commonmarkJs = (md) => renderer.render(parser.parse(md));
}
const cmarkGfm = (args: string[]): Render | null =>
  process.env.CMARK_GFM ? (md) => spawnSync(process.env.CMARK_GFM!, ['--unsafe', ...args], { input: md, encoding: 'utf8' }).stdout : null;
const cmarkCore = cmarkGfm([]);
const cmarkAll = cmarkGfm(['-e', 'footnotes', '-e', 'table', '-e', 'strikethrough', '-e', 'autolink', '-e', 'tagfilter', '-e', 'tasklist']);

/** GFM with task items where cmark-gfm finds them (ourus also finds them in quotes and after another marker). */
const gfm = defineFlavor('gfm (cmark-gfm task items)', [gfmCore, table, tasklistExtension({ cmark: true }), strikethrough, autolink, tagfilter, footnotes]);

interface Check {
  readonly name: string;
  /** null when the document isn't compared (with why). */
  compare(md: string): { want: string; got: string } | string | null;
}

const checks: Check[] = [];
if (commonmarkJs) {
  const reference = commonmarkJs;
  checks.push({ name: 'commonmark.js', compare: (md) => ({ want: reference(md), got: renderHtml(SyntaxTree.parse(md, commonmark)) }) });
}
if (cmarkCore && cmarkAll && commonmarkJs) {
  const reference = commonmarkJs;
  checks.push({
    name: 'cmark-gfm',
    compare(md) {
      // cmark-gfm's renderer writes nested <strong> once: not a reading difference
      const core = cmarkCore(md);
      if (core !== reference(md).replace(/<strong>((?:(?!<\/?strong>).)*?)<strong>/gs, '<strong>$1') && core !== reference(md)) return 'cmark and commonmark.js read the document differently';
      return { want: cmarkAll(md), got: renderHtml(SyntaxTree.parse(md, gfm)) };
    },
  });
}
if (!checks.length) {
  console.log('set COMMONMARK_JS (and CMARK_GFM for GFM, which needs both)');
  process.exit(2);
}

let failed = 0;
for (const check of checks) {
  for (const [vocabulary, docs] of [['blocks', arbDoc(BLOCKS, { endings: ['\n'] })], ['inlines', arbDoc(INLINES, { endings: ['\n'] })]] as const) {
    const samples = fc.sample(docs, { numRuns: count, seed });
    const diffs: { md: string; want: string; got: string }[] = [];
    const skipped = new Map<string, number>();
    let compared = 0;
    for (const md of samples) {
      let result: ReturnType<Check['compare']>;
      try {
        result = check.compare(md);
      } catch (e) {
        result = { want: '', got: `threw ${(e as Error).stack}` };
      }
      if (typeof result === 'string') {
        skipped.set(result, (skipped.get(result) ?? 0) + 1);
        continue;
      }
      if (!result) continue;
      compared++;
      if (result.got !== result.want) diffs.push({ md, ...result });
    }
    failed += diffs.length;
    const extra = [...skipped].map(([why, n]) => `${n} skipped (${why})`).join(', ');
    console.log(`${check.name}, ${vocabulary}: ${compared - diffs.length}/${compared} agree${extra ? '; ' + extra : ''}`);
    for (const d of diffs.sort((a, b) => a.md.length - b.md.length).slice(0, show)) {
      console.log(`  md   ${JSON.stringify(d.md)}\n  want ${JSON.stringify(d.want)}\n  got  ${JSON.stringify(d.got)}`);
    }
  }
}
process.exit(failed ? 1 : 0);
