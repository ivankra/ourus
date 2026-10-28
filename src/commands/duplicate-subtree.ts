// Duplicate subtree (spec/duplicate-subtree.md): a copy of the selected nodes, with
// their subtrees, below them. The command says what is copied and where the caret goes; `done()`
// numbers the list, keeps the copies apart from what is around them, or refuses where it can't.

import { ProseText, type OutlineNode, type OutlineNodePersistent } from '../doc/index.ts';
import type { AnchorSpec } from '../draft/index.ts';
import { reject, type CommandContext, type CommandOutcome } from './context.ts';
import { caretOffset, headingLevel, operandsOf, operandsRefused, textEnd } from './util.ts';

/**
 * The selected nodes copied right below them, each copy written as its original is (rules 1, 4, 6),
 * the caret going along into the copy where it was in the original, but in code between its
 * delimiters (rules 2, 9). Refused where copies before a heading would land in its section (rule 7).
 * Null (unsupported) where ourus doesn't do it yet: a selection end outside the copied nodes' texts.
 * Given the nodes by id, a selection not all in them stays where it is.
 */
export function duplicateSubtreeCommand(ctx: CommandContext): CommandOutcome {
  const nodes = operandsOf(ctx);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  // the copies go after the last heading's section: those before it that it would take in (any node
  // but a heading of its level or above) would land under another parent than their originals
  const level = (n: OutlineNode): number => headingLevel(ctx, n);
  const last = nodes.map((n) => n.kind).lastIndexOf('heading');
  if (last > 0 && nodes.slice(0, last).some((n) => n.kind !== 'heading' || level(n) > level(nodes[last]!))) {
    return reject('not-expressible', 'the copies before the heading would land in its section');
  }
  // a placeholder in what is copied: not done yet (a copy's are written anew where it lands)
  if (nodes.some((n) => ctx.doc.marks.marks.some((m) => m.from >= ctx.doc.rangeOf(n).from && m.from <= ctx.doc.rangeOf(n).to))) return null;
  const draft = ctx.draft();
  const ids = new Map<OutlineNodePersistent, number>();
  draft.place('after', nodes[nodes.length - 1]!, nodes.map((n) => draft.copy(n, ids)));
  // each end in the copy of the node it is in
  const end = (pos: number): AnchorSpec | null => {
    const at = ctx.doc.locate(pos);
    if (at.zone === 'gap') {
      const id = ids.get(at.owner.persistentNode);
      const text = ctx.doc.textOf(at.owner);
      return id !== undefined && text ? { ref: id, offset: textEnd(text), assoc: -1 } : null;
    }
    if (at.zone !== 'text' && at.zone !== 'frame' && at.zone !== 'marker' && at.zone !== 'prefix') return null;
    const id = ids.get(at.node.persistentNode);
    const text = at.zone === 'text' || at.zone === 'frame' ? at.text : ctx.doc.textOf(at.node);
    if (id === undefined || !text) return null;
    return { ref: id, offset: caretOffset(at, text), assoc: 1 };
  };
  let head = end(ctx.selection.head);
  let anchor = ctx.collapsed ? head : end(ctx.selection.anchor);
  if ((!head || !anchor) && ctx.nodes) {
    // each end in its text, where it is in one
    const kept = (pos: number): AnchorSpec => {
      const at = ctx.doc.locate(pos);
      return at.zone === 'text' && at.text instanceof ProseText ? { ref: at.node, offset: at.offset } : { old: pos };
    };
    [anchor, head] = [kept(ctx.selection.anchor), kept(ctx.selection.head)];
  }
  if (!head || !anchor) return null;
  return ctx.apply(draft.select(anchor, head));
}
