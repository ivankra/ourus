// A drop (spec/drag.md): the run moved to a place, as the moves move it: taken out, put in place,
// converted where the place can't hold its kind; `done()` and the writer do the rest (blank lines,
// numbers, indentation, escapes). Then the result is checked against the place asked for.

import { AtomText, ProseText, type OurusDoc, type OutlineNode } from '../doc/index.ts';
import type { CommandResult } from './types.ts';
import { reject, type CommandContext, type CommandOutcome } from './context.ts';
import { dragRun } from './drag.ts';
import { itemTextsRefused } from './indent.ts';
import type { InsertionPoint } from './types.ts';
import { headingLevel, selectionInText, shiftHeadingLevels } from './util.ts';

/**
 * The command's nodes (`ctx.nodes`, else the selection's), with their subtrees, moved to `to`: the
 * ids and the place checked; at the run's own place, nothing; refused where Markdown can't hold the
 * run there; else moved, a paragraph or an atom under an item or in a paragraph's list becoming an
 * item, an item right after a block that adopts lists becoming a paragraph, a heading re-levelled to
 * its new siblings. The caret goes with the text it is in.
 */
export function moveSubtreeToCommand(ctx: CommandContext, to: InsertionPoint): CommandOutcome {
  const doc = ctx.doc;
  const run = dragRun(ctx);
  if (!Array.isArray(run)) return run;
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const ids = new Set(run.map((n) => n.id));
  const place = placeOf(doc, to);
  if ('status' in place) return place;
  const { parent, after } = place;
  if (after && ids.has(after.id)) return reject('invalid-insertion-point', 'the place is anchored on a node moved');
  for (let p: OutlineNode | null = parent; p; p = p.parent) if (ids.has(p.id)) return reject('into-itself');
  const placed = run.map((n) => n.id);
  if (parent.id === first.parent!.id && (after?.id ?? null) === (first.prev?.id ?? null)) return { status: 'applied', doc, changes: [], selection: ctx.selection, placed };

  // a quote the run leaves holding one paragraph is that paragraph (`quotes: text`); an item's first
  // block, on its marker's line, it would be the item's text, which a move doesn't make yet
  const left = first.parent!;
  if (left.kind === 'quote' && dissolves(doc, left, ids) && left.parent?.kind === 'item' && left.index === 0 && !doc.textOf(left.parent)) return reject('not-expressible', "the quote it leaves would be its item's text");

  // what the run becomes there
  const siblings = parent.children.filter((c) => !ids.has(c.id));
  const next = siblings[after ? siblings.findIndex((c) => c.id === after.id) + 1 : 0] ?? null;
  const kind = first.kind;
  const unheld = unholdable(doc, kind, parent, after);
  if (unheld) return reject('not-expressible', unheld);
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  const becomes = becomesAt(doc, kind, parent, after, ids);
  const draft = ctx.draft();
  let delta = 0;
  if (parent.kind === 'item' || block) {
    // under an item, or in a paragraph's list: items; a paragraph or an atom becomes one, as indent makes it
    if (kind === 'heading') return reject('not-expressible', `a heading can't be under ${block ? `a ${parent.kind}` : 'an item'}`);
    if (becomes === 'item') {
      const refused = itemTextsRefused(ctx, run);
      if (refused) return refused;
      for (const n of run) draft.convert(n, 'item');
    } else if (block && kind !== 'item') return reject('not-expressible', `a ${kind} can't be in a ${parent.kind}'s list`);
  } else if (becomes === 'paragraph') {
    // right after a block that adopts lists, an item would be in its list: a paragraph, as outdent makes
    // it; one whose text is a block of lines, that block, where it holds no children
    for (const n of run) {
      const text = doc.textOf(n);
      if (text instanceof AtomText && !n.children.length) {
        draft.convert(n, 'atom');
        continue;
      }
      if (!(text instanceof ProseText) || text.heading) return reject('not-expressible', `an item can't be a paragraph after a ${after!.kind} there`);
      if (text.task) return reject('not-expressible', "a task can't be a paragraph: its checkbox would be text");
      draft.convert(n, 'paragraph');
    }
  } else if (kind === 'heading') {
    // re-levelled to its new siblings: the nearest heading's level; else one inside a heading parent;
    // in a quote or the document, its own. A section that would take in what follows is refused
    const level = (n: OutlineNode): number => headingLevel(ctx, n);
    delta = headingTarget(ctx, parent, after, next, level(first)) - level(first);
    if (takesIn(ctx, next, level(last) + delta)) return reject('would-reparent', 'the heading would take in what follows it');
  }
  draft.remove(run);
  if (after) draft.place('after', after, run);
  else draft.append(parent, 'first', run);
  const shifts = shiftHeadingLevels(ctx, draft, run, delta);
  if (!shifts || 'status' in shifts) return shifts;
  selectionInText(ctx, draft, false, shifts);
  const applied = ctx.apply(draft);
  if (applied?.status !== 'applied') return applied;
  const wrong = resultCheck(doc, applied.doc, placed, ids, to);
  if (wrong) return reject(wrong.reason, `result check: ${wrong.why}`);
  return { ...applied, placed };
}

/** The place `to` names in `doc`: its parent and the node it goes after; else why not. */
export function placeOf(doc: OurusDoc, to: InsertionPoint): { readonly parent: OutlineNode; readonly after: OutlineNode | null } | CommandResult {
  const parent = to.parent === 'root' ? doc.rootNode : doc.node(to.parent);
  if (!parent || (to.parent !== 'root' && parent.kind === 'root')) return reject('no-such-node', `no node ${to.parent}`);
  const after = to.after === null ? null : (doc.node(to.after) ?? null);
  if (to.after !== null && (!after || after.kind === 'root')) return reject('no-such-node', `no node ${to.after}`);
  if (after && after.parent?.id !== parent.id) return reject('invalid-insertion-point', `node ${after.id} isn't a child of ${to.parent === 'root' ? 'the root' : `node ${parent.id}`}`);
  return { parent, after };
}

/**
 * The level a heading takes at a place under `parent`, after `after`, before `next`: the heading's
 * beside it, after or else before; else one inside a heading parent; in a quote or the document, its
 * own, `level`.
 */
export function headingTarget(ctx: CommandContext, parent: OutlineNode, after: OutlineNode | null, next: OutlineNode | null, level: number): number {
  const of = (n: OutlineNode): number => headingLevel(ctx, n);
  return after?.kind === 'heading' ? of(after) : next?.kind === 'heading' ? of(next) : parent.kind === 'heading' ? of(parent) + 1 : level;
}

/** Whether a heading of `level` last at a place would take `next`, what follows it there, into its section. */
export function takesIn(ctx: CommandContext, next: OutlineNode | null, level: number): boolean {
  return !!next && (next.kind !== 'heading' || headingLevel(ctx, next) > level);
}

/**
 * Why Markdown can't hold a run whose first root is a `kind` at the place under `parent`, after
 * `after`, or null: inside a node that holds none, or after a heading, for a node that isn't one (it
 * would be in its section). What a pickup leaves out of its places, and a drop there refuses.
 */
export function unholdable(doc: OurusDoc, kind: OutlineNode['kind'], parent: OutlineNode, after: OutlineNode | null): string | null {
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  if (block && !doc.adoptsLists(parent)) return `a ${parent.kind} holds no nodes`;
  if (after?.kind === 'heading' && kind !== 'heading') return `after a heading, a ${kind} would be in its section`;
  return null;
}

/**
 * What a run whose first root is a `kind` becomes at the place under `parent`, after `after`, with
 * the nodes `out` taken out: an item, for a paragraph or an atom under an item or in a paragraph's
 * list; a paragraph, for an item right after a block that adopts lists; else null, its own kind.
 */
export function becomesAt(doc: OurusDoc, kind: OutlineNode['kind'], parent: OutlineNode, after: OutlineNode | null, out: ReadonlySet<number>): 'item' | 'paragraph' | null {
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  if ((parent.kind === 'item' || block) && (kind === 'paragraph' || kind === 'atom')) return 'item';
  if (kind === 'item' && !block && parent.kind !== 'item' && after && (doc.adoptsLists(after) || (dissolves(doc, after, out) && doc.config.listParent !== 'container' && parent.ownsLists))) return 'paragraph';
  return null;
}

/**
 * Whether `quote`, with the nodes `out` taken out, is left a quote of one paragraph, which under
 * `quotes: text` is that paragraph.
 */
function dissolves(doc: OurusDoc, quote: OutlineNode, out: ReadonlySet<number>): boolean {
  if (quote.kind !== 'quote' || doc.config.quotes !== 'text' || doc.textOf(quote)) return false;
  const left = quote.children.filter((c) => !out.has(c.id));
  return left.length === 1 && left[0]!.kind === 'paragraph' && !left[0]!.children.length;
}

/**
 * Whether a drop put `roots` where it was asked (`moved`: the nodes it moved, roots and all; none for a
 * paste), and left every other node under the parent it had,
 * but for the lists a block above them adopts (guarantee 4), and a quote left holding one paragraph,
 * which under `quotes: text` is that paragraph: what is wrong, or null.
 */
export function resultCheck(before: OurusDoc, after: OurusDoc, roots: readonly number[], moved: ReadonlySet<number>, to: InsertionPoint): { reason: 'not-expressible' | 'would-reparent'; why: string } | null {
  const parentOf = (n: OutlineNode): number | 'root' | null => (!n.parent ? null : n.parent.kind === 'root' ? 'root' : n.parent.id);
  // the quotes gone, each the paragraph it was left holding
  const dissolved = new Map<number, OutlineNode>();
  const quotes = (n: OutlineNode): void => {
    for (const c of n.children) {
      const left = c.children.filter((k) => !moved.has(k.id));
      if (c.kind === 'quote' && !after.node(c.id) && left.length === 1 && left[0]!.kind === 'paragraph') dissolved.set(c.id, left[0]!);
      quotes(c);
    }
  };
  quotes(before.rootNode);
  const standing = (id: number | 'root'): number | 'root' => (id === 'root' ? id : (dissolved.get(id)?.id ?? id));
  for (const [k, id] of roots.entries()) {
    const n = after.node(id);
    if (!n || parentOf(n) !== standing(to.parent)) return { reason: 'not-expressible', why: `node ${id} isn't under the parent asked` };
    // after the node asked, or after the block that adopted it once the run left (guarantee 4)
    const prev = k === 0 ? (to.after === null ? null : standing(to.after)) : roots[k - 1]!;
    let anchor = prev === null || prev === 'root' ? null : (after.node(prev) ?? null);
    while (anchor?.parent && anchor.parent.id !== n.parent!.id) anchor = anchor.parent;
    if ((n.prev?.id ?? null) !== (anchor?.id ?? prev)) return { reason: 'not-expressible', why: `node ${id} isn't at the place asked` };
  }
  const walk = (n: OutlineNode): string | null => {
    for (const c of n.children) {
      if (!moved.has(c.id) && !dissolved.has(c.id)) {
        const now = after.node(c.id);
        if (!now) return `node ${c.id} is gone`;
        const was = parentOf(c);
        const quote = c.parent && dissolved.has(c.parent.id) ? c.parent : null;
        const is = parentOf(now);
        // a list the block above it adopts (guarantee 4); a moved block's list where it can own none,
        // which follows it (Quote78)
        const adopted = now.kind === 'item' && !!now.parent && (now.parent.kind === 'paragraph' || now.parent.kind === 'atom') && after.adoptsLists(now.parent);
        const follows = !!c.parent && moved.has(c.parent.id) && is === parentOf(after.node(c.parent.id)!);
        if (is !== (quote ? parentOf(quote) : was) && !adopted && !follows) return `node ${c.id} has another parent`;
      }
      const deeper = walk(c);
      if (deeper) return deeper;
    }
    return null;
  };
  const why = walk(before.rootNode);
  return why ? { reason: 'would-reparent', why } : null;
}
