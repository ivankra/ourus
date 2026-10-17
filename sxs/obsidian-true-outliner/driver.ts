// Obsidian with true-outliner (laughedelic/obsidian-true-outliner, a GitHub release), in outline mode,
// its default for every note; the driver is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { keepsCaretOnText, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({
  name: 'obsidian-true-outliner',
  title: 'Obsidian with true-outliner',
  mode: 'live-preview',
  plugins: [{ repo: 'https://github.com/laughedelic/obsidian-true-outliner', version: '0.14.4' }],
  pluginData: { 'true-outliner': { outlineByDefault: true } },
  // "Move node up" and "Move node down": the item with its children
  keys: { moveSubtreeUp: 'Control+Shift+ArrowUp', moveSubtreeDown: 'Control+Shift+ArrowDown' },
  // its caret is outline-aware: an item's text starts after every space following its marker
  holds: keepsCaretOnText('true-outliner', { spaces: true }),
  // not measured against ourus's options but one: Enter mid-text keeps the children with the first
  // half (E7)
  behaves: { enterAtTextStart: undefined, taskEditing: undefined, deleteAtGap: undefined, enterOnEmptyItem: undefined, enterMidItem: 'child', pasteStructuredMidText: 'after', pasteStructuredListForm: 'own', pasteStructuredParagraphList: 'children' },
});
