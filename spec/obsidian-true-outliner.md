# obsidian-true-outliner

<!--
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

Derived from obsidian-true-outliner (https://github.com/laughedelic/obsidian-true-outliner).
-->

*This file is under the [Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/), as
obsidian-true-outliner is; the rest of ourus is MIT.*

Cases from obsidian-true-outliner (`../repos/obsidian-true-outliner`, "TO" below): its measured
real-app regressions (`e2e-tests/cases/`, headed by issue number), its Enter and Shift-Enter
catalogue (`docs/research/enter-and-shift-enter-catalogue.md`, headed by entry), and shapes measured
in its research notes (headed by the note). TO is pre-release, and many of these record defects
there. The behaviour drawn here is the one that was wanted, checked against what other outliners
(Logseq, Workflowy, Dynalist) and editors do; where it differs from TO's, the prose says so.
`pending` marks the cases ourus doesn't handle yet.

## Enter

### E1

Enter in the middle of an item splits it; the space at the split goes with neither half.

```buffer
- alpha┃ beta
```

> insertParagraph

```buffer
- alpha
- ┃beta
```

### E3

Enter in an ordered list renumbers the items after the split.

```buffer
1. one┃
2. two
```

> insertParagraph

```buffer
1. one
2. ┃
3. two
```

### #228

The renumbering stops at the list's end: the next list, written with the other delimiter, keeps
its numbers.

#### Renumbering stops at a delimiter change

```buffer
1. a┃
1) b
2) c
```

> insertParagraph

```buffer
1. a
2. ┃
1) b
2) c
```

### E4

Enter on a continuation line of a multi-line item splits the item there.

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

### E7, E8

An item with tab-indented children gets the new item as its first child.

#### Split item becomes first tab-indented child

```buffer
- alpha┃ beta
→- child
```

> insertParagraph

```buffer
- alpha
→- ┃beta
→- child
```

#### End of parent opens empty first child

```buffer
- alpha┃
→- child
```

> insertParagraph

```buffer
- alpha
→- ┃◌
→- child
```

### E9

Enter in a paragraph followed by a list makes two paragraphs; the list is unchanged. Paragraphs
are leaves here, so the list is not the paragraph's child, and the second half stays a paragraph
(in TO, which makes the list a child, it became an item).

```buffer
one┃ two
- child
```

> insertParagraph

```buffer
one

┃two
- child
```


### E10

Enter at the end of an item whose first child is a paragraph: the new item is the first child,
as with list children (TO put it after the whole subtree). Logseq and Workflowy add the new
node as the first child too.

```buffer
- item┃

  para
```

> insertParagraph

```buffer
- item
  - ┃◌

  para
```


### E11

The same with a code block as the first child: the new child copies the indentation of the
existing one, so the code block stays where it is (TO used its own unit and made it a
grandchild).

````buffer
- item┃ text
→```
→code
→```
````

> insertParagraph

````buffer
- item
→- ┃text
→```
→code
→```
````


### E15

Enter in a heading followed by a list: the rest of the title becomes a paragraph, not an item
(TO turned it into an item).

```buffer
# Head┃line
- item
```

> insertParagraph

```buffer
# Head
┃line

- item
```


### E17

Enter in a setext heading's title splits it as in an ATX heading: the underline stays with the
first half, and the rest of the title becomes the section's first paragraph.

```buffer
Hello┃ world
====
```

> insertParagraph

```buffer
Hello
====
┃world
```


### E18

Enter in a setext underline acts at the end of the title, as Enter in a list marker acts at the
item's text start (E30): the underline is markup, not text to split.

```buffer
Hello world
==┃==
```

> insertParagraph

```buffer
Hello world
====
┃◌
```


### E19, E21

Enter at the end of a heading starts its section with an empty paragraph, also when the
section begins with a list (TO made an empty item there).

#### End of lone heading starts a paragraph

```buffer
# Head┃
```

> insertParagraph "x"

```buffer
# Head
x┃
```

#### Empty paragraph before a section list

```buffer
# Head┃
- item
```

> insertParagraph

```buffer
# Head
┃◌

- item
```

### E26

Enter at the start of an item with children puts the new item above; the text stays where it is,
with its children. A defect in true-outliner.

```buffer
- ┃alpha
→- child
```

> insertParagraph

```buffer
- 
- ┃alpha
→- child
```

### E30

Enter with the caret in a list marker acts at the item's text start: an empty item above.

```buffer
-┃ alpha
```

> insertParagraph

```buffer
- 
- ┃alpha
```

### E32

Enter on a task: the checkbox carries over to the new item, unchecked.

#### Task checkbox carries over unchecked

```buffer
- [ ] alpha┃ beta
```

> insertParagraph

```buffer
- [ ] alpha
- [ ] ┃beta
```

#### Checked task gives unchecked new item

```buffer
- [x] done┃
```

> insertParagraph

```buffer
- [x] done
- [ ] ┃
```

### E33

Enter replaces a selection inside the text, then splits the item. A defect in true-outliner.

```buffer
- al«pha be»ta
```

> insertParagraph

```buffer
- al
- ┃ta
```

### #267, E5

In a paragraph, Enter makes two paragraphs. TO also wrote a blank line between the second
half and the quote below it; both read the same, and here the quote's seam is left as it was.

```buffer
# H
para┃ text
> q
```

> insertParagraph

```buffer
# H
para

┃text
> q
```

### E13, E16

In a heading, the rest of the title becomes the section's first paragraph.

#### Rest of title becomes first paragraph

```buffer
# Hello┃ world
```

> insertParagraph

```buffer
# Hello
┃world
```

#### Split title above a subheading

```buffer
# He┃ad
## Sub
```

> insertParagraph

```buffer
# He
┃ad
## Sub
```

### E14, E20

Enter in a heading: a paragraph right under the heading stays a paragraph of its own.

#### Split title above an existing paragraph

```buffer
# Head┃line
Body.
```

> insertParagraph

```buffer
# Head
┃line

Body.
```

#### End of heading above a paragraph

```buffer
# Head┃
Body.
```

> insertParagraph

```buffer
# Head
┃◌

Body.
```

### E27, E29

Enter at the start of a heading or paragraph opens a blank line above; the text stays put. E27
is a defect in true-outliner.

#### Start of heading opens line above

```buffer
# ┃Hello
```

> insertParagraph

```buffer

# ┃Hello
```

#### Start of paragraph opens line above

```buffer
┃thought
```

> insertParagraph

```buffer

┃thought
```

## Shift-Enter

### S4

Shift-Enter in a paragraph continues it on a new line: still one paragraph.

```buffer
one┃ two
```

> insertLineBreak

```buffer
one
┃two
```


### S5

With the caret in a list marker, Shift-Enter acts at the text start, where there is no line
to break (TO split the marker).

```buffer
-┃ alpha
```

> insertLineBreak

```result
rejected: not-expressible
```


### S7, S8

A heading is one line, setext headings included, and its underline is not text: Shift-Enter
is refused (TO made a three-line setext heading, or cut the underline in two).

#### Line break in setext title refused

```buffer
Hello┃ world
====
```

> insertLineBreak

```result
rejected: not-expressible
```

#### Line break in setext underline refused

```buffer
Hello world
==┃==
```

> insertLineBreak

```result
rejected: not-expressible
```


### S9

The new line keeps an indented paragraph's indentation (TO wrote it at column 0, where it
stayed in the paragraph only by lazy continuation).

```buffer
- item

  para┃ text
```

> insertLineBreak

```buffer
- item

  para
  ┃text
```


### S11

At the end of a line that isn't the node's last, the new line is a place inside the node, which
stays one node; typing fills it, and leaving removes it (TO's blank line split the node in
two).

#### Place inside a multi-line item

```buffer
- foo┃
  bar
```

> insertLineBreak

```buffer
- foo
  ┃◌
  bar
```

> "x"

```buffer
- foo
  x┃
  bar
```

#### Leaving the place removes it

```buffer
foo┃
bar
```

> insertLineBreak cursorDocStart

```buffer
┃foo
bar
```


### S13

Shift-Enter over a selection replaces it, then breaks the line, as typing would.

```buffer
- a«lpha» beta
```

> insertLineBreak

```buffer
- a
  ┃beta
```


## Backspace

### #269

Backspace on an emptied first item, with nothing above to join, does nothing.

#### Emptied first item stays put

```buffer
1. ┃
2. b
3. c
```

> deleteContentBackward

```buffer
1. ┃
2. b
3. c
```

#### Emptied middle item removed and renumbered

Twice on an emptied middle item: the text goes, then the item, and the list renumbers.

```buffer
1. p
2. a┃
3. q
```

> deleteContentBackward deleteContentBackward

```buffer
1. p┃
2. q
```

### #153

Right after Shift-Enter, Backspace takes the new line back.

#### Undoing a fresh line break

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

### heading-content-start-backspace

Backspace at a heading's text start joins the heading into the node above, as at an item's,
and as Logseq and Workflowy merge any block into the one above; its section then continues the
section above. (TO refuses; Typora and Notion turn the heading into a paragraph instead. Either
is better than deleting the space after `#`, which leaves `#Hello` as text.)

```buffer
para

# ┃Hello

body
```

> deleteContentBackward

```buffer
para┃Hello

body
```


### delete-to-content-start

Cmd-Backspace on an item deletes back to the start of its text, never into its marker.

```buffer
- alpha beta┃
```

> deleteSoftLineBackward

```buffer
- ┃
```


### Joining a task

A task's checkbox is chrome, like its marker (Home stops after it): Backspace at the text start,
or anywhere before it, joins the task into the node above, and the checkbox goes with the marker
(TO strips both). The host's Backspace would leave `- [ ]b`, which is no task.

#### Backspace at task text start

```buffer
- a
- [ ] ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

#### Backspace before the checkbox

```buffer
- a
- ┃[ ] b
```

> deleteContentBackward

```buffer
- a┃b
```


### Joining an item with children

An item with children joins the node above too, and its children move to that node, as they do in
Workflowy and Logseq when a block with children is merged (TO: "a parent absorbs its first child;
grandchildren re-parent").

#### Children move to the joined node

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

#### Delete forward absorbs child with grandchildren

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


### Joining across ordered runs

A bullet between two runs of an ordered list joins away, and the runs become one list again.

```buffer
1. a
2. b
- ┃x
3. c
```

> deleteContentBackward

```buffer
1. a
2. b┃x
3. c
```


### Joining away the head of a list

The items left behind take the list's start: removing `1.` makes `2.` the new `1.`, which also
keeps it a list under the text above (only a list starting at 1 can interrupt a paragraph). A
list that started elsewhere keeps its start.

#### Next item becomes the new 1.

```buffer
- p
  1. ┃a
  2. b
```

> deleteContentBackward

```buffer
- p┃a
  1. b
```

#### List starting at 3 keeps its start

```buffer
3. a
4. ┃b
5. c
```

> deleteContentBackward

```buffer
3. a┃b
4. c
```


## Indentation

### #255

Outdenting a later child leaves the quote above it alone.

#### Outdented child leaves quote above alone

```buffer
- item
  > quote

  - boo┃
```

> formatOutdent

```buffer
- item
  > quote

- boo┃
```

### list-marker-content-column

A child nests at its parent's content column, which a wider gap after the marker moves.

```buffer
-  parent
-  kid┃
```

> formatIndent

```buffer
-  parent
   -  kid┃
```


### indent-unit-on-every-line

In a tab-indented list, an indent writes the tab on every line of the node, continuation
lines included (TO wrote a tab on the first line and spaces below it).

```buffer
- a
→- x
- b┃
  cont
```

> formatIndent

```buffer
- a
→- x
→- b┃
→  cont
```


### seams-across-a-re-indent

A quote, a thematic break or an indented code block inside an item keeps its kind when the item
is indented or outdented: the shift is the same on every line of the subtree (in TO, a block
pushed past column 3 of its container became a paragraph or a list item).

#### Indented item keeps its quote

```buffer
- a
- b┃
  > q
```

> formatIndent

```buffer
- a
  - b┃
    > q
```

#### Outdented item keeps its quote

```buffer
- a
  - b┃
    > q
```

> formatOutdent

```buffer
- a
- b┃
  > q
```

#### Indented item keeps its thematic break

```buffer
- a
- b┃

  ---
```

> formatIndent

```buffer
- a
  - b┃

    ---
```

#### Outdented item keeps its code block

```buffer
- a
  - b┃

        code
```

> formatOutdent

```buffer
- a
- b┃

      code
```


### destination-list-style

An item joining a list takes the list's bullet: a different bullet would start a new list.

```buffer
* a
  * x
- b┃
```

> formatIndent

```buffer
* a
  * x
  * b┃
```

## Moving

### lone-block-id

A block id on its own line is the node's last line, and moves with it.

#### Block id moves with its item

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

#### Block id moves with its paragraph

```buffer
para one
^blk

para┃ two
```

> moveUp

```buffer
para┃ two

para one
^blk
```

### lazy-continuation-at-seams

A paragraph moved below a quote it was written right above gets a blank line between them: without
one, it would continue the quote. A fence needs no blank line on either side.

#### Blank line added below a quote

```buffer
para┃
> q
```

> moveDown

```buffer
> q

para┃
```

#### No blank line needed after a fence

````buffer
para┃
```
code
```
````

> moveDown

````buffer
```
code
```
para┃
````

#### No blank line needed before a fence

````buffer
```
code┃
```
para
````

> moveDown

````buffer
para
```
code┃
```
````


## Ordered lists

### #159 (ordered-run-split-numbering)

A list split in two by an item of another kind leaves the lower part's numbers alone; renumbering
never reaches past the part the split touched.

#### Bullet split leaves lower numbers alone

```buffer
1. a
2. b ┃- x
3. c
```

> insertParagraph

```buffer
1. a
2. b
- ┃x
3. c
```

#### Renumbering only the touched part

```buffer
8. eight
9. nine┃
10. ten
```

> insertParagraph

```buffer
8. eight
9. nine
10. ┃
11. ten
```

### Outdenting the head of a nested list

The item outdents after its parent, and the items it leaves behind renumber from the list's start,
so `2. c` becomes `1. c` and stays a list under `a`'s text.

```buffer
1. a
   1. b┃
   2. c
2. d
```

> formatOutdent

```buffer
1. a
   1. c
2. b┃
3. d
```


## Abandoning an empty place

From TO's `carried-place-removal.md` (#249): an empty node a key made, then left without typing,
possibly after Tab or Shift-Tab carried it. An empty node Markdown can hold (an empty item after
another item) stays, as Logseq and Workflowy keep an empty bullet the caret leaves. One it can't (an
empty child right under its parent's text, an empty paragraph, an empty line inside a node) goes,
with the lines that were written for it. TO instead restores the document from before the key that
made it.

### Shift-Enter, Tab, then leave

The place carried into the indented node goes; one Backspace on it goes back to where
Shift-Enter started.

#### Carried place removed on leaving

```buffer
- one
  - kid
- foo┃
```

> insertLineBreak formatIndent

```buffer
- one
  - kid
  - foo
  ┃◌
```

> cursorDocStart

```buffer
┃- one
  - kid
  - foo
```

#### Doubly indented place removed on leaving

```buffer
- one
  - kid
  - sib
- foo┃
```

> insertLineBreak formatIndent formatIndent cursorDocStart

```buffer
┃- one
  - kid
  - sib
    - foo
```

#### Backspace returns to the start

```buffer
- one
  - kid
- foo┃
```

> insertLineBreak formatIndent deleteContentBackward

```buffer
- one
  - kid
  - foo┃
```

#### Shift-Tab then Backspace returns to start

```buffer
- a
  - b┃
- c
```

> insertLineBreak formatOutdent deleteContentBackward

```buffer
- a
- b┃
- c
```


### Shift-Enter, Tab, then Enter

Enter on the place splits there: a new item after the node (TO dropped the place and moved
to the next item).

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


### Enter, then Shift-Enter and Backspace

Shift-Enter on an empty item is the host's line break, and Backspace takes it back; the empty
item stays.

```buffer
- foo┃
```

> insertParagraph insertLineBreak deleteContentBackward

```buffer
- foo
- ┃
```


### Enter, Tab, then leave

An empty child right under its parent's text is a placeholder while the caret is in it. Leaving it,
it stays, written with a blank line above it, so the text still reads as an empty child (a blank
line after the list stays too).

#### Empty child under parent text kept with a blank line

```buffer
- one
- foo┃
```

> insertParagraph formatIndent

```buffer
- one
- foo
  - ┃◌
```

> cursorDocStart

```buffer
┃- one
- foo

  - 
```

#### An empty ordered child kept with a blank line

```buffer
1. a┃
2. b
```

> insertParagraph formatIndent

```buffer
1. a
   1. ┃◌
2. b
```

> cursorDocStart

```buffer
┃1. a

   1. 
2. b
```

#### Blank line after the list stays

```buffer
- foo┃

para
```

> insertParagraph

```buffer
- foo
- ┃

para
```

> formatIndent

```buffer
- foo
  - ┃◌

para
```

> cursorDocStart

```buffer
┃- foo

  - 

para
```


### Enter, Shift-Tab, then leave

An empty item after another item can be written, so it stays, like an empty bullet in Logseq.

#### Outdented empty ordered item stays

```buffer
1. p
   1. a┃
2. q
```

> insertParagraph formatOutdent cursorDocStart

```buffer
┃1. p
   1. a
2. 
3. q
```

#### Second Enter outdents to a kept item

```buffer
- a
  - b┃
```

> insertParagraph insertParagraph cursorDocStart

```buffer
┃- a
  - b
- 
```


### Enter twice, then leave

Enter twice leaves the list for an empty paragraph, which Markdown can't hold: leaving it removes
it together with the blank lines that set it off, and the list is as tight as before.

#### Empty paragraph and blank lines removed

```buffer
- a┃
- b
```

> insertParagraph insertParagraph cursorDocStart

```buffer
┃- a
- b
```

#### Indented list under paragraph restored

```buffer
para
  - a┃
  - b
```

> insertParagraph insertParagraph cursorDocStart

```buffer
┃para
  - a
  - b
```

## Paste

TO's real-app paste regressions. Pasted Markdown is placed as nodes, as Logseq and Workflowy paste
outlines: re-indented to the destination's depth and indent unit, with blank lines where blocks
would otherwise run together. ourus has no structural paste yet; the host pastes the text as it
is.

### #216

A pasted list takes the destination's indent unit, tabs or spaces, on every level.

#### Pasted list takes space indent unit

```buffer
- top
  - sib┃
```

```clipboard
- a
→- b
→→- c
```

> insertFromPaste

```buffer
- top
  - sib
  - a
    - b
      - c┃
```

#### Pasted list takes tab indent unit

```buffer
- top
→- sib┃
```

```clipboard
- a
  - b
    - c
```

> insertFromPaste

```buffer
- top
→- sib
→- a
→→- b
→→→- c┃
```


### #264

A pasted quote is set off from the paragraph below it, and the payload's own indentation goes.

#### Pasted quote set off from paragraph

```buffer
## H┃
below
```

```clipboard
    first

    > quote
```

> insertFromPaste

```buffer
## H

first

> quote┃

below
```


### #197

A list and a block pasted at the end of an item with children become its first children, and
stay apart from each other and from the children below.

#### Pasted list and block become children

```buffer
- top┃
  - see
```

```clipboard
- alpha

> note
```

> insertFromPaste

```buffer
- top
  - alpha

  > note┃

  - see
```
