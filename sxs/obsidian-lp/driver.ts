// Obsidian as it comes, no plugins, in Live Preview, its default editing mode, which draws the markup; the
// driver is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { inCheckbox, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({ shortId: 'LP', longId: 'obsidian-lp', displayName: 'Obsidian (Live Preview)', mode: 'live-preview', holds: inCheckbox });
