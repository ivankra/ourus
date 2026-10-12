import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { parseCommonMark } from '../src/syntax/commonmark.ts';
import type { Block, LineInfo } from '../src/block.ts';

/** A parse with its text. */
type Parsed = { readonly text: string; readonly root: Block; readonly lines: readonly LineInfo[] };
const parse = (text: string): Parsed => ({ text, ...parseCommonMark(text) });
import { advanceColumns } from '../src/text.ts';
import { arbDoc, TIDY, WILD } from './arbitraries.ts';
import { ourusSkeleton, refdefLines, referenceSkeleton } from './oracle.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 2000);

/** Structural invariants of the line table and block tree. Throws on the first violation. */
export function checkInvariants(tree: Parsed): void {
  const { text, lines, root } = tree;
  // lines cover the text exactly
  let rebuilt = '';
  for (const line of lines) rebuilt += text.slice(line.from, line.to) + line.ending;
  assert.equal(rebuilt, text, 'lines reproduce the text');
  for (const line of lines) {
    // prefix pieces are contiguous from the line start, in columns as well as offsets
    let pos = line.from;
    let col = 0;
    for (const p of line.prefix) {
      assert.equal(p.from, pos, `line ${line.index}: piece starts where the previous ended`);
      assert.equal(p.fromColumn, col, `line ${line.index}: piece columns are contiguous`);
      assert.ok(p.to >= p.from && p.to <= line.to, `line ${line.index}: piece inside line`);
      const naturalEnd = advanceColumns(text, line.from, p.to, 0);
      if (p.partialTab) assert.ok(p.toColumn > naturalEnd && text.charCodeAt(p.to) === 9, `line ${line.index}: partial tab`);
      else assert.equal(p.toColumn, naturalEnd, `line ${line.index}: piece column matches its text`);
      pos = p.to;
      col = p.toColumn;
    }
    assert.equal(line.contentFrom, pos);
    if (line.leaf) {
      assert.ok(line.leaf.startLine <= line.index && line.index <= line.leaf.endLine, `line ${line.index} inside its leaf`);
    }
  }
  // children are ordered and nested within their parent
  const walk = (b: Block): void => {
    let prevEnd = b.type === 'document' ? -1 : b.startLine - 1;
    for (const c of b.children) {
      assert.equal(c.parent, b);
      assert.ok(c.startLine > prevEnd || (b.type === 'item' && c === b.children[0] && c.startLine === b.startLine), `${c.type} after previous sibling`);
      assert.ok(c.startLine <= c.endLine, `${c.type} has lines`);
      if (b.type !== 'document') assert.ok(c.endLine <= b.endLine || b.type === 'blockquote', `${c.type} within ${b.type}`);
      prevEnd = c.endLine;
      walk(c);
    }
  };
  walk(root);
}

test('block structure agrees with commonmark.js on wild documents', () => {
  fc.assert(
    fc.property(arbDoc(WILD, { endings: ['\n', '\r\n'] }), (md) => {
      const tree = parseCommonMark(md);
      assert.equal(ourusSkeleton(tree.root), referenceSkeleton(md, refdefLines(tree.root)));
    }),
    { numRuns: RUNS },
  );
});

test('block structure agrees with commonmark.js on tidy documents', () => {
  fc.assert(
    fc.property(arbDoc(TIDY, { maxLines: 20 }), (md) => {
      const tree = parseCommonMark(md);
      assert.equal(ourusSkeleton(tree.root), referenceSkeleton(md, refdefLines(tree.root)));
    }),
    { numRuns: RUNS },
  );
});

test('an ordered list interrupts a paragraph when it starts at 1, however the 1 is written', () => {
  for (const md of ['a\n1. b\n', 'a\n01. b\n', 'a\n2. b\n', 'a\n1) b\n']) {
    const tree = parseCommonMark(md);
    assert.equal(ourusSkeleton(tree.root), referenceSkeleton(md, refdefLines(tree.root)), md);
  }
});

test('line table and tree invariants hold on wild documents', () => {
  fc.assert(
    fc.property(arbDoc(WILD, { endings: ['\n', '\r\n', '\r'] }), (md) => checkInvariants(parse(md))),
    { numRuns: RUNS },
  );
});

test('every string parses, including odd code units', () => {
  fc.assert(
    fc.property(fc.string({ unit: 'binary', maxLength: 60 }), (s) => checkInvariants(parse(s))),
    { numRuns: RUNS },
  );
  for (const s of ['', '\n', '\r', '\r\n', '﻿# a', 'a\u0000b', '\uD800', '\t\t-\t\tfoo', '>\t\tfoo', '-\n\n  foo'])
    checkInvariants(parse(s));
});

test('prefix pieces of a nested list inside a quote', () => {
  const tree = parse('> - a\n>   - b\n>\n>   c\n');
  const kinds = tree.lines.map((l) => l.prefix.map((p) => `${p.block.type}:${JSON.stringify(tree.text.slice(p.from, p.to))}`).join(' '));
  assert.deepEqual(kinds, [
    'blockquote:"> " item:"- "',
    'blockquote:"> " item:"  " item:"- "',
    'blockquote:">" item:"" item:""',
    'blockquote:"> " item:"  "',
  ]);
  assert.equal(tree.lines[3]!.leaf?.type, 'paragraph');
});
