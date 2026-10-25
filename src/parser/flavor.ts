// Flavors: a Markdown dialect as a list of extensions, compiled once into the rules the parsers run.
// CommonMark itself is the first extension of every flavor here, so a flavor is CommonMark plus
// whatever it adds (`gfm.ts`, `obsidian.ts`); a dialect that changes CommonMark's own rules
// (Pandoc's list markers, say) replaces or wraps them by name.

import { DOCUMENT_FRAME, PARAGRAPH, commonMarkStarts, isCommonMarkStartChar, newParagraph } from './blocks.ts';
import { compileInlines, type MdBracketRule, type MdDelimiterRule, type InlineConfig, type MdInlineRule, type MdTextRule } from './inlines.ts';
import { commonMarkBrackets, commonMarkDelimiters, commonMarkInlines } from './inline-rules.ts';
import { coreInlineText } from './inline-text.ts';
import { coreLineMarkup, type MdLineMarkupOf } from './markup.ts';
import type { MdBlockSpec, MdBlockStart, MdFrame, MdLeafRole } from './machine.ts';
import type { MdRenderRules } from './html.ts';
import { escapeParagraph, firstNonParagraph, markupEscapeAt, markupEscapes, type MdEscapeAt, type MdEscapedParagraph, type MdLineContext, type MdParagraphPlace } from './readback.ts';
import type { MdBlock, MdBlockAt, MdInlineText } from './types.ts';
import type { MdTree } from './syntax.ts';

/** A block start placed in the order of precedence: before or after the start with that name (default: last). */
export interface MdPlacedStart extends MdBlockStart {
  readonly before?: string;
  readonly after?: string;
}

/** A block under construction in the tree builder; a leaf builder adds its parts. */
export interface MdMutableBlock {
  type: string;
  startLine: number;
  endLine: number;
  children: MdMutableBlock[];
  parent: MdMutableBlock | null;
  [attribute: string]: unknown;
}

/**
 * Builds a leaf's parts (a table's rows and cells) as its lines come, adding them to the leaf's
 * children. The leaf's own attributes come from its first line's role; a builder doesn't set them.
 */
export interface MdLeafBuilder {
  line(block: MdMutableBlock, role: MdLeafRole, line: number): void;
}

/**
 * What a block holds: other blocks (`blocks`: the document, quotes, lists, items), text parsed as
 * inlines (`inline`: paragraphs, headings), lines kept as written (`verbatim`: code, HTML, math), or
 * only markup and parts (`none`: a thematic break, a table, a link reference definition).
 */
export type MdBlockContent = 'blocks' | 'inline' | 'verbatim' | 'none';

/** A leaf type's inline text: the source ranges its inlines are parsed from (null: none). */
export type MdInlineTextOf = (tree: MdTree, leaf: MdBlockAt) => MdInlineText | null;

export interface MdExtension {
  readonly name: string;
  /** Block starts, placed among CommonMark's. */
  readonly blockStarts?: readonly MdPlacedStart[];
  /** Characters this extension's block starts can begin with (block starts are only tried at those). */
  readonly blockStartChars?: string;
  /** Builders for leaves with parts, by block type. */
  readonly leafBuilders?: Readonly<Record<string, MdLeafBuilder>>;
  /** How to find the inline text of blocks of these types. */
  readonly inlineText?: Readonly<Record<string, MdInlineTextOf>>;
  /** Where the markup and the text are on each line of blocks of these types (`MdTree.markup`). */
  readonly lineMarkup?: Readonly<Record<string, MdLineMarkupOf>>;
  /** What blocks of the extension's types hold (`Flavor.content`). */
  readonly blockContent?: Readonly<Record<string, MdBlockContent>>;
  /** Whether a block of these types is opened and closed by delimiter lines (`Flavor.delimited`). */
  readonly delimited?: Readonly<Record<string, (block: MdBlock) => boolean>>;
  readonly inlines?: readonly MdInlineRule[];
  readonly delimiters?: readonly MdDelimiterRule[];
  readonly brackets?: readonly MdBracketRule[];
  readonly textRules?: readonly MdTextRule[];
  /** HTML rendering for the extension's nodes, and options of the renderer. */
  readonly render?: MdRenderRules;
  /** Rule names of the extensions before it that this one takes out (a dialect without some syntax). */
  readonly remove?: readonly string[];
}

/** A Markdown dialect: CommonMark and the extensions it adds, compiled (`defineFlavor`); what reads and writes depend on. */
export interface MdFlavor {
  readonly name: string;
  readonly extensions: readonly MdExtension[];
  // block parsing
  readonly paragraph: MdBlockSpec;
  newParagraph(): MdFrame;
  readonly initialState: readonly MdFrame[];
  readonly blockStarts: readonly MdBlockStart[];
  blockStartChars(c: number): boolean;
  readonly leafBuilders: ReadonlyMap<string, MdLeafBuilder>;
  readonly inlineText: ReadonlyMap<string, MdInlineTextOf>;
  readonly lineMarkup: ReadonlyMap<string, MdLineMarkupOf>;
  // inline parsing
  readonly inline: InlineConfig;
  // rendering
  readonly render: MdRenderRules;
  /** Whether the flavor includes the extension of this name. */
  has(extension: string): boolean;
  /** What a block of `type` holds; `none` for a type no extension declares. */
  content(type: string): MdBlockContent;
  /** Whether `block` is opened and closed by delimiter lines: fenced code, `$$` and `%%` in Obsidian. */
  delimited(block: MdBlock): boolean;
  /**
   * The first of `lines`, written in `context`, that doesn't stay paragraph text, or -1 when every one
   * does (`readback.ts`); `above`, in `continuation`, the paragraph's line they follow; `lazy`, in
   * `quoteStart`, the lines written without the quote's `>`.
   */
  firstNonParagraph(lines: readonly string[], context?: MdLineContext, above?: string, lazy?: readonly boolean[]): number;
  /**
   * Whether a backslash at `at` in `line` (a line's content past its containers' prefix) is at one of
   * the flavor's markup-escape positions, where it can break block syntax and means nothing inline
   * (`readback.ts`).
   */
  markupEscapeAt(line: string, at: number): boolean;
  /** The backslashes of `lines`, as written at `place`, that are markup escapes there: out of their text (`readback.ts`). */
  markupEscapes(lines: readonly string[], place?: MdParagraphPlace): MdEscapeAt[];
  /**
   * `lines` (a text's) spelled as a paragraph's at `place`: the backslashes that would be markup
   * there absorbed, the escapes that keep each line the paragraph's placed; null where none does
   * (`readback.ts`).
   */
  escapeParagraph(lines: readonly string[], place?: MdParagraphPlace): MdEscapedParagraph | null;
}

/** CommonMark 0.31.2. */
export const commonMarkExtension: MdExtension = {
  name: 'commonmark',
  blockStarts: commonMarkStarts,
  inlineText: coreInlineText,
  lineMarkup: coreLineMarkup,
  blockContent: {
    document: 'blocks',
    blockquote: 'blocks',
    list: 'blocks',
    item: 'blocks',
    paragraph: 'inline',
    heading: 'inline',
    code_block: 'verbatim',
    html_block: 'verbatim',
    thematic_break: 'none',
    refdef: 'none',
  },
  delimited: { code_block: (b) => !!b.attrs.fenced },
  inlines: commonMarkInlines,
  delimiters: commonMarkDelimiters,
  brackets: commonMarkBrackets,
};

/** Compiles extensions into a flavor. CommonMark comes first unless the list starts with it already. */
export function defineFlavor(name: string, extensions: readonly MdExtension[]): MdFlavor {
  const all = extensions[0] === commonMarkExtension ? extensions : [commonMarkExtension, ...extensions];
  const removed = new Set(all.flatMap((e) => e.remove ?? []));

  const starts: MdBlockStart[] = [];
  const extraChars = new Set<number>();
  const leafBuilders = new Map<string, MdLeafBuilder>();
  const inlineText = new Map<string, MdInlineTextOf>();
  const lineMarkup = new Map<string, MdLineMarkupOf>();
  const content = new Map<string, MdBlockContent>();
  const delimited = new Map<string, (block: MdBlock) => boolean>();
  const inlines: MdInlineRule[] = [];
  const delimiters: MdDelimiterRule[] = [];
  const brackets: MdBracketRule[] = [];
  const textRules: MdTextRule[] = [];
  let render: MdRenderRules = {};
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
    for (const [type, m] of Object.entries(ext.lineMarkup ?? {})) lineMarkup.set(type, m);
    for (const [type, c] of Object.entries(ext.blockContent ?? {})) content.set(type, c);
    for (const [type, d] of Object.entries(ext.delimited ?? {})) delimited.set(type, d);
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
  const flavor: MdFlavor = {
    name,
    extensions: all,
    paragraph: PARAGRAPH,
    newParagraph,
    initialState: [DOCUMENT_FRAME],
    blockStarts: starts,
    blockStartChars: (c) => chars[c] === 1,
    leafBuilders,
    inlineText,
    lineMarkup,
    inline: compileInlines(inlines, delimiters, brackets, textRules),
    render,
    has: (extension) => names.has(extension),
    content: (type) => content.get(type) ?? 'none',
    delimited: (block) => delimited.get(block.type)?.(block) ?? false,
    firstNonParagraph: (lines, context, above, lazy) => firstNonParagraph(flavor, lines, context, above, lazy),
    markupEscapeAt: (line, at) => markupEscapeAt(flavor, line, at),
    markupEscapes: (lines, place) => markupEscapes(flavor, lines, place),
    escapeParagraph: (lines, place) => escapeParagraph(flavor, lines, place),
  };
  return flavor;
}

function mergeRender(a: MdRenderRules, b: MdRenderRules): MdRenderRules {
  return {
    ...a,
    ...b,
    blocks: { ...a.blocks, ...b.blocks },
    inlines: { ...a.inlines, ...b.inlines },
  };
}

export const commonmark: MdFlavor = defineFlavor('commonmark', [commonMarkExtension]);
