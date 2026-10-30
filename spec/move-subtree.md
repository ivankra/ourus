# Move subtree

Command: `moveSubtree { nodes?, to }`, a drag's drop: the nodes, with their subtrees, moved to a
place, `to`, a parent and the sibling they go after (`{ parent, after }`, `after` null for first). A
host's drag presses a node's mark and releases at a drop line; a tree pane or a "move to" dialog names
the place itself. A case draws the place as a `▸` line in its start, at the column the node's mark
would land, twice the depth, right after the node above's last line, before its blank lines
(MoveSubtree9); its action presses ②'s mark, `moveSubtree ②`, taking what a pickup takes there
([drag.md](drag.md)), or takes the selection's nodes, `moveSubtree` (MoveSubtree19). The place is read
with the moved nodes taken out: the node above the line gives the parents at each depth, the node
below bounds the depth from below.

The rules, in order; the first that applies wins:

1. **A place inside the moved nodes is refused** (`into-itself`, MoveSubtree11).
2. **At their own place, nothing changes**: applied with no changes (MoveSubtree7, MoveSubtree8).
3. **Where Markdown can't hold them, it is refused** (`not-expressible`): inside a node that holds
   none (a paragraph that adopts no list, a code block), after a heading for a node that isn't one, a
   heading under an item or in a paragraph's list (MoveSubtree10), a task where it would be a
   paragraph (MoveSubtree13), a node out of a quote that is an item's first block, on its marker's
   line, where under `quotes: text` the quote it leaves would be the item's text.
4. **A heading keeps its form**, re-levelled to its new siblings: the level of the heading it goes
   after, or else before; with none, one inside a heading it goes under; in a quote or at the top
   level, its own. Its section's headings shift with it (MoveSubtree14, MoveSubtree15), refused past
   `h6` (`at-h6-bound`, MoveSubtree16) and where its section would take in what follows the place
   (`would-reparent`, MoveSubtree18).
5. **Otherwise the nodes move there**, as the moves move them
   ([move-subtree-up.md](move-subtree-up.md)): an item into an item as its child (MoveSubtree3), out
   of another's children too (MoveSubtree23), anywhere in a list (MoveSubtree1); a paragraph or
   another block under an item, or in a paragraph's list, becomes an item, as indent makes it
   (MoveSubtree9); an item right after a paragraph that adopts lists becomes a paragraph, as outdent
   makes it (MoveSubtree12), or the block of lines its text is (a fence), where it has no children; a
   list left right after a paragraph is taken in by it, and a quote left holding one paragraph is
   that paragraph, under `quotes: text` (MoveSubtree20). An item among items of another kind keeps
   its form, a list of its own (MoveSubtree21); a block out of an item goes as it is (MoveSubtree22).
   Lists are renumbered (MoveSubtree19), blank lines kept with their nodes, between a loose list's
   items too (MoveSubtree24), the caret with the text it is in (MoveSubtree1, MoveSubtree2).

Then the result is checked: the moved nodes under the parent asked, at the place asked, every other
node under the parent it had (but a list a paragraph takes in); else the drop is refused
(`not-expressible` or `would-reparent`, the detail `result check`), a gap in these rules rather than an
outcome.

## MoveSubtree1

Pressing a node's mark and dropping it at the top: its children come along, and so does the caret
in it (obsidian-outliner's first case).

```yaml
tags: core
```

```buffer
▸
- one
  - two
- three┃③
```

> moveSubtree ③

```buffer
- three┃③
- one
  - two
```

## MoveSubtree2

The caret elsewhere stays in its text.

```yaml
tags: core
```

```buffer
▸
- one
  - two┃
- three③
```

> moveSubtree ③

```buffer
- three③
- one
  - two┃
```

## MoveSubtree3

Into an item, as its child.

```yaml
tags: core
```

```buffer
- one┃①
- two②
  ▸
- three
```

> moveSubtree ①

```buffer
- two②
  - one┃①
- three
```

## MoveSubtree4

A press on a selected node takes the selection's nodes, and the selection goes with them.

```yaml
tags: common
```

```buffer
- ««a
- b»»②
- c
▸
```

> moveSubtree ②

```buffer
- c
- ««a
- b»»②
```

## MoveSubtree5

A press on another node takes it alone, and the selection stays.

```yaml
tags: common
```

```buffer
▸
- ««a
- b»»
- c③
```

> moveSubtree ③

```buffer
- c③
- ««a
- b»»
```

## MoveSubtree6

Dropped inside the selection, a node pressed outside it lands between the selected nodes, and the
selection, its ends each with its text, covers it then too.

```yaml
tags: edge
```

```buffer
- «a
▸
- b»
- c③
```

> moveSubtree ③

```buffer
- «a
- c③
- b»
```

## MoveSubtree7

The selection dropped between its own nodes is at its own place, read with them taken out: nothing
changes. One column in, the place would be inside `a`, `into-itself`.

```yaml
tags: edge
```

```buffer
- ««a
▸
- b»»②
- c
```

> moveSubtree ②

```yaml
result: success
```

```buffer
- ««a
- b»»②
- c
```

## MoveSubtree8

Set down where it was, a node doesn't move.

```yaml
tags: core
```

```buffer
- a
▸
- b┃②
- c
```

> moveSubtree ②

```yaml
result: success
```

```buffer
- a
- b┃②
- c
```

## MoveSubtree9

A paragraph dropped into an item becomes an item, as indent makes it, keeping its node. The drop
line goes before the blank line, which is `a`'s, and stays with it.

```yaml
tags: common
```

```buffer
- a
  ▸

para┃②
```

> moveSubtree ②

```buffer
- a

  - para┃②
```

## MoveSubtree10

A heading can't be an item.

```yaml
tags: edge
```

```buffer
- a
  ▸

# H┃②
```

> moveSubtree ②

```yaml
result: rejected not-expressible
```

## MoveSubtree11

Under the node dragged: refused.

```yaml
tags: edge
```

```buffer
- a②
  - b┃
    ▸
- c
```

> moveSubtree ②

```yaml
result: rejected into-itself
```

## MoveSubtree12

An item dropped right after a paragraph, at its depth, would be in the paragraph's list: it becomes a
paragraph, as outdent makes it, keeping its node.

```yaml
tags: common
```

```buffer
- x┃②

p
▸
```

> moveSubtree ②

```buffer
p

x┃②
```

## MoveSubtree13

A task there is refused: as a paragraph its checkbox would be text.

```yaml
tags: edge
```

```buffer
- [ ] x┃②

p
▸
```

> moveSubtree ②

```yaml
result: rejected not-expressible
```

## MoveSubtree14

A heading dropped after another takes its level, and its section shifts with it.

```yaml
tags: common
```

```buffer
# A
## B
  ▸
# C
### D┃②
#### E
```

> moveSubtree ②

```buffer
# A
## B
## D┃②
### E
# C
```

## MoveSubtree15

With no heading beside it, a heading dropped into a section is one level inside it.

```yaml
tags: common
```

```buffer
# A
x
  ▸
# C
##### D┃②
###### E
```

> moveSubtree ②

```buffer
# A
x
## D┃②
### E
# C
```

## MoveSubtree16

Refused where its section would go past `######`.

```yaml
tags: rare
```

```buffer
# A
## B
### C
#### D
        ▸
# X┃②
## Y
### Z
```

> moveSubtree ②

```yaml
result: rejected at-h6-bound
```

## MoveSubtree17

A selection across parents, pressed on one of its own nodes, is refused, as a structural command
refuses it; pressed on another node, it takes that one alone.

```yaml
tags: edge
```

```buffer
- a
  - ««b
- c»»③
▸
```

> moveSubtree ③

```yaml
result: rejected non-contiguous
```

## MoveSubtree18

A heading dropped before a paragraph would take it into its section: refused.

```yaml
tags: edge
```

```buffer
▸
para

# H┃②
```

> moveSubtree ②

```yaml
result: rejected would-reparent
```

## MoveSubtree19

A move with no press takes the selection's nodes, as a keyboard drag or a "move to" dialog does;
lists are renumbered.

```yaml
tags: common
```

```buffer
▸
1. a
2. ««b
3. c»»
```

> moveSubtree

```buffer
1. ««b
2. c»»
3. a
```

## MoveSubtree20

A quote's last item dropped right after the quote: what's left of the quote is one paragraph, which
under `quotes: text` is that paragraph, and the item, right after it, becomes a paragraph too, or it
would be in that paragraph's list.

```yaml
tags: edge
```

```buffer
> Quote:
> - one┃②
▸
```

> moveSubtree ②

```buffer
> Quote:

one┃②
```

## MoveSubtree21

Among items of another kind, an item keeps its form: a list of its own, after `a`, and the rest of
the ordered list after it, set apart by a blank line, keeps its numbers.

```yaml
tags: common
```

```buffer
- x┃①

1. a
▸
2. b
```

> moveSubtree ①

```buffer
1. a
- x┃①

2. b
```

## MoveSubtree22

A code block out of an item, to the top level after the list: a fence at a line's start ends the
list on its own, so no blank line comes with it.

```yaml
tags: common
```

````buffer
- a
  ```②
  x┃
  ```
- b
▸
````

> moveSubtree ②

````buffer
- a
- b
```②
x┃
```
````

## MoveSubtree23

An item's last child into the next item, as its child.

```yaml
tags: common
```

```buffer
- a
  - a1┃②
- b
  ▸
```

> moveSubtree ②

```buffer
- a
- b
  - a1┃②
```

## MoveSubtree24

In a loose list, the blank lines stay between the items.

```yaml
tags: common
```

```buffer
- a┃①

- b

- c
▸
```

> moveSubtree ①

```buffer
- b

- c

- a┃①
```
