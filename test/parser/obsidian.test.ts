// Obsidian's syntax, by example: Obsidian has no spec, so these pin what obsidian.ts reads (as
// Obsidian's help documents it), as HTML and, where the tree is the point, as blocks and inlines.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { obsidian } from '../../src/parser/obsidian.ts';
import { MdTree } from '../../src/parser/syntax.ts';

import type { MdBlockAt, MdInline } from '../../src/parser/types.ts';

const html = (md: string): string => MdTree.parse(md, obsidian).renderHtml();
const blocks = (md: string): string[] => MdTree.parse(md, obsidian).root.children.map((b) => b.type);

/** The leaf's inlines as `type` (text nodes as their text), nested in brackets. */
function inlines(md: string, leaf = 0): string {
  const syntax = MdTree.parse(md, obsidian);
  let b: MdBlockAt = syntax.rootAt;
  while (!syntax.inlineText(b) && b.block.children.length) b = b.child(b.block.children[leaf] ? leaf : 0);
  const text = syntax.inlineText(b)!.text;
  const show = (ns: readonly MdInline[]): string =>
    ns.map((n) => (n.type === 'text' ? JSON.stringify(text.slice(n.from, n.to)) : n.children ? `${n.type}[${show(n.children)}]` : n.type)).join(' ');
  return show(syntax.inlines(b));
}

const cases: [string, string, string][] = [
  // frontmatter
  ['frontmatter is a block of its own', '---\ntitle: x\ntags: [a]\n---\n# H\n', '<h1>H</h1>\n'],
  ['frontmatter needs its closing fence', '---\ntitle: x\n', '<hr />\n<p>title: x</p>\n'],
  ['frontmatter only on the first line', 'a\n\n---\nb: 1\n---\n', '<p>a</p>\n<hr />\n<h2>b: 1</h2>\n'],
  ['empty frontmatter', '---\n---\ntext\n', '<p>text</p>\n'],
  // callouts
  ['a callout', '> [!note] Title\n> Body\n', '<div class="callout" data-callout="note">\n<div class="callout-title">Title</div>\n<div class="callout-content">\n<p>Body</p>\n</div>\n</div>\n'],
  ['a callout without a title gets its type', '> [!warning]\n> Careful\n', '<div class="callout" data-callout="warning">\n<div class="callout-title">Warning</div>\n<div class="callout-content">\n<p>Careful</p>\n</div>\n</div>\n'],
  ['a folded callout with only a title', '> [!faq]- Why *this*?\n', '<div class="callout" data-callout="faq" data-callout-fold="-">\n<div class="callout-title">Why <em>this</em>?</div>\n</div>\n'],
  ['a callout title is one line: the next is body', '> [!tip] T\n> ---\n', '<div class="callout" data-callout="tip">\n<div class="callout-title">T</div>\n<div class="callout-content">\n<hr />\n</div>\n</div>\n'],
  ['callouts nest', '> [!a] A\n> > [!b] B\n> > x\n', '<div class="callout" data-callout="a">\n<div class="callout-title">A</div>\n<div class="callout-content">\n<div class="callout" data-callout="b">\n<div class="callout-title">B</div>\n<div class="callout-content">\n<p>x</p>\n</div>\n</div>\n</div>\n</div>\n'],
  ['not a callout after the first line', '> text\n> [!note] x\n', '<blockquote>\n<p>text\n[!note] x</p>\n</blockquote>\n'],
  // math and comment blocks
  ['a math block', '$$\na^2 + b^2\n$$\n', '<div class="math math-block">a^2 + b^2</div>\n'],
  ['a math block on one line', '$$x$$\n', '<div class="math math-block">x</div>\n'],
  ['display math followed by text is inline', '$$x$$ y\n', '<p><span class="math math-display">x</span> y</p>\n'],
  ['a comment block is hidden', 'a\n\n%%\nhidden\n\nstill\n%%\nb\n', '<p>a</p>\n<p>b</p>\n'],
  ['an unclosed math block runs to its container\'s end', '> $$\n> x\n\ny\n', '<blockquote>\n<div class="math math-block">x</div>\n</blockquote>\n<p>y</p>\n'],
  // inlines
  ['wikilinks and embeds', '[[Page]] [[Page#H|alias]] ![[img.png]]\n', '<p><a data-href="Page" href="Page" class="internal-link">Page</a> <a data-href="Page#H" href="Page#H" class="internal-link">alias</a> <span class="internal-embed" src="img.png"></span></p>\n'],
  ['a wikilink is literal inside', '[[a *b* `c`]]\n', '<p><a data-href="a *b* `c`" href="a *b* `c`" class="internal-link">a *b* `c`</a></p>\n'],
  ['an empty wikilink is text', '[[]] [[ ]]\n', '<p>[[]] [[ ]]</p>\n'],
  ['tags', '#tag #nested/tag #a-b_c #123 x#no\n', '<p><a href="#tag" class="tag">#tag</a> <a href="#nested/tag" class="tag">#nested/tag</a> <a href="#a-b_c" class="tag">#a-b_c</a> #123 x#no</p>\n'],
  ['highlights', '==hi== ===no=== =x=\n', '<p><mark>hi</mark> ===no=== =x=</p>\n'],
  ['strikethrough needs two tildes', '~~yes~~ ~no~\n', '<p><del>yes</del> ~no~</p>\n'],
  ['inline math', '$x^2$ $ no$ $5 and $6\n', '<p><span class="math math-inline">x^2</span> $ no$ $5 and $6</p>\n'],
  ['inline comments are hidden', 'a %%hidden%% b\n', '<p>a  b</p>\n'],
  ['a block id is hidden', 'Some text ^abc-1\n', '<p>Some text </p>\n'],
  ['a block id only at the end', 'a ^id b\n', '<p>a ^id b</p>\n'],
  ['inline footnotes', 'x^[note *here*] y\n', '<p>x<sup class="footnote-inline">note <em>here</em></sup> y</p>\n'],
  ['footnotes', 'a[^1]\n\n[^1]: Note.\n', '<p>a<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup></p>\n<section class="footnotes" data-footnotes>\n<ol>\n<li id="fn-1">\n<p>Note. <a href="#fnref-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>\n</li>\n</ol>\n</section>\n'],
  // GFM, as Obsidian reads it
  ['task statuses', '- [ ] a\n- [x] b\n- [?] c\n- [-] d\n', '<ul>\n<li><input type="checkbox" disabled="" /> a</li>\n<li><input type="checkbox" checked="" disabled="" /> b</li>\n<li><input type="checkbox" checked="" disabled="" /> c</li>\n<li><input type="checkbox" checked="" disabled="" /> d</li>\n</ul>\n'],
  ['a table row needs a pipe', '| a |\n| - |\n| b |\nc\n', '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>\n<p>c</p>\n'],
  ['autolinks', 'see https://obsidian.md\n', '<p>see <a href="https://obsidian.md">https://obsidian.md</a></p>\n'],
];

for (const [name, md, want] of cases) test(`obsidian: ${name}`, () => assert.equal(html(md), want));

test('obsidian: the tree of a note', () => {
  const md = '---\na: 1\n---\n> [!note]+ T\n> - [?] x ^b1\n';
  const syntax = MdTree.parse(md, obsidian);
  assert.deepEqual(blocks(md), ['frontmatter', 'blockquote']);
  const quote = syntax.root.children[1]!;
  assert.deepEqual(quote.attrs.callout, { kind: 'note', fold: '+' });
  assert.deepEqual(quote.children.map((c) => c.type), ['callout_title', 'list']);
  const item = quote.children[1]!.children[0]!;
  const lineStart = md.lastIndexOf('\n', md.indexOf('[?]')) + 1;
  assert.deepEqual(item.attrs.task, { checked: true, status: '?', start: md.indexOf('[?]') - lineStart, end: md.indexOf('[?]') + 3 - lineStart });
  assert.equal(inlines('- [?] x ^b1\n'), '"x " block_id');
  assert.equal(syntax.lines[0]!.leaf!.block.type, 'frontmatter');
  assert.equal(syntax.lines[2]!.leaf!.block.type, 'frontmatter');
});

test('obsidian: wikilink parts', () => {
  const syntax = MdTree.parse('[[Note#Heading^block|Shown]]', obsidian);
  const [link] = syntax.inlines(syntax.rootAt.child(0));
  assert.equal(link!.type, 'wikilink');
  assert.equal(link!.target, 'Note#Heading^block');
  assert.equal(link!.alias, 'Shown');
});
