// The selection commands: select the node at the caret (`selectNode`), the outward ladder
// (`expandSelection`), and one node a press (`selectNodeDown`, `selectNodeUp`). Each changes no text:
// applied with no changes and a new selection, or the host's where the key's native behavior is right.
// Stateless: each reads what to do from the selection alone, a subtree selection (whole lines,
// `OurusDoc.selectedNodes`) or text.

import { textEnd, textStart, type OurusDoc, type OurusNode } from '../doc/index.ts';
import { deferToHost, type CommandContext, type CommandOutcome } from './context.ts';
import type { OurusSelection } from './types.ts';

/** `selection`, applied with no change to the text. */
function selected(ctx: CommandContext, selection: OurusSelection): CommandOutcome {
  return { status: 'applied', doc: ctx.doc, changes: [], selection };
}

/** The ids of a selection's roots as `selectedNodes` reads them, to compare two selections as nodes; null for text. */
function rootsOf(doc: OurusDoc, selection: OurusSelection): string | null {
  return doc.selectedNodes(selection)?.map((n) => n.id).join() ?? null;
}

/**
 * The node at the caret with its subtree, as whole lines; over text across nodes, the roots it
 * touches. Over a subtree selection already, a caret at its first root's text start, to edit it.
 */
export function selectNodeCommand(ctx: CommandContext): CommandOutcome {
  const doc = ctx.doc;
  const roots = doc.selectedNodes(ctx.selection);
  if (roots) {
    let first: OurusNode = roots[0]!;
    while (!doc.textOf(first) && first.children.length) first = first.children[0]!;
    const text = doc.textOf(first);
    if (!text) return deferToHost();
    const at = doc.posOf(first, textStart(text), 1);
    return selected(ctx, { anchor: at, head: at });
  }
  const touched = doc.touchedNodes(ctx.selection).filter((n) => !doc.isHidden(n));
  if (!touched.length) return deferToHost();
  return selected(ctx, doc.selectionOf(touched.map((n) => n.id)));
}

/**
 * The next rung of the ladder (Ctrl-A in outliners): the smallest rung for the anchor's node that holds
 * the selection and isn't it. The node's own text (compared by offsets), its subtree, its siblings'
 * run (`selectionLadder: siblings`), its parent's subtree, and so on outward, the top level's run
 * last, or the zoom root's subtree inside a zoom (compared as nodes). Past the top, the host's select
 * all; inside a zoom, the selection as it is (a select all would reach past the zoom).
 */
export function expandSelectionCommand(ctx: CommandContext): CommandOutcome {
  const doc = ctx.doc;
  const sel = ctx.selection;
  const node = anchorNode(doc, sel);
  if (!node) return doc.zoom === null ? deferToHost() : selected(ctx, sel);
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  const current = rootsOf(doc, sel);
  // what the selection touches: the nodes a subtree rung must hold
  const held = doc.selectedNodes(sel) ?? doc.touchedNodes(sel);
  const holds = (rung: readonly OurusNode[]): boolean => held.every((n) => rung.some((r) => isWithin(n, r)));
  // 1. the node's own text, unless the selection is already the node (its text and its lines the same)
  const text = doc.textOf(node);
  if (text && current === null) {
    const own = { from: doc.posOf(node, textStart(text), 1), to: doc.posOf(node, textEnd(text), -1) };
    if (own.from <= from && to <= own.to && (own.from !== from || own.to !== to)) return selected(ctx, { anchor: own.from, head: own.to });
  }
  for (const rung of rungsOf(doc, node)) {
    if (!holds(rung)) continue;
    const next = doc.selectionOf(rung.map((n) => n.id));
    if (rootsOf(doc, next) !== current) return selected(ctx, next);
  }
  return doc.zoom === null ? deferToHost() : selected(ctx, sel);
}

/**
 * The subtree rungs of `node`'s ladder, smallest first: its subtree, then outward its siblings' run
 * (`selectionLadder: siblings`) and its parent's subtree; the top level's run last, or the zoom root's
 * subtree inside a zoom. With `selectionLadder: top`, the top alone.
 */
function rungsOf(doc: OurusDoc, node: OurusNode): OurusNode[][] {
  // (`top`: the node's text, then the top alone)
  if (doc.config.selectionLadder === 'top') {
    const top = doc.zoom === null ? null : doc.node(doc.zoom);
    return [top ? [top] : [...doc.rootNode.children]];
  }
  const rungs: OurusNode[][] = [[node]];
  for (let at = node; at.id !== doc.zoom; ) {
    const parent = at.parent!;
    // (the top level's run: every node, whatever the option)
    if (parent.kind === 'root' || doc.config.selectionLadder === 'siblings') rungs.push([...parent.children]);
    if (parent.kind === 'root') break;
    rungs.push([parent]);
    at = parent;
  }
  return rungs;
}

/** Whether `node` is `root` or in its subtree. */
function isWithin(node: OurusNode, root: OurusNode): boolean {
  for (let p: OurusNode | null = node; p; p = p.parent) if (p === root) return true;
  return false;
}

/**
 * The anchor's node, read from the selection alone: of a subtree selection, its one root, or its first
 * root going down and its last going up (its anchor's offset can be the next node's line start); of a
 * caret or text, the node the anchor is in (a blank line's, the node above's). Null where there is
 * none (the blank lines before the first node).
 */
function anchorNode(doc: OurusDoc, sel: OurusSelection): OurusNode | null {
  const roots = doc.selectedNodes(sel);
  if (roots) return roots.length === 1 || sel.head > sel.anchor ? roots[0]! : roots[roots.length - 1]!;
  return doc.touchedNodes({ anchor: sel.anchor, head: sel.anchor })[0] ?? null;
}

/**
 * Shift-Down (`dir` 1) or Shift-Up (-1) by node. Over a subtree selection, one node a press: the
 * selection is the closure of the anchor's node and a candidate (its last root going down, its first
 * going up, its one root alone), and the press moves the candidate a node in document order among the
 * nodes shown (`selectNodeUp: sibling`: above the anchor's node, by siblings, a first child's parent
 * next), until the closure changes: away from the anchor it grows, towards it it shrinks; at the
 * document's or the zoom's edge, the selection as it is. From a caret or text in one node, at its edge
 * (its last line going down, its first going up) that node, else the host's (a line); from a blank
 * line the node below going down, above going up; over text across nodes, its roots, as whole lines.
 */
export function selectNodeByCommand(ctx: CommandContext, dir: -1 | 1): CommandOutcome {
  const doc = ctx.doc;
  const sel = ctx.selection;
  const roots = doc.selectedNodes(sel);
  if (!roots) {
    const touched = doc.touchedNodes(sel);
    const line = doc.lineAt(sel.head).index;
    const blank = sel.anchor === sel.head && doc.nodeAtLine(line) === null;
    if (blank) {
      // the node below going down, the one above (whose gap it is) going up
      const node = dir > 0 ? visibleAfterLine(doc, line) : (touched[0] ?? null);
      return node ? selected(ctx, doc.selectionOf([node.id], dir > 0 ? 'down' : 'up')) : deferToHost();
    }
    if (!touched.length) return deferToHost();
    const node = touched[0]!;
    const own = (pos: number): boolean => doc.lineAt(pos).index >= node.textFirstLine && doc.lineAt(pos).index <= node.textLastLine;
    // in one node's text: a line at a time (the host's), but from its edge
    if (touched.length === 1 && own(sel.anchor) && own(sel.head) && line !== (dir > 0 ? node.textLastLine : node.textFirstLine)) return deferToHost();
    return selected(ctx, doc.selectionOf(touched.map((n) => n.id), dir > 0 ? 'down' : 'up'));
  }
  const up = sel.head < sel.anchor;
  const anchor = roots.length === 1 || !up ? roots[0]! : roots[roots.length - 1]!;
  let candidate: OurusNode | null = roots.length === 1 ? roots[0]! : up ? roots[0]! : roots[roots.length - 1]!;
  const current = roots.map((n) => n.id).join();
  // (`selectNodeUp: sibling`: above the anchor's node, the candidate goes by siblings, both ways)
  const bySibling = doc.config.selectNodeUp === 'sibling';
  for (;;) {
    candidate = bySibling && (candidate.startLine < anchor.startLine || (candidate === anchor && dir < 0)) ? siblingStep(doc, candidate, dir) : step(doc, candidate, dir);
    if (!candidate) return selected(ctx, sel);
    const ids = [anchor.id, candidate.id];
    const next = doc.selectedNodes(doc.selectionOf(ids))!;
    if (next.map((n) => n.id).join() === current) continue;
    // one root: the way the press went; more: from the anchor's node towards the candidate
    const down = next.length === 1 ? dir > 0 : candidate.startLine > anchor.startLine;
    return selected(ctx, doc.selectionOf(ids, down ? 'down' : 'up'));
  }
}

/** The node shown next after `node` in document order (`dir` 1) or before it (-1); null at the document's or the zoom's edge. */
function step(doc: OurusDoc, node: OurusNode, dir: -1 | 1): OurusNode | null {
  for (let at: OurusNode | null = node; ; ) {
    at = dir > 0 ? (at.children[0] ?? at.afterSubtree) : at.preceding;
    if (!at || at.kind === 'root') return null;
    if (!doc.isHidden(at)) return at;
    // (a hidden node's subtree is hidden too: past it going down)
    if (dir > 0) {
      const after: OurusNode | null = at.afterSubtree;
      if (!after) return null;
      if (!doc.isHidden(after)) return after;
      at = after;
    }
  }
}

/** The sibling above `node` (`dir` -1), else its parent; or the node after its subtree (1). Null at the document's or the zoom's edge. */
function siblingStep(doc: OurusDoc, node: OurusNode, dir: -1 | 1): OurusNode | null {
  const at = dir < 0 ? (node.prev ?? node.parent) : node.afterSubtree;
  return at && at.kind !== 'root' && !doc.isHidden(at) ? at : null;
}

/** The first node shown that starts after line `line`, or null. */
function visibleAfterLine(doc: OurusDoc, line: number): OurusNode | null {
  for (let i = line + 1; i < doc.lineCount; i++) {
    const node = doc.rowOwner(i) ?? doc.nodeAtLine(i);
    if (node && node.startLine === i && !doc.isHidden(node)) return node;
  }
  return null;
}
