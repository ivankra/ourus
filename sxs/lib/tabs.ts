// Indentation as Obsidian writes it: a test's spaces loaded as tabs, and read back as the spec's
// spaces. The Obsidian drivers load tests this way, and `test/obsidian-tabs.test.ts` plays the spec
// on the core so.

import type { TextDoc } from './text.ts';

/**
 * A line's indentation rewritten: pieces of the new indentation, each with how many characters of the
 * old it stands for (a tab for two spaces: 2; a space for a space: 1), so that a caret at a piece's
 * edge keeps its place.
 */
export type Pieces = [string, number][];

/**
 * A document with each line's indentation rewritten (`lead`, given every line, and the columns where
 * the selection's ends are on each), and its selection carried along.
 */
function reindent(d: TextDoc, lead: (lines: string[], ends: number[][]) => Pieces[]): TextDoc {
  const lines = d.text.split('\n');
  const ends: number[][] = lines.map(() => []);
  for (const { offset } of d.sel ? [{ offset: d.sel.anchor }, { offset: d.sel.head }] : []) {
    const line = d.text.slice(0, offset).split('\n').length - 1;
    ends[line]!.push(offset - (d.text.lastIndexOf('\n', offset - 1) + 1));
  }
  const pieces = lead(lines, ends);
  const out: string[] = [];
  /** Old offset of each line's start, and new. */
  let from = 0;
  let to = 0;
  const starts: [number, number, number, Pieces][] = [];
  lines.forEach((line, i) => {
    const ws = /^[ \t]*/.exec(line)![0];
    const now = pieces[i]!.map(([s]) => s).join('');
    starts.push([from, to, ws.length, pieces[i]!]);
    out.push(now + line.slice(ws.length));
    from += line.length + 1;
    to += now.length + line.length - ws.length + 1;
  });
  const map = (offset: number): number => {
    let i = starts.length - 1;
    while (i > 0 && starts[i]![0] > offset) i--;
    const [old, now, wsLength, ps] = starts[i]!;
    const col = offset - old;
    let o = 0;
    let n = 0;
    for (const [s, k] of ps) {
      // inside a piece (a caret between a tab's two spaces: `splitsIndent` declines it), its start
      if (col < o + k) break;
      o += k;
      n += s.length;
    }
    return now + (col <= wsLength ? n : n + col - wsLength);
  };
  return { text: out.join('\n'), sel: d.sel && { anchor: map(d.sel.anchor), head: map(d.sel.head) } };
}

/**
 * A list item's line: its indentation, and its text's column from the indentation: its marker and the
 * spaces after it (CommonMark's), but where a caret is after the marker's first space (`carets`), the
 * spaces after the caret are the text's (ourus's `- ┃ b`, a place before ` b`).
 */
function listItem(line: string, carets: number[] = []): { ws: string; width: number } | null {
  const m = /^([ \t]*)([-*+]|\d{1,9}[.)])( *)(\S?)/.exec(line);
  if (!m || (m[3] === '' && m[4] !== '')) return null;
  const spaces = m[3]!.length;
  const placed = spaces > 1 && carets.includes(m[1]!.length + m[2]!.length + 1);
  return { ws: m[1]!, width: m[2]!.length + (m[4] === '' || spaces > 4 || placed ? 1 : spaces) };
}

/**
 * Each line of a document with what is in a fenced code block (its fences not included) marked, to be
 * left out of the list structure.
 */
function inFences(lines: string[]): boolean[] {
  let fence: string | null = null;
  return lines.map((line) => {
    const m = /^[ \t]*(`{3,}|~{3,})/.exec(line);
    if (fence === null) {
      if (m) fence = m[1]!;
      return false;
    }
    if (m && m[1]![0] === fence[0] && m[1]!.length >= fence.length && !line.trim().slice(m[1]!.length)) fence = null;
    return fence !== null;
  });
}

/** Spaces of indentation as Obsidian's tabs beyond what the list structure says: each two a tab, an odd one a space. */
const paired = (n: number): Pieces => [...Array.from({ length: n >> 1 }, (): [string, number] => ['\t', 2]), ...(n & 1 ? [[' ', 1] as [string, number]] : [])];
const spaced = (n: number): Pieces => Array.from({ length: n }, (): [string, number] => [' ', 1]);

/**
 * A test's spaces as Obsidian writes them: an item nested in another is indented by the parent's
 * indentation and a tab (Tab's, whatever the parent's marker: `1. a` / `\t- b`, not three spaces), any
 * other line in an item by the item's indentation and spaces to its text (Shift+Enter's: `1. a` /
 * `   text`, `\t- b` / `\t  text`), and indentation past that by the old rule (`paired`: two spaces a tab)
 * for an item, as spaces for any other line (a code block's own indentation). Indentation outside any
 * item, each two spaces a tab.
 */
export const asTabs = (d: TextDoc): TextDoc =>
  reindent(d, (lines, ends) => {
    const fenced = inFences(lines);
    /** The items the line may be in: their indentation in spaces, their text's column, their new indentation. */
    const open: { at: number; text: number; now: Pieces }[] = [];
    return lines.map((line, i) => {
      const w = /^ */.exec(line)![0].length;
      const blank = line.trim() === '';
      const it = fenced[i] ? null : listItem(line, ends[i]);
      if (!blank && !fenced[i]) while (open.length && open.at(-1)!.text > w) open.pop();
      // a blank line or a code block's ends no item
      const parent = blank || fenced[i] ? [...open].reverse().find((o) => o.text <= w) : open.at(-1);
      if (it) {
        const now: Pieces = parent ? [...parent.now, ['\t', parent.text - parent.at], ...paired(w - parent.text)] : paired(w);
        open.push({ at: w, text: w + it.width, now });
        return now;
      }
      return parent ? [...parent.now, ...spaced(w - parent.at)] : paired(w);
    });
  });

/**
 * Obsidian's indentation read back as the spec's spaces (`asTabs`'s rule the other way): a tab into an
 * item is its text's column (`1. a` / `\t- b` is `1. a` / `   - b`), spaces stay spaces, and a tab
 * with no item to go into two spaces.
 */
export const asSpaces = (d: TextDoc): TextDoc =>
  reindent(d, (lines, ends) => {
    const fenced = inFences(lines);
    /** The items a line may be in: their indentation's tabs and spaces (after the tabs), their marker's width, their new indentation and text's column. */
    const open: { tabs: number; spaces: number; width: number; now: number }[] = [];
    const within = (o: (typeof open)[number], tabs: number, spaces: number): boolean => tabs > o.tabs || (tabs === o.tabs && spaces >= o.spaces + o.width);
    return lines.map((line, i) => {
      const ws = /^[ \t]*/.exec(line)![0];
      // tabs, then spaces, as Obsidian writes them; any other mix, each tab two spaces
      const m = /^(\t*)( *)$/.exec(ws)!;
      const plain = (): Pieces => [...ws].map((c): [string, number] => [c === '\t' ? '  ' : ' ', 1]);
      if (!m) return plain();
      const tabs = m[1]!.length;
      const spaces = m[2]!.length;
      const blank = line.trim() === '';
      const it = fenced[i] ? null : listItem(line, ends[i]);
      if (!blank && !fenced[i]) while (open.length && !within(open.at(-1)!, tabs, spaces)) open.pop();
      const parent = blank || fenced[i] ? [...open].reverse().find((o) => within(o, tabs, spaces)) : open.at(-1);
      let now: Pieces;
      if (!parent) now = plain();
      else if (tabs > parent.tabs) {
        // the parent's own indentation, the tab into it, then the rest
        const into = parent.now + parent.width;
        now = [[' '.repeat(into), parent.tabs + 1], ...Array.from({ length: tabs - parent.tabs - 1 }, (): [string, number] => ['  ', 1]), ...spaced(spaces)];
      } else now = [[' '.repeat(parent.now + parent.width), tabs + parent.spaces + parent.width], ...spaced(spaces - parent.spaces - parent.width)];
      if (it) open.push({ tabs, spaces, width: it.width, now: now.reduce((n, [s]) => n + s.length, 0) });
      return now;
    });
  });

/** Whether a document is indented with tabs already, and so is taken as written. */
export const tabbed = (text: string): boolean => /^ *\t/m.test(text);

/**
 * Whether a document indented with spaces is loaded as tabs: where tabs give it back as written,
 * caret and all; else it is loaded as written (a lazy line indented short of an item's text, which
 * the tabs would line up with it, `- a⏎    1. b⏎      - c`).
 */
export function retabs(d: TextDoc): boolean {
  if (tabbed(d.text)) return false;
  const back = asSpaces(asTabs(d));
  return back.text === d.text && JSON.stringify(back.sel) === JSON.stringify(d.sel);
}
