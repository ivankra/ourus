// Obsidian's Markdown: GFM (tables needing a pipe in each row, task items with any status
// character, strikethrough with `~~` only, footnotes, autolinks) plus Obsidian's own syntax.
//
// Obsidian has no spec. This is its syntax as its help documents it and as true-outliner measured
// Obsidian 1.13, read the CommonMark way: Live Preview's
// reading of some outliner shapes differs, and is a reader the writer must not confuse, not a mode.
//
// Blocks:
// - frontmatter: `---` on the first line, closed by a later `---` line (else the first line is
//   what CommonMark makes of it); a leaf of its own;
// - callouts: a quote whose first line is `[!type]`, optionally `+`/`-`, then the title: the
//   quote carries `callout`, and the title line is a `callout_title` leaf;
// - `$$` math and `%%` comment blocks: fenced like code, from a line starting with the fence to a
//   line ending with it (the same line when it ends with it again).
// Inlines: wikilinks and embeds (`[[target|alias]]`, `![[target]]`), tags (`#tag`), highlights
// (`==x==`), inline math (`$x$`, `$$x$$`), comments (`%%x%%`), block ids (` ^id` ending a block),
// inline footnotes (`^[note]`).

import { escapeHtml, isPunctuation, isUnicodeWhitespace } from './chars.ts';
import { BLOCKQUOTE } from './blocks.ts';
import { defineFlavor, type MdExtension, type MdFlavor } from './flavor.ts';
import { autolink, footnotes, gfmCore, strikethroughExtension, tableExtension, tasklistExtension } from './gfm.ts';
import { coreBlocks, type MdHtmlRenderer } from './html.ts';
import { MdInlineTextBuilder } from './inline-text.ts';
import { plainMarkup } from './markup.ts';
import { Node, type MdBracketRule, type MdDelimiterRule, type MdInlineParser, type MdInlineRule } from './inlines.ts';
import type { MdBlockSpec, MdFrame, MdLeafRole, MdMachine } from './machine.ts';
import type { MdTree } from './syntax.ts';

import type { MdBlockAt, MdInline, MdMark, MdLineMarkup } from './types.ts';

// ------------------------------------------------------------------------------- frontmatter

const reFrontmatterFence = /^---[ \t]*$/;
const FRONTMATTER_NEXT: MdLeafRole = Object.freeze({ type: 'frontmatter', first: false });
const FRONTMATTER_CLOSING: MdLeafRole = Object.freeze({ type: 'frontmatter', first: false, closed: true });

const FRONTMATTER: MdBlockSpec = {
  type: 'frontmatter',
  container: false,
  acceptsLines: true,
  continue(m) {
    if (reFrontmatterFence.test(m.line)) {
      m.setLeaf(FRONTMATTER_CLOSING);
      m.takeLine();
      m.popTop();
      return 2;
    }
    return 0;
  },
  addLine(m) {
    m.takeLine();
    if (!m.role) m.setLeaf(FRONTMATTER_NEXT);
  },
};

const FRONTMATTER_FRAME: MdFrame = Object.freeze({ spec: FRONTMATTER });

const frontmatterStart = {
  name: 'frontmatter',
  before: 'blockquote',
  start(m: MdMachine): 0 | 1 | 2 {
    if (m.lineIndex !== 0 || m.stack.length !== 1 || !reFrontmatterFence.test(m.line)) return 0;
    // only a closed fence makes frontmatter
    let closed = false;
    for (let i = 1; ; i++) {
      const line = m.lookAhead(i);
      if (line === null) break;
      if (reFrontmatterFence.test(line)) {
        closed = true;
        break;
      }
    }
    if (!closed) return 0;
    m.addChild(FRONTMATTER_FRAME);
    m.setLeaf({ type: 'frontmatter', first: true });
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

export const frontmatter: MdExtension = {
  name: 'frontmatter',
  blockStarts: [frontmatterStart],
  blockContent: { frontmatter: 'verbatim' },
  render: { blocks: { frontmatter: () => false } },
};

// ---------------------------------------------------------------------------------- callouts

const reCallout = /^\[!([^\]\s]+)\]([+-]?)/;

/**
 * A callout's opening at the start of `line` (a quote's first line, past its `>`), after the blanks
 * it starts with: `[!type]` and a fold sign, from `from` to `to`; null where there is none. Obsidian's
 * syntax, which the outline reads in every flavor.
 */
export function mdCalloutAt(line: string): { readonly kind: string; readonly fold: '+' | '-' | null; readonly from: number; readonly to: number } | null {
  let from = 0;
  while (line[from] === ' ' || line[from] === '\t') from++;
  const match = reCallout.exec(line.slice(from));
  return match ? { kind: match[1]!, fold: (match[2] || null) as '+' | '-' | null, from, to: from + match[0].length } : null;
}

const calloutStart = {
  name: 'callout',
  before: 'blockquote',
  start(m: MdMachine, container: MdFrame): 0 | 1 | 2 {
    const index = m.stack.length - 1;
    if (container.spec !== BLOCKQUOTE || m.tip !== container || !m.openedHere(index) || m.indented) return 0;
    if (m.peek(m.nextNonspace) !== 91 || m.peek(m.nextNonspace + 1) !== 33) return 0;
    const callout = mdCalloutAt(m.line.slice(m.nextNonspace));
    if (!callout) return 0;
    m.annotate(index, { callout: { kind: callout.kind, fold: callout.fold } });
    m.advanceNextNonspace();
    m.addSingleLine({ type: 'callout_title', first: true });
    m.takeLine();
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

/** A callout title's line: its `[!type]` and fold sign, then the title. */
function calloutTitleMarkup(tree: MdTree, _leaf: MdBlockAt, line: number): MdLineMarkup {
  const { text } = tree;
  const info = tree.line(line);
  const from = tree.textStart(line);
  const callout = mdCalloutAt(text.slice(from, info.to));
  const to = from + (callout?.to ?? 0);
  let textFrom = to;
  while (textFrom < info.to && (text.charCodeAt(textFrom) === 32 || text.charCodeAt(textFrom) === 9)) textFrom++;
  return { marks: [{ kind: 'open', from: from + (callout?.from ?? 0), to }], textFrom, textTo: info.to };
}

/** A callout title's inline text: after `[!type]` and its fold sign, trimmed. */
function calloutTitleText(tree: MdTree, leaf: MdBlockAt) {
  const { text } = tree;
  const { textFrom, textTo } = tree.markup(leaf.line);
  let to = textTo;
  while (to > textFrom && (text.charCodeAt(to - 1) === 32 || text.charCodeAt(to - 1) === 9)) to--;
  const b = new MdInlineTextBuilder(text);
  b.add(textFrom, to);
  return b.finish();
}

/** A callout: `<div class="callout">`, its title, then its content. */
function renderBlockquote(r: MdHtmlRenderer, b: MdBlockAt, entering: boolean): void | boolean {
  const { callout } = b.block.attrs;
  if (!callout) return coreBlocks.blockquote!(r, b, entering);
  if (entering) {
    r.cr();
    r.lit(`<div class="callout" data-callout="${escapeHtml(callout.kind.toLowerCase())}"${callout.fold ? ` data-callout-fold="${callout.fold}"` : ''}>`);
    r.cr();
    return;
  }
  if (b.block.children.length > 1) {
    r.cr();
    r.lit('</div>');
  }
  r.cr();
  r.lit('</div>');
  r.cr();
}

function renderCalloutTitle(r: MdHtmlRenderer, b: MdBlockAt, entering: boolean): void {
  const quote = r.up()!.block;
  if (entering) {
    r.lit('<div class="callout-title">');
    if (r.tree.inlines(b).length === 0) {
      const kind = quote.attrs.callout!.kind;
      r.out(kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase());
    }
    return;
  }
  r.lit('</div>');
  r.cr();
  if (quote.children.length > 1) {
    r.lit('<div class="callout-content">');
    r.cr();
  }
}

export const callouts: MdExtension = {
  name: 'callouts',
  blockStarts: [calloutStart],
  blockStartChars: '[',
  inlineText: { callout_title: calloutTitleText },
  lineMarkup: { callout_title: calloutTitleMarkup },
  blockContent: { callout_title: 'inline' },
  render: { blocks: { blockquote: renderBlockquote, callout_title: renderCalloutTitle } },
};

// ---------------------------------------------------------------------- math and comment blocks

/** A block fenced by `fence` (`$$`, `%%`): from a line starting with it to a line ending with it. */
function fencedBlock(type: string, fence: string, name: string): { spec: MdBlockSpec; start: { name: string; before: string; start(m: MdMachine): 0 | 1 | 2 } } {
  const next: MdLeafRole = Object.freeze({ type, first: false });
  const closing: MdLeafRole = Object.freeze({ type, first: false, closed: true });
  const spec: MdBlockSpec = {
    type,
    container: false,
    acceptsLines: true,
    continue(m) {
      if (m.line.slice(m.offset).trimEnd().endsWith(fence)) {
        m.setLeaf(closing);
        m.takeLine();
        m.popTop();
        return 2;
      }
      return 0;
    },
    addLine(m) {
      m.takeLine();
      if (!m.role) m.setLeaf(next);
    },
  };
  const frame: MdFrame = Object.freeze({ spec });
  return {
    spec,
    start: {
      name,
      before: 'htmlBlock',
      start(m) {
        if (m.indented || !m.line.startsWith(fence, m.nextNonspace)) return 0;
        const rest = m.line.slice(m.nextNonspace + fence.length).trimEnd();
        // closed on the line with text after it: inline syntax in a paragraph
        const close = rest.indexOf(fence);
        if (close >= 0 && close + fence.length < rest.length) return 0;
        m.closeUnmatchedBlocks();
        if (close >= 0) {
          // opened and closed on one line
          m.addSingleLine({ type, first: true, closed: true });
          m.takeLine();
          m.advanceOffset(m.line.length - m.offset, false);
        } else {
          m.addChild(frame);
          m.setLeaf({ type, first: true });
          m.advanceNextNonspace();
        }
        return 2;
      },
    },
  };
}

const mathBlock = fencedBlock('math_block', '$$', 'mathBlock');
const commentBlock = fencedBlock('comment_block', '%%', 'commentBlock');

/**
 * A `$$` or `%%` block's line: the opening delimiter starts its first line, the closing one ends its
 * last where it closed (after text there, `x$$`, or on its first line too, `$$x$$`); the rest is text.
 */
function fencedMarkup(tree: MdTree, leaf: MdBlockAt, line: number): MdLineMarkup {
  const first = line === leaf.line;
  const last = leaf.block.attrs.closed && line === leaf.lastLine;
  if (!first && !last) return plainMarkup(tree, line);
  const { text } = tree;
  const info = tree.line(line);
  const marks: MdMark[] = [];
  let textFrom = tree.textStart(line);
  if (textFrom < 0) textFrom = info.contentFrom;
  let textTo = info.to;
  if (first) {
    let from = info.contentFrom;
    while (from < info.to && (text.charCodeAt(from) === 32 || text.charCodeAt(from) === 9)) from++;
    marks.push({ kind: 'open', from, to: from + 2 });
    textFrom = from + 2;
  }
  if (last) {
    let to = info.to;
    while (to > textFrom && (text.charCodeAt(to - 1) === 32 || text.charCodeAt(to - 1) === 9)) to--;
    marks.push({ kind: 'close', from: to - 2, to });
    textTo = to - 2;
  }
  return { marks, textFrom, textTo: Math.max(textFrom, textTo) };
}

/** A math block's TeX: its lines, the `$$` fences off. */
export function mathContent(tree: MdTree, b: MdBlockAt): string {
  const text = tree.leafLines(b).join('\n');
  let s = text.trimStart().slice(2);
  if (b.block.attrs.closed) s = s.trimEnd().slice(0, -2);
  return s.trim();
}

export const mathBlocks: MdExtension = {
  name: 'mathBlocks',
  blockStarts: [mathBlock.start],
  blockStartChars: '$',
  lineMarkup: { math_block: fencedMarkup },
  blockContent: { math_block: 'verbatim' },
  delimited: { math_block: () => true },
  render: {
    blocks: {
      math_block(r, b, entering) {
        if (!entering) return;
        r.cr();
        r.lit('<div class="math math-block">');
        r.out(mathContent(r.tree, b));
        r.lit('</div>');
        r.cr();
      },
    },
  },
};

export const commentBlocks: MdExtension = {
  name: 'commentBlocks',
  blockStarts: [commentBlock.start],
  blockStartChars: '%',
  lineMarkup: { comment_block: fencedMarkup },
  blockContent: { comment_block: 'verbatim' },
  delimited: { comment_block: () => true },
  render: { blocks: { comment_block: () => false } },
};

// --------------------------------------------------------------------------------- wikilinks

/** `[[target]]`, `[[target|alias]]`, `![[target]]` on one line; the target not empty. */
function wikilinkAt(p: MdInlineParser, at: number, embed: boolean): boolean {
  const { text } = p;
  const open = embed ? at + 1 : at;
  if (text.charCodeAt(open) !== 91 || text.charCodeAt(open + 1) !== 91) return false;
  // up to `]]`, on the line, with no `[` before it (so the scan never passes the next opener)
  let close = open + 2;
  for (; close < text.length; close++) {
    const c = text.charCodeAt(close);
    if (c === 10 || c === 91) return false;
    if (c === 93 && text.charCodeAt(close + 1) === 93) break;
  }
  if (close >= text.length) return false;
  const inner = text.slice(open + 2, close);
  const bar = inner.indexOf('|');
  const target = (bar < 0 ? inner : inner.slice(0, bar)).trim();
  if (!target) return false;
  const attrs: Record<string, unknown> = { target };
  if (bar >= 0) attrs.alias = inner.slice(bar + 1).trim();
  p.pos = close + 2;
  p.add(new Node(embed ? 'embed' : 'wikilink', at, p.pos, attrs));
  return true;
}

const wikilinkRule: MdInlineRule = { name: 'wikilink', triggers: '[', before: 'openBracket', parse: (p) => wikilinkAt(p, p.pos, false) };
const embedRule: MdInlineRule = { name: 'embed', triggers: '!', before: 'bang', parse: (p) => wikilinkAt(p, p.pos, true) };

export const wikilinks: MdExtension = {
  name: 'wikilinks',
  inlines: [wikilinkRule, embedRule],
  render: {
    inlines: {
      wikilink(r, node, entering) {
        if (!entering) return;
        const href = escapeHtml(node.target!);
        r.lit(`<a data-href="${href}" href="${href}" class="internal-link">`);
        r.out(node.alias ?? node.target!);
        r.lit('</a>');
      },
      embed(r, node, entering) {
        if (!entering) return;
        const src = escapeHtml(node.target!);
        r.lit(`<span class="internal-embed" src="${src}"${node.alias !== undefined ? ` alt="${escapeHtml(node.alias)}"` : ''}></span>`);
      },
    },
  },
};

// -------------------------------------------------------------------------------------- tags

/** Tag characters: letters, digits, `_`, `-`, `/`, and anything else that isn't whitespace or punctuation. */
function isTagChar(cp: number): boolean {
  if (cp === 95 || cp === 45 || cp === 47) return true;
  return !isUnicodeWhitespace(cp) && !isPunctuation(cp) && cp > 32;
}

const tagRule: MdInlineRule = {
  name: 'tag',
  triggers: '#',
  parse(p) {
    const { text } = p;
    const at = p.pos;
    if (at > 0 && !isUnicodeWhitespace(text.charCodeAt(at - 1))) return false;
    let i = at + 1;
    let digitsOnly = true;
    while (i < text.length) {
      const cp = text.codePointAt(i)!;
      if (!isTagChar(cp)) break;
      if (!(cp >= 48 && cp <= 57)) digitsOnly = false;
      i += cp > 0xffff ? 2 : 1;
    }
    if (i === at + 1 || digitsOnly) return false;
    p.pos = i;
    p.add(new Node('tag', at, i, { value: text.slice(at + 1, i) }));
    return true;
  },
};

export const tags: MdExtension = {
  name: 'tags',
  inlines: [tagRule],
  render: {
    inlines: {
      tag(r, node, entering) {
        if (!entering) return;
        r.lit(`<a href="#${escapeHtml(node.value!)}" class="tag">#`);
        r.out(node.value!);
        r.lit('</a>');
      },
    },
  },
};

// -------------------------------------------------------------------------------- highlights

const equals: MdDelimiterRule = {
  char: '=',
  accepts: (length) => length === 2,
  match: (opener, closer) => (opener.length === closer.length ? { use: 2, type: 'highlight' } : null),
};

export const highlights: MdExtension = {
  name: 'highlights',
  inlines: [{ name: 'highlight', triggers: '=', parse: (p) => p.handleDelimiters(equals) }],
  delimiters: [equals],
  render: {
    inlines: {
      highlight: (r, _node, entering) => r.tag(entering ? 'mark' : '/mark'),
    },
  },
};

// ------------------------------------------------------------------------- math and comments

const isSpace = (c: number): boolean => c === 32 || c === 9 || c === 10;

/**
 * `$$tex$$` (display) and `$tex$`: the content not starting or ending with whitespace (for `$`), the
 * closing `$` not followed by a digit (as Pandoc reads it), no blank line inside.
 */
const mathRule: MdInlineRule = {
  name: 'math',
  triggers: '$',
  parse(p) {
    const { text } = p;
    const at = p.pos;
    if (text.startsWith('$$', at)) {
      if (p.flags.has('display math')) return false;
      const close = text.indexOf('$$', at + 2);
      if (close < 0) p.flags.add('display math');
      if (close < 0 || close === at + 2) return false;
      p.pos = close + 2;
      p.add(new Node('math', at, p.pos, { value: text.slice(at + 2, close).trim(), display: true }));
      return true;
    }
    if (isSpace(text.charCodeAt(at + 1)) || at + 1 >= text.length) return false;
    // the closers, found once: so a run of openers with no closer isn't quadratic
    const closers = mathClosers(p);
    let k = (p.memo.get('math cursor') as number | undefined) ?? 0;
    while (k < closers.length && closers[k]! <= at) k++;
    p.memo.set('math cursor', k);
    if (k >= closers.length) return false;
    const i = closers[k]!;
    p.pos = i + 1;
    p.add(new Node('math', at, p.pos, { value: text.slice(at + 1, i) }));
    return true;
  },
};

/** Where an inline `$` can close: unescaped, not after whitespace, not before a digit. */
function mathClosers(p: MdInlineParser): readonly number[] {
  let closers = p.memo.get('math closers') as number[] | undefined;
  if (closers) return closers;
  closers = [];
  const { text } = p;
  for (let i = 1; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c === 92) i++;
    else if (c === 36 && !isSpace(text.charCodeAt(i - 1)) && !(text.charCodeAt(i + 1) >= 48 && text.charCodeAt(i + 1) <= 57)) closers.push(i);
  }
  p.memo.set('math closers', closers);
  return closers;
}

export const math: MdExtension = {
  name: 'math',
  inlines: [mathRule],
  render: {
    inlines: {
      math(r, node, entering) {
        if (!entering) return;
        r.lit(`<span class="math ${(node as MdInline & { display?: boolean }).display ? 'math-display' : 'math-inline'}">`);
        r.out(node.value!);
        r.lit('</span>');
      },
    },
  },
};

/** `%%comment%%`, hidden. */
const commentRule: MdInlineRule = {
  name: 'comment',
  triggers: '%',
  parse(p) {
    const { text } = p;
    const at = p.pos;
    if (text.charCodeAt(at + 1) !== 37) return false;
    const close = text.indexOf('%%', at + 2);
    if (close < 0) return false;
    p.pos = close + 2;
    p.add(new Node('comment', at, p.pos, { value: text.slice(at + 2, close) }));
    return true;
  },
};

export const comments: MdExtension = {
  name: 'comments',
  inlines: [commentRule],
  render: { inlines: { comment: () => false } },
};

// ----------------------------------------------------------------- block ids, inline footnotes

const reBlockId = /\^([A-Za-z0-9-]+)[ \t]*$/y;

/** ` ^id` at the very end of a block's text (or the whole text). */
const blockIdRule: MdInlineRule = {
  name: 'blockId',
  triggers: '^',
  parse(p) {
    const { text } = p;
    const at = p.pos;
    if (at > 0 && !isUnicodeWhitespace(text.charCodeAt(at - 1))) return false;
    reBlockId.lastIndex = at;
    const m = reBlockId.exec(text);
    if (!m) return false;
    p.pos = text.length;
    p.add(new Node('block_id', at, at + 1 + m[1]!.length, { value: m[1] }));
    return true;
  },
};

export const blockIds: MdExtension = {
  name: 'blockIds',
  inlines: [blockIdRule],
  render: { inlines: { block_id: () => false } },
};

/** `^[note]`: an opener whose `]` closes an inline footnote, whatever follows. */
const inlineFootnoteOpen: MdInlineRule = {
  name: 'inlineFootnote',
  triggers: '^',
  parse(p) {
    const at = p.pos;
    if (p.text.charCodeAt(at + 1) !== 91) return false;
    p.pos = at + 2;
    p.addBracket(p.addText(at, at + 2), at + 1, false, 'inline_footnote');
    return true;
  },
};

const inlineFootnoteClose: MdBracketRule = {
  name: 'inlineFootnote',
  phase: 'before',
  resolve(p, opener) {
    if (opener.kind !== 'inline_footnote') return false;
    p.closeBracket(opener, new Node('inline_footnote', opener.node.from, p.pos));
    return true;
  },
};

export const inlineFootnotes: MdExtension = {
  name: 'inlineFootnotes',
  inlines: [inlineFootnoteOpen],
  brackets: [inlineFootnoteClose],
  render: {
    inlines: {
      inline_footnote: (r, _node, entering) => r.lit(entering ? '<sup class="footnote-inline">' : '</sup>'),
    },
  },
};

// ----------------------------------------------------------------------------------- flavor

export const obsidianExtensions: readonly MdExtension[] = [
  gfmCore,
  frontmatter,
  callouts,
  mathBlocks,
  commentBlocks,
  tableExtension({ requirePipe: true }),
  tasklistExtension({ anyStatus: true }),
  strikethroughExtension({ doubleOnly: true }),
  autolink,
  footnotes,
  wikilinks,
  tags,
  highlights,
  math,
  comments,
  inlineFootnotes,
  blockIds,
];

export const obsidian: MdFlavor = defineFlavor('obsidian', obsidianExtensions);
