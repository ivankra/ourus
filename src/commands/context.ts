// One command's context, the operands of a structural command, and the helpers commands share.

import { OutlineState, type OutlineKind, type OutlineNode } from '../outline/index.ts';
import type { Flavor, LineInfo, PrefixPiece } from '../parser/index.ts';
import { dominantEnding, mapPos, skipSpaces, type ChangeSpec } from '../text.ts';
import { OutlineEncoder, OutlinePlan, type EncodeOptions, type EncodeResult } from '../encoder/index.ts';
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
   * reads as intended is written.
   */
  encode(expected: OutlinePlan, options: Pick<EncodeOptions, 'separate'> = {}, select?: (writtenOutline: EncodeResult) => Selection): Outcome {
      const toPlan = (writtenOutline: EncodeResult): CommandPlan => ({
      changes: writtenOutline.changes,
      selection: select ? select(writtenOutline) : { anchor: writtenOutline.map(this.sel.anchor, 1), head: writtenOutline.map(this.sel.head, 1) },
      expected,
      compare: 'tree',
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
function gapOwner(ctx: CommandContext, lineNo: number): OutlineNode | null {
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

/** Whether `line` is a code line of a fenced block: inside it, neither fence. */
export function isCodeLine(ctx: CommandContext, line: LineInfo | undefined): line is LineInfo {
  const block = line?.leaf;
  return !!line && block?.type === 'code_block' && !!block.fenced && line.index !== block.startLine && !isClosingFence(ctx, line);
}
