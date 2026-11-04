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
5. **Otherwise the text breaks at the caret**, the new line at the node's content column, the
   spaces on either side of the caret staying where they are and the caret at the new line's
   start, before them (ShiftEnter1, ShiftEnter2, ShiftEnter3, ShiftEnter5); at the end of the text the empty new line is held by a
   placeholder (ShiftEnter4). Text after the caret that would start a block there, or underline the
   paragraph into a heading, is escaped, in every flavor (ShiftEnter5, ShiftEnter6, ShiftEnter7,
   ShiftEnter8, ShiftEnter9, ShiftEnter18, ShiftEnter19), and so is the text's start where its first
   line would read as a link reference definition (ShiftEnter23), the held empty line counting as
   typed on (ShiftEnter31).

Over a selection across lines, the selection goes first, as Backspace deletes it, and the line
breaks at the caret that leaves (ShiftEnter27).

Backspace takes a Shift-Enter back (ShiftEnter17, ShiftEnter20), the spaces at the break included
(ShiftEnter21). The break moves no space, as Logseq, Roam, Dynalist, RemNote, bare Obsidian and
its Outliner break the line (and every other app with line breaks in a block, but true-outliner and
Emacs, which drop the new line's leading space): a continuation line's leading spaces render as
nothing but are its text, the user's whitespace as an item's padding is, and the caret is before
them; two spaces or more left at the end of the first line make it a hard break. Spaces before a task's text are its
checkbox's, and go (ShiftEnter26b). Bare Obsidian and the text editors don't
escape what follows the caret, which turns `- def` into a list and `===` into a heading underline.

## ShiftEnter1

Continues at the content column, the space after the caret starting the new line, the caret before
it, as Backspace finds it ([ShiftEnter21](#shiftenter21)).

```yaml
tags: core
```

```markdown
- one two┃ three
```

> shiftEnter

```markdown
- one two
  ┃ three
```

## ShiftEnter2

Nested item under ordered parent.

```yaml
tags: common
```

```markdown
1. a
   - b┃ c
```

> shiftEnter

```markdown
1. a
   - b
     ┃ c
```

## ShiftEnter3

Tab-nested item breaks with tab.

```yaml
tags: common
```

```markdown
- x
→- a┃ b
```

> shiftEnter

```markdown
- x
→- a
→  ┃ b
```

## ShiftEnter4

Empty new line is held by a placeholder: an empty new line would end the paragraph, so a
placeholder holds it until something is typed.

```yaml
tags: core
```

```markdown
- one┃
- two
```

> shiftEnter

```markdown
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

```markdown
- abc ┃- def
```

> shiftEnter

```markdown
- abc 
  ┃\̬- def
```

## ShiftEnter6

Ordered marker escaped.

```yaml
tags: rare
```

```markdown
- abc ┃1. def
```

> shiftEnter

```markdown
- abc 
  ┃1\̬. def
```

## ShiftEnter7

Setext equals underline escaped. Bare Obsidian leaves `===` under `Title `, which makes the
paragraph a heading.

```yaml
tags: rare
```

```markdown
Title ┃===
```

> shiftEnter

```markdown
Title 
┃\̬===
```

## ShiftEnter8

Setext dash underline escaped.

```yaml
tags: rare
```

```markdown
Title ┃--
```

> shiftEnter

```markdown
Title 
┃\̬--
```

## ShiftEnter9

HTML tag escaped on new line.

```yaml
tags: rare
```

```markdown
- one ┃<div>
```

> shiftEnter

```markdown
- one 
  ┃\̬<div>
```

## ShiftEnter10

Shift-Enter at the start of a continuation line opens a blank line above it, the caret staying with
the text: the line and the rest become the item's next paragraph, as in Logseq. Backspace takes the
blank line back, the line break staying ([Backspace19](backspace.md#backspace19)).

```yaml
tags: common
```

```markdown
- a
  ┃bc
```

> shiftEnter

```markdown
- a

  ┃bc
```

> "x"

```markdown
- a

  x┃bc
```

## ShiftEnter11

A second Shift-Enter, on the blank line the first one made, is a paragraph break: another blank line,
the caret on it, at the item's text: typed on, it is a paragraph inside the item, its first child.
Backspace takes the second back, as it takes back a fresh Shift-Enter: inside an item only
Shift-Enter makes such a paragraph. (After a paragraph that isn't an item's, the same state comes
from Enter, and Backspace takes that back: [ShiftEnter12](#shiftenter12).)

```yaml
tags: common
```

```markdown
- one┃
- two
```

> shiftEnter shiftEnter

```markdown
- one

  ┃◌
- two
```

> deleteContentBackward

```markdown
- one
  ┃◌
- two
```

## ShiftEnter12

After a paragraph that isn't an item's, a second Shift-Enter is another blank line, the caret on
it, where what is typed is a paragraph of its own, as after Enter at a paragraph's end. Backspace
takes the breaks back one at a time, to the end of the paragraph.

```yaml
tags: common
```

```markdown
para┃
```

> shiftEnter shiftEnter

```markdown
para

┃
```

> deleteContentBackward deleteContentBackward

```markdown
para┃
```

## ShiftEnter13

At the start of an item's text, Shift-Enter breaks the line: `-` alone, then the text on the next
line at the item's column, which CommonMark reads as the same item (an item may begin with a blank
line), as Dynalist, BlockNote, true-outliner and the text editors break the line there. Backspace
takes the break back, rather than unwrapping or joining the item as at a text start.

```yaml
tags: common
```

```markdown
- ┃one
```

> shiftEnter

```markdown
-
  ┃one
```

> deleteContentBackward

```markdown
- ┃one
```

## ShiftEnter13b

A first child right under its parent's text: the bare `-` would underline that text into a heading,
so a blank line sets it off, as above an empty item there.

```yaml
tags: common
```

```markdown
- a
  - ┃b
```

> shiftEnter

```markdown
- a

  -
    ┃b
```

## ShiftEnter30

At the text start of an item whose first character was just deleted, the space after it held as
text ([Placeholder17](placeholders.md#placeholder17)): on its own line the text would be a code
fence, so it is escaped; the space stays with it, its line's indentation.

```yaml
tags: rare
```

```markdown
- ┃a ``` x
```

> deleteContentForward cursorCharRight

```markdown
- ◌ ┃``` x
```

> shiftEnter

```markdown
-
  ┃ \̬``` x
```

## ShiftEnter30b

At the text start of an item whose first character was just deleted, the space after it held as
text ([Placeholder17](placeholders.md#placeholder17)): With `heldSpace: trim`, the space goes.

```yaml
tags: rare
heldSpace: trim
```

```markdown
- ┃a ``` x
```

> deleteContentForward cursorCharRight

```markdown
- ◌ ┃``` x
```

> shiftEnter

```markdown
-
  ┃\̬``` x
```

## ShiftEnter14

In an ATX heading, whose title is one line, Shift-Enter does what Enter does: the rest of the title
becomes the section's first paragraph ([Enter23](enter.md#enter23)). No app refuses it, and six
that make paragraphs split it so. (A setext title takes a second line:
[ShiftEnter29](#shiftenter29).)

```yaml
tags: common free-form
```

```markdown
# Title┃ more
```

> shiftEnter

```markdown
# Title
┃more
```

## ShiftEnter15

Shift-Enter twice at an item's end, then typing: the text is the item's second paragraph.

```yaml
tags: common
```

```markdown
- one┃
```

> shiftEnter shiftEnter "p"

```markdown
- one

  p┃
```

## ShiftEnter16

Paragraph break in a CRLF item: new lines take the ending of the line they split.

```yaml
tags: rare
```

```markdown
- a┃␍
```

> shiftEnter shiftEnter "p"

```markdown
- a␍
␍
  p┃␍
```

## ShiftEnter17

Shift-Enter, then Backspace: the line break goes, and the text is as it was.

```yaml
tags: common
```

```markdown
- one┃two
```

> shiftEnter

```markdown
- one
  ┃two
```

> deleteContentBackward

```markdown
- one┃two
```

## ShiftEnter18

An ordered marker split onto a new line stays as it is: `2.` can't interrupt a paragraph, so the
item has two lines, as CommonMark reads them. (Lezer, CodeMirror's and Obsidian's Live Preview
reader, reads a nested item; ourus reads as CommonMark does.)

```yaml
tags: rare
```

```markdown
1. abc ┃2. x
```

> shiftEnter

```markdown
1. abc 
   ┃2. x
```

## ShiftEnter19

A table's delimiter row split onto a new line is escaped: under the text it would start a table in
GFM.

```yaml
tags: rare
flavor: gfm
```

```markdown
a | b ┃|---|---|
```

> shiftEnter

```markdown
a | b 
┃|\̬---|---|
```

## ShiftEnter20

Shift-Enter, then Backspace, where the break escaped a marker: the join drops the escape, which
mid-line serves nothing ([Enter43](enter.md#enter43)'s mirror).

```yaml
tags: rare
```

```markdown
- abc┃- def
```

> shiftEnter

```markdown
- abc
  ┃\̬- def
```

> deleteContentBackward

```markdown
- abc┃- def
```

## ShiftEnter21

Shift-Enter at a space, then Backspace: the text comes back as it was, the space and the caret
with it, unlike after Enter, which trims it ([Enter44](enter.md#enter44)). The space starts the new
line, after its indentation, the caret before it, as every app that breaks the line keeps it but
true-outliner and Emacs: Markdown renders a continuation line without its leading spaces, but
keeps them in the text, and the join, which concatenates, gives them back.

```yaml
tags: common
```

```markdown
- one two┃ three
```

> shiftEnter

```markdown
- one two
  ┃ three
```

> deleteContentBackward

```markdown
- one two┃ three
```

## ShiftEnter22

In the marker, a line break can't be one in the item's text: the host makes it
(`markup: text`, the default), and the text reads as it then does, an empty item and a
paragraph.

```yaml
tags: rare free-form
```

```markdown
-┃ a
```

> shiftEnter

```yaml
result: deferredToHost
```

```markdown
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

```markdown
-┃ a
```

> shiftEnter

```markdown
-
  ┃a
```

## ShiftEnter23

A line break after prose that starts like a link reference definition: `[Note]: this` on a line of
its own would be one, and the rest a paragraph after it, so it is escaped.

```yaml
tags: rare
```

```markdown
[Note]: this ┃matters a lot
```

> shiftEnter

```markdown
[Note]\̬: this 
┃matters a lot
```

## ShiftEnter24

Shift-Enter in a table's row is refused, as Enter is ([Enter50](enter.md#enter50)).

```yaml
tags: rare free-form
flavor: gfm
```

```markdown
| a | b |
| --- | --- |
| on┃e | 2 |
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```markdown
| a | b |
| --- | --- |
| on┃e | 2 |
```

## ShiftEnter25

Shift-Enter at the start of a continuation line that reads as a link reference definition on its
own: the new paragraph's start is escaped, so it stays text.

```yaml
tags: rare
```

```markdown
p
┃[r]: /u
```

> shiftEnter

```markdown
p

┃[r]\̬: /u
```

## ShiftEnter26

Inside a task's checkbox, as in an item's marker ([ShiftEnter22](#shiftenter22)), a line break can't
be one in the item's text: where the host shows markup as text (`markup: text`, the default), the
line break is the host's, and the text reads as it then does, the checkbox broken.

```yaml
tags: rare free-form markup-task
```

```markdown
- [ ┃] task
```

> shiftEnter

```yaml
result: deferredToHost
```

```markdown
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

```markdown
- [ ┃] task
```

> shiftEnter

```markdown
- [ ]
  ┃task
```

## ShiftEnter27

Shift-Enter over a selection across nodes deletes it first, as Backspace does, and breaks the line
at the caret that leaves, as Enter does over one ([Enter56](enter.md#enter56)).

```yaml
tags: rare
```

```markdown
- a«bc
- de»f
```

> shiftEnter

```markdown
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

```markdown
- p
  -┃a
```

> shiftEnter

```markdown
- p
  \̬-
  ┃a
```

> deleteContentBackward

```markdown
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

```markdown
Title┃more
---
```

> shiftEnter

```markdown
Title
┃more
---
```

> deleteContentBackward

```markdown
Title┃more
---
```

## ShiftEnter31

At the end of a text that is a link reference definition but for its destination (`[a]:`), the new
line is a blank line, the caret on it, at the text's column; Backspace takes it back. (What is typed
there is the text's next line, and may make it a definition: the host's typing.)

```yaml
tags: rare
```

```markdown
[a]:┃

b
```

> shiftEnter

```markdown
[a]:
┃

b
```

> deleteContentBackward

```markdown
[a]:┃

b
```

## ShiftEnter32

At a space a placeholder holds as text, before it ([ShiftEnter30](#shiftenter30) is after it), the
caret is at the text's start too: the line breaks after the marker, the space staying with the text, its line's indentation, and
the text, on its own line, is escaped. Bare Obsidian, its Outliner, Logseq, Roam and
Dynalist break there too, the space kept and nothing escaped (`-␠` / `  ┃ # b`).

```yaml
tags: rare
```

```markdown
- a┃ # b
```

> deleteContentBackward

```markdown
- ┃◌ # b
```

> shiftEnter

```markdown
-
  ┃ \̬# b
```

## ShiftEnter32b

At a space a placeholder holds as text, before it ([ShiftEnter30](#shiftenter30) is after it), the
caret is at the text's start too: With `heldSpace: trim`, the space goes. Bare Obsidian, its Outliner, Logseq, Roam and
Dynalist break there too, the space kept and nothing escaped (`-␠` / `  ┃ # b`).

```yaml
tags: rare
heldSpace: trim
```

```markdown
- a┃ # b
```

> deleteContentBackward

```markdown
- ┃◌ # b
```

> shiftEnter

```markdown
-
  ┃\̬# b
```

## ShiftEnter33

Before text alone on the line after its marker ([ShiftEnter13](#shiftenter13) made it so), the line
can't break again: an item starts with one blank line at most, so a second would end the item and
leave the text outside the list. Refused, as at a paragraph's text start, from the spaces before the
text too, which are the text's.

```yaml
tags: rare
```

```markdown
-
  ┃ three
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```markdown
-
  ┃ three
```
