import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clipboardHtml } from './clipboard.ts';

test('a clipboard with structure has its HTML; plain lines and frontmatter have none', () => {
  assert.equal(clipboardHtml('- x\n- y\n', 'gfm'), '<ul>\n<li>x</li>\n<li>y</li>\n</ul>');
  assert.equal(clipboardHtml('1. x\n   1. x1\n2. y\n', 'gfm'), '<ol>\n<li>x\n<ol>\n<li>x1</li>\n</ol>\n</li>\n<li>y</li>\n</ol>');
  // lines copied from inside a list lose the indentation they share, as structured paste reads them
  assert.equal(clipboardHtml('  - x\n  - y\n', 'gfm'), '<ul>\n<li>x</li>\n<li>y</li>\n</ul>');
  assert.equal(clipboardHtml('x\ny\n', 'gfm'), null);
  assert.equal(clipboardHtml('x', 'gfm'), null);
  assert.equal(clipboardHtml('---\ntitle: x\n---\n', 'obsidian'), null);
  // one line without a line break is text, whatever it reads as
  assert.equal(clipboardHtml('1. Introduction', 'gfm'), null);
  assert.equal(clipboardHtml('1. Introduction\n', 'gfm'), '<ol>\n<li>Introduction</li>\n</ol>');
  // blocks HTML has no element for: none, an app would get their bare text
  assert.equal(clipboardHtml('$$\nx^2\n$$\n', 'obsidian'), null);
  assert.equal(clipboardHtml('> [!note] t\n> body\n', 'obsidian'), null);
  assert.equal(clipboardHtml('- a\n\n  $$\n  x\n  $$\n', 'obsidian'), null);
});
