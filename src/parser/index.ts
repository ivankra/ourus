// The parser: Markdown of a flavor to a lossless, incrementally updated syntax tree. What the rest of
// ourus, and a host, use of it; extension authors also import `extend.ts`.
//
//   const syntax = SyntaxTree.parse(text, Flavor.gfm);   // the line machine over every line
//   syntax.root, syntax.line(i), syntax.lines        // the block tree and line table, built when asked for
//   syntax.inlines(block), syntax.inlineText(block)   // a leaf's inlines, parsed when asked for, cached
//   const next = syntax.update(changes);              // reads again only what the changes can affect
//   renderHtml(syntax)                                // HTML, as commonmark.js / cmark-gfm write it

export { SyntaxTree, type ParseOptions, type Reread } from './syntax.ts';
export { Flavor } from './flavors.ts';
export { renderHtml, type HtmlOptions } from './html.ts';
export type { Block, Callout, InlineNode, InlineText, LineInfo, ListData, PrefixPiece, TableAlign, TaskMarker } from './types.ts';
