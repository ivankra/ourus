// Paste (Ctrl-V): the clipboard read as Markdown, by the formats it holds (spec/paste-conv.md; HTML
// converted, spec/paste-html.md), and placed as nodes between nodes (spec/paste.md, paste-list.md,
// paste-list-form.md).

import type { Config } from '../config.ts';
import { htmlToMarkdown } from './html.ts';
import { OutlineState, type OutlineNode } from '../outline/index.ts';
import { OutlineEncoder, OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { advanceColumns, dominantEnding, dropColumns, trimMd, trimMdStart } from '../text.ts';
import { gapOwner, isCodeLine, isEmptyItem, normText, type CommandContext } from './context.ts';
import { pastePlain } from './paste-plain.ts';
import { LINE_BLOCKS, closesFence, endSlot, fit, nextIsItem, ownsLists, placed, sectionEnd, spaced, type Slot } from './place.ts';
import { notApplicable, withPlan, type Outcome } from './plan.ts';

/** A clipboard as the host reads it: each format it holds, named as a `DataTransfer` names them. */
export interface Clipboard {
  /** Every copy's: a Markdown source's text, or a page's as it shows (`innerText`: no markers). */
  readonly 'text/plain'?: string;
  /** A Markdown app's own copy (Obsidian's, and ourus's). */
  readonly 'text/markdown'?: string;
  /** A rendered page's or a rich-text app's copy; a code editor's, a picture of its text. */
  readonly 'text/html'?: string;
  /** VS Code's mark beside its HTML, which is then a picture of the text. */
  readonly 'vscode-editor-data'?: string;
}

/** What a clipboard's HTML may carry beside a Markdown app's source as its text, saying that's what the text is: ourus's own mark, SiYuan's copy's comment. */
const SOURCE_MARK = /<!--\s*(?:ourus\s*-->|data-siyuan=)/;

/**
 * The Markdown a clipboard holds (spec/paste-conv.md): a Markdown app's own copy; else the text, where
 * the HTML says it's the source (a Markdown app's mark) or is a picture of it (a code editor's copy,
 * VS Code's marked so); else HTML with structure, converted; else HTML with inline formatting,
 * converted, a phrase (`phrase`: one line of text, which keeps its formatting); else the text.
 */
export function clipboardMarkdown(clipboard: Clipboard): { markdown: string; phrase: boolean } | null {
  if (clipboard['text/markdown'] !== undefined) return { markdown: clipboard['text/markdown'], phrase: false };
  const text = clipboard['text/plain'];
  const html = clipboard['text/html'];
  if (html !== undefined && clipboard['vscode-editor-data'] === undefined && !(text !== undefined && SOURCE_MARK.test(html))) {
    const converted = htmlToMarkdown(html);
    if (converted.structured || text === undefined) return { markdown: converted.markdown, phrase: false };
    if (converted.formatted && converted.markdown !== '') return { markdown: converted.markdown, phrase: true };
  }
  return text === undefined ? null : { markdown: text, phrase: false };
}

/** Paste: the clipboard's Markdown as nodes. */
/**
 * Plain paste under `pastePlainLines: items`: each line of the text a node, its Markdown escaped, but
 * where every line is a list item (`- a`, `1. a`) their markers read, each an item in the form paste
 * gives a pasted item; placed as paste places nodes; blank lines make none.
 */
export function pasteLinesAsNodes(ctx: CommandContext, text: string): Outcome {
  const lines = text.split(/\r\n|\r|\n/).map((line) => trimMd(line)).filter((line) => line !== '');
  if (!lines.length) return notApplicable;
  // ending with a line break, one line too is a node, not text put in at the caret
  // list markers are read where every line has one (as Tana reads them), else text
  const list = lines.every((line) => /^(?:[-*+]|\d{1,9}[.)])[ \t]+\S/.test(line));
  const markdown = lines.map((line) => (list ? line : ctx.encoder.escape(line, 'start').text)).join('\n\n') + '\n';
  return pasteNodes(ctx, markdown, ctx.doc.config.pasteSeams, true);
}

export function paste(ctx: CommandContext, clipboard: Clipboard): Outcome {
  const read = clipboardMarkdown(clipboard);
  if (read === null) return notApplicable;
  const { markdown } = read;
  if (ctx.collapsed && trimMd(ctx.doc.text) === '') return fillDocument(ctx, markdown);
  return pasteNodes(ctx, markdown, ctx.doc.config.pasteSeams);
}

/**
 * The clipboard's Markdown, as paste reads it: its lines without the blank ones at its ends, as
 * `clipboardSource` gives them, and the nodes they make; null where it holds nothing.
 */
function readFragment(markdown: string, config: Partial<Config>): { source: string[]; fragment: OutlineState; inline: boolean } | null {
  const lines = markdown.split(/\r\n|\n|\r/);
  while (lines.length && trimMd(lines[0]!) === '') lines.shift();
  while (lines.length && trimMd(lines[lines.length - 1]!) === '') lines.pop();
  if (!lines.length) return null;
  let source = clipboardSource(lines, config);
  // one line without a line break is inline text; with one (a line copied whole), a line of its own
  const inline = lines.length < 2 && !/[\r\n][ \t\r\n]*$/.test(markdown);
  let fragment = OutlineState.parse(source.join('\n'), { config });
  // frontmatter is only at a document's start: pasted into one, its lines are what they read as there
  // (a thematic break, a setext heading), read after a blank line
  if (fragment.lines[0]?.leaf?.type === 'frontmatter') {
    source = ['', ...source];
    fragment = OutlineState.parse(source.join('\n'), { config });
  }
  // a fenced block the clipboard leaves open is closed where it ends, as it reads there, in what
  // holds it (an item's code at its content column): open, it would run on into the text after the paste
  const last = fragment.lines[fragment.lines.length - 1]?.leaf;
  if (last && ((last.type === 'code_block' && last.fenced) || last.type === 'math_block' || last.type === 'comment_block') && !last.closed) {
    const line = fragment.lines[last.startLine]!;
    const opening = /^[ \t]*(?:`{3,}|~{3,}|\$\$|%%)/.exec(fragment.text.slice(line.contentFrom, line.to));
    if (opening) {
      source = [...source, new OutlineEncoder(fragment).continuation(line.prefix) + opening[0]];
      fragment = OutlineState.parse(source.join('\n'), { config });
    }
  }
  return { source, fragment, inline };
}

/** Whether `node` is an item with no text of its own, children or not: a paste fills it. */
const isEmptyText = (ctx: CommandContext, node: OutlineNode): boolean => node.kind === 'item' && (isEmptyItem(ctx, node) || ctx.doc.isEmpty(node));

/** The fragment's nodes as new nodes to place, every item with its own marker. */
function pastedNodes(fragment: OutlineState): OutlinePlanNode[] {
  const mark = (n: OutlinePlanNode, from: OutlineNode): OutlinePlanNode => ({
    ...n,
    ...(from.kind === 'item' && { marker: fragment.text.slice(fragment.markerFrom(from.block), fragment.markerTo(from.block)) }),
    children: n.children.map((c, k) => mark(c as OutlinePlanNode, from.children[k]!)),
  });
  return fragment.root.children.map((root) => mark(OutlinePlan.copy(fragment, root), root));
}

/** Where pasted nodes go from the caret (`pasteSeams: closed`): a slot, and where the caret is in its node. */
interface CaretSlot extends Slot {
  /** The caret is at the end of the node's text (or the node has none): where one line without a line break can be a node. */
  readonly atEnd: boolean;
  /** On a blank line, below the node: what is pasted is nodes, plain lines too (no text to join them to). */
  readonly onBlank?: boolean;
  /** On a blank line, the node's end, where the paste goes as if the caret were there. */
  readonly from?: number;
}

/**
 * The slot the caret is in, for nodes, or what pastes there instead: plain paste, in code and in the
 * middle of a block that isn't text (a table's row: its lines are the block's own); the host's, in
 * markup (a marker, a heading's `#`s, before a callout's title); on a line of a node that isn't its
 * text, plain paste's for plain lines (`lines`), which knows every line, and the host's for the rest. The slot doesn't depend on where in a node's text the caret is
 * (`pasteSeams: closed`); only whether it is at the text's end, where one line without a line break
 * can be a node, or at its start, before the node (`pasteAtTextStart: before`). On a blank line, the
 * slot of the node above's end, where Enter there puts a new node.
 */
function slotAt(ctx: CommandContext, pos: number, items: boolean): CaretSlot | 'plain' | 'lines' | 'host' {
  const { doc } = ctx;
  // in code, what is pasted is code (`isCodeLine` narrows what it's given: the line is looked up again)
  if (isCodeLine(ctx, doc.lineAt(pos))) return 'plain';
  const line = doc.lineAt(pos);
  const node = doc.nodeAt(pos);
  if (!node) {
    const owner = line.blank ? gapOwner(ctx, line.index) : null;
    if (!owner || owner.kind === 'root') return 'host';
    const end = owner.kind === 'atom' ? doc.lines[owner.block.endLine]!.to : (doc.headRange(owner)?.to ?? doc.lines[owner.startLine]!.to);
    const there = slotAt(ctx, end, items);
    return typeof there === 'string' ? there : { ...there, atEnd: true, onBlank: true, from: end };
  }
  if (node.kind === 'item') {
    const blank = isEmptyText(ctx, node) && pos >= doc.markerTo(node.block);
    const task = blank && /^\[[ xX]\]/.test(trimMd(doc.headLines(node)[0] ?? ''));
    if (blank && !node.children.length && !(task && doc.config.enterTask === 'plain')) return { where: 'instead', node, list: node, reference: { item: node, before: true }, atEnd: true };
    if (blank) return { ...endSlot(ctx, node, items), atEnd: true };
    // an item whose text is a block of its own (code, a table): at its end, as at a text's end
    if (node.head && node.head.type !== 'paragraph' && node.head.type !== 'heading') return pos < doc.markerTo(node.block) ? 'host' : { ...endSlot(ctx, node, items), atEnd: pos === doc.lines[node.head.endLine]!.to };
  }
  // an empty paragraph (a line held for the caret, after Enter) is filled, as an empty item is
  if (node.kind === 'paragraph' && !node.children.length && doc.isEmpty(node)) return { where: 'instead', node, list: null, reference: null, atEnd: true };
  // in a block that isn't text (a table, a rule), its end is its own: after it; elsewhere in it, lines are its own (plain paste's, which a table's row refuses)
  if (node.kind === 'atom') return pos === doc.lines[node.block.endLine]!.to ? { ...endSlot(ctx, node, items), atEnd: true } : 'plain';
  // a callout's title is text, the callout's body its children
  if (node.kind !== 'item' && node.kind !== 'paragraph' && node.kind !== 'heading' && !(node.kind === 'quote' && node.head)) return 'host';
  if (!inText(ctx, node, pos)) {
    // in markup before the text, the host's; on a line of the node that isn't its text, plain paste's, which knows every line
    const head = node.head;
    return head && line.index >= head.startLine && line.index <= head.endLine ? 'host' : 'lines';
  }
  const atEnd = atTextEnd(ctx, node, pos);
  if (doc.config.pasteAtTextStart === 'before' && !atEnd && line.index === node.head!.startLine && pos <= doc.textStart(pos)) {
    // before a heading, the text before its line is the section above's: last in its deepest last section
    const above = node.kind === 'heading' ? node.parent!.children[node.parent!.children.indexOf(node) - 1] : undefined;
    if (above?.kind === 'heading') return { where: 'last', node: sectionEnd(above, null)!, list: null, reference: null, atEnd };
    return { where: 'before', node, list: node.kind === 'item' ? node : null, reference: node.kind === 'item' ? { item: node, before: true } : null, atEnd };
  }
  return { ...endSlot(ctx, node, items), atEnd };
}

/** Whether `pos` is in `node`'s text: its first block a paragraph or a heading, past its markup; or a callout's title (Obsidian's), past its `[!type]`. */
function inText(ctx: CommandContext, node: OutlineNode, pos: number): boolean {
  const { doc } = ctx;
  const head = node.head;
  if (head?.type === 'callout_title') {
    const line = doc.lines[head.startLine]!;
    const type = /^\[![^\]]*\][+-]?/.exec(doc.text.slice(line.contentFrom, line.to))?.[0].length ?? 0;
    return doc.lineAt(pos).index === line.index && pos >= line.contentFrom + type;
  }
  if (!head || (head.type !== 'paragraph' && head.type !== 'heading') || !doc.headRange(node)) return false;
  const line = doc.lineAt(pos);
  const lastText = head.type === 'heading' && head.setext ? head.endLine - 1 : head.endLine;
  // on an item's first line its text starts after its marker and the space after it (before a heading's `#`s too)
  // (on a later line, after its containers' prefix: a continuation line's indentation isn't markup)
  const markerTo = node.kind === 'item' ? doc.markerTo(node.block) : -1;
  const onMarkerLine = markerTo >= 0 && doc.lineAt(markerTo).index === line.index;
  const start = onMarkerLine ? Math.min(doc.textStart(pos), markerTo + (doc.text[markerTo] === ' ' ? 1 : 0)) : line.index !== head.startLine ? line.contentFrom : doc.textStart(pos);
  if (line.index < head.startLine || line.index > lastText || pos < start) return false;
  // a heading's `#`s are markup; an item's text that is a heading starts after its marker
  return !(node.kind === 'heading' && pos < doc.headRange(node)!.from);
}

/** Whether `pos` is at the end of `node`'s text (its last line's), where one line without a line break can be a node. */
function atTextEnd(ctx: CommandContext, node: OutlineNode, pos: number): boolean {
  const { doc } = ctx;
  const head = node.head!;
  const lastText = head.type === 'heading' && head.setext ? head.endLine - 1 : head.endLine;
  return doc.lineAt(pos).index === lastText && pos >= doc.headRange(node)!.to;
}

/**
 * The paste as nodes between nodes (`pasteSeams: closed`): the node at the caret is left as it is,
 * and the pasted nodes go in the slot the caret is in (`slotAt`). Plain lines (paragraphs alone) go
 * into the node's text, as plain paste puts them (`pasteLines: text`), but in a heading, which holds
 * one line.
 */
function pasteNodes(ctx: CommandContext, markdown: string, seams: Config['pasteSeams'], asNodes = false): Outcome {
  const { doc } = ctx;
  // over a selection, `executeCommand` deletes it first
  if (!ctx.collapsed) return notApplicable;
  const read = readFragment(markdown, doc.config);
  if (!read) return notApplicable;
  const { fragment, inline } = read;
  const roots = pastedNodes(fragment);
  if (!roots.length) return notApplicable;
  const items = roots.every((root) => root.kind === 'item');
  // one line that is no item is inline text, not nodes (in a node's text `executeCommand` puts it in)
  if (inline && !items && roots[0]!.kind !== 'quote') return notApplicable;
  const pos = ctx.sel.head;
  // in an empty item's marker, or before its checkbox, the paste goes where its text starts
  const here = doc.nodeAt(pos);
  if (here && isEmptyText(ctx, here) && pos >= doc.markerTo(here.block) && pos < doc.textStart(pos)) return pasteNodes(ctx.at(doc.textStart(pos)), markdown, seams, asNodes);
  const at = slotAt(ctx, pos, items);
  if (at === 'host') return notApplicable;
  // plain lines: paragraphs alone
  const lines = roots.every((root) => root.kind === 'paragraph' && !root.children.length);
  // in code, or in a block's own lines: one line inline, the host's; lines its text
  if (at === 'plain') return inline ? notApplicable : pastePlain(ctx, markdown);
  if (at === 'lines') return !inline && lines ? pastePlain(ctx, markdown) : notApplicable;
  let slot: CaretSlot = at;
  // on a blank line below an empty item, it is filled, as from its end
  if (slot.onBlank && slot.where === 'instead' && slot.from !== undefined) return pasteNodes(ctx.at(slot.from), markdown, seams, asNodes);
  // an empty item with children is a parent, the paste first among them; but a block first there
  // would be its text, and with open seams the paste is its text: it fills the item instead, the
  // children following it
  if (slot.where !== 'instead' && isEmptyText(ctx, slot.node) && slot.node.children.length && (!items || seams === 'open')) slot = { ...slot, where: 'instead', list: slot.node, reference: { item: slot.node, before: true } };
  // one line without a line break, in the middle of the text, is inline text (`1. Introduction`), not nodes
  if (inline && !slot.atEnd) return notApplicable;
  // what can't be an item before an item (a quote, a table) goes after it, as anywhere else in its text
  const leads = (root: OutlinePlanNode): boolean => root.kind === 'item' || root.kind === 'paragraph' || root.kind === 'heading' || LINE_BLOCKS.includes(root.blockType ?? '');
  if (slot.where === 'before' && slot.node.kind === 'item' && !leads(roots[0]!)) slot = { ...endSlot(ctx, slot.node, items), atEnd: false };
  const { node } = slot;
  // plain lines go into the text, as plain paste puts them; a heading holds one line, and takes them as
  // nodes, as a callout's title does (Obsidian's)
  // (in an empty item's marker, or before its checkbox, they go where its text starts)
  if (lines && !asNodes && doc.config.pasteLines === 'text' && node.kind !== 'heading' && node.head?.type !== 'callout_title' && node.kind !== 'atom' && !slot.onBlank && !(node.kind === 'item' && node.head && node.head.type !== 'paragraph' && node.head.type !== 'heading')) {
    return pastePlain(pos < doc.textStart(pos) ? ctx.at(doc.textStart(pos)) : ctx, markdown);
  }
  // a quote or a table pasted on an empty item is its first block: the item has no text of its own
  const block = roots.length === 1 && (roots[0]!.kind === 'quote' || roots[0]!.blockType === 'table');
  if (slot.where === 'instead' && node.kind === 'item' && block) return pasteFirstBlock(ctx, node, fragment.root.children[0]!, fragment, read.source);
  // with open seams, in a node's text, the paste's ends join it; where they can't, the paste is closed
  if (seams === 'open' && slot.where !== 'instead' && !slot.onBlank) return pasteOpen(ctx, read) ?? pasteNodes(ctx, markdown, 'closed', asNodes);
  const fitted = fit(ctx, roots, slot);
  // what can't be a node where it lands is pasted as text
  if (!fitted) return pastePlain(ctx, markdown);
  // on the empty last line Shift-Enter leaves in a node's text (a placeholder holds it), the nodes take
  // its place: the line goes, and they follow the node, set off only where Markdown needs it
  const caretLine = doc.lineAt(pos);
  const held = !slot.onBlank && slot.where !== 'instead' && doc.placeholders.includes(pos) && !!node.head && doc.nodeAt(pos) === node && caretLine.index > node.head.startLine && caretLine.index === node.head.endLine && trimMd(doc.text.slice(caretLine.contentFrom, caretLine.to)) === '';
  const kept = held ? doc.headLines(node).slice(0, -1) : [];
  const { expected, last, line, apart, drop } = placed(ctx, slot, fitted, held ? ctx.plan.update(node, (n) => ({ ...n, lines: kept, text: normText(kept) })) : ctx.plan);
  // the caret at the end of the last pasted text
  const plan = ctx.encode(expected, apart && !held ? { separate: 'around' } : {}, (written) => {
    const caret = written.at(last, line, last.lines![line]!.length);
    return { anchor: caret, head: caret };
  });
  const dropped = held ? [pos] : drop;
  return withPlan(plan, dropped.length ? { drop: [...dropped] } : {});
}

/** `n` with its deepest last node (the last of its last child's, on down) changed by `change`. */
function lastOf(n: OutlinePlanNode, change: (last: OutlinePlanNode) => OutlinePlanNode): OutlinePlanNode {
  const kid = n.children[n.children.length - 1];
  return kid && OutlinePlan.isPlanned(kid) ? { ...n, children: [...n.children.slice(0, -1), lastOf(kid, change)] } : change(n);
}

/**
 * The paste with open seams (`pasteSeams: open`), in an item's or a paragraph's text: the first pasted
 * text joins the text before the caret (a heading's title too, its section after it), the text after
 * the caret joins the last pasted text, and between them the nodes go as under closed seams, fitted to
 * the list. The node's children follow the last pasted node at their depth: an item's are its
 * children, a paragraph's list its list, or its siblings after an item. Where the last pasted node has
 * no text to join (code, a quote), the text after the caret is a node of its own after it, as Enter's
 * split would leave it, the node's children its. Null where the first seam can't close: a heading's
 * title at the caret (it holds one line), a block first that isn't text, a heading among the pasted
 * nodes that takes in what follows it, lazy lines in the node's text (the paste is closed there).
 */
function pasteOpen(ctx: CommandContext, read: { source: string[]; fragment: OutlineState }): Outcome | null {
  const { doc } = ctx;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos)!;
  const head = node.head;
  if (!head || head.type !== 'paragraph' || (node.kind !== 'item' && node.kind !== 'paragraph')) return null;
  // lazy lines, rewritten in a node of their own, would read otherwise at its indentation
  if (doc.ownLines(node).some((line) => line.lazy)) return null;
  let { fragment } = read;
  // a heading first joins its title, as a paragraph would: its section after it
  const heading = fragment.root.children[0];
  if (heading?.kind === 'heading') {
    const range = fragment.headRange(heading)!;
    const title = ctx.encoder.escape(fragment.text.slice(range.from, range.to), 'start').text;
    const source = [...read.source];
    source.splice(heading.head!.startLine, heading.head!.endLine - heading.head!.startLine + 1, title, '');
    fragment = OutlineState.parse(source.join('\n'), { config: doc.config });
  }
  const inList = node.kind === 'item';
  const list = inList ? node.block.parent : null;
  const slot: Slot = { where: 'after', node, list: inList ? node : null, reference: inList ? { item: node, before: true } : null };
  const fitted = fit(ctx, pastedNodes(fragment), slot);
  if (!fitted || fitted.into.length || fitted.taken?.length || fitted.place || fitted.after) return null;
  const isText = (n: OutlinePlanNode): boolean => (n.kind === 'item' ? !n.blockType : n.kind === 'paragraph') && !!n.lines?.length && !n.lazy;
  const [first, ...rest] = spaced(fitted.nodes, list, nextIsItem(node));
  if (!first || !isText(first)) return null;
  // the node's text before and after the caret
  const own = doc.headLines(node);
  const line = doc.lineAt(pos);
  const k = line.index - head.startLine;
  const before = [...own.slice(0, k), own[k]!.slice(0, pos - line.contentFrom)];
  const after = [own[k]!.slice(pos - line.contentFrom), ...own.slice(k + 1)];
  const textAfter = after.some((l) => trimMd(l) !== '');
  // two texts joined, the line they meet on escaped where it would read as a block there; where the
  // first ends on it (`end`), past the backslash where one went before that
  const seam = (a: readonly string[], b: readonly string[]): { lines: string[]; end: number } => {
    const j = a.length - 1;
    // (with the lines below it, as a link reference definition reads with them)
    const escaped = j === 0 ? ctx.encoder.escape(a[j]! + b[0]!, 'start', b.slice(1)) : ctx.encoder.escape(a[j]! + b[0]!, 'continuation');
    const end = a[j]!.length + (escaped.at !== null && escaped.at <= a[j]!.length ? 1 : 0);
    return { lines: [...a.slice(0, j), escaped.text, ...b.slice(1)], end };
  };
  // the node's own text: the text before the caret and the first pasted text; the first's children its
  const tops: OutlinePlanNode[] = [{ ...first, ...((l) => ({ lines: l, text: normText(l) }))(seam(before, first.lines!).lines) }, ...rest];
  // the last pasted text, which the text after the caret joins, the caret at its end
  let caret: { node: OutlinePlanNode; line: number; ch: number } | null = null;
  let closes = false;
  tops[tops.length - 1] = lastOf(tops[tops.length - 1]!, (n) => {
    closes = isText(n);
    const j = n.lines!.length - 1;
    if (!closes || !textAfter) {
      const end = n.lines!.length - (closesFence(n.lines!) ? 2 : 1);
      return (caret = { node: n, line: end, ch: n.lines![end]!.length }).node;
    }
    const { lines, end } = seam(n.lines!, after);
    const done = { ...n, lines, text: normText(lines) };
    return (caret = { node: done, line: j, ch: end }).node;
  });
  // the node's children follow the last pasted node: under it (an item's, a paragraph's list under a
  // paragraph), or after it (a paragraph's list after an item); with the text after the caret, where
  // it joins nothing, as a node of the node's kind
  const kids = node.children;
  const top = tops[tops.length - 1]!;
  if (textAfter && !closes) {
    const lines = [ctx.encoder.escape(trimMdStart(after[0]!), 'start').text, ...after.slice(1)];
    const marker = inList ? { marker: doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block)) } : {};
    tops.push({ ...OutlinePlan.created(node.kind, normText(lines)), lines, ...marker, children: kids });
  } else if (inList || top.kind === 'paragraph') tops[tops.length - 1] = { ...top, children: [...top.children, ...kids] };
  else tops.push(...(kids as unknown as OutlinePlanNode[]));
  // the node takes the first's place, its marker and spacing its own
  // in an item or a quote a paragraph owns no list: the first's children follow it
  const owns = inList || ownsLists(node.parent!);
  if (!owns && tops[0]!.children.length) tops.splice(0, 1, { ...tops[0]!, children: [] }, ...(tops[0]!.children as OutlinePlanNode[]));
  let n1: OutlinePlanNode | undefined;
  let expected = ctx.plan.update(node, (n) => (n1 = { ...n, text: tops[0]!.text, lines: tops[0]!.lines, children: tops[0]!.children }));
  if (tops.length > 1) expected = expected.place('after', node, tops.slice(1));
  const target = caret!.node === tops[0] ? n1! : caret!.node;
  const plan = ctx.encode(expected, inList ? {} : { separate: 'around' }, (written) => {
    const at = written.at(target, caret!.line, caret!.ch);
    return { anchor: at, head: at };
  });
  return withPlan(plan, {});
}

/**
 * A quote or a table pasted on an empty item: its first block, the item holding it and no text of its
 * own (`- > q`), written by hand since a new item's lines are its own text. The block's lines go after
 * the marker, the rest at the item's content column, as written; after an empty task's checkbox, which
 * a block can't follow on its line, the block starts the next, the task's first child.
 */
function pasteFirstBlock(ctx: CommandContext, node: OutlineNode, root: OutlineNode, fragment: OutlineState, source: readonly string[]): Outcome {
  const { doc } = ctx;
  const line = doc.lineAt(ctx.sel.head);
  const prefix = ctx.encoder.itemContinuation(node);
  const eol = ctx.ending(line);
  const blockLines = source.slice(root.startLine, fragment.lastDescendant(root).endLine + 1);
  // one space after the marker, then the block: spaces past it (a deleted character's place) go
  const markerTo = doc.markerTo(node.block);
  const start = /^[ \t]*$/.test(doc.text.slice(markerTo, line.to)) && ctx.sel.head >= markerTo ? { from: markerTo, lead: ' ' } : { from: ctx.sel.head, lead: doc.text.slice(markerTo, line.to) === '' ? ' ' : '' };
  const box = /^\[[ xX]\]/.test(trimMdStart(doc.headLines(node)[0] ?? ''));
  const insert = box
    ? blockLines.map((text) => eol + (text === '' ? '' : prefix + text)).join('')
    : start.lead + blockLines.map((text, k) => (k === 0 ? text : eol + (text === '' ? '' : prefix + text))).join('');
  const from = box ? ctx.sel.head : start.from;
  const caret = from + insert.length;
  const expected = ctx.plan.update(node, (n) => ({ ...n, children: [OutlinePlan.copy(fragment, root), ...n.children] }));
  // the empty item's placeholder goes with it
  const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
  const extra = drop.length ? { drop } : {};
  const to = from === ctx.sel.head ? from : line.to;
  const plan = ctx.caret([{ from, to, insert }], caret, expected, extra);
  // text right after the item would continue the block lazily: then a blank line sets it apart
  const next = doc.lines[line.index + 1];
  if (!next || next.blank) return plan;
  const blank = eol + ctx.encoder.continuation(line.prefix).replace(/[ \t]+$/, '');
  return { ...plan, fallback: () => ctx.caret([{ from, to, insert: insert + blank }], caret, expected, extra) };
}

/**
 * Into an empty document, the paste is the document: its Markdown as it reads, the blank lines at its
 * ends gone, the document's line ending after it; the caret at the end of its last text (in code, its
 * last line's end, not the closing fence's; in a setext heading, its title's).
 */
function fillDocument(ctx: CommandContext, markdown: string): Outcome {
  const { doc } = ctx;
  const lines = markdown.split(/\r\n|\n|\r/);
  while (lines.length && trimMd(lines[0]!) === '') lines.shift();
  while (lines.length && trimMd(lines[lines.length - 1]!) === '') lines.pop();
  if (!lines.length) return notApplicable;
  const source = clipboardSource(lines, doc.config);
  const pasted = OutlineState.parse(source.join('\n'), { config: doc.config });
  const last = pasted.lines[pasted.lines.length - 1]!.leaf;
  const closed = last && ((last.type === 'code_block' && last.fenced) || last.type === 'math_block' || last.type === 'comment_block') && (last as { closed?: boolean }).closed;
  const setext = last?.type === 'heading' && last.setext;
  const caretLine = source.length - 1 - (closed || setext ? 1 : 0);
  const eol = dominantEnding(doc.text);
  const insert = source.join(eol) + eol;
  const caret = source.slice(0, caretLine).reduce((n, line) => n + line.length + eol.length, 0) + source[caretLine]!.length;
  // what the empty document holds (a held empty paragraph) goes: the paste is the document
  const expected = (doc.root.children.length ? ctx.plan.remove(doc.root.children) : ctx.plan).append(doc.root, 'first', pasted.root.children.map((node) => OutlinePlan.copy(pasted, node)));
  return ctx.caret([{ from: 0, to: doc.text.length, insert }], caret, expected, { drop: [...doc.placeholders] });
}

/**
 * A clipboard's lines (its blank ones at either end gone) as paste reads them: without the indentation
 * all of them share; and a fenced block copied from inside a list or a quote, from its fence on, whose
 * fence's line lost the indentation the others keep, its closing fence among them, which then doesn't
 * close the block (a code fence four columns in), read with the others losing it too, which closes the
 * fence and gives the code its own indentation back. A block that closes as it is reads as it is, its
 * code's indentation kept (so do other clipboards).
 */
export function clipboardSource(lines: readonly string[], config: Partial<Config>): string[] {
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  const common = Math.min(...lines.filter((text) => trimMd(text) !== '').map(indentOf));
  const source = lines.map((text) => (trimMd(text) === '' ? '' : dropColumns(text, common)));
  const fence = /^(`{3,}|~{3,}|\$\$|%%)/.exec(source[0]!);
  const rest = source.slice(1).filter((text) => text !== '');
  const inner = rest.length ? Math.min(...rest.map(indentOf)) : 0;
  const closes = (): boolean => !!(OutlineState.parse(source.join('\n'), { config }).root.children[0]?.block as { closed?: boolean } | undefined)?.closed;
  if (fence && inner > 0 && indentOf(source[source.length - 1]!) === inner && !closes() && new RegExp(`^[ \\t]*\\${fence[1]![0]}{${Math.min(fence[1]!.length, 3)},}[ \\t]*$`).test(source[source.length - 1]!)) {
    return [source[0]!, ...source.slice(1).map((text) => (text === '' ? '' : dropColumns(text, inner)))];
  }
  return source;
}

