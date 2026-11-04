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

TO's entries the rest of the spec covers, and what they say:

- **E1, E3**: Enter in the middle of an item splits it, the space at the split going with neither half
  ([Enter1](enter.md#enter1)); in an ordered list, the items after the new one renumber
  ([Enter2](enter.md#enter2), [Enter25](enter.md#enter25)).
- **E29**: Enter at the start of a paragraph: TO puts the caret on a new line above, as Enter at an item's
  start puts it in the new item above ([Enter31](enter.md#enter31)), and so does ourus
  ([Enter33](enter.md#enter33)); bare Obsidian and Outliner open a blank line above, the text and the
  caret staying put ([Enter33b](enter.md#enter33b), `enterAtTextStart: stay`). At a heading's start
  (E27), TO puts an empty heading above; ourus an empty paragraph ([Enter32](enter.md#enter32)).
- **#159 (ordered-run-split-numbering)**: Its numbering half is [Enter25](enter.md#enter25)'s: Enter in a list starting at 8 renumbers the
  items after the new one, past 10. Its split of a list by a bullet item is ourus's own Enter now,
  and the renumbering stops at a list's end (#228).

## TO-Bug228

*Enter, #228: Renumbering stops at a delimiter change*

The renumbering stops at the list's end: the next list, written with the other delimiter, keeps
its numbers. TO's e2e case for #228 is marked known-failing: it renumbers on into the `1)` list, as
Outliner and bare Obsidian do.

```yaml
tags: rare
```

```markdown
1. a┃
1) b
2) c
```

> enter

```markdown
1. a
2. ┃
1) b
2) c
```

## TO-E4

*Enter: E4*

Enter on a continuation line of a multi-line item splits the item there, as Enter anywhere in an
item's text does (Logseq, bare Obsidian and TO agree; Roam, Dynalist, Tine and Outliner too, keeping
the space at the new item's start; WorkFlowy breaks the line inside the item instead).

```yaml
tags: common
```

```markdown
- first
  second┃ line
```

> enter

```markdown
- first
  second
- ┃line
```

## TO-E7-E8

*Enter, E7, E8: Split item becomes first tab-indented child*

An item with tab-indented children gets the new item as its first child, indented with a tab as they
are ([Enter3](enter.md#enter3) and [Enter4](enter.md#enter4) are the same with spaces). Split
mid-text, the item keeps its text up to the caret and its children, and the rest becomes the new
node where Enter at the end puts one: TO's split, as in Logseq and Tine (`enterMidItem: child`); by
default ourus, as WorkFlowy, Roam, Dynalist and Obsidian (bare or with Outliner), keeps the children
with the second half instead, the first half going before it ([Enter3](enter.md#enter3)).

```yaml
tags: rare
enterMidItem: child
```

```markdown
- alpha┃ beta
→- child
```

> enter

```markdown
- alpha
→- ┃beta
→- child
```

## TO-E7-E8b

*Enter, E7, E8: End of parent opens empty first child*

```yaml
tags: common
```

```markdown
- alpha┃
→- child
```

> enter

```markdown
- alpha
→- ┃◌
→- child
```

## TO-E9

*Enter: E9*

Enter in a paragraph followed by a list makes two paragraphs, set off by the blank line Markdown
needs between them. The list, which a paragraph owns when it comes right after it, goes with the
second half, which it still follows; its seam is left as it was. TO made the second half an item,
the first one keeping the list, as an item keeps its children when split (E7); here text split in a
paragraph stays paragraphs. Bare Obsidian and Outliner make a line break in the paragraph instead
([Enter12](enter.md#enter12) is ourus's Enter in a paragraph).

```yaml
tags: common
```

```markdown
one┃ two
- child
```

> enter

```markdown
one

┃two
- child
```

## TO-E10

*Enter: E10*

Enter at the end of an item whose first child is a paragraph: the new item is the first child,
as at the end of any item with children ([Enter4](enter.md#enter4)). The outliners agree (Logseq,
WorkFlowy, Roam, Dynalist, Tana), but for them the paragraph is a block like any other; of the apps
with paragraphs none does it: SiYuan opens an empty paragraph in the item above it and TO an empty
line there, and Obsidian, bare or with Outliner, adds a sibling, which takes the paragraph as its
own.

```yaml
tags: rare
```

```markdown
- item┃

  para
```

> enter

```markdown
- item
  - ┃◌

  para
```

## TO-E11

*Enter: E11*

The same with a code block as the first child: the new child copies the indentation of the
existing one, so the code block stays where it is (TO, when measured, used its own unit and made
it a grandchild; it now agrees). With TO's split (`enterMidItem: child`), as E7.

```yaml
tags: rare
enterMidItem: child
```

````markdown
- item┃ text
→```
→code
→```
````

> enter

````markdown
- item
→- ┃text
→```
→code
→```
````

## TO-E15

*Enter: E15*

Enter in a heading followed by a list: the rest of the title becomes a paragraph, not an item (TO
turned it into an item), and the list, right after it, is that paragraph's. The seam is left as it
was: a list needs no blank line to start after a paragraph, as a quote needs none (#267, E5) and a
heading none (Split title above a subheading). Bare Obsidian and Outliner do the same.

```yaml
tags: common
```

```markdown
# Head┃line
- item
```

> enter

```markdown
# Head
┃line
- item
```

## TO-E17

*Enter: E17*

Enter in a setext heading's title splits it as in an ATX heading: the underline stays with the
first half, and the rest of the title becomes the section's first paragraph (TO now sets it off with
a blank line). A text editor's line break would make a two-line heading instead.

```yaml
tags: rare
```

```markdown
Hello┃ world
====
```

> enter

```markdown
Hello
====
┃world
```

## TO-E18

*Enter: E18*

Enter in a setext underline acts at the end of the title, as Enter in a list marker acts at the
item's text start ([Enter34](enter.md#enter34)): the underline is markup, not text to split. TO now
refuses it; a text editor splits the underline.

```yaml
tags: rare markup-heading
```

```markdown
Hello world
==┃==
```

> enter

```markdown
Hello world
====
┃◌
```

## TO-E19-E21

*Enter, E19, E21: End of lone heading starts a paragraph*

Enter at the end of a heading starts its section with an empty paragraph, also when the
section begins with a list (TO made an empty item there). A blank line is written below it only
where the next block would otherwise run into it (a paragraph: End of heading above a paragraph);
a list needs none, so its seam is left as it was, as bare Obsidian and Outliner leave it.

```yaml
tags: common
```

```markdown
# Head┃
```

> enter "x"

```markdown
# Head
x┃
```

## TO-E19-E21b

*Enter, E19, E21: Empty paragraph before a section list*

```yaml
tags: common free-form
```

```markdown
# Head┃
- item
```

> enter

```markdown
# Head
┃◌
- item
```

## TO-E32

*Enter, E32: Task checkbox carries over unchecked*

Enter on a task: the checkbox carries over to the new item, unchecked, as in Obsidian (bare, with
Outliner or TO).

```yaml
tags: common
```

```markdown
- [ ] alpha┃ beta
```

> enter

```markdown
- [ ] alpha
- [ ] ┃beta
```

## TO-E32b

*Enter, E32: Checked task gives unchecked new item*

```yaml
tags: common
```

```markdown
- [x] done┃
```

> enter

```markdown
- [x] done
- [ ] ┃
```

## TO-E33

*Enter: E33*

Enter replaces a selection inside the text, then splits the item, as typing would (a defect in TO
when measured, since fixed).

```yaml
tags: common
```

```markdown
- al«pha be»ta
```

> enter

```markdown
- al
- ┃ta
```

## TO-Bug267-E5

*Enter: #267, E5*

In a paragraph, Enter makes two paragraphs. TO also wrote a blank line between the second
half and the quote below it; both read the same, and here the quote's seam is left as it was. (Bare
Obsidian and Outliner make a line break in the paragraph: see [Enter12](enter.md#enter12).)

```yaml
tags: rare
```

```markdown
# H
para┃ text
> q
```

> enter

```markdown
# H
para

┃text
> q
```

## TO-E13-E16

*Enter, E13, E16: Rest of title becomes first paragraph*

In a heading, the rest of the title becomes the section's first paragraph, right under it, as
in bare Obsidian and Outliner (TO now writes a blank line between them).

```yaml
tags: common
```

```markdown
# Hello┃ world
```

> enter

```markdown
# Hello
┃world
```

## TO-E13-E16b

*Enter, E13, E16: Split title above a subheading*

```yaml
tags: common
```

```markdown
# He┃ad
## Sub
```

> enter

```markdown
# He
┃ad
## Sub
```

## TO-E14-E20

*Enter, E14, E20: Split title above an existing paragraph*

Enter in a heading: a paragraph right under the heading stays a paragraph of its own, set off
from the new one by a blank line; without it the two would read as one paragraph, which is what
bare Obsidian and Outliner leave.

```yaml
tags: common
```

```markdown
# Head┃line
Body.
```

> enter

```markdown
# Head
┃line

Body.
```

## TO-E14-E20b

*Enter, E14, E20: End of heading above a paragraph*

```yaml
tags: common
```

```markdown
# Head┃
Body.
```

> enter

```markdown
# Head
┃◌

Body.
```

## TO-S4

*Shift-Enter: S4*

Shift-Enter in a paragraph continues it on a new line: still one paragraph. The space at the break
starts the new line, the caret before it, where Markdown renders nothing of it, as bare Obsidian
and Outliner keep it (TO drops it).

```yaml
tags: common
```

```markdown
one┃ two
```

> shiftEnter

```markdown
one
┃ two
```

## TO-S5

*Shift-Enter: S5*

With the caret in a list marker, Shift-Enter is the host's (`markup: text`, the default;
[ShiftEnter22](shift-enter.md#shiftenter22)), which splits the marker, as TO's catalogue has it.

```yaml
tags: rare free-form
```

```markdown
-┃ alpha
```

> shiftEnter

```yaml
result: deferredToHost
```

```markdown
-
┃ alpha
```

## TO-S7-S8

*Shift-Enter, S7, S8: Line break in setext title*

A setext title runs over several lines, as CommonMark lets it and as the paragraph it underlines
can, so Shift-Enter breaks it, the heading staying one (TO now makes the rest a new ATX heading
below); only an ATX title is a single line. Its underline is not text: Shift-Enter there is refused, the text left as
it was (TO cut the underline in two).

```yaml
tags: rare markup-heading
```

```markdown
Hello┃ world
====
```

> shiftEnter

```markdown
Hello
┃ world
====
```

## TO-S7-S8b

*Shift-Enter, S7, S8: Line break in setext underline refused*

```yaml
tags: rare markup-heading
```

```markdown
Hello world
==┃==
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```markdown
Hello world
==┃==
```

## TO-S9

*Shift-Enter: S9*

The new line keeps an indented paragraph's indentation (TO, when measured, wrote it at column 0,
where it stayed in the paragraph only by lazy continuation; it now agrees).

```yaml
tags: rare
```

```markdown
- item

  para┃ text
```

> shiftEnter

```markdown
- item

  para
  ┃ text
```

## TO-S11

*Shift-Enter, S11: A blank line inside a multi-line item*

At the end of a line that isn't the node's last, the new line would be an empty line inside the
text, which Markdown holds in none: the text breaks into two paragraphs there, the caret on the
blank line between, at the text's column, and typing on it joins them again. Bare Obsidian and
Outliner split the paragraph too, as TO's blank line did when measured.

```yaml
tags: common
```

```markdown
- foo┃
  bar
```

> shiftEnter

```markdown
- foo
  ┃
  bar
```

> "x"

```markdown
- foo
  x┃
  bar
```

## TO-S11b

*Shift-Enter, S11: Leaving the blank line*

Left, the blank line stays: the text is two paragraphs.

```yaml
tags: common
```

```markdown
foo┃
bar
```

> shiftEnter cursorDocStart

```markdown
┃foo

bar
```

## TO-S13

*Shift-Enter: S13*

Shift-Enter over a selection replaces it, then breaks the line, as typing would.

```yaml
tags: common
```

```markdown
- a«lpha» beta
```

> shiftEnter

```markdown
- a
  ┃ beta
```

## TO-Bug269

*Backspace, #269: Emptied middle item removed and renumbered*

Backspace on an emptied item. (An emptied first item, with nothing above, is removed:
[Backspace17](backspace.md#backspace17); true-outliner leaves it.)

Twice on an emptied middle item: the text goes, then the item, and the list renumbers.

```yaml
tags: common
```

```markdown
1. p
2. a┃
3. q
```

> deleteContentBackward deleteContentBackward

```markdown
1. p┃
2. q
```

## TO-Bug153

*Backspace, #153: Undoing a fresh line break*

Right after Shift-Enter, Backspace takes the new line back.

```yaml
tags: common
```

```markdown
- one
  - kid
- foo┃
```

> shiftEnter

```markdown
- one
  - kid
- foo
  ┃◌
```

> deleteContentBackward

```markdown
- one
  - kid
- foo┃
```

## TO-DelStart

*Backspace: delete-to-content-start*

Cmd-Backspace on an item deletes back to the start of its text, never into its marker.

```yaml
tags: common
```

```markdown
- alpha beta┃
```

> deleteSoftLineBackward

```markdown
- ┃
```

## TO1

*Backspace, Joining a task: Backspace before the checkbox*

A task's checkbox is chrome, like its marker (Home stops after it): Backspace before it joins the
task into the node above, and the checkbox goes with the marker (TO strips both). The host's
Backspace would leave `- [ ]b`, which is no task. (Right after the checkbox, Backspace is plain text
by default: [TaskBackspace5](tasks.md#taskbackspace5).)

```yaml
tags: rare markup-task
markup: decorated
```

```markdown
- a
- ┃[ ] b
```

> deleteContentBackward

```markdown
- a┃b
```

## TO2

*Backspace, Joining an item with children: Children move to the joined node*

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

```yaml
tags: common
```

```markdown
- a
  - ┃b
    - c
```

> deleteContentBackward

```markdown
- a┃b
  - c
```

## TO3

*Backspace, Joining an item with children: Delete forward absorbs child with grandchildren*

```yaml
tags: common
```

```markdown
- a┃
  - b
    - c
```

> deleteContentForward

```markdown
- a┃b
  - c
```

## TO4

*Backspace: Joining across ordered runs*

A bullet between two runs of an ordered list joins away, and the runs become one list again.

```yaml
tags: rare
```

```markdown
1. a
2. b
- ┃x
3. c
```

> deleteContentBackward

```markdown
1. a
2. b┃x
3. c
```

## TO5

*Backspace, Joining away the head of a list: Next item becomes the new 1.*

The items left behind take the list's start: removing `1.` makes `2.` the new `1.`, which also
keeps it a list under the text above (only a list starting at 1 can interrupt a paragraph). A
list that started elsewhere keeps its start.

```yaml
tags: common
```

```markdown
- p
  1. ┃a
  2. b
```

> deleteContentBackward

```markdown
- p┃a
  1. b
```

## TO6

*Backspace, Joining away the head of a list: List starting at 3 keeps its start*

```yaml
tags: rare
```

```markdown
3. a
4. ┃b
5. c
```

> deleteContentBackward

```markdown
3. a┃b
4. c
```

## TO-Bug255

*Indentation, #255: Outdented child leaves quote above alone*

Outdenting a later child leaves the quote above it alone (TO's e2e case for #255 is marked
known-failing: it sets the quote off with a blank line).

```yaml
tags: rare
```

```markdown
- item
  > quote

  - boo┃
```

> outdent

```markdown
- item
  > quote

- boo┃
```

## TO-MarkerCol

*Indentation: list-marker-content-column*

A child nests at its parent's content column, which a wider gap after the marker moves; the child
keeps its own gap. (TO narrows the gap to one space; Obsidian, which indents with a tab, can't be
compared here: its runs translate tabs to two spaces.)

```yaml
tags: rare
```

```markdown
-  parent
-  kid┃
```

> indent

```markdown
-  parent
   -  kid┃
```

## TO-IndentUnit

*Indentation: indent-unit-on-every-line*

In a tab-indented list, an indent writes the tab on every line of the node, continuation
lines included (TO, when measured, wrote a tab on the first line and spaces below it; it now agrees,
as Outliner does; bare Obsidian leaves the continuation line behind).

```yaml
tags: rare
```

```markdown
- a
→- x
- b┃
  cont
```

> indent

```markdown
- a
→- x
→- b┃
→  cont
```

## TO-Seams

*Indentation, seams-across-a-re-indent: Indented item keeps its quote*

A quote, a thematic break or an indented code block inside an item keeps its kind when the item
is indented or outdented: the shift is the same on every line of the subtree (in TO, when measured,
a block pushed past column 3 of its container became a paragraph or a list item; it now keeps the
thematic break and the code, and sets the quote off with a blank line). Bare Obsidian shifts only
the item's own line.

```yaml
tags: rare
```

```markdown
- a
- b┃
  > q
```

> indent

```markdown
- a
  - b┃
    > q
```

## TO-Seamsb

*Indentation, seams-across-a-re-indent: Outdented item keeps its quote*

```yaml
tags: rare
```

```markdown
- a
  - b┃
    > q
```

> outdent

```markdown
- a
- b┃
  > q
```

## TO-Seamsc

*Indentation, seams-across-a-re-indent: Indented item keeps its thematic break*

```yaml
tags: rare
```

```markdown
- a
- b┃

  ---
```

> indent

```markdown
- a
  - b┃

    ---
```

## TO-Seamsd

*Indentation, seams-across-a-re-indent: Outdented item keeps its code block*

```yaml
tags: rare
```

```markdown
- a
  - b┃

        code
```

> outdent

```markdown
- a
- b┃

      code
```

## TO-ListStyle

*Indentation: destination-list-style*

An item joining a list takes the list's bullet: a different bullet would start a new list, as
[Indent3](indent.md#indent3) has it too. TO, Outliner and bare Obsidian keep the item's own bullet,
and so start a second list under `a`.

```yaml
tags: rare
```

```markdown
* a
  * x
- b┃
```

> indent

```markdown
* a
  * x
  * b┃
```

## TO-BlockId

*Moving, lone-block-id: Block id moves with its item*

A block id on its own line is the node's last line, and moves with it (bare Obsidian moves the
caret's line, leaving the id behind).

```yaml
tags: rare
```

```markdown
- a
- b┃
  ^id
```

> moveSubtreeUp

```markdown
- b┃
  ^id
- a
```

## TO-BlockIdb

*Moving, lone-block-id: Block id moves with its paragraph*

```yaml
tags: rare
```

```markdown
para one
^blk

para┃ two
```

> moveSubtreeUp

```markdown
para┃ two

para one
^blk
```

## TO-Lazy

*Moving, lazy-continuation-at-seams: Blank line added below a quote*

A paragraph moved below a quote it was written right above gets a blank line between them: without
one, it would continue the quote. A fence needs no blank line on either side.

```yaml
tags: rare
```

```markdown
para┃
> q
```

> moveSubtreeDown

```markdown
> q

para┃
```

## TO-Lazyb

*Moving, lazy-continuation-at-seams: No blank line needed after a fence*

```yaml
tags: rare
```

````markdown
para┃
```
code
```
````

> moveSubtreeDown

````markdown
```
code
```
para┃
````

## TO-Lazyc

*Moving, lazy-continuation-at-seams: No blank line needed before a fence*

```yaml
tags: rare
```

````markdown
```
code┃
```
para
````

> moveSubtreeDown

````markdown
para
```
code┃
```
````

## TO7

*Ordered lists: Outdenting the head of a nested list*

The item outdents after its parent, and the items it leaves behind renumber from the list's start,
so `2. c` becomes `1. c` and stays a list under `a`'s text. (obsidian-true-outliner outdents
logically.)

```yaml
tags: rare
outdent: logical
```

```markdown
1. a
   1. b┃
   2. c
2. d
```

> outdent

```markdown
1. a
   1. c
2. b┃
3. d
```

## TO8

*Abandoning an empty place, Shift-Enter, Tab, then leave: Carried blank line kept on leaving*

From TO's `carried-place-removal.md` (#249): an empty node a key made, then left without typing,
possibly after Tab or Shift-Tab carried it. An empty item stays, as Logseq, WorkFlowy, Roam and
Dynalist keep an empty bullet the caret leaves: after another item as it is, and right under its
parent's text, where Markdown would read it as a setext underline, set off by a blank line above it.
What Markdown can't hold at all (an empty paragraph) goes, with the lines that were written for it.
TO instead restores the document from before the key that made it.

The blank line Shift-Enter makes moves with the node it ends, to the node's new content column, as
every line of an indented node does (indent-unit-on-every-line), so typing there continues the
node's text; left, it stays as written, and one Backspace on it goes back to where Shift-Enter
started.

```yaml
tags: common
```

```markdown
- one
  - kid
- foo┃
```

> shiftEnter indent

```markdown
- one
  - kid
  - foo
    ┃◌
```

> cursorDocStart

```markdown
┃- one
  - kid
  - foo
```

## TO9

*Abandoning an empty place, Shift-Enter, Tab, then leave: Doubly indented blank line kept on leaving*

```yaml
tags: common
```

```markdown
- one
  - kid
  - sib
- foo┃
```

> shiftEnter indent indent cursorDocStart

```markdown
┃- one
  - kid
  - sib
    - foo
```

## TO10

*Abandoning an empty place, Shift-Enter, Tab, then leave: Backspace returns to the start*

```yaml
tags: common
```

```markdown
- one
  - kid
- foo┃
```

> shiftEnter indent deleteContentBackward

```markdown
- one
  - kid
  - foo┃
```

## TO11

*Abandoning an empty place, Shift-Enter, Tab, then leave: Shift-Tab then Backspace returns to start*

```yaml
tags: common
```

```markdown
- a
  - b┃
- c
```

> shiftEnter outdent deleteContentBackward

```markdown
- a
- b┃
- c
```

## TO12

*Abandoning an empty place: Shift-Enter, Tab, then Enter*

Enter on Shift-Enter's blank line, at the node's text column, is a new item after the node (TO
dropped the place and moved to the next item).

```yaml
tags: common
```

```markdown
- one
  - kid
- foo┃
- bar
```

> shiftEnter indent enter

```markdown
- one
  - kid
  - foo
  - ┃
- bar
```

## TO13

*Abandoning an empty place: Enter, then Shift-Enter and Backspace*

Shift-Enter on an empty item is the host's line break, and Backspace takes it back; the empty
item stays, as in Logseq, WorkFlowy, Roam, Dynalist and Outliner.

```yaml
tags: common
```

```markdown
- foo┃
```

> enter shiftEnter deleteContentBackward

```markdown
- foo
- ┃
```

## TO14

*Abandoning an empty place, Enter, Tab, then leave: An empty ordered child kept with a blank line*

An empty child right under its parent's text is a placeholder while the caret is in it. Leaving it,
it stays, written with a blank line above it, so the text still reads as an empty child: an empty
item can't interrupt a paragraph, so right under the text `  - ` would be a setext underline (the
parent's text a heading) and `   1. ` more of the text, which is what bare Obsidian and Outliner
leave. A blank line after the list stays too. (The bullet case is
[Placeholder1](placeholders.md#placeholder1).)

```yaml
tags: common
```

```markdown
1. a┃
2. b
```

> enter indent

```markdown
1. a
   1. ┃◌
2. b
```

> cursorDocStart

```markdown
┃1. a

   1. 
2. b
```

## TO15

*Abandoning an empty place, Enter, Tab, then leave: Blank line after the list stays*

```yaml
tags: common
```

```markdown
- foo┃

para
```

> enter

```markdown
- foo
- ┃

para
```

> indent

```markdown
- foo
  - ┃◌

para
```

> cursorDocStart

```markdown
┃- foo

  - 

para
```

## TO16

*Abandoning an empty place, Enter, Shift-Tab, then leave: Outdented empty ordered item stays*

An empty item after another item can be written, so it stays, as an empty bullet does in Logseq,
WorkFlowy, Roam and Dynalist.

```yaml
tags: common
```

```markdown
1. p
   1. a┃
2. q
```

> enter outdent cursorDocStart

```markdown
┃1. p
   1. a
2. 
3. q
```

## TO17

*Abandoning an empty place, Enter, Shift-Tab, then leave: Second Enter outdents to a kept item*

```yaml
tags: common
```

```markdown
- a
  - b┃
```

> enter enter cursorDocStart

```markdown
┃- a
  - b
- 
```

## TO18

*Abandoning an empty place, Enter twice, then leave: Empty paragraph and blank lines removed*

With `enterOnEmptyItem: outdent`, Enter twice in the middle of a list leaves it for an empty
paragraph ([Enter7b](enter.md#enter7b)), which Markdown can't hold: leaving it removes it together
with the blank lines that set it off, and the list is as tight as before. By default Enter makes a
second empty item there instead, as the outliners do ([Enter7](enter.md#enter7)).

```yaml
enterOnEmptyItem: outdent
tags: rare free-form
```

```markdown
- a┃
- b
```

> enter enter cursorDocStart

```markdown
┃- a
- b
```

## TO19

*Abandoning an empty place, Enter twice, then leave: Indented list under paragraph restored*

```yaml
enterOnEmptyItem: outdent
tags: rare
```

```markdown
para
  - a┃
  - b
```

> enter enter cursorDocStart

```markdown
┃para
  - a
  - b
```

## TO-Bug216

*Paste, #216: Pasted list takes space indent unit*

TO's real-app paste regressions, played as `paste` (Ctrl-V; its rules are
[paste.md](paste.md)'s). Pasted Markdown is placed as nodes where Enter at the end of the node's
text would put a new one, as Logseq pastes an outline (Roam and Tine too): re-indented to the
destination's depth and indent unit, its spacing the destination's, with a blank line only where
blocks would otherwise run together. Bare Obsidian and Outliner paste the text as it is, into the
item's text at the caret.

A pasted list takes the destination's indent unit, tabs or spaces, on every level.

```yaml
tags: common
clipboard: |
  - a
  →- b
  →→- c
```

```markdown
- top
  - sib┃
```

> paste

```markdown
- top
  - sib
  - a
    - b
      - c┃
```

## TO-Bug216b

*Paste, #216: Pasted list takes tab indent unit*

```yaml
tags: common
clipboard: |
  - a
    - b
      - c
```

```markdown
- top
→- sib┃
```

> paste

```markdown
- top
→- sib
→- a
→→- b
→→→- c┃
```

## TO-Bug264

*Paste, #264: Pasted quote set off from paragraph*

A pasted quote is set off from the paragraph below it, and the payload's own indentation goes.

```yaml
tags: common
clipboard: |2
      first

      > quote
```

```markdown
## H┃
below
```

> paste

```markdown
## H

first

> quote┃

below
```

## TO-Bug197

*Paste, #197: Pasted list and block become children*

A list and a block pasted at the end of an item with children become its first children, in the
order pasted, before the children it had. The list stays as tight as it was (the destination decides
the spacing: [paste-list-form.md](paste-list-form.md): a tight list takes the paste tight, as in [PasteListForm4](paste-list-form.md#pastelistform4)): no blank line is
needed to keep them apart, the quote ending `alpha`'s list and `see`'s starting after it, and the
clipboard's own blank line between them goes. (TO's e2e case, with a table, which a list item's text
would otherwise take in, sets them off with blank lines.)

```yaml
tags: rare
clipboard: |
  - alpha

  > note
quotes: container
```

```markdown
- top┃
  - see
```

> paste

```markdown
- top
  - alpha
  > note┃
  - see
```
