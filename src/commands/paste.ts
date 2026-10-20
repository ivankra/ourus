// Paste: structured (Markdown pasted as nodes) and plain (text pasted into the node).

import type { Config } from '../config.ts';
import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { advanceColumns, dropColumns, skipSpaces, trimMd, trimMdEnd, trimMdStart, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree } from '../encoder/index.ts';
import { CommandContext, blankInQuote, gapOwner, isCodeLine, isEmptyItem, normText, paragraphPrefix, referenceEscape } from './context.ts';
import { notApplicable, reject, withPlan, type Outcome } from './plan.ts';
import { codeEdit, isPayloadLine } from './code.ts';

/**
 * Structured paste, at the end of a node's text: the payload's nodes land
 * where Enter would put a new node there (after an item as its siblings, under an item with
 * children as its first children, at a heading's end as the section's first content, after a
 * paragraph as the blocks that follow it), as Logseq and Workflowy paste outlines. Its indentation
 * is rewritten from its structure, in the destination's unit, and blocks that would run together
 * get a blank line between them. Anything else is the host's plain-text paste.
 */
/**
 * Paste as plain text: the text goes into the text of the node at the caret, replacing the selection
 * (within one line), each of its line breaks as Shift-Enter makes one: the next line continues the
 * text at its column, escaped where it would start a block, and a blank line is a paragraph break, as
 * two Shift-Enters make one. One line, and outside a node's text, it is the host's.
 */
export function pastePlain(ctx: CommandContext, payload: string): Outcome {
  const { doc } = ctx;
  const lines = payload.split(/\r\n|\n|\r/);
  if (lines.length < 2) return notApplicable;
  const from = ctx.from;
  const to = ctx.to;
  const line = doc.lineAt(from);
  if (doc.lineAt(to).index !== line.index || from < line.contentFrom) return notApplicable;
  const node = doc.nodeAt(from);
  // on a code line, the lines are code as they are, each in the containers the block is in; where
  // one would close the block, its fences grow past it (`codeEdit`)
  if (node && isCodeLine(ctx, line)) {
    const prefix = ctx.encoder.continuation(line.prefix);
    const eol = ctx.ending(line);
    const insert = lines.join(eol + prefix);
    return codeEdit(ctx, node, [{ from, to, insert }], from + insert.length);
  }
  // on a line of math, a comment or indented code, the lines are the block's, as on a code line
  if (node && isPayloadLine(line)) {
    const insert = lines.join(ctx.ending(line) + ctx.encoder.continuation(line.prefix));
    return codeEdit(ctx, node, [{ from, to, insert }], from + insert.length, `the lines would end the ${line.leaf!.type.replace('_', ' ')}`);
  }
  // an ATX title is a single line; a setext title holds several, but no blank line
  const setext = node?.kind === 'heading' && !!node.head?.setext;
  if (node?.kind === 'heading' && !setext) return reject('not-expressible', 'a heading is a single line');
  if (setext && lines.slice(1, -1).some((text) => trimMd(text) === '')) return reject('not-expressible', 'a heading has no blank line in its title');
  // a callout's title and a table's row are a line each: the host's line breaks would end them
  if (node && line.leaf?.type === 'callout_title') return reject('not-expressible', 'a callout title is a single line');
  if (node && line.leaf?.type === 'table') return reject('not-expressible', 'a table row is a single line');
  const empty = !!node && isEmptyText(ctx, node);
  // before a node's text on its first line (a callout's `[!type]`), the lines would go into its markup;
  // a space a placeholder holds is text (a deleted character's place), and the lines go before it,
  // as typing does
  const held = from === to && doc.placeholders.includes(from) && doc.textStart(from) === from + 1;
  if (node && line.index === node.startLine && from < doc.textStart(from) && !empty && !held) return reject('not-expressible', 'the caret is in markup');
  // on an empty item, the text is its text: its first line escaped where it would start a block; in
  // or before an empty task's checkbox, after it
  if (node && empty && from >= doc.markerTo(node.block) && from === to) {
    if (from < doc.textStart(from)) return pastePlain(ctx.at(doc.textStart(from)), payload);
    const prefix = ctx.encoder.itemContinuation(node);
    const eol = ctx.ending(line);
    // a blank line before the last is a paragraph break (null), the line after it a paragraph's start
    const parts = lines.map((text, k) => (k > 0 && k < lines.length - 1 && trimMd(text) === '' ? null : text));
    // each line without its leading spaces, which would make it code; its trailing ones are what was
    // pasted (a hard break's two)
    const textLines = parts.map((text, k) => (text === null ? null : ctx.encoder.escape(trimMdStart(text), k === 0 || parts[k - 1] === null ? 'start' : 'continuation').text));
    // one space after the marker, then the text; an empty task's checkbox stays, the text after it
    const start = emptyItemStart(ctx, node, from, line.to);
    const box = /^\[[ xX]\][ \t]*/.exec(trimMdStart(doc.headLines(node)[0] ?? ''))?.[0];
    if (box && textLines[0] !== null) textLines[0] = trimMdEnd(box) + ' ' + textLines[0];
    const insert = start.lead + textLines.map((text, k) => (k === 0 ? (box ? text!.slice(trimMdEnd(box).length + 1) : text) : text === null ? eol + trimMdEnd(prefix) : eol + prefix + text)).join('');
    const changes = [{ from: start.from, to: Math.max(to, line.to), insert }];
    const caret = start.from + insert.length;
    const last = textLines[textLines.length - 1]!;
    const placeholders = trimMd(last) === '' ? [caret] : undefined;
    const expected = paragraphsPlan(ctx, node, paragraphsOf(textLines));
    const extra = placeholders ? { placeholders } : {};
    const plan = ctx.caret(changes, caret, expected, extra);
    // text right after the item would continue its new text lazily: then a blank line sets it apart
    const next = doc.lines[line.index + 1];
    if (!next || next.blank) return plan;
    const blank = eol + ctx.encoder.continuation(line.prefix).replace(/[ \t]+$/, '');
    return { ...plan, fallback: () => ctx.caret([{ from: start.from, to: Math.max(to, line.to), insert: insert + blank }], caret, expected, extra) };
  }
  if (!node?.head || (node.head.type !== 'paragraph' && !setext) || line.index < node.head.startLine || line.index > node.head.endLine - (setext ? 1 : 0)) return notApplicable;
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? ctx.encoder.itemContinuation(node)
      : paragraphPrefix(ctx, doc.lines[node.head.startLine]!);
  const eol = ctx.ending(line);
  // where the clipboard ends with a line break, the rest of the line starts a line of its own: the
  // spaces at the break go with neither line, as at Enter's split
  const restFrom = trimMd(lines[lines.length - 1]!) === '' ? skipSpaces(text, to, line.to, 1) : to;
  const rest = text.slice(restFrom, line.to);
  // the first line joins the text before the caret; at the start of a line of the text it starts that
  // line, without its leading spaces (four would make it code), escaped where it would start a block
  // there (a node's first line) or interrupt the text; joined onto text before the caret, the line may
  // read as a block start too (`1` and `. a`, `1` and `1. a`), escaped where the escape falls: in the
  // pasted line, or in the text before the caret (`escapeAt`)
  const kind = line.index === node.head.startLine ? 'start' : 'continuation';
  const beforeText = text.slice(line.contentFrom, from);
  const lineStart = trimMd(beforeText) === '';
  const own = trimMdStart(beforeText);
  const at = lineStart ? null : ctx.encoder.escape(own + lines[0]!, kind).at;
  const escapeAt = at !== null && at < own.length ? from - own.length + at : null;
  const firstLine = lineStart
    ? ctx.encoder.escape(trimMdStart(lines[0]!), kind).text
    : at !== null && escapeAt === null
      ? lines[0]!.slice(0, at - own.length) + '\\' + lines[0]!.slice(at - own.length)
      : lines[0]!;
  let insert = firstLine;
  const changes: ChangeSpec[] = escapeAt !== null ? [{ from: escapeAt, to: escapeAt, insert: '\\' }] : [];
  // the lines after the first as written; a blank one before the last is a paragraph break (null)
  const written: (string | null)[] = [];
  let restWritten = rest;
  let opens = false;
  for (let i = 1; i < lines.length; i++) {
    const own = trimMdStart(lines[i]!);
    // the last line runs into the rest of the line, which then starts it
    const last = i === lines.length - 1;
    if (own === '' && !last) {
      insert += eol + trimMdEnd(prefix);
      written.push(null);
      opens = true;
      continue;
    }
    // where a line that would start a block takes its escape: its start, or an ordered marker's delimiter
    const at = ctx.encoder.escape(last ? own + rest : own, opens ? 'start' : 'continuation').at;
    opens = false;
    let value = own;
    if (at !== null && at <= own.length && own) value = own.slice(0, at) + '\\' + own.slice(at);
    else if (at !== null) {
      // the escape falls in the rest of the line, which stays where it is
      changes.push({ from: restFrom + (at - own.length), to: restFrom + (at - own.length), insert: '\\' });
      restWritten = rest.slice(0, at - own.length) + '\\' + rest.slice(at - own.length);
    }
    insert += eol + prefix + value;
    written.push(value);
  }
  changes.unshift({ from, to: restFrom, insert });
  // the node's text, with the pasted lines in it
  const headLines = doc.headLines(node);
  const i = line.index - node.head.startLine;
  const lastLine = written[written.length - 1]! + restWritten;
  const kept = headLines[i]!.slice(0, from - line.contentFrom);
  const keptLine = escapeAt !== null ? kept.slice(0, escapeAt - line.contentFrom) + '\\' + kept.slice(escapeAt - line.contentFrom) : kept;
  const broken = [...headLines.slice(0, i), keptLine + firstLine, ...written.slice(0, -1), lastLine, ...headLines.slice(i + 1)];
  // broken there, the text's start may read as a link reference definition (`[a]: x`): escaped
  const firstBreak = broken.indexOf(null);
  const ref = referenceEscape(ctx, node, (firstBreak < 0 ? broken : broken.slice(0, firstBreak)) as string[]);
  if (ref) changes.push(ref.change);
  const textLines = ref ? [ref.lines[0]!, ...broken.slice(1)] : broken;
  const caret = from + insert.length + (ref && ref.change.from <= from ? 1 : 0) + (escapeAt !== null ? 1 : 0);
  // an empty last line exists only as a place to type into, as after Shift-Enter
  const placeholders = trimMd(lastLine) === '' && i === headLines.length - 1 ? [caret] : undefined;
  return ctx.caret(changes, caret, paragraphsPlan(ctx, node, paragraphsOf(textLines)), { ...(placeholders ? { placeholders } : {}) });
}

/**
 * Where an empty item's text starts as a paste writes it, and the space it needs before it: right after
 * the marker's one space. Spaces past it (`-  ┃`, a deleted character's place) go: text after them would
 * move the item's content column past its children's.
 */
function emptyItemStart(ctx: CommandContext, node: OutlineNode, from: number, lineTo: number): { from: number; lead: string } {
  const { doc } = ctx;
  const markerTo = doc.markerTo(node.block);
  if (/^[ \t]*$/.test(doc.text.slice(markerTo, lineTo)) && from >= markerTo) return { from: markerTo, lead: ' ' };
  return { from, lead: doc.text.slice(markerTo, lineTo) === '' ? ' ' : '' };
}

/** Whether `node` is an item with no text of its own, children or not: a paste fills it. */
const isEmptyText = (ctx: CommandContext, node: OutlineNode): boolean => node.kind === 'item' && (isEmptyItem(ctx, node) || ctx.doc.isEmpty(node));

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
 * The node with its text as these paragraphs: the first its own, the others in an item its first
 * children, after a paragraph paragraphs of their own, the last taking the paragraph's list.
 */
function paragraphsPlan(ctx: CommandContext, node: OutlineNode, paragraphs: readonly string[][]): OutlinePlan {
  const [first, ...more] = paragraphs;
  if (!more.length) return ctx.plan.setText(node, normText(first!));
  const fresh = more.map((p) => OutlinePlan.created('paragraph', normText(p)));
  if (node.kind === 'item') return ctx.plan.setText(node, normText(first!)).append(node, 'first', fresh);
  const lastFresh = { ...fresh[fresh.length - 1]!, children: node.children };
  return ctx.plan.update(node, (n) => ({ ...n, text: normText(first!), children: [] })).place('after', node, [...fresh.slice(0, -1), lastFresh]);
}

/**
 * Structured paste: the clipboard's Markdown as nodes, by the rules of spec/paste.md. Nothing pasted
 * is lost: what can't be structure where it lands stays text. The destination decides form (bullet,
 * columns, spacing), the paste content (text, numbers, checkboxes, its own nesting). A list's first
 * item sets its form. The nodes go where Enter at the end of the node's text would put a new one, or
 * in an empty item's place; what can't be a node there is pasted as plain text. Pasted numbers are
 * never renumbered. A block that would end a list goes into the item at the caret, after its text.
 * One line of plain text is inline text, the host's; one that is an item, a heading or a quote is
 * pasted as nodes, as several lines are. Plain lines are text, as plain paste puts them
 * (`pasteStructuredLines: text`), or nodes (`items`). In the middle of a node's text the node splits
 * there (`pasteStructuredMidText: split`), or the paste goes after it (`after`); at its end the paste
 * goes after it (`pasteStructuredAtEnd: after`), or its first text joins it (`join`). A list landing
 * in a list of the other kind takes its form, its numbers kept as text (`pasteStructuredListForm`).
 */
/**
 * A clipboard's lines (its blank ones at either end gone) as paste reads them: without the indentation
 * all of them share; and a fenced block copied from inside a list or a quote, from its fence on, whose
 * fence's line lost the indentation the others keep, its closing fence among them, which then doesn't
 * close the block (a code fence four columns in), read with the others losing it too, which closes the
 * fence and gives the code its own indentation back. A block that closes as it is reads as it is, its
 * code's indentation kept (so do other clipboards). The side-by-side runs render the same Markdown as
 * HTML for apps that read a clipboard's HTML (`sxs/lib/clipboard.ts`).
 */
export function clipboardSource(lines: readonly string[], config: Partial<Config>): string[] {
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  const common = Math.min(...lines.filter((text) => trimMd(text) !== '').map(indentOf));
  const source = lines.map((text) => (trimMd(text) === '' ? '' : dropColumns(text, common)));
  const fence = /^(`{3,}|~{3,}|\$\$|%%)/.exec(source[0]!);
  const rest = source.slice(1).filter((text) => text !== '');
  const inner = rest.length ? Math.min(...rest.map(indentOf)) : 0;
  const closes = (): boolean => !!(OutlineState.parse(source.join('\n'), { config }).root.children[0]?.block as { closed?: boolean } | undefined)?.closed;
  if (fence && inner > 0 && indentOf(source[source.length - 1]!) === inner && !closes() && new RegExp(`^[ \\t]*\\${fence[1]![0]}{${Math.min(fence[1]!.length, 3)},}[ \\t]*$`).test(source[source.length - 1]!)) {
    return [source[0]!, ...source.slice(1).map((text) => (text === '' ? '' : dropColumns(text, inner)))];
  }
  return source;
}

export function paste(ctx: CommandContext, payload: string): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const lines = payload.split(/\r\n|\n|\r/);
  while (lines.length && trimMd(lines[0]!) === '') lines.shift();
  while (lines.length && trimMd(lines[lines.length - 1]!) === '') lines.pop();
  if (lines.length === 0) return notApplicable;
  // one line without a line break is inline text; with one (a line copied whole), the break is
  // Shift-Enter's, and what follows the caret starts a line of its own
  const inline = lines.length < 2 && !/[\r\n][ \t\r\n]*$/.test(payload);
  let pos = ctx.sel.head;
  let node = doc.nodeAt(pos);
  // on a blank line, in the gap of the node above: the paste goes where Enter at the end of that node
  // would put a new one, as new nodes (plain lines too: the caret is on no text to join them to), the
  // blank lines staying; the host's paste would replace the blank line, running the lines into the
  // text around it
  const onBlank = !node && !inline && doc.lineAt(pos).blank;
  if (onBlank) {
    const owner = gapOwner(ctx, doc.lineAt(pos).index);
    const end = owner?.kind === 'atom' ? doc.lines[owner.block.endLine]!.to : owner ? doc.headRange(owner)?.to : undefined;
    if (!owner || end === undefined) return notApplicable;
    [node, pos] = [owner, end];
  }
  if (!node) return notApplicable;
  // in code, what is pasted is code
  if (isCodeLine(ctx, doc.lineAt(pos))) return pastePlain(ctx, payload);
  // in or before an empty task's checkbox, the paste goes after it, as into its text
  if (!onBlank && isEmptyText(ctx, node) && pos >= doc.markerTo(node.block) && pos < doc.textStart(pos)) return paste(ctx.at(doc.textStart(pos)), payload);
  let source = clipboardSource(lines, doc.config);
  let fragment = OutlineState.parse(source.join('\n'), { config: doc.config });
  // frontmatter is only at a document's start: pasted into one, its lines are what they read as there
  // (a thematic break, a setext heading), read after a blank line, which keeps line numbers by a line
  if (fragment.lines[0]?.leaf?.type === 'frontmatter') {
    source.unshift('');
    fragment = OutlineState.parse(source.join('\n'), { config: doc.config });
  }
  // a fenced block the clipboard leaves open is closed where it ends, as it reads there: open, it
  // would run on into the text after the paste
  const lastLeaf = fragment.lines[fragment.lines.length - 1]?.leaf;
  if (lastLeaf && ((lastLeaf.type === 'code_block' && lastLeaf.fenced) || lastLeaf.type === 'math_block' || lastLeaf.type === 'comment_block') && !closesFence(source.slice(lastLeaf.startLine, lastLeaf.endLine + 1))) {
    const opening = /^.*?(?:`{3,}|~{3,}|\$\$|%%)/.exec(source[lastLeaf.startLine]!);
    if (opening) {
      source = [...source, opening[0]];
      fragment = OutlineState.parse(source.join('\n'), { config: doc.config });
    }
  }
  const roots = fragment.root.children;
  // one line of plain text is inline text, the host's; one that is an item, a heading or a quote is nodes
  if (inline && !(roots.length === 1 && (roots[0]!.kind === 'item' || roots[0]!.kind === 'heading' || roots[0]!.kind === 'quote'))) return notApplicable;
  // at the end of a block that isn't text (after code's closing fence, a table's last row), the paste
  // goes right after it, where Enter puts a new node; elsewhere in it, lines are the block's own, as
  // plain paste puts them (a table's row refuses them), and one line inline, the host's
  const atBlockEnd = node.kind === 'atom';
  if (atBlockEnd && pos !== doc.lines[node.block.endLine]!.to) return inline ? notApplicable : pastePlain(ctx, payload);
  // plain lines (paragraphs only) are text, as plain paste puts them, where the node holds lines
  if (doc.config.pasteStructuredLines === 'text' && node.kind !== 'heading' && !atBlockEnd && !onBlank && roots.every((root) => root.kind === 'paragraph' && !root.children.length)) return pastePlain(ctx, payload);
  // an empty item, with children or not, takes the paste in its place, its children after it
  const empty = isEmptyText(ctx, node) && pos >= doc.markerTo(node.block);
  // with `pasteStructuredOnParent: after`, after an item's children, as its next siblings, or a list
  // last in a heading's section, the text left as it is
  const lastChild = node.children[node.children.length - 1];
  const afterChildren = doc.config.pasteStructuredOnParent === 'after' && !empty && !onBlank && !!lastChild && (node.kind === 'item' || (node.kind === 'heading' && roots.every((root) => root.kind === 'item')));
  if (!empty && !atBlockEnd) {
    if (!node.head || (node.kind !== 'item' && node.kind !== 'heading' && node.kind !== 'paragraph')) return notApplicable;
    const range = doc.headRange(node)!;
    const lastText = node.head.type === 'heading' && node.head.setext ? node.head.endLine - 1 : node.head.endLine;
    const line = doc.lineAt(pos);
    // in the middle of a paragraph's or an item's text: the node splits there (`split`), or the paste
    // goes after it, as at its end (`after`); a heading's title is one line, so after it, as at its end
    if (!(line.index === lastText && pos >= range.to)) {
      // before the text, in markup (a heading's `#`s), the host's
      if (line.index < node.head.startLine || line.index > lastText || pos < line.contentFrom || (node.kind === 'heading' && pos < range.from)) return notApplicable;
      // in the middle of the text one line is inline text, the host's, whatever it would be at the end
      if (inline) return notApplicable;
      if (doc.config.pasteStructuredMidText === 'split' && node.head.type === 'paragraph' && !afterChildren) {
        const split = pasteSplit(ctx, node, line, pos, fragment, source, /(\r\n|\n|\r)[ \t\r\n]*$/.test(payload));
        if (split) return split;
      }
    } else if (doc.config.pasteStructuredAtEnd === 'join' && !onBlank && node.head.type === 'paragraph' && !afterChildren) {
      // at the end of the text, the paste's first text joins it, as `split` joins it in the middle
      const joined = pasteSplit(ctx, node, line, pos, fragment, source, /(\r\n|\n|\r)[ \t\r\n]*$/.test(payload));
      if (joined) return joined;
    }
  }

  // a quote or a table pasted on an empty item is its first block: the item has no text of its own
  if (empty && roots.length === 1 && (roots[0]!.kind === 'quote' || roots[0]!.block.type === 'table')) return pasteFirstBlock(ctx, node, roots[0]!, fragment, source);
  // the nodes go in an empty item's place, else as the first children of a heading or of an item with
  // children, else right after the node
  // a list pasted at the end of a paragraph that owns one goes first in it, as Enter there puts a new
  // node right after the paragraph's text
  const ownsList = node.kind === 'paragraph' && node.children[0]?.kind === 'item' && fragment.root.children.every((root) => root.kind === 'item');
  const asChildren = !empty && (node.kind === 'heading' || (node.kind === 'item' && node.children.length > 0 && !afterChildren) || ownsList);
  // the list the paste lands in: the children's of an item that has them, else the item's own
  // (at a heading's end, the list its section starts with, which the pasted items join; with
  // `pasteStructuredOnParent: after`, the list it ends with)
  const landing = afterChildren ? lastChild : node.children[0];
  const destList = asChildren && (node.kind === 'item' || node.kind === 'heading') && landing?.kind === 'item' && fragment.root.children.every((root) => root.kind === 'item') ? landing.block.parent : node.kind === 'item' ? node.block.parent : null;
  // a tight list takes the pasted nodes tight, whatever their spacing in the clipboard (rule 2): the
  // blank lines after each of them go (a blank line is still written where Markdown needs one)
  const tight = destList?.tight === true;
  const fitted0 = fitPaste(ctx, node, fragment, empty, asChildren, tight);
  // what can't be a node where it lands is pasted as text
  if (!fitted0) return pastePlain(ctx, payload);
  // on an empty task the first pasted item takes its place with its checkbox, unless it has its own
  const box = empty ? /^\[[ xX]\]/.exec(trimMdStart(doc.headLines(node)[0] ?? '')) : null;
  const head = fitted0.nodes[0];
  if (box && head?.kind === 'item' && !head.blockType && head.lines?.length && !/^\[[ xX]\](?:[ \t]|$)/.test(head.lines[0]!)) {
    const lines = [`${box[0]} ${head.lines[0]}`, ...head.lines.slice(1)];
    fitted0.nodes[0] = { ...head, lines, text: normText(lines) };
  }
  const fitted1 = tight ? { ...fitted0, nodes: fitted0.nodes.map(allTight), into: fitted0.into.map(allTight) } : fitted0;
  // the caret goes to the end of the pasted text; after code, to the end of its last line, not after
  // the closing fence, where typing would unmake it; after a setext title, to its end, not the underline's
  let last = fitted1.caret ?? (fitted1.nodes.length ? fitted1.nodes : fitted1.into)[(fitted1.nodes.length ? fitted1.nodes : fitted1.into).length - 1]!;
  if (!fitted1.caret) while (last.children.length) last = last.children[last.children.length - 1] as OutlinePlanNode;
  const setextTitle = (last.kind === 'heading' || last.blockType === 'heading') && last.lines!.length > 1 && /^ {0,3}(=+|-+)[ \t]*$/.test(last.lines![last.lines!.length - 1]!);
  const lastLine = last.lines!.length - (closesFence(last.lines!) || setextTitle ? 2 : 1);
  // in a loose list, pasted items are set off from each other, as the list's are, and in an empty item's
  // place from an item after them (elsewhere the encoder sets the run apart from what is around it)
  if (destList?.tight === false && fitted1.nodes.every((n) => n.kind === 'item')) {
    const more = empty && node.parent!.children[node.parent!.children.indexOf(node) + 1]?.kind === 'item';
    fitted1.nodes = fitted1.nodes.map((n, k) => (k < fitted1.nodes.length - 1 || more ? withGap(n) : n));
  }
  // an emptied item's children follow the paste that takes its place: the last pasted node's
  const kids = empty ? node.children : [];
  const fitted = kids.length && fitted1.nodes.length ? { ...fitted1, nodes: [...fitted1.nodes.slice(0, -1), { ...fitted1.nodes[fitted1.nodes.length - 1]!, children: [...fitted1.nodes[fitted1.nodes.length - 1]!.children, ...kids] }] } : fitted1;
  // what a pasted heading takes in leaves its place, for the heading's section (`remove` takes siblings)
  let base = ctx.plan;
  for (const parent of new Set(fitted.taken?.map((n) => n.parent))) base = base.remove(fitted.taken!.filter((n) => n.parent === parent));
  let expected = !fitted.nodes.length
    ? base
    : empty
      ? base.place('instead', node, fitted.nodes)
      : fitted.after
        ? base.place('after', fitted.after, fitted.nodes)
        : asChildren
          ? base.append(node, afterChildren ? 'last' : 'first', fitted.nodes)
          : base.place('after', node, fitted.nodes);
  // blocks that would end the list go into the item at the caret, after its text
  if (fitted.into.length) expected = expected.append(node, 'first', fitted.into);
  for (const [item, marker] of fitted.restyle) {
    expected = expected.update(item, (n) => ({ ...n, marker, exactMarker: true }));
  }
  // pasted nodes are set off from what they land between; items going first in a paragraph's list
  // keep the paragraph's spacing from its list (a blank line between them, or none)
  const listApart = ownsList && doc.lines.slice(node.headEndLine + 1, node.children[0]!.startLine).some((line) => line.blank);
  // in a list, the list's spacing: a tight one takes the paste tight (a blank line is still written
  // where Markdown needs one), a loose one sets it apart
  // outside a list, after a paragraph written without a blank line after it, the paste goes without one
  // too, where Markdown doesn't need one (a section written tight stays tight); under a heading, as its
  // first nodes, it is set off as the heading's section would be (true-outliner's #264)
  const below = doc.lines[node.headEndLine + 1];
  const writtenTight = !empty && !destList && node.kind !== 'heading' && below !== undefined && !below.blank && !blankInQuote(ctx, below);
  const separate = empty || (ownsList && !listApart) || tight || writtenTight ? {} : { separate: 'around' as const };
  const plan = ctx.encode(expected, separate, (writtenOutline) => {
    const caret = writtenOutline.at(last, lastLine, last.lines![lastLine]!.length);
    return { anchor: caret, head: caret };
  });
  // an empty item's placeholder (right after its parent's text) goes with it
  const drop = empty ? doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine) : [];
  return withPlan(plan, drop.length ? { drop } : {});
}

/** Whether `lines` are a fenced block's (code, math, a comment), its last line the closing fence. */
function closesFence(lines: readonly string[]): boolean {
  const open = /^[ \t]*(`{3,}|~{3,}|\$\$|%%)/.exec(lines[0] ?? '');
  if (!open || lines.length < 2) return false;
  const close = /^[ \t]*(`+|~+|\$\$|%%)[ \t]*$/.exec(lines[lines.length - 1]!);
  return !!close && close[1]![0] === open[1]![0] && close[1]!.length >= open[1]!.length;
}

/**
 * Nodes as an item or a quote holds them: a paragraph there owns no list, under a heading too, so
 * every paragraph's list follows it, at every depth.
 */
function unownLists(nodes: readonly PlanTree[]): PlanTree[] {
  return nodes.flatMap((n) => {
    if (!OutlinePlan.isPlanned(n)) return [n];
    const kids = unownLists(n.children);
    return n.kind === 'paragraph' && kids.length ? [{ ...n, children: [] }, ...kids] : [{ ...n, children: kids }];
  });
}

/** `n` without the blank lines after it: its last descendant's gap gone. */
const endTight = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), endTight(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 0 });

/**
 * `n` without any blank line of its own: in a tight list, a blank line between an item's blocks would
 * make the list loose (one is still written where Markdown needs one, between two paragraphs).
 */
const allTight = (n: OutlinePlanNode): OutlinePlanNode => ({ ...n, gap: 0, children: n.children.map((c) => (OutlinePlan.isPlanned(c) ? allTight(c as OutlinePlanNode) : c)) });

/** `n` with a blank line after it: its last descendant's gap one. */
const withGap = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), withGap(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 1 });

/**
 * Pasted lists with their numbers as text (`pasteStructuredListForm: literal`), at every depth: an
 * ordered item is an item of `bullet`, its text starting with its number, escaped (`- 1\. x`); one
 * whose text can't start with it (a heading, code) keeps its number.
 */
function literalLists(nodes: readonly PlanTree[], bullet: string): PlanTree[] {
  return nodes.map((n) => {
    if (!OutlinePlan.isPlanned(n)) return n;
    const children = literalLists(n.children, bullet);
    const number = n.kind === 'item' && !n.blockType && n.lines?.length ? /^(\d{1,9})([.)])$/.exec(n.marker ?? '') : null;
    if (!number) return { ...n, children };
    const lines = [`${number[1]}\\${number[2]} ${n.lines![0]!}`, ...n.lines!.slice(1)];
    return { ...n, marker: bullet, exactMarker: true, lines, text: normText(lines), children };
  });
}

/**
 * The pasted fragment's top-level nodes as they land at `node` (`after` a section the paste closes), or
 * null where one can't be a node there (a heading outside a list that would take in what follows it;
 * a block in an empty item's place that can't be its first block),
 * to be pasted as text instead. Into a list, the pasted items take the list's form: its bullet, or its
 * numbering, starting from the item before. A pasted ordered item in a bullet list keeps its number
 * as text (`- 1\. x`), and a pasted number in an ordered list is kept as written. Pasted as a list's
 * first items, a single ordered list keeps its form, and the items after it are numbered on
 * (`restyle`). So with `pasteStructuredListForm: text`; with `literal` a pasted number is always text,
 * nested lists' too; with `drop` it goes; with `own` items of the other kind keep their form. Plain
 * lines are items, one each, and a heading is an item, its section with it. A block
 * that is none of these (code, a quote, a table) would end the list as a sibling of its items: it goes
 * into the item before it, the item at the caret (`into`) or a pasted one; among an item's children,
 * or in an empty item's place, it stays where it is.
 */
function fitPaste(ctx: CommandContext, node: OutlineNode, fragment: OutlineState, empty: boolean, asChildren: boolean, tight: boolean): { nodes: OutlinePlanNode[]; into: OutlinePlanNode[]; restyle: [OutlineNode, string][]; after?: OutlineNode; taken?: OutlineNode[]; caret?: OutlinePlanNode } | null {
  const { doc } = ctx;
  const roots = fragment.root.children;
  const copy = (root: OutlineNode): OutlinePlanNode => OutlinePlan.copy(fragment, root);
  // outside a list (a paragraph's own list aside), the nodes go in as they are, and a pasted heading
  // splits the section it lands in, as one typed there would: what follows it, up to a heading of its
  // level or above, is its section (`taken`). It goes after the sections it closes (`## h` in `## A`
  // goes after `A`, the rest of `A` its)
  if (node.kind !== 'item' && !(node.kind === 'paragraph' && asChildren)) {
    // in a quote or an item a paragraph owns no list: the list it brings follows it
    // (a section's paragraphs own lists only outside items and quotes, under headings too)
    let container: OutlineNode | null = asChildren ? node : node.parent;
    while (container && (container.kind === 'heading' || container.kind === 'paragraph')) container = container.parent;
    const contained = container?.kind === 'item' || container?.kind === 'quote';
    const nodes = contained ? (unownLists(roots.map(copy)) as OutlinePlanNode[]) : roots.map(copy);
    const levels = fragment.nodes.filter((n) => n.kind === 'heading').map((n) => n.head!.level!);
    if (!levels.length) return { nodes, into: [], restyle: [] };
    const top = Math.min(...levels);
    const level = (n: OutlineNode): number => (n.kind === 'heading' ? n.head!.level! : Infinity);
    // at a heading's text end, its first children, unless the paste closes it
    const inside = asChildren && level(node) < top;
    const taken: OutlineNode[] = [];
    const takeAfter = (siblings: readonly OutlineNode[], from: number): void => {
      for (const n of siblings.slice(from)) {
        if (level(n) <= top) break;
        taken.push(n);
      }
    };
    let at = node;
    // after the caret: a heading's section, or the list a paragraph owns
    takeAfter(node.children, 0);
    if (!inside) {
      while (at.parent?.kind === 'heading' && level(at.parent) >= top) {
        takeAfter(at.parent.children, at.parent.children.indexOf(at) + 1);
        at = at.parent;
      }
      takeAfter(at.parent!.children, at.parent!.children.indexOf(at) + 1);
    }
    if (!taken.length) return { nodes, into: [], restyle: [], ...(!inside && (at !== node || asChildren) && { after: at }) };
    // each node taken in goes under the paste's deepest open heading that holds it (a heading, under one above its level)
    const open: OutlineNode[] = [];
    for (let n = roots[roots.length - 1]; n?.kind === 'heading'; n = n.children[n.children.length - 1]) open.push(n);
    const under = new Map<number, OutlineNode[]>();
    for (const n of taken) {
      let depth = open.length - 1;
      while (depth > 0 && level(open[depth]!) >= level(n)) depth--;
      under.set(depth, [...(under.get(depth) ?? []), n]);
    }
    // the open headings' copies, each with what it takes in after its own children; the caret goes to
    // the end of the pasted text, before what is taken in
    let caret: OutlinePlanNode | undefined;
    const graft = (copied: OutlinePlanNode, depth: number): OutlinePlanNode => {
      const kids = copied.children;
      const deeper = depth + 1 < open.length ? graft(kids[kids.length - 1] as OutlinePlanNode, depth + 1) : null;
      const grafted: OutlinePlanNode = { ...copied, children: [...(deeper ? [...kids.slice(0, -1), deeper] : kids), ...(under.get(depth) ?? [])] };
      if (depth === open.length - 1) {
        caret = grafted;
        for (let k = kids; k.length; k = caret.children) caret = k[k.length - 1] as OutlinePlanNode;
      }
      return grafted;
    };
    nodes[nodes.length - 1] = graft(nodes[nodes.length - 1]!, 0);
    return { nodes, into: [], restyle: [], taken, caret, ...(!inside && (at !== node || asChildren) && { after: at }) };
  }
  const markerOf = (item: OutlineNode, text: OutlineState): string => text.text.slice(text.markerFrom(item.block), text.markerTo(item.block));
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
  // in a list a paragraph owns no list: a pasted paragraph's list is items after it, at its level
  // (`pasteStructuredParagraphList: siblings`), or its item's children (`children`)
  const siblingList = doc.config.pasteStructuredParagraphList === 'siblings';
  const listed = siblingList ? roots.flatMap((root) => (root.kind === 'paragraph' ? [root, ...root.children] : [root])) : roots;
  const pastedItems = listed.filter((root) => root.kind === 'item');
  const oneOrderedList = pastedItems.length === listed.length && pastedItems.every((root) => ordered(markerOf(root, fragment))) && new Set(pastedItems.map((root) => root.block.parent)).size === 1;
  const form = doc.config.pasteStructuredListForm;
  // a list's first items set its form: a single pasted ordered list keeps its own
  const keepForm = form === 'text' && startsList && oneOrderedList;
  let next = reference && ordered(destMarker) ? (asChildren || empty ? numberOf(destMarker) : numberOf(destMarker) + 1) : 1;
  const numbered = (): string => `${next++}${delimiter(destMarker)}`;
  const nodes: OutlinePlanNode[] = [];
  const into: OutlinePlanNode[] = [];
  // a block after a pasted item goes into it, as its last child (in a tight list, without the blank
  // line before it: it was after the item); one before any, into the item at the caret
  const block = (made: OutlinePlanNode): void => {
    const prev = nodes[nodes.length - 1];
    if (asChildren || (empty && !prev)) nodes.push(made);
    else if (prev?.kind === 'item') {
      const item = tight ? endTight(prev) : prev;
      nodes[nodes.length - 1] = { ...item, children: [...item.children, made] };
    }
    else if (!prev && !empty) into.push(made);
    else nodes.push(made);
  };
  for (const root of listed) {
    if (root.kind === 'heading') {
      // a heading is an item's first block, the rest of its section the item's children; in an item a
      // paragraph owns no list, so the list one owned in the section follows it
      const section = copy(root);
      const children = unownLists(section.children);
      nodes.push({ ...section, children, kind: 'item', blockType: 'heading', marker: ordered(destMarker) ? numbered() : destMarker });
    } else if (root.kind === 'item') {
      const own = markerOf(root, fragment);
      const item = copy(root);
      // the number as content: text, escaped, before the item's text
      const numberAsText = (marker: string): OutlinePlanNode | null => {
        if (root.head?.type !== 'paragraph') return null;
        const itemLines = [`${numberOf(own)}\\${delimiter(own)} ${item.lines![0]!}`, ...item.lines!.slice(1)];
        return { ...item, marker, lines: itemLines, text: normText(itemLines) };
      };
      if (keepForm || (form === 'own' && ordered(own) !== ordered(destMarker))) nodes.push(item);
      else if (ordered(destMarker)) {
        if (form === 'literal' && ordered(own)) {
          const literal = numberAsText(numbered());
          if (!literal) return null;
          nodes.push(literal);
        } else nodes.push({ ...item, marker: ordered(own) ? `${numberOf(own)}${delimiter(destMarker)}` : numbered() });
      } else if (ordered(own) && form !== 'drop') {
        // the number is content: in a bullet list it stays as text, escaped
        const literal = numberAsText(destMarker);
        if (!literal) return null;
        nodes.push(literal);
      } else nodes.push({ ...item, marker: destMarker });
    } else if (root.kind === 'paragraph') {
      const rootLines = fragment.contentOf(root).lines!.map((text) => trimMd(text)).filter((text) => text !== '');
      // each line an item's text: escaped where it would start a block there (`2. y`, a nested list)
      rootLines.forEach((text, k) => {
        const line = ctx.encoder.escape(text, 'start').text;
        nodes.push({ ...OutlinePlan.created('item', normText([line])), lines: [line], marker: ordered(destMarker) ? numbered() : destMarker, children: !siblingList && k === rootLines.length - 1 ? copy(root).children : [] });
      });
    } else if (empty && !nodes.length) {
      // in an empty item's place, a code, math, comment or HTML block is an item's text; anything else isn't
      if (!['code_block', 'math_block', 'comment_block', 'html_block'].includes(root.block.type)) return null;
      // the item's text read as an item's is (its lines trimmed), whatever the block's own indentation
      const block = copy(root);
      nodes.push({ ...block, kind: 'item', text: normText(block.lines ?? []), marker: ordered(destMarker) ? numbered() : destMarker });
    } else block(copy(root));
  }
  // the markers decided here are written as they are
  for (let k = 0; k < nodes.length; k++) if (nodes[k]!.kind === 'item' && nodes[k]!.marker) nodes[k] = { ...nodes[k]!, exactMarker: true };
  // with `literal`, nested lists' numbers are text too
  if (form === 'literal') {
    const bullet = ordered(destMarker) ? doc.config.bullet : destMarker;
    for (const list of [nodes, into]) for (let k = 0; k < list.length; k++) list[k] = { ...list[k]!, children: literalLists(list[k]!.children, bullet) };
  }
  // the items after the paste in the list it starts take its form, numbered on
  const restyle: [OutlineNode, string][] = [];
  if (keepForm && !ordered(destMarker)) {
    let n = numberOf(markerOf(pastedItems[pastedItems.length - 1]!, fragment)) + 1;
    const pastedDelimiter = delimiter(markerOf(pastedItems[0]!, fragment));
    for (let k = at + (empty ? 1 : 0); k < siblings.length && siblings[k]!.kind === 'item'; k++) restyle.push([siblings[k]!, `${n++}${pastedDelimiter}`]);
  }
  return { nodes, into, restyle };
}

/**
 * A quote or a table pasted on an empty item: its first block, the item holding it and no text of its
 * own (`- > q`), written by hand since a new item's lines are its own text. The block's lines go after
 * the marker, the rest at the item's content column, as written.
 */
function pasteFirstBlock(ctx: CommandContext, node: OutlineNode, root: OutlineNode, fragment: OutlineState, source: readonly string[]): Outcome {
  const { doc } = ctx;
  const line = doc.lineAt(ctx.sel.head);
  const prefix = ctx.encoder.itemContinuation(node);
  const eol = ctx.ending(line);
  const blockLines = source.slice(root.startLine, fragment.lastDescendant(root).endLine + 1);
  // one space after the marker, then the block; after an empty task's checkbox, which a block can't
  // follow on its line, the block starts the next, the task's first child
  const start = emptyItemStart(ctx, node, ctx.sel.head, line.to);
  const box = /^\[[ xX]\]/.test(trimMdStart(doc.headLines(node)[0] ?? ''));
  const insert = box
    ? blockLines.map((text) => eol + (text === '' ? '' : prefix + text)).join('')
    : start.lead + blockLines.map((text, k) => (k === 0 ? text : eol + (text === '' ? '' : prefix + text))).join('');
  const from = start.from;
  const caret = from + insert.length;
  const expected = ctx.plan.update(node, (n) => ({ ...n, children: [OutlinePlan.copy(fragment, root), ...n.children] }));
  // the empty item's placeholder (right after its parent's text) goes with it
  const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
  const extra = drop.length ? { drop } : {};
  const to = from === ctx.sel.head ? from : line.to;
  const plan = ctx.caret([{ from, to, insert }], caret, expected, extra);
  // text right after the item would continue the block lazily: then a blank line sets it apart
  const next = doc.lines[line.index + 1];
  if (!next || next.blank) return plan;
  const blank = eol + ctx.encoder.continuation(line.prefix).replace(/[ \t]+$/, '');
  return { ...plan, fallback: () => ctx.caret([{ from, to, insert: insert + blank }], caret, expected, extra) };
}

/**
 * Structured paste in the middle of a paragraph's or an item's text (`pasteStructuredMidText: split`),
 * or at its end (`pasteStructuredAtEnd: join`): the node splits where Enter would split it, and the
 * paste goes in between. Its first text joins the text before the caret, with the nodes it owns: a
 * paragraph's (with `pasteStructuredLines: items` only its first line, the others items) or an
 * item's, its marker being form; a heading, a quote or code joins nothing. The rest of the paste
 * follows, as at the end of the node's text. The text after the caret is a node of its own after the
 * paste: an item, taking the item's children (with `enterMidItem: child` its first child, the item
 * keeping them), or a paragraph, taking the paragraph's list. Without a line break at the
 * clipboard's end it ends the last pasted line instead, where that is text and the node has no
 * children. At the text's end nothing is split off, and the node's children follow the paste (or
 * stay, with `enterMidItem: child`). The caret goes to the start of the text after the caret, or
 * after the pasted text. Null where the paste goes after the node instead: outside a list, a pasted
 * heading would take in the text after the caret; at the text's very start (a checkbox before it
 * aside), or at its end, nothing joining; at its end, a paragraph's list would follow blocks pasted
 * after it; and a pasted ordered list from another number than 1 right under the text, which it
 * couldn't interrupt.
 */
function pasteSplit(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, fragment: OutlineState, source: readonly string[], endsWithBreak: boolean): Outcome | null {
  const { doc } = ctx;
  if (node.kind !== 'item' && fragment.nodes.some((n) => n.kind === 'heading')) return null;
  const roots = fragment.root.children;
  const continuation = (text: string): string => ctx.encoder.escape(text, 'continuation').text;
  const headLines = doc.headLines(node);
  const i = line.index - node.head!.startLine;
  const offset = pos - line.contentFrom;
  const before = [...headLines.slice(0, i), headLines[i]!.slice(0, offset)];
  const afterLines = [trimMdStart(headLines[i]!.slice(offset)), ...headLines.slice(i + 1)];
  // at a line's end inside the text, the rest starts at the next line, not with an empty one, as at Enter's split
  if (afterLines.length > 1 && trimMd(afterLines[0]!) === '') {
    afterLines.shift();
    // a continuation line's leading spaces aren't text: starting a node, they would make it code
    afterLines[0] = trimMdStart(afterLines[0]!);
  }
  const restText = normText(afterLines);
  // the paste's first text, joining the text before the caret
  const first = roots[0]!;
  const firstLines =
    first.kind === 'paragraph'
      ? fragment.contentOf(first).lines!.map((text) => trimMd(text)).filter((text) => text !== '')
      : first.kind === 'item' && first.head?.type === 'paragraph'
        ? fragment.headLines(first).map((text) => trimMd(text))
        : [];
  // a pasted item's number is content, kept as text, but where the item at the caret is ordered too,
  // whose marker is the list's form (`pasteStructuredListForm: text`); always (`literal`); never, its
  // number being the item's form (`drop`, `own`)
  const firstMarker = first.kind === 'item' ? fragment.text.slice(fragment.markerFrom(first.block), fragment.markerTo(first.block)) : '';
  const destMarker = node.kind === 'item' ? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block)) : '';
  const form = doc.config.pasteStructuredListForm;
  const numberKept = form === 'literal' || (form === 'text' && !/^\d/.test(destMarker));
  if (firstLines.length && /^\d/.test(firstMarker) && numberKept) firstLines[0] = `${firstMarker} ${firstLines[0]}`;
  const partial = first.kind === 'paragraph' && doc.config.pasteStructuredLines === 'items' && firstLines.length > 1;
  const joined = partial ? firstLines.slice(0, 1) : firstLines;
  // joining at the start of a line of the text, it starts that line: escaped where it would start a block
  if (joined.length && trimMd(before[before.length - 1]!) === '') joined[0] = ctx.encoder.escape(joined[0]!, before.length === 1 ? 'start' : 'continuation').text;
  // a joined paragraph's list follows with the rest of the paste: in a list a paragraph owns none
  // (`pasteStructuredParagraphList: siblings`); else it is the joined text's
  const ownsItsList = first.kind !== 'paragraph' || doc.config.pasteStructuredParagraphList === 'children';
  const copied = joined.length && !partial && ownsItsList ? first.children.map((child) => OutlinePlan.copy(fragment, child)) : [];
  const joinedChildren: PlanTree[] = form === 'literal' ? literalLists(copied, /^\d/.test(destMarker) || !destMarker ? doc.config.bullet : destMarker) : copied;
  // at the end of the text (`pasteStructuredAtEnd: join`) nothing is split off: where nothing joins,
  // the paste goes after the node, as at `after`
  const atEnd = restText === '';
  if (atEnd && !joined.length) return null;
  // the rest of the paste, as at the end of the node's text
  const restFrom = !joined.length ? 0 : partial ? first.startLine + 1 : !ownsItsList ? first.headEndLine + 1 : fragment.lastDescendant(first).endLine + 1;
  const restSource = source.slice(restFrom).join('\n');
  const childMode = node.kind === 'item' && doc.config.enterMidItem === 'child';
  const tight = node.kind === 'item' && node.block.parent?.tight === true;
  const fitted = trimMd(restSource) === '' ? { nodes: [], into: [], restyle: [] } : fitPaste(ctx, node, OutlineState.parse(restSource, { config: doc.config }), false, childMode, tight);
  if (!fitted) return null;
  // in a section, items right after the paragraph are its list; in a quote or an item a paragraph
  // owns none, and the list the joined text brings follows it
  let placed: OutlinePlanNode[] = tight ? fitted.nodes.map(endTight) : fitted.nodes;
  let owned: OutlinePlanNode[] = [];
  if (node.kind === 'paragraph' && (node.parent!.kind === 'root' || node.parent!.kind === 'heading')) {
    let k = 0;
    while (k < placed.length && placed[k]!.kind === 'item') k++;
    [owned, placed] = [placed.slice(0, k), placed.slice(k)];
  } else if (node.kind === 'paragraph') placed = [...(joinedChildren.splice(0) as OutlinePlanNode[]), ...placed];
  const kept = [...before.slice(0, -1), before[before.length - 1]! + (joined[0] ?? ''), ...joined.slice(1).map(continuation)];
  // where nothing joins, the text before the caret keeps no empty line; at the text's very start
  // there is nothing to split off, and the paste goes after the node
  if (!joined.length) {
    while (kept.length > 1 && trimMd(kept[kept.length - 1]!) === '') kept.pop();
    // the spaces at the split go with neither half, as at Enter's
    kept[kept.length - 1] = trimMdEnd(kept[kept.length - 1]!);
  }
  if (normText(kept).replace(!joined.length ? /^\[[ xX]\]$/ : /^$/, '') === '') return null;
  // ended here, the text before the caret may read as a link reference definition (`[a]: x`): escaped
  const ref = referenceEscape(ctx, node, kept);
  if (ref) kept.splice(0, kept.length, ...ref.lines);
  const ownLines = node.kind === 'item' ? kept.map((text, k) => (k === 0 ? trimMdStart(text) : text)) : kept;
  const pastedChildren: PlanTree[] = [...joinedChildren, ...fitted.into, ...owned, ...(childMode ? placed : [])];
  // the text after the caret: the end of the last pasted line, or a node of its own
  let caret: { node: OutlinePlanNode; line: number; offset: number } | null = null;
  const extendLast = (n: OutlinePlanNode): OutlinePlanNode | null => {
    if (n.children.length) {
      const k = n.children.length - 1;
      const deeper = extendLast(n.children[k] as OutlinePlanNode);
      return deeper && { ...n, children: [...n.children.slice(0, k), deeper] };
    }
    if (!n.lines || !(n.kind === 'paragraph' || (n.kind === 'item' && !n.blockType))) return null;
    const lastLine = n.lines[n.lines.length - 1]!;
    const lines = [...n.lines.slice(0, -1), lastLine + afterLines[0], ...afterLines.slice(1).map(continuation)];
    const extended = { ...n, lines, text: normText(lines) };
    caret = { node: extended, line: n.lines.length - 1, offset: lastLine.length };
    return extended;
  };
  const siblings = childMode ? [] : placed;
  const into = siblings.length ? siblings : pastedChildren;
  if (restText !== '' && !endsWithBreak && !node.children.length && into.length) {
    const extended = extendLast(into[into.length - 1] as OutlinePlanNode);
    if (extended) into[into.length - 1] = extended;
  }
  const marker = node.kind === 'item' ? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block)) : undefined;
  // the text after the caret starts a node: what would read as a block or a link definition there is escaped
  const restLines = [ctx.encoder.escape(afterLines[0]!, 'start', afterLines.slice(1)).text, ...afterLines.slice(1).map(continuation)];
  const restNode: OutlinePlanNode | null =
    restText !== '' && !caret ? { ...OutlinePlan.created(node.kind === 'item' ? 'item' : 'paragraph', normText(restLines)), lines: restLines, ...(marker !== undefined && { marker }), children: childMode ? [] : node.children } : null;
  if (!restNode && !caret) {
    // nothing after the caret: the caret after the pasted text
    let last = (into[into.length - 1] ?? null) as OutlinePlanNode | null;
    while (last?.children.length) last = last.children[last.children.length - 1] as OutlinePlanNode;
    if (last?.lines) caret = { node: last, line: last.lines.length - (closesFence(last.lines) ? 2 : 1), offset: last.lines[last.lines.length - (closesFence(last.lines) ? 2 : 1)]!.length };
  }
  // a paragraph after the paste is set off from it, or it would continue the last pasted line
  if (restNode?.kind === 'paragraph' && !tight) {
    const before = siblings.length ? siblings : pastedChildren;
    if (before.length) before[before.length - 1] = withGap(before[before.length - 1] as OutlinePlanNode);
  }
  let children = childMode ? [...pastedChildren, ...(restNode ? [restNode] : []), ...node.children] : pastedChildren;
  // at the end of the text, the node's children follow the paste, keeping their depth: under the last
  // item pasted after an item, or after the paste in a paragraph's list (blocks pasted after a
  // paragraph would take its list in: the paste goes after the node, as at `after`)
  if (atEnd && !childMode && node.children.length) {
    if (!siblings.length) children = [...pastedChildren, ...node.children];
    else if (node.kind !== 'item') return null;
    else {
      const last = siblings[siblings.length - 1]!;
      const adopted: OutlinePlanNode = { ...last, children: [...last.children, ...node.children] };
      if (caret?.node === last) caret = { ...caret, node: adopted };
      siblings[siblings.length - 1] = adopted;
    }
  }
  // an ordered list from another number than 1 can't interrupt the text above it: the paste goes after the node
  const firstChild = children[0] as OutlinePlanNode | undefined;
  if (firstChild?.kind === 'item' && /^\d+/.test(firstChild.marker ?? '') && parseInt(firstChild.marker!, 10) !== 1) return null;
  // a paragraph's list written apart from it stays so, the paste going first in it
  const apart = atEnd && node.kind === 'paragraph' && node.children[0]?.kind === 'item' && doc.lines.slice(node.headEndLine + 1, node.children[0].startLine).some((l) => l.blank);
  let expected = ctx.plan.update(node, (n) => ({ ...n, text: normText(kept), lines: ownLines, children, ...(apart && { gap: 1 }) }));
  const after = childMode ? [] : [...siblings, ...(restNode ? [restNode] : [])];
  if (after.length) expected = expected.place('after', node, after);
  for (const [item, restyled] of fitted.restyle) expected = expected.update(item, (n) => ({ ...n, marker: restyled, exactMarker: true }));
  // a loose list sets the paste apart; a paragraph needs only the blank line before the text after it
  return ctx.encode(expected, tight || node.kind === 'paragraph' ? {} : { separate: 'around' }, (writtenOutline) => {
    const at = restNode ? writtenOutline.at(restNode, 0, 0) : caret ? writtenOutline.at(caret.node, caret.line, caret.offset) : writtenOutline.map(pos, 1);
    return { anchor: at, head: at };
  });
}
