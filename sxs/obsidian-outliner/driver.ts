// Obsidian with Outliner (vslinko/obsidian-outliner, a community plugin), at its defaults; the driver
// is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { keepsCaretOnText, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({
  shortId: 'OO',
  longId: 'obsidian-outliner',
  displayName: 'Obsidian (Outliner)',
  mode: 'live-preview',
  plugins: [{ id: 'obsidian-outliner', version: '4.10.2' }],
  // "Move list item up" and "Move list item down": the item with its children
  keys: { moveSubtreeUp: 'Control+Shift+ArrowUp', moveSubtreeDown: 'Control+Shift+ArrowDown' },
  // "stick the cursor to the content" (`stickCursor`)
  holds: keepsCaretOnText('Outliner', { checkbox: true }),
  // its Shift-Tab, and Enter on an empty item, outdent logically
  behaves: {
    outdent: 'logical',
    enterSplitSpace: 'start',
    joinWithChildren: 'refuse',
    emptyItemWithChildren: 'refuse',
  },
});
