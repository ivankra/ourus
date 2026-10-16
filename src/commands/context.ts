// One command's context, the operands of a structural command, and the helpers commands share.

import { OutlineState, type OutlineKind, type OutlineNode } from '../outline/index.ts';
import type { Flavor, LineInfo, PrefixPiece } from '../parser/index.ts';
import { dominantEnding, mapPos, skipSpaces, type ChangeSpec } from '../text.ts';
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
   * blank line, the plan tries them without, then each with one, then all with one: the first that
   * reads as intended is written. `compare: 'flat'` checks it in document order only (a heading made
   * re-derives sections).
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
    for (let i = 0; i < first.candidates; i++) tries.push(new Set([i]));
    if (first.candidates > 1) tries.push('all');
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

export const normText = (lines: readonly string[]): string => lines.map((line) => line.trim()).join('\n');

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

/**
 * The nodes a structural command acts on: the topmost nodes whose own lines the selection
 * touches. They must be contiguous siblings. Null when the selection is on no node.
 */
export function operands(ctx: CommandContext): Operands | Extract<CommandResult, { status: 'rejected' }> | null {
  const { doc } = ctx;
  const from = ctx.from;
  let to = ctx.to;
  const lo = doc.lineAt(from).index;
  let hi = doc.lineAt(to).index;
  // a selection ending at the very start of a line doesn't include that line
  if (to > from && hi > lo && doc.lines[hi]!.from === to) hi--;
  const touched = new Set<OutlineNode>();
  for (let lineNo = lo; lineNo <= hi; lineNo++) {
    const n = doc.nodeAtLine(lineNo);
    if (n) touched.add(n);
  }
  if (touched.size === 0) {
    // blank lines are the trailing gap of the node above them; above the first node, the preamble
    const owner = gapOwner(ctx, lo);
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
  for (let i = lo; i <= hi; i++) if (!doc.lines[i]!.blank) return notApplicable;
  return reject('nothing-above', 'no node above the blank lines to act on');
}

/** The node whose trailing gap holds blank line `lineNo`: the node of the nearest non-blank line above. */
export function gapOwner(ctx: CommandContext, lineNo: number): OutlineNode | null {
  const { doc } = ctx;
  for (let i = lineNo; i >= 0; i--) {
    if (doc.lines[i]!.blank) continue;
    return doc.nodeAtLine(i);
  }
  return null;
}

export const lineEndWithEnding = (doc: OutlineState, lineNo: number): number => doc.lines[lineNo]!.to + doc.lines[lineNo]!.ending.length;

export function mapSelection(changes: readonly ChangeSpec[], sel: Selection, assoc: -1 | 1): Selection {
  return { anchor: mapPos(changes, sel.anchor, assoc), head: mapPos(changes, sel.head, assoc) };
}

export const reTaskBox = /^\[[ xX]\](?=[ \t]|$)/;


/** Whether a line is blank, or only quote markers (`>`). */
export function blankInQuote(ctx: CommandContext, line: LineInfo): boolean {
  const { doc } = ctx;
  return /^[\s>]*$/.test(doc.text.slice(line.from, line.to));
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
  const rest = doc.text.slice(line.contentFrom, line.to).trim();
  return rest.length >= block.fenceLength! && /^(.)\1*$/.test(rest) && rest[0] === block.fenceChar;
}

/** Whether `line` is a fence: a fenced code block's opening or closing one, or a math block's `$$` or a comment's `%%` line. */
export function isFenceLine(ctx: CommandContext, line: LineInfo): boolean {
  const block = line.leaf;
  if (!block) return false;
  if (block.type === 'code_block' && block.fenced) return line.index === block.startLine || isClosingFence(ctx, line);
  if (block.type !== 'math_block' && block.type !== 'comment_block') return false;
  const delimiter = block.type === 'math_block' ? '$$' : '%%';
  return (line.index === block.startLine || line.index === block.endLine) && ctx.doc.text.slice(line.contentFrom, line.to).trim().startsWith(delimiter);
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

/**
 * A paragraph's or an item's text, as these lines once an edit ends or breaks it, escaped where it
 * would read as a block: a link reference definition (`[a]: b ┃c`, split by Enter, leaves `[a]: b`),
 * a list item (`-┃a` leaves `-`): a backslash before it. The change writing it, and the lines; null
 * where it needs none.
 */
export function referenceEscape(ctx: CommandContext, node: OutlineNode, lines: readonly string[]): { change: ChangeSpec; lines: string[] } | null {
  const range = ctx.doc.headRange(node);
  if (!range || node.head?.type !== 'paragraph') return null;
  const first = lines[0] ?? '';
  const lead = /^[ \t]*/.exec(first)![0].length;
  // a link reference definition, or, ended where it now ends, any block (a lone `-` is an empty item)
  const at = ctx.encoder.escape(first.slice(lead), 'start', lines.slice(1)).at;
  if (at === null || first.startsWith('\\', lead)) return null;
  return { change: { from: range.from + at, to: range.from + at, insert: '\\' }, lines: [first.slice(0, lead + at) + '\\' + first.slice(lead + at), ...lines.slice(1)] };
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
  const add = referenceEscape(ctx, node, after);
  if (add) return add;
  const range = ctx.doc.headRange(node);
  if (!range || node.head?.type !== 'paragraph') return null;
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
 * A quote that is an item's first block (`- > q`), its first paragraph `node` leaving it: on the
 * marker's line it can only be the item's text, the rest of the quote staying quoted after it. The
 * plan, with the caret at the text's start; null for any other shape.
 */
export function outOfQuoteOpeningItem(ctx: CommandContext, node: OutlineNode): Outcome | null {
  const { doc } = ctx;
  const quote = node.parent!;
  const item = quote.parent;
  if (quote.kind !== 'quote' || quote.head || quote.children[0] !== node || node.kind !== 'paragraph') return null;
  if (item?.kind !== 'item' || item.children[0] !== quote || quote.startLine !== item.startLine || !doc.isEmpty(item)) return null;
  let planned: OutlinePlanNode | undefined;
  const lines = doc.headLines(node);
  const expected = (quote.children.length === 1 ? ctx.plan.remove([quote]) : ctx.plan.remove([node])).update(item, (n) => (planned = { ...n, text: normText(lines), lines }));
  return ctx.encode(expected, {}, (written) => {
    const caret = written.at(planned!, 0, 0);
    return { anchor: caret, head: caret };
  });
}
