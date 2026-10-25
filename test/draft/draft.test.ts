// The draft: its operations and how references resolve through them, and what `done()`
// fixes before writing: normal form, lists, blank lines, escapes, placeholders, anchors, refusals. And the check:
// a document reads as a draft meant, or says where it doesn't.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProseText, OurusDoc, type OutlineNode, type OutlineNodePersistent } from '../../src/doc/index.ts';
import { OurusDraft, type Refusal } from '../../src/draft/index.ts';
import { differenceFrom } from '../../src/draft/check.ts';
import { createPlaceholder } from '../../src/text/index.ts';

const parse = (text: string, flavor: 'gfm' | 'commonmark' | 'obsidian' = 'gfm'): OurusDoc => OurusDoc.parse(text, { config: { flavor } });

/** The node whose text is `text`, searched depth first. */
function find(doc: OurusDoc, text: string): OutlineNode {
  const visit = (node: OutlineNode): OutlineNode | null => {
    const t = node.kind === 'root' ? null : doc.textOf(node);
    if (t && t.body === text) return node;
    for (const c of node.children) {
      const found = visit(c);
      if (found) return found;
    }
    return null;
  };
  const found = visit(doc.rootNode);
  if (!found) throw new Error(`no node ${text}`);
  return found;
}

/** The draft's outline as `kind text gap`, one node a line, indented by depth. */
function outline(root: OutlineNodePersistent, origin: OutlineNode | null, draft: { textOf: (n: OutlineNodePersistent, o: OutlineNode | null) => unknown; originOf: (n: OutlineNodePersistent) => OutlineNode | null }): string {
  const out: string[] = [];
  const visit = (node: OutlineNodePersistent, at: OutlineNode | null, depth: number): void => {
    if (node.kind !== 'root') {
      const text = draft.textOf(node, at) as ProseText | null;
      out.push(`${'  '.repeat(depth - 1)}${node.kind} ${JSON.stringify(text?.body ?? null)} ${node.gap}`);
    }
    node.children.forEach((c, i) => visit(c, node.read && at?.persistentNode === node ? at.child(i) : draft.originOf(c), depth + 1));
  };
  visit(root, origin, 0);
  return out.join('\n');
}

const drawn = (doc: OurusDoc, draft: OurusDraft): string => outline(draft.root, doc.rootNode, draft);

/** The draft applied, which must succeed: after it, its normal form can be read. */
function applied(draft: OurusDraft): void {
  const result = draft.done();
  assert.ok('doc' in result, JSON.stringify(result));
}

/** The draft applied, which must be refused. */
function refused(draft: OurusDraft): Refusal {
  const result = draft.done();
  assert.ok('reason' in result, JSON.stringify(result));
  return result;
}

test('a draft nothing changed is its document', () => {
  const doc = parse('- a\n- b\n');
  const draft = new OurusDraft(doc);
  applied(draft);
  assert.equal(draft.root, doc.root);
});

test('references resolve through what the draft touched: a descendant of a moved subtree', () => {
  const doc = parse('- a\n  - a1\n- b\n');
  const a = find(doc, 'a');
  const a1 = find(doc, 'a1');
  const b = find(doc, 'b');
  const draft = new OurusDraft(doc).remove([a]).place('after', b, [a.id]);
  // a1's OutlineNode still names it: through its moved parent
  draft.setText(a1, new ProseText('paragraph', true, 'A1'));
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "b" 0', 'item "a" 0', '  item "A1" 0'].join('\n'));
});

test('a node is placed once, never under itself', () => {
  const doc = parse('- a\n  - a1\n- b\n');
  const [a, a1, b] = [find(doc, 'a'), find(doc, 'a1'), find(doc, 'b')];
  assert.throws(() => new OurusDraft(doc).place('after', b, [a]), /placed already/);
  assert.throws(() => new OurusDraft(doc).remove([a]).append(a1, 'last', [a.id]), /under itself/);
});

test('new nodes reserve ids from the document', () => {
  const doc = parse('a\n');
  const draft = new OurusDraft(doc);
  const id = draft.create('paragraph', new ProseText('paragraph', false, 'b'));
  assert.equal(id, doc.nextId);
  assert.equal(draft.nextId, doc.nextId + 1);
  draft.place('after', find(doc, 'a'), [id]);
  applied(draft);
  // two paragraphs one under the other would run together: a blank line
  assert.equal(drawn(doc, draft), ['paragraph "a" 1', 'paragraph "b" 0'].join('\n'));
});

test('split: the gap goes with the end of the text, the children as asked', () => {
  const doc = parse('- foo bar\n  - c\n\n- d\n');
  const draft = new OurusDraft(doc);
  const [, b] = draft.split(find(doc, 'foo bar'), 4, { children: 'follow' });
  draft.setCaret(b, 0);
  applied(draft);
  // the list is loose (a blank line before `- d`): its new seam gets one too
  assert.equal(drawn(doc, draft), ['item "foo " 1', 'item "bar" 0', '  item "c" 1', 'item "d" 0'].join('\n'));
});

test('join: the lower text past its frame, its children after, its gap', () => {
  const doc = parse('- a\n- [x] b\n  - c\n\nd\n');
  const draft = new OurusDraft(doc);
  draft.join(find(doc, 'a'), find(doc, 'b'));
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "ab" 0', '  item "c" 1', 'paragraph "d" 0'].join('\n'));
});

test('done: a removed node takes its gap, the node above keeps its own, raised where the seam needs it', () => {
  const doc = parse('- a\n- b\n\ntext\n');
  const draft = new OurusDraft(doc).remove([find(doc, 'b')]);
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "a" 1', 'paragraph "text" 0'].join('\n'));
});

test('done: a seam that would run together gets a blank line (DeleteSubtree8)', () => {
  const doc = parse('- a\n  ```\n  code\n  ```\n  x\n');
  const item = find(doc, 'a');
  const draft = new OurusDraft(doc).remove([item.child(0)]);
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "a" 1', '  paragraph "x" 0'].join('\n'));
});

test('done: normal form regroups, a paragraph owning the items now right after it', () => {
  const doc = parse('p\n\n```\nc\n```\n- x\n');
  const draft = new OurusDraft(doc).remove([doc.rootNode.child(1)]);
  applied(draft);
  assert.equal(drawn(doc, draft), ['paragraph "p" 1', '  item "x" 0'].join('\n'));
});

test('done: a changed ordered list is numbered from its start', () => {
  const doc = parse('1. a\n2. b\n3. c\n');
  const draft = new OurusDraft(doc).remove([find(doc, 'a')]);
  applied(draft);
  assert.deepEqual([...draft.lists.values()].map((l) => [l.start, l.number]), [[true, 1], [false, 2]]);
});

test('done: escapes, markup kept apart, others gained by the text, the caret mapped (examples 18, 20)', () => {
  const doc = parse('one\n');
  const p = find(doc, 'one');
  const draft = new OurusDraft(doc).setText(p, new ProseText('paragraph', false, 'one\n- two')).setCaret(p, 4, -1);
  applied(draft);
  assert.deepEqual(draft.escapes.get(p.id), [4]);
  const gained = new OurusDraft(doc).setText(p, new ProseText('paragraph', false, '<div>')).setCaret(p, 3);
  applied(gained);
  const node = gained.root.children[0]!;
  assert.equal((node.text as ProseText).text, '\\<div>');
  assert.deepEqual(gained.caret, { node, offset: 4, assoc: 1 });
});

test('done: a text\'s empty last line is a blank line after it, the caret on it; another empty line has no Markdown', () => {
  const doc = parse('- one\n- two\n');
  const draft = new OurusDraft(doc).setText(find(doc, 'one'), new ProseText('paragraph', true, 'one\n')).setCaret(find(doc, 'one'), 4);
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "one" 1', 'item "two" 0'].join('\n'));
  assert.deepEqual(draft.caret, { blank: draft.root.children[0], line: 0 });
  const inside = new OurusDraft(doc).setText(find(doc, 'one'), new ProseText('paragraph', true, 'one\n\ntwo'));
  assert.equal(refused(inside).detail, 'an empty line inside a text');
});

test('done: an empty item at the caret right under text is held by a placeholder', () => {
  const doc = parse('para\n');
  const draft = new OurusDraft(doc);
  const id = draft.create('item', new ProseText('paragraph', true, ''));
  draft.append(find(doc, 'para'), 'first', [id]).setCaret(id, 0);
  applied(draft);
  const text = draft.root.children[0]!.children[0]!.text as ProseText;
  assert.deepEqual(text.marks.marks, [createPlaceholder(0)]);
});

test('done: refuses a block an item with no text of its own would read as its text', () => {
  const doc = OurusDoc.parse('- > q\n\n  para\n', { config: { flavor: 'commonmark', quotes: 'container' } });
  const item = doc.rootNode.child(0);
  const refusal = refused(new OurusDraft(doc).remove([item.child(0)]));
  assert.equal(refusal?.reason, 'not-expressible');
});

test('reads: a document says where it differs from the draft', () => {
  const doc = parse('- a\n- b\n');
  const draft = new OurusDraft(doc).remove([find(doc, 'b')]);
  applied(draft);
  assert.equal(differenceFrom(doc.update([{ from: 3, to: 7, insert: '' }]), draft), null);
  assert.match(differenceFrom(doc, draft) ?? '', /1 children, read as 2/);
});

test('done: two lists of one kind and marker side by side are one; a join places the lower\'s children', () => {
  const doc = parse('- a\n  - b\n    - c\n  - e\n');
  const draft = new OurusDraft(doc);
  draft.join(find(doc, 'a'), find(doc, 'b'), { children: 'place' });
  applied(draft);
  assert.equal(drawn(doc, draft), ['item "ab" 0', '  item "c" 0', '  item "e" 0'].join('\n'));
  const [c, e] = draft.root.children[0]!.children;
  assert.deepEqual([draft.lists.get(c!.id)?.start, draft.lists.get(e!.id)?.start], [true, false]);
  assert.ok(draft.placedIds.has(c!.id));
});

test('setText: a quote\'s title goes (null); no other node loses its text', () => {
  const doc = parse('> [!note] Title\n> body\n', 'obsidian');
  const quote = doc.rootNode.child(0);
  const draft = new OurusDraft(doc);
  const id = draft.create('paragraph', new ProseText('paragraph', false, 'Title'));
  draft.setText(quote, null).append(quote, 'first', [id]);
  applied(draft);
  assert.equal(drawn(doc, draft), ['quote null 0', '  paragraph "Title" 1', '  paragraph "body" 0'].join('\n'));
  assert.throws(() => new OurusDraft(doc).setText(quote.child(0), null), /only a quote's title/);
});
