// Structural commands: indent, outdent, moves, heading levels, delete and duplicate. The lowest
// family: the others call it, it calls none of them.

import type { OutlineNode } from '../outline/index.ts';
import { skipSpaces, trimMd, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree, type EncodeResult } from '../encoder/index.ts';
import type { Selection } from './index.ts';
import { CommandContext, Operands, mapSelection, normText, operands, outOfQuoteOpeningItem, lazyLineEscape } from './context.ts';
import { notApplicable, reject, withPlan, type Outcome } from './plan.ts';
import { ownsLists, sectionEnd, unownLists } from './place.ts';

/**
 * The run leaves its quote. With `outdent: direct` it stays where it is in the text, the quote split
 * around it: what followed it in the quote goes on in a quote of its own after it, and a callout's
 * title stays with what was above it. With `logical` it follows the quote, below its other children.
 */
export function leaveQuote(ctx: CommandContext, ops: Operands): Outcome {
  const quote = ops.parent;
  // a quote that is an item's first block (`- > q`): out of it, its first paragraph is the item's text
  const opening = ops.nodes.length === 1 ? outOfQuoteOpeningItem(ctx, ops.first) : null;
  if (opening) return opening;
  // a quote the operands empty goes, unless it has text (a callout's title): they take its place
  if (ops.nodes.length === quote.children.length && !quote.head) return ctx.encode(ctx.plan.place('instead', quote, ops.nodes));
  const after = quote.children.slice(quote.children.indexOf(ops.last) + 1);
  if (ctx.doc.config.outdent === 'logical' || !after.length) return ctx.encode(ctx.plan.remove(ops.nodes).place('after', quote, ops.nodes));
  // first in a quote without a title: the run goes before it, the quote keeping the rest
  if (quote.children[0] === ops.first && !quote.head) return ctx.encode(ctx.plan.remove(ops.nodes).place('before', quote, ops.nodes));
  const rest: OutlinePlanNode = { ...OutlinePlan.created('quote', ''), lines: [], children: after };
  return ctx.encode(ctx.plan.remove([...ops.nodes, ...after]).place('after', quote, [...ops.nodes, rest]));
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
function converted(ctx: CommandContext, node: OutlineNode, kind: 'item' | 'paragraph' | 'heading' | 'atom'): OutlinePlanNode {
  const { doc } = ctx;
  let { lines } = OutlinePlan.textLines(node, doc.contentOf(node));
  // the same node in another kind: it keeps its id
  const extra = kind === 'item' ? { marker: doc.config.bullet } : kind === 'heading' ? { level: node.head!.level! } : kind === 'atom' ? { blockType: node.head!.type } : {};
  // lines its text continued lazily are text, read as a paragraph's own lines (`|---|---|` under a
  // row, `===`): escaped where they would start a block there; an item's are written as its own too
  // (in a quote, after its `>`)
  const lazy = doc.ownLines(node).map((line) => line.lazy);
  let escaped = false;
  if ((kind === 'paragraph' || kind === 'item') && node.head?.type === 'paragraph' && lazy.some(Boolean)) {
    lines = lines!.map((line, i) => {
      const at = lazy[i] ? lazyLineEscape(ctx, line) : null;
      if (at === null) return line;
      escaped = true;
      return line.slice(0, at) + '\\' + line.slice(at);
    });
  }
  // an atom's text is its lines as written, any other node's trimmed (an item's whose text is code)
  const text = kind === 'atom' ? lines!.join('\n') : node.kind === 'atom' || escaped ? normText(lines!) : doc.nodeText(node);
  return { id: node.id, kind, text, lines, ...extra, children: node.children };
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

/**
 * Paragraphs indented become list items, one level in: the first items of the paragraph above, the
 * next items of the list above (Indent29: not its last item's children, two levels in), or items in
 * place.
 */
export function indentParagraphs(ctx: CommandContext, ops: Operands): Outcome {
  const { doc } = ctx;
  const parent = ops.parent;
  const prev = ops.prev;
  // into a quote, a paragraph stays a paragraph, and owns no list there: the list it owned follows it
  if (prev?.kind === 'quote') {
    const moved = unownLists(ops.nodes);
    // last in the quote: in its last section, where it ends with one (a heading owns what follows it)
    return ctx.encode(ctx.plan.remove(ops.nodes).append(sectionEnd(prev, null)!, 'last', moved));
  }
  const section = parent.kind === 'root' || parent.kind === 'heading';
  // only a section's paragraph owns the list after it; in a quote or an item, a paragraph's list is its sibling
  const holds = prev?.kind === 'paragraph' && section;
  // with nothing above to hold them, the paragraphs become items in place: outdent's inverse; after a
  // list, its next items, in its marker; in a quote or an item, after a paragraph, too
  if (!holds && !section && prev?.kind !== 'paragraph' && prev?.kind !== 'item') return prev ? reject('not-expressible', 'only a paragraph or an item can hold list items') : reject('no-previous-sibling');
  const marker = prev?.kind === 'item' ? doc.text.slice(doc.markerFrom(prev.block), doc.markerTo(prev.block)) : null;
  const items = ops.nodes.map((node) => ({ ...converted(ctx, node, 'item'), ...(marker !== null ? { marker } : {}) }));
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
 * paragraphs. Items of a list in a section become paragraphs too. Later siblings follow
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
    // an item whose text is a heading becomes that heading, the rest of the list its section
    const heading = (node: OutlineNode): boolean => node.kind === 'item' && node.head?.type === 'heading';
    // and one whose text is code (or another block of lines) becomes that block, its children after it
    const block = (node: OutlineNode): boolean => node.kind === 'item' && !!node.head && node.head.type !== 'paragraph' && node.head.type !== 'heading';
    const converts = ops.nodes.map((node) => converted(ctx, node, heading(node) ? 'heading' : block(node) ? 'atom' : 'paragraph'));
    const select = convertedSelection(ctx, ops.nodes, converts);
    // only a section's paragraph owns the list after it: in a quote or an item (a section in one too),
    // a new paragraph's list follows it
    const unowned = !ownsLists(parent);
    const paragraphs = converts.flatMap((node): PlanTree[] => (node.kind === 'atom' || (unowned && node.kind === 'paragraph') ? [{ ...node, children: [] }, ...node.children] : [node]));
    const headings = ops.nodes.filter(heading);
    if (headings.length && parent.kind === 'paragraph') return reject('not-expressible', "a heading can't be in a paragraph's list");
    // in place, the rest of the list becoming theirs, under either value: at the top level there is no
    // parent for logical outdent to keep the later items with (as RemNote does it); in a paragraph's
    // list (below) the paragraph is that parent
    if (parent.kind !== 'paragraph') {
      const items = later.slice(0, (later.findIndex((node) => node.kind !== 'item') + 1 || later.length + 1) - 1);
      if (headings.length) {
        // a heading's section is what follows it, up to a heading of its level or above: it may take in
        // the rest of the list, nothing after it, and must stay in the section it is in
        if (later.length > items.length) return reject('not-expressible', 'the heading would take in what follows the list');
        const level = parent.kind === 'heading' ? parent.head!.level! : 0;
        if (headings.some((node) => node.head!.level! <= level)) return reject('not-expressible', 'the heading would end the section it is in');
      }
      const expected = ctx.plan.update(parent, (p) => {
        const i = p.children.indexOf(ops.first);
        return { ...p, children: [...p.children.slice(0, i), ...paragraphs, ...p.children.slice(i + ops.nodes.length)] };
      });
      return ctx.encode(expected, headings.length ? { compare: 'flat' } : {}, select);
    }
    // after the paragraph, an item would join its list again; direct: the items after the operands
    // follow it, and join the last new paragraph's list; logical: they stay in the paragraph's list, its
    // parent's, and the new paragraphs pass them (LogicalOutdent4)
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
  // titles whose text the change escapes (a setext title written as an ATX heading)
  const escaped = new Map<OutlineNode, string>();
  for (const h of headings) {
    const level = h.head!.level! + delta;
    if (level < 1) return reject('at-h1-bound');
    if (level > 6) return reject('at-h6-bound');
    if (h.head!.setext && level > 2) {
      // levels past 2 have no setext form: the heading is written as an ATX one, its underline going
      if (h.head!.endLine - h.startLine > 1) return reject('not-expressible', 'a setext title of several lines has no ATX form');
      const title = doc.lines[h.startLine]!;
      const underline = doc.lines[h.head!.endLine]!;
      const from = skipSpaces(doc.text, title.contentFrom, title.to, 1);
      changes.push({ from, to: from, insert: `${'#'.repeat(level)} ` });
      // a run of `#`s ending the title would read as the closing sequence
      const closing = /(^|[ \t])(#+)[ \t]*$/.exec(doc.text.slice(from, title.to));
      if (closing) {
        const at = from + closing.index + closing[1]!.length;
        changes.push({ from: at, to: at, insert: '\\' });
        const text = doc.nodeText(h);
        const run = /(^|[ \t])(#+)[ \t]*$/.exec(text)!;
        escaped.set(h, `${text.slice(0, run.index + run[1]!.length)}\\${text.slice(run.index + run[1]!.length)}`);
      }
      changes.push({ from: title.to, to: underline.to, insert: '' });
    } else if (h.head!.setext) {
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
  for (const h of headings) expected = expected.update(h, (n) => ({ ...n, level: h.head!.level! + delta, ...(escaped.has(h) ? { text: escaped.get(h)! } : {}) }));
  return { changes, selection: mapSelection(changes, ctx.sel, 1), expected, compare: 'flat' };
}

/**
 * The run swaps places with the sibling above or below it. At the edge of its parent it crosses out:
 * where the text puts it, past the line before or after it (`crossUp`, `crossDown`). Items move past
 * a paragraph: below it they become its first list items; above it (out of its list) they follow the
 * node before it. A move never gives another node a new parent: one that would is refused.
 */
export function move(ctx: CommandContext, ops: Operands, dir: -1 | 1): Outcome {
  // a move of everything in a quote moves the quote; a callout's title stays, its only child moving out
  while (ops.parent.kind === 'quote' && !ops.parent.head && ops.nodes.length === ops.parent.children.length) ops = new Operands([ops.parent]);
  const { first, parent } = ops;
  const other = dir < 0 ? ops.prev : ops.next;
  const items = first.kind === 'item';
  if (!other) {
    const crossed = dir < 0 ? crossUp(ctx, ops) : crossDown(ctx, ops);
    if (!crossed) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
    if (crossed === 'reparent' || !keepsParents(ctx, crossed, ops)) return reject('would-reparent', 'the move would give another node a new parent');
    return withPlan(ctx.encode(crossed), { drop: heldIn(ctx, ops) });
  }
  let expected: OutlinePlan;
  if (dir > 0 && items && other.kind === 'paragraph' && ownsLists(parent)) {
    // an item below a section's paragraph becomes its first list item (in an item or a quote a
    // paragraph owns no list)
    expected = ctx.plan.remove(ops.nodes).append(other, 'first', ops.nodes);
  } else if (dir > 0 && other.kind === 'heading' && first.kind !== 'heading') {
    // down past a sub-heading: into its section, as its first node
    expected = ctx.plan.remove(ops.nodes).append(other, 'first', ops.nodes);
  } else {
    // a quote swaps with any node but a heading (which owns what follows it); blocks swap with
    // blocks, items with items
    const group = (k: string) => (k === 'paragraph' || k === 'atom' ? 'leaf' : k);
    const quote = (first.kind === 'quote' || other.kind === 'quote') && first.kind !== 'heading' && other.kind !== 'heading';
    // a heading past another kind of node, or a heading of another level, would take it into its
    // section, or go into that heading's
    if (first.kind === 'heading' && (other.kind !== 'heading' || first.head!.level !== other.head!.level)) return reject('would-reparent', 'a heading moves among headings of its level');
    if (!quote && group(other.kind) !== group(first.kind)) return reject('not-expressible', `can't reorder ${first.kind} past ${other.kind}`);
    const upper = dir < 0 ? [other] : ops.nodes;
    const lower = dir < 0 ? ops.nodes : [other];
    expected = ctx.plan.update(parent, (p) => {
      const i = p.children.indexOf(upper[0]!);
      return { ...p, children: [...p.children.slice(0, i), ...lower, ...upper, ...p.children.slice(i + upper.length + lower.length)] };
    });
  }
  if (!keepsParents(ctx, expected, ops)) return reject('would-reparent', 'the move would give another node a new parent');
  return withPlan(ctx.encode(expected), { drop: heldIn(ctx, ops) });
}

/**
 * The placeholder on the caret's line, in the operands' lines: moved, the empty node held there is held
 * where it lands, at the caret (the runner holds it there), not where its old offset maps to.
 */
function heldIn(ctx: CommandContext, ops: Operands): number[] {
  const { doc } = ctx;
  if (!ctx.collapsed) return [];
  const line = doc.lineAt(ctx.sel.head).index;
  if (line < ops.first.startLine || line > doc.lastDescendant(ops.last).endLine) return [];
  return doc.placeholders.filter((p) => doc.lineAt(p).index === line);
}

/**
 * The run, first in its parent, moved up past the line above it: out of a paragraph's list, above
 * the paragraph; out of a heading's section, to where the text above the heading ends (the end of
 * the section above, inside the last sub-headings that can hold it, or else right before the
 * heading); out of an item, as the last child of the item above. Null where it can't go.
 */
function crossUp(ctx: CommandContext, ops: Operands): OutlinePlan | null {
  const { first, parent } = ops;
  if (first.kind === 'item' && parent.kind === 'paragraph') return ctx.plan.remove(ops.nodes).place('before', parent, ops.nodes);
  const grand = parent.parent;
  if (!grand) return null;
  const above = grand.children[grand.children.indexOf(parent) - 1];
  if (parent.kind === 'heading') {
    const into = above?.kind === 'heading' ? sectionEnd(above, first) : null;
    if (into) return ctx.plan.remove(ops.nodes).append(into, 'last', ops.nodes);
    // the heading's parent's own nodes, or the text before the first heading: right before it
    return ctx.plan.remove(ops.nodes).place('before', parent, ops.nodes);
  }
  if (!above || !canHold(above, first)) return null;
  return ctx.plan.remove(ops.nodes).append(above, 'last', ops.nodes);
}

/**
 * The run, last in its parent, moved down past the line below it: out of the sections that end
 * with it (and the list of a section's paragraph), as the first node of the next section, unless it
 * would take in that section's nodes; out of an item, as the first child of the item below. Null
 * where it can't go; `reparent` where a heading would take in the section's nodes, or end it.
 */
function crossDown(ctx: CommandContext, ops: Operands): OutlinePlan | 'reparent' | null {
  const { first, parent } = ops;
  let from = parent;
  let below = siblingAfter(from);
  // the text after a section's (or a section paragraph's) last node is the next heading, however
  // many sections end there
  if (parent.kind === 'heading' || parent.kind === 'paragraph') {
    while (!below && from.parent?.kind === 'heading') {
      from = from.parent;
      below = siblingAfter(from);
    }
  }
  if (!below) return null;
  if (below.kind === 'heading' && first.kind === 'heading') {
    // a heading at the head of a section takes in what follows it up to a heading of its level
    const level = first.head!.level!;
    const head = below.children[0];
    if (level <= below.head!.level! || (head && !(head.kind === 'heading' && head.head!.level! <= level))) return 'reparent';
  } else if (!canHold(below, first)) return null;
  return ctx.plan.remove(ops.nodes).append(below, 'first', ops.nodes);
}

const siblingAfter = (node: OutlineNode): OutlineNode | undefined => node.parent?.children[node.parent.children.indexOf(node) + 1];

/**
 * Whether `plan`, read as its text will read (a section's paragraph owning the list after it), keeps
 * every node but the run and its subtrees under the parent it has now.
 */
function keepsParents(ctx: CommandContext, plan: OutlinePlan, ops: Operands): boolean {
  const moved = new Set(ops.nodes.map((node) => node.id));
  let kept = true;
  const visit = (node: PlanTree, parent: PlanTree | null): void => {
    const id = node.id;
    if (id !== null && parent !== null && parent.id !== null && !moved.has(id)) {
      const old = ctx.doc.node(id);
      // a paragraph that stays takes in the list a move leaves right after it, as the text reads it
      const takenIn = node.kind === 'item' && parent.kind === 'paragraph' && !moved.has(parent.id) && old?.parent?.kind !== 'paragraph' && old?.parent?.kind !== 'item';
      if (old?.parent && old.parent.id !== parent.id && !takenIn) kept = false;
    }
    node.children.forEach((child) => visit(child, node));
  };
  visit(plan.withOwnedLists().root, null);
  return kept;
}

/**
 * Whether a moved run starting with `node` can cross into `into` as its children: an item into an
 * item, a paragraph's list or a quote (which it can cross out of), anything into a heading's section.
 */
function canHold(into: OutlineNode, node: OutlineNode): boolean {
  // a heading's section takes anything but a heading (as its first child, a heading would take in the
  // section's other nodes; `crossDown` lets one in where it takes nothing)
  if (into.kind === 'heading') return node.kind !== 'heading';
  if (node.kind === 'item') return into.kind === 'item' || into.kind === 'paragraph' || into.kind === 'quote';
  return false;
}

/** The selected nodes go, with their subtrees; the caret goes to the end of the text above, or to what follows. */
export function deleteSubtree(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const ops = operands(ctx);
  if (ops === null) return notApplicable;
  if ('status' in ops) return ops;
  // a quote without text that the nodes are all of goes with them: its `>` alone is no node
  let gone: readonly OutlineNode[] = ops.nodes;
  for (let parent = gone[0]!.parent; parent?.kind === 'quote' && !parent.head && parent.children.length === gone.length; parent = parent.parent) gone = [parent];
  const expected = ctx.plan.remove(gone);
  const [first, last] = [gone[0]!, gone[gone.length - 1]!];
  // the document's only nodes: it is empty after them, but for its last line ending
  const from = doc.lines[first.startLine]!.from;
  const to = doc.lines[doc.lastDescendant(last).endLine]!.to;
  if (!expected.root.children.length && trimMd(doc.text.slice(0, from)) === '' && trimMd(doc.text.slice(to)) === '') {
    const end = /\r?\n$|\r$/.exec(doc.text)?.[0].length ?? 0;
    return ctx.caret([{ from: 0, to: doc.text.length - end, insert: '' }], 0, expected);
  }
  // the text above: a quote without text has none (its `>` is markup), nor an item whose first block
  // shares its line (`- > q`)
  const textless = (node: OutlineNode): boolean =>
    !node.head && (node.kind === 'quote' || (node.kind === 'item' && node.children[0]?.startLine === node.startLine));
  let above = doc.before(first);
  while (above && textless(above)) above = doc.before(above);
  // the text below: a thematic break has none
  let after = doc.after(doc.lastDescendant(last));
  while (after?.kind === 'atom' && after.block.type === 'thematic_break') after = doc.after(after);
  // the placeholders of what goes go with it, rather than hold an empty node where it was
  const endLine = doc.lastDescendant(last).endLine;
  const drop = doc.placeholders.filter((p) => doc.lineAt(p).index >= first.startLine && doc.lineAt(p).index <= endLine);
  return withPlan(ctx.encode(expected, {}, (writtenOutline) => {
    const caret =
      above && above.kind !== 'root'
        ? writtenOutline.map(doc.headRange(above)?.to ?? doc.lines[above.headEndLine]!.to, -1)
        : after
          ? writtenOutline.map(doc.textStart(doc.lines[after.startLine]!.from), 1)
          : 0;
    return { anchor: caret, head: caret };
  }), { drop });
}

/** A copy of the selected nodes, with their subtrees, goes below them; the caret goes along into it. */
export function duplicate(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const ops = operands(ctx);
  if (ops === null) return notApplicable;
  if ('status' in ops) return ops;
  // the copies go after the last heading's section: those before it that it would take in (any node
  // but a heading of its level or above) would land under another parent than their originals, a
  // selection deleteSubtree couldn't take back
  const last = ops.nodes.map((node) => node.kind).lastIndexOf('heading');
  const level = last > 0 ? ops.nodes[last]!.head!.level! : 0;
  if (last > 0 && ops.nodes.slice(0, last).some((node) => node.kind !== 'heading' || node.head!.level! > level)) {
    return reject('not-expressible', 'the copies before the heading would land in its section');
  }
  const copies = ops.nodes.map((node) => OutlinePlan.copy(doc, node));
  const expected = ctx.plan.place('after', ops.last, copies);
  return ctx.encode(expected, {}, convertedSelection(ctx, ops.nodes, copies));
}
