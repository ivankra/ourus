// Backspace, Delete and Cmd-Backspace: joining a node to the one above or below, and deleting back
// to the text start.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { isSpaceOrTab, mapPos, skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, blankInQuote, followsParentText, isEmptyItem, isEmptyWithChildren, lineEndWithEnding, normText, removeLines } from './context.ts';
import { notApplicable, reject, type Outcome } from './plan.ts';
import { joinCodeLines } from './code.ts';

/**
 * Cmd-Backspace: deletes back to the start of the text on the caret's line, never into a list
 * marker, a checkbox or a heading's `#`s. At the text start it joins, as Backspace does.
 */
export function deleteToTextStart(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node || node.kind === 'atom' || !node.head) return notApplicable;
  const line = doc.lineAt(pos);
  const start = doc.textStart(pos);
  if (pos <= start) return join(ctx);
  // the spaces after the caret go too: left after a marker, they would move the content column
  let to = pos;
  to = skipSpaces(doc.text, to, line.to, 1);
  // the rest now starts the line's text, where it may mean something else: escape it
  let rest = doc.text.slice(to, line.to);
  const first = node.head.type !== 'heading' && line.index === node.head.startLine;
  // a heading's title is one line, and nothing at its start can read as a block
  const escaped = node.head.type === 'heading' ? { text: rest, at: null } : ctx.encoder.escape(rest, first ? 'start' : 'continuation');
  rest = escaped.text;
  let expected: OutlinePlan;
  if (node.head.type === 'heading') {
    expected = ctx.plan.setText(node, normText([doc.text.slice(to, doc.headRange(node)!.to)]));
  } else {
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    if (i < 0 || i >= lines.length) return notApplicable;
    lines[i] = lines[i]!.slice(0, start - line.contentFrom) + rest;
    expected = ctx.plan.setText(node, normText(lines));
  }
  const changes: ChangeSpec[] = [{ from: start, to, insert: '' }];
  if (escaped.at !== null) changes.push({ from: to + escaped.at, to: to + escaped.at, insert: '\\' });
  return ctx.caret(changes, start, expected);
}

export function join(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);
  const code = joinCodeLines(ctx, node, pos, -1);
  if (code) return code;
  const gap = deleteGap(ctx, node, pos, -1);
  if (gap) return gap;

  // at the start of a continuation line of a node's text: join it to the line above
  if (node.head?.type === 'paragraph' && line.index > node.head.startLine && line.index <= node.head.endLine) {
    let first = line.contentFrom;
    first = skipSpaces(doc.text, first, line.to, 1);
    if (pos > first) return notApplicable;
    const prevLine = doc.lines[line.index - 1]!;
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    const expected = ctx.plan.setText(node, normText([...lines.slice(0, i - 1), lines[i - 1]! + lines[i]!.trimStart(), ...lines.slice(i + 1)]));
    const changes = [{ from: prevLine.to, to: first, insert: '' }];
    return ctx.caret(changes, prevLine.to, expected);
  }

  // an empty paragraph's placeholder (Enter twice left a list): back to the end of the node above;
  // the list the paragraph owned (Enter left from the middle of a list) stays, in its place
  if (node.kind === 'paragraph' && normText(doc.headLines(node)) === '') {
    const prev = doc.before(node);
    if (!prev || prev.kind === 'root') return notApplicable;
    // the node's lines stay whole (a setext underline, a closing `#`), the caret goes to its text's end
    const end = doc.lines[prev.headEndLine]!.to;
    const caret = doc.headRange(prev)?.to ?? end;
    const expected = ctx.plan.place('instead', node, node.children);
    return ctx.caret([{ from: end, to: line.to, insert: '' }], caret, expected);
  }

  if (node.kind === 'heading') return doc.config.headingEditing === 'text' ? unwrapHeading(ctx, node, line, pos) : joinHeading(ctx, node, line, pos);
  if (node.kind === 'paragraph') return joinParagraphAfterGap(ctx, node, line, pos) ?? joinParagraph(ctx, node, line, pos);
  if (node.kind !== 'item') return notApplicable;
  const range = doc.headRange(node);
  const markerLine = doc.lines[node.startLine]!;
  // a task with nothing after its checkbox has no head where the flavor reads tasks (GFM): the checkbox
  const task = node.block.task;
  const textFrom = range ? range.from : task ? markerLine.from + task.start : null;
  // a task's checkbox is chrome, like the marker: the text starts after it
  const box = textFrom !== null && (!node.head || node.head.type === 'paragraph') ? /^\[[ xX]\](?:[ \t]+|$)/.exec(doc.text.slice(textFrom, markerLine.to)) : null;
  const contentStart = textFrom !== null ? textFrom + (box ? box[0].length : 0) : markerLine.to;
  // anywhere in the item's marker zone counts as its start: deleting the line break before
  // a marker would merge the item's marker into the text above
  if (pos > contentStart || pos < markerLine.from || doc.lineAt(pos).index !== node.startLine) return notApplicable;
  if (range && node.head!.type !== 'paragraph') return notApplicable;
  // right after a checkbox: as plain text, the host's Backspace (`taskEditing: text`); or the checkbox
  // goes, and the task is a plain item (`checkbox`)
  if (box && pos === contentStart && doc.config.taskEditing === 'text') return notApplicable;
  if (box && pos === contentStart && doc.config.taskEditing === 'checkbox') {
    const changes = [{ from: textFrom!, to: textFrom! + box[0].length, insert: '' }];
    const lines = doc.headLines(node);
    lines[0] = lines[0]!.trimStart().slice(box[0].length);
    const caret = textFrom!;
    // emptied right after its parent's text, the item exists only under the caret
    const held = normText(lines) === '' && followsParentText(ctx, node);
    return ctx.caret(changes, caret, ctx.plan.setText(node, normText(lines)), { ...(held ? { placeholders: [caret] } : {}) });
  }
  const empty = isEmptyItem(ctx, node);
  const index = doc.nodes.indexOf(node);
  const prev = doc.nodes[index - 1];
  // the first node: nothing to join into, and deleting its marker would unmake the item; an empty one
  // goes, the caret moving to the start of the text below (Workflowy, Logseq)
  if (!prev || prev.kind === 'root') {
    const next = doc.nodes[index + 1];
    // an empty one with children goes too, its children taking its place, as Delete does there
    if (isEmptyWithChildren(ctx, node)) {
      const first = node.children[0]!;
      const from = doc.headRange(first)?.from ?? doc.lines[first.startLine]!.to;
      return ctx.encode(ctx.plan.place('instead', node, node.children), {}, (writtenOutline) => {
        const caret = writtenOutline.map(from, 1);
        return { anchor: caret, head: caret };
      });
    }
    if (!empty) return reject('nothing-above');
    // the only node: its marker goes, leaving an empty line to type on
    if (!next) {
      const markerLine = doc.lines[node.startLine]!;
      const changes = [{ from: markerLine.from, to: markerLine.to, insert: '' }];
      return ctx.caret(changes, markerLine.from, ctx.plan.remove([node]));
    }
    const changes = removeLines(ctx, [node.startLine]);
    const caret = mapPos(changes, doc.headRange(next)?.from ?? doc.lines[next.startLine]!.to, 1);
    return ctx.caret(changes, caret, ctx.plan.remove([node]));
  }
  // an empty item with children, below another node: it goes, its children going to the node above
  // as in any join (into its place when that node is its parent), the caret to the end of its text
  if (isEmptyWithChildren(ctx, node)) {
    const adoptsChildren = prev.kind === 'item' && prev !== node.parent;
    const expected = adoptsChildren
      ? ctx.plan.remove([node]).append(prev, 'last', node.children)
      : ctx.plan.place('instead', node, node.children);
    const end = doc.headRange(prev)?.to ?? doc.lines[prev.headEndLine]!.to;
    return ctx.encode(expected, {}, (writtenOutline) => {
      const caret = writtenOutline.map(end, -1);
      return { anchor: caret, head: caret };
    });
  }
  if (node.children.length > 0 && empty) return reject('has-children');

  // Its children go to the node above, as when Logseq or Workflowy merge a block: into its place
  // when that node is its parent (or can't hold them), else as the node's last children.
  const adopt = prev.kind === 'item' && prev !== node.parent;
  let expected =
    node.children.length === 0
      ? ctx.plan.remove([node])
      : adopt
        ? ctx.plan.remove([node]).append(prev, 'last', node.children)
        : ctx.plan.place('instead', node, node.children);
  const prevRange = doc.headRange(prev);

  if (empty) {
    // an empty item: remove its line, caret to the end of the node above
    const from = node.startLine > 0 ? doc.lines[node.startLine - 1]!.to : markerLine.from;
    const to = node.startLine > 0 ? markerLine.to : lineEndWithEnding(doc, node.startLine);
    const caret = prevRange ? prevRange.to : doc.lines[prev.headEndLine]!.to;
    return ctx.caret([{ from, to, insert: '' }], caret, expected);
  }

  // into an empty item above: the text moves up into it, checkbox and all
  if (range && prev.kind === 'item' && (!prev.head || (prev.head.type === 'paragraph' && normText(doc.headLines(prev)) === ''))) {
    const prevLine = doc.lines[prev.startLine]!;
    const spaced = prevLine.to > doc.markerTo(prev.block) && isSpaceOrTab(doc.text.charCodeAt(prevLine.to - 1));
    const text = normText(doc.headLines(node));
    if (node.children.length > 0) {
      // the children move: the encoder writes the text into the item above, and them
      const { lines, gap } = doc.contentOf(node);
      return joined(ctx, expected, prev, { text, lines, gap }, 0, 0);
    }
    const changes: ChangeSpec[] = [{ from: prevLine.to, to: range.from, insert: spaced ? '' : ' ' }];
    expected = expected.setText(prev, text);
    const caret = prevLine.to + (spaced ? 0 : 1);
    return ctx.caret(changes, caret, expected);
  }
  if (!range || !prevRange || !prev.head || (prev.head.type !== 'paragraph' && !(prev.head.type === 'heading' && !prev.head.setext))) {
    return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  }
  const prevLines = doc.headLines(prev);
  const lines = doc.headLines(node);
  if (box) lines[0] = lines[0]!.trimStart().slice(box[0].length);
  if (prev.head.type === 'heading' && lines.length > 1) return reject('not-expressible', 'a heading is a single line');
  const merged = [...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + lines[0]!.trimStart(), ...lines.slice(1)];
  if (node.children.length > 0) {
    // the children move: the encoder writes the merged text, as the node above's own lines, and them
    const above = doc.contentOf(prev).lines!;
    const { lines: own, gap } = doc.contentOf(node);
    const last = above.length - 1;
    const lastLine = doc.lines[prev.head.endLine]!;
    // where the text ends on the last line (before a heading's closing `#`s)
    const end = prevRange.to - (lastLine.to - above[last]!.length);
    const rest = doc.text.slice(contentStart, doc.lines[node.head!.startLine]!.to);
    const written = [...above.slice(0, last), above[last]!.slice(0, end) + rest + above[last]!.slice(end), ...own!.slice(1)];
    // the text keeps the gap it had before its children
    return joined(ctx, expected, prev, { text: normText(merged), lines: written, gap }, last, end);
  }
  expected = expected.setText(prev, normText(merged));
  const changes = joinChanges(ctx, prev, prevRange, contentStart, doc.lines[node.head!.startLine]!.to);
  return ctx.caret(changes, prevRange.to, expected);
}

/**
 * A join the encoder writes: `plan` with node `into` rewritten to `merged`, the caret at offset
 * `offset` of its line `line`.
 */
function joined(ctx: CommandContext, plan: OutlinePlan, into: OutlineNode, merged: Pick<OutlinePlanNode, 'text' | 'lines' | 'gap'>, line: number, offset: number): Outcome {
  let node: OutlinePlanNode | null = null;
  const expected = plan.update(into, (old) => (node = { ...old, ...merged }));
  return ctx.encode(expected, {}, (writtenOutline) => {
    const caret = writtenOutline.at(node!, line, offset);
    return { anchor: caret, head: caret };
  });
}

/**
 * The changes that append text starting at `textFrom` (on a line ending at `textEnd`) to the end of
 * `prev`'s text, removing what lay between. A heading's closing `#`s stay at the end of its line,
 * after the joined text.
 */
function joinChanges(ctx: CommandContext, prev: OutlineNode, prevRange: { to: number }, textFrom: number, textEnd: number): ChangeSpec[] {
  const { doc } = ctx;
  const prevEnd = doc.lines[prev.headEndLine]!.to;
  if (prevRange.to === prevEnd) return [{ from: prevRange.to, to: textFrom, insert: '' }];
  return [
    { from: prevRange.to, to: prevRange.to, insert: doc.text.slice(textFrom, textEnd) },
    { from: prevEnd, to: textEnd, insert: '' },
  ];
}

/**
 * Backspace at the start of a paragraph whose node above is an item (a blank line between them): its
 * text joins the item's, as an outliner joins any node into the one above, and what the paragraph
 * held goes to its place. After another paragraph, the host's Backspace makes it a soft line of that
 * paragraph, which is left to the host.
 */
function joinParagraph(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine) return notApplicable;
  const prev = doc.before(node);
  if (!prev || prev.kind !== 'item' || !prev.head || prev.head.type !== 'paragraph') return notApplicable;
  const prevRange = doc.headRange(prev)!;
  const above = doc.contentOf(prev).lines!;
  const own = doc.contentOf(node).lines!;
  const last = above.length - 1;
  const end = prevRange.to - (doc.lines[prev.head.endLine]!.to - above[last]!.length);
  const lines = [...above.slice(0, last), above[last]!.slice(0, end) + own[0]!.trimStart() + above[last]!.slice(end), ...own.slice(1)];
  const prevText = doc.headLines(prev);
  const text = normText([...prevText.slice(0, -1), prevText[prevText.length - 1]! + doc.headLines(node)[0]!.trimStart(), ...doc.headLines(node).slice(1)]);
  const expected = ctx.plan.place('instead', node, node.children);
  return joined(ctx, expected, prev, { text, lines }, last, end);
}

/**
 * Backspace at the start of a heading's text, with `headingEditing: text`: the heading's marks go
 * (an ATX heading's `#`s, a setext heading's underline), and the title is a paragraph where it is,
 * as in Obsidian. A blank line keeps it apart from paragraph text right above or below, which it
 * would otherwise run into. The heading's section continues the section above.
 */
function unwrapHeading(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  const head = node.head!;
  if (line.index !== head.startLine) return notApplicable;
  const text = doc.text;
  const eol = ctx.ending(line);
  // any line right above or below could run into the title, now paragraph text (a lazy line, indented
  // code, a setext underline): a blank line keeps it apart
  const runsInto = (lineNo: number): boolean => {
    const other = doc.lines[lineNo];
    return !!other && !other.blank;
  };
  const changes: ChangeSpec[] = [];
  let titleFrom: number;
  let title: string;
  if (head.setext) {
    let start = line.contentFrom;
    start = skipSpaces(text, start, line.to, 1);
    if (pos > start || pos < line.contentFrom) return notApplicable;
    titleFrom = start;
    title = doc.headLines(node).join('\n');
    // the underline goes; a blank line stays in its place when paragraph text follows
    const underline = doc.lines[head.endLine]!;
    changes.push(runsInto(head.endLine + 1)
      ? { from: underline.from, to: underline.to, insert: '' }
      : { from: doc.lines[head.endLine - 1]!.to, to: underline.to, insert: '' });
  } else {
    const range = doc.headRange(node)!;
    if (pos > range.from || pos < line.contentFrom) return notApplicable;
    titleFrom = range.from;
    title = text.slice(range.from, range.to);
    // the title would start a block of its own (`# - x`): escaped, so it stays text
    let escape = '';
    const escaped = ctx.encoder.escape(title, 'start');
    if (escaped.at) changes.push({ from: range.from + escaped.at, to: range.from + escaped.at, insert: '\\' });
    else if (escaped.at === 0) escape = '\\';
    title = escaped.text;
    changes.push({ from: line.contentFrom, to: range.from, insert: escape });
    if (range.to < line.to) changes.push({ from: range.to, to: line.to, insert: '' });
    if (runsInto(line.index + 1)) changes.push({ from: line.to, to: line.to, insert: eol });
  }
  const apartAbove = runsInto(line.index - 1);
  if (apartAbove) changes.push({ from: line.from, to: line.from, insert: eol });
  const paragraph: OutlinePlanNode = { id: node.id, kind: 'paragraph', text: normText(title.split('\n')), children: [] };
  const expected = ctx.plan.place('instead', node, [paragraph, ...node.children]);
  const sorted = [...changes].sort((a, b) => a.from - b.from);
  // the caret goes to the title's start (before an escape), on the line moved down by a blank line above
  const caret = (head.setext ? titleFrom : line.contentFrom) + (apartAbove ? eol.length : 0);
  return ctx.caret(sorted, caret, expected, { compare: 'flat' });
}

/**
 * Backspace at the start of a paragraph inside an item, after a blank line: the blank line goes, and
 * the paragraph is more lines of the text above, undoing Shift-Enter at the start of a line
 * (ShiftEnter10). Null where that doesn't apply.
 */
function joinParagraphAfterGap(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome | null {
  const { doc } = ctx;
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine || node.parent!.kind !== 'item') return null;
  const above = doc.before(node);
  // the text above is the item's own or a paragraph's: after a sub-item, the line would be its lazy continuation
  if (!above?.head || above.head.type !== 'paragraph' || (above !== node.parent && !(above.kind === 'paragraph' && above.parent === node.parent))) return null;
  const blanks: number[] = [];
  for (let lineNo = node.startLine - 1; lineNo > above.headEndLine; lineNo--) {
    if (!doc.lines[lineNo]!.blank) return null;
    blanks.push(lineNo);
  }
  if (blanks.length === 0) return null;
  const changes = removeLines(ctx, blanks.reverse());
  const text = normText([...doc.headLines(above), ...doc.headLines(node)]);
  const expected = ctx.plan.remove([node]).setText(above, text);
  const caret = mapPos(changes, pos, 1);
  return ctx.caret(changes, caret, expected);
}

/**
 * Backspace at the start of an ATX heading's text joins the title into the node above, as an
 * outliner merges any block into the one above; the heading's section then continues the section
 * above it. Its closing `#`s go with it.
 */
function joinHeading(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  if (node.head!.setext || line.index !== node.startLine) return notApplicable;
  const range = doc.headRange(node)!;
  if (pos > range.from || pos < line.contentFrom) return notApplicable;
  const prev = doc.before(node);
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  const prevRange = doc.headRange(prev);
  if (!prevRange || !prev.head || (prev.head.type !== 'paragraph' && !(prev.head.type === 'heading' && !prev.head.setext))) {
    return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  }
  const prevLines = doc.headLines(prev);
  const title = doc.text.slice(range.from, range.to);
  const unwrapped = ctx.plan.place('instead', node, node.children);
  const expected = unwrapped.setText(prev, normText([...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + title]));
  const changes = joinChanges(ctx, prev, prevRange, range.from, range.to);
  const gap = gapBelowHeading(ctx, line, prev);
  if (range.to < line.to || gap) changes.push({ from: range.to, to: line.to, insert: gap });
  return ctx.caret(changes, prevRange.to, expected, { compare: 'flat' });
}

/**
 * A heading line joined into the paragraph text of `into`: a blank line to set off the line below it, where that
 * line would otherwise continue the joined text (the heading's section text, right under it); else
 * ''. The line below is read after the containers the heading is in, so its own markers count.
 */
function gapBelowHeading(ctx: CommandContext, headingLine: LineInfo, into: OutlineNode): string {
  const { doc } = ctx;
  const below = doc.lines[headingLine.index + 1];
  // joined into a heading, the text is one line: nothing continues it
  if (!below || blankInQuote(ctx, below) || into.head?.type === 'heading') return '';
  if (ctx.encoder.interruptsParagraph(doc.text.slice(below.from + headingLine.contentFrom - headingLine.from, below.to).trimStart())) return '';
  return ctx.ending(headingLine) + ctx.encoder.continuation(headingLine.prefix).trimEnd();
}

/**
 * Delete at the end of a node's text joins the node below to it: Backspace at that node's start,
 * from the other side. At the end of a line inside the text, it joins the next line; on an empty
 * item, it removes the item, and the caret moves on to the node below.
 */
/**
 * With `deleteAtGap: gap`, Delete at the end of a node's text before a blank line, or Backspace at the
 * start of its text after one, deletes that blank line, the outline staying as it is. Null where that
 * doesn't apply, or where the outline would change (two paragraphs merging): the command goes on.
 */
function deleteGap(ctx: CommandContext, node: OutlineNode, pos: number, dir: -1 | 1): Outcome | null {
  const { doc } = ctx;
  if (doc.config.deleteAtGap !== 'gap' || !node.head) return null;
  const range = doc.headRange(node);
  if (!range) return null;
  const line = doc.lineAt(pos);
  let change: ChangeSpec;
  if (dir > 0) {
    const next = doc.lines[line.index + 1];
    if (pos !== range.to || pos !== line.to || !next || !blankInQuote(ctx, next)) return null;
    change = { from: line.to, to: next.to, insert: '' };
  } else {
    // a heading's `#`s are text Backspace edits (`headingEditing: text`), before its blank line
    if (node.kind === 'heading' && doc.config.headingEditing === 'text') return null;
    const prev = doc.lines[line.index - 1];
    if (line.index !== node.head.startLine || pos !== doc.textStart(pos) || !prev || !blankInQuote(ctx, prev)) return null;
    change = { from: prev.from, to: prev.to + prev.ending.length, insert: '' };
  }
  const shape = (d: OutlineState): string => d.nodes.map((n) => `${n.depth}:${n.kind}`).join(',');
  if (shape(doc.update([change])) !== shape(doc)) return null;
  const caret = mapPos([change], pos, dir > 0 ? -1 : 1);
  return ctx.caret([change], caret, ctx.plan);
}

export function joinForward(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);
  const code = joinCodeLines(ctx, node, pos, 1);
  if (code) return code;
  const gap = deleteGap(ctx, node, pos, 1);
  if (gap) return gap;
  const head = node.head;
  if (head?.type === 'paragraph' && line.index >= head.startLine && line.index < head.endLine) {
    if (pos !== line.to) return notApplicable;
    const below = doc.lines[line.index + 1]!;
    let first = below.contentFrom;
    first = skipSpaces(doc.text, first, below.to, 1);
    return join(ctx.at(first));
  }
  // the end of the text: its line's end, or before a heading's closing `#`s; on an empty item, anywhere
  // after its marker (only spaces follow it there)
  const lastTextLine = !head ? node.startLine : head.type === 'heading' && head.setext ? head.endLine - 1 : head.endLine;
  const emptyItem = (isEmptyItem(ctx, node) || isEmptyWithChildren(ctx, node)) && line.index === node.startLine && pos >= doc.markerTo(node.block) && doc.text.slice(pos, line.to).trim() === '';
  if (!emptyItem && (line.index !== lastTextLine || (pos !== line.to && pos !== doc.headRange(node)?.to))) return notApplicable;
  const next = doc.after(node);
  if (!next) return notApplicable;
  if (isEmptyItem(ctx, node)) {
    const changes = removeLines(ctx, [node.startLine]);
    const caret = mapPos(changes, doc.headRange(next)?.from ?? doc.lines[next.startLine]!.to, 1);
    const expected = ctx.plan.remove([node]);
    return ctx.caret(changes, caret, expected);
  }
  // an empty item with children takes no special case: its first child joins up into it, as the node
  // below joins any node Delete is at the end of, and that child's children come along
  // an empty paragraph (held by a placeholder) goes with its blank lines: the node below keeps its
  // kind, rather than its text joining into the empty one, and the caret goes to its line's start
  if (node.kind === 'paragraph' && node.children.length === 0 && doc.nodeText(node).trim() === '') {
    const lines = [node.startLine];
    for (let lineNo = node.startLine + 1; lineNo < next.startLine && doc.lines[lineNo]!.blank; lineNo++) lines.push(lineNo);
    const changes = removeLines(ctx, lines);
    const caret = mapPos(changes, doc.lines[next.startLine]!.from, 1);
    const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
    const expected = ctx.plan.remove([node]);
    return ctx.caret(changes, caret, expected, { drop });
  }
  // a heading below joins as its whole line: its `#`s are text once it isn't a heading (as a text
  // editor deleting the line break would leave them); its section stays where it was
  if (doc.config.headingEditing === 'text' && next.kind === 'heading' && !next.head!.setext && (head?.type === 'paragraph' || (head?.type === 'heading' && !head.setext))) {
    const range = doc.headRange(node)!;
    const headingLine = doc.lines[next.startLine]!;
    let from = headingLine.contentFrom;
    from = skipSpaces(doc.text, from, headingLine.to, 1);
    const lines = doc.headLines(node);
    // joined into a heading, the closing `#`s of the line below close that heading: they aren't text
    let joinedText = doc.text.slice(from, headingLine.to);
    if (head.type === 'heading') joinedText = joinedText.replace(/[ \t]+#+[ \t]*$/, '');
    const unwrapped = ctx.plan.place('instead', next, next.children);
    const expected = unwrapped.setText(node, normText([...lines.slice(0, -1), lines[lines.length - 1]! + joinedText]));
    const changes = joinChanges(ctx, node, range, from, headingLine.to);
    const gap = gapBelowHeading(ctx, headingLine, node);
    if (gap) changes.push({ from: headingLine.to, to: headingLine.to, insert: gap });
    return ctx.caret(changes, range.to, expected, { compare: 'flat' });
  }
  // the host would join the block below into the text: Backspace from its side is refused too
  if (next.kind === 'atom' || next.kind === 'quote') return reject('not-expressible', `can't take in the ${next.block.type} below`);
  const nextLine = doc.lines[next.startLine]!;
  // Backspace at a heading's start would unwrap it, and Delete never does; a heading the line join above
  // didn't take (into code, before a setext heading) is refused, as the join was before
  if (next.kind === 'heading' && doc.config.headingEditing === 'text') return reject('not-expressible', `can't join the heading below into ${head?.type ?? 'this node'}`);
  return join(ctx.at(doc.headRange(next)?.from ?? nextLine.to));
}
