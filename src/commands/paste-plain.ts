// Plain paste (Ctrl-Shift-V): the clipboard's text into the text of the node at the caret, each of
// its line breaks as Shift-Enter makes one, so the node stays one node (spec/paste-plain.md).

import type { OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { advanceColumns, skipSpaces, trimMd, trimMdEnd, trimMdStart, type ChangeSpec } from '../text.ts';
import { OutlinePlan } from '../encoder/index.ts';
import { CommandContext, blankInQuote, calloutEscape, isCodeLine, normText, paragraphPrefix } from './context.ts';
import { notApplicable, reject, type Outcome } from './plan.ts';
import { codeEdit, isPayloadLine } from './code.ts';

/**
 * Plain paste, by spec/paste-plain.md's rules: on a code line the lines are code (`pasteCode`); a
 * node of one line refuses several; else they go into the node's text (`pasteText`). One line, and
 * outside a node's text, it is the host's. A clipboard starting with a line break and a selection
 * across lines are `executeCommand`'s, which come here with what they leave.
 */
export function pastePlain(ctx: CommandContext, payload: string): Outcome {
  const { doc } = ctx;
  const pasted = payload.split(/\r\n|\n|\r/);
  if (pasted.length < 2) return notApplicable;
  const line = doc.lineAt(ctx.from);
  if (doc.lineAt(ctx.to).index !== line.index || ctx.from < line.contentFrom) return notApplicable;
  const node = doc.nodeAt(ctx.from);
  if (!node) return notApplicable;
  if (isCodeLine(ctx, doc.lineAt(ctx.from)) || isPayloadLine(line)) return pasteCode(ctx, node, line, pasted);
  // a node of one line: an ATX title (an item's too, `- # h`), a callout's title in the Obsidian
  // flavor, a table's row
  if (node.head?.type === 'heading' && !node.head.setext) return reject('not-expressible', 'a heading is a single line');
  if (line.leaf?.type === 'callout_title') return reject('not-expressible', 'a callout title is a single line');
  if (line.leaf?.type === 'table') return reject('not-expressible', 'a table row is a single line');
  const target = textAt(ctx, node, line);
  if (target === 'markup') return reject('not-expressible', 'the caret is in markup');
  return target ? pasteText(ctx, node, target, pasted) : notApplicable;
}

/**
 * On a code line the lines are code as they are, each in the containers the block is in, at its
 * fence's indentation; where one would close the block, its fences grow past it (`codeEdit`). On a
 * line of math, a comment or indented code the same, refused where the lines would end the block.
 */
function pasteCode(ctx: CommandContext, node: OutlineNode, line: LineInfo, pasted: readonly string[]): Outcome {
  const { doc } = ctx;
  const leaf = line.leaf!;
  const fenced = leaf.type === 'code_block' && !!leaf.fenced;
  const opening = doc.lines[leaf.startLine]!;
  const indent = fenced ? /^[ \t]*/.exec(doc.text.slice(opening.contentFrom, opening.to))![0] : '';
  const insert = pasted.join(ctx.ending(line) + ctx.encoder.continuation(line.prefix) + indent);
  const changes = [{ from: ctx.from, to: ctx.to, insert }];
  const caret = ctx.from + insert.length;
  return fenced ? codeEdit(ctx, node, changes, caret) : codeEdit(ctx, node, changes, caret, `the lines would end the ${leaf.type.replace('_', ' ')}`);
}

/**
 * Text in a line of the node's text as the paste leaves it: the document's at `from` (`doc`), written
 * in the selection's place (`insert`: pasted text, an empty item's checkbox), or a backslash written
 * into the document's text at `from` (`escape`).
 */
interface Piece {
  kind: 'doc' | 'insert' | 'escape';
  from: number;
  text: string;
}

/** A line of the node's text as the paste leaves it, its pieces in order; null is a paragraph break. */
type Row = Piece[] | null;

/** Where in a node's text a paste goes. */
interface Target {
  /** The node's text lines, as `OutlineState.headLines` has them, and where each starts. */
  lines: readonly string[];
  starts: readonly number[];
  /** The line the paste goes into, and its text before and after the selection. */
  k: number;
  before: Piece;
  after: Piece;
  /** Where the paste's text is written, and what it writes before the pasted text there. */
  from: number;
  lead: string;
  /** The prefix the node's later lines take. */
  prefix: string;
  /** An empty item: lazy text right after it would continue the pasted text. */
  empty: boolean;
}

/**
 * Where in `node`'s text the selection is: null where it isn't in text that holds several lines (a
 * paragraph's, an item's, a quote's, a setext title's), the host's; `markup` with the caret before the
 * text on its first line, in markup (a callout's `[!type]`). A space a placeholder holds there is text,
 * a deleted character's place, and the paste goes before it, as typing does. An empty item's text
 * starts after its marker's one space, and after its checkbox, wherever the caret is in them.
 */
function textAt(ctx: CommandContext, node: OutlineNode, line: LineInfo): Target | 'markup' | null {
  const { doc } = ctx;
  const { from, to } = ctx;
  if (node.kind === 'item' && doc.isEmpty(node) && line.index === node.startLine) {
    const markerTo = doc.markerTo(node.block);
    if (from < markerTo) return null;
    // a selection in its marker or checkbox
    if (from !== to) return 'markup';
    const box = /^\[[ xX]\]/.exec(trimMdStart(doc.text.slice(markerTo, line.to)))?.[0];
    const before: Piece = { kind: 'insert', from: markerTo, text: box ? box + ' ' : '' };
    const after: Piece = { kind: 'doc', from: line.to, text: '' };
    return { lines: [before.text], starts: [markerTo], k: 0, before, after, from: markerTo, lead: ' ', prefix: ctx.encoder.itemContinuation(node), empty: true };
  }
  const head = node.head;
  const setext = head?.type === 'heading' && !!head.setext;
  if (!head || (head.type !== 'paragraph' && !setext)) return null;
  const k = line.index - head.startLine;
  const lines = doc.headLines(node);
  // a setext underline is markup
  if (setext && line.index === head.endLine) return 'markup';
  if (k < 0 || k >= lines.length) return null;
  const held = from === to && doc.placeholders.includes(from) && doc.textStart(from) === from + 1;
  if (line.index === node.startLine && from < doc.textStart(from) && !held) return 'markup';
  const starts = lines.map((_, j) => doc.lines[head.startLine + j]!.contentFrom);
  const prefix = node.kind === 'item' ? ctx.encoder.itemContinuation(node) : paragraphPrefix(ctx, doc.lines[head.startLine]!);
  const before: Piece = { kind: 'doc', from: line.contentFrom, text: doc.text.slice(line.contentFrom, from) };
  const after: Piece = { kind: 'doc', from: to, text: doc.text.slice(to, line.to) };
  return { lines, starts, k, before, after, from, lead: '', prefix, empty: false };
}

const leadOf = (text: string): number => /^[ \t]*/.exec(text)![0].length;
const textOf = (row: readonly Piece[]): string => row.map((p) => p.text).join('');

/**
 * The pasted lines in the node's text: the first joins the text before the caret, the last the text
 * after it, each between them a line of the text at its column, its leading spaces kept but where it
 * starts a paragraph (four would make it code); a blank line is a paragraph break, as two Shift-Enters
 * make one. Where the clipboard
 * ends with a line break the text after the caret starts a line of its own, keeping the spaces at the
 * break as Shift-Enter's new line does (a paragraph's start loses them); an empty last line is a place
 * to type on, held by a placeholder. Each line the paste writes is escaped where it would read as a
 * block there (a paragraph's start; a continuation line, where only a block that interrupts one would,
 * or an underline), the backslash where the escape falls, in the pasted text or in the text around it
 * (`1` and `. a`); a paragraph's start also where, with the lines below it, it would read as a link
 * reference definition, or open a callout.
 */
function pasteText(ctx: CommandContext, node: OutlineNode, target: Target, pasted: readonly string[]): Outcome {
  const { doc } = ctx;
  const { k, prefix } = target;
  const n = pasted.length;
  const blank = (i: number): boolean => i > 0 && i < n - 1 && trimMd(pasted[i]!) === '';
  if (node.head?.type === 'heading' && pasted.some((_, i) => blank(i))) return reject('not-expressible', 'a heading has no blank line in its title');
  if (target.empty && takesInBelow(ctx, node)) return reject('not-expressible', 'the item would take in the node below it');
  // the rows: the node's lines before the paste's, the paste's, the node's lines after it
  const rows: Row[] = target.lines.slice(0, k).map((text, j) => [{ kind: 'doc', from: target.starts[j]!, text }]);
  // a line starting a paragraph loses its leading spaces, which would make it code; a continuation
  // line keeps them, as Markdown reads past them there
  const own = (text: string, starts: boolean): Piece => ({ kind: 'insert', from: 0, text: starts || trimMd(text) === '' ? trimMdStart(text) : text });
  const textStart = target.empty || (k === 0 && trimMd(target.before.text) === '');
  rows.push([{ ...target.before }, textStart ? own(pasted[0]!, true) : { kind: 'insert', from: 0, text: pasted[0]! }]);
  let after = { ...target.after };
  for (let i = 1; i < n; i++) {
    if (blank(i)) {
      rows.push(null);
      continue;
    }
    const piece = own(pasted[i]!, rows[rows.length - 1] === null);
    if (i < n - 1) {
      rows.push([piece]);
      continue;
    }
    // the text after the caret, starting a paragraph, loses its spaces
    if (piece.text === '' && rows[rows.length - 1] === null) {
      const lead = leadOf(after.text);
      after = { ...after, from: after.from + lead, text: after.text.slice(lead) };
    }
    rows.push([piece, after]);
  }
  const last = rows.length - 1;
  for (const [j, text] of target.lines.slice(k + 1).entries()) rows.push([{ kind: 'doc', from: target.starts[k + 1 + j]!, text }]);
  // the escapes, in the piece the escaped character is in
  const escapeAt = (row: Piece[], at: number): void => {
    for (let p = 0, offset = at; p < row.length; offset -= row[p]!.text.length, p++) {
      const piece = row[p]!;
      if (offset >= piece.text.length) continue;
      const parts: Piece[] =
        piece.kind === 'insert'
          ? [{ ...piece, text: piece.text.slice(0, offset) + '\\' + piece.text.slice(offset) }]
          : [{ ...piece, text: piece.text.slice(0, offset) }, { kind: 'escape', from: piece.from + offset, text: '\\' }, { ...piece, from: piece.from + offset, text: piece.text.slice(offset) }];
      row.splice(p, 1, ...parts);
      return;
    }
  };
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    if (!row) continue;
    // a paragraph's start (the node's own, where the paste ends it, may read as a definition now), and
    // each continuation line the paste writes
    const starts = j === 0 || rows[j - 1] === null;
    if (!starts && (j < k || j > last)) continue;
    const text = textOf(row);
    const lead = leadOf(text);
    // four columns in, a continuation line can't start a block; a tab counts as one, the least it can
    // reach past the prefix it follows
    if (!starts && lead >= 4) continue;
    const below: string[] = [];
    for (let b = j + 1; starts && b < rows.length && rows[b]; b++) below.push(trimMdStart(textOf(rows[b]!)));
    const at = ctx.encoder.escape(text.slice(lead), starts ? 'start' : 'continuation', starts ? below : undefined).at;
    if (at !== null) escapeAt(row, lead + at);
    else if (j === 0 && calloutEscape(ctx, node, [text])) escapeAt(row, lead);
  }
  // the pasted text in the selection's place, and the backslashes in the document's text around it
  const eol = ctx.ending(doc.lineAt(ctx.from));
  const written = (row: readonly Piece[]): string => row.filter((p) => p.kind === 'insert').map((p) => p.text).join('');
  let insert = target.lead + written(rows[k]!);
  for (let j = k + 1; j <= last; j++) insert += rows[j] ? eol + prefix + written(rows[j]!) : eol + trimMdEnd(prefix);
  // only what differs from the text it replaces: an empty task's checkbox stays as it is
  const replaced = doc.text.slice(target.from, after.from);
  let same = 0;
  while (same < replaced.length && same < insert.length && replaced[same] === insert[same]) same++;
  const changes: ChangeSpec[] = [{ from: target.from + same, to: after.from, insert: insert.slice(same) }];
  for (const row of rows) for (const p of row ?? []) if (p.kind === 'escape') changes.push({ from: p.from, to: p.from, insert: '\\' });
  // the caret at the pasted text's end, past the backslashes written before it; where the text after
  // it keeps its spaces on a line of its own, past them, as Shift-Enter's caret
  const kept = last > k && written(rows[last]!) === '' ? leadOf(after.text) : 0;
  const caret = target.from + insert.length + kept + changes.filter((c, i) => i > 0 && c.from < target.from).length;
  const paragraphs = paragraphsOf(rows.map((row) => row && textOf(row)));
  const placeholders = trimMd(textOf(rows[last]!)) === '' ? { placeholders: [caret] } : {};
  const expected = paragraphsPlan(ctx, node, paragraphs);
  const plan = ctx.caret(changes, caret, expected, placeholders);
  // lazy text right after an empty item would continue its new text: then a blank line sets it apart
  const line = doc.lineAt(ctx.from);
  const next = doc.lines[line.index + 1];
  if (!target.empty || !next || next.blank) return plan;
  const apart = eol + trimMdEnd(ctx.encoder.continuation(line.prefix));
  return { ...plan, fallback: () => ctx.caret([{ ...changes[0]!, insert: changes[0]!.insert + apart }, ...changes.slice(1)], caret, expected, placeholders) };
}

/**
 * Whether an empty item, given text, would take in what follows its blank lines: a line there indented
 * to the item's content column (`- ┃` / `` / `  - c`, `c` its sibling now), which an empty item can't
 * hold, as it starts with one blank line at most.
 */
function takesInBelow(ctx: CommandContext, node: OutlineNode): boolean {
  const { doc } = ctx;
  const end = doc.lastDescendant(node).endLine;
  let j = end + 1;
  while (doc.lines[j] && (doc.lines[j]!.blank || blankInQuote(ctx, doc.lines[j]!))) j++;
  const below = doc.lines[j];
  if (!below || j === end + 1) return false;
  // its indentation past the containers the item is in (a quote's `>`)
  const pieces = doc.lines[node.startLine]!.prefix;
  const containers = new Set(pieces.slice(0, pieces.findIndex((p) => p.block === node.block)).map((p) => p.block));
  const outer = below.prefix.filter((p) => containers.has(p.block)).pop();
  const from = outer ? outer.to : below.from;
  return advanceColumns(doc.text, from, skipSpaces(doc.text, from, below.to, 1), outer ? outer.toColumn : 0) >= node.block.contentColumn!;
}

/** A node's text lines split at its paragraph breaks (nulls). */
function paragraphsOf(lines: readonly (string | null)[]): string[][] {
  const paragraphs: string[][] = [[]];
  for (const text of lines) {
    if (text !== null) paragraphs[paragraphs.length - 1]!.push(text);
    else if (paragraphs[paragraphs.length - 1]!.length) paragraphs.push([]);
  }
  return paragraphs;
}

/**
 * The node with its text as these paragraphs: the first its own, the others in an item or a quote its
 * first children, after a paragraph paragraphs of their own, the last taking the paragraph's list.
 */
function paragraphsPlan(ctx: CommandContext, node: OutlineNode, paragraphs: readonly string[][]): OutlinePlan {
  const [first, ...more] = paragraphs;
  if (!more.length) return ctx.plan.setText(node, normText(first!));
  const fresh = more.map((p) => OutlinePlan.created('paragraph', normText(p)));
  if (node.kind === 'item' || node.kind === 'quote') return ctx.plan.setText(node, normText(first!)).append(node, 'first', fresh);
  const lastFresh = { ...fresh[fresh.length - 1]!, children: node.children };
  return ctx.plan.update(node, (n) => ({ ...n, text: normText(first!), children: [] })).place('after', node, [...fresh.slice(0, -1), lastFresh]);
}
