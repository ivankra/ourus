# Outdent

Command: `outdent` (Shift-Tab). Its inverse is [`indent`](indent.md).

Outdent takes the selected nodes (contiguous siblings of one kind) one level up, with their
subtrees. The rules, in order; the first that applies wins:

1. **On a code line**, Shift-Tab is the host's ([Fence21](fences.md#fence21)).
2. **A heading goes one level up in place**, the headings in its section with it (Outdent4),
   whatever the `outdent` option: its level is its own text, and the headings after it at its old
   level become its subsections (Outdent11, LogicalOutdent5). Past `#` it is refused (Outdent5).
3. **Out of a quote**, the node leaves it where it is, splitting it (`direct`), or becomes its next
   sibling (`logical`) ([quotes.md](quotes.md#quote12)).
4. **An item becomes the next sibling of its parent**, its subtree coming along (Outdent1,
   Outdent3). What happens to its later siblings is the `outdent` option:
     * [direct](#direct-outdent) (the default, as in Logseq) makes them its children,
       after its own, so the document order stays;
     * [logical](#logical-outdent) (as in WorkFlowy and Roam) keeps them with their parent,
       and the item moves past them.
5. **At the top level, the first item of a list becomes a paragraph**, placed as the option says
   (DirectOutdent2, DirectOutdent3, DirectOutdent4, LogicalOutdent2, LogicalOutdent3,
   LogicalOutdent4); any other top-level item is refused (`at-top-level`, Outdent2); a selection
   from the first item on outdents together, each item a paragraph (Outdent8, Outdent12). Indent
   makes it an item again ([Indent21](indent.md#indent21)). An item whose text is a heading becomes
   that heading, the rest of the list its section (Outdent17, Outdent17b); where it would take in
   what follows the list, or end the section it is in, it is refused (Outdent18). One whose text is
   code or another block of lines becomes that block, its children items after it (Outdent19).
6. **Blank lines go only where the structure needs one**: an empty item left right under an item's
   text is set off by one, as when the caret leaves it (Outdent7), and so is one left right under a
   paragraph's (Outdent16); a paragraph needs one before it,
   not before its own list (Outdent8).

Indent and outdent invert (Outdent9, Outdent10), except where direct outdent gave the item its later
siblings: indent takes them along (Outdent13). The caret ends in the item's text, even from before
its marker (Outdent14).

Bare Obsidian's Shift-Tab unindents the caret's line: an item's children stay indented, which keeps
them its children here only by luck of their extra indentation; at the top level it does nothing.
Obsidian's Outliner outdents logically, as WorkFlowy and Roam.

## Outdent1

Item becomes next sibling of its parent.

```yaml
rank: core
```

```buffer
- a
  - b┃
```

> outdent

```buffer
- a
- b┃
```

## Outdent2

A top-level item that isn't the first of its list can't outdent: its paragraph would split the
list, and no app measured outdents a top-level item.

```yaml
rank: common
```

```buffer
- a
- b┃
```

> outdent

```result
rejected: at-top-level
```

```buffer
- a
- b┃
```

## Outdent3

Tab-nested item outdents.

```yaml
rank: common
```

```buffer
- a
→- b┃
```

> outdent

```buffer
- a
- b┃
```

## Outdent4

A heading goes up a level, its section's headings with it: Indent12's inverse. Bare Obsidian does
nothing.

```yaml
rank: common
```

```buffer
## A┃
### B
```

> outdent

```buffer
# A┃
## B
```

## Outdent5

H1 cannot outdent further.

```yaml
rank: edge
```

```buffer
# A┃
```

> outdent

```result
rejected: at-h1-bound
```

```buffer
# A┃
```

## Outdent6

Outdent in a loose list stays loose.

Outdenting from the middle of a loose list keeps it loose. (With direct outdent, `c` becomes
`b`'s child.)

```yaml
rank: edge
```

```buffer
- a

  - b┃

  - c

- d
```

> outdent

```buffer
- a

- b┃

  - c

- d
```

## Outdent7

The empty item after `x` becomes its child (direct outdent). Right under `x`'s text it would read
as a setext underline, and the caret isn't there to hold it, so a blank line sets it off, as when
the caret leaves such an item. Every app outdents here.

```yaml
rank: rare
```

```buffer
- a
  - ┃x
  - 
```

> outdent

```buffer
- a
- ┃x

  - 
```

## Outdent8

Outdenting several items of a paragraph's list makes each a paragraph.

Each becomes a paragraph; a child goes with its item, which now owns it, right under it as in
DirectOutdent4. Blank lines go only where a paragraph needs one. Bare Obsidian does nothing.

```yaml
rank: edge
```

```buffer
para
- «a
  - b
- c»
```

> outdent

```buffer
para

«a
- b

c»
```

## Outdent9

An ordered item outdents into its parent's list, numbered on, and the items after it renumber:
Indent4's inverse.

```yaml
rank: common
```

```buffer
1. a
   1. b┃
2. c
```

> outdent

```buffer
1. a
2. b┃
3. c
```

## Outdent10

Selected siblings outdent together: Indent9's inverse.

```yaml
rank: common
```

```buffer
- a
  - «b
  - c»
- d
```

> outdent

```buffer
- a
- «b
- c»
- d
```

## Outdent11

A heading goes up a level in place; the heading after it, now a level below it, becomes its
subsection.

```yaml
rank: common
```

```buffer
# T
## A┃
## B
```

> outdent

```buffer
# T
# A┃
## B
```

## Outdent12

A selection of top-level items from the list's first: each becomes a paragraph. `b` alone couldn't
outdent (Outdent2), but goes with the item above it.

```yaml
rank: edge
```

```buffer
- «a
- b»
```

> outdent

```buffer
«a

b»
```

## Outdent13

Outdent, then indent: the item is back, but direct outdent gave it `d`, which indent takes along.
The inverse pair's stated exception.

```yaml
rank: edge
```

```buffer
- a
  - b┃
    - c
  - d
```

> outdent

```buffer
- a
- b┃
  - c
  - d
```

> indent

```buffer
- a
  - b┃
    - c
    - d
```

## Outdent14

From before the marker, Shift-Tab outdents the item and the caret ends in its text (Indent28's
mirror).

```yaml
rank: rare
```

```buffer
- a
  ┃- b
```

> outdent

```buffer
- a
- ┃b
```

## Outdent15

Out of a paragraph's list and back: outdented, `b` is a paragraph, set off by the blank line two
paragraphs need; indented back, it is the paragraph's list again, which needs none, and the blank
line goes: the text comes back as it was.

```yaml
rank: edge
```

```buffer
para
- b┃
```

> outdent

```buffer
para

b┃
```

> indent

```buffer
para
- b┃
```

## Direct outdent

Direct outdent keeps the item and its subtree in document order. Later siblings become its
children, after its existing children; their subtrees come along. It is the default
(`outdent: direct`), as in Logseq, Tine, SiYuan, BlockNote, true-outliner, and Dynalist with its
"unindent in place" preference. Bare Obsidian, which unindents only the caret's line, leaves the
later siblings under it too.

### DirectOutdent1

```yaml
rank: core
```

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> outdent

```buffer
- a
- b┃
  - b1
  - c
- d
```

### DirectOutdent2

At the top level, the first item of a list becomes a paragraph, one level above a top-level item
(Indent22's inverse). The rest of its list stays where it is and becomes the paragraph's list.
Bare Obsidian does nothing.

```yaml
rank: common
```

```buffer
- a┃
- b
```

> outdent

```buffer
a┃
- b
```

### DirectOutdent3

The item's children stay its children, before the items that followed it. The list is flat: `a1`
is now level with `b`.

```yaml
rank: edge
```

```buffer
- a┃
  - a1
- b
```

> outdent

```buffer
a┃
- a1
- b
```

### DirectOutdent4

An item of a paragraph's list leaves the paragraph and becomes a paragraph after it. The items
after it come along, and become the new paragraph's list.

```yaml
rank: edge
```

```buffer
para
- a┃
- b
```

> outdent

```buffer
para

a┃
- b
```

## Logical outdent

Logical outdent moves the item and its subtree after its parent. Later siblings keep their
parent, so the moved subtree passes them in document order: as in WorkFlowy, Roam, Dynalist (by
default) and Obsidian's Outliner, and Logseq and Tine with their "logical outdenting" setting. Set
with `outdent: logical`, which each case below sets in a config block.

### LogicalOutdent1

```yaml
rank: common
outdent: logical
```

```buffer
- a
  - b┃
    - b1
  - c
- d
```

> outdent

```buffer
- a
  - c
- b┃
  - b1
- d
```

### LogicalOutdent2

At the top level, the first item of a list becomes a paragraph. It passes the rest of its list,
which keeps its parent, and follows it, set off by a blank line.

```yaml
rank: edge
outdent: logical
```

```buffer
- a┃
- b
```

> outdent

```buffer
- b

a┃
```

### LogicalOutdent3

The item's children come along. Below the new paragraph, they become its list.

```yaml
rank: edge
outdent: logical
```

```buffer
- a┃
  - a1
- b
```

> outdent

```buffer
- b

a┃
- a1
```

### LogicalOutdent4

An item of a paragraph's list leaves the paragraph and becomes a paragraph after it. The items
after it stay with their paragraph, so the new paragraph goes past them.

```yaml
rank: edge
outdent: logical
```

```buffer
para
- a┃
- b
```

> outdent

```buffer
para
- b

a┃
```

### LogicalOutdent5

A heading outdents in place under logical outdent too: keeping the headings after it under their
parent would move whole sections past each other (Outdent11).

```yaml
rank: edge
outdent: logical
```

```buffer
# T
## A┃
## B
```

> outdent

```buffer
# T
# A┃
## B
```

## Outdent16

The first item outdented to a paragraph right above an empty item: a blank line sets the empty item
off, which right under the paragraph's text would read as a setext underline.

```yaml
rank: rare
```

```buffer
┃1. n
- 
  - g
```

> outdent

```buffer
┃n

- 
  - g
```

## Outdent17

At the top level, the first item of a list whose text is a heading becomes that heading: its text is
a heading, and as a paragraph its `#` would read as one anyway. The rest of the list is its section,
as it would be a paragraph's list. Indent doesn't make it an item again: on a heading it deepens the
level ([Indent12](indent.md#indent12)).

```yaml
rank: rare
```

```buffer
- ┃# H
- b
```

> outdent

```buffer
# ┃H
- b
```

## Outdent17b

With `outdent: logical`, the heading follows the rest of the list, which stays a list.

```yaml
rank: rare
outdent: logical
```

```buffer
- ┃# H
- b
```

> outdent

```buffer
- b
# ┃H
```

## Outdent18

Where the heading would take in what follows the list, a paragraph or a list of its own, as its
section, outdent is refused; so it is where its level would end the section it is in.

```yaml
rank: rare
```

```buffer
- ┃# H
- b

after
```

> outdent

```result
rejected: not-expressible
```

```buffer
- ┃# H
- b

after
```

## Outdent19

At the top level, an item whose text is fenced code becomes the code block, its children the items
after it: a block of lines has no list of its own (the README's guarantee 4 names them). The caret
goes into the code, where typing can't break its fence. Indent
doesn't make it an item again: with nothing above, a block has nothing to be an item of.

```yaml
rank: rare
```

````buffer
- ┃```
  code
  ```
  - c
- d
````

> outdent

````buffer
```
┃code
```
- c
- d
````
