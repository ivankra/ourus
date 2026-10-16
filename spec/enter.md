
# Enter

Command: `enter`.

Enter makes a node; whereas [`shiftEnter`](shift-enter.md) makes a line.
The rules, in order; the first that applies wins:

1. **In fenced code**, a new code line ([fences.md](fences.md)).
2. **A selection across lines** is the host's.
3. **On an empty item** first or in the middle of its list, a new empty sibling, the caret going
   into it (`enterOnEmptyItem: sibling`, the default); as the last item of its list, or with
   `enterOnEmptyItem: outdent` anywhere, a nested item outdents as Shift-Tab does, and a top-level
   one leaves the list: it becomes an empty paragraph, held by a placeholder and set off by blank
   lines. In a quote it stays in the quote. The same at every depth (Enter5, Enter6, Enter7,
   Enter7b, Enter15, Enter15b, Enter27, Enter30). On that empty paragraph Enter is refused: there is
   no second one to make (Enter40).
4. **On an empty item with children**, a new empty first child (Enter21).
5. **In an item's marker**, Enter acts at the item's text start (Enter34).
6. **At the start of a node's text**, with `enterAtTextStart: into` (the default), a new empty
   node above it, the caret going into it: an empty item above an item, an empty paragraph, held
   by a placeholder, above a paragraph or a heading (Enter26, Enter29, Enter31, Enter32, Enter33,
   Enter45, Enter46).
   With `stay`, Enter splits there as anywhere in the text, the caret staying with the text: an
   empty item above an item, a blank line above a paragraph (an empty paragraph has no Markdown),
   and above a heading's title an empty heading, the title a paragraph below (Enter26b, Enter29b,
   Enter32b, Enter33b).
7. **In the middle of an item's text**, the item splits. The text after the caret becomes the next
   sibling, which takes the item's children (`enterMidItem: sibling`, the default), or its first
   child (`child`) (Enter1, Enter3, Enter3b, Enter3c). The spaces at the split go with neither half.
8. **At the end of an item's text**, a new empty item: the first child of an item with children,
   else the next sibling, numbered on, set off by a blank line in a loose list (Enter2, Enter4,
   Enter36, Enter36b).
9. **In a paragraph**, two paragraphs, a blank line between; the second takes the paragraph's list
   (Enter12, Enter22). In a heading, the rest of the title becomes the section's first paragraph
   (Enter23, Enter41, Enter42); at a line break of a title of several lines, the break goes with
   neither half, as in a paragraph (Enter51), and the rest is set apart from text below it would run
   into (Enter52).
10. **Text after the caret that would start a block stays text**: it is escaped, a list marker
    included, in every kind of node (Enter8, Enter9, Enter10, Enter11, Enter22, Enter35, Enter41,
    Enter42); so does the text before it, where, ended there, it would read as a block: a link
    reference definition (Enter47, Enter48), a lone `-` (Enter53).
11. **In a table**, at the end of its last row a paragraph after it, set off by a blank line, as in
    GFM a line right after a table is another row (Enter49); elsewhere in a row, refused: a row is a
    line (Enter50).

Code, math and comment blocks are [fences.md](fences.md)'s.

Backspace takes an Enter back (Enter3d, Enter38, Enter39, Enter43), up to the spaces at the split
(Enter44).

Bare Obsidian's Enter is a text editor's newline with list continuation. It doesn't escape what
follows the caret (`- abc ┃- def` gives a nested item), splits a paragraph into two lines of one
paragraph, and continues a list without the blank line a loose list or a paragraph needs.

## Enter1

Splits item at the caret. The space at the split goes with neither half, as in Logseq and bare
Obsidian, and Backspace doesn't bring it back ([Enter44](#enter44) says why).

```yaml
rank: core
```

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

## Enter2

Ordered item counts on at end.

At the end of an item, Enter makes an empty sibling. Ordered items count on.

```yaml
rank: core
```

```buffer
1. one┃
```

> enter

```buffer
1. one
2. ┃
```

## Enter3

In the middle of an item with children, the rest becomes the next sibling and takes the children
(`enterMidItem: sibling`, the default), as they follow it in the text: Roam, WorkFlowy, Dynalist,
SiYuan, BlockNote and Obsidian (bare and Outliner) do this. Logseq and Tine make the rest the first
child ([Enter3b](#enter3b)).

```yaml
rank: common
```

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

## Enter3b

With `enterMidItem: child`, the rest becomes the item's first child and the item keeps its
children, as in Logseq and Tine.

```yaml
rank: edge
enterMidItem: child
```

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

## Enter3c

The sibling that takes the children is numbered on; where its number is a column wider, the
children move with its content column.

```yaml
rank: rare
```

```buffer
9. a┃ b
   - c
10. d
```

> enter

```buffer
9. a
10. ┃b
    - c
11. d
```

## Enter3d

Enter in the middle of an item with children, then Backspace: the text comes back as it was, the
children going back to the joined item.

```yaml
rank: common
```

```buffer
- a┃b
  - c
```

> enter

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

## Enter4

At the end of an item with children the new item is its first child. Empty right after the
parent's text, where `  - ` would be a setext underline, it is held by a placeholder until something
is typed. Bare Obsidian makes a sibling, which takes the children.

```yaml
rank: core
```

```buffer
- a┃
  - b
```

> enter

```buffer
- a
  - ┃◌
  - b
```

## Enter5

Enter on an empty nested item that is the last child outdents it: Enter twice ends a nested list,
as at the top level ([Enter6](#enter6)).

```yaml
rank: core
```

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

## Enter6

The last empty item of a top-level list becomes an empty paragraph, held by a placeholder. Bare
Obsidian removes the marker without the blank line, so what is typed there continues the item above
as a lazy line.

```yaml
rank: core
```

```buffer
- a
- ┃
```

> enter

```buffer
- a

┃◌
```

## Enter7

On an empty top-level item in the middle of its list, Enter makes another empty item, as in a
nested list ([Enter27](#enter27)): only the last empty item of a list leaves it (a user decision).
The block apps do the same; bare Obsidian leaves the list, which is `enterOnEmptyItem: outdent`
([Enter7b](#enter7b)).

```yaml
rank: common
```

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

## Enter7b

With `enterOnEmptyItem: outdent`, Enter on an empty item in the middle of a top-level list leaves
the list, splitting it in two.

```yaml
rank: edge
enterOnEmptyItem: outdent
```

```buffer
- a
- ┃
- b
```

> enter

```buffer
- a

┃◌

- b
```

## Enter8

Text after the caret that would start a block stays text: the new item's text is `- def`, as the
outliners keep it, written `\- def` since `- - def` would be a nested item. Bare Obsidian makes it a
nested item or a paragraph line.

```yaml
rank: common
```

```buffer
- abc ┃- def
```

> enter

```buffer
- abc
- ┃\- def
```

## Enter9

Trailing heading marker escaped.

```yaml
rank: edge
```

```buffer
- abc ┃# def
```

> enter

```buffer
- abc
- ┃\# def
```

## Enter10

HTML block tag escaped.

That includes an HTML block's opening tag, and a link reference definition.

```yaml
rank: rare
```

```buffer
- abc ┃<div>
```

> enter

```buffer
- abc
- ┃\<div>
```

## Enter11

Link reference definition escaped.

```yaml
rank: rare
```

```buffer
see ┃[a]: /url
```

> enter

```buffer
see

┃\[a]: /url
```

## Enter12

Enter in a paragraph makes two paragraphs, a blank line between them: a node is what Enter makes.
Bare Obsidian breaks the line, which is one paragraph to every reader: that is Shift-Enter's
([ShiftEnter7](shift-enter.md#shiftenter7)).

```yaml
rank: core
```

```buffer
some┃ text
```

> enter

```buffer
some

┃text
```

## Enter14

Enter repeatedly walks out of a nested list and then out of the list. The blank line keeps `p` a
paragraph; bare Obsidian leaves it right under `b`, a lazy line of `b`.

```yaml
rank: core
```

```buffer
- a
  - b┃
```

> enter enter enter "p"

```buffer
- a
  - b

p┃
```

## Enter15

In a loose list, Enter on an empty item in the middle makes another, set off as the others are
([Enter7](#enter7), [Enter36](#enter36)).

```yaml
rank: edge
```

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

## Enter15b

With `enterOnEmptyItem: outdent`, leaving a loose list in the middle needs no extra blank lines, as
in bare Obsidian.

```yaml
rank: rare
enterOnEmptyItem: outdent
```

```buffer
- a

- ┃

- b
```

> enter

```buffer
- a

┃◌

- b
```

## Enter16

A lazy continuation line is part of the item's text, so it goes with the second half, the line
break at the split going as spaces do.

```yaml
rank: edge
```

```buffer
- a┃
lazy
```

> enter

```buffer
- a
- ┃lazy
```

## Enter17

Enter copies the CRLF of the split line.

New lines take the ending of the line they split.

```yaml
rank: rare
```

```buffer
- a┃␍
- b␍
```

> enter

```buffer
- a␍
- ┃␍
- b␍
```

## Enter18

CRLF line in an LF document.

New lines take the ending of the line they split.

```yaml
rank: rare
```

```buffer
- a
- b┃␍
- c
```

> enter

```buffer
- a
- b␍
- ┃␍
- c
```

## Enter21

Enter on an empty item with children makes a new empty first child, as at the end of any item with
children ([Enter4](#enter4)). Bare Obsidian removes the marker, which leaves the children a list of
their own.

```yaml
rank: common
```

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

## Enter22

Enter before a list marker in a paragraph: the rest is a paragraph of its own, the marker escaped,
as in an item ([Enter8](#enter8)); it takes the paragraph's list, as any second half does. Bare
Obsidian makes `- x` the list's first item.

```yaml
rank: edge
```

```buffer
para ┃- x
- a
```

> enter

```buffer
para

┃\- x
- a
```

## Enter23

Enter in a heading above indented code sets the code apart.

The new paragraph needs a blank line before the code, or it takes the code in as a continuation.

```yaml
rank: rare
```

```buffer
### H┃2
    - a
```

> enter

```buffer
### H
┃2

    - a
```

## Enter25

A new item before `9.` renumbers it to `10.`, a column wider, so the item's child moves with its
content column. Bare Obsidian leaves the child at three columns, no longer `10.`'s.

```yaml
rank: rare
```

```buffer
8. z┃
9. a
   - child
10. b
```

> enter

```buffer
8. z
9. ┃
10. a
    - child
11. b
```

## Enter26

Enter at the start of a first child puts an empty item above, the caret going into it, as at any
item's start ([Enter29](#enter29)). Right after `a`'s text the empty item would be a setext
underline, so a placeholder holds it.

```yaml
rank: common
```

```buffer
- a
  - ┃b
```

> enter

```buffer
- a
  - ┃◌
  - b
```

## Enter26b

With `enterAtTextStart: stay`, the caret stays with the text, and the empty item above it, away
from the caret, is set off from the parent's text by a blank line. Bare Obsidian writes `  - ` right
under `- a`: a setext underline, `a` a heading.

```yaml
rank: edge
enterAtTextStart: stay
```

```buffer
- a
  - ┃b
```

> enter

```buffer
- a

  - 
  - ┃b
```

## Enter27

In the middle of a nested list, Enter on an empty item makes a new empty sibling, as Logseq,
WorkFlowy, Dynalist and Tine do. Roam and Obsidian's Outliner outdent it logically, the caret
jumping below `c` ([Enter30](#enter30)); bare Obsidian outdents it directly.

```yaml
rank: common
```

```buffer
- a
  - b
  - ┃
  - c
```

> enter

```buffer
- a
  - b
  - 
  - ┃
  - c
```

## Enter28

On an empty first child, another empty item goes above it, the caret going into it: right after
`a`'s text an empty item exists only under the caret. The outliners put the caret in the lower one;
only the caret differs.

```yaml
rank: edge
```

```buffer
- a
  - ┃◌
  - c
```

> enter

```buffer
- a
  - ┃◌
  - 
  - c
```

## Enter29

Enter at the start of an item's text puts an empty item above, the caret going into it
(`enterAtTextStart: into`, the default), as Logseq, Roam, WorkFlowy, Dynalist, Tine and SiYuan do.
Bare Obsidian, its Outliner and BlockNote keep the caret with the text ([Enter29b](#enter29b)).

```yaml
rank: core
```

```buffer
- a
  - b
  - ┃c
```

> enter

```buffer
- a
  - b
  - ┃
  - c
```

## Enter29b

With `enterAtTextStart: stay`, the caret stays with the text, as in bare Obsidian, its Outliner,
BlockNote and SilverBullet.

```yaml
rank: common
enterAtTextStart: stay
```

```buffer
- a
  - b
  - ┃c
```

> enter

```buffer
- a
  - b
  - 
  - ┃c
```

## Enter30

With `enterOnEmptyItem: outdent` and `outdent: logical` (Roam's way), the item outdents as Shift-Tab
would, moving past its later siblings.

```yaml
rank: edge
enterOnEmptyItem: outdent
outdent: logical
```

```buffer
- a
  - b
  - ┃
  - c
```

> enter

```buffer
- a
  - b
  - c
- ┃
```

## Enter31

Enter at the start of an item with children puts the new item above, the caret going into it. No
placeholder is needed: an empty item can start a document, or follow an item or a heading.

```yaml
rank: common
```

```buffer
- ┃a
  - b
```

> enter

```buffer
- ┃
- a
  - b
```

## Enter32

Enter at the start of a heading's text puts an empty paragraph above it, held by a placeholder, the
caret going into it; the heading and its section stay as they are, as Dynalist, Roam, SiYuan and
WorkFlowy keep a heading block. True-outliner puts an empty heading above instead.

```yaml
rank: common
```

```buffer
para

# ┃Title

body
```

> enter

```buffer
para

┃◌

# Title

body
```

## Enter32b

With `enterAtTextStart: stay`, Enter splits the heading there, as anywhere in its title: an empty
heading stays above, the title a paragraph below, under it. Bare Obsidian, the text editors, Logseq
and Tine do this.

```yaml
rank: edge
enterAtTextStart: stay
```

```buffer
# ┃H1
```

> enter

```buffer
# 
┃H1
```

## Enter33

Enter at the start of a paragraph puts an empty paragraph above it, held by a placeholder, the
caret going into it, as at an item's start ([Enter29](#enter29)). What is typed there is a
paragraph of its own; left without typing, it is a blank line again.

```yaml
rank: common
```

```buffer
intro

┃hello
```

> enter

```buffer
intro

┃◌

hello
```

> "x"

```buffer
intro

x┃

hello
```

## Enter33b

With `enterAtTextStart: stay`, Enter splits there: the empty half has no Markdown, so it is a blank
line above, the caret staying with the text. Bare Obsidian and the text editors do this. The blank
line shows nothing, and text typed after Up joins `intro` or `hello` (Up lands next to one of them).

```yaml
rank: edge
enterAtTextStart: stay
```

```buffer
┃hello
```

> enter

```buffer

┃hello
```

## Enter34

Enter with the caret in an item's marker acts at its text start ([Enter29](#enter29)). Bare
Obsidian splits the marker from the text, unmaking the item.

```yaml
rank: edge
```

```buffer
-┃ alpha
```

> enter

```buffer
- ┃
- alpha
```

## Enter35

An ordered marker after the caret stays text too, escaped before its `.`.

A backslash before a digit escapes nothing, so the escape goes before the `.` (or `)`).

```yaml
rank: rare
```

```buffer
1. abc ┃2. def
```

> enter

```buffer
1. abc
2. ┃2\. def
```

## Enter36

In a loose list, Enter sets the new item off as the others are. Bare Obsidian adds it tight.

```yaml
rank: common
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

## Enter36b

In a loose list in a quote, the blank line that sets the new item off is quoted: a bare blank line
would end the quote.

```yaml
rank: rare
```

```buffer
> - a
>
> - b┃
```

> enter

```buffer
> - a
>
> - b
>
> - ┃
```

## Enter37

Enter on an empty line at the end of an item's content, the caret at its content column: the line
becomes the item's next sibling, numbered on, as Enter on an empty nested item outdents it. With
more of the item below the line, Enter there is the host's.

```yaml
rank: rare
```

```buffer
1. a
   text
   ┃
```

> enter

```buffer
1. a
   text
2. ┃
```

## Enter38

Enter, then Backspace: the split item is joined back.

```yaml
rank: core
```

```buffer
- one┃two
- next
```

> enter

```buffer
- one
- ┃two
- next
```

> deleteContentBackward

```buffer
- one┃two
- next
```

## Enter39

Enter at the end of an item, then Backspace: the empty item goes, and the text is as it was.

```yaml
rank: common
```

```buffer
- ab┃
- c
```

> enter

```buffer
- ab
- ┃
- c
```

> deleteContentBackward

```buffer
- ab┃
- c
```

## Enter40

Enter on the empty paragraph that leaving a list made is refused: an empty paragraph exists only
under the caret, and blank lines more make no second one.

```yaml
rank: edge
```

```buffer
- a
- ┃
```

> enter

```buffer
- a

┃◌
```

> enter

```result
rejected: not-expressible
```

```buffer
- a

┃◌
```

## Enter41

A list marker after the caret stays text in a heading too: the rest is a paragraph, its `- x`
escaped. The list below needs no blank line: it is the new paragraph's either way.

```yaml
rank: edge
```

```buffer
# Title ┃- x
- y
```

> enter

```buffer
# Title
┃\- x
- y
```

## Enter42

In a setext title the same: the underline stays with the heading, and the rest, escaped, follows it.

```yaml
rank: rare
```

```buffer
title ┃- x
===
```

> enter

```buffer
title
===
┃\- x
```

## Enter43

Enter, then Backspace, where the split escaped a marker: the join drops the escape Enter wrote,
which mid-line serves nothing, and the text is as it was.

```yaml
rank: rare
```

```buffer
- abc┃- def
```

> enter

```buffer
- abc
- ┃\- def
```

> deleteContentBackward

```buffer
- abc┃- def
```

## Enter44

Enter at a space, then Backspace: the text comes back without the space, the inverse pair's stated
exception. Roam, WorkFlowy, Dynalist and Tine keep the space at the start of the new item, so their
join restores it. Markdown can't hold it there: in `-  three` the extra space is the marker's
padding, not text (the item reads `three`), and it moves the item's content column, so children
indented two spaces stop being its children. Kept as a trailing space on the first half instead, it
would be invisible, and stripped by editors that trim whitespace on save; added back by every join,
it would also go into joins of text that never had one.

```yaml
rank: edge
```

```buffer
- one two┃ three
```

> enter

```buffer
- one two
- ┃three
```

> deleteContentBackward

```buffer
- one two┃three
```

## Enter45

At the start of a heading's text right under a paragraph, the empty paragraph is set off from both:
right under `para` it would be more of `para`'s text.

```yaml
rank: edge
```

```buffer
para
# ┃Title
```

> enter

```buffer
para

┃◌

# Title
```

## Enter46

At the start of a quote's first paragraph, the empty paragraph is the quote's first, on the line its
`>` starts.

```yaml
rank: edge
```

```buffer
> ┃quote
```

> enter

```buffer
> ┃◌
>
> quote
```

## Enter47

Enter in prose that starts like a link reference definition: ended at the split, `[Note]: this`
would be one, invisible, so it is escaped and stays a paragraph. Backspace takes the split back, and
the escape with it, as a join drops the escape a split wrote ([Enter43](#enter43)).

```yaml
rank: rare
```

```buffer
[Note]: this ┃matters a lot
```

> enter

```buffer
\[Note]: this

┃matters a lot
```

> deleteContentBackward deleteContentBackward

```buffer
[Note]: this┃matters a lot
```

## Enter48

The same in an item, whose text would be a definition and the item empty. Here Backspace keeps the
escape: without the space the split dropped ([Enter44](#enter44)), `[a]: bc` would be a definition.

```yaml
rank: rare
```

```buffer
- [a]: b ┃c
```

> enter

```buffer
- \[a]: b
- ┃c
```

> deleteContentBackward

```buffer
- \[a]: b┃c
```

## Enter49

Enter at the end of a table's last row: a paragraph after the table, set off by a blank line,
since in GFM a line right after a table is another row. Bare Obsidian breaks the line, and in GFM
the text typed there is a row. Backspace on the empty paragraph takes it back.

```yaml
rank: common
flavor: gfm
```

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

> enter

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

┃◌
```

> deleteContentBackward

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

> enter "after"

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

after┃
```

## Enter50

Enter inside a table's row is refused: a row is a line, and a break in it would make two rows.

```yaml
rank: edge
flavor: gfm
```

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

> enter

```result
rejected: not-expressible
```

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

## Enter51

Enter at the start of a later line of a setext title: the lines above stay the title, over the
underline, and the rest is the section's first paragraph; the line break between goes with neither,
as in a paragraph. At a line's end, the same. Backspace joins the paragraph back glued, onto the
title's line ([Backspace36](backspace.md#backspace36)), as any join after a split at a line break
does (the README's guarantee 5).

```yaml
rank: edge
```

```buffer
one
┃two
three
---
```

> enter

```buffer
one
---
┃two
three
```

> undo

```buffer
one
┃two
three
---
```

> cursorLineBoundaryForward enter

```buffer
one
two
---
┃three
```

## Enter52

The rest of a setext title, a paragraph below its underline now, is set apart from the title of a
setext heading right below, which it would join (and so become part of that title).

```yaml
rank: edge
```

```buffer
one
┃two
---
three
---
```

> enter

```buffer
one
---
┃two

three
---
```

## Enter53

The text before the caret, ended there, would read as a block: a lone `-` is an empty list item. It
is escaped, as a link reference definition is ([Enter47](#enter47)); joined back, the escape goes,
as it has nothing left to keep ([Enter43](#enter43)).

```yaml
rank: edge
```

```buffer
-┃a
```

> enter

```buffer
\-

┃a
```

> deleteContentBackward deleteContentBackward

```buffer
-┃a
```
