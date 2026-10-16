
# Backspace

Command: `deleteContentBackward` (Backspace).

Backspace at the start of a node's text works on the boundary between that node and the one above;
in the middle of the text it is the host's. The caret counts as at the start anywhere before the
text on its line, a marker included (Backspace2). The rules, in order; the first that applies wins:

1. **On a code line**, the line joins the code line above; against a fence it is refused
   ([fences.md](fences.md)).
2. **After a blank line, with `deleteAtGap: gap`**, the blank line goes, where the nodes stay as
   they are (Backspace21b).
3. **The markup in front of the text goes first, as a unit**, an item's marker aside: a heading's
   `#`s or its setext underline (`headingEditing: text`, the default; Backspace18, Backspace18e), a
   task's checkbox (`taskEditing: checkbox`, the default; [tasks.md](tasks.md)), a callout's
   `[!type]` ([quotes.md](quotes.md)).
4. **An empty item goes**, the caret to the end of the text above (Backspace7). Its children go to
   the node above, into its place when that node is its parent (Backspace17c, Backspace17d); with
   nothing above, they take its place (Backspace17b). The first item of the document goes, the caret
   to the text below (Backspace17); the only one leaves an empty line (Backspace17e).
5. **Between paragraphs the blank lines go**: the paragraph is more lines of the one above
   (Backspace12, Backspace12c, Backspace19, Backspace27). A second Backspace joins the lines
   (Backspace9).
6. **Otherwise the node joins the node above in its container**: its text at the end of that node's
   text, its children to that node, into its place when it is the parent (Backspace1, Backspace3,
   Backspace8, Backspace11, Backspace15, Backspace22). At the start of a continuation line, the line
   joins the line above (Backspace9).
7. **With nothing above it in its container, the next layer of markup goes**: an item's marker, the
   item becoming a paragraph where it is (`backspaceAtTopItem: unwrap`, the default; Backspace33),
   or nothing (`refuse`, Backspace34); a quote's `>`, the node leaving the quote, the rest of which
   stays quoted ([quotes.md](quotes.md)). So `> - [ ] ┃b` loses its checkbox, then its marker, then
   its `>`, and then joins the node above.
8. **What can't be written is refused**: text into code (Backspace16, Backspace24) or a table, more
   than one line into a heading's title (Backspace23); with nothing above, `nothing-above`
   (Backspace26).
9. **A selection across nodes** is ourus's too: the selected text goes and the two ends join, as
   Backspace at the second end's start would join them (Backspace31). Within one node's text it is
   the host's (Backspace32).
10. **In the middle of the text**, the host's Backspace (Backspace13).

Cmd-Backspace (`deleteSoftLineBackward`) deletes back to the start of the text on the caret's line,
never into a marker, a checkbox or `#`s; what is left there is escaped where it would start a block,
and a setext underline is refused ([below](#cmd-backspace)). At the text start it is Backspace.

Delete mirrors these from the other side ([del.md](del.md)). Bare Obsidian's Backspace is a text
editor's: at an item's text start it deletes the space after the marker, and `-two` then reads as
more text of the item above (a lazy line): the item is gone, merged into its neighbour's text
without saying so. Obsidian's Outliner plugin joins as ourus does on plain lists.

## Backspace1

Joins text to the item above.

Bare Obsidian deletes the space after the marker instead: `-two` is a lazy line of `one`.

```yaml
rank: core
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
rank: edge
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
rank: core
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
rank: rare
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
rank: common
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
rank: core
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
rank: common
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
rank: common
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
rank: common
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
rank: common
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

After a blank line, a paragraph becomes a line of the paragraph above.

Between paragraphs the blank line goes, and the two paragraphs are one, `b` its second line, as in
Obsidian. ourus makes the edit itself: a blank line between nodes is a boundary, not the host's. A
second Backspace joins the lines ([Backspace9](#backspace9)).

```yaml
rank: common
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
a
┃b
```

## Backspace12b

Enter in a paragraph, then Backspace twice: the text is as it was. The blank line goes first, then
the line break: Enter's inverse is two Backspaces here.

```yaml
rank: common
```

```buffer
a┃b
```

> enter

```buffer
a

┃b
```

> deleteContentBackward deleteContentBackward

```buffer
a┃b
```

## Backspace12c

With several blank lines between two paragraphs, all of them go: deleting only one would leave the
paragraphs apart, the key seeming to do nothing (`deleteAtGap: gap` deletes one at a time).

```yaml
rank: rare
```

```buffer
a

┃b
- x
```

> deleteContentBackward

```buffer
a
┃b
- x
```

## Backspace13

Mid-text backspace left to the host.

In the middle of a node's text, Backspace is the host's.

```yaml
rank: core
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
Delete does ([Delete9](del.md#delete9)). When the caret leaves, the empty line goes.

```yaml
rank: edge
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
rank: common
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
rank: rare
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

The caret goes to the start of the text below. Logseq, WorkFlowy and Dynalist remove the item too
but put the caret elsewhere; Roam and BlockNote ignore the key.

```yaml
rank: common
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
place, a level up, the caret at the first child's text. Every outliner ignores the key here; ourus
lets the empty item go as anywhere else (a user decision), rather than leave the key dead.

```yaml
rank: edge
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
Backspace; ourus joins, as in [Backspace17b](#backspace17b).

```yaml
rank: edge
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
rank: edge
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
rank: edge
```

```buffer
- ┃
```

> deleteContentBackward

```buffer
┃
```

## Backspace18

Backspace at a heading's text start removes its marks: the title becomes a paragraph where it is.

The `#`s go as a unit, as a checkbox does; the heading's section continues the section above. Bare
Obsidian deletes the space, leaving `#Hello`, which it reads as a tag. With `headingEditing: block`
the title joins the node above instead ([Backspace18b](#backspace18b)).

```yaml
rank: common
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
rank: rare
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
rank: rare
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
rank: rare
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
rank: rare
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
rank: rare
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

## Backspace19

Inside an item, Backspace at the start of a paragraph after a blank line removes the blank line, as
between top-level paragraphs ([Backspace12](#backspace12)): the inverse of Shift-Enter at a line's
start ([ShiftEnter10](shift-enter.md#shiftenter10)).

```yaml
rank: edge
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

## Backspace20

Backspace on the empty paragraph left by Enter in the middle of a list (with `enterOnEmptyItem:
outdent`, [Enter7b](enter.md#enter7b)) goes back to the end of the node above; the items the
paragraph owned stay.

The empty paragraph owns the list after it; removing it keeps that list, which joins the list above.

```yaml
rank: edge
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
going too (`deleteAtGap: join`, the default).

With `deleteAtGap: gap` only the blank line goes ([Backspace21b](#backspace21b)).

```yaml
rank: common
```

```buffer
- a

- ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## Backspace21b

With `deleteAtGap: gap`, Backspace after a blank line deletes it, the nodes staying as they are;
Backspace again joins.

```yaml
rank: rare
deleteAtGap: gap
```

```buffer
- a

- ┃b
```

> deleteContentBackward

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
Bare Obsidian deletes the blank line instead, as `deleteAtGap: gap` does.

```yaml
rank: common
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
rank: rare
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
rank: edge
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
rank: edge
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
rank: common
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

A paragraph after a quote becomes more lines of the quote's last paragraph, as between paragraphs
([Backspace12](#backspace12)), written with its `>`. The host's Backspace leaves `b` a lazy line.

```yaml
rank: edge
```

```buffer
> q

┃b
```

> deleteContentBackward

```buffer
> q
> ┃b
```

## Backspace28

An empty item after a fenced code block goes, the caret going to the end of the code's last line:
after the closing fence, anything typed would stop it closing the block.

```yaml
rank: edge
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
rank: common
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
rank: core
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
rank: common
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
rank: common
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
rank: common
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
rank: edge
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
rank: edge
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

## Cmd-Backspace

`deleteSoftLineBackward` deletes back to the start of the line's text. What is left must not start a
block it didn't start before: as in [Shift-Enter](shift-enter.md), such text is escaped.

### SoftBackspace1

Cmd-Backspace deletes back to the text start, the checkbox and marker staying; at the text start it
is Backspace, whose checkbox rule takes the checkbox.

```yaml
rank: common
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
rank: rare
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
rank: rare
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
rank: rare
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
rank: rare
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
rank: rare
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
