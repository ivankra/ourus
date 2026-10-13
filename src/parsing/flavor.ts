// Flavors: a Markdown dialect as a list of extensions, compiled once into the rules the parsers run.
// CommonMark itself is the first extension of every flavor here, so a flavor is CommonMark plus
// whatever it adds (`gfm.ts`, `obsidian.ts`); a dialect that changes CommonMark's own rules
// (Pandoc's list markers, say) replaces or wraps them by name.

import { DOCUMENT_FRAME, PARAGRAPH, commonMarkStarts, isCommonMarkStartChar, newParagraph } from './blocks.ts';
import { compileInlines, type BracketRule, type DelimiterRule, type InlineConfig, type InlineRule, type TextRule } from './inlines.ts';
import { commonMarkBrackets, commonMarkDelimiters, commonMarkInlines } from './inline-rules.ts';
import { coreInlineText } from './inline-text.ts';
import type { BlockSpec, BlockStart, Frame, LeafRole } from './machine.ts';
import type { RenderRules } from './html.ts';
import type { Block, InlineText } from './types.ts';
import type { Syntax } from './syntax.ts';

/** A block start placed in the order of precedence: before or after the start with that name (default: last). */
export interface PlacedStart extends BlockStart {
  readonly before?: string;
  readonly after?: string;
}

/** A block under construction in the tree builder; a leaf builder adds its parts. */
export interface MutableBlock {
  type: string;
  startLine: number;
  endLine: number;
  children: MutableBlock[];
  parent: MutableBlock | null;
  [attribute: string]: unknown;
}

/** Builds a leaf's parts (a table's rows and cells) as its lines come. */
export interface LeafBuilder {
  line(block: MutableBlock, role: LeafRole, line: number): void;
}

/** A leaf type's inline text: the source ranges its inlines are parsed from (null: none). */
export type InlineTextOf = (syntax: Syntax, block: Block) => InlineText | null;

export interface Extension {
  readonly name: string;
  /** Block starts, placed among CommonMark's. */
  readonly blockStarts?: readonly PlacedStart[];
  /** Characters this extension's block starts can begin with (block starts are only tried at those). */
  readonly blockStartChars?: string;
  /** Builders for leaves with parts, by block type. */
  readonly leafBuilders?: Readonly<Record<string, LeafBuilder>>;
  /** How to find the inline text of blocks of these types. */
  readonly inlineText?: Readonly<Record<string, InlineTextOf>>;
  readonly inlines?: readonly InlineRule[];
  readonly delimiters?: readonly DelimiterRule[];
  readonly brackets?: readonly BracketRule[];
  readonly textRules?: readonly TextRule[];
  /** HTML rendering for the extension's nodes, and options of the renderer. */
  readonly render?: RenderRules;
  /** Rule names of the extensions before it that this one takes out (a dialect without some syntax). */
  readonly remove?: readonly string[];
}

export interface Flavor {
  readonly name: string;
  readonly extensions: readonly Extension[];
  // block parsing
  readonly paragraph: BlockSpec;
  newParagraph(): Frame;
  readonly initialState: readonly Frame[];
  readonly blockStarts: readonly BlockStart[];
  blockStartChars(c: number): boolean;
  readonly leafBuilders: ReadonlyMap<string, LeafBuilder>;
  readonly inlineText: ReadonlyMap<string, InlineTextOf>;
  // inline parsing
  readonly inline: InlineConfig;
  // rendering
  readonly render: RenderRules;
  /** Whether the flavor includes the extension of this name. */
  has(extension: string): boolean;
}

/** CommonMark 0.31.2. */
export const commonMarkExtension: Extension = {
  name: 'commonmark',
  blockStarts: commonMarkStarts,
  inlineText: coreInlineText,
  inlines: commonMarkInlines,
  delimiters: commonMarkDelimiters,
  brackets: commonMarkBrackets,
};

/** Compiles extensions into a flavor. CommonMark comes first unless the list starts with it already. */
export function defineFlavor(name: string, extensions: readonly Extension[]): Flavor {
  const all = extensions[0] === commonMarkExtension ? extensions : [commonMarkExtension, ...extensions];
  const removed = new Set(all.flatMap((e) => e.remove ?? []));

  const starts: BlockStart[] = [];
  const extraChars = new Set<number>();
  const leafBuilders = new Map<string, LeafBuilder>();
  const inlineText = new Map<string, InlineTextOf>();
  const inlines: InlineRule[] = [];
  const delimiters: DelimiterRule[] = [];
  const brackets: BracketRule[] = [];
  const textRules: TextRule[] = [];
  let render: RenderRules = {};
  for (const ext of all) {
    for (const s of ext.blockStarts ?? []) {
      if (removed.has(s.name)) continue;
      const anchor = s.before ?? s.after;
      const at = anchor ? starts.findIndex((x) => x.name === anchor) : -1;
      if (at < 0) starts.push(s);
      else starts.splice(s.before ? at : at + 1, 0, s);
    }
    for (const ch of ext.blockStartChars ?? '') extraChars.add(ch.charCodeAt(0));
    for (const [type, b] of Object.entries(ext.leafBuilders ?? {})) leafBuilders.set(type, b);
    for (const [type, t] of Object.entries(ext.inlineText ?? {})) inlineText.set(type, t);
    for (const r of ext.inlines ?? []) if (!removed.has(r.name)) inlines.push(r);
    for (const d of ext.delimiters ?? []) delimiters.push(d);
    for (const b of ext.brackets ?? []) if (!removed.has(b.name)) brackets.push(b);
    for (const t of ext.textRules ?? []) if (!removed.has(t.name)) textRules.push(t);
    if (ext.render) render = mergeRender(render, ext.render);
  }
  const names = new Set(all.map((e) => e.name));
  const chars = new Uint8Array(65536);
  for (let c = 0; c < 128; c++) if (isCommonMarkStartChar(c)) chars[c] = 1;
  for (const c of extraChars) chars[c] = 1;
  return {
    name,
    extensions: all,
    paragraph: PARAGRAPH,
    newParagraph,
    initialState: [DOCUMENT_FRAME],
    blockStarts: starts,
    blockStartChars: (c) => chars[c] === 1,
    leafBuilders,
    inlineText,
    inline: compileInlines(inlines, delimiters, brackets, textRules),
    render,
    has: (extension) => names.has(extension),
  };
}

function mergeRender(a: RenderRules, b: RenderRules): RenderRules {
  return {
    ...a,
    ...b,
    blocks: { ...a.blocks, ...b.blocks },
    inlines: { ...a.inlines, ...b.inlines },
  };
}

export const commonmark: Flavor = defineFlavor('commonmark', [commonMarkExtension]);
