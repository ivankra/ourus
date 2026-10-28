// A case's drop as an app plays it (drag.ts): resolved from ourus's state into rows, or why not.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSpec } from '../../test/specfile.ts';
import { resolveDrop } from './drag.ts';

const F = '```';
const drop = (buffer: string[], actions: string) => {
  const [t] = readSpec('x.md', ['## A', '', `${F}yaml`, 'tags: edge', F, '', `${F}buffer`, ...buffer, F, '', `> ${actions}`, '', `${F}buffer`, '- x', F].join('\n'));
  return resolveDrop(t!, 'gfm');
};

test("a drop resolves to the rows it presses, carries and lands between, and the place's depths", () => {
  // Drag1: to the top, its child with it
  assert.deepEqual(drop(['▸', '- one', '  - two', '- three┃③'], 'move ③'), { action: 'move', press: 2, rows: [2], seam: { above: null, below: 0 }, depth: 0, listDepth: 0, to: { parent: 'root', after: null } });
  // Drag3: into an item, its child
  assert.deepEqual(drop(['- one┃①', '- two②', '  ▸', '- three'], 'move ①'), { action: 'move', press: 0, rows: [0], seam: { above: 1, below: 2 }, depth: 1, listDepth: 1, to: { parent: 1, after: null } });
  // the cover rule: a press on a selected node carries the selection's
  assert.deepEqual(drop(['- «a', '- b»②', '- c', '▸'], 'move ②'), { action: 'move', press: 1, rows: [0, 1], seam: { above: 2, below: null }, depth: 0, listDepth: 0, to: { parent: 'root', after: 2 } });
  // in a heading's section, a depth that is no list's; one in an item there, both
  const section = drop(['# A', '- y', '  ▸', '', 'b┃②'], 'move ②');
  assert.ok(typeof section !== 'string' && section.depth === 1 && section.listDepth === 0, JSON.stringify(section));
  const item = drop(['# A', '- y', '    ▸', '', 'b┃②'], 'move ②');
  assert.ok(typeof item !== 'string' && item.depth === 2 && item.listDepth === 1, JSON.stringify(item));
});

test("a drop that isn't the case's first action, or whose pickup ourus refuses, isn't played", () => {
  assert.equal(drop(['- a', '- b┃②', '▸'], 'cursorDocStart move ②'), 'a drop after other actions');
  assert.match(drop(['- a', '  - «b', '- c»③', '▸'], 'move ③') as string, /^the pickup is refused/);
});
