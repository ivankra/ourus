// The flavors ourus ships, by name: what a config's `flavor` option names.

import { commonmark, type Flavor as FlavorRules } from './flavor.ts';
import { gfm } from './gfm.ts';
import { obsidian } from './obsidian.ts';

/** A Markdown dialect: CommonMark and the extensions it adds (see `defineFlavor` for new ones). */
export type Flavor = FlavorRules;

export const Flavor = {
  /** CommonMark 0.31.2. */
  commonmark,
  /** GitHub Flavored Markdown, as cmark-gfm reads it. */
  gfm,
  /** Obsidian's Markdown: GFM plus callouts, wikilinks, tags, math, comments, ... */
  obsidian,
  /** The flavor a config's `flavor` option names. */
  named(name: 'commonmark' | 'gfm' | 'obsidian'): Flavor {
    return name === 'gfm' ? gfm : name === 'obsidian' ? obsidian : commonmark;
  },
} as const;
