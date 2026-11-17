// Delete (spec/delete.md): a node's boundary with the one below, Backspace's from
// the other side. The command says what the texts become and which nodes go; `done()` and the writer
// do the rest.

import { OurusProse, isClosingPart, OurusAtom, type OurusNode, nameOf } from '../doc/index.ts';
import { deleteSelectionAcross, joinUp, statusIn } from './backspace.ts';
import { codeAt, joinCodeItemUp, joinInCode } from './code.ts';
import { lineOf } from '../text/index.ts';
import { type CommandContext } from './context.ts';
import { joinIntoQuote, joinLineInQuote, joinQuoteUp, quoteAtomAt } from './quote.ts';
import { blockElement, joinIntoFootnote, deleteHeldSpace, drawnAt, hiddenSpacesAt, inMarkup, textEnd, textStart, withTextlessParents } from './util.ts';
import type { OurusResult } from './types.ts';
import { decorates } from '../config.ts';
import { OurusDeferred, OurusRejected } from './types.ts';

/**
 * Delete (spec/delete.md). In the middle of a text it is the host's; at the end of a line inside the
 * text the next line joins it (rule 6). At the text's end: a heading's title joins, its marks going
 * with the join (rule 4); an empty item below goes (rule 3); else the node below joins this
 * one, as Backspace at its start would join it (rules 5, 6), the caret staying; a selection across
 * nodes as Backspace's (rule 8). On an empty item the node below moves up into it; an empty paragraph
 * goes. A quote or code below is refused; before a marker, the host's (refused where markup is
 * decorated); a held space after the caret goes. Null, unsupported, for other markup where the host
 * decorates it.
 */
export function deleteContentForwardCommand(ctx: CommandContext): OurusResult | null {
  const config = ctx.config;
  if (!ctx.collapsed) return deleteSelectionAcross(ctx);
  // at the end of code, a table or a rule, before a node: the host's where it shows the block as text,
  // its Delete a blank line a press, then the line below joined to the block's as text; refused where
  // it draws it
  const at = ctx.from;
  if (at.zone === 'text' && at.text instanceof OurusAtom && ctx.collapsed && at.offset === at.text.text.length && !ctx.view.zoom) {
    const element = blockElement(at.text);
    const below = at.node.children[0] ?? at.node.afterSubtree;
    // (after a footnote's text, the paragraph below joins it, its text being prose)
    if (at.text.type === 'footnote_definition' && below) {
      // (another footnote below: its label is in the way, the host's where it shows it as text)
      const next = ctx.doc.textOf(below);
      if (next instanceof OurusAtom && next.type === 'footnote_definition') return decorates(config, 'footnote') ? new OurusRejected('not-expressible', "a footnote's label is no text") : new OurusDeferred('in-markup', 'the footnote below has a label the host edits as text');
      return joinIntoFootnote(ctx, at.node, at.text, below) ?? new OurusRejected('not-expressible', `can't take the ${nameOf(below)} below into the footnote`);
    }
    if (element && below) {
      return decorates(config, element) ? new OurusRejected('not-expressible', `can't take the ${below.kind === 'atom' ? nameOf(below) : 'text'} below into the ${nameOf(at.node)}`) : new OurusDeferred('in-markup', `the ${nameOf(at.node)} is markup the host edits as text`);
    }
  }
  const code = codeAt(ctx);
  if (code) return joinInCode(ctx, code, 1);
  // in the spaces Markdown hides before a text: the user's whitespace, a space a press, the host's (Enter65d)
  const hidden = hiddenSpacesAt(ctx, ctx.selection.head);
  if (hidden && ctx.selection.head < hidden.to) return new OurusDeferred('host-default');
  if (inMarkup(ctx.doc, at, ctx.selection.head)) {
    if (!drawnAt(ctx.doc, at)) return new OurusDeferred('in-markup', 'the caret is in markup');
    // right before a task's checkbox, it goes, the mirror of Backspace after it (Delete19)
    if (at.zone === 'frame' && at.part === 'task' && at.text instanceof OurusProse && config.taskEditing === 'checkbox') {
      const task = at.text.frame.find((p) => p.part === 'task')!;
      if (at.offset === task.from) return ctx.apply(ctx.draft().setText(at.node, at.text.splice(task.from, task.to)).setCaret(at.node, task.from, -1));
    }
    if (at.zone === 'marker' && at.part === 'padding') return markerSpace(ctx, at.node);
    // inside it, right before its character: that character goes, the brackets staying (tasks.md rule 5)
    const status = statusIn(at, 1);
    if (status) return ctx.apply(ctx.draft().setText(status.node, status.text.splice(status.at, status.at + 1)).setCaret(status.node, status.at, -1));
    return null;
  }
  // before a marker, Delete would take it (Delete23)
  if (at.zone === 'marker' && at.part !== 'padding') return !drawnAt(ctx.doc, at) ? new OurusDeferred('in-markup', "a list marker isn't text") : new OurusRejected('not-expressible', "a list marker isn't text");
  // (at a line's end inside a quote read as an atom: the next line joins as it is written)
  const inQuote = quoteAtomAt(ctx);
  const lineJoin = inQuote && joinLineInQuote(ctx, inQuote, true);
  if (lineJoin) return lineJoin;
  // at its end, the node below joins it as it is written (`quotes: atom`)
  if (inQuote && ctx.collapsed && inQuote.offset === inQuote.text.text.length) {
    const below = inQuote.node.children[0] ?? inQuote.node.afterSubtree;
    // (a folded node's first child is hidden: Fold7)
    if (below && below === inQuote.node.children[0] && ctx.view.zoomFolded.has(inQuote.node.id)) return new OurusRejected('folded', 'the node below is hidden in its fold');
    if (below && below.preceding?.persistentNode === inQuote.node.persistentNode) return joinIntoQuote(ctx, inQuote.node, inQuote.text, below);
  }
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return null;
  const { node, text } = at;
  const held = deleteHeldSpace(ctx, node, text, at.offset, 1);
  if (held) return held;
  const s = text.text;
  const end = textEnd(text);
  // past an ATX title's closing `#`s (or a block id before them), at the title's end (Delete4b)
  const offset = text.frame.some((p) => isClosingPart(p) && p.from >= end && p.to === at.offset) ? end : at.offset;
  const lineEnd = s.indexOf('\n', offset);
  const draft = ctx.draft();
  if (lineEnd >= 0 && lineEnd < end) {
    // before a line's end inside the text, the host's; at it, the next line joins it (a quote's, its `> `
    // going with the break)
    if (offset < lineEnd) return new OurusDeferred('host-default');
    const joined = text.splice(lineEnd, text.textStart(lineOf(s, lineEnd + 1)));
    // a quote's first paragraph that would read as its callout's title: not done yet
    if (node.becomesTitle(joined, ctx.doc.mdTree.flavor.has('callouts'))) return null;
    draft.setText(node, joined).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  // in the text, the host's; past its end, in a closing frame (a setext underline): not done yet
  if (offset < end && !text.empty) return new OurusDeferred('host-default');
  if (offset !== end) return null;
  const below = node.children[0] ?? node.afterSubtree;
  if (!below) return null;
  // a folded node's first child is hidden: it doesn't join, nothing hidden changing (Fold7)
  if (below === node.children[0] && ctx.view.zoomFolded.has(node.id)) return new OurusRejected('folded', 'the node below is hidden in its fold');
  const lower = ctx.doc.textOf(below);
  // on an empty item, the node below moves up into it, as Backspace at its start takes it (Delete5, 6)
  if (text.empty) {
    // an empty paragraph goes, with its blank lines, the caret to the text below (Placeholder13)
    // (with the containers it is all of, which would hold nothing: `- > ┃`, its item too)
    if (node.kind === 'paragraph' && !node.children.length && lower) return ctx.apply(draft.remove(withTextlessParents(ctx.doc, [node])).setCaret(below, textStart(lower), 1));
    if (node.kind !== 'item' || !(lower instanceof OurusProse) || lower.empty || below.preceding?.persistentNode !== node.persistentNode) return null;
    // (refused, with spaces after the caret: they are the host's to delete, as an outliner deletes them)
    const refused = (): OurusResult | null => (ctx.selection.head < ctx.doc.lineAt(ctx.selection.head).to ? new OurusDeferred('host-default') : new OurusRejected('has-children'));
    if (node.children.length && config.emptyItemWithChildren === 'refuse') return refused();
    // (its first child coming up with children of its own: `joinWithChildren`'s too, either refusing)
    if (below.parent?.persistentNode === node.persistentNode && below.children.length && config.joinWithChildren !== 'join') return refused();
    return joinUp(ctx, below, lower, false);
  }
  // a quote read as an atom joins as it is written, its `>` text (`quotes: atom`)
  if (lower instanceof OurusAtom && lower.type === 'blockquote' && below.preceding?.persistentNode === node.persistentNode) return joinQuoteUp(ctx, below, lower);
  // an item whose text is code below joins this node, as Backspace at its fence's start (Fence34)
  if (lower instanceof OurusAtom && below.kind === 'item' && below.preceding?.persistentNode === node.persistentNode) return joinCodeItemUp(ctx, below, { node, offset });
  // an item below with an item for its first block (`- - b`): it goes, its children this item's (Delete33)
  if (lower === null && below.kind === 'item' && below.children[0]?.kind === 'item' && node.kind === 'item' && below.preceding?.persistentNode === node.persistentNode) {
    draft.remove(below.children).append(node, 'last', below.children).remove([below]).setCaret(node, offset, -1);
    return ctx.apply(draft);
  }
  // before code: the host's where it shows the fence as text (a blank line a press, then the fence's
  // line joined to this one as text), refused where it draws it
  const element = lower instanceof OurusAtom ? blockElement(lower) : null;
  if ((element === 'fence' || element === 'math' || element === 'comment') && !decorates(config, element) && below.kind !== 'item') return new OurusDeferred('in-markup', `the ${nameOf(below)} below is markup the host edits as text`);
  // before a footnote: the host's where it shows its label as text, refused where it draws it (the
  // label would be this text's)
  if (lower instanceof OurusAtom && lower.type === 'footnote_definition' && !decorates(config, 'footnote')) return new OurusDeferred('in-markup', 'the footnote below has a label the host edits as text');
  // a quote or code below can't join a text (an item whose text is a quote's, the same)
  if (!(lower instanceof OurusProse)) return new OurusRejected('not-expressible', `can't take in the ${below.kind === 'item' ? 'block' : nameOf(below)} below`);
  // before a heading (an item's too), its title joins this text, its marks going with the join (the
  // marks are the caret's side's only for Backspace: `headingEditing`)
  if (lower.type === 'heading') return joinUp(ctx, below, lower, false);
  // before a quote (`quotes: text`), its text joins, its `>`s going with the join, as a heading's marks
  // (Backspace takes them first: there they are at the caret)
  if (lower.type === 'quote') return joinUp(ctx, below, lower.unquoted(), false);
  // an empty item below goes, this node taking its gap as a join does; with children, as Backspace at
  // its start takes it (Delete33b)
  if (below.kind === 'item' && lower.empty) {
    if (below.children.length) return joinUp(ctx, below, lower, false);
    // (its blank lines as they were written, each ours where it was)
    draft.moveGap(below, node).remove([below]).setCaret(node, offset, -1);
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
function markerSpace(ctx: CommandContext, node: OurusNode): OurusResult | null {
  const doc = ctx.doc;
  const text = doc.textOf(node);
  const head = ctx.selection.head;
  if (node.kind !== 'item' || !(text instanceof OurusProse) || text.type !== 'paragraph' || text.task || text.empty) return null;
  if (head !== doc.posOf(node, 0) - 1 || doc.lineAt(head).index !== node.startLine) return null;
  const parent = node.parent!;
  if (parent.kind === 'item' || parent.kind === 'quote') return new OurusRejected('not-expressible', 'without its marker the item would run into the text above');
  const marker = doc.markerOf(node);
  const draft = ctx.draft().convert(node, 'paragraph').setText(node, text.retyped('paragraph', false).splice(0, 0, marker));
  return ctx.apply(draft.setCaret(node, marker.length, -1));
}
