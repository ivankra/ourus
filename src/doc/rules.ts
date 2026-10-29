// What holds what: the outline's reading of the block tree, stated once: reading and the draft's
// normal form both nest by it (`outlineChildren`).
//
// Headings own their section within their container; list items are nodes (lists are not), owning
// their first block as their text where that holds text and every other block as a child; in the
// document's own sections (the root's or a heading's children, not inside an item or a quote), a
// paragraph owns the lists right after it (with or without a blank line between), whose items are
// its children, or any block but a heading and a container, or none, as `OurusConfig.listParent`
// says; a quote is a container like an item, its blocks its children, with no text of its own but a
// callout's title (its title block where the flavor has callouts, else by the convention its first
// paragraph starting `[!type]`), or, as `OurusConfig.quotes` says, a paragraph framed by `> `
// (`text`, a quote of one paragraph) or an atom (`atom`, any quote, a callout too); every other
// block is an atom (code, HTML, a thematic break, a reference definition, a table, math, a comment,
// a footnote definition, an extension's), but frontmatter, which is a preamble: no node.

import type { OurusConfig } from '../config.ts';
import { mdCalloutAt, type MdBlock, type MdFlavor } from '../parser/index.ts';

export type OurusNodeKind = 'root' | 'heading' | 'item' | 'paragraph' | 'quote' | 'atom';


/**
 * How a quote reads as `quotes` says, `firstLine` its first line's content (past every container's
 * prefix, its own `>` too): a paragraph framed by `> ` (`text`, a quote holding one paragraph from its first line,
 * blank lines in it after that the paragraph's gap), an atom (`atom`, a callout too), or a container (a callout but under `atom`).
 */
export function quoteKind(quote: MdBlock, quotes: OurusConfig['quotes'], firstLine: () => string): 'paragraph' | 'atom' | 'quote' {
  // (under `atom` a callout is one too: its lines as written)
  if (quotes === 'atom') return 'atom';
  if (quotes === 'container' || quote.children[0]?.type === 'callout_title' || mdCalloutAt(firstLine())) return 'quote';
  // (the blank lines in it after the paragraph are its gap: `> a⏎>` reads as `> a⏎`)
  const only = quote.children.length === 1 ? quote.children[0]! : null;
  return only?.type === 'paragraph' && quote.offsets[0] === 0 ? 'paragraph' : 'quote';
}

/**
 * The kind of node a block of a container is read as, or null for one that is no node (a list, whose
 * items are; frontmatter). A quote's as `quoteKind` says.
 */
export function nodeKindOf(block: MdBlock, quotes: OurusConfig['quotes'], firstLine: () => string): Exclude<OurusNodeKind, 'root'> | null {
  switch (block.type) {
    case 'heading':
      return 'heading';
    case 'paragraph':
      return 'paragraph';
    case 'blockquote':
      return quoteKind(block, quotes, firstLine);
    case 'list':
    case 'frontmatter':
      return null;
    default:
      return 'atom';
  }
}

/**
 * An item's text: its first block, where that holds inline text or lines as written (a paragraph, a
 * heading, code) or is an atom (a table, a thematic break, a definition: an atom is its own text), or a
 * quote on its marker's line that `quoteKind` makes a text or an atom (`- > q`; `firstLine` that line
 * past the item's marker); else none (a list, a quote that is a container).
 */
export function itemHead(item: MdBlock, flavor: MdFlavor, quotes: OurusConfig['quotes'], firstLine: () => string): MdBlock | null {
  const first = item.children[0];
  if (!first) return null;
  if (first.type === 'blockquote') {
    const kind = item.offsets[0] === 0 ? quoteKind(first, quotes, firstLine) : 'quote';
    return kind === 'atom' ? first : kind === 'paragraph' ? first.children[0]! : null;
  }
  const content = flavor.content(first.type);
  return content === 'inline' || content === 'verbatim' || nodeKindOf(first, quotes, firstLine) === 'atom' ? first : null;
}

/**
 * A quote's text, its callout's title: the flavor's title block, or a first paragraph on the quote's
 * first line whose first line (`firstLine`, past its containers' prefix) starts `[!type]`; else none
 * (a callout is the quote's opening line's only: `>⏎>[!e]` is a quote of a paragraph).
 */
export function quoteHead(quote: MdBlock, firstLine: () => string): MdBlock | null {
  const first = quote.children[0];
  if (first?.type === 'callout_title') return first;
  if (first?.type !== 'paragraph' || quote.offsets[0] !== 0) return null;
  return mdCalloutAt(firstLine()) ? first : null;
}

/** One of a container's children as Markdown lays them out, flat, as the node it will be: its kind, and a heading's level. */
export interface FlatChild {
  readonly kind: OurusNodeKind;
  /** A heading's level; anything for another kind. */
  readonly level: number;
}

/** A child as the outline has it: the entry, and the children it owns. */
export interface OutlineChild<T extends FlatChild> {
  readonly entry: T;
  readonly children: OutlineChild<T>[];
}

/**
 * The kinds of node that adopt the list right after them in the document's own sections, as
 * `OurusConfig.listParent` says: a paragraph (a quote of one paragraph is one, `quotes: text`); any
 * block but a heading, which owns its section, and a quote that is a container, whose children are
 * inside it (a paragraph, an atom: code, a table, a quote atom); none.
 */
export function listAdopters(listParent: OurusConfig['listParent']): ReadonlySet<OurusNodeKind> {
  return listParent === 'paragraph' ? PARAGRAPHS : listParent === 'block' ? BLOCKS : NONE;
}
const NONE: ReadonlySet<OurusNodeKind> = new Set();
const PARAGRAPHS: ReadonlySet<OurusNodeKind> = new Set(['paragraph']);
const BLOCKS: ReadonlySet<OurusNodeKind> = new Set(['paragraph', 'atom']);

/**
 * A container's children (the document's, an item's, a quote's) as the outline has them, from the
 * flat run Markdown lays them out in: a heading owns what follows it up to one of its level or higher,
 * its section; in the document's own sections (`root`: the root's), a node of the kinds
 * `config.listParent` says (`listAdopters`) owns the items of the lists right after it, consecutive
 * lists included. Reading and the draft's normal form both nest by it.
 */
export function outlineChildren<T extends FlatChild>(flat: readonly T[], root: boolean, config: Pick<OurusConfig, 'listParent'>): OutlineChild<T>[] {
  const adopters = root ? listAdopters(config.listParent) : NONE;
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
    paragraph = adopters.has(entry.kind) ? node : null;
  }
  return top;
}
