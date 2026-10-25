// The parser: Markdown of a flavor to a lossless, incrementally updated syntax tree. What the rest of
// ourus, and a host, use of it; extension authors also import `extend.ts`.
//
//   const tree = MdTree.parse(text, MdFlavor.gfm);
//   tree.root, tree.line(i), tree.markup(i)        // blocks (stored, shared between snapshots), lines, a line's markup and text
//   tree.line(i).leaf, at.children(), tree.rootAt  // a block where it is: `MdBlockAt`, the block and its first line
//   tree.inlines(leaf), tree.inlineText(leaf)      // a leaf's inlines, parsed when asked for
//   const next = tree.update(changes);             // reads again only what the changes can affect
//   tree.renderHtml()                              // HTML, as commonmark.js and cmark-gfm write it
//   MdHtmlParser.parse(html).markdown             // HTML (a clipboard's) as the Markdown that says it

export { MdTree, type MdParseOptions, type MdReread } from './syntax.ts';
export { MdFlavor } from './flavors.ts';
export { mdCalloutAt } from './obsidian.ts';
export type { MdHtmlOptions } from './html.ts';
export { MdHtmlParser, type MdHtmlParsed } from './html-parser.ts';
export { MdBlockAt } from './tree.ts';
export type { MdEscapeAt, MdEscapedParagraph, MdLineContext, MdParagraphPlace } from './readback.ts';
export type { MdAttrs, MdBlock, MdCallout, MdInline, MdInlineText, MdMark, MdLine, MdLineMarkup, MdList, MdPrefixPiece, MdTableAlign, MdTask } from './types.ts';
