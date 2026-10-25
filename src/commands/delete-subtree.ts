// Cmd-Shift-K, delete subtree, (spec/delete-subtree.md): the command says which nodes
// go and where the caret lands; `done()` and the writer do the rest (blank lines, lists, escapes).

import type { OutlineNode } from '../doc/index.ts';
import type { CommandContext, CommandOutcome } from './context.ts';
import { operands, operandsRefused, textEnd, textStart, withTextlessParents } from './util.ts';

/**
 * The selected nodes go, with their subtrees (spec/delete-subtree.md), and a quote without text they
 * are all of with them. The caret goes to the end of the text above, or where the first goes, to the
 * start of the text after them.
 */
export function deleteSubtreeCommand(ctx: CommandContext): CommandOutcome {
  const doc = ctx.doc;
  const nodes = operands(doc, ctx.selection);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  const gone = withTextlessParents(doc, nodes);
  const draft = ctx.draft().remove(gone);
  let above = gone[0]!.preceding;
  while (above && above.kind !== 'root' && !doc.textOf(above)) above = above.preceding;
  let after = gone[gone.length - 1]!.afterSubtree;
  while (after?.kind === 'atom' && after.block.type === 'thematic_break') after = after.afterSubtree;
  if (above && above.kind !== 'root') draft.setCaret(above, textEnd(doc.textOf(above)!), -1);
  else if (after) {
    // (in the first text there, past a quote's `>`)
    let at: OutlineNode | null = after;
    while (at && !doc.textOf(at)) at = at.children[0] ?? at.afterSubtree;
    const text = at ? doc.textOf(at) : null;
    if (!at || !text) return null;
    draft.setCaret(at, textStart(text), 1);
  } else draft.setCaretAt(0);
  return ctx.apply(draft);
}
