// Enter and Shift-Enter: splitting a node, and breaking a line inside one.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { Block, LineInfo } from '../parser/index.ts';
import { advanceColumns, lineSpan, skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, Operands, blankInQuote, followsParentText, isEmptyItem, isEmptyWithChildren, normText, paragraphPrefix, reTaskBox, referenceEscape } from './context.ts';
import { notApplicable, reject, type Outcome, type CommandPlan } from './plan.ts';
import { outdent } from './structure.ts';
import { enterAfterFence, fenceNewline, isPayloadLine, payloadNewline } from './code.ts';

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
 * The changes writing a split: `insert` in the cut's place, and the rest of the line escaped where,
 * at the start of a new node, it would start a block or read as a list marker (a typed `- ` stays
 * text, as outliners keep it): a backslash at its start, or after an ordered marker's digits (a
 * backslash before a digit escapes nothing). With the new node's first line as it then reads.
 */
function writeRest(ctx: CommandContext, cut: Cut, insert: string): { changes: ChangeSpec[]; first: string } {
  const first = cut.after[0]!.trimStart();
  const at = ctx.encoder.escape(cut.rest, 'start', cut.after.slice(1)).at;
  if (at === null) return { changes: [{ from: cut.from, to: cut.to, insert }], first };
  const changes: ChangeSpec[] =
    at === 0 ? [{ from: cut.from, to: cut.to, insert: insert + '\\' }] : [{ from: cut.from, to: cut.to, insert }, { from: cut.to + at, to: cut.to + at, insert: '\\' }];
  return { changes, first: first.slice(0, at) + '\\' + first.slice(at) };
}

/**
 * Whether new text written right above `line` would run into it: a paragraph's line there continues
 * the new text, unless it starts a block that interrupts a paragraph (a list item does).
 */
function runsInto(ctx: CommandContext, above: LineInfo, line: LineInfo | undefined): boolean {
  const { doc } = ctx;
  // a paragraph's line, or a setext title's (its text as a paragraph's, until its underline)
  const leaf = line?.leaf;
  if (!line || line.blank || blankInQuote(ctx, line) || !(leaf?.type === 'paragraph' || (leaf?.type === 'heading' && leaf.setext && line.index < leaf.endLine))) return false;
  // the line's text after the containers it shares with the line above (a quote's `>` it has of its own
  // interrupts a paragraph)
  const text = doc.text.slice(line.from + (above.contentFrom - above.from), line.to);
  return !ctx.encoder.interruptsParagraph(text.trimStart());
}

/** In a loose list (blank lines between its items), the blank line that sets a new item off, as the others are; else ''. */
function looseGap(ctx: CommandContext, item: OutlineNode, list: Block | null | undefined): string {
  if (!list || list.tight !== false) return '';
  const line = ctx.doc.lines[item.startLine]!;
  const outer = ctx.encoder.continuation(line.prefix.slice(0, line.prefix.findIndex((p) => p.block === item.block)));
  return outer.trimEnd() + ctx.ending(line);
}

/**
 * Enter in a callout's title where the flavor reads the title as a line of its own (Obsidian): the
 * rest of the title becomes the callout's first paragraph, set off by a quoted blank line from body
 * text it would run into, as the rest of a split heading is from the text below. In the `[!type]`
 * marker a line break would unmake the callout.
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
  // the rest starts a paragraph: escaped where it would start a block or a list instead
  if (rest !== '') rest = ctx.encoder.escape(rest, 'start').text;
  const eol = ctx.ending(line);
  const cont = ctx.encoder.continuation(line.prefix);
  const insert = eol + cont;
  const caret = from + insert.length;
  // an empty rest is a paragraph too, held by a placeholder until typed into, and set off as well
  const apart = runsInto(ctx, line, doc.lines[line.index + 1]);
  const kept = ctx.plan.setText(node, normText([text.slice(line.contentFrom, from)]));
  const expected = kept.append(node, 'first', [OutlinePlan.created('paragraph', normText([rest]))]);
  return ctx.caret([{ from, to: line.to, insert: insert + rest + (apart ? eol + cont.trimEnd() : '') }], caret, expected, rest === '' ? { placeholders: [caret] } : {});
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
  if (isPayloadLine(line)) return payloadNewline(ctx, node, line, selFrom, selTo);
  if (line.leaf?.type === 'table') return tableEnter(ctx, node, line, selFrom, selTo);
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
    // Enter on an empty item: first or in the middle of its list, it gets a new empty sibling, the
    // caret going into it (Workflowy, Logseq), at any depth; with `enterOnEmptyItem: outdent` (Roam),
    // and as the last item of its list, it outdents. A nested one outdents as Shift-Tab does; a
    // top-level one, or one in a quote, leaves the list, becoming an empty paragraph held by a
    // placeholder, set off from the items around it by blank lines; in a quote, it stays in the quote
    // (Obsidian).
    const siblings = node.parent!.children;
    const following = siblings[siblings.indexOf(node) + 1];
    const last = !(following?.kind === 'item' && following.block.parent === node.block.parent);
    if (node.parent!.kind === 'item' || (!last && doc.config.enterOnEmptyItem === 'sibling')) {
      if (node.parent!.kind === 'item' && (last || doc.config.enterOnEmptyItem === 'outdent')) return outdent(ctx.at(pos), new Operands([node]));
      // an empty task's new sibling is a task too, as after any task
      const box = reTaskBox.test(doc.headLines(node)[0]?.trimStart() ?? '') ? '[ ] ' : '';
      // right after the parent's text a bare empty item exists only under the caret: the new one goes
      // above (an empty task's checkbox is text the line holds)
      if (!box && followsParentText(ctx, node)) return insertBefore(ctx, node, pos, '');
      const markerLine = doc.lines[node.startLine]!;
      // in a loose list (blank lines between its items), the new item is set off as the others are
      const insert = eol + looseGap(ctx, node, node.block.parent) + ctx.encoder.siblingPrefix(node) + ctx.encoder.markerText(node, true) + ' ' + box;
      const caret = markerLine.to + insert.length;
      const expected = ctx.plan.place('after', node, [OutlinePlan.created('item', box.trim())]);
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
  if (cut.atStart && selFrom === selTo && normText(cut.after) !== '') return insertBefore(ctx, node, at, box, doc.config.enterAtTextStart === 'stay');

  // split mid-text, an item with children hands them to the rest, the next sibling
  // (`enterMidItem: sibling`); else the new node is the first child when the item has children
  // (as at its end), else the next sibling
  const handsOver = doc.config.enterMidItem === 'sibling' && node.children.length > 0 && normText(cut.after) !== '';
  const firstChild = handsOver ? undefined : node.children[0];
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
  // in a loose list (blank lines between its items), the new item is set off as the others are
  const list = firstChild?.kind === 'item' ? firstChild.block.parent : firstChild ? null : node.block.parent;
  const gap = looseGap(ctx, firstChild?.kind === 'item' ? firstChild : node, list);
  const insert = eol + gap + prefix + marker + ' ' + box;
  // the first half, ended here, stays text where it would read as a link reference definition
  const ref = referenceEscape(ctx, node, cut.before);
  const before = ref?.lines ?? cut.before;
  const caret = cut.from + insert.length + (ref ? 1 : 0);
  // after a task's checkbox the rest doesn't start the line's text: nothing to escape
  const { changes, first } = box ? { changes: [{ from: cut.from, to: cut.to, insert }], first: box + cut.after[0]!.trimStart() } : writeRest(ctx, cut, insert);
  if (ref) changes.push(ref.change);
  const fresh = OutlinePlan.created('item', normText([first, ...cut.after.slice(1)]));
  if (handsOver) {
    const expected = ctx.plan.update(node, (n) => ({ ...n, text: normText(before), children: [] })).place('after', node, [{ ...fresh, children: node.children }]);
    // the children's lines stay where they are, under the new item, when its text starts no further
    // right than the item's did; a wider marker (`9.` to `10.`) moves past them, and the encoder
    // rewrites them at the new content column
    if (marker.length + 1 <= node.block.contentColumn! - node.block.markerColumn!) return ctx.caret(changes, caret, expected);
    const written: OutlinePlanNode = { ...fresh, lines: [first, ...cut.after.slice(1)], children: node.children };
    const rewritten = ctx.plan.update(node, (n) => ({ ...n, text: normText(before), lines: before.map((l) => l.trimEnd()), children: [] })).place('after', node, [written]);
    return ctx.encode(rewritten, {}, (writtenOutline) => {
      const at = writtenOutline.at(written, 0, box.length);
      return { anchor: at, head: at };
    });
  }
  const split = ctx.plan.setText(node, normText(before));
  const expected = firstChild ? split.append(node, 'first', [fresh]) : split.place('after', node, [fresh]);
  return ctx.caret(changes, caret, expected);
}

/**
 * Enter in a table: at the end of its last row, a paragraph after it, held by a placeholder and set
 * off by a blank line (in GFM a line right after a table is another row of it); elsewhere in a row,
 * refused: a row is a line, and a break in it would make two.
 */
function tableEnter(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (selFrom < line.contentFrom) return notApplicable;
  if (selFrom !== selTo || line.index !== line.leaf!.endLine || selFrom !== line.to) return reject('not-expressible', 'a table row is a single line');
  const eol = ctx.ending(line);
  const prefix = ctx.encoder.continuation(line.prefix);
  const open = eol + prefix.trimEnd() + eol + prefix;
  // text right below would continue the new paragraph: a blank line keeps it apart
  const next = doc.lines[line.index + 1];
  const same = !!next && next.prefix.length === line.prefix.length && next.prefix.every((p, k) => p.block === line.prefix[k]!.block);
  const apart = same && runsInto(ctx, line, next) ? eol + prefix.trimEnd() : '';
  const caret = line.to + open.length;
  const expected = ctx.plan.place('after', node, [OutlinePlan.created('paragraph', '')]);
  return ctx.caret([{ from: line.to, to: line.to, insert: open + apart }], caret, expected, { placeholders: [caret] });
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
 * Logseq, Roam and Dynalist do), or with `stay` (`enterAtTextStart: stay`, as Obsidian) staying at
 * `pos`, with the text. Right after its parent's text the empty item would be a setext underline, so
 * a placeholder holds it while the caret is in it; away from the caret, a blank line above it does,
 * as when the caret leaves a placeholder.
 */
export function insertBefore(ctx: CommandContext, node: OutlineNode, pos: number, box: string, stay = false): Outcome {
  const { doc } = ctx;
  // a new task's checkbox is text the line can hold, so only a bare empty item needs the placeholder
  const held = !box && followsParentText(ctx, node);
  const markerLine = doc.lines[node.startLine]!;
  const eol = ctx.ending(markerLine);
  const line = ctx.encoder.siblingPrefix(node) + ctx.encoder.markerText(node, false) + ' ' + box;
  const outer = ctx.encoder.continuation(markerLine.prefix.slice(0, markerLine.prefix.findIndex((p) => p.block === node.block)));
  const blank = held && stay ? outer.trimEnd() + eol : '';
  const insert = blank + line + eol;
  const changes = [{ from: markerLine.from, to: markerLine.from, insert }];
  const caret = stay ? pos + insert.length : markerLine.from + blank.length + line.length;
  const expected = ctx.plan.place('before', node, [OutlinePlan.created('item', box.trim())]);
  const identity = new Map([[doc.markerFrom(node.block) + insert.length, node.id]]);
  return ctx.caret(changes, caret, expected, { identity, ...(held && !stay ? { placeholders: [caret] } : {}) });
}

/**
 * Enter at the start of a paragraph or heading: a blank line above it, the text staying put. The
 * blank line keeps the markers of the containers that go on past it (a quote's `>`); a container
 * starting on the line gets the blank line above it.
 */
/**
 * Enter at the start of a paragraph's or a heading's text (`enterAtTextStart: into`): an empty
 * paragraph above it, held by a placeholder, the caret in it, a blank line between them. Where a quote
 * or an item starts on the node's line, the line keeps its markers and holds the empty paragraph;
 * else, after a line of text, a blank line sets the empty paragraph off from it too. After a
 * heading's section the text puts it at the section's end. Where Markdown can't hold it, a blank
 * line above the text, as with `stay`.
 */
function paragraphAbove(ctx: CommandContext, node: OutlineNode): Outcome {
  const { doc } = ctx;
  const first = doc.lines[node.startLine]!;
  const eol = ctx.ending(first);
  const continuation = ctx.encoder.continuation(first.prefix);
  const blank = continuation.trimEnd();
  const fresh = OutlinePlan.created('paragraph', '');
  // after a heading's section, its end: inside the last sub-heading of it
  const siblings = node.parent!.children;
  let section = siblings[siblings.indexOf(node) - 1];
  if (section?.kind !== 'heading') section = undefined;
  while (section && section.children[section.children.length - 1]?.kind === 'heading') section = section.children[section.children.length - 1];
  const expected = section ? ctx.plan.append(section, 'last', [fresh]) : ctx.plan.place('before', node, [fresh]);
  const stay = (): CommandPlan | null => {
    const outcome = blankLineAbove(ctx, node, doc.headRange(node)!.from);
    return 'changes' in outcome ? outcome : null;
  };
  if (first.prefix.some((p) => p.block.startLine === first.index)) {
    const plan = ctx.caret([{ from: first.contentFrom, to: first.contentFrom, insert: eol + blank + eol + continuation }], first.contentFrom, expected);
    return 'changes' in plan ? { ...plan, fallback: stay } : plan;
  }
  const prefix = doc.text.slice(first.from, first.contentFrom);
  const above = doc.lines[first.index - 1];
  const apart = above && !blankInQuote(ctx, above) ? blank + eol : '';
  const plan = ctx.caret([{ from: first.from, to: first.from, insert: apart + prefix + eol + blank + eol }], first.from + apart.length + prefix.length, expected);
  return 'changes' in plan ? { ...plan, fallback: stay } : plan;
}

function blankLineAbove(ctx: CommandContext, node: OutlineNode, pos: number): Outcome {
  const { doc } = ctx;
  const first = doc.lines[node.startLine]!;
  const eol = ctx.ending(first);
  const end = first.prefix.findIndex((p) => p.block.startLine === first.index);
  const insert = ctx.encoder.continuation(end < 0 ? first.prefix : first.prefix.slice(0, end)).trimEnd() + eol;
  return ctx.caret([{ from: first.from, to: first.from, insert }], pos + insert.length, ctx.plan);
}

/** Enter in a paragraph: two paragraphs, a blank line between them. */
function splitParagraph(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  const cut = cutText(ctx, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  if (normText(doc.headLines(node)) === '') return reject('not-expressible', 'an empty paragraph has nothing to split');
  if (cut.atStart && selFrom === selTo) return doc.config.enterAtTextStart === 'stay' ? blankLineAbove(ctx, node, selFrom) : paragraphAbove(ctx, node);
  const prefix = paragraphPrefix(ctx, doc.lines[node.head!.startLine]!);
  const eol = ctx.ending(line);
  // the blank line between the halves keeps the quotes' `>`
  const insert = eol + prefix.trimEnd() + eol + prefix;
  // the first half, ended here, stays text where it would read as a link reference definition
  const ref = referenceEscape(ctx, node, cut.before);
  const caret = cut.from + insert.length + (ref ? 1 : 0);
  // the second half is a paragraph, a list marker in it staying text (as in an item), and it is right
  // above the paragraph's list now, so it takes it
  const { changes, first } = writeRest(ctx, cut, insert);
  if (ref) changes.push(ref.change);
  const fresh = OutlinePlan.created('paragraph', normText([first, ...cut.after.slice(1)]));
  const expected = ctx.plan.update(node, (n) => ({ ...n, text: normText(ref?.lines ?? cut.before), children: [] })).place('after', node, [{ ...fresh, children: node.children }]);
  return ctx.caret(changes, caret, expected);
}

/** Enter in a heading: the rest of the title becomes the first paragraph of its section. */
function splitHeading(ctx: CommandContext, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const { doc } = ctx;
  if (node.head!.setext) return splitSetext(ctx, node, line, selFrom, selTo);
  const range = doc.headRange(node)!;
  const text = doc.text;
  // before the title's text (in its `#`s) Enter opens a line above; at the text start, an empty
  // paragraph above (`into`), or a split, as anywhere in the title, leaving an empty heading above
  // the text (`stay`, as Obsidian does)
  if (selFrom < range.from && selFrom === selTo) return blankLineAbove(ctx, node, selFrom);
  if (selFrom === range.from && selFrom === selTo && doc.config.enterAtTextStart === 'into') return paragraphAbove(ctx, node);
  if (selFrom < range.from) return notApplicable;
  let from = selFrom;
  from = skipSpaces(text, from, range.from, -1);
  let to = selTo;
  to = skipSpaces(text, to, line.to, 1);
  // the rest becomes the section's first paragraph, a list marker in it staying text (as in an item);
  // the encoder sets it off from what follows where it would run into it
  const first = ctx.encoder.escape(text.slice(to, line.to), 'start').text;
  const fresh: OutlinePlanNode = { id: null, kind: 'paragraph', text: normText([first]), lines: [first], children: [] };
  const own = doc.contentOf(node).lines![0]!;
  const title = own.slice(0, from - (line.to - own.length));
  const expected = ctx.plan.update(node, (n) => ({
    ...n,
    text: normText([text.slice(range.from, from)]),
    lines: [title],
    children: [fresh, ...n.children],
  }));
  // text right below that would continue the new paragraph stays apart from it; a list there needs no
  // blank line, a list item interrupting a paragraph (the caret before an escape, as everywhere)
  const apart = runsInto(ctx, line, doc.lines[line.index + 1]);
  return ctx.encode(expected, apart ? { separate: 'after' } : {}, (writtenOutline) => {
    const caret = writtenOutline.at(fresh, 0, 0);
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
  // at the title's start, an empty paragraph above (`into`), or a blank line, the split's empty half (`stay`)
  if (selFrom === selTo && text.slice(range.from, Math.max(selFrom, range.from)).trim() === '')
    return selFrom >= range.from && doc.config.enterAtTextStart === 'into' ? paragraphAbove(ctx, node) : blankLineAbove(ctx, node, selFrom);
  // split as a paragraph is: at a line break of the title, the break goes with neither half
  const cut = cutText(ctx, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  const { from, to, before } = cut;
  const after = [cut.after[0]!.trimStart(), ...cut.after.slice(1)];
  const eol = ctx.ending(underline);
  const prefix = text.slice(underline.from, underline.contentFrom);
  // the rest of the title, with any title lines below it, moves below the underline
  let moved = text.slice(to, lastTitle.to);
  const lead = eol + prefix;
  // a list marker in the rest stays text, as in an item: escaped where it would start a block
  const at = ctx.encoder.escape(after[0]!, 'start', after.slice(1)).at;
  let first = after[0]!;
  if (at !== null) {
    moved = moved.slice(0, at) + '\\' + moved.slice(at);
    first = first.slice(0, at) + '\\' + first.slice(at);
  }
  // text right below the underline that would continue the new paragraph stays a paragraph of its own
  if (runsInto(ctx, underline, doc.lines[head.endLine + 1])) moved += eol;
  const changes: ChangeSpec[] = [
    { from, to: lastTitle.to, insert: '' },
    { from: underline.to, to: underline.to, insert: lead + moved },
  ];
  const caret = underline.to - (lastTitle.to - from) + lead.length;
  const fresh = OutlinePlan.created('paragraph', normText([first, ...after.slice(1)]));
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
  if (isPayloadLine(codeLine)) return payloadNewline(ctx, node, codeLine, pos, selTo);
  if (codeLine.leaf?.type === 'table' && pos >= codeLine.contentFrom) return reject('not-expressible', 'a table row is a single line');
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
  // in a callout's `[!type]` (its title a paragraph, outside the Obsidian flavor) a break would split it
  if (node.kind === 'quote' && i === 0 && pos < line.contentFrom + (/^[ \t]*\[![^\]]*\][+-]?/.exec(doc.text.slice(line.contentFrom, line.to))?.[0].length ?? 0)) {
    return reject('not-expressible', "a line break would split the callout's type");
  }
  if (normText(lines) === '') return reject('not-expressible', 'an empty node has no line to break');
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : paragraphPrefix(ctx, doc.lines[node.head.startLine]!);
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
      const escaped = ctx.encoder.escape(firstLine, 'start', lines.slice(i + 1).map((l) => l.trimStart()));
      if (escaped.at) changes.push({ from: textFrom + escaped.at, to: textFrom + escaped.at, insert: '\\' });
      else if (escaped.at === 0) changes[1] = { from: line.from, to: textFrom, insert: prefix + '\\' };
      firstLine = escaped.text;
      // a paragraph's list follows the new paragraph now, so it is the new one's
      const owns = node.kind === 'paragraph';
      const kept = ctx.plan.update(node, (n) => ({ ...n, text: normText(lines.slice(0, i)), children: owns ? [] : n.children }));
      const fresh: OutlinePlanNode = { ...OutlinePlan.created('paragraph', normText([firstLine, ...lines.slice(i + 1)])), children: owns ? node.children : [] };
      // in an item, or a quote whose text this is (a callout's title), the new paragraph is its first child
      const expected = node.kind === 'item' || node.kind === 'quote' ? kept.append(node, 'first', [fresh]) : kept.place('after', node, [fresh]);
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
    const expected = node.kind === 'item' || node.kind === 'quote' ? kept.append(node, 'first', [fresh]) : kept.place('after', node, [fresh]);
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
  const offset = pos - line.contentFrom;
  // the text, broken here, stays text where it would read as a link reference definition
  const broken = [...lines.slice(0, i), lines[i]!.slice(0, offset), rest, ...lines.slice(i + 1)];
  const ref = referenceEscape(ctx, node, broken);
  if (ref) changes.push(ref.change);
  const caret = from + eol.length + prefix.length + (ref && ref.change.from <= from ? 1 : 0);
  const expected = ctx.plan.setText(node, normText(ref?.lines ?? broken));
  return ctx.caret(changes, caret, expected);
}
