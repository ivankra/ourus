# Folding

Commands:

- `fold`: the nodes at the selection, or the node a click names, folded
- `unfold`: unfolded
- `toggleFold`: unfolded where any is folded, else folded
- every command where a node is folded

A fold is the view's, not the text's: the snapshot's `folded` (dev/21-zoom.md). The buffer draws
the whole text, hidden lines too, and `⟦folded⟧` last on each folded node's first line: at the start
what is folded, after a step what is then (none drawn, nothing folded). The rules:

1. **A node folds where it has something to hide**: its children, from the end of its text to the
   end of its subtree's last line, the blank lines after it shown. A childless node doesn't
   (Fold9, Fold12).
2. **`fold` folds the nodes at the selection**, or the node a click names; `unfold` unfolds them;
   `toggleFold` unfolds them where any is folded, else folds them, and at a node that doesn't fold
   toggles its parent's (Fold9, Fold10, Fold11, Fold12).
3. **A fold closed over the caret moves it to the fold's start**, the end of the folded node's text
   (Fold10).
4. **No command leaves the caret, or a node it made or moved, in hidden lines, and none changes
   hidden text** but as part of a node it moves or deletes whole. Where it would, it takes the
   visible variant, or the fold opens:
   - Enter at the end of a folded item makes its next sibling, after the subtree, not a first
     child among its hidden children (Fold1); on an empty folded item with children, too (Fold5).
   - Paste of items at a folded item's end puts them after its subtree, as Enter does (Fold14).
   - Split mid-text, a folded item's children go with the second half, and its fold with them
     (Fold2); under `enterMidItem: child`, where the rest would be its first child, the rest goes
     after the subtree, as at its end, the item still folded (Fold2b).
   - An empty item right after a folded one goes, the caret to the end of the folded item's text,
     not to its hidden child's (Fold3); one with text joins the folded item's text, not its hidden
     child's, the fold kept (Fold15).
   - Delete at a folded node's end, where its hidden first child would join it, is refused,
     `folded`, with no change (Fold7).
   - Indent under a folded sibling, an Enter at a folded heading's end: the fold opens (Fold6,
     Fold13).
5. **A fold follows its node**: moved, indented, outdented, the node and every fold inside it stay
   folded, though the move writes their lines again (Fold4), and so through an undo of it (Fold16,
   Fold17); a copy of a folded node is folded too (Fold8).

## Fold1

Enter at the end of a folded item makes its next sibling, after its hidden children.

```yaml
tags: core
```

```markdown
- a┃①⟦folded⟧
  - b
- c
```

> enter

```markdown
- a①⟦folded⟧
  - b
- ┃②
- c
```

## Fold2

Split mid-text, the children go with the second half, and the fold with them.

```yaml
tags: common
```

```markdown
- a┃b①⟦folded⟧
  - c
```

> enter

```markdown
- a①
- ┃b②⟦folded⟧
  - c
```

## Fold2b

Under `enterMidItem: child`, split mid-text in a folded item: the rest goes after its subtree, not
among its hidden children, and the item stays folded, as at its end (Fold1).

```yaml
tags: rare
enterMidItem: child
```

```markdown
- a┃b①⟦folded⟧
  - c
```

> enter

```markdown
- a①⟦folded⟧
  - c
- ┃b②
```

## Fold3

An empty item right after a folded one goes, and the caret goes to the end of the folded item's
text, not to its hidden child's.

```yaml
tags: common
```

```markdown
- a①⟦folded⟧
  - b
- ┃
```

> deleteContentBackward

```markdown
- a┃①⟦folded⟧
  - b
```

## Fold4

A folded node moved keeps its fold, though the move writes its lines again.

```yaml
tags: core
```

```markdown
- a①
- b┃②⟦folded⟧
  - c
```

> moveSubtreeUp

```markdown
- b┃②⟦folded⟧
  - c
- a①
```

## Fold5

Enter on an empty folded item with children makes its next sibling, after them, not a first child
among them.

```yaml
tags: rare
```

```markdown
- ┃①⟦folded⟧
  - b
- c
```

> enter

```markdown
- ①⟦folded⟧
  - b
- ┃②
- c
```

## Fold6

Indented under a folded sibling, the node would be hidden among its children: the fold opens.

```yaml
tags: common
```

```markdown
- a①⟦folded⟧
  - b
- c┃
```

> indent

```markdown
- a①
  - b
  - c┃
```

## Fold7

Delete at the end of a folded node's text would join its hidden first child into it: refused,
nothing hidden changing, the item still folded.

```yaml
tags: rare
```

```markdown
- a┃①⟦folded⟧
  - b
  - c
```

> deleteContentForward

```yaml
result: rejected folded
```

```markdown
- a┃①⟦folded⟧
  - b
  - c
```

## Fold8

A folded node's copy is folded too.

```yaml
tags: common
```

```markdown
- a┃①⟦folded⟧
  - b
```

> duplicateSubtree

```markdown
- a①⟦folded⟧
  - b
- a┃②⟦folded⟧
  - b
```

## Fold9

`fold` folds the node at the caret, and changes no text; on a node with nothing to hide, nothing.

```yaml
tags: core
```

```markdown
- a┃①
  - b②
```

> fold

```markdown
- a┃①⟦folded⟧
  - b②
```

```yaml
result: success
```

> fold ②

```yaml
result: success
```

```markdown
- a⟦folded⟧
  - b
```

## Fold10

A fold closed over the caret moves it to the fold's start, the end of the folded node's text.

```yaml
tags: common
```

```markdown
- a①
  - b┃
```

> fold ①

```markdown
- a┃①⟦folded⟧
  - b
```

## Fold11

A toggle at a node that doesn't fold toggles its parent's fold: folded, then open again.

```yaml
tags: common
```

```markdown
- a①
  - b┃
```

> toggleFold

```markdown
- a┃①⟦folded⟧
  - b
```

> toggleFold

```markdown
- a
  - b
```

## Fold12

`unfold` opens the fold at the caret.

```yaml
tags: core
```

```markdown
- a┃①⟦folded⟧
  - b
```

> unfold

```markdown
- a
  - b
```

## Fold13

Enter at the end of a folded heading's title makes the section's first paragraph, hidden: the fold
opens.

```yaml
tags: common
```

```markdown
# H┃①⟦folded⟧

p
```

> enter

```markdown
# H①

┃◌

p
```

## Fold14

Paste of an item at the end of a folded item's text: not first among its hidden children, where
paste puts it on an item with children, but after its subtree, as Enter's new item (Fold1), the
item still folded.

```yaml
tags: common
clipboard: |
  - x
```

```markdown
- a┃①⟦folded⟧
  - b
- c
```

> paste

```markdown
- a①⟦folded⟧
  - b
- x┃
- c
```

## Fold15

Backspace at the start of the item right after a folded one joins it into the folded item's text,
the text the reader sees above it, not into its last hidden descendant's; the item stays folded.

```yaml
tags: common
```

```markdown
- a①⟦folded⟧
  - b
- ┃c
```

> deleteContentBackward

```markdown
- a┃c①⟦folded⟧
  - b
```

## Fold15b

The item joined into a folded one has children of its own: they go after the folded item's, and
what the fold hides changed, so it opens. Tine and RemNote join so but keep the fold, hiding them;
with `joinWithChildren: refuse` nothing happens, as in Logseq, Roam, Athens, Dynalist, Tana,
WorkFlowy and Outliner ([Backspace45c](backspace.md#backspace45c)).

```yaml
tags: rare
```

```markdown
- a①⟦folded⟧
  - b
- ┃c
  - d
```

> deleteContentBackward

```markdown
- a┃c①
  - b
  - d
```

## Fold16

A folded item moved down, then the move undone and done again: folded throughout, the same node.

```yaml
tags: common
```

```markdown
- a┃①⟦folded⟧
  - b
- c
```

> moveSubtreeDown

```markdown
- c
- a┃①⟦folded⟧
  - b
```

> undo

```markdown
- a┃①⟦folded⟧
  - b
- c
```

> redo

```markdown
- c
- a┃①⟦folded⟧
  - b
```

## Fold17

A folded item indented, then the indent undone.

```yaml
tags: common
```

```markdown
- x
- a┃①⟦folded⟧
  - b
```

> indent

```markdown
- x
  - a┃①⟦folded⟧
    - b
```

> undo

```markdown
- x
- a┃①⟦folded⟧
  - b
```

## Fold18

A folded item moved past a sibling written the same: the move changes no character, but the two
nodes trade places, and the fold goes with its node, to the second item. The document after is
another one, its nodes in another order, though its text is the same (dev/25-view.md §5.1).

```yaml
tags: rare
```

```markdown
- a┃①⟦folded⟧
  - x
- a②
  - x
```

> moveSubtreeDown

```markdown
- a②
  - x
- a┃①⟦folded⟧
  - x
```

```yaml
result: success
```

## Fold19

The same, moving the item that isn't folded: it goes up past the folded one, which stays folded,
now second.

```yaml
tags: rare
```

```markdown
- a①⟦folded⟧
  - x
- a┃②
  - x
```

> moveSubtreeUp

```markdown
- a┃②
  - x
- a①⟦folded⟧
  - x
```

```yaml
result: success
```

## Fold20

Placeholders the caret has left are settled, a node written again or gone, without opening a
fold, though what it hides is written again (dev/25-view.md §6). Here the empty item in the folded
section, its text an empty line a placeholder holds above a block id, settles as an empty last line
does: the line goes, the block id on the marker's line, naming the item still (it was dropped, the
block id then naming the whole list: B240's loss); the empty paragraph above the heading goes.

```yaml
tags: rare markup-heading
flavor: obsidian
```

```markdown
◌①
┃# h②⟦folded⟧
> - ◌
> ^x
```

> cursorLineBoundaryForward

```markdown
# h┃②⟦folded⟧
> - ^x
```
