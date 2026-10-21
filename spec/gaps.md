# Blank lines

Blank lines belong to the node above them, as its **trailing gap**: a node's span is its own lines,
then its gap, then its children. The blank lines after a subtree are its last descendant's gap.
Blank lines above the document's first node are the **preamble**, which belongs to no node.

Their consequences, drawn below:

- **A node's gap travels with it.** A move carries the blank lines after a node along with the node.
  The exception is a gap that ends its scope (after the last of a parent's children, a list's last
  item, or the document's last node). It separates the whole scope from what follows, so it stays
  at the scope's end, and the two nodes swap around the blank lines between them.
- **A caret on a blank line is in the gap of the node above.** Structural keys there act on that
  node, and the blank lines are left as they are. The caret stays in the gap where the gap goes with
  the node (Gap14); where it doesn't (a gap that ends its scope), the caret goes with the node, to
  the end of its text, so a second press acts on it again
  ([MoveUp39](move-subtree-up.md#moveup39), [MoveDown38](move-subtree-down.md#movedown38)). In the
  preamble there is no node above: the keys are refused (`nothing-above`), not left to the host,
  whose Tab there would start indented code.
- **A command writes a blank line only where the structure needs one**: to end a list before a
  paragraph, to keep an empty item from reading as a setext underline, to separate two paragraphs;
  where a list or a section has none, it adds none (Gap6, Gap13). Joins take the blank lines between
  the two nodes with them ([Delete17](delete.md#delete17)); other commands leave blank lines where they
  are, but for one that no longer separates anything: a node that was right after another, set off
  by a blank line, and is now its first item in a tight list takes none
  ([Outdent15](outdent.md#outdent15)), nor one that was right after a tight list and is now its
  last item ([Indent29](indent.md#indent29), [Quote18](quotes.md#quote18)).
- **Frontmatter is a preamble too**, in the Obsidian flavor: no node, its lines the host's (Gap19).

A node's span is ourus's model, for blank lines that the block outliners don't have. Bare Obsidian
moves lines, not nodes, so its moves leave gaps behind, and a paragraph moved next to another runs
into it.

## moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down)

### Gap1

Gaps travel with their nodes: `a`'s three blank lines stay below `a`, and `b`'s one below `b`.

```yaml
tags: core
```

```buffer
a

b┃

c
```

> moveSubtreeUp

```buffer
b┃

a

c
```

### Gap2

Moving down carries the gap too.

```yaml
tags: core
```

```buffer
a┃

b

c
```

> moveSubtreeDown

```buffer
b

a┃

c
```

### Gap3

A section carries its last line's gap.

```yaml
tags: common
```

```buffer
# A
text

# B┃
more

# C
```

> moveSubtreeUp

```buffer
# B┃
more

# A
text

# C
```

### Gap4

An item carries its gap inside a loose list.

```yaml
tags: common
```

```buffer
- a

- b┃
- c
```

> moveSubtreeUp

```buffer
- b┃
- a

- c
```

### Gap5

A subtree's gap is its last descendant's.

```yaml
tags: common
```

```buffer
- a
  - a1

- b┃
- c
```

> moveSubtreeUp

```buffer
- b┃
- a
  - a1

- c
```

### Gap6

Sections written without blank lines stay without: a blank line is added only where the text needs
one to keep the two apart.

```yaml
tags: edge
```

```buffer
## A┃
a
## B
b
## C
```

> moveSubtreeDown

```buffer
## B
b
## A┃
a
## C
```

### Gap7

A paragraph landing above another one is set off by a blank line: without it, `x` and `q` would read
as one paragraph.

```yaml
tags: edge
```

````buffer
x┃
```
code
```

q
````

> moveSubtreeDown

````buffer
```
code
```

x┃

q
````

### Gap8

The gap ending a list stays at the list's end: it separates the list from `para`. Gone up with `b`,
it would loosen the list, and `para` would continue `a` lazily.

```yaml
tags: common
```

```buffer
- a
- b┃

para
```

> moveSubtreeUp

```buffer
- b┃
- a

para
```

### Gap9

The gap ending a parent's children stays at their end.

```yaml
tags: common
```

```buffer
- p
  - x

  - y┃

- q
```

> moveSubtreeUp

```buffer
- p
  - y┃

  - x

- q
```

### Gap10

The document's trailing blank lines stay at its end.

```yaml
tags: edge
```

```buffer
a

b┃

```

> moveSubtreeUp

```buffer
b┃

a

```

### Gap11

The preamble stays at the top.

```yaml
tags: edge
```

```buffer

a┃

b

c
```

> moveSubtreeDown

```buffer

b

a┃

c
```

## New text and gaps

### Gap12

Enter at the end of a heading keeps its gap below the new paragraph.

```yaml
tags: core
```

```buffer
## S┃

p
```

> enter

```buffer
## S
┃◌

p
```

### Gap13

Items pasted at the end of a tight list keep it tight.

```yaml
tags: common
clipboard: |
  - a
  - b
```

```buffer
- t┃

para
```

> paste

```buffer
- t
- a
- b┃

para
```

## Keys on a blank line

### Gap14

Moving from a blank line moves the node above: the caret is in `b`'s gap, so `b` moves, and the gap
and the caret with it.

```yaml
tags: common
```

```buffer
a

b
┃

c
```

> moveSubtreeUp

```buffer
b
┃

a

c
```

### Gap15

Tab on a blank line indents the node above, whose gap it is, as Move does from there
([Gap14](#gap14)). No outliner puts the caret on a blank line, so none has a say; refusing would
leave the key dead, and the host's Tab would start indented code. Bare Obsidian and its Outliner
indent the blank line itself.

```yaml
tags: common
```

```buffer
- a
- b
┃
- c
```

> indent

```buffer
- a
  - b
┃
- c
```

### Gap16

Shift-Tab on a blank line outdents the node above, for the same reasons
([Gap15](#gap15)).

```yaml
tags: common
```

```buffer
- a
  - b
┃
- c
```

> outdent

```buffer
- a
- b
┃
- c
```

### Gap17

A blank line between a node's text and its first child is the node's.

```yaml
tags: edge
```

```buffer
- a
┃
  b
- c
```

> moveSubtreeDown

```buffer
- c
- a
┃
  b
```

### Gap18

Keys in the preamble do nothing: there is no node above the preamble's blank lines for them to act
on, so ourus refuses them, rather than leave them to the host, whose Tab there would start indented
code.

```yaml
tags: edge
```

```buffer
┃

a
```

> moveSubtreeDown

```yaml
result: rejected nothing-above
```

```buffer
┃

a
```

> indent

```yaml
result: rejected nothing-above
```

```buffer
┃

a
```

### Gap19

In the Obsidian flavor frontmatter is the preamble, no node, so Enter in it is the host's newline.
(CommonMark and GFM have no frontmatter: there `a: b` / `---` is a setext heading.)

```yaml
tags: edge
flavor: obsidian
```

```buffer
---
a: b┃
---
- x
```

> enter

```buffer
---
a: b
┃
---
- x
```
