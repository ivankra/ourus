// New and rewritten lines, and the prefixes of where they are: quotes' `>` and items' indentation.

import type { OutlineState } from '../outline/index.ts';
import { advanceColumns, diffText, type ChangeSpec } from '../text.ts';
import type { Placed } from './layout.ts';
import { escape } from './escapes.ts';
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
    // an old item that had no lines of its own (its first block a quote) keeps its marker
    const marker = placed.marker ?? (placed.node ? doc.text.slice(doc.markerFrom(placed.node.block), doc.markerTo(placed.node.block)) : doc.config.bullet);
    first = within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + marker + ' ';
    rest = linePrefix(placed, tabs);
  } else {
    // a quote's own lines (a callout's title) are inside it, after its `>`
    first = rest = linePrefix(holdsOwnLines(placed) ? placed : placed.parent, tabs);
  }
  // a copy's lazy lines are written as they were, without the prefix
  const lazy = placed.edited?.lazy?.lines === content ? new Set(placed.edited.lazy.at) : null;
  return content.map((text, i) => {
    const prefix = i === 0 || !lazy?.has(i) ? (i === 0 ? first : rest) : '';
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
  // a lazy continuation stays lazy, as it was written; out of the containers that kept it text, a
  // line that would start a block (a list item, a table's delimiter row) is escaped
  if (line.lazy) {
    const lead = /^[ \t]*/.exec(content)![0].length;
    // its indentation counts from the items around it that it reaches (none past a quote, whose `>` it
    // lacks): four columns past them, it can start no block
    const chain: Placed[] = [];
    for (let at: Placed | null = placed.kind === 'item' ? placed : placed.parent; at && at.kind !== 'root'; at = at.parent) chain.unshift(at);
    let base = 0;
    for (const at of chain) {
      if (at.kind === 'quote') break;
      if (at.kind === 'item' && advanceColumns(content, 0, lead, 0) >= at.contentColumn) base = at.contentColumn;
    }
    if (advanceColumns(content, 0, lead, 0) - base >= 4) return content;
    const at = escape(doc.syntaxTree.flavor, content.slice(lead), 'continuation').at;
    return at === null ? content : content.slice(0, lead + at) + '\\' + content.slice(lead + at);
  }
  const node = placed.node!;
  if (node.kind === 'item' && lineNo === node.startLine) {
    // the marker line: indentation to the marker, the marker, and its padding as written
    const piece = line.prefix.find((candidate) => candidate.block === node.block);
    // the items whose first line this is too (`- - a`) have their markers on it
    const within = prefixWithin(placed.parent, tabs, { doc, lineNo });
    const marker = placed.marker ?? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
    const padding = piece ? doc.text.slice(doc.markerTo(node.block), piece.to) : ' ';
    return within.text + whitespace(within.column, Math.max(within.column, placed.markerColumn), tabs) + marker + padding + content;
  }
  const prefix = linePrefix(holdsOwnLines(placed) ? placed : placed.parent, tabs, { doc, lineNo });
  return content === '' ? prefix.trimEnd() : prefix + content;
}

/** Whether a node's own lines are inside it, in its prefix: an item's (after its marker), a quote's (a callout's title). */
const holdsOwnLines = (placed: Placed): boolean => placed.kind === 'item' || placed.kind === 'quote';

/**
 * The prefix of a line inside `container`: up to and including the last enclosing quote's `> `
 * (`text`, ending at `column`), and the column the container's content starts at, which the
 * caller indents to, so that items' indentation is one run of whitespace.
 */
function prefixWithin(container: Placed | null, tabs: boolean, on?: { doc: OutlineState; lineNo: number }): { text: string; column: number; content: number } {
  const chain: Placed[] = [];
  for (let at = container; at; at = at.parent) if (at.kind === 'item' || at.kind === 'quote') chain.unshift(at);
  let text = '';
  let column = 0;
  let content = 0;
  for (const at of chain) {
    if (at.kind === 'quote') {
      text += whitespace(column, Math.max(column, at.markerColumn), tabs) + '> ';
      column = content = Math.max(column, at.markerColumn) + 2;
    } else if (on && at.node && at.node.startLine === on.lineNo) {
      // an item whose first line this is, its first block sharing it (`- > q`): its marker is on it
      const marker = at.marker ?? on.doc.text.slice(on.doc.markerFrom(at.node.block), on.doc.markerTo(at.node.block));
      const at0 = Math.max(column, at.markerColumn);
      text += whitespace(column, at0, tabs) + marker;
      column = at0 + marker.length;
      content = Math.max(content, at.contentColumn);
    } else content = Math.max(content, at.contentColumn);
  }
  return { text, column, content };
}

/** The whole prefix of a content line inside `container` (line `on.lineNo`, whose items' markers it carries). */
function linePrefix(container: Placed | null, tabs: boolean, on?: { doc: OutlineState; lineNo: number }): string {
  const within = prefixWithin(container, tabs, on);
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
