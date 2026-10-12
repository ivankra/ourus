# Backspace

Command: `deleteContentBackward` (Backspace).

Backspace at the start of a node's text joins it to the end of the node above: at the start of an
item, of a continuation line, or of a paragraph after a blank line. On an empty item, the item goes
(Backspace7, Backspace17–17e); its children go to the node above, as in any join (Backspace8). At a
heading's text start, the heading's marks go (Backspace18). Where the join can't be written (into a
code block), it is refused. In the middle of the text, Backspace is the host's.

## Backspace1

Joins text to the item above.

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
before a marker would turn the marker into text of the item above.

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

The caret goes to the end of the text above.

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

## Backspace9

Joins a continuation line.

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

## Backspace10

Back from an empty paragraph's placeholder.

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

## Backspace11

After a blank line, a paragraph joins the item above.

As Backspace at an item's start joins it to the item above: the text joins the node above.

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

The host's Backspace: one line ending goes, and the two paragraphs are one, `b` its second line.

```buffer
a

┃b
```

> deleteContentBackward

```result
notApplicable
```

```buffer
a
┃b
```

## Backspace13

Mid-text backspace left to the host.

In the middle of a node's text, Backspace is the host's.

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

A paragraph's first item joins into the paragraph, as into any node above.

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

## Backspace17

Backspace on an empty first item, with nothing above it, removes the item.

The caret goes to the start of the text below. Workflowy and Logseq remove the first item; Dynalist
removes it and moves the cursor to the note header; Roam refuses.

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

Backspace on an empty first item with children, with nothing above it: the item goes, and its
children take its place, a level up.

The caret goes to the start of the first child's text.

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

Backspace on an empty first child with children: the item goes, its children take its place under
the parent, and the caret goes to the end of the parent's text.

As in any join of a node with children ([Backspace8](#backspace8)), they go to the node above: here
the parent, so into the empty item's place. The first Backspace deletes the child's last character,
which leaves it empty, held by a placeholder (right after `a`'s text, `  - ` alone would be a setext
underline); the second removes it.

Note: most other outliners ignore Backspace here.

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

```buffer
- ┃
```

> deleteContentBackward

```buffer
┃
```

## Backspace18

Backspace at a heading's text start removes its marks: the title becomes a paragraph where it is.

As in Obsidian, and Typora and Notion. The heading's section continues the section above. With
`headingEditing: block` it joins the title into the node above instead ([Backspace18b](#backspace18b)).

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

With `headingEditing: block`, Backspace at a heading's text start joins the title into the node above.

As Logseq and Workflowy merge any block into the one above.

```config
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

## Backspace19

Inside an item, Backspace at the start of a paragraph after a blank line removes the blank line.

The paragraph becomes more lines of the text above: the inverse of Shift-Enter at the start of a
line ([ShiftEnter10](shift-enter.md#shiftenter10)). A second Backspace joins the lines
([Backspace9](#backspace9)).

```buffer
- a

  ┃bc
```

> deleteContentBackward

```buffer
- a
  ┃bc
```
