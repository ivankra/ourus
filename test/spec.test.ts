// Runs the behavior spec in spec/*.md (the format is in spec/README.md) against the core, in every
// Markdown flavor, or in the one an example names.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test, type TestContext } from 'node:test';
import { AtomText, type OutlineNode, type OurusDoc } from '../src/doc/index.ts';
import { codeAt } from '../src/commands/code.ts';
import { CommandContext } from '../src/commands/context.ts';
import { drawDoc, plainText } from './drawing.ts';
import { isCommand, play } from './player.ts';
import { textPosition } from './caret.ts';
import { flavorsOf, run, startOf } from './spec-run.ts';
import { readSpecFile, slug, specConfig, specFiles, SPEC_DIR, type SpecTest } from './specfile.ts';

for (const file of specFiles()) {
  let tests: SpecTest[];
  try {
    tests = readSpecFile(file);
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
    test(t.name, (ctx: TestContext) => {
      if (!t.pending) return runAll();
      // a pending example fails once it passes (in every flavor), so it gets promoted rather than forgotten
      try {
        runAll();
      } catch (e) {
        ctx.todo('pending');
        throw e;
      }
      assert.fail(`${t.file}:${t.line}: a pending example passes now; drop its tag`);
    });
  }
}


// a case's name (its own heading) is unique across the spec, not only in its file: reports, the SxS
// and notes name a case by it alone
test('every case name is unique across the spec files', () => {
  const files = new Map<string, string[]>();
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) files.set(t.name, [...(files.get(t.name) ?? []), file]);
  }
  assert.deepEqual([...files].filter(([, in_]) => in_.length > 1).map(([id, in_]) => `${id}: ${in_.join(', ')}`), []);
});

// every core case (the reader requires every case's rank) is walked through in a daily flow of scenarios.md
test('every core case appears in scenarios.md', () => {
  const scenarios = readFileSync(SPEC_DIR + 'scenarios.md', 'utf8');
  const problems: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      if (t.rank === 'core' && file !== 'scenarios.md' && !scenarios.includes(`${file}#${slug(t.name)})`)) problems.push(`${t.name} (${file}): core, but in no scenario`);
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
function typingKeepsOutline(doc: OurusDoc, head: number): boolean {
  const shape = (d: OurusDoc): { node: string; text: string }[] => {
    const out: { node: string; text: string }[] = [];
    const walk = (n: OutlineNode, depth: number): void => {
      for (const c of n.children) {
        // what a node's text is (an empty item's is a paragraph, once typed into), and a heading's level
        out.push({ node: `${depth}:${c.kind}:${c.kind === 'atom' ? c.block.type : (c.head?.type ?? 'paragraph')}:${c.head?.attrs.level ?? ''}`, text: plainText(d, c) });
        walk(c, depth + 1);
      }
    };
    walk(d.rootNode, 0);
    return out;
  };
  const [before, after] = [shape(doc), shape(doc.update([{ from: head, to: head, insert: 'x' }], { caret: head + 1 }))];
  if (before.map((n) => n.node).join() !== after.map((n) => n.node).join()) return false;
  return before.filter((n, i) => n.text !== after[i]!.text).length <= 1;
}

/** Whether `head`'s line is a fence's: a fenced block's opening or closing one, a `$$` or `%%` line. */
function onFenceLine(doc: OurusDoc, head: number): boolean {
  const line = doc.lineAt(head);
  const node = head <= line.to ? doc.nodeAtLine(line.index) : null;
  const text = node && doc.textOf(node);
  const delimiters = text instanceof AtomText ? text.delimiters : null;
  if (!node || !delimiters) return false;
  const on = (offset: number): boolean => doc.lineAt(doc.posOf(node, offset)).index === line.index;
  return on(delimiters.open.from) || (!!delimiters.close && on(delimiters.close.from));
}

// `enter-in-fence` is a fact the spec keeps by hand: a case has it where Enter is pressed on a fenced
// block's content line, code or math (not a fence's line: `markup-fence`), and only there. A block
// app whose code and math are a block's text, with no editor of their own, splits the block there
// (Athens, Dynalist), and its driver refuses the tag
test('`enter-in-fence` tags exactly the cases with Enter on a fenced code or math line', () => {
  const problems: string[] = [];
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      let state = startOf(t, flavorsOf(t)[0]!);
      let entered = false;
      for (const action of t.steps.flatMap((s) => s.actions)) {
        if (action === 'enter') {
          const code = codeAt(new CommandContext(state.doc, state.selection));
          if (code && (code.text.type === 'fenced_code' || code.text.type === 'math_block') && !onFenceLine(state.doc, state.selection.head)) entered = true;
        }
        state = play(state, [action]);
      }
      if (entered !== t.tags.includes('enter-in-fence')) problems.push(`${t.file}:${t.line} ${t.name}: ${entered ? 'Enter on a fenced block\'s line, untagged' : 'tagged, no Enter on a fenced block\'s line'}`);
    }
  }
  assert.deepEqual(problems, []);
});

for (const markup of ['text', 'decorated'] as const) {
  test(`no applied command leaves the caret in markup (markup: ${markup})`, () => {
    const problems: string[] = [];
    for (const file of specFiles()) {
      for (const t of readSpecFile(file)) {
        if (t.pending) continue;
        // decorated: every case, its own config with the host's kind set over it
        const options = markup === 'decorated' ? { ...specConfig(t.options), markup } : specConfig(t.options);
        if (markup === 'text' && options.markup === 'decorated') continue;
        for (const flavor of flavorsOf(t)) {
          let state = startOf(t, flavor, options);
          for (const step of t.steps) {
            for (const action of step.actions) {
              const before = state;
              state = play(state, [action]);
              const { anchor, head } = state.selection;
              // typed text too, where ourus's `insertText` applied
              if (!(isCommand(action) || action.startsWith('"')) || state.last?.status !== 'applied' || anchor !== head) continue;
              const doc = state.doc;
              // a space a placeholder holds as text (`- ┃◌ x`) starts the text
              const held = doc.marks.points().includes(head) && /[ \t]/.test(doc.text[head] ?? '');
              const line = doc.lineAt(head);
              const inNode = head <= line.to && !!doc.nodeAtLine(line.index);
              const markupAt = inNode && head < doc.textStart(line.index) && !held;
              // where markup is text, indent and outdent from a fence line may keep the caret on one
              const keptOnFence = markup === 'text' && (action === 'indent' || action === 'outdent') && onFenceLine(before.doc, before.selection.head);
              const checked = markup === 'decorated' || (STRUCTURAL.includes(action) && !keptOnFence);
              if (markupAt || (checked && textPosition(doc, head) !== head)) problems.push(`${file}:${step.line} (${flavor}) ${action}: ${drawDoc(doc, state.selection)}`);
              // and, apart from that helper, typing there after a structural command, in a node, keeps the
              // outline: the same nodes, only one of them with other text
              else if (STRUCTURAL.includes(action) && !keptOnFence && inNode && !typingKeepsOutline(doc, head)) problems.push(`${file}:${step.line} (${flavor}) ${action}, then typing: ${drawDoc(doc, state.selection)}`);
            }
          }
        }
      }
    }
    assert.deepEqual(problems, []);
  });
}
