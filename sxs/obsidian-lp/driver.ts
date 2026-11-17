// Obsidian as it comes, no plugins, in Live Preview, its default editing mode, which draws the markup; the
// driver is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { inCheckbox, obsidianDriver } from '../obsidian/obsidian.ts';

// (the markup it draws, the caret kept out of it: its checkboxes; the rest, a marker too, is text the keys edit (the caret placed inside each element, 2026-11-16))
export const driver = obsidianDriver({ shortId: 'LP', longId: 'obsidian-lp', displayName: 'Obsidian (Live Preview)', mode: 'live-preview', holds: inCheckbox, behaves: { decorations: ['checkbox', 'table'] } });
