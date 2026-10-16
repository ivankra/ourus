
# Undo and redo

Actions: `undo`, `redo`, the host's. Each action that changed the text is one step of history, and a
step restores the text and the caret. The host keeps the document, placeholders included, in its
history, so undo and redo bring placeholders back with the rest
([placeholders.md](placeholders.md)). The core runner plays the host's part.

## Undo1

Undo and redo of a command bring back the text and the caret.

```yaml
rank: core
```

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

An authored blank line survives typing, undo and leaving: undo restores the document as it was, and
leaving must not delete the line, or the two paragraphs would merge. Only a line the session wrote
may be removed.

```yaml
rank: common
```

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

Undo brings a placeholder back, and leaving keeps the item again. Leaving was an edit of its own
(the blank line), so the first undo takes back that, the caret going back into the empty child.

```yaml
rank: common
```

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

```yaml
rank: common
```

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

## Undo5

Undo of what was typed into an empty child brings back its placeholder; the next undo takes back the
indent, and redo brings the placeholder back again.

```yaml
rank: common
```

```buffer
- a┃
```

> enter indent "x"

```buffer
- a
  - x┃
```

> undo

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
