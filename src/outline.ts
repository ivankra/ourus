// The outline: a projection of the block tree into the nodes users fold, move and indent.
//
// Defaults (the brief's): headings own their section within their container; list items are
// nodes (lists are not), owning their first block as their head and every other block as a
// child; paragraphs are leaves; quotes, code, HTML, thematic breaks and reference definitions
// are atoms.

import type { Block, SyntaxTree } from './syntax/types.ts';

export type OutlineKind = 'root' | 'heading' | 'item' | 'paragraph' | 'atom';

export interface OutlineNode {
  /** Opaque, stable across edits within one document lineage (see `Doc.apply`). */
  readonly id: number;
  readonly kind: OutlineKind;
  /** root: the document; item: the list item; otherwise the block itself. */
  readonly block: Block;
  /** The block holding the node's own text: the item's first block, or the block itself. */
  readonly head: Block | null;
  readonly parent: OutlineNode | null;
  readonly children: readonly OutlineNode[];
  readonly depth: number;
  /** First line of the node. */
  readonly startLine: number;
  /** Last line of the node's own text (its head). */
  readonly headEndLine: number;
  /** Last line of the node with its descendants. Trailing blank lines are not included. */
  readonly endLine: number;
}

interface MNode {
  id: number;
  kind: OutlineKind;
  block: Block;
  head: Block | null;
  parent: MNode | null;
  children: MNode[];
  depth: number;
  startLine: number;
  headEndLine: number;
  endLine: number;
}

const ATOMS = new Set(['blockquote', 'code_block', 'html_block', 'thematic_break', 'refdef']);

export interface Projection {
  readonly root: OutlineNode;
  /** All nodes in document order, root first. */
  readonly nodes: readonly OutlineNode[];
}

/** Builds the outline. Ids are assigned in document order starting at 1; the root gets 0. */
export function project(tree: SyntaxTree): Projection {
  let nextId = 1;
  const nodes: MNode[] = [];
  const make = (kind: OutlineKind, block: Block, head: Block | null, parent: MNode | null): MNode => {
    const startLine = block.startLine;
    const headEndLine = head ? head.endLine : startLine;
    const n: MNode = {
      id: kind === 'root' ? 0 : nextId++,
      kind,
      block,
      head,
      parent,
      children: [],
      depth: parent ? parent.depth + 1 : 0,
      startLine,
      headEndLine,
      endLine: kind === 'item' ? block.endLine : headEndLine,
    };
    nodes.push(n);
    if (parent) parent.children.push(n);
    return n;
  };

  /** Projects a container's child blocks under `owner`, forming heading sections. */
  const projectBlocks = (blocks: readonly Block[], owner: MNode): void => {
    const sections: MNode[] = [];
    for (const b of blocks) {
      if (b.type === 'heading') {
        while (sections.length > 0 && sections[sections.length - 1]!.block.level! >= b.level!) sections.pop();
        const heading = make('heading', b, b, sections[sections.length - 1] ?? owner);
        sections.push(heading);
        continue;
      }
      const parent = sections[sections.length - 1] ?? owner;
      if (b.type === 'list') {
        for (const item of b.children) projectItem(item, parent);
      } else if (b.type === 'paragraph') {
        make('paragraph', b, b, parent);
      } else if (ATOMS.has(b.type)) {
        make('atom', b, b, parent);
      }
    }
  };

  const projectItem = (item: Block, parent: MNode): void => {
    const first = item.children[0];
    const head = first && first.type !== 'list' ? first : null;
    const node = make('item', item, head, parent);
    projectBlocks(head ? item.children.slice(1) : item.children, node);
  };

  const root = make('root', tree.root, null, null);
  projectBlocks(tree.root.children, root);

  // section and root extents come from their descendants
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]!;
    for (const c of n.children) if (c.endLine > n.endLine) n.endLine = c.endLine;
  }
  root.startLine = 0;
  return { root, nodes };
}

/** The node whose own text (head) contains `line`, or null for lines outside any head. */
export function headOwners(projection: Projection, lineCount: number): (OutlineNode | null)[] {
  const owners: (OutlineNode | null)[] = new Array(lineCount).fill(null);
  // document order, so deeper nodes sharing a line (`- - a`) overwrite their parents
  for (const n of projection.nodes) {
    if (n.kind === 'root') continue;
    for (let l = n.startLine; l <= n.headEndLine; l++) owners[l] = n;
  }
  return owners;
}
