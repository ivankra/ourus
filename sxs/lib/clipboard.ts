// The clipboard apps were given before a case said its formats: the example's
// Markdown as plain text and, where the Markdown has structure, rendered as HTML too. No source copies
// that; the runner gives a case's formats now, and this reads an old run
// back as what its app was given (`startClipboard` in run.ts).

import type { Config } from '../../src/config.ts';
import { clipboardSource } from '../../src/commands/paste.ts';
import { Flavor, renderHtml, SyntaxTree, type Block } from '../../src/parser/index.ts';

/**
 * The clipboard's HTML: its Markdown as structured paste reads it (`clipboardSource`: without the
 * indentation its lines share, and a fenced block copied from inside a list with the indentation its
 * other lines kept gone), rendered as commonmark.js writes it: what the page it was copied from showed. Null where a copy carries none, or none an app
 * could read as it was meant: one line without a line break (a copied line of text: `1. Introduction`
 * is no list there, and paste puts it inline), plain lines (paragraphs only), and blocks HTML has no
 * element for (math, comments, callouts, frontmatter: their rendering gives an app bare text).
 */
export function clipboardHtml(markdown: string, flavor: Config['flavor']): string | null {
  if (!/[\r\n]/.test(markdown)) return null;
  const lines = markdown.split(/\r\n|\n|\r/);
  while (lines.length && lines[0]!.trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop();
  if (!lines.length) return null;
  const text = clipboardSource(lines, { flavor }).join('\n');
  const tree = SyntaxTree.parse(text, Flavor.named(flavor));
  if (tree.root.children.every((b) => b.type === 'paragraph')) return null;
  const noElement = (b: Block): boolean => ['math_block', 'comment_block', 'frontmatter'].includes(b.type) || !!b.callout || b.children.some(noElement);
  if (noElement(tree.root)) return null;
  const html = renderHtml(tree).trim();
  return html === '' ? null : html;
}
