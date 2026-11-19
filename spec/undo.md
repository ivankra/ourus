# Undo and redo

Actions: `undo`, `redo`, the host's. Each action that changed the text is one step of history, and a
step restores the text and the caret; how a host's history groups the edit that settles a placeholder
the caret left is the host's. The host keeps the document, placeholders included, in its history, so undo and redo bring placeholders back with the rest
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
