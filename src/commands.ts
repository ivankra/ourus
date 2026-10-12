// Structural commands.
//
// Each command plans text changes for an intended outline change, re-parses the result, and
// compares the new outline with the intended one. A mismatch rejects the command
// (`encoding-failed`) rather than writing a document that doesn't say what was meant.

import { OutlineDoc, type OutlineDocApplyParams } from './doc.ts';
import type { OutlineKind, OutlineNode } from './outline.ts';
import { startsBlock } from './syntax/commonmark.ts';
import { scanReference } from './syntax/refdef.ts';
import type { Block, LineInfo, PrefixPiece } from './block.ts';
import { advanceColumns, applyChanges, composeChanges, dominantEnding, mapPos, type TextChange } from './text.ts';
import {
  asNewNode,
  contentOf,
  editNode,
  editable,
  nodeDifference,
  outlineDifference,
  reindent,
  usesTabs,
  writeOutline,
  type EditedOutlineNode,
  type OutlineText,
  type OutlineWriteOptions,
  type WrittenOutline,
  isEdited,
  withOwnedLists,
} from './outline-editor.ts';

export type Command =
  | { readonly type: 'indent' }
  | { readonly type: 'outdent' }
  | { readonly type: 'moveBlockUp' }
  | { readonly type: 'moveBlockDown' }
  /** Enter: split the node at the caret. */
  | { readonly type: 'enter' }
  /** Shift-Enter: a line break inside the node's text, which stays one node. */
  | { readonly type: 'shiftEnter' }
  /** Backspace at the start of a node: join it to the node above. */
  | { readonly type: 'deleteContentBackward' }
  /** Delete at the end of a node: join the node below to it. */
  | { readonly type: 'deleteContentForward' }
  /** Cmd-Backspace: delete back to the start of the line's text, never into a marker. */
  | { readonly type: 'deleteSoftLineBackward' }
  /** Paste: Markdown text placed as nodes. */
  | { readonly type: 'pasteStructured'; readonly text: string }
  /** Paste as plain text (Ctrl-Shift-V): the text goes into the node at the caret, its line breaks as Shift-Enter's. */
  | { readonly type: 'pastePlain'; readonly text: string }
  /** The selected nodes go, with their subtrees. */
  | { readonly type: 'deleteSubtree' }
  /** A copy of the selected nodes, with their subtrees, goes below them. */
  | { readonly type: 'duplicateNode' };

export interface Selection {
  readonly anchor: number;
  readonly head: number;
}

export type RejectReason =
  | 'no-previous-sibling'
  | 'no-next-sibling'
  | 'at-top-level'
  | 'at-h1-bound'
  | 'at-h6-bound'
  | 'not-expressible'
  | 'non-contiguous'
  | 'mixed-kinds'
  | 'has-children'
  | 'nothing-above'
  | 'encoding-failed';

export type Result =
  | { readonly status: 'applied'; readonly doc: OutlineDoc; readonly changes: readonly TextChange[]; readonly selection: Selection }
  | { readonly status: 'rejected'; readonly reason: RejectReason; readonly detail?: string }
  /** The command doesn't apply here; the host should run its default behaviour. */
  | { readonly status: 'notApplicable' };

export function execute(doc: OutlineDoc, command: Command, selection: Selection): Result {
  const plan = planCommand(doc, command, selection);
  if ('status' in plan) return plan;
  const result = run(doc, plan);
  // an empty node left away from the caret can't be written: refused, not a writer's failure
  if (result.status === 'rejected' && result.reason === 'encoding-failed' && emptyAwayFromCaret(doc, plan.expected, doc.nodeAt(selection.head))) {
    return reject('not-expressible', 'an empty node away from the caret') as Result;
  }
  return result;
}

/** Verifies a plan (renumbered where it needs it), then its fallback if it doesn't read as intended. */
function run(doc: OutlineDoc, plan: Plan): Result {
  // renumbering is best effort: a marker that grows a digit can move its item's content column
  const numbered = plan.keepNumbers ? null : renumber(doc, plan);
  if (numbered) {
    const result = verify(doc, numbered);
    if (result.status === 'applied') return result;
  }
  const result = verify(doc, plan);
  const fallback = result.status === 'rejected' ? plan.fallback?.() : null;
  return fallback ? run(doc, fallback) : result;
}

const orderedItems = new WeakMap<OutlineDoc, boolean>();

/** Whether `doc` has an ordered list item, remembered per document. */
function hasOrderedItems(doc: OutlineDoc): boolean {
  let has = orderedItems.get(doc);
  if (has === undefined) orderedItems.set(doc, (has = doc.nodes.some((node) => node.kind === 'item' && node.block.list?.type === 'ordered')));
  return has;
}

/**
 * Renumbers the ordered lists whose items a plan adds, removes or reorders. A changed list counts
 * from the start of the list its first surviving item came from, so removing the head of `1. 2. 3.`
 * makes the rest `1. 2.`; the lower part of a list split in two keeps its own numbers. A list
 * keeping its items keeps its numbers, however they run, and lists numbered all alike (`1.` `1.`
 * `1.`) are left alone. A marker that changes width carries the item's other lines along. Null
 * when nothing needs renumbering.
 */
function renumber(doc: OutlineDoc, plan: Plan): Plan | null {
  // nothing to renumber without an ordered list, before or written
  if (!hasOrderedItems(doc) && !plan.changes.some((change) => /(?:^|\n)[ \t>]*\d{1,9}[.)]/.test(change.insert))) return null;
  const text = applyChanges(doc.text, plan.changes);
  const next = doc.apply(plan.changes, {
    ...(plan.identity ? { identity: plan.identity } : {}),
    placeholders: [...(plan.placeholders ?? []), plan.selection.head],
  });
  const itemIds = (d: OutlineDoc): Map<Block, number> => new Map(d.nodes.filter((n) => n.kind === 'item').map((n) => [n.block, n.id]));
  const before = itemIds(doc);
  const after = itemIds(next);
  const oldItem = new Map<number, Block>();
  for (const [item, id] of before) oldItem.set(id, item);
  const newList = new Map<number, Block>();
  for (const [item, id] of after) newList.set(id, item.parent!);
  const changed = (list: Block): boolean => {
    const ids = list.children.map((item) => after.get(item));
    // a list the outline doesn't reach into (inside a quote) no command changed
    if (ids.some((id) => id === undefined)) return false;
    const old = oldItem.get(ids[0]!)?.parent;
    return !old || old.children.length !== ids.length || old.children.some((item, i) => before.get(item) !== ids[i]);
  };
  const startOf = (list: Block, numbers: readonly number[]): number => {
    const known = list.children.find((item) => oldItem.has(after.get(item)!));
    const old = known && oldItem.get(after.get(known)!)!.parent!;
    if (!old) return numbers[0]!;
    // the old list's head still opens an earlier list beside this one: this is the lower part of a split
    const headList = newList.get(before.get(old.children[0]!)!);
    if (headList && headList !== list && headList.parent === list.parent && headList.startLine < list.startLine) return numbers[0]!;
    return parseInt(doc.text.slice(old.children[0]!.markerFrom!, old.children[0]!.markerTo!), 10);
  };
  const tabs = usesTabs(next);
  const extra: TextChange[] = [];
  let failed = false;
  const walk = (b: Block): void => {
    if (b.type === 'list' && b.list!.type === 'ordered') {
      const numbers = b.children.map((item) => parseInt(text.slice(item.markerFrom!, item.markerTo!), 10));
      const alike = numbers.length > 1 && numbers.every((n) => n === numbers[0]);
      if (!alike && changed(b)) {
        const start = startOf(b, numbers);
        b.children.forEach((item, i) => {
          if (numbers[i] === start + i) return;
          const marker = `${start + i}${item.list!.delimiter}`;
          extra.push({ from: item.markerFrom!, to: item.markerTo!, insert: marker });
          // a wider or narrower marker moves the item's content column: its other lines follow
          const delta = marker.length - (item.markerTo! - item.markerFrom!);
          for (let lineNo = item.startLine + 1; lineNo <= item.endLine && delta !== 0; lineNo++) {
            const c = reindent(next, lineNo, item, item, delta, tabs);
            if (c === 'fail') failed = true;
            else if (c) extra.push(c);
          }
        });
      }
    }
    b.children.forEach(walk);
  };
  walk(next.blocks);
  if (failed) return null;

  // Items the plan keeps in their list, which the planned text no longer reads as items: a list
  // that lost its head and now starts at `2.` can't interrupt the text above it. They renumber
  // from the old list's start, where their markers landed.
  const expectedParent = new Map<number | null, number | null>();
  const visit = (n: OutlineNode | EditedOutlineNode): void => n.children.forEach((c) => (expectedParent.set(c.id, n.id), visit(c)));
  visit(plan.expected);
  const lists = new Set<Block>();
  for (const n of doc.nodes) if (n.kind === 'item' && n.block.list!.type === 'ordered') lists.add(n.block.parent!);
  for (const list of lists) {
    const nodes = list.children.map((item) => doc.node(before.get(item)!)!);
    const owner = nodes[0]!.parent!.id;
    const kept = nodes.filter((n) => expectedParent.get(n.id) === owner);
    if (kept.length === nodes.length || kept.every((n) => next.node(n.id)?.kind === 'item')) continue;
    const start = parseInt(doc.text.slice(list.children[0]!.markerFrom!, list.children[0]!.markerTo!), 10);
    kept.forEach((n, i) => {
      const old = doc.text.slice(n.block.markerFrom!, n.block.markerTo!);
      const at = mapPos(plan.changes, n.block.markerFrom!, 1);
      const marker = `${start + i}${n.block.list!.delimiter}`;
      if (text.slice(at, at + old.length) === old && old !== marker && !extra.some((c) => c.from === at)) {
        extra.push({ from: at, to: at + old.length, insert: marker });
      }
    });
  }
  if (extra.length === 0) return null;
  const sel = plan.selection;
  return {
    ...plan,
    changes: composeChanges(doc.text, plan.changes, extra),
    selection: { anchor: mapPos(extra, sel.anchor, -1), head: mapPos(extra, sel.head, -1) },
    ...(plan.identity ? { identity: new Map([...plan.identity].map(([k, v]) => [mapPos(extra, k, -1), v])) } : {}),
    ...(plan.placeholders ? { placeholders: plan.placeholders.map((p) => mapPos(extra, p, 1)) } : {}),
  };
}

// ------------------------------------------------------------------ plans and verification

interface Plan {
  readonly changes: TextChange[];
  /** Selection in the new text. */
  readonly selection: Selection;
  /** The outline the changes must produce. */
  readonly expected: OutlineNode | EditedOutlineNode;
  /** `flat` compares nodes in document order only (heading level changes re-derive sections). */
  readonly compare: 'tree' | 'flat';
  /** Ids of moved nodes, by their head start in the new text. */
  readonly identity?: Map<number, number>;
  /** Placeholders the result needs, in the new text (see `OutlineDoc.placeholders`). */
  readonly placeholders?: readonly number[];
  /** Placeholders of the old document the result goes without. */
  readonly drop?: readonly number[];
  /** Another encoding to try when this one doesn't read as intended, made when it's needed. */
  readonly fallback?: () => Plan | null;
  /** Leave ordered lists' numbers as written (a paste keeps the numbers it brings). */
  readonly keepNumbers?: boolean;
}

type Outcome = Plan | Extract<Result, { status: 'rejected' | 'notApplicable' }>;

const notApplicable = { status: 'notApplicable' } as const;
const reject = (reason: RejectReason, detail?: string): Outcome =>
  detail === undefined ? { status: 'rejected', reason } : { status: 'rejected', reason, detail };

function nodeText(doc: OutlineDoc, node: OutlineNode): string {
  const lines = doc.headLines(node);
  return node.kind === 'atom' ? lines.join('\n') : normText(lines);
}

const normText = (lines: readonly string[]): string => lines.map((line) => line.trim()).join('\n');

/** How verification reads node text in `old` and in `next`. */
const texts = (old: OutlineDoc, next: OutlineDoc): OutlineText => ({ old: (n) => nodeText(old, n), new: (n) => nodeText(next, n) });

/** The nodes of an outline in document order, root first. */
function inOrder(n: OutlineNode | EditedOutlineNode, out: (OutlineNode | EditedOutlineNode)[] = []): (OutlineNode | EditedOutlineNode)[] {
  out.push(n);
  for (const c of n.children) inOrder(c, out);
  return out;
}

/** Where `next`'s outline differs from `expected`: as trees, or (`flat`) node by node in document order. */
function difference(doc: OutlineDoc, next: OutlineDoc, intended: OutlineNode | EditedOutlineNode, compare: Plan['compare']): string | null {
  // what the command meant, read as the text will read it
  const expected = withOwnedLists(intended);
  if (compare === 'tree') return outlineDifference(expected, next.outline, texts(doc, next));
  const want = inOrder(expected);
  const got = next.nodes;
  for (let i = 0; i < Math.max(want.length, got.length); i++) {
    if (!want[i] || !got[i]) return `${want.length} nodes, got ${got.length}`;
    const d = nodeDifference(want[i]!, got[i]!, texts(doc, next));
    if (d) return `node ${i}: ${d}`;
  }
  return null;
}

function verify(doc: OutlineDoc, plan: Plan): Result {
  const attempt = (options: OutlineDocApplyParams): OutlineDoc | string => {
    const next = doc.apply(plan.changes, options);
    return difference(doc, next, plan.expected, plan.compare) ?? next;
  };
  const base = { ...(plan.identity ? { identity: plan.identity } : {}), placeholders: plan.placeholders ?? [] };
  // A placeholder at the caret only when the text alone can't say what was meant: an
  // empty item right after a paragraph reads as a setext underline without one.
  const caret = plan.selection.anchor === plan.selection.head ? plan.selection.head : -1;
  const newText = applyChanges(doc.text, plan.changes);
  const [lineStart, lineEnd] = lineSpan(newText, Math.max(caret, 0));
  const onCaretLine = (p: number) => caret >= 0 && p >= lineStart && p <= lineEnd;
  const drop = doc.placeholders.filter((p) => onCaretLine(mapPos(plan.changes, p, 1)));
  let next = attempt({ ...base, drop: [...drop, ...(plan.drop ?? [])] });
  if (typeof next === 'string' && caret >= 0) {
    const retry = attempt({ ...base, drop: [...(plan.drop ?? [])], placeholders: [...base.placeholders, caret] });
    if (typeof retry !== 'string') next = retry;
  }
  if (typeof next === 'string') return { status: 'rejected', reason: 'encoding-failed', detail: next };
  return { status: 'applied', doc: next, changes: plan.changes, selection: plan.selection };
}

/** Start and end (before its line ending) of the line containing `pos`. */
function lineSpan(text: string, pos: number): [number, number] {
  let start = pos;
  while (start > 0 && text.charCodeAt(start - 1) !== 10 && text.charCodeAt(start - 1) !== 13) start--;
  let end = pos;
  while (end < text.length && text.charCodeAt(end) !== 10 && text.charCodeAt(end) !== 13) end++;
  return [start, end];
}

/** An item with no text of its own and no children (its head may be a placeholder). */
/** Whether `node` is an item with no text of its own (a checkbox aside) but with children. */
function isEmptyWithChildren(doc: OutlineDoc, node: OutlineNode): boolean {
  if (node.kind !== 'item' || node.children.length === 0) return false;
  return !node.head || (node.head.type === 'paragraph' && isEmptyText(doc.headLines(node).join('\n')));
}

function isEmptyItem(doc: OutlineDoc, node: OutlineNode): boolean {
  if (node.kind !== 'item' || node.children.length > 0) return false;
  if (node.head && node.head.type !== 'paragraph') return false;
  return isEmptyText(doc.headLines(node).join('\n'));
}

/** Whether a node's text is empty: nothing, or only a task's checkbox, which is markup. */
const isEmptyText = (text: string): boolean => text.trim().replace(/^\[[ xX]\]/, '').trim() === '';

/**
 * Whether `expected` holds an empty item or paragraph other than `caretNode`. The text can't hold
 * one away from the caret, where no placeholder is: such a command isn't expressible.
 */
function emptyAwayFromCaret(doc: OutlineDoc, expected: OutlineNode | EditedOutlineNode, caretNode: OutlineNode | null): boolean {
  const empty = (node: OutlineNode | EditedOutlineNode): boolean => {
    if ((node.kind !== 'item' && node.kind !== 'paragraph') || node.children.length > 0) return false;
    const old = isEdited(node) ? node.from : node;
    if (old && old === caretNode) return false;
    const text = isEdited(node) ? (node.text ?? (old ? nodeText(doc, old) : '')) : nodeText(doc, node);
    return isEmptyText(text);
  };
  const visit = (node: OutlineNode | EditedOutlineNode): boolean => empty(node) || node.children.some(visit);
  return expected.children.some(visit);
}

/**
 * Settles placeholders the caret has left. A place the text can express without help
 * (an empty item after another item) just stops being a placeholder; the line of one it can't (an
 * empty item right after a paragraph, an empty line inside a paragraph or between blocks) is
 * removed. Returns null when nothing changes.
 */
export function settle(doc: OutlineDoc, caret: number): { changes: TextChange[]; doc: OutlineDoc } | null {
  const [start, end] = lineSpan(doc.text, caret);
  const abandoned = doc.placeholders.filter((p) => p < start || p > end);
  if (abandoned.length === 0) return null;
  // a placeholder the text can do without just goes
  const matters = abandoned.filter((p) => {
    // an empty last line (after the final line ending) holds nothing to remove
    if (p === doc.text.length && /[\r\n]$/.test(doc.text)) return false;
    const without = OutlineDoc.parse(doc.text, { placeholders: doc.placeholders.filter((q) => q !== p), config: doc.config });
    return outlineDifference(doc.outline, without.outline, texts(doc, without)) !== null;
  });
  if (matters.length === 0) return { changes: [], doc: doc.apply([], { drop: abandoned }) };
  // a deleted character's place after a marker: leaving it, the surplus space goes
  const spaces = matters.filter((p) => doc.text[p] === ' ' || doc.text[p] === '\t');
  if (spaces.length) {
    const changes = spaces.map((p) => {
      let to = p;
      while (doc.text[to] === ' ' || doc.text[to] === '\t') to++;
      return { from: p, to, insert: '' };
    });
    const next = doc.apply(changes, { drop: [...abandoned] });
    if (outlineDifference(doc.outline, next.outline, texts(doc, next)) === null) return { changes, doc: next };
  }
  // an empty item the text can hold set off by a blank line (an empty child under text, an empty
  // item right after a paragraph) stays, written that way
  const kept = keptApart(doc, matters, abandoned);
  if (kept) return kept;
  // the others take their node with them: an empty node goes (what it held goes back to its place),
  // an empty line inside a node's text goes from it; the outline editor writes it
  let expected: OutlineNode | EditedOutlineNode = doc.outline;
  const done = new Set<OutlineNode>();
  for (const p of matters) {
    const lineNo = doc.lineAt(p).index;
    const node = doc.nodeAtLine(lineNo);
    // an empty node can span several placeholder lines: it goes once
    if (!node || !node.parent || done.has(node)) continue;
    done.add(node);
    const text = doc.headLines(node);
    if (isEmptyText(text.join('\n'))) {
      expected = place(expected, node.parent.id, node.id, 'instead', node.children);
      continue;
    }
    const { lines } = contentOf(doc, node);
    const index = lineNo - doc.lines.findIndex((line) => doc.nodeAtLine(line.index) === node);
    expected = editNode(expected, node.id, (n) => ({
      ...n,
      text: normText(text.filter((_, i) => i !== index)),
      lines: lines!.filter((_, i) => i !== index),
    }));
  }
  if (!isEdited(expected)) return null;
  const plan = written(doc, expected, { anchor: caret, head: caret });
  if ('status' in plan) return null;
  // what can't be written as meant stays as it is, its placeholder kept
  const result = run(doc, { ...plan, drop: abandoned });
  return result.status === 'applied' ? { changes: [...result.changes], doc: result.doc } : null;
}

/**
 * The empty items of `placeholders` kept by a blank line above each, which lets the text hold them:
 * the result, when the text then reads as the outline did, or null.
 */
function keptApart(doc: OutlineDoc, placeholders: readonly number[], abandoned: readonly number[]): { changes: TextChange[]; doc: OutlineDoc } | null {
  const changes: TextChange[] = [];
  for (const p of placeholders) {
    const line = doc.lineAt(p);
    const node = doc.nodeAtLine(line.index);
    if (!node || node.kind !== 'item' || node.startLine !== line.index || !isEmptyItem(doc, node)) return null;
    // the blank line keeps the quotes around the item
    const piece = line.prefix.find((candidate) => candidate.block === node.block);
    const blank = doc.text.slice(line.from, piece ? piece.from : line.from).trimEnd();
    changes.push({ from: line.from, to: line.from, insert: blank + (line.ending || dominantEnding(doc.text)) });
  }
  const next = doc.apply(changes, { drop: [...abandoned] });
  return outlineDifference(doc.outline, next.outline, texts(doc, next)) === null ? { changes, doc: next } : null;
}

/** Changes deleting whole lines (sorted indexes). Each run of adjacent lines goes with one line ending. */
function removeLines(doc: OutlineDoc, indexes: readonly number[]): TextChange[] {
  const changes: TextChange[] = [];
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

// ------------------------------------------------------------------ editing the expected outline

type Tree = OutlineNode | EditedOutlineNode;

/** A node the command creates. */
const created = (kind: OutlineKind, text: string): EditedOutlineNode => ({ id: null, kind, text, children: [] });

/** `root` with node `id`'s own text set. */
const withText = (root: Tree, id: number, text: string): EditedOutlineNode => editNode(root, id, (n) => ({ ...n, text }));

/** `root` without `nodes` among node `parentId`'s children. */
function remove(root: Tree, parentId: number, nodes: readonly Tree[]): EditedOutlineNode {
  return editNode(root, parentId, (p) => ({ ...p, children: p.children.filter((c) => !nodes.some((n) => n.id === c.id)) }));
}

/** `root` with `nodes` among node `parentId`'s children: in place of child `id`, or before or after it. */
function place(root: Tree, parentId: number, id: number, where: 'instead' | 'before' | 'after', nodes: readonly Tree[]): EditedOutlineNode {
  return editNode(root, parentId, (p) => {
    const i = p.children.findIndex((c) => c.id === id);
    const at = where === 'after' ? i + 1 : i;
    return { ...p, children: [...p.children.slice(0, at), ...nodes, ...p.children.slice(where === 'instead' ? i + 1 : at)] };
  });
}

/** `root` with `nodes` added to node `id`'s children, first or last. */
function append(root: Tree, id: number, where: 'first' | 'last', nodes: readonly Tree[]): EditedOutlineNode {
  return editNode(root, id, (n) => ({ ...n, children: where === 'first' ? [...nodes, ...n.children] : [...n.children, ...nodes] }));
}

// ------------------------------------------------------------------ dispatch

function planCommand(doc: OutlineDoc, command: Command, selection: Selection): Outcome {
  switch (command.type) {
    case 'indent':
    case 'outdent':
    case 'moveBlockUp':
    case 'moveBlockDown': {
      const run = operands(doc, selection);
      if (run === null) return notApplicable;
      if ('status' in run) return run;
      const kind = run[0]!.kind;
      if (run.some((n) => n.kind !== kind)) return reject('mixed-kinds');
      if (command.type === 'moveBlockUp') return move(doc, run, -1, selection);
      if (command.type === 'moveBlockDown') return move(doc, run, 1, selection);
      const delta = command.type === 'indent' ? 1 : -1;
      if (kind === 'heading') return headingLevel(doc, run, delta, selection);
      if (kind === 'paragraph' && delta > 0) return indentParagraphs(doc, run, selection);
      // out of a quote, any node: it follows the quote
      if (delta < 0 && run[0]!.parent!.kind === 'quote') return leaveQuote(doc, run, selection);
      if (kind !== 'item') return reject('not-expressible');
      return delta > 0 ? indent(doc, run, selection) : outdent(doc, run, selection);
    }
    case 'enter':
      return split(doc, selection);
    case 'shiftEnter':
      return lineBreak(doc, selection);
    case 'deleteContentBackward':
      return join(doc, selection);
    case 'deleteContentForward':
      return joinForward(doc, selection);
    case 'deleteSoftLineBackward':
      return deleteToTextStart(doc, selection);
    case 'pasteStructured':
      return paste(doc, selection, command.text);
    case 'pastePlain':
      return pastePlain(doc, selection, command.text);
    case 'deleteSubtree':
      return deleteSubtree(doc, selection);
    case 'duplicateNode':
      return duplicate(doc, selection);
  }
}

/**
 * The nodes a structural command acts on: the topmost nodes whose own lines the selection
 * touches. They must be contiguous siblings. Null when the selection is on no node.
 */
function operands(doc: OutlineDoc, sel: Selection): OutlineNode[] | Extract<Result, { status: 'rejected' }> | null {
  const from = Math.min(sel.anchor, sel.head);
  let to = Math.max(sel.anchor, sel.head);
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
    const owner = gapOwner(doc, lo);
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
  return indexes.map((i) => parent.children[i]!);
}

/** The node whose trailing gap holds blank line `lineNo`: the node of the nearest non-blank line above. */
function gapOwner(doc: OutlineDoc, lineNo: number): OutlineNode | null {
  for (let i = lineNo; i >= 0; i--) {
    if (doc.lines[i]!.blank) continue;
    return doc.nodeAtLine(i);
  }
  return null;
}

// ------------------------------------------------------------------ indentation

/**
 * A plan that writes `expected` with the outline writer. The selection is the old one mapped along,
 * or, given `select`, chosen from what was written. Where the edit made seams that could take a
 * blank line, the plan tries them without, then each with one, then all with one: the first that
 * reads as intended is written.
 */
function written(
  doc: OutlineDoc,
  expected: EditedOutlineNode,
  sel: Selection,
  options: Pick<OutlineWriteOptions, 'separate'> = {},
  select?: (writtenOutline: WrittenOutline) => Selection,
): Outcome {
  const owned = withOwnedLists(expected);
  const toPlan = (writtenOutline: WrittenOutline): Plan => ({
    changes: writtenOutline.changes,
    selection: select ? select(writtenOutline) : { anchor: writtenOutline.map(sel.anchor, 1), head: writtenOutline.map(sel.head, 1) },
    expected,
    compare: 'tree',
    identity: writtenOutline.identity,
  });
  const first = writeOutline(doc, owned, options);
  if (typeof first === 'string') return reject('not-expressible', first);
  const tries: (OutlineWriteOptions['pad'] | undefined)[] = [undefined];
  for (let i = 0; i < first.candidates; i++) tries.push(new Set([i]));
  if (first.candidates > 1) tries.push('all');
  // each try falls back to the next, written only when it's needed
  const attempt = (i: number): Plan | null => {
    if (i >= tries.length) return null;
    const writtenOutline = i === 0 ? first : writeOutline(doc, owned, { ...options, pad: tries[i]! });
    if (typeof writtenOutline === 'string') return null;
    return { ...toPlan(writtenOutline), fallback: () => attempt(i + 1) };
  };
  return attempt(0)!;
}

/** The run leaves its quote, to follow it. */
function leaveQuote(doc: OutlineDoc, run: OutlineNode[], sel: Selection): Outcome {
  const quote = run[0]!.parent!;
  // a quote the run empties goes: the run takes its place
  if (run.length === quote.children.length) return written(doc, place(doc.outline, quote.parent!.id, quote.id, 'instead', run), sel);
  return written(doc, place(remove(doc.outline, quote.id, run), quote.parent!.id, quote.id, 'after', run), sel);
}

/** The run becomes the last children of the item (or quote) above it. */
function indent(doc: OutlineDoc, run: OutlineNode[], sel: Selection): Outcome {
  const parent = run[0]!.parent!;
  const prev = parent.children[parent.children.indexOf(run[0]!) - 1];
  if (!prev) return reject('no-previous-sibling');
  if (prev.kind === 'quote') return written(doc, append(remove(doc.outline, parent.id, run), prev.id, 'last', run), sel);
  if (prev.kind !== 'item') return reject('not-expressible', 'only a list item can hold list items');
  return written(doc, append(remove(doc.outline, parent.id, run), prev.id, 'last', run), sel);
}

/**
 * `node` as a new node of another kind (a paragraph indented into a list, an item outdented out of a
 * paragraph's list): the same text and children.
 */
function converted(doc: OutlineDoc, node: OutlineNode, kind: 'item' | 'paragraph'): EditedOutlineNode {
  const { lines } = contentOf(doc, node);
  // the same node in another kind: it keeps its id
  return { id: node.id, kind, text: nodeText(doc, node), lines, ...(kind === 'item' ? { marker: doc.config.bullet } : {}), children: node.children };
}

/** The selection kept on the same text, now in `nodes` converted to `copies`. */
function convertedSelection(doc: OutlineDoc, sel: Selection, nodes: readonly OutlineNode[], copies: readonly EditedOutlineNode[]): (writtenOutline: WrittenOutline) => Selection {
  const at = (pos: number, writtenOutline: WrittenOutline): number => {
    const line = doc.lineAt(pos);
    const i = nodes.findIndex((node) => line.index >= node.startLine && line.index <= node.headEndLine);
    if (i < 0) return writtenOutline.map(pos, 1);
    const lines = copies[i]!.lines!;
    const index = line.index - nodes[i]!.startLine;
    const contentFrom = line.to - lines[index]!.length;
    return writtenOutline.at(copies[i]!, index, Math.max(0, pos - contentFrom));
  };
  return (writtenOutline) => ({ anchor: at(sel.anchor, writtenOutline), head: at(sel.head, writtenOutline) });
}

/** Paragraphs indented under the node above become its list items. */
function indentParagraphs(doc: OutlineDoc, run: OutlineNode[], sel: Selection): Outcome {
  const parent = run[0]!.parent!;
  const prev = parent.children[parent.children.indexOf(run[0]!) - 1];
  if (!prev) return reject('no-previous-sibling');
  // into a quote, a paragraph stays a paragraph
  if (prev.kind === 'quote') return written(doc, append(remove(doc.outline, parent.id, run), prev.id, 'last', run), sel);
  if (prev.kind !== 'paragraph' && prev.kind !== 'item') return reject('not-expressible', 'only a paragraph or an item can hold list items');
  const items = run.map((node) => converted(doc, node, 'item'));
  const expected = append(remove(doc.outline, parent.id, run), prev.id, 'last', items);
  return written(doc, expected, sel, {}, convertedSelection(doc, sel, run, items));
}

/**
 * The run leaves its parent item, to follow it; out of a paragraph's list, the items become
 * paragraphs. The first items of a list in a section become paragraphs too. Later siblings follow
 * `doc.config.outdent`: direct makes them children of the run's last node, after its own; logical
 * leaves them with their parent, the run passing them.
 */
function outdent(doc: OutlineDoc, run: OutlineNode[], sel: Selection): Outcome {
  const parent = run[0]!.parent!;
  const direct = doc.config.outdent === 'direct';
  const last = run[run.length - 1]!;
  const later = parent.children.slice(parent.children.indexOf(last) + 1);
  if (parent.kind === 'paragraph' || parent.kind === 'root' || parent.kind === 'heading') {
    if (parent.kind !== 'paragraph') {
      // in a section, only the first items of a list can outdent
      const prev = parent.children[parent.children.indexOf(run[0]!) - 1];
      if (prev?.kind === 'item') return reject('at-top-level');
    }
    const paragraphs = run.map((node) => converted(doc, node, 'paragraph'));
    const select = convertedSelection(doc, sel, run, paragraphs);
    if (parent.kind !== 'paragraph') {
      // direct: in place, the rest of the list becoming theirs; logical: past the rest of the list
      const items = later.slice(0, (later.findIndex((node) => node.kind !== 'item') + 1 || later.length + 1) - 1);
      const tail = direct ? [] : items;
      const expected = editNode(doc.outline, parent.id, (p) => {
        const i = p.children.indexOf(run[0]!);
        return { ...p, children: [...p.children.slice(0, i), ...tail, ...paragraphs, ...p.children.slice(i + run.length + tail.length)] };
      });
      return written(doc, expected, sel, {}, select);
    }
    // after the paragraph, an item would join its list again; direct: the items after the run
    // follow it, and join the last new paragraph's list
    const moved = direct ? [...paragraphs, ...later] : paragraphs;
    const expected = place(remove(doc.outline, parent.id, direct ? [...run, ...later] : run), parent.parent!.id, parent.id, 'after', moved);
    return written(doc, expected, sel, {}, select);
  }
  if (parent.kind !== 'item') return reject('at-top-level');
  if (!direct || later.length === 0) return written(doc, place(remove(doc.outline, parent.id, run), parent.parent!.id, parent.id, 'after', run), sel);
  const adopting: EditedOutlineNode = { ...editable(last), children: [...last.children, ...later] };
  const moved = [...run.slice(0, -1), adopting];
  return written(doc, place(remove(doc.outline, parent.id, [...run, ...later]), parent.parent!.id, parent.id, 'after', moved), sel);
}

const lineEndWithEnding = (doc: OutlineDoc, lineNo: number): number => doc.lines[lineNo]!.to + doc.lines[lineNo]!.ending.length;

function mapSelection(changes: readonly TextChange[], sel: Selection, assoc: -1 | 1): Selection {
  return { anchor: mapPos(changes, sel.anchor, assoc), head: mapPos(changes, sel.head, assoc) };
}

// ------------------------------------------------------------------ headings

function headingLevel(doc: OutlineDoc, run: OutlineNode[], delta: number, sel: Selection): Outcome {
  const headings: OutlineNode[] = [];
  const walk = (n: OutlineNode): void => {
    if (n.kind === 'heading') headings.push(n);
    n.children.forEach(walk);
  };
  run.forEach(walk);
  const changes: TextChange[] = [];
  for (const h of headings) {
    const level = h.head!.level! + delta;
    if (level < 1) return reject('at-h1-bound');
    if (level > 6) return reject('at-h6-bound');
    if (h.head!.setext) {
      if (level > 2) return reject('not-expressible', 'a setext heading has levels 1 and 2 only');
      const underline = doc.lines[h.head!.endLine]!;
      const from = underline.contentFrom;
      const text = doc.text.slice(from, underline.to);
      changes.push({ from, to: underline.to, insert: text.replace(/[=-]/g, level === 1 ? '=' : '-') });
    } else {
      const line = doc.lines[h.startLine]!;
      const hash = doc.text.indexOf('#', line.contentFrom);
      changes.push(delta > 0 ? { from: hash, to: hash, insert: '#' } : { from: hash, to: hash + 1, insert: '' });
    }
  }
  let expected: Tree = doc.outline;
  for (const h of headings) expected = editNode(expected, h.id, (n) => ({ ...n, level: h.head!.level! + delta }));
  return { changes, selection: mapSelection(changes, sel, 1), expected, compare: 'flat' };
}

// ------------------------------------------------------------------ moves

/**
 * The run swaps places with the sibling above or below it. At the edge of its parent it crosses into
 * the parent's sibling, as its last (up) or first (down) children. Items move past a paragraph: below
 * it they become its first list items; above it (out of its list) they follow the node before it.
 */
function move(doc: OutlineDoc, run: OutlineNode[], dir: -1 | 1, sel: Selection): Outcome {
  // a move of everything in a quote moves the quote
  while (run[0]!.parent?.kind === 'quote' && run.length === run[0]!.parent.children.length) run = [run[0]!.parent];
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const parent = first.parent!;
  const other = dir < 0 ? parent.children[parent.children.indexOf(first) - 1] : parent.children[parent.children.indexOf(last) + 1];
  const items = first.kind === 'item';
  if (!other) {
    // out of a paragraph's list, upward: above the paragraph
    if (dir < 0 && items && parent.kind === 'paragraph') return written(doc, place(remove(doc.outline, parent.id, run), parent.parent!.id, parent.id, 'before', run), sel);
    const grand = parent.parent;
    const into = grand && (dir < 0 ? grand.children[grand.children.indexOf(parent) - 1] : grand.children[grand.children.indexOf(parent) + 1]);
    if (!into || !canHold(into, first)) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
    return written(doc, append(remove(doc.outline, parent.id, run), into.id, dir < 0 ? 'last' : 'first', run), sel);
  }
  // an item below a paragraph becomes its first list item
  if (dir > 0 && items && other.kind === 'paragraph') return written(doc, append(remove(doc.outline, parent.id, run), other.id, 'first', run), sel);
  // a quote swaps with any node but a heading (which owns what follows it); blocks swap with
  // blocks, items with items
  const group = (k: string) => (k === 'paragraph' || k === 'atom' ? 'leaf' : k);
  const quote = (first.kind === 'quote' || other.kind === 'quote') && first.kind !== 'heading' && other.kind !== 'heading';
  if (!quote && group(other.kind) !== group(first.kind)) return reject('not-expressible', `can't reorder ${first.kind} past ${other.kind}`);
  if (first.kind === 'heading' && other.kind === 'heading' && first.head!.level !== other.head!.level) return reject('not-expressible', 'a heading moves among headings of its level');
  const upper = dir < 0 ? [other] : run;
  const lower = dir < 0 ? run : [other];
  const expected = editNode(doc.outline, parent.id, (p) => {
    const i = p.children.indexOf(upper[0]!);
    return { ...p, children: [...p.children.slice(0, i), ...lower, ...upper, ...p.children.slice(i + upper.length + lower.length)] };
  });
  return written(doc, expected, sel);
}

/** Whether a moved run starting with `node` can cross into `into` as its children. */
function canHold(into: OutlineNode, node: OutlineNode): boolean {
  if (node.kind === 'item') return into.kind === 'item' || into.kind === 'paragraph';
  return false;
}

// ------------------------------------------------------------------ structure commands

/** The last node of `node`'s subtree in document order. */
function lastDescendant(node: OutlineNode): OutlineNode {
  return node.children.length ? lastDescendant(node.children[node.children.length - 1]!) : node;
}

/** The selected nodes go, with their subtrees; the caret goes to the end of the text above, or to what follows. */
function deleteSubtree(doc: OutlineDoc, sel: Selection): Outcome {
  const run = operands(doc, sel);
  if (run === null) return notApplicable;
  if ('status' in run) return run;
  const expected = remove(doc.outline, run[0]!.parent!.id, run);
  const above = doc.nodes[doc.nodes.indexOf(run[0]!) - 1];
  const after = doc.nodes[doc.nodes.indexOf(lastDescendant(run[run.length - 1]!)) + 1];
  return written(doc, expected, sel, {}, (writtenOutline) => {
    const caret =
      above && above.kind !== 'root'
        ? writtenOutline.map(doc.headRange(above)?.to ?? doc.lines[above.headEndLine]!.to, -1)
        : after
          ? writtenOutline.map(doc.lines[after.startLine]!.from, 1)
          : 0;
    return { anchor: caret, head: caret };
  });
}

/** A copy of the selected nodes, with their subtrees, goes below them; the caret goes along into it. */
function duplicate(doc: OutlineDoc, sel: Selection): Outcome {
  const run = operands(doc, sel);
  if (run === null) return notApplicable;
  if ('status' in run) return run;
  const copies = run.map((node) => asNewNode(node, (n) => nodeText(doc, n), (n) => contentOf(doc, n)));
  const expected = place(doc.outline, run[0]!.parent!.id, run[run.length - 1]!.id, 'after', copies);
  return written(doc, expected, sel, {}, convertedSelection(doc, sel, run, copies));
}

// ------------------------------------------------------------------ split and join

/** The text that starts a new line at `node`'s level, up to its marker: outer prefixes plus indentation. */
function siblingPrefix(doc: OutlineDoc, node: OutlineNode): string {
  const line = doc.lines[node.startLine]!;
  const own = line.prefix.findIndex((p) => p.block === node.block);
  const outer = line.prefix.slice(0, own);
  const ownPiece = line.prefix[own]!;
  // outer containers whose marker is also on this line (`- - a`) are rewritten as indentation
  if (outer.every((p) => p.block.type === 'blockquote' || p.block.startLine < node.startLine)) {
    return doc.text.slice(line.from, node.block.markerFrom!);
  }
  return outer.map((p) => continuationText(doc, p)).join('') + doc.text.slice(ownPiece.from, node.block.markerFrom!);
}

/** The text before a child block's first character: the containers' prefixes, then its indentation. */
function childIndent(doc: OutlineDoc, node: OutlineNode, child: OutlineNode): string {
  const line = doc.lines[child.startLine]!;
  const own = line.prefix.findIndex((p) => p.block === node.block);
  let end = own >= 0 ? line.prefix[own]!.to : line.from;
  while (end < line.to && isBlankChar(doc.text.charCodeAt(end))) end++;
  return doc.text.slice(line.from, end);
}

function continuationText(doc: OutlineDoc, p: PrefixPiece): string {
  if (p.block.type === 'blockquote') return doc.text.slice(p.from, p.to);
  return ' '.repeat(p.toColumn - p.fromColumn);
}

function markerText(doc: OutlineDoc, node: OutlineNode, next: boolean): string {
  const b = node.block;
  const text = doc.text.slice(b.markerFrom!, b.markerTo!);
  if (!next || b.list!.type === 'bullet') return text;
  return `${parseInt(text, 10) + 1}${b.list!.delimiter}`;
}

const reListMarker = /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/;
const reTaskBox = /^\[[ xX]\](?=[ \t]|$)/;

/** Where a node's text splits: the range the split replaces, the two halves, and what follows. */
interface Cut {
  from: number;
  to: number;
  before: string[];
  after: string[];
  /** The rest of the line the second half starts with. */
  rest: string;
  /** Nothing of the text comes before the split (a task's checkbox aside). */
  atStart: boolean;
}

function cutText(doc: OutlineDoc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Cut | null {
  const head = node.head!;
  const lines = doc.headLines(node);
  const i = line.index - head.startLine;
  if (i < 0 || i >= lines.length || selFrom < line.contentFrom || selTo > line.to) return null;
  const text = doc.text;
  const lineBefore = lines[i]!.slice(0, selFrom - line.contentFrom);
  const lineAfter = lines[i]!.slice(selTo - line.contentFrom);
  let before = [...lines.slice(0, i), lineBefore];
  let after = [lineAfter, ...lines.slice(i + 1)];
  let from = selFrom;
  let to = selTo;
  // spaces at the split stay with neither half
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  while (from > line.contentFrom && isBlankChar(text.charCodeAt(from - 1))) from--;
  // at a line boundary inside the text, split at the line break rather than leave an empty line
  if (lineBefore.trim() === '' && i > 0) {
    before = lines.slice(0, i);
    from = doc.lines[line.index - 1]!.to;
  }
  if (lineAfter.trim() === '' && i < lines.length - 1) {
    after = lines.slice(i + 1);
    const next = doc.lines[line.index + 1]!;
    to = next.contentFrom;
    while (to < next.to && isBlankChar(text.charCodeAt(to))) to++;
  }
  const lead = lineBefore.trim();
  const atStart = i === 0 && (lead === '' || (reTaskBox.test(lead) && lead.length === 3));
  return { from, to, before, after, rest: text.slice(to, lineSpan(text, to)[1]), atStart };
}

/**
 * How the second half's first line is written at the start of a new line, where it can mean
 * something else: a list marker the user typed mid-line becomes the new node's marker
 * (`- abc ┃- def` makes two items); text that would open another block there, or make the half
 * (with its `lines` below) a link reference definition, is escaped so it stays text.
 */
function encodeRest(rest: string, lines: readonly string[]): { escape: boolean; marker: number } {
  if (startsBlock(rest, false) || scanReference([rest, ...lines.map((line) => line.trimStart())].join('\n'))) return { escape: true, marker: 0 };
  const m = reListMarker.exec(rest);
  return { escape: false, marker: m ? m[0].length : 0 };
}

function split(doc: OutlineDoc, sel: Selection): Outcome {
  const selFrom = Math.min(sel.anchor, sel.head);
  const selTo = Math.max(sel.anchor, sel.head);
  const node = doc.nodeAt(selFrom);
  if (!node) return notApplicable;
  const line = doc.lineAt(selFrom);
  if (doc.lineAt(selTo).index !== line.index) return notApplicable; // a selection across lines is the host's
  if (node.kind === 'paragraph') return splitParagraph(doc, node, line, selFrom, selTo);
  if (node.kind === 'heading') return splitHeading(doc, node, line, selFrom, selTo);
  // a callout's title and body are one paragraph: Enter in the title starts the body with the rest
  if (node.kind === 'quote' && node.head) return lineBreak(doc, sel);
  if (line.leaf?.type === 'code_block' && line.leaf.fenced) return fenceNewline(doc, node, line, selFrom, selTo);
  if (node.kind !== 'item') return notApplicable;
  const pos = selFrom;
  if (pos < line.contentFrom && line.index !== node.startLine) return notApplicable;
  const eol = line.ending || dominantEnding(doc.text);

  // an empty item with children: Enter makes a new empty first child, the caret going into it, as at
  // the end of any item with children (Workflowy, Logseq, Roam)
  if (isEmptyWithChildren(doc, node)) {
    if (pos < node.block.markerTo! || selFrom !== selTo) return notApplicable;
    const first = node.children[0]!;
    const box = node.head && reTaskBox.test(doc.headLines(node)[0]!.trimStart()) ? '[ ] ' : '';
    const prefix = first.kind === 'item' ? siblingPrefix(doc, first) : childIndent(doc, node, first);
    const marker = first.kind === 'item' ? markerText(doc, first, false) : markerText(doc, node, false).replace(/^\d+/, '1');
    const markerLine = doc.lines[node.startLine]!;
    const insert = eol + prefix + marker + ' ' + box;
    const caret = markerLine.to + insert.length;
    const expected = append(doc.outline, node.id, 'first', [created('item', box.trim())]);
    return { changes: [{ from: markerLine.to, to: markerLine.to, insert }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }
  if (isEmptyItem(doc, node)) {
    if (pos < node.block.markerTo!) return notApplicable;
    // Enter on an empty item: a nested one outdents as the last child. First or in the middle of its
    // list, it gets a new empty sibling, the caret going into it (Workflowy, Logseq), or with
    // `enterOnEmptyItem: outdent` it outdents there too (Roam). A top-level one leaves the list,
    // becoming an empty paragraph held by a placeholder, set off from the items around it by blank lines.
    if (node.parent!.kind === 'item') {
      const siblings = node.parent!.children;
      if (siblings[siblings.length - 1] === node || doc.config.enterOnEmptyItem === 'outdent') return outdent(doc, [node], { anchor: pos, head: pos });
      // right after the parent's text the empty item exists only under the caret: the new one goes above
      if (followsParentText(doc, node)) return insertBefore(doc, node, pos, '');
      const markerLine = doc.lines[node.startLine]!;
      const insert = eol + siblingPrefix(doc, node) + markerText(doc, node, true) + ' ';
      const caret = markerLine.to + insert.length;
      const expected = place(doc.outline, node.parent!.id, node.id, 'after', [created('item', '')]);
      return { changes: [{ from: markerLine.to, to: markerLine.to, insert }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
    }
    if (node.parent!.kind === 'quote') return leaveQuote(doc, [node], { anchor: pos, head: pos });
    const markerLine = doc.lines[node.startLine]!;
    const prev = doc.lines[node.startLine - 1];
    const next = doc.lines[node.startLine + 1];
    const before = prev && !prev.blank ? eol : '';
    const after = next && !next.blank ? eol : '';
    const changes = [{ from: markerLine.from, to: markerLine.to, insert: before + after }];
    const caret = markerLine.from + before.length;
    const parent = node.parent!;
    const empty = created('paragraph', '');
    // leaving a paragraph's list, the new paragraph follows the paragraph, and the items after it
    // become its own
    const expected =
      parent.kind === 'paragraph'
        ? place(
            editNode(doc.outline, parent.id, (n) => ({ ...n, children: n.children.slice(0, n.children.indexOf(node)) })),
            parent.parent!.id,
            parent.id,
            'after',
            [empty, ...parent.children.slice(parent.children.indexOf(node) + 1)],
          )
        : place(doc.outline, parent.id, node.id, 'instead', [empty]);
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree', placeholders: [caret] };
  }

  if (!node.head || node.head.type !== 'paragraph') return notApplicable; // `- - a`, or a code or quote head
  // in the item's marker, Enter acts at its text start
  const at = selFrom === selTo && line.index === node.startLine ? Math.max(selFrom, doc.headRange(node)!.from) : selFrom;
  const cut = cutText(doc, node, line, at, selFrom === selTo ? at : selTo);
  if (!cut) return notApplicable;
  // a task's new sibling is a task too, unchecked
  const box = reTaskBox.test(doc.headLines(node)[0]!.trimStart()) ? '[ ] ' : '';
  if (cut.atStart && selFrom === selTo && normText(cut.after) !== '') return insertBefore(doc, node, at, box);

  // the new node is the first child when the node has items below it, else the next sibling
  const firstChild = node.children[0];
  let prefix: string;
  let marker: string;
  if (firstChild?.kind === 'item') {
    prefix = siblingPrefix(doc, firstChild);
    marker = markerText(doc, firstChild, false);
  } else if (firstChild) {
    // the first child is a paragraph or a block: the new item goes before it, written where it starts
    prefix = childIndent(doc, node, firstChild);
    marker = markerText(doc, node, false).replace(/^\d+/, '1');
  } else {
    prefix = siblingPrefix(doc, node);
    marker = markerText(doc, node, true);
  }
  const rest = encodeRest(cut.rest, cut.after.slice(1));
  let insert = eol + prefix + marker + ' ' + box;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (box) {
    // after a task's checkbox the rest doesn't start the line's text: nothing to escape
    first = box + first;
  } else if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  }
  const changes = [{ from: cut.from, to: cut.to, insert }];
  if (!box && rest.marker) {
    // a list marker in the rest stays text, as outliners keep it: escaped, a bullet before itself,
    // an ordered marker before its `.` or `)` (a backslash before a digit escapes nothing)
    const digits = /^\d*/.exec(cut.rest)![0].length;
    if (digits) changes.push({ from: cut.to + digits, to: cut.to + digits, insert: '\\' });
    else changes[0]!.insert += '\\';
    first = first.slice(0, digits) + '\\' + first.slice(digits);
  }
  const split = withText(doc.outline, node.id, normText(cut.before));
  const fresh = created('item', normText([first, ...cut.after.slice(1)]));
  const expected = firstChild ? append(split, node.id, 'first', [fresh]) : place(split, node.parent!.id, node.id, 'after', [fresh]);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

/** Whether `node`'s first line comes right after its parent's own text (a paragraph). */
function followsParentText(doc: OutlineDoc, node: OutlineNode): boolean {
  const prevLeaf = doc.lines[node.startLine - 1]?.leaf;
  return prevLeaf?.type === 'paragraph' && prevLeaf.parent === node.block.parent!.parent;
}

/**
 * Enter at the start of an item: a new empty item above it, the caret going into it (as Workflowy,
 * Logseq, Roam and Dynalist do). Right after its parent's text the empty item would be a setext
 * underline, so a placeholder holds it.
 */
function insertBefore(doc: OutlineDoc, node: OutlineNode, pos: number, box: string): Outcome {
  // a new task's checkbox is text the line can hold, so only a bare empty item needs the placeholder
  const held = !box && followsParentText(doc, node);
  const markerLine = doc.lines[node.startLine]!;
  const line = siblingPrefix(doc, node) + markerText(doc, node, false) + ' ' + box;
  const insert = line + (markerLine.ending || dominantEnding(doc.text));
  const changes = [{ from: markerLine.from, to: markerLine.from, insert }];
  const caret = markerLine.from + line.length;
  const expected = place(doc.outline, node.parent!.id, node.id, 'before', [created('item', box.trim())]);
  const identity = new Map([[node.block.markerFrom! + insert.length, node.id]]);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree', identity, ...(held ? { placeholders: [caret] } : {}) };
}

/**
 * Enter in a fenced code block: a new line, split at the caret, which stays in the containers the
 * block is in (an item's continuation indentation, a quote's `>`). On a code line it takes the line's
 * own indentation too, and is ourus's only with `handleFenceContents` (else the host's: it may edit
 * code itself). On a fence line it is always ourus's: inside the run of backticks or tildes it is
 * refused, since a new line there would break the fence.
 */
function fenceNewline(doc: OutlineDoc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  if (selFrom < line.contentFrom) return notApplicable;
  const text = doc.text;
  const block = line.leaf!;
  let runStart = line.contentFrom;
  while (runStart < line.to && isBlankChar(text.charCodeAt(runStart))) runStart++;
  let runEnd = runStart;
  while (runEnd < line.to && text[runEnd] === block.fenceChar) runEnd++;
  const opening = line.index === block.startLine;
  const closing = !opening && line.index === block.endLine && runEnd - runStart >= block.fenceLength! && text.slice(runEnd, line.to).trim() === '';
  if (opening || closing) {
    if (selFrom > runStart && selFrom < runEnd) return reject('not-expressible', 'a new line would break the fence');
    // at the start of a fence that is an item's text, Enter is at the item's text start
    if (opening && selFrom <= runStart && node.kind === 'item' && node.head === block) return insertBefore(doc, node, selFrom, '');
  } else if (!doc.config.handleFenceContents) return notApplicable;
  const prefix = line.prefix.map((p) => continuationText(doc, p)).join('');
  let indentEnd = line.contentFrom;
  while (indentEnd < line.to && isBlankChar(text.charCodeAt(indentEnd))) indentEnd++;
  const own = opening || closing ? '' : text.slice(line.contentFrom, Math.min(indentEnd, selFrom));
  const eol = line.ending || dominantEnding(text);
  // a fence moved down from its line start leaves no trailing whitespace behind, only quote markers
  const bare = (opening || closing) && selFrom <= runStart;
  const changes = bare
    ? [{ from: line.from, to: selTo, insert: prefix.trimEnd() + eol + prefix }]
    : [{ from: selFrom, to: selTo, insert: eol + prefix + own }];
  const caret = changes[0]!.from + changes[0]!.insert.length;
  const next = doc.apply(changes);
  return { changes, selection: { anchor: caret, head: caret }, expected: withText(doc.outline, node.id, nodeText(next, next.nodeAt(caret) ?? node)), compare: 'tree' };
}

/** Enter at the start of a paragraph or heading: a blank line above it, the text staying put. */
function blankLineAbove(doc: OutlineDoc, node: OutlineNode, pos: number): Outcome {
  const first = doc.lines[node.startLine]!;
  const eol = first.ending || dominantEnding(doc.text);
  return {
    changes: [{ from: first.from, to: first.from, insert: eol }],
    selection: { anchor: pos + eol.length, head: pos + eol.length },
    expected: doc.outline,
    compare: 'tree',
  };
}

/** Enter in a paragraph: two paragraphs, a blank line between them. */
function splitParagraph(doc: OutlineDoc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const cut = cutText(doc, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  if (normText(doc.headLines(node)) === '') return reject('not-expressible', 'an empty paragraph has nothing to split');
  if (cut.atStart && selFrom === selTo) return blankLineAbove(doc, node, selFrom);
  const firstLine = doc.lines[node.head!.startLine]!;
  const prefix = doc.text.slice(firstLine.from, firstLine.contentFrom);
  const eol = line.ending || dominantEnding(doc.text);
  const rest = encodeRest(cut.rest, cut.after.slice(1));
  // the blank line between the halves keeps the quotes' `>`
  let insert = eol + prefix.trimEnd() + eol + prefix;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    caret += rest.marker;
    first = first.slice(rest.marker);
  }
  const fresh = created(rest.marker ? 'item' : 'paragraph', normText([first, ...cut.after.slice(1)]));
  // a second half that is a paragraph is right above the paragraph's list now, and takes it; one
  // that is an item opens that list
  const expected = rest.marker
    ? editNode(doc.outline, node.id, (n) => ({ ...n, text: normText(cut.before), children: [fresh, ...n.children] }))
    : place(
        editNode(doc.outline, node.id, (n) => ({ ...n, text: normText(cut.before), children: [] })),
        node.parent!.id,
        node.id,
        'after',
        [{ ...fresh, children: node.children }],
      );
  return { changes: [{ from: cut.from, to: cut.to, insert }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

/** Enter in a heading: the rest of the title becomes the first paragraph of its section. */
function splitHeading(doc: OutlineDoc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  if (node.head!.setext) return splitSetext(doc, node, line, selFrom, selTo);
  const range = doc.headRange(node)!;
  const text = doc.text;
  // before the title's text (in its `#`s) Enter opens a line above; at the text start it splits, as
  // anywhere in the title, leaving an empty heading above the text (as Obsidian does)
  if (selFrom < range.from && selFrom === selTo) return blankLineAbove(doc, node, selFrom);
  if (selFrom < range.from) return notApplicable;
  let from = selFrom;
  while (from > range.from && isBlankChar(text.charCodeAt(from - 1))) from--;
  let to = selTo;
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  const restText = text.slice(to, line.to);
  const rest = encodeRest(restText, []);
  // the rest becomes the section's first paragraph (an item, if it starts with a list marker); the
  // writer sets it off from what follows where it would run into it
  const marker = rest.marker && !rest.escape ? restText.slice(0, rest.marker).trim() : null;
  const first = rest.escape ? '\\' + restText : marker ? restText.slice(rest.marker) : restText;
  const fresh: EditedOutlineNode = { id: null, kind: marker ? 'item' : 'paragraph', text: normText([first]), lines: [first], ...(marker ? { marker } : {}), children: [] };
  const own = contentOf(doc, node).lines![0]!;
  const title = own.slice(0, from - (line.to - own.length));
  const expected = editNode(doc.outline, node.id, (n) => ({
    ...n,
    text: normText([text.slice(range.from, from)]),
    lines: [title],
    children: [fresh, ...n.children],
  }));
  // a paragraph's text right below (an item's included) stays apart from the new one
  const below = doc.lines[line.index + 1];
  const apart = !!below && !below.blank && below.leaf?.type === 'paragraph';
  return written(doc, expected, { anchor: selFrom, head: selTo }, apart ? { separate: 'after' } : {}, (writtenOutline) => {
    const caret = writtenOutline.at(fresh, 0, rest.escape ? 1 : 0);
    return { anchor: caret, head: caret };
  });
}

/**
 * Enter in a setext heading's title, as in an ATX one: the rest of the title becomes the section's
 * first paragraph, below the underline. In the underline, which is markup rather than text, Enter
 * acts at the end of the title.
 */
function splitSetext(doc: OutlineDoc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const head = node.head!;
  const underline = doc.lines[head.endLine]!;
  const lastTitle = doc.lines[head.endLine - 1]!;
  const text = doc.text;
  if (line.index === head.endLine) {
    if (selFrom !== selTo) return notApplicable;
    line = lastTitle;
    selFrom = selTo = lastTitle.to;
  }
  const range = doc.headRange(node)!;
  if (selFrom === selTo && text.slice(range.from, Math.max(selFrom, range.from)).trim() === '') return blankLineAbove(doc, node, selFrom);
  if (selFrom < line.contentFrom) return notApplicable;
  let from = selFrom;
  while (from > line.contentFrom && isBlankChar(text.charCodeAt(from - 1))) from--;
  let to = selTo;
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  const lines = doc.headLines(node);
  const i = line.index - head.startLine;
  const before = [...lines.slice(0, i), lines[i]!.slice(0, from - line.contentFrom)];
  const after = [lines[i]!.slice(to - line.contentFrom), ...lines.slice(i + 1)];
  const eol = underline.ending || dominantEnding(text);
  const prefix = text.slice(underline.from, underline.contentFrom);
  // the rest of the title, with any title lines below it, moves below the underline
  let moved = text.slice(to, lastTitle.to);
  const rest = encodeRest(after[0]!, after.slice(1));
  let lead = eol + prefix;
  let first = after[0]!;
  if (rest.escape) {
    lead += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    first = first.slice(rest.marker);
  }
  // a paragraph right below the underline stays a paragraph of its own
  const next = doc.lines[head.endLine + 1];
  if (next && !next.blank && next.leaf?.type === 'paragraph') moved += eol;
  const changes: TextChange[] = [
    { from, to: lastTitle.to, insert: '' },
    { from: underline.to, to: underline.to, insert: lead + moved },
  ];
  const caret = underline.to - (lastTitle.to - from) + lead.length + (rest.marker && !rest.escape ? rest.marker : 0);
  const fresh = created(rest.marker ? 'item' : 'paragraph', normText([first, ...after.slice(1)]));
  const expected = append(withText(doc.outline, node.id, normText(before)), node.id, 'first', [fresh]);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

// ------------------------------------------------------------------ paste

/**
 * Paste of Markdown with more than one line, at the end of a node's text: the payload's nodes land
 * where Enter would put a new node there (after an item as its siblings, under an item with
 * children as its first children, at a heading's end as the section's first content, after a
 * paragraph as the blocks that follow it), as Logseq and Workflowy paste outlines. Its indentation
 * is rewritten from its structure, in the destination's unit, and blocks that would run together
 * get a blank line between them. Anything else is the host's plain-text paste.
 */
/**
 * Paste as plain text: the text goes into the text of the node at the caret, replacing the selection
 * (within one line), each of its line breaks as Shift-Enter makes one: the next line continues the
 * text at its column, escaped where it would start a block. One line, and outside a node's text, it
 * is the host's.
 */
function pastePlain(doc: OutlineDoc, sel: Selection, payload: string): Outcome {
  const lines = payload.split(/\r\n|\n|\r/);
  if (lines.length < 2) return notApplicable;
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  const line = doc.lineAt(from);
  if (doc.lineAt(to).index !== line.index || from < line.contentFrom) return notApplicable;
  const node = doc.nodeAt(from);
  if (node?.kind === 'heading') return reject('not-expressible', 'a heading is a single line');
  // on an empty item, the text is its text: its first line escaped where it would start a block
  if (node && isEmptyItem(doc, node) && from >= node.block.markerTo! && from === to) {
    const prefix = siblingPrefix(doc, node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!);
    const eol = line.ending || dominantEnding(doc.text);
    const escapeFirst = (text: string): string => {
      if (!(startsBlock(text, false) || reListMarker.test(text))) return text;
      const digits = /^\d*/.exec(text)![0].length;
      return text.slice(0, digits) + '\\' + text.slice(digits);
    };
    const escapeNext = (text: string): string => {
      if (!startsBlock(text, true)) return text;
      const digits = /^\d*/.exec(text)![0].length;
      return text.slice(0, digits) + '\\' + text.slice(digits);
    };
    const textLines = lines.map((text, k) => (k === 0 ? escapeFirst(text.trim()) : escapeNext(text.trimStart())));
    // the space after the marker, if the line ends without one
    const lead = doc.text.slice(node.block.markerTo!, line.to) === '' ? ' ' : '';
    const insert = lead + textLines.map((text, k) => (k === 0 ? text : eol + prefix + text)).join('');
    const changes = [{ from, to, insert }];
    const caret = from + insert.length;
    const last = textLines[textLines.length - 1]!;
    const placeholders = last.trim() === '' ? [caret] : undefined;
    return { changes, selection: { anchor: caret, head: caret }, expected: withText(doc.outline, node.id, normText(textLines)), compare: 'tree', ...(placeholders ? { placeholders } : {}) };
  }
  if (!node?.head || node.head.type !== 'paragraph' || line.index < node.head.startLine || line.index > node.head.endLine) return notApplicable;
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? siblingPrefix(doc, node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = line.ending || dominantEnding(text);
  const rest = text.slice(to, line.to);
  // where a line that would interrupt the paragraph takes its escape: its start, or an ordered marker's delimiter
  const escapeAt = (value: string): number | null => (startsBlock(value, true) ? /^\d*/.exec(value)![0].length : null);
  let insert = lines[0]!;
  const changes: TextChange[] = [];
  const written: string[] = [];
  let restWritten = rest;
  for (let i = 1; i < lines.length; i++) {
    const own = lines[i]!.trimStart();
    // the last line runs into the rest of the line, which then starts it
    const last = i === lines.length - 1;
    const at = escapeAt(last ? own + rest : own);
    let value = own;
    if (at !== null && at <= own.length && own) value = own.slice(0, at) + '\\' + own.slice(at);
    else if (at !== null) {
      // the escape falls in the rest of the line, which stays where it is
      changes.push({ from: to + (at - own.length), to: to + (at - own.length), insert: '\\' });
      restWritten = rest.slice(0, at - own.length) + '\\' + rest.slice(at - own.length);
    }
    insert += eol + prefix + value;
    written.push(value);
  }
  changes.unshift({ from, to, insert });
  const caret = from + insert.length;
  // the node's text, with the pasted lines in it
  const headLines = doc.headLines(node);
  const i = line.index - node.head.startLine;
  const lastLine = written[written.length - 1]! + restWritten;
  const textLines = [...headLines.slice(0, i), headLines[i]!.slice(0, from - line.contentFrom) + lines[0]!, ...written.slice(0, -1), lastLine, ...headLines.slice(i + 1)];
  // an empty last line exists only as a place to type into, as after Shift-Enter
  const placeholders = lastLine.trim() === '' && i === headLines.length - 1 ? [caret] : undefined;
  return { changes, selection: { anchor: caret, head: caret }, expected: withText(doc.outline, node.id, normText(textLines)), compare: 'tree', ...(placeholders ? { placeholders } : {}) };
}

/**
 * Structured paste: the clipboard's Markdown as nodes, by the rules of spec/paste.md. Nothing pasted
 * is lost: what can't be structure where it lands stays text. The destination decides form (bullet,
 * columns, spacing), the paste content (text, numbers, checkboxes, its own nesting). A list's first
 * item sets its form. The nodes go where Enter at the end of the node's text would put a new one, or
 * in an empty item's place; what can't be a node there is pasted as plain text. Pasted numbers are
 * never renumbered. One line is inline text, the host's.
 */
function paste(doc: OutlineDoc, sel: Selection, payload: string): Outcome {
  if (sel.anchor !== sel.head) return notApplicable;
  const lines = payload.split(/\r\n|\n|\r/);
  while (lines.length && lines[0]!.trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop();
  if (lines.length < 2) return notApplicable;
  const pos = sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const empty = isEmptyItem(doc, node) && pos >= node.block.markerTo!;
  if (!empty) {
    if (!node.head || (node.kind !== 'item' && node.kind !== 'heading' && node.kind !== 'paragraph')) return notApplicable;
    const range = doc.headRange(node)!;
    const lastText = node.head.type === 'heading' && node.head.setext ? node.head.endLine - 1 : node.head.endLine;
    const line = doc.lineAt(pos);
    // in the middle of the text: the nodes go after it, as at its end (`pasteMidText: after`), or the
    // item splits at the caret (`split`); in a paragraph's or a heading's text, the host's plain insert
    if (!(line.index === lastText && pos >= range.to)) {
      if (node.kind !== 'item' || line.index < node.head.startLine || line.index > lastText || pos < line.contentFrom) return notApplicable;
      if (doc.config.pasteMidText === 'split' && node.head.type === 'paragraph') return pasteSplit(doc, node, line, pos, lines, /(\r\n|\n|\r)\s*$/.test(payload));
    }
  }

  // the payload, without the indentation all its lines share
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  const common = Math.min(...lines.filter((text) => text.trim() !== '').map(indentOf));
  const fragment = OutlineDoc.parse(lines.map((text) => (text.trim() === '' ? '' : dropColumns(text, common))).join('\n'), { config: doc.config });
  // the nodes go in an empty item's place, else as the first children of a heading or of an item with
  // children, else right after the node
  const asChildren = !empty && (node.kind === 'heading' || (node.kind === 'item' && node.children.length > 0));
  const fitted = fitPaste(doc, node, fragment, empty, asChildren);
  // what can't be a node where it lands is pasted as text
  if (!fitted) return pastePlain(doc, sel, payload);
  let expected = empty
    ? place(doc.outline, node.parent!.id, node.id, 'instead', fitted.nodes)
    : asChildren
      ? append(doc.outline, node.id, 'first', fitted.nodes)
      : place(doc.outline, node.parent!.id, node.id, 'after', fitted.nodes);
  for (const [item, marker] of fitted.restyle) {
    expected = editNode(expected, item.id, (n) => ({ ...n, marker, exactMarker: true }));
  }
  // the caret goes to the end of the pasted text
  let last = fitted.nodes[fitted.nodes.length - 1]!;
  while (last.children.length) last = last.children[last.children.length - 1] as EditedOutlineNode;
  const lastLine = last.lines!.length - 1;
  const plan = written(doc, expected, sel, empty ? {} : { separate: 'around' }, (writtenOutline) => {
    const caret = writtenOutline.at(last, lastLine, last.lines![lastLine]!.length);
    return { anchor: caret, head: caret };
  });
  // an empty item's placeholder (right after its parent's text) goes with it
  const drop = empty ? doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine) : [];
  return withPlan(plan, { keepNumbers: true, ...(drop.length ? { drop } : {}) });
}

/**
 * The pasted fragment's top-level nodes as they land at `node`, or null where one can't be a node
 * there (a heading; a quote in an empty item's place), to be pasted as text instead. Into a list, the
 * pasted items take the list's form: its bullet, or its numbering, starting from the item before. A
 * pasted ordered item in a bullet list keeps its number as text (`- 1\. x`), and a pasted number in
 * an ordered list is kept as written. Pasted as a list's first items, a single ordered list keeps its
 * form, and the items after it are numbered on (`restyle`). Plain lines are items, one each.
 */
function fitPaste(doc: OutlineDoc, node: OutlineNode, fragment: OutlineDoc, empty: boolean, asChildren: boolean): { nodes: EditedOutlineNode[]; restyle: [OutlineNode, string][] } | null {
  const roots = fragment.outline.children;
  if (fragment.nodes.some((n) => n.kind === 'heading')) return null;
  const copy = (root: OutlineNode): EditedOutlineNode => asNewNode(root, (n) => nodeText(fragment, n), (n) => contentOf(fragment, n));
  if (node.kind !== 'item') return { nodes: roots.map(copy), restyle: [] };
  const markerOf = (item: OutlineNode, text: OutlineDoc): string => text.text.slice(item.block.markerFrom!, item.block.markerTo!);
  // the list the paste lands in, and the item whose marker gives its form
  const first = node.children[0];
  const siblings = asChildren ? node.children : node.parent!.children;
  const at = asChildren ? 0 : siblings.indexOf(node) + (empty ? 0 : 1);
  const before = siblings[at - 1];
  const reference = asChildren ? (first?.kind === 'item' ? first : null) : node;
  const startsList = reference === null || (empty && before?.kind !== 'item');
  const destMarker = reference ? markerOf(reference, doc) : doc.config.bullet;
  const ordered = (marker: string): boolean => /^\d/.test(marker);
  const delimiter = (marker: string): string => marker.slice(-1);
  const numberOf = (marker: string): number => parseInt(marker, 10);
  const pastedItems = roots.filter((root) => root.kind === 'item');
  const oneOrderedList = pastedItems.length === roots.length && pastedItems.every((root) => ordered(markerOf(root, fragment))) && new Set(pastedItems.map((root) => root.block.parent)).size === 1;
  // a list's first items set its form: a single pasted ordered list keeps its own
  const keepForm = startsList && oneOrderedList;
  let next = reference && ordered(destMarker) ? (asChildren || empty ? numberOf(destMarker) : numberOf(destMarker) + 1) : 1;
  const numbered = (): string => `${next++}${delimiter(destMarker)}`;
  const nodes: EditedOutlineNode[] = [];
  for (const root of roots) {
    if (root.kind === 'item') {
      const own = markerOf(root, fragment);
      const item = copy(root);
      if (keepForm) nodes.push(item);
      else if (ordered(destMarker)) nodes.push({ ...item, marker: ordered(own) ? `${numberOf(own)}${delimiter(destMarker)}` : numbered() });
      else if (ordered(own)) {
        // the number is content: in a bullet list it stays as text, escaped
        if (root.head?.type !== 'paragraph') return null;
        const text = `${numberOf(own)}\\${delimiter(own)} `;
        const itemLines = [text + item.lines![0]!, ...item.lines!.slice(1)];
        nodes.push({ ...item, marker: destMarker, lines: itemLines, text: normText(itemLines) });
      } else nodes.push({ ...item, marker: destMarker });
    } else if (root.kind === 'paragraph') {
      const rootLines = contentOf(fragment, root).lines!.map((text) => text.trim()).filter((text) => text !== '');
      rootLines.forEach((text, k) => nodes.push({ ...created('item', normText([text])), lines: [text], marker: ordered(destMarker) ? numbered() : destMarker, children: k === rootLines.length - 1 ? copy(root).children : [] }));
    } else if (empty) {
      // in an empty item's place, a code or HTML block is an item's text; anything else isn't
      if (root.block.type !== 'code_block' && root.block.type !== 'html_block') return null;
      nodes.push({ ...copy(root), kind: 'item', marker: ordered(destMarker) ? numbered() : destMarker });
    } else nodes.push(copy(root));
  }
  // the markers decided here are written as they are
  for (let k = 0; k < nodes.length; k++) if (nodes[k]!.kind === 'item' && nodes[k]!.marker) nodes[k] = { ...nodes[k]!, exactMarker: true };
  // the items after the paste in the list it starts take its form, numbered on
  const restyle: [OutlineNode, string][] = [];
  if (keepForm && !ordered(destMarker)) {
    let n = numberOf(markerOf(pastedItems[pastedItems.length - 1]!, fragment)) + 1;
    const pastedDelimiter = delimiter(markerOf(pastedItems[0]!, fragment));
    for (let k = at + (empty ? 1 : 0); k < siblings.length && siblings[k]!.kind === 'item'; k++) restyle.push([siblings[k]!, `${n++}${pastedDelimiter}`]);
  }
  return { nodes, restyle };
}

/** A plan, and its fallbacks, with `extra` fields (numbers kept, placeholders dropped). */
function withPlan(plan: Outcome, extra: Pick<Plan, 'keepNumbers' | 'drop'>): Outcome {
  if ('status' in plan) return plan;
  const fallback = plan.fallback;
  return { ...plan, ...extra, ...(fallback ? { fallback: () => { const next = fallback(); return next && (withPlan(next, extra) as Plan); } } : {}) };
}

/**
 * Structured paste in the middle of an item's text with `pasteMidText: split`: the item splits at the
 * caret, the first line joining the text before it and each further line an item of its own, after
 * it (its first children, if it has children). The text after the caret is an item of its own when
 * the clipboard ends with a line break, else the end of the last line. Lines are text: one that would
 * start a block is escaped. The caret goes to the end of the last pasted line.
 */
function pasteSplit(doc: OutlineDoc, node: OutlineNode, line: LineInfo, pos: number, lines: readonly string[], endsWithBreak: boolean): Outcome {
  const escaped = (text: string): string => {
    if (!(startsBlock(text, false) || reListMarker.test(text))) return text;
    const digits = /^\d*/.exec(text)![0].length;
    return text.slice(0, digits) + '\\' + text.slice(digits);
  };
  const pasted = lines.map((text) => text.trim());
  const headLines = doc.headLines(node);
  const i = line.index - node.head!.startLine;
  const offset = pos - line.contentFrom;
  const before = [...headLines.slice(0, i), headLines[i]!.slice(0, offset).trimStart() + pasted[0]];
  const after = [headLines[i]!.slice(offset), ...headLines.slice(i + 1)];
  const restText = normText(after);
  const marker = doc.text.slice(node.block.markerFrom!, node.block.markerTo!);
  const item = (text: string): EditedOutlineNode => ({ ...created('item', normText([text])), lines: [text], marker });
  const fresh = pasted.slice(1).map((text) => item(escaped(text)));
  const last = fresh[fresh.length - 1]!;
  const lastText = last.lines![0]!;
  if (restText !== '') {
    if (endsWithBreak) fresh.push(item(escaped(after.join('\n').trim())));
    else {
      const merged = lastText + after.join('\n').trimEnd();
      fresh[fresh.length - 1] = { ...last, text: normText([merged]), lines: [merged] };
    }
  }
  const caretItem = fresh[pasted.length - 2]!;
  const kept = editNode(doc.outline, node.id, (n) => ({ ...n, text: normText(before), lines: before.map((text, k) => (k === 0 ? text.trimStart() : text)) }));
  const expected = node.children.some((child) => child.kind === 'item') ? append(kept, node.id, 'first', fresh) : place(kept, node.parent!.id, node.id, 'after', fresh);
  return written(doc, expected, { anchor: pos, head: pos }, {}, (writtenOutline) => {
    const caret = writtenOutline.at(caretItem, 0, lastText.length);
    return { anchor: caret, head: caret };
  });
}

/** `line` without its first `cols` columns of indentation (a tab partly removed leaves spaces). */
function dropColumns(line: string, cols: number): string {
  let col = 0;
  let i = 0;
  while (i < line.length && col < cols && (line[i] === ' ' || line[i] === '\t')) {
    col = line[i] === '\t' ? col + 4 - (col % 4) : col + 1;
    i++;
  }
  return ' '.repeat(Math.max(0, col - cols)) + line.slice(i);
}

const isBlankChar = (c: number): boolean => c === 32 || c === 9;

/**
 * Where Home goes from `pos`: the start of the text on its line, past container prefixes, list
 * markers, a task's checkbox and a heading's `#`s; from there, the start of the line. A blank
 * line's text starts after its prefixes.
 */
export function homePosition(doc: OutlineDoc, pos: number): number {
  const line = doc.lineAt(pos);
  if (pos > line.to) return pos; // the empty line after a final line ending
  const start = textStart(doc, pos);
  return pos === start ? line.from : start;
}

/** Where the text starts on `pos`'s line: past container prefixes, a list marker, a task's checkbox and a heading's `#`s. */
export function textStart(doc: OutlineDoc, pos: number): number {
  const line = doc.lineAt(pos);
  let start = line.contentFrom;
  while (start < line.to && isBlankChar(doc.text.charCodeAt(start))) start++;
  const rest = doc.text.slice(start, line.to);
  const node = doc.nodeAt(pos);
  if (node?.kind === 'item' && node.head && line.index === node.head.startLine) {
    const box = /^\[[ xX]\][ \t]+/.exec(rest);
    if (box) start += box[0].length;
  }
  if (line.leaf?.type === 'heading' && !line.leaf.setext) {
    const marks = /^#{1,6}(?:[ \t]+|$)/.exec(rest);
    if (marks) start += marks[0].length;
  }
  return start;
}

/**
 * Cmd-Backspace: deletes back to the start of the text on the caret's line, never into a list
 * marker, a checkbox or a heading's `#`s. At the text start it joins, as Backspace does.
 */
function deleteToTextStart(doc: OutlineDoc, sel: Selection): Outcome {
  if (sel.anchor !== sel.head) return notApplicable;
  const pos = sel.head;
  const node = doc.nodeAt(pos);
  if (!node || node.kind === 'atom' || !node.head) return notApplicable;
  const line = doc.lineAt(pos);
  const start = textStart(doc, pos);
  if (pos <= start) return join(doc, sel);
  // the spaces after the caret go too: left after a marker, they would move the content column
  let to = pos;
  while (to < line.to && isBlankChar(doc.text.charCodeAt(to))) to++;
  // the rest now starts the line's text, where it may mean something else: escape it
  let rest = doc.text.slice(to, line.to);
  const first = node.head.type !== 'heading' && line.index === node.head.startLine;
  const escape = node.head.type !== 'heading' && (startsBlock(rest, !first) || (first && reListMarker.test(rest)));
  const digits = escape ? /^\d*/.exec(rest)![0].length : 0;
  if (escape) rest = rest.slice(0, digits) + '\\' + rest.slice(digits);
  let expected: EditedOutlineNode;
  if (node.head.type === 'heading') {
    expected = withText(doc.outline, node.id, normText([doc.text.slice(to, doc.headRange(node)!.to)]));
  } else {
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    if (i < 0 || i >= lines.length) return notApplicable;
    lines[i] = lines[i]!.slice(0, start - line.contentFrom) + rest;
    expected = withText(doc.outline, node.id, normText(lines));
  }
  const changes: TextChange[] = [{ from: start, to, insert: '' }];
  if (escape) changes.push({ from: to + digits, to: to + digits, insert: '\\' });
  return { changes, selection: { anchor: start, head: start }, expected, compare: 'tree' };
}

/**
 * Shift-Enter: breaks the node's text at the caret, continuing on a new line at the node's
 * content column, so the node stays one node. Text after the caret that would start a block
 * there (or underline the paragraph into a heading) is escaped. An empty new line is a
 * placeholder: a blank line would end the paragraph.
 */
function lineBreak(doc: OutlineDoc, sel: Selection): Outcome {
  let pos = Math.min(sel.anchor, sel.head);
  let selTo = Math.max(sel.anchor, sel.head);
  const collapsed = pos === selTo;
  // a selection inside one line is replaced by the break; across lines it is the host's
  if (doc.lineAt(selTo).index !== doc.lineAt(pos).index) return notApplicable;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  // in code a line break is a new line, as Enter makes it
  const codeLine = doc.lineAt(pos);
  if (codeLine.leaf?.type === 'code_block' && codeLine.leaf.fenced) return fenceNewline(doc, node, codeLine, pos, selTo);
  if (node.kind === 'atom') return notApplicable;
  if (node.kind === 'heading') return reject('not-expressible', 'a heading is a single line');
  if (!node.head || node.head.type !== 'paragraph') return notApplicable;
  const line = doc.lineAt(pos);
  const lines = doc.headLines(node);
  const i = line.index - node.head.startLine;
  // in an item's marker, the break would split the marker: it acts at the text start
  if (collapsed && i === 0 && node.kind === 'item') pos = selTo = Math.max(pos, doc.headRange(node)!.from);
  if (i < 0 || i >= lines.length || pos < line.contentFrom) return notApplicable;
  if (normText(lines) === '') return reject('not-expressible', 'an empty node has no line to break');
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? siblingPrefix(doc, node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = line.ending || dominantEnding(text);
  if (lines[i]!.slice(0, pos - line.contentFrom).trim() === '') {
    if (!collapsed) return notApplicable;
    if (i === 0) return reject('not-expressible', 'a line break here would leave an empty line inside the text');
    // at the start of a continuation line: a blank line above it, the caret staying with the text
    // (as Logseq does). A blank line ends a paragraph, so the line and the rest become a paragraph
    // of their own: the item's first child, or the paragraph after this one.
    if (lines[i]!.trim() !== '') {
      const above = doc.lines[line.index - 1]!;
      const blank = eol + prefix.trimEnd();
      // the line starts a paragraph now: it takes the node's full prefix (a lazy line had none), loses
      // its leading spaces (four would make it code), and is escaped where it would start a block
      let textFrom = line.contentFrom;
      while (textFrom < line.to && isBlankChar(text.charCodeAt(textFrom))) textFrom++;
      let firstLine = text.slice(textFrom, line.to);
      const changes: TextChange[] = [{ from: above.to, to: above.to, insert: blank }, { from: line.from, to: textFrom, insert: prefix }];
      if (startsBlock(firstLine, false) || reListMarker.test(firstLine)) {
        const digits = /^\d*/.exec(firstLine)![0].length;
        if (digits > 0) changes.push({ from: textFrom + digits, to: textFrom + digits, insert: '\\' });
        else changes[1] = { from: line.from, to: textFrom, insert: prefix + '\\' };
        firstLine = firstLine.slice(0, digits) + '\\' + firstLine.slice(digits);
      }
      // a paragraph's list follows the new paragraph now, so it is the new one's
      const owns = node.kind === 'paragraph';
      const kept = editNode(doc.outline, node.id, (n) => ({ ...n, text: normText(lines.slice(0, i)), children: owns ? [] : n.children }));
      const fresh: EditedOutlineNode = { ...created('paragraph', normText([firstLine, ...lines.slice(i + 1)])), children: owns ? node.children : [] };
      const expected = node.kind === 'item' ? append(kept, node.id, 'first', [fresh]) : place(kept, node.parent!.id, node.id, 'after', [fresh]);
      const caret = line.from + blank.length + prefix.length;
      return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
    }
    // A second Shift-Enter, on the empty line the first one made: a paragraph break. The line
    // becomes a blank line and the caret moves to a new empty paragraph below, still inside an
    // item (as its first child) or after the paragraph.
    const changes: TextChange[] = [{ from: line.from, to: line.to, insert: eol + prefix }];
    const caret = line.from + eol.length + prefix.length;
    const kept = withText(doc.outline, node.id, normText(lines.slice(0, i)));
    const fresh = created('paragraph', normText(['', ...lines.slice(i + 1)]));
    const expected = node.kind === 'item' ? append(kept, node.id, 'first', [fresh]) : place(kept, node.parent!.id, node.id, 'after', [fresh]);
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }

  let from = pos;
  while (from > line.contentFrom && isBlankChar(text.charCodeAt(from - 1))) from--;
  let to = selTo;
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  const changes: TextChange[] = [{ from, to, insert: eol + prefix }];

  let rest = text.slice(to, line.to);
  // a line starting like this would interrupt the paragraph or turn it into a setext heading:
  // escape its first character, or an ordered marker's delimiter (`1\.`)
  if (startsBlock(rest, true)) {
    const digits = /^\d*/.exec(rest)![0].length;
    if (digits > 0) changes.push({ from: to + digits, to: to + digits, insert: '\\' });
    else changes[0] = { from, to, insert: eol + prefix + '\\' };
    rest = rest.slice(0, digits) + '\\' + rest.slice(digits);
  }
  const caret = from + eol.length + prefix.length;

  const offset = pos - line.contentFrom;
  const expected = withText(doc.outline, node.id, normText([...lines.slice(0, i), lines[i]!.slice(0, offset), rest, ...lines.slice(i + 1)]));
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

function join(doc: OutlineDoc, sel: Selection): Outcome {
  if (sel.anchor !== sel.head) return notApplicable;
  const pos = sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);

  // at the start of a continuation line of a node's text: join it to the line above
  if (node.head?.type === 'paragraph' && line.index > node.head.startLine && line.index <= node.head.endLine) {
    let first = line.contentFrom;
    while (first < line.to && isBlankChar(doc.text.charCodeAt(first))) first++;
    if (pos > first) return notApplicable;
    const prevLine = doc.lines[line.index - 1]!;
    const lines = doc.headLines(node);
    const i = line.index - node.head.startLine;
    const expected = withText(doc.outline, node.id, normText([...lines.slice(0, i - 1), lines[i - 1]! + lines[i]!.trimStart(), ...lines.slice(i + 1)]));
    const changes = [{ from: prevLine.to, to: first, insert: '' }];
    return { changes, selection: { anchor: prevLine.to, head: prevLine.to }, expected, compare: 'tree' };
  }

  // an empty paragraph's placeholder (Enter twice left a list): back to the end of the node above;
  // the list the paragraph owned (Enter left from the middle of a list) stays, in its place
  if (node.kind === 'paragraph' && normText(doc.headLines(node)) === '') {
    const prev = doc.nodes[doc.nodes.indexOf(node) - 1];
    if (!prev || prev.kind === 'root') return notApplicable;
    // the node's lines stay whole (a setext underline, a closing `#`), the caret goes to its text's end
    const end = doc.lines[prev.headEndLine]!.to;
    const caret = doc.headRange(prev)?.to ?? end;
    const expected = place(doc.outline, node.parent!.id, node.id, 'instead', node.children);
    return { changes: [{ from: end, to: line.to, insert: '' }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }

  if (node.kind === 'heading') return doc.config.headingEditing === 'text' ? unwrapHeading(doc, node, line, pos) : joinHeading(doc, node, line, pos);
  if (node.kind === 'paragraph') return joinParagraphAfterGap(doc, node, line, pos) ?? joinParagraph(doc, node, line, pos);
  if (node.kind !== 'item') return notApplicable;
  const range = doc.headRange(node);
  const markerLine = doc.lines[node.startLine]!;
  // a task's checkbox is chrome, like the marker: the text starts after it
  const box = range && node.head!.type === 'paragraph' ? /^\[[ xX]\](?:[ \t]+|$)/.exec(doc.text.slice(range.from, markerLine.to)) : null;
  const contentStart = range ? range.from + (box ? box[0].length : 0) : markerLine.to;
  // anywhere in the item's marker zone counts as its start: deleting the line break before
  // a marker would merge the item's marker into the text above
  if (pos > contentStart || pos < markerLine.from || doc.lineAt(pos).index !== node.startLine) return notApplicable;
  if (range && node.head!.type !== 'paragraph') return notApplicable;
  // right after a checkbox: as plain text, the host's Backspace (`taskEditing: text`); or the checkbox
  // goes, and the task is a plain item (`checkbox`)
  if (box && pos === contentStart && doc.config.taskEditing === 'text') return notApplicable;
  if (box && pos === contentStart && doc.config.taskEditing === 'checkbox') {
    const changes = [{ from: range!.from, to: range!.from + box[0].length, insert: '' }];
    const lines = doc.headLines(node);
    lines[0] = lines[0]!.trimStart().slice(box[0].length);
    const caret = range!.from;
    // emptied right after its parent's text, the item exists only under the caret
    const held = normText(lines) === '' && followsParentText(doc, node);
    return { changes, selection: { anchor: caret, head: caret }, expected: withText(doc.outline, node.id, normText(lines)), compare: 'tree', ...(held ? { placeholders: [caret] } : {}) };
  }
  const empty = isEmptyItem(doc, node);
  const index = doc.nodes.indexOf(node);
  const prev = doc.nodes[index - 1];
  // the first node: nothing to join into, and deleting its marker would unmake the item; an empty one
  // goes, the caret moving to the start of the text below (Workflowy, Logseq)
  if (!prev || prev.kind === 'root') {
    const next = doc.nodes[index + 1];
    // an empty one with children goes too, its children taking its place, as Delete does there
    if (isEmptyWithChildren(doc, node)) {
      const first = node.children[0]!;
      const from = doc.headRange(first)?.from ?? doc.lines[first.startLine]!.to;
      return written(doc, place(doc.outline, node.parent!.id, node.id, 'instead', node.children), sel, {}, (writtenOutline) => {
        const caret = writtenOutline.map(from, 1);
        return { anchor: caret, head: caret };
      });
    }
    if (!empty) return reject('nothing-above');
    // the only node: its marker goes, leaving an empty line to type on
    if (!next) {
      const markerLine = doc.lines[node.startLine]!;
      const changes = [{ from: markerLine.from, to: markerLine.to, insert: '' }];
      return { changes, selection: { anchor: markerLine.from, head: markerLine.from }, expected: remove(doc.outline, node.parent!.id, [node]), compare: 'tree' };
    }
    const changes = removeLines(doc, [node.startLine]);
    const caret = mapPos(changes, doc.headRange(next)?.from ?? doc.lines[next.startLine]!.to, 1);
    return { changes, selection: { anchor: caret, head: caret }, expected: remove(doc.outline, node.parent!.id, [node]), compare: 'tree' };
  }
  // an empty item with children, below another node: it goes, its children going to the node above
  // as in any join (into its place when that node is its parent), the caret to the end of its text
  if (isEmptyWithChildren(doc, node)) {
    const adoptsChildren = prev.kind === 'item' && prev !== node.parent;
    const expected = adoptsChildren
      ? append(remove(doc.outline, node.parent!.id, [node]), prev.id, 'last', node.children)
      : place(doc.outline, node.parent!.id, node.id, 'instead', node.children);
    const end = doc.headRange(prev)?.to ?? doc.lines[prev.headEndLine]!.to;
    return written(doc, expected, sel, {}, (writtenOutline) => {
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
      ? remove(doc.outline, node.parent!.id, [node])
      : adopt
        ? append(remove(doc.outline, node.parent!.id, [node]), prev.id, 'last', node.children)
        : place(doc.outline, node.parent!.id, node.id, 'instead', node.children);
  const prevRange = doc.headRange(prev);

  if (empty) {
    // an empty item: remove its line, caret to the end of the node above
    const from = node.startLine > 0 ? doc.lines[node.startLine - 1]!.to : markerLine.from;
    const to = node.startLine > 0 ? markerLine.to : lineEndWithEnding(doc, node.startLine);
    const caret = prevRange ? prevRange.to : doc.lines[prev.headEndLine]!.to;
    return { changes: [{ from, to, insert: '' }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }

  // into an empty item above: the text moves up into it, checkbox and all
  if (range && prev.kind === 'item' && (!prev.head || (prev.head.type === 'paragraph' && normText(doc.headLines(prev)) === ''))) {
    const prevLine = doc.lines[prev.startLine]!;
    const spaced = prevLine.to > prev.block.markerTo! && isBlankChar(doc.text.charCodeAt(prevLine.to - 1));
    const text = normText(doc.headLines(node));
    if (node.children.length > 0) {
      // the children move: the writer writes the text into the item above, and them
      const { lines, gap } = contentOf(doc, node);
      return joined(doc, expected, prev.id, { text, lines, gap }, 0, 0);
    }
    const changes: TextChange[] = [{ from: prevLine.to, to: range.from, insert: spaced ? '' : ' ' }];
    expected = withText(expected, prev.id, text);
    const caret = prevLine.to + (spaced ? 0 : 1);
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
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
    // the children move: the writer writes the merged text, as the node above's own lines, and them
    const above = contentOf(doc, prev).lines!;
    const { lines: own, gap } = contentOf(doc, node);
    const last = above.length - 1;
    const lastLine = doc.lines[prev.head.endLine]!;
    // where the text ends on the last line (before a heading's closing `#`s)
    const end = prevRange.to - (lastLine.to - above[last]!.length);
    const rest = doc.text.slice(contentStart, doc.lines[node.head!.startLine]!.to);
    const written = [...above.slice(0, last), above[last]!.slice(0, end) + rest + above[last]!.slice(end), ...own!.slice(1)];
    // the text keeps the gap it had before its children
    return joined(doc, expected, prev.id, { text: normText(merged), lines: written, gap }, last, end);
  }
  expected = withText(expected, prev.id, normText(merged));
  const changes = joinChanges(doc, prev, prevRange, contentStart, doc.lines[node.head!.startLine]!.to);
  return { changes, selection: { anchor: prevRange.to, head: prevRange.to }, expected, compare: 'tree' };
}

/**
 * A join the outline writer writes: `tree` with node `id` rewritten to `merged`, the caret at offset
 * `offset` of its line `line`.
 */
function joined(doc: OutlineDoc, tree: EditedOutlineNode, id: number, merged: Pick<EditedOutlineNode, 'text' | 'lines' | 'gap'>, line: number, offset: number): Outcome {
  let node: EditedOutlineNode | null = null;
  const expected = editNode(tree, id, (old) => (node = { ...old, ...merged }));
  return written(doc, expected, { anchor: 0, head: 0 }, {}, (writtenOutline) => {
    const caret = writtenOutline.at(node!, line, offset);
    return { anchor: caret, head: caret };
  });
}

/**
 * The changes that append text starting at `textFrom` (on a line ending at `textEnd`) to the end of
 * `prev`'s text, removing what lay between. A heading's closing `#`s stay at the end of its line,
 * after the joined text.
 */
function joinChanges(doc: OutlineDoc, prev: OutlineNode, prevRange: { to: number }, textFrom: number, textEnd: number): TextChange[] {
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
function joinParagraph(doc: OutlineDoc, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine) return notApplicable;
  const prev = doc.nodes[doc.nodes.indexOf(node) - 1];
  if (!prev || prev.kind !== 'item' || !prev.head || prev.head.type !== 'paragraph') return notApplicable;
  const prevRange = doc.headRange(prev)!;
  const above = contentOf(doc, prev).lines!;
  const own = contentOf(doc, node).lines!;
  const last = above.length - 1;
  const end = prevRange.to - (doc.lines[prev.head.endLine]!.to - above[last]!.length);
  const lines = [...above.slice(0, last), above[last]!.slice(0, end) + own[0]!.trimStart() + above[last]!.slice(end), ...own.slice(1)];
  const prevText = doc.headLines(prev);
  const text = normText([...prevText.slice(0, -1), prevText[prevText.length - 1]! + doc.headLines(node)[0]!.trimStart(), ...doc.headLines(node).slice(1)]);
  const expected = place(doc.outline, node.parent!.id, node.id, 'instead', node.children);
  return joined(doc, expected, prev.id, { text, lines }, last, end);
}

/**
 * Backspace at the start of a heading's text, with `headingEditing: text`: the heading's marks go
 * (an ATX heading's `#`s, a setext heading's underline), and the title is a paragraph where it is,
 * as in Obsidian. A blank line keeps it apart from paragraph text right above or below, which it
 * would otherwise run into. The heading's section continues the section above.
 */
function unwrapHeading(doc: OutlineDoc, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  const head = node.head!;
  if (line.index !== head.startLine) return notApplicable;
  const text = doc.text;
  const eol = line.ending || dominantEnding(text);
  // any line right above or below could run into the title, now paragraph text (a lazy line, indented
  // code, a setext underline): a blank line keeps it apart
  const runsInto = (lineNo: number): boolean => {
    const other = doc.lines[lineNo];
    return !!other && !other.blank;
  };
  const changes: TextChange[] = [];
  let titleFrom: number;
  let title: string;
  if (head.setext) {
    let start = line.contentFrom;
    while (start < line.to && isBlankChar(text.charCodeAt(start))) start++;
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
    if (startsBlock(title, false) || reListMarker.test(title)) {
      const digits = /^\d*/.exec(title)![0].length;
      if (digits) changes.push({ from: range.from + digits, to: range.from + digits, insert: '\\' });
      else escape = '\\';
      title = title.slice(0, digits) + '\\' + title.slice(digits);
    }
    changes.push({ from: line.contentFrom, to: range.from, insert: escape });
    if (range.to < line.to) changes.push({ from: range.to, to: line.to, insert: '' });
    if (runsInto(line.index + 1)) changes.push({ from: line.to, to: line.to, insert: eol });
  }
  const apartAbove = runsInto(line.index - 1);
  if (apartAbove) changes.push({ from: line.from, to: line.from, insert: eol });
  const paragraph: EditedOutlineNode = { id: node.id, kind: 'paragraph', text: normText(title.split('\n')), children: [] };
  const expected = place(doc.outline, node.parent!.id, node.id, 'instead', [paragraph, ...node.children]);
  const sorted = [...changes].sort((a, b) => a.from - b.from);
  // the caret goes to the title's start (before an escape), on the line moved down by a blank line above
  const caret = (head.setext ? titleFrom : line.contentFrom) + (apartAbove ? eol.length : 0);
  return { changes: sorted, selection: { anchor: caret, head: caret }, expected, compare: 'flat' };
}

/**
 * Backspace at the start of a paragraph inside an item, after a blank line: the blank line goes, and
 * the paragraph is more lines of the text above, undoing Shift-Enter at the start of a line
 * (ShiftEnter10). Null where that doesn't apply.
 */
function joinParagraphAfterGap(doc: OutlineDoc, node: OutlineNode, line: LineInfo, pos: number): Outcome | null {
  const range = doc.headRange(node);
  if (!range || pos !== range.from || line.index !== node.head!.startLine || node.parent!.kind !== 'item') return null;
  const above = doc.nodes[doc.nodes.indexOf(node) - 1];
  // the text above is the item's own or a paragraph's: after a sub-item, the line would be its lazy continuation
  if (!above?.head || above.head.type !== 'paragraph' || (above !== node.parent && !(above.kind === 'paragraph' && above.parent === node.parent))) return null;
  const blanks: number[] = [];
  for (let lineNo = node.startLine - 1; lineNo > above.headEndLine; lineNo--) {
    if (!doc.lines[lineNo]!.blank) return null;
    blanks.push(lineNo);
  }
  if (blanks.length === 0) return null;
  const changes = removeLines(doc, blanks.reverse());
  const text = normText([...doc.headLines(above), ...doc.headLines(node)]);
  const expected = withText(remove(doc.outline, node.parent!.id, [node]), above.id, text);
  const caret = mapPos(changes, pos, 1);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

/**
 * Backspace at the start of an ATX heading's text joins the title into the node above, as an
 * outliner merges any block into the one above; the heading's section then continues the section
 * above it. Its closing `#`s go with it.
 */
function joinHeading(doc: OutlineDoc, node: OutlineNode, line: LineInfo, pos: number): Outcome {
  if (node.head!.setext || line.index !== node.startLine) return notApplicable;
  const range = doc.headRange(node)!;
  if (pos > range.from || pos < line.contentFrom) return notApplicable;
  const prev = doc.nodes[doc.nodes.indexOf(node) - 1];
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  const prevRange = doc.headRange(prev);
  if (!prevRange || !prev.head || (prev.head.type !== 'paragraph' && !(prev.head.type === 'heading' && !prev.head.setext))) {
    return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  }
  const prevLines = doc.headLines(prev);
  const title = doc.text.slice(range.from, range.to);
  const unwrapped = place(doc.outline, node.parent!.id, node.id, 'instead', node.children);
  const expected = withText(unwrapped, prev.id, normText([...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + title]));
  const changes = joinChanges(doc, prev, prevRange, range.from, range.to);
  if (range.to < line.to) changes.push({ from: range.to, to: line.to, insert: '' });
  return { changes, selection: { anchor: prevRange.to, head: prevRange.to }, expected, compare: 'flat' };
}

/**
 * Delete at the end of a node's text joins the node below to it: Backspace at that node's start,
 * from the other side. At the end of a line inside the text, it joins the next line; on an empty
 * item, it removes the item, and the caret moves on to the node below.
 */
function joinForward(doc: OutlineDoc, sel: Selection): Outcome {
  if (sel.anchor !== sel.head) return notApplicable;
  const pos = sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  const line = doc.lineAt(pos);
  const at = (p: number): Selection => ({ anchor: p, head: p });
  const head = node.head;
  if (head?.type === 'paragraph' && line.index >= head.startLine && line.index < head.endLine) {
    if (pos !== line.to) return notApplicable;
    const below = doc.lines[line.index + 1]!;
    let first = below.contentFrom;
    while (first < below.to && isBlankChar(doc.text.charCodeAt(first))) first++;
    return join(doc, at(first));
  }
  // the end of the text: its line's end, or before a heading's closing `#`s; on an empty item, anywhere
  // after its marker (only spaces follow it there)
  const lastTextLine = !head ? node.startLine : head.type === 'heading' && head.setext ? head.endLine - 1 : head.endLine;
  const emptyItem = (isEmptyItem(doc, node) || isEmptyWithChildren(doc, node)) && line.index === node.startLine && pos >= node.block.markerTo! && doc.text.slice(pos, line.to).trim() === '';
  if (!emptyItem && (line.index !== lastTextLine || (pos !== line.to && pos !== doc.headRange(node)?.to))) return notApplicable;
  const next = doc.nodes[doc.nodes.indexOf(node) + 1];
  if (!next) return notApplicable;
  if (isEmptyItem(doc, node)) {
    const changes = removeLines(doc, [node.startLine]);
    const caret = mapPos(changes, doc.headRange(next)?.from ?? doc.lines[next.startLine]!.to, 1);
    const expected = remove(doc.outline, node.parent!.id, [node]);
    return { changes, selection: at(caret), expected, compare: 'tree' };
  }
  // an empty item with children takes no special case: its first child joins up into it, as the node
  // below joins any node Delete is at the end of, and that child's children come along
  // an empty paragraph (held by a placeholder) goes with its blank lines: the node below keeps its
  // kind, rather than its text joining into the empty one, and the caret goes to its line's start
  if (node.kind === 'paragraph' && node.children.length === 0 && nodeText(doc, node).trim() === '') {
    const lines = [node.startLine];
    for (let lineNo = node.startLine + 1; lineNo < next.startLine && doc.lines[lineNo]!.blank; lineNo++) lines.push(lineNo);
    const changes = removeLines(doc, lines);
    const caret = mapPos(changes, doc.lines[next.startLine]!.from, 1);
    const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
    const expected = remove(doc.outline, node.parent!.id, [node]);
    return { changes, selection: at(caret), expected, compare: 'tree', drop };
  }
  // a heading below joins as its whole line: its `#`s are text once it isn't a heading (as a text
  // editor deleting the line break would leave them); its section stays where it was
  if (doc.config.headingEditing === 'text' && next.kind === 'heading' && !next.head!.setext && (head?.type === 'paragraph' || (head?.type === 'heading' && !head.setext))) {
    const range = doc.headRange(node)!;
    const headingLine = doc.lines[next.startLine]!;
    let from = headingLine.contentFrom;
    while (from < headingLine.to && isBlankChar(doc.text.charCodeAt(from))) from++;
    const lines = doc.headLines(node);
    // joined into a heading, the closing `#`s of the line below close that heading: they aren't text
    let joinedText = doc.text.slice(from, headingLine.to);
    if (head.type === 'heading') joinedText = joinedText.replace(/[ \t]+#+[ \t]*$/, '');
    const unwrapped = place(doc.outline, next.parent!.id, next.id, 'instead', next.children);
    const expected = withText(unwrapped, node.id, normText([...lines.slice(0, -1), lines[lines.length - 1]! + joinedText]));
    return { changes: joinChanges(doc, node, range, from, headingLine.to), selection: at(range.to), expected, compare: 'flat' };
  }
  // the host would join the block below into the text: Backspace from its side is refused too
  if (next.kind === 'atom' || next.kind === 'quote') return reject('not-expressible', `can't take in the ${next.block.type} below`);
  const nextLine = doc.lines[next.startLine]!;
  // Backspace at a heading's start would unwrap it, and Delete never does; a heading the line join above
  // didn't take (into code, before a setext heading) is refused, as the join was before
  if (next.kind === 'heading' && doc.config.headingEditing === 'text') return reject('not-expressible', `can't join the heading below into ${head?.type ?? 'this node'}`);
  return join(doc, at(doc.headRange(next)?.from ?? nextLine.to));
}

