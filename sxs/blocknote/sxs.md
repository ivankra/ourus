---
type: "SxS"
app: "blocknote"
version: "unknown"
url: "https://www.blocknotejs.org/examples/basic/minimal"
model: "block"
command: "node sxs/run.ts blocknote"
elapsed_s: 76
---

# BlockNote vs ourus

Spec test suite replayed in BlockNote and compared against ourus.

Model: [block](../lib/outline.ts) (free-form cases had to be adapted into outlines of blocks)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 64 | 5 | 14 | 57 |  |  | **140** |
| adapted | 118 | 13 | 24 | 185 | 2 |  | **342** |
| **total** | **182 (24%)** | **18 (2.4%)** | **38 (5%)** | **242 (32%)** | **2 (0.26%)** | **273 (36%)** | **755** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 12 |  |  | 38 |  | 11 | **61** | 14 | 36 |
| [cursor.md](../../spec/cursor.md) | 25 | 4 |  |  |  | 7 | **36** | 12 | 17 |
| [del.md](../../spec/del.md) | 14 |  |  | 16 |  | 17 | **47** | 13 | 17 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 8 | **8** |  |  |
| [enter.md](../../spec/enter.md) | 8 | 5 | 11 | 25 |  | 10 | **59** | 18 | 31 |
| [fences.md](../../spec/fences.md) | 7 |  | 1 | 12 |  | 31 | **51** |  | 20 |
| [gaps.md](../../spec/gaps.md) | 8 |  |  | 5 |  | 6 | **19** |  | 13 |
| [indent.md](../../spec/indent.md) | 17 | 3 |  | 4 |  | 6 | **30** | 9 | 15 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 14 |  |  | 17 |  | 6 | **37** | 7 | 24 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 17 | 2 |  | 13 |  | 6 | **38** | 7 | 25 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 21 |  | 7 | 23 |  | 16 | **67** | 21 | 30 |
| [outdent.md](../../spec/outdent.md) | 9 | 2 |  | 4 | 2 | 12 | **29** | 5 | 12 |
| [paste.md](../../spec/paste.md) | 10 | 1 | 4 | 46 |  | 19 | **80** | 13 | 48 |
| [placeholders.md](../../spec/placeholders.md) | 6 |  | 2 | 3 |  | 5 | **16** | 2 | 9 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 5 |  |  | 17 |  | 2 | **24** | 10 | 12 |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 12 | 9 |  | 2 | **26** | 6 | 18 |
| [tasks.md](../../spec/tasks.md) | 5 | 1 | 1 | 5 |  | 5 | **17** |  | 12 |
| [typing.md](../../spec/typing.md) |  |  |  | 2 |  | 2 | **4** |  | 2 |
| [undo.md](../../spec/undo.md) | 1 |  |  | 3 |  | 1 | **5** | 3 | 1 |
| [z-open.md](../../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **182 (24%)** | **18 (2.4%)** | **38 (5%)** | **242 (32%)** | **2 (0.26%)** | **273 (36%)** | **755** | **140 (19%)** | **342 (45%)** |

## Original cases

### Disagree (57)

#### [Backspace1](../../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

```buffer
- one
- ┃two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

#### [Backspace3](../../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

#### [Backspace5](../../spec/backspace.md#backspace5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

```buffer
- 
- ┃b
```

</td><td>

```buffer
- ┃b
```

</td></tr>
</table>

#### [Backspace7](../../spec/backspace.md#backspace7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃
```

</td><td>

```buffer
- a
  - b
- ┃
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

#### [Backspace8](../../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### [Backspace17](../../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

```buffer
- ┃
- b
- c
```

</td><td>

```buffer
- ┃b
- c
```

</td></tr>
</table>

#### [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

#### [Backspace17c](../../spec/backspace.md#backspace17c)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x┃
    - b
      - c
    - d
  - e
- f
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
    - b
      - c
    - d
  - e
- f
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
    - b
      - c
    - d
  - e
- f
```

</td><td>

```buffer
- a┃
  - b
    - c
  - d
  - e
- f
```

</td></tr>
</table>

#### [Backspace17d](../../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

```buffer
- x┃
  - a
    - b
```

</td></tr>
</table>

#### [Backspace30](../../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

#### [Backspace41](../../spec/backspace.md#backspace41)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - a
  - b
```

</td><td>

```buffer
- -┃a
  - a
  - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

#### [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

#### [Delete7](../../spec/del.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
```

</td><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### [Delete12](../../spec/del.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
  - d
```

</td><td>

```buffer
- a
- b┃c
- d
```

</td><td>

```buffer
- a
- b┃c
  - d
```

</td></tr>
</table>

#### [Enter3d](../../spec/enter.md#enter3d)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### [Enter4](../../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td><td>

```buffer
- a
- ┃
  - b
```

</td><td>

```buffer
- a
  - ┃
  - b
```

</td></tr>
</table>

#### [Enter5](../../spec/enter.md#enter5)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
```

</td><td>

```buffer
- a
  - b
  - ┃
```

</td><td>

```buffer
- a
  - b
- ┃
```

</td></tr>
</table>

#### [Enter7](../../spec/enter.md#enter7)

> enter

Also: [enter.md › Enter15](../../spec/enter.md#enter15)

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
- 
- ┃
- b
```

</td></tr>
</table>

#### [Enter21](../../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
- 
  - ┃
  - a
```

</td></tr>
</table>

#### [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

```buffer
- a
  - b
  - 
  - ┃
  - c
```

</td></tr>
</table>

#### [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

```buffer
- a
  - ┃
  - 
  - c
```

</td></tr>
</table>

#### [Enter38](../../spec/enter.md#enter38)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
- next
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
- next
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
- next
```

</td><td>

```buffer
- one┃two
- next
```

</td></tr>
</table>

#### [Enter39](../../spec/enter.md#enter39)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ab┃
- c
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ab
- ┃
- c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab
- ┃
- c
```

</td><td>

```buffer
- ab┃
- c
```

</td></tr>
</table>

#### [Enter44](../../spec/enter.md#enter44)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td><td>

```buffer
- one two
- ┃three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

#### [MoveDown7](../../spec/move-subtree-down.md#movedown7)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
- c
  - d
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
- c
  - d
```

</td><td>

```buffer
- a
- c
  - b┃
    - b1
  - d
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- c
  - b┃
    - b1
  - d
```

</td><td>

```buffer
- a
- c
  - d
  - b┃
    - b1
```

</td></tr>
</table>

#### [MoveDown9](../../spec/move-subtree-down.md#movedown9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- c┃
  - c1
- b
```

</td><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c┃
  - c1
- a
- b
```

</td><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

#### [MoveDown10](../../spec/move-subtree-down.md#movedown10)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - c┃
    - c1
- d
  - d1
    - d11
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c┃
  - c1
- d
  - d1
    - d11
```

</td><td>

```buffer
- a
  - b
- d
  - c┃
    - c1
  - d1
    - d11
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- d
  - c┃
    - c1
  - d1
    - d11
```

</td><td>

```buffer
- a
  - b
- d
  - d1
    - d11
  - c┃
    - c1
```

</td></tr>
</table>

#### [MoveDown33](../../spec/move-subtree-down.md#movedown33)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - a
  - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - a
  - b
```

</td><td>

```buffer
- - b
  - b
  - ┃a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - a
  - b
```

</td></tr>
</table>

#### [MoveUp5](../../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

```buffer
- b┃
- a
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

#### [MoveUp6](../../spec/move-subtree-up.md#moveup6)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c
  - d┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- d┃
- c
```

</td><td>

```buffer
- a
  - b
  - d┃
- c
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - d┃
- c
```

</td><td>

```buffer
- a
  - d┃
  - b
- c
```

</td></tr>
</table>

#### [MoveUp8](../../spec/move-subtree-up.md#moveup8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- c┃
  - c1
- b
```

</td><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
- c┃
  - c1
```

</td><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

#### [MoveUp9](../../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
    - a11
- b
  - c┃
    - c1
  - d
```

</td><td>

```buffer
- a
  - a1
    - a11
- c┃
  - c1
- b
  - d
```

</td><td>

```buffer
- a
  - a1
    - a11
  - c┃
    - c1
- b
  - d
```

</td></tr>
</table>

#### [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃
  - child
```

</td><td>

```buffer
- alpha
- ┃
  - child
```

</td><td>

```buffer
- alpha
  - ┃
  - child
```

</td></tr>
</table>

#### [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- a«lpha
  » beta
```

</td><td>

```buffer
- a
  ┃beta
```

</td></tr>
</table>

#### [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

> enter shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
```

</td><td>

```buffer
- foo┃
```

</td><td>

```buffer
- foo
- ┃
```

</td></tr>
</table>

#### [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

```buffer
- ┃a
  - b
  - 
```

</td><td>

```buffer
- a
  - b
- 
```

</td></tr>
</table>

#### [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
	- b
		- c
```

</td><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba
    - b
    - c┃
```

</td><td>

```buffer
- top
  - sib
  - a
    - b
      - c┃
```

</td></tr>
</table>

#### [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
  - b
    - c
```

</td><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba
    - b
      - c┃
```

</td><td>

```buffer
- top
  - sib
  - a
    - b
      - c┃
```

</td></tr>
</table>

#### [Paste3](../../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
  y┃b
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

#### [Paste7](../../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
  y┃b
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

#### [Paste26](../../spec/paste.md#paste26)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
- b
```

</td><td>

```buffer
- a
- x┃
- b
```

</td></tr>
</table>

#### [Paste31](../../spec/paste.md#paste31)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. Introduction
```

</td><td>

```buffer
- see ┃here
```

</td><td>

```buffer
- see Introduction┃here
```

</td><td>

```buffer
- see 1. Introduction┃here
```

</td></tr>
</table>

#### [Paste36](../../spec/paste.md#paste36)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td><td>

```buffer
- list
  - See ┃here.
```

</td><td>

```buffer
- list
  - See x
  - y┃here.
```

</td><td>

```buffer
- list
  - See x
    - y
  - ┃here.
```

</td></tr>
</table>

#### [Paste42](../../spec/paste.md#paste42)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- a┃b
  - child
```

</td><td>

```buffer
- ax
- y┃b
  - child
```

</td><td>

```buffer
- ax
- y
- ┃b
  - child
```

</td></tr>
</table>

#### [Paste78](../../spec/paste.md#paste78)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
    first
    second
```

</td><td>

```buffer
- ┃a
```

</td><td>

```buffer
- first
  second┃a
```

</td><td>

```buffer
- first
  second
  ┃a
```

</td></tr>
</table>

#### [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)

> enter indent enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk┃ and eggs
- call Ann
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk
- ┃and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
-  ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- ┃  and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- 
- today:┃  and eggs
- call Ann
```

</td><td>

```buffer
- today:┃
- buy milk and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- 
- today:  and eggs
- call A┃
```

</td><td>

```buffer
- today:
- buy milk and eggs
- call A┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- 
- today:  and eggs┃call A
```

</td><td>

```buffer
- today:
- buy milk and eggs┃call A
```

</td></tr>
</table>

#### [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Work┃
  - email
- Inbox
- Home
  - plants
```

</td></tr>
</table>

> moveSubtreeDown moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Home
  - Work┃
    - email
  - plants
```

</td><td>

```buffer
- Inbox
- Home
  - plants
- Work┃
  - email
```

</td></tr>
</table>

> moveSubtreeUp indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - Work┃
    - email
- Home
  - plants
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

</td></tr>
</table>

#### [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
  - buy milk┃
- Errands
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
- buy milk┃
- Errands
```

</td><td>

```buffer
- Inbox
  - call Ann
- Errands
  - buy milk┃
```

</td></tr>
</table>

> enter "post a letter" moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
- post a letter┃
- buy milk
- Errands
```

</td><td>

```buffer
- Inbox
  - call Ann
- Errands
  - post a letter┃
  - buy milk
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- post a letter
- Inbox┃
  - call Ann
- buy milk
- Errands
```

</td><td>

```buffer
- Errands
  - post a letter
  - buy milk
- Inbox┃
  - call Ann
```

</td></tr>
</table>

#### [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c
  - d
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b
- c
  - d
```

</td><td>

```buffer
- a
  - ┃
  - b
- c
  - d
```

</td></tr>
</table>

> "x"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- x┃
  - b
- c
  - d
```

</td><td>

```buffer
- a
  - x┃
  - b
- c
  - d
```

</td></tr>
</table>

> cursorLineBoundaryBackward deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃x
  - b
- c
  - d
```

</td><td>

```buffer
- a┃x
  - b
- c
  - d
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃x
- b
- c
  - d
```

</td><td>

```buffer
- ax┃b
- c
  - d
```

</td></tr>
</table>

#### [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
- c
  - d
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
  - d
```

</td><td>

```buffer
- a
- c
  - b┃
  - d
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b┃
- a
- c
  - d
```

</td><td>

```buffer
- a
  - b┃
- c
  - d
```

</td></tr>
</table>

#### [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ┃ three
```

</td><td>

```buffer
- one two
  ┃three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

#### [Undo4](../../spec/undo.md#undo4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> undo

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> redo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

#### [Undo5](../../spec/undo.md#undo5)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter indent "x"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x┃
```

</td></tr>
</table>

> undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> undo

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> redo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

### Whitespace (14)

#### [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td><td>

```buffer
- one two
- ┃ three
- next
```

</td><td>

```buffer
- one two
- ┃three
- next
```

</td></tr>
</table>

#### [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

```buffer
- a
- ┃ b
  - c
```

</td><td>

```buffer
- a
- ┃b
  - c
```

</td></tr>
</table>

#### [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  lazy
```

</td><td>

```buffer
- a
- ┃
  lazy
```

</td><td>

```buffer
- a
- ┃lazy
```

</td></tr>
</table>

#### [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

```buffer
- first
  second
- ┃ line
```

</td><td>

```buffer
- first
  second
- ┃line
```

</td></tr>
</table>

#### [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td></tr>
</table>

> shiftEnter indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - foo
    ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
  - kid
  - foo
    
```

</td><td>

```buffer
- one
  - kid
  - foo
```

</td></tr>
</table>

#### [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

```buffer
- ┃one
  - kid
  - sib
    - foo
      
```

</td><td>

```buffer
- one
  - kid
  - sib
    - foo
```

</td></tr>
</table>

#### [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
- bar
```

</td><td>

```buffer
- one
  - kid
  - foo
    
  - ┃
- bar
```

</td><td>

```buffer
- one
  - kid
  - foo
  - ┃
- bar
```

</td></tr>
</table>

#### [Paste5](../../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
  y┃
```

</td><td>

```buffer
- ax
  y
  ┃
```

</td></tr>
</table>

#### [Paste10](../../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- x
  y┃
```

</td><td>

```buffer
- a
- x
  y
  ┃
```

</td></tr>
</table>

#### [Paste73](../../spec/paste.md#paste73)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
-  ┃
  - kid
```

</td><td>

```buffer
-  x
  y┃
  - kid
```

</td><td>

```buffer
- x
  y
  ┃
  - kid
```

</td></tr>
</table>

#### [Placeholder8](../../spec/placeholders.md#placeholder8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃a b
  - c
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ b
  - c
```

</td><td>

```buffer
- b
  - c
```

</td></tr>
</table>

> "x"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x┃ b
  - c
```

</td></tr>
</table>

#### [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two
  ┃ three
```

</td><td>

```buffer
- one two
  ┃three
```

</td></tr>
</table>

#### [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃ b
```

</td><td>

```buffer
- x
  - a
    ┃ b
```

</td><td>

```buffer
- x
  - a
    ┃b
```

</td></tr>
</table>

#### [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

```buffer
- 
  ┃one
```

</td><td>

```buffer
- ┃one
```

</td></tr>
</table>

### Caret (5)

#### [Enter26](../../spec/enter.md#enter26)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a
  - 
  - ┃b
```

</td><td>

```buffer
- a
  - ┃
  - b
```

</td></tr>
</table>

#### [Enter29](../../spec/enter.md#enter29)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

```buffer
- a
  - b
  - 
  - ┃c
```

</td><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td></tr>
</table>

#### [Enter31](../../spec/enter.md#enter31)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

```buffer
- 
- ┃a
  - b
```

</td><td>

```buffer
- ┃
- a
  - b
```

</td></tr>
</table>

#### [Indent10](../../spec/indent.md#indent10)

> indent

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

#### [Outdent2](../../spec/outdent.md#outdent2)

> outdent

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

```buffer
- a
- b
```

</td><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

### Agree (64)

1. [Backspace9](../../spec/backspace.md#backspace9)
2. [Backspace13](../../spec/backspace.md#backspace13)
3. [Backspace32](../../spec/backspace.md#backspace32)
4. [CursorUp3](../../spec/cursor.md#cursorup3)
5. [CursorDown3](../../spec/cursor.md#cursordown3)
6. [CursorDown4](../../spec/cursor.md#cursordown4)
7. [CursorHome1](../../spec/cursor.md#cursorhome1)
8. [CursorHome2](../../spec/cursor.md#cursorhome2)
9. [CursorHome5](../../spec/cursor.md#cursorhome5)
10. [CursorHome6](../../spec/cursor.md#cursorhome6)
11. [CursorHome12](../../spec/cursor.md#cursorhome12)
12. [CursorHome13](../../spec/cursor.md#cursorhome13)
13. [CursorEnd1](../../spec/cursor.md#cursorend1)
14. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
15. [SelectHome1](../../spec/cursor.md#selecthome1)
16. [Delete1](../../spec/del.md#delete1)
17. [Delete2](../../spec/del.md#delete2)
18. [Delete3](../../spec/del.md#delete3)
19. [Delete5](../../spec/del.md#delete5)
20. [Delete5b](../../spec/del.md#delete5b)
21. [Delete5c](../../spec/del.md#delete5c)
22. [Delete6](../../spec/del.md#delete6)
23. [Delete8](../../spec/del.md#delete8)
24. [Delete20](../../spec/del.md#delete20)
25. [Delete22](../../spec/del.md#delete22)
26. [Enter29b](../../spec/enter.md#enter29b)
27. [Indent1](../../spec/indent.md#indent1)
28. [Indent14](../../spec/indent.md#indent14)
29. [Indent2](../../spec/indent.md#indent2)
30. [Indent6](../../spec/indent.md#indent6)
31. [Indent7](../../spec/indent.md#indent7)
32. [Indent8](../../spec/indent.md#indent8)
33. [Indent19](../../spec/indent.md#indent19)
34. [Indent26](../../spec/indent.md#indent26)
35. [MoveDown3](../../spec/move-subtree-down.md#movedown3)
36. [MoveDown6](../../spec/move-subtree-down.md#movedown6)
37. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
38. [MoveUp1](../../spec/move-subtree-up.md#moveup1)
39. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
40. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
41. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)
42. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
43. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
44. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
45. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)
46. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)
47. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)
48. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
49. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)
50. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)
51. [Outdent1](../../spec/outdent.md#outdent1)
52. [Outdent3](../../spec/outdent.md#outdent3)
53. [Outdent13](../../spec/outdent.md#outdent13)
54. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)
55. [Paste24](../../spec/paste.md#paste24)
56. [Paste48](../../spec/paste.md#paste48)
57. [Paste49](../../spec/paste.md#paste49)
58. [Placeholder6](../../spec/placeholders.md#placeholder6)
59. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
60. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)
61. [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)
62. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
63. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)
64. [Undo1](../../spec/undo.md#undo1)

## Adapted cases

### Disagree (185)

#### [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #
  - ┃more
```

</td><td>

```buffer
- # Title #
  - ┃more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Backspace10](../../spec/backspace.md#backspace10)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃◌
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

#### [Backspace11](../../spec/backspace.md#backspace11)

> deleteContentBackward

Adapted: blank lines, paragraph; Also: [backspace.md › Backspace21](../../spec/backspace.md#backspace21)

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

#### [Backspace12](../../spec/backspace.md#backspace12)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

┃b
```

</td><td>

```buffer
a
┃b
```

</td></tr>
</table>

#### [Backspace12c](../../spec/backspace.md#backspace12c)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - x
```

</td><td>

```buffer
- a
- ┃b
  - x
```

</td><td>

```buffer
- a
  ┃b
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

┃b
- x
```

</td><td>

```buffer
a
┃b
- x
```

</td></tr>
</table>

#### [Backspace14](../../spec/backspace.md#backspace14)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - a┃
  - ## H2
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃
  - ## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
  - 
  - ## H2
```

</td><td>

```buffer
- ┃# H1
  - ## H2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
# H1

a┃

## H2
```

</td><td>

```buffer
# H1

┃◌

## H2
```

</td><td>

```buffer
┃# H1

## H2
```

</td></tr>
</table>

#### [Backspace15](../../spec/backspace.md#backspace15)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - ┃a
```

</td><td>

```buffer
- para
  - ┃a
```

</td><td>

```buffer
- para┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

```buffer
para┃a
```

</td></tr>
</table>

#### [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Hello
  - body
```

</td><td>

```buffer
- para
- ┃Hello
  - body
```

</td><td>

```buffer
- para
- ┃Hello
- body
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Hello

body
```

</td><td>

```buffer
para

┃Hello

body
```

</td></tr>
</table>

#### [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
  - text
```

</td><td>

```buffer
- ┃Title
  - text
```

</td><td>

```buffer
- ┃Title
- text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Title
===

text
```

</td><td>

```buffer
┃Title

text
```

</td></tr>
</table>

#### [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H1
  - text
```

</td><td>

```buffer
- a
- ┃H1
  - text
```

</td><td>

```buffer
- a
- ┃H1
- text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
# ┃H1
text
```

</td><td>

```buffer
a

┃H1

text
```

</td></tr>
</table>

#### [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

```buffer
- a
  - ┃bc
```

</td><td>

```buffer
- a
  ┃bc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

```buffer
- a
  ┃bc
```

</td></tr>
</table>

#### [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b
```

</td><td>

```buffer
- a
- ┃
  - b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃◌

- b
```

</td><td>

```buffer
- a┃

- b
```

</td></tr>
</table>

#### [Backspace22](../../spec/backspace.md#backspace22)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title
  - ┃more
```

</td><td>

```buffer
- # Title
  - ┃more
```

</td><td>

```buffer
- # Title┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
```

</td><td>

```buffer
# Title┃more
```

</td></tr>
</table>

#### [Backspace25](../../spec/backspace.md#backspace25)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
- ┃para
```

</td><td>

```buffer
- a
- 
- ┃para
```

</td><td>

```buffer
- a
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃para
```

</td><td>

```buffer
- a
- ┃para
```

</td></tr>
</table>

#### [Backspace28](../../spec/backspace.md#backspace28)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x
  ```
- ┃
````

</td><td>

````buffer
- ```
  x
  ```
- ┃
````

</td><td>

````buffer
- ```
  x┃
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃
````

</td><td>

````buffer
```
x┃
```
````

</td></tr>
</table>

#### [Backspace29](../../spec/backspace.md#backspace29)

> deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- c
```

</td><td>

```buffer
- a
- ┃
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

#### [Backspace33](../../spec/backspace.md#backspace33)

> deleteContentBackward

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

```buffer
- ┃a
- b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

```buffer
┃a
- b
```

</td></tr>
</table>

#### [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - intro
  - ## ┃B
    - para
      - item
  - ## C
```

</td><td>

```buffer
- # A
  - intro
  - ┃B
    - para
      - item
  - ## C
```

</td><td>

```buffer
- # A
  - intro
  - ┃B
  - para
    - item
  - ## C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

intro

## ┃B

para

- item

## C
```

</td><td>

```buffer
# A

intro

┃B

para

- item

## C
```

</td></tr>
</table>

#### [Backspace36](../../spec/backspace.md#backspace36)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title
  - ┃text
```

</td><td>

```buffer
- # Title
  - ┃text
```

</td><td>

```buffer
- # Title┃text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title
=====
┃text
```

</td><td>

```buffer
Title┃text
=====
```

</td></tr>
</table>

#### [Backspace37](../../spec/backspace.md#backspace37)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title
  - ┃more
    lines
```

</td><td>

```buffer
- # Title
  - ┃more
    lines
```

</td><td>

```buffer
- # Title┃more
  lines
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title
=====
┃more
lines
```

</td><td>

```buffer
Title┃more
lines
=====
```

</td></tr>
</table>

#### [Backspace38](../../spec/backspace.md#backspace38)

> deleteContentBackward

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:
- ┃b
```

</td><td>

```buffer
- [a]:
- ┃b
```

</td><td>

```buffer
- [a]:
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]:

┃b
```

</td><td>

```buffer
\[a]:
┃b
```

</td></tr>
</table>

#### [Backspace39](../../spec/backspace.md#backspace39)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- p
```

</td><td>

```buffer
- a
- ┃
- p
```

</td><td>

```buffer
- a┃
- p
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
p
```

</td><td>

```buffer
- a┃

p
```

</td></tr>
</table>

#### [Backspace40](../../spec/backspace.md#backspace40)

> deleteContentBackward

Adapted: blank lines, numbered list, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃t
  - m
```

</td><td>

```buffer
- p
  - ┃t
  - m
```

</td><td>

```buffer
- p┃t
  - m
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

- ┃t
2. m
```

</td><td>

```buffer
p┃t

2. m
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # abc ┃- x tail
```

</td><td>

```buffer
- # ┃- x tail
```

</td><td>

```buffer
- # ┃\- x tail
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

```buffer
┃\- x tail
===
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # first
  abc ┃- x
```

</td><td>

```buffer
- # first
  ┃\- x
```

</td><td>

```buffer
- # first
  ┃\- x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

```buffer
first
┃\- x
===
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace8](../../spec/backspace.md#softbackspace8)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] t┃
  m
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
  m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
  ┃m
```

</td><td>

```buffer
- [ ] m┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteSoftLineBackward</th><th>cursorLineDown</th></tr>
<tr valign="top"><td>

```buffer
- [ ] t┃
  m
```

</td><td>

```buffer
- [ ] ┃◌
  m
```

</td><td>

```buffer
- [ ] m┃
```

</td></tr>
</table>

#### [Delete4](../../spec/del.md#delete4)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ #
  - more
```

</td><td>

```buffer
- # Title┃#
  - more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #┃
  - more
```

</td><td>

```buffer
- # Title #┃more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Delete9](../../spec/del.md#delete9)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃a
  - ## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃
  - ## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
  - 
  - ## H2
```

</td><td>

```buffer
- ┃# H1
  - ## H2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃a

## H2
```

</td><td>

```buffer
# H1

┃◌

## H2
```

</td><td>

```buffer
┃# H1

## H2
```

</td></tr>
</table>

#### [Delete11](../../spec/del.md#delete11)

> deleteContentForward

Adapted: code block, heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H┃
  -     code
```

</td><td>

```buffer
- # H┃    code
```

</td><td>

```buffer
- # H┃
  -     code
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

```buffer
# H┃
    code
```

</td></tr>
</table>

#### [Delete13](../../spec/del.md#delete13)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td><td>

```buffer
- a┃H1
```

</td><td>

```buffer
- a┃# H1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

```buffer
a┃# H1
```

</td></tr>
</table>

#### [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - text
```

</td><td>

```buffer
- a┃H1
- text
```

</td><td>

```buffer
- a┃# H1
- text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
text
```

</td><td>

```buffer
a┃# H1

text
```

</td></tr>
</table>

#### [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # Title
```

</td><td>

```buffer
- a┃Title
```

</td><td>

```buffer
- a┃
- # Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

Title
=====
```

</td><td>

```buffer
a┃

Title
=====
```

</td></tr>
</table>

#### [Delete13g](../../spec/del.md#delete13g)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

```buffer
- a┃H
```

</td><td>

```buffer
- a┃# H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

```buffer
- a┃# H
```

</td></tr>
</table>

#### [Delete14](../../spec/del.md#delete14)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - body
```

</td><td>

```buffer
- a┃H1
- body
```

</td><td>

```buffer
- a┃# H1
- body
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td><td>

```buffer
a┃# H1

body
```

</td></tr>
</table>

#### [Delete15](../../spec/del.md#delete15)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
- # H1 ##
```

</td><td>

```buffer
- ## A┃H1 ##
```

</td><td>

```buffer
- ## A┃# H1 ##
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
# H1 ##
```

</td><td>

```buffer
## A┃# H1 ##
```

</td></tr>
</table>

#### [Delete18](../../spec/del.md#delete18)

> deleteContentForward

Adapted: blank lines, paragraph; Also: [del.md › Delete18c](../../spec/del.md#delete18c)

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a┃
  b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

b
```

</td><td>

```buffer
a┃
b
```

</td></tr>
</table>

#### [Delete18b](../../spec/del.md#delete18b)

> deleteContentForward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - bc
```

</td><td>

```buffer
- a┃bc
```

</td><td>

```buffer
- a┃
  bc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃

  bc
```

</td><td>

```buffer
- a┃
  bc
```

</td></tr>
</table>

#### [Enter23](../../spec/enter.md#enter23)

> enter

Adapted: blank lines, code block, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ### H┃2
  -     - a
```

</td><td>

```buffer
- ### H
- ┃2
  -     - a
```

</td><td>

```buffer
- ### H
  - ┃2
  -     - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

```buffer
### H
┃2

    - a
```

</td></tr>
</table>

#### [Enter32b](../../spec/enter.md#enter32b)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
```

</td><td>

```buffer
- 
- # ┃H1
```

</td><td>

```buffer
- # 
  - ┃H1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# ┃H1
```

</td><td>

```buffer
# 
┃H1
```

</td></tr>
</table>

#### [Enter33](../../spec/enter.md#enter33)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- intro
- ┃hello
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
- 
- ┃hello
```

</td><td>

```buffer
- intro
- ┃
- hello
```

</td></tr>
</table>

> "x"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
- 
- x┃hello
```

</td><td>

```buffer
- intro
- x┃
- hello
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"x"</th></tr>
<tr valign="top"><td>

```buffer
intro

┃hello
```

</td><td>

```buffer
intro

┃◌

hello
```

</td><td>

```buffer
intro

x┃

hello
```

</td></tr>
</table>

#### [Enter40](../../spec/enter.md#enter40)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
- ┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a

┃◌
```

</td><td>

```buffer
- a

┃◌
```

</td></tr>
</table>

#### [Enter41](../../spec/enter.md#enter41)

> enter

Adapted: escape, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title ┃- x
  - y
```

</td><td>

```buffer
- # Title 
- ┃- x
  - y
```

</td><td>

```buffer
- # Title
  - ┃- x
    - y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

```buffer
# Title
┃\- x
- y
```

</td></tr>
</table>

#### [Enter42](../../spec/enter.md#enter42)

> enter

Adapted: escape, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title ┃- x
```

</td><td>

```buffer
- # title 
- ┃- x
```

</td><td>

```buffer
- # title
  - ┃- x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

```buffer
title
===
┃\- x
```

</td></tr>
</table>

#### [Enter43](../../spec/enter.md#enter43)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc
- ┃- def
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
- ┃- def
```

</td><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td><td>

```buffer
- abc
- ┃\- def
```

</td><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

#### [Enter47](../../spec/enter.md#enter47)

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this 
- ┃matters a lot
```

</td><td>

```buffer
- [Note]: this
- ┃matters a lot
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td><td>

```buffer
- [Note]: this┃matters a lot
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
```

</td><td>

```buffer
\[Note]: this

┃matters a lot
```

</td><td>

```buffer
[Note]: this┃matters a lot
```

</td></tr>
</table>

#### [Enter48](../../spec/enter.md#enter48)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b ┃c
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
- ┃c
```

</td><td>

```buffer
- [a]: b
- ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
- ┃c
```

</td><td>

```buffer
- [a]: b┃c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b ┃c
```

</td><td>

```buffer
- \[a]: b
- ┃c
```

</td><td>

```buffer
- \[a]: b┃c
```

</td></tr>
</table>

#### [Enter49](../../spec/enter.md#enter49)

Adapted: blank lines, paragraph, table

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |
- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |
- ┃
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |┃
```

</td></tr>
</table>

> enter "after"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |
- 
- after┃
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |
- after┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>enter "after"</th></tr>
<tr valign="top"><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

┃◌
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

after┃
```

</td></tr>
</table>

#### [Enter50](../../spec/enter.md#enter50)

> enter

Adapted: table

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | on
- ┃e | 2 |
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

</td><td>

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

</td></tr>
</table>

#### [Enter51](../../spec/enter.md#enter51)

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
  three
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  
- ┃two
  three
```

</td><td>

```buffer
- ## one
  - ┃two
    three
```

</td></tr>
</table>

> undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
  three
```

</td></tr>
</table>

> cursorLineBoundaryForward enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  two
- ┃
  three
```

</td><td>

```buffer
- ## one
  two
  - ┃three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>undo</th><th>cursorLineBoundaryForward enter</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
three
---
```

</td><td>

```buffer
one
---
┃two
three
```

</td><td>

```buffer
one
┃two
three
---
```

</td><td>

```buffer
one
two
---
┃three
```

</td></tr>
</table>

#### [Enter52](../../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
- ## three
```

</td><td>

```buffer
- ## one
  
- ┃two
- ## three
```

</td><td>

```buffer
- ## one
  - ┃two
- ## three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
---
three
---
```

</td><td>

```buffer
one
---
┃two

three
---
```

</td></tr>
</table>

#### [Enter53](../../spec/enter.md#enter53)

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- -┃a
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- -
- ┃a
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- -
  ┃a
```

</td><td>

```buffer
- -┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
-┃a
```

</td><td>

```buffer
\-

┃a
```

</td><td>

```buffer
-┃a
```

</td></tr>
</table>

#### [Fence8](../../spec/fences.md#fence8)

> shiftEnter

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code┃
    ```
````

</td><td>

````buffer
- a
  - ```
    code
    ```
  - ┃
````

</td><td>

````buffer
- a
  - ```
    code
    ┃
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code┃
  ```
````

</td><td>

````buffer
- a
  ```
  code
  ┃
  ```
````

</td></tr>
</table>

#### [Fence17](../../spec/fences.md#fence17)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    ┃one
    ```
````

</td><td>

```buffer
- a
  - ┃one
```

</td><td>

````buffer
- a
  - ```
    ┃one
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td></tr>
</table>

#### [Fence30](../../spec/fences.md#fence30)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code
    ┃
    ```
````

</td><td>

````buffer
- a
  - ```
    code
    ┃
    ```
````

</td><td>

````buffer
- a
  - ```
    code
    ┃```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃
  ```
````

</td><td>

````buffer
- a
  ```
  code
  ┃```
````

</td></tr>
</table>

#### [Fence34](../../spec/fences.md#fence34)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

```buffer
- a┃
```

</td><td>

````buffer
- a┃
  - ```
    one
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

````buffer
- a┃
  ```
  one
  ```
````

</td></tr>
</table>

#### [Fence36](../../spec/fences.md#fence36)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``
  ┃`
  body
  ```
````

</td><td>

````buffer
- ```
  ``┃`
  body
  ```
````

</td><td>

````buffer
- ```
  ``
  ┃`
  body
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``
┃`
body
```
````

</td><td>

````buffer
```
``
┃`
body
```
````

</td></tr>
</table>

#### [Fence37](../../spec/fences.md#fence37)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``┃
  `
  body
  ```
````

</td><td>

````buffer
- ```
  ``┃`
  body
  ```
````

</td><td>

````buffer
- ```
  ``┃
  `
  body
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``┃
`
body
```
````

</td><td>

````buffer
```
``┃
`
body
```
````

</td></tr>
</table>

#### [Fence38](../../spec/fences.md#fence38)

> shiftEnter

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x┃```
  body
  ```
````

</td><td>

````buffer
- ```
  x```
  body
  ```
- ┃
````

</td><td>

````buffer
- ```
  x┃```
  body
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

````buffer
```
x┃```
body
```
````

</td></tr>
</table>

#### [Fence39](../../spec/fences.md#fence39)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ```┃x
  body
  ```
````

</td><td>

````buffer
- ```
  ```
  ┃x
  body
  ```
````

</td><td>

````buffer
- ```
  ```┃x
  body
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
```┃x
body
```
````

</td><td>

````buffer
```
```┃x
body
```
````

</td></tr>
</table>

#### [Math, comments and indented code › Fence42](../../spec/fences.md#fence42)

Adapted: math

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0┃
    $$
```

</td></tr>
</table>

> enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0
  - ┃
    $$
```

</td><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0
    ┃
    $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0
  - ┃
    $$
```

</td><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0┃
    $$
```

</td></tr>
</table>

> enter "x"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0
  - 
  - x┃
    $$
```

</td><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0
    x┃
    $$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>enter "x"</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  ┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  x┃
  $$
```

</td></tr>
</table>

#### [Math, comments and indented code › Fence44](../../spec/fences.md#fence44)

> enter "z"

Adapted: blank lines, code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  -     x = 1┃
        y = 2
```

</td><td>

```buffer
- a
  -     x = 1
  - z┃
        y = 2
```

</td><td>

```buffer
- a
  -     x = 1
        z┃
        y = 2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

      x = 1┃
      y = 2
```

</td><td>

```buffer
- a

      x = 1
      z┃
      y = 2
```

</td></tr>
</table>

#### [Math, comments and indented code › Fence45](../../spec/fences.md#fence45)

> enter

Adapted: math

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- $┃$
  x
  $$
```

</td><td>

```buffer
- $
- ┃$
  x
  $$
```

</td><td>

```buffer
- $┃$
  x
  $$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
$┃$
x
$$
```

</td><td>

```buffer
$┃$
x
$$
```

</td></tr>
</table>

#### [Math, comments and indented code › Fence47](../../spec/fences.md#fence47)

Adapted: math

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - $$
    ┃x
    $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - $$┃x
    $$
```

</td><td>

```buffer
- a
  - $$
    ┃x
    $$
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - $$x┃$$
```

</td><td>

```buffer
- a
  - $$
    x┃
    $$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorLineBoundaryForward deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$
  ┃x
  $$
```

</td><td>

```buffer
- a
  $$
  ┃x
  $$
```

</td><td>

```buffer
- a
  $$
  x┃
  $$
```

</td></tr>
</table>

#### [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - text
- # B┃
  - more
- # C
```

</td><td>

```buffer
- # A
  - text
  - # B┃
    - more
- # C
```

</td><td>

```buffer
- # B┃
  - more
- # A
  - text
- # C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
text

# B┃
more

# C
```

</td><td>

```buffer
# B┃
more

# A
text

# C
```

</td></tr>
</table>

#### [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5)

> moveSubtreeUp

Adapted: blank lines

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
- b┃
- c
```

</td><td>

```buffer
- a
  - a1
  - b┃
- c
```

</td><td>

```buffer
- b┃
- a
  - a1
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1

- b┃
- c
```

</td><td>

```buffer
- b┃
- a
  - a1

- c
```

</td></tr>
</table>

#### [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6)

> moveSubtreeDown

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - a
- ## B
  - b
- ## C
```

</td><td>

```buffer
- ## B
  - ## A┃
    - a
  - b
- ## C
```

</td><td>

```buffer
- ## B
  - b
- ## A┃
  - a
- ## C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
a
## B
b
## C
```

</td><td>

```buffer
## B
b
## A┃
a
## C
```

</td></tr>
</table>

#### [New text and gaps › Gap12](../../spec/gaps.md#gap12)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## S┃
  - p
```

</td><td>

```buffer
- ## S
- ┃
  - p
```

</td><td>

```buffer
- ## S
  - ┃
  - p
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## S┃

p
```

</td><td>

```buffer
## S
┃◌

p
```

</td></tr>
</table>

#### [New text and gaps › Gap13](../../spec/gaps.md#gap13)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- t┃
- para
```

</td><td>

```buffer
- ta
- b┃
- para
```

</td><td>

```buffer
- t
- a
- b┃
- para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t┃

para
```

</td><td>

```buffer
- t
- a
- b┃

para
```

</td></tr>
</table>

#### [Indent12](../../spec/indent.md#indent12)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

```buffer
- # A
  - ## B
    - ### C
```

</td><td>

```buffer
- # A
  - ### B┃
    - #### C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B┃
### C
```

</td><td>

```buffer
# A
### B┃
#### C
```

</td></tr>
</table>

#### [Indent16](../../spec/indent.md#indent16)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃
  - ## Sub
```

</td><td>

```buffer
- # Title
  - ## Sub
```

</td><td>

```buffer
- ## Title┃
  - ### Sub
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====

## Sub
```

</td><td>

```buffer
Title┃
-----

### Sub
```

</td></tr>
</table>

#### [Indent23](../../spec/indent.md#indent23)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B
  - ## C┃
    - ### D
```

</td><td>

```buffer
- # A
  - ## B
    - ## C┃
      - ### D
```

</td><td>

```buffer
- # A
  - ## B
    - ### C┃
      - #### D
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B
## C┃
### D
```

</td><td>

```buffer
# A
## B
### C┃
#### D
```

</td></tr>
</table>

#### [Indent25](../../spec/indent.md#indent25)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃
  - ### Sub
```

</td><td>

```buffer
- ## Title
  - ### Sub
```

</td><td>

```buffer
- ### Title┃
  - #### Sub
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td><td>

```buffer
### Title┃

#### Sub
```

</td></tr>
</table>

#### [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a┃
  - para
```

</td><td>

```buffer
- # H
  - para
  - a┃
```

</td><td>

```buffer
- # H
  - para
    - a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

```buffer
# H
para

- a┃
```

</td></tr>
</table>

#### [MoveDown4](../../spec/move-subtree-down.md#movedown4)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - text a
- # B
  - text b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # B
  - # A┃
    - text a
  - text b
```

</td><td>

```buffer
- # B
  - text b
- # A┃
  - text a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - text a
- # B
  - text b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# A┃

text a

# B

text b
```

</td><td>

```buffer
# B

text b

# A┃

text a
```

</td><td>

```buffer
# A┃

text a

# B

text b
```

</td></tr>
</table>

#### [MoveDown13](../../spec/move-subtree-down.md#movedown13)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1
- intro
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
- b┃
  - b1
```

</td><td>

```buffer
- intro
  - b┃
    - b1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1
- intro
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1

intro
```

</td><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

```buffer
- b┃
  - b1

intro
```

</td></tr>
</table>

#### [MoveDown16](../../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - x
- # B
  - y
```

</td><td>

```buffer
- # B
  - # A┃
    - x
  - y
```

</td><td>

```buffer
- # B
  - y
- # A┃
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
- x
# B
- y
```

</td><td>

```buffer
# B
- y
# A┃
- x
```

</td></tr>
</table>

#### [MoveDown17](../../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## ┃H
- # H
  - a
```

</td><td>

```buffer
- # H
  - ## ┃H
  - a
```

</td><td>

```buffer
- ## ┃H
- # H
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## ┃H
# H
- a
```

</td><td>

```buffer
## ┃H
# H
- a
```

</td></tr>
</table>

#### [MoveDown18](../../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
  - ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
- ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
- # Home
  - ┃review
  - water
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td></tr>
</table>

#### [MoveDown19](../../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## s┃
- # B
  - x
```

</td><td>

```buffer
- # A
- ## s┃
- # B
  - x
```

</td><td>

```buffer
- # A
  - ## s┃
- # B
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
- x
```

</td><td>

```buffer
# A
## s┃

# B
- x
```

</td></tr>
</table>

#### [MoveDown25](../../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - para┃
- # B
  - x
```

</td><td>

```buffer
- # A
- para┃
- # B
  - x
```

</td><td>

```buffer
- # A
  - para┃
- # B
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
para┃

# B
- x
```

</td><td>

```buffer
# A
para┃

# B
- x
```

</td></tr>
</table>

#### [MoveDown26](../../spec/move-subtree-down.md#movedown26)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - review┃
- # Home
  - para
```

</td><td>

```buffer
- # Work
- review┃
- # Home
  - para
```

</td><td>

```buffer
- # Work
- # Home
  - review┃
  - para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- review┃

# Home
para
```

</td><td>

```buffer
# Work

# Home
- review┃

para
```

</td></tr>
</table>

#### [MoveDown27](../../spec/move-subtree-down.md#movedown27)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## s┃
- # B
  - ## t
```

</td><td>

```buffer
- # A
- ## s┃
- # B
  - ## t
```

</td><td>

```buffer
- # A
- # B
  - ## s┃
  - ## t
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
## t
```

</td><td>

```buffer
# A

# B
## s┃
## t
```

</td></tr>
</table>

#### [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
  - ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td></tr>
</table>

#### [MoveDown30](../../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - x
```

</td><td>

```buffer
- b
  - a┃
  - x
```

</td><td>

```buffer
- b
  - x
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
9. b
   - x
10. a┃
```

</td></tr>
</table>

#### [MoveDown36](../../spec/move-subtree-down.md#movedown36)

> moveSubtreeDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a
  - para
```

</td><td>

```buffer
- item
  - para
  - ┃a
```

</td><td>

```buffer
- item
  - ┃a
  - para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a

  para
```

</td><td>

```buffer
- item
  - ┃a

  para
```

</td></tr>
</table>

#### [MoveUp3](../../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - text a
- # B┃
  - text b
```

</td><td>

```buffer
- # A
  - text a
  - # B┃
    - text b
```

</td><td>

```buffer
- # B┃
  - text b
- # A
  - text a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

text a

# B┃

text b
```

</td><td>

```buffer
# B┃

text b

# A

text a
```

</td></tr>
</table>

#### [MoveUp15](../../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x
- b┃
```

</td><td>

```buffer
- a
  - x
  - b┃
```

</td><td>

```buffer
- b┃
- a
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
9. b┃
10. a
    - x
```

</td></tr>
</table>

#### [MoveUp16](../../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## a1
- # B┃
  - ## b1
```

</td><td>

```buffer
- # A
  - ## a1
  - # B┃
    - ## b1
```

</td><td>

```buffer
- # B┃
  - ## b1
- # A
  - ## a1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## a1
# B┃
## b1
```

</td><td>

```buffer
# B┃
## b1
# A
## a1
```

</td></tr>
</table>

#### [MoveUp22](../../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
  - ┃review
  - water
```

</td><td>

```buffer
- # Work
  - email
- ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
  - ┃review
- # Home
  - water
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td></tr>
</table>

#### [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
- ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td></tr>
</table>

#### [MoveUp26](../../spec/move-subtree-up.md#moveup26)

Adapted: blank lines, heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - x
- # B
  - ## s┃
    - y
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - x
- ## s┃
  - y
- # B
```

</td><td>

```buffer
- # A
  - x
  - ## s┃
    - y
- # B
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - x
- # B
- ## s┃
  - y
```

</td><td>

```buffer
- # A
  - x
- # B
  - ## s┃
    - y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>moveSubtreeDown</th></tr>
<tr valign="top"><td>

```buffer
# A
- x

# B
## s┃
- y
```

</td><td>

```buffer
# A
- x
## s┃
- y

# B
```

</td><td>

```buffer
# A
- x

# B
## s┃
- y
```

</td></tr>
</table>

#### [MoveUp27](../../spec/move-subtree-up.md#moveup27)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
- # Home
  - ┃review
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
- ┃review
- # Home
```

</td><td>

```buffer
- # Work
  - para
    - ┃review
- # Home
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
- # Home
- ┃review
```

</td><td>

```buffer
- # Work
  - para
- # Home
  - ┃review
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>moveSubtreeDown</th></tr>
<tr valign="top"><td>

```buffer
# Work
para

# Home
- ┃review
```

</td><td>

```buffer
# Work
para
- ┃review

# Home
```

</td><td>

```buffer
# Work
para

# Home
- ┃review
```

</td></tr>
</table>

#### [MoveUp28](../../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## X
- # A┃
  - a
```

</td><td>

```buffer
- # A┃
  - a
- ## X
```

</td><td>

```buffer
- ## X
- # A┃
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## X
# A┃
- a
```

</td><td>

```buffer
## X
# A┃
- a
```

</td></tr>
</table>

#### [MoveUp33](../../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a
  - ## ┃H
```

</td><td>

```buffer
- # H
  - ## ┃H
  - a
```

</td><td>

```buffer
- # H
  - a
  - ## ┃H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a
## ┃H
```

</td><td>

```buffer
# H
- a
## ┃H
```

</td></tr>
</table>

#### [Enter › E10](../../spec/obsidian-true-outliner.md#e10)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃
  - para
```

</td><td>

```buffer
- item
- ┃
  - para
```

</td><td>

```buffer
- item
  - ┃
  - para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃

  para
```

</td><td>

```buffer
- item
  - ┃◌

  para
```

</td></tr>
</table>

#### [Enter › E15](../../spec/obsidian-true-outliner.md#e15)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - item
```

</td><td>

```buffer
- # Head
- ┃line
  - item
```

</td><td>

```buffer
- # Head
  - ┃line
    - item
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
- item
```

</td><td>

```buffer
# Head
┃line
- item
```

</td></tr>
</table>

#### [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading; Also: [obsidian-true-outliner.md › Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello
- ┃ world
```

</td><td>

```buffer
- # Hello
  - ┃world
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

```buffer
Hello
====
┃world
```

</td></tr>
</table>

#### [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)

> enter "x"

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
```

</td><td>

```buffer
- # Head
- x┃
```

</td><td>

```buffer
- # Head
  - x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
```

</td><td>

```buffer
# Head
x┃
```

</td></tr>
</table>

#### [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
  - item
```

</td><td>

```buffer
- # Head
- ┃
  - item
```

</td><td>

```buffer
- # Head
  - ┃
    - item
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
- item
```

</td><td>

```buffer
# Head
┃◌
- item
```

</td></tr>
</table>

#### [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

```buffer
- [ ] alpha
- [ ] ┃ beta
```

</td><td>

```buffer
- [ ] alpha
- [ ] ┃beta
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

```buffer
- [ ] alpha
- [ ] ┃beta
```

</td></tr>
</table>

#### [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # He┃ad
  - ## Sub
```

</td><td>

```buffer
- # He
- ┃ad
  - ## Sub
```

</td><td>

```buffer
- # He
  - ┃ad
  - ## Sub
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# He┃ad
## Sub
```

</td><td>

```buffer
# He
┃ad
## Sub
```

</td></tr>
</table>

#### [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - Body.
```

</td><td>

```buffer
- # Head
- ┃line
  - Body.
```

</td><td>

```buffer
- # Head
  - ┃line
  - Body.
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
Body.
```

</td><td>

```buffer
# Head
┃line

Body.
```

</td></tr>
</table>

#### [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
  - Body.
```

</td><td>

```buffer
- # Head
- ┃
  - Body.
```

</td><td>

```buffer
- # Head
  - ┃
  - Body.
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

```buffer
# Head
┃◌

Body.
```

</td></tr>
</table>

#### [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello
  ┃ world
```

</td><td>

```buffer
- # Hello┃ world
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

```buffer
Hello┃ world
====
```

</td></tr>
</table>

#### [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  bar
```

</td><td>

```buffer
- ┃foo
  
  bar
```

</td><td>

```buffer
- ┃foo
  bar
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

```buffer
┃foo
bar
```

</td></tr>
</table>

#### [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
- a┃
- q
```

</td><td>

```buffer
- p
- ┃
- q
```

</td><td>

```buffer
- p┃
- q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

```buffer
1. p┃
2. q
```

</td></tr>
</table>

#### [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
- ┃x
- c
```

</td><td>

```buffer
- a
- b
- ┃x
- c
```

</td><td>

```buffer
- a
- b┃x
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b
- ┃x
3. c
```

</td><td>

```buffer
1. a
2. b┃x
3. c
```

</td></tr>
</table>

#### [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃a
  - b
```

</td><td>

```buffer
- p
  - ┃a
  - b
```

</td><td>

```buffer
- p┃a
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

```buffer
- p┃a
  1. b
```

</td></tr>
</table>

#### [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
- c
```

</td><td>

```buffer
- a
- ┃b
- c
```

</td><td>

```buffer
- a┃b
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

```buffer
3. a┃b
4. c
```

</td></tr>
</table>

#### [Outdent4](../../spec/outdent.md#outdent4)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - ### B
```

</td><td>

```buffer
- ## A
  - ### B
```

</td><td>

```buffer
- # A┃
  - ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
### B
```

</td><td>

```buffer
# A┃
## B
```

</td></tr>
</table>

#### [Outdent11](../../spec/outdent.md#outdent11)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T
  - ## A┃
  - ## B
```

</td><td>

```buffer
- # T
- ## A┃
  - ## B
```

</td><td>

```buffer
- # T
- # A┃
  - ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T
## A┃
## B
```

</td><td>

```buffer
# T
# A┃
## B
```

</td></tr>
</table>

#### [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- b
```

</td><td>

```buffer
- a┃
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
a┃
- b
```

</td></tr>
</table>

#### [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

```buffer
- a
  - a1
- b
```

</td><td>

```buffer
- a┃
  - a1
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

```buffer
a┃
- a1
- b
```

</td></tr>
</table>

#### [Paste1](../../spec/paste.md#paste1)

> pasteStructured

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

```buffer
- para
  - ac┃
  - b
```

</td><td>

````buffer
- para
  - a
    - ```
      c┃
      ```
  - b
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

````buffer
para
- a
  ```
  c┃
  ```
- b
````

</td></tr>
</table>

#### [Paste2](../../spec/paste.md#paste2)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td><td>

```buffer
- a
- x
- y┃
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. a
2. x
3. y┃
4. b
```

</td></tr>
</table>

#### [Paste4](../../spec/paste.md#paste4)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y┃b
```

</td><td>

```buffer
- ax
  \- y
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
  \- y
  ┃b
```

</td></tr>
</table>

#### [Paste6](../../spec/paste.md#paste6)

> pastePlain

Adapted: heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- # H┃
```

</td><td>

```buffer
- # Hx
  y┃
```

</td><td>

```buffer
- # H┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
```

</td><td>

```buffer
# H┃
```

</td></tr>
</table>

#### [Paste13](../../spec/paste.md#paste13)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td><td>

```buffer
- a
- 1. x
- 2. y┃
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- 1\. x
- 2\. y┃
- b
```

</td></tr>
</table>

#### [Paste14](../../spec/paste.md#paste14)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- ax
- y┃
  - kid
```

</td><td>

```buffer
- a
  - 1. x
  - 2. y┃
  - kid
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- a
  - 1\. x
  - 2\. y┃
  - kid
```

</td></tr>
</table>

#### [Paste17](../../spec/paste.md#paste17)

> pasteStructured

Adapted: escape, numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
   1. x1
2. y
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
  - x1
- y┃
```

</td><td>

```buffer
- a
- 1. x
  - x1
- 2. y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- 1\. x
  1. x1
- 2\. y┃
```

</td></tr>
</table>

#### [Paste18](../../spec/paste.md#paste18)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td><td>

```buffer
- a
- x
- y┃
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. a
2. x
3. y┃
4. b
```

</td></tr>
</table>

#### [Paste19](../../spec/paste.md#paste19)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
text
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- ah
- text┃
```

</td><td>

```buffer
- a
- # h
  - text┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- # h
  text┃
```

</td></tr>
</table>

#### [Paste20](../../spec/paste.md#paste20)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td><td>

```buffer
- Notes┃
  - x
  - z
```

</td><td>

```buffer
- Notesp
- q┃
  - x
  - z
```

</td><td>

```buffer
- Notes
  - p
  - q┃
  - x
  - z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃

- x
- z
```

</td><td>

```buffer
Notes

- p
- q┃
- x
- z
```

</td></tr>
</table>

#### [Paste21](../../spec/paste.md#paste21)

> pasteStructured

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td><td>

```buffer
- Notes┃
  - x
```

</td><td>

```buffer
- Notesp
- q┃
  - x
```

</td><td>

```buffer
- Notes
  - p
  - q┃
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃
- x
```

</td><td>

```buffer
Notes
- p
- q┃
- x
```

</td></tr>
</table>

#### [Paste25](../../spec/paste.md#paste25)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td><td>

```buffer
- a┃
  - kid
- b
```

</td><td>

```buffer
- ac┃
  - kid
- b
```

</td><td>

````buffer
- a
  - ```
    c┃
    ```
  - kid
- b
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
- b
```

</td><td>

````buffer
- a
  ```
  c┃
  ```
  - kid
- b
````

</td></tr>
</table>

#### [Paste27](../../spec/paste.md#paste27)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- [ ] t┃
  - g
```

</td><td>

```buffer
- [ ] ta
- b┃
  - g
```

</td><td>

```buffer
- [ ] t
  - a
  - b┃
  - g
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] t┃
    - g
```

</td><td>

```buffer
- [ ] t
    - a
    - b┃
    - g
```

</td></tr>
</table>

#### [Paste30](../../spec/paste.md#paste30)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
2. y
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
- y┃
```

</td><td>

```buffer
- ax
  2\. y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
  2\. y┃
```

</td></tr>
</table>

#### [Paste32](../../spec/paste.md#paste32)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
- para┃
```

</td><td>

```buffer
- parah┃
```

</td><td>

```buffer
- para
- # h┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td><td>

```buffer
para

# h┃
```

</td></tr>
</table>

#### [Paste33](../../spec/paste.md#paste33)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
- ## A
  - para┃
```

</td><td>

```buffer
- ## A
  - parah┃
```

</td><td>

```buffer
- ## A
  - para
- ## h┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A

para┃
```

</td><td>

```buffer
## A

para

## h┃
```

</td></tr>
</table>

#### [Paste34](../../spec/paste.md#paste34)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
- para┃
- next
```

</td><td>

```buffer
- parah┃
- next
```

</td><td>

```buffer
- para
- # h┃
  - next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃

next
```

</td><td>

```buffer
para

# h┃

next
```

</td></tr>
</table>

#### [Paste35](../../spec/paste.md#paste35)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
- ## A
  - para┃
  - more
  - ### C
- ## B
```

</td><td>

```buffer
- ## A
  - parah┃
  - more
  - ### C
- ## B
```

</td><td>

```buffer
- ## A
  - para
- ## h┃
  - more
  - ### C
- ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A

para┃

more

### C

## B
```

</td><td>

```buffer
## A

para

## h┃

more

### C

## B
```

</td></tr>
</table>

#### [Paste37](../../spec/paste.md#paste37)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td><td>

```buffer
- See ┃here.
```

</td><td>

```buffer
- See x
- y┃here.
```

</td><td>

```buffer
- See x
  - y
- ┃here.
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
See ┃here.
```

</td><td>

```buffer
See x
- y

┃here.
```

</td></tr>
</table>

#### [Paste40](../../spec/paste.md#paste40)

> pastePlain

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x

y
```

</td><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax
- y┃b
- c
```

</td><td>

```buffer
- ax
  - y
    ┃b
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax

  y
  ┃b
- c
```

</td></tr>
</table>

#### [Paste45](../../spec/paste.md#paste45)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
$$
x^2
$$
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a$$
  x^2
  $$┃b
```

</td><td>

```buffer
- a$$
  x^2
  $$
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a$$
  x^2
  \$$
  ┃b
```

</td></tr>
</table>

#### [Paste51](../../spec/paste.md#paste51)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
- see ┃- below
```

</td><td>

```buffer
- see x┃- below
```

</td><td>

```buffer
- see x
  ┃\- below
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃- below
```

</td><td>

```buffer
- see x
  ┃\- below
```

</td></tr>
</table>

#### [Paste52](../../spec/paste.md#paste52)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- code┃
  - kid
```

</td><td>

````buffer
- ```
  code┃
  ```
  - kid
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

````buffer
- ```
  code┃
  ```
  - kid
````

</td></tr>
</table>

#### [Paste53](../../spec/paste.md#paste53)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
Title
=====
```

</td><td>

```buffer
- para┃
```

</td><td>

```buffer
- paraTitle┃
```

</td><td>

```buffer
- para
- # Title┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td><td>

```buffer
para

Title┃
=====
```

</td></tr>
</table>

#### [Paste54](../../spec/paste.md#paste54)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- # Hel┃lo
```

</td><td>

```buffer
- # Helx
  y┃lo
```

</td><td>

```buffer
- # Hello
  - x
    y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Hel┃lo
```

</td><td>

```buffer
# Hello

x
y┃
```

</td></tr>
</table>

#### [Paste56](../../spec/paste.md#paste56)

> pasteStructured

Adapted: table

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- | a┃ | b |
  | - | - |
```

</td><td>

```buffer
- | ax
  y┃ | b |
  | - | - |
```

</td><td>

```buffer
- | a┃ | b |
  | - | - |
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
| a┃ | b |
| - | - |
```

</td><td>

```buffer
| a┃ | b |
| - | - |
```

</td></tr>
</table>

#### [Paste57](../../spec/paste.md#paste57)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## Summary

The fix:
- parser
- test
```

</td><td>

```buffer
- Notes┃
- Later
```

</td><td>

```buffer
- NotesSummary
- The fix:
- parser
- test┃
- Later
```

</td><td>

```buffer
- Notes
- ## Summary
  - The fix:
  - parser
  - test┃
- Later
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Notes┃
- Later
```

</td><td>

```buffer
- Notes
- ## Summary
  The fix:
  - parser
  - test┃
- Later
```

</td></tr>
</table>

#### [Paste58](../../spec/paste.md#paste58)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
---
title: x
---
```

</td><td>

```buffer
- Intro
- ┃
- Outro
```

</td><td>

```buffer
- Intro
- <divider> 
- ## title: x┃
- Outro
```

</td><td>

```buffer
- Intro
- ---
- ## title: x┃
  - Outro
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro

┃◌

Outro
```

</td><td>

```buffer
Intro

---
title: x┃
---

Outro
```

</td></tr>
</table>

#### [Paste59](../../spec/paste.md#paste59)

> pasteStructured

Adapted: blank lines, heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- milk
- eggs
```

</td><td>

```buffer
- # Groceries┃
  - bread
```

</td><td>

```buffer
- # Groceriesmilk
- eggs┃
  - bread
```

</td><td>

```buffer
- # Groceries
  - milk
  - eggs┃
  - bread
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Groceries┃

- bread
```

</td><td>

```buffer
# Groceries

- milk
- eggs┃
- bread
```

</td></tr>
</table>

#### [Paste61](../../spec/paste.md#paste61)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# Z
```

</td><td>

```buffer
- # A
  - ## B
    - text┃
  - ## C
```

</td><td>

```buffer
- # A
  - ## B
    - textZ┃
  - ## C
```

</td><td>

```buffer
- # A
  - ## B
    - text
- # Z┃
  - ## C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B
text┃
## C
```

</td><td>

```buffer
# A
## B
text
# Z┃
## C
```

</td></tr>
</table>

#### [Paste62](../../spec/paste.md#paste62)

> pasteStructured

Adapted: blank lines, code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
make build
```
````

</td><td>

```buffer
- Run ┃then deploy.
```

</td><td>

```buffer
- Run make build┃then deploy.
```

</td><td>

````buffer
- Run
- ```
  make build
  ```
- ┃then deploy.
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Run ┃then deploy.
```

</td><td>

````buffer
Run
```
make build
```

┃then deploy.
````

</td></tr>
</table>

#### [Paste63](../../spec/paste.md#paste63)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- see ┃here
```

</td><td>

```buffer
- see x
- y┃here
```

</td><td>

```buffer
- see 1. x
- 2. y
- ┃here
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃here
```

</td><td>

```buffer
- see 1. x
- 2\. y
- ┃here
```

</td></tr>
</table>

#### [Paste64](../../spec/paste.md#paste64)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- ┃words
```

</td><td>

```buffer
- a
- b┃words
```

</td><td>

```buffer
- - a
  \- b┃words
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃words
```

</td><td>

```buffer
\- a
\- b┃words
```

</td></tr>
</table>

#### [Paste66](../../spec/paste.md#paste66)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```js
      // greet
        f();
      ```
````

</td><td>

```buffer
- grandchild┃
```

</td><td>

````buffer
- grandchild      // greet
          f();
        ```┃
````

</td><td>

````buffer
- grandchild
  - ```js
    // greet
      f();┃
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- grandchild┃
```

</td><td>

````buffer
- grandchild
  ```js
  // greet
    f();┃
  ```
````

</td></tr>
</table>

#### [Paste68](../../spec/paste.md#paste68)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
- p┃ ---
```

</td><td>

```buffer
- px┃ ---
```

</td><td>

```buffer
- px
  ┃---
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃ ---
```

</td><td>

```buffer
px
┃\---
```

</td></tr>
</table>

#### [Paste69](../../spec/paste.md#paste69)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
- [a]: ┃b c
```

</td><td>

```buffer
- [a]: x┃b c
```

</td><td>

```buffer
- [a]: x
  ┃b c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: ┃b c
```

</td><td>

```buffer
\[a]: x
┃b c
```

</td></tr>
</table>

#### [Paste70](../../spec/paste.md#paste70)

> pasteStructured

Adapted: blank lines, code block, escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td><td>

```buffer
- p┃
  \- g
```

</td><td>

```buffer
- pc┃
  \- g
```

</td><td>

````buffer
- p
- ```
  c
  ```
- ┃- g
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃
    - g
```

</td><td>

````buffer
p
```
c
```

┃\- g
````

</td></tr>
</table>

#### [Paste76](../../spec/paste.md#paste76)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- # ┃Hello
  - body
```

</td><td>

```buffer
- # a
- b┃Hello
  - body
```

</td><td>

```buffer
- # Hello
  - a
  - b┃
  - body
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# ┃Hello
body
```

</td><td>

```buffer
# Hello

- a
- b┃

body
```

</td></tr>
</table>

#### [Paste79](../../spec/paste.md#paste79)

> pasteStructured

Adapted: blank lines, math, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
$$
    x
    $$
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- a$$
  x
  $$┃
```

</td><td>

```buffer
- a
- $$
      x┃
      $$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃
```

</td><td>

```buffer
a

$$
    x┃
    $$
```

</td></tr>
</table>

#### [Placeholder2](../../spec/placeholders.md#placeholder2)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- 
```

</td><td>

```buffer
- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a

┃◌
```

</td><td>

```buffer
┃- a
```

</td></tr>
</table>

#### [Placeholder3](../../spec/placeholders.md#placeholder3)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
- ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
- 
```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td><td>

```buffer
para

┃◌
```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

#### [Placeholder13](../../spec/placeholders.md#placeholder13)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃a
  - ## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃
  - ## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃H2
```

</td><td>

```buffer
- # H1
  - ## ┃H2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃a

## H2
```

</td><td>

```buffer
# H1

┃◌

## H2
```

</td><td>

```buffer
# H1

## ┃H2
```

</td></tr>
</table>

#### [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Groceries┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- ┃
```

</td></tr>
</table>

> "- milk"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- milk┃
```

</td><td>

```buffer
- Groceries
  - milk┃
```

</td></tr>
</table>

> enter "eggs"

> enter indent "brown"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- milk
- eggs
  - brown┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown┃
```

</td></tr>
</table>

> enter enter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- milk
- eggs
  - brown
  - ┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown
  - ┃
```

</td></tr>
</table>

> enter "Done."

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- milk
- eggs
  - brown
- Done.┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown
- Done.┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"- milk"</th><th>enter indent "brown"</th><th>enter enter</th><th>enter "Done."</th></tr>
<tr valign="top"><td>

```buffer
Groceries┃
```

</td><td>

```buffer
Groceries

┃◌
```

</td><td>

```buffer
Groceries

- milk┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown
- ┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown

Done.┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

Adapted: blank lines, paragraph, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk┃
```

</td></tr>
</table>

> enter "bread" enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
- [ ] ┃
```

</td></tr>
</table>

> deleteContentBackward "two loaves" indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
  - ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

</td></tr>
</table>

> enter "Shop closes at six."

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- 
- Shop closes at six.┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- Shop closes at six.┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "bread" enter</th><th>deleteContentBackward "two loaves" indent</th><th>enter</th><th>enter</th><th>enter "Shop closes at six."</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
- [ ] ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
  - ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16)

Adapted: blank lines, heading, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
  - [x] ┃review
  - water
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- [x] ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
  - [x] ┃review
- # Home
  - water
```

</td></tr>
</table>

> "today "

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- [x] today ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
  - [x] today ┃review
- # Home
  - water
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
  - [x] ┃review
  - water
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>"today "</th><th>undo undo</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

</td><td>

```buffer
# Work
- email
- [x] ┃review

# Home
- water
```

</td><td>

```buffer
# Work
- email
- [x] today ┃review

# Home
- water
```

</td><td>

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

</td></tr>
</table>

#### [Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

> pasteStructured "!"

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td><td>

```buffer
- Notes
  - example┃
  - next
```

</td><td>

```buffer
- Notes
  - examplecode!┃
  - next
```

</td><td>

````buffer
- Notes
  - example
    - ```
      code!┃
      ```
  - next
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes
- example┃
- next
```

</td><td>

````buffer
Notes
- example
  ```
  code!┃
  ```
- next
````

</td></tr>
</table>

#### [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Notes┃
```

</td></tr>
</table>

> enter "first idea"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- first idea┃
```

</td><td>

```buffer
- # Notes
  - first idea┃
```

</td></tr>
</table>

> enter "second"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- first idea
- second┃
```

</td><td>

```buffer
- # Notes
  - first idea
  - second┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- second┃
- first idea
```

</td><td>

```buffer
- # Notes
  - second┃
  - first idea
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "first idea"</th><th>enter "second"</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# Notes┃
```

</td><td>

```buffer
# Notes
first idea┃
```

</td><td>

```buffer
# Notes
first idea

second┃
```

</td><td>

```buffer
# Notes
second┃

first idea
```

</td></tr>
</table>

#### [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Trip┃
```

</td></tr>
</table>

> enter "Pack light." enter "Book the train."

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Pack light.
- Book the train.┃
```

</td><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Pack light.
- Book the train.
  Seat 42.┃
```

</td><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.
    Seat 42.┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Book the train.
  Seat 42.┃
- Pack light.
```

</td><td>

```buffer
- # Trip
  - Book the train.
    Seat 42.┃
  - Pack light.
```

</td></tr>
</table>

> undo

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip┃
```

</td><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.
    Seat 42.┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "Pack light." enter "Book the train."</th><th>shiftEnter "Seat 42."</th><th>moveSubtreeUp</th><th>undo</th></tr>
<tr valign="top"><td>

```buffer
# Trip┃
```

</td><td>

```buffer
# Trip
Pack light.

Book the train.┃
```

</td><td>

```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

</td><td>

```buffer
# Trip
Book the train.
Seat 42.┃

Pack light.
```

</td><td>

```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

</td></tr>
</table>

#### [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

```buffer
- one
  ┃two
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

```buffer
- one┃
  two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>cursorLineUp cursorLineBoundaryForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
one┃two
```

</td><td>

```buffer
one

┃two
```

</td><td>

```buffer
one
┃two
```

</td><td>

```buffer
one┃
two
```

</td><td>

```buffer
one┃two
```

</td></tr>
</table>

#### [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22)

Adapted: blank lines, heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work┃
  - email
- # Home
  - plants
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Home
  - # Work┃
    - email
  - plants
```

</td><td>

```buffer
- # Home
  - plants
- # Work┃
  - email
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work┃
  - email
- # Home
  - plants
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td><td>

```buffer
# Home

- plants

# Work┃

- email
```

</td><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td></tr>
</table>

#### [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

Adapted: escape, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Plan┃2. draft
```

</td></tr>
</table>

> enter "revise "

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revise ┃2. draft
```

</td><td>

```buffer
- # Plan
  - revise ┃2\. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revise 
  ┃2\. draft
```

</td><td>

```buffer
- # Plan
  - revise
    ┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Plan┃2. draft
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "revise "</th><th>shiftEnter</th><th>undo undo undo</th></tr>
<tr valign="top"><td>

```buffer
# Plan┃2. draft
```

</td><td>

```buffer
# Plan
revise ┃2\. draft
```

</td><td>

```buffer
# Plan
revise
┃2\. draft
```

</td><td>

```buffer
# Plan┃2. draft
```

</td></tr>
</table>

#### [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)

Adapted: paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  ┃milk
  bread
```

</td></tr>
</table>

> "- "

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  \- ┃milk
  bread
```

</td><td>

```buffer
- Shopping:
  - ┃milk
    bread
```

</td></tr>
</table>

> cursorLineDown cursorLineBoundaryBackward "- "

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  \- milk
  \- ┃bread
```

</td><td>

```buffer
- Shopping:
  - milk
  - ┃bread
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"- "</th><th>cursorLineDown cursorLineBoundaryBackward "- "</th></tr>
<tr valign="top"><td>

```buffer
Shopping:
┃milk
bread
```

</td><td>

```buffer
Shopping:
- ┃milk
bread
```

</td><td>

```buffer
Shopping:
- milk
- ┃bread
```

</td></tr>
</table>

#### [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃bc
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  ┃bc
```

</td><td>

```buffer
- a
  - ┃bc
```

</td></tr>
</table>

> "x"

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  x┃bc
```

</td><td>

```buffer
- a
  - x┃bc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>"x"</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃bc
```

</td><td>

```buffer
- a

  ┃bc
```

</td><td>

```buffer
- a

  x┃bc
```

</td></tr>
</table>

#### [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

```buffer
- one
  
  ┃
- two
```

</td><td>

```buffer
- one
  - ┃
- two
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃◌
- two
```

</td><td>

```buffer
- one

  ┃◌
- two
```

</td></tr>
</table>

#### [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

```buffer
- para
  
  ┃
```

</td><td>

```buffer
- para
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃◌
```

</td><td>

```buffer
para

┃◌
```

</td></tr>
</table>

#### [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ more
```

</td><td>

```buffer
- # Title
  ┃ more
```

</td><td>

```buffer
- # Title┃ more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ more
```

</td><td>

```buffer
# Title┃ more
```

</td></tr>
</table>

#### [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

```buffer
- one
  
  p┃
```

</td><td>

```buffer
- one
  - p┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

```buffer
- one

  p┃
```

</td></tr>
</table>

#### [ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

> shiftEnter shiftEnter "p"

Adapted: CR line endings, blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  
  p┃
```

</td><td>

```buffer
- a
  - p┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃␍
```

</td><td>

```buffer
- a␍
␍
  p┃␍
```

</td></tr>
</table>

#### [ShiftEnter24](../../spec/shift-enter.md#shiftenter24)

> shiftEnter

Adapted: table

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | on
  ┃e | 2 |
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

</td><td>

```buffer
| a | b |
| --- | --- |
| on┃e | 2 |
```

</td></tr>
</table>

#### [ShiftEnter25](../../spec/shift-enter.md#shiftenter25)

> shiftEnter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  ┃[r]: /u
```

</td><td>

```buffer
- p
  
  ┃[r]: /u
```

</td><td>

```buffer
- p
- ┃[r]: /u
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p
┃[r]: /u
```

</td><td>

```buffer
p

┃\[r]: /u
```

</td></tr>
</table>

#### [TaskEnter2](../../spec/tasks.md#taskenter2)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
```

</td><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
- [ ] ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
```

</td><td>

```buffer
- a
- [ ] ┃
```

</td></tr>
</table>

#### [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

```buffer
- a
  - b
  - [ ] 
  - [ ] ┃
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

```buffer
- a
  - b
  - [ ] 
  - [ ] ┃
  - c
```

</td></tr>
</table>

#### [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

```buffer
- a
  - ┃
  - b
```

</td><td>

```buffer
- a
  - [ ] 
  - [ ] ┃
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

```buffer
- a
  - [ ] 
  - [ ] ┃
  - b
```

</td></tr>
</table>

#### [TaskEnter7](../../spec/tasks.md#taskenter7)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

```buffer
- [x] a
- [ ] ┃ b
  - c
```

</td><td>

```buffer
- [x] a
- [ ] ┃b
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

```buffer
- [x] a
- [ ] ┃b
  - c
```

</td></tr>
</table>

#### [TaskDelete2](../../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- ┃a
```

</td><td>

```buffer
- [x] ┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- [x] ┃a
```

</td></tr>
</table>

#### [Typing2](../../spec/typing.md#typing2)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ---x┃
```

</td><td>

```buffer
- para
  ---┃
```

</td><td>

```buffer
- ## para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
---x┃
```

</td><td>

```buffer
para
---┃
```

</td></tr>
</table>

#### [Typing3](../../spec/typing.md#typing3)

> "- "

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃more
```

</td><td>

```buffer
- para
  \- ┃more
```

</td><td>

```buffer
- para
  - ┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃more
```

</td><td>

```buffer
para
- ┃more
```

</td></tr>
</table>

#### [Undo3](../../spec/undo.md#undo3)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - 
```

</td></tr>
</table>

> undo

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a┃
  - 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>indent</th><th>cursorDocStart cursorLineBoundaryForward</th><th>undo</th><th>cursorDocStart cursorLineBoundaryForward</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
  - ┃◌
```

</td><td>

```buffer
- a┃

  - 
```

</td><td>

```buffer
- a
  - ┃◌
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

### Whitespace (24)

#### [Enter3c](../../spec/enter.md#enter3c)

> enter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
- d
```

</td><td>

```buffer
- a
- ┃ b
  - c
- d
```

</td><td>

```buffer
- a
- ┃b
  - c
- d
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

```buffer
9. a
10. ┃b
    - c
11. d
```

</td></tr>
</table>

#### [Enter8](../../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc 
- ┃- def
```

</td><td>

```buffer
- abc
- ┃- def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc
- ┃\- def
```

</td></tr>
</table>

#### [Enter9](../../spec/enter.md#enter9)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

```buffer
- abc 
- ┃# def
```

</td><td>

```buffer
- abc
- ┃# def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

```buffer
- abc
- ┃\# def
```

</td></tr>
</table>

#### [Enter10](../../spec/enter.md#enter10)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

```buffer
- abc 
- ┃<div>
```

</td><td>

```buffer
- abc
- ┃<div>
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

```buffer
- abc
- ┃\<div>
```

</td></tr>
</table>

#### [Enter11](../../spec/enter.md#enter11)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃[a]: /url
```

</td><td>

```buffer
- see 
- ┃[a]: /url
```

</td><td>

```buffer
- see
- ┃[a]: /url
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

```buffer
see

┃\[a]: /url
```

</td></tr>
</table>

#### [Enter12](../../spec/enter.md#enter12)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- some┃ text
```

</td><td>

```buffer
- some
- ┃ text
```

</td><td>

```buffer
- some
- ┃text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

```buffer
some

┃text
```

</td></tr>
</table>

#### [Enter22](../../spec/enter.md#enter22)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para ┃- x
  - a
```

</td><td>

```buffer
- para 
- ┃- x
  - a
```

</td><td>

```buffer
- para
- ┃- x
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

```buffer
para

┃\- x
- a
```

</td></tr>
</table>

#### [Enter35](../../spec/enter.md#enter35)

> enter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. def
```

</td><td>

```buffer
- abc 
- ┃2. def
```

</td><td>

```buffer
- abc
- ┃2. def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

```buffer
1. abc
2. ┃2\. def
```

</td></tr>
</table>

#### [Fence3](../../spec/fences.md#fence3)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
      nested┃
    ```
````

</td><td>

````buffer
- a
  - ```
      nested
    ┃
    ```
````

</td><td>

````buffer
- a
  - ```
      nested
      ┃
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
    nested┃
  ```
````

</td><td>

````buffer
- a
  ```
    nested
    ┃
  ```
````

</td></tr>
</table>

#### [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
  - child
```

</td><td>

```buffer
- one
- ┃ two
  - child
```

</td><td>

```buffer
- one
- ┃two
  - child
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
- child
```

</td><td>

```buffer
one

┃two
- child
```

</td></tr>
</table>

#### [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
```

</td><td>

```buffer
- one
  ┃ two
```

</td><td>

```buffer
- one
  ┃two
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

```buffer
one
┃two
```

</td></tr>
</table>

#### [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - para┃ text
```

</td><td>

```buffer
- item
  - para
    ┃ text
```

</td><td>

```buffer
- item
  - para
    ┃text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

```buffer
- item

  para
  ┃text
```

</td></tr>
</table>

#### [Paste75](../../spec/paste.md#paste75)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- a
- [ ] ┃
```

</td><td>

```buffer
- a
- [ ] x
  y┃
```

</td><td>

```buffer
- a
- [ ] x
  y
  ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

```buffer
- a
- [ ] x
  y
  ┃◌
```

</td></tr>
</table>

#### [Placeholder4](../../spec/placeholders.md#placeholder4)

Adapted: paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para┃
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
  
```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td><td>

```buffer
para
┃◌
```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

#### [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃ c
```

</td><td>

```buffer
- a
  - b
    ┃ c
```

</td><td>

```buffer
- a
  - b
    ┃c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃c
```

</td></tr>
</table>

#### [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc 
  ┃\- def
```

</td><td>

```buffer
- abc
  ┃\- def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc
  ┃\- def
```

</td></tr>
</table>

#### [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc 
  ┃1\. def
```

</td><td>

```buffer
- abc
  ┃1\. def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc
  ┃1\. def
```

</td></tr>
</table>

#### [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃===
```

</td><td>

```buffer
- Title 
  ┃===
```

</td><td>

```buffer
- Title
  ┃===
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

```buffer
Title
┃\===
```

</td></tr>
</table>

#### [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃--
```

</td><td>

```buffer
- Title 
  ┃--
```

</td><td>

```buffer
- Title
  ┃--
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

```buffer
Title
┃\--
```

</td></tr>
</table>

#### [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

```buffer
- one 
  ┃<div>
```

</td><td>

```buffer
- one
  ┃<div>
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

```buffer
- one
  ┃\<div>
```

</td></tr>
</table>

#### [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. x
```

</td><td>

```buffer
- abc 
  ┃2\. x
```

</td><td>

```buffer
- abc
  ┃2\. x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc
   ┃2\. x
```

</td></tr>
</table>

#### [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a | b ┃|---|---|
```

</td><td>

```buffer
- a | b 
  ┃|---|---|
```

</td><td>

```buffer
- a | b
  ┃|---|---|
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

```buffer
a | b
┃\|---|---|
```

</td></tr>
</table>

#### [ShiftEnter23](../../spec/shift-enter.md#shiftenter23)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td><td>

```buffer
- [Note]: this 
  ┃matters a lot
```

</td><td>

```buffer
- [Note]: this
  ┃matters a lot
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
```

</td><td>

```buffer
\[Note]: this
┃matters a lot
```

</td></tr>
</table>

#### [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

```buffer
- [ ] abc 
- [ ] ┃# x
```

</td><td>

```buffer
- [ ] abc
- [ ] ┃# x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

```buffer
- [ ] abc
- [ ] ┃# x
```

</td></tr>
</table>

### Caret (13)

#### [CursorUp2](../../spec/cursor.md#cursorup2)

> cursorLineUp

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title
  - ┃a
```

</td><td>

```buffer
- ## Titl┃e
  - a
```

</td><td>

```buffer
- ## ┃Title
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

```buffer
## ┃Title
- a
```

</td></tr>
</table>

#### [CursorDown1](../../spec/cursor.md#cursordown1)

> cursorLineDown cursorLineDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
- abcdef
```

</td><td>

```buffer
- abc
- abcdef┃
```

</td><td>

```buffer
- abc
- abc┃def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc┃

abcdef
```

</td><td>

```buffer
abc

abc┃def
```

</td></tr>
</table>

#### [CursorDown2](../../spec/cursor.md#cursordown2)

> cursorLineDown

Adapted: code block, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- →x┃
- abcdefg
```

</td><td>

```buffer
- →x
- abc┃defg
```

</td><td>

```buffer
- →x
- abcde┃fg
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→x┃
abcdefg
```

</td><td>

```buffer
→x
abcde┃fg
```

</td></tr>
</table>

#### [CursorDown5](../../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

```buffer
- a
- [ ] t┃ask
```

</td><td>

```buffer
- a
- [ ] ┃task
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

```buffer
- a
- [ ] ┃task
```

</td></tr>
</table>

#### [Enter32](../../spec/enter.md#enter32)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
  - body
```

</td><td>

```buffer
- para
- 
- # ┃Title
  - body
```

</td><td>

```buffer
- para
- ┃
- # Title
  - body
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Title

body
```

</td><td>

```buffer
para

┃◌

# Title

body
```

</td></tr>
</table>

#### [Enter45](../../spec/enter.md#enter45)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
```

</td><td>

```buffer
- para
- 
- # ┃Title
```

</td><td>

```buffer
- para
- ┃
- # Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
# ┃Title
```

</td><td>

```buffer
para

┃◌

# Title
```

</td></tr>
</table>

#### [Indent11](../../spec/indent.md#indent11)

> indent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Intro
  - a┃
```

</td><td>

```buffer
- Intro
  - a
```

</td><td>

```buffer
- Intro
  - a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro

- a┃
```

</td><td>

```buffer
Intro

- a┃
```

</td></tr>
</table>

#### [Indent24](../../spec/indent.md#indent24)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ###### B┃
```

</td><td>

```buffer
- # A
  - ###### B
```

</td><td>

```buffer
- # A
  - ###### B┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
###### B┃
```

</td><td>

```buffer
# A
###### B┃
```

</td></tr>
</table>

#### [MoveUp37](../../spec/move-subtree-up.md#moveup37)

> moveSubtreeUp

Adapted: math

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃$$
```

</td><td>

```buffer
- ┃$$
- a
```

</td><td>

```buffer
- $$┃
- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃$$
```

</td><td>

```buffer
- $$┃
- a
```

</td></tr>
</table>

#### [MoveUp38](../../spec/move-subtree-up.md#moveup38)

> moveSubtreeUp

Adapted: math, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- $$
  x$$┃
  - tail
```

</td><td>

```buffer
- $$
  x$$┃
  - tail
- b
```

</td><td>

```buffer
- $$
  x┃$$
  - tail
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- $$
  x$$┃
  tail
```

</td><td>

```buffer
- $$
  x┃$$
  tail
- b
```

</td></tr>
</table>

#### [Outdent5](../../spec/outdent.md#outdent5)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
```

</td><td>

```buffer
- # A
```

</td><td>

```buffer
- # A┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
```

</td><td>

```buffer
# A┃
```

</td></tr>
</table>

#### [Paste44](../../spec/paste.md#paste44)

> pasteStructured

Adapted: math

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
$$
x^2
$$
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- $$
  x^2
  $$┃
```

</td><td>

```buffer
- a
- $$
  x^2┃
  $$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- $$
  x^2┃
  $$
```

</td></tr>
</table>

#### [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

```buffer
- [ ] 
- [ ] ┃abc
```

</td><td>

```buffer
- [ ] ┃
- [ ] abc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

```buffer
- [ ] ┃
- [ ] abc
```

</td></tr>
</table>

### Error (2)

#### [Outdent17](../../spec/outdent.md#outdent17)

Adapted: heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
```

</td></tr>
</table>

> outdent

Error: BlockNote holds the starting state differently:
  meant:
    - ┃# H
    - b
  holds:
    - # ┃H
    - b

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
```

</td><td>

```buffer
# ┃H
- b
```

</td></tr>
</table>

#### [Outdent18](../../spec/outdent.md#outdent18)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
- after
```

</td></tr>
</table>

> outdent

Error: BlockNote holds the starting state differently:
  meant:
    - ┃# H
    - b
    - after
  holds:
    - # ┃H
    - b
    - after

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b

after
```

</td><td>

```buffer
- ┃# H
- b

after
```

</td></tr>
</table>

### Agree (118)

1. [Backspace12b](../../spec/backspace.md#backspace12b) (blank lines, paragraph)
2. [Backspace16](../../spec/backspace.md#backspace16) (code block)
3. [Backspace18e](../../spec/backspace.md#backspace18e) (heading)
4. [Backspace23](../../spec/backspace.md#backspace23) (blank lines, heading, paragraph)
5. [Backspace24](../../spec/backspace.md#backspace24) (blank lines, code block, paragraph)
6. [Backspace26](../../spec/backspace.md#backspace26) (paragraph)
7. [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1) (task)
8. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2) (escape, paragraph)
9. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4) (heading)
10. [CursorLeft1](../../spec/cursor.md#cursorleft1) (paragraph)
11. [CursorLeft2](../../spec/cursor.md#cursorleft2) (paragraph)
12. [CursorLeft3](../../spec/cursor.md#cursorleft3) (paragraph)
13. [CursorRight1](../../spec/cursor.md#cursorright1) (paragraph)
14. [CursorRight2](../../spec/cursor.md#cursorright2) (paragraph)
15. [CursorUp1](../../spec/cursor.md#cursorup1) (paragraph)
16. [CursorHome7](../../spec/cursor.md#cursorhome7) (numbered list)
17. [CursorHome8](../../spec/cursor.md#cursorhome8) (task)
18. [CursorHome9](../../spec/cursor.md#cursorhome9) (task)
19. [CursorHome10](../../spec/cursor.md#cursorhome10) (heading)
20. [CursorHome14](../../spec/cursor.md#cursorhome14) (paragraph)
21. [SelectLeft1](../../spec/cursor.md#selectleft1) (paragraph)
22. [SelectRightEnd1](../../spec/cursor.md#selectrightend1) (paragraph)
23. [Delete17](../../spec/del.md#delete17) (blank lines, paragraph)
24. [Delete26](../../spec/del.md#delete26) (heading, paragraph, setext heading)
25. [Delete27](../../spec/del.md#delete27) (escape)
26. [Delete28](../../spec/del.md#delete28) (blank lines, paragraph)
27. [Enter2](../../spec/enter.md#enter2) (numbered list)
28. [Enter14](../../spec/enter.md#enter14) (blank lines, paragraph)
29. [Enter17](../../spec/enter.md#enter17) (CR line endings)
30. [Enter18](../../spec/enter.md#enter18) (CR line endings)
31. [Enter25](../../spec/enter.md#enter25) (numbered list)
32. [Enter26b](../../spec/enter.md#enter26b) (blank lines)
33. [Enter36](../../spec/enter.md#enter36) (blank lines)
34. [Fence1](../../spec/fences.md#fence1) (code block)
35. [Fence2](../../spec/fences.md#fence2) (code block)
36. [Fence5](../../spec/fences.md#fence5) (code block)
37. [Fence16](../../spec/fences.md#fence16) (code block)
38. [Fence18](../../spec/fences.md#fence18) (code block)
39. [Fence19](../../spec/fences.md#fence19) (code block)
40. [Fence48](../../spec/fences.md#fence48) (code block)
41. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1) (blank lines, paragraph)
42. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4) (blank lines, paragraph)
43. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2) (blank lines, paragraph)
44. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11) (blank lines, paragraph)
45. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7) (blank lines, code block, paragraph)
46. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8) (blank lines, paragraph)
47. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9) (blank lines)
48. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10) (blank lines, paragraph)
49. [MoveUp14](../../spec/move-subtree-up.md#moveup14) (blank lines, paragraph)
50. [Indent3](../../spec/indent.md#indent3) (bullet *)
51. [Indent5](../../spec/indent.md#indent5) (bullet *)
52. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style) (bullet *)
53. [Indent4](../../spec/indent.md#indent4) (numbered list)
54. [Indent13](../../spec/indent.md#indent13) (code block)
55. [Indent15](../../spec/indent.md#indent15) (numbered list)
56. [Indent17](../../spec/indent.md#indent17) (CR line endings)
57. [Indent20](../../spec/indent.md#indent20) (code block)
58. [Indent21](../../spec/indent.md#indent21) (blank lines, paragraph)
59. [Indent29](../../spec/indent.md#indent29) (blank lines, paragraph)
60. [MoveDown1](../../spec/move-subtree-down.md#movedown1) (blank lines)
61. [MoveDown5](../../spec/move-subtree-down.md#movedown5) (blank lines, paragraph)
62. [MoveDown8](../../spec/move-subtree-down.md#movedown8) (blank lines, paragraph)
63. [MoveDown20](../../spec/move-subtree-down.md#movedown20) (blank lines, heading)
64. [MoveDown21](../../spec/move-subtree-down.md#movedown21) (code block)
65. [MoveDown22](../../spec/move-subtree-down.md#movedown22) (numbered list)
66. [MoveDown23](../../spec/move-subtree-down.md#movedown23) (numbered list)
67. [MoveDown24](../../spec/move-subtree-down.md#movedown24) (blank lines, paragraph)
68. [MoveDown29](../../spec/move-subtree-down.md#movedown29) (blank lines, numbered list, paragraph)
69. [MoveDown31](../../spec/move-subtree-down.md#movedown31) (blank lines, paragraph, thematic break)
70. [MoveDown35](../../spec/move-subtree-down.md#movedown35) (numbered list)
71. [MoveUp4](../../spec/move-subtree-up.md#moveup4) (blank lines, paragraph)
72. [MoveUp7](../../spec/move-subtree-up.md#moveup7) (blank lines, paragraph)
73. [MoveUp12](../../spec/move-subtree-up.md#moveup12) (blank lines, paragraph)
74. [MoveUp13](../../spec/move-subtree-up.md#moveup13) (code block)
75. [MoveUp17](../../spec/move-subtree-up.md#moveup17) (blank lines, paragraph)
76. [MoveUp18](../../spec/move-subtree-up.md#moveup18) (blank lines, code block, paragraph)
77. [MoveUp19](../../spec/move-subtree-up.md#moveup19) (blank lines, paragraph, thematic break)
78. [MoveUp20](../../spec/move-subtree-up.md#moveup20) (blank lines, link reference definition, paragraph)
79. [MoveUp21](../../spec/move-subtree-up.md#moveup21) (blank lines, paragraph)
80. [MoveUp24](../../spec/move-subtree-up.md#moveup24) (blank lines, heading)
81. [MoveUp25](../../spec/move-subtree-up.md#moveup25) (blank lines)
82. [MoveUp29](../../spec/move-subtree-up.md#moveup29) (heading)
83. [MoveUp30](../../spec/move-subtree-up.md#moveup30) (blank lines, link reference definition, paragraph)
84. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) (numbered list)
85. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item) (task)
86. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break) (blank lines, thematic break)
87. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) (blank lines, code block)
88. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph) (blank lines, paragraph)
89. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence) (code block, paragraph)
90. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence) (code block, paragraph)
91. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line) (blank lines, numbered list)
92. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays) (blank lines, paragraph)
93. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays) (numbered list)
94. [Outdent6](../../spec/outdent.md#outdent6) (blank lines)
95. [Outdent7](../../spec/outdent.md#outdent7) (blank lines)
96. [Outdent9](../../spec/outdent.md#outdent9) (numbered list)
97. [Outdent15](../../spec/outdent.md#outdent15) (blank lines, paragraph)
98. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4) (blank lines, paragraph)
99. [Paste9](../../spec/paste.md#paste9) (code block)
100. [Paste11](../../spec/paste.md#paste11) (code block)
101. [Paste15](../../spec/paste.md#paste15) (numbered list)
102. [Paste16](../../spec/paste.md#paste16) (numbered list)
103. [Paste22](../../spec/paste.md#paste22) (code block)
104. [Paste60](../../spec/paste.md#paste60) (blank lines)
105. [Paste74](../../spec/paste.md#paste74) (code block)
106. [Placeholder1](../../spec/placeholders.md#placeholder1) (blank lines)
107. [Placeholder5](../../spec/placeholders.md#placeholder5) (blank lines)
108. [Placeholder7](../../spec/placeholders.md#placeholder7) (blank lines)
109. [Placeholder14](../../spec/placeholders.md#placeholder14) (blank lines, paragraph)
110. [Placeholder16](../../spec/placeholders.md#placeholder16) (blank lines)
111. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4) (blank lines)
112. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13) (numbered list)
113. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20) (escape)
114. [TaskEnter1](../../spec/tasks.md#taskenter1) (blank lines, paragraph, task)
115. [TaskBackspace2](../../spec/tasks.md#taskbackspace2) (task)
116. [TaskBackspace3](../../spec/tasks.md#taskbackspace3) (task)
117. [TaskDelete1](../../spec/tasks.md#taskdelete1) (task)
118. [TaskDelete3](../../spec/tasks.md#taskdelete3) (task)

## Skipped

### a quote (94)

1. [backspace.md › Backspace27](../../spec/backspace.md#backspace27)
2. [backspace.md › Cmd-Backspace › SoftBackspace7](../../spec/backspace.md#softbackspace7)
3. [cursor.md › CursorHome11](../../spec/cursor.md#cursorhome11)
4. [cursor.md › CursorHome16](../../spec/cursor.md#cursorhome16)
5. [del.md › Delete10](../../spec/del.md#delete10)
6. [enter.md › Enter36b](../../spec/enter.md#enter36b)
7. [enter.md › Enter46](../../spec/enter.md#enter46)
8. [fences.md › Fence4](../../spec/fences.md#fence4)
9. [fences.md › Fence20](../../spec/fences.md#fence20)
10. [fences.md › Fence40](../../spec/fences.md#fence40)
11. [fences.md › Math, comments and indented code › Fence43](../../spec/fences.md#fence43)
12. [fences.md › Math, comments and indented code › Fence46](../../spec/fences.md#fence46)
13. [move-subtree-up.md › MoveUp35](../../spec/move-subtree-up.md#moveup35)
14. [obsidian-true-outliner.md › Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)
15. [obsidian-true-outliner.md › Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
16. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
17. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
18. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)
19. [obsidian-true-outliner.md › Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)
20. [obsidian-true-outliner.md › Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)
21. [paste.md › Paste12](../../spec/paste.md#paste12)
22. [paste.md › Paste23](../../spec/paste.md#paste23)
23. [paste.md › Paste29](../../spec/paste.md#paste29)
24. [paste.md › Paste41](../../spec/paste.md#paste41)
25. [paste.md › Paste72](../../spec/paste.md#paste72)
26. [paste.md › Paste77](../../spec/paste.md#paste77)
27. [quotes.md › Quote1](../../spec/quotes.md#quote1)
28. [quotes.md › Indent inside a quote › Quote2](../../spec/quotes.md#quote2)
29. [quotes.md › Indent inside a quote › Quote3](../../spec/quotes.md#quote3)
30. [quotes.md › Indent inside a quote › Quote4](../../spec/quotes.md#quote4)
31. [quotes.md › Indent inside a quote › Quote5](../../spec/quotes.md#quote5)
32. [quotes.md › Indent inside a quote › Quote6](../../spec/quotes.md#quote6)
33. [quotes.md › Indent inside a quote › Quote8](../../spec/quotes.md#quote8)
34. [quotes.md › Indent inside a quote › Quote9](../../spec/quotes.md#quote9)
35. [quotes.md › Quote10](../../spec/quotes.md#quote10)
36. [quotes.md › Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)
37. [quotes.md › Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)
38. [quotes.md › Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)
39. [quotes.md › Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)
40. [quotes.md › Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)
41. [quotes.md › Indent into a quote › Quote17](../../spec/quotes.md#quote17)
42. [quotes.md › Indent into a quote › Quote18](../../spec/quotes.md#quote18)
43. [quotes.md › Indent into a quote › Quote19](../../spec/quotes.md#quote19)
44. [quotes.md › Moving between quotes › Quote21](../../spec/quotes.md#quote21)
45. [quotes.md › Moving between quotes › Quote22](../../spec/quotes.md#quote22)
46. [quotes.md › Moving between quotes › Quote23](../../spec/quotes.md#quote23)
47. [quotes.md › Moving inside a quote › Quote24](../../spec/quotes.md#quote24)
48. [quotes.md › Moving inside a quote › Quote25](../../spec/quotes.md#quote25)
49. [quotes.md › Moving inside a quote › Quote26](../../spec/quotes.md#quote26)
50. [quotes.md › A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)
51. [quotes.md › A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)
52. [quotes.md › Enter in a quote › Quote29](../../spec/quotes.md#quote29)
53. [quotes.md › Enter in a quote › Quote30](../../spec/quotes.md#quote30)
54. [quotes.md › Enter in a quote › Quote31](../../spec/quotes.md#quote31)
55. [quotes.md › Enter in a quote › Quote32](../../spec/quotes.md#quote32)
56. [quotes.md › Enter in a quote › Quote33](../../spec/quotes.md#quote33)
57. [quotes.md › Enter in a quote › Quote34](../../spec/quotes.md#quote34)
58. [quotes.md › Enter in a quote › Quote35](../../spec/quotes.md#quote35)
59. [quotes.md › Enter in a quote › Quote36](../../spec/quotes.md#quote36)
60. [quotes.md › Enter in a quote › Quote37](../../spec/quotes.md#quote37)
61. [quotes.md › Enter in a quote › Quote42](../../spec/quotes.md#quote42)
62. [quotes.md › Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)
63. [quotes.md › Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)
64. [quotes.md › Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)
65. [quotes.md › Joining in a quote › Quote48](../../spec/quotes.md#quote48)
66. [quotes.md › Joining in a quote › Quote49](../../spec/quotes.md#quote49)
67. [quotes.md › Joining in a quote › Quote50](../../spec/quotes.md#quote50)
68. [quotes.md › Joining in a quote › Quote51](../../spec/quotes.md#quote51)
69. [quotes.md › Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)
70. [quotes.md › Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)
71. [quotes.md › Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)
72. [quotes.md › Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)
73. [quotes.md › Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)
74. [quotes.md › Quote63](../../spec/quotes.md#quote63)
75. [quotes.md › Quote64](../../spec/quotes.md#quote64)
76. [quotes.md › Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)
77. [quotes.md › Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)
78. [quotes.md › Quote67](../../spec/quotes.md#quote67)
79. [quotes.md › Quote68](../../spec/quotes.md#quote68)
80. [quotes.md › Quote72](../../spec/quotes.md#quote72)
81. [quotes.md › Quote73](../../spec/quotes.md#quote73)
82. [quotes.md › Quote74](../../spec/quotes.md#quote74)
83. [quotes.md › Quote75](../../spec/quotes.md#quote75)
84. [quotes.md › Quote76](../../spec/quotes.md#quote76)
85. [quotes.md › Quote77](../../spec/quotes.md#quote77)
86. [quotes.md › Quote78](../../spec/quotes.md#quote78)
87. [quotes.md › Quote80](../../spec/quotes.md#quote80)
88. [quotes.md › Quote81](../../spec/quotes.md#quote81)
89. [quotes.md › Quote88](../../spec/quotes.md#quote88)
90. [quotes.md › Quote83](../../spec/quotes.md#quote83)
91. [quotes.md › Quote85](../../spec/quotes.md#quote85)
92. [quotes.md › Quote87](../../spec/quotes.md#quote87)
93. [quotes.md › A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)
94. [quotes.md › A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

### a caret on a code block's fence (30)

1. [backspace.md › Cmd-Backspace › SoftBackspace9](../../spec/backspace.md#softbackspace9)
2. [fences.md › Fence6](../../spec/fences.md#fence6)
3. [fences.md › Fence7](../../spec/fences.md#fence7)
4. [fences.md › Fence7b](../../spec/fences.md#fence7b)
5. [fences.md › Fence7c](../../spec/fences.md#fence7c)
6. [fences.md › Fence7d](../../spec/fences.md#fence7d)
7. [fences.md › Fence9](../../spec/fences.md#fence9)
8. [fences.md › Fence12](../../spec/fences.md#fence12)
9. [fences.md › Fence13](../../spec/fences.md#fence13)
10. [fences.md › Fence14](../../spec/fences.md#fence14)
11. [fences.md › Fence15](../../spec/fences.md#fence15)
12. [fences.md › Fence22](../../spec/fences.md#fence22)
13. [fences.md › Fence23](../../spec/fences.md#fence23)
14. [fences.md › Fence24](../../spec/fences.md#fence24)
15. [fences.md › Fence25](../../spec/fences.md#fence25)
16. [fences.md › Fence26](../../spec/fences.md#fence26)
17. [fences.md › Fence27](../../spec/fences.md#fence27)
18. [fences.md › Fence28](../../spec/fences.md#fence28)
19. [fences.md › Fence29](../../spec/fences.md#fence29)
20. [fences.md › Fence31](../../spec/fences.md#fence31)
21. [fences.md › Fence32](../../spec/fences.md#fence32)
22. [fences.md › Fence33](../../spec/fences.md#fence33)
23. [fences.md › Fence35](../../spec/fences.md#fence35)
24. [fences.md › Fence41](../../spec/fences.md#fence41)
25. [move-subtree-down.md › MoveDown34](../../spec/move-subtree-down.md#movedown34)
26. [move-subtree-down.md › MoveDown37](../../spec/move-subtree-down.md#movedown37)
27. [outdent.md › Outdent19](../../spec/outdent.md#outdent19)
28. [paste.md › Paste46](../../spec/paste.md#paste46)
29. [paste.md › Paste47](../../spec/paste.md#paste47)
30. [paste.md › Paste71](../../spec/paste.md#paste71)

### a caret in a marker (22)

1. [backspace.md › Backspace2](../../spec/backspace.md#backspace2)
2. [cursor.md › CursorHome3](../../spec/cursor.md#cursorhome3)
3. [cursor.md › CursorHome4](../../spec/cursor.md#cursorhome4)
4. [cursor.md › CursorHome15](../../spec/cursor.md#cursorhome15)
5. [del.md › Delete16](../../spec/del.md#delete16)
6. [del.md › Delete16d](../../spec/del.md#delete16d)
7. [del.md › Delete16e](../../spec/del.md#delete16e)
8. [del.md › Delete16f](../../spec/del.md#delete16f)
9. [del.md › Delete16g](../../spec/del.md#delete16g)
10. [del.md › Delete23](../../spec/del.md#delete23)
11. [del.md › Delete24](../../spec/del.md#delete24)
12. [del.md › Delete25](../../spec/del.md#delete25)
13. [enter.md › Enter34](../../spec/enter.md#enter34)
14. [indent.md › Indent28](../../spec/indent.md#indent28)
15. [indent.md › Indent30](../../spec/indent.md#indent30)
16. [move-subtree-down.md › MoveDown32](../../spec/move-subtree-down.md#movedown32)
17. [move-subtree-up.md › MoveUp34](../../spec/move-subtree-up.md#moveup34)
18. [move-subtree-up.md › MoveUp36](../../spec/move-subtree-up.md#moveup36)
19. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
20. [outdent.md › Outdent14](../../spec/outdent.md#outdent14)
21. [outdent.md › Outdent16](../../spec/outdent.md#outdent16)
22. [shift-enter.md › ShiftEnter22](../../spec/shift-enter.md#shiftenter22)

### a callout (19)

1. [cursor.md › CursorHome17](../../spec/cursor.md#cursorhome17)
2. [paste.md › Paste28](../../spec/paste.md#paste28)
3. [paste.md › Paste55](../../spec/paste.md#paste55)
4. [quotes.md › Indent inside a quote › Quote7](../../spec/quotes.md#quote7)
5. [quotes.md › Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)
6. [quotes.md › Enter in a quote › Quote38](../../spec/quotes.md#quote38)
7. [quotes.md › Enter in a quote › Quote39](../../spec/quotes.md#quote39)
8. [quotes.md › Enter in a quote › Quote40](../../spec/quotes.md#quote40)
9. [quotes.md › Enter in a quote › Quote41](../../spec/quotes.md#quote41)
10. [quotes.md › Enter in a quote › Quote43](../../spec/quotes.md#quote43)
11. [quotes.md › Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)
12. [quotes.md › Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)
13. [quotes.md › Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)
14. [quotes.md › Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)
15. [quotes.md › Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)
16. [quotes.md › Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)
17. [quotes.md › Quote71](../../spec/quotes.md#quote71)
18. [quotes.md › Quote79](../../spec/quotes.md#quote79)
19. [quotes.md › Quote84](../../spec/quotes.md#quote84)

### a caret on a blank line (14)

1. [backspace.md › Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)
2. [enter.md › Enter37](../../spec/enter.md#enter37)
3. [gaps.md › Keys on a blank line › Gap14](../../spec/gaps.md#gap14)
4. [gaps.md › Keys on a blank line › Gap15](../../spec/gaps.md#gap15)
5. [gaps.md › Keys on a blank line › Gap16](../../spec/gaps.md#gap16)
6. [gaps.md › Keys on a blank line › Gap17](../../spec/gaps.md#gap17)
7. [gaps.md › Keys on a blank line › Gap18](../../spec/gaps.md#gap18)
8. [obsidian-true-outliner.md › Enter › E18](../../spec/obsidian-true-outliner.md#e18)
9. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)
10. [paste.md › Paste65](../../spec/paste.md#paste65)
11. [paste.md › Paste67](../../spec/paste.md#paste67)
12. [placeholders.md › Placeholder10](../../spec/placeholders.md#placeholder10)
13. [placeholders.md › Placeholder12](../../spec/placeholders.md#placeholder12)
14. [typing.md › Typing1](../../spec/typing.md#typing1)

### a selection across blocks (14)

1. [backspace.md › Backspace31](../../spec/backspace.md#backspace31)
2. [del.md › Delete21](../../spec/del.md#delete21)
3. [indent.md › Indent9](../../spec/indent.md#indent9)
4. [indent.md › Indent27](../../spec/indent.md#indent27)
5. [move-subtree-down.md › MoveDown11](../../spec/move-subtree-down.md#movedown11)
6. [move-subtree-down.md › MoveDown12](../../spec/move-subtree-down.md#movedown12)
7. [move-subtree-down.md › MoveDown14](../../spec/move-subtree-down.md#movedown14)
8. [move-subtree-up.md › MoveUp10](../../spec/move-subtree-up.md#moveup10)
9. [move-subtree-up.md › MoveUp11](../../spec/move-subtree-up.md#moveup11)
10. [move-subtree-up.md › MoveUp31](../../spec/move-subtree-up.md#moveup31)
11. [outdent.md › Outdent8](../../spec/outdent.md#outdent8)
12. [outdent.md › Outdent10](../../spec/outdent.md#outdent10)
13. [outdent.md › Outdent12](../../spec/outdent.md#outdent12)
14. [paste.md › Paste50](../../spec/paste.md#paste50)

### action deleteSubtree (13)

1. [delete-subtree.md › DeleteSubtree1](../../spec/delete-subtree.md#deletesubtree1)
2. [delete-subtree.md › DeleteSubtree2](../../spec/delete-subtree.md#deletesubtree2)
3. [delete-subtree.md › DeleteSubtree3](../../spec/delete-subtree.md#deletesubtree3)
4. [delete-subtree.md › DeleteSubtree4](../../spec/delete-subtree.md#deletesubtree4)
5. [delete-subtree.md › DeleteSubtree5](../../spec/delete-subtree.md#deletesubtree5)
6. [delete-subtree.md › DeleteSubtree6](../../spec/delete-subtree.md#deletesubtree6)
7. [delete-subtree.md › DeleteSubtree7](../../spec/delete-subtree.md#deletesubtree7)
8. [delete-subtree.md › DeleteSubtree8](../../spec/delete-subtree.md#deletesubtree8)
9. [delete-subtree.md › DeleteSubtree9](../../spec/delete-subtree.md#deletesubtree9)
10. [delete-subtree.md › DeleteSubtree10](../../spec/delete-subtree.md#deletesubtree10)
11. [quotes.md › Quote82](../../spec/quotes.md#quote82)
12. [scenarios.md › Outliner flows › Scenario10](../../spec/scenarios.md#scenario10)
13. [z-open.md › Open2](../../spec/z-open.md#open2)

### action duplicateSubtree (9)

1. [duplicate-subtree.md › DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1)
2. [duplicate-subtree.md › DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2)
3. [duplicate-subtree.md › DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3)
4. [duplicate-subtree.md › DuplicateSubtree4](../../spec/duplicate-subtree.md#duplicatesubtree4)
5. [duplicate-subtree.md › DuplicateSubtree5](../../spec/duplicate-subtree.md#duplicatesubtree5)
6. [duplicate-subtree.md › DuplicateSubtree6](../../spec/duplicate-subtree.md#duplicatesubtree6)
7. [duplicate-subtree.md › DuplicateSubtree7](../../spec/duplicate-subtree.md#duplicatesubtree7)
8. [duplicate-subtree.md › DuplicateSubtree8](../../spec/duplicate-subtree.md#duplicatesubtree8)
9. [quotes.md › Quote86](../../spec/quotes.md#quote86)

### option outdent: logical (9)

1. [obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
2. [outdent.md › Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
3. [outdent.md › Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)
4. [outdent.md › Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)
5. [outdent.md › Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)
6. [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)
7. [outdent.md › Outdent17b](../../spec/outdent.md#outdent17b)
8. [quotes.md › Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)
9. [quotes.md › Moving between quotes › Quote20](../../spec/quotes.md#quote20)

### cursorCharLeft after cursorDocEnd (5)

1. [cursor.md › CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
2. [placeholders.md › Placeholder9](../../spec/placeholders.md#placeholder9)
3. [placeholders.md › Placeholder11](../../spec/placeholders.md#placeholder11)
4. [placeholders.md › Placeholder15](../../spec/placeholders.md#placeholder15)
5. [undo.md › Undo2](../../spec/undo.md#undo2)

### option editInMarkup: refuse (5)

1. [del.md › Delete16b](../../spec/del.md#delete16b)
2. [del.md › Delete16c](../../spec/del.md#delete16c)
3. [quotes.md › Enter in a quote › Quote43b](../../spec/quotes.md#quote43b)
4. [shift-enter.md › ShiftEnter22b](../../spec/shift-enter.md#shiftenter22b)
5. [typing.md › Typing4](../../spec/typing.md#typing4)

### option enterOnEmptyItem: outdent (5)

1. [enter.md › Enter7b](../../spec/enter.md#enter7b)
2. [enter.md › Enter15b](../../spec/enter.md#enter15b)
3. [enter.md › Enter30](../../spec/enter.md#enter30)
4. [obsidian-true-outliner.md › Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)
5. [obsidian-true-outliner.md › Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

### option headingEditing: block (5)

1. [backspace.md › Backspace18b](../../spec/backspace.md#backspace18b)
2. [backspace.md › Backspace18f](../../spec/backspace.md#backspace18f)
3. [del.md › Delete13b](../../spec/del.md#delete13b)
4. [del.md › Delete13d](../../spec/del.md#delete13d)
5. [del.md › Delete13f](../../spec/del.md#delete13f)

### a caret in a task's checkbox (4)

1. [del.md › Delete19](../../spec/del.md#delete19)
2. [obsidian-true-outliner.md › Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)
3. [tasks.md › TaskBackspace1](../../spec/tasks.md#taskbackspace1)
4. [tasks.md › TaskBackspace6](../../spec/tasks.md#taskbackspace6)

### option enterMidItem: child (4)

1. [enter.md › Enter3b](../../spec/enter.md#enter3b)
2. [obsidian-true-outliner.md › Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)
3. [obsidian-true-outliner.md › Enter › E11](../../spec/obsidian-true-outliner.md#e11)
4. [paste.md › Paste43](../../spec/paste.md#paste43)

### option pasteStructuredLines: items (4)

1. [paste.md › Paste8](../../spec/paste.md#paste8)
2. [paste.md › Paste8b](../../spec/paste.md#paste8b)
3. [paste.md › Paste39](../../spec/paste.md#paste39)
4. [scenarios.md › Outliner flows › Scenario17](../../spec/scenarios.md#scenario17)

### changes only what blocks can't show (3)

1. [enter.md › Enter6](../../spec/enter.md#enter6)
2. [enter.md › Enter33b](../../spec/enter.md#enter33b)
3. [indent.md › Indent22](../../spec/indent.md#indent22)

### option backspaceAtTopItem: refuse (2)

1. [backspace.md › Backspace34](../../spec/backspace.md#backspace34)
2. [quotes.md › Backspace at a quote's start › Quote55](../../spec/quotes.md#quote55)

### option deleteAtGap: gap (2)

1. [backspace.md › Backspace21b](../../spec/backspace.md#backspace21b)
2. [del.md › Delete17b](../../spec/del.md#delete17b)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: block (2)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
2. [tasks.md › TaskBackspace7](../../spec/tasks.md#taskbackspace7)

### frontmatter (1)

1. [gaps.md › Keys on a blank line › Gap19](../../spec/gaps.md#gap19)

### no nodes (1)

1. [backspace.md › Backspace17e](../../spec/backspace.md#backspace17e)

### nothing to compare (1)

1. [fences.md › Fence21](../../spec/fences.md#fence21)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option pasteStructuredMidText: after (1)

1. [paste.md › Paste38](../../spec/paste.md#paste38)

### option taskEditing: text (1)

1. [tasks.md › TaskBackspace5](../../spec/tasks.md#taskbackspace5)
