// How lines are spelled where the draft and the writer both need to know: an item's marker, the
// indentation a new nesting takes, the prefix a line was written with, blank columns. The draft uses
// them to predict a line's layout, the writer to write it.

import type { MdLine } from '../parser/index.ts';
import { atLine, columnIndex, type ColumnIndex } from '../text/index.ts';
import type { OurusDoc, OurusNode, OurusText } from '../doc/index.ts';
import type { ListPlace } from './normalized.ts';

/** The marker an item at `place` is written with, anew: its bullet, or its number (1 where none is given) and delimiter. */
export function placeMarker(place: ListPlace | undefined): string {
  return place?.type === 'ordered' ? `${place.number ?? 1}${place.marker}` : (place?.marker ?? '-');
}

/**
 * The prefix a later line of `origin`'s text starts with where it was, in the containers of `line`
 * (its first line's, or some of them): a quote's `>` as written (with the space its content starts
 * past), an item's indentation as spaces, or tabs where the line's own indentation has them.
 */
export function continuationAsWas(old: string, origin: OurusNode, line: MdLine): string {
  const own = origin.kind === 'item' ? origin.persistentNode.block : null;
  // a quote that is the node's text keeps its `>` on each line: the prefix stops before it
  const quote = origin.persistentNode.textQuote;
  const cut = quote ? line.prefix.findIndex((p) => p.container.block === quote) : -1;
  if (cut >= 0) line = { ...line, prefix: line.prefix.slice(0, cut), contentFrom: line.prefix[cut]!.from };
  // (up to where the pieces asked for end: a container's own prefix, `inside`)
  const last = line.prefix[line.prefix.length - 1];
  const written = old.slice(line.from, last ? Math.min(last.to, line.contentFrom) : line.contentFrom);
  // with tabs after a quote's `>`, the line's own prefix: its markers as spaces, its `>`s and tabs as written
  // (made up to the item's own content column, where its line ends at its marker: an empty one)
  if (written.includes('\t') && inQuote(line)) {
    let out = written.replace(/[^>\t ]/g, ' ');
    // (a marker right after a `>`, `>>-→`: written as a space there it is the quote's, and the columns
    // after it one short; the whitespace after the `>`s one column wider, with tabs to its stops)
    const at = written.lastIndexOf('>');
    if (at >= 0 && at + 1 < written.length && !/[ \t]/.test(written[at + 1]!)) {
      const quotes = written.slice(0, at + 1);
      out = quotes + whitespace(columns(quotes), columns(out) + 1, true);
    }
    const want = own?.attrs.contentColumn;
    return want !== undefined && columns(out) < want ? out + ' '.repeat(want - columns(out)) : out;
  }
  const tabs = itemTabs(line, old);
  const pieces = line.prefix;
  let out = '';
  let column = 0;
  // a run of indentation, written at once: tabs to its tab stops
  let run = 0;
  const flush = (): void => {
    out += whitespace(column - run, column, tabs);
    run = 0;
  };
  pieces.forEach((p, k) => {
    if (p.container.block.type === 'blockquote') {
      flush();
      const marker = old.slice(p.from, p.to);
      const next = pieces[k + 1];
      const spaced = !!next && next.container.block.type !== 'blockquote' && next.toColumn > next.fromColumn && marker.endsWith('>');
      // (its space a column of a tab it took part of, `>→`: written as the space, its column counted)
      const partial = p.partialTab && marker.endsWith('>');
      out += spaced || partial ? marker + ' ' : marker;
      column = p.toColumn + (spaced && !partial ? 1 : 0);
      return;
    }
    // (a footnote's label: its later lines four columns in, as the definition reads them, B298)
    const width = p.kind === 'footnote' ? 4 : (own && p.container.block === own ? own.attrs.contentColumn! : p.toColumn) - p.fromColumn;
    column += width;
    run += width;
  });
  flush();
  return out;
}

/** The marker `place` gives an item whose marker was `was`: its number as written where it is the one it had (`007.`). */
export function markerOf(place: ListPlace, was: string): string {
  if (place.type === 'bullet') return place.marker;
  return /^\d+/.test(was) && parseInt(was, 10) === place.number && was.endsWith(place.marker) ? was : `${place.number}${place.marker}`;
}

/** Whether `line`'s prefix has a quote's marker. */
function inQuote(line: MdLine): boolean {
  return line.prefix.some((p) => p.container.block.type === 'blockquote');
}

/** Blank columns `[from, to)`: spaces, or tabs to each tab stop and spaces after. */
export function whitespace(from: number, to: number, tabs: boolean): string {
  let out = '';
  let column = from;
  if (tabs) {
    for (let stop = column + 4 - (column % 4); stop <= to; stop += 4) {
      out += '\t';
      column = stop;
    }
  }
  return out + ' '.repeat(Math.max(0, to - column));
}

const units = new WeakMap<OurusDoc, 'tab' | 2 | 4>();
const tabbed = new WeakMap<OurusDoc, boolean>();

/**
 * The unit a new nesting in `doc` takes (`indentUnit`): its config's, or under `detect` the one most of
 * its nested items have, each by its indentation past its parent's marker (a tab in it, `tab`; at both
 * its parent's content column and four past its marker, as under `10. `, or at neither, none; else
 * `2` at the content column, `4` four past the marker); with none, a tab where the document indents
 * with tabs outside code (`tabbedOf`), else `2`, and `2` on a tie.
 */
export function indentUnitOf(doc: OurusDoc): 'tab' | 2 | 4 {
  const set = doc.config.indentUnit;
  if (set !== 'detect') return set;
  let unit = units.get(doc);
  if (unit !== undefined) return unit;
  const votes = { tab: 0, 2: 0, 4: 0 };
  const visit = (node: OurusNode): void => {
    for (const child of node.children) {
      if (child.kind === 'item' && node.kind === 'item' && child.startLine !== node.startLine) {
        const vote = nestingOf(doc, node, child);
        if (vote !== null) votes[vote]++;
      }
      visit(child);
    }
  };
  visit(doc.rootNode);
  const most = Math.max(votes.tab, votes[2], votes[4]);
  const top = (['tab', 2, 4] as const).filter((u) => votes[u] === most);
  unit = most === 0 ? (tabbedOf(doc) ? 'tab' : 2) : top.length > 1 ? 2 : top[0]!;
  units.set(doc, unit);
  return unit;
}

/** How item `child` nests under item `parent`, by its indentation past `parent`'s marker; null for none. */
function nestingOf(doc: OurusDoc, parent: OurusNode, child: OurusNode): 'tab' | 2 | 4 | null {
  const outer = parent.block.attrs;
  const own = child.block.attrs;
  if (outer.markerColumn === undefined || outer.contentColumn === undefined || own.markerColumn === undefined || own.markerStart === undefined) return null;
  // a tab in its indentation past the parent's marker (one that starts before it and reaches past it too)
  const line = doc.mdTree.line(child.startLine);
  let column = 0;
  for (let k: number = line.from; k < atLine(line, own.markerStart); k++) {
    const next = doc.text[k] === '\t' ? column + 4 - (column % 4) : column + 1;
    if (doc.text[k] === '\t' && next > outer.markerColumn) return 'tab';
    column = next;
  }
  const content = own.markerColumn === outer.contentColumn;
  const four = own.markerColumn === outer.markerColumn + 4;
  return content && four ? null : content ? 2 : four ? 4 : null;
}

/** Whether `doc` indents with tabs outside code: the unit `detect` reads where no nested item says one. */
function tabbedOf(doc: OurusDoc): boolean {
  let found = tabbed.get(doc);
  if (found !== undefined) return found;
  found = false;
  for (let i = 0; i < doc.lineCount && !found; i++) {
    const line = doc.mdTree.line(i);
    // (an item's indentation with a tab, a tab it takes part of before code in it too)
    if (itemTabs(line, doc.text)) found = true;
    // (a code block's lines past its fence are its own, as an indented one's all are)
    const leaf = line.leaf;
    if (leaf && CODE.has(leaf.block.type) && (!leaf.block.attrs.fenced || i !== leaf.line)) continue;
    if (/^[ >]*\t/.test(doc.text.slice(line.from, line.to))) found = true;
  }
  tabbed.set(doc, found);
  return found;
}

/** Whether an item's indentation on `line` has a tab: in its prefix, or one it takes part of. */
const itemTabs = (line: MdLine, old: string): boolean =>
  line.prefix.some((p) => p.container.block.type === 'item' && (/^[ \t]*/.exec(old.slice(p.from, p.to))![0].includes('\t') || (p.partialTab && /^[ \t]*$/.test(old.slice(p.from, p.to)))));

/** Blocks of lines whose indentation past their first line is their own. */
const CODE = new Set(['code_block', 'math_block', 'comment_block', 'html_block']);

/** The columns `prefix` spans from column 0, a tab to its next stop. */
export function columns(prefix: string): ColumnIndex {
  let column = 0;
  for (const c of prefix) column = c === '\t' ? column + 4 - (column % 4) : column + 1;
  return columnIndex(column);
}

/** The block-id lines a text carries, as lines: each after its blank lines (empty). */
export function blockIdLinesOf(text: OurusText): string[] {
  const out: string[] = [];
  for (const { blankLines, line } of text.blockIdLines) {
    for (let k = 0; k < blankLines; k++) out.push('');
    out.push(line);
  }
  return out;
}
