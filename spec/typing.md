# Typing

What the host types, or deletes a character of, with no ourus command: the text reads as Markdown
reads it, and these cases pin what it then reads as. The rules:

1. **Typing authors structure only where the user writes markup** at a line's start: an underline
   under a paragraph makes it a heading (Typing1, Typing2), a list marker on a paragraph's
   continuation line makes that line an item (Typing3). Text that ourus moves or splits never does
   (escaped instead: guarantee 7).
2. **In markup, the host types** (`editInMarkup: host`, the default), whatever the text then reads
   as. A strict editor's guard (`refuse`) puts the typed text at the text start, as Enter there
   does (Typing4); the guard isn't built yet, so its case is `pending`.

## Typing1

Typing an underline under a paragraph makes it a heading, as Markdown authoring.

```yaml
rank: rare
```

```buffer
para
┃
```

> "---"

```buffer
para
---┃
```

## Typing2

Deleting the rest of the line to finish the underline is setext authoring too.

```yaml
rank: rare
```

```buffer
para
---x┃
```

> deleteContentBackward

```buffer
para
---┃
```

## Typing3

Typing `- ` at the start of a paragraph's continuation line turns that line into a list item, as
when a paragraph's lines are made a list ([Scenario24](scenarios.md#scenario24)).

```yaml
rank: common
```

```buffer
para
┃more
```

> "- "

```buffer
para
- ┃more
```

## Typing4

With `editInMarkup: refuse`, typed text is content, so typing in the marker lands at the text
start. Obsidian's Outliner keeps the caret out of a marker altogether ("stick the cursor to the
content"), which comes to the same. By default the host types `-x a`, no item, as every text
editor does.

```yaml
rank: edge
status: pending
editInMarkup: refuse
```

```buffer
-┃ a
```

> "x"

```buffer
- x┃a
```
