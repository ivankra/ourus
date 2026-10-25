// How lines read back where a node's text goes (`firstNonParagraph`), and the escapes that keep them its text.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MdFlavor, type MdParagraphPlace } from '../../src/parser/index.ts';

test('the first line that does not stay text, by context', () => {
  const { commonmark: cm, gfm, obsidian } = MdFlavor;
  assert.equal(cm.firstNonParagraph(['a', 'b']), -1);
  assert.equal(cm.firstNonParagraph(['- a']), 0);
  assert.equal(cm.firstNonParagraph(['a', '- b']), 1);
  assert.equal(cm.firstNonParagraph(['a', '2. b']), -1, 'an ordered list from 2 does not interrupt a paragraph');
  assert.equal(cm.firstNonParagraph(['2. b'], 'continuation'), -1);
  assert.equal(cm.firstNonParagraph(['1. b'], 'continuation'), 0);
  assert.equal(cm.firstNonParagraph(['a', '==='], 'start'), 1, 'a setext underline');
  assert.equal(cm.firstNonParagraph(['==='], 'continuation'), 0);
  assert.equal(cm.firstNonParagraph(['', 'a', '===']), 0, 'a blank first line, before a setext heading');
  assert.equal(gfm.firstNonParagraph(['--|--'], 'continuation'), -1, 'one column above: no table');
  assert.equal(gfm.firstNonParagraph(['--|--'], 'continuation', 'a | b'), 0, 'two columns above: a table');
  assert.equal(gfm.firstNonParagraph(['--|--', 'c'], 'continuation', 'a | b'), 0);
  assert.equal(cm.firstNonParagraph(['[a]: /u']), 0, 'a link reference definition');
  assert.equal(cm.firstNonParagraph(['[a]:', '/u']), 0);
  assert.equal(cm.firstNonParagraph(['', '  ']), -1, 'blank lines are an empty text');
  assert.equal(gfm.firstNonParagraph(['| a |', '| - |']), 0, 'a table');
  assert.equal(cm.firstNonParagraph(['| a |', '| - |']), -1);
  assert.equal(obsidian.firstNonParagraph(['$$']), 0);
  assert.equal(cm.firstNonParagraph(['$$']), -1);
  assert.equal(obsidian.firstNonParagraph(['[!tip] a'], 'quoteStart'), 0, 'a callout');
  assert.equal(gfm.firstNonParagraph(['[!tip] a'], 'quoteStart'), -1);
  assert.equal(cm.firstNonParagraph(['a', '> b'], 'quoteStart'), 1, 'inside the quote, a `>` opens a quote in it');
});

/** The lines as `escapeParagraph` spells them, markup escapes written in, `!` before a backslash the text gained. */
function written(flavor: MdFlavor, lines: string[], place: MdParagraphPlace = {}): string[] | null {
  const spelled = flavor.escapeParagraph(lines, place);
  if (!spelled) return null;
  return spelled.lines.map((l, k) => {
    // in the spelled line: a markup escape where it goes, a gained backslash after the ones before it
    const gained = spelled.gained.filter((e) => e.line === k).map((e, j) => ({ at: e.at + j, insert: '!' }));
    const markup = spelled.markup.filter((e) => e.line === k).map((e) => ({ at: e.at, insert: '\\' }));
    let out = l;
    for (const { at, insert } of [...gained, ...markup].sort((a, b) => b.at - a.at)) out = out.slice(0, at) + insert + out.slice(at);
    return out;
  });
}

test('lines that stay a paragraph need nothing', () => {
  const { gfm } = MdFlavor;
  assert.deepEqual(written(gfm, ['hello', 'world']), ['hello', 'world']);
  assert.deepEqual(written(gfm, ['a', '2. b']), ['a', '2. b'], 'a list from 2 can\'t interrupt a paragraph');
});

test('a markup escape where one keeps the line, at its first character, a number\'s delimiter, a label\'s colon', () => {
  const { gfm } = MdFlavor;
  assert.deepEqual(written(gfm, ['- not a list']), ['\\- not a list']);
  assert.deepEqual(written(gfm, ['2. x']), ['2\\. x']);
  assert.deepEqual(written(gfm, ['a', '- b']), ['a', '\\- b']);
  assert.deepEqual(written(gfm, ['a', '===']), ['a', '\\===']);
  assert.deepEqual(written(gfm, ['[Note]: this']), ['[Note]\\: this'], 'the label stays a link where it is defined');
  assert.deepEqual(written(gfm, ['# b']), ['\\# b']);
  assert.deepEqual(written(gfm, ['- b'], { context: 'continuation', above: 'a' }), ['\\- b']);
});

test('a table\'s delimiter row is escaped, not the header it would make', () => {
  assert.deepEqual(written(MdFlavor.gfm, ['| a |', '|---|']), ['| a |', '|\\---|']);
  assert.deepEqual(written(MdFlavor.commonmark, ['| a |', '|---|']), ['| a |', '|---|'], 'no tables in CommonMark');
});

test('where no markup escape keeps a line, the text gains a backslash', () => {
  const { gfm, obsidian } = MdFlavor;
  assert.deepEqual(written(gfm, ['<div>']), ['!\\<div>']);
  assert.deepEqual(written(gfm, ['```']), ['!\\```']);
  assert.deepEqual(written(obsidian, ['[!tip] x'], { context: 'quoteStart' }), ['!\\[!tip] x'], 'a quote\'s first line in Obsidian, a callout');
  assert.deepEqual(written(gfm, ['[!tip] x'], { context: 'quoteStart' }), ['[!tip] x'], 'in GFM, text');
});

test('the lines below can change the last line: a definition across them', () => {
  const { gfm } = MdFlavor;
  assert.deepEqual(written(gfm, ['[a]:'], { below: ['/url'] }), ['[a]\\:']);
  assert.deepEqual(written(gfm, ['[a]:']), ['[a]:'], 'alone, no definition');
});

test('markup escapes are judged as written: needed, at a position, an inline escape there', () => {
  const { gfm } = MdFlavor;
  assert.deepEqual(gfm.markupEscapes(['\\- not a list']), [{ line: 0, at: 0 }]);
  assert.deepEqual(gfm.markupEscapes(['revise 2\\. draft']), [], 'mid-line, at no position: text');
  assert.deepEqual(gfm.markupEscapes(['a', '2\\. b']), [], 'a list from 2 can\'t interrupt a paragraph: not needed, text');
  assert.deepEqual(gfm.markupEscapes(['`a', '\\- b`']), [], 'in a code span: literal');
  assert.deepEqual(gfm.markupEscapes(['2\\. a', '3\\. b']), [{ line: 0, at: 1 }], 'each line judged with the others as written: the second needs nothing under a paragraph');
});

test('a text\'s backslashes that are markup where it goes are absorbed, then placed as markup', () => {
  const spelled = MdFlavor.gfm.escapeParagraph(['2\\. a', '3\\. b'])!;
  assert.deepEqual(spelled.absorbed, [{ line: 0, at: 1 }]);
  assert.deepEqual(spelled.lines, ['2. a', '3\\. b'], 'the second line\'s backslash is its text');
  assert.deepEqual(spelled.markup, [{ line: 0, at: 1 }]);
});
