// Cmd-Shift-K, delete subtree, (spec/delete-subtree.md): the command says which nodes
// go and where the caret lands; `done()` and the writer do the rest (blank lines, lists, escapes).

import type { OutlineNode } from '../doc/index.ts';
import { CommandContext, reject, type CommandOutcome } from './context.ts';
import { copyOrCutCommand } from './copy.ts';
import { operandsOf, operandsRefused, selectionInText, textEnd, textStart, withTextlessParents } from './util.ts';

/**
 * The selected nodes go, with their subtrees (spec/delete-subtree.md), and a quote without text they
 * are all of with them. The caret goes to the end of the text above, or where the first goes, to the
 * start of the text after them. Given the nodes by id, a selection outside them stays where it is.
 * With `expectMarkdown`, refused (`content-changed`) unless a copy of the nodes gives that text: the
 * source's half of a drag out, whose payload it was, which mustn't delete what wasn't carried.
 */
export function deleteSubtreeCommand(ctx: CommandContext, expectMarkdown?: string): CommandOutcome {
  const doc = ctx.doc;
  const nodes = operandsOf(ctx);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  if (expectMarkdown !== undefined) {
    const copied = copyOrCutCommand(new CommandContext(doc, ctx.selection, nodes.map((n) => n.id)), 'copy');
    if (copied?.status !== 'applied' || copied.clipboard?.['text/plain'] !== expectMarkdown) return reject('content-changed', 'the nodes are no longer the Markdown dragged out');
  }
  const gone = withTextlessParents(doc, nodes);
  const draft = ctx.draft().remove(gone);
  if (ctx.nodes) {
    const from = doc.rangeOf(gone[0]!).from;
    const to = doc.rangeOf(gone[gone.length - 1]!).to;
    const out = (pos: number): boolean => pos < from || pos > to;
    if (out(ctx.selection.anchor) && out(ctx.selection.head)) {
      selectionInText(ctx, draft);
      return ctx.apply(draft);
    }
  }
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
