// Obsidian as it comes, no plugins, in Source mode: the text as it is (obsidian.ts has the driver,
// README.md the notes; ../obsidian-lp/ is the same in Live Preview).

import { obsidianDriver } from './obsidian.ts';

export const driver = obsidianDriver({ shortId: 'OB', longId: 'obsidian', displayName: 'Obsidian', mode: 'source' });
