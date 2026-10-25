// Shift-Tab (spec/outdent.md): an item one level out, after the item it was in, or
// out of a section's list into a paragraph. The command says where the nodes go and what kind they
// are; `done()` and the writer do the rest.

import { ProseText, AtomText, type OutlineNode } from '../doc/index.ts';
import { notApplicable, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { changeHeadingLevels, onCodeLine, selectionInText, structuralOperands } from './util.ts';

/**
 * Items leave their parent item, to follow it, with their subtrees. The siblings after them follow
 * `outdent`: `direct` makes them the last outdented item's children, after its own; `logical` leaves
 * them with their parent. Out of a list in a section, or a paragraph's, they become paragraphs.
 * Headings go a level up, with the headings in their sections; any node leaves a quote. On a code
 * line Shift-Tab is the host's. Null for other nodes, which ourus doesn't do yet (unsupported).
 */
export function outdentCommand(ctx: CommandContext): CommandOutcome {
  if (onCodeLine(ctx, ctx.selection.anchor) && onCodeLine(ctx, ctx.selection.head)) return notApplicable();
  const nodes = structuralOperands(ctx);
  if (!Array.isArray(nodes)) return nodes;
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const parent = first.parent!;
  // out of a quote, any node: it follows the quote
  if (parent.kind === 'quote') return leaveQuote(ctx, nodes);
  if (first.kind === 'heading') return changeHeadingLevels(ctx, nodes, -1);
  // (a paragraph or a block of a section: it has no level to leave)
  if (first.kind !== 'item') return reject('not-expressible', `a ${first.kind} has no level to leave`);
  const later = parent.children.slice(last.index + 1);
  const direct = ctx.config.outdent === 'direct';
  if (parent.kind === 'paragraph' || parent.kind === 'root' || parent.kind === 'heading') return unwrapItems(ctx, nodes, parent, later);
  if (parent.kind !== 'item') return null;
  // (every child of an item with no text of its own leaving it, `- - b`: it would hold nothing, and
  // goes, they in its place)
  if (!ctx.doc.textOf(parent) && first.index === 0 && (direct || !later.length)) {
    const draft = ctx.draft();
    if (later.length) draft.remove(later).append(last, 'last', later);
    draft.dissolve(parent);
    selectionInText(ctx, draft, true);
    return ctx.apply(draft);
  }
  const draft = ctx.draft().remove(nodes);
  if (direct && later.length) draft.remove(later).place('after', parent, nodes).append(last, 'last', later);
  else draft.place('after', parent, nodes);
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}

/**
 * Items out of a list in a section, or a paragraph's, become paragraphs, their children their lists:
 * in place, the rest of the list becoming theirs (in a section there is no parent for `logical` to
 * keep them with); out of a paragraph's list, after it, the later items (`direct`) following and
 * joining the last one's list, or (`logical`) staying in the paragraph's, which the new paragraphs
 * pass. An item whose text is a heading becomes that heading; one whose text is code, that block.
 */
function unwrapItems(ctx: CommandContext, nodes: readonly OutlineNode[], parent: OutlineNode, later: readonly OutlineNode[]): CommandOutcome {
  const doc = ctx.doc;
  const texts = nodes.map((node) => doc.textOf(node));
  if (texts.some((text) => !text)) return null;
  // an item whose text is a heading becomes that heading, the rest of the list its section: which may
  // take in the rest of the list, nothing after it, and must stay in the section it is in
  const levels = texts.map((text) => (text instanceof ProseText ? (text.heading?.level ?? null) : null));
  if (levels.some((level) => level !== null)) {
    if (parent.kind === 'paragraph') return reject('not-expressible', "a heading can't be in a paragraph's list");
    if (later.some((node) => node.kind !== 'item')) return reject('not-expressible', 'the heading would take in what follows the list');
    const own = parent.kind === 'heading' ? (doc.textOf(parent) as ProseText).heading!.level : 0;
    if (levels.some((level) => level !== null && level <= own)) return reject('not-expressible', 'the heading would end the section it is in');
  }
  const draft = ctx.draft();
  // (an item whose text is code becomes that block, its children after it)
  nodes.forEach((node, k) => {
    draft.convert(node, texts[k] instanceof AtomText ? 'atom' : levels[k] !== null ? 'heading' : 'paragraph');
    if (texts[k] instanceof AtomText && node.children.length) draft.remove(node.children).place('after', node, node.children);
  });
  if (parent.kind === 'paragraph') {
    const moved = ctx.config.outdent === 'direct' ? [...nodes, ...later] : [...nodes];
    draft.remove(moved).place('after', parent, moved);
  }
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}

/**
 * The nodes leave their quote. A quote they are all of goes, unless it has a title (a callout's):
 * they take its place. With `outdent: logical`, or last in it, they follow it; first in a quote
 * without a title, they go before it; in its middle (`direct`), the quote splits around them.
 */
function leaveQuote(ctx: CommandContext, nodes: readonly OutlineNode[]): CommandOutcome {
  const doc = ctx.doc;
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const quote = first.parent!;
  const titled = !!doc.textOf(quote);
  const after = quote.children.slice(last.index + 1);
  const draft = ctx.draft().remove(nodes);
  // the quote an item's first block, on its marker's line, with no text of the item's: a paragraph of
  // one line, its first, is the item's text then (Quote77)
  const item = quote.parent?.kind === 'item' && quote.index === 0 && !doc.textOf(quote.parent) ? quote.parent : null;
  const text = doc.textOf(first);
  if (item && nodes.length === 1 && first.index === 0 && first.kind === 'paragraph' && !first.children.length && text instanceof ProseText && !text.body.includes('\n') && !titled) {
    draft.setText(item, text.asItem(true)).setCaret(item, ctx.from.zone === 'text' ? ctx.from.offset : 0, -1);
    if (quote.children.length === 1) draft.remove([quote]);
    return ctx.apply(draft);
  }
  if (nodes.length === quote.children.length && !titled) draft.place('before', quote, nodes).remove([quote]);
  else if (ctx.config.outdent === 'logical' || !after.length) draft.place('after', quote, nodes);
  else if (first.index === 0 && !titled) draft.place('before', quote, nodes);
  else {
    // in its middle (`direct`): the quote splits around them, the rest a quote of its own after them (Quote72)
    const rest = draft.create('quote', null);
    draft.remove(after).place('after', quote, [...nodes, rest]).append(rest, 'first', after);
  }
  selectionInText(ctx, draft, true);
  return ctx.apply(draft);
}
