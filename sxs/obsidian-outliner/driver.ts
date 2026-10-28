// Obsidian with Outliner (vslinko/obsidian-outliner, a community plugin) and Zoom (vslinko/obsidian-zoom,
// its author's, which Outliner reads), at their defaults; the driver is Obsidian's
// (../obsidian/obsidian.ts), README.md has the notes.

import { keepsCaretOnText, obsidianDriver } from '../obsidian/obsidian.ts';
import type { TextDoc } from '../lib/text.ts';

/** "Stick the cursor to the content" (`stickCursor`): where the caret goes off a bullet or a checkbox. */
const onText = keepsCaretOnText('Outliner', { checkbox: true });

/**
 * Where Zoom can't zoom (`CalculateRangeForZooming`): into a line that is no list item and that
 * CodeMirror's `foldable` gives no range for, a code block's fence, and here a heading too (Obsidian
 * folds headings, but not through `foldable`: measured, Zoom's own `zoomIn` there zooms nothing).
 */
function zoomable(doc: TextDoc): string | undefined {
  if (!doc.view || doc.view.zoom === null) return undefined;
  const line = doc.text.split('\n')[doc.view.zoom] ?? '';
  return /^\s*([-*+]|\d+\.)\s+/.test(line) ? undefined : 'a zoom into a line that is no list item, where Zoom has no range';
}

export const driver = obsidianDriver({
  shortId: 'OO',
  longId: 'obsidian-outliner',
  displayName: 'Obsidian (Outliner)',
  mode: 'live-preview',
  plugins: [
    { id: 'obsidian-outliner', version: '4.10.2' },
    { id: 'obsidian-zoom', version: '1.1.2' },
  ],
  // its drag and drop (`dnd`, on by default): an item by its bullet
  drag: 'outliner',
  // "Move list item up" and "Move list item down": the item with its children; "Fold the list" and
  // "Unfold the list", at their default hotkeys
  keys: {
    moveSubtreeUp: 'Control+Shift+ArrowUp',
    moveSubtreeDown: 'Control+Shift+ArrowDown',
    fold: 'Control+ArrowUp',
    unfold: 'Control+ArrowDown',
    // Zoom's "Zoom in", "Zoom out the entire document" (no zoom out a level), at their default hotkeys
    zoomIn: 'Control+Period',
    clearZoom: 'Control+Shift+Period',
  },
  zoom: 'obsidian-zoom',
  // "stick the cursor to the content" (`stickCursor`)
  holds: (doc) => onText(doc) ?? zoomable(doc),
  // its Shift-Tab, and Enter on an empty item, outdent logically
  behaves: {
    outdent: 'logical',
    enterSplitSpace: 'start',
    joinWithChildren: 'refuse',
    emptyItemWithChildren: 'refuse',
  },
});
