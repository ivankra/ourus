// The parsing layer: Markdown of a flavor to a lossless, incrementally updated syntax tree.
//
//   const syntax = Syntax.parse(text, gfm);         // the line machine over every line
//   syntax.root, syntax.lines                        // the block tree and line table, built when asked for
//   syntax.inlines(block), syntax.inlineText(block)  // a leaf's inlines, parsed when asked for, cached
//   const next = syntax.update(changes);             // reads again only what the changes can affect
//   renderHtml(syntax)                               // HTML, as commonmark.js / cmark-gfm write it

export { Syntax, type ParseOptions, type Reread } from './syntax.ts';
export { commonmark, commonMarkExtension, defineFlavor, type Extension, type Flavor, type LeafBuilder, type MutableBlock, type PlacedStart } from './flavor.ts';
export { autolink, footnotes, gfm, gfmCore, gfmExtensions, strikethrough, strikethroughExtension, table, tableExtension, tagfilter, tasklist, tasklistExtension } from './gfm.ts';
export {
  blockIds,
  callouts,
  commentBlocks,
  comments,
  frontmatter,
  highlights,
  inlineFootnotes,
  math,
  mathBlocks,
  obsidian,
  obsidianExtensions,
  tags,
  wikilinks,
} from './obsidian.ts';
export { HtmlRenderer, renderHtml, type BlockRenderer, type HtmlOptions, type InlineRenderer, type RenderRules } from './html.ts';
export { startsBlock } from './blocks.ts';
export { scanReference, type Reference } from './refs.ts';
export { InlineTextBuilder, paragraphText } from './inline-text.ts';
export type { BlockSpec, BlockStart, Frame, LeafRole, LineRecord, Machine, Piece, State } from './machine.ts';
export type { BracketRule, DelimiterRule, InlineParser, InlineRule, TextRule } from './inlines.ts';
export type { Block, Callout, Inline, InlineText, LineInfo, ListData, PrefixPiece, TableAlign, TaskMarker } from './types.ts';
export { inlinePreorder, postorder, preorder } from './walk.ts';
