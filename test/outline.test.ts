// Edited outlines: path copying, the edit helpers, and comparing an outline with the one it was
// meant to be.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Doc } from '../src/doc.ts';
import type { OutlineNode } from '../src/outline.ts';
import { editNode, isEdited, outlineDifference, type EditedOutlineNode } from '../src/outline-editor.ts';

const textOf = (doc: Doc) => (n: OutlineNode): string => doc.headLines(n).map((l) => l.trim()).join('\n');
const idOf = (doc: Doc, text: string): number => doc.nodes.find((n) => textOf(doc)(n) === text)!.id;
const texts = (old: Doc, now: Doc) => ({ old: textOf(old), new: textOf(now) });

/** The edited outline drawn as indented lines: `kind text`, with `*` on copied or new nodes. */
function draw(doc: Doc, n: OutlineNode | EditedOutlineNode, depth = 0): string[] {
  const own = isEdited(n) ? (n.text ?? (n.from ? textOf(doc)(n.from) : '')) : textOf(doc)(n);
  const line = `${'  '.repeat(depth)}${n.kind}${isEdited(n) ? '*' : ''} ${own}`;
  return [line, ...n.children.flatMap((c) => draw(doc, c, depth + 1))];
}

const doc = Doc.parse('# A\n\n- a\n  - a1\n- b\n\n# B\n\npara\n');

test('the outline is built from the root alone, and its nodes listed in document order', () => {
  assert.deepEqual(
    doc.nodes.map((n) => `${n.kind}:${textOf(doc)(n)}`),
    ['root:', 'heading:A', 'item:a', 'item:a1', 'item:b', 'heading:B', 'paragraph:para'],
  );
  assert.equal(doc.outline.endLine, 8);
  assert.equal(doc.node(idOf(doc, 'A'))!.endLine, 4, 'a section ends where its last descendant does');
});

test('an edit copies the path from the root and shares every other node', () => {
  const edited = editNode(doc.outline, idOf(doc, 'a1'), (n) => ({ ...n, text: 'changed' }));
  assert.deepEqual(draw(doc, edited), [
    'root* ',
    '  heading* A',
    '    item* a',
    '      item* changed',
    '    item b',
    '  heading B',
    '    paragraph para',
  ]);
  const [a, b] = (edited.children[0] as EditedOutlineNode).children;
  assert.ok(isEdited(a!));
  assert.equal(b, doc.node(idOf(doc, 'b')), 'an untouched sibling is the old node itself');
  assert.equal(edited.children[1], doc.node(idOf(doc, 'B')), 'an untouched section is the old node itself');
});

test('children are replaced through the parent: removed, inserted and reordered', () => {
  const A = idOf(doc, 'A');
  const fresh: EditedOutlineNode = { id: null, kind: 'paragraph', text: 'new', children: [] };
  const replaced = editNode(doc.outline, A, (n) => ({ ...n, children: [fresh, ...n.children.filter((c) => c.id !== idOf(doc, 'a'))] }));
  assert.deepEqual(draw(doc, replaced), [
    'root* ',
    '  heading* A',
    '    paragraph* new',
    '    item b',
    '  heading B',
    '    paragraph para',
  ]);
  const swapped = editNode(doc.outline, A, (n) => ({ ...n, children: [...n.children].reverse() }));
  assert.deepEqual(draw(doc, swapped), [
    'root* ',
    '  heading* A',
    '    item b',
    '    item a',
    '      item a1',
    '  heading B',
    '    paragraph para',
  ]);
});

test('an outline is compared with the edited outline it was meant to be', () => {
  // `- b` moved above `- a`, written by hand: the comparison doesn't need a writer
  const moved = editNode(doc.outline, idOf(doc, 'A'), (n) => ({ ...n, children: [...n.children].reverse() }));
  const right = Doc.parse('# A\n\n- b\n- a\n  - a1\n\n# B\n\npara\n');
  assert.equal(outlineDifference(moved, right.outline, texts(doc, right)), null);
  const wrong = Doc.parse('# A\n\n- b\n  - a\n  - a1\n\n# B\n\npara\n');
  assert.equal(outlineDifference(moved, wrong.outline, texts(doc, wrong)), 'root › 0 › 0: 0 children, got 2');
  const level = editNode(doc.outline, idOf(doc, 'B'), (n) => ({ ...n, level: 2 }));
  assert.equal(outlineDifference(level, doc.outline, texts(doc, doc)), 'root › 1: level 2, got 1');
  assert.equal(outlineDifference(doc.outline, doc.outline, texts(doc, doc)), null);
});
