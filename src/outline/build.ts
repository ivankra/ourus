// The outline: the nodes users fold, move and indent, built from the block tree.
//
// Defaults (the brief's): headings own their section within their container; list items are
// nodes (lists are not), owning their first block as their head and every other block as a
// child; in a section (the root's or a heading's children), a paragraph owns the lists right after
// it (with or without a blank line between), whose items are its children; a quote is a container
// like an item, its blocks its children, with no text of its own but a callout's title (its first
// paragraph, `[!type] Title`, or in the Obsidian flavor its title line); code, HTML, thematic breaks,
// reference definitions, tables, math and comment blocks, and footnote definitions are atoms.
// Frontmatter is a preamble: no node.

import type { Block, LineInfo } from '../parser/index.ts';

export type OutlineKind = 'root' | 'heading' | 'item' | 'paragraph' | 'quote' | 'atom';

export interface OutlineNode {
  /** Opaque, stable across edits within one document lineage (see `OutlineState.apply`). */
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

/** An outline node while the outline is being built: the same fields, writable. */
type MutableOutlineNode = { -readonly [K in keyof OutlineNode]: OutlineNode[K] } & {
  parent: MutableOutlineNode | null;
  children: MutableOutlineNode[];
};

const ATOMS = new Set(['code_block', 'html_block', 'thematic_break', 'refdef', 'table', 'math_block', 'comment_block', 'footnote_definition']);
/** The blocks that can be an item's text: any other first block stays its child. */
const HEADS = new Set(['paragraph', 'heading', 'code_block', 'html_block', 'math_block', 'comment_block']);

/** Builds the outline and returns its root. Ids are assigned in document order starting at 1; the root gets 0. */
export function buildOutline(document: Block, line: (index: number) => LineInfo, text: string): OutlineNode {
  let nextId = 0;
  const add = (kind: OutlineKind, block: Block, head: Block | null, parent: MutableOutlineNode | null): MutableOutlineNode => {
    const startLine = kind === 'root' ? 0 : block.startLine;
    const headEndLine = head ? head.endLine : startLine;
    const node: MutableOutlineNode = {
      id: nextId++,
      kind,
      block,
      head,
      parent,
      children: [],
      depth: parent ? parent.depth + 1 : 0,
      startLine,
      headEndLine,
      endLine: kind === 'item' || kind === 'quote' ? block.endLine : headEndLine,
    };
    if (parent) parent.children.push(node);
    // a section, and the root, end where their last descendant does
    for (let p = parent; p && p.endLine < node.endLine; p = p.parent) p.endLine = node.endLine;
    return node;
  };

  /** Adds a container's child blocks under `owner`, forming heading sections. */
  const addBlocks = (blocks: readonly Block[], owner: MutableOutlineNode): void => {
    const sections: MutableOutlineNode[] = [];
    // the paragraph a list right after it would belong to, in a section
    let paragraph: MutableOutlineNode | null = null;
    for (const b of blocks) {
      if (b.type === 'heading') {
        while (sections.length > 0 && sections[sections.length - 1]!.block.level! >= b.level!) sections.pop();
        const heading = add('heading', b, b, sections[sections.length - 1] ?? owner);
        sections.push(heading);
        paragraph = null;
        continue;
      }
      const parent = sections[sections.length - 1] ?? owner;
      if (b.type === 'list') {
        // every list right after the paragraph is its own, consecutive lists included
        for (const item of b.children) addItem(item, paragraph ?? parent);
      } else if (b.type === 'paragraph') {
        const node = add('paragraph', b, b, parent);
        paragraph = owner.kind === 'item' || owner.kind === 'quote' ? null : node;
      } else if (b.type === 'blockquote') {
        addQuote(b, parent);
        paragraph = null;
      } else if (ATOMS.has(b.type)) {
        add('atom', b, b, parent);
        paragraph = null;
      }
    }
  };

  const addQuote = (quote: Block, parent: MutableOutlineNode): void => {
    // a callout's title line is its text: a title block where the flavor has callouts, else the
    // first paragraph when it starts with `[!type]`
    const first = quote.children[0];
    const title =
      first?.type === 'callout_title' ||
      (first?.type === 'paragraph' && /^[ \t]*\[![^\]]*\]/.test(text.slice(line(first.startLine).contentFrom, line(first.startLine).to)))
        ? first
        : null;
    const node = add('quote', quote, title, parent);
    addBlocks(title ? quote.children.slice(1) : quote.children, node);
  };

  const addItem = (item: Block, parent: MutableOutlineNode): void => {
    const first = item.children[0];
    const head = first && HEADS.has(first.type) ? first : null;
    const node = add('item', item, head, parent);
    addBlocks(head ? item.children.slice(1) : item.children, node);
  };

  const root = add('root', document, null, null);
  addBlocks(document.children, root);
  return root;
}

/** The nodes of an outline in document order, root first. */
export function outlineNodes(root: OutlineNode): OutlineNode[] {
  const out: OutlineNode[] = [];
  const visit = (node: OutlineNode): void => {
    out.push(node);
    node.children.forEach(visit);
  };
  visit(root);
  return out;
}

/** The node whose own text (head) contains `line`, or null for lines outside any head. */
export function headOwners(nodes: readonly OutlineNode[], lineCount: number): (OutlineNode | null)[] {
  const owners: (OutlineNode | null)[] = new Array(lineCount).fill(null);
  // document order, so deeper nodes sharing a line (`- - a`) overwrite their parents
  for (const node of nodes) {
    if (node.kind === 'root') continue;
    for (let lineNo = node.startLine; lineNo <= node.headEndLine; lineNo++) owners[lineNo] = node;
  }
  return owners;
}
