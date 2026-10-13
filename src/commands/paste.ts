// Paste: structured (Markdown pasted as nodes) and plain (text pasted into the node).

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { LineInfo } from '../parser/index.ts';
import { advanceColumns, dropColumns, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode } from '../encoder/index.ts';
import { CommandContext, isCodeLine, isEmptyItem, normText } from './context.ts';
import { notApplicable, reject, withPlan, type Outcome } from './plan.ts';
import { codeEdit } from './code.ts';

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
  // on an empty item, the text is its text: its first line escaped where it would start a block
  if (node && isEmptyItem(ctx, node) && from >= doc.markerTo(node.block) && from === to) {
    const prefix = ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!);
    const eol = ctx.ending(line);
    const textLines = lines.map((text, k) => (k === 0 ? ctx.encoder.escape(text.trim(), 'start') : ctx.encoder.escape(text.trimStart(), 'continuation')).text);
    // the space after the marker, if the line ends without one
    const lead = doc.text.slice(doc.markerTo(node.block), line.to) === '' ? ' ' : '';
    const insert = lead + textLines.map((text, k) => (k === 0 ? text : eol + prefix + text)).join('');
    const changes = [{ from, to, insert }];
    const caret = from + insert.length;
    const last = textLines[textLines.length - 1]!;
    const placeholders = last.trim() === '' ? [caret] : undefined;
    return ctx.caret(changes, caret, ctx.plan.setText(node, normText(textLines)), { ...(placeholders ? { placeholders } : {}) });
  }
  if (!node?.head || node.head.type !== 'paragraph' || line.index < node.head.startLine || line.index > node.head.endLine) return notApplicable;
  const text = doc.text;
  const prefix =
    node.kind === 'item'
      ? ctx.encoder.siblingPrefix(node) + ' '.repeat(node.block.contentColumn! - node.block.markerColumn!)
      : text.slice(doc.lines[node.head.startLine]!.from, doc.lines[node.head.startLine]!.contentFrom);
  const eol = ctx.ending(line);
  const rest = text.slice(to, line.to);
  // where a line that would interrupt the paragraph takes its escape: its start, or an ordered marker's delimiter
  const escapeAt = (value: string): number | null => ctx.encoder.escape(value, 'continuation').at;
  let insert = lines[0]!;
  const changes: ChangeSpec[] = [];
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
  return ctx.caret(changes, caret, ctx.plan.setText(node, normText(textLines)), { ...(placeholders ? { placeholders } : {}) });
}

/**
 * Structured paste: the clipboard's Markdown as nodes, by the rules of spec/paste.md. Nothing pasted
 * is lost: what can't be structure where it lands stays text. The destination decides form (bullet,
 * columns, spacing), the paste content (text, numbers, checkboxes, its own nesting). A list's first
 * item sets its form. The nodes go where Enter at the end of the node's text would put a new one, or
 * in an empty item's place; what can't be a node there is pasted as plain text. Pasted numbers are
 * never renumbered. One line is inline text, the host's.
 */
export function paste(ctx: CommandContext, payload: string): Outcome {
  const { doc } = ctx;
  if (!ctx.collapsed) return notApplicable;
  const lines = payload.split(/\r\n|\n|\r/);
  while (lines.length && lines[0]!.trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop();
  if (lines.length < 2) return notApplicable;
  const pos = ctx.sel.head;
  const node = doc.nodeAt(pos);
  if (!node) return notApplicable;
  // in code, what is pasted is code
  if (isCodeLine(ctx, doc.lineAt(pos))) return pastePlain(ctx, payload);
  const empty = isEmptyItem(ctx, node) && pos >= doc.markerTo(node.block);
  if (!empty) {
    if (!node.head || (node.kind !== 'item' && node.kind !== 'heading' && node.kind !== 'paragraph')) return notApplicable;
    const range = doc.headRange(node)!;
    const lastText = node.head.type === 'heading' && node.head.setext ? node.head.endLine - 1 : node.head.endLine;
    const line = doc.lineAt(pos);
    // in the middle of the text: the nodes go after it, as at its end (`pasteMidText: after`), or the
    // item splits at the caret (`split`); in a paragraph's or a heading's text, the host's plain insert
    if (!(line.index === lastText && pos >= range.to)) {
      if (node.kind !== 'item' || line.index < node.head.startLine || line.index > lastText || pos < line.contentFrom) return notApplicable;
      if (doc.config.pasteMidText === 'split' && node.head.type === 'paragraph') return pasteSplit(ctx, node, line, pos, lines, /(\r\n|\n|\r)\s*$/.test(payload));
    }
  }

  // the payload, without the indentation all its lines share
  const indentOf = (text: string): number => advanceColumns(text, 0, /^[ \t]*/.exec(text)![0].length, 0);
  const common = Math.min(...lines.filter((text) => text.trim() !== '').map(indentOf));
  const fragment = OutlineState.parse(lines.map((text) => (text.trim() === '' ? '' : dropColumns(text, common))).join('\n'), { config: doc.config });
  // the nodes go in an empty item's place, else as the first children of a heading or of an item with
  // children, else right after the node
  // a list pasted at the end of a paragraph that owns one goes first in it, as Enter there puts a new
  // node right after the paragraph's text
  const ownsList = node.kind === 'paragraph' && node.children[0]?.kind === 'item' && fragment.root.children.every((root) => root.kind === 'item');
  const asChildren = !empty && (node.kind === 'heading' || (node.kind === 'item' && node.children.length > 0) || ownsList);
  const fitted = fitPaste(ctx, node, fragment, empty, asChildren);
  // what can't be a node where it lands is pasted as text
  if (!fitted) return pastePlain(ctx, payload);
  let expected = empty
    ? ctx.plan.place('instead', node, fitted.nodes)
    : asChildren
      ? ctx.plan.append(node, 'first', fitted.nodes)
      : ctx.plan.place('after', node, fitted.nodes);
  for (const [item, marker] of fitted.restyle) {
    expected = expected.update(item, (n) => ({ ...n, marker, exactMarker: true }));
  }
  // the caret goes to the end of the pasted text
  let last = fitted.nodes[fitted.nodes.length - 1]!;
  while (last.children.length) last = last.children[last.children.length - 1] as OutlinePlanNode;
  const lastLine = last.lines!.length - 1;
  // pasted nodes are set off from what they land between; items going first in a paragraph's list
  // keep the paragraph's spacing from its list (a blank line between them, or none)
  const listApart = ownsList && doc.lines.slice(node.headEndLine + 1, node.children[0]!.startLine).some((line) => line.blank);
  const separate = empty || (ownsList && !listApart) ? {} : { separate: 'around' as const };
  const plan = ctx.encode(expected, separate, (writtenOutline) => {
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
function fitPaste(ctx: CommandContext, node: OutlineNode, fragment: OutlineState, empty: boolean, asChildren: boolean): { nodes: OutlinePlanNode[]; restyle: [OutlineNode, string][] } | null {
  const { doc } = ctx;
  const roots = fragment.root.children;
  if (fragment.nodes.some((n) => n.kind === 'heading')) return null;
  const copy = (root: OutlineNode): OutlinePlanNode => OutlinePlan.copy(fragment, root);
  // outside a list (a paragraph's own list aside), the nodes go in as they are
  if (node.kind !== 'item' && !(node.kind === 'paragraph' && asChildren)) return { nodes: roots.map(copy), restyle: [] };
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
      const rootLines = fragment.contentOf(root).lines!.map((text) => text.trim()).filter((text) => text !== '');
      rootLines.forEach((text, k) => nodes.push({ ...OutlinePlan.created('item', normText([text])), lines: [text], marker: ordered(destMarker) ? numbered() : destMarker, children: k === rootLines.length - 1 ? copy(root).children : [] }));
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

/**
 * Structured paste in the middle of an item's text with `pasteMidText: split`: the item splits at the
 * caret, the first line joining the text before it and each further line an item of its own, after
 * it (its first children, if it has children). The text after the caret is an item of its own when
 * the clipboard ends with a line break, else the end of the last line. Lines are text: one that would
 * start a block is escaped. The caret goes to the end of the last pasted line.
 */
function pasteSplit(ctx: CommandContext, node: OutlineNode, line: LineInfo, pos: number, lines: readonly string[], endsWithBreak: boolean): Outcome {
  const { doc } = ctx;
  const escaped = (text: string): string => ctx.encoder.escape(text, 'start').text;
  const pasted = lines.map((text) => text.trim());
  const headLines = doc.headLines(node);
  const i = line.index - node.head!.startLine;
  const offset = pos - line.contentFrom;
  const before = [...headLines.slice(0, i), headLines[i]!.slice(0, offset).trimStart() + pasted[0]];
  const after = [headLines[i]!.slice(offset), ...headLines.slice(i + 1)];
  const restText = normText(after);
  const marker = doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
  const item = (text: string): OutlinePlanNode => ({ ...OutlinePlan.created('item', normText([text])), lines: [text], marker });
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
  const kept = ctx.plan.update(node, (n) => ({ ...n, text: normText(before), lines: before.map((text, k) => (k === 0 ? text.trimStart() : text)) }));
  const expected = node.children.some((child) => child.kind === 'item') ? kept.append(node, 'first', fresh) : kept.place('after', node, fresh);
  return ctx.encode(expected, {}, (writtenOutline) => {
    const caret = writtenOutline.at(caretItem, 0, lastText.length);
    return { anchor: caret, head: caret };
  });
}
