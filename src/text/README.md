# Text

Core text abstractions and utility functions. This is the bottom layer: strings, changes to them,
and marks on them. The only Markdown it knows is what counts as whitespace. It imports nothing; the
other layers import it through `index.ts`.

- Text is represented as a JS string with offsets in UTF-16 code units.

- **`ChangeSpec`** is CodeMirror 6's `{ from, to, insert }`,
  describing a single replacement of the string's slice `[from, to)` by
  a new string `insert`.
  In `ChangeSpec[]`, *every* offset is in the coordinates of
  the original unchanged text and the changes don't overlap.

- **`OurusSelection`** is CodeMirror 6's selection spec, `{ anchor, head }`: one range, `head` the
  caret. The commands take one and return one.

- **`ChangeSet`** is a wrapper around a normalized `ChangeSpec[]` (sorted, empty changes dropped)
  plus the length of the text it applies to.

  - `static ChangeSet.of(changes: ChangeSpec[], length: number): ChangeSet`<br>
    Constructor. Throws if the changes overlap or go past the end of the text.

  - `static ChangeSet.empty(length: number): ChangeSet`<br>
    No changes to a text of length `length`.

  - `ChangeSet.changes: ChangeSpec[]`, `ChangeSet.length: number`<br>
    The normalized changes, and the length of the text they apply to.

  - `get ChangeSet.empty: boolean`, `get ChangeSet.newLength: number`<br>
    Whether there are no changes; the length of the text after them.

  - `ChangeSet.apply(text: string): string`<br>
    The text after the changes.

  - `ChangeSet.invert(text: string): ChangeSet`<br>
    The changes that undo these. They apply to the text these produce from `text`.

  - `ChangeSet.mapPos(pos: number, assoc: -1 | 1 = -1): number`<br>
    Where `pos` ends up after the changes. For an insertion at `pos`, `-1` keeps it before the
    inserted text and `1` moves it after.

  - `ChangeSet.compose(next: ChangeSet): ChangeSet`<br>
    These changes followed by `next`, as one set. `next` is in the coordinates of the text after
    these (`ChangeSet.of(next, set.newLength)`). The result is exact: a change of `next` that
    overlaps text these wrote, or inserts inside it or at its ends, merges with it into one change.
    Changes that only touch stay separate.

- **Marks** are offsets on a text that move with its changes. A mark is just an offset: what kind it
  is, is the list that holds it. **`MarkSet`** holds the lists and the text they are on (`marks.ts`):
  immutable, each list sorted and without duplicates, every offset on the text.

  | List | A mark is | Moves | What it says |
  | --- | --- | --- | --- |
  | `placeholders` | a point, `0..text.length` | past text inserted at it; goes where text on both sides of it goes | the parser reads it as a typed character |
  | `auto` | a character, `0..text.length-1` | past text inserted at it; goes with its character | ourus put the character in, not the user |

  The finer kind is the text's to say, not a list's: a placeholder at a line's end holds an **empty
  node**, anywhere else a **held space**; an auto mark's kind is its character (a backslash: an
  escape ourus wrote; a line break: a blank line it raised). Losing an auto mark only keeps its
  character: no mark means the author's.

- **Placeholders** keep the outline the user sees while the caret is somewhere Markdown alone would
  read differently. Some edits leave a text that, read as Markdown, has another structure than the
  one the user just made: a node that is empty for a moment, or a line whose first character was just
  deleted. A placeholder holds the structure until the user types on or moves away. The parser never
  sees the marks themselves: the document passes `placeholders` as the parser's sentinels, and the
  parser reads each one as if a character had been typed there (`◌` draws one):

  - At the end of a line, it holds an **empty node** the user is about to fill. Enter at the end of
    a paragraph that owns a list makes an empty item right under it:

    ```
    Notes          Notes
    - ◌            -
    ```

    With the placeholder (left), that is a paragraph and an empty item. Without it (right), the `-`
    is a setext underline, and `Notes` is a heading. An empty paragraph has no Markdown at all: after
    Enter at the end of `a`, the new paragraph exists only as `a⏎⏎◌`; without the placeholder, the
    blank lines are just the space after `a`.

  - Before a line's text, it is a **held space**: the place of a first character just deleted. It
    keeps the columns the item's content starts at. Backspace on `x` here:

    ```
    - x b          - ◌ b          -  b
      - child        - child        - child
    ```

    With the held space (middle), `b` keeps `child`. Without it (right), two spaces follow the
    marker, so the item's content starts a column later, at 3; `- child`, at 2, isn't in it any more,
    and is the next item. (A later line of the text, `  more`, would gain a space the same way.) No
    escape can say this: it is the columns. The held space also keeps what follows from being read
    as markup, until the caret leaves:

    ```
    - x # b    →  - ◌ # b    (without it: -  # b, a heading in the item)
    - x - b    →  - ◌ - b    (without it: -  - b, a nested list)
    ```

  Once the caret leaves, `settlePlaceholders` writes the text so it holds alone: the held space's
  node written again without it (`- b`, its child still under it; `- \# b`, escaped), an empty item
  set apart by a blank line, an empty paragraph gone.

- **`MarkSet`**:

  - `static MarkSet.of(text: string, lists?: MarkLists): MarkSet`<br>
    `text` with `lists` (`{ placeholders?, auto? }`, any order): sorted, duplicates dropped. Throws a
    `RangeError` on an offset off the text, and a `MarkError` on a mark on a character it can't be on,
    by every way a set is made: a placeholder anywhere but on a blank or at a line's end; an auto
    mark anywhere but on a backslash or a line break. A `MarkSet` is a `MarkLists` too.

  - `MarkSet.text`, `MarkSet.placeholders`, `MarkSet.auto`

  - `MarkSet.isEmpty(): boolean`<br>
    Whether it has no marks at all, whatever its text.

  - `MarkSet.with(lists: MarkLists): MarkSet`<br>
    The same text, the lists `lists` gives replaced; this set where they are the same.

  - `MarkSet.hasPlaceholderAt(pos)`, `MarkSet.hasEmptyNodeAt(pos)`, `MarkSet.hasHeldSpaceAt(pos)`,
    `MarkSet.hasAutoAt(pos): boolean`<br>
    Whether there is one at `pos` (a binary search): an empty node's placeholder at a line's end
    (the text's end too), a held space's anywhere else.

  - `static MarkSet.has(offsets: number[], pos: number): boolean`,
    `static MarkSet.within(offsets: number[], from: number, to: number): number[]`<br>
    A binary search on any sorted list: whether it holds `pos`; its offsets in `[from, to)`.

  The string operations of the texts that hold marks (the document, a node's text) are `MarkSet`'s,
  each giving the text after it with its marks:

  - `MarkSet.map(changes: ChangeSet | ChangeSpec[], text?: string): MarkSet`<br>
    The text after `changes` (`text`, where the caller has it), each mark moved as its list moves
    (above); a placeholder the changes leave inside a line's text (the space it held taken out) goes.
    A binary search per mark (`ChangeIndex`).

  - `MarkSet.slice(from: number, to: number, endPoints = false): MarkSet`<br>
    `[from, to)` with its marks, counted from `from`. A placeholder at `to` comes along only with
    `endPoints`: slices that tile a text keep each once when the last one takes its end's.

  - `MarkSet.splice(from: number, to: number, insert: MarkSet | string = ''): MarkSet`<br>
    `[from, to)` replaced by `insert`, with its marks if it is a `MarkSet`: the marks around move as
    `map` moves them.

  - `MarkSet.concat(...others: (MarkSet | string)[]): MarkSet`<br>
    The texts after this one, with their marks.

Functions:

- `normalizeChanges(changes: ChangeSpec[]): ChangeSpec[]`<br>
  The changes sorted (insertions at the same point keep their order), empty ones dropped. Throws
  if they overlap.

- `applyChanges(text: string, changes: ChangeSpec[]): string`<br>
  The text after the changes.

- `invertChanges(text: string, changes: ChangeSpec[]): ChangeSpec[]`<br>
  The changes that undo `changes`, applied to the text they produce from `text`.

- `mapPos(changes: ChangeSpec[], pos: number, assoc: -1 | 1 = -1): number`<br>
  Where `pos` ends up, as `ChangeSet.mapPos`.

- `composeChanges(text: string, a: ChangeSpec[], b: ChangeSpec[]): ChangeSpec[]`<br>
  `a` followed by `b` (in the coordinates of the text after `a`), as one list of changes on `text`.
  A change merged from both is trimmed to what actually differs: `b` putting back what `a` took out
  is no change.

- `diffLines(before: string, after: string): ChangeSpec[]`<br>
  One change turning `before` into `after`, replacing whole lines. Empty when they are equal.

- `splitLines(text: string): LineBounds`<br>
  Each line's start and end (the end is before the line ending: LF, CR or CRLF). A final line
  ending doesn't start an empty last line, so `"a\n"` has one line and `""` none.

- `lineEnding(text: string, end: number): LineEnding`<br>
  The line ending at a line's end: `\n`, `\r\n`, `\r` or none.

- `lineEndingBefore(text: string, pos: number): LineEnding`<br>
  The line ending that ends right at `pos`: a CRLF whole, a lone CR, or none.

- `nextLineStart(text: string, pos: number): number`<br>
  Where the line after the one holding `pos` starts, past its line ending; the text's end if none.

- `lineIndexAt(starts: number[], pos: number): number`<br>
  The index of the line holding `pos`, given the lines' starts.

- `lineOf(text: string, offset: number): number`<br>
  The index of the line `offset` is on, in a text whose lines are joined by `\n` (as a node's text
  is).

- `lineSpan(text: string, pos: number): [number, number]`<br>
  The start and end of the line holding `pos`.

- `dominantEnding(text: string): '\n' | '\r\n' | '\r'`<br>
  The line ending most of the text's lines use, for writing new lines.

- `charBefore(text: string, pos: number): number`<br>
  Where the character before `pos` starts. A character is a grapheme cluster (an emoji with its
  joiners, a letter with its accents) or a line ending, a CRLF whole: what a key deletes, and what a
  split mustn't cut. Segmented only around `pos`, within its line.

- `charAfter(text: string, pos: number): number`<br>
  Where the character at `pos` ends.

- `charStart(text: string, pos: number): number`<br>
  `pos`, or the start of the character it is inside: a surrogate pair, a grapheme, a CRLF.

- `advanceColumns(text: string, from: number, to: number, col: number): number`<br>
  The column after `text[from, to)`, starting from column `col`, with tab stops of 4.

- `dropColumns(line: string, cols: number): string`<br>
  `line` with `cols` columns of indentation removed. A tab only partly removed leaves spaces.

- `isSpaceOrTab(c: number): boolean`<br>
  Whether a character code is Markdown's whitespace: a space or a tab, not a no-break space.

- `trimMd(text: string): string`<br>
  `trim` that removes only Markdown's whitespace (and line endings).

- `skipSpaces(text: string, pos: number, limit: number, dir: -1 | 1): number`<br>
  The position past the spaces and tabs from `pos`, going forward or back, up to `limit`.

Functions taking `ChangeSpec[]` normalize it on every call.
