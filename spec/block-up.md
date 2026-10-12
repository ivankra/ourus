# Move block up

Command: `moveBlockUp`, usually bound to Alt-Shift-Up / Alt-Up.

Block up moves a node earlier, carrying its subtree and owned gaps. Within one parent it swaps
with the previous sibling. A first child can cross into the previous sibling of its parent,
becoming that node's last child. The first list item owned by a paragraph can move above the
paragraph, joining the preceding list where there is one.
Gaps at the end of a scope stay at that scope's end (see [gaps.md](gaps.md)).

## BlockUp1

Moving up carries the subtree.

```buffer
- a
- b┃
  - b1
- c
```

> moveBlockUp

```buffer
- b┃
  - b1
- a
- c
```

## BlockUp2

The first top-level item cannot move up.

```buffer
- a┃
- b
```

> moveBlockUp

```result
rejected: no-previous-sibling
```

## BlockUp3

Headings move with their sections.

```buffer
# A

text a

# B┃

text b
```

> moveBlockUp

```buffer
# B┃

text b

# A

text a
```

## BlockUp4

Paragraphs and other leaf blocks reorder among themselves.

```buffer
one

two┃
```

> moveBlockUp

```buffer
two┃

one
```

## BlockUp5

The first child cannot move up when its parent has no previous sibling to receive it.

```buffer
- a
  - b┃
```

> moveBlockUp

```result
rejected: no-previous-sibling
```

## BlockUp6

The first child crosses into its parent's previous sibling as its last child. Another block up
then swaps it with the preceding child there.

```buffer
- a
→- b
- c
→- d┃
```

> moveBlockUp

```buffer
- a
→- b
→- d┃
- c
```

> moveBlockUp

```buffer
- a
→- d┃
→- b
- c
```

## BlockUp7

The first list item owned by a paragraph moves above the paragraph and joins the preceding list.
The remaining items stay with the paragraph.

```buffer
- a

para

- b┃
- c
```

> moveBlockUp

```buffer
- a
- b┃

para

- c
```

## BlockUp8

Crossing into a branch with no children creates its first child. The moved subtree stays intact,
and block down restores the original tree.

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

> moveBlockDown

```buffer
- a
- b
  - c┃
    - c1
```

## BlockUp9

Crossing moves only the first child's subtree. Its later siblings stay with their parent;
the destination's existing child and grandchild stay together.

```buffer
- a
  - a1
    - a11
- b
  - c┃
    - c1
  - d
```

> moveBlockUp

```buffer
- a
  - a1
    - a11
  - c┃
    - c1
- b
  - d
```

## BlockUp10

Selected siblings swap upward together. A child included in the selection travels with its
parent once, and the selection stays on the moved text.

```buffer
- a
- «b
  - b1
- c»
- d
```

> moveBlockUp

```buffer
- «b
  - b1
- c»
- a
- d
```

## BlockUp11

A selected run at the start of a parent's children crosses together, preserving order and
subtrees. Unselected children remain with their parent.

```buffer
- a
  - a1
- b
  - «c
    - c1
  - d»
  - e
```

> moveBlockUp

```buffer
- a
  - a1
  - «c
    - c1
  - d»
- b
  - e
```

## BlockUp12

A paragraph's only list item can move above it without a preceding list to join. Its subtree
comes along; the paragraph remains below, with a blank line keeping it outside the item.

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

## BlockUp13

Fenced code with a blank line moves.

A fenced code block moves and reindents with its item; its own relative indentation and
blank lines are payload.

````buffer
- a
- b┃
  ```
  x

  y
  ```
````

> moveBlockUp

````buffer
- b┃
  ```
  x

  y
  ```
- a
````

## BlockUp14

Moving renumbers the items.

```buffer
1. a
2. b┃
```

> moveBlockUp

```buffer
1. b┃
2. a
```

## BlockUp15

Renumbering past 9 widens the marker.

Renumbering past 9 widens the marker; children have to follow the content column.

```buffer
9. a
   - x
10. b┃
```

> moveBlockUp

```buffer
9. b┃
10. a
    - x
```

## BlockUp16

Heading moves with its subheadings.

```buffer
# A
## a1
# B┃
## b1
```

> moveBlockUp

```buffer
# B┃
## b1
# A
## a1
```

## BlockUp17

A paragraph moves with its list.

```buffer
first

para┃
- a
```

> moveBlockUp

```buffer
para┃
- a

first
```

## BlockUp18

A paragraph moved up past indented code is set apart from it.

Indented code right below a paragraph would join it as a continuation, so a blank line goes
between.

```buffer
→- a
┃para
```

> moveBlockUp

```buffer
┃para

→- a
```

## BlockUp19

A paragraph moved up past a thematic break is set apart from it.

Right below a paragraph, `---` would be a setext underline.

```buffer
---
para┃
```

> moveBlockUp

```buffer
para┃

---
```

## BlockUp20

A paragraph moved up past a link reference definition is set apart from it.

Right below a paragraph, the definition would be paragraph text.

```buffer
[a]: /u
para┃
```

> moveBlockUp

```buffer
para┃

[a]: /u
```

## BlockUp21

The first item of a paragraph's list moves above the paragraph; the items after it stay with the
paragraph.

With no list above to join, the item is set off from the paragraph by a blank line.

```buffer
para
- a┃
- b
```

> moveBlockUp

```buffer
- a┃

para
- b
```
