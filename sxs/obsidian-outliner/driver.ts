// Obsidian with Outliner (vslinko/obsidian-outliner, a community plugin), at its defaults; the driver
// is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { keepsCaretOnText, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({
  name: 'obsidian-outliner',
  title: 'Obsidian with Outliner',
  mode: 'live-preview',
  plugins: [{ id: 'obsidian-outliner', version: '4.10.2' }],
  // "Move list item up" and "Move list item down": the item with its children
  keys: { moveBlockUp: 'Control+Shift+ArrowUp', moveBlockDown: 'Control+Shift+ArrowDown' },
  // "stick the cursor to the content" (`stickCursor`)
  holds: keepsCaretOnText('Outliner', { checkbox: true }),
});
