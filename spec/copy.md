# Copy and cut

Commands: `copy` (Ctrl-C) and `cut` (Ctrl-X). What the host's clipboard gets is the result's
`clipboard`; [paste](paste.md) reads it back.

The rules:

1. **A copy is Markdown**: `text/plain` and `text/markdown` the selected Markdown as written, and
   `text/html` its rendering, marked as ourus's (`<!-- ourus -->`), so that a paste of it reads the
   text, the source (Copy1; [paste-conv.md](paste-conv.md)), and, where it is text rather than whole
   nodes, as text (`<!-- text -->` after it), which a paste puts in the text. Obsidian writes its copy so; Chromium
   keeps a `text/markdown` only between its own pages, the mark everywhere.
2. **Whole nodes end with a line break**, as a line copied whole does, so that one pastes as a node
   rather than as a phrase in the text (Copy4; [paste-list.md](paste-list.md)'s PasteList8).
3. **Out of what holds it**: the containers that hold the whole selection (a quote's `>`, an item's
   indentation where the selection starts past its marker) are left out, so it reads as it did
   (Copy2, Copy3).
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
    <!-- ourus --><!-- text --><p>two <strong>b</strong></p>
```

```markdown
- one «two **b**»
```

## Copy2

A selection across nodes: the text, out of the item holding it all, whose indentation its child's
line loses.

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
```

```markdown
- ┃three
```

## Cut5

A node cut right under code and pasted back comes back where it was: the cut leaves the caret on
an empty line held in its place, not at the end of the code's last line, where the paste would be
code (B346).

```yaml
tags: common markup-fence
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
```

````markdown
```
code
```

# h┃
````
