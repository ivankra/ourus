# Move block down

Command: `moveBlockDown`, usually bound to Alt-Shift-Down / Alt-Down.

Block down moves a node later, carrying its subtree and owned gaps. Within one parent it swaps
with the next sibling. A last child can cross into the next sibling of its parent, becoming
that node's first child. A list item immediately above a paragraph can move below the paragraph,
becoming its first owned list item.
Gaps at the end of a scope stay at that scope's end (see [gaps.md](gaps.md)).

## BlockDown1

The blank line between the two items stays between them, so the list stays loose.

```buffer
- a┃
  - a1

- b
```

> moveBlockDown

```buffer
- b

- a┃
  - a1
```

## BlockDown2

An item moves below a paragraph and becomes its first owned list item.

```buffer
# H
- a┃

para
```

> moveBlockDown

```buffer
# H
para

- a┃
```

## BlockDown3

The last top-level item cannot move down.

```buffer
- a
- b┃
```

> moveBlockDown

```result
rejected: no-next-sibling
```

## BlockDown4

Headings move with their sections.

```buffer
# A┃

text a

# B

text b
```

> moveBlockDown

```buffer
# B

text b

# A┃

text a
```

## BlockDown5

Paragraphs reorder among themselves.

```buffer
one┃

two
```

> moveBlockDown

```buffer
two

one┃
```

## BlockDown6

The last child cannot move down when its parent has no next sibling to receive it.

```buffer
- a
  - b┃
```

> moveBlockDown

```result
rejected: no-next-sibling
```

## BlockDown7

A last child crosses into its parent's next sibling as its first child. Another block down
then swaps it with the following child there. Its existing subtree comes along both times.

```buffer
- a
→- b┃
→→- b1
- c
→- d
```

> moveBlockDown

```buffer
- a
- c
→- b┃
→→- b1
→- d
```

> moveBlockDown

```buffer
- a
- c
→- d
→- b┃
→→- b1
```

## BlockDown8

An item leaves the preceding list and becomes the paragraph's first owned list item.
Items already owned by that paragraph follow it.

```buffer
- a
- b┃

para

- c
```

> moveBlockDown

```buffer
- a

para

- b┃
- c
```


## BlockDown9

Crossing into a branch with no children creates its first child. The moved subtree stays intact,
and moving the block up restores the original tree.

```buffer
- a
  - c┃
    - c1
- b
```

> moveBlockDown

```buffer
- a
- b
  - c┃
    - c1
```

> moveBlockUp

```buffer
- a
  - c┃
    - c1
- b
```

## BlockDown10

Crossing moves only the last child's subtree. Its earlier siblings stay with their parent;
the destination's existing child and grandchild stay together.

```buffer
- a
  - b
  - c┃
    - c1
- d
  - d1
    - d11
```

> moveBlockDown

```buffer
- a
  - b
- d
  - c┃
    - c1
  - d1
    - d11
```

> moveBlockDown

```buffer
- a
  - b
- d
  - d1
    - d11
  - c┃
    - c1
```

## BlockDown11

Selected siblings swap downward together. A child included in the selection travels with its
parent once, and the selection stays on the moved text.

```buffer
- a
- «b
  - b1
- c»
- d
```

> moveBlockDown

```buffer
- a
- d
- «b
  - b1
- c»
```

## BlockDown12

A selected run at the end of a parent's children crosses together, preserving order and
subtrees. Unselected children remain with their parent.

```buffer
- a
  - b
  - «c
    - c1
  - d»
- e
  - e1
```

> moveBlockDown

```buffer
- a
  - b
- e
  - «c
    - c1
  - d»
  - e1
```

> moveBlockDown

```buffer
- a
  - b
- e
  - e1
  - «c
    - c1
  - d»
```

## BlockDown13

An item with a subtree can move below a paragraph that owns no list yet. The subtree stays
under the item; the paragraph becomes the item's owner. Moving the block up restores the original tree.

```buffer
- b┃
  - b1

intro
```

> moveBlockDown

```buffer
intro

- b┃
  - b1
```

> moveBlockUp

```buffer
- b┃
  - b1

intro
```

## BlockDown14

Selected parent moves with its subtree.

A selection over a parent and its child moves the parent with its subtree.

```buffer
- «a
  - b»
- c
```

> moveBlockDown

```buffer
- c
- «a
  - b»
```

## BlockDown15

An empty item the text can hold moves like any other.

```buffer
- a
- ┃
- b
```

> moveBlockDown

```buffer
- a
- b
- ┃
```

## BlockDown16

A heading moves with its section, past a heading of the same level.

```buffer
# A┃
- x
# B
- y
```

> moveBlockDown

```buffer
# B
- y
# A┃
- x
```

## BlockDown17

A heading doesn't move past a heading of another level.

Refused on purpose: headings move among siblings of the same level.

```buffer
## ┃H
# H
- a
```

> moveBlockDown

```result
rejected: not-expressible
```

## BlockDown18

The last item of a heading's section moves down into the next section, as its first item.

```buffer
# Work
- email
- ┃review

# Home
- water
```

> moveBlockDown

```buffer
# Work
- email

# Home
- ┃review
- water
```

## BlockDown19

A heading doesn't cross into the next section: as its first child, it would take in that section's
other nodes.

```buffer
# A
## s┃

# B
- x
```

> moveBlockDown

```result
rejected: no-next-sibling
```

## BlockDown20

An item moved down past a sub-heading goes into that sub-heading's section, as its first item.

```buffer
# Todo
- one
- two┃

## Later
- three
```

> moveBlockDown

```buffer
# Todo
- one

## Later
- two┃
- three
```
