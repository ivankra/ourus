// Runs the behavior spec in spec/*.md (the format is in spec/README.md) against the core, in every
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

// every core case (the reader requires every case's rank) is walked through in a daily flow of scenarios.md
test('every core case appears in scenarios.md', () => {
  const scenarios = readFileSync(new URL('scenarios.md', specDir), 'utf8');
  const problems: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpec(file, readFileSync(new URL(file, specDir), 'utf8'))) {
      const id = t.name.split(' › ').pop()!;
      if (t.rank === 'core' && file !== 'scenarios.md' && !scenarios.includes(`${file}#${slug(id)})`)) problems.push(`${file} › ${t.name}: core, but in no scenario`);
    }
  }
  assert.deepEqual(problems, []);
});

// the caret never ends in markup: after an applied command it is in a node's text, never before a
// marker, a checkbox, a heading's `#`s, a quote's `>` or a callout's `[!type]`. Where the host shows
// markup as text (`markup: text`, the cases' default), after a structural command it isn't on a fence
// either, but for indent and outdent from a fence line, which keep it there; Enter's, Backspace's and
// Delete's carets on fences are drawn as fences.md decided them. Where the host decorates markup
// (`markup: decorated`), every case played again: no applied command leaves it on a fence either.
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

/** Whether `line` of `doc` is a fence's: a fenced block's opening or closing one, a `$$` or `%%` line. */
function onFenceLine(doc: OutlineState, head: number): boolean {
  const line = doc.lineAt(head);
  const leaf = line.leaf;
  if (!leaf || head > line.to) return false;
  if (leaf.type === 'code_block' && leaf.fenced) return line.index === leaf.startLine || (line.index === leaf.endLine && !!leaf.closed);
  return (leaf.type === 'math_block' || leaf.type === 'comment_block') && (line.index === leaf.startLine || line.index === leaf.endLine);
}

for (const markup of ['text', 'decorated'] as const) {
  test(`no applied command leaves the caret in markup (markup: ${markup})`, () => {
    const problems: string[] = [];
    for (const file of specFiles()) {
      for (const t of readSpec(file, readFileSync(new URL(file, specDir), 'utf8'))) {
        if (t.pending) continue;
        // decorated: every case, its own config with the host's kind set over it
        const options = markup === 'decorated' ? { ...specConfig(t.options), markup } : specConfig(t.options);
        if (markup === 'text' && options.markup === 'decorated') continue;
        for (const flavor of flavorsOf(t)) {
          const start = readDrawing(t.initial.buffer);
          let state: Played = {
            doc: OutlineState.parse(start.text, { placeholders: start.placeholders, config: { flavor, ...options } }),
            selection: start.selection,
            clipboard: readText(t.initial.clipboard ?? ''),
          };
          for (const step of t.steps) {
            for (const action of step.actions) {
              const before = state;
              state = play(state, [action]);
              const { anchor, head } = state.selection;
              if (!isCommand(action) || state.last?.status !== 'applied' || anchor !== head) continue;
              const doc = state.doc;
              // a space a placeholder holds as text (`- ┃◌ x`) starts the text
              const held = doc.placeholders.includes(head) && /[ \t]/.test(doc.text[head] ?? '');
              const markupAt = head <= doc.lineAt(head).to && doc.nodeAt(head) && head < doc.textStart(head) && !held;
              // where markup is text, indent and outdent from a fence line may keep the caret on one
              const keptOnFence = markup === 'text' && (action === 'indent' || action === 'outdent') && onFenceLine(before.doc, before.selection.head);
              const checked = markup === 'decorated' || (STRUCTURAL.includes(action) && !keptOnFence);
              if (markupAt || (checked && textPosition(doc, head) !== head)) problems.push(`${file}:${step.line} (${flavor}) ${action}: ${drawState(doc.text, state.selection, doc.placeholders)}`);
              // and, apart from that helper, typing there after a structural command, in a node, keeps the
              // outline: the same nodes, only one of them with other text
              else if (STRUCTURAL.includes(action) && !keptOnFence && doc.nodeAt(head) && !typingKeepsOutline(doc, head)) problems.push(`${file}:${step.line} (${flavor}) ${action}, then typing: ${drawState(doc.text, state.selection, doc.placeholders)}`);
            }
          }
        }
      }
    }
    assert.deepEqual(problems, []);
  });
}
