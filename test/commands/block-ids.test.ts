// The block-id commands and the rule every command keeps (`dev/24-block-ids.md` §4.2, §5): what
// `addBlockId` and `removeBlockId` write, what a stray block id reads as, and the refusals of a
// command that would break what a block id names.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc, OurusProse, checkBlockIds } from '../../src/doc/index.ts';
import { executeCommand, settlePlaceholders, type OurusCommand, type OurusResult, OurusDeferred, OurusRejected, OurusSuccess } from '../../src/commands/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { createPlaceholder } from '../../src/text/index.ts';
import { MdFlavor, MdTree } from '../../src/parser/index.ts';
import fc from 'fast-check';
import type { OurusConfig } from '../../src/config.ts';
import { statusOf } from '../drawing.ts';

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
  return executeCommand(viewed, typeof command === 'function' ? command(viewed.doc) : command, { anchor: at, head: at });
}

/** The text after `command`, with the caret drawn `┃`; or `rejected <reason>`. */
function after(doc: OurusDoc, command: Command | ((doc: OurusDoc) => Command), at = 0): string {
  const r = run(doc, command, at);
  if (!(r instanceof OurusSuccess)) return `${statusOf(r)} ${r instanceof OurusRejected ? r.reason : ''}`.trim();
  const { head } = r.selection;
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
  // a name written twice: by its owner
  const twice = parse('a ^x\n\nb ^x\n');
  assert.equal(after(twice, { type: 'removeBlockId', name: 'x' }), 'rejected block-id');
  assert.equal(after(twice, (d) => ({ type: 'removeBlockId', name: 'x', node: d.rootNode.children[1]!.id })), '┃a ^x\n\nb\n');
  assert.equal(after(twice, { type: 'removeBlockId', name: 'nope' }), 'rejected block-id');
});

test('addBlockId: in the form the node takes; on the item for a block inside one; refused where one names it', () => {
  assert.equal(after(parse('## H\n\nbody\n'), { type: 'addBlockId', name: 'hh' }, 2), '##┃ H ^hh\n\nbody\n');
  // (a blank line between: a table, as HTML, would take in a line right under it)
  const table = run(parse('Para\n\n| a |\n| - |\n\nNext\n'), { type: 'addBlockId', name: 'tt' }, 7);
  assert.ok(table instanceof OurusSuccess);
  assert.equal(table.view.doc.text, 'Para\n\n| a |\n| - |\n\n^tt\n\nNext\n');
  assert.equal(table.view.doc.blockIds()[0]!.owner.kind, 'atom');
  const inner = run(parse('- a\n\n  inner\n- b\n'), { type: 'addBlockId', name: 'ii' }, 8);
  assert.ok(inner instanceof OurusSuccess);
  assert.equal(inner.view.doc.text, '- a ^ii\n\n  inner\n- b\n');
  // `^x8` is the paragraph's, but names the item: a second would shadow it
  assert.equal(after(parse('- a\n\n  inner prose ^x8\n'), { type: 'addBlockId', name: 'n' }, 1), 'rejected block-id');
  assert.equal(after(parse('a\n\nb ^n\n'), { type: 'addBlockId', name: 'n' }, 0), 'rejected block-id');
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

test('the rule: a command that would lose, move, retarget or shadow a block id refuses; declared moves, removals with their nodes and narrowing pass', () => {
  // two blocks with one name
  assert.equal(after(parse('- a ^x\n- b\n'), { type: 'duplicateSubtree' }, 3), '- a ^x\n- a┃\n- b\n');
  // a merge of two nodes with block ids
  assert.equal(after(parse('- a ^x\n- b ^y\n'), { type: 'deleteContentBackward' }, 9), 'rejected block-id');
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

test('joinBlockIds: merge keeps the node that stays\'s and says which went into which', () => {
  const r = run(parse('- a ^x\n- b ^y\n', { flavor: 'obsidian', joinBlockIds: 'merge' }), { type: 'deleteContentBackward' }, 9);
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

test('typing over a selection across nodes keeps the first node\'s block id', () => {
  const doc = parse('- ab ^x\n- cd\n');
  const r = executeCommand(OurusView.of(doc), { type: 'deleteContentBackward' }, { anchor: 3, head: 11 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '- ad ^x\n');
});

test('paste keeps a block id only where it is new; duplicate drops every one from the copy', () => {
  const r = executeCommand(OurusView.of(parse('- a ^x\n- b\n')), { type: 'paste', clipboard: { 'text/plain': '- c ^x\n- d ^z' } }, { anchor: 9, head: 9 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, '- a ^x\n- b\n- c\n- d ^z\n');
  const d = run(parse('- a\n\n  ^x\n  - c ^y\n- b\n'), { type: 'duplicateSubtree' }, 1);
  assert.ok(d instanceof OurusSuccess);
  assert.deepEqual(d.view.doc.blockIds().map((b) => b.name), ['x', 'y']);
});

test('with the caret on a block-id line, a command acts at the end of the text that carries it', () => {
  assert.equal(after(parse('## H\n\n^h2\n\nbody\n'), { type: 'enter' }, 8), '## H\n\n^h2\n\n┃\n\nbody\n');
  assert.ok(run(parse('## H\n\n^h2\n\nbody\n', { flavor: 'obsidian', markup: 'text' }), { type: 'deleteContentBackward' }, 8) instanceof OurusDeferred);
});

test('a command made of steps (a selection deleted, then a paste) declares what every step did', () => {
  // (the merge of the deletion, the paste's own nothing: links to ^x are to be redirected to ^y)
  const merged = executeCommand(OurusView.of(parse('- ab ^y\n- cd ^x\n', { flavor: 'obsidian', joinBlockIds: 'merge' })), { type: 'pastePlain', text: 'Z\nY' }, { anchor: 3, head: 11 });
  assert.ok(merged instanceof OurusSuccess);
  assert.equal(merged.view.doc.text, '- aZ\n  Yd ^y\n');
  assert.deepEqual(merged.mergedBlockIds, [{ from: 'x', into: 'y' }]);
  // (a move, which the check takes as declared)
  const moved = executeCommand(OurusView.of(parse('- ab\n- cd ^x\n')), { type: 'pastePlain', text: 'Z\nY' }, { anchor: 3, head: 8 });
  assert.ok(moved instanceof OurusSuccess);
  assert.equal(moved.view.doc.text, '- aZ\n  Yd ^x\n');
  assert.deepEqual(moved.movedBlockIds, [{ name: 'x', to: moved.view.doc.rootNode.children[0]!.id }]);
});

test('pasted text with a blank line into a named text: the block id stays on the first of the two', () => {
  assert.equal(after(parse('- ab ^x\n'), { type: 'pastePlain', text: 'Z\n\nY' }, 3), '- aZ ^x\n\n  Y┃b\n');
});

test('paste as text keeps a block id it brings where new, read where it lands: one ending no text there is text', () => {
  const enter: Partial<OurusConfig> = { flavor: 'obsidian', pastePlainLines: 'enter' };
  // (mid-text, `^x` is text, though the note holds ^x; at the text's end it would be a second ^x, and goes)
  assert.equal(drawn('p ^x\n\nbefore┃ after\n', { type: 'pastePlain', text: 'literal ^x' }, enter), 'p ^x\n\nbeforeliteral ^x┃ after\n');
  assert.equal(drawn('p ^x\n\nbefore┃\n', { type: 'pastePlain', text: 'literal ^x' }, enter), 'p ^x\n\nbeforeliteral┃\n');
  assert.equal(drawn('p ^x\n\n## a┃ ##\n', { type: 'pastePlain', text: 'b ^x' }, enter), 'p ^x\n\n## ab┃ ##\n');
  // (a new name stays, once)
  assert.equal(drawn('p ^x\n\nbefore┃\n', { type: 'pastePlain', text: 'a ^y\nb ^y' }, enter), 'p ^x\n\nbeforea ^y\n\nb┃\n');
  // (paste's plain lines, into the text at the caret)
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': 'a ^x\n' } }), 'p ^x\n\nqa\n┃\n');
});

test('paste of a block id the note holds: the rest is pasted, the line break too; where it lands as text, it is text', () => {
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': ' ^x\n' } }), 'p ^x\n\nq\n┃\n');
  assert.equal(drawn('- p ^x\n- a┃b\n', { type: 'paste', clipboard: { 'text/plain': '^x' } }), '- p ^x\n- a^x┃b\n');
  assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/plain': 'see [[#^x]] ^x\n' } }), 'p ^x\n\nqsee [[#^x]]\n┃\n');
});

test('paste: the block ids it wrote are told apart from the note\'s by name, not by where the changes are', () => {
  // (the note's own ^x stays on its node; the pasted one goes)
  assert.equal(drawn('1. a┃ ^x\n2. b\n', { type: 'paste', clipboard: { 'text/plain': 'a\n\n^x\n' } }), '1. aa┃\n    ^x\n2. b\n');
  // (over a selection: the note's block id isn't stood in for by the pasted one, which is text there)
  const enter: Partial<OurusConfig> = { flavor: 'obsidian', pastePlainLines: 'enter' };
  assert.equal(drawn('- ┃a┃ ^x\n- b\n', { type: 'pastePlain', text: 'q ^x\nr' }, enter), '- q ^x ^x\n- r┃\n- b\n');
  assert.equal(drawn('┃a b┃\n^x\n', { type: 'paste', clipboard: { 'text/plain': 'q ^x\n\nr ^y' } }), 'q ^x\n^x\n\nr ^y┃\n');
  // (over a subtree selection too)
  assert.equal(drawn('- a ^x\n┃- b┃\n', { type: 'pastePlain', text: 'q ^x' }), '- a ^x\n- q┃\n');
});

test('paste into code is code, all of it: what looks like a block id the note holds stays, alone too', () => {
  assert.equal(drawn('p ^x\n\n```\nco┃de\n```\n', { type: 'paste', clipboard: { 'text/plain': '^x\n' } }), 'p ^x\n\n```\nco^x\n┃de\n```\n');
  assert.equal(drawn('p ^x\n\n```\nco┃de\n```\n', { type: 'paste', clipboard: { 'text/plain': '^x' } }), 'deferredToHost');
});

test('under markup text, an edit inside one block id\'s markup is the user\'s for that one only: a selection reaching past it into another is checked', () => {
  const text: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'text' };
  // (inside ^x's markup: the host's)
  assert.equal(drawn('a ^┃x┃\n\nb ^y\n', { type: 'deleteContentBackward' }, text), 'deferredToHost');
  // (from it to the blank before ^y: the host's edit would glue ^y, `a ^^y`)
  assert.equal(drawn('a ^┃x\n\nb ┃^y\n', { type: 'deleteContentBackward' }, text), 'rejected block-id');
});

test('typing over a selection across nodes keeps the first\'s block id, as Backspace over it does', () => {
  assert.equal(drawn('- a┃b ^x\n- c┃d\n', { type: 'insertText', text: 'Z' }), '- aZ┃d ^x\n');
  assert.equal(drawn('- a┃b ^x\n- c┃d\n', { type: 'deleteContentBackward' }), '- a┃d ^x\n');
  // (inside one node, the selection takes it, the user's choice)
  assert.equal(drawn('- a┃b ^x┃\n- cd\n', { type: 'insertText', text: 'Z' }), 'deferredToHost');
});

test('paste: a mark is told from the same characters met where the paste joins the text, and a pasted block id ends its own paragraph', () => {
  assert.equal(drawn('before-pas┃ after\n', { type: 'paste', clipboard: { 'text/plain': 'ted ^x' } }), 'before-pasted ^x┃ after\n');
  assert.equal(drawn('q┃\n', { type: 'paste', clipboard: { 'text/markdown': 'a\n\nb ^x' } }), 'qa\n\nb ^x┃\n');
  // (the text's own stays with it)
  assert.equal(drawn('q┃ ^y\n', { type: 'paste', clipboard: { 'text/markdown': 'a\n\nb ^x' } }), 'qa ^y\n\nb ^x┃\n');
});

test('paste with seams open: a pasted block id the note holds goes before the seam is joined, not refused there', () => {
  const open: Partial<OurusConfig> = { flavor: 'obsidian', pasteSeams: 'open' };
  assert.equal(drawn('- a┃b ^x\n', { type: 'paste', clipboard: { 'text/plain': '- b ^x\n- c\n' } }, open), drawn('- a┃b ^x\n', { type: 'paste', clipboard: { 'text/plain': '- b\n- c\n' } }, open));
});

test('paste of HTML: a block id written with character references is one, kept only where new', () => {
  for (const html of ['<p>new &#94;x</p>', '<p>new &#x5E;&#120;</p>', '<p>new ^x</p>']) assert.equal(drawn('p ^x\n\nq┃\n', { type: 'paste', clipboard: { 'text/html': html } }), 'p ^x\n\nqnew┃\n', html);
});

test('a quote of one paragraph carrying a block-id line, split into two: refused, as a quote of several carries none', () => {
  assert.equal(drawn('> a┃\n> b\n\n^x\n', { type: 'shiftEnter' }), 'rejected block-id');
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

test('paste: what it declares of a pasted block id it drops, a name the note holds, goes with it', () => {
  const config: Partial<OurusConfig> = { flavor: 'obsidian', pasteSeams: 'open', joinBlockIds: 'merge' };
  const paste = (text: string, clipboard: string): OurusResult => {
    const i = text.indexOf('┃');
    return executeCommand(OurusView.of(parse(text.slice(0, i) + text.slice(i + 1), config)), { type: 'paste', clipboard: { 'text/plain': clipboard } }, { anchor: i, head: i });
  };
  for (const text of ['- a┃b ^q\n- original ^x\n', '- a┃b\n- original ^x\n']) {
    const r = paste(text, '- pasted ^x\n- tail\n');
    assert.ok(r instanceof OurusSuccess, text);
    assert.equal(r.mergedBlockIds, undefined, text);
    assert.equal(r.movedBlockIds, undefined, text);
  }
  // (a new one's move stands, by its own name)
  const r = paste('- a┃b\n- original ^x\n', '- pasted ^y\n- tail\n');
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.movedBlockIds?.map((m) => m.name), ['y']);
});

test('paste: a pasted block id merged away at the seam is the first of its name; one the host would paste twice into a note with none is kept once', () => {
  assert.equal(drawn('- a┃b ^q\n', { type: 'paste', clipboard: { 'text/plain': '- first ^z\n- second ^z\n' } }, { flavor: 'obsidian', pasteSeams: 'open', joinBlockIds: 'merge' }), '- afirst ^q\n- second┃b\n');
  assert.equal(drawn('┃\nbody\n', { type: 'paste', clipboard: { 'text/plain': '- a ^x\n- b ^x\n' } }), '- a ^x\n- b\n┃\nbody\n');
});

test('the check holds a command to what it declared: a block id moved names something where it did, a merge goes into a block id written', () => {
  const quotes = parse('b ^x\n\nc ^u\n', { flavor: 'obsidian', quotes: 'container' });
  // (into a quote of two paragraphs, the first's block id names nothing)
  const changes = [{ from: 0, to: 0, insert: '> ' }, { from: 5, to: 6, insert: '>\n> ' }];
  const quoted = quotes.update({ changes });
  const owner = quoted.blockIds()[0]!.owner.id;
  assert.equal(checkBlockIds(quotes, quoted, changes, { declared: { moved: [{ name: 'x', to: owner }], merged: [] } }), '^x would be moved to node 1, where it names nothing');
  const doc = parse('b ^x\n\nc ^u\n');
  const joined = [{ from: 1, to: 6, insert: '' }];
  const after = doc.update({ changes: joined });
  const moved = [{ name: 'u', to: doc.rootNode.children[0]!.id }];
  assert.equal(checkBlockIds(doc, after, joined, { declared: { moved, merged: [{ from: 'x', into: 'u' }] } }), null);
  assert.equal(checkBlockIds(doc, after, joined, { declared: { moved, merged: [{ from: 'x', into: 'zz' }] } }), "^x would be merged into ^zz, which isn't written");
  // (gone with its node only where the command says it removed that node)
  const two = parse('a\n\nb ^x\n');
  const [a, b] = two.rootNode.children;
  const removal = [{ from: 1, to: 7, insert: '' }];
  const one = two.update({ changes: removal });
  assert.equal(checkBlockIds(two, one, removal, { removed: [b!.id] }), null);
  assert.equal(checkBlockIds(two, one, removal, { removed: [a!.id] }), `^x would be lost from node ${b!.id}`);
});

test('a block id ends a text after a blank or a line break only, the same for the parser and the document', () => {
  for (const [text, id] of [['p ^x', true], ['p\t^x', true], ['p\u00a0^x', false], ['p^x', false]] as const) {
    assert.equal(parse(`${text}\n`).blockIds().length, id ? 1 : 0, JSON.stringify(text));
    assert.equal(MdTree.parse(`${text}\n`, MdFlavor.named('obsidian')).renderHtml().includes('^x'), !id, JSON.stringify(text));
  }
});

test('paste: of a name written twice on one node in what is pasted, the first stays', () => {
  const r = executeCommand(OurusView.of(parse('q\n')), { type: 'paste', clipboard: { 'text/markdown': '- a\n\n  ^x\n\n  ^x\n' } }, { anchor: 1, head: 1 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, 'q\n\n- a\n\n  ^x\n');
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
  const doc = OurusDoc.parse('-  a\n\n  ^x\n- b\n', { config: { flavor: 'obsidian' }, marks: [createPlaceholder(2)] });
  assert.equal(settlePlaceholders(OurusView.of(doc), doc.text.indexOf('- b') + 2)?.view.doc.text, '- a\n\n  ^x\n- b\n');
});

test('Shift-Enter at the end of a text carrying block-id lines: a line of the text before them, typed on as one', () => {
  for (const [start, want, typed] of [
    ['a┃\n\n^x\n', 'a\n┃\n\n^x\n', 'a\nz\n\n^x\n'],
    ['- a┃\n\n  ^x\n- b\n', '- a\n  ┃\n\n  ^x\n- b\n', '- a\n  z\n\n  ^x\n- b\n'],
  ] as const) {
    const at = start.indexOf('┃');
    const r = run(parse(start.replace('┃', '')), { type: 'shiftEnter' }, at);
    assert.ok(r instanceof OurusSuccess, start);
    const { head } = r.selection;
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

test('duplicate: a copy lined up anew where a copy of a block id alone isn\'t made keeps its lazy lines its text', () => {
  const r = run(parse('p\n- a\n1. ^x\n  - b\n  c\n'), { type: 'duplicateSubtree' }, 0);
  assert.ok(r instanceof OurusSuccess, r instanceof OurusRejected ? (r.detail ?? '') : '');
  assert.equal(r.view.doc.text, 'p\n- a\n1. ^x\n  - b\n  c\n\np\n- a\n- b\n    c\n');
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

test('duplicate in a loose list: a copy ending in a fence nothing closes, a block id alone not copied after it, takes no blank lines', () => {
  const r = run(parse('- ^x\n\n  - ```\n  ^y\n\n'), { type: 'duplicateSubtree' }, 0);
  assert.ok(r instanceof OurusSuccess, r instanceof OurusRejected ? (r.detail ?? '') : '');
  assert.equal(r.view.doc.text, '- ^x\n\n  - ```\n  ^y\n\n- \n\n  - ```\n');
});

test('a quote read as an atom joins as a join takes block ids: moved, merged or refused', () => {
  const atom = { flavor: 'obsidian', quotes: 'atom' } as const;
  const up = (t: string, c: Partial<OurusConfig> = {}): OurusResult => run(parse(t.replace('┃', ''), { ...atom, ...c }), { type: 'deleteContentBackward' }, t.indexOf('┃'));
  const moved = up('a\n\n┃> b\n\n^q\n');
  assert.ok(moved instanceof OurusSuccess);
  assert.equal(moved.view.doc.text, 'a> b\n\n^q\n');
  assert.deepEqual(moved.movedBlockIds, [{ name: 'q', to: moved.view.doc.rootNode.children[0]!.id }]);
  const merged = up('a ^a\n\n┃> b\n\n^q\n', { joinBlockIds: 'merge' });
  assert.ok(merged instanceof OurusSuccess);
  assert.equal(merged.view.doc.text, 'a> b ^a\n');
  assert.deepEqual(merged.mergedBlockIds, [{ from: 'q', into: 'a' }]);
  assert.ok(up('a ^a\n\n┃> b\n\n^q\n') instanceof OurusRejected);
  const into = up('> q\n\n┃b\n\n^y\n');
  assert.ok(into instanceof OurusSuccess);
  assert.equal(into.view.doc.text, '> qb\n\n^y\n');
});

test('paste into code is code: what looks like a block id the note has stays', () => {
  const r = executeCommand(OurusView.of(parse('p ^x\n\n```\n\n```\n')), { type: 'paste', clipboard: { 'text/markdown': '- literal ^x\n- next\n' } }, { anchor: 10, head: 10 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view.doc.text, 'p ^x\n\n```\n- literal ^x\n- next\n\n```\n');
});

test('a merge goes into the block id a link to the node uses: an item\'s, for a block inside it', () => {
  const t = '- a ^x\n\n  p ^y\n\nz ^z\n';
  const r = run(parse(t, { flavor: 'obsidian', joinBlockIds: 'merge' }), { type: 'deleteContentBackward' }, t.indexOf('z ^z'));
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.mergedBlockIds, [{ from: 'z', into: 'x' }]);
});

test('the check where a command reached finds a name the note has before a heading\'s closing `#`s', () => {
  const t = '## H ^x ##\n\n## Other\n\npara\n\nlast ^x tail\n';
  assert.ok(run(parse(t), { type: 'enter' }, t.indexOf(' tail')) instanceof OurusRejected);
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
  assert.equal(executeCommand(OurusView.of(parse('Above\n\nProse\n\n^p\n\nnext\n')), { type: 'cut' }, { anchor: 7, head: 12 }) instanceof OurusRejected, true);
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
  assert.equal(r.view.doc.text, '> first ^x\n>\n> second\n\n> first\n>\n> second\n');
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

test('plain paste of lines an Enter makes nodes of keeps their block ids only where new', () => {
  const t = '- a ^x\n- b\n';
  const r = run(parse(t, { flavor: 'obsidian', pastePlainLines: 'enter' }), { type: 'pastePlain', text: '- c ^x\n- d ^z' }, t.length - 1);
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.view.doc.blockIds().map((b) => b.name), ['x', 'z']);
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

/** The verdict of the check of block ids for `before` to `after`, read where the changes reached, and of the whole of both. */
function verdicts(before: OurusDoc, after: OurusDoc, changes: Parameters<typeof checkBlockIds>[2], allowed?: Parameters<typeof checkBlockIds>[3]): [boolean, boolean] {
  return [checkBlockIds(before, after, changes, allowed) === null, checkBlockIds(before, after, changes, allowed, true) === null];
}

test('the check of block ids where an edit reached agrees with the check of the whole document', () => {
  fc.assert(
    fc.property(arbBlockIdDoc, fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), fc.constantFrom('', '\n', '\n\n', '^id', ' ^q', 'x', '## ', '- ', '\n- y\n'), (text, f, g, insert) => {
      const doc = parse(text);
      const [from, to] = [Math.floor(f * doc.text.length), Math.floor(g * doc.text.length)].sort((a, b) => a - b) as [number, number];
      const changes = [{ from, to, insert }];
      const [region, whole] = verdicts(doc, doc.update({ changes }), changes);
      assert.equal(region, whole, `${JSON.stringify(insert)} over ${from}-${to} in ${JSON.stringify(doc.text)}`);
    }),
    { numRuns: RUNS, seed: SEED },
  );
});

test('a command applied keeps every block id, read where it reached or in the whole document', () => {
  fc.assert(
    fc.property(arbBlockIdDoc, fc.constantFrom(...COMMANDS), fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), (text, type, f, g) => {
      const doc = parse(text);
      const anchor = Math.floor(f * doc.text.length);
      const head = g < 0.7 ? anchor : Math.floor(g * doc.text.length);
      const r = executeCommand(OurusView.of(doc), { type } as Command, { anchor, head });
      // (no write-failed that block ids make: one the same text fails with them plain text is another bug's)
      const plain = (): OurusResult => executeCommand(OurusView.of(parse(text.replaceAll('^', 'q'))), { type } as Command, { anchor, head });
      if (r instanceof OurusRejected && r.reason === 'write-failed') assert.ok(plain() instanceof OurusRejected, `${type} at ${anchor}-${head} in ${JSON.stringify(doc.text)}: ${r.detail}`);
      if (!(r instanceof OurusSuccess) || anchor !== head) return;
      const declared = { moved: r.movedBlockIds ?? [], merged: r.mergedBlockIds ?? [] };
      assert.deepEqual(verdicts(doc, r.view.doc, r.changes, { declared, removed: r.removedNodes ?? [] }), [true, true], `${type} at ${anchor} in ${JSON.stringify(doc.text)}`);
    }),
    { numRuns: RUNS, seed: SEED },
  );
});

/** The configs the sequences run in: Obsidian's, with the options that change what holds block ids or what the keys do. */
const CONFIGS: Partial<OurusConfig>[] = [{}, { quotes: 'atom' }, { quotes: 'container' }, { markup: 'decorated' }, { listParent: 'block' }, { joinBlockIds: 'merge' }];

/** The block ids' names, each as many times as it is written. */
function names(doc: OurusDoc): Map<string, number> {
  const out = new Map<string, number>();
  for (const b of doc.blockIds()) out.set(b.name, (out.get(b.name) ?? 0) + 1);
  return out;
}

/** The block ids' names a link finds something by, each as many times as it is written so: naming a node or a list, not shadowed. */
function linked(doc: OurusDoc): Map<string, number> {
  const out = new Map<string, number>();
  for (const b of doc.blockIds()) if (b.target && !b.shadowed) out.set(b.name, (out.get(b.name) ?? 0) + 1);
  return out;
}

/** The pastes the sequences run: text with block ids, some of names the documents hold (`arbBlockIdDoc`'s), plain and as Markdown. */
const PASTES: Command[] = [
  ...['z ^id', 'z ^id\n', ' ^z\n', 'z ^new', 'a ^id\nb', 'a\n\n^id\n', '- a ^id\n- b ^new\n'].map((text): Command => ({ type: 'paste', clipboard: { 'text/plain': text } })),
  ...['z ^id', 'a ^id\nb ^id', '^id2'].map((text): Command => ({ type: 'pastePlain', text })),
];

test('a second check, by names alone: steps of commands, the host typing where they leave the caret, and settling lose no block id', () => {
  const command = fc.oneof(fc.constantFrom(...COMMANDS).map((type) => ({ type }) as Command), fc.constantFrom(...PASTES));
  const step = fc.record({ command, at: fc.double({ min: 0, max: 1, noNaN: true }), type2: fc.boolean(), settle: fc.double({ min: 0, max: 1, noNaN: true }) });
  fc.assert(
    fc.property(arbBlockIdDoc, fc.constantFrom(...CONFIGS), fc.array(step, { minLength: 1, maxLength: 4 }), (text, config, steps) => {
      let doc = parse(text, { flavor: 'obsidian', ...config });
      const trail: string[] = [JSON.stringify(doc.text)];
      for (const { command, at, type2, settle } of steps) {
        const { type } = command;
        const caret = Math.floor(at * doc.text.length);
        const before = names(doc);
        const r = executeCommand(OurusView.of(doc), command, { anchor: caret, head: caret });
        trail.push(`${type === 'paste' || type === 'pastePlain' ? JSON.stringify(command) : type}@${caret}`);
        if (!(r instanceof OurusSuccess)) continue;
        // (a name gone only with the nodes a command removes, or merged into another as declared)
        const after = names(r.view.doc);
        const merged = new Set((r.mergedBlockIds ?? []).map((m) => m.from));
        if (!r.removedNodes) for (const [name, n] of before) assert.ok((after.get(name) ?? 0) >= n || merged.has(name), `^${name} lost: ${trail.join(' → ')} → ${JSON.stringify(r.view.doc.text)}`);
        // (and a link by it still finds something; merged, one by the name it went into)
        const found = linked(r.view.doc);
        if (!r.removedNodes) for (const [name, n] of linked(doc)) assert.ok((found.get(name) ?? 0) >= n || (merged.has(name) && found.has(r.mergedBlockIds!.find((m) => m.from === name)!.into)), `a link by ^${name} finds nothing: ${trail.join(' → ')} → ${JSON.stringify(r.view.doc.text)}`);
        doc = r.view.doc;
        trail.push(JSON.stringify(doc.text));
        // the host typing where the command left the caret: what it typed is text, no block id's end
        // (in body text: in a block id, after it ending a text, on its line, the user edits markup; and
        // not at the start of a block's first line right under a text, where what is typed may make
        // the line that text's, lazily, Markdown's whatever the text ends with)
        const where = OurusView.of(doc).locate(r.selection.head);
        const inMarkup = where.zone === 'blockIdLine' || (where.zone === 'frame' && where.part === 'blockId') || (where.zone === 'text' && where.text instanceof OurusProse && where.text.frame.some((p) => p.part === 'blockId' && where.offset > p.from && where.offset <= p.to));
        const row = doc.lineAt(r.selection.head).index;
        const lazy = where.zone !== 'gap' && r.selection.head <= Math.max(doc.textStart(row), doc.mdTree.line(row).contentFrom) && row > 0 && !doc.isBlankLine(row - 1) && doc.nodeAtLine(row)?.startLine === row && doc.nodeAtLine(row - 1) !== doc.nodeAtLine(row);
        if (type2 && !inMarkup && !lazy) {
          const head = r.selection.head;
          // (as a host types: `insertText` first, its own where ourus defers, none where it refuses)
          const key = executeCommand(OurusView.of(doc), { type: 'insertText', text: 'z' }, { anchor: head, head });
          const typed = key instanceof OurusSuccess ? key.view.doc : key instanceof OurusRejected ? doc : doc.update({ changes: [{ from: head, to: head, insert: 'z' }], caret: head + 1 });
          for (const [name, n] of names(doc)) assert.ok((names(typed).get(name) ?? 0) >= n, `^${name} lost typing at the caret ${head}: ${trail.join(' → ')}`);
          for (const [name, n] of linked(doc)) assert.ok((linked(typed).get(name) ?? 0) >= n, `a link by ^${name} finds nothing typing at the caret ${head}: ${trail.join(' → ')}`);
          doc = typed;
          trail.push(`typed@${head} ${JSON.stringify(doc.text)}`);
        }
        // the caret moved elsewhere: the placeholders it left settled, no block id with them
        const settled = settlePlaceholders(OurusView.of(doc), Math.floor(settle * doc.text.length));
        if (settled) {
          for (const [name, n] of names(doc)) assert.ok((names(settled.view.doc).get(name) ?? 0) >= n, `^${name} lost settling: ${trail.join(' → ')} → ${JSON.stringify(settled.view.doc.text)}`);
          for (const [name, n] of linked(doc)) assert.ok((linked(settled.view.doc).get(name) ?? 0) >= n, `a link by ^${name} finds nothing settled: ${trail.join(' → ')} → ${JSON.stringify(settled.view.doc.text)}`);
          doc = settled.view.doc;
          trail.push(`settled ${JSON.stringify(doc.text)}`);
        }
      }
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
  const r = executeCommand(OurusView.of(doc), typeof command === 'function' ? command(doc) : command, { anchor: i, head: j >= 0 ? j : i });
  if (!(r instanceof OurusSuccess)) return `${statusOf(r)} ${r instanceof OurusRejected ? r.reason : ''}`.trim();
  return r.view.doc.text.slice(0, r.selection.head) + '┃' + r.view.doc.text.slice(r.selection.head);
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
  assert.equal(drawn('T ^x┃\n===\n', { type: 'duplicateSubtree' }), 'T ^x\n===\nT┃\n===\n');
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
  // (a paragraph that is only a block id: another would make it text)
  assert.equal(drawn('^id\n\npa┃ra\n', (d) => ({ type: 'addBlockId', name: 'new1', node: d.rootNode.children[0]!.id })), 'rejected block-id');
  // (the text holding the name again before it: removed, that one would end it)
  assert.equal(drawn('1. y ^z\nx ^id┃\n    ^id\n', { type: 'removeBlockId', name: 'id' }).split(' ')[0], 'rejected');
  // (a block inside an item, after its text, carries no block-id line: Backspace into the item above's body)
  assert.equal(drawn('- z\n- ┃a\n\n  ^x\n- b\n', { type: 'deleteContentBackward' }, { flavor: 'obsidian', backspaceAtItemStart: 'body' }), 'rejected not-expressible');
  // (a block-id line right under a quote that ends in a paragraph now is that paragraph's lazy line)
  const quote = executeCommand(OurusView.of(parse('> ## h\n^hh\n', { flavor: 'obsidian', quotes: 'atom' })), { type: 'shiftEnter' }, { anchor: 5, head: 5 });
  assert.ok(quote instanceof OurusSuccess);
  assert.equal(quote.view.doc.text, '> ## \n> h\n^hh\n');
  assert.deepEqual(quote.view.doc.blockIds().map((b) => [b.name, b.carried, b.owner.id]), [['hh', false, quote.view.doc.rootNode.children[0]!.id]]);
});

test('duplicate: an anchor in a copy whose first line a marker is written over, a block id alone not copied', () => {
  assert.equal(drawn('┃- - a\n\n  ^ii\n┃', { type: 'duplicateSubtree' }), '- - a\n\n  ^ii\n\n- - a\n┃');
  assert.equal(drawn('- a┃\n\n  ^ii\n  ```\n', { type: 'duplicateSubtree' }), '- a\n\n  ^ii\n  ```\n- a┃\n  ```\n');
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

test('a key left to the host whose edit would lose a block id is refused; under `markup: text`, an edit of its markup is the host\'s', () => {
  const D: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'decorated' };
  const T: Partial<OurusConfig> = { flavor: 'obsidian', markup: 'text' };
  // (the last character before it: a text that is only a block id, `^y` then another's, `^x` shadowed)
  assert.equal(drawn('p ^x\n\nq┃ ^y\n', { type: 'deleteContentBackward' }, D), 'rejected block-id');
  // (Delete at the end of the last text: the blank before it gone, glued)
  assert.equal(drawn('## p┃ ^x\n', { type: 'deleteContentForward' }, D), 'rejected block-id');
  // (a quote's `>` deleted with its text: the block id left naming nothing)
  assert.equal(drawn('┃> p┃ ^x\n', { type: 'deleteContentBackward' }, { ...D, quotes: 'container' }), 'rejected block-id');
  // (an edit of the block id's name, as text)
  assert.equal(drawn('p ^x┃\n', { type: 'deleteContentBackward' }, T), 'deferredToHost');
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
  const split = executeCommand(OurusView.of(parse('a\n\n^x\n\n# h\n', D)), { type: 'shiftEnter' }, { anchor: 1, head: 1 });
  assert.ok(split instanceof OurusSuccess);
  assert.ok(executeCommand(split.view, { type: 'insertText', text: 'z' }, split.selection) instanceof OurusDeferred);
});

test('addBlockId and removeBlockId with the caret in a marker: at the text\'s start, where it was', () => {
  assert.equal(drawn('┃- a\n- b\n', { type: 'addBlockId', name: 'nn' }), '- ┃a ^nn\n- b\n');
  assert.equal(drawn('┃- a ^nn\n- b\n', { type: 'removeBlockId', name: 'nn' }), '- ┃a\n- b\n');
});

test('duplicate: a copy without its block id, last in a quote, writes the blank lines after it outside the quote', () => {
  assert.equal(drawn('- > a ^┃x\n\n  > b ^y\n', { type: 'duplicateSubtree' }, { flavor: 'obsidian', quotes: 'container' }), '- > a ^x\n  >\n  > a┃\n\n  > b ^y\n');
});
