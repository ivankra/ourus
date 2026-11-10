// Block structure against commonmark.js 0.31.2 (a dev dependency): block types, nesting, line ranges
// and list tightness, on the spec's examples and on generated documents (see test/oracle.ts for what
// is compared and the differences normalized away).

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import fc from 'fast-check';
import { MdTree } from '../../src/parser/syntax.ts';
import { MdFlavor } from '../../src/index.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { arbDoc, TIDY, WILD } from './arbitraries.ts';
import { ourusSkeleton, refdefLines, referenceSkeleton } from './oracle.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

const spec: { markdown: string; example: number; section: string }[] = JSON.parse(readFileSync(new URL('../fixtures/commonmark-spec-0.31.2.json', import.meta.url), 'utf8'));

const agree = (md: string): void => {
  const root = MdTree.parse(md).root;
  assert.equal(ourusSkeleton(root), referenceSkeleton(md, refdefLines(root)), JSON.stringify(md));
};

test('block structure agrees with commonmark.js on every CommonMark 0.31.2 spec example', () => {
  const failures: string[] = [];
  for (const ex of spec) {
    const root = MdTree.parse(ex.markdown).root;
    const want = referenceSkeleton(ex.markdown, refdefLines(root));
    const got = ourusSkeleton(root);
    if (got !== want) failures.push(`#${ex.example} (${ex.section}) ${JSON.stringify(ex.markdown)}\n  want ${want}\n  got  ${got}`);
  }
  assert.equal(failures.length, 0, `${failures.length} of ${spec.length} differ:\n${failures.slice(0, 15).join('\n')}`);
});

test('block structure agrees with commonmark.js on wild documents', () => {
  fc.assert(fc.property(arbDoc(WILD, { endings: ['\n', '\r\n'] }), agree), { numRuns: RUNS });
});

test('block structure agrees with commonmark.js on tidy documents', () => {
  fc.assert(fc.property(arbDoc(TIDY, { maxLines: 20 }), agree), { numRuns: RUNS });
});

test('an ordered list interrupts a paragraph when it starts at 1, however the 1 is written', () => {
  for (const md of ['a\n1. b\n', 'a\n01. b\n', 'a\n2. b\n', 'a\n1) b\n']) agree(md);
});

test('prefix pieces of a nested list inside a quote', () => {
  const md = '> - a\n>   - b\n>\n>   c\n';
  const syntax = MdTree.parse(md);
  const kinds = syntax.lines.map((l) => l.prefix.map((p) => `${p.container.block.type}:${p.kind}:${JSON.stringify(md.slice(p.from, p.to))}`).join(' '));
  assert.deepEqual(kinds, [
    'blockquote:quote:"> " item:marker:"- "',
    'blockquote:quote:"> " item:indent:"  " item:marker:"- "',
    'blockquote:quote:">" item:indent:"" item:indent:""',
    'blockquote:quote:"> " item:indent:"  "',
  ]);
  assert.equal(syntax.lines[3]!.leaf?.block.type, 'paragraph');
});

test("text right after a task's checkbox is no link reference definition (GFM: cmark-gfm reads the checkbox after the blocks, as micromark does)", () => {
  assert.equal(MdTree.parse('- [ ] [r]: /u\n', gfm).renderHtml(), '<ul>\n<li><input type="checkbox" disabled="" /> [r]: /u</li>\n</ul>\n');
  // a definition starting a later paragraph of the item is one
  assert.equal(MdTree.parse('- [ ] x\n\n  [r]: /u\n', gfm).root.children[0]!.children[0]!.children.map((b) => b.type).join(' '), 'paragraph refdef');
});

test("a position's code span and escape are found in a table's cells too", () => {
  const s = 'p\n\n| a | b |\n|---|---|\n| `x` | \\* |';
  const t = MdTree.parse(s, gfm);
  assert.deepEqual(t.codeSpanAt(s.indexOf('x')), { closer: s.indexOf('x') + 1, to: s.indexOf('x') + 2 });
  assert.equal(t.inlineEscapeAt(s.indexOf('\\')), true);
});

test("an extension's `remove` takes the rules of the extensions before it, not a later one's of that name", async () => {
  const { defineFlavor } = await import('../../src/parser/extend.ts');
  let called = 0;
  const flavor = defineFlavor('replacement', [
    { name: 'remove-old', remove: ['atxHeading'] },
    { name: 'new', blockStarts: [{ name: 'atxHeading', start: () => (called++, 0) }] },
  ]);
  assert.equal(flavor.blockStarts.filter((s) => s.name === 'atxHeading').length, 1);
  MdTree.parse('# a', flavor);
  assert.ok(called > 0);
  assert.equal(MdTree.parse('# a', defineFlavor('without', [{ name: 'remove-old', remove: ['atxHeading'] }])).root.children[0]!.type, 'paragraph');
});

test('a byte-order mark opening a document is before line 0, in every flavor: no character of the Markdown, kept in the text; a fragment\'s is text', async () => {
  const { FLAVORS } = await import('./flavors.ts');
  for (const [name, flavor] of Object.entries(FLAVORS)) {
    const kinds = (text: string): string[] => MdTree.parse(text, flavor, { document: true }).root.children.map((b) => b.type);
    assert.deepEqual(kinds('\ufeff# Title\n'), ['heading'], name);
    assert.deepEqual(kinds('\ufeff- a\n'), ['list'], name);
    assert.deepEqual(kinds('\ufeff    code\n'), ['code_block'], name);
    const tree = MdTree.parse('\ufeff# T\n\nx\n', flavor, { document: true });
    assert.equal(tree.documentStart, 1);
    assert.deepEqual([tree.line(0).from, tree.line(0).to], [1, 4]);
    assert.match(tree.renderHtml(), /^<h1>T<\/h1>/);
    // (alone on its line, that line is blank; anywhere else, it is text)
    assert.ok(MdTree.parse('\ufeff\n# T\n', flavor, { document: true }).line(0).blank);
    assert.deepEqual(kinds('x\n\n\ufeff# T\n'), ['paragraph', 'paragraph'], name);
    assert.equal(MdTree.parse('# T\n', flavor, { document: true }).documentStart, 0);
    // (an update keeps it a document's)
    assert.equal(MdTree.parse('# T\n', flavor, { document: true }).update([{ from: 0, to: 0, insert: '\ufeff' }]).documentStart, 1);
    // (a fragment, a block's text or a clipboard's: the mark is text)
    const fragment = MdTree.parse('\ufeff# T\n', flavor);
    assert.deepEqual([fragment.documentStart, fragment.root.children[0]!.type], [0, 'paragraph']);
  }
  const obsidian = FLAVORS.obsidian!;
  assert.deepEqual(MdTree.parse('\ufeff---\na: 1\n---\n\nx', obsidian, { document: true }).root.children.map((b) => b.type), ['frontmatter', 'paragraph']);
});

test('ourus/extend exports the inline node a rule gives the parser, as MdInlineNode', async () => {
  const extend = await import('../../src/parser/extend.ts');
  const node = new extend.MdInlineNode('text', 0, 1);
  assert.deepEqual([node.type, node.from, node.to], ['text', 0, 1]);
});

test('an extension\'s inline named like an object\'s property renders as its text; a rule for one emoji runs at it only', async () => {
  const { defineFlavor, MdInlineNode } = await import('../../src/parser/extend.ts');
  const names = defineFlavor('names', [{
    name: 'names',
    inlines: [{ name: 'names', triggers: '@', parse(parser) {
      const from = parser.pos++;
      parser.add(new MdInlineNode('toString', from, parser.pos));
      return true;
    } }],
  }]);
  assert.equal(MdTree.parse('@', names).renderHtml(), '<p>@</p>\n');
  const seen: string[] = [];
  const emoji = defineFlavor('emoji', [{
    name: 'emoji',
    inlines: [{ name: 'smile', triggers: '😀', parse(p) {
      seen.push(p.text.slice(p.pos, p.pos + 2));
      return false;
    } }],
  }]);
  // (😁 shares 😀's high surrogate)
  assert.equal(MdTree.parse('😀 😁', emoji).renderHtml(), '<p>😀 😁</p>\n');
  assert.deepEqual(seen, ['😀']);
});

test('extensions\' render hooks compose, in order: one\'s start doesn\'t replace GFM\'s footnotes\'', async () => {
  const { defineFlavor, gfmExtensions } = await import('../../src/parser/extend.ts');
  const order: string[] = [];
  const flavor = defineFlavor('custom', [...gfmExtensions, { name: 'custom', render: { start(r) { r.state.set('custom', true); order.push('start'); }, end() { order.push('end'); } } }]);
  const html = MdTree.parse('x[^a]\n\n[^a]: n', flavor).renderHtml();
  assert.match(html, /<sup class="footnote-ref"><a href="#fn-a"/);
  assert.match(html, /<section class="footnotes" data-footnotes>/);
  assert.deepEqual(order, ['start', 'end']);
  // (filtered tags joined, not replaced)
  const tags = defineFlavor('tags', [...gfmExtensions, { name: 'tags', render: { filteredTags: ['marquee'] } }]);
  assert.equal(MdTree.parse('<marquee>a</marquee> <iframe>', tags).renderHtml(), '<p>&lt;marquee>a&lt;/marquee> &lt;iframe></p>\n');
});

test('spaces or tabs separate a link\'s parts: before its destination, its title, a reference\'s destination', () => {
  assert.equal(MdTree.parse('[x](\t/u)').renderHtml(), '<p><a href="/u">x</a></p>\n');
  assert.equal(MdTree.parse('[x](/u\t"t")').renderHtml(), '<p><a href="/u" title="t">x</a></p>\n');
  const ref = MdTree.parse('[a]:\t/u\n\n[a]');
  assert.equal(ref.references.size, 1);
  assert.equal(ref.renderHtml(), '<p><a href="/u">a</a></p>\n');
});

test('each text rule runs over the text the rules before it left: one after GFM\'s email sees what follows each email', async () => {
  const { defineFlavor, gfmExtensions } = await import('../../src/parser/extend.ts');
  const seen: string[] = [];
  const flavor = defineFlavor('tail', [...gfmExtensions, { name: 'tail', textRules: [{ name: 'tail', matches(text) { seen.push(text); return []; } }] }]);
  assert.equal(MdTree.parse('a@b.co TAIL and x@y.io end', flavor).renderHtml(), '<p><a href="mailto:a@b.co">a@b.co</a> TAIL and <a href="mailto:x@y.io">x@y.io</a> end</p>\n');
  assert.deepEqual(seen, [' TAIL and ', ' end']);
});

test('GFM email autolinks match over the decoded text, as cmark-gfm does: an escape or an entity in one is part of it (B251)', () => {
  assert.equal(MdTree.parse('a\\+b@example.com', MdFlavor.gfm).renderHtml(), '<p><a href="mailto:a+b@example.com">a+b@example.com</a></p>\n');
  assert.equal(MdTree.parse('x a&#43;b@example.com y', MdFlavor.gfm).renderHtml(), '<p>x <a href="mailto:a+b@example.com">a+b@example.com</a> y</p>\n');
  assert.equal(MdTree.parse('a\\@example.com', MdFlavor.gfm).renderHtml(), '<p><a href="mailto:a@example.com">a@example.com</a></p>\n');
  // (the escape still read as one, in the link: its backslash markup)
  const tree = MdTree.parse('a\\+b@example.com', MdFlavor.gfm);
  assert.ok(tree.inlineEscapeAt(1));
});
