// HTML rendering of a syntax tree, as commonmark.js 0.31.2 writes it (lib/render/html.js,
// BSD-2-Clause, see NOTICE), so that the spec examples can be checked exactly. Extensions render
// their own blocks and inlines (`RenderRules`).
//
// The walk is iterative, like commonmark.js's: each node is entered, its children written, and
// left, so nesting as deep as the input allows never grows the call stack.

import { escapeHtml, unescapeString } from './chars.ts';
import type { Syntax } from './syntax.ts';
import type { Block, Inline } from './types.ts';

/** Writes a block on entering and on leaving it. Returning false on entering skips its children. */
export type BlockRenderer = (r: HtmlRenderer, block: Block, entering: boolean) => void | boolean;
/** Writes an inline on entering and on leaving it (`text` is its leaf's inline text). */
export type InlineRenderer = (r: HtmlRenderer, node: Inline, entering: boolean, text: string, parent: Inline | null) => void | boolean;

export interface RenderRules {
  readonly blocks?: Readonly<Record<string, BlockRenderer>>;
  readonly inlines?: Readonly<Record<string, InlineRenderer>>;
  /** Raw HTML tags written escaped (GFM's tagfilter): lowercase names. */
  readonly filteredTags?: readonly string[];
  /** A `<strong>` directly inside another isn't written (cmark-gfm's renderer). */
  readonly collapseNestedStrong?: boolean;
  /**
   * Line endings between blocks as cmark writes them: one unless the output ends with one.
   * Default: as commonmark.js, one unless the last thing written was exactly a line ending.
   */
  readonly cmarkLineEnds?: boolean;
  /** Called before the document is written (GFM's footnotes number themselves). */
  readonly start?: (r: HtmlRenderer) => void;
  /** Written after the document (GFM's footnotes). */
  readonly end?: (r: HtmlRenderer) => void;
}

export interface HtmlOptions {
  /** What a soft line break is written as. Default: a line ending. */
  readonly softbreak?: string;
  /** Raw HTML from the source written as text, escaped (for untrusted input). Default: as it is. */
  readonly escapeRawHtml?: boolean;
}

/** A node being written: a block, or an inline of `leaf`. */
interface Frame {
  readonly block: Block | null;
  readonly inline: Inline | null;
  readonly parent: Inline | null;
  readonly children: readonly (Block | Inline)[];
  /** The children are inlines (of `leaf`, whose inline text is `text`). */
  readonly inlines: boolean;
  readonly leaf: Block | null;
  readonly text: string;
  index: number;
}

const NO_CHILDREN: readonly Inline[] = [];

export class HtmlRenderer {
  readonly syntax: Syntax;
  readonly rules: RenderRules;
  readonly options: HtmlOptions;
  buffer = '';
  private lastOut = '\n';
  /** Inside an image's alt text, tags are left out. */
  disableTags = 0;
  /** The leaf whose inlines are being written. */
  leaf: Block | null = null;
  /** State extensions keep while rendering (footnote numbers). */
  readonly state = new Map<string, unknown>();
  private readonly filter: RegExp | null;
  private readonly cmarkLineEnds: boolean;

  constructor(syntax: Syntax, options: HtmlOptions = {}) {
    this.syntax = syntax;
    this.rules = syntax.flavor.render;
    this.options = options;
    this.cmarkLineEnds = this.rules.cmarkLineEnds ?? false;
    const tags = this.rules.filteredTags;
    this.filter = tags?.length ? new RegExp(`<(?=/?(?:${tags.join('|')})(?:[\\t\\n\\v\\f\\r >]|/>))`, 'gi') : null;
  }

  /** Writes raw output. */
  lit(s: string): void {
    if (s.length === 0) return;
    this.buffer += s;
    this.lastOut = this.cmarkLineEnds ? s[s.length - 1]! : s;
  }

  /** Writes text, escaped. */
  out(s: string): void {
    this.lit(escapeHtml(s));
  }

  /**
   * A line ending, unless the last thing written was one (`RenderRules.cmarkLineEnds`: unless the
   * output ends with one).
   */
  cr(): void {
    if (this.lastOut !== '\n') this.lit('\n');
  }

  tag(name: string, attrs?: readonly (readonly [string, string])[], selfClosing = false): void {
    if (this.disableTags > 0) return;
    let s = '<' + name;
    if (attrs) for (const [k, v] of attrs) s += ` ${k}="${v}"`;
    if (selfClosing) s += ' /';
    this.lit(s + '>');
  }

  /** Raw HTML from the source, with the flavor's filtered tags escaped. */
  raw(s: string): void {
    if (this.options.escapeRawHtml) this.out(s);
    else this.lit(this.filter ? s.replace(this.filter, '&lt;') : s);
  }

  /** Writes a block and everything in it. */
  render(root: Block): void {
    const stack: Frame[] = [this.blockFrame(root)];
    const outerLeaf = this.leaf;
    while (stack.length) {
      const f = stack[stack.length - 1]!;
      if (f.index < 0) {
        f.index = 0;
        this.leaf = f.leaf;
        if (this.visit(f, true) === false) f.index = f.children.length;
      }
      if (f.index < f.children.length) {
        const child = f.children[f.index++]!;
        if (!f.inlines) stack.push(this.blockFrame(child as Block));
        else {
          const inline = child as Inline;
          stack.push({ block: null, inline, parent: f.inline, children: inline.children ?? NO_CHILDREN, inlines: true, leaf: f.leaf, text: f.text, index: -1 });
        }
        continue;
      }
      stack.pop();
      this.leaf = f.leaf;
      this.visit(f, false);
    }
    this.leaf = outerLeaf;
  }

  private blockFrame(block: Block): Frame {
    const t = this.syntax.inlineText(block);
    if (t) return { block, inline: null, parent: null, children: this.syntax.inlines(block), inlines: true, leaf: block, text: t.text, index: -1 };
    return { block, inline: null, parent: null, children: block.children, inlines: false, leaf: null, text: '', index: -1 };
  }

  private visit(f: Frame, entering: boolean): void | boolean {
    if (f.block) {
      const r = this.rules.blocks?.[f.block.type] ?? coreBlocks[f.block.type];
      return r ? r(this, f.block, entering) : undefined;
    }
    const node = f.inline!;
    const r = this.rules.inlines?.[node.type] ?? coreInlines[node.type];
    if (r) return r(this, node, entering, f.text, f.parent);
    // an inline this renderer doesn't know: its children, or its text
    if (entering && !node.children) this.out(f.text.slice(node.from, node.to));
  }

  /** The `href` and `title` of a link, escaped. */
  linkAttrs(destination: string, title: string | undefined): [string, string][] {
    const attrs: [string, string][] = [['href', escapeHtml(destination)]];
    if (title) attrs.push(['title', escapeHtml(title)]);
    return attrs;
  }

  /** A code block's content: its lines as the block reads them, each with a line ending. */
  codeContent(b: Block): string {
    let from = b.startLine;
    let to = b.endLine;
    if (b.fenced) {
      from++;
      if (b.closed) to--;
    }
    if (to < from) return '';
    return this.syntax.leafLines(b, from, to).join('\n') + '\n';
  }
}

/** Whether a paragraph sits right in an item of a tight list (and is written without `<p>`). */
export function inTightList(b: Block): boolean {
  const grandparent = b.parent?.parent;
  return !!grandparent && grandparent.type === 'list' && grandparent.tight === true;
}

/** Block renderers of CommonMark, for extensions to fall back on. */
export const coreBlocks: Readonly<Record<string, BlockRenderer>> = {
  paragraph(r, b, entering) {
    if (inTightList(b)) return;
    if (entering) {
      r.cr();
      r.tag('p');
    } else {
      r.tag('/p');
      r.cr();
    }
  },
  heading(r, b, entering) {
    if (entering) {
      r.cr();
      r.tag('h' + b.level);
    } else {
      r.tag('/h' + b.level);
      r.cr();
    }
  },
  code_block(r, b, entering) {
    if (!entering) return;
    const info = b.info ? unescapeString(b.info).trim() : '';
    const word = info.split(/\s+/)[0] ?? '';
    const attrs: [string, string][] = [];
    if (word.length) {
      const cls = escapeHtml(word);
      attrs.push(['class', /^language-/.test(cls) ? cls : 'language-' + cls]);
    }
    r.cr();
    r.tag('pre');
    r.tag('code', attrs);
    r.out(r.codeContent(b));
    r.tag('/code');
    r.tag('/pre');
    r.cr();
  },
  html_block(r, b, entering) {
    if (!entering) return;
    r.cr();
    // the same output both ways: cmark writes every line's ending, commonmark.js all but the last
    const lines = r.syntax.leafLines(b);
    r.raw(r.rules.cmarkLineEnds ? lines.map((l) => l + '\n').join('') : lines.join('\n'));
    r.cr();
  },
  thematic_break(r, _b, entering) {
    if (!entering) return;
    r.cr();
    r.tag('hr', [], true);
    r.cr();
  },
  blockquote(r, _b, entering) {
    r.cr();
    r.tag(entering ? 'blockquote' : '/blockquote');
    r.cr();
  },
  list(r, b, entering) {
    const name = b.list!.type === 'bullet' ? 'ul' : 'ol';
    if (entering) {
      const attrs: [string, string][] = [];
      const start = b.list!.start;
      if (start !== null && start !== 1) attrs.push(['start', String(start)]);
      r.cr();
      r.tag(name, attrs);
      r.cr();
    } else {
      r.cr();
      r.tag('/' + name);
      r.cr();
    }
  },
  item(r, _b, entering) {
    if (entering) r.tag('li');
    else {
      r.tag('/li');
      r.cr();
    }
  },
  refdef: () => false,
};

/** Inline renderers of CommonMark. */
export const coreInlines: Readonly<Record<string, InlineRenderer>> = {
  text(r, node, entering, text) {
    if (entering) r.out(text.slice(node.from, node.to));
  },
  escape(r, node, entering) {
    if (entering) r.out(node.value!);
  },
  entity(r, node, entering) {
    if (entering) r.out(node.value!);
  },
  softbreak(r, _node, entering) {
    if (entering) r.lit(r.options.softbreak ?? '\n');
  },
  hardbreak(r, _node, entering) {
    if (!entering) return;
    r.tag('br', [], true);
    r.cr();
  },
  code(r, node, entering) {
    if (!entering) return;
    r.tag('code');
    r.out(node.value!);
    r.tag('/code');
  },
  emph(r, _node, entering) {
    r.tag(entering ? 'em' : '/em');
  },
  strong(r, _node, entering, _text, parent) {
    if (r.rules.collapseNestedStrong && parent?.type === 'strong') return;
    r.tag(entering ? 'strong' : '/strong');
  },
  link(r, node, entering) {
    if (entering) r.tag('a', r.linkAttrs(node.destination!, node.title));
    else r.tag('/a');
  },
  autolink(r, node, entering) {
    if (!entering) return;
    r.tag('a', r.linkAttrs(node.destination!, ''));
    r.out(node.value!);
    r.tag('/a');
  },
  image(r, node, entering) {
    if (entering) {
      if (r.disableTags === 0) r.lit(`<img src="${escapeHtml(node.destination!)}" alt="`);
      r.disableTags++;
    } else {
      r.disableTags--;
      if (r.disableTags === 0) {
        if (node.title) r.lit(`" title="${escapeHtml(node.title)}`);
        r.lit('" />');
      }
    }
  },
  html(r, node, entering, text) {
    if (entering && !r.disableTags) r.raw(text.slice(node.from, node.to));
  },
};

/** The document as HTML. */
export function renderHtml(syntax: Syntax, options: HtmlOptions = {}): string {
  const r = new HtmlRenderer(syntax, options);
  syntax.flavor.render.start?.(r);
  r.render(syntax.root);
  syntax.flavor.render.end?.(r);
  return r.buffer;
}
