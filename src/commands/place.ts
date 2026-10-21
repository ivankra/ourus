// Placement: nodes put between nodes. Where they go (a slot), what they become there (fitted: an
// item in a list, a heading's section split), and the plan with them in place. Paste places what it
// reads (spec/paste.md, paste-list.md, paste-list-form.md); the structural commands share its rules
// of what holds what (`sectionEnd`, `ownsLists`, `unownLists`).

import type { OutlineNode } from '../outline/index.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree } from '../encoder/index.ts';
import { trimMd } from '../text.ts';
import { blankInQuote, normText, type CommandContext } from './context.ts';

/** Where placed nodes go: in a node's place, before or after it, or first or last among its children. */
export interface Slot {
  readonly where: 'instead' | 'before' | 'after' | 'first' | 'last';
  readonly node: OutlineNode;
  /** The list the placed items join, whose form and spacing they take; null where they join none. */
  readonly list: OutlineNode | null;
  /** The item whose marker gives the list's form, and whether the nodes come before it (numbered from it) or after (on from it). */
  readonly reference: { readonly item: OutlineNode; readonly before: boolean } | null;
}

/** Blocks of lines (code, math, a comment, HTML), which can be an item's text. */
export const LINE_BLOCKS = ['code_block', 'math_block', 'comment_block', 'html_block'];

/** Whether `lines` are a fenced block's (code, math, a comment), its last line the closing fence. */
export function closesFence(lines: readonly string[]): boolean {
  const open = /^[ \t]*(`{3,}|~{3,}|\$\$|%%)/.exec(lines[0] ?? '');
  if (!open || lines.length < 2) return false;
  const close = /^[ \t]*(`+|~+|\$\$|%%)[ \t]*$/.exec(lines[lines.length - 1]!);
  return !!close && close[1]![0] === open[1]![0] && close[1]!.length >= open[1]!.length;
}

/** A heading's level, as a plan node or one of the outline's; any other node's is past every heading's. */
const levelOf = (n: PlanTree): number => {
  if (n.kind !== 'heading') return Infinity;
  return OutlinePlan.isPlanned(n) ? (n.level ?? n.original!.head!.level!) : n.head!.level!;
};

/**
 * The section a run starting with `node` lands at the end of, in `section`: the deepest of its last
 * sub-headings that can hold it (any, for a node that isn't a heading, or for no node; one of a
 * higher level, for a heading), or null where not even `section` can.
 */
export function sectionEnd(section: OutlineNode, node: PlanTree | null): OutlineNode | null {
  const holds = (h: OutlineNode): boolean => node?.kind !== 'heading' || h.head!.level! < levelOf(node);
  if (!holds(section)) return null;
  let into = section;
  for (let last = into.children[into.children.length - 1]; last?.kind === 'heading' && holds(last); last = into.children[into.children.length - 1]) into = last;
  return into;
}

/**
 * Whether a paragraph among `parent`'s children owns the list after it: in a section (the root's, a
 * heading's), not in an item or a quote, under a heading there too.
 */
export function ownsLists(parent: OutlineNode): boolean {
  let holder: OutlineNode | null = parent;
  while (holder && (holder.kind === 'heading' || holder.kind === 'paragraph')) holder = holder.parent;
  return !holder || holder.kind === 'root';
}

/** Nodes as an item or a quote holds them: a paragraph there owns no list, so its list follows it, at every depth. */
export function unownLists(nodes: readonly PlanTree[]): PlanTree[] {
  return nodes.flatMap((n) => {
    const kids = unownLists(n.children);
    if (n.kind === 'paragraph' && kids.length) return [{ ...OutlinePlan.editable(n), children: [] }, ...kids];
    return kids.length === n.children.length && kids.every((k, i) => k === n.children[i]) ? [n] : [{ ...OutlinePlan.editable(n), children: kids }];
  });
}

/** `n` and what it holds without a blank line of their own: a tight list's. */
const allTight = (n: OutlinePlanNode): OutlinePlanNode => ({ ...n, gap: 0, children: n.children.map((c) => (OutlinePlan.isPlanned(c) ? allTight(c) : c)) });

/** `n` with a blank line after it: its last descendant's. */
const withGap = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), withGap(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 1 });

/** `n` without the blank lines after it: its last descendant's. */
const endTight = (n: OutlinePlanNode): OutlinePlanNode => (n.children.length ? { ...n, children: [...n.children.slice(0, -1), endTight(n.children[n.children.length - 1] as OutlinePlanNode)] } : { ...n, gap: 0 });

/** Whether the node after `node` among its siblings is an item. */
export const nextIsItem = (node: OutlineNode): boolean => node.parent!.children[node.parent!.children.indexOf(node) + 1]?.kind === 'item';

/** Placed nodes spaced as the list they land in is: a tight list's tight, a loose list's items apart (the last where an item follows it, `more`). */
export function spaced(nodes: OutlinePlanNode[], list: OutlineNode['block']['parent'] | null, more: boolean): OutlinePlanNode[] {
  if (list?.tight) return nodes.map(allTight);
  if (!list) return nodes;
  return nodes.map((n, k) => (n.kind === 'item' && (k < nodes.length - 1 || more) ? withGap(n) : n));
}

/**
 * Where nodes go from the end of `node`'s text: first among a node's children, where it has some
 * (`pasteOnParent: children`): an item's (an empty one's too, a parent all the same), a heading's
 * section, a paragraph's list where the nodes are items (`items`); else after the node, and in an
 * item or a quote, where a paragraph owns no list, after the paragraph, joining a list right after it.
 */
export function endSlot(ctx: CommandContext, node: OutlineNode, items: boolean): Slot {
  const firstItem = (n: OutlineNode): { item: OutlineNode; before: boolean } | null => (n.children[0]?.kind === 'item' ? { item: n.children[0], before: true } : null);
  const lastItem = (n: OutlineNode): { item: OutlineNode; before: boolean } | null => (n.children[n.children.length - 1]?.kind === 'item' ? { item: n.children[n.children.length - 1]!, before: false } : null);
  // after a node's children (`pasteOnParent: after`): an item's subtree, a heading's section, a paragraph's list
  const after = ctx.doc.config.pasteOnParent === 'after';
  const next = node.parent!.children[node.parent!.children.indexOf(node) + 1];
  const joinsNext = items && next?.kind === 'item' ? next : null;
  if (node.kind === 'item') {
    if (!node.children.length || after) return { where: 'after', node, list: node, reference: { item: node, before: false } };
    const first = firstItem(node);
    return { where: 'first', node, list: first?.item ?? null, reference: first };
  }
  if (node.kind === 'heading' || node.kind === 'quote') {
    // last in a heading's section is last in its last sub-sections, whose own section is what follows them
    const into = after ? sectionEnd(node, null)! : node;
    const near = items ? (after ? lastItem(into) : firstItem(node)) : null;
    return { where: after && into.children.length ? 'last' : 'first', node: into, list: near?.item ?? null, reference: near };
  }
  if (node.kind === 'paragraph' && ownsLists(node.parent!)) {
    const near = after ? lastItem(node) : firstItem(node);
    if (items && near) return { where: after ? 'last' : 'first', node, list: near.item, reference: near };
    return { where: 'after', node, list: null, reference: null };
  }
  // a paragraph in an item or a quote, a block that isn't text: after it, joining a list right after it
  return { where: 'after', node, list: joinsNext, reference: joinsNext && { item: joinsNext, before: true } };
}

/** The placed nodes, fitted to where they land: what they are, what they take in, where they go. */
export interface Fitted {
  readonly nodes: OutlinePlanNode[];
  /** Blocks for the item at the slot, after its text. */
  readonly into: OutlinePlanNode[];
  /** Nodes a placed heading takes in, which leave their place for its section. */
  readonly taken?: OutlineNode[];
  /** Where `nodes` go in place of the slot, where a placed heading takes in the node they went before. */
  readonly place?: { readonly where: 'after' | 'first'; readonly node: OutlineNode };
  /** The placed headings that close sections, from the first of them on: each group after the section it closes. */
  readonly after?: readonly { readonly node: OutlineNode; readonly nodes: OutlinePlanNode[] }[];
  /** The node the caret goes to the end of, where it isn't the last placed (what is taken in follows it). */
  readonly caret?: OutlinePlanNode;
}

/**
 * `nodes` (new ones: copies, their items with their own markers) fitted to `slot`: into a list
 * (an item's, a paragraph's) each an item or in one (`fitToList`), elsewhere as they are
 * (`fitToBlocks`). Null where a block can't fill an empty item.
 */
export function fit(ctx: CommandContext, nodes: readonly OutlinePlanNode[], slot: Slot): Fitted | null {
  const list = slot.list?.kind === 'item' ? slot.list.block.parent : null;
  return slot.list !== null || slot.node.kind === 'item' ? fitToList(ctx, nodes, slot, list?.tight === true) : fitToBlocks(ctx, nodes, slot);
}

/**
 * The nodes outside a list, as they are: in an item or a quote a paragraph owns no list, so the list
 * it brings follows it (a section's paragraphs own theirs). A placed heading splits the section it
 * lands in, as one typed there would: what follows it, up to a heading of its level or above, is its
 * section (`taken`), under the deepest open heading of the nodes that holds it; and it goes after
 * the sections it closes (`## h` placed in `## A` goes after `A`'s own nodes, the rest of `A` its).
 * At a heading's end the nodes go first in its section, unless they close it. The node at the slot
 * keeps its own (a paragraph its list: the nodes go after it); before it, the node is what follows.
 * Headings inside a placed quote or item split no section.
 */
function fitToBlocks(ctx: CommandContext, nodes: readonly OutlinePlanNode[], slot: Slot): Fitted {
  const { node } = slot;
  const first = slot.where === 'first';
  const inside = first || slot.where === 'last';
  // with `pasteLines: items`, each line of a placed paragraph is a node: a paragraph of its own
  const lined = nodes.flatMap((n) => {
    if (ctx.doc.config.pasteLines !== 'items' || n.kind !== 'paragraph' || n.children.length) return [n];
    return n.lines!.map((l) => trimMd(l)).filter((l) => l !== '').map((text) => {
      const line = ctx.encoder.escape(text, 'start').text;
      return { ...OutlinePlan.created('paragraph', normText([line])), lines: [line], gap: 1, children: [] };
    });
  });
  const fitted = ownsLists(inside ? node : node.parent!) ? lined : (unownLists(lined) as OutlinePlanNode[]);
  // the headings that split sections: the top-level ones, and those in their sections
  const sectioned = (ns: readonly PlanTree[]): number[] => ns.flatMap((n) => (n.kind === 'heading' ? [levelOf(n), ...sectioned(n.children)] : []));
  const levels = sectioned(fitted);
  if (!levels.length) return { nodes: fitted, into: [] };
  const top = Math.min(...levels);
  const before = slot.where === 'before';
  // at a heading's end: in its section (first, or last), unless the nodes close it; in a quote, in it
  const within = inside && (node.kind !== 'heading' || levelOf(node) < top);
  const taken: OutlineNode[] = [];
  const takeAfter = (siblings: readonly OutlineNode[], from: number): void => {
    for (const n of siblings.slice(from)) {
      if (levelOf(n) <= top) break;
      taken.push(n);
    }
  };
  let at = node;
  // what follows the nodes, from the node they go before
  const next = (n: OutlineNode): number => n.parent!.children.indexOf(n) + (before && n === node ? 0 : 1);
  // first in a heading's section, what follows them there
  if (first) takeAfter(node.children, 0);
  if (!within) {
    while (at.parent?.kind === 'heading' && levelOf(at.parent) >= top) {
      takeAfter(at.parent.children, next(at));
      at = at.parent;
    }
    takeAfter(at.parent!.children, next(at));
  }
  // a placed heading goes after the sections it closes, from where the heading before it went; what
  // comes before the first that closes one stays in the slot (`x` / `# y` placed in `# A`: `x` is `A`'s)
  const groups: { node: OutlineNode; from: number }[] = [];
  let parent = inside ? node : node.parent!;
  for (const [i, n] of fitted.entries()) {
    if (n.kind !== 'heading') continue;
    let closed: OutlineNode | null = null;
    for (; parent.kind === 'heading' && levelOf(parent) >= levelOf(n); parent = parent.parent!) closed = parent;
    if (closed) groups.push({ node: closed, from: i });
  }
  const stay = groups[0]?.from ?? fitted.length;
  const split = (): Pick<Fitted, 'nodes' | 'after'> => ({
    nodes: fitted.slice(0, stay),
    ...(groups.length && { after: groups.map((g, k) => ({ node: g.node, nodes: fitted.slice(g.from, groups[k + 1]?.from ?? fitted.length) })) }),
  });
  // before a node it takes in, what stays goes after the node before it, or first in their parent
  const prev = node.parent!.children[node.parent!.children.indexOf(node) - 1];
  const place = before && taken.includes(node) ? (prev ? { where: 'after' as const, node: prev } : { where: 'first' as const, node: node.parent! }) : undefined;
  if (!taken.length) return { ...split(), into: [], ...(place && { place }) };
  // each node taken in goes under the deepest open heading that holds it (a heading, under one above
  // its level): the last placed node is a heading, every top-level node after a heading being in its section
  const open: OutlinePlanNode[] = [];
  for (let n: PlanTree | undefined = fitted[fitted.length - 1]; n?.kind === 'heading'; n = n.children[n.children.length - 1]) open.push(n as OutlinePlanNode);
  const under = new Map<number, OutlineNode[]>();
  for (const n of taken) {
    let depth = open.length - 1;
    while (depth > 0 && levelOf(open[depth]!) >= levelOf(n)) depth--;
    under.set(depth, [...(under.get(depth) ?? []), n]);
  }
  // the open headings, each with what it takes in after its own children; the caret at the end of
  // the placed text, before what is taken in
  let caret: OutlinePlanNode | undefined;
  const graft = (n: OutlinePlanNode, depth: number): OutlinePlanNode => {
    const kids = n.children;
    const deeper = depth + 1 < open.length ? graft(kids[kids.length - 1] as OutlinePlanNode, depth + 1) : null;
    const grafted: OutlinePlanNode = { ...n, children: [...(deeper ? [...kids.slice(0, -1), deeper] : kids), ...(under.get(depth) ?? [])] };
    if (depth === open.length - 1) {
      caret = grafted;
      for (let k = kids; k.length; k = caret.children) caret = k[k.length - 1] as OutlinePlanNode;
    }
    return grafted;
  };
  fitted[fitted.length - 1] = graft(fitted[fitted.length - 1]!, 0);
  return { ...split(), into: [], taken, ...(caret && { caret }), ...(place && { place }) };
}

/**
 * The nodes landing in a list, each an item or in one: items take the list's form (its bullet, or its
 * numbers on from the item before, or from the item after them), or of the other kind keep their own
 * (`pasteListForm: own`); a paragraph is an item, its lines the item's text (`pasteLines: text`) or
 * an item each (`items`), and its list follows it (`pasteParagraphList: siblings`) or is its children
 * (`children`: the last line's item's); a block that would end the list (code, a quote, a table) goes
 * into the item before it, the last placed, or before any, the item at the slot (`into`); among an
 * item's children it stays where it is, between the placed items; first in an empty item's place or
 * before an item, where it can be an item's text (code), it is. A heading is an item whose text is
 * the heading, the rest of its section the item's children. Null where a block can't fill an empty
 * item.
 */
function fitToList(ctx: CommandContext, nodes: readonly OutlinePlanNode[], slot: Slot, tight: boolean): Fitted | null {
  const { doc } = ctx;
  const reference = slot.reference;
  const form = reference ? doc.text.slice(doc.markerFrom(reference.item.block), doc.markerTo(reference.item.block)) : doc.config.bullet;
  const number = /^(\d{1,9})([.)])$/.exec(form);
  let next = number ? Number(number[1]) + (reference!.before ? 0 : 1) : 0;
  const marker = (): string => (number ? `${next++}${number[2]}` : form);
  const children = doc.config.pasteParagraphList === 'children';
  const own = doc.config.pasteListForm === 'own';
  const listed = nodes.flatMap((n): OutlinePlanNode[] => (n.kind === 'paragraph' && !children ? [{ ...n, children: [] }, ...(n.children as OutlinePlanNode[])] : [n]));
  const fitted: OutlinePlanNode[] = [];
  const into: OutlinePlanNode[] = [];
  for (const n of listed) {
    if (n.kind === 'heading') {
      // a heading is an item's first block, the rest of its section the item's children; in an item a
      // paragraph owns no list, so a list one owned in the section follows it
      fitted.push({ ...n, kind: 'item', blockType: 'heading', marker: marker(), exactMarker: true, children: unownLists(n.children) });
      continue;
    }
    if (n.kind === 'item') {
      // an item of the other kind keeps its marker (`pasteListForm: own`), a list of its own
      fitted.push({ ...n, marker: own && /^\d/.test(n.marker!) !== !!number ? n.marker! : marker(), exactMarker: true });
      continue;
    }
    if (n.kind === 'paragraph') {
      // its lines are the item's text (`pasteLines: text`), or an item each (`items`), escaped where they would start a block there
      const texts = n.lines!.map((l) => trimMd(l)).filter((l) => l !== '');
      const groups = doc.config.pasteLines === 'items' ? texts.map((t) => [t]) : [texts];
      for (const [g, group] of groups.entries()) {
        const lines = group.map((text, k) => ctx.encoder.escape(text, k === 0 ? 'start' : 'continuation').text);
        const kids = children && g === groups.length - 1 ? n.children : [];
        fitted.push({ ...OutlinePlan.created('item', normText(lines)), lines, marker: marker(), exactMarker: true, children: kids });
      }
      continue;
    }
    const prev = fitted[fitted.length - 1];
    if ((slot.where === 'instead' || slot.where === 'before') && !fitted.length) {
      // in an empty item's place or before an item, a block of lines (code, math, a comment, HTML) is an item's text; anything else isn't
      if (!LINE_BLOCKS.includes(n.blockType ?? '')) return null;
      fitted.push({ ...n, kind: 'item', text: normText(n.lines ?? []), marker: marker(), exactMarker: true });
    } else if (slot.where === 'first' || slot.where === 'last') fitted.push(n);
    else if (prev?.kind === 'item') {
      const item = tight ? endTight(prev) : prev;
      fitted[fitted.length - 1] = { ...item, children: [...item.children, n] };
    } else if (prev) fitted.push(n);
    else into.push(n);
  }
  return { nodes: fitted, into };
}

/** The plan with fitted nodes in place, and how to write it. */
export interface Placed {
  readonly expected: OutlinePlan;
  /** The placed node whose text the caret goes to the end of, and its line there (code's last, not its closing fence; a setext title's, not its underline). */
  readonly last: OutlinePlanNode;
  readonly line: number;
  /** Whether the nodes are set apart, a blank line around them, where Markdown doesn't need one. */
  readonly apart: boolean;
  /** Placeholders the placement ends: an emptied item's. */
  readonly drop: readonly number[];
}

/**
 * `fitted` placed in `slot`, on `base` (the plan as the command leaves the rest): spaced as the list
 * they join; in an empty item's place its checkbox the first item's, its children after them; what a
 * placed heading takes in moved under it, each group after the section it closes, blocks for the
 * item at the slot after its text.
 */
export function placed(ctx: CommandContext, slot: Slot, fitted: Fitted, base = ctx.plan): Placed {
  const { doc } = ctx;
  const { node } = slot;
  const instead = slot.where === 'instead';
  const list = slot.list?.kind === 'item' ? slot.list.block.parent : null;
  const nodes = spaced(fitted.nodes, list, !instead || nextIsItem(node));
  const into = fitted.into;
  // an empty task's checkbox goes to the first placed item, unless it has its own
  const box = instead ? /^\[[ xX]\]/.exec(trimMd(doc.headLines(node)[0] ?? '')) : null;
  const head = nodes[0];
  if (box && head?.kind === 'item' && !head.blockType && head.lines?.length && !/^\[[ xX]\](?:[ \t]|$)/.test(head.lines[0]!)) {
    const lines = [`${box[0]} ${head.lines[0]}`, ...head.lines.slice(1)];
    nodes[0] = { ...head, lines, text: normText(lines) };
  }
  // an emptied item's children follow the nodes in its place: under the last placed node
  if (instead && node.children.length && nodes.length) {
    const last = nodes[nodes.length - 1]!;
    nodes[nodes.length - 1] = { ...last, children: [...last.children, ...node.children] };
  }
  // what a placed heading takes in leaves its place, for the heading's section (`remove` takes siblings)
  for (const parent of new Set(fitted.taken?.map((n) => n.parent))) base = base.remove(fitted.taken!.filter((n) => n.parent === parent));
  const { place } = fitted;
  // (an empty paragraph filled goes, though all that is placed goes after the sections it closes)
  let expected = !nodes.length ? (instead ? base.remove([node]) : base) : place?.where === 'after' ? base.place('after', place.node, nodes) : place ? base.append(place.node, 'first', nodes) : instead || slot.where === 'before' ? base.place(slot.where, node, nodes) : slot.where === 'first' || slot.where === 'last' ? base.append(node, slot.where, nodes) : base.place('after', node, nodes);
  for (const group of fitted.after ?? []) expected = expected.place('after', group.node, group.nodes);
  // blocks before any placed item go into the item at the slot, after its text
  if (into.length) expected = expected.append(node, 'first', into);
  // the caret's: the end of the last placed text, the last node's deepest last node
  const lastPlaced = fitted.after?.[fitted.after.length - 1]!.nodes ?? (nodes.length ? nodes : into);
  let last: PlanTree = fitted.caret ?? lastPlaced[lastPlaced.length - 1]!;
  if (!fitted.caret) while (last.children.length && OutlinePlan.isPlanned(last.children[last.children.length - 1]!)) last = last.children[last.children.length - 1]!;
  const lastNode = last as OutlinePlanNode;
  const setext = (lastNode.kind === 'heading' || lastNode.blockType === 'heading') && lastNode.lines!.length > 1 && /^ {0,3}(=+|-+)[ \t]*$/.test(lastNode.lines![lastNode.lines!.length - 1]!);
  const line = lastNode.lines!.length - (closesFence(lastNode.lines!) || setext ? 2 : 1);
  // spacing: a tight list takes the nodes tight; a paragraph's list written right under it, or apart,
  // stays so; outside a list, after a node written without a blank line after it (a paragraph, an
  // item's blocks), none where Markdown needs none; else (under a heading too) the nodes are set apart
  const below = doc.lines[node.headEndLine + 1];
  const tightAfter = !list && node.kind !== 'heading' && !instead && slot.where !== 'before' && below !== undefined && !below.blank && !blankInQuote(ctx, below);
  // first among a node's children: written apart from its text (a blank line between), they stay so
  const written = slot.where === 'first' && node.kind !== 'heading' && node.children.length > 0 && doc.lines.slice(node.headEndLine + 1, node.children[0]!.startLine).some((l) => l.blank);
  const tight = instead || tightAfter || (slot.where === 'first' && node.kind !== 'heading' ? !written && (node.kind === 'paragraph' || list?.tight !== false) : list?.tight === true);
  // an empty item's placeholder goes with it
  const drop = instead ? doc.placeholders.filter((p) => doc.lineAt(p).index === node.startLine) : [];
  return { expected, last: lastNode, line, apart: !tight, drop };
}
