import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { OurusConfig } from '../../src/config.ts';
import { executeCommand, OurusSuccess } from '../../src/commands/index.ts';
import { OurusView } from '../../src/view/index.ts';

// (one list of placeholders: an empty node's or a held space's by where it is)
const empty = (pos: number): number => pos;
const held = (pos: number): number => pos;
const kept = (doc: OurusDoc): string[] => doc.marks.placeholders.map((pos) => `${doc.marks.hasEmptyNodeAt(pos) ? 'empty-node' : 'held-space'}@${pos}`);

test('an empty line holds where its line has no text past its prefix, a checkbox on an item\'s first line included', () => {
  assert.deepEqual(kept(OurusDoc.parse('- a\n- ', { marks: { placeholders: [empty(6)] } })), ['empty-node@6']);
  assert.deepEqual(kept(OurusDoc.parse('> \n', { marks: { placeholders: [empty(2)] } })), ['empty-node@2']);
  assert.deepEqual(kept(OurusDoc.parse('\n', { marks: { placeholders: [empty(1)] } })), ['empty-node@1'], 'the empty last line, after the final line ending');
  // (a paragraph's last line, the empty one Shift-Enter leaves at its end, held until it settles)
  assert.deepEqual(kept(OurusDoc.parse('a\n', { marks: { placeholders: [empty(2)] } })), ['empty-node@2'], 'a paragraph\'s empty last line');
  assert.deepEqual(kept(OurusDoc.parse('a\n\nb\n', { marks: { placeholders: [empty(2)] } })), [], 'a line inside a text: Markdown holds no empty one there');
  assert.deepEqual(kept(OurusDoc.parse('- [ ] ', { marks: { placeholders: [empty(6)] } })), ['empty-node@6']);
  assert.deepEqual(kept(OurusDoc.parse('- a', { marks: { placeholders: [empty(3)] } })), [], 'the line has text');
  assert.deepEqual(kept(OurusDoc.parse('-', { marks: { placeholders: [empty(1)] } })), [], 'no marker without its space');
  assert.deepEqual(kept(OurusDoc.parse('> [ ] ', { marks: { placeholders: [empty(6)] } })), [], 'a checkbox only in an item');
  assert.deepEqual(kept(OurusDoc.parse('- a ', { marks: { placeholders: [empty(3)] } })), [], 'not at the line\'s end');
});

test('a held space holds on a space that starts its line\'s text, with text after it, under any containers', () => {
  assert.deepEqual(kept(OurusDoc.parse('-  x', { marks: { placeholders: [held(2)] } })), ['held-space@2']);
  assert.deepEqual(kept(OurusDoc.parse('-  ', { marks: { placeholders: [held(2)] } })), [], 'no text after it');
  assert.deepEqual(kept(OurusDoc.parse('- a x', { marks: { placeholders: [held(3)] } })), [], 'mid-line');
  // under any containers: an item's marker and a quote's `>` before it
  const nested = OurusDoc.parse('- >  # h', { marks: { placeholders: [held(4)] } });
  assert.deepEqual(kept(nested), ['held-space@4']);
  const quote = nested.mdTree.root.children[0]!.children[0]!.children[0]!;
  assert.equal(quote.children[0]!.type, 'paragraph', 'the held space keeps `# h` text');
});

test('a mark moves through changes, and expires where it no longer holds', () => {
  const doc = OurusDoc.parse('- a\n- ', { marks: { placeholders: [empty(6)] } });
  assert.deepEqual(kept(doc.update({ changes: [{ from: 6, to: 6, insert: ' ' }] })), ['empty-node@7'], 'a space typed keeps the line empty');
  assert.deepEqual(kept(doc.update({ changes: [{ from: 6, to: 6, insert: 'x' }] })), [], 'text typed fills it');
  // an empty line's mark, moved past what is typed there, holds nothing: the line has text
  const spaced = OurusDoc.parse('- \n', { marks: { placeholders: [empty(2)] } }).update({ changes: [{ from: 2, to: 2, insert: ' x' }] });
  assert.deepEqual(kept(spaced), []);
});

test('an update maps the marks, or sets them whole', () => {
  const doc = OurusDoc.parse('- a\n- \n- ', { marks: { placeholders: [empty(6), empty(9)] } });
  assert.deepEqual(kept(doc.update({ changes: [{ from: 0, to: 0, insert: 'x\n\n' }] })), ['empty-node@9', 'empty-node@12']);
  assert.deepEqual(kept(doc.update({ changes: [{ from: 0, to: 0, insert: 'x\n\n' }], marks: { placeholders: [empty(2), empty(1), empty(12)] } })), ['empty-node@2', 'empty-node@12'], 'the one at the end of `x` expires; the one on the line below it holds that line, the paragraph\'s last');
  assert.deepEqual(kept(doc.update({ marks: {} })), []);
  assert.deepEqual(kept(doc.update({ marks: { placeholders: [empty(9)] } })), ['empty-node@9']);
  assert.throws(() => doc.update({ marks: { placeholders: [10] } }), RangeError, 'off the text');
});

test('a mark that expires is read out of the parse too', () => {
  // `- ` under text reads as a setext underline without its placeholder
  const doc = OurusDoc.parse('a\n- ', { marks: { placeholders: [empty(4)] } });
  assert.equal(doc.mdTree.root.children[0]!.type, 'paragraph');
  // (one at the end of `a`, a line with text, expires)
  const without = doc.update({ marks: { placeholders: [empty(1)] } });
  assert.deepEqual(kept(without), []);
  assert.equal(without.mdTree.root.children[0]!.type, 'heading');
});

test('a text given whole brings its own placeholders, the ones that hold', () => {
  const doc = OurusDoc.parse('- a\n', { marks: { placeholders: [empty(4)] } });
  const next = doc.update({ text: '- a\n- \n- b', marks: { placeholders: [empty(6), empty(10)] } });
  assert.equal(next.text, '- a\n- \n- b');
  assert.deepEqual(kept(next), ['empty-node@6'], 'the one at the end of `- b` expires; the old one is gone');
});

test('withConfig: a writer\'s option shares the snapshot\'s outline; a reading option reads it again, ids carried; a flavor parses anew', () => {
  const doc = OurusDoc.parse('- a\n  - b\n\n> q\n>\n> r\n', { marks: {} });
  const ids = (d: OurusDoc): string[] => {
    const out: string[] = [];
    const visit = (n: ReturnType<OurusDoc['node']> & object): void => {
      for (const c of n.children) {
        out.push(`${c.kind}#${c.id}`);
        visit(c);
      }
    };
    visit(d.rootNode);
    return out;
  };
  const tabbed = doc.withConfig({ indentUnit: 'tab' });
  assert.equal(tabbed.config.indentUnit, 'tab');
  assert.equal(tabbed.root, doc.root, 'the same outline, its ids and all');
  assert.equal(tabbed.mdTree, doc.mdTree);
  const atoms = doc.withConfig({ quotes: 'atom' });
  assert.deepEqual(ids(atoms).map((n) => n.replace(/#\d+$/, '')), ids(OurusDoc.parse(doc.text, { config: { quotes: 'atom' } })).map((n) => n.replace(/#\d+$/, '')), 'read as a parse in that config reads it');
  assert.deepEqual(ids(atoms).slice(0, 2), ids(doc).slice(0, 2), 'the items keep their ids');
  assert.equal(atoms.mdTree, doc.mdTree, 'from the same parse');
  const obsidian = doc.withConfig({ flavor: 'obsidian' });
  assert.equal(obsidian.config.flavor, 'obsidian');
  const bare = (d: OurusDoc): string[] => ids(d).map((n) => n.replace(/#\d+$/, ''));
  assert.deepEqual(bare(obsidian), bare(OurusDoc.parse(doc.text, { config: { flavor: 'obsidian' } })), 'read as a parse in that flavor reads it');
  // its ids anew, but the lineage's: none a node of an earlier snapshot had
  assert.ok(obsidian.isSameLineage(doc));
  assert.ok(ids(obsidian).every((n) => Number(/#(\d+)$/.exec(n)![1]) >= atoms.nextId), 'no id given again');
});

test('an empty text has one line, 0, at 0, which its line methods answer for', () => {
  const doc = OurusDoc.parse('');
  assert.deepEqual(doc.lineAt(0), { index: 0, from: 0, to: 0 });
  assert.equal(doc.textStart(0), 0);
  assert.equal(doc.markdownOf(0, 0), '');
});

test('past a final line ending is the line before it, which ends before the position', () => {
  const doc = OurusDoc.parse('- a\n');
  assert.deepEqual(doc.lineAt(4), { index: 0, from: 0, to: 3 });
});

test('settings applied again unchanged keep the snapshot, so an undo given the one before still takes its nodes', () => {
  const view = OurusView.of(OurusDoc.parse('- a\n  - a1\n- b\n'), { folded: [1] });
  const doc = view.doc;
  assert.equal(doc.withConfig({}), doc);
  const moved = executeCommand(view, { type: 'moveSubtreeDown' }, { anchor: 2, head: 2 });
  assert.ok(moved instanceof OurusSuccess);
  if (!(moved instanceof OurusSuccess)) return;
  const current = moved.view.withConfig({ markup: 'text' });
  const undone = current.withDoc(doc.withConfig(current.doc.config));
  assert.equal(undone.doc.node(1)?.kind, 'item');
  assert.ok(undone.folded.has(1));
});

test('a setting for what owns what, changed, reads the outline as a fresh parse under it does', async () => {
  const { readDrawing } = await import('../lib/index.ts');
  const { readSpecFile, specFiles } = await import('../lib/index.ts');
  const shape = (doc: OurusDoc): string => {
    const out: string[] = [];
    const visit = (n: OurusNode, d: number): void => {
      out.push(`${' '.repeat(d)}${n.kind} ${n.startLine} ${doc.textOf(n)?.text ?? ''}`);
      n.children.forEach((c) => visit(c, d + 1));
    };
    visit(doc.rootNode, 0);
    return out.join('\n');
  };
  const texts = new Set<string>();
  for (const file of specFiles()) for (const t of readSpecFile(file)) texts.add(readDrawing(t.initial.buffer).text);
  for (const option of ['listParent', 'quotes'] as const) {
    for (const text of texts) {
      for (const from of OurusConfig.values[option]) {
        const doc = OurusDoc.parse(text, { config: { [option]: from } });
        for (const to of OurusConfig.values[option]) {
          assert.equal(shape(doc.withConfig({ [option]: to })), shape(OurusDoc.parse(text, { config: { [option]: to } })), `${JSON.stringify(text)}: ${option} ${from} → ${to}`);
        }
      }
    }
  }
});

test('an unknown option is a reading problem, whatever its name', () => {
  for (const key of ['constructor', 'toString', '__proto__', 'nope']) assert.equal(OurusConfig.read({ [key]: 'x' }), `unknown option "${key}"`);
});

test('the extents of an empty note\'s root are an empty range at 0', () => {
  const doc = OurusDoc.parse('');
  assert.deepEqual(doc.coverRange(doc.rootNode), { from: 0, to: 0 });
  assert.deepEqual(doc.rangeOf(doc.rootNode), { from: 0, to: 0 });
  assert.equal(doc.markdownStart(doc.rootNode), 0);
});

test('the node index is built at any depth, and only whole', () => {
    const doc = OurusDoc.parse('>'.repeat(8000) + ' a', { config: { quotes: 'container' } });
    assert.doesNotThrow(() => doc.node(8000));
    assert.equal(doc.node(8000)!.kind, 'quote');
    assert.equal(doc.node(8000), doc.node(8000));
});

test('a node of another snapshot read through textOf caches nothing: no snapshot\'s text changes', () => {
    const before = OurusDoc.parse('first\n\nsecond');
    const stale = before.node(2)!;
    const after = before.update({ changes: [{ from: 0, to: 0, insert: 'intro\n\n' }] });
    // (a node of another snapshot, its lines another node's here: what is read there isn't cached)
    after.textOf(stale);
    assert.equal(before.textOf(stale)!.text, 'second');
    assert.equal(after.textOf(after.node(2)!)!.text, 'second');
});

test('markdownOf an empty range is no Markdown, at the text\'s end too', () => {
  for (const source of ['a\n', 'a\r\n', '> a\n', '- a\n']) {
    const doc = OurusDoc.parse(source);
    assert.equal(doc.markdownOf(source.length, source.length), '', JSON.stringify(source));
    assert.equal(doc.markdownOf(1, 1), '', JSON.stringify(source));
  }
});

test('a deletion that would change the outline keeps its padding held beside an unrelated held paragraph elsewhere', () => {
  // (the probes read the text with the other marks, as they are after the change: without them, the
  // held paragraph at 13 read otherwise, and the outline differed for that)
  const doc = OurusDoc.parse('- a b\n  - c\n\n\n\n\nq', { marks: { placeholders: [13] } });
  const edited = doc.update({ changes: [{ from: 2, to: 3, insert: '' }], caret: 2 });
  assert.equal(edited.text, '-  b\n  - c\n\n\n\n\nq');
  assert.deepEqual([...edited.marks.placeholders], [2, 12]);
  assert.deepEqual(edited.rootNode.children.map((n) => [n.kind, n.children.length]), doc.rootNode.children.map((n) => [n.kind, n.children.length]));
});
