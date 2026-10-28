// Enter (spec/enter.md): a node split at the caret, or a new empty node beside it.
// The command says what the texts become and where the caret goes; `done()` escapes what would start
// a block, sets apart what would run together, numbers the lists, and holds an empty node with a
// placeholder.

import { ProseText, AtomText, type OutlineNode } from '../doc/index.ts';
import { isSpaceOrTab, lineOf, trimMd } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { codeAt, newlineInCode, nodeAfterBlock } from './code.ts';
import { deleteSelectionAcross } from './backspace.ts';
import { outdentCommand } from './outdent.ts';
import { shiftEnterCommand } from './shift-enter.ts';
import { enterInQuote, quoteAtomAt } from './quote.ts';
import { leaveList, pastPrefix, textActedOnAt } from './util.ts';
import { withFolds } from './view.ts';

/**
 * Enter in a node's text (spec/enter.md's rules 7–10): the node splits at the caret, the spaces there
 * going as `enterSplitSpace` says and a line break with neither half. An item's rest is its next
 * sibling, taking its children (`enterMidItem: sibling`), or its first child (`child`); at its end, a
 * new empty item, the first child where it has children; a task's, a task too (`enterTask:
 * continue`). A paragraph's rest is the paragraph after it, taking its list; a heading's, the first
 * paragraph of its section; a callout title's, the callout's first paragraph. An empty item leaves
 * its list or outdents (rule 3); at a text's start a new empty node goes above (rule 6), or with
 * `enterAtTextStart: stay` the text splits there, the caret staying with it; at the end of a block of
 * its own lines, a paragraph after it (rule 11); over a selection, it goes first. Null, unsupported,
 * for a selection whose split would have blanks at it, an item whose text is neither a paragraph nor
 * an ATX heading. With `enterSplitSpace: start`, the spaces after the caret start the second half, as
 * its padding. In a quote's text (`quotes: text`) with `enterInQuote: line` Enter makes a line of it,
 * as Shift-Enter does, and on an empty one, or the blank line after its text where Enter left the
 * caret, it leaves the quote; with `split` the rest is a paragraph after it.
 * `key`: the Enter key's, where an app's quirk of it applies (`quirkEnterMidHeading`), not another
 * command's split (plain paste's line breaks, Shift-Enter in an ATX title).
 */
export function enterCommand(ctx: CommandContext, key = true): CommandOutcome {
  ctx = pastPrefix(ctx);
  const doc = ctx.doc;
  const config = doc.config;
  const code = codeAt(ctx);
  if (code) return newlineInCode(ctx, code, false);
  const quote = quoteAtomAt(ctx);
  if (quote) return enterInQuote(ctx, quote);
  const block = blockAt(ctx);
  if (block) return block;
  // in the frontmatter, the host's newline (Gap19)
  if (ctx.from.zone === 'preamble') return deferToHost('the caret is in the preamble');
  if (ctx.collapsed && ctx.from.zone === 'gap') return leaveQuote(ctx, ctx.from.owner) ?? leaveItem(ctx, ctx.from.owner);
  // in a callout's `[!type]`, markup: the host's where markup is text (Quote43), else refused, as over
  // a selection from it (Quote79)
  const from = ctx.from;
  // with `enterAtTextStart: stay`, at a heading's line start, before its `#`s: a blank line above it, the
  // heading whole, the caret to its title (Enter55c)
  if (config.enterAtTextStart === 'stay' && ctx.collapsed && from.zone === 'frame' && from.part === 'heading' && from.offset === 0 && from.text instanceof ProseText && canOpenLineAbove(ctx, from.node)) {
    return openLineAbove(ctx, from.node, from.text.textStart(0), from.text, from.text.textStart(0));
  }
  if (from.zone === 'frame' && from.part === 'callout' && from.offset > 0) return config.markup === 'text' && ctx.collapsed ? deferToHost('the caret is in markup') : reject('not-expressible', "a callout's type is one word");
  // in a setext underline, at the end of the title: the underline is markup (TO-E18)
  const underline = ctx.collapsed && from.zone === 'frame' && from.part === 'underline' && from.text instanceof ProseText ? { node: from.node, text: from.text, offset: from.text.frame.find((p) => p.part === 'underline')!.from } : null;
  const at = underline ?? textActedOnAt(ctx, Math.min(ctx.selection.anchor, ctx.selection.head));
  if (!at) return null;
  const { node, text, offset } = at;
  // over a selection in this text, it goes, and the split is where it was; across nodes, as Backspace
  // deletes it (Enter56)
  const end = ctx.collapsed ? offset : ctx.to.zone === 'text' && ctx.to.node.persistentNode === node.persistentNode ? ctx.to.offset : -1;
  if (end < 0) return splitAcross(ctx);
  // a callout's title splits as a heading's does, from its text's start too; in its `[!type]`, refused
  // (elsewhere than Obsidian the title is a paragraph's first line: its rest set apart by a blank line)
  const title = node.kind === 'quote' && text.type === 'title';
  if (title && text.frame.some((p) => p.part === 'callout' && offset > p.from && offset < p.to)) return reject('not-expressible', "a callout's type is one word");
  // a quote's text: an empty one leaves the quote, the `> ` going; with `enterInQuote: line` a line
  // of it, past the text's start (where a node goes above it, rule 6); with `split` it splits as a
  // paragraph does, the rest unquoted
  if (text.type === 'quote' && key) {
    if (text.empty && ctx.collapsed) return ctx.apply(ctx.draft().setText(node, text.slice(text.textStart(0))).setCaret(node, 0, -1));
    if (config.enterInQuote === 'line' && trimMd(text.text.slice(text.textStart(0), offset)) !== '') return shiftEnterCommand(ctx);
  }
  // (an item's text a paragraph, or an ATX heading's, `- # a`: it splits as an item)
  const headingItem = node.kind === 'item' && text.type === 'heading' && text.heading?.form === 'atx';
  const prose = text.type === 'paragraph' || text.type === 'quote';
  if (node.kind === 'item' ? !prose && !headingItem : node.kind !== 'heading' && node.kind !== 'paragraph' && !title) return null;
  if (text.empty && ctx.collapsed) return node.kind === 'item' ? enterInEmptyItem(ctx, node, text, offset) : emptyParagraph(ctx, node);
  const s = text.text;
  const line = lineOf(s, offset);
  const lineStart = text.textStart(line);
  // at the text's start (below its marker too, `-⏎  ┃b`): rule 6
  // (over a selection from there, it goes first: Enter59)
  if (trimMd(s.slice(text.textStart(0), offset)) === '' && !title) {
    const stay = config.enterAtTextStart === 'stay';
    // `stay`: an item gets an empty item above, the caret staying; a paragraph, a blank line above it;
    // an ATX heading splits there, as anywhere in its title (a setext one has no empty form). Over a
    // selection, it goes first (Enter59)
    if (stay && node.kind === 'item') return newEmptyNodeAbove(ctx, node, text, end, true);
    if (stay && node.kind === 'paragraph' && canOpenLineAbove(ctx, node)) return openLineAbove(ctx, node, offset, text, end);
    if (!stay || node.kind !== 'heading' || text.heading?.form !== 'atx') return newEmptyNodeAbove(ctx, node, text, end);
  }
  // (a closing frame stays with the first half: an ATX title's `#`s, a setext underline)
  const close = text.frame.find((p) => p.part === 'close' || p.part === 'underline');
  // the spaces at the caret: from both halves, or only the second's; a line break, from neither
  let a = offset;
  let b = end;
  if (config.enterSplitSpace === 'trim') while (a > lineStart && isSpaceOrTab(s.charCodeAt(a - 1))) a--;
  // (`start`: the spaces after the caret start the second half, written as its padding by `done()`;
  // before a line break or the text's end they start nothing, and go)
  let kept = 0;
  if (config.enterSplitSpace === 'start') while (s[b + kept] === ' ') kept++;
  if (b + kept === s.length || s[b + kept] === '\n') kept = 0;
  if (!kept) while (b < s.length && isSpaceOrTab(s.charCodeAt(b))) b++;
  // (a title left with its `[!type]` alone, the space after it goes)
  if (title && a === lineStart) while (a > 0 && isSpaceOrTab(s.charCodeAt(a - 1))) a--;
  if (a > 0 && s[a - 1] === '\n' && a === lineStart) a--;
  else if (s[b] === '\n' && b !== close?.from) {
    // and the blanks the next line starts with: at a text's start they are padding
    b++;
    while (b < s.length && isSpaceOrTab(s.charCodeAt(b))) b++;
  }
  const atEnd = trimMd(s.slice(b, close ? close.from : s.length)) === '';
  const draft = ctx.draft();
  // folded (within the zoom), at its end a new item goes after its subtree, not among its hidden
  // children, and so does the rest split mid-text where it would be the first child
  // (`enterMidItem: child`), the fold kept; zoomed into it, the rest is its first child, inside the zoom
  const folded = doc.zoomFolded.has(node.id);
  const after = folded && (atEnd || config.enterMidItem === 'child');
  const zoomRoot = doc.zoom === node.id && node.kind === 'item';
  // (`enterMidItem` is of an item with children: one without has its rest as its sibling either way)
  const child = zoomRoot || (node.kind === 'item' && node.children.length > 0 && !folded && (atEnd || config.enterMidItem === 'child'));
  // with `quirkEnterMidHeading: workflowy`, the text before the caret a paragraph (an item) above the
  // heading, which keeps the rest (its `#`s or its underline) and its section (its children)
  if (key && config.quirkEnterMidHeading === 'workflowy' && (node.kind === 'heading' || headingItem) && text.heading && !atEnd) {
    const open = text.frame.find((p) => p.part === 'heading');
    const from = open ? open.to : 0;
    // (a setext title starts at its text: spaces kept there would be none)
    let rest = b;
    if (!open) while (rest < s.length && isSpaceOrTab(s.charCodeAt(rest))) rest++;
    const [, made] = draft.split(node, a, { to: rest, children: 'follow', into: 'sibling' });
    draft.convert(made, node.kind).setText(made, text.slice(0, from).concat(text.slice(rest, close ? close.to : s.length)));
    draft.setText(node, text.slice(from, a).asItem(headingItem));
    if (!headingItem) draft.convert(node, 'paragraph');
    return ctx.apply(draft.setCaret(made, from, -1));
  }
  // a heading's rest is its section's first paragraph, a callout title's the callout's
  const into = child || node.kind === 'heading' || title ? 'child' : 'sibling';
  const stay = node.kind === 'heading' || title || after;
  const [, made] = draft.split(node, a, { to: b, children: stay ? 'stay' : 'follow', into, ...(title ? { kind: 'paragraph' as const } : {}) });
  // a task's new item is a task too
  let rest = text.slice(b, close ? close.from : s.length).asItem(node.kind === 'item');
  if (node.kind === 'item' && text.task && config.enterTask === 'continue') {
    rest = new ProseText('paragraph', true, '[ ] ').concat(rest);
    draft.setText(made, rest);
  }
  // the caret at the new text's start, before a backslash it starts with, and the spaces it keeps
  draft.setCaret(made, Math.max(0, rest.textStart(0) - kept), -1);
  // split mid-text, a folded item's children go with its second half, and its fold with them
  return withFolds(ctx.apply(draft), folded && !stay && into === 'sibling' ? [made] : []);
}

/** The blocks whose lines are a block's own (rule 11): at their end Enter makes a paragraph after them. */
const LINE_BLOCKS = new Set(['table', 'thematic_break', 'footnote_definition']);

/**
 * In a table, a thematic break, a footnote definition (rule 11): at its end, an empty paragraph after
 * it, set off from it where a line right after it would be more of it (`done()`), or where it is an
 * item's text a new item, as after code (`nodeAfterBlock`); elsewhere in a table's row refused, a row
 * is a line. Undefined where the caret is in none.
 */
function blockAt(ctx: CommandContext): CommandOutcome | undefined {
  const at = ctx.from;
  if (!ctx.collapsed || (at.zone !== 'text' && at.zone !== 'frame') || !(at.text instanceof AtomText) || !LINE_BLOCKS.has(at.text.type)) return undefined;
  if (at.offset < at.text.text.length) return at.text.type === 'table' ? reject('not-expressible', 'a row is a line') : null;
  if (at.node.kind === 'item') return nodeAfterBlock(ctx, at.node);
  const draft = ctx.draft();
  const made = draft.create('paragraph', new ProseText('paragraph', false, ''));
  draft.place('after', at.node, [made]).gap(made, at.node.gap).gap(at.node, 1).setCaret(made, 0, -1);
  return ctx.apply(draft);
}

/**
 * Enter on an empty paragraph: the quote's last node leaves the quote, as Shift-Tab takes it out
 * (Quote35); anywhere else refused, there is no second one to make (Enter40).
 */
function emptyParagraph(ctx: CommandContext, node: OutlineNode): CommandOutcome {
  if (node.kind === 'paragraph' && node.parent?.kind === 'quote' && !node.next && !node.children.length) return outdentCommand(ctx);
  return reject('not-expressible', 'an empty paragraph makes no second one');
}

/**
 * Enter on the blank line after a quote's text, where Enter or Shift-Enter at its end left the caret
 * (its first, at the text's column, `> ┃`): the quote is left, an empty paragraph after it (an item,
 * after an item), as Enter on an empty quote does. Undefined on any other blank line.
 */
function leaveQuote(ctx: CommandContext, owner: OutlineNode): CommandOutcome | undefined {
  const text = ctx.doc.textOf(owner);
  if (!(text instanceof ProseText) || text.type !== 'quote' || owner.children.length) return undefined;
  const head = ctx.selection.head;
  if (ctx.doc.lineAt(head).index !== owner.textLastLine + 1 || !ctx.doc.atTextColumn(head, owner)) return undefined;
  const draft = ctx.draft();
  const item = owner.kind === 'item';
  const id = draft.create(item ? 'item' : 'paragraph', new ProseText('paragraph', item, ''));
  return ctx.apply(draft.place('after', owner, [id]).gap(id, Math.max(0, owner.gap - 1)).gap(owner, item ? 0 : 1).setCaret(id, 0, -1));
}

/**
 * Enter on a blank line after an item's last node, the caret at the item's text column (Enter37,
 * Fence22): the line is the item's next sibling, as Enter on an empty nested item outdents it. The
 * blank lines above it stay the item's, those below go with the new item. Null on any other blank line.
 */
function leaveItem(ctx: CommandContext, owner: OutlineNode): CommandOutcome {
  const k = ctx.doc.lineAt(ctx.selection.head).index - owner.textLastLine - 1;
  if (owner.children.length || k < 0 || k >= owner.gap) return null;
  // the item whose last node the line is after
  let item: OutlineNode | null = owner;
  while (item && !(item.kind === 'item' && ctx.doc.atTextColumn(ctx.selection.head, item))) item = item.next ? null : item.parent;
  if (!item) return null;
  const draft = ctx.draft();
  const id = draft.create('item', newEmptyTextBeside(ctx, ctx.doc.textOf(item) as ProseText, 'item'));
  return ctx.apply(draft.place('after', item, [id]).gap(owner, k).gap(id, owner.gap - k - 1).setCaret(id, 0, -1));
}

/**
 * Over a selection across nodes: deleted as Backspace deletes it, the node at its start split where
 * it was, its rest the next sibling with its children. Null where the split has spaces or a line
 * break at it, or the node is no paragraph or item, which ourus doesn't do yet (unsupported).
 */
function splitAcross(ctx: CommandContext): CommandOutcome {
  const { from, to } = ctx;
  if (from.zone !== 'text' || to.zone !== 'text' || (from.node.kind !== 'item' && from.node.kind !== 'paragraph')) return null;
  const [before, after] = [from.text.text[from.offset - 1], to.text.text[to.offset]];
  if ([before, after].some((c) => c === undefined || c === '\n' || isSpaceOrTab(c.charCodeAt(0))) || ctx.config.enterMidItem === 'child') return null;
  return deleteSelectionAcross(ctx, (draft, node, offset) => {
    const [, made] = draft.split(node, offset, { children: 'follow' });
    return draft.setCaret(made, 0, -1);
  });
}

/** A new empty text for a node of `kind` made beside one whose text is `text`: a task's item is a task too (`enterTask: continue`). */
function newEmptyTextBeside(ctx: CommandContext, text: ProseText, kind: 'item' | 'paragraph'): ProseText {
  const task = kind === 'item' && !!text.task && ctx.doc.config.enterTask === 'continue';
  return new ProseText('paragraph', kind === 'item', task ? '[ ] ' : '');
}

/**
 * At the start of a node's text (rule 6, `enterAtTextStart: into`): a new empty node above it, the
 * caret going into it: an empty item above an item, an empty paragraph above a paragraph or a heading.
 * `stays`: the caret staying in the node's text instead (`stay`, an item).
 */
function newEmptyNodeAbove(ctx: CommandContext, node: OutlineNode, text: ProseText, to: number, stays = false): CommandOutcome {
  const kind = node.kind === 'item' ? 'item' : 'paragraph';
  const draft = ctx.draft();
  const rest = withoutSelection(text, to);
  if (!rest) return null;
  if (rest !== text) draft.setText(node, rest);
  const made = newEmptyTextBeside(ctx, text, kind);
  const id = draft.create(kind, made);
  draft.place('before', node, [id]);
  if (stays) draft.setCaret(node, text.textStart(0), -1);
  else draft.setCaret(id, made.textStart(0), -1);
  return ctx.apply(draft);
}

/**
 * Whether a blank line can open above `node` (`enterAtTextStart: stay`): after the node before it, its
 * own text's (a quote without a title has none), or at the document's start, where only blank lines
 * are above it (no frontmatter).
 */
function canOpenLineAbove(ctx: CommandContext, node: OutlineNode): boolean {
  const above = node.preceding;
  if (!above || above.kind === 'root') return ctx.doc.leadingBlankLines !== null;
  return above.kind !== 'quote' || ctx.doc.textOf(above) !== null || above !== node.parent;
}

/**
 * A blank line above `node`, the caret at `offset` of its text, which keeps its text but a selection
 * from its start to `to` (`enterAtTextStart: stay`).
 */
function openLineAbove(ctx: CommandContext, node: OutlineNode, offset: number, text: ProseText, to: number): CommandOutcome {
  const rest = withoutSelection(text, to);
  if (!rest) return null;
  const draft = ctx.draft();
  if (rest !== text) draft.setText(node, rest).setCaret(node, text.textStart(0), -1);
  else draft.setCaret(node, offset, -1);
  const above = node.preceding;
  if (!above || above.kind === 'root') draft.leadingBlankLines(ctx.doc.leadingBlankLines! + 1);
  else draft.gap(above, above.gap + 1);
  return ctx.apply(draft);
}

/**
 * `text` without a selection from its start to `to`, and the blanks after it (they would be padding
 * there); `text` itself where there is none; null where a line break follows it (not done yet).
 */
function withoutSelection(text: ProseText, to: number): ProseText | null {
  if (to <= text.textStart(0)) return text;
  const s = text.text;
  let end = to;
  while (end < s.length && isSpaceOrTab(s.charCodeAt(end))) end++;
  if (s[end] === '\n') return null;
  return text.splice(text.textStart(0), end);
}

/**
 * On an empty item: with children, a new empty first child (rule 4); without, first or in the middle
 * of its list, a new empty item above it, the caret staying in the lower one (rule 3,
 * `enterOnEmptyItem: sibling`; `exit` nested); last in its list, or by `enterOnEmptyItem`, it
 * outdents, or leaves its list (`leaveList`). With `unwrap`, but last without children, an empty
 * paragraph where it is (Enter7c, Enter27b, Enter21b).
 */
function enterInEmptyItem(ctx: CommandContext, node: OutlineNode, text: ProseText, offset: number): CommandOutcome {
  const config = ctx.doc.config;
  const draft = ctx.draft();
  // folded (within the zoom), with children: a new item after its subtree, not among its hidden
  // children; zoomed into it, a new first child, inside the zoom, whatever `enterOnEmptyItem` says
  if (node.children.length && ctx.doc.zoomFolded.has(node.id)) {
    const made = newEmptyTextBeside(ctx, text, 'item');
    const id = draft.create('item', made);
    return ctx.apply(draft.place('after', node, [id]).setCaret(id, made.textStart(0), -1));
  }
  if (ctx.doc.zoom === node.id) {
    const made = newEmptyTextBeside(ctx, text, 'item');
    const id = draft.create('item', made);
    return ctx.apply(draft.append(node, 'first', [id]).setCaret(id, made.textStart(0), -1));
  }
  const last = !node.next || node.next.kind !== 'item';
  if (config.enterOnEmptyItem === 'unwrap' && (node.children.length || !last)) return leaveList(ctx, node);
  if (node.children.length) {
    const made = newEmptyTextBeside(ctx, text, 'item');
    const id = draft.create('item', made);
    draft.append(node, 'first', [id]).setCaret(id, made.textStart(0), -1);
    return ctx.apply(draft);
  }
  const nested = node.parent?.kind === 'item';
  // as its list's last, or by `enterOnEmptyItem`: a nested item outdents as Shift-Tab does, a top-level
  // one leaves the list, an empty paragraph where it was (with `exit`, a nested one gets a sibling)
  if (last || !(config.enterOnEmptyItem === 'sibling' || (config.enterOnEmptyItem === 'exit' && nested))) {
    if (nested) return outdentCommand(ctx);
    return leaveList(ctx, node);
  }
  const made = newEmptyTextBeside(ctx, text, 'item');
  const id = draft.create('item', made);
  // the item at the caret is set again: where it is now decides its placeholder
  draft.place('before', node, [id]).setText(node, text).setCaret(node, offset, -1);
  return ctx.apply(draft);
}
