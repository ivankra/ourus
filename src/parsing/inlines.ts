// The inline parser: a leaf's inline text to a tree of inline nodes. The algorithm is commonmark.js
// 0.31.2's (lib/inlines.js, BSD-2-Clause, see NOTICE): a scan by trigger characters, a delimiter
// stack for emphasis-like runs and a bracket stack for links, resolved as the spec describes. What
// the triggers do comes from the flavor (inline-rules.ts for CommonMark's own).
//
// It is lossless: nodes hold offsets into the text, never copies of it. A node's range covers its
// markup; the text between children is markup too (`**`, `](url)`). Values the markup stands for
// (an entity's character, a link's decoded destination) are computed once and kept on the node.

import { codePointAt, codePointBefore, isPunctuation, isUnicodeWhitespace, normalizeLabel } from './chars.ts';
import type { Reference } from './refs.ts';
import type { Inline } from './types.ts';

/** Tries to parse something at `p.pos`, whose character is one of `triggers`. True when it consumed input. */
export interface InlineRule {
  readonly name: string;
  readonly triggers: string;
  /** Tried before the rule with this name for the same trigger (else after the rules already there). */
  readonly before?: string;
  parse(p: InlineParser): boolean;
}

/** A kind of emphasis-like delimiter run (`*`, `_`, GFM's `~`, Obsidian's `=`). */
export interface DelimiterRule {
  readonly char: string;
  /** `_`'s stricter flanking rules: no opening or closing inside a word. */
  readonly strict?: boolean;
  /** Whether a run of `length` can open or close at all (else it is plain text). */
  accepts?(length: number): boolean;
  /**
   * What a matched pair of runs makes: how many delimiters it takes from each, and the node's type.
   * Null drops the pair (and the delimiters between them), leaving the text as it is.
   */
  match(opener: DelimiterRun, closer: DelimiterRun): { use: number; type: string } | null;
}

export interface DelimiterRun {
  /** Delimiters left in the run. */
  readonly count: number;
  /** The run's length as written. */
  readonly length: number;
}

/**
 * Tried at a `]` that has an opener: before CommonMark's link resolution (`phase: 'before'`), or
 * when it found no link (`'after'`). True when the rule handled the bracket.
 */
export interface BracketRule {
  readonly name: string;
  readonly phase: 'before' | 'after';
  resolve(p: InlineParser, opener: Bracket): boolean;
}

/** Runs over the text nodes outside links once parsing is done (GFM's email autolinks). */
export interface TextRule {
  readonly name: string;
  process(p: InlineParser, node: Node): void;
}

/** The inline rules of a flavor, compiled. */
export interface InlineConfig {
  readonly rules: readonly (readonly InlineRule[] | undefined)[];
  readonly otherRules: ReadonlyMap<number, readonly InlineRule[]>;
  readonly delimiters: ReadonlyMap<number, DelimiterRule>;
  readonly brackets: readonly BracketRule[];
  readonly textRules: readonly TextRule[];
  /** Whether character code `c` (below 128) stops a run of plain text. */
  readonly stops: Uint8Array;
}

export function compileInlines(rules: readonly InlineRule[], delimiters: readonly DelimiterRule[], brackets: readonly BracketRule[], textRules: readonly TextRule[]): InlineConfig {
  const byChar = new Map<number, InlineRule[]>();
  for (const rule of rules) {
    for (const ch of rule.triggers) {
      const code = ch.charCodeAt(0);
      const list = byChar.get(code) ?? [];
      const at = rule.before ? list.findIndex((r) => r.name === rule.before) : -1;
      if (at >= 0) list.splice(at, 0, rule);
      else list.push(rule);
      byChar.set(code, list);
    }
  }
  const stops = new Uint8Array(128);
  const ascii: (readonly InlineRule[] | undefined)[] = new Array(128);
  const other = new Map<number, readonly InlineRule[]>();
  for (const [code, list] of byChar) {
    if (code < 128) {
      ascii[code] = list;
      stops[code] = 1;
    } else other.set(code, list);
  }
  stops[10] = 1;
  return {
    rules: ascii,
    otherRules: other,
    delimiters: new Map(delimiters.map((d) => [d.char.charCodeAt(0), d])),
    brackets,
    textRules,
    stops,
  };
}

/** What a leaf's inlines may refer to. */
export interface InlineContext {
  /** Link reference definitions, by normalized label. */
  readonly references: ReadonlyMap<string, Reference>;
  /** Footnote definitions' normalized labels (GFM). */
  readonly footnotes: ReadonlySet<string>;
}

// ------------------------------------------------------------------------------------- nodes

/** A node while parsing: a doubly linked tree, so emphasis and links can take in their siblings. */
export class Node {
  type: string;
  from: number;
  to: number;
  attrs: Record<string, unknown> | null;
  /** Holds inlines (emphasis, links): it has children, possibly none. */
  container = false;
  parent: Node | null = null;
  first: Node | null = null;
  last: Node | null = null;
  prev: Node | null = null;
  next: Node | null = null;

  constructor(type: string, from: number, to: number, attrs: Record<string, unknown> | null = null) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.attrs = attrs;
  }

  append(child: Node): void {
    child.unlink();
    child.parent = this;
    if (this.last) {
      this.last.next = child;
      child.prev = this.last;
    } else this.first = child;
    this.last = child;
  }

  insertAfter(sibling: Node): void {
    sibling.unlink();
    sibling.next = this.next;
    if (sibling.next) sibling.next.prev = sibling;
    sibling.prev = this;
    this.next = sibling;
    sibling.parent = this.parent;
    if (sibling.parent && !sibling.next) sibling.parent.last = sibling;
  }

  insertBefore(sibling: Node): void {
    sibling.unlink();
    sibling.prev = this.prev;
    if (sibling.prev) sibling.prev.next = sibling;
    sibling.next = this;
    this.prev = sibling;
    sibling.parent = this.parent;
    if (sibling.parent && !sibling.prev) sibling.parent.first = sibling;
  }

  unlink(): void {
    if (this.prev) this.prev.next = this.next;
    else if (this.parent) this.parent.first = this.next;
    if (this.next) this.next.prev = this.prev;
    else if (this.parent) this.parent.last = this.prev;
    this.parent = this.prev = this.next = null;
  }
}

interface Delimiter {
  readonly char: number;
  readonly rule: DelimiterRule;
  count: number;
  readonly length: number;
  /** The run's text node. */
  readonly node: Node;
  readonly canOpen: boolean;
  readonly canClose: boolean;
  prev: Delimiter | null;
  next: Delimiter | null;
}

/** An open `[` or `![` on the bracket stack. */
export interface Bracket {
  /** The `[` (or `![`) text node. */
  readonly node: Node;
  readonly prev: Bracket | null;
  /** The delimiter on top of the stack when the bracket was opened. */
  readonly prevDelimiter: Delimiter | null;
  /** Offset of the `[`. */
  readonly index: number;
  readonly image: boolean;
  /** An extension's own bracket (Obsidian's `^[` inline footnote), resolved by its bracket rule; else null. */
  readonly kind: string | null;
  /** Order of opening, for `InlineParser.isActive`. */
  readonly id: number;
  /** A `[` came after this one. */
  bracketAfter: boolean;
}

// ------------------------------------------------------------------------------------ parser

export class InlineParser {
  readonly config: InlineConfig;
  readonly context: InlineContext;
  readonly text: string;
  pos = 0;
  readonly root = new Node('root', 0, 0);
  delimiters: Delimiter | null = null;
  brackets: Bracket | null = null;
  private bracketIds = 0;
  /** What a rule found there is none of after some point (cmark's "skip" flags), for rules to share. */
  readonly flags = new Set<string>();
  /** Rules' memos, by name (positions they found once and reuse). */
  readonly memo = new Map<string, unknown>();
  /** Link openers opened before this one are inactive: a link was made after them (no links in links). */
  private linkBarrier = 0;
  /** Code spans: for each backtick run length, the offsets of the runs after the scan position. */
  private ticks: Map<number, number[]> | null = null;
  private tickCursor: Map<number, number> | null = null;

  constructor(config: InlineConfig, context: InlineContext, text: string) {
    this.config = config;
    this.context = context;
    this.text = text;
    this.root.to = text.length;
  }

  /** Parses the whole text. */
  parse(): Inline[] {
    const { text, config } = this;
    const n = text.length;
    outer: while (this.pos < n) {
      const c = text.charCodeAt(this.pos);
      const rules = c < 128 ? config.rules[c] : config.otherRules.get(c);
      if (rules) {
        const start = this.pos;
        for (const rule of rules) {
          if (rule.parse(this)) continue outer;
          this.pos = start;
        }
        // no rule took it: the character as text
        this.addText(start, start + 1);
        this.pos = start + 1;
        continue;
      }
      // a run of plain text up to the next trigger
      const start = this.pos;
      let i = start + 1;
      const stops = config.stops;
      const other = config.otherRules;
      while (i < n) {
        const d = text.charCodeAt(i);
        if (d < 128 ? stops[d] : other.size && other.has(d)) break;
        i++;
      }
      this.addText(start, i);
      this.pos = i;
    }
    this.processEmphasis(null);
    if (config.textRules.length) this.runTextRules(this.root);
    return freeze(this.root);
  }

  // ------------------------------------------------------------------------ building nodes

  /** Appends a node to the current top level. */
  add(node: Node): Node {
    this.root.append(node);
    return node;
  }

  /** Appends plain text `[from, to)`. */
  addText(from: number, to: number): Node {
    return this.add(new Node('text', from, to));
  }

  /** The last top-level node. */
  get lastNode(): Node | null {
    return this.root.last;
  }

  /** Takes `count` characters back off the end of the last node, a text node ending at `pos` (GFM's URL autolinks). */
  unputText(count: number): boolean {
    const last = this.root.last;
    if (!last || last.type !== 'text' || last.to !== this.pos || last.to - last.from < count) return false;
    last.to -= count;
    if (last.to === last.from) {
      // a delimiter run can't be shortened away
      if (this.isDelimiterNode(last)) {
        last.to += count;
        return false;
      }
      last.unlink();
    }
    return true;
  }

  private isDelimiterNode(node: Node): boolean {
    for (let d = this.delimiters; d; d = d.prev) if (d.node === node) return true;
    return false;
  }

  // ----------------------------------------------------------------------------- delimiters

  /**
   * Scans the run of `rule.char` at `pos`: pushes it as a delimiter when it can open or close, and
   * appends it as text either way.
   */
  handleDelimiters(rule: DelimiterRule): boolean {
    const { text } = this;
    const char = text.charCodeAt(this.pos);
    const start = this.pos;
    let end = start;
    while (end < text.length && text.charCodeAt(end) === char) end++;
    const length = end - start;
    const before = codePointBefore(text, start);
    const after = codePointAt(text, end);
    const afterWhite = after === -1 || isUnicodeWhitespace(after);
    const afterPunct = after !== -1 && isPunctuation(after);
    const beforeWhite = before === -1 || isUnicodeWhitespace(before);
    const beforePunct = before !== -1 && isPunctuation(before);
    const leftFlanking = !afterWhite && (!afterPunct || beforeWhite || beforePunct);
    const rightFlanking = !beforeWhite && (!beforePunct || afterWhite || afterPunct);
    let canOpen: boolean;
    let canClose: boolean;
    if (rule.strict) {
      canOpen = leftFlanking && (!rightFlanking || beforePunct);
      canClose = rightFlanking && (!leftFlanking || afterPunct);
    } else {
      canOpen = leftFlanking;
      canClose = rightFlanking;
    }
    this.pos = end;
    const node = this.addText(start, end);
    if ((canOpen || canClose) && (!rule.accepts || rule.accepts(length))) {
      const d: Delimiter = { char, rule, count: length, length, node, canOpen, canClose, prev: this.delimiters, next: null };
      if (d.prev) d.prev.next = d;
      this.delimiters = d;
    }
    return true;
  }

  private removeDelimiter(d: Delimiter): void {
    if (d.prev) d.prev.next = d.next;
    if (d.next) d.next.prev = d.prev;
    else this.delimiters = d.prev;
  }

  /** Resolves the delimiters above `bottom` into emphasis (and other delimited nodes). */
  processEmphasis(bottom: Delimiter | null): void {
    // per (character, can open, length mod 3): the lowest delimiter worth looking back to
    const openersBottom = new Map<number, Delimiter | null>();
    let closer = this.delimiters;
    while (closer && closer.prev !== bottom) closer = closer.prev;
    while (closer) {
      if (!closer.canClose) {
        closer = closer.next;
        continue;
      }
      const key = closer.char * 6 + (closer.canOpen ? 3 : 0) + (closer.length % 3);
      const limit = openersBottom.has(key) ? openersBottom.get(key)! : bottom;
      let opener = closer.prev;
      let found = false;
      while (opener && opener !== bottom && opener !== limit) {
        const oddMatch = (closer.canOpen || opener.canClose) && closer.length % 3 !== 0 && (opener.length + closer.length) % 3 === 0;
        if (opener.char === closer.char && opener.canOpen && !oddMatch) {
          found = true;
          break;
        }
        opener = opener.prev;
      }
      const oldCloser = closer;
      if (found && opener) {
        const m = closer.rule.match(opener, closer);
        if (m) {
          const use = m.use;
          const openerNode = opener.node;
          const closerNode = closer.node;
          opener.count -= use;
          closer.count -= use;
          openerNode.to -= use;
          closerNode.from += use;
          const node = new Node(m.type, openerNode.to, closerNode.from);
          node.container = true;
          for (let tmp = openerNode.next; tmp && tmp !== closerNode; ) {
            const next = tmp.next;
            node.append(tmp);
            tmp = next;
          }
          openerNode.insertAfter(node);
          // the delimiters between them are spent
          if (opener.next !== closer) {
            opener.next = closer;
            closer.prev = opener;
          }
          if (opener.count === 0) {
            openerNode.unlink();
            this.removeDelimiter(opener);
          }
          if (closer.count === 0) {
            closerNode.unlink();
            const next = closer.next;
            this.removeDelimiter(closer);
            closer = next;
          }
        } else {
          // the pair makes nothing: it and the delimiters between them stay text
          const next = closer.next;
          for (let d: Delimiter | null = closer; d && d !== opener; ) {
            const prev: Delimiter | null = d.prev;
            this.removeDelimiter(d);
            d = prev;
          }
          this.removeDelimiter(opener);
          closer = next;
        }
      } else closer = closer.next;
      if (!found) {
        openersBottom.set(key, oldCloser.prev);
        if (!oldCloser.canOpen) this.removeDelimiter(oldCloser);
      }
    }
    while (this.delimiters && this.delimiters !== bottom) this.removeDelimiter(this.delimiters);
  }

  // -------------------------------------------------------------------------------- brackets

  /** Pushes a `[` (or `![`) whose text node is `node`; `index` is the offset of the `[`. */
  addBracket(node: Node, index: number, image: boolean, kind: string | null = null): void {
    if (this.brackets) this.brackets.bracketAfter = true;
    this.brackets = { node, prev: this.brackets, prevDelimiter: this.delimiters, index, image, kind, id: this.bracketIds++, bracketAfter: false };
  }

  /** Whether an opener can still make a link: not a link opener opened before a link was made. */
  isActive(opener: Bracket): boolean {
    return opener.image || opener.kind !== null || opener.id >= this.linkBarrier;
  }

  /** A link was made: the link openers open now can't make another (in constant time, not by walking the stack). */
  deactivateLinkOpeners(): void {
    this.linkBarrier = this.bracketIds;
  }

  removeBracket(): void {
    this.brackets = this.brackets!.prev;
  }

  /**
   * Makes the nodes after `opener`'s text node the children of `node`, puts `node` in its place and
   * resolves the emphasis inside. The opener comes off the stack.
   */
  closeBracket(opener: Bracket, node: Node): void {
    node.container = true;
    for (let tmp = opener.node.next; tmp; ) {
      const next = tmp.next;
      node.append(tmp);
      tmp = next;
    }
    this.add(node);
    this.processEmphasis(opener.prevDelimiter);
    this.removeBracket();
    opener.node.unlink();
  }

  // ------------------------------------------------------------------------------ code spans

  /** The offset of the first run of exactly `length` backticks at or after `from`, or -1. */
  findTicks(from: number, length: number): number {
    if (!this.ticks) {
      this.ticks = new Map();
      this.tickCursor = new Map();
      const { text } = this;
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) !== 96) continue;
        let j = i;
        while (j < text.length && text.charCodeAt(j) === 96) j++;
        const list = this.ticks.get(j - i);
        if (list) list.push(i);
        else this.ticks.set(j - i, [i]);
        i = j - 1;
      }
    }
    const list = this.ticks.get(length);
    if (!list) return -1;
    let k = this.tickCursor!.get(length) ?? 0;
    while (k < list.length && list[k]! < from) k++;
    this.tickCursor!.set(length, k);
    return k < list.length ? list[k]! : -1;
  }

  // ------------------------------------------------------------------------------- text rules

  /**
   * Hands the runs of text outside links to the text rules, in document order. "Outside links" as
   * cmark-gfm's postprocess tracks it: entering a link starts a link, and the end of any link inside it
   * ends it (so text after a link nested in a link is outside); images don't count. Iterative.
   */
  private runTextRules(root: Node): void {
    let inLink = false;
    const stack: (Node | null)[] = [root.first];
    const parents: Node[] = [root];
    while (stack.length) {
      const node = stack[stack.length - 1];
      if (!node) {
        stack.pop();
        const parent = parents.pop()!;
        // leaving a link ends "in a link" (also a link nested in one)
        if (parent.type === 'link' || parent.type === 'autolink') inLink = false;
        continue;
      }
      const linkLike = node.type === 'link' || node.type === 'autolink';
      if (node.first || linkLike) {
        stack[stack.length - 1] = node.next;
        if (linkLike && !inLink) inLink = true;
        if (node.first) {
          stack.push(node.first);
          parents.push(node);
        } else if (linkLike) inLink = false;
        continue;
      }
      if (node.type === 'text' && !inLink) {
        // consolidate the run of adjacent text nodes, then hand it to the rules
        while (node.next && node.next.type === 'text' && node.next.from === node.to) {
          node.to = node.next.to;
          node.next.unlink();
        }
        const after = node.next;
        for (const rule of this.config.textRules) rule.process(this, node);
        stack[stack.length - 1] = after;
        continue;
      }
      stack[stack.length - 1] = node.next;
    }
  }

  /** Normalized label lookup. */
  reference(label: string): Reference | undefined {
    return this.context.references.get(normalizeLabel(label));
  }
}

const EMPTY: readonly Inline[] = Object.freeze([]);

/** The finished tree: immutable nodes, adjacent text merged. Iterative: nesting can be as deep as the text is long. */
function freeze(root: Node): Inline[] {
  interface Level {
    readonly node: Node;
    readonly out: Inline[];
    child: Node | null;
  }
  const top: Level = { node: root, out: [], child: root.first };
  const stack: Level[] = [top];
  while (stack.length) {
    const level = stack[stack.length - 1]!;
    const node = level.child;
    if (!node) {
      stack.pop();
      const parent = stack[stack.length - 1];
      if (parent) parent.out.push(finish(level.node, level.out));
      continue;
    }
    level.child = node.next;
    if (node.first) {
      stack.push({ node, out: [], child: node.first });
      continue;
    }
    if (node.type === 'text') {
      if (node.to === node.from) continue;
      const prev = level.out[level.out.length - 1];
      if (prev && prev.type === 'text' && prev.to === node.from) level.out[level.out.length - 1] = { type: 'text', from: prev.from, to: node.to };
      else level.out.push({ type: 'text', from: node.from, to: node.to });
      continue;
    }
    level.out.push(finish(node, node.container ? EMPTY : null));
  }
  return top.out;
}

function finish(node: Node, children: readonly Inline[] | null): Inline {
  const inline: Record<string, unknown> = { type: node.type, from: node.from, to: node.to };
  if (children) inline.children = children;
  if (node.attrs) Object.assign(inline, node.attrs);
  return inline as unknown as Inline;
}
