# Drag and drop

Command: `moveSubtreeTo { nodes?, to }`, the drop of a drag: the nodes, with their subtrees, moved
to a place, `to`, a parent and the sibling they go after (`{ parent, after }`, `after` null for
first). A host's drag presses a node's mark, moves, and releases at a drop line; a tree pane or a
"move to" dialog names the place itself. Here a case draws the place, a `▸` line in its start
(below), and the action says what is pressed: `move ②` presses ②'s mark, `move` takes the
selection's nodes ([README.md](README.md#actions)).

What a drag takes, the **cover rule**: pressing a node that is one of the selection's topmost nodes
takes all of them (refused, `non-contiguous`, unless they are contiguous siblings), and the
selection goes with them (Drag4); pressing any other takes it alone, with its subtree, whatever the
selection is (Drag5, Drag18). Then, as for every structural command, nodes that are all of a
quote without a title, or of an item whose first block is on its marker's line, take it with them,
and nodes of mixed kinds are refused (`mixed-kinds`).

Where a drop lands is drawn as the drop line would be: a line holding one `▸` in the start, in the
gap between two nodes, at the column the dragged node's mark would land, twice the depth (0 at the
top level, 2 one level in; under `# H`, 2 is inside H's section). It is no part of the text, and
sits right after the node above's last line, before the gap's blank lines (Drag8). The place is
read with the dragged nodes taken out: the node above the line, outside them, gives the parents at
each depth (itself one level deeper, or one of its ancestors), and the node below bounds the depth
from below; among the dragged nodes' own lines, the line at their depth is their own place (Drag5c),
and deeper is inside them.

The rules, in order; the first that applies wins:

1. **A place inside the dragged nodes is refused** (`into-itself`, Drag12).
2. **At their own place, nothing changes**: the drop is applied with no changes (Drag5c, Drag6b).
3. **Where Markdown can't hold them, it is refused** (`not-expressible`): inside a node that holds
   none (a paragraph that adopts no list, a code block), after a heading for a node that isn't one
   (it would be in that heading's section), a heading under an item or in a paragraph's list
   (Drag9), a task where it would be a paragraph (Drag14), and a node out of a quote that is an
   item's first block, on its marker's line, where under `quotes: text` the quote it leaves holding
   one paragraph would be the item's text.
4. **A heading keeps its form**, re-levelled to its new siblings: the level of the heading it goes
   after, or else before; with none, one inside a heading it goes under; in a quote or at the top
   level, its own. The headings of its section shift with it (Drag15, Drag16), refused past `h6`
   (`at-h6-bound`, Drag17); and refused where its section would take in what follows the place
   (`would-reparent`, Drag19).
5. **Otherwise the nodes move there**, as the moves move them
   ([move-subtree-up.md](move-subtree-up.md)): an item into an item as its child (Drag3), out of
   another's children too (Drag32), anywhere in a list (Drag1); a paragraph or another block under
   an item, or in a paragraph's list, becomes an item, as indent makes it (Drag8); an item right
   after a paragraph that adopts lists becomes a paragraph, as outdent makes it (Drag13), or the
   block of lines its text is (a fence), where it has no children; a list the drop leaves right
   after a paragraph is taken in by it (guarantee 4), and a quote it leaves holding one paragraph is
   that paragraph, under `quotes: text` (Drag21). An item among items of another kind keeps its
   form, a list of its own (Drag30); a block out of an item goes as it is, a fence ending the list
   it leaves (Drag31). Lists are renumbered (Drag20), blank lines kept with their nodes, between a
   loose list's items too (Drag33), the caret with the text it is in, moved or not (Drag1, Drag2).

What a pickup offers (`drag`, the command a drag starts with, which changes nothing): every gap
between two nodes that has a line, read with the dragged nodes taken out, each with its depths,
from the node below's to one inside the node above; the dragged nodes' top offers their own place
beside the places there, and their bottom nothing (Drag6), and where their own place has no line of
its own (first in a quote, `> - a`), the line above offers it (Drag6c). Left out: the places
Markdown can't hold (rule 3's first two) and, where the host hides a folded node's children, any
place among them, one inside it being its last (Drag25); zoomed into a node, any place outside it
(Drag26). `dropPoints:` draws the places whose drop is applied (Drag23): the buffer's lines, no
caret, labels optional, and in each gap a drop can land in a line of markers right after the node
above's last line, `▸` at twice the depth, `▹` the own place, which a place sharing its column
doesn't show over (inside `c`, in Drag6c, is the keyboard's and the API's there).

Then the result is checked: the nodes moved are under the parent asked, at the place asked, and
every other node under the parent it had, but for a list a paragraph takes in; else the drop is
refused (`not-expressible` or `would-reparent`, with the detail `result check`), a gap in these
rules rather than an outcome.

A drop from outside, another document, another app (`pasteAt { clipboard, at }`), is a paste at a
place: the clipboard read as paste reads it, its nodes fitted there as paste fits them (in a list,
a paragraph or a heading an item, a block staying a block, Drag28), a heading first re-levelled as
rule 4 says (Drag27) and refused where its section would take in what follows (`would-reparent`,
Drag11), the caret staying where it is (Drag10). A drag of selected text is the host's, its drop a
`deleteByDrag`, the deletion a cut makes (Drag29), then a `paste` where the drop lands; a node
dragged out to another document leaves with `deleteSubtree { expectMarkdown }`, refused
(`content-changed`) where the nodes are no longer what was dragged out.

Obsidian's own drag of selected text moves the text, not its nodes; obsidian-outliner drags an
item by its bullet to before, after or into another item, its children with it, and true-outliner
any node by its marker, as here.

## Drag1

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

> move ③

```buffer
- three┃③
- one
  - two
```

## Drag2

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

> move ③

```buffer
- three③
- one
  - two┃
```

## Drag3

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

> move ①

```buffer
- two②
  - one┃①
- three
```

## Drag4

A press on a selected node takes the selection's nodes, and the selection goes with them.

```yaml
tags: common
```

```buffer
- «a
- b»②
- c
▸
```

> move ②

```buffer
- c
- «a
- b»②
```

## Drag5

A press on another node takes it alone, and the selection stays.

```yaml
tags: common
```

```buffer
▸
- «a
- b»
- c③
```

> move ③

```buffer
- c③
- «a
- b»
```

## Drag5b

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

> move ③

```buffer
- «a
- c③
- b»
```

## Drag5c

The selection dropped between its own nodes is at its own place, read with them taken out: nothing
changes. One column in, the place would be inside `a`, `into-itself`.

```yaml
tags: edge
```

```buffer
- «a
▸
- b»②
- c
```

> move ②

```yaml
result: applied
```

```buffer
- «a
- b»②
- c
```

## Drag6

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

## Drag6b

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

> move ②

```yaml
result: applied
```

```buffer
- a
- b┃②
- c
```

## Drag6c

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

## Drag7

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

## Drag8

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

> move ②

```buffer
- a

  - para┃②
```

## Drag9

A heading can't be an item.

```yaml
tags: edge
```

```buffer
- a
  ▸

# H┃②
```

> move ②

```yaml
result: rejected not-expressible
```

## Drag12

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

> move ②

```yaml
result: rejected into-itself
```

## Drag13

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

> move ②

```buffer
p

x┃②
```

## Drag14

A task there is refused: as a paragraph its checkbox would be text.

```yaml
tags: edge
```

```buffer
- [ ] x┃②

p
▸
```

> move ②

```yaml
result: rejected not-expressible
```

## Drag15

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

> move ②

```buffer
# A
## B
## D┃②
### E
# C
```

## Drag16

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

> move ②

```buffer
# A
x
## D┃②
### E
# C
```

## Drag17

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

> move ②

```yaml
result: rejected at-h6-bound
```

## Drag18

A selection across parents, pressed on one of its own nodes, is refused, as a structural command
refuses it; pressed on another node, it takes that one alone.

```yaml
tags: edge
```

```buffer
- a
  - «b
- c»③
▸
```

> move ③

```yaml
result: rejected non-contiguous
```

## Drag19

A heading dropped before a paragraph would take it into its section: refused.

```yaml
tags: edge
```

```buffer
▸
para

# H┃②
```

> move ②

```yaml
result: rejected would-reparent
```

## Drag20

A move with no press takes the selection's nodes, as a keyboard drag or a "move to" dialog does;
lists are renumbered.

```yaml
tags: common
```

```buffer
▸
1. a
2. «b
3. c»
```

> move

```buffer
1. «b
2. c»
3. a
```

## Drag21

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

> move ②

```buffer
> Quote:

one┃②
```

## Drag22

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

## Drag23

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

## Drag24

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

## Drag25

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

## Drag26

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

## Drag30

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

> move ①

```buffer
1. a
- x┃①

2. b
```

## Drag31

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

> move ②

````buffer
- a
- b
```②
x┃
```
````

## Drag32

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

> move ②

```buffer
- a
- b
  - a1┃②
```

## Drag33

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

> move ①

```buffer
- b

- c

- a┃①
```

## Drag10

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

## Drag11

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

## Drag27

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

## Drag28

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

## Drag29

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
