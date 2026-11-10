// HTML as Markdown: what a clipboard's HTML says, written as the Markdown that says it, for paste
// (spec/paste-html.md): `MdHtmlParser.parse`. A pure function of the HTML's text, parsed with htmlparser2, so a host without
// a DOM (GTK's) has it too. It reads what pages and apps write: a browser's
// copy, and the outliners' own, each with its own shape of a list, and the dialects of Google Docs (a
// wrapper that isn't bold, formatting as styles), Word (lists as paragraphs) and the pages that set a
// code block among labels and buttons (GitHub's, an LLM's).

import { parseDocument } from 'htmlparser2';
import { isPunctuation } from './chars.ts';
import { pushAll } from '../text/index.ts';

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
  | { readonly kind: 'code'; readonly info: string; readonly text: string; readonly blankLine?: boolean }
  | { readonly kind: 'quote'; readonly blocks: readonly HtmlBlock[] }
  | { readonly kind: 'rule' }
  | { readonly kind: 'list'; readonly ordered: boolean; readonly start: number; readonly items: readonly HtmlBlock[][]; readonly other?: boolean }
  | { readonly kind: 'table'; readonly align: readonly ('left' | 'right' | 'center' | null)[]; readonly rows: readonly (readonly string[])[] }
  | { readonly kind: 'footnote'; readonly label: string; readonly blocks: readonly HtmlBlock[] };

/** A footnote's label in an element's `href` or `id` (`#fn-1`, GitHub's `#user-content-fn-1`): null where it names none. */
const footnoteLabel = (value: string | undefined, prefix: string): string | null => new RegExp(`^${prefix}(?:user-content-)?fn-([^\\s\\]\\[^]+)$`).exec(value ?? '')?.[1] ?? null;

/** Elements that aren't content. */
const SKIPPED = new Set(['head', 'title', 'meta', 'link', 'style', 'script', 'template', 'noscript', 'button', 'svg']);

/** Whether element `node` shows nothing: one of `SKIPPED`, or hidden (`hidden`, `display: none`, B271). */
const skipped = (node: DomNode): boolean => SKIPPED.has(node.name!) || node.attribs?.hidden !== undefined || /(?:^|;)\s*display\s*:\s*none\b/i.test(node.attribs?.style ?? '');

/** Elements that start blocks; any other element is inline, its children in the text around it. */
const BLOCKS = new Set(['html', 'body', 'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside', 'figure', 'figcaption', 'details', 'summary', 'center', 'address', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'pre', 'blockquote', 'hr', 'table']);

const isElement = (node: DomNode): boolean => node.type === 'tag' || node.type === 'script' || node.type === 'style';
/** A block element, or an inline one around blocks (Google Docs' wrapper around everything), which then holds them as blocks do. */
const isBlock = (node: DomNode): boolean => isElement(node) && (BLOCKS.has(node.name!) || (!skipped(node) && (node.children ?? []).some(isBlock)));

/**
 * An element's `style` as CSS reads it, parsed once: each property's value by its name, both in lower
 * case, spaces around them gone; a property declared twice its later declaration's, but where the
 * earlier is `!important` and the later isn't (B265). Every reading of a style goes through it.
 */
function cssOf(node: DomNode): ReadonlyMap<string, string> {
  const out = new Map<string, string>();
  const important = new Set<string>();
  for (const declaration of (node.attribs?.style ?? '').split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const name = declaration.slice(0, colon).trim().toLowerCase();
    const raw = declaration.slice(colon + 1).trim().toLowerCase();
    const isImportant = /!\s*important$/.test(raw);
    if (!name || (important.has(name) && !isImportant)) continue;
    out.set(name, isImportant ? raw.replace(/!\s*important$/, '').trim() : raw);
    if (isImportant) important.add(name);
  }
  return out;
}

/** A Word list paragraph's list (`l0`, from `mso-list:l0 level2 lfo1`): null for another paragraph. */
const wordList = (node: DomNode): string | null => (isElement(node) && node.name === 'p' ? (/^(l\d+)\s+level\d+/.exec(cssOf(node).get('mso-list') ?? '')?.[1] ?? null) : null);

/** A Word list paragraph's level (`2`, from `mso-list:l0 level2 lfo1`): null for another paragraph. */
const wordLevel = (node: DomNode): number | null => {
  const m = isElement(node) && node.name === 'p' ? /^l\d+\s+level(\d+)/.exec(cssOf(node).get('mso-list') ?? '') : null;
  return m ? Number(m[1]) : null;
};

/** Whether an element is Word's bullet or number in a list paragraph (`mso-list:Ignore`). */
const wordIgnored = (node: DomNode): boolean => isElement(node) && /^ignore\b/.test(cssOf(node).get('mso-list') ?? '');

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
  /** Whether a table's cells are converted: a pipe in them is escaped, code's too. */
  #inCell = false;
  /** Whether a Word list's paragraphs are converted: their glyph spans no text. */
  #inWordList = false;

  /** The formattings open around what is being converted, by their delimiter (`**`, `*`, `~~`): an element of one already open adds none. */
  readonly #open = new Map<string, number>();

  private constructor() {}

  /**
   * `inner()` in formatting `mark` on (`on`) or off: on where it isn't, wrapped and open for what it
   * holds; on where it is already (`<b>a<b>b</b></b>`), as it is; off where it is on (a span of
   * `font-weight:normal` in a bold one), closed around it and open again after it (`**a**b**c**`),
   * off for what it holds.
   */
  #format(mark: string, on: boolean, inner: () => string): string {
    const open = (this.#open.get(mark) ?? 0) > 0;
    if (on === open) return inner();
    const was = this.#open.get(mark) ?? 0;
    this.#open.set(mark, on ? was + 1 : 0);
    try {
      return this.#wrap(mark, inner());
    } finally {
      this.#open.set(mark, was);
    }
  }

  /** HTML as Markdown: its blocks, set apart by blank lines; a list tight unless an item has more than one paragraph. */
  /**
   * HTML's text as a browser's copy gives it as plain text: each block's lines (`<br>`, a `pre`'s) its
   * own, blank lines between paragraphs, whitespace elsewhere collapsed, no formatting: what a code
   * block takes from a clipboard of HTML alone (B133).
   */
  static plainText(html: string): string {
    const out: string[] = [];
    let line = '';
    let pre = 0;
    // (right after a `pre`'s start tag, where its first line break is none of its text, as a browser reads it)
    let preStart = false;
    // (the cells seen in each row open: a tab before each but the first, an empty one's too, B335)
    const cells: number[] = [];
    // (inside a cell, its blocks are its text's: no line of their own, the cells of a row on one line, B270)
    let inCell = 0;
    // (the blanks at a line's edges, but a cell's tab)
    const trimmed = (l: string): string => l.replace(/^[ \n\r\f]+|[ \n\r\f]+$/g, '');
    const end = (blank: boolean): void => {
      // (a `pre`'s spaces its code's, spaces alone too, B335; its last line break none of it)
      if (line.trim() !== '' || !blank || (pre && line.replace(/\n$/, '') !== '')) out.push(pre ? line.replace(/\n$/, '') : trimmed(line));
      line = '';
      if (blank && out.length && out[out.length - 1] !== '') out.push('');
    };
    // (collapsed text after a blank, another node's: its leading space none, as one run, B270)
    const add = (t: string): void => {
      line += !pre && t.startsWith(' ') && (line === '' || /[ \t]$/.test(line)) ? t.slice(1) : t;
    };
    const cell = (name: string | undefined): boolean => name === 'td' || name === 'th';
    // (a paragraph's kind set off by a blank line, as `innerText` has it; an item, a row, a `div` by a line break; cells by a tab)
    const apart = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'table', 'hr', 'figure']);
    const stack: (DomNode | { end: string })[] = [...(parseDocument(html).children as readonly DomNode[])].reverse();
    while (stack.length) {
      const n = stack.pop()!;
      const atPreStart = preStart;
      preStart = false;
      if ('end' in n) {
        if (cell(n.end)) inCell--;
        else if (inCell > 0 && n.end !== 'tr' && n.end !== 'table') add(' ');
        else end(apart.has(n.end));
        if (n.end === 'pre') pre = Math.max(0, pre - 1);
        if (n.end === 'tr') cells.pop();
        continue;
      }
      if (n.type === 'text') add(pre ? (atPreStart ? n.data!.replace(/^\n/, '') : n.data!) : collapse(n.data!));
      else if (n.name === 'br') {
        if (inCell > 0) add(' ');
        else end(false);
      }
      // (an image is its alternative text, as a browser's copy gives it)
      else if (n.name === 'img') add(collapse(n.attribs?.alt ?? ''));
      else if (isElement(n) && !skipped(n)) {
        const block = BLOCKS.has(n.name!) || n.name === 'tr' || cell(n.name);
        if (cell(n.name) && cells.length) {
          if (cells[cells.length - 1]!++ > 0) line = line.replace(/ $/, '') + '\t';
        } else if (cell(n.name) && line !== '') line += '\t';
        else if (block && inCell > 0 && n.name !== 'tr' && n.name !== 'table') add(' ');
        else if (block && line.trim() !== '') end(false);
        if (n.name === 'tr') cells.push(0);
        if (cell(n.name)) inCell++;
        if (block) {
          if (n.name === 'pre') {
            pre++;
            preStart = true;
          }
          stack.push({ end: n.name! });
        }
        for (let i = (n.children ?? []).length - 1; i >= 0; i--) stack.push(n.children![i]!);
      }
    }
    if (line.trim() !== '') out.push(trimmed(line));
    while (out.length && out[out.length - 1] === '') out.pop();
    // (a `pre`'s own lines as they are)
    return out.flatMap((l) => l.split('\n')).join('\n');
  }

  /** `html` as Markdown; `hardBreaks`: a `<br>` in a paragraph a hard break (`\\` at its line's end), else a line of the paragraph's text. */
  static parse(html: string, { hardBreaks = false }: { hardBreaks?: boolean } = {}): MdHtmlParsed {
    return new MdHtmlParser().#parse(html, hardBreaks);
  }

  #parse(html: string, hardBreaks: boolean): MdHtmlParsed {
    const nodes = parseDocument(html).children as readonly DomNode[];
    // (nested past what the walks below can recurse through: its text alone, its blocks' paragraphs and
    // lines, as a page that deep still shows it)
    if (deeper(nodes, MAX_DEPTH)) {
      // (its text as plain text gives it, blocks apart, each line escaped as text: not run together)
      const lines = MdHtmlParser.plainText(html).split('\n').map((l) => collapse(l).trim());
      const markdown = lines.map((l) => (l ? escapeStart(escapeText(l)) : '')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
      return { markdown, structured: false, formatted: false };
    }
    const blocks = this.#blocksOf(nodes);
    const structured = blocks.some((b) => b.kind !== 'paragraph') || blocks.length > 1 || blocks.some((b) => b.kind === 'paragraph' && b.text.includes('\n'));
    return { markdown: writeAll(blocks, hardBreaks), structured, formatted: this.#formatted };
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
      if (node.type === 'comment' || node.type === 'directive' || (isElement(node) && skipped(node))) continue;
      if (!isBlock(node)) {
        inline.push(node);
        continue;
      }
      flush();
      if (wordLevel(node) !== null) {
        // Word's list: a run of its list paragraphs, whitespace between them aside
        const run: DomNode[] = [];
        // (of one list: Word names each, `l0`, another one after it another list, B123)
        const id = wordList(node);
        for (; k < nodes.length && (wordList(nodes[k]!) === id || (nodes[k]!.type === 'text' && collapse(nodes[k]!.data!).trim() === '')); k++) if (nodes[k]!.type !== 'text') run.push(nodes[k]!);
        k--;
        pushAll(out, this.#wordList(run));
        continue;
      }
      pushAll(out, this.#blockOf(node));
    }
    flush();
    return out;
  }

  /**
   * Word's list, its items paragraphs, each its level in its style and its bullet or number as text
   * (in a `mso-list:Ignore` span, dropped): nested by level, ordered where the first item's is a number.
   */
  #wordList(paragraphs: readonly DomNode[]): HtmlBlock[] {
    const glyph = (p: DomNode): string => {
      let found = '';
      const walk = (n: DomNode): void => {
        if (found) return;
        if (wordIgnored(n)) found = collapse(textContent(n)).trim();
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
      // (Word has nine levels: one past them is the ninth's, the tree no deeper than Word makes it, B340)
      const item: Item = { level: Math.min(wordLevel(paragraph)!, 9), paragraph, children: [] };
      while (stack.length && stack[stack.length - 1]!.level >= item.level) stack.pop();
      (stack.length ? stack[stack.length - 1]!.children : roots).push(item);
      stack.push(item);
    }
    // (its glyphs dropped: what Word writes as the item's marker, here no text, B138)
    const lists = (items: readonly Item[]): HtmlBlock[] => {
      // (a run of one kind a list: a bullet after numbers another, at one level too, B123)
      const out: { ordered: boolean; start: number; items: HtmlBlock[][] }[] = [];
      for (const i of items) {
        const number = /^(\d+)[.)]/.exec(glyph(i.paragraph));
        this.#inWordList = true;
        const blocks = [...this.#blocksOf(i.paragraph.children ?? []), ...lists(i.children)];
        this.#inWordList = false;
        const last = out[out.length - 1];
        // (a number that jumps, `1.` then `5.`, starts another list, as an `<ol>`'s `value` does, B339)
        if (last && last.ordered === !!number && (!number || Number(number[1]) === last.start + last.items.length)) last.items.push(blocks);
        else out.push({ ordered: !!number, start: number ? Number(number[1]) : 1, items: [blocks] });
      }
      return out.map((l) => ({ kind: 'list', ...l }));
    };
    return lists(roots);
  }

  #blockOf(node: DomNode): HtmlBlock[] {
    const name = node.name!;
    const children = styledDown(node);
    if (/^h[1-6]$/.test(name)) {
      const text = this.#inlineText(children).replace(/\n/g, ' ');
      return text === '' ? [] : [{ kind: 'heading', level: Number(name[1]), text }];
    }
    if (name === 'ul' || name === 'ol') return this.#list(node);
    // an item outside a list is a list's
    if (name === 'li') return [{ kind: 'list', ordered: false, start: 1, items: [this.#blocksOf(children)] }];
    if (name === 'pre') return [code(node)];
    if (name === 'blockquote') {
      const blocks = this.#blocksOf(children);
      return blocks.length ? [{ kind: 'quote', blocks }] : [];
    }
    if (name === 'hr') return [{ kind: 'rule' }];
    if (name === 'table') return this.#table(node);
    // footnotes as GFM renders them (ourus's, GitHub's): each item a definition, its back-reference
    // no text (B141)
    if (name === 'section' && (node.attribs?.['data-footnotes'] !== undefined || /(?:^|\s)footnotes(?:\s|$)/.test(node.attribs?.class ?? ''))) {
      const items: DomNode[] = [];
      const walk = (n: DomNode): void => {
        for (const c of n.children ?? []) if (isElement(c)) (c.name === 'li' ? items.push(c) : c.name === 'ol' || c.name === 'ul' ? walk(c) : undefined);
      };
      walk(node);
      const notes = items.flatMap((li): HtmlBlock[] => {
        const label = footnoteLabel(li.attribs?.id, '');
        return label === null ? [] : [{ kind: 'footnote', label, blocks: this.#blocksOf(styledDown(li)) }];
      });
      if (notes.length === items.length && notes.length) return notes;
    }
    return this.#blocksOf(children);
  }

  /**
   * A list: its items, each an `li`, or (RemNote's) another block element in the list; a list right in
   * the list, not in an item (Logseq's copy, Google Docs'), is the item before's. A `div` in the XHTML
   * namespace in a list is Chromium's notice about the XSLT a copy was made with (Logseq's): no item.
   */
  #list(node: DomNode): HtmlBlock[] {
    const ordered = node.name === 'ol';
    const reversed = ordered && node.attribs?.reversed !== undefined;
    const counter = (v: string | undefined): number | null => (v !== undefined && /^\s*[+-]?\d+\s*$/.test(v) ? Number.parseInt(v, 10) : null);
    const items: HtmlBlock[][] = [];
    // (each item's number: its `value`, else the one before's next, down in a reversed list)
    const numbers: number[] = [];
    let next = counter(node.attribs?.start);
    const step = reversed ? -1 : 1;
    const item = (blocks: HtmlBlock[], value: number | null): void => {
      const n = value ?? next ?? (reversed ? (node.children ?? []).filter((c) => isElement(c) && c.name === 'li').length : 1);
      items.push(blocks);
      numbers.push(n);
      next = n + step;
    };
    for (const child of node.children ?? []) {
      if (child.type === 'text' && collapse(child.data!).trim() === '') continue;
      if (child.type === 'comment' || child.type === 'directive' || (isElement(child) && skipped(child))) continue;
      if (isElement(child) && child.name === 'div' && child.attribs?.xmlns) continue;
      if (isElement(child) && (child.name === 'ul' || child.name === 'ol')) {
        const nested = this.#list(child);
        if (items.length) pushAll(items[items.length - 1]!, nested);
        else item(nested, null);
        continue;
      }
      const value = isElement(child) && child.name === 'li' ? counter(child.attribs?.value) : null;
      item(child.type === 'text' || !isBlock(child) || child.name === 'li' ? this.#blocksOf(child.name === 'li' ? styledDown(child) : [child]) : this.#blocksOf(styledDown(child)), value);
    }
    if (!ordered) return [{ kind: 'list', ordered, start: 1, items }];
    // Markdown numbers a list up by one from its first: a run so numbered a list, a list of its own where
    // a number breaks it (an item's `value`, a reversed list); a number no marker has (past nine
    // digits, below zero) in a bulleted one, as no number is better than another's (B125)
    const lists: HtmlBlock[] = [];
    type Run = { ordered: boolean; start: number; items: HtmlBlock[][]; last: number };
    let run = null as Run | null;
    items.forEach((blocks, k) => {
      const n = numbers[k]!;
      const markable = n >= 0 && n <= 999_999_999;
      if (run && (markable ? run.ordered && n === run.last + 1 : !run.ordered)) {
        run.items.push(blocks);
        run.last = n;
        return;
      }
      if (run) lists.push({ kind: 'list', ordered: run.ordered, start: run.start, items: run.items });
      run = { ordered: markable, start: markable ? n : 1, items: [blocks], last: n };
    });
    const open = run as Run | null;
    if (open) lists.push({ kind: 'list', ordered: open.ordered, start: open.start, items: open.items });
    return lists.length ? lists : [{ kind: 'list', ordered, start: Math.max(0, Math.min(counter(node.attribs?.start) ?? 1, 999_999_999)), items }];
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
    // (its caption, which the table has no place for: a paragraph before it, B121; a table of no cells
    // is its caption alone, no grid of no columns)
    const caption = (node.children ?? []).find((c) => isElement(c) && c.name === 'caption');
    const title = caption ? this.#inlineText(caption.children ?? []).replace(/\n/g, ' ') : '';
    const titled = title ? [{ kind: 'paragraph' as const, text: title }] : [];
    if (!rows.some((row) => cellsOf(row).length)) return titled;
    const span = (c: DomNode, name: string): number => Math.min(Math.max(Number.parseInt(c.attribs?.[name] ?? '1', 10) || 1, 1), 1000);
    // (a head cell spanning columns: each of them its alignment)
    const align = cellsOf(rows[0]!).flatMap((c) => {
      const a = (c.attribs?.align ?? cssOf(c).get('text-align') ?? '').toLowerCase();
      return Array<'left' | 'right' | 'center' | null>(span(c, 'colspan')).fill(a === 'left' || a === 'right' || a === 'center' ? a : null);
    });
    // (a block in a cell, a paragraph, a list's item, set off from the next by a space: B116)
    const spaced = (nodes: readonly DomNode[]): DomNode[] => nodes.flatMap((n) => (isElement(n) && isBlock(n) ? [{ type: 'text', data: ' ' } as DomNode, { ...n, children: spaced(n.children ?? []) }, { type: 'text', data: ' ' } as DomNode] : [n]));
    this.#inCell = true;
    // (a cell spanning columns or rows, which no Markdown table has: its text in its first column and
    // row, the ones it spans empty, so what follows stays under its own column's head: B122)
    const cells: string[][] = rows.map(() => []);
    rows.forEach((row, r) => {
      const line = cells[r]!;
      let col = 0;
      for (const c of cellsOf(row)) {
        while (line[col] !== undefined) col++;
        const text = this.#inlineText(spaced(c.children ?? [])).replace(/\n/g, ' ').replace(/\|/g, '\\|');
        const [wide, tall] = [span(c, 'colspan'), Math.min(span(c, 'rowspan'), rows.length - r)];
        for (let dr = 0; dr < tall; dr++) for (let dc = 0; dc < wide; dc++) cells[r + dr]![col + dc] = dr === 0 && dc === 0 ? text : '';
        col += wide;
      }
      for (let k = 0; k < line.length; k++) line[k] ??= '';
    });
    this.#inCell = false;
    return [...titled, { kind: 'table', align, rows: cells }];
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
    // (and its line breaks and no-break spaces there: by a delimiter, they keep it from opening or closing)
    const m = /^([ \n\u00a0]*)(.*?)([ \n\u00a0]*)$/s.exec(inner)!;
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

  /** `text` as a code span, held out of the whitespace collapsing; nothing for nothing (spaces alone are one, which Markdown keeps as they are: B128). */
  #codeSpan(text: string): string {
    if (text === '') return text;
    // (in a table's cell a pipe is escaped, a code span's too, the backslash taken off before the code
    // is read: one there already before it would make an even run, the cell ended there. No code span
    // holds that: its text, escaped, B115)
    if (this.#inCell && /\\\|/.test(text)) return this.#held(escapeText(text));
    const run = (text.match(/`+/g) ?? []).reduce((m, r) => Math.max(m, r.length), 0) + 1;
    const fence = '`'.repeat(run);
    const pad = text.trim() !== '' && (/^`|`$/.test(text) || /^ .* $/.test(text)) ? ' ' : '';
    this.#formatted = true;
    this.#codes.push(`${fence}${pad}${text}${pad}${fence}`);
    return `\uE000${this.#codes.length - 1}\uE001`;
  }

  #inline(node: DomNode): string {
    if (node.type === 'text') return this.#held(escapeText(collapse(node.data!)));
    if (!isElement(node) || skipped(node)) return '';

    // Word's bullet or number, written as text in its list paragraphs
    // (in a list it made of Word's paragraphs: elsewhere it is text the page shows, B138)
    if (this.#inWordList && wordIgnored(node)) return '';
    const inner = (): string => this.#joined(node.children ?? []);
    // formatting as styles (Google Docs' spans; its wrapper `<b style="font-weight:normal">`, no bold)
    const css = cssOf(node);
    const weight = css.get('font-weight');
    const fontStyle = css.get('font-style');
    const decoration = css.get('text-decoration-line') ?? css.get('text-decoration');
    const bold = weight === undefined ? undefined : weight === 'bold' || weight === 'bolder' || Number(weight) >= 600;
    const italic = fontStyle === undefined ? undefined : fontStyle === 'italic' || fontStyle === 'oblique';
    const struck = decoration === undefined ? undefined : /line-through/.test(decoration);
    // (each formatting the element's own name gives, its style setting it either way: Google Docs'
    // wrapper `<b style="font-weight:normal">`, no bold)
    const name = node.name!;
    const named = (names: readonly string[], set: boolean | undefined): boolean | undefined => set ?? (names.includes(name) ? true : undefined);
    const formats: [string, boolean | undefined][] = [['~~', named(['del', 's', 'strike'], struck)], ['*', named(['em', 'i'], italic)], ['**', named(['strong', 'b'], bold)]];
    const styled = (k: number): string => {
      if (k === formats.length) return inner();
      const [mark, on] = formats[k]!;
      return on === undefined ? styled(k + 1) : this.#format(mark, on, () => styled(k + 1));
    };
    if (['strong', 'b', 'em', 'i', 'del', 's', 'strike'].includes(name) || formats.some(([, on]) => on !== undefined)) {
      if (!['code', 'kbd', 'samp', 'a', 'img', 'br', 'input'].includes(name)) return styled(0);
    }
    switch (node.name) {
      case 'br':
        return '\n';
      case 'code':
      case 'kbd':
      case 'samp': {
        // (a `<br>` in it a line break, which no code span holds: a code span a line, B129)
        // (its spaces kept where its style keeps them, `white-space: pre`: a code span holds them, B336)
        const keeps = /^(?:pre|pre-wrap|break-spaces)$/i.test(cssOf(node).get('white-space')?.trim() ?? '');
        const lines = textContent(node).split('\n').map((l) => (keeps ? l : collapse(l)));
        if (lines.length > 1) return lines.map((line) => this.#codeSpan(line)).join('\n');
        return this.#codeSpan(lines[0]!);
      }
      case 'a': {
        const href = node.attribs?.href;
        // (a footnote's reference, its number GFM's rendering, the label in its link; the back-reference no text)
        const note = node.attribs?.['data-footnote-ref'] !== undefined ? footnoteLabel(href, '#') : null;
        // (formatting: a paste that prefers the plain text would take its number, the reference lost, B338)
        if (note !== null) {
          this.#formatted = true;
          return this.#held(`[^${note}]`);
        }
        if (node.attribs?.['data-footnote-backref'] !== undefined || /(?:^|\s)footnote-backref(?:\s|$)/.test(node.attribs?.class ?? '')) return '';
        const text = inner();
        // a link with no text (a heading's permalink) is nothing to read; one of blanks, a blank (B271)
        if (text.trim() === '') return text === '' ? '' : ' ';
        // (a script's link is none, whatever the case of its scheme, the blanks a browser skips before it)
        // (but `href=""`, the page itself, is a link: no `href` is none)
        if (href === undefined || /^[\x00-\x20]*javascript:/i.test(href)) return text;
        return this.#wrap('[', text, `](${this.#held(destination(href) + titleOf(node))})`);
      }
      case 'img': {
        const src = node.attribs?.src;
        // (an attribute's line breaks are no line breaks of the text: one space, as a browser shows them)
        const alt = (node.attribs?.alt ?? '').replace(/[ \t\r\n]+/g, ' ');
        // (with no source, its alternative text, which a browser shows in its place, held as text is:
        // the converter's own marks in it are its characters)
        if (!src) return this.#held(escapeText(alt.trim()));
        this.#formatted = true;
        return `![${this.#held(escapeText(alt))}](${this.#held(destination(src) + titleOf(node))})`;
      }
      case 'input':
        // (a checkbox starts a task's text, a space after it; a type's case is no matter)
        return node.attribs?.type?.toLowerCase() === 'checkbox' ? (node.attribs.checked !== undefined ? '[x] ' : '[ ] ') : '';
      default:
        return inner();
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
  // (one: the code; several, the `pre` is what it shows, all of them with the text between: B131)
  const count = (n: DomNode): number => (n.children ?? []).reduce((k, c) => k + (isElement(c) ? (c.name === 'code' ? 1 : count(c)) : 0), 0);
  const inner = count(node) === 1 ? find(node) : undefined;
  const own = `${node.attribs?.class ?? ''} ${inner?.attribs?.class ?? ''}`;
  // (an ancestor's classes only for GitHub's, around it: a `language-` one there is the page's, `language-en`)
  let around = '';
  for (let up = node.parent; up; up = up.parent) around += ` ${up.attribs?.class ?? ''}`;
  const info = /(?:^|\s)(?:language|lang)-([\w#+.-]+)/.exec(own)?.[1] ?? /(?:^|\s)highlight-source-([\w#+.-]+)/.exec(`${own} ${around}`)?.[1] ?? '';
  // (its last line break the last line's; a payload of one empty line, that line, `blankLine`)
  let raw = textContent(inner ?? node);
  // (a line break right after `<pre>`'s start tag is none of its text, in HTML; htmlparser2 keeps it)
  const first = node.children?.[0];
  if (!inner && first?.type === 'text' && /^\r?\n/.test(first.data!)) raw = raw.replace(/^\r?\n/, '');
  const text = raw.replace(/\n$/, '');
  return { kind: 'code', info, text, ...(raw !== '' && text === '' ? { blankLine: true } : {}) };
}

/** A text's whitespace as a browser lays it out: a run of spaces, tabs and line breaks is one space. */
const collapse = (text: string): string => text.replace(/[ \t\n\r\f]+/g, ' ');

/** An element's text as written, entities decoded: a code block's. */
function textContent(node: DomNode): string {
  // (iteratively: nesting past the call stack)
  let out = '';
  const stack: DomNode[] = [node];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.type === 'text') out += n.data!;
    else if (n.name === 'br') out += '\n';
    // (a script, a style, what no page shows: no content, here as in its blocks)
    else if (n.type === 'comment' || (isElement(n) && skipped(n))) continue;
    else for (let i = (n.children ?? []).length - 1; i >= 0; i--) stack.push(n.children![i]!);
  }
  return out;
}

/** How deep elements nest before the conversion is their text alone (`#parse`): its walks recurse. */
const MAX_DEPTH = 512;

/** Whether `nodes` nest deeper than `max` elements. */
function deeper(nodes: readonly DomNode[], max: number): boolean {
  const stack: [DomNode, number][] = nodes.map((n) => [n, 1]);
  while (stack.length) {
    const [n, depth] = stack.pop()!;
    if (depth > max) return true;
    for (const c of n.children ?? []) stack.push([c, depth + 1]);
  }
  return false;
}

/**
 * A link's or an image's destination as Markdown reads it: as it is where it can be (no blanks or
 * controls, its parentheses balanced, not starting `<`; a backslash before punctuation doubled, which
 * would escape it), as the apps write one; else in angle brackets, the backslashes and brackets in it
 * escaped (`a>b` would end them).
 */
function destination(url: string): string {
  // (an `&` that would read as an entity's start, Markdown decoding it again: escaped; a control
  // character, a line break, which no destination holds: percent-encoded, as a browser sends it)
  url = url.replace(/[\x00-\x1f\x7f]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
  const entities = (u: string): string => u.replace(/&(?=#[0-9]{1,7};|#[xX][0-9a-fA-F]{1,6};|[A-Za-z][A-Za-z0-9]{1,31};)/g, '\\&');
  let depth = 0;
  for (const c of url) if ((depth += c === '(' ? 1 : c === ')' ? -1 : 0) < 0) break;
  // (a backslash before punctuation, or last, before the `)` closing it: one of its own)
  if (url !== '' && depth === 0 && !url.startsWith('<') && !/\s/.test(url)) return entities(url.replace(/\\(?=[!-/:-@[-`{-~]|$)/g, '\\\\'));
  return `<${entities(url.replace(/[\\<>]/g, '\\$&'))}>`;
}

/** The style declarations the conversion reads as formatting: bold, italic, struck through. */
/** The properties of formatting a block's style sets its children's (`styledDown`). */
const FORMAT_PROPERTIES = ['font-weight', 'font-style', 'text-decoration', 'text-decoration-line'];

/**
 * A block element's children with the formatting its style sets theirs (B120): a block child's style
 * starting with it, its own after it winning; a run of inline ones in a span of it. As they are where
 * it sets none.
 */
function styledDown(node: DomNode): DomNode[] {
  const children = node.children ?? [];
  const css = cssOf(node);
  const style = FORMAT_PROPERTIES.flatMap((name) => (css.has(name) ? [`${name}:${css.get(name)}`] : [])).join(';');
  if (!style) return [...children];
  const out: DomNode[] = [];
  let run: DomNode[] = [];
  const flush = (): void => {
    if (run.length) out.push({ type: 'tag', name: 'span', attribs: { style }, children: run } as DomNode);
    run = [];
  };
  for (const c of children) {
    if (isElement(c) && isBlock(c)) {
      flush();
      out.push({ ...c, attribs: { ...c.attribs, style: `${style};${c.attribs?.style ?? ''}` } } as DomNode);
    } else run.push(c);
  }
  flush();
  return out;
}

/** An element's `title`, as a link's or an image's title is written after its destination (` "…"`); none where it has none. */
function titleOf(node: DomNode): string {
  const title = node.attribs?.title?.replace(/[ \t\r\n]+/g, ' ').trim();
  return title ? ` "${title.replace(/[\\"]/g, '\\$&')}"` : '';
}

/** The inline elements of one formatting, by name. */
const FORMATS: Readonly<Record<string, string>> = { b: 'strong', strong: 'strong', i: 'em', em: 'em', s: 'del', del: 'del', strike: 'del', code: 'code', kbd: 'code', samp: 'code' };

/** `nodes` with each run of elements side by side of one formatting, and no style (Google Docs'), one element holding their children. */
function merged(nodes: readonly DomNode[]): DomNode[] {
  const out: DomNode[] = [];
  // (a run's children gathered in one list of its own, which each next element adds to: copied once)
  const owned = new Set<DomNode>();
  for (const n of nodes) {
    const prev = out[out.length - 1];
    const format = isElement(n) && !n.attribs?.style ? FORMATS[n.name!] : undefined;
    if (format && prev && isElement(prev) && !prev.attribs?.style && FORMATS[prev.name!] === format) {
      if (!owned.has(prev)) {
        const run: DomNode = { ...prev, children: [...(prev.children ?? [])] };
        owned.add(run);
        out[out.length - 1] = run;
      }
      // (one at a time: spread into one call, very many children pass the limit on arguments)
      const children = out[out.length - 1]!.children as DomNode[];
      for (const c of n.children ?? []) children.push(c);
    } else out.push(n);
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
    // (a run of underscores at a word's edge, all of it: one left would still open or close emphasis, `\__a\__`)
    .replace(/_+/g, (run, at: number, all: string) => (/^$|[^\p{L}\p{N}]/u.test(all[at - 1] ?? '') || /^$|[^\p{L}\p{N}]/u.test(all[at + run.length] ?? '') ? run.replace(/_/g, '\\_') : run))
    // (and before what can start an email autolink's address, `<3@example.com>`: B332)
    .replace(/<(?=[A-Za-z0-9/!?.#$%&'*+=^_`{|}~-])/g, '\\<')
    .replace(/&(?=#?\w+;)/g, '\\&')
    // (a `^` before a name: Obsidian's block id, which HTML carries none of, its text as shown)
    .replace(/\^(?=[A-Za-z0-9-])/g, '\\^')
    // (a `#` where an Obsidian tag starts, at the start or after a blank, before what isn't one: text)
    .replace(/(^|\s)#(?=[^\s#])/gu, '$1\\#');
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
    .replace(/^\|/, '\\|')
    // (a table's delimiter row, `--- | ---`, under a line it would make a table's head: its first pipe, B323)
    .replace(/^[ \t]*:?-+:?[ \t]*\|(?=(?:[ \t]*:?-+:?[ \t]*\|?)+[ \t]*$)/, (m) => `${m.slice(0, -1)}\\|`);
}

/** A block's lines as Markdown. */
/**
 * Blocks one after another, a blank line between: a list right after a list of its kind written with
 * the other bullet or delimiter (`*`, `)`), or the two would be one list (B139).
 */
/** `hardBreaks`, here and in `write`: a paragraph's line breaks written as hard breaks (`MdHtmlParser.parse`'s). */
function writeAll(blocks: readonly HtmlBlock[], hardBreaks: boolean): string {
  const out: HtmlBlock[] = [];
  for (const b of blocks) {
    const before = out[out.length - 1];
    out.push(b.kind === 'list' && before?.kind === 'list' && before.ordered === b.ordered && !before.other ? { ...b, other: true } : b);
  }
  return out.map((b) => write(b, hardBreaks)).join('\n\n');
}

function write(block: HtmlBlock, hardBreaks: boolean): string {
  switch (block.kind) {
    case 'paragraph':
      // (a `<br>`'s line break a hard break, where asked: `pasteHtmlBreak: hard`)
      // (`<br><br>` a paragraph break either way)
      if (hardBreaks) return block.text.split(/\n{2,}/).map((part) => part.split('\n').map(escapeStart).join('\\\n')).join('\n\n');
      return block.text.split('\n').map(escapeStart).join('\n');
    case 'heading':
      // (a run of `#`s ending the text, after a space or all of it, would be the heading's closing sequence)
      return `${'#'.repeat(block.level)} ${block.text.replace(/(^|[ \t])(#+[ \t]*)$/, '$1\\$2')}`;
    case 'rule':
      return '---';
    case 'code': {
      const run = (block.text.match(/^ {0,3}`+/gm) ?? []).reduce((m, r) => Math.max(m, r.trim().length), 2);
      const fence = '`'.repeat(run + 1);
      return `${fence}${block.info}\n${block.text}${block.text === '' && !block.blankLine ? '' : '\n'}${fence}`;
    }
    case 'quote':
      return writeAll(block.blocks, hardBreaks)
        .split('\n')
        .map((line) => (line === '' ? '>' : `> ${line}`))
        .join('\n');
    case 'list': {
      // loose where an item has more than one block that isn't a list
      const loose = block.items.some((item) => item.filter((b) => b.kind !== 'list').length > 1);
      return block.items
        .map((item, k) => {
          const marker = block.ordered ? `${block.start + k}${block.other ? ')' : '.'}` : block.other ? '*' : '-';
          const pad = ' '.repeat(marker.length + 1);
          if (!item.length) return marker;
          const body = item.map((b, j) => (j > 0 && b.kind === 'list' && item[j - 1]!.kind !== 'list' && !loose ? `\n${write(b, hardBreaks)}` : `${j > 0 ? '\n\n' : ''}${write(b, hardBreaks)}`)).join('');
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
    case 'footnote':
      // (its blocks after the first indented four columns: the definition's)
      return writeAll(block.blocks, hardBreaks)
        .split('\n')
        .map((line, j) => (j === 0 ? `[^${block.label}]: ${line}` : line === '' ? '' : `    ${line}`))
        .join('\n');
  }
}
