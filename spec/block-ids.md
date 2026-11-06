# Block ids

A block id names one block, so that a link can find it (`dev/24-block-ids.md`). In Obsidian it is
` ^id` ending a block's text, or `^id` on a line of its own after a block, which Obsidian reads as
naming the block above it in the shapes the doc's §2.1 measured. ourus reads such a line as carried
by the node it names: it moves with the node, a split keeps it with the node the caret was in, and a
merge keeps it with the node that stays or takes the other's, the other's dropped where both have
one (`mergedBlockIds`). Whether ids are unique, and which of two on a block counts (one shadowing the
other), is the host's to decide; so is what a key left to it does to one: ourus writes what it is
given, and refuses none of these.

The first cases are the design's trial (§4.3): a table, a fence, an item, a heading, a paragraph
owning a list; then a block id at a text's end and before a setext underline, Enter, merges,
Shift-Enter, duplicate and cut.

## BlockIds1

A table's block-id line, after a blank line, is carried by the table: it moves with it (bare
Obsidian moves the caret's line past the table, leaving `^t1` naming `Outro.`).

```yaml
tags: rare
flavor: obsidian
```

```markdown
Intro.

| a | b |
| - | - |
| 1 | 2 |

^t1

Out┃ro.
```

> moveSubtreeUp

```markdown
Intro.

Out┃ro.

| a | b |
| - | - |
| 1 | 2 |

^t1
```

## BlockIds2

A fence's, directly under its closing line, too.

```yaml
tags: rare
flavor: obsidian
```

````markdown
┃p

```
code
```
^f1

q
````

> moveSubtreeDown

````markdown
```
code
```
^f1

┃p

q
````

## BlockIds3

An item's block-id line, indented under its text after a blank line, is the item's: it moves with
it, its children after it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- ┃a

  ^x
  - c
- b
```

> moveSubtreeDown

```markdown
- b
- ┃a

  ^x
  - c
```

## BlockIds4

A heading's block-id line is the heading's, not a paragraph of its section: it moves with the
heading.

```yaml
tags: rare markup-heading
flavor: obsidian
```

```markdown
## H

^h2

body

## ┃G
```

> moveSubtreeUp

```markdown
## ┃G

## H

^h2

body
```

## BlockIds5

A block-id line under a paragraph is the paragraph's, so the list after it is the paragraph's
children (`listParent: paragraph`), as Obsidian names the paragraph: they move together.

```yaml
tags: rare
flavor: obsidian
```

```markdown
Le┃ad.

^id4

- a

Next
```

> moveSubtreeDown

```markdown
Next

Le┃ad.

^id4

- a
```

## BlockIds6

A node with a block-id line that something comes to follow is set off from it by a blank line: right
under it, the next block would join the block-id line, which then names nothing.

```yaml
tags: rare
flavor: obsidian
```

```markdown
┃q

p

^y
```

> moveSubtreeDown

```markdown
p

^y

┃q
```

## BlockIds7

Enter mid-text keeps the block id with the node the caret was in, as Logseq keeps a block's id:
links to `^x` still find `foo` (bare Obsidian moves ` ^x` with `bar`).

```yaml
tags: common
flavor: obsidian
```

```markdown
- foo ┃bar ^x
```

> enter

```markdown
- foo  ^x
- ┃bar
```

## BlockIds8

At a heading's end, Enter makes the new paragraph after its block-id line, a blank line between:
right under `^h2`, typed in, it would join it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
## H┃

^h2

body
```

> enter

```markdown
## H

^h2

┃◌

body
```

## BlockIds9

Mid-heading, the rest is the section's first paragraph, after the heading's block-id line.

```yaml
tags: rare
flavor: obsidian
```

```markdown
## H┃I

^h2
```

> enter

```markdown
## H

^h2

┃I
```

## BlockIds10

A block id before a setext underline is its title's end: Enter there keeps both with the title.

```yaml
tags: rare
flavor: obsidian
```

```markdown
Title ^x┃
===
```

> enter

```markdown
Title ^x
===
┃◌
```

## BlockIds11

A merge into a node with no block id takes the other's, so links to `^y` still find its text, as
Logseq OG does.

```yaml
tags: common
flavor: obsidian
```

```markdown
- a
- ┃b ^y
```

> deleteContentBackward

```markdown
- a┃b ^y
```

## BlockIds12

Where both have one, the node that stays keeps its own and the other's goes; the result says which
went into which (`mergedBlockIds`), for a host that redirects the links to it.

```yaml
tags: common
flavor: obsidian
```

```markdown
- a ^x
- ┃b ^y
```

> deleteContentBackward

```markdown
- a┃b ^x
```

## BlockIds13

The node that stays keeps its block-id line; the merged text goes before it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- a

  ^x
- ┃b
```

> deleteContentBackward

```markdown
- a┃b

  ^x
```

## BlockIds14

A block-id line the merge takes, alone, comes as ` ^id` at the text's end: carried under the item,
it would set a blank line in the tight list.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- a
- ┃b

  ^p3
- c
```

> deleteContentBackward

```markdown
- a┃b ^p3
- c
```

## BlockIds15

A text that is only a block id is no empty node: Enter makes a node after it, and Backspace at its
start merges it, its block id with a blank before it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- a
- ┃^x
```

> deleteContentBackward

```markdown
- a┃ ^x
```

## BlockIds16

At the end of a text that is only a block id, Enter makes a new item after it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- a
- ^x┃
```

> enter

```markdown
- a
- ^x
- ┃
```

## BlockIds17

Typing over a selection across nodes keeps the first node's block id, even where the selection
covers it: the node stays.

```yaml
tags: common
flavor: obsidian
```

```markdown
- a«b ^x
- c»d
```

> deleteContentBackward

```markdown
- a┃d ^x
```

## BlockIds18

Shift-Enter after a block id ending the text breaks the line before it: the block id stays at the
end of the text's last line.

```yaml
tags: common
flavor: obsidian
```

```markdown
- foo ^x┃
```

> shiftEnter

```markdown
- foo
  ┃ ^x
```

## BlockIds19

With the caret on a block-id line, Enter acts at the end of the text that carries it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
## H

^h┃2

body
```

> enter

```markdown
## H

^h2

┃◌

body
```

## BlockIds20

Duplicate copies the block ids with the nodes, as written: block ids needn't be unique, and ourus
keeps none so (a link finds the first, the original). It dropped them, a host's choice.

```yaml
tags: common
flavor: obsidian
```

```markdown
- ┃a ^x
  - c

    ^y
- b
```

> duplicateSubtree

```markdown
- a ^x
  - c

    ^y
- ┃a ^x
  - c

    ^y
- b
```

## BlockIds21

A cut takes a block id the selection covers, as typed text: the user chose it.

```yaml
tags: common
flavor: obsidian
```

```markdown
- «a ^x»
- b
```

> cut

```yaml
clipboard: "a ^x"
```

```markdown
- ┃
- b
```
