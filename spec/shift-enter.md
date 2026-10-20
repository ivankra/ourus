# Shift-Enter

Command: `shiftEnter` (Shift-Enter).

Makes a line: the node stays one node; whereas [`enter`](enter.md) makes a node.
The rules, in order; the first that applies wins:

1. **In fenced code**, a new code line, as Enter ([Fence8](fences.md#fence8)).
2. **Where the node can't hold a second line**: an ATX heading splits, as with Enter
   (ShiftEnter14; a setext title holds several, ShiftEnter29, its underline being markup); a
   callout's title in the Obsidian flavor ([quotes.md](quotes.md)) and a table's row (ShiftEnter24)
   refuse it. At an item's text start the line breaks after the marker (ShiftEnter13,
   ShiftEnter13b), the text escaped where on its own line it would start a block (ShiftEnter30).
   With the caret in the item's marker or a task's checkbox, the line break is the host's (`markup:
   text`, the default; ShiftEnter22, ShiftEnter26); where the host decorates markup (`markup:
   decorated`), Shift-Enter acts at the text start (ShiftEnter22b, ShiftEnter26b).
3. **At the start of a continuation line**, a blank line above it: the line and the rest of the
   text become the node's next paragraph (ShiftEnter10), escaped where it would start a block or
   read as a link reference definition (ShiftEnter25). Markdown has no empty line inside a
   paragraph, so a blank line is what a line break there can be.
4. **On the empty line a Shift-Enter made**, a paragraph break, for the same reason: an empty
   paragraph inside the item, or after the paragraph (ShiftEnter11, ShiftEnter12, ShiftEnter15,
   ShiftEnter16).
5. **Otherwise the text breaks at the caret**, the new line at the node's content column
   (ShiftEnter1, ShiftEnter2, ShiftEnter3); at the end of the text the empty new line is held by a
   placeholder (ShiftEnter4). Text after the caret that would start a block there, or underline the
   paragraph into a heading, is escaped, in every flavor (ShiftEnter5, ShiftEnter6, ShiftEnter7,
   ShiftEnter8, ShiftEnter9, ShiftEnter18, ShiftEnter19), and so is the text's start where its first
   line would read as a link reference definition (ShiftEnter23), the held empty line counting as
   typed on (ShiftEnter31).

Over a selection across lines, the selection goes first, as Backspace deletes it, and the line
breaks at the caret that leaves (ShiftEnter27).

Backspace takes a Shift-Enter back (ShiftEnter17, ShiftEnter20), the spaces at the break included
(ShiftEnter21). The spaces at the break start the new line, after its indentation: a continuation
line's leading spaces render as nothing but are kept in the text, and they change no structure,
where left before the break two would make a hard break. Spaces before a task's text are its
checkbox's, and go (ShiftEnter26b). Bare Obsidian and the text editors don't
escape what follows the caret, which turns `- def` into a list and `===` into a heading underline.

## ShiftEnter1

Continues at the content column, the space at the break starting the new line, which Backspace
brings back ([ShiftEnter21](#shiftenter21)).

```yaml
tags: core
```

```buffer
- one two┃ three
```

> shiftEnter

```buffer
- one two
   ┃three
```

## ShiftEnter2

Nested item under ordered parent.

```yaml
tags: common
```

```buffer
1. a
   - b┃ c
```

> shiftEnter

```buffer
1. a
   - b
      ┃c
```

## ShiftEnter3

Tab-nested item breaks with tab.

```yaml
tags: edge
```

```buffer
- x
→- a┃ b
```

> shiftEnter

```buffer
- x
→- a
→   ┃b
```

## ShiftEnter4

Empty new line is held by a placeholder: an empty new line would end the paragraph, so a
placeholder holds it until something is typed.

```yaml
tags: core
```

```buffer
- one┃
- two
```

> shiftEnter

```buffer
- one
  ┃◌
- two
```

## ShiftEnter5

Leading bullet escaped: text that would start a block on its own line, or underline the paragraph
into a heading, is escaped.

```yaml
tags: common
```

```buffer
- abc ┃- def
```

> shiftEnter

```buffer
- abc
   ┃\- def
```

## ShiftEnter6

Ordered marker escaped.

```yaml
tags: edge
```

```buffer
- abc ┃1. def
```

> shiftEnter

```buffer
- abc
   ┃1\. def
```

## ShiftEnter7

Setext equals underline escaped. Bare Obsidian leaves `===` under `Title `, which makes the
paragraph a heading.

```yaml
tags: edge
```

```buffer
Title ┃===
```

> shiftEnter

```buffer
Title
 ┃\===
```

## ShiftEnter8

Setext dash underline escaped.

```yaml
tags: edge
```

```buffer
Title ┃--
```

> shiftEnter

```buffer
Title
 ┃\--
```

## ShiftEnter9

HTML tag escaped on new line.

```yaml
tags: rare
```

```buffer
- one ┃<div>
```

> shiftEnter

```buffer
- one
   ┃\<div>
```

## ShiftEnter10

Shift-Enter at the start of a continuation line opens a blank line above it, the caret staying with
the text: the line and the rest become the item's next paragraph, as in Logseq. Backspace takes the
blank line back, the line break staying ([Backspace19](backspace.md#backspace19)).

```yaml
tags: edge free-form
```

```buffer
- a
  ┃bc
```

> shiftEnter

```buffer
- a

  ┃bc
```

> "x"

```buffer
- a

  x┃bc
```

## ShiftEnter11

A second Shift-Enter, on the empty line the first one made, is a paragraph break: the line becomes a
blank line, and the caret moves to a new empty paragraph inside the item, its first child. Backspace
takes the second back, as it takes back a fresh Shift-Enter: inside an item only Shift-Enter makes
such a paragraph. (After a paragraph that isn't an item's, the same state comes from Enter, and
Backspace takes that back: [ShiftEnter12](#shiftenter12).)

```yaml
tags: common free-form
```

```buffer
- one
  ┃◌
- two
```

> shiftEnter

```buffer
- one

  ┃◌
- two
```

> deleteContentBackward

```buffer
- one
  ┃◌
- two
```

## ShiftEnter12

After a paragraph that isn't an item's, the new paragraph follows it. Backspace goes back to the end
of the paragraph: the same state is Enter's at a paragraph's end, the commoner key, whose inverse
this is.

```yaml
tags: common free-form
```

```buffer
para
┃◌
```

> shiftEnter

```buffer
para

┃◌
```

> deleteContentBackward

```buffer
para┃
```

## ShiftEnter13

At the start of an item's text, Shift-Enter breaks the line: `-` alone, then the text on the next
line at the item's column, which CommonMark reads as the same item (an item may begin with a blank
line), as Dynalist, BlockNote, true-outliner and the text editors break the line there. Backspace
takes the break back, rather than unwrapping or joining the item as at a text start.

```yaml
tags: edge free-form
```

```buffer
- ┃one
```

> shiftEnter

```buffer
-
  ┃one
```

> deleteContentBackward

```buffer
- ┃one
```

## ShiftEnter13b

A first child right under its parent's text: the bare `-` would underline that text into a heading,
so a blank line sets it off, as above an empty item there.

```yaml
tags: rare free-form
```

```buffer
- a
  - ┃b
```

> shiftEnter

```buffer
- a

  -
    ┃b
```

## ShiftEnter30

At the text start of an item whose first character was just deleted, the space after it held as
text ([Placeholder17](placeholders.md#placeholder17)): on its own line at the item's column the text
would be a code fence, so it is escaped.

```yaml
tags: rare
```

```buffer
- ┃a ``` x
```

> deleteContentForward cursorCharRight

```buffer
- ◌ ┃``` x
```

> shiftEnter

```buffer
-
  ┃\``` x
```

## ShiftEnter14

In an ATX heading, whose title is one line, Shift-Enter does what Enter does: the rest of the title
becomes the section's first paragraph ([Enter23](enter.md#enter23)). No app refuses it, and six
that make paragraphs split it so. (A setext title takes a second line:
[ShiftEnter29](#shiftenter29).)

```yaml
tags: common free-form
```

```buffer
# Title┃ more
```

> shiftEnter

```buffer
# Title
┃more
```

## ShiftEnter15

Shift-Enter twice at an item's end, then typing: the text is the item's second paragraph.

```yaml
tags: common free-form
```

```buffer
- one┃
```

> shiftEnter shiftEnter "p"

```buffer
- one

  p┃
```

## ShiftEnter16

Paragraph break in a CRLF item: new lines take the ending of the line they split.

```yaml
tags: rare free-form
```

```buffer
- a┃␍
```

> shiftEnter shiftEnter "p"

```buffer
- a␍
␍
  p┃␍
```

## ShiftEnter17

Shift-Enter, then Backspace: the line break goes, and the text is as it was.

```yaml
tags: common
```

```buffer
- one┃two
```

> shiftEnter

```buffer
- one
  ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## ShiftEnter18

An ordered marker split onto a new line is escaped, though CommonMark reads one item with two lines
here (`2.` can't interrupt a paragraph): lezer (CodeMirror, Obsidian's Live Preview) reads a nested
item. The escape keeps every reader agreeing.

```yaml
tags: rare
```

```buffer
1. abc ┃2. x
```

> shiftEnter

```buffer
1. abc
    ┃2\. x
```

## ShiftEnter19

A table's delimiter row split onto a new line is escaped: under the text it would start a table in
GFM. It is escaped in every flavor, so the text is the same in each.

```yaml
tags: rare
```

```buffer
a | b ┃|---|---|
```

> shiftEnter

```buffer
a | b
 ┃\|---|---|
```

## ShiftEnter20

Shift-Enter, then Backspace, where the break escaped a marker: the join drops the escape, which
mid-line serves nothing ([Enter43](enter.md#enter43)'s mirror).

```yaml
tags: rare
```

```buffer
- abc┃- def
```

> shiftEnter

```buffer
- abc
  ┃\- def
```

> deleteContentBackward

```buffer
- abc┃- def
```

## ShiftEnter21

Shift-Enter at a space, then Backspace: the text comes back, the space with it, unlike after Enter,
which trims it ([Enter44](enter.md#enter44)). The space starts the new line, after its indentation, as bare
Obsidian keeps it and every app that breaks the line but true-outliner: Markdown renders a
continuation line without its leading spaces, but keeps them in the text, and the join, which
concatenates, gives them back; at the end of the first line two would make a hard break.

```yaml
tags: edge
```

```buffer
- one two┃ three
```

> shiftEnter

```buffer
- one two
   ┃three
```

> deleteContentBackward

```buffer
- one two ┃three
```

## ShiftEnter22

In the marker, a line break can't be one in the item's text: the host makes it
(`markup: text`, the default), and the text reads as it then does, an empty item and a
paragraph.

```yaml
tags: rare free-form
```

```buffer
-┃ a
```

> shiftEnter

```result
notApplicable
```

```buffer
-
┃ a
```

## ShiftEnter22b

Where the host decorates markup (`markup: decorated`), it acts at the text start, where the line
breaks after the marker ([ShiftEnter13](#shiftenter13)).

```yaml
tags: rare free-form
markup: decorated
```

```buffer
-┃ a
```

> shiftEnter

```buffer
-
  ┃a
```

## ShiftEnter23

A line break after prose that starts like a link reference definition: `[Note]: this` on a line of
its own would be one, and the rest a paragraph after it, so it is escaped.

```yaml
tags: rare
```

```buffer
[Note]: this ┃matters a lot
```

> shiftEnter

```buffer
\[Note]: this
 ┃matters a lot
```

## ShiftEnter24

Shift-Enter in a table's row is refused, as Enter is ([Enter50](enter.md#enter50)).

```yaml
tags: rare free-form
flavor: gfm
```

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

## ShiftEnter25

Shift-Enter at the start of a continuation line that reads as a link reference definition on its
own: the new paragraph's start is escaped, so it stays text.

```yaml
tags: rare free-form
```

```buffer
p
┃[r]: /u
```

> shiftEnter

```buffer
p

┃\[r]: /u
```

## ShiftEnter26

Inside a task's checkbox, as in an item's marker ([ShiftEnter22](#shiftenter22)), a line break can't
be one in the item's text: where the host shows markup as text (`markup: text`, the default), the
line break is the host's, and the text reads as it then does, the checkbox broken.

```yaml
tags: rare free-form markup-task
```

```buffer
- [ ┃] task
```

> shiftEnter

```result
notApplicable
```

```buffer
- [ 
┃] task
```

## ShiftEnter26b

Where the host decorates markup (`markup: decorated`), it acts at the text start, after the
checkbox, where the line breaks, the checkbox staying on the marker's line.

```yaml
tags: rare markup-task
markup: decorated
```

```buffer
- [ ┃] task
```

> shiftEnter

```buffer
- [ ]
  ┃task
```

## ShiftEnter27

Shift-Enter over a selection across nodes deletes it first, as Backspace does, and breaks the line
at the caret that leaves, as Enter does over one ([Enter56](enter.md#enter56)).

```yaml
tags: rare
```

```buffer
- a«bc
- de»f
```

> shiftEnter

```buffer
- a
  ┃f
```

## ShiftEnter28

A line break on a continuation line after text that, ended there, would read as a block: a lone `-`
under the item's text would underline it into a heading, so it is escaped, as a split's first half
is at the text's start ([Enter53](enter.md#enter53)). Backspace takes the break back and the escape
with it, which nothing then needs.

```yaml
tags: rare
```

```buffer
- p
  -┃a
```

> shiftEnter

```buffer
- p
  \-
  ┃a
```

> deleteContentBackward

```buffer
- p
  -┃a
```

## ShiftEnter29

A setext heading's title can hold several lines, as the paragraph it underlines can: Shift-Enter
breaks it, the heading staying one. Only an ATX title is a single line
([ShiftEnter14](#shiftenter14)).

```yaml
tags: rare markup-heading
```

```buffer
Title┃more
---
```

> shiftEnter

```buffer
Title
┃more
---
```

> deleteContentBackward

```buffer
Title┃more
---
```

## ShiftEnter31

At the end of a text that is a link reference definition but for its destination (`[a]:`), the new
line, held by a placeholder, would be read as typed on, and make it one: the start is escaped, and
Backspace takes the break and the escape back.

```yaml
tags: rare
```

```buffer
[a]:┃

b
```

> shiftEnter

```buffer
\[a]:
┃◌

b
```

> deleteContentBackward

```buffer
[a]:┃

b
```
