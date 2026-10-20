# Typing

What the host types, or deletes a character of, with no ourus command: the text reads as Markdown
reads it, and these cases pin what it then reads as. The rules:

1. **Typing authors structure only where the user writes markup** at a line's start: an underline
   under a paragraph makes it a heading (Typing1, Typing2), a list marker on a paragraph's
   continuation line makes that line an item (Typing3). Text that ourus moves or splits never does
   (escaped instead: guarantee 7).
2. **In markup, the host types**, whatever the text then reads as: `x` typed at `-┃ a` gives
   `-x a`, no item, as every text editor does. Where markup is decorated (`markup: decorated`),
   keeping the caret out of it is the host's: no ourus command leaves one there (guarantee 6), and
   Obsidian's Outliner keeps the user's out of a marker too ("stick the cursor to the content").

## Typing1

Typing an underline under a paragraph makes it a heading, as Markdown authoring.

```yaml
tags: rare free-form
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

```outline
heading 2: para
```

## Typing2

Deleting the rest of the line to finish the underline is setext authoring too.

```yaml
tags: rare free-form
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
tags: common free-form
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
