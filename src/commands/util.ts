// What commands ask of a position (whether it is in markup, the text a key there acts in), of a text
// (where typing extends it) and of the selection (the nodes it acts on); and what Tab and Shift-Tab
// share: a heading's level, one up or down.

import { OurusProse, OurusAtom, closingFrameStart, textEnd, textStart, type OurusNode, type OurusText, type Located, type OurusDoc } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import type { AnchorSpec, OurusDraft } from '../writer/index.ts';
import { type CommandContext } from './context.ts';
import type { OurusSelection, OurusResult } from './types.ts';
import { heldSpaceAt, isHeldSpacePlaceholder, lineOf } from '../text/index.ts';
import { OurusRejected } from './types.ts';

export { textEnd, textStart } from '../doc/index.ts';

/**
 * Whether a caret at `pos` (located `at`) is in markup before a text: past its line's start, in an
 * item's marker or a container's prefix, the padding before a text, a task's checkbox, a heading's
 * `#`s, a callout's type.
 * Where markup is text the user edits (`markup: text`), keys there are the host's. A held space is
 * its text's start; an empty item's checkbox is its text.
 */
export function inMarkup(doc: OurusDoc, at: Located, pos: number): boolean {
  if (at.zone === 'marker' || at.zone === 'prefix') return pos > at.line.from;
  // in the padding before a text's first line (` ┃   code`), but a held space, which is the text's start
  if (at.zone === 'text' && at.offset === 0 && pos < doc.posOf(at.node, 0, -1)) {
    return pos > doc.lineAt(pos).from && !heldSpaceAt(doc.marks, doc.text, pos);
  }
  if (at.zone !== 'frame' || !(at.text instanceof OurusProse)) return false;
  if (pos === doc.lineAt(pos).from) return false;
  return (at.part === 'task' && !at.text.empty) || at.part === 'heading' || at.part === 'callout';
}

/** A quote's text (`quotes: text`) without its `>`s, every line's: a paragraph's, where it is. */
export function unquote(text: OurusProse): OurusProse {
  let out = text;
  for (const p of [...text.frame].reverse()) {
    if (p.part === 'quote') out = out.splice(p.from, p.to);
    // (a block id on a line of its own takes that line's `>` with it: `> q⏎> ^x`)
    if (p.part !== 'blockId') continue;
    const prefixes = [...text.text.slice(p.from, p.to).matchAll(/\n([ \t]*>[ \t]?)/g)].reverse();
    for (const m of prefixes) out = out.splice(p.from + m.index + 1, p.from + m.index + m[0].length);
  }
  return out.retyped('paragraph');
}

/**
 * `nodes` (contiguous siblings) with the nodes they are all of that have no text of their own: a
 * quote without a title, an item whose first block is on its marker's line (`- > q`). Where they go,
 * those go with them, which would hold nothing.
 */
export function withTextlessParents(doc: OurusDoc, nodes: readonly OurusNode[]): OurusNode[] {
  let out = [...nodes];
  for (let p = out[0]!.parent; p && (p.kind === 'quote' || p.kind === 'item') && !doc.textOf(p) && p.children.length === out.length; p = p.parent) out = [p];
  return out;
}

/**
 * `nodes` (whole subtrees, at whatever depths) going, with the nodes with no text of their own all of
 * whose children go: a quote without a title, an item whose first block is on its marker's line
 * (`- > q`), whose children are those nodes, or go with them (outward, `withTextlessParents` over
 * every run together). In document order.
 */
export function goneWithTextlessParents(doc: OurusDoc, nodes: readonly OurusNode[]): OurusNode[] {
  const gone = new Set(nodes);
  for (let lifted = true; lifted; ) {
    lifted = false;
    for (const n of [...gone]) {
      const p = n.parent;
      if (!p || (p.kind !== 'quote' && p.kind !== 'item') || doc.textOf(p) || gone.has(p) || !p.children.every((c) => gone.has(c))) continue;
      for (const c of p.children) gone.delete(c);
      gone.add(p);
      lifted = true;
    }
  }
  return [...gone].sort((a, b) => a.startLine - b.startLine || a.depth - b.depth);
}

/**
 * The nodes a command acts on, each with its subtree, at whatever depths: those it was given by id
 * (`ctx.nodes`, in document order), else the selection's (`selectionRoots`); else why none: none
 * selected (the blank lines before the first node), or an id the document lacks.
 */
export function operandsOf(ctx: CommandContext): OurusNode[] | NoOperands {
  if (!ctx.nodes) {
    const roots = selectionRoots(ctx.view, ctx.selection);
    return roots.length ? roots : 'none';
  }
  if (!ctx.nodes.length) return 'none';
  const nodes = new Set<OurusNode>();
  for (const id of ctx.nodes) {
    const node = ctx.doc.node(id);
    // (the root is no node to act on)
    if (!node || node.kind === 'root') return 'no-such-node';
    nodes.add(node);
  }
  return [...nodes].sort((a, b) => a.startLine - b.startLine || a.depth - b.depth);
}

/**
 * The roots of the selection: those of a subtree selection (`OurusView.selectedSubtrees`: on a line nodes
 * share, the outermost), else the subtrees it touches (`OurusView.touchedSubtrees`: a caret's node, the
 * innermost there). The blocks a host draws and the nodes acted on are the same.
 */
export function selectionRoots(view: OurusView, selection: OurusSelection): OurusNode[] {
  return [...(view.selectedSubtrees(selection) ?? view.touchedSubtrees(selection))];
}

/** `nodes` as runs of contiguous siblings, in document order. */
export function runsOf(nodes: readonly OurusNode[]): OurusNode[][] {
  const sorted = [...nodes].sort((a, b) => a.startLine - b.startLine || a.depth - b.depth);
  const runs: OurusNode[][] = [];
  for (const n of sorted) {
    const run = runs.at(-1);
    const last = run?.at(-1);
    if (run && last && last.parent === n.parent && last.index + 1 === n.index) run.push(n);
    else runs.push([n]);
  }
  return runs;
}

/**
 * The nodes a command that moves one run acts on (`operandsOf`): contiguous siblings, of one kind
 * where `sameKind`; else why not.
 */
export function oneRun(ctx: CommandContext, sameKind = false): OurusNode[] | NoOperands | 'mixed-kinds' {
  const nodes = operandsOf(ctx);
  if (!Array.isArray(nodes)) return nodes;
  const runs = runsOf(nodes);
  if (runs.length > 1) return 'non-contiguous';
  const run = runs[0]!;
  return sameKind && run.some((n) => n.kind !== run[0]!.kind) ? 'mixed-kinds' : run;
}

/** Why a command has no operands: none selected, not contiguous siblings, or an id the document lacks. */
export type NoOperands = 'none' | 'non-contiguous' | 'no-such-node';

/**
 * Where Enter at `head` acts: in a node's text; in an item's marker, a task's checkbox or a heading's
 * `#`s, at the text's start (rule 5). Null anywhere else.
 */
export function textActedOnAt(ctx: CommandContext, head: number): { node: OurusNode; text: OurusProse; offset: number } | null {
  const doc = ctx.doc;
  const view = ctx.view;
  const at = view.locate(head);
  if (at.zone === 'text') return at.text instanceof OurusProse ? { node: at.node, text: at.text, offset: at.offset } : null;
  if (at.zone === 'frame' && at.text instanceof OurusProse && (at.part === 'task' || at.part === 'heading')) return { node: at.node, text: at.text, offset: at.text.textStart(0) };
  if (at.zone === 'marker' && at.node.kind === 'item' && at.line.index === at.node.startLine) {
    const text = doc.textOf(at.node);
    return text instanceof OurusProse ? { node: at.node, text, offset: text.textStart(0) } : null;
  }
  return null;
}

/**
 * The selection where it was, but a caret a structural command leaves in its node's text: from
 * markup before the text (a marker, a prefix, a checkbox, a fence: MoveUp34) at the text's start;
 * on a blank line, there, where it goes with its node (the node it acted on), else at the end of that
 * node's text; in code, math or a comment
 * between its delimiters (MoveUp37, MoveUp38). `keepOnFence`: Tab's and Shift-Tab's, which leave a
 * caret on a fence's line there where markup is text. `shifts`: where titles the command re-levelled
 * moved their characters.
 */
export function selectionInText(ctx: CommandContext, draft: OurusDraft, keepOnFence = false, shifts: HeadingShifts = new Map()): void {
  const { anchor, head } = ctx.selection;
  const at = ctx.from;
  // on a fence's line, where markup is text: Tab and Shift-Tab leave it there, for the next one (Indent31)
  if (keepOnFence && ctx.config.markup === 'text' && ctx.collapsed && (at.zone === 'frame' || at.zone === 'text') && at.text instanceof OurusAtom && at.text.fence && at.text.delimiterLine(lineOf(at.text.text, at.offset))) {
    draft.setCaret(at.node, at.offset, 1);
    return;
  }
  // past the final line ending, as on a blank line after the last node (MoveUp39)
  const owner = at.zone === 'gap' ? at.owner : at.zone === 'none' && head === ctx.doc.text.length ? ctx.doc.rootNode.lastDescendant : null;
  if (ctx.collapsed && owner && owner.kind !== 'root') {
    // on a blank line, which goes with its node (Gap14); where a seam lowered it, or past the final
    // line ending, at the end of the node's text
    const text = ctx.doc.textOf(owner);
    if (text) {
      const otherwise = { ref: owner, offset: headingOffset(shifts, owner, textEnd(text)), assoc: -1 } as const;
      // on a blank line at its text's column (Shift-Enter's): there still, at the column it has now (TO12)
      const k = ctx.doc.lineAt(head).index - owner.ownLastLine - 1;
      if (at.zone === 'gap' && !owner.children.length && k >= 0 && k < owner.gap && ctx.doc.atTextColumn(head, owner)) draft.select({ blank: owner, line: k, old: anchor }, { blank: owner, line: k, old: head });
      else if (at.zone === 'gap') draft.select({ old: anchor, otherwise }, { old: head, otherwise });
      else draft.setCaret(owner, otherwise.offset, -1);
      return;
    }
  }
  // in the spaces Markdown hides before a text, the user's: where it is in them
  const hidden = ctx.collapsed ? hiddenSpacesAt(ctx, head) : null;
  if (hidden && head < hidden.to) {
    const at = { ref: hidden.node, offset: hidden.text.textStart(0), assoc: 1, before: hidden.to - head } as const;
    draft.select(at, at);
    return;
  }
  if (ctx.collapsed && (at.zone === 'frame' || at.zone === 'marker' || at.zone === 'prefix' || at.zone === 'text')) {
    const text = at.zone === 'frame' || at.zone === 'text' ? at.text : ctx.doc.textOf(at.node);
    if (text) {
      draft.setCaret(at.node, headingOffset(shifts, at.node, caretOffset(at, text)), 1);
      return;
    }
  }
  // each end in its text where it is in one (a text written again keeps its offsets), else where it was
  const end = (pos: number): AnchorSpec => {
    const at = ctx.view.locate(pos);
    return at.zone === 'text' && at.text instanceof OurusProse ? { ref: at.node, offset: headingOffset(shifts, at.node, at.offset) } : { old: pos };
  };
  draft.select(end(anchor), end(head));
}

/**
 * The spaces Markdown hides before a text (`OurusDoc.hiddenSpaces`) that `pos` is in or at either end
 * of, with their node and its text: the user's whitespace there, not markup.
 */
export function hiddenSpacesAt(ctx: CommandContext, pos: number): { readonly node: OurusNode; readonly text: OurusProse; readonly from: number; readonly to: number } | null {
  const doc = ctx.doc;
  if (!doc.lineCount) return null;
  const node = doc.nodeAtLine(doc.lineAt(pos).index);
  const hidden = node && doc.hiddenSpaces(node);
  const text = node && doc.textOf(node);
  if (!hidden || !(text instanceof OurusProse) || pos < hidden.from || pos > hidden.to) return null;
  return { node: node!, text, ...hidden };
}

/** Whether `pos` is on a code line, fenced code's payload or any line of indented code (its containers' prefix too), where Tab and Shift-Tab are the host's. */
export function onCodeLine(ctx: CommandContext, pos: number): boolean {
  const doc = ctx.doc;
  if (!doc.lineCount) return false;
  const line = doc.lineAt(pos).index;
  const node = doc.nodeAtLine(line);
  const text = node ? doc.textOf(node) : null;
  if (!node || !(text instanceof OurusAtom)) return false;
  // (indented code: every line of it)
  if (text.type === 'indented_code') return line >= node.textFirstLine;
  if (text.type !== 'fenced_code') return false;
  // (the text's line: where its string starts, an item's marker's line where its code starts below it)
  const k = line - doc.lineAt(doc.posOf(node, 0)).index;
  return k >= 0 && !text.delimiterLine(k);
}

/** Where a caret at `at` goes in `text`, its node's: from markup before the text at its start; in code between its delimiters. */
export function caretOffset(at: Located, text: OurusText): number {
  if (at.zone !== 'text') return textStart(text);
  return text instanceof OurusAtom ? Math.min(Math.max(at.offset, textStart(text)), textEnd(text)) : at.offset;
}

/** A node's heading level, 7 for a node that isn't a heading (below every level). */
export function headingLevel(ctx: CommandContext, node: OurusNode): number {
  const text = ctx.doc.textOf(node);
  return text instanceof OurusProse ? (text.heading?.level ?? 7) : 7;
}

/**
 * The headings among `nodes` and in their sections, each `delta` levels deeper: an ATX title's `#`s,
 * a setext title's underline where it can say the level, else written as an ATX title (one line at
 * most); refused past `#` or `######`. Null for a title the ATX form would read otherwise (a closing
 * run of `#`s), which ourus doesn't escape yet (unsupported).
 */
export function changeHeadingLevels(ctx: CommandContext, nodes: readonly OurusNode[], delta: number): OurusResult | null {
  const draft = ctx.draft();
  const shifted = shiftHeadingLevels(ctx, draft, nodes, delta);
  if (!shifted || shifted instanceof OurusRejected) return shifted;
  const end = (pos: number): AnchorSpec => {
    const at = ctx.view.locate(pos);
    if (at.zone !== 'text' && at.zone !== 'frame') return { old: pos };
    if (!(at.text instanceof OurusProse)) return { old: pos };
    return { ref: at.node, offset: headingOffset(shifted, at.node, at.offset) };
  };
  draft.select(end(ctx.selection.anchor), end(ctx.selection.head));
  return ctx.apply(draft);
}

/** Where each title `shiftHeadingLevels` changed has its offsets go: past `at`, `by` further, up to its new `length`. */
export type HeadingShifts = ReadonlyMap<number, { readonly at: number; readonly by: number; readonly length: number }>;

/** Offset `offset` of `node`'s title, where `shifts` moved its characters. */
export function headingOffset(shifts: HeadingShifts, node: OurusNode, offset: number): number {
  const shift = shifts.get(node.id);
  return shift ? Math.min(offset >= shift.at ? offset + shift.by : offset, shift.length) : offset;
}

/**
 * `changeHeadingLevels`'s texts, set in `draft`: the headings among `nodes` and in their sections,
 * `delta` levels deeper; where each title's characters went, or the refusal (null: unsupported).
 */
export function shiftHeadingLevels(ctx: CommandContext, draft: OurusDraft, nodes: readonly OurusNode[], delta: number): HeadingShifts | OurusRejected | null {
  const doc = ctx.doc;
  const headings: OurusNode[] = [];
  const walk = (n: OurusNode): void => {
    if (n.kind === 'heading') headings.push(n);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  // where each changed text's offsets go: past the change, by how much the text before them grew
  const shifts = new Map<number, { at: number; by: number; length: number }>();
  for (const h of headings) {
    const text = doc.textOf(h);
    if (!(text instanceof OurusProse) || !text.heading) return null;
    const { level, form } = text.heading;
    const next = level + delta;
    if (next < 1) return new OurusRejected('at-h1-bound');
    if (next > 6) return new OurusRejected('at-h6-bound');
    if (delta === 0) continue;
    const s = text.text;
    if (form === 'atx') {
      const open = text.frame.find((p) => p.part === 'heading')!;
      // (its `#`s, as many as its level)
      draft.setText(h, text.splice(open.from, open.from + level, '#'.repeat(next)));
      shifts.set(h.id, { at: open.from + level, by: next - level, length: s.length + next - level });
    } else if (next <= 2) {
      const underline = text.frame.find((p) => p.part === 'underline')!;
      draft.setText(h, text.splice(underline.from, underline.to, s.slice(underline.from, underline.to).replace(/[=-]/g, next === 1 ? '=' : '-')));
    } else {
      // levels past 2 have no setext form: an ATX title, its underline gone
      const underline = text.frame.find((p) => p.part === 'underline')!;
      if (s.slice(0, underline.from).includes('\n')) return new OurusRejected('not-expressible', 'a setext title of several lines has no ATX form');
      const lead = `${'#'.repeat(next)} `;
      const atx = text.slice(0, underline.from).withBlockIdLines(text.blockIdLines).splice(0, 0, lead);
      // a title ending in `#`s would read them as its closing sequence
      if (atx.frame.some((p) => p.part === 'close')) return null;
      draft.setText(h, atx);
      // the underline goes: a caret on it at the title's end (before a block id ending it)
      shifts.set(h.id, { at: 0, by: lead.length, length: closingFrameStart(atx) });
    }
  }
  return shifts;
}

/**
 * Backspace after a held space and Delete before it (`dir`): the space goes, the node's text then
 * starting where it was, escaped where it would read as markup (Backspace48, Delete32). Null where
 * no held space is on that side of the caret.
 */
export function deleteHeldSpace(ctx: CommandContext, node: OurusNode, text: OurusProse, offset: number, dir: -1 | 1): OurusResult | null {
  if (!heldSpaceAt(text.marks, text.text, offset)) return null;
  const head = ctx.selection.head;
  const [before, after] = [ctx.doc.posOf(node, offset, -1), ctx.doc.posOf(node, offset, 1)];
  if (before === after || head !== (dir < 0 ? after : before)) return null;
  const marks = text.marks.update({ filter: (m) => m.from !== offset || !isHeldSpacePlaceholder(m, text.text) });
  const settled = text.withMarks(marks);
  return ctx.apply(ctx.draft().setText(node, settled).setCaret(node, offset, -1));
}

/** What a command says where `operandsOf` or `oneRun` found none it can act on. */
export function operandsRefused(why: NoOperands | 'mixed-kinds'): OurusResult | null {
  return why === 'none' ? new OurusRejected('nothing-above', 'no node is selected') : new OurusRejected(why);
}

/**
 * A caret in the containers' prefix on a node's first line (`┃  - c`, the indentation its parent's;
 * `┃> q`): a key acts as at the start of the node's text, as before a marker (Backspace2). Else the
 * context as it is.
 */
export function pastPrefix(ctx: CommandContext): CommandContext {
  const at = ctx.from;
  // (not on a line before the text, a quote's `>` above its callout title: no line of its text)
  if (!ctx.collapsed || at.zone !== 'prefix' || at.line.index !== at.node.startLine || (at.node.kind === 'quote' && at.line.index < at.node.textFirstLine)) return ctx;
  const text = ctx.doc.textOf(at.node);
  return text ? ctx.at(ctx.doc.posOf(at.node, textStart(text), 1)) : ctx;
}

/**
 * An empty item leaving its list (rule 3): an empty paragraph where it was, held by a placeholder and
 * set off by blank lines; the items after it a list of their own after it. In a quote it stays in the
 * quote. Its checkbox goes with the marker.
 */
export function leaveList(ctx: CommandContext, node: OurusNode): OurusResult | null {
  // (first in an item with no text, the empty paragraph would be the item's first block: an item starts
  // with one blank line at most and goes on, so it can't, `-⏎⏎  b` an empty item and a paragraph)
  const parent = node.parent;
  if (parent?.kind === 'item' && parent.children[0] === node && (ctx.doc.textOf(parent) as OurusProse | null)?.empty) return new OurusRejected('not-expressible', "an empty paragraph can't be the first block of an item with no text");
  const draft = ctx.draft().convert(node, 'paragraph').setText(node, new OurusProse('paragraph', false, ''));
  const above = node.preceding;
  // (a quote with no text above it, nothing to set it off from)
  if (above && above.kind !== 'root' && above.gap === 0 && ctx.doc.textOf(above)) draft.gap(above, 1);
  if (node.afterSubtree && node.gap === 0) draft.gap(node, 1);
  return ctx.apply(draft.setCaret(node, 0, -1));
}
