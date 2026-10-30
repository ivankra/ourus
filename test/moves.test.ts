// The move sweep: every node of every spec start moved to every place there is, each parent's every
// slot (`{ parent, after }`), in two flavors: the places a tree pane or a "move to" dialog names, which
// no drag offers (the drop pass, `drops.test.ts`, drops at those). Nothing throws, and nothing fails
// to write but at the known starts, each a writer's gap to close; a new one fails, and so does a known
// one with none now, so the list only shrinks.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OurusConfig } from '../src/config.ts';
import { executeCommand, OurusRejected } from '../src/commands/index.ts';
import { OurusView } from '../src/view/index.ts';
import type { OurusNode } from '../src/doc/index.ts';
import { docOf, nodesOf, readDrawing } from './drawing.ts';
import { readSpecFile, specConfig, specFiles } from './specfile.ts';

/** The starts where some move fails to write, and why. */
const KNOWN: Readonly<Record<string, string>> = {};

/** A start's first lines of failures, by example; each start's text played once per flavor and config. */
function moveGaps(): Map<string, string[]> {
  const gaps = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      const { text } = readDrawing(t.initial.buffer);
      for (const flavor of ['gfm', 'obsidian'] as const) {
        const config: Partial<OurusConfig> = { flavor, ...specConfig(t.options) };
        const key = `${JSON.stringify(config)} ${text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const doc = docOf(text, [], config);
        const nodes = nodesOf(doc);
        const view = OurusView.of(doc);
        const parents: (OurusNode | 'root')[] = ['root', ...nodes];
        for (const node of nodes) {
          // (the caret in it, to go with it)
          const end = doc.mdTree.line(node.textFirstLine).to;
          for (const parent of parents) {
            const children = parent === 'root' ? doc.rootNode.children : parent.children;
            for (const after of [null, ...children]) {
              const to = { parent: parent === 'root' ? ('root' as const) : parent.id, after: after === null ? null : after.id };
              let failure: string | null = null;
              try {
                const r = executeCommand(view, { type: 'moveSubtree', nodes: [node.id], to }, { anchor: end, head: end });
                if (r instanceof OurusRejected && r.reason === 'write-failed') failure = r.detail ?? 'write-failed';
              } catch (e) {
                failure = `throws: ${(e as Error).message}`;
              }
              if (failure) gaps.set(t.name, [...(gaps.get(t.name) ?? []), `${flavor}: node ${node.id} to ${JSON.stringify(to)}: ${failure}`]);
            }
          }
        }
      }
    }
  }
  return gaps;
}

test('every node moved to every place is a refusal or a result, but at the known starts', () => {
  const gaps = moveGaps();
  const found = [...gaps].filter(([name]) => !(name in KNOWN)).map(([name, list]) => `${name}: ${list.length} (${list[0]})`);
  const fixed = Object.keys(KNOWN).filter((name) => !gaps.has(name));
  assert.deepEqual(found, [], 'starts whose moves fail to write');
  assert.deepEqual(fixed, [], 'known starts with no failure now: drop them from KNOWN');
});
