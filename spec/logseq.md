---
editor: logseq
---

# Logseq

Logseq's behaviour, recorded from its web demo by `npm run test:logseq -- --record`: each example is
one of ourus's spec examples adapted to what Logseq can hold (`test/logseq/adapt.ts`), and every
expected buffer is what Logseq did. Not ourus's contract (`npm test` skips this file);
`npm run test:logseq` checks that Logseq still behaves this way. Regenerate rather than edit.

## redesign.md › Decisions of the redesign › The guard's permitted transformations › Deleting the space after a marker › Childless item becomes text

```buffer
- ┃a
```

> deleteContentForward

```buffer
- ┃
```

## redesign.md › Decisions of the redesign › The guard's permitted transformations › Deleting the space after a marker › Item with children is refused

```buffer
- ┃a
  - b
```

> deleteContentForward

```buffer
- ┃
  - b
```

## redesign.md › Decisions of the redesign › The guard's permitted transformations › Setext authoring › Deleting to finish the underline

```buffer
- para
  ---x┃
```

> deleteContentBackward

```buffer
- para
  ---┃
```

## redesign.md › Decisions of the redesign › The guard's permitted transformations › A list marker typed on a continuation line

```buffer
- para
  ┃more
```

> "- "

```buffer
- para
  \- ┃more
```

## redesign.md › Decisions of the redesign › Places exist only under a caret › A command that would leave an unwritable empty node elsewhere is refused

```buffer
- a
  - ┃x
  - 
```

> formatOutdent

```buffer
- a
- ┃x
  - 
```

## redesign.md › Decisions of the redesign › Places exist only under a caret › An empty item the text can hold moves like any other

```buffer
- a
- ┃
- b
```

> moveDown

```buffer
- a
- b
- ┃
```

## redesign.md › Decisions of the redesign › Payload is preserved › Hard-break spaces survive an indent

```buffer
- a
- b  
  c┃
```

> formatIndent

```buffer
- a
  - b  
    c┃
```

## redesign.md › Decisions of the redesign › Payload is preserved › Code whitespace survives an indent

````buffer
- a
- b┃
  - ```
      x
    ```
````

> formatIndent

````buffer
- a
  - b┃
    - ```
      x
      ```
````

## redesign.md › Decisions of the redesign › History

```buffer
- a
- b┃
```

> formatIndent undo

```buffer
- a
- b┃
```

> redo

```buffer
- a
  - b┃
```

## redesign.md › Decisions of the redesign › Heading moves

```buffer
- # A┃
  - x
- # B
  - y
```

> moveDown

```buffer
- # B
  - y
- # A┃
  - x
```

## redesign.md › Decisions of the redesign › Obsidian: frontmatter is a preamble

```buffer
- ---
- ## a: b┃
  - x
```

> insertParagraph

```buffer
- ---
- ## a: b
  - ┃
  - x
```

## commands.md › formatIndent (Tab) › Becomes last child of previous sibling

```buffer
- a
- b┃
```

> formatIndent

```buffer
- a
  - b┃
```

## commands.md › formatIndent (Tab) › Subtree shifts with the item

```buffer
- a
- b┃
  - c
    more c
```

> formatIndent

```buffer
- a
  - b┃
    - c
      more c
```

## commands.md › formatIndent (Tab) › Adopts existing children's bullet

```buffer
- a
  - x
- b┃
```

> formatIndent

```buffer
- a
  - x
  - b┃
```

## commands.md › formatIndent (Tab) › Ordered item renumbered from 1

```buffer
- a
- b┃
- c
```

> formatIndent

```buffer
- a
  - b┃
- c
```

## commands.md › formatIndent (Tab) › Tab-indented list keeps tabs

```buffer
- a
  - b
- c┃
```

> formatIndent

```buffer
- a
  - b
  - c┃
```

## commands.md › formatIndent (Tab) › Tab nesting elsewhere sets the indent

```buffer
- a
- b┃
- c
  - d
```

> formatIndent

```buffer
- a
  - b┃
- c
  - d
```

## commands.md › formatIndent (Tab) › Empty new item becomes provisional

```buffer
- a
- ┃
```

> formatIndent

```buffer
- a
  - ┃
```

## commands.md › formatIndent (Tab) › First item cannot indent

```buffer
- a┃
- b
```

> formatIndent

```buffer
- a┃
- b
```

## commands.md › formatIndent (Tab) › No nesting under a paragraph

```buffer
- Intro
- a┃
```

> formatIndent

```buffer
- Intro
  - a┃
```

## commands.md › formatOutdent (Shift-Tab) › Becomes next sibling of its parent

```buffer
- a
  - b┃
```

> formatOutdent

```buffer
- a
- b┃
```

## commands.md › formatOutdent (Shift-Tab) › Later siblings stay with the parent

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> formatOutdent

```buffer
- a
- b┃
  - b1
  - c
- d
```

## commands.md › formatOutdent (Shift-Tab) › Rejected at the top level

```buffer
- a┃
```

> formatOutdent

```buffer
- a┃
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › Moving up carries the subtree

```buffer
- a
- b┃
  - b1
- c
```

> moveUp

```buffer
- b┃
  - b1
- a
- c
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › Moving down keeps blank lines in place

```buffer
- a┃
  - a1
- b
```

> moveDown

```buffer
- b
- a┃
  - a1
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › First item cannot move up

```buffer
- a┃
- b
```

> moveUp

```buffer
- a┃
- b
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › Heading moves with its section

```buffer
- # A
  - text a
- # B┃
  - text b
```

> moveUp

```buffer
- # B┃
  - text b
- # A
  - text a
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › Paragraphs swap places

```buffer
- one
- two┃
```

> moveUp

```buffer
- two┃
- one
```

## commands.md › moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down) › Paragraph cannot pass a list item

```buffer
- para
- a┃
```

> moveUp

```buffer
- a┃
- para
```

## commands.md › formatIndent, formatOutdent on a heading (Tab, Shift-Tab) › Subheadings shift with the heading

```buffer
- # A
  - ## B┃
    - ### C
```

> formatIndent

```buffer
- # A
  - ## B┃
    - ### C
```

## commands.md › formatIndent, formatOutdent on a heading (Tab, Shift-Tab) › H1 cannot outdent further

```buffer
- # A┃
```

> formatOutdent

```buffer
- # A┃
```

## commands.md › insertParagraph (Enter) › Splits item at the caret

```buffer
- one two┃ three
- next
```

> insertParagraph

```buffer
- one two
- ┃three
- next
```

## commands.md › insertParagraph (Enter) › Ordered item counts on at end

```buffer
- one┃
```

> insertParagraph

```buffer
- one
- ┃
```

## commands.md › insertParagraph (Enter) › Becomes first child of parent item

```buffer
- a┃ b
  - c
```

> insertParagraph

```buffer
- a
  - ┃b
  - c
```

## commands.md › insertParagraph (Enter) › Empty first child is provisional

```buffer
- a┃
  - b
```

> insertParagraph

```buffer
- a
  - ┃
  - b
```

## commands.md › insertParagraph (Enter) › Empty nested item outdents

```buffer
- a
  - b
  - ┃
```

> insertParagraph

```buffer
- a
  - b
- ┃
```

## commands.md › insertParagraph (Enter) › Empty top-level item leaves the list

```buffer
- a
- ┃
```

> insertParagraph

```buffer
- a
- 
- ┃
```

## commands.md › insertParagraph (Enter) › Leaving mid-list splits the list

```buffer
- a
- ┃
- b
```

> insertParagraph

```buffer
- a
- 
- ┃
- b
```

## commands.md › insertParagraph (Enter) › Trailing list marker kept as marker

```buffer
- abc ┃- def
```

> insertParagraph

```buffer
- abc
- ┃- def
```

## commands.md › insertParagraph (Enter) › Trailing heading marker escaped

```buffer
- abc ┃# def
```

> insertParagraph

```buffer
- abc
- ┃# def
```

## commands.md › insertParagraph (Enter) › HTML block tag escaped

```buffer
- abc ┃<div>
```

> insertParagraph

```buffer
- abc
- ┃<div>
```

## commands.md › insertParagraph (Enter) › Link reference definition escaped

```buffer
- see ┃[a]: /url
```

> insertParagraph

```buffer
- see
- ┃[a]: /url
```

## commands.md › insertParagraph (Enter) › Paragraph splits in two

```buffer
- some┃ text
```

> insertParagraph

```buffer
- some
- ┃text
```

## commands.md › insertParagraph (Enter) › Code block left to the host

````buffer
- ```
  co┃de
  ```
````

> insertParagraph

````buffer
- ```
  co
  ┃de
  ```
````

## commands.md › insertLineBreak (Shift-Enter) › Continues at the content column

```buffer
- one two┃ three
```

> insertLineBreak

```buffer
- one two
  ┃ three
```

## commands.md › insertLineBreak (Shift-Enter) › Nested item under ordered parent

```buffer
- a
  - b┃ c
```

> insertLineBreak

```buffer
- a
  - b
    ┃ c
```

## commands.md › insertLineBreak (Shift-Enter) › Tab-nested item breaks with tab

```buffer
- x
  - a┃ b
```

> insertLineBreak

```buffer
- x
  - a
    ┃ b
```

## commands.md › insertLineBreak (Shift-Enter) › Empty new line is provisional

```buffer
- one┃
- two
```

> insertLineBreak

```buffer
- one
  ┃
- two
```

## commands.md › insertLineBreak (Shift-Enter) › Leading bullet escaped

```buffer
- abc ┃- def
```

> insertLineBreak

```buffer
- abc 
  ┃\- def
```

## commands.md › insertLineBreak (Shift-Enter) › Ordered marker escaped

```buffer
- abc ┃1. def
```

> insertLineBreak

```buffer
- abc 
  ┃1\. def
```

## commands.md › insertLineBreak (Shift-Enter) › Setext equals underline escaped

```buffer
- Title ┃===
```

> insertLineBreak

```buffer
- Title 
  ┃===
```

## commands.md › insertLineBreak (Shift-Enter) › Setext dash underline escaped

```buffer
- Title ┃--
```

> insertLineBreak

```buffer
- Title 
  ┃--
```

## commands.md › insertLineBreak (Shift-Enter) › HTML tag escaped on new line

```buffer
- one ┃<div>
```

> insertLineBreak

```buffer
- one 
  ┃<div>
```

## commands.md › insertLineBreak (Shift-Enter) › Start of a continuation line

```buffer
- a
  ┃bc
```

> insertLineBreak

```buffer
- a
  
  ┃bc
```

> "x"

```buffer
- a
  
  x┃bc
```

## commands.md › insertLineBreak (Shift-Enter) › Second Shift-Enter starts a paragraph

```buffer
- one
  ┃
- two
```

> insertLineBreak

```buffer
- one
  ┃
- two
```

## commands.md › insertLineBreak (Shift-Enter) › After a plain paragraph

```buffer
- para
  ┃
```

> insertLineBreak

```buffer
- para
  ┃
```

## commands.md › insertLineBreak (Shift-Enter) › Rejected at the start of text

```buffer
- ┃one
```

> insertLineBreak

```buffer
- 
  ┃one
```

## commands.md › insertLineBreak (Shift-Enter) › Rejected in a heading

```buffer
- # Title┃ more
```

> insertLineBreak

```buffer
- # Title
  ┃ more
```

## commands.md › deleteContentBackward (Backspace) › Joins text to the item above

```buffer
- one
- ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## commands.md › deleteContentBackward (Backspace) › Joins into the parent

```buffer
- a
  - ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## commands.md › deleteContentBackward (Backspace) › Heading closing hashes stay at end

```buffer
- # Title
  - ┃more
```

> deleteContentBackward

```buffer
- # Title┃more
```

## commands.md › deleteContentBackward (Backspace) › Empty item above takes the text

```buffer
- 
- ┃b
```

> deleteContentBackward

```buffer
- ┃b
```

## commands.md › deleteContentBackward (Backspace) › Empty parent takes a task child

```buffer
- a
- 
  - TODO ┃task
    - child
```

> deleteContentBackward

```buffer
- a
- 
  - TODO┃task
    - child
```

## commands.md › deleteContentBackward (Backspace) › Empty item is removed

```buffer
- a
  - b
- ┃
```

> deleteContentBackward

```buffer
- a
  - b┃
```

## commands.md › deleteContentBackward (Backspace) › Children stay with the joined text

```buffer
- a
- ┃b
  - c
```

> deleteContentBackward

```buffer
- a┃b
  - c
```

## commands.md › deleteContentBackward (Backspace) › Joins a continuation line

```buffer
- one
  ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## commands.md › deleteContentBackward (Backspace) › Back from an empty paragraph place

```buffer
- a
- ┃
```

> deleteContentBackward

```buffer
- a┃
```

## commands.md › deleteContentBackward (Backspace) › Mid-text backspace left to the host

```buffer
- ab┃c
```

> deleteContentBackward

```buffer
- a┃c
```

## commands.md › deleteContentForward (Delete) › Joins a child into its parent

```buffer
- abc┃
  - def
```

> deleteContentForward

```buffer
- abc┃def
```

## commands.md › deleteContentForward (Delete) › Joins the next sibling

```buffer
- one┃
- two
```

> deleteContentForward

```buffer
- one┃two
```

## commands.md › deleteContentForward (Delete) › Joins the next text line

```buffer
- one┃
  two
```

> deleteContentForward

```buffer
- one┃two
```

## commands.md › deleteContentForward (Delete) › Joins before closing hashes

```buffer
- # Title┃
  - more
```

> deleteContentForward

```buffer
- # Title┃more
```

## commands.md › deleteContentForward (Delete) › First child moves into empty item

```buffer
- ┃
  - a
    - b
```

> deleteContentForward

```buffer
- ┃
  - a
    - b
```

## commands.md › deleteContentForward (Delete) › Empty item removed, caret moves on

```buffer
- a
- ┃
- b
```

> deleteContentForward

```buffer
- a
- ┃b
```

## commands.md › deleteContentForward (Delete) › Next sibling's children come along

```buffer
- a┃
- b
  - c
```

> deleteContentForward

```buffer
- a┃b
  - c
```

## commands.md › deleteContentForward (Delete) › Mid-text delete left to the host

```buffer
- a┃bc
```

> deleteContentForward

```buffer
- a┃c
```

## obsidian-true-outliner.md › Enter › E1

```buffer
- alpha┃ beta
```

> insertParagraph

```buffer
- alpha
- ┃beta
```

## obsidian-true-outliner.md › Enter › E3

```buffer
- one┃
- two
```

> insertParagraph

```buffer
- one
- ┃
- two
```

## obsidian-true-outliner.md › Enter › #228 › Renumbering stops at a delimiter change

```buffer
- a┃
- b
- c
```

> insertParagraph

```buffer
- a
- ┃
- b
- c
```

## obsidian-true-outliner.md › Enter › E4

```buffer
- first
  second┃ line
```

> insertParagraph

```buffer
- first
  second
- ┃line
```

## obsidian-true-outliner.md › Enter › E7, E8 › Split item becomes first tab-indented child

```buffer
- alpha┃ beta
  - child
```

> insertParagraph

```buffer
- alpha
  - ┃beta
  - child
```

## obsidian-true-outliner.md › Enter › E7, E8 › End of parent opens empty first child

```buffer
- alpha┃
  - child
```

> insertParagraph

```buffer
- alpha
  - ┃
  - child
```

## obsidian-true-outliner.md › Enter › E9

```buffer
- one┃ two
- child
```

> insertParagraph

```buffer
- one
- ┃two
- child
```

## obsidian-true-outliner.md › Enter › E10

```buffer
- item┃
  - para
```

> insertParagraph

```buffer
- item
  - ┃
  - para
```

## obsidian-true-outliner.md › Enter › E11

````buffer
- item┃ text
  - →```
    →code
    →```
````

> insertParagraph

````buffer
- item
  - ┃text
  - →```
    code
    ```
````

## obsidian-true-outliner.md › Enter › E15

```buffer
- # Head┃line
  - item
```

> insertParagraph

```buffer
- # Head
  - ┃line
  - item
```

## obsidian-true-outliner.md › Enter › E17

```buffer
- # Hello┃ world
```

> insertParagraph

```buffer
- # Hello
- ┃world
```

## obsidian-true-outliner.md › Enter › E19, E21 › End of lone heading starts a paragraph

```buffer
- # Head┃
```

> insertParagraph "x"

```buffer
- # Head
- x┃
```

## obsidian-true-outliner.md › Enter › E19, E21 › Empty paragraph before a section list

```buffer
- # Head┃
  - item
```

> insertParagraph

```buffer
- # Head
  - ┃
  - item
```

## obsidian-true-outliner.md › Enter › E26

```buffer
- ┃alpha
  - child
```

> insertParagraph

```buffer
- ┃
- alpha
  - child
```

## obsidian-true-outliner.md › Enter › E30

```buffer
- ┃alpha
```

> insertParagraph

```buffer
- ┃
- alpha
```

## obsidian-true-outliner.md › Enter › E32 › Task checkbox carries over unchecked

```buffer
- TODO alpha┃ beta
```

> insertParagraph

```buffer
- TODO alpha
- ┃beta
```

## obsidian-true-outliner.md › Enter › E32 › Checked task gives unchecked new item

```buffer
- DONE done┃
```

> insertParagraph

```buffer
- DONE done
- ┃
```

## obsidian-true-outliner.md › Enter › E33

```buffer
- al«pha be»ta
```

> insertParagraph

```buffer
- al
- ┃ta
```

## obsidian-true-outliner.md › Enter › #267, E5

```buffer
- # H
  - para┃ text
  - q
```

> insertParagraph

```buffer
- # H
  - para
  - ┃text
  - q
```

## obsidian-true-outliner.md › Enter › E13, E16 › Split title above a subheading

```buffer
- # He┃ad
  - ## Sub
```

> insertParagraph

```buffer
- # He
  - ┃ad
  - ## Sub
```

## obsidian-true-outliner.md › Enter › E14, E20 › Split title above an existing paragraph

```buffer
- # Head┃line
  - Body.
```

> insertParagraph

```buffer
- # Head
  - ┃line
  - Body.
```

## obsidian-true-outliner.md › Enter › E14, E20 › End of heading above a paragraph

```buffer
- # Head┃
  - Body.
```

> insertParagraph

```buffer
- # Head
  - ┃
  - Body.
```

## obsidian-true-outliner.md › Enter › E27, E29 › Start of heading opens line above

```buffer
- # ┃Hello
```

> insertParagraph

```buffer
- #
- ┃Hello
```

## obsidian-true-outliner.md › Enter › E27, E29 › Start of paragraph opens line above

```buffer
- ┃thought
```

> insertParagraph

```buffer
- ┃
- thought
```

## obsidian-true-outliner.md › Shift-Enter › S4

```buffer
- one┃ two
```

> insertLineBreak

```buffer
- one
  ┃ two
```

## obsidian-true-outliner.md › Shift-Enter › S5

```buffer
- ┃alpha
```

> insertLineBreak

```buffer
- 
  ┃alpha
```

## obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext title refused

```buffer
- # Hello┃ world
```

> insertLineBreak

```buffer
- # Hello
  ┃ world
```

## obsidian-true-outliner.md › Shift-Enter › S9

```buffer
- item
  - para┃ text
```

> insertLineBreak

```buffer
- item
  - para
    ┃ text
```

## obsidian-true-outliner.md › Shift-Enter › S11 › Place inside a multi-line item

```buffer
- foo┃
  bar
```

> insertLineBreak

```buffer
- foo
  ┃
  bar
```

> "x"

```buffer
- foo
  x┃
  bar
```

## obsidian-true-outliner.md › Shift-Enter › S13

```buffer
- a«lpha» beta
```

> insertLineBreak

```buffer
- a
  ┃ beta
```

## obsidian-true-outliner.md › Backspace › #269 › Emptied first item stays put

```buffer
- ┃
- b
- c
```

> deleteContentBackward

```buffer
- b
- c
```

## obsidian-true-outliner.md › Backspace › #269 › Emptied middle item removed and renumbered

```buffer
- p
- a┃
- q
```

> deleteContentBackward deleteContentBackward

```buffer
- p┃
- q
```

## obsidian-true-outliner.md › Backspace › #153 › Undoing a fresh line break

```buffer
- one
  - kid
- foo┃
```

> insertLineBreak deleteContentBackward

```buffer
- one
  - kid
- foo┃
```

## obsidian-true-outliner.md › Backspace › heading-content-start-backspace

```buffer
- para
- # ┃Hello
  - body
```

> deleteContentBackward

```buffer
- para
- #┃Hello
  - body
```

## obsidian-true-outliner.md › Backspace › Joining a task › Backspace at task text start

```buffer
- a
- TODO ┃b
```

> deleteContentBackward

```buffer
- a
- TODO┃b
```

## obsidian-true-outliner.md › Backspace › Joining an item with children › Children move to the joined node

```buffer
- a
  - ┃b
    - c
```

> deleteContentBackward

```buffer
- a
  - ┃b
    - c
```

## obsidian-true-outliner.md › Backspace › Joining an item with children › Delete forward absorbs child with grandchildren

```buffer
- a┃
  - b
    - c
```

> deleteContentForward

```buffer
- a┃
  - b
    - c
```

## obsidian-true-outliner.md › Backspace › Joining across ordered runs

```buffer
- a
- b
- ┃x
- c
```

> deleteContentBackward

```buffer
- a
- b┃x
- c
```

## obsidian-true-outliner.md › Backspace › Joining away the head of a list › Next item becomes the new 1.

```buffer
- p
  - ┃a
  - b
```

> deleteContentBackward

```buffer
- p┃a
  - b
```

## obsidian-true-outliner.md › Backspace › Joining away the head of a list › List starting at 3 keeps its start

```buffer
- a
- ┃b
- c
```

> deleteContentBackward

```buffer
- a┃b
- c
```

## obsidian-true-outliner.md › Indentation › #255 › Outdented child leaves quote above alone

```buffer
- item
  - quote
  - boo┃
```

> formatOutdent

```buffer
- item
  - quote
- boo┃
```

## obsidian-true-outliner.md › Indentation › list-marker-content-column

```buffer
- parent
- kid┃
```

> formatIndent

```buffer
- parent
  - kid┃
```

## obsidian-true-outliner.md › Indentation › indent-unit-on-every-line

```buffer
- a
  - x
- b┃
  cont
```

> formatIndent

```buffer
- a
  - x
  - b┃
    cont
```

## obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its quote

```buffer
- a
- b┃
  - q
```

> formatIndent

```buffer
- a
  - b┃
    - q
```

## obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its quote

```buffer
- a
  - b┃
    - q
```

> formatOutdent

```buffer
- a
- b┃
  - q
```

## obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its thematic break

```buffer
- a
- b┃
  - ---
```

> formatIndent

```buffer
- a
  - b┃
    - ---
```

## obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its code block

```buffer
- a
  - b┃
    -     code
```

> formatOutdent

```buffer
- a
- b┃
  -     code
```

## obsidian-true-outliner.md › Moving › lone-block-id › Block id moves with its item

```buffer
- a
- b┃
  ^id
```

> moveUp

```buffer
- b┃
  ^id
- a
```

## obsidian-true-outliner.md › Moving › lone-block-id › Block id moves with its paragraph

```buffer
- para one
  ^blk
- para┃ two
```

> moveUp

```buffer
- para┃ two
- para one
  ^blk
```

## obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › Blank line added below a quote

```buffer
- para┃
- q
```

> moveDown

```buffer
- q
- para┃
```

## obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed after a fence

````buffer
- para┃
- ```
  code
  ```
````

> moveDown

````buffer
- ```
  code
  ```
- para┃
````

## obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed before a fence

````buffer
- ```
  code┃
  ```
- para
````

> moveDown

````buffer
- para
- ```
  code┃
  ```
````

## obsidian-true-outliner.md › Ordered lists › #159 (ordered-run-split-numbering) › Bullet split leaves lower numbers alone

```buffer
- a
- b ┃- x
- c
```

> insertParagraph

```buffer
- a
- b
- ┃- x
- c
```

## obsidian-true-outliner.md › Ordered lists › #159 (ordered-run-split-numbering) › Renumbering only the touched part

```buffer
- eight
- nine┃
- ten
```

> insertParagraph

```buffer
- eight
- nine
- ┃
- ten
```

## obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list

```buffer
- a
  - b┃
  - c
- d
```

> formatOutdent

```buffer
- a
- b┃
  - c
- d
```

## obsidian-true-outliner.md › Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start

```buffer
- one
  - kid
- foo┃
```

> insertLineBreak formatIndent deleteContentBackward

```buffer
- one
  - kid
  - fo┃
```

## obsidian-true-outliner.md › Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start

```buffer
- a
  - b┃
- c
```

> insertLineBreak formatOutdent deleteContentBackward

```buffer
- a
- ┃
- c
```

## obsidian-true-outliner.md › Abandoning an empty place › Shift-Enter, Tab, then Enter

```buffer
- one
  - kid
- foo┃
- bar
```

> insertLineBreak formatIndent insertParagraph

```buffer
- one
  - kid
  - foo
  - ┃
- bar
```

## obsidian-true-outliner.md › Abandoning an empty place › Enter, then Shift-Enter and Backspace

```buffer
- foo┃
```

> insertParagraph insertLineBreak deleteContentBackward

```buffer
- foo
- ┃
```

## obsidian-true-outliner.md › Paste › #216 › Pasted list takes space indent unit

```clipboard
- a
→- b
→→- c
```

```buffer
- top
  - sib┃
```

> insertFromPaste

```buffer
- top
  - sib
  - a
    - b
      - c┃
```

## obsidian-true-outliner.md › Paste › #216 › Pasted list takes tab indent unit

```clipboard
- a
  - b
    - c
```

```buffer
- top
  - sib┃
```

> insertFromPaste

```buffer
- top
  - sib
  - a
    - b
      - c┃
```

## obsidian-true-outliner.md › Paste › #264 › Pasted quote set off from paragraph

```clipboard
    first

    > quote
```

```buffer
- ## H┃
  - below
```

> insertFromPaste

```buffer
- ## H
  - first
  - > quote┃
  - below
```

## obsidian-true-outliner.md › Paste › #197 › Pasted list and block become children

```clipboard
- alpha

> note
```

```buffer
- top┃
  - see
```

> insertFromPaste

```buffer
- top
  - alpha
    
    > note┃
  - see
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B1: Enter on an empty task leaves the list › Empty task at top level

```buffer
- a
- TODO ┃
```

> insertParagraph

```buffer
- a
- TODO 
- ┃
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B1: Enter on an empty task leaves the list › Nested empty task outdents

```buffer
- a
  - TODO ┃
```

> insertParagraph

```buffer
- a
  - TODO 
  - ┃
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B2: Enter on an empty item with children

```buffer
- ┃
  - a
```

> insertParagraph

```buffer
- 
  - ┃
  - a
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B3: Enter at the start of an item that follows paragraph text

```buffer
- a
  - ┃b
```

> insertParagraph

```buffer
- a
  - ┃
  - b
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B8: joining into an empty task

```buffer
- TODO 
- DONE ┃a
```

> deleteContentBackward

```buffer
- TODO 
- DONE┃a
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B9: emptying a child's text keeps the child › Emptied child stays a child

```buffer
- a
  - a┃
```

> deleteContentBackward

```buffer
- a
  - ┃
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B9: emptying a child's text keeps the child › Delete keeps the content column

```buffer
- ┃b c
  - a
```

> deleteContentForward

```buffer
- ┃ c
  - a
```

## redesign.md › Findings of the design experiments › Empty tasks and empty items › B9: emptying a child's text keeps the child › Backspace keeps the content column

```buffer
- a┃ b
  - c
```

> deleteContentBackward

```buffer
- ┃ b
  - c
```

## redesign.md › Findings of the design experiments › Separators › B4: a heading past a heading of another level

```buffer
- ## ┃H
- # H
  - a
```

> moveDown

```buffer
- # H
  - a
- ## ┃H
```

## redesign.md › Findings of the design experiments › Separators › B5: Enter in a heading above indented code

```buffer
- ### H┃2
  -     - a
```

> insertParagraph

```buffer
- ### H
  - ┃2
  -     - a
```

## redesign.md › Findings of the design experiments › Separators › B6: moving a paragraph past indented code, a thematic break or a definition › Past indented code

```buffer
- →- a
- ┃para
```

> moveUp

```buffer
- ┃para
- →- a
```

## redesign.md › Findings of the design experiments › Separators › B6: moving a paragraph past indented code, a thematic break or a definition › Past a thematic break

```buffer
- ---
- para┃
```

> moveUp

```buffer
- para┃
- ---
```

## redesign.md › Findings of the design experiments › Separators › B6: moving a paragraph past indented code, a thematic break or a definition › Past a link reference definition

```buffer
- [a]: /u
- para┃
```

> moveUp

```buffer
- para┃
- [a]: /u
```

## redesign.md › Findings of the design experiments › Separators › Moves that would need a block re-encoded, not a separator › Unclosed HTML comment is refused

```buffer
- para
- <!-- c┃
```

> moveUp

```buffer
- <!-- c┃
- para
```

## redesign.md › Findings of the design experiments › Separators › Moves that would need a block re-encoded, not a separator › Leftover paragraph loses its four spaces

```buffer
- [a]: /u
- ┃code
```

> moveUp

```buffer
- ┃code
- [a]: /u
```

## redesign.md › Findings of the design experiments › Separators › B7: Delete at the end of a node before an atom › Delete before a quote is refused

```buffer
- a┃
- q
```

> deleteContentForward

```buffer
- a┃q
```

## redesign.md › Findings of the design experiments › Separators › B7: Delete at the end of a node before an atom › Delete before indented code is refused

```buffer
- # H┃
  -     code
```

> deleteContentForward

```buffer
- # H┃    code
```

## redesign.md › Findings of the design experiments › Escapes › No escape after a task's checkbox

```buffer
- TODO abc ┃# x
```

> insertParagraph

```buffer
- TODO abc
- ┃# x
```

## redesign.md › Findings of the design experiments › Escapes › Text other readers would read differently › Ordered marker split onto a new line

```buffer
- abc ┃2. x
```

> insertLineBreak

```buffer
- abc 
  ┃2\. x
```

## redesign.md › Findings of the design experiments › Escapes › Text other readers would read differently › Table delimiter row split onto a new line

```buffer
- a | b ┃|---|---|
```

> insertLineBreak

```buffer
- a | b 
  ┃|---|---|
```

## redesign.md › Findings of the design experiments › Escapes › Text other readers would read differently › Pasted bullets take the ordered marker

```clipboard
- x
- y
```

```buffer
- a┃
- b
```

> insertFromPaste

```buffer
- a
- x
- y┃
- b
```

## redesign.md › Findings of the design experiments › Indentation › Adopted children in a tab-indented document

```buffer
- a
- b┃
- c
  - d
```

> deleteContentForward

```buffer
- a
- b┃c
  - d
```

## redesign.md › Findings of the design experiments › Indentation › A marker that grows moves its item's other lines

```buffer
- z┃
- a
  - child
- b
```

> insertParagraph

```buffer
- z
- ┃
- a
  - child
- b
```

## redesign.md › Findings of the design experiments › Host defaults that break structure › Enter in a fenced block inside an item

````buffer
- a
  - ```
    code┃
    ```
````

> insertParagraph "x"

````buffer
- a
  - ```
    code
    x┃
    ```
````

## redesign.md › Findings of the design experiments › Host defaults that break structure › Pasting several lines in the middle of an item

```clipboard
x
y
```

```buffer
- a┃b
```

> insertFromPaste

```buffer
- ax
  y
  ┃b
```

## redesign.md › Findings of the design experiments › Host defaults that break structure › Typing in a list marker

```buffer
- ┃a
```

> "x"

```buffer
- x┃a
```

## quotes.md › A quote as an item's first block

```buffer
- a
  b┃
```

> formatIndent

```buffer
- a
  b┃
```

## quotes.md › Indent inside a quote › Quote inside an item

```buffer
- x
  - a
    b┃
```

> formatIndent

```buffer
- x
  - a
    b┃
```

## quotes.md › Indent inside a quote › Item in a callout

```buffer
- [!note] Title
  a
  b┃
```

> formatIndent

```buffer
- [!note] Title
  a
  b┃
```

## quotes.md › Indent inside a quote › Lazy continuation line stays put

```buffer
- a
  b┃
  c
```

> formatIndent

```buffer
- a
  b┃
  c
```

## quotes.md › Outdent inside a quote

```buffer
- a
  b┃
```

> formatOutdent

```buffer
- a
  b┃
```

## quotes.md › Outdent out of a quote › Item with a child leaves below its siblings

```buffer
- a┃
  c
  b
```

> formatOutdent

```buffer
- a┃
  c
  b
```

## quotes.md › Outdent out of a quote › Lazy continuation line goes along

```buffer
- a
  b┃
  c
```

> formatOutdent

```buffer
- a
  b┃
  c
```

## quotes.md › Outdent out of a quote › From a quote inside an item

```buffer
- x
  - a
    b┃
```

> formatOutdent

```buffer
- x
- a
  b┃
```

## quotes.md › Outdent out of a quote › Quoted blank lines lose their marker

```buffer
- a
  b┃
  
  c
```

> formatOutdent

```buffer
- a
  b┃
  
  c
```

## quotes.md › Indent into a quote › Children and blank lines enter the quote

```buffer
- a
- b┃
  - c
  - d
```

> formatIndent

```buffer
- a
  - b┃
    - c
    - d
```

## quotes.md › Indent into a quote › Outdent undoes indent into a quote

```buffer
- a
- b┃
```

> formatIndent formatOutdent

```buffer
- a
- b┃
```

## quotes.md › Moving between quotes › Out of one quote and into the next

```buffer
- a┃
  x
- b
```

> formatOutdent

```buffer
- a┃
  x
- b
```

> moveDown

```buffer
- b
- a┃
  x
```

> formatIndent

```buffer
- b
  - a┃
    x
```

## quotes.md › Moving between quotes › Adjacent quotes kept apart by a blank line

```buffer
- x
- a┃
- b
```

> moveDown

```buffer
- x
- b
- a┃
```

## quotes.md › Moving inside a quote › Swapping two quoted items

```buffer
- a
  b┃
```

> moveUp

```buffer
- a
  b┃
```

## quotes.md › Moving inside a quote › Loose list keeps its quoted blank line

```buffer
- a
  
  b┃
```

> moveUp

```buffer
- a
  
  b┃
```

## quotes.md › Moving inside a quote › Quote moves past an item

```buffer
- a
- q┃
```

> moveUp

```buffer
- q┃
- a
```

## quotes.md › Enter in a quote › New item gets the quote marker

```buffer
- a┃
```

> insertParagraph

```buffer
- a
- ┃
```

## quotes.md › Enter in a quote › New item in a quote inside an item

```buffer
- x
  - a┃
```

> insertParagraph

```buffer
- x
  - a
  - ┃
```

## quotes.md › Enter in a quote › At the end of a lazy line

```buffer
- a
  b┃
```

> insertParagraph

```buffer
- a
  b
- ┃
```

## quotes.md › Enter in a quote › Empty item leaves the quote

```buffer
- a┃
```

> insertParagraph insertParagraph

```buffer
- a
- 
- ┃
```

## quotes.md › Enter in a quote › Splitting a quoted paragraph

```buffer
- ab┃cd
```

> insertParagraph

```buffer
- ab
- ┃cd
```

## quotes.md › Enter in a quote › Splitting a callout title

```buffer
- [!note] Ti┃tle
  body
```

> insertParagraph

```buffer
- [!note] Ti
- ┃tle
  body
```

## quotes.md › Enter in a quote › Empty body line after a lone title

```buffer
- [!tip] Title┃
```

> insertParagraph

```buffer
- [!tip] Title
- ┃
```

> "x"

```buffer
- [!tip] Title
- x┃
```

## quotes.md › Shift-Enter in a quote › Line break in a quoted paragraph

```buffer
- ab┃cd
```

> insertLineBreak

```buffer
- ab
  ┃cd
```

## quotes.md › Shift-Enter in a quote › Held-open empty line at the end

```buffer
- ab┃
```

> insertLineBreak

```buffer
- ab
  ┃
```

> "c"

```buffer
- ab
  c┃
```

## quotes.md › Joining in a quote › Backspace joins two quoted items

```buffer
- a
  ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## quotes.md › Joining in a quote › Delete joins the item below

```buffer
- a┃
  b
```

> deleteContentForward

```buffer
- a┃b
```

## quotes.md › Joining across a quote's edge › Quote's first paragraph left to the host

```buffer
- a
- ┃q
```

> deleteContentBackward

```buffer
- a┃q
```

## quotes.md › Joining across a quote's edge › Quote's first item cannot leave

```buffer
- a
- ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## quotes.md › Pasting in a quote

```clipboard
- x
  - y
```

```buffer
- a┃
```

> insertFromPaste

```buffer
- a
- x
  - y┃
```

## quotes.md › Headings in a quote

```buffer
- # H
  a
  b┃
```

> formatIndent

```buffer
- # H
  a
  b┃
```

## quotes.md › Indenting a paragraph into a quote › Paragraph becomes the quote's last child

```buffer
- q
- para┃
```

> formatIndent

```buffer
- q
  - para┃
```

## quotes.md › Indenting a paragraph into a quote › Paragraph back out with a blank line

```buffer
- q
  
  para┃
```

> formatOutdent

```buffer
- q
  
  para┃
```

## quotes.md › A paragraph moves inside a quote without becoming its text

```buffer
-     code
  a┃
```

> moveUp

```buffer
- code
  a┃
```

## quotes.md › A whole quote moves

```buffer
- x
  y
- q┃
```

> moveUp

```buffer
- q┃
- x
  y
```

## quotes.md › A paragraph outdented out of a nested quote › Inner quote emptied and removed

```buffer
- a
  q┃
```

> formatOutdent

```buffer
- a
  q┃
```

## quotes.md › A paragraph outdented out of a nested quote › Paragraph above a quoted item

```buffer
- q┃
  a
```

> formatOutdent

```buffer
- q┃
  a
```

## scenarios.md › Outliner flows › Typing a new child

```buffer
- a┃
```

> insertParagraph formatIndent "x"

```buffer
- a
  - x┃
```

## scenarios.md › Outliner flows › Enter outdents the empty child

```buffer
- a┃
```

> insertParagraph formatIndent insertParagraph

```buffer
- a
- ┃
```

## scenarios.md › Outliner flows › Backspace removes the empty child

```buffer
- a┃
```

> insertParagraph formatIndent deleteContentBackward

```buffer
- a┃
```

## scenarios.md › Outliner flows › Walking away settles the empty child

```buffer
- a┃
```

> insertParagraph formatIndent cursorLineUp

```buffer
- ┃a
  - 
```

## scenarios.md › Outliner flows › Repeated Enter walks out of the list

```buffer
- a
  - b┃
```

> insertParagraph insertParagraph insertParagraph "p"

```buffer
- a
  - b
- 
- p┃
```

## scenarios.md › Outliner flows › Two paragraphs in one item

```buffer
- one┃
```

> insertLineBreak insertLineBreak "p"

```buffer
- one
  
  p┃
```

## scenarios.md › Outliner flows › Lazy line goes with the second half

```buffer
- a┃
  lazy
```

> insertParagraph

```buffer
- a
- ┃lazy
```

## scenarios.md › Backspace › Joining into a paragraph above a list

```buffer
- para
- ┃a
```

> deleteContentBackward

```buffer
- para┃a
```

## scenarios.md › Backspace › No joining into a code block

````buffer
- ```
  x
  ```
- ┃a
````

> deleteContentBackward

````buffer
- ```
  x
  ```┃a
````

## scenarios.md › Indentation › Fenced code reindents with its item

````buffer
- a
- b┃
  - ```
    x
    
      y
    ```
````

> formatIndent

````buffer
- a
  - b┃
    - ```
      x
      
      y
      ```
````

## scenarios.md › Indentation › Fenced code with a blank line moves

````buffer
- a
- b┃
  - ```
    x
    
    y
    ```
````

> moveUp

````buffer
- b┃
  - ```
    x
    
    y
    ```
- a
````

## scenarios.md › Ordered lists › Moving renumbers the items

```buffer
- a
- b┃
```

> moveUp

```buffer
- b┃
- a
```

## scenarios.md › Ordered lists › Untouched list keeps its numbers

```buffer
- a
  - x
  - y┃
- b
- c
```

> formatIndent

```buffer
- a
  - x
    - y┃
- b
- c
```

## scenarios.md › Ordered lists › Renumbering past 9 widens the marker

```buffer
- a
  - x
- b┃
```

> moveUp

```buffer
- b┃
- a
  - x
```

## scenarios.md › Headings › Setext heading demoted with its subheading

```buffer
- # Title┃
  - ## Sub
```

> formatIndent

```buffer
- # Title┃
  - ## Sub
```

## scenarios.md › Headings › Heading moves with its subheadings

```buffer
- # A
  - ## a1
- # B┃
  - ## b1
```

> moveUp

```buffer
- # B┃
  - ## b1
- # A
  - ## a1
```

## scenarios.md › Line endings › Enter copies the CRLF of the split line

```buffer
- a┃
- b
```

> insertParagraph

```buffer
- a
- ┃
- b
```

## scenarios.md › Line endings › CRLF line in an LF document

```buffer
- a
- b┃
- c
```

> insertParagraph

```buffer
- a
- b
- ┃
- c
```

## scenarios.md › Line endings › Paragraph break in a CRLF item

```buffer
- a┃
```

> insertLineBreak insertLineBreak "p"

```buffer
- a
  
  p┃
```
