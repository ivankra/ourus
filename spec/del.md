# Delete

Command: `deleteContentForward` (Delete).

Delete at the end of a node's text joins the node below to it: Backspace at that node's start,
from the other side. The node below can be a child. On an empty item, the node below moves up into
it (Delete5–6), where Backspace sends the empty item's children to the node above instead. Before a
heading, the heading's whole line joins, `#`s included (Delete13). Where the join can't be written
(a quote, indented code), it is refused. In the middle of the text, Delete is the host's; deleting
the space after a marker is the host's edit too (Delete16).

## Delete1

Joins a child into its parent.

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

A heading's title ends before its closing `#`s.

```buffer
# Title┃ #
- more
```

> deleteContentForward

```buffer
# Title┃more #
```

## Delete5

Delete on an empty item with children: its first child moves up into it.

As Delete at the end of any item joins the node below into it ([Delete1](#delete1)), the first
child's text joins the empty item, and that child's children come along; the empty item's other
children stay where they are. The caret stays put, now before the joined text.

Note: most other outliners ignore Delete here.

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

Logseq and Workflowy differ here: they remove the empty item and reparent its children under the
previous sibling, `x`. Roam and Dynalist ignore the key.

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

```buffer
- a┃bc
```

> deleteContentForward

```buffer
- a┃c
```

## Delete9

Delete that deletes a paragraph's only character leaves an empty line, held as a placeholder, as
Backspace does ([Backspace14](backspace.md#backspace14)). When the caret leaves, the empty line goes.

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

The quote would merge into the node's text.

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

Once it isn't a heading, its `#`s are text, as a text editor deleting the line break would leave
them (and as Obsidian does). The blank line between goes too. With `headingEditing: block`, only the
title joins ([Delete13b](#delete13b)).

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

```config
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

## Delete14

The heading's section stays where it was.

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
a paragraph owns the list after it, so `b` stays under the text, now `-a`. The deletion is the
host's; nested, the same edit would merge the item into its parent, which the guard is to refuse
([zzz-redesign.md](zzz-redesign.md)).

```buffer
-┃ a
  - b
```

> deleteContentForward

```buffer
-┃a
  - b
```
