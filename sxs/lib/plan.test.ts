// How a case's clipboard becomes a plan's (plan.ts): what the app is given, and the key its run is found by.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSpec } from '../../test/specfile.ts';
import { driver } from '../emacs-markdown/driver.ts';
import { adapt } from './plan.ts';

const F = '```';
const plan = (clipboard: string[], opts = {}) => {
  const [t] = readSpec('x.md', ['## A', '', `${F}yaml`, 'tags: edge', ...clipboard, F, '', `${F}buffer`, '- a┃', F, '', '> paste', '', `${F}buffer`, '- ax┃', F].join('\n'));
  const a = adapt(driver, t!, opts);
  assert.ok('plan' in a, 'skip' in a ? a.skip : '');
  return a.plan;
};

test("a plan's clipboard is the case's formats, in one order whatever order the case wrote them in", () => {
  const html = plan(['clipboard:', '  text/plain: "x"', '  text/html: "<b>x</b>"']);
  const swapped = plan(['clipboard:', '  text/html: "<b>x</b>"', '  text/plain: "x"']);
  assert.deepEqual(html.clipboard, { 'text/plain': 'x', 'text/html': '<b>x</b>' });
  assert.equal(JSON.stringify(swapped.clipboard), JSON.stringify(html.clipboard));
  assert.equal(swapped.key, html.key);
});

test('--plain-clipboard drops the HTML from the plan, so its run records the text alone', () => {
  const plain = plan(['clipboard:', '  text/plain: "x"', '  text/html: "<b>x</b>"'], { plainClipboard: true });
  assert.deepEqual(plain.clipboard, { 'text/plain': 'x' });
  assert.equal(plain.key, plan(['clipboard: "x"']).key);
});

test('every format is given to the app, and --plain-clipboard gives it the text alone', () => {
  const formats = ['clipboard:', '  text/plain: "x"', '  text/markdown: "- x"', '  vscode-editor-data: "{}"'];
  assert.deepEqual(plan(formats).clipboard, { 'text/plain': 'x', 'text/markdown': '- x', 'vscode-editor-data': '{}' });
  assert.deepEqual(plan(formats, { plainClipboard: true }).clipboard, { 'text/plain': 'x' });
});
