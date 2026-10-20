---
type: "SxS"
app: "siyuan"
version: "3.8.6"
url: "http://127.0.0.1:6816/stage/build/desktop/"
model: "block"
command: "node sxs/run.ts siyuan"
elapsed_s: 437
workers: 2
---

# SiYuan vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 185 | [7](#caret-7) | [12](#whitespace-12) | [119](#disagree-119) |  |  | **323** |
| adapted | 111 | [5](#adapted-caret-5) | [11](#adapted-whitespace-11) | [69](#adapted-disagree-69) |  |  | **196** |
| **total** | **296 (33%)** | **12 (1.3%)** | **23 (2.5%)** | **188 (21%)** | **0 (0%)** | **[388](#skipped-388) (43%)** | **907** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 26 | 2 |  | 27 |  | 23 | **78** | 37 | 18 |
| [cursor.md](../spec/cursor.md) | 24 | 4 |  |  |  | 8 | **36** | 25 | 3 |
| [delete-subtree.md](../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [delete.md](../spec/delete.md) | 11 |  |  | 16 |  | 25 | **52** | 23 | 4 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  | 1 |  | 7 | **8** | 1 |  |
| [enter.md](../spec/enter.md) | 25 | 3 | 8 | 24 |  | 29 | **89** | 35 | 25 |
| [fences.md](../spec/fences.md) | 9 | 1 | 1 | 5 |  | 49 | **65** |  | 16 |
| [gaps.md](../spec/gaps.md) | 11 |  |  | 2 |  | 6 | **19** | 9 | 4 |
| [indent.md](../spec/indent.md) | 17 |  | 1 | 11 |  | 7 | **36** | 21 | 8 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 20 |  |  | 12 |  | 7 | **39** | 28 | 4 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 19 |  |  | 11 |  | 10 | **40** | 25 | 5 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 36 |  | 3 | 11 |  | 17 | **67** | 37 | 13 |
| [outdent.md](../spec/outdent.md) | 14 |  |  | 4 |  | 17 | **35** | 15 | 3 |
| [paste-plain.md](../spec/paste-plain.md) | 6 |  | 2 | 17 |  | 3 | **28** | 14 | 11 |
| [paste.md](../spec/paste.md) | 30 | 1 | 3 | 22 |  | 39 | **95** | 18 | 38 |
| [placeholders.md](../spec/placeholders.md) | 8 |  |  | 3 |  | 6 | **17** | 7 | 4 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 96 | **96** |  |  |
| [scenarios.md](../spec/scenarios.md) | 15 |  |  | 9 |  | 2 | **26** | 16 | 8 |
| [shift-enter.md](../spec/shift-enter.md) | 16 | 1 | 4 | 3 |  | 10 | **34** | 8 | 16 |
| [tasks.md](../spec/tasks.md) | 4 |  | 1 | 9 |  | 14 | **28** |  | 14 |
| [typing.md](../spec/typing.md) | 1 |  |  | 1 |  | 1 | **3** | 1 | 1 |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **296 (33%)** | **12 (1.3%)** | **23 (2.5%)** | **188 (21%)** | **0 (0%)** | **388 (43%)** | **907** | **323 (36%)** | **196 (22%)** |

## Disagree (119)

### [Backspace1](../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

```buffer
- one
  ¶ ┃two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Backspace3](../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace5](../spec/backspace.md#backspace5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

```buffer
- 
  ¶ ┃b
```

</td><td>

```buffer
- ┃b
```

</td></tr>
</table>

### [Backspace7](../spec/backspace.md#backspace7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ ┃
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

### [Backspace8](../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

```buffer
- a
  ¶ ┃b
    - c
```

</td><td>

```buffer
- a┃b
  - c
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  - ┃a
```

</td><td>

```buffer
¶ para
¶ ┃a
```

</td><td>

```buffer
¶ para┃a
```

</td></tr>
</table>

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

```buffer
¶ ┃
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

```buffer
¶ ┃
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

### [Backspace17c](../spec/backspace.md#backspace17c)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃
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

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ ┃
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

### [Backspace19](../spec/backspace.md#backspace19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃bc
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃bc
```

</td><td>

```buffer
- a
  ┃bc
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃bc
```

</td><td>

```buffer
- a┃bc
```

</td></tr>
</table>

### [Backspace23](../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title
  ¶ ┃more
    lines
```

</td><td>

```buffer
¶ # Title┃morelines
```

</td><td>

```buffer
¶ # Title
  ¶ ┃more
    lines
```

</td></tr>
</table>

### [Backspace30](../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace39](../spec/backspace.md#backspace39)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
¶ p
```

</td><td>

```buffer
- a
  ¶ ┃
¶ p
```

</td><td>

```buffer
- a┃
¶ p
```

</td></tr>
</table>

### [Backspace40](../spec/backspace.md#backspace40)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
  - ┃t
  2. m
```

</td><td>

```buffer
¶ p
¶ ┃t
  2. m
```

</td><td>

```buffer
¶ p┃t
  2. m
```

</td></tr>
</table>

### [Backspace43b](../spec/backspace.md#backspace43b)

> enter deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃Title
```

</td><td>

```buffer
¶ 
¶ ┃Title
```

</td><td>

```buffer
¶ # ┃Title
```

</td></tr>
</table>

### [Backspace45](../spec/backspace.md#backspace45)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- a
  ¶ ┃b
    - c
    - d
    - e
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

### [Delete1](../spec/delete.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

```buffer
- abc┃
- def
```

</td><td>

```buffer
- abc┃def
```

</td></tr>
</table>

### [Delete2](../spec/delete.md#delete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

```buffer
- one┃
  ¶ two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- ┃
  ¶ a
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
    ¶ b
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

### [Delete5c](../spec/delete.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- x
- ┃a
  - b
```

</td></tr>
</table>

### [Delete6](../spec/delete.md#delete6)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ b
```

</td><td>

```buffer
- a
- ┃b
```

</td></tr>
</table>

### [Delete7](../spec/delete.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
```

</td><td>

```buffer
- a┃
  ¶ b
    - c
```

</td><td>

```buffer
- a┃b
  - c
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Delete12](../spec/delete.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- b┃
  ¶ c
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

### [Delete17](../spec/delete.md#delete17)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:┃
  - milk
  - eggs
```

</td><td>

```buffer
¶ Shopping:┃
¶ milk
  - eggs
```

</td><td>

```buffer
¶ Shopping:┃milk
  - eggs
```

</td></tr>
</table>

### [Delete18b](../spec/delete.md#delete18b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  ¶ bc
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

### [Delete20](../spec/delete.md#delete20)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
- b
```

</td><td>

```buffer
- a┃
  ¶ 
- b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

### [Delete31](../spec/delete.md#delete31)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- a┃
  ¶ b
    - c
    - d
    - e
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

### [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c
```

</td><td>

```buffer
- a
  ¶ ▮ ┃a
    - b
- c
```

</td><td>

```buffer
- a
  - b
- a┃
  - b
- c
```

</td></tr>
</table>

### [Enter3d](../spec/enter.md#enter3d)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃b
    - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

### [Enter7](../spec/enter.md#enter7)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
¶ ┃
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

### [Enter21](../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
¶ ┃
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

### [Enter27](../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ ┃
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

### [Enter33](../spec/enter.md#enter33)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ 
¶ ┃hello
```

</td><td>

```buffer
¶ intro
¶ ┃
¶ hello
```

</td></tr>
</table>

> "x"

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ 
¶ x┃hello
```

</td><td>

```buffer
¶ intro
¶ x┃
¶ hello
```

</td></tr>
</table>

### [Enter38](../spec/enter.md#enter38)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ¶ ┃two
- next
```

</td><td>

```buffer
- one┃two
- next
```

</td></tr>
</table>

### [Enter39](../spec/enter.md#enter39)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab
  ¶ ┃
- c
```

</td><td>

```buffer
- ab┃
- c
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Enter65](../spec/enter.md#enter65)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
- next
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ¶ ┃ three
- next
```

</td><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

### [Enter65b](../spec/enter.md#enter65b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
- next
```

</td></tr>
</table>

> cursorLineDown cursorLineUp deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ¶ ┃ three
- next
```

</td><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

### [Enter65e](../spec/enter.md#enter65e)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ¶ ┃ three
    - c
```

</td><td>

```buffer
- one two┃ three
  - c
```

</td></tr>
</table>

### [Enter65h](../spec/enter.md#enter65h)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
- next
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
  - ┃ three
- next
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
- next
```

</td><td>

```buffer
- one two┃ three
- next
```

</td></tr>
</table>

### [Enter65k](../spec/enter.md#enter65k)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ¶ ┃ three
```

</td><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

### [Enter62](../spec/enter.md#enter62)

> enter "revise "

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan┃2. draft
```

</td><td>

```buffer
- Plan
- 
  2. revise ┃draft
```

</td><td>

```buffer
- Plan
- revise ┃2\. draft
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## B┃
    ¶ ### C
```

</td><td>

```buffer
¶ # A
  ¶ ## B→┃
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

### [Indent21](../spec/indent.md#indent21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para a
¶ para b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para a
¶ para b→┃
```

</td><td>

```buffer
¶ para a
  - para b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para a
¶ para b→┃
```

</td><td>

```buffer
¶ para a
¶ para b┃
```

</td></tr>
</table>

### [Indent22](../spec/indent.md#indent22)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ Para┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Para→┃
```

</td><td>

```buffer
- Para┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Para→┃
```

</td><td>

```buffer
¶ Para┃
```

</td></tr>
</table>

### [Indent23](../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ ## C→┃
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

### [Indent29](../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ para┃
```

</td><td>

```buffer
- a
¶ para→┃
```

</td><td>

```buffer
- a
- para┃
```

</td></tr>
</table>

### [Indent29b](../spec/indent.md#indent29b)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
¶ para┃
```

</td><td>

```buffer
1. a
¶ para→┃
```

</td><td>

```buffer
1. a
2. para┃
```

</td></tr>
</table>

### [Indent29c](../spec/indent.md#indent29c)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
¶ para┃
```

</td><td>

```buffer
- a
  - b
¶ para→┃
```

</td><td>

```buffer
- a
  - b
- para┃
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [MoveDown8](../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
¶ para
  - c
```

</td><td>

```buffer
- a
- b┃
¶ para
  - c
```

</td><td>

```buffer
- a
¶ para
  - b┃
  - c
```

</td></tr>
</table>

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [MoveDown18](../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
  - ┃review
¶ # Home
  - water
```

</td><td>

```buffer
¶ # Work
  - email
  - ┃review
¶ # Home
  - water
```

</td><td>

```buffer
¶ # Work
  - email
¶ # Home
  - ┃review
  - water
```

</td></tr>
</table>

### [MoveDown19](../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [MoveDown20](../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Todo
  - one
  - two┃
  ¶ ## Later
    - three
```

</td><td>

```buffer
¶ # Todo
  - one
  - two┃
  ¶ ## Later
    - three
```

</td><td>

```buffer
¶ # Todo
  - one
  ¶ ## Later
    - two┃
    - three
```

</td></tr>
</table>

### [MoveDown24](../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para┃
  - a
¶ last
```

</td><td>

```buffer
- a
¶ para┃
¶ last
```

</td><td>

```buffer
¶ last
¶ para┃
  - a
```

</td></tr>
</table>

### [MoveDown25](../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ para┃
¶ # B
  - x
```

</td><td>

```buffer
¶ # A
¶ # B
  ¶ para┃
    - x
```

</td><td>

```buffer
¶ # A
  ¶ para┃
¶ # B
  - x
```

</td></tr>
</table>

### [MoveDown29](../spec/move-subtree-down.md#movedown29)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ pa┃ra
  1. a
  - b
¶ next
```

</td><td>

```buffer
1. a
¶ pa┃ra
  - b
¶ next
```

</td><td>

```buffer
¶ next
¶ pa┃ra
  1. a
  - b
```

</td></tr>
</table>

### [MoveDown36](../spec/move-subtree-down.md#movedown36)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a
  ¶ para
```

</td><td>

```buffer
- item
  ¶ para
    - ┃a
```

</td><td>

```buffer
- item
  - ┃a
  ¶ para
```

</td></tr>
</table>

### [MoveDown39](../spec/move-subtree-down.md#movedown39)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
¶ para
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
¶ para
```

</td><td>

```buffer
- a
¶ para
  - b┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b┃
- a
¶ para
```

</td><td>

```buffer
- a
- b┃
¶ para
```

</td></tr>
</table>

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [MoveUp7](../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ para
  - b┃
  - c
```

</td><td>

```buffer
- a
¶ para
  - b┃
  - c
```

</td><td>

```buffer
- a
- b┃
¶ para
  - c
```

</td></tr>
</table>

### [MoveUp16](../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [MoveUp17](../spec/move-subtree-up.md#moveup17)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ first
¶ para┃
  - a
```

</td><td>

```buffer
¶ para┃
¶ first
  - a
```

</td><td>

```buffer
¶ para┃
  - a
¶ first
```

</td></tr>
</table>

### [MoveUp21](../spec/move-subtree-up.md#moveup21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  - a┃
  - b
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  - a┃
  - b
```

</td><td>

```buffer
- a┃
¶ para
  - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  - b
  - a┃
```

</td><td>

```buffer
¶ para
  - a┃
  - b
```

</td></tr>
</table>

### [MoveUp22](../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
¶ # Home
  - ┃review
  - water
```

</td><td>

```buffer
¶ # Work
  - email
¶ # Home
  - ┃review
  - water
```

</td><td>

```buffer
¶ # Work
  - email
  - ┃review
¶ # Home
  - water
```

</td></tr>
</table>

### [MoveUp24](../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Todo
  - one
  ¶ ## Later
    - ┃two
    - three
```

</td><td>

```buffer
¶ # Todo
  - one
  ¶ ## Later
    - ┃two
    - three
```

</td><td>

```buffer
¶ # Todo
  - one
  - ┃two
  ¶ ## Later
    - three
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [MoveUp29](../spec/move-subtree-up.md#moveup29)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H
  - ┃a
  - b
```

</td><td>

```buffer
¶ # H
  - ┃a
  - b
```

</td><td>

```buffer
- ┃a
¶ # H
  - b
```

</td></tr>
</table>

### [MoveUp33](../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [E10](../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃
  ¶ para
```

</td><td>

```buffer
- item
  ¶ ┃
  ¶ para
```

</td><td>

```buffer
- item
  - ┃
  ¶ para
```

</td></tr>
</table>

### [Place inside a multi-line item](../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  bar
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  ¶ ┃bar
```

</td><td>

```buffer
- foo
  ┃
  bar
```

</td></tr>
</table>

> "x"

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  ¶ x┃bar
```

</td><td>

```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

### [Leaving the place removes it](../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ foo┃
  bar
```

</td><td>

```buffer
¶ foo
¶ bar
```

</td><td>

```buffer
¶ ┃foo
  bar
```

</td></tr>
</table>

### [Emptied middle item removed and renumbered](../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
2. q
```

</td><td>

```buffer
1. p┃
2. q
```

</td></tr>
</table>

### [Children move to the joined node](../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Delete forward absorbs child with grandchildren](../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
```

</td><td>

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

</td></tr>
</table>

### [Joining across ordered runs](../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
2. b
¶ ┃x
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

### [Next item becomes the new 1.](../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

```buffer
- p
  ¶ ┃a
    1. b
```

</td><td>

```buffer
- p┃a
  1. b
```

</td></tr>
</table>

### [List starting at 3 keeps its start](../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

```buffer
3. a
   ¶ ┃b
4. c
```

</td><td>

```buffer
3. a┃b
4. c
```

</td></tr>
</table>

### [Enter, then Shift-Enter and Backspace](../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

> enter shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
```

</td><td>

```buffer
- foo
  ¶ ┃
```

</td><td>

```buffer
- foo
- ┃
```

</td></tr>
</table>

### [Outdent2](../spec/outdent.md#outdent2)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ b→┃
```

</td><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

### [Outdent4](../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T
  ¶ ## A→┃
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

### [Outdent15](../spec/outdent.md#outdent15)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  - b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ b→┃
```

</td><td>

```buffer
¶ para
  - b┃
```

</td></tr>
</table>

### [Paste3](../spec/paste-plain.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste6](../spec/paste-plain.md#paste6)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
¶ # H┃
```

</td><td>

```buffer
¶ # Hxy┃
```

</td><td>

```buffer
¶ # H┃
```

</td></tr>
</table>

### [Paste40](../spec/paste-plain.md#paste40)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- axy┃b
- c
```

</td><td>

```buffer
- ax
  ¶ y
    ┃b
- c
```

</td></tr>
</table>

### [Paste78](../spec/paste-plain.md#paste78)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
-     first
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

### [Paste80](../spec/paste-plain.md#paste80)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
. a
b
```

</td><td>

```buffer
¶ 1┃
```

</td><td>

```buffer
1. a
   b┃
```

</td><td>

```buffer
¶ 1\. a
  b
  ┃
```

</td></tr>
</table>

### [Paste82](../spec/paste-plain.md#paste82)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard

x
```

</td><td>

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
  ¶ x┃b
```

</td></tr>
</table>

### [Paste87](../spec/paste-plain.md#paste87)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
 y
```

</td><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px
   y┃
```

</td><td>

```buffer
¶ px
   y┃
```

</td></tr>
</table>

### [Paste87b](../spec/paste-plain.md#paste87b)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
 
y
```

</td><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px
¶ y┃
```

</td><td>

```buffer
¶ px
   
  y┃
```

</td></tr>
</table>

### [Paste7](../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste31](../spec/paste.md#paste31)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- see here
- Introduction┃
```

</td><td>

```buffer
- see 1. Introduction┃here
```

</td></tr>
</table>

### [Paste32](../spec/paste.md#paste32)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
¶ para┃
```

</td><td>

```buffer
¶ parah┃
```

</td><td>

```buffer
¶ para
¶ # h┃
```

</td></tr>
</table>

### [Paste33](../spec/paste.md#paste33)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
¶ ## A
  ¶ para┃
```

</td><td>

```buffer
¶ ## A
  ¶ parah┃
```

</td><td>

```buffer
¶ ## A
  ¶ para
¶ ## h┃
```

</td></tr>
</table>

### [Paste34](../spec/paste.md#paste34)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
¶ para┃
¶ next
```

</td><td>

```buffer
¶ parah┃
¶ next
```

</td><td>

```buffer
¶ para
¶ # h┃
  ¶ next
```

</td></tr>
</table>

### [Paste35](../spec/paste.md#paste35)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
¶ ## A
  ¶ para┃
  ¶ more
  ¶ ### C
¶ ## B
```

</td><td>

```buffer
¶ ## A
  ¶ parah┃
  ¶ more
  ¶ ### C
¶ ## B
```

</td><td>

```buffer
¶ ## A
  ¶ para
¶ ## h┃
  ¶ more
  ¶ ### C
¶ ## B
```

</td></tr>
</table>

### [Paste54](../spec/paste.md#paste54)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
¶ # Hel┃lo
```

</td><td>

```buffer
¶ # Helxy┃lo
```

</td><td>

```buffer
¶ # Hello
  ¶ x
    y┃
```

</td></tr>
</table>

### [Paste61](../spec/paste.md#paste61)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# Z
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ text┃
  ¶ ## C
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ textZ┃
  ¶ ## C
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ text
¶ # Z┃
  ¶ ## C
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ 
```

</td><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

### [Placeholder13](../spec/placeholders.md#placeholder13)

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

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ ┃
  ¶ H2
```

</td><td>

```buffer
¶ # H1
  ¶ ## ┃H2
```

</td></tr>
</table>

### [Scenario3](../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- amore┃
  ¶ b
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

> undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- amore┃
- b
```

</td></tr>
</table>

> redo

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- amore┃
  ¶ b
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

### [Scenario12](../spec/scenarios.md#scenario12)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃x
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Scenario21](../spec/scenarios.md#scenario21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ one┃two
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ one
¶ ┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ one┃two
```

</td></tr>
</table>

> enter cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ one
¶ two
```

</td><td>

```buffer
¶ one┃
¶ two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ one
¶ two
```

</td><td>

```buffer
¶ one┃two
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:
  - ┃milk
    bread
```

</td></tr>
</table>

> cursorLineDown cursorLineBoundaryBackward "- "

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Shopping:
  - milk
    - ┃bread
```

</td><td>

```buffer
¶ Shopping:
  - milk
  - ┃bread
```

</td></tr>
</table>

## Whitespace (12)

### [Enter3c](../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

```buffer
9. a
10. ┃ b
    - c
11. d
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

### [Indent24](../spec/indent.md#indent24)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ###### B┃
```

</td><td>

```buffer
¶ # A
  ¶ ###### B→┃
```

</td><td>

```buffer
¶ # A
  ¶ ###### B┃
```

</td></tr>
</table>

### [S4](../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ one┃ two
```

</td><td>

```buffer
¶ one
  ┃ two
```

</td><td>

```buffer
¶ one
  ┃two
```

</td></tr>
</table>

### [S9](../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  ¶ para┃ text
```

</td><td>

```buffer
- item
  ¶ para
    ┃ text
```

</td><td>

```buffer
- item
  ¶ para
    ┃text
```

</td></tr>
</table>

### [S13](../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- a
  ┃ beta
```

</td><td>

```buffer
- a
  ┃beta
```

</td></tr>
</table>

### [Paste5](../spec/paste-plain.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste86](../spec/paste-plain.md#paste86)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
a  
b
```

</td><td>

```buffer
- ┃
```

</td><td>

```buffer
- a
  b┃
```

</td><td>

```buffer
- a  
  b┃
```

</td></tr>
</table>

### [Paste10](../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter1](../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter2](../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃c
```

</td></tr>
</table>

### [ShiftEnter3](../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter21](../spec/shift-enter.md#shiftenter21)

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two ┃three
```

</td></tr>
</table>

## Caret (7)

### [Backspace43](../spec/backspace.md#backspace43)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ 
¶ ┃para
```

</td><td>

```buffer
¶ ┃
¶ para
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  - ┃a
```

</td><td>

```buffer
¶ ## Titl┃e
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Enter32](../spec/enter.md#enter32)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Title
  ¶ body
```

</td><td>

```buffer
¶ para
¶ 
¶ # ┃Title
  ¶ body
```

</td><td>

```buffer
¶ para
¶ ┃
¶ # Title
  ¶ body
```

</td></tr>
</table>

### [Enter45](../spec/enter.md#enter45)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Title
```

</td><td>

```buffer
¶ para
¶ 
¶ # ┃Title
```

</td><td>

```buffer
¶ para
¶ ┃
¶ # Title
```

</td></tr>
</table>

### [Enter59](../spec/enter.md#enter59)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ «ab»cd
```

</td><td>

```buffer
¶ 
¶ ┃cd
```

</td><td>

```buffer
¶ ┃
¶ cd
```

</td></tr>
</table>

## Adapted: disagree (69)

### [Backspace16](../spec/backspace.md#backspace16)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x
  ```
- ┃a
````

</td><td>

````buffer
¶ ```
  x
  ```
¶ ┃a
````

</td><td>

````buffer
¶ ```
  x
  ```
- ┃a
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
- ┃a
````

</td><td>

````buffer
```
x
```
- ┃a
````

</td></tr>
</table>

### [Backspace21](../spec/backspace.md#backspace21)

> deleteContentBackward

Adapted: blank lines

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a
  ¶ ┃b
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

- ┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Backspace28](../spec/backspace.md#backspace28)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x
  ```
- ┃
````

</td><td>

````buffer
¶ ```
  x
  ```
¶ ┃
````

</td><td>

````buffer
¶ ```
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

### [Backspace37](../spec/backspace.md#backspace37)

> deleteContentBackward

Adapted: setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title
  ¶ ┃more
    lines
```

</td><td>

```buffer
¶ # Title┃morelines
```

</td><td>

```buffer
¶ # Title┃more
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

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  - ┃a
  - b
```

</td><td>

```buffer
- 
  ¶ ┃a
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
- - ┃a
  - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

### [SoftBackspace1](../spec/backspace.md#softbackspace1)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃def
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃def
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃def
```

</td><td>

```buffer
- ┃def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteSoftLineBackward</th><th>deleteSoftLineBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃def
```

</td><td>

```buffer
- [ ] ┃def
```

</td><td>

```buffer
- ┃def
```

</td></tr>
</table>

### [SoftBackspace8](../spec/backspace.md#softbackspace8)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃m
```

</td><td>

```buffer
- [ ] ┃
  m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

### [Backspace44](../spec/backspace.md#backspace44)

> deleteContentBackward

Adapted: blank lines

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
  ¶ ┃
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

### [Backspace44b](../spec/backspace.md#backspace44b)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
  ¶ ┃
```

</td><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
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

### [Delete13g](../spec/delete.md#delete13g)

Adapted: heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  ¶ # H
```

</td><td>

```buffer
- a┃
- H
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  ¶ H
```

</td><td>

```buffer
- a┃H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

```buffer
- a┃
- H
```

</td><td>

```buffer
- a┃H
```

</td></tr>
</table>

### [Delete27](../spec/delete.md#delete27)

> deleteContentForward

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td><td>

```buffer
- [a]:┃
  ¶ b
```

</td><td>

```buffer
- [a]:┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td><td>

```buffer
- \[a]:┃b
```

</td></tr>
</table>

### [Enter28](../spec/enter.md#enter28)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃
    - c
```

</td><td>

```buffer
- a
  - 
  - ┃
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ 
  ¶ ┃
    - c
```

</td><td>

```buffer
- a
  - 
  - 
  - ┃
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃◌
  - c
```

</td><td>

```buffer
- a

  - 
  - ┃
  - c
```

</td><td>

```buffer
- a

  - 
  - 
  - ┃
  - c
```

</td></tr>
</table>

### [Enter35](../spec/enter.md#enter35)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

```buffer
1. abc
2. 
   2. ┃def
```

</td><td>

```buffer
1. abc 
2. ┃2\. def
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

### [Enter43](../spec/enter.md#enter43)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
  ¶ ┃- def
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

### [Enter44](../spec/enter.md#enter44)

Adapted: under enterSplitSpace: start

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ¶ ┃ three
```

</td><td>

```buffer
- one two┃ three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two
- ┃ three
```

</td><td>

```buffer
- one two┃ three
```

</td></tr>
</table>

### [Enter65g](../spec/enter.md#enter65g)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
- [ ] ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
  ¶ ┃ three
```

</td><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two┃ three
```

</td><td>

```buffer
- [ ] one two
- [ ] ┃ three
```

</td><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

### [Enter47](../spec/enter.md#enter47)

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ [Note]: this ┃matters a lot
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [Note]: this
¶ ┃matters a lot
```

</td><td>

```buffer
¶ [Note]: this 
¶ ┃matters a lot
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [Note]: this┃matters a lot
```

</td><td>

```buffer
¶ [Note]: this ┃matters a lot
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
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
[Note]: this ┃matters a lot
```

</td></tr>
</table>

### [Enter48](../spec/enter.md#enter48)

Adapted: escape, under enterSplitSpace: start

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b
  ¶ ┃c
```

</td><td>

```buffer
- [a]: b ┃c
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
- [a]: b ┃c
```

</td></tr>
</table>

### [Enter53](../spec/enter.md#enter53)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ -┃a
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
¶ ┃a
```

</td><td>

```buffer
¶ -
¶ ┃a
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
¶ -┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
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

### [Enter57](../spec/enter.md#enter57)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
  #┃a
```

</td><td>

```buffer
¶ p
¶ #
¶ ┃a
```

</td><td>

```buffer
¶ p
  \#
¶ ┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p
#┃a
```

</td><td>

```buffer
p
\#

┃a
```

</td></tr>
</table>

### [Fence30](../spec/fences.md#fence30)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    code
    ┃
    ```
````

</td><td>

````buffer
- a
  ¶ ```
    code
    ┃
    ```
````

</td><td>

````buffer
- a
  ¶ ```
    code┃
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
  code
  ┃
  ```
````

</td><td>

````buffer
- a
  ```
  code┃
  ```
````

</td></tr>
</table>

### [Fence36](../spec/fences.md#fence36)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  ``
  ┃`
  body
  ```
````

</td><td>

````buffer
¶ ```
  ``┃`
  body
  ```
````

</td><td>

`````buffer
¶ ````
  ``┃`
  body
  ````
`````

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

`````buffer
````
``┃`
body
````
`````

</td></tr>
</table>

### [Fence37](../spec/fences.md#fence37)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  ``┃
  `
  body
  ```
````

</td><td>

````buffer
¶ ```
  ``┃`
  body
  ```
````

</td><td>

`````buffer
¶ ````
  ``┃`
  body
  ````
`````

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

`````buffer
````
``┃`
body
````
`````

</td></tr>
</table>

### [Fence38](../spec/fences.md#fence38)

Adapted: code block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x┃```
  body
  ```
````

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x‍
  ┃```
  body
  ```
````

</td><td>

`````buffer
¶ ````
  x
  ┃```
  body
  ````
`````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x┃```
  body
  ```
````

</td><td>

`````buffer
¶ ````
  x┃```
  body
  ````
`````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

`````buffer
````
x
┃```
body
````
`````

</td><td>

`````buffer
````
x┃```
body
````
`````

</td></tr>
</table>

### [Fence39](../spec/fences.md#fence39)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  ```┃x
  body
  ```
````

</td><td>

````buffer
¶ ```
  ```
  ┃x
  body
  ```
````

</td><td>

`````buffer
¶ ````
  ```
  ┃x
  body
  ````
`````

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

`````buffer
````
```
┃x
body
````
`````

</td></tr>
</table>

### [Indent16](../spec/indent.md#indent16)

> indent

Adapted: setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title┃
  ¶ ## Sub
```

</td><td>

```buffer
¶ # Title→┃
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

### [Indent18](../spec/indent.md#indent18)

> indent

Adapted: bullet +

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ b┃
```

</td><td>

```buffer
¶ intro
¶ b→┃
```

</td><td>

```buffer
¶ intro
  - b┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

b┃
```

</td><td>

```buffer
intro
+ b┃
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title→┃
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title→┃
  ¶ ### Sub
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

### [Indent32](../spec/indent.md#indent32)

Adapted: CR line endings

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃
  b
```

</td></tr>
</table>

> indent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a→┃
  b
```

</td><td>

```buffer
- a┃
  b
```

</td></tr>
</table>

> outdent

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a→┃
  b
```

</td><td>

```buffer
¶ a┃
  b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>indent</th><th>outdent</th></tr>
<tr valign="top"><td>

```buffer
a┃␍
b
```

</td><td>

```buffer
- a┃␍
  b
```

</td><td>

```buffer
a┃␍
b
```

</td></tr>
</table>

### [Line break in setext title](../spec/obsidian-true-outliner.md#line-break-in-setext-title)

> shiftEnter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Hello┃ world
```

</td><td>

```buffer
¶ # Hello
  ¶ ┃ world
```

</td><td>

```buffer
¶ # Hello
  ┃world
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
 ┃world
====
```

</td></tr>
</table>

### [Paste4](../spec/paste-plain.md#paste4)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- axy┃b
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

### [Paste45](../spec/paste-plain.md#paste45)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- ax\^2┃b
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

### [Paste64](../spec/paste-plain.md#paste64)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
¶ ┃words
```

</td><td>

```buffer
¶ ab┃words
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

### [Paste68](../spec/paste-plain.md#paste68)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
¶ p┃ ---
```

</td><td>

```buffer
¶ px┃ ---
```

</td><td>

```buffer
¶ px
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

### [Paste69](../spec/paste-plain.md#paste69)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
¶ [a]: ┃b c
```

</td><td>

```buffer
- [x] : x┃b c
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
\[a]: x
┃b c
```

</td></tr>
</table>

### [Paste81](../spec/paste-plain.md#paste81)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. a
2. b
```

</td><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
- 2ab┃\. y
```

</td><td>

```buffer
- 21\. a
  2\. b
  ┃. y
```

</td></tr>
</table>

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

### [Paste85](../spec/paste-plain.md#paste85)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- axy┃f
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

### [Paste88](../spec/paste-plain.md#paste88)

> pastePlain

Adapted: setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
¶ ## Title┃more
```

</td><td>

```buffer
¶ ## Titlexy┃more
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

### [Paste91](../spec/paste-plain.md#paste91)

> pastePlain

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
x
```
y
````

</td><td>

````buffer
¶ ```
  co┃de
  ```
````

</td><td>

````buffer
¶ ```
  cox
  ```
  y┃de
  ```
````

</td><td>

`````buffer
¶ ````
  cox
  ```
  y┃de
  ````
`````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
co┃de
```
````

</td><td>

`````buffer
````
cox
```
y┃de
````
`````

</td></tr>
</table>

### [Paste19](../spec/paste.md#paste19)

> pasteStructured

Adapted: heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- a
  ¶ # h
    ¶ text┃
```

</td><td>

```buffer
- a
- # h
  ¶ text┃
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

### [Paste27](../spec/paste.md#paste27)

> pasteStructured

Adapted: task, under pasteStructuredOnParent: after

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- [ ] t
  - g
- [ ] a
- [ ] b┃
```

</td><td>

```buffer
- [ ] t
  - g
- a
- b┃
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
    - g
- a
- b┃
```

</td></tr>
</table>

### [Paste36](../spec/paste.md#paste36)

> pasteStructured

Adapted: under pasteStructuredMidText: after

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - See here.
    ¶ x
      - y┃
```

</td><td>

```buffer
- list
  - See here.
  - x
  - y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- list
  - See ┃here.
```

</td><td>

```buffer
- list
  - See here.
  - x
  - y┃
```

</td></tr>
</table>

### [Paste51](../spec/paste.md#paste51)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste53](../spec/paste.md#paste53)

> pasteStructured

Adapted: setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
Title
=====
```

</td><td>

```buffer
¶ para┃
```

</td><td>

```buffer
¶ paraTitle┃
```

</td><td>

```buffer
¶ para
¶ # Title┃
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

### [Paste57](../spec/paste.md#paste57)

> pasteStructured

Adapted: heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- Notes
  ¶ ## Summary
    ¶ The fix:
      - parser
      - test┃
- Later
```

</td><td>

```buffer
- Notes
- ## Summary
  ¶ The fix:
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

### [Paste58](../spec/paste.md#paste58)

> pasteStructured

Adapted: setext heading, thematic break

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
---
title: x
---
```

</td><td>

```buffer
¶ Intro
¶ ┃
¶ Outro
```

</td><td>

```buffer
¶ Intro
¶ ---
¶ title: x
¶ ---
¶ Outro
```

</td><td>

```buffer
¶ Intro
¶ ---
¶ ## title: x┃
  ¶ Outro
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

### [Paste59](../spec/paste.md#paste59)

> pasteStructured

Adapted: under pasteStructuredOnParent: after

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- milk
- eggs
```

</td><td>

```buffer
¶ # Groceries┃
  - bread
```

</td><td>

```buffer
¶ # Groceries
  - milk
  - eggs┃
  - bread
```

</td><td>

```buffer
¶ # Groceries
  - bread
  - milk
  - eggs┃
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

- bread
- milk
- eggs┃
```

</td></tr>
</table>

### [Paste66](../spec/paste.md#paste66)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- grandchild
  ¶ ```js
          // greet
            f();
          ```┃
    ```
````

</td><td>

````buffer
- grandchild
  ¶ ```js
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

### [Paste92](../spec/paste.md#paste92)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- a
- [ ] ┃
- b
```

</td><td>

```buffer
- a
- [ ] x
- [ ] y┃
- b
```

</td><td>

```buffer
- a
- [ ] x
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
- [ ] ┃
- b
```

</td><td>

```buffer
- a
- [ ] x
- y┃
- b
```

</td></tr>
</table>

### [Paste76](../spec/paste.md#paste76)

> pasteStructured

Adapted: under pasteStructuredOnParent: after

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
¶ # ┃Hello
  ¶ body
```

</td><td>

```buffer
- a
- b┃
¶ # Hello
  ¶ body
```

</td><td>

```buffer
¶ # Hello
  ¶ body
    - a
    - b┃
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
body

- a
- b┃
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under enterSplitSpace: start

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
- ┃ and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶  ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃ and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶ ┃  and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk  and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶ 
  ¶ today:┃  and eggs
- call Ann
```

</td><td>

```buffer
- today:┃
- buy milk  and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶ 
  ¶ today:  and eggs
- call A┃
```

</td><td>

```buffer
- today:
- buy milk  and eggs
- call A┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶ 
  ¶ today:  and eggs┃
  ¶ call A
```

</td><td>

```buffer
- today:
- buy milk  and eggs┃call A
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
- ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃ and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk  and eggs
- call Ann
```

</td><td>

```buffer
- today:┃
- buy milk  and eggs
- call Ann
```

</td><td>

```buffer
- today:
- buy milk  and eggs
- call A┃
```

</td><td>

```buffer
- today:
- buy milk  and eggs┃call A
```

</td></tr>
</table>

### [Scenario15](../spec/scenarios.md#scenario15)

Adapted: task

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] bread
    ¶ two loaves┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] bread
    ¶ two loaves
    ¶ ┃
```

</td><td>

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] bread
    ¶ two loaves
  - [ ] ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "bread" enter</th><th>deleteContentBackward "two loaves" indent</th><th>enter</th><th>enter</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  2. revise ┃draft
```

</td><td>

```buffer
¶ # Plan
  ¶ revise ┃2\. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  2. revise
     ┃draft
```

</td><td>

```buffer
¶ # Plan
  ¶ revise
    ┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  2. revis┃draft
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

### [ShiftEnter6](../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc
  1. ┃def
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

### [ShiftEnter29](../spec/shift-enter.md#shiftenter29)

Adapted: setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃more
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  ¶ ┃more
```

</td><td>

```buffer
¶ ## Title
  ┃more
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
Title┃more
---
```

</td><td>

```buffer
Title
┃more
---
```

</td><td>

```buffer
Title┃more
---
```

</td></tr>
</table>

### [ShiftEnter31](../spec/shift-enter.md#shiftenter31)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]:┃
¶ b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]:
  ┃
¶ b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] :┃
¶ b
```

</td><td>

```buffer
¶ [a]:┃
¶ b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
[a]:┃

b
```

</td><td>

```buffer
\[a]:
┃◌

b
```

</td><td>

```buffer
[a]:┃

b
```

</td></tr>
</table>

### [TaskEnter2](../spec/tasks.md#taskenter2)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [TaskEnter5](../spec/tasks.md#taskenter5)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [TaskEnter6](../spec/tasks.md#taskenter6)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
- [ ] ┃ b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
  ¶ ┃ b
    - c
```

</td><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a┃ b
  - c
```

</td><td>

```buffer
- [ ] a
- [ ] ┃ b
  - c
```

</td><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

### [TaskBackspace2](../spec/tasks.md#taskbackspace2)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ ┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>deleteContentBackward</th></tr>
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
- a┃
```

</td></tr>
</table>

### [TaskBackspace3](../spec/tasks.md#taskbackspace3)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

```buffer
- a
¶ ┃b
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
- [x] ┃b
```

</td><td>

```buffer
- a
- ┃b
```

</td></tr>
</table>

### [TaskDelete1](../spec/tasks.md#taskdelete1)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

```buffer
- a┃
¶ b
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
- a┃
- [ ] b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- ┃
¶ a
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

### [TaskDelete3](../spec/tasks.md#taskdelete3)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

```buffer
- a┃
¶ 
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
- a┃
- [ ] 
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Typing2](../spec/typing.md#typing2)

> deleteContentBackward

Adapted: setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

## Adapted: whitespace (11)

### [Enter8](../spec/enter.md#enter8)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Enter9](../spec/enter.md#enter9)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

```buffer
- abc
- # ┃def
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

### [Enter10](../spec/enter.md#enter10)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Enter11](../spec/enter.md#enter11)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ see ┃[a]: /url
```

</td><td>

```buffer
¶ see
¶ ┃[a]: /url
```

</td><td>

```buffer
¶ see 
¶ ┃[a]: /url
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

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para ┃- x
  - a
```

</td><td>

```buffer
¶ para
¶ ┃- x
  - a
```

</td><td>

```buffer
¶ para 
¶ ┃- x
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

### [Enter41](../spec/enter.md#enter41)

> enter

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title ┃- x
  - y
```

</td><td>

```buffer
¶ # Title
  ¶ ┃- x
    - y
```

</td><td>

```buffer
¶ # Title 
  ¶ ┃- x
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

### [Enter42](../spec/enter.md#enter42)

> enter

Adapted: escape, setext heading, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # title ┃- x
```

</td><td>

```buffer
¶ # title
  ¶ ┃- x
```

</td><td>

```buffer
¶ # title 
  ¶ ┃- x
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

### [Fence3](../spec/fences.md#fence3)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
      nested┃
    ```
````

</td><td>

````buffer
- a
  ¶ ```
      nested
    ┃
    ```
````

</td><td>

````buffer
- a
  ¶ ```
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

### [Paste75](../spec/paste.md#paste75)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste79](../spec/paste.md#paste79)

> pasteStructured

Adapted: math

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
$$
    x
    $$
```

</td><td>

```buffer
¶ a┃
```

</td><td>

```buffer
¶ a
¶ $$
  x
  $$
```

</td><td>

```buffer
¶ a
¶ $$
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

### [TaskEnter3](../spec/tasks.md#taskenter3)

> enter

Adapted: task, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

```buffer
- [ ] abc
- [ ] # ┃x
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

## Adapted: caret (5)

### [Backspace24](../spec/backspace.md#backspace24)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x
  ```
¶ ┃para
````

</td><td>

````buffer
¶ ```
  x┃
  ```
¶ para
````

</td><td>

````buffer
¶ ```
  x
  ```
¶ ┃para
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

┃para
````

</td><td>

````buffer
```
x
```

┃para
````

</td></tr>
</table>

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Fence17](../spec/fences.md#fence17)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    ┃one
    ```
````

</td><td>

````buffer
- a┃
  ¶ ```
    one
    ```
````

</td><td>

````buffer
- a
  ¶ ```
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

### [Paste44](../spec/paste.md#paste44)

> pasteStructured

Adapted: math

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  $$
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

### [ShiftEnter18](../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc
   2\. ┃x
```

</td><td>

```buffer
1. abc
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

## Skipped (388)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12e](../spec/backspace.md#backspace12e) | option enterAtTextStart: stay |
| [Backspace17e](../spec/backspace.md#backspace17e) | no nodes |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18b](../spec/backspace.md#backspace18b) | option headingEditing: block |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace27](../spec/backspace.md#backspace27) | quote |
| [Backspace29](../spec/backspace.md#backspace29) | line's trailing whitespace |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace5](../spec/backspace.md#softbackspace5) | heading with more lines |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | quote |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | caret on a code block's fence |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [Backspace42](../spec/backspace.md#backspace42) | caret in a marker |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43c](../spec/backspace.md#backspace43c) | option enterAtTextStart: stay |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree1](../spec/delete-subtree.md#deletesubtree1) | action deleteSubtree |
| [DeleteSubtree2](../spec/delete-subtree.md#deletesubtree2) | action deleteSubtree |
| [DeleteSubtree3](../spec/delete-subtree.md#deletesubtree3) | action deleteSubtree |
| [DeleteSubtree4](../spec/delete-subtree.md#deletesubtree4) | action deleteSubtree |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | action deleteSubtree |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | action deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | action deleteSubtree |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | action deleteSubtree |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | action deleteSubtree |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | action deleteSubtree |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete5d](../spec/delete.md#delete5d) | block's text starting with whitespace |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete10](../spec/delete.md#delete10) | quote |
| [Delete11](../spec/delete.md#delete11) | indented code |
| [Delete13b](../spec/delete.md#delete13b) | option headingEditing: block |
| [Delete13d](../spec/delete.md#delete13d) | option headingEditing: block |
| [Delete13f](../spec/delete.md#delete13f) | option headingEditing: block |
| [Delete15](../spec/delete.md#delete15) | heading's closing #s |
| [Delete16](../spec/delete.md#delete16) | option markup: decorated |
| [Delete16b](../spec/delete.md#delete16b) | option markup: decorated |
| [Delete16c](../spec/delete.md#delete16c) | option markup: decorated |
| [Delete16d](../spec/delete.md#delete16d) | option markup: decorated |
| [Delete16e](../spec/delete.md#delete16e) | option markup: decorated |
| [Delete16f](../spec/delete.md#delete16f) | option markup: decorated |
| [Delete16g](../spec/delete.md#delete16g) | option markup: decorated |
| [Delete18d](../spec/delete.md#delete18d) | option enterAtTextStart: stay |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | caret in a marker |
| [Delete24](../spec/delete.md#delete24) | caret in a marker |
| [Delete25](../spec/delete.md#delete25) | caret in a marker |
| [Delete29](../spec/delete.md#delete29) | caret in a marker |
| [Delete31b](../spec/delete.md#delete31b) | option joinWithChildren: refuse |
| **duplicate-subtree.md** | |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action deleteSubtree |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | selection across blocks |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | indented code |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | quote |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | selection across blocks |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | caret on a code block's fence |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter7b](../spec/enter.md#enter7b) | option enterOnEmptyItem: outdent |
| [Enter15b](../spec/enter.md#enter15b) | option enterOnEmptyItem: outdent |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter26b](../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter29b](../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter37](../spec/enter.md#enter37) | caret on a blank line |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65j](../spec/enter.md#enter65j) | block's text starting with whitespace |
| [Enter46](../spec/enter.md#enter46) | quote |
| [Enter49](../spec/enter.md#enter49) | caret outside a table's cells |
| [Enter50](../spec/enter.md#enter50) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [Enter51](../spec/enter.md#enter51) | heading with more lines |
| [Enter52](../spec/enter.md#enter52) | heading with more lines |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox |
| [Enter55](../spec/enter.md#enter55) | caret in a heading's #s |
| [Enter55b](../spec/enter.md#enter55b) | caret in a heading's #s |
| [Enter55c](../spec/enter.md#enter55c) | option enterAtTextStart: stay |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter58](../spec/enter.md#enter58) | no-break space, which SiYuan holds as a space |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
| [Enter63](../spec/enter.md#enter63) | option enterOnEmptyItem: exit |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence6](../spec/fences.md#fence6) | caret on a code block's fence |
| [Fence7](../spec/fences.md#fence7) | caret on a code block's fence |
| [Fence7b](../spec/fences.md#fence7b) | caret on a code block's fence |
| [Fence7c](../spec/fences.md#fence7c) | caret on a code block's fence |
| [Fence7d](../spec/fences.md#fence7d) | caret on a code block's fence |
| [Fence9](../spec/fences.md#fence9) | caret on a code block's fence |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../spec/fences.md#fence12) | caret on a code block's fence |
| [Fence13](../spec/fences.md#fence13) | caret on a code block's fence |
| [Fence14](../spec/fences.md#fence14) | caret on a code block's fence |
| [Fence15](../spec/fences.md#fence15) | caret on a code block's fence |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../spec/fences.md#fence22) | caret on a code block's fence |
| [Fence23](../spec/fences.md#fence23) | caret on a code block's fence |
| [Fence24](../spec/fences.md#fence24) | caret on a code block's fence |
| [Fence25](../spec/fences.md#fence25) | caret on a code block's fence |
| [Fence26](../spec/fences.md#fence26) | caret on a code block's fence |
| [Fence27](../spec/fences.md#fence27) | caret on a code block's fence |
| [Fence28](../spec/fences.md#fence28) | caret on a code block's fence |
| [Fence29](../spec/fences.md#fence29) | caret on a code block's fence |
| [Fence31](../spec/fences.md#fence31) | caret on a code block's fence |
| [Fence32](../spec/fences.md#fence32) | caret on a code block's fence |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| [Fence33](../spec/fences.md#fence33) | caret on a code block's fence |
| [Fence35](../spec/fences.md#fence35) | caret on a code block's fence |
| [Fence40](../spec/fences.md#fence40) | quote |
| [Fence41](../spec/fences.md#fence41) | caret on a code block's fence |
| [Fence49](../spec/fences.md#fence49) | caret on a code block's fence |
| [Fence50](../spec/fences.md#fence50) | caret on a code block's fence |
| [Fence51](../spec/fences.md#fence51) | caret on a code block's fence |
| [Fence58](../spec/fences.md#fence58) | no-break space, which SiYuan holds as a space |
| [Fence59](../spec/fences.md#fence59) | caret on a code block's fence |
| [Fence59b](../spec/fences.md#fence59b) | caret on a code block's fence |
| [Fence60](../spec/fences.md#fence60) | caret on a code block's fence |
| [Fence42](../spec/fences.md#fence42) | caret in a math block |
| [Fence43](../spec/fences.md#fence43) | quote |
| [Fence44](../spec/fences.md#fence44) | indented code |
| [Fence45](../spec/fences.md#fence45) | caret in a math block |
| [Fence46](../spec/fences.md#fence46) | quote |
| [Fence47](../spec/fences.md#fence47) | caret in a math block |
| [Fence52](../spec/fences.md#fence52) | indented code |
| [Fence53](../spec/fences.md#fence53) | indented code |
| [Fence54](../spec/fences.md#fence54) | indented code |
| [Fence55](../spec/fences.md#fence55) | caret in a math block |
| [Fence56](../spec/fences.md#fence56) | caret in a math block |
| [Fence57](../spec/fences.md#fence57) | quote |
| **gaps.md** | |
| [Gap14](../spec/gaps.md#gap14) | caret on a blank line |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | selection across blocks |
| [Indent19](../spec/indent.md#indent19) | line's trailing whitespace |
| [Indent27](../spec/indent.md#indent27) | selection across blocks |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | caret on a code block's fence |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| **move-subtree-down.md** | |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | selection across blocks |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | selection across blocks |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | caret on a code block's fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | caret on a code block's fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | caret on a blank line |
| **move-subtree-up.md** | |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | selection across blocks |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | quote |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret in a marker |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | caret in a math block |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | caret in a math block |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| **obsidian-true-outliner.md** | |
| [Split item becomes first tab-indented child](../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [E18](../spec/obsidian-true-outliner.md#e18) | caret on a blank line |
| [#267, E5](../spec/obsidian-true-outliner.md#267-e5) | quote |
| [S5](../spec/obsidian-true-outliner.md#s5) | caret in a marker |
| [Line break in setext underline refused](../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused) | caret on a blank line |
| [Backspace before the checkbox](../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | option markup: decorated |
| [Outdented child leaves quote above alone](../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone) | quote |
| [Indented item keeps its quote](../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote) | quote |
| [Outdented item keeps its quote](../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote) | quote |
| [Outdented item keeps its code block](../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) | indented code |
| [Blank line added below a quote](../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote) | quote |
| [Outdenting the head of a nested list](../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list) | option outdent: logical |
| [Empty paragraph and blank lines removed](../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed) | option enterOnEmptyItem: outdent |
| [Indented list under paragraph restored](../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored) | option enterOnEmptyItem: outdent |
| [Pasted quote set off from paragraph](../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph) | quote |
| [Pasted list and block become children](../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children) | quote |
| **outdent.md** | |
| [Outdent8](../spec/outdent.md#outdent8) | selection across blocks |
| [Outdent10](../spec/outdent.md#outdent10) | selection across blocks |
| [Outdent12](../spec/outdent.md#outdent12) | selection across blocks |
| [Outdent14](../spec/outdent.md#outdent14) | caret in a marker |
| [LogicalOutdent1](../spec/outdent.md#logicaloutdent1) | option outdent: logical |
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | option outdent: logical |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | option outdent: logical |
| [LogicalOutdent4](../spec/outdent.md#logicaloutdent4) | option outdent: logical |
| [LogicalOutdent6](../spec/outdent.md#logicaloutdent6) | option outdent: logical |
| [LogicalOutdent5](../spec/outdent.md#logicaloutdent5) | option outdent: logical |
| [Outdent16](../spec/outdent.md#outdent16) | caret in a marker |
| [Outdent17](../spec/outdent.md#outdent17) | caret in a heading's #s |
| [Outdent17b](../spec/outdent.md#outdent17b) | option outdent: logical |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a heading's #s |
| [Outdent19](../spec/outdent.md#outdent19) | caret on a code block's fence |
| [Outdent19b](../spec/outdent.md#outdent19b) | option markup: decorated |
| [Outdent20](../spec/outdent.md#outdent20) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| **paste-plain.md** | |
| [Paste41](../spec/paste-plain.md#paste41) | quote |
| [Paste55](../spec/paste-plain.md#paste55) | callout |
| [Paste85b](../spec/paste-plain.md#paste85b) | quote |
| **paste.md** | |
| [Paste2b](../spec/paste.md#paste2b) | option pasteStructuredListForm: own |
| [Paste8](../spec/paste.md#paste8) | option pasteStructuredLines: items |
| [Paste8b](../spec/paste.md#paste8b) | option pasteStructuredLines: items |
| [Paste8c](../spec/paste.md#paste8c) | option pasteStructuredLines: items |
| [Paste12](../spec/paste.md#paste12) | quote |
| [Paste13c](../spec/paste.md#paste13c) | option pasteStructuredListForm: own |
| [Paste13d](../spec/paste.md#paste13d) | option pasteStructuredAtEnd: join |
| [Paste13e](../spec/paste.md#paste13e) | option pasteStructuredAtEnd: join |
| [Paste15b](../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15d](../spec/paste.md#paste15d) | option pasteStructuredListForm: own |
| [Paste16](../spec/paste.md#paste16) | line's trailing whitespace |
| [Paste16b](../spec/paste.md#paste16b) | option pasteStructuredListForm: own |
| [Paste17b](../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17d](../spec/paste.md#paste17d) | option pasteStructuredAtEnd: join |
| [Paste18b](../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste19b](../spec/paste.md#paste19b) | option pasteStructuredAtEnd: join |
| [Paste20b](../spec/paste.md#paste20b) | option pasteStructuredAtEnd: join |
| [Paste23](../spec/paste.md#paste23) | quote |
| [Paste26b](../spec/paste.md#paste26b) | option pasteStructuredAtEnd: join |
| [Paste27b](../spec/paste.md#paste27b) | option pasteStructuredAtEnd: join |
| [Paste27c](../spec/paste.md#paste27c) | option pasteStructuredAtEnd: join |
| [Paste28](../spec/paste.md#paste28) | callout |
| [Paste29](../spec/paste.md#paste29) | quote |
| [Paste36b](../spec/paste.md#paste36b) | option pasteStructuredParagraphList: children |
| [Paste38b](../spec/paste.md#paste38b) | option pasteStructuredParagraphList: children |
| [Paste39](../spec/paste.md#paste39) | option pasteStructuredLines: items |
| [Paste43](../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste46](../spec/paste.md#paste46) | caret on a code block's fence |
| [Paste47](../spec/paste.md#paste47) | caret on a code block's fence |
| [Paste50](../spec/paste.md#paste50) | selection across blocks |
| [Paste56](../spec/paste.md#paste56) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [Paste65](../spec/paste.md#paste65) | caret on a blank line |
| [Paste67](../spec/paste.md#paste67) | caret on a blank line |
| [Paste70](../spec/paste.md#paste70) | later line starting with a list marker |
| [Paste71](../spec/paste.md#paste71) | caret on a code block's fence |
| [Paste72](../spec/paste.md#paste72) | quote |
| [Paste73](../spec/paste.md#paste73) | block's text starting with whitespace |
| [Paste77](../spec/paste.md#paste77) | quote |
| [Paste90](../spec/paste.md#paste90) | quote |
| **placeholders.md** | |
| [Placeholder9](../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder17](../spec/placeholders.md#placeholder17) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder11](../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder15](../spec/placeholders.md#placeholder15) | cursorCharLeft after cursorDocEnd |
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
| [Quote12b](../spec/quotes.md#quote12b) | option outdent: logical |
| [Quote13](../spec/quotes.md#quote13) | callout |
| [Quote14](../spec/quotes.md#quote14) | quote |
| [Quote15](../spec/quotes.md#quote15) | quote |
| [Quote16](../spec/quotes.md#quote16) | quote |
| [Quote17](../spec/quotes.md#quote17) | quote |
| [Quote18](../spec/quotes.md#quote18) | quote |
| [Quote19](../spec/quotes.md#quote19) | quote |
| [Quote20](../spec/quotes.md#quote20) | option outdent: logical |
| [Quote21](../spec/quotes.md#quote21) | quote |
| [Quote22](../spec/quotes.md#quote22) | quote |
| [Quote23](../spec/quotes.md#quote23) | quote |
| [Quote24](../spec/quotes.md#quote24) | quote |
| [Quote25](../spec/quotes.md#quote25) | quote |
| [Quote26](../spec/quotes.md#quote26) | quote |
| [Quote27](../spec/quotes.md#quote27) | quote |
| [Quote28](../spec/quotes.md#quote28) | quote |
| [Quote29](../spec/quotes.md#quote29) | quote |
| [Quote30](../spec/quotes.md#quote30) | quote |
| [Quote31](../spec/quotes.md#quote31) | quote |
| [Quote32](../spec/quotes.md#quote32) | quote |
| [Quote33](../spec/quotes.md#quote33) | quote |
| [Quote34](../spec/quotes.md#quote34) | quote |
| [Quote35](../spec/quotes.md#quote35) | quote |
| [Quote36](../spec/quotes.md#quote36) | quote |
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
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote56](../spec/quotes.md#quote56) | quote |
| [Quote57](../spec/quotes.md#quote57) | callout |
| [Quote58](../spec/quotes.md#quote58) | callout |
| [Quote59](../spec/quotes.md#quote59) | quote |
| [Quote89](../spec/quotes.md#quote89) | quote |
| [Quote90](../spec/quotes.md#quote90) | quote |
| [Quote60](../spec/quotes.md#quote60) | callout |
| [Quote61](../spec/quotes.md#quote61) | callout |
| [Quote62](../spec/quotes.md#quote62) | callout |
| [Quote63](../spec/quotes.md#quote63) | quote |
| [Quote64](../spec/quotes.md#quote64) | quote |
| [Quote65](../spec/quotes.md#quote65) | quote |
| [Quote66](../spec/quotes.md#quote66) | quote |
| [Quote67](../spec/quotes.md#quote67) | quote |
| [Quote68](../spec/quotes.md#quote68) | quote |
| [Quote71](../spec/quotes.md#quote71) | callout |
| [Quote72](../spec/quotes.md#quote72) | quote |
| [Quote73](../spec/quotes.md#quote73) | quote |
| [Quote74](../spec/quotes.md#quote74) | quote |
| [Quote75](../spec/quotes.md#quote75) | quote |
| [Quote76](../spec/quotes.md#quote76) | quote |
| [Quote77](../spec/quotes.md#quote77) | quote |
| [Quote78](../spec/quotes.md#quote78) | quote |
| [Quote79](../spec/quotes.md#quote79) | callout |
| [Quote80](../spec/quotes.md#quote80) | quote |
| [Quote81](../spec/quotes.md#quote81) | quote |
| [Quote82](../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote88](../spec/quotes.md#quote88) | quote |
| [Quote83](../spec/quotes.md#quote83) | quote |
| [Quote84](../spec/quotes.md#quote84) | callout |
| [Quote85](../spec/quotes.md#quote85) | quote |
| [Quote86](../spec/quotes.md#quote86) | quote |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | quote |
| [Quote91b](../spec/quotes.md#quote91b) | quote |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | quote |
| [Quote69](../spec/quotes.md#quote69) | quote |
| [Quote70](../spec/quotes.md#quote70) | quote |
| **scenarios.md** | |
| [Scenario10](../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteStructuredLines: items |
| **shift-enter.md** | |
| [ShiftEnter11](../spec/shift-enter.md#shiftenter11) | block's text ending in a line break |
| [ShiftEnter12](../spec/shift-enter.md#shiftenter12) | block's text ending in a line break |
| [ShiftEnter13](../spec/shift-enter.md#shiftenter13) | changes only what blocks can't show |
| [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b) | changes only what blocks can't show |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret in a marker |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret in a task's checkbox |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| **tasks.md** | |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a task's checkbox |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a task's checkbox |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a task's checkbox |
| [TaskBackspace10](../spec/tasks.md#taskbackspace10) | caret in a heading's #s |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox |
| **typing.md** | |
| [Typing1](../spec/typing.md#typing1) | caret on a blank line |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | cursorCharLeft after cursorDocEnd |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | action deleteSubtree |
