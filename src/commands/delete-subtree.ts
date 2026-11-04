// Cmd-Shift-K, delete subtree, (spec/delete-subtree.md): the command says which nodes
// go and where the caret lands; `done()` and the writer do the rest (blank lines, lists, escapes).

import { OurusAtom, type OurusNode } from '../doc/index.ts';
import { CommandContext } from './context.ts';
import { copyOrCutCommand } from './copy.ts';
import { goneWithTextlessParents, operandsOf, operandsRefused, selectionInText, textEnd, textStart } from './util.ts';
import type { OurusResult } from './types.ts';
import { OurusSuccess, OurusRejected } from './types.ts';

/**
 * The selected nodes go, with their subtrees (spec/delete-subtree.md), at whatever depths, and a
 * quote without text they are all of with them. The caret goes to the end of the text above, or where the first goes, to the
 * start of the text after them. Given the nodes by id, a selection outside them stays where it is.
 * With `expectMarkdown`, refused (`content-changed`) unless a copy of the nodes gives that text: the
 * source's half of a drag out, whose payload it was, which mustn't delete what wasn't carried.
 */
export function deleteSubtreeCommand(ctx: CommandContext, expectMarkdown?: string): OurusResult | null {
  const doc = ctx.doc;
  const view = ctx.view;
  const given = operandsOf(ctx);
  if (!Array.isArray(given)) return operandsRefused(given);
  // (a node given with an ancestor goes with it)
  // (by id, up each one's ancestors: linear in a wide selection)
  const ids = new Set(given.map((n) => n.id));
  const nodes = given.filter((n) => {
    for (let up = n.parent; up; up = up.parent) if (ids.has(up.id)) return false;
    return true;
  });
  if (expectMarkdown !== undefined) {
    const copied = copyOrCutCommand(new CommandContext(view, ctx.selection, nodes.map((n) => n.id)), 'copy');
    if (!(copied instanceof OurusSuccess) || copied.clipboard?.['text/plain'] !== expectMarkdown) return new OurusRejected('content-changed', 'the nodes are no longer the Markdown dragged out');
  }
  const gone = goneWithTextlessParents(doc, nodes);
  const draft = ctx.draft().remove(gone);
  // (the last of its list going, or of its parent's children, with a block after it: the node before
  // it keeps the blank lines that set them off from it, a list from a table after it, say; a gap of its
  // own as large, it keeps its own. Items after it join the list there: DeleteSubtree13)
  const end = gone[gone.length - 1]!;
  const before = gone[0]!.preceding;
  const endsList = end.kind === 'item' && (!end.next || end.next.kind !== 'item' || doc.listOf(end.next)?.block !== doc.listOf(end)?.block);
  // (before it in its parent: a parent above it, a quote it was first in, has no blank lines of its own to set it off)
  if ((!end.next || endsList) && end.afterSubtree && end.afterSubtree.kind !== 'item' && before && before.kind !== 'root' && gone[0]!.index > 0 && !gone[0]!.isWithin(before) && !gone.some((g) => before.isWithin(g))) {
    const blanks = end.lastDescendant.gap;
    if (blanks > before.gap) draft.gap(before, blanks);
  }
  // (what went, on purpose: their block ids with them)
  const removed = (outcome: OurusResult | null): OurusResult | null => (outcome instanceof OurusSuccess ? new OurusSuccess({ ...outcome, removedNodes: gone.map((n) => n.id) }) : outcome);
  if (ctx.nodes) {
    // (each one's lines, not the span from the first to the last: a node between them stays; last in
    // the document, past the final line break too, nothing after it to keep a caret in)
    const ranges = gone.map((g) => ({ from: doc.rangeOf(g).from, to: g.afterSubtree ? doc.rangeOf(g).to : doc.text.length }));
    // (their blank lines theirs: a caret there is in what goes)
    const theirs = (pos: number): boolean => {
      const at = view.locate(pos);
      return at.zone === 'gap' && gone.some((g) => g === at.owner || isAbove(g, at.owner));
    };
    const out = (pos: number): boolean => ranges.every((r) => pos < r.from || pos > r.to) && !theirs(pos);
    if (out(ctx.selection.anchor) && out(ctx.selection.head)) {
      selectionInText(ctx, draft);
      return removed(ctx.apply(draft));
    }
  }
  let above = gone[0]!.preceding;
  while (above && above.kind !== 'root' && !doc.textOf(above)) above = above.preceding;
  let after = gone[gone.length - 1]!.afterSubtree;
  while (after?.kind === 'atom' && after.block.type === 'thematic_break') after = after.afterSubtree;
  if (above && above.kind !== 'root') draft.setCaret(above, textEnd(doc.textOf(above)!), -1);
  else if (after) {
    // (in the first text there, past a quote's `>`)
    let at: OurusNode | null = after;
    while (at && !doc.textOf(at)) at = at.children[0] ?? at.afterSubtree;
    const text = at ? doc.textOf(at) : null;
    if (!at || !text) return null;
    // (before a fenced block's opening delimiter, where markup is text: at its payload's start the next
    // paste, a cut's put back, would go into the code; where markup is decorated the fence is no place
    // for a caret)
    const open = text instanceof OurusAtom && ctx.config.markup === 'text' ? text.frame.find((p) => p.part === 'open') : undefined;
    draft.setCaret(at, open ? open.from : textStart(text), 1);
    // (nothing left: at the note's start, past a byte-order mark)
  } else draft.setCaretAt(doc.mdTree.documentStart);
  return removed(ctx.apply(draft));
}

/** Whether `a` is an ancestor of `b`. */
function isAbove(a: OurusNode, b: OurusNode): boolean {
  return a !== b && b.isWithin(a);
}
