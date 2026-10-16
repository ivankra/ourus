
# Delete subtree

Command: `deleteSubtree`.

The rules:

1. **The selected nodes go, with their subtrees**: a paragraph with the list it owns, a heading with
   its section (DeleteSubtree1, DeleteSubtree3).
2. **The caret goes to the end of the text above**, or, when the first node goes, to the start of
   the text that follows, after its marker (DeleteSubtree1, DeleteSubtree3, DeleteSubtree4).
3. **A list the command touches is renumbered** (DeleteSubtree2).
4. **Selected nodes go together** (DeleteSubtree5).
5. **The document's only nodes leave it empty** (DeleteSubtree6).

## DeleteSubtree1

A node goes with its children.

```yaml
rank: common
```

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

## DeleteSubtree2

Ordered lists renumber.

```yaml
rank: common
```

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

## DeleteSubtree3

The first node: the caret goes to what follows.

A paragraph's list is its children: it goes too.

```yaml
rank: edge
```

```buffer
para┃

- x

# H
```

> deleteSubtree

```buffer
# ┃H
```


## DeleteSubtree4

The first item: the caret goes to the next item's text, after its marker, where typing extends it.

```yaml
rank: common
```

```buffer
- a┃
  - a1
- [ ] b
```

> deleteSubtree

```buffer
- [ ] ┃b
```

## DeleteSubtree5

Selected nodes go together; the caret goes to the end of the text before them.

```yaml
rank: common
```

```buffer
- a
- «b
- c»
- d
```

> deleteSubtree

```buffer
- a┃
- d
```

## DeleteSubtree6

The document's only node goes, and the document is empty; typed text is then its first paragraph
(an empty buffer has no drawing).

```yaml
rank: rare
```

```buffer
- a┃
  - b
```

> deleteSubtree "x"

```buffer
x┃
```
