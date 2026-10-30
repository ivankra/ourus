// The document layer: a Markdown text read as an outline: the snapshot with its
// placeholders, its parse and its outline, each node's text and frame, and where a position is. What
// edits it is `writer/`'s.
//
//   const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' }, marks });
//   const next = doc.update({ changes, caret });       // a host's edit: placeholders mapped, nodes off its path shared
//   next.rootNode.children, next.nodeAtLine(line), next.node(id), next.textOf(node), next.locate(pos)

export { OurusDoc, Lineage, type OurusDocUpdate } from './doc.ts';
export { OurusNode, PersistentNode } from './node.ts';
export type { Located } from './locate.ts';
export { checkBlockIds, blockIdTargetOf, type BlockId, type BlockIdTarget, type BlockIdStray, type BlockIdDeclarations, type BlockIdAllowances } from './block-ids.ts';
export { escapeParagraph } from './escapes.ts';
export { OurusProse, OurusAtom, textEnd, textStart, isClosingPart, closingFrameStart, blockIdsOf, withoutBlockIds, isBlockIdName, reBlockIdLine, type OurusText, type OurusProseType, type FramePart, type AtomFramePart, type BlockIdSyntax, type BlockIdLine, type TextBlockId } from './text.ts';
export { outlineChildren, type OurusNodeKind, type FlatChild, type OutlineChild } from './rules.ts';
