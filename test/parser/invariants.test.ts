// The syntax layer is lossless, on every flavor and any string: the lines give the text back; prefix
// pieces run from the line start without gaps, in offsets and columns; blocks nest and keep their
// lines; a leaf's inline text maps character by character onto the source; inline nodes nest, and at
// the top they tile the inline text (every character is in exactly one node).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { renderHtml } from '../../src/parser/html.ts';
import { SyntaxTree } from '../../src/parser/syntax.ts';
import type { Block, InlineNode } from '../../src/parser/types.ts';
import { preorder } from '../../src/parser/walk.ts';
import { advanceColumns } from '../../src/text.ts';
import { FLAVORS } from './flavors.ts';
import { BLOCKS, INLINES, arbDoc } from './generators.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);

export function checkSyntax(syntax: SyntaxTree): void {
  const { text, lines, root } = syntax;
  let rebuilt = '';
  for (const line of lines) rebuilt += text.slice(line.from, line.to) + line.ending;
  assert.equal(rebuilt, text, 'lines give the text back');
  for (const line of lines) {
    let pos = line.from;
    let col = 0;
    for (const p of line.prefix) {
      assert.equal(p.from, pos, `line ${line.index}: a piece starts where the previous ended`);
      assert.equal(p.fromColumn, col, `line ${line.index}: piece columns run on`);
      assert.ok(p.to >= p.from && p.to <= line.to, `line ${line.index}: piece in the line`);
      const natural = advanceColumns(text, line.from, p.to, 0);
      if (p.partialTab) assert.ok(p.toColumn > natural && text.charCodeAt(p.to) === 9, `line ${line.index}: a partial tab`);
      else assert.equal(p.toColumn, natural, `line ${line.index}: piece column matches its text`);
      assert.ok(line.containers.includes(p.block), `line ${line.index}: a piece's container is the line's`);
      pos = p.to;
      col = p.toColumn;
    }
    assert.equal(line.contentFrom, pos);
    assert.equal(line.container, line.containers[line.containers.length - 1] ?? root);
    if (line.leaf) {
      assert.ok(line.leaf.startLine <= line.index && line.index <= line.leaf.endLine, `line ${line.index} in its leaf`);
      assert.equal(line.leaf.parent, line.container, `line ${line.index}: its leaf is in its innermost container`);
    }
  }
  for (const b of preorder(root)) {
    let prevEnd = b.type === 'document' ? -1 : b.startLine - 1;
    for (const c of b.children) {
      assert.equal(c.parent, b);
      const sharesLine = c === b.children[0] && c.startLine === b.startLine;
      assert.ok(c.startLine > prevEnd || sharesLine || b.type === 'table' || b.type === 'table_row', `${c.type} after its previous sibling`);
      assert.ok(c.startLine <= c.endLine, `${c.type} has lines`);
      if (b.type !== 'document') assert.ok(c.endLine <= b.endLine || b.type === 'blockquote', `${c.type} within ${b.type}`);
      prevEnd = c.endLine;
    }
    checkInlines(syntax, b);
  }
}

function checkInlines(syntax: SyntaxTree, b: Block): void {
  const t = syntax.inlineText(b);
  if (!t) return;
  const { text } = syntax;
  let prev = -1;
  for (let i = 0; i < t.text.length; i++) {
    const at = t.sourceAt(i);
    assert.ok(at >= prev, `${b.type}: the mapping runs forward`);
    const c: string = t.text[i]!;
    const s: string | undefined = text[at];
    if (c === '\n') assert.ok(s === '\n' || s === '\r', `${b.type}: a line break stands for a line ending`);
    else {
      assert.ok(c === s || (c === '�' && s === '\0'), `${b.type}: text ${JSON.stringify(c)} is source ${JSON.stringify(s)}`);
      assert.equal(t.textAt(at), i, `${b.type}: the mapping goes back`);
    }
    prev = at;
  }
  const nodes = syntax.inlines(b);
  let pos = 0;
  for (const n of nodes) {
    assert.equal(n.from, pos, `${b.type}: top-level inlines tile the text (${n.type} at ${n.from}, expected ${pos})`);
    pos = n.to;
    checkNode(n, t.text.length);
  }
  assert.equal(pos, t.text.length, `${b.type}: the inlines cover the text`);
}

function checkNode(n: InlineNode, length: number): void {
  assert.ok(n.from <= n.to && n.to <= length, `${n.type}: a range in the text`);
  if (n.type === 'text') assert.ok(n.from < n.to, 'no empty text');
  let pos = n.from;
  for (const c of n.children ?? []) {
    assert.ok(c.from >= pos && c.to <= n.to, `${c.type} inside ${n.type}, after its previous sibling`);
    pos = c.to;
    checkNode(c, length);
  }
}

const arbText = fc.oneof(
  fc.string({ unit: 'binary', maxLength: 60 }),
  fc.string({ unit: fc.constantFrom('\n', '\r', '\t', ' ', '>', '-', '*', '_', '`', '[', ']', '(', ')', '!', '<', '&', '#', '|', ':', '^', '$', '%', '=', '~', '\\', 'a', '1', '.', '\0', '\uD800'), maxLength: 80 }),
);

for (const [name, flavor] of Object.entries(FLAVORS)) {
  test(`${name}: lossless on block-heavy documents`, () => {
    fc.assert(fc.property(arbDoc(BLOCKS, { frontmatter: name === 'obsidian' }), (md) => checkSyntax(SyntaxTree.parse(md, flavor))), { numRuns: RUNS });
  });
  test(`${name}: lossless on inline-heavy documents`, () => {
    fc.assert(fc.property(arbDoc(INLINES), (md) => checkSyntax(SyntaxTree.parse(md, flavor))), { numRuns: RUNS });
  });
  test(`${name}: any string parses, renders and is lossless`, () => {
    fc.assert(
      fc.property(arbText, (md) => {
        const syntax = SyntaxTree.parse(md, flavor);
        checkSyntax(syntax);
        renderHtml(syntax);
      }),
      { numRuns: RUNS },
    );
  });
}
