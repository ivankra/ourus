// CommonMark's blocks, as rules for the line machine: what each open block does with a line, and the
// block starts in the spec's order of precedence. Ported from commonmark.js 0.31.2 (lib/blocks.js,
// BSD-2-Clause, see NOTICE).

import { isBlankText, isSpaceOrTab } from './chars.ts';
import type { MdBlockSpec, MdBlockStart, MdFrame, MdLeafRole, MdMachine } from './machine.ts';
import { scanReference } from './refs.ts';
import type { MdList } from './types.ts';

// ----------------------------------------------------------------------------------- frames

export interface ListFrame extends MdFrame {
  readonly ordered: boolean;
  readonly bullet: string | null;
  readonly delimiter: string | null;
}

export interface ItemFrame extends MdFrame {
  readonly markerOffset: number;
  readonly padding: number;
  /** Whether a block has been added to the item (a blank line ends an item that has none). */
  readonly hasChildren: boolean;
}

export interface ParagraphFrame extends MdFrame {
  /** The text so far, lines without their indentation joined by `\n` (commonmark.js's string content). */
  readonly content: string;
  /** Lines of the paragraph so far (reference definitions split off at a setext underline excluded). */
  readonly lines: number;
  /** The last line as cmark keeps it: its indentation included after the first line (GFM tables read it). */
  readonly last: string;
  /** Where `last` starts on its line. */
  readonly lastFrom: number;
  /**
   * The paragraph starts right after its item's task checkbox (GFM): its text isn't a paragraph's
   * start to the reader, where cmark-gfm reads the checkbox after the blocks, so it holds no link
   * reference definition (`- [ ] [r]: /u` is a task).
   */
  readonly afterTask?: boolean;
}

export interface FenceFrame extends MdFrame {
  readonly char: string;
  readonly length: number;
  readonly offset: number;
}

export interface HtmlFrame extends MdFrame {
  readonly htmlType: number;
}

// ------------------------------------------------------------------------------------ roles

export const PARAGRAPH_FIRST: MdLeafRole = Object.freeze({ type: 'paragraph', first: true });
export const PARAGRAPH_NEXT: MdLeafRole = Object.freeze({ type: 'paragraph', first: false });
const CODE_NEXT: MdLeafRole = Object.freeze({ type: 'code_block', first: false });
/** A line of indented code with only whitespace in it: a trailing one isn't part of the block. */
const ICODE_BLANK: MdLeafRole = Object.freeze({ type: 'code_block', first: false, blank: true });
const CODE_CLOSING: MdLeafRole = Object.freeze({ type: 'code_block', first: false, closed: true });
const HTML_NEXT: MdLeafRole = Object.freeze({ type: 'html_block', first: false });
const HEADING_NEXT: MdLeafRole = Object.freeze({ type: 'heading', first: false });
const REFDEF_NEXT: MdLeafRole = Object.freeze({ type: 'refdef', first: false });
const THEMATIC_BREAK: MdLeafRole = Object.freeze({ type: 'thematic_break', first: true });
const ICODE_FIRST: MdLeafRole = Object.freeze({ type: 'code_block', first: true, fenced: false });
const atxRoles = [1, 2, 3, 4, 5, 6].map((level) => Object.freeze({ type: 'heading', first: true, level, setext: false }));

// ----------------------------------------------------------------------------------- regexps

const TAGNAME = '[A-Za-z][A-Za-z0-9-]*';
const ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
const ATTRIBUTEVALUE = '(?:[^"\'=<>`\\x00-\\x20]+|\'[^\']*\'|"[^"]*")';
const ATTRIBUTE = '(?:\\s+' + ATTRIBUTENAME + '(?:\\s*=\\s*' + ATTRIBUTEVALUE + ')?)';
export const OPENTAG = '<' + TAGNAME + ATTRIBUTE + '*\\s*/?>';
export const CLOSETAG = '</' + TAGNAME + '\\s*[>]';

const reHtmlBlockOpen: readonly RegExp[] = [
  /./, // no type 0
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
  new RegExp('^(?:' + OPENTAG + '|' + CLOSETAG + ')\\s*$', 'i'),
];
const reHtmlBlockClose: readonly RegExp[] = [/./, /<\/(?:script|pre|textarea|style)>/i, /-->/, /\?>/, />/, /\]\]>/];

export const reThematicBreak = /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;
export const reAtxHeading = /^#{1,6}(?:[ \t]+|$)/;
export const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;
const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;
export const reSetextUnderline = /^(?:=+|-+)[ \t]*$/;
const reOrderedMarker = /^(\d{1,9})([.)])/;

/** Characters a CommonMark block start can begin with. */
export const isCommonMarkStartChar = (c: number): boolean =>
  c === 35 || c === 96 || c === 126 || c === 42 || c === 43 || c === 95 || c === 61 || c === 60 || c === 62 || c === 45 || (c >= 48 && c <= 57);

// ------------------------------------------------------------------------------------- specs

export const DOCUMENT: MdBlockSpec = {
  type: 'document',
  container: true,
  acceptsLines: false,
  continue: () => 0,
};

export const DOCUMENT_FRAME: MdFrame = Object.freeze({ spec: DOCUMENT });

export const BLOCKQUOTE: MdBlockSpec = {
  type: 'blockquote',
  container: true,
  acceptsLines: false,
  continue(m, _frame, index) {
    if (m.indented || m.peek(m.nextNonspace) !== 62 /* > */) return 1;
    const from = m.offset;
    const fromColumn = m.column;
    m.advanceNextNonspace();
    m.advanceOffset(1, false);
    if (isSpaceOrTab(m.peek(m.offset))) m.advanceOffset(1, true);
    m.piece(index, 'quote', from, fromColumn);
    return 0;
  },
};

const BLOCKQUOTE_FRAME: MdFrame = Object.freeze({ spec: BLOCKQUOTE });

export const LIST: MdBlockSpec<ListFrame> = {
  type: 'list',
  container: true,
  acceptsLines: false,
  continue: () => 0,
  canContain: (child) => child.type === 'item',
};

export const ITEM: MdBlockSpec<ItemFrame> = {
  type: 'item',
  container: true,
  acceptsLines: false,
  continue(m, item, index) {
    const from = m.offset;
    const fromColumn = m.column;
    // indentation first: a blank line keeps what it has beyond the item's (commonmark.js after
    // 0.31.2, and cmark); a blank line less indented goes on only in an item that has blocks
    if (m.indent >= item.markerOffset + item.padding) m.advanceOffset(item.markerOffset + item.padding, true);
    else if (m.blank && item.hasChildren) m.advanceNextNonspace();
    else return 1;
    m.piece(index, 'indent', from, fromColumn);
    return 0;
  },
  childAdded: (item) => (item.hasChildren ? item : { ...item, hasChildren: true }),
};

export const PARAGRAPH: MdBlockSpec<ParagraphFrame> = {
  type: 'paragraph',
  container: false,
  acceptsLines: true,
  interruptible: true,
  continue: (m) => (m.blank ? 1 : 0),
  addLine(m, p, index) {
    const s = m.partiallyConsumedTab ? ' '.repeat(4 - (m.column % 4)) : '';
    m.takeLine();
    const text = m.line.slice(m.offset);
    const lastFrom = p.lines === 0 ? m.offset : m.containerEnd;
    const afterTask = p.lines === 0 ? m.openedHere(index - 1) && !!m.attrsAt(index - 1)?.task : p.afterTask;
    // content last: equality checks compare the cheap fields first
    m.replace(index, {
      spec: PARAGRAPH,
      lines: p.lines + 1,
      last: m.line.slice(lastFrom),
      lastFrom: m.real(lastFrom),
      ...(afterTask ? { afterTask } : {}),
      content: p.content + s + text + '\n',
    } as ParagraphFrame);
    m.setLeaf(p.lines === 0 ? PARAGRAPH_FIRST : PARAGRAPH_NEXT);
  },
  close(m, p) {
    extractRefdefs(m, p, m.lineIndex - 1);
  },
};

export const newParagraph = (): ParagraphFrame => ({ spec: PARAGRAPH, lines: 0, last: '', lastFrom: 0, content: '' });

/**
 * Splits link reference definitions off the start of paragraph `p`, whose last line is `lastLine`:
 * their lines become refdef lines. Returns what is left of the paragraph (null if nothing).
 */
export function extractRefdefs(m: MdMachine, p: ParagraphFrame, lastLine: number): { content: string; lines: number } | null {
  let content = p.content;
  let lines = p.lines;
  if (content.charCodeAt(0) !== 91 /* [ */ || p.afterTask) return lines > 0 ? { content, lines } : null;
  let first = lastLine - lines + 1;
  let pos = 0;
  let found = false;
  while (content.charCodeAt(pos) === 91) {
    const ref = scanReference(content, pos);
    if (!ref) break;
    let count = 0;
    for (let i = pos; i < ref.end; i++) if (content.charCodeAt(i) === 10) count++;
    for (let l = first; l < first + count; l++) m.rewriteRole(l, l === first ? { type: 'refdef', first: true, label: ref.reference.label } : REFDEF_NEXT);
    pos = ref.end;
    first += count;
    lines -= count;
    found = true;
  }
  content = content.slice(pos);
  if (found && lines > 0 && !isBlankText(content)) m.rewriteRole(first, PARAGRAPH_FIRST);
  return lines > 0 && !isBlankText(content) ? { content, lines } : null;
}

export const FENCE: MdBlockSpec<FenceFrame> = {
  type: 'code_block',
  container: false,
  acceptsLines: true,
  continue(m, fence) {
    const ln = m.line;
    if (m.indent <= 3 && ln.charAt(m.nextNonspace) === fence.char) {
      const match = ln.slice(m.nextNonspace).match(reClosingCodeFence);
      if (match && match[0].length >= fence.length) {
        m.setLeaf(CODE_CLOSING);
        m.popTop();
        return 2;
      }
    }
    // skip the fence's indentation
    let i = fence.offset;
    while (i > 0 && isSpaceOrTab(m.peek(m.offset))) {
      m.advanceOffset(1, true);
      i--;
    }
    return 0;
  },
  addLine(m) {
    m.takeLine();
    if (!m.role) m.setLeaf(CODE_NEXT);
  },
};

export const INDENTED_CODE: MdBlockSpec = {
  type: 'code_block',
  container: false,
  acceptsLines: true,
  continue(m) {
    if (m.indent >= 4) m.advanceOffset(4, true);
    else if (m.blank) m.advanceNextNonspace();
    else return 1;
    return 0;
  },
  addLine(m) {
    m.takeLine();
    if (!m.role) m.setLeaf(isSpacesOrTabs(m.line, m.offset) ? ICODE_BLANK : CODE_NEXT);
  },
};

function isSpacesOrTabs(s: string, from: number): boolean {
  for (let i = from; i < s.length; i++) if (!isSpaceOrTab(s.charCodeAt(i))) return false;
  return true;
}

const INDENTED_CODE_FRAME: MdFrame = Object.freeze({ spec: INDENTED_CODE });

export const HTML_BLOCK: MdBlockSpec<HtmlFrame> = {
  type: 'html_block',
  container: false,
  acceptsLines: true,
  continue: (m, html) => (m.blank && (html.htmlType === 6 || html.htmlType === 7) ? 1 : 0),
  addLine(m, html) {
    m.takeLine();
    if (!m.role) m.setLeaf(HTML_NEXT);
    if (html.htmlType <= 5 && reHtmlBlockClose[html.htmlType]!.test(m.line.slice(m.offset))) m.popTop();
  },
};

// ------------------------------------------------------------------------------------ starts

export const blockquoteStart: MdBlockStart = {
  name: 'blockquote',
  start(m) {
    if (m.indented || m.peek(m.nextNonspace) !== 62) return 0;
    const from = m.offset;
    const fromColumn = m.column;
    m.advanceNextNonspace();
    m.advanceOffset(1, false);
    if (isSpaceOrTab(m.peek(m.offset))) m.advanceOffset(1, true);
    m.closeUnmatchedBlocks();
    m.addChild(BLOCKQUOTE_FRAME, null);
    m.piece(m.stack.length - 1, 'quote', from, fromColumn);
    return 1;
  },
};

export const atxHeadingStart: MdBlockStart = {
  name: 'atxHeading',
  start(m) {
    if (m.indented || m.peek(m.nextNonspace) !== 35 /* # */) return 0;
    const match = m.line.slice(m.nextNonspace).match(reAtxHeading);
    if (!match) return 0;
    m.advanceNextNonspace();
    m.advanceOffset(match[0].length, false);
    m.closeUnmatchedBlocks();
    m.addSingleLine(atxRoles[match[0].trim().length - 1]!);
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

export const fencedCodeStart: MdBlockStart = {
  name: 'fencedCode',
  start(m) {
    const c = m.peek(m.nextNonspace);
    if (m.indented || (c !== 96 && c !== 126)) return 0;
    const match = m.line.slice(m.nextNonspace).match(reCodeFence);
    if (!match) return 0;
    const length = match[0].length;
    const char = match[0][0]!;
    const offset = m.indent;
    m.closeUnmatchedBlocks();
    m.addChild({ spec: FENCE, char, length, offset } as FenceFrame);
    m.advanceNextNonspace();
    m.advanceOffset(length, false);
    m.setLeaf({ type: 'code_block', first: true, fenced: true, fenceChar: char, fenceLength: length, fenceOffset: offset, info: m.line.slice(m.offset, m.realLength).trim() });
    return 2;
  },
};

export const htmlBlockStart: MdBlockStart = {
  name: 'htmlBlock',
  start(m, container) {
    if (m.indented || m.peek(m.nextNonspace) !== 60 /* < */) return 0;
    const s = m.line.slice(m.nextNonspace);
    for (let type = 1; type <= 7; type++) {
      if (!reHtmlBlockOpen[type]!.test(s)) continue;
      // the seventh kind can't interrupt a paragraph
      if (type === 7 && (container.spec === PARAGRAPH || (!m.allClosed && !m.blank && m.tip.spec === PARAGRAPH))) continue;
      m.closeUnmatchedBlocks();
      // the indentation is part of the block: the offset is not advanced
      m.addChild({ spec: HTML_BLOCK, htmlType: type } as HtmlFrame);
      m.setLeaf({ type: 'html_block', first: true, htmlType: type });
      return 2;
    }
    return 0;
  },
};

export const setextHeadingStart: MdBlockStart = {
  name: 'setextHeading',
  start(m, container) {
    const c = m.peek(m.nextNonspace);
    if (m.indented || container.spec !== PARAGRAPH || (c !== 61 && c !== 45)) return 0;
    const match = m.line.slice(m.nextNonspace).match(reSetextUnderline);
    if (!match) return 0;
    m.closeUnmatchedBlocks();
    const index = m.stack.length - 1;
    const p = m.stack[index] as ParagraphFrame;
    const rest = extractRefdefs(m, p, m.lineIndex - 1);
    if (rest === null) {
      // only definitions: no heading; the paragraph stays open, empty, as in commonmark.js
      m.replace(index, newParagraph());
      return 0;
    }
    const level = match[0][0] === '=' ? 1 : 2;
    const first = m.lineIndex - rest.lines;
    m.rewriteRole(first, { type: 'heading', first: true, level, setext: true });
    for (let l = first + 1; l < m.lineIndex; l++) m.rewriteRole(l, HEADING_NEXT);
    m.popTop();
    m.setLeaf({ type: 'heading', first: false, underline: true });
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

export const thematicBreakStart: MdBlockStart = {
  name: 'thematicBreak',
  start(m) {
    const c = m.peek(m.nextNonspace);
    if (m.indented || (c !== 42 && c !== 95 && c !== 45) || !reThematicBreak.test(m.line.slice(m.nextNonspace))) return 0;
    m.closeUnmatchedBlocks();
    m.addSingleLine(THEMATIC_BREAK);
    m.advanceOffset(m.line.length - m.offset, false);
    return 2;
  },
};

export const listItemStart: MdBlockStart = {
  name: 'listItem',
  start(m, container) {
    if (m.indented && container.spec !== LIST) return 0;
    const from = m.offset;
    const fromColumn = m.column;
    const marker = parseListMarker(m, container);
    if (!marker) return 0;
    m.closeUnmatchedBlocks();
    const tip = m.tip as ListFrame;
    const list = marker.list;
    if (tip.spec !== LIST || tip.ordered !== (list.type === 'ordered') || tip.bullet !== list.bulletChar || tip.delimiter !== list.delimiter) {
      m.addChild({ spec: LIST, ordered: list.type === 'ordered', bullet: list.bulletChar, delimiter: list.delimiter } as ListFrame);
    }
    m.addChild({ spec: ITEM, markerOffset: list.markerOffset, padding: list.padding, hasChildren: false } as ItemFrame, {
      list,
      markerStart: m.real(marker.markerFrom),
      markerEnd: m.real(marker.markerTo),
      markerColumn: marker.markerColumn,
      contentColumn: marker.markerColumn + list.padding,
    });
    m.piece(m.stack.length - 1, 'marker', from, fromColumn);
    return 1;
  },
};

function parseListMarker(m: MdMachine, container: MdFrame): { list: MdList; markerFrom: number; markerTo: number; markerColumn: number } | null {
  if (m.indent >= 4) return null;
  const ln = m.line;
  const at = m.nextNonspace;
  const c = m.peek(at);
  let markerLength: number;
  let type: 'bullet' | 'ordered' = 'bullet';
  let bulletChar: string | null = null;
  let start: number | null = null;
  let delimiter: string | null = null;
  if (c === 42 || c === 43 || c === 45) {
    bulletChar = ln[at]!;
    markerLength = 1;
  } else if (c >= 48 && c <= 57) {
    const match = ln.slice(at).match(reOrderedMarker);
    if (!match) return null;
    // only a list starting at 1 can interrupt a paragraph
    if (container.spec === PARAGRAPH && parseInt(match[1]!, 10) !== 1) return null;
    type = 'ordered';
    start = parseInt(match[1]!, 10);
    delimiter = match[2]!;
    markerLength = match[0].length;
  } else return null;
  const next = m.peek(at + markerLength);
  if (!(next === -1 || next === 9 || next === 32)) return null;
  // an item interrupting a paragraph can't start with a blank line
  if (container.spec === PARAGRAPH && isBlankText(ln, at + markerLength)) return null;

  const markerOffset = m.indent;
  m.advanceNextNonspace();
  const markerFrom = m.offset;
  const markerColumn = m.column;
  m.advanceOffset(markerLength, true);
  const markerTo = m.offset;
  const spacesStartColumn = m.column;
  const spacesStartOffset = m.offset;
  do {
    m.advanceOffset(1, true);
  } while (m.column - spacesStartColumn < 5 && isSpaceOrTab(m.peek(m.offset)));
  const blankItem = m.peek(m.offset) === -1;
  const spacesAfterMarker = m.column - spacesStartColumn;
  let padding: number;
  if (spacesAfterMarker >= 5 || spacesAfterMarker < 1 || blankItem) {
    padding = markerLength + 1;
    m.column = spacesStartColumn;
    m.offset = spacesStartOffset;
    m.partiallyConsumedTab = false;
    if (isSpaceOrTab(m.peek(m.offset))) m.advanceOffset(1, true);
  } else padding = markerLength + spacesAfterMarker;
  return { list: { type, bulletChar, delimiter, start, markerOffset, padding }, markerFrom, markerTo, markerColumn };
}

export const indentedCodeStart: MdBlockStart = {
  name: 'indentedCode',
  start(m) {
    if (!m.indented || m.tip.spec === PARAGRAPH || m.blank) return 0;
    m.advanceOffset(4, true);
    m.closeUnmatchedBlocks();
    m.addChild(INDENTED_CODE_FRAME);
    m.setLeaf(ICODE_FIRST);
    return 2;
  },
};

/** CommonMark's block starts, in order of precedence. */
export const commonMarkStarts: readonly MdBlockStart[] = [
  blockquoteStart,
  atxHeadingStart,
  fencedCodeStart,
  htmlBlockStart,
  setextHeadingStart,
  thematicBreakStart,
  listItemStart,
  indentedCodeStart,
];

