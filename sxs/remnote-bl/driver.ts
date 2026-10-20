// RemNote with its documents' bullets, its default: every rem an item, as the other block apps' blocks.
// The driver is RemNote's (../remnote/driver.ts, whose own setup hides the bullets), README.md has the
// notes.

import { remnoteDriver } from '../remnote/driver.ts';

export const driver = remnoteDriver({ shortId: 'RB', longId: 'remnote-bl', displayName: 'RemNote (bl)' });
