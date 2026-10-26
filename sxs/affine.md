---
type: "SxS"
app: "affine"
version: "0.27.4"
url: "https://app.affine.pro/"
model: "block"
command: "node sxs/run.ts affine"
elapsed_s: 355
workers: 4
---

# AFFiNE vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 191 | [3](#caret-3) | [26](#whitespace-26) | [120](#disagree-120) |  |  | **340** |
| adapted | 158 | [1](#adapted-caret-1) | [24](#adapted-whitespace-24) | [108](#adapted-disagree-108) |  |  | **291** |
| **total** | **349 (31%)** | **4 (0.35%)** | **50 (4.4%)** | **228 (20%)** | **0 (0%)** | **[511](#skipped-511) (45%)** | **1143** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 25 |  | 10 | 25 |  | 25 | **85** | 37 | 23 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** | 1 |  |
| [copy.md](../spec/copy.md) | 3 |  |  | 3 |  | 7 | **13** | 4 | 2 |
| [cursor.md](../spec/cursor.md) | 26 | 3 |  |  |  | 7 | **36** | 25 | 4 |
| [delete-subtree.md](../spec/delete-subtree.md) | 4 |  |  | 1 |  | 8 | **13** | 2 | 3 |
| [delete.md](../spec/delete.md) | 23 |  | 1 | 8 |  | 24 | **56** | 21 | 11 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [enter.md](../spec/enter.md) | 22 |  | 14 | 22 |  | 40 | **98** | 23 | 35 |
| [fences.md](../spec/fences.md) | 7 |  | 1 |  |  | 62 | **70** |  | 8 |
| [gaps.md](../spec/gaps.md) | 13 |  |  | 2 |  | 4 | **19** | 10 | 5 |
| [indent.md](../spec/indent.md) | 19 |  |  | 11 |  | 12 | **42** | 22 | 8 |
| [lists.md](../spec/lists.md) | 15 |  |  |  |  | 1 | **16** | 6 | 9 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 19 |  |  | 12 |  | 9 | **40** | 27 | 4 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 17 |  |  | 10 |  | 15 | **42** | 24 | 3 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 32 |  | 8 | 14 |  | 13 | **67** | 34 | 20 |
| [outdent.md](../spec/outdent.md) | 8 |  |  | 12 |  | 16 | **36** | 15 | 5 |
| [paste-conv.md](../spec/paste-conv.md) | 4 |  |  | 2 |  |  | **6** | 1 | 5 |
| [paste-html.md](../spec/paste-html.md) | 4 |  | 1 | 12 |  | 2 | **19** |  | 17 |
| [paste-list-form.md](../spec/paste-list-form.md) | 2 |  |  | 3 |  | 1 | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 9 |  |  | 15 |  | 5 | **29** | 6 | 18 |
| [paste-plain.md](../spec/paste-plain.md) | 4 |  |  | 23 |  | 9 | **36** | 16 | 11 |
| [paste.md](../spec/paste.md) | 14 |  |  | 7 |  | 15 | **36** | 8 | 13 |
| [placeholders.md](../spec/placeholders.md) | 9 |  | 6 | 2 |  | 3 | **20** | 10 | 7 |
| [quirks.md](../spec/quirks.md) |  |  |  |  |  | 7 | **7** |  |  |
| [quotes.md](../spec/quotes.md) | 7 |  |  | 7 |  | 129 | **143** |  | 14 |
| [regressions.md](../spec/regressions.md) | 12 | 1 | 3 | 15 |  | 33 | **64** | 11 | 20 |
| [scenarios.md](../spec/scenarios.md) | 13 |  | 1 | 11 |  | 1 | **26** | 18 | 7 |
| [shift-enter.md](../spec/shift-enter.md) | 24 |  | 3 | 3 |  | 6 | **36** | 15 | 15 |
| [tasks.md](../spec/tasks.md) | 10 |  | 2 | 4 |  | 14 | **30** |  | 16 |
| [typing.md](../spec/typing.md) |  |  |  | 3 |  |  | **3** | 1 | 2 |
| [undo.md](../spec/undo.md) | 3 |  |  | 1 |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **349 (31%)** | **4 (0.35%)** | **50 (4.4%)** | **228 (20%)** | **0 (0%)** | **512 (45%)** | **1143** | **340 (30%)** | **291 (25%)** |

## Disagree (120)

### [Backspace1](../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace5](../spec/backspace.md#backspace5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace8](../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  b
¶ ┃c
```

</td><td>

```buffer
- a
  
  b┃c
```

</td></tr>
</table>

### [Backspace23](../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace26](../spec/backspace.md#backspace26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
```

</td><td>

```buffer
¶ 
```

</td><td>

```buffer
¶ ┃para
```

</td></tr>
</table>

### [Backspace29](../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
3. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

### [Backspace40](../spec/backspace.md#backspace40)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [SoftBackspace11](../spec/backspace.md#softbackspace11)

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

> deleteSoftLineBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃ # b
```

</td><td>

```buffer
¶ ┃\# b
```

</td></tr>
</table>

### [Backspace43b](../spec/backspace.md#backspace43b)

> enter deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃Title
```

</td><td>

```buffer
¶ # 
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace47](../spec/backspace.md#backspace47)

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

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃ # b
```

</td><td>

```buffer
¶ ┃\# b
```

</td></tr>
</table>

### [Copy4](../spec/copy.md#copy4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - k┃id
    - g
- b
```

</td></tr>
</table>

> copy

### [Copy9](../spec/copy.md#copy9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - g
- c
```

</td></tr>
</table>

> copy

### [Cut4](../spec/copy.md#cut4)

> cut

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
  - kid
- three
```

</td><td>

```buffer
- one ┃two
  - kid
- three
```

</td><td>

```buffer
- ┃three
```

</td></tr>
</table>

### [DeleteSubtree2](../spec/delete-subtree.md#deletesubtree2)

> deleteSubtree

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
3. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
  - c
  - b
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - d
    - c
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

### [Delete5d](../spec/delete.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Delete7](../spec/delete.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Delete12](../spec/delete.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Delete31](../spec/delete.md#delete31)

> deleteContentForward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Enter3](../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Enter3c](../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

```buffer
9. a
   1. ┃ b
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
<tr><th>affine</th><th>ourus</th></tr>
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

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter32b](../spec/enter.md#enter32b)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃H1
```

</td><td>

```buffer
¶ # 
¶ # ┃H1
```

</td><td>

```buffer
¶ # 
  ¶ ┃H1
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter44](../spec/enter.md#enter44)

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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
¶ ┃ three
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

### [Enter60b](../spec/enter.md#enter60b)

> enter deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # title┃ - x
```

</td><td>

```buffer
¶ # title
  ¶ ┃ - x
```

</td><td>

```buffer
¶ # title┃- x
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para a
¶ para b┃
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Para┃
```

</td><td>

```buffer
- Para┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ Para┃
```

</td></tr>
</table>

### [Indent23](../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Indent29](../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ para┃
```

</td><td>

```buffer
- a
  ¶ para┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
¶ para┃
```

</td><td>

```buffer
1. a
   ¶ para┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
  ¶ para┃
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [MoveDown22](../spec/move-subtree-down.md#movedown22)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
2. b
1. a┃
```

</td><td>

```buffer
1. b
2. a┃
```

</td></tr>
</table>

### [MoveDown23](../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

```buffer
10. b
9. a┃
   - x
```

</td><td>

```buffer
9. b
10. a┃
    - x
```

</td></tr>
</table>

### [MoveDown30](../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
10. b
    - x
9. a┃
```

</td><td>

```buffer
9. b
   - x
10. a┃
```

</td></tr>
</table>

### [MoveDown35](../spec/move-subtree-down.md#movedown35)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. ┃x
   2. b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   2. b
   3. ┃x
```

</td><td>

```buffer
1. a
   1. b
   2. ┃x
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. ┃x
   2. b
```

</td></tr>
</table>

### [MoveDown36](../spec/move-subtree-down.md#movedown36)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [MoveUp14](../spec/move-subtree-up.md#moveup14)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
```

</td><td>

```buffer
2. b┃
1. a
```

</td><td>

```buffer
1. b┃
2. a
```

</td></tr>
</table>

### [MoveUp15](../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
10. b┃
9. a
   - x
```

</td><td>

```buffer
9. b┃
10. a
    - x
```

</td></tr>
</table>

### [MoveUp16](../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃
  
  para
```

</td><td>

```buffer
- item
- ┃
  
  para
```

</td><td>

```buffer
- item
  - ┃
  ¶ para
```

</td></tr>
</table>

### [TO-E15](../spec/obsidian-true-outliner.md#to-e15)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Head┃line
  - item
```

</td><td>

```buffer
¶ # Head
¶ # ┃line
  - item
```

</td><td>

```buffer
¶ # Head
  ¶ ┃line
  - item
```

</td></tr>
</table>

### [TO-E33](../spec/obsidian-true-outliner.md#to-e33)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO-E13-E16b](../spec/obsidian-true-outliner.md#to-e13-e16b)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # He┃ad
  ¶ ## Sub
```

</td><td>

```buffer
¶ # He
¶ # ┃ad
  ¶ ## Sub
```

</td><td>

```buffer
¶ # He
  ¶ ┃ad
  ¶ ## Sub
```

</td></tr>
</table>

### [TO-E14-E20](../spec/obsidian-true-outliner.md#to-e14-e20)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Head┃line
  ¶ Body.
```

</td><td>

```buffer
¶ # Head
¶ # ┃line
  ¶ Body.
```

</td><td>

```buffer
¶ # Head
  ¶ ┃line
  ¶ Body.
```

</td></tr>
</table>

### [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ foo┃
  bar
```

</td><td>

```buffer
¶ ┃foo
  
  bar
```

</td><td>

```buffer
¶ ┃foo
¶ bar
```

</td></tr>
</table>

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
3. q
```

</td><td>

```buffer
1. p┃
2. q
```

</td></tr>
</table>

### [TO2](../spec/obsidian-true-outliner.md#to2)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO4](../spec/obsidian-true-outliner.md#to4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO5](../spec/obsidian-true-outliner.md#to5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
  2. b
```

</td><td>

```buffer
- p┃a
  1. b
```

</td></tr>
</table>

### [TO6](../spec/obsidian-true-outliner.md#to6)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
5. c
```

</td><td>

```buffer
3. a┃b
4. c
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

```buffer
- a
¶ b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- b┃
```

</td><td>

```buffer
¶ para
¶ b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- b┃
```

</td></tr>
</table>

### [DirectOutdent2](../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
¶ a┃
- b
```

</td></tr>
</table>

### [DirectOutdent3](../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [DirectOutdent4](../spec/outdent.md#directoutdent4)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- a┃
- b
```

</td><td>

```buffer
¶ para
- a┃
- b
```

</td><td>

```buffer
¶ para
¶ a┃
- b
```

</td></tr>
</table>

### [DirectOutdent5](../spec/outdent.md#directoutdent5)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
```

</td><td>

```buffer
- a
- b┃
- c
```

</td><td>

```buffer
- a
¶ b┃
- c
```

</td></tr>
</table>

### [DirectOutdent6](../spec/outdent.md#directoutdent6)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
¶ b┃
1. c
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

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- x
- y┃
  - kid
```

</td><td>

```buffer
- 
  - x
  - y┃
  - kid
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
¶ y┃b
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
¶ y┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax
¶ y┃b
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
¶ 2\. y┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ 1┃
```

</td><td>

```buffer
¶ 1\. a
¶ b┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
- 2a
2. b┃. y
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px
¶  y┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px
¶  
¶ y┃
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
¶ y┃ b
- c
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
-     first
¶     second┃a
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ab┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H┃
```

</td><td>

```buffer
¶ # Hx
  ¶ y┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
¶ y┃b
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  ¶ para
```

</td><td>

```buffer
¶ # Tx
  ¶ y┃
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

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  - z
```

</td><td>

```buffer
¶ # Tx
  - y┃
  - z
```

</td><td>

```buffer
¶ # T
  - x
  - y┃
  - z
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

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
¶ ## B
```

</td><td>

```buffer
¶ ## Ah
  ¶ text┃
  ¶ p
¶ ## B
```

</td><td>

```buffer
¶ ## A
¶ ## h
  ¶ text┃
  ¶ p
¶ ## B
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

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
```

</td><td>

```buffer
¶ ## Ah
  ¶ text┃
  ¶ p
```

</td><td>

```buffer
¶ ## A
  ¶ ### h
    ¶ text┃
    ¶ p
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H1
  ¶ ┃H2
```

</td><td>

```buffer
¶ # H1
  ¶ ## ┃H2
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶  # b
¶ after┃
```

</td><td>

```buffer
¶ \# b
¶ after
```

</td></tr>
</table>

### [Regression8](../spec/regressions.md#regression8)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  2. ┃x
```

</td><td>

```buffer
- a
  2. ┃x
  - b
```

</td><td>

```buffer
- a
  1. ┃x
  - b
```

</td></tr>
</table>

### [Regression9](../spec/regressions.md#regression9)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Regression24](../spec/regressions.md#regression24)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ revise ┃2\. draft
```

</td></tr>
</table>

> enter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ revise 
¶ ┃2\. draft
```

</td><td>

```buffer
¶ revise
¶ ┃2\. draft
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ revise ┃2\. draft
```

</td><td>

```buffer
¶ revise┃2. draft
```

</td></tr>
</table>

### [Regression25](../spec/regressions.md#regression25)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- revise ┃2\. draft
```

</td></tr>
</table>

> enter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise 
- ┃2\. draft
```

</td><td>

```buffer
- revise
- ┃2\. draft
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise 
¶ ┃2\. draft
```

</td><td>

```buffer
- revise┃2. draft
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Scenario13](../spec/scenarios.md#scenario13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. one
2. two┃
3. three
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
2. two┃
1. one
3. three
```

</td><td>

```buffer
1. two┃
2. one
3. three
```

</td></tr>
</table>

> moveSubtreeDown moveSubtreeDown

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. one
3. three
2. two┃
```

</td><td>

```buffer
1. one
2. three
3. two┃
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Scenario21b](../spec/scenarios.md#scenario21b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ One.┃ Two.
```

</td></tr>
</table>

> enter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ One.
¶ ┃ Two.
```

</td><td>

```buffer
¶ One.
¶ ┃Two.
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ One.┃ Two.
```

</td><td>

```buffer
¶ One.┃Two.
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Undo5](../spec/undo.md#undo5)

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
<tr><th>affine</th><th>ourus</th></tr>
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

</td></tr>
</table>

> undo

<table>
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

</td></tr>
</table>

## Whitespace (26)

### [Backspace7](../spec/backspace.md#backspace7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Backspace30](../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
  ¶ ┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter1](../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Enter12](../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ some┃ text
```

</td><td>

```buffer
¶ some
¶ ┃ text
```

</td><td>

```buffer
¶ some
¶ ┃text
```

</td></tr>
</table>

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Enter35](../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

```buffer
1. abc 
2. ┃2\. def
```

</td><td>

```buffer
1. abc
2. ┃2\. def
```

</td></tr>
</table>

### [Enter37](../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [TO-E4](../spec/obsidian-true-outliner.md#to-e4)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO-E9](../spec/obsidian-true-outliner.md#to-e9)

> enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ one┃ two
- child
```

</td><td>

```buffer
¶ one
¶ ┃ two
- child
```

</td><td>

```buffer
¶ one
¶ ┃two
- child
```

</td></tr>
</table>

### [TO12](../spec/obsidian-true-outliner.md#to12)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Placeholder9](../spec/placeholders.md#placeholder9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃ b
  - c
```

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
  - c┃
```

</td><td>

```buffer
- b
  - c
```

</td></tr>
</table>

### [Regression44](../spec/regressions.md#regression44)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] x┃
       - b
```

</td><td>

```buffer
- [x] ┃
       - b
```

</td><td>

```buffer
- 
  [x] ┃
       - b
```

</td></tr>
</table>

### [Scenario3](../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  ¶ ┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

## Caret (3)

### [CursorUp2](../spec/cursor.md#cursorup2)

> cursorLineUp

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Regression46](../spec/regressions.md#regression46)

> outdent

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b c
  - 
    ┃[ ] 
    2\) x
```

</td><td>

```buffer
- b c
- 
  ┃[ ] 
  2\) x
```

</td><td>

```buffer
- b c
- 
  [ ] 
  ┃2\) x
```

</td></tr>
</table>

## Adapted: disagree (108)

### [Backspace18](../spec/backspace.md#backspace18)

> deleteContentBackward

Adapted: under headingEditing: block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Hello
  ¶ body
```

</td><td>

```buffer
¶ para
¶ ┃Hello
¶ body
```

</td><td>

```buffer
¶ para┃Hello
¶ body
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
para┃Hello

body
```

</td></tr>
</table>

### [Backspace18c](../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: setext heading, under headingEditing: block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃Title
  ¶ text
```

</td><td>

```buffer
¶ ┃Title
¶ text
```

</td><td>

```buffer
¶ # ┃Title
  ¶ text
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
===

text
```

</td></tr>
</table>

### [Backspace18d](../spec/backspace.md#backspace18d)

> deleteContentBackward

Adapted: under headingEditing: block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
¶ # ┃H1
  ¶ text
```

</td><td>

```buffer
¶ a
¶ ┃H1
¶ text
```

</td><td>

```buffer
¶ a┃H1
¶ text
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
a┃H1

text
```

</td></tr>
</table>

### [Backspace18f](../spec/backspace.md#backspace18f)

> deleteContentBackward

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Title
```

</td><td>

```buffer
¶ para
¶ ┃Title
```

</td><td>

```buffer
¶ para┃Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

┃Title
=====
```

</td><td>

```buffer
para┃Title
```

</td></tr>
</table>

### [Backspace21](../spec/backspace.md#backspace21)

> deleteContentBackward

Adapted: blank lines

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Backspace35](../spec/backspace.md#backspace35)

> deleteContentBackward

Adapted: under headingEditing: block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ intro
  ¶ ## ┃B
    ¶ para
    - item
  ¶ ## C
```

</td><td>

```buffer
¶ # A
  ¶ intro
  ¶ ┃B
  ¶ para
  - item
  ¶ ## C
```

</td><td>

```buffer
¶ # A
  ¶ intro┃B
  ¶ para
  - item
  ¶ ## C
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

intro┃B

para

- item

## C
```

</td></tr>
</table>

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
  m
```

</td><td>

```buffer
- 
  m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
  ┃m
```

</td><td>

```buffer
- 
  m┃
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
- [ ] ┃
  m
```

</td><td>

```buffer
- [ ] 
  m┃
```

</td></tr>
</table>

### [Backspace49](../spec/backspace.md#backspace49)

> deleteContentBackward

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- ┃i
  | a |
  |---|
```

</td><td>

```buffer
¶ para
¶ ┃i
  | a |
  |---|
```

</td><td>

```buffer
¶ para┃i
  | a |
  |---|
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- ┃i
| a |
|---|
```

</td><td>

```buffer
para┃i
| a |
|\---|
```

</td></tr>
</table>

### [Delete33](../spec/delete.md#delete33)

Adapted: list as an item's first block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
  - b
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a┃
  - b
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- - b
```

</td><td>

```buffer
- a┃
  - b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Enter27](../spec/enter.md#enter27)

> enter

Adapted: under enterOnEmptyItem: unwrap

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
  ¶ ┃
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
  - ┃
  - c
```

</td><td>

```buffer
- a
  - b

  ┃◌

  - c
```

</td></tr>
</table>

### [Enter28](../spec/enter.md#enter28)

Adapted: under enterOnEmptyItem: unwrap

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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - c
```

</td><td>

```buffer
- a
  
  ┃
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ ┃
- c
```

</td><td>

```buffer
- a
  
  ┃
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

  ┃◌

  - c
```

</td><td>

```buffer
- a

  ┃◌

  - c
```

</td></tr>
</table>

### [Enter32](../spec/enter.md#enter32)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Title
  ¶ body
```

</td><td>

```buffer
¶ para
¶ # 
¶ # ┃Title
  ¶ body
```

</td><td>

```buffer
¶ para
¶ # 
  ¶ ┃Title
  ¶ body
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

# 
┃Title

body
```

</td></tr>
</table>

### [Enter41](../spec/enter.md#enter41)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Title ┃- x
  - y
```

</td><td>

```buffer
¶ # Title 
¶ # ┃- x
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

Adapted: escape, setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # title ┃- x
```

</td><td>

```buffer
¶ # title 
¶ # ┃- x
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter45](../spec/enter.md#enter45)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
¶ # ┃Title
```

</td><td>

```buffer
¶ para
¶ # 
¶ # ┃Title
```

</td><td>

```buffer
¶ para
¶ # 
  ¶ ┃Title
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
# 
┃Title
```

</td></tr>
</table>

### [Enter47](../spec/enter.md#enter47)

Adapted: escape

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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [Note]: this ┃matters a lot
```

</td><td>

```buffer
¶ [Note]: this┃matters a lot
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
[Note]\: this

┃matters a lot
```

</td><td>

```buffer
[Note]: this┃matters a lot
```

</td></tr>
</table>

### [Enter48](../spec/enter.md#enter48)

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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
¶ ┃c
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
- [a]\: b
- ┃c
```

</td><td>

```buffer
- [a]\: b┃c
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  
¶ ## ┃two
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  
  ¶ ┃two
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  two
¶ ## ┃
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

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  ┃two
¶ ## three
```

</td><td>

```buffer
¶ ## one
  
¶ ## ┃two
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃a
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
  #┃a
```

</td><td>

```buffer
¶ p
  \# ┃a
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

### [Enter60](../spec/enter.md#enter60)

Adapted: escape, setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # title┃ - x
```

</td></tr>
</table>

> enter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # title
¶ # ┃ - x
```

</td><td>

```buffer
¶ # title
  ¶ ┃- x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # title
  ¶ ┃ - x
```

</td><td>

```buffer
¶ # title┃- x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
title┃ - x
===
```

</td><td>

```buffer
title
===
┃\- x
```

</td><td>

```buffer
title┃- x
===
```

</td></tr>
</table>

### [Indent16](../spec/indent.md#indent16)

> indent

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Indent18](../spec/indent.md#indent18)

> indent

Adapted: bullet +

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ intro
¶ b┃
```

</td><td>

```buffer
¶ intro
¶ b┃
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

### [TO-E17](../spec/obsidian-true-outliner.md#to-e17)

> enter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Hello┃ world
```

</td><td>

```buffer
¶ # Hello
¶ # ┃ world
```

</td><td>

```buffer
¶ # Hello
  ¶ ┃world
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

### [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
    first

    > quote
```

</td></tr>
</table>

> paste

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## H┃
  ¶ below
```

</td><td>

```buffer
¶ ## H    first
  ¶     > quote┃
  ¶ below
```

</td><td>

```buffer
¶ ## H
  ¶ first
  ¶ > quote┃
  ¶ below
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## H┃
below
```

</td><td>

```buffer
## H

first

> quote┃

below
```

</td></tr>
</table>

### [Outdent20](../spec/outdent.md#outdent20)

> outdent

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
  | a | b |
  |---|---|
```

</td><td>

```buffer
- t1┃
  | a | b |
  |---|---|
```

</td><td>

```buffer
¶ t1┃
  | a | b |
  |---|---|
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
| a | b |
|---|---|
```

</td><td>

```buffer
t1┃
| a | b |
|\---|---|
```

</td></tr>
</table>

### [Outdent20b](../spec/outdent.md#outdent20b)

> outdent

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
  ===
```

</td><td>

```buffer
- t1┃
  ===
```

</td><td>

```buffer
¶ t1┃
  ===
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
===
```

</td><td>

```buffer
t1┃
\===
```

</td></tr>
</table>

### [Outdent21](../spec/outdent.md#outdent21)

> outdent

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
¶ y┃
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
¶ - y┃
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).
- x **b**
- y
- z┃
```

</td><td>

```buffer
- x **b**
  - y
- z┃
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
- x **b**
  - y
- z┃
```

</td></tr>
</table>

### [PasteHtml4](../spec/paste-html.md#pastehtml4)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x b
    y
z
```

</td><td>

```clipboard
<ul><div rem="true" showbullet="true">x <b>b</b><ul><div rem="true" showbullet="true">y</div></ul></div><div rem="true" showbullet="true">z</div></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ x **b**
¶ y
¶ z┃
```

</td><td>

```buffer
- x **b**
  - y
- z┃
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
- x **b**
  - y
- z┃
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

Adapted: empty document, task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
-  done
-  todo┃
```

</td><td>

```buffer
- [x] done
- [ ] todo┃
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
- [x] done
- [ ] todo┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```
  let a = 1;
  let b = 2;
  ┃
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

### [PasteHtml10](../spec/paste-html.md#pastehtml10)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Title
para bold c
```

</td><td>

```clipboard
<h2>Title</h2><p>para <b>bold</b> <code>c</code></p>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ## Title
  ¶ para **bold**`c`┃
```

</td><td>

```buffer
¶ ## Title
  ¶ para **bold** `c`┃
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
## Title

para **bold** `c`┃
```

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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ line one
¶ line two
¶ p2┃
```

</td><td>

```buffer
¶ line one
  line two
¶ p2┃
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
line two

p2┃
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- a **b***i*`c`~~s~~[l](https://e.x/p)
- z┃
```

</td><td>

```buffer
- a **b** *i* `c` ~~s~~ [l](https://e.x/p)
- z┃
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
- a **b** *i* `c` ~~s~~ [l](https://e.x/p)
- z┃
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

Adapted: empty document, escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- 1\. not a list, *x* and [y]
- # not a heading┃
```

</td><td>

```buffer
- 1\. not a list, \*x\* and \[y\]
- # not a heading┃
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
- 1\. not a list, \*x\* and \[y\]
- \# not a heading┃
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

Adapted: code block, empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ## Setup
  ¶ ┃
```

</td><td>

````buffer
¶ ## Setup
  ¶ ```shell
    npm install┃
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
## Setup

```shell
npm install┃
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- **Bold** start
- *nested*┃
```

</td><td>

```buffer
- **Bold** start
  - *nested*┃
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
- **Bold** start
  - *nested*┃
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ·one
¶ onested┃
```

</td><td>

```buffer
- one
  - nested┃
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
- one
  - nested┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```
  let a = 1;┃
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

</td><td>

```buffer
1. ax
2. y┃
3. b
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
2. y┃
3. b
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- x
- y┃
```

</td><td>

```buffer
- [ ] x
- y┃
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
- [ ] x
- y┃
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- aone
¶ two
- x┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ac┃
- b
```

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

Adapted: code block, under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ax
¶ ```
  c┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- ac┃
  - kid
```

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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
¶ ```
  c┃
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ah
¶ text┃
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

### [PasteList17](../spec/paste-list.md#pastelist17)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
> q
```

</td></tr>
</table>

> paste

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
¶ > q┃
```

</td><td>

```buffer
- a
- > q┃
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
- > q┃
```

</td></tr>
</table>

### [PasteList17b](../spec/paste-list.md#pastelist17b)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
> q
```

</td></tr>
</table>

> paste

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b1
```

</td><td>

```buffer
- a
¶ > q┃
- b1
```

</td><td>

```buffer
- a
- > q┃
  - b1
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
  - b1
```

</td><td>

```buffer
- a
- > q┃
  - b1
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- d
```

</td><td>

````buffer
- ax
  ¶ ```
    c
    ```
¶   ```┃b
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
  ¶ ```
    
    ```
¶   code
¶ ```
  ┃
  ```
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
  ¶ ```
    
    ```
¶   code┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
¶ ▮ <affine:latex> 
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃words
```

</td><td>

```buffer
¶ a
- b┃words
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]: ┃b c
```

</td><td>

```buffer
¶ [a]: x┃b c
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- ax
- y┃f
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

### [PastePlain18](../spec/paste-plain.md#pasteplain18)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
# y
```

</td></tr>
</table>

> pastePlain

Adapted: escape, quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a«bc
  de»f
```

</td><td>

```buffer
¶ > ax
¶ # y┃f
```

</td><td>

```buffer
¶ > ax
  \# y┃f
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a«bc
> de»f
```

</td><td>

```buffer
> ax
> \# y┃f
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃more
```

</td><td>

```buffer
¶ ## Titlex
  ¶ y┃more
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶   ```
    ┃
    ```
````

</td><td>

````buffer
¶   ```
    a
¶   b┃
    ```
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
¶ q
```

</td><td>

```buffer
¶ pc┃
¶ q
```

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

Adapted: blank lines, under pasteSeams: open

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Quote27](../spec/quotes.md#quote27)

> moveSubtreeUp

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > q
¶ # H┃
```

</td><td>

```buffer
¶ # H┃
  ¶ > q
```

</td><td>

```buffer
¶ > q
¶ # H┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
# H┃
```

</td><td>

```buffer
> q
# H┃
```

</td></tr>
</table>

### [Quote94](../spec/quotes.md#quote94)

> deleteContentBackward

Adapted: quote, task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  >┃q
- b
```

</td><td>

```buffer
- a
- [ ] ┃q
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
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] ┃q
- b
```

</td></tr>
</table>

### [QuoteText6](../spec/quotes.md#quotetext6)

Adapted: quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
¶ > q
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃q
```

</td><td>

```buffer
- a┃
¶ q
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

```buffer
- a┃

q
```

</td><td>

```buffer
- a┃q
```

</td></tr>
</table>

### [QuoteText13](../spec/quotes.md#quotetext13)

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

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > See ┃here.
```

</td><td>

```buffer
¶ > See x
¶ y┃here.
```

</td><td>

```buffer
¶ > See x
¶ > y
  ┃here.
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> See ┃here.
```

</td><td>

```buffer
> See x

> y
> ┃here.
```

</td></tr>
</table>

### [QuoteText18](../spec/quotes.md#quotetext18)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ > ┃b
```

</td><td>

```buffer
- a
  ¶ > ┃b
```

</td><td>

```buffer
- a
- > ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
> ┃b
```

</td><td>

```buffer
- a
- > ┃b
```

</td></tr>
</table>

### [QuoteText19](../spec/quotes.md#quotetext19)

> enter

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ┃
```

</td><td>

```buffer
¶ > 
  ┃
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
> ┃◌
```

</td><td>

```buffer
┃◌
```

</td></tr>
</table>

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

Adapted: bullet *

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
  2. x
```

</td><td>

```buffer
- a
  ¶ ┃b
  2. x
```

</td><td>

```buffer
- a┃b
  1. x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * ┃b
  2) x
```

</td><td>

```buffer
* a┃b
  1) x
```

</td></tr>
</table>

### [Regression2](../spec/regressions.md#regression2)

> deleteContentBackward

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  1\. 
- ┃b
```

</td><td>

```buffer
- a
  1\. 
¶ ┃b
```

</td><td>

```buffer
- a
  1\. ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  1.␠
- ┃b
```

</td><td>

```buffer
- a
  1\. ┃b
```

</td></tr>
</table>

### [Regression14](../spec/regressions.md#regression14)

> outdent

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Regression15](../spec/regressions.md#regression15)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard

x
```

</td></tr>
</table>

> pastePlain

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  ┃more
```

</td><td>

```buffer
¶ ## Title
  x┃more
```

</td><td>

```buffer
¶ ## Title
  ┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title
┃more
---
```

</td><td>

```buffer
Title
┃more
---
```

</td></tr>
</table>

### [Regression30](../spec/regressions.md#regression30)

> indent

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
  →- a
```

</td><td>

```buffer
¶ ┃para
  →- a
```

</td><td>

```buffer
- ┃para
  →- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃para
→- a
```

</td><td>

```buffer
- ┃para
  →\- a
```

</td></tr>
</table>

### [Regression36](../spec/regressions.md#regression36)

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

> pastePlain

Adapted: escape, quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a┃b
  c
```

</td><td>

````buffer
¶ > ax
¶ ```
  c
  ```
¶   ```┃b
  c
````

</td><td>

````buffer
¶ > a- x
¶ > ```
    c
    ```┃b
  c
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃b
> c
```

</td><td>

````buffer
> a- x

> \```
>   c
>   \```┃b
> c
````

</td></tr>
</table>

### [Regression37](../spec/regressions.md#regression37)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ > q┃
  | a | b |
  |---|---|
```

</td><td>

```buffer
- a
  ¶ > q┃
    | a | b |
    |---|---|
```

</td><td>

```buffer
- a
- > q┃
  | a | b |
  |---|---|
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> q┃
| a | b |
|---|---|
```

</td><td>

```buffer
- a
- > q┃
  | a | b |
  |---|---|
```

</td></tr>
</table>

### [Regression49](../spec/regressions.md#regression49)

> outdent

Adapted: blank lines

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. 
   1. x
   - x
- a
      «- b
      1. x»
```

</td><td>

```buffer
1. 
   1. x
   - x
- a
      «- b
      1. x»
```

</td><td>

```buffer
1. 
   1. x
   - x
¶ a
      «- b
      1. x»
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. 
    1. x

      - x
- a
      «- b
      1. x»
```

</td><td>

```buffer
1. 
    1. x

      - x

a
    «- b
    1. x»
```

</td></tr>
</table>

### [Regression55](../spec/regressions.md#regression55)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
# y
```

</td></tr>
</table>

> pastePlain

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. x
   - 
     [x] 
       cont┃
```

</td><td>

```buffer
1. x
   - 
     [x] 
       contx
   ¶ # y┃
```

</td><td>

```buffer
1. x
   - 
     [x] 
       contx
     \# y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. x
    - [x] 
  cont┃
```

</td><td>

```buffer
1. x
    - [x] 
        contx
      \# y┃
```

</td></tr>
</table>

### [Regression56](../spec/regressions.md#regression56)

> enter

Adapted: quote, task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  > 
- [ ] ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  > ┃q
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
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  > ┃q
- b
```

</td></tr>
</table>

### [Regression57](../spec/regressions.md#regression57)

> enter

Adapted: quote, under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  > 
- [ ] ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  
  > ┃q
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
- [ ] 
  > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 

  > ┃q
- b
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶  ┃ and eggs
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ ┃  and eggs
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ 
¶ today:┃  and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ 
¶ today:  and eggs
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ 
¶ today:  and eggs┃call A
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

### [Scenario15](../spec/scenarios.md#scenario15)

Adapted: task, under taskEditing: unwrap

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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  ¶ two loaves
  ¶ 
  ¶ ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
- two loaves
¶ ┃
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

┃◌
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

```buffer
- examplecode!┃
- next
```

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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
¶ # revise ┃2. draft
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
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
¶ # revise 
  ┃2\. draft
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

### [ShiftEnter25](../spec/shift-enter.md#shiftenter25)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [ShiftEnter28](../spec/shift-enter.md#shiftenter28)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  \- ┃a
```

</td><td>

```buffer
- p
  \-
  ┃a
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td><td>

```buffer
- p
  \-
  ┃a
```

</td><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

### [TaskEnter5](../spec/tasks.md#taskenter5)

> enter

Adapted: task, under enterOnEmptyItem: unwrap

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
- [ ] ┃
  - c
```

</td><td>

```buffer
- a
  - b
  ¶ ┃
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

  ┃◌

  - c
```

</td></tr>
</table>

### [TaskEnter6](../spec/tasks.md#taskenter6)

> enter

Adapted: task, under enterOnEmptyItem: unwrap

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
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
  
  ┃
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

  ┃◌

  - b
```

</td></tr>
</table>

### [TaskEnter7](../spec/tasks.md#taskenter7)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Typing1](../spec/typing.md#typing1)

> "---"

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ┃
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

## Adapted: whitespace (24)

### [Backspace44](../spec/backspace.md#backspace44)

> deleteContentBackward

Adapted: blank lines

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter8](../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Enter10](../spec/enter.md#enter10)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

┃[a]\: /url
```

</td></tr>
</table>

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [Fence3](../spec/fences.md#fence3)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO-E32](../spec/obsidian-true-outliner.md#to-e32)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5)

> enter

Adapted: quote

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H
  ¶ para┃ text
  ¶ > q
```

</td><td>

```buffer
¶ # H
  ¶ para
  ¶ ┃ text
  ¶ > q
```

</td><td>

```buffer
¶ # H
  ¶ para
  ¶ ┃text
  ¶ > q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
para┃ text
> q
```

</td><td>

```buffer
# H
para

┃text
> q
```

</td></tr>
</table>

### [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8)

> shiftEnter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Hello┃ world
```

</td><td>

```buffer
¶ # Hello
  ┃ world
```

</td><td>

```buffer
¶ # Hello
  world
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
┃ world
====
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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- x 
  - y
- z┃
```

</td><td>

```buffer
- x
  - y
- z┃
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
- x
  - y
- z┃
```

</td></tr>
</table>

### [Placeholder17](../spec/placeholders.md#placeholder17)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a┃ ``` x
- b
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- ┃ ``` x
- b
````

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  ``` x
- b┃
````

</td><td>

````buffer
- ``` x
- b
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorDocEnd</th></tr>
<tr valign="top"><td>

````buffer
- a┃ ``` x
- b
````

</td><td>

````buffer
- ┃◌ ``` x
- b
````

</td><td>

````buffer
- \``` x
- b
````

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
<tr><th>affine</th><th>ourus</th></tr>
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

### [Regression5](../spec/regressions.md#regression5)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]: ┃/url
```

</td><td>

```buffer
¶ [a]: 
¶ ┃/url
```

</td><td>

```buffer
¶ [a]:
¶ ┃/url
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
\[a]: ┃/url
```

</td><td>

```buffer
\[a]:

┃/url
```

</td></tr>
</table>

### [Regression27](../spec/regressions.md#regression27)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ revise ┃2\. a
  3\. b
```

</td><td>

```buffer
¶ revise 
¶ ┃2\. a
  3\. b
```

</td><td>

```buffer
¶ revise
¶ ┃2\. a
  3\. b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. a
3\. b
```

</td><td>

```buffer
revise

┃2\. a
3\. b
```

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
<tr><th>affine</th><th>ourus</th></tr>
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
<tr><th>affine</th><th>ourus</th></tr>
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

### [TaskEnter3](../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

### [TaskBackspace3c](../spec/tasks.md#taskbackspace3c)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - c
```

</td><td>

```buffer
- a
  ¶ ┃
  - c
```

</td><td>

```buffer
- a
  
  ┃
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
  - [ ] ┃
  - c
```

</td><td>

```buffer
- a

  ┃◌

  - c
```

</td></tr>
</table>

## Adapted: caret (1)

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: task

<table>
<tr><th>buffer</th><th>affine</th><th>ourus</th></tr>
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

## Skipped (512)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12c](../spec/backspace.md#backspace12c) | changes only what blocks can't show |
| [Backspace16](../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18e](../spec/backspace.md#backspace18e) | heading as a list item (a heading is a block of its own) |
| [Backspace18g](../spec/backspace.md#backspace18g) | heading as a list item (a heading is a block of its own) |
| [Backspace24](../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | option quotes: container |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | tag markup-fence |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [Backspace42](../spec/backspace.md#backspace42) | caret in a marker |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43](../spec/backspace.md#backspace43) | changes only what blocks can't show |
| [Backspace43c](../spec/backspace.md#backspace43c) | changes only what blocks can't show |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
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
| [Copy5](../spec/copy.md#copy5) | option copySelection: nodes |
| [Copy6](../spec/copy.md#copy6) | option copyAtCaret: host |
| [Copy7](../spec/copy.md#copy7) | option copySelection: nodes |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | option copySelection: nodes |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | caret on a code block's fence |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | quote as a list item (a quote is a block of its own) |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete5f](../spec/delete.md#delete5f) | option emptyItemWithChildren: refuse |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
| [Delete11](../spec/delete.md#delete11) | tag markup-fence |
| [Delete13g](../spec/delete.md#delete13g) | heading as a list item (a heading is a block of its own) |
| [Delete15](../spec/delete.md#delete15) | heading's closing #s |
| [Delete16](../spec/delete.md#delete16) | option markup: decorated |
| [Delete16b](../spec/delete.md#delete16b) | option markup: decorated |
| [Delete16c](../spec/delete.md#delete16c) | option markup: decorated |
| [Delete16d](../spec/delete.md#delete16d) | option markup: decorated |
| [Delete16e](../spec/delete.md#delete16e) | option markup: decorated |
| [Delete16f](../spec/delete.md#delete16f) | option markup: decorated |
| [Delete18c](../spec/delete.md#delete18c) | changes only what blocks can't show |
| [Delete18d](../spec/delete.md#delete18d) | changes only what blocks can't show |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | caret in a marker |
| [Delete24](../spec/delete.md#delete24) | caret in a marker |
| [Delete25](../spec/delete.md#delete25) | caret in a marker |
| [Delete29](../spec/delete.md#delete29) | caret in a marker |
| [Delete31b](../spec/delete.md#delete31b) | option joinWithChildren: refuse |
| [Delete34](../spec/delete.md#delete34) | option quotes: container |
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
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter7b](../spec/enter.md#enter7b) | option enterOnEmptyItem: outdent |
| [Enter15b](../spec/enter.md#enter15b) | option enterOnEmptyItem: outdent |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter33b](../spec/enter.md#enter33b) | changes only what blocks can't show |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65](../spec/enter.md#enter65) | option enterSplitSpace: start |
| [Enter65b](../spec/enter.md#enter65b) | option enterSplitSpace: start |
| [Enter65c](../spec/enter.md#enter65c) | option enterSplitSpace: start |
| [Enter65d](../spec/enter.md#enter65d) | option enterSplitSpace: start |
| [Enter65e](../spec/enter.md#enter65e) | option enterSplitSpace: start |
| [Enter65f](../spec/enter.md#enter65f) | option enterSplitSpace: start |
| [Enter65g](../spec/enter.md#enter65g) | option enterSplitSpace: start |
| [Enter65h](../spec/enter.md#enter65h) | option enterSplitSpace: start |
| [Enter65i](../spec/enter.md#enter65i) | option enterSplitSpace: start |
| [Enter65j](../spec/enter.md#enter65j) | option enterSplitSpace: start |
| [Enter65k](../spec/enter.md#enter65k) | option enterSplitSpace: start |
| [Enter65l](../spec/enter.md#enter65l) | option enterSplitSpace: start |
| [Enter65m](../spec/enter.md#enter65m) | option enterSplitSpace: start |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | table |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox |
| [Enter55](../spec/enter.md#enter55) | caret in a heading's #s |
| [Enter55b](../spec/enter.md#enter55b) | caret in a heading's #s |
| [Enter55c](../spec/enter.md#enter55c) | caret in a heading's #s |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
| [Enter63](../spec/enter.md#enter63) | option enterOnEmptyItem: exit |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| [Enter66](../spec/enter.md#enter66) | footnote |
| [Enter67](../spec/enter.md#enter67) | thematic break |
| [Enter68](../spec/enter.md#enter68) | callout |
| [Enter69](../spec/enter.md#enter69) | heading as a list item (a heading is a block of its own) |
| [Enter69d](../spec/enter.md#enter69d) | heading as a list item (a heading is a block of its own) |
| [Enter70](../spec/enter.md#enter70) | table |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence5](../spec/fences.md#fence5) | code block as a list item (a code block is a block of its own) |
| [Fence6](../spec/fences.md#fence6) | tag markup-fence |
| [Fence7](../spec/fences.md#fence7) | tag markup-fence |
| [Fence7b](../spec/fences.md#fence7b) | tag markup-fence |
| [Fence7c](../spec/fences.md#fence7c) | tag markup-fence |
| [Fence7d](../spec/fences.md#fence7d) | tag markup-fence |
| [Fence9](../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../spec/fences.md#fence15) | tag markup-fence |
| [Fence17](../spec/fences.md#fence17) | tag markup-fence |
| [Fence19](../spec/fences.md#fence19) | tag markup-fence |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
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
| [Fence49](../spec/fences.md#fence49) | tag markup-fence |
| [Fence50](../spec/fences.md#fence50) | tag markup-fence |
| [Fence51](../spec/fences.md#fence51) | tag markup-fence |
| [Fence58](../spec/fences.md#fence58) | tag markup-fence |
| [Fence59](../spec/fences.md#fence59) | tag markup-fence |
| [Fence59b](../spec/fences.md#fence59b) | tag markup-fence |
| [Fence60](../spec/fences.md#fence60) | tag markup-fence |
| [Fence42](../spec/fences.md#fence42) | math |
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
| [Fence63](../spec/fences.md#fence63) | tag markup-fence |
| [Fence64](../spec/fences.md#fence64) | tag markup-fence |
| **gaps.md** | |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | selection across blocks |
| [Indent27](../spec/indent.md#indent27) | selection across blocks |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent34](../spec/indent.md#indent34) | caret on a code block's fence |
| [Indent35](../spec/indent.md#indent35) | math |
| [Indent36](../spec/indent.md#indent36) | table |
| [Indent37](../spec/indent.md#indent37) | thematic break |
| [Indent37b](../spec/indent.md#indent37b) | thematic break |
| [Indent38](../spec/indent.md#indent38) | indented code |
| **lists.md** | |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| **move-subtree-down.md** | |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | selection across blocks |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | selection across blocks |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | caret on a blank line |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | selection across blocks |
| **move-subtree-up.md** | |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | link reference definition |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | selection across blocks |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | option quotes: container |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret in a marker |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | quote as a list item (a quote is a block of its own) |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | numbered list right after another (AFFiNE numbers them as one) |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | caret in a marker |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | caret on a blank line |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | thematic break |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO7](../spec/obsidian-true-outliner.md#to7) | option outdent: logical |
| [TO18](../spec/obsidian-true-outliner.md#to18) | option enterOnEmptyItem: outdent |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | option quotes: container |
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
| [Outdent17](../spec/outdent.md#outdent17) | heading as a list item (a heading is a block of its own) |
| [Outdent17b](../spec/outdent.md#outdent17b) | option outdent: logical |
| [Outdent18](../spec/outdent.md#outdent18) | heading as a list item (a heading is a block of its own) |
| [Outdent19](../spec/outdent.md#outdent19) | tag markup-fence |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag markup-fence |
| **paste-html.md** | |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| [PasteHtml13](../spec/paste-html.md#pastehtml13) | table (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | option quotes: container |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | callout |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste15](../spec/paste.md#paste15) | caret on a code block's fence |
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
| [Placeholder20](../spec/placeholders.md#placeholder20) | option enterSplitSpace: start |
| **quirks.md** | |
| [Quirk1](../spec/quirks.md#quirk1) | option quirkEnterMidHeading: workflowy |
| [Quirk1b](../spec/quirks.md#quirk1b) | option quirkEnterMidHeading: workflowy |
| [Quirk1c](../spec/quirks.md#quirk1c) | option quirkEnterMidHeading: workflowy |
| [Quirk2](../spec/quirks.md#quirk2) | option quirkPasteCaret: roam |
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
| [Quote26](../spec/quotes.md#quote26) | option quotes: container |
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
| [Quote45](../spec/quotes.md#quote45) | quote |
| [Quote46](../spec/quotes.md#quote46) | quote |
| [Quote47](../spec/quotes.md#quote47) | callout |
| [Quote48](../spec/quotes.md#quote48) | quote |
| [Quote49](../spec/quotes.md#quote49) | quote |
| [Quote50](../spec/quotes.md#quote50) | quote |
| [Quote51](../spec/quotes.md#quote51) | quote |
| [Quote52](../spec/quotes.md#quote52) | quote |
| [Quote54](../spec/quotes.md#quote54) | quote |
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
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
| [Quote74](../spec/quotes.md#quote74) | quote as a list item (a quote is a block of its own) |
| [Quote75](../spec/quotes.md#quote75) | quote |
| [Quote76](../spec/quotes.md#quote76) | quote as a list item (a quote is a block of its own) |
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
| [Quote93](../spec/quotes.md#quote93) | quote |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | quote |
| [QuoteText1](../spec/quotes.md#quotetext1) | quote as a list item (a quote is a block of its own) |
| [QuoteText2](../spec/quotes.md#quotetext2) | quote as a list item (a quote is a block of its own) |
| [QuoteText3](../spec/quotes.md#quotetext3) | quote as a list item (a quote is a block of its own) |
| [QuoteText4](../spec/quotes.md#quotetext4) | quote as a list item (a quote is a block of its own) |
| [QuoteText5](../spec/quotes.md#quotetext5) | quote as a list item (a quote is a block of its own) |
| [QuoteText8](../spec/quotes.md#quotetext8) | quote |
| [QuoteText9](../spec/quotes.md#quotetext9) | quote as a list item (a quote is a block of its own) |
| [QuoteText10](../spec/quotes.md#quotetext10) | changes only what blocks can't show |
| [QuoteText11](../spec/quotes.md#quotetext11) | quote as a list item (a quote is a block of its own) |
| [QuoteText12](../spec/quotes.md#quotetext12) | quote as a list item (a quote is a block of its own) |
| [QuoteText17](../spec/quotes.md#quotetext17) | quote |
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
| [Regression3](../spec/regressions.md#regression3) | quote as a list item (a quote is a block of its own) |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | heading as a list item (a heading is a block of its own) |
| [Regression19](../spec/regressions.md#regression19) | heading as a list item (a heading is a block of its own) |
| [Regression20](../spec/regressions.md#regression20) | option joinWithChildren: refuse |
| [Regression21](../spec/regressions.md#regression21) | option pasteLines: items |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| [Regression23](../spec/regressions.md#regression23) | tag markup-fence |
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression31](../spec/regressions.md#regression31) | caret in a marker |
| [Regression34](../spec/regressions.md#regression34) | thematic break |
| [Regression35](../spec/regressions.md#regression35) | link reference definition (expected) |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression45](../spec/regressions.md#regression45) | selection across blocks |
| [Regression47](../spec/regressions.md#regression47) | heading as a list item (a heading is a block of its own) |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | action duplicateSubtree |
| [Regression52](../spec/regressions.md#regression52) | action duplicateSubtree |
| [Regression53](../spec/regressions.md#regression53) | heading as a list item (a heading is a block of its own) |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| **scenarios.md** | |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| **shift-enter.md** | |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret in a marker |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | table |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret in a task's checkbox |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| **tasks.md** | |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskEnter10](../spec/tasks.md#taskenter10) | option enterSplitSpace: start |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a task's checkbox |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a task's checkbox |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a task's checkbox |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | caret on a blank line |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | caret on a code block's fence |
