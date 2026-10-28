# Paste at

Commands: `pasteAt { clipboard, at }`, a drop from outside (another document, another app), and
`deleteByDrag`, a text drag's first half. A `pasteAt` is a paste at a place, drawn as a drop's is, a
`▸` line in the start ([move-subtree.md](move-subtree.md)): the clipboard read as paste reads it, its
nodes fitted at the place as paste fits them (in a list, a paragraph an item, a block that can't be
one staying a block: PasteAt4), a heading re-levelled as a moved one is (PasteAt3) and refused where
its section would take in what follows (`would-reparent`, PasteAt2), the caret staying where it is
(PasteAt1). A drag of selected text is the host's, its drop a `deleteByDrag`, the deletion a cut
makes, then a `paste` where the drop lands (PasteAt5). A node dragged out to another document leaves
with `deleteSubtree { expectMarkdown }`, refused (`content-changed`) where the nodes are no longer what
was dragged out.

## PasteAt1

A drop from outside (`pasteAt`): what is dragged in, the clipboard, read as paste reads it and
fitted at the place, here items into a list; the caret stays where it is.

```yaml
tags: common
clipboard: |
  - x
  - y
```

```buffer
- a┃
▸
- b
```

> pasteAt

```buffer
- a┃
- x
- y
- b
```

## PasteAt2

A heading dropped in that would take in what follows it: refused, where a paste at the caret takes
it in (Paste10). A drop is aimed, and changes nothing it doesn't point at.

```yaml
tags: edge
clipboard: '# H'
```

```buffer
a┃
▸

b
```

> pasteAt

```yaml
result: rejected would-reparent
```

## PasteAt3

A heading dragged in is re-levelled to its new siblings, as a moved one is, its section with it.

```yaml
tags: common
clipboard: |
  #### N
  n
```

```buffer
# A
x
## B
  ▸
# C┃
```

> pasteAt

```buffer
# A
x
## B
## N
n
# C┃
```

## PasteAt4

Among items, what is dragged in fits as paste fits it there: a paragraph is an item, and a block
that can't be one stays a block, at the place, in no item.

````yaml
tags: edge
clipboard: |
  ```
  code
  ```
````

```buffer
- a┃
▸
- b
```

> pasteAt

````buffer
- a┃
```
code
```
- b
````

## PasteAt5

A drag of selected text is the host's, and its drop two commands (`deleteByDrag`, then `paste` where
the drop lands): the text goes as a cut takes it, a line it empties with its line break, so the
paragraph stays one, where a raw deletion would leave a blank line splitting it.

```yaml
tags: common
```

```buffer
a
«b»
c
```

> deleteByDrag

```buffer
a
┃c
```
