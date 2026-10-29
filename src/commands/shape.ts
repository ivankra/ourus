// The selection a structural command leaves, where it follows the nodes rather than the text: a
// subtree selection selects the same roots after the change (a duplicate's copies), in the shape it
// was given; a selection from a line's column 0 keeps that end at its line's node. And a structural
// command over roots at several depths (indent, outdent): each run of sibling roots in turn.

import type { OurusDoc, OurusNode } from '../doc/index.ts';
import { composeChanges, type ChangeSpec } from '../text/index.ts';
import { CommandContext, reject, type CommandOutcome } from './context.ts';
import type { OurusSelection } from './types.ts';
import { goneWithTextlessParents, operandsOf, runsOf } from './util.ts';

/** Where a whole-line selection's last end is: the next line's start (the canonical shape), its last line's end, its gap's end, past its gap. */
type End = 'next' | 'eol' | 'gapEnd' | 'afterGap';

/** What a selection is of the nodes, for a change to keep. */
export type SelectionShape =
  /** A subtree selection: its roots, its direction, where its last end is. */
  | { readonly kind: 'subtrees'; readonly ids: readonly number[]; readonly up: boolean; readonly end: End }
  /** Another selection whose start is a line's column 0, at the line of node `id` (the outermost starting there). */
  | { readonly kind: 'line'; readonly id: number; readonly up: boolean };

/** The shape of `selection` in `doc` a change keeps; null where it follows its text (a caret, text, a start past column 0). */
export function shapeOf(doc: OurusDoc, selection: OurusSelection): SelectionShape | null {
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  if (from === to) return null;
  const up = selection.head < selection.anchor;
  const roots = doc.selectedNodes(selection);
  if (roots) {
    const last = roots[roots.length - 1]!;
    const end: End = to === lineAfter(doc, last.endLine) ? 'next' : to === doc.mdTree.ends[last.endLine] ? 'eol' : to === doc.mdTree.ends[doc.coverEnd(last)] ? 'gapEnd' : to === lineAfter(doc, doc.coverEnd(last)) ? 'afterGap' : 'next';
    return { kind: 'subtrees', ids: roots.map((n) => n.id), up, end };
  }
  const line = doc.lineAt(from);
  const at = doc.locate(from);
  const owner = from === line.from && at.zone !== 'text' && at.zone !== 'frame' ? doc.rowOwner(line.index) : null;
  return owner ? { kind: 'line', id: owner.id, up } : null;
}

/**
 * `outcome`, applied, with the selection `shape` says: the roots (`map`ped, a duplicate's to their
 * copies) selected as whole lines with their last end where it was; a column-0 start at its node's
 * line. As it is where it didn't apply, where a node went (removed or joined), or where the view hides
 * one (the commands keep their results out of folds).
 */
export function reshaped(outcome: CommandOutcome, shape: SelectionShape | null, map: (id: number) => number | undefined = (id) => id): CommandOutcome {
  if (!shape || outcome?.status !== 'applied') return outcome;
  const doc = outcome.doc;
  const sel = outcome.selection;
  if (shape.kind === 'line') {
    const node = doc.node(shape.id);
    if (!node) return outcome;
    const from = doc.mdTree.starts[node.startLine]!;
    const to = Math.max(sel.anchor, sel.head);
    if (to <= from) return outcome;
    return { ...outcome, selection: shape.up ? { anchor: to, head: from } : { anchor: from, head: to } };
  }
  const nodes: OurusNode[] = [];
  for (const id of shape.ids) {
    const mapped = map(id);
    const node = mapped === undefined ? undefined : doc.node(mapped);
    if (!node || doc.isHidden(node)) return outcome;
    nodes.push(node);
  }
  const canonical = doc.selectionOf(nodes.map((n) => n.id));
  const roots = doc.selectedNodes(canonical);
  if (!roots) return outcome;
  const last = roots[roots.length - 1]!;
  const from = canonical.anchor;
  const to = shape.end === 'eol' ? doc.mdTree.ends[last.endLine]! : shape.end === 'gapEnd' ? doc.mdTree.ends[doc.coverEnd(last)]! : shape.end === 'afterGap' ? lineAfter(doc, doc.coverEnd(last)) : canonical.head;
  // (a shape the change can't keep, an empty last line's end at its start: the canonical one)
  const kept = to > from && doc.selectedNodes({ anchor: from, head: to }) ? to : canonical.head;
  return { ...outcome, selection: shape.up ? { anchor: kept, head: from } : { anchor: from, head: kept } };
}

/** The start of the line after line `line`, or the document's end. */
function lineAfter(doc: OurusDoc, line: number): number {
  return line + 1 < doc.lineCount ? doc.mdTree.starts[line + 1]! : doc.text.length;
}

/**
 * `act` (indent, outdent) over the selection's roots where they are more than one run of siblings
 * (roots at several depths, a forest), as `mixedDepths` says: `each`, each run in turn, in document
 * order, as the command given that run's ids, on the document the runs before it left, one edit, all
 * or nothing (the first refusal, the whole's); `level`, the roots lined up after the first as its
 * siblings, one run, then the command on that run (Logseq DB's, Tine's); `refuse`, refused
 * (`non-contiguous`). Refused (`non-contiguous`) too where the roots are no longer one range after,
 * which one selection can't hold (`outdent: logical` leaves a later sibling between them). Undefined
 * for one run or none, or with `nodes` given: the command's own.
 */
export function mixedDepthsRun(ctx: CommandContext, act: (ctx: CommandContext) => CommandOutcome): CommandOutcome | undefined {
  if (ctx.nodes) return undefined;
  const roots = operandsOf(ctx);
  if (!Array.isArray(roots)) return undefined;
  const runs = runsOf(roots);
  if (runs.length < 2) return undefined;
  const mode = ctx.config.mixedDepths;
  if (mode === 'refuse') return reject('non-contiguous', 'roots at several depths (`mixedDepths: refuse`)');
  const ids = roots.map((n) => n.id);
  let doc = ctx.doc;
  let selection = ctx.selection;
  let changes: readonly ChangeSpec[] = [];
  const then = (outcome: CommandOutcome): CommandOutcome | true => {
    if (outcome?.status !== 'applied') return outcome;
    changes = composeChanges(ctx.doc.text, changes, outcome.changes);
    [doc, selection] = [outcome.doc, outcome.selection];
    return true;
  };
  if (mode === 'level') {
    // the others after the first, as its siblings: one run, which the command then takes. Of one
    // kind, as a run is; and none the whole of a container with no text of its own (`> - q`'s item),
    // which taken out alone would leave it holding nothing
    const [first, ...rest] = roots;
    if (roots.some((n) => n.kind !== first!.kind)) return reject('mixed-kinds');
    if (rest.some((n) => goneWithTextlessParents(ctx.doc, [n])[0] !== n)) return reject('not-expressible', "a root is all of a container with no text, which can't be left empty");
    const levelled = then(ctx.apply(ctx.draft().remove(rest).place('after', first!, rest)));
    if (levelled !== true) return levelled;
    const acted = then(act(new CommandContext(doc, selection, ids)));
    if (acted !== true) return acted;
  } else {
    for (const run of runs) {
      const acted = then(act(new CommandContext(doc, selection, run.map((n) => n.id))));
      if (acted !== true) return acted;
    }
  }
  // the same nodes, one range still: nothing else between them
  if (ids.some((id) => !doc.node(id))) return reject('non-contiguous', 'a root went');
  const after = doc.selectedNodes(doc.selectionOf(ids))?.map((n) => n.id) ?? [];
  if (after.join() !== [...ids].sort((a, b) => doc.node(a)!.startLine - doc.node(b)!.startLine).join()) return reject('non-contiguous', 'the nodes are no longer one range');
  return { status: 'applied', doc, changes, selection };
}
