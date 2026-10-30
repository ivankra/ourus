// Duplicate subtree (spec/duplicate-subtree.md): a copy of the selected nodes, with
// their subtrees, below them. The command says what is copied and where the caret goes; `done()`
// numbers the list, keeps the copies apart from what is around them, or refuses where it can't.

import { OurusAtom, OurusProse, withoutBlockIds, type OurusNode, type PersistentNode } from '../doc/index.ts';
import { trimMd } from '../text/index.ts';
import type { AnchorSpec } from '../writer/index.ts';
import { reject, type CommandContext, type CommandOutcome } from './context.ts';
import { reshaped, shapeOf } from './shape.ts';
import { caretOffset, headingLevel, oneRun, operandsRefused, textEnd } from './util.ts';
import { withFolds } from './view.ts';

/**
 * The selected nodes copied right below them, each copy written as its original is (rules 1, 4, 6),
 * the caret going along into the copy where it was in the original, but in code between its
 * delimiters (rules 2, 9). Refused where copies before a heading would land in its section (rule 7).
 * Over a subtree selection, the copies selected so, in the shape it was given. Null (unsupported)
 * where ourus doesn't do it yet: another selection with an end outside the copied nodes' texts.
 * Given the nodes by id, a selection not all in them stays where it is.
 */
export function duplicateSubtreeCommand(ctx: CommandContext): CommandOutcome {
  const nodes = oneRun(ctx);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  // the copies go after the last heading's section: those before it that it would take in (any node
  // but a heading of its level or above) would land under another parent than their originals
  const level = (n: OurusNode): number => headingLevel(ctx, n);
  const last = nodes.map((n) => n.kind).lastIndexOf('heading');
  if (last > 0 && nodes.slice(0, last).some((n) => n.kind !== 'heading' || level(n) > level(nodes[last]!))) {
    return reject('not-expressible', 'the copies before the heading would land in its section');
  }
  // a placeholder in what is copied: not done yet (a copy's are written anew where it lands: a held
  // space, an empty node with children, an empty paragraph, which holds only with one), but in the
  // item Enter just made, empty and alone, its copy as empty, an empty item without a placeholder
  const held = nodes.some((n) => ctx.doc.marks.marks.some((m) => m.from >= ctx.doc.rangeOf(n).from && m.from <= ctx.doc.rangeOf(n).to));
  const fresh = nodes.length === 1 && nodes[0]!.kind === 'item' && !nodes[0]!.children.length && (ctx.doc.textOf(nodes[0]!) as OurusProse | null)?.empty === true;
  if (held && !fresh) return null;
  const draft = ctx.draft();
  const ids = new Map<PersistentNode, number>();
  const copies = nodes.map((n) => draft.copy(n, ids));
  const original = nodes[nodes.length - 1]!;
  draft.place('after', original, copies);
  // the copies without block ids: a block id names one block; a node that is only one isn't copied
  // where nothing under it is; where something is, a paragraph's children (a list it owns) take its
  // place, any other is an empty node of its kind
  const named = new Set(ctx.doc.blockIds().map((b) => b.owner.id));
  const uncopied = new Set<PersistentNode>();
  const unname = (n: OurusNode): void => {
    n.children.forEach(unname);
    const copy = ids.get(n.persistentNode)!;
    const own = ctx.doc.textOf(n);
    // (a quote with no text of its own, none of whose children is copied: none either)
    const emptied = n.children.length > 0 && n.children.every((c) => uncopied.has(c.persistentNode));
    if (n.kind === 'quote' && !own && emptied) {
      uncopied.add(n.persistentNode);
      draft.remove([copy]);
      return;
    }
    if (!named.has(n.id) || !own) return;
    const text = withoutBlockIds(own);
    const bare = text instanceof OurusProse && trimMd(text.body) === '' && !text.blockIdLines.length;
    if (bare && (n.kind === 'paragraph' || !n.children.length || emptied)) {
      uncopied.add(n.persistentNode);
      if (n.children.length && !emptied) draft.dissolve(copy);
      else draft.remove([copy]);
      return;
    }
    // (a setext title of nothing is no heading: an ATX one of its level)
    draft.setText(copy, bare && text.heading?.form === 'setext' ? new OurusProse('heading', text.item, `${'#'.repeat(text.heading.level)} `) : text);
  };
  nodes.forEach(unname);
  // each item copy lined up with its original, as its line is written (a quote's `>` as it is)
  nodes.forEach((n, k) => n.kind === 'item' && draft.lineUp(copies[k]!, n));
  // in a loose list, spaced as its items are, as paste places them: the original apart from its copy,
  // each copy apart from what follows it in the list, the last one taking the original's blank lines
  // where nothing in the list follows
  const list = original.kind === 'item' ? ctx.doc.listOf(original) : null;
  if (list && list.block.attrs.tight === false) {
    const lastOf = (id: number): number => {
      const kids = draft.touched(id).children;
      return kids.length ? lastOf(kids[kids.length - 1]!) : id;
    };
    const gap = original.lastDescendant.gap;
    const next = !!original.next && original.next.kind === 'item' && ctx.doc.listOf(original.next)?.block === list.block;
    // (but an original or a copy ending in a block of lines nothing closes, a node not copied after
    // it, a block id alone: blank lines after it would be its lines, which `done()` keeps from it)
    const open = (id: number): boolean => {
      const text = draft.touched(id).text;
      return text instanceof OurusAtom && !text.closed && text.frame.some((p) => p.part === 'open');
    };
    const at = original.lastDescendant;
    const ending = ctx.doc.textOf(at);
    if (!(ending instanceof OurusAtom && !ending.closed && ending.frame.some((p) => p.part === 'open'))) draft.gap(original.lastDescendant, Math.max(gap, 1));
    copies.forEach((id, k) => {
      const last = lastOf(id);
      if (!open(last)) draft.gap(last, k < copies.length - 1 || next ? Math.max(1, k === copies.length - 1 ? gap : 1) : gap);
    });
  }
  // each end in the copy of the node it is in (in its original where it has none, a block id alone;
  // at most at the end of a copy without its block ids)
  const end = (pos: number): AnchorSpec | null => {
    const at = ctx.doc.locate(pos);
    const node = at.zone === 'gap' ? at.owner : 'node' in at ? at.node : null;
    if (node && uncopied.has(node.persistentNode)) return { old: pos, assoc: 1 };
    if (at.zone === 'gap' || at.zone === 'blockIdLine') {
      const owner = at.zone === 'gap' ? at.owner : at.node;
      const id = ids.get(owner.persistentNode);
      const text = ctx.doc.textOf(owner);
      return id !== undefined && text ? { ref: id, offset: textEnd(withoutBlockIds(text)), assoc: -1 } : null;
    }
    if (at.zone !== 'text' && at.zone !== 'frame' && at.zone !== 'marker' && at.zone !== 'prefix') return null;
    const id = ids.get(at.node.persistentNode);
    const text = at.zone === 'text' || at.zone === 'frame' ? at.text : ctx.doc.textOf(at.node);
    if (id === undefined || !text) return null;
    return { ref: id, offset: Math.min(caretOffset(at, text), withoutBlockIds(text).text.length), assoc: 1 };
  };
  // a subtree selection: the copies, in its shape (`reshaped`, from a caret in the first copy with
  // text: a first root with none of its own, `- - a` or a quote without a title, has its child's)
  const shape = ctx.nodes ? null : shapeOf(ctx.doc, ctx.selection);
  const texted = (n: OurusNode): OurusNode | undefined => (ctx.doc.textOf(n) ? n : n.children.map(texted).find(Boolean));
  const first = shape?.kind === 'subtrees' ? nodes.map(texted).find((n) => n && !uncopied.has(n.persistentNode)) : undefined;
  const copied = first ? ({ ref: ids.get(first.persistentNode)!, offset: 0 } as const) : null;
  let head = copied ?? end(ctx.selection.head);
  let anchor = copied ?? (ctx.collapsed ? head : end(ctx.selection.anchor));
  if ((!head || !anchor) && ctx.nodes) {
    // each end in its text, where it is in one
    const kept = (pos: number): AnchorSpec => {
      const at = ctx.doc.locate(pos);
      return at.zone === 'text' && at.text instanceof OurusProse ? { ref: at.node, offset: at.offset } : { old: pos };
    };
    [anchor, head] = [kept(ctx.selection.anchor), kept(ctx.selection.head)];
  }
  if (!head || !anchor) return null;
  // a folded node's copy is folded too, and every fold inside it
  const folds: number[] = [];
  const visit = (n: OurusNode): void => {
    if (ctx.doc.folded.has(n.id) && ids.has(n.persistentNode)) folds.push(ids.get(n.persistentNode)!);
    n.children.forEach(visit);
  };
  nodes.forEach(visit);
  const applied = withFolds(ctx.apply(draft.select(anchor, head)), folds);
  return copied ? reshaped(applied, shape, (id) => ids.get(ctx.doc.node(id)!.persistentNode)) : applied;
}
