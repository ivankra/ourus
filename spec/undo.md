# Undo and redo

Actions: `undo`, `redo`, the host's. Each action that changed the text is one step of history, and a
step restores the text and the caret; the edit that settles a placeholder the caret left joins the
step before it, the one that left the empty node (Undo3). The host keeps the document, placeholders
included, in its history, so undo and redo bring placeholders back with the rest
([placeholders.md](placeholders.md)). The core runner plays the host's part.

## Undo1

Undo and redo of a command bring back the text and the caret.

```yaml
tags: core
```

```markdown
- a
- b┃
```

> indent undo

```markdown
- a
- b┃
```

> redo

```markdown
- a
  - b┃
```

## Undo2

An authored blank line survives typing, undo and leaving: undo restores the document as it was, and
leaving must not delete the line, or the two paragraphs would merge. Only a line the session wrote
may be removed.

```yaml
tags: common free-form
```

```markdown
a
┃
b
```

> "x"

```markdown
a
x┃
b
```

> undo

```markdown
a
┃
b
```

> cursorDocEnd

```markdown
a

b
```

## Undo3

Leaving an empty child writes the blank line that keeps it, and that edit joins the step before it:
the first undo takes back the indent, the blank line with it, as SiYuan, BlockNote, bare Obsidian,
its Outliner and SilverBullet do. Left again, the empty item stays, after an item that holds it.

```yaml
tags: common
```

```markdown
- a┃
```

> enter

```markdown
- a
- ┃
```

> indent

```markdown
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```markdown
- a┃

  - 
```

> undo

```markdown
- a
- ┃
```

> cursorDocStart cursorLineBoundaryForward

```markdown
- a┃
- 
```

## Undo4

Redo of a command brings its placeholder back too.

```yaml
tags: common
```

```markdown
- a┃
```

> enter

```markdown
- a
- ┃
```

> indent

```markdown
- a
  - ┃◌
```

> undo

```markdown
- a
- ┃
```

> redo

```markdown
- a
  - ┃◌
```

## Undo5

Undo of what was typed into an empty child brings back its placeholder; the next undo takes back the
indent, and redo brings the placeholder back again.

```yaml
tags: common
```

```markdown
- a┃
```

> enter indent "x"

```markdown
- a
  - x┃
```

> undo

```markdown
- a
  - ┃◌
```

> undo

```markdown
- a
- ┃
```

> redo

```markdown
- a
  - ┃◌
```
