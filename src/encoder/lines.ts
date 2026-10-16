// New and rewritten lines, and the prefixes of where they are: quotes' `>` and items' indentation.

import type { OutlineState } from '../outline/index.ts';
import { diffText, type ChangeSpec } from '../text.ts';
import type { Placed } from './layout.ts';
import { whitespace } from './indent.ts';

/** A line written from content: an old line it replaces (if any), its text, and where its content starts. */
interface ContentLine {
  readonly origin: number | null;
  readonly text: string;
  readonly ending: string;
  readonly local: readonly ChangeSpec[];
  readonly prefix: number;
}

/** A node's lines written from its `lines`, with the prefix of where it is. */
export function writeLines(doc: OutlineState, placed: Placed, own: { first: number; last: number } | null, tabs: boolean): ContentLine[] {
  const content = placed.lines!;
  let first: string;
  let rest: string;
  if (placed.node && own) {
    // an old node keeps its prefixes: its first line's, and its second's (or its content column)
    const firstLine = doc.lines[own.first]!;
    first = doc.text.slice(firstLine.from, firstLine.contentFrom);
    if (placed.marker !== null) {
      const block = placed.node.block;
      first = first.slice(0, doc.markerFrom(block) - firstLine.from) + placed.marker + first.slice(doc.markerTo(block) - firstLine.from);
    }
    const secondLine = own.last > own.first ? doc.lines[own.first + 1]! : null;
    rest = secondLine && !secondLine.blank ? doc.text.slice(secondLine.from, secondLine.contentFrom) : linePrefix(holdsOwnLines(placed) ? placed : placed.parent, tabs);
  } else if (placed.kind === 'item') {
    const within = prefixWithin(placed.parent, tabs);
    first = within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + placed.marker + ' ';
    rest = linePrefix(placed, tabs);
  } else {
    // a quote's own lines (a callout's title) are inside it, after its `>`
    first = rest = linePrefix(holdsOwnLines(placed) ? placed : placed.parent, tabs);
  }
  return content.map((text, i) => {
    const prefix = i === 0 ? first : rest;
    // an empty line keeps only its quotes' markers
    const line = i === 0 || text !== '' ? prefix + text : prefix.trimEnd();
    const oldNo = own && own.first + i <= own.last ? own.first + i : null;
    if (oldNo === null) return { origin: null, text: line, ending: '', local: [], prefix: prefix.length };
    const old = doc.lines[oldNo]!;
    return { origin: oldNo, text: line, ending: old.ending, local: diffText(doc.text.slice(old.from, old.to), line), prefix: prefix.length };
  });
}

/** Line `lineNo` of `placed` (an old node), its prefix rendered from where it now is, its content kept. */
export function rerendered(doc: OutlineState, placed: Placed, lineNo: number, tabs: boolean): string {
  const line = doc.lines[lineNo]!;
  const content = doc.text.slice(line.contentFrom, line.to);
  // a lazy continuation stays lazy, as it was written
  if (line.lazy) return content;
  const node = placed.node!;
  if (node.kind === 'item' && lineNo === node.startLine) {
    // the marker line: indentation to the marker, the marker, and its padding as written
    const piece = line.prefix.find((candidate) => candidate.block === node.block);
    const within = prefixWithin(placed.parent, tabs);
    const marker = placed.marker ?? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
    const padding = piece ? doc.text.slice(doc.markerTo(node.block), piece.to) : ' ';
    return within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + marker + padding + content;
  }
  const prefix = linePrefix(holdsOwnLines(placed) ? placed : placed.parent, tabs);
  return content === '' ? prefix.trimEnd() : prefix + content;
}

/** Whether a node's own lines are inside it, in its prefix: an item's (after its marker), a quote's (a callout's title). */
const holdsOwnLines = (placed: Placed): boolean => placed.kind === 'item' || placed.kind === 'quote';

/**
 * The prefix of a line inside `container`: up to and including the last enclosing quote's `> `
 * (`text`, ending at `column`), and the column the container's content starts at, which the
 * caller indents to, so that items' indentation is one run of whitespace.
 */
function prefixWithin(container: Placed | null, tabs: boolean): { text: string; column: number; content: number } {
  const chain: Placed[] = [];
  for (let at = container; at; at = at.parent) if (at.kind === 'item' || at.kind === 'quote') chain.unshift(at);
  let text = '';
  let column = 0;
  let content = 0;
  for (const at of chain) {
    if (at.kind === 'quote') {
      text += whitespace(column, Math.max(column, at.markerColumn), tabs) + '> ';
      column = content = Math.max(column, at.markerColumn) + 2;
    } else content = Math.max(content, at.contentColumn);
  }
  return { text, column, content };
}

/** The whole prefix of a content line inside `container`. */
function linePrefix(container: Placed | null, tabs: boolean): string {
  const within = prefixWithin(container, tabs);
  return within.text + whitespace(within.column, within.content, tabs);
}

/** A blank line between two nodes: the `>` of every quote that holds both. */
export function blankBetween(before: Placed, after: Placed | null, tabs: boolean): string {
  if (!after) return '';
  const holding = new Set<Placed>();
  for (let at: Placed | null = before; at; at = at.parent) holding.add(at);
  let common: Placed | null = after.parent;
  while (common && !holding.has(common)) common = common.parent;
  return linePrefix(common, tabs).trimEnd();
}
