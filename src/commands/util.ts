// What commands ask of a position (whether it is in markup, the text a key there acts in), of a text
// (where typing extends it) and of the selection (the nodes it acts on); and what Tab and Shift-Tab
// share: a heading's level, one up or down.

import { ProseText, AtomText, type OutlineNode, type OutlineNodeText, type Located, type OurusDoc } from '../doc/index.ts';
import type { AnchorSpec, OurusDraft } from '../draft/index.ts';
import { reject, type CommandContext, type CommandOutcome } from './context.ts';
import type { Selection } from './types.ts';
import { heldSpaceAt, isHeldSpacePlaceholder, lineOf, trimMd } from '../text/index.ts';

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
  if (at.zone !== 'frame' || !(at.text instanceof ProseText)) return false;
  if (pos === doc.lineAt(pos).from) return false;
  return (at.part === 'task' && !at.text.empty) || at.part === 'heading' || at.part === 'callout';
}

/**
 * Where a text ends, before a closing frame (an ATX closing sequence, a setext underline); in a block
 * between delimiters, a fence's at the end of its last line with text, or of its opening; `$$` and
 * `%%` before the closing delimiter.
 */
export function textEnd(text: OutlineNodeText): number {
  if (!(text instanceof ProseText)) {
    const s = text.text;
    const close = text.frame.find((p) => p.part === 'close');
    if (!close) return s.length;
    // math and comments close after text on their line (`x$$`): typing before the delimiter is payload
    if (text.type === 'math_block' || text.type === 'comment_block') return close.from;
    const lines = s.split('\n');
    let at = 0;
    let end = lines[0]!.length;
    for (let k = 0; k < lines.length - 1; k++) {
      if (k > 0 && trimMd(lines[k]!) !== '') end = at + lines[k]!.length;
      at += lines[k]!.length + 1;
    }
    return end;
  }
  const tail = text.frame.find((p) => p.to === text.text.length && (p.part === 'close' || p.part === 'underline'));
  return tail ? tail.from : text.text.length;
}

/** A quote's text (`quotes: text`) without its `>`s, every line's: a paragraph's, where it is. */
export function unquote(text: ProseText): ProseText {
  let out = text;
  for (const p of [...text.frame].reverse()) if (p.part === 'quote') out = out.splice(p.from, p.to);
  return new ProseText('paragraph', out.item, out.text, out.marks);
}

/**
 * Where typing extends a text: past its frame on its first line (an item's checkbox, a heading's
 * `#`s); in a block between delimiters, at its first line of payload with text, else after its
 * opening (a fence's whole line: after it, typing would be its info string).
 */
export function textStart(text: OutlineNodeText): number {
  if (text instanceof ProseText) return text.textStart(0);
  const open = text.frame.find((p) => p.part === 'open');
  // indented code: past its first line's four columns
  if (!open) return text.frame.find((p) => p.part === 'indent' && p.from === 0)?.to ?? 0;
  const lines = text.text.split('\n');
  const closed = text.frame.some((p) => p.part === 'close');
  let at = lines[0]!.length + 1;
  for (let k = 1; k < lines.length - (closed ? 1 : 0); k++) {
    if (trimMd(lines[k]!) !== '') return at;
    at += lines[k]!.length + 1;
  }
  return text.type === 'fenced_code' ? lines[0]!.length : open.to;
}

/**
 * `nodes` (contiguous siblings) with the nodes they are all of that have no text of their own: a
 * quote without a title, an item whose first block is on its marker's line (`- > q`). Where they go,
 * those go with them, which would hold nothing.
 */
export function withTextlessParents(doc: OurusDoc, nodes: readonly OutlineNode[]): OutlineNode[] {
  let out = [...nodes];
  for (let p = out[0]!.parent; p && (p.kind === 'quote' || p.kind === 'item') && !doc.textOf(p) && p.children.length === out.length; p = p.parent) out = [p];
  return out;
}

/**
 * The nodes a structural command acts on: the topmost nodes whose own lines the selection touches (a
 * blank line is the gap of the node above it), contiguous siblings; else what is wrong: none (on the
 * blank lines before the first node), or they aren't contiguous siblings.
 */
export function operands(doc: OurusDoc, selection: Selection): OutlineNode[] | 'none' | 'non-contiguous' {
  if (doc.lineCount === 0) return 'none';
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const lo = doc.lineAt(from).index;
  const end = doc.lineAt(to);
  // a selection ending at a line's very start doesn't take that line
  const hi = to > from && end.index > lo && end.from === to ? end.index - 1 : end.index;
  const touched = new Set<OutlineNode>();
  for (let i = lo; i <= hi; i++) {
    const n = doc.nodeAtLine(i);
    if (n) touched.add(n);
  }
  if (!touched.size) {
    for (let i = lo; i >= 0; i--) {
      if (doc.isEmptyLine(i)) continue;
      const owner = doc.nodeAtLine(i);
      if (owner) touched.add(owner);
      break;
    }
  }
  if (!touched.size) return 'none';
  const tops = [...touched].filter((n) => {
    for (let p = n.parent; p; p = p.parent) if (touched.has(p)) return false;
    return true;
  });
  const parent = tops[0]!.parent;
  if (!parent || tops.some((n) => n.parent !== parent)) return 'non-contiguous';
  const sorted = tops.sort((a, b) => a.index - b.index);
  for (let i = 1; i < sorted.length; i++) if (sorted[i]!.index !== sorted[i - 1]!.index + 1) return 'non-contiguous';
  return sorted;
}

/**
 * Where Enter at `head` acts: in a node's text; in an item's marker, a task's checkbox or a heading's
 * `#`s, at the text's start (rule 5). Null anywhere else.
 */
export function textActedOnAt(ctx: CommandContext, head: number): { node: OutlineNode; text: ProseText; offset: number } | null {
  const doc = ctx.doc;
  const at = doc.locate(head);
  if (at.zone === 'text') return at.text instanceof ProseText ? { node: at.node, text: at.text, offset: at.offset } : null;
  if (at.zone === 'frame' && at.text instanceof ProseText && (at.part === 'task' || at.part === 'heading')) return { node: at.node, text: at.text, offset: at.text.textStart(0) };
  if (at.zone === 'marker' && at.node.kind === 'item' && at.line.index === at.node.startLine) {
    const text = doc.textOf(at.node);
    return text instanceof ProseText ? { node: at.node, text, offset: text.textStart(0) } : null;
  }
  return null;
}

/**
 * The nodes a structural command acts on (`operands`), of one kind; else what the command does
 * instead: refused, as mixed, or as `operands` finds none.
 */
export function structuralOperands(ctx: CommandContext): OutlineNode[] | CommandOutcome {
  const nodes = operands(ctx.doc, ctx.selection);
  if (!Array.isArray(nodes)) return operandsRefused(nodes);
  if (nodes.some((n) => n.kind !== nodes[0]!.kind)) return reject('mixed-kinds');
  return nodes;
}

/**
 * The selection where it was, but a caret a structural command leaves in its node's text: from
 * markup before the text (a marker, a prefix, a checkbox, a fence: MoveUp34) at the text's start;
 * on a blank line, there, where it goes with its node (the node it acted on), else at the end of that
 * node's text; in code, math or a comment
 * between its delimiters (MoveUp37, MoveUp38). `keepOnFence`: Tab's and Shift-Tab's, which leave a
 * caret on a fence's line there where markup is text.
 */
export function selectionInText(ctx: CommandContext, draft: OurusDraft, keepOnFence = false): void {
  const { anchor, head } = ctx.selection;
  const at = ctx.from;
  // on a fence's line, where markup is text: Tab and Shift-Tab leave it there, for the next one (Indent31)
  if (keepOnFence && ctx.config.markup === 'text' && ctx.collapsed && (at.zone === 'frame' || at.zone === 'text') && at.text instanceof AtomText && at.text.fence && at.text.delimiterLine(lineOf(at.text.text, at.offset))) {
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
      const otherwise = { ref: owner, offset: textEnd(text), assoc: -1 } as const;
      // on a blank line at its text's column (Shift-Enter's): there still, at the column it has now (TO12)
      const k = ctx.doc.lineAt(head).index - owner.textLastLine - 1;
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
      draft.setCaret(at.node, caretOffset(at, text), 1);
      return;
    }
  }
  // each end in its text where it is in one (a text written again keeps its offsets), else where it was
  const end = (pos: number): AnchorSpec => {
    const at = ctx.doc.locate(pos);
    return at.zone === 'text' && at.text instanceof ProseText ? { ref: at.node, offset: at.offset } : { old: pos };
  };
  draft.select(end(anchor), end(head));
}

/**
 * The spaces Markdown hides before a text (`OurusDoc.hiddenSpaces`) that `pos` is in or at either end
 * of, with their node and its text: the user's whitespace there, not markup.
 */
export function hiddenSpacesAt(ctx: CommandContext, pos: number): { readonly node: OutlineNode; readonly text: ProseText; readonly from: number; readonly to: number } | null {
  const doc = ctx.doc;
  if (!doc.lineCount) return null;
  const node = doc.nodeAtLine(doc.lineAt(pos).index);
  const hidden = node && doc.hiddenSpaces(node);
  const text = node && doc.textOf(node);
  if (!hidden || !(text instanceof ProseText) || pos < hidden.from || pos > hidden.to) return null;
  return { node: node!, text, ...hidden };
}

/** Whether `pos` is on a code line, fenced code's payload or any line of indented code (its containers' prefix too), where Tab and Shift-Tab are the host's. */
export function onCodeLine(ctx: CommandContext, pos: number): boolean {
  const doc = ctx.doc;
  if (!doc.lineCount) return false;
  const line = doc.lineAt(pos).index;
  const node = doc.nodeAtLine(line);
  const text = node ? doc.textOf(node) : null;
  if (!node || !(text instanceof AtomText)) return false;
  // (indented code: every line of it)
  if (text.type === 'indented_code') return line >= node.textFirstLine;
  if (text.type !== 'fenced_code') return false;
  const k = line - node.textFirstLine;
  return k >= 0 && !text.delimiterLine(k);
}

/** Where a caret at `at` goes in `text`, its node's: from markup before the text at its start; in code between its delimiters. */
export function caretOffset(at: Located, text: OutlineNodeText): number {
  if (at.zone !== 'text') return textStart(text);
  return text instanceof AtomText ? Math.min(Math.max(at.offset, textStart(text)), textEnd(text)) : at.offset;
}

/** A node's heading level, 7 for a node that isn't a heading (below every level). */
export function headingLevel(ctx: CommandContext, node: OutlineNode): number {
  const text = ctx.doc.textOf(node);
  return text instanceof ProseText ? (text.heading?.level ?? 7) : 7;
}

/**
 * The headings among `nodes` and in their sections, each `delta` levels deeper: an ATX title's `#`s,
 * a setext title's underline where it can say the level, else written as an ATX title (one line at
 * most); refused past `#` or `######`. Null for a title the ATX form would read otherwise (a closing
 * run of `#`s), which ourus doesn't escape yet (unsupported).
 */
export function changeHeadingLevels(ctx: CommandContext, nodes: readonly OutlineNode[], delta: number): CommandOutcome {
  const doc = ctx.doc;
  const headings: OutlineNode[] = [];
  const walk = (n: OutlineNode): void => {
    if (n.kind === 'heading') headings.push(n);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  const draft = ctx.draft();
  // where each changed text's offsets go: past the change, by how much the text before them grew
  const shifts = new Map<number, { at: number; by: number; length: number }>();
  for (const h of headings) {
    const text = doc.textOf(h);
    if (!(text instanceof ProseText) || !text.heading) return null;
    const { level, form } = text.heading;
    const next = level + delta;
    if (next < 1) return reject('at-h1-bound');
    if (next > 6) return reject('at-h6-bound');
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
      if (s.slice(0, underline.from).includes('\n')) return reject('not-expressible', 'a setext title of several lines has no ATX form');
      const lead = `${'#'.repeat(next)} `;
      const kept = text.slice(0, underline.from);
      const atx = new ProseText('heading', text.item, kept.text, kept.marks).splice(0, 0, lead);
      // a title ending in `#`s would read them as its closing sequence
      if (atx.frame.some((p) => p.part === 'close')) return null;
      draft.setText(h, atx);
      // the underline goes: a caret on it at the title's end
      shifts.set(h.id, { at: 0, by: lead.length, length: lead.length + underline.from });
    }
  }
  // the selection on the same characters of each title
  const end = (pos: number): AnchorSpec => {
    const at = doc.locate(pos);
    if (at.zone !== 'text' && at.zone !== 'frame') return { old: pos };
    const shift = shifts.get(at.node.id);
    if (!(at.text instanceof ProseText)) return { old: pos };
    return { ref: at.node, offset: shift ? Math.min(at.offset >= shift.at ? at.offset + shift.by : at.offset, shift.length) : at.offset };
  };
  draft.select(end(ctx.selection.anchor), end(ctx.selection.head));
  return ctx.apply(draft);
}

/**
 * Backspace after a held space and Delete before it (`dir`): the space goes, the node's text then
 * starting where it was, escaped where it would read as markup (Backspace48, Delete32). Null where
 * no held space is on that side of the caret.
 */
export function deleteHeldSpace(ctx: CommandContext, node: OutlineNode, text: ProseText, offset: number, dir: -1 | 1): CommandOutcome {
  if (!heldSpaceAt(text.marks, text.text, offset)) return null;
  const head = ctx.selection.head;
  const [before, after] = [ctx.doc.posOf(node, offset, -1), ctx.doc.posOf(node, offset, 1)];
  if (before === after || head !== (dir < 0 ? after : before)) return null;
  const marks = text.marks.update({ filter: (m) => m.from !== offset || !isHeldSpacePlaceholder(m, text.text) });
  const settled = new ProseText(text.type, text.item, text.text, marks);
  return ctx.apply(ctx.draft().setText(node, settled).setCaret(node, offset, -1));
}

/** What a structural command says where `operands` found none it can act on. */
export function operandsRefused(why: 'none' | 'non-contiguous'): CommandOutcome {
  return why === 'none' ? reject('nothing-above', 'no node is selected') : reject('non-contiguous');
}

/**
 * A caret in the containers' prefix on a node's first line (`┃  - c`, the indentation its parent's;
 * `┃> q`): a key acts as at the start of the node's text, as before a marker (Backspace2). Else the
 * context as it is.
 */
export function pastPrefix(ctx: CommandContext): CommandContext {
  const at = ctx.from;
  if (!ctx.collapsed || at.zone !== 'prefix' || at.line.index !== at.node.startLine) return ctx;
  const text = ctx.doc.textOf(at.node);
  return text ? ctx.at(ctx.doc.posOf(at.node, textStart(text), 1)) : ctx;
}

/**
 * An empty item leaving its list (rule 3): an empty paragraph where it was, held by a placeholder and
 * set off by blank lines; the items after it a list of their own after it. In a quote it stays in the
 * quote. Its checkbox goes with the marker.
 */
export function leaveList(ctx: CommandContext, node: OutlineNode): CommandOutcome {
  const draft = ctx.draft().convert(node, 'paragraph').setText(node, new ProseText('paragraph', false, ''));
  const above = node.preceding;
  // (a quote with no text above it, nothing to set it off from)
  if (above && above.kind !== 'root' && above.gap === 0 && ctx.doc.textOf(above)) draft.gap(above, 1);
  if (node.afterSubtree && node.gap === 0) draft.gap(node, 1);
  return ctx.apply(draft.setCaret(node, 0, -1));
}
