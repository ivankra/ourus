// Runs the behaviour spec in spec/*.md (the format is in spec/README.md) against the core, in every
// Markdown flavor, or in the one an example names.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test, type TestContext } from 'node:test';
import { OutlineState } from '../src/outline/index.ts';
import { drawState, readDrawing, readText } from './drawing.ts';
import { isCommand, play, type Played } from './player.ts';
import { textPosition } from '../src/commands/index.ts';
import { flavorsOf, run } from './spec-run.ts';
import { readSpec, slug, specConfig, type SpecTest } from './specfile.ts';

const specDir = new URL('../spec/', import.meta.url);

for (const file of readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
  let tests: SpecTest[];
  try {
    tests = readSpec(file, readFileSync(new URL(file, specDir), 'utf8'));
  } catch (e) {
    test(`${file}: reads`, () => {
      throw e;
    });
    continue;
  }
  for (const t of tests) {
    const runAll = (): void => {
      for (const flavor of flavorsOf(t)) run(t, flavor);
    };
    test(`${file} › ${t.name}`, (ctx: TestContext) => {
      if (!t.pending) return runAll();
      // a pending example fails once it passes (in every flavor), so it gets promoted rather than forgotten
      try {
        runAll();
      } catch (e) {
        ctx.todo('pending');
        throw e;
      }
      assert.fail(`${t.file}:${t.line}: a pending example passes now; drop "pending"`);
    });
  }
}

const specFiles = (): string[] => readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md');

// every case is ranked, and every core one is walked through in a daily flow of scenarios.md
test('every case has a rank, and every core case appears in scenarios.md', () => {
  const scenarios = readFileSync(new URL('scenarios.md', specDir), 'utf8');
  const problems: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpec(file, readFileSync(new URL(file, specDir), 'utf8'))) {
      if (!t.options.rank) problems.push(`${file} › ${t.name}: no rank`);
      const id = t.name.split(' › ').pop()!;
      if (t.options.rank === 'core' && file !== 'scenarios.md' && !scenarios.includes(`${file}#${slug(id)})`)) problems.push(`${file} › ${t.name}: core, but in no scenario`);
    }
  }
  assert.deepEqual(problems, []);
});

// the caret never ends in markup: after an applied command it is in a node's text, never before a
// marker, a checkbox, a heading's `#`s, a quote's `>` or a callout's `[!type]`; after a structural
// command, never on a fence either (Enter's, Backspace's and Delete's carets on fences are drawn as
// fences.md decided them)
const STRUCTURAL = ['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'duplicateSubtree', 'deleteSubtree'];
/** Whether typing a character at `head` leaves the outline's nodes as they are, one node's text aside. */
function typingKeepsOutline(doc: OutlineState, head: number): boolean {
  const shape = (d: OutlineState): { node: string; text: string }[] => {
    const out: { node: string; text: string }[] = [];
    const walk = (n: OutlineState['root'], depth: number): void => {
      for (const c of n.children) {
        // what a node's text is (an empty item's is a paragraph, once typed into), and a heading's level
        out.push({ node: `${depth}:${c.kind}:${c.kind === 'atom' ? c.block.type : (c.head?.type ?? 'paragraph')}:${c.head?.level ?? ''}`, text: d.nodeText(c) });
        walk(c, depth + 1);
      }
    };
    walk(d.root, 0);
    return out;
  };
  const [before, after] = [shape(doc), shape(doc.update([{ from: head, to: head, insert: 'x' }], { caret: head + 1 }))];
  if (before.map((n) => n.node).join() !== after.map((n) => n.node).join()) return false;
  return before.filter((n, i) => n.text !== after[i]!.text).length <= 1;
}

test('no applied command leaves the caret in markup', () => {
  const problems: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpec(file, readFileSync(new URL(file, specDir), 'utf8'))) {
      if (t.pending) continue;
      for (const flavor of flavorsOf(t)) {
        const start = readDrawing(t.initial.buffer);
        let state: Played = {
          doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: { flavor, ...specConfig(t.options) } }),
          selection: start.selection,
          clipboard: readText(t.initial.clipboard ?? ''),
        };
        for (const step of t.steps) {
          for (const action of step.actions) {
            state = play(state, [action]);
            const { anchor, head } = state.selection;
            if (!isCommand(action) || state.last?.status !== 'applied' || anchor !== head) continue;
            const doc = state.doc;
            const markup = head <= doc.lineAt(head).to && doc.nodeAt(head) && head < doc.textStart(head);
            if (markup || (STRUCTURAL.includes(action) && textPosition(doc, head) !== head)) problems.push(`${file}:${step.line} (${flavor}) ${action}: ${drawState(doc.text, state.selection, doc.placeholders)}`);
            // and, apart from that helper, typing there after a structural command, in a node, keeps the
            // outline: the same nodes, only one of them with other text
            else if (STRUCTURAL.includes(action) && doc.nodeAt(head) && !typingKeepsOutline(doc, head)) problems.push(`${file}:${step.line} (${flavor}) ${action}, then typing: ${drawState(doc.text, state.selection, doc.placeholders)}`);
          }
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});
