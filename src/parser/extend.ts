// For extension authors: what defining a flavor needs, beyond the parser's public API (`index.ts`).
// The line machine's rules, the inline parser's rules, the HTML renderer's hooks, and every
// extension ourus ships, to build on.
//
//   const mine = defineFlavor('mine', [...gfmExtensions, myExtension]);

export * from './index.ts';
export { commonmark, commonMarkExtension, defineFlavor, type MdExtension, type MdLeafBuilder, type MdMutableBlock, type MdPlacedStart } from './flavor.ts';
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
export { MdHtmlRenderer, type MdBlockRenderer, type MdInlineRenderer, type MdRenderRules } from './html.ts';
export { scanReference, type MdReference } from './refs.ts';
export { MdInlineTextBuilder, paragraphText } from './inline-text.ts';
export type { MdBlockSpec, MdBlockStart, MdFrame, MdLeafRole, MdLineRecord, MdMachine, MdPiece, MdState } from './machine.ts';
export type { MdBracketRule, MdDelimiterRule, MdInlineParser, MdInlineRule, MdTextRule } from './inlines.ts';
export { inlinePreorder } from './walk.ts';
