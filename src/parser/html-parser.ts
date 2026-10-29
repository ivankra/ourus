// HTML as Markdown: what a clipboard's HTML says, written as the Markdown that says it, for paste
// (spec/paste-html.md): `MdHtmlParser.parse`. A pure function of the HTML's text, parsed with htmlparser2, so a host without
// a DOM (GTK's) has it too. It reads what pages and apps write: a browser's
// copy, and the outliners' own, each with its own shape of a list, and the dialects of Google Docs (a
// wrapper that isn't bold, formatting as styles), Word (lists as paragraphs) and the pages that set a
// code block among labels and buttons (GitHub's, an LLM's).

import { parseDocument } from 'htmlparser2';
import { isPunctuation } from './chars.ts';

/** A node of htmlparser2's document, as far as it is read here. */
interface DomNode {
  readonly type: string;
  readonly name?: string;
  readonly data?: string;
  readonly attribs?: Readonly<Record<string, string>>;
  readonly children?: readonly DomNode[];
  readonly parent?: DomNode | null;
}

/** A block of the converted document. Inline content is Markdown already, its text escaped. */
type HtmlBlock =
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'heading'; readonly level: number; readonly text: string }
  | { readonly kind: 'code'; readonly info: string; readonly text: string }
  | { readonly kind: 'quote'; readonly blocks: readonly HtmlBlock[] }
  | { readonly kind: 'rule' }
  | { readonly kind: 'list'; readonly ordered: boolean; readonly start: number; readonly items: readonly HtmlBlock[][] }
  | { readonly kind: 'table'; readonly align: readonly ('left' | 'right' | 'center' | null)[]; readonly rows: readonly (readonly string[])[] };

/** Elements that aren't content. */
const SKIPPED = new Set(['head', 'title', 'meta', 'link', 'style', 'script', 'template', 'noscript', 'button', 'svg']);

/** Elements that start blocks; any other element is inline, its children in the text around it. */
const BLOCKS = new Set(['html', 'body', 'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside', 'figure', 'figcaption', 'details', 'summary', 'center', 'address', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'pre', 'blockquote', 'hr', 'table']);

const isElement = (node: DomNode): boolean => node.type === 'tag' || node.type === 'script' || node.type === 'style';
/** A block element, or an inline one around blocks (Google Docs' wrapper around everything), which then holds them as blocks do. */
const isBlock = (node: DomNode): boolean => isElement(node) && (BLOCKS.has(node.name!) || (!SKIPPED.has(node.name!) && (node.children ?? []).some(isBlock)));

/** Word's list paragraph: its level, from its `mso-list` style (`mso-list:l0 level2 lfo1`). */
const wordLevel = (node: DomNode): number | null => {
  const m = isElement(node) && node.name === 'p' ? /mso-list:\s*l\d+\s+level(\d+)/.exec(node.attribs?.style ?? '') : null;
  return m ? Number(m[1]) : null;
};

/** HTML converted to Markdown (`MdHtmlParser.parse`). */
export interface MdHtmlParsed {
  readonly markdown: string;
  /** Whether it has structure: a list, a heading, code, a quote, a table, more than one line of text. */
  readonly structured: boolean;
  /** Whether it has inline formatting (bold, a link, ...: what its text alone would lose). */
  readonly formatted: boolean;
}

/**
 * HTML as Markdown: what a clipboard's HTML says, written as the Markdown that says it. One parse is
 * one conversion, which records whether it wrote inline formatting.
 */
export class MdHtmlParser {
  /** Whether this conversion has written inline formatting. */
  #formatted = false;
  /** The code spans written, each held out of the text's whitespace collapsing by a placeholder (and the placeholders' characters in the text, `#held`). */
  readonly #codes: string[] = [];
  /** Each formatting written by `#wrap`, and the text it holds: where its delimiters can't open or close, that text. */
  readonly #wraps = new Map<string, { readonly open: string; readonly close: string; readonly plain: string }>();

  private constructor() {}

  /** HTML as Markdown: its blocks, set apart by blank lines; a list tight unless an item has more than one paragraph. */
  static parse(html: string): MdHtmlParsed {
    return new MdHtmlParser().#parse(html);
  }

  #parse(html: string): MdHtmlParsed {
    const blocks = this.#blocksOf(parseDocument(html).children as readonly DomNode[]);
    const structured = blocks.some((b) => b.kind !== 'paragraph') || blocks.length > 1 || blocks.some((b) => b.kind === 'paragraph' && b.text.includes('\n'));
    return { markdown: blocks.map(write).join('\n\n'), structured, formatted: this.#formatted };
  }

  /**
   * The blocks `nodes` make: each block element its own, and the inline content between them a
   * paragraph, its whitespace collapsed (a line break of `<br>` kept), empty ones dropped.
   */
  #blocksOf(nodes: readonly DomNode[]): HtmlBlock[] {
    const out: HtmlBlock[] = [];
    let inline: DomNode[] = [];
    const flush = (): void => {
      const text = this.#inlineText(inline);
      if (text !== '') out.push({ kind: 'paragraph', text });
      inline = [];
    };
    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k]!;
      if (node.type === 'comment' || node.type === 'directive' || (isElement(node) && SKIPPED.has(node.name!))) continue;
      if (!isBlock(node)) {
        inline.push(node);
        continue;
      }
      flush();
      if (wordLevel(node) !== null) {
        // Word's list: a run of its list paragraphs, whitespace between them aside
        const run: DomNode[] = [];
        for (; k < nodes.length && (wordLevel(nodes[k]!) !== null || (nodes[k]!.type === 'text' && collapse(nodes[k]!.data!).trim() === '')); k++) if (nodes[k]!.type !== 'text') run.push(nodes[k]!);
        k--;
        out.push(this.#wordList(run));
        continue;
      }
      out.push(...this.#blockOf(node));
    }
    flush();
    return out;
  }

  /**
   * Word's list, its items paragraphs, each its level in its style and its bullet or number as text
   * (in a `mso-list:Ignore` span, dropped): nested by level, ordered where the first item's is a number.
   */
  #wordList(paragraphs: readonly DomNode[]): HtmlBlock {
    const glyph = (p: DomNode): string => {
      let found = '';
      const walk = (n: DomNode): void => {
        if (found) return;
        if (isElement(n) && /mso-list:\s*Ignore/i.test(n.attribs?.style ?? '')) found = collapse(textContent(n)).trim();
        else (n.children ?? []).forEach(walk);
      };
      walk(p);
      return found;
    };
    // each paragraph under the nearest one before it at a shallower level, else at the top: a run
    // starting deeper than it goes on (a selection from a nested item into the next top-level one)
    // loses nothing, its first items the list's first
    interface Item { readonly level: number; readonly paragraph: DomNode; readonly children: Item[] }
    const roots: Item[] = [];
    const stack: Item[] = [];
    for (const paragraph of paragraphs) {
      const item: Item = { level: wordLevel(paragraph)!, paragraph, children: [] };
      while (stack.length && stack[stack.length - 1]!.level >= item.level) stack.pop();
      (stack.length ? stack[stack.length - 1]!.children : roots).push(item);
      stack.push(item);
    }
    const list = (items: readonly Item[]): HtmlBlock => {
      const number = /^(\d+)[.)]/.exec(glyph(items[0]!.paragraph));
      const blocks = items.map((i) => [...this.#blocksOf(i.paragraph.children ?? []), ...(i.children.length ? [list(i.children)] : [])]);
      return { kind: 'list', ordered: !!number, start: number ? Number(number[1]) : 1, items: blocks };
    };
    return list(roots);
  }

  #blockOf(node: DomNode): HtmlBlock[] {
    const name = node.name!;
    const children = node.children ?? [];
    if (/^h[1-6]$/.test(name)) {
      const text = this.#inlineText(children).replace(/\n/g, ' ');
      return text === '' ? [] : [{ kind: 'heading', level: Number(name[1]), text }];
    }
    if (name === 'ul' || name === 'ol') return [this.#list(node)];
    // an item outside a list is a list's
    if (name === 'li') return [{ kind: 'list', ordered: false, start: 1, items: [this.#blocksOf(children)] }];
    if (name === 'pre') return [code(node)];
    if (name === 'blockquote') {
      const blocks = this.#blocksOf(children);
      return blocks.length ? [{ kind: 'quote', blocks }] : [];
    }
    if (name === 'hr') return [{ kind: 'rule' }];
    if (name === 'table') return this.#table(node);
    return this.#blocksOf(children);
  }

  /**
   * A list: its items, each an `li`, or (RemNote's) another block element in the list; a list right in
   * the list, not in an item (Logseq's copy, Google Docs'), is the item before's. A `div` in the XHTML
   * namespace in a list is Chromium's notice about the XSLT a copy was made with (Logseq's): no item.
   */
  #list(node: DomNode): HtmlBlock {
    const ordered = node.name === 'ol';
    const start = ordered && /^\d+$/.test(node.attribs?.start ?? '') ? Number(node.attribs!.start) : 1;
    const items: HtmlBlock[][] = [];
    for (const child of node.children ?? []) {
      if (child.type === 'text' && collapse(child.data!).trim() === '') continue;
      if (child.type === 'comment' || child.type === 'directive' || (isElement(child) && SKIPPED.has(child.name!))) continue;
      if (isElement(child) && child.name === 'div' && child.attribs?.xmlns) continue;
      if (isElement(child) && (child.name === 'ul' || child.name === 'ol')) {
        const nested = this.#list(child);
        if (items.length) items[items.length - 1]!.push(nested);
        else items.push([nested]);
        continue;
      }
      items.push(child.type === 'text' || !isBlock(child) || child.name === 'li' ? this.#blocksOf(child.name === 'li' ? (child.children ?? []) : [child]) : this.#blocksOf(child.children ?? []));
    }
    return { kind: 'list', ordered, start, items };
  }

  /** A table: its rows' cells as inline text, the first row its head; each column's alignment from its head's cell. */
  #table(node: DomNode): HtmlBlock[] {
    const rows: DomNode[] = [];
    const walk = (n: DomNode): void => {
      for (const c of n.children ?? []) {
        if (!isElement(c)) continue;
        if (c.name === 'tr') rows.push(c);
        else if (c.name === 'thead' || c.name === 'tbody' || c.name === 'tfoot') walk(c);
      }
    };
    walk(node);
    const cellsOf = (row: DomNode): DomNode[] => (row.children ?? []).filter((c) => isElement(c) && (c.name === 'td' || c.name === 'th'));
    if (!rows.length) return [];
    const align = cellsOf(rows[0]!).map((c) => {
      const a = (c.attribs?.align ?? /text-align:\s*(left|right|center)/.exec(c.attribs?.style ?? '')?.[1] ?? '').toLowerCase();
      return a === 'left' || a === 'right' || a === 'center' ? a : null;
    });
    const cells = rows.map((row) => cellsOf(row).map((c) => this.#inlineText(c.children ?? []).replace(/\n/g, ' ').replace(/\|/g, '\\|')));
    return [{ kind: 'table', align, rows: cells }];
  }

  /** Inline content as Markdown: its text escaped, its formatting as Markdown's, a `<br>` a line break; trimmed. */
  #inlineText(nodes: readonly DomNode[]): string {
    const text = this.#joined(nodes);
    return text
      .replace(/ +/g, ' ')
      .replace(/ ?\n ?/g, '\n')
      .replace(/^[ \n]+|[ \n]+$/g, '')
      // (code spans as written, their padding spaces too)
      .replace(/\uE000(\d+)\uE001/g, (_, k: string) => this.#codes[Number(k)]!);
  }

  /**
   * Inline nodes as Markdown, joined: elements of one formatting side by side one element
   * (`<em>a</em><em>b</em>`, whose delimiters would run together, `*a**b*`); a formatting whose
   * delimiter can't close before what follows it, or open after what precedes it (`*foo!*bar`:
   * punctuation inside, a letter outside), its text alone, which is what it shows.
   */
  #joined(nodes: readonly DomNode[]): string {
    const pieces = merged(nodes).map((n) => this.#inline(n));
    const word = (c: string | undefined): boolean => !!c && /[\p{L}\p{N}]/u.test(c);
    const punct = (c: string | undefined): boolean => !!c && isPunctuation(c.codePointAt(0)!);
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]!;
      const w = this.#wraps.get(p);
      if (!w || !/^[*~]/.test(w.open)) continue;
      const inner = p.slice(p.indexOf(w.open) + w.open.length, p.lastIndexOf(w.close));
      const closes = p.endsWith(w.close) && punct(inner.slice(-1)) && word(pieces[i + 1]?.[0]);
      const opens = p.startsWith(w.open) && punct(inner[0]) && word(pieces[i - 1]?.slice(-1));
      if (closes || opens) pieces[i] = w.plain;
    }
    return pieces.join('');
  }

  /** Inline Markdown, wrapped in `mark` around what it holds: its spaces at either end outside it, nothing where it holds nothing. */
  #wrap(mark: string, inner: string, close = mark): string {
    // (formatting doesn't span a paragraph break: each paragraph's part wrapped on its own)
    if (/\n[ \t]*\n/.test(inner)) return inner.split(/(\n[ \t]*\n\s*)/).map((part, k) => (k % 2 ? part : this.#wrap(mark, part, close))).join('');
    const m = /^( *)(.*?)( *)$/s.exec(inner)!;
    if (m[2] === '') return inner;
    this.#formatted = true;
    const out = `${m[1]}${mark}${m[2]}${close}${m[3]}`;
    this.#wraps.set(out, { open: mark, close, plain: inner });
    return out;
  }

  /** `text` with the placeholders' own characters held as placeholders too, so the text's come back as they are. */
  #held(text: string): string {
    return text.replace(/[\uE000\uE001]/g, (c) => {
      this.#codes.push(c);
      return `\uE000${this.#codes.length - 1}\uE001`;
    });
  }

  #inline(node: DomNode): string {
    if (node.type === 'text') return this.#held(escapeText(collapse(node.data!)));
    if (!isElement(node) || SKIPPED.has(node.name!)) return '';
    // Word's bullet or number, written as text in its list paragraphs
    if (/mso-list:\s*Ignore/i.test(node.attribs?.style ?? '')) return '';
    const inner = (): string => this.#joined(node.children ?? []);
    // formatting as styles (Google Docs' spans; its wrapper `<b style="font-weight:normal">`, no bold)
    const style = node.attribs?.style ?? '';
    const weight = /font-weight:\s*(\w+)/.exec(style)?.[1];
    const styled = (text: string): string => {
      let out = text;
      if (/text-decoration[^;]*line-through/.test(style)) out = this.#wrap('~~', out);
      if (/font-style:\s*italic/.test(style)) out = this.#wrap('*', out);
      if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) out = this.#wrap('**', out);
      return out;
    };
    if ((node.name === 'b' || node.name === 'strong') && (weight === 'normal' || Number(weight) < 600)) return styled(inner());
    switch (node.name) {
      case 'br':
        return '\n';
      case 'strong':
      case 'b':
        return this.#wrap('**', inner());
      case 'em':
      case 'i':
        return this.#wrap('*', inner());
      case 'del':
      case 's':
      case 'strike':
        return this.#wrap('~~', inner());
      case 'code':
      case 'kbd':
      case 'samp': {
        const text = collapse(textContent(node));
        if (text.trim() === '') return text;
        const run = (text.match(/`+/g) ?? []).reduce((m, r) => Math.max(m, r.length), 0) + 1;
        const fence = '`'.repeat(run);
        const pad = /^`|`$/.test(text) || /^ .* $/.test(text) ? ' ' : '';
        this.#formatted = true;
        this.#codes.push(`${fence}${pad}${text}${pad}${fence}`);
        return `\uE000${this.#codes.length - 1}\uE001`;
      }
      case 'a': {
        const text = inner();
        const href = node.attribs?.href;
        // a link with no text (a heading's permalink) is nothing to read
        if (text.trim() === '') return '';
        if (!href || href.startsWith('javascript:')) return text;
        return this.#wrap('[', text, `](${this.#held(destination(href))})`);
      }
      case 'img': {
        const src = node.attribs?.src;
        if (src) this.#formatted = true;
        return src ? `![${this.#held(escapeText(node.attribs?.alt ?? ''))}](${this.#held(destination(src))})` : '';
      }
      case 'input':
        // (a checkbox starts a task's text, a space after it)
        return node.attribs?.type === 'checkbox' ? (node.attribs.checked !== undefined ? '[x] ' : '[ ] ') : '';
      default:
        return styled(inner());
    }
  }
}

/**
 * A code block: the text of its `code`, where it has one (a page may set labels and a copy button
 * beside it in the `pre`: an LLM's answer), else its own, as it is; its language from a `language-` or
 * `lang-` class on either, or a `highlight-source-` one around it (GitHub's).
 */
function code(node: DomNode): HtmlBlock {
  const find = (n: DomNode): DomNode | undefined => {
    for (const c of n.children ?? []) {
      if (isElement(c) && c.name === 'code') return c;
      const deeper = isElement(c) ? find(c) : undefined;
      if (deeper) return deeper;
    }
    return undefined;
  };
  const inner = find(node);
  let classes = `${node.attribs?.class ?? ''} ${inner?.attribs?.class ?? ''}`;
  for (let up = node.parent; up; up = up.parent) classes += ` ${up.attribs?.class ?? ''}`;
  const info = /(?:^|\s)(?:language|lang)-([\w#+.-]+)/.exec(classes)?.[1] ?? /(?:^|\s)highlight-source-([\w#+.-]+)/.exec(classes)?.[1] ?? '';
  return { kind: 'code', info, text: textContent(inner ?? node).replace(/\n$/, '') };
}

/** A text's whitespace as a browser lays it out: a run of spaces, tabs and line breaks is one space. */
const collapse = (text: string): string => text.replace(/[ \t\n\r\f]+/g, ' ');

/** An element's text as written, entities decoded: a code block's. */
function textContent(node: DomNode): string {
  if (node.type === 'text') return node.data!;
  if (node.name === 'br') return '\n';
  return (node.children ?? []).map(textContent).join('');
}

/**
 * A link's or an image's destination as Markdown reads it: as it is where it can be (no blanks or
 * controls, its parentheses balanced, not starting `<`; a backslash before punctuation doubled, which
 * would escape it), as the apps write one; else in angle brackets, the backslashes and brackets in it
 * escaped (`a>b` would end them).
 */
function destination(url: string): string {
  let depth = 0;
  for (const c of url) if ((depth += c === '(' ? 1 : c === ')' ? -1 : 0) < 0) break;
  if (url !== '' && depth === 0 && !url.startsWith('<') && !/[\s\x00-\x1f]/.test(url)) return url.replace(/\\(?=[!-/:-@[-`{-~])/g, '\\\\');
  return `<${url.replace(/[\\<>]/g, '\\$&')}>`;
}

/** The inline elements of one formatting, by name. */
const FORMATS: Readonly<Record<string, string>> = { b: 'strong', strong: 'strong', i: 'em', em: 'em', s: 'del', del: 'del', strike: 'del', code: 'code', kbd: 'code', samp: 'code' };

/** `nodes` with each run of elements side by side of one formatting, and no style (Google Docs'), one element holding their children. */
function merged(nodes: readonly DomNode[]): DomNode[] {
  const out: DomNode[] = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    const format = isElement(n) && !n.attribs?.style ? FORMATS[n.name!] : undefined;
    if (format && prev && isElement(prev) && !prev.attribs?.style && FORMATS[prev.name!] === format) out[out.length - 1] = { ...prev, children: [...(prev.children ?? []), ...(n.children ?? [])] };
    else out.push(n);
  }
  return out;
}

/**
 * Text as Markdown reads it as text: the characters that would start inline markup escaped, the
 * extensions' too, whatever the flavor it lands in (a backslash escapes any ASCII punctuation in all
 * of them): GFM's `~` strikethrough, Obsidian's `==` highlight, `%%` comment and `$` math.
 */
function escapeText(text: string): string {
  return text
    .replace(/[\\`*[\]~$]/g, '\\$&')
    .replace(/([=%])(?=\1)/g, '$1\\')
    .replace(/(^|[^\p{L}\p{N}])_|_(?=$|[^\p{L}\p{N}])/gu, (m) => m.replace('_', '\\_'))
    .replace(/<(?=[A-Za-z/!?])/g, '\\<')
    .replace(/&(?=#?\w+;)/g, '\\&');
}

/** A line of text as a block's first: escaped where it would start another block there. */
function escapeStart(line: string): string {
  return line
    .replace(/^(#{1,6})(?=[ \t]|$)/, '\\$1')
    .replace(/^>/, '\\>')
    .replace(/^([-+*])(?=[ \t]|$)/, '\\$1')
    .replace(/^(\d{1,9})([.)])(?=[ \t]|$)/, '$1\\$2')
    .replace(/^(=+|-+)[ \t]*$/, (m) => `\\${m}`)
    .replace(/^(~~~|```)/, '\\$1')
    .replace(/^\|/, '\\|');
}

/** A block's lines as Markdown. */
function write(block: HtmlBlock): string {
  switch (block.kind) {
    case 'paragraph':
      return block.text.split('\n').map(escapeStart).join('\n');
    case 'heading':
      // (a run of `#`s ending the text, after a space or all of it, would be the heading's closing sequence)
      return `${'#'.repeat(block.level)} ${block.text.replace(/(^|[ \t])(#+[ \t]*)$/, '$1\\$2')}`;
    case 'rule':
      return '---';
    case 'code': {
      const run = (block.text.match(/^ {0,3}`+/gm) ?? []).reduce((m, r) => Math.max(m, r.trim().length), 2);
      const fence = '`'.repeat(run + 1);
      return `${fence}${block.info}\n${block.text}${block.text === '' ? '' : '\n'}${fence}`;
    }
    case 'quote':
      return block.blocks
        .map(write)
        .join('\n\n')
        .split('\n')
        .map((line) => (line === '' ? '>' : `> ${line}`))
        .join('\n');
    case 'list': {
      // loose where an item has more than one block that isn't a list
      const loose = block.items.some((item) => item.filter((b) => b.kind !== 'list').length > 1);
      return block.items
        .map((item, k) => {
          const marker = block.ordered ? `${block.start + k}.` : '-';
          const pad = ' '.repeat(marker.length + 1);
          if (!item.length) return marker;
          const body = item.map((b, j) => (j > 0 && b.kind === 'list' && item[j - 1]!.kind !== 'list' && !loose ? `\n${write(b)}` : `${j > 0 ? '\n\n' : ''}${write(b)}`)).join('');
          return body
            .split('\n')
            .map((line, j) => (j === 0 ? `${marker} ${line}` : line === '' ? '' : pad + line))
            .join('\n');
        })
        .join(loose ? '\n\n' : '\n');
    }
    case 'table': {
      const width = block.rows.reduce((m, r) => Math.max(m, r.length), -Infinity);
      const row = (cells: readonly string[]): string => `| ${Array.from({ length: width }, (_, k) => cells[k] ?? '').join(' | ')} |`;
      const rule = Array.from({ length: width }, (_, k) => {
        const a = block.align[k];
        return a === 'right' ? '---:' : a === 'center' ? ':---:' : a === 'left' ? ':---' : '---';
      });
      return [row(block.rows[0]!), `| ${rule.join(' | ')} |`, ...block.rows.slice(1).map(row)].join('\n');
    }
  }
}
