// Pathological inputs: nothing recurses as deep as the input nests. The cases are cmark's
// (test/pathological_tests.py), plus an edit whose effect runs far.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { commonmark, type MdFlavor } from '../../src/parser/flavor.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { obsidian } from '../../src/parser/obsidian.ts';
import { MdTree } from '../../src/parser/syntax.ts';

const r = (s: string, n: number): string => s.repeat(n);
const p = (s: string): string => `<p>${s}</p>\n`;

/** Name, input, the HTML expected (or a check of its start, for long outputs not worth spelling out), flavor. */
const cases: [string, string, string | ((html: string) => boolean), MdFlavor?][] = [
  [
    'nested strong emph',
    r('*a **a ', 65000) + 'b' + r(' a** a*', 65000),
    p(r('<em>a <strong>a ', 65000) + 'b' + r(' a</strong> a</em>', 65000)),
  ],
  ['many emph closers with no openers', r('a_ ', 65000), p(r('a_ ', 64999) + 'a_')],
  ['many emph openers with no closers', r('_a ', 65000), p(r('_a ', 64999) + '_a')],
  ['many link closers with no openers', r('a]', 65000), p(r('a]', 65000))],
  ['many link openers with no closers', r('[a', 65000), p(r('[a', 65000))],
  ['mismatched openers and closers', r('*a_ ', 50000), p(r('*a_ ', 49999) + '*a_')],
  ['openers and closers multiple of 3', 'a**b' + r('c* ', 50000), p('a**b' + r('c* ', 49999) + 'c*')],
  ['link openers and emph closers', r('[ a_', 50000), p(r('[ a_', 50000))],
  ['pattern [ (]( repeated', r('[ (](', 80000), p(r('[ (](', 80000))],
  ['pattern ![[]() repeated', r('![[]()', 160000), p(r('![<a href=""></a>', 160000))],
  ['nested brackets', r('[', 50000) + 'a' + r(']', 50000), p(r('[', 50000) + 'a' + r(']', 50000))],
  ['nested block quotes', r('> ', 50000) + 'a', r('<blockquote>\n', 50000) + p('a') + r('</blockquote>\n', 50000)],
  [
    'deeply nested lists',
    Array.from({ length: 1000 }, (_, x) => r('  ', x) + '* a\n').join(''),
    '<ul>\n' + r('<li>a\n<ul>\n', 999) + '<li>a</li>\n</ul>\n' + r('</li>\n</ul>\n', 999),
  ],
  [
    'backticks',
    Array.from({ length: 4999 }, (_, x) => 'e' + r('`', x + 1)).join(''),
    (html) => /^<p>[e`]*<\/p>\n$/.test(html),
  ],
  ['unclosed links A', r('[a](<b', 30000), p(r('[a](&lt;b', 30000))],
  ['unclosed links B', r('[a](b', 30000), p(r('[a](b', 30000))],
  ['unclosed <!--', '</' + r('<!--', 300000), p('&lt;/' + r('&lt;!--', 300000))],
  [
    'many references',
    Array.from({ length: 80000 }, (_, x) => `[${x + 1}]: u\n`).join('') + r('[0] ', 5000),
    p(r('[0] ', 4999) + '[0]'),
  ],
  [
    'tables',
    r('aaa\rbbb\n-\v\n', 30000),
    p('aaa') +
      '<table>\n<thead>\n<tr>\n<th>bbb</th>\n</tr>\n</thead>\n<tbody>\n' +
      r('<tr>\n<td>aaa</td>\n</tr>\n<tr>\n<td>bbb</td>\n</tr>\n<tr>\n<td>-\v</td>\n</tr>\n', 29999) +
      '</tbody>\n</table>\n',
    gfm,
  ],
  [
    'nested inline footnotes and wikilinks',
    r('^[', 40000) + '[[a]]' + r(']', 40000),
    p(
      r('<sup class="footnote-inline">', 40000) +
        '<a data-href="a" href="a" class="internal-link">a</a>' +
        r('</sup>', 40000),
    ),
    obsidian,
  ],
  ['many dollar signs', r('$a ', 50000), p(r('$a ', 49999) + '$a'), obsidian],
  ['many wikilink openers', r('[[a ', 50000), p(r('[[a ', 49999) + '[[a'), obsidian],
];

for (const [name, input, expected, flavor] of cases) {
  test(`pathological: ${name}`, () => {
    const html = MdTree.parse(input, flavor ?? commonmark).renderHtml();
    if (typeof expected === 'string')
      assert.ok(html === expected, `${name}: unexpected output ${JSON.stringify(html.slice(0, 200))}`);
    else assert.ok(expected(html), `${name}: unexpected output ${JSON.stringify(html.slice(0, 200))}`);
  });
}

test('pathological: an edit at the top of a long document that changes all of it', () => {
  const lines = Array.from({ length: 50000 }, (_, i) => `line ${i} *with* text`);
  const text = lines.join('\n') + '\n';
  const syntax = MdTree.parse(text, gfm);
  const fenced = syntax.update([{ from: 0, to: 0, insert: '```\n' }]);
  assert.equal(fenced.root.children[0]!.type, 'code_block');
  const back = fenced.update([{ from: 0, to: 4, insert: '' }]);
  assert.equal(back.root.children[0]!.type, 'paragraph');
});

test('inline position queries answer inside images nested 6,000 deep, as parsing and rendering do', () => {
  const depth = 6000;
  const tree = MdTree.parse('!['.repeat(depth) + '`x`' + '](u)'.repeat(depth), commonmark);
  assert.deepEqual(tree.codeSpanAt(depth * 2 + 1), { closer: depth * 2 + 2, to: depth * 2 + 3 });
  assert.equal(tree.verbatimSpanAt(depth * 2 + 1), true);
  assert.equal(
    MdTree.parse('!['.repeat(depth) + '\\*' + '](u)'.repeat(depth), commonmark).inlineEscapeAt(depth * 2),
    true,
  );
});
