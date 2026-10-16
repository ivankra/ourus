
# Delete

Command: `deleteContentForward` (Delete).

Delete at the end of a node's text works on the boundary between that node and the one below:
Backspace at that node's start ([backspace.md](backspace.md)), from the other side; in the middle of
the text it is the host's. The rules, in order; the first that applies wins:

1. **On a code line**, the next code line joins it; before a fence it is refused
   ([fences.md](fences.md)).
2. **Before a blank line, with `deleteAtGap: gap`**, the blank line goes, where the nodes stay as
   they are (Delete17b).
3. **Before an item's text, in its marker or its checkbox**: the checkbox goes, as Backspace right
   after it takes it (Delete19); in the marker, the space goes and the item is a paragraph, keeping
   its children, set off by a blank line where it needs one (Delete16, Delete16d, Delete16e); the
   items after a first item become its list (Delete16f). Of two spaces, one goes and the item stays
   (Delete16g). What ourus can't make exactly there (before the marker or inside it, or where the
   paragraph would run into its parent's text) is the host's edit (`editInMarkup: host`, the
   default; Delete23, Delete24, Delete25), or refused (`refuse`; Delete16b, Delete16c).
4. **On an empty item**, the item goes, the caret moving on to the node below (Delete6), a paragraph
   it kept apart from the text above set apart by a blank line (Delete28); with
   children, its first child moves up into it (Delete5). An empty item below goes (Delete20).
5. **Before a heading**, its whole line joins, `#`s included (`headingEditing: text`, the default;
   Delete13); with `block`, its title (Delete13b). A setext heading can't join as text: refused
   (Delete13e), its title joining under `block` (Delete13f).
6. **Between paragraphs the blank lines go**: the paragraph below is more lines of this one
   (Delete18, Delete18b, Delete18c).
7. **Otherwise the node below joins this one**, its children coming along (Delete1, Delete2,
   Delete7); at a setext title's end, before its underline (Delete26); escaped where the joined
   text would read as a link reference definition (Delete27). At the end of a line inside
   the text, the next line joins it (Delete3). A heading's closing `#`s stay at the end (Delete4,
   Delete4b).
8. **What can't be written is refused**: a quote or a code block below (Delete10, Delete11).
9. **A selection across nodes** goes and the ends join, as with Backspace (Delete21); within one
   node's text it is the host's (Delete22).
10. **In the middle of the text**, the host's Delete (Delete8).

Bare Obsidian's Delete deletes the line break: the next item's marker becomes text of this one
(`- one┃- two`), a child's indentation too (`- abc┃  - def`). Obsidian's Outliner plugin joins as
ourus does on plain lists.

## Delete1

Joins a child into its parent.

```yaml
rank: core
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
rank: core
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
rank: common
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
rank: rare
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
rank: rare
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
put. Most outliners ignore the key here; ourus joins (a user decision).

```yaml
rank: edge
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
child `b` up into it; `b`'s child `c` comes along, and the empty item's other child `d` stays.

```yaml
rank: edge
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
rank: edge
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
rank: rare
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

## Delete6

Empty item removed, caret moves on.

On an empty item, Delete removes the item, and the caret moves on to the node below.

```yaml
rank: common
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
rank: common
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
rank: core
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
rank: edge
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
rank: rare
```

```buffer
- a┃
> q
```

> deleteContentForward

```result
rejected: not-expressible
```

```buffer
- a┃
> q
```

## Delete11

Delete at the end of a node before indented code is refused.

```yaml
rank: rare
```

```buffer
# H┃
    code
```

> deleteContentForward

```result
rejected: not-expressible
```

```buffer
# H┃
    code
```

## Delete12

Children that move with a join are written in the document's indentation.

In a tab-indented document, `c`'s child stays tab-indented under the joined item.

```yaml
rank: rare
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

Delete at the end of a paragraph before a heading joins the heading's whole line, `#`s included.

Once it isn't a heading, its `#`s are text, as a text editor deleting the line break leaves them.
The blank line between goes too; bare Obsidian deletes it first, as `deleteAtGap: gap` does. With
`headingEditing: block`, only the title joins ([Delete13b](#delete13b)).

```yaml
rank: edge
```

```buffer
a┃

# H1
```

> deleteContentForward

```buffer
a┃# H1
```

## Delete13b

With `headingEditing: block`, Delete before a heading joins just its title.

```yaml
rank: rare
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

Before a heading with text right under it, the joined line is set off from that text by a blank
line: right under it, the text would continue the joined paragraph.

```yaml
rank: rare
```

```buffer
a┃

# H1
text
```

> deleteContentForward

```buffer
a┃# H1

text
```

## Delete13d

With `headingEditing: block` too, the heading's text right under it is set off by a blank line.

```yaml
rank: rare
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

Before a setext heading, Delete is refused: joined as text, its underline would make the joined
paragraph a heading.

```yaml
rank: rare
```

```buffer
a┃

Title
=====
```

> deleteContentForward

```result
rejected: not-expressible
```

```buffer
a┃

Title
=====
```

## Delete13f

With `headingEditing: block`, before a setext heading, its title joins and the underline goes.

```yaml
rank: rare
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

Before an item whose text is a heading, the item's text joins as before any heading, its `#`s as
text, and the item's marker goes.

```yaml
rank: rare
```

```buffer
- a┃
- # H
```

> deleteContentForward

```buffer
- a┃# H
```

## Delete14

The heading's section stays where it was.

```yaml
rank: rare
```

```buffer
a┃

# H1

body
```

> deleteContentForward

```buffer
a┃# H1

body
```

## Delete15

Joined into a heading, the line below becomes part of its title; closing `#`s close the merged
heading.

```yaml
rank: rare
```

```buffer
## A┃
# H1 ##
```

> deleteContentForward

```buffer
## A┃# H1 ##
```

## Delete16

Deleting the space after a top-level item's marker makes the item a paragraph, keeping its children.

Without the space, `-` is no list marker: the text becomes a paragraph, `-` included. In a section,
a paragraph owns the list after it, so `b` stays under the text, now `-a`. ourus makes the edit, as
the host would, and checks what it reads as.

```yaml
rank: edge
```

```buffer
-┃ a
  - b
```

> deleteContentForward

```result
applied
```

```buffer
-┃a
  - b
```

## Delete16b

With `editInMarkup: refuse`, deleting the space after a marker inside an item is refused: `-a`
would be more of `p`'s text, and `b` would become `p`'s child.

```yaml
rank: rare
editInMarkup: refuse
```

```buffer
- p
  -┃ a
    - b
```

> deleteContentForward

```result
rejected: not-expressible
```

```buffer
- p
  -┃ a
    - b
```

## Delete16c

With `editInMarkup: refuse`, Delete before the marker is refused: it would take the marker itself,
and ` a` would continue `x`'s text.

```yaml
rank: rare
editInMarkup: refuse
```

```buffer
- x
┃- a
```

> deleteContentForward

```result
rejected: not-expressible
```

```buffer
- x
┃- a
```

## Delete16d

After another item, the paragraph the item becomes is set off by a blank line, so it doesn't
continue that item; its children become its list.

```yaml
rank: rare
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
rank: rare
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
rank: rare
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

## Delete16g

Of two spaces after a marker, one goes, and the item stays; the caret goes to its text.

```yaml
rank: rare
```

```buffer
-┃  a
```

> deleteContentForward

```result
applied
```

```buffer
- ┃a
```

## Delete17

Delete at the end of a paragraph, a blank line before its list: the first item joins, the blank line
going too (`deleteAtGap: join`, the default).

As Delete joins any node below. Bare Obsidian deletes the blank line only, as `deleteAtGap: gap`
does ([Delete17b](#delete17b)).

```yaml
rank: common
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

## Delete17b

With `deleteAtGap: gap`, Delete before a blank line deletes it, the nodes staying as they are;
Delete again joins.

As in Obsidian, where Delete deletes one line break.

```yaml
rank: rare
deleteAtGap: gap
```

```buffer
Shopping:┃

- milk
- eggs
```

> deleteContentForward

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

Delete at the end of a paragraph before another: the blank line goes, the paragraph below is more
lines of this one, and the caret stays (Backspace12's mirror, ourus's edit as there).

```yaml
rank: common
```

```buffer
a┃

b
```

> deleteContentForward

```result
applied
```

```buffer
a┃
b
```

## Delete18b

Inside an item, Delete before a blank line removes it, and the paragraph below becomes more lines of
the text: the mirror of [Backspace19](backspace.md#backspace19).

```yaml
rank: edge
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
rank: rare
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
rank: edge
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
rank: common
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
rank: common
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

```result
applied
```

## Delete22

A selection within one item's text is the host's: Delete21's control.

```yaml
rank: common
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

```result
notApplicable
```

## Delete23

Before the marker, Delete would take the marker itself, which ourus doesn't do: the edit is the
host's (`editInMarkup: host`, the default), and ` a` continues `x`'s text, as in a text editor. The
result says why ourus stepped aside: the marker isn't text.

```yaml
rank: rare
```

```buffer
- x
┃- a
```

> deleteContentForward

```result
notApplicable
```

```buffer
- x
┃ a
```

## Delete24

Inside an ordered marker the same: the host deletes the `.`, and the item becomes the paragraph
`1 a`.

```yaml
rank: rare
```

```buffer
1┃. a
```

> deleteContentForward

```result
notApplicable
```

```buffer
1┃ a
```

## Delete25

Inside an item, the host deletes the space after the marker: `-a` is more of `p`'s text, and `b`
becomes `p`'s child, as the text now reads.

```yaml
rank: rare
```

```buffer
- p
  -┃ a
    - b
```

> deleteContentForward

```result
notApplicable
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
rank: rare
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
rank: rare
```

```buffer
- [a]:┃
- b
```

> deleteContentForward

```buffer
- \[a]:┃b
```

## Delete28

The same from Delete on the empty item ([Backspace39](backspace.md#backspace39)): the paragraph,
set apart from the item above, takes the caret.

```yaml
rank: rare
```

```buffer
- a
- ┃
p
```

> deleteContentForward

```buffer
- a

┃p
```
