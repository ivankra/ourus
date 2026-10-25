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
5. **At the top level, an item becomes a paragraph in place**, under either value of the option
   (there is no parent for logical outdent to keep the later items with): the first of a list
   (DirectOutdent2, DirectOutdent3, LogicalOutdent2, LogicalOutdent3) or a later one, set off from the items above it (Outdent2, DirectOutdent5,
   DirectOutdent6, LogicalOutdent6), the items after it its list. In a paragraph's list the
   paragraph is its parent: direct makes the item a paragraph in place (DirectOutdent4), logical
   after the paragraph's list, which keeps the later items (LogicalOutdent4). A selection outdents together,
   each item a paragraph (Outdent8, Outdent12). Indent makes it an item again
   ([Indent21](indent.md#indent21)), in the list it left where it follows one (Outdent2,
   [Indent29](indent.md#indent29)). An item whose text is a heading becomes
   that heading, the rest of the list its section (Outdent17, Outdent17b); where it would take in
   what follows the list, or end the section it is in, it is refused (Outdent18). One whose text is
   code or another block of lines becomes that block, its children items after it (Outdent19).
   Lines its text continues lazily stay its text: escaped where, the paragraph's own lines, they
   would start a block (a table's delimiter row, a setext underline; Outdent20, Outdent20b).
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
tags: core
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

A top-level item after another becomes a paragraph, as the first does
([DirectOutdent2](#directoutdent2)): after the items above it, set off from them by a blank line, the
items after it its list ([DirectOutdent5](#directoutdent5)), as RemNote without bullets and SiYuan
make it a paragraph. The outliners, which hold no paragraphs, do nothing, and so do bare Obsidian
and its Outliner. Indented, the paragraph is an item of the list again, beside `a`, as any paragraph
after a list ([Indent29](indent.md#indent29)), as RemNote gives it back.

```yaml
tags: common free-form
```

```buffer
- a
- b┃
```

> outdent

```buffer
- a

b┃
```

> indent

```buffer
- a
- b┃
```

## Outdent3

Tab-nested item outdents.

```yaml
tags: common
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
tags: common free-form
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
tags: edge free-form
```

```buffer
# A┃
```

> outdent

```yaml
result: rejected at-h1-bound
```

```buffer
# A┃
```

## Outdent6

Outdent in a loose list stays loose.

Outdenting from the middle of a loose list keeps it loose. (With direct outdent, `c` becomes
`b`'s child.)

```yaml
tags: edge
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
tags: rare
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
tags: edge
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
tags: common
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
tags: common
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
subsection. Indented back, `A` takes `B` down with it, as its subsection: Markdown has no way to keep
`B` where it was.

```yaml
tags: common free-form
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

> indent

```buffer
# T
## A┃
### B
```

## Outdent12

A selection of top-level items from the list's first: each becomes a paragraph. `b` alone couldn't
outdent (Outdent2), but goes with the item above it.

```yaml
tags: edge free-form
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
tags: edge
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
tags: rare
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
tags: edge
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
tags: core
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
tags: common free-form
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
tags: edge free-form
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
tags: edge
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

### DirectOutdent5

A later top-level item becomes a paragraph in place, the items after it its list, as the first
item's do ([DirectOutdent2](#directoutdent2)).

```yaml
tags: edge free-form
```

```buffer
- a
- b┃
- c
```

> outdent

```buffer
- a

b┃
- c
```

### DirectOutdent6

In an ordered list, the items after it start again at 1: a list that follows a paragraph has to,
or the paragraph would take it in as text.

```yaml
tags: rare free-form
```

```buffer
1. a
2. b┃
3. c
```

> outdent

```buffer
1. a

b┃
1. c
```

## Logical outdent

Logical outdent moves the item and its subtree after its parent. Later siblings keep their
parent, so the moved subtree passes them in document order (at the top level, with no parent, an
item outdents in place as with direct, LogicalOutdent2): as in WorkFlowy, Roam, Dynalist (by
default) and Obsidian's Outliner, and Logseq and Tine with their "logical outdenting" setting. Set
with `outdent: logical`, which each case below sets in a config block.

### LogicalOutdent1

```yaml
tags: common
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

At the top level there is no parent for the rest of the list to keep, so logical outdent does what
direct does: the item becomes a paragraph in place, the rest of the list its list
([DirectOutdent2](#directoutdent2)), as RemNote, the one logical app that holds paragraphs, makes it.
Moving it past the rest of the list would carry the text far; the outliners, holding no paragraphs,
do nothing, and so does Obsidian's Outliner.

```yaml
tags: edge free-form
outdent: logical
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

### LogicalOutdent3

The item's children come along, and with the rest of the list they are the paragraph's list, as
direct outdent has it ([DirectOutdent3](#directoutdent3)).

```yaml
tags: edge free-form
outdent: logical
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

### LogicalOutdent4

An item of a paragraph's list leaves the paragraph and becomes a paragraph after it. The items
after it stay with their paragraph, their parent, so the new paragraph goes past them, as the block
outliners move an item out of a parent block; RemNote makes it a paragraph in place.

```yaml
tags: edge
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

### LogicalOutdent6

A later top-level item becomes a paragraph in place, set off from the items above, the items after
it its list, as direct outdent has it ([DirectOutdent5](#directoutdent5)), and as RemNote makes it.

```yaml
tags: edge free-form
outdent: logical
```

```buffer
- a
- b┃
- c
```

> outdent

```buffer
- a

b┃
- c
```

### LogicalOutdent5

A heading outdents in place under logical outdent too: keeping the headings after it under their
parent would move whole sections past each other (Outdent11), whose inverse this shares.

```yaml
tags: edge free-form
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

> indent

```buffer
# T
## A┃
### B
```

## Outdent16

The first item outdented to a paragraph right above an empty item: a blank line sets the empty item
off, which right under the paragraph's text would read as a setext underline.

```yaml
tags: rare free-form
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
tags: rare free-form
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

With `outdent: logical` the same as with direct ([Outdent17](#outdent17)): at the top level there is
no parent to keep the rest of the list, so the heading takes it in as its section.

```yaml
tags: rare free-form
outdent: logical
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

## Outdent18

Where the heading would take in what follows the list, a paragraph or a list of its own, as its
section, outdent is refused; so it is where its level would end the section it is in.

```yaml
tags: rare free-form
```

```buffer
- ┃# H
- b

after
```

> outdent

```yaml
result: rejected not-expressible
```

```buffer
- ┃# H
- b

after
```

## Outdent19

At the top level, an item whose text is fenced code becomes the code block, its children the items
after it: a block of lines has no list of its own (the README's guarantee 4 names them). The caret
stays on the fence, where the user had it, as after indent where the host shows markup as text
([Indent31](indent.md#indent31)); where it decorates markup, it goes into the code (Outdent19b).
Indent doesn't make it an item again: with nothing above, a block has nothing to be an item of.

```yaml
tags: rare free-form markup-fence
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
┃```
code
```
- c
- d
````

## Outdent19b

The same where the host decorates markup (`markup: decorated`): the caret goes into the code, where
typing can't break its fence.

```yaml
tags: rare free-form markup-fence
markup: decorated
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

## Outdent20

Lines that continue an item's text lazily, at column 0, are its text however they look, as GFM's
readers take them (micromark, markdown-it). A paragraph's own lines are read otherwise: `|---|---|`
under `| a | b |` would make the two a table, so the item made a paragraph escapes it.

```yaml
tags: rare free-form
flavor: gfm
```

```buffer
- t1┃
| a | b |
|---|---|
```

> outdent

```buffer
t1┃
| a | b |
|\---|---|
```

## Outdent20b

The same for a line that would underline the paragraph into a setext heading.

```yaml
tags: rare free-form
```

```buffer
- t1┃
===
```

> outdent

```buffer
t1┃
\===
```

## Outdent21

Every child of an item with no text of its own (`- - b`) outdented: the item would hold
nothing, so it goes, its children in its place.

```yaml
tags: edge
```

```buffer
- a
- - ┃b
```

> outdent

```buffer
- a
- ┃b
```
