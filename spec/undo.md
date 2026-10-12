# Undo and redo

Actions: `undo`, `redo`, the host's. Each action that changed the text is one step of history, and
a step restores the text and the caret. The host keeps the document, placeholders included, in its
history, so undo and redo bring placeholders back with the rest ([placeholders.md](placeholders.md)).
The core runner plays the host's part.

## Undo1

Undo and redo of a command bring back the text and the caret.

```buffer
- a
- b┃
```

> indent undo

```buffer
- a
- b┃
```

> redo

```buffer
- a
  - b┃
```

## Undo2

An authored blank line survives typing, undo and leaving.

Undo restores the document as it was: no placeholder, and the blank line stays. Typing on it and
undoing puts the caret back on it, on a line an edit just touched; leaving must not delete it, or
the two paragraphs merge into one. Removing text needs evidence that the session wrote it, and an
edit that touched the line is no such evidence.

```buffer
a
┃
b
```

> "x"

```buffer
a
x┃
b
```

> undo

```buffer
a
┃
b
```

> cursorDocEnd cursorCharLeft

```buffer
a

b┃
```

## Undo3

Undo brings a placeholder back, and leaving keeps the item again.

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```

> undo

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```

## Undo4

Redo of a command brings its placeholder back too.

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> undo

```buffer
- a
- ┃
```

> redo

```buffer
- a
  - ┃◌
```
