---
type: "SxS"
app: "notion"
version: "9d8db519bcb92566"
url: "https://jordanscales.notion.site/Nested-TODOs-d1769a74c4c04d2a8e36f45c1520a150"
model: "block"
command: "node sxs/run.ts notion"
elapsed_s: 616
workers: 4
---

# Notion vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 200 | [26](#caret-26) | [19](#whitespace-19) | [153](#disagree-153) |  |  | **398** |
| adapted | 173 | [17](#adapted-caret-17) | [16](#adapted-whitespace-16) | [104](#adapted-disagree-104) |  |  | **310** |
| **total** | **373 (25%)** | **43 (2.9%)** | **35 (2.3%)** | **257 (17%)** | **0 (0%)** | **[787](#skipped-787) (53%)** | **1499** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [auto.md](../spec/auto.md) | 6 |  |  | 9 |  | 24 | **39** | 8 | 7 |
| [backspace.md](../spec/backspace.md) | 40 |  | 8 | 10 |  | 30 | **88** | 30 | 28 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** | 1 |  |
| [block-ids.md](../spec/block-ids.md) | 1 |  |  |  |  | 20 | **21** |  | 1 |
| [copy.md](../spec/copy.md) | 4 | 1 |  | 1 |  | 7 | **13** | 4 | 2 |
| [cursor.md](../spec/cursor.md) | 23 | 5 |  |  |  | 8 | **36** | 24 | 4 |
| [delete-subtree.md](../spec/delete-subtree.md) | 5 |  |  | 1 |  | 8 | **14** | 3 | 3 |
| [delete.md](../spec/delete.md) | 25 |  |  | 6 |  | 25 | **56** | 22 | 9 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 13 | **13** |  |  |
| [enter.md](../spec/enter.md) | 57 |  | 7 | 6 |  | 28 | **98** | 20 | 50 |
| [fences.md](../spec/fences.md) | 3 |  | 2 | 3 |  | 62 | **70** |  | 8 |
| [fold.md](../spec/fold.md) |  |  |  |  |  | 22 | **22** |  |  |
| [gaps.md](../spec/gaps.md) | 7 | 1 |  | 6 |  | 5 | **19** | 10 | 4 |
| [indent.md](../spec/indent.md) | 20 |  |  | 16 |  | 19 | **55** | 27 | 9 |
| [lists.md](../spec/lists.md) | 3 |  |  | 9 |  | 4 | **16** | 3 | 9 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 10 |  |  | 27 |  | 8 | **45** | 31 | 6 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 9 |  |  | 25 |  | 13 | **47** | 29 | 5 |
| [move-subtree.md](../spec/move-subtree.md) |  |  |  |  |  | 24 | **24** |  |  |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 35 | 2 | 2 | 8 |  | 20 | **67** | 27 | 20 |
| [outdent.md](../spec/outdent.md) | 11 |  |  | 14 |  | 17 | **42** | 21 | 4 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 2 | 2 |  | 2 |  |  | **6** | 5 | 1 |
| [paste-html.md](../spec/paste-html.md) |  | 9 | 1 | 7 |  | 2 | **19** |  | 17 |
| [paste-list-form.md](../spec/paste-list-form.md) |  | 3 |  | 2 |  | 1 | **6** | 4 | 1 |
| [paste-list.md](../spec/paste-list.md) | 2 | 3 | 2 | 14 |  | 8 | **29** | 10 | 11 |
| [paste-plain.md](../spec/paste-plain.md) | 4 |  |  | 22 |  | 10 | **36** | 17 | 9 |
| [paste.md](../spec/paste.md) | 1 | 12 | 1 | 3 |  | 19 | **36** | 13 | 4 |
| [placeholders.md](../spec/placeholders.md) | 8 |  | 1 |  |  | 14 | **23** | 6 | 3 |
| [quirks.md](../spec/quirks.md) |  |  |  |  |  | 7 | **7** |  |  |
| [quotes.md](../spec/quotes.md) | 7 | 1 | 1 | 5 |  | 129 | **143** |  | 14 |
| [regressions.md](../spec/regressions.md) | 33 |  | 7 | 38 |  | 124 | **202** | 35 | 43 |
| [scenarios.md](../spec/scenarios.md) | 7 | 2 | 1 | 10 |  | 9 | **29** | 14 | 6 |
| [select.md](../spec/select.md) |  |  |  |  |  | 23 | **23** |  |  |
| [shift-enter.md](../spec/shift-enter.md) | 23 |  | 2 | 5 |  | 8 | **38** | 18 | 12 |
| [subtree-selection.md](../spec/subtree-selection.md) | 9 | 2 |  | 2 |  | 6 | **19** | 12 | 1 |
| [tasks.md](../spec/tasks.md) | 15 |  |  | 2 |  | 13 | **30** |  | 17 |
| [typing.md](../spec/typing.md) |  |  |  | 3 |  |  | **3** | 1 | 2 |
| [undo.md](../spec/undo.md) | 2 |  |  | 1 |  | 2 | **5** | 3 |  |
| [zoom.md](../spec/zoom.md) |  |  |  |  |  | 14 | **14** |  |  |
| **total** | **373 (25%)** | **43 (2.9%)** | **35 (2.3%)** | **257 (17%)** | **0 (0%)** | **791 (53%)** | **1499** | **398 (27%)** | **310 (21%)** |

## Disagree (153)

### [Auto23](../spec/auto.md#auto23)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a $x ┃- y$ b
```

</td><td>

```buffer
¶ a $x 
  ┃\- y$ b
```

</td><td>

```buffer
¶ a $x ┃- y$ b
```

</td></tr>
</table>

### [Auto24](../spec/auto.md#auto24)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a `x ┃- y` b
```

</td><td>

```buffer
¶ a `x 
  ┃\- y` b
```

</td><td>

```buffer
¶ a `x ┃- y` b
```

</td></tr>
</table>

### [Auto28](../spec/auto.md#auto28)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a┃
```

</td></tr>
</table>

> " $$"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a $$┃
```

</td><td>

```buffer
¶ a $$┃$$
```

</td></tr>
</table>

> "x"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a $$x┃
```

</td><td>

```buffer
¶ a $$x┃$$
```

</td></tr>
</table>

### [Auto30](../spec/auto.md#auto30)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a ┃
```

</td></tr>
</table>

> "$$"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a $$┃
```

</td><td>

```buffer
¶ a $$┃$$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ a $┃
```

</td></tr>
</table>

### [Auto31](../spec/auto.md#auto31)

> "$$x$$"

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a ┃
```

</td><td>

```buffer
¶ a ⁍┃
```

</td><td>

```buffer
¶ a $$x$$┃
```

</td></tr>
</table>

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ ┃bc
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃bc
```

</td></tr>
</table>

### [Backspace19b](../spec/backspace.md#backspace19b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ b┃c
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ b
  ¶ ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ b
¶ ┃c
```

</td><td>

```buffer
- a
  ¶ b┃c
```

</td></tr>
</table>

### [Backspace23](../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃para
```

</td><td>

```buffer

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Backspace43b](../spec/backspace.md#backspace43b)

> enter deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃Title
```

</td><td>

```buffer
¶ ┃Title
```

</td><td>

```buffer
¶ # ┃Title
```

</td></tr>
</table>

### [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5)

> deleteSubtree

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b
- c»»
- d
```

</td><td>

```buffer
- a
- b
- c
- d
```

</td><td>

```buffer
- a┃
- d
```

</td></tr>
</table>

### [Delete5d](../spec/delete.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Delete18b](../spec/delete.md#delete18b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter4](../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter32b](../spec/enter.md#enter32b)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃H1
```

</td><td>

```buffer
¶ 
¶ # ┃H1
```

</td><td>

```buffer
¶ # 
  ¶ ┃H1
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Gap8](../spec/gaps.md#gap8)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
¶ para
```

</td><td>

```buffer
- a
  - b┃
¶ para
```

</td><td>

```buffer
- b┃
- a
¶ para
```

</td></tr>
</table>

### [Indent2](../spec/indent.md#indent2)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - c
    more c
```

</td><td>

```buffer
- a
  - b┃
  - c
    more c
```

</td><td>

```buffer
- a
  - b┃
    - c
      more c
```

</td></tr>
</table>

### [Indent12](../spec/indent.md#indent12)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Indent26](../spec/indent.md#indent26)

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

> indent

<table>
<tr><th>notion</th><th>ourus</th></tr>
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
- b┃
  - c
- d
```

</td></tr>
</table>

### [Indent29](../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Indent45](../spec/indent.md#indent45)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ¶ para
```

</td><td>

```buffer
- a
  - b┃
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

### [Lists3](../spec/lists.md#lists3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Intro
- a
  - a1
- b
¶ Next┃
```

</td><td>

```buffer
¶ Intro
- a
  - a1
- b
  ¶ Next┃
```

</td><td>

```buffer
¶ Intro
¶ Next┃
- a
  - a1
- b
```

</td></tr>
</table>

### [Lists6](../spec/lists.md#lists6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
1. a
¶ pa┃ra
- b
¶ next
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [MoveDown6](../spec/move-subtree-down.md#movedown6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
  - b┃
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [MoveDown11](../spec/move-subtree-down.md#movedown11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b
  - b1
- c»»
- d
```

</td><td>

```buffer
- a
- d
  - ««b
    - b1
  - c»»
```

</td><td>

```buffer
- a
- d
- ««b
  - b1
- c»»
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
  - ««c
    - c1
  - d»»
- e
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ««c
  - c1
- d»»
- e
  - e1
```

</td><td>

```buffer
- a
  - b
- e
  - ««c
    - c1
  - d»»
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- e
  - ««c
    - c1
  - d»»
  - e1
```

</td><td>

```buffer
- a
  - b
- e
  - e1
  - ««c
    - c1
  - d»»
```

</td></tr>
</table>

### [MoveDown14](../spec/move-subtree-down.md#movedown14)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a»»
  - b
- c
```

</td><td>

```buffer
- c
  - ««a»»
    - b
```

</td><td>

```buffer
- c
- ««a»»
  - b
```

</td></tr>
</table>

### [MoveDown15](../spec/move-subtree-down.md#movedown15)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
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

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. b
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

```buffer
1. b
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
1. b
   9. a┃
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. ┃b
      1. x
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃b
   1. x
2. a
```

</td><td>

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [MoveDown41](../spec/move-subtree-down.md#movedown41)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - c
- d
```

</td><td>

```buffer
- a
- d
  - ««b»»
    - c
```

</td><td>

```buffer
- a
- d
- ««b»»
  - c
```

</td></tr>
</table>

### [MoveDown45](../spec/move-subtree-down.md#movedown45)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- a
```

</td><td>

```buffer
- a
  - a┃
```

</td><td>

```buffer
- a
- a┃
```

</td></tr>
</table>

### [MoveUp1](../spec/move-subtree-up.md#moveup1)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
- c
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
- c
```

</td><td>

```buffer
- b┃
  - b1
- a
- c
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
- c
```

</td></tr>
</table>

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [MoveUp5](../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [MoveUp10](../spec/move-subtree-up.md#moveup10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b
  - b1
- c»»
- d
```

</td><td>

```buffer
- a
  - ««b
    - b1
  - c»»
- d
```

</td><td>

```buffer
- ««b
  - b1
- c»»
- a
- d
```

</td></tr>
</table>

### [MoveUp11](../spec/move-subtree-up.md#moveup11)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
- b
  - ««c
    - c1
  - d»»
  - e
```

</td><td>

```buffer
- a
  - a1
- ««c
  - c1
- d»»
- b
  - e
```

</td><td>

```buffer
- a
  - a1
  - ««c
    - c1
  - d»»
- b
  - e
```

</td></tr>
</table>

### [MoveUp14](../spec/move-subtree-up.md#moveup14)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
```

</td><td>

```buffer
1. a
   1. b┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
9. a
   - x
   1. b┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
¶ # B
  ¶ ## s┃
    - y
```

</td></tr>
</table>

### [MoveUp28](../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [MoveUp31](../spec/move-subtree-up.md#moveup31)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c
- ««a»»
  - b
```

</td><td>

```buffer
- c
  - ««a»»
    - b
```

</td><td>

```buffer
- ««a»»
  - b
- c
```

</td></tr>
</table>

### [MoveUp32](../spec/move-subtree-up.md#moveup32)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
- ┃
- a
- b
```

</td></tr>
</table>

### [MoveUp33](../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H
  - a
  ¶ ## ┃H
```

</td><td>

```buffer
¶ # H
  - a
    ¶ ## ┃H
```

</td><td>

```buffer
¶ # H
  - a
  ¶ ## ┃H
```

</td></tr>
</table>

### [MoveUp40](../spec/move-subtree-up.md#moveup40)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - y
  - a┃
     b
```

</td><td>

```buffer
- x
  - y
    - ┃a
       b
```

</td><td>

```buffer
- x
  - a┃
     b
  - y
```

</td></tr>
</table>

### [MoveUp44](../spec/move-subtree-up.md#moveup44)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - c
- d
```

</td><td>

```buffer
- a
  - ««b»»
    - c
- d
```

</td><td>

```buffer
- ««b»»
  - c
- a
- d
```

</td></tr>
</table>

### [MoveUp46](../spec/move-subtree-up.md#moveup46)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
  - ««c»»
```

</td><td>

```buffer
- a
- ««c»»
- b
```

</td><td>

```buffer
- a
  - ««c»»
- b
```

</td></tr>
</table>

### [MoveUp47](../spec/move-subtree-up.md#moveup47)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- a┃
```

</td><td>

```buffer
- a
  - a┃
```

</td><td>

```buffer
- a┃
- a
```

</td></tr>
</table>

### [TO-E7-E8b](../spec/obsidian-true-outliner.md#to-e7-e8b)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃
  ¶ para
```

</td><td>

```buffer
- item
- ┃
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  ┃
  bar
```

</td><td>

```buffer
- foo
  ¶ bar
```

</td></tr>
</table>

> "x"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [TO-BlockId](../spec/obsidian-true-outliner.md#to-blockid)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ^id
```

</td><td>

```buffer
- a
  - b┃
    ^id
```

</td><td>

```buffer
- b┃
  ^id
- a
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- ««a
  - b
- c»»
```

</td><td>

```buffer
¶ para
- ««a
  - b
- c»»
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Outdent12](../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
```

</td><td>

```buffer
- ««a
- b»»
```

</td><td>

```buffer
¶ ««a
¶ b»»
```

</td></tr>
</table>

### [Outdent13](../spec/outdent.md#outdent13)

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
- b┃
  - c
  - d
```

</td></tr>
</table>

> indent

<table>
<tr><th>notion</th><th>ourus</th></tr>
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
    - c
    - d
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Outdent20](../spec/outdent.md#outdent20)

> outdent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  |\---|---|
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
¶ ««x
  y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
¶ ««```markdown
  \- x
  \- y
  
  
  ```»»
- b
````

</td><td>

```buffer
- a
- x
- y┃
- b
```

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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
1. ««x
2. y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. a
- ««x
- y»»
1. b
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- a
  - kid
- ««x
- y»»
```

</td><td>

```buffer
- a
  - x
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
- 
- ««x
- y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- 
  - kid
- ««x
- y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
  ┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
¶ ««Notes:
- x
- y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
¶ ««one
  two
- x»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
¶ ««x
  y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
¶ ««x
  y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ab
¶ ««x
¶ y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
¶ ««x
  2\. y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ 1┃
```

</td><td>

```buffer
¶ 1
¶ ««. a
  b»»
```

</td><td>

```buffer
¶ 1\. a
  b
  ┃
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ p
¶ ««x»»
```

</td><td>

```buffer
¶ px
¶ [a]\: /u┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ p
¶ ««x
   y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ p
¶ ««x
   
  y»»
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
  - c
¶ ««x
  y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

````buffer
- a
¶ ««```
  first
  second
  ```»»
````

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
¶ ««a
¶ b»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # H┃
```

</td><td>

```buffer
¶ # H
  ¶ ««x
    y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃b
```

</td><td>

```buffer
- a
  b
¶ ««x»»
```

</td><td>

```buffer
- a
  ¶ x┃b
```

</td></tr>
</table>

### [PastePlain25](../spec/paste-plain.md#pasteplain25)

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃abc
```

</td><td>

```buffer
¶ abc
¶ ««x»»
```

</td><td>

```buffer
¶ x┃abc
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p
¶ ┃abc
```

</td><td>

```buffer
¶ p
¶ abc
¶ ««x»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
¶ ««x
  y»»
```

</td><td>

```buffer
- ax
  y
  ┃b
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
  ┃
¶ b
```

</td><td>

```buffer
¶ a
  \- x
  ┃
¶ b
```

</td><td>

```buffer
¶ a
- x┃
¶ b
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- abcd
- ««x
- y»»
- e
```

</td><td>

```buffer
- ad
- x
- y┃
- e
```

</td></tr>
</table>

### [Regression8](../spec/regressions.md#regression8)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  2. ┃x
```

</td><td>

```buffer
- a
  - b
    2. ┃x
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression13](../spec/regressions.md#regression13)

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ «ab»c
```

</td><td>

```buffer
¶ abc
¶ ««x»»
```

</td><td>

```buffer
¶ x┃c
```

</td></tr>
</table>

### [Regression39](../spec/regressions.md#regression39)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- l┃ong text
- b
- x
  2\) x
```

</td><td>

```buffer
- b
  - l┃ong text
- x
  2\) x
```

</td><td>

```buffer
- b
- l┃ong text
- x
  2\) x
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
1. «x»
2. b
```

</td><td>

```buffer
- a
1. - x
   ┃
2. b
```

</td><td>

```buffer
- a
1. x┃
2. b
```

</td></tr>
</table>

### [Regression65](../spec/regressions.md#regression65)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- 	b
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - c
```

</td><td>

```buffer
- a- →b
  ┃
  - c
```

</td><td>

```buffer
- a
  - b┃
  - c
```

</td></tr>
</table>

### [Regression75](../spec/regressions.md#regression75)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
Call Sam
Email Alex
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Project
  - ┃
- Inbox
```

</td><td>

```buffer
- Project
  - 
  ¶ ««Call Sam
    Email Alex»»
- Inbox
```

</td><td>

```buffer
- Project
  - Call Sam
    Email Alex┃
- Inbox
```

</td></tr>
</table>

### [Regression77](../spec/regressions.md#regression77)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Earlier
-  ┃Review
- Detail
- Later
```

</td><td>

```buffer
- Earlier
  -  ┃Review
- Detail
- Later
```

</td><td>

```buffer
-  ┃Review
- Earlier
- Detail
- Later
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inbox
¶ ««Draft announcement
  Send update
  Archive notes»»
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

### [Regression85](../spec/regressions.md#regression85)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
-
  x
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] 
   «    - b»
```

</td><td>

```buffer
- [x] 
       - b
- ««x»»
```

</td><td>

```buffer
- [x] 
  x┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ here┃
```

</td><td>

```buffer
¶ here**Title**┃
```

</td><td>

```buffer
¶ here
¶ ## Title┃
```

</td></tr>
</table>

### [Regression144](../spec/regressions.md#regression144)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression157](../spec/regressions.md#regression157)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
line one
line two

p2
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Project
  - ┃
- Inbox
```

</td><td>

```buffer
- Project
  - 
  ¶ ««line one
    line two
  ¶ p2»»
- Inbox
```

</td><td>

```buffer
- Project
  - line one
    line two
    ¶ p2┃
- Inbox
```

</td></tr>
</table>

### [Regression170](../spec/regressions.md#regression170)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- 
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. 
2. c┃
      a
```

</td><td>

```buffer
1. 
2. c-
   ┃
      a
```

</td><td>

```buffer
1. 
2. c
      a
3. ┃
```

</td></tr>
</table>

### [Regression177](../spec/regressions.md#regression177)

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ «« b»»
```

</td><td>

```buffer
¶ «« b»»
```

</td><td>

```buffer
¶  x┃
```

</td></tr>
</table>

### [Regression181](../spec/regressions.md#regression181)

> indent

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ [a]
  [a]:s┃
```

</td><td>

```buffer
¶ [a]
  [a]:s┃
```

</td><td>

```buffer
- [a]
  [a]:s┃
```

</td></tr>
</table>

### [Scenario8](../spec/scenarios.md#scenario8)

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - Work┃
    - email
- Home
  - plants
```

</td><td>

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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - Work┃
  - email
- Home
  - plants
```

</td><td>

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

### [Scenario10](../spec/scenarios.md#scenario10)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
  - c
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
    - c
```

</td><td>

```buffer
- b┃
  - b1
  - c
- a
```

</td></tr>
</table>

> deleteSubtree

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
```

</td><td>

```buffer
- ┃a
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. one
   1. two┃
2. three
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. one
2. three
   1. two┃
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Scenario23](../spec/scenarios.md#scenario23)

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Plan
  ¶ revi┃2. draft
```

</td><td>

```buffer
¶ # Plan┃2. draft
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [ShiftEnter10](../spec/shift-enter.md#shiftenter10)

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  ┃bc
```

</td><td>

```buffer
- a
  ¶ ┃bc
```

</td></tr>
</table>

> "x"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  x┃bc
```

</td><td>

```buffer
- a
  ¶ x┃bc
```

</td></tr>
</table>

### [ShiftEnter15](../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ p┃
```

</td></tr>
</table>

### [ShiftEnter25](../spec/shift-enter.md#shiftenter25)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
¶ ┃[r]\: /u
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
    - y┃
  - five
- four
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
- ««b»»
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

### [Typing3](../spec/typing.md#typing3)

> "- "

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- a
  - 
```

</td><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

## Whitespace (19)

### [Backspace7](../spec/backspace.md#backspace7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter37](../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
```

</td><td>

```buffer
¶ p
  
- ««a
- b»»
```

</td><td>

```buffer
¶ p
- a
- b┃
```

</td></tr>
</table>

### [Regression81](../spec/regressions.md#regression81)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Earlier
-  ┃Review
- Detail
- Later
```

</td><td>

```buffer
- Earlier
-  
  ┃Review
- Detail
- Later
```

</td><td>

```buffer
- Earlier
- 
  ┃Review
- Detail
- Later
```

</td></tr>
</table>

### [Regression102](../spec/regressions.md#regression102)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-   ┃a
  b
```

</td><td>

```buffer
-   
  ┃a
  b
```

</td><td>

```buffer
- 
  ┃a
  b
```

</td></tr>
</table>

### [Regression140](../spec/regressions.md#regression140)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
 x
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression180](../spec/regressions.md#regression180)

> cut

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
¶    c
```

</td><td>

```buffer
1. b
¶    c
```

</td><td>

```buffer
1. ┃b
¶ c
```

</td></tr>
</table>

### [Scenario3](../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

## Caret (26)

### [Cut4](../spec/copy.md#cut4)

> cut

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
  - kid
- three
```

</td><td>

```buffer
- three
```

</td><td>

```buffer
- ┃three
```

</td></tr>
</table>

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  - ┃a
```

</td><td>

```buffer
¶ ## Tit┃le
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [SelectLeft1](../spec/cursor.md#selectleft1)

> selectCharLeft

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ab┃c
```

</td><td>

```buffer
¶ a«b»c
```

</td><td>

```buffer
¶ a┃«b»c
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t┃
¶ para
```

</td><td>

```buffer
- t
- ««a
- b»»
¶ para
```

</td><td>

```buffer
- t
- a
- b┃
¶ para
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib
  - ««a»»
    - b
      - c
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib
  - ««a»»
    - b
      - c
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««x
- y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««x *b*
- y»»
- b
```

</td><td>

```buffer
- a
- x _b_
- y┃
- b
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ««x
  1. x1
- y»»
```

</td><td>

```buffer
- a
- x
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««x
- y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ab
- ««x
- y»»
- c
```

</td><td>

```buffer
- ab
- x
- y┃
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- ab
- ««x
- y»»
- c
```

</td><td>

```buffer
- ab
- x
- y┃
- c
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  ¶ para
```

</td><td>

```buffer
¶ # T
  ¶ ««x
    y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Notes┃
¶ more
```

</td><td>

```buffer
¶ Notes
- ««x
- y»»
¶ more
```

</td><td>

```buffer
¶ Notes
- x
- y┃
¶ more
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ See ┃here.
```

</td><td>

```buffer
¶ See here.
- ««x
- y»»
```

</td><td>

```buffer
¶ See here.
- x
- y┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # T┃
  - z
```

</td><td>

```buffer
¶ # T
  - ««x
  - y»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ p
  ¶ ««## h»»
    ¶ ««text»»
    ¶ q
  ¶ ## B
    ¶ r
```

</td><td>

```buffer
¶ # A
  ¶ p
  ¶ ## h
    ¶ text┃
    ¶ q
  ¶ ## B
    ¶ r
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
¶ ## B
```

</td><td>

```buffer
¶ ## A
¶ ««## h»»
  ¶ ««text»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## A┃
  ¶ p
```

</td><td>

```buffer
¶ ## A
  ¶ ««### h»»
    ¶ ««text»»
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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ p
  ¶ ««x
¶ # h»»
  ¶ q
  ¶ ## B
```

</td><td>

```buffer
¶ ## A
  ¶ p
  ¶ x
¶ # h┃
  ¶ q
  ¶ ## B
```

</td></tr>
</table>

### [Paste24](../spec/paste.md#paste24)

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

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # h1
  ¶ ┃
```

</td><td>

```buffer
¶ # h1
  - ««a»»
    - b
```

</td><td>

```buffer
¶ # h1
  - a
    - b┃
```

</td></tr>
</table>

### [Scenario20](../spec/scenarios.md#scenario20)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Trip┃
```

</td></tr>
</table>

> enter "Pack light." enter "Book the train."

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Trip
  ¶ Pack light.
  ¶ Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Trip
  ¶ Pack light.
  ¶ Book the train.
    Seat 42.┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ # Trip
  ¶ Book the train.
    Seat 42.┃
  ¶ Pack light.
```

</td></tr>
</table>

> undo

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Trip
  ¶ ┃Pack light.
  ¶ Book the train.
    Seat 42.
```

</td><td>

```buffer
¶ # Trip
  ¶ Pack light.
  ¶ Book the train.
    Seat 42.┃
```

</td></tr>
</table>

### [SubtreeEdit3](../spec/subtree-selection.md#subtreeedit3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  - five
- four
```

</td><td>

```buffer
- one
  - two┃
  - five
- four
```

</td></tr>
</table>

### [SubtreeEdit13](../spec/subtree-selection.md#subtreeedit13)

> shiftEnter

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

## Adapted: disagree (104)

### [Auto3](../spec/auto.md#auto3)

Adapted: code block, empty document

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td></tr>
</table>

> "\`\`\`"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```┃
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ┃Nested TODOs
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```
  ┃
  ```
````

</td></tr>
</table>

> "test"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ test┃Nested TODOs
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```
  test┃
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ test
¶ ┃Nested TODOs
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```
  test
  ┃
  ```
````

</td></tr>
</table>

> "\`\`"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ test
¶ ``┃Nested TODOs
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```
  test
  ``┃
  ```
````

</td></tr>
</table>

> "\`"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ test
¶ ```javascript
  ┃Nested TODOs
  
  ```
¶ ```javascript
  
  ```
````

</td><td>

````buffer
¶ ```
  test
  ```┃
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"```"</th><th>enter</th><th>"test"</th><th>enter</th><th>"``"</th><th>"`"</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
```┃
```
````

</td><td>

````buffer
```
┃
```
````

</td><td>

````buffer
```
test┃
```
````

</td><td>

````buffer
```
test
┃
```
````

</td><td>

````buffer
```
test
``┃
```
````

</td><td>

````buffer
```
test
```┃
````

</td></tr>
</table>

### [Auto4](../spec/auto.md#auto4)

> "\`\`\`"

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
¶ ```javascript
  
  ```
````

</td><td>

````buffer
- ```┃
  ```
````

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

````buffer
- ```┃
  ```
````

</td></tr>
</table>

### [Auto7](../spec/auto.md#auto7)

> "\`\`\`" "\`"

Adapted: code block, empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```javascript
  
  ```
````

</td><td>

`````buffer
¶ ````┃
  ````
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
````
`````

</td></tr>
</table>

### [Auto11](../spec/auto.md#auto11)

> "\`\`\`" deleteContentBackward

Adapted: empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ```javascript
  
  ```
````

</td><td>

```buffer
¶ ``┃
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
``┃
```

</td></tr>
</table>

### [Backspace18c](../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: setext heading, under headingEditing: block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # ┃Title
  ¶ text
```

</td><td>

```buffer
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

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Copy1](../spec/copy.md#copy1)

> copy

Adapted: clipboard's text/markdown, text/html not compared

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one «two **b**»
```

</td><td>

```buffer
- one «two **b**»
```

</td><td>

```buffer
- one «two **b**»
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one «two **b**»
```

</td><td>

```buffer
- one «two **b**»
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Enter32](../spec/enter.md#enter32)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter65g](../spec/enter.md#enter65g)

Adapted: task, under backspaceAtItemStart: unwrap

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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Enter45](../spec/enter.md#enter45)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## one
  two
  ¶ ┃
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

### [Fence1](../spec/fences.md#fence1)

Adapted: code block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    code┃
    ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    code┃
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

</td></tr>
</table>

> "x"

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    codex┃
    ```
````

</td><td>

````buffer
- a
  ¶ ```
    code
    x┃
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"x"</th></tr>
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

</td><td>

````buffer
- a
  ```
  code
  x┃
  ```
````

</td></tr>
</table>

### [Fence2](../spec/fences.md#fence2)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  co┃de
  ```
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
  co
  ┃de
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
co┃de
```
````

</td><td>

````buffer
```
co
┃de
```
````

</td></tr>
</table>

### [Fence48](../spec/fences.md#fence48)

Adapted: code block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- p
  - ┃a
    ¶ ```
      x
      
      y
      ```
````

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- p
- ┃a
  ¶ ```
    x
    
    y
    ```
````

</td></tr>
</table>

> indent

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- p
  - ┃a
  ¶ ```
    x
    
    y
    ```
````

</td><td>

````buffer
- p
  - ┃a
    ¶ ```
      x
      
      y
      ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>outdent</th><th>indent</th></tr>
<tr valign="top"><td>

````buffer
- p
  - ┃a
    ```
    x
    
    y
    ```
````

</td><td>

````buffer
- p
- ┃a
  ```
  x
  
  y
  ```
````

</td><td>

````buffer
- p
  - ┃a
    ```
    x
  
    y
    ```
````

</td></tr>
</table>

### [Gap4](../spec/gaps.md#gap4)

> moveSubtreeUp

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
- b┃
- a
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

- b┃
- c
```

</td><td>

```buffer
- b┃
- a

- c
```

</td></tr>
</table>

### [Gap5](../spec/gaps.md#gap5)

> moveSubtreeUp

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Gap9](../spec/gaps.md#gap9)

> moveSubtreeUp

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - x
  - y┃
- q
```

</td><td>

```buffer
- p
  - x
    - y
- ┃q
```

</td><td>

```buffer
- p
  - y┃
  - x
- q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - x

  - y┃

- q
```

</td><td>

```buffer
- p
  - y┃

  - x

- q
```

</td></tr>
</table>

### [Indent13](../spec/indent.md#indent13)

Adapted: code block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ¶ ```
    x
    
      y
    ```
````

</td></tr>
</table>

> indent

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - b┃
  ¶ ```
    x
    
      y
    ```
````

</td><td>

````buffer
- a
  - b┃
    ¶ ```
      x
      
        y
      ```
````

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ¶ ```
    x
    
      y
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>indent</th><th>outdent</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

</td><td>

````buffer
- a
  - b┃
    ```
    x

      y
    ```
````

</td><td>

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

</td></tr>
</table>

### [Indent16](../spec/indent.md#indent16)

> indent

Adapted: setext heading

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Indent20](../spec/indent.md#indent20)

> indent

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ¶ ```
      x
    ```
````

</td><td>

````buffer
- a
  - b┃
  ¶ ```
      x
    ```
````

</td><td>

````buffer
- a
  - b┃
    ¶ ```
        x
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
- b┃
  ```
    x
  ```
````

</td><td>

````buffer
- a
  - b┃
    ```
      x
    ```
````

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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Lists1](../spec/lists.md#lists1)

> moveSubtreeDown

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Intro┃
- a
- b
¶ Next
```

</td><td>

```buffer
- a
  ¶ Intro┃
- b
¶ Next
```

</td><td>

```buffer
- a
- b
¶ Intro┃
¶ Next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro┃

- a
- b

Next
```

</td><td>

```buffer
- a
- b

Intro┃

Next
```

</td></tr>
</table>

### [Lists5](../spec/lists.md#lists5)

> moveSubtreeDown

Adapted: code block, under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  x┃
  ```
- a
¶ Next
````

</td><td>

````buffer
¶ ```
  x┃
  ```
- a
¶ Next
````

</td><td>

````buffer
- a
¶ ```
  x┃
  ```
¶ Next
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃
```
- a

Next
````

</td><td>

````buffer
- a

```
x┃
```
Next
````

</td></tr>
</table>

### [Lists7](../spec/lists.md#lists7)

> moveSubtreeDown

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

para

- c
```

</td><td>

```buffer
- a
- b┃

para

- c
```

</td></tr>
</table>

### [Lists11](../spec/lists.md#lists11)

> moveSubtreeDown

Adapted: quote, under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > q┃
- a
¶ Next
```

</td><td>

```buffer
- a
  ¶ > q┃
¶ Next
```

</td><td>

```buffer
- a
¶ > q┃
¶ Next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q┃
- a

Next
```

</td><td>

```buffer
- a

> q┃

Next
```

</td></tr>
</table>

### [MoveDown1](../spec/move-subtree-down.md#movedown1)

> moveSubtreeDown

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

```buffer
- b
  - a┃
    - a1
```

</td><td>

```buffer
- b
- a┃
  - a1
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
- b

- a┃
  - a1
```

</td></tr>
</table>

### [MoveDown21](../spec/move-subtree-down.md#movedown21)

> moveSubtreeDown

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
  ¶ ```
    x
    
    y
    ```
- b
````

</td><td>

````buffer
- b
  - a┃
    ¶ ```
      x
      
      y
      ```
````

</td><td>

````buffer
- b
- a┃
  ¶ ```
    x
    
    y
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
  ```
  x

  y
  ```
- b
````

</td><td>

````buffer
- b
- a┃
  ```
  x

  y
  ```
````

</td></tr>
</table>

### [MoveDown24](../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
- a
¶ para┃
¶ last
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

```buffer
- a

para┃

last
```

</td></tr>
</table>

### [MoveDown33](../spec/move-subtree-down.md#movedown33)

Adapted: list as an item's first block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 
  - ┃a
  - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  - ┃b
    - a
```

</td><td>

```buffer
- 
  - b
  - ┃a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃b
  - a
- 
```

</td><td>

```buffer
- 
  - ┃a
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - b
```

</td><td>

```buffer
- - b
  - ┃a
```

</td><td>

```buffer
- - ┃a
  - b
```

</td></tr>
</table>

### [MoveDown39](../spec/move-subtree-down.md#movedown39)

Adapted: under listParent: container

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
¶ para
- b┃
```

</td><td>

```buffer
- a
- b┃
¶ para
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
¶ para
```

</td><td>

```buffer
- b┃
- a
¶ para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃



para
```

</td><td>

```buffer
- a
- b┃



para
```

</td><td>

```buffer
- b┃
- a



para
```

</td></tr>
</table>

### [MoveUp7](../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para

- b┃
- c
```

</td><td>

```buffer
- a

para

- b┃
- c
```

</td></tr>
</table>

### [MoveUp13](../spec/move-subtree-up.md#moveup13)

> moveSubtreeUp

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ¶ ```
    x
    
    y
    ```
````

</td><td>

````buffer
- a
  - b┃
    ¶ ```
      x
      
      y
      ```
````

</td><td>

````buffer
- b┃
  ¶ ```
    x
    
    y
    ```
- a
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
  x

  y
  ```
````

</td><td>

````buffer
- b┃
  ```
  x

  y
  ```
- a
````

</td></tr>
</table>

### [MoveUp21](../spec/move-subtree-up.md#moveup21)

Adapted: under listParent: container

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
¶ para
- b
```

</td><td>

```buffer
¶ para
- a┃
- b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
- a┃
- b
```

</td><td>

```buffer
¶ para
- b
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>moveSubtreeDown</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

```buffer
para
- a┃
- b
```

</td><td>

```buffer
para
- b
- a┃
```

</td></tr>
</table>

### [MoveUp25](../spec/move-subtree-up.md#moveup25)

> moveSubtreeUp

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
```

</td><td>

```buffer
- a
  - b┃
    - b1
```

</td><td>

```buffer
- b┃
  - b1
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

- b┃
  - b1
```

</td><td>

```buffer
- b┃
  - b1

- a
```

</td></tr>
</table>

### [TO-Seams](../spec/obsidian-true-outliner.md#to-seams)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ¶ > q
```

</td><td>

```buffer
- a
  - b┃
  ¶ > q
```

</td><td>

```buffer
- a
  - b┃
    ¶ > q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  > q
```

</td><td>

```buffer
- a
  - b┃
    > q
```

</td></tr>
</table>

### [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc)

> moveSubtreeDown

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
¶ ```
  code┃
  ```
¶ para
````

</td><td>

````buffer
¶ ```
  code┃
  ```
¶ para
````

</td><td>

````buffer
¶ para
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
```
code┃
```
para
````

</td><td>

````buffer
para
```
code┃
```
````

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## H┃
  ¶ below
```

</td><td>

````buffer
¶ ## H
  ¶ ««```
    first
    
    > quote
    ```»»
  ¶ below
````

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

### [Outdent20b](../spec/outdent.md#outdent20b)

> outdent

Adapted: escape

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).
- x **b**
  - y
- z»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««**b**
¶ y
¶ z»»
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
1. ««c
2. d»»
```

</td><td>

```buffer
3. c
4. d┃
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
3. c
4. d┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ««```javascript
  let a = 1;
  let b = 2;
  
  ```»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ««## Setup»»
  ¶ ««```
    npm install
    ```»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««·       one
  o       nested»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

````buffer
¶ ««```javascript
  javascript
  Copy code
  let a = 1;
  
  ```»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ] 
- ««x
- y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
¶ ««```
  c
  ```»»
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

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ««x
¶ ```
  c
  ```»»
- b
````

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a
  - kid
¶ ««```
  c
  ```»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- 
¶ ««```
  c
  ```»»
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

Adapted: heading

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
¶ ««# h»»
  ¶ ««text»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««`code`»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««`code`»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
¶ ««x
- y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
¶ <equation> x^2
¶ ««»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃words
```

</td><td>

```buffer
¶ words
- ««a
- b»»
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

Adapted: escape

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
- 2\. y
1. ««a
2. b»»
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
  2. b
  ┃\. y
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- abc
  def
¶ ««x
- y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a«bc
  de»f
```

</td><td>

```buffer
¶ > abc
  def
¶ ««x
¶ # y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title┃more
```

</td><td>

```buffer
¶ ## Titlemore
  ¶ ««x
    y»»
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

### [Quote94](../spec/quotes.md#quote94)

> deleteContentBackward

Adapted: quote, task

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [QuoteText7](../spec/quotes.md#quotetext7)

> enter

Adapted: quote

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ab┃cd
```

</td><td>

```buffer
¶ > ab
¶ ┃cd
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > See ┃here.
```

</td><td>

```buffer
¶ > See here.
¶ ««x
¶ y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

Adapted: bullet *, under backspaceAtItemStart: unwrap

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression14](../spec/regressions.md#regression14)

> outdent

Adapted: under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ## Title
  ┃more
```

</td><td>

```buffer
¶ ## Title
  more
  ¶ ««x»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > a┃b
  c
```

</td><td>

````buffer
¶ > ab
  c
- ««x»»
  ¶ ```
    c
    ```
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
       cont
   ¶ ««x
   ¶ # y»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ \┃
```

</td><td>

```buffer
¶ \
- ««a
- b»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ *ab* *foo!*bar┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ [x](https://jordanscales.notion.site/u) [y](https://example.com/a%3Eb)┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ 
  • Keep ~~draft~~ and %%this%% literal┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ **Issue #**┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««*ab*»»
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

### [Regression153](../spec/regressions.md#regression153)

> indent

Adapted: escape

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ -┃-
```

</td><td>

```buffer
¶ -┃-
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

### [Regression156](../spec/regressions.md#regression156)

> shiftEnter

Adapted: CR line endings

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ a
  ┃c
¶ c
```

</td><td>

```buffer
¶ a
  
  ┃c
¶ c
```

</td><td>

```buffer
¶ a
¶ ┃c
¶ c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a␍┃c

c
```

</td><td>

```buffer
a␍␍┃c

c
```

</td></tr>
</table>

### [Regression162](../spec/regressions.md#regression162)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > ┃a
  b
```

</td><td>

```buffer
¶ > ┃a
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

### [Regression174](../spec/regressions.md#regression174)

> moveSubtreeUp

Adapted: bullet +, list as an item's first block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Regression175](../spec/regressions.md#regression175)

> moveSubtreeUp

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. 
   - ┃b
```

</td><td>

```buffer
1. a
- ┃b
1. 
```

</td><td>

```buffer
1. 
   - ┃b
2. a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. - ┃b
```

</td><td>

```buffer
1. - ┃b
2. a
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under backspaceAtItemStart: unwrap, under enterAtTextStart: stay, under enterSplitSpace: start

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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶  ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk
  ¶ and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ ┃  and eggs
- call Ann
```

</td><td>

```buffer
- buy milk
  ¶ ┃and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>notion</th><th>ourus</th></tr>
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
  ¶ today:┃and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>notion</th><th>ourus</th></tr>
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
  ¶ today:and eggs
- call An┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
¶ 
¶ today:  and eggs┃call A
```

</td><td>

```buffer
- buy milk
  ¶ today:and eggs┃call An
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

  ┃and eggs
- call Ann
```

</td><td>

```buffer
- buy milk


  today:┃and eggs
- call Ann
```

</td><td>

```buffer
- buy milk


  today:and eggs
- call An┃
```

</td><td>

```buffer
- buy milk


  today:and eggs┃call An
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- example
¶ ««```
  code
  ```»»
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

### [ShiftEnter14](../spec/shift-enter.md#shiftenter14)

> shiftEnter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ ┃ more
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
# Title
┃ more
```

</td></tr>
</table>

### [ShiftEnter16](../spec/shift-enter.md#shiftenter16)

> shiftEnter shiftEnter "p"

Adapted: CR line endings

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ p┃
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

Adapted: task, under backspaceAtItemStart: unwrap

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
<tr><th>notion</th><th>ourus</th></tr>
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

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ para
  ┃
```

</td><td>

```buffer
¶ para
  —-┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

## Adapted: whitespace (16)

### [Backspace44](../spec/backspace.md#backspace44)

> deleteContentBackward

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

### [Fence8](../spec/fences.md#fence8)

> shiftEnter

Adapted: code block

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ¶ ```
    code┃
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

### [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8)

> shiftEnter

Adapted: setext heading

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««1\. not a list, *x* and [y]
- \# not a heading»»
```

</td><td>

```buffer
- 1\. not a list, \*x\* and \[y\]
- \# not a heading┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- > q
  ┃
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b1
```

</td><td>

```buffer
- a
- > q
  ┃
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
<tr><th>notion</th><th>ourus</th></tr>
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

### [Regression56](../spec/regressions.md#regression56)

> enter

Adapted: quote, task

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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
  ¶ 
  ¶ > ┃q
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

### [Regression136](../spec/regressions.md#regression136)

> deleteSoftLineBackward

Adapted: setext heading

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Ti
  tle┃
```

</td><td>

```buffer
¶ # Ti
  ┃
```

</td><td>

```buffer
¶ # Ti┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Ti
tle┃
===
```

</td><td>

```buffer
Ti┃
===
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  
  ┃``` x
````

</td><td>

````buffer
- 
  ┃ ``` x
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
  ┃ \``` x
````

</td></tr>
</table>

## Adapted: caret (17)

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: task

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««x
  - y
- z»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««x
  - y
- z»»
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««x
  - y
- z»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««x
- y
¶ z»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««[x] done
- [ ] todo»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««## Title»»
  ¶ ««para **bold** `c`»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
¶ ««line one
  line two
¶ p2»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««a **b** *i* `c` ~~s~~ [l](https://e.x/p)
- z»»
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ ┃
```

</td><td>

```buffer
- ««**Bold** start»»
  - *nested*
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

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ««x
- y»»
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
- a┃

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

Adapted: blank lines, under listParent: container

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ Notes┃
- z
```

</td><td>

```buffer
¶ Notes
- ««x
- y»»
- z
```

</td><td>

```buffer
¶ Notes
- x
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
Notes
- x
- y┃

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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ p┃
¶ q
```

</td><td>

````buffer
¶ p
¶ ««```
  c
  ```»»
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

Adapted: blank lines

<table>
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ¶ p┃
- b
```

</td><td>

```buffer
- a
  ¶ p
  - ««x
  - y»»
- b
```

</td><td>

```buffer
- a
  ¶ p
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
- a

  p┃

- b
```

</td><td>

```buffer
- a

  p

  - x
  - y┃

- b
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
<tr><th>buffer</th><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ > p┃
¶ after
```

</td><td>

```buffer
¶ > p
- ««x
- y»»
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
<tr><th>notion</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
¶ # Work
  - email
¶ # ┃Home
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

## Skipped (791)

| example | why |
| --- | --- |
| **auto.md** | |
| [Auto2](../spec/auto.md#auto2) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [Auto6](../spec/auto.md#auto6) | caret on a code block's fence |
| [Auto8](../spec/auto.md#auto8) | option autoClose: ``` ~~~ ` |
| [Auto9](../spec/auto.md#auto9) | option autoClose: ``` ~~~ ` |
| [Auto10](../spec/auto.md#auto10) | option autoClose: ``` ~~~ ` |
| [Auto12](../spec/auto.md#auto12) | option autoClose: ``` ~~~ ( [ { |
| [Auto13](../spec/auto.md#auto13) | option autoClose: ``` ~~~ ( [ { |
| [Auto14](../spec/auto.md#auto14) | option autoClose: ``` ~~~ ( [ { |
| [Auto15](../spec/auto.md#auto15) | option autoClose: ``` ~~~ ( [ { |
| [Auto16](../spec/auto.md#auto16) | option autoClose: ``` ~~~ ( [ { |
| [Auto17](../spec/auto.md#auto17) | option autoClose: ``` ~~~ ( [ { |
| [Auto18](../spec/auto.md#auto18) | option autoClose: ``` ~~~ ( [ { |
| [Auto19](../spec/auto.md#auto19) | option autoClose: ``` ~~~ ( [ { |
| [Auto20](../spec/auto.md#auto20) | option autoClose: ``` ~~~ ( [ { |
| [Auto20b](../spec/auto.md#auto20b) | option autoClose: ``` ~~~ ( [ { |
| [Auto21](../spec/auto.md#auto21) | option autoClose: ``` ~~~ [[ (( |
| [Auto26](../spec/auto.md#auto26) | option autoClose: ``` ~~~ ( [ { |
| [Auto27](../spec/auto.md#auto27) | action cursorDocStart |
| [Auto29](../spec/auto.md#auto29) | math (expected) |
| [Auto32](../spec/auto.md#auto32) | comment (expected) |
| [Auto33](../spec/auto.md#auto33) | html (expected) |
| [Auto36](../spec/auto.md#auto36) | option autoClose: ``` ~~~ $ |
| [Auto37](../spec/auto.md#auto37) | option autoClose: ``` ~~~ $ |
| [Auto38](../spec/auto.md#auto38) | option autoClose: ``` ~~~ $ |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12c](../spec/backspace.md#backspace12c) | changes only what blocks can't show |
| [Backspace12e](../spec/backspace.md#backspace12e) | the app changing what ourus's blocks show no change in, at enter |
| [Backspace14](../spec/backspace.md#backspace14) | action cursorDocStart |
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
| [SoftBackspace11b](../spec/backspace.md#softbackspace11b) | option heldSpace: trim |
| [Backspace42](../spec/backspace.md#backspace42) | caret in a marker |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43](../spec/backspace.md#backspace43) | changes only what blocks can't show |
| [Backspace43c](../spec/backspace.md#backspace43c) | changes only what blocks can't show |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| [Backspace45c](../spec/backspace.md#backspace45c) | option joinWithChildren: refuse |
| [Backspace46](../spec/backspace.md#backspace46) | character outside the BMP, which the DOM selection splits |
| [Backspace47b](../spec/backspace.md#backspace47b) | option heldSpace: trim |
| [Backspace50](../spec/backspace.md#backspace50) | option backspaceAtItemStart: body |
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
| [Backtick19](../spec/backtick.md#backtick19) | option autoClose: ``` ~~~ ` |
| [Backtick20](../spec/backtick.md#backtick20) | option autoClose: ``` ~~~ ` |
| [Backtick21](../spec/backtick.md#backtick21) | option autoClose: ``` ~~~ ` |
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
| [Backtick32](../spec/backtick.md#backtick32) | option autoClose: ``` ~~~ ` |
| **block-ids.md** | |
| [BlockIds1](../spec/block-ids.md#blockids1) | table |
| [BlockIds3](../spec/block-ids.md#blockids3) | block id (`^x`), which the app has none of: its text |
| [BlockIds4](../spec/block-ids.md#blockids4) | block id (`^x`), which the app has none of: its text |
| [BlockIds5](../spec/block-ids.md#blockids5) | block id (`^x`), which the app has none of: its text |
| [BlockIds6](../spec/block-ids.md#blockids6) | block id (`^x`), which the app has none of: its text |
| [BlockIds7](../spec/block-ids.md#blockids7) | block id (`^x`), which the app has none of: its text |
| [BlockIds8](../spec/block-ids.md#blockids8) | block id (`^x`), which the app has none of: its text |
| [BlockIds9](../spec/block-ids.md#blockids9) | block id (`^x`), which the app has none of: its text |
| [BlockIds10](../spec/block-ids.md#blockids10) | block id (`^x`), which the app has none of: its text |
| [BlockIds11](../spec/block-ids.md#blockids11) | block id (`^x`), which the app has none of: its text |
| [BlockIds12](../spec/block-ids.md#blockids12) | block id (`^x`), which the app has none of: its text |
| [BlockIds13](../spec/block-ids.md#blockids13) | block id (`^x`), which the app has none of: its text |
| [BlockIds14](../spec/block-ids.md#blockids14) | block id (`^x`), which the app has none of: its text |
| [BlockIds15](../spec/block-ids.md#blockids15) | block id (`^x`), which the app has none of: its text |
| [BlockIds16](../spec/block-ids.md#blockids16) | block id (`^x`), which the app has none of: its text |
| [BlockIds17](../spec/block-ids.md#blockids17) | selection across blocks |
| [BlockIds18](../spec/block-ids.md#blockids18) | block id (`^x`), which the app has none of: its text |
| [BlockIds19](../spec/block-ids.md#blockids19) | caret on a blank line |
| [BlockIds20](../spec/block-ids.md#blockids20) | action duplicateSubtree |
| [BlockIds21](../spec/block-ids.md#blockids21) | block id (`^x`), which the app has none of: its text |
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
| [CursorDocStart1](../spec/cursor.md#cursordocstart1) | action cursorDocStart |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | caret on a code block's fence |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | quote as a list item (a quote is a block of its own) |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree14](../spec/delete-subtree.md#deletesubtree14) | caret on a code block's fence |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete5f](../spec/delete.md#delete5f) | option emptyItemWithChildren: refuse |
| [Delete9](../spec/delete.md#delete9) | action cursorDocStart |
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
| **drag.md** | |
| [Drag1](../spec/drag.md#drag1) | action drag ② |
| [Drag2](../spec/drag.md#drag2) | action drag ② |
| [Drag3](../spec/drag.md#drag3) | action drag ④ |
| [Drag4](../spec/drag.md#drag4) | action drag ② |
| [Drag5](../spec/drag.md#drag5) | action drag ② |
| [Drag6](../spec/drag.md#drag6) | action drag ③ |
| [Drag7](../spec/drag.md#drag7) | no folds |
| [Drag8](../spec/drag.md#drag8) | no zoom |
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
| [DuplicateSubtree11](../spec/duplicate-subtree.md#duplicatesubtree11) | action duplicateSubtree |
| [DuplicateSubtree12](../spec/duplicate-subtree.md#duplicatesubtree12) | action duplicateSubtree |
| [DuplicateSubtree13](../spec/duplicate-subtree.md#duplicatesubtree13) | action duplicateSubtree |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter7b](../spec/enter.md#enter7b) | option enterOnEmptyItem: outdent |
| [Enter15b](../spec/enter.md#enter15b) | option enterOnEmptyItem: outdent |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter33](../spec/enter.md#enter33) | the app changing what ourus's blocks show no change in, at enter |
| [Enter33b](../spec/enter.md#enter33b) | changes only what blocks can't show |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | table |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox |
| [Enter55](../spec/enter.md#enter55) | caret in a block's marker |
| [Enter55b](../spec/enter.md#enter55b) | caret in a block's marker |
| [Enter55c](../spec/enter.md#enter55c) | caret in a block's marker |
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
| **fold.md** | |
| [Fold1](../spec/fold.md#fold1) | no folds |
| [Fold2](../spec/fold.md#fold2) | no folds |
| [Fold2b](../spec/fold.md#fold2b) | no folds |
| [Fold3](../spec/fold.md#fold3) | no folds |
| [Fold4](../spec/fold.md#fold4) | no folds |
| [Fold5](../spec/fold.md#fold5) | no folds |
| [Fold6](../spec/fold.md#fold6) | no folds |
| [Fold7](../spec/fold.md#fold7) | no folds |
| [Fold8](../spec/fold.md#fold8) | no folds |
| [Fold9](../spec/fold.md#fold9) | no folds |
| [Fold10](../spec/fold.md#fold10) | no folds |
| [Fold11](../spec/fold.md#fold11) | no folds |
| [Fold12](../spec/fold.md#fold12) | no folds |
| [Fold13](../spec/fold.md#fold13) | no folds |
| [Fold14](../spec/fold.md#fold14) | no folds |
| [Fold15](../spec/fold.md#fold15) | no folds |
| [Fold15b](../spec/fold.md#fold15b) | no folds |
| [Fold16](../spec/fold.md#fold16) | no folds |
| [Fold17](../spec/fold.md#fold17) | no folds |
| [Fold18](../spec/fold.md#fold18) | no folds |
| [Fold19](../spec/fold.md#fold19) | no folds |
| [Fold20](../spec/fold.md#fold20) | no folds |
| **gaps.md** | |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent24](../spec/indent.md#indent24) | heading of level 4 to 6 (Notion has three) |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent34](../spec/indent.md#indent34) | code block with a language (Notion names its own) |
| [Indent35](../spec/indent.md#indent35) | math |
| [Indent36](../spec/indent.md#indent36) | table |
| [Indent37](../spec/indent.md#indent37) | thematic break |
| [Indent37b](../spec/indent.md#indent37b) | thematic break |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| [Indent47](../spec/indent.md#indent47) | option mixedDepths: each |
| [Indent48](../spec/indent.md#indent48) | option mixedDepths: each |
| [Indent50](../spec/indent.md#indent50) | option mixedDepths: refuse |
| **lists.md** | |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| [Lists13](../spec/lists.md#lists13) | option listMoves: item |
| [Lists14](../spec/lists.md#lists14) | option listMoves: item |
| [Lists15](../spec/lists.md#lists15) | option listMoves: item |
| **move-subtree-down.md** | |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | caret on a blank line |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | numbered list right after another (Notion numbers them as one) |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | caret in a marker |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | caret in a marker |
| **move-subtree-up.md** | |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | link reference definition |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | option quotes: container |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret in a marker |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | quote as a list item (a quote is a block of its own) |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| **move-subtree.md** | |
| [MoveSubtree1](../spec/move-subtree.md#movesubtree1) | action moveSubtree ③ |
| [MoveSubtree2](../spec/move-subtree.md#movesubtree2) | action moveSubtree ③ |
| [MoveSubtree3](../spec/move-subtree.md#movesubtree3) | action moveSubtree ① |
| [MoveSubtree4](../spec/move-subtree.md#movesubtree4) | action moveSubtree ② |
| [MoveSubtree5](../spec/move-subtree.md#movesubtree5) | action moveSubtree ③ |
| [MoveSubtree6](../spec/move-subtree.md#movesubtree6) | action moveSubtree ③ |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | action moveSubtree ② |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | action moveSubtree ② |
| [MoveSubtree9](../spec/move-subtree.md#movesubtree9) | action moveSubtree ② |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | action moveSubtree ② |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | action moveSubtree ② |
| [MoveSubtree12](../spec/move-subtree.md#movesubtree12) | action moveSubtree ② |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | action moveSubtree ② |
| [MoveSubtree14](../spec/move-subtree.md#movesubtree14) | action moveSubtree ② |
| [MoveSubtree15](../spec/move-subtree.md#movesubtree15) | action moveSubtree ② |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | action moveSubtree ② |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | action moveSubtree ③ |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | action moveSubtree ② |
| [MoveSubtree19](../spec/move-subtree.md#movesubtree19) | action moveSubtree |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | action moveSubtree ② |
| [MoveSubtree21](../spec/move-subtree.md#movesubtree21) | action moveSubtree ① |
| [MoveSubtree22](../spec/move-subtree.md#movesubtree22) | action moveSubtree ② |
| [MoveSubtree23](../spec/move-subtree.md#movesubtree23) | action moveSubtree ② |
| [MoveSubtree24](../spec/move-subtree.md#movesubtree24) | action moveSubtree ① |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | numbered list right after another (Notion numbers them as one) |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | caret in a marker |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | caret on a blank line |
| [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b) | action cursorDocStart |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | thematic break |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO7](../spec/obsidian-true-outliner.md#to7) | option outdent: logical |
| [TO8](../spec/obsidian-true-outliner.md#to8) | action cursorDocStart |
| [TO9](../spec/obsidian-true-outliner.md#to9) | action cursorDocStart |
| [TO14](../spec/obsidian-true-outliner.md#to14) | action cursorDocStart |
| [TO15](../spec/obsidian-true-outliner.md#to15) | action cursorDocStart |
| [TO16](../spec/obsidian-true-outliner.md#to16) | action cursorDocStart |
| [TO17](../spec/obsidian-true-outliner.md#to17) | action cursorDocStart |
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
| [Outdent17](../spec/outdent.md#outdent17) | heading as a list item (a heading is a block of its own) |
| [Outdent17b](../spec/outdent.md#outdent17b) | option outdent: logical |
| [Outdent18](../spec/outdent.md#outdent18) | heading as a list item (a heading is a block of its own) |
| [Outdent19](../spec/outdent.md#outdent19) | tag markup-fence |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag markup-fence |
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| [Outdent23](../spec/outdent.md#outdent23) | option mixedDepths: each |
| [Outdent24](../spec/outdent.md#outdent24) | option outdent: logical |
| [Outdent26](../spec/outdent.md#outdent26) | option mixedDepths: refuse |
| **paste-at.md** | |
| [PasteAt1](../spec/paste-at.md#pasteat1) | action pasteAt |
| [PasteAt2](../spec/paste-at.md#pasteat2) | action pasteAt |
| [PasteAt3](../spec/paste-at.md#pasteat3) | action pasteAt |
| [PasteAt4](../spec/paste-at.md#pasteat4) | action pasteAt |
| [PasteAt5](../spec/paste-at.md#pasteat5) | action deleteByDrag |
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
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | option quotes: container |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | callout |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain30](../spec/paste-plain.md#pasteplain30) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
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
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder1](../spec/placeholders.md#placeholder1) | action cursorDocStart |
| [Placeholder2](../spec/placeholders.md#placeholder2) | action cursorDocStart |
| [Placeholder3](../spec/placeholders.md#placeholder3) | action cursorDocStart |
| [Placeholder4](../spec/placeholders.md#placeholder4) | action cursorDocStart |
| [Placeholder5](../spec/placeholders.md#placeholder5) | action cursorDocStart |
| [Placeholder6](../spec/placeholders.md#placeholder6) | action cursorDocStart |
| [Placeholder7](../spec/placeholders.md#placeholder7) | action cursorDocStart |
| [Placeholder9b](../spec/placeholders.md#placeholder9b) | option heldSpace: trim |
| [Placeholder17b](../spec/placeholders.md#placeholder17b) | option heldSpace: trim |
| [Placeholder10](../spec/placeholders.md#placeholder10) | action cursorDocStart |
| [Placeholder12](../spec/placeholders.md#placeholder12) | action cursorDocStart |
| [Placeholder16](../spec/placeholders.md#placeholder16) | action selectDocStart |
| [Placeholder18b](../spec/placeholders.md#placeholder18b) | option heldSpace: trim |
| [Placeholder20](../spec/placeholders.md#placeholder20) | action cursorDocStart |
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
| [Regression5](../spec/regressions.md#regression5) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | heading as a list item (a heading is a block of its own) |
| [Regression19](../spec/regressions.md#regression19) | heading as a list item (a heading is a block of its own) |
| [Regression20](../spec/regressions.md#regression20) | option joinWithChildren: refuse |
| [Regression21](../spec/regressions.md#regression21) | option pasteLines: items |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| [Regression23](../spec/regressions.md#regression23) | tag markup-fence |
| [Regression24](../spec/regressions.md#regression24) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [Regression24c](../spec/regressions.md#regression24c) | cursorCharRight over an escape ourus wrote, which a block's text hasn't |
| [Regression24d](../spec/regressions.md#regression24d) | action duplicateSubtree |
| [Regression25](../spec/regressions.md#regression25) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [Regression26](../spec/regressions.md#regression26) | markup Notion has no runs for (an escape, HTML, a hard break) |
| [Regression27](../spec/regressions.md#regression27) | markup Notion has no runs for (an escape, HTML, a hard break) |
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
| [Regression46](../spec/regressions.md#regression46) | caret in a task's checkbox |
| [Regression47](../spec/regressions.md#regression47) | heading as a list item (a heading is a block of its own) |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | action duplicateSubtree |
| [Regression52](../spec/regressions.md#regression52) | action duplicateSubtree |
| [Regression53](../spec/regressions.md#regression53) | heading as a list item (a heading is a block of its own) |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression57](../spec/regressions.md#regression57) | changes only what blocks can't show |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| [Regression67](../spec/regressions.md#regression67) | no folds |
| [Regression68](../spec/regressions.md#regression68) | no folds |
| [Regression69](../spec/regressions.md#regression69) | no folds |
| [Regression70](../spec/regressions.md#regression70) | caret on a blank line |
| [Regression71](../spec/regressions.md#regression71) | action duplicateSubtree |
| [Regression78](../spec/regressions.md#regression78) | option quotes: atom |
| [Regression79](../spec/regressions.md#regression79) | action duplicateSubtree |
| [Regression80](../spec/regressions.md#regression80) | action pasteAt |
| [Regression84](../spec/regressions.md#regression84) | quote |
| [Regression90](../spec/regressions.md#regression90) | option autoClose: ``` ~~~ ` |
| [Regression91](../spec/regressions.md#regression91) | option pastePlainLines: enter |
| [Regression92](../spec/regressions.md#regression92) | caret in a marker |
| [Regression93](../spec/regressions.md#regression93) | action duplicateSubtree |
| [Regression94](../spec/regressions.md#regression94) | no zoom |
| [Regression97](../spec/regressions.md#regression97) | no zoom |
| [Regression100](../spec/regressions.md#regression100) | caret on a blank line |
| [Regression101](../spec/regressions.md#regression101) | quote |
| [Regression103](../spec/regressions.md#regression103) | code block as a list item (a code block is a block of its own) |
| [Regression104](../spec/regressions.md#regression104) | character outside the BMP, which the DOM selection splits |
| [Regression105](../spec/regressions.md#regression105) | option pasteSeams: open |
| [Regression106](../spec/regressions.md#regression106) | caret on a blank line |
| [Regression107](../spec/regressions.md#regression107) | code block as a list item (a code block is a block of its own) |
| [Regression108](../spec/regressions.md#regression108) | quote |
| [Regression109](../spec/regressions.md#regression109) | action duplicateSubtree |
| [Regression110](../spec/regressions.md#regression110) | link reference definition |
| [Regression111](../spec/regressions.md#regression111) | quote |
| [Regression112](../spec/regressions.md#regression112) | quote |
| [Regression114](../spec/regressions.md#regression114) | option pastePlainLines: enter |
| [Regression117](../spec/regressions.md#regression117) | quote |
| [Regression119](../spec/regressions.md#regression119) | quote |
| [Regression123](../spec/regressions.md#regression123) | option markup: decorated |
| [Regression124](../spec/regressions.md#regression124) | no folds |
| [Regression126](../spec/regressions.md#regression126) | caret on a code block's fence |
| [Regression127](../spec/regressions.md#regression127) | quote |
| [Regression128](../spec/regressions.md#regression128) | action pasteAt |
| [Regression129](../spec/regressions.md#regression129) | action cursorDocStart |
| [Regression130](../spec/regressions.md#regression130) | selection across blocks |
| [Regression131](../spec/regressions.md#regression131) | action selectNodeDown |
| [Regression132](../spec/regressions.md#regression132) | action deleteByDrag |
| [Regression133](../spec/regressions.md#regression133) | option autoClose: ``` ~~~ ` |
| [Regression134](../spec/regressions.md#regression134) | option autoClose: ``` ~~~ ` |
| [Regression137](../spec/regressions.md#regression137) | heading's closing #s |
| [Regression142](../spec/regressions.md#regression142) | nothing to compare |
| [Regression147](../spec/regressions.md#regression147) | code block with no line (Notion's has one) |
| [Regression150](../spec/regressions.md#regression150) | math |
| [Regression151](../spec/regressions.md#regression151) | code block as a list item (a code block is a block of its own) |
| [Regression152](../spec/regressions.md#regression152) | option markup: decorated |
| [Regression154](../spec/regressions.md#regression154) | indented code |
| [Regression158](../spec/regressions.md#regression158) | quote |
| [Regression159](../spec/regressions.md#regression159) | caret in a marker |
| [Regression160](../spec/regressions.md#regression160) | option pastePlainLines: enter |
| [Regression161](../spec/regressions.md#regression161) | callout |
| [Regression163](../spec/regressions.md#regression163) | action duplicateSubtree |
| [Regression164](../spec/regressions.md#regression164) | code block with no line (Notion's has one) |
| [Regression165](../spec/regressions.md#regression165) | caret in a marker |
| [Regression166](../spec/regressions.md#regression166) | option quotes: container |
| [Regression167](../spec/regressions.md#regression167) | action duplicateSubtree |
| [Regression168](../spec/regressions.md#regression168) | heading as a list item (a heading is a block of its own) |
| [Regression169](../spec/regressions.md#regression169) | link reference definition |
| [Regression171](../spec/regressions.md#regression171) | quote |
| [Regression172](../spec/regressions.md#regression172) | quote |
| [Regression173](../spec/regressions.md#regression173) | quote |
| [Regression176](../spec/regressions.md#regression176) | quote |
| [Regression178](../spec/regressions.md#regression178) | option autoClose: ``` ~~~ ` |
| [Regression179](../spec/regressions.md#regression179) | action moveSubtree ① |
| [Regression182](../spec/regressions.md#regression182) | link reference definition |
| [Regression183](../spec/regressions.md#regression183) | quote |
| [Regression184](../spec/regressions.md#regression184) | quote |
| [Regression185](../spec/regressions.md#regression185) | quote as a list item (a quote is a block of its own) |
| [Regression186](../spec/regressions.md#regression186) | quote |
| [Regression187](../spec/regressions.md#regression187) | quote |
| [Regression188](../spec/regressions.md#regression188) | quote |
| [Regression190](../spec/regressions.md#regression190) | action duplicateSubtree |
| [Regression191](../spec/regressions.md#regression191) | quote |
| [Regression192](../spec/regressions.md#regression192) | action duplicateSubtree |
| [Regression193](../spec/regressions.md#regression193) | caret on a blank line |
| [Regression194](../spec/regressions.md#regression194) | action fold |
| [Regression195](../spec/regressions.md#regression195) | action duplicateSubtree |
| [Regression196](../spec/regressions.md#regression196) | quote |
| [Regression198](../spec/regressions.md#regression198) | quote |
| [Regression199](../spec/regressions.md#regression199) | quote |
| **scenarios.md** | |
| [Scenario4](../spec/scenarios.md#scenario4) | action cursorDocStart |
| [Scenario5](../spec/scenarios.md#scenario5) | action cursorDocStart |
| [Scenario8b](../spec/scenarios.md#scenario8b) | action moveSubtree ③ |
| [Scenario8c](../spec/scenarios.md#scenario8c) | action moveSubtree ② |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario9](../spec/scenarios.md#scenario9) | action cursorDocStart |
| [Scenario12](../spec/scenarios.md#scenario12) | action cursorDocStart |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| [Scenario21](../spec/scenarios.md#scenario21) | action cursorDocStart |
| **select.md** | |
| [Select1](../spec/select.md#select1) | action selectNode |
| [Select2](../spec/select.md#select2) | action expandSelection |
| [Select3](../spec/select.md#select3) | action expandSelection |
| [Select4](../spec/select.md#select4) | action expandSelection |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select6](../spec/select.md#select6) | action expandSelection |
| [Select7](../spec/select.md#select7) | action expandSelection |
| [Select8](../spec/select.md#select8) | action expandSelection |
| [Select9](../spec/select.md#select9) | action expandSelection |
| [Select10](../spec/select.md#select10) | no zoom |
| [Select11](../spec/select.md#select11) | action selectNodeDown |
| [Select12](../spec/select.md#select12) | action selectNodeUp |
| [Select13](../spec/select.md#select13) | action selectNodeUp |
| [Select14](../spec/select.md#select14) | action selectNodeUp |
| [Select15](../spec/select.md#select15) | action selectNodeDown |
| [Select16](../spec/select.md#select16) | action selectNodeUp |
| [Select17](../spec/select.md#select17) | action selectNodeDown |
| [Select18](../spec/select.md#select18) | action selectNodeDown |
| [Select19](../spec/select.md#select19) | no folds |
| [Select20](../spec/select.md#select20) | action expandSelection |
| [Select21](../spec/select.md#select21) | action expandSelection |
| [Select22](../spec/select.md#select22) | option selectionLadder: top |
| [Select23](../spec/select.md#select23) | option selectNodeUp: sibling |
| **shift-enter.md** | |
| [ShiftEnter30b](../spec/shift-enter.md#shiftenter30b) | option heldSpace: trim |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret in a marker |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | table |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret in a task's checkbox |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter32b](../spec/shift-enter.md#shiftenter32b) | option heldSpace: trim |
| **subtree-selection.md** | |
| [SubtreeEdit10](../spec/subtree-selection.md#subtreeedit10) | thematic break |
| [SubtreeEdit15](../spec/subtree-selection.md#subtreeedit15) | caret in a marker |
| [SubtreeEdit16](../spec/subtree-selection.md#subtreeedit16) | no text focus after deleteContentForward |
| [SubtreeEdit17](../spec/subtree-selection.md#subtreeedit17) | option pasteOverNodes: after |
| [SubtreeEdit18](../spec/subtree-selection.md#subtreeedit18) | option pasteOverNodes: nothing |
| [SubtreeEdit19](../spec/subtree-selection.md#subtreeedit19) | option pasteOverNodes: nothing |
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
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | caret on a blank line |
| [Undo3](../spec/undo.md#undo3) | action cursorDocStart |
| **zoom.md** | |
| [Zoom1](../spec/zoom.md#zoom1) | no zoom |
| [Zoom2](../spec/zoom.md#zoom2) | no zoom |
| [Zoom3](../spec/zoom.md#zoom3) | no zoom |
| [Zoom4](../spec/zoom.md#zoom4) | no zoom |
| [Zoom5](../spec/zoom.md#zoom5) | no folds |
| [Zoom6](../spec/zoom.md#zoom6) | no zoom |
| [Zoom7](../spec/zoom.md#zoom7) | no zoom |
| [Zoom8](../spec/zoom.md#zoom8) | no zoom |
| [Zoom9](../spec/zoom.md#zoom9) | no zoom |
| [Zoom10](../spec/zoom.md#zoom10) | no zoom |
| [Zoom11](../spec/zoom.md#zoom11) | no zoom |
| [Zoom12](../spec/zoom.md#zoom12) | no zoom |
| [Zoom13](../spec/zoom.md#zoom13) | no zoom |
| [Zoom14](../spec/zoom.md#zoom14) | no zoom |
