# Cursor movement

Caret motions, named as CodeMirror's commands; each `cursor…` command has a `select…` twin that
moves the head and keeps the anchor. They are here mostly so tests can move the caret between
actions. The core runner moves the caret in a monospace font with tab stops of 4, with no line
wrapping. Real editors should move the caret themselves, as their own layout dictates (wrapped
lines, proportional fonts, bidi text). A test whose outcome depends on exactly where a motion lands
belongs to an editor's own tests.

## CursorLeft1

Into the line above.

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

```buffer
«ab»┃
```

> cursorCharLeft

```buffer
┃ab
```

## CursorRight1

Into the line below.

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

```buffer
┃«ab»
```

> cursorCharRight

```buffer
ab┃
```

## CursorUp1

Up from the first line goes to its start.

```buffer
ab┃
```

> cursorLineUp

```buffer
┃ab
```

## CursorUp2

A column in a heading's marks lands at the start of its text.

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

A column past the text start keeps its place.

```buffer
- abc┃
  - bcd
```

> cursorLineDown

```buffer
- abc
  - b┃cd
```

## CursorHome1

To the text start, past the marker.

Smart Home (the action `cursorLineBoundaryBackward`; `selectLineBoundaryBackward` extends the
selection): to the start of the line's text, past markers and indentation, then to the
start of the line. From the line start it goes to the text start again.

```buffer
- one two┃
```

> cursorLineBoundaryBackward

```buffer
- ┃one two
```

## CursorHome2

Again, to the line start.

```buffer
- ┃one two
```

> cursorLineBoundaryBackward

```buffer
┃- one two
```

## CursorHome3

From the line start, to the text start.

```buffer
┃- one two
```

> cursorLineBoundaryBackward

```buffer
- ┃one two
```

## CursorHome4

From inside the marker, to the text start.

```buffer
-┃ one
```

> cursorLineBoundaryBackward

```buffer
- ┃one
```

## CursorHome5

Past the indentation of a nested item.

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

```buffer
10. ten┃
```

> cursorLineBoundaryBackward

```buffer
10. ┃ten
```

## CursorHome8

Past a task's checkbox.

```buffer
- [ ] task┃
```

> cursorLineBoundaryBackward

```buffer
- [ ] ┃task
```

## CursorHome9

Past a checked task's checkbox.

```buffer
- [x] done┃
```

> cursorLineBoundaryBackward

```buffer
- [x] ┃done
```

## CursorHome10

Past a heading's marks.

```buffer
## Title┃
```

> cursorLineBoundaryBackward

```buffer
## ┃Title
```

## CursorHome11

Past a quote's marker.

```buffer
> quote┃
```

> cursorLineBoundaryBackward

```buffer
> ┃quote
```

## CursorHome12

On a continuation line, past the item's indentation.

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

```buffer
para
more┃
```

> cursorLineBoundaryBackward

```buffer
para
┃more
```

## CursorEnd1

To the end of the line.

End: to the end of the line.

```buffer
- a┃b
```

> cursorLineBoundaryForward

```buffer
- ab┃
```

## CursorDocStart1

To the start of the document.

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

```buffer
ab┃c
```

> selectCharLeft

```buffer
a┃«b»c
```

## SelectRightEnd1

selectCharRight and selectLineBoundaryForward extend the selection.

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

```buffer
- one┃
```

> selectLineBoundaryBackward

```buffer
- ┃«one»
```
