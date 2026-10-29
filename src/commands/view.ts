// The view's commands: fold, unfold or toggle the nodes at the selection, zoom
// into one, zoom out. Each changes the snapshot's view only, never its text: an applied result with
// no changes, whose selection is moved out of what the view now hides.

import type { OurusDoc, OutlineNode } from '../doc/index.ts';
import type { CommandContext, CommandOutcome } from './context.ts';
import type { TextSelection } from './types.ts';
import { selectionRoots } from './util.ts';

/** The nodes a view command means: `nodes` given, else the selection's roots, each as its row's fold (the outermost node starting on its line). */
function targets(ctx: CommandContext): OutlineNode[] {
  if (ctx.nodes) return ctx.nodes.map((id) => ctx.doc.node(id)).filter((n): n is OutlineNode => !!n && n.kind !== 'root');
  return selectionRoots(ctx.doc, ctx.selection).map((n) => ctx.doc.rowOwner(n.startLine) ?? n);
}

/** The zoom root and its ancestors, whose folds a zoom suppresses. */
function suppressed(doc: OurusDoc): Set<number> {
  const ids = new Set<number>();
  for (let p: OutlineNode | null = doc.zoom === null ? null : (doc.node(doc.zoom) ?? null); p && p.kind !== 'root'; p = p.parent) ids.add(p.id);
  return ids;
}

/** Fold the nodes at the selection, or `nodes`; a node that doesn't fold is left alone. */
export function foldCommand(ctx: CommandContext): CommandOutcome {
  return setFolds(ctx, true);
}

/** Unfold the nodes at the selection, or `nodes`. */
export function unfoldCommand(ctx: CommandContext): CommandOutcome {
  return setFolds(ctx, false);
}

/**
 * Toggle the folds of the nodes at the selection, or `nodes`: unfolded where any of them is folded
 * within the zoom, else folded; at a node that doesn't fold, its parent's (true-outliner's, from a
 * leaf).
 */
export function toggleFoldCommand(ctx: CommandContext): CommandOutcome {
  return setFolds(ctx, undefined);
}

/**
 * The nodes at the selection, or `nodes`, folded (`fold: true`), unfolded (`false`) or toggled
 * (undefined). While zoomed, the root's and its ancestors' folds are left alone (they hide nothing
 * and are kept for the zoom out).
 */
function setFolds(ctx: CommandContext, fold: boolean | undefined): CommandOutcome {
  const doc = ctx.doc;
  const kept = suppressed(doc);
  const foldable = (n: OutlineNode | null): n is OutlineNode => !!n && n.kind !== 'root' && !!doc.foldRange(n) && !kept.has(n.id);
  let nodes = targets(ctx);
  if (fold === undefined) nodes = nodes.map((n) => (doc.foldRange(n) ? n : n.parent!)).filter((n) => n.kind !== 'root');
  nodes = nodes.filter(foldable);
  const on = fold ?? !nodes.some((n) => doc.zoomFolded.has(n.id));
  const folded = new Set(doc.folded);
  for (const n of nodes) {
    if (on) folded.add(n.id);
    else folded.delete(n.id);
  }
  return viewed(ctx, doc.withFolded(folded));
}

/** Zoom into node `nodes[0]` (a click on its mark), else the selection's first root in document order, whichever way it was drawn. */
export function zoomInCommand(ctx: CommandContext): CommandOutcome {
  const target = ctx.nodes ? ctx.doc.node(ctx.nodes[0] ?? -1) : selectionRoots(ctx.doc, ctx.selection)[0];
  if (!target || target.kind === 'root') return { status: 'rejected', reason: 'no-such-node', detail: 'no node to zoom into' };
  return viewed(ctx, ctx.doc.withZoom(target.id));
}

/** Zoom out one level, to the root's parent, or out of the zoom from a top-level root. Not zoomed, applied with no change. */
export function zoomOutCommand(ctx: CommandContext): CommandOutcome {
  const doc = ctx.doc;
  if (doc.zoom === null) return viewed(ctx, doc);
  const parent = doc.node(doc.zoom)?.parent;
  return viewed(ctx, doc.withZoom(!parent || parent.kind === 'root' ? null : parent.id));
}

/** Zoom out of the zoom, whatever its depth. Not zoomed, applied with no change. */
export function clearZoomCommand(ctx: CommandContext): CommandOutcome {
  return viewed(ctx, ctx.doc.withZoom(null));
}

/** `doc`, the snapshot with its new view, applied with no changes, the selection out of what it hides. */
function viewed(ctx: CommandContext, doc: OurusDoc): CommandOutcome {
  return { status: 'applied', doc, changes: [], selection: visibleSelection(doc, ctx.selection) };
}

/**
 * `selection` moved out of what the view hides: an end in a fold's hidden lines to the fold's start
 * (the end of the folded node's text), but a non-empty selection's end at the fold's end where that
 * is the document's (a subtree selection of the folded node there, which has no line after it); an
 * end outside the zoom into it, before it to its root's text start, after it to its end.
 */
export function visibleSelection(doc: OurusDoc, selection: TextSelection): TextSelection {
  const empty = selection.anchor === selection.head;
  const at = (pos: number): number => {
    const zoom = doc.zoomRange();
    if (zoom) {
      const root = doc.node(doc.zoom!)!;
      if (pos < zoom.from) pos = doc.textStart(root.startLine);
      else if (pos > zoom.to) pos = zoom.to;
    }
    // the outermost fold hiding it, nested folds inside one another
    let start = pos;
    for (const id of doc.zoomFolded) {
      const range = doc.foldRange(doc.node(id)!);
      if (range && pos > range.from && pos <= range.to && range.from < start && (empty || pos !== range.to || pos !== doc.text.length)) start = range.from;
    }
    return start;
  };
  const anchor = at(selection.anchor);
  const head = at(selection.head);
  return anchor === selection.anchor && head === selection.head ? selection : { anchor, head };
}

/** `outcome` with the nodes `ids` folded too, where it applied (a split's or a copy's fold, the writer's own). */
export function withFolds(outcome: CommandOutcome, ids: readonly number[]): CommandOutcome {
  if (outcome?.status !== 'applied' || !ids.length) return outcome;
  return { ...outcome, doc: outcome.doc.withFolded([...outcome.doc.folded, ...ids]) };
}
