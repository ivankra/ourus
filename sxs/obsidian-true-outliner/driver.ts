// Obsidian with true-outliner (laughedelic/obsidian-true-outliner, a GitHub release), in outline mode,
// its default for every note; the driver is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { keepsCaretOnText, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({
  shortId: 'TO',
  longId: 'obsidian-true-outliner',
  displayName: 'Obsidian (true-outliner)',
  mode: 'live-preview',
  plugins: [{ repo: 'https://github.com/laughedelic/obsidian-true-outliner', version: '0.14.4' }],
  pluginData: { 'true-outliner': { outlineByDefault: true } },
  // its drag and drop: any node by its mark
  drag: 'true-outliner',
  // "Move node up" and "Move node down": the item with its children; "Fold node", "Unfold node" and
  // "Toggle fold" at their default hotkeys; its zoom's three, which have none, bound here
  keys: {
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    fold: 'Control+Alt+ArrowUp',
    unfold: 'Control+Alt+ArrowDown',
    toggleFold: 'Control+Alt+Period',
    zoomIn: 'Control+Alt+i',
    zoomOut: 'Control+Alt+o',
    clearZoom: 'Control+Alt+Shift+o',
  },
  hotkeys: {
    'true-outliner:toggle-fold': [{ modifiers: ['Mod', 'Alt'], key: '.' }],
    'true-outliner:zoom-in': [{ modifiers: ['Mod', 'Alt'], key: 'I' }],
    'true-outliner:zoom-out': [{ modifiers: ['Mod', 'Alt'], key: 'O' }],
    'true-outliner:zoom-clear': [{ modifiers: ['Mod', 'Alt', 'Shift'], key: 'O' }],
  },
  zoom: 'true-outliner',
  // its caret is outline-aware: an item's text starts after every space following its marker
  holds: keepsCaretOnText('true-outliner', { spaces: true }),
  // not measured against ourus's options but two: Enter mid-text keeps the children with the first
  // half (E7); Backspace on a task acts as `taskEditing: block`, an empty task gone in one press, a
  // task joined into the node above; paste, as measured, makes a
  // paragraph's list its children and keeps a list's form
  behaves: {
    // indent and outdent over roots at two depths: each run as alone, all or nothing
    mixedDepths: 'each',
    enterOnEmptyItem: undefined,
    enterMidItem: 'child',
    enterAtTextStart: undefined,
    taskEditing: 'block',
    pasteParagraphList: 'children',
    pasteListForm: 'own',
  },
});
