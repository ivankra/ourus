// The editor's caret and selection, mirrored in the rendered pane, which scrolls along with the editor.
// Moving the caret scrolls the pane only as far as it takes to keep the caret in view.
//
// Whatever the renderer, the pane's text is aligned with the source text by a character diff
// (Myers's): the characters they share, the text rather than its markup, carry a source position
// into the pane. A position in markup lands by the text it belongs with: after the text before it on
// its line, else before the text after it; a line of markup alone (a new item, an empty heading) in
// the block it makes, empty in the pane. Math, images and checkboxes are atoms that match nothing.
// The caret blinks in step with CodeMirror's: its animation is given the same start time.

import type { EditorView } from '@codemirror/view';

/** Elements taken whole: selected as one, never a caret inside. */
const ATOMS = '.katex, img, input';
/** Blocks that take the caret when they hold no text. */
const BLOCKS = 'li, p, h1, h2, h3, h4, h5, h6, td, th, blockquote';
/** Elements whose text isn't shown. */
const HIDDEN = '.sr-only, script, style';
/** Past this many differences, the texts are too far apart to align (the diff's memory grows as its square). */
const MAX_DIFFERENCES = 3000;

/** A run of the pane's text: a text node, or an atom or an empty block (one character, U+FFFC). */
interface Item {
  readonly node: Node;
  readonly start: number;
  readonly end: number;
  readonly empty?: boolean;
}

/** A place in the pane's text: before character `index`, or (`after`) after the one before it. */
interface Spot {
  readonly index: number;
  readonly after: boolean;
}

/** A whitespace-only text node is shown between inline neighbours, and in preformatted text. */
function shown(t: Text): boolean {
  if (/\S/.test(t.data) || t.parentElement?.closest('pre')) return true;
  const inline = (n: Node | null) => n instanceof Text || (n instanceof Element && getComputedStyle(n).display.startsWith('inline'));
  return inline(t.previousSibling) && inline(t.nextSibling);
}

/**
 * For each character of `a`, the character of `b` it is matched with, or -1: a longest common
 * subsequence, any whitespace matching any. Null when the texts differ in more than `limit` places.
 * Where characters of `a` could match the same one, the last of them does: markup and hidden text
 * come before the text they go with. The newline at the end of "list)\n- [ ] tasks" isn't matched
 * with the space after the checkbox in "list)\uFFFC tasks", nor is a heading's text with the same
 * text in the front matter before it.
 */
function align(a: string, b: string, limit: number): Int32Array | null {
  // the diff below matches the first it can: run on the texts reversed
  const match = alignFirst(a.split('').reverse().join(''), b.split('').reverse().join(''), limit);
  return match && match.reverse().map((j) => (j < 0 ? -1 : b.length - 1 - j));
}

/** Myers's diff: as `align`, where characters could match the same one, the first of them. */
function alignFirst(a: string, b: string, limit: number): Int32Array | null {
  a = a.replace(/\s/g, ' ');
  b = b.replace(/\s/g, ' ');
  const n = a.length;
  const m = b.length;
  const match = new Int32Array(n).fill(-1);
  const offset = limit + 1;
  const v = new Int32Array(2 * limit + 3);
  // the furthest x on each diagonal k = x - y after d differences, kept for k in [-d, d]
  const trace: Int32Array[] = [];
  let found = -1;
  for (let d = 0; d <= limit && found < 0; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!) ? v[offset + k + 1]! : v[offset + k - 1]! + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) x++, y++;
      v[offset + k] = x;
      if (x >= n && y >= m) found = d;
    }
    trace.push(v.slice(offset - d, offset + d + 1));
  }
  if (found < 0) return null;
  let x = n;
  let y = m;
  for (let d = found; d > 0; d--) {
    const prev = trace[d - 1]!;
    const at = (k: number) => prev[k + d - 1]!;
    const k = x - y;
    const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
    const prevX = at(prevK);
    const prevY = prevX - prevK;
    const startX = prevK === k + 1 ? prevX : prevX + 1;
    while (x > startX) match[--x] = --y;
    x = prevX;
    y = prevY;
  }
  while (x > 0) match[--x] = --y;
  return match;
}

export class Mirror {
  private readonly layer: HTMLElement;
  private readonly selections: HTMLElement;
  private readonly cursors: HTMLElement;
  /** Room below the document, for the pane to scroll as far as the editor wants. */
  private readonly spacer: HTMLElement;
  private source = '';
  private items: Item[] = [];
  private text = '';
  private match: Int32Array | null = null;

  private readonly view: EditorView;
  /** The scrolling pane. */
  private readonly pane: HTMLElement;
  /** The rendered document in it. */
  private readonly preview: HTMLElement;

  constructor(view: EditorView, pane: HTMLElement, preview: HTMLElement) {
    this.view = view;
    this.pane = pane;
    this.preview = preview;
    this.layer = pane.appendChild(document.createElement('div'));
    this.layer.className = 'mirror';
    this.selections = this.layer.appendChild(document.createElement('div'));
    this.cursors = this.layer.appendChild(document.createElement('div'));
    this.cursors.className = 'mirror-cursors';
    this.spacer = this.layer.appendChild(document.createElement('div'));
    this.spacer.className = 'mirror-spacer';
  }

  /** The pane was rendered again from `source`: aligns its text with it. */
  realign(source: string): void {
    const items: Item[] = [];
    let text = '';
    const walk = (parent: Node) => {
      for (let n = parent.firstChild; n; n = n.nextSibling) {
        if (n instanceof Text) {
          if (!shown(n)) continue;
          items.push({ node: n, start: text.length, end: text.length + n.data.length });
          text += n.data;
        } else if (n instanceof Element) {
          if (n.matches(ATOMS)) {
            items.push({ node: n, start: text.length, end: text.length + 1 });
            text += '\uFFFC';
          } else if (!n.matches(HIDDEN)) {
            const from = items.length;
            walk(n);
            if (n.matches(BLOCKS) && items.slice(from).every((item) => !(item.node instanceof Text) && !item.empty)) {
              items.push({ node: n, start: text.length, end: text.length + 1, empty: true });
              text += '\uFFFC';
            }
          }
        }
      }
    };
    walk(this.preview);
    this.source = source;
    this.items = items;
    this.text = text;
    this.match = align(source, text, MAX_DIFFERENCES);
  }

  /** Draws the editor's selection and carets, blinking with its own. */
  draw(): void {
    this.selections.replaceChildren();
    this.cursors.replaceChildren();
    this.layer.classList.toggle('focused', this.view.hasFocus);
    if (!this.match) return;
    const box = this.pane.getBoundingClientRect();
    const left = box.left + this.pane.clientLeft - this.pane.scrollLeft;
    const top = box.top + this.pane.clientTop - this.pane.scrollTop;
    const mark = (parent: HTMLElement, className: string, x: number, y: number, width: number, height: number) => {
      const el = parent.appendChild(document.createElement('div'));
      el.className = className;
      el.style.cssText = `left:${x - left}px;top:${y - top}px;width:${width}px;height:${height}px`;
    };
    for (const range of this.view.state.selection.ranges) {
      if (!range.empty) {
        for (const r of this.rects(this.spot(range.from), this.spot(range.to))) mark(this.selections, 'mirror-selection', r.left, r.top, r.width, r.height);
      }
      const caret = this.caret(this.spot(range.head));
      if (caret) mark(this.cursors, range === this.view.state.selection.main ? 'mirror-cursor mirror-cursor-primary' : 'mirror-cursor', caret.x, caret.top, 0, caret.height);
    }
    // the same blink as the editor's caret, which restarts it on every change of selection
    const theirs = this.view.scrollDOM.querySelector<HTMLElement>('.cm-cursorLayer');
    if (!theirs) return;
    this.cursors.style.animationDuration = theirs.style.animationDuration;
    const [a] = theirs.getAnimations();
    const [b] = this.cursors.getAnimations();
    if (a && b) {
      if (a.startTime !== null) b.startTime = a.startTime;
      else b.currentTime = a.currentTime;
    }
  }

  /**
   * Scrolls the pane as the editor is: the caret at the height it has in the editor, or when it's
   * out of view, the editor's top line at the top. Past its end, if need be.
   */
  scroll(): void {
    if (!this.match) return;
    const { view } = this;
    const scroller = view.scrollDOM.getBoundingClientRect();
    const head = view.state.selection.main.head;
    const coords = view.coordsAtPos(head);
    let pos: number;
    let offset: number;
    if (coords && coords.top >= scroller.top && coords.bottom <= scroller.bottom) {
      pos = head;
      offset = coords.top - scroller.top;
    } else {
      const line = view.lineBlockAtHeight(scroller.top - view.documentTop);
      pos = line.from;
      offset = view.documentTop + line.top - scroller.top;
    }
    const caret = this.caret(this.spot(pos));
    if (!caret) return;
    const box = this.pane.getBoundingClientRect();
    const target = Math.max(0, this.pane.scrollTop + caret.top - box.top - this.pane.clientTop - offset);
    this.spacer.style.top = `${target + this.pane.clientHeight - 1}px`;
    this.pane.scrollTop = target;
  }

  /** Scrolls the pane as little as it takes to show the main caret, with a line's margin. */
  reveal(): void {
    if (!this.match) return;
    const caret = this.caret(this.spot(this.view.state.selection.main.head));
    if (!caret) return;
    const box = this.pane.getBoundingClientRect();
    const top = box.top + this.pane.clientTop;
    const bottom = top + this.pane.clientHeight;
    const margin = Math.min(caret.height, this.pane.clientHeight / 4);
    if (caret.top < top + margin) this.pane.scrollTop = Math.max(0, this.pane.scrollTop + caret.top - top - margin);
    else if (caret.top + caret.height > bottom - margin) this.pane.scrollTop += caret.top + caret.height - bottom + margin;
  }

  /** Where a source position falls in the pane's text. */
  private spot(pos: number): Spot {
    const match = this.match!;
    pos = Math.min(pos, match.length);
    if (pos < match.length && match[pos]! >= 0) return { index: match[pos]!, after: false };
    let before = pos - 1;
    let newline = false;
    for (; before >= 0 && match[before]! < 0; before--) if (this.source[before] === '\n') newline = true;
    if (before >= 0 && !newline && this.source[before] !== '\n') return { index: match[before]! + 1, after: true };
    let after = pos;
    while (after < match.length && match[after]! < 0) after++;
    // a line of markup alone: the empty block it makes, by its count among such lines between the text around
    const lineStart = this.source.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = this.source.indexOf('\n', pos);
    if (lineStart > before && (lineEnd < 0 ? after === match.length : after >= lineEnd) && this.source.slice(lineStart, lineEnd < 0 ? undefined : lineEnd).trim()) {
      const lo = before >= 0 ? match[before]! + 1 : 0;
      const hi = after < match.length ? match[after]! : this.text.length;
      const empties = this.items.filter((item) => item.empty && item.start >= lo && item.start < hi);
      const lines = this.source.slice(before + 1, lineStart).split('\n');
      // the first is the end of the line of the text before, when there is some
      const k = lines.slice(before >= 0 ? 1 : 0).filter((l) => l.trim()).length;
      const empty = empties[Math.min(k, empties.length - 1)];
      if (empty) return { index: empty.start, after: false };
    }
    if (after < match.length) return { index: match[after]!, after: false };
    return before >= 0 ? { index: match[before]! + 1, after: true } : { index: 0, after: false };
  }

  /** The index of the item holding character `index` of the pane's text, or -1. */
  private itemAt(index: number): number {
    let lo = 0;
    let hi = this.items.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.items[mid]!.start <= index) lo = mid;
      else hi = mid - 1;
    }
    const item = this.items[lo];
    return item && item.start <= index && index < item.end ? lo : -1;
  }

  /** The box of character `index` of the pane's text, if it has one. */
  private charRect(index: number): DOMRect | null {
    const item = this.items[this.itemAt(index)];
    if (!item || item.empty) return null;
    if (!(item.node instanceof Text)) return (item.node as Element).getBoundingClientRect();
    const range = document.createRange();
    range.setStart(item.node, index - item.start);
    range.setEnd(item.node, index - item.start + 1);
    const rect = range.getClientRects()[0];
    return rect && rect.height > 0 ? rect : null;
  }

  /** The caret at a spot: by the character on its side, else the other. */
  private caret(spot: Spot): { x: number; top: number; height: number } | null {
    const item = spot.after ? undefined : this.items[this.itemAt(spot.index)];
    if (item?.empty) {
      // where text typed into the block would go
      const probe = item.node.appendChild(document.createTextNode('\u200b'));
      const range = document.createRange();
      range.selectNodeContents(probe);
      const rect = range.getBoundingClientRect();
      probe.remove();
      return { x: rect.left, top: rect.top, height: rect.height };
    }
    for (const i of spot.after ? [spot.index - 1, spot.index] : [spot.index, spot.index - 1]) {
      const rect = i >= 0 && i < this.text.length ? this.charRect(i) : null;
      if (rect) return { x: i < spot.index ? rect.right : rect.left, top: rect.top, height: rect.height };
    }
    return null;
  }

  /** The boxes of the pane's text between two spots. */
  private rects(from: Spot, to: Spot): DOMRect[] {
    const out: DOMRect[] = [];
    if (from.index >= to.index) return out;
    const range = document.createRange();
    for (let i = this.itemAt(from.index), item = this.items[i]; item && item.start < to.index; item = this.items[++i]) {
      if (item.empty) continue;
      if (!(item.node instanceof Text)) {
        out.push((item.node as Element).getBoundingClientRect());
        continue;
      }
      range.setStart(item.node, Math.max(from.index, item.start) - item.start);
      range.setEnd(item.node, Math.min(to.index, item.end) - item.start);
      out.push(...range.getClientRects());
    }
    return out;
  }
}
