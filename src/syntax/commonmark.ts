// CommonMark block parser.
//
// A port of the block phase of commonmark.js 0.31.2 (lib/blocks.js, BSD-2-Clause, see NOTICE),
// restructured to be lossless: it never copies or normalizes the source, and records for every
// line which containers consumed which part of it (the line's prefix pieces) and which leaf
// block owns the rest. Link reference definitions become blocks of their own.

import { lineEnding, lineIndexAt, splitLines } from '../text.ts';
import { scanReference } from './refdef.ts';
import type { Block, BlockType, LineInfo, ListData, PrefixPiece, SyntaxTree } from './types.ts';

const CODE_INDENT = 4;

const TAGNAME = '[A-Za-z][A-Za-z0-9-]*';
const ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
const UNQUOTEDVALUE = '[^"\'=<>`\\x00-\\x20]+';
const SINGLEQUOTEDVALUE = "'[^']*'";
const DOUBLEQUOTEDVALUE = '"[^"]*"';
const ATTRIBUTEVALUE = '(?:' + UNQUOTEDVALUE + '|' + SINGLEQUOTEDVALUE + '|' + DOUBLEQUOTEDVALUE + ')';
const ATTRIBUTEVALUESPEC = '(?:' + '\\s*=' + '\\s*' + ATTRIBUTEVALUE + ')';
const ATTRIBUTE = '(?:' + '\\s+' + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + '?)';
const OPENTAG = '<' + TAGNAME + ATTRIBUTE + '*' + '\\s*/?>';
const CLOSETAG = '</' + TAGNAME + '\\s*[>]';

const reHtmlBlockOpen: readonly RegExp[] = [
  /./, // dummy for 0
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
  new RegExp('^(?:' + OPENTAG + '|' + CLOSETAG + ')\\s*$', 'i'),
];

const reHtmlBlockClose: readonly RegExp[] = [
  /./, // dummy for 0
  /<\/(?:script|pre|textarea|style)>/i,
  /-->/,
  /\?>/,
  />/,
  /\]\]>/,
];

const reThematicBreak = /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;
const reMaybeSpecial = /^[#`~*+_=<>0-9-]/;
const reNonSpace = /[^ \t\f\v\r\n]/;
const reBulletListMarker = /^[*+-]/;
const reOrderedListMarker = /^(\d{1,9})([.)])/;
const reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;
const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;
const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;
const reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;
const reBlankContent = /^[ \t]*$/;

const isBlank = (s: string): boolean => !reNonSpace.test(s);
const isSpaceOrTab = (c: number): boolean => c === 32 || c === 9;
const peek = (s: string, pos: number): number => (pos < s.length ? s.charCodeAt(pos) : -1);

/** A block under construction. Becomes an immutable `Block` when parsing ends. */
interface MBlock {
  type: BlockType;
  parent: MBlock | null;
  children: MBlock[];
  open: boolean;
  startLine: number;
  endLine: number;
  // paragraph: raw content as commonmark.js builds it, and the line of each content line
  content: string;
  contentLines: number[];
  // code_block (indented): offsets where each line's content starts, to trim trailing blanks
  codeLines: { line: number; from: number }[];
  level?: number;
  setext?: boolean;
  fenced?: boolean;
  fenceChar?: string;
  fenceLength?: number;
  fenceOffset?: number;
  info?: string;
  htmlType?: number;
  list?: ListData;
  tight?: boolean;
  markerFrom?: number;
  markerTo?: number;
  markerColumn?: number;
  contentColumn?: number;
  label?: string;
}

interface MPiece {
  block: MBlock;
  from: number;
  to: number;
  fromColumn: number;
  toColumn: number;
  partialTab: boolean;
}

function newBlock(type: BlockType, line: number): MBlock {
  return { type, parent: null, children: [], open: true, startLine: line, endLine: line, content: '', contentLines: [], codeLines: [] };
}

const canContain = (parent: BlockType, child: BlockType): boolean => {
  switch (parent) {
    case 'document':
    case 'blockquote':
    case 'item':
      return child !== 'item';
    case 'list':
      return child === 'item';
    default:
      return false;
  }
};

const acceptsLines = (t: BlockType): boolean => t === 'paragraph' || t === 'code_block' || t === 'html_block';

/** True when `block` and its next sibling are separated by a blank line. */
const endsWithBlankLine = (block: MBlock): boolean => {
  const siblings = block.parent!.children;
  const next = siblings[siblings.indexOf(block) + 1];
  return next !== undefined && block.endLine !== next.startLine - 1;
};

class Parser {
  readonly doc: MBlock = newBlock('document', 0);
  tip: MBlock = this.doc;
  oldtip: MBlock = this.doc;
  lastMatchedContainer: MBlock = this.doc;
  allClosed = true;

  /** Current line, with NUL replaced for interpretation (same length as the source line). */
  line = '';
  lineIndex = -1;
  lineStart = 0;
  offset = 0;
  column = 0;
  nextNonspace = 0;
  nextNonspaceColumn = 0;
  indent = 0;
  indented = false;
  blank = false;
  partiallyConsumedTab = false;

  // per-line results
  readonly linePieces: MPiece[][] = [];
  readonly lineLeaf: (MBlock | null)[] = [];
  readonly lineLazy: boolean[] = [];
  pieces: MPiece[] = [];

  readonly text: string;
  readonly provisional: readonly number[];
  /** Lines read as if text had been typed at their end (provisional places). */
  virtual = new Set<number>();

  constructor(text: string, provisional: readonly number[] = []) {
    this.text = text;
    this.provisional = provisional;
  }

  // ------------------------------------------------------------ position helpers

  advanceOffset(count: number, columns: boolean): void {
    const ln = this.line;
    let c: number;
    while (count > 0 && (c = peek(ln, this.offset)) !== -1) {
      if (c === 9) {
        const charsToTab = 4 - (this.column % 4);
        if (columns) {
          this.partiallyConsumedTab = charsToTab > count;
          const charsToAdvance = charsToTab > count ? count : charsToTab;
          this.column += charsToAdvance;
          this.offset += this.partiallyConsumedTab ? 0 : 1;
          count -= charsToAdvance;
        } else {
          this.partiallyConsumedTab = false;
          this.column += charsToTab;
          this.offset += 1;
          count -= 1;
        }
      } else {
        this.partiallyConsumedTab = false;
        this.offset += 1;
        this.column += 1;
        count -= 1;
      }
    }
  }

  advanceNextNonspace(): void {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  }

  findNextNonspace(): void {
    const ln = this.line;
    let i = this.offset;
    let cols = this.column;
    let c = -1;
    while ((c = peek(ln, i)) !== -1) {
      if (c === 32) {
        i++;
        cols++;
      } else if (c === 9) {
        i++;
        cols += 4 - (cols % 4);
      } else break;
    }
    this.blank = c === -1 || c === 10 || c === 13;
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = this.nextNonspaceColumn - this.column;
    this.indented = this.indent >= CODE_INDENT;
  }

  /** Records the part of the line from (offset, column) to the current position as `block`'s piece. */
  piece(block: MBlock, from: number, fromColumn: number): void {
    this.pieces.push({
      block,
      from: this.lineStart + from,
      to: this.lineStart + this.offset,
      fromColumn,
      toColumn: this.column,
      partialTab: this.partiallyConsumedTab,
    });
  }

  // ------------------------------------------------------------ tree helpers

  addChild(type: BlockType): MBlock {
    while (!canContain(this.tip.type, type)) this.finalize(this.tip, this.lineIndex - 1);
    const b = newBlock(type, this.lineIndex);
    b.parent = this.tip;
    this.tip.children.push(b);
    this.tip = b;
    return b;
  }

  closeUnmatchedBlocks(): void {
    if (!this.allClosed) {
      while (this.oldtip !== this.lastMatchedContainer) {
        const parent = this.oldtip.parent!;
        this.finalize(this.oldtip, this.lineIndex - 1);
        this.oldtip = parent;
      }
      this.allClosed = true;
    }
  }

  addLine(): void {
    const tip = this.tip;
    if (tip.type === 'paragraph') {
      let s = '';
      if (this.partiallyConsumedTab) {
        this.offset += 1;
        s = ' '.repeat(4 - (this.column % 4));
      }
      tip.content += s + this.line.slice(this.offset) + '\n';
      tip.contentLines.push(this.lineIndex);
    } else {
      if (this.partiallyConsumedTab) this.offset += 1;
      if (tip.type === 'code_block' && !tip.fenced) tip.codeLines.push({ line: this.lineIndex, from: this.offset });
    }
    this.lineLeaf[this.lineIndex] = tip;
  }

  // ------------------------------------------------------------ finalization

  finalize(block: MBlock, endLine: number): void {
    const above = block.parent;
    block.open = false;
    block.endLine = endLine;
    switch (block.type) {
      case 'paragraph':
        this.extractRefdefs(block);
        if (block.contentLines.length === 0 || isBlank(block.content)) this.unlink(block);
        else block.startLine = block.contentLines[0]!;
        break;
      case 'list':
        this.finalizeList(block);
        break;
      case 'item':
        if (block.children.length > 0) block.endLine = block.children[block.children.length - 1]!.endLine;
        else block.endLine = block.startLine;
        break;
      case 'code_block':
        if (!block.fenced) {
          // trailing blank lines are not part of an indented code block
          const lines = block.codeLines;
          while (lines.length > 1) {
            const last = lines[lines.length - 1]!;
            const lineText = this.lineText(last.line);
            if (!reBlankContent.test(lineText.slice(last.from))) break;
            lines.pop();
            if (this.lineLeaf[last.line] === block) this.lineLeaf[last.line] = null;
          }
          block.endLine = lines[lines.length - 1]!.line;
        }
        break;
      case 'html_block':
      case 'document':
      case 'blockquote':
      case 'heading':
      case 'thematic_break':
      case 'refdef':
        break;
    }
    this.tip = above!;
  }

  finalizeList(block: MBlock): void {
    let tight = true;
    outer: for (const item of block.children) {
      if (endsWithBlankLine(item)) {
        tight = false;
        break;
      }
      for (const sub of item.children) {
        if (endsWithBlankLine(sub)) {
          tight = false;
          break outer;
        }
      }
    }
    block.tight = tight;
    block.endLine = block.children[block.children.length - 1]!.endLine;
  }

  /** Splits link reference definitions off the start of a paragraph into blocks of their own. */
  extractRefdefs(p: MBlock): void {
    const parent = p.parent!;
    while (peek(p.content, 0) === 91 /* [ */) {
      const ref = scanReference(p.content);
      if (ref === null) break;
      const consumed = p.content.slice(0, ref.length);
      let lineCount = 0;
      for (let i = 0; i < consumed.length; i++) if (consumed.charCodeAt(i) === 10) lineCount++;
      const lines = p.contentLines.slice(0, lineCount);
      const def = newBlock('refdef', lines[0]!);
      def.endLine = lines[lines.length - 1]!;
      def.open = false;
      def.label = ref.label;
      def.parent = parent;
      parent.children.splice(parent.children.indexOf(p), 0, def);
      for (const l of lines) this.lineLeaf[l] = def;
      p.content = p.content.slice(ref.length);
      p.contentLines = p.contentLines.slice(lineCount);
    }
  }

  unlink(block: MBlock): void {
    const siblings = block.parent!.children;
    siblings.splice(siblings.indexOf(block), 1);
  }

  lineText(index: number): string {
    return this.lineTexts[index]!;
  }

  lineTexts: string[] = [];

  // ------------------------------------------------------------ container continuation

  /** 0 = matched, 1 = not matched, 2 = line fully handled (closing fence). */
  continueBlock(container: MBlock): 0 | 1 | 2 {
    const ln = this.line;
    switch (container.type) {
      case 'document':
      case 'list':
        return 0;
      case 'blockquote': {
        if (!this.indented && peek(ln, this.nextNonspace) === 62 /* > */) {
          const from = this.offset;
          const fromColumn = this.column;
          this.advanceNextNonspace();
          this.advanceOffset(1, false);
          if (isSpaceOrTab(peek(ln, this.offset))) this.advanceOffset(1, true);
          this.piece(container, from, fromColumn);
          return 0;
        }
        return 1;
      }
      case 'item': {
        const data = container.list!;
        const from = this.offset;
        const fromColumn = this.column;
        if (this.blank) {
          if (container.children.length === 0) return 1; // blank line after empty item
          this.advanceNextNonspace();
        } else if (this.indent >= data.markerOffset + data.padding) {
          this.advanceOffset(data.markerOffset + data.padding, true);
        } else {
          return 1;
        }
        this.piece(container, from, fromColumn);
        return 0;
      }
      case 'heading':
      case 'thematic_break':
      case 'refdef':
        return 1;
      case 'code_block': {
        if (container.fenced) {
          const m =
            this.indent <= 3 &&
            ln.charAt(this.nextNonspace) === container.fenceChar &&
            ln.slice(this.nextNonspace).match(reClosingCodeFence);
          if (m && m[0].length >= container.fenceLength!) {
            this.lineLeaf[this.lineIndex] = container;
            this.finalize(container, this.lineIndex);
            return 2;
          }
          let i = container.fenceOffset!;
          while (i > 0 && isSpaceOrTab(peek(ln, this.offset))) {
            this.advanceOffset(1, true);
            i--;
          }
          return 0;
        }
        if (this.indent >= CODE_INDENT) this.advanceOffset(CODE_INDENT, true);
        else if (this.blank) this.advanceNextNonspace();
        else return 1;
        return 0;
      }
      case 'html_block':
        return this.blank && (container.htmlType === 6 || container.htmlType === 7) ? 1 : 0;
      case 'paragraph':
        return this.blank ? 1 : 0;
    }
  }

  // ------------------------------------------------------------ block starts

  /** 0 = no match, 1 = matched container, 2 = matched leaf. */
  blockStart(container: MBlock): 0 | 1 | 2 {
    return (
      this.startBlockquote() ||
      this.startAtxHeading() ||
      this.startFencedCode() ||
      this.startHtmlBlock(container) ||
      this.startSetextHeading(container) ||
      this.startThematicBreak() ||
      this.startListItem(container) ||
      this.startIndentedCode()
    );
  }

  startBlockquote(): 0 | 1 {
    if (this.indented || peek(this.line, this.nextNonspace) !== 62) return 0;
    const from = this.offset;
    const fromColumn = this.column;
    this.advanceNextNonspace();
    this.advanceOffset(1, false);
    if (isSpaceOrTab(peek(this.line, this.offset))) this.advanceOffset(1, true);
    this.closeUnmatchedBlocks();
    const b = this.addChild('blockquote');
    this.piece(b, from, fromColumn);
    return 1;
  }

  startAtxHeading(): 0 | 2 {
    if (this.indented) return 0;
    const m = this.line.slice(this.nextNonspace).match(reATXHeadingMarker);
    if (!m) return 0;
    this.advanceNextNonspace();
    this.advanceOffset(m[0].length, false);
    this.closeUnmatchedBlocks();
    const b = this.addChild('heading');
    b.level = m[0].trim().length;
    this.lineLeaf[this.lineIndex] = b;
    this.advanceOffset(this.line.length - this.offset, false);
    return 2;
  }

  startFencedCode(): 0 | 2 {
    if (this.indented) return 0;
    const m = this.line.slice(this.nextNonspace).match(reCodeFence);
    if (!m) return 0;
    const fenceLength = m[0].length;
    this.closeUnmatchedBlocks();
    const b = this.addChild('code_block');
    b.fenced = true;
    b.fenceLength = fenceLength;
    b.fenceChar = m[0][0]!;
    b.fenceOffset = this.indent;
    this.advanceNextNonspace();
    this.advanceOffset(fenceLength, false);
    b.info = this.line.slice(this.offset).trim();
    return 2;
  }

  startHtmlBlock(container: MBlock): 0 | 2 {
    if (this.indented || peek(this.line, this.nextNonspace) !== 60 /* < */) return 0;
    const s = this.line.slice(this.nextNonspace);
    for (let type = 1; type <= 7; type++) {
      if (
        reHtmlBlockOpen[type]!.test(s) &&
        (type < 7 || (container.type !== 'paragraph' && !(!this.allClosed && !this.blank && this.tip.type === 'paragraph')))
      ) {
        this.closeUnmatchedBlocks();
        // spaces are part of the HTML block: offset is not advanced
        const b = this.addChild('html_block');
        b.htmlType = type;
        return 2;
      }
    }
    return 0;
  }

  startSetextHeading(container: MBlock): 0 | 2 {
    if (this.indented || container.type !== 'paragraph') return 0;
    const m = this.line.slice(this.nextNonspace).match(reSetextHeadingLine);
    if (!m) return 0;
    this.closeUnmatchedBlocks();
    this.extractRefdefs(container);
    if (container.content.length === 0) return 0;
    const heading = newBlock('heading', container.contentLines[0]!);
    heading.level = m[0][0] === '=' ? 1 : 2;
    heading.setext = true;
    heading.parent = container.parent;
    const siblings = container.parent!.children;
    siblings[siblings.indexOf(container)] = heading;
    for (const l of container.contentLines) this.lineLeaf[l] = heading;
    this.lineLeaf[this.lineIndex] = heading;
    this.tip = heading;
    this.advanceOffset(this.line.length - this.offset, false);
    return 2;
  }

  startThematicBreak(): 0 | 2 {
    if (this.indented || !reThematicBreak.test(this.line.slice(this.nextNonspace))) return 0;
    this.closeUnmatchedBlocks();
    const b = this.addChild('thematic_break');
    this.lineLeaf[this.lineIndex] = b;
    this.advanceOffset(this.line.length - this.offset, false);
    return 2;
  }

  startListItem(container: MBlock): 0 | 1 {
    if (this.indented && container.type !== 'list') return 0;
    const from = this.offset;
    const fromColumn = this.column;
    const data = this.parseListMarker(container);
    if (!data) return 0;
    this.closeUnmatchedBlocks();
    if (this.tip.type !== 'list' || !listsMatch(this.tip.list!, data.list)) {
      const list = this.addChild('list');
      list.list = data.list;
    }
    const item = this.addChild('item');
    item.list = data.list;
    item.markerFrom = this.lineStart + data.markerFrom;
    item.markerTo = this.lineStart + data.markerTo;
    item.markerColumn = data.markerColumn;
    item.contentColumn = data.markerColumn + data.list.padding;
    this.piece(item, from, fromColumn);
    return 1;
  }

  parseListMarker(container: MBlock): { list: ListData; markerFrom: number; markerTo: number; markerColumn: number } | null {
    if (this.indent >= 4) return null;
    const ln = this.line;
    const rest = ln.slice(this.nextNonspace);
    let m: RegExpMatchArray | null;
    let type: 'bullet' | 'ordered';
    let bulletChar: string | null = null;
    let start: number | null = null;
    let delimiter: string | null = null;
    if ((m = rest.match(reBulletListMarker))) {
      type = 'bullet';
      bulletChar = m[0][0]!;
    } else if ((m = rest.match(reOrderedListMarker)) && (container.type !== 'paragraph' || m[1] === '1')) {
      type = 'ordered';
      start = parseInt(m[1]!, 10);
      delimiter = m[2]!;
    } else {
      return null;
    }
    const markerLength = m[0].length;
    let nextc = peek(ln, this.nextNonspace + markerLength);
    if (!(nextc === -1 || nextc === 9 || nextc === 32)) return null;
    // an item interrupting a paragraph can't start with a blank line
    if (container.type === 'paragraph' && !reNonSpace.test(ln.slice(this.nextNonspace + markerLength))) return null;

    const markerOffset = this.indent;
    this.advanceNextNonspace();
    const markerFrom = this.offset;
    const markerColumn = this.column;
    this.advanceOffset(markerLength, true);
    const markerTo = this.offset;
    const spacesStartCol = this.column;
    const spacesStartOffset = this.offset;
    do {
      this.advanceOffset(1, true);
      nextc = peek(ln, this.offset);
    } while (this.column - spacesStartCol < 5 && isSpaceOrTab(nextc));
    const blankItem = peek(ln, this.offset) === -1;
    const spacesAfterMarker = this.column - spacesStartCol;
    let padding: number;
    if (spacesAfterMarker >= 5 || spacesAfterMarker < 1 || blankItem) {
      padding = markerLength + 1;
      this.column = spacesStartCol;
      this.offset = spacesStartOffset;
      this.partiallyConsumedTab = false;
      if (isSpaceOrTab(peek(ln, this.offset))) this.advanceOffset(1, true);
    } else {
      padding = markerLength + spacesAfterMarker;
    }
    return { list: { type, bulletChar, delimiter, start, markerOffset, padding }, markerFrom, markerTo, markerColumn };
  }

  startIndentedCode(): 0 | 2 {
    if (!this.indented || this.tip.type === 'paragraph' || this.blank) return 0;
    this.advanceOffset(CODE_INDENT, true);
    this.closeUnmatchedBlocks();
    this.addChild('code_block');
    return 2;
  }

  // ------------------------------------------------------------ the line loop

  incorporateLine(index: number, start: number, end: number): void {
    this.lineIndex = index;
    this.lineStart = start;
    let ln = this.text.slice(start, end);
    this.lineTexts.push(ln);
    // NUL is replaced for interpretation only; offsets are unchanged
    if (ln.indexOf('\u0000') !== -1) ln = ln.replace(/\0/g, '\uFFFD');
    // a provisional place reads as content after the line's real end
    if (this.virtual.has(index)) ln += '\uFFFC';
    this.line = ln;
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.pieces = [];
    this.lineLeaf[index] = null;
    this.lineLazy[index] = false;
    this.oldtip = this.tip;

    let container = this.doc;
    let lastChild: MBlock | undefined;
    while ((lastChild = container.children[container.children.length - 1]) && lastChild.open) {
      container = lastChild;
      this.findNextNonspace();
      const res = this.continueBlock(container);
      if (res === 2) return this.recordLine();
      if (res === 1) {
        container = container.parent!;
        break;
      }
    }

    this.allClosed = container === this.oldtip;
    this.lastMatchedContainer = container;

    let matchedLeaf = container.type !== 'paragraph' && acceptsLines(container.type);
    while (!matchedLeaf) {
      this.findNextNonspace();
      if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
        this.advanceNextNonspace();
        break;
      }
      const res = this.blockStart(container);
      if (res === 0) {
        this.advanceNextNonspace();
        break;
      }
      container = this.tip;
      if (res === 2) matchedLeaf = true;
    }

    if (!this.allClosed && !this.blank && this.tip.type === 'paragraph') {
      // lazy paragraph continuation: some enclosing container did not match this line
      this.lineLazy[index] = true;
      this.addLine();
    } else {
      this.closeUnmatchedBlocks();
      if (acceptsLines(container.type)) {
        this.addLine();
        if (
          container.type === 'html_block' &&
          container.htmlType! >= 1 &&
          container.htmlType! <= 5 &&
          reHtmlBlockClose[container.htmlType!]!.test(this.line.slice(this.offset))
        ) {
          this.finalize(container, index);
        }
      } else if (this.offset < ln.length && !this.blank) {
        this.addChild('paragraph');
        this.advanceNextNonspace();
        this.addLine();
      }
    }
    this.recordLine();
  }

  recordLine(): void {
    this.linePieces[this.lineIndex] = this.pieces;
  }

  parse(): SyntaxTree {
    const bounds = splitLines(this.text);
    const starts = [...bounds.starts];
    const ends = [...bounds.ends];
    for (const p of this.provisional) {
      const len = this.text.length;
      if (p === len && (len === 0 || this.text.charCodeAt(len - 1) === 10 || this.text.charCodeAt(len - 1) === 13)) {
        // a place after the final line ending is an empty last line
        if (starts[starts.length - 1] !== len) {
          starts.push(len);
          ends.push(len);
        }
        this.virtual.add(starts.length - 1);
        continue;
      }
      const i = lineIndexAt({ starts, ends }, p);
      if (ends[i] === p) this.virtual.add(i);
    }
    const n = starts.length;
    for (let i = 0; i < n; i++) this.incorporateLine(i, starts[i]!, ends[i]!);
    this.lineIndex = n;
    while (this.tip !== this.doc) this.finalize(this.tip, n - 1);
    this.finalize(this.doc, n - 1);
    this.doc.startLine = 0;
    return this.freeze(starts, ends);
  }

  freeze(starts: readonly number[], ends: readonly number[]): SyntaxTree {
    const map = new Map<MBlock, Block>();
    const convert = (m: MBlock, parent: Block | null): Block => {
      const b: { -readonly [K in keyof Block]: Block[K] } = {
        type: m.type,
        startLine: m.startLine,
        endLine: m.endLine,
        children: [],
        parent,
      };
      for (const key of [
        'level', 'setext', 'fenced', 'fenceChar', 'fenceLength', 'fenceOffset', 'info', 'htmlType', 'list', 'tight',
        'markerFrom', 'markerTo', 'markerColumn', 'contentColumn', 'label',
      ] as const) {
        if (m[key] !== undefined) (b as Record<string, unknown>)[key] = m[key];
      }
      map.set(m, b);
      b.children = m.children.map((c) => convert(c, b));
      return b;
    };
    const root = convert(this.doc, null);
    const lines: LineInfo[] = [];
    for (let i = 0; i < starts.length; i++) {
      const prefix: PrefixPiece[] = (this.linePieces[i] ?? []).map((p) => ({ ...p, block: map.get(p.block)! }));
      const leafM = this.lineLeaf[i] ?? null;
      const leaf = leafM ? (map.get(leafM) ?? null) : null;
      const last = prefix[prefix.length - 1];
      lines.push({
        index: i,
        from: starts[i]!,
        to: ends[i]!,
        ending: lineEnding(this.text, ends[i]!),
        prefix,
        contentFrom: last ? last.to : starts[i]!,
        contentColumn: last ? last.toColumn : 0,
        container: last ? last.block : root,
        leaf,
        lazy: this.lineLazy[i] ?? false,
        blank: !reNonSpace.test(this.text.slice(starts[i]!, ends[i]!)),
      });
    }
    return { text: this.text, root, lines };
  }
}

const listsMatch = (a: ListData, b: ListData): boolean =>
  a.type === b.type && a.delimiter === b.delimiter && a.bulletChar === b.bulletChar;

export interface ParseOptions {
  /**
   * Provisional places: offsets at the end of lines the parser reads as if text had been typed
   * there. An empty item right after a paragraph (`- a` / `  - `) is otherwise a setext heading,
   * and an empty line is otherwise no paragraph. An offset after a final line ending stands for
   * an empty last line.
   */
  readonly provisional?: readonly number[];
}

/** Parses CommonMark block structure. Never fails: every string is a document. */
export function parseCommonMark(text: string, options: ParseOptions = {}): SyntaxTree {
  return new Parser(text, options.provisional).parse();
}
