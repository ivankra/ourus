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

## guard.md › Deleting the space after a marker › Item with children is refused

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

> outdent

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

> moveBlockDown

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

> indent

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

> indent

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

## redesign.md › Decisions of the redesign › Heading moves

```buffer
- # A┃
  - x
- # B
  - y
```

> moveBlockDown

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

> enter

```buffer
- ---
- ## a: b
  - ┃
  - x
```

## commands.md › indent (Tab) › Becomes last child of previous sibling

```buffer
- a
- b┃
```

> indent

```buffer
- a
  - b┃
```

## commands.md › indent (Tab) › Subtree shifts with the item

```buffer
- a
- b┃
  - c
    more c
```

> indent

```buffer
- a
  - b┃
    - c
      more c
```

## commands.md › indent (Tab) › Adopts existing children's bullet

```buffer
- a
  - x
- b┃
```

> indent

```buffer
- a
  - x
  - b┃
```

## commands.md › indent (Tab) › Ordered item renumbered from 1

```buffer
- a
- b┃
- c
```

> indent

```buffer
- a
  - b┃
- c
```

## commands.md › indent (Tab) › Tab-indented list keeps tabs

```buffer
- a
  - b
- c┃
```

> indent

```buffer
- a
  - b
  - c┃
```

## commands.md › indent (Tab) › Tab nesting elsewhere sets the indent

```buffer
- a
- b┃
- c
  - d
```

> indent

```buffer
- a
  - b┃
- c
  - d
```

## commands.md › indent (Tab) › Empty new item becomes provisional

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃
```

## commands.md › indent (Tab) › First item cannot indent

```buffer
- a┃
- b
```

> indent

```buffer
- a┃
- b
```

## commands.md › indent (Tab) › No nesting under a paragraph

```buffer
- Intro
- a┃
```

> indent

```buffer
- Intro
  - a┃
```

## commands.md › outdent (Shift-Tab) › Becomes next sibling of its parent

```buffer
- a
  - b┃
```

> outdent

```buffer
- a
- b┃
```

## commands.md › outdent (Shift-Tab) › Later siblings stay with the parent

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> outdent

```buffer
- a
- b┃
  - b1
  - c
- d
```

## commands.md › outdent (Shift-Tab) › Rejected at the top level

```buffer
- a┃
```

> outdent

```buffer
- a┃
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Moving up carries the subtree

```buffer
- a
- b┃
  - b1
- c
```

> moveBlockUp

```buffer
- b┃
  - b1
- a
- c
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Moving down keeps blank lines in place

```buffer
- a┃
  - a1
- b
```

> moveBlockDown

```buffer
- b
- a┃
  - a1
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › First item cannot move up

```buffer
- a┃
- b
```

> moveBlockUp

```buffer
- a┃
- b
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Heading moves with its section

```buffer
- # A
  - text a
- # B┃
  - text b
```

> moveBlockUp

```buffer
- # B┃
  - text b
- # A
  - text a
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Paragraphs swap places

```buffer
- one
- two┃
```

> moveBlockUp

```buffer
- two┃
- one
```

## commands.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Paragraph cannot pass a list item

```buffer
- para
- a┃
```

> moveBlockUp

```buffer
- a┃
- para
```

## commands.md › indent, outdent on a heading (Tab, Shift-Tab) › Subheadings shift with the heading

```buffer
- # A
  - ## B┃
    - ### C
```

> indent

```buffer
- # A
  - ## B┃
    - ### C
```

## commands.md › indent, outdent on a heading (Tab, Shift-Tab) › H1 cannot outdent further

```buffer
- # A┃
```

> outdent

```buffer
- # A┃
```

## commands.md › enter (Enter) › Splits item at the caret

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃three
- next
```

## commands.md › enter (Enter) › Ordered item counts on at end

```buffer
- one┃
```

> enter

```buffer
- one
- ┃
```

## commands.md › enter (Enter) › Becomes first child of parent item

```buffer
- a┃ b
  - c
```

> enter

```buffer
- a
  - ┃b
  - c
```

## commands.md › enter (Enter) › Empty first child is provisional

```buffer
- a┃
  - b
```

> enter

```buffer
- a
  - ┃
  - b
```

## commands.md › enter (Enter) › Empty nested item outdents

```buffer
- a
  - b
  - ┃
```

> enter

```buffer
- a
  - b
- ┃
```

## commands.md › enter (Enter) › Empty top-level item leaves the list

```buffer
- a
- ┃
```

> enter

```buffer
- a
- 
- ┃
```

## commands.md › enter (Enter) › Leaving mid-list splits the list

```buffer
- a
- ┃
- b
```

> enter

```buffer
- a
- 
- ┃
- b
```

## commands.md › enter (Enter) › Trailing list marker kept as marker

```buffer
- abc ┃- def
```

> enter

```buffer
- abc
- ┃- def
```

## commands.md › enter (Enter) › Trailing heading marker escaped

```buffer
- abc ┃# def
```

> enter

```buffer
- abc
- ┃# def
```

## commands.md › enter (Enter) › HTML block tag escaped

```buffer
- abc ┃<div>
```

> enter

```buffer
- abc
- ┃<div>
```

## commands.md › enter (Enter) › Link reference definition escaped

```buffer
- see ┃[a]: /url
```

> enter

```buffer
- see
- ┃[a]: /url
```

## commands.md › enter (Enter) › Paragraph splits in two

```buffer
- some┃ text
```

> enter

```buffer
- some
- ┃text
```

## commands.md › enter (Enter) › Code block left to the host

````buffer
- ```
  co┃de
  ```
````

> enter

````buffer
- ```
  co
  ┃de
  ```
````

## commands.md › shiftEnter (Shift-Enter) › Continues at the content column

```buffer
- one two┃ three
```

> shiftEnter

```buffer
- one two
  ┃ three
```

## commands.md › shiftEnter (Shift-Enter) › Nested item under ordered parent

```buffer
- a
  - b┃ c
```

> shiftEnter

```buffer
- a
  - b
    ┃ c
```

## commands.md › shiftEnter (Shift-Enter) › Tab-nested item breaks with tab

```buffer
- x
  - a┃ b
```

> shiftEnter

```buffer
- x
  - a
    ┃ b
```

## commands.md › shiftEnter (Shift-Enter) › Empty new line is provisional

```buffer
- one┃
- two
```

> shiftEnter

```buffer
- one
  ┃
- two
```

## commands.md › shiftEnter (Shift-Enter) › Leading bullet escaped

```buffer
- abc ┃- def
```

> shiftEnter

```buffer
- abc 
  ┃\- def
```

## commands.md › shiftEnter (Shift-Enter) › Ordered marker escaped

```buffer
- abc ┃1. def
```

> shiftEnter

```buffer
- abc 
  ┃1\. def
```

## commands.md › shiftEnter (Shift-Enter) › Setext equals underline escaped

```buffer
- Title ┃===
```

> shiftEnter

```buffer
- Title 
  ┃===
```

## commands.md › shiftEnter (Shift-Enter) › Setext dash underline escaped

```buffer
- Title ┃--
```

> shiftEnter

```buffer
- Title 
  ┃--
```

## commands.md › shiftEnter (Shift-Enter) › HTML tag escaped on new line

```buffer
- one ┃<div>
```

> shiftEnter

```buffer
- one 
  ┃<div>
```

## commands.md › shiftEnter (Shift-Enter) › Start of a continuation line

```buffer
- a
  ┃bc
```

> shiftEnter

```buffer
- a
  
  ┃bc
```

> "x"

```buffer
- a
  
  x┃bc
```

## commands.md › shiftEnter (Shift-Enter) › Second Shift-Enter starts a paragraph

```buffer
- one
  ┃
- two
```

> shiftEnter

```buffer
- one
  ┃
- two
```

## commands.md › shiftEnter (Shift-Enter) › After a plain paragraph

```buffer
- para
  ┃
```

> shiftEnter

```buffer
- para
  ┃
```

## commands.md › shiftEnter (Shift-Enter) › Rejected at the start of text

```buffer
- ┃one
```

> shiftEnter

```buffer
- 
  ┃one
```

## commands.md › shiftEnter (Shift-Enter) › Rejected in a heading

```buffer
- # Title┃ more
```

> shiftEnter

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

> enter

```buffer
- alpha
- ┃beta
```

## obsidian-true-outliner.md › Enter › E3

```buffer
- one┃
- two
```

> enter

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

> enter

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

> enter

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

> enter

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

> enter

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

> enter

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

> enter

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

> enter

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

> enter

```buffer
- # Head
  - ┃line
  - item
```

## obsidian-true-outliner.md › Enter › E17

```buffer
- # Hello┃ world
```

> enter

```buffer
- # Hello
- ┃world
```

## obsidian-true-outliner.md › Enter › E19, E21 › End of lone heading starts a paragraph

```buffer
- # Head┃
```

> enter "x"

```buffer
- # Head
- x┃
```

## obsidian-true-outliner.md › Enter › E19, E21 › Empty paragraph before a section list

```buffer
- # Head┃
  - item
```

> enter

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

> enter

```buffer
- ┃
- alpha
  - child
```

## obsidian-true-outliner.md › Enter › E30

```buffer
- ┃alpha
```

> enter

```buffer
- ┃
- alpha
```

## obsidian-true-outliner.md › Enter › E32 › Task checkbox carries over unchecked

```buffer
- TODO alpha┃ beta
```

> enter

```buffer
- TODO alpha
- ┃beta
```

## obsidian-true-outliner.md › Enter › E32 › Checked task gives unchecked new item

```buffer
- DONE done┃
```

> enter

```buffer
- DONE done
- ┃
```

## obsidian-true-outliner.md › Enter › E33

```buffer
- al«pha be»ta
```

> enter

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

> enter

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

> enter

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

> enter

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

> enter

```buffer
- # Head
  - ┃
  - Body.
```

## obsidian-true-outliner.md › Enter › E27, E29 › Start of heading opens line above

```buffer
- # ┃Hello
```

> enter

```buffer
- #
- ┃Hello
```

## obsidian-true-outliner.md › Enter › E27, E29 › Start of paragraph opens line above

```buffer
- ┃thought
```

> enter

```buffer
- ┃
- thought
```

## obsidian-true-outliner.md › Shift-Enter › S4

```buffer
- one┃ two
```

> shiftEnter

```buffer
- one
  ┃ two
```

## obsidian-true-outliner.md › Shift-Enter › S5

```buffer
- ┃alpha
```

> shiftEnter

```buffer
- 
  ┃alpha
```

## obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext title refused

```buffer
- # Hello┃ world
```

> shiftEnter

```buffer
- # Hello
  ┃ world
```

## obsidian-true-outliner.md › Shift-Enter › S9

```buffer
- item
  - para┃ text
```

> shiftEnter

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

> shiftEnter

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

> shiftEnter

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

> shiftEnter deleteContentBackward

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

> outdent

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

> indent

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

> indent

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

> indent

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

> outdent

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

> indent

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

> outdent

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

> moveBlockUp

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

> moveBlockUp

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

> moveBlockDown

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

> moveBlockDown

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

> moveBlockDown

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

> enter

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

> enter

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

> outdent

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

> shiftEnter indent deleteContentBackward

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

> shiftEnter outdent deleteContentBackward

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

> shiftEnter indent enter

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

> enter shiftEnter deleteContentBackward

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

> pasteStructured

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

> pasteStructured

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

> pasteStructured

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

> pasteStructured

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

> enter

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

> enter

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

> enter

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

> enter

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

## placeholders.md › A deletion at the text start keeps the item's column › Delete at the text start

```buffer
- ┃b c
  - a
```

> deleteContentForward

```buffer
- ┃ c
  - a
```

## placeholders.md › A deletion at the text start keeps the item's column › Backspace after the first character

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

> moveBlockDown

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

> enter

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

> moveBlockUp

```buffer
- ┃para
- →- a
```

## redesign.md › Findings of the design experiments › Separators › B6: moving a paragraph past indented code, a thematic break or a definition › Past a thematic break

```buffer
- ---
- para┃
```

> moveBlockUp

```buffer
- para┃
- ---
```

## redesign.md › Findings of the design experiments › Separators › B6: moving a paragraph past indented code, a thematic break or a definition › Past a link reference definition

```buffer
- [a]: /u
- para┃
```

> moveBlockUp

```buffer
- para┃
- [a]: /u
```

## redesign.md › Findings of the design experiments › Separators › Moves that would need a block re-encoded, not a separator › Leftover paragraph loses its four spaces

```buffer
- [a]: /u
- ┃code
```

> moveBlockUp

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

> enter

```buffer
- TODO abc
- ┃# x
```

## redesign.md › Findings of the design experiments › Escapes › Text other readers would read differently › Ordered marker split onto a new line

```buffer
- abc ┃2. x
```

> shiftEnter

```buffer
- abc 
  ┃2\. x
```

## redesign.md › Findings of the design experiments › Escapes › Text other readers would read differently › Table delimiter row split onto a new line

```buffer
- a | b ┃|---|---|
```

> shiftEnter

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

> pasteStructured

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

> enter

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

> enter "x"

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

> pasteStructured

```buffer
- ax
  y
  ┃b
```

## guard.md › Typing in a list marker

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

> indent

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

> indent

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

> indent

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

> indent

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

> outdent

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

> outdent

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

> outdent

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

> outdent

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

> outdent

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

> indent

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

> indent outdent

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

> outdent

```buffer
- a┃
  x
- b
```

> moveBlockDown

```buffer
- b
- a┃
  x
```

> indent

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

> moveBlockDown

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

> moveBlockUp

```buffer
- a
  b┃
```

## quotes.md › Moving inside a quote › Loose list keeps its quoted blank line

```buffer
- a
  
  b┃
```

> moveBlockUp

```buffer
- a
  
  b┃
```

## quotes.md › Moving inside a quote › Quote moves past an item

```buffer
- a
- q┃
```

> moveBlockUp

```buffer
- q┃
- a
```

## quotes.md › Enter in a quote › New item gets the quote marker

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

## quotes.md › Enter in a quote › New item in a quote inside an item

```buffer
- x
  - a┃
```

> enter

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

> enter

```buffer
- a
  b
- ┃
```

## quotes.md › Enter in a quote › Empty item leaves the quote

```buffer
- a┃
```

> enter enter

```buffer
- a
- 
- ┃
```

## quotes.md › Enter in a quote › Splitting a quoted paragraph

```buffer
- ab┃cd
```

> enter

```buffer
- ab
- ┃cd
```

## quotes.md › Enter in a quote › Splitting a callout title

```buffer
- [!note] Ti┃tle
  body
```

> enter

```buffer
- [!note] Ti
- ┃tle
  body
```

## quotes.md › Enter in a quote › Empty body line after a lone title

```buffer
- [!tip] Title┃
```

> enter

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

> shiftEnter

```buffer
- ab
  ┃cd
```

## quotes.md › Shift-Enter in a quote › Held-open empty line at the end

```buffer
- ab┃
```

> shiftEnter

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

> pasteStructured

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

> indent

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

> indent

```buffer
- q
  - para┃
```

## quotes.md › Indenting a paragraph into a quote › Paragraph back out with a blank line

```buffer
- q
  
  para┃
```

> outdent

```buffer
- q
  
  para┃
```

## quotes.md › A paragraph moves inside a quote without becoming its text

```buffer
-     code
  a┃
```

> moveBlockUp

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

> moveBlockUp

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

> outdent

```buffer
- a
  q┃
```

## quotes.md › A paragraph outdented out of a nested quote › Paragraph above a quoted item

```buffer
- q┃
  a
```

> outdent

```buffer
- q┃
  a
```

## scenarios.md › Outliner flows › Typing a new child

```buffer
- a┃
```

> enter indent "x"

```buffer
- a
  - x┃
```

## scenarios.md › Outliner flows › Enter outdents the empty child

```buffer
- a┃
```

> enter indent enter

```buffer
- a
- ┃
```

## scenarios.md › Outliner flows › Backspace removes the empty child

```buffer
- a┃
```

> enter indent deleteContentBackward

```buffer
- a┃
```

## scenarios.md › Outliner flows › Walking away settles the empty child

```buffer
- a┃
```

> enter indent cursorLineUp

```buffer
- ┃a
  - 
```

## scenarios.md › Outliner flows › Repeated Enter walks out of the list

```buffer
- a
  - b┃
```

> enter enter enter "p"

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

> shiftEnter shiftEnter "p"

```buffer
- one
  
  p┃
```

## scenarios.md › Outliner flows › Lazy line goes with the second half

```buffer
- a┃
  lazy
```

> enter

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

> indent

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

> moveBlockUp

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

> moveBlockUp

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

> indent

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

> moveBlockUp

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

> indent

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

> moveBlockUp

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

> enter

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

> enter

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

> shiftEnter shiftEnter "p"

```buffer
- a
  
  p┃
```
