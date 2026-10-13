// The outline plan: path copying, the edits, and comparing a re-parsed outline with the plan.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OutlineState, type OutlineNode } from '../../src/outline/index.ts';
import { OutlinePlan, type PlanTree } from '../../src/encoder/index.ts';

const textOf = (doc: OutlineState) => (n: OutlineNode): string => doc.headLines(n).map((l) => l.trim()).join('\n');
const nodeOf = (doc: OutlineState, text: string): OutlineNode => doc.nodes.find((n) => textOf(doc)(n) === text)!;

/** The plan drawn as indented lines: `kind text`, with `*` on copied or new nodes. */
function draw(doc: OutlineState, n: PlanTree, depth = 0): string[] {
  const own = OutlinePlan.isPlanned(n) ? (n.text ?? (n.original ? textOf(doc)(n.original) : '')) : textOf(doc)(n);
  const line = `${'  '.repeat(depth)}${n.kind}${OutlinePlan.isPlanned(n) ? '*' : ''} ${own}`;
  return [line, ...n.children.flatMap((c) => draw(doc, c, depth + 1))];
}

const doc = OutlineState.parse('# A\n\n- a\n  - a1\n- b\n\n# B\n\npara\n');

test('a plan starts as the current outline; a change copies the path from the root and shares every other node', () => {
  const plan = OutlinePlan.from(doc);
  assert.equal(plan.root, doc.root);
  assert.equal(plan.changed, false);
  const edited = plan.setText(nodeOf(doc, 'a1'), 'changed');
  assert.equal(edited.changed, true);
  assert.deepEqual(draw(doc, edited.root), [
    'root* ',
    '  heading* A',
    '    item* a',
    '      item* changed',
    '    item b',
    '  heading B',
    '    paragraph para',
  ]);
  const [a, b] = edited.root.children[0]!.children;
  assert.ok(OutlinePlan.isPlanned(a!));
  assert.equal(b, nodeOf(doc, 'b'), 'an untouched sibling is the current node itself');
  assert.equal(edited.root.children[1], nodeOf(doc, 'B'), 'an untouched section is the current node itself');
  assert.equal(plan.root, doc.root, 'a plan is immutable');
});

test('children are removed, placed and appended, each under the parent the plan finds', () => {
  const plan = OutlinePlan.from(doc);
  const fresh = OutlinePlan.created('paragraph', 'new');
  assert.deepEqual(draw(doc, plan.remove([nodeOf(doc, 'a')]).place('before', nodeOf(doc, 'b'), [fresh]).root), [
    'root* ',
    '  heading* A',
    '    paragraph* new',
    '    item b',
    '  heading B',
    '    paragraph para',
  ]);
  assert.deepEqual(draw(doc, plan.remove([nodeOf(doc, 'b')]).append(nodeOf(doc, 'a'), 'last', [nodeOf(doc, 'b')]).root), [
    'root* ',
    '  heading* A',
    '    item* a',
    '      item a1',
    '      item b',
    '  heading B',
    '    paragraph para',
  ]);
  assert.deepEqual(draw(doc, plan.place('instead', nodeOf(doc, 'para'), [fresh]).root).slice(-2), ['  heading* B', '    paragraph* new']);
});

test('a re-parsed outline is compared with the plan it was meant to be', () => {
  // `- b` moved above `- a`, written by hand: the comparison doesn't need an encoder
  const moved = OutlinePlan.from(doc).update(nodeOf(doc, 'A'), (n) => ({ ...n, children: [...n.children].reverse() }));
  const right = OutlineState.parse('# A\n\n- b\n- a\n  - a1\n\n# B\n\npara\n');
  assert.equal(moved.differenceFrom(right, doc, 'tree'), null);
  const wrong = OutlineState.parse('# A\n\n- b\n  - a\n  - a1\n\n# B\n\npara\n');
  assert.equal(moved.differenceFrom(wrong, doc, 'tree'), 'root › 0 › 0: 0 children, got 2');
  const level = OutlinePlan.from(doc).update(nodeOf(doc, 'B'), (n) => ({ ...n, level: 2 }));
  assert.equal(level.differenceFrom(doc, doc, 'tree'), 'root › 1: level 2, got 1');
  assert.equal(OutlinePlan.from(doc).differenceFrom(doc, doc, 'tree'), null);
});

test('new nodes are payload: edits target nodes with ids, and find parents by structure, not by id', () => {
  const plan = OutlinePlan.from(doc);
  const a = OutlinePlan.created('item', 'new a');
  const b = OutlinePlan.created('item', 'new b');
  // two new siblings, then edits around them: each edit finds its own target
  const added = plan.append(nodeOf(doc, 'a'), 'last', [a, b]);
  const edited = added.setText(nodeOf(doc, 'a1'), 'changed').place('after', nodeOf(doc, 'a1'), [OutlinePlan.created('item', 'c')]);
  assert.deepEqual(draw(doc, edited.root).slice(2, 7), ['    item* a', '      item* changed', '      item* c', '      item* new a', '      item* new b']);
  // an old node under a new parent: removing it edits the new parent, found by structure
  const holder = { ...OutlinePlan.created('paragraph', 'holder'), children: [nodeOf(doc, 'b')] };
  const other = OutlinePlan.created('paragraph', 'other');
  const held = plan.remove([nodeOf(doc, 'b')]).append(nodeOf(doc, 'A'), 'last', [other, holder]);
  assert.deepEqual(draw(doc, held.remove([nodeOf(doc, 'b')]).root).slice(3, 6), ['      item a1', '    paragraph* other', '    paragraph* holder']);
  // a node the command created has no id: it can't be told apart, so an edit can't target it
  assert.throws(() => added.setText(b as unknown as { id: number }, 'B'), /no id/);
  assert.throws(() => added.remove([b as unknown as { id: number }]), /no id/);
  assert.throws(() => added.place('after', b as unknown as { id: number }, [OutlinePlan.created('item', 'c')]), /no id/);
});
