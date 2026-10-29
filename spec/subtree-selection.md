# Editing a subtree selection

Commands: `deleteContentBackward`, `deleteContentForward`, `deleteSoftLineBackward`, `cut`, `copy`,
`insertText`, `enter`, `shiftEnter`, `paste`, `pastePlain`, over a subtree selection (`««…»»`,
[README.md](README.md)): whole nodes selected as whole lines, from column 0 of the first root's line
to the start of the line after the last root's subtree, however the selection was made (a
triple-click, Shift-Down from column 0, a command). The keys act on the nodes, not on the lines'
characters, markers and all:

1. **Backspace, Delete and Cmd-Backspace delete the roots** with their subtrees, as delete subtree
   does: the caret at the end of the text above (SubtreeEdit1, SubtreeEdit2), roots at two depths
   each with its subtree (SubtreeEdit3), the blank lines going with their nodes (SubtreeEdit4).
2. **Copy and cut take the roots** with their subtrees, whatever `copySelection` says, each root at
   the top level of the copy: roots at two depths are copied as siblings, a deeper one before a
   shallower having no Markdown form (SubtreeEdit5, SubtreeEdit6).
3. **Typing does nothing**: the key taken, the nodes still selected, as the outliners ignore it
   (SubtreeEdit7 to SubtreeEdit10, SubtreeEdit15). A plain paste makes one node in their place,
   under the first root's prefix (its marker, a task's checkbox, a heading's `#`s), the other roots
   gone (SubtreeEdit11).
4. **Enter and Shift-Enter put the caret at the end of the last root's own text**, deleting nothing:
   a parent's text, not its last descendant's (SubtreeEdit12, SubtreeEdit13).
5. **A paste puts the clipboard's nodes in place of the roots**, the caret at the end of what was
   pasted (SubtreeEdit14); with `pasteOverSelection: ignore`, right after them, the roots kept
   (SubtreeEdit17).
6. **The structural commands keep it** on their nodes, in the shape it was given
   ([MoveDown41](move-subtree-down.md#movedown41), [Indent46](indent.md#indent46)).

A whole-line selection a text editor made reads the same (SubtreeEdit15). Typing or a plain paste
over the whole document (a select all) is the host's, the text replaced as a text editor replaces
it, not a node keeping the first one's prefix (SubtreeEdit16). A selection inside one
node's text, or from a node's text into another's, is text, as before.

## SubtreeEdit1

Backspace over a leaf: it goes, the caret at the end of the text above.

```yaml
tags: common
```

```buffer
- a
- ««b»»
- c
```

> deleteContentBackward

```buffer
- a┃
- c
```

## SubtreeEdit2

Delete over a parent: it goes with its children.

```yaml
tags: common
```

```buffer
- a
- ««b»»
  - b1
- c
```

> deleteContentForward

```buffer
- a┃
- c
```

## SubtreeEdit3

Cmd-Backspace over roots at two depths: each goes with its subtree, the caret at the end of
the text above them.

```yaml
tags: edge
```

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> deleteSoftLineBackward

```buffer
- one
  - two┃
  - five
- four
```

## SubtreeEdit4

Backspace with blank lines around: those after the roots go with them.

```yaml
tags: edge
```

```buffer
- a

- ««b»»

- c
```

> deleteContentBackward

```buffer
- a┃

- c
```

## SubtreeEdit5

Copy of roots at two depths: siblings, each with its subtree, under `copySelection: text` too.

```yaml
tags: common
```

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> copy

```yaml
clipboard:
  text/plain: |
    - deep
    - three
```

## SubtreeEdit6

Cut of a parent: its Markdown with its children, and it goes as Backspace takes it.

```yaml
tags: common
```

```buffer
- a
- ««b»»
  - b1
- c
```

> cut

```yaml
clipboard:
  text/plain: |
    - b
      - b1
```

```buffer
- a┃
- c
```

## SubtreeEdit7

Typing over a leaf selected whole: nothing typed, the leaf still selected (Logseq, Tine, Roam and the other outliners ignore it).

```yaml
tags: common
```

```buffer
- a
- ««b»»
- c
```

> "xy"

```buffer
- a
- ««b»»
- c
```

## SubtreeEdit8

Typing over a parent and its children: nothing typed, both still selected.

```yaml
tags: common
```

```buffer
- a
- ««b»»
  - b1
- c
```

> "x"

```buffer
- a
- ««b»»
  - b1
- c
```

## SubtreeEdit9

Typing over a task and its child: nothing typed.

```yaml
tags: edge
```

```buffer
- [ ] ««task»»
  - sub
- c
```

> "x"

```buffer
- [ ] ««task»»
  - sub
- c
```

## SubtreeEdit10

Typing over a thematic break: nothing typed.

```yaml
tags: edge
```

```buffer
para

««***»»

next
```

> "x"

```buffer
para

««***»»

next
```

## SubtreeEdit11

A plain paste over roots at two depths: one node, the first root's, its text what is pasted.

```yaml
tags: edge
clipboard: "y"
```

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> pastePlain

```buffer
- one
  - two
    - y┃
  - five
- four
```

## SubtreeEdit12

Enter over a parent: the caret at the end of its own text, nothing deleted.

```yaml
tags: common
```

```buffer
- a
- ««b»»
  - b1
- c
```

> enter

```buffer
- a
- b┃
  - b1
- c
```

## SubtreeEdit13

Shift-Enter over roots at two depths: at the end of the last root's text.

```yaml
tags: edge
```

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

> shiftEnter

```buffer
- one
  - two
    - deep
  - three┃
  - five
- four
```

## SubtreeEdit14

A paste over a node: the clipboard's nodes in its place, the caret at their end.

```yaml
tags: common
clipboard: |
  - p
  - q
```

```buffer
- a
- ««b»»
  - b1
- c
```

> paste

```buffer
- a
- p
- q┃
- c
```

## SubtreeEdit15

A whole-line selection a text editor made (a triple-click on `b`, from its line's start to the
next line's): the node, as drawn `««…»»`, and typing over it does nothing, as over any.

```yaml
tags: common
```

```buffer
- a
«- b
»- c
```

> "x"

```buffer
- a
- ««b»»
- c
```

## SubtreeEdit16

The whole document selected (a select all, its nodes only): Delete takes every node out, and what
is typed after is plain text, as a text editor has it. Typed over the select all itself, the host's:
it replaces the text, `x` alone, as every text editor does (no buffer draws a text without its final line break: a unit test,
test/select.test.ts).

```yaml
tags: edge
```

```buffer
- ««a
  - a1
- b»»
```

> deleteContentForward "x"

```buffer
x┃
```

## SubtreeEdit17

`pasteOverSelection: ignore`: the nodes selected stay, and the clipboard's go right after them, where
a paste at the selection's end puts them, as Tana pastes over a block selection.

```yaml
tags: edge
pasteOverSelection: ignore
clipboard: |
  - p
  - q
```

```buffer
- a
- ««b»»
  - b1
- c
```

> paste

```buffer
- a
- b
  - b1
- p
- q┃
- c
```
