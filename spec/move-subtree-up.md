# Move subtree up

Command: `moveSubtreeUp`, usually bound to Alt-Shift-Up / Alt-Up. Its mirror is
[`moveSubtreeDown`](move-subtree-down.md).

A move takes the selected nodes (the topmost ones the selection touches, contiguous siblings of one
kind) with their subtrees and their trailing gaps ([gaps.md](gaps.md)): a node keeps its kind and
its own indentation, and lands where the text puts it. The rules, in order; the first that applies
wins:

1. **A move of everything in a quote moves the quote** ([quotes.md](quotes.md)); one node of it
   moves as in an item, into and out of quotes too.
2. **Within its parent, the node swaps with the sibling above**: items with items, paragraphs and
   other blocks among themselves, a heading (with its section) with a heading of its level, a quote
   with any node but a heading (MoveUp1, MoveUp3, MoveUp4, MoveUp16).
3. **The first item of a paragraph's list moves above the paragraph**, joining the list above where
   there is one (MoveUp7, MoveUp12, MoveUp21).
4. **At its parent's edge it crosses into the parent's previous sibling**, as its last child: an
   item into an item or a paragraph's list (MoveUp6, MoveUp8, MoveUp9); any node but a heading
   into the section above, at the end of the text there, inside its sub-headings (MoveUp22,
   MoveUp23); out of a sub-heading's section into the enclosing section's own nodes, before the
   sub-heading (MoveUp24), and above the document's first heading (MoveUp29); a heading into the
   section above, at its end, where it takes nothing in (MoveUp26).
5. **Otherwise it is refused** (`no-previous-sibling`, MoveUp2, MoveUp5), or where it would give
   another node a new parent: a heading past a heading of another level or past a node it would take
   into its section (`would-reparent`, MoveUp28, MoveUp33), or a node past an unclosed fence, which
   would take it in as code (`not-expressible`, MoveUp41). A paragraph that doesn't move takes
   in the list a move leaves right after it, as the text reads it (MoveUp35).
6. **What would run together is set apart** by a blank line (MoveUp18, MoveUp19, MoveUp20,
   MoveUp36); a paragraph's leading indentation, not part of its text, is rewritten where it would
   make code (MoveUp30); a renumbered list keeps its children at their content column (MoveUp15).
   The caret ends in the node's text (MoveUp34); in a math block, after its opening `$$` and before
   its closing one, wherever that is (MoveUp37, MoveUp38).

[Move subtree down](move-subtree-down.md) mirrors each case and takes each move back.

Bare Obsidian's Alt-Up moves the caret's line, not its node: an item's children stay behind (and
become the next item's), a heading leaves its section, a paragraph moved next to another joins it.
Obsidian's Outliner plugin moves an item with its children, as the outliners and ourus do.

## MoveUp1

Moving up carries the subtree; move subtree down takes it back.

Bare Obsidian moves the line, and `b1` becomes `a`'s child.

```yaml
tags: core
```

```buffer
- a
- b┃
  - b1
- c
```

> moveSubtreeUp

```buffer
- b┃
  - b1
- a
- c
```

> moveSubtreeDown

```buffer
- a
- b┃
  - b1
- c
```

## MoveUp2

The first top-level item cannot move up.

```yaml
tags: common
```

```buffer
- a┃
- b
```

> moveSubtreeUp

```yaml
result: rejected no-previous-sibling
```

```buffer
- a┃
- b
```

## MoveUp3

Headings move with their sections.

Bare Obsidian moves only the heading's line, which would leave `text b` under `# A`.

```yaml
tags: core
```

```buffer
# A

text a

# B┃

text b
```

> moveSubtreeUp

```buffer
# B┃

text b

# A

text a
```

## MoveUp4

Paragraphs and other leaf blocks reorder among themselves.

The blank line between them stays; bare Obsidian moves the line, which runs into `one` as one
paragraph.

```yaml
tags: core
```

```buffer
one

two┃
```

> moveSubtreeUp

```buffer
two┃

one
```

## MoveUp5

The first child cannot move up when its parent has no previous sibling to receive it.

```yaml
tags: edge
```

```buffer
- a
  - b┃
```

> moveSubtreeUp

```yaml
result: rejected no-previous-sibling
```

```buffer
- a
  - b┃
```

## MoveUp6

The first child crosses into its parent's previous sibling as its last child. Another move subtree
up then swaps it with the preceding child there.

```yaml
tags: core
```

```buffer
- a
→- b
- c
→- d┃
```

> moveSubtreeUp

```buffer
- a
→- b
→- d┃
- c
```

> moveSubtreeUp

```buffer
- a
→- d┃
→- b
- c
```

## MoveUp7

The first list item owned by a paragraph moves above the paragraph and joins the preceding list.
The remaining items stay with the paragraph.

`b` keeps its column, so it joins `a`'s list rather than nesting under `a`, as RemNote without
bullets and BlockNote move it; SiYuan keeps it in the paragraph's list.

```yaml
tags: common
```

```buffer
- a

para

- b┃
- c
```

> moveSubtreeUp

```buffer
- a
- b┃

para

- c
```

## MoveUp8

Crossing into a branch with no children creates its first child. The moved subtree stays intact,
and move subtree down restores the original tree.

Bare Obsidian leaves `c1` behind under `b`.

```yaml
tags: common
```

```buffer
- a
- b
  - c┃
    - c1
```

> moveSubtreeUp

```buffer
- a
  - c┃
    - c1
- b
```

> moveSubtreeDown

```buffer
- a
- b
  - c┃
    - c1
```

## MoveUp9

Crossing moves only the first child's subtree. Its later siblings stay with their parent;
the destination's existing child and grandchild stay together.

```yaml
tags: common
```

```buffer
- a
  - a1
    - a11
- b
  - c┃
    - c1
  - d
```

> moveSubtreeUp

```buffer
- a
  - a1
    - a11
  - c┃
    - c1
- b
  - d
```

## MoveUp10

Selected siblings swap upward together. A child included in the selection travels with its
parent once, and the selection stays on the moved text.

```yaml
tags: common
```

```buffer
- a
- «b
  - b1
- c»
- d
```

> moveSubtreeUp

```buffer
- «b
  - b1
- c»
- a
- d
```

## MoveUp11

A selected run at the start of a parent's children crosses together, preserving order and
subtrees. Unselected children remain with their parent.

```yaml
tags: edge
```

```buffer
- a
  - a1
- b
  - «c
    - c1
  - d»
  - e
```

> moveSubtreeUp

```buffer
- a
  - a1
  - «c
    - c1
  - d»
- b
  - e
```

## MoveUp12

A paragraph's only list item can move above it without a preceding list to join. Its subtree
comes along; the paragraph remains below, with a blank line keeping it outside the item.

```yaml
tags: edge free-form
```

```buffer
intro

- b┃
  - b1
```

> moveSubtreeUp

```buffer
- b┃
  - b1

intro
```

## MoveUp13

Fenced code with a blank line moves with its item: the code's blank line is payload, not a gap.

```yaml
tags: edge
```

````buffer
- a
- b┃
  ```
  x

  y
  ```
````

> moveSubtreeUp

````buffer
- b┃
  ```
  x

  y
  ```
- a
````

## MoveUp14

Moving renumbers the items.

```yaml
tags: core
```

```buffer
1. a
2. b┃
```

> moveSubtreeUp

```buffer
1. b┃
2. a
```

## MoveUp15

Renumbering past 9 widens the marker, and the children follow the new content column.

```yaml
tags: rare
```

```buffer
9. a
   - x
10. b┃
```

> moveSubtreeUp

```buffer
9. b┃
10. a
    - x
```

## MoveUp16

Heading moves with its subheadings.

```yaml
tags: common
```

```buffer
# A
## a1
# B┃
## b1
```

> moveSubtreeUp

```buffer
# B┃
## b1
# A
## a1
```

## MoveUp17

A paragraph moves with its list.

```yaml
tags: common
```

```buffer
first

para┃
- a
```

> moveSubtreeUp

```buffer
para┃
- a

first
```

## MoveUp18

A paragraph moved up past indented code (`→- a`, a tab reaching column four) is set apart from it:
right below a paragraph, it would be a continuation line.

```yaml
tags: rare
```

```buffer
→- a
┃para
```

> moveSubtreeUp

```buffer
┃para

→- a
```

## MoveUp19

A paragraph moved up past a thematic break is set apart from it: right below a paragraph, `---`
would be a setext underline.

```yaml
tags: rare
```

```buffer
---
para┃
```

> moveSubtreeUp

```buffer
para┃

---
```

## MoveUp20

A paragraph moved up past a link reference definition is set apart from it: right below a
paragraph, the definition would be paragraph text.

```yaml
tags: rare
```

```buffer
[a]: /u
para┃
```

> moveSubtreeUp

```buffer
para┃

[a]: /u
```

## MoveUp21

The first item of a paragraph's list moves above the paragraph; the items after it stay with the
paragraph. With no list above to join, a blank line sets the item off from the paragraph. Back down,
the outline comes back, the blank line staying above the list, as a paragraph's list may have one
([MoveUp36](#moveup36)).

```yaml
tags: edge
```

```buffer
para
- a┃
- b
```

> moveSubtreeUp

```buffer
- a┃

para
- b
```

> moveSubtreeDown

```buffer
para
- a┃
- b
```

## MoveUp22

The first item of a heading's section moves up into the section above, as its last item, as a first
child crosses in a list. The section's end gap stays at its end.

```yaml
tags: common
```

```buffer
# Work
- email

# Home
- ┃review
- water
```

> moveSubtreeUp

```buffer
# Work
- email
- ┃review

# Home
- water
```

## MoveUp23

Moving up into a section that ends with a sub-heading, the node lands at the end of that
sub-heading's section, where the text above it ends. Move subtree down takes it back
([MoveDown28](move-subtree-down.md#movedown28)).

```yaml
tags: edge
```

```buffer
# A
## sub
- s1

# B
┃para
```

> moveSubtreeUp

```buffer
# A
## sub
- s1

┃para

# B
```

## MoveUp24

The first item of a sub-heading's section moves up into the enclosing section, before the
sub-heading: it keeps its column and joins `one`'s list, rather than nesting under `one` as in a
list, as RemNote without bullets and BlockNote move it; SiYuan does nothing.

```yaml
tags: edge free-form
```

```buffer
# Todo
- one

## Later
- ┃two
- three
```

> moveSubtreeUp

```buffer
# Todo
- one
- ┃two

## Later
- three
```

## MoveUp25

In a loose list, the item moves with its subtree and the blank line stays between the two items
(MoveDown1's mirror).

```yaml
tags: common
```

```buffer
- a

- b┃
  - b1
```

> moveSubtreeUp

```buffer
- b┃
  - b1

- a
```

## MoveUp26

A sub-heading first in its section crosses up into the section above, as its last node, with its
own section: there it takes nothing in. Move subtree down takes it back.

```yaml
tags: edge
```

```buffer
# A
- x

# B
## s┃
- y
```

> moveSubtreeUp

```buffer
# A
- x
## s┃
- y

# B
```

> moveSubtreeDown

```buffer
# A
- x

# B

## s┃
- y
```

## MoveUp27

Into a section that ends with a paragraph, an item lands under it, as the paragraph's list item;
move subtree down takes it back out, into the next section.

```yaml
tags: edge free-form
```

```buffer
# Work
para

# Home
- ┃review
```

> moveSubtreeUp

```buffer
# Work
para
- ┃review

# Home
```

> moveSubtreeDown

```buffer
# Work
para

# Home

- ┃review
```

## MoveUp28

A heading doesn't move past a heading of another level: above `## X`, `# A` would take it into its
section (MoveDown17's mirror).

```yaml
tags: edge free-form
```

```buffer
## X
# A┃
- a
```

> moveSubtreeUp

```yaml
result: rejected would-reparent
```

```buffer
## X
# A┃
- a
```

## MoveUp29

The first node of the document's first section moves up above its heading, into the text before
it, as a first item leaves a sub-heading's section in MoveUp24.

```yaml
tags: edge free-form
```

```buffer
# H
- ┃a
- b
```

> moveSubtreeUp

```buffer
- ┃a
# H
- b
```

## MoveUp30

`    code` is a paragraph (what was left of a paragraph after its definition). Moved above the
definition, its four spaces would make it indented code; a paragraph's leading indentation isn't
its text, so it goes, and a blank line sets the paragraph off from the definition. Bare Obsidian
moves the line as it is, indented code above the definition.

```yaml
tags: rare
```

```buffer
[a]: /u
    ┃code
```

> moveSubtreeUp

```buffer
┃code

[a]: /u
```

## MoveUp31

A selection over a parent and its child moves the parent with its subtree (MoveDown14's mirror).

```yaml
tags: common
```

```buffer
- c
- «a
  - b»
```

> moveSubtreeUp

```buffer
- «a
  - b»
- c
```

## MoveUp32

An empty item the text can hold moves like any other (MoveDown15's mirror).

```yaml
tags: edge
```

```buffer
- a
- ┃
- b
```

> moveSubtreeUp

```buffer
- ┃
- a
- b
```

## MoveUp33

A heading doesn't move up past a node of another kind: above `- a`, `## H` would take it into its
section.

```yaml
tags: edge free-form
```

```buffer
# H
- a
## ┃H
```

> moveSubtreeUp

```yaml
result: rejected would-reparent
```

```buffer
# H
- a
## ┃H
```

## MoveUp34

From before the marker, the item moves and the caret ends in its text.

```yaml
tags: rare
```

```buffer
- a
┃- b
```

> moveSubtreeUp

```buffer
- ┃b
- a
```

## MoveUp35

A quote moving up leaves the paragraph right above the list, and the paragraph takes the list in, as
the text reads it: the list renders as before. A paragraph that moves above a list takes it in too
([MoveDown25](move-subtree-down.md#movedown25)). Down again, the quote passes the paragraph and its
list.

```yaml
tags: edge free-form
quotes: container
```

```buffer
para
> q┃
- a
```

> moveSubtreeUp

```buffer
> q┃

para
- a
```

> moveSubtreeDown

```buffer
para
- a

> q┃
```

## MoveUp36

The first item of a paragraph's list moved up out of it, above the paragraph: the next list, ordered
from 2, comes right under the paragraph, which it can't interrupt and would continue; a blank line
keeps it a list. Back down, the outline comes back, the blank line the paragraph needed above it
staying, as a paragraph's list may have one.

```yaml
tags: edge free-form
```

```buffer
para
┃- i
2. m
```

> moveSubtreeUp

```buffer
- ┃i

para

2. m
```

> moveSubtreeDown

```buffer
para

- ┃i

2. m
```

## MoveUp37

An item whose text is a math block's opening `$$`, the block unclosed, moved with the caret before
it: the caret goes after the `$$`, where typing is the block's, not before it, where it would make
the text a paragraph.

```yaml
tags: edge markup-fence
flavor: obsidian
```

```buffer
- a
- ┃$$
```

> moveSubtreeUp

```buffer
- $$┃
- a
```

## MoveUp38

A math block closed by text and `$$` on one line (`x$$`), moved with the caret after that `$$`: the
caret goes before it, where typing is more of the formula; after it, the block wouldn't close there.

```yaml
tags: edge markup-fence
flavor: obsidian
```

```buffer
- b
- $$
  x$$┃
  tail
```

> moveSubtreeUp

```buffer
- $$
  x┃$$
  tail
- b
```


## MoveUp39

From a trailing blank line, the last node moves, and the caret goes with it, into its text: the
blank line ends the document and stays there, the gap of the node now last, where the caret would
make a second press move that node.

```yaml
tags: rare
```

```buffer
- one
- two
┃
```

> moveSubtreeUp

```buffer
- two┃
- one

```

## MoveUp40

A move keeps a continuation line's extra leading space as it rewrites the line's indentation, as
indent does ([Indent33](indent.md#indent33)).

```yaml
tags: rare
```

```buffer
- x
  - y
  - a┃
     b
```

> moveSubtreeUp

```buffer
- x
  - a┃
     b
  - y
```

## MoveUp41

An unclosed fence reads to the end of its container: moved above the paragraph, it would take the
paragraph in as code. Refused.

```yaml
tags: rare markup-fence
closeBackticks: none
```

````buffer
intro

```┃
code
````

> moveSubtreeUp

```yaml
result: rejected not-expressible
```

````buffer
intro

```┃
code
````

## MoveUp42

The only block of an item with no text of its own (`- > q`) moves with its item, as one of a
quote with no title moves with the quote.

```yaml
tags: edge
```

```buffer
- a
- > q┃
```

> moveSubtreeUp

```buffer
- > q┃
- a
```
