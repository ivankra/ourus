// Block skeletons from ourus and from commonmark.js (the reference oracle), for comparison.
//
// A skeleton names every block with its line range and the attributes block structure depends
// on: `doc[0-2](ul*-tight[0-1](item[0-0](p[0-0])))`. Known, intentional differences from
// commonmark.js are normalized here and listed in DEVIATIONS.

import * as commonmark from 'commonmark';
import type { Block } from '../src/block.ts';

/**
 * - commonmark.js keeps an empty paragraph when a setext underline follows only link reference
 *   definitions (`[a]: /u` / `---`); ourus doesn't. Empty paragraphs are dropped.
 * - commonmark.js extracts reference definitions at a setext-underline candidate (`===`, `---`,
 *   `- `) without moving the heading's or the paragraph's start line; ourus starts them after the
 *   definitions. Start lines of setext headings, and of paragraphs whose start ourus places right
 *   after a definition, are not compared.
 * - Link reference definitions are blocks in ourus and absent from commonmark.js's tree.
 */
export const DEVIATIONS: Readonly<Record<number, { reason: string; ourus: string }>> = {};

type CmNode = commonmark.Node;

function listAttrs(type: string, bullet: string | null, delim: string | null, start: number | null, tight: boolean): string {
  return type === 'bullet' ? `ul${bullet}-${tight ? 'tight' : 'loose'}` : `ol${start}${delim}-${tight ? 'tight' : 'loose'}`;
}

const range = (start: number | null, end: number) => `[${start === null ? '?' : start}-${end}]`;

const reader = new commonmark.Parser();

/** `refdefLines`: lines ourus parsed as link reference definitions. */
export function referenceSkeleton(markdown: string, refdefLines: ReadonlySet<number> = new Set()): string {
  const doc = reader.parse(markdown);
  const walk = (node: CmNode): string | null => {
    const [[sl], [el]] = node.sourcepos;
    const children: string[] = [];
    if (node.isContainer && node.type !== 'paragraph' && node.type !== 'heading') {
      for (let c = node.firstChild; c; c = c.next) {
        const s = walk(c);
        if (s !== null) children.push(s);
      }
    }
    const inner = children.length ? `(${children.join(',')})` : '';
    switch (node.type) {
      case 'document':
        return `doc${inner}`;
      case 'block_quote':
        return `quote${range(sl - 1, el - 1)}${inner}`;
      case 'list':
        return `${listAttrs(node.listType, node.listType === 'bullet' ? bulletOf(node) : null, node.listDelimiter, node.listStart, node.listTight)}${range(sl - 1, el - 1)}${inner}`;
      case 'item':
        return `item${range(sl - 1, el - 1)}${inner}`;
      case 'paragraph':
        if (!node.firstChild) return null;
        return `p${range(refdefLines.has(sl - 1) || refdefLines.has(sl - 2) ? null : sl - 1, el - 1)}`;
      case 'heading': {
        // a setext heading spans its text and underline; an ATX heading is one line
        return `h${node.level}${range(el > sl ? null : sl - 1, el - 1)}`;
      }
      case 'thematic_break':
        return `hr${range(sl - 1, el - 1)}`;
      case 'code_block':
        return `${isFenced(markdown, node) ? 'fence' : 'code'}${range(sl - 1, el - 1)}`;
      case 'html_block':
        return `html${range(sl - 1, el - 1)}`;
      default:
        return null;
    }
  };
  return walk(doc)!;
}

// commonmark.js's typings don't expose the bullet character; read it from the source line.
function bulletOf(list: CmNode): string {
  return (list as unknown as { _listData: { bulletChar: string } })._listData.bulletChar;
}

function isFenced(_markdown: string, node: CmNode): boolean {
  return (node as unknown as { _isFenced: boolean })._isFenced;
}


export function refdefLines(root: Block): Set<number> {
  const out = new Set<number>();
  const walk = (b: Block): void => {
    if (b.type === 'refdef') for (let i = b.startLine; i <= b.endLine; i++) out.add(i);
    b.children.forEach(walk);
  };
  walk(root);
  return out;
}

export function ourusSkeleton(root: Block): string {
  const defs = refdefLines(root);
  const afterRefdef = (b: Block): boolean => defs.has(b.startLine - 1);
  const walk = (b: Block): string | null => {
    const children = b.children.map(walk).filter((s): s is string => s !== null);
    const inner = children.length ? `(${children.join(',')})` : '';
    const r = (start: number | null) => range(start, b.endLine);
    switch (b.type) {
      case 'document':
        return `doc${inner}`;
      case 'blockquote':
        return `quote${r(b.startLine)}${inner}`;
      case 'list': {
        const l = b.list!;
        return `${listAttrs(l.type, l.bulletChar, l.delimiter, l.start, b.tight!)}${r(b.startLine)}${inner}`;
      }
      case 'item':
        return `item${r(b.startLine)}${inner}`;
      case 'paragraph':
        return `p${r(afterRefdef(b) ? null : b.startLine)}`;
      case 'heading':
        return `h${b.level}${r(b.endLine > b.startLine ? null : b.startLine)}`;
      case 'thematic_break':
        return `hr${r(b.startLine)}`;
      case 'code_block':
        return `${b.fenced ? 'fence' : 'code'}${r(b.startLine)}`;
      case 'html_block':
        return `html${r(b.startLine)}`;
      case 'refdef':
        return null;
    }
  };
  return walk(root)!;
}
