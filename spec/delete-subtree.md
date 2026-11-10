# Delete subtree

Command: `deleteSubtree`.

The rules:

1. **The selected nodes go, with their subtrees**: a paragraph with the list it owns, a heading with
   its section (DeleteSubtree1, DeleteSubtree3); a quote without text they are all of goes with them
   (DeleteSubtree7).
2. **The caret goes to the end of the text above**, or, when the first node goes, to the start of
   the text that follows, after its marker (DeleteSubtree1, DeleteSubtree3, DeleteSubtree4).
   What the deleted node kept apart is set apart by a blank line: a paragraph of an item, now
   right under its text, which it would continue (DeleteSubtree8). Right under code (code, math, a
   comment), where the end of the text above is a line of the code, the caret stays where the first
   node was instead, on an empty node of its kind held there, as a text editor leaves the line a cut
   took: what is typed or pasted next goes there, not into the code (DeleteSubtree15,
   DeleteSubtree16, Cut5).
3. **A list the command touches is renumbered** (DeleteSubtree2).
4. **Selected nodes go together** (DeleteSubtree5).
5. **The document's only nodes leave it empty** (DeleteSubtree6).
6. **A thematic break that comes first in an Obsidian note**, where its `---` would open the
   frontmatter, is set off by a blank line above it (DeleteSubtree9); a `***` opens none
   (DeleteSubtree10).

## DeleteSubtree1

A node goes with its children.

```yaml
tags: core
```

```markdown
- a
- b┃
  - c
- d
```

> deleteSubtree

```markdown
- a┃
- d
```

## DeleteSubtree2

Ordered lists renumber.

```yaml
tags: common
```

```markdown
1. a
2. b┃
3. c
```

> deleteSubtree

```markdown
1. a┃
2. c
```

## DeleteSubtree3

The first node: the caret goes to what follows.

A paragraph's list is its children: it goes too.

```yaml
tags: common
```

```markdown
para┃

- x

# H
```

> deleteSubtree

```markdown
# ┃H
```


## DeleteSubtree4

The first item: the caret goes to the next item's text, after its marker, where typing extends it.

```yaml
tags: common
```

```markdown
- a┃
  - a1
- [ ] b
```

> deleteSubtree

```markdown
- [ ] ┃b
```

## DeleteSubtree5

Selected nodes go together; the caret goes to the end of the text before them.

```yaml
tags: common
```

```markdown
- a
- b⟦selected⟧
- c⟦selected⟧
- d
```

> deleteSubtree

```markdown
- a┃
- d
```

## DeleteSubtree6

The document's only node goes, and the document is empty; typed text is then its first paragraph
(an empty buffer has no drawing).

```yaml
tags: common
```

```markdown
- a┃
  - b
```

> deleteSubtree "x"

```markdown
x┃
```

## DeleteSubtree7

Deleting a quote's only node deletes the quote: its `>` alone is no node, and a quote without text
holding nothing can't be written.

```yaml
tags: rare
```

```markdown
- a
> - ┃q
```

> deleteSubtree

```markdown
- a┃
```

## DeleteSubtree8

Code deleted from between an item's text and a paragraph of the item: the paragraph, right under the
text, would continue it, and a blank line keeps it a paragraph of its own. Moving the code below it
does the same ([MoveDown34](move-subtree-down.md#movedown34)).

```yaml
tags: rare markup-fence
```

````markdown
- a
  ┃```
  code
  ```
  x
````

> deleteSubtree

```markdown
- a┃

  x
```

## DeleteSubtree9

In an Obsidian note, deleting what is above a thematic break would put its `---` on the first line,
where, with a `---` below to close it, it would open the note's frontmatter: a blank line above
keeps it a thematic break. The caret goes to the text after it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
┃Intro

---
title: x
---
```

> deleteSubtree

```markdown

---
┃title: x
---
```

## DeleteSubtree10

A thematic break written `***`, first in an Obsidian note: only `---` opens frontmatter, so no blank
line goes above it.

```yaml
tags: rare
flavor: obsidian
```

```markdown
┃a

***
title
---
```

> deleteSubtree

```markdown
***
┃title
---
```

## DeleteSubtree11

An item with no text of its own (`- > q`), its only block deleted: the item goes with it, as a
quote with no title does; it would hold nothing.

```yaml
tags: rare
```

```markdown
- a
- > q┃
```

> deleteSubtree

```markdown
- a┃
```

## DeleteSubtree12

An item with no text of its own whose first block, on its marker's line, is deleted: the block
after it moves up onto that line, past the item's marker (`- - g`), as far left as the item's
content starts (two columns more would move where the item's content starts).

```yaml
tags: rare
quotes: container
```

```markdown
- a
- > q┃
    - g
- b
```

> deleteSubtree

```markdown
- a┃
- - g
- b
```

## DeleteSubtree13

The list between two lists of one marker deleted: the two are one now, Markdown having no seam
between them, and the later one's items line up with the earlier's (at its column, `- c` would
be `a`'s child).

```yaml
tags: rare
```

```markdown
- a
1. n┃

  - c
```

> deleteSubtree

```markdown
- a┃
- c
```

## DeleteSubtree14

A block of lines (code, math, a table) owns no list after it under `listParent: paragraph`, the
default, as a paragraph does: the list is its sibling, and deleting the block leaves it. Under
`listParent: block` it would be the block's children and go with it.

```yaml
tags: rare markup-fence
```

````markdown
┃```
code
```
- c
````

> deleteSubtree

```markdown
- ┃c
```

## DeleteSubtree15

A heading right under code goes: the caret stays where it was, on an empty line held there, not
at the end of the code's last line, so what is typed next is a paragraph, not code.

```yaml
tags: common markup-fence
```

````markdown
```
code
```

# h┃
````

> deleteSubtree "x"

````markdown
```
code
```

x┃
````

## DeleteSubtree16

An item right under an item ending in code goes: an empty item stays in its place, the caret in
it, where what is typed is the item's text.

```yaml
tags: common markup-fence
```

````markdown
- item
  ```
  x
  ```
- ne┃xt
````

> deleteSubtree "y"

````markdown
- item
  ```
  x
  ```
- y┃
````

## DeleteSubtree17

A quote's first paragraph goes, the quote one column in after an item, so outside it: the quote is
the block edited, its lines written at its own column, as it reads, so the line after the one that
went doesn't read into the item (`  > - b` would). A block the edit doesn't touch keeps its lines as
written.

```yaml
tags: rare
```

```markdown
- a
 > x┃
  > - b
```

> deleteSubtree

```markdown
- a┃
 > - b
```
