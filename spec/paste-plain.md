# Plain paste

Command: `pastePlain` (Ctrl-Shift-V).

Plain paste puts the clipboard's text into the text of the node at the caret, replacing a selection
within one line; its line breaks are Shift-Enter's ([shift-enter.md](shift-enter.md)), so the node
stays one node. Structured paste (Ctrl-V, `pasteStructured`) is [paste.md](paste.md)'s; a selection
across lines is deleted first, as for it ([Paste48](paste.md#paste48)), one across the node's own
lines too (Paste85, Paste85b). Its cases keep the IDs they had in [paste.md](paste.md), whose
series they share. The rules, in order; the first that applies wins:

1. **On a code line, the lines are code** as they are, each in the containers the block is in
   (Paste22); where a pasted line would close the block, its fences grow past it, as a join's do
   ([fences.md](fences.md) rule 7, Paste91). On a line of math, a comment or indented code the same,
   refused where the lines would end the block (`$$` and `%%` can't grow).
2. **A clipboard starting with a line break** has the break made as Shift-Enter makes it at the
   caret, and the rest pasted where that leaves the caret: at the start of a continuation line, a
   paragraph break (Paste82). Where Shift-Enter is refused, at a paragraph's text start, the
   leading line breaks go and the rest is pasted at the caret, as BlockNote, RemNote, SiYuan and
   WorkFlowy paste it (Paste83, Paste83b); a clipboard of line breaks alone is refused there, and
   on an empty node (Paste84).
3. **A node that holds one line refuses several**: an ATX heading (Paste6), a callout's title in
   the Obsidian flavor (Paste55), a table's row. A setext title takes them as a paragraph does, but
   for a blank line (Paste88).
4. **On an empty item, the text is its text**, after the marker's one space; each line starts a
   line of the text without its leading spaces, which would make it code (Paste78).
5. **Otherwise the first line joins the text before the caret, and each line break is
   Shift-Enter's** (before a space a placeholder holds as text too, as typing goes there, Paste89):
   the next line continues the text at its column (Paste3), escaped where it would start a block
   there (Paste4, Paste30, Paste45); a blank line is a paragraph break, as two
   Shift-Enters make one (Paste40, Paste41). A line that starts a line of the text loses its leading
   spaces and is escaped where it would start a block at the text's start (Paste64); joined onto
   text before the caret with which it would start a block, it is escaped where the escape falls
   (Paste80, Paste81). Where the clipboard ends with a line break, the rest of the line starts a line
   of its own, the spaces at the break going with neither line (Paste68); at the end of the text,
   that is an empty line to type on, held by a placeholder (Paste5). Ended at a break, the text's
   start is escaped where it would read as a link reference definition (Paste69).
6. **One line, or the caret outside a node's text**, is the host's paste.

A text editor (bare Obsidian, and Obsidian with Outliner) pastes the clipboard as it is: its first
line joins the text at the caret and the rest start at column 0, out of the item they were pasted
into, and a pasted `- y` starts an item of its own. Plain paste keeps the text in its node, at its
column.

## Paste3

Several lines pasted as plain text in the middle of an item continue the item at its content
column (the clipboard ends with a line ending, so `b` starts a line of its own). Bare Obsidian
pastes them at column 0, out of the item.

```yaml
tags: common
clipboard: |
  x
  y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ax
  y
  ┃b
```

## Paste4

Plain paste: a pasted line that would start a block is escaped, so it stays text.

```yaml
tags: edge
clipboard: |
  x
  - y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ax
  \- y
  ┃b
```

## Paste5

Plain paste ending with a line break at the end of the text leaves an empty line to type on, held by
a placeholder, as Shift-Enter there does.

```yaml
tags: common
clipboard: |
  x
  y
```

```buffer
- a┃
```

> pastePlain

```buffer
- ax
  y
  ┃◌
```

## Paste6

Plain paste of several lines into a heading is refused: a heading is a single line.

```yaml
tags: edge free-form
clipboard: |
  x
  y
```

```buffer
# H┃
```

> pastePlain

```result
rejected: not-expressible
```

```buffer
# H┃
```

## Paste22

Plain paste on a code line: the lines are code as they are, each taking the containers the block is
in (here the item's indentation).

```yaml
tags: edge
clipboard: |-
  a = 1
    b = 2
```

````buffer
- code
  ```
  ┃
  ```
````

> pastePlain

````buffer
- code
  ```
  a = 1
    b = 2┃
  ```
````

## Paste30

Plain paste escapes a line that would start a block as Shift-Enter does
([ShiftEnter18](shift-enter.md#shiftenter18)): an ordered marker on a continuation line is escaped
even when its number isn't 1.

```yaml
tags: rare
clipboard: |-
  x
  2. y
```

```buffer
- a┃
```

> pastePlain

```buffer
- ax
  2\. y┃
```

## Paste40

Plain paste of two paragraphs: the blank line is a paragraph break in the item, as two Shift-Enters
make one, `y` and the rest of the text the item's second paragraph. Logseq, Roam and Tine keep it so.

```yaml
tags: edge free-form
clipboard: |
  x

  y
```

```buffer
- a┃b
- c
```

> pastePlain

```buffer
- ax

  y
  ┃b
- c
```

## Paste41

In a quote, the paragraph break keeps its `>`.

```yaml
tags: rare free-form quote-container
clipboard: |
  x

  y
```

```buffer
> See ┃here.
```

> pastePlain

```buffer
> See x
>
> y
> ┃here.
```

## Paste45

Plain paste of a math block's lines: a `$$` at a line's start would open a math block, so it is
escaped, as any line that would start a block; the first line joins the text before the caret.

```yaml
tags: rare
flavor: obsidian
clipboard: |
  $$
  x^2
  $$
```

```buffer
- a┃b
```

> pastePlain

```buffer
- a$$
  x^2
  \$$
  ┃b
```

## Paste55

Lines pasted as plain text into a callout's title are refused: in the Obsidian flavor the title is
one line, and the host's paste would leave the callout.

```yaml
tags: rare free-form quote-container
flavor: obsidian
clipboard: |
  x
  y
```

```buffer
> [!note] Ti┃tle
> body
```

> pastePlain

```result
rejected: not-expressible
```

```buffer
> [!note] Ti┃tle
> body
```

## Paste64

Plain paste at the start of a paragraph's text: the first pasted line starts the line, escaped where
it would start a block there.

```yaml
tags: edge
clipboard: |-
  - a
  - b
```

```buffer
┃words
```

> pastePlain

```buffer
\- a
\- b┃words
```

## Paste68

Plain paste ending with a line break, before ` ---`: the space at the break goes with neither line,
as at Shift-Enter's, and `---`, starting a line, is escaped; kept, the space would leave an
underline making the paragraph a heading.

```yaml
tags: rare
clipboard: |
  x
```

```buffer
p┃ ---
```

> pastePlain

```buffer
px
┃\---
```

## Paste69

Plain paste breaking prose that starts like a link reference definition: ended at the break,
`[a]: x` would be one, so it is escaped, as Enter's split escapes it
([Enter47](enter.md#enter47)).

```yaml
tags: rare
clipboard: |
  x
```

```buffer
[a]: ┃b c
```

> pastePlain

```buffer
\[a]: x
┃b c
```

## Paste78

Plain lines pasted at an item's text start, the first indented as code is: it starts the item's text
without its leading spaces, which after the marker would make it code, as the later lines do.

```yaml
tags: rare
clipboard: |2
      first
      second
```

```buffer
- ┃a
```

> pastePlain

```buffer
- first
  second
  ┃a
```

## Paste80

Plain paste joined onto text before the caret that, with the pasted line, would start a block: a
number before `. a` would make the paragraph a list, so the pasted line is escaped where it joins.

```yaml
tags: rare
clipboard: |
  . a
  b
```

```buffer
1┃
```

> pastePlain

```buffer
1\. a
b
┃◌
```

## Paste81

The same at an item's text start: `2` and the pasted `1. a` would read as a nested list, `21.`, so
the joined line is escaped after its number.

```yaml
tags: rare
clipboard: |
  1. a
  2. b
```

```buffer
- 2┃\. y
```

> pastePlain

```buffer
- 21\. a
  2\. b
  ┃\. y
```

## Paste82

A clipboard starting with a line break, pasted at the start of a continuation line: the break is
Shift-Enter's there, a paragraph break ([ShiftEnter10](shift-enter.md#shiftenter10)), and the
pasted text starts the item's new paragraph.

```yaml
tags: rare free-form
clipboard: |-

  x
```

```buffer
- a
  ┃b
```

> pastePlain

```buffer
- a

  x┃b
```

## Paste83

At a paragraph's text start the line break can't be made, as Shift-Enter there is refused: the
paragraph would start with an empty line, which Markdown can't hold. It goes, and the rest is pasted
at the caret, as BlockNote, RemNote, SiYuan and WorkFlowy paste it. Logseq, Tine, Roam and Athens
keep the empty line in the block; the text editors open a blank line above, which reads as nothing.

```yaml
tags: rare
clipboard: |-

  x
```

```buffer
┃abc
```

> pastePlain

```buffer
x┃abc
```

## Paste83b

Several leading line breaks, at the start of a paragraph after another, go together.

```yaml
tags: rare free-form
clipboard: |-


  x
```

```buffer
p

┃abc
```

> pastePlain

```buffer
p

x┃abc
```

## Paste84

A line break pasted into an empty paragraph is refused, as Shift-Enter there is: an empty node has no
line to break.

```yaml
tags: rare
clipboard: |+

```

```buffer
p

┃◌
```

> pastePlain

```result
rejected: not-expressible
```

```buffer
p

┃◌
```

## Paste85

Over a selection across a node's lines, the selection goes first and the lines go into the text at
the caret it leaves, as over a selection in one line: escaped where they would start a block, at the
node's column. The host would paste them as they are, a `- y` an item of its own.

```yaml
tags: rare
clipboard: |-
  x
  - y
```

```buffer
- a«bc
  de»f
```

> pastePlain

```buffer
- ax
  \- y┃f
```

## Paste85b

The same in a quote: the pasted lines stay quoted, where the host's would leave it.

```yaml
tags: rare
clipboard: |-
  x
  # y
```

```buffer
> a«bc
> de»f
```

> pastePlain

```buffer
> ax
> \# y┃f
```

## Paste86

Plain paste of a hard break into an empty item keeps its two spaces, as into an item with text:
nothing pasted is lost, and the line break stays a hard one.

```yaml
tags: rare
clipboard: |-
  a  
  b
```

```buffer
- ┃
```

> pastePlain

```buffer
- a  
  b┃
```

## Paste87

A pasted line starting with a no-break space keeps it: to Markdown U+00A0 is text, not the
indentation a line starting a line of the text loses ([Paste78](#paste78)).

```yaml
tags: rare
clipboard: |-
  x
  ⍽y
```

```buffer
p┃
```

> pastePlain

```buffer
px
⍽y┃
```

## Paste87b

A pasted line of only a no-break space is a line of text, not a blank line: it doesn't break the
paragraph.

```yaml
tags: rare
clipboard: |-
  x
  ⍽
  y
```

```buffer
p┃
```

> pastePlain

```buffer
px
⍽
y┃
```

## Paste88

Plain paste of several lines into a setext title: they are more lines of it, as of a paragraph; only
an ATX title refuses them ([Paste6](#paste6)).

```yaml
tags: rare
clipboard: |-
  x
  y
```

```buffer
Title┃more
---
```

> pastePlain

```buffer
Titlex
y┃more
---
```

## Paste89

Lines pasted where a deleted first character's space is held as text
([Placeholder8](placeholders.md#placeholder8)) go in before it, as typing does there: the space
still separates what follows.

```yaml
tags: rare
clipboard: |-
  x
  y
```

```buffer
- ┃a b
  - c
```

> deleteContentForward

```buffer
- ┃◌ b
  - c
```

> pastePlain

```buffer
- x
  y┃ b
  - c
```

## Paste91

A line pasted into code that would close the block early: the block's fences grow past it, as a
join's do ([Fence36](fences.md#fence36)), so every pasted line is code.

`````yaml
tags: rare markup-fence
clipboard: |-
  x
  ```
  y
`````

`````buffer
```
co┃de
```
`````

> pastePlain

`````buffer
````
cox
```
y┃de
````
`````
