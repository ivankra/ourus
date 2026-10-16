// Paste: structured (Markdown pasted as nodes) and plain (text pasted into the node).

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { advanceColumns, dropColumns, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree } from '../encoder/index.ts';
import { CommandContext, isCodeLine, isEmptyItem, normText } from './context.ts';
import { notApplicable, reject, withPlan, type Outcome } from './plan.ts';
import { codeEdit } from './code.ts';

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
  // on a code line, the lines are code as they are, each in the containers the block is in
  if (node && isCodeLine(ctx, line)) {
    // a pasted line that is a fence would close the block
    const block = line.leaf!;
    if (lines.some((text) => new RegExp(`^ {0,3}\\${block.fenceChar}{${block.fenceLength},}\\s*$`).test(text))) return reject('not-expressible', 'a pasted fence would close the code block');
    const prefix = ctx.encoder.continuation(line.prefix);
    const eol = ctx.ending(line);
    const insert = lines.join(eol + prefix);
    return codeEdit(ctx, node, [{ from, to, insert }], from + insert.length);
  }
  if (node?.kind === 'heading') return reject('not-expressible', 'a heading is a single line');
  // before a node's text on its first line (a callout's `[!type]`), the lines would go into its markup
  if (node && line.index === node.startLine && from < doc.textStart(from) && !isEmptyItem(ctx, node)) return reject('not-expressible', 'the caret is in markup');
  // on an empty item, the text is its text: its first line escaped where it would start a block
  if (node && isEmptyItem(ctx, node) && from >= doc.markerTo(node.block) && from === to) {
    const prefix = ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!);
    const eol = ctx.ending(line);
    // a blank line before the last is a paragraph break (null), the line after it a paragraph's start
    const parts = lines.map((text, k) => (k > 0 && k < lines.length - 1 && text.trim() === '' ? null : text));
    const textLines = parts.map((text, k) => (text === null ? null : ctx.encoder.escape(k === 0 ? text.trim() : text.trimStart(), k === 0 || parts[k - 1] === null ? 'start' : 'continuation').text));
    // the space after the marker, if the line ends without one
    const lead = doc.text.slice(doc.markerTo(node.block), line.to) === '' ? ' ' : '';
    const insert = lead + textLines.map((text, k) => (k === 0 ? text : text === null ? eol + prefix.trimEnd() : eol + prefix + text)).join('');
    const changes = [{ from, to, insert }];
    const caret = from + insert.length;
    const last = textLines[textLines.length - 1]!;
    const placeholders = last.trim() === '' ? [caret] : undefined;
    const expected = paragraphsPlan(ctx, node, paragraphsOf(textLines));
    const extra = placeholders ? { placeholders } : {};
    const plan = ctx.caret(changes, caret, expected, extra);
    // text right after the item would continue its new text lazily: then a blank line sets it apart
    const next = doc.lines[line.index + 1];
    if (!next || next.blank) return plan;
    const blank = eol + ctx.encoder.continuation(line.prefix).replace(/[ \t]+$/, '');
    return { ...plan, fallback: () => ctx.caret([{ from, to, insert: insert + blank }], caret, expected, extra) };
  }
  if (!node?.head || node.head.type !== 'paragraph' || line.index < node.head.startLine || line.index > node.head.endLine) return notApplicable;
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = ctx.ending(line);
  const rest = text.slice(to, line.to);
  let insert = lines[0]!;
  const changes: ChangeSpec[] = [];
  // the lines after the first as written; a blank one before the last is a paragraph break (null)
  const written: (string | null)[] = [];
  let restWritten = rest;
  let opens = false;
  for (let i = 1; i < lines.length; i++) {
    const own = lines[i]!.trimStart();
    // the last line runs into the rest of the line, which then starts it
    const last = i === lines.length - 1;
    if (own === '' && !last) {
      insert += eol + prefix.trimEnd();
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
  return ctx.caret(changes, caret, paragraphsPlan(ctx, node, paragraphsOf(textLines)), { ...(placeholders ? { placeholders } : {}) });
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
 * there (`pasteStructuredMidText: split`), or the paste goes after it (`after`).
 */
export function paste(ctx: CommandContext, payload: string): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const lines = payload.split(/\r\n|\n|\r/);
  while (lines.length && lines[0]!.trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop();
  if (lines.length === 0) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  // in code, what is pasted is code
  if (isCodeLine(ctx, doc.lineAt(pos))) return pastePlain(ctx, payload);
  // the payload, without the indentation all its lines share
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  const common = Math.min(...lines.filter((text) => text.trim() !== '').map(indentOf));
  const source = lines.map((text) => (text.trim() === '' ? '' : dropColumns(text, common)));
  const fragment = OutlineState.parse(source.join('\n'), { config: doc.config });
  const roots = fragment.root.children;
  // one line of plain text is inline text, the host's; one that is an item, a heading or a quote is nodes
  if (lines.length < 2 && !(roots.length === 1 && (roots[0]!.kind === 'item' || roots[0]!.kind === 'heading' || roots[0]!.kind === 'quote'))) return notApplicable;
  // at the end of a block that isn't text (after code's closing fence, a table's last row), the paste
  // goes right after it, where Enter puts a new node; elsewhere in it, the host's
  const atBlockEnd = node.kind === 'atom';
  if (atBlockEnd && pos !== doc.lines[node.block.endLine]!.to) return notApplicable;
  // plain lines (paragraphs only) are text, as plain paste puts them, where the node holds lines
  if (doc.config.pasteStructuredLines === 'text' && node.kind !== 'heading' && !atBlockEnd && roots.every((root) => root.kind === 'paragraph' && !root.children.length)) return pastePlain(ctx, payload);
  const empty = isEmptyItem(ctx, node) && pos >= doc.markerTo(node.block);
  if (!empty && !atBlockEnd) {
    if (!node.head || (node.kind !== 'item' && node.kind !== 'heading' && node.kind !== 'paragraph')) return notApplicable;
    const range = doc.headRange(node)!;
    const lastText = node.head.type === 'heading' && node.head.setext ? node.head.endLine - 1 : node.head.endLine;
    const line = doc.lineAt(pos);
    // in the middle of a paragraph's or an item's text: the node splits there (`split`), or the paste
    // goes after it, as at its end (`after`); in a heading's title, the host's plain insert
    if (!(line.index === lastText && pos >= range.to)) {
      if (node.kind === 'heading' || line.index < node.head.startLine || line.index > lastText || pos < line.contentFrom) return notApplicable;
      // in the middle of the text one line is inline text, the host's, whatever it would be at the end
      if (lines.length < 2) return notApplicable;
      if (doc.config.pasteStructuredMidText === 'split' && node.head.type === 'paragraph') {
        const split = pasteSplit(ctx, node, line, pos, fragment, source, /(\r\n|\n|\r)\s*$/.test(payload));
        if (split) return split;
      }
    }
  }

  // a quote or a table pasted on an empty item is its first block: the item has no text of its own
  if (empty && roots.length === 1 && (roots[0]!.kind === 'quote' || roots[0]!.block.type === 'table')) return pasteFirstBlock(ctx, node, roots[0]!, fragment, source);
  // the nodes go in an empty item's place, else as the first children of a heading or of an item with
  // children, else right after the node
  // a list pasted at the end of a paragraph that owns one goes first in it, as Enter there puts a new
  // node right after the paragraph's text
  const ownsList = node.kind === 'paragraph' && node.children[0]?.kind === 'item' && fragment.root.children.every((root) => root.kind === 'item');
  const asChildren = !empty && (node.kind === 'heading' || (node.kind === 'item' && node.children.length > 0) || ownsList);
  // the list the paste lands in: the children's of an item that has them, else the item's own
  const destList = asChildren && node.kind === 'item' && node.children[0]?.kind === 'item' ? node.children[0].block.parent : node.kind === 'item' ? node.block.parent : null;
  // a tight list takes the pasted nodes tight, whatever their spacing in the clipboard (rule 2): the
  // blank lines after each of them go (a blank line is still written where Markdown needs one)
  const tight = destList?.tight === true;
  const fitted0 = fitPaste(ctx, node, fragment, empty, asChildren, tight);
  // what can't be a node where it lands is pasted as text
  if (!fitted0) return pastePlain(ctx, payload);
  const fitted = tight ? { ...fitted0, nodes: fitted0.nodes.map(endTight), into: fitted0.into.map(endTight) } : fitted0;
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
          ? base.append(node, 'first', fitted.nodes)
          : base.place('after', node, fitted.nodes);
  // blocks that would end the list go into the item at the caret, after its text
  if (fitted.into.length) expected = expected.append(node, 'first', fitted.into);
  for (const [item, marker] of fitted.restyle) {
    expected = expected.update(item, (n) => ({ ...n, marker, exactMarker: true }));
  }
  // the caret goes to the end of the pasted text; after code, to the end of its last line, not after
  // the closing fence, where typing would unmake it
  let last = fitted.caret ?? (fitted.nodes.length ? fitted.nodes : fitted.into)[(fitted.nodes.length ? fitted.nodes : fitted.into).length - 1]!;
  if (!fitted.caret) while (last.children.length) last = last.children[last.children.length - 1] as OutlinePlanNode;
  const lastLine = last.lines!.length - (closesFence(last.lines!) ? 2 : 1);
  // pasted nodes are set off from what they land between; items going first in a paragraph's list
  // keep the paragraph's spacing from its list (a blank line between them, or none)
  const listApart = ownsList && doc.lines.slice(node.headEndLine + 1, node.children[0]!.startLine).some((line) => line.blank);
  // in a list, the list's spacing: a tight one takes the paste tight (a blank line is still written
  // where Markdown needs one), a loose one sets it apart
  const separate = empty || (ownsList && !listApart) || tight ? {} : { separate: 'around' as const };
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

/** `n` without the blank lines after it: its last descendant's gap gone. */
const endTight = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), endTight(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 0 });

/** `n` with a blank line after it: its last descendant's gap one. */
const withGap = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), withGap(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 1 });

/**
 * The pasted fragment's top-level nodes as they land at `node` (`after` a section the paste closes), or
 * null where one can't be a node there (a heading outside a list that would take in what follows it;
 * a block in an empty item's place that can't be its first block),
 * to be pasted as text instead. Into a list, the pasted items take the list's form: its bullet, or its
 * numbering, starting from the item before. A pasted ordered item in a bullet list keeps its number
 * as text (`- 1\. x`), and a pasted number in an ordered list is kept as written. Pasted as a list's
 * first items, a single ordered list keeps its form, and the items after it are numbered on
 * (`restyle`). Plain lines are items, one each, and a heading is an item, its section with it. A block
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
    const sections = asChildren || node.parent!.kind === 'root' || node.parent!.kind === 'heading';
    const nodes = roots.flatMap((root) => (sections || root.kind !== 'paragraph' || !root.children.length ? [copy(root)] : [{ ...copy(root), children: [] }, ...root.children.map(copy)]));
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
  const pastedItems = roots.filter((root) => root.kind === 'item');
  const oneOrderedList = pastedItems.length === roots.length && pastedItems.every((root) => ordered(markerOf(root, fragment))) && new Set(pastedItems.map((root) => root.block.parent)).size === 1;
  // a list's first items set its form: a single pasted ordered list keeps its own
  const keepForm = startsList && oneOrderedList;
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
  for (const root of roots) {
    if (root.kind === 'heading') {
      // a heading is an item's first block, the rest of its section the item's children
      nodes.push({ ...copy(root), kind: 'item', blockType: 'heading', marker: ordered(destMarker) ? numbered() : destMarker });
    } else if (root.kind === 'item') {
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
      const rootLines = fragment.contentOf(root).lines!.map((text) => text.trim()).filter((text) => text !== '');
      rootLines.forEach((text, k) => nodes.push({ ...OutlinePlan.created('item', normText([text])), lines: [text], marker: ordered(destMarker) ? numbered() : destMarker, children: k === rootLines.length - 1 ? copy(root).children : [] }));
    } else if (empty && !nodes.length) {
      // in an empty item's place, a code, math, comment or HTML block is an item's text; anything else isn't
      if (!['code_block', 'math_block', 'comment_block', 'html_block'].includes(root.block.type)) return null;
      nodes.push({ ...copy(root), kind: 'item', marker: ordered(destMarker) ? numbered() : destMarker });
    } else block(copy(root));
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
  const prefix = ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!);
  const eol = ctx.ending(line);
  const blockLines = source.slice(root.startLine, fragment.lastDescendant(root).endLine + 1);
  // the space after the marker, if the line ends without one
  const lead = doc.text.slice(doc.markerTo(node.block), line.to) === '' ? ' ' : '';
  const insert = lead + blockLines.map((text, k) => (k === 0 ? text : eol + (text === '' ? '' : prefix + text))).join('');
  const from = ctx.sel.head;
  const caret = from + insert.length;
  const expected = ctx.plan.update(node, (n) => ({ ...n, children: [OutlinePlan.copy(fragment, root), ...n.children] }));
  // the empty item's placeholder (right after its parent's text) goes with it
  const drop = doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine);
  const extra = drop.length ? { drop } : {};
  const plan = ctx.caret([{ from, to: from, insert }], caret, expected, extra);
  // text right after the item would continue the block lazily: then a blank line sets it apart
  const next = doc.lines[line.index + 1];
  if (!next || next.blank) return plan;
  const blank = eol + ctx.encoder.continuation(line.prefix).replace(/[ \t]+$/, '');
  return { ...plan, fallback: () => ctx.caret([{ from, to: from, insert: insert + blank }], caret, expected, extra) };
}

/**
 * Structured paste in the middle of a paragraph's or an item's text (`pasteStructuredMidText: split`):
 * the node splits where Enter would split it, and the paste goes in between. Its first text joins the
 * text before the caret, with the nodes it owns: a paragraph's (with `pasteStructuredLines: items`
 * only its first line, the others items) or an item's, its marker being form; a heading, a quote or
 * code joins nothing. The rest of the paste follows, as at the end of the node's text. The text after
 * the caret is a node of its own after the paste: an item, taking the item's children (with
 * `enterMidItem: child` its first child, the item keeping them), or a paragraph, taking the
 * paragraph's list. Without a line break at the clipboard's end it ends the last pasted line instead,
 * where that is text and the node has no children. The caret goes to the start of the text after the
 * caret, or after the pasted text. Null where the paste goes after the node instead: outside a list,
 * a pasted heading would take in the text after the caret; at the text's very start (a checkbox
 * before it aside) nothing joining, there is nothing to split off; and a pasted ordered list from
 * another number than 1 right under the text, which it couldn't interrupt.
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
  const afterLines = [headLines[i]!.slice(offset).trimStart(), ...headLines.slice(i + 1)];
  const restText = normText(afterLines);
  // the paste's first text, joining the text before the caret
  const first = roots[0]!;
  const firstLines =
    first.kind === 'paragraph'
      ? fragment.contentOf(first).lines!.map((text) => text.trim()).filter((text) => text !== '')
      : first.kind === 'item' && first.head?.type === 'paragraph'
        ? fragment.headLines(first).map((text) => text.trim())
        : [];
  const partial = first.kind === 'paragraph' && doc.config.pasteStructuredLines === 'items' && firstLines.length > 1;
  const joined = partial ? firstLines.slice(0, 1) : firstLines;
  const joinedChildren: PlanTree[] = joined.length && !partial ? first.children.map((child) => OutlinePlan.copy(fragment, child)) : [];
  // the rest of the paste, as at the end of the node's text
  const restFrom = !joined.length ? 0 : partial ? first.startLine + 1 : fragment.lastDescendant(first).endLine + 1;
  const restSource = source.slice(restFrom).join('\n');
  const childMode = node.kind === 'item' && doc.config.enterMidItem === 'child';
  const tight = node.kind === 'item' && node.block.parent?.tight === true;
  const fitted = restSource.trim() === '' ? { nodes: [], into: [], restyle: [] } : fitPaste(ctx, node, OutlineState.parse(restSource, { config: doc.config }), false, childMode, tight);
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
  if (!joined.length) while (kept.length > 1 && kept[kept.length - 1]!.trim() === '') kept.pop();
  if (normText(kept).replace(!joined.length ? /^\[[ xX]\]$/ : /^$/, '') === '') return null;
  const ownLines = node.kind === 'item' ? kept.map((text, k) => (k === 0 ? text.trimStart() : text)) : kept;
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
  const children = childMode ? [...pastedChildren, ...(restNode ? [restNode] : []), ...node.children] : pastedChildren;
  // an ordered list from another number than 1 can't interrupt the text above it: the paste goes after the node
  const firstChild = children[0] as OutlinePlanNode | undefined;
  if (firstChild?.kind === 'item' && /^\d+/.test(firstChild.marker ?? '') && parseInt(firstChild.marker!, 10) !== 1) return null;
  let expected = ctx.plan.update(node, (n) => ({ ...n, text: normText(kept), lines: ownLines, children }));
  const after = childMode ? [] : [...siblings, ...(restNode ? [restNode] : [])];
  if (after.length) expected = expected.place('after', node, after);
  for (const [item, restyled] of fitted.restyle) expected = expected.update(item, (n) => ({ ...n, marker: restyled, exactMarker: true }));
  // a loose list sets the paste apart; a paragraph needs only the blank line before the text after it
  return ctx.encode(expected, tight || node.kind === 'paragraph' ? {} : { separate: 'around' }, (writtenOutline) => {
    const at = restNode ? writtenOutline.at(restNode, 0, 0) : caret ? writtenOutline.at(caret.node, caret.line, caret.offset) : writtenOutline.map(pos, 1);
    return { anchor: at, head: at };
  });
}
