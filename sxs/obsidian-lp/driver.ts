// Obsidian as it comes, no plugins, in Live Preview, its default editing mode, which draws the markup; the
// driver is Obsidian's (../obsidian/obsidian.ts), README.md has the notes.

import { inCheckbox, obsidianDriver } from '../obsidian/obsidian.ts';

export const driver = obsidianDriver({ name: 'obsidian-lp', title: 'Obsidian (Live Preview)', id: 'LP', mode: 'live-preview', holds: inCheckbox });
