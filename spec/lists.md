# Lists after blocks

Markdown writes a list beside the block before it; what the outline reads it as is an option,
`listParent` (`src/config.ts`), for the document's own sections (the root's, a heading's: in an item
or a quote a list is the container's, whatever the value):

- `paragraph`, the default: the list right after a paragraph (a quote of one paragraph, `quotes:
  text`) is its children. It moves, and goes, with the paragraph (Lists1, Lists9); an item moved down
  past the paragraph becomes its list's first (Lists7). Code adopts nothing: it can't move past the
  list after it (Lists5).
- `block`: any block's, but a heading's (it owns its section) and a quote's that is a container (its
  children are inside it): code's, a table's, a quote atom's too (Lists4).
- `container` (SiYuan's and BlockNote's blocks, a flat sequence): no block's. Its items are the
  container's, beside the block before them; a paragraph goes without its list (Lists10). How items
  and blocks pass each other is `listMoves`'s: under `list` (SiYuan's, a list one block) a block
  moves past a whole list (Lists2, Lists3), as far as it goes on (`1. a⏎- b` is two lists, Lists6),
  and a whole list's items pass a block (Lists8b), but an item at a longer list's edge stays in it
  (Lists8); under `item` (BlockNote's, each item a block) a block passes one item (Lists13, Lists14)
  and an item at its list's edge passes a block (Lists15).

The values agree wherever the text comes out the same: a list of one item moving down past a
paragraph (Lists8b; under `paragraph` any item does, Lists7), a paragraph indented after a list or
after one with none (`- Next`), items pasted at a paragraph's end (first in the list after it, or
after it, joining that list), a first item that can't indent (Indent11), an item outdented out of a
top-level list.

## Lists1

A paragraph moves with the list after it, its children.

```yaml
tags: common
listParent: paragraph
```

```buffer
Intro┃

- a
- b

Next
```

> moveSubtreeDown

```buffer
Next

Intro┃

- a
- b
```

## Lists2

Under `container` the list is no paragraph's: the paragraph moves past the whole list, a block of
its own, as SiYuan's does.

```yaml
tags: common
listParent: container
```

```buffer
Intro┃

- a
- b

Next
```

> moveSubtreeDown

```buffer
- a
- b

Intro┃

Next
```

## Lists3

Up, too: past the list, to right after the paragraph above it.

```yaml
tags: edge
listParent: container
```

```buffer
Intro

- a
  - a1
- b

Next┃
```

> moveSubtreeUp

```buffer
Intro

Next┃

- a
  - a1
- b
```

## Lists4

Under `block` code adopts the list after it, as a paragraph does, and moves with it.

```yaml
tags: edge
listParent: block
```

````buffer
```
x┃
```
- a

Next
````

> moveSubtreeDown

````buffer
Next

```
x┃
```
- a
````

## Lists5

Under `paragraph` the list after code is the section's: code moves among blocks, items among
items, and the code can't move past the list.

```yaml
tags: edge
listParent: paragraph
```

````buffer
```
x┃
```
- a

Next
````

> moveSubtreeDown

```yaml
result: rejected not-expressible
```

````buffer
```
x┃
```
- a

Next
````

## Lists6

A list ends where another starts: past the ordered list alone, the bullet one staying where it is
(MoveDown29 under `paragraph`, both lists the paragraph's).

```yaml
tags: rare
listParent: container
```

```buffer
pa┃ra
1. a
- b

next
```

> moveSubtreeDown

```buffer
1. a

pa┃ra
- b

next
```

## Lists7

Under `paragraph` an item moved down past a paragraph becomes the first of its list.

```yaml
tags: common
listParent: paragraph
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

## Lists8

Under `container` an item moves among the items of its list: at a longer list's edge it stays, as
SiYuan's does (its list a block, the item in it).

```yaml
tags: common
listParent: container
```

```buffer
- a
- b┃

para

- c
```

> moveSubtreeDown

```yaml
result: rejected not-expressible
```

```buffer
- a
- b┃

para

- c
```

## Lists8b

A whole list's items pass the block, the list a block among blocks, and join the list on the other
side: the text Lists7 writes (MoveDown2, MoveUp12).

```yaml
tags: common
listParent: container
```

```buffer
- b┃

para

- c
```

> moveSubtreeDown

```buffer
para

- b┃
- c
```

## Lists9

A paragraph's subtree deleted takes its list with it.

```yaml
tags: common
listParent: paragraph
```

```buffer
Intro┃
- a
- b

Next
```

> deleteSubtree

```buffer
┃Next
```

## Lists10

Under `container` the paragraph goes alone, its list staying, the caret in its first item.

```yaml
tags: common
listParent: container
```

```buffer
Intro┃
- a
- b

Next
```

> deleteSubtree

```buffer
- ┃a
- b

Next
```

## Lists11

Under `quotes: text` a quote of one paragraph is a paragraph, and adopts the list after it too.

```yaml
tags: edge
quotes: text
listParent: paragraph
```

```buffer
> q┃
- a

Next
```

> moveSubtreeDown

```buffer
Next

> q┃
- a
```

## Lists12

Under `container` it moves past the list.

```yaml
tags: edge
quotes: text
listParent: container
```

```buffer
> q┃
- a

Next
```

> moveSubtreeDown

```buffer
- a

> q┃

Next
```

## Lists13

Under `listMoves: item` each item is a block of its own, as BlockNote's are: the paragraph moves
past one item, splitting the list (Lists2 under `list`).

```yaml
tags: common
listParent: container
listMoves: item
```

```buffer
Intro┃

- a
- b

Next
```

> moveSubtreeDown

```buffer
- a

Intro┃

- b

Next
```

## Lists14

Up, too: past the last item, its children with it (Lists3 under `list`).

```yaml
tags: edge
listParent: container
listMoves: item
```

```buffer
Intro

- a
- b
  - b1

Next┃
```

> moveSubtreeUp

```buffer
Intro

- a

Next┃

- b
  - b1
```

## Lists15

An item at its list's edge passes the block beside it and joins the list on the other side (Lists8
under `list`).

```yaml
tags: common
listParent: container
listMoves: item
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
