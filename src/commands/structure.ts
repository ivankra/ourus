// Structural commands: indent, outdent, moves, heading levels, delete and duplicate. The lowest
// family: the others call it, it calls none of them.

import type { OutlineNode } from '../outline/index.ts';
import type { ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode, type EncodeResult } from '../encoder/index.ts';
import type { Selection } from './index.ts';
import { CommandContext, Operands, mapSelection, operands } from './context.ts';
import { notApplicable, reject, type Outcome } from './plan.ts';

/** The run leaves its quote, to follow it. */
export function leaveQuote(ctx: CommandContext, ops: Operands): Outcome {
  const quote = ops.parent;
  // a quote the operands empty goes: they take its place
  if (ops.nodes.length === quote.children.length) return ctx.encode(ctx.plan.place('instead', quote, ops.nodes));
  return ctx.encode(ctx.plan.remove(ops.nodes).place('after', quote, ops.nodes));
}

/** The run becomes the last children of the item (or quote) above it. */
export function indent(ctx: CommandContext, ops: Operands): Outcome {
  const parent = ops.parent;
  const prev = ops.prev;
  if (!prev) return reject('no-previous-sibling');
  if (prev.kind === 'quote') return ctx.encode(ctx.plan.remove(ops.nodes).append(prev, 'last', ops.nodes));
  if (prev.kind !== 'item') return reject('not-expressible', 'only a list item can hold list items');
  return ctx.encode(ctx.plan.remove(ops.nodes).append(prev, 'last', ops.nodes));
}

/**
 * `node` as a new node of another kind (a paragraph indented into a list, an item outdented out of a
 * paragraph's list): the same text and children.
 */
function converted(ctx: CommandContext, node: OutlineNode, kind: 'item' | 'paragraph'): OutlinePlanNode {
  const { doc } = ctx;
  const { lines } = doc.contentOf(node);
  // the same node in another kind: it keeps its id
  return { id: node.id, kind, text: doc.nodeText(node), lines, ...(kind === 'item' ? { marker: doc.config.bullet } : {}), children: node.children };
}

/** The selection kept on the same text, now in `nodes` converted to `copies`. */
function convertedSelection(ctx: CommandContext, nodes: readonly OutlineNode[], copies: readonly OutlinePlanNode[]): (writtenOutline: EncodeResult) => Selection {
  const { doc } = ctx;
  const at = (pos: number, writtenOutline: EncodeResult): number => {
    const line = doc.lineAt(pos);
    const i = nodes.findIndex((node) => line.index >= node.startLine && line.index <= node.headEndLine);
    if (i < 0) return writtenOutline.map(pos, 1);
    const lines = copies[i]!.lines!;
    const index = line.index - nodes[i]!.startLine;
    const contentFrom = line.to - lines[index]!.length;
    return writtenOutline.at(copies[i]!, index, Math.max(0, pos - contentFrom));
  };
  return (writtenOutline) => ({ anchor: at(ctx.sel.anchor, writtenOutline), head: at(ctx.sel.head, writtenOutline) });
}

/** Paragraphs indented under the node above become its list items. */
export function indentParagraphs(ctx: CommandContext, ops: Operands): Outcome {
  const parent = ops.parent;
  const prev = ops.prev;
  // into a quote, a paragraph stays a paragraph
  if (prev?.kind === 'quote') return ctx.encode(ctx.plan.remove(ops.nodes).append(prev, 'last', ops.nodes));
  const holds = prev?.kind === 'paragraph' || prev?.kind === 'item';
  // in a section, with nothing above to hold them, the paragraphs become items in place: outdent's inverse
  if (!holds && parent.kind !== 'root' && parent.kind !== 'heading') return prev ? reject('not-expressible', 'only a paragraph or an item can hold list items') : reject('no-previous-sibling');
  const items = ops.nodes.map((node) => converted(ctx, node, 'item'));
  const expected = holds
    ? ctx.plan.remove(ops.nodes).append(prev, 'last', items)
    : ctx.plan.update(parent, (p) => {
        const i = p.children.indexOf(ops.first);
        return { ...p, children: [...p.children.slice(0, i), ...items, ...p.children.slice(i + ops.nodes.length)] };
      });
  return ctx.encode(expected, {}, convertedSelection(ctx, ops.nodes, items));
}

/**
 * The run leaves its parent item, to follow it; out of a paragraph's list, the items become
 * paragraphs. The first items of a list in a section become paragraphs too. Later siblings follow
 * `doc.config.outdent`: direct makes them children of the run's last node, after its own; logical
 * leaves them with their parent, the run passing them.
 */
export function outdent(ctx: CommandContext, ops: Operands): Outcome {
  const { doc } = ctx;
  const parent = ops.parent;
  const direct = doc.config.outdent === 'direct';
  const last = ops.last;
  const later = parent.children.slice(parent.children.indexOf(last) + 1);
  if (parent.kind === 'paragraph' || parent.kind === 'root' || parent.kind === 'heading') {
    if (parent.kind !== 'paragraph') {
      // in a section, only the first items of a list can outdent
      const prev = ops.prev;
      if (prev?.kind === 'item') return reject('at-top-level');
    }
    const paragraphs = ops.nodes.map((node) => converted(ctx, node, 'paragraph'));
    const select = convertedSelection(ctx, ops.nodes, paragraphs);
    if (parent.kind !== 'paragraph') {
      // direct: in place, the rest of the list becoming theirs; logical: past the rest of the list
      const items = later.slice(0, (later.findIndex((node) => node.kind !== 'item') + 1 || later.length + 1) - 1);
      const tail = direct ? [] : items;
      const expected = ctx.plan.update(parent, (p) => {
        const i = p.children.indexOf(ops.first);
        return { ...p, children: [...p.children.slice(0, i), ...tail, ...paragraphs, ...p.children.slice(i + ops.nodes.length + tail.length)] };
      });
      return ctx.encode(expected, {}, select);
    }
    // after the paragraph, an item would join its list again; direct: the items after the operands
    // follow it, and join the last new paragraph's list
    const moved = direct ? [...paragraphs, ...later] : paragraphs;
    const expected = ctx.plan.remove(direct ? [...ops.nodes, ...later] : ops.nodes).place('after', parent, moved);
    return ctx.encode(expected, {}, select);
  }
  if (parent.kind !== 'item') return reject('at-top-level');
  if (!direct || later.length === 0) return ctx.encode(ctx.plan.remove(ops.nodes).place('after', parent, ops.nodes));
  const adopting: OutlinePlanNode = { ...OutlinePlan.editable(last), children: [...last.children, ...later] };
  const moved = [...ops.nodes.slice(0, -1), adopting];
  return ctx.encode(ctx.plan.remove([...ops.nodes, ...later]).place('after', parent, moved));
}

export function headingLevel(ctx: CommandContext, ops: Operands, delta: number): Outcome {
  const { doc } = ctx;
  const headings: OutlineNode[] = [];
  const walk = (n: OutlineNode): void => {
    if (n.kind === 'heading') headings.push(n);
    n.children.forEach(walk);
  };
  ops.nodes.forEach(walk);
  const changes: ChangeSpec[] = [];
  for (const h of headings) {
    const level = h.head!.level! + delta;
    if (level < 1) return reject('at-h1-bound');
    if (level > 6) return reject('at-h6-bound');
    if (h.head!.setext) {
      if (level > 2) return reject('not-expressible', 'a setext heading has levels 1 and 2 only');
      const underline = doc.lines[h.head!.endLine]!;
      const from = underline.contentFrom;
      const text = doc.text.slice(from, underline.to);
      changes.push({ from, to: underline.to, insert: text.replace(/[=-]/g, level === 1 ? '=' : '-') });
    } else {
      const line = doc.lines[h.startLine]!;
      const hash = doc.text.indexOf('#', line.contentFrom);
      changes.push(delta > 0 ? { from: hash, to: hash, insert: '#' } : { from: hash, to: hash + 1, insert: '' });
    }
  }
  let expected = ctx.plan;
  for (const h of headings) expected = expected.update(h, (n) => ({ ...n, level: h.head!.level! + delta }));
  return { changes, selection: mapSelection(changes, ctx.sel, 1), expected, compare: 'flat' };
}

/**
 * The run swaps places with the sibling above or below it. At the edge of its parent it crosses into
 * the parent's sibling, as its last (up) or first (down) children. Items move past a paragraph: below
 * it they become its first list items; above it (out of its list) they follow the node before it.
 */
export function move(ctx: CommandContext, ops: Operands, dir: -1 | 1): Outcome {
  // a move of everything in a quote moves the quote
  while (ops.parent.kind === 'quote' && ops.nodes.length === ops.parent.children.length) ops = new Operands([ops.parent]);
  const { first, parent } = ops;
  const other = dir < 0 ? ops.prev : ops.next;
  const items = first.kind === 'item';
  if (!other) {
    // out of a paragraph's list, upward: above the paragraph
    if (dir < 0 && items && parent.kind === 'paragraph') return ctx.encode(ctx.plan.remove(ops.nodes).place('before', parent, ops.nodes));
    const grand = parent.parent;
    let into = grand && (dir < 0 ? grand.children[grand.children.indexOf(parent) - 1] : grand.children[grand.children.indexOf(parent) + 1]);
    // up out of a sub-heading's section into the enclosing section's own nodes: before the sub-heading,
    // at the section's level, not under the node above it
    if (dir < 0 && parent.kind === 'heading' && first.kind !== 'heading' && into && into.kind !== 'heading') {
      return ctx.encode(ctx.plan.remove(ops.nodes).place('before', parent, ops.nodes));
    }
    // up into a section that ends with a sub-heading: the end of that sub-heading's section is where the
    // text above ends
    if (dir < 0 && into?.kind === 'heading' && first.kind !== 'heading') {
      while (into.children[into.children.length - 1]?.kind === 'heading') into = into.children[into.children.length - 1]!;
    }
    if (!into || !canHold(into, first)) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
    return ctx.encode(ctx.plan.remove(ops.nodes).append(into, dir < 0 ? 'last' : 'first', ops.nodes));
  }
  // an item below a paragraph becomes its first list item
  if (dir > 0 && items && other.kind === 'paragraph') return ctx.encode(ctx.plan.remove(ops.nodes).append(other, 'first', ops.nodes));
  // down past a sub-heading: into its section, as its first node
  if (dir > 0 && other.kind === 'heading' && first.kind !== 'heading') return ctx.encode(ctx.plan.remove(ops.nodes).append(other, 'first', ops.nodes));
  // a quote swaps with any node but a heading (which owns what follows it); blocks swap with
  // blocks, items with items
  const group = (k: string) => (k === 'paragraph' || k === 'atom' ? 'leaf' : k);
  const quote = (first.kind === 'quote' || other.kind === 'quote') && first.kind !== 'heading' && other.kind !== 'heading';
  if (!quote && group(other.kind) !== group(first.kind)) return reject('not-expressible', `can't reorder ${first.kind} past ${other.kind}`);
  if (first.kind === 'heading' && other.kind === 'heading' && first.head!.level !== other.head!.level) return reject('not-expressible', 'a heading moves among headings of its level');
  const upper = dir < 0 ? [other] : ops.nodes;
  const lower = dir < 0 ? ops.nodes : [other];
  const expected = ctx.plan.update(parent, (p) => {
    const i = p.children.indexOf(upper[0]!);
    return { ...p, children: [...p.children.slice(0, i), ...lower, ...upper, ...p.children.slice(i + upper.length + lower.length)] };
  });
  return ctx.encode(expected);
}

/** Whether a moved run starting with `node` can cross into `into` as its children: an item into an item or a paragraph's list, anything into a heading's section. */
function canHold(into: OutlineNode, node: OutlineNode): boolean {
  // a heading's section takes anything but a heading (as its first child, a heading would take in the
  // section's other nodes)
  if (into.kind === 'heading') return node.kind !== 'heading';
  if (node.kind === 'item') return into.kind === 'item' || into.kind === 'paragraph';
  return false;
}


/** The selected nodes go, with their subtrees; the caret goes to the end of the text above, or to what follows. */
export function deleteSubtree(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const ops = operands(ctx);
  if (ops === null) return notApplicable;
  if ('status' in ops) return ops;
  const expected = ctx.plan.remove(ops.nodes);
  const above = doc.before(ops.first);
  const after = doc.after(doc.lastDescendant(ops.last));
  return ctx.encode(expected, {}, (writtenOutline) => {
    const caret =
      above && above.kind !== 'root'
        ? writtenOutline.map(doc.headRange(above)?.to ?? doc.lines[above.headEndLine]!.to, -1)
        : after
          ? writtenOutline.map(doc.textStart(doc.lines[after.startLine]!.from), 1)
          : 0;
    return { anchor: caret, head: caret };
  });
}

/** A copy of the selected nodes, with their subtrees, goes below them; the caret goes along into it. */
export function duplicate(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const ops = operands(ctx);
  if (ops === null) return notApplicable;
  if ('status' in ops) return ops;
  const copies = ops.nodes.map((node) => OutlinePlan.copy(doc, node));
  const expected = ctx.plan.place('after', ops.last, copies);
  return ctx.encode(expected, {}, convertedSelection(ctx, ops.nodes, copies));
}
