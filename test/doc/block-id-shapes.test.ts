// Block ids read over the shapes obsidian-true-outliner measured in Obsidian 1.13.7, by reading
// `CachedMetadata.blocks` (its `docs/research/lone-block-id.md`, `tests/block-id-shapes.ts`): each
// block id's owner, what it names, whether another for the same target counts instead, and, for a
// stray one, why what it names is no node it is on (`dev/24-block-ids.md` §2.1, §4.4, §4.5). Read with
// TO's settings (`quotes: atom`, `listParent: block`).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc } from '../../src/doc/index.ts';
import { readBlockIdsRow } from './block-id-rows.ts';

const SHAPES: readonly (readonly [string, string, readonly string[]])[] = [
  ["paragraph, blank, id", "Intro.\n\nSome prose.\n\n^p3\n\nOutro.\n", ["^p3 paragraph@2 → paragraph@2"]],
  ["table, blank, id", "Intro.\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\n^t1\n\nOutro.\n", ["^t1 atom@2 → atom@2"]],
  ["table, id directly under", "Intro.\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n^t2\n\nOutro.\n", ["^t2 atom@2 → atom@2"]],
  ["quote, id directly under", "Intro.\n\n> quoted\n^q2\n\nOutro.\n", ["^q2 atom@2 → atom@2"]],
  ["callout, blank, id", "Intro.\n\n> [!note] Title\n> body\n\n^c1\n\nOutro.\n", ["^c1 atom@2 → atom@2"]],
  ["callout, id directly under", "> [!note] Title\n> body\n^c2\n\nAfter.\n", ["^c2 atom@0 → atom@0"]],
  ["fence, blank, id", "Intro.\n\n```\ncode\n```\n\n^code1\n\nOutro.\n", ["^code1 atom@2 → atom@2"]],
  ["fence, id directly under", "```\ncode\n```\n^code2\n\nAfter.\n", ["^code2 atom@0 → atom@0"]],
  ["heading, blank, id", "## Head\n\n^h2\n\nbody\n", ["^h2 heading@0 → heading@0"]],
  ["heading, id directly under", "## Head\n^h3\n\nAfter.\n", ["^h3 heading@0 → heading@0"]],
  ["hr, blank, id", "Before.\n\n***\n\n^hr1\n\nAfter.\n", ["^hr1 atom@2 → atom@2"]],
  ["html, blank, id", "<div>html</div>\n\n^html1\n\nAfter.\n", ["^html1 atom@0 → atom@0"]],
  ["table, two blank lines, id", "| a | b |\n| --- | --- |\n| 1 | 2 |\n\n\n^t3\n\nAfter.\n", ["^t3 atom@0 → atom@0"]],
  ["paragraph, two blank lines, id", "Prose.\n\n\n^p4\n\nAfter.\n", ["^p4 paragraph@0 → paragraph@0"]],
  ["table under a heading, blank, id", "## Head\n\n| x | y |\n| --- | --- |\n| 1 | 2 |\n\n^t6\n\nAfter.\n", ["^t6 atom@2 → atom@2"]],
  ["table, id with trailing spaces", "| a | b |\n| --- | --- |\n| 1 | 2 |\n\n^t4   \n\nAfter.\n", ["^t4 paragraph@4 → - stray:trailing-space"]],
  ["table, blank, id, text directly under", "| a | b |\n| --- | --- |\n| 1 | 2 |\n\n^t5\nMore text.\n", []],
  ["paragraph, blank, id, blank, id", "Prose.\n\n^y1\n\n^y2\n\nAfter.\n", ["^y1 paragraph@0 → paragraph@0 shadowed","^y2 paragraph@0 → paragraph@0"]],
  ["quote, lazy id, blank, id", "> q\n^n5\n\n^n6\n", ["^n5 atom@0 → atom@0 shadowed","^n6 atom@0 → atom@0"]],
  ["heading, id directly under, blank, id", "## H\n^n9\n\n^n10\n", ["^n9 heading@0 → heading@0 shadowed","^n10 heading@0 → heading@0"]],
  ["item, blank, indented id, blank, id at column 0", "- a\n\n  ^n1\n\n^n2\n", ["^n1 item@0 → item@0","^n2 paragraph@4 → list@0 stray:whole-list"]],
  ["item, lazy id, blank, id at column 0", "- a\n^n3\n\n^n4\n", ["^n3 item@0 → item@0","^n4 paragraph@3 → list@0 stray:whole-list"]],
  ["two items, indented id under the last, blank, id", "- b\n- a\n\n  ^n7\n\n^n8\n", ["^n7 item@1 → item@1","^n8 paragraph@5 → list@0 stray:whole-list"]],
  ["nested item, its id, then the parent item id", "- a\n  - c\n\n    ^n11\n\n  ^n12\n", ["^n11 item@1 → item@1","^n12 paragraph@5 → item@0 stray:item"]],
  ["item, blank, two indented ids in a row", "- a\n\n  ^n13\n\n  ^n14\n", ["^n13 item@0 → item@0","^n14 item@0 → item@0 shadowed"]],
  ["item, blank, id, child, blank, id", "- a\n\n  ^p1\n  - c\n\n  ^p2\n", ["^p1 item@0 → item@0","^p2 paragraph@5 → item@0 shadowed stray:item"]],
  ["item, id at content column directly under, blank, id", "- a\n  ^p7\n\n  ^p8\n", ["^p7 item@0 → item@0","^p8 item@0 → item@0 shadowed"]],
  ["item with an inline id, blank, indented id", "- a ^k1\n\n  ^k2\n", ["^k1 item@0 → item@0","^k2 item@0 → item@0 shadowed"]],
  ["id at the start of a note", "^first\n\nProse.\n", ["^first paragraph@0 → - stray:nothing-above"]],
  ["indented id under an item", "- item a\n\n  ^under-a\n- item b\n", ["^under-a item@0 → item@0"]],
  ["indented id under the first of two loose items", "- a\n\n  ^x4\n\n- b\n", ["^x4 item@0 → item@0"]],
  ["indented id after an item and its child", "- a\n  - child\n\n  ^x1\n- b\n", ["^x1 paragraph@3 → item@0 stray:item"]],
  ["indented id after a nested item", "- a\n  - child\n\n    ^x2\n- b\n", ["^x2 item@1 → item@1"]],
  ["id after a paragraph inside an item", "- a\n\n  inner prose\n\n  ^x3\n- b\n", ["^x3 paragraph@4 → item@0 stray:item"]],
  ["table inside an item, blank, indented id", "- a\n\n  | x | y |\n  | --- | --- |\n  | 1 | 2 |\n\n  ^x5\n- b\n", ["^x5 paragraph@6 → item@0 stray:item"]],
  ["fence inside an item, blank, indented id", "- a\n\n  ```\n  code\n  ```\n\n  ^x6\n- b\n", ["^x6 paragraph@6 → item@0 stray:item"]],
  ["quote inside an item, indented id directly under", "- a\n\n  > quoted\n  ^x7\n- b\n", ["^x7 atom@2 → item@0 stray:item"]],
  ["id at column 0 directly under a list", "- a\n- b\n^l3\n\nAfter.\n", ["^l3 item@1 → item@1"]],
  ["list under a lead paragraph, id directly under", "Lead.\n- a\n- b\n^l5\n\nAfter.\n", ["^l5 item@2 → item@2"]],
  ["list, blank, id", "Before.\n\n- a\n- b\n\n^l1\n\nAfter.\n", ["^l1 paragraph@5 → list@2 stray:whole-list"]],
  ["list under a lead paragraph, blank, id", "Lead.\n- a\n- b\n  - nested c\n\n^l2\n\nAfter.\n", ["^l2 paragraph@5 → list@1 stray:whole-list"]],
  ["list whose last item has a child, blank, id", "- a\n- b\n  - c\n\n^l4\n\nAfter.\n", ["^l4 paragraph@4 → list@0 stray:whole-list"]],
  ["paragraph, id directly under, list directly under", "Lead.\n^id1\n- a\n- b\n\nAfter.\n", ["^id1 paragraph@0 → paragraph@0"]],
  ["paragraph, blank, id, list directly under", "Lead.\n\n^id3\n- a\n- b\n\nAfter.\n", ["^id3 paragraph@2 → - stray:block-below"]],
  ["paragraph, blank, id, heading directly under", "Lead.\n\n^f1\n## H\n", ["^f1 paragraph@2 → - stray:block-below"]],
  ["table, id directly under, list directly under", "| a | b |\n| --- | --- |\n| 1 | 2 |\n^f7\n- a\n", ["^f7 paragraph@3 → - stray:block-below"]],
  ["heading, id directly under, list directly under", "## H\n^f12\n- a\n", ["^f12 paragraph@1 → - stray:block-below"]],
  ["callout, id directly under, list directly under", "> [!note] T\n> body\n^g9\n- a\n", ["^g9 atom@0 → atom@0"]],
  ["item, blank, indented id, nested item directly under", "- a\n\n  ^f9\n  - c\n", ["^f9 item@0 → item@0"]],
  ["item, lazy id, heading directly under", "- a\n^g3\n## H\n", ["^g3 item@0 → item@0"]],
  ["heading, blank, id, end of note", "## H\n\n^g11", ["^g11 heading@0 → heading@0"]],
];

for (const [shape, text, want] of SHAPES) {
  test(`block ids: ${shape}`, () => {
    const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian', quotes: 'atom', listParent: 'block' } });
    assert.deepEqual(readBlockIdsRow(doc), want);
  });
}
