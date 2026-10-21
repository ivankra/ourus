// Settling placeholders the caret has left.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import { diffText, lineSpan, trimMd, trimMdEnd, trimMdStart, type ChangeSpec } from '../text.ts';
import { CommandContext, dropHeldSpace, heldSpaceAt, isEmptyItem, normText } from './context.ts';
import { run } from './plan.ts';

/**
 * Settles placeholders the caret has left. A place the text can express without help
 * (an empty item after another item) just stops being a placeholder; the line of one it can't (an
 * empty item right after a paragraph, an empty line inside a paragraph or between blocks) is
 * removed. Returns null when nothing changes.
 */
export function settlePlaceholders(doc: OutlineState, caret: number): { changes: ChangeSpec[]; state: OutlineState } | null {
  const ctx = new CommandContext(doc, { anchor: caret, head: caret });
  const [start, end] = lineSpan(doc.text, caret);
  const abandoned = doc.placeholders.filter((p) => p < start || p > end);
  if (abandoned.length === 0) return null;
  // a placeholder the text can do without just goes
  const matters = abandoned.filter((p) => {
    // an empty last line (after the final line ending) holds nothing to remove
    if (p === doc.text.length && /[\r\n]$/.test(doc.text)) return false;
    const without = OutlineState.parse(doc.text, { placeholders: doc.placeholders.filter((q) => q !== p), config: doc.config });
    return ctx.plan.differenceFrom(without, doc, 'tree') !== null;
  });
  if (matters.length === 0) return { changes: [], state: doc.update([], { drop: abandoned }) };
  // a deleted character's place after a marker: leaving it, the surplus space goes, the text escaped
  // where it would start a block right after the marker (`- \``` x`)
  const spaces = matters.filter((p) => heldSpaceAt(doc, p));
  if (spaces.length) {
    let expected = ctx.plan;
    const changes = spaces.flatMap((p) => {
      const held = dropHeldSpace(ctx, p, expected);
      expected = held.plan;
      return held.changes;
    });
    const next = doc.update(changes, { drop: [...abandoned] });
    if (expected.differenceFrom(next, doc, 'tree') === null) return { changes, state: next };
  }
  // an empty item the text can hold set off by a blank line (an empty child under text, an empty
  // item right after a paragraph) stays, written that way
  const kept = keptApart(ctx, matters, abandoned);
  if (kept) return kept;
  // the others take their node with them: an empty node goes (what it held goes back to its place),
  // an empty line inside a node's text goes from it; the encoder writes it
  let expected = ctx.plan;
  const done = new Set<OutlineNode>();
  for (const p of matters) {
    const lineNo = doc.lineAt(p).index;
    const node = doc.nodeAtLine(lineNo);
    // an empty node can span several placeholder lines: it goes once
    if (!node || !node.parent || done.has(node)) continue;
    done.add(node);
    const text = doc.headLines(node);
    if (OutlineState.isEmptyText(text.join('\n'))) {
      expected = expected.place('instead', node, node.children);
      continue;
    }
    const { lines } = doc.contentOf(node);
    const index = lineNo - doc.lines.findIndex((line) => doc.nodeAtLine(line.index) === node);
    // a task's first line, emptied, keeps its checkbox: the line after comes up after it
    const box = index === 0 ? trimMd(/^[ \t]*\[[ xX]\][ \t]*$/.exec(text[0]!)?.[0] ?? '') || undefined : undefined;
    const without = (all: readonly string[]): string[] =>
      box && all.length > 1 ? [`${box} ${trimMdStart(all[1]!)}`, ...all.slice(2)] : all.filter((_, i) => i !== index);
    expected = expected.update(node, (n) => ({ ...n, text: normText(without(text)), lines: without(lines!) }));
  }
  if (!expected.changed) return null;
  const plan = ctx.encode(expected);
  if ('status' in plan) return null;
  // what can't be written as meant stays as it is, its placeholder kept
  const result = run(ctx, { ...plan, drop: abandoned });
  if (result.status !== 'applied') return null;
  // as one change, the span that differs: where the caret went, onto the line below an emptied one
  // (or anywhere past the edit), it keeps its place in the text
  return { changes: diffText(doc.text, result.state.text), state: result.state };
}

/**
 * The empty items of `placeholders` kept by a blank line above each, which lets the text hold them:
 * the result, when the text then reads as the outline did, or null.
 */
function keptApart(ctx: CommandContext, placeholders: readonly number[], abandoned: readonly number[]): { changes: ChangeSpec[]; state: OutlineState } | null {
  const { doc } = ctx;
  const changes: ChangeSpec[] = [];
  for (const p of placeholders) {
    const line = doc.lineAt(p);
    const node = doc.nodeAtLine(line.index);
    if (!node || node.kind !== 'item' || node.startLine !== line.index || !isEmptyItem(ctx, node)) return null;
    // the blank line keeps the quotes around the item
    const piece = line.prefix.find((candidate) => candidate.block === node.block);
    const blank = trimMdEnd(doc.text.slice(line.from, piece ? piece.from : line.from));
    changes.push({ from: line.from, to: line.from, insert: blank + ctx.ending(line) });
  }
  const next = doc.update(changes, { drop: [...abandoned] });
  return ctx.plan.differenceFrom(next, doc, 'tree') === null ? { changes, state: next } : null;
}
