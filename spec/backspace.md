# Backspace

Command: `deleteContentBackward` (Backspace).

Backspace at the start of a node's text works on the boundary between that node and the one above;
in the middle of the text it is the host's. At its line's start, before a marker, the caret counts as
at the text start (Backspace2). Inside markup (a marker, a checkbox, `#`s, a quote's `>`), Backspace
is the host's where the host shows markup as text (`markup: text`, the default; Backspace42), and
acts at the text start where it decorates it (Backspace42b). The rules, in order; the first that
applies wins:

1. **On a code line**, the line joins the code line above; against a fence it is refused
   ([fences.md](fences.md)).
2. **The markup in front of the text goes first, as a unit**, an item's marker aside: a heading's
   `#`s or its setext underline (`headingEditing: text`, the default; Backspace18, Backspace18e), a
   task's checkbox (`taskEditing: checkbox`, the default; [tasks.md](tasks.md)), a callout's
   `[!type]` ([quotes.md](quotes.md)).
3. **An empty item goes**, the caret to the end of the text above (Backspace7); a paragraph it kept
   from running into the text above is set apart by a blank line (Backspace39). Its children go to
   the node above, into its place when that node is its parent (Backspace17c, Backspace17d); with
   nothing above, they take its place (Backspace17b). With `emptyItemWithChildren: refuse`, where
   they would move up into its place, the key does nothing (Backspace17f, Backspace17g); into an item
   above it, it joins as before (Backspace17h). The first item of the document goes, the caret
   to the text below (Backspace17); the only one leaves an empty line (Backspace17e). So does an
   empty paragraph with nothing above it in its container, its blank lines with it (Backspace43,
   Backspace43b, [Quote89](quotes.md#quote89)).
4. **Between paragraphs the blank lines go, and the paragraphs join, glued**, in one press, as at
   every boundary: the paragraph's text continues the one above's (Backspace12, Backspace12b,
   Backspace12c, Backspace12d, Backspace19b, Backspace27); with `enterAtTextStart: stay`, whose
   Enter leaves a blank line, one blank line a press while more than one is there (Backspace12e).
   Right after an item's text, where Enter
   makes no paragraph and one is Shift-Enter's, only the blank lines go: the paragraph's lines
   continue the text, as Backspace takes back a Shift-Enter (Backspace19), and an empty one is an
   empty line of the text again ([ShiftEnter11](shift-enter.md#shiftenter11)).
5. **Otherwise the node joins the node above in its container**: its text at the end of that node's
   text, its children to that node, into its place when it is the parent (Backspace1, Backspace3,
   Backspace8, Backspace11, Backspace15, Backspace22), a setext title's included, before its
   underline, which holds several lines (Backspace36, Backspace37). At the start of a continuation
   line, the line joins the line above (Backspace9). Where the joined text would read as a link
   reference definition, its start is escaped; an escape a split wrote goes when the join leaves it
   nothing to keep (Backspace38, [Enter47](enter.md#enter47)). A list the join leaves right under
   text it can't interrupt is set apart by a blank line (Backspace40). A first child with children
   joins its parent, they coming up into its place (`joinWithChildren: join`, the default;
   Backspace45), or nothing happens (`refuse`, Backspace45b).
6. **With nothing above it in its container, the next layer of markup goes**: an item's marker, the
   item becoming a paragraph where it is (`backspaceAtTopItem: unwrap`, the default; Backspace33),
   or nothing (`refuse`, Backspace34); a quote's `>`, the node leaving the quote, the rest of which
   stays quoted ([quotes.md](quotes.md)). So `> - [ ] ┃b` loses its checkbox, then its marker, then
   its `>`, and then joins the node above. First in an item whose marker shares its line (`- - a`),
   which has no text of its own, its marker goes and its text is that item's (Backspace41).
7. **What can't be written is refused**: text into code (Backspace16, Backspace24) or a table, more
   than one line into an ATX heading's title (Backspace23); with nothing above, `nothing-above`
   (Backspace26).
8. **A selection across nodes** is ourus's too: the selected text goes and the two ends join, as
   Backspace at the second end's start would join them (Backspace31). Within one node's text it is
   the host's (Backspace32).
9. **In the middle of the text**, the host's Backspace (Backspace13), one character, an emoji
   included (Backspace46).

Cmd-Backspace (`deleteSoftLineBackward`) deletes back to the start of the text on the caret's line,
never into a marker, a checkbox or `#`s; what is left there is escaped where it would start a block,
and a setext underline or a fence is refused ([below](#cmd-backspace)). At the text start it is
Backspace.

Delete mirrors these from the other side ([delete.md](delete.md)). Bare Obsidian's Backspace is a text
editor's: at an item's text start it deletes the space after the marker, and `-two` then reads as
more text of the item above (a lazy line): the item is gone, merged into its neighbour's text
without saying so. Obsidian's Outliner plugin joins as ourus does on plain lists.

## Backspace1

Joins text to the item above.

Bare Obsidian deletes the space after the marker instead: `-two` is a lazy line of `one`.

```yaml
tags: core
```

```buffer
- one
- ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## Backspace2

Caret before the marker.

The caret can be anywhere before the item's text, marker included: deleting the line break
before a marker would turn the marker into text of the item above, as bare Obsidian does
(`- one┃- two`).

```yaml
tags: edge
```

```buffer
- one
┃- two
```

> deleteContentBackward

```buffer
- one┃two
```

## Backspace3

Joins into the parent.

The node above can be the parent.

```yaml
tags: core
```

```buffer
- a
  - ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## Backspace4

Heading closing hashes stay at end.

A heading's closing `#`s stay at the end of its line.

```yaml
tags: rare markup-heading
```

```buffer
# Title #
- ┃more
```

> deleteContentBackward

```buffer
# Title┃more #
```

## Backspace5

Empty item above takes the text.

Into an empty item above, the text moves up, and the empty item takes it.

```yaml
tags: common
```

```buffer
- 
- ┃b
```

> deleteContentBackward

```buffer
- ┃b
```

## Backspace7

Empty item is removed.

The caret goes to the end of the text above. Bare Obsidian leaves `-`, an empty item still.

```yaml
tags: core
```

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

## Backspace8

Children stay with the joined text.

An item with children joins too, and its children go to the node above: into its place when
that node is its parent ([Backspace17c](#backspace17c)), else after that node's own children.

```yaml
tags: common
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

## Backspace9

Joins a continuation line.

At the start of a continuation line, Backspace joins it to the line above: the inverse of
Shift-Enter.

```yaml
tags: common
```

```buffer
- one
  ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## Backspace10

Back from an empty paragraph's placeholder.

On the empty paragraph left by Enter on an empty item, Backspace goes back to the end of the
node above.

```yaml
tags: common
```

```buffer
- a

┃◌
```

> deleteContentBackward

```buffer
- a┃
```

## Backspace11

After a blank line, a paragraph joins the item above.

The paragraph Enter made by leaving the list goes back into the item, as the empty one does
([Backspace10](#backspace10)). Bare Obsidian deletes the blank line, which makes it a lazy line of
`a` anyway.

```yaml
tags: common
```

```buffer
- a

┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## Backspace12

After a blank line, a paragraph joins the paragraph above, glued.

Between paragraphs the blank line goes and the text joins, in one press, as at every other boundary
and as RemNote without bullets, SiYuan, BlockNote and true-outliner join them; the text editors,
bare Obsidian among them, delete the blank line only. ourus makes the edit itself: a blank line
between nodes is a boundary, not the host's.

```yaml
tags: common free-form
```

```buffer
a

┃b
```

> deleteContentBackward

```result
applied
```

```buffer
a┃b
```

## Backspace12b

Enter in a paragraph, then Backspace: the text is as it was, Enter's inverse in one press.

```yaml
tags: common free-form
```

```buffer
a┃b
```

> enter

```buffer
a

┃b
```

> deleteContentBackward

```buffer
a┃b
```

## Backspace12c

With several blank lines between two paragraphs, all of them go: deleting only one would leave the
paragraphs apart, the key seeming to do nothing.

```yaml
tags: rare free-form
```

```buffer
a


┃b
```

> deleteContentBackward

```buffer
a┃b
```

## Backspace12d

The list the joined paragraph owned comes along: it is the list of the paragraph it joins.

```yaml
tags: rare free-form
```

```buffer
a

┃b
- x
```

> deleteContentBackward

```buffer
a┃b
- x
```

## Backspace12e

With `enterAtTextStart: stay`, Enter at a paragraph's start leaves a blank line above it, and
Backspace takes one back, a blank line a press while more than one is there, so the pair inverts:
joining in one press there would merge the two paragraphs. Bare Obsidian, its Outliner and
SilverBullet, the camp `stay` follows, delete a line break a press.

```yaml
tags: rare free-form
enterAtTextStart: stay
```

```buffer
a

┃b
```

> enter

```buffer
a


┃b
```

> deleteContentBackward

```buffer
a

┃b
```

> deleteContentBackward

```buffer
a┃b
```

## Backspace13

Mid-text backspace left to the host.

In the middle of a node's text, Backspace is the host's.

```yaml
tags: core
```

```buffer
- ab┃c
```

> deleteContentBackward

```buffer
- a┃c
```

## Backspace14

Backspace that deletes a paragraph's only character leaves an empty line, held as a placeholder, as
Delete does ([Delete9](delete.md#delete9)). When the caret leaves, the empty line goes.

```yaml
tags: edge free-form
```

```buffer
# H1

a┃

## H2
```

> deleteContentBackward

```buffer
# H1

┃◌

## H2
```

> cursorDocStart

```buffer
┃# H1

## H2
```

## Backspace15

Joining into a paragraph above a list.

A paragraph's first item joins into the paragraph, as into any node above. Bare Obsidian deletes the
marker's space, leaving `-a` as text.

```yaml
tags: common
```

```buffer
para

- ┃a
```

> deleteContentBackward

```buffer
para┃a
```

## Backspace16

No joining into a code block.

The item's text can't become code: refused.

```yaml
tags: rare markup-fence
```

````buffer
```
x
```
- ┃a
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
```
x
```
- ┃a
````

## Backspace17

Backspace on an empty first item, with nothing above it, removes the item.

The caret goes to the start of the text below. Logseq, WorkFlowy, Dynalist and RemNote remove the
item too but put the caret elsewhere; Roam ignores the key; SiYuan makes an empty paragraph of it;
bare Obsidian and its Outliner delete the marker's space.

```yaml
tags: common
```

```buffer
- ┃
- b
- c
```

> deleteContentBackward

```buffer
- ┃b
- c
```

## Backspace17b

On an empty first item with children, with nothing above it, the item goes and its children take its
place, a level up, the caret at the first child's text, as RemNote does but for the caret. Logseq,
Roam, WorkFlowy and Dynalist ignore the key here (`emptyItemWithChildren: refuse`,
[Backspace17f](#backspace17f)), as Tana and true-outliner do; SiYuan makes an empty paragraph of it.
By default ourus lets the empty item go as anywhere else (a user decision), rather than leave the
key dead.

```yaml
tags: edge
```

```buffer
- ┃
  - a
    - b
```

> deleteContentBackward

```buffer
- ┃a
  - b
```

## Backspace17c

On an empty first child with children, the item goes and its children take its place under the
parent, as in any join ([Backspace8](#backspace8)), the caret at the end of the parent's text. (The
first Backspace empties the child, held by a placeholder.) Most outliners ignore the second
Backspace; ourus joins, as in [Backspace17b](#backspace17b). All its children are lifted; Delete on
the same item instead pulls its first child up into it, the others staying its children
([Delete5b](delete.md#delete5b)): each key joins as it does anywhere, from its own side.

```yaml
tags: edge
```

```buffer
- a
  - x┃
    - b
      - c
    - d
  - e
- f
```

> deleteContentBackward

```buffer
- a
  - ┃◌
    - b
      - c
    - d
  - e
- f
```

> deleteContentBackward

```buffer
- a┃
  - b
    - c
  - d
  - e
- f
```

## Backspace17d

Backspace on an empty item with children after a sibling: the item goes, its children move under
that sibling, and the caret goes to the end of its text.

```yaml
tags: edge
```

```buffer
- x
- ┃
  - a
    - b
```

> deleteContentBackward

```buffer
- x┃
  - a
    - b
```

## Backspace17e

Backspace on the only item, empty: its marker goes, leaving an empty line to type on.

Nothing is above to join into or below to move to, so it is the marker itself that goes.

```yaml
tags: edge free-form
```

```buffer
- ┃
```

> deleteContentBackward

```buffer
┃
```

## Backspace17f

With `emptyItemWithChildren: refuse`, Backspace on an empty first item with children does nothing,
as every outliner leaves it ([Backspace17b](#backspace17b) lifts its children instead).

```yaml
tags: rare
emptyItemWithChildren: refuse
```

```buffer
- ┃
  - a
    - b
```

> deleteContentBackward

```result
rejected: has-children
```

```buffer
- ┃
  - a
    - b
```

## Backspace17g

With `emptyItemWithChildren: refuse`, an empty first child with children stays too: its children
would move up into its place ([Backspace17c](#backspace17c)).

```yaml
tags: rare
emptyItemWithChildren: refuse
```

```buffer
- a
  - ┃◌
    - b
```

> deleteContentBackward

```result
rejected: has-children
```

```buffer
- a
  - ┃◌
    - b
```

## Backspace17h

With `emptyItemWithChildren: refuse`, an empty item with children below an item still joins it: the
item above takes the children at their depth, as with `lift` ([Backspace17d](#backspace17d)).

```yaml
tags: rare
emptyItemWithChildren: refuse
```

```buffer
- x
- ┃
  - a
```

> deleteContentBackward

```buffer
- x┃
  - a
```

## Backspace18

Backspace at a heading's text start removes its marks: the title becomes a paragraph where it is.

The `#`s go as a unit, as a checkbox does; the heading's section continues the section above. Bare
Obsidian deletes the space, leaving `#Hello`, which it reads as a tag. With `headingEditing: block`
the title joins the node above instead ([Backspace18b](#backspace18b)).

```yaml
tags: common free-form markup-heading
```

```buffer
para

# ┃Hello

body
```

> deleteContentBackward

```buffer
para

┃Hello

body
```

## Backspace18b

With `headingEditing: block`, Backspace at a heading's text start joins the title into the node
above.

As outliners join any block into the one above.

```yaml
tags: rare free-form markup-heading
headingEditing: block
```

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

## Backspace18c

On a setext heading, the underline goes.

```yaml
tags: rare free-form markup-heading
```

```buffer
┃Title
===

text
```

> deleteContentBackward

```buffer
┃Title

text
```

## Backspace18d

The unwrapped title stays apart from paragraph text right above or below: a blank line keeps it a
paragraph of its own.

```yaml
tags: rare free-form markup-heading
```

```buffer
a
# ┃H1
text
```

> deleteContentBackward

```buffer
a

┃H1

text
```

## Backspace18e

A heading that is an item's text loses its marks the same way, and the item stays: the markup
nearest the caret goes first.

```yaml
tags: rare markup-heading
```

```buffer
- a
- # ┃H
```

> deleteContentBackward

```buffer
- a
- ┃H
```

## Backspace18f

With `headingEditing: block`, a setext title joins the node above and its underline goes: left in
place, the underline would make the joined paragraph a heading.

```yaml
tags: rare markup-heading
headingEditing: block
```

```buffer
para

┃Title
=====
```

> deleteContentBackward

```buffer
para┃Title
```

## Backspace18g

The item's paragraph right under its heading is set apart by a blank line when the marks go: under
the title, now paragraph text, it would continue it.

```yaml
tags: rare markup-heading
```

```buffer
- a
- # ┃H
  text
```

> deleteContentBackward

```buffer
- a
- ┃H

  text
```

## Backspace19

Inside an item, Backspace at the start of the paragraph right after its text, after a blank line,
takes back the blank line only: the paragraph's lines continue the text, as they were before
Shift-Enter at a line's start made it a paragraph ([ShiftEnter10](shift-enter.md#shiftenter10)); a
second Backspace joins them, glued. At an item's text Enter makes items, never a paragraph, so a
paragraph there is Shift-Enter's (or written so), unlike at the top level
([Backspace12](#backspace12)) or after a body paragraph, where Enter makes them (Backspace19b).
Logseq, Tine, Roam, Athens, Dynalist, RemNote, BlockNote, Obsidian's Outliner and SilverBullet take
back the line break Shift-Enter made; SiYuan joins glued.

```yaml
tags: edge free-form
```

```buffer
- a

  ┃bc
```

> deleteContentBackward

```buffer
- a
  ┃bc
```

> deleteContentBackward

```buffer
- a┃bc
```

## Backspace19b

After a body paragraph, Enter in the paragraph makes the paragraph break, so Backspace takes back
Enter's, glued, as at the top level ([Backspace12](#backspace12)).

```yaml
tags: edge free-form
```

```buffer
- a

  b┃c
```

> enter

```buffer
- a

  b

  ┃c
```

> deleteContentBackward

```buffer
- a

  b┃c
```

## Backspace20

Backspace on the empty paragraph left by Enter in the middle of a list (with `enterOnEmptyItem:
outdent`, [Enter7b](enter.md#enter7b)) goes back to the end of the node above; the items the
paragraph owned stay.

The empty paragraph owns the list after it; removing it keeps that list, which joins the list above.

```yaml
tags: edge free-form
```

```buffer
- a

┃◌

- b
```

> deleteContentBackward

```buffer
- a┃

- b
```

## Backspace21

Backspace at the start of an item after a blank line joins it to the node above, the blank line
going too, as the outliners join blocks. The text editors delete the blank line only, as a plain line
editor does.

```yaml
tags: common
```

```buffer
- a

- ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## Backspace22

A paragraph after a heading joins the heading's title, as an item does ([Backspace4](#backspace4)).
Bare Obsidian deletes the blank line instead.

```yaml
tags: common
```

```buffer
# Title

┃more
```

> deleteContentBackward

```buffer
# Title┃more
```

## Backspace23

A paragraph of more than one line doesn't join a heading's title: a title is one line.

```yaml
tags: rare free-form
```

```buffer
# Title

┃more
lines
```

> deleteContentBackward

```result
rejected: not-expressible
```

```buffer
# Title

┃more
lines
```

## Backspace24

A paragraph after a code block doesn't join it: text can't become code. The host's Backspace would
put the text on the fence's line, unmaking the block.

```yaml
tags: edge markup-fence
```

````buffer
```
x
```

┃para
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
```
x
```

┃para
````

## Backspace25

An empty item above takes a paragraph's text, as it takes an item's ([Backspace5](#backspace5)).

```yaml
tags: edge
```

```buffer
- a
- 

┃para
```

> deleteContentBackward

```buffer
- a
- ┃para
```

## Backspace26

At the start of the document's first paragraph, there is nothing to join into.

```yaml
tags: common
```

```buffer
┃para
```

> deleteContentBackward

```result
rejected: nothing-above
```

```buffer
┃para
```

## Backspace27

A paragraph after a quote joins the quote's last paragraph, as between paragraphs
([Backspace12](#backspace12)), its text after the quoted text. The host's Backspace leaves `b` a lazy line.

```yaml
tags: edge free-form
```

```buffer
> q

┃b
```

> deleteContentBackward

```buffer
> q┃b
```

## Backspace28

An empty item after a fenced code block goes, the caret going to the end of the code's last line:
after the closing fence, anything typed would stop it closing the block.

```yaml
tags: edge markup-fence
```

````buffer
```
x
```
- ┃
````

> deleteContentBackward

````buffer
```
x┃
```
````

## Backspace29

An empty ordered item goes, and the items after it are renumbered.

```yaml
tags: common
```

```buffer
1. a
2. ┃
3. c
```

> deleteContentBackward

```buffer
1. a┃
2. c
```

## Backspace30

Backspace on a new, empty child undoes Enter and Tab: the child goes, the caret back at the end of
its parent's text.

```yaml
tags: core
```

```buffer
- a
  - ┃◌
```

> deleteContentBackward

```buffer
- a┃
```

## Backspace31

A selection across two items: the selected text goes, markup included, and the two ends join.
The host's result here is the same text, but the edit crosses a marker, so it is ourus's.

```yaml
tags: common
```

```buffer
- a«bc
- de»f
- g
```

> deleteContentBackward

```buffer
- a┃f
- g
```

```result
applied
```

## Backspace32

A selection within one item's text is the host's: Backspace31's control.

```yaml
tags: common
```

```buffer
- a«bcde»f
- g
```

> deleteContentBackward

```buffer
- a┃f
- g
```

```result
notApplicable
```

## Backspace33

The document's first item has nothing above to join: its marker goes, and it is a paragraph where it
is, the items after it its list, as Shift-Tab makes them
([DirectOutdent2](outdent.md#directoutdent2)) (`backspaceAtTopItem: unwrap`, the default). Bare
Obsidian gets there in two presses, through `-a`.

```yaml
tags: common free-form
```

```buffer
- ┃a
- b
```

> deleteContentBackward

```buffer
┃a
- b
```

## Backspace34

With `backspaceAtTopItem: refuse`, the document's first item stays as it is, as in Logseq, Roam and
WorkFlowy, which do nothing at the first block.

```yaml
tags: edge
backspaceAtTopItem: refuse
```

```buffer
- ┃a
- b
```

> deleteContentBackward

```result
rejected: nothing-above
```

```buffer
- ┃a
- b
```

## Backspace35

Unwrapping a heading that has content under it: `para` and its list were `B`'s section, and a
paragraph owns none, so they become `A`'s, next to `B`. The text doesn't move; only the `##` goes.
Releasing the section is what removing a heading means, so it is a command's own neighbors changing
parent, as guarantee 4 allows. The text editors end up the same way.

```yaml
tags: edge free-form markup-heading
```

```buffer
# A

intro

## ┃B

para

- item

## C
```

> deleteContentBackward

```buffer
# A

intro

┃B

para

- item

## C
```

## Backspace36

A paragraph right under a setext heading joins its title, before the underline, as one under an
ATX heading does ([Backspace22](#backspace22)). true-outliner joins it; bare Obsidian
deletes the line break, putting the text on the underline.

```yaml
tags: edge
```

```buffer
Title
=====
┃text
```

> deleteContentBackward

```buffer
Title┃text
=====
```

## Backspace37

A paragraph of several lines joins a setext title as more of its lines, which a setext title holds
and an ATX one doesn't ([Backspace23](#backspace23)).

```yaml
tags: rare
```

```buffer
Title
=====
┃more
lines
```

> deleteContentBackward

```buffer
Title┃more
lines
=====
```

## Backspace38

Joined to `[a]:`, the text would be a link reference definition, invisible: the joined paragraph's
start is escaped.

```yaml
tags: rare free-form
```

```buffer
[a]:

┃b
```

> deleteContentBackward

```buffer
\[a]:┃b
```

## Backspace39

An empty item between an item and a paragraph goes: right under the item's text, the paragraph would
continue it, so a blank line keeps it apart.

```yaml
tags: rare
```

```buffer
- a
- ┃
p
```

> deleteContentBackward

```buffer
- a┃

p
```

## Backspace40

The first item of a paragraph's list joins the paragraph; an ordered list from 2 after it can't
interrupt the joined text, which it would continue, so a blank line sets it apart.

```yaml
tags: edge
```

```buffer
p

- ┃t
2. m
```

> deleteContentBackward

```buffer
p┃t

2. m
```

## Backspace41

The first item of a list that is an item's first block, on its marker's line (`- - a`): the item has
no text to join, so the inner marker goes, and the text, on the outer marker's line, is the outer
item's; the items after it are its children.

```yaml
tags: edge
```

```buffer
- - ┃a
  - b
```

> deleteContentBackward

```buffer
- ┃a
  - b
```

## Cmd-Backspace

`deleteSoftLineBackward` deletes back to the start of the line's text. What is left must not start a
block it didn't start before: as in [Shift-Enter](shift-enter.md), such text is escaped.

### SoftBackspace1

Cmd-Backspace deletes back to the text start, the checkbox and marker staying; at the text start it
is Backspace, whose checkbox rule takes the checkbox.

```yaml
tags: common markup-task
```

```buffer
- [ ] abc ┃def
```

> deleteSoftLineBackward

```buffer
- [ ] ┃def
```

> deleteSoftLineBackward

```buffer
- ┃def
```

### SoftBackspace2

The rest of the line would become a link reference definition at the paragraph's start, and vanish
from the text as read: it is escaped.

```yaml
tags: rare
```

```buffer
abc ┃[a]: tail
```

> deleteSoftLineBackward

```buffer
┃\[a]: tail
```

### SoftBackspace3

A setext title is paragraph text: `- x tail` at its start would be an item. It is escaped, and the
title keeps its underline.

```yaml
tags: rare markup-heading
```

```buffer
abc ┃- x tail
===
```

> deleteSoftLineBackward

```buffer
┃\- x tail
===
```

### SoftBackspace4

In an ATX heading, the closing `#`s stay, and nothing needs escaping: the title has its own marker.

```yaml
tags: rare markup-heading
```

```buffer
# abc ┃title #
```

> deleteSoftLineBackward

```buffer
# ┃title #
```

### SoftBackspace5

On a later line of a setext title, the lines above stay; what is left is escaped as on the first.

```yaml
tags: rare
```

```buffer
first
abc ┃- x
===
```

> deleteSoftLineBackward

```buffer
first
┃\- x
===
```

### SoftBackspace6

In a setext underline, Cmd-Backspace is refused: the underline is markup, not text.

```yaml
tags: rare markup-heading
```

```buffer
title
=┃==
```

> deleteSoftLineBackward

```result
rejected: not-expressible
```

```buffer
title
=┃==
```

### SoftBackspace7

Cmd-Backspace emptying the first line of a paragraph of several lines: the empty line is held by a
placeholder, as an emptied line is anywhere, here on the marker's line of a quote that is an
item's first block. Left, it goes, the line below coming up onto the marker's line, the caret
keeping its place in the text.

```yaml
tags: rare free-form
```

```buffer
- > q┃
  > m
```

> deleteSoftLineBackward

```buffer
- > ┃◌
  > m
```

> cursorLineDown

```buffer
- > ┃m
```

### SoftBackspace8

As [SoftBackspace7](#softbackspace7), in a task: the emptied first line keeps the checkbox, and
left, the line below comes up after it.

```yaml
tags: rare free-form markup-task
flavor: gfm
```

```buffer
- [ ] t┃
  m
```

> deleteSoftLineBackward

```buffer
- [ ] ┃◌
  m
```

> cursorLineDown

```buffer
- [ ] m┃
```

### SoftBackspace9

On a fence, Cmd-Backspace is refused: the fence is markup, and deleting it would unmake the code
block (the host's would leave a fence opening at the block's end). The same on a math block's `$$`.

```yaml
tags: rare markup-fence
```

````buffer
```┃
code
```
````

> deleteSoftLineBackward

```result
rejected: not-expressible
```

````buffer
```┃
code
```
````


### SoftBackspace10

With `taskEditing: text` the checkbox is text, so from right after it Cmd-Backspace deletes it, back
to where the text starts once it is text: the marker, which stays, as structure (Backspace there
deletes one character, [TaskBackspace5](tasks.md#taskbackspace5)). The text editors delete the
marker too, a line edit.

```yaml
tags: rare markup-task
taskEditing: text
```

```buffer
- [ ] ┃def
```

> deleteSoftLineBackward

```buffer
- ┃def
```

## Backspace42

With the caret inside markup, past its line's start and before the text (here between the marker
and its space), Backspace is the host's where the host shows markup as text (`markup: text`, the
default): one character goes, whatever the text then reads as, as the user editing markup by hand
means it. At the line's start it is ourus's, a join ([Backspace2](#backspace2)).

```yaml
tags: rare free-form
```

```buffer
- a
-┃ b
```

> deleteContentBackward

```result
notApplicable
```

```buffer
- a
┃ b
```

## Backspace42b

Where the host decorates markup (`markup: decorated`), Backspace there acts at the text start: `b`
joins `a`, as from `- ┃b`.

```yaml
tags: rare
markup: decorated
```

```buffer
- a
-┃ b
```

> deleteContentBackward

```buffer
- a┃b
```

## Backspace43

Backspace on the empty paragraph Enter put above the document's first paragraph takes it back, its
blank line with it, the caret at the text below, as Backspace on an empty first item goes
([Backspace17](#backspace17)); Delete there does the same.

```yaml
tags: edge free-form
```

```buffer
┃para
```

> enter

```buffer
┃◌

para
```

> deleteContentBackward

```buffer
┃para
```

## Backspace43b

The same above the document's first heading.

```yaml
tags: rare free-form
```

```buffer
# ┃Title
```

> enter deleteContentBackward

```buffer
# ┃Title
```

## Backspace43c

With `enterAtTextStart: stay`, Enter there leaves a blank line above the paragraph, the caret staying
with its text; Backspace takes it back, as the blank lines between two paragraphs go
([Backspace12](#backspace12)): at the document's start, with nothing to join, only the blank lines
go. Bare Obsidian, its Outliner and SilverBullet do the same.

```yaml
tags: rare free-form
enterAtTextStart: stay
```

```buffer
┃para
```

> enter

```buffer

┃para
```

> deleteContentBackward

```buffer
┃para
```

## Backspace44

An empty item removed from a loose list takes its gap with it, as any node's gap goes with it
([gaps.md](gaps.md)): one blank line stays between the items around it, where there was one, rather
than two.

```yaml
tags: rare
```

```buffer
- a

- ┃

- b
```

> deleteContentBackward

```buffer
- a┃

- b
```

## Backspace44b

The last item of a loose list, empty, takes the blank line above it instead, which set it off from
the item above: the gap after it ends the list, and stays. So Backspace takes back the item Enter
made at the list's end ([Enter36](enter.md#enter36)).

```yaml
tags: rare
```

```buffer
- a

- b┃
```

> enter

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

## Backspace45

A first child with children joins its parent as any node joins the node above: its text continues
the parent's, and its children come up a level into its place, before the parent's other children
(`joinWithChildren: join`, the default), as RemNote does. Logseq, Roam, WorkFlowy, Dynalist, Tana and
Obsidian's Outliner do nothing ([Backspace45b](#backspace45b)).

```yaml
tags: edge
```

```buffer
- a
  - ┃b
    - c
    - d
  - e
```

> deleteContentBackward

```buffer
- a┃b
  - c
  - d
  - e
```

## Backspace45b

With `joinWithChildren: refuse`, nothing happens, as in Logseq, Roam, WorkFlowy, Dynalist, Tana and
Obsidian's Outliner: the join would move the children up a level. A first child without children
joins either way ([Backspace3](#backspace3)).

```yaml
tags: edge
joinWithChildren: refuse
```

```buffer
- a
  - ┃b
    - c
    - d
  - e
```

> deleteContentBackward

```result
rejected: has-children
```

```buffer
- a
  - ┃b
    - c
    - d
  - e
```

## Backspace46

In the middle of the text Backspace is the host's, which deletes one character, one outside the
Basic Multilingual Plane (an emoji, two UTF-16 units) included.

```yaml
tags: rare
```

```buffer
- a😀┃b
```

> deleteContentBackward

```buffer
- a┃b
```
