// The flavors ourus ships, by name: what a config's `flavor` option names.

import { commonmark, defineFlavor, type MdFlavor as FlavorRules } from './flavor.ts';
import { gfm } from './gfm.ts';
import { obsidian } from './obsidian.ts';

/** A Markdown dialect: CommonMark and the extensions it adds (see `defineFlavor` for new ones). */
export type MdFlavor = FlavorRules;

/** The flavors ourus ships, and the one a config names. */
export const MdFlavor = {
  /** CommonMark 0.31.2. */
  commonmark,
  /** GitHub Flavored Markdown, as cmark-gfm reads it. */
  gfm,
  /** Obsidian's Markdown: GFM plus callouts, wikilinks, tags, math, comments, ... */
  obsidian,
  /** The flavor a config's `flavor` option names. */
  named(name: 'commonmark' | 'gfm' | 'obsidian'): MdFlavor {
    return name === 'gfm' ? gfm : name === 'obsidian' ? obsidian : commonmark;
  },
  /** `flavor` without its extension `name` (itself where it has none), built once. */
  without(flavor: MdFlavor, name: string): MdFlavor {
    if (!flavor.has(name)) return flavor;
    const key = `${flavor.name} without ${name}`;
    let built = withouts.get(flavor)?.get(key);
    if (!built) {
      built = defineFlavor(key, flavor.extensions.filter((e) => e.name !== name));
      if (!withouts.has(flavor)) withouts.set(flavor, new Map());
      withouts.get(flavor)!.set(key, built);
    }
    return built;
  },
} as const;

const withouts = new WeakMap<MdFlavor, Map<string, MdFlavor>>();
