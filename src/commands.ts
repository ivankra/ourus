// Structural commands.
//
// Each command plans text changes for an intended outline change, re-parses the result, and
// compares the new outline with the intended one. A mismatch rejects the command
// (`encoding-failed`) rather than writing a document that doesn't say what was meant.

import { Doc, type ApplyOptions } from './doc.ts';
import type { OutlineNode } from './outline.ts';
import type { Block, LineInfo, PrefixPiece } from './syntax/types.ts';
import { advanceColumns, applyChanges, composeChanges, dominantEnding, mapPos, normalizeChanges, type Change } from './text.ts';

export type Command =
  | { readonly type: 'formatIndent' }
  | { readonly type: 'formatOutdent' }
  | { readonly type: 'moveUp' }
  | { readonly type: 'moveDown' }
  /** Enter: split the node at the caret. */
  | { readonly type: 'insertParagraph' }
  /** Shift-Enter: a line break inside the node's text, which stays one node. */
  | { readonly type: 'insertLineBreak' }
  /** Backspace at the start of a node: join it to the node above. */
  | { readonly type: 'deleteContentBackward' };

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
  | { readonly status: 'applied'; readonly doc: Doc; readonly changes: readonly Change[]; readonly selection: Selection }
  | { readonly status: 'rejected'; readonly reason: RejectReason; readonly detail?: string }
  /** The command doesn't apply here; the host should run its default behaviour. */
  | { readonly status: 'notApplicable' };

export function execute(doc: Doc, command: Command, selection: Selection): Result {
  const plan = planCommand(doc, command, selection);
  if ('status' in plan) return plan;
  // renumbering is best effort: a marker that grows a digit can move its item's content column
  const numbered = renumber(doc, plan);
  if (numbered) {
    const result = verify(doc, numbered);
    if (result.status === 'applied') return result;
  }
  return verify(doc, plan);
}

/**
 * Renumbers the ordered lists a plan touches, counting up from their smallest number. Lists
 * numbered all alike (`1.` `1.` `1.`) are left alone. Null when nothing needs renumbering.
 */
function renumber(doc: Doc, plan: Plan): Plan | null {
  const text = applyChanges(doc.text, plan.changes);
  const places = [...(plan.provisional ?? []), ...doc.provisional.map((p) => mapPos(plan.changes, p, 1)), plan.selection.head];
  const next = Doc.parse(text, { provisional: places });
  const touched = new Set<number>();
  let shift = 0;
  for (const c of normalizeChanges(plan.changes)) {
    const a = c.from + shift;
    for (let l = next.lineAt(a).index; l <= next.lineAt(a + c.insert.length).index; l++) touched.add(l);
    shift += c.insert.length - (c.to - c.from);
  }
  const extra: Change[] = [];
  const walk = (b: Block): void => {
    if (b.type === 'list' && b.list!.type === 'ordered') {
      let hit = false;
      for (let l = b.startLine; l <= b.endLine && !hit; l++) hit = touched.has(l);
      const numbers = b.children.map((item) => parseInt(text.slice(item.markerFrom!, item.markerTo!), 10));
      if (hit && numbers.some((n) => n !== numbers[0])) {
        const start = Math.min(...numbers);
        b.children.forEach((item, i) => {
          if (numbers[i] !== start + i) extra.push({ from: item.markerFrom!, to: item.markerTo!, insert: `${start + i}${item.list!.delimiter}` });
        });
      }
    }
    b.children.forEach(walk);
  };
  walk(next.syntax.root);
  if (extra.length === 0) return null;
  const sel = plan.selection;
  return {
    ...plan,
    changes: composeChanges(doc.text, plan.changes, extra),
    selection: { anchor: mapPos(extra, sel.anchor, -1), head: mapPos(extra, sel.head, -1) },
    ...(plan.identity ? { identity: new Map([...plan.identity].map(([k, v]) => [mapPos(extra, k, -1), v])) } : {}),
    ...(plan.provisional ? { provisional: plan.provisional.map((p) => mapPos(extra, p, 1)) } : {}),
  };
}

// ------------------------------------------------------------------ plans and verification

interface Sig {
  readonly id: number;
  kind: string;
  level?: number;
  text: string;
  children: Sig[];
}

interface Plan {
  readonly changes: Change[];
  /** Selection in the new text. */
  readonly selection: Selection;
  /** The outline the changes must produce. */
  readonly expected: Sig;
  /** `flat` compares nodes in document order only (heading level changes re-derive sections). */
  readonly compare: 'tree' | 'flat';
  /** Ids of moved nodes, by their head start in the new text. */
  readonly identity?: Map<number, number>;
  /** Provisional places the result needs, in the new text (see `Doc.provisional`). */
  readonly provisional?: readonly number[];
}

type Outcome = Plan | Extract<Result, { status: 'rejected' | 'notApplicable' }>;

const notApplicable = { status: 'notApplicable' } as const;
const reject = (reason: RejectReason, detail?: string): Outcome =>
  detail === undefined ? { status: 'rejected', reason } : { status: 'rejected', reason, detail };

function signature(doc: Doc, node: OutlineNode): Sig {
  const sig: Sig = {
    id: node.id,
    kind: node.kind,
    text: nodeText(doc, node),
    children: node.children.map((c) => signature(doc, c)),
  };
  if (node.head?.type === 'heading') sig.level = node.head.level!;
  return sig;
}

function nodeText(doc: Doc, node: OutlineNode): string {
  const lines = doc.headLines(node);
  return node.kind === 'atom' ? lines.join('\n') : normText(lines);
}

const normText = (lines: readonly string[]): string => lines.map((l) => l.trim()).join('\n');

const strip = (s: Sig): unknown => ({ kind: s.kind, level: s.level, text: s.text, children: s.children.map(strip) });

function flatten(s: Sig, out: unknown[] = []): unknown[] {
  out.push({ kind: s.kind, level: s.level, text: s.text });
  for (const c of s.children) flatten(c, out);
  return out;
}

function verify(doc: Doc, plan: Plan): Result {
  const want = JSON.stringify(plan.compare === 'tree' ? strip(plan.expected) : flatten(plan.expected));
  const attempt = (options: ApplyOptions): Doc | string => {
    const next = doc.apply(plan.changes, options);
    const actual = signature(next, next.outline);
    const got = JSON.stringify(plan.compare === 'tree' ? strip(actual) : flatten(actual));
    return got === want ? next : firstDifference(want, got);
  };
  const base = { ...(plan.identity ? { identity: plan.identity } : {}), provisional: plan.provisional ?? [] };
  // A provisional place at the caret only when the text alone can't say what was meant: an
  // empty item right after a paragraph reads as a setext underline without one.
  const caret = plan.selection.anchor === plan.selection.head ? plan.selection.head : -1;
  const newText = applyChanges(doc.text, plan.changes);
  const [lineStart, lineEnd] = lineSpan(newText, Math.max(caret, 0));
  const onCaretLine = (p: number) => caret >= 0 && p >= lineStart && p <= lineEnd;
  const drop = doc.provisional.filter((p) => onCaretLine(mapPos(plan.changes, p, 1)));
  let next = attempt({ ...base, drop });
  if (typeof next === 'string' && caret >= 0) {
    const retry = attempt({ ...base, provisional: [...base.provisional, caret] });
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

/** An item with no text of its own and no children (its head may be a provisional place). */
function isEmptyItem(doc: Doc, node: OutlineNode): boolean {
  if (node.kind !== 'item' || node.children.length > 0) return false;
  if (node.head && node.head.type !== 'paragraph') return false;
  return doc.headLines(node).every((l) => l.trim() === '');
}

/**
 * Settles provisional places the caret has left. A place the text can express without help
 * (an empty item after another item) just stops being provisional; the line of one it can't (an
 * empty item right after a paragraph, an empty line inside a paragraph or between blocks) is
 * removed. Returns null when nothing changes.
 */
export function settle(doc: Doc, caret: number): { changes: Change[]; doc: Doc } | null {
  const [start, end] = lineSpan(doc.text, caret);
  const abandoned = doc.provisional.filter((p) => p < start || p > end);
  if (abandoned.length === 0) return null;
  const changes: Change[] = [];
  const shape = (d: Doc) => JSON.stringify(strip(signature(d, d.outline)));
  const current = shape(doc);
  for (const p of abandoned) {
    const [ls, le] = lineSpan(doc.text, p);
    const without = Doc.parse(doc.text, { provisional: doc.provisional.filter((q) => q !== p) });
    if (shape(without) === current) continue;
    if (ls === le && le === doc.text.length) continue; // an empty last line holds nothing to remove
    if (ls > 0) changes.push({ from: ls - (doc.text.slice(ls - 2, ls) === '\r\n' ? 2 : 1), to: le, insert: '' });
    else changes.push({ from: ls, to: Math.min(doc.text.length, le + (doc.text.slice(le, le + 2) === '\r\n' ? 2 : 1)), insert: '' });
  }
  return { changes, doc: doc.apply(changes, { drop: abandoned }) };
}

function firstDifference(a: string, b: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `expected …${a.slice(Math.max(0, i - 40), i + 60)}… got …${b.slice(Math.max(0, i - 40), i + 60)}…`;
}

function findSig(s: Sig, id: number): { sig: Sig; parent: Sig | null } | null {
  if (s.id === id) return { sig: s, parent: null };
  for (const c of s.children) {
    if (c.id === id) return { sig: c, parent: s };
    const r = findSig(c, id);
    if (r) return r;
  }
  return null;
}

// ------------------------------------------------------------------ dispatch

function planCommand(doc: Doc, command: Command, selection: Selection): Outcome {
  switch (command.type) {
    case 'formatIndent':
    case 'formatOutdent':
    case 'moveUp':
    case 'moveDown': {
      const run = operands(doc, selection);
      if (run === null) return notApplicable;
      if ('status' in run) return run;
      const kind = run[0]!.kind;
      if (run.some((n) => n.kind !== kind)) return reject('mixed-kinds');
      if (command.type === 'moveUp') return move(doc, run, -1, selection);
      if (command.type === 'moveDown') return move(doc, run, 1, selection);
      const delta = command.type === 'formatIndent' ? 1 : -1;
      if (kind === 'heading') return headingLevel(doc, run, delta, selection);
      if (kind !== 'item') return reject('not-expressible');
      return delta > 0 ? indent(doc, run, selection) : outdent(doc, run, selection);
    }
    case 'insertParagraph':
      return split(doc, selection);
    case 'insertLineBreak':
      return lineBreak(doc, selection);
    case 'deleteContentBackward':
      return join(doc, selection);
  }
}

/**
 * The nodes a structural command acts on: the topmost nodes whose own lines the selection
 * touches. They must be contiguous siblings. Null when the selection is on no node.
 */
function operands(doc: Doc, sel: Selection): OutlineNode[] | Extract<Result, { status: 'rejected' }> | null {
  const from = Math.min(sel.anchor, sel.head);
  let to = Math.max(sel.anchor, sel.head);
  const lo = doc.lineAt(from).index;
  let hi = doc.lineAt(to).index;
  // a selection ending at the very start of a line doesn't include that line
  if (to > from && hi > lo && doc.lines[hi]!.from === to) hi--;
  const touched = new Set<OutlineNode>();
  for (let l = lo; l <= hi; l++) {
    const n = doc.nodeAtLine(l);
    if (n) touched.add(n);
  }
  if (touched.size === 0) return null;
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

// ------------------------------------------------------------------ indentation

/** Whether list nesting in this document is written with tabs. */
function usesTabs(doc: Doc): boolean {
  for (const line of doc.lines) {
    if (line.blank) continue;
    for (const p of line.prefix) {
      if (p.block.type !== 'item') continue;
      // the indentation before a marker or of a continuation line, not the padding after a marker
      const piece = doc.text.slice(p.from, p.to);
      const lead = /^[ \t]*/.exec(piece)![0];
      if (lead.includes('\t') || (p.partialTab && lead === piece)) return true;
    }
  }
  return false;
}

function whitespace(fromCol: number, toCol: number, tabs: boolean): string {
  let s = '';
  let col = fromCol;
  if (tabs) {
    while (col + 4 - (col % 4) <= toCol) {
      s += '\t';
      col += 4 - (col % 4);
    }
  }
  return s + ' '.repeat(toCol - col);
}

/**
 * Widens or narrows by `delta` columns the whitespace where `base`'s piece starts on line `l`,
 * shifting everything after it. `base` is the item whose level the line moves into (indent) or
 * out of (outdent). Returns the change (null when the line is left alone: blank lines and lazy
 * continuations), or 'fail' when the line can't move that far.
 */
function reindent(doc: Doc, l: number, base: Block, owner: Block, delta: number, tabs: boolean): Change | null | 'fail' {
  if (delta === 0) return null;
  const line = doc.lines[l]!;
  const text = doc.text;
  // blank lines carry nothing to shift: inside an item even a code block's blank line is empty
  if (line.blank) return null;
  const piece = line.prefix.find((p) => p.block === base);
  // lazy continuation lines (the moving item didn't match them) stay as they are
  if (!piece || !line.prefix.some((p) => p.block === owner)) return null;
  let runTo = piece.from;
  while (runTo < line.to && (text.charCodeAt(runTo) === 32 || text.charCodeAt(runTo) === 9)) runTo++;
  const charCol = advanceColumns(text, line.from, piece.from, 0);
  const endCol = advanceColumns(text, piece.from, runTo, charCol);
  const target = endCol + delta;
  if (target < piece.fromColumn) return 'fail';
  if (delta > 0) {
    const insert = tabs && endCol % 4 === 0 && delta % 4 === 0 ? '\t'.repeat(delta / 4) : ' '.repeat(delta);
    return { from: runTo, to: runTo, insert };
  }
  const k = -delta;
  if (runTo - k >= piece.from && /^ *$/.test(text.slice(runTo - k, runTo)) && !(piece.partialTab && runTo - k === piece.from)) {
    return { from: runTo - k, to: runTo, insert: '' };
  }
  return { from: piece.from, to: runTo, insert: whitespace(charCol, target, tabs) };
}

/**
 * Reindents the lines of `nodes` (contiguous siblings). The whitespace that changes starts at
 * each node's own piece (indent), or at its parent's (`parent`, outdent).
 */
function reindentRun(doc: Doc, nodes: readonly OutlineNode[], delta: number, tabs: boolean, parent?: OutlineNode): Change[] | 'fail' {
  const changes: Change[] = [];
  for (const n of nodes) {
    for (let l = n.startLine; l <= n.endLine; l++) {
      const c = reindent(doc, l, parent ? parent.block : n.block, n.block, delta, tabs);
      if (c === 'fail') return 'fail';
      if (c) changes.push(c);
    }
  }
  return changes;
}

/** Changes that rewrite the bullet character of `nodes` to `bullet`, where it differs. */
function adoptBullet(doc: Doc, nodes: readonly OutlineNode[], bullet: string | null): Change[] {
  if (!bullet) return [];
  return nodes
    .filter((n) => n.block.list?.type === 'bullet' && n.block.list.bulletChar !== bullet)
    .map((n) => ({ from: n.block.markerFrom!, to: n.block.markerTo!, insert: bullet }));
}

/**
 * Numbers ordered items joining a list: after the list's last item, or from 1 when they start
 * a new list (only a list starting at 1 can interrupt a paragraph).
 */
function numberJoining(doc: Doc, nodes: readonly OutlineNode[], joining: readonly OutlineNode[]): Change[] {
  const last = joining[joining.length - 1];
  let n = last?.block.list?.type === 'ordered' ? parseInt(doc.text.slice(last.block.markerFrom!, last.block.markerTo!), 10) + 1 : 1;
  const changes: Change[] = [];
  for (const node of nodes) {
    const b = node.block;
    if (b.list?.type !== 'ordered') continue;
    const marker = `${n++}${b.list.delimiter}`;
    if (doc.text.slice(b.markerFrom!, b.markerTo!) !== marker) changes.push({ from: b.markerFrom!, to: b.markerTo!, insert: marker });
  }
  return changes;
}

const bulletOf = (n: OutlineNode | undefined): string | null =>
  n && n.block.list?.type === 'bullet' ? n.block.list.bulletChar : null;

function indent(doc: Doc, run: OutlineNode[], sel: Selection): Outcome {
  const first = run[0]!;
  const parent = first.parent!;
  const prev = parent.children[parent.children.indexOf(first) - 1];
  if (!prev) return reject('no-previous-sibling');
  if (prev.kind !== 'item') return reject('not-expressible', 'only a list item can hold list items');
  const tabs = usesTabs(doc);
  const childItems = prev.children.filter((c) => c.kind === 'item');
  const p = prev.block;
  let target: number;
  if (childItems.length > 0) target = childItems[childItems.length - 1]!.block.markerColumn!;
  else if (tabs && p.markerColumn! + 4 >= p.contentColumn! && p.markerColumn! + 4 <= p.contentColumn! + 3) target = p.markerColumn! + 4;
  else target = p.contentColumn!;
  const delta = target - first.block.markerColumn!;
  const shifted = reindentRun(doc, run, delta, tabs);
  if (shifted === 'fail') return reject('not-expressible');
  const changes = [...shifted, ...adoptBullet(doc, run, bulletOf(childItems[childItems.length - 1])), ...numberJoining(doc, run, childItems)];

  const expected = signature(doc, doc.outline);
  const exParent = findSig(expected, parent.id)!.sig;
  const moved = exParent.children.splice(exParent.children.findIndex((s) => s.id === first.id), run.length);
  findSig(expected, prev.id)!.sig.children.push(...moved);
  return { changes, selection: mapSelection(changes, sel, 1), expected, compare: 'tree' };
}

function outdent(doc: Doc, run: OutlineNode[], sel: Selection): Outcome {
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const parent = first.parent!;
  if (parent.kind !== 'item') return reject('at-top-level');
  const tabs = usesTabs(doc);
  const delta = parent.block.markerColumn! - first.block.markerColumn!;
  const following = parent.children.slice(parent.children.indexOf(last) + 1);
  const bullet = adoptBullet(doc, run, bulletOf(parent));

  const expected = signature(doc, doc.outline);
  const exParent = findSig(expected, parent.id)!;
  const moved = exParent.sig.children.splice(exParent.sig.children.findIndex((s) => s.id === first.id), run.length);
  const grand = exParent.parent!;
  grand.children.splice(grand.children.indexOf(exParent.sig) + 1, 0, ...moved);

  if (following.length === 0) {
    // the run already sits at the end of its parent: unindenting it in place is enough
    const shifted = reindentRun(doc, run, delta, tabs, parent);
    if (shifted === 'fail') return reject('not-expressible');
    const changes = [...shifted, ...bullet];
    return { changes, selection: mapSelection(changes, sel, 1), expected, compare: 'tree' };
  }

  // the run moves below its parent's remaining children
  const block = relocatedLines(doc, run, delta, tabs, bullet, parent);
  if (block === 'fail') return reject('not-expressible');
  // The run takes the separator after it along (the next sibling closes up), and arrives with
  // a copy of the separator its new neighbours use, so a loose list stays loose.
  const removeFrom = doc.lines[first.startLine]!.from;
  const removeTo = doc.lines[following[0]!.startLine]!.from;
  const anchorLine = doc.lines[parent.endLine]!;
  const insertAt = anchorLine.to + anchorLine.ending.length;
  const uncle = parent.parent!.children[parent.parent!.children.indexOf(parent) + 1];
  const sep = uncle ? doc.text.slice(insertAt, doc.lines[uncle.startLine]!.from) : '';
  const eol = dominantEnding(doc.text);
  let insert = sep + block.text;
  let lead = sep.length;
  if (anchorLine.ending === '') {
    insert = eol + block.text.slice(0, block.text.length - block.lastEnding.length);
    lead = eol.length;
  }
  const changes: Change[] = [
    { from: removeFrom, to: removeTo, insert: '' },
    { from: insertAt, to: insertAt, insert },
  ];
  const base = insertAt - (removeTo - removeFrom) + lead;
  const relocate = (pos: number) => (pos >= removeFrom && pos < removeTo ? base + block.map(pos) : mapPos(changes, pos, 1));
  return {
    changes,
    selection: { anchor: relocate(sel.anchor), head: relocate(sel.head) },
    expected,
    compare: 'tree',
    identity: identityOf(doc, run, relocate),
  };
}

/** The lines of `nodes`, reindented, as one string with their endings, plus a position map into it. */
function relocatedLines(
  doc: Doc,
  nodes: readonly OutlineNode[],
  delta: number,
  tabs: boolean,
  extra: readonly Change[],
  parent?: OutlineNode,
): { text: string; lastEnding: string; map: (pos: number) => number } | 'fail' {
  const shifted = reindentRun(doc, nodes, delta, tabs, parent);
  if (shifted === 'fail') return 'fail';
  const all = [...shifted, ...extra];
  const first = nodes[0]!.startLine;
  const lastLine = nodes[nodes.length - 1]!.endLine;
  const eol = dominantEnding(doc.text);
  let text = '';
  const lineOffsets: number[] = [];
  let lastEnding = '';
  for (let l = first; l <= lastLine; l++) {
    const line = doc.lines[l]!;
    const local = all.filter((c) => c.from >= line.from && c.to <= line.to).map((c) => ({ ...c, from: c.from - line.from, to: c.to - line.from }));
    lineOffsets.push(text.length);
    lastEnding = line.ending || eol;
    text += applyLocal(doc.text.slice(line.from, line.to), local) + lastEnding;
  }
  const map = (pos: number): number => {
    const l = doc.lineAt(pos).index;
    if (l < first || l > lastLine) return 0;
    const line = doc.lines[l]!;
    const local = all.filter((c) => c.from >= line.from && c.to <= line.to).map((c) => ({ ...c, from: c.from - line.from, to: c.to - line.from }));
    return lineOffsets[l - first]! + mapPos(local, pos - line.from, 1);
  };
  return { text, lastEnding, map };
}

function applyLocal(s: string, changes: readonly Change[]): string {
  let out = '';
  let pos = 0;
  for (const c of [...changes].sort((a, b) => a.from - b.from)) {
    out += s.slice(pos, c.from) + c.insert;
    pos = c.to;
  }
  return out + s.slice(pos);
}

const lineEndWithEnding = (doc: Doc, l: number): number => doc.lines[l]!.to + doc.lines[l]!.ending.length;

function identityOf(doc: Doc, nodes: readonly OutlineNode[], relocate: (pos: number) => number): Map<number, number> {
  const ids = new Map<number, number>();
  const walk = (n: OutlineNode): void => {
    ids.set(relocate(doc.headStart(n)), n.id);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return ids;
}

function mapSelection(changes: readonly Change[], sel: Selection, assoc: -1 | 1): Selection {
  return { anchor: mapPos(changes, sel.anchor, assoc), head: mapPos(changes, sel.head, assoc) };
}

// ------------------------------------------------------------------ headings

function headingLevel(doc: Doc, run: OutlineNode[], delta: number, sel: Selection): Outcome {
  const headings: OutlineNode[] = [];
  const walk = (n: OutlineNode): void => {
    if (n.kind === 'heading') headings.push(n);
    n.children.forEach(walk);
  };
  run.forEach(walk);
  const changes: Change[] = [];
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
  const expected = signature(doc, doc.outline);
  for (const h of headings) findSig(expected, h.id)!.sig.level! += delta;
  return { changes, selection: mapSelection(changes, sel, 1), expected, compare: 'flat' };
}

// ------------------------------------------------------------------ moves

function move(doc: Doc, run: OutlineNode[], dir: -1 | 1, sel: Selection): Outcome {
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const parent = first.parent!;
  const other = dir < 0 ? parent.children[parent.children.indexOf(first) - 1] : parent.children[parent.children.indexOf(last) + 1];
  if (!other) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
  const group = (k: string) => (k === 'paragraph' || k === 'atom' ? 'leaf' : k);
  if (group(other.kind) !== group(first.kind)) return reject('not-expressible', `can't reorder ${first.kind} past ${other.kind}`);

  // swap two line ranges, keeping the separator between them in place
  const upper = dir < 0 ? [other] : run;
  const lower = dir < 0 ? run : [other];
  const aFrom = doc.lines[upper[0]!.startLine]!.from;
  const aTo = doc.lines[upper[upper.length - 1]!.endLine]!.to;
  const bFrom = doc.lines[lower[0]!.startLine]!.from;
  const bTo = doc.lines[lower[lower.length - 1]!.endLine]!.to;
  const sep = doc.text.slice(aTo, bFrom);
  // an item moving up to a slot written at another column adopts that column
  const shift = first.kind === 'item' ? lower[0]!.block.markerColumn! - upper[0]!.block.markerColumn! : 0;
  let changes: Change[];
  let relocate: (pos: number) => number;
  if (shift === 0) {
    const b = doc.text.slice(bFrom, bTo);
    changes = [
      { from: aFrom, to: aFrom, insert: b + sep },
      { from: aTo, to: bTo, insert: '' },
    ];
    relocate = (pos) => {
      if (pos < aFrom || pos > bTo) return pos;
      if (pos >= bFrom) return aFrom + (pos - bFrom);
      if (pos > aTo) return aFrom + b.length + (pos - aTo);
      return aFrom + b.length + sep.length + (pos - aFrom);
    };
  } else {
    const tabs = usesTabs(doc);
    const lowerText = relocatedLines(doc, lower, -shift, tabs, []);
    const upperText = relocatedLines(doc, upper, 0, tabs, []);
    if (lowerText === 'fail' || upperText === 'fail') return reject('not-expressible');
    const b = lowerText.text.slice(0, lowerText.text.length - lowerText.lastEnding.length);
    const a = upperText.text.slice(0, upperText.text.length - upperText.lastEnding.length);
    changes = [{ from: aFrom, to: bTo, insert: b + sep + a }];
    const growth = b.length + sep.length + a.length - (bTo - aFrom);
    relocate = (pos) => {
      if (pos < aFrom) return pos;
      if (pos > bTo) return pos + growth;
      if (pos >= bFrom) return aFrom + lowerText.map(pos);
      if (pos > aTo) return aFrom + b.length + (pos - aTo);
      return aFrom + b.length + sep.length + upperText.map(pos);
    };
  }
  const selection = { anchor: relocate(sel.anchor), head: relocate(sel.head) };

  const expected = signature(doc, doc.outline);
  const exParent = findSig(expected, parent.id)!.sig;
  const i = exParent.children.findIndex((s) => s.id === upper[0]!.id);
  const upperSigs = exParent.children.slice(i, i + upper.length);
  const lowerSigs = exParent.children.slice(i + upper.length, i + upper.length + lower.length);
  exParent.children.splice(i, upper.length + lower.length, ...lowerSigs, ...upperSigs);
  return { changes, selection, expected, compare: 'tree', identity: identityOf(doc, [...upper, ...lower], relocate) };
}

// ------------------------------------------------------------------ split and join

/** The text that starts a new line at `node`'s level, up to its marker: outer prefixes plus indentation. */
function siblingPrefix(doc: Doc, node: OutlineNode): string {
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

function continuationText(doc: Doc, p: PrefixPiece): string {
  if (p.block.type === 'blockquote') return doc.text.slice(p.from, p.to);
  return ' '.repeat(p.toColumn - p.fromColumn);
}

function markerText(doc: Doc, node: OutlineNode, next: boolean): string {
  const b = node.block;
  const text = doc.text.slice(b.markerFrom!, b.markerTo!);
  if (!next || b.list!.type === 'bullet') return text;
  return `${parseInt(text, 10) + 1}${b.list!.delimiter}`;
}

const reListMarker = /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/;
const reBlockStart = /^(?:(?:\*[ \t]*){3,}$|(?:-[ \t]*){3,}$|(?:_[ \t]*){3,}$|#{1,6}(?:[ \t]|$)|>|`{3}|~{3})/;
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

function cutText(doc: Doc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Cut | null {
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
 * (`- abc ┃- def` makes two items); other block starts are escaped so the text stays text.
 */
function encodeRest(rest: string): { escape: boolean; marker: number } {
  if (reBlockStart.test(rest)) return { escape: true, marker: 0 };
  const m = reListMarker.exec(rest);
  return { escape: false, marker: m ? m[0].length : 0 };
}

function split(doc: Doc, sel: Selection): Outcome {
  const selFrom = Math.min(sel.anchor, sel.head);
  const selTo = Math.max(sel.anchor, sel.head);
  const node = doc.nodeAt(selFrom);
  if (!node) return notApplicable;
  const line = doc.lineAt(selFrom);
  if (doc.lineAt(selTo).index !== line.index) return notApplicable; // a selection across lines is the host's
  if (node.kind === 'paragraph') return splitParagraph(doc, node, line, selFrom, selTo);
  if (node.kind === 'heading') return splitHeading(doc, node, line, selFrom, selTo);
  if (node.kind !== 'item') return notApplicable;
  const pos = selFrom;
  if (pos < line.contentFrom && line.index !== node.startLine) return notApplicable;
  const eol = line.ending || dominantEnding(doc.text);

  if (isEmptyItem(doc, node)) {
    if (pos < node.block.markerTo!) return notApplicable;
    // Enter on an empty item: a nested one outdents; a top-level one leaves the list, becoming
    // an empty paragraph place set off from the items around it by blank lines
    if (node.parent!.kind === 'item') return outdent(doc, [node], { anchor: pos, head: pos });
    const markerLine = doc.lines[node.startLine]!;
    const prev = doc.lines[node.startLine - 1];
    const next = doc.lines[node.startLine + 1];
    const before = prev && !prev.blank ? eol : '';
    const after = next && !next.blank ? eol : '';
    const changes = [{ from: markerLine.from, to: markerLine.to, insert: before + after }];
    const caret = markerLine.from + before.length;
    const expected = signature(doc, doc.outline);
    const ex = findSig(expected, node.id)!;
    ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig), 1, { id: -1, kind: 'paragraph', text: '', children: [] });
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree', provisional: [caret] };
  }

  if (!node.head || node.head.type !== 'paragraph') return notApplicable; // `- - a`, or a code or quote head
  const cut = cutText(doc, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  // a task's new sibling is a task too, unchecked
  const box = reTaskBox.test(doc.headLines(node)[0]!.trimStart()) ? '[ ] ' : '';
  if (cut.atStart && selFrom === selTo && normText(cut.after) !== '') return insertBefore(doc, node, pos, box);

  // the new node is the first child when the node has items below it, else the next sibling
  const firstChild = node.children[0];
  let prefix: string;
  let marker: string;
  if (firstChild) {
    if (firstChild.kind !== 'item') return reject('not-expressible', 'the item continues with a paragraph or block, not items');
    prefix = siblingPrefix(doc, firstChild);
    marker = markerText(doc, firstChild, false);
  } else {
    prefix = siblingPrefix(doc, node);
    marker = markerText(doc, node, true);
  }
  const rest = encodeRest(cut.rest);
  let insert = eol + prefix + marker + ' ' + box;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (rest.escape) {
    insert += '\\';
    first = box + '\\' + first;
  } else if (rest.marker) {
    insert = eol + prefix;
    caret = cut.from + insert.length + rest.marker;
    first = first.slice(rest.marker);
  } else {
    first = box + first;
  }
  const changes = [{ from: cut.from, to: cut.to, insert }];
  const expected = signature(doc, doc.outline);
  const ex = findSig(expected, node.id)!;
  ex.sig.text = normText(cut.before);
  const fresh: Sig = { id: -1, kind: 'item', text: normText([first, ...cut.after.slice(1)]), children: [] };
  if (firstChild) ex.sig.children.unshift(fresh);
  else ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig) + 1, 0, fresh);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

/** Enter at the start of an item: a new empty item above it, the caret staying with its text. */
function insertBefore(doc: Doc, node: OutlineNode, pos: number, box: string): Outcome {
  const prevLeaf = doc.lines[node.startLine - 1]?.leaf;
  if (prevLeaf?.type === 'paragraph' && prevLeaf.parent === node.block.parent!.parent) {
    return reject('not-expressible', 'an empty item cannot directly follow a paragraph; needs a provisional place');
  }
  const markerLine = doc.lines[node.startLine]!;
  const insert = siblingPrefix(doc, node) + markerText(doc, node, false) + ' ' + box + (markerLine.ending || dominantEnding(doc.text));
  const changes = [{ from: markerLine.from, to: markerLine.from, insert }];
  const caret = pos + insert.length;
  const expected = signature(doc, doc.outline);
  const ex = findSig(expected, node.id)!;
  ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig), 0, { id: -1, kind: 'item', text: box.trim(), children: [] });
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree', identity: new Map([[node.block.markerFrom! + insert.length, node.id]]) };
}

/** Enter at the start of a paragraph or heading: a blank line above it, the text staying put. */
function blankLineAbove(doc: Doc, node: OutlineNode, pos: number): Outcome {
  const first = doc.lines[node.startLine]!;
  const eol = first.ending || dominantEnding(doc.text);
  return {
    changes: [{ from: first.from, to: first.from, insert: eol }],
    selection: { anchor: pos + eol.length, head: pos + eol.length },
    expected: signature(doc, doc.outline),
    compare: 'tree',
  };
}

/** Enter in a paragraph: two paragraphs, a blank line between them. */
function splitParagraph(doc: Doc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  const cut = cutText(doc, node, line, selFrom, selTo);
  if (!cut) return notApplicable;
  if (normText(doc.headLines(node)) === '') return reject('not-expressible', 'an empty paragraph has nothing to split');
  if (cut.atStart && selFrom === selTo) return blankLineAbove(doc, node, selFrom);
  const firstLine = doc.lines[node.head!.startLine]!;
  const prefix = doc.text.slice(firstLine.from, firstLine.contentFrom);
  const eol = line.ending || dominantEnding(doc.text);
  const rest = encodeRest(cut.rest);
  let insert = eol + eol + prefix;
  let caret = cut.from + insert.length;
  let first = cut.after[0]!.trimStart();
  if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    caret += rest.marker;
    first = first.slice(rest.marker);
  }
  const expected = signature(doc, doc.outline);
  const ex = findSig(expected, node.id)!;
  ex.sig.text = normText(cut.before);
  const fresh: Sig = { id: -1, kind: rest.marker ? 'item' : 'paragraph', text: normText([first, ...cut.after.slice(1)]), children: [] };
  ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig) + 1, 0, fresh);
  return { changes: [{ from: cut.from, to: cut.to, insert }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

/** Enter in a heading: the rest of the title becomes the first paragraph of its section. */
function splitHeading(doc: Doc, node: OutlineNode, line: LineInfo, selFrom: number, selTo: number): Outcome {
  if (node.head!.setext) return notApplicable;
  const range = doc.headRange(node)!;
  const text = doc.text;
  if (text.slice(range.from, Math.max(selFrom, range.from)).trim() === '' && selFrom === selTo) {
    return blankLineAbove(doc, node, selFrom);
  }
  if (selFrom < range.from) return notApplicable;
  let from = selFrom;
  while (from > range.from && isBlankChar(text.charCodeAt(from - 1))) from--;
  let to = selTo;
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  const eol = line.ending || dominantEnding(text);
  const prefix = text.slice(line.from, line.contentFrom);
  const restText = text.slice(to, line.to);
  const rest = encodeRest(restText);
  let insert = eol + prefix;
  let caret = from + insert.length;
  let first = restText;
  if (rest.escape) {
    insert += '\\';
    first = '\\' + first;
  } else if (rest.marker) {
    caret += rest.marker;
    first = first.slice(rest.marker);
  }
  const changes: Change[] = [{ from, to, insert }];
  // a paragraph right below the heading stays a paragraph of its own
  const next = doc.lines[line.index + 1];
  if (next && !next.blank && next.leaf?.type === 'paragraph') changes.push({ from: line.to, to: line.to, insert: eol });
  const expected = signature(doc, doc.outline);
  const ex = findSig(expected, node.id)!;
  ex.sig.text = normText([text.slice(range.from, from)]);
  ex.sig.children.unshift({ id: -1, kind: rest.marker ? 'item' : 'paragraph', text: normText([first]), children: [] });
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

const isBlankChar = (c: number): boolean => c === 32 || c === 9;

/**
 * Where Home goes from `pos`: the start of the text on its line, past container prefixes, list
 * markers, a task's checkbox and a heading's `#`s; from there, the start of the line. A blank
 * line's text starts after its prefixes.
 */
export function homePosition(doc: Doc, pos: number): number {
  const line = doc.lineAt(pos);
  if (pos > line.to) return pos; // the empty line after a final line ending
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
  return pos === start ? line.from : start;
}

/**
 * Shift-Enter: breaks the node's text at the caret, continuing on a new line at the node's
 * content column, so the node stays one node. Text after the caret that would start a block
 * there (or underline the paragraph into a heading) is escaped. An empty new line is a
 * provisional place: a blank line would end the paragraph.
 */
function lineBreak(doc: Doc, sel: Selection): Outcome {
  if (sel.anchor !== sel.head) return notApplicable;
  const pos = sel.head;
  const node = doc.nodeAt(pos);
  if (!node || node.kind === 'atom') return notApplicable;
  if (node.kind === 'heading') return reject('not-expressible', 'a heading is a single line');
  if (!node.head || node.head.type !== 'paragraph') return notApplicable;
  const line = doc.lineAt(pos);
  const lines = doc.headLines(node);
  const i = line.index - node.head.startLine;
  if (i < 0 || i >= lines.length || pos < line.contentFrom) return notApplicable;
  if (normText(lines) === '') return reject('not-expressible', 'an empty node has no line to break');
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? siblingPrefix(doc, node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = line.ending || dominantEnding(text);
  if (lines[i]!.slice(0, pos - line.contentFrom).trim() === '') {
    if (i === 0 || lines[i]!.trim() !== '') {
      return reject('not-expressible', 'a line break here would leave an empty line inside the text');
    }
    // A second Shift-Enter, on the empty line the first one made: a paragraph break. The line
    // becomes a blank line and the caret moves to a new empty paragraph below, still inside an
    // item (as its first child) or after the paragraph.
    const changes: Change[] = [{ from: line.from, to: line.to, insert: eol + prefix }];
    const caret = line.from + eol.length + prefix.length;
    const expected = signature(doc, doc.outline);
    const ex = findSig(expected, node.id)!;
    ex.sig.text = normText(lines.slice(0, i));
    const fresh: Sig = { id: -1, kind: 'paragraph', text: normText(['', ...lines.slice(i + 1)]), children: [] };
    if (node.kind === 'item') ex.sig.children.unshift(fresh);
    else ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig) + 1, 0, fresh);
    return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }

  let from = pos;
  while (from > line.contentFrom && isBlankChar(text.charCodeAt(from - 1))) from--;
  let to = pos;
  while (to < line.to && isBlankChar(text.charCodeAt(to))) to++;
  const changes: Change[] = [{ from, to, insert: eol + prefix }];

  let rest = text.slice(to, line.to);
  // a line starting like this would interrupt the paragraph or turn it into a setext heading
  const ordered = /^1(?=[.)](?:[ \t]|$))/.exec(rest);
  if (ordered) {
    changes.push({ from: to + 1, to: to + 1, insert: '\\' });
    rest = '1\\' + rest.slice(1);
  } else if (/^(?:[-+*](?:[ \t]|$)|#{1,6}(?:[ \t]|$)|>|`{3}|~{3}|=+[ \t]*$|(?:[*_][ \t]*){3,}$)/.test(rest)) {
    changes[0] = { from, to, insert: eol + prefix + '\\' };
    rest = '\\' + rest;
  }
  const caret = from + eol.length + prefix.length;

  const offset = pos - line.contentFrom;
  const expected = signature(doc, doc.outline);
  findSig(expected, node.id)!.sig.text = normText([...lines.slice(0, i), lines[i]!.slice(0, offset), rest, ...lines.slice(i + 1)]);
  return { changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
}

function join(doc: Doc, sel: Selection): Outcome {
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
    const expected = signature(doc, doc.outline);
    findSig(expected, node.id)!.sig.text = normText([...lines.slice(0, i - 1), lines[i - 1]! + lines[i]!.trimStart(), ...lines.slice(i + 1)]);
    const changes = [{ from: prevLine.to, to: first, insert: '' }];
    return { changes, selection: { anchor: prevLine.to, head: prevLine.to }, expected, compare: 'tree' };
  }

  // an empty paragraph place (Enter twice left a list): back to the end of the node above
  if (node.kind === 'paragraph' && normText(doc.headLines(node)) === '') {
    const prev = doc.nodes[doc.nodes.indexOf(node) - 1];
    if (!prev || prev.kind === 'root') return notApplicable;
    const end = doc.headRange(prev)?.to ?? doc.lines[prev.headEndLine]!.to;
    const expected = signature(doc, doc.outline);
    const ex = findSig(expected, node.id)!;
    ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig), 1);
    return { changes: [{ from: end, to: line.to, insert: '' }], selection: { anchor: end, head: end }, expected, compare: 'tree' };
  }

  if (node.kind !== 'item') return notApplicable;
  const range = doc.headRange(node);
  const markerLine = doc.lines[node.startLine]!;
  const contentStart = range ? range.from : markerLine.to;
  // anywhere in the item's marker zone counts as its start: deleting the line break before
  // a marker would merge the item's marker into the text above
  if (pos > contentStart || pos < markerLine.from || doc.lineAt(pos).index !== node.startLine) return notApplicable;
  if (range && node.head!.type !== 'paragraph') return notApplicable;
  const empty = isEmptyItem(doc, node);
  const index = doc.nodes.indexOf(node);
  const prev = doc.nodes[index - 1];
  // the first node: nothing to join into, and deleting its marker would unmake the item
  if (!prev || prev.kind === 'root') return reject('nothing-above');
  if (node.children.length > 0) return reject('has-children');

  const expected = signature(doc, doc.outline);
  const ex = findSig(expected, node.id)!;
  ex.parent!.children.splice(ex.parent!.children.indexOf(ex.sig), 1);
  const prevRange = doc.headRange(prev);

  if (empty) {
    // an empty item: remove its line, caret to the end of the node above
    const from = node.startLine > 0 ? doc.lines[node.startLine - 1]!.to : markerLine.from;
    const to = node.startLine > 0 ? markerLine.to : lineEndWithEnding(doc, node.startLine);
    const caret = prevRange ? prevRange.to : doc.lines[prev.headEndLine]!.to;
    return { changes: [{ from, to, insert: '' }], selection: { anchor: caret, head: caret }, expected, compare: 'tree' };
  }

  if (!range || !prevRange || !prev.head || (prev.head.type !== 'paragraph' && !(prev.head.type === 'heading' && !prev.head.setext))) {
    return reject('not-expressible', `can't join into ${prev.head?.type ?? 'an empty item'}`);
  }
  const prevLines = doc.headLines(prev);
  const lines = doc.headLines(node);
  const joined = [...prevLines.slice(0, -1), prevLines[prevLines.length - 1]! + lines[0]!.trimStart(), ...lines.slice(1)];
  findSig(expected, prev.id)!.sig.text = normText(joined);
  const changes = [{ from: prevRange.to, to: range.from, insert: '' }];
  return { changes, selection: { anchor: prevRange.to, head: prevRange.to }, expected, compare: 'tree' };
}

