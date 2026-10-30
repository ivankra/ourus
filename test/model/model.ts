// A reference outliner model: a pure tree with a caret, and the commands defined on it the way
// Logseq and Workflowy behave, with ourus's own choices where they differ.
//
// Two modes. `pure` is a tree outliner: any node can hold children, anything can be indented,
// moved or joined. `md` adds the rules Markdown forces, each named, so a run can count how often
// each one decides an outcome (`fired`). The point of the experiment is how long that list gets.

export type Kind = 'root' | 'heading' | 'item' | 'paragraph' | 'quote' | 'atom';

export interface MNode {
  kind: Kind;
  /** heading level */
  level?: number;
  /** the node's own text: lines trimmed, joined by \n; no marker, `#`s or checkbox */
  text: string;
  /** item: a task's checkbox state */
  task?: ' ' | 'x' | null;
  /** atom block type, or an item's head when it isn't a paragraph */
  block?: string;
  /** not compared: a setext heading (levels 1 and 2 only) */
  setext?: boolean;
  children: MNode[];
}

export interface Caret {
  node: MNode;
  offset: number;
}

export type Cmd = 'indent' | 'outdent' | 'moveSubtreeUp' | 'moveSubtreeDown' | 'enter' | 'deleteContentBackward' | 'deleteContentForward';

export type Outcome = { status: 'success'; root: MNode; caret: Caret } | { status: 'rejected'; reason: string };

export type Mode = 'pure' | 'md';

/** Markdown rules that decided an outcome, by name, for the current run. */
export const fired = new Map<string, number>();

export function apply(root0: MNode, caret0: Caret, cmd: Cmd, mode: Mode): Outcome {
  // work on a copy; the caret's node is found by identity in the copy
  const copies = new Map<MNode, MNode>();
  const clone = (n: MNode): MNode => {
    const c: MNode = { ...n, children: n.children.map(clone) };
    copies.set(n, c);
    return c;
  };
  const root = clone(root0);
  const node = copies.get(caret0.node)!;
  const ctx = new Ctx(root, mode);
  const out = COMMANDS[cmd](ctx, node, caret0.offset);
  if (out.status === 'success' && mode === 'md' && ctx.resection) {
    ctx.rule('headings-own-sections');
    normalizeSections(root);
  }
  return out;
}

class Ctx {
  resection = false;
  readonly root: MNode;
  readonly mode: Mode;
  constructor(root: MNode, mode: Mode) {
    this.root = root;
    this.mode = mode;
  }
  /** Whether the Markdown rule `name` applies; counts it when it does. */
  md(name: string, cond: boolean): boolean {
    if (this.mode !== 'md' || !cond) return false;
    this.rule(name);
    return true;
  }
  rule(name: string): void {
    fired.set(name, (fired.get(name) ?? 0) + 1);
  }
  parent(n: MNode): MNode | null {
    return findParent(this.root, n);
  }
  preorder(): MNode[] {
    const out: MNode[] = [];
    const walk = (n: MNode) => (out.push(n), n.children.forEach(walk));
    this.root.children.forEach(walk);
    return out;
  }
  ok(caret: Caret): Outcome {
    return { status: 'success', root: this.root, caret };
  }
}

const reject = (reason: string): Outcome => ({ status: 'rejected', reason });

export function findParent(root: MNode, n: MNode): MNode | null {
  for (const c of root.children) {
    if (c === n) return root;
    const p = findParent(c, n);
    if (p) return p;
  }
  return null;
}

const remove = (parent: MNode, n: MNode): number => {
  const i = parent.children.indexOf(n);
  parent.children.splice(i, 1);
  return i;
};

const isEmpty = (n: MNode) => n.text === '' && !n.block;

type Command = (ctx: Ctx, n: MNode, offset: number) => Outcome;

const COMMANDS: Record<Cmd, Command> = {
  indent(ctx, n, offset) {
    if (n.kind === 'heading') return headingLevel(ctx, n, 1, offset);
    const parent = ctx.parent(n)!;
    const prev = parent.children[parent.children.indexOf(n) - 1];
    if (!prev) return reject('no-previous-sibling');
    if (ctx.md('only-items-indent', n.kind !== 'item')) return reject('not-expressible');
    if (ctx.md('only-items-hold-items', prev.kind !== 'item')) return reject('not-expressible');
    if (ctx.md('leaves-hold-nothing', prev.kind === 'paragraph' || prev.kind === 'atom')) return reject('not-expressible');
    remove(parent, n);
    prev.children.push(n);
    return ctx.ok({ node: n, offset });
  },

  outdent(ctx, n, offset) {
    if (n.kind === 'heading') return headingLevel(ctx, n, -1, offset);
    const parent = ctx.parent(n)!;
    if (parent === ctx.root) return reject('at-top-level');
    if (ctx.md('only-items-indent', n.kind !== 'item')) return reject('not-expressible');
    // a heading's section is not indentation: its content can't leave it by outdenting
    if (ctx.md('section-is-not-a-level', parent.kind === 'heading')) return reject('at-top-level');
    const grand = ctx.parent(parent)!;
    remove(parent, n); // logical outdent: the siblings below stay with the parent
    grand.children.splice(grand.children.indexOf(parent) + 1, 0, n);
    return ctx.ok({ node: n, offset });
  },

  moveSubtreeUp: (ctx, n, offset) => move(ctx, n, -1, offset),
  moveSubtreeDown: (ctx, n, offset) => move(ctx, n, 1, offset),

  enter(ctx, n, offset) {
    const parent = ctx.parent(n)!;
    if (n.kind === 'atom' || n.block) return reject('not-applicable');
    if (n.kind === 'item' && isEmpty(n)) {
      // Enter on an empty item: a nested one outdents, a top-level one leaves the list
      if (parent.kind === 'item') return COMMANDS.outdent(ctx, n, 0);
      // ourus's choice: leave the list, as an empty paragraph
      const para: MNode = { kind: 'paragraph', text: '', children: [] };
      parent.children[parent.children.indexOf(n)] = para;
      return ctx.ok({ node: para, offset: 0 });
    }
    if (n.kind === 'paragraph' && n.text === '') return reject('not-expressible');
    const before = n.text.slice(0, offset).replace(/\s+$/, '');
    const after = n.text.slice(offset).replace(/^\s+/, '');
    if (before === '' && after !== '') {
      // at the start: an empty node above, the caret staying with the text (items); a blank line
      // above a paragraph or heading, which changes nothing in the outline
      if (n.kind !== 'item') return ctx.ok({ node: n, offset: 0 });
      const fresh: MNode = { kind: 'item', text: '', task: n.task ? ' ' : null, children: [] };
      parent.children.splice(parent.children.indexOf(n), 0, fresh);
      return ctx.ok({ node: n, offset: 0 });
    }
    n.text = before;
    if (n.kind === 'heading') {
      const fresh: MNode = { kind: 'paragraph', text: after, children: [] };
      n.children.unshift(fresh);
      return ctx.ok({ node: fresh, offset: 0 });
    }
    if (n.kind === 'paragraph') {
      const typed = ctx.md('typed-marker-starts-node', /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/.test(after));
      const fresh: MNode = typed ? { kind: 'item', text: after.replace(/^\S+[ \t]*/, ''), task: null, children: [] } : { kind: 'paragraph', text: after, children: [] };
      parent.children.splice(parent.children.indexOf(n) + 1, 0, fresh);
      return ctx.ok({ node: fresh, offset: 0 });
    }
    const typed = ctx.md('typed-marker-starts-node', /^(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/.test(after));
    const fresh: MNode = { kind: 'item', text: typed ? after.replace(/^\S+[ \t]*/, '') : after, task: n.task && !typed ? ' ' : null, children: [] };
    // with children, the new node is the first child (Logseq, Workflowy), else the next sibling
    if (n.children.length > 0) n.children.unshift(fresh);
    else parent.children.splice(parent.children.indexOf(n) + 1, 0, fresh);
    return ctx.ok({ node: fresh, offset: 0 });
  },

  deleteContentBackward(ctx, n, offset) {
    if (offset > 0) {
      return ctx.ok(rawEdit(ctx, n, offset - 1, offset));
    }
    return joinUp(ctx, n);
  },

  deleteContentForward(ctx, n, offset) {
    if (offset < n.text.length) {
      return ctx.ok(rawEdit(ctx, n, offset, offset + 1));
    }
    const order = ctx.preorder();
    const next = order[order.indexOf(n) + 1];
    if (!next) return reject('nothing-below');
    if (n.kind === 'item' && isEmpty(n) && n.children.length === 0) {
      remove(ctx.parent(n)!, n);
      return ctx.ok({ node: next, offset: 0 });
    }
    return joinUp(ctx, next);
  },
};

/** Deleting a character inside the text: a text edit, with line ends trimmed as Markdown reads them. */
function rawEdit(ctx: Ctx, n: MNode, from: number, to: number): Caret {
  const text = n.text.slice(0, from) + n.text.slice(to);
  n.text = text;
  if (ctx.md('line-ends-trimmed', /[ \t]\n|\n[ \t]|^[ \t]|[ \t]$/.test(text))) {
    const lines = text.split('\n');
    let offset = from;
    let base = 0;
    const out: string[] = [];
    for (const l of lines) {
      const t = l.trim();
      const lead = l.length - l.trimStart().length;
      if (from >= base && from <= base + l.length) offset = out.join('\n').length + (out.length ? 1 : 0) + Math.min(Math.max(0, from - base - lead), t.length);
      out.push(t);
      base += l.length + 1;
    }
    n.text = out.join('\n');
    return { node: n, offset };
  }
  return { node: n, offset: from };
}

/** Backspace at a node's start: its text joins the end of the node above (in document order). */
function joinUp(ctx: Ctx, n: MNode): Outcome {
  const order = ctx.preorder();
  const prev = order[order.indexOf(n) - 1];
  if (!prev) return reject('nothing-above');
  const parent = ctx.parent(n)!;
  if (isEmpty(n) && n.children.length > 0 && n.kind === 'item') return reject('has-children');
  if (isEmpty(n) && n.children.length === 0) {
    // an empty node just goes, whatever is above it
    remove(parent, n);
    return ctx.ok({ node: prev, offset: prev.text.length });
  }
  if (ctx.md('atoms-take-no-text', prev.kind === 'atom' || !!prev.block || n.kind === 'atom' || !!n.block)) return reject('not-expressible');
  if (ctx.md('heading-is-one-line', prev.kind === 'heading' && n.text.includes('\n'))) return reject('not-expressible');
  const at = remove(parent, n);
  const caret = { node: prev, offset: prev.text.length };
  // joining into an empty item: the text arrives with its checkbox
  if (isEmpty(prev) && prev.kind === 'item' && n.kind === 'item') prev.task = n.task;
  prev.text += n.text;
  if (n.kind === 'heading') {
    // the section continues the one above
    parent.children.splice(at, 0, ...n.children);
    ctx.resection = true;
  } else if (n.children.length > 0) {
    // children go to the node above: into the joined node's place when that node is its parent
    const adopt = prev !== parent && !ctx.md('leaves-hold-nothing', prev.kind === 'paragraph' || prev.kind === 'atom') && prev.kind !== 'root';
    if (adopt) prev.children.push(...n.children);
    else parent.children.splice(at, 0, ...n.children);
  }
  return ctx.ok(caret);
}

function move(ctx: Ctx, n: MNode, dir: -1 | 1, offset: number): Outcome {
  const parent = ctx.parent(n)!;
  const i = parent.children.indexOf(n);
  const other = parent.children[i + dir];
  if (!other) return reject(dir < 0 ? 'no-previous-sibling' : 'no-next-sibling');
  const group = (k: Kind) => (k === 'paragraph' || k === 'atom' ? 'leaf' : k);
  if (ctx.md('lists-are-runs', group(other.kind) !== group(n.kind))) return reject('not-expressible');
  parent.children[i] = other;
  parent.children[i + dir] = n;
  if (n.kind === 'heading') ctx.resection = true;
  return ctx.ok({ node: n, offset });
}

function headingLevel(ctx: Ctx, n: MNode, delta: number, offset: number): Outcome {
  // org-style: the heading and the headings in its section shift; sections re-derive
  const hs: MNode[] = [];
  const walk = (m: MNode) => (m.kind === 'heading' && hs.push(m), m.children.forEach(walk));
  walk(n);
  for (const h of hs) {
    const level = h.level! + delta;
    if (level < 1) return reject('at-h1-bound');
    if (level > 6) return reject('at-h6-bound');
    if (ctx.md('setext-has-two-levels', !!h.setext && level > 2)) return reject('not-expressible');
  }
  for (const h of hs) h.level! += delta;
  ctx.resection = true;
  return ctx.ok({ node: n, offset });
}

/** Re-derives heading sections in every container, as building the outline does. */
export function normalizeSections(container: MNode): void {
  const flat: MNode[] = [];
  const flatten = (ns: MNode[]) => {
    for (const c of ns) {
      if (c.kind === 'heading') {
        const kids = c.children;
        c.children = [];
        flat.push(c);
        flatten(kids);
      } else flat.push(c);
    }
  };
  flatten(container.children);
  container.children = [];
  const sections: MNode[] = [];
  for (const b of flat) {
    if (b.kind !== 'heading') {
      if (b.kind === 'item') normalizeSections(b);
      (sections[sections.length - 1] ?? container).children.push(b);
      continue;
    }
    while (sections.length && sections[sections.length - 1]!.level! >= b.level!) sections.pop();
    (sections[sections.length - 1] ?? container).children.push(b);
    sections.push(b);
  }
}

/** Index path of a node from the root, for comparing carets across trees. */
export function pathOf(root: MNode, n: MNode): number[] | null {
  if (root === n) return [];
  for (let i = 0; i < root.children.length; i++) {
    const p = pathOf(root.children[i]!, n);
    if (p) return [i, ...p];
  }
  return null;
}

/** The tree as comparable data. */
export function shape(n: MNode): unknown {
  return [n.kind, n.level ?? null, n.text, n.task ?? null, n.block ?? null, n.children.map(shape)];
}

/** A compact drawing of a tree for reports. */
export function draw(n: MNode, depth = 0, out: string[] = []): string[] {
  if (n.kind !== 'root') {
    const tag = n.kind === 'heading' ? `h${n.level}` : n.kind === 'item' ? (n.task ? `item[${n.task}]` : 'item') : n.kind;
    out.push(`${'  '.repeat(depth - 1)}${tag}${n.block ? `<${n.block}>` : ''} ${JSON.stringify(n.text)}`);
  }
  n.children.forEach((c) => draw(c, depth + 1, out));
  return out;
}
