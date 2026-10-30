// A drag (spec/drag.md): what a pickup takes, by the cover rule, and every place it can drop it, as
// seams and depths; the place one drop line names; and the host's helper that resolves a pointer to
// one of them. The drop is `moveSubtree` (move-subtree.ts).

import type { OurusDoc, OurusNode } from '../doc/index.ts';
import { CommandContext, reject, type CommandOutcome } from './context.ts';
import { clipboardFragment, clipboardMarkdown, type OurusClipboard } from './clipboard.ts';
import { copyOrCutCommand } from './copy.ts';
import { becomesAt, moveRefused, unholdable } from './move-subtree.ts';
import { pasteRefused, pastedBecomesAt } from './paste.ts';
import type { OurusCommand, OurusCommandResult, DropMap, DropPoint, DropSeam, InsertionPoint } from './types.ts';
import { oneRun, operandsRefused, runsOf, selectionRoots, withTextlessParents } from './util.ts';

/**
 * A pickup: the run (`dragRun`), each root's lines, every seam it can be dropped at with the places
 * there (`seamsOf`), and the run's clipboard, as a copy of its nodes gives it. A drag from outside,
 * carrying a clipboard: every seam of the document as it is, the clipboard's first node deciding what
 * a place can hold, each place's drop a `pasteAt`. The document unchanged.
 */
export function dragCommand(ctx: CommandContext, options: { readonly pressed?: number; readonly clipboard?: OurusClipboard }): CommandOutcome {
  // the view's, the snapshot's: the folds in effect within the zoom, and the node zoomed into
  const zoom = ctx.doc.zoom === null ? null : ctx.doc.node(ctx.doc.zoom)!;
  const folded = ctx.doc.zoomFolded;
  if (options.clipboard) {
    const clipboard = options.clipboard;
    const read = clipboardMarkdown(clipboard);
    const pasted = read ? clipboardFragment(read.markdown, ctx.config)?.doc : undefined;
    const first = pasted?.rootNode.children[0];
    if (!pasted || !first) return reject('not-expressible', 'nothing to paste');
    const converts = (parent: OurusNode, after: OurusNode | null): boolean => pastedBecomesAt(ctx.doc, first.kind, parent, after) !== null;
    const refused = (parent: OurusNode, after: OurusNode | null): boolean => !!pasteRefused(ctx, pasted, parent, after);
    const seams = seamsOf(ctx.doc, [], first.kind, folded, zoom ?? null, (at) => ({ type: 'pasteAt', at, clipboard }), converts, refused);
    return { status: 'applied', doc: ctx.doc, changes: [], selection: ctx.selection, dropMap: { nodes: [], lines: [], seams } };
  }
  const run = dragRun(ctx, options.pressed);
  if (!Array.isArray(run)) return run;
  const nodes = run.map((n) => n.id);
  const dropMap: DropMap = { nodes, lines: run.map((n) => [n.startLine, n.endLine + 1] as const), seams: seamsOf(ctx.doc, run, run[0]!.kind, folded, zoom ?? null, (to) => ({ type: 'moveSubtree', nodes, to }), undefined, (parent, after) => !!moveRefused(ctx, run, parent, after)) };
  const copied = copyOrCutCommand(new CommandContext(ctx.doc, ctx.selection, nodes), 'copy');
  const clipboard = copied?.status === 'applied' ? copied.clipboard : undefined;
  return { status: 'applied', doc: ctx.doc, changes: [], selection: ctx.selection, ...(clipboard && { clipboard }), dropMap };
}

/**
 * The nodes a drag takes, normalized (spec/drag.md): pressing `pressed`'s mark, the selection's
 * topmost nodes where it is one of them (refused unless they are contiguous siblings), else it
 * alone; with no press, the command's nodes (`ctx.nodes`, else the selection's). Then promoted
 * through the parents with no text of their own they are all of, and refused where of mixed kinds.
 */
export function dragRun(ctx: CommandContext, pressed?: number): OurusNode[] | OurusCommandResult {
  let nodes: OurusNode[];
  if (pressed !== undefined) {
    const node = ctx.doc.node(pressed);
    if (!node || node.kind === 'root') return reject('no-such-node');
    // (one of the selection's roots, or of the nodes it touches: on a line nodes share, a subtree
    // selection's root is the outer one, the mark pressed the inner one's)
    const roots = selectionRoots(ctx.doc, ctx.selection);
    if (roots.includes(node) || ctx.doc.touchedNodes(ctx.selection).includes(node)) {
      const runs = runsOf(roots);
      if (runs.length > 1) return reject('non-contiguous');
      nodes = runs[0]!;
    } else nodes = [node];
  } else {
    const found = oneRun(ctx);
    if (!Array.isArray(found)) return operandsRefused(found)!;
    nodes = found;
  }
  if (nodes.some((n) => n.kind !== nodes[0]!.kind)) return reject('mixed-kinds');
  return withTextlessParents(ctx.doc, nodes);
}

/**
 * Every seam `run` can be dropped at, in document order, with its places, shallowest first, each
 * one's drop `dropOf` it: read with the run taken out and the children of the `folded` nodes hidden;
 * none between a node and a first child on its own line; inside `zoom` alone, where the host's view is
 * zoomed into one node. The run's top offers its own place (`current`) beside the places there; its
 * bottom is a dead seam, offering none. Left out: the places Markdown can't hold for a run whose first
 * node is a `kind` (`unholdable`), and those `refused` refuses before anything is written (a move's
 * `moveRefused`, a paste's `pasteRefused`); those the drop refuses for what its text would read as are found by running it.
 * With no run (a clipboard's), every seam of the document as it is. `converts`: whether the dropped
 * node changes kind at a place, where it isn't a move's (`becomesAt`).
 */
function seamsOf(
  doc: OurusDoc,
  run: readonly OurusNode[],
  kind: OurusNode['kind'],
  folded: ReadonlySet<number>,
  zoom: OurusNode | null,
  dropOf: (place: InsertionPoint) => OurusCommand,
  converts?: (parent: OurusNode, after: OurusNode | null) => boolean,
  refused?: (parent: OurusNode, after: OurusNode | null) => boolean,
): DropSeam[] {
  const all = inOrder(doc);
  const out = runIds(all, run);
  const changes = converts ?? ((parent: OurusNode, after: OurusNode | null): boolean => becomesAt(doc, kind, parent, after, out) !== null);
  const hidden = hider(folded);
  const shown = all.filter((n) => !out.has(n.id) && !hidden(n));
  const first = run[0];
  const top = first?.startLine ?? -1;
  const lastShown = all.filter((n) => out.has(n.id) && !hidden(n)).pop() ?? null;
  const position = new Map(all.map((n, k) => [n.id, k]));
  const blanks = (line: number): number => {
    let k = 0;
    while (line - k - 1 >= 0 && (doc.isEmptyLine(line - k - 1) || doc.isBlankLine(line - k - 1))) k++;
    return k;
  };
  const ownPlace: InsertionPoint | null = first ? { parent: idOf(first.parent!), after: first.prev?.id ?? null } : null;
  const own: DropPoint | null = first && ownPlace ? { ...ownPlace, depth: first.depth - 1, listDepth: listDepthOf(first.parent!), current: true, converts: false, drop: dropOf(ownPlace) } : null;
  // the seams, each with whether it is the run's top or its bottom
  const raw: { beforeLine: number; above: OurusNode | null; below: OurusNode | null; at: 'top' | 'dead' | null }[] = [];
  let ownOn: number | null = null;
  for (let k = 0, above: OurusNode | null = null; k <= shown.length; k++) {
    const below = shown[k] ?? null;
    const beforeLine = below ? below.startLine : doc.lineCount;
    const runBetween = !!first && (above ? position.get(above.id)! : -1) < position.get(first.id)! && (below ? position.get(below.id)! : all.length) > position.get(first.id)!;
    if (runBetween) {
      // the run's top, where it has a line of its own; else the seam before the node it starts in, already read
      if (top > (above?.startLine ?? -1)) raw.push({ beforeLine: top, above, below: first!, at: 'top' });
      else ownOn = raw.map((s) => s.beforeLine).lastIndexOf(top);
      raw.push({ beforeLine, above: lastShown, below, at: 'dead' });
    } else if (!above || !below || below.startLine > above.startLine) raw.push({ beforeLine, above, below, at: null });
    above = below;
  }
  const inZoom = (n: OurusNode): boolean => {
    for (let p: OurusNode | null = n; p; p = p.parent) if (zoom && p.id === zoom.id) return true;
    return !zoom;
  };
  return raw.flatMap((s, k) => {
    const gapLines = blanks(s.beforeLine);
    const line = s.beforeLine - gapLines;
    if (zoom && !(line > zoom.ownLastLine && line <= zoom.endLine + 1)) return [];
    const seam = { beforeLine: s.beforeLine, nodeAbove: s.above?.id ?? null, nodeBelow: s.below?.id ?? null, gapLines };
    if (s.at === 'dead') return [{ ...seam, points: [] }];
    const points: DropPoint[] = [];
    const k0 = firstFrom(shown, line);
    const deepest = shown[k0 - 1]?.depth ?? 0;
    const below = shown[k0];
    for (let depth = below ? below.depth - 1 : 0; depth <= deepest; depth++) {
      const place = seamPlace(doc.rootNode, shown, out, line, depth);
      if (typeof place === 'string') continue;
      const parent = place.parent === 'root' ? doc.rootNode : doc.node(place.parent)!;
      const after = place.after === null ? null : doc.node(place.after)!;
      const current = !!ownPlace && place.parent === ownPlace.parent && place.after === ownPlace.after;
      if (!inZoom(parent) || unholdable(doc, kind, parent, after) || (!current && refused?.(parent, after))) continue;
      points.push({ ...place, depth, listDepth: listDepthOf(parent), current, converts: !current && changes(parent, after), drop: dropOf(place) });
    }
    if (own && (s.at === 'top' || k === ownOn) && !points.some((t) => t.current)) points.push(own);
    points.sort((a, b) => a.depth - b.depth || +b.current - +a.current);
    return [{ ...seam, points }];
  });
}

/** How many list items a place under `parent` is inside. */
function listDepthOf(parent: OurusNode): number {
  let k = 0;
  for (let p: OurusNode | null = parent; p; p = p.parent) if (p.kind === 'item') k++;
  return k;
}

/**
 * The drop point of `seam` nearest `x` that `accepts` takes, trying outwards from the nearest
 * column (`columnX`, the host's pixels); where columns tie, the run's own place, then one that
 * doesn't convert the run, then the deeper. Null where it accepts none.
 */
export function nearestDropPoint(seam: DropSeam, x: number, columnX: (point: DropPoint) => number, accepts: (point: DropPoint) => boolean): DropPoint | null {
  const order = [...seam.points].sort((a, b) => {
    const [da, db] = [Math.abs(columnX(a) - x), Math.abs(columnX(b) - x)];
    return da - db || +b.current - +a.current || +a.converts - +b.converts || b.depth - a.depth;
  });
  return order.find(accepts) ?? null;
}

/**
 * The place a drop line names: the gap before line `line` (the line count at the document's end), at
 * `depth` (0 the top level), read with `run` taken out where it is a move's, and the children of the
 * view's folded nodes hidden (`OurusDoc.zoomFolded`). A string where no place is there: the gap isn't a seam (inside a node's
 * lines, after its blank lines rather than before them), or no parent is at that depth. Inside the
 * run, a place at its depth is its own; a deeper one is inside it (`into-itself`, for the drop to
 * refuse).
 */
export function placeAtSeam(doc: OurusDoc, run: readonly OurusNode[] | null, line: number, depth: number): InsertionPoint | string {
  const folded = doc.zoomFolded;
  const all = inOrder(doc);
  const hidden = hider(folded);
  for (const n of all) {
    if (n.startLine < line && line <= n.ownLastLine) return `line ${line + 1} is inside a ${n.kind}'s lines: no seam is there`;
    if (folded.has(n.id) && n.ownLastLine < line && line <= n.endLine) return `line ${line + 1} is inside a folded ${n.kind}'s hidden lines`;
  }
  if (line > 0 && (doc.isEmptyLine(line - 1) || doc.isBlankLine(line - 1))) return `a drop line goes right after the node above's last line, before its blank lines (line ${line})`;
  const at = (out: ReadonlySet<number>): InsertionPoint | string => seamPlace(doc.rootNode, all.filter((n) => !out.has(n.id) && !hidden(n)), out, line, depth);
  if (!run?.length) return at(new Set());
  const first = run[0]!;
  const top = first.startLine;
  const bottom = run[run.length - 1]!.endLine + 1;
  const own = depth === first.depth - 1;
  const ownPlace = (): InsertionPoint => ({ parent: idOf(first.parent!), after: first.prev?.id ?? null });
  if (line > top && line < bottom) {
    // in a gap inside the run: its own place, or under one of its nodes
    if (own) return ownPlace();
    if (depth < first.depth - 1) return `the drop line, in the run, is shallower than the run (depth ${depth})`;
    return at(new Set());
  }
  if (line === top && own) return ownPlace();
  if (line === bottom && depth > first.depth - 1) return at(new Set());
  return at(runIds(all, run));
}

/**
 * A seam's place, in steps: the node above the gap and the node below it among `shown` (the nodes in
 * document order outside `out` and not hidden), and the parent at `depth` between them.
 */
function seamPlace(root: OurusNode, shown: readonly OurusNode[], out: ReadonlySet<number>, line: number, depth: number): InsertionPoint | string {
  const k = firstFrom(shown, line);
  const above = shown[k - 1] ?? null;
  const below = shown[k] ?? null;
  const deepest = above ? above.depth : 0;
  if (depth > deepest) return `no parent is at depth ${depth} there: the node above is at depth ${deepest - 1}`;
  if (below && depth < below.depth - 1) return `depth ${depth} is shallower than the node below (${below.depth - 1}): that place is after its parent's subtree, not at this gap`;
  let parent = above ?? root;
  while (parent.depth > depth) parent = parent.parent!;
  // (the last child before the line, outside `out`: the run's own are contiguous, stepped past)
  let j = firstFrom(parent.children, line) - 1;
  while (j >= 0 && out.has(parent.child(j).id)) j--;
  return { parent: idOf(parent), after: j >= 0 ? parent.child(j).id : null };
}

/** The first of `nodes` (in document order: their first lines never go down) starting at `line` or after it; their count where none does. */
function firstFrom(nodes: readonly OurusNode[], line: number): number {
  let [lo, hi] = [0, nodes.length];
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nodes[mid]!.startLine < line) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const idOf = (n: OurusNode): number | 'root' => (n.kind === 'root' ? 'root' : n.id);

/** The ids of `run`'s nodes and their descendants. */
function runIds(all: readonly OurusNode[], run: readonly OurusNode[]): Set<number> {
  const roots = new Set(run.map((n) => n.id));
  const ids = new Set<number>();
  for (const n of all) for (let p: OurusNode | null = n; p; p = p.parent) if (roots.has(p.id)) ids.add(n.id);
  return ids;
}

/** Whether a node is hidden, under a folded one. */
const hider =
  (folded: ReadonlySet<number>) =>
  (n: OurusNode): boolean => {
    for (let p = n.parent; p; p = p.parent) if (folded.has(p.id)) return true;
    return false;
  };

/** Every node of `doc` but the root, in document order. */
function inOrder(doc: OurusDoc): OurusNode[] {
  const out: OurusNode[] = [];
  const visit = (node: OurusNode): void => {
    out.push(node);
    node.children.forEach(visit);
  };
  doc.rootNode.children.forEach(visit);
  return out;
}
