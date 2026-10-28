# Drag

Command: `drag`, a pickup: the nodes a drag takes and every place it can drop them, the document
unchanged. A case presses a node's mark, `drag ②`, or takes the selection's nodes, `drag`, and checks
what it takes (`dragNodes:`) and where it can go (`dropPoints:`). The drop is `moveSubtree`
([move-subtree.md](move-subtree.md)); a drop from outside, `pasteAt` ([paste-at.md](paste-at.md)).

1. **What a drag takes, the cover rule**: a press on one of the selection's topmost nodes takes all
   of them (refused, `non-contiguous`, unless they are contiguous siblings), the selection with them;
   a press on any other node takes it alone, with its subtree. Nodes that are all of a quote without
   a title, or of an item whose first block is on its marker's line, take it with them (Drag4), and
   nodes of mixed kinds are refused (`mixed-kinds`).
2. **Every gap between two nodes that has a line is a place**, read with the dragged nodes taken
   out, at each depth from the node below's to one inside the node above (Drag3), a heading at the
   level it would take there (Drag6). The dragged nodes' top offers their own place, their bottom
   nothing (Drag1); where their own place has no line of its own (first in a quote, `> - a`), the
   line above offers it (Drag2).
3. **A place a drop would refuse isn't offered** (Drag5): inside a node that holds none, or after a
   heading for a node that isn't one; nor, under a folded node, one among its hidden children but
   the last inside it (Drag7); nor, zoomed, one outside the zoom root (Drag8).

`dropPoints:` draws the places whose drop is applied: the buffer's lines, no caret, labels optional,
and in each gap a drop can land, a line of markers right after the node above's last line: `▸` at
twice the depth, `▹` the own place, which a place sharing its column doesn't show over.

## Drag1

What a pickup offers: every place it can drop, each drawn as its drop line, a `▸` at twice the depth,
and `▹` its own place, the way out of a drag. Below the node dragged, nothing: a drop line resting
there offers no place, rather than one that moves it a step (were the place beside it not offered
at its top, the nearest would move it under `a`).

```yaml
tags: core
```

```buffer
- a①
- b┃②
- c③
```

> drag ②

```yaml
dragNodes: ②
dropPoints: |
  ▸
  - a①
  ▹ ▸
  - b②
  - c③
  ▸ ▸
```

## Drag2

The own place at a seam with no line of its own (first in the quote, once `a` is out) is offered at
the line above, and shares its column there with inside `c`, which it takes: inside `c` is the
keyboard's and the API's there.

```yaml
tags: rare
```

```buffer
- c
> - a┃②
> - b
```

> drag ②

```yaml
dropPoints: |
  ▸
  - c
  ▸ ▹
  > - a
  > - b
  ▸ ▸ ▸
```

## Drag3

A node below a deep subtree: its top offers each depth, from where it is to inside `c`.

```yaml
tags: common
```

```buffer
- a①
  - b②
    - c③
- d┃④
```

> drag ④

```yaml
dropPoints: |
  ▸
  - a①
    ▸
    - b②
      ▸
      - c③
  ▹ ▸ ▸ ▸
  - d④
```

## Drag4

What a pickup takes: an item that is all of its quote takes the quote with it, as every structural
command does.

```yaml
tags: edge
```

```buffer
- x
> - a┃①②
```

> drag ②

```yaml
dragNodes: ①
dropPoints: |
  ▸
  - x
  ▹ ▸
  > - a
```

## Drag5

The places a drop would refuse aren't offered: a heading among items has only its own, as beside
or under an item it can't be, and before them it would take them into its section.

```yaml
tags: edge
```

```buffer
- a
- b

# H┃②
para
```

> drag ②

```yaml
dropPoints: |
  - a
  - b
  ▹

  # H
  para
```

## Drag6

A heading's places, each at the level it would take there: beside `B`, in `A`'s section, or inside
`B`'s.

```yaml
tags: common
```

```buffer
# A
x
## B
y
# C┃③
z
```

> drag ③

```yaml
dropPoints: |
  ▸
  # A
  x
    ▸
  ## B
  y
  ▹ ▸ ▸
  # C
  z
```

## Drag7

The host's folds are its view, and the pickup reads them: a folded node offers no places among its
hidden children, and one inside it is its last.

```yaml
tags: common
folded: ①
```

```buffer
- a①
  - b
- c┃③
```

> drag ③

```yaml
dropPoints: |
  ▸
  - a①
    - b
  ▹ ▸
  - c③
```

## Drag8

Zoomed into a node, the pickup offers places inside it alone.

```yaml
tags: common
zoom: ①
```

```buffer
- a①
  - b
  - c┃③
- d
```

> drag ③

```yaml
dropPoints: |
  - a①
    ▸
    - b
    ▹ ▸
    - c③
  - d
```
