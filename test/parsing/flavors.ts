// The flavors the property tests run under.

import { commonmark, type Flavor } from '../../src/parsing/flavor.ts';
import { gfm } from '../../src/parsing/gfm.ts';
import { obsidian } from '../../src/parsing/obsidian.ts';

export const FLAVORS: Record<string, Flavor> = { commonmark, gfm, obsidian };
