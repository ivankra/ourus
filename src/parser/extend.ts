// For extension authors: what defining a flavor needs, beyond the parser's public API (`index.ts`).
// The line machine's rules, the inline parser's rules, the HTML renderer's hooks, and every
// extension ourus ships, to build on.
//
//   const mine = defineFlavor('mine', [...gfmExtensions, myExtension]);

export * from './index.ts';
export { commonmark, commonMarkExtension, defineFlavor, type Extension, type LeafBuilder, type MutableBlock, type PlacedStart } from './flavor.ts';
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
export { HtmlRenderer, type BlockRenderer, type InlineRenderer, type RenderRules } from './html.ts';
export { startsBlock } from './blocks.ts';
export { scanReference, type Reference } from './refs.ts';
export { InlineTextBuilder, paragraphText } from './inline-text.ts';
export type { BlockSpec, BlockStart, Frame, LeafRole, LineRecord, Machine, Piece, State } from './machine.ts';
export type { BracketRule, DelimiterRule, InlineParser, InlineRule, TextRule } from './inlines.ts';
export { inlinePreorder, postorder, preorder } from './walk.ts';
