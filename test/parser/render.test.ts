// The HTML the extensions write, where it meets the core's: alt text, footnotes in and out of
// links, footnote numbering and ids.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MdFlavor, MdTree } from '../../src/index.ts';

const gfm = (md: string): string => MdTree.parse(md, MdFlavor.gfm).renderHtml();
const obsidian = (md: string): string => MdTree.parse(md, MdFlavor.obsidian).renderHtml();

test("an image's alt text is the text of the extensions' inlines in it, no markup", () => {
  assert.match(gfm('![a[^n]](x)\n\n[^n]: note'), /<img src="x" alt="a" \/>/);
  assert.equal(obsidian('![[[Page]]](x) ![a #t $x$ b^[n]](y)'), '<p><img src="x" alt="Page" /> <img src="y" alt="a #t x bn" /></p>\n');
});

test('a footnote definition nested in another is written once, as its own, the outer one\'s backreference in its own paragraph', () => {
  const out = gfm('x[^a] [^b]\n\n[^a]: A\n    [^b]: B');
  assert.equal(out.match(/id="fn-b"/g)?.length, 1);
  assert.match(out, /<li id="fn-a">\n<p>A <a href="#fnref-a"[^>]*>↩<\/a><\/p>\n<\/li>\n<li id="fn-b">/);
});

test("a table's header row after a paragraph is read past its line's blanks, as cmark-gfm reads a paragraph's lines", () => {
  assert.match(gfm('para\n  |a|b|\n  |-|-|'), /^<p>para<\/p>\n<table>/);
  assert.match(gfm('x\n |a|\n |-|'), /^<p>x<\/p>\n<table>/);
});
