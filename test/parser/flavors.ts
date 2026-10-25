// The flavors the property tests run under.

import { commonmark, type MdFlavor } from '../../src/parser/flavor.ts';
import { gfm } from '../../src/parser/gfm.ts';
import { obsidian } from '../../src/parser/obsidian.ts';

export const FLAVORS: Record<string, MdFlavor> = { commonmark, gfm, obsidian };
