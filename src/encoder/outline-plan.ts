// The outline plan: the whole outline as a command wants it, before it is encoded as text changes.
//
// Nodes the plan doesn't touch are the current outline's own nodes, by reference; nodes on the path
// from the root to a change are copied, and so are nodes the command creates (`OutlinePlanNode`s). So
// a plan describes the whole outline but costs only what changed. The encoder writes it; the command
// runner checks that the re-parsed outline reads as it (`differenceFrom`).

import type { OutlineState, OutlineKind, OutlineNode } from '../outline/index.ts';

/** A node a command copied or created. Fields it leaves out are its `original`'s. */
export interface OutlinePlanNode {
  /** The id to keep, or null for a node the command creates. */
  readonly id: number | null;
  readonly kind: OutlineKind;
  /** The node of the current outline this one was: its lines are reused. Absent for a new node. */
  readonly original?: OutlineNode;
  /** heading: its level, when it differs from `original`'s. */
  readonly level?: number;
  /** The node's own text, when it differs from `original`'s: trimmed lines joined by `\n`. */
  readonly text?: string;
  /** A new atom's block type, or a new item's head type when it isn't a paragraph. */
  readonly blockType?: string;
  /**
   * The node's own lines as written, without their list prefix (an item's first line starts after
   * its marker): a new node's, or an old node's when its text changes. `text` is what they read as.
   */
  readonly lines?: readonly string[];
  /** A new item's own marker (`-`, `1.`); the encoder adopts its list's where it joins one. */
  readonly marker?: string;
  /** Write `marker` as given, on a new item or an old one, instead of adopting the list's (a paste keeps the numbers it brings). */
  readonly exactMarker?: boolean;
  /** Blank lines after the node's own lines: a new node's, or a rewritten one's in place of its old gap. */
  readonly gap?: number;
  /**
   * A copy's lazy continuation lines, by their index in `lines` (that very array: lines written anew
   * leave them): written as they were, without their containers' prefix, which would make some read
   * as blocks of their own (a table's delimiter row).
   */
  readonly lazy?: { readonly lines: readonly string[]; readonly at: readonly number[] };
  readonly children: readonly PlanTree[];
}

/** A node of a plan: one of the current outline's, untouched, or a copied or created one. */
export type PlanTree = OutlineNode | OutlinePlanNode;

/**
 * A node an edit can target: one with an id, that is a node of the current outline (or a copy of
 * one). Nodes a command creates have no id yet, so they can't be told apart: build a new node
 * complete (children included) before it goes into the plan, rather than editing it after.
 */
export type PlanTarget = { readonly id: number };

/** What a new node is written as: its lines, marker and gap. */
export type NewContent = Pick<OutlinePlanNode, 'lines' | 'marker' | 'gap'>;

/** How a node's own text is read: in the current outline, and in the re-parsed one. */
export interface OutlineText {
  readonly old: (node: OutlineNode) => string;
  readonly new: (node: OutlineNode) => string;
}

export class OutlinePlan {
  /** The plan's root: the current outline's root while nothing changed, else a copy. */
  readonly root: PlanTree;

  private constructor(root: PlanTree) {
    this.root = root;
  }

  /** A plan equal to `state`'s current outline, for a command to change. */
  static from(state: OutlineState): OutlinePlan {
    return new OutlinePlan(state.root);
  }

  /** Whether `node` is a copied or created node, not one of the current outline's (which alone have a `block`). */
  static isPlanned(node: PlanTree): node is OutlinePlanNode {
    return !('block' in node);
  }

  /** A copy of `node` to change: the same node, its children still the current outline's. */
  static editable(node: PlanTree): OutlinePlanNode {
    return OutlinePlan.isPlanned(node) ? node : { id: node.id, kind: node.kind, original: node, children: node.children };
  }

  /** A node the command creates. */
  static created(kind: OutlineKind, text: string): OutlinePlanNode {
    return { id: null, kind, text, children: [] };
  }

  /** A new node meaning what `node` of `state` means (a pasted or duplicated node), its subtree copied the same way. */
  /**
   * A paragraph's or an item's lines (`contentOf`'s) as its text starts: without the indentation before
   * its first character, which isn't text (four columns of it would make code where the node is written
   * anew); an item whose text is a block of its own (indented code) keeps its lines as they are.
   */
  static textLines<T extends { lines: string[] }>(node: OutlineNode, content: T): T {
    // an item's text that is indented code keeps its indentation: it is what makes it code
    if ((node.kind !== 'paragraph' && node.kind !== 'item') || node.head?.type !== 'paragraph') return content;
    const [first = '', ...rest] = content.lines;
    return { ...content, lines: [first.replace(/^[ \t]+/, ''), ...rest] };
  }

  static copy(state: OutlineState, node: OutlineNode): OutlinePlanNode {
    const { level, block } = describe(node, (n) => state.nodeText(n));
    const content = OutlinePlan.textLines(node, state.contentOf(node));
    const at = state.ownLines(node).flatMap((line, i) => (line.lazy ? [i] : []));
    return {
      id: null,
      kind: node.kind,
      text: state.nodeText(node),
      ...(level !== undefined ? { level } : {}),
      ...(block !== undefined ? { blockType: block } : {}),
      ...content,
      ...(at.length ? { lazy: { lines: content.lines, at } } : {}),
      children: node.children.map((child) => OutlinePlan.copy(state, child)),
    };
  }

  /** Whether anything changed: the root is a copy. */
  get changed(): boolean {
    return OutlinePlan.isPlanned(this.root);
  }

  /** The plan with `node` replaced by `change` of a copy of it. Only the path from the root to it is copied. */
  update(node: PlanTarget, change: (node: OutlinePlanNode) => OutlinePlanNode): OutlinePlan {
    const id = target(node);
    return this.edit((at) => at.id === id, change, `no node ${id} in the outline`);
  }

  /** The plan with `node`'s own text set. */
  setText(node: PlanTarget, text: string): OutlinePlan {
    return this.update(node, (n) => ({ ...n, text }));
  }

  /** The plan without `nodes`, siblings under one parent, which it finds. */
  remove(nodes: readonly PlanTarget[]): OutlinePlan {
    const id = target(nodes[0]!);
    return this.edit((at) => at.children.some((c) => c.id === id), (p) => ({ ...p, children: p.children.filter((c) => !nodes.some((n) => n.id === c.id)) }), `no parent of node ${id} in the outline`);
  }

  /** The plan with `nodes` in place of `sibling`, or before or after it, under its parent. */
  place(where: 'before' | 'after' | 'instead', sibling: PlanTarget, nodes: readonly PlanTree[]): OutlinePlan {
    const id = target(sibling);
    return this.edit((at) => at.children.some((c) => c.id === id), (p) => {
      const i = p.children.findIndex((c) => c.id === id);
      const at = where === 'after' ? i + 1 : i;
      return { ...p, children: [...p.children.slice(0, at), ...nodes, ...p.children.slice(where === 'instead' ? i + 1 : at)] };
    }, `no parent of node ${id} in the outline`);
  }

  /** The plan with `nodes` added to `parent`'s children, first or last. */
  append(parent: PlanTarget, where: 'first' | 'last', nodes: readonly PlanTree[]): OutlinePlan {
    return this.update(parent, (n) => ({ ...n, children: where === 'first' ? [...nodes, ...n.children] : [...n.children, ...nodes] }));
  }

  /**
   * The plan as its text will read: in a section (the root's or a heading's children), the items
   * right after a paragraph are its children, as `buildOutline` reads them, and anything else among
   * them ends its list there: it and what follows it are the section's again.
   */
  withOwnedLists(): OutlinePlan {
    const root = ownLists(this.root);
    return root === this.root ? this : new OutlinePlan(root);
  }

  /**
   * Where `actual`'s outline differs from this plan, read as its text will read (`withOwnedLists`),
   * or null when it is the plan: as trees, or (`flat`) node by node in document order (a heading
   * level change re-derives sections). `current` is the state the plan was made from. Compares kind,
   * heading level, text and block; not ids.
   */
  differenceFrom(actual: OutlineState, current: OutlineState, compare: 'tree' | 'flat'): string | null {
    const expected = ownLists(this.root);
    const text: OutlineText = { old: (n) => current.nodeText(n), new: (n) => actual.nodeText(n) };
    if (compare === 'tree') return treeDifference(expected, actual.root, text);
    const want: PlanTree[] = [];
    const visit = (n: PlanTree): void => {
      want.push(n);
      n.children.forEach(visit);
    };
    visit(expected);
    const got = actual.nodes;
    for (let i = 0; i < Math.max(want.length, got.length); i++) {
      if (!want[i] || !got[i]) return `${want.length} nodes, got ${got.length}`;
      const d = nodeDifference(want[i]!, got[i]!, text);
      if (d) return `node ${i}: ${d}`;
    }
    return null;
  }

  /**
   * The plan with the first node `match` finds (in document order) replaced by `change` of a copy of
   * it. Only the path from the root to it is copied; the match is structural, so a parent need not
   * have an id of its own.
   */
  private edit(match: (node: PlanTree) => boolean, change: (node: OutlinePlanNode) => OutlinePlanNode, missing: string): OutlinePlan {
    const visit = (at: PlanTree): OutlinePlanNode | null => {
      if (match(at)) return change(OutlinePlan.editable(at));
      for (const child of at.children) {
        const edited = visit(child);
        if (edited) return { ...OutlinePlan.editable(at), children: at.children.map((sibling) => (sibling === child ? edited : sibling)) };
      }
      return null;
    };
    const root = visit(this.root);
    if (!root) throw new Error(missing);
    return new OutlinePlan(root);
  }

}

function ownLists(node: PlanTree, contained = false): PlanTree {
  // as the outline reads them: a paragraph owns the list after it in a section, but not anywhere in an
  // item or a quote, under a heading there too
  const inside = contained || node.kind === 'item' || node.kind === 'quote';
  const children = node.children.map((child) => ownLists(child, inside));
  let changed = children.some((child, i) => child !== node.children[i]);
  let regrouped = children;
  if ((node.kind === 'root' || node.kind === 'heading') && !inside) {
    regrouped = [];
    const pending = [...children];
    while (pending.length) {
      let child = pending.shift()!;
      if (child.kind === 'paragraph') {
        // a paragraph's list ends at the first child that isn't an item
        const end = child.children.findIndex((grandchild) => grandchild.kind !== 'item');
        if (end >= 0) {
          pending.unshift(...child.children.slice(end));
          child = { ...OutlinePlan.editable(child), children: child.children.slice(0, end) };
          changed = true;
        }
      }
      const before = regrouped[regrouped.length - 1];
      if (child.kind === 'item' && before?.kind === 'paragraph') {
        regrouped[regrouped.length - 1] = { ...OutlinePlan.editable(before), children: [...before.children, child] };
        changed = true;
      } else regrouped.push(child);
    }
  }
  return changed ? { ...OutlinePlan.editable(node), children: regrouped } : node;
}

/**
 * Where node `actual` of the re-parsed outline differs from the node it was meant to be, children
 * aside, or null when it is that node. Compares kind, heading level, text and block (an atom's type,
 * or an item whose text isn't a paragraph). Ids aren't compared.
 */
function nodeDifference(expected: PlanTree, actual: OutlineNode, text: OutlineText): string | null {
  const source = OutlinePlan.isPlanned(expected) ? expected.original : expected;
  const want = { ...(source ? describe(source, text.old) : { level: undefined, text: '', block: undefined }), kind: expected.kind };
  if (OutlinePlan.isPlanned(expected)) {
    if (expected.level !== undefined) want.level = expected.level;
    if (expected.text !== undefined) want.text = expected.text;
    if (expected.blockType !== undefined) want.block = expected.blockType;
  }
  const got = describe(actual, text.new);
  for (const key of ['kind', 'level', 'text', 'block'] as const) {
    if (key === 'text' && want.kind !== 'atom' && unescaped(want.text) === unescaped(got.text)) continue;
    if (want[key] !== got[key]) return `${key} ${JSON.stringify(want[key])}, got ${JSON.stringify(got[key])}`;
  }
  return null;
}

/**
 * Text without the backslashes that only keep its lines from starting blocks (`\- x`, `1\. x`,
 * `\|---|`): it reads the same with them, where the outline around it is the same (which the rest of
 * the comparison checks).
 */
const unescaped = (text: string | undefined): string | undefined => text?.replace(/^(\d*)\\(?=[!-/:-@[-`{-~])/gm, '$1');

/** Where the re-parsed outline differs from the planned tree, or null when it is that tree. */
function treeDifference(expected: PlanTree, actual: OutlineNode, text: OutlineText, at = 'root'): string | null {
  const own = nodeDifference(expected, actual, text);
  if (own) return `${at}: ${own}`;
  const count = Math.max(expected.children.length, actual.children.length);
  for (let i = 0; i < count; i++) {
    const expectedChild = expected.children[i];
    const actualChild = actual.children[i];
    if (!expectedChild || !actualChild) return `${at}: ${expected.children.length} children, got ${actual.children.length}`;
    const difference = treeDifference(expectedChild, actualChild, text, `${at} › ${i}`);
    if (difference) return difference;
  }
  return null;
}

/** What verification compares of a node, besides its children. */
type Description = { kind: OutlineKind; level: number | undefined; text: string; block: string | undefined };

function describe(node: OutlineNode, text: (node: OutlineNode) => string): Description {
  return {
    kind: node.kind,
    level: node.head?.type === 'heading' ? node.head.level : undefined,
    text: text(node),
    // an atom's block type, or an item's head type when it isn't a paragraph (`- # h`, `- <div>`)
    block: node.kind === 'atom' ? node.block.type : node.kind === 'item' && node.head && node.head.type !== 'paragraph' ? node.head.type : undefined,
  };
}

/** A target's id; a node without one (a new node, cast past the type) can't be told apart from other new nodes. */
function target(node: PlanTarget): number {
  if (node.id === null) throw new Error('a node the command created has no id, so a plan edit cannot target it: build it complete before it goes in');
  return node.id;
}
