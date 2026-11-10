// The block-id commands and the rule every command keeps (`dev/24-block-ids.md` §4.2, §5): what
// `addBlockId` and `removeBlockId` write, what a stray block id reads as, and the refusals of a
// command that would break what a block id names.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc } from '../../src/doc/index.ts';
import { executeCommand, settlePlaceholders, type OurusCommand, type OurusResult, OurusDeferred, OurusFailed, OurusRejected, OurusSuccess } from '../../src/commands/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { MdFlavor, MdTree } from '../../src/parser/index.ts';
import fc from 'fast-check';
import type { OurusConfig } from '../../src/config.ts';
import { appliedText, assertApplied, executeAfter, executeOnText, resultStatus } from '../lib/index.ts';

type Command = OurusCommand;

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 900);
/** The property tests' seed: they play the same runs each time; `OURUS_FUZZ_SEED` plays others. */
const SEED = Number(process.env.OURUS_FUZZ_SEED ?? 1);

const TO: Partial<OurusConfig> = { flavor: 'obsidian', quotes: 'atom', listParent: 'block' };

function parse(text: string, config: Partial<OurusConfig> = { flavor: 'obsidian' }): OurusDoc {
  return OurusDoc.parse(text, { config });
}

/** `command` at `at`, in `view` (a document: in a view of nothing folded and no zoom). */
function run(view: OurusDoc | OurusView, command: Command | ((doc: OurusDoc) => Command), at = 0): OurusResult {
  const viewed = view instanceof OurusView ? view : OurusView.of(view);
  return executeCommand(viewed.withSelection(at), typeof command === 'function' ? command(viewed.doc) : command);
}

/** The text after `command`, with the caret drawn `┃`; or `rejected <reason>`. */
function after(doc: OurusDoc, command: Command | ((doc: OurusDoc) => Command), at = 0): string {
  const r = run(doc, command, at);
  if (!(r instanceof OurusSuccess)) return `${resultStatus(r)} ${r instanceof OurusRejected ? r.reason : ''}`.trim();
  const { head } = r.view.selection;
  return r.view.doc.text.slice(0, head) + '┃' + r.view.doc.text.slice(head);
}

test('a stray block id says what Obsidian names by it, and why that is no node it is on', () => {
  const doc = parse('Lead.\n- a\n- b\n\n^l2\n\n^s   \n\nAfter.\n\n^b\n## H\n', TO);
  assert.deepEqual(
    doc.blockIds().map((b) => [b.name, b.stray, b.target && ('list' in b.target ? `list@${b.target.list.startLine}` : b.target.startLine)]),
    [
      ['l2', 'whole-list', 'list@1'],
      ['s', 'trailing-space', null],
      ['b', 'block-below', null],
    ],
  );
  // text right under a block-id line joins it: no block id at all
  assert.deepEqual(parse('| a |\n| - |\n\n^t5\nMore text.\n').blockIds(), []);
});

test('attaching a stray block id is removing it, then adding it on the node: each checked', () => {
  const doc = parse('Lead.\n- a\n- b\n  - nested c\n\n^l2\n\nAfter.\n', TO);
  const removed = run(doc, { type: 'removeBlockId', name: 'l2' });
  assert.ok(removed instanceof OurusSuccess);
  assert.equal(after(removed.view.doc, (d) => ({ type: 'addBlockId', name: 'l2', node: d.rootNode.children[0]!.id })), 'Lead. ^l2┃\n- a\n- b\n  - nested c\n\nAfter.\n');
  assert.equal(after(removed.view.doc, (d) => ({ type: 'addBlockId', name: 'l2', node: d.nodeAtLine(3)!.id })), 'Lead.\n- a\n- b\n  - nested c ^l2┃\n\nAfter.\n');
  assert.equal(after(removed.view.doc, { type: 'addBlockId', name: 'l2', node: 999 }), 'rejected no-such-node');
});

test('removeBlockId: by name, or the one naming the selection\'s node; blank lines tidied', () => {
  // (the caret where it was)
  assert.equal(after(parse('Prose.\n\n^y1\n\n^y2\n\nAfter.\n'), { type: 'removeBlockId', name: 'y1' }), '┃Prose.\n\n^y2\n\nAfter.\n');
  assert.equal(after(parse('^first\n\nProse.\n'), { type: 'removeBlockId', name: 'first' }), '┃Prose.\n');
  assert.equal(after(parse('a ^x\n'), { type: 'removeBlockId' }, 1), 'a┃\n');
  assert.equal(after(parse('| a |\n| - |\n\n^t\n\nz\n'), { type: 'removeBlockId' }, 1), '|┃ a |\n| - |\n\nz\n');
  // inside an item, the item's
  assert.equal(after(parse('- a\n\n  inner prose ^x8\n'), { type: 'removeBlockId' }, 1), '-┃ a\n\n  inner prose\n');
  assert.equal(after(parse('- a\n- b\n'), { type: 'removeBlockId' }, 1), 'rejected block-id');
  // (a paragraph lazy after an item's definition, written at the item's column: the paragraph still the one it was)
  assert.equal(after(parse('* [a]:u\n x ^block'), { type: 'removeBlockId', name: 'block' }, 6), '* [a]:┃u\n  x');
  // a name written twice: by its owner
  const twice = parse('a ^x\n\nb ^x\n');
  assert.equal(after(twice, { type: 'removeBlockId', name: 'x' }), 'rejected block-id');
  assert.equal(after(twice, (d) => ({ type: 'removeBlockId', name: 'x', node: d.rootNode.children[1]!.id })), '┃a ^x\n\nb\n');
  assert.equal(after(twice, { type: 'removeBlockId', name: 'nope' }), 'rejected block-id');
});

test('addBlockId: in the form the node takes; on the item for a block inside one; a second where one names it, the first kept', () => {
  assert.equal(after(parse('## H\n\nbody\n'), { type: 'addBlockId', name: 'hh' }, 2), '##┃ H ^hh\n\nbody\n');
  // (a blank line between: a table, as HTML, would take in a line right under it)
  const table = run(parse('Para\n\n| a |\n| - |\n\nNext\n'), { type: 'addBlockId', name: 'tt' }, 7);
  assert.ok(table instanceof OurusSuccess);
  assert.equal(table.view.doc.text, 'Para\n\n| a |\n| - |\n\n^tt\n\nNext\n');
  assert.equal(table.view.doc.blockIds()[0]!.owner.kind, 'atom');
  const inner = run(parse('- a\n\n  inner\n- b\n'), { type: 'addBlockId', name: 'ii' }, 8);
  assert.ok(inner instanceof OurusSuccess);
  assert.equal(inner.view.doc.text, '- a ^ii\n\n  inner\n- b\n');
  // (`^x8` is the paragraph's, but names the item: a second written too, shadowing it, the host's to decide)
  assert.equal(after(parse('- a\n\n  inner prose ^x8\n'), { type: 'addBlockId', name: 'n' }, 1), '- ┃a ^n\n\n  inner prose ^x8\n');
  // (a text a block id ends: the second on a line of its own, both kept)
  assert.equal(after(parse('a ^x\n'), { type: 'addBlockId', name: 'n' }, 0), '┃a ^x\n\n^n\n');
  // (a name the note has already: written too, block ids not being unique)
  assert.equal(after(parse('a\n\nb ^n\n'), { type: 'addBlockId', name: 'n' }, 0), '┃a ^n\n\nb ^n\n');
  assert.equal(after(parse('a\n'), { type: 'addBlockId', name: 'no way' }, 0), 'rejected block-id');
  const made = run(parse('a\n'), { type: 'addBlockId' }, 0);
  assert.ok(made instanceof OurusSuccess && /^a \^[a-z0-9]{6}\n$/.test(made.view.doc.text));
});

test('a link to a node uses the block id naming it: an item\'s by any block id written in it', () => {
  const doc = parse('- a\n\n  inner prose ^x8\n- b ^b\n\nq\n\n^q1\n\n^q2\n');
  const named = (name: string) => doc.blockIds().find((b) => b.name === name)!;
  assert.equal(named('x8').target, doc.rootNode.children[0]);
  assert.equal(named('b').target, doc.rootNode.children[1]);
  assert.equal(named('q1').shadowed, true);
  assert.equal(named('q2').shadowed, false);
});

test('what commands do to block ids: a merge keeps the node that stays\'s, declared moves, removals with their nodes, narrowing', () => {
  // (two blocks with one name: no loss, block ids not being unique)
  assert.equal(after(parse('- a ^x\n- b\n'), { type: 'duplicateSubtree' }, 3), '- a ^x\n- a┃ ^x\n- b\n');
  // a merge of two nodes with block ids
  assert.equal(after(parse('- a ^x\n- b ^y\n'), { type: 'deleteContentBackward' }, 9), '- a┃b ^x\n');
  // into an item a paragraph becomes one, its block id still naming it
  assert.equal(after(parse('- a\n\npara ^p\n'), { type: 'indent' }, 5), '- a\n- ┃para ^p\n');
  // taking the other's: declared, a move
  assert.equal(after(parse('- a\n- b ^y\n'), { type: 'deleteContentBackward' }, 6), '- a┃b ^y\n');
  // with its node
  assert.equal(after(parse('- a ^x\n- b\n'), { type: 'deleteSubtree' }, 1), '- ┃b\n');
  // out of an item: narrowed to its own paragraph
  const doc = parse('- a\n\n  inner prose ^x8\n- b\n');
  const out = run(doc, { type: 'moveSubtree', nodes: [doc.rootNode.children[0]!.children[0]!.id], to: { parent: 'root', after: doc.rootNode.children[1]!.id } }, 0);
  assert.ok(out instanceof OurusSuccess);
  assert.equal(out.view.doc.text, '- a\n\n- b\n\ninner prose ^x8\n');
  assert.equal((out.view.doc.blockIds()[0]!.target as { kind: string }).kind, 'paragraph');
});

test('a join of two block ids keeps the node that stays\'s and says which went into which', () => {
  const r = run(parse('- a ^x\n- b ^y\n', { flavor: 'obsidian' }), { type: 'deleteContentBackward' }, 9);
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '- ab ^x\n');
  assert.deepEqual(r.mergedBlockIds, [{ from: 'y', into: 'x' }]);
});

test('a merge takes a lone carried line as ` ^id`, a tight list staying tight', () => {
  assert.equal(after(parse('- a\n- b\n\n  ^p3\n- c\n'), { type: 'deleteContentBackward' }, 6), '- a┃b ^p3\n- c\n');
  assert.equal(after(parse('- a\n- ^x\n'), { type: 'deleteContentBackward' }, 6), '- a┃ ^x\n');
});

test('a text that is only a block id is no empty node: Enter makes one after it', () => {
  assert.equal(after(parse('- a\n- ^x\n'), { type: 'enter' }, 8), '- a\n- ^x\n- ┃\n');
});

test('Backspace over a selection across nodes keeps the first node\'s block id; typing over it is the host\'s', () => {
  assert.equal(drawn('- a┃b ^x\n- c┃d\n', { type: 'deleteContentBackward' }), '- a┃d ^x\n');
  assert.equal(drawn('- a┃b ^x\n- c┃d\n', { type: 'insertText', text: 'Z' }), 'deferredToHost');
  assert.equal(drawn('- a┃b ^x┃\n- cd\n', { type: 'insertText', text: 'Z' }), 'deferredToHost');
});

test('paste and duplicate write block ids as they are, a name the note holds too: block ids needn\'t be unique', () => {
  const r = executeCommand(OurusView.of(parse('- a ^x\n- b\n'), { selection: 10 }), { type: 'paste', clipboard: { 'text/plain': '- c ^x\n- d ^z' } });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '- a ^x\n- b\n- c ^x\n- d ^z\n');
  const d = run(parse('- a\n\n  ^x\n  - c ^y\n- b\n'), { type: 'duplicateSubtree' }, 1);
  assert.ok(d instanceof OurusSuccess);
  assert.deepEqual(d.view.doc.blockIds().map((b) => b.name), ['x', 'y', 'x', 'y']);
});

test('with the caret on a block-id line, a command acts at the end of the text that carries it', () => {
  assert.equal(after(parse('## H\n\n^h2\n\nbody\n'), { type: 'enter' }, 8), '## H\n\n^h2\n\n┃\n\nbody\n');
  assert.ok(run(parse('## H\n\n^h2\n\nbody\n', { flavor: 'obsidian', markup: 'text' }), { type: 'deleteContentBackward' }, 8) instanceof OurusDeferred);
});

test('a command made of steps (a selection deleted, then a paste) declares what every step did', () => {
  // (the merge of the deletion, the paste's own nothing: links to ^x are to be redirected to ^y)
  const merged = executeCommand(OurusView.of(parse('- ab ^y\n- cd ^x\n', { flavor: 'obsidian' }), { selection: { anchor: 3, head: 11 } }), { type: 'pastePlain', text: 'Z\nY' });
  assert.ok(merged instanceof OurusSuccess);
  assert.equal(merged.view.doc.text, '- aZ\n  Yd ^y\n');
  assert.deepEqual(merged.mergedBlockIds, [{ from: 'x', into: 'y' }]);
  // (a move, which the check takes as declared)
  const moved = executeCommand(OurusView.of(parse('- ab\n- cd ^x\n'), { selection: { anchor: 3, head: 8 } }), { type: 'pastePlain', text: 'Z\nY' });
  assert.ok(moved instanceof OurusSuccess);
  assert.equal(moved.view.doc.text, '- aZ\n  Yd ^x\n');
  assert.deepEqual(moved.movedBlockIds, [{ name: 'x', to: moved.view.doc.rootNode.children[0]!.id }]);
});

test('pasted text with a blank line into a named text: the block id stays on the first of the two', () => {
  assert.equal(after(parse('- ab ^x\n'), { type: 'pastePlain', text: 'Z\n\nY' }, 3), '- aZ ^x\n\n  Y┃b\n');
});

test('paste as text writes a block id it brings as it is, read where it lands: one ending no text there is text', () => {
  const enter: Partial<OurusConfig> = { flavor: 'obsidian', pastePlainLines: 'enter' };
  // (mid-text, `^x` is text; at the text's end a block id, a second ^x)
  assert.equal(drawn('p ^x\n\nbefore┃ after\n', { type: 'pastePlain', text: 'literal ^x' }, enter), 'p ^x\n\nbeforeliteral ^x┃ after\n');
  assert.equal(drawn('p ^x\n\nbefore┃\n', { type: 'pastePlain', text: 'literal ^x' }, enter), 'p ^x\n\nbeforeliteral ^x┃\n');
  assert.equal(drawn('p ^x\n\n## a┃ ##\n', { type: 'pastePlain', text: 'b ^x' }, enter), 'p ^x\n\n## ab ^x┃ ##\n');
  // (a name twice in what is pasted: twice)
  assert.equal(drawn('p ^x\n\nbefore┃\n', { type: 'pastePlain', text: 'a ^y\nb ^y' }, enter), 'p ^x\n\nbeforea ^y\n\nb ^y┃\n');
  // (paste's plain lines, into the text at the caret)
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': 'a ^x\n' } }), 'p ^x\n\nqa ^x\n┃\n');
});

test('paste of a block id the note holds: written as it is, the line break too; where it lands as text, it is text', () => {
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': ' ^x\n' } }), 'p ^x\n\nq ^x\n┃\n');
  assert.equal(drawn('- p ^x\n- a┃b\n', { type: 'paste', clipboard: { 'text/plain': '^x' } }), '- p ^x\n- a^x┃b\n');
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': 'see [[#^x]] ^x\n' } }), 'p ^x\n\nqsee [[#^x]] ^x\n┃\n');
});

test('paste into code is code, all of it: what looks like a block id the note holds stays, alone too', () => {
  assert.equal(drawn('p ^x\n\n```\nco┃de\n```\n', { type: 'paste', clipboard: { 'text/plain': '^x\n' } }), 'p ^x\n\n```\nco^x\n┃de\n```\n');
  assert.equal(drawn('p ^x\n\n```\nco┃de\n```\n', { type: 'paste', clipboard: { 'text/plain': '^x' } }), 'deferredToHost');
});

test('under markup text, an edit inside a block id\'s markup is the host\'s, as is one reaching past it', () => {
  const text: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'text' };
  assert.equal(drawn('a ^┃x┃\n\nb ^y\n', { type: 'deleteContentBackward' }, text), 'deferredToHost');
  assert.equal(drawn('a ^┃x\n\nb ┃^y\n', { type: 'deleteContentBackward' }, text), 'deferredToHost');
});

test('paste: what is pasted joins the text as it is, and a pasted block id ends its own paragraph', () => {
  assert.equal(drawn('before-pas┃ after\n', { type: 'paste', clipboard: { 'text/plain': 'ted ^x' } }), 'before-pasted ^x┃ after\n');
  assert.equal(drawn('q┃\n', { type: 'paste', clipboard: { 'text/markdown': 'a\n\nb ^x' } }), 'qa\n\nb ^x┃\n');
  // (the text's own stays with it)
  assert.equal(drawn('q┃ ^y\n', { type: 'paste', clipboard: { 'text/markdown': 'a\n\nb ^x' } }), 'qa ^y\n\nb ^x┃\n');
});

test('paste with seams open: a seam joining a pasted block id to the text\'s is a join of two block ids, whatever their names: the text\'s kept', () => {
  const open: Partial<OurusConfig> = { flavor: 'obsidian', pasteSeams: 'open' };
  assert.equal(drawn('- a┃b ^x\n', { type: 'paste', clipboard: { 'text/plain': '- b ^x\n- c\n' } }, open), '- ab ^x\n- c┃b\n');
  assert.equal(drawn('- a┃b ^x\n', { type: 'paste', clipboard: { 'text/plain': '- b ^y\n- c\n' } }, open), '- ab ^x\n- c┃b\n');
});

test('paste of HTML: a `^name` in its text, as a character or a character reference, stays text, escaped: HTML carries no block ids', () => {
  for (const html of ['<p>new &#94;x</p>', '<p>new &#x5E;&#120;</p>', '<p>new ^x</p>']) assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/html': html } }, { flavor: 'obsidian' }), 'p ^x\n\nqnew \\^x┃\n', html);
});

test('a quote of one paragraph carrying a block-id line, split into two: the line goes to the second, its last block', () => {
  assert.equal(drawn('> a┃\n> b\n\n^x\n', { type: 'shiftEnter' }), '> a\n> ┃\n> b\n>\n> ^x\n');
});

test('workflowy\'s Enter mid-heading gives the heading\'s block-id lines to the heading', () => {
  assert.equal(drawn('## a┃b\n\n^h\n\npara\n', { type: 'enter' }, { flavor: 'obsidian', quirkEnterMidHeading: 'workflowy' }), 'a\n## ┃b\n\n^h\n\npara\n');
});

test('the whole document typed or pasted over goes, its block ids with it; a subtree pasted over, its nodes\' too', () => {
  assert.equal(drawn('┃- a ^x\n- b\n┃', { type: 'insertText', text: 'Z' }), 'deferredToHost');
  assert.equal(drawn('┃- a ^x\n- b\n┃', { type: 'pastePlain', text: 'Z' }), 'deferredToHost');
  assert.equal(drawn('┃- a ^x\n┃- b\n', { type: 'paste', clipboard: { 'text/plain': '- c\n' } }), '- c┃\n- b\n');
  // (and a paste that brings it back: the same node's name, the old one gone with its node)
  assert.equal(drawn('┃- a ^x\n┃- b\n', { type: 'paste', clipboard: { 'text/plain': '- c ^x\n' } }), '- c┃ ^x\n- b\n');
});

test('paste: a pasted block id merged away at the seam goes into the text\'s, another of its name stays; a name twice in what is pasted is written twice', () => {
  assert.equal(drawn('- a┃b ^q\n', { type: 'paste', clipboard: { 'text/plain': '- first ^z\n- second ^z\n' } }, { flavor: 'obsidian', pasteSeams: 'open' }), '- afirst ^q\n- second┃b ^z\n');
  assert.equal(drawn('┃\nbody\n', { type: 'paste', clipboard: { 'text/plain': '- a ^x\n- b ^x\n' } }), 'deferredToHost');
});

test('a block id ends a text after a blank or a line break only, the same for the parser and the document', () => {
  for (const [text, id] of [['p ^x', true], ['p\t^x', true], ['p\u00a0^x', false], ['p^x', false]] as const) {
    assert.equal(parse(`${text}\n`).blockIds().length, id ? 1 : 0, JSON.stringify(text));
    assert.equal(MdTree.parse(`${text}\n`, MdFlavor.named('obsidian')).renderHtml().includes('^x'), !id, JSON.stringify(text));
  }
});

test('paste: a name written twice on one node in what is pasted, both stay', () => {
  const r = executeCommand(OurusView.of(parse('q\n'), { selection: 1 }), { type: 'paste', clipboard: { 'text/markdown': '- a\n\n  ^x\n\n  ^x\n' } });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, 'q\n\n- a\n\n  ^x\n\n  ^x\n');
});

test('a caret on a block-id line outside the zoom: refused as outside it, not left to the host', () => {
  const doc = parse('- a\n\n  ^x\n- b\n  - c\n', { flavor: 'obsidian', markup: 'text' });
  const zoomed = OurusView.of(doc).withZoom(doc.rootNode.children[1]!.id);
  assert.deepEqual(run(zoomed, { type: 'insertText', text: 'q' }, 7), new OurusRejected('outside-zoom', 'the selection is outside the zoom'));
  // (inside it, the host's, as without a zoom)
  const inside = OurusView.of(doc).withZoom(doc.rootNode.children[0]!.id);
  assert.ok(run(inside, { type: 'insertText', text: 'q' }, 7) instanceof OurusDeferred);
});

test('settling a placeholder keeps the block-id lines of the text it is in', () => {
  // (the held space kept, the item's padding, its block-id line moved with it; or gone, `heldSpace: trim`)
  for (const [heldSpace, want] of [['repair', '-  a\n\n   ^x\n- b\n'], ['trim', '- a\n\n  ^x\n- b\n']] as const) {
    const doc = OurusDoc.parse('-  a\n\n  ^x\n- b\n', { config: { flavor: 'obsidian', heldSpace }, marks: { placeholders: [2] } });
    const settled = settlePlaceholders(OurusView.of(doc, { selection: doc.text.indexOf('- b') + 2 }))?.view.doc;
    assert.equal(settled?.text, want, heldSpace);
    assert.deepEqual(settled?.blockIds().map((b) => [b.name, b.owner.id]), [['x', settled!.rootNode.children[0]!.id]], heldSpace);
  }
});

test('Shift-Enter at the end of a text carrying block-id lines: a line of the text before them, typed on as one', () => {
  for (const [start, want, typed] of [
    ['a┃\n\n^x\n', 'a\n┃\n\n^x\n', 'a\nz\n\n^x\n'],
    ['- a┃\n\n  ^x\n- b\n', '- a\n  ┃\n\n  ^x\n- b\n', '- a\n  z\n\n  ^x\n- b\n'],
  ] as const) {
    const at = start.indexOf('┃');
    const r = run(parse(start.replace('┃', '')), { type: 'shiftEnter' }, at);
    assert.ok(r instanceof OurusSuccess, start);
    const { head } = r.view.selection;
    assert.equal(r.view.doc.text.slice(0, head) + '┃' + r.view.doc.text.slice(head), want);
    const next = r.view.doc.update({ changes: [{ from: head, to: head, insert: 'z' }], caret: head + 1 });
    assert.equal(next.text, typed);
    assert.deepEqual(next.blockIds().map((b) => [b.name, b.owner.id]), [['x', r.view.doc.rootNode.children[0]!.id]]);
  }
});

test('the blank lines after a text\'s block-id lines are its gap: Enter, Backspace and Shift-Enter there act as on any', () => {
  const start = '- a\n\n  ^x\n  ┃\n';
  const on = (type: 'enter' | 'deleteContentBackward' | 'shiftEnter'): string => after(parse(start.replace('┃', '')), { type }, start.indexOf('┃'));
  // (as after `- a⏎⏎  b`: the list loose, the line kept)
  assert.equal(on('enter'), '- a\n\n  ^x\n  \n- ┃\n');
  assert.equal(on('deleteContentBackward'), '- a┃\n\n  ^x\n');
  assert.equal(on('shiftEnter'), '- a\n\n  ^x\n\n  ┃\n');
});

test('a text retyped keeps its block-id lines: a checkbox given to a pasted item, a setext title made ATX, a quote unquoted', () => {
  const at = (t: string): [OurusDoc, number] => [parse(t.replace('┃', '')), t.indexOf('┃')];
  const [box, boxAt] = at('- [ ] ┃\n');
  assert.equal(after(box, { type: 'paste', clipboard: { 'text/markdown': '- b\n\n  ^new\n' } }, boxAt), '- [ ] b┃\n\n  ^new\n');
  const [setext, setextAt] = at('## A\n\n┃B\n---\n\n^x\n');
  assert.equal(after(setext, { type: 'indent' }, setextAt), '## A\n\n### ┃B\n\n^x\n');
  const [quote, quoteAt] = at('> ┃a\n\n^x\n');
  assert.equal(after(quote, { type: 'deleteContentBackward' }, quoteAt), '┃a\n\n^x\n');
});

test('a quote read as an atom joins as a join takes block ids: moved or merged', () => {
  const atom = { flavor: 'obsidian', quotes: 'atom' } as const;
  const up = (t: string, c: Partial<OurusConfig> = {}): OurusResult => run(parse(t.replace('┃', ''), { ...atom, ...c }), { type: 'deleteContentBackward' }, t.indexOf('┃'));
  const moved = up('a\n\n┃> b\n\n^q\n');
  assert.ok(moved instanceof OurusSuccess);
  assert.equal(moved.view.doc.text, 'a> b\n\n^q\n');
  assert.deepEqual(moved.movedBlockIds, [{ name: 'q', to: moved.view.doc.rootNode.children[0]!.id }]);
  const merged = up('a ^a\n\n┃> b\n\n^q\n');
  assert.ok(merged instanceof OurusSuccess);
  assert.equal(merged.view.doc.text, 'a> b ^a\n');
  assert.deepEqual(merged.mergedBlockIds, [{ from: 'q', into: 'a' }]);
  const into = up('> q\n\n┃b\n\n^y\n');
  assert.ok(into instanceof OurusSuccess);
  assert.equal(into.view.doc.text, '> qb\n\n^y\n');
});

test('paste into code is code: what looks like a block id the note has stays', () => {
  const r = executeCommand(OurusView.of(parse('p ^x\n\n```\n\n```\n'), { selection: 10 }), { type: 'paste', clipboard: { 'text/markdown': '- literal ^x\n- next\n' } });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, 'p ^x\n\n```\n- literal ^x\n- next\n\n```\n');
});

test('a merge goes into the block id a link to the node uses: an item\'s, for a block inside it', () => {
  const t = '- a ^x\n\n  p ^y\n\nz ^z\n';
  const r = run(parse(t, { flavor: 'obsidian' }), { type: 'deleteContentBackward' }, t.indexOf('z ^z'));
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.mergedBlockIds, [{ from: 'z', into: 'x' }]);
});

test('Backspace into an empty item above takes the text\'s block id with it, declared', () => {
  const r = run(parse('- \n- b ^y\n'), { type: 'deleteContentBackward' }, 5);
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '- b ^y\n');
  assert.deepEqual(r.movedBlockIds, [{ name: 'y', to: r.view.doc.rootNode.children[0]!.id }]);
});

test('a quote read as an atom reads no block id in its code: a copy keeps it as code', () => {
  const doc = parse('> ```\n> code ^x\n', { flavor: 'obsidian', quotes: 'atom' });
  assert.deepEqual(doc.blockIds(), []);
  const r = run(doc, { type: 'duplicateSubtree' }, 0);
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '> ```\n> code ^x\n\n> ```\n> code ^x\n');
});

test('on a block-id line, a key acting at the text\'s end that would be the host\'s is done there, not at the host\'s caret', () => {
  for (const [markup, t] of [['decorated', '- a\n\n  ^x┃\n- b\n'], ['decorated', '- a\n┃\n  ^x\n- b\n'], ['text', '- a\n┃\n  ^x\n- b\n']] as const) {
    assert.equal(after(parse(t.replace('┃', ''), { flavor: 'obsidian', markup }), { type: 'insertText', text: 'z' }, t.indexOf('┃')), '- az┃\n\n  ^x\n- b\n', `${markup} ${t}`);
  }
  // (under `markup: text`, on the line itself, the host edits it)
  assert.ok(run(parse('- a\n\n  ^x\n- b\n', { flavor: 'obsidian', markup: 'text' }), { type: 'insertText', text: 'z' }, 9) instanceof OurusDeferred);
});

test('a text carrying block-id lines is never emptied: it would be nothing on disk, its lines another\'s', () => {
  assert.ok(run(parse('p\n\n^x\n\nnext\n'), { type: 'deleteSoftLineBackward' }, 1) instanceof OurusRejected);
  assert.ok(run(parse('Above\n\nProse\n\n^p\n\nnext\n'), { type: 'cut' }, 7) instanceof OurusSuccess); // (a caret's cut: the node, whole)
  assert.equal(executeCommand(OurusView.of(parse('Above\n\nProse\n\n^p\n\nnext\n'), { selection: { anchor: 7, head: 12 } }), { type: 'cut' }) instanceof OurusRejected, true);
  // (Enter before a stray one with nothing above: the empty paragraph a placeholder holds carries nothing)
  const r = run(parse('^x\n\npara\n'), { type: 'enter' }, 0);
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.view.doc.blockIds().map((b) => [b.name, b.stray]), [['x', 'nothing-above']]);
});

test('typing at a block id: before one a text is only, with a blank; on the line after one, the id kept at its end', () => {
  const typed = (t: string): string => after(parse(t.replace('┃', '')), { type: 'insertText', text: 'z' }, t.indexOf('┃'));
  assert.equal(typed('- ┃^id\n'), '- z┃ ^id\n');
  assert.equal(typed('a\n┃^id\n'), 'a\nz┃ ^id\n');
  assert.equal(typed('- a ^id\n  ┃\n'), '- a\n  z┃ ^id\n');
  assert.equal(typed('para ^x\n┃\n\nnext\n'), 'para\nz┃ ^x\n\nnext\n');
  assert.equal(typed('p\n\n^id\n┃\n'), 'p\n\n^id\n\nz┃\n');
  assert.equal(typed('^id\n┃\n'), '^id\n\nz┃\n');
});

test('a quote read as an atom has a block id ending each paragraph in it; one not at its end names nothing', () => {
  const doc = parse('> first ^x\n>\n> second\n', { flavor: 'obsidian', quotes: 'atom' });
  assert.deepEqual(doc.blockIds().map((b) => [b.name, b.target]), [['x', null]]);
  const r = run(doc, { type: 'duplicateSubtree' }, 0);
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '> first ^x\n>\n> second\n\n> first ^x\n>\n> second\n');
});

test('on a block-id line, a key the host would insert text with inserts it at the text\'s end; one it would delete with refuses', () => {
  const doc = parse('p\n\n^id\n', { flavor: 'obsidian', markup: 'decorated' });
  const pasted = run(doc, { type: 'pastePlain', text: 'new' }, 4);
  assert.ok(pasted instanceof OurusSuccess);
  assert.equal(pasted.view.doc.text, 'pnew\n\n^id\n');
  assert.ok(run(doc, { type: 'deleteContentBackward' }, 4) instanceof OurusRejected);
});

test('a join into a quote read as an atom goes before the block id ending it', () => {
  const t = '> a ^q\n\nb\n';
  assert.equal(after(parse(t, { flavor: 'obsidian', quotes: 'atom' }), { type: 'deleteContentBackward' }, t.indexOf('b')), '> a┃b ^q\n');
});

test('plain paste of lines an Enter makes nodes of writes their block ids as they are, a name the note holds too', () => {
  const t = '- a ^x\n- b\n';
  const r = run(parse(t, { flavor: 'obsidian', pastePlainLines: 'enter' }), { type: 'pastePlain', text: '- c ^x\n- d ^z' }, t.length - 1);
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.view.doc.blockIds().map((b) => b.name), ['x', 'x', 'z']);
});

/**
 * Documents of blocks and block-id lines, as Obsidian writes them, at the top level, in items and in
 * quotes, with or without blank lines between (as `test/doc/outline.test.ts` makes them).
 */
const arbBlockIdDoc = fc
  .array(
    fc.tuple(
      fc.constantFrom('', '', '', '- ', '  ', '  - ', '> ', '1. '),
      fc.constantFrom('^id', '^id', '^id2', '^b-2', '^id ', 'x ^id', 'y ^z', 'a', 'b c', '## h', 'Title', '===', '| a |', '|---|', '```', 'code', '---', '[!note] T', '> q', '- x'),
      fc.constantFrom('\n', '\n', '\n\n', '\n\n'),
    ),
    { minLength: 1, maxLength: 12 },
  )
  .map((lines) => lines.map(([prefix, content, end]) => prefix + content + end).join(''));

const COMMANDS: Command['type'][] = ['enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'duplicateSubtree', 'deleteSubtree', 'cut'];

test('block ids make no command fail to write', () => {
  fc.assert(
    fc.property(arbBlockIdDoc, fc.constantFrom(...COMMANDS), fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), (text, type, f, g) => {
      const doc = parse(text);
      const anchor = Math.floor(f * doc.text.length);
      const head = g < 0.7 ? anchor : Math.floor(g * doc.text.length);
      const r = executeCommand(OurusView.of(doc, { selection: { anchor, head } }), { type } as Command);
      // (no write-failed that block ids make: one the same text fails with them plain text is another bug's)
      const plain = (): OurusResult => executeCommand(OurusView.of(parse(text.replaceAll('^', 'q')), { selection: { anchor, head } }), { type } as Command);
      if (r instanceof OurusFailed) assert.ok(plain() instanceof OurusRejected, `${type} at ${anchor}-${head} in ${JSON.stringify(doc.text)}: ${r.detail}`);
    }),
    { numRuns: RUNS, seed: SEED },
  );
});

/** `command` on `src`, its selection drawn `┃` (twice for a range): the text after it with the caret drawn, or `<status> <reason>`. */
function drawn(src: string, command: Command | ((doc: OurusDoc) => Command), config: Partial<OurusConfig> = { flavor: 'obsidian' }): string {
  const i = src.indexOf('┃');
  let text = src.slice(0, i) + src.slice(i + 1);
  const j = text.indexOf('┃');
  if (j >= 0) text = text.slice(0, j) + text.slice(j + 1);
  const doc = parse(text, config);
  const r = executeCommand(OurusView.of(doc, { selection: { anchor: i, head: j >= 0 ? j : i } }), typeof command === 'function' ? command(doc) : command);
  if (!(r instanceof OurusSuccess)) return `${resultStatus(r)} ${r instanceof OurusRejected ? r.reason : ''}`.trim();
  return r.view.doc.text.slice(0, r.view.selection.head) + '┃' + r.view.doc.text.slice(r.view.selection.head);
}

test('a caret a command leaves at a block id is before it, where what is typed next keeps it', () => {
  const ATOM: Partial<OurusConfig> = { flavor: 'obsidian', quotes: 'atom' };
  const DECORATED: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  // (a join into the text above: at the seam, not before the block id it ends with)
  assert.equal(drawn('p ^p1\n\n┃> q\n', { type: 'deleteContentBackward' }, ATOM), 'p┃> q ^p1\n');
  // (a setext title made ATX by Tab: at its text's end, before the block id)
  assert.equal(drawn('y ^z\n┃---\n', { type: 'indent' }), '### y┃ ^z\n');
  // (the block id removed from a setext title, or a copy of one without it: in the text, not the underline)
  assert.equal(drawn('T ^x┃\n===\n', { type: 'removeBlockId' }), 'T┃\n===\n');
  assert.equal(drawn('T ^x┃\n===\n', { type: 'duplicateSubtree' }), 'T ^x\n===\nT┃ ^x\n===\n');
  // (typing right before a block id, in a quote read as an atom)
  assert.equal(drawn('> q\n┃^id\n\nn\n', { type: 'insertText', text: 'z' }, ATOM), '> q\nz┃ ^id\n\nn\n');
  // (under `markup: decorated`, past the blank before it, which is the block id's to show: at the text's end)
  assert.equal(drawn('p ┃^x\n\nn\n', { type: 'insertText', text: 'z' }, DECORATED), 'pz┃ ^x\n\nn\n');
});

test('a caret in a block id ending a text, or right after it: the key acts at the text\'s end, a deletion too', () => {
  const DECORATED: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  assert.equal(drawn('p ^x┃\n\nn\n', { type: 'insertText', text: 'k' }, DECORATED), 'pk┃ ^x\n\nn\n');
  assert.equal(drawn('- ab ^x┃\n- b\n', { type: 'deleteContentBackward' }, DECORATED), '- a┃ ^x\n- b\n');
  // (none of the text left: no blank before the block id either)
  assert.equal(drawn('- a ^x┃\n- b\n', { type: 'deleteContentBackward' }, DECORATED), '- ┃^x\n- b\n');
  // (on a block-id line under `markup: text`, a deletion of the line break after it is no edit of the
  // line: Delete at the text's end, the next node joining it)
  assert.equal(drawn('p\n\n^f┃\n\npara\n', { type: 'deleteContentForward' }, { flavor: 'obsidian', markup: 'text' }), 'p┃para\n\n^f\n');
});

test('a join keeps a block id where its text\'s closing frame goes: before a heading\'s closing `#`s, a quote\'s line of its own unquoted', () => {
  assert.equal(drawn('## ^h ##\n\n┃para\n', { type: 'deleteContentBackward' }), '## ┃para ^h ##\n');
  assert.equal(drawn('para\n\n> ┃q\n> ^x\n', { type: 'deleteContentBackward' }, { flavor: 'obsidian', quotes: 'text' }), 'para\n\n┃q\n^x\n');
});

test('what the writer can\'t write with a block id is refused, not written wrong', () => {
  // (a footnote has no form a block id is written in here)
  assert.equal(drawn('[^1]: no┃te\n\nnext\n', { type: 'addBlockId', name: 'n' }), 'rejected not-expressible');
  // (nor carries one alone after it: the line would be the definition's text)
  assert.equal(drawn('┃^x\n[^a]:', { type: 'moveSubtreeDown' }, { flavor: 'obsidian' }), 'rejected not-expressible');
  assert.equal(drawn('[^1]: a footnote\n\n┃Final line ^blk\n', { type: 'deleteSoftLineBackward' }, { flavor: 'obsidian' }), 'rejected not-expressible');
  // (a paragraph that is only a block id: another would make it text)
  assert.equal(drawn('^id\n\npa┃ra\n', (d) => ({ type: 'addBlockId', name: 'new1', node: d.rootNode.children[0]!.id })), 'rejected block-id');
  // (the text holding the name again before it: removed, that one would end it)
  assert.equal(drawn('1. y ^z\nx ^id┃\n    ^id\n', { type: 'removeBlockId', name: 'id' }).split(' ')[0], 'rejected');
  // (a block inside an item, after its text, carries no block-id line: Backspace into the item above's body)
  assert.equal(drawn('- z\n- ┃a\n\n  ^x\n- b\n', { type: 'deleteContentBackward' }, { flavor: 'obsidian', backspaceAtItemStart: 'body' }), 'rejected not-expressible');
  // (a block-id line right under a quote that ends in a paragraph now is that paragraph's lazy line)
  const quote = executeCommand(OurusView.of(parse('> ## h\n^hh\n', { flavor: 'obsidian', quotes: 'atom' }), { selection: 5 }), { type: 'shiftEnter' });
  assert.ok(quote instanceof OurusSuccess);
  assert.equal(quote.view.doc.text, '> ## \n> h\n^hh\n');
  assert.deepEqual(quote.view.doc.blockIds().map((b) => [b.name, b.carried, b.owner.id]), [['hh', false, quote.view.doc.rootNode.children[0]!.id]]);
});

test('duplicate: a quote atom ending in `^x`: where the flavor has no block ids its text, the copy\'s caret after it; else its block id, the caret before it', () => {
  assert.equal(drawn('> a ^x┃', { type: 'duplicateSubtree' }, { quotes: 'atom', flavor: 'gfm' }), '> a ^x\n\n> a ^x┃');
  assert.equal(drawn('> a ^┃x', { type: 'duplicateSubtree' }, { quotes: 'atom', flavor: 'gfm' }), '> a ^x\n\n> a ^┃x');
  assert.equal(drawn('> a ^x┃', { type: 'duplicateSubtree' }, { quotes: 'atom', flavor: 'obsidian' }), '> a ^x\n\n> a┃ ^x');
});

test('duplicate: an anchor in a copy whose first line a marker is written over, its block-id line copied', () => {
  assert.equal(drawn('┃- - a\n\n  ^ii\n┃', { type: 'duplicateSubtree' }), '- - a\n\n  ^ii\n\n- - a\n\n  ^ii\n┃');
  assert.equal(drawn('- a┃\n\n  ^ii\n  ```\n', { type: 'duplicateSubtree' }), '- a\n\n  ^ii\n  ```\n- a┃\n\n  ^ii\n  ```\n');
});

test('paste over the whole text before a block id: the text replaced, the block id kept', () => {
  const paste = (md: string): Command => ({ type: 'paste', clipboard: { 'text/markdown': md, 'text/plain': md } });
  assert.equal(drawn('┃p┃\n\n^x\n\nnext\n', paste('zz')), 'zz┃\n\n^x\n\nnext\n');
  assert.equal(drawn('┃p┃ ^x\n\nnext\n', paste('zz')), 'zz┃ ^x\n\nnext\n');
  assert.equal(drawn('- ┃p┃\n\n  ^x\n- next\n', paste('zz')), '- zz┃\n\n  ^x\n- next\n');
  // (items pasted there: where the block id would go is no one's to say)
  assert.equal(drawn('┃p┃\n\n^x\n\nnext\n', paste('- a\n- b')), 'rejected not-expressible');
});

test('typing at a marker\'s line whose text is below it: on that line, the block id the text ends with kept', () => {
  assert.equal(drawn('- a\n-┃\n  ^ll\n', { type: 'insertText', text: 'z' }), '- a\n- z┃\n  ^ll\n');
});

test('a key left to the host is the host\'s, whatever its edit does to a block id', () => {
  const D: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  // (the last character before it; Delete at the end of the last text; a quote's `>` deleted with its text)
  assert.equal(drawn('p ^x\n\nq┃ ^y\n', { type: 'deleteContentBackward' }, D), 'deferredToHost');
  assert.equal(drawn('## p┃ ^x\n', { type: 'deleteContentForward' }, D), 'deferredToHost');
  assert.equal(drawn('┃> p┃ ^x\n', { type: 'deleteContentBackward' }, { ...D, quotes: 'container' }), 'deferredToHost');
  // (an edit of the block id's name, as text)
  assert.equal(drawn('p ^x┃\n', { type: 'deleteContentBackward' }, { flavor: 'obsidian', markup: 'text' }), 'deferredToHost');
});

test('a block id on a line of its own ending a text: Backspace at it, or Delete before it, joins the lines', () => {
  assert.equal(drawn('p\n┃^x\n', { type: 'deleteContentBackward' }), 'p┃ ^x\n');
  assert.equal(drawn('p┃\n^x\n', { type: 'deleteContentForward' }), 'p┃ ^x\n');
});

test('what is typed or pasted at a block id is placed as typing places it', () => {
  const D: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  const paste = (md: string): Command => ({ type: 'paste', clipboard: { 'text/markdown': md, 'text/plain': md } });
  // (right after one in a quote read as an atom: before it)
  assert.equal(drawn('> p ^x┃\n', { type: 'insertText', text: 'z' }, { ...D, quotes: 'atom' }), '> pz┃ ^x\n');
  // (right before one: with a blank between)
  assert.equal(drawn('- ┃^x\n', { type: 'pastePlain', text: 'Q' }, D), '- Q┃ ^x\n');
  assert.equal(drawn('p\n┃^x\n', paste('Q'), D), 'p\nQ┃ ^x\n');
  // (at a marker's line whose text is below it: on that line)
  assert.equal(drawn('-┃\n  x ^x\n', { type: 'pastePlain', text: 'Q' }, D), '- Q┃\n  x ^x\n');
  // (pasted over the text before one, starting with a blank: the caret after what is pasted)
  assert.equal(drawn('┃p┃ ^x\n', paste(' Q'), D), 'Q┃ ^x\n');
  assert.equal(drawn('- ┃p┃ ^x\n', paste('Q'), D), '- Q┃ ^x\n');
  // (typed over the text and its block id, a selection of text: the host's, which takes both)
  assert.equal(drawn('┃p ^x┃\n\nq\n', { type: 'insertText', text: 'z' }, D), 'deferredToHost');
});

test('a caret on a block-id line: a deletion acts on no other line; typing on the blank line Shift-Enter makes is a line of the text', () => {
  const D: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  assert.equal(drawn('> p\n\n^x┃\n', { type: 'deleteContentBackward' }, { ...D, quotes: 'text' }), 'rejected not-expressible');
  const split = executeCommand(OurusView.of(parse('a\n\n^x\n\n# h\n', D), { selection: 1 }), { type: 'shiftEnter' });
  assert.ok(split instanceof OurusSuccess);
  assert.ok(executeCommand(split.view, { type: 'insertText', text: 'z' }) instanceof OurusDeferred);
});

test('addBlockId and removeBlockId with the caret in a marker: at the text\'s start, where it was', () => {
  assert.equal(drawn('┃- a\n- b\n', { type: 'addBlockId', name: 'nn' }), '- ┃a ^nn\n- b\n');
  assert.equal(drawn('┃- a ^nn\n- b\n', { type: 'removeBlockId', name: 'nn' }), '- ┃a\n- b\n');
});

test('addBlockId after a text ending in a no-break space: a blank before it still, which only a space or a tab is', () => {
  for (const space of [' ', '　']) {
    assert.equal(drawn(`para${space}┃\n`, { type: 'addBlockId', name: 'abc' }), `para${space}┃ ^abc\n`);
    assert.equal(drawn(`- a${space}┃\n`, { type: 'addBlockId', name: 'abc' }), `- a${space}┃ ^abc\n`);
  }
});

test('a plain paste of several paragraphs into a text a block id ends: the id stays on the first, the caret in the text', () => {
  const doc = parse('  ```js\n  ```\n  Final ^blk', { flavor: 'obsidian' });
  for (const at of [20, 21]) {
    const r = executeCommand(OurusView.of(doc, { selection: at }), { type: 'pastePlain', text: '```\n\n| 1 | 2 |\n\nFinal ^zzz' });
    assert.ok(r instanceof OurusSuccess);
    assert.ok(r.view.selection.head <= r.view.doc.text.length, `caret ${r.view.selection.head} past ${r.view.doc.text.length}`);
    assert.ok(!r.view.doc.text.includes('| 1 | 2 | ^'), JSON.stringify(r.view.doc.text));
    assert.ok(r.view.doc.text.includes('``` ^blk'), JSON.stringify(r.view.doc.text));
    // (the pasted duplicate dropped, the rest of the line not glued to it)
    assert.ok(!r.view.doc.text.includes('^blkl'), JSON.stringify(r.view.doc.text));
  }
});

test('a plain paste ending in a line break, before a block id, keeps the caret in a note with no final line break', () => {
  const result = assertApplied(executeOnText('Final line ^blk', { type: 'pastePlain', text: 'a\n\nb\n' }, { caret: 10, config: { flavor: 'obsidian' } }));
  assert.equal(result.view.doc.text, 'Final linea ^blk\n\nb');
  assert.equal(result.view.selection.head, result.view.doc.text.length);
});

test('a plain paste of paragraphs ending in blanks, before a block id, drops them: the id ends the first, the caret after the last', () => {
  const obsidian = { flavor: 'obsidian' } as const;
  // (a space, a tab, several, and a line break after them: all as the paste without them)
  for (const ending of [' ', '\t', '  ', ' \n', '\n  ']) {
    const result = assertApplied(executeOnText('a ^id', { type: 'pastePlain', text: `a\n\nb${ending}` }, { caret: 1, config: obsidian }));
    assert.equal(result.view.doc.text, 'aa ^id\n\nb', JSON.stringify(ending));
    assert.deepEqual(result.view.selection, { anchor: 9, head: 9 }, JSON.stringify(ending));
  }
  // (no paragraph break: the id still ends the text, the caret after what was pasted)
  const lines = assertApplied(executeOnText('a ^id', { type: 'pastePlain', text: 'x\ny ' }, { caret: 1, config: obsidian }));
  assert.equal(lines.view.doc.text, 'ax\ny ^id');
  assert.deepEqual(lines.view.selection, { anchor: 4, head: 4 });
  // (pasted after the id, as typing there puts it: before it)
  const after = assertApplied(executeOnText('a ^id', { type: 'pastePlain', text: 'a\n\nb ' }, { caret: 5, config: obsidian }));
  assert.equal(after.view.doc.text, 'a a ^id\n\nb');
  assert.deepEqual(after.view.selection, { anchor: 10, head: 10 });
  // (without a block id the blanks are the host's text, kept)
  assert.equal(appliedText(executeOnText('a', { type: 'pastePlain', text: 'a\n\nb ' }, { caret: 1, config: obsidian })), 'aa\n\nb ');
});

test('a pasted line of two block ids, the last a name the note holds: as it is, the last its block id', () => {
  assert.equal(appliedText(executeOnText('^b', { type: 'paste', clipboard: { 'text/markdown': '- ^a ^b' } }, { config: { flavor: 'obsidian' } })), '^b\n\n- ^a ^b');
});

test('removeBlockId with a node removes that node\'s id, wherever the selection is', () => {
  assert.equal(appliedText(executeOnText('a ^x\n\nb ^y', { type: 'removeBlockId', node: 2 }, { config: { flavor: 'obsidian' } })), 'a ^x\n\nb');
  const result = executeOnText('a ^x\n\nb ^y', { type: 'removeBlockId', node: 9 }, { config: { flavor: 'obsidian' } });
  assert.ok(result instanceof OurusRejected && result.reason === 'no-such-node');
});

test('edits made beside a block id use the note\'s line ending: CRLF and lone-CR notes as LF ones', () => {
  const obsidian = { flavor: 'obsidian' } as const;
  // typing on the blank line under a block-id paragraph: a paragraph of its own, a blank line between
  assert.equal(appliedText(executeOnText('^d\r\n\r\n', { type: 'insertText', text: 'x' }, { caret: 4, config: obsidian })), '^d\r\n\r\nx\r\n');
  assert.equal(appliedText(executeOnText('^d\r\r', { type: 'insertText', text: 'x' }, { caret: 3, config: obsidian })), '^d\r\rx\r');
  // the host's Enter over a lone CR, a line break of the note's: the id still on its line, the host's
  assert.ok(executeOnText('^d\r\rb', { type: 'enter' }, { anchor: 3, head: 4, config: obsidian }) instanceof OurusDeferred);
  // a lone CR typed after a block id is a line break, as an LF: the host's
  assert.ok(executeOnText('p ^id\n\n\nq', { type: 'insertText', text: '\r' }, { caret: 6, config: obsidian }) instanceof OurusDeferred);
  // typing on the blank line before a decorated carried id: at the text's end, the line after a CRLF
  assert.equal(appliedText(executeOnText('```\r\nx\r\n```\r\n\r\n^id', { type: 'insertText', text: 'y' }, { caret: 13, config: { ...obsidian, markup: 'decorated' } })), '```\r\nxy\r\n```\r\n\r\n^id');
});

test('Backspace beside a decorated block id takes a whole character: an emoji with its joiners, a letter with its accent, a flag', () => {
  const decorated = { flavor: 'obsidian', markup: 'decorated' } as const;
  for (const char of ['👩\u200d💻', 'e\u0301', '🇫🇷', '👍🏽']) {
    const text = `x${char} ^id`;
    const result = assertApplied(executeOnText(text, { type: 'deleteContentBackward' }, { caret: text.length, config: decorated }));
    assert.equal(result.view.doc.text, 'x ^id');
    assert.deepEqual(result.view.selection, { anchor: 1, head: 1 });
  }
});

test('a block id\'s name another id has, typed in its markup or outside any: the host\'s, block ids not being unique', () => {
  const source = '## table\n- abc ^id\n- def ^i';
  const typed = executeOnText(source, { type: 'insertText', text: 'd' }, { caret: source.length, config: { flavor: 'obsidian', markup: 'text' } });
  assert.ok(typed instanceof OurusDeferred, typed.constructor.name);
  const outside = executeOnText('a ^id\n\nb', { type: 'insertText', text: ' ^id' }, { caret: 8, config: { flavor: 'obsidian', markup: 'text' } });
  assert.ok(outside instanceof OurusDeferred, outside.constructor.name);
});

test('a drop from outside of a list copied from inside one, indented, keeps its block ids, a name the note holds too', () => {
  for (const clipboard of ['    - c ^x\n    - d\n', '\t- c ^x\n\t- d\n']) {
    assert.equal(appliedText(executeOnText('- a ^x\n- b\n', { type: 'pasteAt', clipboard: { 'text/plain': clipboard }, at: { parent: 'root', after: 2 } }, { config: { flavor: 'obsidian' } })), '- a ^x\n- b\n- c ^x\n- d\n', clipboard);
  }
});

test('a copy of a block id naming what its original names shadows nothing a link finds: the same name, the same block', () => {
  // (`^x` after the quote's list names the list; its copy too)
  assert.equal(appliedText(executeOnText('# h\n> - \n> ^x\n', { type: 'duplicateSubtree' }, { caret: 13, config: { flavor: 'obsidian' } })), '# h\n> - \n> ^x\n>\n> ^x\n');
});

test('a drag from outside of a block id alone offers only the places its drop pastes at: not right after a block, whose block-id line it would be', () => {
  const drag = executeOnText('p ^id\n\nq', { type: 'drag', clipboard: { 'text/markdown': '^id\n' } }, { config: { flavor: 'obsidian' } });
  assert.ok(drag instanceof OurusSuccess);
  const points = drag.dropMap!.seams.flatMap((seam) => seam.points);
  assert.ok(points.length > 0);
  for (const point of points) assert.ok(executeCommand(drag.view.withSelection(0), point.drop) instanceof OurusSuccess, JSON.stringify(point.drop));
});

test('Enter keeps a block id naming a quote at its end, as a text editor\'s leaves it at the line\'s end; at its very end it stays on its block; a copy keeps it as written, as any copy does (B223)', () => {
  const ob: Partial<OurusConfig> = { flavor: 'obsidian' };
  const container: Partial<OurusConfig> = { flavor: 'obsidian', quotes: 'container' };
  // (Enter mid-line: the id with the lower half, at the quote's end)
  assert.equal(drawn('> [!note] t\n> bo┃dy ^id', { type: 'enter' }, ob), '> [!note] t\n> bo\n>\n> ┃dy ^id');
  assert.equal(drawn('> [!note] t\n> bo┃dy\n^id', { type: 'enter' }, ob), '> [!note] t\n> bo\n>\n> ┃dy ^id');
  // (a copy after it: both keep it, the original's naming its block now, the copy's the quote)
  assert.equal(drawn('> # h ^id┃', { type: 'duplicateSubtree' }, ob), '> # h ^id\n> # h┃ ^id');
  assert.equal(drawn('> a\n>\n> x ^id┃', { type: 'duplicateSubtree' }, ob), '> a\n>\n> x ^id\n>\n> x┃ ^id');
  assert.equal(drawn('p\n\n> x ^id┃\n\nq', { type: 'duplicateSubtree' }, container), 'p\n\n> x ^id\n>\n> x┃ ^id\n\nq');
  assert.equal(drawn('> [!note] t\n> x ^id┃', { type: 'duplicateSubtree' }, container), '> [!note] t\n> x ^id\n>\n> x┃ ^id');
  // (Enter at its very end: the id on its block, an empty paragraph after it; typed on, it names nothing,
  // as in Obsidian, the host typing)
  assert.equal(drawn('> a\n>\n> b┃ ^id', { type: 'enter' }, ob), '> a\n>\n> b ^id\n>\n> ┃');
  const entered = executeOnText('> a\n>\n> b ^id', { type: 'enter' }, { caret: 9, config: ob });
  assert.ok(executeAfter(entered, { type: 'insertText', text: 'z' }) instanceof OurusDeferred);
});

test('a paste over all of a text a block id ends joins it, the id staying with it, as a split keeps it with the node the caret was in (B342)', () => {
  const pasted = (clip: string, type: 'paste' | 'pastePlain' = 'paste'): string =>
    appliedText(executeOnText('a b\n^x\n', type === 'paste' ? { type, clipboard: { 'text/plain': clip } } : { type, text: clip }, { anchor: 0, head: 3, config: { flavor: 'obsidian' } }));
  // (deleted first, `^x` was a paragraph of its own, which the paste's last line ended in: `r ^y^x`)
  assert.equal(pasted('q ^x\n\nr ^y'), 'q ^x\n^x\n\nr ^y\n');
  assert.equal(pasted('q ^x\n\nr ^y', 'pastePlain'), 'q ^x\n^x\n\nr ^y\n');
  assert.equal(pasted('q\n\nr'), 'q\n^x\n\nr\n');
});
