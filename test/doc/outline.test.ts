// The outline tree after an update equals the one a fresh parse reads, ids aside: kinds, nesting,
// lines, gaps and blocks, over generated edits with placeholders moving. And an update reads again
// only the path to the edit: the nodes off it are the old ones, the same objects.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { OurusDoc, Lineage, type OurusNode, type PersistentNode } from '../../src/doc/index.ts';
import { executeCommand } from '../../src/commands/index.ts';
import type { MdBlock } from '../../src/parser/index.ts';
import { createPlaceholder } from '../../src/text/index.ts';
import { BLOCKS, INLINES, arbDoc, arbEdit, changeOf, changesOf, sentinelSpots } from '../parser/generators.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);
const FLAVORS = ['commonmark', 'gfm', 'obsidian'] as const;

/** Everything the outline shows but ids, one node a line, its text included (read once per stored node: a shared node's must be a fresh parse's); and every node's blocks are this snapshot's. */
function snapshot(doc: OurusDoc): string {
  const out: string[] = [];
  const visit = (node: OurusNode): void => {
    const { block, head } = node;
    // (a block is open on its first line: a container of it, or its leaf)
    const holds = (b: MdBlock, l: number): boolean => {
      const line = doc.mdTree.line(l);
      return line.leaf?.block === b || line.containers.some((c) => c.block === b);
    };
    assert.ok(node.kind === 'root' ? block === doc.mdTree.root : holds(block, node.startLine), `the ${node.kind} at ${node.startLine} holds a block of another snapshot`);
    assert.ok(!head || holds(head, node.textFirstLine), `the ${node.kind} at ${node.startLine} holds a head of another snapshot`);
    const text = doc.textOf(node);
    const read = text && JSON.stringify([text.type, text.item, text.text, text.marks.marks.map((m) => `${m.kind}@${m.from}`), text.frame.map((p) => `${p.part}@${p.from}-${p.to}`)]);
    out.push(`${'  '.repeat(node.depth)}${node.kind} ${node.startLine}-${node.textLastLine}-${node.endLine} gap ${node.gap} ${block.type}${head ? ` head ${head.type}@${node.textFirstLine}` : ''} lines ${node.persistentNode.lines} text ${read}`);
    node.children.forEach(visit);
  };
  visit(doc.rootNode);
  return out.join('\n');
}

function assertSameOutline(next: OurusDoc, context: string): void {
  const fresh = OurusDoc.parse(next.text, { config: next.config, marks: next.marks.marks });
  assert.deepEqual(next.marks.marks, fresh.marks.marks, `${context}: placeholders`);
  const got = snapshot(next);
  const want = snapshot(fresh);
  if (got !== want) assert.fail(`${context}: the outline differs\n  got\n${got}\n  want\n${want}`);
  const ids = new Set<number>();
  const visit = (node: OurusNode): void => {
    assert.ok(!ids.has(node.id), `${context}: id ${node.id} twice`);
    assert.ok(node.id === Lineage.ROOT || node.id < next.nextId, `${context}: id ${node.id} past the lineage's next`);
    ids.add(node.id);
    node.children.forEach(visit);
  };
  visit(next.rootNode);
}

/** Placeholders at `fractions` of the places one can be read at in `text`. */
function pick(text: string, fractions: readonly number[]) {
  const spots = sentinelSpots(text);
  return fractions.flatMap((f) => (spots.length ? [createPlaceholder(spots[Math.floor(f * spots.length)]!)] : []));
}

const fractions = fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { maxLength: 3 });

for (const flavor of FLAVORS) {
  test(`${flavor}: an update's outline equals a fresh parse's, one edit at a time`, () => {
    fc.assert(
      fc.property(arbDoc(BLOCKS, { frontmatter: flavor === 'obsidian' }), fc.array(arbEdit, { minLength: 1, maxLength: 4 }), (text, edits) => {
        let doc = OurusDoc.parse(text, { config: { flavor } });
        for (const edit of edits) {
          const change = changeOf(doc.text, edit);
          const next = doc.update({ changes: [change] });
          assertSameOutline(next, `${JSON.stringify(doc.text)} + ${JSON.stringify(change)}`);
          doc = next;
        }
      }),
      { numRuns: RUNS },
    );
  });

  test(`${flavor}: an update's outline equals a fresh parse's, inline-heavy documents and several changes`, () => {
    fc.assert(
      fc.property(arbDoc(INLINES), fc.array(arbEdit, { minLength: 2, maxLength: 5 }), (text, edits) => {
        const changes = changesOf(text, edits);
        const next = OurusDoc.parse(text, { config: { flavor } }).update({ changes });
        assertSameOutline(next, `${JSON.stringify(text)} + ${JSON.stringify(changes)}`);
      }),
      { numRuns: RUNS },
    );
  });

  test(`${flavor}: an update's outline equals a fresh parse's, placeholders moving`, () => {
    fc.assert(
      fc.property(arbDoc(BLOCKS), fractions, fractions, fc.option(arbEdit), (text, before, after, edit) => {
        const doc = OurusDoc.parse(text, { config: { flavor }, marks: pick(text, before) });
        const changes = edit ? [changeOf(text, edit)] : [];
        const newText = changes.length ? text.slice(0, changes[0]!.from) + changes[0]!.insert + text.slice(changes[0]!.to) : text;
        const next = doc.update({ changes, setMarks: pick(newText, after) });
        assertSameOutline(next, `${JSON.stringify(text)} + ${JSON.stringify(changes)} placeholders ${JSON.stringify(pick(newText, after))}`);
      }),
      { numRuns: RUNS },
    );
  });
}

/** The nodes of `next` that aren't nodes of `old`: what the update made anew. */
function madeAnew(old: OurusDoc, next: OurusDoc): number {
  const before = new Set<PersistentNode>();
  const collect = (node: PersistentNode): void => {
    before.add(node);
    node.children.forEach(collect);
  };
  collect(old.root);
  let n = 0;
  const count = (node: PersistentNode): void => {
    if (before.has(node)) return;
    n++;
    node.children.forEach(count);
  };
  count(next.root);
  return n;
}

test('an edit in a long document makes only the path to it anew', () => {
  const sections = Array.from({ length: 100 }, (_, i) => `# Section ${i}\n\npara ${i}\n- a\n  - b\n- c\n\n> quote ${i}\n`).join('\n');
  const doc = OurusDoc.parse(sections);
  const at = sections.indexOf('para 50') + 4;
  // Enter in a paragraph: a line more, everything after it moved down
  const enter = doc.update({ changes: [{ from: at, to: at, insert: '\n' }] });
  assertSameOutline(enter, 'enter');
  assert.ok(madeAnew(doc, enter) < 10, `${madeAnew(doc, enter)} nodes made anew`);
  // typing in an item: the parse keeps every block; the item and its ancestors are made anew
  const b = sections.indexOf('  - b', at) + 4;
  const typed = doc.update({ changes: [{ from: b, to: b, insert: 'x' }] });
  assertSameOutline(typed, 'typed');
  assert.ok(madeAnew(doc, typed) < 10, `${madeAnew(doc, typed)} nodes made anew`);
  // the nodes made anew keep their ids
  assert.equal(enter.node(doc.nodeAtLine(enter.rootNode.children[50]!.startLine)!.id)?.kind, 'heading');
});

test('ids: carried by where a node\'s first line went, named by `identity`, swapped with no change written', () => {
  const doc = OurusDoc.parse('- a\n- a\n- c\n');
  const [a1, a2, c] = doc.rootNode.children.map((n) => n.id);
  // a paragraph opened above: it owns the list now, and every item keeps its id
  const opened = doc.update({ changes: [{ from: 0, to: 0, insert: 'p\n\n' }] });
  assert.deepEqual(opened.rootNode.children[0]!.children.map((n) => n.id), [a1, a2, c]);
  // two equal items exchanged: no change to write, the ids swapped by `identity` (offsets of their markers)
  const swapped = doc.update({ identity: new Map([[0, a2!], [4, a1!]]) });
  assert.deepEqual(swapped.rootNode.children.map((n) => n.id), [a2, a1, c]);
  assert.equal(swapped.rootNode.children[2]!.persistentNode, doc.rootNode.children[2]!.persistentNode, 'the third item is the same node');
});

test('ids: a line written over from its start keeps its node, of its kind; a line deleted whole does not', () => {
  const doc = OurusDoc.parse('# H\n\nabc\n\nd\ne\n');
  const [h] = doc.rootNode.children.map((n) => n.id);
  const [abc, de] = doc.rootNode.children[0]!.children.map((n) => n.id);
  // a paragraph's whole text typed over, a caret given or not
  const typed = doc.update({ changes: [{ from: 5, to: 8, insert: 'xyz' }], caret: 8 });
  assert.deepEqual(typed.rootNode.children[0]!.children.map((n) => n.id), [abc, de]);
  assert.equal(typed.rootNode.children[0]!.id, h);
  // a paragraph of two lines, both written over by one line: the first line's node
  const both = doc.update({ changes: [{ from: 10, to: 13, insert: 'x' }] });
  assert.equal(both.rootNode.children[0]!.children[1]!.id, de);
  // written over with another kind: a new node
  const item = doc.update({ changes: [{ from: 5, to: 8, insert: '- x' }] });
  assert.notEqual(item.rootNode.children[0]!.children[0]!.id, abc);
  // the text deleted, its line with it: the node goes
  const gone = doc.update({ changes: [{ from: 5, to: 10, insert: '' }] });
  assert.deepEqual(gone.rootNode.children[0]!.children.map((n) => n.id), [de]);
});

test('gaps: the blank lines after a node\'s own text, a subtree\'s after its last descendant', () => {
  const doc = OurusDoc.parse('- [ ] foo\n  bar\n\n  # hello\n\n  - baz\n\n\npara\n');
  const lines = (node: OurusNode): string[] => [`${node.kind}:${node.gap}`, ...node.children.flatMap(lines)];
  // a text ends where its children begin; and two blank lines after `baz`, before `para`
  assert.deepEqual(lines(doc.rootNode).slice(1), ['item:1', 'heading:1', 'item:2', 'paragraph:0']);
});

test('a document nested deeper than the call stack goes is read, and a command on it refuses rather than throws', () => {
  for (const text of ['> '.repeat(5000) + 'a', Array.from({ length: 3000 }, (_, i) => ' '.repeat(2 * i) + '- a').join('\n')]) {
    const doc = OurusDoc.parse(text);
    assert.equal(doc.rootNode.children.length, 1);
    const typed = doc.update({ changes: [{ from: text.length, to: text.length, insert: 'x' }] });
    assert.equal(typed.text, text + 'x');
    const r = executeCommand(doc, { type: 'enter' }, { anchor: text.length, head: text.length });
    assert.ok(r.status === 'applied' || r.status === 'rejected');
  }
});
