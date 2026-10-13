// The outline: a Markdown text read as an outline of nodes, as an immutable snapshot.
//
//   const state = OutlineState.parse(text, { config: { flavor: 'obsidian' } });
//   state.root.children, state.nodeAt(pos), state.headLines(node)
//   const next = state.update(changes, { caret });   // ids carried, an emptied node kept

export { OutlineState, type OutlineUpdateParams } from './state.ts';
export type { OutlineKind, OutlineNode } from './build.ts';
