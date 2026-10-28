// Paste (spec/paste.md, paste-list.md, paste-list-form.md): the clipboard read as
// Markdown, its nodes placed between nodes. The command says where they go (the slot) and what they
// are there (an item in a list, a block in an item); `done()` regroups sections and owned lists,
// numbers the list they join, keeps them apart from what is around them, and escapes their texts.

import { clipboardFragment, clipboardMarkdown, type Clipboard } from './clipboard.ts';
import { ProseText, OurusDoc, AtomText, type OutlineNode } from '../doc/index.ts';
import { lineOf } from '../text/index.ts';
import type { OurusDraft } from '../draft/index.ts';
import { CommandContext, deferToHost, reject, type CommandOutcome } from './context.ts';
import { afterDeleting } from './copy.ts';
import { codeAt, onDelimiterLine } from './code.ts';
import { pastePlainCommand, plainLines } from './paste-plain.ts';
import { becomesAt, headingTarget, placeOf, resultCheck, takesIn, unholdable } from './move-subtree-to.ts';
import type { InsertionPoint } from './types.ts';
import { changeHeadingLevels, headingLevel, inMarkup, selectionInText, textEnd, textStart } from './util.ts';

/** Where pasted nodes go: in a node's place, before or after it, or first or last among its children. */
interface Slot {
  readonly where: 'instead' | 'before' | 'after' | 'first' | 'last';
  readonly node: OutlineNode;
  /** The item whose list the pasted items join, or null where they join none. */
  readonly list: OutlineNode | null;
  /** The caret at the end of the node's text (or the node has none): where one line without a line break can be a node. */
  readonly atEnd: boolean;
  /** On blank line `line` of `owner`'s gap, below the node: the paste fills that line. */
  readonly onBlank?: { readonly owner: OutlineNode; readonly line: number };
}

/**
 * Paste (`pasteSeams: closed`): plain lines into the text at the caret, as plain paste puts them;
 * anything else as nodes in the slot the caret is in (`slotAt`), fitted to it: in a list each an
 * item or in one (`fitToList`), elsewhere as they are, the caret at the end of the last pasted text
 * (`quirkPasteCaret`).
 * One line without a line break, or the caret in markup, the host's. Over a selection, as
 * `pasteOverSelection` says (`pasteMarkdown`). Null (unsupported) for a text with lazy lines at the
 * slot, and an item with no text pasted.
 */
export function pasteCommand(ctx: CommandContext, clipboard: Clipboard): CommandOutcome {
  const config = ctx.config;
  // (`quirkPasteText: dynalist`: text alone is plain text, as plain paste puts it)
  const plain = clipboard['text/plain'];
  // (over a selection, it goes first, as a cut takes it)
  if (config.quirkPasteText === 'dynalist' && plain !== undefined && clipboard['text/html'] === undefined && clipboard['text/markdown'] === undefined) {
    return ctx.collapsed ? pastePlainCommand(ctx, plain) : afterDeleting(ctx, (next) => pastePlainCommand(next, plain));
  }
  const read = clipboardMarkdown(clipboard);
  if (!read) return deferToHost();
  return pasteMarkdown(ctx, { ...read, plain: clipboard['text/plain'] }, config.pasteLines === 'items');
}

/** The clipboard's Markdown, a phrase (formatted text from a page) or not, and its plain text. */
type Read = { readonly markdown: string; readonly phrase: boolean; readonly plain?: string };

/**
 * `read` pasted at the caret; `eachLine`: plain lines are a node each (`pasteLines: items`, plain
 * paste's `items`), not text in the text at the caret. Over a selection, with `pasteOverSelection:
 * ignore` and the selection in one node's text, nodes go where a paste at its end puts them, the
 * selected text as it is (Paste17b); else, and where what is pasted is text, the selection goes
 * first, as a cut takes it, and the paste goes where that leaves the caret (Paste17).
 */
export function pasteMarkdown(ctx: CommandContext, read: Read, eachLine: boolean): CommandOutcome {
  if (ctx.collapsed) return asOutcome(pasteAt(ctx, read, eachLine, false));
  const { from, to } = ctx;
  if (ctx.config.pasteOverSelection === 'ignore' && from.zone === 'text' && to.zone === 'text' && from.node === to.node) {
    const kept = pasteAt(ctx.at(Math.max(ctx.selection.anchor, ctx.selection.head)), read, eachLine, true);
    if (kept !== 'text') return kept;
  }
  return afterDeleting(ctx, (next) => asOutcome(pasteAt(next, read, eachLine, false)));
}

/** (`pasteAt`'s outcome where it pastes text whatever is asked: never `'text'`.) */
const asOutcome = (outcome: CommandOutcome | 'text'): CommandOutcome => (outcome === 'text' ? null : outcome);

/**
 * `pasteMarkdown` at a caret; `nodesOnly`: where what is pasted would be text put in at the caret,
 * `'text'` rather than the paste.
 */
function pasteAt(ctx: CommandContext, read: Read, eachLine: boolean, nodesOnly: boolean): CommandOutcome | 'text' {
  const config = ctx.config;
  const asText = (paste: () => CommandOutcome): CommandOutcome | 'text' => (nodesOnly ? 'text' : paste());
  let fragment = clipboardFragment(read.markdown, ctx.config);
  if (!fragment) return deferToHost();
  // plain lines (paragraphs only, but a quote's: `quotes: text`), with `pasteLines: items`: each line a node (Paste18, 19)
  const quoted = (doc: OurusDoc, r: OutlineNode): boolean => { const t = doc.textOf(r); return t instanceof ProseText && t.type === 'quote'; };
  const plain = (doc: OurusDoc): boolean => doc.rootNode.children.every((r) => r.kind === 'paragraph' && !r.children.length && !quoted(doc, r));
  const byLine = eachLine && plain(fragment.doc);
  if (byLine) {
    const doc = fragment.doc;
    const each = doc.rootNode.children.flatMap((r) => doc.markdownOf(doc.markdownStart(r), doc.rangeOf(r).to).split('\n').map((l) => l.trim()));
    // (ending with a line break where the clipboard does: one line with one is a node, without, inline text)
    fragment = clipboardFragment(each.join('\n\n') + (/[\r\n]$/.test(read.markdown) ? '\n' : ''), ctx.config);
    if (!fragment) return deferToHost();
  }
  const { doc: pasted, inline } = fragment;
  const roots = pasted.rootNode.children;
  if (!roots.length) return deferToHost();
  if (ctx.doc.blank) return fillDocument(ctx, pasted);
  // a phrase (formatted text from a page) is put in at the caret, where the host's paste would lose its formatting
  // (in code, as plain text: code has no formatting to keep)
  if (read.phrase) return asText(() => (codeAt(ctx) ? plainLines(ctx, read.plain ?? read.markdown) : (lineAt(ctx, read.markdown) ?? deferToHost())));
  const items = roots.every((r) => r.kind === 'item');
  // one line that is no item is inline text, put in at the caret
  if (inline && !items && roots[0]!.kind !== 'quote' && !quoted(pasted, roots[0]!)) return asText(() => lineAt(ctx, read.markdown) ?? deferToHost());
  const at = slotAt(ctx, items);
  if (at === 'host') return deferToHost();
  if (at === null) return null;
  if (at === 'plain') return asText(() => plainLines(ctx, read.markdown));
  let slot = at;
  const empty = (n: OutlineNode): boolean => n.kind === 'item' && emptyText(ctx, n);
  // an empty item with children is a parent; but a block first there would be its text: it fills the item instead
  if (slot.where !== 'instead' && empty(slot.node) && slot.node.children.length && !items) slot = { ...slot, where: 'instead', list: slot.node };
  // plain lines go into the text, as plain paste puts them; a heading or a callout's title holds one line, and takes them as nodes
  const lines = plain(pasted);
  const text = ctx.doc.textOf(slot.node);
  const quoteAtom = text instanceof AtomText && text.type === 'blockquote';
  const takesLines = slot.node.kind !== 'heading' && (slot.node.kind !== 'atom' || quoteAtom) && !(text instanceof ProseText && text.type === 'title') && !(text instanceof AtomText && !quoteAtom);
  // (from a checkbox, at the text's start)
  if (lines && takesLines && !byLine) return asText(() => plainLines(ctx.from.zone === 'frame' && text instanceof ProseText ? ctx.at(ctx.doc.posOf(slot.node, text.textStart(0), 1)) : ctx, read.markdown));
  // one line, not at the text's end: inline text
  if (inline && !slot.atEnd) return asText(() => lineAt(ctx, read.markdown) ?? deferToHost());
  // what can't be an item before an item (a quote, a table) goes after it
  if (slot.where === 'before' && slot.node.kind === 'item' && !leads(roots[0]!)) slot = { ...endSlot(ctx, slot.node, items), atEnd: false };
  // a quote or a table pasted on an empty item is its first block, on its marker's line (PasteList17)
  if (slot.where === 'instead' && slot.node.kind === 'item' && roots.length === 1 && (roots[0]!.kind === 'quote' || roots[0]!.block.type === 'table')) {
    const draft = ctx.draft();
    const block = made(draft, pasted, roots[0]!);
    if (block === null) return null;
    const id = draft.create('item', null);
    draft.append(id, 'first', [block]);
    // (the empty item's children after it, the item's still)
    const children = [...slot.node.children];
    if (children.length) draft.remove(children).append(id, 'last', children);
    draft.place('before', slot.node, [id]).remove([slot.node]);
    const last = lastMade(draft, block);
    const text = draft.touched(last).text;
    if (!text) return null;
    return ctx.apply(draft.setCaret(last, textEnd(text), -1));
  }
  // (`pasteSeams: open`: where both seams close)
  if (config.pasteSeams === 'open') {
    const open = openSeams(ctx, pasted, roots);
    if (open !== undefined) return open;
  }
  const draft = ctx.draft();
  const fitted = slot.list !== null || slot.node.kind === 'item' ? fitToList(ctx, draft, pasted, roots, slot) : fitToBlocks(draft, pasted, roots);
  if (fitted === undefined) return null;
  // what can't be a node where it lands is pasted as text
  if (fitted === null) return asText(() => plainLines(ctx, read.markdown));
  return place(ctx, draft, slot, fitted);
}

/**
 * `pasteSeams: open` (PasteList22, Paste21): the node at the caret splits there, the paste between its
 * halves; its first text joins the text before the caret (a heading's title too), the text after the
 * caret joins its last, which the node's children follow, or stays a node of its own after a block
 * that isn't text. Undefined where the first seam can't close (the caret in a heading's title, a
 * block that isn't text first, an empty node): the paste is closed.
 */
function openSeams(ctx: CommandContext, pasted: OurusDoc, roots: readonly OutlineNode[]): CommandOutcome | undefined {
  const at = ctx.from;
  // on the blank line Shift-Enter leaves at a text's end, the first after it: that text's next line,
  // the paste's first text joining it there
  const head = ctx.selection.head;
  // (but the gap's last line between paragraphs, which sets them apart: a slot the paste fills)
  const apart = (n: OutlineNode): boolean => n.gap === 1 && !!n.afterSubtree && (n.kind === 'paragraph' || n.afterSubtree.kind === 'paragraph');
  const owner = at.zone === 'gap' && !at.owner.children.length && ctx.doc.lineAt(head).index === at.owner.textLastLine + 1 && ctx.doc.atTextColumn(head, at.owner) && !apart(at.owner) ? at.owner : null;
  const line = owner ? ctx.doc.textOf(owner) : null;
  const here = owner && line instanceof ProseText ? { node: owner, text: line, offset: textEnd(line) } : at.zone === 'text' && at.text instanceof ProseText ? { node: at.node, text: at.text, offset: at.offset } : null;
  if (!here || (here.node.kind !== 'item' && here.node.kind !== 'paragraph')) return undefined;
  const node = here.node;
  // (an empty node: nothing to join, it is filled, as a closed paste fills it)
  if (here.text.empty) return undefined;
  const joins = (n: OutlineNode): boolean => (n.kind === 'item' || n.kind === 'paragraph' || n.kind === 'heading') && pasted.textOf(n) instanceof ProseText;
  if (!joins(roots[0]!)) return undefined;
  const draft = ctx.draft();
  const slot: Slot = { where: 'after', node, list: node.kind === 'item' ? node : null, atEnd: true };
  const fitted = slot.list !== null ? fitToList(ctx, draft, pasted, roots, slot) : fitToBlocks(draft, pasted, roots);
  if (!fitted || !fitted.nodes.length || fitted.into.length) return undefined;
  const [, rest] = draft.split(node, here.offset, { children: 'follow' });
  draft.place('after', node, fitted.nodes);
  const first = fitted.nodes[0]!;
  const last = lastMade(draft, fitted.nodes[fitted.nodes.length - 1]!);
  const lastText = draft.touched(last).text;
  if (!lastText) return undefined;
  draft.join(node, first, { children: node.kind === 'item' ? 'adopt' : 'place', ...(owner && { separator: '\n' }) });
  const seam = last === first ? node.id : last;
  const end = textEnd(draft.touched(seam).text!);
  // (a block that isn't text last: the text after the caret stays a node of its own, PasteList24)
  // (a paragraph's children are the list it owns: after a pasted item, its items stay beside it, in it)
  const beside = node.kind !== 'item' && draft.touched(seam).kind === 'item';
  if (lastText instanceof ProseText && draft.touched(last).kind !== 'heading') draft.join(seam, rest, { children: beside ? 'place' : 'adopt' });
  // (and its list written apart from it as it was: its gap before its children, where it has them)
  if (beside && node.children.length) draft.gap(node, node.gap);
  // (the blank line pasted on is a line of the text now: one fewer after it)
  if (owner) draft.gap(seam, node.gap - 1);
  return ctx.apply(draft.setCaret(seam, end, -1));
}

/**
 * One line put in at the caret in a node's text (an item's, a paragraph's, a heading's), past its
 * markup; `done()` escapes it where at a line's start it would read as a block (`1. x`), as typing it
 * would be. Null where the caret isn't in such a text.
 */
function lineAt(ctx: CommandContext, line: string): CommandOutcome {
  const at = ctx.from;
  // (an empty item's, the host types: it is its text)
  if (/[\r\n]/.test(line) || at.zone !== 'text' || !(at.text instanceof ProseText) || at.text.empty) return null;
  // past the text's end (a setext underline, closing `#`s), in the padding before it: markup
  if (at.offset > textEnd(at.text) || inMarkup(ctx.doc, at, ctx.selection.head)) return null;
  if (at.node.kind !== 'item' && at.node.kind !== 'paragraph' && at.node.kind !== 'heading') return null;
  if (at.offset < at.text.textStart(lineOf(at.text.text, at.offset))) return null;
  const draft = ctx.draft().setText(at.node, at.text.splice(at.offset, at.offset, line));
  return ctx.apply(draft.setCaret(at.node, at.offset + line.length, 1));
}

/** Whether a node can come before an item as one: an item, a paragraph, a heading, a block of lines. */
function leads(root: OutlineNode): boolean {
  return root.kind === 'item' || root.kind === 'paragraph' || root.kind === 'heading' || (root.kind === 'atom' && !!root.block.type.match(/code|math|comment|html|blockquote/));
}

/** Whether `node`'s own text is empty (an item's: but its checkbox). */
function emptyText(ctx: CommandContext, node: OutlineNode): boolean {
  const text = ctx.doc.textOf(node);
  return text instanceof ProseText ? text.empty : text === null;
}

/**
 * The slot the caret is in, for nodes, or what pastes there instead: plain paste in code and in a
 * block's own lines (a table's row); the host's in markup and on no node. The slot doesn't depend on
 * where in a node's text the caret is, only whether at its end (where one line without a line break
 * can be a node) or its start (`pasteAtTextStart: before`). On a blank line, the node above's end.
 * Null (unsupported) where ourus doesn't do it yet.
 */
function slotAt(ctx: CommandContext, items: boolean): Slot | 'plain' | 'host' | null {
  // on a code line, what is pasted is code (on a fence's line, the block is a block: after its closing one, its end)
  const code = codeAt(ctx);
  if (code && !onDelimiterLine(code.text, code.offset)) return 'plain';
  const at = ctx.from;
  if (at.zone === 'gap') {
    const owner = at.owner;
    if (owner.kind === 'root') return 'host';
    // below an empty item, it is filled, as from its end
    const onBlank = { owner, line: ctx.doc.lineAt(ctx.selection.head).index - owner.textLastLine - 1 };
    if (emptyText(ctx, owner) && owner.kind === 'item' && !owner.children.length) return { where: 'instead', node: owner, list: owner, atEnd: true, onBlank };
    return { ...endSlot(ctx, owner, items), atEnd: true, onBlank };
  }
  if (at.zone !== 'text' && at.zone !== 'frame' && at.zone !== 'marker') return 'host';
  const node = at.node;
  const text = ctx.doc.textOf(node);
  // before an item's marker (in its indentation, at its line's start): the host's
  if (at.zone === 'marker' && at.part !== 'padding') return 'host';
  if (node.kind === 'item' && emptyText(ctx, node)) {
    // in an empty item (its marker, its checkbox too): filled, or a parent's first children
    const task = text instanceof ProseText && !!text.task;
    if (!node.children.length && !(task && ctx.config.enterTask === 'plain')) return { where: 'instead', node, list: node, atEnd: true };
    return { ...endSlot(ctx, node, items), atEnd: true };
  }
  if (at.zone === 'marker') return 'host';
  // an item's checkbox is its text's start, as is what follows its marker (a heading's `#`s are markup)
  if (at.zone === 'frame' && text instanceof ProseText && node.kind === 'item' && at.part === 'task') return { ...endSlot(ctx, node, items), atEnd: false };
  if (node.kind === 'paragraph' && !node.children.length && emptyText(ctx, node)) return { where: 'instead', node, list: null, atEnd: true };
  if (text instanceof AtomText) {
    // a block that isn't text: its end is its own, elsewhere its lines are (plain paste's)
    const end = ctx.selection.head === ctx.doc.posOf(node, text.text.length, 1);
    // (a quote read as an atom, `quotes: atom`, is text: nodes go after it, as after a paragraph)
    if (node.kind === 'atom') return end || text.type === 'blockquote' ? { ...endSlot(ctx, node, items), atEnd: end } : 'plain';
    return { ...endSlot(ctx, node, items), atEnd: end };
  }
  if (!(text instanceof ProseText) || at.zone !== 'text' || inMarkup(ctx.doc, at, ctx.selection.head)) return 'host';
  if (node.kind !== 'item' && node.kind !== 'paragraph' && node.kind !== 'heading' && node.kind !== 'quote') return 'host';
  // past the text's end, in a closing frame (a setext underline, an ATX title's closing `#`s): markup, the host's
  if (at.offset > textEnd(text)) return 'host';
  const atEnd = at.offset >= textEnd(text);
  if (ctx.config.pasteAtTextStart === 'before' && !atEnd && at.offset <= textStart(text)) {
    // before a heading, the section above's: not done yet
    if (node.kind === 'heading' || node.kind === 'quote') return null;
    return { where: 'before', node, list: node.kind === 'item' ? node : null, atEnd };
  }
  return { ...endSlot(ctx, node, items), atEnd };
}

/**
 * Where nodes go from the end of `node`'s text: first among a node's children, where it has some
 * (`pasteOnParent: children`): an item's, a heading's section, a paragraph's list where the nodes are
 * items; else after the node, joining a list right after it.
 */
function endSlot(ctx: CommandContext, node: OutlineNode, items: boolean): Omit<Slot, 'atEnd'> {
  const after = ctx.config.pasteOnParent === 'after';
  const firstItem = node.children[0]?.kind === 'item' ? node.children[0] : null;
  const lastItem = node.children[node.children.length - 1]?.kind === 'item' ? node.children[node.children.length - 1]! : null;
  if (node.kind === 'item') {
    if (!node.children.length || after) return { where: 'after', node, list: node };
    return { where: 'first', node, list: firstItem };
  }
  if (node.kind === 'heading' || node.kind === 'quote') {
    if (after) {
      // last in a heading's section is last in its last sub-sections
      let into = node;
      while (into.children.length && into.children[into.children.length - 1]!.kind === 'heading') into = into.children[into.children.length - 1]!;
      const near = items && into.children[into.children.length - 1]?.kind === 'item' ? into.children[into.children.length - 1]! : null;
      return { where: into.children.length ? 'last' : 'first', node: into, list: near };
    }
    return { where: 'first', node, list: items ? firstItem : null };
  }
  if (ctx.doc.adoptsLists(node)) {
    const near = after ? lastItem : firstItem;
    if (items && near) return { where: after ? 'last' : 'first', node, list: near };
    return { where: 'after', node, list: null };
  }
  // a paragraph in an item or a quote, a block that isn't text: after it, joining a list right after it
  const next = node.next;
  return { where: 'after', node, list: items && next?.kind === 'item' ? next : null };
}

/** Pasted nodes, made in the draft: the top ones, and blocks for the item at the slot, after its text. */
interface Fitted {
  readonly nodes: number[];
  readonly into: number[];
}

/** The nodes `made` made, by draft: what the caret and the spacing walk (not a node's old children appended to one). */
const madeIds = new WeakMap<OurusDraft, Set<number>>();

/** The last made node in `id`'s subtree: its deepest last made child. */
function lastMade(draft: OurusDraft, id: number): number {
  const made = madeIds.get(draft);
  for (let kids = draft.touched(id).children; kids.length && made?.has(kids[kids.length - 1]!); kids = draft.touched(id).children) id = kids[kids.length - 1]!;
  return id;
}

/** A node of the fragment made in the draft, with its subtree; its list's form its own. Null for a node with no text (but a quote with children). */
function made(draft: OurusDraft, pasted: OurusDoc, node: OutlineNode, kind = node.kind, children: readonly OutlineNode[] = node.children): number | null {
  const text = pasted.textOf(node);
  // (a quote with no text of its own is its children)
  if ((!text && !(kind === 'quote' && children.length)) || kind === 'root') return null;
  const id = draft.create(kind, text);
  if (!madeIds.has(draft)) madeIds.set(draft, new Set());
  madeIds.get(draft)!.add(id);
  if (node.kind === 'item') draft.listForm(id, pasted.markerOf(node), pasted.config.pasteListForm === 'own');
  draft.gap(id, node.gap);
  for (const child of children) {
    const c = made(draft, pasted, child);
    if (c === null) return null;
    draft.append(id, 'last', [c]);
  }
  return id;
}

/** The nodes outside a list, as they are: sections and owned lists are `done()`'s normal form. Undefined where one has no text. */
function fitToBlocks(draft: OurusDraft, pasted: OurusDoc, roots: readonly OutlineNode[]): Fitted | undefined {
  const nodes: number[] = [];
  for (const root of roots) {
    const id = made(draft, pasted, root);
    if (id === null) return undefined;
    nodes.push(id);
  }
  return { nodes, into: [] };
}

/**
 * The nodes landing in a list, each an item or in one: items join it, taking its form (`done()`); a
 * paragraph is an item, its lines the item's text, its list after it (`pasteParagraphList: siblings`)
 * or its children (`children`); a heading an item whose text is the heading, the rest of its section
 * the item's children; a block that would end the list goes into the item before it, the last pasted,
 * or before any, the item at the slot (`into`); among an item's children it stays where it is; first
 * in an empty item's place or before an item, where it can be an item's text (a block of lines), it
 * is. Null where a block can't fill an empty item; undefined where a node has no text. `blocks`, for
 * a drop at a place: `stay`, a block stays where it is among the nodes, in no item; `items`, where
 * only items can be (a paragraph's list), it is one, or null where it can't be an item's text.
 */
function fitToList(ctx: CommandContext, draft: OurusDraft, pasted: OurusDoc, roots: readonly OutlineNode[], slot: Slot, blocks: 'into' | 'stay' | 'items' = 'into'): Fitted | null | undefined {
  const children = ctx.config.pasteParagraphList === 'children';
  const nodes: number[] = [];
  const into: number[] = [];
  let prev: number | null = null;
  for (const root of roots) {
    if (root.kind === 'heading' || root.kind === 'item' || root.kind === 'paragraph') {
      const kids = root.kind === 'paragraph' && !children ? [] : root.children;
      const id = made(draft, pasted, root, 'item', kids);
      if (id === null) return undefined;
      nodes.push(id);
      prev = id;
      if (root.kind === 'paragraph' && !children) {
        // its list after it, items of the list it joins
        for (const k of root.children) {
          const c = made(draft, pasted, k);
          if (c === null) return undefined;
          nodes.push(c);
          prev = c;
        }
      }
      continue;
    }
    if (((slot.where === 'instead' || slot.where === 'before') && !nodes.length) || blocks === 'items') {
      // a block of lines is an item's text; anything else isn't
      if (!(pasted.textOf(root) instanceof AtomText) || !leads(root)) return null;
      const id = made(draft, pasted, root, 'item');
      if (id === null) return undefined;
      nodes.push((prev = id));
      continue;
    }
    const id = made(draft, pasted, root);
    if (id === null) return undefined;
    if (blocks === 'stay' || slot.where === 'first' || slot.where === 'last') nodes.push(id);
    else if (prev !== null && draft.touched(prev).kind === 'item') draft.append(prev, 'last', [id]);
    else if (prev !== null) nodes.push(id);
    else into.push(id);
  }
  return { nodes, into };
}

/**
 * `fitted` placed in `slot`: in an empty node's place its children after them, under the last; spaced
 * as the list they join (a tight list's tight, a loose list's items apart), outside a list set apart
 * from what is around them where the document has blank lines there; the caret at the end of the last
 * pasted text.
 */
function place(ctx: CommandContext, draft: OurusDraft, slot: Slot, fitted: Fitted): CommandOutcome {
  const { node } = slot;
  const { nodes, into } = fitted;
  const instead = slot.where === 'instead';
  if (instead) {
    const text = ctx.doc.textOf(node);
    // an empty task's checkbox goes to the first pasted item, a plain one (PasteList7); else it goes
    const task = text instanceof ProseText ? text.frame.find((p) => p.part === 'task') : undefined;
    const first = nodes[0] !== undefined ? draft.touched(nodes[0]) : null;
    if (task && first?.kind === 'item' && first.text instanceof ProseText && !first.text.task) {
      const boxed = (text as ProseText).slice(task.from, task.to).concat(first.text);
      draft.setText(nodes[0]!, new ProseText('paragraph', true, boxed.text, boxed.marks));
    }
    if (nodes.length) {
      draft.place('before', node, nodes);
      if (node.children.length) draft.remove(node.children).append(nodes[nodes.length - 1]!, 'last', node.children);
    }
    draft.remove([node]);
  } else if (nodes.length) {
    if (slot.where === 'before' || slot.where === 'after') draft.place(slot.where, node, nodes);
    else draft.append(node, slot.where, nodes);
  }
  if (into.length) draft.append(node, 'first', into);
  // spacing: in a list as the list is; elsewhere apart where the node at the slot is
  const list = slot.list ? ctx.doc.listOf(slot.list) : null;
  const tight = list?.block.attrs.tight !== false;
  const all = [...nodes, ...into];
  if (list) {
    for (const [k, id] of nodes.entries()) setSpacing(draft, id, tight ? 0 : k < nodes.length - 1 || !!node.next ? 1 : null);
  } else if (!instead && nodes.length) {
    const apart = apartFrom(ctx, slot);
    if (apart && slot.where === 'after') {
      const last = node.lastDescendant;
      if (last.gap === 0) draft.gap(last, 1);
    }
    if (apart && slot.where === 'first' && node.gap === 0) draft.gap(node, 1);
    // (and from what follows, where something does: the document's end keeps its blank lines)
    const followed = slot.where === 'before' || (slot.where === 'first' && node.children.length > 0) || !!node.afterSubtree;
    if (apart && followed) setSpacing(draft, nodes[nodes.length - 1]!, 1, true);
  }
  // the blank lines after the node at the slot go with the end of the paste, as a split's (Gap13, Paste23)
  const end = slot.where === 'after' ? node.lastDescendant : slot.where === 'first' && !node.children.length ? node : null;
  // (in a loose list each item is apart, the one at the slot too)
  if (end && end.gap > 0 && nodes.length && !(list && !tight)) {
    setSpacing(draft, nodes[nodes.length - 1]!, end.gap, true);
    if (!(list === null && !instead && slot.where === 'after' && apartFrom(ctx, slot))) draft.gap(end, 0);
  }
  // the caret at the end of the last pasted text (`pasteCaret`)
  if (!all.length) return null;
  // on a blank line, the paste fills it: the blank lines above it stay, those below go after the paste (Paste13, 26)
  const blank = slot.onBlank;
  // (where the paste lands right after the line's node: else the blank lines stay where they are)
  const right = slot.where === 'first' ? slot.node === blank?.owner && !slot.node.children.length : (slot.where === 'after' || slot.where === 'last') && slot.node.lastDescendant === blank?.owner;
  if (blank && right && blank.line >= 0 && blank.line < blank.owner.gap) {
    draft.gap(blank.owner, blank.line);
    setSpacing(draft, all[all.length - 1]!, blank.owner.gap - blank.line - 1);
  }
  if (!pasteCaret(ctx, draft, all)) return null;
  return ctx.apply(draft);
}

/**
 * Whether nodes pasted outside a list are set apart from what is around them: not after a node written
 * with no blank line after it (a paragraph, an item's blocks), nor first under a text written without
 * one; under a heading, apart.
 */
function apartFrom(ctx: CommandContext, slot: Slot): boolean {
  const { node } = slot;
  const below = node.textLastLine + 1;
  const tightAfter = node.kind !== 'heading' && slot.where !== 'before' && below < ctx.doc.lineCount && !ctx.doc.isBlankLine(below);
  return !tightAfter && !(slot.where === 'first' && node.kind !== 'heading' && node.gap === 0);
}

/** A made node's blank lines after its subtree: `gap` on its last descendant (null: as they are); `atLeast`, raised only. */
function setSpacing(draft: OurusDraft, id: number, gap: number | null, atLeast = false): void {
  if (gap === null) return;
  const made = madeIds.get(draft);
  let last = id;
  for (let kids = draft.touched(last).children.filter((k) => made?.has(k)); kids.length; kids = draft.touched(last).children.filter((k) => made?.has(k))) {
    // a tight list's items hold no blank lines inside either
    if (!atLeast && gap === 0) for (const k of kids) setSpacing(draft, k, 0);
    last = kids[kids.length - 1]!;
  }
  if (!atLeast && gap === 0) draft.gap(id, 0);
  draft.gap(last, atLeast ? Math.max(gap, draft.touched(last).gap) : gap);
}

/** Into an empty document, the paste is the document; the caret at the end of its last text. */
function fillDocument(ctx: CommandContext, pasted: OurusDoc): CommandOutcome {
  const draft = ctx.draft();
  const roots = fitToBlocks(draft, pasted, pasted.rootNode.children);
  if (!roots) return null;
  if (ctx.doc.rootNode.children.length) draft.remove(ctx.doc.rootNode.children);
  draft.append(0, 'first', roots.nodes);
  if (!pasteCaret(ctx, draft, roots.nodes)) return null;
  return ctx.apply(draft);
}

/**
 * The caret after a paste of `nodes`: at the end of the last pasted text, or with `quirkPasteCaret`
 * at the first's end (`roam`) or start (`athens`), a quote's in its first block. False where that
 * node has no text.
 */
function pasteCaret(ctx: CommandContext, draft: OurusDraft, nodes: readonly number[]): boolean {
  const quirk = ctx.config.quirkPasteCaret;
  let id = quirk === 'default' ? lastMade(draft, nodes[nodes.length - 1]!) : nodes[0]!;
  while (!draft.touched(id).text && draft.touched(id).children.length) id = draft.touched(id).children[0]!;
  const text = draft.touched(id).text;
  if (!text) return false;
  draft.setCaret(id, quirk === 'athens' ? textStart(text) : textEnd(text), -1);
  return true;
}

/**
 * A drop from outside (`pasteAt`, spec/drag.md): the clipboard read as paste reads it, its nodes
 * fitted at the place `to` as paste fits them: in a list each an item, a block staying at the place;
 * elsewhere as they are, items right after a block that adopts lists made paragraphs, as a move makes
 * them. A heading first is re-levelled to its new siblings; one last whose section would take in what
 * follows the place is refused. The caret stays with the text it is in. Then the result is checked,
 * as a move's is.
 */
export function pasteAtCommand(ctx: CommandContext, clipboard: Clipboard, to: InsertionPoint): CommandOutcome {
  const doc = ctx.doc;
  const read = clipboardMarkdown(clipboard);
  const fragment = read ? clipboardFragment(read.markdown, ctx.config) : null;
  if (!fragment?.doc.rootNode.children.length) return reject('not-expressible', 'nothing to paste');
  let pasted = fragment.doc;
  const place = placeOf(doc, to);
  if ('status' in place) return place;
  const { parent, after } = place;
  const next = after ? after.next : (parent.children[0] ?? null);
  const first = pasted.rootNode.children[0]!;
  const unheld = unholdable(doc, first.kind, parent, after);
  if (unheld) return reject('not-expressible', unheld);
  const inList = inListAt(parent, after);
  if (first.kind === 'heading' && !inList) {
    // re-levelled to its new siblings, and with it its section and the headings after it
    const own = headingLevel(new CommandContext(pasted, { anchor: 0, head: 0 }), first);
    const delta = headingTarget(ctx, parent, after, next, own) - own;
    if (delta) {
      const shifted = changeHeadingLevels(new CommandContext(pasted, { anchor: 0, head: 0 }), pasted.rootNode.children, delta);
      if (shifted?.status !== 'applied') return shifted;
      pasted = shifted.doc;
    }
  }
  const roots = pasted.rootNode.children;
  const last = roots[roots.length - 1]!;
  if (last.kind === 'heading' && !inList && takesIn(ctx, next, headingLevel(new CommandContext(pasted, { anchor: 0, head: 0 }), last))) return reject('would-reparent', 'the heading would take in what follows it');
  const draft = ctx.draft();
  const list = after?.kind === 'item' ? after : next?.kind === 'item' ? next : null;
  const slot: Slot = after ? { where: 'after', node: after, list, atEnd: true } : { where: 'first', node: parent, list, atEnd: true };
  const itemsOnly = parent.kind === 'paragraph' || parent.kind === 'atom';
  const fitted = inList ? fitToList(ctx, draft, pasted, roots, slot, itemsOnly ? 'items' : 'stay') : fitToBlocks(draft, pasted, roots);
  if (fitted === null) return reject('not-expressible', `a ${parent.kind}'s list holds only items, and a block there can't be one`);
  if (!fitted) return null;
  if (!inList && becomesAt(doc, 'item', parent, after, new Set()) === 'paragraph') {
    for (const id of fitted.nodes) {
      const node = draft.touched(id);
      if (node.kind !== 'item') continue;
      if (node.text instanceof ProseText && node.text.task) return reject('not-expressible', "a task can't be a paragraph: its checkbox would be text");
      // (one whose text is a block of lines, that block)
      draft.convert(id, node.text instanceof AtomText && !node.children.length ? 'atom' : 'paragraph');
    }
  }
  if (after) draft.place('after', after, fitted.nodes);
  else draft.append(parent, 'first', fitted.nodes);
  // in a list, spaced as the list is
  const tight = list ? ctx.doc.listOf(list)?.block.attrs.tight !== false : true;
  if (list) for (const id of fitted.nodes) setSpacing(draft, id, tight ? 0 : 1);
  selectionInText(ctx, draft);
  const applied = ctx.apply(draft);
  if (applied?.status !== 'applied') return applied;
  const wrong = resultCheck(doc, applied.doc, fitted.nodes, new Set(), to);
  if (wrong) return reject(wrong.reason, `result check: ${wrong.why}`);
  return { ...applied, placed: fitted.nodes };
}

/** Whether a place under `parent`, after `after`, is in a list: under an item or in a paragraph's list, or beside an item. */
function inListAt(parent: OutlineNode, after: OutlineNode | null): boolean {
  const next = after ? after.next : (parent.children[0] ?? null);
  return parent.kind === 'item' || parent.kind === 'paragraph' || parent.kind === 'atom' || after?.kind === 'item' || next?.kind === 'item';
}

/**
 * What a pasted node of `kind`, first, becomes at the place under `parent`, after `after`: in a list, a
 * heading or a paragraph an item, and in a paragraph's list a block too; elsewhere, an item right after a block that adopts lists a
 * paragraph; else null, its own kind (`pasteAtCommand`'s fitting).
 */
export function pastedBecomesAt(doc: OurusDoc, kind: OutlineNode['kind'], parent: OutlineNode, after: OutlineNode | null): 'item' | 'paragraph' | null {
  if (inListAt(parent, after)) return kind === 'heading' || kind === 'paragraph' || ((parent.kind === 'paragraph' || parent.kind === 'atom') && kind === 'atom') ? 'item' : null;
  return kind === 'item' && becomesAt(doc, 'item', parent, after, new Set()) === 'paragraph' ? 'paragraph' : null;
}
