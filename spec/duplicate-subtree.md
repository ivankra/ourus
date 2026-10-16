
# Duplicate subtree

Command: `duplicateSubtree`.

The rules:

1. **A copy of the selected nodes, with their subtrees, goes right below them** (DuplicateSubtree1).
2. **The caret goes into the copy**, where it was in the original (DuplicateSubtree1).
3. **A list the command touches is renumbered** (DuplicateSubtree2); `deleteSubtree` takes a copy
   back.
4. **Selected nodes are copied together** (DuplicateSubtree3).

## DuplicateSubtree1

A copy goes below, the caret in the copy.

```yaml
rank: common
```

```buffer
- a┃
  - b
- c
```

> duplicateSubtree

```buffer
- a
  - b
- a┃
  - b
- c
```

## DuplicateSubtree2

Ordered items renumber, and deleting the copy gives the list back.

```yaml
rank: common
```

```buffer
1. a┃
2. b
```

> duplicateSubtree

```buffer
1. a
2. a┃
3. b
```

> deleteSubtree

```buffer
1. a┃
2. b
```

## DuplicateSubtree3

Selected nodes are copied together, below the last of them, and the selection goes to the copies.

```yaml
rank: common
```

```buffer
- a
- «b
- c»
- d
```

> duplicateSubtree

```buffer
- a
- b
- c
- «b
- c»
- d
```
