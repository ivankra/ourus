// Where a backslash is a markup escape: at the flavor's positions, read as an inline
// escape there. The positions are checked against the parser itself: escaped and unescaped, a line
// read mid-line renders alike, with a link definition its label could match in the document too.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { MdFlavor, MdTree } from '../../src/parser/index.ts';

const { commonmark, gfm, obsidian } = MdFlavor;

test('the positions: a line\'s first character, a number\'s delimiter, a label\'s colon, a delimiter row\'s first dash', () => {
  const at = (flavor: MdFlavor, line: string): boolean => flavor.markupEscapeAt(line, line.lastIndexOf('\\'));
  for (const line of ['\\- a', '\\+ a', '\\> a', '\\# a', '\\=== ', '  \\- a', '1\\. a', '12\\) a', '[a]\\: /url', '[a\\]b]\\: x']) assert.ok(at(commonmark, line), line);
  for (const line of ['a \\- b', '    \\- a', '\\* a', '\\<div>', '\\[a]: /url', '\\` x', 'x1\\. a', '[a]x\\: y']) assert.ok(!at(commonmark, line), line);
  // tables only where tables are read
  assert.ok(at(gfm, '|\\---|'));
  assert.ok(at(gfm, '\\--- | ---'));
  assert.ok(!at(gfm, '|-\\--|'), 'not the first dash');
  assert.ok(!at(commonmark, '|\\---|'));
  // Obsidian: `#` only where a tag can't start; `=` highlights
  assert.ok(at(obsidian, '\\# h'));
  assert.ok(at(obsidian, '\\#'));
  assert.ok(!at(obsidian, '\\#tag'));
  assert.ok(at(gfm, '\\#tag'));
  assert.ok(!at(obsidian, '\\=== '));
});

test('an inline escape is the parser\'s: not one in a code span, even across lines', () => {
  const tree = MdTree.parse('a \\- b\n`a\n\\- b`\n\nhttp\\://example.com', gfm);
  assert.ok(tree.inlineEscapeAt(tree.text.indexOf('\\-')));
  assert.ok(!tree.inlineEscapeAt(tree.text.indexOf('\\-', 8)), 'a code span crossing lines holds its backslash');
  // an escape before `:` is still one, inline: it stops a GFM autolink, so `:` is no markup escape mid-line
  assert.ok(tree.inlineEscapeAt(tree.text.indexOf('\\:')));
  assert.ok(!gfm.markupEscapeAt('http\\://example.com', 4));
});

/** A line of the vocabulary the positions are about, and somewhere a backslash could go. */
const arbLine = fc.tuple(
  fc.constantFrom('', ' ', '  '),
  fc.array(fc.constantFrom('-', '+', '#', '>', '=', '1', '12', '.', ')', '[a]', ':', '|', '---', ' ', 'x', 'tag', '*', '`'), { minLength: 1, maxLength: 6 }),
  fc.nat(),
);

for (const [name, flavor] of Object.entries({ commonmark, gfm, obsidian })) {
  test(`${name}: at every markup-escape position, a line reads alike escaped and unescaped, mid-line`, () => {
    let positions = 0;
    fc.assert(
      fc.property(arbLine, ([lead, parts, k]) => {
        const plain = lead + parts.join('');
        const at = lead.length + (k % Math.max(1, plain.length - lead.length));
        const escaped = plain.slice(0, at) + '\\' + plain.slice(at);
        if (!flavor.markupEscapeAt(escaped, at)) return;
        positions++;
        // mid-line, after text, with a definition the label could match
        const render = (line: string): string => MdTree.parse(`x ${line}\n\n[a]: /target\n`, flavor).renderHtml();
        assert.equal(render(escaped), render(plain), JSON.stringify(escaped));
      }),
      { numRuns: 10000 },
    );
    assert.ok(positions > 700, `only ${positions} runs at a position`);
  });
}
