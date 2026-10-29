# Selecting nodes

Commands: `selectNode` (Escape in Logseq, Tine, Tana), `expandSelection` (Ctrl-A in outliners,
Shift-Alt-Right in code editors), `selectNodeDown` and `selectNodeUp` (Shift-Down and Shift-Up in
outliners). Each changes no text: it selects whole nodes, a subtree selection (`««…»»`,
[README.md](README.md)), or text, or is the host's where the key's own behavior is right. They read
what to do from the selection alone: no mode, no count of presses.

1. **`selectNode` selects the node at the caret** with its subtree (Select1); again, a caret at its
   text's start (Select1).
2. **`expandSelection` climbs a ladder**: the node's own text, its subtree, its siblings' run, its
   parent's subtree, and so on outward to every node, then the host's select all (Select2, Select3,
   Select4); `selectionLadder: parents` skips the siblings (Select5), `top` goes from the text to
   everything (Select22). From a selection already made, the smallest rung holding it (Select6,
   Select7). A paragraph's subtree is it with its list, a heading's its section (Select8); a task's
   text starts after its checkbox (Select9). Inside a zoom, the zoom root's subtree is the top, held
   (Select10).
3. **`selectNodeDown` and `selectNodeUp` go a node a press**, from a caret at its node's edge:
   growing away from the anchor's node, shrinking back towards it (Select11, Select12), across
   depths; upward the node above, a parent from its first child (Select13), or with `selectNodeUp:
   sibling` the sibling above (Select23); past the anchor upward
   the parent takes it in and is the anchor after (Select14). At the document's edge, unchanged
   (Select15). Inside a node's text, but from its edge, a line at a time, the host's (Select16).
   From a blank line, the node below (Select17); from a selection over several nodes, its roots
   (Select18). A folded node is one node, its hidden children skipped (Select19).
4. **They compose through the selection**: `expandSelection` then `selectNodeDown` is
   `selectNodeDown` (Select20), a paragraph at column 0 too (Select21).

## Select1

Escape selects the node at the caret with its child; again, the caret at its text's start.

```yaml
tags: common
```

```buffer
- one
  - t┃wo
    - deep
  - three
- four
```

> selectNode

```buffer
- one
  - ««two»»
    - deep
  - three
- four
```

> selectNode

```buffer
- one
  - ┃two
    - deep
  - three
- four
```

## Select2

The ladder from a node with a child and a sibling: its text, it, it and its sibling, its parent,
everything, then the host's select all, the whole text.

```yaml
tags: common
```

```buffer
- one
  - t┃wo
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - «two»
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - ««two»»
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - ««two
    - deep
  - three»»
- four
```

> expandSelection

```buffer
- ««one»»
  - two
    - deep
  - three
- four
```

> expandSelection

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

> expandSelection

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

## Select3

From a leaf with siblings: its siblings' run, then its parent.

```yaml
tags: edge
```

```buffer
- one
  - two
    - d1
    - de┃ep
    - d3
  - three
```

> expandSelection

```buffer
- one
  - two
    - d1
    - «deep»
    - d3
  - three
```

> expandSelection

```buffer
- one
  - two
    - d1
    - ««deep»»
    - d3
  - three
```

> expandSelection

```buffer
- one
  - two
    - ««d1
    - deep
    - d3»»
  - three
```

> expandSelection

```buffer
- one
  - ««two»»
    - d1
    - deep
    - d3
  - three
```

## Select4

From a top-level leaf: the node, then everything.

```yaml
tags: edge
```

```buffer
- a
- b┃
- c
```

> expandSelection

```buffer
- a
- «b»
- c
```

> expandSelection

```buffer
- a
- ««b»»
- c
```

> expandSelection

```buffer
- ««a
- b
- c»»
```

## Select5

`selectionLadder: parents`: from the node to its parent, the siblings skipped.

```yaml
tags: edge
selectionLadder: parents
```

```buffer
- one
  - t┃wo
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - «two»
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - ««two»»
    - deep
  - three
- four
```

> expandSelection

```buffer
- ««one»»
  - two
    - deep
  - three
- four
```

> expandSelection

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

## Select6

From roots at two depths: the smallest rung holding both, the run of `deep`'s parent and its
siblings, then its grandparent.

```yaml
tags: edge
```

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> expandSelection

```buffer
- one
  - ««two
    - deep
  - three
  - five»»
- four
```

> expandSelection

```buffer
- ««one»»
  - two
    - deep
  - three
  - five
- four
```

## Select7

From text across two siblings: their run, the smallest rung holding it.

```yaml
tags: edge
```

```buffer
- one
  - t«wo
    - deep
  - thr»ee
- four
```

> expandSelection

```buffer
- one
  - ««two
    - deep
  - three»»
- four
```

## Select8

A paragraph's subtree is it with its list; then its heading's section; then everything.

```yaml
tags: common
```

```buffer
# H

pa┃ra
- x

# I
```

> expandSelection

```buffer
# H

«para»
- x

# I
```

> expandSelection

```buffer
# H

««para»»
- x

# I
```

> expandSelection

```buffer
# ««H»»

para
- x

# I
```

> expandSelection

```buffer
# ««H

para
- x

# I»»
```

## Select9

A task's text starts after its checkbox.

```yaml
tags: edge
```

```buffer
- [ ] ta┃sk
  - sub
- c
```

> expandSelection

```buffer
- [ ] «task»
  - sub
- c
```

> expandSelection

```buffer
- [ ] ««task»»
  - sub
- c
```

## Select10

Zoomed in, the zoom root's subtree is the top: held there, not the host's select all.

```yaml
tags: edge
zoom: ①
```

```buffer
- one①
  - t┃wo
  - three
- four
```

> expandSelection

```buffer
- one①
  - «two»
  - three
- four
```

```yaml
zoom: ①
```

> expandSelection

```buffer
- one①
  - ««two»»
  - three
- four
```

```yaml
zoom: ①
```

> expandSelection

```buffer
- one①
  - ««two
  - three»»
- four
```

```yaml
zoom: ①
```

> expandSelection

```buffer
- ««one»»①
  - two
  - three
- four
```

```yaml
zoom: ①
```

> expandSelection

```buffer
- ««one»»①
  - two
  - three
- four
```

```yaml
zoom: ①
```

## Select11

Shift-Down from a leaf: it, then the node after at another depth, then the next; Shift-Up
back, a press at a time.

```yaml
tags: common
```

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - ««deep
  - three
  - five»»
- four
```

> selectNodeUp

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - ┃««deep»»
  - three
  - five
- four
```

## Select12

Grown upward, Shift-Down shrinks back: the first root goes alone, its children staying.

```yaml
tags: edge
```

```buffer
- one
  - two
    - deep
  - th┃ree
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - deep
  - ┃««three»»
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - ┃««deep
  - three»»
  - five
- four
```

> selectNodeUp

```buffer
- one
  - ┃««two
    - deep
  - three»»
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - ┃««deep
  - three»»
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

## Select13

Shift-Up from a first child: it, then its parent.

```yaml
tags: common
```

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - ┃««deep»»
  - three
  - five
- four
```

> selectNodeUp

```buffer
- one
  - ┃««two»»
    - deep
  - three
  - five
- four
```

> selectNodeUp

```buffer
- ┃««one»»
  - two
    - deep
  - three
  - five
- four
```

## Select14

Past the anchor upward, then down: the parent that took the anchor's node in is the anchor, and the
selection grows from it.

```yaml
tags: edge
```

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - ┃««deep»»
  - three
  - five
- four
```

> selectNodeUp

```buffer
- one
  - ┃««two»»
    - deep
  - three
  - five
- four
```

> selectNodeDown

```buffer
- one
  - ««two
    - deep
  - three»»
  - five
- four
```

## Select15

At the document's edge, unchanged.

```yaml
tags: edge
```

```buffer
- a
- b┃
```

> selectNodeDown

```buffer
- a
- ««b»»
```

> selectNodeDown

```buffer
- a
- ««b»»
```

## Select16

In a node of two lines, Shift-Up from its second is the host's line; from its first, the node.

```yaml
tags: common
```

```buffer
- a
  mo┃re
- b
```

> selectNodeUp

```buffer
- a┃«
  mo»re
- b
```

> selectNodeUp

```buffer
- ┃««a
  more»»
- b
```

## Select17

From a blank line, Shift-Down selects the node below.

```yaml
tags: edge
```

```buffer
- a

┃
- b
```

> selectNodeDown

```buffer
- a


- ««b»»
```

## Select18

From text across nodes, its roots as whole lines.

```yaml
tags: edge
```

```buffer
- a
- «b
- c»
- d
```

> selectNodeDown

```buffer
- a
- ««b
- c»»
- d
```

## Select19

A folded node is one node: Shift-Down takes it whole, its hidden children with it, and the next
press the node after.

```yaml
tags: edge
folded: ①
```

```buffer
- a┃
- b①
  - c
- d
```

> selectNodeDown

```buffer
- ««a»»
- b①
  - c
- d
```

```yaml
folded: ①
```

> selectNodeDown

```buffer
- ««a
- b»»①
  - c
- d
```

```yaml
folded: ①
```

> selectNodeDown

```buffer
- ««a
- b①
  - c
- d»»
```

```yaml
folded: ①
```

## Select20

Ctrl-A then Shift-Down is Shift-Down: the node's text, then the node.

```yaml
tags: edge
```

```buffer
- a
- b┃
- c
```

> expandSelection

```buffer
- a
- «b»
- c
```

> selectNodeDown

```buffer
- a
- ««b»»
- c
```

## Select21

The same for a paragraph at column 0, whose text runs from its line's start to its end: its text
without its line break, then the node.

```yaml
tags: edge
```

```buffer
al┃pha

beta
```

> expandSelection

```buffer
«alpha»

beta
```

> selectNodeDown

```buffer
««alpha»»

beta
```

## Select22

`selectionLadder: top`: from the node's text straight to everything, as Roam, Tana, WorkFlowy and
SiYuan climb.

```yaml
tags: edge
selectionLadder: top
```

```buffer
- one
  - t┃wo
    - deep
  - three
- four
```

> expandSelection

```buffer
- one
  - «two»
    - deep
  - three
- four
```

> expandSelection

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

## Select23

`selectNodeUp: sibling`: Shift-Up from a node with a sibling above takes that sibling with its
subtree, not the node on the line above (Dynalist, both RemNotes, WorkFlowy, SiYuan); Shift-Down
undoes it.

```yaml
tags: edge
selectNodeUp: sibling
```

```buffer
- one
  - two
    - deep
  - th┃ree
  - five
- four
```

> selectNodeUp

```buffer
- one
  - two
    - deep
  - ┃««three»»
  - five
- four
```

> selectNodeUp

```buffer
- one
  - ┃««two
    - deep
  - three»»
  - five
- four
```

> selectNodeDown

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```
