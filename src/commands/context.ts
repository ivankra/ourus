// One command's context, the operands of a structural command, and the helpers commands share.

import { OutlineState, type OutlineKind, type OutlineNode } from '../outline/index.ts';
import type { Flavor, LineInfo, PrefixPiece } from '../parser/index.ts';
import { advanceColumns, dominantEnding, isSpaceOrTab, mapPos, skipSpaces, trimMd, trimMdStart, type ChangeSpec } from '../text.ts';
import { OutlineEncoder, OutlinePlan, type EncodeOptions, type EncodeResult, type OutlinePlanNode } from '../encoder/index.ts';
import type { CommandResult, Selection } from './index.ts';
import { notApplicable, reject, type Outcome, type CommandPlan } from './plan.ts';

/** One command's context: the document and selection it runs on, and what nearly every command needs of them. */
export class CommandContext {
  readonly doc: OutlineState;
  readonly sel: Selection;
  #eol: string | undefined;
  #encoder: OutlineEncoder | undefined;

  constructor(doc: OutlineState, sel: Selection) {
    this.doc = doc;
    this.sel = sel;
  }

  /** The same document with another selection. */
  with(sel: Selection): CommandContext {
    return new CommandContext(this.doc, sel);
  }

  /** The same document with a caret at `pos`. */
  at(pos: number): CommandContext {
    return this.with({ anchor: pos, head: pos });
  }

  /** The selection's start and end. */
  get from(): number {
    return Math.min(this.sel.anchor, this.sel.head);
  }

  get to(): number {
    return Math.max(this.sel.anchor, this.sel.head);
  }

  /** Whether the selection is a caret. */
  get collapsed(): boolean {
    return this.sel.anchor === this.sel.head;
  }

  /** The document's encoder: made when first asked for, and shared by the command's encodings. */
  get encoder(): OutlineEncoder {
    return (this.#encoder ??= new OutlineEncoder(this.doc));
  }

  /** The current outline, as a plan for the command to change. */
  get plan(): OutlinePlan {
    return OutlinePlan.from(this.doc);
  }

  /** The line ending new lines get: the document's dominant one. */
  get eol(): string {
    return (this.#eol ??= dominantEnding(this.doc.text));
  }

  /** The ending a new line after `line` gets: `line`'s own, or the document's after its last line. */
  ending(line: LineInfo): string {
    return line.ending || this.eol;
  }

  /** A plan of hand-written `changes` that leaves a caret at `caret`, and the outline `expected` they must produce. */
  caret(changes: ChangeSpec[], caret: number, expected: OutlinePlan, extra: Partial<CommandPlan> = {}): CommandPlan {
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree', ...extra };
  }

  /**
   * A plan that encodes `expected` with the encoder. The selection is the old one mapped along,
   * or, given `select`, chosen from what was written. Where the edit made seams that could take a
   * blank line, the plan tries them without, then each with one, then all with one, the seams around
   * new text before those within it: the first that reads as intended is written. `compare: 'flat'`
   * checks it in document order only (a heading made re-derives sections).
   */
  encode(expected: OutlinePlan, { compare = 'tree', ...options }: Pick<EncodeOptions, 'separate'> & Partial<Pick<CommandPlan, 'compare'>> = {}, select?: (writtenOutline: EncodeResult) => Selection): Outcome {
    const toPlan = (writtenOutline: EncodeResult): CommandPlan => ({
      changes: writtenOutline.changes,
      selection: select ? select(writtenOutline) : { anchor: writtenOutline.map(this.sel.anchor, 1), head: writtenOutline.map(this.sel.head, 1) },
      expected,
      compare,
      identity: writtenOutline.identity,
    });
    const first = this.encoder.encode(expected, options);
    if (typeof first === 'string') return reject('not-expressible', first);
    const tries: (EncodeOptions['pad'] | undefined)[] = [undefined];
    // the seams around new text first, then those within it, then all of them
    const seams = Array.from({ length: first.candidates }, (_, i) => i);
    for (const group of [seams.filter((i) => !first.within.has(i)), seams.filter((i) => first.within.has(i))]) {
      for (const i of group) tries.push(new Set([i]));
      if (group.length > 1) tries.push(new Set(group));
    }
    if (first.within.size && first.within.size < first.candidates) tries.push('all');
    // each try falls back to the next, written only when it's needed
    const attempt = (i: number): CommandPlan | null => {
      if (i >= tries.length) return null;
      const writtenOutline = i === 0 ? first : this.encoder.encode(expected, { ...options, pad: tries[i]! });
      if (typeof writtenOutline === 'string') return null;
      return { ...toPlan(writtenOutline), fallback: () => attempt(i + 1) };
    };
    return attempt(0)!;
}
}

/** The nodes a structural command acts on: contiguous siblings, the topmost nodes the selection touches. */
export class Operands {
  readonly nodes: readonly OutlineNode[];

  constructor(nodes: readonly OutlineNode[]) {
    this.nodes = nodes;
  }

  get first(): OutlineNode {
    return this.nodes[0]!;
  }

  get last(): OutlineNode {
    return this.nodes[this.nodes.length - 1]!;
  }

  get parent(): OutlineNode {
    return this.first.parent!;
  }

  get kind(): OutlineKind {
    return this.first.kind;
  }

  /** Whether they are of more than one kind. */
  get mixed(): boolean {
    return this.nodes.some((node) => node.kind !== this.kind);
  }

  /** The sibling before the first of them. */
  get prev(): OutlineNode | undefined {
    return this.parent.children[this.parent.children.indexOf(this.first) - 1];
  }

  /** The sibling after the last of them. */
  get next(): OutlineNode | undefined {
    return this.parent.children[this.parent.children.indexOf(this.last) + 1];
  }
}

export const normText = (lines: readonly string[]): string => lines.map((line) => trimMd(line)).join('\n');

/** Whether `node` is an item with no text of its own (a checkbox aside) but with children. */
export function isEmptyWithChildren(ctx: CommandContext, node: OutlineNode): boolean {
  const { doc } = ctx;
  if (node.kind !== 'item' || node.children.length === 0) return false;
  return !node.head || doc.isEmpty(node);
}

/** An item with no text of its own and no children (its head may be a placeholder). */
export function isEmptyItem(ctx: CommandContext, node: OutlineNode): boolean {
  const { doc } = ctx;
  if (node.kind !== 'item' || node.children.length > 0) return false;
  return doc.isEmpty(node);
}

/**
 * Whether `pos` is a space a placeholder holds as text, a deleted first character's place (`- ┃◌ x`):
 * the text's start, though `OutlineState.textStart` reads past it, never markup.
 */
export function heldSpaceAt(doc: OutlineState, pos: number): boolean {
  return doc.placeholders.includes(pos) && isSpaceOrTab(doc.text.charCodeAt(pos));
}

/**
 * The space a placeholder holds as text at `p` taken out, as leaving it or Delete there takes it: it
 * goes, the spaces after it too, and the text, at its line's text start now, is escaped where it
 * would start a block there (`- \``` x`, `\# b`), as a continuation on a later line of the text.
 * The changes, and `plan` with the node's text where it changes.
 */
export function dropHeldSpace(ctx: CommandContext, p: number, plan = ctx.plan): { changes: ChangeSpec[]; plan: OutlinePlan } {
  const { doc } = ctx;
  const line = doc.lineAt(p);
  const to = skipSpaces(doc.text, p, line.to, 1);
  const node = doc.nodeAt(p);
  const lines = node ? doc.headLines(node) : [];
  const k = node?.head ? line.index - node.head.startLine : 0;
  const rest = doc.text.slice(to, line.to);
  const escaped = k > 0 ? ctx.encoder.escape(rest, 'continuation') : ctx.encoder.escape(rest, 'start', lines.slice(1).map((l) => trimMdStart(l)));
  if (!node || escaped.at === null || k < 0 || k >= lines.length) return { changes: [{ from: p, to, insert: '' }], plan };
  lines[k] = escaped.text;
  return { changes: [{ from: p, to, insert: '' }, { from: to + escaped.at, to: to + escaped.at, insert: '\\' }], plan: plan.setText(node, normText(lines)) };
}

/**
 * Where a line a node's text continued lazily needs a `\\` as a paragraph's own line (`|---|---|`
 * under a row makes a table, `===` an underline): the offset in `line`, past its leading spaces, or
 * null where it reads as text there anyway.
 */
export function lazyLineEscape(ctx: CommandContext, line: string): number | null {
  const lead = /^[ \t]*/.exec(line)![0].length;
  const at = ctx.encoder.escape(line.slice(lead), 'continuation').at;
  return at === null ? null : lead + at;
}

/** Changes deleting whole lines (sorted indexes). Each run of adjacent lines goes with one line ending. */
export function removeLines(ctx: CommandContext, indexes: readonly number[]): ChangeSpec[] {
  const { doc } = ctx;
  const changes: ChangeSpec[] = [];
  for (let i = 0; i < indexes.length; i++) {
    const first = doc.lines[indexes[i]!]!;
    while (indexes[i + 1] === indexes[i]! + 1) i++;
    const last = doc.lines[indexes[i]!]!;
    // the run's own ending goes, or, at the end of the text, the one before it
    if (last.ending !== '' || first.index === 0) changes.push({ from: first.from, to: last.to + last.ending.length, insert: '' });
    else changes.push({ from: doc.lines[first.index - 1]!.to, to: last.to, insert: '' });
  }
  return changes;
}

/** The nodes whose own lines `from`–`to` is on; a selection ending at the very start of a line doesn't include that line. */
export function nodesOnLines(doc: OutlineState, from: number, to: number): Set<OutlineNode> {
  const lo = doc.lineAt(from).index;
  let hi = doc.lineAt(to).index;
  if (to > from && hi > lo && doc.lines[hi]!.from === to) hi--;
  const touched = new Set<OutlineNode>();
  for (let lineNo = lo; lineNo <= hi; lineNo++) {
    const n = doc.nodeAtLine(lineNo);
    if (n) touched.add(n);
  }
  return touched;
}

/**
 * The nodes a structural command acts on: the topmost nodes whose own lines the selection
 * touches. They must be contiguous siblings. Null when the selection is on no node.
 */
export function operands(ctx: CommandContext): Operands | Extract<CommandResult, { status: 'rejected' }> | null {
  const { doc } = ctx;
  const touched = nodesOnLines(doc, ctx.from, ctx.to);
  if (touched.size === 0) {
    // blank lines are the trailing gap of the node above them; above the first node, the preamble
    const owner = gapOwner(ctx, doc.lineAt(ctx.from).index);
    if (!owner) return null;
    touched.add(owner);
  }
  const tops = [...touched].filter((n) => {
    for (let p = n.parent; p; p = p.parent) if (touched.has(p)) return false;
    return true;
  });
  const parent = tops[0]!.parent!;
  const nonContiguous = { status: 'rejected', reason: 'non-contiguous' } as const;
  if (tops.some((n) => n.parent !== parent)) return nonContiguous;
  const indexes = tops.map((n) => parent.children.indexOf(n)).sort((a, b) => a - b);
  for (let i = 1; i < indexes.length; i++) if (indexes[i] !== indexes[i - 1]! + 1) return nonContiguous;
  return new Operands(indexes.map((i) => parent.children[i]!));
}

/**
 * A structural command where the selection is on no node: in the preamble's blank lines, with no node
 * above them to act on, the key is refused (the host's Tab would start indented code there); in text
 * that is no node (Obsidian's frontmatter), it is the host's.
 */
export function noOperands(ctx: CommandContext): Outcome {
  const { doc } = ctx;
  const lo = doc.lineAt(ctx.from).index;
  const hi = doc.lineAt(ctx.to).index;
  // an empty document has no line at all: as blank as one
  for (let i = lo; i <= Math.min(hi, doc.lines.length - 1); i++) if (!doc.lines[i]!.blank) return notApplicable;
  return reject('nothing-above', 'no node above the blank lines to act on');
}

/** The node whose trailing gap holds blank line `lineNo`: the node of the nearest non-blank line above. */
export function gapOwner(ctx: CommandContext, lineNo: number): OutlineNode | null {
  const { doc } = ctx;
  // an empty document has no line `lineNo`: nothing above it either
  for (let i = Math.min(lineNo, doc.lines.length - 1); i >= 0; i--) {
    if (doc.lines[i]!.blank) continue;
    return doc.nodeAtLine(i);
  }
  return null;
}

export function mapSelection(changes: readonly ChangeSpec[], sel: Selection, assoc: -1 | 1): Selection {
  return { anchor: mapPos(changes, sel.anchor, assoc), head: mapPos(changes, sel.head, assoc) };
}

export const reTaskBox = /^\[[ xX]\](?=[ \t]|$)/;


/** Whether a line is blank, or only quote markers (`>`). */
export function blankInQuote(ctx: CommandContext, line: LineInfo): boolean {
  const { doc } = ctx;
  return /^[ \t>]*$/.test(doc.text.slice(line.from, line.to));
}

/**
 * Whether a line's text, after the containers' prefix it shares with a paragraph's line above, would
 * interrupt that paragraph: from four columns in it never does, as more of the paragraph.
 */
export function interrupts(ctx: CommandContext, text: string): boolean {
  const lead = /^[ \t]*/.exec(text)![0];
  if (advanceColumns(lead, 0, lead.length, 0) >= 4) return false;
  return ctx.encoder.interruptsParagraph(trimMdStart(text));
}

/**
 * Whether a line's text right below new paragraph text would continue it, or underline it into a
 * setext heading (`-`, `- `, `===`): then a blank line has to keep them apart.
 */
export function runsOnto(ctx: CommandContext, text: string): boolean {
  return trimMd(text) !== '' && (!interrupts(ctx, text) || /^ {0,3}(?:=+|-+)[ \t]*$/.test(text));
}

/** Whether `node`'s first line comes right after its parent's own text (a paragraph). */
export function followsParentText(ctx: CommandContext, node: OutlineNode): boolean {
  const { doc } = ctx;
  const prevLeaf = doc.lines[node.startLine - 1]?.leaf;
  return prevLeaf?.type === 'paragraph' && prevLeaf.parent === node.block.parent!.parent;
}

/** Whether `line` is the closing fence of the fenced block it is in. */
export function isClosingFence(ctx: CommandContext, line: LineInfo): boolean {
  const { doc } = ctx;
  const block = line.leaf;
  if (!block || block.type !== 'code_block' || !block.fenced || line.index === block.startLine || line.index !== block.endLine) return false;
  const rest = trimMd(doc.text.slice(line.contentFrom, line.to));
  return rest.length >= block.fenceLength! && /^(.)\1*$/.test(rest) && rest[0] === block.fenceChar;
}

/**
 * Where the text of `node` ends, for a caret sent there: its text's end; in a fenced code block, the
 * end of its last code line (after the closing fence, anything typed would stop it closing the
 * block).
 */
export function textEnd(ctx: CommandContext, node: OutlineNode): number {
  const { doc } = ctx;
  const last = doc.lines[node.headEndLine]!;
  if (node.kind === 'atom' && node.block.type === 'code_block' && isClosingFence(ctx, last)) return doc.lines[node.headEndLine - 1]!.to;
  return doc.headRange(node)?.to ?? last.to;
}

/** Whether `line` is a fence: a fenced code block's opening or closing one, or a math block's `$$` or a comment's `%%` line. */
export function isFenceLine(ctx: CommandContext, line: LineInfo): boolean {
  const block = line.leaf;
  if (!block) return false;
  if (block.type === 'code_block' && block.fenced) return line.index === block.startLine || isClosingFence(ctx, line);
  if (block.type !== 'math_block' && block.type !== 'comment_block') return false;
  const delimiter = block.type === 'math_block' ? '$$' : '%%';
  return (line.index === block.startLine || line.index === block.endLine) && trimMd(ctx.doc.text.slice(line.contentFrom, line.to)).startsWith(delimiter);
}

/** Whether `line` is a code line of a fenced block: inside it, neither fence. */
export function isCodeLine(ctx: CommandContext, line: LineInfo | undefined): line is LineInfo {
  const block = line?.leaf;
  return !!line && block?.type === 'code_block' && !!block.fenced && line.index !== block.startLine && !isClosingFence(ctx, line);
}

/**
 * The prefix a new line of a paragraph starting on `first` takes: its containers' (a marker on that
 * line rewritten as indentation, as `- > a` goes on as `  > `), then the paragraph's own indentation.
 */
export function paragraphPrefix(ctx: CommandContext, first: LineInfo): string {
  const last = first.prefix[first.prefix.length - 1];
  return ctx.encoder.continuation(first.prefix) + ctx.doc.text.slice(last ? last.to : first.from, first.contentFrom);
}

/** Whether `node`'s text reads as a paragraph's: a paragraph's, an item's, a setext title's (up to its underline). */
const paragraphText = (node: OutlineNode): boolean => node.head?.type === 'paragraph' || (node.head?.type === 'heading' && !!node.head.setext);

/**
 * A paragraph's or an item's text, as these lines once an edit ends or breaks it, escaped where it
 * would read as a block: a link reference definition (`[a]: b ┃c`, split by Enter, leaves `[a]: b`),
 * a list item (`-┃a` leaves `-`): a backslash before it. The change writing it, and the lines; null
 * where it needs none.
 */
export function referenceEscape(ctx: CommandContext, node: OutlineNode, lines: readonly string[]): { change: ChangeSpec; lines: string[] } | null {
  const range = ctx.doc.headRange(node);
  if (!range || !paragraphText(node)) return null;
  const first = lines[0] ?? '';
  const lead = /^[ \t]*/.exec(first)![0].length;
  // a link reference definition, or, ended where it now ends, any block (a lone `-` is an empty item)
  const at = ctx.encoder.escape(first.slice(lead), 'start', lines.slice(1)).at;
  if (at === null || first.startsWith('\\', lead)) return null;
  return { change: { from: range.from + at, to: range.from + at, insert: '\\' }, lines: [first.slice(0, lead + at) + '\\' + first.slice(lead + at), ...lines.slice(1)] };
}

/**
 * A paragraph's or an item's line `k` of `lines` (its text as an edit leaves it), not its first, ended
 * by the edit: where it would then read as a block or a setext underline (a lone `-` under the text
 * above, a lone `#`), a backslash before it, as at the text's start (`referenceEscape`). The change
 * writing it, and the line; null where it needs none.
 */
export function continuationEscape(ctx: CommandContext, node: OutlineNode, lines: readonly string[], k: number): { change: ChangeSpec; line: string } | null {
  if (k <= 0 || !node.head) return null;
  const text = lines[k]!;
  const lead = /^[ \t]*/.exec(text)![0].length;
  const at = ctx.encoder.escape(text.slice(lead), 'continuation').at;
  if (at === null || text.startsWith('\\', lead + at)) return null;
  const pos = ctx.doc.lines[node.head.startLine + k]!.contentFrom + lead + at;
  return { change: { from: pos, to: pos, insert: '\\' }, line: text.slice(0, lead + at) + '\\' + text.slice(lead + at) };
}

/**
 * A join's fix to the escape on line `k` of a paragraph's or an item's text (not its first), from its
 * lines `before` the join and `after` it: where the escape kept the line, ended there, from reading as
 * a block (the escape `continuationEscape` wrote) and the join leaves it nothing to keep, it goes. The
 * change, and the lines; null where nothing changes.
 */
export function continuationUnescape(ctx: CommandContext, node: OutlineNode, before: readonly string[], after: readonly string[], k: number): { change: ChangeSpec; lines: string[] } | null {
  if (k <= 0 || !node.head || before[k] === undefined || after[k] === undefined) return null;
  const lead = (line: string): number => /^[ \t]*/.exec(line)![0].length;
  const escapeAt = (line: string): number => {
    const m = /^(\d*)\\(?=[!-/:-@[-`{-~])/.exec(line.slice(lead(line)));
    return m ? m[1]!.length : -1;
  };
  const at = escapeAt(after[k]!);
  if (at < 0 || escapeAt(before[k]!) !== at) return null;
  const unescape = (line: string): string => line.slice(0, lead(line) + at) + line.slice(lead(line) + at + 1);
  const reads = (line: string): boolean => ctx.encoder.escape(line.slice(lead(line)), 'continuation').at !== null;
  if (!reads(unescape(before[k]!)) || reads(unescape(after[k]!))) return null;
  const pos = ctx.doc.lines[node.head.startLine + k]!.contentFrom + lead(before[k]!) + at;
  return { change: { from: pos, to: pos + 1, insert: '' }, lines: [...after.slice(0, k), unescape(after[k]!), ...after.slice(k + 1)] };
}

/**
 * A join's fix to the escape a paragraph's or an item's text needs at its start, from its lines
 * `before` the join and `after` it: a backslash where the joined text would read as a block (a link
 * reference definition); where an escape there kept the text from reading as one and the join leaves
 * it nothing to keep (the escape a split wrote, [Enter47](../../spec/enter.md#enter47),
 * [Enter53](../../spec/enter.md#enter53)), it goes, as a join drops the escape at its seam. Null
 * where nothing changes.
 */
export function referenceFix(ctx: CommandContext, node: OutlineNode, before: readonly string[], after: readonly string[]): { change: ChangeSpec; lines: string[] } | null {
  const add = referenceEscape(ctx, node, after) ?? calloutEscape(ctx, node, after);
  if (add) return add;
  const range = ctx.doc.headRange(node);
  if (!range || !paragraphText(node)) return null;
  const lead = (ls: readonly string[]): number => /^[ \t]*/.exec(ls[0] ?? '')![0].length;
  // where the escape's backslash is: at the start, or after an ordered marker's digits
  const escapeAt = (ls: readonly string[]): number => {
    const m = /^(\d*)\\(?=[!-/:-@[-`{-~])/.exec((ls[0] ?? '').slice(lead(ls)));
    return m ? m[1]!.length : -1;
  };
  const at = escapeAt(after);
  if (at < 0 || escapeAt(before) !== at) return null;
  const unescape = (ls: readonly string[]): string[] => [ls[0]!.slice(0, lead(ls) + at) + ls[0]!.slice(lead(ls) + at + 1), ...ls.slice(1)];
  const reads = (ls: readonly string[]): boolean => ctx.encoder.escape(ls[0]!.slice(lead(ls)), 'start', ls.slice(1)).at !== null;
  if (!reads(unescape(before)) || reads(unescape(after))) return null;
  return { change: { from: range.from + at, to: range.from + at + 1, insert: '' }, lines: unescape(after) };
}

/**
 * A quote's first paragraph whose first line, as `lines` has it, would open a callout (`[!tip]`, in
 * the Obsidian flavor): escaped at its start, as a joined line written so would otherwise make the
 * quote a callout. Null where it wouldn't.
 */
export function calloutEscape(ctx: CommandContext, node: OutlineNode, lines: readonly string[]): { change: ChangeSpec; lines: string[] } | null {
  const { doc } = ctx;
  const quote = node.parent;
  const range = doc.headRange(node);
  if (doc.config.flavor !== 'obsidian' || !range || quote?.kind !== 'quote' || quote.head || quote.children[0] !== node || quote.startLine !== node.startLine) return null;
  const first = lines[0] ?? '';
  const lead = /^[ \t]*/.exec(first)![0].length;
  if (!/^\[![^\]\s]+\]/.test(first.slice(lead))) return null;
  return { change: { from: range.from, to: range.from, insert: '\\' }, lines: [first.slice(0, lead) + '\\' + first.slice(lead), ...lines.slice(1)] };
}

/**
 * A quote that is an item's first block (`- > q`), its first paragraph `node` leaving it: on the
 * marker's line it can only be the item's text, the rest of the quote staying quoted after it. The
 * plan, with the caret at the text's start; null for any other shape.
 */
export function outOfQuoteOpeningItem(ctx: CommandContext, node: OutlineNode): Outcome | null {
  const { doc } = ctx;
  const quote = node.parent!;
  const item = quote.parent;
  if (quote.kind !== 'quote' || quote.head || quote.children[0] !== node || node.kind !== 'paragraph') return null;
  // on the marker's line, or on the line after an empty item's (`- [ ]` / `  > q`), which its text can start on
  if (item?.kind !== 'item' || item.children[0] !== quote || (quote.startLine !== item.startLine && quote.startLine !== item.startLine + 1) || !doc.isEmpty(item)) return null;
  let planned: OutlinePlanNode | undefined;
  const lines = doc.headLines(node);
  // an empty task keeps its checkbox, before the text
  const box = /^\[[ xX]\]/.exec(trimMd(doc.nodeText(item)))?.[0];
  if (box) lines[0] = `${box} ${trimMdStart(lines[0]!)}`;
  const expected = (quote.children.length === 1 ? ctx.plan.remove([quote]) : ctx.plan.remove([node])).update(item, (n) => (planned = { ...n, text: normText(lines), lines }));
  return ctx.encode(expected, {}, (written) => {
    const caret = written.at(planned!, 0, box ? box.length + 1 : 0);
    return { anchor: caret, head: caret };
  });
}
