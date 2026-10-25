// What holds what: the outline's reading of the block tree, stated once: reading and the draft's
// normal form both nest by it (`outlineChildren`).
//
// Headings own their section within their container; list items are nodes (lists are not), owning
// their first block as their text where that holds text and every other block as a child; in the
// document's own sections (the root's or a heading's children, not inside an item or a quote), a
// paragraph owns the lists right after it (with or without a blank line between), whose items are its
// children; a quote is a container like an item, its blocks its children, with no text of its own but
// a callout's title (its title block where the flavor has callouts, else by the convention its first
// paragraph starting `[!type]`); every other block is an atom (code, HTML, a thematic break, a
// reference definition, a table, math, a comment, a footnote definition, an extension's), but
// frontmatter, which is a preamble: no node.

import { mdCalloutAt, type MdBlock, type MdFlavor } from '../parser/index.ts';

export type OutlineNodeKind = 'root' | 'heading' | 'item' | 'paragraph' | 'quote' | 'atom';


/** The kind of node a block of a container is read as, or null for one that is no node (a list, whose items are; frontmatter). */
export function nodeKindOf(block: MdBlock): Exclude<OutlineNodeKind, 'root'> | null {
  switch (block.type) {
    case 'heading':
      return 'heading';
    case 'paragraph':
      return 'paragraph';
    case 'blockquote':
      return 'quote';
    case 'list':
    case 'frontmatter':
      return null;
    default:
      return 'atom';
  }
}

/** An item's text: its first block, where that holds inline text or lines as written (a paragraph, a heading, code); else none. */
export function itemHead(item: MdBlock, flavor: MdFlavor): MdBlock | null {
  const first = item.children[0];
  if (!first) return null;
  const content = flavor.content(first.type);
  return content === 'inline' || content === 'verbatim' ? first : null;
}

/**
 * A quote's text, its callout's title: the flavor's title block, or a first paragraph whose first line
 * (`firstLine`, past its containers' prefix) starts `[!type]`; else none.
 */
export function quoteHead(quote: MdBlock, firstLine: () => string): MdBlock | null {
  const first = quote.children[0];
  if (first?.type === 'callout_title') return first;
  if (first?.type !== 'paragraph') return null;
  return mdCalloutAt(firstLine()) ? first : null;
}

/** One of a container's children as Markdown lays them out, flat, as the node it will be: its kind, and a heading's level. */
export interface FlatChild {
  readonly kind: OutlineNodeKind;
  /** A heading's level; anything for another kind. */
  readonly level: number;
}

/** A child as the outline has it: the entry, and the children it owns. */
export interface OutlineChild<T extends FlatChild> {
  readonly entry: T;
  readonly children: OutlineChild<T>[];
}

/**
 * A container's children (the document's, an item's, a quote's) as the outline has them, from the
 * flat run Markdown lays them out in: a heading owns what follows it up to one of its level or higher,
 * its section; where `paragraphsOwnLists` (in the document's own sections: the root's), a paragraph
 * owns the items of the lists right after it, consecutive lists included. Reading and the draft's
 * normal form both nest by it.
 */
export function outlineChildren<T extends FlatChild>(flat: readonly T[], paragraphsOwnLists: boolean): OutlineChild<T>[] {
  const top: OutlineChild<T>[] = [];
  const sections: OutlineChild<T>[] = [];
  let paragraph: OutlineChild<T> | null = null;
  for (const entry of flat) {
    const node: OutlineChild<T> = { entry, children: [] };
    if (entry.kind === 'heading') {
      while (sections.length && sections[sections.length - 1]!.entry.level >= entry.level) sections.pop();
      (sections[sections.length - 1]?.children ?? top).push(node);
      sections.push(node);
      paragraph = null;
      continue;
    }
    const parent = sections[sections.length - 1]?.children ?? top;
    if (entry.kind === 'item') {
      (paragraph?.children ?? parent).push(node);
      continue;
    }
    parent.push(node);
    paragraph = entry.kind === 'paragraph' && paragraphsOwnLists ? node : null;
  }
  return top;
}
