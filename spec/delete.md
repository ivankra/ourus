# Delete

Command: `deleteContentForward` (Delete).

Delete at the end of a node's text works on the boundary between that node and the one below:
Backspace at that node's start ([backspace.md](backspace.md)), from the other side; in the middle of
the text it is the host's. The rules, in order; the first that applies wins:

1. **On a code line**, the next code line joins it; before a fence it is refused
   ([fences.md](fences.md)).
2. **Before an item's text, in its marker or its checkbox**, Delete is the host's where the host
   shows markup as text (`markup: text`, the default; Delete29, Delete23, Delete24, Delete25). Where
   it decorates markup (`decorated`), ourus makes the edit: the checkbox goes, as Backspace right
   after it takes it (Delete19); in the marker, the space goes and the item is a paragraph, keeping
   its children, set off by a blank line where it needs one (Delete16, Delete16d, Delete16e); the
   items after a first item become its list (Delete16f). What it can't make exactly there (before
   the marker or inside it, or where the paragraph would run into its parent's text) is refused (Delete16b, Delete16c). Inside the
   checkbox its character goes, either way ([TaskDelete4](tasks.md#taskdelete4)).
3. **On an empty item**, the item goes, the caret moving on to the node below (Delete6); a paragraph
   below joins it instead, as Backspace at its start would (Delete28); with
   children, its first child moves up into it (Delete5), or nothing happens with
   `emptyItemWithChildren: refuse` (Delete5e). An empty item below goes (Delete20).
4. **Before a heading, it loses its marks first**, as Backspace at its text start takes them: the
   title is a paragraph where it is, the caret staying, and a second Delete joins it as any
   paragraph (`headingEditing: text`, the default; Delete13, Delete13c, Delete13e, Delete13g);
   with `block`, its title joins (Delete13b, Delete13f).
   Before an item whose first block is an item on its marker's line (`- - b`), an empty item with
   children as written apart (`-` / `  - b`), it goes, as one written so does: its children become
   the item's, the caret staying (Delete33).
5. **Between paragraphs the blank lines go, and the paragraphs join, glued**, in one press: the
   paragraph below continues this one's text (Delete18, Delete18c); with `enterAtTextStart: stay`,
   one blank line a press while more than one is there (Delete18d). At an item's text, before the
   paragraph right after it, only the blank lines go, the paragraph's lines continuing the text
   (Delete18b), as Backspace takes them back.
6. **Otherwise the node below joins this one**, its children coming along (Delete1, Delete2,
   Delete7); at a setext title's end, before its underline (Delete26); escaped where the joined
   text would read as a link reference definition (Delete27). At the end of a line inside
   the text, the next line joins it (Delete3). A heading's closing `#`s stay at the end (Delete4,
   Delete4b). A first child with children joins up a level the same (`joinWithChildren: join`, the
   default; Delete31), or nothing happens (`refuse`, Delete31b).
7. **What can't be written is refused**: a quote or a code block below (Delete10, Delete11), an
   item whose first block, on its marker's line, is a quote or a table (Delete34).
8. **A selection across nodes** goes and the ends join, as with Backspace (Delete21); within one
   node's text it is the host's (Delete22).
9. **In the middle of the text**, the host's Delete (Delete8).

Bare Obsidian's Delete deletes the line break: the next item's marker becomes text of this one
(`- one┃- two`), a child's indentation too (`- abc┃  - def`). Obsidian's Outliner plugin joins as
ourus does on plain lists.

## Delete1

Joins a child into its parent.

```yaml
tags: core
```

```buffer
- abc┃
  - def
```

> deleteContentForward

```buffer
- abc┃def
```

## Delete2

Joins the next sibling.

Bare Obsidian leaves `- one┃- two`.

```yaml
tags: core
```

```buffer
- one┃
- two
```

> deleteContentForward

```buffer
- one┃two
```

## Delete3

Joins the next text line.

At the end of a line inside the text, Delete joins the next line to it: the inverse of
Shift-Enter.

```yaml
tags: common
```

```buffer
- one┃
  two
```

> deleteContentForward

```buffer
- one┃two
```

## Delete4

Joins before closing hashes.

A heading's title ends before its closing `#`s: the caret there is at the end of its text.

```yaml
tags: rare markup-heading
```

```buffer
# Title┃ #
- more
```

> deleteContentForward

```buffer
# Title┃more #
```

## Delete4b

From after the closing `#`s, Delete joins the same way, the caret going to the end of the title.

```yaml
tags: rare markup-heading
```

```buffer
# Title #┃
- more
```

> deleteContentForward

```buffer
# Title┃more #
```

## Delete5

Delete on an empty item with children: its first child moves up into it, as Delete joins the node
below into any item ([Delete1](#delete1)), that child's children coming along and the caret staying
put. Most outliners ignore the key here (`emptyItemWithChildren: refuse`, [Delete5e](#delete5e));
by default ourus joins (a user decision).

```yaml
tags: edge
```

```buffer
- ┃
  - a
    - b
  - c
- d
```

> deleteContentForward

```buffer
- ┃a
  - b
  - c
- d
```

## Delete5b

The same for a first child below the top level, reached by deleting its text.

The first Delete deletes the child's only character, which leaves it empty, held by a placeholder
(right after `a`'s text, `  - ` alone would be a setext underline). The second pulls its first
child `b` up into it; `b`'s child `c` comes along, and the empty item's other child `d` stays. So
the tree differs from Backspace's on the same item, which removes it and lifts all its children
([Backspace17c](backspace.md#backspace17c)): Delete joins the node below into the empty item, which
keeps its place and id, as Delete joins anywhere, where Backspace joins the empty item into the node
above.

```yaml
tags: edge
```

```buffer
- a
  - ┃x
    - b
      - c
    - d
  - e
- f
```

> deleteContentForward

```buffer
- a
  - ┃◌
    - b
      - c
    - d
  - e
- f
```

> deleteContentForward

```buffer
- a
  - ┃b
    - c
    - d
  - e
- f
```

## Delete5c

The same after a sibling: the first child moves up into the empty item.

```yaml
tags: edge
```

```buffer
- x
- ┃
  - a
    - b
```

> deleteContentForward

```buffer
- x
- ┃a
  - b
```

## Delete5d

On an empty item, Delete acts from anywhere after the marker, trailing spaces and all.

Only spaces follow the caret there, so it counts as the end of the item's text.

```yaml
tags: rare
```

```buffer
- ┃ 
  - a
    - b
```

> deleteContentForward

```buffer
- ┃a
  - b
```

## Delete5e

With `emptyItemWithChildren: refuse`, Delete on an empty item with children does nothing, as most
outliners leave it ([Delete5](#delete5) joins its first child up into it).

```yaml
tags: rare
emptyItemWithChildren: refuse
```

```buffer
- ┃
  - a
    - b
  - c
- d
```

> deleteContentForward

```yaml
result: rejected has-children
```

```buffer
- ┃
  - a
    - b
  - c
- d
```

## Delete5f

With `emptyItemWithChildren: refuse`, Delete on an empty item with spaces after the caret deletes
one of them, the host's: the join is refused, the space isn't structure.

```yaml
tags: rare
emptyItemWithChildren: refuse
```

```buffer
- ┃␠
  - a
    - b
```

> deleteContentForward

```buffer
- ┃
  - a
    - b
```

## Delete6

Empty item removed, caret moves on.

On an empty item, Delete removes the item, and the caret moves on to the node below.

```yaml
tags: common
```

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

## Delete7

Next sibling's children come along.

The node below can have children; they come along.

```yaml
tags: common
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

## Delete8

Mid-text delete.

```yaml
tags: core
```

```buffer
- a┃bc
```

> deleteContentForward

```buffer
- a┃c
```

## Delete9

Delete that deletes a paragraph's only character leaves an empty line, held as a placeholder, as
Backspace does ([Backspace14](backspace.md#backspace14)). When the caret leaves, the empty line
goes.

```yaml
tags: edge free-form
```

```buffer
# H1

┃a

## H2
```

> deleteContentForward

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

## Delete10

Delete at the end of a node before a quote is refused.

The quote would merge into the node's text, its `>` text, as bare Obsidian leaves it (`- a┃> q`).

```yaml
tags: rare
quotes: container
```

```buffer
- a┃
> q
```

> deleteContentForward

```yaml
result: rejected not-expressible
```

```buffer
- a┃
> q
```

## Delete11

Delete at the end of a node before indented code is refused.

```yaml
tags: rare markup-fence
```

```buffer
# H┃
    code
```

> deleteContentForward

```yaml
result: rejected not-expressible
```

```buffer
# H┃
    code
```

## Delete12

Children that move with a join are written in the document's indentation.

In a tab-indented document, `c`'s child stays tab-indented under the joined item.

```yaml
tags: rare
```

```buffer
- a
- b┃
- c
→- d
```

> deleteContentForward

```buffer
- a
- b┃c
→- d
```

## Delete13

Delete at the end of a paragraph before a heading takes the heading's `#`s, as Backspace at its text
start does ([Backspace18](backspace.md#backspace18)): the title is a paragraph where it is, and
Delete again joins it, as SiYuan does. Bare Obsidian deletes the blank line first, and the line
break then joins the `#`s as text; WorkFlowy does nothing, Dynalist joins `a` into the heading. With
`headingEditing: block`, the title joins at once ([Delete13b](#delete13b)).

```yaml
tags: edge markup-heading
```

```buffer
a┃

# H1
```

> deleteContentForward

```buffer
a┃

H1
```

> deleteContentForward

```buffer
a┃H1
```

## Delete13b

With `headingEditing: block`, Delete before a heading joins just its title.

```yaml
tags: rare markup-heading
headingEditing: block
```

```buffer
a┃

# H1
```

> deleteContentForward

```buffer
a┃H1
```

## Delete13c

Before a heading with text right under it, the peeled title is set off from that text by a blank
line: right under it, the text would continue the title's paragraph.

```yaml
tags: rare free-form markup-heading
```

```buffer
a┃

# H1
text
```

> deleteContentForward

```buffer
a┃

H1

text
```

## Delete13d

With `headingEditing: block` too, the heading's text right under it is set off by a blank line.

```yaml
tags: rare free-form markup-heading
headingEditing: block
```

```buffer
a┃

# H1
text
```

> deleteContentForward

```buffer
a┃H1

text
```

## Delete13e

Before a setext heading, the underline goes, as Backspace at the title's start takes it.

```yaml
tags: rare free-form markup-heading
```

```buffer
a┃

Title
=====
```

> deleteContentForward

```buffer
a┃

Title
```

## Delete13f

With `headingEditing: block`, before a setext heading, its title joins and the underline goes.

```yaml
tags: rare markup-heading
headingEditing: block
```

```buffer
a┃

Title
=====
```

> deleteContentForward

```buffer
a┃Title
```

## Delete13g

Before an item whose text is a heading, its `#`s go first, as before any heading: the item's text is
a paragraph, and Delete again joins the item as any item.

```yaml
tags: rare markup-heading
```

```buffer
- a┃
- # H
```

> deleteContentForward

```buffer
- a┃
- H
```

> deleteContentForward

```buffer
- a┃H
```

## Delete14

The heading's section stays where it was, after the title's paragraph, and after the join.

```yaml
tags: rare free-form markup-heading
```

```buffer
a┃

# H1

body
```

> deleteContentForward

```buffer
a┃

H1

body
```

> deleteContentForward

```buffer
a┃H1

body
```

## Delete15

After a heading the same: the heading below loses its marks, closing `#`s too, and its title then
joins the heading's.

```yaml
tags: rare markup-heading
```

```buffer
## A┃
# H1 ##
```

> deleteContentForward

```buffer
## A┃
H1
```

> deleteContentForward

```buffer
## A┃H1
```

## Delete16

Where the host decorates markup (`markup: decorated`), deleting the space after a top-level item's
marker makes the item a paragraph, keeping its children.

Without the space, `-` is no list marker: the text becomes a paragraph, `-` included. In a section,
a paragraph owns the list after it, so `b` stays under the text, now `-a`. ourus makes the edit and
checks what it reads as; where the host shows markup as text, the edit is the host's
([Delete29](#delete29)).

```yaml
tags: edge free-form
markup: decorated
```

```buffer
-┃ a
  - b
```

> deleteContentForward

```yaml
result: success
```

```buffer
-┃a
- b
```

## Delete16b

With `markup: decorated`, deleting the space after a marker inside an item is refused: `-a`
would be more of `p`'s text, and `b` would become `p`'s child.

```yaml
tags: rare free-form
markup: decorated
```

```buffer
- p
  -┃ a
    - b
```

> deleteContentForward

```yaml
result: rejected not-expressible
```

```buffer
- p
  -┃ a
    - b
```

## Delete16c

With `markup: decorated`, Delete before the marker is refused: it would take the marker itself,
and ` a` would continue `x`'s text.

```yaml
tags: rare free-form
markup: decorated
```

```buffer
- x
┃- a
```

> deleteContentForward

```yaml
result: rejected not-expressible
```

```buffer
- x
┃- a
```

## Delete16d

After another item, the paragraph the item becomes is set off by a blank line, so it doesn't
continue that item; its children become its list. Where markup is text, the host's Delete leaves
`-b` more of `a`'s text ([Delete29](#delete29)).

```yaml
tags: rare free-form
markup: decorated
```

```buffer
- a
-┃ b
  - c
```

> deleteContentForward

```buffer
- a

-┃b
- c
```

## Delete16e

A tab-indented child would be a lazy line of the paragraph: it moves to the paragraph's list column,
keeping its text and parent.

```yaml
tags: rare free-form
markup: decorated
```

```buffer
-┃ a
→- b
```

> deleteContentForward

```buffer
-┃a
- b
```

## Delete16f

A first item with items after it becomes a paragraph too, the items after it its list, as direct
outdent makes them ([DirectOutdent2](outdent.md#directoutdent2)).

```yaml
tags: rare free-form
markup: decorated
```

```buffer
-┃ a
- b
```

> deleteContentForward

```buffer
-┃a
- b
```

## Delete17

Delete at the end of a paragraph, a blank line before its list: the first item joins, the blank line
going too.

As Delete joins any node below, as the outliners join blocks. Bare Obsidian and the other text
editors delete the blank line only, one per press, as a plain line editor does.

```yaml
tags: common
```

```buffer
Shopping:┃

- milk
- eggs
```

> deleteContentForward

```buffer
Shopping:┃milk
- eggs
```

## Delete18

Delete at the end of a paragraph before another: the blank line goes, the paragraph below joins
this one, glued, and the caret stays (Backspace12's mirror, ourus's edit as there).

```yaml
tags: common
```

```buffer
a┃

b
```

> deleteContentForward

```yaml
result: success
```

```buffer
a┃b
```

## Delete18b

Inside an item, Delete before a blank line removes it, and the paragraph below continues the text
on the next line: the mirror of [Backspace19](backspace.md#backspace19).

```yaml
tags: edge
```

```buffer
- a┃

  bc
```

> deleteContentForward

```buffer
- a┃
  bc
```

## Delete18c

With several blank lines between two paragraphs, all of them go (Backspace12c's mirror).

```yaml
tags: rare
```

```buffer
a┃


b
```

> deleteContentForward

```buffer
a┃b
```

## Delete18d

With `enterAtTextStart: stay`, one blank line a press while more than one is there, as Backspace
takes them ([Backspace12e](backspace.md#backspace12e)).

```yaml
tags: rare free-form
enterAtTextStart: stay
```

```buffer
a┃


b
```

> deleteContentForward

```buffer
a┃

b
```

## Delete19

Delete right before a task's checkbox removes it, the task a plain item: the mirror of Backspace
right after it ([TaskBackspace3](tasks.md#taskbackspace3)). The host's Delete would leave `- ]
task`.

```yaml
tags: edge markup-task
markup: decorated
```

```buffer
- ┃[ ] task
```

> deleteContentForward

```buffer
- ┃task
```

## Delete20

Before an empty item, Delete removes it: the empty node below joins with nothing to add.

```yaml
tags: common
```

```buffer
- a┃
- 
- b
```

> deleteContentForward

```buffer
- a┃
- b
```

## Delete21

A selection across two items: the selected text goes, markup included, and the two ends join
(Backspace31's mirror).

```yaml
tags: common
```

```buffer
- a«bc
- de»f
- g
```

> deleteContentForward

```buffer
- a┃f
- g
```

```yaml
result: success
```

## Delete22

A selection within one item's text is the host's: Delete21's control.

```yaml
tags: common
```

```buffer
- a«bcde»f
- g
```

> deleteContentForward

```buffer
- a┃f
- g
```

```yaml
result: deferredToHost
```

## Delete23

Before the marker, Delete would take the marker itself, which ourus doesn't do: the edit is the
host's (`markup: text`, the default), and ` a` continues `x`'s text, as in a text editor. The
result says why ourus stepped aside: the marker isn't text.

```yaml
tags: rare free-form
```

```buffer
- x
┃- a
```

> deleteContentForward

```yaml
result: deferredToHost
```

```buffer
- x
┃ a
```

## Delete24

Inside an ordered marker the same: the host deletes the `.`, and the item becomes the paragraph
`1 a`.

```yaml
tags: rare free-form
```

```buffer
1┃. a
```

> deleteContentForward

```yaml
result: deferredToHost
```

```buffer
1┃ a
```

## Delete25

Inside an item, the host deletes the space after the marker: `-a` is more of `p`'s text, and `b`
becomes `p`'s child, as the text now reads.

```yaml
tags: rare free-form
```

```buffer
- p
  -┃ a
    - b
```

> deleteContentForward

```yaml
result: deferredToHost
```

```buffer
- p
  -┃a
    - b
```

## Delete26

Delete at a setext title's end joins the paragraph below the underline into the title, as Backspace
at the paragraph's start does ([Backspace36](backspace.md#backspace36)).

```yaml
tags: rare
```

```buffer
Title┃
=====
text
```

> deleteContentForward

```buffer
Title┃text
=====
```

## Delete27

Delete at the end of `[a]:` joins the item below into a link reference definition's shape: the
joined text's start is escaped, as Backspace does from the other side
([Backspace38](backspace.md#backspace38)).

```yaml
tags: rare
```

```buffer
- [a]:┃
- b
```

> deleteContentForward

```buffer
- [a]\:┃b
```

## Delete28

Delete on an empty item before a paragraph joins the paragraph into it, as Backspace at the
paragraph's start does from the other side ([Backspace5](backspace.md#backspace5)): the empty item
takes the text, the caret staying where it was. All nine apps that have paragraphs do this. Backspace
on the empty item itself is another key, and removes it ([Backspace39](backspace.md#backspace39)).

```yaml
tags: rare
```

```buffer
- a
- ┃
p
```

> deleteContentForward

```buffer
- a
- ┃p
```

## Delete29

With the caret inside markup, Delete is the host's where the host shows markup as text (`markup:
text`, the default): one character goes, here the space after the marker, and `-b` is then more of
`a`'s text, as in a text editor. Where the host decorates markup, ourus keeps the item apart
([Delete16d](#delete16d)).

```yaml
tags: rare free-form
```

```buffer
- a
-┃ b
  - c
```

> deleteContentForward

```yaml
result: deferredToHost
```

```buffer
- a
-┃b
  - c
```

## Delete30

Delete on an empty item in a loose list takes its gap too, as Backspace does
([Backspace44](backspace.md#backspace44)).

```yaml
tags: rare
```

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

## Delete31

At a parent's end, its first child with children joins it, as Backspace at the child's start does
([Backspace45](backspace.md#backspace45)): the children come up into its place (`joinWithChildren:
join`, the default), as RemNote and BlockNote do.

```yaml
tags: edge
```

```buffer
- a┃
  - b
    - c
    - d
  - e
```

> deleteContentForward

```buffer
- a┃b
  - c
  - d
  - e
```

## Delete31b

With `joinWithChildren: refuse`, nothing happens, as in Logseq, Roam, WorkFlowy, Dynalist, Tana and
Obsidian's Outliner.

```yaml
tags: edge
joinWithChildren: refuse
```

```buffer
- a┃
  - b
    - c
    - d
  - e
```

> deleteContentForward

```yaml
result: rejected has-children
```

```buffer
- a┃
  - b
    - c
    - d
  - e
```

## Delete32

At a space a placeholder holds as text, where Backspace left a deleted first character's place
([Placeholder17](placeholders.md#placeholder17)), the caret is at the text's start, and Delete
takes the space, its first character. The text, right after the marker now, is escaped, as leaving
the place escapes it: bare, `- # b` is a heading in the item. Every app but SiYuan deletes the
space and leaves `- # b`.

```yaml
tags: rare
```

```buffer
- a┃ # b
```

> deleteContentBackward

```buffer
- ┃◌ # b
```

> deleteContentForward

```buffer
- ┃\# b
```

## Delete33

Delete at the end of an item before an item whose first block is an item on its marker's line, an
empty item with children as `-` / `  - b` writes it: it goes, its children become the item's, the
caret staying, as the block outliners do with that empty item; a second Delete joins the child. The
host's would glue the markers into the text (`- a- - b`).

```yaml
tags: rare
```

```buffer
- a┃
- - b
```

> deleteContentForward

```buffer
- a┃
  - b
```

> deleteContentForward

```buffer
- a┃b
```

## Delete33b

The same empty item written apart, `-` with `  - b` under it: it goes, its children becoming the
item's, the caret staying, as Logseq, Roam, Dynalist and RemNote do (WorkFlowy too, then refusing
the second press); a second Delete joins the child.

```yaml
tags: rare
```

```buffer
- a┃
-
  - b
```

> deleteContentForward

```buffer
- a┃
  - b
```

> deleteContentForward

```buffer
- a┃b
```

## Delete34

Delete at the end of an item before an item whose first block, on its marker's line, is a quote is
refused, as before a quote (Delete10).

```yaml
tags: rare
quotes: container
```

```buffer
- a┃
- > q
```

> deleteContentForward

```yaml
result: rejected not-expressible
```
