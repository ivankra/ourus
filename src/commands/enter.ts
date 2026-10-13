// Enter and Shift-Enter: splitting a node, and breaking a line inside one.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { advanceColumns, lineSpan, skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, Operands, blankInQuote, followsParentText, isEmptyItem, isEmptyWithChildren, normText, reTaskBox } from './context.ts';
import { notApplicable, reject, type Outcome } from './plan.ts';
import { outdent } from './structure.ts';
import { enterAfterFence, fenceNewline } from './code.ts';

/** Where a node's text splits: the range the split replaces, the two halves, and what follows. */
interface Cut {
  from: number;
  to: number;
  before: string[];
  after: string[];
  /** The rest of the line the second half starts with. */
  rest: string;
  /** Nothing of the text comes before the split (a task's checkbox aside). */
  atStart: boolean;
}

function cutText(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Cut | null {
  const { doc } = ctx;
  const head = node.head!;
  const lines = doc.headLines(node);
  const i = line.index - head.startLine;
  if (i < 0 || i >= lines.length || selFrom < line.contentFrom || selTo > line.to) return null;
  const text = doc.text;
  const lineBefore = lines[i]!.slice(0, selFrom - line.contentFrom);
  const lineAfter = lines[i]!.slice(selTo - line.contentFrom);
  let before = [...lines.slice(0, i), lineBefore];
  let after = [lineAfter, ...lines.slice(i + 1)];
  let from = selFrom;
  let to = selTo;
  // spaces at the split stay with neither half
  to = skipSpaces(text, to, line.to, 1);
  from = skipSpaces(text, from, line.contentFrom, -1);
  // at a line boundary inside the text, split at the line break rather than leave an empty line
  if (lineBefore.trim() === '' && i > 0) {
    before = lines.slice(0, i);
    from = doc.lines[line.index - 1]!.to;
  }
  if (lineAfter.trim() === '' && i < lines.length - 1) {
    after = lines.slice(i + 1);
    const next = doc.lines[line.index + 1]!;
    to = next.contentFrom;
    to = skipSpaces(text, to, next.to, 1);
  }
  const lead = lineBefore.trim();
  const atStart = i === 0 && (lead === '' || (reTaskBox.test(lead) && lead.length === 3));
  return { from, to, before, after, rest: text.slice(to, lineSpan(text, to)[1]), atStart };
}

/**
 * Enter in a callout's title where the flavor reads the title as a line of its own (Obsidian): the
 * rest of the title starts the body, in the paragraph the body starts with or in a new one before
 * it. In the `[!type]` marker a line break would unmake the callout.
 */
function splitCalloutTitle(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (line.index !== node.head!.startLine) return notApplicable;
  const text = doc.text;
  const markerEnd = line.contentFrom + (/^\[![^\]]*\][+-]?/.exec(text.slice(line.contentFrom, line.to))?.[0].length ?? 0);
  if (selFrom < markerEnd) return reject('not-expressible', "a line break would split the callout's type");
  let from = selFrom;
  from = skipSpaces(text, from, markerEnd, -1);
  let to = selTo;
  to = skipSpaces(text, to, line.to, 1);
  let rest = text.slice(to, line.to);
  const first = node.children[0];
  const joins = first?.kind === 'paragraph' && first.startLine === line.index + 1;
  const body = joins ? doc.headLines(first) : [];
  // the rest starts a paragraph: escaped where it would start a block instead
  if (rest !== '') rest = ctx.encoder.escape(rest, 'start', body).text;
  const insert = ctx.ending(line) + ctx.encoder.continuation(line.prefix);
  const caret = from + insert.length;
  const kept = ctx.plan.setText(node, normText([text.slice(line.contentFrom, from)]));
  const expected = joins ? kept.setText(first, normText([rest, ...body])) : kept.append(node, 'first', [OutlinePlan.created('paragraph', normText([rest]))]);
  return ctx.caret([{ from, to: line.to, insert: insert + rest }], caret, expected);
}

export function split(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const selFrom = ctx.from;
  const selTo = ctx.to;
  const node = doc.nodeAt(selFrom);
  if (!node) return selFrom === selTo ? (leaveItem(ctx, selFrom) ?? notApplicable) : notApplicable;
  const line = doc.lineAt(selFrom);
  if (doc.lineAt(selTo).index !== line.index) return notApplicable; // a selection across lines is the host's
  if (node.kind === 'paragraph') {
    const quote = node.parent!;
    if (quote.kind === 'quote' && quote.children[quote.children.length - 1] === node && OutlineState.isEmptyText(doc.headLines(node).join('\n'))) return leaveQuoteEmpty(ctx, node);
    return splitParagraph(ctx, node, line, selFrom, selTo);
  }
  if (node.kind === 'heading') return splitHeading(ctx, node, line, selFrom, selTo);
  // a callout's title: a line of its own (Obsidian), or with the body one paragraph, whose line Enter
  // breaks; either way the rest starts the body
  if (node.kind === 'quote' && node.head?.type === 'callout_title') return splitCalloutTitle(ctx, node, line, selFrom, selTo);
  if (node.kind === 'quote' && node.head) return lineBreak(ctx);
  if (line.leaf?.type === 'code_block' && line.leaf.fenced) return enterAfterFence(ctx, node, line, selFrom, selTo) ?? fenceNewline(ctx, node, line, selFrom, selTo);
  if (node.kind !== 'item') return notApplicable;
  const pos = selFrom;
  if (pos < line.contentFrom && line.index !== node.startLine) return notApplicable;
  const eol = ctx.ending(line);

  // an empty item with children: Enter makes a new empty first child, the caret going into it, as at
  // the end of any item with children (Workflowy, Logseq, Roam)
  if (isEmptyWithChildren(ctx, node)) {
    if (pos < doc.markerTo(node.block) || selFrom !== selTo) return notApplicable;
    const first = node.children[0]!;
    const box = reTaskBox.test(doc.headLines(node)[0]?.trimStart() ?? '') ? '[ ] ' : '';
    const prefix = first.kind === 'item' ? ctx.encoder.siblingPrefix(first) : ctx.encoder.childIndent(node, first);
    const marker = first.kind === 'item' ? ctx.encoder.markerText(first, false) : ctx.encoder.markerText(node, false).replace(/^\d+/, '1');
    const markerLine = doc.lines[node.startLine]!;
    const insert = eol + prefix + marker + ' ' + box;
    const caret = markerLine.to + insert.length;
    const expected = ctx.plan.append(node, 'first', [OutlinePlan.created('item', box.trim())]);
    return ctx.caret([{ from: markerLine.to, to: markerLine.to, insert }], caret, expected);
  }
  if (isEmptyItem(ctx, node)) {
    if (pos < doc.markerTo(node.block)) return notApplicable;
    // Enter on an empty item: a nested one outdents as the last child. First or in the middle of its
    // list, it gets a new empty sibling, the caret going into it (Workflowy, Logseq), or with
    // `enterOnEmptyItem: outdent` it outdents there too (Roam). A top-level one, or one in a quote,
    // leaves the list, becoming an empty paragraph held by a placeholder, set off from the items around
    // it by blank lines; in a quote, it stays in the quote (Obsidian).
    if (node.parent!.kind === 'item') {
      const siblings = node.parent!.children;
      if (siblings[siblings.length - 1] === node || doc.config.enterOnEmptyItem === 'outdent') return outdent(ctx.at(pos), new Operands([node]));
      // right after the parent's text the empty item exists only under the caret: the new one goes above
      if (followsParentText(ctx, node)) return insertBefore(ctx, node, pos, '');
      const markerLine = doc.lines[node.startLine]!;
      const insert = eol + ctx.encoder.siblingPrefix(node) + ctx.encoder.markerText(node, true) + ' ';
      const caret = markerLine.to + insert.length;
      const expected = ctx.plan.place('after', node, [OutlinePlan.created('item', '')]);
      return ctx.caret([{ from: markerLine.to, to: markerLine.to, insert }], caret, expected);
    }
    const markerLine = doc.lines[node.startLine]!;
    // the containers the item is in (a quote's `>`) stay on its line and on the blank lines around it
    const outer = ctx.encoder.continuation(markerLine.prefix.slice(0, markerLine.prefix.findIndex((p) => p.block === node.block)));
    const prev = doc.lines[node.startLine - 1];
    const next = doc.lines[node.startLine + 1];
    const before = prev && !blankInQuote(ctx, prev) ? outer.trimEnd() + eol : '';
    const after = next && !blankInQuote(ctx, next) ? eol + outer.trimEnd() : '';
    const changes = [{ from: markerLine.from, to: markerLine.to, insert: before + outer + after }];
    const caret = markerLine.from + before.length + outer.length;
    const parent = node.parent!;
    const empty = OutlinePlan.created('paragraph', '');
    // leaving a paragraph's list, the new paragraph follows the paragraph, and the items after it
    // become its own
    const expected =
      parent.kind === 'paragraph'
        ? ctx.plan.update(parent, (n) => ({ ...n, children: n.children.slice(0, n.children.indexOf(node)) })).place('after', parent, [empty, ...parent.children.slice(parent.children.indexOf(node) + 1)])
        : ctx.plan.place('instead', node, [empty]);
    return ctx.caret(changes, caret, expected, { placeholders: [caret] });
  }

  if (!node.head || node.head.type !== 'paragraph') return notApplicable; // `- - a`, or a code or quote head
  // in the item's marker, Enter acts at its text start
  const at = selFrom === selTo && line.index === node.startLine ? Math.max(selFrom, doc.headRange(node)!.from) : selFrom;
  const cut = cutText(ctx, node, line, at, selFrom === selTo ? at : selTo);
  if (!cut) return notApplicable;
  // a task's new sibling is a task too, unchecked
  const box = reTaskBox.test(doc.headLines(node)[0]!.trimStart()) ? '[ ] ' : '';
  if (cut.atStart && selFrom === selTo && normText(cut.after) !== '') return insertBefore(ctx, node, at, box);

  // the new node is the first child when the node has items below it, else the next sibling
  const firstChild = node.children[0];
  let prefix: string;
  let marker: string;
  if (firstChild?.kind === 'item') {
    prefix = ctx.encoder.siblingPrefix(firstChild);
    marker = ctx.encoder.markerText(firstChild, false);
  } else if (firstChild) {
    // the first child is a paragraph or a block: the new item goes before it, written where it starts
    prefix = ctx.encoder.childIndent(node, firstChild);
    marker = ctx.encoder.markerText(node, false).replace(/^\d+/, '1');
  } else {
    prefix = ctx.encoder.siblingPrefix(node);
    marker = ctx.encoder.markerText(node, true);
  }
  const rest = ctx.encoder.startOfNode(cut.rest, cut.after.slice(1));
  // in a loose list (blank lines between its items), the new item is set off as the others are
  const list = firstChild?.kind === 'item' ? firstChild.block.parent : firstChild ? null : node.block.parent;
  const gap = list && list.tight === false ? eol : '';
  let insert = eol + gap + prefix + marker + ' ' + box;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (box) {
    // after a task's checkbox the rest doesn't start the line's text: nothing to escape
    first = box + first;
  } else if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  }
  const changes = [{ from: cut.from, to: cut.to, insert }];
  if (!box && rest.marker) {
    // a list marker in the rest stays text, as outliners keep it: escaped, a bullet before itself,
    // an ordered marker before its `.` or `)` (a backslash before a digit escapes nothing)
    const digits = ctx.encoder.escape(cut.rest, 'start').at!;
    if (digits) changes.push({ from: cut.to + digits, to: cut.to + digits, insert: '\\' });
    else changes[0]!.insert += '\\';
    first = first.slice(0, digits) + '\\' + first.slice(digits);
  }
  const split = ctx.plan.setText(node, normText(cut.before));
  const fresh = OutlinePlan.created('item', normText([first, ...cut.after.slice(1)]));
  const expected = firstChild ? split.append(node, 'first', [fresh]) : split.place('after', node, [fresh]);
  return ctx.caret(changes, caret, expected);
}

/**
 * Enter on an empty paragraph ending a quote: it leaves the quote, to follow it (Obsidian), the quoted
 * blank line above it going too. A quote it was all of goes, the paragraph in its place.
 */
function leaveQuoteEmpty(ctx: CommandContext, node: OutlineNode): Outcome {
  const { doc } = ctx;
  const quote = node.parent!;
  const line = doc.lines[node.startLine]!;
  const eol = ctx.ending(line);
  const quoteLine = doc.lines[quote.startLine]!;
  const outer = ctx.encoder.continuation(quoteLine.prefix.slice(0, quoteLine.prefix.findIndex((p) => p.block === quote.block)));
  const empty = OutlinePlan.created('paragraph', '');
  const next = doc.lines[node.startLine + 1];
  const after = next && !next.blank ? eol + outer.trimEnd() : '';
  let from: number;
  let insert: string;
  let expected: OutlinePlan;
  if (quote.children.length === 1) {
    from = quoteLine.from;
    insert = outer;
    expected = ctx.plan.place('instead', quote, [empty]);
  } else {
    let above = node.startLine - 1;
    while (above > quote.startLine && blankInQuote(ctx, doc.lines[above]!)) above--;
    from = doc.lines[above]!.to;
    insert = eol + outer.trimEnd() + eol + outer;
    expected = ctx.plan.remove([node]).place('after', quote, [empty]);
  }
  const caret = from + insert.length;
  return ctx.caret([{ from, to: line.to, insert: insert + after }], caret, expected, { placeholders: [caret] });
}

/**
 * Enter on an empty line at the end of an item's content, the caret at its content column (Enter
 * after a closing fence left it there, Fence7): the line becomes the item's next sibling, as Enter on
 * an empty nested item outdents it. Null where that doesn't apply.
 */
function leaveItem(ctx: CommandContext, pos: number): Outcome | null {
  const { doc } = ctx;
  const line = doc.lineAt(pos);
  const text = doc.text;
  if (pos !== line.to || !/^[ \t]+$/.test(text.slice(line.from, line.to))) return null;
  const col = advanceColumns(text, line.from, pos, 0);
  // the node above, and the item it is the content of that the caret's column is in
  let lineNo = line.index - 1;
  while (lineNo >= 0 && doc.lines[lineNo]!.blank) lineNo--;
  if (lineNo < 0) return null;
  let item: OutlineNode | null = doc.nodeAt(doc.lines[lineNo]!.to) ?? null;
  while (item && !(item.kind === 'item' && item.block.contentColumn === col)) item = item.parent;
  if (!item) return null;
  // nothing of the item comes below the line
  for (let k = line.index + 1; k <= item.endLine; k++) if (!doc.lines[k]!.blank) return null;
  const insert = ctx.encoder.siblingPrefix(item) + ctx.encoder.markerText(item, true) + ' ';
  const caret = line.from + insert.length;
  const expected = ctx.plan.place('after', item, [OutlinePlan.created('item', '')]);
  return ctx.caret([{ from: line.from, to: line.to, insert }], caret, expected);
}

/**
 * Enter at the start of an item: a new empty item above it, the caret going into it (as Workflowy,
 * Logseq, Roam and Dynalist do). Right after its parent's text the empty item would be a setext
 * underline, so a placeholder holds it.
 */
export function insertBefore(ctx: CommandContext, node: OutlineNode, pos: number, box: string): Outcome {
  const { doc } = ctx;
  // a new task's checkbox is text the line can hold, so only a bare empty item needs the placeholder
  const held = !box && followsParentText(ctx, node);
  const markerLine = doc.lines[node.startLine]!;
  const line = ctx.encoder.siblingPrefix(node) + ctx.encoder.markerText(node, false) + ' ' + box;
  const insert = line + ctx.ending(markerLine);
  const changes = [{ from: markerLine.from, to: markerLine.from, insert }];
  const caret = markerLine.from + line.length;
  const expected = ctx.plan.place('before', node, [OutlinePlan.created('item', box.trim())]);
  const identity = new Map([[doc.markerFrom(node.block) + insert.length, node.id]]);
  return ctx.caret(changes, caret, expected, { identity, ...(held ? { placeholders: [caret] } : {}) });
}

/** Enter at the start of a paragraph or heading: a blank line above it, the text staying put. */
function blankLineAbove(ctx: CommandContext, node: OutlineNode, pos: number): Outcome {
  const { doc } = ctx;
  const first = doc.lines[node.startLine]!;
  const eol = ctx.ending(first);
  return ctx.caret([{ from: first.from, to: first.from, insert: eol }], pos + eol.length, ctx.plan);
}

/** Enter in a paragraph: two paragraphs, a blank line between them. */
function splitParagraph(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  const cut = cutText(ctx, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  if (normText(doc.headLines(node)) === '') return reject('not-expressible', 'an empty paragraph has nothing to split');
  if (cut.atStart && selFrom === selTo) return blankLineAbove(ctx, node, selFrom);
  const firstLine = doc.lines[node.head!.startLine]!;
  const prefix = doc.text.slice(firstLine.from, firstLine.contentFrom);
  const eol = ctx.ending(line);
  const rest = ctx.encoder.startOfNode(cut.rest, cut.after.slice(1));
  // the blank line between the halves keeps the quotes' `>`
  let insert = eol + prefix.trimEnd() + eol + prefix;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    caret += rest.marker;
    first = first.slice(rest.marker);
  }
  const fresh = OutlinePlan.created(rest.marker ? 'item' : 'paragraph', normText([first, ...cut.after.slice(1)]));
  // a second half that is a paragraph is right above the paragraph's list now, and takes it; one
  // that is an item opens that list
  const expected = rest.marker
    ? ctx.plan.update(node, (n) => ({ ...n, text: normText(cut.before), children: [fresh, ...n.children] }))
    : ctx.plan.update(node, (n) => ({ ...n, text: normText(cut.before), children: [] })).place('after', node, [{ ...fresh, children: node.children }]);
  return ctx.caret([{ from: cut.from, to: cut.to, insert }], caret, expected);
}

/** Enter in a heading: the rest of the title becomes the first paragraph of its section. */
function splitHeading(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (node.head!.setext) return splitSetext(ctx, node, line, selFrom, selTo);
  const range = doc.headRange(node)!;
  const text = doc.text;
  // before the title's text (in its `#`s) Enter opens a line above; at the text start it splits, as
  // anywhere in the title, leaving an empty heading above the text (as Obsidian does)
  if (selFrom < range.from && selFrom === selTo) return blankLineAbove(ctx, node, selFrom);
  if (selFrom < range.from) return notApplicable;
  let from = selFrom;
  from = skipSpaces(text, from, range.from, -1);
  let to = selTo;
  to = skipSpaces(text, to, line.to, 1);
  const restText = text.slice(to, line.to);
  const rest = ctx.encoder.startOfNode(restText, []);
  // the rest becomes the section's first paragraph (an item, if it starts with a list marker); the
  // encoder sets it off from what follows where it would run into it
  const marker = rest.marker && !rest.escape ? restText.slice(0, rest.marker).trim() : null;
  const first = rest.escape ? '\\' + restText : marker ? restText.slice(rest.marker) : restText;
  const fresh: OutlinePlanNode = { id: null, kind: marker ? 'item' : 'paragraph', text: normText([first]), lines: [first], ...(marker ? { marker } : {}), children: [] };
  const own = doc.contentOf(node).lines![0]!;
  const title = own.slice(0, from - (line.to - own.length));
  const expected = ctx.plan.update(node, (n) => ({
    ...n,
    text: normText([text.slice(range.from, from)]),
    lines: [title],
    children: [fresh, ...n.children],
  }));
  // a paragraph's text right below (an item's included) stays apart from the new one
  const below = doc.lines[line.index + 1];
  const apart = !!below && !below.blank && below.leaf?.type === 'paragraph';
  return ctx.encode(expected, apart ? { separate: 'after' } : {}, (writtenOutline) => {
    const caret = writtenOutline.at(fresh, 0, rest.escape ? 1 : 0);
    return { anchor: caret, head: caret };
  });
}

/**
 * Enter in a setext heading's title, as in an ATX one: the rest of the title becomes the section's
 * first paragraph, below the underline. In the underline, which is markup rather than text, Enter
 * acts at the end of the title.
 */
function splitSetext(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  const head = node.head!;
  const underline = doc.lines[head.endLine]!;
  const lastTitle = doc.lines[head.endLine - 1]!;
  const text = doc.text;
  if (line.index === head.endLine) {
    if (selFrom !== selTo) return notApplicable;
    line = lastTitle;
    selFrom = selTo = lastTitle.to;
  }
  const range = doc.headRange(node)!;
  if (selFrom === selTo && text.slice(range.from, Math.max(selFrom, range.from)).trim() === '') return blankLineAbove(ctx, node, selFrom);
  if (selFrom < line.contentFrom) return notApplicable;
  let from = selFrom;
  from = skipSpaces(text, from, line.contentFrom, -1);
  let to = selTo;
  to = skipSpaces(text, to, line.to, 1);
  const lines = doc.headLines(node);
  const i = line.index - head.startLine;
  const before = [...lines.slice(0, i), lines[i]!.slice(0, from - line.contentFrom)];
  const after = [lines[i]!.slice(to - line.contentFrom), ...lines.slice(i + 1)];
  const eol = ctx.ending(underline);
  const prefix = text.slice(underline.from, underline.contentFrom);
  // the rest of the title, with any title lines below it, moves below the underline
  let moved = text.slice(to, lastTitle.to);
  const rest = ctx.encoder.startOfNode(after[0]!, after.slice(1));
  let lead = eol + prefix;
  let first = after[0]!;
  if (rest.escape) {
    lead += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    first = first.slice(rest.marker);
  }
  // a paragraph right below the underline stays a paragraph of its own
  const next = doc.lines[head.endLine + 1];
  if (next && !next.blank && next.leaf?.type === 'paragraph') moved += eol;
  const changes: ChangeSpec[] = [
    { from, to: lastTitle.to, insert: '' },
    { from: underline.to, to: underline.to, insert: lead + moved },
  ];
  const caret = underline.to - (lastTitle.to - from) + lead.length + (rest.marker && !rest.escape ? rest.marker : 0);
  const fresh = OutlinePlan.created(rest.marker ? 'item' : 'paragraph', normText([first, ...after.slice(1)]));
  const expected = ctx.plan.setText(node, normText(before)).append(node, 'first', [fresh]);
  return ctx.caret(changes, caret, expected);
}

/**
 * Shift-Enter: breaks the node's text at the caret, continuing on a new line at the node's
 * content column, so the node stays one node. Text after the caret that would start a block
 * there (or underline the paragraph into a heading) is escaped. An empty new line is a
 * placeholder: a blank line would end the paragraph.
 */
export function lineBreak(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  let pos = ctx.from;
  let selTo = ctx.to;
  const collapsed = pos === selTo;
  // a selection inside one line is replaced by the break; across lines it is the host's
  if (doc.lineAt(selTo).index !== doc.lineAt(pos).index) return notApplicable;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  // in code a line break is a new line, as Enter makes it
  const codeLine = doc.lineAt(pos);
  if (codeLine.leaf?.type === 'code_block' && codeLine.leaf.fenced) return fenceNewline(ctx, node, codeLine, pos, selTo);
  if (node.kind === 'atom') return notApplicable;
  if (node.kind === 'heading') return reject('not-expressible', 'a heading is a single line');
  if (node.head?.type === 'callout_title') return reject('not-expressible', 'a callout title is a single line');
  if (!node.head || node.head.type !== 'paragraph') return notApplicable;
  const line = doc.lineAt(pos);
  const lines = doc.headLines(node);
  const i = line.index - node.head.startLine;
  // in an item's marker, the break would split the marker: it acts at the text start
  if (collapsed && i === 0 && node.kind === 'item') pos = selTo = Math.max(pos, doc.headRange(node)!.from);
  if (i < 0 || i >= lines.length || pos < line.contentFrom) return notApplicable;
  if (normText(lines) === '') return reject('not-expressible', 'an empty node has no line to break');
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = ctx.ending(line);
  if (lines[i]!.slice(0, pos - line.contentFrom).trim() === '') {
    if (!collapsed) return notApplicable;
    if (i === 0) return reject('not-expressible', 'a line break here would leave an empty line inside the text');
    // at the start of a continuation line: a blank line above it, the caret staying with the text
    // (as Logseq does). A blank line ends a paragraph, so the line and the rest become a paragraph
    // of their own: the item's first child, or the paragraph after this one.
    if (lines[i]!.trim() !== '') {
      const above = doc.lines[line.index - 1]!;
      const blank = eol + prefix.trimEnd();
      // the line starts a paragraph now: it takes the node's full prefix (a lazy line had none), loses
      // its leading spaces (four would make it code), and is escaped where it would start a block
      let textFrom = line.contentFrom;
      textFrom = skipSpaces(text, textFrom, line.to, 1);
      let firstLine = text.slice(textFrom, line.to);
      const changes: ChangeSpec[] = [{ from: above.to, to: above.to, insert: blank }, { from: line.from, to: textFrom, insert: prefix }];
      const escaped = ctx.encoder.escape(firstLine, 'start');
      if (escaped.at) changes.push({ from: textFrom + escaped.at, to: textFrom + escaped.at, insert: '\\' });
      else if (escaped.at === 0) changes[1] = { from: line.from, to: textFrom, insert: prefix + '\\' };
      firstLine = escaped.text;
      // a paragraph's list follows the new paragraph now, so it is the new one's
      const owns = node.kind === 'paragraph';
      const kept = ctx.plan.update(node, (n) => ({ ...n, text: normText(lines.slice(0, i)), children: owns ? [] : n.children }));
      const fresh: OutlinePlanNode = { ...OutlinePlan.created('paragraph', normText([firstLine, ...lines.slice(i + 1)])), children: owns ? node.children : [] };
      const expected = node.kind === 'item' ? kept.append(node, 'first', [fresh]) : kept.place('after', node, [fresh]);
      const caret = line.from + blank.length + prefix.length;
      return ctx.caret(changes, caret, expected);
    }
    // A second Shift-Enter, on the empty line the first one made: a paragraph break. The line
    // becomes a blank line and the caret moves to a new empty paragraph below, still inside an
    // item (as its first child) or after the paragraph.
    const changes: ChangeSpec[] = [{ from: line.from, to: line.to, insert: eol + prefix }];
    const caret = line.from + eol.length + prefix.length;
    const kept = ctx.plan.setText(node, normText(lines.slice(0, i)));
    const fresh = OutlinePlan.created('paragraph', normText(['', ...lines.slice(i + 1)]));
    const expected = node.kind === 'item' ? kept.append(node, 'first', [fresh]) : kept.place('after', node, [fresh]);
    return ctx.caret(changes, caret, expected);
  }

  let from = pos;
  from = skipSpaces(text, from, line.contentFrom, -1);
  let to = selTo;
  to = skipSpaces(text, to, line.to, 1);
  const changes: ChangeSpec[] = [{ from, to, insert: eol + prefix }];

  let rest = text.slice(to, line.to);
  // a line starting like this would interrupt the paragraph or turn it into a setext heading:
  // escape its first character, or an ordered marker's delimiter (`1\.`)
  const escaped = ctx.encoder.escape(rest, 'continuation');
  if (escaped.at) changes.push({ from: to + escaped.at, to: to + escaped.at, insert: '\\' });
  else if (escaped.at === 0) changes[0] = { from, to, insert: eol + prefix + '\\' };
  rest = escaped.text;
  const caret = from + eol.length + prefix.length;

  const offset = pos - line.contentFrom;
  const expected = ctx.plan.setText(node, normText([...lines.slice(0, i), lines[i]!.slice(0, offset), rest, ...lines.slice(i + 1)]));
  return ctx.caret(changes, caret, expected);
}
