# Structural commands

What each ourus command does, rule by rule. The format is in [README.md](README.md). Sections are
named by the action the examples use, then its typical key in parentheses; keys vary between editors
and keymaps, actions don't.

Some empty nodes have no Markdown of their own: `- a` / `  - ` is a setext heading, not an item
with an empty child, and an empty line is no paragraph. A command that leaves the caret in such a
node holds it open as a provisional place (`◌`), until the user types into it or moves away (see
`settle`).

A command that applies is checked by re-parsing its output: the new outline must be exactly the
intended one. Where a command doesn't apply, the host runs its own default (Enter inserts a line
break in a code block, for instance), and the examples show what that does.

## formatIndent (Tab)

Indent makes a list item the last child of its previous sibling. The item's whole subtree
moves with it. New children nest at the parent's content column.

### Becomes last child of previous sibling

```buffer
- a
- b┃
```

> formatIndent

```buffer
- a
  - b┃
```

### Subtree shifts with the item

Children carry along, and every line of the subtree shifts by the same amount.

```buffer
- a
- b┃
  - c
    more c
```

> formatIndent

```buffer
- a
  - b┃
    - c
      more c
```

### Adopts existing children's bullet

When the parent already has children, the item lines up with them and adopts their bullet.

```buffer
- a
    * x
- b┃
```

> formatIndent

```buffer
- a
    * x
    * b┃
```

### Ordered item renumbered from 1

Ordered items nest under the marker's content column. An ordered item that starts a new list
is renumbered from 1: only a list starting at 1 can interrupt a paragraph, so `   2. b` would
read as more of `a`'s text. The list it left renumbers too.

```buffer
1. a
2. b┃
3. c
```

> formatIndent

```buffer
1. a
   1. b┃
2. c
```

### Joins existing ordered numbering

Items joining an existing ordered list continue its numbering.

```buffer
1. a
   1. x
2. b┃
```

> formatIndent

```buffer
1. a
   1. x
   2. b┃
```

### Tab-indented list keeps tabs

A document that nests with tabs keeps doing so.

```buffer
- a
→- b
- c┃
```

> formatIndent

```buffer
- a
→- b
→- c┃
```

### Tab nesting elsewhere sets the indent

```buffer
- a
- b┃
- c
→- d
```

> formatIndent

```buffer
- a
→- b┃
- c
→- d
```

### Empty new item becomes provisional

A new, empty item can be indented right away. Under its parent's text it has no Markdown form of
its own, so it is held open as a provisional place until something is typed.

```buffer
- a
- ┃
```

> formatIndent

```buffer
- a
  - ┃◌
```

### Selected siblings indent together

A selection over several siblings indents them together.

```buffer
- a
- «b
- c»
- d
```

> formatIndent

```buffer
- a
  - «b
  - c»
- d
```

### First item cannot indent

The first item has no previous sibling to go under.

```buffer
- a┃
- b
```

> formatIndent

```result
rejected: no-previous-sibling
```

### No nesting under a paragraph

Paragraphs are leaves: nothing nests under them.

```buffer
Intro

- a┃
```

> formatIndent

```result
rejected: not-expressible
```

Quotes are outline containers: items inside a quote indent as they do anywhere else. Those
examples are in [`quotes.md`](quotes.md). (This file used to say quotes were atoms; that decision is
superseded, see postimpl1c §6.)

## formatOutdent (Shift-Tab)

Outdent makes an item the next sibling of its parent. Siblings below it stay with the parent.

### Becomes next sibling of its parent

```buffer
- a
  - b┃
```

> formatOutdent

```buffer
- a
- b┃
```

### Later siblings stay with the parent

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> formatOutdent

```buffer
- a
  - c
- b┃
  - b1
- d
```

### Rejected at the top level

```buffer
- a┃
```

> formatOutdent

```result
rejected: at-top-level
```

### Tab-nested item outdents

```buffer
- a
→- b┃
```

> formatOutdent

```buffer
- a
- b┃
```

## moveUp, moveDown (Alt-Shift-Up, Alt-Shift-Down)

An item swaps places with its previous or next sibling, subtrees included. The blank lines
between them stay where they are.

### Moving up carries the subtree

```buffer
- a
- b┃
  - b1
- c
```

> moveUp

```buffer
- b┃
  - b1
- a
- c
```

### Moving down keeps blank lines in place

```buffer
- a┃
  - a1

- b
```

> moveDown

```buffer
- b

- a┃
  - a1
```

### First item cannot move up

```buffer
- a┃
- b
```

> moveUp

```result
rejected: no-previous-sibling
```

### Heading moves with its section

Headings move with their sections.

```buffer
# A

text a

# B┃

text b
```

> moveUp

```buffer
# B┃

text b

# A

text a
```

### Paragraphs swap places

Paragraphs and other leaf blocks reorder among themselves, but not past a list item.

```buffer
one

two┃
```

> moveUp

```buffer
two┃

one
```

### Paragraph cannot pass a list item

```buffer
para

- a┃
```

> moveUp

```result
rejected: not-expressible
```

## formatIndent, formatOutdent on a heading (Tab, Shift-Tab)

Indent and outdent on a heading change its level, and the levels of the headings in its
section with it.

### Subheadings shift with the heading

```buffer
# A
## B┃
### C
```

> formatIndent

```buffer
# A
### B┃
#### C
```

### H1 cannot outdent further

```buffer
# A┃
```

> formatOutdent

```result
rejected: at-h1-bound
```

## insertParagraph (Enter)

Enter splits an item at the caret. The text after the caret becomes a new item below it.

### Splits item at the caret

```buffer
- one two┃ three
- next
```

> insertParagraph

```buffer
- one two
- ┃three
- next
```

### Ordered item counts on at end

At the end of an item, Enter makes an empty sibling. Ordered items count on.

```buffer
1. one┃
```

> insertParagraph

```buffer
1. one
2. ┃
```

### Becomes first child of parent item

An item with children gets the new item as its first child.

```buffer
- a┃ b
  - c
```

> insertParagraph

```buffer
- a
  - ┃b
  - c
```

### Empty first child is provisional

At the end of such an item the new child is empty, right after the parent's text: a provisional
place.

```buffer
- a┃
  - b
```

> insertParagraph

```buffer
- a
  - ┃◌
  - b
```

### Empty nested item outdents

Enter on an empty nested item outdents it. On an empty top-level item it leaves the list: the
item becomes an empty paragraph place, set off from the items around it by blank lines. So
Enter twice ends a list.

```buffer
- a
  - b
  - ┃
```

> insertParagraph

```buffer
- a
  - b
- ┃
```

### Empty top-level item leaves the list

```buffer
- a
- ┃
```

> insertParagraph

```buffer
- a

┃◌
```

### Leaving mid-list splits the list

In the middle of a list, leaving it splits the list in two.

```buffer
- a
- ┃
- b
```

> insertParagraph

```buffer
- a

┃◌

- b
```

### Trailing list marker kept as marker

Text after the caret that starts with a list marker brings its own marker; other text that would
start a block is escaped, so it stays text.

```buffer
- abc ┃- def
```

> insertParagraph

```buffer
- abc
- ┃def
```

### Trailing heading marker escaped

```buffer
- abc ┃# def
```

> insertParagraph

```buffer
- abc
- ┃\# def
```

### HTML block tag escaped

That includes an HTML block's opening tag, and a link reference definition.

```buffer
- abc ┃<div>
```

> insertParagraph

```buffer
- abc
- ┃\<div>
```

### Link reference definition escaped

```buffer
see ┃[a]: /url
```

> insertParagraph

```buffer
see

┃\[a]: /url
```

### Paragraph splits in two

Enter in a paragraph makes two paragraphs, a blank line between them.

```buffer
some┃ text
```

> insertParagraph

```buffer
some

┃text
```

### Code block left to the host

Enter in a fenced code block is the host's business.

````buffer
```
co┃de
```
````

> insertParagraph

````buffer
```
co
┃de
```
````

## insertLineBreak (Shift-Enter)

Shift-Enter breaks a line inside a node's text. The new line continues at the node's content
column, so the node stays one node.

### Continues at the content column

```buffer
- one two┃ three
```

> insertLineBreak

```buffer
- one two
  ┃three
```

### Nested item under ordered parent

```buffer
1. a
   - b┃ c
```

> insertLineBreak

```buffer
1. a
   - b
     ┃c
```

### Tab-nested item breaks with tab

```buffer
- x
→- a┃ b
```

> insertLineBreak

```buffer
- x
→- a
→  ┃b
```

### Empty new line is provisional

An empty new line would end the paragraph, so it is a provisional place until something is typed.

```buffer
- one┃
- two
```

> insertLineBreak

```buffer
- one
  ┃◌
- two
```

### Leading bullet escaped

Text that would start a block on its own line, or underline the paragraph into a heading, is
escaped.

```buffer
- abc ┃- def
```

> insertLineBreak

```buffer
- abc
  ┃\- def
```

### Ordered marker escaped

```buffer
- abc ┃1. def
```

> insertLineBreak

```buffer
- abc
  ┃1\. def
```

### Setext equals underline escaped

```buffer
Title ┃===
```

> insertLineBreak

```buffer
Title
┃\===
```

### Setext dash underline escaped

```buffer
Title ┃--
```

> insertLineBreak

```buffer
Title
┃\--
```

### HTML tag escaped on new line

```buffer
- one ┃<div>
```

> insertLineBreak

```buffer
- one
  ┃\<div>
```

### Start of a continuation line

At the start of a continuation line, Shift-Enter does what it does at the end of the line above:
an empty line inside the text can only be a place to type into, so the caret goes there.

```buffer
- a
  ┃bc
```

> insertLineBreak

```buffer
- a
  ┃◌
  bc
```

> "x"

```buffer
- a
  x┃
  bc
```

### Second Shift-Enter starts a paragraph

A second Shift-Enter, on the empty line the first one made, is a paragraph break: the line
becomes a blank line, and the caret moves to a new empty paragraph inside the item, its first
child. (Markdown has no empty line inside a paragraph, so this is what a blank line can mean.)

```buffer
- one
  ┃◌
- two
```

> insertLineBreak

```buffer
- one

  ┃◌
- two
```

### After a plain paragraph

After a paragraph that isn't an item's, the new paragraph follows it.

```buffer
para
┃◌
```

> insertLineBreak

```buffer
para

┃◌
```

### Rejected at the start of text

At the very start of the text, there's no line to break.

```buffer
- ┃one
```

> insertLineBreak

```result
rejected: not-expressible
```

### Rejected in a heading

A heading is one line.

```buffer
# Title┃ more
```

> insertLineBreak

```result
rejected: not-expressible
```

## deleteContentBackward (Backspace)

Backspace at the start of an item joins its text to the end of the node above.

### Joins text to the item above

```buffer
- one
- ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

### Caret before the marker

The caret can be anywhere before the item's text, marker included: deleting the line break
before a marker would turn the marker into text of the item above.

```buffer
- one
┃- two
```

> deleteContentBackward

```buffer
- one┃two
```

### Joins into the parent

The node above can be the parent.

```buffer
- a
  - ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

### Heading closing hashes stay at end

A heading's closing `#`s stay at the end of its line.

```buffer
# Title #
- ┃more
```

> deleteContentBackward

```buffer
# Title┃more #
```

### Empty item above takes the text

Into an empty item above, the text moves up, and the empty item takes it.

```buffer
- 
- ┃b
```

> deleteContentBackward

```buffer
- ┃b
```

### Empty parent takes a task child

```buffer
- a
- 
  - ┃[ ] task
    - child
```

> deleteContentBackward

```buffer
- a
- ┃[ ] task
  - child
```

### Empty item is removed

An empty item is removed.

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

### Children stay with the joined text

An item with children joins too, and its children go to the node above: into its place when
that node is its parent, else after that node's own children.

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

### Joins a continuation line

At the start of a continuation line, Backspace joins it to the line above: the inverse of
Shift-Enter.

```buffer
- one
  ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

### Back from an empty paragraph place

On the empty paragraph left by Enter on an empty item, Backspace goes back to the end of the
node above.

```buffer
- a

┃◌
```

> deleteContentBackward

```buffer
- a┃
```

### Mid-text backspace left to the host

Anywhere but the start of an item, Backspace is the host's.

```buffer
- ab┃c
```

> deleteContentBackward

```buffer
- a┃c
```

## deleteContentForward (Delete)

Delete at the end of a node's text joins the node below to it: Backspace at that node's start,
from the other side. The node below can be a child.

### Joins a child into its parent

```buffer
- abc┃
  - def
```

> deleteContentForward

```buffer
- abc┃def
```

### Joins the next sibling

```buffer
- one┃
- two
```

> deleteContentForward

```buffer
- one┃two
```

### Joins the next text line

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

### Joins before closing hashes

A heading's title ends before its closing `#`s.

```buffer
# Title┃ #
- more
```

> deleteContentForward

```buffer
# Title┃more #
```

### First child moves into empty item

On an empty item with children, the first child's text moves up into it, and that child's
children come along.

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

### Empty item removed, caret moves on

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

### Next sibling's children come along

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

### Mid-text delete left to the host

Anywhere but the end of a node's text, Delete is the host's.

```buffer
- a┃bc
```

> deleteContentForward

```buffer
- a┃c
```
