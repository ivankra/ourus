
# Cursor movement

Caret motions, named as CodeMirror's commands; each `cursor…` command has a `select…` twin that
moves the head and keeps the anchor. They are here mostly so tests can move the caret between
actions. The core runner moves the caret in a monospace font with tab stops of 4, with no line
wrapping. Real editors should move the caret themselves, as their own layout dictates (wrapped
lines, proportional fonts, bidi text). A test whose outcome depends on exactly where a motion lands
belongs to an editor's own tests.

Two rules here are ourus's, for hosts to follow: Home goes to the start of the line's text, past the
containers' prefixes, a list marker, a task's checkbox, a heading's `#`s and a callout's `[!type]`
(`OutlineState.homePosition`), then to the line's start; and Up or Down whose column falls in a
line's markup lands at the start of its text (`textStart`). So these motions never leave the caret
in a marker, a checkbox or a heading's `#`s, where typing would break them, as no command does.
Obsidian's Outliner keeps the caret out of markers and checkboxes too ("stick the cursor to the
content"). The rest is CodeMirror's commands, in the runner's monospace columns; the vertical cases
are drawn so the column means the same place in any font.

## CursorLeft1

Into the line above.

```yaml
tags: common
```

```buffer
a
┃b
```

> cursorCharLeft

```buffer
a┃
b
```

## CursorLeft2

Over a CRLF ending as one character.

```yaml
tags: common
```

```buffer
a␍
┃b
```

> cursorCharLeft

```buffer
a┃␍
b
```

## CursorLeft3

A selection collapses to its start.

```yaml
tags: common
```

```buffer
«ab»┃
```

> cursorCharLeft

```buffer
┃ab
```

## CursorRight1

Into the line below.

```yaml
tags: common
```

```buffer
a┃
b
```

> cursorCharRight

```buffer
a
┃b
```

## CursorRight2

A selection collapses to its end.

```yaml
tags: common
```

```buffer
┃«ab»
```

> cursorCharRight

```buffer
ab┃
```

## CursorUp1

Up from the first line goes to its start, as in CodeMirror; some apps take the caret out of the
document instead, or leave it where it was.

```yaml
tags: common
```

```buffer
ab┃
```

> cursorLineUp

```buffer
┃ab
```

## CursorUp2

A column in a heading's marks lands at the start of its text. Bare Obsidian keeps the column, in
the marks.

```yaml
tags: common
```

```buffer
## Title
- ┃a
```

> cursorLineUp

```buffer
## ┃Title
- a
```

## CursorUp3

A column in a deeper item's indentation lands at the start of its text.

```yaml
tags: common
```

```buffer
- a
    - b
- c┃
```

> cursorLineUp

```buffer
- a
    - ┃b
- c
```

## CursorDown1

A goal column is kept across a shorter line.

The caret keeps its column while it keeps moving up and down: a shorter line on the way doesn't
change where it lands after.

```yaml
tags: common
```

```buffer
abc┃

abcdef
```

> cursorLineDown cursorLineDown

```buffer
abc

abc┃def
```

## CursorDown2

Columns count tabs to stops of 4.

```yaml
tags: common
```

```buffer
→x┃
abcdefg
```

> cursorLineDown

```buffer
→x
abcde┃fg
```

## CursorDown3

A column in a line's marker or indentation lands at the start of its text.

```yaml
tags: common
```

```buffer
- ┃a
  - b
```

> cursorLineDown

```buffer
- a
  - ┃b
```

## CursorDown4

A column past the text start keeps its place: only a column in the markup moves to the text start.
The lines start alike, so the column is the same place in any font.

```yaml
tags: rare
```

```buffer
- abc┃
- abcd
```

> cursorLineDown

```buffer
- abc
- abc┃d
```

## CursorDown5

A column in a task's checkbox lands at the start of its text, after the checkbox.

```yaml
tags: common
```

```buffer
- a┃
- [ ] task
```

> cursorLineDown

```buffer
- a
- [ ] ┃task
```

## CursorHome1

To the text start, past the marker.

Smart Home (the action `cursorLineBoundaryBackward`; `selectLineBoundaryBackward` extends the
selection): to the start of the line's text, past markers and indentation, then to the
start of the line. From the line start it goes to the text start again.

```yaml
tags: core
```

```buffer
- one two┃
```

> cursorLineBoundaryBackward

```buffer
- ┃one two
```

## CursorHome2

Again, to the line start.

```yaml
tags: common
```

```buffer
- ┃one two
```

> cursorLineBoundaryBackward

```buffer
┃- one two
```

## CursorHome3

From the line start, to the text start.

```yaml
tags: edge
```

```buffer
┃- one two
```

> cursorLineBoundaryBackward

```buffer
- ┃one two
```

## CursorHome4

From inside the marker, to the text start.

```yaml
tags: edge
```

```buffer
-┃ one
```

> cursorLineBoundaryBackward

```buffer
- ┃one
```

## CursorHome5

Past the indentation of a nested item.

```yaml
tags: common
```

```buffer
- a
  - b┃
```

> cursorLineBoundaryBackward

```buffer
- a
  - ┃b
```

## CursorHome6

Past tab indentation.

```yaml
tags: common
```

```buffer
- a
→- b┃
```

> cursorLineBoundaryBackward

```buffer
- a
→- ┃b
```

## CursorHome7

Past an ordered marker.

```yaml
tags: common
```

```buffer
10. ten┃
```

> cursorLineBoundaryBackward

```buffer
10. ┃ten
```

## CursorHome8

Past a task's checkbox.

```yaml
tags: common
```

```buffer
- [ ] task┃
```

> cursorLineBoundaryBackward

```buffer
- [ ] ┃task
```

## CursorHome9

Past a checked task's checkbox.

```yaml
tags: common
```

```buffer
- [x] done┃
```

> cursorLineBoundaryBackward

```buffer
- [x] ┃done
```

## CursorHome10

Past a heading's marks: they are markup, like a list marker, which Obsidian's Home skips too
(CursorHome1); typing before them would end the heading. A second Home goes to the line's start
(CursorHome2).

```yaml
tags: edge
```

```buffer
## Title┃
```

> cursorLineBoundaryBackward

```buffer
## ┃Title
```

## CursorHome11

Past a quote's marker.

```yaml
tags: edge
```

```buffer
> quote┃
```

> cursorLineBoundaryBackward

```buffer
> ┃quote
```

## CursorHome12

On a continuation line, past the item's indentation.

```yaml
tags: edge
```

```buffer
- one
  two┃
```

> cursorLineBoundaryBackward

```buffer
- one
  ┃two
```

## CursorHome13

On a continuation line, again to the line start.

```yaml
tags: edge
```

```buffer
- one
  ┃two
```

> cursorLineBoundaryBackward

```buffer
- one
┃  two
```

## CursorHome14

On a paragraph's second line, to the line start.

```yaml
tags: edge
```

```buffer
para
more┃
```

> cursorLineBoundaryBackward

```buffer
para
┃more
```

## CursorHome15

Past an empty task's checkbox: its text starts after the checkbox all the same, and Home stops
there, never inside the checkbox, where typing would break the task.

```yaml
tags: edge
```

```buffer
┃- [ ] 
```

> cursorLineBoundaryBackward

```buffer
- [ ] ┃
```

## CursorHome16

Past a quote's marker and the item's: a quoted item's text starts after both. Home again goes to the
line's start.

```yaml
tags: edge
```

```buffer
> - a┃
```

> cursorLineBoundaryBackward

```buffer
> - ┃a
```

> cursorLineBoundaryBackward

```buffer
┃> - a
```

## CursorHome17

Home in a callout's title stops after its `[!type]`, as after a checkbox, then goes to the line's
start.

```yaml
tags: edge
```

```buffer
> [!note] Ti┃tle
```

> cursorLineBoundaryBackward

```buffer
> [!note] ┃Title
```

> cursorLineBoundaryBackward

```buffer
┃> [!note] Title
```

## CursorEnd1

To the end of the line.

End: to the end of the line.

```yaml
tags: common
```

```buffer
- a┃b
```

> cursorLineBoundaryForward

```buffer
- ab┃
```

## CursorDocStart1

To the start of the document.

```yaml
tags: common
```

```buffer
- a┃b
- c
```

> cursorDocStart

```buffer
┃- ab
- c
```

## CursorDocEndLeft1

To the end of the document.

The document's end is after its last line ending, which a buffer can't draw: one character back is
the end of the last line.

```yaml
tags: rare
```

```buffer
- a┃b
- c
```

> cursorDocEnd cursorCharLeft

```buffer
- ab
- c┃
```

## SelectLeft1

selectCharLeft extends it backward.

```yaml
tags: common
```

```buffer
ab┃c
```

> selectCharLeft

```buffer
a┃«b»c
```

## SelectRightEnd1

selectCharRight and selectLineBoundaryForward extend the selection.

```yaml
tags: common
```

```buffer
a┃bc
```

> selectCharRight selectLineBoundaryForward

```buffer
a«bc»
```

## SelectHome1

selectLineBoundaryBackward selects to the text start.

Shift-Home: the same stops as Home, extending the selection.

```yaml
tags: common
```

```buffer
- one┃
```

> selectLineBoundaryBackward

```buffer
- ┃«one»
```

