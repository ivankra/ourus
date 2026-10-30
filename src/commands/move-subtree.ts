// A drop (spec/move-subtree.md): the run moved to a place, as the moves move it: taken out, put in place,
// converted where the place can't hold its kind; `done()` and the writer do the rest (blank lines,
// numbers, indentation, escapes). Then the result is checked against the place asked for.

import { OurusAtom, OurusProse, type OurusDoc, type OurusNode, type OurusText } from '../doc/index.ts';
import { trimMd } from '../text/index.ts';
import type { OurusResult } from './types.ts';
import { type CommandContext } from './context.ts';
import { dragRun } from './drag.ts';
import { itemTextsRefused } from './indent.ts';
import type { InsertionPoint } from './types.ts';
import { headingLevel, selectionInText, shiftHeadingLevels } from './util.ts';
import { OurusSuccess, OurusRejected } from './types.ts';


/**
 * The command's nodes (`ctx.nodes`, else the selection's), with their subtrees, moved to `to`: the
 * ids and the place checked; at the run's own place, nothing; refused where Markdown can't hold the
 * run there; else moved, a paragraph or an atom under an item or in a paragraph's list becoming an
 * item, an item right after a block that adopts lists becoming a paragraph, a heading re-levelled to
 * its new siblings. The caret goes with the text it is in.
 */
export function moveSubtreeCommand(ctx: CommandContext, to: InsertionPoint): OurusResult | null {
  const doc = ctx.doc;
  const run = dragRun(ctx);
  if (!Array.isArray(run)) return run;
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const ids = new Set(run.map((n) => n.id));
  const place = placeOf(doc, to);
  if (place instanceof OurusRejected) return place;
  const { parent, after } = place;
  if (after && ids.has(after.id)) return new OurusRejected('invalid-insertion-point', 'the place is anchored on a node moved');
  for (let p: OurusNode | null = parent; p; p = p.parent) if (ids.has(p.id)) return new OurusRejected('into-itself');
  const placed = run.map((n) => n.id);
  if (parent.id === first.parent!.id && (after?.id ?? null) === (first.prev?.id ?? null)) return new OurusSuccess({ view: ctx.view, changes: [], selection: ctx.selection, placed });

  // a quote the run leaves holding one paragraph is that paragraph (`quotes: text`); an item's first
  // block, on its marker's line, it would be the item's text, which a move doesn't make yet
  const left = first.parent!;
  if (left.kind === 'quote' && dissolves(doc, left, ids) && left.parent?.kind === 'item' && left.index === 0 && !doc.textOf(left.parent)) return new OurusRejected('not-expressible', "the quote it leaves would be its item's text");

  // what the run becomes there
  const siblings = parent.children.filter((c) => !ids.has(c.id));
  const next = siblings[after ? siblings.findIndex((c) => c.id === after.id) + 1 : 0] ?? null;
  const kind = first.kind;
  const refused = moveRefused(ctx, run, parent, after);
  if (refused) return new OurusRejected(refused.reason, refused.why);
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  const becomes = becomesAt(doc, kind, parent, after, ids);
  const draft = ctx.draft();
  let delta = 0;
  if (parent.kind === 'item' || block) {
    // under an item, or in a paragraph's list: items; a paragraph or an atom becomes one, as indent makes it
    if (becomes === 'item') {
      const refused = itemTextsRefused(ctx, run);
      if (refused) return refused;
      for (const n of run) draft.convert(n, 'item');
    }
  } else if (becomes === 'paragraph') {
    // right after a block that adopts lists, an item would be in its list: a paragraph, as outdent makes
    // it; one whose text is a block of lines, that block, where it holds no children
    for (const n of run) {
      const text = doc.textOf(n);
      draft.convert(n, text instanceof OurusAtom && !n.children.length ? 'atom' : 'paragraph');
    }
  } else if (kind === 'heading') {
    // re-levelled to its new siblings: the nearest heading's level; else one inside a heading parent;
    // in a quote or the document, its own
    const level = (n: OurusNode): number => headingLevel(ctx, n);
    delta = headingTarget(ctx, parent, after, next, level(first)) - level(first);
  }
  draft.remove(run);
  if (after) draft.place('after', after, run);
  else draft.append(parent, 'first', run);
  const shifts = shiftHeadingLevels(ctx, draft, run, delta);
  if (!shifts || shifts instanceof OurusRejected) return shifts;
  selectionInText(ctx, draft, false, shifts);
  const applied = ctx.apply(draft);
  if (!(applied instanceof OurusSuccess)) return applied;
  const wrong = resultCheck(doc, applied.view.doc, placed, ids, to);
  if (wrong) return new OurusRejected(wrong.reason, `result check: ${wrong.why}`);
  return new OurusSuccess({ ...applied, placed });
}

/**
 * Why moving `run` to the place under `parent`, after `after`, is refused before anything is written,
 * or null: a place Markdown can't hold (`unholdable`); a heading under an item or in a paragraph's
 * list, or a quote in a paragraph's list, which no node there can be; a heading whose section would
 * take in what follows it there, re-levelled to its new siblings. What a pickup leaves out of its
 * places too.
 */
export function moveRefused(ctx: CommandContext, run: readonly OurusNode[], parent: OurusNode, after: OurusNode | null): { reason: 'not-expressible' | 'would-reparent'; why: string } | null {
  const first = run[0]!;
  const kind = first.kind;
  const unheld = unholdable(ctx.doc, kind, parent, after);
  if (unheld) return { reason: 'not-expressible', why: unheld };
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  if (kind === 'heading' && (parent.kind === 'item' || block)) return { reason: 'not-expressible', why: `a heading can't be under ${block ? `a ${parent.kind}` : 'an item'}` };
  if (block && kind === 'quote') return { reason: 'not-expressible', why: `a quote can't be in a ${parent.kind}'s list` };
  const ids = new Set(run.map((n) => n.id));
  const siblings = parent.children.filter((c) => !ids.has(c.id));
  const next = siblings[after ? siblings.findIndex((c) => c.id === after.id) + 1 : 0] ?? null;
  const last = run[run.length - 1]!;
  // (items there: a rule one, of a list of its character's bullet, reads as one rule with it, `- ---`)
  const becomes = becomesAt(ctx.doc, kind, parent, after, ids);
  const items = becomes === 'item' || (kind === 'item' && becomes !== 'paragraph');
  if (items) {
    const list = [after, next].find((n) => n?.kind === 'item');
    const bullet = list ? ctx.doc.listOf(list)?.block.attrs.list?.bulletChar : undefined;
    const rule = (n: OurusNode): boolean => {
      const text = ctx.doc.textOf(n);
      return text instanceof OurusAtom && text.type === 'thematic_break' && trimMd(text.text)[0] === bullet;
    };
    if (bullet && run.some(rule)) return { reason: 'not-expressible', why: "the item's bullet and its rule would read as one rule" };
  }
  const joins = joinsAround(ctx.doc, run.map((n) => ctx.doc.textOf(n)), items, parent, after, next);
  if (joins) return { reason: 'not-expressible', why: joins };
  if (next && unclosed(ctx.doc, last)) return { reason: 'not-expressible', why: `what follows would be in the moved ${ctx.doc.textOf(last)!.type === 'fenced_code' ? 'code' : 'block'}, which nothing closes` };
  // (an item becoming a paragraph: its text one, or an atom's lines with nothing under them)
  if (!block && parent.kind !== 'item' && becomes === 'paragraph') {
    for (const n of run) {
      const text = ctx.doc.textOf(n);
      if (text instanceof OurusAtom && !n.children.length) continue;
      if (!(text instanceof OurusProse) || text.heading) return { reason: 'not-expressible', why: `an item can't be a paragraph after a ${after!.kind} there` };
      if (text.task) return { reason: 'not-expressible', why: "a task can't be a paragraph: its checkbox would be text" };
    }
  }
  if (kind !== 'heading' || parent.kind === 'item' || block) return null;
  const level = (n: OurusNode): number => headingLevel(ctx, n);
  const delta = headingTarget(ctx, parent, after, next, level(first)) - level(first);
  return takesIn(ctx, next, level(run[run.length - 1]!) + delta) ? { reason: 'would-reparent', why: 'the heading would take in what follows it' } : null;
}

/** The place `to` names in `doc`: its parent and the node it goes after; else why not. */
export function placeOf(doc: OurusDoc, to: InsertionPoint): { readonly parent: OurusNode; readonly after: OurusNode | null } | OurusRejected {
  const parent = to.parent === 'root' ? doc.rootNode : doc.node(to.parent);
  if (!parent || (to.parent !== 'root' && parent.kind === 'root')) return new OurusRejected('no-such-node', `no node ${to.parent}`);
  const after = to.after === null ? null : (doc.node(to.after) ?? null);
  if (to.after !== null && (!after || after.kind === 'root')) return new OurusRejected('no-such-node', `no node ${to.after}`);
  if (after && after.parent?.id !== parent.id) return new OurusRejected('invalid-insertion-point', `node ${after.id} isn't a child of ${to.parent === 'root' ? 'the root' : `node ${parent.id}`}`);
  return { parent, after };
}

/**
 * The level a heading takes at a place under `parent`, after `after`, before `next`: the heading's
 * beside it, after or else before; else one inside a heading parent; in a quote or the document, its
 * own, `level`.
 */
export function headingTarget(ctx: CommandContext, parent: OurusNode, after: OurusNode | null, next: OurusNode | null, level: number): number {
  const of = (n: OurusNode): number => headingLevel(ctx, n);
  return after?.kind === 'heading' ? of(after) : next?.kind === 'heading' ? of(next) : parent.kind === 'heading' ? of(parent) + 1 : level;
}

/** Whether a heading of `level` last at a place would take `next`, what follows it there, into its section. */
export function takesIn(ctx: CommandContext, next: OurusNode | null, level: number): boolean {
  return !!next && (next.kind !== 'heading' || headingLevel(ctx, next) > level);
}

/**
 * Why Markdown can't hold a run whose first root is a `kind` at the place under `parent`, after
 * `after`, or null: inside a node that holds none, or after a heading, for a node that isn't one (it
 * would be in its section), or right after a block that nothing closes in the same container (a fence
 * with no closing one: its lines would be the block's). What a pickup leaves out of its places, and a
 * drop there refuses.
 */
export function unholdable(doc: OurusDoc, kind: OurusNode['kind'], parent: OurusNode, after: OurusNode | null): string | null {
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  if (block && !doc.adoptsLists(parent)) return `a ${parent.kind} holds no nodes`;
  if (after?.kind === 'heading' && kind !== 'heading') return `after a heading, a ${kind} would be in its section`;
  const above = after?.lastDescendant;
  if (above?.parent === parent && unclosed(doc, above)) return `the ${kind} would be in the ${doc.textOf(above)!.type === 'fenced_code' ? 'code' : 'block'} above it, which nothing closes`;
  return null;
}

/**
 * Why nodes placed under `parent`, after `after`, before `next`, would read otherwise with what is
 * around them, or null: the last an item (`lastItem`) right above indented code, which would be its
 * lines; at the top level, in a flavor with front matter, a `---` line of theirs closing a `---` the
 * document starts with, or theirs first, the document's later one closing it (`texts`: their texts).
 */
export function joinsAround(doc: OurusDoc, texts: readonly (OurusText | null)[], lastItem: boolean, parent: OurusNode, after: OurusNode | null, next: OurusNode | null): string | null {
  if (lastItem && next && (doc.textOf(next) as OurusAtom | null)?.type === 'indented_code') return 'the indented code below would be the item\'s';
  if (parent.kind !== 'root' || !doc.mdTree.flavor.blockStarts.some((b) => b.name === 'frontmatter')) return null;
  const fence = /^---[ \t]*$/;
  const lines = (from: number, to: number): string[] => Array.from({ length: to - from }, (_, k) => doc.text.slice(doc.mdTree.starts[from + k]!, doc.mdTree.ends[from + k]!));
  const theirs = texts.flatMap((t) => (t ? t.text.split('\n') : []));
  const opened = after !== null && doc.lineCount > 0 && fence.test(lines(0, 1)[0]!);
  const first = after === null && (parent.children[0]?.startLine ?? 0) === 0 && fence.test(theirs[0] ?? '');
  if ((opened && theirs.some((l) => fence.test(l))) || (first && (theirs.slice(1).some((l) => fence.test(l)) || lines(0, doc.lineCount).some((l) => fence.test(l))))) return 'a `---` line would close front matter the document would start with';
  return null;
}

/** Whether `node`'s text is a block of lines its delimiter opens and none closes (a fence with no closing one). */
function unclosed(doc: OurusDoc, node: OurusNode): boolean {
  const text = doc.textOf(node);
  return text instanceof OurusAtom && !!text.delimiters && !text.closed;
}

/**
 * What a run whose first root is a `kind` becomes at the place under `parent`, after `after`, with
 * the nodes `out` taken out: an item, for a paragraph or an atom under an item or in a paragraph's
 * list; a paragraph, for an item right after a block that adopts lists; else null, its own kind.
 */
export function becomesAt(doc: OurusDoc, kind: OurusNode['kind'], parent: OurusNode, after: OurusNode | null, out: ReadonlySet<number>): 'item' | 'paragraph' | null {
  const block = parent.kind === 'paragraph' || parent.kind === 'atom';
  if ((parent.kind === 'item' || block) && (kind === 'paragraph' || kind === 'atom')) return 'item';
  if (kind === 'item' && !block && parent.kind !== 'item' && after && (doc.adoptsLists(after) || (dissolves(doc, after, out) && doc.config.listParent !== 'container' && parent.ownsLists))) return 'paragraph';
  return null;
}

/**
 * Whether `quote`, with the nodes `out` taken out, is left a quote of one paragraph, which under
 * `quotes: text` is that paragraph.
 */
function dissolves(doc: OurusDoc, quote: OurusNode, out: ReadonlySet<number>): boolean {
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
  const parentOf = (n: OurusNode): number | 'root' | null => (!n.parent ? null : n.parent.kind === 'root' ? 'root' : n.parent.id);
  // the quotes gone, each the paragraph it was left holding
  const dissolved = new Map<number, OurusNode>();
  const quotes = (n: OurusNode): void => {
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
  const walk = (n: OurusNode): string | null => {
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
