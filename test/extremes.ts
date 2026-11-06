// The public API at a note's extremes: 10,000 levels deep and 200,000 siblings, Markdown and HTML.
// Nothing may throw: a refusal or a failure is an answer, a thrown `RangeError` (recursion past the
// stack: B258, B315, B340) or an array spread past JavaScript's limit on arguments (B281, B317) isn't.
// A suite of the full run (`npm test`), as it takes seconds; the lint on spreads is `test/lints.test.ts`.
//
//   node test/extremes.ts

import { test } from 'node:test';
import { MdFlavor, MdHtmlParser, MdTree, OurusDoc, OurusView, executeCommand, leavesZoom, settlePlaceholders, type OurusCommand } from '../src/index.ts';

/** The public API's calls on `text`, `commands` at `at` among them: none may throw (a refusal or a failure is an answer). */
function everyApi(text: string, at: number, commands: readonly OurusCommand[]): void {
  const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' } });
  doc.blockIds();
  doc.update({ changes: [{ from: at, to: at, insert: 'x' }], caret: at + 1 });
  const view = OurusView.of(doc, { selection: at });
  view.selectedSubtrees();
  view.touchedSubtrees();
  view.visibleSelection();
  for (const command of commands) executeCommand(view, command);
  settlePlaceholders(view);
  leavesZoom(view, doc);
  MdTree.parse(text, MdFlavor.gfm).renderHtml();
}

const COMMANDS: readonly OurusCommand[] = [{ type: 'enter' }, { type: 'indent' }, { type: 'outdent' }, { type: 'moveSubtreeDown' }, { type: 'deleteContentBackward' }, { type: 'insertText', text: 'z' }, { type: 'copy' }, { type: 'selectNode' }, { type: 'fold' }];

test('the public API on a note 10,000 levels deep and on one of 200,000 siblings throws nothing', () => {
  // (deep: quotes, each a level, every command at the text's end and the note's start; a list nested by
  // one space more each line would be 50 million characters)
  const deep = `${'> '.repeat(10000)}a\n`;
  everyApi(deep, 10000 * 2, COMMANDS);
  everyApi(deep, 0, COMMANDS);
  // (wide: siblings, Enter in the middle: a command there takes seconds, linear but slow, so the rest of
  // them at the start alone)
  const wide = '- a\n'.repeat(200000);
  everyApi(wide, wide.length / 2 + 2, [{ type: 'enter' }]);
  everyApi(wide, 2, [{ type: 'copy' }, { type: 'selectNode' }, { type: 'fold' }]);
  // (HTML as deep and as wide)
  MdHtmlParser.parse(`${'<blockquote>'.repeat(10000)}a${'</blockquote>'.repeat(10000)}`);
  MdHtmlParser.parse(`<ul>${'<li>a</li>'.repeat(200000)}</ul>`);
});
