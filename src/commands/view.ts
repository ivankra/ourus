// The view's commands: fold, unfold or toggle the nodes at the selection, zoom
// into one, zoom out. Each changes the snapshot's view only, never its text: an applied result with
// no changes, whose selection is moved out of what the view now hides.

import type { OurusNode } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import type { CommandContext } from './context.ts';
import { selectionRoots } from './util.ts';
import type { OurusResult } from './types.ts';
import { OurusRejected, OurusSuccess } from './types.ts';

/** The nodes a view command means: `nodes` given, else the selection's roots, each as its row's fold (the outermost node starting on its line). */
function targets(ctx: CommandContext): OurusNode[] {
  if (ctx.nodes) return ctx.nodes.map((id) => ctx.doc.node(id)).filter((n): n is OurusNode => !!n && n.kind !== 'root');
  return selectionRoots(ctx.view, ctx.selection).map((n) => ctx.doc.rowOwner(n.startLine) ?? n);
}

/** The zoom root and its ancestors, whose folds a zoom suppresses. */
function suppressed(view: OurusView): Set<number> {
  const root = view.zoomRoot;
  return new Set(root ? [root, ...root.ancestors()].filter((p) => p.kind !== 'root').map((p) => p.id) : []);
}

/** Fold the nodes at the selection, or `nodes`; a node that doesn't fold is left alone. */
export function foldCommand(ctx: CommandContext): OurusResult | null {
  return setFolds(ctx, true);
}

/** Unfold the nodes at the selection, or `nodes`. */
export function unfoldCommand(ctx: CommandContext): OurusResult | null {
  return setFolds(ctx, false);
}

/**
 * Toggle the folds of the nodes at the selection, or `nodes`: unfolded where any of them is folded
 * within the zoom, else folded; at a node that doesn't fold, its parent's (true-outliner's, from a
 * leaf).
 */
export function toggleFoldCommand(ctx: CommandContext): OurusResult | null {
  return setFolds(ctx, undefined);
}

/**
 * The nodes at the selection, or `nodes`, folded (`fold: true`), unfolded (`false`) or toggled
 * (undefined). While zoomed, the root's and its ancestors' folds are left alone (they hide nothing
 * and are kept for the zoom out).
 */
function setFolds(ctx: CommandContext, fold: boolean | undefined): OurusResult | null {
  const view = ctx.view;
  const kept = suppressed(view);
  const foldable = (n: OurusNode | null): n is OurusNode => !!n && n.foldable && !kept.has(n.id);
  let nodes = targets(ctx);
  if (fold === undefined) nodes = nodes.map((n) => (n.foldable ? n : n.parent!)).filter((n) => n.kind !== 'root');
  nodes = nodes.filter(foldable);
  const on = fold ?? !nodes.some((n) => view.zoomFolded.has(n.id));
  const folded = new Set(view.folded);
  for (const n of nodes) {
    if (on) folded.add(n.id);
    else folded.delete(n.id);
  }
  return viewed(ctx, view.withFolded(folded));
}

/** Zoom into node `nodes[0]` (a click on its mark), else the selection's first root in document order, whichever way it was drawn. */
export function zoomInCommand(ctx: CommandContext): OurusResult | null {
  const target = ctx.nodes ? ctx.doc.node(ctx.nodes[0] ?? -1) : selectionRoots(ctx.view, ctx.selection)[0];
  if (!target || target.kind === 'root') return new OurusRejected('no-such-node', 'no node to zoom into');
  return viewed(ctx, ctx.view.withZoom(target.id));
}

/** Zoom out one level, to the root's parent, or out of the zoom from a top-level root. Not zoomed, applied with no change. */
export function zoomOutCommand(ctx: CommandContext): OurusResult | null {
  const view = ctx.view;
  const parent = view.zoomRoot?.parent;
  if (!parent) return viewed(ctx, view);
  return viewed(ctx, view.withZoom(parent.kind === 'root' ? null : parent.id));
}

/** Zoom out of the zoom, whatever its depth. Not zoomed, applied with no change. */
export function clearZoomCommand(ctx: CommandContext): OurusResult | null {
  return viewed(ctx, ctx.view.withZoom(null));
}

/** `view`, the new view, applied with no changes, the selection out of what it hides. */
function viewed(ctx: CommandContext, view: OurusView): OurusResult | null {
  return new OurusSuccess({ view, changes: [], selection: view.visibleSelection(ctx.selection) });
}

/** `outcome` with the nodes `ids` folded too, where it applied (a split's or a copy's fold, the writer's own). */
export function withFolds(outcome: OurusResult | null, ids: readonly number[]): OurusResult | null {
  if (!(outcome instanceof OurusSuccess) || !ids.length) return outcome;
  return new OurusSuccess({ ...outcome, view: outcome.view.withFolded([...outcome.view.folded, ...ids]) });
}
