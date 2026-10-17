---
type: "SxS"
app: "blocknote"
version: "unknown"
url: "https://www.blocknotejs.org/examples/basic/minimal"
model: "block"
command: "node sxs/run.ts blocknote"
elapsed_s: 55
---

# BlockNote vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 79 | [2](#caret-2) | [14](#whitespace-14) | [62](#disagree-62) | [1](#error-1) |  | **158** |
| adapted | 95 | [5](#adapted-caret-5) | [28](#adapted-whitespace-28) | [69](#adapted-disagree-69) | [1](#adapted-error-1) |  | **198** |
| **total** | **174 (22%)** | **7 (0.89%)** | **42 (5.3%)** | **131 (17%)** | **2 (0.25%)** | **[431](#skipped-431) (55%)** | **787** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 10 |  |  | 22 |  | 33 | **65** | 15 | 17 |
| [cursor.md](../../spec/cursor.md) | 25 | 3 |  |  |  | 8 | **36** | 13 | 15 |
| [del.md](../../spec/del.md) | 14 |  |  | 5 |  | 29 | **48** | 13 | 6 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 8 | **8** |  |  |
| [enter.md](../../spec/enter.md) | 7 |  | 14 | 15 |  | 23 | **59** | 19 | 17 |
| [fences.md](../../spec/fences.md) | 6 |  | 1 | 2 |  | 42 | **51** |  | 9 |
| [gaps.md](../../spec/gaps.md) | 8 |  |  | 4 |  | 7 | **19** |  | 12 |
| [indent.md](../../spec/indent.md) | 17 | 2 |  |  |  | 11 | **30** | 12 | 7 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 11 |  |  | 11 |  | 15 | **37** | 11 | 11 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 13 |  |  | 7 |  | 18 | **38** | 9 | 11 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 20 |  | 8 | 13 | 1 | 25 | **67** | 23 | 19 |
| [outdent.md](../../spec/outdent.md) | 9 | 1 |  |  |  | 19 | **29** | 6 | 4 |
| [paste.md](../../spec/paste.md) | 13 | 1 | 5 | 34 | 1 | 53 | **107** | 16 | 38 |
| [placeholders.md](../../spec/placeholders.md) | 6 |  | 1 | 1 |  | 8 | **16** | 2 | 6 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 7 |  |  | 10 |  | 7 | **24** | 10 | 7 |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 11 | 1 |  | 11 | **26** | 6 | 9 |
| [tasks.md](../../spec/tasks.md) | 4 |  | 2 | 4 |  | 7 | **17** |  | 10 |
| [typing.md](../../spec/typing.md) |  |  |  |  |  | 4 | **4** |  |  |
| [undo.md](../../spec/undo.md) | 1 |  |  | 2 |  | 2 | **5** | 3 |  |
| [z-open.md](../../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **174 (22%)** | **7 (0.89%)** | **42 (5.3%)** | **131 (17%)** | **2 (0.25%)** | **431 (55%)** | **787** | **158 (20%)** | **198 (25%)** |

## Disagree (62)

### [Backspace1](../../spec/backspace.md#backspace1)

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

### [Backspace3](../../spec/backspace.md#backspace3)

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

### [Backspace5](../../spec/backspace.md#backspace5)

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

### [Backspace7](../../spec/backspace.md#backspace7)

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

### [Backspace8](../../spec/backspace.md#backspace8)

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

### [Backspace17](../../spec/backspace.md#backspace17)

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

### [Backspace17b](../../spec/backspace.md#backspace17b)

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

### [Backspace17c](../../spec/backspace.md#backspace17c)

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

### [Backspace17d](../../spec/backspace.md#backspace17d)

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

### [Backspace29](../../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
- 2. ┃
- 3. c
```

</td><td>

```buffer
- 1. a
- ┃
- 1. c
```

</td><td>

```buffer
- 1. a┃
- 2. c
```

</td></tr>
</table>

### [Backspace30](../../spec/backspace.md#backspace30)

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

### [Backspace41](../../spec/backspace.md#backspace41)

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

### [Delete5d](../../spec/del.md#delete5d)

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

### [Delete7](../../spec/del.md#delete7)

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

### [Delete12](../../spec/del.md#delete12)

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

### [Enter3d](../../spec/enter.md#enter3d)

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

### [Enter4](../../spec/enter.md#enter4)

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

### [Enter5](../../spec/enter.md#enter5)

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

### [Enter7](../../spec/enter.md#enter7)

> enter

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

### [Enter21](../../spec/enter.md#enter21)

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

### [Enter27](../../spec/enter.md#enter27)

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

### [Enter28](../../spec/enter.md#enter28)

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

### [Enter38](../../spec/enter.md#enter38)

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

### [Enter39](../../spec/enter.md#enter39)

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

### [Enter44](../../spec/enter.md#enter44)

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

### [MoveDown7](../../spec/move-subtree-down.md#movedown7)

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

### [MoveDown9](../../spec/move-subtree-down.md#movedown9)

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

### [MoveDown10](../../spec/move-subtree-down.md#movedown10)

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

### [MoveDown23](../../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 9. a┃
  - x
- 10. b
```

</td><td>

```buffer
- 1. b
- 2. a┃
  - x
```

</td><td>

```buffer
- 9. b
- 10. a┃
  - x
```

</td></tr>
</table>

### [MoveDown30](../../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 9. a┃
- 10. b
  - x
```

</td><td>

```buffer
- 1. b
  - 9. a┃
  - x
```

</td><td>

```buffer
- 9. b
  - x
- 10. a┃
```

</td></tr>
</table>

### [MoveDown33](../../spec/move-subtree-down.md#movedown33)

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

### [MoveUp5](../../spec/move-subtree-up.md#moveup5)

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

### [MoveUp6](../../spec/move-subtree-up.md#moveup6)

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

### [MoveUp8](../../spec/move-subtree-up.md#moveup8)

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

### [MoveUp9](../../spec/move-subtree-up.md#moveup9)

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

### [MoveUp15](../../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 9. a
  - x
- 10. b┃
```

</td><td>

```buffer
- 9. a
  - x
  - 1. b┃
```

</td><td>

```buffer
- 9. b┃
- 10. a
  - x
```

</td></tr>
</table>

### [End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)

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

### [S13](../../spec/obsidian-true-outliner.md#s13)

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

### [Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. p
- 2. a┃
- 3. q
```

</td><td>

```buffer
- 1. p
- ┃
- 1. q
```

</td><td>

```buffer
- 1. p┃
- 2. q
```

</td></tr>
</table>

### [Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

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

### [Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
- 2. b
- ┃x
- 3. c
```

</td><td>

```buffer
- 1. a
- 2. b
- ┃x
- 3. c
```

</td><td>

```buffer
- 1. a
- 2. b┃x
- 3. c
```

</td></tr>
</table>

### [Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - 1. ┃a
  - 2. b
```

</td><td>

```buffer
- p
  - ┃a
  - 1. b
```

</td><td>

```buffer
- p┃a
  - 1. b
```

</td></tr>
</table>

### [List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 3. a
- 4. ┃b
- 5. c
```

</td><td>

```buffer
- 3. a
- ┃b
- 1. c
```

</td><td>

```buffer
- 3. a┃b
- 4. c
```

</td></tr>
</table>

### [Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

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

### [Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)

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

### [Paste3](../../spec/paste.md#paste3)

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

### [Paste7](../../spec/paste.md#paste7)

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

### [Paste13e](../../spec/paste.md#paste13e)

> pasteStructured

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
- 1. y┃
- b
```

</td><td>

```buffer
- ax
- 2. y┃
- b
```

</td></tr>
</table>

### [Paste31](../../spec/paste.md#paste31)

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

### [Paste36](../../spec/paste.md#paste36)

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

### [Paste42](../../spec/paste.md#paste42)

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

### [Paste78](../../spec/paste.md#paste78)

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

### [Scenario2](../../spec/scenarios.md#scenario2)

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

### [Scenario3](../../spec/scenarios.md#scenario3)

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

### [Scenario8](../../spec/scenarios.md#scenario8)

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

### [Scenario9](../../spec/scenarios.md#scenario9)

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

### [Scenario12](../../spec/scenarios.md#scenario12)

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

### [Scenario14](../../spec/scenarios.md#scenario14)

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

### [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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

### [Undo4](../../spec/undo.md#undo4)

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

### [Undo5](../../spec/undo.md#undo5)

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

## Whitespace (14)

### [Enter1](../../spec/enter.md#enter1)

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

### [Enter3](../../spec/enter.md#enter3)

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

### [Enter3c](../../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 9. a┃ b
  - c
- 10. d
```

</td><td>

```buffer
- 9. a
- 10. ┃ b
  - c
- 11. d
```

</td><td>

```buffer
- 9. a
- 10. ┃b
  - c
- 11. d
```

</td></tr>
</table>

### [Enter16](../../spec/enter.md#enter16)

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

### [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. abc ┃2. def
```

</td><td>

```buffer
- 1. abc 
- 2. ┃2\. def
```

</td><td>

```buffer
- 1. abc
- 2. ┃2\. def
```

</td></tr>
</table>

### [E4](../../spec/obsidian-true-outliner.md#e4)

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

### [Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

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

### [Paste5](../../spec/paste.md#paste5)

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

### [Paste10](../../spec/paste.md#paste10)

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

### [Paste73](../../spec/paste.md#paste73)

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

### [Placeholder8](../../spec/placeholders.md#placeholder8)

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

### [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

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

### [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
  - b┃ c
```

</td><td>

```buffer
- 1. a
  - b
    ┃ c
```

</td><td>

```buffer
- 1. a
  - b
    ┃c
```

</td></tr>
</table>

### [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

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

## Caret (2)

### [Indent10](../../spec/indent.md#indent10)

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

### [Outdent2](../../spec/outdent.md#outdent2)

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

## Error (1)

### [Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 1. a┃
- 1. b
- 2. c
```

</td></tr>
</table>

> enter

Error: BlockNote holds the starting state differently:
  meant:
    - 1. a┃
    - 1. b
    - 2. c
  holds:
    - 1. a┃
    - 2. b
    - 3. c

## Adapted: disagree (69)

### [Backspace10](../../spec/backspace.md#backspace10)

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

### [Backspace11](../../spec/backspace.md#backspace11)

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

### [Backspace15](../../spec/backspace.md#backspace15)

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

### [Backspace22](../../spec/backspace.md#backspace22)

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

### [Backspace25](../../spec/backspace.md#backspace25)

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

### [Backspace36](../../spec/backspace.md#backspace36)

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

### [Backspace37](../../spec/backspace.md#backspace37)

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

### [Backspace39](../../spec/backspace.md#backspace39)

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

### [Backspace40](../../spec/backspace.md#backspace40)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃t
  - 2. m
```

</td><td>

```buffer
- p
  - ┃t
  - 2. m
```

</td><td>

```buffer
- p┃t
  - 2. m
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

### [Delete13](../../spec/del.md#delete13)

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

### [Delete13g](../../spec/del.md#delete13g)

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

### [Enter32b](../../spec/enter.md#enter32b)

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

### [Enter43](../../spec/enter.md#enter43)

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

### [Enter48](../../spec/enter.md#enter48)

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

### [Enter49](../../spec/enter.md#enter49)

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

### [Fence8](../../spec/fences.md#fence8)

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

### [Fence42](../../spec/fences.md#fence42)

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

### [Gap3](../../spec/gaps.md#gap3)

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

### [Gap5](../../spec/gaps.md#gap5)

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

### [Gap6](../../spec/gaps.md#gap6)

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

### [Gap12](../../spec/gaps.md#gap12)

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

### [MoveDown4](../../spec/move-subtree-down.md#movedown4)

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

### [MoveDown16](../../spec/move-subtree-down.md#movedown16)

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

### [MoveDown18](../../spec/move-subtree-down.md#movedown18)

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

### [MoveDown26](../../spec/move-subtree-down.md#movedown26)

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

### [MoveDown27](../../spec/move-subtree-down.md#movedown27)

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

### [MoveUp3](../../spec/move-subtree-up.md#moveup3)

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

### [MoveUp16](../../spec/move-subtree-up.md#moveup16)

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

### [E10](../../spec/obsidian-true-outliner.md#e10)

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

### [Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

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

### [Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

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

### [End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

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

### [Paste1](../../spec/paste.md#paste1)

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

### [Paste4](../../spec/paste.md#paste4)

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

### [Paste19](../../spec/paste.md#paste19)

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

### [Paste20b](../../spec/paste.md#paste20b)

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
- Notesp
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
Notesp

- q┃
- x
- z
```

</td></tr>
</table>

### [Paste25](../../spec/paste.md#paste25)

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

### [Paste30](../../spec/paste.md#paste30)

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
- 2. y┃
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

### [Paste32](../../spec/paste.md#paste32)

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

### [Paste33](../../spec/paste.md#paste33)

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

### [Paste34](../../spec/paste.md#paste34)

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

### [Paste35](../../spec/paste.md#paste35)

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

### [Paste37](../../spec/paste.md#paste37)

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

### [Paste45](../../spec/paste.md#paste45)

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

### [Paste51](../../spec/paste.md#paste51)

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

### [Paste52](../../spec/paste.md#paste52)

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

### [Paste53](../../spec/paste.md#paste53)

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

### [Paste57](../../spec/paste.md#paste57)

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

### [Paste59](../../spec/paste.md#paste59)

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

### [Paste61](../../spec/paste.md#paste61)

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

### [Paste62](../../spec/paste.md#paste62)

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

### [Paste64](../../spec/paste.md#paste64)

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

### [Paste66](../../spec/paste.md#paste66)

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

### [Paste68](../../spec/paste.md#paste68)

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

### [Paste69](../../spec/paste.md#paste69)

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

### [Paste70](../../spec/paste.md#paste70)

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

### [Paste76](../../spec/paste.md#paste76)

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

### [Paste79](../../spec/paste.md#paste79)

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

### [Placeholder13](../../spec/placeholders.md#placeholder13)

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

### [Scenario18](../../spec/scenarios.md#scenario18)

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

### [Scenario20](../../spec/scenarios.md#scenario20)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Pack light.
- Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

### [Scenario22](../../spec/scenarios.md#scenario22)

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

### [Scenario23](../../spec/scenarios.md#scenario23)

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

### [TaskEnter2](../../spec/tasks.md#taskenter2)

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

### [TaskEnter5](../../spec/tasks.md#taskenter5)

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

### [TaskEnter6](../../spec/tasks.md#taskenter6)

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

### [TaskDelete2](../../spec/tasks.md#taskdelete2)

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

## Adapted: whitespace (28)

### [Enter8](../../spec/enter.md#enter8)

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

### [Enter9](../../spec/enter.md#enter9)

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

### [Enter10](../../spec/enter.md#enter10)

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

### [Enter11](../../spec/enter.md#enter11)

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

### [Enter12](../../spec/enter.md#enter12)

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

### [Enter22](../../spec/enter.md#enter22)

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

### [Enter42](../../spec/enter.md#enter42)

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

### [Enter51](../../spec/enter.md#enter51)

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

### [Enter52](../../spec/enter.md#enter52)

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

### [Fence3](../../spec/fences.md#fence3)

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

### [E9](../../spec/obsidian-true-outliner.md#e9)

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

### [E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading

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

### [Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

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

### [S4](../../spec/obsidian-true-outliner.md#s4)

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

### [S9](../../spec/obsidian-true-outliner.md#s9)

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

### [Paste75](../../spec/paste.md#paste75)

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

### [Paste80](../../spec/paste.md#paste80)

> pastePlain

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
. a
b
```

</td><td>

```buffer
- 1┃
```

</td><td>

```buffer
- 1\. a
  b┃
```

</td><td>

```buffer
- 1\. a
  b
  ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1┃
```

</td><td>

```buffer
1\. a
b
┃◌
```

</td></tr>
</table>

### [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

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

### [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

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

### [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

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

### [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

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

### [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

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

### [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>blocknote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. abc ┃2. x
```

</td><td>

```buffer
- 1. abc 
  ┃2\. x
```

</td><td>

```buffer
- 1. abc
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

### [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

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

### [ShiftEnter23](../../spec/shift-enter.md#shiftenter23)

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

### [TaskEnter3](../../spec/tasks.md#taskenter3)

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

### [TaskEnter7](../../spec/tasks.md#taskenter7)

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

## Adapted: caret (5)

### [CursorUp2](../../spec/cursor.md#cursorup2)

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

### [CursorDown1](../../spec/cursor.md#cursordown1)

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

### [CursorDown5](../../spec/cursor.md#cursordown5)

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

### [Indent11](../../spec/indent.md#indent11)

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

### [Paste44](../../spec/paste.md#paste44)

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

## Adapted: error (1)

### [Paste81](../../spec/paste.md#paste81)

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th></tr>
<tr valign="top"><td>

```clipboard
1. a
2. b
```

</td><td>

```buffer
- 2┃\. y
```

</td></tr>
</table>

> pastePlain

Error: BlockNote holds the starting state differently:
  meant:
    - 2┃\. y
  holds:
    - 2┃ y

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
- 21\. a
  2\. b
  ┃\. y
```

</td></tr>
</table>

## Skipped (431)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../../spec/backspace.md#backspace2) | a caret in a marker |
| [Backspace4](../../spec/backspace.md#backspace4) | a heading's closing #s |
| [Backspace12](../../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace14](../../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17e](../../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace17f](../../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18](../../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18f](../../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace19](../../spec/backspace.md#backspace19) | tag free-form |
| [Backspace20](../../spec/backspace.md#backspace20) | tag free-form |
| [Backspace21b](../../spec/backspace.md#backspace21b) | option deleteAtGap: gap |
| [Backspace23](../../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace27](../../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../../spec/backspace.md#backspace31) | a selection across blocks |
| [Backspace33](../../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../../spec/backspace.md#backspace38) | tag free-form |
| [SoftBackspace4](../../spec/backspace.md#softbackspace4) | a heading's closing #s |
| [SoftBackspace6](../../spec/backspace.md#softbackspace6) | a caret on a blank line |
| [SoftBackspace7](../../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../../spec/backspace.md#softbackspace9) | tag markup-fence |
| **cursor.md** | |
| [CursorDown2](../../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../../spec/cursor.md#cursorhome3) | a caret in a marker |
| [CursorHome4](../../spec/cursor.md#cursorhome4) | a caret in a marker |
| [CursorHome11](../../spec/cursor.md#cursorhome11) | a quote |
| [CursorHome15](../../spec/cursor.md#cursorhome15) | a caret in a marker |
| [CursorHome16](../../spec/cursor.md#cursorhome16) | a quote |
| [CursorHome17](../../spec/cursor.md#cursorhome17) | a callout |
| [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **del.md** | |
| [Delete4](../../spec/del.md#delete4) | a heading's closing #s |
| [Delete4b](../../spec/del.md#delete4b) | a heading's closing #s |
| [Delete5e](../../spec/del.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete9](../../spec/del.md#delete9) | tag free-form |
| [Delete10](../../spec/del.md#delete10) | a quote |
| [Delete11](../../spec/del.md#delete11) | tag markup-fence |
| [Delete13b](../../spec/del.md#delete13b) | option headingEditing: block |
| [Delete13c](../../spec/del.md#delete13c) | tag free-form |
| [Delete13d](../../spec/del.md#delete13d) | tag free-form |
| [Delete13e](../../spec/del.md#delete13e) | tag free-form |
| [Delete13f](../../spec/del.md#delete13f) | option headingEditing: block |
| [Delete14](../../spec/del.md#delete14) | tag free-form |
| [Delete15](../../spec/del.md#delete15) | a heading's closing #s |
| [Delete16](../../spec/del.md#delete16) | tag free-form |
| [Delete16b](../../spec/del.md#delete16b) | tag free-form |
| [Delete16c](../../spec/del.md#delete16c) | tag free-form |
| [Delete16d](../../spec/del.md#delete16d) | tag free-form |
| [Delete16e](../../spec/del.md#delete16e) | tag free-form |
| [Delete16f](../../spec/del.md#delete16f) | tag free-form |
| [Delete16g](../../spec/del.md#delete16g) | a caret in a marker |
| [Delete17b](../../spec/del.md#delete17b) | option deleteAtGap: gap |
| [Delete18](../../spec/del.md#delete18) | tag free-form |
| [Delete18b](../../spec/del.md#delete18b) | tag free-form |
| [Delete18c](../../spec/del.md#delete18c) | tag free-form |
| [Delete19](../../spec/del.md#delete19) | a caret in a task's checkbox |
| [Delete21](../../spec/del.md#delete21) | a selection across blocks |
| [Delete23](../../spec/del.md#delete23) | tag free-form |
| [Delete24](../../spec/del.md#delete24) | tag free-form |
| [Delete25](../../spec/del.md#delete25) | tag free-form |
| **delete-subtree.md** | |
| [DeleteSubtree1](../../spec/delete-subtree.md#deletesubtree1) | action deleteSubtree |
| [DeleteSubtree2](../../spec/delete-subtree.md#deletesubtree2) | action deleteSubtree |
| [DeleteSubtree3](../../spec/delete-subtree.md#deletesubtree3) | action deleteSubtree |
| [DeleteSubtree4](../../spec/delete-subtree.md#deletesubtree4) | action deleteSubtree |
| [DeleteSubtree5](../../spec/delete-subtree.md#deletesubtree5) | action deleteSubtree |
| [DeleteSubtree6](../../spec/delete-subtree.md#deletesubtree6) | action deleteSubtree |
| [DeleteSubtree7](../../spec/delete-subtree.md#deletesubtree7) | action deleteSubtree |
| [DeleteSubtree8](../../spec/delete-subtree.md#deletesubtree8) | action deleteSubtree |
| [DeleteSubtree9](../../spec/delete-subtree.md#deletesubtree9) | action deleteSubtree |
| [DeleteSubtree10](../../spec/delete-subtree.md#deletesubtree10) | action deleteSubtree |
| **duplicate-subtree.md** | |
| [DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1) | action duplicateSubtree |
| [DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2) | action duplicateSubtree |
| [DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3) | action duplicateSubtree |
| [DuplicateSubtree4](../../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../../spec/duplicate-subtree.md#duplicatesubtree5) | action duplicateSubtree |
| [DuplicateSubtree6](../../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../../spec/duplicate-subtree.md#duplicatesubtree8) | tag markup-fence |
| **enter.md** | |
| [Enter3b](../../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter6](../../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../../spec/enter.md#enter23) | indented code |
| [Enter26](../../spec/enter.md#enter26) | option enterAtTextStart: the app's stay |
| [Enter29](../../spec/enter.md#enter29) | option enterAtTextStart: the app's stay |
| [Enter30](../../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter31](../../spec/enter.md#enter31) | option enterAtTextStart: the app's stay |
| [Enter32](../../spec/enter.md#enter32) | option enterAtTextStart: the app's stay |
| [Enter33](../../spec/enter.md#enter33) | option enterAtTextStart: the app's stay |
| [Enter33b](../../spec/enter.md#enter33b) | changes only what blocks can't show |
| [Enter34](../../spec/enter.md#enter34) | option enterAtTextStart: the app's stay |
| [Enter36b](../../spec/enter.md#enter36b) | a quote |
| [Enter37](../../spec/enter.md#enter37) | a caret on a blank line |
| [Enter40](../../spec/enter.md#enter40) | tag free-form |
| [Enter41](../../spec/enter.md#enter41) | tag free-form |
| [Enter45](../../spec/enter.md#enter45) | option enterAtTextStart: the app's stay |
| [Enter46](../../spec/enter.md#enter46) | option enterAtTextStart: the app's stay |
| [Enter47](../../spec/enter.md#enter47) | tag free-form |
| [Enter50](../../spec/enter.md#enter50) | tag free-form |
| [Enter53](../../spec/enter.md#enter53) | tag free-form |
| **fences.md** | |
| [Fence4](../../spec/fences.md#fence4) | a quote |
| [Fence6](../../spec/fences.md#fence6) | tag markup-fence |
| [Fence7](../../spec/fences.md#fence7) | tag markup-fence |
| [Fence7b](../../spec/fences.md#fence7b) | tag markup-fence |
| [Fence7c](../../spec/fences.md#fence7c) | tag markup-fence |
| [Fence7d](../../spec/fences.md#fence7d) | tag markup-fence |
| [Fence9](../../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../../spec/fences.md#fence15) | tag markup-fence |
| [Fence17](../../spec/fences.md#fence17) | tag markup-fence |
| [Fence19](../../spec/fences.md#fence19) | tag markup-fence |
| [Fence20](../../spec/fences.md#fence20) | a quote |
| [Fence21](../../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../../spec/fences.md#fence22) | tag markup-fence |
| [Fence23](../../spec/fences.md#fence23) | tag markup-fence |
| [Fence24](../../spec/fences.md#fence24) | tag markup-fence |
| [Fence25](../../spec/fences.md#fence25) | tag markup-fence |
| [Fence26](../../spec/fences.md#fence26) | tag markup-fence |
| [Fence27](../../spec/fences.md#fence27) | tag markup-fence |
| [Fence28](../../spec/fences.md#fence28) | tag markup-fence |
| [Fence29](../../spec/fences.md#fence29) | tag markup-fence |
| [Fence30](../../spec/fences.md#fence30) | tag markup-fence |
| [Fence31](../../spec/fences.md#fence31) | tag markup-fence |
| [Fence32](../../spec/fences.md#fence32) | tag markup-fence |
| [Fence33](../../spec/fences.md#fence33) | tag markup-fence |
| [Fence34](../../spec/fences.md#fence34) | tag markup-fence |
| [Fence35](../../spec/fences.md#fence35) | tag markup-fence |
| [Fence36](../../spec/fences.md#fence36) | tag markup-fence |
| [Fence37](../../spec/fences.md#fence37) | tag markup-fence |
| [Fence38](../../spec/fences.md#fence38) | tag markup-fence |
| [Fence39](../../spec/fences.md#fence39) | tag markup-fence |
| [Fence40](../../spec/fences.md#fence40) | tag markup-fence |
| [Fence41](../../spec/fences.md#fence41) | tag markup-fence |
| [Fence43](../../spec/fences.md#fence43) | a quote |
| [Fence44](../../spec/fences.md#fence44) | indented code |
| [Fence45](../../spec/fences.md#fence45) | tag markup-fence |
| [Fence46](../../spec/fences.md#fence46) | a quote |
| [Fence47](../../spec/fences.md#fence47) | tag markup-fence |
| **gaps.md** | |
| [Gap13](../../spec/gaps.md#gap13) | option pasteStructuredAtEnd: the app's join |
| [Gap14](../../spec/gaps.md#gap14) | a caret on a blank line |
| [Gap15](../../spec/gaps.md#gap15) | a caret on a blank line |
| [Gap16](../../spec/gaps.md#gap16) | a caret on a blank line |
| [Gap17](../../spec/gaps.md#gap17) | a caret on a blank line |
| [Gap18](../../spec/gaps.md#gap18) | a caret on a blank line |
| [Gap19](../../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../../spec/indent.md#indent9) | a selection across blocks |
| [Indent12](../../spec/indent.md#indent12) | tag free-form |
| [Indent16](../../spec/indent.md#indent16) | tag free-form |
| [Indent18](../../spec/indent.md#indent18) | option bullet: + |
| [Indent22](../../spec/indent.md#indent22) | tag free-form |
| [Indent23](../../spec/indent.md#indent23) | tag free-form |
| [Indent24](../../spec/indent.md#indent24) | tag free-form |
| [Indent25](../../spec/indent.md#indent25) | tag free-form |
| [Indent27](../../spec/indent.md#indent27) | a selection across blocks |
| [Indent28](../../spec/indent.md#indent28) | a caret in a marker |
| [Indent30](../../spec/indent.md#indent30) | a caret in a marker |
| **move-subtree-down.md** | |
| [MoveDown2](../../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown8](../../spec/move-subtree-down.md#movedown8) | tag free-form |
| [MoveDown11](../../spec/move-subtree-down.md#movedown11) | a selection across blocks |
| [MoveDown12](../../spec/move-subtree-down.md#movedown12) | a selection across blocks |
| [MoveDown13](../../spec/move-subtree-down.md#movedown13) | tag free-form |
| [MoveDown14](../../spec/move-subtree-down.md#movedown14) | a selection across blocks |
| [MoveDown17](../../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown19](../../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown25](../../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown32](../../spec/move-subtree-down.md#movedown32) | a caret in a marker |
| [MoveDown34](../../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown36](../../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| **move-subtree-up.md** | |
| [MoveUp7](../../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../../spec/move-subtree-up.md#moveup10) | a selection across blocks |
| [MoveUp11](../../spec/move-subtree-up.md#moveup11) | a selection across blocks |
| [MoveUp12](../../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp18](../../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp21](../../spec/move-subtree-up.md#moveup21) | tag free-form |
| [MoveUp23](../../spec/move-subtree-up.md#moveup23) | tag free-form |
| [MoveUp24](../../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp27](../../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp31](../../spec/move-subtree-up.md#moveup31) | a selection across blocks |
| [MoveUp33](../../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../../spec/move-subtree-up.md#moveup34) | a caret in a marker |
| [MoveUp35](../../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| **obsidian-true-outliner.md** | |
| [Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [E15](../../spec/obsidian-true-outliner.md#e15) | tag free-form |
| [E18](../../spec/obsidian-true-outliner.md#e18) | a caret on a blank line |
| [Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list) | tag free-form |
| [#267, E5](../../spec/obsidian-true-outliner.md#267-e5) | a quote |
| [S5](../../spec/obsidian-true-outliner.md#s5) | tag free-form |
| [Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused) | tag free-form |
| [Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused) | a caret on a blank line |
| [Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it) | tag free-form |
| [Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | a caret in a task's checkbox |
| [Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone) | a quote |
| [Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) | indented code |
| [Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote) | a quote |
| [Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list) | option outdent: logical |
| [Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving) | tag free-form |
| [Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving) | tag free-form |
| [Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed) | tag free-form |
| [Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored) | tag free-form |
| [Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit) | option pasteStructuredAtEnd: the app's join |
| [Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit) | option pasteStructuredAtEnd: the app's join |
| [Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph) | a quote |
| [Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children) | option pasteStructuredAtEnd: the app's join |
| **outdent.md** | |
| [Outdent4](../../spec/outdent.md#outdent4) | tag free-form |
| [Outdent5](../../spec/outdent.md#outdent5) | tag free-form |
| [Outdent8](../../spec/outdent.md#outdent8) | a selection across blocks |
| [Outdent10](../../spec/outdent.md#outdent10) | a selection across blocks |
| [Outdent11](../../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../../spec/outdent.md#outdent12) | tag free-form |
| [Outdent14](../../spec/outdent.md#outdent14) | a caret in a marker |
| [DirectOutdent2](../../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../../spec/outdent.md#directoutdent3) | tag free-form |
| [LogicalOutdent1](../../spec/outdent.md#logicaloutdent1) | option outdent: logical |
| [LogicalOutdent2](../../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent4](../../spec/outdent.md#logicaloutdent4) | option outdent: logical |
| [LogicalOutdent5](../../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../../spec/outdent.md#outdent16) | tag free-form |
| [Outdent17](../../spec/outdent.md#outdent17) | tag free-form |
| [Outdent17b](../../spec/outdent.md#outdent17b) | tag free-form |
| [Outdent18](../../spec/outdent.md#outdent18) | tag free-form |
| [Outdent19](../../spec/outdent.md#outdent19) | tag free-form |
| **paste.md** | |
| [Paste2](../../spec/paste.md#paste2) | option pasteStructuredAtEnd: the app's join |
| [Paste2b](../../spec/paste.md#paste2b) | option pasteStructuredAtEnd: the app's join |
| [Paste6](../../spec/paste.md#paste6) | tag free-form |
| [Paste8](../../spec/paste.md#paste8) | option pasteStructuredLines: items |
| [Paste8b](../../spec/paste.md#paste8b) | option pasteStructuredLines: items |
| [Paste8c](../../spec/paste.md#paste8c) | option pasteStructuredLines: items |
| [Paste12](../../spec/paste.md#paste12) | a quote |
| [Paste13](../../spec/paste.md#paste13) | option pasteStructuredAtEnd: the app's join |
| [Paste13b](../../spec/paste.md#paste13b) | option pasteStructuredListForm: drop |
| [Paste13c](../../spec/paste.md#paste13c) | option pasteStructuredAtEnd: the app's join |
| [Paste13d](../../spec/paste.md#paste13d) | option pasteStructuredListForm: the app's own |
| [Paste14](../../spec/paste.md#paste14) | option pasteStructuredAtEnd: the app's join |
| [Paste14b](../../spec/paste.md#paste14b) | option pasteStructuredOnParent: after |
| [Paste15](../../spec/paste.md#paste15) | option pasteStructuredListForm: the app's own |
| [Paste15b](../../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15c](../../spec/paste.md#paste15c) | option pasteStructuredListForm: drop |
| [Paste16](../../spec/paste.md#paste16) | option pasteStructuredListForm: the app's own |
| [Paste17](../../spec/paste.md#paste17) | option pasteStructuredAtEnd: the app's join |
| [Paste17b](../../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17c](../../spec/paste.md#paste17c) | option pasteStructuredListForm: drop |
| [Paste17d](../../spec/paste.md#paste17d) | option pasteStructuredListForm: literal |
| [Paste18](../../spec/paste.md#paste18) | option pasteStructuredAtEnd: the app's join |
| [Paste18b](../../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste20](../../spec/paste.md#paste20) | option pasteStructuredAtEnd: the app's join |
| [Paste21](../../spec/paste.md#paste21) | option pasteStructuredAtEnd: the app's join |
| [Paste23](../../spec/paste.md#paste23) | a quote |
| [Paste26](../../spec/paste.md#paste26) | option pasteStructuredAtEnd: the app's join |
| [Paste27](../../spec/paste.md#paste27) | option pasteStructuredAtEnd: the app's join |
| [Paste27c](../../spec/paste.md#paste27c) | option enterMidItem: child |
| [Paste27d](../../spec/paste.md#paste27d) | option pasteStructuredOnParent: after |
| [Paste28](../../spec/paste.md#paste28) | a callout |
| [Paste29](../../spec/paste.md#paste29) | option pasteStructuredAtEnd: the app's join |
| [Paste36b](../../spec/paste.md#paste36b) | option pasteStructuredParagraphList: children |
| [Paste38](../../spec/paste.md#paste38) | option pasteStructuredMidText: after |
| [Paste38b](../../spec/paste.md#paste38b) | option pasteStructuredMidText: after |
| [Paste39](../../spec/paste.md#paste39) | option pasteStructuredLines: items |
| [Paste40](../../spec/paste.md#paste40) | tag free-form |
| [Paste41](../../spec/paste.md#paste41) | tag free-form |
| [Paste42b](../../spec/paste.md#paste42b) | option pasteStructuredOnParent: after |
| [Paste43](../../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste46](../../spec/paste.md#paste46) | tag markup-fence |
| [Paste47](../../spec/paste.md#paste47) | tag markup-fence |
| [Paste50](../../spec/paste.md#paste50) | a selection across blocks |
| [Paste54](../../spec/paste.md#paste54) | tag free-form |
| [Paste55](../../spec/paste.md#paste55) | tag free-form |
| [Paste56](../../spec/paste.md#paste56) | tag free-form |
| [Paste59b](../../spec/paste.md#paste59b) | option pasteStructuredOnParent: after |
| [Paste63](../../spec/paste.md#paste63) | option pasteStructuredListForm: the app's own |
| [Paste65](../../spec/paste.md#paste65) | a caret on a blank line |
| [Paste67](../../spec/paste.md#paste67) | a caret on a blank line |
| [Paste71](../../spec/paste.md#paste71) | tag markup-fence |
| [Paste72](../../spec/paste.md#paste72) | a quote |
| [Paste77](../../spec/paste.md#paste77) | a quote |
| **placeholders.md** | |
| [Placeholder2](../../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder3](../../spec/placeholders.md#placeholder3) | tag free-form |
| [Placeholder4](../../spec/placeholders.md#placeholder4) | tag free-form |
| [Placeholder9](../../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../../spec/placeholders.md#placeholder10) | a caret on a blank line |
| [Placeholder11](../../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../../spec/placeholders.md#placeholder12) | a caret on a blank line |
| [Placeholder15](../../spec/placeholders.md#placeholder15) | option enterAtTextStart: the app's stay |
| **quotes.md** | |
| [Quote1](../../spec/quotes.md#quote1) | a quote |
| [Quote2](../../spec/quotes.md#quote2) | a quote |
| [Quote3](../../spec/quotes.md#quote3) | a quote |
| [Quote4](../../spec/quotes.md#quote4) | a quote |
| [Quote5](../../spec/quotes.md#quote5) | a quote |
| [Quote6](../../spec/quotes.md#quote6) | a quote |
| [Quote7](../../spec/quotes.md#quote7) | a callout |
| [Quote8](../../spec/quotes.md#quote8) | a quote |
| [Quote9](../../spec/quotes.md#quote9) | a quote |
| [Quote10](../../spec/quotes.md#quote10) | a quote |
| [Quote11](../../spec/quotes.md#quote11) | a quote |
| [Quote12](../../spec/quotes.md#quote12) | a quote |
| [Quote12b](../../spec/quotes.md#quote12b) | option outdent: logical |
| [Quote13](../../spec/quotes.md#quote13) | a callout |
| [Quote14](../../spec/quotes.md#quote14) | a quote |
| [Quote15](../../spec/quotes.md#quote15) | a quote |
| [Quote16](../../spec/quotes.md#quote16) | a quote |
| [Quote17](../../spec/quotes.md#quote17) | a quote |
| [Quote18](../../spec/quotes.md#quote18) | a quote |
| [Quote19](../../spec/quotes.md#quote19) | a quote |
| [Quote20](../../spec/quotes.md#quote20) | option outdent: logical |
| [Quote21](../../spec/quotes.md#quote21) | a quote |
| [Quote22](../../spec/quotes.md#quote22) | a quote |
| [Quote23](../../spec/quotes.md#quote23) | a quote |
| [Quote24](../../spec/quotes.md#quote24) | a quote |
| [Quote25](../../spec/quotes.md#quote25) | a quote |
| [Quote26](../../spec/quotes.md#quote26) | a quote |
| [Quote27](../../spec/quotes.md#quote27) | tag free-form |
| [Quote28](../../spec/quotes.md#quote28) | tag free-form |
| [Quote29](../../spec/quotes.md#quote29) | a quote |
| [Quote30](../../spec/quotes.md#quote30) | a quote |
| [Quote31](../../spec/quotes.md#quote31) | a quote |
| [Quote32](../../spec/quotes.md#quote32) | tag free-form |
| [Quote33](../../spec/quotes.md#quote33) | tag free-form |
| [Quote34](../../spec/quotes.md#quote34) | tag free-form |
| [Quote35](../../spec/quotes.md#quote35) | a quote |
| [Quote36](../../spec/quotes.md#quote36) | a quote |
| [Quote37](../../spec/quotes.md#quote37) | option enterAtTextStart: the app's stay |
| [Quote38](../../spec/quotes.md#quote38) | a callout |
| [Quote39](../../spec/quotes.md#quote39) | a callout |
| [Quote40](../../spec/quotes.md#quote40) | a callout |
| [Quote41](../../spec/quotes.md#quote41) | a callout |
| [Quote42](../../spec/quotes.md#quote42) | a quote |
| [Quote43](../../spec/quotes.md#quote43) | a callout |
| [Quote43b](../../spec/quotes.md#quote43b) | option editInMarkup: refuse |
| [Quote44](../../spec/quotes.md#quote44) | a quote |
| [Quote45](../../spec/quotes.md#quote45) | a quote |
| [Quote46](../../spec/quotes.md#quote46) | a quote |
| [Quote47](../../spec/quotes.md#quote47) | tag free-form |
| [Quote48](../../spec/quotes.md#quote48) | a quote |
| [Quote49](../../spec/quotes.md#quote49) | a quote |
| [Quote50](../../spec/quotes.md#quote50) | a quote |
| [Quote51](../../spec/quotes.md#quote51) | tag free-form |
| [Quote52](../../spec/quotes.md#quote52) | a quote |
| [Quote53](../../spec/quotes.md#quote53) | a quote |
| [Quote54](../../spec/quotes.md#quote54) | tag free-form |
| [Quote55](../../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote56](../../spec/quotes.md#quote56) | a quote |
| [Quote57](../../spec/quotes.md#quote57) | a callout |
| [Quote58](../../spec/quotes.md#quote58) | a callout |
| [Quote59](../../spec/quotes.md#quote59) | tag free-form |
| [Quote60](../../spec/quotes.md#quote60) | a callout |
| [Quote61](../../spec/quotes.md#quote61) | a callout |
| [Quote62](../../spec/quotes.md#quote62) | a callout |
| [Quote63](../../spec/quotes.md#quote63) | option pasteStructuredAtEnd: the app's join |
| [Quote64](../../spec/quotes.md#quote64) | a quote |
| [Quote65](../../spec/quotes.md#quote65) | a quote |
| [Quote66](../../spec/quotes.md#quote66) | a quote |
| [Quote67](../../spec/quotes.md#quote67) | a quote |
| [Quote68](../../spec/quotes.md#quote68) | a quote |
| [Quote71](../../spec/quotes.md#quote71) | a callout |
| [Quote72](../../spec/quotes.md#quote72) | a quote |
| [Quote73](../../spec/quotes.md#quote73) | tag free-form |
| [Quote74](../../spec/quotes.md#quote74) | a quote |
| [Quote75](../../spec/quotes.md#quote75) | a quote |
| [Quote76](../../spec/quotes.md#quote76) | a quote |
| [Quote77](../../spec/quotes.md#quote77) | a quote |
| [Quote78](../../spec/quotes.md#quote78) | a quote |
| [Quote79](../../spec/quotes.md#quote79) | a callout |
| [Quote80](../../spec/quotes.md#quote80) | option enterAtTextStart: the app's stay |
| [Quote81](../../spec/quotes.md#quote81) | a quote |
| [Quote82](../../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote88](../../spec/quotes.md#quote88) | a quote |
| [Quote83](../../spec/quotes.md#quote83) | a quote |
| [Quote84](../../spec/quotes.md#quote84) | a callout |
| [Quote85](../../spec/quotes.md#quote85) | a quote |
| [Quote86](../../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote87](../../spec/quotes.md#quote87) | a quote |
| [Quote69](../../spec/quotes.md#quote69) | a quote |
| [Quote70](../../spec/quotes.md#quote70) | a quote |
| **scenarios.md** | |
| [Scenario6](../../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario7](../../spec/scenarios.md#scenario7) | option enterAtTextStart: the app's stay |
| [Scenario10](../../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario15](../../spec/scenarios.md#scenario15) | tag free-form |
| [Scenario17](../../spec/scenarios.md#scenario17) | option pasteStructuredLines: items |
| [Scenario21](../../spec/scenarios.md#scenario21) | tag free-form |
| [Scenario24](../../spec/scenarios.md#scenario24) | tag free-form |
| **shift-enter.md** | |
| [ShiftEnter10](../../spec/shift-enter.md#shiftenter10) | tag free-form |
| [ShiftEnter11](../../spec/shift-enter.md#shiftenter11) | tag free-form |
| [ShiftEnter12](../../spec/shift-enter.md#shiftenter12) | tag free-form |
| [ShiftEnter13](../../spec/shift-enter.md#shiftenter13) | tag free-form |
| [ShiftEnter14](../../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter15](../../spec/shift-enter.md#shiftenter15) | tag free-form |
| [ShiftEnter16](../../spec/shift-enter.md#shiftenter16) | tag free-form |
| [ShiftEnter22](../../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter25](../../spec/shift-enter.md#shiftenter25) | tag free-form |
| **tasks.md** | |
| [TaskEnter1](../../spec/tasks.md#taskenter1) | tag free-form |
| [TaskEnter4](../../spec/tasks.md#taskenter4) | option enterAtTextStart: the app's stay |
| [TaskBackspace1](../../spec/tasks.md#taskbackspace1) | a caret in a task's checkbox |
| [TaskBackspace4](../../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../../spec/tasks.md#taskbackspace6) | a caret in a task's checkbox |
| [TaskBackspace7](../../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| **typing.md** | |
| [Typing1](../../spec/typing.md#typing1) | tag free-form |
| [Typing2](../../spec/typing.md#typing2) | tag free-form |
| [Typing3](../../spec/typing.md#typing3) | tag free-form |
| [Typing4](../../spec/typing.md#typing4) | option editInMarkup: refuse |
| **undo.md** | |
| [Undo2](../../spec/undo.md#undo2) | tag free-form |
| [Undo3](../../spec/undo.md#undo3) | tag free-form |
| **z-open.md** | |
| [Open2](../../spec/z-open.md#open2) | action deleteSubtree |
