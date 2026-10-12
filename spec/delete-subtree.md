# Delete block

Current command: `deleteSubtree`.

Deletes the selected nodes with their subtrees. The caret goes to the end of the preceding text,
or, when the first node is deleted, to the start of the text that follows. Changed ordered lists renumber.

## BlockDelete1

A node goes with its children.

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

## BlockDelete2

Ordered lists renumber.

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

## BlockDelete3

The first node: the caret goes to what follows.

A paragraph's list is its children: it goes too.

```buffer
para┃

- x

# H
```

> deleteSubtree

```buffer
# ┃H
```


## BlockDelete4

The first item: the caret goes to the next item's text, after its marker, where typing extends it.

```buffer
- a┃
  - a1
- [ ] b
```

> deleteSubtree

```buffer
- [ ] ┃b
```
