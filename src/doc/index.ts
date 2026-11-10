// The document layer: a Markdown text read as an outline: the snapshot with its
// placeholders, its parse and its outline, each node's text and frame, and where a position is. What
// edits it is `writer/`'s; what a reader sees of it, folded and zoomed, `view/`'s.
//
//   const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' }, marks });
//   const next = doc.update({ changes, caret });       // a host's edit: placeholders mapped, nodes off its path shared
//   next.rootNode.children, next.nodeAtLine(line), next.node(id), next.textOf(node), next.locateRaw(pos)

export { OurusDoc, type OurusDocUpdate } from './doc.ts';
export { Lineage } from './lineage.ts';
export { OurusNode, PersistentNode } from './node.ts';
export { nameOf, nodeName, withArticle } from './names.ts';
export type { Located } from './locate.ts';
export { startingAt } from './extent.ts';
export { VERBATIM, verbatimLinesOf } from './copy.ts';
export { clipboardFragment, clipboardSource, renderedHtml } from './clipboard.ts';
export { blockIdTargetOf, type BlockId, type BlockIdTarget, type BlockIdStray, type BlockIdDeclarations } from './block-ids.ts';
export { escapeParagraph, keepsEscape } from './escapes.ts';
export { validAuto } from './placeholders.ts';
export { OurusProse, OurusAtom, checkboxLength, textEnd, textStart, isClosingPart, closingFrameStart, blockIdsOf, withoutBlockIds, isBlockIdName, reBlockIdLine, type OurusText, type OurusProseType, type FramePart, type AtomFramePart, type BlockIdSyntax, type BlockIdLine, type TextBlockId } from './text.ts';
export { outlineChildren, type OurusNodeKind, type FlatChild, type OutlineChild } from './rules.ts';
