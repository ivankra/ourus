# Move subtree down

Command: `moveSubtreeDown`, usually bound to Alt-Shift-Down / Alt-Down. Its mirror is
[`moveSubtreeUp`](move-subtree-up.md), whose rules these are, from the other side:

1. **A move of everything in a quote moves the quote** ([quotes.md](quotes.md)); one node of it
   moves as in an item, into and out of quotes too.
2. **Within its parent, the node swaps with the sibling below**, of the same kind as for move
   subtree up (MoveDown1, MoveDown4, MoveDown5, MoveDown16); a heading doesn't swap with a heading
   of another level (MoveDown17).
3. **An item right above a paragraph moves below it**, becoming the first item of its list
   (MoveDown2, MoveDown8, MoveDown13); in an item or a quote, where a paragraph owns no list, an
   item doesn't swap with a paragraph (MoveDown36).
4. **Past a sub-heading, a node goes into its section**, as its first node (MoveDown20).
5. **At its parent's edge it crosses into the parent's next sibling**, as its first child: an item
   into an item (MoveDown7, MoveDown9, MoveDown10); any node but a heading into the next section,
   out of every section that ends there (MoveDown18, MoveDown28); a heading only where it takes
   nothing in (MoveDown19, MoveDown27).
6. **Otherwise it is refused** (`no-next-sibling`, MoveDown3, MoveDown6), as is a move that would
   give another node a new parent (`would-reparent`): a heading past a heading of another level
   (MoveDown17), a heading into a section it would take in (MoveDown19), a paragraph moved right
   above a section's list, which it would own (MoveDown25). A paragraph that doesn't move takes in the list a move leaves right after it
   ([MoveUp35](move-subtree-up.md#moveup35)).
7. **What would run together is set apart** by a blank line (MoveDown26, MoveDown31); a renumbered
   list keeps its children at their content column (MoveDown23, MoveDown30). The caret ends in the
   node's text (MoveDown32), in code on its first line with text, not on a fence (MoveDown34,
   MoveDown37). An item whose first block shares its marker's line (`- - a`, `- > q`)
   keeps its marker on its first line, whichever block is first (MoveDown33,
   [Quote81](quotes.md#quote81)), the block now first at the item's content column (Quote83). A
   paragraph that comes right under an item's text is set apart from it by a blank line, which it
   would otherwise continue (MoveDown34).

Bare Obsidian's Alt-Down moves the caret's line, not its node (see
[move-subtree-up.md](move-subtree-up.md)).

## MoveDown1

In a loose list, the item moves with its subtree, and the blank line stays between the two items.
Bare Obsidian moves the line, and `a1` becomes `b`'s child.

```yaml
tags: core
```

```buffer
- a┃
  - a1

- b
```

> moveSubtreeDown

```buffer
- b

- a┃
  - a1
```

## MoveDown2

An item moves below a paragraph and becomes its first owned list item, keeping its column, as
RemNote without bullets, SiYuan and BlockNote move it. Bare Obsidian moves the line past the blank
line only, so `para` becomes a lazy line of the item.

```yaml
tags: edge free-form
```

```buffer
# H
- a┃

para
```

> moveSubtreeDown

```buffer
# H
para

- a┃
```

## MoveDown3

The last top-level item cannot move down.

```yaml
tags: common
```

```buffer
- a
- b┃
```

> moveSubtreeDown

```yaml
result: rejected no-next-sibling
```

```buffer
- a
- b┃
```

## MoveDown4

Headings move with their sections; move subtree up takes them back.

```yaml
tags: core
```

```buffer
# A┃

text a

# B

text b
```

> moveSubtreeDown

```buffer
# B

text b

# A┃

text a
```

> moveSubtreeUp

```buffer
# A┃

text a

# B

text b
```

## MoveDown5

Paragraphs reorder among themselves.

```yaml
tags: common
```

```buffer
one┃

two
```

> moveSubtreeDown

```buffer
two

one┃
```

## MoveDown6

The last child cannot move down when its parent has no next sibling to receive it.

```yaml
tags: edge
```

```buffer
- a
  - b┃
```

> moveSubtreeDown

```yaml
result: rejected no-next-sibling
```

```buffer
- a
  - b┃
```

## MoveDown7

A last child crosses into its parent's next sibling as its first child. Another move subtree down
then swaps it with the following child there. Its existing subtree comes along both times.

```yaml
tags: core
```

```buffer
- a
→- b┃
→→- b1
- c
→- d
```

> moveSubtreeDown

```buffer
- a
- c
→- b┃
→→- b1
→- d
```

> moveSubtreeDown

```buffer
- a
- c
→- d
→- b┃
→→- b1
```

## MoveDown8

An item leaves the preceding list and becomes the paragraph's first owned list item.
Items already owned by that paragraph follow it (MoveUp7's mirror).

```yaml
tags: common free-form
```

```buffer
- a
- b┃

para

- c
```

> moveSubtreeDown

```buffer
- a

para

- b┃
- c
```


## MoveDown9

Crossing into a branch with no children creates its first child. The moved subtree stays intact,
and moving the move subtree up restores the original tree.

```yaml
tags: common
```

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

> moveSubtreeUp

```buffer
- a
  - c┃
    - c1
- b
```

## MoveDown10

Crossing moves only the last child's subtree. Its earlier siblings stay with their parent;
the destination's existing child and grandchild stay together.

```yaml
tags: common
```

```buffer
- a
  - b
  - c┃
    - c1
- d
  - d1
    - d11
```

> moveSubtreeDown

```buffer
- a
  - b
- d
  - c┃
    - c1
  - d1
    - d11
```

> moveSubtreeDown

```buffer
- a
  - b
- d
  - d1
    - d11
  - c┃
    - c1
```

## MoveDown11

Selected siblings swap downward together. A child included in the selection travels with its
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

> moveSubtreeDown

```buffer
- a
- d
- «b
  - b1
- c»
```

## MoveDown12

A selected run at the end of a parent's children crosses together, preserving order and
subtrees. Unselected children remain with their parent.

```yaml
tags: edge
```

```buffer
- a
  - b
  - «c
    - c1
  - d»
- e
  - e1
```

> moveSubtreeDown

```buffer
- a
  - b
- e
  - «c
    - c1
  - d»
  - e1
```

> moveSubtreeDown

```buffer
- a
  - b
- e
  - e1
  - «c
    - c1
  - d»
```

## MoveDown13

An item with a subtree can move below a paragraph that owns no list yet. The subtree stays under the
item; the paragraph becomes the item's owner. Moving the move subtree up restores the original tree.

```yaml
tags: edge free-form
```

```buffer
- b┃
  - b1

intro
```

> moveSubtreeDown

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

## MoveDown14

A selection over a parent and its child moves the parent with its subtree.

```yaml
tags: common
```

```buffer
- «a
  - b»
- c
```

> moveSubtreeDown

```buffer
- c
- «a
  - b»
```

## MoveDown15

An empty item the text can hold moves like any other.

```yaml
tags: edge
```

```buffer
- a
- ┃
- b
```

> moveSubtreeDown

```buffer
- a
- b
- ┃
```

## MoveDown16

A heading moves with its section, past a heading of the same level.

```yaml
tags: common
```

```buffer
# A┃
- x
# B
- y
```

> moveSubtreeDown

```buffer
# B
- y
# A┃
- x
```

## MoveDown17

A heading doesn't move past a heading of another level: below `# H`, `## H` would be in its section.

```yaml
tags: edge free-form
```

```buffer
## ┃H
# H
- a
```

> moveSubtreeDown

```yaml
result: rejected would-reparent
```

```buffer
## ┃H
# H
- a
```

## MoveDown18

The last item of a heading's section moves down into the next section, as its first item.

```yaml
tags: common
```

```buffer
# Work
- email
- ┃review

# Home
- water
```

> moveSubtreeDown

```buffer
# Work
- email

# Home
- ┃review
- water
```

## MoveDown19

A heading doesn't cross into the next section where it would take in that section's other nodes:
as `B`'s first child, `## s` would have `- x` in its section. Where it takes in nothing, it crosses
(MoveDown27).

```yaml
tags: edge free-form
```

```buffer
# A
## s┃

# B
- x
```

> moveSubtreeDown

```yaml
result: rejected would-reparent
```

```buffer
# A
## s┃

# B
- x
```

## MoveDown20

An item moved down past a sub-heading goes into that sub-heading's section, as its first item.

What follows `## Later` is in its section (MoveUp24's mirror).

```yaml
tags: edge free-form
```

```buffer
# Todo
- one
- two┃

## Later
- three
```

> moveSubtreeDown

```buffer
# Todo
- one

## Later
- two┃
- three
```

## MoveDown21

Fenced code with a blank line moves with its item: the code's blank line is payload, not a gap
(MoveUp13's mirror).

```yaml
tags: edge
```

````buffer
- a┃
  ```
  x

  y
  ```
- b
````

> moveSubtreeDown

````buffer
- b
- a┃
  ```
  x

  y
  ```
````

## MoveDown22

Moving renumbers the items (MoveUp14's mirror).

```yaml
tags: core
```

```buffer
1. a┃
2. b
```

> moveSubtreeDown

```buffer
1. b
2. a┃
```

## MoveDown23

Renumbering past 9 widens the marker; the moved item's children follow its content column
(MoveUp15's mirror).

```yaml
tags: rare
```

```buffer
9. a┃
   - x
10. b
```

> moveSubtreeDown

```buffer
9. b
10. a┃
    - x
```

## MoveDown24

A paragraph moves with its list (MoveUp17's mirror).

```yaml
tags: common
```

```buffer
para┃
- a

last
```

> moveSubtreeDown

```buffer
last

para┃
- a
```

## MoveDown25

A paragraph doesn't cross into a section that starts with a list: right above it, the paragraph
would own the section's list (as MoveDown19 for a heading).

```yaml
tags: edge free-form
```

```buffer
# A
para┃

# B
- x
```

> moveSubtreeDown

```yaml
result: rejected would-reparent
```

```buffer
# A
para┃

# B
- x
```

## MoveDown26

An item moved down into a section that starts with a paragraph is set apart from it: right below
the item, the paragraph would continue its text.

```yaml
tags: edge
```

```buffer
# Work
- review┃

# Home
para
```

> moveSubtreeDown

```buffer
# Work

# Home
- review┃

para
```

## MoveDown27

A sub-heading last in its section moves down into the next section, as its first sub-heading,
where it takes in nothing (MoveUp26's mirror). The section's end gap stays at its end.

```yaml
tags: edge
```

```buffer
# A
## s┃

# B
## t
```

> moveSubtreeDown

```buffer
# A

# B
## s┃
## t
```

## MoveDown28

From the end of a sub-heading's section, a node moves into the next section, out of both sections
that end there: the way back from [MoveUp23](move-subtree-up.md#moveup23).

```yaml
tags: edge free-form
```

```buffer
# A
## sub
- s1

┃para

# B
```

> moveSubtreeDown

```buffer
# A
## sub
- s1

# B
┃para
```

## MoveDown29

A paragraph owns consecutive lists: an ordered and a bullet list right after it are two lists to
CommonMark, both its children, and both move with it.

```yaml
tags: rare
```

```buffer
pa┃ra
1. a
- b

next
```

> moveSubtreeDown

```buffer
next

pa┃ra
1. a
- b
```

## MoveDown30

Renumbering below 10 narrows the marker, and the children follow the new content column.

```yaml
tags: rare
```

```buffer
9. a┃
10. b
    - x
```

> moveSubtreeDown

```buffer
9. b
   - x
10. a┃
```

## MoveDown31

A paragraph moved down past a thematic break keeps the blank line that sets it apart: right below
a paragraph, `---` would be a setext underline (MoveUp19's mirror).

```yaml
tags: rare
```

```buffer
para┃

---
```

> moveSubtreeDown

```buffer
---

para┃
```

## MoveDown32

From before the marker, the item moves and the caret ends in its text (MoveUp34's mirror).

```yaml
tags: rare
```

```buffer
┃- a
- b
```

> moveSubtreeDown

```buffer
- b
- ┃a
```

## MoveDown33

An item whose first block is a list: its first item moved down, the next comes up onto the outer
item's marker line, the outer marker staying where it is; back up, the same.

```yaml
tags: edge
```

```buffer
- - ┃a
  - b
```

> moveSubtreeDown

```buffer
- - b
  - ┃a
```

> moveSubtreeUp

```buffer
- - ┃a
  - b
```

## MoveDown34

Code moved below a paragraph of its item: the paragraph comes right under the item's text, which it
would continue, so a blank line sets it apart. Back up, the blank line stays: it is the item's gap.
The caret goes into the code, where typing can't break its fence.

```yaml
tags: rare markup-fence
```

````buffer
- a
  ┃```
  code
  ```
  x
````

> moveSubtreeDown

````buffer
- a

  x
  ```
  ┃code
  ```
````

> moveSubtreeUp

````buffer
- a

  ```
  ┃code
  ```
  x
````

## MoveDown35

The first item of an ordered list right under an item's text moved down: the item below, now first,
is renumbered from the list's start, which it needs to interrupt the text above (`2.` can't), and the
moved one counts on; back up, the same, as Obsidian's Outliner renumbers them. Bare Obsidian's list
starts from 2 after the move, which can't interrupt `a`: its items become `a`'s text.

```yaml
tags: rare
```

```buffer
1. a
   1. ┃x
   2. b
```

> moveSubtreeDown

```buffer
1. a
   1. b
   2. ┃x
```

> moveSubtreeUp

```buffer
1. a
   1. ┃x
   2. b
```

## MoveDown36

In an item, a paragraph owns no list: a child item above a paragraph of the item would have to swap
with it, and items swap only with items. Refused.

```yaml
tags: edge free-form
```

```buffer
- item
  - ┃a

  para
```

> moveSubtreeDown

```yaml
result: rejected not-expressible
```

```buffer
- item
  - ┃a

  para
```

## MoveDown37

An item whose text is fenced code, its first code line blank, moved with the caret on its fence: the
caret goes to the first code line with text, as on a blank one typing at its start would end the item.

```yaml
tags: edge markup-fence
```

````buffer
- ┃```

  x
  ```
- b
````

> moveSubtreeDown

````buffer
- b
- ```

  ┃x
  ```
````

## MoveDown38

From the blank line after a list's last item, the item moves down past the paragraph, and the caret
goes with it, into its text. Left on the blank line, which is now the gap of the item above, it
would have a second press move that item. The blank line ends the list and stays after it
([MoveDown39](#movedown39)).

```yaml
tags: rare free-form
```

```buffer
- a
- b
┃
para
```

> moveSubtreeDown

```buffer
- a

para
- b┃
```

## MoveDown39

A list's last item moved down past the paragraph after the list: the blank lines that end the list
stay at its end, after the item now last, and the item becomes the paragraph's list, right under its
text ([gaps.md](gaps.md)): written on both sides, they would double. Up again, it comes back.

```yaml
tags: rare free-form
```

```buffer
- a
- b┃



para
```

> moveSubtreeDown

```buffer
- a



para
- b┃
```

> moveSubtreeUp

```buffer
- a
- b┃



para
```
