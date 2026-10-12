# Duplicate block

Command: `duplicateNode`.

Copies the selected nodes with their subtrees below the originals and places the caret in
the copy. Changed ordered lists renumber.

## BlockDuplicate1

A copy goes below, the caret in the copy.

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

## BlockDuplicate2

Ordered items renumber.

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
