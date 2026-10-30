---
type: "SxS"
app: "siyuan"
version: "3.8.6"
url: "http://127.0.0.1:6816/stage/build/desktop/"
model: "block"
command: "node sxs/run.ts siyuan"
elapsed_s: 288
workers: 4
---

# SiYuan vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 262 | [28](#caret-28) | [22](#whitespace-22) | [112](#disagree-112) |  |  | **424** |
| adapted | 210 | [14](#adapted-caret-14) | [30](#adapted-whitespace-30) | [108](#adapted-disagree-108) | [1](#adapted-error-1) |  | **363** |
| **total** | **472 (33%)** | **42 (2.9%)** | **52 (3.6%)** | **220 (15%)** | **1 (0.069%)** | **[653](#skipped-653) (45%)** | **1441** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 37 | 3 | 10 | 12 |  | 24 | **86** | 35 | 27 |
| [backtick.md](../spec/backtick.md) | 5 |  |  | 3 |  | 25 | **33** | 1 | 7 |
| [block-ids.md](../spec/block-ids.md) | 10 |  |  | 8 |  | 3 | **21** | 10 | 8 |
| [copy.md](../spec/copy.md) | 2 |  |  | 3 |  | 8 | **13** | 4 | 1 |
| [cursor.md](../spec/cursor.md) | 25 | 4 |  |  |  | 7 | **36** | 25 | 4 |
| [delete-subtree.md](../spec/delete-subtree.md) |  |  |  |  |  | 14 | **14** |  |  |
| [delete.md](../spec/delete.md) | 11 | 1 | 2 | 16 |  | 26 | **56** | 23 | 7 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 2 |  |  | 2 |  | 8 | **12** | 4 |  |
| [enter.md](../spec/enter.md) | 43 | 3 | 11 | 9 |  | 32 | **98** | 24 | 42 |
| [fences.md](../spec/fences.md) | 12 | 1 | 1 | 2 |  | 54 | **70** |  | 16 |
| [fold.md](../spec/fold.md) | 7 |  |  | 7 |  | 5 | **19** | 12 | 2 |
| [gaps.md](../spec/gaps.md) | 11 |  |  | 2 |  | 6 | **19** | 9 | 4 |
| [indent.md](../spec/indent.md) | 20 |  | 1 | 11 |  | 23 | **55** | 25 | 7 |
| [lists.md](../spec/lists.md) | 10 |  |  |  |  | 6 | **16** | 3 | 7 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 30 |  |  | 7 |  | 7 | **44** | 30 | 7 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 28 |  |  | 8 |  | 10 | **46** | 27 | 9 |
| [move-subtree.md](../spec/move-subtree.md) |  | 8 |  | 6 |  | 10 | **24** | 10 | 4 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 46 | 1 | 1 | 7 |  | 12 | **67** | 30 | 25 |
| [outdent.md](../spec/outdent.md) | 17 | 2 |  | 5 |  | 18 | **42** | 19 | 5 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 4 | 1 |  | 1 |  |  | **6** | 5 | 1 |
| [paste-html.md](../spec/paste-html.md) | 7 | 4 |  | 7 |  | 1 | **19** |  | 18 |
| [paste-list-form.md](../spec/paste-list-form.md) | 5 |  |  |  |  | 1 | **6** | 4 | 1 |
| [paste-list.md](../spec/paste-list.md) | 12 | 1 | 2 | 10 |  | 4 | **29** | 10 | 15 |
| [paste-plain.md](../spec/paste-plain.md) | 7 |  | 2 | 18 |  | 9 | **36** | 16 | 11 |
| [paste.md](../spec/paste.md) | 11 | 1 |  | 5 |  | 19 | **36** | 9 | 8 |
| [placeholders.md](../spec/placeholders.md) | 11 |  | 5 | 2 |  | 2 | **20** | 11 | 7 |
| [quirks.md](../spec/quirks.md) |  |  |  |  |  | 7 | **7** |  |  |
| [quotes.md](../spec/quotes.md) | 12 |  |  | 10 |  | 121 | **143** |  | 22 |
| [regressions.md](../spec/regressions.md) | 31 | 2 | 3 | 31 | 1 | 130 | **198** | 21 | 47 |
| [scenarios.md](../spec/scenarios.md) | 15 | 1 |  | 10 |  | 3 | **29** | 17 | 9 |
| [select.md](../spec/select.md) | 10 | 7 |  |  |  | 6 | **23** | 10 | 7 |
| [shift-enter.md](../spec/shift-enter.md) | 15 |  | 10 | 4 |  | 7 | **36** | 13 | 16 |
| [subtree-selection.md](../spec/subtree-selection.md) | 4 | 2 | 2 | 6 |  | 3 | **17** | 13 | 1 |
| [tasks.md](../spec/tasks.md) | 7 |  | 2 | 7 |  | 14 | **30** |  | 16 |
| [typing.md](../spec/typing.md) | 1 |  |  | 1 |  | 1 | **3** | 1 | 1 |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 | **5** | 3 | 1 |
| [zoom.md](../spec/zoom.md) |  |  |  |  |  | 14 | **14** |  |  |
| **total** | **472 (33%)** | **42 (2.9%)** | **52 (3.6%)** | **220 (15%)** | **1 (0.069%)** | **654 (45%)** | **1441** | **424 (29%)** | **363 (25%)** |

## Disagree (112)

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace50](../spec/backspace.md#backspace50)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
  - kid
- next
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  ¶ ┃two
  - kid
- next
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
  - kid
- next
```

</td><td>

```buffer
- one
  ┃two
  - kid
- next
```

</td></tr>
</table>

### [BlockIds4](../spec/block-ids.md#blockids4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## H
  ¶ body
¶ ## ┃G
```

</td><td>

```buffer
¶ ## H
¶ ## ┃G
  ¶ body
```

</td><td>

```buffer
¶ ## ┃G
¶ ## H
  ¶ body
```

</td></tr>
</table>

### [BlockIds12](../spec/block-ids.md#blockids12)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a ^x
- ┃b ^y
```

</td><td>

```buffer
- a ^x
  ¶ ┃b ^y
```

</td><td>

```buffer
- a ^x
- ┃b ^y
```

</td></tr>
</table>

### [BlockIds18](../spec/block-ids.md#blockids18)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo ^x┃
```

</td><td>

```buffer
- foo ^x
  ┃
```

</td><td>

```buffer
- foo
  ┃ ^x
```

</td></tr>
</table>

### [BlockIds20](../spec/block-ids.md#blockids20)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a ^x
  - c
- b
```

</td><td>

```buffer
- a ^x
  ¶ ««a ^x»»
  - c
- b
```

</td><td>

```buffer
- a ^x
  - c
- ┃a
  - c
- b
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
  - kid
- three
```

</td><td>

```buffer
- 
  - ┃kid
- three
```

</td><td>

```buffer
- ┃three
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
  ¶ ««a»»
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

### [DuplicateSubtree10](../spec/duplicate-subtree.md#duplicatesubtree10)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
- 
  ¶ ««»»
  - a
```

</td><td>

```buffer
- 
  - a
- ┃
  - a
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td><td>

```buffer
- one two
- 
  ┃ three
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

### [Fold2](../spec/fold.md#fold2)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
  - c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - c
- ┃b

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
- ┃b
  - c

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

### [Fold5](../spec/fold.md#fold5)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
¶ ┃
- b
- c

⟦folded none; zoom none⟧
```

</td><td>

```buffer
- 
  - b
- ┃
- c

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

### [Fold6](../spec/fold.md#fold6)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c┃

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
  - c┃

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
  - c┃

⟦folded none; zoom none⟧
```

</td></tr>
</table>

### [Fold7](../spec/fold.md#fold7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
  - c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃
  ¶ b
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

### [Fold8](../spec/fold.md#fold8)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  ¶ ««a»»
  - b

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
- a┃
  - b

⟦folded 1 3; zoom none⟧
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

### [MoveSubtree4](../spec/move-subtree.md#movesubtree4)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- a
- c
- ««b»»
```

</td><td>

```buffer
- c
- ««a
- b»»
```

</td></tr>
</table>

### [MoveSubtree14](../spec/move-subtree.md#movesubtree14)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## B
¶ # C
  ¶ ### D┃
    ¶ #### E
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ ««### D»»
¶ # C
  ¶ #### E
```

</td><td>

```buffer
¶ # A
  ¶ ## B
  ¶ ## D┃
    ¶ ### E
¶ # C
```

</td></tr>
</table>

### [MoveSubtree15](../spec/move-subtree.md#movesubtree15)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ x
¶ # C
  ¶ ##### D┃
    ¶ ###### E
```

</td><td>

```buffer
¶ # A
  ¶ x
  ¶ ««##### D»»
¶ # C
  ¶ ###### E
```

</td><td>

```buffer
¶ # A
  ¶ x
  ¶ ## D┃
    ¶ ### E
¶ # C
```

</td></tr>
</table>

### [MoveSubtree19](../spec/move-subtree.md#movesubtree19)

> moveSubtree

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ««b
3. c»»
```

</td><td>

```buffer
1. ««b»»
2. a
3. c
```

</td><td>

```buffer
1. ««b
2. c»»
3. a
```

</td></tr>
</table>

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

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

### [TO-S11](../spec/obsidian-true-outliner.md#to-s11)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo
  ¶ ┃bar
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

### [TO3](../spec/obsidian-true-outliner.md#to3)

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

### [TO13](../spec/obsidian-true-outliner.md#to13)

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

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
  y┃
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
  ¶ Notes:
  - x
  - y┃
- b
```

</td><td>

```buffer
- a
- Notes:
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

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  ¶ one
    two
  - x┃
```

</td><td>

```buffer
- a
- one
  two
- x┃
```

</td></tr>
</table>

### [PasteList20](../spec/paste-list.md#pastelist20)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃ab
2. c
```

</td><td>

```buffer
1. ab
2. x
3. y┃
4. c
```

</td><td>

```buffer
1. x
2. y┃
3. ab
4. c
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃here
```

</td><td>

```buffer
- Introduction┃
- here
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  ¶ x┃b
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Regression83](../spec/regressions.md#regression83)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Draft announcement
Send update
Archive notes
```

</td><td>

```clipboard
<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">o </span>Draft announcement</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Send update</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Archive notes</p>
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inbox
  ¶ o Draft announcement
  - Send update
  - Archive notes┃
```

</td><td>

```buffer
- Inbox
- Draft announcement
- Send update
- Archive notes┃
```

</td></tr>
</table>

### [Regression98](../spec/regressions.md#regression98)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Title
```

</td><td>

```clipboard
<h2>Title</h2>
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ here┃
```

</td><td>

```buffer
¶ hereTitle┃
```

</td><td>

```buffer
¶ here
¶ ## Title┃
```

</td></tr>
</table>

### [Regression138](../spec/regressions.md#regression138)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # h
  ¶ ┃x #
```

</td><td>

```buffer
¶ # h┃x
```

</td><td>

```buffer
¶ # h┃x \#
```

</td></tr>
</table>

### [Regression144](../spec/regressions.md#regression144)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## B
¶ ## ┃C
```

</td><td>

```buffer
¶ ## B
¶ ## ┃C
```

</td><td>

```buffer
¶ ## B
  ¶ ### ┃C
```

</td></tr>
</table>

### [Regression145](../spec/regressions.md#regression145)

> outdent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ## B
    ¶ ### ┃C
```

</td><td>

```buffer
¶ # A
  ¶ ## B
    ¶ ### ┃C
```

</td><td>

```buffer
¶ # A
  ¶ ## B
  ¶ ## ┃C
```

</td></tr>
</table>

### [Regression181](../spec/regressions.md#regression181)

> indent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]
  [a]:s┃
```

</td><td>

```buffer
- [x] [a]:s→┃
```

</td><td>

```buffer
- 
  [a]
  [a]:s┃
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««Home»»
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- s┃Home
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

### [ShiftEnter13](../spec/shift-enter.md#shiftenter13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

```buffer
- 
  ┃one
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃one
```

</td><td>

```buffer
- ┃one
```

</td></tr>
</table>

### [ShiftEnter31](../spec/shift-enter.md#shiftenter31)

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

### [SubtreeEdit7](../spec/subtree-selection.md#subtreeedit7)

> "xy"

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
- c
```

</td><td>

```buffer
- xy┃a
- b
- c
```

</td><td>

```buffer
- a
- ««b»»
- c
```

</td></tr>
</table>

### [SubtreeEdit8](../spec/subtree-selection.md#subtreeedit8)

> "x"

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- x┃a
- b
  - b1
- c
```

</td><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td></tr>
</table>

### [SubtreeEdit11](../spec/subtree-selection.md#subtreeedit11)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
y
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td><td>

```buffer
- yone
  - two
    - ««deep
  - three»»
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - y┃
  - five
- four
```

</td></tr>
</table>

### [SubtreeEdit12](../spec/subtree-selection.md#subtreeedit12)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- 
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- a
- b┃
  - b1
- c
```

</td></tr>
</table>

### [SubtreeEdit14](../spec/subtree-selection.md#subtreeedit14)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- p┃
- q
- a
- b
  - b1
- c
```

</td><td>

```buffer
- a
- p
- q┃
- c
```

</td></tr>
</table>

## Whitespace (22)

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

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [Regression141](../spec/regressions.md#regression141)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃bravo
  - charlie
```

</td><td>

```buffer
-  x┃bravo
  - charlie
```

</td><td>

```buffer
- x┃bravo
  - charlie
```

</td></tr>
</table>

### [ShiftEnter18](../spec/shift-enter.md#shiftenter18)

> shiftEnter

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

### [SubtreeEdit5](../spec/subtree-selection.md#subtreeedit5)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td></tr>
</table>

> copy

### [SubtreeEdit6](../spec/subtree-selection.md#subtreeedit6)

> cut

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- a
- ┃c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

## Caret (28)

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

### [MoveSubtree1](../spec/move-subtree.md#movesubtree1)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
- three┃
```

</td><td>

```buffer
- ««three»»
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two┃
- three
```

</td><td>

```buffer
- ««three»»
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
- three
```

</td><td>

```buffer
- two
  - ««one»»
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- ««c»»
- a
- b
```

</td><td>

```buffer
- c
- ««a
- b»»
```

</td></tr>
</table>

### [MoveSubtree6](../spec/move-subtree.md#movesubtree6)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- a
- ««c»»
- b
```

</td><td>

```buffer
- ««a
- c
- b»»
```

</td></tr>
</table>

### [MoveSubtree23](../spec/move-subtree.md#movesubtree23)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - ««a1»»
```

</td><td>

```buffer
- a
- b
  - a1┃
```

</td></tr>
</table>

### [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b)

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
¶ bar
```

</td></tr>
</table>

### [Outdent8](../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- ««a
  - b
- c»»
```

</td><td>

```buffer
¶ ┃para
¶ a
- b
¶ c
```

</td><td>

```buffer
¶ para
¶ ««a
- b
¶ c»»
```

</td></tr>
</table>

### [Outdent12](../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
```

</td><td>

```buffer
¶ ┃a
¶ b
```

</td><td>

```buffer
¶ ««a
¶ b»»
```

</td></tr>
</table>

### [PasteConvPhrase](../spec/paste-conv.md#pasteconvphrase)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x y
```

</td><td>

```clipboard
<span>x <b>y</b></span>
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax **y┃**b
```

</td><td>

```buffer
- ax **y**┃b
```

</td></tr>
</table>

### [Paste20](../spec/paste.md#paste20)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # A
  ¶ ┃para
```

</td><td>

```buffer
¶ # A
  ¶ ## h┃
    ¶ text
    ¶ para
```

</td><td>

```buffer
¶ # A
  ¶ ## h
    ¶ text┃
    ¶ para
```

</td></tr>
</table>

### [Regression139](../spec/regressions.md#regression139)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
b #
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # a┃
```

</td><td>

```buffer
¶ # ab #┃
```

</td><td>

```buffer
¶ # ab \#┃
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - ««Work»»
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- ««Work»»
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

### [Select11](../spec/select.md#select11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep
  - three
  - five»»
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - ««two»»
    - deep
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td></tr>
</table>

### [Select13](../spec/select.md#select13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - «de»ep
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - ««two»»
    - deep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- ««one»»
  - two
    - deep
  - three
  - five
- four
```

</td></tr>
</table>

### [Select14](../spec/select.md#select14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de┃ep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - «de»ep
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - ««two»»
    - deep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep»»
  - three
  - five
- four
```

</td><td>

```buffer
- one
  - ««two
    - deep
  - three»»
  - five
- four
```

</td></tr>
</table>

### [Select16](../spec/select.md#select16)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  mo┃re
- b
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃«
  mo»re
- b
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃«a
  mo»re
- b
```

</td><td>

```buffer
- ««a
  more»»
- b
```

</td></tr>
</table>

### [Select19](../spec/select.md#select19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
- d

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ««a»»
- b
  - c
- d

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a»»
- b
  - c
- d

⟦folded 2; zoom none⟧
```

</td><td>

```buffer
- ««a
- b»»
  - c
- d

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
  - c
- d

⟦folded 2; zoom none⟧
```

</td><td>

```buffer
- ««a
- b
  - c
- d»»

⟦folded 2; zoom none⟧
```

</td></tr>
</table>

### [Select23](../spec/select.md#select23)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - th┃ree
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - «th»ree
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td><td>

```buffer
- one
  - ««two
    - deep
  - three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td></tr>
</table>

### [SubtreeEdit2](../spec/subtree-selection.md#subtreeedit2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- a
- ┃c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit13](../spec/subtree-selection.md#subtreeedit13)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - ««deep
  - three»»
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - deep
  - three┃
  - five
- four
```

</td></tr>
</table>

## Adapted: disagree (108)

### [Backspace3](../spec/backspace.md#backspace3)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

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
- a
  ¶ ┃b
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
- a

  ┃b
```

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
- 
  m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] m┃
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

### [Backtick4](../spec/backtick.md#backtick4)

> "````"

Adapted: code block, empty document, under closeBackticks: none

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```
  ┃
  ```
````

</td><td>

`````buffer
¶ ````┃
`````

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

`````buffer
````┃
`````

</td></tr>
</table>

### [Backtick9](../spec/backtick.md#backtick9)

> "```"

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  code
  ┃
  ```
````

</td><td>

`````buffer
¶ ````
  code
  ```┃
  ````
`````

</td><td>

````buffer
¶ ```
  code
  ```┃
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
┃
```
````

</td><td>

````buffer
```
code
```┃
````

</td></tr>
</table>

### [Backtick17](../spec/backtick.md#backtick17)

Adapted: code block, under closeBackticks: none

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ``┃
  more
```

</td></tr>
</table>

> "`"

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ para
¶ ```
  more┃
  ```
````

</td><td>

````buffer
¶ para
¶ ```┃
  more
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ para
¶ ```
  mor┃
  ```
````

</td><td>

```buffer
¶ para
  ``┃
  more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"`"</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
para
``┃
more
```

</td><td>

````buffer
para
```┃
more
````

</td><td>

```buffer
para
``┃
more
```

</td></tr>
</table>

### [BlockIds7](../spec/block-ids.md#blockids7)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo ┃bar ^x
```

</td><td>

```buffer
- foo
- ┃bar ^x
```

</td><td>

```buffer
- foo  ^x
- ┃bar
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo ┃bar ^x
```

</td><td>

```buffer
- foo  ^x
- ┃bar
```

</td></tr>
</table>

### [BlockIds11](../spec/block-ids.md#blockids11)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b ^y
```

</td><td>

```buffer
- a
  ¶ ┃b ^y
```

</td><td>

```buffer
- a
- ┃b ^y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b ^y
```

</td><td>

```buffer
- a
- ┃b ^y
```

</td></tr>
</table>

### [BlockIds14](../spec/block-ids.md#blockids14)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

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
- a
- ┃b
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
- ┃b

  ^p3
- c
```

</td><td>

```buffer
- a
- ┃b

  ^p3
- c
```

</td></tr>
</table>

### [BlockIds15](../spec/block-ids.md#blockids15)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃^x
```

</td><td>

```buffer
- a
  ¶ ┃^x
```

</td><td>

```buffer
- a
- ┃^x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃^x
```

</td><td>

```buffer
- a
- ┃^x
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
- [a]\:┃b
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [Enter65g](../spec/enter.md#enter65g)

Adapted: task, under backspaceAtItemStart: body

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
- [ ] one two
  ¶ ┃ [ ]  three
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
- [ ] one two

  ┃ [ ]  three
```

</td></tr>
</table>

### [Enter65h](../spec/enter.md#enter65h)

Adapted: under backspaceAtItemStart: body

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
- one two
  ¶ ┃ three
- next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>indent</th><th>deleteContentBackward</th></tr>
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
  - ┃ three
- next
```

</td><td>

```buffer
- one two

  ┃ three
- next
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
[Note]\: this 

┃matters a lot
```

</td><td>

```buffer
[Note]: this ┃matters a lot
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

`````buffer
¶ ````
  x‍
  ┃```
  body
  ````
`````

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

### [Fence62](../spec/fences.md#fence62)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x┃```
  body
  ```
````

</td><td>

````buffer
¶ ```
  x┃```
  body
  ```
````

</td><td>

`````buffer
¶ ````
  ┃```
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
x┃```
body
```
````

</td><td>

`````buffer
````
┃```
body
````
`````

</td></tr>
</table>

### [Fold15](../spec/fold.md#fold15)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
  ¶ ┃c

⟦folded none; zoom none⟧
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a①
  - b
- ┃c
```

</td><td>

```buffer
- a
  - b

  ┃c
```

</td></tr>
</table>

### [Fold15b](../spec/fold.md#fold15b)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- a┃
  - b
- c
  - d

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
  ¶ ┃c
  - d

⟦folded none; zoom none⟧
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a①
  - b
- ┃c
  - d
```

</td><td>

```buffer
- a
  - b

  ┃c
  - d
```

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

### [MoveSubtree9](../spec/move-subtree.md#movesubtree9)

> moveSubtree ②

Adapted: blank lines

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
  ¶ ««para»»
```

</td><td>

```buffer
- a
  - para┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ▸

para┃②
```

</td><td>

```buffer
- a

  - para┃②
```

</td></tr>
</table>

### [MoveSubtree21](../spec/move-subtree.md#movesubtree21)

> moveSubtree ①

Adapted: blank lines

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
1. a
2. b
```

</td><td>

```buffer
1. a
2. ««x»»
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

### [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8)

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

### [TO2](../spec/obsidian-true-outliner.md#to2)

> deleteContentBackward

Adapted: under backspaceAtItemStart: body

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
- a
  ¶ ┃b
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
  - ┃b
    - c
```

</td><td>

```buffer
- a

  ┃b
  - c
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

Adapted: quote, under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## H┃
  ¶ below
```

</td><td>

```buffer
¶ ## H
  ¶     first
  ¶     > quote┃
  ¶ below
```

</td><td>

```buffer
¶ ## H
  ¶ below
  ¶ first
  ¶ > quote┃
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
below

first

> quote┃
```

</td></tr>
</table>

### [Outdent21](../spec/outdent.md#outdent21)

> outdent

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).┃
- x **b**
  - y
- z
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ x **b**
  y┃
¶ z
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ let a = 1;
  let b = 2;┃
```

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ | a | {: style="text-align: right;"}b |
  | --- | --: |
  | 1 | {: style="text-align: right;"}2┃ |
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- not a list, \*x\* and [y]
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ┃
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ javascript
  Copy code
  let a = 1;┃
```

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

Adapted: under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - kid
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
- ┃
  - kid
```

</td><td>

```buffer
- 
  - kid
- x
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ] x
- [ ] y┃
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

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- x┃
- b
```

</td><td>

````buffer
- a
- x
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
- x
  ```
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

Adapted: heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
  ¶ # h
    ¶ text┃
- b
```

</td><td>

```buffer
- a
- # h
  ¶ text┃
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
- # h
  text┃
- b
```

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ px[a]: /u┃
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a«bc
  de»f
```

</td><td>

```buffer
¶ > axy┃f
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

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

Adapted: under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  ¶ para
```

</td><td>

```buffer
¶ # Txy┃
  ¶ para
```

</td><td>

```buffer
¶ # T
  ¶ para
  ¶ x
    y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T┃

para
```

</td><td>

```buffer
# T

para

x
y┃
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

Adapted: under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  - z
```

</td><td>

```buffer
¶ # T
  - x
  - y┃
  - z
```

</td><td>

```buffer
¶ # T
  - z
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
# T┃

- z
```

</td><td>

```buffer
# T

- z
- x
- y┃
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

Adapted: under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
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

</td><td>

```buffer
¶ ## A
  ¶ p
¶ ## h
  ¶ text┃
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

p

## h
text┃

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

Adapted: under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
```

</td><td>

```buffer
¶ ## A
  ¶ ### h
    ¶ text┃
    ¶ p
```

</td><td>

```buffer
¶ ## A
  ¶ p
  ¶ ### h
    ¶ text┃
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

p
### h
text┃
```

</td></tr>
</table>

### [Quote27](../spec/quotes.md#quote27)

> moveSubtreeUp

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Quote76](../spec/quotes.md#quote76)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td><td>

```buffer
- > ax
  y┃b
```

</td><td>

```buffer
- > ax
  y
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td><td>

```buffer
- > ax
  > y
  > ┃b
```

</td></tr>
</table>

### [Quote94](../spec/quotes.md#quote94)

> deleteContentBackward

Adapted: quote, task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  ¶ > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  ¶ ┃q
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

### [QuoteText3](../spec/quotes.md#quotetext3)

> outdent

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - > ┃q
```

</td><td>

```buffer
- a
  - > ┃q
```

</td><td>

```buffer
- a
- > ┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - > ┃q
```

</td><td>

```buffer
- a
- > ┃q
```

</td></tr>
</table>

### [QuoteText7](../spec/quotes.md#quotetext7)

> enter

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ab┃cd
```

</td><td>

```buffer
¶ > ab
  
  ┃cd
```

</td><td>

```buffer
¶ > ab
  ┃cd
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

```buffer
> ab
> ┃cd
```

</td></tr>
</table>

### [QuoteText10](../spec/quotes.md#quotetext10)

> enter

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ┃ab
```

</td><td>

```buffer
¶ >
  ┃ab
```

</td><td>

```buffer
¶ ┃
¶ > ab
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃ab
```

</td><td>

```buffer
┃◌

> ab
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > See ┃here.
```

</td><td>

```buffer
¶ > See xy┃here.
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

### [QuoteText16](../spec/quotes.md#quotetext16)

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

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > p┃
¶ after
```

</td><td>

```buffer
¶ > p
  
  \- x
  \- y┃
¶ after
```

</td><td>

```buffer
¶ > p
- x
- y┃
¶ after
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> p┃

after
```

</td><td>

```buffer
> p

- x
- y┃

after
```

</td></tr>
</table>

### [QuoteText18](../spec/quotes.md#quotetext18)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ > ┃b
```

</td><td>

```buffer
- a
¶ > →┃b
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

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

Adapted: bullet *, under backspaceAtItemStart: body

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
  2. x
```

</td><td>

```buffer
- a
- ┃b
  2. x
```

</td><td>

```buffer
- a
  ¶ ┃b
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
* a

  ┃b
  1) x
```

</td></tr>
</table>

### [Regression6](../spec/regressions.md#regression6)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

`````````````buffer
¶ ```
  x┃````````````
  body
  ```
`````````````

</td><td>

`````````````buffer
¶ ```
  x┃````````````
  body
  ```
`````````````

</td><td>

``````````````buffer
¶ `````````````
  ┃````````````
  body
  `````````````
``````````````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

`````````````buffer
```
x┃````````````
body
```
`````````````

</td><td>

``````````````buffer
`````````````
┃````````````
body
`````````````
``````````````

</td></tr>
</table>

### [Regression17](../spec/regressions.md#regression17)

> outdent

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
- [ ] ┃
  - c
```

</td></tr>
</table>

### [Regression24](../spec/regressions.md#regression24)

Adapted: under enterSplitSpace: start

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ revise┃2\. draft
```

</td><td>

```buffer
¶ revise ┃2. draft
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. draft
```

</td><td>

```buffer
revise 

┃2\. draft
```

</td><td>

```buffer
revise ┃2. draft
```

</td></tr>
</table>

### [Regression26](../spec/regressions.md#regression26)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a ┃\- b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
  ┃\- b
```

</td><td>

```buffer
¶ a 
  ┃\- b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃\- b
```

</td><td>

```buffer
¶ a ┃- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
a ┃\- b
```

</td><td>

```buffer
a 
┃\- b
```

</td><td>

```buffer
a ┃- b
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

Adapted: blank lines, link reference definition, under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  - 
¶ para
```

</td><td>

```buffer
- foo
  ¶ x
  ¶ [a]: /u┃
  - 
¶ para
```

</td><td>

```buffer
- foo
  - 
- x
  ¶ [a]: /u┃
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
- foo

  - 

- x

  [a]: /u┃

para
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a┃b
  c
```

</td><td>

```buffer
¶ > axc
  ┃b
  c
```

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

### [Regression56](../spec/regressions.md#regression56)

> enter

Adapted: quote, task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  ¶ > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  ¶ >
    ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  ¶ > ┃q
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

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  ¶ > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  ¶ >
    ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  ¶ ┃
  ¶ > q
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

  ┃◌

  > q
- b
```

</td></tr>
</table>

### [Regression71](../spec/regressions.md#regression71)

> duplicateSubtree

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- 
  - ««a
  - b»»
- y
```

</td><td>

```buffer
- x
- 
  - a
  - b
  - ««a
  - b»»
- y
```

</td><td>

```buffer
- x
- 
  - a
  - b
- 
  - ««a
  - b»»
- y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- - ««a
  - b»»
- y
```

</td><td>

```buffer
- x
- - a
  - b
- - ««a
  - b»»
- y
```

</td></tr>
</table>

### [Regression72](../spec/regressions.md#regression72)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
z
```

</td></tr>
</table>

> pastePlain

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- 
  - ««a
  - b»»
- y
```

</td><td>

```buffer
- zx
- 
  - ««a
  - b»»
- y
```

</td><td>

```buffer
- x
- 
  - z┃
- y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- - ««a
  - b»»
- y
```

</td><td>

```buffer
- x
- - z┃
- y
```

</td></tr>
</table>

### [Regression74](../spec/regressions.md#regression74)

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ \┃
```

</td><td>

```buffer
¶ \ab┃
```

</td><td>

```buffer
¶ - a
  \- b┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
\┃
```

</td><td>

```buffer
\- a
\- b┃
```

</td></tr>
</table>

### [Regression86](../spec/regressions.md#regression86)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
before a after
```

</td><td>

```clipboard
<p>before<code> a </code>after</p>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ before` a `after┃
```

</td><td>

```buffer
¶ before`  a  `after┃
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
before`  a  `after┃
```

</td></tr>
</table>

### [Regression87](../spec/regressions.md#regression87)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
ab foo!bar
```

</td><td>

```clipboard
<p><em>a</em><em>b</em> <em>foo!</em>bar</p>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ *ab* *foo!* bar┃
```

</td><td>

```buffer
¶ *ab* foo!bar┃
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
*ab* foo!bar┃
```

</td></tr>
</table>

### [Regression88](../spec/regressions.md#regression88)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x y
```

</td><td>

```clipboard
<p><a href="/u">x</a> <a href="https://example.com/a&gt;b">y</a></p>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ [x](/u) [y](https://example.com/a>b)┃
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
[x](/u) [y](https://example.com/a>b)┃
```

</td></tr>
</table>

### [Regression93](../spec/regressions.md#regression93)

> duplicateSubtree

Adapted: blank lines

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
  - 
    ¶ ««»»
```

</td><td>

```buffer
- a
  - 
  - ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃◌
```

</td><td>

```buffer
- a

  - 
  - ┃
```

</td></tr>
</table>

### [Regression95](../spec/regressions.md#regression95)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Issue #
```

</td><td>

```clipboard
<h2>Issue #</h2>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ## Issue┃
```

</td><td>

```buffer
¶ ## Issue \#┃
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
## Issue \#┃
```

</td></tr>
</table>

### [Regression96](../spec/regressions.md#regression96)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
a

b
```

</td><td>

```clipboard
<p><em>a<br><br>b</em></p>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ *ab*┃
```

</td><td>

```buffer
¶ *a*
¶ *b*┃
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
*a*

*b*┃
```

</td></tr>
</table>

### [Regression104](../spec/regressions.md#regression104)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  😀┃```
  payload
  ```
````

</td><td>

````buffer
¶ ```
  😀┃```
  payload
  ```
````

</td><td>

`````buffer
¶ ````
  ┃```
  payload
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
😀┃```
payload
```
````

</td><td>

`````buffer
````
┃```
payload
````
`````

</td></tr>
</table>

### [Regression115](../spec/regressions.md#regression115)

> cut

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  «X»```
  PAYLOAD
  ```
¶ AFTER
````

</td><td>

`````buffer
¶ ````
  ┃```
  PAYLOAD
  ````
¶ AFTER
`````

</td><td>

`````buffer
¶ ````
  ┃```
  PAYLOAD
  ````
¶ AFTER
`````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
«X»```
PAYLOAD
```
AFTER
````

</td><td>

`````buffer
````
┃```
PAYLOAD
````
AFTER
`````

</td></tr>
</table>

### [Regression153](../spec/regressions.md#regression153)

> indent

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ -┃-
```

</td><td>

```buffer
- ┃-
```

</td><td>

```buffer
- -┃-
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃-
```

</td><td>

```buffer
- \-┃-
```

</td></tr>
</table>

### [Regression162](../spec/regressions.md#regression162)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ┃a
  b
```

</td><td>

```buffer
¶ > →┃a
  b
```

</td><td>

```buffer
- > ┃a
  b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
 >┃a
>b
```

</td><td>

```buffer
- >┃a
  >b
```

</td></tr>
</table>

### [Regression169](../spec/regressions.md#regression169)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

> paste

Adapted: link reference definition, under pasteOnParent: after

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:u┃
  ¶ T
```

</td><td>

```buffer
- [a]:ux┃
  ¶ T
```

</td><td>

```buffer
- [a]:u
  ¶ T
- x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:u┃
T
```

</td><td>

```buffer
- [a]:u
T
- x┃
```

</td></tr>
</table>

### [Regression174](../spec/regressions.md#regression174)

> moveSubtreeUp

Adapted: bullet +, list as an item's first block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- 
  - ┃c
```

</td><td>

```buffer
- b
  - ┃c
- 
```

</td><td>

```buffer
- 
  - ┃c
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
+ b
- - ┃c
```

</td><td>

```buffer
+ - ┃c
+ b
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under backspaceAtItemStart: body, under enterSplitSpace: start

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶  ┃ and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  ¶ ┃  and eggs
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
- buy milk
  ¶ today:┃
  ¶   and eggs
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
- buy milk
  ¶ today:
  ¶   and eg┃
- call Ann
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
- buy milk
  ¶ today:
      and eg
- call Ann
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
- buy milk

   ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk

  ┃  and eggs
- call Ann
```

</td><td>

```buffer
- buy milk

  today:┃

    and eggs
- call Ann
```

</td><td>

```buffer
- buy milk

  today:

    and eg┃
- call Ann
```

</td><td>

```buffer
- buy milk

  today:
┃    and eg
- call Ann
```

</td></tr>
</table>

### [Scenario12](../spec/scenarios.md#scenario12)

Adapted: under backspaceAtItemStart: body

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃x
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
- a┃
  x
  - b
- c
  - d
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"x"</th><th>cursorLineBoundaryBackward deleteContentBackward</th><th>cursorDocStart cursorLineBoundaryForward deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c
  - d
```

</td><td>

```buffer
- a
  - ┃◌
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

</td><td>

```buffer
- a

  ┃x
  - b
- c
  - d
```

</td><td>

```buffer
- a┃
  x
  - b
- c
  - d
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

### [SubtreeEdit9](../spec/subtree-selection.md#subtreeedit9)

> "x"

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««[ ] task»»
  - sub
- c
```

</td><td>

```buffer
- [ ] x┃task
  - sub
- c
```

</td><td>

```buffer
- ««[ ] task»»
  - sub
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ««task»»
  - sub
- c
```

</td><td>

```buffer
- [ ] ««task»»
  - sub
- c
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

Adapted: task, under enterOnEmptyItem: unwrap

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
  ¶ ┃
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

Adapted: task, under backspaceAtItemStart: body

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
- [ ] a
  ¶ ┃ [ ]  b
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
- [ ] a

  ┃ [ ]  b
  - c
```

</td></tr>
</table>

### [TaskBackspace3c](../spec/tasks.md#taskbackspace3c)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
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

## Adapted: whitespace (30)

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

┃[a]\: /url
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ ┃
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
  ¶ ┃
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

### [Enter48](../spec/enter.md#enter48)

Adapted: escape, under backspaceAtItemStart: body, under enterSplitSpace: start

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
- [a]: b 
  ¶ ┃c
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
- [a]\: b 

  ┃c
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ```
  code
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ```
  code
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
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

Adapted: escape, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Regression25](../spec/regressions.md#regression25)

Adapted: under backspaceAtItemStart: body, under enterSplitSpace: start

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise
  ¶ ┃2\. draft
```

</td><td>

```buffer
- revise 
  ¶ ┃2\. draft
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- revise ┃2\. draft
```

</td><td>

```buffer
- revise 
- ┃2\. draft
```

</td><td>

```buffer
- revise 

  ┃2\. draft
```

</td></tr>
</table>

### [ShiftEnter5](../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter7](../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Title ┃===
```

</td><td>

```buffer
¶ Title
  ┃===
```

</td><td>

```buffer
¶ Title 
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

### [ShiftEnter8](../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Title ┃--
```

</td><td>

```buffer
¶ Title
  ┃--
```

</td><td>

```buffer
¶ Title 
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

### [ShiftEnter9](../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b)

> shiftEnter

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
  - ┃b
```

</td><td>

```buffer
- a
  - 
    ┃b
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
- a

  -
    ┃b
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃``` x
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

### [ShiftEnter19](../spec/shift-enter.md#shiftenter19)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a | b ┃|---|---|
```

</td><td>

```buffer
¶ a | b
  ┃|---|---|
```

</td><td>

```buffer
¶ a | b 
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
┃|\---|---|
```

</td></tr>
</table>

### [ShiftEnter23](../spec/shift-enter.md#shiftenter23)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [Note]: this ┃matters a lot
```

</td><td>

```buffer
¶ [Note]: this
  ┃matters a lot
```

</td><td>

```buffer
¶ [Note]: this 
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
[Note]\: this 
┃matters a lot
```

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ # b
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

## Adapted: caret (14)

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

### [Backspace48](../spec/backspace.md#backspace48)

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

> cursorCharRight deleteContentBackward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃b
```

</td><td>

```buffer
- ┃# b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorCharRight deleteContentBackward</th></tr>
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
- ┃\# b
```

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

### [Delete32](../spec/delete.md#delete32)

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

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃b
```

</td><td>

```buffer
- ┃# b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>deleteContentForward</th></tr>
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
- ┃\# b
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

### [MoveSubtree12](../spec/move-subtree.md#movesubtree12)

> moveSubtree ②

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
¶ p
```

</td><td>

```buffer
¶ p
- ««x»»
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- ««a»»
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ x┃
- y
¶ z
```

</td><td>

```buffer
¶ x
- y
¶ z┃
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
x

- y

z┃
```

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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ## Title┃
  ¶ para **bold** `c`
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ line one
  line two┃
¶ p2
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ## Setup┃
  ¶ ```shell
    npm install
    ```
````

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

Adapted: under pasteAtTextStart: before

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- x┃
- y
- ab
- c
```

</td><td>

```buffer
- x
- y┃
- ab
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
- y┃
- ab
- c
```

</td></tr>
</table>

### [Regression89](../spec/regressions.md#regression89)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
Keep ~~draft~~ and %%this%% literal
```

</td><td>

```clipboard
<ul><li>Keep ~~draft~~ and %%this%% literal</li></ul>
```

</td></tr>
</table>

> paste

Adapted: empty document

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- Keep \~\~draft\~\~ and %%this%% literal┃
```

</td><td>

```buffer
- Keep \~\~draft\~\~ and %\%this%\% literal┃
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
- Keep \~\~draft\~\~ and %\%this%\% literal┃
```

</td></tr>
</table>

### [Select12](../spec/select.md#select12)

Adapted: under selectNodeUp: sibling

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - th┃ree
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - «th»ree
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td><td>

```buffer
- one
  - ««two
    - deep
  - three»»
  - five
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td><td>

```buffer
- ««one»»
  - two
    - deep
  - three
  - five
- four
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ««three
  - five»»
- four
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
  - five
- four»»
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - ««two
    - deep
  - three
  - five»»
- four
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
  - five
- four»»
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>selectNodeUp</th><th>selectNodeUp</th><th>selectNodeUp</th><th>selectNodeDown</th><th>selectNodeDown</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - th┃ree
  - five
- four
```

</td><td>

```buffer
- one
  - two
    - deep
  - ┃««three»»
  - five
- four
```

</td><td>

```buffer
- one
  - ┃««two
    - deep
  - three»»
  - five
- four
```

</td><td>

```buffer
- ┃««one»»
  - two
    - deep
  - three
  - five
- four
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
  - five
- four»»
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
  - five
- four»»
```

</td></tr>
</table>

## Adapted: error (1)

### [Regression125](../spec/regressions.md#regression125)

Adapted: blank lines, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [?] x┃
  - child
```

</td></tr>
</table>

> deleteContentBackward

Error: SiYuan holds the starting state differently:
  meant:
    - [?] x┃
      - child
  holds:
    - [x] x┃
      - child

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [?] x┃

  - child
```

</td><td>

```buffer
- [?] ┃◌

  - child
```

</td></tr>
</table>

## Skipped (654)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12e](../spec/backspace.md#backspace12e) | option enterAtTextStart: stay |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18b](../spec/backspace.md#backspace18b) | option headingEditing: block |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace29](../spec/backspace.md#backspace29) | line's trailing whitespace |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace5](../spec/backspace.md#softbackspace5) | heading with more lines |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | option quotes: container |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | caret on a code block's fence |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [Backspace42](../spec/backspace.md#backspace42) | caret in a marker |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43c](../spec/backspace.md#backspace43c) | option enterAtTextStart: stay |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| [Backspace45c](../spec/backspace.md#backspace45c) | option joinWithChildren: refuse |
| [Backspace49](../spec/backspace.md#backspace49) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [Backspace50b](../spec/backspace.md#backspace50b) | option backspaceAtItemStart: unwrap |
| **backtick.md** | |
| [Backtick1](../spec/backtick.md#backtick1) | block's text ending in a line break |
| [Backtick2b](../spec/backtick.md#backtick2b) | option closeBackticks: all |
| [Backtick3](../spec/backtick.md#backtick3) | quote |
| [Backtick5](../spec/backtick.md#backtick5) | caret on a code block's fence |
| [Backtick6](../spec/backtick.md#backtick6) | caret on a code block's fence |
| [Backtick7](../spec/backtick.md#backtick7) | option markup: decorated |
| [Backtick8](../spec/backtick.md#backtick8) | block's text ending in a line break |
| [Backtick11](../spec/backtick.md#backtick11) | block's text ending in a line break |
| [Backtick13](../spec/backtick.md#backtick13) | option markup: decorated |
| [Backtick14](../spec/backtick.md#backtick14) | caret on a code block's fence |
| [Backtick16](../spec/backtick.md#backtick16) | option markup: decorated |
| [Backtick19](../spec/backtick.md#backtick19) | option closeBackticks: all |
| [Backtick20](../spec/backtick.md#backtick20) | option closeBackticks: all |
| [Backtick21](../spec/backtick.md#backtick21) | option closeBackticks: all |
| [Backtick22](../spec/backtick.md#backtick22) | option closeBackticks: all |
| [Backtick23](../spec/backtick.md#backtick23) | caret on a code block's fence |
| [Backtick24](../spec/backtick.md#backtick24) | caret on a code block's fence |
| [Backtick25](../spec/backtick.md#backtick25) | caret on a code block's fence |
| [Backtick26](../spec/backtick.md#backtick26) | caret on a code block's fence |
| [Backtick27](../spec/backtick.md#backtick27) | caret on a code block's fence |
| [Backtick28](../spec/backtick.md#backtick28) | caret on a code block's fence |
| [Backtick29](../spec/backtick.md#backtick29) | caret on a code block's fence |
| [Backtick30](../spec/backtick.md#backtick30) | block's text ending in a line break |
| [Backtick31](../spec/backtick.md#backtick31) | option markup: decorated |
| [Backtick32](../spec/backtick.md#backtick32) | option closeBackticks: all |
| **block-ids.md** | |
| [BlockIds1](../spec/block-ids.md#blockids1) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [BlockIds17](../spec/block-ids.md#blockids17) | selection across blocks |
| [BlockIds19](../spec/block-ids.md#blockids19) | caret on a blank line |
| **copy.md** | |
| [Copy1](../spec/copy.md#copy1) | strong emphasis, which SiYuan holds as formatting |
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
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | action deleteSubtree |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree13](../spec/delete-subtree.md#deletesubtree13) | action deleteSubtree |
| [DeleteSubtree14](../spec/delete-subtree.md#deletesubtree14) | action deleteSubtree |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete5d](../spec/delete.md#delete5d) | block's text starting with whitespace |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete5f](../spec/delete.md#delete5f) | option emptyItemWithChildren: refuse |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
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
| [Delete18d](../spec/delete.md#delete18d) | option enterAtTextStart: stay |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
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
| [Drag8](../spec/drag.md#drag8) | no zoom |
| **duplicate-subtree.md** | |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action deleteSubtree |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | indented code |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | option quotes: container |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | selection across blocks |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | caret on a code block's fence |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | unclosed fence, which SiYuan closes |
| [DuplicateSubtree12](../spec/duplicate-subtree.md#duplicatesubtree12) | caret in a marker |
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
| [Enter37](../spec/enter.md#enter37) | block's text ending in a line break |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65j](../spec/enter.md#enter65j) | block's text starting with whitespace |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
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
| [Enter67](../spec/enter.md#enter67) | caret on a thematic break |
| [Enter68](../spec/enter.md#enter68) | callout |
| [Enter70](../spec/enter.md#enter70) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| **fences.md** | |
| [Fence3](../spec/fences.md#fence3) | line's leading whitespace |
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
| [Fence31b](../spec/fences.md#fence31b) | caret on a code block's fence |
| [Fence32](../spec/fences.md#fence32) | caret on a code block's fence |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| [Fence33](../spec/fences.md#fence33) | caret on a code block's fence |
| [Fence35](../spec/fences.md#fence35) | caret on a code block's fence |
| [Fence40](../spec/fences.md#fence40) | quote |
| [Fence41](../spec/fences.md#fence41) | caret on a code block's fence |
| [Fence49](../spec/fences.md#fence49) | line's leading whitespace |
| [Fence50](../spec/fences.md#fence50) | line's leading whitespace |
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
| [Fence61](../spec/fences.md#fence61) | caret in a marker |
| [Fence63](../spec/fences.md#fence63) | block's text starting with whitespace |
| [Fence64](../spec/fences.md#fence64) | block's text starting with whitespace |
| **fold.md** | |
| [Fold2b](../spec/fold.md#fold2b) | option enterMidItem: child |
| [Fold9](../spec/fold.md#fold9) | action fold ② |
| [Fold10](../spec/fold.md#fold10) | action fold ① |
| [Fold11](../spec/fold.md#fold11) | action toggleFold |
| [Fold13](../spec/fold.md#fold13) | a fold on a free block, its section out of the editor |
| **gaps.md** | |
| [Gap14](../spec/gaps.md#gap14) | block's text ending in a line break |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent13](../spec/indent.md#indent13) | line's leading whitespace |
| [Indent19](../spec/indent.md#indent19) | line's trailing whitespace |
| [Indent20](../spec/indent.md#indent20) | line's leading whitespace |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | caret on a code block's fence |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| [Indent33](../spec/indent.md#indent33) | line's leading whitespace |
| [Indent34](../spec/indent.md#indent34) | caret on a code block's fence |
| [Indent35](../spec/indent.md#indent35) | caret in a math block |
| [Indent36](../spec/indent.md#indent36) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [Indent37](../spec/indent.md#indent37) | caret on a thematic break |
| [Indent37b](../spec/indent.md#indent37b) | caret on a thematic break |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent44](../spec/indent.md#indent44) | line's leading whitespace |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| [Indent47](../spec/indent.md#indent47) | option mixedDepths: each |
| [Indent48](../spec/indent.md#indent48) | option mixedDepths: each |
| [Indent50](../spec/indent.md#indent50) | nothing to compare |
| **lists.md** | |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| [Lists9](../spec/lists.md#lists9) | action deleteSubtree |
| [Lists10](../spec/lists.md#lists10) | action deleteSubtree |
| [Lists13](../spec/lists.md#lists13) | option listMoves: item |
| [Lists14](../spec/lists.md#lists14) | option listMoves: item |
| [Lists15](../spec/lists.md#lists15) | option listMoves: item |
| **move-subtree-down.md** | |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | caret on a code block's fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | caret on a code block's fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | caret on a blank line |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | line's trailing whitespace |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | caret in a marker |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | caret in a marker |
| **move-subtree-up.md** | |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | option quotes: container |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret in a marker |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | caret in a math block |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | caret in a math block |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp40](../spec/move-subtree-up.md#moveup40) | line's leading whitespace |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | unclosed fence, which SiYuan closes |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| **move-subtree.md** | |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | changes only what blocks can't show |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | changes only what blocks can't show |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | nothing to compare |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | nothing to compare |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | nothing to compare |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | nothing to compare |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | drop: the pickup is refused (non-contiguous) |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | nothing to compare |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | quote |
| [MoveSubtree22](../spec/move-subtree.md#movesubtree22) | drop: a free block's place beside an item: SiYuan's drag of one puts it in the item or beside the item's whole list |
| **obsidian-true-outliner.md** | |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | caret in a marker |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | caret on a blank line |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO-MarkerCol](../spec/obsidian-true-outliner.md#to-markercol) | block's text starting with whitespace |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO7](../spec/obsidian-true-outliner.md#to7) | option outdent: logical |
| [TO18](../spec/obsidian-true-outliner.md#to18) | option enterOnEmptyItem: outdent |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | option quotes: container |
| **outdent.md** | |
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
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| [Outdent23](../spec/outdent.md#outdent23) | option mixedDepths: each |
| [Outdent24](../spec/outdent.md#outdent24) | option outdent: logical |
| [Outdent26](../spec/outdent.md#outdent26) | nothing to compare |
| **paste-at.md** | |
| [PasteAt1](../spec/paste-at.md#pasteat1) | action pasteAt |
| [PasteAt2](../spec/paste-at.md#pasteat2) | action pasteAt |
| [PasteAt3](../spec/paste-at.md#pasteat3) | action pasteAt |
| [PasteAt4](../spec/paste-at.md#pasteat4) | action pasteAt |
| [PasteAt5](../spec/paste-at.md#pasteat5) | action deleteByDrag |
| **paste-html.md** | |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | option quotes: container |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | callout |
| [PastePlain30](../spec/paste-plain.md#pasteplain30) | block's text starting with whitespace |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste13](../spec/paste.md#paste13) | block's text ending in a line break |
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
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
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
| [Quote90](../spec/quotes.md#quote90) | quote |
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
| [Quote75](../spec/quotes.md#quote75) | quote |
| [Quote77](../spec/quotes.md#quote77) | option quotes: container |
| [Quote78](../spec/quotes.md#quote78) | option quotes: container |
| [Quote79](../spec/quotes.md#quote79) | callout |
| [Quote80](../spec/quotes.md#quote80) | option quotes: container |
| [Quote81](../spec/quotes.md#quote81) | quote |
| [Quote82](../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote88](../spec/quotes.md#quote88) | quote |
| [Quote83](../spec/quotes.md#quote83) | option quotes: container |
| [Quote84](../spec/quotes.md#quote84) | callout |
| [Quote85](../spec/quotes.md#quote85) | quote |
| [Quote86](../spec/quotes.md#quote86) | quote |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | quote |
| [Quote91b](../spec/quotes.md#quote91b) | quote |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | quote |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | quote |
| [Quote97](../spec/quotes.md#quote97) | quote |
| [QuoteText5](../spec/quotes.md#quotetext5) | action deleteSubtree |
| [QuoteText8](../spec/quotes.md#quotetext8) | quote |
| [QuoteText9](../spec/quotes.md#quotetext9) | quote |
| [QuoteText17](../spec/quotes.md#quotetext17) | quote |
| [QuoteText19](../spec/quotes.md#quotetext19) | line's trailing whitespace |
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
| [Regression2](../spec/regressions.md#regression2) | line's trailing whitespace |
| [Regression4](../spec/regressions.md#regression4) | later line starting with a list marker |
| [Regression7](../spec/regressions.md#regression7) | line's leading whitespace |
| [Regression9](../spec/regressions.md#regression9) | line's leading whitespace |
| [Regression12](../spec/regressions.md#regression12) | later line starting with a list marker |
| [Regression15](../spec/regressions.md#regression15) | heading with more lines |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | option headingEditing: block |
| [Regression19](../spec/regressions.md#regression19) | option headingEditing: block |
| [Regression20](../spec/regressions.md#regression20) | option joinWithChildren: refuse |
| [Regression21](../spec/regressions.md#regression21) | option pasteLines: items |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| [Regression23](../spec/regressions.md#regression23) | unclosed fence, which SiYuan closes |
| [Regression27](../spec/regressions.md#regression27) | later line starting with a list marker |
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression30](../spec/regressions.md#regression30) | line's leading whitespace |
| [Regression31](../spec/regressions.md#regression31) | caret in a marker |
| [Regression32](../spec/regressions.md#regression32) | line's leading whitespace |
| [Regression37](../spec/regressions.md#regression37) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression39](../spec/regressions.md#regression39) | later line starting with a list marker |
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression44](../spec/regressions.md#regression44) | line's leading whitespace |
| [Regression45](../spec/regressions.md#regression45) | selection across blocks |
| [Regression46](../spec/regressions.md#regression46) | line's trailing whitespace |
| [Regression47](../spec/regressions.md#regression47) | heading with more lines |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression49](../spec/regressions.md#regression49) | line's trailing whitespace |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | selection across blocks |
| [Regression52](../spec/regressions.md#regression52) | indented code |
| [Regression53](../spec/regressions.md#regression53) | heading with more lines |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression55](../spec/regressions.md#regression55) | line's leading whitespace |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| [Regression67](../spec/regressions.md#regression67) | action deleteSubtree |
| [Regression68](../spec/regressions.md#regression68) | caret on a blank line |
| [Regression69](../spec/regressions.md#regression69) | the caret in a block a fold hides |
| [Regression70](../spec/regressions.md#regression70) | action deleteSubtree |
| [Regression73](../spec/regressions.md#regression73) | no-break space, which SiYuan holds as a space |
| [Regression76](../spec/regressions.md#regression76) | block's text starting with whitespace |
| [Regression77](../spec/regressions.md#regression77) | block's text starting with whitespace |
| [Regression78](../spec/regressions.md#regression78) | option quotes: atom |
| [Regression80](../spec/regressions.md#regression80) | action pasteAt |
| [Regression81](../spec/regressions.md#regression81) | block's text starting with whitespace |
| [Regression82](../spec/regressions.md#regression82) | block's text starting with whitespace |
| [Regression84](../spec/regressions.md#regression84) | quote |
| [Regression85](../spec/regressions.md#regression85) | line's leading whitespace |
| [Regression90](../spec/regressions.md#regression90) | option closeBackticks: all |
| [Regression91](../spec/regressions.md#regression91) | option pastePlainLines: enter |
| [Regression92](../spec/regressions.md#regression92) | caret in a marker |
| [Regression94](../spec/regressions.md#regression94) | no zoom |
| [Regression97](../spec/regressions.md#regression97) | no zoom |
| [Regression100](../spec/regressions.md#regression100) | caret on a blank line |
| [Regression101](../spec/regressions.md#regression101) | quote |
| [Regression102](../spec/regressions.md#regression102) | block's text starting with whitespace |
| [Regression105](../spec/regressions.md#regression105) | option pasteSeams: open |
| [Regression106](../spec/regressions.md#regression106) | caret on a blank line |
| [Regression107](../spec/regressions.md#regression107) | caret on a code block's fence |
| [Regression108](../spec/regressions.md#regression108) | quote |
| [Regression109](../spec/regressions.md#regression109) | quote |
| [Regression110](../spec/regressions.md#regression110) | block's text starting with whitespace |
| [Regression111](../spec/regressions.md#regression111) | quote |
| [Regression112](../spec/regressions.md#regression112) | quote |
| [Regression114](../spec/regressions.md#regression114) | option pastePlainLines: enter |
| [Regression116](../spec/regressions.md#regression116) | line's leading whitespace |
| [Regression117](../spec/regressions.md#regression117) | quote |
| [Regression119](../spec/regressions.md#regression119) | quote |
| [Regression123](../spec/regressions.md#regression123) | option markup: decorated |
| [Regression124](../spec/regressions.md#regression124) | the caret in a block a fold hides |
| [Regression126](../spec/regressions.md#regression126) | line's leading whitespace |
| [Regression127](../spec/regressions.md#regression127) | quote |
| [Regression128](../spec/regressions.md#regression128) | action pasteAt |
| [Regression129](../spec/regressions.md#regression129) | quote |
| [Regression130](../spec/regressions.md#regression130) | selection across blocks |
| [Regression131](../spec/regressions.md#regression131) | quote |
| [Regression132](../spec/regressions.md#regression132) | action deleteByDrag |
| [Regression133](../spec/regressions.md#regression133) | option closeBackticks: all |
| [Regression134](../spec/regressions.md#regression134) | option closeBackticks: all |
| [Regression136](../spec/regressions.md#regression136) | heading with more lines |
| [Regression137](../spec/regressions.md#regression137) | heading's closing #s |
| [Regression142](../spec/regressions.md#regression142) | nothing to compare |
| [Regression147](../spec/regressions.md#regression147) | caret on a code block's fence |
| [Regression150](../spec/regressions.md#regression150) | caret in a math block |
| [Regression151](../spec/regressions.md#regression151) | nothing to compare |
| [Regression152](../spec/regressions.md#regression152) | option markup: decorated |
| [Regression154](../spec/regressions.md#regression154) | indented code |
| [Regression158](../spec/regressions.md#regression158) | quote |
| [Regression159](../spec/regressions.md#regression159) | caret in a marker |
| [Regression160](../spec/regressions.md#regression160) | option pastePlainLines: enter |
| [Regression161](../spec/regressions.md#regression161) | callout |
| [Regression164](../spec/regressions.md#regression164) | caret on a code block's fence |
| [Regression165](../spec/regressions.md#regression165) | caret in a marker |
| [Regression166](../spec/regressions.md#regression166) | option quotes: container |
| [Regression167](../spec/regressions.md#regression167) | block's text starting with whitespace |
| [Regression168](../spec/regressions.md#regression168) | block's text starting with whitespace |
| [Regression170](../spec/regressions.md#regression170) | line's trailing whitespace |
| [Regression171](../spec/regressions.md#regression171) | quote |
| [Regression172](../spec/regressions.md#regression172) | quote |
| [Regression173](../spec/regressions.md#regression173) | quote |
| [Regression175](../spec/regressions.md#regression175) | line's trailing whitespace |
| [Regression176](../spec/regressions.md#regression176) | quote |
| [Regression177](../spec/regressions.md#regression177) | block's text starting with whitespace |
| [Regression178](../spec/regressions.md#regression178) | option closeBackticks: all |
| [Regression179](../spec/regressions.md#regression179) | caret on a thematic break |
| [Regression180](../spec/regressions.md#regression180) | block's text starting with whitespace |
| [Regression183](../spec/regressions.md#regression183) | quote |
| [Regression184](../spec/regressions.md#regression184) | quote |
| [Regression185](../spec/regressions.md#regression185) | quote |
| [Regression186](../spec/regressions.md#regression186) | quote |
| [Regression187](../spec/regressions.md#regression187) | quote |
| [Regression188](../spec/regressions.md#regression188) | quote |
| [Regression190](../spec/regressions.md#regression190) | quote |
| [Regression191](../spec/regressions.md#regression191) | quote |
| [Regression192](../spec/regressions.md#regression192) | unclosed fence, which SiYuan closes |
| [Regression193](../spec/regressions.md#regression193) | caret on a blank line |
| [Regression194](../spec/regressions.md#regression194) | unclosed fence, which SiYuan closes |
| [Regression195](../spec/regressions.md#regression195) | quote |
| [Regression196](../spec/regressions.md#regression196) | action deleteSubtree |
| [Regression198](../spec/regressions.md#regression198) | quote |
| **scenarios.md** | |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario10](../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| **select.md** | |
| [Select1](../spec/select.md#select1) | action selectNode |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select7](../spec/select.md#select7) | selection across blocks |
| [Select10](../spec/select.md#select10) | no zoom |
| [Select17](../spec/select.md#select17) | caret on a blank line |
| [Select18](../spec/select.md#select18) | changes only what blocks can't show |
| **shift-enter.md** | |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret in a marker |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | table SiYuan writes otherwise (its columns padded to their widest cell) |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret in a task's checkbox |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter33](../spec/shift-enter.md#shiftenter33) | line's leading whitespace |
| **subtree-selection.md** | |
| [SubtreeEdit10](../spec/subtree-selection.md#subtreeedit10) | a thematic break other than ---, which SiYuan holds as --- |
| [SubtreeEdit15](../spec/subtree-selection.md#subtreeedit15) | caret in a marker |
| [SubtreeEdit17](../spec/subtree-selection.md#subtreeedit17) | option pasteOverSelection: ignore |
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
| [Typing1](../spec/typing.md#typing1) | block's text ending in a line break |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | caret on a blank line |
| **zoom.md** | |
| [Zoom1](../spec/zoom.md#zoom1) | no zoom |
| [Zoom2](../spec/zoom.md#zoom2) | no zoom |
| [Zoom3](../spec/zoom.md#zoom3) | no zoom |
| [Zoom4](../spec/zoom.md#zoom4) | no zoom |
| [Zoom5](../spec/zoom.md#zoom5) | no zoom |
| [Zoom6](../spec/zoom.md#zoom6) | no zoom |
| [Zoom7](../spec/zoom.md#zoom7) | no zoom |
| [Zoom8](../spec/zoom.md#zoom8) | no zoom |
| [Zoom9](../spec/zoom.md#zoom9) | no zoom |
| [Zoom10](../spec/zoom.md#zoom10) | no zoom |
| [Zoom11](../spec/zoom.md#zoom11) | no zoom |
| [Zoom12](../spec/zoom.md#zoom12) | no zoom |
| [Zoom13](../spec/zoom.md#zoom13) | no zoom |
| [Zoom14](../spec/zoom.md#zoom14) | no zoom |
