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

- **`Mark`** is a tagged pair of offsets `{ kind, from, to }`.
  It can be either a point (`from === to`) or a range `[from, to)`.

- **Mark kinds** are a closed set, all defined in `marks.ts`. Each kind has a `MarkPolicy` saying how
  its marks move when the text changes (`assoc`, `mapMode`, `onInsertInside`, as in CM6). What a
  kind means, and where a mark of it is valid, is up to the layer that reads it.

  | Kind | Marks | Used for |
  | --- | --- | --- |
  | `PLACEHOLDER_MARK` | a point read as if a character were typed there | placeholders |
  | `AUTO_WHITESPACE_MARK` | whitespace ourus added only because Markdown needed it | not used yet |
  | `AUTO_CLOSED_MARK` | a closing delimiter ourus typed for the user | not used yet |

- **Placeholders** keep the outline the user sees while the caret is somewhere Markdown alone would
  read differently. Some edits leave a text that, read as Markdown, has another structure than the
  one the user just made: a node that is empty for a moment, or a line whose first character was just
  deleted. A placeholder holds the structure until the user types on or moves away. The parser never
  sees the marks themselves: the document passes their positions (`MarkSet.points()`) as the
  parser's sentinels, and the parser reads each one as if a character had been typed there. There is
  one kind of mark; its role depends on where it is (`◌` draws one):

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

  Functions:

  - `createPlaceholder(pos: number): Mark`<br>
    A placeholder at position `pos` (a point mark).

  - `isPlaceholder(mark: Mark): boolean`

  - `isEmptyNodePlaceholder(mark: Mark, text: string): boolean`,
    `isHeldSpacePlaceholder(mark: Mark, text: string): boolean`<br>
    Whether `mark` holds an empty node, or is a held space. `text` is the text the mark's offsets are
    in: a document's, or a node's text.

  - `emptyNodeAt(marks: MarkSet, text: string, pos: number): boolean`,
    `heldSpaceAt(marks: MarkSet, text: string, pos: number): boolean`<br>
    Whether `marks` has a placeholder of that role at `pos`.

- **`MarkSet`** holds marks: immutable, sorted, without duplicates.

  - `static MarkSet.of(marks: Mark[]): MarkSet`, `static MarkSet.empty: MarkSet`

  - `MarkSet.marks: Mark[]`, `get MarkSet.size: number`

  - `MarkSet.map(changes: ChangeSet | ChangeSpec[]): MarkSet`<br>
    The marks after `changes`, each moved by its kind's policy (and dropped where the policy says).

  - `MarkSet.update({ add?: Mark[], filter?: (mark) => boolean }): MarkSet`<br>
    The marks `filter` keeps, plus `add` (as CM6's `RangeSet.update`).

  - `MarkSet.between(from: number, to: number, f: (mark) => void | false): void`<br>
    Calls `f` for each mark touching `[from, to]`, in order; returning `false` stops (as CM6's
    `RangeSet.between`).

  - `MarkSet.has(pos: number, kind?: string): boolean`, `MarkSet.find(pos: number, kind?: string): Mark | undefined`<br>
    A mark (of `kind`, if given) at `pos`: a point there, or a range covering the character there.

  - `MarkSet.points(kind?: string): number[]`<br>
    Every mark's position, sorted. This is what the parser takes as sentinels.

  The texts that keep a string and its marks side by side (the document, a node's text) use these
  to do the marks' half of a string operation:

  - `MarkSet.slice(from: number, to: number, endPoints = false): MarkSet`<br>
    The marks in `[from, to)`, with offsets counted from `from`; a range is cut to fit. A point at
    `to` is kept only with `endPoints`.

  - `MarkSet.shift(by: number): MarkSet`<br>
    Every mark moved by `by` (for a text appended after another).

  - `MarkSet.splice(from: number, to: number, insert: string, inserted?: MarkSet): MarkSet`<br>
    The marks after `[from, to)` is replaced by `insert`: the marks around it move by their
    policies, and `inserted` (the marks of `insert`) come in with it.

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

- `lineIndexAt(starts: number[], pos: number): number`<br>
  The index of the line holding `pos`, given the lines' starts.

- `lineOf(text: string, offset: number): number`<br>
  The index of the line `offset` is on, in a text whose lines are joined by `\n` (as a node's text
  is).

- `lineSpan(text: string, pos: number): [number, number]`<br>
  The start and end of the line holding `pos`.

- `dominantEnding(text: string): '\n' | '\r\n' | '\r'`<br>
  The line ending most of the text's lines use, for writing new lines.

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
