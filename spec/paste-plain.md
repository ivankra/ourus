# Plain paste

Command: `pastePlain` (Ctrl-Shift-V).

Plain paste puts the clipboard's text into the text of the node at the caret, replacing a selection
within one line; its line breaks are Shift-Enter's ([shift-enter.md](shift-enter.md)), so the node
stays one node, and nothing in the text becomes structure. Structured paste (Ctrl-V,
`paste`) is [paste.md](paste.md)'s. A selection across lines is deleted first, as for it
([Paste17](paste.md#paste17)), one across the node's own lines too (PastePlain17, PastePlain18). The
rules, in order; the first that applies wins:

1. **On a code line, the lines are code** as they are, each in the containers the block is in and at
   its fence's indentation (PastePlain28, PastePlain30); where a pasted line would close the block, its
   fences grow past it, as a join's do ([fences.md](fences.md) rule 7, PastePlain29). On a line of
   math, a comment or indented code the same, refused where the lines would end the block (`$$` and
   `%%` can't grow).
2. **A clipboard starting with a line break** has the break made as Shift-Enter makes it at the caret,
   and the rest pasted where that leaves the caret: at the start of a continuation line, a paragraph
   break (PastePlain24). Where Shift-Enter is refused, at a paragraph's text start, the leading line
   breaks go and the rest is pasted at the caret (PastePlain25, PastePlain26); a clipboard of line
   breaks alone is refused there, and on an empty node (PastePlain27).
3. **A node that holds one line refuses several**: an ATX heading, an item's too (PastePlain21), a
   callout's title in the Obsidian flavor (PastePlain22), a table's row. A setext title takes them as a
   paragraph does, but for a blank line (PastePlain23); on its underline, which is markup, they are
   refused, as Shift-Enter is there.
4. **On an empty item, the text is its text**, after the marker's one space and an empty task's
   checkbox (PastePlain19, PastePlain20). Where text, after blank lines below the item, is indented as
   its children are, the item with text would take it in: refused.
5. **Otherwise the first line joins the text before the caret, and each line break is
   Shift-Enter's** (before a space a placeholder holds as text too, as typing goes there, PastePlain16):
   the next line continues the text at its column, keeping its own indentation, which Markdown reads
   past there (PastePlain1, PastePlain19); a blank line is a paragraph break, as two Shift-Enters make
   one (PastePlain3, PastePlain4). A line that starts a paragraph loses its leading spaces, which would
   make it code. Each line the paste writes is escaped where it would read as a block where it
   starts (PastePlain5, PastePlain6, PastePlain7, PastePlain8), where the escape falls when it joins
   text before the caret (PastePlain9, PastePlain10); a paragraph's start also where, with the lines
   below it, it would read as a link reference definition (PastePlain11, PastePlain12). Where the
   clipboard ends with a line break, the rest of the line starts a line of its own, keeping the spaces
   at the break as Shift-Enter's new line does (PastePlain13); at the end of the text, that is an empty
   line to type on, held by a placeholder (PastePlain2).
6. **One line, or the caret outside a node's text**, is the host's paste.

Those are `pastePlainLines: text`'s, the default: each line break is Shift-Enter's. With other values a
line break is another key's: `enter`, Enter's, as if the text were typed, the line at the caret
splitting and each later line a new node (PastePlain31); `items`, a node each, placed as paste places
nodes (`pasteSeams`, `pasteOnParent`, ...), the lines' Markdown escaped, but list markers read where
every line has one (PastePlain32, PastePlain33); `host`, none of ourus's: the host inserts the text as
it is (PastePlain34).

How other editors paste lines with Ctrl-Shift-V (measured with `sxs/probe.ts`, 2026-10-21, and read in
their code: `sxs/<app>/README.md`):

- **Into the block, as ourus does**: Logseq, Logseq DB, Tine, Roam and Athens, and SiYuan and
  BlockNote but where the clipboard has Markdown or blank lines. They keep a blank line in the block
  (here a paragraph break) and a line's leading spaces; at a block's text start, where Markdown can't,
  they keep the spaces too.
- **A block per line**: WorkFlowy, Dynalist, Tana and RemNote, which read the lines as an outline (a
  line's indentation nesting it, WorkFlowy and Tana dropping a bullet's marker). Dynalist's is the
  text typed with Enter at each line break (`pastePlainLines: enter`); Tana's and WorkFlowy's their
  Ctrl-V of the lines (`items`; WorkFlowy's text after the caret a node of its own, which no value
  has); RemNote's joins only the first line at the caret, the rest after it, which none has either.
  None of them has a paste that keeps
  lines in an ordinary block: WorkFlowy's and Tana's hold no line break (WorkFlowy's notes, code and
  quote blocks take lines as they are), Dynalist's notes do; RemNote's "Paste as Single Bullet" does,
  in its desktop app only.
- **A text editor** (bare Obsidian, and Obsidian with Outliner, SilverBullet, Emacs) pastes the
  clipboard as it is (`host`): its first line joins the text at the caret and the rest start at column
  0, lazy continuation lines of the item, and a pasted `- y` starts an item of its own.

## PastePlain1

Several lines pasted as plain text in the middle of an item continue the item at its content
column (the clipboard ends with a line ending, so `b` starts a line of its own), as Logseq, Logseq DB,
Tine, Roam and Athens paste them. Bare Obsidian pastes them at column 0, lazy lines of the item.

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

## PastePlain2

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
  ┃
```

## PastePlain3

Plain paste of two paragraphs: the blank line is a paragraph break in the item, as two Shift-Enters
make one, `y` and the rest of the text the item's second paragraph. Logseq, Logseq DB, Tine, Roam and
Athens keep the blank line in the block.

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

## PastePlain4

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

## PastePlain5

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

## PastePlain6

Plain paste breaks lines as Shift-Enter does ([ShiftEnter18](shift-enter.md#shiftenter18)): an
ordered marker other than 1 on a continuation line can't start a list there, and stays as it is.

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
  2. y┃
```

## PastePlain7

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

## PastePlain8

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

## PastePlain9

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
┃
```

## PastePlain10

The same at an item's text start: `2` and the pasted `1. a` would read as a nested list, `21.`, so
the joined line is escaped after its number; `2. b`, continuing the text, stays as it is.

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
  2. b
  ┃. y
```

## PastePlain11

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
[a]\: x
┃b c
```

## PastePlain12

The same where the paste starts a paragraph of its own: after the blank line, `[a]: /u` would be a
link reference definition, which shows nothing, so it is escaped.

```yaml
tags: rare free-form
clipboard: |-
  x

  [a]: /u
```

```buffer
p┃
```

> pastePlain

```buffer
px

[a]\: /u┃
```

## PastePlain13

Plain paste ending with a line break, before ` ---`: the space at the break starts the new line, as
Shift-Enter's does ([ShiftEnter21](shift-enter.md#shiftenter21)), the caret after it, and `---` is
escaped, which would underline the paragraph into a heading. Logseq, Logseq DB, Tine, Roam and Athens
keep the space too.

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

## PastePlain14

A pasted line starting with a no-break space keeps it: to Markdown U+00A0 is text, not the
indentation a paragraph's first line loses ([PastePlain19](#pasteplain19)).

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

## PastePlain15

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

## PastePlain16

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

## PastePlain17

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

## PastePlain18

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

## PastePlain19

Plain lines pasted at an item's text start, indented as code is: the first starts the item's text
without its leading spaces, which after the marker would make it code; the second, continuing it,
keeps them, as Logseq, Logseq DB, Tine, Roam, Athens and SiYuan keep a pasted line's indentation.

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

## PastePlain20

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

## PastePlain21

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

```yaml
result: rejected not-expressible
```

```buffer
# H┃
```

## PastePlain22

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

```yaml
result: rejected not-expressible
```

```buffer
> [!note] Ti┃tle
> body
```

## PastePlain23

Plain paste of several lines into a setext title: they are more lines of it, as of a paragraph; only
an ATX title refuses them ([PastePlain21](#pasteplain21)).

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

## PastePlain24

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

## PastePlain25

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

## PastePlain26

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

## PastePlain27

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

```yaml
result: rejected not-expressible
```

```buffer
p

┃◌
```

## PastePlain28

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

## PastePlain29

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
## PastePlain30

On a code line of a fence indented two spaces, each pasted line takes the fence's indentation too:
Markdown strips up to that much from a code line, so the second line keeps its own two spaces.

`````yaml
tags: rare
clipboard: |-
  a
    b
`````

`````buffer
  ```
  ┃
  ```
`````

> pastePlain

`````buffer
  ```
  a
    b┃
  ```
`````

## PastePlain31

With `pastePlainLines: enter`, the text is typed with Enter at each line break: the line at the caret
splits, the next line a new item, which the text after the caret ends, as Dynalist pastes.

```yaml
tags: edge
pastePlainLines: enter
clipboard: |-
  x
  y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ax
- y┃b
```

## PastePlain32

With `pastePlainLines: items`, each line is a node, placed as paste places nodes (here after the item,
whose text stays whole), its Markdown text: a lone `- y` among other lines is escaped.

```yaml
tags: edge
pastePlainLines: items
clipboard: |-
  x
  - y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ab
- x
- \- y┃
```

## PastePlain33

With `pastePlainLines: items`, where every line has a list marker the markers are read: the lines are
items, as Tana pastes them.

```yaml
tags: edge
pastePlainLines: items
clipboard: |-
  - x
  - y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ab
- x
- y┃
```

## PastePlain34

With `pastePlainLines: host`, plain paste is the host's: it inserts the text as it is, as a text
editor does.

```yaml
tags: edge
pastePlainLines: host
clipboard: |-
  x
  y
```

```buffer
- a┃b
```

> pastePlain

```yaml
result: notApplicable
```
