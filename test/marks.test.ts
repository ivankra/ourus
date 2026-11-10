// The `auto` marks (dev/26-marks.md): characters ourus put in for the user, which it may take out again.
// What makes them, how they move, when they go, and what acts on them: the escapes the writer puts
// in a text, and the blank lines `done()` raises where Markdown needs them. A mark says where a
// character came from, never what the text is: no outline reads differently for one.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executeCommand, OurusDeferred, OurusSuccess, settlePlaceholders, type OurusCommand, type OurusResult } from '../src/commands/index.ts';
import { OurusDoc, OurusProse } from '../src/doc/index.ts';
import { OurusDraft } from '../src/writer/index.ts';
import { OurusView } from '../src/view/index.ts';
import { allNodes, nodePlainText, executeOnText, assertApplied } from './lib/index.ts';
import { MarkError } from '../src/text/index.ts';

const shape = (doc: OurusDoc) => allNodes(doc).map((n) => `${n.kind}:${nodePlainText(doc, n).replace(/\n/g, '|')}`).join(' ');
/** A document's auto marks, each with the character it is on: `\` an escape, `⏎` a line break. */
const autoOf = (doc: OurusDoc): string[] => doc.marks.auto.map((pos) => `${/[\r\n]/.test(doc.text[pos]!) ? '⏎' : doc.text[pos]}@${pos}`);
const keys = (view: OurusView, steps: readonly (readonly [OurusCommand, number])[]): OurusView => {
  for (const [command, at] of steps) view = assertApplied(executeCommand(view.withSelection(at), command)).view;
  return view;
};
const enter = { type: 'enter' } as const;
const back = { type: 'deleteContentBackward' } as const;

test('the document keeps an auto mark that holds, maps it through a host edit, and drops it where it no longer does', () => {
  const doc = OurusDoc.parse('a\n\nb\n', { marks: { auto: [2] } });
  assert.deepEqual(autoOf(doc), ['⏎@2']);
  assert.deepEqual(autoOf(doc.update({ changes: [{ from: 0, to: 0, insert: 'xy' }] })), ['⏎@4']);
  assert.deepEqual(autoOf(doc.update({ changes: [{ from: 2, to: 2, insert: ' ' }] })), ['⏎@3'], 'a blank typed at its line\'s start: it moves on, its line blank still');
  assert.deepEqual(autoOf(doc.update({ changes: [{ from: 2, to: 3, insert: '' }] })), [], 'its character taken out: gone');
  // a mark its character doesn't hold is dropped as it is read: a line break of a line with text, a backslash ending the text
  assert.deepEqual(autoOf(OurusDoc.parse('a\n\nb\n', { marks: { auto: [1] } })), []);
  assert.deepEqual(autoOf(OurusDoc.parse('a\\', { marks: { auto: [1] } })), []);
  // one on a character it can never be on: the list is corrupt, refused
  assert.throws(() => OurusDoc.parse('a b', { marks: { auto: [1] } }), MarkError);
  assert.deepEqual(autoOf(OurusDoc.parse('a\r\n\r\nb', { marks: { auto: [1, 4] } })), ['⏎@4'], 'in CRLF: the line\'s own break, the blank line\'s');
  assert.deepEqual(autoOf(OurusDoc.parse('a\r\nb', { marks: { auto: [2] } })), [], 'a CRLF\'s second character, of a line with text');
});

test('typing on a blank line ourus raised makes it the user\'s', () => {
  const doc = OurusDoc.parse('a\n\nb\n', { marks: { auto: [2] } });
  assert.deepEqual(autoOf(doc.update({ changes: [{ from: 2, to: 2, insert: 'x' }] })), []);
});

test('an auto mark changes no reading, and no placeholder is read from one', () => {
  const text = '- a\n\n  - b\n\\- c\n';
  const marked = OurusDoc.parse(text, { marks: { auto: [4, 11] } });
  assert.deepEqual(autoOf(marked), ['⏎@4', '\\@11']);
  assert.equal(shape(marked), shape(OurusDoc.parse(text)));
  assert.deepEqual(marked.marks.placeholders, []);
  // a placeholder beside them is still read
  const held = OurusDoc.parse('- a\n\n- ', { marks: { placeholders: [7], auto: [4] } });
  assert.deepEqual(held.marks.placeholders, [7]);
});

test('a mark that comes or goes with no change to the text is read again in its node: the cached text never keeps one the document dropped', () => {
  const doc = OurusDoc.parse('\\- a\n', { marks: { auto: [0] } });
  assert.deepEqual(doc.textOf(doc.rootNode.children[0]!)!.marks.auto, [0]);
  const without = doc.update({ marks: {} });
  assert.deepEqual(without.textOf(without.rootNode.children[0]!)!.marks.auto, []);
});

test('an escape ourus wrote is marked, and a join takes it out again; the author\'s stays', () => {
  const ours = keys(OurusView.of(OurusDoc.parse('revise 2. draft', { config: { enterSplitSpace: 'trim' } })), [[enter, 7]]);
  assert.equal(ours.doc.text, 'revise\n\n2\\. draft');
  assert.deepEqual(autoOf(ours.doc), ['⏎@7', '\\@9']);
  assert.equal(keys(ours, [[back, 8]]).doc.text, 'revise2. draft');
  // written by the author: the same text, no mark, and the backslash is theirs: a character of the text, kept
  const theirs = OurusView.of(OurusDoc.parse('revise\n\n2\\. draft'));
  assert.equal(keys(theirs, [[back, 8]]).doc.text, 'revise2\\. draft');
  // ours with its mark lost (a reload) is the author's
  assert.equal(keys(OurusView.of(OurusDoc.parse(ours.doc.text)), [[back, 8]]).doc.text, 'revise2\\. draft');
});

test('a backslash the text gains to stay text is ours, marked, and a join keeps it where its character means something mid-line', () => {
  const doc = OurusDoc.parse('x\n');
  const done = new OurusDraft(doc).setText(doc.rootNode.children[0]!, new OurusProse('paragraph', false, 'one \n<div>')).done();
  assert.ok('doc' in done);
  assert.equal(done.doc.text[5], '\\');
  assert.deepEqual(autoOf(done.doc), ['\\@5']);
  // (`<div>` mid-line would be inline HTML: the join keeps the backslash, where a plain escape would go)
  const joined = keys(OurusView.of(OurusDoc.parse('one\n\\<div>', { marks: { auto: [4] } })), [[back, 4]]);
  assert.equal(joined.doc.text, 'one\\<div>');
});

test('an escape of ours before a character that starts nothing in the flavor goes on a join, and stays before one that does', () => {
  // GFM: `=` starts nothing, so the setext escape goes with the line break it was written for
  const gfm = keys(OurusView.of(OurusDoc.parse('Title ===\n')), [[{ type: 'shiftEnter' }, 6], [back, 7]]);
  assert.equal(gfm.doc.text, 'Title ===\n');
  // Obsidian: `==x==` is a highlight, so `\=` stays; `\#` before a blank is no tag, and goes
  const obsidian = (text: string, at: number): string => keys(OurusView.of(OurusDoc.parse(text, { config: { flavor: 'obsidian' } })), [[{ type: 'shiftEnter' }, at], [back, at + 1]]).doc.text;
  assert.equal(obsidian('Title ===\n', 6), 'Title \\===\n');
  assert.equal(obsidian('p # h\n', 2), 'p # h\n');
});

test('a caret at the start of a line that gets an escape stays before it, so Backspace joins the lines back', () => {
  const split = assertApplied(executeOnText('--\n', { type: 'shiftEnter' }, { caret: 1 }));
  assert.equal(split.view.doc.text, '\\-\n\\-\n');
  assert.deepEqual(autoOf(split.view.doc), ['\\@0', '\\@3']);
  assert.deepEqual(split.view.selection, { anchor: 3, head: 3 }, 'before the backslash of the second line');
  assert.equal(assertApplied(executeCommand(split.view, back)).view.doc.text, '--\n');
});

test('a draft that sets a text with a mark dropped keeps it dropped, though its characters are the same', () => {
  const doc = OurusDoc.parse('\\- a\n\nnext\n', { marks: { auto: [0] } });
  const node = doc.rootNode.children[0]!;
  const text = doc.textOf(node) as OurusProse;
  assert.deepEqual(text.marks.auto, [0]);
  const done = new OurusDraft(doc).setText(node, text.withMarks({ auto: [] })).done();
  assert.ok('doc' in done);
  assert.deepEqual(autoOf(done.doc), []);
  assert.equal(done.doc.text, '\\- a\n\nnext\n', 'the backslash the author\'s now: kept');
});

test('a backslash that starts a text is a character of it: a caret has a place on each side, Backspace after it is the host\'s, and a join keeps it', () => {
  const view = OurusView.of(OurusDoc.parse('\\# a\n'));
  // after the backslash: Backspace deletes that character (the host does), Enter splits there
  assert.ok(executeCommand(view.withSelection(1), back) instanceof OurusDeferred);
  assert.equal(assertApplied(executeCommand(view.withSelection(1), enter)).view.doc.text, '\\\n\n\\# a\n');
  // before it: the text's start, where Indent keeps the caret before the backslash, and Backspace joins up
  assert.deepEqual(assertApplied(executeCommand(view.withSelection(0), { type: 'indent' })).view.selection, { anchor: 2, head: 2 });
  assert.equal(assertApplied(executeOnText('p\n\\- a\n', back, { caret: 2 })).view.doc.text, 'p\\- a\n');
  // (where deleting the backslash would make the paragraph a heading, Cmd-Backspace keeps it and goes to the line's start)
  const soft = assertApplied(executeCommand(view.withSelection(1), { type: 'deleteSoftLineBackward' }));
  assert.deepEqual([soft.view.doc.text, soft.view.selection.head], ['\\# a\n', 0]);
});

test('blank lines ourus raised go where the nodes stay apart without them; the author\'s stay', () => {
  // Enter at a text's start makes an empty paragraph, set off by blank lines; Backspace takes it out
  const author = 'a\n# H1\ntext\n';
  const made = assertApplied(executeOnText(author, enter, { caret: 7 }));
  assert.ok(made.view.doc.marks.auto.length);
  // the empty paragraph taken out again, its blank lines, ourus's both, with it: the text as it was
  assert.equal(assertApplied(executeCommand(made.view, back)).view.doc.text, author);
  // the blank lines the author had, no mark: kept
  const kept = keys(OurusView.of(OurusDoc.parse('para\n\n# Hello\n\nbody\n')), [[enter, 2], [back, 4]]);
  assert.equal(kept.doc.text, 'para\n\n# Hello\n\nbody\n');
});

test('an empty node taken out gives the node above its blank lines but the author\'s own: the text comes back whichever made the blank lines', () => {
  for (const text of ['a\n# H1\ntext\n', '# H1\n\ntext\n', 'para\n\n# Hello\n\nbody\n']) {
    const at = text.lastIndexOf('\n', text.length - 2) + 1;
    const made = assertApplied(executeOnText(text, enter, { caret: at }));
    assert.equal(assertApplied(executeCommand(made.view, back)).view.doc.text, text, JSON.stringify(text));
  }
});

test('an empty item set apart by a blank line when the caret leaves, given text, loses the blank line at the next edit there; the same in CRLF', () => {
  const settled = settlePlaceholders(OurusView.of(OurusDoc.parse('Notes\n- ', { marks: { placeholders: [8] } }), { selection: 0 }))!;
  assert.equal(settled.view.doc.text, 'Notes\n\n- ');
  assert.deepEqual(autoOf(settled.view.doc), ['⏎@6']);
  // typed into by the host: the blank line stays, nothing has asked whether it is needed
  const typed = settled.view.update({ changes: [{ from: 9, to: 9, insert: 'x' }] });
  assert.equal(typed.doc.text, 'Notes\n\n- x');
  // the next command at the seam reads it as ours, and the nodes stay apart without it
  assert.equal(assertApplied(executeCommand(typed.withSelection(10), enter)).view.doc.text, 'Notes\n- x\n- ');
  // (a line ending of two characters is marked on its first)
  const crlf = assertApplied(executeOnText('revise 2. draft\r\nnext\r\n', enter, { caret: 7, config: { enterSplitSpace: 'trim' } })).view;
  assert.deepEqual(autoOf(crlf.doc), ['⏎@8', '\\@11']);
  assert.deepEqual([crlf.doc.text[8], crlf.doc.text[11]], ['\r', '\\']);
  assert.equal(assertApplied(executeCommand(crlf.withSelection(10), back)).view.doc.text, 'revise2. draft\r\nnext\r\n');
});

test('Shift-Enter at the start of an item under a paragraph raises a blank line of ours, and Backspace takes it out again', () => {
  const view = OurusView.of(OurusDoc.parse('a\n\nb\n- x\n'));
  const at = view.doc.text.indexOf('x');
  const split = assertApplied(executeCommand(view.withSelection(at), { type: 'shiftEnter' }));
  // (an item with nothing on its line would underline `b`: set apart, the line marked)
  assert.equal(split.view.doc.text, 'a\n\nb\n\n-\n  x\n');
  assert.deepEqual(autoOf(split.view.doc), ['⏎@5']);
  // (joined, `- x` interrupts the paragraph: the line is unneeded, and goes)
  const joined = assertApplied(executeCommand(split.view, back));
  assert.equal(joined.view.doc.text, 'a\n\nb\n- x\n');
  assert.deepEqual(autoOf(joined.view.doc), []);
});

test('Enter on a list item after a paragraph and Backspace give the blank line between them back: it is the author\'s', () => {
  const view = OurusView.of(OurusDoc.parse('para\n\n- a\n'));
  const at = view.doc.text.indexOf('- a') + 2;
  const split = assertApplied(executeCommand(view.withSelection(at), enter));
  assert.equal(split.view.doc.text, 'para\n\n- \n- a\n');
  assert.equal(assertApplied(executeCommand(split.view, back)).view.doc.text.startsWith('para\n\n- a'), true);
  // (a blank line Enter raised in a loose list is ours: it goes with the empty item)
  const loose = OurusView.of(OurusDoc.parse('- a\n- b\n\n- c\n'));
  const end = loose.doc.text.indexOf('a') + 1;
  const made = assertApplied(executeCommand(loose.withSelection(end), enter));
  assert.equal(assertApplied(executeCommand(made.view, back)).view.doc.text, '- a\n- b\n\n- c\n');
});

test('Backspace in the last empty item of a nested list leaves no blank line the author never put between the nodes', () => {
  // (the blank line before it was between `a` and the item; what follows is `c`, which the item never touched)
  const view = OurusView.of(OurusDoc.parse('- a\n\n  - \n- c\n'));
  const at = view.doc.text.indexOf('- \n') + 2;
  assert.equal(assertApplied(executeCommand(view.withSelection(at), back)).view.doc.text, '- a\n- c\n');
});

test('a write in a document with an auto mark on every blank line takes time in proportion to its length, not to its square', () => {
  // (the fastest of nine, from 2,000 paragraphs to 8,000: four times as long where it is linear, sixteen where it is quadratic;
  // the bound leaves room for a busy machine, which slows the larger run more)
  const time = (n: number): number => {
    const auto: number[] = [];
    let at = 0;
    const text = Array.from({ length: n }, (_, i) => {
      const line = `para ${i}\n`;
      at += line.length;
      auto.push(at);
      at += 1;
      return `${line}\n`;
    }).join('');
    const doc = OurusDoc.parse(text, { marks: { auto } });
    assert.equal(doc.marks.auto.length, n);
    const caret = text.indexOf(`para ${n / 2}`) + 3;
    let best = Infinity;
    for (let k = 0; k < 9; k++) {
      const start = performance.now();
      assertApplied(executeCommand(OurusView.of(doc, { selection: caret }), enter));
      best = Math.min(best, performance.now() - start);
    }
    return best;
  };
  const ratio = time(8000) / time(2000);
  assert.ok(ratio < 12, `8,000 paragraphs take ${ratio.toFixed(1)} times as long as 2,000`);
});

test('an empty paragraph Enter made, settled when the caret leaves, gives the node above its blank lines: the author\'s come back', () => {
  for (const [text, at] of [['p 2) x\n\n\n> [!note] q1\n', 6], ['a\n\nb\n', 1], ['# H\n\n\npara\n', 3]] as const) {
    const made = assertApplied(executeOnText(text, enter, { caret: at }));
    assert.equal(settlePlaceholders(made.view.withSelection(0))?.view.doc.text, text, JSON.stringify(text));
  }
  // (under an Obsidian callout's title, a block of one line, a blank line of ours is never needed)
  const title = assertApplied(executeOnText('> [!note] q\n> body\n', enter, { caret: 11, config: { flavor: 'obsidian' } }));
  assert.equal(settlePlaceholders(title.view.withSelection(0))?.view.doc.text, '> [!note] q\n> body\n');
  // (first in a quote with no text of its own: nothing above it takes its lines, and it goes as before)
  const first = assertApplied(executeOnText('# A\npara\n\n> # q\n\nmore\n', { type: 'shiftEnter' }, { caret: 10 }));
  assert.equal(settlePlaceholders(first.view.withSelection(0))?.view.doc.text, '# A\npara\n\n> # q\n\nmore\n');
});

test('a copy written before an empty last line takes no mark of it: the line\'s placeholder stays at the text\'s end', () => {
  const doc = OurusDoc.parse('a\n\n', { marks: { placeholders: [3] } });
  const copied = assertApplied(executeCommand(OurusView.of(doc, { selection: 1 }), { type: 'duplicateSubtree' })).view.doc;
  assert.equal(copied.text, 'a\n\na\n\n');
  assert.deepEqual(copied.marks.placeholders, [6]);
  // (the paragraph deleted instead: the empty one written anew, alone, held on its own line)
  const deleted = assertApplied(executeCommand(OurusView.of(doc, { selection: 1 }), { type: 'deleteSubtree' })).view.doc;
  assert.equal(deleted.text, '\n');
  assert.deepEqual(deleted.marks.placeholders, [0]);
});

test('an empty task\'s checkbox taken onto the first pasted item leaves its placeholder behind', () => {
  const doc = OurusDoc.parse('- [?] \n\n  - child\n', { config: { flavor: 'obsidian' }, marks: { placeholders: [6] } });
  const pasted = assertApplied(executeCommand(OurusView.of(doc, { selection: 7 }), { type: 'paste', clipboard: { 'text/plain': '- x\n\n```\nc\n```' } })).view.doc;
  assert.equal(pasted.text, '- [?] x\n\n  ```\n  c\n  ```\n  - child\n');
  assert.deepEqual(pasted.marks.placeholders, []);
});

test('a note ending in an empty node a placeholder holds, no final line break before: deleting, indenting or outdenting over it keeps it held', () => {
  const play = (text: string, commands: OurusCommand['type'][]): void => {
    let view = OurusView.of(OurusDoc.parse(text));
    let selection = { anchor: text.length, head: text.length };
    for (const type of commands) {
      const result = assertApplied(executeCommand(view.withSelection(selection), { type } as OurusCommand));
      view = result.view;
      selection = result.view.selection;
    }
  };
  play('# H\n\np', ['enter', 'expandSelection', 'deleteContentForward']);
  play('- first\n- second', ['enter', 'indent', 'selectNode', 'expandSelection', 'indent']);
  play('- a', ['enter', 'enter', 'expandSelection', 'outdent']);
});

test('an escape of ours a space comes after escapes nothing: its mark goes, the backslash the user\'s, and Shift-Tab writes', async () => {
  const { executeCommand } = await import('../src/commands/index.ts');
  const { OurusView } = await import('../src/view/index.ts');
  const { assertApplied, executeOnText } = await import('./lib/index.ts');
  // (Tab on `--` escapes it, ours; a space typed after the backslash; Shift-Tab)
  const tabbed = assertApplied(executeOnText('--\n', { type: 'indent' }));
  assert.equal(tabbed.view.doc.text, '- \\--\n');
  assert.deepEqual([...tabbed.view.doc.marks.auto], [2]);
  const typed = tabbed.view.update({ changes: [{ from: 3, to: 3, insert: ' ' }], caret: 4 });
  assert.deepEqual([...typed.doc.marks.auto], []);
  const outdented = assertApplied(executeCommand(typed.withSelection(4), { type: 'outdent' }));
  assert.equal(outdented.view.doc.text, '\\ --\n');
  // (untouched, Shift-Tab takes its own escape back: the rule again)
  assert.equal(assertApplied(executeCommand(tabbed.view.withSelection(4), { type: 'outdent' })).view.doc.text, '--\n');
  assert.equal(OurusView.of(typed.doc).doc.text, '- \\ --\n');
});

test('cutting the last item keeps the raised blank line after it ours: a gap written anew keeps its last line ours (B345)', () => {
  const result = assertApplied(executeOnText('- a\n- b\n\nc\n', { type: 'cut' }, { caret: 6, auto: [8] }));
  assert.equal(result.view.doc.text, '- a\n\nc\n');
  assert.deepEqual(result.view.doc.marks.auto, [4]);
});

test('deleting the last item keeps it ours: a gap written anew keeps its last line ours (B345)', () => {
  const result = assertApplied(executeOnText('- a\n- b\n\nc\n', { type: 'deleteSubtree' }, { caret: 6, auto: [8] }));
  assert.deepEqual(result.view.doc.marks.auto, [4]);
});

test('cutting a quote\'s last item keeps it ours: a gap written anew keeps its last line ours (B345)', () => {
  const result = assertApplied(executeOnText('- a\n  > q\n  > - b\n\nc\n', { type: 'cut' }, { caret: 16, auto: [18] }));
  assert.equal(result.view.doc.text, '- a\n  > q\n\nc\n');
  assert.deepEqual(result.view.doc.marks.auto, [10]);
});

test('Shift-Enter at a quoted paragraph\'s end keeps the raised blank line under it ours: a gap written anew keeps its last line ours (B345)', () => {
  const result = assertApplied(executeOnText('> x\n>\n> y\n', { type: 'shiftEnter' }, { caret: 3, auto: [5] }));
  assert.equal(result.view.doc.text, '> x\n> \n>\n> y\n');
  assert.deepEqual(result.view.doc.marks.auto, [8]);
});

test('moving a copy above its original, the text the same, keeps it ours: a gap written anew keeps its last line ours (B345)', () => {
  const result = assertApplied(executeOnText('- > [!note] Title\n  > body text\n  >\n  > body text\n', { type: 'moveSubtreeUp' }, { caret: 40, auto: [35], config: { flavor: 'obsidian', quotes: 'container' } }));
  assert.deepEqual(result.view.doc.marks.auto, [35]);
});

test('a paste over an empty node above a blank line ourus raised: the line stays ours (B377)', () => {
  const r = assertApplied(executeOnText('- \n\n- last\n', { type: 'paste', clipboard: { 'text/plain': '- x\n' } }, { caret: 2, auto: [3] }));
  assert.equal(r.view.doc.text, '- x\n\n- last\n');
  assert.deepEqual(r.view.doc.marks.auto, [4]);
});

test('Backspace on a blank line above the one ourus raised: that one stays, ours still (B377)', () => {
  const r = assertApplied(executeOnText('- para one\n  \n\n', { type: 'deleteContentBackward' }, { caret: 13, auto: [14] }));
  assert.equal(r.view.doc.text, '- para one\n\n');
  assert.deepEqual(r.view.doc.marks.auto, [11]);
  const q = assertApplied(executeOnText('2. > quote\n   > \n\n', { type: 'deleteContentBackward' }, { caret: 16, auto: [17] }));
  assert.equal(q.view.doc.text, '2. > quote\n\n');
  assert.deepEqual(q.view.doc.marks.auto, [11]);
});

test('Alt-Up on a tight list\'s last item: the raised blank line after the list ours still, on the item now last (B377)', () => {
  const r = assertApplied(executeOnText('- a\n- b\n\np\n', { type: 'moveSubtreeUp' }, { caret: 6, auto: [8] }));
  assert.equal(r.view.doc.text, '- b\n- a\n\np\n');
  assert.deepEqual(r.view.doc.marks.auto, [8]);
});

test('Shift-Enter on a blank line above the one ourus raised: that one stays last, ours still (B377)', () => {
  const r = assertApplied(executeOnText('pa\n\n\nb\n', { type: 'shiftEnter' }, { caret: 3, auto: [4] }));
  assert.equal(r.view.doc.text, 'pa\n\n\n\nb\n');
  assert.deepEqual(r.view.doc.marks.auto, [5]);
});

test('Shift-Tab on a tab-led item before the blank line ourus raised: the line kept, what follows apart (B397)', () => {
  const r = assertApplied(executeOnText('x\n- a\n\t- b\n\nd\n', { type: 'outdent' }, { caret: 10, auto: [11] }));
  assert.equal(r.view.doc.text, 'x\n- a\n- b\n\nd\n');
});

test('Shift-Tab on a tab-led item under `indentUnit: tab`, a raised blank line after it: what follows kept apart (B353)', () => {
  const r = assertApplied(executeOnText("second line\n- other\n\t- item ^id1\n\nFinal line ^blk\n", { type: "outdent" }, { caret: 28, config: { flavor: "commonmark", indentUnit: "tab" }, auto: [33] }));
  assert.equal(r.view.doc.text, "second line\n- other\n- item ^id1\n\nFinal line ^blk\n");
});

test('a paste on the author\'s blank line above the one ourus raised: that one after the paste, ours still (B377)', () => {
  const r = assertApplied(executeOnText('- a\n  \n\n', { type: 'paste', clipboard: { 'text/plain': '- c\n', 'text/markdown': '- c\n' } }, { caret: 6, auto: [7] }));
  assert.equal(r.view.doc.text, '- a\n- c\n\n');
  assert.deepEqual(r.view.doc.marks.auto, [8]);
});

test('a paragraph indented into an item, a raised blank line before the author\'s after it: both kept, the raised one ours still (B377)', () => {
  const r = assertApplied(executeOnText('x\n\n\n', { type: 'indent' }, { caret: 4, auto: [2] }));
  assert.equal(r.view.doc.text, '- x\n\n\n');
  assert.deepEqual(r.view.doc.marks.auto, [4]);
});

test('a paragraph after a tight list indented into it: the list\'s blank line goes, the raised one after the paragraph stays ours (B377)', () => {
  const r = assertApplied(executeOnText('> a quote\n1. first\n\nIntro\n\n---\n', { type: 'indent' }, { caret: 25, auto: [26] }));
  assert.equal(r.view.doc.text, '> a quote\n1. first\n2. Intro\n\n---\n');
  assert.deepEqual(r.view.doc.marks.auto, [28]);
});

test('Enter in a quoted list above a blank line ourus raised before a paragraph: the line kept, the paragraph no lazy line of the list (B353)', () => {
  const r = assertApplied(executeOnText('  > quoted in item\n  >\n  > - \n  > - \n  >\t\t- list in quote\n\n%% comment %%\n- item ^id1\n- other\n', { type: 'enter' }, { caret: 44, config: { flavor: 'gfm', indentUnit: 'tab' }, auto: [22, 58] }));
  assert.equal(r.view.doc.text, '  > quoted in item\n  >\n  > - \n  > - \n  >\t\t- \n  >\t\t- list in quote\n\n%% comment %%\n- item ^id1\n- other\n');
});

test('Shift-Tab on a quote\'s held last line, a blank line ourus raised above it: the line kept, the held paragraph set apart from the quote (B353)', () => {
  const r = assertApplied(executeOnText('  > - list in quote\n  >\t- \n  >\t-- \n  >\n  > \n', { type: 'outdent' }, { caret: 43, config: { flavor: 'obsidian', indentUnit: 'tab' }, placeholders: [43], auto: [38] }));
  assert.equal(r.view.doc.text, '  > - list in quote\n  >\t- \n  >\t-- \n\n\n');
  assert.deepEqual(r.view.doc.marks.placeholders, [36]);
});

test('a raised blank line keeps its mark through a delete of a quote\'s last paragraph, a paste filling the blank line below it, Enter at a list\'s end (B377, seeds 151, 201)', () => {
  const clip = (s: string) => ({ 'text/plain': s, 'text/markdown': s });
  // (the paragraph's gap, as large as the one before it: the node before takes the gone one's lines)
  assert.deepEqual(autoOf(assertApplied(executeOnText('> a quote\n>\n> over two lines\n\n[^1]: a footnote\n', { type: 'deleteSubtree' }, { caret: 14, config: { flavor: 'commonmark' }, auto: [29] })).view.doc), ['⏎@10']);
  // (the lines above the one filled kept, ours where they were)
  assert.deepEqual(autoOf(assertApplied(executeOnText('a\n\n\n\nb\n', { type: 'paste', clipboard: clip('- x\n') }, { caret: 3, auto: [2] })).view.doc), ['⏎@2']);
  // (Enter at the list's end, the note's end after it: the new item takes the blank line, the list tight, B411)
  const entered = assertApplied(executeOnText('- item\n\n', enter, { caret: 6, auto: [7] })).view.doc;
  assert.equal(entered.text, '- item\n- \n\n');
  assert.deepEqual(autoOf(entered), ['⏎@10']);
});

test('Enter at a list\'s end, the note ending in blank lines, a raised one first: the new item takes them as they were, each mark where it was (B377)', () => {
  const r = assertApplied(executeOnText('- item\n\n\n', enter, { caret: 6, auto: [7] }));
  assert.equal(r.view.doc.text, '- item\n- \n\n\n');
  assert.deepEqual(r.view.doc.marks.auto, [10]);
});

test('a quote atom\'s later line held by a space, the line before it emptied by Enter: the mark goes with its space, the line the quote\'s own (B237)', () => {
  const r = assertApplied(executeOnText('2. > quote\n  > more\n', enter, { caret: 10, placeholders: [11], config: { quotes: 'atom' } }));
  assert.equal(r.view.doc.text, '2. > quote\n   > \n    > more\n');
  assert.deepEqual(r.view.doc.marks.placeholders, []);
});

test('Shift-Enter in code right after a held space: the space, nothing after it on its line, settles; the line below the code\'s (B237)', () => {
  const r = assertApplied(executeOnText('```\n x', { type: 'shiftEnter' }, { caret: 5, placeholders: [4] }));
  assert.equal(r.view.doc.text, '```\n\n x');
  assert.deepEqual(r.view.doc.marks.placeholders, []);
});

test('a paste over the selected last item of a loose list, the same item pasted: the raised blank line before it, left as it was, ours still (B377)', () => {
  const clip = { 'text/plain': '- last\n', 'text/markdown': '- last\n' };
  const r = assertApplied(executeOnText('- parent\n\n- sibling\n\n- last', { type: 'paste', clipboard: clip }, { anchor: 21, head: 27, auto: [20] }));
  assert.equal(r.view.doc.text, '- parent\n\n- sibling\n\n- last\n\n');
  assert.deepEqual(r.view.doc.marks.auto, [20]);
});

test('Backspace joining an item into the quote atom above: the escapes of ours in its text stay ours (seed 251)', () => {
  const r = assertApplied(executeOnText('2. > quote\n3. num> quote\n   \\> more\n', { type: 'deleteContentBackward' }, { caret: 11, auto: [28], config: { quotes: 'atom' } }));
  assert.equal(r.view.doc.text, '2. > quotenum> quote\n   \\> more\n');
  assert.deepEqual(r.view.doc.marks.auto, [24]);
});

test('a heading keeps one blank line under it, ours too: Shift-Enter in its text leaves it; Enter sets its text off and Backspace takes both back', () => {
  // (the line ours, left by an empty paragraph Enter made: Shift-Enter at the text's end keeps it)
  const held = assertApplied(executeOnText('## No\n\nx\n', { type: 'shiftEnter' }, { caret: 8, auto: [6] }));
  assert.equal(held.view.doc.text.slice(0, 9), '## No\n\nx\n');
  assert.deepEqual(autoOf(held.view.doc).slice(0, 1), ['⏎@6']);
  // ours beside the author's under a heading: ours go, one left
  assert.equal(assertApplied(executeOnText('## No\n\n\nx y\n', { type: 'shiftEnter' }, { caret: 10, auto: [7] })).view.doc.text, '## No\n\nx \ny\n');
  // Enter at the heading's end: set off by a line of ours; Backspace on the empty paragraph: as it was
  const entered = assertApplied(executeOnText('## No\nx\n', enter, { caret: 5 }));
  assert.equal(entered.view.doc.text, '## No\n\n\n\nx\n');
  assert.equal(assertApplied(executeCommand(entered.view, back)).view.doc.text, '## No\nx\n');
  // Shift-Enter there: compact
  assert.equal(assertApplied(executeOnText('## No\nx\n', { type: 'shiftEnter' }, { caret: 5 })).view.doc.text, '## No\n\n\nx\n');
});
