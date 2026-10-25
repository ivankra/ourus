// The document layer: a Markdown text read as an outline: the snapshot with its
// placeholders, its parse and its outline, each node's text and frame, and where a position is. What
// edits it is `draft/`'s.
//
//   const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' }, marks });
//   const next = doc.update(changes, { caret });       // a host's edit: placeholders mapped, nodes off its path shared
//   next.rootNode.children, next.nodeAtLine(line), next.node(id), next.textOf(node), next.locate(pos)

export { OurusDoc, type DocUpdateParams } from './doc.ts';
export { OutlineNode } from './node.ts';
export { OutlineNodePersistent } from './outline.ts';
export type { Located } from './locate.ts';
export { escapeParagraph } from './escapes.ts';
export { ProseText, AtomText, type OutlineNodeText, type ProseTextType, type FramePart, type AtomFramePart } from './text.ts';
export { outlineChildren, type OutlineNodeKind, type FlatChild, type OutlineChild } from './rules.ts';
