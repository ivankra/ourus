# Enter

Command: `enter`.

Enter makes a node; whereas [`shiftEnter`](shift-enter.md) makes a line.
The rules, in order; the first that applies wins:

1. **In fenced code**, a new code line ([fences.md](fences.md)).
2. **A selection across lines goes first**, as Backspace deletes it, and Enter splits at the caret
   that leaves, as one edit (Enter56, Enter56b).
3. **On an empty item** without children, first or in the middle of its list, a new empty sibling,
   the caret in the lower of the two (`enterOnEmptyItem: sibling`, the default; right under its
   parent's text a blank line sets the upper one off, Enter28); as the last item of its list, or with
   `enterOnEmptyItem: outdent` anywhere, a nested item outdents as Shift-Tab does, and a top-level
   one leaves the list: it becomes an empty paragraph, held by a placeholder and set off by blank
   lines. With `exit`, a top-level one leaves the list and a nested one gets a sibling (Enter63,
   Enter63b). With `unwrap` (SiYuan, BlockNote), first or in the middle of its list it becomes an
   empty paragraph where it is, at any depth, its list split there (Enter7c, Enter27b). In a quote it
   stays in the quote. The same at every depth (Enter5, Enter6, Enter7, Enter7b, Enter15, Enter15b,
   Enter27, Enter30). On that empty paragraph Enter is refused: there is no second one to make
   (Enter40).
4. **On an empty item with children**, a new empty first child (Enter21); with `enterOnEmptyItem:
   unwrap`, an empty paragraph, its children its list (Enter21b).
5. **In markup before a node's text**, an item's marker, a task's checkbox or a heading's `#`s,
   Enter acts at the node's text start (Enter34, Enter54, Enter54b, Enter55, Enter55b); with
   `enterAtTextStart: stay`, at a heading's line start, before its `#`s, it opens a line above, the
   heading whole, as at a paragraph's start (Enter55c).
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
   child (`child`) (Enter1, Enter3, Enter3b, Enter3c). An item whose text is an ATX heading splits
   so too, the heading staying with the first half, the rest a plain item (Enter69); with
   `quirkEnterMidHeading: workflowy`, the first half a plain item, the heading going with the rest
   and its children ([Quirk1](quirks.md#quirk1)); at its end Enter makes an empty item (Enter69d). The spaces at the
   caret go from both halves (`enterSplitSpace: trim`, the default), only those after it (`drop`),
   or they start the second half (`start`): an item's padding past the space after its marker, a
   paragraph's or a title's rest's indentation, which ourus keeps as the user's whitespace and a
   join gives back (Enter44, Enter64, Enter65, Enter65b, Enter65c, Enter65d, Enter65e, Enter65f,
   Enter65g, Enter65h, Enter65i, Enter65j, Enter65k, Enter65l, Enter65m).
8. **At the end of an item's text**, a new empty item: the first child of an item with children,
   else the next sibling, numbered on, set off by a blank line in a loose list (Enter2, Enter4,
   Enter36, Enter36b).
9. **In a paragraph**, two paragraphs, a blank line between; the second takes the paragraph's list
   (Enter12, Enter22). In a heading, the rest of the title becomes the section's first paragraph
   (Enter23, Enter41, Enter42), its closing `#`s staying on its line (Enter61); with
   `quirkEnterMidHeading: workflowy`, the text before the caret is a paragraph above the heading,
   which keeps the rest and its section ([Quirk1b](quirks.md#quirk1b)); at a line break of a title of several lines, the
   break goes with neither half, as in a paragraph (Enter51), and the rest is set apart from text
   below it would run into (Enter52).
10. **Text after the caret that would start a block stays text**: it is escaped, a list marker
    included, in every kind of node (Enter8, Enter9, Enter10, Enter11, Enter22, Enter35, Enter41,
    Enter42); so does the text before it, where, ended there, it would read as a block: a link
    reference definition (Enter47, Enter48), a lone `-` (Enter53). The escape stays when typing
    before it makes it unneeded (Enter62).
11. **In a table**, at the end of its last row a paragraph after it, set off by a blank line, as in
    GFM a line right after a table is another row (Enter49); elsewhere in a row, refused: a row is a
    line (Enter50). At the end of a footnote definition, whose next line would continue its text,
    and of a thematic break, the same: a paragraph after it (Enter66, Enter67). Where the block is an
    item's text, a new item, as after code (Enter70).

Code, math and comment blocks are [fences.md](fences.md)'s.

Backspace takes an Enter back (Enter3d, Enter38, Enter39, Enter43), but for the spaces the split
trimmed (Enter44).

Bare Obsidian's Enter is a text editor's newline with list continuation. It doesn't escape what
follows the caret (`- abc ┃- def` gives a nested item), splits a paragraph into two lines of one
paragraph, and continues a list without the blank line a loose list or a paragraph needs.

## Enter1

Splits item at the caret. The space at the split goes with neither half, as in Logseq, and Backspace
doesn't bring it back ([Enter44](#enter44)).

```yaml
tags: core
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
tags: core
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
tags: common
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
tags: edge
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
tags: rare
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
tags: common
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
tags: core
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
tags: core
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
tags: core free-form
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
Logseq, WorkFlowy, Dynalist and Tana do the same; bare Obsidian leaves the list, which is
`enterOnEmptyItem: outdent` ([Enter7b](#enter7b)), and SiYuan, BlockNote and RemNote without
bullets make the item a paragraph (`unwrap` for SiYuan and BlockNote, [Enter7c](#enter7c); `exit` for
RemNote, [Enter63](#enter63)).

```yaml
tags: common
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
tags: edge free-form
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

## Enter7c

With `enterOnEmptyItem: unwrap` (SiYuan, BlockNote, as a word processor), the empty item becomes an
empty paragraph where it is, the list split there: the items after it a list after it.

```yaml
tags: edge
enterOnEmptyItem: unwrap
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
tags: common
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
tags: edge
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
tags: rare
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
tags: rare
```

```buffer
see ┃[a]: /url
```

> enter

```buffer
see

┃[a]\: /url
```

## Enter12

Enter in a paragraph makes two paragraphs, a blank line between them: a node is what Enter makes.
Bare Obsidian breaks the line, which is one paragraph to every reader: that is Shift-Enter's
([ShiftEnter7](shift-enter.md#shiftenter7)).

```yaml
tags: core
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
tags: core free-form
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
tags: edge
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
tags: rare free-form
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
tags: edge
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
tags: rare
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
tags: rare
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
children ([Enter4](#enter4)), as Logseq, Roam, WorkFlowy, Dynalist, Tana and RemNote do. Bare
Obsidian and its Outliner remove the marker, which leaves the children a list of their own; SiYuan
makes the item an empty paragraph that owns them.

```yaml
tags: common
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

## Enter21b

With `enterOnEmptyItem: unwrap`, an empty item with children becomes an empty paragraph too, its
children its list.

```yaml
tags: edge
enterOnEmptyItem: unwrap
```

```buffer
- ┃
  - a
```

> enter

```buffer
┃◌
- a
```

## Enter22

Enter before a list marker in a paragraph: the rest is a paragraph of its own, the marker escaped,
as in an item ([Enter8](#enter8)); it takes the paragraph's list, as any second half does. Bare
Obsidian makes `- x` the list's first item.

```yaml
tags: edge
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
tags: rare
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
content column, as bare Obsidian moves it; SilverBullet leaves it at three columns, no longer
`10.`'s, and Obsidian's Outliner numbers the list from 1.

```yaml
tags: rare
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
tags: common
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
tags: edge
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
WorkFlowy, Dynalist, Tana and RemNote do. Roam and Obsidian's Outliner outdent it logically, the
caret jumping below `c` ([Enter30](#enter30)); SiYuan and BlockNote make it a paragraph in the
parent ([Enter27b](#enter27b)).

```yaml
tags: common
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

## Enter27b

With `enterOnEmptyItem: unwrap`, nested: an empty paragraph in the parent item, where the empty item
was, the list split there.

```yaml
tags: edge
enterOnEmptyItem: unwrap
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

  ┃◌

  - c
```

## Enter28

On an empty first child, another empty item goes above it and the caret stays in the lower one, as
Logseq, WorkFlowy, Dynalist, Tana and RemNote do; Enter again piles another above it. Right under
`a`'s text a bare `-` would underline it into a heading, so the blank line that holds the upper one
is written at once, as leaving it would write it ([Placeholder1](placeholders.md#placeholder1)).

```yaml
tags: edge
```

```buffer
- a
  - ┃◌
  - c
```

> enter

```buffer
- a

  - 
  - ┃
  - c
```

> enter

```buffer
- a

  - 
  - 
  - ┃
  - c
```

## Enter29

Enter at the start of an item's text puts an empty item above, the caret going into it
(`enterAtTextStart: into`, the default), as Logseq, Roam, WorkFlowy, Dynalist, Tana and SiYuan do.
Bare Obsidian, its Outliner and RemNote keep the caret with the text ([Enter29b](#enter29b)).

```yaml
tags: core
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
RemNote and BlockNote.

```yaml
tags: common
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
tags: edge
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
tags: common
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
caret going into it; the heading and its section stay as they are, as WorkFlowy, Dynalist and Tana
do with a heading block. SiYuan puts the empty block above but keeps the caret in the heading;
true-outliner puts an empty heading above instead.

```yaml
tags: common markup-heading
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
tags: edge markup-heading
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
tags: common
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
tags: edge
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
tags: edge
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
tags: rare
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
tags: common
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
tags: rare
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

> deleteContentBackward

```buffer
> - a
>
> - b┃
```

## Enter37

Enter on an empty line at the end of an item's content, the caret at its content column: the line
becomes the item's next sibling, numbered on, as Enter on an empty nested item outdents it. With
more of the item below the line, Enter there is the host's.

```yaml
tags: rare
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
tags: core
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
tags: common
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
tags: edge free-form
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

```yaml
result: rejected not-expressible
```

```buffer
- a

┃◌
```

## Enter41

A list marker after the caret stays text in a heading too: the rest is a paragraph, its `- x`
escaped. The list below needs no blank line: it is the new paragraph's either way.

```yaml
tags: edge free-form
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
tags: rare
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
tags: rare
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

Enter at a space, then Backspace: the space goes from both halves (`enterSplitSpace: trim`, the
default), as Logseq trims a block's text, and the join glues `twothree`, the one place a command
loses what the user wrote. Bare Obsidian and RemNote drop only the spaces after the caret (`drop`,
[Enter64](#enter64)). Roam, WorkFlowy, Dynalist, Tana and Obsidian's Outliner keep the space at the
start of the new block, and their join gives it back (`start`, [Enter65](#enter65)): ourus writes it
as the new item's padding, which Markdown reads as the item `three`, and reads an item's padding past
the item above's as text.

```yaml
tags: edge
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

## Enter64

With `enterSplitSpace: drop`, as bare Obsidian and RemNote: the spaces after the caret go, those
before it end the first half (where they render as nothing), and the join gives back those alone.

```yaml
tags: edge
enterSplitSpace: drop
```

```buffer
- one two ┃ three
```

> enter

```buffer
- one two 
- ┃three
```

> deleteContentBackward

```buffer
- one two ┃three
```

## Enter65

With `enterSplitSpace: start`, as Roam, WorkFlowy, Dynalist, Tana and Obsidian's Outliner keep the
space in the new block: the spaces after the caret start the second half, the caret before them,
and Backspace gives the text back as it was. They are the new item's padding (`-  three`), which
Markdown reads as the item `three`; ourus keeps an item's padding past the space after its marker as
the user's whitespace, which a join gives back.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃ three
- next
```

> deleteContentBackward

```buffer
- one two┃ three
- next
```

## Enter65b

The same with the caret leaving the line and coming back before Backspace: the space is still the
second half's, and the join gives it back.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃ three
- next
```

> cursorLineDown cursorLineUp deleteContentBackward

```buffer
- one two┃ three
- next
```

## Enter65c

Typed at the second half's start, before the space it keeps, text goes in front of it, as in a
block whose text starts with the space.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
```

> enter

```buffer
- one two
- ┃ three
```

> "x"

```buffer
- one two
- x┃ three
```

## Enter65d

Delete there takes the space, the host's.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
```

> enter

```buffer
- one two
- ┃ three
```

> deleteContentForward

```yaml
result: deferredToHost
```

```buffer
- one two
- ┃three
```

## Enter65e

An item with children: the padding moves its text a column right, and its children move with it,
so they stay its children (`-  three` over `   - c`); Backspace gives the text back, the children
with it.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
  - c
```

> enter

```buffer
- one two
- ┃ three
   - c
```

> deleteContentBackward

```buffer
- one two┃ three
  - c
```

## Enter65f

Leaving the line keeps it there, as the outliners keep it in the block: the item's padding, its
children a column further right.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
  - c
```

> enter

```buffer
- one two
- ┃ three
   - c
```

> cursorLineDown

```buffer
- one two
-  three
   - ┃c
```

## Enter65g

A task's second half keeps the space after its checkbox, and the join gives it back.

```yaml
tags: edge markup-task
enterSplitSpace: start
```

```buffer
- [ ] one two┃ three
```

> enter

```buffer
- [ ] one two
- [ ] ┃ three
```

> deleteContentBackward

```buffer
- [ ] one two┃ three
```

## Enter65h

Indent keeps the space, the item's padding past its parent's, and Backspace at the child's start
joins it back.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃ three
- next
```

> indent

```buffer
- one two
  - ┃ three
- next
```

> deleteContentBackward

```buffer
- one two┃ three
- next
```

## Enter65i

A paragraph's second half keeps the space as its leading space, which Markdown strips and ourus
reads as text, so Backspace gives it back, as SiYuan and BlockNote keep it in the new block.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
one two┃ three
```

> enter

```buffer
one two

┃ three
```

> deleteContentBackward

```buffer
one two┃ three
```

## Enter65j

Padding written by hand past the space after a marker is the user's whitespace too, whatever
`enterSplitSpace` says: Backspace past it deletes a space, and at its start joins it in.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- a
-   ┃b
```

> deleteContentBackward

```yaml
result: deferredToHost
```

```buffer
- a
-  ┃b
```

> cursorCharLeft

```buffer
- a
- ┃ b
```

> deleteContentBackward

```buffer
- a┃ b
```

## Enter65k

Shift-Enter on the kept space breaks the line after the marker, as at any item's text start
(ShiftEnter13), the space going with the text onto the new line, its leading space there:
Backspace takes the break back, the space with it.

```yaml
tags: edge
enterSplitSpace: start
```

```buffer
- one two┃ three
```

> enter

```buffer
- one two
- ┃ three
```

> shiftEnter

```buffer
- one two
-
  ┃ three
```

> deleteContentBackward

```buffer
- one two
- ┃ three
```

## Enter65l

A heading's title: the rest, the section's first paragraph now, keeps the space as its leading
space, and Backspace joins it back into the title, as SiYuan, BlockNote, Tana and Dynalist keep it.

```yaml
tags: edge markup-heading
enterSplitSpace: start
```

```buffer
# one two┃ three
```

> enter

```buffer
# one two
┃ three
```

> deleteContentBackward

```buffer
# one two┃ three
```

## Enter65m

A list marker after the kept space is escaped there, as at any new paragraph's start, and the join
drops the escape.

```yaml
tags: edge markup-heading
enterSplitSpace: start
```

```buffer
# one two┃ - x
```

> enter

```buffer
# one two
┃ \- x
```

> deleteContentBackward

```buffer
# one two┃ - x
```

## Enter45

At the start of a heading's text right under a paragraph, the empty paragraph is set off from both:
right under `para` it would be more of `para`'s text.

```yaml
tags: edge markup-heading
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
tags: edge
quotes: container
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
tags: rare
```

```buffer
[Note]: this ┃matters a lot
```

> enter

```buffer
[Note]\: this

┃matters a lot
```

> deleteContentBackward

```buffer
[Note]: this┃matters a lot
```

## Enter48

The same in an item, whose text would be a definition and the item empty. Here Backspace keeps the
escape: without the space the split dropped ([Enter44](#enter44)), `[a]: bc` would be a definition.

```yaml
tags: rare
```

```buffer
- [a]: b ┃c
```

> enter

```buffer
- [a]\: b
- ┃c
```

> deleteContentBackward

```buffer
- [a]\: b┃c
```

## Enter49

Enter at the end of a table's last row: a paragraph after the table, set off by a blank line,
since in GFM a line right after a table is another row. Bare Obsidian breaks the line, and in GFM
the text typed there is a row. Backspace on the empty paragraph takes it back.

```yaml
tags: common
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
tags: edge free-form
flavor: gfm
```

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

> enter

```yaml
result: rejected not-expressible
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
does (the README's guarantee 5); undo gives the line break back.

```yaml
tags: edge
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

> deleteContentBackward

```buffer
one┃two
three
---
```

> undo undo

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
tags: edge
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
tags: edge
```

```buffer
-┃a
```

> enter

```buffer
\-

┃a
```

> deleteContentBackward

```buffer
-┃a
```

## Enter54

Enter with the caret inside a task's checkbox acts at its text start, as in the item's marker
([Enter34](#enter34)): a new task above, the caret going into it. Split there, the checkbox would
be text on two lines, and the task none.

```yaml
tags: edge markup-task
```

```buffer
- [ ┃] task
```

> enter

```buffer
- [ ] ┃
- [ ] task
```

## Enter54b

The same in a checked task's checkbox: the new task above is unchecked, as any new task.

```yaml
tags: rare markup-task
```

```buffer
- [x┃] done
```

> enter

```buffer
- [ ] ┃
- [x] done
```

## Enter55

Enter with the caret in a heading's `#`s acts at its title's start ([Enter32](#enter32)): an empty
paragraph above, held by a placeholder. A line break there would leave the caret in the `#`s, where
Backspace then unwraps the heading.

```yaml
tags: edge markup-heading
```

```buffer
#┃ Title
```

> enter

```buffer
┃◌

# Title
```

## Enter55b

The same before the `#`s, at the line's start, where Home's second press puts the caret: after a
paragraph and its blank line, the empty paragraph goes between them, rather than a third blank line.

```yaml
tags: edge markup-heading
```

```buffer
p

┃# Title
```

> enter

```buffer
p

┃◌

# Title
```

## Enter55c

With `enterAtTextStart: stay`, at a heading's line start, before its `#`s, Enter opens a blank line
above it, the heading whole, as at a paragraph's start: there the caret is at the line's start, not
in the title, and a split would make the title a paragraph. The caret goes to the title's start,
where typing keeps the heading one (before the `#`s it wouldn't). Bare Obsidian, Live Preview,
Outliner and SilverBullet open the line too, at the document's start and under a paragraph as well,
their caret staying before the `#`s; at the title's text start they split it, as ourus does
([Enter45](#enter45)).

```yaml
tags: rare free-form markup-heading
enterAtTextStart: stay
```

```buffer
p

┃# Title
```

> enter

```buffer
p


# ┃Title
```

## Enter56

Enter over a selection across nodes deletes it first, as Backspace does
([Backspace31](backspace.md#backspace31)), and splits at the caret that leaves. Left to the host,
the line break would replace the selection, the second item's marker with it, and `f` would be more
of `a`'s text.

```yaml
tags: rare
```

```buffer
- a«bc
- de»f
```

> enter

```buffer
- a
- ┃f
```

## Enter56b

The same over a paragraph's line break: the selected text goes, and the paragraph splits in two,
where the host's line break would leave one paragraph of two lines.

```yaml
tags: rare
```

```buffer
a«b
c»d
```

> enter

```buffer
a

┃d
```

## Enter57

The same for Enter's first half on a continuation line ([ShiftEnter28](shift-enter.md#shiftenter28)):
a lone `#` left at the end of the paragraph would be an empty heading, so it is escaped.

```yaml
tags: rare
```

```buffer
p
#┃a
```

> enter

```buffer
p
\#

┃a
```

## Enter58

An item whose text is a no-break space isn't empty: Enter at its end makes a new item, as after any
text, where on an empty last item it would leave the list. To Markdown U+00A0 is text.

```yaml
tags: rare
```

```buffer
- a
- ⍽┃
```

> enter

```buffer
- a
- ⍽
- ┃
```

## Enter59

Enter over a selection from a paragraph's text start deletes it first, as over any selection
([Enter56](#enter56)), and then acts at the text start: an empty paragraph above, held by a
placeholder ([Enter32](#enter32)). Split there, the first half would be an empty paragraph no text
can hold.

```yaml
tags: rare
```

```buffer
«ab»cd
```

> enter

```buffer
┃◌

cd
```

## Enter60

A setext title split before text that would start a block, and joined back: Backspace drops the
escape the split wrote, which mid-line keeps nothing from reading as a block, as a paragraph's join
does ([Enter43](#enter43)).

```yaml
tags: rare markup-heading
```

```buffer
title┃ - x
===
```

> enter

```buffer
title
===
┃\- x
```

> deleteContentBackward

```buffer
title┃- x
===
```

## Enter60b

The same in an ATX heading.

```yaml
tags: rare markup-heading
```

```buffer
# title┃ - x
```

> enter deleteContentBackward

```buffer
# title┃- x
```

## Enter61

A heading's closing `#`s are its line's markup: split, they stay on the title's line, and the rest of
the title becomes the section's paragraph without them. Backspace joins it back before them, as
[Backspace4](backspace.md#backspace4) joins any line there.

```yaml
tags: rare markup-heading
```

```buffer
# Title┃more #
```

> enter

```buffer
# Title #
┃more
```

> deleteContentBackward

```buffer
# Title┃more #
```

## Enter62

The escape a split writes stays when typing before it makes it unneeded: typing is the host's, and
ourus doesn't keep which escapes it wrote. Logseq and bare Obsidian, which write none, end with
`revise 2. draft`.

```yaml
tags: rare
```

```buffer
- Plan┃2. draft
```

> enter "revise "

```buffer
- Plan
- revise ┃2\. draft
```

## Enter63

With `enterOnEmptyItem: exit`, an empty top-level item in the middle of its list leaves it, as with
`outdent` ([Enter7b](#enter7b)): an empty paragraph, the rest of the list its own, and what is typed
next is that paragraph's text, as RemNote without bullets makes it. Nested, it gets a sibling
([Enter63b](#enter63b)).

```yaml
tags: rare free-form
enterOnEmptyItem: exit
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

> "x"

```buffer
- a

x┃

- b
```

## Enter63b

With `enterOnEmptyItem: exit`, an empty nested item in the middle of its list gets a new empty
sibling, as with `sibling` ([Enter27](#enter27)): RemNote without bullets makes paragraphs only at
the top level, and keeps a nested list a list.

```yaml
tags: rare
enterOnEmptyItem: exit
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

## Enter66

Enter at the end of a footnote definition: a paragraph after it, set off by a blank line, since a
line right under it would continue its text. Backspace on the empty paragraph takes it back.

```yaml
tags: edge
flavor: gfm
```

```buffer
[^1]: a note┃
```

> enter

```buffer
[^1]: a note

┃◌
```

> deleteContentBackward

```buffer
[^1]: a note┃
```

## Enter67

Enter at the end of a thematic break: a paragraph after it, as at a table's end.

```yaml
tags: edge
```

```buffer
---┃
```

> enter

```buffer
---

┃◌
```

## Enter68

Enter at the start of an Obsidian callout's title: its text becomes the callout's first paragraph,
set off by a blank line from a line right below the callout that would continue it lazily,
whatever that line holds (a `#` inside it too).

```yaml
tags: rare
flavor: obsidian
```

```buffer
> [!note] ┃q
p # h
```

> enter

```buffer
> [!note]
> ┃q

p # h
```

## Enter69

Enter inside an item whose text is a heading splits the item as any: the heading stays with the
first half, the rest is the next item, plain, as Logseq, Tine and Athens do, and RemNote.

```yaml
tags: common
```

```buffer
- # Hel┃lo
- next
```

> enter

```buffer
- # Hel
- ┃lo
- next
```

## Enter69d

At the end of an item's heading, Enter makes an empty item after it, as at any item's end.

```yaml
tags: common
```

```buffer
- # Head┃
- next
```

> enter

```buffer
- # Head
- ┃
- next
```

## Enter70

At the end of a table that is an item's text, a new item, as at the end of any item's text (and of
code that is one, [Fence rule 3](fences.md)); in a row's middle, refused as at the top level.

```yaml
tags: edge
flavor: gfm
```

```buffer
- a
- | x | y |
  | - | - |
  | 1 | 2 |┃
- b
```

> enter

```buffer
- a
- | x | y |
  | - | - |
  | 1 | 2 |
- ┃
- b
```
