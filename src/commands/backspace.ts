// Backspace and Cmd-Backspace (spec/backspace.md): a node's boundary with the one
// above, and the line's text deleted back to its start. The commands say what the texts become and
// which nodes go; `done()` escapes what then starts a line, sets apart what would run together, and
// holds a line it empties with a placeholder.

import { OurusProse, OurusAtom, type OurusNode } from '../doc/index.ts';
import type { OurusDraft } from '../writer/index.ts';
import { isSpaceOrTab, lineOf } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { joinIntoQuote, joinLineInQuote, joinQuoteUp, quoteAtomAt } from './quote.ts';
import { codeAt, editInCode, joinInCode, onDelimiterLine } from './code.ts';
import { deleteEmptyPair } from './typing.ts';
import { deleteHeldSpace, hiddenSpacesAt, inMarkup, leaveList, pastPrefix, textActedOnAt, textEnd, textStart, unquote, withTextlessParents } from './util.ts';

/**
 * From the caret back to the start of its line's text, past a checkbox or `#`s, the spaces after the
 * caret going too (left after a marker, they would move the content column); at the text's start,
 * Backspace. A fence's line and a setext underline are markup with no text: refused. With
 * `taskEditing: text`, from right after the checkbox it goes, as text (SoftBackspace10). In code,
 * from the code line's start, past its containers' prefix. A line emptied inside a text goes with
 * its line break (the first), or breaks the text into two paragraphs (a later one).
 */
export function deleteSoftLineBackwardCommand(ctx: CommandContext): CommandOutcome {
  ctx = pastPrefix(ctx);
  if (!ctx.collapsed) return null;
  const code = codeAt(ctx);
  if (code) {
    if (onDelimiterLine(code.text, code.offset)) return reject('not-expressible', 'a fence has no text');
    // the code line's, from its start past the containers' prefix (which the host's would take, ending
    // them) and indented code's columns, at its start Backspace; what is left may make a fence of code
    // (at the text's start, its first line's: `lastIndexOf` would read a line break there before it)
    const line = code.offset && code.text.text.lastIndexOf('\n', code.offset - 1) + 1;
    // (indented code's text past its four columns)
    const start = code.text.frame.find((p) => p.part === 'indent' && p.from === line && p.to <= code.offset)?.to ?? line;
    if (code.offset === start) return deleteContentBackwardCommand(ctx);
    return editInCode(ctx, code, start, code.offset, '', { host: false });
  }
  const at = ctx.from;
  if (at.zone === 'frame' && at.part === 'underline') return reject('not-expressible', 'a setext underline has no text');
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return deleteContentBackwardCommand(ctx);
  const { node, text, offset } = at;
  // (at the underline's end)
  if (text.frame.some((p) => p.part === 'underline' && offset > p.from)) return reject('not-expressible', 'a setext underline has no text');
  const task = text.frame.find((p) => p.part === 'task');
  if (task && offset === task.to && ctx.config.taskEditing === 'text') return ctx.apply(ctx.draft().setText(node, text.splice(task.from, task.to)).setCaret(node, task.from, -1));
  const s = text.text;
  const line = lineOf(s, offset);
  const start = text.textStart(line);
  if (offset <= start) return deleteContentBackwardCommand(ctx);
  const end = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  let to = offset;
  while (to < end && isSpaceOrTab(s.charCodeAt(to))) to++;
  const draft = ctx.draft();
  // a line emptied inside the text, which Markdown holds in no text: the first one's line break goes
  // with it, the next line's padding too (an item's text starts below its marker instead); a later
  // one breaks the text into two paragraphs, the caret on the blank line between, as Shift-Enter does
  // a setext title's last line emptied, its underline the frame's: the line goes with the line break
  // before it; the title's only one, the heading an empty ATX one, which Markdown holds (`# `)
  const underline = text.frame.find((p) => p.part === 'underline');
  if (to === end && underline && end + 1 >= underline.from) {
    if (line > 0) return ctx.apply(draft.setText(node, text.splice(start - 1, end)).setCaret(node, start - 1, -1));
    const lead = `${'#'.repeat(text.heading?.level ?? 1)} `;
    return ctx.apply(draft.setText(node, new OurusProse('heading', text.item, lead)).setCaret(node, lead.length, -1));
  }
  if (to === end && end < s.length) {
    let rest = end + 1;
    while (rest < s.length && isSpaceOrTab(s.charCodeAt(rest))) rest++;
    if (line === 0 && node.kind !== 'item') {
      const joined = text.splice(start, rest);
      // (a quote's first paragraph that would read as its callout's title: not done yet)
      if (node.becomesTitle(joined)) return null;
      return ctx.apply(draft.setText(node, joined).setCaret(node, start, -1));
    }
    if (line > 0 && node.kind !== 'heading') {
      const into = node.kind === 'item' ? 'child' : 'sibling';
      draft.split(node, start - 1, { to: rest, children: into === 'child' ? 'stay' : 'follow', into, kind: 'paragraph' });
      return ctx.apply(draft.gap(node, 1).select({ blank: node, line: 0 }, { blank: node, line: 0 }));
    }
  }
  return ctx.apply(draft.setText(node, text.splice(start, to)).setCaret(node, start, -1));
}

/**
 * `taskEditing: unwrap` (SiYuan, BlockNote): the task a paragraph where it is, its checkbox gone with
 * its marker, its list split there; `text`, its text without the checkbox, the caret at its start.
 */
function unwrapTask(draft: OurusDraft, node: OurusNode, text: OurusProse): OurusDraft {
  return draft.convert(node, 'paragraph').setText(node, text).setCaret(node, 0, -1);
}

/**
 * Backspace (spec/backspace.md). In the middle of a text it is the host's (rule 9); at a later line's
 * start that line joins the one above. At the text's start: the markup in front of it goes first, a
 * checkbox (`taskEditing: checkbox`) or a heading's `#`s and underline (`headingEditing: text`)
 * (rule 2); an empty item goes, the caret to the end of the text above (rule 3); else the node joins
 * the node above in its container (rules 4, 5); with nothing above, the next layer of markup goes
 * (rule 6); a selection across nodes goes, its ends joining (rule 8). A held space before the caret
 * goes; a callout's `[!type]` goes as a unit; on a blank line at a text's column, the line goes. With
 * `enterAtTextStart: stay`, at a paragraph's start the blank lines above it go one a press while more
 * than one is there. (`enterSplitSpace: start` isn't built: it acts as the default.)
 */
export function deleteContentBackwardCommand(ctx: CommandContext): CommandOutcome {
  const was = ctx;
  ctx = pastPrefix(ctx);
  // (from before the text's line, in its prefix, past the spaces Markdown hides before it: at their
  // start, where the node joins the one above, not past them, where a press is the host's, which acts
  // where the caret is, before the line)
  if (ctx !== was) {
    const hidden = hiddenSpacesAt(ctx, ctx.selection.head);
    if (hidden && ctx.selection.head > hidden.from) ctx = ctx.at(hidden.from);
  }
  const config = ctx.config;
  if (!ctx.collapsed) return deleteSelectionAcross(ctx);
  if (ctx.from.zone === 'gap') return blankLineBack(ctx, ctx.from.owner);
  const code = codeAt(ctx);
  if (code) return joinInCode(ctx, code, -1);
  const head = ctx.selection.head;
  // in the spaces Markdown hides before a text (a split's that kept them, padding written so): the
  // user's whitespace, not markup: past their start the host's, a space a press (Enter65j); at it,
  // the node joins the one above, the spaces with it (Enter65)
  const hidden = hiddenSpacesAt(ctx, head);
  if (hidden && head > hidden.from) return deferToHost();
  // (on the line after its marker, the line break goes, the spaces staying before the text: ShiftEnter13)
  const breakBelow = hidden?.text.frame.find((p) => p.part === 'below');
  if (hidden && breakBelow && hidden.node.kind === 'item') {
    const spaces = ' '.repeat(hidden.to - hidden.from);
    return ctx.apply(ctx.draft().setText(hidden.node, hidden.text.splice(breakBelow.from, breakBelow.to, spaces)).setCaret(hidden.node, breakBelow.from, -1));
  }
  if (hidden) {
    // (an item's marker first, with `body` and `unwrap`)
    const unwrapped = hidden.node.kind !== 'item' || config.backspaceAtItemStart === 'join' ? null : config.backspaceAtItemStart === 'logseq' ? unnumberItem(ctx, hidden.node, hidden.text) : unwrapItem(ctx, hidden.node, hidden.text, hidden.to - hidden.from);
    return unwrapped ?? joinUp(ctx, hidden.node, hidden.text);
  }
  let at = ctx.from;
  // at the start of a quote read as an atom, before its `>`: it joins the text above as it is written
  if (ctx.collapsed && at.zone === 'text' && at.text instanceof OurusAtom && at.text.type === 'blockquote' && at.offset === 0) return joinQuoteUp(ctx, at.node, at.text);
  // (right after a later line's `> `: it joins the line above)
  const inQuote = quoteAtomAt(ctx);
  const lineBack = inQuote && joinLineInQuote(ctx, inQuote, false);
  if (lineBack) return lineBack;
  // before a checkbox, in the marker: at the item's start, where the item joins (TO1), not past its checkbox
  const beforeBox = at.zone === 'marker' || (at.zone === 'frame' && at.part === 'task' && at.offset === 0);
  const markup = inMarkup(ctx.doc, at, head);
  if (markup && config.markup === 'text') return deferToHost('the caret is in markup');
  // (at its line's start, before a marker or a heading's `#`s: at the text start, Backspace2)
  if (markup || at.zone === 'marker' || (at.zone === 'frame' && at.part === 'heading')) {
    const text = textActedOnAt(ctx, head);
    if (!text) return null;
    at = { zone: 'text', ...text };
  }
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return null;
  const { node, text, offset } = at;
  const held = deleteHeldSpace(ctx, node, text, offset, -1);
  if (held) return held;
  const s = text.text;
  const line = lineOf(s, offset);
  const lineStart = text.textStart(line);
  let first = lineStart;
  while (first < s.length && isSpaceOrTab(s.charCodeAt(first))) first++;
  // past the line's leading spaces, in the text: the host's (its edit keeps a placeholder where it
  // would empty a node or widen an item's padding), but in an empty pair of backticks
  if (offset > first) return deleteEmptyPair(ctx, node, text, offset) ?? deferToHost();
  const draft = ctx.draft();
  if (lineStart !== text.textStart(0)) {
    // at a later line's start: it joins the line above, its spaces with it, the caret staying before
    // or past them, where it was (a Shift-Enter's break taken back: ShiftEnter21); a quote's line its
    // `> ` with the break
    const begin = s.lastIndexOf('\n', lineStart - 1) + 1;
    const joined = text.splice(begin - 1, lineStart);
    // a quote's first paragraph that would read as its callout's title: not done yet
    if (node.becomesTitle(joined)) return null;
    draft.setText(node, joined).setCaret(node, offset - (lineStart - begin + 1), -1);
    return ctx.apply(draft);
  }
  // text alone on the line after its marker (Shift-Enter at the text start made it): the break goes
  // (ShiftEnter13)
  const below = text.frame.find((p) => p.part === 'below');
  if (below && node.kind === 'item') {
    draft.setText(node, text.splice(below.from, below.to)).setCaret(node, below.from, -1);
    return ctx.apply(draft);
  }
  // the markup in front of the text goes first, as a unit
  const task = text.frame.find((p) => p.part === 'task');
  // (`taskEditing: unwrap`: a paragraph where it is, its checkbox going with its marker, TaskBackspace3b;
  // an empty one, an empty paragraph set off as an item leaving its list is, TaskBackspace3c)
  if (task && !beforeBox && config.taskEditing === 'unwrap' && node.kind === 'item') {
    return text.empty ? leaveList(ctx, node) : ctx.apply(unwrapTask(draft, node, text.asItem(false).splice(task.from, task.to)));
  }
  // (`taskEditing: block`: the task joins as any item, its checkbox going with its marker)
  if (task && !beforeBox && config.taskEditing !== 'block') {
    // (`text`: one character of it, the text starting with the rest: TaskBackspace5)
    if (config.taskEditing === 'text') return ctx.apply(draft.setText(node, text.splice(offset - 1, offset)).setCaret(node, offset - 1, -1));
    draft.setText(node, text.splice(task.from, task.to)).setCaret(node, task.from, -1);
    return ctx.apply(draft);
  }
  // a heading's marks go (an item's too); with `block`, the title joins the node above
  if (text.type === 'heading') {
    if (config.headingEditing === 'block') return joinUp(ctx, node, text);
    // (an ATX title's closing `#`s too)
    const close = text.frame.find((p) => p.part === 'close');
    const open = text.frame.find((p) => p.part === 'heading') ?? text.frame.find((p) => p.part === 'underline')!;
    draft.setText(node, (close ? text.splice(close.from, close.to) : text).splice(open.from, open.to)).setCaret(node, open.part === 'heading' ? open.from : 0, -1);
    return ctx.apply(draft);
  }
  // a quote's `>`s go, every line's (`quotes: text`): its text a paragraph where it is; first under an
  // empty item, where no paragraph can follow nothing, joining it (Quote94)
  if (text.type === 'quote') {
    const parent = node.index === 0 && node.parent?.kind === 'item' ? node.parent : null;
    const parentText = parent ? ctx.doc.textOf(parent) : null;
    if (parent && node.kind === 'paragraph' && !node.children.length && parentText instanceof OurusProse && parentText.empty) {
      // (its checkbox kept: the text the task's)
      return ctx.apply(draft.setText(parent, parentText.concat(unquote(text))).remove([node]).setCaret(parent, parentText.text.length, -1));
    }
    return ctx.apply(draft.setText(node, unquote(text)).setCaret(node, 0, -1));
  }
  // a callout's `[!type]` goes as a unit: a plain quote, its title its first paragraph (Quote57, 58)
  if (text.type === 'title') {
    const callout = text.frame.find((p) => p.part === 'callout')!;
    const rest = text.slice(callout.to);
    const title = new OurusProse('paragraph', false, rest.text, rest.marks);
    if (title.empty) return null;
    const id = draft.create('paragraph', title);
    // (the blank lines after the title, the paragraph's now)
    return ctx.apply(draft.setText(node, null).append(node, 'first', [id]).gap(id, node.gap).gap(node, 0).setCaret(id, 0, -1));
  }
  // with `enterAtTextStart: stay`, the blank lines Enter opens above a paragraph go one a press while
  // more than one is there (a join across them would merge the two: Backspace12e), and at the
  // document's start, where there is nothing to join (Backspace43c)
  if (config.enterAtTextStart === 'stay' && node.kind === 'paragraph') {
    const above = node.preceding;
    const leading = !above || above.kind === 'root' ? ctx.doc.leadingBlankLines : null;
    if (leading) return ctx.apply(draft.leadingBlankLines(leading - 1).setCaret(node, offset, -1));
    if (above && above.kind !== 'root' && above.gap > 1) return ctx.apply(draft.gap(above, above.gap - 1).setCaret(node, offset, -1));
  }
  // an item's marker first, with `body` and `unwrap`, where it would join the node above
  // (with `logseq` a numbered item's number, an empty one's too)
  if (config.backspaceAtItemStart === 'logseq' && node.kind === 'item' && text.type === 'paragraph') {
    const unnumbered = unnumberItem(ctx, node, text);
    if (unnumbered) return unnumbered;
  }
  if (config.backspaceAtItemStart !== 'join' && config.backspaceAtItemStart !== 'logseq' && node.kind === 'item' && text.type === 'paragraph' && !text.empty) {
    const unwrapped = unwrapItem(ctx, node, text);
    if (unwrapped) return unwrapped;
  }
  return joinUp(ctx, node, text);
}

/**
 * `backspaceAtItemStart: logseq`, a quirk (Logseq's and Tine's mechanics, numbering a block's
 * property there; Quirk3): a numbered item's number goes first, the item a bulleted one where it is
 * (made anew, a list form being a new item's), its children with it, its list split there. Null for
 * a bulleted item, which joins.
 */
function unnumberItem(ctx: CommandContext, node: OurusNode, text: OurusProse): CommandOutcome | null {
  if (ctx.doc.listOf(node)?.block.attrs.list?.type !== 'ordered') return null;
  const draft = ctx.draft();
  const id = draft.create('item', text);
  // (a bullet, a list of its own however the list around it is numbered: one no item beside it has,
  // or it would run into that one's list)
  const beside = [-1, 1].map((d) => node.parent?.children[node.index + d]).filter((n) => n?.kind === 'item').map((n) => ctx.doc.markerOf(n!));
  draft.listForm(id, ['-', '*', '+'].find((b) => !beside.includes(b)) ?? '-', true);
  const children = [...node.children];
  if (children.length) draft.remove(children).append(id, 'last', children);
  draft.place('before', node, [id]).remove([node]);
  return ctx.apply(draft.setCaret(id, textStart(text), -1));
}

/**
 * `backspaceAtItemStart`'s `body` and `unwrap` (Backspace50, Backspace50b): the item a paragraph, at
 * the end of the item above it with `body` (after its children), where it is with `unwrap` and as a
 * first child, its own children with it, the caret at its start. Null with nothing above it in its
 * container (`backspaceAtTopItem`'s).
 */
function unwrapItem(ctx: CommandContext, node: OurusNode, text: OurusProse, spaces = 0): CommandOutcome | null {
  const above = node.preceding;
  if (!above || above.kind === 'root') return null;
  // (under an item with no text, or an empty one, it joins it: no paragraph can follow nothing there)
  const parentText = above === node.parent ? ctx.doc.textOf(above) : undefined;
  if (parentText === null || (parentText instanceof OurusProse && parentText.empty)) return null;
  const draft = ctx.draft();
  // (`body`: into the item above in its list; one with no text holds no paragraph, and joins)
  const sibling = node.parent?.children[node.index - 1];
  const list = (n: OurusNode): unknown => ctx.doc.listOf(n)?.block;
  if (ctx.config.backspaceAtItemStart === 'body' && sibling?.kind === 'item' && list(sibling) === list(node)) {
    const upper = ctx.doc.textOf(sibling);
    if (!(upper instanceof OurusProse) || upper.empty) return null;
    draft.remove([node]).append(sibling, 'last', [node]);
  }
  draft.convert(node, 'paragraph');
  // with `taskEditing: block` its checkbox goes with its marker; the spaces Markdown hid after the
  // marker are the paragraph's text, the caret before them
  const task = text.frame.find((p) => p.part === 'task');
  let own = task && ctx.config.taskEditing === 'block' ? text.asItem(false).splice(task.from, task.to) : null;
  if (spaces) own = (own ?? text.asItem(false)).splice(0, 0, ' '.repeat(spaces));
  if (own) draft.setText(node, own);
  return ctx.apply(draft.setCaret(node, 0, -1));
}

/**
 * Backspace on a blank line at its node's text column, where Shift-Enter puts the caret: the line goes,
 * the caret on the blank line above, or at the end of the text (ShiftEnter11, Fence32: where markup is
 * text, past a closing fence). On any other blank line, the host's.
 */
function blankLineBack(ctx: CommandContext, owner: OurusNode): CommandOutcome {
  const head = ctx.selection.head;
  const text = ctx.doc.textOf(owner);
  const k = ctx.doc.lineAt(head).index - owner.textLastLine - 1;
  // (at a line's start, the host's deletes the line break just as well)
  if (!text || owner.children.length || k < 0 || k >= owner.gap || head === ctx.doc.lineAt(head).from || !ctx.doc.atTextColumn(head, owner)) return deferToHost();
  // the one quoted blank line between two paragraphs of a quote, `quotes: text` (Shift-Enter's at a
  // line's end in a quote's text): they join, the next its text's next line, as the host's Backspace
  // joins them out of a quote; one paragraph left, the quote is its text again
  const next = owner.next;
  if (ctx.config.quotes === 'text' && owner.parent?.kind === 'quote' && owner.gap === 1 && owner.kind === 'paragraph' && next?.kind === 'paragraph' && text instanceof OurusProse) {
    const draft = ctx.draft();
    draft.join(owner, next, { separator: '\n' });
    return ctx.apply(draft.setCaret(owner, textEnd(text), -1));
  }
  // (its text set again: where what follows would then continue it, `done()` keeps the line)
  const draft = ctx.draft().gap(owner, owner.gap - 1).setText(owner, text);
  if (k > 0) return ctx.apply(draft.select({ blank: owner, line: k - 1 }, { blank: owner, line: k - 1 }));
  return ctx.apply(draft.setCaret(owner, text instanceof OurusAtom && ctx.config.markup === 'text' ? text.text.length : textEnd(text), -1));
}

/**
 * `node` (with `text`, at its start) joins the node above it in its container: an empty item goes;
 * a paragraph right after an item's text continues it as its next line (as Backspace takes back a
 * Shift-Enter); else the texts join, glued, `node`'s children going to the node above (its last
 * ones where it is an item that isn't the parent), else into its place. The caret at the seam.
 */
export function joinUp(ctx: CommandContext, node: OurusNode, text: OurusProse, caretAtSeam = true): CommandOutcome {
  const doc = ctx.doc;
  const config = ctx.config;
  let above = node.preceding;
  // right after a folded node, what is above is its text, not its hidden descendants' (Fold15)
  // (where the node isn't in that fold itself)
  const outside = (fold: OurusNode): boolean => {
    for (let up = node.parent; up; up = up.parent) if (up.id === fold.id) return false;
    return true;
  };
  for (let up = above?.parent; up && up.kind !== 'root'; up = up.parent) if (doc.zoomFolded.has(up.id) && outside(up)) above = up;
  // first in its container: the next layer of markup goes (rule 6)
  if (!above || above.kind === 'root' || (above === node.parent && !doc.textOf(above))) return caretAtSeam ? firstInContainer(ctx, node, text) : null;
  const upper = doc.textOf(above);
  if (!upper) return null;
  // into a quote read as an atom above: as it is written, on its last line (`quotes: atom`)
  if (upper instanceof OurusAtom && upper.type === 'blockquote' && above !== node.parent) return joinIntoQuote(ctx, above, upper, node);
  // into a callout's title, which in Obsidian is a line of its own (Quote60, 62)
  if (upper instanceof OurusProse && upper.type === 'title' && doc.config.flavor === 'obsidian' && text.body.includes('\n')) return reject('not-expressible', "a callout's title is a single line");
  const draft = ctx.draft();
  // an empty item with children goes, they going to the node above: its last ones where it is an
  // item that isn't the parent, else into its place, which `emptyItemWithChildren: refuse` refuses
  if (node.kind === 'item' && text.empty && node.children.length) {
    const adopt = above.kind === 'item' && above !== node.parent && node.parent?.kind !== 'quote';
    if (!adopt && config.emptyItemWithChildren === 'refuse') return reject('has-children');
    // (placed, not dissolved: they join the list it was in, lined up with it)
    if (adopt) draft.remove(node.children).append(above, 'last', node.children).remove([node]);
    else draft.remove(node.children).place('before', node, node.children).remove([node]);
    draft.setCaret(above, textEnd(upper), -1);
    return ctx.apply(draft);
  }
  // into an empty item above: the text moves up into it, its own checkbox and all, the empty item's
  // going; its children after the item's (into its place, where the item is its parent: TaskBackspace1);
  // the caret after its checkbox
  if (above.kind === 'item' && upper instanceof OurusProse && upper.empty && !text.empty && (node.kind === 'item' || node.kind === 'paragraph')) {
    const moved = text.asItem(true);
    if (node.children.length) {
      draft.remove(node.children);
      if (above === node.parent) draft.place('before', node, node.children);
      else draft.append(above, 'last', node.children);
    }
    draft.remove([node]);
    draft.setText(above, moved).setCaret(above, moved.textStart(0), -1);
    return ctx.apply(draft);
  }
  if (above.kind === 'item' && upper instanceof OurusProse && upper.empty) return null;
  // right after an item's text, a paragraph's lines continue it, an empty one an empty line of it
  // (as Backspace takes back a Shift-Enter: ShiftEnter11)
  const lineOfAbove = node.kind === 'paragraph' && above === node.parent && above.kind === 'item' && node.index === 0 && upper instanceof OurusProse;
  // an empty node goes, the node above taking its gap as a join does, the caret to the end of the
  // text above (after an atom's, at its end: Fence60); an empty paragraph's list stays, in its place
  // (Backspace20)
  if (!lineOfAbove && text.empty && (node.kind === 'paragraph' || !node.children.length)) {
    // (an empty item at the code's text end, where typing goes on: Backspace28; an empty paragraph past
    // it, where markup is text)
    const atEnd = upper instanceof OurusProse || node.kind === 'item' || ctx.config.markup === 'decorated';
    draft.dissolve(node).gap(above, node.gap).setCaret(above, atEnd ? textEnd(upper) : upper.text.length, -1);
    return ctx.apply(draft);
  }
  if (!(upper instanceof OurusProse)) return reject('not-expressible', `can't join into ${above.kind === 'atom' ? above.block.type : 'that'}`);
  if (node.kind !== 'item' && node.kind !== 'paragraph' && node.kind !== 'heading') return null;
  const lines = text.body.split('\n').length;
  if (lines > 1 && upper.heading?.form === 'atx') return reject('not-expressible', 'an ATX title is a single line');
  // (a heading's title alone: its section stays where it is)
  const adopt = above.kind === 'item' && above !== node.parent && node.kind !== 'heading';
  if (!adopt && node.kind !== 'heading' && node.children.length && config.joinWithChildren === 'refuse') return reject('has-children');
  // (and where they'd go into an item that isn't childless at their parent's depth: down a level, into
  // the last descendant above, or among the children it has, a folded one's: Backspace45c, Fold15b)
  if (adopt && node.children.length && config.joinWithChildren === 'refuse' && (above.children.length || above.depth !== node.depth)) return reject('has-children');
  // (a heading's closing marks go too: an ATX title's `#`s, a setext underline)
  const close = node.kind === 'heading' ? text.frame.find((p) => p.part === 'close' || p.part === 'underline') : undefined;
  if (close) draft.setText(node, text.splice(close.from, close.to));
  // (the spaces Markdown hid before the text, the user's, joined as spaces)
  const hidden = doc.hiddenSpaces(node);
  const separator = (lineOfAbove ? '\n' : '') + ' '.repeat(hidden ? hidden.to - hidden.from : 0);
  const end = textEnd(upper);
  const id = draft.join(above, node, { children: adopt ? 'adopt' : 'place', separator });
  // Backspace's caret at the seam, before those spaces; Delete's where it was, at the upper text's end
  draft.setCaret(id, caretAtSeam ? end + (lineOfAbove ? 1 : 0) : end, -1);
  return ctx.apply(draft);
}

/**
 * Backspace at the start of a node with nothing above it in its container (rule 6; rule 3 for an
 * empty one): an item loses its marker, a paragraph where it is (`backspaceAtTopItem: unwrap`), or
 * nothing happens (`refuse`); a paragraph first in a quote without a title leaves it, before it, the
 * rest staying quoted. An empty item goes, the caret to the text below; with children, they take its
 * place (`emptyItemWithChildren: lift`), or nothing happens (`refuse`); the document's only one goes,
 * the document empty. An empty paragraph goes as an empty item does. An item on its parent's marker
 * line (`- - a`) gives its text to the parent; a paragraph first in a quote that is an item's first
 * block, the item having no text or an empty one, is the item's text. At the document's start,
 * refused. Null for the others, which ourus doesn't do yet (unsupported).
 */
function firstInContainer(ctx: CommandContext, node: OurusNode, text: OurusProse): CommandOutcome {
  const doc = ctx.doc;
  const config = ctx.config;
  const parent = node.parent!;
  const draft = ctx.draft();
  if ((node.kind === 'item' || node.kind === 'paragraph') && text.empty) {
    if (node.kind === 'item' && node.children.length) {
      if (config.emptyItemWithChildren === 'refuse') return reject('has-children');
      const first = node.children[0]!;
      const firstText = doc.textOf(first);
      if (!firstText) return null;
      draft.dissolve(node).setCaret(first, textStart(firstText), 1);
      return ctx.apply(draft);
    }
    // (an empty paragraph's list stays, in its place)
    const next = node.children[0] ?? node.afterSubtree;
    const nextText = next ? doc.textOf(next) : null;
    // the document's only node goes, with the quotes it is all of (Backspace17e, Quote59)
    if (!next && !node.children.length) {
      const gone = withTextlessParents(doc, [node])[0]!;
      if (gone.parent?.kind === 'root' && gone.parent.children.length === 1) return ctx.apply(draft.remove([gone]).setCaretAt(0));
    }
    if (!next || !nextText) return null;
    // (with the quotes it is all of, which would hold nothing: `> - ┃⏎# h`)
    const gone = node.children.length ? [node] : withTextlessParents(doc, [node]);
    if (gone[0] !== node) return ctx.apply(draft.remove(gone).setCaret(next, textStart(nextText), 1));
    draft.dissolve(node).setCaret(next, textStart(nextText), 1);
    return ctx.apply(draft);
  }
  if (node.kind === 'item') {
    // on its parent's marker line (`- - a`), its text is the parent's, its children in its place
    if (parent.kind === 'item' && parent.startLine === node.startLine) {
      if (doc.textOf(parent)) return null;
      const moved = text.asItem(true);
      draft.dissolve(node).setText(parent, moved).setCaret(parent, moved.textStart(0), -1);
      return ctx.apply(draft);
    }
    if (config.backspaceAtTopItem === 'refuse' || text.type !== 'paragraph') return reject('nothing-above');
    // (first in a quote with no title: a paragraph starting `[!type]` would be its callout's title, where
    // the flavor has no escape for it, as Obsidian's has: `\[!note]`)
    if (node.becomesTitle(text) && !ctx.doc.mdTree.flavor.has('callouts')) return reject('not-expressible', "the text would read as the quote's callout title");
    draft.convert(node, 'paragraph');
    // with `taskEditing: block` its checkbox goes with its marker
    const task = text.frame.find((p) => p.part === 'task');
    if (task && config.taskEditing === 'block') draft.setText(node, text.asItem(false).splice(task.from, task.to));
    draft.setCaret(node, 0, -1);
    return ctx.apply(draft);
  }
  if (node.kind === 'paragraph' && parent.kind === 'quote' && !doc.textOf(parent) && !text.empty) {
    // first in an item with no text, or an empty one: it is the item's text then (Quote75, Quote94)
    const item = parent.parent;
    const own = item?.kind === 'item' && parent.index === 0 ? doc.textOf(item) : undefined;
    // (one line of it: its lazy lines would read otherwise where the item's text is)
    if (item && (own === null || (own instanceof OurusProse && own.empty)) && !text.body.includes('\n')) {
      const merged = own ? own.concat(text) : text.asItem(true);
      draft.remove([node]).setText(item, merged).setCaret(item, own ? own.text.length : 0, -1);
      if (parent.children.length === 1) draft.remove([parent]);
      return ctx.apply(draft);
    }
    draft.remove([node]).place('before', parent, [node]);
    if (parent.children.length === 1) draft.remove([parent]);
    draft.setCaret(node, 0, -1);
    return ctx.apply(draft);
  }
  // at the document's start
  if (parent.kind === 'root') return reject('nothing-above');
  return null;
}

/**
 * A selection across nodes, deleted (spec/backspace.md rule 8, spec/delete.md rule 8): the selected
 * text goes, and the two ends join, as Backspace at the second end's start would join them, the nodes
 * between going with their subtrees; the caret at the first end. Within one node's text it is the
 * host's, and within a block of code, but where it would make a fence (`editInCode`). Null where an end isn't in a node's text, or the second end is under a node between, which
 * it is unsupported. `then` goes on from there (Enter splits at the caret), null where it can't.
 */
export function deleteSelectionAcross(ctx: CommandContext, then?: (draft: OurusDraft, node: OurusNode, offset: number) => OurusDraft | null): CommandOutcome {
  // within a block of code, the host's, but where what it leaves would make a fence of code
  const code = then ? null : codeAt(ctx);
  if (code) return editInCode(ctx, code, code.offset, code.to, '');
  const from = ctx.from;
  const to = ctx.to;
  if (from.zone !== 'text' || to.zone !== 'text' || !(from.text instanceof OurusProse) || !(to.text instanceof OurusProse)) return null;
  // within one text, the host's (a cut deletes it so too: `deleteSelected`)
  if (from.node === to.node) return deferToHost();
  const upper = from.node;
  const lower = to.node;
  if (lower.kind !== 'item' && lower.kind !== 'paragraph') return null;
  // an end inside a frame (a checkbox, text below a marker): not done yet
  if (from.offset < from.text.textStart(0) || to.offset < to.text.textStart(0)) return null;
  // the nodes between, in document order: the topmost of them go; none may hold the second end
  const between: OurusNode[] = [];
  for (let n: OurusNode | null = upper.children[0] ?? upper.afterSubtree; n && n !== lower; n = n.children[0] ?? n.afterSubtree) {
    if (isAbove(n, lower)) return null;
    if (!between.some((b) => isAbove(b, n!))) between.push(n);
  }
  if (isAbove(upper, lower) && !between.length && lower.parent !== upper) return null;
  const draft = ctx.draft();
  if (between.length) draft.remove(between);
  // where nothing of the upper text is left, what the lower text starts with is the text's start: its
  // blanks would be padding
  let rest = to.text.slice(to.offset);
  if (from.offset <= from.text.textStart(0)) {
    let k = 0;
    while (k < rest.text.length && isSpaceOrTab(rest.text.charCodeAt(k))) k++;
    rest = rest.slice(k);
    // a line break first would leave the text's first line empty: not done yet
    if (rest.text.startsWith('\n')) return null;
  }
  // (a callout's title holds one line, as a join into it refuses)
  if (from.text.type === 'title' && ctx.config.flavor === 'obsidian' && rest.text.includes('\n')) return reject('not-expressible', "a callout's title is a single line");
  draft.setText(upper, from.text.slice(0, from.offset)).setText(lower, rest);
  const adopt = upper.kind === 'item' && upper !== lower.parent;
  draft.join(upper, lower, { children: adopt ? 'adopt' : 'place' });
  if (!then) return ctx.apply(draft.setCaret(upper, from.offset, -1));
  const next = then(draft, upper, from.offset);
  return next && ctx.apply(next);
}

/** Whether `a` is an ancestor of `b`. */
function isAbove(a: OurusNode, b: OurusNode): boolean {
  for (let up = b.parent; up; up = up.parent) if (up === a) return true;
  return false;
}
