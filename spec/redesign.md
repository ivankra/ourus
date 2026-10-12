# The redesign

Behaviour the redesign ([`09-redesign.md`](../09-redesign.md)) specifies, drawn as examples: the decisions it
takes, and the bugs and gaps the experiments and reviews found in the first prototype.

## Decisions of the redesign

Behaviour [`09-redesign.md`](../09-redesign.md) decides. Cases the first prototype already passes
pin the decision so the rewrite keeps it; cases it fails are `pending`.

### The guard's permitted transformations

Native edits that change structure pass only as a permitted transformation; everything outside it
is protected (09-redesign, "The guard checks structural consequences").

#### Deleting the space after a marker

On an item with no children it is direct marker editing: the item becomes text.

##### Childless item becomes text

```buffer
-┃ a
```

> deleteContentForward

```buffer
-┃a
```

#### Setext authoring

Typing an underline under a paragraph makes it a heading, as Markdown authoring.

##### Typing an underline makes a heading

```buffer
para
┃
```

> "---"

```buffer
para
---┃
```

##### Deleting to finish the underline

Deleting the rest of the line to finish the underline is setext authoring too.

```buffer
para
---x┃
```

> deleteContentBackward

```buffer
para
---┃
```

#### A list marker typed on a continuation line

Typing `- ` at the start of a paragraph's continuation line turns that line into a list item.

```buffer
para
┃more
```

> "- "

```buffer
para
- ┃more
```

### Places exist only under a caret

#### A command that would leave an unwritable empty node elsewhere is refused

Outdenting `x` would leave the empty item right after `a`'s text, where it reads as a setext
underline, and the caret isn't in it. The command is refused, not `encoding-failed`.

```buffer
- a
  - ┃x
  - 
```

> formatOutdent

```result
rejected: not-expressible
```

#### An empty item the text can hold moves like any other

```buffer
- a
- ┃
- b
```

> moveDown

```buffer
- a
- b
- ┃
```

### Payload is preserved

A structural command may rewrite prefixes, never a node's own text: hard-break spaces and the
literal whitespace in code survive an indent.

#### Hard-break spaces survive an indent

```buffer
- a
- b  
  c┃
```

> formatIndent

```buffer
- a
  - b  
    c┃
```

#### Code whitespace survives an indent

````buffer
- a
- b┃
  ```
    x
  ```
````

> formatIndent

````buffer
- a
  - b┃
    ```
      x
    ```
````

### History

The basic history profile: each action that changed the text is one step, and undo and redo bring
back the text and the caret.

```buffer
- a
- b┃
```

> formatIndent undo

```buffer
- a
- b┃
```

> redo

```buffer
- a
  - b┃
```

### Heading moves

A heading moves with its section, among siblings of the same level (open decision 2's
recommended default).

```buffer
# A┃
- x
# B
- y
```

> moveDown

```buffer
# B
- y
# A┃
- x
```

### Obsidian: frontmatter is a preamble

Frontmatter is no node, so Enter in it is the host's newline. Today `a: b` / `---` reads as a
setext heading, and Enter writes a paragraph after the frontmatter instead.

```buffer pending
---
a: b┃
---
- x
```

> insertParagraph

```buffer
---
a: b
┃
---
- x
```

### Paragraphs own the list that follows them

A list that follows a paragraph in a section is that paragraph's children, so a paragraph indents,
outdents and moves like any node, taking the encoding its new place implies (09-redesign,
"Paragraphs own the list that follows them").

#### Indenting a paragraph

Under the paragraph above, it becomes a list item there; outdented among paragraphs, it is a
paragraph again, and the text comes back as it was.

```buffer
para a

para b┃
```

> formatIndent

```buffer
para a

- para b┃
```

> formatOutdent

```buffer
para a

para b┃
```

#### Outdenting a paragraph's list item

The item leaves the paragraph and lands after it among paragraphs, so it becomes a paragraph; the
items after it stay with their paragraph (outdent is logical).

```buffer
Groceries:
- milk┃
- eggs
```

> formatOutdent

```buffer
Groceries:
- eggs

milk┃
```

#### Moving a paragraph moves its list

```buffer
first

Groceries:┃
- milk
```

> moveUp

```buffer
Groceries:┃
- milk

first
```

#### A list item's first child has no sibling above

```buffer
Groceries:
- milk┃
- eggs
```

> moveUp

```result
rejected: no-previous-sibling
```

#### A paragraph owns consecutive lists

An ordered list and a bullet list right after a paragraph are two lists to CommonMark; both are the
paragraph's children.

```buffer
pa┃ra
1. a
- b
```

> insertLineBreak

```buffer
pa
┃ra
1. a
- b
```

#### A block pasted into a paragraph's list ends it

The items after the block follow the block, not the paragraph.

````clipboard
```
c
```
````

````buffer
para
- a┃
- b
````

> insertFromPaste

````buffer
para
- a

```
c
```┃

- b
````

#### Enter before a list marker opens the paragraph's list

The rest of the text is an item: the paragraph keeps its list, and the item comes first in it.

```buffer
para ┃- x
- a
```

> insertParagraph

```buffer
para

- ┃x
- a
```

#### Outdenting several items of a paragraph's list

Each becomes a paragraph after the one above; a child goes with its item, which now owns it.

```buffer
para
- «a
  - b
- c»
```

> formatOutdent

```buffer
para

«a

- b

c»
```

## Findings of the design experiments

Behaviour the design experiments ([`05-impl.md`](../05-impl.md), its Part VI) and the
reviews of the redesign ([`06-impl.md`](../06-impl.md)) found broken or missing in the first
prototype. Pending where the prototype fails them; the regression cases at the end pass and must keep
passing. Where an expected result depends on a decision still open in `09-redesign.md`, the prose says so.

### Empty tasks and empty items

#### B1: Enter on an empty task leaves the list

A task's checkbox is markup, so `- [ ] ` is an empty item, and Enter on it does what it does on
`- `. Today it makes another task, forever, and trims the space after the old box.

##### Empty task at top level

```buffer
- a
- [ ] ┃
```

> insertParagraph

```buffer
- a

┃◌
```

##### Nested empty task outdents

Nested, it outdents.

```buffer
- a
  - [ ] ┃
```

> insertParagraph

```buffer
- a
- [ ] ┃
```

#### B2: Enter on an empty item with children

Today Enter here is the host's newline: the blank line closes the empty item, its child becomes a
top-level item, and the caret lands on a line in no node. The caret is at the item's text start, so
Enter does what it does there: an empty item above, the caret staying with the item.

```buffer
- ┃
  - a
```

> insertParagraph

```buffer
- 
- ┃
  - a
```

#### B3: Enter at the start of an item that follows paragraph text

The commonest outliner action, inserting above a first child, is refused today. The new empty item
right after `a` is a setext underline to CommonMark, so it exists only as a place. Under
caret-derived places (postimpl1c §7) a place exists only where the caret is, so the caret goes into
the new item. With stored places it could stay with `b`, as Enter at an item's start does elsewhere.

```buffer pending
- a
  - ┃b
```

> insertParagraph

```buffer
- a
  - ┃◌
  - b
```

#### B8: joining into an empty task

An empty task is an empty item. The text below moves up into it with its own checkbox, as it does
into an empty `- `. Today the upper, empty box wins and `[x]` is dropped.

```buffer pending
- [ ] 
- [x] ┃a
```

> deleteContentBackward

```buffer
- ┃[x] a
```

#### B9: emptying a child's text keeps the child

Deleting a child's last character is plain typing, the host's. Today the emptied line `  - ` turns
the parent into a setext heading and the child disappears. With the editing view, the line under
the caret is the empty child the user is in.

##### Emptied child stays a child

```buffer
- a
  - a┃
```

> deleteContentBackward

```buffer
- a
  - ┃◌
```

### Separators

#### B4: a heading past a heading of another level

Refused on purpose, never `encoding-failed`. Recommended default, still open in `09-redesign.md`:
headings move with their section, among siblings of the same level.

```buffer
## ┃H
# H
- a
```

> moveDown

```result
rejected: not-expressible
```

#### B5: Enter in a heading above indented code

The new paragraph needs a blank line before the code, or it takes the code in as a continuation.

```buffer
### H┃2
    - a
```

> insertParagraph

```buffer
### H
┃2

    - a
```

#### B6: moving a paragraph past indented code, a thematic break or a definition

Each of them, right below a paragraph, would join it (as a continuation, a setext underline, or
paragraph text), so a blank line goes between.

##### Past indented code

```buffer
→- a
┃para
```

> moveUp

```buffer
┃para

→- a
```

##### Past a thematic break

```buffer
---
para┃
```

> moveUp

```buffer
para┃

---
```

##### Past a link reference definition

```buffer
[a]: /u
para┃
```

> moveUp

```buffer
para┃

[a]: /u
```

#### Moves that would need a block re-encoded, not a separator

##### Leftover paragraph loses its four spaces

`    code` here is a paragraph (the rest of the paragraph the definition was taken from). Moved above
the definition it would start a document line with four spaces and become indented code. A
paragraph's leading indentation is not part of its text, so the writer may rewrite it, and the
paragraph needs a blank line before the definition, which can't interrupt it.

```buffer pending
[a]: /u
    ┃code
```

> moveUp

```buffer
┃code

[a]: /u
```

#### B7: Delete at the end of a node before an atom

Today the host deletes the line ending, and the quote or code below merges into the node's text.
Backspace from the other side is refused; Delete is refused the same way.

##### Delete before a quote is refused

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

##### Delete before indented code is refused

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

### Escapes

#### Cmd-Backspace leaving a link reference definition

The rest of the line would become a definition at the line start; it is escaped.

```buffer pending
abc ┃[a]: tail
```

> deleteSoftLineBackward

```buffer
┃\[a]: tail
```

#### Cmd-Backspace in a setext title

```buffer pending
abc ┃- x tail
===
```

> deleteSoftLineBackward

```buffer
┃\- x tail
===
```

#### No escape after a task's checkbox

The rest doesn't start the line's text, so it needs no escape.

```buffer
- [ ] abc ┃# x
```

> insertParagraph

```buffer
- [ ] abc
- [ ] ┃# x
```

#### Text other readers would read differently

CommonMark reads one item with two lines here, because `2.` can't interrupt a paragraph; lezer
(CodeMirror, Live Preview) reads a nested item. The escape keeps every reader agreeing.

##### Ordered marker split onto a new line

```buffer pending
1. abc ┃2. x
```

> insertLineBreak

```buffer
1. abc
   ┃2\. x
```

##### Table delimiter row split onto a new line

A delimiter row starts a table in GFM.

```buffer pending
a | b ┃|---|---|
```

> insertLineBreak

```buffer
a | b
┃\|---|---|
```

##### Pasted bullets take the ordered marker

Bullets pasted into an ordered list take the destination's marker (true-outliner's rule), so no
reader takes `2. b` for a continuation of the pasted text.

```clipboard
- x
- y
```

```buffer
1. a┃
2. b
```

> insertFromPaste

```buffer
1. a
2. x
3. y┃
4. b
```

### Indentation

#### Adopted children in a tab-indented document

Children that move with a join are written in the document's unit. Today they are written with
spaces.

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

#### A marker that grows moves its item's other lines

A new item before `9.` renumbers it to `10.`, which is a column wider, so the item's child moves
with its content column. Changes like this lie outside the command's operand: the writer computes
them from the marker's new width, and verification allows them.

```buffer
8. z┃
9. a
   - child
10. b
```

> insertParagraph

```buffer
8. z
9. ┃
10. a
    - child
11. b
```

### Host defaults that break structure

#### Enter in a fenced block inside an item

The new line keeps the item's continuation indentation, so what is typed there stays in the item.
Today the host's newline puts it at column 0, which ends the item.

````buffer pending
- a
  ```
  code┃
  ```
````

> insertParagraph "x"

````buffer
- a
  ```
  code
  x┃
  ```
````

#### Pasting several lines in the middle of an item

The pasted lines continue the item at its content column (the clipboard ends with a line ending,
so `b` starts a line of its own).

```clipboard
x
y
```

```buffer pending
- a┃b
```

> insertFromPaste

```buffer
- ax
  y
  ┃b
```

### Undo and abandoned places

#### An authored blank line survives undo and leaving

A caret-derived place design must not treat every line an undo touched as one it may clean up.
Here the blank line between the paragraphs is the author's. Typing on it and undoing puts the caret
back on it, on a line an edit just touched; leaving must not delete it, or the two paragraphs merge
into one. The caret-places experiment of postimpl1c §7 did exactly that (found by an independent
review): editing evidence may enable the editing view, but removing text needs evidence that the
session wrote it. Passes today, and must keep passing.

```buffer
a
┃
b
```

> "x" undo cursorLineDown

```buffer
a

┃b
```
