// The outline snapshot: the outline built from the block tree, and node ids across edits.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OutlineState, type OutlineNode } from '../../src/outline/index.ts';

const textOf = (doc: OutlineState) => (n: OutlineNode): string => doc.headLines(n).map((l) => l.trim()).join('\n');
const nodeOf = (doc: OutlineState, text: string): OutlineNode => doc.nodes.find((n) => textOf(doc)(n) === text)!;

const doc = OutlineState.parse('# A\n\n- a\n  - a1\n- b\n\n# B\n\npara\n');

test('the outline is built from the root alone, and its nodes listed in document order', () => {
  assert.deepEqual(
    doc.nodes.map((n) => `${n.kind}:${textOf(doc)(n)}`),
    ['root:', 'heading:A', 'item:a', 'item:a1', 'item:b', 'heading:B', 'paragraph:para'],
  );
  assert.equal(doc.root.endLine, 8);
  assert.equal(nodeOf(doc, 'A').endLine, 4, 'a section ends where its last descendant does');
});

test('typing at the start of a node keeps its id', () => {
  const doc = OutlineState.parse('para\n\n- item\n');
  const typed = doc.update([{ from: 0, to: 0, insert: 'x' }]).update([{ from: 7, to: 7, insert: ' ' }]);
  assert.deepEqual(typed.nodes.map((n) => n.id), doc.nodes.map((n) => n.id));
});

test('replacing the text keeps the ids of nodes outside the lines that differ', () => {
  const doc = OutlineState.parse('# A\n\n- x\n- z\n');
  const next = doc.replace('# A\n\n- x\n- y\n- z\n');
  const idOf = (d: OutlineState, text: string) => d.nodes.find((n) => d.headLines(n).join('').trim() === text)?.id;
  for (const t of ['A', 'x', 'z']) assert.equal(idOf(next, t), idOf(doc, t), t);
  assert.ok(!doc.nodes.some((n) => n.id === idOf(next, 'y')), 'the new item gets a new id');
});
