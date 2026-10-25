// Delete (spec/delete.md): a node's boundary with the one below, Backspace's from
// the other side. The command says what the texts become and which nodes go; `done()` and the writer
// do the rest.

import { ProseText, AtomText, type OutlineNode } from '../doc/index.ts';
import { deleteSelectionAcross, joinUp } from './backspace.ts';
import { codeAt, joinCodeItemUp, joinInCode } from './code.ts';
import { lineOf } from '../text/index.ts';
import { deferToHost, reject, type CommandContext, type CommandOutcome } from './context.ts';
import { joinIntoQuote, joinLineInQuote, joinQuoteUp, quoteAtomAt } from './quote.ts';
import { deleteHeldSpace, hiddenSpacesAt, inMarkup, textEnd, textStart, unquote } from './util.ts';

/**
 * Delete (spec/delete.md). In the middle of a text it is the host's; at the end of a line inside the
 * text the next line joins it (rule 6). At the text's end: before a heading, its marks go first
 * (`headingEditing: text`, rule 4); an empty item below goes (rule 3); else the node below joins this
 * one, as Backspace at its start would join it (rules 5, 6), the caret staying; a selection across
 * nodes as Backspace's (rule 8). On an empty item the node below moves up into it; an empty paragraph
 * goes. A quote or code below is refused; before a marker, the host's (refused where markup is
 * decorated); a held space after the caret goes. Null, unsupported, for other markup where the host
 * decorates it.
 */
export function deleteContentForwardCommand(ctx: CommandContext): CommandOutcome {
  const config = ctx.config;
  if (!ctx.collapsed) return deleteSelectionAcross(ctx);
  const code = codeAt(ctx);
  if (code) return joinInCode(ctx, code, 1);
  const at = ctx.from;
  // in the spaces Markdown hides before a text: the user's whitespace, a space a press, the host's (Enter65d)
  const hidden = hiddenSpacesAt(ctx, ctx.selection.head);
  if (hidden && ctx.selection.head < hidden.to) return deferToHost();
  if (inMarkup(ctx.doc, at, ctx.selection.head)) {
    if (config.markup === 'text') return deferToHost('the caret is in markup');
    // right before a task's checkbox, it goes, the mirror of Backspace after it (Delete19)
    if (at.zone === 'frame' && at.part === 'task' && at.text instanceof ProseText && config.taskEditing === 'checkbox') {
      const task = at.text.frame.find((p) => p.part === 'task')!;
      if (at.offset === task.from) return ctx.apply(ctx.draft().setText(at.node, at.text.splice(task.from, task.to)).setCaret(at.node, task.from, -1));
    }
    if (at.zone === 'marker' && at.part === 'padding') return markerSpace(ctx, at.node);
    return null;
  }
  // before a marker, Delete would take it (Delete23)
  if (at.zone === 'marker' && at.part !== 'padding') return config.markup === 'text' ? deferToHost("a list marker isn't text") : reject('not-expressible', "a list marker isn't text");
  // (at a line's end inside a quote read as an atom: the next line joins as it is written)
  const inQuote = quoteAtomAt(ctx);
  const lineJoin = inQuote && joinLineInQuote(ctx, inQuote, true);
  if (lineJoin) return lineJoin;
  // at its end, the node below joins it as it is written (`quotes: atom`)
  if (inQuote && ctx.collapsed && inQuote.offset === inQuote.text.text.length) {
    const below = inQuote.node.children[0] ?? inQuote.node.afterSubtree;
    if (below && below.preceding?.persistentNode === inQuote.node.persistentNode) return joinIntoQuote(ctx, inQuote.node, inQuote.text, below);
  }
  if (at.zone !== 'text' || !(at.text instanceof ProseText)) return null;
  const { node, text } = at;
  const held = deleteHeldSpace(ctx, node, text, at.offset, 1);
  if (held) return held;
  const s = text.text;
  const end = textEnd(text);
  // past an ATX title's closing `#`s, at the title's end (Delete4b)
  const offset = text.frame.some((p) => p.part === 'close' && p.from <= end && p.to === at.offset) ? end : at.offset;
  const lineEnd = s.indexOf('\n', offset);
  const draft = ctx.draft();
  if (lineEnd >= 0 && lineEnd < end) {
    // before a line's end inside the text, the host's; at it, the next line joins it (a quote's, its `> `
    // going with the break)
    if (offset < lineEnd) return deferToHost();
    const joined = text.splice(lineEnd, text.textStart(lineOf(s, lineEnd + 1)));
    // a quote's first paragraph that would read as its callout's title: not done yet
    if (node.becomesTitle(joined)) return null;
    draft.setText(node, joined).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  // in the text, the host's; past its end, in a closing frame (a setext underline): not done yet
  if (offset < end && !text.empty) return deferToHost();
  if (offset !== end) return null;
  const below = node.children[0] ?? node.afterSubtree;
  if (!below) return null;
  const lower = ctx.doc.textOf(below);
  // on an empty item, the node below moves up into it, as Backspace at its start takes it (Delete5, 6)
  if (text.empty) {
    // an empty paragraph goes, with its blank lines, the caret to the text below (Placeholder13)
    if (node.kind === 'paragraph' && !node.children.length && lower) return ctx.apply(draft.remove([node]).setCaret(below, textStart(lower), 1));
    if (node.kind !== 'item' || !(lower instanceof ProseText) || lower.empty || below.preceding?.persistentNode !== node.persistentNode) return null;
    // (refused, with spaces after the caret: they are the host's to delete, as an outliner deletes them)
    const refused = (): CommandOutcome => (ctx.selection.head < ctx.doc.lineAt(ctx.selection.head).to ? deferToHost() : reject('has-children'));
    if (node.children.length && config.emptyItemWithChildren === 'refuse') return refused();
    // (its first child coming up with children of its own: `joinWithChildren`'s too, either refusing)
    if (below.parent?.persistentNode === node.persistentNode && below.children.length && config.joinWithChildren === 'refuse') return refused();
    return joinUp(ctx, below, lower, false);
  }
  // a quote read as an atom joins as it is written, its `>` text (`quotes: atom`)
  if (lower instanceof AtomText && lower.type === 'blockquote' && below.preceding?.persistentNode === node.persistentNode) return joinQuoteUp(ctx, below, lower);
  // an item whose text is code below joins this node, as Backspace at its fence's start (Fence34)
  if (lower instanceof AtomText && below.kind === 'item' && below.preceding?.persistentNode === node.persistentNode) return joinCodeItemUp(ctx, below, { node, offset });
  // an item below with an item for its first block (`- - b`): it goes, its children this item's (Delete33)
  if (lower === null && below.kind === 'item' && below.children[0]?.kind === 'item' && node.kind === 'item' && below.preceding?.persistentNode === node.persistentNode) {
    draft.remove(below.children).append(node, 'last', below.children).remove([below]).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  // a quote or code below can't join a text (an item whose text is a quote's, the same)
  if (!(lower instanceof ProseText)) return reject('not-expressible', `can't take in the ${below.kind === 'item' ? 'block' : below.kind} below`);
  // before a heading (an item's too), its marks first, the title a paragraph where it is; with
  // `block`, the title joins this text
  if (lower.type === 'heading') {
    if (config.headingEditing === 'block') return joinUp(ctx, below, lower, false);
    // (an ATX title's closing `#`s too)
    const close = lower.frame.find((p) => p.part === 'close');
    const open = lower.frame.find((p) => p.part === 'heading') ?? lower.frame.find((p) => p.part === 'underline')!;
    draft.setText(below, (close ? lower.splice(close.from, close.to) : lower).splice(open.from, open.to)).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  // before a quote (`quotes: text`), its `>`s first, its text a paragraph where it is
  if (lower.type === 'quote') return ctx.apply(draft.setText(below, unquote(lower)).setCaret(node, offset, -1));
  // an empty item below goes, this node taking its gap as a join does; with children, as Backspace at
  // its start takes it (Delete33b)
  if (below.kind === 'item' && lower.empty) {
    if (below.children.length) return joinUp(ctx, below, lower, false);
    draft.remove([below]).gap(node, below.gap).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  if (lower.type !== 'paragraph') return null;
  // with `enterAtTextStart: stay`, one blank line a press while more than one is there, as Backspace
  // takes them (Delete18d)
  const owner = below.preceding;
  if (config.enterAtTextStart === 'stay' && below.kind === 'paragraph' && owner && owner.kind !== 'root' && owner.gap > 1) {
    return ctx.apply(draft.gap(owner, owner.gap - 1).setCaret(node, offset, -1));
  }
  return joinUp(ctx, below, lower, false);
}

/**
 * Where markup is decorated, Delete of the space after a marker: the item is a paragraph, the marker
 * its text's start, as the characters then read (`-a`), its children its list (Delete16); inside an
 * item or a quote refused, the text would run into what is above (Delete16b). Null with more spaces
 * than one, a task's, and an item whose text is no paragraph, which ourus doesn't do yet (unsupported).
 */
function markerSpace(ctx: CommandContext, node: OutlineNode): CommandOutcome {
  const doc = ctx.doc;
  const text = doc.textOf(node);
  const head = ctx.selection.head;
  if (node.kind !== 'item' || !(text instanceof ProseText) || text.type !== 'paragraph' || text.task || text.empty) return null;
  if (head !== doc.posOf(node, 0) - 1 || doc.lineAt(head).index !== node.startLine) return null;
  const parent = node.parent!;
  if (parent.kind === 'item' || parent.kind === 'quote') return reject('not-expressible', 'without its marker the item would run into the text above');
  const marker = doc.markerOf(node);
  const draft = ctx.draft().convert(node, 'paragraph').setText(node, new ProseText('paragraph', false, marker).concat(text));
  return ctx.apply(draft.setCaret(node, marker.length, -1));
}
