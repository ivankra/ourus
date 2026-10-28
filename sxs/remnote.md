---
type: "SxS"
app: "remnote"
version: "1.28.62"
url: "https://www.remnote.com/notes"
model: "block"
command: "node sxs/run.ts remnote"
elapsed_s: 789
workers: 2
---

# RemNote (nbl) vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 246 | [18](#caret-18) | [11](#whitespace-11) | [74](#disagree-74) |  |  | **349** |
| adapted | 150 | [4](#adapted-caret-4) | [13](#adapted-whitespace-13) | [88](#adapted-disagree-88) |  |  | **255** |
| **total** | **396 (32%)** | **22 (1.8%)** | **24 (2%)** | **162 (13%)** | **0 (0%)** | **[619](#skipped-619) (50%)** | **1228** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 39 | 2 | 3 | 5 |  | 37 | **86** | 32 | 17 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** | 1 |  |
| [copy.md](../spec/copy.md) | 3 |  |  |  |  | 10 | **13** | 1 | 2 |
| [cursor.md](../spec/cursor.md) | 24 | 3 |  |  |  | 9 | **36** | 24 | 3 |
| [delete-subtree.md](../spec/delete-subtree.md) | 8 |  |  |  |  | 5 | **13** | 3 | 5 |
| [delete.md](../spec/delete.md) | 19 | 1 | 1 | 4 |  | 31 | **56** | 20 | 5 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [enter.md](../spec/enter.md) | 50 |  | 4 | 5 |  | 39 | **98** | 21 | 38 |
| [fences.md](../spec/fences.md) | 1 |  | 1 |  |  | 68 | **70** |  | 2 |
| [fold.md](../spec/fold.md) | 10 | 2 | 1 | 1 |  | 5 | **19** | 11 | 3 |
| [gaps.md](../spec/gaps.md) | 12 |  |  | 3 |  | 4 | **19** | 10 | 5 |
| [indent.md](../spec/indent.md) | 31 |  |  | 6 |  | 13 | **50** | 26 | 11 |
| [lists.md](../spec/lists.md) | 13 |  |  |  |  | 3 | **16** | 6 | 7 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 23 |  |  | 8 |  | 9 | **40** | 27 | 4 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 22 |  |  | 9 |  | 12 | **43** | 26 | 5 |
| [move-subtree.md](../spec/move-subtree.md) | 1 | 8 |  | 1 |  | 14 | **24** | 7 | 3 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 37 |  | 3 | 7 |  | 20 | **67** | 34 | 13 |
| [outdent.md](../spec/outdent.md) | 22 |  |  | 8 |  | 8 | **38** | 22 | 8 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 2 |  |  | 4 |  |  | **6** | 1 | 5 |
| [paste-html.md](../spec/paste-html.md) | 2 |  |  | 16 |  | 1 | **19** |  | 18 |
| [paste-list-form.md](../spec/paste-list-form.md) |  |  |  | 6 |  |  | **6** |  | 6 |
| [paste-list.md](../spec/paste-list.md) |  |  | 2 | 20 |  | 7 | **29** | 4 | 18 |
| [paste-plain.md](../spec/paste-plain.md) | 2 |  | 1 | 22 |  | 11 | **36** | 16 | 9 |
| [paste.md](../spec/paste.md) | 3 |  | 1 | 17 |  | 15 | **36** | 3 | 18 |
| [placeholders.md](../spec/placeholders.md) | 11 |  | 4 | 1 |  | 4 | **20** | 9 | 7 |
| [quirks.md](../spec/quirks.md) |  |  |  | 1 |  | 6 | **7** |  | 1 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 143 | **143** |  |  |
| [regressions.md](../spec/regressions.md) | 17 |  |  | 4 |  | 43 | **64** | 6 | 15 |
| [scenarios.md](../spec/scenarios.md) | 14 | 4 |  | 8 |  | 3 | **29** | 19 | 7 |
| [shift-enter.md](../spec/shift-enter.md) | 24 |  | 3 | 3 |  | 6 | **36** | 15 | 15 |
| [tasks.md](../spec/tasks.md) | 2 |  |  |  |  | 28 | **30** |  | 2 |
| [typing.md](../spec/typing.md) |  |  |  | 3 |  |  | **3** | 1 | 2 |
| [undo.md](../spec/undo.md) | 2 | 2 |  |  |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| [zoom.md](../spec/zoom.md) | 1 |  |  |  |  | 13 | **14** | 1 |  |
| **total** | **396 (32%)** | **22 (1.8%)** | **24 (2%)** | **162 (13%)** | **0 (0%)** | **624 (51%)** | **1228** | **349 (28%)** | **255 (21%)** |

## Disagree (74)

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

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

</td><td>

```buffer
- x┃
  - a
    - b
```

</td></tr>
</table>

### [Backspace19b](../spec/backspace.md#backspace19b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  b┃c
```

</td></tr>
</table>

> enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  b
- ┃c
```

</td><td>

```buffer
- a
  
  b
  
  ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  b┃c
```

</td></tr>
</table>

### [Backspace23](../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title
  ¶ ┃more
    lines
```

</td><td>

```buffer
¶ # Title┃more
  lines
```

</td><td>

```buffer
¶ # Title
  ¶ ┃more
    lines
```

</td></tr>
</table>

### [Backspace29](../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

```buffer
1. a
¶ ┃
1. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

### [Backspace45](../spec/backspace.md#backspace45)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
    - d
  - e
```

</td><td>

```buffer
- a┃b
  - e
  - c
  - d
```

</td><td>

```buffer
- a┃b
  - c
  - d
  - e
```

</td></tr>
</table>

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

```buffer
- ┃a
  - b
- c
- d
```

</td><td>

```buffer
- ┃a
  - b
  - c
- d
```

</td></tr>
</table>

### [Delete5b](../spec/delete.md#delete5b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
    - b
      - c
    - d
  - e
- f
```

</td></tr>
</table>

> deleteContentForward

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

> deleteContentForward

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
  - d
  - e
- f
```

</td><td>

```buffer
- a
  - ┃b
    - c
    - d
  - e
- f
```

</td></tr>
</table>

### [Delete28](../spec/delete.md#delete28)

> deleteContentForward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
¶ p
```

</td><td>

```buffer
- a
¶ ┃p
```

</td><td>

```buffer
- a
- ┃p
```

</td></tr>
</table>

### [Delete31](../spec/delete.md#delete31)

> deleteContentForward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
    - d
  - e
```

</td><td>

```buffer
- a┃b
  - e
  - c
  - d
```

</td><td>

```buffer
- a┃b
  - c
  - d
  - e
```

</td></tr>
</table>

### [Enter56b](../spec/enter.md#enter56b)

> enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a«b
  c»d
```

</td><td>

```buffer
¶ a
¶ ┃b
  cd
```

</td><td>

```buffer
¶ a
¶ ┃d
```

</td></tr>
</table>

### [Enter58](../spec/enter.md#enter58)

> enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
-  ┃
```

</td><td>

```buffer
- a
¶  ┃
```

</td><td>

```buffer
- a
-  
- ┃
```

</td></tr>
</table>

### [Fold15b](../spec/fold.md#fold15b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃c
  - d

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃c
  - b
  - d

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃c
  - b
  - d

⟦folded none; zoom none⟧
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ text
¶ # B┃
  ¶ more
¶ # C
```

</td><td>

```buffer
¶ # A
¶ # B┃
  ¶ text
  ¶ more
¶ # C
```

</td><td>

```buffer
¶ # B┃
  ¶ more
¶ # A
  ¶ text
¶ # C
```

</td></tr>
</table>

### [Gap6](../spec/gaps.md#gap6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ a
¶ ## B
  ¶ b
¶ ## C
```

</td><td>

```buffer
¶ a
¶ ## A┃
¶ ## B
  ¶ b
¶ ## C
```

</td><td>

```buffer
¶ ## B
  ¶ b
¶ ## A┃
  ¶ a
¶ ## C
```

</td></tr>
</table>

### [Indent12](../spec/indent.md#indent12)

> indent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## B┃
    ¶ ### C
```

</td><td>

```buffer
¶ # A
  ¶ ## B┃
    ¶ ### C
```

</td><td>

```buffer
¶ # A
  ¶ ### B┃
    ¶ #### C
```

</td></tr>
</table>

### [Indent23](../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## B
  ¶ ## C┃
    ¶ ### D
```

</td><td>

```buffer
¶ # A
  ¶ ## B
  ¶ ## C┃
    ¶ ### D
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ ### C┃
      ¶ #### D
```

</td></tr>
</table>

### [Indent29b](../spec/indent.md#indent29b)

> indent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
¶ para┃
```

</td><td>

```buffer
1. a
- para┃
```

</td><td>

```buffer
1. a
2. para┃
```

</td></tr>
</table>

### [MoveDown4](../spec/move-subtree-down.md#movedown4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # A┃
  ¶ text a
¶ # B
  ¶ text b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ text a
¶ # A┃
¶ # B
  ¶ text b
```

</td><td>

```buffer
¶ # B
  ¶ text b
¶ # A┃
  ¶ text a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # A┃
  ¶ text a
¶ # B
  ¶ text b
```

</td></tr>
</table>

### [MoveDown7](../spec/move-subtree-down.md#movedown7)

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
<tr><th>remnote</th><th>ourus</th></tr>
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
<tr><th>remnote</th><th>ourus</th></tr>
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
  - d
  - b┃
    - b1
```

</td></tr>
</table>

### [MoveDown9](../spec/move-subtree-down.md#movedown9)

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
<tr><th>remnote</th><th>ourus</th></tr>
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

### [MoveDown10](../spec/move-subtree-down.md#movedown10)

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
<tr><th>remnote</th><th>ourus</th></tr>
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
<tr><th>remnote</th><th>ourus</th></tr>
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
  - d1
    - d11
  - c┃
    - c1
```

</td></tr>
</table>

### [MoveDown12](../spec/move-subtree-down.md#movedown12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ▮ c
    - c1
  - ▮ d
- e
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ▮ c
    - c1
  - ▮ d
- e
  - e1
```

</td><td>

```buffer
- a
  - b
- e
  - ▮ c
    - c1
  - ▮ d
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ▮ c
    - c1
  - ▮ d
- e
  - e1
```

</td><td>

```buffer
- a
  - b
- e
  - e1
  - ▮ c
    - c1
  - ▮ d
```

</td></tr>
</table>

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A┃
  - x
¶ # B
  - y
```

</td><td>

```buffer
- x
¶ # A┃
¶ # B
  - y
```

</td><td>

```buffer
¶ # B
  - y
¶ # A┃
  - x
```

</td></tr>
</table>

### [MoveDown17](../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## ┃H
¶ # H
  - a
```

</td><td>

```buffer
¶ # H
  ¶ ## ┃H
    - a
```

</td><td>

```buffer
¶ ## ┃H
¶ # H
  - a
```

</td></tr>
</table>

### [MoveDown19](../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## s┃
¶ # B
  - x
```

</td><td>

```buffer
¶ # A
¶ # B
  ¶ ## s┃
    - x
```

</td><td>

```buffer
¶ # A
  ¶ ## s┃
¶ # B
  - x
```

</td></tr>
</table>

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ text a
¶ # B┃
  ¶ text b
```

</td><td>

```buffer
¶ # A
¶ # B┃
  ¶ text a
  ¶ text b
```

</td><td>

```buffer
¶ # B┃
  ¶ text b
¶ # A
  ¶ text a
```

</td></tr>
</table>

### [MoveUp6](../spec/move-subtree-up.md#moveup6)

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
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c
  - d┃
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
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c
  - d┃
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

### [MoveUp8](../spec/move-subtree-up.md#moveup8)

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
<tr><th>remnote</th><th>ourus</th></tr>
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
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveSubtreeDown

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

### [MoveUp9](../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
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

</td></tr>
</table>

### [MoveUp11](../spec/move-subtree-up.md#moveup11)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
- b
  - ▮ c
    - c1
  - ▮ d
  - e
```

</td><td>

```buffer
- a
  - a1
- b
  - ▮ c
    - c1
  - ▮ d
  - e
```

</td><td>

```buffer
- a
  - a1
  - ▮ c
    - c1
  - ▮ d
- b
  - e
```

</td></tr>
</table>

### [MoveUp16](../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## a1
¶ # B┃
  ¶ ## b1
```

</td><td>

```buffer
¶ # A
¶ # B┃
  ¶ ## a1
  ¶ ## b1
```

</td><td>

```buffer
¶ # B┃
  ¶ ## b1
¶ # A
  ¶ ## a1
```

</td></tr>
</table>

### [MoveUp26](../spec/move-subtree-up.md#moveup26)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  - x
¶ # B
  ¶ ## s┃
    - y
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  - x
  ¶ ## s┃
¶ # B
  - y
```

</td><td>

```buffer
¶ # A
  - x
  ¶ ## s┃
    - y
¶ # B
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  - x
¶ # B
  ¶ ## s┃
    - y
```

</td></tr>
</table>

### [MoveUp28](../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## X
¶ # A┃
  - a
```

</td><td>

```buffer
¶ # A┃
  ¶ ## X
    - a
```

</td><td>

```buffer
¶ ## X
¶ # A┃
  - a
```

</td></tr>
</table>

### [MoveUp33](../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H
  - a
  ¶ ## ┃H
```

</td><td>

```buffer
¶ # H
  ¶ ## ┃H
    - a
```

</td><td>

```buffer
¶ # H
  - a
  ¶ ## ┃H
```

</td></tr>
</table>

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃
  
  para
```

</td><td>

```buffer
- item
- ┃para
```

</td><td>

```buffer
- item
  - ┃
  ¶ para
```

</td></tr>
</table>

### [TO-E33](../spec/obsidian-true-outliner.md#to-e33)

> enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

```buffer
- al
- ┃pha beta
```

</td><td>

```buffer
- al
- ┃ta
```

</td></tr>
</table>

### [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ foo┃
  bar
```

</td><td>

```buffer
¶ foo
  
  bar
```

</td><td>

```buffer
¶ ┃foo
¶ bar
```

</td></tr>
</table>

### [TO-S13](../spec/obsidian-true-outliner.md#to-s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- a
  ┃lpha beta
```

</td><td>

```buffer
- a
  ┃ beta
```

</td></tr>
</table>

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

```buffer
1. p
¶ ┃
1. q
```

</td><td>

```buffer
1. p┃
2. q
```

</td></tr>
</table>

### [Outdent4](../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ ### B
```

</td><td>

```buffer
¶ ## A┃
  ¶ ### B
```

</td><td>

```buffer
¶ # A┃
  ¶ ## B
```

</td></tr>
</table>

### [Outdent8](../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- ▮ a
  - b
- ▮ c
```

</td><td>

```buffer
¶ para
- ▮ a
- b
- ▮ c
```

</td><td>

```buffer
¶ para
¶ ▮ a
- ▮ b
¶ ▮ c
```

</td></tr>
</table>

### [Outdent11](../spec/outdent.md#outdent11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # T
  ¶ ## A┃
  ¶ ## B
```

</td></tr>
</table>

> outdent

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T
  ¶ ## A┃
  ¶ ## B
```

</td><td>

```buffer
¶ # T
¶ # A┃
  ¶ ## B
```

</td></tr>
</table>

> indent

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T
  ¶ ## A┃
  ¶ ## B
```

</td><td>

```buffer
¶ # T
  ¶ ## A┃
    ¶ ### B
```

</td></tr>
</table>

### [DirectOutdent3](../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

```buffer
- a┃
- a1
- b
```

</td><td>

```buffer
¶ a┃
- a1
- b
```

</td></tr>
</table>

### [PasteList9](../spec/paste-list.md#pastelist9)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
1. Introduction
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [PasteList22](../spec/paste-list.md#pastelist22)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
  - kid
```

</td><td>

```buffer
- ax┃b
  - kid
¶ y
```

</td><td>

```buffer
- ax
- y┃b
  - kid
```

</td></tr>
</table>

### [PasteList25](../spec/paste-list.md#pastelist25)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
1. Introduction
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃here
```

</td><td>

```buffer
- Introduction┃here
```

</td><td>

```buffer
- 1\. Introduction┃here
```

</td></tr>
</table>

### [PastePlain1](../spec/paste-plain.md#pasteplain1)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax┃b
¶ y
¶ 
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

### [PastePlain2](../spec/paste-plain.md#pasteplain2)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax┃
¶ y
¶ 
```

</td><td>

```buffer
- ax
  y
  ┃
```

</td></tr>
</table>

### [PastePlain3](../spec/paste-plain.md#pasteplain3)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x

y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax┃b
¶ 
¶ y
¶ 
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

### [PastePlain6](../spec/paste-plain.md#pasteplain6)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
2. y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax┃
1. y
```

</td><td>

```buffer
- ax
  2\. y┃
```

</td></tr>
</table>

### [PastePlain9](../spec/paste-plain.md#pasteplain9)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
. a
b
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ 1┃
```

</td><td>

```buffer
¶ 1\. a┃
¶ b
¶ 
```

</td><td>

```buffer
¶ 1\. a
  b
  ┃
```

</td></tr>
</table>

### [PastePlain10](../spec/paste-plain.md#pasteplain10)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
1. a
2. b
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
1. 2a┃. y
2. b
¶ 
```

</td><td>

```buffer
- 21\. a
  2\. b
  ┃. y
```

</td></tr>
</table>

### [PastePlain14](../spec/paste-plain.md#pasteplain14)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
 y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px┃
¶ y
```

</td><td>

```buffer
¶ px
   y┃
```

</td></tr>
</table>

### [PastePlain15](../spec/paste-plain.md#pasteplain15)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
 
y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px┃
¶ 
¶ y
```

</td><td>

```buffer
¶ px
   
  y┃
```

</td></tr>
</table>

### [PastePlain16](../spec/paste-plain.md#pasteplain16)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃ b
  - c
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃ b
  - c
¶ y
```

</td><td>

```buffer
- x
  y┃ b
  - c
```

</td></tr>
</table>

### [PastePlain19](../spec/paste-plain.md#pasteplain19)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
    first
    second
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- first┃a
¶ second
¶ 
```

</td><td>

```buffer
- first
      second
  ┃a
```

</td></tr>
</table>

### [PastePlain20](../spec/paste-plain.md#pasteplain20)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
a  
b
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- a┃
¶ b
```

</td><td>

```buffer
- a  
  b┃
```

</td></tr>
</table>

### [PastePlain21](../spec/paste-plain.md#pasteplain21)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H┃
```

</td><td>

```buffer
¶ # Hx┃
  ¶ y
  ¶ 
```

</td><td>

```buffer
¶ # H┃
```

</td></tr>
</table>

### [PastePlain24](../spec/paste-plain.md#pasteplain24)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard

x
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃b
```

</td><td>

```buffer
- a
  x┃b
```

</td><td>

```buffer
- a
  
  x┃b
```

</td></tr>
</table>

### [PastePlain26](../spec/paste-plain.md#pasteplain26)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard


x
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
¶ ┃abc
```

</td><td>

```buffer
¶ p
- ┃abc
  - x
```

</td><td>

```buffer
¶ p
¶ x┃abc
```

</td></tr>
</table>

### [Paste1](../spec/paste.md#paste1)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax┃b
¶ y
¶ 
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

### [Paste2](../spec/paste.md#paste2)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  ¶ para
```

</td><td>

```buffer
¶ # Tx┃
  ¶ y
  ¶ para
```

</td><td>

```buffer
¶ # T
  ¶ x
    y┃
  ¶ para
```

</td></tr>
</table>

### [Paste21](../spec/paste.md#paste21)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
# h
text
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃q
```

</td><td>

```buffer
¶ # p h┃q
  ¶ text
```

</td><td>

```buffer
¶ ph
¶ text┃q
```

</td></tr>
</table>

### [Placeholder18](../spec/placeholders.md#placeholder18)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃ # b
¶ after
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃ # b
¶ after
```

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # b
  ¶ after┃
```

</td><td>

```buffer
¶ \# b
¶ after
```

</td></tr>
</table>

### [Regression9](../spec/regressions.md#regression9)

> outdent

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  1. b
         - c
```

</td><td>

```buffer
- ┃a
1. b
       - c
```

</td><td>

```buffer
¶ ┃a
1. b
       - c
```

</td></tr>
</table>

### [Scenario8b](../spec/scenarios.md#scenario8b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work
  - email┃
- Home
  - plants
```

</td></tr>
</table>

> moveSubtree ③

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ▮ Home
  - plants
- Inbox
- Work
  - email
```

</td><td>

```buffer
- Home
  - plants
- Inbox
- Work
  - email┃
```

</td></tr>
</table>

> "s"

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Home
  - plants
- Inbox
- Work
  - email
```

</td><td>

```buffer
- Home
  - plants
- Inbox
- Work
  - emails┃
```

</td></tr>
</table>

### [Scenario9](../spec/scenarios.md#scenario9)

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
<tr><th>remnote</th><th>ourus</th></tr>
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
<tr><th>remnote</th><th>ourus</th></tr>
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
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Errands
- Inbox┃
  - call Ann
  - post a letter
  - buy milk
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

### [Scenario14](../spec/scenarios.md#scenario14)

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
<tr><th>remnote</th><th>ourus</th></tr>
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

### [Scenario22](../spec/scenarios.md#scenario22)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work┃
  - email
¶ # Home
  - plants
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- email
¶ # Work┃
¶ # Home
  - plants
```

</td><td>

```buffer
¶ # Home
  - plants
¶ # Work┃
  - email
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work┃
  - email
¶ # Home
  - plants
```

</td></tr>
</table>

### [Scenario24](../spec/scenarios.md#scenario24)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:
  ┃milk
  bread
```

</td></tr>
</table>

> "- "

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:
  \- ┃milk
  bread
```

</td><td>

```buffer
¶ Shopping:
- ┃milk
  bread
```

</td></tr>
</table>

> cursorLineDown cursorLineBoundaryBackward "- "

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:
  \- milk
  \- ┃bread
```

</td><td>

```buffer
¶ Shopping:
- milk
- ┃bread
```

</td></tr>
</table>

### [ShiftEnter14](../spec/shift-enter.md#shiftenter14)

> shiftEnter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title┃ more
```

</td><td>

```buffer
¶ # Title
  ┃ more
```

</td><td>

```buffer
¶ # Title
  ¶ ┃more
```

</td></tr>
</table>

### [Typing3](../spec/typing.md#typing3)

> "- "

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ┃more
```

</td><td>

```buffer
¶ para
  \- ┃more
```

</td><td>

```buffer
¶ para
- ┃more
```

</td></tr>
</table>

## Whitespace (11)

### [Backspace12e](../spec/backspace.md#backspace12e)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a
¶ ┃b
```

</td></tr>
</table>

> enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
¶ 
¶ ┃b
```

</td><td>

```buffer
¶ a
¶ ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a
¶ ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃b
```

</td></tr>
</table>

### [Backspace14](../spec/backspace.md#backspace14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ a┃
  ¶ ## H2
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ ┃
  ¶ ## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃H1
  ¶ 
  ¶ ## H2
```

</td><td>

```buffer
¶ ┃# H1
  ¶ ## H2
```

</td></tr>
</table>

### [Delete9](../spec/delete.md#delete9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ ┃a
  ¶ ## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ ┃
  ¶ ## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃H1
  ¶ 
  ¶ ## H2
```

</td><td>

```buffer
¶ ┃# H1
  ¶ ## H2
```

</td></tr>
</table>

### [Enter37](../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

```buffer
1. a
   text
   
2. ┃
```

</td><td>

```buffer
1. a
   text
2. ┃
```

</td></tr>
</table>

### [Enter40](../spec/enter.md#enter40)

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
¶ ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ 
¶ ┃
```

</td><td>

```buffer
- a
¶ ┃
```

</td></tr>
</table>

### [TO12](../spec/obsidian-true-outliner.md#to12)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
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

### [PasteList23](../spec/paste-list.md#pastelist23)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax┃b
¶ 
```

</td><td>

```buffer
- ax┃b
```

</td></tr>
</table>

### [Placeholder2](../spec/placeholders.md#placeholder2)

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
¶ ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
¶ 
```

</td><td>

```buffer
- a
```

</td></tr>
</table>

### [Placeholder3](../spec/placeholders.md#placeholder3)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
¶ 
```

</td><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

### [Placeholder4](../spec/placeholders.md#placeholder4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para┃
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
  
```

</td><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃ three
```

</td><td>

```buffer
- 
  
  ┃ three
```

</td><td>

```buffer
- 
  ┃ three
```

</td></tr>
</table>

## Caret (18)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

```buffer
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

### [Backspace17b](../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

```buffer
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

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ab┃
```

</td><td>

```buffer
¶ ab
```

</td><td>

```buffer
¶ ┃ab
```

</td></tr>
</table>

### [CursorUp2](../spec/cursor.md#cursorup2)

> cursorLineUp

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  - ┃a
```

</td><td>

```buffer
¶ ## Ti┃tle
  - a
```

</td><td>

```buffer
¶ ## ┃Title
  - a
```

</td></tr>
</table>

### [CursorDown1](../spec/cursor.md#cursordown1)

> cursorLineDown cursorLineDown

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ abc┃
¶ abcdef
```

</td><td>

```buffer
¶ abc
¶ abcdef┃
```

</td><td>

```buffer
¶ abc
¶ abc┃def
```

</td></tr>
</table>

### [Delete5d](../spec/delete.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

```buffer
- a┃
  - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

### [Fold16](../spec/fold.md#fold16)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- c
- a┃
  - b

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

> redo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- c
- a┃
  - b

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

### [Fold17](../spec/fold.md#fold17)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x
- a┃
  - b

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃
    - b

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- a
  - b

⟦folded 2; zoom none⟧
```

</td><td>

```buffer
- x
- a┃
  - b

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

### [MoveSubtree1](../spec/move-subtree.md#movesubtree1)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
- three┃
```

</td><td>

```buffer
- ▮ three
- one
  - two
```

</td><td>

```buffer
- three┃
- one
  - two
```

</td></tr>
</table>

### [MoveSubtree2](../spec/move-subtree.md#movesubtree2)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two┃
- three
```

</td><td>

```buffer
- ▮ three
- one
  - two
```

</td><td>

```buffer
- three
- one
  - two┃
```

</td></tr>
</table>

### [MoveSubtree3](../spec/move-subtree.md#movesubtree3)

> moveSubtree ①

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
- three
```

</td><td>

```buffer
- two
  - ▮ one
- three
```

</td><td>

```buffer
- two
  - one┃
- three
```

</td></tr>
</table>

### [MoveSubtree5](../spec/move-subtree.md#movesubtree5)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ▮ a
- ▮ b
- c
```

</td><td>

```buffer
- ▮ c
- a
- b
```

</td><td>

```buffer
- c
- ▮ a
- ▮ b
```

</td></tr>
</table>

### [MoveSubtree6](../spec/move-subtree.md#movesubtree6)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ▮ a
- ▮ b
- c
```

</td><td>

```buffer
- a
- ▮ c
- b
```

</td><td>

```buffer
- ▮ a
- ▮ c
- ▮ b
```

</td></tr>
</table>

### [MoveSubtree23](../spec/move-subtree.md#movesubtree23)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1┃
- b
```

</td><td>

```buffer
- a
- b
  - ▮ a1
```

</td><td>

```buffer
- a
- b
  - a1┃
```

</td></tr>
</table>

### [Scenario5](../spec/scenarios.md#scenario5)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter indent "b" enter "c" enter outdent "d"

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

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- d
- a┃
  - b
  - c
```

</td></tr>
</table>

> undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - c
- d┃
```

</td><td>

```buffer
- a┃
  - b
  - c
- d
```

</td></tr>
</table>

### [Scenario8c](../spec/scenarios.md#scenario8c)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work┃
  - email
```

</td></tr>
</table>

> moveSubtree ②

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - ▮ Work
    - email
```

</td><td>

```buffer
- Inbox
  - Work┃
    - email
```

</td></tr>
</table>

> outdent

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- ▮ Work
  - email
```

</td><td>

```buffer
- Inbox
- Work┃
  - email
```

</td></tr>
</table>

### [Scenario11](../spec/scenarios.md#scenario11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃
- b
```

</td></tr>
</table>

> "more"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  more┃
- b
```

</td></tr>
</table>

> cursorLineBoundaryBackward deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃more
- b
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- amore┃b
```

</td></tr>
</table>

> undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃more
- b
```

</td><td>

```buffer
- amore┃
- b
```

</td></tr>
</table>

> redo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- amore┃b
```

</td></tr>
</table>

### [Undo1](../spec/undo.md#undo1)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

> indent undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

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

> redo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

## Adapted: disagree (88)

### [Enter50](../spec/enter.md#enter50)

> enter

Adapted: table

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td><td>

```buffer
¶ | a | b |
  | --- | --- |
  | on
¶ ┃e | 2 |
```

</td><td>

```buffer
¶ | a | b |
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

### [Enter51](../spec/enter.md#enter51)

Adapted: setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  ┃two
  three
```

</td></tr>
</table>

> enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  
  ¶ ┃two
    three
```

</td><td>

```buffer
¶ ## one
  ¶ ┃two
    three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  ┃two
  three
```

</td><td>

```buffer
¶ ## one┃two
  three
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  ┃two
  three
```

</td></tr>
</table>

> cursorLineBoundaryForward enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  
  ¶ ┃two
    three
```

</td><td>

```buffer
¶ ## one
  two
  ¶ ┃three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>undo undo</th><th>cursorLineBoundaryForward enter</th></tr>
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
one┃two
three
---
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

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ «ab»cd
```

</td><td>

```buffer
¶ 
¶ «ab»cd
```

</td><td>

```buffer
¶ ┃cd
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
«ab»cd
```

</td><td>

```buffer

┃cd
```

</td></tr>
</table>

### [Gap13](../spec/gaps.md#gap13)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t┃
¶ para
```

</td><td>

```buffer
- ta┃
¶ b
¶ 
¶ para
```

</td><td>

```buffer
- ta
- b┃
¶ para
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
- ta
- b┃

para
```

</td></tr>
</table>

### [Indent16](../spec/indent.md#indent16)

> indent

Adapted: setext heading

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title┃
  ¶ ## Sub
```

</td><td>

```buffer
¶ # Title┃
  ¶ ## Sub
```

</td><td>

```buffer
¶ ## Title┃
  ¶ ### Sub
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

### [Indent25](../spec/indent.md#indent25)

Adapted: setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃
  ¶ ### Sub
```

</td></tr>
</table>

> indent

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃
  ¶ ### Sub
```

</td><td>

```buffer
¶ ### Title┃
  ¶ #### Sub
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃
  ¶ ### Sub
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>indent</th><th>outdent</th></tr>
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

</td><td>

```buffer
## Title┃

### Sub
```

</td></tr>
</table>

### [Indent37](../spec/indent.md#indent37)

> indent

Adapted: thematic break

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ ---┃
```

</td><td>

```buffer
- a
- ---┃
```

</td><td>

```buffer
- a
¶ ---┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

---┃
```

</td><td>

```buffer
- a

---┃
```

</td></tr>
</table>

### [MoveSubtree21](../spec/move-subtree.md#movesubtree21)

> moveSubtree ①

Adapted: blank lines

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
1. a
2. b
```

</td><td>

```buffer
1. a
2. ▮ x
3. b
```

</td><td>

```buffer
1. a
- x┃
2. b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃①

1. a
▸
2. b
```

</td><td>

```buffer
1. a
- x┃①

2. b
```

</td></tr>
</table>

### [TO-Bug216](../spec/obsidian-true-outliner.md#to-bug216)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- a
	- b
		- c
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba┃
    - b
      - c
      - 
```

</td><td>

```buffer
- top
  - siba
    - b
      - c┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

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

</td></tr>
</table>

### [TO-Bug216b](../spec/obsidian-true-outliner.md#to-bug216b)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- a
  - b
    - c
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba┃
    - b
      - c
      - 
```

</td><td>

```buffer
- top
  - siba
    - b
      - c┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
→- sib┃
```

</td><td>

```buffer
- top
→- siba
→→- b
→→→- c┃
```

</td></tr>
</table>

### [Outdent13](../spec/outdent.md#outdent13)

Adapted: under outdent: logical

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

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - d
- b┃
  - c
```

</td></tr>
</table>

> indent

<table>
<tr><th>remnote</th><th>ourus</th></tr>
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
  - d
  - b┃
    - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>outdent</th><th>indent</th></tr>
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
  - d
- b┃
  - c
```

</td><td>

```buffer
- a
  - d
  - b┃
    - c
```

</td></tr>
</table>

### [Outdent21](../spec/outdent.md#outdent21)

> outdent

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
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
- ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- - ┃b
```

</td><td>

```buffer
- a
- ┃b
```

</td></tr>
</table>

### [PasteConvMD](../spec/paste-conv.md#pasteconvmd)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/markdown</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
¶ y
¶ 
- b
```

</td><td>

```buffer
- ax
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
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td></tr>
</table>

### [PasteConvHTML](../spec/paste-conv.md#pasteconvhtml)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```clipboard
<ul><li>x</li><li>y</li></ul>
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
¶ y
- b
```

</td><td>

```buffer
- ax
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
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td></tr>
</table>

### [PasteConvVSC](../spec/paste-conv.md#pasteconvvsc)

<table>
<tr><th colspan=3>clipboard</tr>
<tr><td>text/plain<td>text/html<td>vscode-editor-data</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```clipboard
<div style="white-space: pre;"><div><span style="color: #569cd6;">-</span><span> x</span></div><div><span style="color: #569cd6;">-</span><span> y</span></div></div>
```

</td><td>

```clipboard
{"version":1,"isFromEmptySelection":false,"mode":"markdown"}
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x┃
¶ - y
- b
```

</td><td>

```buffer
- ax
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
- a┃
- b
```

</td><td>

```buffer
- ax
- y┃
- b
```

</td></tr>
</table>

### [PasteConvUS](../spec/paste-conv.md#pasteconvus)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
- x _b_
- y
```

</td><td>

```clipboard
<!-- ourus --><ul>
<li>x <em>b</em></li>
<li>y</li>
</ul>
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax  *b*┃
¶ y
- b
```

</td><td>

```buffer
- ax _b_
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
- a┃
- b
```

</td><td>

```buffer
- ax _b_
- y┃
- b
```

</td></tr>
</table>

### [PasteHtml1](../spec/paste-html.md#pastehtml1)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
y
z
```

</td><td>

```clipboard
<ul><li>x<ul><li>y</li></ul></li><li>z</li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- x┃
  - y
¶ z
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

### [PasteHtml2](../spec/paste-html.md#pastehtml2)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
y
z
```

</td><td>

```clipboard
<ul>
<li>x
<ul>
<li>y</li>
</ul>
</li>
<li>z</li>
</ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- x┃
  - y
¶ z
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

### [PasteHtml3](../spec/paste-html.md#pastehtml3)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
- x **b**
	- y
- z
```

</td><td>

```clipboard
<ul><div xmlns="http://www.w3.org/1999/xhtml">This site uses XSLT; that functionality is being <a href="https://chromestatus.com/feature/4709671889534976">removed from this browser very soon</a>.</div>
  <li>x <b>b</b></li>
  <ul>
    <li>y</li>
  </ul>
  <li>z</li>
</ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).┃
  - x **b**
    - y
  - z
```

</td><td>

```buffer
- x **b**┃
  - y
- z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- x **b**┃
  - y
- z
```

</td></tr>
</table>

### [PasteHtml5](../spec/paste-html.md#pastehtml5)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
y
z
```

</td><td>

```clipboard
<ul><li><p class="bn-inline-content">x</p><ul><li data-nesting-level="1"><p class="bn-inline-content">y</p></li></ul></li><li><p class="bn-inline-content">z</p></li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- x┃
  - y
¶ z
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- x┃
  - y
- z
```

</td></tr>
</table>

### [PasteHtml6](../spec/paste-html.md#pastehtml6)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
- y
z
```

</td><td>

```clipboard
<html><body><p>x</p><ul><li><p>y</p></li></ul><p>z</p></body></html>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- x┃
  - y
¶ z
```

</td><td>

```buffer
¶ x┃
- y
¶ z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
x┃

- y

z
```

</td></tr>
</table>

### [PasteHtml7](../spec/paste-html.md#pastehtml7)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
c
d
```

</td><td>

```clipboard
<ol start="3"><li>c</li><li>d</li></ol>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
1. c┃
2. d
```

</td><td>

```buffer
3. c┃
4. d
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
3. c┃
4. d
```

</td></tr>
</table>

### [PasteHtml8](../spec/paste-html.md#pastehtml8)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
 done
 todo
```

</td><td>

```clipboard
<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" disabled="" class="task-list-item-checkbox" checked=""> done</li><li class="task-list-item"><input type="checkbox" disabled="" class="task-list-item-checkbox"> todo</li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, task, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ done┃
¶ todo
```

</td><td>

```buffer
- [x] done┃
- [ ] todo
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- [x] done┃
- [ ] todo
```

</td></tr>
</table>

### [PasteHtml9](../spec/paste-html.md#pastehtml9)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
let a = 1;
let b = 2;
```

</td><td>

```clipboard
<pre><code class="language-js">let a = 1;
let b = 2;
</code></pre>
```

</td></tr>
</table>

> paste

Adapted: code block, empty document

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```
  ┃let a = 1;
  let b = 2;
  ```
````

</td><td>

````buffer
¶ ```js
  let a = 1;
  let b = 2;┃
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
```js
let a = 1;
let b = 2;┃
```
````

</td></tr>
</table>

### [PasteHtml11](../spec/paste-html.md#pastehtml11)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
line one
line two

p2
```

</td><td>

```clipboard
<p>line one<br>line two</p><p>p2</p>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ line one┃
¶ line two
¶ p2
```

</td><td>

```buffer
¶ line one
  line two┃
¶ p2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
line one
line two┃

p2
```

</td></tr>
</table>

### [PasteHtml13](../spec/paste-html.md#pastehtml13)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
a	b
1	2
```

</td><td>

```clipboard
<table><thead><tr><th>a</th><th align="right">b</th></tr></thead><tbody><tr><td>1</td><td align="right">2</td></tr></tbody></table>
```

</td></tr>
</table>

> paste

Adapted: empty document, table

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ┃
- 
  - a
    - b
    - 1
      - ￼
```

</td><td>

```buffer
¶ | a | b |
  | --- | ---: |
  | 1 | 2 |┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
| a | b |
| --- | ---: |
| 1 | 2 |┃
```

</td></tr>
</table>

### [PasteHtml14](../spec/paste-html.md#pastehtml14)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
a b i c s l
z
```

</td><td>

```clipboard
<ul><li>a <strong>b</strong> <em>i</em> <code>c</code> <del>s</del> <a href="https://e.x/p">l</a></li><li>z</li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ a **b**  *i*  `c` ~~s~~ [l](https://e.x/p)┃
¶ z
```

</td><td>

```buffer
- a **b** *i* `c` ~~s~~ [l](https://e.x/p)┃
- z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- a **b** *i* `c` ~~s~~ [l](https://e.x/p)┃
- z
```

</td></tr>
</table>

### [PasteHtml15](../spec/paste-html.md#pastehtml15)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
1. not a list, *x* and [y]
# not a heading
```

</td><td>

```clipboard
<ul><li>1. not a list, *x* and [y]</li><li># not a heading</li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document, escape, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
1. not a list, *x* and [y]┃
¶ # not a heading
```

</td><td>

```buffer
- 1\. not a list, \*x\* and \[y\]┃
- # not a heading
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- 1\. not a list, \*x\* and \[y\]┃
- \# not a heading
```

</td></tr>
</table>

### [PasteHtml16](../spec/paste-html.md#pastehtml16)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Setup
npm install
```

</td><td>

```clipboard
<div class="markdown-heading"><h2 class="heading-element">Setup</h2><a class="anchor" aria-label="Permalink: Setup" href="#setup"><svg class="octicon octicon-link" viewBox="0 0 16 16"><path d="m7.775 3.275"></path></svg></a></div><div class="highlight highlight-source-shell"><pre>npm install</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn" value="npm install" role="button"><svg class="octicon octicon-copy"><path d="M0 6.75"></path></svg></clipboard-copy></div></div>
```

</td></tr>
</table>

> paste

Adapted: code block, empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ## Setup┃
  ¶ ```
    npm install
    ```
````

</td><td>

````buffer
¶ ## Setup┃
  ¶ ```shell
    npm install
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
## Setup┃

```shell
npm install
```
````

</td></tr>
</table>

### [PasteHtml17](../spec/paste-html.md#pastehtml17)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Bold start
nested
```

</td><td>

```clipboard
<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6a1b2c3d"><ul style="margin-top:0;"><li dir="ltr" aria-level="1"><p dir="ltr" role="presentation"><span style="font-weight:700;font-style:normal;">Bold</span><span style="font-weight:400;font-style:normal;"> start</span></p></li><ul style="margin-top:0;"><li dir="ltr" aria-level="2"><p dir="ltr" role="presentation"><span style="font-weight:400;font-style:italic;">nested</span></p></li></ul></ul></b>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- **Bold** start┃
  - nested
```

</td><td>

```buffer
- **Bold** start┃
  - *nested*
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- **Bold** start┃
  - *nested*
```

</td></tr>
</table>

### [PasteHtml18](../spec/paste-html.md#pastehtml18)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
·       one
o       nested
```

</td><td>

```clipboard
<html><body><!--StartFragment--><p class=MsoListParagraphCxSpFirst style='margin-left:.5in;text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>one<o:p></o:p></p>
<p class=MsoListParagraphCxSpLast style='margin-left:1.0in;text-indent:-.25in;mso-list:l0 level2 lfo1'><![if !supportLists]><span style='font-family:"Courier New"'><span style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>nested<o:p></o:p></p><!--EndFragment--></body></html>
```

</td></tr>
</table>

> paste

Adapted: empty document, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ·      one┃
  - o      nested
```

</td><td>

```buffer
- one┃
  - nested
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- one┃
  - nested
```

</td></tr>
</table>

### [PasteHtml19](../spec/paste-html.md#pastehtml19)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
javascript
Copy code
let a = 1;
```

</td><td>

```clipboard
<pre class="overflow-visible!"><div class="contain-inline-size"><div class="flex items-center">javascript</div><div class="sticky top-9"><button aria-label="Copy">Copy code</button></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-javascript"><span class="hljs-keyword">let</span> a = <span class="hljs-number">1</span>;</code></div></div></pre>
```

</td></tr>
</table>

> paste

Adapted: code block, empty document

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```
  ┃let a = 1;
  ```
````

</td><td>

````buffer
¶ ```javascript
  let a = 1;┃
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
```javascript
let a = 1;┃
```
````

</td></tr>
</table>

### [PasteListForm1](../spec/paste-list-form.md#pastelistform1)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td></tr>
</table>

> paste

Adapted: under pasteListForm: own, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
1. ax┃
2. y
- b
```

</td><td>

```buffer
- ax
2. y┃
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
- ax
2. y┃
- b
```

</td></tr>
</table>

### [PasteListForm2](../spec/paste-list-form.md#pastelistform2)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteListForm: own, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. ax┃
2. y
3. b
```

</td><td>

```buffer
1. ax
- y┃
2. b
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
1. ax
- y┃
2. b
```

</td></tr>
</table>

### [PasteListForm3](../spec/paste-list-form.md#pastelistform3)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
  1. x1
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax┃
  - 1\. x1
¶ y
```

</td><td>

```buffer
- ax
  1. x1
- y┃
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
  1. x1
- y┃
```

</td></tr>
</table>

### [PasteListForm4](../spec/paste-list-form.md#pastelistform4)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x

- y
```

</td></tr>
</table>

> paste

Adapted: blank lines, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
¶ 
¶ y
- b
```

</td><td>

```buffer
- ax
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
- a┃
- b
```

</td><td>

```buffer
- ax

- y┃
- b
```

</td></tr>
</table>

### [PasteListForm5](../spec/paste-list-form.md#pastelistform5)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: blank lines, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
¶ y
- b
```

</td><td>

```buffer
- ax
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
- a┃

- b
```

</td><td>

```buffer
- ax

- y┃

- b
```

</td></tr>
</table>

### [PasteList2](../spec/paste-list.md#pastelist2)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax┃b
¶ y
- c
```

</td><td>

```buffer
- ax
- y┃b
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
- y┃b
- c
```

</td></tr>
</table>

### [PasteList3](../spec/paste-list.md#pastelist3)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- x┃ab
¶ y
- c
```

</td><td>

```buffer
- x
- y┃ab
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- x
- y┃ab
- c
```

</td></tr>
</table>

### [PasteList4](../spec/paste-list.md#pastelist4)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- ax┃
  - kid
¶ y
```

</td><td>

```buffer
- ax
- y┃
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
- ax
- y┃
  - kid
```

</td></tr>
</table>

### [PasteList5](../spec/paste-list.md#pastelist5)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
- x┃
¶ y
- b
```

</td><td>

```buffer
- a
- x┃
- y
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
- ┃
- b
```

</td><td>

```buffer
- a
- x┃
- y
- b
```

</td></tr>
</table>

### [PasteList6](../spec/paste-list.md#pastelist6)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- x┃
  - kid
¶ y
```

</td><td>

```buffer
- 
  - x┃
  - y
  - kid
```

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

```buffer
- 
  - x┃
  - y
  - kid
```

</td></tr>
</table>

### [PasteList7](../spec/paste-list.md#pastelist7)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: task, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ] x┃
¶ y
```

</td><td>

```buffer
- [ ] x┃
- y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ] x┃
- y
```

</td></tr>
</table>

### [PasteList10](../spec/paste-list.md#pastelist10)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
Notes:
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- aNotes:┃
¶ x
¶ y
- b
```

</td><td>

```buffer
- aNotes:
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
- a┃
- b
```

</td><td>

```buffer
- aNotes:
- x
- y┃
- b
```

</td></tr>
</table>

### [PasteList11](../spec/paste-list.md#pastelist11)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
one
two

- x
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- aone┃
¶ two
¶ 
¶ x
```

</td><td>

```buffer
- aone
  two
- x┃
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
- aone
  two
- x┃
```

</td></tr>
</table>

### [PasteList12](../spec/paste-list.md#pastelist12)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ```
  ┃
  ```
- b
````

</td><td>

````buffer
- a
  ¶ ```
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
- a┃
- b
```

</td><td>

````buffer
- a
  ```
  c┃
  ```
- b
````

</td></tr>
</table>

### [PasteList13](../spec/paste-list.md#pastelist13)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
- x

```
c
```
````

</td></tr>
</table>

> paste

Adapted: code block, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ax┃
¶ 
¶ ```
  
  ```
- b
````

</td><td>

````buffer
- ax
  ¶ ```
    c┃
    ```
- 
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
- b
```

</td><td>

````buffer
- ax

  ```
  c┃
  ```
- 
- b
````

</td></tr>
</table>

### [PasteList14](../spec/paste-list.md#pastelist14)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- ```
  ┃
  ```
  - kid
````

</td><td>

````buffer
- a
  ¶ ```
    c┃
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
- a┃
  - kid
```

</td><td>

````buffer
- a
  ```
  c┃
  ```
  - kid
````

</td></tr>
</table>

### [PasteList15](../spec/paste-list.md#pastelist15)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ```
  ┃
  ```
- b
````

</td><td>

````buffer
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
- ┃
- b
```

</td><td>

````buffer
- ```
  c┃
  ```
- b
````

</td></tr>
</table>

### [PasteList16](../spec/paste-list.md#pastelist16)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
# h
text
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- # a h┃
¶ text
- b
```

</td><td>

```buffer
- ah
  
  text┃
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
- ah

  text┃
- b
```

</td></tr>
</table>

### [PasteList24](../spec/paste-list.md#pastelist24)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
- x

  ```
  c
  ```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- d
```

</td><td>

````buffer
- ax┃b
- 
  - ```
    
    ```
- d
````

</td><td>

````buffer
- ax
  ¶ ```
    c┃
    ```
- b
- d
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- d
```

</td><td>

````buffer
- ax

  ```
  c┃
  ```
- b
- d
````

</td></tr>
</table>

### [PasteList26](../spec/paste-list.md#pastelist26)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
- ```
  code
  ```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a```┃
  - code
  - ```
  - 
- b
````

</td><td>

````buffer
- a
- ```
  code┃
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
- a┃
- b
```

</td><td>

````buffer
- a
- ```
  code┃
  ```
- b
````

</td></tr>
</table>

### [PasteList27](../spec/paste-list.md#pastelist27)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
- ```
  code
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a```┃
  - code
- b
````

</td><td>

````buffer
- a
- ```
  code┃
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
- a┃
- b
```

</td><td>

````buffer
- a
- ```
  code┃
  ```
- b
````

</td></tr>
</table>

### [PastePlain5](../spec/paste-plain.md#pasteplain5)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax┃b
¶ y
¶ 
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

### [PastePlain7](../spec/paste-plain.md#pasteplain7)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
$$
x^2
$$
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a$$x^2$$┃b
¶ 
¶ 
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

### [PastePlain8](../spec/paste-plain.md#pasteplain8)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃words
```

</td><td>

```buffer
¶ a┃words
¶ b
```

</td><td>

```buffer
¶ - a
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

### [PastePlain11](../spec/paste-plain.md#pasteplain11)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]: ┃b c
```

</td><td>

```buffer
¶ [a]: x┃b c
¶ 
```

</td><td>

```buffer
¶ [a]: x
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
[a]\: x
┃b c
```

</td></tr>
</table>

### [PastePlain13](../spec/paste-plain.md#pasteplain13)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃ ---
```

</td><td>

```buffer
¶ px┃ ---
¶ 
```

</td><td>

```buffer
¶ px
  ┃ ---
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
┃ \---
```

</td></tr>
</table>

### [PastePlain17](../spec/paste-plain.md#pasteplain17)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- ax┃f
¶ y
```

</td><td>

```buffer
- ax
  \- y┃f
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- ax
  \- y┃f
```

</td></tr>
</table>

### [PastePlain23](../spec/paste-plain.md#pasteplain23)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td></tr>
</table>

> pastePlain

Adapted: setext heading

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃more
```

</td><td>

```buffer
¶ ## Titlex┃more
  ¶ y
```

</td><td>

```buffer
¶ ## Titlex
  y┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃more
---
```

</td><td>

```buffer
Titlex
y┃more
---
```

</td></tr>
</table>

### [PastePlain30](../spec/paste-plain.md#pasteplain30)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
a
  b
```

</td></tr>
</table>

> pastePlain

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶   ```
    ┃
    ```
````

</td><td>

````buffer
-   ```
    a┃
    ```
  - b
````

</td><td>

````buffer
¶   ```
    a
      b┃
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
  ┃
  ```
````

</td><td>

````buffer
  ```
  a
    b┃
  ```
````

</td></tr>
</table>

### [Paste3](../spec/paste.md#paste3)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Notes┃
¶ more
```

</td><td>

```buffer
¶ Notesx┃
¶ y
¶ more
```

</td><td>

```buffer
¶ Notesx
- y┃
¶ more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃

more
```

</td><td>

```buffer
Notesx
- y┃

more
```

</td></tr>
</table>

### [Paste4](../spec/paste.md#paste4)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: blank lines, under listParent: container, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Notes┃
- z
```

</td><td>

```buffer
¶ Notesx┃
¶ y
- z
```

</td><td>

```buffer
¶ Notesx
- y┃
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

- z
```

</td><td>

```buffer
Notesx
- y┃

- z
```

</td></tr>
</table>

### [Paste5](../spec/paste.md#paste5)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ See ┃here.
```

</td><td>

```buffer
¶ See x┃here.
¶ y
```

</td><td>

```buffer
¶ See x
- y┃here.
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
- y┃here.
```

</td></tr>
</table>

### [Paste6](../spec/paste.md#paste6)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  - z
```

</td><td>

```buffer
¶ # Tx┃
  ¶ y
  - z
```

</td><td>

```buffer
¶ # T
  - x┃
  - y
  - z
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T┃

- z
```

</td><td>

```buffer
# T

- x┃
- y
- z
```

</td></tr>
</table>

### [Paste7](../spec/paste.md#paste7)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td></tr>
</table>

> paste

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
¶ q
```

</td><td>

````buffer
¶ ```
  ┃
  ```
¶ q
````

</td><td>

````buffer
¶ p
¶ ```
  c┃
  ```
¶ q
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃

q
```

</td><td>

````buffer
p

```
c┃
```

q
````

</td></tr>
</table>

### [Paste8](../spec/paste.md#paste8)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: blank lines, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  p┃
- b
```

</td><td>

```buffer
- a
  
  px┃
¶ y
- b
```

</td><td>

```buffer
- a
  
  px
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
- a

  p┃

- b
```

</td><td>

```buffer
- a

  px
  - y┃

- b
```

</td></tr>
</table>

### [Paste10](../spec/paste.md#paste10)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
## h
text
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ p┃
  ¶ q
  ¶ ## B
    ¶ r
```

</td><td>

```buffer
¶ # A
  ¶ ## p h┃
    ¶ text
    ¶ q
  ¶ ## B
    ¶ r
```

</td><td>

```buffer
¶ # A
  ¶ ph
  ¶ text┃
  ¶ q
  ¶ ## B
    ¶ r
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

p┃

q

## B

r
```

</td><td>

```buffer
# A

ph

text┃

q

## B

r
```

</td></tr>
</table>

### [Paste11](../spec/paste.md#paste11)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
## h
text
```

</td></tr>
</table>

> paste

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
¶ ## B
```

</td><td>

```buffer
¶ ## A h┃
  ¶ text
  ¶ p
¶ ## B
```

</td><td>

```buffer
¶ ## A
¶ ## h┃
  ¶ text
  ¶ p
¶ ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃

p

## B
```

</td><td>

```buffer
## A

## h┃
text

p

## B
```

</td></tr>
</table>

### [Paste12](../spec/paste.md#paste12)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
### h
text
```

</td></tr>
</table>

> paste

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
```

</td><td>

```buffer
¶ ### A h┃
  ¶ text
  ¶ p
```

</td><td>

```buffer
¶ ## A
  ¶ ### h┃
    ¶ text
    ¶ p
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃

p
```

</td><td>

```buffer
## A

### h┃
text

p
```

</td></tr>
</table>

### [Paste17](../spec/paste.md#paste17)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- ax┃d
¶ y
- e
```

</td><td>

```buffer
- ax
- y┃d
- e
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- ax
- y┃d
- e
```

</td></tr>
</table>

### [Paste22](../spec/paste.md#paste22)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x

# h
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A
  ¶ p┃
  ¶ q
¶ ## B
```

</td><td>

```buffer
¶ ## A
  ¶ px┃
  ¶ 
¶ # h
  ¶ q
  ¶ ## B
```

</td><td>

```buffer
¶ ## A
  ¶ px
¶ # h┃
  ¶ q
  ¶ ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A

p┃

q

## B
```

</td><td>

```buffer
## A

px

# h┃
q

## B
```

</td></tr>
</table>

### [Paste26](../spec/paste.md#paste26)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td></tr>
</table>

> shiftEnter paste

Adapted: under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ p
  a┃
¶ b
```

</td><td>

```buffer
¶ p
  a
- b┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃
```

</td><td>

```buffer
p
a
- b┃
```

</td></tr>
</table>

### [Regression14](../spec/regressions.md#regression14)

> outdent

Adapted: under listParent: container, under outdent: logical

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- b┃
  - c
- d
```

</td><td>

```buffer
¶ para
- b┃
- c
- d
```

</td><td>

```buffer
¶ para
¶ b┃
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
para
  - b┃
    - c
  - d
```

</td><td>

```buffer
para

b┃
  - c
  - d
```

</td></tr>
</table>

### [Regression35](../spec/regressions.md#regression35)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x

[a]: /u
```

</td></tr>
</table>

> paste

Adapted: blank lines, link reference definition, under pasteSeams: open, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  - 
¶ para
```

</td><td>

```buffer
- foox┃
  - 
¶ 
¶ [a]: /u
¶ para
```

</td><td>

```buffer
- foox
  ¶ [a]: /u┃
- 
  - 
¶ para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃

  - 

para
```

</td><td>

```buffer
- foox

  [a]: /u┃
- ◌

  - 

para
```

</td></tr>
</table>

### [Regression63](../spec/regressions.md#regression63)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
```

</td></tr>
</table>

> paste

Adapted: under pasteListForm: own

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
1. «x»
2. b
```

</td><td>

```buffer
- a
1. x┃
2. 
3. b
```

</td><td>

```buffer
- a
1. «x»
2. b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
1. «x»
  1. b
```

</td><td>

```buffer
- a
1. «x»
  1. b
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under enterAtTextStart: stay

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- ┃and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk ┃and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 
- today:┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- today:buy milk and eggs
- call A┃
```

</td><td>

```buffer
- 
- today:buy milk and eggs
- call An┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- today:buy milk and eggs┃call A
```

</td><td>

```buffer
- 
- today:buy milk and eggs┃call An
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward " "</th><th>cursorLineBoundaryBackward</th><th>enter "today:"</th><th>cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward</th><th>cursorLineUp cursorLineBoundaryForward deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- buy milk┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk
- ┃and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:┃buy milk and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:buy milk and eggs
- call An┃
```

</td><td>

```buffer
- 
- today:buy milk and eggs┃call An
```

</td></tr>
</table>

### [Scenario18](../spec/scenarios.md#scenario18)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td></tr>
</table>

> paste "!"

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- ```
  code!┃
  ```
¶ 
- next
````

</td><td>

````buffer
- example
  ¶ ```
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
- example┃
- next
```

</td><td>

````buffer
- example
  ```
  code!┃
  ```
- next
````

</td></tr>
</table>

### [Scenario23](../spec/scenarios.md#scenario23)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan┃2. draft
```

</td></tr>
</table>

> enter "revise "

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  ¶ revise ┃2. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  ¶ revise 
    ┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  ¶ revis┃2. draft
```

</td><td>

```buffer
¶ # Plan┃2. draft
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

### [ShiftEnter24](../spec/shift-enter.md#shiftenter24)

> shiftEnter

Adapted: table

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ | a | b |
  | --- | --- |
  | on┃e | 2 |
```

</td><td>

```buffer
¶ | a | b |
  | --- | --- |
  | on
  ┃e | 2 |
```

</td><td>

```buffer
¶ | a | b |
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

### [ShiftEnter25](../spec/shift-enter.md#shiftenter25)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
  ┃[r]: /u
```

</td><td>

```buffer
¶ p
  
  ┃[r]: /u
```

</td><td>

```buffer
¶ p
¶ ┃[r]: /u
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

┃[r]\: /u
```

</td></tr>
</table>

### [Typing1](../spec/typing.md#typing1)

> "---"

Adapted: setext heading

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ┃
```

</td><td>

```buffer
¶ para
  ‒-┃
```

</td><td>

```buffer
¶ ## para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃
```

</td><td>

```buffer
para
---┃
```

</td></tr>
</table>

### [Typing2](../spec/typing.md#typing2)

> deleteContentBackward

Adapted: setext heading

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ---x┃
```

</td><td>

```buffer
¶ para
  ---┃
```

</td><td>

```buffer
¶ ## para
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

## Adapted: whitespace (13)

### [Backspace17e](../spec/backspace.md#backspace17e)

> deleteContentBackward

Adapted: empty document

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer

```

</td><td>

```buffer
¶ ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
┃
```

</td></tr>
</table>

### [Enter33](../spec/enter.md#enter33)

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ ┃hello
```

</td></tr>
</table>

> enter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ 
¶ ┃hello
```

</td><td>

```buffer
¶ intro
¶ ┃hello
```

</td></tr>
</table>

> "x"

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ 
¶ x┃hello
```

</td><td>

```buffer
¶ intro
¶ x┃hello
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


┃hello
```

</td><td>

```buffer
intro


x┃hello
```

</td></tr>
</table>

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  ┃two
¶ ## three
```

</td><td>

```buffer
¶ ## one
  
  ¶ ┃two
¶ ## three
```

</td><td>

```buffer
¶ ## one
  ¶ ┃two
¶ ## three
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

### [Fence5](../spec/fences.md#fence5)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  code┃
  ```
````

</td><td>

````buffer
- ```
  code
  ┃ 
  ```
````

</td><td>

````buffer
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
- ```
  code┃
  ```
````

</td><td>

````buffer
- ```
  code
  ┃
  ```
````

</td></tr>
</table>

### [Fold14](../spec/fold.md#fold14)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- ax┃
  - b
¶ 
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- ax┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃①
  - b
- c
```

</td><td>

```buffer
- ax┃
  - b
- c
```

</td></tr>
</table>

### [TO8](../spec/obsidian-true-outliner.md#to8)

Adapted: blank lines

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
<tr><th>remnote</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>shiftEnter indent</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

```buffer
- one
  - kid
  - foo
    ┃
```

</td><td>

```buffer
┃- one
  - kid
  - foo
    
```

</td></tr>
</table>

### [TO9](../spec/obsidian-true-outliner.md#to9)

> shiftEnter indent indent cursorDocStart

Adapted: blank lines

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

```buffer
┃- one
  - kid
  - sib
    - foo
      
```

</td></tr>
</table>

### [PasteList8](../spec/paste-list.md#pastelist8)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
¶ 
- b
```

</td><td>

```buffer
- ax┃
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
- ax┃
- b
```

</td></tr>
</table>

### [PastePlain12](../spec/paste-plain.md#pasteplain12)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x

[a]: /u
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px┃
¶ 
¶ [a]: /u
```

</td><td>

```buffer
¶ px
¶ [a]: /u┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃
```

</td><td>

```buffer
px

[a]\: /u┃
```

</td></tr>
</table>

### [Paste13](../spec/paste.md#paste13)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
```

</td></tr>
</table>

> paste

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
  ┃
¶ b
```

</td><td>

```buffer
¶ a
  x┃
¶ 
¶ b
```

</td><td>

```buffer
¶ a
  x┃
¶ b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
┃

b
```

</td><td>

```buffer
a
x┃

b
```

</td></tr>
</table>

### [Placeholder19](../spec/placeholders.md#placeholder19)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
¶ para
  a┃ ``` x
¶ after
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
¶ para
  ┃ ``` x
¶ after
````

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ para
   ``` x
¶ after┃
````

</td><td>

````buffer
¶ para
  ``` x
¶ after
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorDocEnd</th></tr>
<tr valign="top"><td>

````buffer
para
a┃ ``` x

after
````

</td><td>

````buffer
para
┃◌ ``` x

after
````

</td><td>

````buffer
para
\``` x

after
````

</td></tr>
</table>

### [ShiftEnter30](../spec/shift-enter.md#shiftenter30)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- ┃a ``` x
````

</td></tr>
</table>

> deleteContentForward cursorCharRight

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
-  ┃``` x
````

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  
  ┃``` x
````

</td><td>

````buffer
- 
  ┃``` x
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward cursorCharRight</th><th>shiftEnter</th></tr>
<tr valign="top"><td>

````buffer
- ┃a ``` x
````

</td><td>

````buffer
- ◌ ┃``` x
````

</td><td>

````buffer
-
  ┃\``` x
````

</td></tr>
</table>

### [ShiftEnter32](../spec/shift-enter.md#shiftenter32)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃ # b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃ # b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃ # b
```

</td><td>

```buffer
- 
  ┃\# b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>shiftEnter</th></tr>
<tr valign="top"><td>

```buffer
- a┃ # b
```

</td><td>

```buffer
- ┃◌ # b
```

</td><td>

```buffer
-
  ┃\# b
```

</td></tr>
</table>

## Adapted: caret (4)

### [MoveSubtree12](../spec/move-subtree.md#movesubtree12)

> moveSubtree ②

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
¶ p
```

</td><td>

```buffer
¶ p
- ▮ x
```

</td><td>

```buffer
¶ p
- x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃②

p
▸
```

</td><td>

```buffer
p

- x┃
```

</td></tr>
</table>

### [MoveSubtree24](../spec/move-subtree.md#movesubtree24)

> moveSubtree ①

Adapted: blank lines

<table>
<tr><th>buffer</th><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
- c
```

</td><td>

```buffer
- b
- c
- ▮ a
```

</td><td>

```buffer
- b
- c
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃①

- b

- c
▸
```

</td><td>

```buffer
- b

- c

- a┃①
```

</td></tr>
</table>

### [Scenario16](../spec/scenarios.md#scenario16)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
¶ # Home
  - [x] ┃review
  - water
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
  - [x] ┃review
¶ # Home
  - water
```

</td></tr>
</table>

> undo

<table>
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
¶ # Home
  - [x] review
  - water
```

</td><td>

```buffer
¶ # Work
  - email
¶ # Home
  - [x] ┃review
  - water
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>undo</th></tr>
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

# Home
- [x] ┃review
- water
```

</td></tr>
</table>

### [Undo3](../spec/undo.md#undo3)

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
<tr><th>remnote</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
- ┃
```

</td><td>

```buffer
- a┃
- 
```

</td></tr>
</table>

## Skipped (624)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | tag markup-heading |
| [Backspace12c](../spec/backspace.md#backspace12c) | changes only what blocks can't show |
| [Backspace16](../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18](../spec/backspace.md#backspace18) | tag markup-heading |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag markup-heading |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag markup-heading |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag markup-heading |
| [Backspace18e](../spec/backspace.md#backspace18e) | tag markup-heading |
| [Backspace18f](../spec/backspace.md#backspace18f) | tag markup-heading |
| [Backspace18g](../spec/backspace.md#backspace18g) | tag markup-heading |
| [Backspace24](../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace27](../spec/backspace.md#backspace27) | quote |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace35](../spec/backspace.md#backspace35) | tag markup-heading |
| [Backspace40](../spec/backspace.md#backspace40) | numbered list that RemNote would number otherwise |
| [Backspace40b](../spec/backspace.md#backspace40b) | numbered list that RemNote would number otherwise |
| [SoftBackspace1](../spec/backspace.md#softbackspace1) | tag markup-task |
| [SoftBackspace3](../spec/backspace.md#softbackspace3) | tag markup-heading |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | tag markup-heading |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | tag markup-heading |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | option quotes: container |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag markup-task |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | tag markup-fence |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | tag markup-task |
| [Backspace42](../spec/backspace.md#backspace42) | caret in a marker |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43](../spec/backspace.md#backspace43) | changes only what blocks can't show |
| [Backspace43c](../spec/backspace.md#backspace43c) | changes only what blocks can't show |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| [Backspace45c](../spec/backspace.md#backspace45c) | option joinWithChildren: refuse |
| [Backspace50](../spec/backspace.md#backspace50) | option backspaceAtItemStart: body |
| [Backspace50b](../spec/backspace.md#backspace50b) | option backspaceAtItemStart: unwrap |
| **backtick.md** | |
| [Backtick1](../spec/backtick.md#backtick1) | tag markup-fence |
| [Backtick2](../spec/backtick.md#backtick2) | tag markup-fence |
| [Backtick2b](../spec/backtick.md#backtick2b) | tag markup-fence |
| [Backtick3](../spec/backtick.md#backtick3) | tag markup-fence |
| [Backtick4](../spec/backtick.md#backtick4) | tag markup-fence |
| [Backtick5](../spec/backtick.md#backtick5) | tag markup-fence |
| [Backtick6](../spec/backtick.md#backtick6) | tag markup-fence |
| [Backtick7](../spec/backtick.md#backtick7) | tag markup-fence |
| [Backtick8](../spec/backtick.md#backtick8) | tag markup-fence |
| [Backtick9](../spec/backtick.md#backtick9) | tag markup-fence |
| [Backtick10](../spec/backtick.md#backtick10) | tag markup-fence |
| [Backtick11](../spec/backtick.md#backtick11) | tag markup-fence |
| [Backtick12](../spec/backtick.md#backtick12) | tag markup-fence |
| [Backtick13](../spec/backtick.md#backtick13) | tag markup-fence |
| [Backtick14](../spec/backtick.md#backtick14) | tag markup-fence |
| [Backtick15](../spec/backtick.md#backtick15) | tag markup-fence |
| [Backtick16](../spec/backtick.md#backtick16) | tag markup-fence |
| [Backtick17](../spec/backtick.md#backtick17) | tag markup-fence |
| [Backtick19](../spec/backtick.md#backtick19) | option closeBackticks: all |
| [Backtick20](../spec/backtick.md#backtick20) | option closeBackticks: all |
| [Backtick21](../spec/backtick.md#backtick21) | option closeBackticks: all |
| [Backtick22](../spec/backtick.md#backtick22) | tag markup-fence |
| [Backtick23](../spec/backtick.md#backtick23) | tag markup-fence |
| [Backtick24](../spec/backtick.md#backtick24) | tag markup-fence |
| [Backtick25](../spec/backtick.md#backtick25) | tag markup-fence |
| [Backtick26](../spec/backtick.md#backtick26) | tag markup-fence |
| [Backtick27](../spec/backtick.md#backtick27) | tag markup-fence |
| [Backtick28](../spec/backtick.md#backtick28) | tag markup-fence |
| [Backtick29](../spec/backtick.md#backtick29) | tag markup-fence |
| [Backtick30](../spec/backtick.md#backtick30) | tag markup-fence |
| [Backtick31](../spec/backtick.md#backtick31) | tag markup-fence |
| [Backtick32](../spec/backtick.md#backtick32) | option closeBackticks: all |
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy3](../spec/copy.md#copy3) | quote |
| [Copy4](../spec/copy.md#copy4) | nothing to compare |
| [Copy5](../spec/copy.md#copy5) | selection across blocks |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | selection across blocks |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Copy9](../spec/copy.md#copy9) | nothing to compare |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | selection across blocks |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | numbered list that RemNote would number otherwise |
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | paragraph inside an item (a rem there shows a bullet) |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | quote |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | tag markup-heading |
| [Delete4b](../spec/delete.md#delete4b) | tag markup-heading |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete5f](../spec/delete.md#delete5f) | option emptyItemWithChildren: refuse |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
| [Delete11](../spec/delete.md#delete11) | tag markup-fence |
| [Delete13](../spec/delete.md#delete13) | tag markup-heading |
| [Delete13b](../spec/delete.md#delete13b) | tag markup-heading |
| [Delete13c](../spec/delete.md#delete13c) | tag markup-heading |
| [Delete13d](../spec/delete.md#delete13d) | tag markup-heading |
| [Delete13e](../spec/delete.md#delete13e) | tag markup-heading |
| [Delete13f](../spec/delete.md#delete13f) | tag markup-heading |
| [Delete13g](../spec/delete.md#delete13g) | tag markup-heading |
| [Delete14](../spec/delete.md#delete14) | tag markup-heading |
| [Delete15](../spec/delete.md#delete15) | tag markup-heading |
| [Delete16](../spec/delete.md#delete16) | option markup: decorated |
| [Delete16b](../spec/delete.md#delete16b) | option markup: decorated |
| [Delete16c](../spec/delete.md#delete16c) | option markup: decorated |
| [Delete16d](../spec/delete.md#delete16d) | option markup: decorated |
| [Delete16e](../spec/delete.md#delete16e) | option markup: decorated |
| [Delete16f](../spec/delete.md#delete16f) | option markup: decorated |
| [Delete18c](../spec/delete.md#delete18c) | changes only what blocks can't show |
| [Delete18d](../spec/delete.md#delete18d) | changes only what blocks can't show |
| [Delete19](../spec/delete.md#delete19) | tag markup-task |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | caret in a marker |
| [Delete24](../spec/delete.md#delete24) | caret in a marker |
| [Delete25](../spec/delete.md#delete25) | caret in a marker |
| [Delete29](../spec/delete.md#delete29) | caret in a marker |
| [Delete31b](../spec/delete.md#delete31b) | option joinWithChildren: refuse |
| [Delete34](../spec/delete.md#delete34) | option quotes: container |
| **drag.md** | |
| [Drag1](../spec/drag.md#drag1) | action drag ② |
| [Drag2](../spec/drag.md#drag2) | action drag ② |
| [Drag3](../spec/drag.md#drag3) | action drag ④ |
| [Drag4](../spec/drag.md#drag4) | action drag ② |
| [Drag5](../spec/drag.md#drag5) | action drag ② |
| [Drag6](../spec/drag.md#drag6) | action drag ③ |
| [Drag7](../spec/drag.md#drag7) | action drag ③ |
| [Drag8](../spec/drag.md#drag8) | action drag ③ |
| **duplicate-subtree.md** | |
| [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1) | action duplicateSubtree |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action duplicateSubtree |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | action duplicateSubtree |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | action duplicateSubtree |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | option quotes: container |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | action duplicateSubtree |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | tag markup-fence |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | tag markup-fence |
| [DuplicateSubtree10](../spec/duplicate-subtree.md#duplicatesubtree10) | action duplicateSubtree |
| **enter.md** | |
| [Enter3c](../spec/enter.md#enter3c) | numbered list that RemNote would number otherwise |
| [Enter7b](../spec/enter.md#enter7b) | option enterOnEmptyItem: outdent |
| [Enter7c](../spec/enter.md#enter7c) | option enterOnEmptyItem: unwrap |
| [Enter15b](../spec/enter.md#enter15b) | option enterOnEmptyItem: outdent |
| [Enter21b](../spec/enter.md#enter21b) | option enterOnEmptyItem: unwrap |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter25](../spec/enter.md#enter25) | numbered list that RemNote would number otherwise |
| [Enter27b](../spec/enter.md#enter27b) | option enterOnEmptyItem: unwrap |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32](../spec/enter.md#enter32) | tag markup-heading |
| [Enter32b](../spec/enter.md#enter32b) | tag markup-heading |
| [Enter33b](../spec/enter.md#enter33b) | changes only what blocks can't show |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter65](../spec/enter.md#enter65) | option enterSplitSpace: start |
| [Enter65b](../spec/enter.md#enter65b) | option enterSplitSpace: start |
| [Enter65c](../spec/enter.md#enter65c) | option enterSplitSpace: start |
| [Enter65d](../spec/enter.md#enter65d) | option enterSplitSpace: start |
| [Enter65e](../spec/enter.md#enter65e) | option enterSplitSpace: start |
| [Enter65f](../spec/enter.md#enter65f) | option enterSplitSpace: start |
| [Enter65g](../spec/enter.md#enter65g) | tag markup-task |
| [Enter65h](../spec/enter.md#enter65h) | option enterSplitSpace: start |
| [Enter65i](../spec/enter.md#enter65i) | option enterSplitSpace: start |
| [Enter65j](../spec/enter.md#enter65j) | option enterSplitSpace: start |
| [Enter65k](../spec/enter.md#enter65k) | option enterSplitSpace: start |
| [Enter65l](../spec/enter.md#enter65l) | tag markup-heading |
| [Enter65m](../spec/enter.md#enter65m) | tag markup-heading |
| [Enter45](../spec/enter.md#enter45) | tag markup-heading |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter54](../spec/enter.md#enter54) | tag markup-task |
| [Enter54b](../spec/enter.md#enter54b) | tag markup-task |
| [Enter55](../spec/enter.md#enter55) | tag markup-heading |
| [Enter55b](../spec/enter.md#enter55b) | tag markup-heading |
| [Enter55c](../spec/enter.md#enter55c) | tag markup-heading |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter60](../spec/enter.md#enter60) | tag markup-heading |
| [Enter60b](../spec/enter.md#enter60b) | tag markup-heading |
| [Enter61](../spec/enter.md#enter61) | tag markup-heading |
| [Enter68](../spec/enter.md#enter68) | callout |
| **fences.md** | |
| [Fence1](../spec/fences.md#fence1) | paragraph inside an item (a rem there shows a bullet) |
| [Fence3](../spec/fences.md#fence3) | paragraph inside an item (a rem there shows a bullet) |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence6](../spec/fences.md#fence6) | tag markup-fence |
| [Fence7](../spec/fences.md#fence7) | tag markup-fence |
| [Fence7b](../spec/fences.md#fence7b) | tag markup-fence |
| [Fence7c](../spec/fences.md#fence7c) | tag markup-fence |
| [Fence7d](../spec/fences.md#fence7d) | tag markup-fence |
| [Fence8](../spec/fences.md#fence8) | paragraph inside an item (a rem there shows a bullet) |
| [Fence9](../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../spec/fences.md#fence15) | tag markup-fence |
| [Fence16](../spec/fences.md#fence16) | paragraph inside an item (a rem there shows a bullet) |
| [Fence17](../spec/fences.md#fence17) | tag markup-fence |
| [Fence18](../spec/fences.md#fence18) | paragraph inside an item (a rem there shows a bullet) |
| [Fence19](../spec/fences.md#fence19) | tag markup-fence |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | paragraph inside an item (a rem there shows a bullet) |
| [Fence22](../spec/fences.md#fence22) | tag markup-fence |
| [Fence23](../spec/fences.md#fence23) | tag markup-fence |
| [Fence24](../spec/fences.md#fence24) | tag markup-fence |
| [Fence25](../spec/fences.md#fence25) | tag markup-fence |
| [Fence26](../spec/fences.md#fence26) | tag markup-fence |
| [Fence27](../spec/fences.md#fence27) | tag markup-fence |
| [Fence28](../spec/fences.md#fence28) | tag markup-fence |
| [Fence29](../spec/fences.md#fence29) | tag markup-fence |
| [Fence30](../spec/fences.md#fence30) | tag markup-fence |
| [Fence31](../spec/fences.md#fence31) | tag markup-fence |
| [Fence31b](../spec/fences.md#fence31b) | tag markup-fence |
| [Fence32](../spec/fences.md#fence32) | tag markup-fence |
| [Fence32b](../spec/fences.md#fence32b) | tag markup-fence |
| [Fence33](../spec/fences.md#fence33) | tag markup-fence |
| [Fence34](../spec/fences.md#fence34) | tag markup-fence |
| [Fence35](../spec/fences.md#fence35) | tag markup-fence |
| [Fence36](../spec/fences.md#fence36) | tag markup-fence |
| [Fence37](../spec/fences.md#fence37) | tag markup-fence |
| [Fence38](../spec/fences.md#fence38) | tag markup-fence |
| [Fence39](../spec/fences.md#fence39) | tag markup-fence |
| [Fence40](../spec/fences.md#fence40) | tag markup-fence |
| [Fence41](../spec/fences.md#fence41) | tag markup-fence |
| [Fence48](../spec/fences.md#fence48) | paragraph inside an item (a rem there shows a bullet) |
| [Fence49](../spec/fences.md#fence49) | tag markup-fence |
| [Fence50](../spec/fences.md#fence50) | tag markup-fence |
| [Fence51](../spec/fences.md#fence51) | tag markup-fence |
| [Fence58](../spec/fences.md#fence58) | tag markup-fence |
| [Fence59](../spec/fences.md#fence59) | tag markup-fence |
| [Fence59b](../spec/fences.md#fence59b) | tag markup-fence |
| [Fence60](../spec/fences.md#fence60) | tag markup-fence |
| [Fence42](../spec/fences.md#fence42) | paragraph inside an item (a rem there shows a bullet) |
| [Fence43](../spec/fences.md#fence43) | quote |
| [Fence44](../spec/fences.md#fence44) | indented code |
| [Fence45](../spec/fences.md#fence45) | tag markup-fence |
| [Fence46](../spec/fences.md#fence46) | quote |
| [Fence47](../spec/fences.md#fence47) | tag markup-fence |
| [Fence52](../spec/fences.md#fence52) | indented code |
| [Fence53](../spec/fences.md#fence53) | indented code |
| [Fence54](../spec/fences.md#fence54) | indented code |
| [Fence55](../spec/fences.md#fence55) | tag markup-fence |
| [Fence56](../spec/fences.md#fence56) | tag markup-fence |
| [Fence57](../spec/fences.md#fence57) | tag markup-fence |
| [Fence61](../spec/fences.md#fence61) | tag markup-fence |
| [Fence62](../spec/fences.md#fence62) | code block's fences other than the shortest backticks that hold its code, which a code rem reads back with (it keeps no fences) |
| [Fence63](../spec/fences.md#fence63) | tag markup-fence |
| [Fence64](../spec/fences.md#fence64) | tag markup-fence |
| **fold.md** | |
| [Fold8](../spec/fold.md#fold8) | action duplicateSubtree |
| [Fold9](../spec/fold.md#fold9) | action fold ② |
| [Fold10](../spec/fold.md#fold10) | action fold ① |
| [Fold11](../spec/fold.md#fold11) | action toggleFold |
| [Fold13](../spec/fold.md#fold13) | a fold on a rem without a bullet |
| **gaps.md** | |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent13](../spec/indent.md#indent13) | paragraph inside an item (a rem there shows a bullet) |
| [Indent20](../spec/indent.md#indent20) | paragraph inside an item (a rem there shows a bullet) |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent34](../spec/indent.md#indent34) | code block's language |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| **lists.md** | |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| [Lists11](../spec/lists.md#lists11) | quote |
| [Lists12](../spec/lists.md#lists12) | quote |
| **move-subtree-down.md** | |
| [MoveDown21](../spec/move-subtree-down.md#movedown21) | paragraph inside an item (a rem there shows a bullet) |
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | numbered list that RemNote would number otherwise |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | numbered list that RemNote would number otherwise |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown36](../spec/move-subtree-down.md#movedown36) | paragraph inside an item (a rem there shows a bullet) |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | caret on a blank line |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | numbered list that RemNote would number otherwise |
| **move-subtree-up.md** | |
| [MoveUp13](../spec/move-subtree-up.md#moveup13) | paragraph inside an item (a rem there shows a bullet) |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | numbered list that RemNote would number otherwise |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | option quotes: container |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret in a marker |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | quote |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| **move-subtree.md** | |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | changes only what blocks can't show |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | changes only what blocks can't show |
| [MoveSubtree9](../spec/move-subtree.md#movesubtree9) | drop: the pressed rem has no bullet: RemNote drags a rem by its bullet |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | nothing to compare |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | nothing to compare |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | nothing to compare |
| [MoveSubtree14](../spec/move-subtree.md#movesubtree14) | drop: the pressed rem has no bullet: RemNote drags a rem by its bullet |
| [MoveSubtree15](../spec/move-subtree.md#movesubtree15) | drop: the pressed rem has no bullet: RemNote drags a rem by its bullet |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | nothing to compare |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | drop: the pickup is refused (non-contiguous) |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | nothing to compare |
| [MoveSubtree19](../spec/move-subtree.md#movesubtree19) | drop: the pressed rem has no bullet: RemNote drags a rem by its bullet |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | quote |
| [MoveSubtree22](../spec/move-subtree.md#movesubtree22) | paragraph inside an item (a rem there shows a bullet) |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | numbered list that RemNote would number otherwise |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | paragraph inside an item (a rem there shows a bullet) |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | tag markup-heading |
| [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5) | quote |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | caret in a marker |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | tag markup-heading |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | tag markup-heading |
| [TO1](../spec/obsidian-true-outliner.md#to1) | tag markup-task |
| [TO4](../spec/obsidian-true-outliner.md#to4) | numbered list that RemNote would number otherwise |
| [TO6](../spec/obsidian-true-outliner.md#to6) | numbered list that RemNote would number otherwise |
| [TO-Bug255](../spec/obsidian-true-outliner.md#to-bug255) | quote |
| [TO-Seams](../spec/obsidian-true-outliner.md#to-seams) | quote |
| [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb) | quote |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | paragraph inside an item (a rem there shows a bullet) |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | quote |
| [TO18](../spec/obsidian-true-outliner.md#to18) | option enterOnEmptyItem: outdent |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
| [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264) | quote (expected) |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | option quotes: container |
| **outdent.md** | |
| [Outdent14](../spec/outdent.md#outdent14) | caret in a marker |
| [Outdent16](../spec/outdent.md#outdent16) | caret in a marker |
| [Outdent17](../spec/outdent.md#outdent17) | caret in a task's checkbox, a heading's #s or a code block's fences |
| [Outdent17b](../spec/outdent.md#outdent17b) | caret in a task's checkbox, a heading's #s or a code block's fences |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a task's checkbox, a heading's #s or a code block's fences |
| [Outdent19](../spec/outdent.md#outdent19) | tag markup-fence |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag markup-fence |
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| **paste-at.md** | |
| [PasteAt1](../spec/paste-at.md#pasteat1) | action pasteAt |
| [PasteAt2](../spec/paste-at.md#pasteat2) | action pasteAt |
| [PasteAt3](../spec/paste-at.md#pasteat3) | action pasteAt |
| [PasteAt4](../spec/paste-at.md#pasteat4) | action pasteAt |
| [PasteAt5](../spec/paste-at.md#pasteat5) | action deleteByDrag |
| **paste-html.md** | |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList17](../spec/paste-list.md#pastelist17) | quote (expected) |
| [PasteList17b](../spec/paste-list.md#pastelist17b) | quote (expected) |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | option quotes: container |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | quote |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | callout |
| [PastePlain28](../spec/paste-plain.md#pasteplain28) | paragraph inside an item (a rem there shows a bullet) |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste15](../spec/paste.md#paste15) | caret in a task's checkbox, a heading's #s or a code block's fences |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste17b](../spec/paste.md#paste17b) | option pasteOverSelection: ignore |
| [Paste17c](../spec/paste.md#paste17c) | option pasteOverSelection: ignore |
| [Paste17d](../spec/paste.md#paste17d) | option pasteOverSelection: ignore |
| [Paste17e](../spec/paste.md#paste17e) | option pasteOverSelection: ignore |
| [Paste17f](../spec/paste.md#paste17f) | option pasteOverSelection: ignore |
| [Paste17g](../spec/paste.md#paste17g) | option pasteOverSelection: ignore |
| [Paste18](../spec/paste.md#paste18) | option pasteLines: items |
| [Paste19](../spec/paste.md#paste19) | option pasteLines: items |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder13](../spec/placeholders.md#placeholder13) | tag markup-heading |
| [Placeholder20](../spec/placeholders.md#placeholder20) | option enterSplitSpace: start |
| **quirks.md** | |
| [Quirk1](../spec/quirks.md#quirk1) | option quirkEnterMidHeading: workflowy |
| [Quirk1b](../spec/quirks.md#quirk1b) | option quirkEnterMidHeading: workflowy |
| [Quirk1c](../spec/quirks.md#quirk1c) | option quirkEnterMidHeading: workflowy |
| [Quirk2b](../spec/quirks.md#quirk2b) | option quirkPasteCaret: athens |
| [Quirk3](../spec/quirks.md#quirk3) | option backspaceAtItemStart: logseq |
| [Quirk4](../spec/quirks.md#quirk4) | option quirkPasteText: dynalist |
| **quotes.md** | |
| [Quote1](../spec/quotes.md#quote1) | quote |
| [Quote2](../spec/quotes.md#quote2) | quote |
| [Quote3](../spec/quotes.md#quote3) | quote |
| [Quote4](../spec/quotes.md#quote4) | quote |
| [Quote5](../spec/quotes.md#quote5) | quote |
| [Quote6](../spec/quotes.md#quote6) | quote |
| [Quote7](../spec/quotes.md#quote7) | callout |
| [Quote8](../spec/quotes.md#quote8) | quote |
| [Quote9](../spec/quotes.md#quote9) | quote |
| [Quote10](../spec/quotes.md#quote10) | quote |
| [Quote11](../spec/quotes.md#quote11) | quote |
| [Quote12](../spec/quotes.md#quote12) | quote |
| [Quote12b](../spec/quotes.md#quote12b) | quote |
| [Quote13](../spec/quotes.md#quote13) | callout |
| [Quote14](../spec/quotes.md#quote14) | quote |
| [Quote15](../spec/quotes.md#quote15) | quote |
| [Quote16](../spec/quotes.md#quote16) | quote |
| [Quote17](../spec/quotes.md#quote17) | quote |
| [Quote18](../spec/quotes.md#quote18) | quote |
| [Quote19](../spec/quotes.md#quote19) | quote |
| [Quote20](../spec/quotes.md#quote20) | quote |
| [Quote21](../spec/quotes.md#quote21) | quote |
| [Quote22](../spec/quotes.md#quote22) | quote |
| [Quote23](../spec/quotes.md#quote23) | quote |
| [Quote24](../spec/quotes.md#quote24) | quote |
| [Quote25](../spec/quotes.md#quote25) | quote |
| [Quote26](../spec/quotes.md#quote26) | option quotes: container |
| [Quote27](../spec/quotes.md#quote27) | quote |
| [Quote28](../spec/quotes.md#quote28) | quote |
| [Quote29](../spec/quotes.md#quote29) | quote |
| [Quote30](../spec/quotes.md#quote30) | quote |
| [Quote31](../spec/quotes.md#quote31) | quote |
| [Quote32](../spec/quotes.md#quote32) | quote |
| [Quote33](../spec/quotes.md#quote33) | quote |
| [Quote34](../spec/quotes.md#quote34) | quote |
| [Quote35](../spec/quotes.md#quote35) | option quotes: container |
| [Quote36](../spec/quotes.md#quote36) | option quotes: container |
| [Quote37](../spec/quotes.md#quote37) | quote |
| [Quote38](../spec/quotes.md#quote38) | callout |
| [Quote39](../spec/quotes.md#quote39) | callout |
| [Quote40](../spec/quotes.md#quote40) | callout |
| [Quote41](../spec/quotes.md#quote41) | callout |
| [Quote42](../spec/quotes.md#quote42) | quote |
| [Quote43](../spec/quotes.md#quote43) | callout |
| [Quote43b](../spec/quotes.md#quote43b) | option markup: decorated |
| [Quote44](../spec/quotes.md#quote44) | quote |
| [Quote45](../spec/quotes.md#quote45) | quote |
| [Quote46](../spec/quotes.md#quote46) | quote |
| [Quote47](../spec/quotes.md#quote47) | callout |
| [Quote48](../spec/quotes.md#quote48) | quote |
| [Quote49](../spec/quotes.md#quote49) | quote |
| [Quote50](../spec/quotes.md#quote50) | quote |
| [Quote51](../spec/quotes.md#quote51) | quote |
| [Quote52](../spec/quotes.md#quote52) | quote |
| [Quote53](../spec/quotes.md#quote53) | quote |
| [Quote54](../spec/quotes.md#quote54) | quote |
| [Quote55](../spec/quotes.md#quote55) | quote |
| [Quote56](../spec/quotes.md#quote56) | quote |
| [Quote57](../spec/quotes.md#quote57) | callout |
| [Quote58](../spec/quotes.md#quote58) | callout |
| [Quote59](../spec/quotes.md#quote59) | quote |
| [Quote89](../spec/quotes.md#quote89) | option quotes: container |
| [Quote90](../spec/quotes.md#quote90) | tag markup-fence |
| [Quote60](../spec/quotes.md#quote60) | callout |
| [Quote61](../spec/quotes.md#quote61) | callout |
| [Quote62](../spec/quotes.md#quote62) | callout |
| [Quote63](../spec/quotes.md#quote63) | quote |
| [Quote64](../spec/quotes.md#quote64) | quote |
| [Quote65](../spec/quotes.md#quote65) | option quotes: container |
| [Quote66](../spec/quotes.md#quote66) | quote |
| [Quote67](../spec/quotes.md#quote67) | quote |
| [Quote68](../spec/quotes.md#quote68) | quote |
| [Quote71](../spec/quotes.md#quote71) | callout |
| [Quote72](../spec/quotes.md#quote72) | quote |
| [Quote73](../spec/quotes.md#quote73) | option quotes: container |
| [Quote74](../spec/quotes.md#quote74) | quote |
| [Quote75](../spec/quotes.md#quote75) | quote |
| [Quote76](../spec/quotes.md#quote76) | quote |
| [Quote77](../spec/quotes.md#quote77) | option quotes: container |
| [Quote78](../spec/quotes.md#quote78) | option quotes: container |
| [Quote79](../spec/quotes.md#quote79) | callout |
| [Quote80](../spec/quotes.md#quote80) | option quotes: container |
| [Quote81](../spec/quotes.md#quote81) | quote |
| [Quote82](../spec/quotes.md#quote82) | quote |
| [Quote88](../spec/quotes.md#quote88) | quote |
| [Quote83](../spec/quotes.md#quote83) | option quotes: container |
| [Quote84](../spec/quotes.md#quote84) | callout |
| [Quote85](../spec/quotes.md#quote85) | quote |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | quote |
| [Quote91b](../spec/quotes.md#quote91b) | quote |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | tag markup-heading |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote94](../spec/quotes.md#quote94) | tag markup-task |
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | quote |
| [QuoteText1](../spec/quotes.md#quotetext1) | quote |
| [QuoteText2](../spec/quotes.md#quotetext2) | quote |
| [QuoteText3](../spec/quotes.md#quotetext3) | quote |
| [QuoteText4](../spec/quotes.md#quotetext4) | quote |
| [QuoteText5](../spec/quotes.md#quotetext5) | quote |
| [QuoteText6](../spec/quotes.md#quotetext6) | quote |
| [QuoteText7](../spec/quotes.md#quotetext7) | quote |
| [QuoteText8](../spec/quotes.md#quotetext8) | quote |
| [QuoteText9](../spec/quotes.md#quotetext9) | quote |
| [QuoteText10](../spec/quotes.md#quotetext10) | quote |
| [QuoteText11](../spec/quotes.md#quotetext11) | quote |
| [QuoteText12](../spec/quotes.md#quotetext12) | quote |
| [QuoteText13](../spec/quotes.md#quotetext13) | quote |
| [QuoteText14](../spec/quotes.md#quotetext14) | quote (expected) |
| [QuoteText15](../spec/quotes.md#quotetext15) | quote |
| [QuoteText16](../spec/quotes.md#quotetext16) | quote |
| [QuoteText17](../spec/quotes.md#quotetext17) | quote |
| [QuoteText18](../spec/quotes.md#quotetext18) | quote |
| [QuoteText19](../spec/quotes.md#quotetext19) | quote |
| [QuoteText20](../spec/quotes.md#quotetext20) | quote |
| [QuoteText21](../spec/quotes.md#quotetext21) | option enterInQuote: split |
| [QuoteText22](../spec/quotes.md#quotetext22) | option enterInQuote: split |
| [QuoteAtom1](../spec/quotes.md#quoteatom1) | option quotes: atom |
| [QuoteAtom2](../spec/quotes.md#quoteatom2) | option quotes: atom |
| [QuoteAtom3](../spec/quotes.md#quoteatom3) | option quotes: atom |
| [QuoteAtom4](../spec/quotes.md#quoteatom4) | option quotes: atom |
| [QuoteAtom5](../spec/quotes.md#quoteatom5) | option quotes: atom |
| [QuoteAtom6](../spec/quotes.md#quoteatom6) | option quotes: atom |
| [QuoteAtom7](../spec/quotes.md#quoteatom7) | option quotes: atom |
| [QuoteAtom8](../spec/quotes.md#quoteatom8) | option quotes: atom |
| [QuoteAtom9](../spec/quotes.md#quoteatom9) | option quotes: atom |
| [QuoteAtom10](../spec/quotes.md#quoteatom10) | option quotes: atom |
| [QuoteAtom11](../spec/quotes.md#quoteatom11) | option quotes: atom |
| [QuoteAtom12](../spec/quotes.md#quoteatom12) | option quotes: atom |
| [QuoteAtom13](../spec/quotes.md#quoteatom13) | option quotes: atom |
| [QuoteAtom14](../spec/quotes.md#quoteatom14) | option quotes: atom |
| [QuoteAtom15](../spec/quotes.md#quoteatom15) | option quotes: atom |
| [QuoteAtom16](../spec/quotes.md#quoteatom16) | option quotes: atom |
| [QuoteAtom17](../spec/quotes.md#quoteatom17) | option quotes: atom |
| [QuoteAtom18](../spec/quotes.md#quoteatom18) | option quotes: atom |
| [QuoteAtom19](../spec/quotes.md#quoteatom19) | option quotes: atom |
| [QuoteAtom20](../spec/quotes.md#quoteatom20) | option quotes: atom |
| [QuoteAtom21](../spec/quotes.md#quoteatom21) | option quotes: atom |
| **regressions.md** | |
| [Regression1](../spec/regressions.md#regression1) | numbered list that RemNote would number otherwise |
| [Regression3](../spec/regressions.md#regression3) | quote |
| [Regression6](../spec/regressions.md#regression6) | code block's fences other than the shortest backticks that hold its code, which a code rem reads back with (it keeps no fences) |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression8](../spec/regressions.md#regression8) | numbered list that RemNote would number otherwise |
| [Regression15](../spec/regressions.md#regression15) | tag markup-heading |
| [Regression17](../spec/regressions.md#regression17) | tag markup-task |
| [Regression18](../spec/regressions.md#regression18) | tag markup-heading |
| [Regression19](../spec/regressions.md#regression19) | tag markup-heading |
| [Regression20](../spec/regressions.md#regression20) | option joinWithChildren: refuse |
| [Regression21](../spec/regressions.md#regression21) | option pasteLines: items |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| [Regression23](../spec/regressions.md#regression23) | tag markup-fence |
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression31](../spec/regressions.md#regression31) | caret in a marker |
| [Regression33](../spec/regressions.md#regression33) | quote |
| [Regression34](../spec/regressions.md#regression34) | quote |
| [Regression36](../spec/regressions.md#regression36) | quote |
| [Regression37](../spec/regressions.md#regression37) | quote |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression44](../spec/regressions.md#regression44) | tag markup-task |
| [Regression45](../spec/regressions.md#regression45) | tag markup-task |
| [Regression46](../spec/regressions.md#regression46) | tag markup-task |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | action duplicateSubtree |
| [Regression52](../spec/regressions.md#regression52) | action duplicateSubtree |
| [Regression53](../spec/regressions.md#regression53) | tag markup-task |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression55](../spec/regressions.md#regression55) | tag markup-task |
| [Regression56](../spec/regressions.md#regression56) | tag markup-task |
| [Regression57](../spec/regressions.md#regression57) | tag markup-task |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| **scenarios.md** | |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario15](../spec/scenarios.md#scenario15) | tag markup-task |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| **shift-enter.md** | |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret in a marker |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag markup-task |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | tag markup-task |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | tag markup-heading |
| **tasks.md** | |
| [TaskEnter1](../spec/tasks.md#taskenter1) | tag markup-task |
| [TaskEnter2](../spec/tasks.md#taskenter2) | tag markup-task |
| [TaskEnter4](../spec/tasks.md#taskenter4) | tag markup-task |
| [TaskEnter5](../spec/tasks.md#taskenter5) | tag markup-task |
| [TaskEnter6](../spec/tasks.md#taskenter6) | tag markup-task |
| [TaskEnter8](../spec/tasks.md#taskenter8) | tag markup-task |
| [TaskEnter9](../spec/tasks.md#taskenter9) | tag markup-task |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | tag markup-task |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | tag markup-task |
| [TaskEnter10](../spec/tasks.md#taskenter10) | tag markup-task |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | tag markup-task |
| [TaskBackspace2](../spec/tasks.md#taskbackspace2) | tag markup-task |
| [TaskBackspace3](../spec/tasks.md#taskbackspace3) | tag markup-task |
| [TaskBackspace3b](../spec/tasks.md#taskbackspace3b) | option taskEditing: unwrap |
| [TaskBackspace3c](../spec/tasks.md#taskbackspace3c) | option taskEditing: unwrap |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | tag markup-task |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | tag markup-task |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | tag markup-task |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | tag markup-task |
| [TaskDelete1](../spec/tasks.md#taskdelete1) | tag markup-task |
| [TaskDelete2](../spec/tasks.md#taskdelete2) | tag markup-task |
| [TaskDelete3](../spec/tasks.md#taskdelete3) | tag markup-task |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | tag markup-task |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | tag markup-task |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | tag markup-task |
| [TaskBackspace10](../spec/tasks.md#taskbackspace10) | tag markup-task |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | tag markup-task |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | tag markup-task |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | caret on a blank line |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | caret in a task's checkbox, a heading's #s or a code block's fences |
| **zoom.md** | |
| [Zoom1](../spec/zoom.md#zoom1) | the caret in the zoom root, the page's title |
| [Zoom2](../spec/zoom.md#zoom2) | the caret in the zoom root, the page's title |
| [Zoom3](../spec/zoom.md#zoom3) | a zoom into a rem without a bullet, what it owns its siblings |
| [Zoom4](../spec/zoom.md#zoom4) | caret in a marker |
| [Zoom5](../spec/zoom.md#zoom5) | the caret in the zoom root, the page's title |
| [Zoom6](../spec/zoom.md#zoom6) | action zoomIn |
| [Zoom7](../spec/zoom.md#zoom7) | the caret in the zoom root, the page's title |
| [Zoom8](../spec/zoom.md#zoom8) | action clearZoom |
| [Zoom9](../spec/zoom.md#zoom9) | the caret in the zoom root, the page's title |
| [Zoom10](../spec/zoom.md#zoom10) | the caret in the zoom root, the page's title |
| [Zoom12](../spec/zoom.md#zoom12) | caret on a blank line |
| [Zoom13](../spec/zoom.md#zoom13) | the caret in the zoom root, the page's title |
| [Zoom14](../spec/zoom.md#zoom14) | option enterOnEmptyItem: unwrap |
