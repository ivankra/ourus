// The clipboard an app is given: the example's Markdown as plain text and, where the Markdown has
// structure, rendered as HTML too, as a copy from a rendered page carries it (a browser, another
// outliner, Obsidian's reading view). Most apps read the HTML when there is one (dev/13-align.md);
// ourus reads the Markdown, as a Markdown host passes it the plain text.

import type { Config } from '../../src/config.ts';
import { Flavor, renderHtml, SyntaxTree, type Block } from '../../src/parser/index.ts';

/**
 * The clipboard's HTML: its Markdown, without the indentation its lines share (as structured paste
 * reads it), rendered as commonmark.js writes it. Null where a copy carries none, or none an app
 * could read as it was meant: one line without a line break (a copied line of text: `1. Introduction`
 * is no list there, and paste puts it inline), plain lines (paragraphs only), and blocks HTML has no
 * element for (math, comments, callouts, frontmatter: their rendering gives an app bare text).
 */
export function clipboardHtml(markdown: string, flavor: Config['flavor']): string | null {
  if (!/[\r\n]/.test(markdown)) return null;
  const lines = markdown.split(/\r\n|\n|\r/);
  const indent = (line: string): number => /^[ \t]*/.exec(line)![0].length;
  const common = Math.min(...lines.filter((l) => l.trim() !== '').map(indent));
  const text = lines.map((l) => l.slice(Math.min(common, indent(l)))).join('\n');
  const tree = SyntaxTree.parse(text, Flavor.named(flavor));
  if (tree.root.children.every((b) => b.type === 'paragraph')) return null;
  const noElement = (b: Block): boolean => ['math_block', 'comment_block', 'frontmatter'].includes(b.type) || !!b.callout || b.children.some(noElement);
  if (noElement(tree.root)) return null;
  const html = renderHtml(tree).trim();
  return html === '' ? null : html;
}
