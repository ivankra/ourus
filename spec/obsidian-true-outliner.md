# obsidian-true-outliner

<!--
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

Derived from obsidian-true-outliner (https://github.com/laughedelic/obsidian-true-outliner).
-->

*This file is under the [Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/), as
obsidian-true-outliner is; the rest of ourus is MIT.*

Cases from [obsidian-true-outliner](https://github.com/laughedelic/obsidian-true-outliner) ("TO" below): its measured
real-app regressions (`e2e-tests/cases/`, headed by issue number), its Enter and Shift-Enter
catalog (`docs/research/enter-and-shift-enter-catalogue.md`, headed by entry), and shapes measured
in its research notes (headed by the note). TO is pre-release, and many of these record defects
there. The behavior drawn here is the one that was wanted, checked against what other outliners
(Logseq, Workflowy, Dynalist) and editors do; where it differs from TO's, the prose says so.

## Enter

### E1, E3

Enter in the middle of an item splits it, the space at the split going with neither half
([Enter1](enter.md#enter1)); in an ordered list, the items after the new one renumber
([Enter2](enter.md#enter2), [Enter25](enter.md#enter25)).

### #228

The renumbering stops at the list's end: the next list, written with the other delimiter, keeps
its numbers. TO's e2e case for #228 is marked known-failing: it renumbers on into the `1)` list, as
Outliner and bare Obsidian do.

#### Renumbering stops at a delimiter change

```yaml
tags: edge
```

```buffer
1. a┃
1) b
2) c
```

> enter

```buffer
1. a
2. ┃
1) b
2) c
```

### E4

Enter on a continuation line of a multi-line item splits the item there, as Enter anywhere in an
item's text does (Logseq, bare Obsidian and TO agree; Roam, Dynalist, Tine and Outliner too, keeping
the space at the new item's start; WorkFlowy breaks the line inside the item instead).

```yaml
tags: edge
```

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

### E7, E8

An item with tab-indented children gets the new item as its first child, indented with a tab as they
are ([Enter3](enter.md#enter3) and [Enter4](enter.md#enter4) are the same with spaces). Split
mid-text, the item keeps its text up to the caret and its children, and the rest becomes the new
node where Enter at the end puts one: TO's split, as in Logseq and Tine (`enterMidItem: child`); by
default ourus, as WorkFlowy, Roam, Dynalist and Obsidian (bare or with Outliner), keeps the children
with the second half instead, the first half going before it ([Enter3](enter.md#enter3)).

#### Split item becomes first tab-indented child

```yaml
tags: edge
enterMidItem: child
```

```buffer
- alpha┃ beta
→- child
```

> enter

```buffer
- alpha
→- ┃beta
→- child
```

#### End of parent opens empty first child

```yaml
tags: edge
```

```buffer
- alpha┃
→- child
```

> enter

```buffer
- alpha
→- ┃◌
→- child
```

### E9

Enter in a paragraph followed by a list makes two paragraphs, set off by the blank line Markdown
needs between them. The list, which a paragraph owns when it comes right after it, goes with the
second half, which it still follows; its seam is left as it was. TO made the second half an item,
the first one keeping the list, as an item keeps its children when split (E7); here text split in a
paragraph stays paragraphs. Bare Obsidian and Outliner make a line break in the paragraph instead
([Enter12](enter.md#enter12) is ourus's Enter in a paragraph).

```yaml
tags: edge
```

```buffer
one┃ two
- child
```

> enter

```buffer
one

┃two
- child
```

### E10

Enter at the end of an item whose first child is a paragraph: the new item is the first child,
as at the end of any item with children ([Enter4](enter.md#enter4)). The outliners agree (Logseq,
WorkFlowy, Roam, Dynalist, Tana), but for them the paragraph is a block like any other; of the apps
with paragraphs none does it: SiYuan opens an empty paragraph in the item above it and TO an empty
line there, and Obsidian, bare or with Outliner, adds a sibling, which takes the paragraph as its
own.

```yaml
tags: edge
```

```buffer
- item┃

  para
```

> enter

```buffer
- item
  - ┃◌

  para
```

### E11

The same with a code block as the first child: the new child copies the indentation of the
existing one, so the code block stays where it is (TO, when measured, used its own unit and made
it a grandchild; it now agrees). With TO's split (`enterMidItem: child`), as E7.

```yaml
tags: edge
enterMidItem: child
```

````buffer
- item┃ text
→```
→code
→```
````

> enter

````buffer
- item
→- ┃text
→```
→code
→```
````

### E15

Enter in a heading followed by a list: the rest of the title becomes a paragraph, not an item (TO
turned it into an item), and the list, right after it, is that paragraph's. The seam is left as it
was: a list needs no blank line to start after a paragraph, as a quote needs none (#267, E5) and a
heading none (Split title above a subheading). Bare Obsidian and Outliner do the same.

```yaml
tags: edge free-form
```

```buffer
# Head┃line
- item
```

> enter

```buffer
# Head
┃line
- item
```

### E17

Enter in a setext heading's title splits it as in an ATX heading: the underline stays with the
first half, and the rest of the title becomes the section's first paragraph (TO now sets it off with
a blank line). A text editor's line break would make a two-line heading instead.

```yaml
tags: edge
```

```buffer
Hello┃ world
====
```

> enter

```buffer
Hello
====
┃world
```

### E18

Enter in a setext underline acts at the end of the title, as Enter in a list marker acts at the
item's text start ([Enter34](enter.md#enter34)): the underline is markup, not text to split. TO now
refuses it; a text editor splits the underline.

```yaml
tags: edge markup-heading
```

```buffer
Hello world
==┃==
```

> enter

```buffer
Hello world
====
┃◌
```

### E19, E21

Enter at the end of a heading starts its section with an empty paragraph, also when the
section begins with a list (TO made an empty item there). A blank line is written below it only
where the next block would otherwise run into it (a paragraph: End of heading above a paragraph);
a list needs none, so its seam is left as it was, as bare Obsidian and Outliner leave it.

#### End of lone heading starts a paragraph

```yaml
tags: edge
```

```buffer
# Head┃
```

> enter "x"

```buffer
# Head
x┃
```

#### Empty paragraph before a section list

```yaml
tags: edge free-form
```

```buffer
# Head┃
- item
```

> enter

```buffer
# Head
┃◌
- item
```

### E32

Enter on a task: the checkbox carries over to the new item, unchecked, as in Obsidian (bare, with
Outliner or TO).

#### Task checkbox carries over unchecked

```yaml
tags: edge
```

```buffer
- [ ] alpha┃ beta
```

> enter

```buffer
- [ ] alpha
- [ ] ┃beta
```

#### Checked task gives unchecked new item

```yaml
tags: edge
```

```buffer
- [x] done┃
```

> enter

```buffer
- [x] done
- [ ] ┃
```

### E33

Enter replaces a selection inside the text, then splits the item, as typing would (a defect in TO
when measured, since fixed).

```yaml
tags: edge
```

```buffer
- al«pha be»ta
```

> enter

```buffer
- al
- ┃ta
```

### #267, E5

In a paragraph, Enter makes two paragraphs. TO also wrote a blank line between the second
half and the quote below it; both read the same, and here the quote's seam is left as it was. (Bare
Obsidian and Outliner make a line break in the paragraph: see [Enter12](enter.md#enter12).)

```yaml
tags: edge
```

```buffer
# H
para┃ text
> q
```

> enter

```buffer
# H
para

┃text
> q
```

### E13, E16

In a heading, the rest of the title becomes the section's first paragraph, right under it, as
in bare Obsidian and Outliner (TO now writes a blank line between them).

#### Rest of title becomes first paragraph

```yaml
tags: edge
```

```buffer
# Hello┃ world
```

> enter

```buffer
# Hello
┃world
```

#### Split title above a subheading

```yaml
tags: edge
```

```buffer
# He┃ad
## Sub
```

> enter

```buffer
# He
┃ad
## Sub
```

### E14, E20

Enter in a heading: a paragraph right under the heading stays a paragraph of its own, set off
from the new one by a blank line; without it the two would read as one paragraph, which is what
bare Obsidian and Outliner leave.

#### Split title above an existing paragraph

```yaml
tags: edge
```

```buffer
# Head┃line
Body.
```

> enter

```buffer
# Head
┃line

Body.
```

#### End of heading above a paragraph

```yaml
tags: edge
```

```buffer
# Head┃
Body.
```

> enter

```buffer
# Head
┃◌

Body.
```

### E29

Enter at the start of a paragraph: TO puts the caret on a new line above, as Enter at an item's
start puts it in the new item above ([Enter31](enter.md#enter31)), and so does ourus
([Enter33](enter.md#enter33)); bare Obsidian and Outliner open a blank line above, the text and the
caret staying put ([Enter33b](enter.md#enter33b), `enterAtTextStart: stay`). At a heading's start
(E27), TO puts an empty heading above; ourus an empty paragraph ([Enter32](enter.md#enter32)).

## Shift-Enter

### S4

Shift-Enter in a paragraph continues it on a new line: still one paragraph. The space at the break
starts the new line, where Markdown renders nothing of it, as bare Obsidian and Outliner keep it
(TO drops it).

```yaml
tags: edge
```

```buffer
one┃ two
```

> shiftEnter

```buffer
one
 ┃two
```

### S5

With the caret in a list marker, Shift-Enter is the host's (`markup: text`, the default;
[ShiftEnter22](shift-enter.md#shiftenter22)), which splits the marker, as TO's catalogue has it.

```yaml
tags: edge free-form
```

```buffer
-┃ alpha
```

> shiftEnter

```result
notApplicable
```

```buffer
-
┃ alpha
```

### S7, S8

A setext title runs over several lines, as CommonMark lets it and as the paragraph it underlines
can, so Shift-Enter breaks it, the heading staying one (TO now makes the rest a new ATX heading
below); only an ATX title is a single line. Its underline is not text: Shift-Enter there is refused, the text left as
it was (TO cut the underline in two).

#### Line break in setext title

```yaml
tags: edge markup-heading
```

```buffer
Hello┃ world
====
```

> shiftEnter

```buffer
Hello
 ┃world
====
```

#### Line break in setext underline refused

```yaml
tags: edge markup-heading
```

```buffer
Hello world
==┃==
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
Hello world
==┃==
```

### S9

The new line keeps an indented paragraph's indentation (TO, when measured, wrote it at column 0,
where it stayed in the paragraph only by lazy continuation; it now agrees).

```yaml
tags: edge
```

```buffer
- item

  para┃ text
```

> shiftEnter

```buffer
- item

  para
   ┃text
```

### S11

At the end of a line that isn't the node's last, the new line is a place inside the node, which
stays one node; typing fills it, and leaving removes it: left empty, the line would split the
paragraph in two, as it does in bare Obsidian and Outliner (TO's blank line split the node too when
measured; it now agrees).

#### Place inside a multi-line item

```yaml
tags: edge
```

```buffer
- foo┃
  bar
```

> shiftEnter

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

```yaml
tags: edge free-form
```

```buffer
foo┃
bar
```

> shiftEnter cursorDocStart

```buffer
┃foo
bar
```

### S13

Shift-Enter over a selection replaces it, then breaks the line, as typing would.

```yaml
tags: edge
```

```buffer
- a«lpha» beta
```

> shiftEnter

```buffer
- a
   ┃beta
```

## Backspace

### #269

Backspace on an emptied item. (An emptied first item, with nothing above, is removed:
[Backspace17](backspace.md#backspace17); true-outliner leaves it.)

#### Emptied middle item removed and renumbered

Twice on an emptied middle item: the text goes, then the item, and the list renumbers.

```yaml
tags: edge
```

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

```yaml
tags: edge
```

```buffer
- one
  - kid
- foo┃
```

> shiftEnter

```buffer
- one
  - kid
- foo
  ┃◌
```

> deleteContentBackward

```buffer
- one
  - kid
- foo┃
```

### delete-to-content-start

Cmd-Backspace on an item deletes back to the start of its text, never into its marker.

```yaml
tags: edge
```

```buffer
- alpha beta┃
```

> deleteSoftLineBackward

```buffer
- ┃
```

### Joining a task

A task's checkbox is chrome, like its marker (Home stops after it): Backspace before it joins the
task into the node above, and the checkbox goes with the marker (TO strips both). The host's
Backspace would leave `- [ ]b`, which is no task. (Right after the checkbox, Backspace is plain text
by default: [TaskBackspace5](tasks.md#taskbackspace5).)

#### Backspace before the checkbox

```yaml
tags: edge markup-task
markup: decorated
```

```buffer
- a
- ┃[ ] b
```

> deleteContentBackward

```buffer
- a┃b
```

### Joining an item with children

A first child that has children of its own joins its parent, its children moving up a level into its
place, by Backspace's rule 5 ([backspace.md](backspace.md); `joinWithChildren: join`, the default):
as Tine, RemNote and TO do (TO's grammar: "a parent absorbs its first child; grandchildren
re-parent"). Logseq, Roam, WorkFlowy, Dynalist, Tana and Outliner refuse both keys here, on these
very outlines (`refuse`, [Backspace45b](backspace.md#backspace45b); BlockNote's Delete joins), so
as not to restructure a subtree on the way; by default ourus joins: nothing is lost, and the key
does what it does elsewhere. The joins those apps do make, ourus makes too: a sibling with children
joins the node above, its children keeping their depth ([Backspace8](backspace.md#backspace8),
[Delete7](delete.md#delete7); only Tana refuses it), and a first child without children joins its
parent ([Backspace3](backspace.md#backspace3), [Delete1](delete.md#delete1); only WorkFlowy refuses
it).

#### Children move to the joined node

```yaml
tags: edge
```

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

```yaml
tags: edge
```

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

```yaml
tags: edge
```

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

```yaml
tags: edge
```

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

```yaml
tags: edge
```

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

Outdenting a later child leaves the quote above it alone (TO's e2e case for #255 is marked
known-failing: it sets the quote off with a blank line).

#### Outdented child leaves quote above alone

```yaml
tags: edge
```

```buffer
- item
  > quote

  - boo┃
```

> outdent

```buffer
- item
  > quote

- boo┃
```

### list-marker-content-column

A child nests at its parent's content column, which a wider gap after the marker moves; the child
keeps its own gap. (TO narrows the gap to one space; Obsidian, which indents with a tab, can't be
compared here: its runs translate tabs to two spaces.)

```yaml
tags: edge
```

```buffer
-  parent
-  kid┃
```

> indent

```buffer
-  parent
   -  kid┃
```

### indent-unit-on-every-line

In a tab-indented list, an indent writes the tab on every line of the node, continuation
lines included (TO, when measured, wrote a tab on the first line and spaces below it; it now agrees,
as Outliner does; bare Obsidian leaves the continuation line behind).

```yaml
tags: edge
```

```buffer
- a
→- x
- b┃
  cont
```

> indent

```buffer
- a
→- x
→- b┃
→  cont
```

### seams-across-a-re-indent

A quote, a thematic break or an indented code block inside an item keeps its kind when the item
is indented or outdented: the shift is the same on every line of the subtree (in TO, when measured,
a block pushed past column 3 of its container became a paragraph or a list item; it now keeps the
thematic break and the code, and sets the quote off with a blank line). Bare Obsidian shifts only
the item's own line.

#### Indented item keeps its quote

```yaml
tags: edge
```

```buffer
- a
- b┃
  > q
```

> indent

```buffer
- a
  - b┃
    > q
```

#### Outdented item keeps its quote

```yaml
tags: edge
```

```buffer
- a
  - b┃
    > q
```

> outdent

```buffer
- a
- b┃
  > q
```

#### Indented item keeps its thematic break

```yaml
tags: edge
```

```buffer
- a
- b┃

  ---
```

> indent

```buffer
- a
  - b┃

    ---
```

#### Outdented item keeps its code block

```yaml
tags: edge
```

```buffer
- a
  - b┃

        code
```

> outdent

```buffer
- a
- b┃

      code
```

### destination-list-style

An item joining a list takes the list's bullet: a different bullet would start a new list, as
[Indent3](indent.md#indent3) has it too. TO, Outliner and bare Obsidian keep the item's own bullet,
and so start a second list under `a`.

```yaml
tags: edge
```

```buffer
* a
  * x
- b┃
```

> indent

```buffer
* a
  * x
  * b┃
```

## Moving

### lone-block-id

A block id on its own line is the node's last line, and moves with it (bare Obsidian moves the
caret's line, leaving the id behind).

#### Block id moves with its item

```yaml
tags: edge
```

```buffer
- a
- b┃
  ^id
```

> moveSubtreeUp

```buffer
- b┃
  ^id
- a
```

#### Block id moves with its paragraph

```yaml
tags: edge
```

```buffer
para one
^blk

para┃ two
```

> moveSubtreeUp

```buffer
para┃ two

para one
^blk
```

### lazy-continuation-at-seams

A paragraph moved below a quote it was written right above gets a blank line between them: without
one, it would continue the quote. A fence needs no blank line on either side.

#### Blank line added below a quote

```yaml
tags: edge
```

```buffer
para┃
> q
```

> moveSubtreeDown

```buffer
> q

para┃
```

#### No blank line needed after a fence

```yaml
tags: edge
```

````buffer
para┃
```
code
```
````

> moveSubtreeDown

````buffer
```
code
```
para┃
````

#### No blank line needed before a fence

```yaml
tags: edge
```

````buffer
```
code┃
```
para
````

> moveSubtreeDown

````buffer
para
```
code┃
```
````

## Ordered lists

### #159 (ordered-run-split-numbering)

Its numbering half is [Enter25](enter.md#enter25)'s: Enter in a list starting at 8 renumbers the
items after the new one, past 10. Its split of a list by a bullet item is ourus's own Enter now,
and the renumbering stops at a list's end (#228).

### Outdenting the head of a nested list

The item outdents after its parent, and the items it leaves behind renumber from the list's start,
so `2. c` becomes `1. c` and stays a list under `a`'s text. (obsidian-true-outliner outdents
logically.)

```yaml
tags: edge
outdent: logical
```

```buffer
1. a
   1. b┃
   2. c
2. d
```

> outdent

```buffer
1. a
   1. c
2. b┃
3. d
```

## Abandoning an empty place

From TO's `carried-place-removal.md` (#249): an empty node a key made, then left without typing,
possibly after Tab or Shift-Tab carried it. An empty item stays, as Logseq, WorkFlowy, Roam and
Dynalist keep an empty bullet the caret leaves: after another item as it is, and right under its
parent's text, where Markdown would read it as a setext underline, set off by a blank line above it.
What Markdown can't hold at all (an empty paragraph, an empty line inside a node) goes, with the
lines that were written for it. TO instead restores the document from before the key that made it.

### Shift-Enter, Tab, then leave

The place moves with the node it is in, to the node's new content column, as every line of an
indented node does (indent-unit-on-every-line), so typing there continues the node's text; leaving
it removes it, and one Backspace on it goes back to where Shift-Enter started.

#### Carried place removed on leaving

```yaml
tags: edge free-form
```

```buffer
- one
  - kid
- foo┃
```

> shiftEnter indent

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

```yaml
tags: edge free-form
```

```buffer
- one
  - kid
  - sib
- foo┃
```

> shiftEnter indent indent cursorDocStart

```buffer
┃- one
  - kid
  - sib
    - foo
```

#### Backspace returns to the start

```yaml
tags: edge
```

```buffer
- one
  - kid
- foo┃
```

> shiftEnter indent deleteContentBackward

```buffer
- one
  - kid
  - foo┃
```

#### Shift-Tab then Backspace returns to start

```yaml
tags: edge
```

```buffer
- a
  - b┃
- c
```

> shiftEnter outdent deleteContentBackward

```buffer
- a
- b┃
- c
```

### Shift-Enter, Tab, then Enter

Enter on the place splits there: a new item after the node (TO dropped the place and moved
to the next item).

```yaml
tags: edge
```

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

### Enter, then Shift-Enter and Backspace

Shift-Enter on an empty item is the host's line break, and Backspace takes it back; the empty
item stays, as in Logseq, WorkFlowy, Roam, Dynalist and Outliner.

```yaml
tags: edge
```

```buffer
- foo┃
```

> enter shiftEnter deleteContentBackward

```buffer
- foo
- ┃
```

### Enter, Tab, then leave

An empty child right under its parent's text is a placeholder while the caret is in it. Leaving it,
it stays, written with a blank line above it, so the text still reads as an empty child: an empty
item can't interrupt a paragraph, so right under the text `  - ` would be a setext underline (the
parent's text a heading) and `   1. ` more of the text, which is what bare Obsidian and Outliner
leave. A blank line after the list stays too. (The bullet case is
[Placeholder1](placeholders.md#placeholder1).)

#### An empty ordered child kept with a blank line

```yaml
tags: edge
```

```buffer
1. a┃
2. b
```

> enter indent

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

```yaml
tags: edge
```

```buffer
- foo┃

para
```

> enter

```buffer
- foo
- ┃

para
```

> indent

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

An empty item after another item can be written, so it stays, as an empty bullet does in Logseq,
WorkFlowy, Roam and Dynalist.

#### Outdented empty ordered item stays

```yaml
tags: edge
```

```buffer
1. p
   1. a┃
2. q
```

> enter outdent cursorDocStart

```buffer
┃1. p
   1. a
2. 
3. q
```

#### Second Enter outdents to a kept item

```yaml
tags: edge
```

```buffer
- a
  - b┃
```

> enter enter cursorDocStart

```buffer
┃- a
  - b
- 
```

### Enter twice, then leave

With `enterOnEmptyItem: outdent`, Enter twice in the middle of a list leaves it for an empty
paragraph ([Enter7b](enter.md#enter7b)), which Markdown can't hold: leaving it removes it together
with the blank lines that set it off, and the list is as tight as before. By default Enter makes a
second empty item there instead, as the outliners do ([Enter7](enter.md#enter7)).

#### Empty paragraph and blank lines removed

```yaml
enterOnEmptyItem: outdent
tags: edge free-form
```

```buffer
- a┃
- b
```

> enter enter cursorDocStart

```buffer
┃- a
- b
```

#### Indented list under paragraph restored

```yaml
enterOnEmptyItem: outdent
tags: edge free-form
```

```buffer
para
  - a┃
  - b
```

> enter enter cursorDocStart

```buffer
┃para
  - a
  - b
```

## Paste

TO's real-app paste regressions, played as `pasteStructured` (Ctrl-V; its rules are
[paste.md](paste.md)'s). Pasted Markdown is placed as nodes where Enter at the end of the node's
text would put a new one, as Logseq pastes an outline (Roam and Tine too): re-indented to the
destination's depth and indent unit, its spacing the destination's, with a blank line only where
blocks would otherwise run together. Bare Obsidian and Outliner paste the text as it is, into the
item's text at the caret.

### #216

A pasted list takes the destination's indent unit, tabs or spaces, on every level.

#### Pasted list takes space indent unit

```yaml
tags: edge
clipboard: |
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

#### Pasted list takes tab indent unit

```yaml
tags: edge
clipboard: |
  - a
    - b
      - c
```

```buffer
- top
→- sib┃
```

> pasteStructured

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

```yaml
tags: edge
clipboard: |2
      first

      > quote
```

```buffer
## H┃
below
```

> pasteStructured

```buffer
## H

first

> quote┃

below
```

### #197

A list and a block pasted at the end of an item with children become its first children, in the
order pasted, before the children it had. The list stays as tight as it was (the destination decides
the spacing: [paste.md](paste.md)'s rule 2, as in [Paste25](paste.md#paste25)): no blank line is
needed to keep them apart, the quote ending `alpha`'s list and `see`'s starting after it, and the
clipboard's own blank line between them goes. (TO's e2e case, with a table, which a list item's text
would otherwise take in, sets them off with blank lines.)

#### Pasted list and block become children

```yaml
tags: edge
clipboard: |
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
