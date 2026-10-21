// HTML as Markdown: what a clipboard's HTML says, written as the Markdown that says it, for paste
// (spec/paste-html.md). A pure function of the HTML's text, parsed with htmlparser2, so a host without
// a DOM (GTK's) has it too. It reads what pages and apps write: a browser's
// copy, and the outliners' own, each with its own shape of a list, and the dialects of Google Docs (a
// wrapper that isn't bold, formatting as styles), Word (lists as paragraphs) and the pages that set a
// code block among labels and buttons (GitHub's, an LLM's).

import { parseDocument } from 'htmlparser2';

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

/**
 * The HTML converted; whether it has structure (a list, a heading, code, a quote, a table, more than
 * one line of text), and whether it has inline formatting (bold, a link, ...: what its text alone
 * would lose).
 */
export interface HtmlToMarkdownResult {
  readonly markdown: string;
  readonly structured: boolean;
  readonly formatted: boolean;
}

/** Whether the conversion under way has written inline formatting. */
let formatted = false;

/** HTML as Markdown: its blocks, set apart by blank lines; a list tight unless an item has more than one paragraph. */
export function htmlToMarkdown(html: string): HtmlToMarkdownResult {
  formatted = false;
  const blocks = blocksOf(parseDocument(html).children as readonly DomNode[]);
  const structured = blocks.some((b) => b.kind !== 'paragraph') || blocks.length > 1 || blocks.some((b) => b.kind === 'paragraph' && b.text.includes('\n'));
  return { markdown: blocks.map(write).join('\n\n'), structured, formatted };
}

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

/**
 * The blocks `nodes` make: each block element its own, and the inline content between them a
 * paragraph, its whitespace collapsed (a line break of `<br>` kept), empty ones dropped.
 */
function blocksOf(nodes: readonly DomNode[]): HtmlBlock[] {
  const out: HtmlBlock[] = [];
  let inline: DomNode[] = [];
  const flush = (): void => {
    const text = inlineText(inline);
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
      out.push(wordList(run));
      continue;
    }
    out.push(...blockOf(node));
  }
  flush();
  return out;
}

/**
 * Word's list, its items paragraphs, each its level in its style and its bullet or number as text
 * (in a `mso-list:Ignore` span, dropped): nested by level, ordered where the first item's is a number.
 */
function wordList(paragraphs: readonly DomNode[]): HtmlBlock {
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
  const build = (from: number, level: number): { block: HtmlBlock; next: number } => {
    const number = /^(\d+)[.)]/.exec(glyph(paragraphs[from]!));
    const items: HtmlBlock[][] = [];
    let k = from;
    while (k < paragraphs.length) {
      const at = wordLevel(paragraphs[k]!)!;
      if (at < level) break;
      if (at > level && items.length) {
        const nested = build(k, at);
        items[items.length - 1]!.push(nested.block);
        k = nested.next;
        continue;
      }
      items.push(blocksOf(paragraphs[k]!.children ?? []));
      k++;
    }
    return { block: { kind: 'list', ordered: !!number, start: number ? Number(number[1]) : 1, items }, next: k };
  };
  return build(0, wordLevel(paragraphs[0]!)!).block;
}

function blockOf(node: DomNode): HtmlBlock[] {
  const name = node.name!;
  const children = node.children ?? [];
  if (/^h[1-6]$/.test(name)) {
    const text = inlineText(children).replace(/\n/g, ' ');
    return text === '' ? [] : [{ kind: 'heading', level: Number(name[1]), text }];
  }
  if (name === 'ul' || name === 'ol') return [list(node)];
  // an item outside a list is a list's
  if (name === 'li') return [{ kind: 'list', ordered: false, start: 1, items: [blocksOf(children)] }];
  if (name === 'pre') return [code(node)];
  if (name === 'blockquote') {
    const blocks = blocksOf(children);
    return blocks.length ? [{ kind: 'quote', blocks }] : [];
  }
  if (name === 'hr') return [{ kind: 'rule' }];
  if (name === 'table') return table(node);
  return blocksOf(children);
}

/**
 * A list: its items, each an `li`, or (RemNote's) another block element in the list; a list right in
 * the list, not in an item (Logseq's copy, Google Docs'), is the item before's. A `div` in the XHTML
 * namespace in a list is Chromium's notice about the XSLT a copy was made with (Logseq's): no item.
 */
function list(node: DomNode): HtmlBlock {
  const ordered = node.name === 'ol';
  const start = ordered && /^\d+$/.test(node.attribs?.start ?? '') ? Number(node.attribs!.start) : 1;
  const items: HtmlBlock[][] = [];
  for (const child of node.children ?? []) {
    if (child.type === 'text' && collapse(child.data!).trim() === '') continue;
    if (child.type === 'comment' || child.type === 'directive' || (isElement(child) && SKIPPED.has(child.name!))) continue;
    if (isElement(child) && child.name === 'div' && child.attribs?.xmlns) continue;
    if (isElement(child) && (child.name === 'ul' || child.name === 'ol')) {
      const nested = list(child);
      if (items.length) items[items.length - 1]!.push(nested);
      else items.push([nested]);
      continue;
    }
    items.push(child.type === 'text' || !isBlock(child) || child.name === 'li' ? blocksOf(child.name === 'li' ? (child.children ?? []) : [child]) : blocksOf(child.children ?? []));
  }
  return { kind: 'list', ordered, start, items };
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

/** A table: its rows' cells as inline text, the first row its head; each column's alignment from its head's cell. */
function table(node: DomNode): HtmlBlock[] {
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
  const cells = rows.map((row) => cellsOf(row).map((c) => inlineText(c.children ?? []).replace(/\n/g, ' ').replace(/\|/g, '\\|')));
  return [{ kind: 'table', align, rows: cells }];
}

/** A text's whitespace as a browser lays it out: a run of spaces, tabs and line breaks is one space. */
const collapse = (text: string): string => text.replace(/[ \t\n\r\f]+/g, ' ');

/** An element's text as written, entities decoded: a code block's. */
function textContent(node: DomNode): string {
  if (node.type === 'text') return node.data!;
  if (node.name === 'br') return '\n';
  return (node.children ?? []).map(textContent).join('');
}

/** Inline content as Markdown: its text escaped, its formatting as Markdown's, a `<br>` a line break; trimmed. */
function inlineText(nodes: readonly DomNode[]): string {
  const text = nodes.map(inline).join('');
  return text
    .replace(/ +/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/^[ \n]+|[ \n]+$/g, '')
    // a checkbox starts a task's text, a space after it
    .replace(/^(\[[ x]\])(?=\S)/, '$1 ');
}

/** Inline Markdown, wrapped in `mark` around what it holds: its spaces at either end outside it, nothing where it holds nothing. */
const wrap = (mark: string, inner: string, close = mark): string => {
  const m = /^( *)(.*?)( *)$/s.exec(inner)!;
  if (m[2] === '') return inner;
  formatted = true;
  return `${m[1]}${mark}${m[2]}${close}${m[3]}`;
};

function inline(node: DomNode): string {
  if (node.type === 'text') return escapeText(collapse(node.data!));
  if (!isElement(node) || SKIPPED.has(node.name!)) return '';
  // Word's bullet or number, written as text in its list paragraphs
  if (/mso-list:\s*Ignore/i.test(node.attribs?.style ?? '')) return '';
  const inner = (): string => (node.children ?? []).map(inline).join('');
  // formatting as styles (Google Docs' spans; its wrapper `<b style="font-weight:normal">`, no bold)
  const style = node.attribs?.style ?? '';
  const weight = /font-weight:\s*(\w+)/.exec(style)?.[1];
  const styled = (text: string): string => {
    let out = text;
    if (/text-decoration[^;]*line-through/.test(style)) out = wrap('~~', out);
    if (/font-style:\s*italic/.test(style)) out = wrap('*', out);
    if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) out = wrap('**', out);
    return out;
  };
  if ((node.name === 'b' || node.name === 'strong') && (weight === 'normal' || Number(weight) < 600)) return styled(inner());
  switch (node.name) {
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return wrap('**', inner());
    case 'em':
    case 'i':
      return wrap('*', inner());
    case 'del':
    case 's':
    case 'strike':
      return wrap('~~', inner());
    case 'code':
    case 'kbd':
    case 'samp': {
      const text = collapse(textContent(node));
      if (text.trim() === '') return text;
      const run = Math.max(0, ...(text.match(/`+/g) ?? []).map((r) => r.length)) + 1;
      const fence = '`'.repeat(run);
      const pad = /^`|`$/.test(text) || /^ .* $/.test(text) ? ' ' : '';
      formatted = true;
      return `${fence}${pad}${text}${pad}${fence}`;
    }
    case 'a': {
      const text = inner();
      const href = node.attribs?.href;
      // a link with no text (a heading's permalink) is nothing to read
      if (text.trim() === '') return '';
      if (!href || href.startsWith('javascript:')) return text;
      return wrap('[', text, `](${/[\s()<>]/.test(href) ? `<${href}>` : href})`);
    }
    case 'img': {
      const src = node.attribs?.src;
      if (src) formatted = true;
      return src ? `![${escapeText(node.attribs?.alt ?? '')}](${/[\s()<>]/.test(src) ? `<${src}>` : src})` : '';
    }
    case 'input':
      return node.attribs?.type === 'checkbox' ? (node.attribs.checked !== undefined ? '[x]' : '[ ]') : '';
    default:
      return styled(inner());
  }
}

/** Text as Markdown reads it as text: the characters that would start inline markup escaped. */
function escapeText(text: string): string {
  return text
    .replace(/[\\`*[\]]/g, '\\$&')
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
      return `${'#'.repeat(block.level)} ${block.text}`;
    case 'rule':
      return '---';
    case 'code': {
      const run = Math.max(2, ...(block.text.match(/^ {0,3}`+/gm) ?? []).map((r) => r.trim().length));
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
      const width = Math.max(...block.rows.map((r) => r.length));
      const row = (cells: readonly string[]): string => `| ${Array.from({ length: width }, (_, k) => cells[k] ?? '').join(' | ')} |`;
      const rule = Array.from({ length: width }, (_, k) => {
        const a = block.align[k];
        return a === 'right' ? '---:' : a === 'center' ? ':---:' : a === 'left' ? ':---' : '---';
      });
      return [row(block.rows[0]!), `| ${rule.join(' | ')} |`, ...block.rows.slice(1).map(row)].join('\n');
    }
  }
}
