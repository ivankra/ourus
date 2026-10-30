// Block ids as the outline reads them in Obsidian (`dev/24-block-ids.md` §4.3, §4.4): a block id
// ending a text is a frame part of it; a block-id line after a block, which Obsidian reads as
// naming that block, is carried by the block's text, outside its string, and the node's own lines
// take it in. Each case: a document, and every node as `kind text {carried} own-lines`.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc, OurusProse, blockIdsOf, withoutBlockIds, closingFrameStart, type OurusNode } from '../../src/doc/index.ts';

function parse(text: string, flavor: 'obsidian' | 'gfm' = 'obsidian'): OurusDoc {
  return OurusDoc.parse(text, { config: { flavor } });
}

/** Every node: its kind, its text with a block id ending it bracketed, the lines it carries, its own lines. */
function read(doc: OurusDoc): string[] {
  const out: string[] = [];
  const visit = (node: OurusNode): void => {
    for (const c of node.children) {
      const text = doc.textOf(c)!;
      let s = text.text;
      const part = text instanceof OurusProse ? text.frame.find((p) => p.part === 'blockId') : undefined;
      if (part) s = `${s.slice(0, part.from)}⟦${s.slice(part.from, part.to)}⟧${s.slice(part.to)}`;
      const carried = text.blockIdLines.map((l) => `${'⏎'.repeat(l.blankLines)}${l.line}`).join(' ');
      out.push(`${'  '.repeat(c.depth - 1)}${c.kind} ${JSON.stringify(s)}${carried ? ` {${carried}}` : ''} ${c.startLine}-${c.textLastLine}-${c.ownLastLine} gap ${c.gap}`);
      visit(c);
    }
  };
  visit(doc.rootNode);
  return out;
}

test('a table carries its block-id line, after a blank line, followed by one', () => {
  assert.deepEqual(read(parse('Intro.\n\n| a |\n| - |\n\n^t1\n\nOutro.\n')), [
    'paragraph "Intro." 0-0-0 gap 1',
    'atom "| a |\\n| - |" {⏎^t1} 2-3-5 gap 1',
    'paragraph "Outro." 7-7-7 gap 0',
  ]);
});

test('a fence and a heading carry one right under them; a paragraph reads one there as its text', () => {
  assert.deepEqual(read(parse('```\nc\n```\n^f1\n\n## H\n^h2\n\np\n^p1\n')), [
    'atom "```\\nc\\n```" {^f1} 0-2-3 gap 1',
    'heading "## H" {^h2} 5-5-6 gap 1',
    '  paragraph "p⟦\\n^p1⟧" 8-9-9 gap 0',
  ]);
});

test('an item carries one indented under its text; its children follow it', () => {
  assert.deepEqual(read(parse('- a\n\n  ^x\n  - b\n- c\n')), ['item "a" {⏎^x} 0-0-2 gap 0', '  item "b" 3-3-3 gap 0', 'item "c" 4-4-4 gap 0']);
});

test('a paragraph carrying one owns the list after it, as Obsidian names the paragraph', () => {
  assert.deepEqual(read(parse('Lead.\n\n^id4\n\n- a\n')), ['paragraph "Lead." {⏎^id4} 0-0-2 gap 1', '  item "a" 4-4-4 gap 0']);
});

test('a run of block-id lines is carried whole', () => {
  assert.deepEqual(read(parse('p\n\n^y1\n\n^y2\n\nq\n')), ['paragraph "p" {⏎^y1 ⏎^y2} 0-0-4 gap 1', 'paragraph "q" 6-6-6 gap 0']);
});

test('stray: after a list, with a block right under it, at the top, with trailing blanks, inside an item after another block', () => {
  assert.deepEqual(read(parse('- a\n\n^l\n')), ['item "a" 0-0-0 gap 1', 'paragraph "⟦^l⟧" 2-2-2 gap 0']);
  assert.deepEqual(read(parse('p\n\n^b\n## H\n')), ['paragraph "p" 0-0-0 gap 1', 'paragraph "⟦^b⟧" 2-2-2 gap 0', 'heading "## H" 3-3-3 gap 0']);
  assert.deepEqual(read(parse('^top\n\np\n')), ['paragraph "⟦^top⟧" 0-0-0 gap 1', 'paragraph "p" 2-2-2 gap 0']);
  assert.deepEqual(read(parse('p\n\n^s \n')), ['paragraph "p" 0-0-0 gap 1', 'paragraph "⟦^s ⟧" 2-2-2 gap 0']);
  assert.deepEqual(read(parse('- a\n\n  | t |\n  | - |\n\n  ^i\n')), ['item "a" 0-0-0 gap 1', '  atom "| t |\\n| - |" 2-3-3 gap 1', '  paragraph "⟦^i⟧" 5-5-5 gap 0']);
});

test('a callout reads one right under it as its last paragraph\'s text', () => {
  assert.deepEqual(read(parse('> [!note]\n> hi\n^c1\n\nnext\n')), ['quote "[!note]" 0-0-0 gap 0', '  paragraph "hi⟦\\n^c1⟧" 1-2-2 gap 1', 'paragraph "next" 4-4-4 gap 0']);
});

test('a block id ending a text is a frame part, before its closing frame; the closing frame is the run', () => {
  const doc = parse('para ^id\n\n## H ^x ##\n\nTitle ^s\n===\n\n## ^h\n\n- [ ] ^t\n');
  assert.deepEqual(read(doc), [
    'paragraph "para⟦ ^id⟧" 0-0-0 gap 1',
    'heading "## H⟦ ^x⟧ ##" 2-2-2 gap 1',
    'heading "Title⟦ ^s⟧\\n===" 4-5-5 gap 1',
    '  heading "## ⟦^h⟧" 7-7-7 gap 1',
    '    item "[ ] ⟦^t⟧" 9-9-9 gap 0',
  ]);
  const [, atx, setext] = doc.rootNode.children.map((n) => doc.textOf(n) as OurusProse);
  assert.equal(closingFrameStart(atx!), 4);
  assert.equal(closingFrameStart(setext!), 5);
  assert.equal(setext!.heading?.form, 'setext');
  assert.equal(atx!.body, 'H');
});

test('outside Obsidian, a block id is text', () => {
  assert.deepEqual(read(parse('para ^id\n\n| a |\n| - |\n\n^t1\n', 'gfm')), ['paragraph "para ^id" 0-0-0 gap 1', 'atom "| a |\\n| - |" 2-3-3 gap 1', 'paragraph "^t1" 5-5-5 gap 0']);
});

test('blockIdsOf: in the string, where, then carried, which line; withoutBlockIds drops them all, or those it is told', () => {
  const doc = parse('a ^x\n\n^y\n\n^z\n');
  const text = doc.textOf(doc.rootNode.children[0]!)!;
  assert.deepEqual(blockIdsOf(text), [
    { name: 'x', carried: false, from: 2, to: 4, partFrom: 1, partTo: 4 },
    { name: 'y', carried: true, k: 0 },
    { name: 'z', carried: true, k: 1 },
  ]);
  assert.deepEqual(blockIdsOf(withoutBlockIds(text, new Set([0, 1]))).map((b) => b.name), ['z']);
  assert.deepEqual(withoutBlockIds(text, new Set([1])).blockIdLines, [{ blankLines: 1, line: '^z' }]);
  // (one of a name written twice, the other kept)
  const twice = parse('- a\n\n  ^x\n\n  ^x\n').textOf(parse('- a\n\n  ^x\n\n  ^x\n').rootNode.children[0]!)!;
  assert.deepEqual(withoutBlockIds(twice, new Set([1])).blockIdLines, [{ blankLines: 1, line: '^x' }]);
  // (what is left reading as one goes too)
  const two = parse('^a ^b\n').textOf(parse('^a ^b\n').rootNode.children[0]!)!;
  assert.equal(withoutBlockIds(two).text, '');
});

test('the nodes on a block-id line and its blank lines are its owner; locate says which line', () => {
  const text = 'Intro.\n\n| a |\n| - |\n\n^t1\n\nOutro.\n';
  const doc = parse(text);
  const table = doc.rootNode.children[1]!;
  assert.equal(doc.nodeAtLine(4), table);
  assert.equal(doc.nodeAtLine(5), table);
  assert.equal(doc.nodeAtLine(6), null);
  const at = text.indexOf('^t1') + 2;
  assert.deepEqual(pick(doc.locate(at)), { zone: 'blockIdLine', node: table.id, line: 0, blank: false, offset: 2 });
  assert.deepEqual(pick(doc.locate(text.indexOf('^t1') - 1)), { zone: 'blockIdLine', node: table.id, line: 0, blank: true, offset: 0 });
  assert.deepEqual(pick(doc.locate(text.indexOf('Outro.') - 1)), { zone: 'gap', node: table.id });
});

function pick(at: ReturnType<OurusDoc['locate']>): Record<string, unknown> {
  if (at.zone === 'blockIdLine') return { zone: at.zone, node: at.node.id, line: at.line, blank: at.blank, offset: at.offset };
  if (at.zone === 'gap') return { zone: at.zone, node: at.owner.id };
  return { zone: at.zone };
}

test('a caret at the start of a block id ending a text is in the text, as at a setext underline\'s', () => {
  const doc = parse('- b\n  ^id\n');
  assert.equal(doc.locate(3).zone, 'text');
  assert.equal(doc.locate(6).zone, 'frame');
});

test('the same text, read again by an update that makes its block-id line attach or come loose', () => {
  const doc = parse('p\n\n^y\n\nq\n');
  const loose = doc.update({ changes: [{ from: 5, to: 5, insert: ' ' }] });
  assert.deepEqual(read(loose), ['paragraph "p" 0-0-0 gap 1', 'paragraph "⟦^y ⟧" 2-2-2 gap 1', 'paragraph "q" 4-4-4 gap 0']);
  const again = loose.update({ changes: [{ from: 5, to: 6, insert: '' }] });
  assert.deepEqual(read(again), read(doc));
  // blocks are stored by their shapes: `q`, `p`, `^y` and `p`, `^y`, `q` are the same root block
  const moved = parse('q\n\np\n\n^y\n').update({ changes: [{ from: 0, to: 9, insert: 'p\n\n^y\n\nq\n' }] });
  assert.deepEqual(read(moved), read(doc));
});
