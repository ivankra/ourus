# Structure commands

Commands an outliner offers beyond the keys: deleting and duplicating subtrees, converting a node's
kind, toggling a task. Each is a tree edit, written by the outline editor and verified like the
others (toggling a task is a local edit of the item's text).

## deleteSubtree

### A node goes with its children

```buffer
- a
- b┃
  - c
- d
```

> deleteSubtree

```buffer
- a┃
- d
```

### Ordered lists renumber

```buffer
1. a
2. b┃
3. c
```

> deleteSubtree

```buffer
1. a┃
2. c
```

### The first node: the caret goes to what follows

A paragraph's list is its children: it goes too.

```buffer
para┃

- x

# H
```

> deleteSubtree

```buffer
┃# H
```

## duplicateNode

### A copy goes below, the caret in the copy

```buffer
- a┃
  - b
- c
```

> duplicateNode

```buffer
- a
  - b
- a┃
  - b
- c
```

### Ordered items renumber

```buffer
1. a┃
2. b
```

> duplicateNode

```buffer
1. a
2. a┃
3. b
```

## toggleTask

### An item becomes a task

```buffer
- buy milk┃
```

> toggleTask

```buffer
- [ ] buy milk┃
```

### A task is checked, then unchecked

```buffer
- [ ] buy┃ milk
```

> toggleTask

```buffer
- [x] buy┃ milk
```

> toggleTask

```buffer
- [ ] buy┃ milk
```

### Not on a paragraph

```buffer
para┃
```

> toggleTask

```result
notApplicable
```

## convertToListItem, convertToParagraph, convertToHeading1 … convertToHeading6

### A paragraph becomes an item

```buffer
first

second┃
```

> convertToListItem

```buffer
first

- second┃
```

### An item becomes a paragraph

```buffer
- a
- b┃
```

> convertToParagraph

```buffer
- a

b┃
```

### A paragraph becomes a heading, and owns what follows

```buffer
Title┃

text
```

> convertToHeading2

```buffer
## Title┃

text
```

### A heading becomes a paragraph again

```buffer
## Title┃

text
```

> convertToParagraph

```buffer
Title┃

text
```

### A heading changes level

```buffer
# A┃
## B
```

> convertToHeading2

```buffer
## A┃
## B
```

### A task can't become a paragraph

```buffer
- [ ] a┃
```

> convertToParagraph

```result
rejected: not-expressible
```

### A paragraph of several lines can't become a heading

```buffer
one┃
two
```

> convertToHeading1

```result
rejected: not-expressible
```
