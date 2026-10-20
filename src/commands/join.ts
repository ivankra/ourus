// Backspace, Delete and Cmd-Backspace: joining a node to the one above or below, and deleting back
// to the text start.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { isSpaceOrTab, mapPos, skipSpaces, trimMd, trimMdEnd, trimMdStart, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, continuationUnescape, interrupts, isFenceLine, outOfQuoteOpeningItem, referenceFix, blankInQuote, followsParentText, isClosingFence, isEmptyItem, isEmptyWithChildren, normText, removeLines } from './context.ts';
import { notApplicable, reject, run, withPlan, type CommandPlan, type Outcome } from './plan.ts';
import { joinCodeLines, joinPayloadLines } from './code.ts';

/**
 * `plan` (its node's lines removed), or, where what was below would then run into what was above (a
 * paragraph into an item's text), the encoder's writing of its outline (`expected`, with the lines
 * of what it rewrites), which sets them apart, the caret at `at` (an old position) where it lands.
 */
function orEncoded(ctx: CommandContext, plan: CommandPlan, at: number, assoc: -1 | 1, expected = plan.expected): CommandPlan {
  return {
    ...plan,
    fallback: () => {
      const encoded = ctx.encode(expected, {}, (writtenOutline) => {
        const caret = writtenOutline.map(at, assoc);
        return { anchor: caret, head: caret };
      });
      return 'changes' in encoded ? encoded : null;
    },
  };
}

/**
 * Cmd-Backspace: deletes back to the start of the text on the caret's line, never into a list
 * marker, a checkbox or a heading's `#`s. At the text start it joins, as Backspace does.
 */
export function deleteToTextStart(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  const line = doc.lineAt(pos);
  // a fence (code's, a math block's `$$`, a comment's `%%`) is markup, with no text to delete back
  // through: deleting it would unmake the block
  if (node && isFenceLine(ctx, line) && pos > skipSpaces(doc.text, line.contentFrom, line.to, 1)) return reject('not-expressible', 'a fence has no text');
  if (!node || node.kind === 'atom' || !node.head) return notApplicable;
  const start = doc.textStart(pos);
  // with `taskEditing: text`, from right after the checkbox, it goes, as text, back to the marker
  // (SoftBackspace10); the text after it, now the item's, is escaped where it would start a block
  if (pos === start && doc.config.taskEditing === 'text' && node.kind === 'item' && line.index === node.startLine) {
    const from = skipSpaces(doc.text, doc.markerTo(node.block), line.to, 1);
    if (from < pos && /^\[[ xX]\][ \t]+$/.test(doc.text.slice(from, pos))) {
      const lines = doc.headLines(node).map((l) => trimMdStart(l));
      lines[0] = lines[0]!.slice(pos - from);
      const escaped = ctx.encoder.escape(lines[0]!, 'start', lines.slice(1));
      const changes = [{ from, to: pos, insert: escaped.at !== null ? lines[0]!.slice(0, escaped.at) + '\\' : '' }];
      if (escaped.at !== null) changes[0]!.to = pos + escaped.at;
      lines[0] = escaped.text;
      return ctx.caret(changes, from, ctx.plan.setText(node, normText(lines)));
    }
  }
  if (pos <= start) return join(ctx);
  // the spaces after the caret go too: left after a marker, they would move the content column
  let to = pos;
  to = skipSpaces(doc.text, to, line.to, 1);
  // the rest now starts the line's text, where it may mean something else: escape it
  let rest = doc.text.slice(to, line.to);
  const atx = node.head.type === 'heading' && !node.head.setext;
  const first = !atx && line.index === node.head.startLine;
  // an ATX heading's title is one line, and nothing at its start can read as a block; a setext title
  // is paragraph text, the lines below it included (a link reference definition can span them)
  const below = doc.headLines(node).slice(line.index - node.head.startLine + 1);
  const escaped = atx ? { text: rest, at: null } : ctx.encoder.escape(rest, first ? 'start' : 'continuation', first ? below : undefined);
  rest = escaped.text;
  let expected: OutlinePlan;
  if (atx) {
    expected = ctx.plan.setText(node, normText([doc.text.slice(to, doc.headRange(node)!.to)]));
  } else {
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    // a setext underline is markup, with no text to delete back through
    if (node.head.type === 'heading' && i === lines.length) return reject('not-expressible', 'a setext underline has no text');
    if (i < 0 || i >= lines.length) return notApplicable;
    // the text may start before Markdown's content does (a split's kept padding, `enterSplitSpace: start`)
    lines[i] = lines[i]!.slice(0, Math.max(0, start - line.contentFrom)) + rest;
    expected = ctx.plan.setText(node, normText(lines));
  }
  const changes: ChangeSpec[] = [{ from: start, to, insert: '' }];
  if (escaped.at !== null) changes.push({ from: to + escaped.at, to: to + escaped.at, insert: '\\' });
  return ctx.caret(changes, start, expected);
}

/**
 * Backspace at `ctx`'s caret. `forward`: Delete at the end of the node above asked for it, and the
 * caret stays there.
 */
export function join(ctx: CommandContext, opts: { forward?: boolean } = {}): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return deleteSelection(ctx);
  let pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  const code = joinCodeLines(ctx, node ?? null, pos, -1) ?? joinPayloadLines(ctx, node ?? null, pos, -1);
  if (code) return code;
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);

  // at the start of a continuation line of a node's text: join it to the line above
  if (node.head?.type === 'paragraph' && line.index > node.head.startLine && line.index <= node.head.endLine) {
    let first = line.contentFrom;
    first = skipSpaces(doc.text, first, line.to, 1);
    if (pos > first) return notApplicable;
    const prevLine = doc.lines[line.index - 1]!;
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    // the line's spaces past its column (a break's, which Shift-Enter put there) join with it: the text
    // concatenates; an escape that only kept the line from starting a block goes: mid-line it serves
    // nothing
    const spaces = first - line.contentFrom;
    const joinedLine = lines[i]!;
    const k = lineStartEscape(joinedLine.slice(spaces));
    const tail = k < 0 ? joinedLine : joinedLine.slice(0, spaces + k) + joinedLine.slice(spaces + k + 1);
    const after = [...lines.slice(0, i - 1), lines[i - 1]! + tail, ...lines.slice(i + 1)];
    // the text's start may read as a link reference definition now, or no longer need its escape; so
    // may the line joined into, ended by a split there (an empty line, held by a placeholder, read as
    // the text it stands for: the escape Shift-Enter wrote over it kept `[a]:` from a definition)
    const held = lines.map((l, k) => (k === i && trimMd(l) === '' ? 'x' : l));
    const ref = referenceFix(ctx, node, held, after);
    const seam = ref ? null : continuationUnescape(ctx, node, lines, after, i - 1);
    const expected = ctx.plan.setText(node, normText(ref?.lines ?? seam?.lines ?? after));
    const changes: ChangeSpec[] = [{ from: prevLine.to, to: line.contentFrom, insert: '' }];
    if (k >= 0) changes.push({ from: first + k, to: first + k + 1, insert: '' });
    const fix = ref ?? seam;
    if (fix) changes.push(fix.change);
    const shift = fix && fix.change.from < prevLine.to ? fix.change.insert.length - (fix.change.to - fix.change.from) : 0;
    return ctx.caret(changes, prevLine.to + spaces + shift, expected);
  }

  // an empty paragraph's placeholder (Enter twice left a list): back to the end of the node above;
  // the list the paragraph owned (Enter left from the middle of a list) stays, in its place
  if (node.kind === 'paragraph' && normText(doc.headLines(node)) === '') {
    // in an item, right after its text, two Shift-Enters made it: the second goes (ShiftEnter11)
    const back = node.parent?.kind === 'item' ? joinParagraphAfterGap(ctx, node, line, pos) : null;
    if (back) return back;
    const prev = doc.before(node);
    // with nothing above it in its container (the document's start, a quote's), it goes with its blank
    // lines, as Delete takes it, the caret to the text below (Backspace43, Quote89)
    if (!prev || prev.kind === 'root' || (prev === node.parent && prev.kind === 'quote' && !prev.head)) {
      const next = doc.after(node);
      return next && node.children.length === 0 ? dropEmptyParagraph(ctx, node, next) : notApplicable;
    }
    // the node's lines stay whole (a setext underline, a closing `#`), the caret goes to its text's end
    const end = doc.lines[prev.headEndLine]!.to;
    const caret = doc.headRange(prev)?.to ?? end;
    const expected = ctx.plan.place('instead', node, node.children);
    return ctx.caret([{ from: end, to: line.to, insert: '' }], caret, expected);
  }

  if (node.kind === 'quote' && node.head && line.index === node.head.startLine) return unwrapCallout(ctx, node, line, pos);
  if (node.kind === 'heading') return doc.config.headingEditing === 'text' ? unwrapHeading(ctx, node, line, pos) : joinHeading(ctx, node, line, pos);
  if (node.kind === 'paragraph') {
    // spaces before its text that are its own (`enterSplitSpace: start`): from their start Backspace
    // joins, the spaces with the text; inside them it deletes a character, the host's
    const range = doc.headRange(node);
    const lead = keptSpaces(ctx, node);
    if (range && lead && line.index === node.head!.startLine && pos >= range.from - lead.length && pos <= range.from) {
      if (pos > range.from - lead.length) return notApplicable;
      pos = range.from;
    }
    return joinParagraphAfterGap(ctx, node, line, pos) ?? joinParagraph(ctx, node, line, pos, !!opts.forward);
  }
  if (node.kind !== 'item') return notApplicable;
  if (node.head?.type === 'heading') return joinItemHeading(ctx, node, pos);
  // the text alone on the line after its marker's (Shift-Enter at the text start made it): Backspace at
  // its start takes the break back, and the blank line that set the bare marker apart (ShiftEnter13)
  if (node.head?.type === 'paragraph' && node.head.startLine > node.startLine && line.index === node.head.startLine && pos >= ownTextFrom(ctx, node) && pos <= doc.headRange(node)!.from) {
    // inside spaces that are the text's (`enterSplitSpace: start`), a character's, the host's
    if (pos > ownTextFrom(ctx, node)) return notApplicable;
    const markerLine = doc.lines[node.startLine]!;
    const changes: ChangeSpec[] = [{ from: doc.markerTo(node.block), to: pos, insert: ' ' }];
    const above = doc.lines[node.startLine - 1];
    if (above?.blank && node.parent?.children[0] === node && (node.parent.kind === 'item' || node.parent.kind === 'paragraph') && doc.nodeAtLine(node.startLine - 2) === node.parent) changes.unshift({ from: above.from, to: markerLine.from, insert: '' });
    return ctx.caret(changes, mapPos(changes, pos, 1), ctx.plan);
  }
  const range = doc.headRange(node);
  const markerLine = doc.lines[node.startLine]!;
  // a task with nothing after its checkbox has no head where the flavor reads tasks (GFM): the checkbox
  const task = node.block.task;
  const textFrom = range ? range.from : task ? markerLine.from + task.start : null;
  // a task's checkbox is chrome, like the marker: the text starts after it
  const box = textFrom !== null && (!node.head || node.head.type === 'paragraph') ? /^\[[ xX]\](?:[ \t]+|$)/.exec(doc.text.slice(textFrom, markerLine.to)) : null;
  const contentStart = textFrom !== null ? textFrom + (box ? box[0].length : 0) : markerLine.to;
  // inside the checkbox, its character goes, as in text (TaskBackspace8)
  if (box && pos === textFrom! + 2 && doc.lineAt(pos).index === node.startLine) return checkboxCharacter(ctx, node, pos - 1);
  // anywhere in the item's marker zone counts as its start: deleting the line break before
  // a marker would merge the item's marker into the text above; past spaces that are its text's (a
  // split's kept padding, a held space), inside the text, Backspace deletes a character, the host's
  const ownFrom = range ? spacesFrom(ctx, node, contentStart) : contentStart;
  if (pos > contentStart || (pos > ownFrom && ownFrom < contentStart) || pos < markerLine.from || doc.lineAt(pos).index !== node.startLine) return notApplicable;
  if (range && node.head!.type !== 'paragraph') return notApplicable;
  // right after a checkbox: the checkbox goes, and the task is a plain item (`checkbox`, the default:
  // the markup in front of the text goes first); or one character of it, as plain text (`text`)
  if (box && pos === contentStart && doc.config.taskEditing === 'text') {
    const lines = doc.headLines(node);
    const first = trimMdStart(lines[0]!);
    lines[0] = first.slice(0, box[0].length - 1) + first.slice(box[0].length);
    return ctx.caret([{ from: pos - 1, to: pos, insert: '' }], pos - 1, ctx.plan.setText(node, normText(lines)));
  }
  if (box && pos === contentStart && doc.config.taskEditing === 'checkbox') {
    const changes = [{ from: textFrom!, to: textFrom! + box[0].length, insert: '' }];
    const lines = doc.headLines(node);
    // the text now starts the item's: escaped where it would start a block there (`- \# x`)
    const escaped = ctx.encoder.escape(trimMdStart(lines[0]!).slice(box[0].length), 'start', lines.slice(1).map((l) => trimMdStart(l)));
    if (escaped.at !== null) changes.push({ from: contentStart + escaped.at, to: contentStart + escaped.at, insert: '\\' });
    lines[0] = escaped.text;
    const caret = textFrom!;
    // emptied right after its parent's text, the item exists only under the caret
    const held = normText(lines) === '' && followsParentText(ctx, node);
    return ctx.caret(changes, caret, ctx.plan.setText(node, normText(lines)), { ...(held ? { placeholders: [caret] } : {}) });
  }
  const empty = isEmptyItem(ctx, node);
  const index = doc.nodes.indexOf(node);
  const { prev, quote } = textAbove(ctx, node);
  // what goes when an empty item does: it, with the quotes it is all of
  const gone = goneWith(node);
  // the first node: nothing to join into; an empty one goes, the caret moving to the start of the
  // text below (Workflowy, Logseq), and one with text loses its marker (`backspaceAtTopItem`)
  if (!prev || prev.kind === 'root') {
    const next = doc.nodes[index + 1];
    // an empty one with children goes too, its children taking its place, as Delete does there
    // (`emptyItemWithChildren: lift`), or the key does nothing (`refuse`)
    if (isEmptyWithChildren(ctx, node)) {
      if (doc.config.emptyItemWithChildren === 'refuse') return reject('has-children');
      const first = node.children[0]!;
      const from = doc.headRange(first)?.from ?? doc.lines[first.startLine]!.to;
      return ctx.encode(ctx.plan.place('instead', node, node.children), {}, (writtenOutline) => {
        const caret = writtenOutline.map(from, 1);
        return { anchor: caret, head: caret };
      });
    }
    if (!empty) return unwrapItem(ctx, node);
    // the only node: its marker goes (and its quotes' `>`), leaving an empty line to type on
    if (!next) {
      const changes = [{ from: markerLine.from, to: markerLine.to, insert: '' }];
      return ctx.caret(changes, markerLine.from, ctx.plan.remove([gone]));
    }
    const changes = removeLines(ctx, [node.startLine]);
    // at the text start below: after a checkbox, not in it
    const caret = mapPos(changes, doc.textStart(doc.lines[next.startLine]!.from), 1);
    return ctx.caret(changes, caret, ctx.plan.remove([gone]));
  }
  // first in a quote, with text: nothing above it in the quote to join, so its marker goes
  // (`backspaceAtTopItem`); an empty one goes, as anywhere, the caret going to the text above
  if (quote && !empty && !isEmptyWithChildren(ctx, node)) return unwrapItem(ctx, node);
  // first in an item whose marker shares its line (`- - a`), which has no text: its marker goes, and
  // its text, on that line, is the item's, its children and the items after it the item's children
  if (prev.kind === 'item' && prev.startLine === node.startLine && node.parent === prev && !empty && !isEmptyWithChildren(ctx, node)) {
    let planned: OutlinePlanNode | undefined;
    const expected = ctx.plan.update(prev, (n) => (planned = { ...n, text: doc.nodeText(node), lines: doc.contentOf(node).lines, children: [...node.children, ...n.children.filter((child) => child !== node)] }));
    return ctx.encode(expected, {}, (writtenOutline) => {
      const caret = writtenOutline.at(planned!, 0, 0);
      return { anchor: caret, head: caret };
    });
  }
  // an empty item with children, below another node: it goes, its children going to the node above
  // as in any join (into its place when that node is its parent, which `emptyItemWithChildren:
  // refuse` refuses), the caret to the end of its text
  if (isEmptyWithChildren(ctx, node)) {
    const adoptsChildren = prev.kind === 'item' && prev !== node.parent && !quote;
    if (!adoptsChildren && doc.config.emptyItemWithChildren === 'refuse') return reject('has-children');
    const expected = adoptsChildren
      ? ctx.plan.remove([node]).append(prev, 'last', node.children)
      : ctx.plan.place('instead', node, node.children);
    const end = textEnd(ctx, prev);
    return ctx.encode(expected, {}, (writtenOutline) => {
      const caret = writtenOutline.map(end, -1);
      return { anchor: caret, head: caret };
    });
  }
  if (node.children.length > 0 && empty) return reject('has-children');

  // Its children go to the node above, as when Logseq or Workflowy merge a block: into its place
  // when that node is its parent (or can't hold them), else as the node's last children. Coming up a
  // level so, they make the join refused with `joinWithChildren: refuse` (Delete at the parent's end
  // asks for this join too).
  const adopt = prev.kind === 'item' && prev !== node.parent;
  if (!adopt && node.children.length > 0 && doc.config.joinWithChildren === 'refuse') return reject('has-children');
  let expected =
    node.children.length === 0
      ? ctx.plan.remove([gone])
      : adopt
        ? ctx.plan.remove([node]).append(prev, 'last', node.children)
        : ctx.plan.place('instead', node, node.children);
  const prevRange = doc.headRange(prev);

  if (empty) {
    // an empty item: its lines go, caret to the end of the node above
    const changes = removeLines(ctx, emptyItemLines(ctx, node));
    return orEncoded(ctx, ctx.caret(changes, mapPos(changes, textEnd(ctx, prev), -1), expected), textEnd(ctx, prev), -1);
  }

  // into an empty item above (an empty task's too): the text moves up into it, its own checkbox and
  // all, and the empty item's checkbox goes; the caret lands at the text start, after the checkbox
  if (range && prev.kind === 'item' && (!prev.head || doc.isEmpty(prev))) {
    const prevLine = doc.lines[prev.startLine]!;
    const markerTo = doc.markerTo(prev.block);
    const spaced = prevLine.to > markerTo && isSpaceOrTab(doc.text.charCodeAt(prevLine.to - 1));
    const text = normText(doc.headLines(node));
    const boxLength = box ? box[0].length : 0;
    if (node.children.length > 0) {
      // the children move: the encoder writes the text into the item above, and them
      const { lines, gap } = doc.contentOf(node);
      return joined(ctx, expected, prev, { text, lines, gap }, 0, boxLength);
    }
    // the empty item's checkbox, if any, goes with the line break
    const prevBox = /^([ \t]+)\[[ xX]\]/.exec(doc.text.slice(markerTo, prevLine.to));
    const from = prevBox ? markerTo + prevBox[1]!.length : prevLine.to;
    const insert = prevBox || spaced ? '' : ' ';
    const changes: ChangeSpec[] = [{ from, to: range.from, insert }];
    expected = expected.setText(prev, text);
    return ctx.caret(changes, from + insert.length + boxLength, expected);
  }
  if (!range || !prevRange || !prev.head || !joinsInto(prev)) return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  const prevLines = doc.headLines(prev);
  const lines = doc.headLines(node);
  if (box) lines[0] = trimMdStart(lines[0]!).slice(box[0].length);
  if (lines.length > 1 && singleLine(prev)) return reject('not-expressible', singleLine(prev));
  // the spaces before the text that are its own (a placeholder's, a split's padding under
  // `enterSplitSpace: start`) join with it
  const movedFrom = spacesFrom(ctx, node, contentStart);
  const lineEnd = doc.lines[node.head!.startLine]!.to;
  const lead = doc.text.slice(movedFrom, contentStart);
  const own = trimMdStart(lines[0]!);
  const merged = [...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + lead + own, ...lines.slice(1)];
  if (node.children.length > 0) {
    // the children move: the encoder writes the merged text, as the node above's own lines, and them
    const above = doc.contentOf(prev).lines!;
    const { lines: own, gap } = doc.contentOf(node);
    const last = above.length - 1;
    const lastLine = doc.lines[prev.head.endLine]!;
    // where the text ends on the last line (before a heading's closing `#`s)
    const end = prevRange.to - (lastLine.to - above[last]!.length);
    const rest = lead + doc.text.slice(contentStart, lineEnd);
    const written = [...above.slice(0, last), above[last]!.slice(0, end) + rest + above[last]!.slice(end), ...own!.slice(1)];
    // the text keeps the gap it had before its children
    return joined(ctx, expected, prev, { text: normText(merged), lines: written, gap }, last, end);
  }
  const changes = joinChanges(ctx, prev, prevRange, movedFrom, lineEnd);
  // an escape that only kept the text from starting a block at its line's start goes: mid-line it
  // serves nothing (`- abc` / `- \- def` joins back to `- abc- def`)
  const k = prevRange.to === doc.lines[prev.headEndLine]!.to ? lineStartEscape(trimMdStart(lines[0]!)) : -1;
  if (k >= 0) {
    changes.push({ from: contentStart + k, to: contentStart + k + 1, insert: '' });
    const joinedLine = merged[prevLines.length - 1]!;
    const at = prevLines[prevLines.length - 1]!.length + lead.length + k;
    merged[prevLines.length - 1] = joinedLine.slice(0, at) + joinedLine.slice(at + 1);
  }
  // the text's start may read as a link reference definition now, or no longer need the escape it had;
  // so may the last line of the text joined into, ended by a split there
  const ref = referenceFix(ctx, prev, prevLines, merged) ?? continuationUnescape(ctx, prev, prevLines, merged, prevLines.length - 1);
  if (ref) changes.push(ref.change);
  expected = expected.setText(prev, normText(ref?.lines ?? merged));
  const shift = ref ? ref.change.insert.length - (ref.change.to - ref.change.from) : 0;
  // what followed the item may run into the joined text now (an ordered list from 2 can't interrupt
  // a paragraph): the encoder sets it apart
  const written = expected.update(prev, (n) => ({ ...n, lines: (ref?.lines ?? merged).map((l, i) => (i ? l : trimMdStart(l))) }));
  return orEncoded(ctx, ctx.caret(changes, prevRange.to + shift, expected), prevRange.to, -1, written);
}

/**
 * The spaces before a paragraph's text that are its text's (`enterSplitSpace: start`, `␠Two.`, as
 * `OutlineState.textStart` reads them), which a join takes with it; '' where there are none.
 */
function keptSpaces(ctx: CommandContext, node: OutlineNode): string {
  const range = ctx.doc.headRange(node);
  return range ? ctx.doc.text.slice(ownTextFrom(ctx, node), range.from) : '';
}

/** Where `node`'s text starts, the spaces before it that are its own included (`OutlineState.textStart`). */
function ownTextFrom(ctx: CommandContext, node: OutlineNode): number {
  const range = ctx.doc.headRange(node)!;
  return Math.min(range.from, ctx.doc.textStart(range.from));
}

/**
 * Where the spaces before `node`'s text start (`textStart`, where Markdown reads it) that are its
 * text's start: the first a placeholder holds as text (`- ◌ x`), or the padding a split kept
 * (`enterSplitSpace: start`, `OutlineState.textStart`); else `textStart`.
 */
function spacesFrom(ctx: CommandContext, node: OutlineNode, textStart: number): number {
  const { doc } = ctx;
  const held = doc.placeholders.find((p) => p >= doc.markerTo(node.block) && p < textStart && isSpaceOrTab(doc.text.charCodeAt(p)));
  return Math.min(held ?? textStart, doc.textStart(textStart));
}

/**
 * What only served `text` (a node's first line, its leading spaces gone) at its line's start, which
 * a join moves mid-line: an escape that kept it from starting a block (`lineStartEscape`). Where it
 * is in `text`, how long, and what replaces it; null where nothing does.
 */
function lineStartFix(text: string): { at: number; length: number; insert: string } | null {
  const k = lineStartEscape(text);
  return k < 0 ? null : { at: k, length: 1, insert: '' };
}

/** `text` with `fix` applied. */
const fixed = (text: string, fix: { at: number; length: number; insert: string } | null): string => (fix ? text.slice(0, fix.at) + fix.insert + text.slice(fix.at + fix.length) : text);

/**
 * Where a backslash at the start of `text` only kept it from starting a block at a line's start (a
 * bullet `\- `, a heading's `\# `, a quote's `\>`, a setext underline `\===`, an ordered marker's
 * `2\. `), its index; else -1. Joined to the end of a line, the text needs no such escape.
 */
function lineStartEscape(text: string): number {
  if (/^\\[-+](?:[ \t]|$)/.test(text) || /^\\#{1,6}(?:[ \t]|$)/.test(text) || /^\\>/.test(text) || /^\\=+[ \t]*$/.test(text)) return 0;
  const ordered = /^(\d{1,9})\\[.)](?:[ \t]|$)/.exec(text);
  return ordered ? ordered[1]!.length : -1;
}

/**
 * Backspace or Delete on a selection across nodes: the selected text goes, markup and all, and the
 * two ends join, as Backspace at the second end's start would join them. The nodes between go; what
 * is left of the last node's text joins the first's, and its children go to the first node, as in any
 * join. Within one node's text it is the host's. Where the result wouldn't read as that, it is
 * refused. (Where the ends aren't both in a paragraph's or an item's text, or a node between holds
 * what the selection doesn't take, it is still the host's: not built yet.)
 */
function deleteSelection(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const from = ctx.from;
  const to = ctx.to;
  const first = doc.nodeAt(from);
  const last = doc.nodeAt(to);
  if (!first || !last) return notApplicable;
  if (first === last) return notApplicable;
  const inText = (node: OutlineNode, pos: number): boolean => {
    const head = node.head;
    if (!head || head.type !== 'paragraph' || (node.kind !== 'item' && node.kind !== 'paragraph')) return false;
    const line = doc.lineAt(pos);
    return line.index >= head.startLine && line.index <= head.endLine && pos >= doc.textStart(pos) && pos <= line.to;
  };
  if (!inText(first, from) || !inText(last, to)) return notApplicable;
  const i0 = doc.nodes.indexOf(first);
  const i1 = doc.nodes.indexOf(last);
  const between = doc.nodes.slice(i0 + 1, i1);
  // a node between goes whole: none may hold the last node, or anything after it
  if (between.some((node) => doc.nodes.indexOf(doc.lastDescendant(node)) >= i1)) return notApplicable;
  const fromLine = doc.lineAt(from);
  const toLine = doc.lineAt(to);
  const firstLines = doc.headLines(first);
  const lastLines = doc.headLines(last);
  const a = fromLine.index - first.head!.startLine;
  const b = toLine.index - last.head!.startLine;
  const kept = firstLines[a]!.slice(0, from - fromLine.contentFrom);
  let rest = lastLines[b]!.slice(to - toLine.contentFrom);
  // the rest starting a line now (nothing kept before it) is escaped where it would start a block there
  const changes: ChangeSpec[] = [{ from, to, insert: '' }];
  if (trimMd(kept) === '') {
    const escaped = ctx.encoder.escape(rest, a === 0 ? 'start' : 'continuation', a === 0 ? lastLines.slice(b + 1) : undefined);
    if (escaped.at !== null) changes.push({ from: to + escaped.at, to: to + escaped.at, insert: '\\' });
    rest = escaped.text;
  }
  const merged = normText([...firstLines.slice(0, a), kept + rest, ...lastLines.slice(b + 1)]);
  let expected = ctx.plan;
  for (const node of between) if (!between.includes(node.parent!)) expected = expected.remove([node]);
  // the last node's children go to the first, as in a join: into its place when the first is its parent
  const adopt = first.kind === 'item' && last.parent !== first;
  expected = adopt ? expected.remove([last]).append(first, 'last', last.children) : expected.place('instead', last, last.children);
  expected = expected.setText(first, merged);
  return verified(ctx, ctx.caret(changes, from, expected), 'the selection deleted would read otherwise');
}

/** `plan`, or a refusal where it doesn't read as intended: a command's own check, so its refusal is clean. */
function verified(ctx: CommandContext, plan: Outcome, why: string): Outcome {
  if ('status' in plan) return plan;
  return run(ctx, plan).status === 'applied' ? plan : reject('not-expressible', why);
}

/**
 * The node above `node` whose text it would join: the node before it, past the quotes without text
 * that start with it (they have none to join into); with the outermost of those quotes.
 */
function textAbove(ctx: CommandContext, node: OutlineNode): { prev: OutlineNode | undefined; quote: OutlineNode | undefined } {
  const { doc } = ctx;
  let prev = doc.before(node);
  let quote: OutlineNode | undefined;
  const holds = (q: OutlineNode): boolean => {
    for (let p = node.parent; p; p = p.parent) if (p === q) return true;
    return false;
  };
  while (prev?.kind === 'quote' && !prev.head && holds(prev)) {
    quote = prev;
    prev = doc.before(prev);
  }
  return { prev, quote };
}

/** What goes when `node` does: it, or the outermost quote without text that holds nothing else. */
function goneWith(node: OutlineNode): OutlineNode {
  let gone = node;
  while (gone.parent?.kind === 'quote' && !gone.parent.head && gone.parent.children.length === 1) gone = gone.parent;
  return gone;
}

/** Whether text can join the end of `node`'s: a paragraph's, an ATX heading's, a callout's title. */
function joinsInto(node: OutlineNode): boolean {
  const head = node.head;
  return !!head && (head.type === 'paragraph' || head.type === 'callout_title' || (head.type === 'heading' && !head.setext));
}

/** Why only one line of text can join `node`'s (a heading, a callout's title line), or ''. */
function singleLine(node: OutlineNode): string {
  if (node.head?.type === 'heading') return 'a heading is a single line';
  if (node.head?.type === 'callout_title') return 'a callout title is a single line';
  return '';
}

/**
 * Where the text of `node` ends, for a caret sent there: its text's end; in a fenced code block, the
 * end of its last code line (after the closing fence, anything typed would stop it closing the
 * block).
 */
function textEnd(ctx: CommandContext, node: OutlineNode): number {
  const { doc } = ctx;
  const last = doc.lines[node.headEndLine]!;
  if (node.kind === 'atom' && node.block.type === 'code_block' && isClosingFence(ctx, last)) return doc.lines[node.headEndLine - 1]!.to;
  return doc.headRange(node)?.to ?? last.to;
}

/**
 * Backspace at the start of an item with nothing above it in its container, its text not empty: the
 * next layer of markup in front of the text goes, the item's marker, and the item is a paragraph
 * where it is (`backspaceAtTopItem: unwrap`), or nothing happens (`refuse`). At the top level the
 * items after it become the paragraph's list, as direct outdent makes them; in a quote, where a
 * paragraph owns no list, its children follow it in the quote.
 */
function unwrapItem(ctx: CommandContext, node: OutlineNode): Outcome {
  const { doc } = ctx;
  if (doc.config.backspaceAtTopItem === 'refuse') return reject('nothing-above');
  if (!node.head || node.head.type !== 'paragraph') return reject('nothing-above');
  const parent = node.parent!;
  const ownsList = parent.kind !== 'quote' && parent.kind !== 'item';
  const at = parent.children.indexOf(node);
  const later: OutlineNode[] = [];
  if (ownsList) for (const sibling of parent.children.slice(at + 1)) {
    if (sibling.kind !== 'item') break;
    later.push(sibling);
  }
  let lines = doc.contentOf(node).lines!;
  // with `taskEditing: block` a task's checkbox goes with its marker, as a join drops it; what it
  // leaves at the paragraph's start is escaped where it would start a block
  const box = doc.config.taskEditing === 'block' ? /^([ \t]*)\[[ xX]\](?:[ \t]+|$)/.exec(lines[0]!) : null;
  if (box) lines = [box[1] + ctx.encoder.escape(lines[0]!.slice(box[0].length), 'start', lines.slice(1).map((l) => trimMdStart(l))).text, ...lines.slice(1)];
  const paragraph: OutlinePlanNode = { id: node.id, kind: 'paragraph', text: normText(box ? lines.map((l) => trimMdStart(l)) : doc.headLines(node)), lines, children: ownsList ? [...node.children, ...later] : [] };
  const base = later.length > 0 ? ctx.plan.remove(later) : ctx.plan;
  const expected = ownsList ? base.place('instead', node, [paragraph]) : base.place('instead', node, [paragraph, ...node.children]);
  const plan = ctx.encode(expected, {}, (written) => {
    const caret = written.at(paragraph, 0, 0);
    return { anchor: caret, head: caret };
  });
  return verified(ctx, plan, 'without its marker the item would read otherwise');
}

/**
 * A join the encoder writes: `plan` with node `into` rewritten to `merged`, the caret at offset
 * `offset` of its line `line`.
 */
function joined(ctx: CommandContext, plan: OutlinePlan, into: OutlineNode, merged: Pick<OutlinePlanNode, 'text' | 'lines' | 'gap'>, line: number, offset: number): Outcome {
  // the text's start may read as a link reference definition now, or no longer need the escape it had;
  // so may the line joined into, ended by a split there
  const ref = merged.lines ? referenceFix(ctx, into, ctx.doc.contentOf(into).lines ?? [], merged.lines) : null;
  if (ref) {
    const added = ref.change.insert.length > 0;
    merged = { ...merged, lines: ref.lines, text: added ? '\\' + merged.text : merged.text!.replace(/^\\/, '') };
    if (line === 0 && offset > 0) offset += added ? 1 : -1;
  }
  const seam = !ref && merged.lines ? continuationUnescape(ctx, into, ctx.doc.contentOf(into).lines ?? [], merged.lines, line) : null;
  if (seam) {
    merged = { ...merged, lines: seam.lines, text: normText(seam.lines) };
    offset--;
  }
  let node: OutlinePlanNode | null = null;
  const expected = plan.update(into, (old) => (node = { ...old, ...merged }));
  return ctx.encode(expected, {}, (writtenOutline) => {
    const caret = writtenOutline.at(node!, line, offset);
    return { anchor: caret, head: caret };
  });
}

/**
 * Backspace at the start of an item whose text is a heading (`- # H`). The markup nearest the caret
 * goes first: with `headingEditing: text`, the heading's marks (`#`s, closing ones too, or a setext
 * underline), the item staying with its title as a paragraph; with `block`, the title joins the node
 * above, as any item's text does.
 */
function joinItemHeading(ctx: CommandContext, node: OutlineNode, pos: number): Outcome {
  const { doc } = ctx;
  const head = node.head!;
  const range = doc.headRange(node)!;
  const markerLine = doc.lines[node.startLine]!;
  if (pos < markerLine.from || doc.lineAt(pos).index !== node.startLine) return notApplicable;
  // where the heading's markup starts, after the marker
  const marksFrom = skipSpaces(doc.text, doc.markerTo(node.block), markerLine.to, 1);
  if (pos > range.from) return notApplicable;
  // `headingEditing: block`: the title alone joins
  if (doc.config.headingEditing === 'block') return joinItemText(ctx, node, range.from, range.to, head.setext ? head.endLine : null);
  // `headingEditing: text`: the marks go, the title stays the item's text
  let title = doc.text.slice(range.from, range.to);
  const changes: ChangeSpec[] = [];
  if (head.setext) {
    // the underline goes; a blank line stays in its place where the line below would continue the title
    const underline = doc.lines[head.endLine]!;
    const next = doc.lines[head.endLine + 1];
    const runsInto = !!next && !next.blank && !interrupts(ctx, doc.text.slice(next.contentFrom, next.to));
    // the blank line keeps the containers' prefix, trailing spaces trimmed (a quote's `>`)
    const blank = trimMdEnd(ctx.encoder.continuation(underline.prefix));
    changes.push(runsInto ? { from: underline.from, to: underline.to, insert: blank } : { from: doc.lines[head.endLine - 1]!.to, to: underline.to, insert: '' });
  } else {
    // the title would start a block of its own at the item's text start (`- # - x`): escaped
    const escaped = ctx.encoder.escape(title, 'start');
    changes.push({ from: marksFrom, to: range.from, insert: escaped.at === 0 ? '\\' : '' });
    if (escaped.at) changes.push({ from: range.from + escaped.at, to: range.from + escaped.at, insert: '\\' });
    if (range.to < markerLine.to) changes.push({ from: range.to, to: markerLine.to, insert: '' });
    // a line below that would continue the title, now paragraph text (the item's next paragraph): a
    // blank line keeps it apart, with the containers' prefix
    const next = doc.lines[markerLine.index + 1];
    const owner = next && doc.nodeAtLine(next.index);
    const from = owner?.kind === 'item' && owner.startLine === next!.index ? doc.markerFrom(owner.block) : next?.contentFrom;
    if (next && !next.blank && !interrupts(ctx, doc.text.slice(from, next.to))) {
      changes.push({ from: markerLine.to, to: markerLine.to, insert: ctx.ending(markerLine) + trimMdEnd(ctx.encoder.continuation(next.prefix)) });
    }
    title = escaped.text;
  }
  const item: OutlinePlanNode = { id: node.id, kind: 'item', text: normText(title.split('\n')), children: node.children };
  return ctx.caret(changes, marksFrom, ctx.plan.place('instead', node, [item]));
}

/**
 * An item's text from `textFrom` to `textTo` (its first line's) joined to the end of the node above,
 * the item's marker going with the line break, its children going as in any join; `underline`, a
 * setext underline line that goes too.
 */
function joinItemText(ctx: CommandContext, node: OutlineNode, textFrom: number, textTo: number, underline: number | null): Outcome {
  const { doc } = ctx;
  const { prev, quote } = textAbove(ctx, node);
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  if (quote) return reject('not-expressible', "can't join out of a quote");
  const prevRange = doc.headRange(prev);
  if (!prevRange || !prev.head || !joinsInto(prev)) return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  const text = doc.text.slice(textFrom, textTo);
  if (text.includes('\n') && singleLine(prev)) return reject('not-expressible', singleLine(prev));
  const prevLines = doc.headLines(prev);
  const lines = text.split('\n').map((l) => trimMd(l));
  const merged = [...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + lines[0]!, ...lines.slice(1)];
  if (node.children.length > 0) {
    // the children go as in any join (into its place when the node above is its parent, else as that
    // node's last children); the encoder writes the merged text, as the node above's own lines, and them
    const adopt = prev.kind === 'item' && prev !== node.parent;
    const plan = adopt ? ctx.plan.remove([node]).append(prev, 'last', node.children) : ctx.plan.place('instead', node, node.children);
    const above = doc.contentOf(prev).lines!;
    const last = above.length - 1;
    const end = prevRange.to - (doc.lines[prev.head.endLine]!.to - above[last]!.length);
    const written = [...above.slice(0, last), above[last]!.slice(0, end) + lines[0]! + above[last]!.slice(end), ...lines.slice(1)];
    return joined(ctx, plan, prev, { text: normText(merged), lines: written, gap: doc.contentOf(node).gap }, last, end);
  }
  const expected = ctx.plan.remove([node]).setText(prev, normText(merged));
  const changes = joinChanges(ctx, prev, prevRange, textFrom, textTo);
  const lineEnd = doc.lineAt(textTo).to;
  if (textTo < lineEnd) changes.push({ from: textTo, to: lineEnd, insert: '' });
  if (underline !== null) changes.push({ from: doc.lines[underline - 1]!.to, to: doc.lines[underline]!.to, insert: '' });
  return ctx.caret(changes, prevRange.to, expected);
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
 * Backspace at the start of a paragraph: the node above decides. A quote's first paragraph leaves
 * the quote (its `>` goes first); between paragraphs the blank lines go, the paragraph more lines of
 * the one above; one line joins a heading's or a callout's title; an empty item above takes the
 * text; an item's text takes it, what the paragraph held going to its place. With nothing above,
 * or where the text can't go, it is refused.
 */
function joinParagraph(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, forward: boolean): Outcome {
  const { doc } = ctx;
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine) return notApplicable;
  // a quote's `>` in front of its first node goes first: the node leaves the quote
  const quote = node.parent!;
  if (quote.kind === 'quote' && !quote.head && quote.children[0] === node) return leaveQuote(ctx, node, quote);
  const prev = doc.before(node);
  if (!prev || prev.kind === 'root') {
    // the document's first paragraph, after blank lines only: they go (Backspace43c)
    const above = Array.from({ length: node.startLine }, (_, i) => i);
    if (forward || node.parent?.kind !== 'root' || !above.length || !above.every((i) => doc.lines[i]!.blank)) return reject('nothing-above');
    const changes = removeLines(ctx, above);
    return ctx.caret(changes, mapPos(changes, pos, 1), ctx.plan);
  }
  // between paragraphs the blank line goes: the paragraph is more lines of the one above; with
  // `enterAtTextStart: stay`, whose Enter leaves a blank line, one a press while more are there
  // (Backspace12e, Delete18d)
  if (prev.kind === 'paragraph' && prev.head?.type === 'paragraph') {
    const between = Array.from({ length: node.startLine - prev.headEndLine - 1 }, (_, k) => prev.headEndLine + 1 + k);
    if (doc.config.enterAtTextStart === 'stay' && between.length > 1 && between.every((l) => doc.lines[l]!.blank || blankInQuote(ctx, doc.lines[l]!))) {
      const changes = removeLines(ctx, [between[between.length - 1]!]);
      return ctx.caret(changes, forward ? mapPos(changes, doc.headRange(prev)!.to, -1) : mapPos(changes, pos, 1), ctx.plan);
    }
    return joinParagraphLines(ctx, node, prev);
  }
  // a heading's title, and a callout's in the Obsidian flavor, is one line: only one joins it
  if ((prev.head?.type === 'heading' && !prev.head.setext) || prev.head?.type === 'callout_title') {
    if (doc.headLines(node).length > 1) return reject('not-expressible', singleLine(prev));
    const prevRange = doc.headRange(prev)!;
    const title = doc.headLines(prev)[0]!;
    // a title that is only its `[!type]` gets the space its text follows
    const space = prev.head.type === 'callout_title' && /^[ \t]*\[![^\]]*\][+-]?$/.test(title) ? ' ' : '';
    // an escape that only kept the text from starting a block at its line's start goes (Enter60b)
    const first = trimMdStart(doc.headLines(node)[0]!);
    const fix = prevRange.to === doc.lines[prev.headEndLine]!.to ? lineStartFix(first) : null;
    const lead = keptSpaces(ctx, node);
    const own = lead + fixed(first, fix);
    const expected = ctx.plan.place('instead', node, node.children).setText(prev, normText([title + space + own]));
    const changes = joinChanges(ctx, prev, prevRange, range.from - lead.length, doc.lines[node.head!.startLine]!.to);
    if (space) changes[0] = { ...changes[0]!, insert: space + changes[0]!.insert };
    if (fix) changes.push({ from: range.from + fix.at, to: range.from + fix.at + fix.length, insert: fix.insert });
    return ctx.caret(changes, prevRange.to + space.length, expected, { compare: 'flat' });
  }
  // a setext title takes the line at the end of its text, before the underline, as an ATX title does
  // (a setext title can hold several lines: a paragraph of several joins as more of them)
  if (prev.head?.type === 'heading' && prev.head.setext && prev.kind === 'heading') {
    const titleEnd = doc.lines[prev.head.endLine - 1]!.to;
    const titleLines = doc.headLines(prev);
    const own = doc.headLines(node).map((l, k) => (k === 0 ? trimMdStart(l) : l));
    // an escape that only kept the text from starting a block at its line's start goes (Enter60)
    const fix = lineStartFix(own[0]!);
    const lead = keptSpaces(ctx, node);
    own[0] = lead + fixed(own[0]!, fix);
    const expected = ctx.plan.place('instead', node, node.children).setText(prev, normText([...titleLines.slice(0, -1), titleLines[titleLines.length - 1]! + own[0]!, ...own.slice(1)]));
    // the paragraph's lines move up before the underline, the first onto the title's last line
    const paraFrom = doc.lines[node.head!.startLine]!;
    const paraTo = doc.lines[node.head!.endLine]!;
    const moved = lead + fixed(doc.text.slice(skipSpaces(doc.text, paraFrom.contentFrom, paraFrom.to, 1), paraTo.to), fix);
    const changes = [
      { from: titleEnd, to: titleEnd, insert: moved },
      { from: doc.lines[node.head!.startLine - 1]!.to, to: paraTo.to, insert: '' },
    ];
    return ctx.caret(changes, titleEnd, expected, { compare: 'flat' });
  }
  // into an empty item above, the text moves up into it
  if (prev.kind === 'item' && prev.children.length === 0 && doc.isEmpty(prev) && !prev.block.task) {
    const { lines: own, gap } = doc.contentOf(node);
    const expected = ctx.plan.place('instead', node, node.children);
    return joined(ctx, expected, prev, { text: normText(doc.headLines(node)), lines: own, gap }, 0, 0);
  }
  if (prev.kind !== 'item' || !prev.head || prev.head.type !== 'paragraph') return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  const prevRange = doc.headRange(prev)!;
  const above = doc.contentOf(prev).lines!;
  const own = doc.contentOf(node).lines!;
  const last = above.length - 1;
  const end = prevRange.to - (doc.lines[prev.head.endLine]!.to - above[last]!.length);
  const lead = keptSpaces(ctx, node);
  const lines = [...above.slice(0, last), above[last]!.slice(0, end) + lead + trimMdStart(own[0]!) + above[last]!.slice(end), ...own.slice(1)];
  const prevText = doc.headLines(prev);
  const text = normText([...prevText.slice(0, -1), prevText[prevText.length - 1]! + lead + trimMdStart(doc.headLines(node)[0]!), ...doc.headLines(node).slice(1)]);
  const expected = ctx.plan.place('instead', node, node.children);
  return joined(ctx, expected, prev, { text, lines }, last, end);
}

/**
 * Backspace at the start of a paragraph after another, or Delete at the end of the one above: the
 * paragraphs join, glued, as at every boundary, the blank lines between going at once: its first line
 * joins the end of the text above (an escape that only kept it from starting a block at its line's
 * start going), its other lines follow, and what it held goes to that paragraph. The caret is at the
 * seam.
 */
function joinParagraphLines(ctx: CommandContext, node: OutlineNode, prev: OutlineNode): Outcome {
  const { doc } = ctx;
  const above = doc.contentOf(prev).lines!;
  const { lines: written, gap } = doc.contentOf(node);
  const own = written!.map((l, k) => (k === 0 ? trimMdStart(l) : l));
  own[0] = keptSpaces(ctx, node) + fixed(own[0]!, lineStartFix(own[0]!));
  const prevLines = doc.headLines(prev);
  const text = normText([...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + own[0]!, ...own.slice(1)]);
  const expected = ctx.plan.place('instead', node, node.children);
  const last = above.length - 1;
  // the joined text keeps the gap the paragraph had below it
  const merged = { text, lines: [...above.slice(0, last), above[last]! + own[0]!, ...own.slice(1)], gap };
  return joined(ctx, expected, prev, merged, last, above[last]!.length);
}

/**
 * Backspace at the start of a quote's first node: the quote's `>` goes from it, as the markup in
 * front of a node's text goes first. The node, with what it holds, leaves the quote, to stand before
 * it; a quote it was all of goes.
 */
function leaveQuote(ctx: CommandContext, node: OutlineNode, quote: OutlineNode): Outcome {
  const { doc } = ctx;
  // a quote that is an item's first block (`- > q`): out of it, a paragraph is the item's text
  const opening = outOfQuoteOpeningItem(ctx, node);
  if (opening) return opening;
  const rest = quote.children.slice(1);
  const expected = rest.length === 0 ? ctx.plan.place('instead', quote, [node]) : ctx.plan.remove([node]).place('before', quote, [node]);
  const from = doc.headRange(node)?.from ?? doc.lines[node.startLine]!.to;
  return ctx.encode(expected, {}, (written) => {
    const caret = written.map(from, 1);
    return { anchor: caret, head: caret };
  });
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
  // code, a setext underline): a blank line keeps it apart, in the containers' markers (a quote's `>`)
  const runsInto = (lineNo: number): boolean => {
    const other = doc.lines[lineNo];
    return !!other && !other.blank && !blankInQuote(ctx, other);
  };
  const blank = trimMdEnd(ctx.encoder.continuation(line.prefix));
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
    if (runsInto(line.index + 1)) changes.push({ from: line.to, to: line.to, insert: eol + blank });
  }
  const apartAbove = runsInto(line.index - 1);
  if (apartAbove) changes.push({ from: line.from, to: line.from, insert: blank + eol });
  const paragraph: OutlinePlanNode = { id: node.id, kind: 'paragraph', text: normText(title.split('\n')), children: [] };
  const expected = ctx.plan.place('instead', node, [paragraph, ...node.children]);
  const sorted = [...changes].sort((a, b) => a.from - b.from);
  // the caret goes to the title's start (before an escape), on the line moved down by a blank line above
  const caret = (head.setext ? titleFrom : line.contentFrom) + (apartAbove ? blank.length + eol.length : 0);
  return ctx.caret(sorted, caret, expected, { compare: 'flat' });
}

/**
 * Backspace at the start of a callout's title, or anywhere before it on its line: the `[!type]` goes,
 * as the markup in front of a node's text goes first, and the callout is a plain quote whose first
 * paragraph is the title. Where the body's text follows right below, a quoted blank line keeps the
 * title a paragraph of its own.
 */
function unwrapCallout(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  const text = doc.text;
  const marker = /^\[![^\]]*\][+-]?[ \t]*/.exec(text.slice(line.contentFrom, line.to));
  if (!marker) return notApplicable;
  const titleFrom = line.contentFrom + marker[0].length;
  if (pos > titleFrom) return notApplicable;
  const changes: ChangeSpec[] = [{ from: line.contentFrom, to: titleFrom, insert: '' }];
  const title = text.slice(titleFrom, line.to);
  const next = doc.lines[line.index + 1];
  const separate = node.head!.type === 'callout_title' && !!next && !blankInQuote(ctx, next) && node.children[0]?.kind === 'paragraph' && node.children[0].startLine === line.index + 1;
  // text right below that isn't the quote's (the quote ended with its title) would continue the title
  // as a lazy line, now that it is a paragraph: a blank line keeps it out
  if (node.head!.type === 'callout_title' && next && !next.blank && !next.prefix.some((p) => p.block === node.block)) changes.push({ from: line.to, to: line.to, insert: ctx.ending(line) });
  if (separate) {
    changes.push({ from: line.to, to: line.to, insert: ctx.ending(line) + trimMdEnd(ctx.encoder.continuation(line.prefix)) });
    // the body's lazy lines, past the blank line, would be no longer the quote's: they get its `>`
    const body = node.children[0]!;
    for (let i = body.startLine; i <= body.headEndLine; i++) {
      const lazy = doc.lines[i]!;
      if (!lazy.prefix.some((p) => p.block === node.block)) changes.push({ from: lazy.from, to: lazy.from, insert: ctx.encoder.continuation(line.prefix) });
    }
  }
  const lines = node.head!.type === 'callout_title' ? [title] : [title, ...doc.headLines(node).slice(1)];
  const paragraph: OutlinePlanNode = { id: null, kind: 'paragraph', text: normText(lines), children: [] };
  const expected = ctx.plan.update(node, (n) => ({ ...n, text: '', children: [paragraph, ...node.children] }));
  return ctx.caret(changes, line.contentFrom, expected, { compare: 'flat' });
}

/**
 * Backspace at the start of an item's first paragraph after its text, after a blank line, or Delete
 * at the end of the text: only the blank lines go, the paragraph's lines continuing the text
 * (Backspace19), as Backspace takes back a Shift-Enter: at an item's text Enter makes items, so a
 * paragraph there is Shift-Enter's. An empty one (two Shift-Enters: ShiftEnter11) is an empty line of
 * the text again, held by its placeholder. Null where that doesn't apply. `caretAt`: Delete's caret,
 * which stays where it was.
 */
function joinParagraphAfterGap(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, caretAt?: number): Outcome | null {
  const { doc } = ctx;
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine || node.parent!.kind !== 'item') return null;
  const above = doc.before(node);
  // right after the item's own text, where Enter makes items: after a body paragraph Enter made it
  // too, and the paragraphs join glued, Enter's inverse (Backspace19b)
  if (!above?.head || above.head.type !== 'paragraph' || above !== node.parent) return null;
  const blanks: number[] = [];
  for (let lineNo = node.startLine - 1; lineNo > above.headEndLine; lineNo--) {
    if (!doc.lines[lineNo]!.blank && !blankInQuote(ctx, doc.lines[lineNo]!)) return null;
    blanks.push(lineNo);
  }
  if (blanks.length === 0) return null;
  if (node.children.length > 0) return null;
  const aboveLines = doc.headLines(above);
  const own = [...doc.headLines(node)];
  const changes = removeLines(ctx, blanks.reverse());
  // its first line, continuing the text, escaped where it would underline it or start a block there
  if (normText(own) !== '') {
    const first = trimMdStart(own[0]!);
    const at = ctx.encoder.escape(first, 'continuation').at;
    if (at !== null) {
      changes.push({ from: range.from + at, to: range.from + at, insert: '\\' });
      own[0] = own[0]!.slice(0, own[0]!.length - first.length) + first.slice(0, at) + '\\' + first.slice(at);
    }
  }
  const expected = ctx.plan.remove([node]).setText(above, normText([...aboveLines, ...own]));
  // before an escape it wrote, where typing keeps it one
  const caret = caretAt !== undefined ? mapPos(changes, caretAt, -1) : mapPos(changes, pos, -1);
  return ctx.caret(changes, caret, expected);
}

/**
 * Backspace at the start of a heading's text joins the title into the node above, as an outliner
 * merges any block into the one above; the heading's section then continues the section above it.
 * Its closing `#`s go with it, and so does a setext heading's underline: left in place, it would make
 * the joined text a heading.
 */
function joinHeading(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const { doc } = ctx;
  const head = node.head!;
  if (line.index !== node.startLine) return notApplicable;
  const range = doc.headRange(node)!;
  if (pos > range.from || pos < line.contentFrom) return notApplicable;
  const { prev, quote } = textAbove(ctx, node);
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  if (quote) return reject('not-expressible', "can't join out of a quote");
  const prevRange = doc.headRange(prev);
  if (!prevRange || !prev.head || !joinsInto(prev)) return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  const prevLines = doc.headLines(prev);
  // a setext title's lines, trimmed as text reads them; an ATX title's one line
  const title = head.setext ? doc.headLines(node).map((l) => trimMd(l)) : [doc.text.slice(range.from, range.to)];
  if (title.length > 1 && singleLine(prev)) return reject('not-expressible', singleLine(prev));
  const unwrapped = ctx.plan.place('instead', node, node.children);
  const expected = unwrapped.setText(prev, normText([...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + title[0]!, ...title.slice(1)]));
  const changes = joinChanges(ctx, prev, prevRange, range.from, range.to);
  if (head.setext) {
    // the underline goes, with the line break before it; a blank line sets off text right below
    const underline = doc.lines[head.endLine]!;
    const titleEnd = doc.lines[head.endLine - 1]!.to;
    if (range.to < titleEnd) changes.push({ from: range.to, to: titleEnd, insert: '' });
    changes.push({ from: titleEnd, to: underline.to, insert: gapBelowHeading(ctx, underline, prev) });
  } else {
    const gap = gapBelowHeading(ctx, line, prev);
    if (range.to < line.to || gap) changes.push({ from: range.to, to: line.to, insert: gap });
  }
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
  if (interrupts(ctx, doc.text.slice(below.from + headingLine.contentFrom - headingLine.from, below.to))) return '';
  return ctx.ending(headingLine) + trimMdEnd(ctx.encoder.continuation(headingLine.prefix));
}

/**
 * Delete at the end of a node's text joins the node below to it: Backspace at that node's start,
 * from the other side. At the end of a line inside the text, it joins the next line; on an empty
 * item, it removes the item, and the caret moves on to the node below. Before a quoted blank line the
 * line and its `>` go.
 */
export function joinForward(ctx: CommandContext): Outcome {
  const outcome = joinBelow(ctx);
  return 'status' in outcome && outcome.status === 'notApplicable' ? (deleteQuotedBlank(ctx) ?? outcome) : outcome;
}

/**
 * Delete at a line's end before a quoted blank line, where the host's Delete would leave the blank
 * line's `>` as text: the blank line goes, its `>` with it, as the host's Delete takes an unquoted
 * one. What follows comes up, reading as it would outside a quote (two paragraphs becoming one), or,
 * where it would read otherwise, the key is refused. Null where that doesn't apply.
 */
function deleteQuotedBlank(ctx: CommandContext): Outcome | null {
  const { doc } = ctx;
  const pos = ctx.sel.head;
  const line = doc.lineAt(pos);
  const next = doc.lines[line.index + 1];
  if (!ctx.collapsed || pos !== line.to || !next || next.blank || next.leaf || !blankInQuote(ctx, next)) return null;
  const changes = [{ from: line.to, to: next.to, insert: '' }];
  const after = doc.update(changes);
  // the outline as it is, or the node's text taking in the paragraph below the blank line
  const plans = [ctx.plan];
  const node = doc.nodeAt(pos);
  let lineNo = next.index + 1;
  while (lineNo < doc.lines.length && doc.lines[lineNo]!.blank) lineNo++;
  const below = lineNo < doc.lines.length ? doc.nodeAt(doc.lines[lineNo]!.to) : undefined;
  if (node?.head?.type === 'paragraph' && below?.kind === 'paragraph' && below.startLine === lineNo) {
    plans.push(ctx.plan.place('instead', below, below.children).setText(node, normText([...doc.headLines(node), ...doc.headLines(below)])));
  }
  const expected = plans.find((plan) => plan.differenceFrom(after, doc, 'tree') === null);
  if (!expected) return reject('not-expressible', 'the quoted blank line keeps apart text that would join');
  return ctx.caret(changes, pos, expected);
}

function joinBelow(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return deleteSelection(ctx);
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  const code = joinCodeLines(ctx, node ?? null, pos, 1) ?? joinPayloadLines(ctx, node ?? null, pos, 1);
  if (code) return code;
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);
  // in an item's marker or checkbox, before its text: ourus's, as the markup it is
  if (node.kind === 'item' && line.index === node.startLine && pos >= doc.markerFrom(node.block)) {
    const box = checkbox(ctx, node);
    if (box && pos === box.from + 1) return checkboxCharacter(ctx, node, pos);
    if (box && pos >= box.from && pos < box.to) return deleteCheckbox(ctx, node, box, pos);
    if (pos < (box?.from ?? doc.textStart(pos)) && !isEmptyItem(ctx, node) && !isEmptyWithChildren(ctx, node)) return deleteInMarker(ctx, node, pos);
  }
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
  const emptyItem = (isEmptyItem(ctx, node) || isEmptyWithChildren(ctx, node)) && line.index === node.startLine && pos >= doc.markerTo(node.block) && trimMd(doc.text.slice(pos, line.to)) === '';
  const atEnd = pos === line.to || pos === doc.headRange(node)?.to || (head?.type === 'heading' && !head.setext && pos > (doc.headRange(node)?.to ?? line.to) && trimMd(doc.text.slice(pos, line.to)) === '');
  if (!emptyItem && (line.index !== lastTextLine || !atEnd)) return notApplicable;
  const next = doc.after(node);
  if (!next) return notApplicable;
  // a paragraph below an empty item joins it, as Backspace at the paragraph's start would (Delete28)
  if (isEmptyItem(ctx, node) && next.kind === 'paragraph' && next.head?.type === 'paragraph' && !node.block.task) return join(ctx.at(ownTextFrom(ctx, next)), { forward: true });
  if (isEmptyItem(ctx, node)) {
    const changes = removeLines(ctx, emptyItemLines(ctx, node));
    // at the text start below: after a checkbox, not in it
    const below = doc.textStart(doc.lines[next.startLine]!.from);
    const expected = ctx.plan.remove([node]);
    return orEncoded(ctx, ctx.caret(changes, mapPos(changes, below, 1), expected), below, 1);
  }
  // the caret, for the joins below: at the end of the text (before a heading's closing `#`s)
  const end = doc.headRange(node)?.to ?? pos;
  // an empty item with children takes no special case: its first child joins up into it, as the node
  // below joins any node Delete is at the end of, and that child's children come along; or the key
  // does nothing (`emptyItemWithChildren: refuse`)
  if (isEmptyWithChildren(ctx, node) && doc.config.emptyItemWithChildren === 'refuse') return reject('has-children');
  // an empty paragraph (held by a placeholder) goes with its blank lines: the node below keeps its
  // kind, rather than its text joining into the empty one, and the caret goes to its text's start
  if (node.kind === 'paragraph' && node.children.length === 0 && trimMd(doc.nodeText(node)) === '') return dropEmptyParagraph(ctx, node, next);
  // a heading below loses its marks first, as Backspace at its text start takes them: a paragraph
  // where it is, which Delete again joins; the caret stays (an item whose text is a heading the same)
  if (doc.config.headingEditing === 'text' && (next.kind === 'heading' || (next.kind === 'item' && next.head?.type === 'heading'))) {
    const peeled = join(ctx.at(doc.headRange(next)!.from));
    if (!('changes' in peeled)) return peeled;
    const caret = mapPos(peeled.changes, end, -1);
    return { ...peeled, selection: { anchor: caret, head: caret } };
  }
  // the host would join the block below into the text: Backspace from its side is refused too
  if (next.kind === 'atom' || next.kind === 'quote') return reject('not-expressible', `can't take in the ${next.block.type} below`);
  const nextLine = doc.lines[next.startLine]!;
  // a paragraph of the same item after a blank line: the blank line goes, the paragraph becoming more
  // lines of the text, the caret staying where Delete was (the mirror of Backspace there)
  if (next.kind === 'paragraph') {
    const nextRange = doc.headRange(next);
    const merged = nextRange && joinParagraphAfterGap(ctx, next, doc.lineAt(nextRange.from), nextRange.from, end);
    if (merged) return merged;
  }
  // an item whose text is a heading joins its title (`headingEditing: block`), as Backspace at it does
  if (next.kind === 'item' && next.head?.type === 'heading') return join(ctx.at(ownTextFrom(ctx, next)), { forward: true });
  // an empty task below joins from before its checkbox, as Backspace there does: it goes whole, rather
  // than losing only its checkbox (Backspace after it)
  const task = !doc.headRange(next) ? next.block.task : undefined;
  return join(ctx.at(doc.headRange(next) ? ownTextFrom(ctx, next) : task ? nextLine.from + task.start : nextLine.to), { forward: true });
}

/**
 * The lines that go with an empty item: its own, and its gap, as a node's gap travels with it
 * (Backspace44); last in its scope, its gap stays, separating the scope from what follows, and the
 * blank lines above it go instead, which only set it off from the node above (Backspace44b; see
 * [gaps.md](../../spec/gaps.md)). So one gap is left where there was one.
 */
function emptyItemLines(ctx: CommandContext, node: OutlineNode): number[] {
  const { doc } = ctx;
  const siblings = node.parent!.children;
  if (siblings[siblings.length - 1] !== node) return Array.from({ length: 1 + doc.contentOf(node).gap }, (_, k) => node.startLine + k);
  const lines = [node.startLine];
  for (let k = node.startLine - 1; k > 0 && blankInQuote(ctx, doc.lines[k]!) && doc.nodeAtLine(k) === null; k--) lines.unshift(k);
  return lines;
}

/**
 * An empty paragraph (held by a placeholder) going with its blank lines, the node below `next` keeping
 * its kind, rather than its text joining into the empty one, and the caret going to its text's start.
 */
function dropEmptyParagraph(ctx: CommandContext, node: OutlineNode, next: OutlineNode): Outcome {
  const { doc } = ctx;
  const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
  const expected = ctx.plan.remove([node]);
  const below = doc.textStart(doc.lines[next.startLine]!.from);
  // in a quote its blank lines are quoted, and an item's marker on its line (`- > ◌`) stays: the
  // encoder writes what is left
  if (node.parent?.kind === 'quote') {
    return withPlan(ctx.encode(expected, {}, (written) => ({ anchor: written.map(below, 1), head: written.map(below, 1) })), { drop });
  }
  const lines = [node.startLine];
  for (let lineNo = node.startLine + 1; lineNo < next.startLine && doc.lines[lineNo]!.blank; lineNo++) lines.push(lineNo);
  const changes = removeLines(ctx, lines);
  return ctx.caret(changes, mapPos(changes, below, 1), expected, { drop });
}

/**
 * Delete in an item's marker, before its text. The space right after the marker is markup too: of
 * two or more, one goes and the item stays; the only one, and the item is a paragraph where it is,
 * its text `-a` (the marker kept as text), its children its list, and at the top level the items
 * after it too, as direct outdent makes them; set off by a blank line where it needs one. Refused
 * inside an item, a quote or a paragraph's list, where the paragraph would run into the text above,
 * and before the marker itself.
 */
function deleteInMarker(ctx: CommandContext, node: OutlineNode, pos: number): Outcome {
  const { doc } = ctx;
  const line = doc.lines[node.startLine]!;
  const markerTo = doc.markerTo(node.block);
  if (pos !== markerTo || !isSpaceOrTab(doc.text.charCodeAt(pos))) return reject('not-expressible', "a list marker isn't text");
  // more spaces before the text: one goes, and the item is as it was, the caret at its text
  if (pos + 1 < line.to && isSpaceOrTab(doc.text.charCodeAt(pos + 1))) {
    const changes = [{ from: pos, to: pos + 1, insert: '' }];
    const after = doc.update(changes);
    return ctx.caret(changes, after.textStart(pos), ctx.plan);
  }
  if (!node.head || node.head.type !== 'paragraph') return reject('not-expressible', "a marker without its item's text");
  const parent = node.parent!;
  if (parent.kind === 'item' || parent.kind === 'quote' || parent.kind === 'paragraph') return reject('not-expressible', "without its marker the item would run into the text above");
  const at = parent.children.indexOf(node);
  const later: OutlineNode[] = [];
  for (const sibling of parent.children.slice(at + 1)) {
    if (sibling.kind !== 'item') break;
    later.push(sibling);
  }
  const marker = doc.text.slice(doc.markerFrom(node.block), pos);
  const content = doc.headLines(node);
  const paragraphLines = [marker + (content[0] ?? ''), ...content.slice(1)];
  const children = [...node.children, ...later];
  const paragraph: OutlinePlanNode = { id: node.id, kind: 'paragraph', text: normText(paragraphLines), lines: paragraphLines, children };
  const expected = (later.length > 0 ? ctx.plan.remove(later) : ctx.plan).place('instead', node, [paragraph]);
  const direct = [{ from: pos, to: pos + 1, insert: '' }];
  if (expected.differenceFrom(doc.update(direct), doc, 'tree') === null) return ctx.caret(direct, pos, expected);
  return ctx.encode(expected, {}, (written) => {
    const caret = written.at(paragraph, 0, marker.length);
    return { anchor: caret, head: caret };
  });
}

/** A task's checkbox, the spaces after it included, or null. */
function checkbox(ctx: CommandContext, node: OutlineNode): { from: number; to: number } | null {
  const { doc } = ctx;
  const line = doc.lines[node.startLine]!;
  let from = doc.markerTo(node.block);
  from = skipSpaces(doc.text, from, line.to, 1);
  const box = /^\[[ xX]\](?:[ \t]+|$)/.exec(doc.text.slice(from, line.to));
  return box ? { from, to: from + box[0].length } : null;
}

/**
 * Backspace or Delete inside a task's checkbox: the character between its brackets, at `at`, goes, as
 * in text, the brackets staying (`[]` is text, and a character typed between them makes a checkbox
 * again), so a task is checked or unchecked by hand, as where markup is text to edit.
 */
function checkboxCharacter(ctx: CommandContext, node: OutlineNode, at: number): Outcome {
  const changes = [{ from: at, to: at + 1, insert: '' }];
  const next = ctx.doc.update(changes);
  return ctx.caret(changes, at, ctx.plan.setText(node, next.nodeText(next.nodeAt(at) ?? node)));
}

/**
 * Delete before a task's text, right before its checkbox or after the character inside it: the
 * checkbox goes, the task a plain item, as Backspace right after it does; with `taskEditing: text`,
 * the character after the caret.
 */
function deleteCheckbox(ctx: CommandContext, node: OutlineNode, box: { from: number; to: number }, pos: number): Outcome {
  const { doc } = ctx;
  const lines = doc.headLines(node);
  const first = trimMdStart((lines[0] ?? ''));
  const changes = doc.config.taskEditing === 'text' ? [{ from: pos, to: pos + 1, insert: '' }] : [{ from: box.from, to: box.to, insert: '' }];
  const offset = changes[0]!.from - box.from;
  lines[0] = first.slice(0, offset) + first.slice(offset + changes[0]!.to - changes[0]!.from);
  // the checkbox gone, the text starts the item's: escaped where it would start a block there
  if (doc.config.taskEditing !== 'text') {
    const escaped = ctx.encoder.escape(lines[0], 'start', lines.slice(1).map((l) => trimMdStart(l)));
    if (escaped.at !== null) changes.push({ from: box.to + escaped.at, to: box.to + escaped.at, insert: '\\' });
    lines[0] = escaped.text;
  }
  const caret = changes[0]!.from;
  const held = normText(lines) === '' && followsParentText(ctx, node);
  return ctx.caret(changes, caret, ctx.plan.setText(node, normText(lines)), { ...(held ? { placeholders: [caret] } : {}) });
}
