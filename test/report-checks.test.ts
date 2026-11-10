// The session check's lost marks: an auto mark on a raised blank line, counted by its run of like
// lines, not by the line the diff of identical lines puts it on (decided 2026-11-11).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executeCommand, OurusSuccess, type OurusCommand } from '../src/commands/index.ts';
import { OurusDoc } from '../src/doc/index.ts';
import { OurusView } from '../src/view/index.ts';
import { lostMarks } from './lib/report-checks.ts';

function lost(text: string, command: OurusCommand, caret: number, auto: number[]): string[] {
  const view = OurusView.of(OurusDoc.parse(text, { marks: { placeholders: [], auto } })).withSelection({ anchor: caret, head: caret });
  const result = executeCommand(view, command);
  assert.ok(result instanceof OurusSuccess);
  return lostMarks(view, result);
}

test('lost marks: an auto mark kept on another line of its run of blank lines is kept', () => {
  // (the heading emptied under the raised line: ours on the line it left, the diff's the line above)
  assert.deepEqual(lost('  - \n\n# \n    - d two\n', { type: 'deleteContentBackward' }, 8, [5]), []);
});

test('lost marks: a raised line taken out before the author\'s beside it is no mark lost', () => {
  assert.deepEqual(lost('Intro paragraph with a [[link]] and `code`.\nFinal line ^blk\n\n\n%% comment %%\n', { type: 'deleteSoftLineBackward' }, 44, [61]), []);
});

test('lost marks: a raised line left the author\'s, where a paste filled the author\'s beside it, is a mark lost', () => {
  // (the paste keeps it now, B377: the check is shown the same result with the mark dropped, as it was)
  const clipboard = { 'text/plain': '| a | b |\n|---|---|\n| 1 | 2 |\n', 'text/markdown': '| a | b |\n|---|---|\n| 1 | 2 |\n' };
  const view = OurusView.of(OurusDoc.parse('1. first\n\n ', { marks: { placeholders: [], auto: [9] } })).withSelection({ anchor: 11, head: 11 });
  const result = executeCommand(view, { type: 'paste', clipboard });
  assert.ok(result instanceof OurusSuccess);
  assert.deepEqual(lostMarks(view, result), []);
  const doc = result.view.doc;
  const dropped = new OurusSuccess({ ...result, view: OurusView.of(doc.update({ marks: { placeholders: doc.marks.placeholders, auto: [] } })) });
  assert.deepEqual(lostMarks(view, dropped), ["auto mark lost on a line it didn't change"]);
});

test('B377: a raised line keeps its mark where a command hands its gap on, one case for each mechanism fixed', () => {
  const cases: [string, string, unknown, Record<string, unknown>][] = [
    ["a delete joining an empty item, ours the earlier of its lines", "- [ ] x\n- [ ] \n\n\n", {"type": "deleteContentForward"}, {"caret": 7, "config": {"flavor": "commonmark"}, "auto": [16]}],
    ["a block-id paragraph folded into the heading above", "## Notes\nFinal line ^blk\n\n", {"type": "deleteSoftLineBackward"}, {"caret": 19, "config": {"flavor": "obsidian"}, "auto": [25]}],
    ["Enter over a selection: a join, then a split", "x\n- item ^\n\n- id1\n", {"type": "enter"}, {"anchor": 1, "head": 4, "config": {"flavor": "gfm", "quotes": "container"}, "auto": [11]}],
    ["a paste beside a block apart from it, its lines copied", "x\\$$\n\n\n", {"type": "paste", "clipboard": {"text/plain": "$$\n"}}, {"caret": 1, "config": {"flavor": "obsidian", "quotes": "container"}, "auto": [1, 6]}],
    ["a node indented into a quote, its trailing line written outside it", "> [!note] Title\n- parent\n  - child one\n\n    second paragraph of child two\n\npara one\n", {"type": "indent"}, {"caret": 24, "config": {"flavor": "obsidian", "indentUnit": "tab"}, "auto": [74]}],
    ["a heading leaving a quote, its line and its new section end's each its own", "> # quoted in item\n\n```js\n```\n\n", {"type": "outdent"}, {"caret": 4, "config": {"flavor": "commonmark"}, "auto": [19]}],
    ["a paste filling a blank line after the gap moved", "- [ ] write spec\n\n ", {"type": "paste", "clipboard": {"text/plain": "- para one\n  second line\n"}}, {"caret": 19, "config": {"flavor": "gfm", "quotes": "container"}, "auto": [17]}],
    ["a quote moved below a paragraph, its own line taking the raised one's place (the check)", "# Project plan\n > quoted in item\n> over two lines\n\nx\n\npara one\n", {"type": "moveSubtreeDown"}, {"caret": 16, "config": {"flavor": "gfm", "quotes": "atom"}, "auto": [53]}],
    ["the note's last node deleted, its lines kept, ours gone (the check: no line past a final line break)", "para one\n\nline\n\n ", {"type": "deleteSubtree"}, {"caret": 17, "config": {"flavor": "gfm"}, "auto": [9]}],
  ];
  for (const [label, text, command, options] of cases) {
    const { caret = 0, anchor = caret, head = anchor, config = {}, auto = [] } = options as { caret?: number; anchor?: number; head?: number; config?: Record<string, unknown>; auto?: number[] };
    const view = OurusView.of(OurusDoc.parse(text, { config, marks: { placeholders: [], auto } }), { selection: { anchor, head } });
    const result = executeCommand(view, command as OurusCommand);
    assert.ok(result instanceof OurusSuccess, label);
    assert.deepEqual(lostMarks(view, result), [], label);
  }
});
