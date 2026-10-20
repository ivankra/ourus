// The encoder: an outline plan written as changes to the current text.
//
// An outline plan is what a command wants the outline to be. Nodes it doesn't touch are the old
// outline's own nodes, by reference; nodes on the path from the root to an edit are copied, and so
// are nodes the edit creates. The encoder turns it into text changes, and verification checks that
// the new text reads as it.
//
// The text is the preamble (the lines above the first node), then one unit per node in document
// order: the node's own lines, then its trailing gap (the blank lines after them). The encoder lays
// the units out in the plan's order, with:
// - each old node's lines shifted where it lands at another column (a new parent, or a slot written
//   at another column), its subtree along with it;
// - a new node's lines, and an old node's rewritten ones, written with the prefix of where they are;
// - list markers adopted: an item joining a list takes its bullet, and an ordered item its number;
// - the blank lines between units chosen by the rules of `spec/gaps.md`: a node's gap travels with
//   it, the gap that ends a scope stays at its end, and nodes arriving from elsewhere take the
//   separation of the place they land in. A seam the edit made gets a blank line where the text
//   needs one, and new text where the command asks (`separate`).
// The changes leave every line that keeps its order where it is (the heaviest run of them), so a
// move is written as a move.

import { OutlineState, type OutlineNode } from '../outline/index.ts';
import type { OutlinePlan, OutlinePlanNode } from './outline-plan.ts';
import type { PrefixPiece } from '../parser/index.ts';
import { advanceColumns, applyChanges, diffText, dominantEnding, mapPos, type ChangeSpec } from '../text.ts';
import { place, shift, type Placed } from './layout.ts';
import { blankBetween, rerendered, writeLines } from './lines.ts';
import { seam, unitsOf, type Units } from './seams.ts';
import { changesOf, type OutputLine } from './changes.ts';
import { reindent, usesTabs } from './indent.ts';
import { childIndent, continuation, itemContinuation, markerText, siblingPrefix } from './prefix.ts';
import { escape, interruptsParagraph, startOfNode } from './escapes.ts';
import { renumber } from './renumber.ts';

/** The leading whitespace of a paragraph's line `lineNo` after its containers' prefix, where it is four columns or more; else null. */
function paragraphIndent(doc: OutlineState, lineNo: number): { from: number; to: number } | null {
  const line = doc.lines[lineNo]!;
  const from = line.prefix.length ? line.prefix[line.prefix.length - 1]!.to : line.from;
  let to = from;
  while (to < line.to && (doc.text.charCodeAt(to) === 32 || doc.text.charCodeAt(to) === 9)) to++;
  const column = advanceColumns(doc.text, line.from, from, 0);
  return advanceColumns(doc.text, from, to, column) - column >= 4 ? { from, to } : null;
}

/** One way of writing a plan: the changes, and where things land. A candidate, until the command runner verifies it. */
export interface EncodeResult {
  readonly changes: ChangeSpec[];
  /** A position of the old text in the new one: text the encoder kept follows its line. */
  map(pos: number, assoc?: -1 | 1): number;
  /** Where offset `offset` of own line `line` of `node` (a planned node with `lines`) now is. */
  at(node: OutlinePlanNode, line: number, offset: number): number;
  /** Every old node's id, by where it now starts (see `OutlineState.apply`'s `identity`). */
  readonly identity: Map<number, number>;
  /** How many seams the edit made could take a blank line they don't have (see `pad`). */
  readonly candidates: number;
  /** Those of them within new text, which has no blank line there of its own. */
  readonly within: ReadonlySet<number>;
}

export interface EncodeOptions {
  /**
   * Outside a list, set new text off by a blank line from the text after it, or on both sides
   * (`around`), where it has none.
   */
  readonly separate?: 'after' | 'around';
  /** The seams the edit made that get a blank line, by their index among the candidates, or all. */
  readonly pad?: ReadonlySet<number> | 'all';
}

/** Whether `next` is an empty item (children or not), the first child of item or paragraph `parent` (its list). */
function emptyFirstChild(doc: OutlineState, parent: Placed, next: Placed | null): boolean {
  if (!next || next.parent !== parent || (parent.kind !== 'item' && parent.kind !== 'paragraph') || next.kind !== 'item') return false;
  const old = next.node ?? next.was;
  const text = next.edited?.text ?? (old ? doc.nodeText(old) : null);
  return text !== null && OutlineState.isEmptyText(text);
}

/**
 * An old item whose first block shares its marker's line (`- > q`, `- - a`) has no line of its own:
 * its marker goes on the first line written in it, wherever its first block now is, and off the line
 * that had it, where that line is now another in the item. Returns why it can't, or null.
 */
function moveSharedMarkers(doc: OutlineState, order: readonly Placed[], units: Units, out: OutputLine[], firstLine: ReadonlyMap<Placed, number>): string | null {
  const rewrite = (index: number, text: string): void => {
    const output = out[index]!;
    if (output.origin === null) out[index] = { ...output, text };
    else {
      const line = doc.lines[output.origin]!;
      out[index] = { ...output, text, local: diffText(doc.text.slice(line.from, line.to), text) };
    }
  };
  // where column `column` starts in `text`, or null where a tab spans it
  const offsetAt = (text: string, column: number): number | null => {
    let col = 0;
    let i = 0;
    while (col < column && i < text.length) col = advanceColumns(text, i, ++i, col);
    return col === column ? i : null;
  };
  for (let at = 0; at < order.length; at++) {
    const placed = order[at]!;
    const node = placed.node;
    if (placed.kind !== 'item' || !node || placed.lines || units.own.has(node)) continue;
    // the item's lines: its descendants', in order
    let first: number | null = null;
    let last = -1;
    for (let i = at + 1; i < order.length; i++) {
      let inside = false;
      for (let up = order[i]!.parent; up && !inside; up = up.parent) inside = up === placed;
      if (!inside) break;
      const start = firstLine.get(order[i]!)!;
      const next = i + 1 < order.length ? firstLine.get(order[i + 1]!)! : out.length;
      if (next > start) {
        first ??= start;
        last = next - 1;
      }
    }
    if (first === null) continue;
    const had = out.findIndex((output) => output.origin === node.startLine);
    if (had === first) continue;
    const marker = placed.marker ?? doc.text.slice(doc.markerFrom(node.block), doc.markerTo(node.block));
    // the marker on the item's first line, in the whitespace that indents it to the item's content
    const text = out[first]!.text;
    const from = offsetAt(text, placed.markerColumn);
    if (from === null || !/^ +$/.test(text.slice(from, from + marker.length + 1))) return `item ${node.id}'s marker has no place on its first line`;
    rewrite(first, text.slice(0, from) + marker + text.slice(from + marker.length));
    // and off the line that had it, now another line of the item: spaces as wide
    if (had > first && had <= last) {
      const old = doc.lines[node.startLine]!;
      const output = out[had]!;
      const markerAt = mapPos(output.local, doc.markerFrom(node.block) - old.from, 1);
      if (output.text.slice(markerAt, markerAt + marker.length) !== marker) return `item ${node.id}'s marker isn't where it was`;
      rewrite(had, output.text.slice(0, markerAt) + ' '.repeat(marker.length) + output.text.slice(markerAt + marker.length));
    }
  }
  return null;
}

/**
 * Writes outline plans of one document as changes to its text, and the pieces hand-written edits
 * need: prefixes, markers, renumbering. Cheap to make: what laying out a plan needs (the units, the
 * tab style, the line ending) is computed the first time it is needed, and kept for the next plan.
 */
export class OutlineEncoder {
  readonly state: OutlineState;
  #units: Units | undefined;
  #tabs: boolean | undefined;
  #eol: string | undefined;
  #ordered: boolean | undefined;

  constructor(state: OutlineState) {
    this.state = state;
  }

  /** `plan`, a plan of this document, as changes to its text; a string says why it can't be written. */
  encode(plan: OutlinePlan, options: EncodeOptions = {}): EncodeResult | string {
    const doc = this.state;
    // what the plan means, read as the text will read it
    const edited = plan.withOwnedLists().root;
    const root = place(doc, edited, null);
    if (typeof root === 'string') return root;
    const tabs = this.tabs;
    const failure = shift(doc, root, tabs);
    if (failure) return failure;

    const order: Placed[] = [];
    const visit = (placed: Placed): void => {
      if (placed.kind !== 'root') order.push(placed);
      placed.children.forEach(visit);
    };
    visit(root);

    const units = this.units;
    const lines = doc.lines;
    const eol = this.eol;
    const out: OutputLine[] = [];
    const emitted = new Set<number>();
    const emitGap = (gap: readonly number[], weight: number, blank: string | null = null): void => {
      for (const lineNo of gap) {
        const line = lines[lineNo]!;
        const old = doc.text.slice(line.from, line.to);
        // a blank line keeps its quotes' markers only while it sits in the same quotes, at the same
        // columns (a quote in an item that moved has its `>` where the item's lines have it now)
        const quotes = (text: string): string => {
          const columns: number[] = [];
          let column = 0;
          for (const c of text) {
            if (c === '>') columns.push(column);
            column = c === '\t' ? column + 4 - (column % 4) : column + 1;
          }
          return columns.join(',');
        };
        const text = blank !== null && quotes(old) !== quotes(blank) ? blank : old;
        // a gap line written twice (a separation copied) is new text the second time
        out.push({ origin: emitted.has(lineNo) ? null : lineNo, text, ending: line.ending, local: diffText(old, text), weight });
        emitted.add(lineNo);
      }
    };
    const blankLine = (text = ''): OutputLine => ({ origin: null, text, ending: eol, local: [], weight: 0 });
    emitGap(units.preamble, 2);
    // in Obsidian a `---` on the first line, with a `---` line below, opens the frontmatter: a thematic
    // break that comes first is set off by a blank line above it (below, once the lines are written)
    const head = order[0];
    const headOld = head && (head.node ?? head.was);
    const breakFirst = out.length === 0 && doc.config.flavor === 'obsidian' && head?.kind === 'atom' && headOld?.block.type === 'thematic_break';
    let candidates = 0;
    const within = new Set<number>();
    // the first line each node writes of its own
    const firstLine = new Map<Placed, number>();
    for (let i = 0; i < order.length; i++) {
      const placed = order[i]!;
      const weight = placed.arrived ? 1 : 2;
      const own = placed.node ? units.own.get(placed.node) : null;
      firstLine.set(placed, out.length);
      if (placed.lines) {
        // a node made anew in an old one's place (another kind) keeps its lines' endings
        const was = !placed.node && placed.was ? (units.own.get(placed.was) ?? null) : null;
        const written = writeLines(doc, placed, own ?? null, tabs, was);
        written.forEach((line) => {
          placed.output.push({ index: out.length, prefix: line.prefix });
          out.push({ origin: line.origin, text: line.text, ending: line.ending || eol, local: line.local, weight });
          if (line.origin !== null) emitted.add(line.origin);
        });
      } else if (own && placed.rerender) {
        for (let lineNo = own.first; lineNo <= own.last; lineNo++) {
          const line = lines[lineNo]!;
          const text = rerendered(doc, placed, lineNo, tabs);
          out.push({ origin: lineNo, text, ending: line.ending, local: diffText(doc.text.slice(line.from, line.to), text), weight });
          emitted.add(lineNo);
        }
      } else if (own) {
        for (let lineNo = own.first; lineNo <= own.last; lineNo++) {
          const line = lines[lineNo]!;
          const local: ChangeSpec[] = [];
          const change = reindent(doc, lineNo, placed.base, placed.owner, placed.delta, tabs);
          if (change === 'fail') return `the lines of ${placed.kind} ${placed.node!.id} can't move ${placed.delta} columns`;
          if (change) local.push({ from: change.from - line.from, to: change.to - line.from, insert: change.insert });
          else if (lineNo === own.first && placed.kind === 'paragraph' && out[out.length - 1]?.origin !== lineNo - 1) {
            // a paragraph's indentation isn't its text: where it lands after other text than before, a
            // first line indented four columns or more (the rest of a paragraph a definition was taken
            // from) would read as code, and loses it
            const indent = paragraphIndent(doc, lineNo);
            if (indent) local.push({ from: indent.from - line.from, to: indent.to - line.from, insert: '' });
          }
          if (placed.marker !== null && lineNo === placed.node!.startLine) {
            local.push({ from: doc.markerFrom(placed.node!.block) - line.from, to: doc.markerTo(placed.node!.block) - line.from, insert: placed.marker });
          }
          out.push({ origin: lineNo, text: applyChanges(doc.text.slice(line.from, line.to), local), ending: line.ending, local, weight });
          emitted.add(lineNo);
        }
      } else continue;
      const nextUnit = order.slice(i + 1).find((later) => later.lines || (later.node && units.own.has(later.node))) ?? null;
      const gap = seam(units, placed, nextUnit && order[i + 1]!, nextUnit);
      // the blank line's text, only where a blank line is written
      let blankText: string | null = null;
      const blank = (): string => (blankText ??= blankBetween(placed, order[i + 1] ?? null, tabs));
      emitGap(gap.lines, weight, gap.lines.length ? blank() : null);
      for (let count = 0; count < gap.blanks; count++) out.push(blankLine(blank()));
      // an empty item right under its parent's text (an item's, a paragraph's) reads as a setext underline: a blank line may
      // set it apart, as when the caret leaves one (`spec/placeholders.md`)
      const underline = emptyFirstChild(doc, placed, order[i + 1] ?? null);
      const apart = gap.separable || underline;
      if (!apart || gap.blanks > 0 || gap.lines.some((lineNo) => lines[lineNo]!.blank)) continue;
      if (gap.separable && (gap.fresh === 'after' ? options.separate : gap.fresh === 'before' && options.separate === 'around')) {
        out.push(blankLine(blank()));
        continue;
      }
      const candidate = candidates++;
      if (gap.within && !underline) within.add(candidate);
      if (options.pad === 'all' || options.pad?.has(candidate)) out.push(blankLine(blank()));
    }
    if (out.length === 0) return 'nothing to write';
    const moved = moveSharedMarkers(doc, order, units, out, firstLine);
    if (moved) return moved;
    if (breakFirst && /^---[ \t]*$/.test(out[0]!.text) && out.slice(1).some((output) => /^---[ \t]*$/.test(output.text))) {
      out.unshift(blankLine());
      for (const placed of order) for (const entry of placed.output) entry.index++;
    }
    // every line but the last ends in a line break; the last ends as the old text did
    const lastEnding = lines.length ? lines[lines.length - 1]!.ending : '';
    for (const output of out) if (output.ending === '') output.ending = eol;
    out[out.length - 1]!.ending = lastEnding;

    const changes = changesOf(doc, out);
    // where each written line now starts
    const starts: number[] = [];
    const byOrigin = new Map<number, number>();
    let at = 0;
    out.forEach((output, index) => {
      starts.push(at);
      if (output.origin !== null) byOrigin.set(output.origin, index);
      at += output.text.length + output.ending.length;
    });
    const map = (pos: number, assoc: -1 | 1 = -1): number => {
      const line = doc.lineAt(pos);
      const index = byOrigin.get(line.index);
      if (index === undefined || pos > line.to + line.ending.length) return mapPos(changes, pos, assoc);
      const output = out[index]!;
      if (pos > line.to) return starts[index]! + output.text.length + Math.min(pos - line.to, output.ending.length);
      return starts[index]! + mapPos(output.local, pos - line.from, assoc);
    };
    const atContent = (node: OutlinePlanNode, line: number, offset: number): number => {
      // the node, or a copy of it (regrouped by `withOwnedLists`), which keeps its lines
      const placed = order.find((candidate) => candidate.edited === node || (!!node.lines && candidate.edited?.lines === node.lines));
      const entry = placed?.output[line];
      if (!entry) throw new Error(`no line ${line} written for that node`);
      return starts[entry.index]! + entry.prefix + offset;
    };
    const identity = new Map<number, number>();
    // a head's start maps past indentation written before it, but not past an item's marker rewritten there
    const newText = applyChanges(doc.text, changes);
    const headAt = (placed: Placed, pos: number): number => {
      const [before, after] = [map(pos, -1), map(pos, 1)];
      return placed.marker === null || /^[ \t]*$/.test(newText.slice(before, after)) ? after : before;
    };
    for (const placed of order) if (placed.node) identity.set(headAt(placed, doc.headStart(placed.node)), placed.node.id);
    return { changes, map, at: atContent, identity, candidates, within };
  }

  /**
   * The changes that renumber the ordered lists `changes` (a plan's) add, remove or reorder, in the
   * coordinates of their result, or null when nothing needs renumbering. `params` read the new text
   * as the command will: moved nodes' ids, and placeholders.
   */
  renumber(changes: readonly ChangeSpec[], plan: OutlinePlan, params: { identity?: ReadonlyMap<number, number>; placeholders: readonly number[] }): ChangeSpec[] | null {
    return renumber(this.state, changes, plan, params, this.hasOrderedItems);
  }

  /** The text that starts a new line at `node`'s level, up to its marker: outer prefixes plus indentation. */
  siblingPrefix(node: OutlineNode): string {
    return siblingPrefix(this.state, node);
  }

  /** The text before a child block's first character: the containers' prefixes, then its indentation. */
  childIndent(node: OutlineNode, child: OutlineNode): string {
    return childIndent(this.state, node, child);
  }

  /** The prefix a new line in these containers starts with: a quote's `>` as written, an item's indentation as spaces. */
  continuation(pieces: readonly PrefixPiece[]): string {
    return continuation(this.state, pieces);
  }

  /** The prefix of a continuation line of an item's text: its sibling prefix, then spaces to its content column. */
  itemContinuation(node: OutlineNode): string {
    return itemContinuation(this.state, node);
  }

  /** An item's marker as written, or (`next`) the marker of the item after it. */
  markerText(node: OutlineNode, next: boolean): string {
    return markerText(this.state, node, next);
  }

  /**
   * `text` escaped where it would not read as text at a line's start, and where the backslash went
   * (null when it needs none): after an ordered marker's digits, else at its start. `start`: it starts
   * a node's text, where any block start or list marker would take it; `continuation`: it continues a
   * paragraph. With `below`, the lines after it: also where they'd read as a reference definition.
   */
  escape(text: string, where: 'start' | 'continuation', below?: readonly string[]): { text: string; at: number | null } {
    return escape(this.state.syntaxTree.flavor, text, where, below);
  }

  /** How text written at the start of a new node reads: a list marker it becomes (`marker`), or a block start it needs escaping from. */
  startOfNode(text: string, below: readonly string[]): { escape: boolean; marker: number } {
    return startOfNode(this.state.syntaxTree.flavor, text, below);
  }

  /** Whether `text`, on the line after paragraph text, starts a block of its own rather than continuing it. */
  interruptsParagraph(text: string): boolean {
    return interruptsParagraph(this.state.syntaxTree.flavor, text);
  }

  private get units(): Units {
    return (this.#units ??= unitsOf(this.state));
  }

  private get tabs(): boolean {
    return (this.#tabs ??= usesTabs(this.state));
  }

  /** Whether the document has an ordered list item: without one, and none written, nothing needs renumbering. */
  private get hasOrderedItems(): boolean {
    return (this.#ordered ??= this.state.nodes.some((node) => node.kind === 'item' && node.block.list?.type === 'ordered'));
  }

  private get eol(): string {
    return (this.#eol ??= dominantEnding(this.state.text));
  }
}
