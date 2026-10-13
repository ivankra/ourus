// Obsidian's Markdown: GFM (tables needing a pipe in each row, task items with any status
// character, strikethrough with `~~` only, footnotes, autolinks) plus Obsidian's own syntax.
//
// Obsidian has no spec. This is its syntax as its help documents it and as true-outliner measured
// Obsidian 1.13 (see 05-impl.md and the redesign notes), read the CommonMark way: Live Preview's
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
import { defineFlavor, type Extension, type Flavor } from './flavor.ts';
import { autolink, footnotes, gfmCore, strikethroughExtension, tableExtension, tasklistExtension } from './gfm.ts';
import { coreBlocks, type HtmlRenderer } from './html.ts';
import { InlineTextBuilder } from './inline-text.ts';
import { Node, type BracketRule, type DelimiterRule, type InlineParser, type InlineRule } from './inlines.ts';
import type { BlockSpec, Frame, LeafRole, Machine } from './machine.ts';
import type { Syntax } from './syntax.ts';
import type { Block, Inline } from './types.ts';

// ------------------------------------------------------------------------------- frontmatter

const reFrontmatterFence = /^---[ \t]*$/;
const FRONTMATTER_NEXT: LeafRole = Object.freeze({ type: 'frontmatter', first: false });
const FRONTMATTER_CLOSING: LeafRole = Object.freeze({ type: 'frontmatter', first: false, closed: true });

const FRONTMATTER: BlockSpec = {
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

const FRONTMATTER_FRAME: Frame = Object.freeze({ spec: FRONTMATTER });

const frontmatterStart = {
  name: 'frontmatter',
  before: 'blockquote',
  start(m: Machine): 0 | 1 | 2 {
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

export const frontmatter: Extension = {
  name: 'frontmatter',
  blockStarts: [frontmatterStart],
  render: { blocks: { frontmatter: () => false } },
};

// ---------------------------------------------------------------------------------- callouts

const reCallout = /^\[!([^\]\s]+)\]([+-]?)/;

const calloutStart = {
  name: 'callout',
  before: 'blockquote',
  start(m: Machine, container: Frame): 0 | 1 | 2 {
    const index = m.stack.length - 1;
    if (container.spec !== BLOCKQUOTE || m.tip !== container || !m.openedHere(index) || m.indented) return 0;
    if (m.peek(m.nextNonspace) !== 91 || m.peek(m.nextNonspace + 1) !== 33) return 0;
    const match = reCallout.exec(m.line.slice(m.nextNonspace));
    if (!match) return 0;
    m.annotate(index, { callout: { kind: match[1]!, fold: (match[2] || null) as '+' | '-' | null } });
    m.advanceNextNonspace();
    m.addSingleLine({ type: 'callout_title', first: true });
    m.takeLine();
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

/** A callout title's inline text: after `[!type]` and its fold sign, trimmed. */
function calloutTitleText(syntax: Syntax, block: Block) {
  const line = syntax.lines[block.startLine]!;
  const { text } = syntax;
  const start = syntax.textStart(block.startLine);
  let from = start + (reCallout.exec(text.slice(start, line.to))?.[0].length ?? 0);
  let to = line.to;
  while (from < to && (text.charCodeAt(from) === 32 || text.charCodeAt(from) === 9)) from++;
  while (to > from && (text.charCodeAt(to - 1) === 32 || text.charCodeAt(to - 1) === 9)) to--;
  const b = new InlineTextBuilder(text);
  b.add(from, to);
  return b.finish();
}

/** A callout: `<div class="callout">`, its title, then its content. */
function renderBlockquote(r: HtmlRenderer, b: Block, entering: boolean): void | boolean {
  if (!b.callout) return coreBlocks.blockquote!(r, b, entering);
  if (entering) {
    r.cr();
    r.lit(`<div class="callout" data-callout="${escapeHtml(b.callout.kind.toLowerCase())}"${b.callout.fold ? ` data-callout-fold="${b.callout.fold}"` : ''}>`);
    r.cr();
    return;
  }
  if (b.children.length > 1) {
    r.cr();
    r.lit('</div>');
  }
  r.cr();
  r.lit('</div>');
  r.cr();
}

function renderCalloutTitle(r: HtmlRenderer, b: Block, entering: boolean): void {
  const quote = b.parent!;
  if (entering) {
    r.lit('<div class="callout-title">');
    if (r.syntax.inlines(b).length === 0) {
      const kind = quote.callout!.kind;
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

export const callouts: Extension = {
  name: 'callouts',
  blockStarts: [calloutStart],
  blockStartChars: '[',
  inlineText: { callout_title: calloutTitleText },
  render: { blocks: { blockquote: renderBlockquote, callout_title: renderCalloutTitle } },
};

// ---------------------------------------------------------------------- math and comment blocks

/** A block fenced by `fence` (`$$`, `%%`): from a line starting with it to a line ending with it. */
function fencedBlock(type: string, fence: string, name: string): { spec: BlockSpec; start: { name: string; before: string; start(m: Machine): 0 | 1 | 2 } } {
  const next: LeafRole = Object.freeze({ type, first: false });
  const closing: LeafRole = Object.freeze({ type, first: false, closed: true });
  const spec: BlockSpec = {
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
  const frame: Frame = Object.freeze({ spec });
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

/** A math block's TeX: its lines, the `$$` fences off. */
export function mathContent(syntax: Syntax, b: Block): string {
  const text = syntax.leafLines(b).join('\n');
  let s = text.trimStart().slice(2);
  if (b.closed) s = s.trimEnd().slice(0, -2);
  return s.trim();
}

export const mathBlocks: Extension = {
  name: 'mathBlocks',
  blockStarts: [mathBlock.start],
  blockStartChars: '$',
  render: {
    blocks: {
      math_block(r, b, entering) {
        if (!entering) return;
        r.cr();
        r.lit('<div class="math math-block">');
        r.out(mathContent(r.syntax, b));
        r.lit('</div>');
        r.cr();
      },
    },
  },
};

export const commentBlocks: Extension = {
  name: 'commentBlocks',
  blockStarts: [commentBlock.start],
  blockStartChars: '%',
  render: { blocks: { comment_block: () => false } },
};

// --------------------------------------------------------------------------------- wikilinks

/** `[[target]]`, `[[target|alias]]`, `![[target]]` on one line; the target not empty. */
function wikilinkAt(p: InlineParser, at: number, embed: boolean): boolean {
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

const wikilinkRule: InlineRule = { name: 'wikilink', triggers: '[', before: 'openBracket', parse: (p) => wikilinkAt(p, p.pos, false) };
const embedRule: InlineRule = { name: 'embed', triggers: '!', before: 'bang', parse: (p) => wikilinkAt(p, p.pos, true) };

export const wikilinks: Extension = {
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

const tagRule: InlineRule = {
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

export const tags: Extension = {
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

const equals: DelimiterRule = {
  char: '=',
  accepts: (length) => length === 2,
  match: (opener, closer) => (opener.length === closer.length ? { use: 2, type: 'highlight' } : null),
};

export const highlights: Extension = {
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
const mathRule: InlineRule = {
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
function mathClosers(p: InlineParser): readonly number[] {
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

export const math: Extension = {
  name: 'math',
  inlines: [mathRule],
  render: {
    inlines: {
      math(r, node, entering) {
        if (!entering) return;
        r.lit(`<span class="math ${(node as Inline & { display?: boolean }).display ? 'math-display' : 'math-inline'}">`);
        r.out(node.value!);
        r.lit('</span>');
      },
    },
  },
};

/** `%%comment%%`, hidden. */
const commentRule: InlineRule = {
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

export const comments: Extension = {
  name: 'comments',
  inlines: [commentRule],
  render: { inlines: { comment: () => false } },
};

// ----------------------------------------------------------------- block ids, inline footnotes

const reBlockId = /\^([A-Za-z0-9-]+)[ \t]*$/y;

/** ` ^id` at the very end of a block's text (or the whole text). */
const blockIdRule: InlineRule = {
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

export const blockIds: Extension = {
  name: 'blockIds',
  inlines: [blockIdRule],
  render: { inlines: { block_id: () => false } },
};

/** `^[note]`: an opener whose `]` closes an inline footnote, whatever follows. */
const inlineFootnoteOpen: InlineRule = {
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

const inlineFootnoteClose: BracketRule = {
  name: 'inlineFootnote',
  phase: 'before',
  resolve(p, opener) {
    if (opener.kind !== 'inline_footnote') return false;
    p.closeBracket(opener, new Node('inline_footnote', opener.node.from, p.pos));
    return true;
  },
};

export const inlineFootnotes: Extension = {
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

export const obsidianExtensions: readonly Extension[] = [
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

export const obsidian: Flavor = defineFlavor('obsidian', obsidianExtensions);
