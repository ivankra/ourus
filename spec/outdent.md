# Outdent

Command: `outdent` (Shift-Tab)

Makes an item the next sibling of its parent, carrying its subtree along.
At the top level, only the first item of a list can outdent: it becomes a paragraph, placed as the
`outdent` option says (below). A heading goes one level up, with the headings in its section.

What happens to later siblings is the `outdent` config option:

- [Direct outdent](#direct-outdent) (the default) makes them children of the moved item,
  after its existing children, preserving document order.
- [Logical outdent](#logical-outdent) keeps them with their parent.

## Outdent1

Item becomes next sibling of its parent.

```buffer
- a
  - b┃
```

> outdent

```buffer
- a
- b┃
```

## Outdent2

A top-level item that isn't the first of its list can't outdent.

```buffer
- a
- b┃
```

> outdent

```result
rejected: at-top-level
```

## Outdent3

Tab-nested item outdents.

```buffer
- a
→- b┃
```

> outdent

```buffer
- a
- b┃
```

## Outdent4

Outdent on a heading changes its level and the levels of the headings in its
section with it.

```buffer
## A┃
### B
```

> outdent

```buffer
# A┃
## B
```

## Outdent5

H1 cannot outdent further.

```buffer
# A┃
```

> outdent

```result
rejected: at-h1-bound
```

## Outdent6

Outdent in a loose list stays loose.

Outdenting from the middle of a loose list keeps it loose. (With direct outdent, `c` becomes
`b`'s child.)

```buffer
- a

  - b┃

  - c

- d
```

> outdent

```buffer
- a

- b┃

  - c

- d
```

## Outdent7

An outdent that would leave an empty item where the text can't hold it is refused.

The empty item would end up right after an item's text, where it reads as a setext underline, and
the caret isn't in it to hold it as a placeholder. The command is refused, not `encoding-failed`.

```buffer
- a
  - ┃x
  - 
```

> outdent

```result
rejected: not-expressible
```

## Outdent8

Outdenting several items of a paragraph's list makes each a paragraph.

Each becomes a paragraph after the one above; a child goes with its item, which now owns it.

```buffer
para
- «a
  - b
- c»
```

> outdent

```buffer
para

«a

- b

c»
```

## Direct outdent

Direct outdent keeps the item and its subtree in document order. Later siblings become its
children, after its existing children; their subtrees come along. It is the default
(`outdent: direct`), as in Logseq.

### DirectOutdent1

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> outdent

```buffer
- a
- b┃
  - b1
  - c
- d
```

### DirectOutdent2

At the top level, the first item of a list becomes a paragraph. The rest of its list stays where
it is and becomes the paragraph's list.

```buffer
- a┃
- b
```

> outdent

```buffer
a┃
- b
```

### DirectOutdent3

The item's children stay its children, before the items that followed it. The list is flat: `a1`
is now level with `b`.

```buffer
- a┃
  - a1
- b
```

> outdent

```buffer
a┃
- a1
- b
```

### DirectOutdent4

An item of a paragraph's list leaves the paragraph and becomes a paragraph after it. The items
after it come along, and become the new paragraph's list.

```buffer
para
- a┃
- b
```

> outdent

```buffer
para

a┃
- b
```

## Logical outdent

Logical outdent moves the item and its subtree after its parent. Later siblings keep their
parent, so the moved subtree passes them in document order. Set with `outdent: logical`, which each case
below sets in a config block.

### LogicalOutdent1

```config
outdent: logical
```

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> outdent

```buffer
- a
  - c
- b┃
  - b1
- d
```

### LogicalOutdent2

At the top level, the first item of a list becomes a paragraph. It passes the rest of its list,
which keeps its parent, and follows it, set off by a blank line.

```config
outdent: logical
```

```buffer
- a┃
- b
```

> outdent

```buffer
- b

a┃
```

### LogicalOutdent3

The item's children come along. Below the new paragraph, they become its list.

```config
outdent: logical
```

```buffer
- a┃
  - a1
- b
```

> outdent

```buffer
- b

a┃
- a1
```

### LogicalOutdent4

An item of a paragraph's list leaves the paragraph and becomes a paragraph after it. The items
after it stay with their paragraph, so the new paragraph goes past them.

```config
outdent: logical
```

```buffer
para
- a┃
- b
```

> outdent

```buffer
para
- b

a┃
```
