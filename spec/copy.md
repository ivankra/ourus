# Copy and cut

Commands: `copy` (Ctrl-C) and `cut` (Ctrl-X). What the host's clipboard gets is the result's
`clipboard`; [paste](paste.md) reads it back.

The rules:

1. **A copy is Markdown**: `text/plain` and `text/markdown` the selected Markdown as written, and
   `text/html` its rendering, marked as ourus's, so that a paste of it reads the text, the source
   (Copy1; [paste-conv.md](paste-conv.md)). The mark is a comment first in the HTML: `<!-- ourus -->`
   for whole nodes, `<!-- ourus text -->` for text (a selection within a node's text, or from inside
   one node into another), which a paste puts in the text ([paste.md](paste.md)). Its ends say how:
   `[` before `text` where the copy starts at a boundary between blocks, `]` after it where it ends at
   one (Copy41, Copy41b); the paste keeps the text on that side apart, and joins it to the copy where
   there is none. An end is at a boundary where the selection takes none of a text on its line there:
   it starts at its line's end (the line break taken), before its line's text (in a marker or a
   prefix) or on a blank line; it ends at or before its line's text, or on a blank line. A selection
   within one node's text has neither: its line breaks are the text's. A selection with both is whole
   nodes, the blocks between (Copy42), as a whole line selected from its start is, and a cut,
   Backspace or Delete takes them out. So, pasted back where a cut leaves the caret, a copy restores
   what was cut. Obsidian writes its copy so; Chromium keeps a `text/markdown` only between its own
   pages, the mark everywhere.
2. **Whole nodes end with a line break**, as a line copied whole does, so that one pastes as a node
   rather than as a phrase in the text (Copy4; [paste-list.md](paste-list.md)'s PasteList8).
3. **Out of what holds it**: the containers that hold the whole selection (a quote's `>`, an item's
   indentation where the selection starts past its marker) are left out, so it reads as it did
   (Copy3). But not the item whose text it starts in, where it goes on into the item's children:
   their lines keep their indentation under it, so a paste into a text puts them back under the item
   there (Copy2).
4. **A caret alone copies its node, with its subtree** (`copyAtCaret: node`, as Tana) (Copy4); with
   `copyAtCaret: host`, the host's (CodeMirror copies the line, a textarea nothing; Roam, Athens,
   WorkFlowy, Dynalist and BlockNote copy nothing, Logseq a block reference) (Copy6).
5. **A selection across nodes is its text** (`copySelection: text`, as BlockNote, Obsidian and
   SilverBullet copy it) (Copy2); with `copySelection: nodes`, the whole nodes it touches with their
   subtrees, as Logseq, Tine, Athens, Tana, Dynalist, RemNote and true-outliner copy them (Copy5);
   refused where those aren't siblings in a row, as `deleteSubtree` refuses them, so that a cut copies
   what it takes out (Copy7).
6. **A cut is the copy, then what it took out**: a text range as Backspace over it deletes it (Cut1,
   Cut2), whole nodes as `deleteSubtree` (Cut3, Cut4): a node cut right under code leaves the
   caret where it was, so a paste puts it back there (Cut5).

## Copy1

A selection in an item's text: its Markdown, the formatting as written.

```yaml
tags: core
```

```markdown
- one «two **b**»
```

> copy

```yaml
clipboard:
  text/plain: 'two **b**'
  text/markdown: 'two **b**'
  text/html: |
    <!-- ourus text --><p>two <strong>b</strong></p>
```

```markdown
- one «two **b**»
```

## Copy2

A selection across nodes, from inside an item's text into its child: the text, its child's line
indented under it as it is, so a paste into an item's text makes it that item's child again
(Paste29e).

```yaml
tags: common
```

```markdown
- one «two
  - ki»d
- three
```

> copy

```yaml
clipboard:
  text/plain: |-
    two
      - ki
  text/markdown: |-
    two
      - ki
  text/html: |
    <!-- ourus text --><p>two</p>
    <ul>
    <li>ki</li>
    </ul>
```

## Copy3

In a quote, the `>` is the quote's, not the copy's.

```yaml
tags: common
```

```markdown
> a «b
> c» d
```

> copy

```yaml
clipboard:
  text/plain: |-
    b
    c
  text/markdown: |-
    b
    c
  text/html: |
    <!-- ourus text --><p>b
    c</p>
```

## Copy4

A caret alone: the node at the caret, with its subtree, out of its parent.

```yaml
tags: common
```

```markdown
- a
  - k┃id
    - g
- b
```

> copy

```yaml
clipboard:
  text/plain: |
    - kid
      - g
  text/markdown: |
    - kid
      - g
  text/html: |
    <!-- ourus --><ul>
    <li>kid
    <ul>
    <li>g</li>
    </ul>
    </li>
    </ul>
```

## Copy4b

With `copyAtCaret: text`, a caret alone copies the text of the node at it, without its marker or
its children, as a selection over that text is copied (AFFiNE, Moo.do, SiYuan).

```yaml
tags: rare
copyAtCaret: text
```

```markdown
- a
  - k┃id
    - g
- b
```

> copy

```yaml
clipboard:
  text/plain: 'kid'
  text/markdown: 'kid'
  text/html: |
    <!-- ourus text --><p>kid</p>
```

```markdown
- a
  - k┃id
    - g
- b
```

## Copy5

With `copySelection: nodes`, the whole nodes the selection touches, with their subtrees.

```yaml
tags: rare
copySelection: nodes
```

```markdown
- one «two
  - ki»d
- three
```

> copy

```yaml
clipboard:
  text/plain: |
    - one two
      - kid
  text/markdown: |
    - one two
      - kid
  text/html: |
    <!-- ourus --><ul>
    <li>one two
    <ul>
    <li>kid</li>
    </ul>
    </li>
    </ul>
```

## Copy6

With `copyAtCaret: host`, a caret alone: the host's copy.

```yaml
tags: rare
copyAtCaret: host
```

```markdown
- one ┃two
```

> copy

```yaml
result: deferredToHost
```

## Copy7

With `copySelection: nodes`, a selection from a child to its parent's next sibling: no siblings in a
row, refused, as its cut is.

```yaml
tags: rare
copySelection: nodes
```

```markdown
- one
  - k«id
- thr»ee
```

> copy

```yaml
result: rejected non-contiguous
```

## Copy8

A caret alone in an Obsidian callout's title copies the callout, its `>` with it: the title is the
quote's own text, so the node at the caret is the quote.

```yaml
tags: rare
flavor: obsidian
```

```markdown
> [!note] ┃q
> body
```

> copy

```yaml
clipboard:
  text/plain: |
    > [!note] q
    > body
  text/markdown: |
    > [!note] q
    > body
  text/html: |
    <!-- ourus --><div class="callout" data-callout="note">
    <div class="callout-title">q</div>
    <div class="callout-content">
    <p>body</p>
    </div>
    </div>
```

## Copy9

An item indented past its parent's text (four spaces under `- a`, or a tab): the indentation before its
marker is the item's own, not a container's, and the copy starts at the marker, the marker with it.
The lines after it lose that indentation too, keeping their columns to the marker (`g` at `b`'s text).

```yaml
tags: common
```

```markdown
- a
    - b┃
      - g
- c
```

> copy

```yaml
clipboard:
  text/plain: |
    - b
      - g
  text/markdown: |
    - b
      - g
  text/html: |
    <!-- ourus --><ul>
    <li>b
    <ul>
    <li>g</li>
    </ul>
    </li>
    </ul>
```

## Cut1

A cut in an item's text takes the text out.

```yaml
tags: core
```

```markdown
- one «two»
- three
```

> cut

```yaml
clipboard:
  text/plain: 'two'
  text/markdown: 'two'
  text/html: |
    <!-- ourus text --><p>two</p>
```

```markdown
- one ┃
- three
```

## Cut2

A cut across nodes joins what is left, as Backspace over the selection does.

```yaml
tags: common
```

```markdown
- one «two
  - ki»d
- three
```

> cut

```yaml
clipboard:
  text/plain: |-
    two
      - ki
  text/markdown: |-
    two
      - ki
  text/html: |
    <!-- ourus text --><p>two</p>
    <ul>
    <li>ki</li>
    </ul>
```

```markdown
- one ┃d
- three
```

## Cut3

With `copySelection: nodes`, the nodes go, with their subtrees.

```yaml
tags: rare
copySelection: nodes
```

```markdown
- one «two
  - ki»d
- three
```

> cut

```yaml
clipboard:
  text/plain: |
    - one two
      - kid
  text/markdown: |
    - one two
      - kid
  text/html: |
    <!-- ourus --><ul>
    <li>one two
    <ul>
    <li>kid</li>
    </ul>
    </li>
    </ul>
```

```markdown
- ┃three
```

## Cut4

A cut at a caret alone: the node goes, with its subtree.

```yaml
tags: common
```

```markdown
- one ┃two
  - kid
- three
```

> cut

```yaml
clipboard:
  text/plain: |
    - one two
      - kid
  text/markdown: |
    - one two
      - kid
  text/html: |
    <!-- ourus --><ul>
    <li>one two
    <ul>
    <li>kid</li>
    </ul>
    </li>
    </ul>
```

```markdown
- ┃three
```

## Cut4b

With `copyAtCaret: text`, a cut at a caret alone takes the node's text, the node staying, empty,
with its children, as SiYuan cuts it.

```yaml
tags: rare
copyAtCaret: text
```

```markdown
- one ┃two
  - kid
- three
```

> cut

```yaml
clipboard:
  text/plain: 'one two'
  text/markdown: 'one two'
  text/html: |
    <!-- ourus text --><p>one two</p>
```

```markdown
- ┃
  - kid
- three
```

## Cut5

A node cut right under code and pasted back comes back where it was: the cut leaves the caret on
an empty line held in its place, not at the end of the code's last line, where the paste would be
code (B346).

```yaml
tags: common
```

````markdown
```
code
```

# h┃
````

> cut paste

```yaml
clipboard:
  text/plain: |
    # h
  text/markdown: |
    # h
  text/html: |
    <!-- ourus --><h1>h</h1>
```

````markdown
```
code
```

# h┃
````

## Copy40

A padded quote's paragraph copied whole, the list it owns after it: the paragraph's padding off its
lines, not off the list's, whose item's later line keeps its column (B347).

```yaml
tags: rare
```

```markdown
  > body⟦selected⟧

- > a
  b
```

> copy

```yaml
clipboard:
  text/plain: |
    > body

    - > a
      b
  text/markdown: |
    > body

    - > a
      b
  text/html: |
    <!-- ourus --><blockquote>
    <p>body</p>
    </blockquote>
    <ul>
    <li>
    <blockquote>
    <p>a
    b</p>
    </blockquote>
    </li>
    </ul>
```

```markdown
  > body⟦selected⟧

- > a
  b
```

## Copy41

A copy that ends at a boundary between blocks: it takes `first`'s end and the blank line after it,
none of `second`. Its mark has `]`, so that pasted back where a cut leaves the caret, `second` stays
a paragraph of its own (Regression262).

```yaml
tags: common
```

```markdown
fi«rst

»second
```

> copy

```yaml
clipboard:
  text/plain: |+
    rst

  text/markdown: |+
    rst

  text/html: |
    <!-- ourus text] --><p>rst</p>
```

```markdown
fi«rst

»second
```

## Copy41b

A copy that starts at a boundary: past `first`'s end, its line break and the blank line taken. Its
mark has `[`. One within a text has neither, from its start or not (Copy1).

```yaml
tags: common
```

```markdown
first«

sec»ond
```

> copy

```yaml
clipboard:
  text/plain: |-
    

    sec
  text/markdown: |-
    

    sec
  text/html: |
    <!-- ourus [text --><p>sec</p>
```

```markdown
first«

sec»ond
```

## Copy42

A text selection whose two ends are both boundaries between blocks, from `one`'s end to the start of
`three`'s line: whole nodes, `two`, copied as a whole line selected from its start is. A cut takes
`two` out, leaving `one` and `three` apart (Cut6).

```yaml
tags: common
```

```markdown
- one«
- two
»- three
```

> copy

```yaml
clipboard:
  text/plain: |
    - two
  text/markdown: |
    - two
  text/html: |
    <!-- ourus --><ul>
    <li>two</li>
    </ul>
```

```markdown
- one«
- two
»- three
```

## Cut6

The selection of Copy42, cut: `two` goes, as delete subtree takes it; Backspace and Delete over it the
same.

```yaml
tags: common
```

```markdown
- one«
- two
»- three
```

> cut

```markdown
- one┃
- three
```

