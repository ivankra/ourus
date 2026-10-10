# Structural commands

Each example shows the document before, the command, and the document after (or the
command's result when it doesn't apply). `┃` is the caret; `«…»` a selection, whose head is
the end `┃` touches (the end after `»` when no caret is drawn); `→` a tab.

`◌` marks a provisional place: the end of an empty line that the document reads as if text had
been typed there. Some empty nodes have no Markdown of their own: `- a` / `  - ` is a setext
heading, not an item with an empty child, and an empty line is no paragraph. A command that
leaves the caret in such a node holds it open as a provisional place, until the user types
into it or moves away (see `settle`).

A command that applies is checked by re-parsing its output: the new outline must be exactly the
intended one. A command that doesn't apply returns `notApplicable`, and the host runs its own
default (Enter inserts a line break in a paragraph, for instance).

## Indent

Indent makes a list item the last child of its previous sibling. The item's whole subtree
moves with it. New children nest at the parent's content column.

```````````````````````````````` example
- a
- b┃
.
formatIndent
.
- a
  - b┃
````````````````````````````````

Children carry along, and every line of the subtree shifts by the same amount.

```````````````````````````````` example
- a
- b┃
  - c
    more c
.
formatIndent
.
- a
  - b┃
    - c
      more c
````````````````````````````````

When the parent already has children, the item lines up with them and adopts their bullet.

```````````````````````````````` example
- a
    * x
- b┃
.
formatIndent
.
- a
    * x
    * b┃
````````````````````````````````

Ordered items nest under the marker's content column. An ordered item that starts a new list
is renumbered from 1: only a list starting at 1 can interrupt a paragraph, so `   2. b` would
read as more of `a`'s text. The list it left renumbers too.

```````````````````````````````` example
1. a
2. b┃
3. c
.
formatIndent
.
1. a
   1. b┃
2. c
````````````````````````````````

Items joining an existing ordered list continue its numbering.

```````````````````````````````` example
1. a
   1. x
2. b┃
.
formatIndent
.
1. a
   1. x
   2. b┃
````````````````````````````````

A document that nests with tabs keeps doing so.

```````````````````````````````` example
- a
→- b
- c┃
.
formatIndent
.
- a
→- b
→- c┃
````````````````````````````````

```````````````````````````````` example
- a
- b┃
- c
→- d
.
formatIndent
.
- a
→- b┃
- c
→- d
````````````````````````````````

A new, empty item can be indented right away. Under its parent's text it has no Markdown form of
its own, so it is held open as a provisional place until something is typed.

```````````````````````````````` example
- a
- ┃
.
formatIndent
.
- a
  - ┃◌
````````````````````````````````

A selection over several siblings indents them together.

```````````````````````````````` example
- a
- «b
- c»
- d
.
formatIndent
.
- a
  - «b
  - c»
- d
````````````````````````````````

The first item has no previous sibling to go under.

```````````````````````````````` example
- a┃
- b
.
formatIndent
.
rejected: no-previous-sibling
````````````````````````````````

Paragraphs are leaves: nothing nests under them.

```````````````````````````````` example
Intro

- a┃
.
formatIndent
.
rejected: not-expressible
````````````````````````````````

Quotes are atoms for now: the list inside one is not part of the outline.

```````````````````````````````` example
> - a
> - b┃
.
formatIndent
.
rejected: not-expressible
````````````````````````````````

## Outdent

Outdent makes an item the next sibling of its parent. Siblings below it stay with the parent.

```````````````````````````````` example
- a
  - b┃
.
formatOutdent
.
- a
- b┃
````````````````````````````````

```````````````````````````````` example
- a
  - b┃
    - b1
  - c
- d
.
formatOutdent
.
- a
  - c
- b┃
  - b1
- d
````````````````````````````````

```````````````````````````````` example
- a┃
.
formatOutdent
.
rejected: at-top-level
````````````````````````````````

```````````````````````````````` example
- a
→- b┃
.
formatOutdent
.
- a
- b┃
````````````````````````````````

## Moving

An item swaps places with its previous or next sibling, subtrees included. The blank lines
between them stay where they are.

```````````````````````````````` example
- a
- b┃
  - b1
- c
.
moveUp
.
- b┃
  - b1
- a
- c
````````````````````````````````

```````````````````````````````` example
- a┃
  - a1

- b
.
moveDown
.
- b

- a┃
  - a1
````````````````````````````````

```````````````````````````````` example
- a┃
- b
.
moveUp
.
rejected: no-previous-sibling
````````````````````````````````

Headings move with their sections.

```````````````````````````````` example
# A

text a

# B┃

text b
.
moveUp
.
# B┃

text b

# A

text a
````````````````````````````````

Paragraphs and other leaf blocks reorder among themselves, but not past a list item.

```````````````````````````````` example
one

two┃
.
moveUp
.
two┃

one
````````````````````````````````

```````````````````````````````` example
para

- a┃
.
moveUp
.
rejected: not-expressible
````````````````````````````````

## Heading levels

Indent and outdent on a heading change its level, and the levels of the headings in its
section with it.

```````````````````````````````` example
# A
## B┃
### C
.
formatIndent
.
# A
### B┃
#### C
````````````````````````````````

```````````````````````````````` example
# A┃
.
formatOutdent
.
rejected: at-h1-bound
````````````````````````````````

## Enter

Enter splits an item at the caret. The text after the caret becomes a new item below it.

```````````````````````````````` example
- one two┃ three
- next
.
insertParagraph
.
- one two
- ┃three
- next
````````````````````````````````

At the end of an item, Enter makes an empty sibling. Ordered items count on.

```````````````````````````````` example
1. one┃
.
insertParagraph
.
1. one
2. ┃
````````````````````````````````

An item with children gets the new item as its first child.

```````````````````````````````` example
- a┃ b
  - c
.
insertParagraph
.
- a
  - ┃b
  - c
````````````````````````````````

At the end of such an item the new child is empty, right after the parent's text: a provisional
place.

```````````````````````````````` example
- a┃
  - b
.
insertParagraph
.
- a
  - ┃◌
  - b
````````````````````````````````

Enter on an empty nested item outdents it. On an empty top-level item it leaves the list: the
item becomes an empty paragraph place, set off from the items around it by blank lines. So
Enter twice ends a list.

```````````````````````````````` example
- a
  - b
  - ┃
.
insertParagraph
.
- a
  - b
- ┃
````````````````````````````````

```````````````````````````````` example
- a
- ┃
.
insertParagraph
.
- a

┃◌
````````````````````````````````

In the middle of a list, leaving it splits the list in two.

```````````````````````````````` example
- a
- ┃
- b
.
insertParagraph
.
- a

┃◌

- b
````````````````````````````````

Text after the caret that starts with a list marker brings its own marker; other text that would
start a block is escaped, so it stays text.

```````````````````````````````` example
- abc ┃- def
.
insertParagraph
.
- abc
- ┃def
````````````````````````````````

```````````````````````````````` example
- abc ┃# def
.
insertParagraph
.
- abc
- ┃\# def
````````````````````````````````

Enter in a paragraph makes two paragraphs, a blank line between them.

```````````````````````````````` example
some┃ text
.
insertParagraph
.
some

┃text
````````````````````````````````

Enter in a fenced code block is the host's business.

```````````````````````````````` example
```
co┃de
```
.
insertParagraph
.
notApplicable
````````````````````````````````

## Shift-Enter

Shift-Enter breaks a line inside a node's text. The new line continues at the node's content
column, so the node stays one node.

```````````````````````````````` example
- one two┃ three
.
insertLineBreak
.
- one two
  ┃three
````````````````````````````````

```````````````````````````````` example
1. a
   - b┃ c
.
insertLineBreak
.
1. a
   - b
     ┃c
````````````````````````````````

```````````````````````````````` example
- x
→- a┃ b
.
insertLineBreak
.
- x
→- a
→  ┃b
````````````````````````````````

An empty new line would end the paragraph, so it is a provisional place until something is typed.

```````````````````````````````` example
- one┃
- two
.
insertLineBreak
.
- one
  ┃◌
- two
````````````````````````````````

Text that would start a block on its own line, or underline the paragraph into a heading, is
escaped.

```````````````````````````````` example
- abc ┃- def
.
insertLineBreak
.
- abc
  ┃\- def
````````````````````````````````

```````````````````````````````` example
- abc ┃1. def
.
insertLineBreak
.
- abc
  ┃1\. def
````````````````````````````````

```````````````````````````````` example
Title ┃===
.
insertLineBreak
.
Title
┃\===
````````````````````````````````

A second Shift-Enter, on the empty line the first one made, is a paragraph break: the line
becomes a blank line, and the caret moves to a new empty paragraph inside the item, its first
child. (Markdown has no empty line inside a paragraph, so this is what a blank line can mean.)

```````````````````````````````` example
- one
  ┃◌
- two
.
insertLineBreak
.
- one

  ┃◌
- two
````````````````````````````````

After a paragraph that isn't an item's, the new paragraph follows it.

```````````````````````````````` example
para
┃◌
.
insertLineBreak
.
para

┃◌
````````````````````````````````

At the very start of the text, there's no line to break.

```````````````````````````````` example
- ┃one
.
insertLineBreak
.
rejected: not-expressible
````````````````````````````````

A heading is one line.

```````````````````````````````` example
# Title┃ more
.
insertLineBreak
.
rejected: not-expressible
````````````````````````````````

## Backspace

Backspace at the start of an item joins its text to the end of the node above.

```````````````````````````````` example
- one
- ┃two
.
deleteContentBackward
.
- one┃two
````````````````````````````````

The caret can be anywhere before the item's text, marker included: deleting the line break
before a marker would turn the marker into text of the item above.

```````````````````````````````` example
- one
┃- two
.
deleteContentBackward
.
- one┃two
````````````````````````````````

The node above can be the parent.

```````````````````````````````` example
- a
  - ┃b
.
deleteContentBackward
.
- a┃b
````````````````````````````````

An empty item is removed.

```````````````````````````````` example
- a
  - b
- ┃
.
deleteContentBackward
.
- a
  - b┃
````````````````````````````````

An item with children can't be joined away.

```````````````````````````````` example
- a
- ┃b
  - c
.
deleteContentBackward
.
rejected: has-children
````````````````````````````````

At the start of a continuation line, Backspace joins it to the line above: the inverse of
Shift-Enter.

```````````````````````````````` example
- one
  ┃two
.
deleteContentBackward
.
- one┃two
````````````````````````````````

On the empty paragraph left by Enter on an empty item, Backspace goes back to the end of the
node above.

```````````````````````````````` example
- a

┃◌
.
deleteContentBackward
.
- a┃
````````````````````````````````

Anywhere but the start of an item, Backspace is the host's.

```````````````````````````````` example
- ab┃c
.
deleteContentBackward
.
notApplicable
````````````````````````````````
